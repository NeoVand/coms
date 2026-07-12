import type { SubcategoryStory } from './types';

export const realtimeWebStory: SubcategoryStory = {
	subcategoryId: 'realtime-web',
	tagline:
		'Breaking out of request/response — server push and full-duplex on a protocol that was never meant for either',
	sections: [
		{
			type: 'narrative',
			title: 'The Web Was Not Built for This',
			text: `[[http1|HTTP]] is a strict request/response protocol. Client speaks, server replies, connection idles or closes. For loading documents, this is fine. For a chat app, a stock ticker, or a multiplayer game, this is hostile.\n\nFor a decade, web developers fought the model. The first hack was **polling** — ask the server "anything new?" every few seconds. It worked, badly: latency was the polling interval, and most requests returned "no." Then came **long-polling** — open a request, leave it open until the server has something to say, then close and immediately reopen. Better latency, terrible server resource usage. This style got a name in 2006, coined by Alex Russell: **{{comet|Comet}}**.\n\nBy 2008 it was clear the workarounds had to end. Two protocols emerged, with complementary philosophies:\n\n- **[[sse|SSE]]** (Server-Sent Events, 2009) embraces HTTP. A simple text format over a long-lived response stream: \`data: hello\\n\\n\` lines, server-to-client only. Browsers reconnect automatically. Works through HTTP/2 multiplexing.\n- **[[websockets|WebSockets]]** (2011) breaks HTTP. After an [[http1|HTTP]] handshake the connection is *upgraded* to a binary framing protocol, full-duplex, both sides can send any time. The framing is custom (not HTTP).\n\nBoth shipped in browsers. Both are still everywhere. SSE for newsfeeds, LLM streaming, server-driven UI updates. WebSockets for chat, collaborative editing, games, anything where the client also pushes constantly. They didn't kill each other; they kept the parts of HTTP they each needed.`
		},
		{
			type: 'pioneers',
			title: 'The Realtime Architects',
			people: [
				{
					id: 'ian-hickson',
					name: 'Ian Hickson',
					years: '–',
					title: 'WHATWG Editor / WebSockets Co-Author',
					org: 'Google / WHATWG',
					contribution:
						"Edited the HTML5 specification at WHATWG for over a decade, including the [[websockets|WebSocket]] protocol and API. The WebSocket framing (binary frames, masking, opcode bytes) is largely Hickson's design. He also wrote the original [[sse|EventSource]] (SSE) API, which is the smaller, simpler cousin in the same HTML5 era."
				},
				{
					name: 'Alex Russell',
					years: '–',
					title: 'Coined "Comet"',
					org: 'Lightstreamer / Independent',
					contribution:
						'Coined {{comet|"Comet"}} in 2006 as the umbrella term for long-polling and streaming techniques people were using to fake server push over plain HTTP (Michael Carter was an early popularizer of the pattern). The name stuck through the late-2000s era and is the reason "the Comet pattern" is still recognizable shorthand for HTTP-push hacks.'
				},
				{
					name: 'Einar Otto Stangvik',
					years: '–',
					title: 'WebSocket Implementer / Node.js Core',
					org: 'StrongLoop / npm',
					contribution:
						'Authored the `ws` library — the dominant Node.js [[websockets|WebSocket]] implementation — which made server-side WebSocket trivially deployable from JavaScript. Node + ws + Socket.IO turned "real-time web" from a Tomcat/Comet engineering project into a weekend hack. The ergonomics shift mattered as much as the protocol.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2000,
					title: 'XMLHttpRequest Ships',
					description:
						'Microsoft ships XMLHttpRequest in IE5 (1999); other browsers follow. The first real way to do background HTTP from JavaScript. The first practical polling implementations follow within a year.'
				},
				{
					year: 2004,
					title: 'Gmail Launches with AJAX',
					description:
						'Gmail makes AJAX mainstream. The pattern: poll for new mail every few minutes. Latency is fine for mail; users tolerate it. Realtime apps are still hard.'
				},
				{
					year: 2006,
					title: 'Comet Named',
					description:
						'Alex Russell coins "Comet" for the family of HTTP-push hacks. Implementations include Bayeux protocol (Dojo/CometD), Lightstreamer, BOSH (XMPP-over-HTTP).'
				},
				{
					year: 2009,
					title: 'SSE Standardized (W3C HTML5)',
					description:
						'[[sse|Server-Sent Events]] ships with an EventSource API. Reconnection, Last-Event-ID, named event types. Server-to-client only — which is the entire point.'
				},
				{
					year: 2011,
					title: 'WebSocket RFC 6455',
					description:
						"After a tortuous 4-year design — including reverting an earlier 'hybi' protocol that broke certain proxies — [[websockets|WebSocket]] becomes RFC 6455. Binary framing, masking from client (to defeat proxy cache poisoning), full-duplex over a TCP connection."
				},
				{
					year: 2014,
					title: 'Socket.IO 1.0',
					description:
						"Socket.IO's auto-fallback (WebSocket → long-polling → polling) becomes the standard real-time stack for Node.js apps. Reduces the realtime barrier to a few lines."
				},
				{
					year: 2015,
					title: 'WebSocket Adoption Mainstreams',
					description:
						'Slack, Discord, Trello, Figma, Google Docs all run on WebSockets. Production scaling lessons — sticky load balancing, server-side connection pooling, presence systems — become widely documented.'
				},
				{
					year: 2022,
					title: 'SSE Returns for LLMs',
					description:
						'OpenAI ships streaming completions over [[sse|SSE]] for ChatGPT-like UX. The token-by-token effect requires server-push but not client-push — SSE is the natural fit. Anthropic, Google, Mistral all follow the same pattern.'
				},
				{
					year: 2018,
					title: 'WebSocket over HTTP/2 (RFC 8441)',
					description:
						"RFC 8441 maps the WebSocket handshake over HTTP/2's CONNECT method, so WebSockets stop needing their own TCP connection. Browser adoption stays partial — Chrome shipped it, Firefox followed."
				},
				{
					year: 2023,
					title: 'WebTransport in Chrome',
					description:
						'WebTransport — QUIC streams exposed to browsers — ships in Chrome. Possible WebSocket successor: lower latency, multiple independent streams, unreliable datagrams when wanted. Slow uptake outside Google products so far.'
				},
				{
					year: 2024,
					title: 'SSE Everywhere',
					description:
						'Every major LLM provider streams via SSE. Server-driven UI frameworks (React Server Components, HTMX) lean heavily on SSE. The boring older protocol gets a second act.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'SSE vs WebSockets',
			axes: ['Direction', 'Transport', 'Framing', 'Reconnect', 'Best for'],
			rows: [
				{
					label: '[[sse|SSE]]',
					values: [
						'Server → client only',
						'Plain HTTP (works over [[http1|h1]], [[http2|h2]], [[http3|h3]])',
						'Text — `data:` lines separated by blank lines',
						'Built-in — auto-reconnects with Last-Event-ID',
						'LLM streaming, notifications, server-driven UI updates'
					]
				},
				{
					label: '[[websockets|WebSockets]]',
					values: [
						'Full-duplex',
						'HTTP upgrade then custom framing over TCP',
						'Binary frames with opcode + masking',
						"Application's problem",
						'Chat, collaborative editing, multiplayer games, anything client-push-heavy'
					]
				}
			],
			note: 'If your traffic is one-way (server → client), [[sse|SSE]] is simpler, plays nice with HTTP infrastructure, and has cleaner failure semantics. If the client also needs to push frequently, [[websockets|WebSockets]].'
		},
		{
			type: 'animated-sequence',
			title: 'Polling → Long-Polling → SSE → WebSocket',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Polling — pre-Comet, naive and wasteful
    C->>S: GET /messages
    S-->>C: empty, nothing new
    Note over C: wait 5s, repeat
    C->>S: GET /messages
    S-->>C: one new message
    Note over C,S: Long-polling — the Comet era
    C->>S: GET /messages with long timeout
    Note over S: hold open until something or timeout
    S-->>C: one new message
    C->>S: GET /messages, immediately reopen
    Note over C,S: SSE — one open response, multiple events
    C->>S: GET /events with text event-stream accept
    S-->>C: data hello followed by blank line
    S-->>C: data world followed by blank line
    Note over C,S: WebSocket — full-duplex after handshake
    C->>S: GET /ws with Upgrade header
    S-->>C: 101 Switching Protocols
    C->>S: frame ping
    S-->>C: frame pong
    C->>S: frame chat
    S-->>C: frame ack`,
			caption:
				'Each step reduces latency or improves resource use over the last. [[websockets|WebSocket]] is the only one where both sides can send asynchronously; the others are still server-driven.',
			steps: {
				0: '**Polling — the original hack.** Before SSE or WebSockets, the only way to get server-pushed data was to ask the server, over and over, for new data. Most requests came back empty.',
				1: 'Client asks **GET /messages**.',
				2: 'Server has nothing new — returns an empty list. Latency: zero for the round trip, but a 5-second polling interval means up to 5 seconds before the user sees new data.',
				3: '**Wait 5 seconds and ask again.** This is the polling cost: every client hits the server every interval forever, even when nothing is happening.',
				4: 'Client asks again.',
				5: 'This time the server has a new message. The user sees it after up to one polling interval of delay.',
				6: '**Long-polling — the Comet hack.** The client opens a request and *the server holds it open* until something happens or a timeout fires. Latency drops to near-zero; the cost is many idle open connections on the server.',
				7: 'Client sends **GET /messages with a long timeout** (typically 30 seconds).',
				8: '**Server holds the connection open** rather than responding immediately. Waiting for an event or for the timeout.',
				9: 'Server gets a new message and responds *immediately*. Latency from event to client = the network round-trip time.',
				10: 'Client **immediately reopens** the connection to wait for the next event. The cycle continues.',
				11: '**SSE — Server-Sent Events.** A formalized one-way streaming response over plain HTTP. One open connection per client; many events flow down it.',
				12: 'Client sends `GET /events` with `Accept: text/event-stream`. This is just an HTTP request that the client knows will be a long-lived response.',
				13: 'Server sends an **event** as `data: hello\\n\\n`. The two newlines mark end-of-event; the connection stays open.',
				14: 'Server sends **another event** later, on the same connection. Many events per connection — no reopening required.',
				15: '**WebSocket — full-duplex.** After an HTTP handshake, the connection is *upgraded* to a custom binary protocol where both sides can send any time.',
				16: 'Client sends `GET /ws` with an `Upgrade: websocket` header — an HTTP request asking to switch protocols.',
				17: 'Server responds **101 Switching Protocols**. From this point, the connection is no longer HTTP — it speaks WebSocket frames.',
				18: 'Client sends a **ping frame**.',
				19: 'Server replies with **pong**. Both sides can initiate frames in either direction.',
				20: 'Client pushes a **chat message frame** — full-duplex means the client can send unsolicited.',
				21: 'Server acks. The chat app is real-time.'
			}
		},
		{
			type: 'callout',
			title: 'Why Long-Polling Refuses to Die',
			text: `Even after [[sse|SSE]] and [[websockets|WebSockets]] became universal, long-polling fallback is still in production at almost every major chat or collaborative product. Why?\n\n**Corporate networks hate WebSockets.** Many enterprise proxies, firewalls, and TLS-inspection appliances either reject the WebSocket Upgrade handshake or terminate idle connections aggressively. A real-time app that breaks for 15% of enterprise users is broken.\n\n**Mobile networks hate idle connections.** Carrier middleboxes close TCP connections that have been idle for 30 seconds to free state in the NAT table. SSE and WebSocket connections must keep-alive ping at minute intervals or face mysterious disconnects.\n\n**Browsers hate connections too.** A browser tab in the background may have its WebSocket throttled or closed. Apps that rely on a single persistent connection break when the user switches tabs.\n\nSocket.IO, Pusher, Ably, Phoenix Channels all carry long-polling as a graceful-degradation tier. The pattern: try WebSocket; if that fails, try long-polling; reconnect transparently. The fallback handles ~5–10% of connections in production at any large consumer app. The hack from 2006 is still working overtime in 2025.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[sse|SSE]]'s failure mode is the **stuck connection**. The protocol is one-way, so the client can't directly tell the server "I'm still here." Reconnects happen on transport failure, but a half-open TCP connection — where the server has died but the network never reports it — can leave the client silently waiting for events that will never arrive. Application-level heartbeats (server sends a keepalive comment every ~15s) are the standard fix.\n\n[[websockets|WebSockets]]'s failure mode is **state divergence**. Both client and server hold state; they must agree on it. When the connection drops mid-message, who owns the unacknowledged messages? When the client reconnects, did it miss events while disconnected? The protocol gives you no help. Every WebSocket-based app implements its own sequence numbers, replay buffers, and reconciliation. The good ones (Figma, Linear, Notion) are real distributed systems behind a simple-looking UI.\n\nBoth share a third failure mode: **server-side scalability**. Each connection costs server memory and an open file descriptor. Twitter's 2010 streaming firehose required dedicated servers per few thousand connections. Modern stacks (Phoenix on the BEAM, Go with goroutines) push that to ~1M connections per box, but only with careful tuning. Real-time always pays in server resources.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **WebTransport** is the proposed successor to [[websockets|WebSocket]] — built on [[quic|QUIC]], with native stream multiplexing, unreliable datagrams when wanted, and no proxy-Upgrade nonsense. Shipping in Chrome; slow elsewhere.\n- **HTTP/3 over QUIC** changes [[sse|SSE]]'s scaling story — one QUIC connection can carry many SSE streams without TCP head-of-line blocking. Cloudflare and Fastly are quietly making this the default.\n- **Server-driven UI** frameworks (HTMX, Phoenix LiveView, Inertia.js, React Server Components) lean on SSE for their UI updates — the boring older protocol is having a second moment because the new use case fits it perfectly.\n- **LLM streaming** is now the dominant new use case for [[sse|SSE]]. Every chat-like AI product ships an SSE endpoint; the token-by-token effect is canonical.\n- **The death of polling** is overstated. Mobile push notifications, periodic background sync, and "check every N seconds" are still the right answer for many product surfaces. Realtime is expensive; not everything needs it.`
		}
	]
};
