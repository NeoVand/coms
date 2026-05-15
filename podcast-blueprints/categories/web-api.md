---
id: web-api
type: category
name: Web / API
description: The protocols that power the web. From loading pages to real-time chat, these define how applications talk to servers and each other.
podcast_target_minutes: 30
protocols: [http1, http2, http3, websockets, grpc, graphql, sse, rest, mcp, a2a, json-rpc, soap]
related_pioneers: [tim-berners-lee, roy-fielding, mike-belshe, ian-hickson]
related_book_chapters:
  - 05-web-api/00-http1
  - 05-web-api/01-http2
  - 05-web-api/02-http3
  - 05-web-api/03-rest-and-graphql
  - 05-web-api/04-grpc
  - 05-web-api/05-websockets-and-sse
  - 05-web-api/06-mcp-and-a2a
related_outages: []
related_frontier: [post-quantum]
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/500px-First_Web_Server.jpg"
    caption: "The NeXT cube at CERN — the first web server and web browser, built by Tim Berners-Lee in 1990. The handwritten label reads 'This machine is a server. DO NOT POWER IT DOWN!!'"
    credit: "Photo: Coolcaesar / CC BY-SA 3.0, via Wikimedia Commons"
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ginevra%2C_centro_visitatori_del_cern%2C_primo_server_della_storia_%281989%29%2C_02.JPG/500px-Ginevra%2C_centro_visitatori_del_cern%2C_primo_server_della_storia_%281989%29%2C_02.JPG"
    caption: "Berners-Lee's 1989 proposal on display at CERN — the document his supervisor Mike Sendall marked 'Vague, but exciting.' It described HTTP, HTML, and URLs before any of them existed."
    credit: "Photo: Sailko / CC BY 3.0, via Wikimedia Commons"
visual_cues:
  - "A timeline running 1989 to 2026 with twelve pins. 1989 Berners-Lee proposal. 1991 first web page. 1996 RFC 1945 HTTP/1.0. 1997 RFC 2068 HTTP/1.1. 1998 SOAP. 2000 Fielding REST dissertation. 2009 Google starts SPDY. 2011 RFC 6455 WebSocket. 2015 RFC 7540 HTTP/2 plus GraphQL plus gRPC. 2022 RFC 9114 HTTP/3. 2024 MCP. 2025 A2A and Linux Foundation."
  - "Three columns side by side titled REST, GraphQL, gRPC. REST shows three GET arrows for users, posts, friends. GraphQL shows one curly-brace query returning user, posts, and friends in one shape. gRPC shows one binary call labelled GetUser protobuf. Caption: same data, three philosophies."
  - "A vertical-vs-horizontal diagram. At the top a user box. Three downward MCP arrows to database, GitHub, and Slack tools. Two horizontal A2A arrows to a Travel Agent and a Research Agent. Each agent has its own MCP arrows to flight, hotel, and web search tools. Caption: MCP wires agents to tools, A2A wires agents to each other."
  - "An HTTP family tree. HTTP/0.9 as a single one-line root. HTTP/1.0 as a small box adding headers and status codes. HTTP/1.1 as a workhorse box. HTTP/2 branching off in 2015 with binary frames and HPACK. HTTP/3 branching off in 2022 sitting on a QUIC pedestal instead of TCP. A faded SPDY arrow feeding into HTTP/2."
  - "A Cloudflare Radar style world map for HTTP/3 share by country in 2025. Georgia highlighted at 38 percent. Fifteen countries shaded above one third. Caption: the transport rewrite has already happened, most engineers haven't noticed."
  - "A CORS preflight flow. JavaScript fetch on the left. A diamond labelled simple request. Yes branch goes straight to the server with an Origin header. No branch goes through an OPTIONS preflight that asks is this allowed, then proceeds. The browser sits in the middle holding the gate."
  - "A Rapid Reset attack diagram. One client opening hundreds of HTTP/2 streams and immediately sending RST_STREAM frames. The server bookkeeping pile growing. A counter ticking past 398 million requests per second. Caption: every implementation followed the spec. The spec was the bug."
---

# Web / API

## In one breath

The Web/API family is the application layer everything else rides on — the protocols a browser, a phone, a microservice, or an AI agent uses to ask a server for something and get an answer back. Twelve members live here, from the original HTTP that Tim Berners-Lee wrote in 1989 to the Model Context Protocol that Anthropic shipped in November 2024. They handle pages, APIs, real-time channels, RPC, and now agent-to-agent calls. If you write software that touches a network, you spend most of your day inside one of them.

## The pitch

In March 1989, a physicist at CERN handed his manager a memo titled "Information Management: A Proposal." The manager wrote "Vague, but exciting" on the cover. The first version of the protocol it described had exactly one command — GET, slash, file name — and no headers, no status codes, nothing else. Thirty-six years later, every Slack message, every airline check-in, every AI assistant calling a database is still that protocol. It just has new clothes: HTTP/3, WebSockets, gRPC, GraphQL, and as of late 2024 a brand-new layer for AI agents. This episode is the family album.

## The arc

There is no single founding moment for this category. There is a thirty-five-year cascade of decisions, each one trying to fix the last layer's pain. We will walk it in five acts.

### A proposal that changed everything

