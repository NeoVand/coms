import type { Protocol } from '../types';

export const wifi: Protocol = {
	id: 'wifi',
	name: 'Wi-Fi',
	abbreviation: '802.11',
	categoryId: 'wireless',
	port: undefined,
	year: 1997,
	rfc: undefined,
	oneLiner:
		'Wireless local networking — [[ethernet|Ethernet]] without the cable, plus {{encryption|encryption}} and {{airtime|airtime}} management.',
	overview: `[[wifi|Wi-Fi]] brings [[ethernet|Ethernet]]-style networking to the airwaves. Instead of transmitting {{frame|frames}} over copper or fiber, [[wifi|802.11]] uses radio frequencies (2.4 GHz, 5 GHz, and now 6 GHz) to send data wirelessly. But air is a shared medium — everyone within range can hear everything — so [[wifi|Wi-Fi]] adds {{encryption|encryption}} ({{wpa2|WPA2}}/{{wpa3|WPA3}}), collision avoidance (CSMA/{{certificate-authority|CA}} instead of [[ethernet|Ethernet]]'s CSMA/CD), and a more complex frame format with up to four MAC addresses (three typically used): the receiver address (RA), transmitter address (TA), and destination address (DA) — plus an optional fourth address used in wireless bridging (WDS) mode.

The differences from [[ethernet|Ethernet]] are deeper than just "no cable." Because wireless stations can't detect collisions while transmitting (the "hidden node" problem), [[wifi|Wi-Fi]] uses RTS/CTS {{handshake|handshakes}} and carrier sensing to avoid them. Every frame must be {{ack|acknowledged}} — if the sender doesn't get an {{ack|ACK}}, it {{retransmission|retransmits}}. The {{access-point|access point}} bridges wireless and wired worlds, translating between [[wifi|802.11]] and 802.3 frames so that [[arp|ARP]], [[ip|IP]], and everything above works seamlessly across both.

[[wifi|Wi-Fi]] has evolved dramatically since the original [[wifi|802.11]] standard in 1997 (2 Mbps). 802.11b (1999) brought 11 Mbps, 802.11g (2003) hit 54 Mbps, 802.11n ([[wifi|Wi-Fi]] 4, 2009) introduced MIMO for 600 Mbps, 802.11ac ([[wifi|Wi-Fi]] 5, 2014) pushed to gigabit speeds, 802.11ax ([[wifi|Wi-Fi]] 6, 2020) added {{ofdma|OFDMA}} for dense environments, and 802.11be ([[wifi|Wi-Fi]] 7, 2024) delivers up to 46 Gbps with multi-link operation. Each generation brought better throughput, lower {{latency|latency}}, and improved handling of crowded airspace.

[[wifi|Wi-Fi]] shares the 2.4 GHz {{ism-band|ISM band}} with **[[bluetooth|Bluetooth]]** — the two are the universal coexistence pairing in the [[wifi|Wireless]] category. Modern combo chips ({{apple|Apple}} H-series, {{broadcom|Broadcom}}, Qualcomm) do time-division arbitration at the silicon level so [[wifi|Wi-Fi]] and [[bluetooth|Bluetooth]] don't starve each other. The escape to 5 GHz and 6 GHz on the [[wifi|Wi-Fi]] side has eased the crowding; [[bluetooth|Bluetooth]] stays at 2.4 GHz where every battery-powered consumer device already lives — and so do [[zigbee|Zigbee]] (channels 11–26) and {{thread|Thread}}, both of which use {{ieee-802-15-4|IEEE 802.15.4}} radios that intentionally dodge Wi-Fi's busy channels 1/6/11. Through the **{{matter|Matter}}** bridge, those low-power meshes appear to your home network as ordinary IP-addressable devices over the same Wi-Fi you're already running. The 13.56 MHz [[nfc|NFC]] tap pairs Wi-Fi credentials onto printers and IoT devices via {{ndef|NDEF}} handover, and the 6–9 GHz [[uwb|UWB]] radio sits well above the Wi-Fi bands and never contends with it.`,
	howItWorks: [
		{
			title: 'Beacon scanning',
			description:
				'Access points {{broadcast|broadcast}} beacon frames every ~100 ms announcing their SSID, supported rates, {{encryption|encryption}} type, and channel. Clients scan channels (passively listening or actively sending probe requests) to discover available networks.'
		},
		{
			title: 'Authentication and association',
			description:
				'The client authenticates with the {{access-point|AP}} (Open System or SAE for {{wpa3|WPA3}}), then sends an Association Request specifying desired parameters. The {{access-point|AP}} responds with an Association Response, assigning the client an Association ID and granting network access.'
		},
		{
			title: '4-way handshake (WPA2/WPA3)',
			description:
				'After association, the client and {{access-point|AP}} perform a 4-message EAPOL {{handshake|handshake}} to derive per-session {{encryption|encryption}} keys (PTK). Both sides prove they know the passphrase without revealing it. This produces the temporal keys used to encrypt all subsequent data frames.'
		},
		{
			title: 'Data frames with CSMA/CA',
			description:
				'Before transmitting, the sender listens for a clear channel (carrier sense) and waits a random backoff time (collision avoidance). Data frames carry up to four MAC addresses (three typically used) — RA, TA, and DA — and are encrypted with the session keys. Every {{unicast|unicast}} frame must be acknowledged by the receiver.'
		},
		{
			title: 'Bridge to Ethernet',
			description:
				'The {{access-point|access point}} translates between [[wifi|802.11]] and [[ethernet|Ethernet]] (802.3) frames. It strips the wireless-specific headers, rewrites the frame as a standard [[ethernet|Ethernet]] frame, and forwards it to the wired network — making the transition invisible to higher-layer protocols like [[ip|IP]] and [[tcp|TCP]].'
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
			'Sniffing [[wifi|Wi-Fi]] beacon frames with scapy in monitor mode — revealing SSIDs, BSSIDs, and channels',
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
	connections: ['ethernet', 'arp', 'ip', 'ipv6', 'bluetooth', 'cellular', 'nfc', 'zigbee', 'uwb'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[wifi|Wi-Fi]]',
		official: 'https://www.wi-fi.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/802.11_MAC_Frame.svg/500px-802.11_MAC_Frame.svg.png',
		alt: 'Diagram of an 802.11 Wi-Fi MAC frame showing frame control, duration, four address fields, sequence control, and FCS',
		caption:
			'The [[wifi|802.11]] [[wifi|Wi-Fi]] MAC frame format — more complex than [[ethernet|Ethernet]] because wireless needs extra fields. Up to four MAC addresses handle the receiver, transmitter, destination, and source, while the Frame Control field encodes the frame type, {{encryption|encryption}} status, and power management flags.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
