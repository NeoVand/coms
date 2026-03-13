import type { SimulationConfig } from '../types';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSCTPLayer } from '../layers/sctp';

export const sctpAssociation: SimulationConfig = {
	protocolId: 'sctp',
	title: 'SCTP — Multi-Stream Association',
	description:
		'Watch SCTP\'s four-way handshake that establishes a multi-stream association. Unlike TCP\'s three-way handshake, SCTP uses a cookie mechanism to prevent SYN flood attacks. SCTP also supports multi-homing — a single association can span multiple IP addresses for failover.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'init',
			label: 'INIT',
			description:
				'The client initiates an association by sending an INIT chunk. It proposes its Initiate Tag (used as the V-Tag for all packets from the server), the number of outbound/inbound streams, and the initial TSN (Transmission Sequence Number). Unlike TCP SYN, the server does NOT allocate state yet.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Chunk Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 132 }),
				createSCTPLayer({
					srcPort: 49800,
					dstPort: 5000,
					vTag: '0x00000000',
					chunkType: 'INIT (1)',
					chunkFlags: '0x00',
					payload: 'Initiate Tag: 0xABCD1234, OS: 10, MIS: 10, Initial TSN: 1000'
				})
			]
		},
		{
			id: 'init-ack',
			label: 'INIT-ACK',
			description:
				'The server responds with INIT-ACK containing its own parameters and a State Cookie. The cookie is a signed bundle of both sides\' parameters — crucially, the server still allocates no state. This cookie-based design makes SCTP immune to SYN flood denial-of-service attacks.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Chunk Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 132 }),
				createSCTPLayer({
					srcPort: 5000,
					dstPort: 49800,
					vTag: '0xABCD1234',
					chunkType: 'INIT-ACK (2)',
					chunkFlags: '0x00',
					payload: 'Initiate Tag: 0xEF567890, OS: 10, MIS: 10, State Cookie: [signed blob]'
				})
			]
		},
		{
			id: 'cookie-echo',
			label: 'COOKIE-ECHO',
			description:
				'The client echoes the State Cookie back to the server. Only now does the server validate the cookie and allocate association state. This is the key anti-DoS mechanism — the server only commits resources after the client proves it received the INIT-ACK (and thus has a valid IP address).',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Chunk Type', 'V-Tag'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 132 }),
				createSCTPLayer({
					srcPort: 49800,
					dstPort: 5000,
					vTag: '0xEF567890',
					chunkType: 'COOKIE-ECHO (10)',
					chunkFlags: '0x00',
					payload: 'State Cookie: [echoed signed blob]'
				})
			]
		},
		{
			id: 'cookie-ack',
			label: 'COOKIE-ACK',
			description:
				'The server validates the cookie, creates the association state, and sends COOKIE-ACK. The association is now fully established with 10 independent streams in each direction. Unlike TCP, a stalled message on stream 3 does not block stream 7 — eliminating head-of-line blocking.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Chunk Type', 'V-Tag'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 132 }),
				createSCTPLayer({
					srcPort: 5000,
					dstPort: 49800,
					vTag: '0xABCD1234',
					chunkType: 'COOKIE-ACK (11)',
					chunkFlags: '0x00',
					payload: 'Association established — 10 streams each direction, multi-homing ready'
				})
			]
		}
	]
};
