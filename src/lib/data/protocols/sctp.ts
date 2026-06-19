import type { Protocol } from '../types';

export const sctp: Protocol = {
	id: 'sctp',
	name: 'Stream Control Transmission Protocol',
	abbreviation: 'SCTP',
	categoryId: 'transport',
	port: undefined,
	year: 2000,
	rfc: 'RFC 9260',
	oneLiner:
		"Multi-streaming, {{multi-homing|multi-homing}} transport — [[tcp|TCP]]'s more capable but less popular cousin.",
	overview: `[[sctp|SCTP]] was designed for telecom {{signaling|signaling}} but offers features that both [[tcp|TCP]] and [[udp|UDP]] lack. It supports {{multiplexing|multiple independent streams}} within a single connection (like [[quic|QUIC]], but decades earlier), {{multi-homing|multi-homing}} (a connection can span multiple network interfaces for redundancy), and message boundaries (unlike [[tcp|TCP]]'s byte stream).

Despite its technical superiority in many aspects, [[sctp|SCTP]] never gained widespread adoption on the public internet because {{nat|NATs}} and {{firewall|firewalls}} typically don't understand it. However, it's widely used in telecom infrastructure (4G/5G networks use it extensively) and is used by [[webrtc|WebRTC]]'s data channels — though in [[webrtc|WebRTC]], [[sctp|SCTP]] doesn't run as a raw {{os|OS}}-level transport; instead it runs over {{dtls|DTLS}} over [[udp|UDP]], with the [[sctp|SCTP]] implementation in userspace.

[[sctp|SCTP]] provides the reliability of [[tcp|TCP]], the message-oriented nature of [[udp|UDP]], and several features that neither has — making it an interesting study in {{protocol|protocol}} design trade-offs and the power of network effects.`,
	howItWorks: [
		{
			title: '4-way handshake',
			description:
				"[[sctp|SCTP]] uses a 4-step {{handshake|handshake}} ({{init-chunk|INIT}}, {{init-chunk|INIT}}-{{ack|ACK}}, {{cookie|COOKIE}}-ECHO, {{cookie|COOKIE}}-{{ack|ACK}}) that prevents {{syn-flood|SYN flood}} attacks by design — no server state is allocated until the client proves it's real."
		},
		{
			title: 'Multi-streaming',
			description:
				"Multiple independent message streams share one association. A lost message on stream 1 doesn't block stream 2 — solving {{head-of-line-blocking|head-of-line blocking}}."
		},
		{
			title: 'Multi-homing',
			description:
				'An [[sctp|SCTP]] association can use multiple [[ip|IP]] addresses simultaneously. If one network path fails, traffic automatically shifts to another — built-in redundancy.'
		},
		{
			title: 'Message boundaries',
			description:
				'Unlike [[tcp|TCP]] (byte stream), [[sctp|SCTP]] preserves message boundaries. What you send as one message arrives as one message — no need for application-level framing.'
		}
	],
	useCases: [
		'Telecom signaling (SS7 over [[ip|IP]], Diameter)',
		'4G/5G mobile network infrastructure',
		'[[webrtc|WebRTC]] data channels (internally)',
		'High-availability systems requiring multi-homing',
		'Financial trading systems'
	],
	codeExample: {
		language: 'python',
		code: `import socket
import sctp

# Create an SCTP one-to-one style socket
sock = sctp.sctpsocket_tcp(socket.AF_INET)
sock.bind(('0.0.0.0', 3868))
sock.listen(5)

print("SCTP server listening on port 3868...")
conn, addr = sock.accept()
print(f"Association from {addr}")

# SCTP preserves message boundaries (unlike TCP)
data = conn.recv(4096)
conn.send(b"SCTP response with multi-streaming support")
conn.close()`,
		caption: '[[sctp|SCTP]] preserves message boundaries unlike [[tcp|TCP]] byte streams',
		alternatives: [
			{
				language: 'javascript',
				code: `// SCTP is used internally by WebRTC data channels
const pc = new RTCPeerConnection();

// Data channels use SCTP under the hood
const channel = pc.createDataChannel('chat', {
  ordered: true,      // SCTP ordered delivery
  maxRetransmits: 3   // SCTP partial reliability
});

channel.onopen = () => {
  // SCTP preserves message boundaries
  channel.send('Hello via SCTP data channel!');
};

channel.onmessage = (event) => {
  console.log('Received:', event.data);
};`
			},
			{
				language: 'cli',
				code: `# Test SCTP connectivity with ncat
ncat --sctp -l 3868  # Listen on SCTP port

# From another terminal, connect:
ncat --sctp localhost 3868

# Check SCTP associations (Linux)
cat /proc/net/sctp/assocs

# Monitor SCTP traffic
sudo tcpdump -i any sctp`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'INIT Handshake',
						code: `SCTP INIT Chunk:
  Src Port: 36412 → Dst Port: 36412
  Verification Tag: 0x00000000

  Chunk Type: INIT (1)
    Initiate Tag: 0xA1B2C3D4
    A-RWND: 65535
    Outbound Streams: 10
    Inbound Streams: 10
    Initial TSN: 1

SCTP INIT-ACK Chunk:
  Verification Tag: 0xA1B2C3D4

  Chunk Type: INIT-ACK (2)
    Initiate Tag: 0xE5F6A7B8
    A-RWND: 65535
    State Cookie: [248 bytes]`
					},
					{
						title: 'DATA Chunk',
						code: `SCTP DATA Chunk:
  Verification Tag: 0xE5F6A7B8

  Chunk Type: DATA (0)
    Flags: 0x03 (Begin + End)
    TSN: 1
    Stream ID: 0
    Stream Seq: 0
    Protocol ID: 0x00000042
    Payload (86 bytes):
      7b 22 74 79 70 65 22 3a  {"type":
      22 6d 65 73 73 61 67 65  "message
      22 2c 22 64 61 74 61 22  ","data"
      3a 22 48 65 6c 6c 6f 22  :"Hello"`
					}
				]
			}
		]
	},
	performance: {
		latency: '2 RTT for connection setup (4-way handshake) — slightly slower than TCP',
		throughput:
			'Comparable to TCP; multi-streaming can improve effective throughput for mixed traffic',
		overhead: '12-byte common header + chunk headers; slightly more than TCP'
	},
	connections: ['tcp', 'udp', 'webrtc'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Stream_Control_Transmission_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9260'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/SCTP-Multihoming.png/500px-SCTP-Multihoming.png',
		alt: 'Diagram showing SCTP multi-homing with a host connected to two different network paths for redundancy',
		caption:
			'[[sctp|SCTP]] {{multi-homing|multi-homing}} in action — a single [[sctp|SCTP]] association can span multiple [[ip|IP]] addresses and network interfaces. If one path fails, traffic seamlessly shifts to another, making [[sctp|SCTP]] the backbone of telecom {{signaling|signaling}} (4G/5G).',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
