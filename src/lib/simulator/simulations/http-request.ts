import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

export const httpRequest: SimulationConfig = {
	protocolId: 'http1',
	title: 'HTTP Request/Response Cycle',
	description:
		'See the full lifecycle of an HTTP request — from TCP connection to the response your browser renders.',
	tier: 'client',
	actors: [
		{ id: 'browser', label: 'Browser', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Web Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'path',
			label: 'Request Path',
			type: 'text',
			defaultValue: '/index.html',
			placeholder: '/api/data'
		},
		{
			id: 'method',
			label: 'HTTP Method',
			type: 'select',
			defaultValue: 'GET',
			options: ['GET', 'POST', 'PUT', 'DELETE']
		}
	],
	steps: [
		{
			id: 'tcp-syn',
			label: 'TCP SYN',
			description:
				'Before any HTTP data can be sent, the browser must establish a TCP connection. It sends a SYN to the server on port 80.',
			fromActor: 'browser',
			toActor: 'server',
			duration: 800,
			highlight: ['Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52000, dstPort: 80, seq: 100, ack: 0, flags: 'SYN' })
			]
		},
		{
			id: 'tcp-synack',
			label: 'TCP SYN-ACK',
			description:
				'Server responds with SYN-ACK, agreeing to establish the connection.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 800,
			highlight: ['Flags'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 80, dstPort: 52000, seq: 300, ack: 101, flags: 'SYN,ACK' })
			]
		},
		{
			id: 'tcp-ack',
			label: 'TCP ACK',
			description:
				'Browser completes the handshake. TCP connection established — now HTTP can begin.',
			fromActor: 'browser',
			toActor: 'server',
			duration: 600,
			highlight: ['Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52000, dstPort: 80, seq: 101, ack: 301, flags: 'ACK' })
			]
		},
		{
			id: 'http-request',
			label: 'HTTP GET',
			description:
				'The browser sends an HTTP GET request for /index.html. This is the application-layer message, carried inside a TCP segment.',
			fromActor: 'browser',
			toActor: 'server',
			duration: 1200,
			highlight: ['Payload'],
			data: 'GET /index.html HTTP/1.1',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6, totalLength: 220 }),
				createTCPLayer({ srcPort: 52000, dstPort: 80, seq: 101, ack: 301, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Request',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'HTTP method — what action to perform' },
						{ name: 'Path', bits: 0, value: '/index.html', editable: false, description: 'Resource path on the server' },
						{ name: 'Version', bits: 0, value: 'HTTP/1.1', editable: false, description: 'Protocol version' },
						{ name: 'Host', bits: 0, value: 'example.com', editable: false, description: 'Host header — which server to contact' },
						{ name: 'Accept', bits: 0, value: 'text/html', editable: false, description: 'What content types the browser accepts' },
						{ name: 'Connection', bits: 0, value: 'keep-alive', editable: false, description: 'Keep the TCP connection open for more requests' }
					]
				}
			]
		},
		{
			id: 'http-response',
			label: 'HTTP 200 OK',
			description:
				'Server processes the request and sends back an HTTP response with status 200 OK and the HTML content.',
			fromActor: 'server',
			toActor: 'browser',
			duration: 1200,
			highlight: ['Status', 'Content-Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6, totalLength: 1420 }),
				createTCPLayer({ srcPort: 80, dstPort: 52000, seq: 301, ack: 321, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Response',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Version', bits: 0, value: 'HTTP/1.1', editable: false, description: 'Protocol version' },
						{ name: 'Status', bits: 0, value: '200 OK', editable: false, description: 'Success — the resource was found and returned', color: '#22c55e' },
						{ name: 'Content-Type', bits: 0, value: 'text/html', editable: false, description: 'MIME type of the response body' },
						{ name: 'Content-Length', bits: 0, value: '1256', editable: false, description: 'Size of the response body in bytes' },
						{ name: 'Body', bits: 0, value: '<html>...</html>', editable: false, description: 'The HTML content of the page' }
					]
				}
			]
		}
	]
};
