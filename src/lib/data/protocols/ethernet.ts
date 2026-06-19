import type { Protocol } from '../types';

export const ethernet: Protocol = {
	id: 'ethernet',
	name: 'Ethernet',
	abbreviation: 'Ethernet',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1983,
	rfc: undefined,
	oneLiner:
		'The wired foundation of local networks — framing, addressing, and switching at Layer 2.',
	overview: `[[ethernet|Ethernet]] is the {{protocol|protocol}} that makes local area networks work. Every time your computer talks to another device on the same network — a printer, a file server, a router — it {{encapsulation|wraps data}} in an [[ethernet|Ethernet]] {{frame|frame}} with a source and destination {{mac-address|MAC address}}. The EtherType field tells the receiver what's inside: 0x0800 for [[ip|IP]], 0x0806 for [[arp|ARP]], 0x86DD for [[ipv6|IPv6]]. It's the lingua franca of wired networking, operating at Layer 2 of the {{osi-model|OSI model}}.

[[ethernet|Ethernet]] was invented by [[pioneer:bob-metcalfe|Bob Metcalfe]] at {{xerox-parc|Xerox PARC}} in 1973, inspired by the ALOHAnet wireless network in Hawaii. The original design used a shared coaxial cable (a "bus") where all devices listened to all traffic and used {{csma-cd|CSMA/CD}} (Carrier Sense Multiple Access with Collision Detection) to manage access. DEC, {{intel|Intel}}, and Xerox published the DIX standard in 1980, and the {{ieee-802-15-4|IEEE}} ratified 802.3 in 1983, giving [[ethernet|Ethernet]] its formal identity.

The evolution from shared media to switched networks was transformative. Hubs gave way to switches, which learn {{mac-address|MAC}} addresses and forward frames only to the correct port — eliminating collisions entirely. {{full-duplex|Full-duplex}} links doubled effective {{bandwidth|bandwidth}}. Today, [[ethernet|Ethernet]] spans from 10 Mbps to 800 Gbps ({{ieee-802-15-4|IEEE}} 802.3df, ratified 2024) and beyond, powering everything from home networks to hyperscale data centers. [[arp|ARP]] resolves [[ip|IP]] addresses to [[ethernet|Ethernet]] {{mac-address|MAC}} addresses, and [[wifi|Wi-Fi]] extends [[ethernet|Ethernet]]'s reach wirelessly by bridging [[wifi|802.11]] frames to 802.3 frames at the {{access-point|access point}}.`,
	howItWorks: [
		{
			title: 'Frame construction',
			description:
				'The sender wraps the {{payload|payload}} in an [[ethernet|Ethernet]] {{frame|frame}}: a 7-byte preamble and 1-byte Start Frame Delimiter for clock sync, followed by a 6-byte destination {{mac-address|MAC}}, 6-byte source {{mac-address|MAC}}, 2-byte EtherType (identifying the {{payload|payload}} protocol), the {{payload|payload}} itself (46-1500 bytes), and a 4-byte Frame Check Sequence ({{fcs|FCS}}) for error detection.'
		},
		{
			title: 'MAC addressing',
			description:
				'Every network interface has a 48-bit {{mac-address|MAC address}} (e.g., `AA:BB:CC:DD:EE:FF`), typically burned into hardware. The first 24 bits identify the manufacturer ({{oui|OUI}}). {{broadcast|Broadcast}} frames use `FF:FF:FF:FF:FF:FF` as the destination to reach all devices on the segment.'
		},
		{
			title: 'Switch forwarding',
			description:
				'Switches maintain a {{mac-address|MAC address}} table mapping each {{mac-address|MAC}} to a physical port. When a frame arrives, the switch looks up the destination {{mac-address|MAC}} and forwards it only to the correct port. Unknown destinations are flooded to all ports. This table is learned dynamically by observing source MACs.'
		},
		{
			title: 'Error detection via FCS',
			description:
				'The sender computes a {{crc|CRC}}-32 {{checksum|checksum}} over the frame and appends it as the Frame Check Sequence. The receiver recalculates the {{crc|CRC}} and silently discards frames with mismatches — [[ethernet|Ethernet]] detects errors but does not retransmit. That job belongs to higher-layer protocols like [[tcp|TCP]].'
		}
	],
	useCases: [
		'LAN connectivity in homes and offices',
		'Data center server-to-switch interconnects',
		'Industrial automation and factory floor networking',
		'Backbone networking between switches and routers',
		'{{vlan|VLAN}} segmentation for network isolation and security'
	],
	codeExample: {
		language: 'python',
		code: `from scapy.all import Ether, IP, ICMP, sendp, sniff

# Craft an Ethernet frame with an IP/ICMP payload
frame = Ether(dst="ff:ff:ff:ff:ff:ff", src="aa:bb:cc:dd:ee:ff", type=0x0800) \\
        / IP(dst="192.168.1.1") \\
        / ICMP()

# Send the frame on the wire (requires root)
sendp(frame, iface="eth0", verbose=False)

# Sniff Ethernet frames
def handle(pkt):
    print(f"{pkt[Ether].src} -> {pkt[Ether].dst} "
          f"type=0x{pkt[Ether].type:04x}")

sniff(iface="eth0", prn=handle, count=10)`,
		caption:
			'Using scapy to craft, send, and sniff raw [[ethernet|Ethernet]] frames — you can see every {{mac-address|MAC address}} and EtherType on the wire',
		alternatives: [
			{
				language: 'javascript',
				code: `// Node.js — inspecting Ethernet frames with the pcap library
const pcap = require('pcap');

// Create a capture session on eth0
const session = pcap.createSession('eth0', {
  filter: 'ether proto 0x0800'  // Only IPv4 frames
});

session.on('packet', (rawPacket) => {
  const packet = pcap.decode.packet(rawPacket);
  const ether = packet.payload;

  console.log(
    \`\${ether.shost} -> \${ether.dhost}\`,
    \`EtherType: 0x\${ether.ethertype.toString(16)}\`,
    \`Length: \${rawPacket.buf.length} bytes\`
  );
});

console.log('Capturing Ethernet frames on eth0...');`
			},
			{
				language: 'cli',
				code: `# Capture Ethernet frames with tcpdump
sudo tcpdump -i eth0 -e -c 10

# Show Ethernet header details with tshark
tshark -i eth0 -T fields -e eth.src -e eth.dst -e eth.type -c 10

# Display all MAC addresses the switch has learned (Linux bridge)
bridge fdb show

# Show your interface's MAC address
ip link show eth0

# Watch Ethernet frame counters
ethtool -S eth0 | head -20`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Ethernet Frame Format',
						code: `Ethernet II Frame:
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |  Preamble (7) | SFD (1) |                 |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |  Dest MAC (6 bytes)  |  Src MAC (6 bytes) |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |  EtherType (2) |     Payload (46-1500)     |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |            FCS (4 bytes)                   |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  Total: 64-1518 bytes (excluding preamble/SFD)`
					},
					{
						title: 'Example Captured Frame',
						code: `Ethernet Frame (captured):
  Dst MAC: ff:ff:ff:ff:ff:ff (Broadcast)
  Src MAC: aa:bb:cc:dd:ee:ff
  EtherType: 0x0806 (ARP)
  Payload (28 bytes):
    00 01 08 00 06 04 00 01  HW=Ether, Proto=IPv4
    aa bb cc dd ee ff c0 a8  Sender MAC + IP
    01 0a 00 00 00 00 00 00  Target MAC (unknown)
    c0 a8 01 01              Target IP: 192.168.1.1
  FCS: 0x3a4b5c6d [valid]`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Sub-microsecond latency requires cut-through switching at high speeds (25+ Gbps); store-and-forward at 1 Gbps takes ~12 \u00b5s for a full-size frame. Cut-through at lower speeds: ~5 \u00b5s.',
		throughput:
			'10 Mbps to 800 Gbps depending on standard (IEEE 802.3df ratified 2024); 1 Gbps and 10 Gbps most common today',
		overhead:
			'18-byte header (14 header + 4 FCS) + 8-byte preamble/SFD; ~26 bytes per frame minimum'
	},
	connections: ['wifi', 'arp', 'ip', 'ipv6'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[ethernet|Ethernet]]'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethernet_frame.svg/500px-Ethernet_frame.svg.png',
		alt: 'Diagram showing the structure of an Ethernet II frame with preamble, MAC addresses, EtherType, payload, and FCS fields',
		caption:
			"The [[ethernet|Ethernet]] frame structure — every packet on your local network is wrapped in this format. The 6-byte destination and source {{mac-address|MAC}} addresses identify devices, the EtherType field (0x0800 for [[ip|IP]], 0x0806 for [[arp|ARP]]) tells the receiver what's inside, and the {{fcs|FCS}} {{checksum|checksum}} catches transmission errors.",
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
