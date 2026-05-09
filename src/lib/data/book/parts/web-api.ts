/**
 * Part V — Web / API.
 *
 * HTTP across three generations, the streaming alternatives, and
 * the AI-agent stack on top. Every chapter is multi-section with
 * historical, mechanical, and 2024-2026 deployment material — drawn
 * from the per-protocol research files in /research.
 */

import type { BookPart } from '../types';

export const webApi: BookPart = {
	id: 'web-api',
	title: 'Web / API',
	label: 'V',
	description: 'HTTP through three generations, the streaming alternatives, and the AI-agent stack.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'http1',
			title: 'HTTP/1.1',
			synopsis: 'The text-based lingua franca of the web, still everywhere.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'A complete [[http1|HTTP/1.1]] request is a few lines of plain ASCII you can debug with netcat. That readability is why every developer can debug an HTTP problem with curl, why every programming language has an implementation, and why every middlebox can interpret it.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Protocol You Can Read',
							text: `[[http1|HTTP/1.1]] is the most successful application protocol ever shipped. It was originally specified in **RFC 2068 (January 1997)**, then revised through RFC 2616 (1999) and RFC 7230-7235 (2014). In **June 2022** the IETF replaced the entire 1997-2014 lineage in one big bang with a five-document set: **[[rfc:9110|RFC 9110]]** (HTTP Semantics), [[rfc:9112|RFC 9112]] ([[http1|HTTP/1.1]] Messaging), RFC 9111 (Caching), and the matching [[http2|HTTP/2]] ([[rfc:9113|RFC 9113]]) and [[http3|HTTP/3]] ([[rfc:9114|RFC 9114]]) updates. *The Register* called the 7 June 2022 cluster *"the day [[tcp|TCP]] stopped being assumed."*

Three things explain HTTP/1.1's longevity.`
						},
						{
							type: 'narrative',
							title: 'Text on the Wire, Stateless Semantics, Persistent Connections',
							text: `**Text on the wire.** A complete [[http1|HTTP/1.1]] request is a few lines of plain US-ASCII (RFC 9112 §2.2 specifies the message grammar in ABNF over US-ASCII octets):

\`\`\`
GET /index.html [[http1|HTTP/1.1]]
Host: example.com
\\r\\n\\r\\n
\`\`\`

That readability is the entire reason every developer can debug an HTTP problem with curl, every programming language has an implementation, and every middlebox can interpret it.

**Stateless and idempotent semantics.** Each request stands on its own; a server does not remember what came before. The verbs (GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS) and status codes (100/200/300/400/500 series) form a vocabulary expressive enough for forty years of web applications without needing extension. The constraint is the strength.

**Persistent connections.** HTTP/1.0 (RFC 1945, 1996) opened a fresh TCP connection per request — disastrous as web pages grew. HTTP/1.1 reused connections for multiple requests by default, dropping latency dramatically. **Pipelining** (sending the next request before the first response arrives) was specified but rarely deployed because head-of-line blocking made it slower in practice than just opening more connections. Browsers settled on **6 parallel TCP connections per origin** as the operational compromise.`
						},
						{
							type: 'callout',
							title: 'The 6-connection cap is why HTTP/2 exists',
							text: 'By 2009, web pages were averaging 90 requests across 15 origins. With 6 connections per origin, every page paid the cost of [[tcp|TCP]] setup repeatedly, and connections were idle most of the time. Google\'s SPDY experiment proposed {{multiplexing|multiplexing}} many requests over a single connection, with {{binary-framing|binary framing}}. SPDY became the seed of [[http2|HTTP/2]].'
						},
						{
							type: 'narrative',
							title: 'Why HTTP/1.1 Is Still 28% of Traffic in 2026',
							text: `Despite [[http2|HTTP/2]] (51%) and [[http3|HTTP/3]] (~21%) carrying the majority of modern web traffic, **[[http1|HTTP/1.1]] stubbornly persists at around 28%** of Cloudflare-observed requests in Q1 2026. Three reasons.

**APIs and CLI tools.** \`curl\`, \`wget\`, scripting clients, server-to-server [[rest|REST]] traffic, internal microservice calls — many of these still default to HTTP/1.1 because the simplicity outweighs the {{multiplexing|multiplexing}} benefit. A single API call doesn't need {{binary-framing|binary framing}} or stream prioritisation.

**Origin servers without HTTP/2.** A long tail of nginx, Apache, IIS, and embedded HTTP servers run versions older than mainstream HTTP/2 support. Many corporate intranets, legacy admin panels, and older IoT devices speak only HTTP/1.1.

**Debuggability.** When something is wrong with an HTTP {{exchange|exchange}}, the fastest diagnostic path is reading the bytes on the wire. HTTP/1.1 is the only version where you can do that without a protocol decoder. For internal tooling and developer-facing surfaces, "I can see the request" is a feature.`
						}
					]
				},
				{ kind: 'protocol', id: 'http1' },
				{ kind: 'rfc', number: '9110' },
				{ kind: 'rfc', number: '9112' },
				{ kind: 'simulation', protocolId: 'http1' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'http2',
			title: 'HTTP/2',
			synopsis: '{{binary-framing|Binary framing}}, streams, {{hpack|HPACK}} — and the security saga that has not stopped.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[http2|HTTP/2]] still carries the majority of the web in 2026 — 51% of Cloudflare-observed traffic. The very feature that made it succeed ({{multiplexing|multiplexing}} many streams over one connection) also made it a DDoS amplifier. The CVE story is not over.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Binary Layer Under the Same Semantics',
							text: `By 2009, web pages averaged 90 requests across 15 origins. The 6-connection-per-origin browser cap meant every page paid [[tcp|TCP]] setup overhead repeatedly, and **{{head-of-line-blocking|head-of-line blocking}}** at the application layer was capping throughput. Google's **SPDY** experiment ([[pioneer:mike-belshe|Mike Belshe]] + Roberto Peon, 2009) proposed {{multiplexing|multiplexing}} many requests over a single connection, with {{binary-framing|binary framing}} and per-frame priority.

SPDY became the basis for [[http2|HTTP/2]] under HTTPbis WG chair Mark Nottingham. **[[rfc:9113|RFC 9113]]** (originally RFC 7540, May 2015) ships [[http2|HTTP/2]] as a binary-framed multiplexed protocol. The semantics — verbs, headers, status codes — are unchanged from [[http1|HTTP/1.1]]; only the wire format moves from text to **9-byte frame headers** (Length 24-bit, Type 8-bit, Flags 8-bit, Reserved 1-bit, Stream ID 31-bit) plus {{payload|payload}}. A single HTTP/2 connection carries any number of **streams**, each a logically independent request/response pair. Client streams use odd IDs; server-push streams (now extinct) used even ones.

**{{hpack|HPACK}}** (RFC 7541) compresses repeated headers (cookies, user-agent) by reference instead of resending them. It uses a 61-entry static table of common header fields, a per-connection dynamic table, and Huffman-coded literals. HPACK was designed in direct response to **CRIME/BREACH-style attacks** on gzip-compressed headers — the static table prevents the attacker from inferring secrets from compression ratios.`
						},
						{
							type: 'narrative',
							title: 'The Deployment Win, Then the Long Tail',
							text: `Real-world page loads dropped 30-40% with [[http2|HTTP/2]] enabled. CDNs adopted it within a year. By 2018, over 35% of all websites supported HTTP/2; by 2026, it carries about **51% of Cloudflare-observed web requests** — still the dominant version of HTTP on the internet, even as [[http3|HTTP/3]] grows.

The unsolvable structural flaw: HTTP/2 still runs over [[tcp|TCP]], and [[tcp|TCP]] {{retransmission|retransmission}} stalls **all** streams on a connection when even one packet is lost. The very feature HTTP/2 added — {{multiplexing|multiplexing}} — turned a single dropped packet into a whole-connection stall. The fix had to wait for [[quic|QUIC]] and [[http3|HTTP/3]].`
						},
						{
							type: 'callout',
							title: 'Server Push is gone',
							text: '[[http2|HTTP/2]] {{server-push|Server Push}} was supposed to let servers preemptively send resources the client would need next. **Chrome 106 (October 2022) disabled it by default**; only ~1.25% of [[http2|HTTP/2]] sites had ever used it. **Firefox 132 (October 29, 2024) removed support entirely.** No major browser implements HTTP/2 Server Push as of 2026. The replacement pattern is the **`103 {{early-hints|Early Hints}}`** informational status combined with `Link: rel=preload`.'
						},
						{
							type: 'narrative',
							title: 'The Security Saga',
							text: `The most consequential changes in [[http2|HTTP/2]] over the last 24 months have been security disclosures.

**CVE-2023-44487 "Rapid Reset" (10 October 2023)** — an attacker opens streams and immediately RST_STREAMs them, using the ratio of cheap RST frames to expensive server processing to amplify a DDoS. Google absorbed an attack peaking at **398 million requests per second** — the largest L7 DDoS ever recorded at that point. Cloudflare absorbed 201 Mrps, AWS 155 Mrps. Mitigations are now baked into every major HTTP/2 implementation.

**CVE-2024-27316 "HTTP/2 CONTINUATION Flood" (April 3, 2024)** — disclosed by Bartek Nowotarski via CERT/CC. The attack exploits CONTINUATION frames (used for headers larger than the initial HEADERS frame) that are unbounded by default, exhausting server memory. Patched across Apache httpd, Tomcat (CVE-2024-24549), Apache Traffic Server, Envoy, Node.js, Go net/http, nghttp2, AMPHP, and Tempesta FW.

**CVE-2025-8671 "MadeYouReset" (August 13, 2025)** — disclosed by Tel Aviv University researchers with Imperva. The attacker uses **malformed** WINDOW_UPDATE / PRIORITY / DATA frames to make the server send RST_STREAM against itself, bypassing the client-reset rate limits added after Rapid Reset. Affects Apache Tomcat, Netty, Varnish, F5, Fastly, AMPHP, Eclipse, [[grpc|gRPC]]. Cloudflare and Akamai were not exposed.

The pattern: each CVE breaks an assumption that earlier mitigations had baked in. The HTTP/2 protocol surface is large, the implementations are intricate, and the DDoS economics make HTTP/2 servers high-value targets. New CVEs in this space should be expected for years to come.`
						}
					]
				},
				{ kind: 'protocol', id: 'http2' },
				{ kind: 'pioneer', id: 'mike-belshe' },
				{ kind: 'rfc', number: '9113' },
				{ kind: 'simulation', protocolId: 'http2' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'http3',
			title: 'HTTP/3',
			synopsis: 'HTTP semantics on [[quic|QUIC]]. The plateau is real but so is the agenda.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[http3|HTTP/3]] is at ~21% of Cloudflare-observed traffic in Q1 2026 — flat or slightly declining. The plateau correlates with a 2024 paper showing up-to-45% throughput regressions vs [[http2|HTTP/2]] above 500 Mbps, mostly from receiver-side userspace ACK and copy overhead.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Same HTTP, A New Transport',
							text: `[[http3|HTTP/3]] (**[[rfc:9114|RFC 9114]]**, June 2022, M. Bishop ed., Akamai) is the third major version of HTTP — defined as a binary mapping of HTTP semantics ([[rfc:9110|RFC 9110]]) onto [[quic|QUIC]] ([[rfc:9000|RFC 9000]]). The visible HTTP behaviour is unchanged: same verbs, same status codes, same header semantics. The wire encoding changes — **QPACK** (RFC 9204) replaces {{hpack|HPACK}} because [[quic|QUIC]]'s stream ordering differs from [[tcp|TCP]]'s byte ordering — but applications need not care.

What changes underneath is everything. Multiplexed streams in [[http3|HTTP/3]] are **truly independent at the transport layer** — a lost [[udp|UDP]] packet only stalls the stream that owned the lost data, not all streams. Connection setup folds into the [[tls|TLS 1.3]] {{handshake|handshake}} at zero or one round-trip. **Connection IDs** survive network changes, so a phone moving between Wi-Fi and cellular keeps its HTTP/3 sessions alive without re-handshaking.

QUIC v2 ([[rfc:9000|RFC 9369]], May 2023, M. Duke) was published as a Standards-Track template for new QUIC versions. Its wire-image version number is **0x6b3343cf** — the first 4 bytes of \`sha256("QUICv2 version number")\` — chosen specifically to exercise version negotiation and break middleboxes that ossified on v1's Initial-packet {{salt|salt}}.`
						},
						{
							type: 'narrative',
							title: 'Adoption — And the Plateau',
							text: `By 2018, [[http3|HTTP/3]] progenitor gQUIC was carrying meaningful Google traffic. **Chrome enabled HTTP/3 by default in April 2020.** Firefox followed in May 2021. **Apple shipped Safari 14 with experimental HTTP/3 in September 2020 and turned it on by default in Safari 16 (September 2024).** Cloudflare announced HTTP/3 edge support in September 2019 and serves it universally. Cloudflare, Fastly, Akamai serve HTTP/3 universally.

But adoption has plateaued. As of Q1 2026, HTTP/3 carries roughly **21% of Cloudflare-observed web requests** — flat or slightly declining for several months. [[http2|HTTP/2]] still dominates at ~51%; HTTP/1.x persists near 28%.

The plateau correlates with **the 2024 ACM Web Conference paper "[[quic|QUIC]] is not Quick Enough over Fast Internet"** (Zhang et al., doi:10.1145/3589334.3645323) showing **up-to-45.2% throughput regressions** vs HTTP/2 above ~500 Mbps. The cause: receiver-side userspace ACK and copy overhead — QUIC implementations live above the kernel and pay for every packet a context switch the kernel [[tcp|TCP]] stack does not.

The fix in flight is **in-kernel QUIC**. Xin Long posted the first ~9,000-line in-kernel QUIC patch series for Linux on **22 July 2025** (LWN coverage). The design uses \`IPPROTO_QUIC\` (mirroring \`IPPROTO_MPTCP\`) with the [[tls|TLS]] {{handshake|handshake}} delegated to userspace via \`tlshd\`. Mainline merge is expected 2026 at earliest.`
						},
						{
							type: 'callout',
							title: 'nginx HTTP/3 finally stable',
							text: 'After years of experimental builds, **mainline nginx 1.25.0 (23 May 2023)** merged the [[quic|QUIC]] stack and shipped [[http3|HTTP/3]] as a stable feature. **Caddy 2.6 (September 2022)** has shipped [[http3|HTTP/3]] by default since. **HAProxy 2.6** added experimental [[http3|HTTP/3]] in May 2022 and stabilised in 2.8/3.0. **curl** got HTTP/3 in default Debian 13/trixie in October 2025. Apache httpd has no production HTTP/3.'
						},
						{
							type: 'narrative',
							title: 'The Active Frontier',
							text: `The next ten years of HTTP innovation will be shaped by the working-group output of 2024-2026.

**[[frontier:multipath-quic|Multipath QUIC]]** (draft-ietf-quic-multipath) entered IESG Last Call in December 2025; the latest draft -21 is dated 17 March 2026. Alibaba and Apple have already deployed predecessors. Multipath [[quic|QUIC]] inherits [[mptcp|MPTCP]]'s algorithmic ideas inside a transport that actually traverses middleboxes.

**HTTP Datagrams and Capsules** ([[rfc:9000|RFC 9297]], August 2022, D. Schinazi & L. Pardue) standardised unreliable datagrams over [[http3|HTTP/3]], enabling {{masque|MASQUE}} and {{webtransport|WebTransport}}.

**MASQUE** ([[rfc:9000|RFC 9298]], 9484) ships CONNECT-UDP and CONNECT-IP. Apple Private Relay and Cloudflare's WARP-related proxy services use these.

**WebTransport over HTTP/3** is at draft-ietf-webtrans-http3-15 (March 2026). Chrome and Edge ship implementations; ASP.NET Core Kestrel has experimental support.

**[[frontier:ech-rfc-9849|Encrypted Client Hello (ECH)]]** was approved by the [[tls|TLS]] WG and entered the RFC editor queue in 2025 (RFC 9849-track, IANA registry allocated 2025-07-30). Cloudflare turned it on for ~70% of its zones; Russia began censoring ECH connections; major browsers ship ECH gated by HTTPS [[dns|DNS]] records (RFC 9460).

**Reliable Stream Resets** (draft-ietf-quic-reliable-stream-reset, M. Seemann & K. Oku, latest -07 in June 2025) defines RESET_STREAM_AT for WebTransport's reliable initial bytes.`
						}
					]
				},
				{ kind: 'protocol', id: 'http3' },
				{ kind: 'rfc', number: '9114' },
				{ kind: 'frontier', id: 'multipath-quic' },
				{ kind: 'frontier', id: 'ech-rfc-9849' },
				{ kind: 'simulation', protocolId: 'http3' },
				{ kind: 'comparison', pairIds: ['http2', 'http3'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'rest-and-graphql',
			title: 'REST and GraphQL',
			synopsis: 'Two ways to model an API — and a 25-year argument over which one Fielding actually meant.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Constraint That Made the Web',
							text: `In **June 2000**, **[[pioneer:roy-fielding|Roy Thomas Fielding]]** filed his PhD dissertation at UC Irvine: *"Architectural Styles and the Design of Network-Based Software Architectures."* Chapter 5 described the architectural style behind [[http1|HTTP]]. He named it **[[rest|REST]]** — Representational State Transfer.

The popular myth that "REST is named after a rest stop" is romantic but wrong. The documented etymology is the state-machine metaphor: *"a network of web pages (a virtual state-machine), where the user progresses through the application by selecting links (state transitions)."* Fielding renamed his original "HTTP object model" to REST after people kept confusing it with an HTTP server's implementation model.

REST has six constraints (client-server, {{stateless|stateless}}, cacheable, layered, uniform interface, optional code-on-demand). The **uniform interface** constraint is what made the web composable: every resource has a URI, every resource is acted on by a small set of HTTP verbs, and every response is a self-describing representation.

[[rest|REST]]-style APIs became the default for web services because they inherited HTTP's caching, status codes, and tooling for free. By 2010, "REST API" was the answer to "how should two services on the internet talk to each other" for nearly every problem domain.`
						},
						{
							type: 'callout',
							title: 'Almost no REST API is REST',
							text: '**HATEOAS — Hypermedia as the Engine of Application State** — is Fielding\'s constraint that clients should drive interactions by following links and forms in server responses, not by hard-coding URI templates. Pronounced "hate-ee-oss." Fielding has been publicly frustrated for 25 years that the vast majority of "[[rest|REST]] APIs" are not RESTful in his strict sense — they fail HATEOAS. His **2008 essay "[[rest|REST]] APIs must be hypertext-driven"** is required reading for the genre. Most modern APIs are pragmatic {{json|JSON}}-over-HTTP; [[rest|REST]] in the original sense remains rare.'
						},
						{
							type: 'narrative',
							title: 'The Cost That Emerged At Mobile Scale',
							text: `The trouble with [[rest|REST]] emerged at scale, specifically on mobile.

A mobile app loading a user profile might need to call \`/users/123\`, \`/users/123/posts\`, \`/posts/[ids]/comments\`, and \`/users/[ids]\` — four round-trips for a single screen. On a 4G connection with 100 ms RTT, that is 400 ms of {{latency|latency}} before the app can render anything. Each individual REST endpoint was clean; the **chain of endpoints required to populate one screen** was the problem.

Facebook's mobile team hit this wall in 2012 and built [[graphql|GraphQL]] to solve it: a single endpoint where the client describes **exactly what data it wants** and the server returns exactly that, in one round-trip. Facebook open-sourced the spec in 2015. The current edition is **[[graphql|GraphQL]] September 2025** (https://spec.graphql.org/September2025/), maintained by the GraphQL Foundation under the Linux Foundation.

GraphQL deliberately *does not* mandate a transport. The de-facto binding is **GraphQL-over-HTTP** (https://graphql.github.io/graphql-over-http/draft/), typically POST \`/graphql\` for mutations and queries — though GET is allowed for cacheable, {{idempotent|idempotent}} queries. {{json|JSON}} ([[rfc:9110|RFC 8259]]) is the default body format.`
						},
						{
							type: 'narrative',
							title: 'Subscriptions, and the Two Patterns',
							text: `[[graphql|GraphQL]] has three operation types: query, mutation, and **subscription**. Subscriptions need a long-lived connection — the server has to push events to the client over time. Two transports compete.

**graphql-ws over [[websockets|WebSocket]]** (https://github.com/enisdenjo/graphql-ws) — the original. Bidirectional WebSocket carries {{json|JSON}}-RPC-shaped messages. Works everywhere; doesn't compose well with [[http2|HTTP/2]] {{multiplexing|multiplexing}} or HTTP caches.

**[[sse|Server-Sent Events]]** (text/event-stream over HTTP) — increasingly preferred. Survives proxies that mangle WebSocket upgrades, composes with HTTP/2, inherits HTTP auth, supports auto-reconnection out of the box. Tools like \`gqlgen\` and \`graphql-yoga\` default to [[sse|SSE]] for new projects.

The choice between [[rest|REST]] and GraphQL is not strictly either/or. Most modern systems use both: REST for resource CRUD where caching matters, GraphQL where clients have wildly different data needs (a watch app, a desktop app, a dashboard). The popular misconception that "GraphQL replaces REST" undersells how often they coexist in the same backend.`
						}
					]
				},
				{ kind: 'protocol', id: 'rest' },
				{ kind: 'protocol', id: 'graphql' },
				{ kind: 'pioneer', id: 'roy-fielding' },
				{ kind: 'comparison', pairIds: ['rest', 'graphql'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'grpc',
			title: 'gRPC',
			synopsis: 'Typed RPC over [[http2|HTTP/2]] — the microservices default for the controlled-both-sides case.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[grpc|gRPC]] is what you build when you control both sides. It assumes a shared schema, a binary encoding, [[http2|HTTP/2]] trailers — none of which the public web supports cleanly. That is why it dominates inside the datacenter and barely exists in browsers.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When You Control Both Sides',
							text: `[[rest|REST]] and [[graphql|GraphQL]] are designed for the open web, where you cannot assume anything about the client. [[grpc|gRPC]] is designed for the closed case — your own services talking to each other inside a datacenter, where you control both sides and can assume a shared schema.

[[grpc|gRPC]] was open-sourced by Google in **August 2015**, evolved from their internal **Stubby** RPC framework that had been in production at Google since the late 2000s. The wire format is **{{protocol-buffers|Protocol Buffers}}** ("protobuf") — a compact binary encoding generated from a schema file (.proto). The transport is [[http2|HTTP/2]], which gives multiplexed streams, header compression, and per-stream cancellation for free.`
						},
						{
							type: 'narrative',
							title: 'How It Maps to HTTP/2',
							text: `A [[grpc|gRPC]] call is a single [[http2|HTTP/2]] {{request-response|request-response}} on a stream. The request body is a sequence of **length-prefixed protobuf messages**; the response body is the same. The control metadata that traditional RPC frameworks would carry in headers — error codes, status messages, deadlines — is split across HTTP/2 headers (initial metadata) and HTTP/2 **trailers** (final \`grpc-status\`, \`grpc-message\`).

The dependence on **HTTP/2 trailers** is exactly why gRPC does not run cleanly in browsers. Browser HTTP/2 implementations expose responses as chunked bodies but do not surface trailers to JavaScript. The workaround is **gRPC-Web**, a slightly-different wire format that encodes trailers as a final framing block in the body — but gRPC-Web is awkward, requires a server-side translator, and never feels native to browser applications.

The model lets you describe a service as Go-like methods (\`rpc GetUser(UserRequest) returns (User);\`) and compile clients and servers in any of a dozen languages. **Streaming methods** come in four flavours: unary (one request, one response), server-streaming (one request, many responses), client-streaming (many requests, one response), and bidirectional (many of both, interleaved on a single stream). Every binding is type-checked at compile time.`
						},
						{
							type: 'callout',
							title: 'gRPC versus the alternatives',
							text: '[[grpc|gRPC]] dominates **service-to-service traffic inside the datacenter** at almost every large engineering org since 2019. Where it does not fit: **browsers** (gRPC-Web exists but is awkward), **mobile clients with constrained {{bandwidth|bandwidth}}** (the protobuf runtime is heavy compared to {{json|JSON}}+HTTP), and **public APIs** (where [[rest|REST]]\'s discoverability and curl-debuggability still win). The choice is not "[[grpc|gRPC]] vs REST" in the abstract; it is "controlled both sides, performance-critical → [[grpc|gRPC]]; everything else → HTTP+JSON."'
						},
						{
							type: 'narrative',
							title: 'The CONTINUATION Flood Cleanup',
							text: `[[grpc|gRPC]] was one of the implementations affected by **CVE-2024-27316 "[[http2|HTTP/2]] CONTINUATION Flood"** (April 2024) and **CVE-2025-8671 "MadeYouReset"** (August 2025). Because gRPC builds on HTTP/2, every HTTP/2 vulnerability ripples through every gRPC implementation.

The fixes shipped in coordinated disclosures across grpc-go, grpc-java, grpc-c++, grpc-node, and the language bindings that depend on them. The lesson — same as for HTTP/2 generally — is that protocol surface area determines attack surface, and gRPC inherits all of HTTP/2's plus its own protobuf parsing.

Active 2024-2026 work in the gRPC working group includes: native [[http3|HTTP/3]] support (currently experimental, gated on widespread server-side [[quic|QUIC]]); a clearer story for cancellation propagation across streaming methods; and improved interop with OpenTelemetry traces.`
						}
					]
				},
				{ kind: 'protocol', id: 'grpc' },
				{ kind: 'simulation', protocolId: 'grpc' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'websockets-and-sse',
			title: 'WebSockets and SSE',
			synopsis: '{{server-push|Server push}}, two ways — and the [[sse|SSE]] renaissance via LLM streaming.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'For most of its life [[sse|SSE]] lost mindshare to WebSocket. It is now the de facto wire format for LLM token streaming — OpenAI, Anthropic, Gemini, Cloudflare Workers AI all stream tokens as `text/event-stream`.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Inverting the Request/Response Model',
							text: `HTTP is fundamentally request/response: the client asks, the server answers. For a {{notification|notification}} system, a chat app, a live dashboard, that model is wrong — the server has data the client wants *now*, and it should not wait for a poll.

Two protocols solved this on top of HTTP, with very different tradeoffs.

**[[websockets|WebSockets]]** ([[rfc:6455|RFC 6455]], December 2011, edited by Ian Fette of Google and Alexey Melnikov of Isode) hijack an [[http1|HTTP/1.1]] connection with an \`Upgrade: websocket\` request and switch the connection to a bidirectional binary frame protocol. After the upgrade, neither side waits for the other — both can send any time. **~99% of browsers support it since 2012.** Slack, Discord, Figma, and most live-collaboration apps use WebSockets. **Slack documents 5M+ concurrent WebSocket sessions** in production; **Cloudflare's WebSocket Hibernation API** for Durable Objects bills only when JS executes and survives idle WebSocket connections without server cost.

**[[sse|Server-Sent Events]]** is the simpler one-way version, specified by **Ian Hickson and first shipped in Opera 9 in September 2006**. The server holds open an HTTP response and writes \`data:\` frames over time. No protocol switch, no {{binary-framing|binary framing}} — just a long-lived response stream with \`Content-Type: text/event-stream\`. Currently defined in **§9.2 of the HTML Living Standard**.`
						},
						{
							type: 'narrative',
							title: 'The SSE Renaissance',
							text: `For most of its life [[sse|SSE]] lost mindshare to WebSocket. The 2010s narrative was *"WebSockets are the future of real-time."*

That changed when LLMs started streaming tokens. **OpenAI, Anthropic, Google Gemini, Cloudflare Workers AI all stream tokens as \`text/event-stream\`** — SSE is now the de facto wire format for streaming inference. The reasons are practical:

- It is **HTTP**. {{cors|CORS}}, auth, caching, proxies, CDNs all just work.
- It **auto-reconnects**, with **\`Last-Event-ID\`** as a built-in resume mechanism — the browser sends the last event ID it received as a request header on reconnect; the server resumes from there.
- It **composes with [[http2|HTTP/2]] {{multiplexing|multiplexing}}** — many SSE streams share one [[tcp|TCP]] connection.
- The browser gives you **\`new EventSource(url)\`** — three lines of JavaScript and you have a streaming consumer.

WebSocket is the right answer when the client genuinely needs to send messages back over the same connection at high frequency: chat with interrupts, collaborative editing, multiplayer gaming. SSE is the right answer when the workload is server→client only.`
						},
						{
							type: 'callout',
							title: 'The 2024-2026 CVE wave for WebSocket',
							text: '[[rfc:6455|RFC 6455]] itself has not changed. The ecosystem has. Major CVEs in major implementations: **CVE-2024-37890** in Node \`ws\`; **CVE-2025-10148** in libcurl reviving the very cache-poisoning attack masking was designed to prevent; **CVE-2025-43855** in tRPC; **CVE-2025-5399** in libcurl. \`gorilla/websocket\` was archived in late 2022 and unarchived under community maintenance; \`nhooyr/websocket\` was renamed to \`coder/websocket\` in 2024. The protocol is stable; the implementations are not.'
						},
						{
							type: 'narrative',
							title: 'WebTransport, and the Transport Future',
							text: `Both WebSocket and [[sse|SSE]] were designed for [[http1|HTTP/1.1]]. The [[http2|HTTP/2]] bootstraps for both ([[rfc:6455|RFC 8441]] for WebSocket, RFC 8442 for SSE) ship in Firefox 65+, Chrome, and major servers, but adoption is uneven (Mattermost documented Chrome 95+ failures behind HTTP/2 proxies that don't translate Extended CONNECT). The [[http3|HTTP/3]] bootstrap (RFC 9220) exists but is barely deployed.

The longer-term replacement is **{{webtransport|WebTransport}} over HTTP/3** — bidirectional streams + unreliable datagrams over [[quic|QUIC]], exposed to JavaScript as a Promise-based API. Chrome and Edge ship implementations as of 2026; Safari has no support; Firefox has limited support. WebTransport is interesting for *some* workloads (gaming, low-{{latency|latency}} bidirectional, datagrams for game state) but not a wholesale replacement for either WebSocket or SSE before 2027-2028.

The choice between WebSocket, SSE, and WebTransport for new projects in 2026 is rarely WebTransport. WebSocket if bidirectional. SSE if server→client only. The token-streaming use case has settled the SSE-versus-WebSocket debate decisively in favour of SSE for LLM workloads — and that is the workload reshaping the field.`
						}
					]
				},
				{ kind: 'protocol', id: 'websockets' },
				{ kind: 'protocol', id: 'sse' },
				{ kind: 'rfc', number: '6455' },
				{ kind: 'comparison', pairIds: ['websockets', 'sse'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'mcp-and-a2a',
			title: 'MCP and A2A',
			synopsis: 'The protocol layer for AI agents — built deliberately boring on top of [[json-rpc|JSON-RPC]], HTTP, and [[sse|SSE]].',
			slots: [
				{
					kind: 'pull-quote',
					text: 'For fifteen years after WebSockets in 2011, no genuinely new application protocol shipped. Then 2024 happened twice — [[mcp|MCP]] in November, [[a2a|A2A]] the following April.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Standard Way For Agents To Reach Tools',
							text: `Until 2024, an AI assistant that wanted to read your files, query your database, or call your APIs needed a custom integration per tool per assistant. Anthropic shipped Claude with file access, Cursor shipped with editor integration, every developer rebuilt the same plumbing. With N AI hosts and M tools, the industry was building **N×M bespoke connectors**. The combinatorics did not scale.

[[mcp|MCP]] — the **Model Context Protocol**, published by Anthropic on **25 November 2024** — collapses N×M to N+M. The premise: a tool server (filesystem, database, CRM, anything) speaks [[mcp|MCP]]; any MCP-aware client (Claude, Cursor, ChatGPT, your own agent) can use it. **Capability discovery, tool calling, prompt templates, and resources** are first-class concepts. The transport is **[[json-rpc|JSON-RPC]] 2.0** over either standard input/output for local tools or HTTP for remote ones.`
						},
						{
							type: 'narrative',
							title: 'The Transport Churn',
							text: `[[mcp|MCP]] shipped on 25 November 2024 with two transports:

- **stdio** — process-local, used for local MCP servers spawned as subprocesses by the host
- **HTTP+[[sse|SSE]]** — two endpoints (\`/sse\` for the long-lived server→client stream, \`/messages\` for client→server POSTs)

The two-endpoint HTTP+SSE design was awkward — clients had to maintain two connections, session affinity was hard, the resume story across reconnects was unspecified.

The **2025-03-26 MCP spec** replaced HTTP+SSE with **[[frontier:mcp-streamable-http|Streamable HTTP]]** — a single \`/mcp\` endpoint where POST responses can either be plain {{json|JSON}} or upgrade into an SSE stream depending on the \`Accept\` header. The old HTTP+SSE transport was explicitly deprecated. Major hosts (Atlassian Rovo, Keboola) set HTTP+SSE removal deadlines for mid-2026.

**SSE is not gone in MCP** — it is now an *optional response mode* of Streamable HTTP. WebSocket transport is **not** an official MCP transport as of May 2026, but **SEP-1288** (August 2025) is an active proposal to add one; the controversy is around how to convey \`Mcp-Session-Id\` (browser WebSocket APIs cannot read post-{{handshake|handshake}} headers) and authentication.`
						},
						{
							type: 'callout',
							title: 'Why JSON-RPC 2.0',
							text: 'Both [[mcp|MCP]] and [[a2a|A2A]] picked [[json-rpc|JSON-RPC]] 2.0 as their wire format — a 6-page spec. **The boringness is the point.** The Language Server Protocol uses [[json-rpc|JSON-RPC]]. Ethereum nodes use it. The Chrome DevTools Protocol uses it. Every editor tooling system from VS Code to Neovim speaks it. For a brand-new protocol layer where adoption is the existential risk, picking the lowest-overhead, highest-interoperability RPC format that already works in every language was the right move. [[mcp|MCP]] and [[a2a|A2A]] could have invented binary protocols with schemas; instead they let the message shape be a transport-level concern and put their innovation in **what** the messages mean.'
						},
						{
							type: 'narrative',
							title: 'A2A — Agent To Agent',
							text: `[[a2a|A2A]] — the **Agent2Agent Protocol**, published by Google on **9 April 2025** — handles the case [[mcp|MCP]] did not address: collaboration **between agents** rather than between an agent and a tool. Capability discovery, task delegation, asynchronous event streams, agent-to-agent authentication.

[[a2a|A2A]] runs at L7 over HTTP(S) over TCP/IP, like MCP. It uses **[[json-rpc|JSON-RPC]] 2.0 + HTTP(S) + [[sse|SSE]]** — explicitly not WebSocket. Custom HTTP headers like \`A2A-Version\` and \`A2A-Extensions\` carry control metadata. Authentication leans on **[[tls|TLS]] 1.3 + [[oauth2|OAuth]] 2.0** ([[rfc:8446|RFC 8446]] + RFC 6749) rather than defining its own scheme.

Both protocols moved into the **[[frontier:a2a-linux-foundation|Linux Foundation]] in mid-2025** — alongside MCP — signalling that both are now multi-vendor commons rather than single-company bets. As of 2026, MCP has thousands of public servers in the registry, native support across Claude, ChatGPT, Cursor, Windsurf, and most agent frameworks. A2A is supported by every major agent framework and is being adopted as the bridge between agent ecosystems.

These protocols are recognisably *internet*. They run over [[http3|HTTP/3]] when available. They use {{json|JSON}}-RPC for message framing. They lean on [[oauth2|OAuth 2.1]] for authentication. They are built by treating "an autonomous program that reasons" as a first-class network participant — the way the original web treated "a document on another machine" as a first-class participant. Whether they last, or get replaced by something better in five years, is the open question of the moment.`
						}
					]
				},
				{ kind: 'protocol', id: 'mcp' },
				{ kind: 'protocol', id: 'a2a' },
				{ kind: 'frontier', id: 'mcp-streamable-http' },
				{ kind: 'frontier', id: 'a2a-linux-foundation' },
				{ kind: 'simulation', protocolId: 'mcp' }
			]
		}
	]
};
