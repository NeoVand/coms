import type { SimulationConfig } from '../types';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createUDPLayer } from '../layers/udp';
import { createQUICLayer } from '../layers/quic';
import { createHTTP2FrameLayer } from '../layers/http2';

export const http3Quic: SimulationConfig = {
	protocolId: 'http3',
	title: 'HTTP/3 over QUIC',
	description:
		'HTTP/3 replaces TCP with QUIC — a UDP-based transport with built-in encryption and multiplexing. The handshake combines transport and TLS setup into a single round trip.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Browser', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'zeroRtt',
			label: '0-RTT',
			type: 'select',
			defaultValue: 'No',
			options: ['No', 'Yes']
		}
	],
	steps: [
		{
			id: 'quic-initial',
			label: 'QUIC Initial',
			description:
				'Client sends an Initial packet containing a TLS ClientHello inside a CRYPTO frame. Unlike TCP+TLS which needs 2-3 round trips, QUIC bundles transport and encryption handshake together.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 52700, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Long (1)',
					type: 'Initial',
					version: 'QUICv1',
					dcid: '0xA1B2C3D4',
					scid: '0xE5F60718',
					packetNumber: 0,
					payload: 'CRYPTO: TLS ClientHello (key_share, ALPN: h3)'
				})
			]
		},
		{
			id: 'quic-handshake',
			label: 'QUIC Handshake',
			description:
				'Server responds with its Initial + Handshake packets containing TLS ServerHello, certificate, and Finished. After this single round trip, both sides have encryption keys.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 443, dstPort: 52700 }),
				createQUICLayer({
					headerForm: 'Long (1)',
					type: 'Handshake',
					version: 'QUICv1',
					dcid: '0xE5F60718',
					scid: '0xA1B2C3D4',
					packetNumber: 0,
					payload: 'CRYPTO: TLS ServerHello + Certificate + Finished'
				})
			]
		},
		{
			id: 'quic-1rtt',
			label: 'QUIC 1-RTT',
			description:
				'Client completes the handshake and switches to short-header 1-RTT packets. The connection ID is now enough to route packets — no more long header needed. Encryption is fully active.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Header Form', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 52700, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short header)',
					dcid: '0xA1B2C3D4',
					scid: 'N/A (short header)',
					packetNumber: 1,
					payload: 'CRYPTO: TLS Finished + HANDSHAKE_DONE'
				})
			]
		},
		{
			id: 'h3-headers',
			label: 'HTTP/3 HEADERS',
			description:
				'Client sends an HTTP/3 request using QPACK-compressed headers inside a QUIC STREAM frame. Unlike HTTP/2, each stream is independent — packet loss on one stream does not block others.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Payload', 'Stream ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 52700, dstPort: 443 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short header)',
					dcid: '0xA1B2C3D4',
					scid: 'N/A (short header)',
					packetNumber: 2,
					payload: 'STREAM frame (stream 0)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS',
					flags: 'END_HEADERS',
					streamId: 0,
					payload: ':method: GET, :path: /index.html (QPACK)',
					length: 64
				})
			]
		},
		{
			id: 'h3-data',
			label: 'HTTP/3 DATA',
			description:
				'Server sends the response as HTTP/3 DATA frames inside QUIC packets. Each packet is independently encrypted and can arrive out of order — QUIC handles reordering per-stream, not per-connection.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Payload', 'Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 443, dstPort: 52700 }),
				createQUICLayer({
					headerForm: 'Short (0)',
					type: '1-RTT',
					version: 'N/A (short header)',
					dcid: '0xE5F60718',
					scid: 'N/A (short header)',
					packetNumber: 1,
					payload: 'STREAM frame (stream 0)'
				}),
				createHTTP2FrameLayer({
					type: 'DATA (0x0)',
					flags: 'END_STREAM',
					streamId: 0,
					payload: '<html>...</html> (response body)',
					length: 4096
				})
			]
		}
	]
};
