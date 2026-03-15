import type { Protocol } from '../types';

export const networkFoundationsProtocols: Protocol[] = [
	{
		id: 'ethernet',
		name: 'Ethernet',
		abbreviation: 'Ethernet',
		categoryId: 'network-foundations',
		port: undefined,
		year: 1983,
		rfc: undefined,
		oneLiner: 'The wired foundation of local networks — framing, addressing, and switching at Layer 2.',
		overview: `Ethernet is the {{protocol|protocol}} that makes local area networks work. Every time your computer talks to another device on the same network — a printer, a file server, a router — it {{encapsulation|wraps data}} in an Ethernet {{frame|frame}} with a source and destination {{mac-address|MAC address}}. The EtherType field tells the receiver what's inside: 0x0800 for [[ip|IP]], 0x0806 for [[arp|ARP]], 0x86DD for IPv6. It's the lingua franca of wired networking, operating at Layer 2 of the {{osi-model|OSI model}}.

Ethernet was invented by Bob Metcalfe at Xerox PARC in 1973, inspired by the ALOHAnet wireless network in Hawaii. The original design used a shared coaxial cable (a "bus") where all devices listened to all traffic and used CSMA/CD (Carrier Sense Multiple Access with Collision Detection) to manage access. DEC, Intel, and Xerox published the DIX standard in 1980, and the IEEE ratified 802.3 in 1983, giving Ethernet its formal identity.

The evolution from shared media to switched networks was transformative. Hubs gave way to switches, which learn MAC addresses and forward frames only to the correct port — eliminating collisions entirely. {{full-duplex|Full-duplex}} links doubled effective {{bandwidth|bandwidth}}. Today, Ethernet spans from 10 Mbps to 800 Gbps (IEEE 802.3df, ratified 2024) and beyond, powering everything from home networks to hyperscale data centers. [[arp|ARP]] resolves [[ip|IP]] addresses to Ethernet MAC addresses, and [[wifi|Wi-Fi]] extends Ethernet's reach wirelessly by bridging 802.11 frames to 802.3 frames at the {{access-point|access point}}.`,
		howItWorks: [
			{
				title: 'Frame construction',
				description:
					'The sender wraps the payload in an Ethernet frame: a 7-byte preamble and 1-byte Start Frame Delimiter for clock sync, followed by a 6-byte destination MAC, 6-byte source MAC, 2-byte EtherType (identifying the payload protocol), the payload itself (46-1500 bytes), and a 4-byte Frame Check Sequence (FCS) for error detection.'
			},
			{
				title: 'MAC addressing',
				description:
					'Every network interface has a 48-bit MAC address (e.g., \`AA:BB:CC:DD:EE:FF\`), typically burned into hardware. The first 24 bits identify the manufacturer (OUI). Broadcast frames use \`FF:FF:FF:FF:FF:FF\` as the destination to reach all devices on the segment.'
			},
			{
				title: 'Switch forwarding',
				description:
					'Switches maintain a MAC address table mapping each MAC to a physical port. When a frame arrives, the switch looks up the destination MAC and forwards it only to the correct port. Unknown destinations are flooded to all ports. This table is learned dynamically by observing source MACs.'
			},
			{
				title: 'Error detection via FCS',
				description:
					'The sender computes a CRC-32 checksum over the frame and appends it as the Frame Check Sequence. The receiver recalculates the CRC and silently discards frames with mismatches — Ethernet detects errors but does not retransmit. That job belongs to higher-layer protocols like TCP.'
			}
		],
		useCases: [
			'LAN connectivity in homes and offices',
			'Data center server-to-switch interconnects',
			'Industrial automation and factory floor networking',
			'Backbone networking between switches and routers',
			'VLAN segmentation for network isolation and security'
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
				'Using scapy to craft, send, and sniff raw Ethernet frames — you can see every MAC address and EtherType on the wire',
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
			latency: 'Sub-microsecond latency requires cut-through switching at high speeds (25+ Gbps); store-and-forward at 1 Gbps takes ~12 \u00b5s for a full-size frame. Cut-through at lower speeds: ~5 \u00b5s.',
			throughput: '10 Mbps to 800 Gbps depending on standard (IEEE 802.3df ratified 2024); 1 Gbps and 10 Gbps most common today',
			overhead: '18-byte header (14 header + 4 FCS) + 8-byte preamble/SFD; ~26 bytes per frame minimum'
		},
		connections: ['wifi', 'arp', 'ip', 'ipv6'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Ethernet'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethernet_frame.svg/600px-Ethernet_frame.svg.png',
			alt: 'Diagram showing the structure of an Ethernet II frame with preamble, MAC addresses, EtherType, payload, and FCS fields',
			caption:
				'The Ethernet frame structure — every packet on your local network is wrapped in this format. The 6-byte destination and source MAC addresses identify devices, the EtherType field (0x0800 for IP, 0x0806 for ARP) tells the receiver what\'s inside, and the FCS checksum catches transmission errors.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'wifi',
		name: 'Wi-Fi',
		abbreviation: '802.11',
		categoryId: 'network-foundations',
		port: undefined,
		year: 1997,
		rfc: undefined,
		oneLiner:
			'Wireless local networking — Ethernet without the cable, plus encryption and airtime management.',
		overview: `Wi-Fi brings [[ethernet|Ethernet]]-style networking to the airwaves. Instead of transmitting {{frame|frames}} over copper or fiber, 802.11 uses radio frequencies (2.4 GHz, 5 GHz, and now 6 GHz) to send data wirelessly. But air is a shared medium — everyone within range can hear everything — so Wi-Fi adds {{encryption|encryption}} (WPA2/WPA3), collision avoidance (CSMA/CA instead of Ethernet's CSMA/CD), and a more complex frame format with up to four MAC addresses (three typically used): the receiver address (RA), transmitter address (TA), and destination address (DA) — plus an optional fourth address used in wireless bridging (WDS) mode.

The differences from [[ethernet|Ethernet]] are deeper than just "no cable." Because wireless stations can't detect collisions while transmitting (the "hidden node" problem), Wi-Fi uses RTS/CTS {{handshake|handshakes}} and carrier sensing to avoid them. Every frame must be {{ack|acknowledged}} — if the sender doesn't get an ACK, it {{retransmission|retransmits}}. The {{access-point|access point}} bridges wireless and wired worlds, translating between 802.11 and 802.3 frames so that [[arp|ARP]], [[ip|IP]], and everything above works seamlessly across both.

Wi-Fi has evolved dramatically since the original 802.11 standard in 1997 (2 Mbps). 802.11b (1999) brought 11 Mbps, 802.11g (2003) hit 54 Mbps, 802.11n (Wi-Fi 4, 2009) introduced MIMO for 600 Mbps, 802.11ac (Wi-Fi 5, 2014) pushed to gigabit speeds, 802.11ax (Wi-Fi 6, 2020) added OFDMA for dense environments, and 802.11be (Wi-Fi 7, 2024) delivers up to 46 Gbps with multi-link operation. Each generation brought better throughput, lower {{latency|latency}}, and improved handling of crowded airspace.`,
		howItWorks: [
			{
				title: 'Beacon scanning',
				description:
					'Access points broadcast beacon frames every ~100 ms announcing their SSID, supported rates, encryption type, and channel. Clients scan channels (passively listening or actively sending probe requests) to discover available networks.'
			},
			{
				title: 'Authentication and association',
				description:
					'The client authenticates with the AP (Open System or SAE for WPA3), then sends an Association Request specifying desired parameters. The AP responds with an Association Response, assigning the client an Association ID and granting network access.'
			},
			{
				title: '4-way handshake (WPA2/WPA3)',
				description:
					'After association, the client and AP perform a 4-message EAPOL handshake to derive per-session encryption keys (PTK). Both sides prove they know the passphrase without revealing it. This produces the temporal keys used to encrypt all subsequent data frames.'
			},
			{
				title: 'Data frames with CSMA/CA',
				description:
					'Before transmitting, the sender listens for a clear channel (carrier sense) and waits a random backoff time (collision avoidance). Data frames carry up to four MAC addresses (three typically used) — RA, TA, and DA — and are encrypted with the session keys. Every unicast frame must be acknowledged by the receiver.'
			},
			{
				title: 'Bridge to Ethernet',
				description:
					'The access point translates between 802.11 and [[ethernet|Ethernet]] (802.3) frames. It strips the wireless-specific headers, rewrites the frame as a standard Ethernet frame, and forwards it to the wired network — making the transition invisible to higher-layer protocols like [[ip|IP]] and [[tcp|TCP]].'
			}
		],
		useCases: [
			'Home and office wireless internet access',
			'Mobile device connectivity (phones, tablets, laptops)',
			'IoT and smart home device networking',
			'Public hotspots in airports, cafes, and hotels',
			'Enterprise campus wireless with roaming and 802.1X authentication'
		],
		codeExample: {
			language: 'python',
			code: `from scapy.all import *

# Sniff Wi-Fi beacon frames (requires monitor mode)
def handle_beacon(pkt):
    if pkt.haslayer(Dot11Beacon):
        ssid = pkt[Dot11Elt].info.decode(errors='ignore')
        bssid = pkt[Dot11].addr2
        channel = pkt[Dot11Elt:3].info[0]
        print(f"SSID: {ssid:20s}  BSSID: {bssid}  Ch: {channel}")

# Put interface in monitor mode first:
#   sudo airmon-ng start wlan0
sniff(iface="wlan0mon", prn=handle_beacon,
      lfilter=lambda p: p.haslayer(Dot11Beacon), count=20)`,
			caption:
				'Sniffing Wi-Fi beacon frames with scapy in monitor mode — revealing SSIDs, BSSIDs, and channels',
			alternatives: [
				{
					language: 'javascript',
					code: `// Node.js — scanning for Wi-Fi networks using node-wifi (note: unmaintained, consider native OS commands)
const wifi = require('node-wifi');

wifi.init({ iface: null }); // auto-detect interface

// Scan for available networks
wifi.scan((err, networks) => {
  if (err) { console.error(err); return; }

  networks.forEach((net) => {
    console.log(
      \`SSID: \${net.ssid.padEnd(20)}\`,
      \`Signal: \${net.signal_level} dBm\`,
      \`Security: \${net.security}\`,
      \`Channel: \${net.channel}\`
    );
  });
});

// Connect to a network
wifi.connect({ ssid: 'MyNetwork', password: 'secret' }, (err) => {
  if (err) console.error('Connection failed:', err);
  else console.log('Connected!');
});`
				},
				{
					language: 'cli',
					code: `# Scan for Wi-Fi networks (Linux)
sudo iw dev wlan0 scan | grep -E "SSID|signal|freq"

# Show current Wi-Fi connection details
iw dev wlan0 link

# Monitor Wi-Fi frames in real time (monitor mode)
sudo tcpdump -i wlan0mon -e -s 256 type mgt subtype beacon

# Show Wi-Fi interface info (macOS)
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s

# Display Wi-Fi statistics
iw dev wlan0 station dump`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: '802.11 Data Frame Format',
							code: `802.11 Data Frame:
  Frame Control: 0x0842
    Type: Data (2), Subtype: QoS Data (8)
    Flags: To DS, Protected
  Duration: 48 \u00b5s
  Address 1 (RA/BSSID): 00:1A:2B:3C:4D:5E
  Address 2 (TA/Source): AA:BB:CC:DD:EE:FF
  Address 3 (DA/Dest):   11:22:33:44:55:66
  Seq Control: Fragment=0, Sequence=1042
  QoS Control: TID=0 (Best Effort)

  Encrypted Payload (CCMP):
    PN: 0x000000004A2B
    Key ID: 0
    Data: [encrypted payload]
    MIC: 0xA1B2C3D4E5F6A7B8`
						},
						{
							title: 'Beacon Frame',
							code: `802.11 Beacon Frame:
  Frame Control: 0x0080
    Type: Management (0), Subtype: Beacon (8)
  Duration: 0
  Destination: ff:ff:ff:ff:ff:ff (Broadcast)
  Source (BSSID): 00:1A:2B:3C:4D:5E
  Timestamp: 1234567890 \u00b5s
  Beacon Interval: 100 TU (102.4 ms)
  Capabilities: ESS, Privacy, Short Preamble

  Tagged Parameters:
    SSID: "MyNetwork"
    Supported Rates: 6, 9, 12, 18, 24, 36, 48, 54 Mbps
    Channel: 6 (2.437 GHz)
    RSN (WPA2): CCMP, PSK
    HT Capabilities: 40MHz, SGI, MCS 0-15`
						}
					]
				}
			]
		},
		performance: {
			latency: '1-5 ms typical for local access; higher under contention or with power-save modes',
			throughput:
				'Wi-Fi 5: ~800 Mbps real-world; Wi-Fi 6: ~1.2 Gbps; Wi-Fi 7: up to ~5 Gbps in ideal conditions',
			overhead:
				'24-36 byte MAC header depending on frame type and flags (vs 14 for Ethernet) + encryption overhead (CCMP adds 16 bytes); acknowledgment frames add airtime cost'
		},
		connections: ['ethernet', 'arp', 'ip', 'ipv6'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Wi-Fi',
			official: 'https://www.wi-fi.org/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/802.11_MAC_Frame.svg/600px-802.11_MAC_Frame.svg.png',
			alt: 'Diagram of an 802.11 Wi-Fi MAC frame showing frame control, duration, four address fields, sequence control, and FCS',
			caption:
				'The 802.11 Wi-Fi MAC frame format — more complex than Ethernet because wireless needs extra fields. Up to four MAC addresses handle the receiver, transmitter, destination, and source, while the Frame Control field encodes the frame type, encryption status, and power management flags.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
		id: 'arp',
		name: 'Address Resolution Protocol',
		abbreviation: 'ARP',
		categoryId: 'network-foundations',
		port: undefined,
		year: 1982,
		rfc: 'RFC 826',
		oneLiner:
			'Translates IP addresses to MAC addresses — the bridge between Layer 3 and Layer 2.',
		overview: `ARP is the glue between [[ip|IP]] addresses and [[ethernet|Ethernet]] {{mac-address|MAC addresses}}. When your computer wants to send a {{packet|packet}} to 192.168.1.1, it knows the IP but not the MAC address of the destination. ARP {{broadcast|broadcasts}} a question to the entire local network: "Who has 192.168.1.1? Tell me your MAC address." The owner responds with a {{unicast|unicast}} reply containing its MAC, and the sender caches this mapping for future use.

Under the hood, ARP uses EtherType 0x0806 and operates directly on [[ethernet|Ethernet]] — it has no IP header. The request is broadcast to \`FF:FF:FF:FF:FF:FF\`, so every device on the segment receives it, but only the target replies. That reply is unicast directly back to the requester. The resulting IP-to-MAC mapping is stored in the ARP cache (also called the ARP table) with a {{ttl|time-to-live}} — typically 15-45 seconds on modern systems (randomized per RFC 4861) — after which the entry expires and must be re-resolved.

ARP's simplicity is both its strength and its weakness. There is zero authentication — any device can claim to own any {{ip-address|IP address}}. This makes {{spoofing|ARP spoofing}} (or ARP poisoning) trivial: an attacker sends fake ARP replies to redirect traffic through their machine, enabling {{man-in-the-middle|man-in-the-middle}} attacks. Countermeasures include Dynamic ARP Inspection (DAI) on managed switches, static ARP entries for critical hosts, and protocols like [[dhcp|DHCP]] snooping. Gratuitous ARP — where a host announces its own IP/MAC mapping without being asked — is used for duplicate IP detection and for updating caches after a MAC address change (e.g., during failover). On [[wifi|Wi-Fi]] networks, ARP works the same way but traverses the wireless medium, with the access point bridging requests between wired and wireless segments.`,
		howItWorks: [
			{
				title: 'Check ARP cache',
				description:
					'Before sending any frame, the OS checks its local ARP cache for an existing IP-to-MAC mapping. If a valid (non-expired) entry exists, it uses the cached MAC address immediately and skips the rest of the process.'
			},
			{
				title: 'Broadcast ARP request',
				description:
					'If no cache entry exists, the sender crafts an ARP request with its own IP/MAC as the source and the target IP with an empty MAC (\`00:00:00:00:00:00\`). This is sent as an Ethernet broadcast (\`FF:FF:FF:FF:FF:FF\`), reaching every device on the local segment.'
			},
			{
				title: 'Unicast ARP reply',
				description:
					'The device that owns the requested IP address responds with a unicast ARP reply directly to the sender, filling in its MAC address. All other devices on the network ignore the request (though they may update their own caches with the sender\'s mapping).'
			},
			{
				title: 'Cache update',
				description:
					'Both the sender and the responder update their ARP caches with the new mapping. Entries have a TTL (typically 60s-20min depending on OS) and are evicted when they expire, triggering a fresh ARP request on the next packet to that IP.'
			},
			{
				title: 'Gratuitous ARP',
				description:
					'A host can broadcast an unsolicited ARP reply announcing its own IP/MAC mapping. This is used at boot time for duplicate IP detection, after a NIC replacement to update neighbors\' caches, and during failover in high-availability setups to redirect traffic to a new machine.'
			}
		],
		useCases: [
			'Resolving IP addresses to MAC addresses on local networks',
			'Default gateway resolution — finding the router\'s MAC address',
			'Duplicate IP address detection at boot time',
			'Failover and high-availability (gratuitous ARP updates)',
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
				'ARP scanning with scapy — discover every device on the local network by broadcasting ARP requests',
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
			latency: 'Single broadcast + unicast reply: typically < 1 ms on a local LAN; cache hits are instant',
			throughput: 'N/A — ARP is a control-plane protocol, not a data-transfer protocol',
			overhead: '28-byte ARP payload inside a 42-byte Ethernet header+payload (14-byte header + 28-byte ARP); minimum Ethernet frame on wire is 64 bytes (18 bytes of padding added for short frames like ARP). No IP header involved.'
		},
		connections: ['ethernet', 'ip', 'wifi', 'dhcp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Address_Resolution_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc826'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Ethernet_Switch_%28Front_View%29.jpg/600px-Ethernet_Switch_%28Front_View%29.jpg',
			alt: 'Front view of an Ethernet network switch with multiple RJ-45 ports',
			caption:
				'An Ethernet switch — where ARP does its work. When a host needs to send an IP packet locally, ARP broadcasts "who has this IP?" on the switch\'s network, and the target replies with its MAC address.',
			credit: 'Photo: CCDBarcodeScanner / CC BY-SA 4.0, via Wikimedia Commons'
		}
	},
	{
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
					'The sending host wraps the transport-layer segment (TCP or UDP) in an IP header containing the source IP, destination IP, TTL (typically 64 or 128), protocol number, header checksum, and optional fields. This IP packet is then passed down to the link layer for framing.'
			},
			{
				title: 'Local routing decision',
				description:
					'The sender checks if the destination IP is on the same subnet (using its subnet mask). If yes, it uses ARP to find the destination\'s MAC address and sends directly. If no, it forwards the packet to the default gateway (router), whose MAC is also resolved via ARP.'
			},
			{
				title: 'Router forwarding and TTL decrement',
				description:
					'Each router examines the destination IP, consults its routing table, decrements the TTL by 1, recalculates the header checksum, and forwards the packet out the appropriate interface. If TTL reaches 0, the packet is dropped and an ICMP Time Exceeded message is sent back (this is how traceroute works).'
			},
			{
				title: 'Fragmentation if needed',
				description:
					'If a packet is larger than the next link\'s MTU (Maximum Transmission Unit, typically 1500 bytes for Ethernet), the router fragments it into smaller IP packets. Each fragment carries offset information so the destination can reassemble them. Modern practice avoids fragmentation using Path MTU Discovery.'
			},
			{
				title: 'Destination reassembly and delivery',
				description:
					'The destination host reassembles any fragments using the Identification field and fragment offsets, verifies the header checksum, strips the IP header, and delivers the payload to the correct transport-layer protocol (TCP, UDP, ICMP) based on the Protocol field.'
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
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/IPv4_Packet-en.svg/600px-IPv4_Packet-en.svg.png',
			alt: 'Diagram of the IPv4 packet header showing all fields: version, IHL, DSCP, total length, identification, flags, TTL, protocol, checksum, source and destination addresses',
			caption:
				'The IPv4 packet header — every packet on the internet carries this 20-byte structure. Key fields include TTL (decremented by each router to prevent loops), Protocol (6=TCP, 17=UDP), and the source/destination IP addresses that make global routing possible.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
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

By 2026, IPv6 carries over 45% of Google's traffic, and major mobile networks, cloud providers, and {{cdn|CDNs}} run IPv6-primary. The transition from IPv4 is happening — just slower than anyone predicted.`,
		howItWorks: [
			{
				title: 'Addressing (128-bit)',
				description:
					'Addresses are written as eight groups of four hex digits (2001:0db8:85a3::8a2e:0370:7334). Link-local (fe80::), global unicast (2000::/3), and multicast (ff00::/8) replace IPv4\'s broadcast model.'
			},
			{
				title: 'Simplified header',
				description:
					'Fixed 40-byte header: Version (4b), Traffic Class (8b), Flow Label (20b), Payload Length (16b), Next Header (8b), Hop Limit (8b), Source (128b), Destination (128b). No checksum, no options — just clean forwarding.'
			},
			{
				title: 'Extension headers',
				description:
					'Optional features (routing, fragmentation, security, mobility) are chained via Next Header fields. Each extension points to the next, creating a flexible chain processed only by the destination — not by every router. The one exception is the Hop-by-Hop Options header (Next Header = 0), which must be examined by every router along the path.'
			},
			{
				title: 'Neighbor Discovery (NDP)',
				description:
					'Replaces ARP, ICMP Router Discovery, and ICMP Redirect. Uses ICMPv6 messages: Router Solicitation/Advertisement (find routers), Neighbor Solicitation/Advertisement (resolve addresses via solicited-node multicast).'
			},
			{
				title: 'Stateless autoconfiguration (SLAAC)',
				description:
					'Hosts generate their own global address from the network prefix (learned via Router Advertisement) and their interface identifier. No DHCP server needed — plug in and go. Note: by default SLAAC embeds the MAC address in the IPv6 address, which is a privacy concern — Privacy Extensions (RFC 8981) replace this with randomized, temporary interface identifiers that rotate periodically.'
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
			caption:
				'IPv6 sockets use AF_INET6 and 4-tuple addresses (host, port, flowinfo, scope_id)',
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
				'Fixed 40-byte header (vs IPv4\'s variable 20-60 bytes). Extension headers add overhead only when used. No per-hop checksum computation saves router CPU.'
		},
		connections: ['ip', 'tcp', 'udp', 'ethernet', 'wifi', 'dns', 'dhcp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/IPv6',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8200'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ipv6_address_leading_zeros.svg/600px-Ipv6_address_leading_zeros.svg.png',
			alt: 'Diagram showing IPv6 address notation with leading zeros compressed and groups separated by colons',
			caption:
				'IPv6 address notation — eight groups of four hexadecimal digits separated by colons. Leading zeros can be omitted and consecutive zero groups replaced with :: for brevity (2001:0db8::1).',
			credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
		}
	}
];