March 1989, CERN, Geneva. Tim Berners-Lee writes a proposal describing a system of linked documents accessible over the network — the World Wide Web. His boss Mike Sendall marks it "Vague, but exciting." By Christmas 1990 Berners-Lee has, on a single NeXT cube, written the first browser-editor called WorldWideWeb, the first server called CERN httpd, and the first website. CERN releases the technology royalty-free on 30 April 1993. The protocol at the heart of it — HTTP/0.9 — never even gets an RFC. It's a single line: `GET /path` followed by carriage return and newline, the response is the raw HTML, the connection closes. That's it. That's the entire spec. There's a separate episode on Tim Berners-Lee for the full story, and the chapter on HTTP/1.x for how the protocol grew up.

### HTTP becomes a real protocol

RFC 1945 documents HTTP/1.0 in May 1996 — explicitly an informational RFC of common practice, not a standard. HTTP/1.1 lands as RFC 2068 in January 1997, gets revised as RFC 2616 in June 1999, gets split across RFC 7230 through 7235 in 2014, and finally gets re-consolidated as RFC 9110, 9111, and 9112 in June 2022. That last consolidation is what your stack actually implements today. The HTTP/1.x chapter walks through the headers, methods, status codes, persistent connections, and chunked transfer that turned a one-line protocol into the workhorse that ran the web for eighteen years.

### The XML decade and the REST counter-revolution

In 1998 Dave Winer ships XML-RPC. The same Microsoft circle — Don Box and colleagues — turns it into SOAP. SOAP 1.1 becomes a W3C Note in May 2000 and SOAP 1.2 a W3C Recommendation in June 2003. Around it grows the WS-* zoo: WS-Security, WS-Addressing, WS-ReliableMessaging. Enterprise integration formalises around XML envelopes and WSDL contracts. Then in 2000, a co-author of HTTP/1.1 named Roy Fielding submits his PhD dissertation at UC Irvine. Chapter 5 names and derives REST as a constraint set: client-server, stateless, cacheable, layered, uniform interface, code-on-demand. REST is not a protocol. It is a style applied on top of HTTP. The SOAP-versus-REST wars of 2003 to 2010 are largely won by REST plus JSON because the developer experience is dramatically lighter — though SOAP never dies inside finance, telco, and government. We come back to the SOAP-versus-REST argument in the chapter on REST and GraphQL.

### The real-time detour and the SPDY-to-HTTP/2 leap

The early 2000s web is request-response, click and wait. AJAX in 2005 introduces XMLHttpRequest. Comet — Alex Russell's 2006 umbrella term — covers HTTP-streaming, long-polling, BOSH, and Bayeux. They are all hacks that abuse HTTP to poll the server for updates. Ian Hickson specifies Server-Sent Events as part of the HTML5 work, and Opera ships an experimental implementation in September 2006. In 2009 Google announces SPDY internally. Mike Belshe and Roberto Peon's experiment — binary framing, multiplexing, header compression — ships in Chrome 6 in 2010. The IETF httpbis working group starts HTTP/2 in 2012 using SPDY as the base. In December 2011 Ian Fette finalises WebSocket as RFC 6455. HTTP/2 is published as RFC 7540 on 14 May 2015, later obsoleted by RFC 9113 in June 2022. The full story is in the HTTP/2 chapter and the WebSockets and SSE chapter.

### The 2015 big bang of API styles

Within months of each other, three API styles arrive. Google open-sources gRPC in March 2015, the next generation of an internal RPC system called Stubby that Google has run since around 2001. It uses HTTP/2, Protocol Buffers, and four call patterns including bidirectional streaming. Facebook open-sources GraphQL in summer 2015, formally announced by Lee Byron in September. It was built in 2012 by Lee Byron, Nick Schrock, and Dan Schafer for the iOS News Feed rewrite, originally codenamed SuperGraph. And JSON-RPC 2.0, formalised in 2010 and codified at jsonrpc.org, becomes the lightweight option that quietly powers Ethereum nodes, the Language Server Protocol, and — much later — both AI agent protocols. We cover these in the gRPC chapter and the REST and GraphQL chapter.

### QUIC and HTTP/3

Google's experimental gQUIC runs on its servers from 2012. The IETF QUIC working group charters in 2016. After more than thirty drafts, QUIC v1 ships as RFC 9000 in May 2021, with sibling RFCs 8999, 9001 for TLS integration, and 9002 for loss recovery. HTTP/3 is RFC 9114, June 2022. As of the Cloudflare 2025 Year-in-Review, fifteen countries or regions send more than a third of their requests over HTTP/3, with Georgia leading at 38%. HTTP/3 is supported by 95% or more of major browser installations and 34% or more of the top ten million sites. The HTTP/3 chapter goes deep on QUIC, connection migration, and 0-RTT.

### The AI protocol revolution

In November 2024 a deceptively simple problem comes to a head. Every AI application needs custom code for every integration. Connecting Claude to a database is a different project from connecting it to GitHub or Slack. An N-by-M matrix of bespoke integrations that does not scale. Anthropic's answer is the Model Context Protocol, open-sourced on 25 November 2024. It is a universal interface built on JSON-RPC 2.0 that lets any AI host discover and use any tool through a standard protocol. Within months, thousands of MCP servers exist. Then in April 2025, Google announces A2A — the Agent-to-Agent Protocol — at Cloud Next with fifty-plus partners. Where MCP is vertical, agent down to tools, A2A is horizontal, agent across to agent. A2A is donated to the Linux Foundation in June 2025, and in December 2025 Anthropic donates MCP to the Agentic AI Foundation, a Linux Foundation directed fund co-founded with OpenAI and Block. By 2026 both protocols sit under one open governance umbrella. The MCP and A2A chapter is where this story gets the full treatment.

