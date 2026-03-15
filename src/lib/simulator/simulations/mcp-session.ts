import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function mcpRequestLayer(method: string, params: string, id: string | number) {
	return {
		name: 'MCP Request',
		abbreviation: 'MCP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version — MCP uses JSON-RPC 2.0 as its wire format' },
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'MCP method to invoke on the server' },
			{ name: 'Params', bits: 0, value: params, editable: false, description: 'Method parameters as a JSON object' },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Request identifier — server echoes this back to correlate the response' }
		]
	};
}

function mcpResponseLayer(result: string, id: string | number, color: string) {
	return {
		name: 'MCP Response',
		abbreviation: 'MCP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Result', bits: 0, value: result, editable: false, description: 'Response payload — contains the requested data or confirmation', color },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Matches the request ID — confirms which call this responds to' }
		]
	};
}

function mcpNotificationLayer(method: string, params: string) {
	return {
		name: 'MCP Notification',
		abbreviation: 'MCP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'Notification method — server acknowledges but MUST NOT reply' },
			{ name: 'Params', bits: 0, value: params, editable: false, description: 'Notification parameters' },
			{ name: 'ID', bits: 0, value: '(absent)', editable: false, description: 'No ID field — this is a notification, not a request. The server MUST NOT reply.', color: '#a855f7' }
		]
	};
}

function httpTransportLayer(method: string, path: string) {
	return {
		name: 'HTTP Transport',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#4B5563',
		headerFields: [
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'HTTP method — MCP uses POST for JSON-RPC messages over Streamable HTTP' },
			{ name: 'Path', bits: 0, value: path, editable: false, description: 'MCP endpoint path' },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'JSON-RPC payload is always JSON' }
		]
	};
}

export const mcpSession: SimulationConfig = {
	protocolId: 'mcp',
	title: 'MCP — Tool Discovery & Invocation',
	description:
		'Watch an MCP session from initialization through tool discovery and invocation. The host negotiates capabilities with the server, discovers available tools, and calls one — all using JSON-RPC 2.0 messages.',
	tier: 'client',
	actors: [
		{ id: 'host', label: 'AI App', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'MCP Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'tool',
			label: 'Tool Name',
			type: 'text',
			defaultValue: 'weather',
			placeholder: 'tool_name'
		}
	],
	steps: [
		{
			id: 'initialize-request',
			label: 'Initialize Request',
			description:
				'Host sends a JSON-RPC "initialize" request to the MCP server. This is the first message in every session — it declares the client\'s protocol version and capabilities so the server knows what features the host supports.',
			fromActor: 'host',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Capabilities', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 54200, dstPort: 443, flags: 'PSH,ACK' }),
				httpTransportLayer('POST', '/mcp'),
				mcpRequestLayer('initialize', '{"protocolVersion":"2025-03-26","capabilities":{"roots":{"listChanged":true}},"clientInfo":{"name":"MyAIApp","version":"1.0"}}', 1)
			]
		},
		{
			id: 'initialize-response',
			label: 'Initialize Response',
			description:
				'Server responds with its own capabilities — listing what it supports (tools, resources, prompts). The serverInfo identifies the MCP server implementation. Both sides now know what the other can do.',
			fromActor: 'server',
			toActor: 'host',
			duration: 600,
			highlight: ['Result', 'ID'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 54200, flags: 'PSH,ACK' }),
				mcpResponseLayer('{"protocolVersion":"2025-03-26","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"WeatherServer","version":"2.0"}}', 1, '#22c55e')
			]
		},
		{
			id: 'initialized-notification',
			label: 'Initialized Notification',
			description:
				'Host sends a "notifications/initialized" notification to confirm the handshake is complete. This is a notification, not a request — notice there is no ID field. The server processes it but MUST NOT reply.',
			fromActor: 'host',
			toActor: 'server',
			duration: 800,
			highlight: ['ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 54200, dstPort: 443, flags: 'PSH,ACK' }),
				httpTransportLayer('POST', '/mcp'),
				mcpNotificationLayer('notifications/initialized', '{}')
			]
		},
		{
			id: 'tools-list-request',
			label: 'Tools List',
			description:
				'Host requests the list of available tools from the server. This is how the AI discovers what actions it can take — each tool has a name, description, and an input schema defining its parameters.',
			fromActor: 'host',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 54200, dstPort: 443, flags: 'PSH,ACK' }),
				httpTransportLayer('POST', '/mcp'),
				mcpRequestLayer('tools/list', '{}', 2)
			]
		},
		{
			id: 'tools-list-response',
			label: 'Tools Available',
			description:
				'Server responds with its tool catalog. Each tool entry includes a name, human-readable description, and a JSON Schema for its input parameters. The AI model uses these schemas to construct valid tool calls.',
			fromActor: 'server',
			toActor: 'host',
			duration: 600,
			highlight: ['Result'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 54200, flags: 'PSH,ACK' }),
				mcpResponseLayer('{"tools":[{"name":"weather","description":"Get current weather","inputSchema":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}]}', 2, '#22c55e')
			]
		},
		{
			id: 'tool-call',
			label: 'Tool Call',
			description:
				'Host invokes a tool by sending a "tools/call" request with the tool name and arguments. The AI model chose this tool based on the schemas from the previous step and filled in the required parameters.',
			fromActor: 'host',
			toActor: 'server',
			duration: 800,
			highlight: ['Method', 'Params', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 54200, dstPort: 443, flags: 'PSH,ACK' }),
				httpTransportLayer('POST', '/mcp'),
				mcpRequestLayer('tools/call', '{"name":"weather","arguments":{"city":"San Francisco"}}', 3)
			]
		},
		{
			id: 'tool-result',
			label: 'Tool Result',
			description:
				'Server executes the tool and returns the result as a content array. Each content item has a type (text, image, resource) and the actual data. The AI model incorporates this result into its response to the user.',
			fromActor: 'server',
			toActor: 'host',
			duration: 600,
			highlight: ['Result', 'ID'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 54200, flags: 'PSH,ACK' }),
				mcpResponseLayer('{"content":[{"type":"text","text":"San Francisco: 62\u00b0F, partly cloudy, wind 12mph W"}],"isError":false}', 3, '#22c55e')
			]
		}
	]
};
