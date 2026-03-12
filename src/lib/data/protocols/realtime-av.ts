import type { Protocol } from '../types';

export const realtimeAvProtocols: Protocol[] = [
	{
		id: 'webrtc',
		name: 'Web Real-Time Communication',
		abbreviation: 'WebRTC',
		categoryId: 'realtime-av',
		port: undefined,
		year: 2011,
		rfc: 'RFC 8825',
		oneLiner: 'Peer-to-peer audio, video, and data — directly between browsers, no plugins needed.',
		overview: `WebRTC is the technology that makes browser-based video calls possible. Before WebRTC, real-time communication required plugins (Flash, Java applets) or native apps. Now, two browsers can establish a direct, encrypted, peer-to-peer connection for audio, video, and arbitrary data.

The key insight is "peer-to-peer" — once the connection is established, data flows directly between users without passing through a server. This reduces latency and server costs. However, establishing that connection requires a signaling server (to exchange connection offers) and often STUN/TURN servers (to navigate NATs and firewalls).

Under the hood, WebRTC is actually a bundle of protocols: ICE for connectivity establishment, DTLS for encryption, SRTP for media, and SCTP for data channels. The browser API abstracts all of this into a relatively simple JavaScript interface.`,
		howItWorks: [
			{
				title: 'Signaling',
				description:
					'Peers exchange "offers" and "answers" (SDP descriptions of their capabilities) through a signaling server (WebSocket, HTTP, or even carrier pigeon — WebRTC doesn\'t care how).'
			},
			{
				title: 'ICE candidate gathering',
				description:
					'Each peer gathers network candidates: local IPs, STUN-discovered public IPs, and TURN relay addresses. These are exchanged via the signaling server.'
			},
			{
				title: 'DTLS handshake',
				description:
					'Once a path is found, peers perform a DTLS handshake to establish encryption keys. All subsequent media is encrypted end-to-end.'
			},
			{
				title: 'Media and data flow',
				description:
					'Audio/video flows via SRTP (Secure RTP) directly between peers. Data channels use SCTP over DTLS for reliable or unreliable data transfer.'
			}
		],
		useCases: [
			'Video conferencing (Google Meet, Zoom web client)',
			'Voice calls in the browser',
			'Screen sharing and remote desktop',
			'Peer-to-peer file sharing',
			'Real-time gaming and AR/VR'
		],
		codeExample: {
			language: 'javascript',
			code: `// Simplified WebRTC setup
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Get local camera/mic
const stream = await navigator.mediaDevices
  .getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(t => pc.addTrack(t, stream));

// Create offer and send via signaling
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signalingServer.send(JSON.stringify(offer));`,
			caption:
				'Get camera access, create an offer, and signal — WebRTC handles the rest peer-to-peer'
		},
		performance: {
			latency: 'Connection setup: 2-5 seconds (ICE + DTLS). Media latency: 50-150ms peer-to-peer.',
			throughput:
				'Adaptive bitrate: 100kbps (audio) to 4+ Mbps (HD video). Adjusts to network conditions.',
			overhead: 'SRTP adds ~12 bytes per packet. DTLS handshake is one-time cost.'
		},
		microInteraction: 'peer-to-peer',
		connections: ['udp', 'tls', 'sip', 'sctp']
	},
	{
		id: 'rtp',
		name: 'Real-time Transport Protocol',
		abbreviation: 'RTP',
		categoryId: 'realtime-av',
		port: undefined,
		year: 1996,
		rfc: 'RFC 3550',
		oneLiner: 'The standard way to deliver audio and video packets in real-time over UDP.',
		overview: `RTP is the workhorse behind virtually all real-time audio and video on the internet. WebRTC uses it (as SRTP). VoIP phones use it. Video conferencing systems use it. It provides the essential services that raw UDP lacks for media: timestamps (for synchronization), sequence numbers (for reordering and loss detection), and payload type identification.

RTP doesn't guarantee delivery — it runs over UDP intentionally. Instead, it gives the application enough information to handle problems intelligently. The companion protocol RTCP (RTP Control Protocol) runs alongside RTP, carrying statistics about packet loss, jitter, and round-trip time so endpoints can adapt their encoding in real time.

Think of RTP as the envelope for media packets and RTCP as the feedback channel. Together, they enable adaptive, real-time communication that gracefully handles network imperfections.`,
		howItWorks: [
			{
				title: 'Session establishment',
				description:
					"RTP itself doesn't handle session setup — that's done by a signaling protocol (SIP, WebRTC's SDP). The signaling determines ports, codecs, and parameters."
			},
			{
				title: 'Packetize media',
				description:
					'Audio/video frames are split into RTP packets, each with a timestamp, sequence number, and payload type. Packets are sent over UDP.'
			},
			{
				title: 'Receiver buffers and orders',
				description:
					'The receiver uses sequence numbers to detect loss and reorder packets. A jitter buffer smooths out timing variations before playback.'
			},
			{
				title: 'RTCP feedback',
				description:
					'Receiver periodically sends RTCP reports: packets received, loss rate, jitter. The sender uses this to adjust bitrate, codec, or error correction.'
			}
		],
		useCases: [
			'VoIP phone systems',
			'Video conferencing infrastructure',
			'Live broadcasting and streaming',
			'Surveillance camera systems',
			'Online gaming voice chat'
		],
		performance: {
			latency:
				'No connection setup (UDP). End-to-end typically 50-300ms including jitter buffering.',
			throughput:
				'Adaptive: codec and bitrate adjust based on RTCP feedback. Audio: 8-128kbps. Video: 100kbps-10+Mbps.',
			overhead: '12-byte RTP header per packet. RTCP reports are periodic and small.'
		},
		microInteraction: 'streaming',
		connections: ['udp', 'webrtc', 'sip']
	},
	{
		id: 'sip',
		name: 'Session Initiation Protocol',
		abbreviation: 'SIP',
		categoryId: 'realtime-av',
		port: 5060,
		year: 1999,
		rfc: 'RFC 3261',
		oneLiner: 'The "dialing" protocol for VoIP — establishes, modifies, and tears down calls.',
		overview: `SIP is the signaling protocol that makes VoIP calls happen. It doesn't carry the actual audio or video (that's RTP's job). Instead, SIP handles the "control plane": inviting someone to a call, ringing, answering, putting on hold, transferring, and hanging up.

SIP's design was inspired by HTTP — it uses text-based request/response messages with methods like INVITE, ACK, BYE, and REGISTER. URIs identify users (sip:alice@example.com). This HTTP-like design made it easier to implement and debug compared to the ITU's H.323 alternative.

SIP is the backbone of virtually every modern phone system: enterprise PBX systems, VoIP carriers (like Twilio), and telecom infrastructure. When you make a phone call in 2024, SIP is almost certainly involved somewhere in the chain.`,
		howItWorks: [
			{
				title: 'REGISTER',
				description:
					'Phone/softphone registers with a SIP server, telling it "I\'m alice@example.com and I\'m reachable at this IP." This is like logging in.'
			},
			{
				title: 'INVITE',
				description:
					'Caller sends INVITE to the SIP server with an SDP body describing desired media (audio/video codecs, ports). Server routes it to the callee.'
			},
			{
				title: '200 OK + ACK',
				description:
					'Callee accepts with 200 OK (including their SDP). Caller confirms with ACK. RTP media streams are now established between the peers.'
			},
			{
				title: 'BYE',
				description:
					'Either party sends BYE to end the call. The other responds 200 OK. RTP streams stop. Simple and clean.'
			}
		],
		useCases: [
			'Enterprise phone systems (PBX)',
			'VoIP service providers (Twilio, Vonage)',
			'Video conferencing initiation',
			'Instant messaging (SIP SIMPLE)',
			'Emergency call routing (E911)'
		],
		performance: {
			latency: 'Call setup: 1-3 seconds (INVITE → 200 OK → ACK + RTP establishment)',
			throughput: 'SIP messages are small text; the media (RTP) carries the bandwidth load',
			overhead: 'Text-based headers like HTTP; typically 500-1000 bytes per SIP message'
		},
		microInteraction: 'query-response',
		connections: ['udp', 'tcp', 'rtp', 'webrtc']
	},
	{
		id: 'hls',
		name: 'HTTP Live Streaming',
		abbreviation: 'HLS',
		categoryId: 'realtime-av',
		port: 443,
		year: 2009,
		rfc: 'RFC 8216',
		oneLiner: "Apple's adaptive streaming protocol — video delivered as small HTTP file downloads.",
		overview: `HLS takes a clever approach to streaming: instead of a continuous real-time stream, it chops video into small files (typically 2-10 second segments) and serves them as ordinary HTTP downloads. A manifest file (.m3u8) lists the available segments and quality levels.

This design is brilliant for several reasons: it works through any firewall (it's just HTTP), it scales trivially with CDNs (segments are cacheable files), and it enables adaptive bitrate — the player switches between quality levels based on bandwidth, providing smooth playback even on unstable connections.

The tradeoff is latency: buffering several segments means HLS typically has 6-30 seconds of delay. Low-Latency HLS (LL-HLS) reduces this to 2-4 seconds by using partial segments and server push. HLS dominates the streaming landscape — Netflix, Disney+, YouTube, and virtually every major streaming platform use it (or the similar DASH format).`,
		howItWorks: [
			{
				title: 'Encode and segment',
				description:
					'The server encodes video at multiple quality levels (360p, 720p, 1080p, 4K) and splits each into small segments (2-10 seconds). Each segment is a standalone file.'
			},
			{
				title: 'Manifest playlist',
				description:
					'A master .m3u8 playlist lists available quality levels. Each level has its own playlist listing segment URLs. Player picks the right level for current bandwidth.'
			},
			{
				title: 'Segment download',
				description:
					'Player downloads segments sequentially via HTTP GET. Segments are cached by CDNs worldwide. The player maintains a buffer of upcoming segments.'
			},
			{
				title: 'Adaptive bitrate',
				description:
					'Player monitors download speed. If bandwidth drops, it switches to a lower quality. If it improves, it switches up. No buffering, no interruption.'
			}
		],
		useCases: [
			'Video on demand (Netflix, Disney+, YouTube)',
			'Live event streaming (sports, concerts)',
			'News and social media video',
			'E-learning platforms',
			'Security camera recording playback'
		],
		performance: {
			latency:
				'Standard: 10-30 seconds. Low-Latency HLS: 2-4 seconds. Not suitable for real-time interaction.',
			throughput:
				'Adaptive: typically 1-15 Mbps for video. CDN-backed = essentially unlimited scale.',
			overhead: 'HTTP headers per segment. Manifest polling adds small periodic requests.'
		},
		microInteraction: 'streaming',
		connections: ['http1', 'http2', 'tls']
	}
];
