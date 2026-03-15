import type { Protocol } from '../types';

export const webApiProtocols: Protocol[] = [
	{
		id: 'http1',
		name: 'HyperText Transfer Protocol',
		abbreviation: 'HTTP/1.1',
		categoryId: 'web-api',
		port: 80,
		year: 1997,
		rfc: 'RFC 9112',
		oneLiner: 'The original language of the web — one request at a time, in plain text.',
		overview: `HTTP/1.1 is the protocol that built the web as we know it. Every time you click a link, submit a form, or load an image, your browser speaks HTTP to a server. It's a {{request-response|request-response}} protocol: the client asks for something, the server responds.

HTTP/1.1 improved on HTTP/1.0 by adding persistent connections ({{keep-alive|keep-alive}}), chunked transfer encoding, and {{header|host headers}} (allowing multiple websites on one IP). But it has a fundamental limitation: requests on a single connection are serialized. The browser must wait for each response before sending the next request — called "{{head-of-line-blocking|head-of-line blocking}}."

To work around this, browsers open 6 parallel [[tcp|TCP]] connections per domain. This works but is wasteful. [[http2|HTTP/2]] and [[http3|HTTP/3]] solve this properly with {{multiplexing|multiplexing}}. Despite being "old," HTTP/1.1 is still the most widely understood protocol in web development and the foundation for [[rest|REST]] APIs.`,
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
			caption: 'A raw HTTP/1.1 request and response — plain text, human-readable',
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
				'1 RTT per request-response (after connection). Head-of-line blocking adds latency for multiple resources.',
			throughput: 'Limited by serial requests; browsers use 6 parallel connections per domain as workaround',
			overhead:
				'Text headers are uncompressed and often repeated — 500-800 bytes typical per request'
		},
		connections: ['a2a', 'json-rpc', 'mcp', 'tcp', 'tls', 'http2', 'websockets', 'rest', 'soap', 'oauth2'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9112'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/HTTP_persistent_connection.svg/600px-HTTP_persistent_connection.svg.png',
			alt: 'Diagram comparing HTTP non-persistent and persistent connections, showing how keep-alive reduces round trips',
			caption:
				'HTTP persistent connections (keep-alive) vs non-persistent — HTTP/1.0 opened a new TCP connection for every request, while HTTP/1.1\'s keep-alive reuses the same connection, saving the overhead of repeated TCP handshakes.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'http2',
		name: 'HyperText Transfer Protocol 2',
		abbreviation: 'HTTP/2',
		categoryId: 'web-api',
		port: 443,
		year: 2015,
		rfc: 'RFC 9113',
		oneLiner: 'Multiplexed, binary HTTP — many requests flying over one connection simultaneously.',
		overview: `HTTP/2 was designed to fix [[http1|HTTP/1.1]]'s biggest pain points without changing the semantics developers know and love. You still use GET, POST, headers, and {{status-code|status codes}} — but under the hood, everything is different. The protocol is {{binary-framing|binary (not text)}}, {{multiplexing|multiplexed}} (many requests share one connection), and supports {{header|header}} compression ({{hpack|HPACK}}) and {{server-push|server push}} (now deprecated — Chrome removed support in Chrome 106; 103 Early Hints is the recommended replacement).

Multiplexing is the killer feature: instead of waiting for each response before sending the next request, HTTP/2 interleaves multiple request-response pairs as "{{stream|streams}}" on a single [[tcp|TCP]] connection. This eliminates the need for multiple connections and dramatically improves page load times for resource-heavy sites.

While the HTTP/2 spec (RFC 9113) doesn't mandate TLS, all browsers require HTTPS for HTTP/2 connections (h2). Unencrypted HTTP/2 (h2c) is only used in server-to-server communication.

However, HTTP/2 still runs on [[tcp|TCP]], which means [[tcp|TCP]]-level {{head-of-line-blocking|head-of-line blocking}} persists — a single lost [[tcp|TCP]] {{packet|packet}} blocks all streams. This is what motivated [[http3|HTTP/3]] and [[quic|QUIC]].`,
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
		codeExample: {
			language: 'python',
			code: `import httpx

# httpx supports HTTP/2 natively
client = httpx.Client(http2=True)

response = client.get("https://example.com/api/data")
print(f"HTTP version: {response.http_version}")  # HTTP/2
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")

client.close()`,
			caption:
				'HTTP/2 multiplexes requests over a single connection with binary framing',
			alternatives: [
				{
					language: 'javascript',
					code: `const http2 = require('node:http2');

// Connect to an HTTP/2 server
const client = http2.connect('https://example.com');

// Multiplexed: multiple requests on one connection
const req = client.request({ ':path': '/api/data' });

req.on('response', (headers) => {
  console.log('Status:', headers[':status']);
});

let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log('Response:', data);
  client.close();
});
req.end();`
				},
				{
					language: 'cli',
					code: `# Force HTTP/2 with curl
curl --http2 -v https://example.com/api/data

# Check if a server supports HTTP/2
curl -sI --http2 https://example.com | grep -i "http/2"

# HTTP/2 with verbose protocol details
curl --http2 -v https://example.com 2>&1 | grep "< HTTP"`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'SETTINGS Frame',
							code: `Frame: SETTINGS (type=0x04)\nLength: 18  |  Flags: 0x00  |  Stream: 0\n  HEADER_TABLE_SIZE: 4096\n  MAX_CONCURRENT_STREAMS: 100\n  INITIAL_WINDOW_SIZE: 65535`
						},
						{
							title: 'HEADERS + DATA',
							code: `Frame: HEADERS (type=0x01)\nLength: 43  |  Flags: END_HEADERS  |  Stream: 1\n  :method: GET\n  :path: /api/users/42\n  :scheme: https\n  :authority: api.example.com\n\nFrame: DATA (type=0x00)\nLength: 127  |  Flags: END_STREAM  |  Stream: 1\n  {"id": 42, "name": "Alice Chen", ...}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Same connection setup as HTTP/1.1 + TLS, but much lower latency for concurrent requests',
			throughput: 'Single connection carries all requests — no connection overhead waste',
			overhead: 'HPACK compresses headers by 30-76% compared to HTTP/1.1, depending on traffic patterns'
		},
		connections: ['http1', 'http3', 'tcp', 'tls', 'grpc', 'sse'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP/2',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9113'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/HTTP_pipelining2.svg/600px-HTTP_pipelining2.svg.png',
			alt: 'Diagram comparing HTTP/1.1 sequential requests, pipelining, and HTTP/2 multiplexing over a single connection',
			caption:
				'The evolution from HTTP/1.1 to HTTP/2 — sequential requests waste time waiting, pipelining helped but still suffered head-of-line blocking. HTTP/2 multiplexing sends multiple requests and responses simultaneously over a single connection using binary framing.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'http3',
		name: 'HyperText Transfer Protocol 3',
		abbreviation: 'HTTP/3',
		categoryId: 'web-api',
		port: 443,
		year: 2022,
		rfc: 'RFC 9114',
		oneLiner: 'HTTP over QUIC — faster connections, no head-of-line blocking, built-in encryption.',
		overview: `HTTP/3 is the latest evolution of HTTP, replacing [[tcp|TCP]] with [[quic|QUIC]] as its transport layer. This seemingly simple swap has profound implications: connections establish faster (1 {{rtt|RTT}} vs 2-3), lost {{packet|packets}} don't block unrelated streams, and connections survive network changes (Wi-Fi to cellular).

The API for developers is identical — same methods, headers, and status codes. The difference is entirely at the transport level. HTTP/3 uses [[quic|QUIC]]'s independent {{stream|streams}} to solve the {{head-of-line-blocking|head-of-line blocking}} that plagued [[http2|HTTP/2]] over [[tcp|TCP]]. Each HTTP request maps to a [[quic|QUIC]] stream; if one packet is lost, only that stream waits for {{retransmission|retransmission}}.

Adoption is accelerating: Google, Cloudflare, Facebook, and most {{cdn|CDNs}} support it. By 2025, ~35% of web traffic uses HTTP/3.`,
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
		codeExample: {
			language: 'cli',
			code: `# curl supports HTTP/3 natively with --http3
curl --http3 -v https://cloudflare-quic.com

# Check if a server advertises HTTP/3 via Alt-Svc
curl -sI https://cloudflare-quic.com \\
  | grep -i alt-svc
# alt-svc: h3=":443"; ma=86400

# Force HTTP/3 only (fail if not supported)
curl --http3-only https://cloudflare-quic.com`,
			caption:
				'HTTP/3 uses QUIC transport — clients discover it via the Alt-Svc header',
			alternatives: [
				{
					language: 'javascript',
					code: `// Browsers auto-negotiate HTTP/3 when available
const response = await fetch('https://cloudflare-quic.com');
console.log('Status:', response.status);

// Check Alt-Svc header for HTTP/3 support
const altSvc = response.headers.get('alt-svc');
console.log('Alt-Svc:', altSvc);
// h3=":443"; ma=86400

// Performance observer can detect protocol version
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Protocol:', entry.nextHopProtocol);
    // "h3" for HTTP/3, "h2" for HTTP/2
  }
});
observer.observe({ type: 'resource' });`
				},
				{
					language: 'python',
					code: `import asyncio
from aioquic.asyncio import connect
from aioquic.h3.connection import H3Connection
from aioquic.quic.configuration import QuicConfiguration

async def fetch_h3():
    config = QuicConfiguration(is_client=True)
    config.verify_mode = False  # for testing only

    async with connect("cloudflare-quic.com", 443,
                       configuration=config) as quic:
        h3 = H3Connection(quic._quic)
        stream_id = quic._quic.get_next_available_stream_id()
        h3.send_headers(stream_id, [
            (b":method", b"GET"),
            (b":path", b"/"),
            (b":scheme", b"https"),
            (b":authority", b"cloudflare-quic.com"),
        ])

asyncio.run(fetch_h3())`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'SETTINGS Frame',
							code: `QUIC Stream: 0x00 (Control)\nFrame: SETTINGS (type=0x04)\n  QPACK_MAX_TABLE_CAPACITY: 4096\n  MAX_FIELD_SECTION_SIZE: 8192`
						},
						{
							title: 'Request Stream',
							code: `QUIC Stream: 0x04 (Bidirectional)\nFrame: HEADERS (type=0x01)\n  :method = GET\n  :path = /api/users/42\n  :scheme = https\n  :authority = api.example.com\n  accept = application/json\n\nFrame: DATA (type=0x00)\n  (empty body — GET request)\n\n--- Server Response ---\nFrame: HEADERS (type=0x01)\n  :status = 200\n  content-type = application/json\n\nFrame: DATA (type=0x00)\n  {"id": 42, "name": "Alice Chen"}`
						}
					]
				}
			]
		},
		performance: {
			latency: '1 RTT to first data (vs 2-3 for HTTP/2+TLS). 0 RTT on reconnection.',
			throughput: 'Better than HTTP/2 on lossy networks; comparable on clean networks',
			overhead:
				'Slightly higher per-packet than TCP due to QUIC encryption, offset by fewer round trips'
		},
		connections: ['http2', 'quic', 'tls', 'udp', 'rest'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP/3',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9114'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Googleplex-Patio-Aug-2014.JPG/600px-Googleplex-Patio-Aug-2014.JPG',
			alt: 'The Googleplex campus in Mountain View, California, where QUIC and HTTP/3 were developed',
			caption:
				'The Googleplex in Mountain View — birthplace of QUIC and HTTP/3. Google engineers designed these protocols to eliminate TCP\'s head-of-line blocking and speed up the web for billions of users.',
			credit: 'Photo: The Pancake of Heaven! / CC BY-SA 4.0, via Wikimedia Commons'
		}
	},
	{
		id: 'websockets',
		name: 'WebSocket Protocol',
		abbreviation: 'WS',
		categoryId: 'web-api',
		port: 80,
		year: 2011,
		rfc: 'RFC 6455',
		oneLiner: 'Full-duplex, persistent connection — server and client talk freely in real time.',
		overview: `WebSockets solve a fundamental limitation of [[http1|HTTP]]: the server can't initiate communication. In [[http1|HTTP]], the client always asks and the server always responds. WebSockets upgrade an [[http1|HTTP]] connection into a persistent, {{full-duplex|full-duplex}} channel where either side can send messages at any time.

This is perfect for real-time applications: chat, live sports scores, collaborative editing, multiplayer games, financial tickers. Instead of the client repeatedly polling "any updates?" (wasteful), the server simply pushes data when it's available. Unlike [[http1|HTTP]]'s request-response model, WebSockets maintain a {{stateful|stateful}} connection where both sides can track context across messages without re-establishing identity on every exchange.

The connection starts as a normal [[http1|HTTP]] request with an "Upgrade: websocket" {{header|header}}. If the server agrees, the connection switches protocols. From that point on, both sides exchange lightweight binary or text {{frame|frames}} with just 2-14 bytes of overhead per message (vs hundreds of bytes for [[http1|HTTP]] headers).`,
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
			language: 'python',
			code: `import asyncio
import websockets

async def chat():
    async with websockets.connect('wss://example.com/chat') as ws:
        await ws.send('{"type": "join", "room": "general"}')

        async for message in ws:
            print(f"Received: {message}")
            await ws.send('{"type": "msg", "text": "Hello!"}')

asyncio.run(chat())`,
			caption: 'WebSocket API is dead simple — connect, send, receive. Both sides can initiate.',
			alternatives: [
				{
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
// No polling, no long-polling, no SSE — just push`
				},
				{
					language: 'cli',
					code: `# Connect to a WebSocket server with websocat
websocat wss://ws.postman-echo.com/raw

# Send a message and see the echo
echo '{"type": "join"}' | websocat wss://example.com/chat

# curl can do the WebSocket upgrade handshake
curl -i -N \\
  -H "Connection: Upgrade" \\
  -H "Upgrade: websocket" \\
  -H "Sec-WebSocket-Version: 13" \\
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \\
  https://example.com/chat`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Upgrade Handshake',
							code: `GET /chat HTTP/1.1\nHost: ws.example.com\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\nSec-WebSocket-Version: 13\nSec-WebSocket-Protocol: chat\n\nHTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\nSec-WebSocket-Protocol: chat`
						},
						{
							title: 'Text Frame',
							code: `WebSocket Frame:\n  FIN: 1  (final fragment)\n  Opcode: 0x1  (text)\n  MASK: 1  (client → server)\n  Payload Length: 27\n  Masking Key: 0x37fa213d\n  Payload: {"msg": "Hello, World!"}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'1 HTTP round trip for upgrade, then sub-millisecond messaging (no per-message handshake)',
			throughput: 'Near wire-speed for small messages; minimal framing overhead',
			overhead: '2-14 bytes per frame (vs 200-800 bytes per HTTP request)'
		},
		connections: ['a2a', 'http1', 'http2', 'json-rpc', 'mcp', 'tcp', 'tls', 'sse', 'graphql', 'rest'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/WebSocket',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc6455'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Websocket_connection.png/600px-Websocket_connection.png',
			alt: 'Diagram showing the WebSocket connection lifecycle: HTTP upgrade handshake followed by full-duplex bidirectional communication',
			caption:
				'The WebSocket connection lifecycle — it starts as a normal HTTP request with an Upgrade header, then switches to a persistent, full-duplex channel where both client and server can send messages at any time without the overhead of HTTP headers.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
		id: 'grpc',
		name: 'gRPC Remote Procedure Calls',
		abbreviation: 'gRPC',
		categoryId: 'web-api',
		port: 443,
		year: 2015,
		rfc: undefined,
		oneLiner: 'High-performance RPC framework using Protocol Buffers over HTTP/2.',
		overview: `gRPC is Google's open-source framework for remote procedure calls. Instead of designing [[rest|REST]] endpoints and manually serializing {{json|JSON}}, you define your service and messages in {{protocol-buffers|Protocol Buffers}} (.proto files), and gRPC generates strongly-typed client and server code in 11 languages.

It uses [[http2|HTTP/2]] for transport, gaining {{multiplexing|multiplexing}} and {{header|header}} compression for free. Messages are serialized as Protocol Buffers — a binary format that's 3-10x smaller and 3-10x faster to parse than JSON. gRPC also natively supports {{stream|streaming}}: server-streaming, client-streaming, and bidirectional streaming.

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
			'Polyglot architectures (11 language support)',
			'Kubernetes service mesh communication'
		],
		codeExample: {
			language: 'python',
			code: `import grpc
import user_pb2, user_pb2_grpc

# Connect to gRPC server
channel = grpc.insecure_channel('localhost:50051')
stub = user_pb2_grpc.UserServiceStub(channel)

# Unary call — like a function call
user = stub.GetUser(user_pb2.GetUserRequest(id=42))
print(f"{user.name} ({user.email})")

# Server streaming — receive multiple responses
for user in stub.ListUsers(user_pb2.ListUsersRequest()):
    print(f"User: {user.name}")`,
			caption:
				'One .proto file generates type-safe clients in Go, Python, Java, TypeScript, and more',
			alternatives: [
				{
					language: 'javascript',
					code: `const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('user.proto');
const proto = grpc.loadPackageDefinition(packageDef);

const client = new proto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Unary call
client.GetUser({ id: 42 }, (err, user) => {
  console.log(\`\${user.name} (\${user.email})\`);
});

// Server streaming
const stream = client.ListUsers({});
stream.on('data', (user) => console.log('User:', user.name));`
				},
				{
					language: 'cli',
					code: `# List available services
grpcurl -plaintext localhost:50051 list

# Describe a service
grpcurl -plaintext localhost:50051 describe UserService

# Call a unary method
grpcurl -plaintext -d '{"id": 42}' \\
  localhost:50051 UserService/GetUser

# Server streaming call
grpcurl -plaintext localhost:50051 UserService/ListUsers`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: '.proto Service Definition',
							code: `syntax = "proto3";\npackage users;\n\nservice UserService {\n  rpc GetUser (GetUserRequest) returns (User);\n  rpc ListUsers (ListUsersRequest) returns (stream User);\n}\n\nmessage GetUserRequest {\n  int32 id = 1;\n}\n\nmessage User {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n}`
						},
						{
							title: 'gRPC Wire Frame (HTTP/2)',
							code: `HEADERS frame:\n  :method: POST\n  :path: /users.UserService/GetUser\n  :scheme: https\n  content-type: application/grpc\n  grpc-encoding: identity\n  te: trailers\n\nDATA frame:\n  Compressed: 0\n  Length: 5 bytes\n  Message: 0x08 0x2a  (field 1, varint 42)\n\nHEADERS frame (trailers):\n  grpc-status: 0\n  grpc-message: OK`
						}
					]
				}
			]
		},
		performance: {
			latency: 'HTTP/2 connection reuse + binary serialization = very low latency per call',
			throughput: 'Protobuf is 3-10x smaller than JSON; 3-10x faster to serialize/deserialize',
			overhead: 'HTTP/2 framing + protobuf encoding. Very efficient for structured data.'
		},
		connections: ['a2a', 'http2', 'json-rpc', 'mcp', 'tls', 'rest', 'soap'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/GRPC',
			official: 'https://grpc.io/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Google_Corkboard_Server_Rack.jpg/600px-Google_Corkboard_Server_Rack.jpg',
			alt: "Google's original corkboard server rack from 1999, now at the Computer History Museum",
			caption:
				"Google's original 1999 server rack — built from corkboard and spare parts. Google later created gRPC to handle the massive scale of inter-service communication across its data centers, using Protocol Buffers and HTTP/2.",
			credit: 'Photo: Wikimedia Commons / CC BY 2.0'
		}
	},
	{
		id: 'graphql',
		name: 'Graph Query Language',
		abbreviation: 'GraphQL',
		categoryId: 'web-api',
		port: 443,
		year: 2015,
		rfc: undefined,
		oneLiner: 'Ask for exactly the data you need — no more, no less. A query language for APIs.',
		overview: `GraphQL was created at Facebook in 2012 and open-sourced in 2015. It's now maintained by the GraphQL Foundation under the Linux Foundation. Instead of the server deciding what data each endpoint returns, the client sends a query describing exactly what it wants. The server responds with precisely that shape of data — no over-fetching (getting fields you don't need) and no under-fetching (needing 5 [[rest|REST]] calls for one screen).

GraphQL has three operation types: queries (read data), mutations (write data), and subscriptions (real-time updates pushed from the server, typically over [[websockets|WebSockets]]). It operates over [[http1|HTTP]] (typically a single /graphql endpoint accepting both {{http-method|GET and POST}} requests). The query language lets you traverse relationships, request nested data, and combine what would be multiple [[rest|REST]] requests into a single query. It also has a strong type system — the schema defines every type, field, and relationship.

It shines for complex frontends (mobile apps, SPAs) that need flexible data fetching. It's less ideal for simple CRUD operations where [[rest|REST]]'s simplicity wins.`,
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
		codeExample: {
			language: 'python',
			code: `import requests

query = """
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      posts(limit: 5) { title }
    }
  }
"""

response = requests.post(
    "https://api.example.com/graphql",
    json={"query": query, "variables": {"id": "42"}}
)

data = response.json()["data"]
print(data["user"]["name"], data["user"]["posts"])`,
			caption: 'One GraphQL query replaces multiple REST calls — ask for exactly the data you need',
			alternatives: [
				{
					language: 'javascript',
					code: `const query = \`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      posts(limit: 5) {
        title
        createdAt
      }
    }
  }
\`;

const response = await fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: { id: '42' }
  })
});

const { data } = await response.json();
console.log(data.user.name, data.user.posts);`
				},
				{
					language: 'cli',
					code: `# GraphQL query via curl
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ user(id: 42) { name email } }"}'

# With variables
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query($id: ID!) { user(id: $id) { name } }",
    "variables": {"id": "42"}
  }'

# Introspection — discover the schema
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ __schema { types { name } } }"}'`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Query Request',
							code: `POST /graphql HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nAuthorization: Bearer eyJhbGci...\n\n{\n  "query": "query GetUser($id: ID!) { user(id: $id) { name email posts { title } } }",\n  "variables": { "id": "42" }\n}`
						},
						{
							title: 'Response',
							code: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "data": {\n    "user": {\n      "name": "Alice Chen",\n      "email": "alice@example.com",\n      "posts": [\n        { "title": "Getting Started with GraphQL" },\n        { "title": "Advanced Query Patterns" }\n      ]\n    }\n  }\n}`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Single HTTP round trip for complex data needs (vs multiple REST calls)',
			throughput:
				'No over-fetching reduces payload size; but complex queries can stress the server',
			overhead: 'Query parsing + validation adds server-side cost. Caching is harder than REST.'
		},
		connections: ['http1', 'http2', 'json-rpc', 'websockets', 'rest', 'sse', 'soap'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/GraphQL',
			official: 'https://graphql.org/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Facebook_Headquarters_Menlo_Park.jpg/600px-Facebook_Headquarters_Menlo_Park.jpg',
			alt: 'Facebook headquarters in Menlo Park, California, where GraphQL was created',
			caption:
				'Facebook\'s headquarters in Menlo Park — where GraphQL was created in 2012 to power the News Feed on mobile. The query language solved the over-fetching problem that REST APIs couldn\'t.',
			credit: 'Photo: Marcin Wichary / CC BY 2.0, via Wikimedia Commons'
		}
	},
	{
		id: 'sse',
		name: 'Server-Sent Events',
		abbreviation: 'SSE',
		categoryId: 'web-api',
		port: 443,
		year: 2006,
		rfc: 'WHATWG Living Standard',
		oneLiner: 'One-way real-time streaming from server to browser over plain HTTP.',
		overview: `Server-Sent Events (SSE) provide a simple, standardized way for servers to push updates to web clients over a single [[http1|HTTP]] connection. Unlike [[websockets|WebSockets]], SSE is unidirectional — the server sends events, and the client listens. This simplicity is its strength.

SSE uses plain [[http1|HTTP]], which means it works through {{proxy|proxies}}, {{load-balancing|load balancers}}, and {{firewall|firewalls}} without any special configuration. The browser's EventSource API automatically handles reconnection, event IDs for resuming after disconnects, and {{content-negotiation|content type negotiation}}.

Each event is a text block with optional fields: event type, data payload, ID, and retry interval. The format is deliberately simple — just UTF-8 text with newline separators. This makes SSE ideal for live feeds, notifications, and {{stream|streaming}} AI responses where the server needs to push data but doesn't need to receive a stream back.`,
		howItWorks: [
			{
				title: 'HTTP connection',
				description:
					'Client opens a standard HTTP request with Accept: text/event-stream. The server responds with Content-Type: text/event-stream and keeps the connection open.'
			},
			{
				title: 'Event stream',
				description:
					'Server sends events as text blocks separated by blank lines. Each event has optional fields: "event:" (type), "data:" (payload), "id:" (last event ID), and "retry:" (reconnection interval in ms).'
			},
			{
				title: 'Auto-reconnection',
				description:
					'If the connection drops, the browser automatically reconnects and sends the last event ID in a Last-Event-ID header, allowing the server to resume from where it left off.'
			},
			{
				title: 'Client processing',
				description:
					'The EventSource API fires message events (or named events) that JavaScript handlers process. No polling, no complexity — just native browser event handling.'
			}
		],
		useCases: [
			'Live notification feeds and activity streams',
			'Real-time dashboards and monitoring displays',
			'Streaming AI/LLM responses token-by-token',
			'Stock tickers and sports score updates',
			'Server-side progress updates for long-running tasks'
		],
		codeExample: {
			language: 'python',
			code: `# Server — Flask SSE endpoint
from flask import Flask, Response
import time, json

app = Flask(__name__)

@app.route('/api/notifications')
def stream():
    def generate():
        while True:
            data = json.dumps({"time": time.time()})
            yield f"event: update\\ndata: {data}\\n\\n"
            time.sleep(1)
    return Response(generate(),
                    mimetype='text/event-stream')`,
			caption:
				'The EventSource API handles connection management, reconnection, and event parsing automatically.',
			alternatives: [
				{
					language: 'javascript',
					code: `// Browser — listen for server-sent events
const source = new EventSource('/api/notifications');

source.onmessage = (event) => {
  console.log('New message:', event.data);
};

source.addEventListener('update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
});

source.onerror = () => {
  console.log('Connection lost, auto-reconnecting...');
};`
				},
				{
					language: 'cli',
					code: `# Stream SSE events with curl
curl -N -H "Accept: text/event-stream" \\
  https://example.com/api/notifications

# With reconnection (Last-Event-ID header)
curl -N \\
  -H "Accept: text/event-stream" \\
  -H "Last-Event-ID: 42" \\
  https://example.com/api/notifications

# Watch raw SSE event stream
curl -sN https://example.com/api/notifications \\
  | while read line; do echo "$line"; done`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Connection',
							code: `GET /events HTTP/1.1\nHost: api.example.com\nAccept: text/event-stream\nCache-Control: no-cache\nConnection: keep-alive\n\nHTTP/1.1 200 OK\nContent-Type: text/event-stream\nCache-Control: no-cache\nConnection: keep-alive`
						},
						{
							title: 'Event Stream',
							code: `: heartbeat\n\nevent: user.login\nid: evt-001\ndata: {"user": "Alice", "time": "14:32:01"}\n\nevent: message\nid: evt-002\ndata: {"from": "Alice", "text": "Hello!"}\ndata: {"continued": true}\n\n: 30s keepalive\nretry: 5000\n\nevent: user.logout\nid: evt-003\ndata: {"user": "Alice", "time": "14:45:12"}`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Sub-second (persistent connection)',
			throughput: 'Lightweight text streaming',
			overhead: 'Minimal — plain HTTP, no upgrade'
		},
		connections: ['a2a', 'http1', 'http2', 'mcp', 'websockets', 'graphql', 'rest'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Server-sent_events',
			official: 'https://html.spec.whatwg.org/multipage/server-sent-events.html'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/600px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg',
			alt: 'Ian Hickson at a CSS Working Group meeting, the author of the Server-Sent Events specification',
			caption:
				'Ian Hickson at a W3C Working Group meeting. As editor of the HTML5 specification, Hickson authored the Server-Sent Events spec — giving browsers a native, lightweight way to receive real-time server pushes over plain HTTP.',
			credit: 'Photo: Molly Holzschlag / CC BY-SA 2.0, via Wikimedia Commons'
		}
	},
	{
		id: 'rest',
		name: 'Representational State Transfer',
		abbreviation: 'REST',
		categoryId: 'web-api',
		year: 2000,
		oneLiner:
			'An architectural style for web APIs — not a protocol, but the dominant pattern for HTTP services.',
		overview: `REST is not a protocol — it's an architectural style defined by Roy Fielding in his 2000 doctoral dissertation. It describes how to build scalable web services using the existing mechanics of [[http1|HTTP]]: URLs as resource identifiers, {{http-method|HTTP methods}} as operations, {{status-code|status codes}} as outcomes, and hypermedia as the engine of application state.

A RESTful API models everything as resources (nouns, not verbs). You GET a user, POST a new order, PUT an updated profile, DELETE a session. Each request is {{stateless|stateless}} — the server doesn't remember previous requests, so every call carries all the context it needs. This makes REST APIs easy to cache, scale horizontally, and reason about.

REST's ubiquity comes from its simplicity: any [[http1|HTTP]] client in any language can call a REST API. No special tooling, no code generation, no binary protocols. {{json|JSON}} became the de facto format, though REST itself is format-agnostic. The trade-off is that REST can be chatty — fetching a complex resource might require multiple round trips, which is exactly the problem [[graphql|GraphQL]] was designed to solve.`,
		howItWorks: [
			{
				title: 'Resource identification',
				description:
					'Every resource has a unique URL (e.g., /api/users/42). The URL structure creates a logical hierarchy that maps to your data model.'
			},
			{
				title: 'HTTP methods as verbs',
				description:
					'GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove). Each method has defined semantics — GET is safe and idempotent, DELETE is idempotent but not safe.'
			},
			{
				title: 'Stateless requests',
				description:
					'Each request contains all information needed to process it — authentication tokens, content type, requested format. The server maintains no session state between requests.'
			},
			{
				title: 'Response with status',
				description:
					'Server returns an HTTP status code (200 OK, 201 Created, 404 Not Found, etc.) along with the resource representation, typically as JSON.'
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
				'REST uses standard HTTP — any language with an HTTP client can interact with a REST API.',
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
		connections: ['a2a', 'http1', 'http2', 'http3', 'json-rpc', 'mcp', 'graphql', 'grpc', 'sse', 'websockets', 'soap', 'oauth2'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/REST',
			official: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Client-server_model.svg/600px-Client-server_model.svg.png',
			alt: 'Diagram of the client-server model showing multiple clients communicating with a central server over a network',
			caption:
				'The client-server model — the foundation of REST architecture. Clients send stateless HTTP requests to a server, which manages resources and returns representations. This separation of concerns is what makes REST APIs scalable and cacheable.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
		id: 'mcp',
		name: 'Model Context Protocol',
		abbreviation: 'MCP',
		categoryId: 'web-api',
		port: undefined,
		year: 2024,
		rfc: undefined,
		oneLiner:
			'A universal interface that lets AI applications discover and use tools, data, and prompts from any server.',
		overview: `MCP is the protocol that solved the AI integration problem. Before MCP, every AI application needed custom code for every data source — connecting Claude to your database was a different project than connecting it to GitHub, which was different again from connecting it to Slack. An N-clients × M-tools matrix of bespoke integrations. MCP collapses this to N + M: each AI host implements the MCP client once, each tool implements the MCP server once, and they all interoperate.

Anthropic released MCP in November 2024, and it was quickly adopted across the industry — Claude, ChatGPT, Copilot, Cursor, VS Code, and Replit all speak MCP. The protocol uses [[json-rpc|JSON-RPC]] 2.0 as its wire format, running over two transports: stdio (for local tools spawned as subprocesses) and Streamable HTTP (for remote servers, where responses can upgrade to [[sse|SSE]] streams). A three-step initialization handshake negotiates capabilities: the client declares what it supports ({{sampling|sampling}}, roots, elicitation), the server declares what it offers (tools, resources, prompts), and both sides confirm readiness.

The architecture has three roles: the **Host** (the AI application you interact with), the **Client** (a protocol handler inside the host that manages one session), and the **Server** (a lightweight process exposing tools, resources, and prompts). A single host can connect to many servers simultaneously. In December 2025, Anthropic donated MCP to the Agentic AI Foundation under the Linux Foundation, co-founded with Block and OpenAI. By early 2026, the protocol was processing over 97 million SDK downloads per month. [[a2a|A2A]] complements MCP — where MCP connects an agent to its tools, [[a2a|A2A]] connects agents to each other.`,
		howItWorks: [
			{
				title: 'Transport connection',
				description:
					'The host starts the MCP server — either spawning it as a local subprocess (stdio transport) or connecting to a remote HTTP endpoint (Streamable HTTP transport). No protocol messages flow yet.'
			},
			{
				title: 'Initialize handshake',
				description:
					'The client sends an "initialize" JSON-RPC request declaring its protocol version and capabilities (sampling, roots, elicitation). The server responds with its own version and capabilities (tools, resources, prompts). The client then sends a "notifications/initialized" notification to confirm readiness.'
			},
			{
				title: 'Discovery',
				description:
					'The client calls "tools/list" to discover available tools (with JSON Schema input definitions), "resources/list" to find data sources, and "prompts/list" to find prompt templates. The LLM uses these to decide what to invoke.'
			},
			{
				title: 'Tool invocation',
				description:
					'When the LLM decides to use a tool, the client sends "tools/call" with the tool name and arguments. The server executes the tool and returns results as text, images, or structured data. Resources are read with "resources/read."'
			},
			{
				title: 'Session lifecycle',
				description:
					'The session stays open for multiple interactions. The server can send notifications (progress updates, resource changes). Either side can close the transport — for stdio, the host terminates the subprocess; for HTTP, the connection is closed.'
			}
		],
		useCases: [
			'IDE coding assistants accessing file systems, git, and databases (Cursor, VS Code)',
			'AI chatbots querying enterprise knowledge bases and CRMs',
			'Automated workflows connecting LLMs to APIs (Slack, GitHub, Jira)',
			'Multi-tool AI orchestration with dynamic tool discovery',
			'Local development tools exposing capabilities to AI agents'
		],
		codeExample: {
			language: 'python',
			code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Demo Server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Return a personalized greeting."""
    return f"Hello, {name}!"

@mcp.prompt()
def review_code(code: str) -> str:
    """Generate a code review prompt."""
    return f"Please review this code:\\n{code}"

# Run with: mcp run server.py
# Or: mcp dev server.py (for inspector UI)`,
			caption:
				'Three lines of decorator code expose a tool, a resource, and a prompt — the MCP SDK handles all the JSON-RPC plumbing.',
			alternatives: [
				{
					language: 'javascript',
					code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "demo-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// Register a tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "add",
    description: "Add two numbers",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" }
      }
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => ({
  content: [{
    type: "text",
    text: String(req.params.arguments.a + req.params.arguments.b)
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`
				},
				{
					language: 'cli',
					code: `# Install the MCP CLI
pip install mcp

# Run an MCP server
mcp run server.py

# Open the MCP Inspector (interactive debugging UI)
mcp dev server.py

# Test with curl (Streamable HTTP transport)
curl -X POST http://localhost:3000/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Install an MCP server in Claude Desktop
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
# { "mcpServers": { "demo": { "command": "python", "args": ["server.py"] } } }`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Initialize Handshake',
							code: `── Client → Server ──\n{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{"sampling":{},"roots":{"listChanged":true}},"clientInfo":{"name":"claude-desktop","version":"1.0"}},"id":1}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true},"resources":{"subscribe":true},"prompts":{}},"serverInfo":{"name":"demo-server","version":"1.0.0"}},"id":1}\n\n── Client → Server (notification, no id) ──\n{"jsonrpc":"2.0","method":"notifications/initialized"}`
						},
						{
							title: 'Tool Discovery & Invocation',
							code: `── Client → Server ──\n{"jsonrpc":"2.0","method":"tools/list","id":2}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"tools":[{"name":"add","description":"Add two numbers","inputSchema":{"type":"object","properties":{"a":{"type":"number"},"b":{"type":"number"}}}}]},"id":2}\n\n── Client → Server ──\n{"jsonrpc":"2.0","method":"tools/call","params":{"name":"add","arguments":{"a":42,"b":23}},"id":3}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"65"}]},"id":3}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'stdio transport has near-zero overhead (IPC, no network). Streamable HTTP adds one HTTP round trip per call. Tool execution time dominates.',
			throughput:
				'JSON-RPC 2.0 framing is lightweight. Throughput depends on the tool implementation — a database query tool is limited by the database, not MCP.',
			overhead:
				'Minimal protocol overhead — a tools/call request is ~100 bytes of JSON. The initialize handshake adds one round trip at session start.'
		},
		connections: ['a2a', 'grpc', 'http1', 'json-rpc', 'rest', 'sse', 'websockets'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Model_Context_Protocol',
			official: 'https://modelcontextprotocol.io/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Model_Context_Protocol_Component_diagram.svg',
			alt: 'Model Context Protocol component diagram showing the Host, Client, and Server architecture with tool, resource, and prompt primitives',
			caption:
				'The MCP architecture — a Host (AI application) creates Clients that connect 1:1 to Servers. Each Server exposes tools, resources, and prompts through a standard JSON-RPC interface. Created by Anthropic in 2024 and donated to the Linux Foundation in 2025.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
		id: 'a2a',
		name: 'Agent-to-Agent Protocol',
		abbreviation: 'A2A',
		categoryId: 'web-api',
		port: undefined,
		year: 2025,
		rfc: undefined,
		oneLiner:
			'An open protocol that lets AI agents discover each other, delegate tasks, and collaborate — even across different frameworks and vendors.',
		overview: `A2A solves the problem that [[mcp|MCP]] doesn't: how do AI agents talk to *each other*? MCP connects an agent to its tools and data sources, but modern AI systems increasingly need multiple specialized agents working together — a travel agent delegating to flight, hotel, and car rental agents; an HR agent coordinating with payroll, benefits, and IT provisioning agents. A2A provides the standard protocol for this multi-agent collaboration.

Google announced A2A in April 2025 at Cloud Next, backed by over 100 technology partners including Atlassian, Microsoft, Salesforce, SAP, and LangChain. The protocol uses [[json-rpc|JSON-RPC]] 2.0 over [[http1|HTTP]], with [[sse|SSE]] for streaming and webhooks for push notifications. A key design principle is {{opacity|opacity}}: agents are treated as black boxes. You don't see their internal reasoning, tool usage, or prompt chains — you see their **skills** (what they can do) and their **artifacts** (what they produce). This is fundamentally different from MCP, where the server's tools and resources are fully transparent.

Discovery happens through **Agent Cards** — JSON metadata documents served at \`/.well-known/agent.json\` that describe an agent's identity, capabilities, skills, and authentication requirements. The fundamental unit of work is a **Task**, which progresses through a defined lifecycle: submitted → working → completed (or failed, canceled, or input-required when the agent needs more information). In June 2025, A2A moved to the Linux Foundation, and version 1.0 shipped in early 2026. Together with [[mcp|MCP]], A2A forms the two-protocol foundation of the agentic AI era — MCP for tool use, A2A for agent collaboration.`,
		howItWorks: [
			{
				title: 'Agent discovery',
				description:
					'A client agent fetches the remote agent\'s Agent Card from /.well-known/agent.json. The card describes the agent\'s name, skills, supported capabilities (streaming, push notifications), and authentication requirements (API key, OAuth 2.0, OpenID Connect).'
			},
			{
				title: 'Send a message',
				description:
					'The client sends a JSON-RPC request to the remote agent\'s endpoint using "message/send" (synchronous) or "message/stream" (streaming via SSE). The message contains Parts — TextPart, FilePart, or DataPart — describing what the client needs.'
			},
			{
				title: 'Task lifecycle',
				description:
					'The remote agent creates a Task and begins processing. The task progresses through states: submitted → working → completed. If the agent needs more information, it returns "input-required" and the client sends additional messages to the same task.'
			},
			{
				title: 'Artifacts returned',
				description:
					'As the agent works, it produces Artifacts — structured outputs composed of Parts (text, files, data). Artifacts can be streamed incrementally via SSE or returned all at once in the final response.'
			},
			{
				title: 'Async & push',
				description:
					'For long-running tasks, the agent can send push notifications to a client-provided webhook URL, allowing the client to disconnect and receive updates later. Tasks can also be canceled or queried for status.'
			}
		],
		useCases: [
			'Multi-agent travel booking (coordinator delegates to flight, hotel, car agents)',
			'Enterprise workflow orchestration across departments (HR, IT, payroll)',
			'Customer service routing to specialized agents (billing, technical, returns)',
			'Cross-vendor AI collaboration (agents from different companies working together)',
			'Supply chain negotiation between procurement and supplier agents'
		],
		codeExample: {
			language: 'python',
			code: `from a2a.server.agent_execution import AgentExecutor
from a2a.server.events import EventQueue
from a2a.types import AgentCard, AgentSkill

class TravelAgent(AgentExecutor):
    async def execute(self, context, event_queue: EventQueue):
        # Process the user's request
        request = context.get_user_message()
        flights = await self.search_flights(request)

        # Return results as an artifact
        event_queue.enqueue_event(
            new_artifact_event(parts=[
                TextPart(text=f"Found {len(flights)} flights"),
                DataPart(data={"flights": flights})
            ])
        )

# Define the Agent Card
card = AgentCard(
    name="Travel Agent",
    url="http://localhost:9000",
    version="1.0.0",
    skills=[
        AgentSkill(id="flights", name="Flight Search",
                   description="Search and book flights")
    ],
    capabilities={"streaming": True}
)`,
			caption:
				'An A2A agent publishes its skills in an Agent Card and handles tasks via an executor — the SDK manages JSON-RPC, streaming, and task lifecycle.',
			alternatives: [
				{
					language: 'javascript',
					code: `// A2A Client — discover and call a remote agent
const cardRes = await fetch(
  'http://travel-agent:9000/.well-known/agent.json'
);
const agentCard = await cardRes.json();
console.log('Skills:', agentCard.skills);

// Send a task to the agent
const response = await fetch(agentCard.url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'message/send',
    params: {
      message: {
        role: 'user',
        messageId: 'msg-001',
        parts: [{
          kind: 'text',
          text: 'Find flights from NYC to London next week'
        }]
      }
    },
    id: 1
  })
});

const { result: task } = await response.json();
console.log('Task status:', task.status.state);
console.log('Artifacts:', task.artifacts);`
				},
				{
					language: 'cli',
					code: `# Discover an agent's capabilities
curl -s http://localhost:9000/.well-known/agent.json | jq

# Send a task to an agent
curl -X POST http://localhost:9000 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "messageId": "msg-001",
        "parts": [{"kind": "text", "text": "Find flights NYC to London"}]
      }
    },
    "id": 1
  }'

# Stream results via SSE
curl -N -X POST http://localhost:9000 \\
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '{"jsonrpc":"2.0","method":"message/stream","params":{...},"id":2}'`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Agent Card (/.well-known/agent.json)',
							code: `{\n  "name": "Travel Agent",\n  "description": "Books flights, hotels, and car rentals",\n  "url": "https://travel.example.com/a2a",\n  "version": "1.0.0",\n  "protocolVersion": "1.0",\n  "capabilities": {\n    "streaming": true,\n    "pushNotifications": true\n  },\n  "skills": [\n    {\n      "id": "flights",\n      "name": "Flight Search",\n      "description": "Search and book flights worldwide"\n    }\n  ],\n  "securitySchemes": [\n    { "type": "oauth2", "authorizationUrl": "https://travel.example.com/oauth/authorize" }\n  ]\n}`
						},
						{
							title: 'Task Lifecycle (message/send)',
							code: `── Client → Agent ──\n{"jsonrpc":"2.0","method":"message/send","params":{"message":{"role":"user","messageId":"msg-001","parts":[{"kind":"text","text":"Find flights NYC to London"}]}},"id":1}\n\n── Agent → Client (task in progress) ──\n{"jsonrpc":"2.0","result":{"id":"task-42","status":{"state":"working","message":"Searching 3 airlines..."},"artifacts":[]},"id":1}\n\n── Agent → Client (task completed) ──\n{"jsonrpc":"2.0","result":{"id":"task-42","status":{"state":"completed"},"artifacts":[{"artifactId":"art-001","name":"flight_options","parts":[{"kind":"text","text":"Found 3 flights"},{"kind":"data","data":{"flights":[{"airline":"BA","price":450},{"airline":"AA","price":520}]}}]}]},"id":1}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'HTTP round-trip latency per message. Tasks are designed for longer-lived interactions (seconds to hours). SSE streaming provides real-time progress without polling.',
			throughput:
				'JSON-RPC over HTTP — similar to REST API throughput. gRPC transport option (v0.3+) available for high-volume scenarios.',
			overhead:
				'Agent Card discovery adds one HTTP request at startup. Task lifecycle management adds minimal state overhead per task.'
		},
		connections: ['grpc', 'http1', 'json-rpc', 'mcp', 'rest', 'sse', 'websockets'],
		links: {
			official: 'https://a2a-protocol.org/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/IntelligentAgent-Learning.svg',
			alt: 'Diagram of an intelligent agent interacting with its environment — perceiving through sensors, acting through actuators, with an internal learning and decision-making loop',
			caption:
				'The intelligent agent model from Russell & Norvig — an agent perceives its environment, reasons about it, and takes actions. A2A standardizes how these agents discover each other, delegate tasks, and exchange results across organizational boundaries.',
			credit: 'Image: Wikimedia Commons / Public Domain, based on Russell & Norvig'
		}
	},
	{
		id: 'json-rpc',
		name: 'JSON Remote Procedure Call',
		abbreviation: 'JSON-RPC',
		categoryId: 'web-api',
		port: undefined,
		year: 2005,
		rfc: undefined, // Community spec at jsonrpc.org
		oneLiner:
			'A minimal RPC protocol encoded in JSON — call a method by name, get a result back. Nothing more.',
		overview: `JSON-RPC is the protocol that proves less is more. The entire specification fits on a single page: send a {{json|JSON}} object with a method name, parameters, and an ID — get back a JSON object with the result and the same ID. That's it. No URL routing, no HTTP verb semantics, no schema compilation step. Just structured function calls over the wire.

Created in 2005 as a lightweight alternative to {{xml|XML}}-based [[soap|SOAP]], JSON-RPC stayed deliberately simple while the web API world exploded with complexity. Version 2.0 (2010) refined the format: it added a mandatory \`"jsonrpc": "2.0"\` field, standardized error codes (borrowed from XML-RPC's tradition), introduced {{notification|notifications}} (requests without an \`id\` that expect no response), and added batch requests (send an array of calls, get an array of results). The spec is transport-agnostic — JSON-RPC works over [[http1|HTTP]], [[websockets|WebSockets]], raw [[tcp|TCP]], or even stdio pipes between processes.

JSON-RPC found its biggest audience not in traditional web development but in infrastructure and AI. Ethereum's entire blockchain API is JSON-RPC. Bitcoin Core speaks JSON-RPC. Microsoft's Language Server Protocol (LSP) — which powers code intelligence in VS Code, Neovim, and virtually every modern editor — uses JSON-RPC 2.0 over stdio. And most recently, both Anthropic's Model Context Protocol ([[mcp|MCP]]) and Google's Agent-to-Agent Protocol ([[a2a|A2A]]) chose JSON-RPC 2.0 as their wire format, making it the de facto standard for AI agent communication.`,
		howItWorks: [
			{
				title: 'Client builds a request',
				description:
					'The client constructs a JSON object with four fields: "jsonrpc" (always "2.0"), "method" (the function name), "params" (arguments as an array or object), and "id" (a unique identifier to match the response).'
			},
			{
				title: 'Request is sent',
				description:
					'The JSON is sent over any transport — HTTP POST to a single endpoint, a WebSocket message, a line written to stdout, or a TCP socket. The protocol does not care how bytes move.'
			},
			{
				title: 'Server dispatches',
				description:
					'The server parses the JSON, looks up the method name in its handler registry, validates the parameters, and calls the handler function. If the method name starts with "rpc.", it is reserved for system extensions.'
			},
			{
				title: 'Response returned',
				description:
					'The server responds with a JSON object containing "jsonrpc", the same "id", and either a "result" (success) or "error" (failure with code, message, and optional data). Never both.'
			},
			{
				title: 'Notifications & batches',
				description:
					'If the request omits the "id" field, it is a notification — fire-and-forget, no response expected. Multiple requests can be batched in a JSON array, and the server returns an array of responses (skipping notifications).'
			}
		],
		useCases: [
			'Blockchain node APIs (Ethereum, Bitcoin, Solana, Polkadot)',
			'Language Server Protocol (LSP) for code editors',
			'AI agent protocols (MCP, A2A)',
			'Microservice internal RPC',
			'Lightweight API servers where REST feels heavy'
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
			wikipedia: 'https://en.wikipedia.org/wiki/JSON-RPC',
			official: 'https://www.jsonrpc.org/specification'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/1/18/RPC_overview.png',
			alt: 'Diagram showing how Remote Procedure Calls work — a client calls a stub which marshals parameters and sends them over the network to a server stub that executes the procedure',
			caption:
				'The RPC model that JSON-RPC inherits — a client calls a function by name, the parameters are serialized and sent over the network, and the server executes the method and returns the result. JSON-RPC strips this to pure JSON: no IDL, no code generation, no binary encoding.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'soap',
		name: 'SOAP',
		abbreviation: 'SOAP',
		categoryId: 'web-api',
		port: 80,
		year: 1998,
		rfc: undefined, // W3C standard, not RFC
		oneLiner:
			'XML-based messaging for enterprise web services — structured envelopes, strict schemas, and built-in error handling.',
		overview: `SOAP is a messaging protocol that wraps remote procedure calls in structured {{xml|XML}} envelopes. Originally "Simple Object Access Protocol," the W3C dropped the acronym expansion in SOAP 1.2 (2003) — it's now just "SOAP." Developed by Dave Winer, Don Box, and others at Microsoft in 1998, it became the backbone of enterprise web services throughout the 2000s. Services describe themselves using WSDL (Web Services Description Language) — a machine-readable XML contract that defines available operations, message formats, and endpoint URLs. Where [[rest|REST]] embraces simplicity and convention, SOAP enforces formality and precision.

Every SOAP message is an XML Envelope containing an optional {{header|Header}} and a required Body. The Header carries metadata — authentication tokens, routing information, transaction IDs, WS-Addressing headers — while the Body contains the actual operation and its parameters. SOAP messages travel over [[http1|HTTP]] POST (most commonly), though the {{protocol|protocol}} is transport-agnostic and can also run over SMTP, JMS, or raw [[tcp|TCP]]. In SOAP 1.1, the Content-Type is \`text/xml\` and a separate \`SOAPAction\` HTTP header identifies the intended operation. SOAP 1.2 changed this: it uses \`application/soap+xml\` and embeds the action in the Content-Type parameter instead.

SOAP remains deeply embedded in banking, healthcare, government, and insurance systems where its strengths matter most: WSDL provides formal contracts that both sides can validate at compile time, WS-Security handles {{encryption|encryption}} and signing at the message level (beyond what [[tls|TLS]] offers), WS-ReliableMessaging guarantees delivery, and WS-AtomicTransaction coordinates distributed commits. For new projects, [[rest|REST]], [[grpc|gRPC]], and [[graphql|GraphQL]] have largely replaced SOAP — but the protocol still processes trillions of dollars in financial transactions every year.`,
		howItWorks: [
			{
				title: 'WSDL discovery',
				description:
					'Client fetches the WSDL document from the service endpoint (typically at ?wsdl). The WSDL describes all available operations, their input/output message schemas, data types, and the endpoint URL — everything needed to generate client code.'
			},
			{
				title: 'Envelope construction',
				description:
					'Client builds an XML SOAP Envelope containing an optional Header (authentication, routing, transaction context) and a Body with the operation name and parameters. The SOAPAction HTTP header is set to identify the target operation.'
			},
			{
				title: 'HTTP POST',
				description:
					'The complete XML envelope is sent as an HTTP POST request with Content-Type: text/xml (SOAP 1.1) or application/soap+xml (SOAP 1.2). Unlike REST, SOAP always uses POST regardless of whether the operation reads or writes data.'
			},
			{
				title: 'Response or Fault',
				description:
					'Server processes the request and returns a SOAP response envelope containing the result in the Body. If an error occurs, the server returns a SOAP Fault element with a fault code, fault string, and optional detail — the SOAP equivalent of HTTP error status codes.'
			}
		],
		useCases: [
			'Enterprise financial systems and banking APIs (SWIFT, payment gateways)',
			'Healthcare data exchange (HL7, insurance claims processing)',
			'Government and regulatory reporting systems',
			'Legacy enterprise application integration (ERP, CRM)',
			'Web services requiring formal contracts and strict schema validation'
		],
		codeExample: {
			language: 'python',
			code: `from zeep import Client

# WSDL auto-generates Python methods
client = Client('https://example.com/service?wsdl')

# Call a SOAP operation like a normal function
result = client.service.GetUser(userId=42)
print(result.name)    # "Alice Chen"
print(result.email)   # "alice@example.com"

# SOAP fault handling
try:
    client.service.DeleteUser(userId=9999)
except Exception as e:
    print(f"SOAP Fault: {e}")`,
			caption:
				'SOAP with zeep — the library reads the WSDL and generates typed Python methods automatically.',
			alternatives: [
				{
					language: 'javascript',
					code: `import soap from 'soap';

// Create client from WSDL
const client = await soap.createClientAsync(
  'https://example.com/service?wsdl'
);

// Call a SOAP operation
const [result] = await client.GetUserAsync({
  userId: 42
});
console.log(result.name);   // "Alice Chen"
console.log(result.email);  // "alice@example.com"

// List all available operations
console.log(Object.keys(client.describe()));`
				},
				{
					language: 'cli',
					code: `# Send a SOAP request with curl
curl -X POST https://example.com/service \\
  -H "Content-Type: text/xml" \\
  -H "SOAPAction: GetUser" \\
  -d '<?xml version="1.0"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:srv="http://example.com/service">
  <soap:Body>
    <srv:GetUser>
      <srv:userId>42</srv:userId>
    </srv:GetUser>
  </soap:Body>
</soap:Envelope>'

# Fetch the WSDL to see available operations
curl https://example.com/service?wsdl`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'SOAP Request Envelope',
							code: `POST /service HTTP/1.1\nHost: example.com\nContent-Type: text/xml; charset=utf-8\nSOAPAction: "http://example.com/service/GetUser"\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\n  xmlns:srv="http://example.com/service">\n  <soap:Header>\n    <srv:AuthToken>Bearer eyJhbGc...</srv:AuthToken>\n  </soap:Header>\n  <soap:Body>\n    <srv:GetUser>\n      <srv:userId>42</srv:userId>\n    </srv:GetUser>\n  </soap:Body>\n</soap:Envelope>`
						},
						{
							title: 'SOAP Response Envelope',
							code: `HTTP/1.1 200 OK\nContent-Type: text/xml; charset=utf-8\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <GetUserResponse>\n      <user>\n        <id>42</id>\n        <name>Alice Chen</name>\n        <email>alice@example.com</email>\n        <role>admin</role>\n      </user>\n    </GetUserResponse>\n  </soap:Body>\n</soap:Envelope>`
						},
						{
							title: 'SOAP Fault',
							code: `HTTP/1.1 500 Internal Server Error\nContent-Type: text/xml; charset=utf-8\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <soap:Fault>\n      <faultcode>soap:Client</faultcode>\n      <faultstring>User not found</faultstring>\n      <detail>\n        <errorCode>USR_404</errorCode>\n        <message>No user with ID 9999</message>\n      </detail>\n    </soap:Fault>\n  </soap:Body>\n</soap:Envelope>`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Same as HTTP — one request-response round trip. XML parsing adds 1-5ms overhead compared to JSON.',
			throughput:
				'XML payloads are 2-10x larger than equivalent JSON, reducing effective throughput.',
			overhead:
				'Heavy — XML envelopes, namespace declarations, and schema validation. A simple "hello" operation may produce 500+ bytes of XML.'
		},
		connections: ['http1', 'json-rpc', 'tcp', 'tls', 'rest', 'grpc', 'graphql'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/SOAP',
			official: 'https://www.w3.org/TR/soap12/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/IBM_System_360_at_USDA.jpg/600px-IBM_System_360_at_USDA.jpg',
			alt: 'IBM System/360 mainframe at the USDA Data Processing Center in 1966',
			caption:
				'The IBM System/360 at the USDA (1966). Mainframes like these laid the groundwork for enterprise computing — the world that SOAP was built to serve, wrapping remote procedure calls in XML for cross-platform interoperability.',
			credit: 'Photo: U.S. Department of Agriculture / Public Domain, via Wikimedia Commons'
		}
	}
];