### What the dead ends teach us

Some members died, and the deaths are instructive. SPDY served its purpose and was retired. WAP died with the smartphone. XML-RPC was subsumed by SOAP and then displaced by REST plus JSON. HTTP/2 server push — once the headline feature — was disabled by default in Chrome 106 in October 2022 and removed entirely from Firefox 132 in October 2024. WebSockets-over-SPDY was abandoned. The MCP HTTP+SSE transport from the November 2024 spec was already deprecated in March 2025 in favour of Streamable HTTP. The pattern is brutal and consistent. Every layer ossifies, gets a hack, gets a clean replacement, gets ossified again.

## The people

### Tim Berners-Lee

The inventor of the World Wide Web. At CERN in 1989 he wrote the proposal his manager called "Vague, but exciting." On a NeXT cube in 1990 he built the first browser, the first server, and the first website. He created HTTP, HTML, and URLs — the three pillars of the web — and persuaded CERN to release them royalty-free in 1993. There's a separate episode on him.

### Roy Fielding

A co-author of HTTP/1.1 and chairman of the Apache Software Foundation. His 2000 doctoral dissertation at UC Irvine, *Architectural Styles and the Design of Network-Based Software Architectures*, named and derived REST in Chapter 5. He also helped author RFC 2616, the practical HTTP/1.1 spec engineers worked from for fifteen years. Two of the most consequential documents in this category are his.

### Mike Belshe

Co-creator of SPDY at Google. Led the experiment — binary framing, multiplexing, header compression — that proved HTTP/1.1's limits could be broken without leaving the existing security model. SPDY shipped in Chrome 6 in 2010 and became the base of the IETF's HTTP/2 work. The chapter on HTTP/2 is largely his story.

### Roberto Peon

Co-creator of SPDY at Google and the inventor of HPACK, the header-compression algorithm that solved HTTP/1.1's repetitive-header bloat for HTTP/2. HPACK reduces header overhead by something like 85 to 90 percent on typical traffic.

### Ian Fette

The primary editor of the WebSocket protocol at Google, and the author of record for RFC 6455 in December 2011. His work is the reason browsers got a real full-duplex channel and the polling hacks of the Comet era could finally die.

### Ian Hickson

The creator of Server-Sent Events. He defined SSE as part of the HTML5 work at WHATWG; Opera shipped the first implementation in September 2006. The EventSource API he designed now lives inside the WHATWG HTML Living Standard. There's a separate episode on him.

### Lee Byron

The creator of GraphQL. Primary designer and evangelist at Facebook, he led the open-source release in 2015 and the formal announcement that September. He also led the GraphQL Foundation that took the project independent.

### Dan Schafer

Co-creator of GraphQL at Facebook. Co-designed the type system and query execution model that solved the mobile data-fetching problem the iOS News Feed rewrite was choking on.

### Nick Schrock

Co-creator of GraphQL at Facebook. Led the team that built it for Facebook's mobile applications during 2012's SuperGraph project and shepherded it from internal tool to public protocol.

### Louis Ryan

Technical lead for gRPC at Google. Took the internal Stubby system — Google's RPC framework since around 2001, handling billions of requests per day — and turned it into the open-source gRPC released in March 2015.

## The protocols (a guided tour)

### HTTP/1.1 — HyperText Transfer Protocol

The original language of the web — text-based, one request-response per connection, with optional pipelining nobody enables, and persistent connections via `Connection: keep-alive`. First standardised in RFC 2068 in January 1997, revised in RFC 2616 in 1999, and now consolidated as RFC 9110 for semantics, 9111 for caching, and 9112 for message syntax — all published June 2022. Reach for it as the universal lowest common denominator: every CDN, proxy, IoT device, and thirty-year-old printer speaks it. The HTTP/1.1 episode is the deep dive.

### HTTP/2 — HyperText Transfer Protocol 2

RFC 7540 in May 2015, obsoleted by RFC 9113 in June 2022. A binary framing layer over a single TCP connection, multiplexing many streams, with HPACK header compression and stream prioritisation. Reach for it for browser-to-server traffic when you control the stack and want concurrency without the connection-per-request tax of HTTP/1.1. Server push is officially in the spec but practically dead. The HTTP/2 episode is the deep dive.

### HTTP/3 — HyperText Transfer Protocol 3

RFC 9114 in June 2022. Runs on QUIC instead of TCP. Eliminates TCP head-of-line blocking, has 0-RTT or 1-RTT connection setup, and supports connection migration — your phone changes from Wi-Fi to cellular without dropping the connection. As of the Cloudflare 2025 Year-in-Review, fifteen countries send more than a third of their requests over HTTP/3, Georgia at 38%. Reach for it whenever your CDN supports it, which it does. It is free latency on lossy mobile networks. The HTTP/3 episode goes deep, and the QUIC episode covers the transport underneath.

### WS — WebSocket Protocol

RFC 6455, December 2011, edited by Ian Fette. A full-duplex, message-framed, persistent connection upgraded from HTTP via the `Upgrade: websocket` header. Reach for it when both sides need to push at low latency: chat, multiplayer games, collaborative editors, live dashboards, trading. Historically the only browser API for true bi-directional streaming. The WebSockets episode is the deep dive.

