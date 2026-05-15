---
id: sse
type: protocol
name: Server-Sent Events
abbreviation: SSE
etymology: "[S]erver-[S]ent [E]vents — Hickson's literal description; Opera's 2006 implementation called it 'event streaming to web browsers'"
category: web-api
year: 2006
rfc: WHATWG HTML Living Standard, §9.2
standards_body: WHATWG
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ai-protocols
  - web-api/rest-and-graphql
  - web-api/websockets-and-sse
  - web-api/mcp-and-a2a
related_protocols: [a2a, http1, http2, http3, mcp, websockets, graphql, rest, json-rpc]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/500px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg
    caption: Ian Hickson at a W3C Working Group meeting. As editor of the HTML5 specification, Hickson authored the Server-Sent Events spec — giving browsers a native, lightweight way to receive real-time server pushes over plain HTTP.
    credit: Photo — Molly Holzschlag / CC BY-SA 2.0, via Wikimedia Commons
visual_cues:
  - "A single browser-to-server arrow drawn as a long, thin tube labelled 'one HTTP response, never finished'. Inside the tube, discrete event-blocks float by — each labelled with event:, id:, data:, retry: fields, separated by blank lines. The tube enters the server as `Accept: text/event-stream` and exits with `Content-Type: text/event-stream; charset=utf-8`."
  - "A timeline split in two columns. Left column 'WebSocket era 2011–2023': Slack, Discord, Figma, multiplayer logos stacked. Right column 'LLM era 2023–2026': OpenAI, Anthropic, Google Gemini, Cloudflare Workers AI logos stacked, with a thick arrow labelled `data: {...}\\n\\n` flowing down. A bold caption between the columns: 'every major LLM provider chose SSE for token streaming.'"
  - "The MCP transport-churn diagram. Top: '2024-11-05 — HTTP+SSE' showing two parallel pipes between client and server, one labelled `/sse` (server→client), one labelled `/messages` (client→server POST). Middle, a red strikethrough. Bottom: '2025-03-26 — Streamable HTTP' showing a single pipe `/mcp` with two annotations: 'POST → either application/json or text/event-stream' and 'optional GET → SSE for server-initiated notifications'. Caption: 'SSE is not gone — it is now an optional response mode.'"
  - "A reconnection sequence. Browser EventSource on the left, Server on the right. Events flow with id: 1, id: 2 — then a jagged red 'network drop'. The browser waits the reconnection time (default ~3 seconds), then issues `GET /events` with `Last-Event-ID: 2` in the request header. The server replies '200 OK + replay events 3..n'. Caption underneath: 'built-in resume — no manual logic.'"
  - "A horizontal bar chart of the canonical production pitfalls: 'nginx buffer (no X-Accel-Buffering: no)', 'gzip buffering until window fills', 'AWS ALB 60s idle timeout', 'Azure App Service 4-min timeout', 'six concurrent EventSource limit on HTTP/1.1', 'CR/LF injection into event:/id:'. Each bar capped with the canonical fix in green: 'X-Accel-Buffering: no', 'no-transform', ': ping every 15s', ': ping every 15s', 'switch to HTTP/2', 'strip CR/LF'."
  - "Two side-by-side wire formats. Left, an OpenAI Chat Completions stream: `data: {chunk}\\n\\n` events with no `event:` lines, ending with the literal `data: [DONE]\\n\\n`. Right, an Anthropic Messages stream: named `event: message_start`, `event: content_block_delta`, `event: content_block_stop`, `event: message_stop`, with periodic `event: ping`. Caption: 'two conventions, both copied by hundreds of derivative APIs — neither is in the SSE spec.'"
---

# SSE — Server-Sent Events

## In one breath

Server-Sent Events is a small WHATWG standard for one-way server-to-client text streaming over a normal HTTP response with `Content-Type: text/event-stream`. Ian Hickson specified it, Opera 9 first shipped it in September 2006, and for nearly two decades it lost mindshare to WebSocket. Then ChatGPT happened — and OpenAI, Anthropic, Google Gemini, and Cloudflare Workers AI all chose SSE as the wire format for streaming LLM tokens. By March 2026, MCP — which rides on SSE — had crossed 97 million monthly SDK downloads, the fastest adoption curve for any AI infrastructure standard ever measured.

## The pitch (cold-open)

For eighteen years SSE was the answer to a quiz question. WebSocket arrived in 2011 and ate every real-time use case — chat, multiplayer, dashboards, collaborative editing. SSE survived as a footnote in §9.2 of the HTML Living Standard. Then every major LLM provider — every single one — picked SSE as the way to stream tokens to a browser. Today it is the wire format underneath the agentic web. This episode: how it actually works on the wire, where it dies in production, and what changed in MCP between November 2024 and March 2025 that made SSE both more important and officially deprecated at the same time.

## How it actually works

SSE is a fully conforming HTTP response that the server simply never finishes. The client opens an ordinary `GET` with `Accept: text/event-stream`. The server replies `200 OK` with `Content-Type: text/event-stream`, omits `Content-Length`, and starts writing UTF-8 text into the body. On HTTP/1.1 the body uses chunked transfer encoding and the terminating zero-chunk is just never sent. On HTTP/2 and HTTP/3 the same payload bytes ride inside DATA frames. There is no protocol upgrade, no handshake, no special port — SSE traverses every CDN, WAF, corporate proxy, and load balancer because it is not asking the network to do anything new.

