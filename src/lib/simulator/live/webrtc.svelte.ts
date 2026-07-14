import type { SimulationStep, ProtocolLayer } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createDTLSLayer } from '../layers/dtls';
import { createSCTPLayer } from '../layers/sctp';
import { encodeSignal, decodeSignal, sdpValue, parseCandidates, shorten } from './webrtc-codec';

/**
 * Live WebRTC DataChannel chat — a REAL peer-to-peer connection between two
 * browsers, with no server. The manual copy‑paste (or QR) of the offer/answer
 * codes IS the signaling channel. Every real event — offer created, reply
 * applied, direct connection established, each message sent/received — is
 * appended to the simulator timeline as a live step, so the existing packet
 * inspector shows the actual exchange.
 *
 * We use "vanilla ICE": we wait for candidate gathering to finish so the whole
 * SDP (with all candidates) travels in one code, which is far easier to move
 * between devices by hand than trickled candidates.
 */

export type WebRTCPhase =
	| 'idle' // choosing a role
	| 'inviting' // initiator: creating offer + gathering ICE
	| 'invite-ready' // initiator: show invite code, wait for the reply
	| 'join-paste' // joiner: paste the invite code
	| 'joining' // joiner: creating answer + gathering ICE
	| 'answer-ready' // joiner: show reply code, wait for connection
	| 'connecting' // remote description applied, ICE/DTLS in progress
	| 'connected' // data channel open — chat live
	| 'failed'
	| 'closed';

export interface ChatMessage {
	id: string;
	dir: 'out' | 'in';
	text: string;
}

export interface WebRTCSessionContext {
	/** Push a captured step to the timeline (marked live automatically). */
	append: (step: Omit<SimulationStep, 'source'>) => void;
	/** Wipe the timeline when a fresh connection begins. */
	clear: () => void;
}

const SDP_COLOR = '#818CF8';

/** One end of the direct path, resolved from getStats() after connecting. */
interface SelectedPair {
	localAddr: string;
	localPort: number;
	localType: string;
	remoteAddr: string;
	remotePort: number;
	remoteType: string;
	lan: boolean;
}

export class WebRTCSession {
	phase = $state<WebRTCPhase>('idle');
	role = $state<'initiator' | 'joiner' | null>(null);
	/** The code the local user must hand to the other device. */
	localCode = $state('');
	/** Friendly error for a bad pasted code / connection failure. */
	error = $state<string | null>(null);
	/** Raw RTCPeerConnection.connectionState, surfaced for the status line. */
	connState = $state<RTCPeerConnectionState>('new');
	/** Raw ICE connection state — shown while connecting so a stall is legible. */
	iceState = $state<RTCIceConnectionState>('new');
	/** Short human summary of what ICE gathered (e.g. "host + srflx"). */
	diag = $state('');
	messages = $state<ChatMessage[]>([]);
	/** The resolved direct path (real peer IP:port), once connected. */
	pair = $state<SelectedPair | null>(null);

	/** Local camera/mic stream while publishing media (null = not in a call). */
	localStream = $state<MediaStream | null>(null);
	/** The remote peer's media stream once their tracks arrive. */
	remoteStream = $state<MediaStream | null>(null);
	/** True while audio/video is flowing either direction. */
	inCall = $state(false);
	micOn = $state(true);
	camOn = $state(true);
	/** Whether the local user is publishing a video track (vs audio-only). */
	sendingVideo = $state(false);

	private pc: RTCPeerConnection | null = null;
	private dc: RTCDataChannel | null = null;
	private append: WebRTCSessionContext['append'];
	private clearTimeline: WebRTCSessionContext['clear'];
	private seq = 0;
	private connectTimer: ReturnType<typeof setTimeout> | null = null;
	// Perfect-negotiation state for renegotiating media over the data channel.
	private polite = false;
	private makingOffer = false;
	private ignoreOffer = false;
	private mediaStepEmitted = false;

	constructor(ctx: WebRTCSessionContext) {
		this.append = ctx.append;
		this.clearTimeline = ctx.clear;
	}

	private get me(): 'peerA' | 'peerB' {
		return this.role === 'joiner' ? 'peerB' : 'peerA';
	}
	private get them(): 'peerA' | 'peerB' {
		return this.role === 'joiner' ? 'peerA' : 'peerB';
	}

