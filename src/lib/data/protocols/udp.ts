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
				'Unlike TCP, UDP has no connection setup. The sender just starts blasting packets immediately — no SYN, no waiting.'
		},
		{
			title: 'Datagram sent',
			description:
				"Each UDP message (datagram) is self-contained with source port, destination port, length, and checksum. It either arrives or it doesn't."
		},
		{
			title: 'No acknowledgment',
			description:
				'The receiver never sends an ACK. The sender has no idea if the packet arrived, was duplicated, or arrived out of order.'
		},
		{
			title: 'Application handles reliability',
			description:
				'If an app needs reliability over UDP (like QUIC or game networking), it builds its own retry/ordering logic on top.'
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
		caption: 'UDP is connectionless — just bind, send, and hope for the best',
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
			'The ARPANET in 1974 — the network where UDP was born. While TCP guaranteed delivery, UDP offered raw speed for the applications that needed it most.',
		credit: 'Image: ARPANET / Public Domain, via Wikimedia Commons'
	}
};
