---
id: websockets
type: protocol
name: WebSocket Protocol
abbreviation: WS
etymology: "[W]eb[S]ocket"
category: web-api
year: 2011
rfc: RFC 6455
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - transport/sctp
  - web-api/rest-and-graphql
  - web-api/websockets-and-sse
  - web-api/mcp-and-a2a
  - async-iot/amqp
  - realtime-av/webrtc
  - patterns-failures/patterns
related_protocols: [a2a, http1, http2, json-rpc, mcp, tcp, tls, sse, graphql, rest]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [6455, 7692, 8441, 9220]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Websocket_connection.png/500px-Websocket_connection.png"
    caption: "The WebSocket connection lifecycle — it begins as a normal HTTP request with an Upgrade header, then switches into a persistent, full-duplex channel where both client and server can send messages at any time without HTTP header overhead."
    credit: "Image: Wikimedia Commons / CC BY-SA 4.0"
visual_cues:
  - "A side-by-side: HTTP long-polling sending fat header blocks every second, vs WebSocket sending naked 6-byte frames over one open pipe."
  - "The opening handshake on the wire — GET with Upgrade: websocket and Sec-WebSocket-Key, then 101 Switching Protocols with Sec-WebSocket-Accept derived via SHA-1 of the key plus the magic GUID 258EAFA5-E914-47DA-95CA-C5AB0DC85B11."
  - "Annotated frame format: FIN, RSV1-3, 4-bit opcode, MASK, 7-bit length with 16-bit and 64-bit extensions, 32-bit masking key, payload — bytes labelled and colour-coded."
  - "An XOR-masking diagram: the bytes 'Hello' next to the mask key 0x37FA213D producing 7F 9F 4D 51 58 on the wire — labelled 'not encryption — proxy poisoning defense'."
  - "A close-code dashboard: stacked time-series chart of 1000, 1001, 1006, 1008, 1011, 1012 with a sudden 1006 spike annotated 'load balancer dropped keepalives'."
  - "Cloudflare Durable Objects WebSocket Hibernation — a JS isolate evicted from memory, a per-connection state blob persisted, the runtime auto-replying to ping frames without waking the worker."
---

# WS — WebSocket Protocol

## In one breath

WebSocket is a single TCP connection that begins life as an HTTP/1.1 request with an `Upgrade: websocket` header and, after one round trip, becomes a persistent, full-duplex pipe. Either side can send a message at any time, with two to fourteen bytes of framing overhead instead of the two hundred to eight hundred bytes an HTTP request would cost. RFC 6455 standardised it in December 2011, roughly ninety-nine percent of browsers have shipped it since 2012, and in 2026 it is still the right default for chat, collaborative editing, multiplayer games, market-data feeds, and any browser-to-server channel where the server wants to push.

## The pitch (cold-open)

In November 2010, Mozilla and Opera shipped a major web feature and then turned it off. The feature was WebSocket. The reason was a paper called *Talking to Yourself for Fun and Profit* — a team from CMU, Google, and RTFM bought less than a dollar of online ads, used those ads to run code in random browsers, and tricked corporate proxies into caching attacker-controlled web pages for every user behind those proxies. About seven percent of browsers were vulnerable. The fix was almost ridiculously simple — XOR every byte the client sends with a random four-byte key, refreshed per frame — and that fix is why WebSocket exists in its current form. Fifteen years later, in September 2025, the curl team accidentally reused the same key for every frame, the exact attack came back as CVE-2025-10148, and the fire was the same fire. The protocol is stable. The implementations are not.

## How it actually works

A WebSocket session has four acts: the HTTP upgrade, bidirectional framing, optional ping/pong keepalive, and a clean close handshake. The simulator walks them in order.

**Act one: the upgrade.** The client opens a normal TCP connection — port 443 if `wss://`, port 80 if `ws://` — does the TLS 1.3 handshake if applicable, and sends an HTTP/1.1 GET with four required headers. `Upgrade: websocket` and `Connection: Upgrade` ask the intermediaries to please leave the bytes alone. `Sec-WebSocket-Version: 13` is the only accepted version today. `Sec-WebSocket-Key` is sixteen random bytes, base64-encoded into twenty-four ASCII characters. The browser also sends `Origin` so the server can decide whether to accept the cross-origin request, and optionally `Sec-WebSocket-Protocol` to offer subprotocols like `mqtt` or `graphql-transport-ws`.