Each event is a block of text terminated by a blank line. Inside the block, every line is a single field: `event:` for the type, `id:` for tracking, `data:` for the payload, `retry:` for the reconnection interval. Lines starting with `:` are comments — that is how heartbeats work. Multiple `data:` lines in the same block concatenate with `\n` between them. Anything else is silently ignored.

When the connection drops — and it will — the browser waits the reconnection time (default around three seconds in Chrome, Firefox, and Safari), reissues the `GET`, and includes a `Last-Event-ID` header carrying whatever the last `id:` field said. The server reads that header and resumes from the right place. None of this is application code. The browser's built-in `EventSource` does it for you in three lines of JavaScript: `new EventSource(url)`, `es.onmessage = ...`, done.

The simulator transcript is a clean walkthrough: client opens the EventSource with `Accept: text/event-stream`, server replies with `Content-Type: text/event-stream` and keeps the connection open, three events flow with incrementing `id:` fields and a `retry: 5000`, then the client calls `eventSource.close()` and the browser sends a TCP FIN. No state to negotiate, no frames to mask, no upgrade dance.

### Header at a glance

There is no SSE header — SSE rides inside HTTP. The interesting fields are at two levels.

On the HTTP envelope, the server must send:

- `Content-Type: text/event-stream` — mandatory; without it the browser rejects the response.
- `Cache-Control: no-cache, no-transform` — `no-cache` keeps intermediaries from serving a cached snapshot; `no-transform` is an advisory hint to disable gzip rewriting.
- `Connection: keep-alive` — required on HTTP/1.1.
- `X-Accel-Buffering: no` — nginx-specific but widely respected; without it nginx buffers the response and your real-time stream becomes a real-time-ish stream.
- `Transfer-Encoding: chunked` — implicit on HTTP/1.1.

Inside the event-stream body, every event is built from at most four named fields:

- `event:` — sets the event type. Default is `"message"`. Determines which `addEventListener` callback fires on the browser side.
- `data:` — the payload. Concatenates across multiple `data:` lines in the same block.
- `id:` — sets the last-event-ID buffer. Crucially, this buffer is **not** reset between events; it persists, and the browser sends its current value as `Last-Event-ID` on reconnect.
- `retry:` — if the value is ASCII digits only, sets the reconnection time in milliseconds.

A line that starts with `:` is a comment and gets ignored. That is the entire keep-alive mechanism: send `: ping\n\n` every fifteen seconds and idle proxies stop killing your connection.

### State machine in three sentences

SSE has no protocol-level state machine on the server — the server just writes lines into an open socket until somebody hangs up. The browser side has a tiny three-state `readyState`: `0` (CONNECTING), `1` (OPEN), `2` (CLOSED), with reconnection driven by the `retry:` field and a `Last-Event-ID` header. The dispatch algorithm is a four-rule loop over the body: empty line dispatches the buffered event, comment lines are ignored, lines without a colon are treated as the field name with empty value, and everything else is `name:value` with at most one leading space stripped.

### Reliability and security mechanics

Reliability is built in at exactly one layer: the browser auto-reconnects, and `Last-Event-ID` lets the server resume. There is no acknowledgement back from client to server — SSE is one-way. If the server wants to know whether the client received an event, it has to wait for the client to come back with a higher `Last-Event-ID` after a disconnect. For genuine end-to-end delivery guarantees you build a sequence-number protocol on top.

Security is mostly inherited from HTTP: TLS for the channel, cookies or query-string tokens for auth (because `EventSource` cannot set custom headers — no `Authorization`), CORS via `withCredentials: true` plus matching `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`. The structural footguns are CR/LF injection (echoing untrusted input into `event:` or `id:` lets an attacker spoof event types or corrupt the reconnect ID) and binding to `0.0.0.0` for "internal" SSE services that browsers in any tab can then drive-by reach — the bug that produced CVE-2025-49596 in MCP Inspector.

## Where it shows up in production

**Every major LLM provider streams tokens as SSE.** OpenAI's Chat Completions API (`stream: true`) sends `data: {chunk JSON}\n\n` events with no `event:` line and ends with the literal `data: [DONE]\n\n` sentinel. The newer Responses API uses named events — `response.created`, `response.output_text.delta`, `response.completed` — each with a `sequence_number` for ordering. Anthropic's Messages API emits named events `message_start`, `content_block_start`, `content_block_delta` (with `text_delta`, `input_json_delta` for streaming tool calls, `signature_delta`, `thinking_delta`), `content_block_stop`, `message_delta`, `message_stop`, plus periodic `ping` events. Google Gemini and Cloudflare Workers AI both stream as SSE; from a client's perspective they look the same.

**Cloudflare Workers AI** is the textbook hyperscaler case. Switches `Content-Type` to `text/event-stream` when the client sets `stream: true`, ends with `data: [DONE]`. Cloudflare's AI Gateway buffers the stream so it survives mid-inference client disconnects — a reliability play unique to the gateway pattern. Cloudflare's internal AI engineering platform routes around 688,000 requests per day and 10.6 billion tokens per day through AI Gateway, much of it streaming SSE.

