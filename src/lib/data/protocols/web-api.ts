import type { Protocol } from '../types';

export const webApiProtocols: Protocol[] = [
	{
		id: 'http1',
		name: 'HTTP/1.1',
		abbreviation: 'HTTP/1.1',
		categoryId: 'web-api',
		port: 80,
		year: 1997,
		rfc: 'RFC 2616',
		oneLiner: 'The original language of the web — one request at a time, in plain text.',
		overview: `HTTP/1.1 is the protocol that built the web as we know it. Every time you click a link, submit a form, or load an image, your browser speaks HTTP to a server. It's a request-response protocol: the client asks for something, the server responds.

HTTP/1.1 improved on HTTP/1.0 by adding persistent connections (keep-alive), chunked transfer encoding, and host headers (allowing multiple websites on one IP). But it has a fundamental limitation: requests on a single connection are serialized. The browser must wait for each response before sending the next request — called "head-of-line blocking."

To work around this, browsers open 6-8 parallel TCP connections per domain. This works but is wasteful. HTTP/2 and HTTP/3 solve this properly with multiplexing. Despite being "old," HTTP/1.1 is still the most widely understood protocol in web development and the foundation for REST APIs.`,
		howItWorks: [
			{
				title: 'TCP connection',
				description:
					'Client establishes a TCP connection to the server (and TLS if HTTPS). This takes 1-3 round trips before any HTTP data flows.'
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
			'REST APIs (the most common API pattern)',
			'Static website serving',
			'Webhook callbacks',
			'Legacy system integration',
			'Simple microservice communication'
		],
		codeExample: {
			language: 'http',
			code: `GET /api/users/42 HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer eyJhbGc...

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 82

{"id": 42, "name": "Alice", "role": "admin"}`,
			caption: 'A raw HTTP/1.1 request and response — plain text, human-readable'
		},
		performance: {
			latency:
				'1 RTT per request-response (after connection). Head-of-line blocking adds latency for multiple resources.',
			throughput: 'Limited by serial requests; browsers use 6-8 parallel connections as workaround',
			overhead:
				'Text headers are uncompressed and often repeated — 500-800 bytes typical per request'
		},
		microInteraction: 'blocking',
		connections: ['tcp', 'tls', 'http2', 'rest']
	},
	{
		id: 'http2',
		name: 'HTTP/2',
		abbreviation: 'HTTP/2',
		categoryId: 'web-api',
		port: 443,
		year: 2015,
		rfc: 'RFC 7540',
		oneLiner: 'Multiplexed, binary HTTP — many requests flying over one connection simultaneously.',
		overview: `HTTP/2 was designed to fix HTTP/1.1's biggest pain points without changing the semantics developers know and love. You still use GET, POST, headers, and status codes — but under the hood, everything is different. The protocol is binary (not text), multiplexed (many requests share one connection), and supports header compression (HPACK) and server push.

Multiplexing is the killer feature: instead of waiting for each response before sending the next request, HTTP/2 interleaves multiple request-response pairs as "streams" on a single TCP connection. This eliminates the need for multiple connections and dramatically improves page load times for resource-heavy sites.

However, HTTP/2 still runs on TCP, which means TCP-level head-of-line blocking persists — a single lost TCP packet blocks all streams. This is what motivated HTTP/3 and QUIC.`,
		howItWorks: [
			{
				title: 'Connection & settings',
				description:
					'After TCP+TLS handshake, client and server exchange SETTINGS frames establishing max concurrent streams, window sizes, etc.'
			},
			{
				title: 'Binary framing',
				description:
					'All communication is split into small binary frames. Each frame belongs to a numbered stream. Multiple streams are interleaved on the same connection.'
			},
			{
				title: 'Header compression',
				description:
					'HPACK compression reduces header overhead dramatically. Common headers are encoded as small integers. Repeated headers reference a shared table.'
			},
			{
				title: 'Multiplexed responses',
				description:
					"Server sends response frames for multiple requests concurrently. A large image download doesn't block a small API response."
			}
		],
		useCases: [
			'Modern websites with many resources (images, scripts, styles)',
			'Single-page applications with many API calls',
			'gRPC (uses HTTP/2 as transport)',
			'Mobile applications (single connection saves battery)',
			'Microservice-to-microservice communication'
		],
		performance: {
			latency:
				'Same connection setup as HTTP/1.1 + TLS, but much lower latency for concurrent requests',
			throughput: 'Single connection carries all requests — no connection overhead waste',
			overhead: 'HPACK compresses headers by 85-88% compared to HTTP/1.1'
		},
		microInteraction: 'multiplex',
		connections: ['http1', 'http3', 'tcp', 'tls', 'grpc']
	},
	{
		id: 'http3',
		name: 'HTTP/3',
		abbreviation: 'HTTP/3',
		categoryId: 'web-api',
		port: 443,
		year: 2022,
		rfc: 'RFC 9114',
		oneLiner: 'HTTP over QUIC — faster connections, no head-of-line blocking, built-in encryption.',
		overview: `HTTP/3 is the latest evolution of HTTP, replacing TCP with QUIC as its transport layer. This seemingly simple swap has profound implications: connections establish faster (1 RTT vs 2-3), lost packets don't block unrelated streams, and connections survive network changes (Wi-Fi to cellular).

The API for developers is identical — same methods, headers, and status codes. The difference is entirely at the transport level. HTTP/3 uses QUIC's independent streams to solve the head-of-line blocking that plagued HTTP/2 over TCP. Each HTTP request maps to a QUIC stream; if one packet is lost, only that stream waits for retransmission.

Adoption is accelerating: Google, Cloudflare, Facebook, and most CDNs support it. By 2025, roughly 30% of web traffic uses HTTP/3.`,
		howItWorks: [
			{
				title: 'QUIC handshake (1 RTT)',
				description:
					'Transport and encryption are established in a single round trip. Returning clients can even send data immediately (0 RTT).'
			},
			{
				title: 'QPACK header compression',
				description:
					"Like HTTP/2's HPACK but adapted for QUIC's out-of-order delivery. Uses separate encoder/decoder streams."
			},
			{
				title: 'Independent streams',
				description:
					'Each request/response is a separate QUIC stream. Packet loss on one stream has zero impact on others.'
			},
			{
				title: 'Connection migration',
				description:
					"If the client's IP changes (mobile network switch), the connection continues seamlessly via QUIC Connection IDs."
			}
		],
		useCases: [
			'Modern web browsing (Chrome, Firefox, Safari support it)',
			'Mobile-first applications',
			'High-latency networks (satellite, remote areas)',
			'CDN and edge computing',
			'Real-time collaboration tools'
		],
		performance: {
			latency: '1 RTT to first data (vs 2-3 for HTTP/2+TLS). 0 RTT on reconnection.',
			throughput: 'Better than HTTP/2 on lossy networks; comparable on clean networks',
			overhead:
				'Slightly higher per-packet than TCP due to QUIC encryption, offset by fewer round trips'
		},
		microInteraction: 'multiplex',
		connections: ['http2', 'quic', 'tls']
	},
	{
		id: 'websockets',
		name: 'WebSockets',
		abbreviation: 'WS',
		categoryId: 'web-api',
		port: 80,
		year: 2011,
		rfc: 'RFC 6455',
		oneLiner: 'Full-duplex, persistent connection — server and client talk freely in real time.',
		overview: `WebSockets solve a fundamental limitation of HTTP: the server can't initiate communication. In HTTP, the client always asks and the server always responds. WebSockets upgrade an HTTP connection into a persistent, full-duplex channel where either side can send messages at any time.

This is perfect for real-time applications: chat, live sports scores, collaborative editing, multiplayer games, financial tickers. Instead of the client repeatedly polling "any updates?" (wasteful), the server simply pushes data when it's available.

The connection starts as a normal HTTP request with an "Upgrade: websocket" header. If the server agrees, the connection switches protocols. From that point on, both sides exchange lightweight binary or text frames with just 2-14 bytes of overhead per message (vs hundreds of bytes for HTTP headers).`,
		howItWorks: [
			{
				title: 'HTTP upgrade request',
				description:
					'Client sends a standard HTTP request with "Upgrade: websocket" and a random key. This reuses existing HTTP infrastructure (ports, proxies, cookies).'
			},
			{
				title: 'Server accepts upgrade',
				description:
					'Server responds with "101 Switching Protocols" and a computed accept key. The connection is now a WebSocket — HTTP is done.'
			},
			{
				title: 'Bidirectional messaging',
				description:
					'Both sides freely send messages as frames — text or binary. No request/response pattern. No headers per message. Incredibly lightweight.'
			},
			{
				title: 'Ping/pong keepalive',
				description:
					'Either side can send ping frames; the other must respond with pong. This keeps the connection alive through firewalls and proxies.'
			}
		],
		useCases: [
			'Chat applications (Slack, Discord)',
			'Live sports scores and stock tickers',
			'Collaborative editing (Google Docs, Figma)',
			'Multiplayer browser games',
			'IoT device dashboards'
		],
		codeExample: {
			language: 'javascript',
			code: `// Browser — connect and listen
const ws = new WebSocket('wss://example.com/chat');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'join', room: 'general' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(\`\${msg.user}: \${msg.text}\`);
};

// Server can push messages at any time
// No polling, no long-polling, no SSE — just push`,
			caption: 'WebSocket API is dead simple — connect, send, receive. Both sides can initiate.'
		},
		performance: {
			latency:
				'1 HTTP round trip for upgrade, then sub-millisecond messaging (no per-message handshake)',
			throughput: 'Near wire-speed for small messages; minimal framing overhead',
			overhead: '2-14 bytes per frame (vs 200-800 bytes per HTTP request)'
		},
		microInteraction: 'tube',
		connections: ['http1', 'tcp', 'tls']
	},
	{
		id: 'grpc',
		name: 'gRPC',
		abbreviation: 'gRPC',
		categoryId: 'web-api',
		port: 443,
		year: 2016,
		rfc: undefined,
		oneLiner: 'High-performance RPC framework using Protocol Buffers over HTTP/2.',
		overview: `gRPC is Google's open-source framework for remote procedure calls. Instead of designing REST endpoints and manually serializing JSON, you define your service and messages in Protocol Buffers (.proto files), and gRPC generates strongly-typed client and server code in 11+ languages.

It uses HTTP/2 for transport, gaining multiplexing and header compression for free. Messages are serialized as Protocol Buffers — a binary format that's 3-10x smaller and 20-100x faster to parse than JSON. gRPC also natively supports streaming: server-streaming, client-streaming, and bidirectional streaming.

gRPC dominates in microservice architectures where services are internal and performance matters. It's less common for public APIs (browsers can't easily use it), though gRPC-Web bridges that gap.`,
		howItWorks: [
			{
				title: 'Define service in .proto',
				description:
					'You write a .proto file defining your service methods and message types. This is the single source of truth for your API contract.'
			},
			{
				title: 'Generate code',
				description:
					'The protoc compiler generates client stubs and server interfaces in your language. Types are enforced at compile time.'
			},
			{
				title: 'Call like a local function',
				description:
					'Client code calls server methods as if they were local functions. gRPC handles serialization, HTTP/2 framing, and transport.'
			},
			{
				title: 'Streaming',
				description:
					'Beyond simple request/response, gRPC supports server-streaming (one request, many responses), client-streaming, and full bidirectional streaming.'
			}
		],
		useCases: [
			'Microservice-to-microservice communication',
			'Mobile backend APIs (efficient binary protocol)',
			'Real-time data streaming between services',
			'Polyglot architectures (12+ language support)',
			'Kubernetes service mesh communication'
		],
		codeExample: {
			language: 'protobuf',
			code: `// user.proto — define once, generate everywhere
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}`,
			caption:
				'One .proto file generates type-safe clients in Go, Python, Java, TypeScript, and more'
		},
		performance: {
			latency: 'HTTP/2 connection reuse + binary serialization = very low latency per call',
			throughput: 'Protobuf is 3-10x smaller than JSON; 20-100x faster to serialize/deserialize',
			overhead: 'HTTP/2 framing + protobuf encoding. Very efficient for structured data.'
		},
		microInteraction: 'multiplex',
		connections: ['http2', 'tls']
	},
	{
		id: 'graphql',
		name: 'GraphQL',
		abbreviation: 'GraphQL',
		categoryId: 'web-api',
		port: 443,
		year: 2015,
		rfc: undefined,
		oneLiner: 'Ask for exactly the data you need — no more, no less. A query language for APIs.',
		overview: `GraphQL is Facebook's alternative to REST. Instead of the server deciding what data each endpoint returns, the client sends a query describing exactly what it wants. The server responds with precisely that shape of data — no over-fetching (getting fields you don't need) and no under-fetching (needing 5 REST calls for one screen).

GraphQL operates over HTTP (typically POST to a single /graphql endpoint). The query language lets you traverse relationships, request nested data, and combine what would be multiple REST requests into a single query. It also has a strong type system — the schema defines every type, field, and relationship.

It shines for complex frontends (mobile apps, SPAs) that need flexible data fetching. It's less ideal for simple CRUD operations where REST's simplicity wins.`,
		howItWorks: [
			{
				title: 'Define schema',
				description:
					'Server defines a typed schema: types, fields, relationships, and resolvers. This is the API contract.'
			},
			{
				title: 'Client writes query',
				description:
					'Client requests exactly the fields it needs, including nested relationships. One query replaces multiple REST calls.'
			},
			{
				title: 'Server resolves',
				description:
					'GraphQL engine parses the query, validates it against the schema, and calls resolver functions for each field.'
			},
			{
				title: 'Shaped response',
				description:
					"The response mirrors the query structure exactly. If you asked for user.name and user.posts.title, that's all you get."
			}
		],
		useCases: [
			'Mobile applications (minimize bandwidth)',
			'Complex dashboard UIs with varied data needs',
			'API gateways aggregating multiple services',
			'Content management systems',
			'E-commerce product pages with relationships'
		],
		performance: {
			latency: 'Single HTTP round trip for complex data needs (vs multiple REST calls)',
			throughput:
				'No over-fetching reduces payload size; but complex queries can stress the server',
			overhead: 'Query parsing + validation adds server-side cost. Caching is harder than REST.'
		},
		microInteraction: 'default',
		connections: ['http1', 'http2', 'websockets']
	}
];
