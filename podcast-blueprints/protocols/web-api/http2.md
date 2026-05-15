---
id: http2
type: protocol
name: HyperText Transfer Protocol 2
abbreviation: HTTP/2
etymology: "[H]yper[T]ext [T]ransfer [P]rotocol [2]"
category: web-api
year: 2015
rfc: RFC 9113
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ports-sockets
  - story-of-the-internet/the-web-arrives
  - transport/tcp
  - transport/sctp
  - transport/quic
  - wireless/the-shared-medium
  - web-api/http1
  - web-api/http2
  - web-api/http3
  - web-api/rest-and-graphql
  - web-api/grpc
  - web-api/websockets-and-sse
  - realtime-av/hls-and-dash
  - patterns-failures/patterns
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/books
related_protocols: [http1, http3, tcp, tls, grpc, sse, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9113]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/HTTP_pipelining2.svg/500px-HTTP_pipelining2.svg.png"
    caption: "The evolution from HTTP/1.1 to HTTP/2: sequential requests waste time waiting; pipelining helped but still suffered head-of-line blocking; HTTP/2 multiplexing sends many requests and responses simultaneously over one connection using binary framing."
    credit: "Image: Wikimedia Commons / Public Domain"
visual_cues:
  - "A single TCP connection split into many parallel coloured streams, each labelled with an odd Stream ID, frames interleaving on the wire — and one red TCP packet drop stalling all colours at once."
  - "A 9-byte HTTP/2 frame header dissected: 24-bit Length, 8-bit Type, 8-bit Flags, 1 reserved bit, 31-bit Stream ID — with the ten frame types (DATA, HEADERS, PRIORITY, RST_STREAM, SETTINGS, PUSH_PROMISE, PING, GOAWAY, WINDOW_UPDATE, CONTINUATION) listed alongside."
  - "The 24-byte connection preface 'PRI * HTTP/2.0\\r\\n\\r\\nSM\\r\\n\\r\\n' with the letters P-R-I-S-M highlighted to show the hidden word."
  - "Rapid Reset attack timeline: a client opens a stream with HEADERS, sends RST_STREAM immediately, opens another, RSTs again — a counter of 'bytes processed by server' soaring to 398 million requests per second against Google."
  - "HPACK in action: the first request sends 'cookie: ...' as a literal; the second request sends a 1-byte index pointing into the dynamic table — the same value, ~50x smaller on the wire."
  - "A side-by-side adoption chart for Q1 2026 Cloudflare-observed traffic: HTTP/1.1 ~28%, HTTP/2 ~51%, HTTP/3 ~21%."
---

# HTTP/2 — HyperText Transfer Protocol 2

## In one breath

HTTP/2 is the binary, multiplexed wire format that carries the majority of the modern web — about 51% of Cloudflare-observed requests in Q1 2026, more than HTTP/1.1 and HTTP/3 combined. It keeps every HTTP semantic developers know — GET, POST, headers, status codes — but replaces text-based framing with 9-byte binary frames, lets hundreds of streams interleave on a single TCP connection, and compresses repeated headers with HPACK. If you ship software on the public internet, your traffic almost certainly speaks h2 to a CDN, even when it speaks HTTP/1.1 to your origin.

## The pitch (cold-open)

In 2009, Mike Belshe and Roberto Peon at Google published an experimental protocol called SPDY — pronounced "speedy" — promising web pages would load up to 55% faster. Six years later, in May 2015, that experiment became HTTP/2: the first major upgrade to the web's core protocol since 1997. It killed HTTP/1.1's six-connections-per-origin hack with multiplexing, traded text framing for binary, and compressed the cookies and headers nobody had thought to compress. By 2026 it carries the plurality of all CDN traffic. But here is the twist nobody saw coming: in October 2023, attackers turned HTTP/2's signature feature — stream cancellation — into the largest distributed denial-of-service attack ever recorded, 398 million requests per second against Google in two minutes, from a botnet of just 22,000 nodes. The protocol that made the web fast also created the most efficient layer-7 amplifier ever invented.

## How it actually works

HTTP/2 is a binary protocol that lives between TLS and the application. After TCP and TLS hand off via ALPN, every byte that follows is a sequence of small framed messages on numbered streams. The story below is the spine of any browser-to-CDN exchange in 2026.

**Connection bootstrap.** TCP three-way handshake to port 443. Then TLS 1.2 or 1.3, with the client offering an ALPN list — typically `["h2", "http/1.1"]`, possibly with `"h3"` ahead of it — and the server picking `h2` in the ServerHello. Browsers will not speak unencrypted HTTP/2; cleartext `h2c` survives only on trusted networks like service meshes and gRPC inside the datacenter. RFC 9113 actually removed the old HTTP/1.1 `Upgrade: h2c` dance entirely — the only surviving cleartext mode is "prior knowledge", where the client just sends the preface on a known endpoint.

**Connection preface.** The client sends 24 bytes: the literal ASCII `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`. The `PRI` verb was chosen so a confused HTTP/1.1 server returns `405` or `501` instead of crashing on binary garbage. Both sides immediately follow with a `SETTINGS` frame.

