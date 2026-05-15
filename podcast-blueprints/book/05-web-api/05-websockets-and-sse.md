---
id: web-api/websockets-and-sse
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: WebSockets and SSE
synopsis: Server push, two ways — and the SSE renaissance via LLM streaming.
podcast_target_minutes: 15
position_in_book: chapter 44 of 75
listening_order:
  prev: web-api/grpc
  next: web-api/mcp-and-a2a
related_protocols: [sse, websockets, http1, http2, tcp, http3, quic]
related_pioneers: [ian-hickson]
related_outages: []
related_frontier: []
related_rfcs: [6455]
images: []
visual_cues:
  - "Split-screen diagram — left: a WebSocket frame flowing both ways over an upgraded HTTP/1.1 connection; right: an SSE stream of `data:` lines flowing one way over a long-lived HTTP response with `Content-Type: text/event-stream`."
  - "Timeline of server-push milestones — September 2006 SSE shipping in Opera 9, December 2011 RFC 6455 finalising WebSocket, ~99% browser support by 2012, then the 2023-2026 LLM-token-streaming era marked as the SSE renaissance."
  - "Three logos stacked — OpenAI, Anthropic, Google Gemini, Cloudflare Workers AI — each piping `text/event-stream` bytes into a browser, with `EventSource(url)` shown as three lines of JavaScript on the receiving side."
  - "A `Last-Event-ID` header travelling on a reconnect request after a dropped SSE stream, with the server resuming output from the next event."
  - "A 2024-2026 CVE wall of stickers for CVE-2024-37890 in Node ws, CVE-2025-10148 in libcurl, CVE-2025-43855 in tRPC, CVE-2025-5399 in libcurl — captioned 'the protocol is stable; the implementations are not.'"
---

# Part VI, Chapter — WebSockets and SSE

## The hook

For most of its life, Server-Sent Events lost the mindshare contest to WebSocket. The 2010s narrative was that WebSockets were the future of real-time on the web. Then large language models started streaming tokens, and OpenAI, Anthropic, Google Gemini, and Cloudflare Workers AI all picked the same wire format — `text/event-stream`. SSE is now the de facto transport for streaming inference. This chapter is how that flip happened, and why both protocols are still the right answer for different jobs in 2026.

## The story

### Inverting the request/response model

HTTP is fundamentally request/response. The client asks, the server answers. For a notification system, a chat app, or a live dashboard, that model is wrong — the server has data the client wants now, and it should not have to wait for a poll.

Two protocols solved this on top of HTTP, with very different tradeoffs.

WebSockets, defined in RFC 6455 in December 2011 and edited by Ian Fette of Google and Alexey Melnikov of Isode, hijack an HTTP/1.1 connection with an `Upgrade: websocket` request and switch the wire to a bidirectional binary frame protocol. After the upgrade, neither side waits for the other — both can send any time. Roughly 99% of browsers have supported it since 2012. Slack, Discord, Figma, and most live-collaboration apps use WebSockets. Slack documents more than five million concurrent WebSocket sessions in production. Cloudflare's WebSocket Hibernation API for Durable Objects bills only when the JavaScript actually executes, and survives idle WebSocket connections without server cost. The full mechanism — the upgrade dance, the masking rules, the frame layout — is the WebSocket episode.

Server-Sent Events is the simpler, one-way version. It was specified by Ian Hickson and first shipped in Opera 9 in September 2006 as part of "Web Applications 1.0." The server holds open an HTTP response and writes `data:` frames over time. There is no protocol switch and no binary framing — just a long-lived response stream with `Content-Type: text/event-stream`. The format lives today in section 9.2 of the HTML Living Standard. The full mechanism — event types, IDs, retry hints, and the EventSource API — is the SSE episode.

### The SSE renaissance

For most of its life SSE lost mindshare to WebSocket. That changed when LLMs started streaming tokens. OpenAI, Anthropic, Google Gemini, and Cloudflare Workers AI all stream tokens as `text/event-stream`. SSE is now the de facto wire format for streaming inference.

The reasons are practical, not romantic.

It is HTTP. CORS, auth, caching, proxies, and CDNs all just work, with no special path through the stack.

It auto-reconnects, with `Last-Event-ID` as a built-in resume mechanism. The browser sends the last event ID it received as a request header on reconnect, and the server resumes output from there.

It composes with HTTP/2 multiplexing — many SSE streams can share one TCP connection, instead of each one tying up a connection of its own.

And the browser gives you `new EventSource(url)`. Three lines of JavaScript and you have a streaming consumer.

WebSocket is still the right answer when the client genuinely needs to send messages back over the same connection at high frequency: chat with interrupts, collaborative editing, multiplayer gaming. SSE is the right answer when the workload is server-to-client only, which the token-streaming use case is. That is what tipped the balance.

### The 2024-2026 CVE wave for WebSocket

