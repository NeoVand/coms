import type { Protocol } from '../types';

export const jsonRpc: Protocol = {
	id: 'json-rpc',
	name: 'JSON Remote Procedure Call',
	abbreviation: 'JSON-RPC',
	categoryId: 'web-api',
	port: undefined,
	year: 2005,
	rfc: undefined, // Community spec at jsonrpc.org
	oneLiner:
		'A minimal RPC protocol encoded in {{json|JSON}} — call a method by name, get a result back. Nothing more.',
	overview: `{{json|JSON}}-RPC is the protocol that proves less is more. The entire specification fits on a single page: send a {{json|JSON}} object with a method name, parameters, and an ID — get back a {{json|JSON}} object with the result and the same ID. That's it. No URL routing, no HTTP verb semantics, no schema compilation step. Just structured function calls over the wire.

Created in 2005 as a lightweight alternative to {{xml|XML}}-based [[soap|SOAP]], [[json-rpc|JSON-RPC]] stayed deliberately simple while the web API world exploded with complexity. Version 2.0 (2010) refined the format: it added a mandatory \`"jsonrpc": "2.0"\` field, standardized error codes (borrowed from {{xml|XML}}-RPC's tradition), introduced {{notification|notifications}} (requests without an \`id\` that expect no response), and added batch requests (send an array of calls, get an array of results). The spec is transport-agnostic — [[json-rpc|JSON-RPC]] works over [[http1|HTTP]], [[websockets|WebSockets]], raw [[tcp|TCP]], or even {{stdio|stdio}} pipes between processes.

[[json-rpc|JSON-RPC]] found its biggest audience not in traditional web development but in infrastructure and AI. Ethereum's entire blockchain API is [[json-rpc|JSON-RPC]]. Bitcoin Core speaks [[json-rpc|JSON-RPC]]. {{microsoft|Microsoft}}'s {{lsp|Language Server Protocol}} (LSP) — which powers code intelligence in VS Code, Neovim, and virtually every modern editor — uses [[json-rpc|JSON-RPC]] 2.0 over stdio. And most recently, both {{anthropic|Anthropic}}'s Model Context Protocol ([[mcp|MCP]]) and {{google|Google}}'s Agent-to-Agent Protocol ([[a2a|A2A]]) chose [[json-rpc|JSON-RPC]] 2.0 as their wire format, making it the de facto standard for AI agent communication.`,
	howItWorks: [
		{
			title: 'Client builds a request',
			description:
				'The client constructs a {{json|JSON}} object with four fields: "jsonrpc" (always "2.0"), "method" (the function name), "params" (arguments as an array or object), and "id" (a unique identifier to match the response).'
		},
		{
			title: 'Request is sent',
			description:
				'The {{json|JSON}} is sent over any transport — HTTP POST to a single endpoint, a [[websockets|WebSocket]] message, a line written to stdout, or a [[tcp|TCP]] socket. The protocol does not care how bytes move.'
		},
		{
			title: 'Server dispatches',
			description:
				'The server parses the {{json|JSON}}, looks up the method name in its handler registry, validates the parameters, and calls the handler function. If the method name starts with "rpc.", it is reserved for system extensions.'
		},
		{
			title: 'Response returned',
			description:
				'The server responds with a {{json|JSON}} object containing "jsonrpc", the same "id", and either a "result" (success) or "error" (failure with code, message, and optional data). Never both.'
		},
		{
			title: 'Notifications & batches',
			description:
				'If the request omits the "id" field, it is a {{notification|notification}} — {{fire-and-forget|fire-and-forget}}, no response expected. Multiple requests can be batched in a {{json|JSON}} array, and the server returns an array of responses (skipping notifications).'
		}
	],
	useCases: [
		'Blockchain node APIs (Ethereum, Bitcoin, Solana, Polkadot)',
		'Language Server Protocol (LSP) for code editors',
		'AI agent protocols ([[mcp|MCP]], [[a2a|A2A]])',
		'Microservice internal RPC',
		'Lightweight API servers where [[rest|REST]] feels heavy'
	],
	codeExample: {
		language: 'python',
		code: `import requests

# Call a JSON-RPC method
response = requests.post('http://localhost:4000/rpc',
    json={
        'jsonrpc': '2.0',
        'method': 'subtract',
        'params': [42, 23],
        'id': 1
    })

result = response.json()
print(result['result'])  # 19

# Batch request — multiple calls in one HTTP round trip
batch = requests.post('http://localhost:4000/rpc',
    json=[
        {'jsonrpc': '2.0', 'method': 'add', 'params': [1, 2], 'id': 1},
        {'jsonrpc': '2.0', 'method': 'multiply', 'params': [3, 4], 'id': 2},
        {'jsonrpc': '2.0', 'method': 'log', 'params': ['hello']},  # notification
    ])
# Returns: [{"result": 3, "id": 1}, {"result": 12, "id": 2}]`,
		caption:
			'The entire protocol in one example — method calls, results, errors, and batches. No schema files, no code generation.',
		alternatives: [
			{
				language: 'javascript',
				code: `// JSON-RPC client — just fetch with structured JSON
const call = async (method, params) => {
  const res = await fetch('http://localhost:4000/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method, params, id: Date.now()
    })
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  return result;
};

const sum = await call('add', [1, 2]);          // 3
const user = await call('getUser', { id: 42 }); // {name: "Alice"}

// JSON-RPC server — Node.js
const { createServer } = require('http');
const methods = {
  add: ([a, b]) => a + b,
  subtract: ([a, b]) => a - b,
};

createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    const { method, params, id } = JSON.parse(body);
    const result = methods[method]?.(params);
    res.end(JSON.stringify({ jsonrpc: '2.0', result, id }));
  });
}).listen(4000);`
			},
			{
				language: 'cli',
				code: `# Simple JSON-RPC call
curl -s -X POST http://localhost:4000/rpc \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}'
# → {"jsonrpc":"2.0","result":19,"id":1}

# Ethereum — get latest block number
curl -s -X POST https://eth.llamarpc.com \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}'
# → {"jsonrpc":"2.0","id":83,"result":"0x134a1b7"}

# Batch request — multiple calls, one HTTP request
curl -s -X POST http://localhost:4000/rpc \\
  -H "Content-Type: application/json" \\
  -d '[
    {"jsonrpc":"2.0","method":"add","params":[1,2],"id":1},
    {"jsonrpc":"2.0","method":"multiply","params":[3,4],"id":2}
  ]'`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Request → Response',
						code: `POST /rpc HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nAccept: application/json\nContent-Length: 67\n\n{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"jsonrpc":"2.0","result":19,"id":1}`
					},
					{
						title: 'Error Response',
						code: `POST /rpc HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n{"jsonrpc":"2.0","method":"nonexistent","params":[],"id":2}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"jsonrpc":"2.0","error":{"code":-32601,"message":"Method not found"},"id":2}\n\n─────────────────────────────────────\nStandard Error Codes:\n  -32700  Parse error       (invalid JSON)\n  -32600  Invalid Request   (not a valid JSON-RPC object)\n  -32601  Method not found  (method does not exist)\n  -32602  Invalid params    (wrong arguments)\n  -32603  Internal error    (server-side failure)`
					},
					{
						title: 'Notification (no response) & Batch',
						code: `── Notification (no "id" → no response) ──\n{"jsonrpc":"2.0","method":"log","params":["event occurred"]}\n\n── Batch Request ──\n[\n  {"jsonrpc":"2.0","method":"add","params":[1,2],"id":"a"},\n  {"jsonrpc":"2.0","method":"log","params":["hello"]},\n  {"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":"b"}\n]\n\n── Batch Response (no entry for notification) ──\n[\n  {"jsonrpc":"2.0","result":3,"id":"a"},\n  {"jsonrpc":"2.0","result":19,"id":"b"}\n]`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Same as the underlying transport — near-zero overhead for stdio/IPC, one HTTP round trip for remote calls. Batch requests amortize latency across many calls.',
		throughput:
			'JSON text is 2-10x larger than Protobuf binary. For high-throughput services, gRPC is faster — but for most use cases the difference is negligible.',
		overhead:
			'Minimal — no envelope wrapping, no schema validation, no mandatory headers beyond the JSON itself. A complete request is ~60 bytes.'
	},
	connections: ['a2a', 'http1', 'mcp', 'websockets', 'rest', 'grpc', 'graphql', 'soap', 'sse'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[json-rpc|JSON-RPC]]',
		official: 'https://www.jsonrpc.org/specification'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/1/18/RPC_overview.png',
		alt: 'Diagram showing how Remote Procedure Calls work — a client calls a stub which marshals parameters and sends them over the network to a server stub that executes the procedure',
		caption:
			'The RPC model that {{json|JSON}}-RPC inherits — a client calls a function by name, the parameters are serialized and sent over the network, and the server executes the method and returns the result. [[json-rpc|JSON-RPC]] strips this to pure {{json|JSON}}: no IDL, no code generation, no binary encoding.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
