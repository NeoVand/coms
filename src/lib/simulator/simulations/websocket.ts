import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createWebSocketFrameLayer } from '../layers/websocket';

export const websocketConnection: SimulationConfig = {
	protocolId: 'websockets',
	title: 'WebSocket — Upgrade & Messaging',
	description:
		'Watch how a WebSocket connection starts as an HTTP upgrade, then switches to a persistent full-duplex channel for real-time bidirectional messaging.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Browser', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'message',
			label: 'Message to Send',
			type: 'text',
			defaultValue: 'Hello WebSocket!',
			placeholder: 'Type a message...'
		}
	],
	steps: [
		{
			id: 'upgrade-request',
			label: 'HTTP Upgrade',
			description:
				'The connection starts as a normal HTTP request with special headers: Upgrade: websocket and Connection: Upgrade. The Sec-WebSocket-Key proves the server understands WebSocket.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Upgrade', 'Connection'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52200, dstPort: 443, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Upgrade Request',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'WebSocket upgrade always starts with GET' },
						{ name: 'Path', bits: 0, value: '/ws/chat', editable: false, description: 'WebSocket endpoint path' },
						{ name: 'Upgrade', bits: 0, value: 'websocket', editable: false, description: 'Requests protocol switch to WebSocket' },
						{ name: 'Connection', bits: 0, value: 'Upgrade', editable: false, description: 'Signals this is a connection upgrade, not a normal request' },
						{ name: 'Sec-WebSocket-Key', bits: 0, value: 'dGhlIHNhbXBsZ...', editable: false, description: 'Base64-encoded random key — server hashes it to prove it supports WebSocket' },
						{ name: 'Sec-WebSocket-Version', bits: 0, value: '13', editable: false, description: 'WebSocket protocol version (13 is the only current version)' }
					]
				}
			]
		},
		{
			id: 'upgrade-response',
			label: '101 Switching',
			description:
				'Server accepts the upgrade with 101 Switching Protocols. From this point on, the TCP connection speaks WebSocket — no more HTTP framing. The connection is now full-duplex.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Status', 'Sec-WebSocket-Accept'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52200, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Upgrade Response',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Status', bits: 0, value: '101 Switching Protocols', editable: false, description: 'Server agrees to switch from HTTP to WebSocket', color: '#22c55e' },
						{ name: 'Upgrade', bits: 0, value: 'websocket', editable: false, description: 'Confirms the protocol switch' },
						{ name: 'Connection', bits: 0, value: 'Upgrade', editable: false, description: 'Connection is now upgraded' },
						{ name: 'Sec-WebSocket-Accept', bits: 0, value: 's3pPLMBiTxaQ9k...', editable: false, description: 'SHA-1 hash of the client key + magic GUID — proves server supports WebSocket' }
					]
				}
			]
		},
		{
			id: 'ws-message-client',
			label: 'WS Text Frame',
			description:
				'Client sends a text message as a WebSocket frame. Client frames are always masked with a random 32-bit key to prevent proxy cache poisoning attacks.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Opcode', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52200, dstPort: 443, flags: 'PSH,ACK' }),
				createWebSocketFrameLayer({ opcode: 'Text (0x1)', mask: 1, payload: 'Hello WebSocket!' })
			]
		},
		{
			id: 'ws-message-server',
			label: 'WS Text Frame',
			description:
				'Server sends a text message back. Server frames are NOT masked — only client-to-server frames need masking. This is the beauty of WebSocket: true bidirectional messaging with minimal overhead.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Mask', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52200, flags: 'PSH,ACK' }),
				createWebSocketFrameLayer({ opcode: 'Text (0x1)', mask: 0, maskingKey: 'N/A', payload: 'Message received!' })
			]
		},
		{
			id: 'ws-ping',
			label: 'WS Ping',
			description:
				'Either side can send Ping frames to check if the connection is alive. The other side must respond with a Pong. This keepalive mechanism prevents silent connection drops.',
			fromActor: 'server',
			toActor: 'client',
			duration: 500,
			highlight: ['Opcode'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52200, flags: 'PSH,ACK' }),
				createWebSocketFrameLayer({ opcode: 'Ping (0x9)', mask: 0, payloadLength: 0, maskingKey: 'N/A', payload: '' })
			]
		},
		{
			id: 'ws-close',
			label: 'WS Close',
			description:
				'Either side initiates a clean shutdown by sending a Close frame with a status code. The other side responds with its own Close, then both sides close the TCP connection.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Opcode', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52200, dstPort: 443, flags: 'PSH,ACK' }),
				createWebSocketFrameLayer({ opcode: 'Close (0x8)', payloadLength: 2, payload: '1000 (Normal)', maskingKey: '0x55AA33CC' })
			]
		}
	]
};
