import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createQUICLayer } from '../layers/quic';

export const quicConnection: SimulationConfig = {
	protocolId: 'quic',
	title: 'QUIC — 1-RTT Encrypted Connection',
	description:
		'Watch how QUIC combines transport and encryption into a single handshake over UDP. Unlike TCP+TLS which needs 3 round trips, QUIC establishes a secure connection in just 1 RTT — and can even send data in 0-RTT on reconnection.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'initial',
			label: 'Initial',
			description:
				'The client sends a QUIC Initial packet containing a TLS ClientHello inside a CRYPTO frame. Unlike TCP, there is no separate SYN — QUIC merges the transport handshake with TLS 1.3 cryptographic setup in one packet. The packet must be padded to at least 1200 bytes to prevent amplification attacks.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Type', 'DCID', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49600, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Long (1)',
					type: 'Initial',
					version: 'QUICv1',
					dcid: '0xA1B2C3D4',
					scid: '0xE5F60718',
					packetNumber: 0,
					payload: 'CRYPTO[ClientHello, supported_versions, key_share]'
				})
			]
		},
		{
			id: 'handshake',
			label: 'Handshake',
			description:
				'The server responds with an Initial packet (containing ServerHello) followed by a Handshake packet with its certificate and Finished message. The server\'s Initial carries the TLS ServerHello, while the Handshake packet carries encrypted certificate data. This completes the server side of the cryptographic handshake.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Type', 'SCID', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 443, dstPort: 49600 }),
				createQUICLayer({
					headerForm: 'Long (1)',
					type: 'Handshake',
					version: 'QUICv1',
					dcid: '0xE5F60718',
					scid: '0xF9A0B1C2',
					packetNumber: 0,
					payload: 'CRYPTO[ServerHello, Certificate, CertVerify, Finished]'
				})
			]
		},
		{
			id: 'complete',
			label: 'Handshake Complete',
			description:
				'The client sends its Handshake Finished and immediately switches to 1-RTT (short header) packets. The connection is now fully established with forward-secret encryption. Connection IDs allow seamless migration between networks — if the client changes Wi-Fi or switches to cellular, the connection survives.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Header Form', 'Packet Number'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49600, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short)',
					dcid: '0xF9A0B1C2',
					scid: 'N/A (short)',
					packetNumber: 1,
					payload: 'CRYPTO[Finished], HANDSHAKE_DONE, NEW_CONNECTION_ID'
				})
			]
		},
		{
			id: 'stream-data',
			label: 'Stream Data',
			description:
				'Application data flows over QUIC streams. Each stream is independently flow-controlled — a stalled stream does not block others (no head-of-line blocking). QUIC can multiplex many streams over a single connection, each identified by a stream ID. Even-numbered streams are client-initiated.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Payload', 'Packet Number'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49600, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short)',
					dcid: '0xF9A0B1C2',
					scid: 'N/A (short)',
					packetNumber: 2,
					payload: 'STREAM[id=0, offset=0, len=256, fin=0] "GET /index.html"'
				})
			]
		},
		{
			id: 'close',
			label: 'Connection Close',
			description:
				'Either side can close the connection immediately with a CONNECTION_CLOSE frame. Unlike TCP\'s four-way FIN handshake, QUIC closes in a single packet. The frame includes an error code (0 = no error) and an optional reason phrase. The peer enters a draining period before freeing connection state.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49600, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short)',
					dcid: '0xF9A0B1C2',
					scid: 'N/A (short)',
					packetNumber: 3,
					payload: 'CONNECTION_CLOSE[error=0x0, reason="done"]'
				})
			]
		}
	]
};
