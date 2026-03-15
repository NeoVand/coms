import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function jsonRpcRequestLayer(method: string, params: string, id: string | number) {
	return {
		name: 'JSON-RPC Request',
		abbreviation: 'JSON-RPC',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version — always "2.0"' },
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'Name of the method to invoke on the server' },
			{ name: 'Params', bits: 0, value: params, editable: false, description: 'Method arguments — can be by-position (array) or by-name (object)' },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Request identifier — server echoes this back to correlate the response' }
		]
	};
}

function jsonRpcResponseLayer(result: string, id: string | number, color: string) {
	return {
		name: 'JSON-RPC Response',
		abbreviation: 'JSON-RPC',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Result', bits: 0, value: result, editable: false, description: 'Method return value — present on success, absent on error', color },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Matches the request ID — confirms which call this responds to' }
		]
	};
}

function jsonRpcErrorLayer(code: number, message: string, id: string | number) {
	return {
		name: 'JSON-RPC Error Response',
		abbreviation: 'JSON-RPC',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Error Code', bits: 0, value: String(code), editable: false, description: 'Standard error code — negative numbers are reserved by the spec', color: '#ef4444' },
			{ name: 'Error Message', bits: 0, value: message, editable: false, description: 'Human-readable error description', color: '#ef4444' },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Matches the request ID — even errors are correlated' }
		]
	};
}

function jsonRpcNotificationLayer(method: string, params: string) {
	return {
		name: 'JSON-RPC Notification',
		abbreviation: 'JSON-RPC',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'Notification method name — server will not reply' },
			{ name: 'Params', bits: 0, value: params, editable: false, description: 'Notification parameters' },
			{ name: 'ID', bits: 0, value: '(absent)', editable: false, description: 'No ID field — this is a notification, not a request. The server MUST NOT reply.', color: '#a855f7' }
		]
	};
}

function httpRequestWrapper() {
	return {
		name: 'HTTP Transport',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#4B5563',
		headerFields: [
			{ name: 'Method', bits: 0, value: 'POST', editable: false, description: 'JSON-RPC always uses HTTP POST — the method is inside the JSON, not in the URL' },
			{ name: 'Path', bits: 0, value: '/rpc', editable: false, description: 'Single endpoint — all methods go to the same URL' },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'JSON-RPC payload is always JSON' }
		]
	};
}

export const jsonRpcCall: SimulationConfig = {
	protocolId: 'json-rpc',
	title: 'JSON-RPC 2.0 — Method Calls & Notifications',
	description:
		'Watch how JSON-RPC handles a successful method call, an error, a notification (fire-and-forget), and a batch request — all over a single HTTP endpoint.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'RPC Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'method',
			label: 'Method Name',
			type: 'text',
			defaultValue: 'subtract',
			placeholder: 'method_name'
		}
	],
	steps: [
		{
			id: 'request',
			label: 'Method Call',
			description:
				'Client sends a JSON-RPC request: a JSON object with "jsonrpc", "method", "params", and "id". The id field is how the client matches responses to requests — critical when using transports that allow out-of-order delivery.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Params', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestWrapper(),
				jsonRpcRequestLayer('subtract', '[42, 23]', 1)
			]
		},
		{
			id: 'response',
			label: 'Result',
			description:
				'Server dispatches the method, computes the result, and returns it with the same id. The response has either "result" or "error" — never both. HTTP status is always 200 for JSON-RPC, even for application errors.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Result', 'ID'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				jsonRpcResponseLayer('19', 1, '#22c55e')
			]
		},
		{
			id: 'error-request',
			label: 'Bad Method',
			description:
				'Client calls a method that does not exist. The JSON-RPC spec defines standard error codes: -32601 means "Method not found." The full reserved range is -32768 to -32000.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Method'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestWrapper(),
				jsonRpcRequestLayer('nonexistent', '[]', 2)
			]
		},
		{
			id: 'error-response',
			label: 'Error -32601',
			description:
				'Server returns an error object with code, message, and optional data. The same id (2) is echoed back so the client knows which call failed. HTTP status is still 200 — the JSON-RPC error is inside the body.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Error Code', 'Error Message'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				jsonRpcErrorLayer(-32601, 'Method not found', 2)
			]
		},
		{
			id: 'notification',
			label: 'Notification',
			description:
				'Client sends a notification — a request without an "id" field. The server processes it but MUST NOT send a response. This is ideal for fire-and-forget events like logging, metrics, or progress updates.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestWrapper(),
				jsonRpcNotificationLayer('log', '["User clicked submit"]')
			]
		},
		{
			id: 'batch-request',
			label: 'Batch Request',
			description:
				'Client sends an array of JSON-RPC calls in a single HTTP request. This is one of JSON-RPC\'s killer features — multiple independent calls in one round trip. The array can mix requests and notifications.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Method', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestWrapper(),
				{
					name: 'JSON-RPC Batch',
					abbreviation: 'JSON-RPC',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Call 1', bits: 0, value: '{"method":"add","params":[1,2],"id":"a"}', editable: false, description: 'First call in the batch — will get a response' },
						{ name: 'Call 2', bits: 0, value: '{"method":"log","params":["hi"]}', editable: false, description: 'Notification in the batch — no response expected' },
						{ name: 'Call 3', bits: 0, value: '{"method":"multiply","params":[3,4],"id":"b"}', editable: false, description: 'Third call — will get a response' }
					]
				}
			]
		},
		{
			id: 'batch-response',
			label: 'Batch Result',
			description:
				'Server returns an array of responses — one for each request that had an "id". The notification (log) produced no response entry. The server may process and return results in any order.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Result 1', 'Result 2'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				{
					name: 'JSON-RPC Batch Response',
					abbreviation: 'JSON-RPC',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Result 1', bits: 0, value: '{"result":3,"id":"a"}', editable: false, description: 'Response for add(1,2) = 3', color: '#22c55e' },
						{ name: 'Result 2', bits: 0, value: '{"result":12,"id":"b"}', editable: false, description: 'Response for multiply(3,4) = 12', color: '#22c55e' },
						{ name: 'Note', bits: 0, value: 'No entry for notification', editable: false, description: 'The log notification had no id, so no response was generated', color: '#a855f7' }
					]
				}
			]
		}
	]
};