	// ---- Initiator ---------------------------------------------------------

	/** Become the caller: create an offer and gather ICE, then expose the code. */
	async createInvite() {
		this.reset();
		this.clearTimeline();
		this.role = 'initiator';
		this.phase = 'inviting';
		try {
			const pc = this.newConnection();
			// The initiator opens the data channel; the joiner receives it.
			const dc = pc.createDataChannel('chat', { ordered: true });
			this.bindChannel(dc);

			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			await this.gatherComplete(pc);

			const sdp = pc.localDescription?.sdp ?? offer.sdp ?? '';
			this.localCode = await encodeSignal('offer', sdp);
			this.emitSdpStep('Offer created', this.me, 'signal', sdp, 'offer', true);
			this.phase = 'invite-ready';
		} catch (err) {
			this.fail(err);
		}
	}

	/** Initiator: apply the reply code pasted back from the other device. */
	async applyReply(code: string) {
		if (!this.pc) return;
		this.error = null;
		let sdp: string;
		try {
			const decoded = await decodeSignal(code);
			if (decoded.type !== 'answer') throw new Error('That code is an invite, not a reply.');
			sdp = decoded.sdp;
		} catch (err) {
			this.error =
				(err as Error).message || 'That reply code could not be read. Paste the whole thing.';
			return;
		}
		try {
			await this.pc.setRemoteDescription({ type: 'answer', sdp });
			this.emitSdpStep('Reply received', 'signal', this.me, sdp, 'answer', false);
			this.phase = 'connecting';
		} catch (err) {
			this.fail(err);
		}
	}

	// ---- Joiner ------------------------------------------------------------

	/** Move the joiner to the paste-invite screen. */
	beginJoin() {
		this.reset();
		this.role = 'joiner';
		this.phase = 'join-paste';
	}

