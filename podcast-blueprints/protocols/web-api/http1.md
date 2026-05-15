---
id: http1
type: protocol
name: HyperText Transfer Protocol
abbreviation: HTTP/1.1
etymology: "[H]yper[T]ext [T]ransfer [P]rotocol — Tim Berners-Lee's 1989 CERN proposal called it 'HTTP' from the start; the 1.1 suffix arrived with persistent connections and the Host header in 1997"
category: web-api
year: 1997
rfc: RFC 9112
standards_body: IETF (httpbis WG)
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/ports-sockets
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/the-web-arrives
  - story-of-the-internet/the-ai-agent-layer
  - transport/tcp
  - web-api/http1
  - web-api/http2
  - web-api/http3
  - web-api/rest-and-graphql
  - web-api/websockets-and-sse
  - async-iot/coap
  - realtime-av/sip-and-sdp
  - realtime-av/hls-and-dash
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/books
related_protocols: [a2a, json-rpc, mcp, tcp, tls, http2, websockets, rest, soap, oauth2, ip, http3]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9112, 9110, 9111, 9113, 9114, 2068, 2616, 1945, 9651, 9577, 6648, 6455, 7725, 2324, 6749, 6750]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/HTTP_persistent_connection.svg/500px-HTTP_persistent_connection.svg.png
    caption: HTTP persistent connections (keep-alive) compared with non-persistent. HTTP/1.0 opened a fresh TCP connection for every request; HTTP/1.1 reuses the same connection across requests, saving the cost of repeated TCP handshakes.
    credit: Image — Wikimedia Commons / Public Domain
visual_cues:
  - "A side-by-side wire-format comparison: on the left, an HTTP/1.1 request as eight lines of US-ASCII (request line, Host, Accept, Authorization, Connection, blank line, body) with each CRLF rendered as a small grey arrow. On the right, the equivalent HTTP/2 binary frame with its 9-byte header annotated (Length 24-bit, Type 8-bit, Flags 8-bit, Stream ID 31-bit). Caption: 'The protocol you can read with cat. That readability is the entire reason every developer can debug an HTTP problem with curl.'"
  - "A timeline of the HTTP RFC lineage. RFC 1945 (1996, HTTP/1.0) → RFC 2068 (Jan 1997, first 1.1) → RFC 2616 (June 1999, the document that froze for 15 years) → RFC 7230–7235 (June 2014, the six-document split) → RFC 9110, 9111, 9112, 9113, 9114 (June 2022, the five-document set, all the same week). Below: '7 June 2022 — the day TCP stopped being assumed.'"
  - "Cloudflare's connection-reuse-ratio chart for one major customer: Y-axis 87% to 100%, two horizontal lines labelled 'NGINX (87.1%)' and 'Pingora (99.92%)'. A footnote reads '434 years of TCP/TLS handshake time saved per day, globally.'"
  - "James Kettle on a Black Hat stage in front of a slide reading 'HTTP/1.1 must die.' Below: 'CVE-2025-32094 (Akamai), CVE-2025-4366 (Cloudflare Pingora ingress), CVE-2025-43859, CVE-2025-55315 — over $200K in bug bounties in two weeks.'"
  - "An HTTP/2 Rapid Reset attack diagram (October 2023): one attacker, one HTTP/2 connection, an endless loop of HEADERS frames immediately followed by RST_STREAM frames. Three peak-RPS counters in the corner: Google 398M, Cloudflare 201M, AWS 155M — all carried by a botnet of just 22,000 machines. Caption: 'Most HTTP/2 deployments translate downstream into HTTP/1.1, which is why the abuse propagates.'"
  - "An HTTP/1.1 traffic-share donut chart for Q1 2026 Cloudflare-observed requests: HTTP/2 51%, HTTP/1.1 28%, HTTP/3 21%. A side label points at the HTTP/1.1 wedge: 'CLI tools, server-to-server REST, internal microservices, bot traffic, debugging.'"
---

# HTTP/1.1 — HyperText Transfer Protocol

## In one breath

HTTP/1.1 is the text-based application protocol that built the web. Every browser, every REST API, every `curl` invocation, every webhook still speaks it; in Q1 2026 it carries roughly 28% of Cloudflare-observed requests, alongside 51% HTTP/2 and 21% HTTP/3. The current normative spec is RFC 9112 (June 2022, an Internet Standard), but the wire format you debug with netcat has not meaningfully changed since RFC 2068 in January 1997 — and that 28-year stability is both its greatest strength and, after James Kettle's 2025 desync research, its biggest unresolved security liability.

## The pitch (cold-open)

In January 1997, Roy Fielding, Jim Gettys, Jeffrey Mogul, Henrik Frystyk, and Tim Berners-Lee published RFC 2068 — HTTP/1.1 — and added three things: persistent connections by default, chunked transfer encoding, and a single mandatory header called `Host` that let one IP address serve thousands of websites. Almost three decades later, that protocol is still everywhere — every REST API, every curl script, every health-check ping, every static-site CDN. But in August 2025, James Kettle stood on a Black Hat stage and said, in three words: *HTTP/1.1 must die.* This is the episode about a protocol you can still read with your eyes — and why some of the smartest people in web security are now actively trying to retire it from the upstream hops of the internet.

## How it actually works

HTTP/1.1 is a request-response protocol over TCP. The client opens a TCP connection (port 80, or port 443 with TLS), writes a few lines of US-ASCII, and waits for the server to write back. The whole exchange happens in five phases the simulator walks through end-to-end.

**One — TCP handshake.** Before any HTTP byte moves, the browser sends a SYN to the server, the server replies with SYN-ACK, the browser ACKs back. That is one full round trip of latency built into every new connection. Add TLS and you pay another 1 RTT for TLS 1.3 (or 1–2 RTT for TLS 1.2, plus the certificate exchange) before HTTP gets a turn — which is why connection reuse matters so much, and why TCP and TLS both get their own episodes in this series.

