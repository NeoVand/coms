import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createMPTCPLayer } from '../layers/mptcp';

export const mptcpMultipath: SimulationConfig = {
	protocolId: 'mptcp',
	title: 'MPTCP — Multi-Path TCP',
	description:
		'Watch how MPTCP extends TCP to use multiple network paths simultaneously. Your phone can use Wi-Fi and cellular at the same time — if Wi-Fi drops, the connection seamlessly continues over cellular. MPTCP is transparent to applications that use regular TCP sockets.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Phone', icon: 'device', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'syn-capable',
			label: 'SYN + MP_CAPABLE',
			description:
				'The phone initiates a TCP connection with the MP_CAPABLE option in the SYN. This tells the server "I support MPTCP." The option includes the sender\'s key — a 64-bit value used to derive tokens that authenticate future subflow joins. If the server does not support MPTCP, it falls back to regular TCP.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Subtype', 'Sender Key'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53500, dstPort: 443, flags: 'SYN' }),
				createMPTCPLayer({
					subtype: 'MP_CAPABLE (0)',
					version: 1,
					flags: 'H=1 (HMAC-SHA256)',
					senderKey: '0xA1B2C3D4E5F60718',
					subflow: 'Primary (Wi-Fi)',
					payload: 'Checksum required: yes'
				})
			]
		},
		{
			id: 'synack-capable',
			label: 'SYN-ACK + MP_CAPABLE',
			description:
				'The server responds with SYN-ACK and its own MP_CAPABLE option containing the server\'s key. Both keys are now exchanged — the client and server can derive tokens from each other\'s keys to authenticate additional subflows later. The primary subflow is established.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Subtype', 'Sender Key'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53500, flags: 'SYN,ACK' }),
				createMPTCPLayer({
					subtype: 'MP_CAPABLE (0)',
					version: 1,
					flags: 'H=1',
					senderKey: '0x1234567890ABCDEF',
					subflow: 'Primary (Wi-Fi)',
					payload: ''
				})
			]
		},
		{
			id: 'ack-capable',
			label: 'ACK + MP_CAPABLE',
			description:
				'The client completes the three-way handshake with both keys in the ACK. The MPTCP connection is now established on the primary path (Wi-Fi). Data flows normally over this path. The phone can now add additional subflows through other network interfaces (cellular, another Wi-Fi).',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Subtype', 'Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53500, dstPort: 443, flags: 'ACK' }),
				createMPTCPLayer({
					subtype: 'MP_CAPABLE (0)',
					version: 1,
					flags: 'H=1, A=1 (checksum)',
					senderKey: '0xA1B2C3D4E5F60718',
					subflow: 'Primary (Wi-Fi)',
					payload: 'Both keys exchanged — connection MPTCP-capable'
				})
			]
		},
		{
			id: 'join',
			label: 'SYN + MP_JOIN',
			description:
				'The phone adds a second subflow over cellular. MP_JOIN uses a token derived from the server\'s key to identify which MPTCP connection to join. The server verifies the HMAC to ensure this is a legitimate subflow and not an attack. Data can now be split across both Wi-Fi and cellular paths.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Subtype', 'Subflow', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.50', protocol: 6 }),
				createTCPLayer({ srcPort: 53501, dstPort: 443, flags: 'SYN' }),
				createMPTCPLayer({
					subtype: 'MP_JOIN (1)',
					version: 1,
					flags: 'B=0 (not backup)',
					senderKey: '',
					subflow: 'Secondary (Cellular)',
					payload: 'Token: 0xDEADBEEF, Nonce: 0x12345678, HMAC: [auth]'
				})
			]
		}
	]
};