	/** Joiner: accept the invite code and produce a reply code. */
	async acceptInvite(code: string) {
		this.error = null;
		let sdp: string;
		try {
			const decoded = await decodeSignal(code);
			if (decoded.type !== 'offer') throw new Error('That code is a reply, not an invite.');
			sdp = decoded.sdp;
		} catch (err) {
			this.error =
				(err as Error).message || 'That invite code could not be read. Paste the whole thing.';
			return;
		}
		this.phase = 'joining';
		this.clearTimeline();
		try {
			const pc = this.newConnection();
			pc.ondatachannel = (e) => this.bindChannel(e.channel);
			await pc.setRemoteDescription({ type: 'offer', sdp });
			this.emitSdpStep('Invite received', 'signal', this.me, sdp, 'offer', false);

			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);
			await this.gatherComplete(pc);

			const local = pc.localDescription?.sdp ?? answer.sdp ?? '';
			this.localCode = await encodeSignal('answer', local);
			this.emitSdpStep('Reply created', this.me, 'signal', local, 'answer', true);
			this.phase = 'answer-ready';
		} catch (err) {
			this.fail(err);
		}
	}

	// ---- Chat --------------------------------------------------------------

	/** Send a chat message over the real data channel and record it. */
	send(text: string) {
		const body = text.trim();
		if (!body || this.dc?.readyState !== 'open') return;
		this.dcSend({ k: 'm', x: body });
		this.messages = [...this.messages, { id: `m${this.seq++}`, dir: 'out', text: body }];
		this.emitMessageStep(body, 'out');
	}

	// ---- Audio / video call ------------------------------------------------

	/**
	 * Start (or add to) a call by publishing the local mic — and camera, if
	 * `video` — on the SAME peer connection. Adding tracks triggers
	 * renegotiation, which we carry over the already-open data channel, so no
	 * new codes are exchanged.
	 */
	async startCall(video: boolean) {
		const pc = this.pc;
		if (!pc || this.phase !== 'connected' || this.localStream) return;
		this.error = null;
		let stream: MediaStream;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
		} catch (err) {
			const name = (err as Error).name;
			this.error =
				name === 'NotAllowedError'
					? 'Camera/microphone access was blocked. Allow it and try again.'
					: name === 'NotFoundError'
						? 'No camera or microphone was found on this device.'
						: 'Could not start the call.';
			return;
		}
		this.localStream = stream;
		this.micOn = true;
		this.camOn = video;
		this.sendingVideo = video;
		this.inCall = true;
		stream.getTracks().forEach((t) => pc.addTrack(t, stream)); // → onnegotiationneeded
		this.emitMediaAddedStep(video);
	}

	toggleMic() {
		const s = this.localStream;
		if (!s) return;
		this.micOn = !this.micOn;
		s.getAudioTracks().forEach((t) => (t.enabled = this.micOn));
	}

	toggleCam() {
		const s = this.localStream;
		if (!s || !this.sendingVideo) return;
		this.camOn = !this.camOn;
		s.getVideoTracks().forEach((t) => (t.enabled = this.camOn));
	}

	/** Stop publishing local media (the data channel + chat stay open). */
	hangUp() {
		const pc = this.pc;
		this.localStream?.getTracks().forEach((t) => t.stop());
		if (pc) {
			pc.getSenders().forEach((s) => {
				if (s.track) pc.removeTrack(s); // → renegotiation removes the tracks
			});
		}
		this.localStream = null;
		this.sendingVideo = false;
		const remoteLive = !!this.remoteStream?.getTracks().some((t) => t.readyState === 'live');
		this.inCall = remoteLive;
		this.emitCallEndedStep();
	}

	/** Close the connection and reset everything. */
	close() {
		this.reset();
		this.phase = 'closed';
	}

	// ---- Internals ---------------------------------------------------------

	private newConnection(): RTCPeerConnection {
		// Public STUN so peers can discover their reflexive addresses; on the same
		// Wi-Fi the direct host candidates win and no relay is needed. (No TURN — a
		// relay would require a server, and this stays fully static.)
		const pc = new RTCPeerConnection({
			iceServers: [
				{
					urls: [
						'stun:stun.l.google.com:19302',
						'stun:stun1.l.google.com:19302',
						'stun:global.stun.twilio.com:3478'
					]
				}
			]
		});
		pc.onconnectionstatechange = () => {
			this.connState = pc.connectionState;
			if (pc.connectionState === 'connected') this.clearConnectTimeout();
			if (pc.connectionState === 'failed') this.failConnection();
		};
		pc.oniceconnectionstatechange = () => {
			this.iceState = pc.iceConnectionState;
			if (pc.iceConnectionState === 'checking') this.armConnectTimeout();
			if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed')
				this.clearConnectTimeout();
			if (pc.iceConnectionState === 'failed') this.failConnection();
		};
		this.pc = pc;
		return pc;
	}

	/** ICE reached a terminal failure — report a specific, actionable reason. */
	private failConnection() {
		this.clearConnectTimeout();
		if (this.phase === 'connected') return; // media renegotiation can blip; ignore
		this.error =
			"Couldn't open a direct path between the two devices. This almost always means the network is blocking device‑to‑device traffic — common on guest, office, or public Wi‑Fi with “client/AP isolation”. Try a home network, and make sure both devices are on the same Wi‑Fi (not one on cellular). A static site can't relay around this without a server.";
		this.phase = 'failed';
	}

	/** If ICE checks don't succeed within a window, surface the failure reason. */
	private armConnectTimeout() {
		this.clearConnectTimeout();
		this.connectTimer = setTimeout(() => {
			if (this.phase !== 'connected') this.failConnection();
		}, 20000);
	}

	private clearConnectTimeout() {
		if (this.connectTimer !== null) {
			clearTimeout(this.connectTimer);
			this.connectTimer = null;
		}
	}

	private bindChannel(dc: RTCDataChannel) {
		this.dc = dc;
		dc.onopen = () => void this.onConnected();
		dc.onclose = () => {
			if (this.phase === 'connected') this.phase = 'closed';
		};
		dc.onmessage = (e) => void this.onDcMessage(e.data);
	}

	/** Send a control/chat envelope over the data channel (JSON). */
	private dcSend(obj: unknown) {
		if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(obj));
	}

	/** Demultiplex the data channel: chat text, or media-renegotiation signaling. */
	private async onDcMessage(data: unknown) {
		if (typeof data !== 'string') return;
		let msg: { k?: string; x?: unknown; d?: RTCSessionDescriptionInit; c?: RTCIceCandidateInit };
		try {
			msg = JSON.parse(data);
		} catch {
			msg = { k: 'm', x: data }; // tolerate a raw-string peer
		}
		if (msg.k === 'm') {
			const text = String(msg.x ?? '');
			this.messages = [...this.messages, { id: `m${this.seq++}`, dir: 'in', text }];
			this.emitMessageStep(text, 'in');
		} else if (msg.k === 'sdp' && msg.d) {
			await this.onRemoteDescription(msg.d);
		} else if (msg.k === 'ice' && msg.c) {
			try {
				await this.pc?.addIceCandidate(msg.c);
			} catch (err) {
				if (!this.ignoreOffer) console.warn('addIceCandidate', err);
			}
		}
	}

	/** Perfect-negotiation handling of a renegotiation offer/answer over the DC. */
	private async onRemoteDescription(desc: RTCSessionDescriptionInit) {
		const pc = this.pc;
		if (!pc) return;
		const collision = desc.type === 'offer' && (this.makingOffer || pc.signalingState !== 'stable');
		this.ignoreOffer = !this.polite && collision;
		if (this.ignoreOffer) return;
		await pc.setRemoteDescription(desc);
		if (desc.type === 'offer') {
			await pc.setLocalDescription();
			this.dcSend({ k: 'sdp', d: pc.localDescription });
		}
	}

	private async onConnected() {
		if (this.phase === 'connected') return;
		this.phase = 'connected';
		// The joiner is the "polite" peer: on a glare it yields instead of clashing.
		this.polite = this.role === 'joiner';
		const pc = this.pc;
		if (pc) {
			// Enable renegotiation now that the data channel can carry it. (These
			// are set post-connect so they don't interfere with the initial,
			// manually-signaled offer/answer.)
			pc.onnegotiationneeded = async () => {
				try {
					this.makingOffer = true;
					await pc.setLocalDescription();
					this.dcSend({ k: 'sdp', d: pc.localDescription });
				} catch (err) {
					console.warn('negotiationneeded', err);
				} finally {
					this.makingOffer = false;
				}
			};
			pc.onicecandidate = ({ candidate }) => {
				if (candidate) this.dcSend({ k: 'ice', c: candidate });
			};
			pc.ontrack = (e) => this.onRemoteTrack(e);
		}
		this.pair = pc ? await selectedPair(pc) : null;
		this.emitConnectedStep();
	}

	private onRemoteTrack(e: RTCTrackEvent) {
		this.remoteStream = e.streams[0] ?? new MediaStream([e.track]);
		this.inCall = true;
		// When the far side hangs up, its tracks end — drop the remote video then.
		e.track.onended = () => {
			const live = this.remoteStream?.getTracks().some((t) => t.readyState === 'live');
			if (!live) {
				this.remoteStream = null;
				this.inCall = !!this.localStream;
			}
		};
		if (!this.mediaStepEmitted) {
			this.mediaStepEmitted = true;
			this.emitMediaStep();
		}
	}

	/**
	 * Resolve when ICE gathering finishes so the code carries every candidate —
	 * crucially the srflx (STUN) one, which is the fallback when host/mDNS
	 * candidates can't reach each other. We wait for 'complete' (with a safety
	 * cap) rather than a short timer, but finish early once we have both a host
	 * and a reflexive candidate so a healthy LAN stays snappy.
	 */
	private gatherComplete(pc: RTCPeerConnection): Promise<void> {
		if (pc.iceGatheringState === 'complete') {
			this.diag = summariseCandidates(pc.localDescription?.sdp ?? '');
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			let done = false;
			const finish = () => {
				if (done) return;
				done = true;
				pc.removeEventListener('icegatheringstatechange', check);
				pc.removeEventListener('icecandidate', onCand);
				this.diag = summariseCandidates(pc.localDescription?.sdp ?? '');
				resolve();
			};
			const types = new Set<string>();
			const onCand = (e: RTCPeerConnectionIceEvent) => {
				const t = e.candidate ? /typ (\w+)/.exec(e.candidate.candidate)?.[1] : null;
				if (t) types.add(t);
				// Enough for a real path: a direct address and a reflexive fallback.
				if (types.has('host') && types.has('srflx')) finish();
			};
			const check = () => {
				if (pc.iceGatheringState === 'complete') finish();
			};
			pc.addEventListener('icegatheringstatechange', check);
			pc.addEventListener('icecandidate', onCand);
			// Safety cap: on networks where STUN is blocked, gathering may stall —
			// ship whatever host candidates we have rather than hang.
			setTimeout(finish, 7000);
		});
	}

	private fail(err: unknown) {
		this.error = (err as Error)?.message || 'The connection failed. Try again.';
		this.phase = 'failed';
	}

	reset() {
		this.clearConnectTimeout();
		try {
			this.localStream?.getTracks().forEach((t) => t.stop());
		} catch {
			/* already stopped */
		}
		try {
			this.dc?.close();
		} catch {
			/* already closed */
		}
		try {
			this.pc?.close();
		} catch {
			/* already closed */
		}
		this.dc = null;
		this.pc = null;
		this.role = null;
		this.phase = 'idle';
		this.localCode = '';
		this.error = null;
		this.connState = 'new';
		this.iceState = 'new';
		this.diag = '';
		this.messages = [];
		this.pair = null;
		this.seq = 0;
		this.localStream = null;
		this.remoteStream = null;
		this.inCall = false;
		this.micOn = true;
		this.camOn = true;
		this.sendingVideo = false;
		this.polite = false;
		this.makingOffer = false;
		this.ignoreOffer = false;
		this.mediaStepEmitted = false;
	}

	// ---- Step emission -----------------------------------------------------

	private emitSdpStep(
		label: string,
		from: string,
		to: string,
		sdp: string,
		kind: 'offer' | 'answer',
		mine: boolean
	) {
		const fp = sdpValue(sdp, 'a=fingerprint:') ?? 'sha-256 …';
		const ufrag = sdpValue(sdp, 'a=ice-ufrag:') ?? '…';
		const cands = parseCandidates(sdp);
		const who = mine ? 'Your browser' : 'The other device';
		const layer: ProtocolLayer = {
			name: 'SDP Message',
			abbreviation: 'SDP',
			osiLayer: 7,
			color: SDP_COLOR,
			headerFields: [
				{
					name: 'Type',
					bits: 0,
					value: kind === 'offer' ? 'Offer' : 'Answer',
					editable: false,
					description: `Real SDP ${kind} — describes the data channel, DTLS role and ICE candidates`
				},
				{
					name: 'ICE ufrag',
					bits: 0,
					value: ufrag,
					editable: false,
					description: 'Real ICE username fragment for this session (from the actual SDP)'
				},
				{
					name: 'Fingerprint',
					bits: 0,
					value: shorten(fp, 34),
					editable: false,
					description:
						'Real DTLS certificate fingerprint — verified during the DTLS handshake so no relay can impersonate a peer'
				},
				{
					name: 'Candidates',
					bits: 0,
					value: cands.summary,
					editable: false,
					description: `Real ICE candidates gathered by ${mine ? 'your' : 'their'} browser (host = your LAN address, srflx = your public address via STUN, relay = TURN)`,
					color: SDP_COLOR
				}
			]
		};
		this.append({
			id: `sig-${label}-${this.seq++}`.replace(/\s+/g, '-').toLowerCase(),
			label,
			description: `${who} produced a real SDP ${kind}. Moving this code between devices by hand (copy‑paste or QR) IS the signaling — there is no server in the middle.`,
			fromActor: from,
			toActor: to,
			duration: 600,
			highlight: ['Candidates'],
			layers: [layer]
		});
	}

	private emitConnectedStep() {
		const p = this.pair;
		const lan = p?.lan ?? false;
		const path = p
			? `${p.localAddr}:${p.localPort} (${p.localType}) ↔ ${p.remoteAddr}:${p.remotePort} (${p.remoteType})`
			: 'direct path negotiated';
		const layers: ProtocolLayer[] = [
			createUDPLayer({
				srcPort: p?.localPort ?? 0,
				dstPort: p?.remotePort ?? 0,
				length: 0
			}),
			createDTLSLayer({
				contentType: 'Handshake — Finished (20)',
				handshakeType: 'Finished',
				body: 'Keys derived; certificate fingerprints matched the SDP. The channel is now encrypted end‑to‑end.'
			})
		];
		this.append({
			id: `rtc-connected-${this.seq++}`,
			label: 'Direct connection established',
			description: lan
				? `ICE picked a direct path and DTLS completed. Both ends are host candidates on the same network — this is a true peer‑to‑peer link with no server relaying anything: ${path}.`
				: `ICE picked a path and DTLS completed. The encrypted data channel is open: ${path}.`,
			fromActor: this.me,
			toActor: this.them,
			duration: 700,
			highlight: ['Content Type'],
			layers
		});
	}

	private emitMessageStep(text: string, dir: 'out' | 'in') {
		const p = this.pair;
		const bytes = new TextEncoder().encode(text).length;
		const from = dir === 'out' ? this.me : this.them;
		const to = dir === 'out' ? this.them : this.me;
		const src = dir === 'out' ? p?.localPort : p?.remotePort;
		const dst = dir === 'out' ? p?.remotePort : p?.localPort;

		// A WebRTC string message travels as a single unfragmented SCTP DATA chunk
		// (Begin+End set) carrying PPID 51 (WebRTC String) on stream 0.
		const layers: ProtocolLayer[] = [
			createUDPLayer({ srcPort: src ?? 0, dstPort: dst ?? 0, length: bytes + 40 }),
			createDTLSLayer({
				contentType: 'Application Data (23)',
				handshakeType: 'n/a (encrypted record)',
				epoch: 1,
				sequence: this.seq,
				body: `Encrypted SCTP payload (${bytes} byte${bytes === 1 ? '' : 's'} of user data)`
			}),
			createSCTPLayer({
				srcPort: 5000,
				dstPort: 5000,
				chunkType: 'DATA (0)',
				chunkFlags: '0x03 (B|E)',
				payload: `PPID 51 (WebRTC String) · stream 0 · "${shorten(text, 48)}"`
			})
		];
		this.append({
			id: `msg-${this.seq++}`,
			label: dir === 'out' ? 'Message sent' : 'Message received',
			description:
				dir === 'out'
					? `You sent "${text}" (${bytes} bytes). It travels as an SCTP DATA chunk inside a DTLS‑encrypted record, straight to the other device. The text and byte count are real; the DTLS/SCTP header values are representative — the browser encrypts the datagram, so its exact wire bytes aren't observable.`
					: `The other device sent "${text}" (${bytes} bytes), delivered as an SCTP DATA chunk inside a DTLS record. The message and length are real; the encrypted header values shown are representative.`,
			fromActor: from,
			toActor: to,
			duration: 500,
			highlight: ['Payload'],
			layers
		});
	}

	private emitMediaAddedStep(video: boolean) {
		this.append({
			id: `media-add-${this.seq++}`,
			label: video ? 'Camera & mic added' : 'Microphone added',
			description: `You turned on your ${
				video ? 'camera and microphone' : 'microphone'
			}. The browsers renegotiated the session over the already‑open data channel — no new codes to exchange — and added the media tracks to the same peer connection.`,
			fromActor: this.me,
			toActor: this.them,
			duration: 500,
			layers: []
		});
	}

	private emitMediaStep() {
		const p = this.pair;
		const { audio, video } = this.negotiatedCodecs();
		const codecs = [audio, video].filter(Boolean).join(', ') || 'the negotiated codecs';
		const hasVideo = !!video;
		const mediaLayer: ProtocolLayer = {
			name: 'SRTP Media',
			abbreviation: 'SRTP',
			osiLayer: 7,
			color: '#F59E0B',
			headerFields: [
				{
					name: 'Media',
					bits: 0,
					value: hasVideo ? 'audio + video' : 'audio',
					editable: false,
					description: 'What the two browsers negotiated to send over this call'
				},
				{
					name: 'Codecs',
					bits: 0,
					value: codecs,
					editable: false,
					description: 'Real codecs both sides agreed on, read from the negotiated SDP',
					color: '#F59E0B'
				},
				{
					name: 'Encryption',
					bits: 0,
					value: 'AES (DTLS‑SRTP)',
					editable: false,
					description:
						'SRTP keys were derived from the DTLS handshake — media is encrypted end‑to‑end'
				},
				{
					name: 'Payload',
					bits: 0,
					value: 'live encrypted media frames',
					editable: false,
					description: 'Actual audio/video, flowing directly device‑to‑device in real time'
				}
			]
		};
		this.append({
			id: `media-flow-${this.seq++}`,
			label: 'Media flowing (SRTP)',
			description: `A real ${
				hasVideo ? 'audio + video' : 'audio'
			} call is now flowing directly between the two devices as SRTP (${codecs}). It's peer‑to‑peer over your Wi‑Fi — the media never touches a server.`,
			fromActor: this.them,
			toActor: this.me,
			duration: 700,
			highlight: ['Codecs'],
			layers: [
				createUDPLayer({ srcPort: p?.remotePort ?? 0, dstPort: p?.localPort ?? 0, length: 0 }),
				mediaLayer
			]
		});
	}

	private emitCallEndedStep() {
		this.append({
			id: `call-end-${this.seq++}`,
			label: 'Call ended',
			description:
				'You stopped sending audio/video. The data channel stays open, so you can keep chatting or start another call.',
			fromActor: this.me,
			toActor: this.them,
			duration: 400,
			layers: []
		});
	}

	/** Read the agreed audio/video codec names from the negotiated remote SDP. */
	private negotiatedCodecs(): { audio?: string; video?: string } {
		const sdp = this.pc?.remoteDescription?.sdp ?? '';
		const names = sdp
			.split(/\r?\n/)
			.filter((l) => l.startsWith('a=rtpmap:'))
			.map((l) => l.split(' ')[1] ?? '');
		return {
			audio: names.find((c) => /opus|PCMU|PCMA|G722/i.test(c)),
			video: names.find((c) => /VP8|VP9|H264|AV1/i.test(c))
		};
	}
}

