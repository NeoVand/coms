/**
 * Part V — Web / API.
 *
 * HTTP across three generations, the streaming alternatives, and
 * the AI-agent stack on top.
 */

import type { BookPart } from '../types';

export const webApi: BookPart = {
	id: 'web-api',
	title: 'Web / API',
	label: 'V',
	description: 'HTTP through three generations, the streaming alternatives, and the AI-agent stack.',
	chapters: [
		{
			id: 'http1',
			title: 'HTTP/1.1',
			synopsis: 'The text-based lingua franca of the web, still everywhere.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Protocol You Can Read',
							text: `[[http1|HTTP/1.1]] ([[rfc:9112|RFC 9112]], originally RFC 2068 in 1997) is the most successful application protocol ever shipped. Three things explain its longevity.

**Text on the wire.** A complete HTTP/1.1 request is a few lines of plain ASCII you can read with a netcat connection: \`GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n\`. That readability is why every developer can debug an HTTP problem with curl, why every programming language has an implementation, and why every middlebox can interpret it.

**Stateless and idempotent semantics.** Each request stands on its own; a server does not remember what came before. The verbs (GET, POST, PUT, DELETE, HEAD) and status codes (200, 301, 404, 500) form a vocabulary expressive enough for forty years of web applications without needing extension.

**Persistent connections and pipelining.** HTTP/1.0 opened a TCP connection per request — disastrous as the web grew. HTTP/1.1 (1997) reused connections for multiple requests, dropping latency dramatically. Pipelining (sending the next request before the first response arrives) was specified but rarely deployed, because head-of-line blocking made it slower in practice than just opening more connections — which is what browsers did, capping at 6 parallel TCP connections per origin.

That 6-connection cap is the entire reason [[http2|HTTP/2]] exists. The story continues in the next chapter.`
						}
					]
				},
				{ kind: 'protocol', id: 'http1' },
				{ kind: 'rfc', number: '9110' },
				{ kind: 'rfc', number: '9112' },
				{ kind: 'simulation', protocolId: 'http1' }
			]
		},
		{
			id: 'http2',
			title: 'HTTP/2',
			synopsis: 'Binary framing, streams, HPACK — and the TCP head-of-line problem it could not fix.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Binary Layer Under the Same Semantics',
							text: `By 2009, web pages were averaging 90 requests across 15 origins. The 6-connection-per-origin browser cap meant every page paid the cost of TCP setup repeatedly, and **head-of-line blocking** at the application layer was capping throughput. Google's SPDY experiment (2009) proposed multiplexing many requests over a single connection, with binary framing and per-frame priority.

SPDY became the basis for [[http2|HTTP/2]] ([[rfc:9113|RFC 9113]], finalised May 2015). The semantics — verbs, headers, status codes — are unchanged; only the wire format moves from text to binary frames. A single HTTP/2 connection carries any number of **streams**, each a logically independent request/response pair. **HPACK** (RFC 7541) compresses repeated headers (cookies, user-agent) by reference instead of resending them.

The result: real-world page loads dropped 30-40% with HTTP/2 enabled, and CDNs adopted it within a year. By 2018, over 35% of all websites supported HTTP/2.

The unsolvable flaw: HTTP/2 still runs over [[tcp|TCP]], and TCP retransmission stalls **all** streams on a connection when even one packet is lost. The very feature HTTP/2 added — multiplexing — turned a single dropped packet into a whole-connection stall. The fix had to wait for [[quic|QUIC]] and [[http3|HTTP/3]].`
						}
					]
				},
				{ kind: 'protocol', id: 'http2' },
				{ kind: 'pioneer', id: 'mike-belshe' },
				{ kind: 'rfc', number: '9113' },
				{ kind: 'simulation', protocolId: 'http2' }
			]
		},
		{
			id: 'http3',
			title: 'HTTP/3',
			synopsis: 'HTTP on QUIC. No more TCP head-of-line blocking.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Same HTTP, A Different Transport',
							text: `[[http3|HTTP/3]] ([[rfc:9114|RFC 9114]], finalised June 2022) is HTTP semantics on top of [[quic|QUIC]] instead of [[tcp|TCP]]. The visible HTTP behaviour is unchanged — same verbs, same status codes, same header semantics. The wire encoding changes (QPACK replaces HPACK because QUIC stream ordering differs from TCP byte ordering), but applications need not care.

What changes underneath is everything. Multiplexed streams in HTTP/3 are **truly independent** at the transport layer — a lost UDP packet only stalls the stream that owned the lost data, not all streams. Connection setup folds into the [[tls|TLS 1.3]] handshake at zero or one round-trip. Connection IDs survive network changes, so a phone moving between Wi-Fi and cellular keeps its HTTP/3 sessions alive without re-handshaking.

Adoption: by 2026, **35% of the top 10M websites** support HTTP/3. Chrome, Firefox, Safari, Edge all enable it by default. Cloudflare, Fastly, Akamai serve HTTP/3 universally. CDN-fronted traffic is now majority HTTP/3; origin-fronted traffic still trends HTTP/2 because the long tail of nginx/apache deployments lags.

The next ten years of HTTP innovation will not be about the protocol shape; it will be about [[frontier:multipath-quic|multipath]], [[frontier:moq-transport|MoQ]], and the new layers of agent-to-agent traffic ([[mcp|MCP]], [[a2a|A2A]]) that ride on top.`
						}
					]
				},
				{ kind: 'protocol', id: 'http3' },
				{ kind: 'rfc', number: '9114' },
				{ kind: 'simulation', protocolId: 'http3' },
				{
					kind: 'comparison',
					pairIds: ['http2', 'http3']
				}
			]
		},
		{
			id: 'rest-and-graphql',
			title: 'REST and GraphQL',
			synopsis: 'Two ways to model an API.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Constraint That Made the Web',
							text: `In 2000, **[[pioneer:roy-fielding|Roy Fielding]]**'s PhD dissertation at UC Irvine described the architectural style behind [[http1|HTTP]]. He named it **REST** — Representational State Transfer — and articulated five constraints (client-server, stateless, cacheable, layered, uniform interface). The **uniform interface** constraint, in particular, is what made the web composable: every resource has a URI, every resource is acted on by a small set of HTTP verbs, and every response is a self-describing representation.

[[rest|REST]]-style APIs became the default for web services because they inherited HTTP's caching, status codes, and tooling for free. By 2010, "REST API" was the answer to "how should two services on the internet talk to each other" for nearly every problem domain.

The cost of REST emerged at scale. A mobile app loading a user profile might need to call \`/users/123\`, \`/users/123/posts\`, \`/posts/[ids]/comments\`, \`/users/[ids]\` — four round-trips for a single screen. Facebook's mobile team hit this wall in 2012 and built [[graphql|GraphQL]] to solve it: a single endpoint where the client describes exactly what data it wants and the server returns exactly that, in one round-trip.

Neither approach won. REST is the right answer when resources are simple, when caching matters, when many clients share an API. GraphQL is the right answer when clients have wildly different data needs (a watch app, a desktop app, a dashboard) and over-fetching matters. Most modern systems use both.`
						}
					]
				},
				{ kind: 'protocol', id: 'rest' },
				{ kind: 'protocol', id: 'graphql' },
				{ kind: 'pioneer', id: 'roy-fielding' },
				{
					kind: 'comparison',
					pairIds: ['rest', 'graphql']
				}
			]
		},
		{
			id: 'grpc',
			title: 'gRPC',
			synopsis: 'Typed RPC over HTTP/2 — the microservices default.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When You Control Both Sides',
							text: `[[rest|REST]] and [[graphql|GraphQL]] are designed for the open web, where you cannot assume anything about the client. [[grpc|gRPC]] is designed for the closed case — your own services talking to each other inside a datacenter, where you control both sides and can assume a shared schema.

gRPC was open-sourced by Google in 2015, evolved from their internal **Stubby** RPC framework. The wire format is **protobuf** (Protocol Buffers) — a compact binary encoding generated from a schema file. The transport is [[http2|HTTP/2]], which gives multiplexed streams, header compression, and per-stream cancellation for free.

The model lets you describe a service as Go-like methods (\`rpc GetUser(UserRequest) returns (User);\`) and compile clients and servers in any of a dozen languages. Streaming methods come in four flavours: unary, server-streaming, client-streaming, and bidirectional. Every binding is type-checked at compile time.

gRPC became the default for service-to-service traffic at almost every large engineering org by 2019. Where it does not fit: browsers (which cannot speak HTTP/2 trailers — gRPC-web exists but is awkward), mobile clients (where the protobuf runtime is heavy), and public APIs (where REST's discoverability still wins).`
						}
					]
				},
				{ kind: 'protocol', id: 'grpc' },
				{ kind: 'simulation', protocolId: 'grpc' }
			]
		},
		{
			id: 'websockets-and-sse',
			title: 'WebSockets and SSE',
			synopsis: 'Push from server to browser, two ways.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Inverting the Request/Response Model',
							text: `HTTP is fundamentally request/response: the client asks, the server answers. For a notification system, a chat app, a live dashboard, that model is wrong — the server has data the client wants **now**, and it should not wait for a poll.

Two protocols solved this on top of HTTP. [[websockets|WebSockets]] ([[rfc:6455|RFC 6455]], 2011) hijacks an HTTP/1.1 connection with an \`Upgrade: websocket\` request and switches the connection to a bidirectional binary frame protocol. After the upgrade, neither side waits for the other — both can send any time. Slack, Discord, Figma, and most live-collaboration apps use WebSockets.

[[sse|Server-Sent Events]] (HTML5, 2009) is the simpler one-way version: the server holds open an HTTP connection and writes \`data:\` frames to the client over time. No protocol switch, no binary framing, just a long-lived response stream. Twitter's home timeline, Anthropic's streaming chat completions, and most LLM APIs use SSE because it inherits HTTP's caching, auth, and tooling — and because most use cases need server-to-client only.

The choice between them is almost entirely about whether the client needs to send asynchronously too. If yes, WebSockets. If no, SSE — and you save half the implementation complexity.`
						}
					]
				},
				{ kind: 'protocol', id: 'websockets' },
				{ kind: 'protocol', id: 'sse' },
				{ kind: 'rfc', number: '6455' },
				{
					kind: 'comparison',
					pairIds: ['websockets', 'sse']
				}
			]
		},
		{
			id: 'mcp-and-a2a',
			title: 'MCP and A2A',
			synopsis: 'The protocol layer for AI agents.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'For fifteen years, no genuinely new application protocol shipped. Then 2024 happened twice.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Standard Way for Agents to Reach Tools',
							text: `Until 2024, an AI assistant that wanted to read your files, query your database, or call your APIs needed a custom integration per tool per assistant. Anthropic shipped Claude with file access, Cursor shipped with editor integration, every developer rebuilt the same plumbing. The combinatorics did not scale.

[[mcp|MCP]] — the **Model Context Protocol**, published by Anthropic in November 2024 — proposes a single shape for that interface: a tool server (filesystem, database, CRM, anything) speaks MCP; any MCP-aware client (Claude, Cursor, ChatGPT, your own agent) can use it. Capability discovery, tool calling, prompt templates, and resources are first-class concepts. The transport is JSON-RPC 2.0 over standard input/output for local tools, or [[frontier:mcp-streamable-http|streamable HTTP]] (SSE-based) for remote ones.

A year in, MCP has thousands of public servers in the registry, native support across Claude, ChatGPT, Cursor, Windsurf, and most agent frameworks. It is one of the fastest application-protocol adoption curves in internet history.

[[a2a|A2A]] — **Agent-to-Agent Protocol**, published by Google in April 2025 — is the agent-collaboration twin: capability discovery, task delegation, asynchronous event streams between **agents** rather than between agent and tool. A2A moved into the [[frontier:a2a-linux-foundation|Linux Foundation]] in mid-2025, alongside MCP, signalling that both protocols are now multi-vendor commons rather than single-company bets.`
						}
					]
				},
				{ kind: 'protocol', id: 'mcp' },
				{ kind: 'protocol', id: 'a2a' },
				{ kind: 'frontier', id: 'mcp-streamable-http' },
				{ kind: 'frontier', id: 'a2a-linux-foundation' },
				{
					kind: 'simulation',
					protocolId: 'mcp'
				}
			]
		}
	]
};
