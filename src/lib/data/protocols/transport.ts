import type { Protocol } from '../types';

export const transportProtocols: Protocol[] = [
	{
		id: 'tcp',
		name: 'Transmission Control Protocol',
		abbreviation: 'TCP',
		categoryId: 'transport',
		port: 80,
		year: 1981,
		rfc: 'RFC 793',
		oneLiner: 'Guarantees ordered, reliable delivery of data between applications.',
		overview: `TCP is the backbone of the internet. When you load a webpage, send an email, or download a file, TCP ensures every single byte arrives correctly and in order. It does this by establishing a connection between sender and receiver before any data flows — like a phone call where both sides confirm they can hear each other.

Unlike UDP, TCP will detect lost packets and retransmit them. It also implements flow control (so a fast sender doesn't overwhelm a slow receiver) and congestion control (so the network itself doesn't get overloaded). This reliability comes at a cost: extra round trips and overhead, which is why latency-sensitive applications sometimes prefer UDP.

TCP operates at Layer 4 (Transport) of the OSI model and is identified by protocol number 6 in the IP header. Nearly every major internet application — HTTP, SSH, FTP, SMTP — runs on top of TCP.`,
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
					'Data flows in ordered segments. Each segment is acknowledged. Lost segments are retransmitted. Flow control prevents overwhelming the receiver.'
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
			caption:
				'A minimal TCP server in Python — the 3-way handshake happens automatically inside accept()'
		},
		performance: {
			latency: '1-3 RTT for connection setup (handshake), then ~0.5 RTT per data exchange',
			throughput:
				'Limited by congestion window; typically reaches line speed on stable connections',
			overhead: '20-byte header minimum + options; ~40 bytes typical with timestamps'
		},
		connections: ['udp', 'tls', 'http1', 'websockets', 'smtp', 'ftp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc793'
		}
	},
	{
		id: 'udp',
		name: 'User Datagram Protocol',
		abbreviation: 'UDP',
		categoryId: 'transport',
		port: 53,
		year: 1980,
		rfc: 'RFC 768',
		oneLiner: 'Fire-and-forget delivery — fast but with no guarantees.',
		overview: `UDP is TCP's carefree sibling. It sends data without establishing a connection, without checking if it arrived, and without caring about order. This sounds unreliable (and it is), but that's exactly why it's useful — sometimes speed matters more than perfection.

Think of a live video call: if one frame is lost, it's better to show the next frame than to pause and wait for retransmission. UDP enables this by stripping away all of TCP's reliability mechanisms, leaving a bare-minimum 8-byte header. Applications that use UDP typically implement their own reliability on top (like QUIC does) or simply tolerate some loss.

UDP is essential for DNS lookups (where speed matters and the payload fits in one packet), online gaming (where stale data is useless), live streaming, and VoIP. It operates at Layer 4 alongside TCP and is identified by protocol number 17.`,
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
			caption: 'UDP is connectionless — just bind, send, and hope for the best'
		},
		performance: {
			latency: 'Zero connection setup; single RTT for request-response',
			throughput: 'No congestion control — can send as fast as the network allows (or can handle)',
			overhead: '8-byte header only — the minimum possible for transport'
		},
		connections: ['tcp', 'dns', 'quic', 'webrtc'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/User_Datagram_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc768'
		}
	},
	{
		id: 'quic',
		name: 'QUIC',
		abbreviation: 'QUIC',
		categoryId: 'transport',
		port: 443,
		year: 2021,
		rfc: 'RFC 9000',
		oneLiner:
			'UDP-based transport with built-in encryption and multiplexing — the future of the web.',
		overview: `QUIC is what happens when Google looks at TCP+TLS and says "we can do better." It runs on top of UDP but provides TCP-like reliability, TLS 1.3 encryption, and HTTP/2-style multiplexing — all in a single protocol. The result: faster connections, no head-of-line blocking, and seamless connection migration.

The key insight is combining the transport handshake with the TLS handshake. TCP+TLS requires 2-3 round trips before data flows; QUIC does it in 1 RTT (or 0 RTT for repeat connections). It also solves TCP's head-of-line blocking problem: in HTTP/2 over TCP, a single lost packet blocks ALL streams. In QUIC, streams are independent — a lost packet only affects its own stream.

QUIC powers HTTP/3, which is the latest version of HTTP. Major browsers and services (Google, Facebook, Cloudflare) already use it heavily. It's the most significant transport protocol innovation in decades.`,
		howItWorks: [
			{
				title: 'Initial handshake (1 RTT)',
				description:
					'Client sends a QUIC Initial packet containing a TLS ClientHello. Server responds with its Initial + Handshake packets. Connection is established in a single round trip with encryption from the start.'
			},
			{
				title: '0-RTT resumption',
				description:
					'For repeat connections, the client can send data immediately using a cached key — zero round trips. The server can process it before the handshake completes.'
			},
			{
				title: 'Multiplexed streams',
				description:
					"Multiple independent streams share one connection. Each stream has its own flow control. Packet loss on one stream doesn't block others."
			},
			{
				title: 'Connection migration',
				description:
					'Connections are identified by a Connection ID, not the IP/port tuple. If your phone switches from Wi-Fi to cellular, the QUIC connection survives.'
			}
		],
		useCases: [
			'HTTP/3 web browsing',
			'Mobile applications (connection migration)',
			'Video streaming platforms',
			'Cloud gaming',
			'API communication over unstable networks'
		],
		codeExample: {
			language: 'javascript',
			code: `// HTTP/3 uses QUIC automatically
// In Node.js (experimental):
const { createQuicSocket } = require('net');

const socket = createQuicSocket({ client: {} });
const req = socket.connect({
  address: 'example.com',
  port: 443,
  alpn: 'h3'  // HTTP/3 over QUIC
});

// 0-RTT: data can flow immediately on reconnection
req.on('stream', (stream) => {
  stream.on('data', (chunk) => console.log(chunk));
});`,
			caption: 'QUIC combines transport + encryption in one step, enabling faster connections'
		},
		performance: {
			latency: '1 RTT for new connections, 0 RTT for resumption — 2-3x faster than TCP+TLS',
			throughput:
				'Comparable to TCP with better behavior on lossy networks due to independent streams',
			overhead: 'Higher per-packet than TCP due to encryption, but fewer round trips overall'
		},
		connections: ['tcp', 'udp', 'tls', 'http3'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/QUIC',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9000',
			official: 'https://quicwg.org/'
		}
	},
	{
		id: 'sctp',
		name: 'Stream Control Transmission Protocol',
		abbreviation: 'SCTP',
		categoryId: 'transport',
		port: undefined,
		year: 2000,
		rfc: 'RFC 4960',
		oneLiner:
			"Multi-streaming, multi-homing transport — TCP's more capable but less popular cousin.",
		overview: `SCTP was designed for telecom signaling but offers features that both TCP and UDP lack. It supports multiple independent streams within a single connection (like QUIC, but decades earlier), multi-homing (a connection can span multiple network interfaces for redundancy), and message boundaries (unlike TCP's byte stream).

Despite its technical superiority in many aspects, SCTP never gained widespread adoption on the public internet because NATs and firewalls typically don't understand it. However, it's widely used in telecom infrastructure (4G/5G networks use it extensively) and is the underlying transport for WebRTC's data channels.

SCTP provides the reliability of TCP, the message-oriented nature of UDP, and several features that neither has — making it an interesting study in protocol design trade-offs and the power of network effects.`,
		howItWorks: [
			{
				title: '4-way handshake',
				description:
					"SCTP uses a 4-step handshake (INIT, INIT-ACK, COOKIE-ECHO, COOKIE-ACK) that prevents SYN flood attacks by design — no server state is allocated until the client proves it's real."
			},
			{
				title: 'Multi-streaming',
				description:
					"Multiple independent message streams share one association. A lost message on stream 1 doesn't block stream 2 — solving head-of-line blocking."
			},
			{
				title: 'Multi-homing',
				description:
					'An SCTP association can use multiple IP addresses simultaneously. If one network path fails, traffic automatically shifts to another — built-in redundancy.'
			},
			{
				title: 'Message boundaries',
				description:
					'Unlike TCP (byte stream), SCTP preserves message boundaries. What you send as one message arrives as one message — no need for application-level framing.'
			}
		],
		useCases: [
			'Telecom signaling (SS7 over IP, Diameter)',
			'4G/5G mobile network infrastructure',
			'WebRTC data channels (internally)',
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
			caption:
				'SCTP in Python using pysctp — message boundaries are preserved unlike TCP byte streams',
			alternatives: [
				{
					language: 'bash',
					code: `# Test SCTP connectivity with ncat
ncat --sctp -l 3868  # Listen on SCTP port

# From another terminal, connect:
ncat --sctp localhost 3868

# Check SCTP associations
cat /proc/net/sctp/assocs`
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
			rfc: 'https://datatracker.ietf.org/doc/html/rfc4960'
		}
	},
	{
		id: 'mptcp',
		name: 'Multipath TCP',
		abbreviation: 'MPTCP',
		categoryId: 'transport',
		year: 2013,
		rfc: 'RFC 8684',
		oneLiner: 'TCP that uses multiple network paths simultaneously — WiFi and cellular at the same time.',
		overview: `Multipath TCP solves a fundamental limitation of regular TCP: a connection is locked to a single pair of IP addresses. If your phone is connected to both WiFi and cellular, standard TCP can only use one at a time. MPTCP allows a single connection to spread across multiple network interfaces simultaneously, combining their bandwidth and seamlessly failing over when one path drops.

The protocol works by establishing "subflows" — each subflow is a regular TCP connection on a different network path. A shim layer sits between the application and these subflows, distributing data across paths and reassembling it on the other end. The application sees a single, normal TCP socket; the magic happens entirely at the transport layer.

Apple was the first major adopter, shipping MPTCP in iOS 7 (2013) for Siri — so your voice command wouldn't drop when walking from WiFi to cellular range. Since then, Apple has extended it to Maps, Music, and third-party apps. Linux has native MPTCP support since kernel 5.6 (2020).`,
		howItWorks: [
			{
				title: 'Initial handshake with MP_CAPABLE',
				description:
					'The first subflow is established like a normal TCP handshake, but SYN packets carry the MP_CAPABLE option. Both sides exchange keys that identify this MPTCP connection.'
			},
			{
				title: 'Additional subflows via MP_JOIN',
				description:
					'Either endpoint can open additional TCP subflows over different network paths (e.g., WiFi + cellular). The SYN carries an MP_JOIN option linking it to the existing connection.'
			},
			{
				title: 'Data-level sequencing',
				description:
					'Each subflow has its own TCP sequence numbers. A separate Data Sequence Number (DSN) ensures correct ordering across all subflows before delivering to the application.'
			},
			{
				title: 'Scheduler distributes data',
				description:
					'The MPTCP scheduler decides which subflow carries each chunk — round-robin, lowest-latency-first, or redundant. This is transparent to the application.'
			},
			{
				title: 'Seamless failover',
				description:
					'If a subflow fails (WiFi drops), data is automatically redirected to remaining subflows. New subflows can be added on-the-fly. The application never sees a disconnection.'
			}
		],
		useCases: [
			'Mobile connectivity resilience (WiFi to cellular handover)',
			'Apple Siri, Maps, and Music on iOS devices',
			'Bandwidth aggregation across multiple ISP links',
			'High-availability server connections',
			'Hybrid access networks (DSL + LTE bonding)'
		],
		codeExample: {
			language: 'python',
			code: `import socket

# Create an MPTCP socket (Linux 5.6+)
# IPPROTO_MPTCP = 262
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 262)

# From here, it's just like regular TCP
sock.connect(('example.com', 443))
sock.sendall(b'GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n')
response = sock.recv(4096)
print(response.decode())
sock.close()

# The kernel handles multiple subflows transparently
# Check active subflows:
# ss -M  (shows MPTCP subflow info)
# ip mptcp endpoint show  (configured endpoints)`,
			caption:
				'MPTCP in Python on Linux — same API as regular TCP, but the kernel routes data over multiple paths'
		},
		performance: {
			latency:
				'Initial: same as TCP (1 RTT + MP_CAPABLE). Additional subflows: 1 RTT each for MP_JOIN.',
			throughput:
				'Aggregated bandwidth of all subflows. Two 100Mbps links can yield ~200Mbps combined.',
			overhead:
				'TCP options add 12-16 bytes per segment for DSN mapping. Subflow management adds modest CPU cost.'
		},
		connections: ['tcp', 'tls'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Multipath_TCP',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8684',
			official: 'https://www.mptcp.dev/'
		}
	}
];