**SETTINGS exchange.** Each side advertises its limits: max concurrent streams, initial window size, max frame size, max header list size, whether RFC 7540 priorities are honored. The other side ACKs. Browsers assume `MAX_CONCURRENT_STREAMS = 100` even before SETTINGS arrives — Cloudflare discovered this the hard way during Rapid Reset mitigation when they dropped to 64 and broke real users.

**Multiplexed request and response.** The client sends a HEADERS frame on stream 1 — odd IDs are client-initiated, even IDs are server-initiated, stream 0 is reserved for connection-level control. Without waiting, it can send HEADERS on stream 3, stream 5, stream 7, and so on. The server interleaves DATA frames back: a 4 KB chunk on stream 1, a header block on stream 3, a body chunk on stream 5, all on the same TCP connection. The big image download on stream 9 doesn't block the small JSON response on stream 11.

**Flow control.** The receiver replenishes credit by sending `WINDOW_UPDATE` frames. There are two windows: per-stream and per-connection, both starting at 65,535 bytes. Only DATA frames count against them. A subtle gotcha: `SETTINGS_INITIAL_WINDOW_SIZE` only changes future streams' initial windows; the connection window is *only* adjustable via WINDOW_UPDATE.

**Graceful close.** Either side can send `GOAWAY` with a `last_stream_id` — meaning "I'll finish processing streams up to this ID and then close." Then a TCP FIN.

### Header at a glance

Every frame is 9 bytes of header plus a payload.

- **Length (24 bits)** — payload size in bytes. Defaults to a max of 16,384; can be raised to 16 MiB via SETTINGS.
- **Type (8 bits)** — one of ten frame types. `DATA` carries body bytes; `HEADERS` carries a header block and opens a stream; `SETTINGS` carries connection parameters; `RST_STREAM` aborts a stream; `PING` is an 8-byte opaque liveness probe; `GOAWAY` initiates connection shutdown; `WINDOW_UPDATE` opens flow-control credit; `CONTINUATION` continues an oversize header block; `PRIORITY` is the deprecated RFC 7540 signal kept for backward parsing; `PUSH_PROMISE` is effectively dead.
- **Flags (8 bits)** — per-type control bits. `END_HEADERS` finishes a header block; `END_STREAM` marks the last frame on a stream; `ACK` confirms a SETTINGS or PING.
- **Reserved (1 bit)** — must be zero.
- **Stream Identifier (31 bits)** — which stream this frame belongs to. Zero means connection-level.

### State machine in three sentences

A stream starts in `idle`, opens to `open` when HEADERS is sent or received, and ends in `closed` after either side sends `END_STREAM` or a `RST_STREAM` is exchanged. Between open and closed there are two `half-closed` states — one direction has finished sending — plus two `reserved` states left over from the now-dead PUSH_PROMISE flow. The whole machine is in section 5.1 of RFC 9113 and it is small enough to memorize.

### HPACK compression

HPACK (RFC 7541) is the reason a busy HTTP/2 page is dramatically smaller on the wire than HTTP/1.1. It carries header fields three ways: as an index into a 61-entry static table of common pairs (`:method GET`, `:status 200`, `accept-encoding gzip, deflate`, etc.), as an index into a per-direction dynamic FIFO table sized by `SETTINGS_HEADER_TABLE_SIZE` (default 4,096 bytes), or as a literal that may be Huffman-coded with the static code in RFC 7541 Appendix B. Sensitive headers can be marked "never indexed" to keep them out of compressors entirely. Cloudflare reported HPACK reduced ingress bytes by about 53% in their measurements; LinkedIn reported 34% faster page loads after migrating. HPACK exists because gzip-compressed headers in SPDY were vulnerable to CRIME (2012) and BREACH (2013) — attacks that infer secrets from compression ratios. HPACK explicitly designs around them.

### Flow control, priority, and the long-dead Server Push

There are two layers of flow control on top of TCP's: per-stream and per-connection, both via `WINDOW_UPDATE`. Default 65,535 bytes; many tunings raise the connection window to 6 MiB for upload-heavy origins.

Stream priority is now a saga. The original RFC 7540 dependency tree — a directed graph of streams with weights and exclusivity flags — was implemented inconsistently and many servers ignored client signals. RFC 9113 explicitly *deprecates* it, saying "the prioritization signaling in RFC 7540 was not successful." The modern replacement is **RFC 9218 Extensible Priorities** by Kazuho Oku of Fastly and Lucas Pardue of Cloudflare: a `Priority:` HTTP header (and a `PRIORITY_UPDATE` frame) carrying `u=0..7` urgency and `i=?1` for incremental rendering. A server announces `SETTINGS_NO_RFC7540_PRIORITIES = 1` to opt out of the old scheme. Cloudflare reported up to 37% faster page loads when Extensible Priorities is enabled.

Server Push — the `PUSH_PROMISE` frame letting a server preemptively send resources — is *gone*. Chrome 106 disabled it by default in October 2022; Firefox 132 removed support entirely on October 29, 2024. Only ~1.25% of HTTP/2 sites had ever used it. The replacement is the `103 Early Hints` informational status combined with `Link: rel=preload` headers, which CDNs handle far better.

## Where it shows up in production

