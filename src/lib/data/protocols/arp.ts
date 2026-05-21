import type { Protocol } from '../types';

export const arp: Protocol = {
	id: 'arp',
	name: 'Address Resolution Protocol',
	abbreviation: 'ARP',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1982,
	rfc: 'RFC 826',
	oneLiner: 'Translates [[ip|IP]] addresses to {{mac-address|MAC}} addresses — the bridge between Layer 3 and Layer 2.',
	overview: `[[arp|ARP]] is the glue between [[ip|IP]] addresses and [[ethernet|Ethernet]] {{mac-address|MAC addresses}}. When your computer wants to send a {{packet|packet}} to 192.168.1.1, it knows the [[ip|IP]] but not the {{mac-address|MAC address}} of the destination. [[arp|ARP]] {{broadcast|broadcasts}} a question to the entire local network: "Who has 192.168.1.1? Tell me your {{mac-address|MAC address}}." The owner responds with a {{unicast|unicast}} reply containing its {{mac-address|MAC}}, and the sender caches this mapping for future use.

Under the hood, [[arp|ARP]] uses EtherType 0x0806 and operates directly on [[ethernet|Ethernet]] — it has no [[ip|IP]] header. The request is {{broadcast|broadcast}} to \`FF:FF:FF:FF:FF:FF\`, so every device on the segment receives it, but only the target replies. That reply is {{unicast|unicast}} directly back to the requester. The resulting [[ip|IP]]-to-{{mac-address|MAC}} mapping is stored in the [[arp|ARP]] cache (also called the [[arp|ARP]] table) with a {{ttl|time-to-live}} — typically 15-45 seconds on modern systems (randomized per [[rfc:4861|RFC 4861]]) — after which the entry expires and must be re-resolved.

[[arp|ARP]]'s simplicity is both its strength and its weakness. There is zero authentication — any device can claim to own any {{ip-address|IP address}}. This makes {{spoofing|ARP spoofing}} (or [[arp|ARP]] poisoning) trivial: an attacker sends fake [[arp|ARP]] replies to redirect traffic through their machine, enabling {{man-in-the-middle|man-in-the-middle}} attacks. Countermeasures include Dynamic [[arp|ARP]] Inspection (DAI) on managed switches, static [[arp|ARP]] entries for critical {{hosts-bare|hosts}}, and protocols like [[dhcp|DHCP]] snooping. Gratuitous [[arp|ARP]] — where a host announces its own [[ip|IP]]/{{mac-address|MAC}} mapping without being asked — is used for duplicate [[ip|IP]] detection and for updating caches after a {{mac-address|MAC address}} change (e.g., during {{failover|failover}}). On [[wifi|Wi-Fi]] networks, [[arp|ARP]] works the same way but traverses the wireless medium, with the {{access-point|access point}} bridging requests between wired and wireless segments.`,
	howItWorks: [
		{
			title: 'Check ARP cache',
			description:
				'Before sending any frame, the {{os|OS}} checks its local [[arp|ARP]] cache for an existing {{ip-address|IP}}-to-{{mac-address|MAC}} mapping. If a valid (non-expired) entry exists, it uses the cached {{mac-address|MAC address}} immediately and skips the rest of the process.'
		},
		{
			title: 'Broadcast ARP request',
			description:
				'If no cache entry exists, the sender crafts an [[arp|ARP]] request with its own [[ip|IP]]/{{mac-address|MAC}} as the source and the target [[ip|IP]] with an empty {{mac-address|MAC}} (\`00:00:00:00:00:00\`). This is sent as an [[ethernet|Ethernet]] {{broadcast|broadcast}} (\`FF:FF:FF:FF:FF:FF\`), reaching every device on the local segment.'
		},
		{
			title: 'Unicast ARP reply',
			description:
				"The device that owns the requested {{ip-address|IP address}} responds with a {{unicast|unicast}} [[arp|ARP]] reply directly to the sender, filling in its {{mac-address|MAC address}}. All other devices on the network ignore the request (though they may {{bgp-update|update}} their own caches with the sender's mapping)."
		},
		{
			title: 'Cache update',
			description:
				'Both the sender and the responder {{bgp-update|update}} their [[arp|ARP]] caches with the new mapping. Entries have a {{ttl|TTL}} (typically 60s-20min depending on {{os|OS}}) and are evicted when they expire, triggering a fresh [[arp|ARP]] request on the next packet to that [[ip|IP]].'
		},
		{
			title: 'Gratuitous ARP',
			description:
				"A host can {{broadcast|broadcast}} an unsolicited [[arp|ARP]] reply announcing its own [[ip|IP]]/{{mac-address|MAC}} mapping. This is used at boot time for duplicate [[ip|IP]] detection, after a {{nic|NIC}} replacement to {{bgp-update|update}} neighbors' caches, and during {{failover|failover}} in high-availability setups to redirect traffic to a new machine."
		}
	],
	useCases: [
		'Resolving [[ip|IP]] addresses to MAC addresses on local networks',
		"{{default-gateway|Default gateway}} resolution — finding the router's {{mac-address|MAC address}}",
		'Duplicate [[ip|IP]] address detection at boot time',
		'Failover and high-availability (gratuitous [[arp|ARP]] updates)',
		'Network troubleshooting and diagnostics (arp -a, arping)'
	],
	codeExample: {
		language: 'python',
		code: `from scapy.all import ARP, Ether, srp

# Send an ARP request to discover a host's MAC address
target_ip = "192.168.1.1"

# Craft ARP request inside an Ethernet broadcast
packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=target_ip)

# Send and receive responses (timeout 2 seconds)
result, unanswered = srp(packet, timeout=2, verbose=False)

for sent, received in result:
    print(f"IP: {received.psrc}  MAC: {received.hwsrc}")

# Scan an entire subnet
for ip_suffix in range(1, 255):
    packet = Ether(dst="ff:ff:ff:ff:ff:ff") \\
             / ARP(pdst=f"192.168.1.{ip_suffix}")
    result, _ = srp(packet, timeout=1, verbose=False)
    for _, received in result:
        print(f"  {received.psrc} -> {received.hwsrc}")`,
		caption:
			'[[arp|ARP]] scanning with scapy — discover every device on the local network by broadcasting [[arp|ARP]] requests',
		alternatives: [
			{
				language: 'javascript',
				code: `// Node.js — reading the system ARP table
const { execSync } = require('child_process');

// Read the OS ARP cache
const arpTable = execSync('arp -a').toString();
console.log('Current ARP cache:');
console.log(arpTable);

// Parse entries (macOS/Linux format)
const entries = arpTable.split('\\n')
  .filter(line => line.includes('at'))
  .map(line => {
    const match = line.match(
      /\\(([\\d.]+)\\) at ([\\w:]+)/
    );
    return match
      ? { ip: match[1], mac: match[2] }
      : null;
  })
  .filter(Boolean);

entries.forEach(({ ip, mac }) => {
  console.log(\`IP: \${ip.padEnd(16)} MAC: \${mac}\`);
});`
			},
			{
				language: 'cli',
				code: `# View the ARP cache
arp -a

# Send an ARP request to a specific IP
arping -c 3 192.168.1.1

# Clear the ARP cache (Linux)
sudo ip neigh flush all

# Add a static ARP entry (prevents spoofing for critical hosts)
sudo arp -s 192.168.1.1 AA:BB:CC:DD:EE:FF

# Monitor ARP traffic in real time
sudo tcpdump -i eth0 arp -e

# Watch ARP cache changes (Linux)
ip monitor neigh`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'ARP Request (Broadcast)',
						code: `Ethernet Frame:
  Dst: ff:ff:ff:ff:ff:ff (Broadcast)
  Src: aa:bb:cc:dd:ee:ff
  EtherType: 0x0806 (ARP)

ARP Request:
  Hardware Type: 1 (Ethernet)
  Protocol Type: 0x0800 (IPv4)
  HW Addr Len: 6
  Proto Addr Len: 4
  Opcode: 1 (Request)
  Sender MAC: aa:bb:cc:dd:ee:ff
  Sender IP:  192.168.1.10
  Target MAC: 00:00:00:00:00:00 (unknown)
  Target IP:  192.168.1.1`
					},
					{
						title: 'ARP Reply (Unicast)',
						code: `Ethernet Frame:
  Dst: aa:bb:cc:dd:ee:ff
  Src: 11:22:33:44:55:66
  EtherType: 0x0806 (ARP)

ARP Reply:
  Hardware Type: 1 (Ethernet)
  Protocol Type: 0x0800 (IPv4)
  HW Addr Len: 6
  Proto Addr Len: 4
  Opcode: 2 (Reply)
  Sender MAC: 11:22:33:44:55:66
  Sender IP:  192.168.1.1
  Target MAC: aa:bb:cc:dd:ee:ff
  Target IP:  192.168.1.10`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Single broadcast + unicast reply: typically < 1 ms on a local LAN; cache hits are instant',
		throughput: 'N/A — ARP is a control-plane protocol, not a data-transfer protocol',
		overhead:
			'28-byte ARP payload inside a 42-byte Ethernet header+payload (14-byte header + 28-byte ARP); minimum Ethernet frame on wire is 64 bytes (18 bytes of padding added for short frames like ARP). No IP header involved.'
	},
	connections: ['ethernet', 'ip', 'wifi', 'dhcp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Address_Resolution_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc826'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Ethernet_Switch_%28Front_View%29.jpg/500px-Ethernet_Switch_%28Front_View%29.jpg',
		alt: 'Front view of an Ethernet network switch with multiple RJ-45 ports',
		caption:
			'An [[ethernet|Ethernet]] switch — where [[arp|ARP]] does its work. When a host needs to send an [[ip|IP]] packet locally, [[arp|ARP]] broadcasts "who has this [[ip|IP]]?" on the switch\'s network, and the target replies with its {{mac-address|MAC address}}.',
		credit: 'Photo: CCDBarcodeScanner / CC BY-SA 4.0, via Wikimedia Commons'
	}
};
