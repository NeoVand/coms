import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function httpRequestLayer(method: string, path: string, contentType: string) {
	return {
		name: 'HTTP Transport',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#4B5563',
		headerFields: [
			{ name: 'Method', bits: 0, value: method, editable: false, description: `HTTP ${method} — A2A uses standard HTTP as its transport` },
			{ name: 'Path', bits: 0, value: path, editable: false, description: 'A2A endpoint path' },
			{ name: 'Content-Type', bits: 0, value: contentType, editable: false, description: 'Request content type' }
		]
	};
}

function a2aRequestLayer(method: string, params: string, id: string | number) {
	return {
		name: 'A2A Request',
		abbreviation: 'A2A',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version — A2A uses JSON-RPC 2.0 as its wire format' },
			{ name: 'Method', bits: 0, value: method, editable: false, description: 'A2A method to invoke on the remote agent' },
			{ name: 'Params', bits: 0, value: params, editable: false, description: 'Method parameters as a JSON object' },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Request identifier — remote agent echoes this back to correlate the response' }
		]
	};
}

function a2aResponseLayer(result: string, id: string | number, color: string) {
	return {
		name: 'A2A Response',
		abbreviation: 'A2A',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Version', bits: 0, value: '"2.0"', editable: false, description: 'JSON-RPC protocol version' },
			{ name: 'Result', bits: 0, value: result, editable: false, description: 'Response payload from the remote agent', color },
			{ name: 'ID', bits: 0, value: String(id), editable: false, description: 'Matches the request ID — confirms which call this responds to' }
		]
	};
}