**Act two: 101 Switching Protocols.** The server replies with HTTP status 101, echoes the upgrade headers, and sends `Sec-WebSocket-Accept`. That value is computed deterministically — concatenate the client's key with the magic GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, take the SHA-1, base64-encode the twenty-byte digest. This is not authentication and not security. SHA-1 here is a unique-string proof that the server actually understood the handshake — that you are not, for example, talking to a confused HTTP cache. The GUID is just a UUID picked because it is unlikely to appear by accident on the wire. From this byte forward, HTTP semantics no longer apply. The connection now carries WebSocket frames.

**Act three: framing and messaging.** Each frame is two bytes of fixed header followed by an optional extended length, an optional 4-byte mask key, and the payload. The first byte holds FIN — final fragment or not — three reserved bits, and a 4-bit opcode. The second byte holds the MASK bit and a 7-bit payload length. The text message `Hello` from a browser, masked with the key `0x37FA213D`, is eleven bytes on the wire: `81 85 37 FA 21 3D 7F 9F 4D 51 58`. The server's reply `Hello` back the other way is just seven bytes: `81 05 48 65 6C 6C 6F`. No headers. No request-response handshake per message.

**Act four: ping, pong, close.** Either side can send a Ping frame at any time; the other must reply with a Pong. Either side initiates closure with a Close frame containing a two-byte close code and an optional UTF-8 reason. The peer echoes a Close frame; both sides then close the underlying TCP.

### Header at a glance

The opening handshake headers are HTTP. The frame header is binary.

- `Upgrade: websocket` and `Connection: Upgrade` — both required, both echoed by the server, so HTTP/1.1 intermediaries process the upgrade.
- `Sec-WebSocket-Key` (client) and `Sec-WebSocket-Accept` (server) — the GUID-based proof-of-understanding handshake.
- `Sec-WebSocket-Version: 13` — the registry burned 9 through 12 on editorial-only changes; 13 is what every modern client and server speaks.
- `Sec-WebSocket-Protocol` — the application subprotocol offered by the client, with one chosen by the server. Real-world values include `mqtt`, `v12.stomp`, `wamp`, `graphql-transport-ws`, and `bbf-usp-protocol`, all in the IANA WebSocket Subprotocol Name Registry.
- `Sec-WebSocket-Extensions` — the wire-level modifications offered, almost always `permessage-deflate` from RFC 7692.
- `Origin` — the browser-supplied origin for server-side policy enforcement.

Once frames take over: FIN signals end-of-message. Opcode 0x1 is text — receivers are required to fail the connection on invalid UTF-8. Opcode 0x2 is binary, application-defined bytes. Opcode 0x8 is Close, 0x9 is Ping, 0xA is Pong; control frames must be 125 bytes or less and may not be fragmented. Payload length is a 7-bit literal up to 125, then a 16-bit extension up to 65,535, then a 64-bit extension up to 2^63. Client-to-server frames must set MASK to 1; server-to-client must set MASK to 0. A server that receives an unmasked client frame fails the connection with code 1002.

### State machine in three sentences

The WHATWG API has four states: CONNECTING during the HTTP upgrade, OPEN once `Sec-WebSocket-Accept` validates, CLOSING after either side sends a Close frame, and CLOSED once the underlying TCP closes and the close event fires with code, reason, and a `wasClean` boolean. The state machine is symmetric — there is no client-only or server-only role inside OPEN. Reliability, in-order delivery, and reassembly all delegate to TCP underneath; the WebSocket layer adds message boundaries and masking on top.

### Reliability, security, and framing mechanics

WebSocket inherits everything from TCP — reliable, in-order, byte-stream delivery — and it inherits TCP's head-of-line blocking too: one lost segment stalls every message on the connection. It adds nothing of its own for retransmission. For confidentiality and integrity, it relies entirely on TLS. The masking is the subtle bit, and it is not what most engineers assume.

Masking is not encryption. The 32-bit key is sent in clear, four bytes before the masked payload, and anyone who can see the wire can trivially un-mask. The point of masking is that an attacker who can choose the *application-layer* payload — for example, by getting a victim's browser to call `socket.send(...)` with attacker-chosen bytes — cannot deterministically choose the bytes that appear on the *wire*. That defeats the proxy cache poisoning attack from Huang and colleagues' 2010 paper. RFC 6455 §5.3 mandates a fresh, unpredictable key per frame, drawn from a strong RNG (RFC 4086). The libcurl maintainers learned in 2025 what happens when you don't.

