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
	overview: `[[tcp|TCP]] is the backbone of the internet. When you load a webpage, send an email, or download a file, [[tcp|TCP]] ensures every single byte arrives correctly and in order. It does this by {{connection-oriented|establishing a connection}} between sender and receiver before any data flows — like a phone call where both sides confirm they can hear each other. [[tcp|TCP]] is inherently {{stateful|stateful}}: each connection tracks sequence numbers, acknowledgments, window sizes, and {{retransmission|retransmission}} timers throughout its lifetime.

Unlike [[udp|UDP]], [[tcp|TCP]] will detect lost {{packet|packets}} and {{retransmission|retransmit}} them. It also implements {{flow-control|flow control}} (so a fast sender doesn't overwhelm a slow receiver) and {{congestion-control|congestion control}} (so the network itself doesn't get overloaded). [[tcp|TCP]]'s {{congestion-control|congestion control}} has evolved over the decades — from the original Tahoe and Reno algorithms through {{cubic|CUBIC}} (still the {{linux|Linux}} default) to {{google|Google}}'s {{bbr|BBR}}, which models the path's bottleneck {{bandwidth|bandwidth}} and {{rtt|RTT}} instead of treating loss as the only signal. {{bbrv3|BBRv3}} has been the default for {{google|google}}.com and YouTube since 2023. This reliability comes at a cost: extra round trips and overhead, which is why {{latency|latency}}-sensitive applications sometimes prefer [[udp|UDP]].

[[tcp|TCP]] operates at Layer 4 (Transport) of the {{osi-model|OSI model}} and is identified by protocol number 6 in the [[ip|IP]] header. Nearly every major internet application — [[http1|HTTP]], [[ssh|SSH]], [[ftp|FTP]], [[smtp|SMTP]] — runs on top of [[tcp|TCP]].`,
	howItWorks: [
		{
			title: 'SYN — Client initiates',
			description:
				'The client sends a {{syn-cookies|SYN}} (synchronize) packet to the server, proposing an initial {{sequence-number|sequence number}}. This is the "Hey, can we talk?" message.'
		},
		{
			title: 'SYN-ACK — Server responds',
			description:
				'The server responds with {{syn-cookies|SYN}}-{{ack|ACK}}, acknowledging the client\'s {{sequence-number|sequence number}} and proposing its own. "Yes, I hear you. Can you hear me?"'
		},
		{
			title: 'ACK — Connection established',
			description:
				"The client sends an {{ack|ACK}} confirming the server's {{sequence-number|sequence number}}. The {{three-way-handshake|three-way handshake}} is complete — data can now flow."
		},
		{
			title: 'Data transfer',
			description:
				'Data flows in ordered segments. Each segment is acknowledged; lost segments trigger {{retransmission|retransmission}} after a timeout or duplicate ACKs. A {{sliding-window|sliding window}} controls how much data can be in flight, and {{congestion-control|congestion control}} algorithms ({{slow-start|slow start}}, {{congestion-avoidance|congestion avoidance}}) dynamically adjust the sending rate to avoid overwhelming the network.'
		},
		{
			title: 'FIN — Graceful close',
			description:
				'Either side sends a {{fin|FIN}} to close the connection. The other side acknowledges and sends its own {{fin|FIN}}. Both sides confirm — connection closed cleanly.'
		}
	],
	useCases: [
		'Web browsing (HTTP/HTTPS)',
		'Email ([[smtp|SMTP]], [[imap|IMAP]], POP3)',
		'File transfer ([[ftp|FTP]], SFTP)',
		'Remote access ([[ssh|SSH]])',
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
		caption:
			'A minimal [[tcp|TCP]] server — the 3-way {{handshake|handshake}} happens automatically inside accept()',
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
  Src Port: 52431 → Dst Port: 80
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
			'1 RTT for TCP handshake (additional RTTs come from TLS, not TCP itself), then 1 RTT per request-response exchange (one-way data arrives in ~0.5 RTT)',
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
		'imap',
		'ipsec'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9293'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tcp_state_diagram.svg/500px-Tcp_state_diagram.svg.png',
		alt: 'TCP finite state machine diagram showing all connection states from CLOSED through ESTABLISHED to TIME_WAIT',
		caption:
			'The [[tcp|TCP]] state machine — every [[tcp|TCP]] connection transitions through these states. From the {{three-way-handshake|three-way handshake}} ({{syn-cookies|SYN}} → {{syn-cookies|SYN}}-{{ack|ACK}} → {{ack|ACK}}) to graceful teardown ({{fin|FIN}} → {{fin|FIN}}-{{ack|ACK}}), this diagram maps the full lifecycle of a [[tcp|TCP]] connection.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	},

	recentChanges: [
		{
			date: '2024-01',
			title: 'Linux 6.7 ships native TCP-AO (RFC 5925)',
			description:
				'Five thousand lines of new networking code finally give {{linux|Linux}} a modern replacement for the deprecated [[tcp|TCP]]-{{md5|MD5}} used by [[bgp|BGP]]/LDP. Same release added microsecond-resolution [[tcp|TCP]] timestamps.',
			source: { url: 'https://kernelnewbies.org/Linux_6.7', label: 'kernelnewbies.org' }
		},
		{
			date: '2025-01',
			title: 'Comcast launches L4S in production',
			description:
				'Sub-millisecond queuing {{latency|latency}} for cooperating flows in six US metros, with {{apple|Apple}}, {{nvidia|NVIDIA}} GeForce NOW, {{meta|Meta}}, and Valve as launch partners. The first large-scale deployment of the {{l4s|L4S}} architecture ([[rfc:9330|RFC 9330]]/9331/9332) on a production access network.',
			source: {
				url: 'https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s',
				label: 'RCR Wireless'
			}
		},
		{
			date: '2025-06',
			title: 'Linux 6.15 lands io_uring zero-copy receive',
			description:
				'io_uring zcrx integrated with the kernel [[tcp|TCP]] stack hit ~106 Gb/s on a single [[tcp|TCP]] flow versus ~74 Gb/s for epoll — a ~40% throughput jump for high-{{bandwidth|bandwidth}} servers without any application changes.',
			source: { url: 'https://www.phoronix.com/news/Linux-6.15-IO_uring', label: 'Phoronix' }
		},
		{
			date: '2025-03',
			title: 'AccECN advances to draft-34',
			description:
				'Accurate {{ecn|ECN}} (draft-{{ietf|ietf}}-tcpm-accurate-ecn) reallocates the old {{ecn|ECN}}-{{nonce|Nonce}} bit to deliver more than one congestion signal per {{rtt|RTT}} — the precondition {{l4s|L4S}} over [[tcp|TCP]] needs for fine-grained congestion response.',
			source: {
				url: 'https://datatracker.ietf.org/doc/draft-ietf-tcpm-accurate-ecn/',
				label: 'IETF Datatracker'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Linux kernel',
			scale: 'CUBIC default since 2.6.19',
			description:
				'{{cubic|CUBIC}} has been the default [[tcp|TCP]] {{congestion-control|congestion control}} on {{linux|Linux}} since 2006. Most large-scale {{linux|Linux}} servers (web, database, file) run it.'
		},
		{
			org: 'Google',
			scale: 'BBR for google.com / YouTube',
			description:
				"BBRv1 deployed in 2016; {{bbrv3|BBRv3}}, introduced at IETF 117 (July 2023), rolled out across google.com and YouTube through 2023–2024. Replaces {{cubic|CUBIC}} for outbound traffic from {{google|Google}}'s edge."
		},
		{
			org: 'Meta',
			scale: '>50% of traffic still TCP',
			description:
				"Despite >75% of {{meta|Meta}}'s internet-facing traffic moving to [[quic|QUIC]], [[tcp|TCP]] remains the default for service-to-service inside the datacenter and for backwards-compatible client paths."
		},
		{
			org: 'Apple',
			scale: 'iOS / macOS default',
			description:
				'NewReno early on, {{cubic|CUBIC}} by default since ~2014 (iOS 8 / OS X Yosemite); {{ecn|ECN}} on by default since iOS 11, with {{l4s|L4S}} support added in iOS 17+ and macOS Sonoma+.'
		}
	],

	funFacts: [
		{
			title: 'RFC 793 was the spec for 41 years',
			text: "From September 1981 until [[rfc:9293|RFC 9293]] (August 2022), [[pioneer:jon-postel|Jon Postel]]'s [[rfc:9293|RFC 793]] was the canonical [[tcp|TCP]] specification — among the longest-lived core specs in networking, alongside [[udp|UDP]]'s RFC 768 (1980) and IP/ICMP's RFC 791/792 (also 1981), which likewise stayed canonical for decades. [[rfc:9293|RFC 9293]] finally folded six updating RFCs and years of accepted errata into a single readable document, edited by Wesley Eddy."
		},
		{
			title: "TCP's sequence numbers used to be guessable",
			text: "Early [[tcp|TCP]] picked the initial {{sequence-number|sequence number}} from a counter incremented at a fixed rate per second. Kevin Mitnick used this in 1994 to forge a connection to Tsutomu Shimomura's host. Modern stacks use a cryptographically-random {{isn|ISN}} per [[rfc:9293|RFC 9293]] §3.4.1."
		},
		{
			title: 'The window field is only 16 bits',
			text: 'The [[tcp|TCP]] receive-window field is 16 bits — max 65,535 bytes. On a 100 ms transcontinental path that caps throughput at ~5 Mbit/s. The {{window-scale|Window Scale}} option (RFC 1323, 1992; superseded by [[rfc:7323|RFC 7323]]) shifts the window left by up to 14 bits, allowing windows up to 1 GB. Without it, modern long-fat-pipe networking would be impossible.'
		},
		{
			title: 'TIME_WAIT exists because of stragglers',
			text: 'After active close, a socket sits in **{{time-wait|TIME_WAIT}}** for ~60 seconds (2× MSL) on {{linux|Linux}}. Why? A delayed segment from the old connection could otherwise re-enter a freshly-opened connection on the same four-tuple and be misinterpreted as legitimate data. This is the most paranoid 60 seconds in networking.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Nagle + Delayed ACK = 200ms latency',
				text: "Nagle's algorithm coalesces small writes; {{delayed-ack|delayed ACK}} batches acknowledgements. When both are on (the default), interactive applications writing in small chunks can stall for up to 200 ms waiting for an {{ack|ACK}}. Cure: setsockopt(TCP_NODELAY, 1) for low-{{latency|latency}} apps."
			},
			{
				title: 'Ephemeral port exhaustion',
				text: 'On a server doing many short-lived outbound connections (e.g., to upstream APIs), the local {{os|OS}} exhausts the {{ephemeral-port|ephemeral port}} range (default 32768-60999 on {{linux|Linux}}). Sockets sit in {{time-wait|TIME_WAIT}} for ~60s, blocking the four-tuple. Cure: enable connection reuse ({{http-method|HTTP}} {{keep-alive|keep-alive}}, [[grpc|gRPC]] pooling), or widen the range with net.ipv4.ip_local_port_range.'
			},
			{
				title: 'PMTU black holes',
				text: 'A path drops large packets but does not return [[icmp|ICMP]] {{fragmentation|Fragmentation}} Needed — usually because some intermediate {{firewall|firewall}} rate-limits or blocks [[icmp|ICMP]]. The connection hangs because retransmits also fail. Cure: enable {{plpmtud|PLPMTUD}} ([[rfc:4821|RFC 4821]]) or set [[tcp|TCP]] {{mss|MSS}} clamping at the edge.'
			}
		]
	}
};