**Two — the request goes out.** The browser writes a request line (`GET /index.html HTTP/1.1`), one or more header lines (`Host: example.com`, `User-Agent: curl/8.5.0`, `Accept: */*`), an empty line, and an optional body. CRLF (`\r\n`, the bytes `0x0D 0x0A`) terminates every line. Field names are case-insensitive ASCII tokens.

**Three — the server processes.** The server parses the request, routes it to a handler, may hit a database or a file, and assembles a response.

**Four — the response comes back.** The server writes a status line (`HTTP/1.1 200 OK`), response headers (`Content-Type`, `Content-Length`, `Cache-Control`, `ETag`), an empty line, and the body. Until that response finishes, no other request can use this connection — head-of-line blocking is the structural cost of the design.

**Five — keep-alive or close.** By default, the connection stays open for the next request. Either side can send `Connection: close` to tear it down, or the connection times out idle. Browsers historically opened six parallel TCP connections per origin to work around the serialised model — which is the entire reason HTTP/2 exists.

### Header at a glance

RFC 9110 reorganised headers into "control data, fields, content, and trailers." In practice, the headers an engineer meets every week fall into a handful of buckets:

- **Routing and framing.** `Host` is mandatory in 1.1 — RFC 9112 §3.2 says reject the request with 400 if it is missing or duplicated. `Content-Length` and `Transfer-Encoding: chunked` frame the body. `Connection`, `TE`, `Upgrade`, `Trailer`, and `Transfer-Encoding` are hop-by-hop and MUST NOT be forwarded by a proxy.
- **Content metadata.** `Content-Type`, `Content-Encoding` (`gzip`, `br`, `zstd`), `Content-Language`, `Content-Disposition`.
- **Negotiation.** `Accept`, `Accept-Encoding`, `Accept-Language` go on the request; `Vary` goes on the response and tells caches what mattered.
- **Auth.** `Authorization` and `WWW-Authenticate`. Today: `Bearer` tokens (RFC 6750, the foundation of OAuth 2) dominate. `Basic` is base64 of `user:pass` and is only safe over TLS. `Digest` is rarely seen. `PrivateToken` (RFC 9577, June 2024) is the newest entry — anonymous blind-signed tokens, already in production at Apple Private Access Tokens, Cloudflare's anti-CAPTCHA, and Kagi search.
- **Caching.** `Cache-Control` (`max-age`, `no-cache`, `no-store`, `immutable` from RFC 8246, `stale-while-revalidate` from RFC 5861), `ETag`, `If-None-Match`, `If-Modified-Since`, `Last-Modified`, `Age`. The `Warning` header is now obsolete per RFC 9111.
- **Range.** `Range`, `If-Range`, `Content-Range`, `Accept-Ranges` — the basis of resumable downloads and the attack surface of Apache's CVE-2011-3192.
- **Modern security.** `Strict-Transport-Security`, `Content-Security-Policy`, the `Cross-Origin-*` family.
- **The misspelling.** `Referer` — the typo Phillip Hallam-Baker put into the wire in March 1995 and that has been frozen ever since. Modern specs (`Referrer-Policy`, the DOM `referrer` property) use the correct spelling, which makes the mismatch worse rather than better.

### State machine in three sentences

HTTP/1.1 has no protocol-level state machine. Each request stands on its own; the server is not required to remember anything about previous requests on the same connection (cookies and sessions are bolted on top by the application). The only "state" HTTP/1.1 itself carries is per-connection: persistent or close, reading headers or reading body, possibly mid-chunk.

### Reliability, framing, and security mechanics

HTTP/1.1 itself has no checksum, no integrity field, no encryption — it leans entirely on TCP for in-order delivery and on TLS for confidentiality. What it owns is **framing**, and framing is where things get dangerous.

There are two ways to delimit a body. `Content-Length: <bytes>` says "exactly this many bytes follow." `Transfer-Encoding: chunked` says "the body is a sequence of `<hex-size>CRLF<bytes>CRLF`, terminated by `0CRLF`." RFC 9112 §6 is explicit: if a request has both, ignore `Content-Length` and trust `Transfer-Encoding`. Many parsers do not. That single ambiguity is the root of a class of attacks called **HTTP request smuggling**, which we will get to.

**Persistent connections** are the default since 1.1 — RFC 9112 §9. **Pipelining** is the spec-permitted feature where a client queues request *N+1* before response *N* arrives. Every major browser disabled or never enabled it, because a slow first response stalls all queued ones, buggy proxies desync the order, and the smuggling class of attacks thrives on it. The modern guidance is: do not enable HTTP/1.1 pipelining in production, ever. Use HTTP/2 or HTTP/3 multiplexing instead.

**Chunked transfer encoding** lets you stream a body whose length you do not know up front. The Wikipedia example, byte-for-byte, is `4\r\nWiki\r\n6\r\npedia \r\nE\r\nin \r\n\r\nchunks.\r\n0\r\n\r\n` — where `E` is hex 14, the length of `"in \r\n\r\nchunks."` Optional trailers can follow the terminating zero chunk.

**Content negotiation** uses quality values from 0.0 to 1.0: `Accept: text/html;q=1.0, application/xhtml+xml;q=0.9, */*;q=0.1`. The server picks one and signals the choice with `Content-Type` and friends; `Vary: Accept-Encoding, Accept-Language` tells downstream caches which request headers actually mattered.

**Caching** (RFC 9111) treats a response as fresh while `now < generation_time + max_age`. When stale, the cache validates with a conditional GET (`If-None-Match: <ETag>` or `If-Modified-Since`) and either gets back 304 (reuse the stored body) or 200 (replace).

**Upgrade** is the mechanism that lets HTTP/1.1 hand its TCP connection to another protocol on the same socket. WebSocket (RFC 6455) bootstraps this way: the client sends `Upgrade: websocket` plus a `Sec-WebSocket-Key`, the server replies with **101 Switching Protocols** and `Sec-WebSocket-Accept = base64(SHA1(client-key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))`. The cleartext HTTP/2 upgrade (`Upgrade: h2c`) was specced but barely used in the wild — HTTP/2 in production is `h2` over TLS with ALPN.