**The big CDNs.** Cloudflare, Akamai, Fastly, AWS CloudFront, and Google Cloud all default to HTTP/2 (and increasingly HTTP/3) for browser traffic, with HTTP/2 — or still HTTP/1.1 — to origins. The 2024 Web Almanac shows CDN-fronted requests are 96% HTTP/2 or HTTP/3. Cloudflare's Pingora — written in Rust, public 2022 — replaced NGINX on Cloudflare's edge entirely by 2025; its HTTP/2 uses the Rust `h2` crate.

**Web servers.** Apache shipped HTTP/2 in 2.4.17 (October 2015) via `mod_http2`. NGINX added it in 1.9.5 the same month. Caddy ships HTTP/2 and HTTP/3 by default with automated TLS. Microsoft IIS has had HTTP/2 since Windows Server 2016. Cloudflare maintained an out-of-tree NGINX HTTP/2+SPDY patch for years before moving to Pingora.

**Reference C library.** **nghttp2**, by Tatsuhiro Tsujikawa, forked from `spdylay`, is the canonical implementation. It powers Apache `mod_http2`, curl, Envoy's classic codec, and language bindings everywhere. The `nghttp` client, `nghttpd` server, `nghttpx` proxy, and `h2load` benchmark are the standard toolkit.

**Proxies and meshes.** Envoy uses nghttp2 (and a newer `oghttp` codec); HAProxy added rate-limiting changes in 1.9 (2018) that incidentally protected it from Rapid Reset; Linkerd, Istio, and Traefik all sit on Envoy or its descendants.

**Language stacks.** Go shipped HTTP/2 in `net/http` and `golang.org/x/net/http2` in version 1.6 (February 2016). Java has `java.net.http` since JDK 11; Netty 4.1 is the workhorse for Vert.x and Spring Reactor; Jetty ships HTTP/2 plus ALPN. Node.js added a built-in `http2` module in 8.4. .NET has had it in `HttpClient` since .NET Core 3.0. Python has `httpx` (HTTP/2 native), the `h2` library from Cory Benfield's `python-hyper` org, and Twisted's HTTP/2 plugin. Rust uses Hyper and the `h2` crate.

**gRPC inside the datacenter.** gRPC is the reason `h2c` cleartext mode survives at all. Service-to-service calls in nearly every large engineering org since about 2019 are gRPC over HTTP/2, mapping each RPC to a single stream with HEADERS for metadata, length-prefixed protobuf in DATA frames, and HTTP/2 trailers for `grpc-status` / `grpc-message`. We cover the rest in the gRPC episode.

**Numbers worth knowing.** Akamai (2023): about 71% of API requests and 58% of site traffic on HTTP/2. LinkedIn: 34% faster page loads after migration. The original SPDY whitepaper claimed up to 55% page-load improvement; the Wang/Balasubramanian/Krishnamurthy/Wetherall NSDI 2014 paper "How Speedy is SPDY?" found those gains were "easily overwhelmed" by JavaScript and CSS dependencies and shrank to about 7% once browser computation was modeled — an important reality check. Per-stream memory in nghttp2 is roughly 1–2 KiB.

## Things that go wrong

**Rapid Reset (CVE-2023-44487, 10 October 2023).** The killer bug. The protocol designers assumed `RST_STREAM` would be rare and cheap, so a reset stream stops counting against `MAX_CONCURRENT_STREAMS` *immediately* — before the server has finished cleanup. An attacker opens a stream with HEADERS, RSTs it, opens another, RSTs again, faster than the server can release the resources behind each one. Coordinated disclosure by Google, Cloudflare, and AWS landed on October 10, 2023. Peak attacks: **Google 398 million requests per second** — 7.5× the previous record — Cloudflare 201 Mrps, AWS 155 Mrps. The Google attack came from a botnet of just 22,000 nodes. The fix is conceptually simple — track the rate of stream resets per connection and tear the TCP connection down on abuse — and patches landed within days in nginx, nghttp2, Envoy, Apache, Go `net/http`, Node.js, .NET, and the Rust `h2` crate. HAProxy turned out to be incidentally immune because of rate-limiting changes from 2018.

**CONTINUATION Flood (CVE-2024-27316, 3 April 2024).** Disclosed by Bartek Nowotarski via CERT/CC. An attacker opens a stream and sends an unbounded sequence of `CONTINUATION` frames *without* the `END_HEADERS` flag. Servers that buffer header fragments without enforcing `MAX_HEADER_LIST_SIZE` either OOM (Apache httpd) or burn CPU (Envoy, about one core per 300 Mbps). The CVE rippled across Apache httpd (fixed in 2.4.59), Apache Tomcat, Apache Traffic Server, Envoy, Node.js, Go `net/http`, nghttp2 (1.61.0), AMPHP, and Tempesta FW. The lesson: every HTTP/2 server should set `SETTINGS_MAX_HEADER_LIST_SIZE` to something sane like 16 to 64 KiB. Without it, the protocol surface gives attackers an easy OOM.

