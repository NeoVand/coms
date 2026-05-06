---
prompt_source: deep-research-prompts.txt:351-525 (WEB / API)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/17f1ca35-10cc-4186-a496-1d310c860703
research_mode: claude.ai Research
---

# The Web/API Protocol Family: A Field Guide for 2026

> A research report on the protocols that move bytes between browsers, servers, mobile apps, microservices, and — as of 2024 — AI agents. Written May 2026.

---

## Prerequisites and glossary

These are the cross-cutting concepts you need before any single member of this family makes sense. They span every protocol in the report.

- **Client–server model.** A *client* initiates a request; a *server* listens and responds. Most Web/API protocols inherit this asymmetry from HTTP, which inherited it from the original World Wide Web design at CERN in 1989–1991. ([https://home.cern/science/computing/birth-web](https://home.cern/science/computing/birth-web))
- **OSI / TCP-IP layering.** A 7-layer reference model that separates physical links, internetworking (IP), transport (TCP/UDP/QUIC), and application (HTTP, gRPC, WebSocket). The Web/API family lives at the application layer, sitting on top of transport and security layers. ([https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122))
- **TCP vs UDP vs QUIC.** *TCP* is a reliable, ordered, byte-stream transport (RFC 9293). *UDP* is unreliable and connectionless. *QUIC* is a modern, encrypted, stream-multiplexed transport built on UDP, standardised as RFC 9000 in May 2021, which underpins HTTP/3. ([https://datatracker.ietf.org/doc/rfc9000/](https://datatracker.ietf.org/doc/rfc9000/)) [Ietf](https://sandbox-cf.ietf.org/doc/rfc9000/)
- **TLS (Transport Layer Security).** Cryptographic envelope for application traffic. Current baseline is TLS 1.3 (RFC 8446, 2018); QUIC bakes TLS 1.3 directly into the transport (RFC 9001). ([https://datatracker.ietf.org/doc/html/rfc8446](https://datatracker.ietf.org/doc/html/rfc8446))
- **URI / URL.** Uniform Resource Identifiers (RFC 3986) name resources; URLs locate them. The `http`/`https` URI schemes are defined in RFC 9110 §4.2. ([https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/))
- **Statelessness.** Each request carries enough information to be understood without reference to prior requests. Roy Fielding makes statelessness a constraint of REST (Chapter 5 of his 2000 dissertation). ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm))
- **Idempotency.** Repeating a request produces the same effect. GET, PUT, DELETE are nominally idempotent; POST is not (RFC 9110 §9.2.2). Idempotency keys are a discipline added on top, popularised by Stripe’s API.
- **Content negotiation.** Client and server agree on representation (JSON, XML, HTML, Protocol Buffers) via `Accept`/`Content-Type` headers (RFC 9110 §12).
- **Multiplexing.** Carrying multiple logical streams over one connection — fundamental to HTTP/2 framing, HTTP/3, gRPC, and WebTransport. Without it you get the "head-of-line blocking" problem. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))
- **Head-of-line (HOL) blocking.** A stalled message blocks everything behind it. HTTP/1.1 has it at the request level; HTTP/2 fixes it at the HTTP layer but TCP reintroduces it at the transport layer; HTTP/3/QUIC fixes it end-to-end. ([https://blog.cloudflare.com/http3-usage-one-year-on/](https://blog.cloudflare.com/http3-usage-one-year-on/))
- **Framing.** Putting structure on a byte stream — length prefixes, opcodes, flags. HTTP/2, WebSocket, and gRPC all define their own frame formats.
- **JSON.** RFC 8259 — the lingua franca of modern web APIs. Every protocol we discuss either uses it natively (REST, GraphQL, JSON-RPC, MCP, A2A) or interoperates with it. ([https://datatracker.ietf.org/doc/html/rfc8259](https://datatracker.ietf.org/doc/html/rfc8259))
- **JSON-RPC 2.0.** A minimalist remote-procedure-call envelope over JSON: `jsonrpc`, `method`, `params`, `id`. Used directly by Ethereum nodes, MCP, and A2A. ([https://www.jsonrpc.org/specification](https://www.jsonrpc.org/specification))
- **RPC vs REST vs query.** *RPC* models calls as functions ("`subtract(42, 23)`"). *REST* models them as state transitions on resources ("`GET /accounts/42`"). *Query* (GraphQL) models them as a question against a typed graph.
- **OAuth 2.0 / 2.1, JWT.** OAuth 2.1 is an in-progress consolidation of OAuth 2.0 with PKCE mandatory and the implicit grant removed; the latest draft is `draft-ietf-oauth-v2-1-15` (March 2026). ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) [OAuth](https://oauth.net/2.1/)[IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- **ALPN.** Application-Layer Protocol Negotiation (RFC 7301), the TLS extension that lets a client and server agree on `h2`, `h3`, or `http/1.1` during the TLS handshake. The reason your browser silently picks HTTP/2 or HTTP/3.
- **CORS, same-origin policy.** Browser security model that controls which other origins can call your API and read the response. Critical context for WebSockets, fetch, GraphQL, and MCP-over-HTTP.

---

## The arc of the group

There is no single founding moment; there is a 35-year cascade of decisions, each one trying to fix the last layer's pain.

**1989–1991 — The CERN moment.** Tim Berners-Lee submits "Information Management: A Proposal" to his manager Mike Sendall on 12 March 1989 ("Vague but exciting"). By Christmas 1990 Berners-Lee has, on a NeXT cube, written the first browser/editor (`WorldWideWeb`), the first server (`CERN httpd`), and the first website. CERN releases the technology royalty-free on 30 April 1993. ([https://home.cern/science/computing/birth-web/short-history-web](https://home.cern/science/computing/birth-web/short-history-web)) HTTP/0.9 — never even an RFC, "the one-line protocol" — is `GET /path\r\n`, response is the raw HTML, connection closes. ([https://http.dev/0.9](https://http.dev/0.9)) [CERN Courier + 2](https://cerncourier.com/a/happy-20th-birthday-world-wide-web/)

**1996–1999 — HTTP becomes a protocol.** RFC 1945 (May 1996) documents HTTP/1.0 as an *informational* RFC of common practice — explicitly not a standard. ([https://hpbn.co/brief-history-of-http/](https://hpbn.co/brief-history-of-http/)) HTTP/1.1 lands in **RFC 2068 (January 1997)** and is then revised in **RFC 2616 (June 1999)**. (Note: the user’s prompt list said "HTTP/1.1 (1997)"; that is the RFC 2068 date and is correct, but the practical specification most engineers remember is RFC 2616/1999, later split into RFC 7230–7235 in 2014, then re-consolidated in **RFC 9110–9112 (June 2022)**.) ([https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/)) [High Performance Browser Networking](https://hpbn.co/brief-history-of-http/)[High Performance Browser Networking](https://hpbn.co/brief-history-of-http/)

**1998–2003 — The XML decade.** Dave Winer, frustrated with Microsoft politics, ships **XML-RPC** in 1998 from his UserLand Frontier 5.1 product. The same group — Don Box, Bob Atkinson, Mohsen Al-Ghosein at Microsoft — eventually publishes **SOAP** (originally "Simple Object Access Protocol"); SOAP 1.1 becomes a W3C Note in May 2000, SOAP 1.2 a W3C Recommendation in June 2003. ([https://www.xml.com/pub/a/ws/2001/04/04/soap.html](https://www.xml.com/pub/a/ws/2001/04/04/soap.html)) SOAP rapidly accretes WS-* — WS-Security, WS-Addressing, WS-ReliableMessaging — and becomes the canonical enterprise integration style. [HandWiki](https://handwiki.org/wiki/SOAP)[HandWiki](https://handwiki.org/wiki/SOAP)

**2000 — Fielding's dissertation.** Roy Fielding, a co-author of HTTP/1.1 and chairman of the Apache Software Foundation, submits *Architectural Styles and the Design of Network-Based Software Architectures* at UC Irvine. Chapter 5 names and derives **REST** as a constraint set: client-server, stateless, cacheable, layered, uniform interface, code-on-demand. ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)) REST is not a protocol; it is a *style* applied on top of HTTP. The "SOAP vs REST wars" of 2003–2010 are largely won by REST + JSON because the developer experience is dramatically lighter — though SOAP never died inside finance, telco, and government. [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)[Gbiv](https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm)

**2004–2011 — The realtime detour.** Web apps want push. AJAX (2005, Jesse James Garrett's coinage) introduces XMLHttpRequest. **Comet** (Alex Russell, 2006) is the umbrella term for HTTP-streaming, long-polling, BOSH, and Bayeux — all hacks that "abuse HTTP to poll the server for updates" (RFC 6202 / RFC 6455 §1.1). ([https://datatracker.ietf.org/doc/html/rfc6455.html](https://datatracker.ietf.org/doc/html/rfc6455.html)) **Server-Sent Events (SSE)** is first specified by Ian Hickson in WHATWG's "Web Applications 1.0" draft and ships experimentally in Opera in September 2006. ([https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events)) Ian Hickson and Michael Carter coin "WebSocket" in #whatwg IRC; Google Chrome 4 ships full WebSocket in December 2009; **RFC 6455** finalises it under Ian Fette in **December 2011**. (Note: the prompt's "WS — WebSocket Protocol (2011)" is correct.) ([https://www.rfc-editor.org/rfc/rfc6455](https://www.rfc-editor.org/rfc/rfc6455)) [WebSocket + 3](https://websocket.org/guides/road-to-websockets/)

**2009–2015 — SPDY → HTTP/2.** Google announces SPDY in November 2009 as an internal "Let's Make the Web Faster" project. ([https://en.wikipedia.org/wiki/SPDY](https://en.wikipedia.org/wiki/SPDY)) Mike Belshe and Roberto Peon's experiment — binary framing, multiplexing, header compression — ships in Chrome 6 (2010). The IETF httpbis WG starts HTTP/2 in 2012 using SPDY/2 as the base. **HTTP/2 is published as RFC 7540 on 14 May 2015** (later obsoleted by **RFC 9113, June 2022**). (Note: the prompt's "HTTP/2 (2015)" is correct.) ([https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)) Within a year Google deprecates SPDY in Chrome. [Grokipedia](https://grokipedia.com/page/SPDY)[Wikipedia](https://en.wikipedia.org/wiki/HTTP/2)

**2015 — The big bang of API styles.** Within months of each other:

- **gRPC** is open-sourced by Google in March 2015 as the next generation of an internal RPC system called *Stubby* used since ~2001. It uses HTTP/2 + Protocol Buffers + bidirectional streaming. ([https://grpc.io/about/](https://grpc.io/about/)) [GitHub](https://github.com/grpc/grpc.io/blob/main/content/en/about/_index.md)
- **GraphQL**, built at Facebook in 2012 by Lee Byron, Nick Schrock, and Dan Schafer for the iOS News Feed rewrite (originally codenamed *SuperGraph*), is publicly released in summer 2015 and formally announced in September 2015 by Lee Byron. ([https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/](https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/)) [Medium](https://medium.com/@leeb/introducing-the-graphql-foundation-3235d8186d6d)[GraphQL](https://graphql.org/blog/2015-09-14-graphql/)
- **JSON-RPC 2.0** is already the lightweight option, formalised in 2010 and codified at jsonrpc.org. ([https://www.jsonrpc.org/specification](https://www.jsonrpc.org/specification))

**2016–2022 — QUIC and HTTP/3.** Google's experimental "gQUIC" runs on its servers from 2012; the IETF QUIC WG charters in 2016. After more than 30 drafts QUIC v1 ships as **RFC 9000 (May 2021)** with sibling RFCs 8999, 9001 (TLS integration), 9002 (loss recovery). **HTTP/3 is RFC 9114 (June 2022)**. (Note: the prompt's "HTTP/3 (2022)" is correct.) ([https://datatracker.ietf.org/doc/rfc9000/](https://datatracker.ietf.org/doc/rfc9000/)) [Ietf](https://sandbox-cf.ietf.org/doc/rfc9000/)

**2024–2025 — AI agent protocols.** **Model Context Protocol (MCP)** is open-sourced by Anthropic on 25 November 2024, written by David Soria Parra and Justin Spahr-Summers. ([https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)) **Agent2Agent (A2A)** is unveiled by Google on 9 April 2025 at Cloud Next with 50+ partners and donated to the Linux Foundation in June 2025. ([https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)) In December 2025 Anthropic donates MCP to the **Agentic AI Foundation (AAIF)** — a Linux Foundation directed fund co-founded by Anthropic, Block, and OpenAI — putting MCP and A2A under the same governance umbrella. ([https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)) [Platform Engineering + 3](https://platformengineering.com/editorial-calendar/best-of-2025/google-cloud-unveils-agent2agent-protocol-a-new-standard-for-ai-agent-interoperability-2/)

**The dead ends are instructive.** SPDY served its purpose and was retired. WAP died with the smartphone era. XML-RPC was subsumed by SOAP and then displaced by REST/JSON. **HTTP/2 server push** — once the headline feature — was disabled by default in Chrome 106 (October 2022) and removed entirely from Firefox 132 (October 2024); it is, for the public web, dead. ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)) WebSockets-over-SPDY was abandoned. The "MCP HTTP+SSE" transport from the 2024-11-05 MCP spec was already deprecated in March 2025 in favour of "Streamable HTTP." The pattern: every layer ossifies, gets a hack, gets a clean replacement, gets ossified again. [Zhul](https://zhul.in/en/2025/11/05/http-2-server-push-is-practically-obsolete/)[Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

---

## Members and their roles

### Verified members from the user's list

**HTTP/1.1 — HyperText Transfer Protocol 1.1 (1997, current spec 2022).** Verify: first standardised in RFC 2068 (Jan 1997), revised in RFC 2616 (1999), split in RFC 7230–7235 (2014), now consolidated in RFC 9110 (semantics) + RFC 9111 (caching) + RFC 9112 (HTTP/1.1 message syntax) — all published June 2022. Reach for it as the universal lowest common denominator: every CDN, proxy, IoT device, and 30-year-old printer speaks it. Text-based, one request-response per connection (with optional pipelining nobody enables), persistent connections via `Connection: keep-alive`. ([https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/)) [Medium](https://lakin-mohapatra.medium.com/the-evolution-of-http-from-http-0-9-to-http-3-and-beyond-5f3afc2786c2)

**HTTP/2 (2015, current spec 2022).** RFC 7540 (May 2015), obsoleted by **RFC 9113 (June 2022)**. Binary framing layer, multiplexing many streams over one TCP connection, HPACK header compression, prioritisation. Reach for it for browser-to-server traffic when you control the stack and want concurrency without the connection-per-request tax of HTTP/1.1. Server push is officially in the spec but practically dead. ([https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)) [Google](https://developers.google.com/web/fundamentals/performance/http2/)[DEV Community](https://dev.to/andreasbergstrom/the-history-of-http-in-under-5-minutes-4b7p)

**HTTP/3 (2022).** RFC 9114, runs on **QUIC** instead of TCP. Eliminates TCP head-of-line blocking, has 0/1-RTT connection setup, and supports connection migration (your phone changes Wi-Fi → cellular without dropping the connection). As of the Cloudflare 2025 Year-in-Review, 15 countries/regions send more than a third of their requests over HTTP/3, with Georgia at 38%; HTTP/3 is supported by 95%+ of major browser installations and 34%+ of the top 10 million sites. ([https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)) ([https://en.wikipedia.org/wiki/HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)) Reach for it whenever your CDN supports it (it does); it's free latency on lossy mobile networks. [Wikipedia](https://en.wikipedia.org/wiki/HTTP/3)

**WebSocket — WS (RFC 6455, December 2011).** Full-duplex, message-framed, persistent connection upgraded from HTTP via the `Upgrade: websocket` header. Reach for it when both sides need to push at low latency: chat, multiplayer games, collaborative editors, live dashboards, trading. Historically the only browser API for true bi-directional streaming; WebTransport is starting to compete. ([https://www.rfc-editor.org/rfc/rfc6455](https://www.rfc-editor.org/rfc/rfc6455))

**gRPC (2015).** Built on HTTP/2 + Protocol Buffers (a typed, code-generated, compact binary IDL). Four call patterns: unary, server-streaming, client-streaming, bidirectional. Reach for it for *internal* service-to-service traffic in polyglot microservice systems where schema, performance, and streaming matter. Native browser use is impossible because browsers can't access HTTP/2 trailers; that's why gRPC-Web (and now Connect) exist. ([https://grpc.io/about/](https://grpc.io/about/)) [Wikipedia](https://en.wikipedia.org/wiki/GRPC)

**GraphQL (2015).** A *query language* and *runtime*, not a protocol — typically transported over HTTP POST. Clients ask for exactly the fields they want; the server resolves a strongly-typed schema. Solves over-fetch/under-fetch and the "BFF" problem. Reach for it when many clients consume different shapes of the same domain (Facebook News Feed was the original case). 2024–2026 reality: adoption has plateaued in greenfield public APIs but exploded inside enterprises via **Federation** (Apollo, Open Federation), where it solves API sprawl across teams. ([https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption](https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption)) [WunderGraph](https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption)[WunderGraph](https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption)

**SSE — Server-Sent Events (2006 origin, current spec WHATWG HTML Living Standard).** *Verify*: the prompt's "2006" is right for the first Opera implementation; the EventSource API is now part of the WHATWG HTML Living Standard, which is continuously updated. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) MIME type `text/event-stream`, lines of `data:`/`event:`/`id:`, automatic reconnection with `Last-Event-ID`. Reach for it for one-way server-to-client streams (live tickers, AI token streaming, log tailing) when you don't need full duplex. [Wikipedia + 2](https://en.wikipedia.org/wiki/Server-sent_events)

**REST — Representational State Transfer (2000).** Roy Fielding's PhD dissertation, UC Irvine, 2000. ([https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)) An *architectural style*, not a protocol — but in practice "REST API" has come to mean "JSON-over-HTTP with resource-shaped URLs and HTTP verbs." Reach for it as the default for public APIs. The vast majority of "REST" APIs are not RESTful in Fielding's strict sense (they fail his "hypermedia as the engine of application state" — HATEOAS — constraint).

**MCP — Model Context Protocol (Anthropic, 25 November 2024).** Open standard for connecting LLM applications ("hosts" like Claude Desktop, ChatGPT, Cursor, Windsurf) to external tools and data ("servers"). Solves the N×M integration problem — the *USB-C for AI* analogy, used in Anthropic's own marketing. Wire protocol is **JSON-RPC 2.0** over either stdio (local subprocess) or **Streamable HTTP** (remote, since the 2025-03-26 spec, replacing the earlier HTTP+SSE transport). Five primitives in the latest spec: tools, resources, prompts, sampling, roots. ([https://modelcontextprotocol.io/specification/2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)) The latest spec versions add OAuth 2.1 with PKCE and dynamic client registration for remote servers, and **Resource Indicators (RFC 8707)** to scope tokens to a server's canonical URI. ([https://modelcontextprotocol.io/specification/2025-11-25/basic/transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)) ([https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/](https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/)) In December 2025 it was donated to the **Agentic AI Foundation** under the Linux Foundation. ([https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)) [Wikipedia + 3](https://en.wikipedia.org/wiki/Model_Context_Protocol)

**A2A — Agent-to-Agent / Agent2Agent Protocol (Google, 9 April 2025).** *Verify*: the prompt's "2025" is correct. Open communication protocol for collaboration between *autonomous agents* (the layer above tools), built on HTTP and JSON-RPC; A2A version 0.3 (July 2025) added gRPC support and signed Agent Cards. ([https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)) Donated to the Linux Foundation in June 2025. ([https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)) MCP and A2A are explicitly designed as complementary: MCP wires an agent to its tools/data; A2A wires agents to each other. Honest current state: in 2025 A2A's adoption trailed MCP's significantly — by mid-2026 industry analyses report MCP at ~78% enterprise adoption vs A2A at ~23% — and the boundary between "agent" and "tool" remains fuzzy. ([https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)) ([https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/)) [IBM](https://www.ibm.com/think/topics/agent2agent-protocol)[Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)

**JSON-RPC — JSON Remote Procedure Call.** *Verify*: the prompt says "2005" but JSON-RPC 1.0 dates from 2005 and JSON-RPC 2.0 — the version in actual use today — was specified in 2010 and is the official current spec at jsonrpc.org. ([https://www.jsonrpc.org/specification](https://www.jsonrpc.org/specification)) Tiny, transport-agnostic envelope: `{"jsonrpc":"2.0", "method":..., "params":..., "id":...}`. Notifications omit the id. Used directly in Ethereum/blockchain JSON-RPC, the Language Server Protocol, MCP, and A2A. Reach for it when you want RPC semantics with zero ceremony, especially over WebSockets or stdio.

**SOAP (1998–2003).** *Verify*: the prompt's "1998" is the date Dave Winer shipped XML-RPC, the proto-SOAP, in UserLand Frontier 5.1; SOAP 1.1 is a W3C Note (May 2000); SOAP 1.2 is the actual W3C Recommendation (June 2003). The acronym was retired in 1.2 — it now just means "SOAP." ([https://en.wikipedia.org/wiki/SOAP](https://en.wikipedia.org/wiki/SOAP)) Heavyweight, XML-based, with envelope/header/body structure and a fleet of WS-* extensions for security, transactions, addressing. Reach for it only inside legacy enterprise, finance, telco, government, or healthcare integrations — and even there it's being slowly displaced. [HandWiki](https://handwiki.org/wiki/SOAP)

### Members the prompt missed that genuinely belong

**HTTP/0.9 (1991) and HTTP/1.0 (RFC 1945, May 1996).** Historical members. HTTP/0.9 is `GET /path\r\n` only, no headers, no version. RFC 9112 explicitly recommends disabling HTTP/0.9 on virtual hosts because of request-smuggling risk (CVE-2017-7656 against Jetty, CVE-2026-24733 against Tomcat). ([https://http.dev/0.9](https://http.dev/0.9)) [HTTP](https://http.dev/0.9)

**WebTransport (W3C/IETF, drafts 2024–2026).** Modern client-server transport over HTTP/3 (and HTTP/2 fallback). Multiplexed reliable streams + unreliable datagrams in the browser. As of October 2025, `draft-ietf-webtrans-http3-13/14/15` and the W3C Working Draft of 22 October 2025 are in active development; the working group expects to finish "late 2026 or early 2027." ([https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)) ([https://www.w3.org/TR/webtransport/](https://www.w3.org/TR/webtransport/)) **Belongs as a full member.** [W3C](https://www.w3.org/wiki/WebTransport/Meetings2023)

**WebRTC data channels.** P2P, browser-to-browser, over UDP via STUN/TURN/ICE. Powers Discord voice, Google Meet, low-latency P2P apps. **Adjacent** — fits the "real-time audio/video protocols" group more cleanly, but its data-channel API is squarely a Web API.

**HTTP/2 server push.** Once a member, now a *deprecated feature*: disabled by default in Chrome 106 (Oct 2022), removed in Firefox 132 (29 Oct 2024). ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)) Replaced by **HTTP 103 Early Hints**, which is now its own minor member. [Zhul](https://zhul.in/en/2025/11/05/http-2-server-push-is-practically-obsolete/)[Zhul](https://zhul.in/en/2025/11/05/http-2-server-push-is-practically-obsolete/)

**Webhooks.** Server-to-server HTTP POSTs sent on events. Not a single spec; **Standard Webhooks** (2024-) is an effort by Brandon Holt, Tom Hacohen et al. to standardise signing and delivery semantics; webhooks are also describable in OpenAPI 3.1+ and AsyncAPI. ([https://github.com/standard-webhooks/standard-webhooks](https://github.com/standard-webhooks/standard-webhooks)) **Belongs as a member.**

**OpenAPI / Swagger.** Schema language for HTTP APIs (OpenAPI 3.1 = JSON Schema 2020-12 compatible). Not a protocol but a near-mandatory companion to "REST." **Adjacent**: a description language, not a wire protocol.

**AsyncAPI.** Like OpenAPI but for event-driven APIs (Kafka, MQTT, AMQP, WebSockets). **Adjacent** — describes wire protocols rather than being one. ([https://github.com/asyncapi/spec](https://github.com/asyncapi/spec))

**OData.** Microsoft's RESTful query protocol on top of HTTP, queryable via `$filter`, `$expand`, `$select`. **Adjacent** but worth mentioning as a REST extension still common in Microsoft and enterprise reporting stacks.

**Falcor.** Netflix's pre-GraphQL data-fetching layer (2015). Largely abandoned outside Netflix; mainly historical interest.

**tRPC.** TypeScript-first RPC, *not* a wire protocol — it generates over HTTP/JSON. Massive in 2024–2025 inside Next.js shops. **Adjacent**: a developer-experience layer over HTTP, not a peer of gRPC.

**Connect / Connect-RPC (Buf, 2022).** A genuine alternative protocol to gRPC: a simple POST-over-HTTP/1.1-or-HTTP/2 RPC protocol that interoperates with gRPC and gRPC-Web from one server. Joined CNCF in 2024. ([https://buf.build/blog/connect-a-better-grpc](https://buf.build/blog/connect-a-better-grpc)) ([https://buf.build/blog/connect-rpc-joins-cncf](https://buf.build/blog/connect-rpc-joins-cncf)) **Belongs as a member.** [GitHub](https://github.com/connectrpc/connect-go)[Buf](https://buf.build/blog/connect-rpc-joins-cncf)

**Cap'n Proto, Apache Thrift, Apache Avro, MessagePack-RPC, Hessian.** Adjacent serialisation/RPC frameworks from the pre-gRPC era; living members in non-web infrastructure (Twitter, Hadoop). Mostly out-of-scope for the *Web* family but legitimate cousins.

**XML-RPC (1998).** A direct ancestor of SOAP, formally still alive (WordPress XML-RPC endpoint). Historical member.

**JSON:API, HAL.** Hypermedia/REST conventions. Adjacent design-pattern documents, not protocols.

**ALPN (RFC 7301, 2014).** Not a member but a glue layer that *makes the family work* — without ALPN your browser couldn’t negotiate `h2` vs `h3` at the TLS handshake.

**Comet / long-polling / BOSH.** Pre-WebSocket techniques (XEP-0124 BOSH for XMPP-over-HTTP, Bayeux). Historical members; the failure mode they represent (millions of held-open HTTP connections) is the reason WebSockets exist.

**EventSource.** This is the *browser API* for SSE — same protocol, different name. Same member.

**MASQUE (Multiplexed Application Substrate over QUIC Encryption).** IETF working group chartered to specify proxy protocols on top of QUIC. CONNECT-IP, CONNECT-UDP, CONNECT-Ethernet drafts are active in 2025–2026. ([https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/](https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/)) **Belongs at the edge of the family** — it’s how iCloud Private Relay and Cloudflare WARP move arbitrary IP traffic over HTTP. [IETF](https://www.ietf.org/archive/id/draft-schinazi-masque-proxy-04.html)

**WebSub (W3C Recommendation, 2018).** PubSubHubbub successor. Adjacent, niche.

### My recommendation for the canonical roster

> Core members: HTTP/1.1, HTTP/2, HTTP/3, WebSocket, SSE, REST (style), GraphQL, gRPC, Connect, JSON-RPC, SOAP, MCP, A2A, WebTransport, Webhooks. Historical: HTTP/0.9, HTTP/1.0, XML-RPC, SPDY, Comet/long-polling, HTTP/2 server push.

---

## Internal taxonomy — how to mentally cluster the members

The honest answer is that "Web/API protocols" is a polycube, not a line. Here are the axes that actually predict a protocol's behaviour and use case.

| Axis | One end | Other end | Examples |
|---|---|---|---|
| **Direction** | Pull (client→server) | Push (server→client) | HTTP/1.1 GET vs SSE/WebSocket |
| **Duplex** | Half-duplex | Full-duplex | HTTP/1.1, SSE vs WebSocket, HTTP/2 streams, gRPC, WebTransport |
| **Lifetime** | Short request/response | Long-lived connection | REST, SOAP vs WebSocket, gRPC streaming, SSE |
| **Stateful?** | Stateless | Stateful | REST, HTTP vs WebSocket, MCP sessions, A2A tasks |
| **Schema-first?** | Schema-less | Schema-first | REST/JSON, JSON-RPC vs gRPC/Protobuf, GraphQL/SDL, SOAP/WSDL |
| **Wire format** | Text | Binary | HTTP/1.1, JSON-RPC, REST vs HTTP/2, HTTP/3, gRPC, WebSocket-binary |
| **Transport** | TCP | UDP/QUIC | HTTP/1.1/2, WS, gRPC vs HTTP/3, WebTransport, MASQUE |
| **Browser-native?** | Yes | No / needs proxy | HTTP, WS, SSE, WebTransport vs gRPC (needs Connect/grpc-Web) |
| **Topology** | Point-to-point | Pub/sub / fan-out | HTTP, gRPC vs Webhooks, SSE, WebSocket-broadcast |
| **API style** | RPC | Resource | gRPC, JSON-RPC, MCP vs REST |
| **API style 2** | Query | Command | GraphQL vs REST/RPC |
| **Encryption** | Optional / bolt-on | Mandatory | HTTP/1.1, HTTP/2 in spec vs HTTP/3, MCP-remote |
| **Where it runs** | Edge/browser | Datacenter/internal | REST, GraphQL, WS, MCP host vs gRPC, Connect, A2A server-to-server |

### A decision tree for "which one do I reach for?"

1. **Public API consumed by browsers and third parties?** → **REST / JSON over HTTP/2 or HTTP/3**, described by **OpenAPI**.
2. **Public API where many clients want different shapes of the same data graph?** → **GraphQL**, optionally federated.
3. **Internal microservice-to-microservice in a polyglot org?** → **gRPC** (or **Connect** if you also want browser support without a proxy).
4. **One TypeScript codebase, full stack?** → **tRPC** (adjacent) or **Connect-ES**.
5. **Server-to-client one-way streaming (notifications, AI tokens, logs)?** → **SSE**. Survives proxies, no upgrade dance.
6. **Bi-directional, low-latency, browser?** → **WebSocket** today; **WebTransport** if you can require modern browsers and want unreliable datagrams.
7. **Real-time game/voice/video in the browser?** → **WebRTC data channels**, with **WebTransport** as the emerging alternative.
8. **Server-to-server event delivery without polling?** → **Webhooks** (signed, with a queue).
9. **Long-running async jobs?** → REST + polling, or **Webhooks** for completion, or **SSE** to stream progress, or **gRPC server-streaming**.
10. **Connecting an AI assistant to your tools/data?** → **MCP**.
11. **Multiple AI agents collaborating across vendors?** → **A2A** (with MCP underneath each agent for tools).
12. **Legacy enterprise integration?** → **SOAP** or your platform's RPC.

---

## How this group interacts with other protocol groups

The Web/API family sits on top of three groups and is consumed by two more.

**Below: link/internet/transport.** Ethernet/Wi-Fi/cellular at L2; IP at L3; TCP/UDP at L4 (RFC 9293/RFC 768); QUIC layered over UDP (RFC 9000). HTTP/1.1 and HTTP/2 ride TCP+TLS; HTTP/3 rides QUIC, which has TLS 1.3 baked in (RFC 9001). WebSocket rides TCP. WebTransport rides QUIC. MASQUE tunnels arbitrary L3/L4 traffic *back over* HTTP, inverting the layering. ([https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/](https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/)) ([https://datatracker.ietf.org/doc/html/rfc8446](https://datatracker.ietf.org/doc/html/rfc8446)) [IETF](https://www.ietf.org/archive/id/draft-schinazi-masque-proxy-04.html)

**Below: utility/security.** **DNS** (and DoH/DoQ — DNS-over-HTTPS, DNS-over-QUIC RFC 9250) resolves names; broken DNS is the most common cascading failure (the 2021 Facebook outage, the Cloudflare 1.1.1.1 incidents). **BGP** routes packets across ASes; a BGP misconfiguration kills your HTTPS traffic before any of your code can react. **TLS** is below every modern Web/API protocol; **OAuth 2.0/2.1** and **JWT (RFC 7519)** are above HTTP, layered into REST/GraphQL/MCP/A2A authorization.

**Beside: async messaging / IoT.** **MQTT** (IoT pub/sub over TCP), **AMQP 0.9.1 / 1.0** (RabbitMQ), **Apache Kafka's wire protocol** — these own server-to-server async messaging. The Web/API family interoperates via **Webhooks** and **AsyncAPI**, and via **WebSocket subprotocols** like **STOMP** and **MQTT-over-WebSockets** that bring messaging into browsers. ([https://www.asyncapi.com/blog/publish-subscribe-semantics](https://www.asyncapi.com/blog/publish-subscribe-semantics))

**Beside: real-time media.** RTP/RTCP/SRTP for media; **WebRTC** wraps them into a browser-friendly stack. WebTransport is starting to compete for media transport — NVIDIA, Cisco, and the Media-over-QUIC (MoQ) Transport effort are using WebTransport for sub-second live streaming. ([https://www.w3.org/wiki/WebTransport/Meetings2023](https://www.w3.org/wiki/WebTransport/Meetings2023))

**Above: applications, agents, AI.** Browsers, mobile apps, microservices, and now LLM agents are the consumers. MCP and A2A explicitly create a new layer: AI agents speak MCP downwards (to tools) and A2A sideways (to other agents), with both sitting on HTTP+JSON-RPC. The whole "AI agent stack" is just the Web/API family with new envelopes.

In OSI terms: **everything in this report lives at L7 (application).** What's changed since 2015 is that L4 (TCP→QUIC) was disrupted *by* an L7 working group (HTTP), and L5/6 (TLS) was folded *into* L4 for QUIC.

---

## Common patterns and failure modes

### Recurring patterns

- **Three-way handshake.** TCP SYN/SYN-ACK/ACK — one round trip before any HTTP byte. TLS 1.2 added another 1–2 RTTs; TLS 1.3 cut it to 1, and QUIC + HTTP/3 fold the cryptographic and transport handshakes into ~1 RTT (or 0-RTT with resumption). ([https://datatracker.ietf.org/doc/html/rfc8446](https://datatracker.ietf.org/doc/html/rfc8446))
- **Heartbeats / keepalives.** WebSocket ping/pong frames, HTTP/2 PING frames, gRPC keepalives, MCP `ping` JSON-RPC method. Without them, NAT boxes silently drop "idle" long-lived connections after 30–300 seconds.
- **Sliding windows / flow control.** TCP receive window; HTTP/2 has its own per-stream and per-connection window; QUIC has stream and connection flow control. Without flow control a fast sender obliterates a slow receiver.
- **Multiplexing.** HTTP/2 streams, QUIC streams, WebSocket subprotocol multiplexing, gRPC channels. The right answer to "should I open ten connections" is "no, multiplex."
- **Framing.** HTTP/2 has typed frames (DATA, HEADERS, SETTINGS, RST_STREAM, GOAWAY, PING, PRIORITY, WINDOW_UPDATE, PUSH_PROMISE, CONTINUATION). WebSocket has opcodes. gRPC has 5-byte length-prefixed frames inside HTTP/2. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))
- **Content negotiation.** `Accept`, `Accept-Encoding`, `Accept-Language`, `Content-Type` — RFC 9110 §12. The reason your `application/json` endpoint can also return `application/vnd.api+json` or Protobuf.
- **ETags and conditional requests.** `If-None-Match` / `304 Not Modified` (RFC 9110 §8.8, §13.1). The single most misused performance feature on the web.
- **Idempotency keys.** Stripe-style request-level dedup; not a protocol feature, a discipline. Crucial for retries.
- **Retries with exponential backoff and jitter.** Standard everywhere; missing jitter is what produces *retry storms*.
- **Rate limiting and circuit breakers.** Token-bucket / leaky-bucket; circuit breakers (Hystrix-style) are the post-hoc fix for retry storms.
- **Compression.** gzip, brotli for HTTP bodies; HPACK (HTTP/2) and QPACK (HTTP/3) for headers; gRPC body compression negotiated per-call.
- **Request/response correlation IDs.** JSON-RPC `id`, gRPC stream IDs, HTTP/2 stream IDs, MCP `id`. The single most useful debugging field in any protocol.

### Group-wide failure modes

- **Head-of-line blocking** at the HTTP layer (HTTP/1.1, fixed in HTTP/2) and at the TCP layer (HTTP/2 over TCP still has it; only HTTP/3/QUIC is immune).
- **Connection storms.** A service restarts; thousands of clients all reconnect at the same instant. Mitigation: jittered backoff, server-side connection rate limits.
- **Retry storms.** A downstream blip → every caller retries → the blip becomes an outage. The 2024 CrowdStrike incident, while not strictly a retry-storm root cause, exemplifies the cascading failure pattern: ~8.5 million Windows machines crashed; recovery generated coordinated retry traffic across airlines, hospitals, banks. ([https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages](https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages))
- **Slowloris.** An attacker holds many HTTP/1.1 connections open with slow header writes. Modern servers limit concurrent connections per IP; HTTP/2 mitigates by multiplexing but introduces its own variants.
- **HTTP/2 Rapid Reset (CVE-2023-44487).** A protocol-level flaw in HTTP/2 stream cancellation. Disclosed 10 October 2023. Cloudflare, AWS, and Google jointly mitigated record DDoS attacks: Amazon at 155 Mrps, Cloudflare at 201 Mrps, Google at 398 Mrps. ([https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)) ([https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)) [Cisco Security](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-http2-reset-d8Kf32vZ)[Qualys](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
- **TLS handshake failures.** Cipher mismatch, expired certs, missing intermediate CA, SNI not set. After ALPN failures fall back to HTTP/1.1 silently, which is its own debugging trap.
- **DNS-related cascades.** The 4 October 2021 Facebook outage was a BGP withdrawal that took DNS with it; once DNS resolution failed, every dependent service fell over.
- **Cache poisoning.** A malformed Host header tricks a CDN into caching a response under the wrong key. CVE-list staple.
- **Cross-protocol request smuggling.** Inconsistent parsing of `Content-Length` vs `Transfer-Encoding` between front-end CDN and back-end origin. James Kettle's 2019 Black Hat talk is the canonical reference; the 2022 "Browser-Powered Desync" follow-up extended it to HTTP/2-to-HTTP/1.1 downgrade smuggling. CVE-2017-7656 against Jetty was an HTTP/0.9 variant. ([https://http.dev/0.9](https://http.dev/0.9)) [HTTP](https://http.dev/0.9)
- **WebSocket cascading failures.** Slack's 22 February 2022 outage: a Consul agent restart caused a cache-hit-rate collapse during morning peak; the Slack client's "boot" RPC ran an inefficient scatter query over the now-cold cache; cascading database load locked everyone out. WebSockets weren't the *cause*, but the model — millions of clients reconnecting and re-booting simultaneously — turned a cache-warmth problem into a multi-hour outage. ([https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/)) [Slack](https://slack.engineering/slacks-incident-on-2-22-22/)
- **Token leakage and confused deputy.** The MCP June 2025 spec update added Resource Indicators (RFC 8707) specifically to prevent a rogue MCP server from tricking an MCP client into leaking tokens for a different server. ([https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/](https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/))

---

## Industry timeline

**1989–1995 — Genesis.** Berners-Lee at CERN; HTTP/0.9; Mosaic/Netscape; HTTP/1.0 informal.

**1996–2003 — The XML/SOAP era.** SOAP, WSDL, UDDI, the WS-* zoo. Microsoft, IBM, Sun all-in. Enterprise integration formalises.

**2000–2010 — REST overtakes SOAP.** Fielding's dissertation; AJAX (2005); Rails 1.0 (2005) ships REST as a default; Twitter/Flickr/YouTube/Amazon S3 ship JSON+REST; SOAP retreats to enterprise back-offices. The "API economy" emerges (Twilio 2008, Stripe 2010).

**2009–2015 — The performance war.** SPDY → HTTP/2; Comet → WebSockets; XHR → fetch; SSE matures. Mobile pushes everyone to care about latency.

**2015–2020 — The polyglot RPC and graph era.** gRPC for internals; GraphQL for product APIs; JSON-RPC quietly under blockchains and editors (LSP). Netflix's GraphQL-as-federation, Apollo's commercial federation.

**2018–2022 — QUIC and HTTP/3.** Google deploys gQUIC at scale; IETF standardises; RFC 9000 (May 2021) and RFC 9114 (June 2022) ship.

**2022–2024 — Streaming-first, edge-first, AI-first APIs.** OpenAI's streaming chat completions normalise SSE for product use. Cloudflare Workers, Vercel, Deno Deploy push *edge-resident* APIs. HTTP/2 server push dies. WebTransport drafts mature.

**2024–2026 — Agent protocols.** MCP (Nov 2024), A2A (Apr 2025), Agentic AI Foundation (Dec 2025). Both ride JSON-RPC over HTTP and inherit the family's tooling. The 17-month adoption arc of MCP — from Anthropic-only to ~78% enterprise adoption per Q1 2026 surveys — is one of the fastest standard-adoption stories in the family's history. ([https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol))

**Who is doing the pushing today:**

- **Standards bodies:** the IETF HTTP, QUIC, MASQUE, OAuth, and WEBTRANS Working Groups; W3C WebTransport; WHATWG (HTML/EventSource); OASIS (legacy SOAP).
- **Big tech:** Google (HTTP/3, QUIC, gRPC, A2A, WebTransport drafts), Cloudflare and Fastly (HTTP/3 and QUIC engineering, post-quantum TLS), Anthropic (MCP), Microsoft (gRPC interop, OpenAPI, Azure), Apple (HTTP/3 in Safari since 2024, MASQUE for iCloud Private Relay), Meta (GraphQL, network research).
- **Open-source communities:** Apache (httpd, Tomcat), nginx, Envoy, Buf (Connect-RPC, ConnectRPC joined CNCF in 2024) ([https://buf.build/blog/connect-rpc-joins-cncf](https://buf.build/blog/connect-rpc-joins-cncf)), the AsyncAPI Initiative, the Model Context Protocol working groups (now Linux Foundation). [Buf](https://buf.build/blog/connect-rpc-joins-cncf)

---

## Recommended learning paths (current as of 2026)

### A pragmatic order to learn this whole family

1. TCP/IP fundamentals (one week) — Stanford CS144 lectures + the textbook of your choice.
2. HTTP/1.1 — RFC 9110 (semantics), RFC 9112 (syntax), the first 6 chapters of *High Performance Browser Networking*.
3. TLS 1.3 — RFC 8446 abstract + Cloudflare's blog series.
4. REST — Fielding's dissertation Chapter 5 + Richardson/Amundsen's *RESTful Web APIs*.
5. JSON, JSON Schema, OpenAPI — to ground "REST in practice."
6. HTTP/2 — RFC 9113 + HPBN Chapter 12.
7. WebSockets and SSE — RFC 6455 + WHATWG EventSource section.
8. gRPC + Protocol Buffers (and Connect-RPC as the modern alternative).
9. GraphQL — *GraphQL in Action* + Apollo Federation docs.
10. QUIC and HTTP/3 — RFC 9000, RFC 9114, Robin Marx's blog series.
11. OAuth 2.1 + JWT — `draft-ietf-oauth-v2-1-15`, BCP `draft-ietf-oauth-security-topics`.
12. MCP and A2A — the official specs and at least one hand-written server.

### Authoritative specifications

- **RFC 9110 — HTTP Semantics, June 2022, IETF** — the master reference for *every* HTTP version; methods (§9), status codes (§15), header fields (§5–8), conditional requests (§13), content negotiation (§12). DOI 10.17487/RFC9110. ([https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/)) [W3C](https://lists.w3.org/Archives/Public/ietf-http-wg/2022AprJun/0132.html)
- **RFC 9111 — HTTP Caching, 2022.** Read with §4 (Constructing Responses from Caches) and §5.2 (Cache-Control).
- **RFC 9112 — HTTP/1.1 message syntax, 2022.** Read §6 (Message Body) and §7 (Transfer Codings) before debugging any chunked/streaming bug.
- **RFC 9113 — HTTP/2, 2022.** Read §5 (Streams and Multiplexing), §6 (Frame Definitions), §6.4 (RST_STREAM) for the Rapid Reset context. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))
- **RFC 9114 — HTTP/3, 2022.** §4 (Stream Mapping), §7 (HTTP Framing).
- **RFC 6455 — WebSocket, 2011.** §1.2 (Protocol Overview), §5 (Data Framing), §7 (Closing the Connection). ([https://www.rfc-editor.org/rfc/rfc6455](https://www.rfc-editor.org/rfc/rfc6455))
- **RFC 8259 — JSON, 2017.**
- **RFC 8446 — TLS 1.3, 2018.** §2 (Protocol Overview), §4.1.1 (Cryptographic Negotiation).
- **RFC 9000 — QUIC v1, May 2021.** §2 (Streams), §5 (Connections), §13 (Packetization and Reliability). DOI 10.17487/RFC9000. ([https://datatracker.ietf.org/doc/rfc9000/](https://datatracker.ietf.org/doc/rfc9000/)) [Ietf](https://sandbox-cf.ietf.org/doc/rfc9000/)
- **RFC 9001, 9002, 8999** — QUIC's TLS, recovery, and version-independent companion specs.
- **RFC 9221** — Unreliable Datagram Extension to QUIC (basis for WebTransport datagrams).
- **RFC 9250** — DNS over QUIC.
- **draft-ietf-oauth-v2-1-15** — OAuth 2.1 (March 2026, expected to publish as RFC during 2026). ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/))
- **draft-ietf-oauth-security-topics** — OAuth 2.0 BCP, the security companion you should read alongside.
- **draft-ietf-webtrans-http3-15 / -overview-11** — WebTransport, October 2025–March 2026. ([https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/))
- **MCP Specification 2025-11-25** — Model Context Protocol, current as of report date. ([https://modelcontextprotocol.io/specification/2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25))
- **A2A Protocol documentation, latest version 0.3+ (2025)** — official spec at [https://a2a-protocol.org/latest/](https://a2a-protocol.org/latest/).
- **WHATWG HTML Living Standard, §9.2 Server-sent events** — continuously updated. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html))
- **JSON-RPC 2.0 Specification (2010)** — at [https://www.jsonrpc.org/specification](https://www.jsonrpc.org/specification).

### Books

- **Ilya Grigorik, *High Performance Browser Networking* (O'Reilly, 2nd ed. 2013, freely online at hpbn.co).** Last full update reflects HTTP/2; the QUIC chapter is dated. Still the best single-volume tour of TCP/UDP/TLS/HTTP/WebSocket/SSE/WebRTC. *Intermediate, 2013, hpbn.co.* ([https://hpbn.co/](https://hpbn.co/))
- **Leonard Richardson & Mike Amundsen, *RESTful Web APIs* (O'Reilly, 2013).** The classic. Hypermedia chapter is still the best in print. *Intermediate, 2013.*
- **Mike Amundsen & others, *Continuous API Management* (O'Reilly, 2nd ed. 2021).** *Intermediate, 2021.*
- **Martin Kleppmann, *Designing Data-Intensive Applications* (O'Reilly, 2017; new edition rumoured but not yet shipped).** Chapters 4 (Encoding) and 11 (Stream Processing) are required reading for anyone choosing between gRPC, Avro, Thrift, MessagePack. *Advanced, 2017.*
- **Sam Newman, *Building Microservices* (2nd ed., O'Reilly 2021).** Chapter 5 (Communication Styles) is the canonical RPC-vs-REST-vs-events comparison. *Intermediate, 2021.*
- **Samer Buna, *GraphQL in Action* (Manning, 2021).** *Intermediate, 2021.*
- **Lorenzo Aiello et al., *gRPC: Up and Running* (Kasun Indrasiri, O'Reilly 2020).** *Intermediate, 2020.*
- **Daniel Stenberg, *HTTP/3 Explained* (Leanpub, continuously updated).** Free at [https://http3-explained.haxx.se/](https://http3-explained.haxx.se/) — last meaningful update 2024.
- **Aaron Parecki, *OAuth 2 in Action* (Manning, 2017) + the OAuth 2.1 draft.** *Intermediate, 2017.*

### Academic papers and dissertations

- **Roy Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine PhD dissertation, 2000.** ([https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm))
- **Adam Langley et al., "The QUIC Transport Protocol: Design and Internet-Scale Deployment", SIGCOMM 2017** — the production gQUIC paper. DOI 10.1145/3098822.3098842.
- **Neal Cardwell et al., "BBR: Congestion-Based Congestion Control", ACM Queue 2016** — the BBR paper, DOI 10.1145/3009824.
- **Trevisan et al., "Measuring HTTP/3: Adoption and Performance", IEEE 2021** — early empirical study. ([https://ieeexplore.ieee.org/document/9501274](https://ieeexplore.ieee.org/document/9501274))
- **Y.-X. Chen et al., "RFC 9000 and its Siblings: An Overview of QUIC Standards", TUM 2024.** ([https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf))
- **Al Alamin et al., "GraphQL Adoption and Challenges", *TOSEM* 2024**, arXiv:2408.08363. ([https://arxiv.org/html/2408.08363v1](https://arxiv.org/html/2408.08363v1))

### Long-form engineering blogs (still updated 2024–2026)

- **Cloudflare blog** ([https://blog.cloudflare.com/](https://blog.cloudflare.com/)) — HTTP/3 deployment, post-quantum TLS rollout, the Rapid Reset post-mortem, the annual *Cloudflare Radar Year in Review* (2025 edition: [https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)).
- **Fastly engineering blog** — Jana Iyengar's QUIC posts (e.g., "QUIC is now RFC 9000", May 2021, [https://www.fastly.com/blog/quic-is-now-rfc-9000](https://www.fastly.com/blog/quic-is-now-rfc-9000)), Mark Nottingham's HTTP work.
- **Google Research / Chrome blog** — SPDY history, HTTP/3 rollout, "Removing HTTP/2 push", Early Hints. ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push))
- **Akamai blog (Robin Marx)** — "Why HTTP/3 is Eating the World" series, 2024–2025. ([https://pulse.internetsociety.org/blog/why-http-3-is-eating-the-world](https://pulse.internetsociety.org/blog/why-http-3-is-eating-the-world))
- **Slack engineering** — incident write-ups; "Slack's Incident on 2-22-22" is a case study of WebSocket cascade failure. ([https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/))
- **Discord engineering, Netflix tech blog, Stripe engineering, Shopify engineering, Meta engineering** — production patterns; Netflix's GraphQL Federation series and Stripe's "Idempotency keys" post are timeless.
- **Buf blog** ([https://buf.build/blog/](https://buf.build/blog/)) — Connect-RPC announcements and gRPC conformance findings.
- **Anthropic Engineering** ([https://www.anthropic.com/engineering](https://www.anthropic.com/engineering)) and the Anthropic Academy MCP courses ([https://anthropic.skilljar.com/](https://anthropic.skilljar.com/)) — first-party MCP material, updated through 2026.
- **The New Stack** — agent-protocol coverage, current to 2026. ([https://thenewstack.io/why-the-model-context-protocol-won/](https://thenewstack.io/why-the-model-context-protocol-won/))

### YouTube channels and specific talks

- **Hussein Nasser (YouTube channel "Hussein Nasser")** — backend networking deep dives; entire HTTP/3 and gRPC playlists; updates through 2025.
- **ByteByteGo (Alex Xu)** — system-design overviews; "HTTP/1 to HTTP/3" video remains the most-watched single explainer.
- **Computerphile** — Tom Scott's "How HTTPS Works" and the David Brailsford TLS videos; classic but still correct.
- **Daniel Stenberg, "HTTP/3 — explained", FOSDEM** — one of the cleanest live-talk treatments.
- **Mark Nottingham, "HTTP at 30" / "The HTTP RFCs Have Evolved", various IETF and APIDays talks 2022–2025.**
- **Ilya Grigorik, "Yesterday's perf best practices are today's HTTP/2 anti-patterns" (Velocity).**
- **Stanford CS144 lecture playlist** — by Philip Levis and Nick McKeown ([https://cs144.github.io/](https://cs144.github.io/)).
- **GraphQL Summit, gRPC Conf, IETF tech-talks, QUIC Summit** — yearly recordings on YouTube.

### Podcasts

- **Software Engineering Daily** — episodes on HTTP/3 (with Daniel Stenberg), gRPC (with Eric Anderson), GraphQL, MCP (multiple, late 2024 onward).
- **The Cloudflare Podcast** and **The Fastly Cool Beans podcast** — protocol deep dives by IETF participants.
- **Latent Space** and **The MAD Podcast** — current MCP/A2A coverage in 2025–2026.
- **"Programming Throwdown"**, **"Backend Banter"** — episodes on Connect-RPC, tRPC, GraphQL Federation.

### Free university courses

- **Stanford CS144 — Introduction to Computer Networking (Levis, McKeown).** Build your own TCP in C++. Course site: [https://cs144.github.io/](https://cs144.github.io/). Lecture playlist (Sept 2025 offering): [https://online.stanford.edu/courses/cs144-introduction-computer-networking](https://online.stanford.edu/courses/cs144-introduction-computer-networking). *Intermediate, last offered 2025.*
- **MIT 6.829 — Computer Networks.** Older but still cited; 2022 edition publicly available.
- **Princeton COS 461 — Computer Networks.**
- **CMU 15-441/641 — Computer Networks.**
- **Berkeley CS 168 — Introduction to the Internet: Architecture and Protocols.** Recent offerings publicly available.

### Hands-on tools

- **curl** ([https://curl.se/](https://curl.se/)) — `--http2`, `--http3`, `-H`, `-v`, `--http0.9`. The single most valuable diagnostic tool.
- **Wireshark** — packet capture; SSL/TLS decryption with `SSLKEYLOGFILE`.
- **qlog/qvis** — QUIC and HTTP/3 visualisation ([https://qvis.quictools.info/](https://qvis.quictools.info/)).
- **HTTPie** and **xh** — friendlier curl.
- **Postman, Insomnia, Bruno** — REST/GraphQL/gRPC clients with collections.
- **grpcurl** and **buf curl** — command-line gRPC clients.
- **MCP Inspector** (npx @modelcontextprotocol/inspector) — official debug UI for MCP servers.
- **Apollo Sandbox** and **GraphQL Playground / GraphiQL** — query editors.
- **Cloudflare Radar** ([https://radar.cloudflare.com/](https://radar.cloudflare.com/)) — live HTTP/3, IPv6, post-quantum, and BGP statistics.

### Conferences worth tracking

- **IETF (3× per year)** — HTTPbis, QUIC, MASQUE, OAuth, WEBTRANS WG sessions.
- **APIDays, API World, GraphQL Summit, gRPC Conf, KubeCon + CloudNativeCon, RealTimeConf.**
- **ApacheCon, NDSS, USENIX Security, Black Hat, RSA, SIGCOMM** — for security and research.
- **MCP Dev Summit (AAIF, NYC, April 2026)** — first in-person MCP conference, ~1,200 attendees per AAIF reports. ([https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol)

---

## Where things are heading (2025–2026 frontier)

**HTTP/3 is mainstream, not bleeding-edge.** Per Cloudflare's 2025 Year-in-Review, 15 countries/regions are sending more than a third of requests over HTTP/3 — Georgia leads at 38% — and HTTP/3 is supported by 95%+ of major browsers in active use. ([https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)) The remaining HTTP/1.1 traffic is mostly bots and legacy. [Wikipedia](https://en.wikipedia.org/wiki/HTTP/3)

**QUIC keeps eating the transport layer.** RFC 9369 (QUIC v2, Dec 2023) and RFC 9221 (Unreliable Datagrams) are the bases for new applications: DNS-over-QUIC (RFC 9250), Multipath QUIC (active draft), and **MASQUE** for HTTP-tunneled IP/UDP/Ethernet — already shipping at scale in iCloud Private Relay and Cloudflare WARP. The MASQUE WG is closing out its second round of drafts in 2026. ([https://datatracker.ietf.org/doc/draft-ietf-masque-connect-ethernet/](https://datatracker.ietf.org/doc/draft-ietf-masque-connect-ethernet/)) ([https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/](https://datatracker.ietf.org/doc/draft-schinazi-masque-proxy/))

**WebTransport is on the runway.** As of October 2025 the W3C Working Draft and IETF `draft-ietf-webtrans-http3-15` are in active development; the WG is "optimistic to finish late 2026 or early 2027." ([https://www.w3.org/wiki/WebTransport/Meetings2023](https://www.w3.org/wiki/WebTransport/Meetings2023)) ([https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)) Once it ships in stable across all browsers, expect it to displace WebSocket for serious real-time use cases and to compete with WebRTC data channels for low-latency media. [W3C](https://www.w3.org/wiki/WebTransport/Meetings2023)

**Post-quantum TLS is no longer a thought experiment.** NIST published FIPS 203 (ML-KEM, the standardised name for Kyber) on 13 August 2024. Cloudflare reports that, as of mid-September 2025, ~43% of human-generated connections to its network use the hybrid X25519+ML-KEM-768 key agreement; in March 2025 the figure crossed 38%. NIST plans to deprecate classical key agreement by 2030 and disallow it by 2035. Cloudflare announced in April 2026 that it has accelerated its target for full post-quantum coverage to **2029** in light of "recent advances in quantum hardware and software." ([https://blog.cloudflare.com/automatically-secure/](https://blog.cloudflare.com/automatically-secure/)) ([https://blog.cloudflare.com/post-quantum-zero-trust/](https://blog.cloudflare.com/post-quantum-zero-trust/)) ([https://blog.cloudflare.com/http3-usage-one-year-on/](https://blog.cloudflare.com/http3-usage-one-year-on/)) [Cloudflare + 2](https://blog.cloudflare.com/automatically-secure/)

**OAuth 2.1 and structured field values.** The OAuth 2.1 draft (`draft-ietf-oauth-v2-1-15`, March 2026) is in late stages — it consolidates RFC 6749, RFC 6750, RFC 7636, RFC 8252 and removes the implicit grant and the resource-owner-password grant outright. ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) RFC 8941 (Structured Field Values for HTTP) is increasingly used in new HTTP features. **RFC 9728 (Protected Resource Metadata)** is the discoverability piece that, combined with OAuth 2.1, finally makes "paste a URL and authenticate" workable across MCP, A2A, and any new HTTP API. [OAuth](https://oauth.net/2.1/)

**The agent-protocol stack consolidates.** By April 2026 Anthropic, OpenAI, Google, Microsoft, and Block are all under one Linux-Foundation umbrella (the AAIF) governing both MCP and A2A; ChatGPT, Claude, Gemini, Cursor, Windsurf, JetBrains AI Assistant, and the Vercel AI SDK all speak MCP. ([https://www.pento.ai/blog/a-year-of-mcp-2025-review](https://www.pento.ai/blog/a-year-of-mcp-2025-review)) The OAuth 2.1 + Resource Indicators + Streamable HTTP combination has converted MCP from "stdio-localhost-only" to a remote, multi-tenant, cloud-native protocol in 17 months. ([https://zylos.ai/research/2026-03-08-mcp-remote-evolution-streamable-http-enterprise-adoption](https://zylos.ai/research/2026-03-08-mcp-remote-evolution-streamable-http-enterprise-adoption))

**Streaming-first APIs.** OpenAI's streaming chat completions (SSE) made server-streamed token responses a default UX. Every AI product API now ships SSE; many also ship MCP servers. Streaming is no longer an "advanced" feature — it's a baseline.

**The decline of SOAP and the GraphQL plateau.** SOAP usage outside government/finance/telco is in steady, multi-year decline; SOAP 1.2 has had no substantive update since 2007. GraphQL adoption hit a plateau at the *project* level — surveys in 2024 found ~14% of teams uncertain or unfamiliar, ~60% sticking with REST — but a Gartner-reported jump in *enterprise* federated-GraphQL adoption (from <30% in 2024 toward >60% projected) indicates the technology is moving from "default API style for new products" to "API-aggregation layer." ([https://thenewstack.io/graphql-growth-explodes-but-so-do-problems-federated-graphs-solve/](https://thenewstack.io/graphql-growth-explodes-but-so-do-problems-federated-graphs-solve/)) ([https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption](https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption)) Note: those Gartner figures are *projections* reported by The New Stack; treat them as directional, not measured. [LinkedIn](https://www.linkedin.com/pulse/exploring-continued-relevance-graphql-apis-2024-insights-rafael-rocha-zpbcf)[The New Stack](https://thenewstack.io/graphql-growth-explodes-but-so-do-problems-federated-graphs-solve/)

**gRPC-Web is being replaced by Connect.** Connect-RPC joined CNCF in 2024 and has displaced grpc-web at multiple major shops (Bluesky, Dropbox, CrowdStrike per Buf). ([https://buf.build/blog/connect-rpc-joins-cncf](https://buf.build/blog/connect-rpc-joins-cncf)) gRPC itself remains the default *internal* RPC for most large polyglot infrastructures. [Buf](https://buf.build/blog/connect-rpc-joins-cncf)[Buf](https://buf.build/blog/connect-rpc-joins-cncf)

**Edge computing reshapes API design.** APIs hosted on Cloudflare Workers, Vercel Edge, Deno Deploy, and Fastly Compute@Edge run hundreds of milliseconds closer to users but lose access to long-running TCP connections. This is making *stateless* and *short-request* designs (REST, MCP Streamable HTTP) attractive again over WebSocket-pinning approaches.

**What I'd guess will be obsolete in five years:**

- WebSocket as a default for new browser real-time work (replaced by WebTransport).
- gRPC-Web (replaced by Connect or wire-spec gRPC over HTTP/3 once browsers expose the right primitives).
- HTTP/2 server push (already obsolete).
- HTTP+SSE as MCP's transport (already deprecated).
- The implicit OAuth grant (formally removed in OAuth 2.1).
- Classical-only TLS deployments (NIST deprecation 2030, disallowed 2035).
- SOAP outside hard legacy environments.

**What I'd bet *won't* be obsolete:** REST + JSON, OpenAPI as the description language, gRPC for internals, WebSocket where it's already deployed, and HTTP/1.1 — your printer will still speak it in 2031.

---

## Hooks for the article, infographic, and podcast

### 60-second narrated hook (for the ear)

> "In 1989, a physicist at CERN wrote a memo his boss called 'vague but exciting.' It described a one-line protocol — 'GET, slash, file name' — and a way for documents to point at each other. Thirty-six years later, every Slack message, every TikTok scroll, every airline check-in, every AI assistant talking to a database is still that protocol. It just has new clothes: HTTP/3, WebSockets, gRPC, GraphQL, and — as of November 2024 — a brand-new layer for AI agents called the Model Context Protocol. The web isn't a thing. It's a 35-year-old conversation between research labs and big tech about how computers should talk. And right now, in 2026, that conversation is the noisiest it's been in twenty years."

### A striking statistic that captures importance

In October 2023, the **HTTP/2 Rapid Reset** vulnerability (CVE-2023-44487) produced the largest DDoS attacks ever recorded: **398 million requests per second at Google, 201 Mrps at Cloudflare, 155 Mrps at Amazon — all using a single feature of HTTP/2 that everyone implemented correctly per the spec.** ([https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/))

### A "pause and think" moment

Anthropic open-sourced the Model Context Protocol on **25 November 2024**. By **April 2026** — seventeen months later — surveys put MCP adoption at 78% of enterprise AI teams, with a public registry of 9,400+ servers and first-class support across Claude, ChatGPT, Gemini, Cursor, Windsurf, JetBrains, and the Vercel AI SDK; in December 2025 Anthropic *donated* it to a Linux Foundation directed fund co-founded with OpenAI. ([https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)) ([https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)) For comparison, *HTTP/2 — the most consequential web protocol of the last decade — took six years from SPDY-in-Chrome to RFC*. (Note: the 78% / 9,400 figures come from a single industry analysis — Digital Applied — and should be treated as a directional snapshot rather than an audited number.)

### Failure-story arc — the HTTP/2 Rapid Reset attack

**Setup.** HTTP/2 was designed in 2012–2015 to be everything HTTP/1.1 wasn't: multiplexed, binary, fast. One of its features was elegant — a client could cancel a stream at any time by sending a `RST_STREAM` frame, freeing the server to serve something else. By 2023, every CDN, every load balancer, every gRPC server in the world implemented it. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))

**Mistake.** Nobody read the implications carefully enough. RFC 9113 limits *concurrent* streams (`SETTINGS_MAX_CONCURRENT_STREAMS`), but it doesn't limit *cancelled* streams. A client could open a stream, cancel it before the server even finished bookkeeping, open another in its place, cancel that, and so on — effectively burning unlimited server CPU for almost zero client cost. Cloudflare engineers later noted: *"The crux of what makes CVE-2023-44487 work."* ([https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/))

**Consequence.** Beginning in August 2023, attackers used this technique against the world's largest properties. Google absorbed an attack peaking at **398 million requests per second** — seven times bigger than any prior recorded HTTP DDoS. Cloudflare saw **201 Mrps**. AWS saw **155 Mrps**. Every modern web server — nginx, Envoy, Netty, Go's `net/http`, IIS — was vulnerable; only HAProxy, by accident of a 2018 design choice, was immune. ([https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)) ([https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487](https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487))

**Resolution.** On 10 October 2023, Google, AWS, and Cloudflare coordinated public disclosure. Patches went out within days. CISA issued an advisory. Cloudflare temporarily lowered max concurrent streams to 64 — and accidentally broke image galleries that assumed 100 — then settled on 100 with rate-limiting on cancellations. Eight months later, surveys showed >97% of public HTTP/2 endpoints patched. The lesson, per Cloudflare's own write-up: *"Where issues start to crop up is when there is any kind of delay or lag in tidying up. The client can churn through so many requests that a backlog of work accumulates."* The protocol was correct. The implementations were correct. The interaction between them was not. That is the perennial story of this entire protocol family.

---

## Caveats

1. Several adoption figures in this report — particularly MCP server counts (9,400+) and enterprise adoption percentages (78%) — come from industry analyses (Digital Applied, Pento, Gartner-via-The New Stack) rather than audited primary sources. They are directional, not measured. ([https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol))
2. The user-supplied date for HTTP/1.1 (1997) is the date of RFC 2068; the practical specification engineers worked from for 15 years was RFC 2616 (1999), and the *current* normative spec is RFC 9110/9111/9112 (2022). Use 2022 when accuracy matters.
3. The user-supplied date for SOAP (1998) is the year XML-RPC shipped, not SOAP itself; SOAP 1.1 was a W3C Note in 2000 and SOAP 1.2 a Recommendation in 2003.
4. The user-supplied date for JSON-RPC (2005) refers to JSON-RPC 1.0; JSON-RPC 2.0 (the version everything actually uses, including MCP and A2A) was specified in 2010.
5. A2A's adoption trajectory has been bumpier than MCP's; one September 2025 industry analysis described A2A as having "quietly faded into the background." ([https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/)) Google's July 2025 v0.3 release and the Linux Foundation donation arrest the decline narrative; the protocol is alive but its dominance is not assured.
6. WebTransport is in active drafting; specifics (header support, CORS preflight semantics, certificate-hash handshake) are still under negotiation and likely to change before the final RFC. ([https://www.w3.org/wiki/WebTransport/Meetings2023](https://www.w3.org/wiki/WebTransport/Meetings2023))
7. Quantum-computing timelines drive the post-quantum TLS deployment timeline; Cloudflare's 2026 acceleration of their target to 2029 reflects updated *expert opinion*, not certainty about when a cryptographically-relevant quantum computer will exist. ([https://blog.cloudflare.com/automatically-secure/](https://blog.cloudflare.com/automatically-secure/))
8. The "GraphQL adoption plateau / federation surge" narrative is supported by multiple 2024–2025 surveys but rests in part on *projections* rather than measurements; specific percentages (e.g., the Gartner figure of <30%→60%) should be cited as projected.
9. For SSE, the prompt's "2006" is the date of Opera's experimental implementation; the formal specification has continuously moved — first as a separate W3C Working Draft, now living entirely inside the WHATWG HTML Living Standard at §9.2.