**CONNECT** (`CONNECT example.com:443 HTTP/1.1`) asks a forward proxy to open a raw TCP tunnel — the mechanism behind HTTPS through corporate proxies and behind the new MASQUE work for tunnelling UDP and IP over HTTP.

**Range requests** (`Range: bytes=0-499`) return 206 Partial Content with `Content-Range: bytes 0-499/2345`. Multiple ranges produce `multipart/byteranges`.

**Robustness principle, explicitly rejected.** RFC 9110 §2 and RFC 9112 §11 push back hard on Postel's "be conservative in what you do, be liberal in what you accept." Leniency in HTTP/1.1 framing is the root cause of nearly every request-smuggling bug. The modern specs say: parse strictly, reject ambiguity.

## Where it shows up in production

**Cloudflare's Pingora.** In February 2024 Cloudflare open-sourced Pingora, the Rust HTTP proxy that replaced its NGINX-based stack. By 2024 it was serving more than a trillion requests per day, with about 70% less memory and 60% less CPU than the legacy stack. Pingora-origin alone clears 35 million requests per second. The 2025 *trie-hard* optimisation removed 1.28% of CPU across the fleet just by speeding up internal-header stripping. The headline number is the connection-reuse one: switching one major customer's origin to Pingora raised the connection-reuse ratio from 87.1% to 99.92% — Cloudflare's blog calls that "434 years of handshake time saved per day, globally."

**Fastly's edge cloud** publicly states it processes 1.8 trillion HTTP requests daily. Cloudflare's network averages around 81 million requests per second and peaks at 129 million RPS. Akamai sits at the same order of magnitude. Igor Sysoev wrote NGINX in 2002 and left NGINX, Inc. in 2022 after twenty years; per Netcraft's December 2025 survey of 1.39 billion sites, NGINX still holds 24.6%, Cloudflare 13.5%, Apache httpd around 12.6%, OpenResty 6.83%, Microsoft IIS around 1.4%. NGINX overtook Apache for total sites in April 2019 and overtook Apache among the top-million busiest sites in early 2025. **Caddy** (memory-safe, automatic Let's Encrypt), **lighttpd**, **HAProxy**, **Envoy** (the data plane of every modern service mesh), and **LiteSpeed** round out the heavyweight list.

**Client libraries you actually ship.** libcurl (Daniel Stenberg, since 1998), Go's `net/http`, Python's `urllib3`/`requests` (Kenneth Reitz, 2011) and the modern HTTP/2-capable `httpx`, Node.js's built-in `http`/`https` and `undici`, Java's `java.net.http.HttpClient` (JDK 11+), Rust's `hyper` and `reqwest`, Square's `OkHttp` (Android-dominant), and .NET's `HttpClient`. The original CERN/W3C reference implementation, **libwww**, dates to 1992 and was the first test bed for HTTP semantics.

**Traffic share.** Cloudflare Radar's 2025 Year in Review puts HTTP/2 dominant globally (around 51% of human traffic), HTTP/3 at roughly 21% with 15+ countries above one-third (Georgia hit 38%), and HTTP/1.x stubbornly persistent around 28% — over-represented in bot traffic. Seven countries saw HTTP/3 below 10% in 2025 due to bot HTTP/1.x dominance: Hong Kong, Dominica, Singapore, Ireland, Iran, Seychelles, Gibraltar.

**APIs and CLI tools.** `curl`, `wget`, scripting clients, server-to-server REST traffic, internal microservice calls — many still default to HTTP/1.1 because the simplicity outweighs the multiplexing benefit. A single API call does not need binary framing or stream prioritisation.

**Privacy Pass in the wild.** RFC 9577's `Authorization: PrivateToken token=…` is shipping in production today: Apple's Private Access Tokens, Cloudflare's anti-CAPTCHA, Kagi search.

## Things that go wrong

**The original — Watchfire 2005.** Chaim Linhart, Amit Klein, Ronen Heled, and Steve Orrin published *HTTP Request Smuggling*. They showed that when a front-end and a back-end disagreed on whether to use `Content-Length` or `Transfer-Encoding`, an attacker could pour bytes into one request that the next stage would parse as the start of someone else's. The chapter on HTTP/1.1 in our book covers the long arc; the short version is that this class of bug has been known for twenty years and is still being found in 2026.

**Slowloris (Robert "RSnake" Hansen, 2009).** A single host opens many TCP connections and dribbles partial headers, exhausting Apache's per-connection thread pool. The mitigation was an event-loop server (NGINX), Apache's `mod_reqtimeout`, or reverse-proxy buffering. Slowloris is the canonical example of why mismatched timeouts between L4, L7, and origin produce zombie sockets.

**Apache Range Header DoS — CVE-2011-3192 (August 2011).** A `Range: bytes=0-,5-1,5-2,…` header with many overlapping ranges caused Apache 1.3 and 2.0/2.2 prior to 2.2.21 to allocate enormous buffers per request. Patched in 2.2.21. The lesson is that any header with arbitrary multiplicity is a denial-of-service surface unless explicitly capped.

**HTTP Desync Attacks: Request Smuggling Reborn — James Kettle, PortSwigger, Black Hat USA 2019.** Industrialised the Watchfire idea and coined the modern attack taxonomy: CL.TE (front-end uses `Content-Length`, back-end uses `Transfer-Encoding`), TE.CL (the reverse), TE.TE (both speak TE but disagree on which obfuscated header to honour). Kettle's 2021 follow-up, *HTTP/2: The Sequel is Always Worse*, moved smuggling into HTTP/2-to-HTTP/1.1 downgrade interfaces. His 2022 *Browser-Powered Desync Attacks* extended the attack to victims' own browsers against Amazon, Akamai, AWS ALB, and Cisco ASA WebVPN.

