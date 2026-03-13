import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';
import { createHTTP2FrameLayer } from '../layers/http2';

export const http2Multiplexing: SimulationConfig = {
	protocolId: 'http2',
	title: 'HTTP/2 — Multiplexed Streams',
	description:
		'See how HTTP/2 sends multiple requests simultaneously over a single TCP connection. Streams are interleaved — no more head-of-line blocking at the application layer.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Browser', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'streams',
			label: 'Streams',
			type: 'select',
			defaultValue: '2',
			options: ['1', '2', '4']
		}
	],
	steps: [
		{
			id: 'connection-preface',
			label: 'Connection Preface',
			description:
				'After TLS negotiation (with ALPN selecting h2), the client sends the connection preface: a magic 24-byte string followed by a SETTINGS frame. This confirms both sides speak HTTP/2.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52500, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'SETTINGS (0x4)',
					flags: 'NONE',
					streamId: 0,
					payload: 'MAX_CONCURRENT_STREAMS=100, INITIAL_WINDOW_SIZE=65535',
					length: 36
				})
			]
		},
		{
			id: 'settings-ack',
			label: 'SETTINGS ACK',
			description:
				'Server acknowledges the client settings and sends its own. Both sides now agree on connection parameters like max concurrent streams and flow control windows.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Type', 'Flags'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'SETTINGS (0x4)',
					flags: 'ACK',
					streamId: 0,
					payload: 'ACK — settings confirmed',
					length: 0
				})
			]
		},
		{
			id: 'headers-stream1',
			label: 'HEADERS (Stream 1)',
			description:
				'Client opens stream 1 with a HEADERS frame for the first request. Headers are HPACK-compressed to save bandwidth. Client-initiated streams always use odd IDs.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Stream ID', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52500, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS (0x1)',
					flags: 'END_HEADERS',
					streamId: 1,
					payload: ':method: GET, :path: /index.html',
					length: 64
				})
			]
		},
		{
			id: 'headers-stream3',
			label: 'HEADERS (Stream 3)',
			description:
				'Without waiting for stream 1 to complete, the client opens stream 3 for a second request. This is multiplexing — both requests travel on the same TCP connection simultaneously.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Stream ID', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52500, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS (0x1)',
					flags: 'END_HEADERS',
					streamId: 3,
					payload: ':method: GET, :path: /style.css',
					length: 58
				})
			]
		},
		{
			id: 'data-stream1',
			label: 'DATA (Stream 1)',
			description:
				'Server responds on stream 1 with a DATA frame containing the HTML. The stream ID lets both sides know which request this response belongs to, even though they share one connection.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Stream ID', 'Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'DATA (0x0)',
					flags: 'END_STREAM',
					streamId: 1,
					payload: '<html>...</html> (response body)',
					length: 4096
				})
			]
		},
		{
			id: 'data-stream3',
			label: 'DATA (Stream 3)',
			description:
				'Server responds on stream 3 with the CSS. Both responses arrived on one connection with no head-of-line blocking at the HTTP layer. This is the core advantage of HTTP/2 over HTTP/1.1.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Stream ID', 'Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'DATA (0x0)',
					flags: 'END_STREAM',
					streamId: 3,
					payload: 'body { margin: 0; } ... (CSS)',
					length: 2048
				})
			]
		}
	]
};