**MCP — the Model Context Protocol — is the headline 2024–2026 deployment.** Anthropic launched it on November 25, 2024 with stdio plus an HTTP+SSE transport that used two endpoints: `GET /sse` for the long-lived server→client stream, `POST /messages` for client→server JSON-RPC requests. The 2025-03-26 spec replaced that with Streamable HTTP — a single `/mcp` endpoint where POST responses can either be `application/json` or upgrade into a `text/event-stream` stream. SSE is not gone in MCP; it is now the streaming response mode of Streamable HTTP. By March 2026 the MCP SDKs had crossed 97 million monthly downloads. We unpack the full transport churn in the chapter episode on MCP and A2A — go listen to that one for the story; here we're sticking to the wire.

**A2A — Google's Agent-to-Agent protocol, donated to the Linux Foundation in mid-2025** — uses SSE as its streaming response mode. Two RPC methods: `message/send` (single JSON response) and `message/stream` (`text/event-stream` of `TaskStatusUpdateEvent` and `TaskArtifactUpdateEvent` events as the agent works).

**Mercure** (Kévin Dunglas, IETF Internet-Draft `draft-dunglas-mercure-07`) is the production-grade pub/sub protocol layered on SSE. A Caddy-based hub holds the SSE connections; publishers `POST` updates with topic selectors; subscribers connect via `EventSource` with `?topic=...` and JWT auth. Symfony's `symfony/mercure` integration is the most prominent first-class adopter. Dunglas explicitly markets Mercure now for "streaming LLM tokens, agent steps, or any other server-driven update."

**htmx 4** treats any response with `Content-Type: text/event-stream` as a streaming swap by default — no extension needed, the SSE handling hooks straight into the standard request pipeline. Atlassian Rovo, Spring AI, Apollo Server, GraphOS Router, Cloudflare Agents SDK, LangChain Agent Server, Claude Code, ChatGPT Desktop, and every major MCP host all carry SSE in some form, either as legacy MCP transport, as Streamable HTTP's response mode, or as the wire format of an underlying LLM call.

**Server libraries** worth knowing in 2026: `sse-starlette` for FastAPI/Starlette (full-spec implementation, 2,200-plus GitHub stars, multi-loop, graceful shutdown, supports Python 3.9–3.13); Django's `StreamingHttpResponse` and Django Channels; Go's `net/http` plus `http.Flusher` and gin's `c.SSEvent()`; Spring MVC's `SseEmitter`; Rails' `ActionController::Live`; axum's `Sse` extractor in Rust; Symfony's `StreamedResponse` plus `flush()` in PHP; `hermes_mcp` in Elixir.

## Things that go wrong

**MCP Inspector and CVE-2025-49596 — the drive-by localhost breach.** July 2025. MCP Inspector — a developer tool for poking at MCP servers — bound its local web UI to `0.0.0.0:6277` and exposed a `/sse` endpoint with no authentication and no Origin checks. Any malicious website, in any tab, in any browser, on any computer running MCP Inspector could connect to that local SSE endpoint and trigger arbitrary tool calls. No CORS guard saved you because SSE is just an HTTP `GET`. Within days the MCP spec mandated `Origin` validation with HTTP 403 on mismatch, and required cryptographically secure session IDs. Within weeks Docker shipped MCP Gateway with stdio-only transport as a structural fix.

What it taught the industry: the price of being the protocol that traverses every network without fuss is that you accidentally traverse every network without fuss. Streamable HTTP wasn't just an architectural cleanup — it was a security fix.

**CVE-2022-1650 — `eventsource` npm leaks credentials on cross-origin redirect.** The Node implementation of `EventSource` failed to strip cookies and `Authorization` headers when following redirects to a different origin. A malicious server could harvest credentials. CVSS 9.3 on Snyk, fixed in 1.1.1 / 2.0.2. The blast radius was huge because `eventsource` was a transitive dependency of webpack-dev-server, sockjs-client, and most Angular dev stacks; Ubuntu issued USN-6082-1, Debian backported through the security tracker.

**The NestJS SSE injection class of bug.** `SseStream._transform()` in `@nestjs/core` versions before 11.1.18 interpolated user-controlled `message.type` and `message.id` directly into the SSE wire format without sanitising `\r` or `\n`. Three primitives: forge an `event:` type to trigger a different `addEventListener` callback, inject `data:` lines that may then be rendered as HTML by the client, forge `id:` to make `Last-Event-ID` skip messages on reconnect. The lesson generalises: never echo untrusted strings into SSE field values without stripping CR/LF.

**CVE-2025-6515 — predictable session IDs in HTTP+SSE MCP servers.** An attacker who guessed or sniffed a session ID could submit malicious requests that flowed back to the legitimate client via the original SSE stream. The 2025-03-26 Streamable HTTP mandate of cryptographically secure session IDs was the structural fix. **CVE-2025-6514** (CVSS 9.6) was an RCE in `mcp-remote` versions before 0.1.16 from a malformed server response — every agent using `mcp-remote` to bridge stdio clients to a remote SSE server was vulnerable. **CVE-2025-56406** was an RCE in `mcp-neo4j` 0.3.0 due to its SSE service requiring no authentication when bound to `0.0.0.0` — same NeighborJack-style local-network exploitation pattern.

