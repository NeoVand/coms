import type { SimulationConfig, ProtocolLayer } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';

function gqlRequestLayer(operation: string, name: string, variables: string, selectionSet: string): ProtocolLayer {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Method', bits: 0, value: 'POST', editable: false, description: 'GraphQL always uses POST — the query is in the request body, not the URL' },
			{ name: 'Path', bits: 0, value: '/graphql', editable: false, description: 'Single endpoint — unlike REST, all operations go to the same URL' },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'GraphQL request bodies are JSON-encoded' }
		]
	};
}

function gqlLayer(operation: string, name: string, variables: string, selectionSet: string, responseData: string): ProtocolLayer {
	return {
		name: 'GraphQL Operation',
		abbreviation: 'GQL',
		osiLayer: 7,
		color: '#E535AB',
		headerFields: [
			{ name: 'Operation', bits: 0, value: operation, editable: false, description: 'GraphQL operation type — query (read), mutation (write), or subscription (stream)' },
			{ name: 'Name', bits: 0, value: name, editable: false, description: 'Operation name — used for debugging and server-side logging' },
			...(variables ? [{ name: 'Variables', bits: 0, value: variables, editable: false, description: 'Variables passed to the operation — typed inputs that parameterize the query' }] : []),
			...(selectionSet ? [{ name: 'Selection Set', bits: 0, value: selectionSet, editable: false, description: 'The fields requested — determines the exact shape of the response' }] : []),
			...(responseData ? [{ name: 'Response Data', bits: 0, value: responseData, editable: false, description: 'JSON response body — mirrors the selection set structure exactly' }] : [])
		]
	};
}

function gqlResponseLayer(status: string): ProtocolLayer {
	return {
		name: 'HTTP Response',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Status', bits: 0, value: status, editable: false, description: 'GraphQL always returns 200 — errors are in the response body, not HTTP status codes', color: '#22c55e' },
			{ name: 'Content-Type', bits: 0, value: 'application/json', editable: false, description: 'Response body is JSON with data and/or errors fields' }
		]
	};
}

export const graphqlOperation: SimulationConfig = {
	protocolId: 'graphql',
	title: 'GraphQL — Query & Mutation',
	description:
		'See how GraphQL sends structured queries to a single endpoint and receives precisely shaped responses. Unlike REST, the client decides what data it gets — no over-fetching, no under-fetching.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client App', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'GraphQL Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'operationType',
			label: 'Operation',
			type: 'select',
			defaultValue: 'Query',
			options: ['Query', 'Mutation']
		}
	],
	steps: [
		{
			id: 'query-request',
			label: 'POST Query',
			description:
				'The client sends a GraphQL query as a POST request to the single /graphql endpoint. Unlike REST, which uses different URLs for different resources, GraphQL always POSTs to the same URL. The query string specifies exactly which fields are needed.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Operation', 'Selection Set'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				gqlRequestLayer('query', 'GetUser', '{ "id": "42" }', '{ user { name email } }'),
				gqlLayer('query', 'GetUser', '{ "id": "42" }', '{ user(id: $id) { name email posts { title } } }', '')
			]
		},
		{
			id: 'query-response',
			label: '200 Response',
			description:
				'The server resolves each field by calling its resolver functions. The response JSON mirrors the exact shape of the query — if you asked for user.name and user.posts.title, that is exactly what you get. Errors are returned alongside partial data rather than as HTTP error codes.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				gqlResponseLayer('200 OK'),
				gqlLayer('query', 'GetUser', '', '', '{ user: { name: "Alice", email: "alice@...", posts: [{ title: "Getting Started" }] } }')
			]
		},
		{
			id: 'mutation-request',
			label: 'POST Mutation',
			description:
				'The client sends a mutation to modify data. Mutations are structurally identical to queries but signal intent to write. The mutation specifies input variables and which fields to return from the mutated object, letting the client update its local state without a second fetch.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Operation', 'Variables'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				gqlRequestLayer('mutation', 'CreatePost', '{ "title": "New Post" }', '{ createPost { id title } }'),
				gqlLayer('mutation', 'CreatePost', '{ "title": "New Post", "authorId": "42" }', '{ createPost(input: $input) { id title author { name } } }', '')
			]
		},
		{
			id: 'mutation-response',
			label: '200 Response',
			description:
				'The server executes the mutation and returns the result. Even mutations return 200 OK — GraphQL uses its own error handling in the response body. The response includes the newly created data with server-generated fields like the auto-assigned ID.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				gqlResponseLayer('200 OK'),
				gqlLayer('mutation', 'CreatePost', '', '', '{ createPost: { id: "99", title: "New Post", author: { name: "Alice" } } }')
			]
		}
	]
};