### gRPC — gRPC Remote Procedure Calls

Open-sourced by Google in March 2015, after running internally as Stubby since roughly 2001. Built on HTTP/2 plus Protocol Buffers — a typed, code-generated, compact binary IDL. Four call patterns: unary, server-streaming, client-streaming, bidirectional. Reach for it for internal service-to-service traffic in polyglot microservice systems where schema, performance, and streaming matter. Native browser use is impossible because browsers cannot access HTTP/2 trailers; that's why gRPC-Web and now Connect-RPC exist. The gRPC episode is the deep dive.

### GraphQL — Graph Query Language

A query language and runtime, not a protocol — typically transported over HTTP POST. Built at Facebook in 2012 by Lee Byron, Nick Schrock, and Dan Schafer for the iOS News Feed rewrite, codenamed SuperGraph. Open-sourced in 2015. Clients ask for exactly the fields they want; the server resolves a strongly-typed schema. Solves over-fetch and under-fetch and the backend-for-frontend problem. Reach for it when many clients consume different shapes of the same domain. The GraphQL episode is the deep dive.

### SSE — Server-Sent Events

First specified by Ian Hickson at WHATWG, shipped experimentally in Opera in September 2006, and now living inside the WHATWG HTML Living Standard. MIME type `text/event-stream`, lines of `data:`, `event:`, and `id:`, automatic reconnection with `Last-Event-ID`. Reach for it for one-way server-to-client streams: live tickers, AI token streaming, log tailing — when you don't need full duplex. OpenAI's streaming chat completions are what made SSE a default UX for AI products. The SSE episode is the deep dive.

### REST — Representational State Transfer

Roy Fielding's PhD dissertation, UC Irvine, 2000. An architectural style, not a protocol — but in practice "REST API" has come to mean JSON-over-HTTP with resource-shaped URLs and HTTP verbs. Reach for it as the default for public APIs. Note that the vast majority of so-called REST APIs are not RESTful in Fielding's strict sense; they fail his hypermedia-as-the-engine-of-application-state constraint. The REST episode is the deep dive.

### MCP — Model Context Protocol

Anthropic, 25 November 2024. An open standard for connecting LLM applications — hosts like Claude Desktop, ChatGPT, Cursor, Windsurf — to external tools and data, called servers. Solves the N-by-M integration problem. Wire protocol is JSON-RPC 2.0 over either stdio for local subprocesses or Streamable HTTP for remote. Five primitives in the latest spec: tools, resources, prompts, sampling, roots. The latest spec adds OAuth 2.1 with PKCE, dynamic client registration, and Resource Indicators per RFC 8707 to scope tokens to a server's canonical URI. Donated to the Agentic AI Foundation under the Linux Foundation in December 2025. The MCP episode is the deep dive.

### A2A — Agent-to-Agent Protocol

Google, unveiled at Cloud Next on 9 April 2025 with fifty-plus partners. An open communication protocol for collaboration between autonomous agents — the layer above tools — built on HTTP and JSON-RPC. Version 0.3 in July 2025 added gRPC support and signed Agent Cards. Donated to the Linux Foundation in June 2025. MCP and A2A are explicitly designed as complementary: MCP wires an agent to its tools and data, A2A wires agents to each other. The A2A episode is the deep dive.

### JSON-RPC — JSON Remote Procedure Call

JSON-RPC 1.0 dates from 2005; JSON-RPC 2.0 — the version everyone actually uses — was specified in 2010 and is the official current spec at jsonrpc.org. A tiny, transport-agnostic envelope: `jsonrpc`, `method`, `params`, `id`. Notifications omit the id and the server must not reply. Used directly in Ethereum and blockchain nodes, the Language Server Protocol, MCP, and A2A. Reach for it when you want RPC semantics with zero ceremony, especially over WebSockets or stdio. The JSON-RPC episode is the deep dive.

### SOAP

The acronym was retired in version 1.2 — it now just means SOAP. SOAP 1.1 became a W3C Note in May 2000; SOAP 1.2 became a W3C Recommendation in June 2003. Heavyweight, XML-based, with envelope-header-body structure and a fleet of WS-* extensions for security, transactions, and addressing. Reach for it only inside legacy enterprise, finance, telco, government, or healthcare integrations — and even there it is being slowly displaced. SOAP 1.2 has had no substantive update since 2007. The SOAP episode is the deep dive.

## Advanced topics (from the deep-dive)

### HTTP caching in depth

Caching is the single most impactful performance optimisation in the HTTP stack, and the Cache-Control header drives all of it. `max-age=3600` means the response is fresh for 3600 seconds. `no-cache` means always revalidate with the server. `no-store` means never store this response. `private` versus `public` controls whether CDNs and shared proxies can cache. Conditional requests let clients avoid re-downloading unchanged resources: the server sends an ETag — a content fingerprint — or `Last-Modified`; the client sends `If-None-Match` or `If-Modified-Since`; if nothing has changed, the server replies 304 Not Modified with no body. The modern gem is `stale-while-revalidate` from RFC 5861: serve the stale cached version immediately, asynchronously check for updates. Combined with CDNs, this pattern delivers sub-10-millisecond response times globally.

### CORS mechanics

