import type { Protocol } from '../types';

export const sdp: Protocol = {
	id: 'sdp',
	name: 'Session Description Protocol',
	abbreviation: 'SDP',
	categoryId: 'realtime-av',
	year: 1998,
	rfc: 'RFC 8866',
	oneLiner:
		'The universal format for describing multimedia sessions — the matchmaker behind every [[webrtc|WebRTC]] and VoIP call.',
	overview: `[[sdp|SDP]] doesn't carry a single byte of audio or video. Instead, it's the language that endpoints use to describe what they can do — {{codec|codecs}} they support, [[ip|IP]] addresses they're reachable at, {{bandwidth|bandwidth}} they expect, and {{encryption|encryption}} keys they'll use. Think of it as a dating profile for media sessions.

Originally published in 1998 as [[rfc:2327|RFC 2327]] for the Mbone ({{multicast|multicast}} backbone) conferencing community, [[sdp|SDP]] found its true calling as the session description format for [[sip|SIP]] and later [[webrtc|WebRTC]]. Every time you join a video call in your browser, an [[sdp|SDP]] "offer" and "answer" are exchanged behind the scenes to {{content-negotiation|negotiate}} what media will flow and how.

The format is deceptively simple — plain text with single-letter field identifiers (v= for version, o= for origin, m= for media, a= for attributes). But this simplicity hides enormous complexity: [[sdp|SDP]] extensions handle ICE candidates, {{dtls|DTLS}} (based on [[tls|TLS]]) fingerprints, simulcast layers, {{codec|codec}} parameters, and dozens of other modern requirements.`,
	howItWorks: [
		{
			title: 'Session description created',
			description:
				'The initiator generates an [[sdp|SDP]] document describing the session: version, originator, session name, timing, and one or more media descriptions.'
		},
		{
			title: 'Media lines define streams',
			description:
				'Each "m=" line declares a media type (audio, video), transport protocol ([[rtp|RTP]]/SAVPF), port number, and list of supported {{codec|codec}} {{payload|payload}} types.'
		},
		{
			title: 'Attributes add detail',
			description:
				'Attribute lines (a=) specify {{codec|codec}} parameters, ICE credentials, {{dtls|DTLS}} fingerprints, {{bandwidth|bandwidth}} limits, and direction (sendrecv, recvonly).'
		},
		{
			title: 'Offer/answer exchange',
			description:
				'One peer sends an [[sdp|SDP]] "offer" and the other responds with an [[sdp|SDP]] "answer." Each side picks compatible codecs and transport parameters.'
		},
		{
			title: 'Session established',
			description:
				'Once both sides have exchanged and accepted [[sdp|SDP]], media streams ([[rtp|RTP]]) and data channels ([[sctp|SCTP]]) begin flowing according to the negotiated parameters.'
		}
	],
	useCases: [
		'[[webrtc|WebRTC]] peer connection negotiation (offer/answer)',
		'[[sip|SIP]] call setup (INVITE body)',
		'Video conferencing session initialization',
		'{{multicast|Multicast}} session announcements (SAP)',
		'Streaming media session descriptions (RTSP)'
	],
	codeExample: {
		language: 'python',
		code: `import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription

async def main():
    pc = RTCPeerConnection()

    # Create and inspect an SDP offer
    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    # Parse the SDP fields
    for line in pc.localDescription.sdp.split('\\n'):
        if line.startswith('m='):
            print(f"Media: {line}")      # m=audio, m=video
        elif line.startswith('a=rtpmap'):
            print(f"Codec: {line}")      # codec details
        elif line.startswith('a=candidate'):
            print(f"ICE: {line}")        # network candidates

    # Set the remote answer
    answer = RTCSessionDescription(sdp=remote_sdp, type='answer')
    await pc.setRemoteDescription(answer)

asyncio.run(main())`,
		caption: '[[webrtc|WebRTC]] [[sdp|SDP]] offer/answer — [[sdp|SDP]] is generated automatically from your media tracks',
		alternatives: [
			{
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

// Receive answer from remote peer
const answer = await signalingChannel.receiveAnswer();
await pc.setRemoteDescription(answer);`
			},
			{
				language: 'cli',
				code: `# Inspect SDP in a WebRTC session (browser DevTools)
# chrome://webrtc-internals

# Generate an SDP offer with GStreamer
gst-launch-1.0 webrtcbin name=sendrecv \\
  ! fakesink dump=true

# Analyze SDP in a pcap file
tshark -r capture.pcap -Y "sdp" \\
  -T fields -e sdp.media`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Offer',
						code: `v=0
o=- 4858436212 2 IN IP4 0.0.0.0
s=-
t=0 0
a=group:BUNDLE 0 1
a=ice-options:trickle

m=audio 9 UDP/TLS/RTP/SAVPF 111 103 9 0
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:EsAw
a=ice-pwd:bP+XJMM09aR8AiX1jdukzR6Y
a=fingerprint:sha-256 D1:D2:D3:...
a=setup:actpass
a=mid:0
a=sendrecv
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1

m=video 9 UDP/TLS/RTP/SAVPF 96 97
c=IN IP4 0.0.0.0
a=mid:1
a=sendrecv
a=rtpmap:96 VP8/90000
a=rtpmap:97 H264/90000
a=rtcp-fb:96 nack pli`
					},
					{
						title: 'Answer',
						code: `v=0
o=- 7648490138 2 IN IP4 0.0.0.0
s=-
t=0 0
a=group:BUNDLE 0 1

m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=ice-ufrag:FGhI
a=ice-pwd:xR7Yt5KmN2pQ8wE3vB9sL1oA
a=fingerprint:sha-256 A4:B5:C6:...
a=setup:active
a=mid:0
a=sendrecv
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1

m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=mid:1
a=sendrecv
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 nack pli`
					}
				]
			}
		]
	},
	performance: {
		latency: 'SDP itself adds no latency — exchanged during signaling, before media flows.',
		throughput: 'Text documents typically 1-5 KB. Negligible compared to the media it describes.',
		overhead:
			'Plain text format is verbose but human-readable. Binary alternatives exist but are rare.'
	},
	connections: ['webrtc', 'sip', 'rtp', 'nat-traversal'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Session_Description_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8866'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Early_CTS-3000_Prototype.jpg/500px-Early_CTS-3000_Prototype.jpg',
		alt: 'Early Cisco TelePresence CTS-3000 prototype, a high-end video conferencing system',
		caption:
			'The Cisco TelePresence CTS-3000 prototype — the kind of immersive video conferencing system that relies on [[sdp|SDP]] to negotiate media capabilities. [[sdp|SDP]] describes codecs, network addresses, and media types so endpoints can agree on how to communicate.',
		credit: 'Photo: Cisco Systems / CC BY 2.0, via Wikimedia Commons'
	}
};