**HTTP/2 Rapid Reset — CVE-2023-44487 (10 October 2023).** Attackers exploited HTTP/2's `RST_STREAM` to open a stream and immediately cancel it, leaving the server doing useless work while the protocol's concurrency cap counted only currently-open streams. Coordinated disclosure by Google, AWS, and Cloudflare. The peak attack numbers were unprecedented: Google 398 million RPS, Cloudflare 201 million RPS, AWS 155 million RPS — all multiples of the previous record, all from a botnet of just 22,000 machines. The reason this matters in an HTTP/1.1 episode is that most HTTP/2 deployments translate downstream into HTTP/1.1, which is how the abuse propagates.

**MadeYouReset — CVE-2025-8671 (August 2025).** A variant of Rapid Reset that uses malformed WINDOW_UPDATE, PRIORITY, or DATA frames to make the *server* send `RST_STREAM` against itself, bypassing the client-reset rate limits added after Rapid Reset. Affects Apache Tomcat (CVE-2025-48989), F5 BIG-IP (CVE-2025-54500), Netty (CVE-2025-55163), Varnish, Fastly, AMPHP, and gRPC. Cloudflare and Akamai were not exposed because their 2023 Rapid Reset mitigations already covered the variant.

**HTTP/1.1 Must Die: The Desync Endgame — Kettle, Black Hat USA 2025 / DEF CON 33.** Kettle's banner thesis: *"HTTP/1.1 has a fatal flaw: attackers can create extreme ambiguity about where one request ends and the next request starts."* New attack classes including 0.CL desync, parser-discrepancy primitives, browser-powered desync, and chunk-extension obfuscation. Public CVEs assigned: **CVE-2025-32094** (Akamai), **CVE-2025-4366** (Cloudflare Pingora ingress), **CVE-2025-43859**, and **CVE-2025-55315**. PortSwigger and the research team netted more than $200,000 in bug bounties in two weeks. The recommended fix is to deprecate HTTP/1.1 on internal and upstream hops and run HTTP/2 end-to-end. Fastly already enforces this internally; Akamai and Cloudflare patched the specific desync CVEs; NGINX still has gaps for 0.CL.

The story arc — from Watchfire 2005 to Kettle 2025 — is the protocol blueprint version of the longer history we tell in the book chapter on HTTP/1.1, and in the chapters on HTTP/2 and HTTP/3 that pick up the framing-bug lineage in their own CVE waves.

## Common pitfalls (for the practitioner)

**Both `Content-Length` and `Transfer-Encoding: chunked` on the same request.** RFC 9112 §6 says strip `Content-Length` and trust `Transfer-Encoding`. Plenty of parsers don't. If your stack has more than one parser in the path (CDN, load balancer, app server, library) and any two disagree, you have a smuggling vulnerability.

**Duplicate `Content-Length` headers with different values.** Same root cause, different surface. Reject the request.

**Header injection via CR/LF in user-controlled input.** Response splitting, CWE-113. If your code lets a user-supplied string land inside a response header without escaping, an attacker can inject `\r\n\r\n` and append a whole second response.

**Forwarding hop-by-hop headers end-to-end.** `Connection`, `TE`, `Upgrade`, `Trailer`, `Transfer-Encoding`, `Keep-Alive`, `Proxy-Authenticate`, `Proxy-Authorization` — proxies must strip these. Many don't, and that gap powers a long tail of cache-poisoning and confused-deputy bugs.

**Mismatched timeouts between layers.** Server `keepalive_timeout` < load-balancer idle < upstream connection idle, and you get 502s on closed sockets. The rule is **server > LB > upstream**. NGINX defaults `keepalive_timeout` to 75 seconds; Apache's `KeepAliveTimeout` defaults to 5 (too short for many APIs); Go's `http.Server.IdleTimeout` defaults to 0 (no idle timeout); Node.js `server.keepAliveTimeout` defaults to 5000ms.

**Connection-pool defaults.** Go's `http.Transport.MaxIdleConnsPerHost` is 2 — raise it. Node.js's `http.Agent.maxSockets` is unbounded per host — cap it. Java's `HttpClient` shares one pool by default.

**Body-size and header-size defaults.** NGINX `client_max_body_size 1m` — surprise 413 on PUT/POST. NGINX `proxy_buffer_size` 4–8 KB — too small breaks long Set-Cookie chains. Apache `LimitRequestFieldSize 8190` — same for huge JWTs in headers. Cloudflare's Free plan caps request bodies at 100 MB.

**Missing `Host` handling in custom servers.** A silent fallback to "first vhost" is a security bug, not a feature.

**Pipelining.** Don't. Just don't.

## Debugging it

**`curl -v --http1.1 https://example.com/api`** — verbose mode prints the request line, every header, and the response. Add `--trace-ascii` for the byte stream.

**`tcpdump -i any -A 'tcp port 80'`** captures plaintext HTTP/1.1 with ASCII payloads inline. Pipe to a file and open in Wireshark with the `http` display filter.

**Wireshark.** Filters worth memorising: `http`, `http.request.method == "GET"`, `tls.handshake.type == 1` (ClientHello). For TLS-encrypted traffic, set `SSLKEYLOGFILE` so Wireshark can decrypt.

**`mitmproxy`** — open-source, scriptable interception proxy. **Charles** is the commercial GUI alternative. **HTTP Toolkit** (Tim Perry) is a modern GUI mitmproxy alternative.

**Browser DevTools Network panel.** The Initiator column is underused for tracing what kicked off a request.

**Postman / Bruno / HTTPie** for crafting requests. **httpbin.org** and requestbin for toy reflectors.

