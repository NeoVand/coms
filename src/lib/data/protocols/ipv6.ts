import type { Protocol } from '../types';

export const ipv6: Protocol = {
	id: 'ipv6',
	name: 'Internet Protocol version 6',
	abbreviation: 'IPv6',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1998,
	rfc: 'RFC 8200',
	oneLiner:
		'The next-generation internet addressing system — 128-bit addresses, simplified headers, and no more NAT.',
	overview: `IPv6 is the successor to [[ip|IPv4]], designed to solve the internet's {{ip-address|address}} exhaustion crisis. IPv4's 32-bit addresses provide roughly 4.3 billion unique addresses — a number that seemed inexhaustible in 1981 but was effectively depleted by 2011. IPv6 uses 128-bit addresses, providing 340 undecillion (3.4×10³⁸) addresses — enough to assign a unique address to every atom on the surface of the Earth and still have addresses left over.

But IPv6 isn't just "bigger addresses." The protocol was redesigned from scratch with decades of operational experience. The header was simplified: IPv4's variable-length header with a checksum and options field became a fixed 40-byte header with no {{checksum|checksum}} (upper layers handle integrity) and an elegant extension {{header|header}} chain for optional features. {{fragmentation|Fragmentation}} was removed from routers entirely — only the source host fragments, discovered through Path MTU Discovery using [[icmp|ICMPv6]].

IPv6 eliminates {{broadcast|broadcast}} entirely, replacing it with {{multicast|multicast}} and {{anycast|anycast}}. Instead of [[arp|ARP]] broadcasts to resolve addresses, IPv6 uses Neighbor Discovery Protocol (NDP), which runs over ICMPv6 and uses solicited-node multicast — far more efficient than flooding every device on the network. NDP also handles {{stateless|stateless}} address autoconfiguration (SLAAC), where a device can configure its own globally unique address without a [[dhcp|DHCP]] server.

The primary IPv4-to-IPv6 transition mechanism is dual-stack operation, where hosts and routers run both protocols simultaneously and prefer IPv6 when available. This avoids a hard cutover and allows gradual migration.

On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time in its history — 28 years after RFC 2460. Cloudflare and APNIC measure 40-43% from their own vantage points, so the milestone is real but uneven. Mobile carriers are the leading edge: US averages around 87%, T-Mobile ~93%, France ~86%, India >75%. The transition from IPv4 is happening — just slower than anyone predicted.`,
	howItWorks: [
		{
			title: 'Addressing (128-bit)',
			description:
				"Addresses are written as eight groups of four hex digits (2001:0db8:85a3::8a2e:0370:7334). Link-local (fe80::), global {{unicast|unicast}} (2000::/3), and {{multicast|multicast}} (ff00::/8) replace IPv4's {{broadcast|broadcast}} model."
		},
		{
			title: 'Simplified header',
			description:
				'Fixed 40-byte header: Version (4b), Traffic Class (8b), Flow Label (20b), {{payload|Payload}} Length (16b), Next Header (8b), {{hop|Hop}} Limit (8b), Source (128b), Destination (128b). No {{checksum|checksum}}, no options — just clean forwarding.'
		},
		{
			title: 'Extension headers',
			description:
				'Optional features (routing, {{fragmentation|fragmentation}}, security, mobility) are chained via Next Header fields. Each extension points to the next, creating a flexible chain processed only by the destination — not by every router. The one exception is the Hop-by-Hop Options header (Next Header = 0), which must be examined by every router along the path.'
		},
		{
			title: 'Neighbor Discovery (NDP)',
			description:
				'Replaces ARP, ICMP Router Discovery, and ICMP Redirect. Uses ICMPv6 messages: Router Solicitation/Advertisement (find routers), Neighbor Solicitation/Advertisement (resolve addresses via solicited-node multicast).'
		},
		{
			title: 'Stateless autoconfiguration (SLAAC)',
			description:
				'Hosts generate their own global address from the network prefix (learned via Router Advertisement) and their interface identifier. No [[dhcp|DHCP]] server needed — plug in and go. Note: by default {{stateless|SLAAC}} embeds the {{mac-address|MAC address}} in the IPv6 address, which is a privacy concern — Privacy Extensions ([[rfc:8981|RFC 8981]]) replace this with randomized, temporary interface identifiers that rotate periodically.'
		}
	],
	useCases: [
		'Mobile networks (most 4G/5G networks run IPv6-only internally)',
		'Cloud infrastructure (AWS, Azure, GCP native dual-stack and IPv6-only VPCs)',
		'IoT deployments needing unique global addresses for every device',
		'Large-scale networks avoiding NAT complexity and enabling end-to-end connectivity',
		'Content delivery and streaming services optimizing for IPv6-primary clients'
	],
	codeExample: {
		language: 'python',
		code: `import socket

# Create an IPv6 TCP socket
sock = socket.socket(
    socket.AF_INET6,
    socket.SOCK_STREAM
)

# Connect to an IPv6 address
sock.connect((
    '2606:2800:21f:cb07:6820:80da:af6b:8b2c',
    80,   # port
    0,    # flowinfo
    0     # scope_id
))

# HTTP request over IPv6
sock.send(b'GET / HTTP/1.1\\r\\n'
          b'Host: example.com\\r\\n\\r\\n')
response = sock.recv(4096)
print(response.decode()[:200])`,
		caption: 'IPv6 sockets use AF_INET6 and 4-tuple addresses (host, port, flowinfo, scope_id)',
		alternatives: [
			{
				language: 'cli',
				code: `# Ping over IPv6
ping6 google.com
# or: ping -6 google.com

# Traceroute over IPv6
traceroute6 google.com

# Show IPv6 addresses on interfaces
ip -6 addr show

# Show IPv6 routing table
ip -6 route show

# curl over IPv6 explicitly
curl -6 https://ipv6.google.com

# Test IPv6 connectivity
curl https://v6.ipinfo.io`
			},
			{
				language: 'javascript',
				code: `import { createServer } from 'net';

// Node.js dual-stack server
// Listens on both IPv4 and IPv6
const server = createServer((sock) => {
  console.log(
    'Client:', sock.remoteAddress,
    'Family:', sock.remoteFamily
    // "::ffff:192.168.1.1" (IPv4-mapped)
    // "2001:db8::1" (native IPv6)
  );
  sock.end('Hello from dual-stack!');
});

server.listen(8080, '::', () => {
  console.log('Listening on [::]:8080');
  // Accepts both IPv4 and IPv6
});`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'IPv6 Header (Fixed 40 bytes)',
						code: `IPv6 Header:
  Version: 6
  Traffic Class: 0x00
  Flow Label: 0x00000
  Payload Length: 40
  Next Header: 6 (TCP)
  Hop Limit: 64
  Source:      2001:db8::1
  Destination: 2001:db8::2

Compared to IPv4:
  ✗ No Header Checksum
  ✗ No Fragmentation fields
  ✗ No Options / IHL
  ✓ Fixed size (always 40 bytes)
  ✓ Flow Label for QoS`
					},
					{
						title: 'Neighbor Solicitation (NDP)',
						code: `ICMPv6 Neighbor Solicitation:
  Type: 135
  Code: 0
  Target: 2001:db8::2
  Option: Source Link-Layer Address
    → AA:BB:CC:DD:EE:FF

ICMPv6 Neighbor Advertisement:
  Type: 136
  Code: 0
  Flags: S=1 (Solicited) O=1 (Override)
  Target: 2001:db8::2
  Option: Target Link-Layer Address
    → 11:22:33:44:55:66`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Same as IPv4 for most paths. Slightly faster in some cases — no NAT traversal, no header checksum computation at each hop, and some ISPs have shorter IPv6 paths.',
		throughput:
			'Equal to IPv4. The 20-byte larger header (40 vs 20 bytes) is offset by simplified processing — no checksum recalculation, no router fragmentation, and fixed header size enables hardware fast-path.',
		overhead:
			"Fixed 40-byte header (vs IPv4's variable 20-60 bytes). Extension headers add overhead only when used. No per-hop checksum computation saves router CPU."
	},
	connections: ['ip', 'tcp', 'udp', 'ethernet', 'wifi', 'dns', 'dhcp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/IPv6',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8200'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ipv6_address_leading_zeros.svg/500px-Ipv6_address_leading_zeros.svg.png',
		alt: 'Diagram showing IPv6 address notation with leading zeros compressed and groups separated by colons',
		caption:
			'IPv6 address notation — eight groups of four hexadecimal digits separated by colons. Leading zeros can be omitted and consecutive zero groups replaced with :: for brevity (2001:0db8::1).',
		credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
	}
};