RFC 6455 itself has not changed. The ecosystem has. The last two years have seen a wave of major CVEs in major implementations. CVE-2024-37890 in the Node `ws` library. CVE-2025-10148 in libcurl, which revived the very cache-poisoning attack that masking was designed to prevent in the first place. CVE-2025-43855 in tRPC. CVE-2025-5399 in libcurl. The library landscape moved too: `gorilla/websocket` was archived in late 2022 and then unarchived under community maintenance, and `nhooyr/websocket` was renamed to `coder/websocket` in 2024. The protocol is stable. The implementations are not.

### WebTransport, and the transport future

Both WebSocket and SSE were designed for HTTP/1.1. The HTTP/2 bootstraps for both — RFC 8441 for WebSocket and RFC 8442 for SSE — ship in Firefox 65 and later, in Chrome, and in major servers, but adoption is uneven. Mattermost has documented Chrome 95 and later failures behind HTTP/2 proxies that do not translate Extended CONNECT. The HTTP/3 bootstrap for WebSocket, RFC 9220, exists but is barely deployed.

The longer-term replacement is WebTransport over HTTP/3 — bidirectional streams plus unreliable datagrams over QUIC, exposed to JavaScript as a Promise-based API. Chrome and Edge ship implementations as of 2026. Safari has no support. Firefox has limited support. WebTransport is interesting for some workloads — gaming, low-latency bidirectional traffic, datagrams for game state — but it is not a wholesale replacement for either WebSocket or SSE before 2027 or 2028. The QUIC episode and the HTTP/3 episode both pick up the transport story underneath this.

The choice for new projects in 2026 is rarely WebTransport. WebSocket if bidirectional. SSE if server-to-client only. The token-streaming use case has settled the SSE-versus-WebSocket debate decisively in favour of SSE for LLM workloads — and that is the workload reshaping the field.

## The figures

### Ian Hickson

Born around 1980. Editor of HTML5 at the WHATWG from 2004, where he single-handedly turned the failed XHTML 2 path into a living standard the entire web platform now depends on. He also edited Server-Sent Events, which first shipped in Opera in September 2006 as part of "Web Applications 1.0," and he coined the name "WebSocket" in the #whatwg IRC channel — although the protocol itself was finalised as RFC 6455 in December 2011 under Ian Fette. The volume of detailed specification work shipped under Hickson's name across two decades is exceptional even by IETF and W3C standards.

### RFC 6455 — The WebSocket Protocol

Published in December 2011. Edited by Ian Fette of Google and Alexey Melnikov of Isode. Proposed standard. It defines the `Upgrade: websocket` handshake on top of HTTP/1.1, the binary and text frame format with two to fourteen bytes of overhead per message, and the masking rules that make browser-originated WebSocket traffic safe to push through caches and proxies. The mechanism details are the WebSocket episode.

## What it taught the industry

The WebSocket-versus-SSE debate of the 2010s assumed bidirectional was always better. The 2020s LLM era proved the opposite. Most server-push workloads are one-way — tokens, notifications, dashboard updates, log tails — and one-way over plain HTTP composes with everything the web already has: CORS, auth, caches, proxies, CDNs, HTTP/2 multiplexing, automatic reconnection with `Last-Event-ID`. The lesson is that protocol fitness depends on workload, not on which spec is newer or more capable. SSE was the older, simpler, less fashionable option, and it turned out to be exactly what streaming inference needed.

The second lesson is about implementations versus specs. RFC 6455 has not changed since 2011, but the CVE wave from 2024 through 2026 — Node `ws`, libcurl twice, tRPC — shows that a stable specification is not a stable ecosystem. Production WebSocket deployments need to track library security as carefully as they track the protocol.

## Listening order

- **Before this chapter:** "gRPC" — sets up the modern RPC story on HTTP/2 and frames why the web needed something other than request/response for streaming workloads.
- **After this chapter:** "MCP and A2A" — picks up the agent-protocol thread that builds directly on the SSE-for-LLM-streaming pattern this chapter ends on.

## Where to go deeper

- The WebSocket episode covers the upgrade handshake, the binary frame format, the masking rules, and the production concerns around the 2024-2026 CVE wave.
- The SSE episode picks up the EventSource API, the `data:` and `event:` field format, the `Last-Event-ID` resume mechanism, and the HTTP/2 multiplexing story.
- The HTTP/1.1 episode is the substrate both protocols were designed for — keep-alive, chunked transfer encoding, and the request/response model that SSE stretches and WebSocket replaces.
- The HTTP/2 episode covers the multiplexing that lets many SSE streams share one TCP connection, plus the Extended CONNECT bootstrap from RFC 8441 that lets WebSocket ride HTTP/2.
- The TCP episode is the connection underneath, including the head-of-line blocking that motivated the move toward QUIC.
- The HTTP/3 and QUIC episodes pick up the longer-term transport future that WebTransport is built on.

## Sources

- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [Wikipedia — Ian Hickson](https://en.wikipedia.org/wiki/Ian_Hickson)