export const a2aTask: SimulationConfig = {
	protocolId: 'a2a',
	title: 'A2A — Agent Discovery & Task Lifecycle',
	description:
		'Watch an agent discover another agent and delegate a task. The client fetches the remote agent\'s card, sends a message, and receives streaming task updates — all using the Agent-to-Agent protocol.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client Agent', icon: 'browser', position: 'left' },
		{ id: 'remote', label: 'Remote Agent', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'task',
			label: 'Task Description',
			type: 'text',
			defaultValue: 'Find flights NYC to London',
			placeholder: 'Describe the task...'
		}
	],
	steps: [
		{
			id: 'agent-card-request',
			label: 'Agent Card Request',
			description:
				'Client agent sends an HTTP GET to the well-known agent card endpoint. This is how agents discover each other — the card describes the remote agent\'s identity, skills, and capabilities.',
			fromActor: 'client',
			toActor: 'remote',
			duration: 800,
			highlight: ['Method', 'Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 55100, dstPort: 443, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Request',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#4B5563',
					headerFields: [
						{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'HTTP GET — retrieving the agent\'s public card' },
						{ name: 'Path', bits: 0, value: '/.well-known/agent.json', editable: false, description: 'Well-known URI for agent discovery — standardized path so clients know where to look' },
						{ name: 'Accept', bits: 0, value: 'application/json', editable: false, description: 'Client expects a JSON agent card' }
					]
				}
			]
		},
		{
			id: 'agent-card-response',
			label: 'Agent Card Response',
			description:
				'Remote agent returns its agent card — a JSON document describing its name, description, supported skills, and endpoint URL. The client uses this to determine if the agent can handle its task.',
			fromActor: 'remote',
			toActor: 'client',
			duration: 600,
			highlight: ['Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 55100, flags: 'PSH,ACK' }),
				{
					name: 'HTTP Response',
					abbreviation: 'HTTP',
					osiLayer: 7,
					color: '#4B5563',
					headerFields: [
						{ name: 'Status', bits: 0, value: '200 OK', editable: false, description: 'Agent card found and returned', color: '#22c55e' },
						{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'Agent card is JSON' }
					]
				},
				{
					name: 'Agent Card',
					abbreviation: 'A2A',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Name', bits: 0, value: '"TravelAgent"', editable: false, description: 'Human-readable agent name' },
						{ name: 'Description', bits: 0, value: '"Books flights, hotels, and travel plans"', editable: false, description: 'What this agent can do' },
						{ name: 'URL', bits: 0, value: '"https://travel.example.com/a2a"', editable: false, description: 'Endpoint for sending messages to this agent' },
						{ name: 'Skills', bits: 0, value: '[{"id":"flight-search","name":"Flight Search"}]', editable: false, description: 'List of skills — each with an ID, name, and description' },
						{ name: 'Version', bits: 0, value: '"0.2.1"', editable: false, description: 'A2A protocol version supported by this agent' }
					]
				}
			]
		},
		{
			id: 'send-message',
			label: 'Send Message',
			description:
				'Client agent sends a "message/send" request to delegate the task. The message contains parts (like a chat message) with the user\'s request. The remote agent will create a task and begin working on it.',
			fromActor: 'client',
			toActor: 'remote',
			duration: 800,
			highlight: ['Method', 'Params', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 55100, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestLayer('POST', '/a2a', 'application/json'),
				a2aRequestLayer('message/send', '{"message":{"role":"user","parts":[{"kind":"text","text":"Find flights NYC to London"}]}}', 1)
			]
		},
		{
			id: 'task-working',
			label: 'Task Working',
			description:
				'Remote agent acknowledges the task and reports it is actively working on it. The task status changes to "working" with a progress message. The client knows the request was accepted and processing has begun.',
			fromActor: 'remote',
			toActor: 'client',
			duration: 600,
			highlight: ['Result'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 55100, flags: 'PSH,ACK' }),
				a2aResponseLayer('{"id":"task-001","status":{"state":"working","message":{"role":"agent","parts":[{"kind":"text","text":"Searching flights..."}]}}}', 1, '#eab308')
			]
		},
		{
			id: 'task-completed',
			label: 'Task Completed',
			description:
				'Remote agent completes the task and returns the result with artifacts. Artifacts contain the actual output — structured data like flight options. The task status changes to "completed" indicating no more updates.',
			fromActor: 'remote',
			toActor: 'client',
			duration: 800,
			highlight: ['Result'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 55100, flags: 'PSH,ACK' }),
				a2aResponseLayer('{"id":"task-001","status":{"state":"completed"},"artifacts":[{"name":"flights","parts":[{"kind":"text","text":"BA115 JFK→LHR 7pm $450"}]}]}', 1, '#22c55e')
			]
		},
		{
			id: 'stream-request',
			label: 'Stream Request',
			description:
				'Client agent sends a "message/stream" request for the streaming variant. Instead of waiting for a single response, the server will stream task updates as server-sent events (SSE) — ideal for long-running tasks.',
			fromActor: 'client',
			toActor: 'remote',
			duration: 800,
			highlight: ['Method', 'ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 55100, dstPort: 443, flags: 'PSH,ACK' }),
				httpRequestLayer('POST', '/a2a', 'application/json'),
				a2aRequestLayer('message/stream', '{"message":{"role":"user","parts":[{"kind":"text","text":"Find flights NYC to London"}]}}', 2)
			]
		},
		{
			id: 'sse-events',
			label: 'SSE Events',
			description:
				'Remote agent responds with a stream of server-sent events. Each event carries a JSON-RPC response with incremental task updates — status changes, partial results, and finally the completed task. The stream closes when the task is done.',
			fromActor: 'remote',
			toActor: 'client',
			duration: 1000,
			highlight: ['Content-Type', 'Event 1', 'Event 2', 'Event 3'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 55100, flags: 'PSH,ACK' }),
				{
					name: 'SSE Stream',
					abbreviation: 'SSE',
					osiLayer: 7,
					color: '#4B5563',
					headerFields: [
						{ name: 'Content-Type', bits: 0, value: 'text/event-stream', editable: false, description: 'Server-sent events — the server pushes updates over a long-lived HTTP connection' }
					]
				},
				{
					name: 'A2A Task Events',
					abbreviation: 'A2A',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Event 1', bits: 0, value: '{"status":{"state":"working","message":"Searching..."}}', editable: false, description: 'First SSE event — task is now working' },
						{ name: 'Event 2', bits: 0, value: '{"artifact":{"name":"flights","parts":[...],"append":true}}', editable: false, description: 'Artifact event — partial results streamed incrementally' },
						{ name: 'Event 3', bits: 0, value: '{"status":{"state":"completed"},"final":true}', editable: false, description: 'Final event — task complete, stream closes', color: '#22c55e' }
					]
				}
			]
		}
	]
};
