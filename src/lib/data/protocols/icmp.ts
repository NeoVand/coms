import type { Protocol } from '../types';

export const icmp: Protocol = {
	id: 'icmp',
	name: 'Internet Control Message Protocol',
	abbreviation: 'ICMP',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1981,
	rfc: 'RFC 792',
	oneLiner: 'The diagnostic protocol behind ping and traceroute — how the network reports errors.',
	overview: `ICMP is the internet's error-reporting and diagnostic protocol. When you type \`ping google.com\`, ICMP Echo Request and Reply messages measure whether the target is reachable and how long the {{rtt|round trip}} takes. When you run \`traceroute\`, ICMP Time Exceeded messages reveal each {{hop|hop}} along the path. ICMP is arguably the most universally used protocol in network troubleshooting.

Unlike [[tcp|TCP]] or UDP, ICMP doesn't use {{port|ports}}. It's {{encapsulation|encapsulated}} directly in IP {{packet|packets}} with protocol number 1 — sitting at the network layer, not the transport layer. This means ICMP can report problems that TCP and UDP can't even see: unreachable networks, expired {{ttl|TTLs}}, {{fragmentation|fragmentation}} issues, and routing redirects.

Every router on the internet speaks ICMP. When a router can't deliver a packet, it sends an ICMP Destination Unreachable (Type 3) back to the sender, with codes specifying why: network unreachable, host unreachable, port unreachable, or "fragmentation needed but don't-fragment flag is set" (which is essential for Path MTU Discovery).

ICMP is also controversial. Many {{firewall|firewalls}} block ICMP to prevent reconnaissance, but this breaks legitimate diagnostics and can cause subtle problems like Path MTU Discovery failures. The debate over whether to filter ICMP has been going on for decades — and ICMP's designers would argue it should never be blocked.

IPv6 uses a separate specification called ICMPv6 (RFC 4443) with different type numbers and additional functionality. ICMPv6 is more critical than its IPv4 counterpart because it incorporates Neighbor Discovery Protocol (NDP), which replaces ARP for address resolution and handles router discovery, address autoconfiguration, and duplicate address detection.`,
	howItWorks: [
		{
			title: 'Echo Request (ping)',
			description:
				'Source sends an ICMP Type 8 packet to the target with an Identifier (session ID), Sequence number, and optional data payload. No TCP or UDP — just IP + ICMP.'
		},
		{
			title: 'Echo Reply',
			description:
				'If reachable, the target replies with ICMP Type 0 containing the same Identifier, Sequence, and data. Round-trip time is measured from send to receive.'
		},
		{
			title: 'Destination Unreachable',
			description:
				'When a router cannot deliver a packet, it sends Type 3 back to the sender. Code values specify why: 0=Network Unreachable, 1=Host Unreachable, 2=Protocol Unreachable, 3=Port Unreachable, 4=Fragmentation Needed.'
		},
		{
			title: 'Time Exceeded (traceroute)',
			description:
				"When a packet's TTL reaches zero, the router sends Type 11 back. Traceroute exploits this by sending packets with incrementing TTL values (1, 2, 3...) to discover each hop."
		},
		{
			title: 'Redirect',
			description:
				'Type 5 tells a host to use a better next-hop router. If a router receives a packet and knows a more direct path, it sends a Redirect to optimize future traffic.'
		}
	],
	useCases: [
		'Network reachability testing (ping)',
		'Path discovery and latency measurement (traceroute/tracert)',
		'Network troubleshooting and diagnostics',
		'Path MTU Discovery (Packet Too Big messages)',
		'Router signaling and redirect optimization'
	],
	codeExample: {
		language: 'python',
		code: `import socket
import struct
import time

def checksum(data):
    s = 0
    for i in range(0, len(data), 2):
        w = data[i] + (data[i+1] << 8)
        s = s + w
    s = (s >> 16) + (s & 0xffff)
    s = s + (s >> 16)
    return ~s & 0xffff

def ping(host):
    sock = socket.socket(
        socket.AF_INET,
        socket.SOCK_RAW,
        socket.IPPROTO_ICMP
    )
    # Build ICMP Echo Request (Type 8)
    icmp_type, code = 8, 0
    ident, seq = 0x1234, 1
    header = struct.pack(
        '!BBHHH', icmp_type, code, 0, ident, seq
    )
    data = b'ping payload'
    # Calculate checksum and rebuild
    cksum = checksum(header + data)
    header = struct.pack(
        '!BBHHH', icmp_type, code, cksum, ident, seq
    )
    sock.sendto(header + data, (host, 0))
    start = time.time()
    reply = sock.recv(1024)
    rtt = (time.time() - start) * 1000
    print(f"Reply from {host}: time={rtt:.1f}ms")`,
		caption: 'ICMP requires raw sockets — it operates at the network layer, below TCP/UDP',
		alternatives: [
			{
				language: 'cli',
				code: `# Ping — ICMP Echo Request/Reply
ping -c 4 example.com
# PING example.com: 64 bytes, seq=1, ttl=56, time=12.3ms

# Traceroute — ICMP Time Exceeded
traceroute example.com
#  1  router.local (192.168.1.1)  1.2ms
#  2  isp-gw.net (10.0.0.1)      5.4ms
#  3  example.com (93.184.216.34) 12.1ms

# MTU Path Discovery
ping -M do -s 1472 example.com

# Continuous ping with timestamps
ping -D example.com`
			},
			{
				language: 'javascript',
				code: `import { exec } from 'child_process';
import { promisify } from 'util';
const run = promisify(exec);

// Node.js can't send raw ICMP without
// native modules — use system ping
const { stdout } = await run(
  'ping -c 4 example.com'
);
const times = stdout
  .match(/time=([\\d.]+)/g)
  ?.map(t => parseFloat(
    t.replace('time=', '')
  ));
console.log('RTTs:', times, 'ms');
console.log('Avg:', (times.reduce(
  (a, b) => a + b) / times.length
).toFixed(1), 'ms');`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Echo Request / Reply',
						code: `ICMP Echo Request:
  Type: 8 (Echo Request)
  Code: 0
  Checksum: 0x4D2A
  Identifier: 0x1234
  Sequence: 1
  Data: 48 65 6C 6C 6F ("Hello")

ICMP Echo Reply:
  Type: 0 (Echo Reply)
  Code: 0
  Checksum: 0x552A
  Identifier: 0x1234  (echoed)
  Sequence: 1         (echoed)
  Data: 48 65 6C 6C 6F ("Hello" echoed back)`
					},
					{
						title: 'Time Exceeded (Traceroute)',
						code: `ICMP Time Exceeded:
  Type: 11 (Time Exceeded)
  Code: 0 (TTL expired in transit)
  Checksum: 0x3B1F
  Unused: 0x00000000
  --- Original IP Header ---
  Src: 192.168.1.100
  Dst: 93.184.216.34
  Protocol: 1 (ICMP)
  TTL: 1 (was 1, decremented to 0)
  --- First 8 bytes of original ICMP ---
  Type: 8, Code: 0, ID: 0x1234, Seq: 1`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Ping RTT depends on network distance: <1ms LAN, 1-20ms continental, 100-300ms intercontinental. Processing overhead is negligible.',
		throughput:
			'Not applicable — ICMP is for diagnostics, not data transfer. Most routers rate-limit ICMP to prevent abuse.',
		overhead:
			'8-byte ICMP header (Type, Code, Checksum, Id, Seq) encapsulated in IP. Minimal by design — diagnostics should be lightweight.'
	},
	connections: ['dns', 'tcp', 'ip', 'ipv6'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc792'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/DEC_VT100_terminal.jpg/500px-DEC_VT100_terminal.jpg',
		alt: 'DEC VT100 terminal at the Living Computer Museum, connected to a DEC PDP-11/70',
		caption:
			'A DEC VT100 terminal — the type of terminal where early network administrators ran ping and traceroute, the quintessential ICMP diagnostic tools. ICMP was defined in 1981, and these terminals were the window into the network.',
		credit: 'Photo: Jason Scott / CC BY 2.0, via Wikimedia Commons'
	}
};