**MadeYouReset (CVE-2025-8671, 13 August 2025).** Disclosed by Gal Bar Nahum, Anat Bremler-Barr, and Yaniv Harel of Tel Aviv University with Imperva. The attacker uses *malformed* `WINDOW_UPDATE`, `PRIORITY`, or DATA frames to make the server send `RST_STREAM` against itself — bypassing the post-Rapid-Reset client-reset rate limits because the server is the one resetting. Affects Apache Tomcat, Netty, Varnish, F5, Fastly's H2O fork, AMPHP, Eclipse, Mozilla services, gRPC, Wind River, SUSE, Zephyr. Cloudflare and Akamai were not exposed; Cloudflare's Pingora doesn't terminate inbound HTTP at the layer that was vulnerable. The Rust `h2` crate patched in 0.4.11.

**The Netflix family (CVE-2019-9511 through 9518, August 2019).** Discovered by Jonathan Looney at Netflix (with Piotr Sikora at Google for 9518). Eight DoS variants: *Data Dribble* (manipulate windows to force 1-byte chunks), *Ping Flood*, *Resource Loop* (perpetual priority-tree shuffle), *Reset Flood*, *Settings Flood*, *0-Length Headers Leak*, *Internal Data Buffering*, *Empty Frames Flood*. Each one taught the field a lesson about which frames need rate-limiting.

**HPACK Bomb (CVE-2016-6581).** A header field exactly the size of the HPACK dynamic table is inserted, then a header block of pure references to that entry is sent — yielding more than a 4096:1 compression ratio. 16 KB on the wire balloons to 64 MB+ in memory. python-hyper's hpack 2.3.0 fixed it by enforcing maximum decompressed list size. A 2025 variant, CVE-2025-53020, hit Apache httpd by exploiting unnecessary memory duplication for repeated header names.

**OpenSSL CVE-2016-6309 (26 September 2016).** Use-after-free in the TLS state machine when a handshake message exceeded the 16 KiB buffer and `realloc` moved it. CVSS 10.0; affected only OpenSSL 1.1.0a. Practically relevant to HTTP/2 because the protocol forced widespread OpenSSL adoption and large initial ALPN/SNI ClientHellos.

The deeper failure-pattern: HTTP/2 has a large protocol surface, intricate implementations, and DDoS economics that make HTTP/2 servers high-value targets. The Rapid-Reset → CONTINUATION-Flood → MadeYouReset cadence — about one significant implementation-class CVE per year — should be expected to continue. The "Things that change in 2026" section of the chapter episode "HTTP/2" walks through the strategic implications.

## Common pitfalls (for the practitioner)

- **Forgetting `SETTINGS_MAX_HEADER_LIST_SIZE`.** Every CONTINUATION-flood and HPACK-bomb CVE owes its severity to this. Set it to 16–64 KiB.
- **Origin-side proxy speaks only HTTP/1.1.** You keep TCP head-of-line blocking and lose HPACK between edge and origin. Cloudflare offers "HTTP/2 to Origin" specifically for this.
- **Bufferbloat with large initial windows.** Raising `INITIAL_WINDOW_SIZE` to 5–10 MiB helps high-BDP uploads but causes high latency for high-priority responses unless you also set `tcp_notsent_lowat` (Cloudflare recommends 16 KiB) so the kernel's TCP send buffer doesn't swallow your prioritization decisions.
- **Mismatched window sizes between client and server.** Under-allocated `INITIAL_WINDOW_SIZE` caps throughput; over-allocated invites bufferbloat.
- **TCP head-of-line blocking under loss.** Measurable on lossy mobile links — a single dropped TCP segment stalls every multiplexed stream. The HTTP/3 episode is where the fix lives.
- **HPACK dynamic-table sync drift.** When intermediaries re-encode, the client's and proxy's dynamic tables can diverge. Symptom: `COMPRESSION_ERROR` and a connection-fatal close.
- **Server Push misuse.** Pushing already-cached resources, fighting the rendering critical path. If you still have it on, turn it off.
- **Failing to advertise `Alt-Svc: h3=":443"`.** Leaves you on HTTP/2 forever for clients that would otherwise upgrade to HTTP/3.
- **Load balancer that decrypts and re-encrypts.** Many configurations silently downgrade to HTTP/1.1 to origin without telling you.

## Debugging it

Wireshark with the TLS keylog file is the gold standard. Set `SSLKEYLOGFILE=/tmp/keys.log` before launching Chrome, point Wireshark at it under Edit → Preferences → Protocols → TLS → "(Pre)-Master-Secret log filename", and use the filter `http2`. The HTTP/2 frames will be fully decoded — you can watch SETTINGS exchange, HEADERS open streams, DATA carry payloads, RST_STREAM tear them down.

Beyond Wireshark:

- **`curl --http2 -v https://example.com/`** — negotiate HTTP/2 and verbosely show frames. `curl -sI --http2 https://example.com | grep -i "http/2"` confirms support.
- **`nghttp -nv https://example.com/`** — pretty-prints frames.
- **`h2load -c100 -m100 --duration=30 https://example.com/`** — load test with 100 connections, 100 streams each.
- **`nghttpd -d /var/www -v 8443 server.key server.crt`** — a local HTTP/2 server for testing.
- **`chrome://net-export/`** — Chrome's full network log; analyze in netlog-viewer.
- **`h2spec`** by Moto Ishizawa — RFC compliance test suite, run by every serious implementation in CI.
- **Test endpoints:** `https://nghttp2.org/`, `https://http2.cloudflare.com/`, `https://http2.akamai.com/demo`.
- **`inflatehd` / `deflatehd`** ship with nghttp2 for HPACK debugging.

