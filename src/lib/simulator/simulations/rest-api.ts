import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function httpRequestLayer(method: string, path: string, body?: string) {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Method', bits: 0, value: method, editable: false, description: `HTTP method — ${method} retrieves or modifies a resource` },
			{ name: 'Path', bits: 0, value: path, editable: false, description: 'REST resource path — follows /resource/{id} convention' },
			{ name: 'Version', bits: 0, value: 'HTTP/1.1', editable: false, description: 'Protocol version' },
			{ name: 'Host', bits: 0, value: 'api.example.com', editable: false, description: 'API server hostname' },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'MIME type — REST APIs typically use JSON' },
			...(body ? [{ name: 'Body', bits: 0, value: body, editable: false, description: 'JSON request body — the resource representation' }] : []),
			{ name: 'Accept', bits: 0, value: 'application/json', editable: false, description: 'Client tells the server it expects JSON responses' }
		]
	};
}

function httpResponseLayer(status: string, body: string, statusColor: string) {
	return {
		name: 'HTTP Response',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: 'HTTP/1.1', editable: false, description: 'Protocol version' },
			{ name: 'Status', bits: 0, value: status, editable: false, description: `HTTP status code — ${status}`, color: statusColor },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'Response body is JSON-encoded' },
			{ name: 'Body', bits: 0, value: body, editable: false, description: 'JSON response body — the resource representation' }
		]
	};
}

export const restApi: SimulationConfig = {
	protocolId: 'rest',
	title: 'REST API — CRUD Lifecycle',
	description:
		'See how a RESTful API handles Create, Read, and List operations. Each step is a standard HTTP request with JSON payloads following REST conventions.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'API Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'resource',
			label: 'Resource Path',
			type: 'text',
			defaultValue: '/users',
			placeholder: '/products'
		}
	],
	steps: [
		{
			id: 'get-list',
			label: 'GET Collection',
			description:
				'Client sends GET to the collection endpoint. In REST, GET is safe and idempotent — it never modifies data, and calling it multiple times gives the same result.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52100, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestLayer('GET', '/users')
			]
		},
		{
			id: 'get-list-response',
			label: '200 OK — List',
			description:
				'Server returns the full collection as a JSON array. Status 200 means the request succeeded. The response includes all users.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52100, flags: 'PSH,ACK' }),
				httpResponseLayer('200 OK', '[{id:1, name:"Alice"}, ...]', '#22c55e')
			]
		},
		{
			id: 'post-create',
			label: 'POST Create',
			description:
				'Client sends POST to create a new resource. POST is the standard REST method for creation — the server assigns the ID and returns the new resource.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52100, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestLayer('POST', '/users', '{"name":"Bob","email":"bob@example.com"}')
			]
		},
		{
			id: 'post-response',
			label: '201 Created',
			description:
				'Server creates the resource and returns 201 Created with the new resource in the body. The Location header points to the new resource URL.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52100, flags: 'PSH,ACK' }),
				httpResponseLayer('201 Created', '{id:2, name:"Bob"}', '#22c55e')
			]
		},
		{
			id: 'get-single',
			label: 'GET Resource',
			description:
				'Client fetches the newly created resource by its ID. The path /users/2 identifies a specific resource — this is the RESTful way to address individual items.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52100, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestLayer('GET', '/users/2')
			]
		},
		{
			id: 'get-single-response',
			label: '200 OK — Detail',
			description:
				'Server returns the single resource as a JSON object. This completes the CRUD cycle: we listed, created, and read back a resource — all using standard HTTP methods and status codes.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52100, flags: 'PSH,ACK' }),
				httpResponseLayer('200 OK', '{id:2, name:"Bob", email:"bob@..."}', '#22c55e')
			]
		}
	]
};
