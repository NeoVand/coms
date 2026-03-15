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

To work around this, browsers open 6-8 parallel [[tcp|TCP]] connections per domain. This works but is wasteful. [[http2|HTTP/2]] and [[http3|HTTP/3]] solve this properly with {{multiplexing|multiplexing}}. Despite being "old," HTTP/1.1 is still the most widely understood protocol in web development and the foundation for [[rest|REST]] APIs.`,
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
			throughput: 'Limited by serial requests; browsers use 6-8 parallel connections as workaround',
			overhead:
				'Text headers are uncompressed and often repeated — 500-800 bytes typical per request'
		},
		connections: ['tcp', 'tls', 'http2', 'websockets', 'rest', 'soap', 'oauth2'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9112'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/NCSA_Mosaic_Browser_Screenshot.png/600px-NCSA_Mosaic_Browser_Screenshot.png',
			alt: 'Screenshot of NCSA Mosaic web browser from 1993, one of the first graphical web browsers',
			caption:
				'NCSA Mosaic (1993) — the browser that brought HTTP to the masses. Before Mosaic, the web was text-only. Its ability to display images inline alongside text sparked the web revolution.',
			credit: 'Image: NCSA / Public Domain, via Wikimedia Commons'
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
		overview: `HTTP/2 was designed to fix [[http1|HTTP/1.1]]'s biggest pain points without changing the semantics developers know and love. You still use GET, POST, headers, and {{status-code|status codes}} — but under the hood, everything is different. The protocol is binary (not text), {{multiplexing|multiplexed}} (many requests share one connection), and supports {{header|header}} compression (HPACK) and server push.