For the kernel side, the relevant sysctls are around TCP buffering — `net.ipv4.tcp_notsent_lowat` is the big one for prioritization. Pair it with BBR congestion control on Linux for HTTP/2-friendly behavior.

What to monitor in production: stream resets per connection (sudden spikes mean Rapid-Reset-style abuse), GOAWAY frequency (should be near zero outside graceful restarts), HPACK eviction rate (high means the dynamic table is too small for your header churn), per-stream CPU and memory (CONTINUATION-style attacks), `MAX_CONCURRENT_STREAMS` saturation (capacity planning), and TLS session resumption rate.

## What's changing in 2026

**RFC 9218 Extensible Priorities is the new prioritization scheme** (June 2022; deployed widely 2023–2025). Replaces the failed RFC 7540 dependency tree with a `Priority:` HTTP header and `PRIORITY_UPDATE` frames. Cloudflare, Fastly, and h2o ship it; Chrome and Firefox use it for HTTP/3 and increasingly HTTP/2.

**MadeYouReset (CVE-2025-8671, August 13, 2025)** — most recent of the implementation-class CVEs; mitigations are now baked into post-Rapid-Reset stacks.

**Cloudflare replaced NGINX with Pingora on its edge entirely in 2025**, per the Cloudflare Radar 2025 Year in Review. The Rust `h2` crate is now the HTTP/2 engine for one of the largest deployments on the internet.

**HTTP/3 is slowly displacing HTTP/2.** The 2024 Web Almanac shows HTTP/1.1 fell to 21–22% of home pages from 34% in 2022; HTTP/3 is at roughly 21% of Cloudflare-observed traffic in Q1 2026 — flat or slightly declining. HTTP/2 holds the plurality near 51% across CDN traffic.

**HTTPS DNS records (RFC 9460, November 2023) are removing the first-load fallback round trip.** With `alpn=h3` and IP hints in DNS, the *first* request can be HTTP/3; about 4% of second-level domains and ~25% of the Tranco top-1M had HTTPS records by December 2023.

**WebTransport over HTTP/2** — `draft-ietf-webtrans-http2-13` (October 2025) defines WebTransport over HTTP/2 alongside the HTTP/3 binding, using Extended CONNECT (`:protocol = webtransport`) and `SETTINGS_ENABLE_CONNECT_PROTOCOL`. Limited browser deployment as of early 2026.

**Oblivious HTTP (RFC 9458, January 2024)** is in production: Apple Private Cloud Compute, Google Safe Browsing's OHTTP gateway, Mozilla's Firefox telemetry via Fastly. It tunnels HTTP through a relay so the gateway can't see the client IP and the relay can't see the request body.

**RFC 9113 removed the `h2c` Upgrade dance** entirely. Only "prior knowledge" cleartext HTTP/2 remains, used by gRPC inside trusted networks.

**Server Push is fully dead** in browsers. Chrome 106 (October 2022); Firefox 132 (October 29, 2024). The `103 Early Hints` + `Link: rel=preload` pattern has replaced it.

## Fun facts (host material)

**The PRISM preface.** The 24-byte HTTP/2 preface is `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`. The first letters of the non-blank tokens spell PRISM. According to John Graham-Cumming's investigation of the GitHub commit history, the original placeholder verb was `FOO`. On July 8, 2013 — about a month after Edward Snowden disclosed the NSA program of the same name — it was changed to `PRI`. Mark Nottingham confirmed on Hacker News that the working group had been talking about PRISM in the meeting hallways when the placeholder went in. Wireshark labels the preface "Magic." IANA now lists `PRI` as a registered HTTP method that "is never used by an actual client."

**HTTP/2 versus HTTP/2.0.** The preface still says `HTTP/2.0`, but the protocol was renamed from "HTTP/2.0" to just "HTTP/2" before publication. The reasoning: the wire format is binary, version negotiation lives in ALPN, and there is no expectation of an HTTP/2.1. RFC 7540 explicitly discusses this; RFC 9113 just says "HTTP/2" everywhere except in the legacy preface.

**SPDY is not an acronym.** It's "speedy." Mike Belshe and Roberto Peon explicitly disclaimed any expansion in the original 2009 announcement.

**The TLS-only resolution was political.** The IETF could not *require* TLS in the standard without rough consensus, which it did not have. So the spec documents `h2c`. But Chrome and Firefox implementers said they would only support `h2` — over TLS — and the world deployed `h2`. Nottingham's January 2014 post "Strengthening HTTP: A Personal View" frames it openly as a political rather than a technical decision.

**Poul-Henning Kamp's farewell.** The Varnish and FreeBSD developer publicly criticized HTTP/2 as overcomplicated, schedule-driven, and a layering violation — "duplicating flow control that belongs in the transport layer" — and predicted exactly the fragility we ended up seeing. His letter is one of the more honest dissents in modern protocol design.

