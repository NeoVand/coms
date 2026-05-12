import type { Protocol } from '../types';

export const rest: Protocol = {
	id: 'rest',
	name: 'Representational State Transfer',
	abbreviation: 'REST',
	categoryId: 'web-api',
	year: 2000,
	oneLiner:
		'An architectural style for web APIs — not a protocol, but the dominant pattern for HTTP services.',
	overview: `[[rest|REST]] is not a protocol — it's an architectural style defined by [[pioneer:roy-fielding|Roy Fielding]] in his 2000 doctoral dissertation. It describes how to build scalable web services using the existing mechanics of [[http1|HTTP]]: URLs as resource identifiers, {{http-method|HTTP methods}} as operations, {{status-code|status codes}} as outcomes, and hypermedia as the engine of application state.

A RESTful API models everything as resources (nouns, not verbs). You GET a user, POST a new order, PUT an updated profile, DELETE a session. Each request is {{stateless|stateless}} — the server doesn't remember previous requests, so every call carries all the context it needs. This makes [[rest|REST]] APIs easy to cache, scale horizontally, and reason about.

[[rest|REST]]'s ubiquity comes from its simplicity: any [[http1|HTTP]] client in any language can call a [[rest|REST]] API. No special tooling, no code generation, no binary protocols. {{json|JSON}} became the de facto format, though [[rest|REST]] itself is format-agnostic. The trade-off is that [[rest|REST]] can be chatty — fetching a complex resource might require multiple round trips, which is exactly the problem [[graphql|GraphQL]] was designed to solve.`,
	howItWorks: [
		{
			title: 'Resource identification',
			description:
				'Every resource has a unique URL (e.g., /api/users/42). The URL structure creates a logical hierarchy that maps to your data model.'
		},
		{
			title: 'HTTP methods as verbs',
			description:
				'GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove). Each method has defined semantics — GET is safe and {{idempotent|idempotent}}, DELETE is {{idempotent|idempotent}} but not safe.'
		},
		{
			title: 'Stateless requests',
			description:
				'Each request contains all information needed to process it — authentication tokens, content type, requested format. The server maintains no session state between requests — [[rest|REST]] is {{stateless|stateless}}.'
		},
		{
			title: 'Response with status',
			description:
				'Server returns an {{status-code|HTTP status code}} (200 OK, 201 Created, 404 Not Found, etc.) along with the resource representation, typically as {{json|JSON}}.'
		}
	],
	useCases: [
		'Public APIs for third-party integrations',
		'CRUD operations on database resources',
		'Microservice-to-microservice communication',
		'Mobile app backends',
		'Any HTTP-based service where simplicity and broad compatibility matter'
	],
	codeExample: {
		language: 'python',
		code: `import requests

# GET — read a resource
user = requests.get('https://api.example.com/users/42').json()

# POST — create a resource
new_user = requests.post('https://api.example.com/users',
    json={'name': 'Alice', 'role': 'admin'}).json()

# PUT — replace a resource
requests.put('https://api.example.com/users/42',
    json={'name': 'Alice', 'role': 'superadmin'})

# DELETE — remove a resource
requests.delete('https://api.example.com/users/42')`,
		caption:
			'[[rest|REST]] uses standard HTTP — any language with an HTTP client can interact with a [[rest|REST]] API.',
		alternatives: [
			{
				language: 'javascript',
				code: `// GET — read a resource
const user = await fetch('/api/users/42').then(r => r.json());

// POST — create a resource
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', role: 'admin' })
}).then(r => r.json());

// DELETE — remove a resource
await fetch('/api/users/42', { method: 'DELETE' });`
			},
			{
				language: 'cli',
				code: `# GET — read a resource
curl https://api.example.com/users/42 | jq

# POST — create a resource
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "role": "admin"}'

# PUT — replace a resource
curl -X PUT https://api.example.com/users/42 \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "role": "superadmin"}'

# DELETE — remove a resource
curl -X DELETE https://api.example.com/users/42`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'GET Request + Response',
						code: `GET /api/v2/users/42 HTTP/1.1\nHost: api.example.com\nAccept: application/json\nAuthorization: Bearer token123\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nLink: </api/v2/users/42>; rel="self"\n\n{\n  "id": 42,\n  "name": "Alice Chen",\n  "email": "alice@example.com",\n  "_links": {\n    "self": "/api/v2/users/42",\n    "posts": "/api/v2/users/42/posts"\n  }\n}`
					},
					{
						title: 'POST Request + Response',
						code: `POST /api/v2/users HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nAuthorization: Bearer token123\n\n{"name": "Bob Smith", "email": "bob@example.com"}\n\nHTTP/1.1 201 Created\nLocation: /api/v2/users/43\nContent-Type: application/json\n\n{\n  "id": 43,\n  "name": "Bob Smith",\n  "email": "bob@example.com",\n  "_links": { "self": "/api/v2/users/43" }\n}`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Per-request (no persistent state)',
		throughput: 'Depends on HTTP version used',
		overhead: 'Minimal — uses standard HTTP semantics'
	},
	connections: [
		'a2a',
		'http1',
		'http2',
		'http3',
		'json-rpc',
		'mcp',
		'graphql',
		'grpc',
		'sse',
		'websockets',
		'soap',
		'oauth2'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[rest|REST]]',
		official: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Client-server_model.svg/500px-Client-server_model.svg.png',
		alt: 'Diagram of the client-server model showing multiple clients communicating with a central server over a network',
		caption:
			'The {{client-server|client-server model}} — the foundation of [[rest|REST]] architecture. Clients send {{stateless|stateless}} HTTP requests to a server, which manages resources and returns representations. This separation of concerns is what makes [[rest|REST]] APIs scalable and cacheable.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