Cross-Origin Resource Sharing is the browser's security mechanism for controlling cross-origin HTTP requests. When JavaScript on example.com tries to fetch from api.other.com, the browser intervenes. Simple requests — GET or POST with standard headers — go directly with an Origin header; the server replies `Access-Control-Allow-Origin`, and if it matches the browser exposes the response to JavaScript. Anything more — custom headers, PUT or DELETE, non-standard Content-Types — triggers a preflight: the browser sends an OPTIONS request first asking "is this allowed?" and the server replies with allowed methods, headers, and credentials policy. The preflight result is cached via `Access-Control-Max-Age`. Misconfigured CORS is one of the most common sources of frustration in web development. Overly permissive — `Allow-Origin: *` — is a security risk. Overly restrictive blocks legitimate integrations.

### HPACK and QPACK header compression

HTTP headers are repetitive — Cookie, User-Agent, Accept, and dozens of others are sent identically on every request. HTTP/2's HPACK reduces header overhead by 85 to 90%. HPACK maintains a dynamic table shared between client and server: previously-seen header pairs are referenced by index instead of retransmitted. A static table of 61 common headers is pre-populated. Huffman coding compresses literal values further. HTTP/3 cannot use HPACK because it requires in-order delivery, and QUIC streams arrive independently. QPACK solves this with a separate, unidirectional stream for table updates so header blocks can be decoded out of order — eliminating head-of-line blocking in header decompression. This matters because HTTP/2 over TCP still suffers from transport-layer head-of-line blocking; HTTP/3 over QUIC fixes it end-to-end, and QPACK ensures the headers don't reintroduce it.

### JSON-RPC 2.0 — the universal wire format

JSON-RPC 2.0 is deceptively simple: four message types — request, response, error, notification — and a handful of rules. That simplicity is the power. Every request carries an `id` field that the server echoes back in the response, enabling correlation on any transport, even ones that deliver messages out of order. Notifications omit the id entirely; the server must not reply, and that's a protocol rule, not a convention. Batch requests are a killer feature: a client bundles multiple independent calls into a single HTTP POST, the server returns an array of results, and the id fields handle correlation. Error codes follow a convention: -32700 for parse error, -32600 for invalid request, -32601 for method not found, -32602 for invalid params, -32603 for internal error. The range -32768 to -32000 is reserved for the spec; applications define their own codes outside it.

### MCP architecture — hosts, clients, and servers

MCP has three layers people often conflate. The *host* is the AI application the user interacts with — Claude Desktop, Cursor, VS Code. It manages user consent, enforces security policies, and decides which servers to connect to. The host creates one *client* per server connection. Each client maintains an independent session with exactly one *server* — strict 1:1. Servers expose three primitives: tools (model-controlled actions like "run SQL query"), resources (application-controlled data like "contents of file X"), and prompts (user-controlled templates). The session lifecycle is strict: the client sends `initialize` with its capabilities, the server responds with its capabilities and protocol version, then the client sends an `initialized` notification. Only after that three-step handshake can tools be listed, resources read, or prompts invoked. Transport is pluggable — stdio for local subprocesses, Streamable HTTP for remote — and the same JSON-RPC messages work identically over either.

### A2A — agent discovery and task delegation

A2A solves a different problem: not "how does an agent use a tool" but "how does one agent find and delegate work to another agent it has never interacted with?" Discovery centres on the Agent Card — a JSON document served at `/.well-known/agent.json` declaring the agent's name, description, supported skills, authentication requirements, and A2A endpoint URL. A client agent fetches the card, inspects the skills, and decides whether this remote agent can help. Analogous to how DNS TXT records or OAuth discovery documents work — a well-known URL that bootstraps trust. The interaction model is task-based with a lifecycle: `submitted → working → input-required → completed`, or `failed` or `canceled`. The `input-required` state is what makes A2A conversational: the remote agent can ask for clarification before proceeding. For long-running tasks, the client adds `Accept: text/event-stream` and the server streams back status updates and artifacts as Server-Sent Events, each event carrying a full JSON-RPC response.

### MCP plus A2A — the two-protocol pattern

In production, MCP and A2A are almost always used together. The pattern is consistent: A2A for inter-agent coordination, MCP for each agent's internal tool access. Consider a travel booking system. A coordinator agent receives "book me a trip to Tokyo." It uses A2A to discover and delegate to a flight agent, a hotel agent, and a car rental agent. Each specialist uses MCP internally to reach its own tools — the flight agent's MCP servers talk to airline APIs, fare databases, and seat maps. The coordinator does not know or care about those internal tools; it sees only A2A task results. Both protocols chose JSON-RPC 2.0 for the same reasons: transport independence, built-in request correlation via id fields, first-class notifications, and batch support. Both use SSE for server-to-client streaming. Both moved to the Linux Foundation. The architectural insight: MCP is like a function call — execute this tool with these parameters and return the result. A2A is like a work order — here is what I need done; figure out how to do it and get back to me.

### Failure mode of the decade — HTTP/2 Rapid Reset

