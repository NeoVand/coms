import type { SimulationConfig, ProtocolLayer } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';

function sseRequestLayer(): ProtocolLayer {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'SSE uses a standard GET request — no upgrade or special handshake needed' },
			{ name: 'Path', bits: 0, value: '/events', editable: false, description: 'Event stream endpoint — the server will hold this connection open' },
			{ name: 'Accept', bits: 0, value: 'text/event-stream', editable: false, description: 'Tells the server the client wants an SSE stream, not a regular response' },
			{ name: 'Cache-Control', bits: 0, value: 'no-cache', editable: false, description: 'Prevents caching — events should always be received fresh from the server' },
			{ name: 'Connection', bits: 0, value: 'keep-alive', editable: false, description: 'The connection stays open for the stream duration' }
		]
	};
}

function sseResponseLayer(): ProtocolLayer {
	return {
		name: 'HTTP Response',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Status', bits: 0, value: '200 OK', editable: false, description: 'Stream opened successfully — data will follow incrementally', color: '#22c55e' },
			{ name: 'Content-Type', bits: 0, value: 'text/event-stream', editable: false, description: 'SSE MIME type — tells the browser to use EventSource API' },
			{ name: 'Cache-Control', bits: 0, value: 'no-cache', editable: false, description: 'No caching for live event streams' },
			{ name: 'Connection', bits: 0, value: 'keep-alive', editable: false, description: 'Connection remains open — no Content-Length since the stream is infinite' }
		]
	};
}

function sseEventLayer(eventType: string, eventId: string, data: string, retry: string): ProtocolLayer {
	return {
		name: 'SSE Event',
		abbreviation: 'SSE',
		osiLayer: 7,
		color: '#EF4444',
		headerFields: [
			{ name: 'Event Type', bits: 0, value: eventType, editable: false, description: 'Named event type — clients listen for specific types with addEventListener()' },
			{ name: 'Event ID', bits: 0, value: eventId, editable: false, description: 'Unique event identifier — sent as Last-Event-ID on reconnect for resumption' },
			{ name: 'Data', bits: 0, value: data, editable: false, description: 'Event payload — UTF-8 text, typically JSON. Multiple data: lines are joined with newlines' },
			...(retry ? [{ name: 'Retry', bits: 0, value: retry, editable: false, description: 'Reconnection interval in milliseconds — browser waits this long before reconnecting' }] : [])
		]
	};
}

export const sseStream: SimulationConfig = {
	protocolId: 'sse',
	title: 'SSE — Server-Sent Events Stream',
	description:
		'Watch how a browser opens a persistent HTTP connection and receives a stream of server-pushed events. SSE provides automatic reconnection, event IDs for resumption, and named event types — all over plain HTTP.',
	tier: 'client',
	actors: [
		{ id: 'browser', label: 'Browser', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'eventType',
			label: 'Event Type',
			type: 'text',
			defaultValue: 'message',
			placeholder: 'e.g. notification'
		}
	],
	steps: [
		{
			id: 'request',
			label: 'GET /events',
			description:
				'The browser opens an EventSource connection with Accept: text/event-stream. Unlike WebSocket, SSE uses plain HTTP — no upgrade needed. This means SSE works through every proxy, CDN, and load balancer without configuration.',
			fromActor: 'browser',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Accept'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52500, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				sseRequestLayer()
			]
		},
		{
			id: 'stream-open',
			label: '200 Stream Open',
			description:
				'The server responds with Content-Type: text/event-stream and keeps the connection open. No Content-Length is sent because the response is infinite. Data will be sent incrementally as events occur.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 800,
			highlight: ['Status', 'Content-Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				sseResponseLayer()
			]
		},
		{
			id: 'event-1',
			label: 'Event 1',
			description:
				'The server pushes the first event. Each event has fields separated by newlines: "event:" for the type, "id:" for tracking, and "data:" for the payload. Events are terminated by a blank line. The browser fires a matching addEventListener callback.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 600,
			highlight: ['Event Type', 'Event ID', 'Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				sseEventLayer('message', 'evt-001', '{"user": "Alice", "action": "login"}', '')
			]
		},
		{
			id: 'event-2',
			label: 'Event 2',
			description:
				'A second event arrives. The incremental event ID means that if the connection drops, the browser will reconnect and send Last-Event-ID: evt-002, letting the server resume from the right position. This built-in resumption is a major advantage over raw WebSocket.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 600,
			highlight: ['Event Type', 'Event ID', 'Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				sseEventLayer('message', 'evt-002', '{"user": "Bob", "action": "post"}', '')
			]
		},
		{
			id: 'event-3',
			label: 'Event 3',
			description:
				'A third event with a retry field. The retry value tells the browser how long (in milliseconds) to wait before reconnecting if the connection drops. The server can dynamically adjust this based on load or event frequency.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 600,
			highlight: ['Data', 'Retry'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52500, flags: 'PSH,ACK' }),
				sseEventLayer('notification', 'evt-003', '{"alert": "System maintenance in 10 minutes"}', '5000')
			]
		},
		{
			id: 'close',
			label: 'Close',
			description:
				'The client closes the EventSource connection. The browser sends a TCP FIN to cleanly shut down. If the client calls eventSource.close(), the browser stops reconnecting. Otherwise, it would automatically reconnect using the configured retry interval.',
			fromActor: 'browser',
			toActor: 'server',
			duration: 600,
			highlight: ['Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52500, dstPort: 443, flags: 'FIN,ACK' })
			]
		}
	]
};