**Server Push's epitaph.** Jake Archibald and the Chrome networking team's 2020 analysis showed Push had no clear net performance benefit and frequent regressions. Evert Pot — who built `Prefer-Push` and a Node.js framework around Push — wrote a post called "HTTP/2 push is dead" the day Chrome announced removal. The intended replacement, `103 Early Hints`, is also more amenable to CDNs.

## Where this connects in the book

- **Foundations / Ports & Sockets** — how one machine runs many services without confusing them; the `(IP, port, protocol)` socket abstraction HTTP/2 collapses from six per origin to one.
- **The Story of the Internet / The Web Is Built On Top** — Tim Berners-Lee, CERN, and the 1993 royalty-free release that made every later HTTP version (1.0, 1.1, /2, /3) possible; the architectural lesson that an open, layered application protocol on top of a working transport is what wins at internet scale.
- **Transport / TCP** — the single byte stream HTTP/2 multiplexes over, and the source of the head-of-line blocking it cannot escape.
- **Transport / SCTP** — the better protocol that lost on deployment; the lesson HTTP/2 inherits about why fixing transport at the application layer is constrained by what middleboxes already understand.
- **Transport / QUIC** — the UDP-based replacement that finally fixes TCP head-of-line blocking; the reason HTTP/3 exists.
- **Wireless / The shared medium** — why packet loss on Wi-Fi and cellular hurts HTTP/2 specifically.
- **Web / API / HTTP/1.1** — the 6-connection-per-origin world HTTP/2 was built to escape, and why HTTP/1.1 is still 28% of traffic in 2026.
- **Web / API / HTTP/2** — the chapter on the dedicated history, the SPDY origins, the security saga, and the binary-framing design choices.
- **Web / API / HTTP/3** — the QUIC-based successor; the plateau, the in-kernel QUIC patch, and why HTTP/2 still dominates despite HTTP/3's head start on adoption.
- **Web / API / REST and GraphQL** — both run over HTTP/2 transparently; GraphQL especially benefits from multiplexing.
- **Web / API / gRPC** — the service-to-service RPC protocol built directly on HTTP/2 framing; the reason `h2c` cleartext mode survives.
- **Web / API / WebSockets and SSE** — RFC 8441's Extended CONNECT bootstrap for WebSocket over HTTP/2, and SSE's renaissance as the de facto LLM token-streaming wire format.
- **Real-time A/V / HLS and DASH** — adaptive video over HTTP/2; the Apple Low-Latency HLS drama where HTTP/2 Push was originally required and then walked back.
- **How Networks Actually Behave / Recurring Patterns** — handshakes, sliding windows (HTTP/2 has its own flow control on top of TCP's), keepalives (PING frames), and ECN — the Lego pieces HTTP/2 reuses.
- **How to Learn More / RFCs Worth Reading** — RFC 9110 (HTTP Semantics) and RFC 9113 (HTTP/2) are on the list; reading 9110 once makes 1.1, 2, and 3 all click.
- **How to Learn More / Books** — Ilya Grigorik's *High Performance Browser Networking* (free at hpbn.co) and Barry Pollard's *HTTP/2 in Action* are the two best practitioner books.

## See also (other protocol episodes)

**HTTP/1.1 — the text protocol you can debug with netcat.** If you've heard the HTTP/1.1 episode, the contrast is everything: HTTP/2 trades curl-friendly readability for binary efficiency, multiplexing, and HPACK. HTTP/1.1 sends one request at a time per connection (six in parallel by browser convention); HTTP/2 sends hundreds on a single connection with concurrent streams and ~30–76% smaller headers. Use HTTP/1.1 when debuggability or legacy clients matter more than performance.

**HTTP/3 — the QUIC-based future.** HTTP/2 still suffers from TCP head-of-line blocking — one lost segment stalls every stream. HTTP/3 runs on QUIC over UDP with per-stream loss recovery, fixes connection migration, and folds TLS 1.3 into the transport handshake for 1-RTT or 0-RTT setup. Use HTTP/3 on lossy mobile networks; stay on HTTP/2 when middleboxes block UDP or your tooling is TCP-oriented.

**TCP — the byte stream HTTP/2 lives on.** HTTP/2 opens one TCP connection per origin and multiplexes everything onto it. That is a strength (one TLS handshake amortizes over hundreds of requests) and the protocol's defining weakness (one dropped segment stalls every stream). Cloudflare's posts on `tcp_notsent_lowat` and BBR for HTTP/2 prioritization are essential reading on this interaction.

**TLS — what makes h2 actually `h2`.** RFC 9113 §9.2 mandates TLS 1.2+ when ALPN is `h2`, with a long blacklist of weak cipher suites. ALPN (RFC 7301) is the TLS extension that lets the client offer `["h2", "http/1.1"]` and the server pick `h2` in the ServerHello — no extra round trips. Without ALPN, HTTP/2 has no deployment story.

**gRPC — typed RPC built on HTTP/2 framing.** gRPC is the reason `h2c` cleartext survives. Each RPC is one HTTP/2 stream: HEADERS for metadata, length-prefixed protobuf in DATA, HTTP/2 trailers for `grpc-status`. Use gRPC when you control both sides; use HTTP/2 with HTTP semantics when you don't. Every HTTP/2 CVE ripples through every gRPC stack.

**SSE — server-to-client streaming over HTTP.** SSE is just an HTTP response with `Content-Type: text/event-stream` and a long-lived body. Over HTTP/2 it works perfectly — better than over HTTP/1.1 because SSE no longer monopolizes one of the six TCP connections. It is one of the few patterns that gets straightforwardly *better* under HTTP/2; OpenAI, Anthropic, and Gemini all stream LLM tokens this way.

**WebSocket — bidirectional persistent channel.** Plain WebSockets bootstrap with `Upgrade: websocket` over HTTP/1.1. RFC 8441 introduced *Extended CONNECT* over HTTP/2: the server advertises `SETTINGS_ENABLE_CONNECT_PROTOCOL = 1`, the client sends a CONNECT with `:protocol = websocket`, and the resulting stream carries WebSocket frames. Use WebSocket for full-duplex chat, collaborative editing; use HTTP/2 alone for request-response patterns; use SSE for server-only push.

**REST — architectural style over HTTP, not a competing transport.** REST APIs run over HTTP/2 transparently and gain multiplexing, header compression, and (formerly) server push without any API changes. The complement, not the alternative.

**DASH and HLS — adaptive video over HTTP.** Both fetch playlists and media segments as HTTP requests, multiplexed by HTTP/2 on a single TCP connection instead of opening many parallel ones. Apple Low-Latency HLS originally required HTTP/2 Push and walked it back to `EXT-X-PRELOAD-HINT` in April 2020 after CDN-vendor backlash.

**GraphQL — a query language on top of HTTP/2 (or anything).** GraphQL queries are sent as HTTP/2 POST requests to a single endpoint; HTTP/2's multiplexing makes parallel queries cheap. Subscriptions can use SSE over HTTP/2 to compose with the rest of HTTP infrastructure.

## Visual cues for image generation

- A single fat TCP pipe split into many parallel coloured stream lines, each labelled with an odd Stream ID; HEADERS, DATA, and RST_STREAM frames interleave on the wire; one red TCP packet drop in the middle stalls every colour at once.
- A 9-byte HTTP/2 frame header dissected into Length / Type / Flags / R / Stream ID, with the ten frame-type names (DATA, HEADERS, PRIORITY, RST_STREAM, SETTINGS, PUSH_PROMISE, PING, GOAWAY, WINDOW_UPDATE, CONTINUATION) listed alongside.
- The 24-byte connection preface `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n` rendered as ASCII bytes, with the letters P-R-I-S-M highlighted to show the hidden word.
- Rapid Reset attack timeline: a clock counting up from 00:00, a stream-resets-per-second graph climbing past 200,000, and the labels "Cloudflare 201 Mrps · AWS 155 Mrps · Google 398 Mrps · botnet 22,000 nodes."
- HPACK in action: side-by-side bytes-on-wire for two requests carrying the same large `Cookie` header — first as a literal of ~800 bytes, second as a 1-byte index into the dynamic table.
- A side-by-side adoption pie chart for Q1 2026 Cloudflare-observed traffic: HTTP/1.1 ~28%, HTTP/2 ~51%, HTTP/3 ~21%.

## Sources

**RFCs.**

- [RFC 9113 — HTTP/2](https://datatracker.ietf.org/doc/rfc9113/)
- [RFC 7541 — HPACK](https://datatracker.ietf.org/doc/html/rfc7541)
- [RFC 9110 — HTTP Semantics](https://datatracker.ietf.org/doc/rfc9110/)
- [RFC 9111 — HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111)
- [RFC 9114 — HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 9204 — QPACK](https://datatracker.ietf.org/doc/html/rfc9204)
- [RFC 9218 — Extensible Prioritization Scheme for HTTP](https://www.rfc-editor.org/rfc/rfc9218.html)
- [RFC 8441 — Bootstrapping WebSockets with HTTP/2](https://datatracker.ietf.org/doc/html/rfc8441)
- [RFC 7301 — ALPN](https://datatracker.ietf.org/doc/html/rfc7301)
- [RFC 9460 — SVCB and HTTPS DNS records](https://datatracker.ietf.org/doc/rfc9460/)
- [RFC 9458 — Oblivious HTTP](https://datatracker.ietf.org/doc/rfc9458/)
- [draft-montenegro-httpbis-speed-mobility (Microsoft proposal)](https://datatracker.ietf.org/doc/html/draft-montenegro-httpbis-speed-mobility)

**Papers.**

- [Wang et al., "How Speedy is SPDY?" NSDI 2014](https://www.usenix.org/conference/nsdi14/technical-sessions/wang)
- [HTTP Archive 2024 Web Almanac — HTTP chapter](https://almanac.httparchive.org/en/2024/http)
- [HTTP Archive 2025 Web Almanac — CDN chapter](https://almanac.httparchive.org/en/2025/cdn)
- [TUM HTTP/2 measurements (NET 2024-04-1)](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf)

**Vendor and engineering blogs.**

- [Cloudflare — HTTP/2 Rapid Reset technical breakdown](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
- [Cloudflare — MadeYouReset thwarted by Rapid Reset mitigations](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)
- [Cloudflare — Adopting a new approach to HTTP prioritization](https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/)
- [Cloudflare — Better HTTP/2 prioritization for a faster web](https://blog.cloudflare.com/better-http-2-prioritization-for-a-faster-web/)
- [Cloudflare — HTTP/2 prioritization with NGINX](https://blog.cloudflare.com/http-2-prioritization-with-nginx/)
- [Cloudflare — NGINX structural enhancements for HTTP/2 performance](https://blog.cloudflare.com/nginx-structural-enhancements-for-http-2-performance/)
- [Cloudflare — Delivering HTTP/2 upload speed improvements](https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/)
- [Cloudflare — Open-sourcing our NGINX HTTP/2 + SPDY code](https://blog.cloudflare.com/open-sourcing-our-nginx-http-2-spdy-code/)
- [Cloudflare — HTTP/3 usage one year on](https://blog.cloudflare.com/http3-usage-one-year-on/)
- [Cloudflare Radar 2025 Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/)
- [Google Cloud — How the novel HTTP/2 Rapid Reset DDoS attack works](https://cloud.google.com/blog/products/identity-security/how-it-works-the-novel-http2-rapid-reset-ddos-attack)
- [Google Cloud — Largest DDoS attack peaking above 398 million rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps)
- [Google Research — A 2x Faster Web (SPDY launch)](https://research.google/blog/a-2x-faster-web/)
- [Chrome — Removing HTTP/2 Server Push](https://developer.chrome.com/blog/removing-push)
- [Mark Nottingham — Strengthening HTTP: A Personal View](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)
- [Evert Pot — HTTP/2 push is dead](https://evertpot.com/http-2-push-is-dead/)
- [Daniel Stenberg — http3 explained](https://daniel.haxx.se/http3-explained/)
- [HAProxy — not affected by Rapid Reset](https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487)
- [Bartek Nowotarski — HTTP/2 CONTINUATION Flood technical details](https://nowotarski.info/http2-continuation-flood-technical-details/)
- [Snyk — Exploiting HTTP/2 CONTINUATION frames](https://snyk.io/blog/exploiting-http-2-continuation-frames-dos-attacks/)
- [Checkmarx — HTTP/2 CONTINUATION Flood](https://checkmarx.com/blog/what-you-should-know-http-2-continuation-flood-vulnerability/)
- [Qualys — CVE-2023-44487 HTTP/2 Rapid Reset](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
- [Microsoft — Azure Application Gateway protection against MadeYouReset](https://techcommunity.microsoft.com/blog/azurenetworksecurityblog/azure-application-gateway-protection-against-cve-2025-8671-madeyoureset/4452921)
- [APNIC — Use of HTTPS resource records](https://blog.apnic.net/2023/12/18/use-of-https-resource-records/)
- [Zuplo — Enhancing API performance with HTTP/2 and HTTP/3](https://zuplo.com/learning-center/enhancing-api-performance-with-http-2-and-http-3-protocols)
- [The New Stack — HTTP/3 in the wild](https://thenewstack.io/http-3-in-the-wild-why-it-beats-http-2-where-it-matters-most/)
- [http.dev — the PRI method explained](https://http.dev/pri)
- [John Graham-Cumming — The secret message hidden in every HTTP/2 connection](https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html)

**News and security advisories.**

- [The Hacker News — New HTTP/2 vulnerability exposes web servers](https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html)
- [CERT/CC VU#421644 — HTTP/2 CONTINUATION Flood](https://kb.cert.org/vuls/id/421644)
- [CERT/CC VU#767506 — MadeYouReset](https://kb.cert.org/vuls/id/767506)
- [CISA — HTTP/2 Rapid Reset advisory](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
- [NVD — CVE-2023-44487](https://nvd.nist.gov/vuln/detail/CVE-2023-44487)
- [NVD — CVE-2016-6309 (OpenSSL)](https://nvd.nist.gov/vuln/detail/CVE-2016-6309)
- [GBHackers — HTTP/2 MadeYouReset](https://gbhackers.com/http-2-madeyoureset-vulnerability/)
- [SecurityAffairs — HTTP/2 CONTINUATION Flood attack](https://securityaffairs.com/161520/security/http-2-continuation-flood-attack.html)
- [python-hyper — CVE-2016-6581 HPACK Bomb](https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html)
- [Netflix security bulletin — CVE-2019-9511 family](https://github.com/netflix/security-bulletins/blob/master/advisories/third-party/2019-002.md)
- [OpenSSL security advisory 20160926](https://www.openssl.org/news/secadv/20160926.txt)

**Wikipedia.**

- [Wikipedia — HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)
- [Wikipedia — HTTP/2 Server Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)
- [Wikipedia — HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- [Wikipedia — SPDY](https://en.wikipedia.org/wiki/SPDY)
- [Wikipedia — nghttp2](https://en.wikipedia.org/wiki/Nghttp2)
- [Wikipedia — Application-Layer Protocol Negotiation](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation)
- [Wikipedia — Oblivious HTTP](https://en.wikipedia.org/wiki/Oblivious_HTTP)
- [Wikipedia — HTTP Speed+Mobility](https://en.wikipedia.org/wiki/HTTP_Speed+Mobility)