HTTP/2 was designed to be everything HTTP/1.1 wasn't: multiplexed, binary, fast. One feature was elegant: a client could cancel a stream at any time by sending a `RST_STREAM` frame, freeing the server. By 2023 every CDN, every load balancer, every gRPC server in the world implemented it. Nobody read the implications carefully enough. RFC 9113 limits *concurrent* streams via `SETTINGS_MAX_CONCURRENT_STREAMS`, but it does not limit *cancelled* streams. A client could open a stream, cancel it before the server even finished bookkeeping, open another, cancel that, and so on — burning unlimited server CPU for almost zero client cost. Beginning in August 2023 attackers used this against the world's largest properties. Google absorbed an attack peaking at 398 million requests per second — seven times bigger than any prior recorded HTTP DDoS. Cloudflare saw 201 Mrps. AWS saw 155 Mrps. Every modern web server — nginx, Envoy, Netty, Go's `net/http`, IIS — was vulnerable. Only HAProxy, by accident of a 2018 design choice, was immune. Disclosure was coordinated on 10 October 2023 as CVE-2023-44487. The protocol was correct. The implementations were correct. The interaction between them was not. That is the perennial story of this entire family.

## Recurring themes

The first recurring theme is **text on the wire versus binary framing**. HTTP/1.1, JSON-RPC, REST, GraphQL, and SOAP are all text-on-the-wire — debuggable with `curl`, slower to parse, larger over the network. HTTP/2, HTTP/3, gRPC, and WebSocket-binary are framed — opaque to humans, fast to machines, and cheap to multiplex. Every generational leap in this family is a move from text toward frames, except where the cost of debuggability outweighs the bytes. SSE quietly bucks the trend by going back to text and winning, because token streaming and log tailing don't need binary efficiency.

The second is **the head-of-line blocking saga**. HTTP/1.1 has it at the request level — one slow response stalls the connection. HTTP/2 fixes it at the HTTP layer, but TCP reintroduces it at the transport layer because a single lost packet stalls all multiplexed streams. HTTP/3 over QUIC finally fixes it end-to-end. QPACK exists specifically so header decompression doesn't sneak the problem back in. Every layer in this family has fought the same fight at a different altitude.

The third is **the integration matrix**. SOAP tried to solve it with WS-* extensions and WSDL contracts. REST collapsed it by reusing HTTP itself. GraphQL collapsed it again by giving every client one endpoint and a typed schema. MCP collapsed it for AI tools by turning N-by-M custom integrations into N-plus-M standardised servers. Every successful protocol in this family makes a previously combinatorial problem additive. That is the test of whether the protocol matters.

The fourth is **request-response correlation**. JSON-RPC's `id`, gRPC's stream IDs, HTTP/2's stream IDs, MCP's `id` — every modern protocol in the family has the same field, and it is the single most useful debugging field in any of them. Heartbeats, sliding windows, content negotiation, ETags, idempotency keys, retries with jittered backoff, rate limiting, circuit breakers — these are the patterns that show up at every layer because the failure modes do too. Connection storms and retry storms are how a downstream blip becomes a multi-hour outage. Slack's 22 February 2022 incident — a Consul agent restart, a cache-warmth collapse during morning peak, and millions of WebSocket clients all rebooting at once — is the textbook case.

## Where this connects in the book

- **The HTTP/1.1 chapter** — how a one-line protocol grew headers, methods, status codes, and persistent connections, and why RFC 9110 in 2022 finally cleaned it up.
- **The HTTP/2 chapter** — Mike Belshe and Roberto Peon's SPDY experiment at Google, binary framing and HPACK, and the May 2015 standardisation.
- **The HTTP/3 chapter** — the move from TCP to QUIC, 0-RTT setup, connection migration, and the geographic adoption picture as of 2025.
- **The REST and GraphQL chapter** — Roy Fielding's dissertation and the SOAP-versus-REST wars, then the 2015 GraphQL release at Facebook.
- **The gRPC chapter** — Stubby's twenty-year run inside Google, Protocol Buffers, and the four streaming patterns that ship in March 2015.
- **The WebSockets and SSE chapter** — Comet, Ian Hickson's SSE, RFC 6455 in December 2011, and why each won different use cases.
- **The MCP and A2A chapter** — the seventeen-month arc from Anthropic's 25 November 2024 release through Google's April 2025 announcement to the Linux Foundation governance landing in late 2025.

## See also (other category episodes)

The Transport episode is the layer below this one. TCP and UDP and QUIC are what HTTP and WebSocket and gRPC ride on, and the QUIC episode in particular is the prerequisite for understanding HTTP/3. If you only listen to one neighbouring category, make it that one.

The Real-time A/V episode is the sibling. RTP, SIP, and WebRTC solve a related problem — moving audio and video between endpoints in real time — with different constraints than chat and APIs. WebRTC data channels in particular live at the boundary between the two categories, and WebTransport is starting to compete for media transport from the Web/API side.

The Utilities and Security episode covers what sits underneath everything in this family: TLS for encryption, OAuth 2.1 and JWT for authorization, and DNS for name resolution. Broken DNS is the most common cascading failure in the whole stack, and OAuth 2.1's Resource Indicators are exactly what MCP's June 2025 spec update added to prevent token leakage. The post-quantum-TLS work being tracked on the Frontier page is what will reshape this whole family by 2030.

## Visual cues for image generation

