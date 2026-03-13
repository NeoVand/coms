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
		connections: ['udp', 'tls', 'sip', 'sctp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/WebRTC',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8825',
			official: 'https://webrtc.org/'
		}
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
		codeExample: {
			language: 'python',
			code: `import struct
import socket
import time

# Construct a minimal RTP packet
def make_rtp_packet(seq, timestamp, payload):
    # V=2, P=0, X=0, CC=0, M=0, PT=111 (Opus audio)
    header = struct.pack('!BBHII',
        0x80,        # Version 2, no padding/extension
        111,         # Payload type (Opus)
        seq,         # Sequence number
        timestamp,   # RTP timestamp
        0x12345678   # SSRC (synchronization source)
    )
    return header + payload

# Send RTP packets over UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for seq in range(100):
    packet = make_rtp_packet(seq, seq * 960, b'\\x00' * 160)
    sock.sendto(packet, ('127.0.0.1', 5004))
    time.sleep(0.02)  # 20ms intervals (50 packets/sec)`,
			caption:
				'Raw RTP packet construction — 12-byte header with sequence number and timestamp for media ordering',
			alternatives: [
				{
					language: 'bash',
					code: `# Send a test RTP stream with ffmpeg
ffmpeg -re -i input.mp4 \\
  -c:v libx264 -preset ultrafast \\
  -c:a libopus \\
  -f rtp rtp://192.168.1.100:5004

# Receive and play an RTP stream
ffplay rtp://0.0.0.0:5004 -protocol_whitelist rtp,udp

# Capture RTP packets for analysis
tcpdump -i eth0 udp port 5004 -w rtp_capture.pcap`
				}
			]
		},
		performance: {
			latency:
				'No connection setup (UDP). End-to-end typically 50-300ms including jitter buffering.',
			throughput:
				'Adaptive: codec and bitrate adjust based on RTCP feedback. Audio: 8-128kbps. Video: 100kbps-10+Mbps.',
			overhead: '12-byte RTP header per packet. RTCP reports are periodic and small.'
		},
		connections: ['udp', 'webrtc', 'sip'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Real-time_Transport_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc3550'
		}
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
		codeExample: {
			language: 'python',
			code: `import pjsua2 as pj

# Initialize PJSIP endpoint
ep = pj.Endpoint()
ep.libCreate()

cfg = pj.EpConfig()
ep.libInit(cfg)

# Add a SIP transport
tcfg = pj.TransportConfig()
tcfg.port = 5060
ep.transportCreate(pj.PJSIP_TRANSPORT_UDP, tcfg)
ep.libStart()

# Register with a SIP server
acfg = pj.AccountConfig()
acfg.idUri = "sip:alice@example.com"
acfg.regConfig.registrarUri = "sip:example.com"
acfg.sipConfig.authCreds.append(
    pj.AuthCredInfo("digest", "*", "alice", 0, "secret"))

account = pj.Account()
account.create(acfg)  # Sends SIP REGISTER`,
			caption: 'PJSIP registers with a SIP server — the INVITE/200 OK/ACK flow handles call setup',
			alternatives: [
				{
					language: 'http',
					code: `INVITE sip:bob@example.com SIP/2.0
Via: SIP/2.0/UDP 10.0.0.1:5060;branch=z9hG4bK776
From: "Alice" <sip:alice@example.com>;tag=1928301774
To: "Bob" <sip:bob@example.com>
Call-ID: a84b4c76e66710@10.0.0.1
CSeq: 314159 INVITE
Contact: <sip:alice@10.0.0.1:5060>
Content-Type: application/sdp
Content-Length: 142

v=0
o=alice 53655765 2353687637 IN IP4 10.0.0.1
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000`
				}
			]
		},
		performance: {
			latency: 'Call setup: 1-3 seconds (INVITE → 200 OK → ACK + RTP establishment)',
			throughput: 'SIP messages are small text; the media (RTP) carries the bandwidth load',
			overhead: 'Text-based headers like HTTP; typically 500-1000 bytes per SIP message'
		},
		connections: ['udp', 'tcp', 'rtp', 'webrtc'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Session_Initiation_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc3261'
		}
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
		codeExample: {
			language: 'bash',
			code: `# Create HLS segments and playlist from a video file
ffmpeg -i input.mp4 \\
  -c:v libx264 -preset fast -crf 22 \\
  -c:a aac -b:a 128k \\
  -hls_time 6 \\
  -hls_list_size 0 \\
  -hls_segment_filename 'segment_%03d.ts' \\
  -f hls playlist.m3u8

# Create multi-bitrate HLS for adaptive streaming
ffmpeg -i input.mp4 \\
  -map 0:v -map 0:a -map 0:v -map 0:a \\
  -c:v libx264 -c:a aac \\
  -b:v:0 1500k -s:v:0 1280x720 \\
  -b:v:1 500k -s:v:1 640x360 \\
  -var_stream_map "v:0,a:0 v:1,a:1" \\
  -hls_time 6 -master_pl_name master.m3u8 \\
  -f hls stream_%v/playlist.m3u8`,
			caption:
				'ffmpeg creates HLS segments and playlists — CDNs serve these as ordinary HTTP files',
			alternatives: [
				{
					language: 'javascript',
					code: `import Hls from 'hls.js';

// HLS.js — play HLS in any browser
const video = document.querySelector('video');

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource('https://cdn.example.com/master.m3u8');
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    // Adaptive bitrate is automatic
    console.log('Quality levels:', hls.levels.length);
    video.play();
  });

  hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
    console.log('Switched to quality:', data.level);
  });
}`
				}
			]
		},
		performance: {
			latency:
				'Standard: 10-30 seconds. Low-Latency HLS: 2-4 seconds. Not suitable for real-time interaction.',
			throughput:
				'Adaptive: typically 1-15 Mbps for video. CDN-backed = essentially unlimited scale.',
			overhead: 'HTTP headers per segment. Manifest polling adds small periodic requests.'
		},
		connections: ['http1', 'http2', 'tls'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP_Live_Streaming',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8216',
			official: 'https://developer.apple.com/streaming/'
		}
	},
	{
		id: 'rtmp',
		name: 'Real-Time Messaging Protocol',
		abbreviation: 'RTMP',
		categoryId: 'realtime-av',
		port: 1935,
		year: 2002,
		oneLiner: 'The Flash-era streaming protocol that refused to die — still the king of live stream ingest.',
		overview: `RTMP was born in 2002 when Macromedia released Flash Communication Server 1.0, giving the web its first real taste of live streaming. Adobe later acquired Macromedia and eventually released an incomplete specification of the protocol. Despite Flash Player's demise in 2020, RTMP survived — because nothing else matched its simplicity for getting a live video feed from a camera to a server.

The protocol works by multiplexing audio, video, and data streams over a single TCP connection, chunking large messages into smaller fragments for interleaved delivery. It maintains persistent connections with low-overhead handshakes, making it ideal for the "ingest" side of live streaming — the path from encoder (OBS, Wirecast) to the first server.

Today, RTMP is the de facto standard for live stream ingest. Twitch, YouTube Live, Facebook Live, and virtually every streaming platform accept RTMP input. The stream typically gets transcoded on the server side and delivered to viewers via HLS or DASH. RTMP handles the first mile; HTTP streaming handles the last mile.`,
		howItWorks: [
			{
				title: 'TCP handshake + RTMP handshake',
				description:
					'Client establishes a TCP connection on port 1935, then performs a 3-phase RTMP handshake (C0/S0, C1/S1, C2/S2) exchanging timestamps and random bytes to verify connectivity.'
			},
			{
				title: 'Connect and create stream',
				description:
					'Client sends a "connect" command to the application (e.g., /live). Server responds with connection acknowledgment. Client then sends "createStream" to get a stream ID.'
			},
			{
				title: 'Chunk and multiplex',
				description:
					'Audio, video, and data are split into chunks (default 128 bytes, negotiable). Chunks from different streams are interleaved over the single TCP connection.'
			},
			{
				title: 'Publish or play',
				description:
					'For ingest, the encoder sends "publish" and begins streaming audio/video chunks. For playback, the client sends "play" and receives chunks.'
			},
			{
				title: 'Teardown',
				description:
					'Either side sends "deleteStream" followed by closing the TCP connection. The server can also disconnect idle clients or reject unauthorized publishers.'
			}
		],
		useCases: [
			'Live stream ingest to platforms (Twitch, YouTube Live, Facebook Live)',
			'OBS Studio and encoder-to-server transmission',
			'Low-latency live broadcasts and gaming streams',
			'Surveillance and IP camera feeds',
			'Interactive live events with real-time chat integration'
		],
		codeExample: {
			language: 'javascript',
			code: `const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: { port: 8000, allow_origin: '*' }
};

const nms = new NodeMediaServer(config);
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[Publish]', id, StreamPath);
});
nms.run();
// OBS -> rtmp://localhost:1935/live/stream-key`,
			caption: 'Node-Media-Server accepts RTMP ingest from OBS — the standard first hop for live streaming'
		},
		performance: {
			latency: '1-3 seconds end-to-end for live streaming. Sub-second possible with tuned settings.',
			throughput: 'Single TCP connection handles up to 10+ Mbps easily. Chunking keeps interleaving smooth.',
			overhead: 'Chunk headers are 1-12 bytes depending on type. Handshake is 1+1536+1536 bytes per side.'
		},
		connections: ['tcp', 'tls', 'hls'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol',
			official: 'https://rtmp.veriskope.com/docs/spec/'
		}
	},
	{
		id: 'sdp',
		name: 'Session Description Protocol',
		abbreviation: 'SDP',
		categoryId: 'realtime-av',
		year: 1998,
		rfc: 'RFC 8866',
		oneLiner:
			'The universal format for describing multimedia sessions — the matchmaker behind every WebRTC and VoIP call.',
		overview: `SDP doesn't carry a single byte of audio or video. Instead, it's the language that endpoints use to describe what they can do — codecs they support, IP addresses they're reachable at, bandwidth they expect, and encryption keys they'll use. Think of it as a dating profile for media sessions.

Originally published in 1998 as RFC 2327 for the Mbone (multicast backbone) conferencing community, SDP found its true calling as the session description format for SIP and later WebRTC. Every time you join a video call in your browser, an SDP "offer" and "answer" are exchanged behind the scenes to negotiate what media will flow and how.

The format is deceptively simple — plain text with single-letter field identifiers (v= for version, o= for origin, m= for media, a= for attributes). But this simplicity hides enormous complexity: SDP extensions handle ICE candidates, DTLS fingerprints, simulcast layers, codec parameters, and dozens of other modern requirements.`,
		howItWorks: [
			{
				title: 'Session description created',
				description:
					'The initiator generates an SDP document describing the session: version, originator, session name, timing, and one or more media descriptions.'
			},
			{
				title: 'Media lines define streams',
				description:
					'Each "m=" line declares a media type (audio, video), transport protocol (RTP/SAVPF), port number, and list of supported codec payload types.'
			},
			{
				title: 'Attributes add detail',
				description:
					'Attribute lines (a=) specify codec parameters, ICE credentials, DTLS fingerprints, bandwidth limits, and direction (sendrecv, recvonly).'
			},
			{
				title: 'Offer/answer exchange',
				description:
					'One peer sends an SDP "offer" and the other responds with an SDP "answer." Each side picks compatible codecs and transport parameters.'
			},
			{
				title: 'Session established',
				description:
					'Once both sides have exchanged and accepted SDP, media streams (RTP) and data channels (SCTP) begin flowing according to the negotiated parameters.'
			}
		],
		useCases: [
			'WebRTC peer connection negotiation (offer/answer)',
			'SIP call setup (INVITE body)',
			'Video conferencing session initialization',
			'Multicast session announcements (SAP)',
			'Streaming media session descriptions (RTSP)'
		],
		codeExample: {
			language: 'javascript',
			code: `// WebRTC: create and exchange SDP
const pc = new RTCPeerConnection();

// Add media tracks
const stream = await navigator.mediaDevices
  .getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(t => pc.addTrack(t, stream));

// Create SDP offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Send offer.sdp to remote peer via signaling
console.log('SDP Offer:', offer.sdp);
// v=0
// m=audio 9 UDP/TLS/RTP/SAVPF 111
// a=rtpmap:111 opus/48000/2
// m=video 9 UDP/TLS/RTP/SAVPF 96
// a=rtpmap:96 VP8/90000

// Receive answer from remote peer
const answer = await signalingChannel.receiveAnswer();
await pc.setRemoteDescription(answer);`,
			caption:
				'WebRTC SDP offer/answer — the browser generates SDP automatically from your media tracks'
		},
		performance: {
			latency: 'SDP itself adds no latency — exchanged during signaling, before media flows.',
			throughput: 'Text documents typically 1-5 KB. Negligible compared to the media it describes.',
			overhead: 'Plain text format is verbose but human-readable. Binary alternatives exist but are rare.'
		},
		connections: ['webrtc', 'sip', 'rtp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Session_Description_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8866'
		}
	},
	{
		id: 'dash',
		name: 'Dynamic Adaptive Streaming over HTTP',
		abbreviation: 'DASH',
		categoryId: 'realtime-av',
		port: 443,
		year: 2012,
		oneLiner:
			'The open standard for adaptive video streaming — MPEG-DASH powers Netflix, YouTube, and the open web.',
		overview: `MPEG-DASH is the vendor-neutral answer to Apple's proprietary HLS. Ratified as an ISO standard in 2012, DASH uses the same fundamental approach — chop video into segments, serve them over plain HTTP, and let the client adapt quality based on bandwidth — but with an open, extensible XML manifest format called the Media Presentation Description (MPD).

Where HLS uses Apple's M3U8 playlists, DASH uses MPD files with a rich hierarchy: Periods (time spans), Adaptation Sets (different languages or camera angles), Representations (quality levels), and Segments (the actual media chunks). This gives DASH more flexibility for complex use cases like ad insertion, multiple audio tracks, and subtitle streams.

Netflix, YouTube, Disney+, and most major streaming services use DASH (often alongside HLS for Apple compatibility). The protocol supports both on-demand and live streaming, and works with any codec.`,
		howItWorks: [
			{
				title: 'Encode and segment',
				description:
					'Video is encoded at multiple quality levels and split into small segments (2-10 seconds). Each quality level has its own set of segment files in fMP4 or WebM format.'
			},
			{
				title: 'MPD manifest generation',
				description:
					'An XML manifest (MPD) describes the content hierarchy: Periods, Adaptation Sets, Representations (bitrates/resolutions), and segment URLs or templates.'
			},
			{
				title: 'Client fetches MPD',
				description:
					'The DASH player downloads the MPD, parses the available options, and selects an initial quality level based on estimated bandwidth.'
			},
			{
				title: 'Adaptive segment fetching',
				description:
					'The player downloads segments via HTTP GET. After each download, it measures throughput and may switch quality for the next segment — seamless adaptation.'
			},
			{
				title: 'Live streaming with MPD updates',
				description:
					'For live content, the MPD includes a minimumUpdatePeriod. The player periodically re-fetches the MPD to discover new segments.'
			}
		],
		useCases: [
			'Video on demand (Netflix, Disney+, Amazon Prime Video)',
			'YouTube adaptive video playback',
			'Live streaming with adaptive bitrate',
			'DRM-protected content delivery (Widevine, PlayReady)',
			'Multi-language and multi-angle video experiences'
		],
		codeExample: {
			language: 'javascript',
			code: `import dashjs from 'dashjs';

// Initialize DASH player
const video = document.querySelector('video');
const player = dashjs.MediaPlayer().create();
player.initialize(video,
  'https://cdn.example.com/video/manifest.mpd', true);

// Monitor quality switches
player.on('qualityChangeRendered', (e) => {
  console.log('Quality:', e.mediaType, '-> level', e.newQuality);
});

// Configure adaptive bitrate settings
player.updateSettings({
  streaming: {
    abr: {
      autoSwitchBitrate: { video: true, audio: true },
      maxBitrate: { video: 8000 },  // kbps cap
    },
    buffer: { stableBufferTime: 12, bufferTimeAtTopQuality: 30 }
  }
});`,
			caption: 'dash.js plays MPEG-DASH content with automatic adaptive bitrate'
		},
		performance: {
			latency:
				'Standard: 10-30 seconds. Low-Latency DASH: 2-5 seconds with chunked transfer encoding.',
			throughput: 'Adaptive: typically 1-20 Mbps for video. CDN-backed for unlimited viewer scale.',
			overhead: 'HTTP headers per segment. MPD manifest is XML (typically 5-50 KB).'
		},
		connections: ['http1', 'http2', 'tls', 'hls'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP',
			official: 'https://dashif.org/'
		}
	}
];
