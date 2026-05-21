import type { Protocol } from '../types';

export const websockets: Protocol = {
	id: 'websockets',
	name: 'WebSocket Protocol',
	abbreviation: 'WS',
	categoryId: 'web-api',
	port: 80,
	year: 2011,
	rfc: 'RFC 6455',
	oneLiner: '{{full-duplex|Full-duplex}}, persistent connection — server and client talk freely in real time.',
	overview: `[[websockets|WebSockets]] solve a fundamental limitation of [[http1|HTTP]]: the server can't initiate communication. In [[http1|HTTP]], the client always asks and the server always responds. [[websockets|WebSockets]] upgrade an [[http1|HTTP]] connection into a persistent, {{full-duplex|full-duplex}} channel where either side can send messages at any time.

This is perfect for real-time applications: chat, live sports scores, collaborative editing, multiplayer games, financial tickers. Instead of the client repeatedly polling "any updates?" (wasteful), the server simply pushes data when it's available. Unlike [[http1|HTTP]]'s {{request-response|request-response}} model, [[websockets|WebSockets]] maintain a {{stateful|stateful}} connection where both sides can track context across messages without re-establishing identity on every {{exchange|exchange}}.

The connection starts as a normal [[http1|HTTP]] request with an "Upgrade: websocket" {{header|header}}. If the server agrees, the connection switches protocols. From that point on, both sides {{exchange|exchange}} lightweight binary or text {{frame|frames}} with just 2-14 bytes of overhead per message (vs hundreds of bytes for [[http1|HTTP]] headers).`,
	howItWorks: [
		{
			title: 'HTTP upgrade request',
			description:
				'Client sends a standard {{http-method|HTTP}} request with "Upgrade: websocket" and a random key. This reuses existing {{http-method|HTTP}} infrastructure (ports, proxies, cookies).'
		},
		{
			title: 'Server accepts upgrade',
			description:
				'Server responds with "101 Switching Protocols" and a computed accept key. The connection is now a [[websockets|WebSocket]] — {{http-method|HTTP}} is done.'
		},
		{
			title: 'Bidirectional messaging',
			description:
				'Both sides freely send messages as frames — text or binary. No request/response pattern. No headers per message. Incredibly lightweight.'
		},
		{
			title: 'Ping/pong keepalive',
			description:
				'Either side can send {{ping|ping}} frames; the other must respond with pong. This keeps the connection alive through firewalls and proxies.'
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
		caption: '[[websockets|WebSocket]] {{api|API}} is dead simple — {{mqtt-connect|connect}}, send, receive. Both sides can initiate.',
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
		wikipedia: 'https://en.wikipedia.org/wiki/[[websockets|WebSocket]]',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc6455'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Websocket_connection.png/500px-Websocket_connection.png',
		alt: 'Diagram showing the WebSocket connection lifecycle: HTTP upgrade handshake followed by full-duplex bidirectional communication',
		caption:
			'The [[websockets|WebSocket]] connection lifecycle — it starts as a normal {{http-method|HTTP}} request with an Upgrade header, then switches to a persistent, {{full-duplex|full-duplex}} channel where both client and server can send messages at any time without the overhead of {{http-method|HTTP}} headers.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
