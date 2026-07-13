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
	messages = $state<ChatMessage[]>([]);
	/** The resolved direct path (real peer IP:port), once connected. */
	pair = $state<SelectedPair | null>(null);

	private pc: RTCPeerConnection | null = null;
	private dc: RTCDataChannel | null = null;
	private append: WebRTCSessionContext['append'];
	private clearTimeline: WebRTCSessionContext['clear'];
	private seq = 0;

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
		this.dc.send(body);
		this.messages = [...this.messages, { id: `m${this.seq++}`, dir: 'out', text: body }];
		this.emitMessageStep(body, 'out');
	}

	/** Close the connection and reset everything. */
	close() {
		this.reset();
		this.phase = 'closed';
	}

	// ---- Internals ---------------------------------------------------------

	private newConnection(): RTCPeerConnection {
		// Public STUN so peers on different networks can still find a path; on the
		// same Wi-Fi the direct host candidates win and no relay is needed.
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});
		pc.onconnectionstatechange = () => {
			this.connState = pc.connectionState;
			if (pc.connectionState === 'failed') this.phase = 'failed';
		};
		this.pc = pc;
		return pc;
	}

	private bindChannel(dc: RTCDataChannel) {
		this.dc = dc;
		dc.onopen = () => void this.onConnected();
		dc.onclose = () => {
			if (this.phase === 'connected') this.phase = 'closed';
		};
		dc.onmessage = (e) => {
			const text = typeof e.data === 'string' ? e.data : '[binary]';
			this.messages = [...this.messages, { id: `m${this.seq++}`, dir: 'in', text }];
			this.emitMessageStep(text, 'in');
		};
	}

	private async onConnected() {
		if (this.phase === 'connected') return;
		this.phase = 'connected';
		this.pair = this.pc ? await selectedPair(this.pc) : null;
		this.emitConnectedStep();
	}

	/** Resolve when ICE gathering finishes, or after a short cap (LAN is instant). */
	private gatherComplete(pc: RTCPeerConnection): Promise<void> {
		if (pc.iceGatheringState === 'complete') return Promise.resolve();
		return new Promise((resolve) => {
			let done = false;
			const finish = () => {
				if (done) return;
				done = true;
				pc.removeEventListener('icegatheringstatechange', check);
				resolve();
			};
			const check = () => {
				if (pc.iceGatheringState === 'complete') finish();
			};
			pc.addEventListener('icegatheringstatechange', check);
			// Cap the wait: STUN/relay candidates may never arrive on some networks,
			// but the host candidates we need for a same‑Wi‑Fi path gather at once.
			setTimeout(finish, 2500);
		});
	}

	private fail(err: unknown) {
		this.error = (err as Error)?.message || 'The connection failed. Try again.';
		this.phase = 'failed';
	}

	reset() {
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
		this.messages = [];
		this.pair = null;
		this.seq = 0;
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