/** Short summary of the candidate types in an SDP, e.g. "host + srflx". */
function summariseCandidates(sdp: string): string {
	const types = new Set<string>();
	for (const line of sdp.split(/\r?\n/)) {
		const t = /typ (\w+)/.exec(line)?.[1];
		if (line.includes('candidate:') && t) types.add(t);
	}
	if (types.size === 0) return 'no candidates';
	const order = ['host', 'srflx', 'prflx', 'relay'];
	return [...types].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(' + ');
}

/** getStats() rows are loosely typed across browsers — read the fields we need. */
interface CandidateStat {
	address?: string;
	ip?: string;
	port?: number;
	candidateType?: string;
}
interface PairStat {
	type: string;
	state?: string;
	selected?: boolean;
	nominated?: boolean;
	localCandidateId?: string;
	remoteCandidateId?: string;
}

/** Resolve the nominated ICE candidate pair to real addresses via getStats(). */
async function selectedPair(pc: RTCPeerConnection): Promise<SelectedPair | null> {
	const stats = await pc.getStats();
	const cand = new Map<string, CandidateStat>();
	let pair: PairStat | null = null;
	stats.forEach((raw) => {
		const r = raw as unknown as PairStat & { id: string };
		if (r.type === 'local-candidate' || r.type === 'remote-candidate')
			cand.set(r.id, raw as unknown as CandidateStat);
		if (r.type === 'candidate-pair') {
			if (
				r.selected ||
				(r.nominated && r.state === 'succeeded') ||
				(!pair && r.state === 'succeeded')
			)
				pair = r;
		}
	});
	if (!pair) return null;
	const chosen: PairStat = pair;
	const l = chosen.localCandidateId ? cand.get(chosen.localCandidateId) : undefined;
	const r = chosen.remoteCandidateId ? cand.get(chosen.remoteCandidateId) : undefined;
	const lt = l?.candidateType ?? 'host';
	const rt = r?.candidateType ?? 'host';
	return {
		localAddr: l?.address ?? l?.ip ?? '—',
		localPort: l?.port ?? 0,
		localType: lt,
		remoteAddr: r?.address ?? r?.ip ?? '—',
		remotePort: r?.port ?? 0,
		remoteType: rt,
		lan: lt === 'host' && rt === 'host'
	};
}
