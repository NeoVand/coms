import type { Protocol } from '../types';

export const udp: Protocol = {
	id: 'udp',
	name: 'User Datagram Protocol',
	abbreviation: 'UDP',
	categoryId: 'transport',
	port: undefined,
	year: 1980,
	rfc: 'RFC 768',
	oneLiner: 'Fire-and-forget delivery — fast but with no guarantees.',
	overview: `UDP is [[tcp|TCP]]'s carefree sibling. It sends data {{connectionless|without establishing a connection}}, without checking if it arrived, and without caring about order. This sounds unreliable (and it is), but that's exactly why it's useful — sometimes speed matters more than perfection.

Think of a live video call: if one frame is lost, it's better to show the next frame than to pause and wait for {{retransmission|retransmission}}. UDP enables this by stripping away all of [[tcp|TCP]]'s reliability mechanisms, leaving a bare-minimum 8-byte header. Applications that use UDP typically implement their own reliability on top (like [[quic|QUIC]] does) or simply tolerate some loss.

UDP is essential for [[dns|DNS]] lookups (where speed matters and the payload fits in one {{datagram|packet}}), online gaming (where stale data is useless), live streaming, and VoIP. It operates at {{osi-model|Layer 4}} alongside [[tcp|TCP]] and is identified by protocol number 17.`,
	howItWorks: [
		{
			title: 'No handshake',
			description:
				'Unlike [[tcp|TCP]], UDP has no connection setup or {{handshake|handshake}}. The sender just starts blasting packets immediately — no SYN, no waiting.'
		},
		{
			title: 'Datagram sent',
			description:
				"Each UDP message ({{datagram|datagram}}) is self-contained with source port, destination port, length, and {{checksum|checksum}}. It either arrives or it doesn't."
		},
		{
			title: 'No acknowledgment',
			description:
				'The receiver never sends an ACK. The sender has no idea if the packet arrived, was duplicated, or arrived out of order.'
		},
		{
			title: 'Application handles reliability',
			description:
				'If an app needs reliability over UDP (like [[quic|QUIC]] or game networking), it builds its own retry/ordering logic on top.'
		}
	],
	useCases: [
		'DNS lookups (fast single-packet queries)',
		'Online gaming (real-time state updates)',
		'Voice over IP (VoIP) and video calls',
		'Live video streaming',
		'IoT sensor data transmission'
	],
	codeExample: {
		language: 'python',
		code: `import socket

# Create a UDP socket — no connection needed
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('localhost', 9999))

# Just send — no handshake, no guarantee
sock.sendto(b"Ping!", ('localhost', 8888))

# Receive — might never arrive
data, addr = sock.recvfrom(1024)
print(f"Got {data} from {addr}")`,
		caption: 'UDP is {{connectionless|connectionless}} — just bind, send, and hope for the best',
		alternatives: [
			{
				language: 'javascript',
				code: `const dgram = require('node:dgram');

// Create a UDP socket
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(\`Got \${msg} from \${rinfo.address}:\${rinfo.port}\`);
  // Send a reply — no connection, just fire
  server.send('Pong!', rinfo.port, rinfo.address);
});

server.bind(9999, () => {
  console.log('Listening on UDP port 9999');
  // Send a datagram — no handshake needed
  server.send('Ping!', 8888, 'localhost');
});`
			},
			{
				language: 'cli',
				code: `# Listen on a UDP port
nc -u -l 9999

# Send a UDP datagram
echo "Ping!" | nc -u localhost 9999

# Send UDP packets with socat
echo "Hello" | socat - UDP:localhost:9999

# Monitor UDP traffic
sudo tcpdump -i lo0 udp port 9999

# Check UDP port statistics
ss -un  # or: netstat -un`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Datagram Format',
						code: `UDP Datagram:
  Src Port: 52431
  Dst Port: 53
  Length: 42 bytes
  Checksum: 0xfe37

  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |     Src Port    |   Dst Port    |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |     Length      |   Checksum    |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |            Payload ...          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`
					},
					{
						title: 'DNS Query over UDP',
						code: `UDP Payload (DNS Query):
  Transaction ID: 0xA1B2
  Flags: 0x0100 (Standard query)
  Questions: 1

  Query:
    Name: example.com
    Type: A (1)
    Class: IN (1)

  Wire bytes:
    a1 b2 01 00 00 01 00 00
    00 00 00 00 07 65 78 61
    6d 70 6c 65 03 63 6f 6d
    00 00 01 00 01`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Zero connection setup; single RTT for request-response',
		throughput: 'No congestion control — can send as fast as the network allows (or can handle)',
		overhead: '8-byte header only — the minimum possible for transport'
	},
	connections: ['tcp', 'ip', 'ipv6', 'dns', 'quic', 'webrtc', 'dhcp', 'ntp', 'rtp', 'coap', 'sip'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/User_Datagram_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc768'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Arpanet_1974.svg/500px-Arpanet_1974.svg.png',
		alt: 'Map of the ARPANET in 1974, showing interconnected nodes across the United States',
		caption:
			'The ARPANET in 1974 — the network where UDP was born. While [[tcp|TCP]] guaranteed delivery, UDP offered raw speed for the applications that needed it most.',
		credit: 'Image: ARPANET / Public Domain, via Wikimedia Commons'
	},

	recentChanges: [
		{
			date: '2024-2026',
			title: 'UDP rises with QUIC',
			description:
				'Almost all internet UDP traffic growth in the last five years has been [[quic|QUIC]]. Where UDP used to be a niche transport ([[dns|DNS]], [[ntp|NTP]], [[rtp|RTP]]), it now carries the majority of [[http3|HTTP/3]] traffic plus the entire next generation of media transports.'
		},
		{
			date: '2025',
			title: 'Linux io_uring + UDP zero-copy',
			description:
				'io_uring zero-copy send/receive paths land for UDP in Linux 6.13, dramatically improving [[quic|QUIC]] performance on high-throughput servers.'
		}
	],

	realWorldDeployments: [
		{
			org: 'DNS root + recursive resolvers',
			scale: '~14 trillion queries/day (Google 8.8.8.8 alone)',
			description:
				'Every [[dns|DNS]] query/response is one UDP datagram each way. The recursive resolver fleet is the largest UDP application by query count.'
		},
		{
			org: 'NTP pool',
			scale: '~25 billion queries/day',
			description:
				'pool.ntp.org and friends serve tens of billions of UDP [[ntp|NTP]] queries per day, keeping the world\'s clocks within a few milliseconds.'
		},
		{
			org: 'WebRTC media',
			scale: 'Every Zoom / Discord / FaceTime call',
			description:
				'RTP-over-UDP carries audio/video for every peer-to-peer media call. Late audio is worse than missing audio — UDP\'s "fire and pray" semantics are exactly what [[rtp|RTP]] needs.'
		},
		{
			org: 'QUIC / HTTP/3',
			scale: '>50% of Chrome traffic, >75% of Meta',
			description:
				'The largest single application of UDP today. Every [[quic|QUIC]] packet rides inside a UDP datagram; the user-space transport handles reliability, congestion, and crypto above it.'
		}
	],

	funFacts: [
		{
			title: 'RFC 768 is three pages long',
			text: 'UDP\'s entire spec — header format, length field, checksum, and a paragraph of prose — fits in three pages. [[pioneer:jon-postel|Jon Postel]] wrote it in August 1980. It has not been updated since. There has been nothing to update.'
		},
		{
			title: 'UDP gives you ports — that is most of L4',
			text: 'The only thing UDP adds above raw [[ip|IP]] is the source/destination port pair. That is the entire reason multiple applications can share a host\'s network adapter. Everything else (reliability, ordering, congestion) is left to the application above.'
		},
		{
			title: 'UDP is what middleboxes already pass',
			text: '[[quic|QUIC]] runs over UDP not because UDP is great, but because middleboxes (NAT routers, firewalls, transparent proxies) already forward UDP unchanged. [[sctp|SCTP]] is a "better" transport in many ways, but it cannot traverse the public internet because middleboxes drop unknown protocol numbers. UDP is the deployment substrate.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'No congestion control by default',
				text: 'UDP applications must implement {{congestion-control|congestion control}} themselves, or risk being a bad citizen. Sending UDP at line rate without backoff is what brought the internet down in 1986. Use a transport library ([[quic|QUIC]], [[rtp|RTP]] with feedback) rather than rolling your own.'
			},
			{
				title: 'Fragmentation = unreliable delivery',
				text: 'UDP datagrams larger than the path {{mtu|MTU}} get {{fragmentation|fragmented}} at the IP layer. If any one fragment is dropped, the entire datagram is lost (no per-fragment retransmit). Cure: keep UDP payloads under ~1400 bytes for safety, or use {{path-mtu-discovery|Path MTU Discovery}} and resend at the application layer.'
			},
			{
				title: 'Source port matters for NAT pinholes',
				text: 'A NAT router opens a "pinhole" for outbound UDP keyed by (src IP, src port). The pinhole closes after a few minutes of silence. For long-lived UDP applications (VoIP, IoT keepalives), send a keepalive every 30-60 seconds to keep the pinhole open.'
			}
		]
	}
};
