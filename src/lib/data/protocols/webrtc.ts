import type { Protocol } from '../types';

export const webrtc: Protocol = {
	id: 'webrtc',
	name: 'Web Real-Time Communication',
	abbreviation: 'WebRTC',
	categoryId: 'realtime-av',
	port: undefined,
	year: 2011,
	rfc: 'RFC 8825',
	oneLiner: 'Peer-to-peer audio, video, and data — directly between browsers, no plugins needed.',
	overview: `WebRTC is the technology that makes browser-based video calls possible. Before WebRTC, real-time communication required plugins (Flash, Java applets) or native apps. Now, two browsers can establish a direct, encrypted, {{peer-to-peer|peer-to-peer}} connection for audio, video, and arbitrary data.

The key insight is "peer-to-peer" — once the connection is established, data flows directly between users without passing through a server. This reduces {{latency|latency}} and server costs. However, establishing that connection requires a {{signaling|signaling server}} (to exchange connection offers) and often STUN/TURN servers to navigate {{nat|NATs}} and {{firewall|firewalls}}. STUN (Session Traversal Utilities for NAT) discovers the peer's public IP address. TURN (Traversal Using Relays around NAT) relays media through a server when a direct connection fails (about 10-15% of cases). ICE (Interactive Connectivity Establishment) coordinates both STUN and TURN to find the best available path between peers.

Under the hood, WebRTC is actually a bundle of protocols: ICE for connectivity establishment, DTLS (based on [[tls|TLS]]) for encryption, {{srtp|SRTP}} (secured [[rtp|RTP]]) for media, and [[sctp|SCTP]] for data channels. The browser API abstracts all of this into a relatively simple JavaScript interface.`,
	howItWorks: [
		{
			title: 'Signaling',
			description:
				'Peers exchange "offers" and "answers" ([[sdp|SDP]] descriptions of their capabilities) through a signaling server (WebSocket, HTTP, or even carrier pigeon — WebRTC doesn\'t care how).'
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
				'Audio/video flows via SRTP (Secure [[rtp|RTP]]) directly between peers. Data channels use [[sctp|SCTP]] over DTLS for reliable or unreliable data transfer.'
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
		language: 'python',
		code: `import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

async def main():
    pc = RTCPeerConnection()

    # Add local media (webcam/mic or file)
    player = MediaPlayer('/dev/video0')
    if player.audio:
        pc.addTrack(player.audio)
    if player.video:
        pc.addTrack(player.video)

    # Create offer
    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    print("SDP Offer:", pc.localDescription.sdp)

    # Send offer to remote peer via signaling...

asyncio.run(main())`,
		caption:
			'Get camera access, create an offer, and signal — WebRTC handles the rest peer-to-peer',
		alternatives: [
			{
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
signalingServer.send(JSON.stringify(offer));`
			},
			{
				language: 'cli',
				code: `# Test STUN server connectivity
stun stun.l.google.com:19302

# Stream webcam via GStreamer + WebRTC
gst-launch-1.0 v4l2src ! videoconvert ! \\
  vp8enc ! rtpvp8pay ! \\
  webrtcbin name=sendrecv

# Capture WebRTC traffic for debugging
sudo tcpdump -i any udp portrange 49152-65535 -w webrtc.pcap

# Check TURN server with turnutils
turnutils_uclient -u user -w pass turn.example.com`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'ICE Candidate (SDP)',
						code: `a=candidate:842163049 1 udp 1677729535
  192.168.1.100 52042 typ srflx
  raddr 10.0.0.1 rport 52042
  generation 0
  ufrag EsAw
  network-cost 50

Candidate breakdown:
  Foundation: 842163049
  Component: RTP (1)
  Transport: UDP
  Priority: 1677729535
  Address: 192.168.1.100:52042
  Type: Server Reflexive (srflx)
  Related: 10.0.0.1:52042`
					},
					{
						title: 'STUN Binding Request',
						code: `STUN Message:
  Type: Binding Request (0x0001)
  Length: 56 bytes
  Transaction ID: 0xA1B2C3D4E5F6...

  Attributes:
    USERNAME: "EsAw:FGhI"
    ICE-CONTROLLING: 0x1234567890ABCDEF
    PRIORITY: 1845501695
    MESSAGE-INTEGRITY: [20 bytes HMAC-SHA1]
    FINGERPRINT: 0xE57A3BCF

STUN Response:
  Type: Binding Success (0x0101)
  Transaction ID: 0xA1B2C3D4E5F6...

  Attributes:
    XOR-MAPPED-ADDRESS: 203.0.113.5:62000
    MESSAGE-INTEGRITY: [20 bytes]
    FINGERPRINT: 0xA4B3C2D1`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Connection setup: 2-5 seconds (ICE + DTLS). Media latency: 50-150ms peer-to-peer.',
		throughput:
			'Adaptive bitrate: 100kbps (audio) to 4+ Mbps (HD video). Adjusts to network conditions.',
		overhead:
			'SRTP adds ~10 bytes authentication tag per packet (80-bit default). DTLS handshake is one-time cost.'
	},
	connections: ['udp', 'tls', 'sip', 'sctp', 'rtp', 'sdp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/WebRTC',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8825',
		official: 'https://webrtc.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Video_Conference_Using_Laptop.jpg/500px-Video_Conference_Using_Laptop.jpg',
		alt: 'Person participating in a video conference on a laptop, demonstrating WebRTC-powered real-time communication',
		caption:
			'WebRTC made this possible directly in the browser — no plugins, no downloads. Peer-to-peer video calls, screen sharing, and data channels all run natively in Chrome, Firefox, and Safari.',
		credit: 'Photo: Visuals / CC BY 2.0, via Wikimedia Commons'
	}
};
