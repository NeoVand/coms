import type { Protocol } from '../types';

export const mptcp: Protocol = {
	id: 'mptcp',
	name: 'Multipath TCP',
	abbreviation: 'MPTCP',
	categoryId: 'transport',
	year: 2013,
	rfc: 'RFC 8684',
	oneLiner:
		'[[tcp|TCP]] that uses multiple network paths simultaneously — [[wifi|WiFi]] and cellular at the same time.',
	overview: `{{multipath|Multipath}} [[tcp|TCP]] solves a fundamental limitation of regular [[tcp|TCP]]: a connection is locked to a single pair of {{ip-address|IP addresses}}. If your phone is connected to both [[wifi|WiFi]] and cellular, standard [[tcp|TCP]] can only use one at a time. [[mptcp|MPTCP]] allows a single connection to spread across multiple network interfaces simultaneously, combining their {{bandwidth|bandwidth}} and seamlessly failing over when one path drops.

The protocol works by establishing "subflows" — each {{subflow|subflow}} is a regular [[tcp|TCP]] connection on a different network path. A shim layer sits between the application and these subflows, distributing data across paths and reassembling it on the other end. The application sees a single, normal [[tcp|TCP]] {{socket|socket}}; the magic happens entirely at the transport layer.

{{apple|Apple}} was the first major adopter, shipping [[mptcp|MPTCP]] in iOS 7 (2013) for Siri — so your voice command wouldn't drop when walking from [[wifi|WiFi]] to cellular range. Since then, {{apple|Apple}} has extended it to Maps, Music, and third-party apps. {{linux|Linux}} has native [[mptcp|MPTCP]] support since kernel 5.6 (2020).`,
	howItWorks: [
		{
			title: 'Initial handshake with MP_CAPABLE',
			description:
				"The first {{subflow|subflow}} is established like a normal [[tcp|TCP]] {{handshake|handshake}}, but the packets carry the {{mp-capable|MP_CAPABLE}} option. In MPTCP v1 (RFC 8684) the client's {{syn-cookies|SYN}} advertises capability only; the server sends its key in the SYN/ACK, and both keys are confirmed in the third ACK — the keys identify this [[mptcp|MPTCP]] connection."
		},
		{
			title: 'Additional subflows via MP_JOIN',
			description:
				'Either endpoint can open additional [[tcp|TCP]] subflows over different network paths (e.g., [[wifi|WiFi]] + cellular). The {{syn-cookies|SYN}} carries an {{mp-join|MP_JOIN}} option linking it to the existing connection.'
		},
		{
			title: 'Data-level sequencing',
			description:
				'Each {{subflow|subflow}} has its own [[tcp|TCP]] sequence numbers. A separate Data {{sequence-number|Sequence Number}} (DSN) ensures correct ordering across all subflows before delivering to the application.'
		},
		{
			title: 'Scheduler distributes data',
			description:
				'The [[mptcp|MPTCP]] scheduler decides which {{subflow|subflow}} carries each chunk — round-robin, lowest-{{latency|latency}}-first, or redundant. This is transparent to the application.'
		},
		{
			title: 'Seamless failover',
			description:
				'If a {{subflow|subflow}} fails ([[wifi|WiFi]] drops), data is automatically redirected to remaining subflows. New subflows can be added on-the-fly. The application never sees a disconnection.'
		}
	],
	useCases: [
		'Mobile connectivity resilience ([[wifi|WiFi]] to cellular handover)',
		'Apple Siri, Maps, and Music on iOS devices',
		'{{bandwidth|Bandwidth}} aggregation across multiple ISP links',
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
sock.close()`,
		caption:
			'[[mptcp|MPTCP]] in Python — same {{api|API}} as [[tcp|TCP]], but the kernel routes data over multiple paths',
		alternatives: [
			{
				language: 'javascript',
				code: `// Node.js does NOT natively support MPTCP.
// The net module creates sockets with IPPROTO_TCP (6),
// but MPTCP requires IPPROTO_MPTCP (262) at socket
// creation — there is no option to specify this.
//
// To use MPTCP programmatically, use C or Python:
//
// C:  socket(AF_INET, SOCK_STREAM, 262 /* IPPROTO_MPTCP */)
// Python: socket.socket(AF_INET, SOCK_STREAM, 262)
//
// Or run a legacy TCP app over MPTCP on Linux without code changes:
//   sysctl net.mptcp.enabled=1          # (already the default on 5.6+)
//   ip mptcp endpoint add <addr> dev <iface> subflow
//   mptcpize run node app.js            # LD_PRELOAD shim swaps IPPROTO_TCP -> IPPROTO_MPTCP
//
// Plain TCP sockets are never silently auto-upgraded; the app must
// open IPPROTO_MPTCP sockets (as above) or be wrapped by mptcpize
// (or the eBPF 'mptcpify' program on kernel 6.6+).

const net = require('node:net');
const socket = net.createConnection({
  host: 'example.com',
  port: 80
});
socket.on('connect', () => {
  // This uses plain TCP (IPPROTO_TCP = 6)
  console.log('Connected via regular TCP');
  socket.write('GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n');
});`
			},
			{
				language: 'cli',
				code: `# Check if MPTCP is enabled (Linux)
sysctl net.mptcp.enabled

# Show MPTCP subflow info
ss -M

# List configured MPTCP endpoints
ip mptcp endpoint show

# Add a new MPTCP endpoint (use WiFi + cellular)
sudo ip mptcp endpoint add 192.168.1.100 dev wlan0 subflow
sudo ip mptcp endpoint add 10.0.0.100 dev wwan0 subflow

# Monitor MPTCP connections
ip mptcp monitor`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'MP_CAPABLE Handshake',
						code: `TCP SYN + MP_CAPABLE  (RFC 8684, v1):
  Src: 10.0.0.1:45200 → Dst: 93.184.216.34:443
  Flags: [SYN]
  Options:
    MP_CAPABLE (Kind=30, Length=4)
      Version: 1
      Flags: H (HMAC-SHA256)        ← no key yet in v1's SYN

TCP SYN-ACK + MP_CAPABLE:
  Src: 93.184.216.34:443 → Dst: 10.0.0.1:45200
  Flags: [SYN, ACK]
  Options:
    MP_CAPABLE (Kind=30, Length=12)
      Version: 1
      Server Key: 0x9876543210FEDCBA

TCP ACK + MP_CAPABLE  (third ACK carries both keys):
  Flags: [ACK]
  Options:
    MP_CAPABLE (Kind=30, Length=20)
      Client Key: 0xABCDEF0123456789
      Server Key: 0x9876543210FEDCBA`
					},
					{
						title: 'Subflow Join (MP_JOIN)',
						code: `TCP SYN + MP_JOIN (new path):
  Src: 10.0.1.1:52300 → Dst: 93.184.216.34:443
  Flags: [SYN]
  Options:
    MP_JOIN (Kind=30, Length=12)
      Receiver Token: 0x1A2B3C4D        ← identifies the existing MPTCP connection
      Address ID: 1
      Sender Nonce: 0x3D2C1B0A          ← no HMAC in the SYN

TCP SYN-ACK + MP_JOIN:
  Flags: [SYN, ACK]
  Options:
    MP_JOIN (Kind=30, Length=16)
      Sender HMAC (truncated, 64-bit): 0xA7B8C9DA...
      Sender Nonce: 0x00000002

TCP ACK + MP_JOIN (third ACK):
  Flags: [ACK]
  Options:
    MP_JOIN (Kind=30, Length=24)
      Sender HMAC (full, 160-bit): 0xE5F6...`
					}
				]
			}
		]
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
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/DifferenceTCP_MPTCP-en.png/500px-DifferenceTCP_MPTCP-en.png',
		alt: 'Comparison diagram showing regular TCP using a single path versus MPTCP using multiple simultaneous paths between two hosts',
		caption:
			'[[tcp|TCP]] vs [[mptcp|Multipath TCP]] — regular [[tcp|TCP]] sends data over a single path, while [[mptcp|MPTCP]] splits traffic across multiple interfaces ([[wifi|WiFi]] + cellular, dual [[ethernet|Ethernet]]) simultaneously, boosting throughput and providing seamless {{failover|failover}}.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
