import type { Protocol } from '../types';

export const ip: Protocol = {
	id: 'ip',
	name: 'Internet Protocol',
	abbreviation: 'IPv4',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1981,
	rfc: 'RFC 791',
	oneLiner:
		'The addressing system of the internet — every packet gets a source and destination IP.',
	overview: `IP is the protocol that makes the internet an internet. It assigns every device a logical address and defines how {{packet|packets}} are routed from source to destination across networks of networks. Every piece of data you send — whether it's a web request, an email, or a video frame — is wrapped in an IP packet with a source address, a destination address, and enough metadata for routers to forward it {{hop|hop}} by hop to its destination.

The IPv4 header is 20 bytes (plus options) and carries critical fields: Source IP, Destination IP, {{ttl|TTL}} (Time to Live, decremented by each router to prevent infinite loops), Protocol (6 for [[tcp|TCP]], 17 for [[udp|UDP]], 1 for ICMP), and {{fragmentation|fragmentation}} fields for splitting oversized packets. IP is a best-effort, {{connectionless|connectionless}} protocol — it makes no guarantees about delivery, ordering, or integrity. Those responsibilities belong to the transport layer: [[tcp|TCP]] adds reliability, [[udp|UDP]] adds... nothing (and that's the point).

IPv4's 32-bit address space (about 4.3 billion addresses) seemed vast in 1981 but was effectively exhausted by 2011. {{nat|NAT}} (Network Address Translation) extended its life by letting entire networks hide behind a single public IP, but the real solution is IPv6 with its 128-bit addresses (3.4 \u00d7 10\u00b3\u2078 addresses — enough for every atom on Earth). IPv6 adoption is growing but IPv4 still carries the majority of internet traffic. At the local network level, [[arp|ARP]] maps IP addresses to [[ethernet|Ethernet]] MAC addresses, and [[dns|DNS]] maps human-readable domain names to IP addresses.`,
	howItWorks: [
		{
			title: 'Packet construction',
			description:
				'The sending host wraps the transport-layer segment ([[tcp|TCP]] or [[udp|UDP]]) in an IP header containing the source IP, destination IP, {{ttl|TTL}} (typically 64 or 128), protocol number, header {{checksum|checksum}}, and optional fields. This IP packet is then passed down to the link layer for framing.'
		},
		{
			title: 'Local routing decision',
			description:
				"The sender checks if the destination IP is on the same {{subnet|subnet}} (using its subnet mask). If yes, it uses [[arp|ARP]] to find the destination's {{mac-address|MAC address}} and sends directly. If no, it forwards the packet to the {{default-gateway|default gateway}} (router), whose MAC is also resolved via ARP."
		},
		{
			title: 'Router forwarding and TTL decrement',
			description:
				'Each router examines the destination IP, consults its {{routing-table|routing table}}, decrements the TTL by 1, recalculates the header checksum, and forwards the packet out the appropriate interface. If TTL reaches 0, the packet is dropped and an [[icmp|ICMP]] Time Exceeded message is sent back (this is how traceroute works).'
		},
		{
			title: 'Fragmentation if needed',
			description:
				"If a packet is larger than the next link's {{mtu|MTU}} (Maximum Transmission Unit, typically 1500 bytes for Ethernet), the router {{fragmentation|fragments}} it into smaller IP packets. Each fragment carries offset information so the destination can reassemble them. Modern practice avoids fragmentation using {{path-mtu-discovery|Path MTU Discovery}}."
		},
		{
			title: 'Destination reassembly and delivery',
			description:
				'The destination host reassembles any fragments using the Identification field and fragment offsets, verifies the header checksum, strips the IP header, and delivers the {{payload|payload}} to the correct transport-layer protocol ([[tcp|TCP]], [[udp|UDP]], [[icmp|ICMP]]) based on the Protocol field.'
		}
	],
	useCases: [
		'Global internet packet routing between networks',
		'Local network communication between devices on the same subnet',
		'VPN tunneling (IP-in-IP encapsulation)',
		'Multicast delivery for streaming and service discovery',
		'Quality of Service (QoS) via DSCP/ToS header fields'
	],
	codeExample: {
		language: 'python',
		code: `import socket
import struct

# Create a raw socket to send a custom IP packet
sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_RAW)

# Build an IP header manually
version_ihl = (4 << 4) | 5    # IPv4, 5 x 32-bit words = 20 bytes
dscp_ecn = 0                   # Default service
total_length = 40              # 20 (IP) + 20 (TCP placeholder)
identification = 54321
flags_offset = 0x4000          # Don't Fragment
ttl = 64
protocol = 6                   # TCP
checksum = 0                   # Kernel fills this
src_ip = socket.inet_aton("192.168.1.10")
dst_ip = socket.inet_aton("93.184.216.34")

ip_header = struct.pack('!BBHHHBBH4s4s',
    version_ihl, dscp_ecn, total_length,
    identification, flags_offset,
    ttl, protocol, checksum,
    src_ip, dst_ip)

# Send it (payload would follow the header)
sock.sendto(ip_header + b'\\x00' * 20, ("93.184.216.34", 0))
print("Raw IP packet sent!")`,
		caption:
			'Crafting a raw IP packet in Python — manually setting every header field from version to destination address',
		alternatives: [
			{
				language: 'javascript',
				code: `// Node.js — inspecting IP configuration and routing
const { execSync } = require('child_process');
const os = require('os');

// Get all network interfaces with IP addresses
const interfaces = os.networkInterfaces();
Object.entries(interfaces).forEach(([name, addrs]) => {
  addrs.forEach((addr) => {
    if (addr.family === 'IPv4') {
      console.log(
        \`\${name.padEnd(10)} \` +
        \`IP: \${addr.address.padEnd(16)} \` +
        \`Netmask: \${addr.netmask.padEnd(16)} \` +
        \`\${addr.internal ? '(loopback)' : '(external)'}\`
      );
    }
  });
});

// Show routing table
console.log('\\nRouting table:');
console.log(execSync('netstat -rn').toString());`
			},
			{
				language: 'cli',
				code: `# Show IP addresses on all interfaces
ip addr show          # Linux
ifconfig              # macOS / BSD

# Display the routing table
ip route show         # Linux
netstat -rn           # macOS / universal

# Trace the path packets take to a destination
traceroute example.com     # Uses ICMP/UDP
mtr example.com            # Continuous traceroute

# Test connectivity with ICMP (ping)
ping -c 4 example.com

# Show IP packet headers with tcpdump
sudo tcpdump -i eth0 -v -c 5 ip`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'IPv4 Header Format',
						code: `IPv4 Header (20 bytes minimum):
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |Version|  IHL  |  DSCP   | ECN |         Total Length          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |       Identification          |Flags|    Fragment Offset       |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |  TTL  |    Protocol   |        Header Checksum                |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                     Source IP Address                          |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                   Destination IP Address                       |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+`
					},
					{
						title: 'Example Captured Packet',
						code: `IP Packet:
  Version: 4
  IHL: 5 (20 bytes)
  DSCP: 0 (Best Effort)
  Total Length: 60
  Identification: 0xD431
  Flags: 0x4000 (Don't Fragment)
  Fragment Offset: 0
  TTL: 64
  Protocol: 6 (TCP)
  Header Checksum: 0xA3F1 [valid]
  Source: 192.168.1.10
  Destination: 93.184.216.34

  Payload: TCP segment (40 bytes)
    Src Port: 52431 -> Dst Port: 443
    [SYN] Seq=0 Win=65535 MSS=1460`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Per-hop forwarding: 1-10 \u00b5s in hardware (ASIC routers); end-to-end depends on path length and congestion',
		throughput:
			'Line-rate forwarding on modern routers; IP itself adds no throughput limit beyond the link speed',
		overhead:
			'20-byte header minimum (no options); 24-60 bytes with options. Every packet on the internet carries this.'
	},
	connections: ['tcp', 'udp', 'ethernet', 'arp', 'dns', 'wifi', 'ipv6'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Internet_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc791'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/IPv4_Packet-en.svg/500px-IPv4_Packet-en.svg.png',
		alt: 'Diagram of the IPv4 packet header showing all fields: version, IHL, DSCP, total length, identification, flags, TTL, protocol, checksum, source and destination addresses',
		caption:
			'The IPv4 packet header — every packet on the internet carries this 20-byte structure. Key fields include TTL (decremented by each router to prevent loops), Protocol (6=TCP, 17=UDP), and the source/destination IP addresses that make global routing possible.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
