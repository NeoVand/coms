import type { SimulationConfig } from '../types';
import { createWiFiLayer } from '../layers/wifi';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';

export const wifiAssociation: SimulationConfig = {
	protocolId: 'wifi',
	title: 'Wi-Fi — Association and Data Transfer',
	description:
		'Follow the complete Wi-Fi lifecycle: discovering networks via beacons, authenticating with SAE (WPA3), associating to get an AID, deriving encryption keys with the 4-way handshake, and finally sending encrypted data through the access point using CSMA/CA.',
	tier: 'client',
	actors: [
		{ id: 'laptop', label: 'Laptop', icon: 'client', position: 'left' },
		{ id: 'ap', label: 'Access Point', icon: 'router', position: 'center' },
		{ id: 'server', label: 'Server (LAN)', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'beacon',
			label: 'Beacon Frame',
			description:
				'The access point periodically broadcasts beacon frames (typically every 100ms) to announce its presence. The beacon contains the SSID "MyNetwork", supported data rates, security capabilities (WPA3), and timing information. Any station within range can passively scan for these beacons to discover available networks.',
			fromActor: 'ap',
			toActor: 'laptop',
			duration: 800,
			highlight: ['Frame Control', 'Payload'],
			layers: [
				createWiFiLayer({
					frameControl: '0x8000',
					addr1: 'FF:FF:FF:FF:FF:FF',
					addr2: 'AA:BB:CC:DD:EE:FF',
					addr3: 'AA:BB:CC:DD:EE:FF',
					payload: 'SSID: MyNetwork, WPA3'
				})
			]
		},
		{
			id: 'auth',
			label: 'Authentication',
			description:
				'The laptop sends an Authentication frame to the AP using WPA3\'s Simultaneous Authentication of Equals (SAE). Unlike WPA2\'s simple open-system authentication, SAE performs a zero-knowledge proof — neither side reveals the password, yet both can verify the other knows it. This prevents offline dictionary attacks.',
			fromActor: 'laptop',
			toActor: 'ap',
			duration: 800,
			highlight: ['Frame Control', 'Payload'],
			layers: [
				createWiFiLayer({
					frameControl: '0xB000',
					addr1: 'AA:BB:CC:DD:EE:FF',
					addr2: '00:1A:2B:3C:4D:5E',
					addr3: 'AA:BB:CC:DD:EE:FF',
					payload: 'SAE Commit'
				})
			]
		},
		{
			id: 'assoc-request',
			label: 'Association Request',
			description:
				'After successful authentication, the laptop sends an Association Request to join the BSS (Basic Service Set). This frame advertises the laptop\'s capabilities: supported PHY rates, power management mode, and QoS support. The AP uses this to decide whether the station is compatible and which rates to use.',
			fromActor: 'laptop',
			toActor: 'ap',
			duration: 800,
			highlight: ['Frame Control', 'Addr 1 (RA)', 'Payload'],
			layers: [
				createWiFiLayer({
					frameControl: '0x0000',
					addr1: 'AA:BB:CC:DD:EE:FF',
					addr2: '00:1A:2B:3C:4D:5E',
					addr3: 'AA:BB:CC:DD:EE:FF',
					payload: 'Capabilities, Supported Rates'
				})
			]
		},
		{
			id: 'assoc-response',
			label: 'Association Response',
			description:
				'The AP accepts the association and assigns an Association ID (AID=1) to the laptop. The AID is used for power-save buffering — when the laptop sleeps, the AP buffers frames and uses the AID in the TIM (Traffic Indication Map) to signal pending data. Status: Success means the laptop is now a member of the BSS.',
			fromActor: 'ap',
			toActor: 'laptop',
			duration: 800,
			highlight: ['Payload'],
			layers: [
				createWiFiLayer({
					frameControl: '0x1000',
					addr1: '00:1A:2B:3C:4D:5E',
					addr2: 'AA:BB:CC:DD:EE:FF',
					addr3: 'AA:BB:CC:DD:EE:FF',
					payload: 'Status: Success, AID: 1'
				})
			]
		},
		{
			id: 'four-way-handshake',
			label: '4-Way Handshake',
			description:
				'The AP initiates the 4-way handshake by sending EAPOL Key message 1 containing a random ANonce. Both sides combine the ANonce, SNonce (from the laptop), both MACs, and the PMK (from SAE) to independently derive the PTK (Pairwise Transient Key). This key hierarchy ensures each session uses unique encryption keys without ever transmitting them.',
			fromActor: 'ap',
			toActor: 'laptop',
			duration: 1000,
			highlight: ['Frame Control', 'Payload'],
			layers: [
				createWiFiLayer({
					frameControl: '0x0841',
					addr1: '00:1A:2B:3C:4D:5E',
					addr2: 'AA:BB:CC:DD:EE:FF',
					addr3: 'AA:BB:CC:DD:EE:FF',
					payload: 'EAPOL Key 1: ANonce'
				})
			]
		},
		{
			id: 'data-encrypted',
			label: 'Encrypted Data Frame',
			description:
				'With encryption keys installed, the laptop sends an encrypted data frame through the AP. The Frame Control Protected Frame bit is set, and the payload is encrypted with AES-CCMP (or AES-GCMP in WPA3). Notice the three addresses: Addr1 (receiver) is the AP, Addr2 (transmitter) is the laptop, and Addr3 (destination) is the LAN server — the AP will bridge to this address.',
			fromActor: 'laptop',
			toActor: 'ap',
			duration: 600,
			highlight: ['Frame Control', 'Addr 3 (DA)'],
			layers: [
				createWiFiLayer({
					frameControl: '0x0841',
					addr1: 'AA:BB:CC:DD:EE:FF',
					addr2: '00:1A:2B:3C:4D:5E',
					addr3: 'CC:DD:EE:FF:00:11'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.101',
					dstIp: '93.184.216.34'
				})
			]
		},
		{
			id: 'bridge-to-ethernet',
			label: 'Bridge to Ethernet',
			description:
				'The AP decrypts the Wi-Fi frame and re-encapsulates the IP packet into a standard Ethernet frame for the wired LAN. The AP\'s MAC becomes the Ethernet source, and the LAN server\'s MAC becomes the destination. This bridging is transparent — the server sees a normal Ethernet frame and has no idea the traffic originated from a wireless client.',
			fromActor: 'ap',
			toActor: 'server',
			duration: 600,
			highlight: ['Src MAC', 'Dst MAC'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: 'CC:DD:EE:FF:00:11'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.101',
					dstIp: '93.184.216.34'
				})
			]
		}
	]
};