The one widely deployed extension is `permessage-deflate` from RFC 7692, edited by Takeshi Yoshino at Google. It compresses payloads with DEFLATE, optionally reusing the LZ77 sliding window across messages. It saves fifty to eighty percent on text. It also opens BREACH-class side channels if attacker-controlled bytes and secret bytes share a compression context, and it raises memory cost meaningfully per connection. Negotiate `server_no_context_takeover; client_no_context_takeover` if you do not actually need cross-message compression.

## Where it shows up in production

**Slack** runs the canonical at-scale WebSocket fleet. Channel Servers each handle tens of millions of channels per host. Gateway Servers maintain user-to-channel WebSocket subscriptions. ByteByteGo's writeup of Slack's architecture cites over five million simultaneous WebSocket sessions at peak weekday hours, with in-region message delivery around five hundred milliseconds. When WebSocket establishment fails, the client surfaces a "Degraded Mode" banner and falls back to REST polling. Envoy terminates TLS at the edge.

**Discord** runs the gateway on Erlang and Elixir over Cowboy, with Rust via Rustler for hot data structures. The 2020 Elixir-lang interview reports over twelve million concurrent users and over twenty-six million WebSocket events per second to clients. Voice signalling is on the same stack — a separate fleet handles 2.6 million concurrent voice users with 220 Gbps of egress. Bots are rate-limited to 1,000 IDENTIFY calls per WebSocket per twenty-four hours, and any bot above 2,500 guilds must shard. The reconnection pattern is canonical: the gateway issues a `resume_gateway_url` so reconnecting clients pick up from the last delivered event.

**WhatsApp** runs Erlang/OTP with a modified XMPP protocol. The famous 2012 milestone was over two million concurrent TCP connections per box, since exceeded but not publicly updated. Public talks suggest a frontend fleet of around 150 chat servers handling more than 100 million concurrents. WhatsApp Web specifically uses WebSocket for multi-device sync.

**Trading platforms** — Binance, Coinbase, Kraken — expose public market-data WebSocket APIs. Trading firms commonly push thousands of messages per second on a single `wss://` stream, often with binary subprotocols or compressed JSON to shave bytes.

**Cloudflare AI Gateway** migrated to a WebSocket interface in 2025 to avoid HTTP/2 keep-alive complexity for AI-token streaming. It runs on Durable Objects.

**Cloudflare Durable Objects** introduced a WebSocket Hibernation API that became GA in this period. The runtime serialises per-connection state, evicts the JavaScript isolate from memory, auto-responds to RFC 6455 ping frames *without waking the object*, and does not bill compute duration while idle. It is one of the most novel runtime designs in this space in the last two years.

