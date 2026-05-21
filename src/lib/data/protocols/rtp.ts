import type { Protocol } from '../types';

export const rtp: Protocol = {
	id: 'rtp',
	name: 'Real-time Transport Protocol',
	abbreviation: 'RTP',
	categoryId: 'realtime-av',
	port: undefined,
	year: 1996,
	rfc: 'RFC 3550',
	oneLiner: 'The standard way to deliver audio and video packets in real-time over [[udp|UDP]].',
	overview: `[[rtp|RTP]] is the workhorse behind virtually all real-time audio and video on the internet. [[webrtc|WebRTC]] uses it (as {{srtp|SRTP}}). {{voip|VoIP}} phones use it. Video conferencing systems use it. It provides the essential services that raw [[udp|UDP]] lacks for media: timestamps (for synchronization), {{sequence-number|sequence numbers}} (for reordering and loss detection), and {{payload|payload}} type identification.

[[rtp|RTP]] doesn't guarantee delivery — it runs over [[udp|UDP]] intentionally. Instead, it gives the application enough information to handle problems intelligently. The companion protocol {{rtcp|RTCP}} ([[rtp|RTP]] Control Protocol) runs alongside [[rtp|RTP]], carrying statistics about packet loss, {{jitter|jitter}}, and {{rtt|round-trip time}} so endpoints can adapt their encoding in real time.

Think of [[rtp|RTP]] as the envelope for media packets and {{rtcp|RTCP}} as the feedback channel. Together, they enable adaptive, real-time communication that gracefully handles network imperfections.`,
	howItWorks: [
		{
			title: 'Session establishment',
			description:
				"[[rtp|RTP]] itself doesn't handle session setup — that's done by a {{signaling|signaling}} protocol ([[sip|SIP]], [[webrtc|WebRTC]]'s [[sdp|SDP]]). The {{signaling|signaling}} determines ports, codecs, and parameters."
		},
		{
			title: 'Packetize media',
			description:
				'Audio/video frames are split into [[rtp|RTP]] packets, each with a timestamp, {{sequence-number|sequence number}}, and {{payload|payload}} type. Packets are sent over [[udp|UDP]].'
		},
		{
			title: 'Receiver buffers and orders',
			description:
				'The receiver uses sequence numbers to detect loss and reorder packets. A {{jitter|jitter}} buffer smooths out timing variations before playback.'
		},
		{
			title: 'RTCP feedback',
			description:
				'Receiver periodically sends {{rtcp|RTCP}} reports: packets received, loss rate, {{jitter|jitter}}. The sender uses this to adjust bitrate, {{codec|codec}}, or error correction.'
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
			'Raw [[rtp|RTP]] packet construction — 12-byte header with {{sequence-number|sequence number}} and timestamp for media ordering',
		alternatives: [
			{
				language: 'javascript',
				code: `// RTP is handled internally by WebRTC in browsers
const pc = new RTCPeerConnection();

// Add media — browser handles RTP packetization
const stream = await navigator.mediaDevices
  .getUserMedia({ audio: true });
const track = stream.getAudioTracks()[0];
const sender = pc.addTrack(track, stream);

// Access RTP statistics via getStats()
const stats = await sender.getStats();
stats.forEach((report) => {
  if (report.type === 'outbound-rtp') {
    console.log('Packets sent:', report.packetsSent);
    console.log('Bytes sent:', report.bytesSent);
    console.log('Codec:', report.codecId);
  }
});`
			},
			{
				language: 'cli',
				code: `# Send a test RTP stream with ffmpeg
ffmpeg -re -i input.mp4 \\
  -c:v libx264 -preset ultrafast \\
  -c:a libopus \\
  -f rtp rtp://192.168.1.100:5004

# Receive and play an RTP stream
ffplay rtp://0.0.0.0:5004 -protocol_whitelist rtp,udp

# Capture RTP packets for analysis
tcpdump -i eth0 udp port 5004 -w rtp_capture.pcap`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'RTP Packet Header',
						code: `RTP Packet:
   0                   1                   2                   3
   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |V=2|P|X| CC=0  |M|   PT=111   |      Seq Number: 48320       |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                   Timestamp: 160000                           |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                      SSRC: 0x12345678                         |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                      Opus Audio Payload                       |
  |                        (160 bytes)                            |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  V=2 (RTP version 2)
  PT=111 (Opus audio)
  M=0 (not marked)`
					},
					{
						title: 'RTCP Sender Report',
						code: `RTCP Sender Report:
   0                   1                   2                   3
   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |V=2|P| RC=1  |  PT=200 (SR)  |         Length: 12            |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                     SSRC: 0x12345678                          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |          NTP Timestamp (seconds): 3917252486                  |
  |          NTP Timestamp (fraction): 2147483648                 |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |              RTP Timestamp: 320000                            |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |          Packet Count: 1000  |  Octet Count: 160000          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`
					}
				]
			}
		]
	},
	performance: {
		latency: 'No connection setup (UDP). End-to-end typically 50-300ms including jitter buffering.',
		throughput:
			'Adaptive: codec and bitrate adjust based on RTCP feedback. Audio: 8-128kbps. Video: 100kbps-10+Mbps.',
		overhead: '12-byte RTP header per packet. RTCP reports are periodic and small.'
	},
	connections: ['udp', 'webrtc', 'sip', 'sdp', 'nat-traversal'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Real-time_Transport_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc3550'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg/500px-SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg',
		alt: 'Henning Schulzrinne, co-creator of RTP, speaking at SIPNOC 2012',
		caption:
			'Henning Schulzrinne co-authored [[rtp|RTP]] ([[rfc:3550|RFC 3550]]) and [[sip|SIP]] — two protocols that underpin modern {{voip|VoIP}} and video conferencing. He later served as CTO of the {{fcc|FCC}}.',
		credit: 'Photo: SIPNOC / CC BY 2.0, via Wikimedia Commons'
	}
};
