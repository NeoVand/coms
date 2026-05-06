---
prompt_source: deep-research-prompts.txt:3941-4122 (SSE)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/c59b1fb1-9362-4c12-8bae-cb3b11807e36
research_mode: claude.ai Research
---

# Server-Sent Events (SSE): The Quiet Protocol That Won the AI Streaming Era

> A long-form, citation-backed research report. Date: 2026-05-05.

---

## TL;DR (the bottom line, three bullets)

- **Server-Sent Events is a small, ~20-year-old WHATWG/HTML standard for one-way server→client text streaming over a normal HTTP response with `Content-Type: text/event-stream`. It was specified by Ian Hickson, first shipped in Opera 9 in September 2006, and is currently defined in §9.2 of the HTML Living Standard (last updated 2 May 2026). For most of its life it lost mindshare to WebSocket; it is now the de facto wire format for LLM token streaming (OpenAI, Anthropic, Google Gemini, Cloudflare Workers AI) and underpins agent protocols like MCP and Google's A2A.** ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) ; [https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events) ; [https://dev.opera.com/blog/eventsource/](https://dev.opera.com/blog/eventsource/)) [W3Schools](https://www.w3schools.com/html/html5_serversentevents.asp)
- **The biggest 2024–2026 story is MCP's transport churn:** Anthropic launched MCP on 25 November 2024 with stdio + an "HTTP+SSE" transport that used two endpoints (`/sse` for the long-lived stream, `/messages` for client→server POSTs); the 2025-03-26 spec replaced that with **Streamable HTTP** — a single `/mcp` endpoint where POST responses can either be plain JSON or upgrade into an SSE stream — and explicitly deprecated the old SSE transport. SSE is *not* gone in MCP; it is now an *optional response mode* of Streamable HTTP. Major hosts (Atlassian Rovo, Keboola) have set HTTP+SSE removal deadlines for mid-2026. ([https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) ; [https://blog.cloudflare.com/streamable-http-mcp-servers-python/](https://blog.cloudflare.com/streamable-http-mcp-servers-python/) ; [https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484](https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484)) [Toolradar](https://toolradar.com/blog/streamable-http-vs-sse)[Toolradar](https://toolradar.com/blog/streamable-http-vs-sse)
- **Use SSE when you need server→client push and nothing else.** It is HTTP, it auto-reconnects, it traverses CDNs, it has a built-in resume mechanism (`Last-Event-ID`), and it composes with HTTP/2 multiplexing. Reach for WebSocket only when you genuinely need the client to send messages back over the same connection at high frequency (chat with interrupts, collaborative editing, multiplayer). WebTransport is interesting but, as of 2026, has no Safari support and limited Firefox support — not yet a default. ([https://websocket.org/comparisons/sse/](https://websocket.org/comparisons/sse/) ; [https://getstream.io/blog/websocket-sse/](https://getstream.io/blog/websocket-sse/) ; [https://websocket.org/guides/future-of-websockets/](https://websocket.org/guides/future-of-websockets/))

---

## 1. Prerequisites and glossary

A short, opinionated dictionary. One to two sentences plus an authoritative link. If you already know this stuff, skim.

- **OSI/TCP-IP stack layers.** A conceptual stack of network layers: physical → data link → network (IP) → transport (TCP/UDP/QUIC) → application (HTTP, SSE on top of HTTP). SSE lives entirely in the application layer. ([https://en.wikipedia.org/wiki/OSI_model](https://en.wikipedia.org/wiki/OSI_model))
- **Socket.** An OS-level endpoint for network I/O — the (IP address, port, protocol) tuple your code reads and writes through. SSE uses ordinary TCP sockets, the same ones HTTP uses. ([https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API))
- **TCP.** Reliable, ordered, byte-stream transport. A 3-way handshake (SYN/SYN-ACK/ACK) sets up state on both sides; head-of-line blocking is a property of TCP that affects HTTP/2 over TCP. ([https://hpbn.co/building-blocks-of-tcp/](https://hpbn.co/building-blocks-of-tcp/)) [DEV Community](https://dev.to/tjindapitak/server-sent-events-explained-2fd7)
- **HTTP/1.1.** Text-based request/response protocol over TCP. SSE is most often delivered as a single HTTP/1.1 response that the server simply never finishes — usually with `Transfer-Encoding: chunked`. Browsers limit HTTP/1.1 to ~6 connections per origin, which is *the* canonical SSE pitfall. ([https://datatracker.ietf.org/doc/html/rfc9112](https://datatracker.ietf.org/doc/html/rfc9112)) [DEV Community](https://dev.to/abhivyaktii/understanding-server-sent-events-sse-and-why-http2-matters-1cj7)
- **HTTP/2.** Binary, multiplexed protocol over a single TCP connection. HPACK compresses headers; many "streams" share one connection. Eliminates the 6-connection-per-origin SSE pain point because each SSE stream is just one of (default) 100 HTTP/2 streams. ([https://datatracker.ietf.org/doc/html/rfc9113](https://datatracker.ietf.org/doc/html/rfc9113)) [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)[DEV Community](https://dev.to/abhivyaktii/understanding-server-sent-events-sse-and-why-http2-matters-1cj7)
- **HTTP/3 / QUIC.** HTTP semantics over QUIC (UDP-based, encrypted transport with built-in multiplexing). Removes TCP head-of-line blocking between streams; SSE just rides along inside an HTTP/3 response body. ([https://http3-explained.haxx.se/](https://http3-explained.haxx.se/))
- **Headers.** Key/value metadata at the top of an HTTP message. SSE relies on `Content-Type: text/event-stream`, `Cache-Control: no-cache`, often `Connection: keep-alive` (HTTP/1.1) and a non-standard but ubiquitous `X-Accel-Buffering: no` to disable nginx buffering. ([https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers))
- **MIME type / media type.** A `type/subtype` label like `text/event-stream`. Registered with IANA per RFC 6838. ([https://datatracker.ietf.org/doc/html/rfc6838](https://datatracker.ietf.org/doc/html/rfc6838)) [IETF](https://datatracker.ietf.org/doc/html/rfc6838)
- **Chunked transfer encoding.** HTTP/1.1 mechanism for sending a body of unknown length as a series of size-prefixed chunks terminated by a zero-length chunk. SSE servers typically use chunked encoding and simply *never* send the terminating zero chunk. ([https://datatracker.ietf.org/doc/html/rfc9112#name-chunked-transfer-coding](https://datatracker.ietf.org/doc/html/rfc9112#name-chunked-transfer-coding))
- **`Content-Type`.** The HTTP header that names the body's media type. For SSE it must be `text/event-stream`. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [MDN Web Docs +3](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- **`Last-Event-ID`.** Both an HTTP request header sent by the browser when reconnecting and the SSE stream field that sets the value. Lets the server resume from a known point. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)[Amitavroy](https://amitavroy.com/articles/2025-04-01-server-sent-events-what-are-they-why-you-should-use-them)
- **`EventSource`.** The browser JavaScript interface for consuming SSE: `new EventSource(url, {withCredentials})`. Implements the parser, the dispatch algorithm, and exponential reconnection automatically. ([https://developer.mozilla.org/en-US/docs/Web/API/EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource))
- **Long-polling.** A pre-SSE Comet technique: client sends an XHR, server holds it open until it has data, responds, client immediately re-requests. RFC 6202 is the canonical write-up. ([https://datatracker.ietf.org/doc/html/rfc6202](https://datatracker.ietf.org/doc/html/rfc6202))
- **Comet.** Umbrella term coined by Alex Russell in 2006 for HTTP server-push tricks (forever-frame, hidden iframe, long-poll). SSE was the standardised replacement. ([https://en.wikipedia.org/wiki/Comet_(programming)](https://en.wikipedia.org/wiki/Comet_(programming))) [Wikipedia](https://en.wikipedia.org/wiki/Comet_(programming))
- **WebSocket (RFC 6455).** Full-duplex framed protocol that begins with an HTTP/1.1 `Upgrade: websocket` handshake then leaves HTTP behind. Bidirectional, binary-capable, no built-in reconnection. ([https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455))
- **CORS.** Cross-Origin Resource Sharing — browser policy machinery for cross-origin HTTP. SSE participates in CORS via the Fetch standard; cross-origin `EventSource` requires `withCredentials: true` *and* matching `Access-Control-Allow-*` headers. ([https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS))
- **Frames vs. streams.** "Frame" = a discrete message (HTTP/2 frame, WebSocket frame). "Stream" = a logical sequence of frames. In SSE, the message unit is an event-block separated by a blank line in the body. ([https://datatracker.ietf.org/doc/html/rfc9113](https://datatracker.ietf.org/doc/html/rfc9113))
- **UTF-8 BOM.** The byte sequence `EF BB BF` at the start of a UTF-8 stream. The SSE parser is required to consume it if present and not treat it as data. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [Js](https://csv.js.org/parse/options/bom/)
- **Heartbeat / keep-alive comment.** A line beginning with `:` is a comment per the SSE grammar. Servers send `: ping\n\n` every ~15s to defeat idle-connection timeouts in proxies and load balancers. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [MDN Web Docs + 3](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

---

## 2. History and story

**The setting (2004).** In June 2004 Ian Hickson (then at Opera) walked out of a W3C Workshop on Web Applications and Compound Documents at Adobe in San Jose. The W3C had just voted (8 for, 11 against) to push web applications forward through XHTML rather than by extending HTML. Two days later, on 4 June 2004, Hickson, Brendan Eich and others from Mozilla and Opera announced a new mailing list and charter: the **Web Hypertext Application Technology Working Group (WHATWG)** — a venue for incrementally extending HTML for application development. ([https://thehistoryoftheweb.com/when-standards-divide/](https://thehistoryoftheweb.com/when-standards-divide/) ; [https://en.wikipedia.org/wiki/WHATWG](https://en.wikipedia.org/wiki/WHATWG)) [The History of the Web + 2](https://thehistoryoftheweb.com/when-standards-divide/)

The output of that group was a sprawling spec called *Web Applications 1.0*, which by 2007 had been informally renamed **HTML5** (the name was first used in this sense in messages between Anne van Kesteren and Hickson on the WHATWG list). ([https://github.com/whatwg/web-history](https://github.com/whatwg/web-history)) [GitHub](https://github.com/whatwg/web-history)

**The original SSE draft (2004–2006).** Tucked inside the Web Applications 1.0 draft was a section originally titled "Server-Sent DOM events." The first design used a custom HTML element (`<eventsource>`) declaring a URL whose response would be parsed as a stream of DOM events. Opera shipped an experimental implementation in **Opera 9 in September 2006**, announced on the Opera dev blog by Arve Bersvendsen ("Event Streaming to Web Browsers", 1 September 2006). ([https://dev.opera.com/blog/event-streaming-to-web-browsers/](https://dev.opera.com/blog/event-streaming-to-web-browsers/) ; [https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events)) [Blogger + 2](http://constc.blogspot.com/2006/09/server-sent-events.html)

The original spec was, per Opera's own retrospective, "really quite complex." Mozilla's Jonas Sicking gave feedback that simplified it: the `<eventsource>` element was deprecated in favour of a simple JS object closely modeled on `XMLHttpRequest`, and the message format was reduced to a tiny line-oriented grammar. The interface was renamed `EventSource` and the section was eventually pulled out of HTML5 into a small standalone Server-Sent Events spec, before being folded back into the HTML Living Standard as §9.2. ([https://dev.opera.com/blog/eventsource/](https://dev.opera.com/blog/eventsource/)) [Opera](https://dev.opera.com/blog/eventsource/)[Opera](https://dev.opera.com/blog/eventsource/)

**Standardisation milestones.**

- 2006-09-01: Opera 9 ships first experimental implementation. ([https://dev.opera.com/blog/event-streaming-to-web-browsers/](https://dev.opera.com/blog/event-streaming-to-web-browsers/))
- 2009-12-22: W3C publishes the *Server-Sent Events* Last Call Working Draft, edited by Hickson at Google. ([https://www.w3.org/TR/2009/WD-eventsource-20091222/](https://www.w3.org/TR/2009/WD-eventsource-20091222/)) [W3C](https://www.w3.org/TR/2009/WD-eventsource-20091222/)
- 2011: SSE ships in shipping versions of Firefox 6, Chrome 6, Safari 5, and Opera 11; built-in reconnection included from day one. ([https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events)) [Wikipedia](https://en.wikipedia.org/wiki/Server-sent_events)
- 2015-02-03: W3C *Server-Sent Events* Recommendation is published. ([https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events)) [Wikipedia](https://en.wikipedia.org/wiki/Server-sent_events)
- 2017-onward: spec migrates into the WHATWG HTML Living Standard, §9.2, where it is now maintained. The WHATWG snapshot fetched for this report carries "Living Standard — Last Updated 2 May 2026." ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- 2019: W3C and WHATWG sign a memorandum of understanding consolidating HTML/DOM development at the WHATWG; Microsoft Edge (post-Chromium, version 79+, January 2020) gets SSE support as a side effect. ([https://en.wikipedia.org/wiki/WHATWG](https://en.wikipedia.org/wiki/WHATWG)) [Wikipedia + 2](https://en.wikipedia.org/wiki/WHATWG)

**The pre-SSE landscape SSE replaced.**

- **Comet** (2006, term coined by Alex Russell) — umbrella for hidden-iframe "forever frame," long-polling, and chunked-streaming hacks. ([https://en.wikipedia.org/wiki/Comet_(programming)](https://en.wikipedia.org/wiki/Comet_(programming))) [Wikipedia](https://en.wikipedia.org/wiki/Comet_(programming))
- **Bayeux** (2006-2007, Dojo Foundation) — JSON publish/subscribe channels over Comet long-poll/streaming, two HTTP connections per client. ([https://github.com/cometd/cometd-documentation/blob/master/src/main/asciidoc/bayeux.adoc](https://github.com/cometd/cometd-documentation/blob/master/src/main/asciidoc/bayeux.adoc)) [IETF](https://datatracker.ietf.org/doc/id/draft-loreto-http-bidirectional-07.html)[IETF](https://datatracker.ietf.org/doc/id/draft-loreto-http-bidirectional-07.html)
- **BOSH (XEP-0124)** — XMPP Standards Foundation, defined 2003-2007, "Bidirectional-streams Over Synchronous HTTP" using paired long-polling. ([https://xmpp.org/extensions/xep-0124.html](https://xmpp.org/extensions/xep-0124.html)) [IETF](https://datatracker.ietf.org/doc/id/draft-loreto-http-bidirectional-07.html)[Wikipedia](https://en.wikipedia.org/wiki/BOSH_(protocol))
- **HTTP/2 server push** — RFC 7540 (May 2015). Disabled by default in Chrome 106 (October 2022) due to <1% adoption and no clear performance gain; not implemented in most HTTP/3 servers. **Often confused with SSE; it is unrelated.** Server push was for proactively pushing static resources (CSS, JS) the client hadn't yet asked for, not application-level event streams. ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push) ; [https://en.wikipedia.org/wiki/HTTP/2_Server_Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)) [Chrome Developers](https://developer.chrome.com/blog/removing-push)
- **WebSocket (RFC 6455)** — standardised 2011. Took most of the real-time mindshare for over a decade. ([https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)) [GetStream](https://getstream.io/blog/websocket-sse/)

**Why SSE lost mindshare to WebSocket — and why it came back.** The standard explanation has two parts. First, WebSocket is bidirectional and binary; SSE is one-way and text-only. For chat, multiplayer, and collaborative editing — the "obviously real-time" use cases of the 2012–2020 era — WebSocket was the right primitive. Second, SSE's HTTP/1.1 6-connection limit was a real, persistent footgun: open six tabs of an SSE-driven app to the same origin and the seventh tab silently stalls. Both Firefox and Chromium marked the request to lift this limit as "Won't fix." ([https://bugzilla.mozilla.org/show_bug.cgi?id=906896](https://bugzilla.mozilla.org/show_bug.cgi?id=906896)) [Mozilla Bugzilla + 2](https://bugzilla.mozilla.org/show_bug.cgi?id=906896)

The pendulum swung back for two reasons:

1. **HTTP/2 multiplexing** ended the connection limit in practice (default 100 streams per connection, negotiated). ([https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)) [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
2. **LLM token streaming.** OpenAI, Anthropic, and Google Gemini all chose SSE as the wire format for streaming completions because the workload — one client request, a long sequence of server-pushed tokens, then `[DONE]` — fits SSE perfectly and integrates trivially with any HTTP infrastructure. ([https://platform.openai.com/docs/api-reference/responses-streaming](https://platform.openai.com/docs/api-reference/responses-streaming) ; [https://docs.anthropic.com/en/api/messages-streaming](https://docs.anthropic.com/en/api/messages-streaming))

By early 2025 the framing had inverted: GetStream's protocol comparison opens, "WebSocket exits HTTP entirely … SSE stays inside a standard HTTP response that never closes. … LLM token streaming has since made SSE the default transport for most major AI SDKs." ([https://getstream.io/blog/websocket-sse/](https://getstream.io/blog/websocket-sse/)) [GetStream](https://getstream.io/blog/websocket-sse/)

**What changed in the last 24 months (2024 → May 2026).**

- **MCP (25 Nov 2024)** ships with stdio + HTTP+SSE transport. ([https://modelcontextprotocol.info/blog/mcp-next-version-update/](https://modelcontextprotocol.info/blog/mcp-next-version-update/)) [AI Wiki](https://aiwiki.ai/wiki/mcp)
- **MCP 2025-03-26**: Streamable HTTP replaces HTTP+SSE; the @modelcontextprotocol/sdk v1.10.0 (17 April 2025) is the first to ship it. ([https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) ; [https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)) [Fka](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- **A2A (April 2025, Google → Linux Foundation)**: ships using HTTP + JSON-RPC + SSE for streaming agent updates. ([https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) ; [https://github.com/a2aproject/A2A](https://github.com/a2aproject/A2A)) [Google Developers](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- **MCP 2025-06-18**: structured tool outputs, OAuth-based authorization, elicitation. ([https://modelcontextprotocol.io/specification/2025-11-25/changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog)) [Modelcontextprotocol](https://blog.modelcontextprotocol.io/posts/2025-09-26-mcp-next-version-update/)[Modelcontextprotocol](https://modelcontextprotocol.info/blog/mcp-next-version-update/)
- **MCP 2025-11-25**: experimental Tasks primitive (long-running jobs), authorization extensions, SSE polling clarifications (SEP-1699 lets servers disconnect at will, with resumption always via GET). ([https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/) ; [https://workos.com/blog/mcp-2025-11-25-spec-update](https://workos.com/blog/mcp-2025-11-25-spec-update))
- **December 2025**: Anthropic donates MCP to the new **Agentic AI Foundation (AAIF)**, a Linux Foundation directed fund co-founded with Block and OpenAI. ([https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)) [Being Guru +2](https://beingguru.com/anthropic-mcp-hits-97-million-installs/)
- **Vercel AI SDK 5 (2025)** standardises on SSE as its transport but exposes a pluggable `ChatTransport` interface; teams running into mid-stream signal needs (cancel, approve tool, steer) increasingly bolt WebSocket transports on top. ([https://vercel.com/blog/ai-sdk-5](https://vercel.com/blog/ai-sdk-5) ; [https://websocket.org/guides/websockets-and-ai/](https://websocket.org/guides/websockets-and-ai/))

---

## 3. How it actually works

This is enough mechanics to re-implement a minimal SSE server and client.

### 3.1 The on-the-wire format

A response with `Content-Type: text/event-stream` is a UTF-8 stream of lines. A line ends with CR, LF, or CRLF. **Events are separated by a blank line.** Each non-blank line is a single field with this grammar (paraphrased from §9.2 of the HTML standard):

```
field        = name [ ":" [ " " ] value ]
name in     { "data", "event", "id", "retry" }   ; everything else is ignored
empty line  ; dispatches the event
line starting with ":"  ; comment, ignored (used for keep-alives)
```

Field semantics (from the WHATWG dispatch algorithm):

- `data:` — appended to the *data buffer*; if there are multiple `data:` lines, they are concatenated with `\n` between them. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- `event:` — sets the *event type buffer* (default is `"message"`).
- `id:` — sets the *last event ID buffer* unless the value contains U+0000 NULL (in which case ignored). The buffer is **not** reset between events. [MDN Web Docs + 2](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- `retry:` — if the value is ASCII digits only, sets the reconnection time in milliseconds. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)[HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- A line with no colon is treated as the field name with empty value. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- A leading single space after the colon is stripped (`data: hello` and `data:hello` are equivalent). [HTML Standard](https://html.spec.whatwg.org/dev/server-sent-events.html)
- A leading UTF-8 BOM (EF BB BF) at the very start must be skipped.

([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html))

### 3.2 A real on-the-wire example

Below is the actual byte sequence (with `↵` representing LF). The HTTP framing is HTTP/1.1 with chunked encoding; an HTTP/2 or HTTP/3 response body would carry exactly the same payload bytes inside framed DATA streams.

```
HTTP/1.1 200 OK↵
Content-Type: text/event-stream; charset=utf-8↵
Cache-Control: no-cache, no-transform↵
Connection: keep-alive↵
X-Accel-Buffering: no↵
Transfer-Encoding: chunked↵
↵
: hi — heartbeat to defeat idle proxy timeouts↵
↵
event: price↵
id: 17↵
data: {"sym":"GOOG","px":1502.31}↵
↵
data: a multi-line↵
data: message arrives as a single↵
data: event with newlines between↵
↵
retry: 5000↵
↵
event: price↵
id: 18↵
data: {"sym":"GOOG","px":1503.10}↵
↵
```

The browser fires three custom-typed events (`price`, `message`, `price`), updates `lastEventId` to `"18"`, and sets the reconnection delay to 5 seconds. A real OpenAI Chat Completions response looks identical except every `data:` payload is a JSON chunk with a `delta.content` field, and the stream ends with `data: [DONE]\n\n` — a sentinel that is *not* part of the SSE spec but is a widely copied OpenAI convention. ([https://platform.openai.com/docs/api-reference/responses-streaming](https://platform.openai.com/docs/api-reference/responses-streaming) ; [https://til.simonwillison.net/llms/streaming-llm-apis](https://til.simonwillison.net/llms/streaming-llm-apis)) [Substack](https://advancedwebdev.substack.com/p/how-does-ai-gpt-use-server-side-events)

### 3.3 Sequence diagram (Mermaid)

```
sequenceDiagram
    autonumber
    participant B as Browser (EventSource)
    participant S as Server
    B->>S: GET /events  Accept: text/event-stream
    S-->>B: 200 OK  Content-Type: text/event-stream
    Note over S: Connection stays open, chunked
    S-->>B: data: hello\n\n            (id: 1)
    S-->>B: data: world\n\n            (id: 2)
    Note over B,S: Network drop
    Note over B: wait reconnectionTime\n(default ~3s, override via retry:)
    B->>S: GET /events\nLast-Event-ID: 2\nAccept: text/event-stream
    S-->>B: 200 OK + replay events 3..n
    Note over B: Sets readyState OPEN; resumes
    S-->>B: data: ...\n\n
```

(Behaviour from [https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) and [https://javascript.info/server-sent-events](https://javascript.info/server-sent-events))

### 3.4 The dispatch algorithm (paraphrased to be implementation-friendly)

Maintain three buffers (`data`, `eventType`, `lastEventId`). Read lines. On a line:

1. If empty → if `data` buffer is empty, do not dispatch; otherwise, strip a single trailing `\n` from the `data` buffer, fire an event of name `eventType` (default `"message"`) with `event.data = data buffer`, `event.lastEventId = lastEventId buffer`, then clear `data` and `eventType` (but **not** `lastEventId`).
2. If line starts with `:` → ignore (comment).
3. Else split on first `:`. Treat the part before as field name, the part after (with at most one leading space stripped) as value. Apply per-field semantics above.

The reconnection algorithm: on any disconnect (including non-2xx status, parse error of MIME type, etc.) the user agent fires `error`, sets `readyState = CONNECTING`, waits the *reconnection time* (default implementation-defined, "probably in the region of a few seconds" — Chrome/Firefox/Safari use 3000 ms), then re-issues `GET` with a `Last-Event-ID` header set to the current `lastEventId` buffer. A response with HTTP 204 tells the user agent to stop reconnecting and close the connection. A 5xx is a "retry"; a 4xx is fatal. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) ; [https://singhajit.com/server-sent-events-explained/](https://singhajit.com/server-sent-events-explained/)) [HTML Standard + 2](https://html.spec.whatwg.org/multipage/server-sent-events.html)

### 3.5 The browser API

js

```
const es = new EventSource('/api/v1/sse', { withCredentials: true });

// Default-typed (no event: line) → "message"
es.onmessage = e => console.log(e.data, e.lastEventId);

// Named events (event: notice in the stream)
es.addEventListener('notice', e => console.log('notice:', e.data));

es.onerror = e => console.warn('disconnected; browser will auto-reconnect');
es.close();   // explicit close — no reconnect
```

`readyState` is `0` (CONNECTING), `1` (OPEN), or `2` (CLOSED). Note three sharp edges: (a) the constructor only takes a URL, so SSE only does `GET` natively; (b) you cannot set custom HTTP headers (no `Authorization`) — use a cookie, a query-param token, or a polyfill that wraps `fetch`; (c) the second-argument options dict has exactly one option in the spec: `withCredentials`. ([https://developer.mozilla.org/en-US/docs/Web/API/EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)) [JavaScript.info + 4](https://javascript.info/server-sent-events)

### 3.6 CORS

For cross-origin SSE the server must respond with `Access-Control-Allow-Origin` and (if `withCredentials: true`) `Access-Control-Allow-Credentials: true`. Because `EventSource` only does simple GETs, no preflight is normally needed. ([https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events))

### 3.7 Behaviour by HTTP version

- **HTTP/1.1** — the canonical case. Each SSE stream consumes one of the browser's per-origin connections (typically 6). With multiple tabs you can deadlock the rest of the site. ([https://developer.mozilla.org/en-US/docs/Web/API/EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) ; [https://bugzilla.mozilla.org/show_bug.cgi?id=906896](https://bugzilla.mozilla.org/show_bug.cgi?id=906896)) [DEV Community](https://dev.to/tjindapitak/server-sent-events-explained-2fd7)[DEV Community](https://dev.to/abhivyaktii/understanding-server-sent-events-sse-and-why-http2-matters-1cj7)
- **HTTP/2** — multiplexed; one TCP connection carries up to (negotiated, default 100) streams. SSE is just a long-running stream. HPACK efficiently compresses the headers across streams. The browser's per-origin "concurrent SSE" cap effectively becomes the H/2 stream cap. ([https://datatracker.ietf.org/doc/html/rfc9113](https://datatracker.ietf.org/doc/html/rfc9113)) [portalZINE NMN](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- **HTTP/3 / QUIC** — same logical behaviour as H/2 but without TCP head-of-line blocking; a dropped IP packet for one stream no longer stalls others. ([https://http3-explained.haxx.se/](https://http3-explained.haxx.se/))

### 3.8 Proxies, buffering, gzip, and timeouts

This is where SSE deployments die in production.

- **nginx, FastCGI, Apache** all buffer responses by default. Set `X-Accel-Buffering: no` in your application response (nginx-specific but widely respected) and/or `proxy_buffering off`. Without this, events accumulate until a buffer fills. Atlassian's, Cloudflare's, and the WHATWG's docs all repeat this warning. ([https://github.com/gin-gonic/gin/issues/1589](https://github.com/gin-gonic/gin/issues/1589) ; [https://atlassc.net/2023/12/28/realtime-server-sent-events-held-back-by-nginx](https://atlassc.net/2023/12/28/realtime-server-sent-events-held-back-by-nginx))
- **Idle timeouts.** AWS ALBs, Azure App Service / Application Gateway, and corporate proxies cut idle HTTP connections at 60s–4min. Send a `: ping\n\n` comment every 15s. Microsoft's own SSE-on-Azure FAQ recommends exactly this. ([https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app](https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app))
- **gzip / `Content-Encoding: gzip`.** Some compression configurations buffer until the gzip window fills, defeating real-time streaming. Disable compression for `text/event-stream` (Cache-Control: `no-transform` helps but is advisory). ([https://www.openfaas.com/blog/openai-streaming-responses/](https://www.openfaas.com/blog/openai-streaming-responses/))
- **Heartbeat / keep-alive.** A line beginning with `:` is a comment. Most servers send `: keep-alive\n\n` or `: ping\n\n` every 15s. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html))
- **Ports.** SSE uses **whatever port HTTP uses (80/443)**. There is no dedicated SSE port — that's a deliberate part of why it traverses corporate networks so well. ([https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events))

### 3.9 Minimal server (~30 lines, Python/FastAPI)

python

```
from fastapi import FastAPI, Request
from sse_starlette import EventSourceResponse
import asyncio, json

app = FastAPI()

@app.get("/events")
async def events(req: Request, after: int = 0):
    async def gen():
        seq = after
        while not await req.is_disconnected():
            seq += 1
            yield {
                "event": "tick",
                "id": str(seq),
                "data": json.dumps({"n": seq}),
            }
            await asyncio.sleep(1)
    # sse-starlette adds X-Accel-Buffering: no, periodic ":\n\n" pings, etc.
    return EventSourceResponse(gen())
```

`sse-starlette` (2,200+ GitHub stars, last updated 2025-2026, supports Python 3.9–3.13) is the canonical FastAPI/Starlette implementation, with built-in client-disconnect detection, configurable ping interval, multi-loop support, and graceful shutdown. ([https://github.com/sysid/sse-starlette](https://github.com/sysid/sse-starlette) ; [https://pypi.org/project/sse-starlette/](https://pypi.org/project/sse-starlette/)) [GitHub](https://github.com/sysid/sse-starlette)

---

## 4. Deep connections to other protocols

### 4.1 HTTP/1.1

SSE is a fully conforming HTTP/1.1 response with `Content-Type: text/event-stream` whose body is sent using chunked transfer encoding and never finished. It uses no special headers, no `Upgrade`, no protocol switch — that is precisely why CDNs, WAFs, corporate proxies, and load balancers handle it transparently. The single reliable footgun is **the per-origin connection cap of ~6**: every tab of every page that has an open `EventSource` to the same origin consumes one. After the sixth, the browser silently queues new HTTP requests behind it, including images and CSS for normal page loads. Both Chromium (bug 275955) and Firefox (bug 906896) have marked the limit "Won't fix." ([https://bugzilla.mozilla.org/show_bug.cgi?id=906896](https://bugzilla.mozilla.org/show_bug.cgi?id=906896) ; [https://bugs.chromium.org/p/chromium/issues/detail?id=275955](https://bugs.chromium.org/p/chromium/issues/detail?id=275955)) [Mozilla Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=906896)[GitHub](https://github.com/enisdenjo/graphql-sse/blob/master/PROTOCOL.md)

### 4.2 HTTP/2

Multiplexing is the silver bullet. Up to (default) 100 concurrent streams share a single TLS-terminated TCP connection, so the 6-connection limit becomes a 100-stream limit and effectively a non-issue for a single origin. HPACK header compression makes the per-stream overhead negligible compared to chunked H/1.1. The only subtlety is *stream priority*: idle SSE streams that occasionally tick should generally not be flagged as high priority, or they can starve interactive resources during congestion. ([https://datatracker.ietf.org/doc/html/rfc9113](https://datatracker.ietf.org/doc/html/rfc9113) ; [https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)) [GetStream](https://getstream.io/blog/websocket-sse/)[portalZINE NMN](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)

### 4.3 HTTP/3 / QUIC

HTTP/3 inherits H/2's multiplexing but moves it into QUIC, which terminates head-of-line blocking *between* streams (one lost packet for stream A no longer stalls stream B). For SSE workloads with chatty heartbeats and bursty event blocks, this is a real win on lossy mobile networks. There is no SSE-specific behaviour at the QUIC layer; SSE just rides along inside an HTTP/3 response body. ([https://http3-explained.haxx.se/](https://http3-explained.haxx.se/))

### 4.4 WebSocket (RFC 6455)

The eternal comparison. WebSocket starts as an HTTP/1.1 `Upgrade: websocket` handshake, then leaves HTTP entirely for a full-duplex framed TCP channel. Once upgraded, no HTTP machinery (caching, request retries, `Authorization` headers, request IDs) is available. WebSocket is bidirectional and binary-capable; SSE is server→client only and UTF-8 only. WebSocket has **no built-in reconnection or message replay**; SSE has both. WebSocket compresses headers exactly once (during the handshake); SSE re-sends them every reconnect (HTTP/2 mitigates this with HPACK). When you only need server-push, SSE is dramatically simpler and friendlier to existing infrastructure; when you need the client to talk back over the same connection at high frequency (chat with mid-stream "stop" and tool approvals, multiplayer), WebSocket is the right primitive. The 2026 industry consensus: start with SSE, escalate to WebSocket on demonstrated need. ([https://websocket.org/comparisons/sse/](https://websocket.org/comparisons/sse/) ; [https://getstream.io/blog/websocket-sse/](https://getstream.io/blog/websocket-sse/) ; [https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)) [DEV Community + 5](https://dev.to/tjindapitak/server-sent-events-explained-2fd7)

### 4.5 GraphQL

GraphQL Subscriptions historically used WebSocket (the `graphql-ws` / `graphql-transport-ws` family). Two newer transports have emerged:

- **graphql-sse** (Denis Badurina, [https://github.com/enisdenjo/graphql-sse](https://github.com/enisdenjo/graphql-sse), 430+ stars, current version 2.6.0, MIT) defines GraphQL over SSE with two modes: *single-connection* (one SSE reservation; multiple operations multiplexed by `operationId`) for HTTP/1.1 environments where the 6-connection cap matters, and *distinct connections* (one SSE stream per operation) for HTTP/2+. ([https://github.com/enisdenjo/graphql-sse/blob/master/PROTOCOL.md](https://github.com/enisdenjo/graphql-sse/blob/master/PROTOCOL.md)) [GitHub + 2](https://github.com/enisdenjo/graphql-sse/discussions)
- **multipart/mixed**: Apollo's GraphOS Router uses `multipart/mixed; boundary=graphql; subscriptionSpec=1.0` for `@defer` and `@stream` directives, with chunked encoding on H/1.1 and built-in streaming on H/2. ([https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol](https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol)) [Apollo GraphQL](https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol)[Apollo GraphQL](https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol)

The `@defer` and `@stream` directives let a single GraphQL operation send a partial response immediately and stream the rest as it becomes available — a perfect fit for SSE. ([https://the-guild.dev/graphql/yoga-server/docs/features/defer-stream](https://the-guild.dev/graphql/yoga-server/docs/features/defer-stream))

### 4.6 REST

SSE complements REST cleanly: REST handles the imperative writes and synchronous reads; SSE handles the long-lived "tell me when something happens" path. The pattern Mercure formalises is: client reads a resource via REST, the response includes a `Link: <hub>; rel="mercure"` header pointing at an SSE hub URL, client subscribes via `EventSource` to receive future updates of that resource. ([https://mercure.rocks/spec](https://mercure.rocks/spec)) [Mercure](https://mercure.rocks/spec)

### 4.7 MCP — the headline 2024–2026 transition

**Origin (Nov 2024).** The Model Context Protocol was created at Anthropic by David Soria Parra and Justin Spahr-Summers; the project's reference point was Microsoft's Language Server Protocol. It launched 25 November 2024 with reference servers for Google Drive, Slack, GitHub, Git, Postgres, and Puppeteer; Claude Desktop was the first reference host. ([https://aiwiki.ai/wiki/mcp](https://aiwiki.ai/wiki/mcp) ; [https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)) [Wikipedia + 3](https://en.wikipedia.org/wiki/Model_Context_Protocol)

**The 2024-11-05 transport (HTTP+SSE).** Two endpoints, two phases. The client `GET /sse` to open a long-lived `text/event-stream`; the server's first event provided the URL of a separate `POST /messages` endpoint to which the client wrote JSON-RPC requests. Responses came back as SSE events on the original stream. This is "an open phone line for listening + a separate phone for talking" (Auth0's metaphor). It worked, but it punished load balancers (sticky sessions required), serverless platforms (long-lived connections), and corporate firewalls. It also made authentication awkward, since headers were only checked on the SSE connect, not on each `POST`. ([https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/) ; [https://auth0.com/blog/mcp-streamable-http/](https://auth0.com/blog/mcp-streamable-http/) ; [https://docs.roocode.com/features/mcp/server-transports](https://docs.roocode.com/features/mcp/server-transports)) [Fka + 3](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)

**The 2025-03-26 transport: Streamable HTTP.** A single endpoint (e.g. `/mcp`) supports both `POST` (client → server JSON-RPC, with a response that is *either* `application/json` for a single response or an `text/event-stream` upgrade for streaming responses) and `GET` (client opens an SSE channel for server-initiated notifications/requests, optional). Sessions are tracked via an `Mcp-Session-Id` HTTP header; servers MUST validate `Origin` to prevent DNS rebinding; session IDs MUST be cryptographically secure (a fix to a real vulnerability — see §6). The first SDK release with Streamable HTTP was @modelcontextprotocol/sdk **v1.10.0 on 17 April 2025**. ([https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) ; [https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)) [Model Context Protocol + 5](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)

**Important nuance often missed:** SSE is not gone in MCP — it is now the *streaming response mode of Streamable HTTP*. A POST that returns long output simply switches `Content-Type: application/json` for `text/event-stream` and the response body becomes a stream of SSE events. The old `/sse + /messages` two-endpoint dance is what was deprecated. ([https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)) [Toolradar](https://toolradar.com/blog/streamable-http-vs-sse)

**Adoption deadlines.** ChatGPT's MCP support is **Streamable HTTP only** — no stdio, no legacy SSE. Atlassian Rovo's `mcp.atlassian.com/v1/sse` endpoint is scheduled for removal **30 June 2026**; Keboola's deadline is **1 April 2026**. ([https://toolradar.com/blog/streamable-http-vs-sse](https://toolradar.com/blog/streamable-http-vs-sse) ; [https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484](https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484)) [Toolradar + 2](https://toolradar.com/blog/streamable-http-vs-sse)

**June 2025 update (2025-06-18).** Structured tool outputs, OAuth-based authorization, elicitation (server-initiated user prompts), security best-practice guidance. [Modelcontextprotocol](https://modelcontextprotocol.info/blog/mcp-next-version-update/)

**November 2025 update (2025-11-25).** Anniversary release introduces an experimental **Tasks** primitive for long-running async operations (states: `working`, `input_required`, `completed`, `failed`, `cancelled`); authorization extensions (OAuth client-credentials per SEP-1046, OAuth Client ID Metadata Documents per SEP-991); SEP-1699 clarifies SSE polling behaviour, allowing servers to disconnect at will and requiring resumption always via GET regardless of stream origin; the spec is officially marked backward-compatible. ([https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/) ; [https://modelcontextprotocol.io/specification/2025-11-25/changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog) ; [https://workos.com/blog/mcp-2025-11-25-spec-update](https://workos.com/blog/mcp-2025-11-25-spec-update)) [Medium + 2](https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03)

**December 2025.** Anthropic donates MCP to the Agentic AI Foundation, a directed fund of the Linux Foundation, co-founded with Block and OpenAI; platinum members include AWS, Google, Microsoft, Cloudflare, Bloomberg. ([https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)) [Spotify](https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs)[Being Guru](https://beingguru.com/anthropic-mcp-hits-97-million-installs/)

### 4.8 A2A (Agent-to-Agent, Google → Linux Foundation, 2025)

Announced April 2025 by Google with 50+ partners (Atlassian, Box, Cohere, Salesforce, SAP, MongoDB, etc.), donated to the Linux Foundation. A2A is built on **HTTP, JSON-RPC 2.0, and SSE**, with two parallel "transports" supported by the spec: synchronous request/response and an SSE streaming mode. The two RPC methods are `message/send` (full response) and `message/stream` (Server-Sent Events). Tasks have lifecycle states (`pending`, `in-progress`, `completed`, `failed`) and SSE delivers status changes and artifact chunks; "push notifications" are an alternative for long-running disconnected scenarios where the agent calls back to a webhook URL. ([https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) ; [https://github.com/a2aproject/A2A](https://github.com/a2aproject/A2A) ; [https://a2a-protocol.org/latest/specification/](https://a2a-protocol.org/latest/specification/) ; [https://docs.langchain.com/langsmith/server-a2a](https://docs.langchain.com/langsmith/server-a2a) ; [https://www.ibm.com/think/topics/agent2agent-protocol](https://www.ibm.com/think/topics/agent2agent-protocol)) [Google Developers + 3](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)

### 4.9 Mercure

Mercure (Kévin Dunglas, [https://mercure.rocks/spec](https://mercure.rocks/spec), also published as IETF Internet-Draft *draft-dunglas-mercure*, current revision 07) is a real-time pub/sub protocol layered on top of SSE. A *hub* maintains the persistent SSE connections; publishers POST updates to the hub with topic selectors; subscribers `EventSource` to the hub URL with `?topic=...` query parameters, optionally with a JWT for authorisation. Mercure adds JWT-based authorisation, multi-topic subscription on a single SSE connection, automatic state reconciliation via `Last-Event-ID`, and an event store. The reference hub is a Caddy module with managed cloud and enterprise editions. Symfony's `symfony/mercure` integration is the most prominent first-class adopter. ([https://mercure.rocks/spec](https://mercure.rocks/spec) ; [https://www.ietf.org/archive/id/draft-dunglas-mercure-07.html](https://www.ietf.org/archive/id/draft-dunglas-mercure-07.html) ; [https://symfony.com/doc/current/mercure.html](https://symfony.com/doc/current/mercure.html)) [Dunglas](https://dunglas.dev/2023/11/mercure-braid-prep-news-about-subscribing-to-http-resource-updates/)[Mercure](https://mercure.rocks/spec)

### 4.10 htmx SSE extension

htmx, the "high-power tools for HTML" library, has both a v1/v2 SSE extension (`hx-ext="sse"`, `sse-connect`, `sse-swap`) and an htmx 4 rewrite that hooks SSE into the standard request pipeline: any htmx request whose response carries `Content-Type: text/event-stream` is automatically streamed and DOM-swapped per htmx's normal semantics. Reconnection adds an exponential-backoff layer on top of the browser's built-in retry, and the extension dispatches DOM events (`htmx:sseBeforeMessage`, `htmx:sseClose`, etc.) for fine-grained control. ([https://htmx.org/extensions/sse/](https://htmx.org/extensions/sse/) ; [https://four.htmx.org/docs/extensions/sse](https://four.htmx.org/docs/extensions/sse)) [htmx](https://v1.htmx.org/extensions/server-sent-events/)

### 4.11 EventSource polyfills and `fetch` streaming

The native `EventSource` is GET-only and cannot send custom headers (notably `Authorization`). Two pragmatic alternatives:

- **Microsoft's `@microsoft/fetch-event-source`** wraps `fetch()`, supports POST, custom headers, request bodies, and re-implements the SSE parser and reconnection. This is what most LLM SDKs effectively do. ([https://til.simonwillison.net/llms/streaming-llm-apis](https://til.simonwillison.net/llms/streaming-llm-apis))
- **Direct `fetch` + `ReadableStream`** with a hand-rolled `data:` line splitter is the pattern shown in OpenAI's, Anthropic's, and Cloudflare Workers AI's docs and code samples. The pattern: `response.body.pipeThrough(new TextDecoderStream()).getReader()`, accumulate a buffer, split on `\n\n` for events. ([https://jsyang.ca/guides/handling-sse-streaming-ai-models/](https://jsyang.ca/guides/handling-sse-streaming-ai-models/))
- **`eventsource` (npm, Node.js)**, the Node implementation of EventSource, is currently 4.1.0 (last update Q1 2026). CVE-2022-1650 — leaking auth headers across cross-origin redirects — was fixed in 1.1.1/2.0.2; Debian, Ubuntu USN-6082-1, and most LTS distributions issued backports. ([https://snyk.io/vuln/npm:eventsource](https://snyk.io/vuln/npm:eventsource) ; [https://ubuntu.com/security/notices/USN-6082-1](https://ubuntu.com/security/notices/USN-6082-1)) [SentinelOne](https://www.sentinelone.com/vulnerability-database/cve-2022-1650/)

### 4.12 LLM provider streaming APIs (the format that ate the world)

**OpenAI.** Both Chat Completions (`stream=true`) and the newer Responses API stream as SSE. Chat Completions sends `data: {chunk JSON}\n\n` events with no `event:` line, and ends with the literal `data: [DONE]\n\n` sentinel. The Responses API uses *named* events: `response.created`, `response.output_text.delta`, `response.completed`, etc., each with `sequence_number` for ordering. ([https://platform.openai.com/docs/api-reference/responses-streaming](https://platform.openai.com/docs/api-reference/responses-streaming) ; [https://developers.openai.com/api/docs/guides/streaming-responses](https://developers.openai.com/api/docs/guides/streaming-responses) ; [https://til.simonwillison.net/llms/streaming-llm-apis](https://til.simonwillison.net/llms/streaming-llm-apis)) [Better Programming + 2](https://betterprogramming.pub/openai-sse-sever-side-events-streaming-api-733b8ec32897)

**Anthropic.** Set `"stream": true`. Stream emits named events `message_start`, `content_block_start`, `content_block_delta` (with `text_delta`, `input_json_delta` for tool-call streaming, `signature_delta`, `thinking_delta`), `content_block_stop`, `message_delta`, `message_stop`, plus periodic `ping` events. `error` events (`overloaded_error`, etc.) can appear mid-stream. Tool inputs are streamed as `partial_json` chunks the client must concatenate. ([https://docs.anthropic.com/en/api/messages-streaming](https://docs.anthropic.com/en/api/messages-streaming)) [Claude API Docs + 3](https://platform.claude.com/docs/en/build-with-claude/streaming)

**Google Gemini.** Streams via SSE; the Vercel AI SDK shows it operating identically to OpenAI/Anthropic from the client's perspective. ([https://vercel.com/blog/ai-sdk-5](https://vercel.com/blog/ai-sdk-5))

**Cloudflare Workers AI.** Accepts `stream: true`; switches `Content-Type` to `text/event-stream`; returns chunks plus a final `data: [DONE]`. AI Gateway buffers the stream so it survives client disconnects mid-inference — an interesting reliability play unique to the gateway pattern. ([https://blog.cloudflare.com/workers-ai-streaming/](https://blog.cloudflare.com/workers-ai-streaming/) ; [https://blog.cloudflare.com/ai-platform/](https://blog.cloudflare.com/ai-platform/)) [Cloudflare](https://blog.cloudflare.com/workers-ai-streaming/)

---

## 5. Real-world deployment

### 5.1 Browser implementations

SSE is supported in all current major browsers: Firefox 6+, Chrome 6+, Safari 5+, Opera 11.5+, Edge 79+ (Chromium era), Brave. Safari iOS 5+, Firefox Android 45+. **No Internet Explorer support, ever** — that is the only meaningful gap, and IE is dead. ([https://en.wikipedia.org/wiki/Server-sent_events](https://en.wikipedia.org/wiki/Server-sent_events) ; [https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [Wikipedia + 2](https://en.wikipedia.org/wiki/Server-sent_events)

### 5.2 Server libraries (current as of 2026)

- **Node.js** — Express and Fastify support manual SSE via `res.write()`; `eventsource` (npm, 4.1.0) for clients in Node. Vercel AI SDK uses SSE as default transport. ([https://snyk.io/vuln/npm:eventsource](https://snyk.io/vuln/npm:eventsource) ; [https://vercel.com/blog/ai-sdk-5](https://vercel.com/blog/ai-sdk-5))
- **Python** — `sse-starlette` (FastAPI/Starlette, full-spec implementation, multi-loop, graceful shutdown), Django's `StreamingHttpResponse`, Django Channels. ([https://github.com/sysid/sse-starlette](https://github.com/sysid/sse-starlette)) [GitHub](https://github.com/sysid/sse-starlette)
- **Go** — `net/http` + `http.Flusher`, gin's `c.SSEvent()`. ([https://github.com/gin-gonic/gin/issues/1589](https://github.com/gin-gonic/gin/issues/1589))
- **Java/Spring** — `SseEmitter` in Spring MVC; Spring AI MCP's `spring-ai-starter-mcp-server-streamable-webmvc` for MCP servers. ([https://docs.spring.io/spring-ai/reference/api/mcp/mcp-streamable-http-server-boot-starter-docs.html](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-streamable-http-server-boot-starter-docs.html)) [Spring](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-streamable-http-server-boot-starter-docs.html)
- **Ruby** — `ActionController::Live` in Rails.
- **Rust** — `axum`'s `Sse` extractor; `tower-http`'s SSE middleware.
- **PHP** — Symfony's `StreamedResponse` + `flush()`; Mercure as the production-grade hub.
- **Elixir** — `hermes_mcp` (Hermes.Server.Transport.SSE deprecated, StreamableHTTP recommended). ([https://hexdocs.pm/hermes_mcp/Hermes.Server.Transport.SSE.html](https://hexdocs.pm/hermes_mcp/Hermes.Server.Transport.SSE.html)) [HexDocs](https://hexdocs.pm/hermes_mcp/Hermes.Server.Transport.SSE.html)

### 5.3 Production users and patterns

- **OpenAI / Anthropic / Google Gemini** — every major LLM provider uses SSE for streaming completions, exactly because it ports trivially to every cloud, every CDN, and every reverse proxy.
- **Cloudflare Workers AI** — first-party SSE streaming for its own model catalog, including Llama-2 and Kimi K2.5; AI Gateway stream buffering across disconnects. ([https://blog.cloudflare.com/workers-ai-streaming/](https://blog.cloudflare.com/workers-ai-streaming/) ; [https://blog.cloudflare.com/ai-platform/](https://blog.cloudflare.com/ai-platform/))
- **Mercure** — used in Symfony shops for live notifications, dashboards, and AI streaming (Dunglas explicitly markets Mercure for "streaming LLM tokens, agent steps, or any other server-driven update"). ([https://mercure.rocks/](https://mercure.rocks/)) [Mercure](https://mercure.rocks/)
- **Atlassian Rovo, Spring AI, Apollo Server, GraphOS Router, Cloudflare Agents SDK, LangChain Agent Server, Claude Code, ChatGPT Desktop, every major MCP host** — all carry SSE in some form, either as legacy MCP transport, as Streamable HTTP's response mode, or as the wire format of an underlying LLM call. ([https://blog.cloudflare.com/streamable-http-mcp-servers-python/](https://blog.cloudflare.com/streamable-http-mcp-servers-python/) ; [https://docs.langchain.com/langsmith/server-a2a](https://docs.langchain.com/langsmith/server-a2a))
- **Cloudflare's own internal AI engineering platform** routes ~688k requests/day, ~10.6B tokens/day through AI Gateway, much of it as streaming SSE. ([https://blog.cloudflare.com/internal-ai-engineering-stack/](https://blog.cloudflare.com/internal-ai-engineering-stack/))

Note: Older blog posts cite Twitter/X's "streaming timeline" as a flagship SSE deployment; we did not find a current public confirmation that this remains in production after the 2022–2024 changes at X, so treat that historical claim as `[needs source]` for a present-tense statement.

### 5.4 Performance characteristics

Per-connection memory is dominated by your application logic (subscriber state) plus a per-socket TCP buffer (~16–64KB). On modern hardware a single Node/Go/Rust server holds tens of thousands of idle SSE connections trivially; Cloudflare's docs note their Workers platform has "no effective limit on SSE response duration." ([https://developers.cloudflare.com/agents/api-reference/http-sse/](https://developers.cloudflare.com/agents/api-reference/http-sse/)) Heartbeat: 15s `: ping` is the de facto interval (defeats most idle-timeout proxies). Reconnect storm mitigation: exponential backoff (start 1s, cap 30–60s) is the universal pattern; the WHATWG spec explicitly tells user agents to apply backoff after a failed retry. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)) [HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html)

---

## 6. Failure modes and famous incidents

### 6.1 Named CVEs

- **CVE-2022-1650** (CVSS 9.3, Snyk; 6.5 in NVD) — *Information exposure in `eventsource`* (Node.js). The library failed to strip sensitive HTTP headers (cookies, `Authorization`) when following redirects to a different origin; a malicious server could harvest credentials. Fixed in 1.1.1 / 2.0.2. Picked up by webpack-dev-server, sockjs-client, and many Angular dev stacks. Tracked downstream in Ubuntu USN-6082-1 and the Debian security tracker. ([https://security.snyk.io/vuln/SNYK-JS-EVENTSOURCE-2823375](https://security.snyk.io/vuln/SNYK-JS-EVENTSOURCE-2823375) ; [https://ubuntu.com/security/notices/USN-6082-1](https://ubuntu.com/security/notices/USN-6082-1) ; [https://www.sentinelone.com/vulnerability-database/cve-2022-1650/](https://www.sentinelone.com/vulnerability-database/cve-2022-1650/)) [Vulert](https://vulert.com/vuln-db/CVE-2022-1650)
- **NestJS SSE Stream Injection** (DailyCVE, April 2026) — `SseStream._transform()` in `@nestjs/core` (versions <11.1.18) interpolated user-controlled `message.type` and `message.id` directly into the SSE wire format without sanitising `\r`/`\n`. Three attack primitives: event spoofing (forge an `event:` type to trigger a different `addEventListener` callback), data injection (inject `data:` lines that may then be rendered as HTML by the client), reconnection-state corruption (forge `id:` to make `Last-Event-ID` skip messages on reconnect). This is a generic SSE-server design hazard: **never echo untrusted strings into header fields without stripping CR/LF.** ([https://dailycve.com/nestjs-server-sent-events-injection-cve-unknown-medium/](https://dailycve.com/nestjs-server-sent-events-injection-cve-unknown-medium/))
- **CVE-2025-49596** — MCP Inspector's local web UI bound to `0.0.0.0:6277` and exposed `/sse` with no authentication and no Origin checks. Any malicious website could connect via the user's browser ("drive-by localhost breach") and trigger arbitrary tool calls. Docker's MCP Gateway response: prefer stdio. The 2025-03-26 spec response: mandatory `Origin` validation with HTTP 403 on mismatch, and mandatory cryptographically secure session IDs. ([https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/](https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/) ; [https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)) [Docker](https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/)[Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25/changelog)
- **CVE-2025-6515** — Prompt-hijacking via predictable session IDs in MCP servers using HTTP+SSE; an attacker who guessed or sniffed a session ID could submit malicious requests that flowed back to the legitimate client. The 2025-03-26 Streamable HTTP spec mandate of cryptographically secure session IDs is the structural fix. ([https://jfrog.com/blog/mcp-prompt-hijacking-vulnerability/](https://jfrog.com/blog/mcp-prompt-hijacking-vulnerability/)) [JFrog](https://jfrog.com/blog/mcp-prompt-hijacking-vulnerability/)
- **CVE-2025-6514** (CVSS 9.6) — RCE in `mcp-remote` <0.1.16 from a malformed server response. Any agent using `mcp-remote` to bridge stdio clients to a remote SSE/Streamable-HTTP server was vulnerable. ([https://langsight.dev/blog/owasp-mcp-top-10-guide/](https://langsight.dev/blog/owasp-mcp-top-10-guide/))
- **CVE-2025-56406** — RCE via the SSE service in `mcp-neo4j` 0.3.0 due to the spec not requiring authentication; NeighborJack-style local-network exploitation when the server bound to `0.0.0.0`. ([https://www.sentinelone.com/vulnerability-database/cve-2025-56406/](https://www.sentinelone.com/vulnerability-database/cve-2025-56406/)) [SentinelOne](https://www.sentinelone.com/vulnerability-database/cve-2025-56406/)[Datadog](https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/)
- **CVE-2025-52882** — WebSocket auth bypass in Claude Code IDE extensions (related class of bug; not SSE per se but shows the pattern of localhost-bound MCP-adjacent services being accessible to drive-by web pages). ([https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/](https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/)) [Datadog](https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/)

### 6.2 Famous outages and operational war stories

- **OpenAI 11 December 2024**, 3:16pm–7:38pm PST: a new telemetry deployment overwhelmed the Kubernetes control plane fleet-wide. ChatGPT, Sora, and the API were down or degraded for 4+ hours, including streaming endpoints. ([https://status.openai.com/incidents/01JMYB483C404VMPCW726E8MET](https://status.openai.com/incidents/01JMYB483C404VMPCW726E8MET)) [OpenAI](https://status.openai.com/incidents/01JMYB483C404VMPCW726E8MET)
- **OpenAI 26 December 2024**: 90%+ error rates on ChatGPT, Sora, and most APIs (DALL-E, agents, realtime speech, batch — the text completions API was unaffected). Root cause: cloud-provider data-center power failure; OpenAI's databases were globally replicated but region-wide failover required manual intervention from the cloud provider, elongating recovery. ([https://status.openai.com/incidents/01JMYB44RFAHDFT1HWDPD0M2N5](https://status.openai.com/incidents/01JMYB44RFAHDFT1HWDPD0M2N5))
- **OpenAI ChatGPT/API outage**: routing-layer nodes hit memory limits (a `responseBuffer` allocated in a loop rather than reused) and failed readiness checks; with insufficient capacity the service couldn't recover until traffic was throttled and the buffer reuse fix deployed. SSE-streaming endpoints were primary victims because they kept connections (and buffers) alive. ([https://status.openai.com/incidents/01JMYB63BJ47J3SXV6KSCT4D2A](https://status.openai.com/incidents/01JMYB63BJ47J3SXV6KSCT4D2A))
- **OpenAI ChatGPT 10 June 2025** ~15-hour global outage; **18 November 2025** Cloudflare outage cascaded through AI services. ([https://www.storyboard18.com/how-it-works/biggest-ai-outages-since-2024-chatgpt-claude-and-cloudflare-disruptions-that-shook-the-industry-91169.htm](https://www.storyboard18.com/how-it-works/biggest-ai-outages-since-2024-chatgpt-claude-and-cloudflare-disruptions-that-shook-the-industry-91169.htm))
- **The "stream-cuts-off-mid-response" reports** that pepper the OpenAI developer forum (especially around the Assistants API in 2025) are typically an idle-timeout-or-buffering issue at an intermediary, not in the model. ([https://community.openai.com/t/stream-interruptions-occurring-during-assistants-api-responses/1367555](https://community.openai.com/t/stream-interruptions-occurring-during-assistants-api-responses/1367555))
- **The eternal corporate-proxy strip.** Many enterprise web filters or "AI gateways" buffer or strip `text/event-stream` responses; Ably's engineering blog notes "we've seen this repeatedly — customers migrate from SSE to WebSockets after discovering their SSE connections work in development but buffer unpredictably in production environments. Our own SSE transport fallback encounters the same issue in restrictive networks." ([https://websocket.org/comparisons/sse/](https://websocket.org/comparisons/sse/)) [WebSocket](https://websocket.org/comparisons/sse/)

### 6.3 The classic production pitfalls

1. nginx/proxy buffering (forgot `X-Accel-Buffering: no` or `proxy_buffering off`).
2. gzip/`Content-Encoding` buffering until the gzip window fills.
3. AWS ALB / Azure App Service idle timeouts (60s–4min) — fix with periodic `: ping`.
4. Multiple SSE tabs to the same origin on HTTP/1.1 stalling the rest of the site (the 6-connection limit). Migrate to HTTP/2.
5. Reconnect storms — server returns 5xx, every client retries simultaneously, server never recovers. Fix with server-driven `retry:` value and exponential backoff (and 204 to tell clients to stop).
6. Forgetting to handle client disconnect on the server (the request stays "open" in your code while the TCP socket is dead) — leaks memory and goroutines/threads.
7. CR/LF injection into `event:` or `id:` (the NestJS class of bug).
8. Naïvely binding to `0.0.0.0` for an "internal" SSE service (the MCP Inspector class of bug).
(Compiled from [https://atlassc.net/2023/12/28/realtime-server-sent-events-held-back-by-nginx](https://atlassc.net/2023/12/28/realtime-server-sent-events-held-back-by-nginx) ; [https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app](https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app) ; [https://dailycve.com/nestjs-server-sent-events-injection-cve-unknown-medium/](https://dailycve.com/nestjs-server-sent-events-injection-cve-unknown-medium/) ; [https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/](https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/))

---

## 7. Fun facts and anecdotes (podcast-ready)

- **Naming.** "Server-Sent Events" was Hickson's literal description; Opera used the same name ("event streaming to web browsers") for their 2006 implementation. The HTML element was originally `<eventsource>`. ([https://dev.opera.com/blog/event-streaming-to-web-browsers/](https://dev.opera.com/blog/event-streaming-to-web-browsers/)) [Opera + 2](https://dev.opera.com/tags/server-sent-events/)
- **The room.** The WHATWG was *founded two days after* Mozilla and Opera lost the W3C Workshop vote on the future of web applications (8 for, 11 against). SSE is one of the youngest specs of the original WHATWG Web Applications 1.0 batch. ([https://thehistoryoftheweb.com/when-standards-divide/](https://thehistoryoftheweb.com/when-standards-divide/)) [Wikipedia](https://en.wikipedia.org/wiki/WHATWG)
- **Hixie's editor power.** Ian Hickson's grip on the editorship of HTML5/Web Apps 1.0 was so total that for years SSE could only be changed if Hickson agreed. The Wikipedia note that he once tried to replace `<time>` with a generic `<data>` and was reverted by community pushback hints at the cultural texture. ([https://en.wikipedia.org/wiki/WHATWG](https://en.wikipedia.org/wiki/WHATWG)) [Wikipedia](https://en.wikipedia.org/wiki/WHATWG)
- **The "we already shipped this and now we're un-shipping it" pattern.** Opera's 2012 retrospective is candid: the original SSE design was complex, the Opera 9 implementation incomplete, and Mozilla's Jonas Sicking essentially threw it out and rebuilt it as a JS object. ([https://dev.opera.com/blog/eventsource/](https://dev.opera.com/blog/eventsource/)) [Opera](https://dev.opera.com/blog/eventsource/)
- **The unusual placement.** SSE lived inside the HTML5 spec for years — not a separate document, not a separate IETF RFC. To this day, the official spec is *§9.2 of the HTML Living Standard*. There is no SSE RFC. The closest IETF-approved touchpoint is RFC 8895, "Application-Layer Traffic Optimization (ALTO) Incremental Updates Using SSE," which uses but does not specify SSE. ([https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) ; [https://datatracker.ietf.org/doc/html/rfc8895](https://datatracker.ietf.org/doc/html/rfc8895))
- **The Comet name.** Alex Russell coined "Comet" in 2006; it is not an acronym. He picked it because it was a *cleaner*, like Ajax. ([https://en.wikipedia.org/wiki/Comet_(programming)](https://en.wikipedia.org/wiki/Comet_(programming))) [Wikipedia](https://en.wikipedia.org/wiki/Comet_(programming))
- **`data: [DONE]\n\n`.** This sentinel is *not* in the SSE spec. OpenAI invented it for Chat Completions. Anthropic chose `event: message_stop` instead. Both have been copied by hundreds of derivative APIs. ([https://til.simonwillison.net/llms/streaming-llm-apis](https://til.simonwillison.net/llms/streaming-llm-apis) ; [https://docs.anthropic.com/en/api/messages-streaming](https://docs.anthropic.com/en/api/messages-streaming))
- **MCP's Thanksgiving origin.** The Latent Space "One Year of MCP" episode (Nov 2025) reveals the spec was hammered out in the days around US Thanksgiving 2024, with the first MCP IDE implementation written *by the MCP creators themselves* in the Zed editor a month and a half before public release. ([https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs](https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs) ; [https://www.latent.space/p/mcp](https://www.latent.space/p/mcp)) [Substack](https://www.latent.space/p/mcp)
- **SSE's "97 million downloads in 16 months" moment is actually MCP's.** MCP crossed 97 million monthly SDK downloads by March 2026, faster than Kubernetes did at comparable maturity. SSE rides shotgun underneath. ([https://beingguru.com/anthropic-mcp-hits-97-million-installs/](https://beingguru.com/anthropic-mcp-hits-97-million-installs/)) [Being Guru](https://beingguru.com/anthropic-mcp-hits-97-million-installs/)
- **The connection-limit bug numbers.** Chromium issue 275955 ("Limit of 6 concurrent EventSource connections is too low"). Firefox bug 906896 ("Increase number of permitted EventSource connections"). Both: WONTFIX. ([https://bugzilla.mozilla.org/show_bug.cgi?id=906896](https://bugzilla.mozilla.org/show_bug.cgi?id=906896))

---

## 8. Practical wisdom (a cheat sheet)

- **Headers your SSE server must send.**
  - `Content-Type: text/event-stream` (mandatory — browser otherwise rejects the stream) [JavaScript.info](https://javascript.info/server-sent-events)
    - `Cache-Control: no-cache, no-transform`
    - `Connection: keep-alive` (HTTP/1.1)
    - `X-Accel-Buffering: no` (nginx; widely respected)
- **Heartbeat.** Send `: keep-alive\n\n` every 15 seconds. Picks the right balance against AWS ALB (60s default) and Azure (4min default). ([https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app](https://learn.microsoft.com/en-au/answers/questions/5573038/issues-with-sse-server-side-events-on-azure-app)) [portalZINE NMN](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/)
- **Reconnection.** Set `retry: 3000` (or whatever you want in ms) at the start of the stream. Honour `Last-Event-ID` on reconnect. On overload return HTTP 503 with `Retry-After`; on permanent disable return HTTP 204 (the client stops reconnecting, per the spec). [JavaScript.info](https://javascript.info/server-sent-events)
- **Choose HTTP/2 or HTTP/3.** Eliminates the 6-connection-per-origin trap — almost always worth it for SSE-heavy apps.
- **gzip pitfall.** Disable compression for `text/event-stream`, or ensure your stack flushes the gzip stream eagerly. Cache-Control `no-transform` is advisory only.
- **Monitoring.** Track: (1) active SSE connections, (2) reconnect rate per 5 minutes, (3) message lag p50/p99 (server-side timestamp vs client-ack timestamp), (4) heartbeat round-trip, (5) bytes/event. A spike in reconnect rate is your earliest warning of an intermediary stripping or buffering streams.
- **Debugging moves.**
  - `curl -N -H 'Accept: text/event-stream' https://...` (the `-N` is critical — disables curl's output buffering).
    - Browser DevTools → Network → click the SSE request → "EventStream" tab. Chrome/Edge/Firefox all expose parsed events here.
    - [https://sse.dev/](https://sse.dev/) — a hosted playground that emits an event every 2 seconds; great for poking from any client.
- **Auth.** `EventSource` cannot set `Authorization`. Options: (a) cookie-based session with `withCredentials: true` (and matching CORS), (b) signed token in query string (logs!), (c) use `fetch` + `ReadableStream` (Microsoft's `fetch-event-source` helper). MCP's solution in 2025-11-25 is OAuth client-credentials + Mcp-Session-Id headers via Streamable HTTP, an explicit acknowledgement that EventSource's header limitation is unfixable in the browser today. [Amitavroy](https://amitavroy.com/articles/2025-04-01-server-sent-events-what-are-they-why-you-should-use-them)
- **Common misconfigurations.** Trailing slash on a CDN cache key turning a stream into a cached 200; a load balancer with body-buffer-size 1MB silently buffering the first MB of stream output; Application Gateway with a default 4-minute idle timeout cutting streams that go quiet during long LLM "thinking" pauses.

---

## 9. Learning resources (current as of 2026-05-05)

Specs and primary sources

- **WHATWG HTML Living Standard, §9.2 Server-sent events.** [https://html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html) — *intermediate, last updated 2 May 2026.* The canonical specification. Read the dispatch algorithm and the example streams.
- **MDN, "Server-sent events" (concept page).** [https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) — *intro, last touched 2025.*
- **MDN, "Using server-sent events".** [https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — *intro/intermediate; example PHP server, JS client, parser walk-through.*
- **MDN, `EventSource`.** [https://developer.mozilla.org/en-US/docs/Web/API/EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) — *intro, last modified Mar 13 2025.*
- **W3C Recommendation (Feb 3, 2015).** [https://www.w3.org/TR/eventsource/](https://www.w3.org/TR/eventsource/) — historical; defer to WHATWG for current state.
- **W3C Last Call WD (Dec 22, 2009).** [https://www.w3.org/TR/2009/WD-eventsource-20091222/](https://www.w3.org/TR/2009/WD-eventsource-20091222/) — *historical, the earliest reasonably stable draft.*

Books

- **Ilya Grigorik, *High Performance Browser Networking* (O'Reilly).** Chapter 16, "Server-Sent Events (SSE)." Free online at **[https://hpbn.co/server-sent-events-sse/](https://hpbn.co/server-sent-events-sse/)** — *intermediate; last formal print edition 2013, but the chapter remains the best-written conceptual treatment of SSE in book form.* Chapters 9–12 cover HTTP/1.1, HTTP/2, and TLS; Chapter 17 covers WebSocket. ([https://hpbn.co/](https://hpbn.co/))

Engineering blog posts (2024–2026)

- **Cloudflare, "Bringing streamable HTTP transport and Python language support to MCP servers."** [https://blog.cloudflare.com/streamable-http-mcp-servers-python/](https://blog.cloudflare.com/streamable-http-mcp-servers-python/) — *advanced, 2025; the deep-dive on MCP's SSE→Streamable HTTP shift from a hyperscaler perspective.*
- **Cloudflare, "Streaming and longer context lengths for LLMs on Workers AI."** [https://blog.cloudflare.com/workers-ai-streaming/](https://blog.cloudflare.com/workers-ai-streaming/) — *intermediate, 2024.*
- **Cloudflare Agents docs, HTTP and SSE.** [https://developers.cloudflare.com/agents/api-reference/http-sse/](https://developers.cloudflare.com/agents/api-reference/http-sse/) — *intro, current 2026.*
- **Auth0, "Why MCP's Move Away from Server-Sent Events Simplifies Security."** [https://auth0.com/blog/mcp-streamable-http/](https://auth0.com/blog/mcp-streamable-http/) — *intermediate, 2025.*
- **Mercure docs.** [https://mercure.rocks/](https://mercure.rocks/) and [https://mercure.rocks/spec](https://mercure.rocks/spec) — *intermediate, 2024–2025; the cleanest writeup of how to do production pub/sub-on-SSE.*
- **Get Stream, "WebSocket vs Server-Sent Events – Key Differences."** [https://getstream.io/blog/websocket-sse/](https://getstream.io/blog/websocket-sse/) — *intermediate, 2026, includes the AI-era reframing.*
- **WebSocket.org, "WebSocket vs SSE."** [https://websocket.org/comparisons/sse/](https://websocket.org/comparisons/sse/) — *intro/intermediate, 2026, covers the durable-sessions / Vercel AI SDK transport-pluggability story.*
- **portalZINE, "SSE's Glorious Comeback: Why 2025 is the Year of Server-Sent Events."** [https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/](https://portalzine.de/sses-glorious-comeback-why-2025-is-the-year-of-server-sent-events/) — *intro, 2025.*
- **JavaScript.info, "Server Sent Events."** [https://javascript.info/server-sent-events](https://javascript.info/server-sent-events) — *intro, 2024-2025; clearer JS-side worked example than MDN.*
- **Ajit Singh, "The Complete Guide to Server-Sent Events (SSE)."** [https://singhajit.com/server-sent-events-explained/](https://singhajit.com/server-sent-events-explained/) — *intro/intermediate, 2025.*

Hands-on / playgrounds / demos

- **sse.dev playground.** [https://sse.dev/](https://sse.dev/) — *intro; emits a JSON event every 2s; supports `?interval=` and `?jsonobj=` query params; great for debugging clients.*
- **htmx SSE extension.** [https://htmx.org/extensions/sse/](https://htmx.org/extensions/sse/) (htmx 2.x) and [https://four.htmx.org/docs/extensions/sse](https://four.htmx.org/docs/extensions/sse) (htmx 4) — *intermediate, current 2025–2026.*
- **graphql-sse.** [https://github.com/enisdenjo/graphql-sse](https://github.com/enisdenjo/graphql-sse) — *advanced, 2.6.0, late 2025.*
- **sse-starlette.** [https://github.com/sysid/sse-starlette](https://github.com/sysid/sse-starlette) — *intermediate, current 2026.*

LLM / MCP-specific

- **MCP Spec, "Transports" (current revision 2025-11-25).** [https://modelcontextprotocol.io/specification/2025-11-25/changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog) — *advanced, current.*
- **MCP Spec, "Transports" (2025-03-26).** [https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports) — *advanced; the original Streamable HTTP definition.*
- **OpenAI Responses API streaming docs.** [https://platform.openai.com/docs/api-reference/responses-streaming](https://platform.openai.com/docs/api-reference/responses-streaming) — *intermediate, current 2026; full event-type catalog.*
- **Anthropic Messages streaming docs.** [https://docs.anthropic.com/en/api/messages-streaming](https://docs.anthropic.com/en/api/messages-streaming) — *intermediate, current 2026; example wire-format trace.*
- **Simon Willison, "How streaming LLM APIs work."** [https://til.simonwillison.net/llms/streaming-llm-apis](https://til.simonwillison.net/llms/streaming-llm-apis) — *intermediate, 2024 with later updates; the best annotated `curl` walkthrough.*
- **Panaversity AI Agent Factory, "Server-Sent Events (SSE) Deep Dive."** [https://agentfactory.panaversity.org/docs/TypeScript-Language-Realtime-Interaction/async-patterns-streaming/server-sent-events-deep-dive](https://agentfactory.panaversity.org/docs/TypeScript-Language-Realtime-Interaction/async-patterns-streaming/server-sent-events-deep-dive) — *intermediate; aligns SSE parsing with Anthropic and OpenAI specifics.*

Podcasts and talks

- **Latent Space, "The Creators of Model Context Protocol"** (April 2025), with David Soria Parra and Justin Spahr-Summers. [https://www.latent.space/p/mcp](https://www.latent.space/p/mcp) — direct origin story including transport debate.
- **Latent Space, "One Year of MCP — with David Soria Parra and AAIF leads from OpenAI, Goose, Linux Foundation"** (Nov 2025). [https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs](https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs) — covers the SSE→Streamable HTTP transition retrospectively and the AAIF donation.
- **Cloudflare blog "The AI engineering stack we built internally — on the platform we ship"** (2026). [https://blog.cloudflare.com/internal-ai-engineering-stack/](https://blog.cloudflare.com/internal-ai-engineering-stack/) — practical case study of a hyperscaler's SSE-heavy AI infrastructure.

University / free course material

I did not find a current, free university course module specifically on SSE during this research pass (most academic networking courses cover HTTP/2 and WebSocket but treat SSE in passing). `[needs source]` for any such offering.

---

## 10. Where things are heading (2025–2026 frontier)

**1. SSE is now infrastructure for agentic AI.** Both MCP and A2A — the two major open agent protocols of 2024–2026 — chose SSE as their streaming response mode. SSE is no longer "the simpler alternative to WebSocket"; it is the de facto wire format of agent communication. The 2025-11-25 MCP release further entrenches this with SEP-1699's clarifications around polling-style SSE streams and resumption. ([https://modelcontextprotocol.io/specification/2025-11-25/changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog) ; [https://github.com/a2aproject/A2A](https://github.com/a2aproject/A2A))

**2. Streamable HTTP is the right idea, and other protocols are copying it.** The "POST that may either return JSON or upgrade to text/event-stream" pattern is showing up well beyond MCP. GraphQL-SSE's "single connection mode" is the same idea predating it. Vercel AI SDK 5's stream protocol is essentially this with extra event types. Expect this hybrid pattern to become the default REST-meets-streaming idiom by end of 2026.

**3. The bidirectional gap drives some workloads back to WebSocket.** As LLM agent interactions move from "send prompt, stream response" toward "interrupt, approve tool, steer mid-generation," SSE's one-way nature becomes an actual constraint. The Vercel AI SDK's transport interface, "Durable Sessions" infrastructure pattern, and the OpenAI Responses API's WebSocket mode (`previous_response_id`-based persistent transport) all point to a hybrid future where SSE handles the easy 80% and WebSocket handles the complex 20%. ([https://websocket.org/guides/websockets-and-ai/](https://websocket.org/guides/websockets-and-ai/) ; [https://vercel.com/blog/ai-sdk-5](https://vercel.com/blog/ai-sdk-5))

**4. WebTransport will not obsolete SSE in 2026.** As of early 2026, WebTransport (HTTP/3 + QUIC) ships in Chrome and Edge, is partial in Firefox, and absent in Safari. Get Stream's blunt 2026 assessment: "give it another two or three years. For now, the choice is between WebSocket and SSE." ([https://getstream.io/blog/future-of-websockets/](https://getstream.io/blog/future-of-websockets/) → [https://websocket.org/guides/future-of-websockets/](https://websocket.org/guides/future-of-websockets/)) Even if WebTransport ships everywhere, it solves a different problem (multiplexed bidirectional streams + unreliable datagrams, mostly for media and games). For the "send prompt, stream tokens" pattern WebTransport offers no advantage over SSE.

**5. HTTP/2 server push deprecation does *not* affect SSE.** Server push (RFC 7540) and SSE are unrelated. Chrome 106 (Oct 2022) disabled server push by default and the feature is effectively dead. SSE is unaffected; in fact, HTTP/2 multiplexing is what made SSE practical at scale. ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push))

**6. Active IETF/WHATWG work.** The HTML Living Standard's SSE section is in maintenance — issue whatwg/html#7363 still tracks tightening the value space of `Last-Event-ID` (it must be UTF-8 and not contain NULL/CR/LF). There is no active push to put SSE into an IETF RFC; the WHATWG model means the HTML standard remains canonical. RFC 8895 (ALTO over SSE) remains the most prominent IETF *use* of SSE.

**7. The eternal `EventSource`-can't-set-headers problem.** A long-running open issue on the WHATWG HTML repo seeks to fix this; multiple commenters note movement in late 2025 / early 2026 toward a working browser implementation that lets `EventSource` accept additional fetch options (custom headers, POST). If this lands, Microsoft's `fetch-event-source` and the Vercel/Anthropic/OpenAI workarounds finally collapse into the standard. ([https://getstream.io/blog/websocket-sse/](https://getstream.io/blog/websocket-sse/) — paraphrased)

**8. SSE-driven security work.** The MCP security incidents of 2025 (CVE-2025-49596, CVE-2025-6515, CVE-2025-6514, CVE-2025-56406) each pushed back into the spec: mandatory `Origin` validation, cryptographically secure session IDs, OAuth client-credentials, MCP Bundles, registry-style server identity. Expect continued tightening in the 2026 spec cycles. ([https://langsight.dev/blog/owasp-mcp-top-10-guide/](https://langsight.dev/blog/owasp-mcp-top-10-guide/) ; [https://workos.com/blog/mcp-2025-11-25-spec-update](https://workos.com/blog/mcp-2025-11-25-spec-update))

---

## 11. Hooks for the article, infographic, and podcast

### A 60-second narrated hook (podcast cold-open style)

> "On June 4th, 2004 — two days after losing a vote at a W3C workshop — Ian Hickson, a British engineer at Opera, started a mailing list. He was tired of waiting for the W3C to fix HTML for real applications. Inside the messy spec he and his co-conspirators wrote — the document that eventually became HTML5 — was a tiny section, almost an afterthought, called Server-Sent Events. Just a way for a server to push lines of text to a browser over a normal HTTP connection. For the next eighteen years it lost. WebSocket arrived in 2011 with two-way real-time communication and ate everything. Big tech built dashboards, chat, multiplayer, all on WebSocket. SSE became the answer to a quiz question. Then ChatGPT happened. And Anthropic's Claude. And Google's Gemini. And every one of them — every single one — chose SSE for streaming tokens. Suddenly, the protocol nobody chose became the protocol nobody thought to question. By November 2024, when Anthropic launched MCP — the protocol that lets AI agents talk to your data — they used SSE. By March 2025, they'd already changed their minds, replaced it with something called Streamable HTTP, and renamed SSE from a transport to *just one possible response mode*. The decade-old hidden footnote of HTML5 had become the wire format of artificial intelligence. This episode: how it happened, what changed, and how to actually use it."

### A striking statistic with source

> **MCP — built on top of SSE — crossed 97 million monthly SDK downloads by March 2026, the fastest adoption curve for any AI infrastructure standard ever measured. Kubernetes took nearly four years to reach comparable scale; MCP did it in 16 months.** ([https://beingguru.com/anthropic-mcp-hits-97-million-installs/](https://beingguru.com/anthropic-mcp-hits-97-million-installs/))

### A "pause and think" moment

> Stop and look at the shape of things. The protocol that wins isn't the one with the best technical properties — WebSocket beats SSE on bidirectionality, binary framing, and lower header overhead. The protocol that wins is the one that **traverses every existing piece of infrastructure unchanged**. SSE is just an HTTP response. It works through every CDN, every proxy, every WAF, every corporate firewall, every load balancer, every CI/CD platform, every serverless cold-start path, every Cloudflare-Access-style zero-trust gateway. WebSocket asks you to upgrade the connection; SSE asks you to read a normal response a little more slowly than usual. When the stakes were "build a chat app," that mattered less. When the stakes became "let an AI agent integrate with every piece of enterprise software through every kind of network," it mattered more than anything else. (Synthesis of: [https://websocket.org/comparisons/sse/](https://websocket.org/comparisons/sse/) ; [https://blog.cloudflare.com/streamable-http-mcp-servers-python/](https://blog.cloudflare.com/streamable-http-mcp-servers-python/) ; [https://auth0.com/blog/mcp-streamable-http/](https://auth0.com/blog/mcp-streamable-http/))

### The failure-story arc, retold

> July 2025. A junior engineer at a Series-B startup ships an MCP-Inspector setup to her staging environment to demo to her team. She binds it to `0.0.0.0:6277` because that's what every tutorial showed. She doesn't think much about it — it's a dev tool, on a dev network. Three weeks later, a security researcher publishes CVE-2025-49596: any malicious website, in any tab, in any browser, on any computer that has MCP Inspector running, can connect to that local SSE endpoint and trigger arbitrary tool calls. No authentication. No `Origin` check. No CORS guard. The drive-by-localhost-breach, the security blogs called it. Within days the MCP spec demanded mandatory `Origin` validation and cryptographically secure session IDs. Within weeks, Docker shipped MCP Gateway with stdio-only transport as a structural fix. Streamable HTTP — the new transport — wasn't just an architectural cleanup. It was a security fix. The price of being the protocol that traverses every network without fuss is that you accidentally traverse every network without fuss. ([https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/](https://www.docker.com/blog/mpc-horror-stories-cve-2025-49596-local-host-breach/) ; [https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports))

---

## Caveats and uncertainties

- I did not find an authoritative current confirmation that **Twitter/X's "streaming timeline" is still in production SSE**; older sources cite it but the platform has changed significantly since 2022. Treat any present-tense claim about Twitter/X using SSE as `[needs source]`.
- **Concrete published memory-per-connection numbers** for major SSE deployments (LinkedIn, Mapbox, etc.) were not surfaced in this research; the LinkedIn engineering posts found focus on Apache Beam stream-processing, not browser-facing SSE. Cite the per-connection numbers in §5.4 as architectural rules of thumb, not measurements.
- **MCP's SSE "deprecation" is partial.** "SSE is deprecated in MCP" is a meaningful claim only for the *2024-11-05 dual-endpoint transport*. The 2025-03-26 Streamable HTTP spec explicitly *uses* `text/event-stream` as a response mode. Several blog posts elide this distinction.
- **NestJS SSE injection CVE** (DailyCVE, April 2026) is described in a third-party CVE aggregator; the underlying NVD entry was not surfaced in this pass. Treat the CVE class (CR/LF injection in SSE field interpolation) as well-established but the specific CVE ID as `[needs source]` for canonical NVD confirmation.
- **The "Last Updated 2 May 2026"** date for the WHATWG HTML standard reflects what was on the page when fetched for this report; the document is a Living Standard and updates daily.
- **All future-tense statements about WebTransport** (Safari adoption, browser implementations, replacement of SSE) are speculative even when sourced; treat as forecasts, not facts.
- **OpenAI / Anthropic streaming format details** are described from current public docs as of May 2026; both providers reserve the right to add new event types and have done so in the past.