**`nginx`** terminates WebSocket via the standard `proxy_pass http://backend; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 86400;` recipe. It does not translate HTTP/2 Extended CONNECT (open ticket #1992 on `trac.nginx.org`). HAProxy has first-class WebSocket support and sits in front of many WhatsApp-style chat fleets. Envoy supports both HTTP/1.1 and HTTP/2 WebSocket including Extended CONNECT.

For per-connection memory, Discord and WhatsApp both report roughly two kilobytes per idle Erlang process per connection. `µWebSockets` and `nbio` benchmarks crack a million messages per second on a single core for tiny payloads on loopback. End-to-end p50 latency in well-deployed real-time systems sits in the tens of milliseconds within-region and in the hundreds cross-region. A `wss` open over TLS 1.3 typically takes about three round trips total: TCP, TLS, then the HTTP upgrade.

## Things that go wrong

**Slack, February 22, 2022.** A database-permissions change caused a query to read across all Vitess shards, missed memcached, and melted the database. Clients couldn't boot. The system had landed in a metastable failure state — the system stayed broken even after the original trigger was gone, because reconnect storms kept the database underwater. The recovery mechanism was a "client-boot throttle" — Slack literally rate-limited clients establishing WebSocket sessions until the metastable cascade broke. The post-mortem references Bronson, Charapko, Aghayev, and Zhu's HotOS 2021 paper *Metastable States in Distributed Systems*. The lesson: at scale, your recovery path needs an explicit choke point on connection establishment, not just on message volume.

**Cloudflare, June 20, 2024.** A new DDoS-mitigation rule deployed between 14:14 and 17:06 UTC triggered a latent infinite-loop in the rate-limiting code path. HTTP request handler processes pinned CPU at 100%. Up to 2.1% of requests failed. Long-lived WebSocket connections behind Cloudflare were silently affected when Traffic Manager re-routed traffic out of saturated regions.

**Cloudflare, November 18, 2025.** A ClickHouse permissions change made a Bot Management feature-file double in size and exceed an in-process limit. The fault cascaded into Workers KV, Turnstile, and Access — which in turn took down Durable-Object-hosted WebSocket apps and roughly a third of the top 10,000 sites.

We cover the recurring shape of these reconnect-storm cascades in the chapter on Recurring Patterns, and the broader collapse mechanics in the SCTP and WebSockets-and-SSE chapter episodes.

## Common pitfalls (for the practitioner)

1. **Idle timeouts in proxies kill you silently.** AWS ELB defaults to 60 seconds. nginx needs `proxy_read_timeout` raised. HAProxy needs `timeout tunnel`. Without keepalive, the LB closes the TCP and the client sees code 1006 minutes after the actual failure.
2. **Ping/pong is off by default in most libraries.** Set ping interval to 20–30 seconds and pong timeout to 10 seconds. Cloudflare Durable Objects auto-handle ping/pong without waking the object — most other stacks make you wire it yourself.
3. **Sticky sessions matter.** Without affinity at the LB, the HTTP `negotiate` and the resulting WebSocket can land on different backends. SignalR documents this explicitly. Mobile clients change IP often, so prefer cookie-based affinity over IP-based.
4. **`permessage-deflate` is dangerous on by default.** Shared compression context across messages plus secrets plus attacker-controlled prefix is a BREACH-class side channel. It also balloons memory per connection. Negotiate `no_context_takeover` unless you have a reason not to.
5. **Unbounded message size is an OOM waiting to happen.** Set a max payload (1 MiB is a reasonable starting point). A single 2 GiB message will take down the worker.
6. **Skipping `Origin` checks gets you Cross-Site WebSocket Hijacking.** Servers that authenticate by cookie and don't validate `Origin` will accept a WebSocket from any page that loads in the victim's browser.
7. **DNS rebinding for `ws://localhost`-style services.** Called out explicitly in the MCP transport spec — a malicious page can resolve a hostname first to a public IP, then to 127.0.0.1, and reach your local agent.
8. **Reconnect everything on every code.** Reconnect with jittered exponential backoff on 1006, 1011, 1012, 1013. Do not reconnect on 1008, 1003, 1002 — those are auth failures or bugs and you need to surface them to a human.

## Debugging it

- **Browser DevTools, Network panel, "WS" filter.** Chrome, Firefox, and Safari all decode frames with FIN, opcode, payload, and direction. Chrome additionally decodes Socket.IO and Engine.IO packet shapes.
- **`wscat`** — `npm i -g wscat`, then `wscat -c wss://api.example.com -H "Authorization: Bearer …"`. Interactive REPL over a WebSocket.
- **`websocat`** — the Rust "netcat for WebSockets," with socat-like piping. `websocat wss://echo.websocket.events`, `websocat -s 8080`, `websocat tcp:127.0.0.1:22 ws-l:127.0.0.1:1234`. Latest release December 2025.
- **`curl --include ws://…`** — curl gained native WebSocket support in 7.86 (October 2022). Worth knowing about, though see the 2025 CVEs in the next section.
- **Wireshark** with the `websocket` display filter — recognises frames natively.
- **Postman, Insomnia, Hoppscotch** — all have WebSocket tabs.
- **Autobahn|Testsuite** — the canonical conformance test for any WebSocket implementation. `gorilla/websocket` and most major libraries publish their Autobahn results.

What to monitor: concurrent connection count per server with quantiles, new-connection rate (reconnect storms show up here first), close-code distribution as a stacked time-series (your single best alarming signal), ping-pong RTT p95 and p99, bytes and messages per connection, memory per process and per connection, and pre-101 5xx plus close code 1015 for TLS handshake failures. The close-code taxonomy is small — 1000 normal, 1001 going away, 1002 protocol error, 1003 unsupported data, 1006 abnormal closure, 1007 invalid UTF-8, 1008 policy violation, 1011 internal error, 1012 service restart, 1013 try again later — and the distribution shifts you see during incidents are diagnostic. A spike in 1006 means network or load balancer; a spike in 1008 means an auth deploy went bad; a spike in 1011 is a server crash; 1012 is expected during deploys.

## What's changing in 2026

**November 2025 — Cloudflare's ClickHouse outage.** Bot Management feature-file size doubled, exceeded an in-process limit, cascaded into Workers KV, Turnstile, and Access; took down WebSocket-backed Durable Object apps and roughly a third of the top 10,000 sites. Yet another reminder that the connection-establishment path and the routing layer are where production WebSocket failures happen, not the framing.

**September 2025 — CVE-2025-10148 (libcurl).** The libcurl WebSocket client used a *fixed* 32-bit mask for every outgoing frame instead of a fresh per-frame key. Exactly the mistake RFC 6455 §10.3 was written to forbid. A malicious server could revive proxy cache poisoning through a defective proxy on plaintext `ws://`. Fixed in curl 8.16.0; affected 8.11.0 through 8.15.x. The 2010 attack came back, fifteen years late.

**August 2025 — MCP SEP-1288.** An active proposal to add WebSocket as an official transport for the Model Context Protocol. The contested pieces: how to convey `Mcp-Session-Id` (browsers cannot read post-handshake headers, so it would move into the JSON-RPC payload) and how to authenticate. MCP's current default is Streamable HTTP — POST /mcp with optional SSE upgrade — and SSE is not gone, just demoted to an optional response mode.

**June 2025 — CVE-2025-5399 (libcurl).** Endless loop on a malicious server packet. Thread or process must be killed externally.

**May 2025 — CVE-2025-43855 (tRPC v11).** Unauthenticated DoS — malformed `connectionParams` JSON crashes the server because the error is rethrown after handling. CVE-2025-47287 in Tornado around the same time enables log-amplification DoS that affects WebSocket-handling apps.

**April 2025 — A2A.** Google publishes the Agent2Agent Protocol with JSON-RPC 2.0 over HTTPS plus Server-Sent Events for streaming, plus a v0.3 gRPC binding. WebSocket is explicitly *not* an A2A transport. The reasoning: reuse existing, well-understood standards with strong intermediary support.

**Throughout 2024–2025 — the library shake-up.** `nhooyr/websocket` (Go) was renamed to `coder/websocket` and is now the recommended path for new Go code. `gorilla/websocket` was archived in late 2022, then community-maintained, with releases still landing through 2024. CVE-2024-37890 in Node `ws` (DoS via large numbers of HTTP request headers crashing the server, fixed in 5.2.4 / 6.2.3 / 7.5.10 / 8.17.1). CVE-2024-55591 / CVE-2025-24472 in Fortinet FortiOS exploited in the wild — auth bypass via crafted requests to a Node.js WebSocket module exposing super-admin privileges.

**2022–2026 — the slow rollout of HTTP/2 and HTTP/3 WebSocket.** RFC 8441 (Patrick McManus, Mozilla, September 2018) lets a WebSocket ride a single HTTP/2 stream via Extended CONNECT with `:protocol=websocket`. Servers must advertise `SETTINGS_ENABLE_CONNECT_PROTOCOL=1`. Firefox 65 shipped this in 2019; Chrome shipped it. Some servers — older nginx, older Spring (issue #34044, December 2024) — still reject the resulting CONNECT and produce 405. Mattermost in 2025 documented Chrome 95+ failures behind HTTP/2 proxies that don't translate Extended CONNECT.

RFC 9220 (Ryan Hamilton, Google, June 2022) maps the same trick onto HTTP/3 over QUIC. As of May 2026, no major browser or production server has shipped it. Chrome reached "Intent to Prototype" only. Jetty users are still filing tickets (#14294, January 2026) asking for it. A four-year-old Standards Track RFC, no shipped browser. The reasons are practical: middleboxes still routinely break QUIC, the latency wins are modest for most workloads, and `nginx` doesn't translate Extended CONNECT.

**WebTransport.** The complement, not the replacement. A separate browser API exposing QUIC's reliable streams *and* unreliable datagrams over HTTP/3. Stable in Chrome and Edge, partial in Firefox, absent in Safari. Genuine fit for gaming, mixed-reliability media, and parallel reliable streams. Ably's analysis "Can WebTransport replace WebSockets?" recommends WebSocket as the default for most real-time apps and WebTransport for advanced use cases. Industry view from Ably, Cloudflare, and `websocket.org` is two to three years to broad production viability — call it 2027 or 2028.

The strong claim, dated mid-2026: build new real-time systems on RFC 6455 over HTTP/1.1 with TLS 1.3, plan for HTTP/2 (RFC 8441) when your edge supports it, and treat WebTransport and HTTP/3 WebSocket as 2027+ options. The browser API — `new WebSocket(url)` — does not change across these transports, so the migration is an infrastructure change, not an application rewrite.

## Fun facts (host material)

The name was coined on IRC. Ian Hickson, then editor of HTML5 at Google, and Michael Carter named "WebSocket" together on the `#whatwg` IRC channel in 2008. The first draft called it `TCPConnection`. The mailing-list and IRC logs are linked from the Wikipedia history section. Six months later, Chrome 4 shipped it enabled by default in December 2009.

The magic GUID is just a UUID. `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` was chosen for being unique and memorable, not for cryptographic significance. RFC 6455 §1.3 explains the goal as "a constant string unlikely to be used by network endpoints that do not understand the WebSocket Protocol." It is not secret and it is not changing.

The `Sec-WebSocket-Key` example in RFC 6455 is a hidden joke. The 24-character base64 string `dGhlIHNhbXBsZSBub25jZQ==` decodes to the literal text "the sample nonce." That is the worked example the spec uses end-to-end.

The masking key is XOR specifically because XOR was the cheapest mechanism that satisfied "no attacker-chosen byte sequence appears verbatim on the wire." Adam Barth and the HyBi WG considered alternatives. They picked XOR because it was the smallest change that worked.

Ports 80 and 443 were chosen for proxy traversal, not for protocol design. RFC 6455 §1.7 explicitly notes WebSocket is designed to ride those ports because that is what corporate firewalls actually allow.

curl was the WebSocket holdout. It finally added support in 7.86 in October 2022, and then promptly shipped two CVEs in 2025. The first one — CVE-2025-10148 — revived the exact attack class WebSocket masking was created to prevent. The fire is the same fire.

Discord's bot rate limit is 1,000 IDENTIFY calls per WebSocket per 24 hours. Exceed it and your bot's token gets reset and the owner gets an email. A real-world example of WebSocket connection-establishment as an abuse vector worth rate-limiting separately from message volume.

Cloudflare Workers will hibernate your WebSocket. Idle WebSockets backed by Durable Objects evict the JS isolate from memory, persist per-connection state via `serializeAttachment`, auto-respond to RFC 6455 ping frames *without waking the object*, and don't bill compute. There is nothing else quite like it in the runtime landscape.

## Where this connects in the book

- **Part Foundations, "The Layer Model"** — where WebSocket sits in the practical four-layer TCP/IP stack and why "is it L5, L6, or L7?" is the wrong question.
- **Part Foundations, "Protocols for AI Agents"** — the shape of MCP and A2A, and why both deliberately avoided WebSocket as a default transport.
- **Part Story of the Internet, "The AI Agent Layer (2024–)"** — for fifteen years after WebSocket in 2011, no genuinely new application protocol shipped at L7. Then 2024 happened twice, with MCP in November and A2A the following April.
- **Part Transport, "SCTP"** — the better TCP that lost the deployment war, and why WebSocket inherits TCP's head-of-line blocking. The same chapter explains why WebRTC Data Channels run SCTP successfully on the open internet.
- **Part Web/API, "REST and GraphQL"** — Roy Fielding's 2000 dissertation, the four-round-trip mobile problem that birthed GraphQL, and why GraphQL subscriptions split between `graphql-transport-ws` over WebSocket and SSE-over-HTTP for new projects.
- **Part Web/API, "WebSockets and SSE"** — the long-form story: the 2010 security crisis, the masking fix, the SSE renaissance via LLM token streaming, and the 2024–2026 CVE wave. This is the historical-narrative episode that pairs with this mechanism-and-production blueprint.
- **Part Web/API, "MCP and A2A"** — why both AI-agent protocols picked JSON-RPC 2.0, why MCP shipped HTTP+SSE first and migrated to Streamable HTTP, and the open SEP-1288 proposal to add WebSocket transport.
- **Part Async/IoT, "AMQP"** — banking-grade messaging from JPMorgan in 2003 and why Microsoft Azure Service Bus tunnels AMQP 1.0 over WebSocket on TCP/443 to escape corporate firewall blocks on port 5671.
- **Part Realtime A/V, "WebRTC"** — the only way for a browser to send a UDP packet, with WebSocket as the most common signalling channel. Includes the Discord voice outage post-mortem from March 25, 2026.
- **Part Patterns and Failures, "Recurring Patterns"** — handshakes, sliding windows, keepalives, and why knowing the handshake pattern means you understand 80% of TLS, SSH, MQTT, SCTP, and WebSocket setup before reading any of their specs.

## See also (other protocol episodes)

**SSE.** The contrast is everything. SSE is one-direction, server-to-client, plain HTTP, with built-in `EventSource` reconnection and `Last-Event-ID` resume. It works through every CDN and proxy unmodified. WebSocket is full-duplex, requires an upgrade negotiation that some intermediaries fumble, and leaves reconnection logic to you. The 2010s narrative was "WebSocket is the future of real-time." The token-streaming era reversed that for unidirectional workloads — every major LLM provider streams via SSE today. Use WebSocket when the client genuinely sends back at high frequency. Use SSE when the workload is server-to-client only. The SSE episode covers this in depth.

**HTTP/2.** Multiplexed request-response with server push over a single connection. Use HTTP/2 when your communication follows request-response, you need HTTP caching and standard middleware, and server push is enough. Use WebSocket when both sides send at any time without request-response structure. RFC 8441 lets WebSocket ride a single HTTP/2 stream via Extended CONNECT — see the HTTP/2 episode for what's actually shipped where.

**REST.** Stateless request-response is the right shape for CRUD that benefits from HTTP caching. WebSocket and REST coexist in nearly every real-world app — REST for the data tier, WebSocket for push and notifications. The REST episode is the primer.

**TCP.** WebSocket is one stream over one TCP connection. Everything WebSocket inherits — reliability, ordering, congestion control, head-of-line blocking — comes from the TCP episode.

**TLS.** `wss://` is WebSocket-over-TLS-over-TCP. Mixed-content rules in browsers will block plain `ws://` from `https://` pages, and many proxies interfere with unencrypted WebSocket. In production, treat `wss://` as the only option. TLS 1.3's 1-RTT or 0-RTT handshake is what makes the connection-setup overhead acceptable; the TLS episode has the cryptographic story.

**JSON-RPC.** A 6-page transport-agnostic RPC envelope that pairs naturally with WebSocket because both peers can initiate. Used in Ethereum execution clients, the Language Server Protocol, the Chrome DevTools Protocol, MCP, and A2A. The JSON-RPC episode explains why "boring" was the design goal.

**GraphQL.** Subscriptions are GraphQL's push primitive. The original WebSocket subprotocol was `subscriptions-transport-ws`, now superseded by `graphql-transport-ws` (the IANA-registered name). SSE-based GraphQL subscriptions are the increasingly common alternative. The GraphQL episode walks through the trade-off.

**MCP.** Anthropic's Model Context Protocol uses JSON-RPC 2.0 with Streamable HTTP as its current default transport — a single `/mcp` endpoint where POST responses can either be plain JSON or upgrade to an SSE stream. WebSocket is not yet an official MCP transport; SEP-1288 (August 2025) proposes adding it. The MCP episode covers why the initial HTTP+SSE design was awkward and what Streamable HTTP fixed.

**A2A.** Google's Agent2Agent Protocol is JSON-RPC 2.0 over HTTPS with SSE for streaming and a v0.3 gRPC binding. A2A explicitly does not use WebSocket. The A2A episode explains the "reuse boring standards" thesis behind that decision.

## Visual cues for image generation

- A side-by-side: HTTP long-polling sending fat header blocks every second versus WebSocket sending naked 6-byte frames over one open pipe. Annotate the per-message overhead — 200–800 bytes for HTTP versus 2–14 bytes for WebSocket.
- The opening handshake on the wire — GET with `Upgrade: websocket` and `Sec-WebSocket-Key`, then `101 Switching Protocols` with `Sec-WebSocket-Accept` derived via SHA-1 of the key plus the magic GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`. Show the GUID highlighted; caption "not cryptography — proof of understanding."
- Annotated WebSocket frame format: FIN, three RSV bits, 4-bit opcode, MASK, 7-bit payload length with 16-bit and 64-bit extensions, 32-bit masking key, then payload. Each field colour-coded with a callout for the opcode legend (0x1 text, 0x2 binary, 0x8 close, 0x9 ping, 0xA pong).
- An XOR-masking diagram: the bytes of "Hello" beside the mask key `0x37FA213D` producing `7F 9F 4D 51 58` on the wire. Caption "not encryption — proxy poisoning defence." Underneath, a small inset showing the libcurl CVE-2025-10148 mistake: the same key reused for every frame.
- A close-code dashboard — stacked time-series of 1000, 1001, 1006, 1008, 1011, 1012 over 24 hours. A sudden 1006 spike at 03:00 UTC annotated "load balancer dropped keepalives." A 1011 spike at 14:30 annotated "deploy crashed the worker."
- Cloudflare Durable Objects WebSocket Hibernation: a JS isolate evicted from memory, a per-connection state blob persisted to storage, the runtime auto-replying to ping frames without waking the worker. Annotate "billed only when JS executes."

## Sources

### RFCs

- [RFC 6455 — The WebSocket Protocol (Fette and Melnikov, December 2011)](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 7692 — Compression Extensions for WebSocket (Yoshino, December 2015)](https://datatracker.ietf.org/doc/html/rfc7692)
- [RFC 8441 — Bootstrapping WebSockets with HTTP/2 (McManus, September 2018)](https://datatracker.ietf.org/doc/html/rfc8441)
- [RFC 9220 — Bootstrapping WebSockets with HTTP/3 (Hamilton, June 2022)](https://datatracker.ietf.org/doc/html/rfc9220)
- [WHATWG HTML Living Standard — Web sockets](https://websockets.spec.whatwg.org/)

### Papers

- [Huang, Chen, Barth, Rescorla, Jackson — "Talking to Yourself for Fun and Profit" (W2SP 2011)](http://www.adambarth.com/papers/2011/huang-chen-barth-rescorla-jackson.pdf)
- [Ilya Grigorik — *High Performance Browser Networking*, Chapter 17 "WebSocket" (O'Reilly)](https://hpbn.co/websocket/)

### Vendor and engineering blogs

- [Slack Engineering — Real-time Messaging](https://slack.engineering/real-time-messaging/)
- [Slack Engineering — Slack's Incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/)
- [Slack Engineering — Traffic 101: Packets Mostly Flow](https://slack.engineering/traffic-101-packets-mostly-flow/)
- [Discord — How Discord Handles Two and Half Million Concurrent Voice Users using WebRTC](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- [Elixir-lang — Real-time communication at scale with Elixir at Discord](https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/)
- [Discord Developer Docs — Gateway API](https://docs.discord.com/developers/events/gateway)
- [Cloudflare — DO it again: Durable Objects, WebSockets, and AI Gateway](https://blog.cloudflare.com/do-it-again/)
- [Cloudflare — Use WebSockets with Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Cloudflare incident, June 20, 2024](https://blog.cloudflare.com/cloudflare-incident-on-june-20-2024/)
- [Ably — Can WebTransport replace WebSockets?](https://ably.com/blog/can-webtransport-replace-websockets)
- [Ably — How to scale WebSockets for high-concurrency systems](https://ably.com/topic/the-challenge-of-scaling-websockets)
- [WebSocket.org — Future of WebSockets](https://websocket.org/guides/future-of-websockets/)
- [WebSocket.org — Close codes reference](https://websocket.org/reference/close-codes/)
- [ByteByteGo — How Slack Supports Billions of Daily Messages](https://blog.bytebytego.com/p/how-slack-supports-billions-of-daily)
- [The Guild — GraphQL over WebSockets](https://the-guild.dev/blog/graphql-over-websockets)
- [Mozilla MDN — Writing WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [Mozilla MDN — WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Apache ActiveMQ — WebSockets](https://activemq.apache.org/components/classic/documentation/websockets)
- [Socket.IO documentation](https://socket.io/docs/v4/)

### Security and CVEs

- [CVE-2025-10148 — libcurl fixed mask](https://curl.se/docs/CVE-2025-10148.html)
- [CVE-2025-5399 — libcurl endless loop](https://curl.se/docs/CVE-2025-5399.html)
- [CVE-2024-37890 — Node `ws` DoS (GHSA-3h5v-q93c-6h6q)](https://github.com/advisories/GHSA-3h5v-q93c-6h6q)
- [CVE-2025-43855 — tRPC WebSocket DoS](https://github.com/advisories/GHSA-pj3v-9cm8-gvj8)
- [CVE-2025-47287 — Tornado log-amplification DoS](https://osv.dev/vulnerability/CVE-2025-47287)
- [Fortinet FortiOS — FG-IR-24-535](https://www.fortiguard.com/psirt/FG-IR-24-535)
- [MCP SEP-1288 — WebSocket transport proposal](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1288)

### Wikipedia

- [Wikipedia — WebSocket](https://en.wikipedia.org/wiki/WebSocket)
- [Wireshark Wiki — WebSocket](https://wiki.wireshark.org/WebSocket)