**OpenAI's December 2024 outage.** December 11, 2024, 3:16 pm to 7:38 pm Pacific. A new telemetry deployment overwhelmed the Kubernetes control plane fleet-wide. ChatGPT, Sora, and the API were down or degraded for over four hours, including streaming endpoints. Two weeks later, December 26: 90-percent-plus error rates from a cloud-provider data-center power failure; OpenAI's databases were globally replicated but region-wide failover required manual intervention. A separate post-mortem documented routing-layer nodes hitting memory limits because a `responseBuffer` was allocated in a loop rather than reused — SSE-streaming endpoints were the primary victims because they kept connections (and buffers) alive longest.

**The eternal corporate-proxy strip.** Many enterprise web filters and "AI gateways" buffer or strip `text/event-stream` responses entirely. Ably's engineering blog: "we've seen this repeatedly — customers migrate from SSE to WebSockets after discovering their SSE connections work in development but buffer unpredictably in production environments." Mid-stream cut-offs in OpenAI's developer forum (especially around the Assistants API in 2025) are typically an idle-timeout-or-buffering issue at an intermediary, not in the model.

## Common pitfalls (for the practitioner)

1. **nginx (and FastCGI, and Apache) buffer responses by default.** Set `X-Accel-Buffering: no` on every SSE response; set `proxy_buffering off` in the nginx config. Symptom: events accumulate until a buffer fills, then arrive in clumps. Cure: those two settings, every time.

2. **gzip buffers until the gzip window fills.** Disable compression for `text/event-stream`. `Cache-Control: no-transform` is advisory only — explicitly disable in your stack.

3. **AWS ALB cuts idle connections at 60 seconds. Azure App Service and Application Gateway at 4 minutes. Corporate proxies anywhere in between.** Send `: ping\n\n` every 15 seconds. Microsoft's own SSE-on-Azure FAQ recommends exactly this.

4. **HTTP/1.1's six-connections-per-origin cap.** Open six tabs of an SSE-driven app to the same origin and the seventh tab silently stalls — including images and CSS for normal page loads. Both Chromium (issue 275955) and Firefox (bug 906896) marked the request to lift this limit "Won't fix." The cure is structural: switch to HTTP/2. Multiplexing turns the 6-connection limit into a 100-stream limit.

5. **Reconnect storms.** Server returns 5xx, every client retries simultaneously, server never recovers. Use a server-driven `retry:` value, exponential backoff (start 1 second, cap 30–60 seconds), and HTTP 204 to tell well-behaved clients to stop reconnecting permanently. A 5xx is a "retry"; a 4xx is fatal.

6. **Forgetting to handle client disconnect on the server.** The HTTP request stays "open" in your code while the TCP socket is dead — leaks memory, goroutines, threads. Use the framework's disconnect callback (`req.is_disconnected()` in FastAPI, `Context.Done()` in Go, etc.).

7. **CR/LF injection into `event:` or `id:`.** Strip `\r` and `\n` from anything you interpolate. The NestJS class of bug.

8. **Naïvely binding to `0.0.0.0` for an "internal" SSE service.** The MCP Inspector class of bug. Bind to `127.0.0.1` for local-only services, validate `Origin` for browser-reachable ones.

9. **`EventSource` cannot set custom headers.** No `Authorization`, no API keys. Options: cookie-based session with `withCredentials: true` and matching CORS, signed token in the query string (and accept that it lands in your access logs), or use Microsoft's `@microsoft/fetch-event-source` which wraps `fetch()` and re-implements the SSE parser. Most LLM SDKs effectively do the third one.

10. **Common misconfigurations.** Trailing slash on a CDN cache key turning a stream into a cached `200`. A load balancer with body-buffer-size 1 MB silently buffering the first megabyte of stream output. Application Gateway with a default 4-minute idle timeout cutting streams that go quiet during long LLM "thinking" pauses.

## Debugging it

**`curl -N -H 'Accept: text/event-stream' https://...`** — the `-N` flag is critical. It disables curl's output buffering, so events print as they arrive. Without it, you watch a blank screen and conclude the server is broken.

**Browser DevTools → Network → click the SSE request → "EventStream" tab.** Chrome, Edge, and Firefox all expose parsed events in this tab — type, ID, data, and arrival time. This is the single most useful client-side diagnostic.