**What to watch in production.** RPS, p50/p95/p99 latency, the connection-reuse ratio (Cloudflare's flagship metric — a 12% gap costs you "434 years per day" at scale), 4xx vs 5xx ratios separately, retry-after counts, slow-loris signature (high concurrent-conn-per-IP with low byte-rate).

## What's changing in 2026

**April 2026 — `draft-ietf-httpbis-pre-denied-00`** (Mark Nottingham, Cloudflare). Proposes a new status code for early-denied requests. Earliest stage; one to watch.

**March 2026 — `draft-ietf-httpbis-resumable-upload-11`** (Kleidl, Zhang, Pardue). Defines `Upload-Offset`, `Upload-Complete`, and the new **104 Upload Resumption Supported** informational status. Direct IETF descendant of the tus protocol.

**March 2026 — `draft-ietf-httpbis-connect-tcp-11`** (B. Schwartz). Template-Driven HTTP CONNECT Proxying for TCP — a MASQUE-style proxy spec that extends the CONNECT mechanism for templated TCP tunnels.

**March 2026 — `draft-ietf-httpbis-unencoded-digest-04`**. Continuing the modernisation of the HTTP digest family.

**December 2025 — `draft-ietf-httpbis-rfc6265bis-22`** (Bingler, West, Wilander). The long-running cookie revision continues. **November 2025 — `draft-ietf-httpbis-layered-cookies-01`** (van Kesteren and Hofmann, Apple and Google) proposes the more radical move: obsolete *both* RFC 6265 and 6265bis with a layered redesign.

**November 2025 — `draft-ietf-httpbis-safe-method-w-body-14`** (Reschke, Snell, Bishop). The HTTP **QUERY** method — a safe, idempotent verb that takes a body. Closes a 25-year gap in the method matrix and is heading for IESG review.

**July 2025 — IETF httpbis WG rechartering.** Mark Nottingham's proposal of 7 July 2025 keeps the WG running under co-chairs Nottingham (Cloudflare; chair since 2007; on the IAB from IETF 122 in March 2025) and Tommy Pauly (Apple; also IAB Chair).

**June 2024 — RFC 9576/9577/9578 Privacy Pass.** RFC 9577 defines the new `Authorization: PrivateToken token=…` HTTP authentication scheme. Already in production at Apple Private Access Tokens, Cloudflare anti-CAPTCHA, and Kagi.

**September 2024 — RFC 9651 Structured Field Values.** Mark Nottingham (Cloudflare) and Poul-Henning Kamp. Obsoletes RFC 8941; adds Date and Display String types. The ABNF-replacement substrate for new HTTP fields.

**Post-quantum, mid-2025.** Roughly 43% of human-generated connections to Cloudflare now use the X25519MLKEM768 hybrid key agreement. ML-KEM ClientHellos no longer fit in a single packet, exposing decade-old protocol-ossification bugs in middleboxes (tracked at tldr.fail). Post-quantum *signatures* (ML-DSA) for certificates remain harder and are not yet at default-on scale.

**The security frontier.** Kettle's 2025 thesis is moving from research talk to engineering policy: HTTP/1.1 on upstream and origin hops should be deprecated. Fastly already enforces this internally; Cloudflare and Akamai patched specific desync CVEs; NGINX still has gaps for 0.CL.

## Fun facts (host material)

**The `Referer` typo (March 1995).** Phillip Hallam-Baker proposed the header at CERN and misspelled it. In a public mailing-list reply he wrote: *"That's okay, neither one (referer or referrer) is understood by 'spell' anyway. I say we should just blame it on France."* The misspelling rode RFC 1945 in 1996 into permanent infamy. Modern specs — `Referrer-Policy`, the DOM `referrer` property — use the correct spelling, which makes the mismatch worse, not better.

**HTTP 418 I'm a Teapot.** RFC 2324, 1 April 1998, Larry Masinter at Xerox PARC: the *Hyper Text Coffee Pot Control Protocol*. Per Masinter, satire — to spoof the ways HTTP had been extended inappropriately. RFC 7168 (April 2014) extended it for tea. In August 2017 Mark Nottingham asked Node.js, Go, Python `requests`, and ASP.NET to drop 418; **15-year-old Shane Brunswick** registered save418.com and the #save418 hashtag, the projects reversed, and 418 has been formally reserved ever since. Python 3.9 (October 2020) shipped `IM_A_TEAPOT`. `google.com/teapot` returns a real 418.

**HTTP 451 Unavailable For Legal Reasons (RFC 7725, Tim Bray, February 2016).** The number is a deliberate Bradbury reference — *Fahrenheit 451*, the temperature at which paper auto-ignites. Includes a `Link: <…>; rel="blocked-by"` header to identify the entity enforcing the block.

**RFC 6648, June 2012 — "Stop using `X-`."** Saint-Andre, Crocker, Nottingham. After thirty years of `X-Forwarded-For`, `X-Frame-Options`, and the rest, the IETF formally said: existing names get grandfathered, new parameters MUST NOT use the prefix.

**Why "GET" not "RETRIEVE."** Berners-Lee's sensibility favoured extreme brevity: methods were three to seven ASCII characters so they would be readable in `telnet`. The same taste produced `Host`, `If-Match`, and `Vary`.

**Why `Host` was added in 1.1.** Pre-Host, one IP equalled one site. With virtual hosting, a single IPv4 address could front thousands of sites — vital as IPv4 exhaustion approached. RFC 9112 §3.2 says a 1.1 server **must** reject requests lacking `Host`.

**Quotable Roy Fielding** (dissertation, 2000): *"REST emphasizes scalability of component interactions, generality of interfaces, independent deployment of components, and intermediary components to reduce interaction latency, enforce security, and encapsulate legacy systems."*

**Quotable James Kettle** (Black Hat 2025): *"In truth, HTTP/1.1 is so densely packed with critical vulnerabilities, you can literally find them by mistake."*

## Where this connects in the book

- **Part Foundations — "What Is a Protocol?"** — the chapter that uses HTTP as the worked example for what "a protocol" actually is.
- **Part Foundations — "The Layer Model"** — where HTTP gets placed at L7 of the OSI stack and L7 of TCP/IP, and where the layer boundaries get interesting.
- **Part Foundations — "Ports & Sockets"** — port 80 and 443 as the canonical case study, and how multiple HTTP services share one host.
- **Part Foundations — "Client-Server vs Peer-to-Peer"** — HTTP as the textbook client-server protocol, and what that pattern makes easy and hard.
- **Part Foundations — "Protocols for AI Agents"** — MCP and A2A as the new layer that rides on HTTP for AI agents.
- **Part The Story of the Internet — "The Web Is Built On Top"** — the long-form version of the CERN-to-NeXT-cube story, the 1993 royalty-free release, and why HTTP succeeded for the same reasons TCP/IP did.
- **Part The Story of the Internet — "The AI Agent Layer (2024–)"** — MCP (November 2024) and A2A (April 2025) as the first new application layer in fifteen years, both built on HTTP and JSON-RPC.
- **Part Transport — "TCP"** — the substrate every HTTP/1.1 connection lives on, and where the handshake and head-of-line-blocking costs originate.
- **Part Web/API — "HTTP/1.1"** — the chapter episode for the protocol's history and arc, including the long stagnation 1999–2014 and the 2022 five-document republication.
- **Part Web/API — "HTTP/2"** — binary framing, HPACK, the death of Server Push, and the security saga from Rapid Reset onward.
- **Part Web/API — "HTTP/3"** — same semantics on QUIC, the adoption plateau, and the in-kernel-QUIC effort to fix it.
- **Part Web/API — "REST and GraphQL"** — Fielding's 2000 dissertation, HATEOAS, and the mobile-RTT problem that gave us GraphQL.
- **Part Web/API — "WebSockets and SSE"** — the Upgrade mechanism's biggest customers, and the SSE renaissance through LLM token streaming.
- **Part Async/IoT — "CoAP"** — REST semantics on a 32 kB microcontroller, and the binary cousin of HTTP for constrained devices.
- **Part Real-time A/V — "SIP and SDP"** — the request/response shape Schulzrinne borrowed directly from HTTP for telephony signalling.
- **Part Real-time A/V — "HLS and DASH"** — adaptive video over plain HTTP file downloads, and why Apple's iPhone/no-Flash decision shaped the industry.
- **Part How to Learn More — "RFCs Worth Reading"** — RFC 9110 as the document that makes HTTP/1.1, HTTP/2, and HTTP/3 all click.
- **Part How to Learn More — "Books"** — Grigorik's *High Performance Browser Networking*, Stevens's *TCP/IP Illustrated*, and the standard textbook list.

## See also (other protocol episodes)

**HTTP/2.** The big difference is multiplexing. HTTP/1.1 sends requests sequentially on a connection; HTTP/2 multiplexes many concurrent streams over one connection, with HPACK header compression that can shrink repetitive headers by up to 90%. Browsers stop needing six TCP connections per origin. The episode on HTTP/2 covers how the Server Push mechanism was added and then formally removed in RFC 9113 — and the ongoing CVE saga from Rapid Reset to MadeYouReset.

**HTTP/3.** Same semantics as HTTP/1.1 (RFC 9110), but the wire format is binary frames over QUIC over UDP, with TLS 1.3 baked into the handshake. Eliminates TCP head-of-line blocking, supports 0-RTT resumption, and survives a phone moving between Wi-Fi and cellular without reconnecting. The HTTP/3 episode goes deeper on the 21% adoption plateau and the in-kernel-QUIC effort.

**TCP.** The reliable byte-stream substrate every HTTP/1.1 connection lives on. The TCP episode owns the SYN/SYN-ACK/ACK handshake, slow start, congestion control from Tahoe through CUBIC through BBR through L4S, and Nagle's algorithm (which most HTTP clients and servers disable with `TCP_NODELAY`).

**TLS.** HTTPS is HTTP over TLS on port 443. The TLS episode owns the certificate exchange, ALPN (`h2`, `http/1.1`, `h3`), the post-quantum X25519MLKEM768 rollout, and the death of TLS 1.0/1.1 (RFC 8996, 2021).

**REST.** Roy Fielding's 2000 UC Irvine dissertation named the architectural style behind HTTP — six constraints (client-server, stateless, cacheable, layered, uniform interface, optional code-on-demand). Fielding wrote both the dissertation and the HTTP RFCs, which makes REST the post-hoc rationale for HTTP's design choices, not the other way around.

**WebSocket.** Pure piggyback. The HTTP/1.1 Upgrade handshake bootstraps the connection; after that, frames are WebSocket's own protocol. The WebSocket episode covers the SHA-1 magic-string handshake, RFC 8441 for HTTP/2 bootstrapping, and the 2024–2026 CVE wave in major implementations.

**SOAP.** XML-based RPC by Microsoft, IBM, and others (W3C, 2003), tunneled over HTTP POST with a `SOAPAction` header. The verbose enterprise alternative that REST/JSON displaced in the 2010s but that still runs in finance, telco, and SAP ecosystems.

**JSON-RPC.** Lightweight stateless RPC, JSON-RPC 2.0 since 2010, conventionally over HTTP POST with `Content-Type: application/json`. Sees a renaissance in 2024–2026 as the wire format for AI agent protocols.

**MCP.** Model Context Protocol (Anthropic, launched 25 November 2024). Wire format is JSON-RPC 2.0; transports are stdio for local and Streamable HTTP for remote. The Streamable HTTP transport (introduced in the 2025-03-26 spec revision) uses a single endpoint accepting POST and GET, optional SSE on the response side, and an `Mcp-Session-Id` header for stateful sessions. Authentication is OAuth 2.1-style with mandatory PKCE.

**A2A.** Agent2Agent (Google, announced 9 April 2025; v0.3 in July 2025 added gRPC support). Built directly on HTTPS plus JSON-RPC 2.0 plus Server-Sent Events. Agents publish an Agent Card at `/.well-known/agent-card.json`. More than 150 partner organisations including Salesforce, SAP, Atlassian, ServiceNow, MongoDB, PayPal, and LangChain.

**OAuth 2.0.** A pure HTTP overlay: redirects (302/303) for the authorisation-code dance, `Authorization: Bearer` for resource access, well-known URIs for discovery (RFC 8414, RFC 9728 from April 2025). OAuth 2.1 is at draft -15 (March 2026); it consolidates a decade of best practices, mandates PKCE for the Authorization Code flow, and removes Implicit and Resource Owner Password Credentials grants.

**HLS and DASH.** Adaptive video over plain HTTP file downloads. Both fetch a playlist (M3U8 for HLS, XML MPD for DASH) and then GET segments at the appropriate bitrate. Apple devices have never natively played DASH — that is the structural reason HLS won the format war.

**GraphQL.** Sends queries and mutations as HTTP POST requests to a single endpoint, JSON in and JSON out. Subscriptions need a long-lived connection — graphql-ws over WebSocket was the original transport; SSE is increasingly preferred because it composes with HTTP/2 and inherits HTTP auth.

**IPv4 and IPv6.** Every HTTP request rides over IP, which is a separate episode in its own right. The relevance to HTTP/1.1 is the `Host` header — the 1997 mechanism that let one IPv4 address front thousands of websites at the moment IPv4 exhaustion was becoming a real problem.

## Visual cues for image generation

- A side-by-side wire-format comparison: on the left, an HTTP/1.1 request as eight lines of US-ASCII (request line, Host, Accept, Authorization, Connection, blank line, body) with each CRLF rendered as a small grey arrow. On the right, the equivalent HTTP/2 binary frame with its 9-byte header annotated (Length 24-bit, Type 8-bit, Flags 8-bit, Stream ID 31-bit). Caption: *"The protocol you can read with cat."*
- A timeline of the HTTP RFC lineage. RFC 1945 (1996, HTTP/1.0) → RFC 2068 (Jan 1997, first 1.1) → RFC 2616 (June 1999, the document that froze for 15 years) → RFC 7230–7235 (June 2014, the six-document split) → RFC 9110, 9111, 9112, 9113, 9114 (June 2022, the five-document set, all the same week). Below: *"7 June 2022 — the day TCP stopped being assumed."*
- Cloudflare's connection-reuse-ratio chart for one major customer: Y-axis 87% to 100%, two horizontal lines labelled "NGINX (87.1%)" and "Pingora (99.92%)". A footnote reads *"434 years of TCP/TLS handshake time saved per day, globally."*
- An HTTP/2 Rapid Reset attack diagram: one attacker, one HTTP/2 connection, an endless loop of HEADERS frames immediately followed by RST_STREAM frames. Three peak-RPS counters in the corner: Google 398M, Cloudflare 201M, AWS 155M. Caption: *"Most HTTP/2 deployments translate downstream into HTTP/1.1, which is why the abuse propagates."*
- An HTTP/1.1 traffic-share donut chart for Q1 2026 Cloudflare-observed requests: HTTP/2 51%, HTTP/1.1 28%, HTTP/3 21%. A side label points at the HTTP/1.1 wedge: "CLI tools, server-to-server REST, internal microservices, bot traffic, debugging."
- A request-smuggling sequence diagram. Front-end honours `Content-Length`; back-end honours `Transfer-Encoding: chunked`. A single attacker request becomes a smuggled prefix on the next victim request. Caption: *"RFC 9112 §6 says strip Content-Length and trust Transfer-Encoding. Many parsers don't."*

## Sources

**RFCs.**

- [RFC 9112 — HTTP/1.1 (June 2022, STD 99)](https://www.rfc-editor.org/rfc/rfc9112.html)
- [RFC 9110 — HTTP Semantics (June 2022, STD 97)](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9111 — HTTP Caching (June 2022)](https://www.rfc-editor.org/rfc/rfc9111.html)
- [RFC 9113 — HTTP/2 (June 2022)](https://datatracker.ietf.org/doc/rfc9113/)
- [RFC 9114 — HTTP/3 (June 2022)](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 7230 — HTTP/1.1 Message Syntax (June 2014, obsoleted)](https://www.rfc-editor.org/info/rfc7230)
- [RFC 2616 — HTTP/1.1 (June 1999)](https://www.w3.org/Protocols/rfc2616/rfc2616-sec17.html)
- [RFC 2068 — HTTP/1.1 (January 1997)](https://www.rfc-editor.org/info/rfc2068)
- [RFC 1945 — HTTP/1.0 (May 1996)](https://datatracker.ietf.org/doc/html/rfc1945)
- [RFC 9651 — Structured Field Values (Sept 2024)](https://www.rfc-editor.org/rfc/rfc9651)
- [RFC 6648 — Deprecating "X-" Prefix (June 2012)](https://www.rfc-editor.org/rfc/rfc6648)
- [RFC 6455 — The WebSocket Protocol (Dec 2011)](https://datatracker.ietf.org/doc/html/rfc6455)
- [RFC 7725 — HTTP Status 451 (Tim Bray, Feb 2016)](https://datatracker.ietf.org/doc/html/rfc7725)
- [RFC 2324 — HTCPCP / 418 I'm a Teapot (April 1, 1998)](https://www.rfc-editor.org/rfc/rfc2324)
- [RFC 6749 — OAuth 2.0 (Oct 2012)](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 6750 — OAuth 2.0 Bearer Token (Oct 2012)](https://datatracker.ietf.org/doc/html/rfc6750)
- [RFC 9577 — Privacy Pass HTTP Authentication Scheme (June 2024)](https://datatracker.ietf.org/doc/rfc9577/)
- [RFC 9578 — Privacy Pass Issuance Protocols (June 2024)](https://www.rfc-editor.org/rfc/rfc9578.html)
- [draft-ietf-httpbis-safe-method-w-body — HTTP QUERY method, latest -14](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/)
- [draft-ietf-httpbis-resumable-upload, draft -11 (Mar 2026)](https://datatracker.ietf.org/doc/draft-ietf-httpbis-resumable-upload/)
- [draft-ietf-httpbis-rfc6265bis-22 (Dec 2025)](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/)
- [draft-ietf-httpbis-layered-cookies-01](https://datatracker.ietf.org/doc/draft-ietf-httpbis-layered-cookies/)
- [draft-ietf-oauth-v2-1 — OAuth 2.1 (latest -15, March 2026)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [IETF httpbis active drafts](https://datatracker.ietf.org/doc/active/)
- [IETF httpbis WG materials](https://httpwg.org/wg-materials/)

**Papers and theses.**

- [Roy T. Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine 2000](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- [Watchfire — Linhart, Klein, Heled, Orrin, *HTTP Request Smuggling* (2005)](https://trimstray.github.io/assets/pdfs/HTTP-Request-Smuggling.pdf)
- [James Kettle, *HTTP/1.1 Must Die: The Desync Endgame*, Black Hat USA 2025 slides](https://i.blackhat.com/BH-USA-25/Presentations/US-25-Kettle-HTTP1-Must-Die-The-Desync-Endgame-Wednesday.pdf)
- [Tim Berners-Lee, *Information Management: A Proposal*, March 1989, CERN](https://cds.cern.ch/record/369245/files/dd-89-001.pdf)
- [PortSwigger, *Top 10 web hacking techniques of 2024*](https://portswigger.net/research/top-10-web-hacking-techniques-of-2024)

**Vendor and engineering blogs.**

- [Cloudflare, *How we built Pingora*](https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/)
- [Cloudflare, *trie-hard: saving compute 1% at a time* (2025)](https://blog.cloudflare.com/pingora-saving-compute-1-percent-at-a-time/)
- [Cloudflare, *HTTP/2 Rapid Reset: technical breakdown* (2023)](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
- [Cloudflare, *MadeYouReset thwarted by Rapid Reset mitigations* (2025)](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)
- [Cloudflare Radar, *2025 Year in Review*](https://blog.cloudflare.com/radar-2025-year-in-review/)
- [Cloudflare, *State of the post-quantum Internet in 2025*](https://blog.cloudflare.com/pq-2025/)
- [Cloudflare, *Automatically Secure: 6,000,000 domains*](https://blog.cloudflare.com/automatically-secure/)
- [Pingora open-source repository (Cloudflare)](https://github.com/cloudflare/pingora)
- [Fastly, *Resilience to HTTP/1.1 desynchronization attacks*](https://www.fastly.com/blog/fastlys-resilience-to-http-1-1-desynchronization-attacks)
- [Akamai (Mike Bishop), *The Next Generation of HTTP*](https://www.akamai.com/blog/news/the-next-generation-of-http)
- [PortSwigger, *HTTP Desync Attacks: Request Smuggling Reborn*](https://portswigger.net/research/http-desync-attacks-request-smuggling-reborn)
- [PortSwigger, *HTTP/2: The Sequel is Always Worse*](https://portswigger.net/research/http2)
- [PortSwigger, *HTTP/1.1 Must Die: in-house pentesters*](https://portswigger.net/blog/http-1-1-must-die-what-this-means-for-in-house-pentesters)
- [SquidSec, *HTTP Request Smuggling in 2025*](https://squidhacker.com/2025/11/http-request-smuggling-in-2025-how-to-distinguish-real-desync-vulnerabilities-from-http-request-pipelining-and-stop-wasting-everyones-time/)
- [Apache, *CVE-2011-3192 — Range header DoS*](https://httpd.apache.org/security/CVE-2011-3192.txt)
- [Slowloris background — Invicti](https://www.invicti.com/learn/slowloris-attack)
- [Netcraft Web Server Survey, December 2025](https://www.netcraft.com/blog/december-2025-web-server-survey)
- [INNOQ, *A Brief History of HTTP* (April 2025)](https://www.innoq.com/en/blog/2025/04/a-brief-history-of-http/)
- [MDN, *Evolution of HTTP*](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP)
- [MDN, *HTTP caching*](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [MDN, *Cache-Control* header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
- [Ilya Grigorik, *High Performance Browser Networking*](https://hpbn.co/)
- [Anthropic, MCP Specification 2025-03-26 — Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [Google Developers Blog, *Announcing the Agent2Agent Protocol*](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A Protocol GitHub](https://github.com/a2aproject/A2A)
- [A2A Protocol specification](https://a2a-protocol.org/latest/specification/)

**News.**

- [The Register, *IETF publishes HTTP/3 RFC* (June 2022)](https://www.theregister.com/2022/06/07/http3_rfc_9114_published/)
- [The Hacker News, *MadeYouReset / CVE-2025-8671* (Aug 2025)](https://thehackernews.com/2025/08/new-http2-madeyoureset-vulnerability.html)
- [CISA, *HTTP/2 Rapid Reset, CVE-2023-44487*](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
- [Qualys, *CVE-2023-44487 HTTP/2 Rapid Reset Attack*](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
- [Dark Reading, *Browser-powered desync at Black Hat*](https://www.darkreading.com/application-security/researcher-at-black-hat-describes-new-htpp-request-smuggling-attack)

**Wikipedia and reference.**

- [Wikipedia, *History of the World Wide Web*](https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web)
- [Wikipedia, *HTTP*](https://en.wikipedia.org/wiki/HTTP)
- [Wikipedia, *HTTP referer*](https://en.wikipedia.org/wiki/HTTP_referer)
- [Wikipedia, *Hyper Text Coffee Pot Control Protocol* (RFC 2324)](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
- [Wikipedia, *HTTP 451*](https://en.wikipedia.org/wiki/HTTP_451)
- [Wikipedia, *REST*](https://en.wikipedia.org/wiki/REST)
- [Wikipedia, *WebSocket*](https://en.wikipedia.org/wiki/WebSocket)
- [Phillip Hallam-Baker on the Referer typo (10 March 1995)](https://lists.w3.org/Archives/Public/ietf-http-wg/1995JanMar/0109.html)
- [The History of the Web, *Sorry Computer, You're Not a Teapot*](https://thehistoryoftheweb.com/im-a-teapot/)
- [CERN, *A short history of the Web*](https://home.cern/science/computing/birth-web/short-history-web)