- A timeline running 1989 to 2026 with twelve pins. 1989 Berners-Lee proposal. 1991 first web page. 1996 RFC 1945 HTTP/1.0. 1997 RFC 2068 HTTP/1.1. 1998 SOAP. 2000 Fielding REST dissertation. 2009 Google starts SPDY. 2011 RFC 6455 WebSocket. 2015 RFC 7540 HTTP/2 plus GraphQL plus gRPC. 2022 RFC 9114 HTTP/3. 2024 MCP. 2025 A2A plus Linux Foundation.
- Three columns side by side titled REST, GraphQL, gRPC. REST shows three GET arrows for users, posts, friends. GraphQL shows one curly-brace query returning user, posts, and friends in one shape. gRPC shows one binary call labelled GetUser protobuf. Caption: same data, three philosophies.
- A vertical-versus-horizontal diagram. At the top a user box. Three downward MCP arrows to database, GitHub, and Slack tools. Two horizontal A2A arrows to a Travel Agent and a Research Agent. Each agent has its own MCP arrows to flight, hotel, and web search tools. Caption: MCP wires agents to tools, A2A wires agents to each other.
- An HTTP family tree. HTTP/0.9 as a single one-line root. HTTP/1.0 as a small box adding headers and status codes. HTTP/1.1 as a workhorse box. HTTP/2 branching off in 2015 with binary frames and HPACK. HTTP/3 branching off in 2022 sitting on a QUIC pedestal instead of TCP. A faded SPDY arrow feeding into HTTP/2.
- A Cloudflare Radar style world map for HTTP/3 share by country in 2025. Georgia highlighted at 38 percent. Fifteen countries shaded above one third. Caption: the transport rewrite has already happened, most engineers haven't noticed.
- A CORS preflight flow. JavaScript fetch on the left. A diamond labelled simple request. The yes branch goes straight to the server with an Origin header. The no branch goes through an OPTIONS preflight that asks "is this allowed?" then proceeds. The browser sits in the middle holding the gate.
- A Rapid Reset attack diagram. One client opening hundreds of HTTP/2 streams and immediately sending RST_STREAM frames. The server bookkeeping pile growing. A counter ticking past 398 million requests per second. Caption: every implementation followed the spec. The spec was the bug.

## Sources

### RFCs

