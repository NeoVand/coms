import type { Protocol } from '../types';

export const tcp: Protocol = {
	id: 'tcp',
	name: 'Transmission Control Protocol',
	abbreviation: 'TCP',
	categoryId: 'transport',
	port: undefined,
	year: 1981,
	rfc: 'RFC 9293',
	oneLiner: 'Guarantees ordered, reliable delivery of data between applications.',
	overview: `TCP is the backbone of the internet. When you load a webpage, send an email, or download a file, TCP ensures every single byte arrives correctly and in order. It does this by {{connection-oriented|establishing a connection}} between sender and receiver before any data flows — like a phone call where both sides confirm they can hear each other. TCP is inherently {{stateful|stateful}}: each connection tracks sequence numbers, acknowledgments, window sizes, and retransmission timers throughout its lifetime.

Unlike [[udp|UDP]], TCP will detect lost {{packet|packets}} and {{retransmission|retransmit}} them. It also implements {{flow-control|flow control}} (so a fast sender doesn't overwhelm a slow receiver) and {{congestion-control|congestion control}} (so the network itself doesn't get overloaded). TCP's congestion control has evolved over the decades — from the original Tahoe and Reno algorithms through CUBIC (still the Linux default) to Google's BBR, which models the path's bottleneck bandwidth and RTT instead of treating loss as the only signal. BBRv3 has been the default for google.com and YouTube since 2023. This reliability comes at a cost: extra round trips and overhead, which is why {{latency|latency}}-sensitive applications sometimes prefer [[udp|UDP]].

TCP operates at Layer 4 (Transport) of the {{osi-model|OSI model}} and is identified by protocol number 6 in the IP header. Nearly every major internet application — [[http1|HTTP]], [[ssh|SSH]], [[ftp|FTP]], [[smtp|SMTP]] — runs on top of TCP.`,
	howItWorks: [
		{
			title: 'SYN — Client initiates',
			description:
				'The client sends a SYN (synchronize) packet to the server, proposing an initial sequence number. This is the "Hey, can we talk?" message.'
		},
		{
			title: 'SYN-ACK — Server responds',
			description:
				'The server responds with SYN-ACK, acknowledging the client\'s sequence number and proposing its own. "Yes, I hear you. Can you hear me?"'
		},
		{
			title: 'ACK — Connection established',
			description:
				"The client sends an ACK confirming the server's sequence number. The three-way handshake is complete — data can now flow."
		},
		{
			title: 'Data transfer',
			description:
				'Data flows in ordered segments. Each segment is acknowledged; lost segments trigger retransmission after a timeout or duplicate ACKs. A sliding window controls how much data can be in flight, and congestion control algorithms (slow start, congestion avoidance) dynamically adjust the sending rate to avoid overwhelming the network.'
		},
		{
			title: 'FIN — Graceful close',
			description:
				'Either side sends a FIN to close the connection. The other side acknowledges and sends its own FIN. Both sides confirm — connection closed cleanly.'
		}
	],
	useCases: [
		'Web browsing (HTTP/HTTPS)',
		'Email (SMTP, IMAP, POP3)',
		'File transfer (FTP, SFTP)',
		'Remote access (SSH)',
		'Database connections (MySQL, PostgreSQL)'
	],
	codeExample: {
		language: 'python',
		code: `import socket

# Create a TCP socket
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 8080))
server.listen(1)

print("Waiting for connection...")
conn, addr = server.accept()  # 3-way handshake happens here
print(f"Connected by {addr}")

data = conn.recv(1024)  # Reliable, ordered delivery
conn.sendall(b"Hello back!")
conn.close()  # FIN sequence`,
		caption: 'A minimal TCP server — the 3-way handshake happens automatically inside accept()',
		alternatives: [
			{
				language: 'javascript',
				code: `const net = require('node:net');

// Create a TCP server
const server = net.createServer((socket) => {
  console.log('Client connected:', socket.remoteAddress);

  socket.on('data', (data) => {
    console.log('Received:', data.toString());
    socket.write('Hello back!');
  });

  socket.on('end', () => console.log('Client disconnected'));
});

server.listen(8080, () => {
  console.log('Listening on port 8080');
});`
			},
			{
				language: 'cli',
				code: `# Listen on a TCP port
nc -l 8080

# Connect to a TCP server
nc localhost 8080

# Send data through a TCP connection
echo "Hello" | nc localhost 8080

# Check if a TCP port is open
nc -zv example.com 80

# Monitor TCP connections
ss -tn  # or: netstat -tn`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Three-Way Handshake',
						code: `Client → Server  [SYN]
  Seq=0, Win=65535, MSS=1460
  Flags: 0x002 (SYN)

Server → Client  [SYN, ACK]
  Seq=0, Ack=1, Win=65535, MSS=1460
  Flags: 0x012 (SYN, ACK)

Client → Server  [ACK]
  Seq=1, Ack=1, Win=65535
  Flags: 0x010 (ACK)`
					},
					{
						title: 'Data Segment',
						code: `TCP Segment:
  Src Port: 52431 → Dst Port: 443
  Seq: 1, Ack: 1, Len: 347
  Flags: 0x018 (PSH, ACK)
  Window: 65535
  Checksum: 0xa3f1 [valid]
  Options: [Timestamps: TSval=123456, TSecr=654321]
  Payload (347 bytes):
    47 45 54 20 2f 61 70 69  GET /api
    2f 75 73 65 72 73 20 48  /users H
    54 54 50 2f 31 2e 31 0d  TTP/1.1.`
					},
					{
						title: 'Connection Close',
						code: `Client → Server  [FIN, ACK]
  Seq=348, Ack=892, Flags: 0x011

Server → Client  [ACK]
  Seq=892, Ack=349, Flags: 0x010

Server → Client  [FIN, ACK]
  Seq=892, Ack=349, Flags: 0x011

Client → Server  [ACK]
  Seq=349, Ack=893, Flags: 0x010`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 RTT for TCP handshake (additional RTTs come from TLS, not TCP itself), then ~0.5 RTT per data exchange',
		throughput: 'Limited by congestion window; typically reaches line speed on stable connections',
		overhead:
			'20-byte header minimum + options; 32 bytes with timestamps (20-byte header + 12-byte timestamp option)'
	},
	connections: [
		'udp',
		'ip',
		'ipv6',
		'tls',
		'http1',
		'http2',
		'websockets',
		'ssh',
		'smtp',
		'ftp',
		'bgp',
		'imap'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9293'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tcp_state_diagram.svg/500px-Tcp_state_diagram.svg.png',
		alt: 'TCP finite state machine diagram showing all connection states from CLOSED through ESTABLISHED to TIME_WAIT',
		caption:
			'The TCP state machine — every TCP connection transitions through these states. From the three-way handshake (SYN → SYN-ACK → ACK) to graceful teardown (FIN → FIN-ACK), this diagram maps the full lifecycle of a TCP connection.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