**[https://sse.dev/](https://sse.dev/)** — a hosted playground that emits a JSON event every two seconds. Supports `?interval=` and `?jsonobj=` query parameters. Great for poking from any client, including `curl`.

**What to monitor in production:** active SSE connections, reconnect rate per 5 minutes, message lag p50/p99 (server-side timestamp versus client-ack timestamp), heartbeat round-trip, bytes per event. A spike in reconnect rate is your earliest warning of an intermediary stripping or buffering streams.

**For MCP debugging specifically** in the post-2025-03-26 world: the request goes to a single endpoint, the response Content-Type tells you whether you got JSON or an SSE stream, and the `Mcp-Session-Id` header keeps requests within a session. Old `/sse` plus `/messages` endpoints are deprecated; if you're still wiring those up, you're shipping the soon-to-be-removed transport.

## What's changing in 2026

**November 2025 — MCP 2025-11-25, the anniversary release.** Introduces an experimental `Tasks` primitive for long-running async operations with states `working`, `input_required`, `completed`, `failed`, `cancelled`. Adds OAuth client-credentials authorization via SEP-1046 and OAuth Client ID Metadata Documents via SEP-991. SEP-1699 clarifies SSE polling: servers may disconnect at will, and resumption always happens via `GET` regardless of stream origin. Officially marked backward-compatible.

**December 2025 — Anthropic donates MCP to the Agentic AI Foundation.** A directed fund of the Linux Foundation, co-founded with Block and OpenAI; platinum members include AWS, Google, Microsoft, Cloudflare, and Bloomberg. SSE rides shotgun underneath as the streaming response mode.

**June 2025 — MCP 2025-06-18.** Structured tool outputs, OAuth-based authorization, elicitation (server-initiated user prompts), security best-practice guidance.

**April 2025 — A2A launches.** Google announces A2A on April 9, 2025 with 50-plus partners (Atlassian, Box, Cohere, Salesforce, SAP, MongoDB, etc.), donates to the Linux Foundation. Built on HTTP, JSON-RPC 2.0, and SSE; `message/stream` returns `text/event-stream`.

**April 2025 — MCP Streamable HTTP ships.** The 2025-03-26 spec replaces HTTP+SSE with Streamable HTTP. The `@modelcontextprotocol/sdk` v1.10.0 on April 17, 2025 is the first SDK release. ChatGPT's MCP support is Streamable HTTP only — no stdio, no legacy SSE. Atlassian Rovo's `mcp.atlassian.com/v1/sse` endpoint is scheduled for removal on June 30, 2026. Keboola's removal deadline is April 1, 2026.

**Vercel AI SDK 5 (2025)** standardises on SSE as its default transport but exposes a pluggable `ChatTransport` interface. Teams that need mid-stream signals — cancel, approve tool, steer — increasingly bolt WebSocket transports on top.

**The eternal `EventSource`-can't-set-headers problem.** A long-running open issue on the WHATWG HTML repo seeks to fix this; multiple commenters note movement in late 2025 / early 2026 toward a working browser implementation that lets `EventSource` accept additional `fetch` options like custom headers and POST bodies. If this lands, Microsoft's `fetch-event-source` and the Vercel/Anthropic/OpenAI workarounds collapse into the standard.

**WebTransport will not obsolete SSE in 2026.** WebTransport over HTTP/3 ships in Chrome and Edge, partial in Firefox, absent in Safari. Get Stream's blunt 2026 assessment: "give it another two or three years. For now, the choice is between WebSocket and SSE." Even if WebTransport ships everywhere, it solves a different problem — multiplexed bidirectional streams plus unreliable datagrams, mostly for media and games. For "send prompt, stream tokens" it offers no advantage.

**HTTP/2 server push deprecation does not affect SSE.** Server push (RFC 7540) and SSE are unrelated; people confuse them constantly. Chrome 106 in October 2022 disabled server push by default for under-1-percent adoption. SSE is fine — in fact, HTTP/2 multiplexing is what made SSE practical at scale.

## Fun facts (host material)

The protocol has no IETF RFC. It lives inside §9.2 of the WHATWG HTML Living Standard — there is no separate spec document, no RFC number, nothing the IETF stamped. The closest IETF touchpoint is RFC 8895, "Application-Layer Traffic Optimization (ALTO) Incremental Updates Using SSE," which uses but does not specify SSE. The WHATWG snapshot fetched for our research carries "Living Standard — Last Updated 2 May 2026."

The WHATWG was founded two days after Mozilla and Opera lost a W3C workshop vote, 8 to 11, on the future of web applications. June 4, 2004. SSE is one of the youngest specs of the original WHATWG Web Applications 1.0 batch — the document that eventually became HTML5. We tell that founding story in the chapter episode on WebSockets and SSE.

The original SSE design was, per Opera's own retrospective, "really quite complex" — there was a custom HTML element called `<eventsource>` declaring a URL whose response would be parsed as a stream of DOM events. Mozilla's Jonas Sicking essentially threw it out and rebuilt it as a JavaScript object closely modeled on `XMLHttpRequest`. The element disappeared, the `EventSource` API replaced it, the message format collapsed to a tiny line-oriented grammar.

`data: [DONE]\n\n` is not in the SSE spec. OpenAI invented it for Chat Completions. Anthropic chose `event: message_stop` instead. Both have been copied by hundreds of derivative APIs, and the two camps quietly disagree about which is the right pattern. Neither is canonical SSE.

MCP's transport spec was hammered out in the days around US Thanksgiving 2024. The Latent Space "One Year of MCP" episode from November 2025 reveals that the first MCP IDE implementation was written by the MCP creators themselves in the Zed editor about a month and a half before the November 25, 2024 public launch.

The connection-limit bug numbers are immortal. Chromium issue 275955 — "Limit of 6 concurrent EventSource connections is too low." Firefox bug 906896 — "Increase number of permitted EventSource connections." Both: WONTFIX. The fix was a different protocol version: HTTP/2 with multiplexing.

The shape of why SSE won the AI streaming era is worth sitting with. WebSocket beats SSE on bidirectionality, on binary framing, on lower header overhead — by every "technical properties" measure WebSocket should have continued to dominate. But the protocol that wins isn't the one with the best technical properties. It's the one that traverses every existing piece of infrastructure unchanged. SSE is just an HTTP response. CDNs, proxies, WAFs, corporate firewalls, load balancers, CI/CD platforms, serverless cold-start paths, Cloudflare-Access-style zero-trust gateways — they all already work. WebSocket asks the network to upgrade the connection. SSE asks the network to read a normal response a little more slowly than usual.

## Where this connects in the book

- **Part Foundations, "Protocols for AI Agents"** — the chapter that situates MCP and A2A as the new layer of protocols designed specifically for AI agents. SSE is the streaming substrate underneath both.
- **Part Web/API, "REST and GraphQL"** — Roy Fielding's REST architecture, Facebook's 2012 mobile pain that produced GraphQL, and the two competing GraphQL subscription transports (`graphql-ws` over WebSocket, and the increasingly preferred `graphql-sse` over text/event-stream). The chapter covers why `gqlgen` and `graphql-yoga` default to SSE for new projects.
- **Part Web/API, "WebSockets and SSE"** — the chapter that tells the full SSE story: Hickson, Opera 9 in September 2006, the eighteen-year mindshare loss to WebSocket, and the LLM-driven renaissance. Includes the WebTransport question and the HTTP/2 bootstrap (RFC 8441 and RFC 8442) that few people deploy.
- **Part Web/API, "MCP and A2A"** — the chapter on the protocol layer for AI agents, built deliberately boring on top of JSON-RPC, HTTP, and SSE. This is where the November 2024 launch, the March 2025 transport churn, and the SEP-1288 WebSocket proposal live as a story rather than a wire-format walkthrough.

## See also (other protocol episodes)

**WebSocket.** The eternal comparison. WebSocket starts as an HTTP/1.1 `Upgrade: websocket` handshake then leaves HTTP entirely for a full-duplex framed TCP channel — once upgraded, no HTTP machinery (caching, request retries, `Authorization` headers, request IDs) is available. Bidirectional, binary-capable, no built-in reconnection or message replay. SSE is server-to-client only, UTF-8 only, but auto-reconnects with `Last-Event-ID` resume and rides any HTTP infrastructure unchanged. The 2026 industry consensus: start with SSE, escalate to WebSocket on demonstrated need (chat with mid-stream "stop," tool approvals, multiplayer). If you've heard the WebSocket episode, this is the contrast that frames the whole AI-streaming era.

**HTTP/2.** Multiplexing is the silver bullet for SSE's classic footgun. Up to (default) 100 concurrent streams share a single TLS-terminated TCP connection, so the 6-connection-per-origin limit becomes a 100-stream limit and effectively a non-issue. HPACK header compression makes per-stream overhead negligible compared to chunked HTTP/1.1. Listen to the HTTP/2 episode for why frame priority matters — idle SSE streams that occasionally tick should generally not be flagged as high priority, or they can starve interactive resources during congestion.

**HTTP/3.** Inherits H/2's multiplexing but moves it into QUIC, which terminates head-of-line blocking between streams. For SSE workloads with chatty heartbeats and bursty event blocks on lossy mobile networks, this is a real win. There is no SSE-specific behaviour at the QUIC layer; SSE just rides along inside an HTTP/3 response body.

**MCP.** The headline 2024–2026 deployment of SSE. The MCP episode tells the full story: the November 25, 2024 launch with HTTP+SSE's two-endpoint design, the March 26, 2025 replacement with Streamable HTTP, and how SSE survived as a streaming response mode rather than a transport in its own right. If you've heard the MCP episode, this episode is the wire-format companion.

**A2A.** Google's Agent-to-Agent protocol, donated to the Linux Foundation in mid-2025. Uses SSE as its streaming response mode via `message/stream`. The A2A episode covers the agent discovery model and the JSON-RPC, gRPC, and HTTP+JSON triple binding; here we just note that wherever A2A streams, it's SSE underneath.

**GraphQL.** GraphQL Subscriptions historically used WebSocket via `graphql-ws`. The newer `graphql-sse` (Denis Badurina) defines GraphQL over SSE with two modes — single-connection (one SSE reservation, multiple operations multiplexed by `operationId`) for HTTP/1.1 environments where the 6-connection cap matters, and distinct connections (one SSE stream per operation) for HTTP/2-plus. Apollo's GraphOS Router uses `multipart/mixed` for `@defer` and `@stream` directives. Listen to the GraphQL episode for why this matters for the @defer/@stream pattern.

**REST.** SSE complements REST cleanly: REST handles the imperative writes and synchronous reads, SSE handles the long-lived "tell me when something happens" path. Mercure formalises one such pattern: client reads a resource via REST, the response includes a `Link: <hub>; rel="mercure"` header pointing at an SSE hub URL, client subscribes via `EventSource` to receive future updates of that resource.

**JSON-RPC.** In MCP's Streamable HTTP transport, a client sends a JSON-RPC request as an HTTP POST. The server can respond with a normal JSON response or upgrade to an SSE stream. This gives JSON-RPC streaming capabilities without requiring a full WebSocket connection — exactly the pattern the JSON-RPC episode covers.

## Visual cues for image generation

- A single browser-to-server arrow drawn as a long, thin tube labelled "one HTTP response, never finished." Inside the tube, discrete event-blocks float by — each labelled with `event:`, `id:`, `data:`, `retry:` fields, separated by blank lines. The tube enters the server as `Accept: text/event-stream` and exits with `Content-Type: text/event-stream; charset=utf-8`.
- A timeline split in two columns. Left column "WebSocket era 2011–2023": Slack, Discord, Figma, multiplayer logos stacked. Right column "LLM era 2023–2026": OpenAI, Anthropic, Google Gemini, Cloudflare Workers AI logos stacked, with a thick arrow labelled `data: {...}\n\n` flowing down. A bold caption between the columns: "every major LLM provider chose SSE for token streaming."
- The MCP transport-churn diagram. Top: "2024-11-05 — HTTP+SSE" showing two parallel pipes between client and server, one labelled `/sse` (server→client), one labelled `/messages` (client→server POST). Middle, a red strikethrough. Bottom: "2025-03-26 — Streamable HTTP" showing a single pipe `/mcp` with two annotations: "POST → either application/json or text/event-stream" and "optional GET → SSE for server-initiated notifications." Caption: "SSE is not gone — it is now an optional response mode."
- A reconnection sequence. Browser EventSource on the left, Server on the right. Events flow with `id: 1`, `id: 2` — then a jagged red "network drop." The browser waits the reconnection time (default about 3 seconds), then issues `GET /events` with `Last-Event-ID: 2` in the request header. The server replies "200 OK + replay events 3..n." Caption underneath: "built-in resume — no manual logic."
- A horizontal bar chart of the canonical production pitfalls: "nginx buffer (no `X-Accel-Buffering: no`)," "gzip buffering until window fills," "AWS ALB 60s idle timeout," "Azure App Service 4-min timeout," "six concurrent EventSource limit on HTTP/1.1," "CR/LF injection into `event:`/`id:`." Each bar capped with the canonical fix in green: "`X-Accel-Buffering: no`," "`no-transform`," "`: ping` every 15s," "`: ping` every 15s," "switch to HTTP/2," "strip CR/LF."
- Two side-by-side wire formats. Left, an OpenAI Chat Completions stream: `data: {chunk}\n\n` events with no `event:` lines, ending with the literal `data: [DONE]\n\n`. Right, an Anthropic Messages stream: named `event: message_start`, `event: content_block_delta`, `event: content_block_stop`, `event: message_stop`, with periodic `event: ping`. Caption: "two conventions, both copied by hundreds of derivative APIs — neither is in the SSE spec."

## Sources

### Specifications and primary sources

- [WHATWG HTML Living Standard, §9.2 Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [W3C Server-Sent Events Recommendation (2015)](https://www.w3.org/TR/eventsource/)
- [W3C Server-Sent Events Last Call Working Draft (2009)](https://www.w3.org/TR/2009/WD-eventsource-20091222/)
- [MCP Spec — Transports (2025-03-26)](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [MCP Spec — Changelog (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/changelog)
- [Mercure Protocol Spec](https://mercure.rocks/spec)
- [IETF Internet-Draft draft-dunglas-mercure-07](https://www.ietf.org/archive/id/draft-dunglas-mercure-07.html)
- [RFC 6202 — Long-Polling and HTTP Streaming](https://datatracker.ietf.org/doc/html/rfc6202)
- [RFC 6455 — The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [RFC 6838 — Media Type Specifications](https://datatracker.ietf.org/doc/html/rfc6838)
- [RFC 9112 — HTTP/1.1 (chunked transfer coding)](https://datatracker.ietf.org/doc/html/rfc9112)
- [RFC 9113 — HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)
- [RFC 8895 — ALTO Incremental Updates Using SSE](https://datatracker.ietf.org/doc/html/rfc8895)
- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification/)
- [A2A on GitHub](https://github.com/a2aproject/A2A)

### Papers and books

- [Ilya Grigorik — High Performance Browser Networking, Chapter 16: Server-Sent Events](https://hpbn.co/server-sent-events-sse/)
- [HPBN — Building Blocks of TCP](https://hpbn.co/building-blocks-of-tcp/)
- [HTTP/3 Explained](https://http3-explained.haxx.se/)

### Vendor and engineering blogs

- [Cloudflare — Streamable HTTP transport for MCP servers](https://blog.cloudflare.com/streamable-http-mcp-servers-python/)
- [Cloudflare — Streaming and longer context lengths for LLMs on Workers AI](https://blog.cloudflare.com/workers-ai-streaming/)
- [Cloudflare — AI Platform](https://blog.cloudflare.com/ai-platform/)
- [Cloudflare — Internal AI engineering stack](https://blog.cloudflare.com/internal-ai-engineering-stack/)
- [Cloudflare Agents docs — HTTP and SSE](https://developers.cloudflare.com/agents/api-reference/http-sse/)
- [Auth0 — Why MCP's Move Away from SSE Simplifies Security](https://auth0.com/blog/mcp-streamable-http/)
- [Mercure homepage](https://mercure.rocks/)
- [Symfony — Mercure integration](https://symfony.com/doc/current/mercure.html)
- [Get Stream — WebSocket vs Server-Sent Events](https://getstream.io/blog/websocket-sse/)
- [WebSocket.org — WebSocket vs SSE](https://websocket.org/comparisons/sse/)
- [WebSocket.org — Future of WebSockets](https://websocket.org/guides/future-of-websockets/)
- [WebSocket.org — WebSockets and AI](https://websocket.org/guides/websockets-and-ai/)
- [portalZINE — SSE's Glorious Comeback (2025)](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)
- [Toolradar — Streamable HTTP vs SSE](https://toolradar.com/blog/streamable-http-vs-sse)
- [Atlassian Community — HTTP+SSE Deprecation Notice](https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484)
- [fka.dev — Why MCP deprecated SSE for Streamable HTTP](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- [JavaScript.info — Server Sent Events](https://javascript.info/server-sent-events)
- [Singh Ajit — The Complete Guide to Server-Sent Events](https://singhajit.com/server-sent-events-explained/)
- [Amitavroy — Server-Sent Events: What and Why](https://amitavroy.com/articles/2025-04-01-server-sent-events-what-are-they-why-you-should-use-them)
- [atlassc.net — Realtime SSE held back by nginx](https://atlassc.net/2023/12/28/realtime-server-sent-events-held-back-by-nginx)
- [Microsoft Learn Q&A — SSE on Azure App Service](https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app)
- [OpenFaaS — OpenAI streaming responses](https://www.openfaas.com/blog/openai-streaming-responses/)
- [Vercel — AI SDK 5](https://vercel.com/blog/ai-sdk-5)
- [Anthropic — Donating MCP and establishing the Agentic AI Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [Google Developers — A2A: a new era of agent interoperability](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Apollo — Multipart Subscription Protocol](https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol)
- [the-guild.dev — Defer/Stream in graphql-yoga](https://the-guild.dev/graphql/yoga-server/docs/features/defer-stream)
- [Spring AI — MCP Streamable HTTP server boot starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-streamable-http-server-boot-starter-docs.html)
- [Hermes MCP — SSE transport](https://hexdocs.pm/hermes_mcp/Hermes.Server.Transport.SSE.html)
- [htmx — SSE extension](https://htmx.org/extensions/sse/)
- [htmx 4 — SSE docs](https://four.htmx.org/docs/extensions/sse)
- [graphql-sse — protocol README](https://github.com/enisdenjo/graphql-sse/blob/master/PROTOCOL.md)
- [sse-starlette](https://github.com/sysid/sse-starlette)
- [Simon Willison — How streaming LLM APIs work](https://til.simonwillison.net/llms/streaming-llm-apis)
- [OpenAI — Responses API streaming](https://platform.openai.com/docs/api-reference/responses-streaming)
- [OpenAI — Streaming responses guide](https://developers.openai.com/api/docs/guides/streaming-responses)
- [Anthropic — Messages streaming](https://docs.anthropic.com/en/api/messages-streaming)
- [Claude API — Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)

### News and incident reports

- [OpenAI status — December 2024 incident (telemetry/Kubernetes)](https://status.openai.com/incidents/01JMYB483C404VMPCW726E8MET)
- [OpenAI status — December 26, 2024 incident (data-center power)](https://status.openai.com/incidents/01JMYB44RFAHDFT1HWDPD0M2N5)
- [OpenAI status — routing-layer responseBuffer post-mortem](https://status.openai.com/incidents/01JMYB63BJ47J3SXV6KSCT4D2A)
- [OpenAI Community — Stream interruptions on Assistants API](https://community.openai.com/t/stream-interruptions-occurring-during-assistants-api-responses/1367555)
- [Storyboard18 — Biggest AI outages since 2024](https://www.storyboard18.com/how-it-works/biggest-ai-outages-since-2024-chatgpt-claude-and-cloudflare-disruptions-that-shook-the-industry-91169.htm)
- [Docker — MCP horror stories: CVE-2025-49596](https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/)
- [JFrog — MCP prompt-hijacking vulnerability (CVE-2025-6515)](https://jfrog.com/blog/mcp-prompt-hijacking-vulnerability/)
- [SentinelOne — CVE-2022-1650 (eventsource)](https://www.sentinelone.com/vulnerability-database/cve-2022-1650/)
- [SentinelOne — CVE-2025-56406 (mcp-neo4j SSE)](https://www.sentinelone.com/vulnerability-database/cve-2025-56406/)
- [Ubuntu Security Notice USN-6082-1](https://ubuntu.com/security/notices/USN-6082-1)
- [Snyk — eventsource vulnerability](https://security.snyk.io/vuln/SNYK-JS-EVENTSOURCE-2823375)
- [Vulert — CVE-2022-1650](https://vulert.com/vuln-db/CVE-2022-1650)
- [DailyCVE — NestJS SSE injection](https://dailycve.com/nestjs-server-sent-events-injection-cve-unknown-medium/)
- [Datadog Security Labs — CVE-2025-52882 (Claude Code IDE WebSocket auth bypass)](https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/)
- [LangSight — OWASP MCP Top 10 guide](https://langsight.dev/blog/owasp-mcp-top-10-guide/)
- [WorkOS — MCP 2025-11-25 spec update](https://workos.com/blog/mcp-2025-11-25-spec-update)
- [Being Guru — Anthropic MCP hits 97 million installs](https://beingguru.com/anthropic-mcp-hits-97-million-installs/)
- [MCP blog — First MCP anniversary (Nov 2025)](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [MCP blog — MCP next-version update (Sep 2025)](https://blog.modelcontextprotocol.io/posts/2025-09-26-mcp-next-version-update/)
- [Latent Space — One Year of MCP (Spotify)](https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs)
- [Latent Space — The Creators of MCP](https://www.latent.space/p/mcp)

### Wikipedia

- [Server-sent events](https://en.wikipedia.org/wiki/Server-sent_events)
- [WHATWG](https://en.wikipedia.org/wiki/WHATWG)
- [Comet (programming)](https://en.wikipedia.org/wiki/Comet_(programming))
- [BOSH (protocol)](https://en.wikipedia.org/wiki/BOSH_(protocol))
- [Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [HTTP/2 Server Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)
- [OSI model](https://en.wikipedia.org/wiki/OSI_model)