- [RFC 9110 — HTTP Semantics, June 2022](https://datatracker.ietf.org/doc/rfc9110/)
- [RFC 9113 — HTTP/2, June 2022](https://www.rfc-editor.org/rfc/rfc9113.html)
- [RFC 9000 — QUIC v1, May 2021](https://datatracker.ietf.org/doc/rfc9000/)
- [RFC 6455 — The WebSocket Protocol, December 2011](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8446 — TLS 1.3, August 2018](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 8259 — JSON, December 2017](https://datatracker.ietf.org/doc/html/rfc8259)
- [RFC 1122 — Requirements for Internet Hosts](https://datatracker.ietf.org/doc/html/rfc1122)
- [draft-ietf-oauth-v2-1 — OAuth 2.1, March 2026](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [draft-ietf-webtrans-http3 — WebTransport over HTTP/3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)
- [draft-schinazi-masque-proxy](https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/)
- [draft-ietf-masque-connect-ethernet](https://datatracker.ietf.org/doc/draft-ietf-masque-connect-ethernet/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Transports — 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [WHATWG HTML Living Standard — Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [W3C WebTransport](https://www.w3.org/TR/webtransport/)

### Papers and dissertations

- [Roy Fielding — Architectural Styles, UC Irvine 2000](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [Fielding dissertation, Chapter 5 (REST)](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [Fielding dissertation full PDF](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)
- [Mirror of Fielding REST chapter](https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm)
- [Trevisan et al. — Measuring HTTP/3, IEEE 2021](https://ieeexplore.ieee.org/document/9501274)
- [Chen et al. — RFC 9000 and its Siblings, TUM 2024](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf)
- [Al Alamin et al. — GraphQL Adoption and Challenges, arXiv 2408.08363](https://arxiv.org/html/2408.08363v1)

### Vendor and engineering blogs

- [Cloudflare blog](https://blog.cloudflare.com/)
- [Cloudflare — HTTP/2 Rapid Reset technical breakdown](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
- [Cloudflare — Automatically secure (PQ TLS)](https://blog.cloudflare.com/automatically-secure/)
- [Cloudflare — Post-quantum zero trust](https://blog.cloudflare.com/post-quantum-zero-trust/)
- [Cloudflare — HTTP/3 usage one year on](https://blog.cloudflare.com/http3-usage-one-year-on/)
- [Cloudflare Radar — Year in Review 2025](https://radar.cloudflare.com/year-in-review/2025)
- [Cloudflare Radar live](https://radar.cloudflare.com/)
- [Slack engineering — Slack's incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/)
- [Fastly — QUIC is now RFC 9000](https://www.fastly.com/blog/quic-is-now-rfc-9000)
- [Buf — Connect, a better gRPC](https://buf.build/blog/connect-a-better-grpc)
- [Buf — Connect-RPC joins CNCF](https://buf.build/blog/connect-rpc-joins-cncf)
- [Buf blog](https://buf.build/blog/)
- [Connect-RPC connect-go](https://github.com/connectrpc/connect-go)
- [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks)
- [AsyncAPI specification](https://github.com/asyncapi/spec)
- [AsyncAPI — Pub/sub semantics](https://www.asyncapi.com/blog/publish-subscribe-semantics)
- [Anthropic — Model Context Protocol announcement](https://www.anthropic.com/news/model-context-protocol)
- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Skilljar (Academy)](https://anthropic.skilljar.com/)
- [Google Cloud — A2A is getting an upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [Google Developers — A2A: a new era of agent interoperability](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Linux Foundation — A2A Project launch](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Engineering at Meta — GraphQL announcement, 2015](https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/)
- [GraphQL — release post, 2015](https://graphql.org/blog/2015-09-14-graphql/)
- [Lee Byron — GraphQL Foundation](https://medium.com/@leeb/introducing-the-graphql-foundation-3235d8186d6d)
- [grpc.io — about](https://grpc.io/about/)
- [gRPC.io content source](https://github.com/grpc/grpc.io/blob/main/content/en/about/_index.md)
- [Google Developers — HTTP/2 fundamentals](https://developers.google.com/web/fundamentals/performance/http2/)
- [Chrome — Removing HTTP/2 push](https://developer.chrome.com/blog/removing-push)
- [HAProxy — not affected by Rapid Reset](https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487)
- [Cisco — Rapid Reset advisory](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-http2-reset-d8Kf32vZ)
- [Qualys — Rapid Reset analysis](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
- [WunderGraph — exploring GraphQL adoption in 2024](https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption)
- [Pento — A year of MCP, 2025 review](https://www.pento.ai/blog/a-year-of-mcp-2025-review)
- [Zylos — MCP Streamable HTTP enterprise adoption](https://zylos.ai/research/2026-03-08-mcp-remote-evolution-streamable-http-enterprise-adoption)
- [Digital Applied — MCP adoption statistics 2026](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)
- [websocket.org — road to WebSockets](https://websocket.org/guides/road-to-websockets/)
- [Internet Society Pulse — Why HTTP/3 is eating the world](https://pulse.internetsociety.org/blog/why-http-3-is-eating-the-world)
- [Stack Overflow blog — auth in MCP](https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/)
- [Zhul — HTTP/2 server push obsolete](https://zhul.in/en/2025/11/05/http-2-server-push-is-practically-obsolete/)
- [HPBN — brief history of HTTP](https://hpbn.co/brief-history-of-http/)
- [HPBN homepage](https://hpbn.co/)
- [HTTP/3 explained](https://http3-explained.haxx.se/)
- [http.dev — HTTP/0.9](https://http.dev/0.9)
- [Stanford CS144](https://cs144.github.io/)
- [Stanford CS144 catalog](https://online.stanford.edu/courses/cs144-introduction-computer-networking)
- [curl](https://curl.se/)
- [qvis QUIC visualisation](https://qvis.quictools.info/)

### News and analysis

- [The New Stack — Why MCP won](https://thenewstack.io/why-the-model-context-protocol-won/)
- [The New Stack — GraphQL growth and federation](https://thenewstack.io/graphql-growth-explodes-but-so-do-problems-federated-graphs-solve/)
- [Platform Engineering — A2A unveiled at Cloud Next](https://platformengineering.com/editorial-calendar/best-of-2025/google-cloud-unveils-agent2agent-protocol-a-new-standard-for-ai-agent-interoperability-2/)
- [IBM — Agent2Agent Protocol explainer](https://www.ibm.com/think/topics/agent2agent-protocol)
- [CISA — CVE-2023-44487 advisory](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
- [CERN Courier — 20th birthday of the web](https://cerncourier.com/a/happy-20th-birthday-world-wide-web/)
- [CERN — birth of the web](https://home.cern/science/computing/birth-web)
- [CERN — short history of the web](https://home.cern/science/computing/birth-web/short-history-web)
- [DEV Community — history of HTTP in under 5 minutes](https://dev.to/andreasbergstrom/the-history-of-http-in-under-5-minutes-4b7p)
- [Lakin Mohapatra — evolution of HTTP](https://lakin-mohapatra.medium.com/the-evolution-of-http-from-http-0-9-to-http-3-and-beyond-5f3afc2786c2)
- [W3C IETF HTTP-WG list note](https://lists.w3.org/Archives/Public/ietf-http-wg/2022AprJun/0132.html)
- [W3C WebTransport meetings](https://www.w3.org/wiki/WebTransport/Meetings2023)
- [OAuth.net — OAuth 2.1](https://oauth.net/2.1/)
- [A2A Protocol — official site](https://a2a-protocol.org/latest/)
- [LinkedIn — GraphQL APIs in 2024](https://www.linkedin.com/pulse/exploring-continued-relevance-graphql-apis-2024-insights-rafael-rocha-zpbcf)
- [Blog by FKA — what happened to Google's A2A](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/)
- [xml.com — SOAP, 2001](https://www.xml.com/pub/a/ws/2001/04/04/soap.html)
- [IETF MASQUE proxy draft mirror](https://www.ietf.org/archive/id/draft-schinazi-masque-proxy-04.html)
- [IETF RFC 9000 sandbox](https://sandbox-cf.ietf.org/doc/rfc9000/)
- [RFC 6455 mirror at IETF](https://datatracker.ietf.org/doc/html/rfc6455.html)

### Wikipedia

- [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)
- [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- [SPDY](https://en.wikipedia.org/wiki/SPDY)
- [Server-sent events](https://en.wikipedia.org/wiki/Server-sent_events)
- [SOAP](https://en.wikipedia.org/wiki/SOAP)
- [gRPC](https://en.wikipedia.org/wiki/GRPC)
- [Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [2024 CrowdStrike-related IT outages](https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages)
- [HandWiki — SOAP](https://handwiki.org/wiki/SOAP)
- [Grokipedia — SPDY](https://grokipedia.com/page/SPDY)