Multiplexing is the killer feature: instead of waiting for each response before sending the next request, HTTP/2 interleaves multiple request-response pairs as "{{stream|streams}}" on a single [[tcp|TCP]] connection. This eliminates the need for multiple connections and dramatically improves page load times for resource-heavy sites.

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
			overhead: 'HPACK compresses headers by 85-88% compared to HTTP/1.1'
		},
		connections: ['http1', 'http3', 'tcp', 'tls', 'grpc', 'sse'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/HTTP/2',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9113'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Wikimedia_Foundation_Servers-8055_35.jpg/600px-Wikimedia_Foundation_Servers-8055_35.jpg',
			alt: 'Wikimedia Foundation server racks in a data center, representing modern web infrastructure',
			caption:
				'Modern web servers like these at the Wikimedia Foundation serve billions of requests over HTTP/2. Its binary framing and multiplexing made the single-connection model practical at massive scale.',
			credit: 'Photo: Wikimedia Foundation / CC BY-SA 3.0, via Wikimedia Commons'
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
		codeExample: {
			language: 'python',
			code: `import httpx

# httpx can use HTTP/3 with the h3 transport
async def fetch_h3():
    async with httpx.AsyncClient(http2=True) as client:
        # Server advertises HTTP/3 via Alt-Svc header
        response = await client.get("https://cloudflare-quic.com")
        print(f"Protocol: {response.http_version}")
        print(f"Status: {response.status_code}")
        print(f"Alt-Svc: {response.headers.get('alt-svc')}")

import asyncio
asyncio.run(fetch_h3())`,
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
					language: 'cli',
					code: `# curl supports HTTP/3 with the --http3 flag
curl --http3 https://cloudflare-quic.com -v

# Check if a server supports HTTP/3
curl -sI https://cloudflare-quic.com \\
  | grep -i alt-svc
# alt-svc: h3=":443"; ma=86400

# Force HTTP/3 only (fail if not supported)
curl --http3-only https://cloudflare-quic.com`
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
		overview: `WebSockets solve a fundamental limitation of [[http1|HTTP]]: the server can't initiate communication. In [[http1|HTTP]], the client always asks and the server always responds. WebSockets upgrade an [[http1|HTTP]] connection into a persistent, full-duplex channel where either side can send messages at any time.

This is perfect for real-time applications: chat, live sports scores, collaborative editing, multiplayer games, financial tickers. Instead of the client repeatedly polling "any updates?" (wasteful), the server simply pushes data when it's available.

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
websocat wss://echo.websocket.org

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
		connections: ['http1', 'http2', 'tcp', 'tls', 'sse', 'graphql', 'rest'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/WebSocket',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc6455'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Jersey_Telecom_switchboard_and_operator.jpg/600px-Jersey_Telecom_switchboard_and_operator.jpg',
			alt: 'A telephone operator at a Jersey Telecom switchboard in 1975, managing multiple persistent connections simultaneously',
			caption:
				'A telephone switchboard operator managing live, persistent connections (1975). WebSockets brought this same paradigm to the browser — upgrading HTTP\'s request-response model into full-duplex, always-on communication channels.',
			credit: 'Photo: Joseph A. Carr / Attribution, via Wikimedia Commons'
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
		overview: `gRPC is Google's open-source framework for remote procedure calls. Instead of designing [[rest|REST]] endpoints and manually serializing JSON, you define your service and messages in Protocol Buffers (.proto files), and gRPC generates strongly-typed client and server code in 12+ languages.

It uses [[http2|HTTP/2]] for transport, gaining {{multiplexing|multiplexing}} and {{header|header}} compression for free. Messages are serialized as Protocol Buffers — a binary format that's 3-10x smaller and 20-100x faster to parse than JSON. gRPC also natively supports {{stream|streaming}}: server-streaming, client-streaming, and bidirectional streaming.

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
			throughput: 'Protobuf is 3-10x smaller than JSON; 20-100x faster to serialize/deserialize',
			overhead: 'HTTP/2 framing + protobuf encoding. Very efficient for structured data.'
		},
		connections: ['http2', 'tls', 'rest', 'soap'],
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

GraphQL operates over [[http1|HTTP]] (typically a single /graphql endpoint accepting both {{http-method|GET and POST}} requests). The query language lets you traverse relationships, request nested data, and combine what would be multiple [[rest|REST]] requests into a single query. It also has a strong type system — the schema defines every type, field, and relationship.

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
		connections: ['http1', 'http2', 'websockets', 'rest', 'sse', 'soap'],
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

SSE uses plain [[http1|HTTP]], which means it works through proxies, load balancers, and {{firewall|firewalls}} without any special configuration. The browser's EventSource API automatically handles reconnection, event IDs for resuming after disconnects, and {{content-negotiation|content type negotiation}}.

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
		connections: ['http1', 'http2', 'websockets', 'graphql', 'rest'],
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

REST's ubiquity comes from its simplicity: any [[http1|HTTP]] client in any language can call a REST API. No special tooling, no code generation, no binary protocols. JSON became the de facto format, though REST itself is format-agnostic. The trade-off is that REST can be chatty — fetching a complex resource might require multiple round trips, which is exactly the problem [[graphql|GraphQL]] was designed to solve.`,
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
		connections: ['http1', 'http2', 'http3', 'graphql', 'grpc', 'sse', 'websockets', 'soap', 'oauth2'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/REST',
			official: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Roy_Fielding_%28cropped%29.jpg/600px-Roy_Fielding_%28cropped%29.jpg',
			alt: 'Roy Fielding, the computer scientist who defined REST in his doctoral dissertation',
			caption:
				'Roy Fielding defined REST in his 2000 doctoral dissertation at UC Irvine. His architectural style — resources, stateless requests, standard HTTP methods — became the dominant pattern for web APIs worldwide.',
			credit: 'Photo: Darin Briskman / CC BY 2.0, via Wikimedia Commons'
		}
	},
	{
		id: 'soap',
		name: 'Simple Object Access Protocol',
		abbreviation: 'SOAP',
		categoryId: 'web-api',
		port: 80,
		year: 1998,
		rfc: undefined, // W3C standard, not RFC
		oneLiner:
			'XML-based messaging for enterprise web services — structured envelopes, strict schemas, and built-in error handling.',
		overview: `SOAP is a messaging protocol that wraps remote procedure calls in structured XML envelopes. Developed by Dave Winer, Don Box, and others at Microsoft in 1998, it became the backbone of enterprise web services throughout the 2000s. Services describe themselves using WSDL (Web Services Description Language) — a machine-readable XML contract that defines available operations, message formats, and endpoint URLs. Where [[rest|REST]] embraces simplicity and convention, SOAP enforces formality and precision.

Every SOAP message is an XML Envelope containing an optional {{header|Header}} and a required Body. The Header carries metadata — authentication tokens, routing information, transaction IDs, WS-Addressing headers — while the Body contains the actual operation and its parameters. SOAP messages travel over [[http1|HTTP]] POST (most commonly), though the {{protocol|protocol}} is transport-agnostic and can also run over SMTP, JMS, or raw [[tcp|TCP]]. The Content-Type is \`text/xml\` and a \`SOAPAction\` HTTP header identifies the intended operation.

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
					'The complete XML envelope is sent as an HTTP POST request with Content-Type: text/xml. Unlike REST, SOAP always uses POST regardless of whether the operation reads or writes data.'
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
		connections: ['http1', 'tcp', 'tls', 'rest', 'grpc', 'graphql'],
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
