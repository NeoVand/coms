import type { Protocol } from '../types';

export const http1: Protocol = {
	id: 'http1',
	name: 'HyperText Transfer Protocol',
	abbreviation: 'HTTP/1.1',
	categoryId: 'web-api',
	port: 80,
	year: 1997,
	rfc: 'RFC 9112',
	oneLiner: 'The original language of the web — one request at a time, in plain text.',
	overview: `[[http1|HTTP/1.1]] is the protocol that built the web as we know it. Every time you click a link, submit a form, or load an image, your browser speaks HTTP to a server. It's a {{request-response|request-response}} protocol: the client asks for something, the server responds.

[[http1|HTTP/1.1]] improved on [[http1|HTTP/1.0]] by adding persistent connections ({{keep-alive|keep-alive}}), chunked transfer encoding, and {{header|host headers}} (allowing multiple websites on one [[ip|IP]]). But it has a fundamental limitation: requests on a single connection are serialized. The browser must wait for each response before sending the next request — called "{{head-of-line-blocking|head-of-line blocking}}."

To work around this, browsers open 6 parallel [[tcp|TCP]] connections per domain. This works but is wasteful. [[http2|HTTP/2]] and [[http3|HTTP/3]] solve this properly with {{multiplexing|multiplexing}}. Despite being "old," [[http1|HTTP/1.1]] is still the most widely understood protocol in web development and the foundation for [[rest|REST]] APIs.`,
	howItWorks: [
		{
			title: 'TCP connection',
			description:
				'Client establishes a [[tcp|TCP]] connection to the server (and [[tls|TLS]] if HTTPS). This takes 1-3 round trips before any HTTP data flows.'
		},
		{
			title: 'Request sent',
			description:
				'Client sends a text-based request: method (GET, POST, etc.), path, headers, and optional body. Each header is a key-value pair on its own line.'
		},
		{
			title: 'Server processes',
			description:
				'Server reads the request, routes it to the right handler, processes it (database query, file read, etc.), and prepares a response.'
		},
		{
			title: 'Response received',
			description:
				'Server sends back a status code (200, 404, 500...), response headers, and the body. Only then can the next request be sent on this connection.'
		}
	],
	useCases: [
		'[[rest|REST]] APIs (the most common API pattern)',
		'Static website serving',
		'Webhook callbacks',
		'Legacy system integration',
		'Simple microservice communication'
	],
	codeExample: {
		language: 'python',
		code: `import requests

# GET request
response = requests.get('https://example.com/api/users/42',
    headers={'Authorization': 'Bearer eyJhbGc...'})
print(response.json())  # {"id": 42, "name": "Alice"}

# POST request
new_user = requests.post('https://example.com/api/users',
    json={'name': 'Alice', 'role': 'admin'})
print(new_user.status_code)  # 201`,
		caption: 'A raw [[http1|HTTP/1.1]] request and response — plain text, human-readable',
		alternatives: [
			{
				language: 'javascript',
				code: `// GET request
const response = await fetch('https://example.com/api/users/42', {
  headers: { 'Authorization': 'Bearer eyJhbGc...' }
});
const user = await response.json();
console.log(user);  // {id: 42, name: "Alice"}

// POST request
const newUser = await fetch('https://example.com/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', role: 'admin' })
});`
			},
			{
				language: 'cli',
				code: `# GET request
curl -H "Authorization: Bearer eyJhbGc..." \\
  https://example.com/api/users/42

# POST request
curl -X POST https://example.com/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "role": "admin"}'

# See full request/response headers
curl -v https://example.com/api/users/42`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Request',
						code: `GET /api/users/42 HTTP/1.1\nHost: api.example.com\nAccept: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\nConnection: keep-alive`
					},
					{
						title: 'Response',
						code: `HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nContent-Length: 127\nCache-Control: max-age=60\nETag: "a1b2c3d4"\n\n{\n  "id": 42,\n  "name": "Alice Chen",\n  "email": "alice@example.com",\n  "role": "admin"\n}`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 RTT per {{request-response|request-response}} (after connection). {{head-of-line-blocking|Head-of-line blocking}} adds latency for multiple resources.',
		throughput:
			'Limited by serial requests; browsers use 6 parallel connections per domain as workaround',
		overhead: 'Text headers are uncompressed and often repeated — 500-800 bytes typical per request'
	},
	connections: [
		'a2a',
		'json-rpc',
		'mcp',
		'tcp',
		'tls',
		'http2',
		'websockets',
		'rest',
		'soap',
		'oauth2'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/HTTP',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9112'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/HTTP_persistent_connection.svg/500px-HTTP_persistent_connection.svg.png',
		alt: 'Diagram comparing HTTP non-persistent and persistent connections, showing how keep-alive reduces round trips',
		caption:
			"HTTP persistent connections ({{keep-alive|keep-alive}}) vs non-persistent — [[http1|HTTP/1.0]] opened a new [[tcp|TCP]] connection for every request, while [[http1|HTTP/1.1]]'s {{keep-alive|keep-alive}} reuses the same connection, saving the overhead of repeated [[tcp|TCP]] {{handshake|handshakes}}.",
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
