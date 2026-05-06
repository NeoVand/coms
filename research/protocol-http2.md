---
prompt_source: deep-research-prompts.txt:3031-3211 (HTTP/2)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/497c0d1d-85d6-49d2-8518-d64e3bfb611c
research_mode: claude.ai Research
---

# HTTP/2 in 2026: A Deep Educational Resource

> A practitioner-grade guide for engineers — built from RFCs, working-group history, post-mortems, and 2024–2026 telemetry. Every concept is defined; every claim is sourced.

---

## 1. Prerequisites and glossary

Before HTTP/2 makes sense, the following building blocks have to be solid. Each entry is a one- or two-sentence working definition with a primary source.

**OSI / TCP-IP layers.** A conceptual stack where each layer adds responsibility on top of the one below: physical, link, network (IP), transport (TCP/UDP), and application (HTTP). HTTP/2 lives at the application layer and rides directly on a single TCP+TLS connection. (See Cloudflare's overview at [https://www.cloudflare.com/learning/network-layer/what-is-the-osi-model/](https://www.cloudflare.com/learning/network-layer/what-is-the-osi-model/).)

**Socket.** The OS-level endpoint of a network connection identified by `(IP, port, protocol)`. Browsers historically opened up to six TCP sockets per origin under HTTP/1.1; HTTP/2 collapses this to one. (See MDN, [https://developer.mozilla.org/en-US/docs/Glossary/TCP_handshake](https://developer.mozilla.org/en-US/docs/Glossary/TCP_handshake).) [Toolkit](https://toolkit.whysonil.dev/simulators/http2-streams/)

**Header.** A name/value field carried in each HTTP request or response — e.g. `Cookie`, `User-Agent`. Compression of these is the single biggest size win in HTTP/2 vs 1.1 (RFC 7541, [https://datatracker.ietf.org/doc/html/rfc7541](https://datatracker.ietf.org/doc/html/rfc7541)).

**Checksum.** A short value computed over a payload to detect corruption. TCP has a 16-bit checksum; TLS adds cryptographic integrity (AEAD tags) on top.

**Handshake.** The opening exchange that sets up a connection. For HTTPS HTTP/2 in 2026, this is TCP three-way handshake → TLS 1.2/1.3 handshake (with ALPN selecting `h2`) → HTTP/2 connection preface (RFC 9113 §3.4, [https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/)).

**Stream.** In HTTP/2, an independent, bidirectional flow of frames within one TCP connection, identified by a 31-bit Stream ID. Client-initiated streams use odd IDs; server-initiated (push) streams use even IDs. Stream 0 is reserved for connection-level control (RFC 9113 §5). [TUM](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf)

**Frame.** The smallest unit on the HTTP/2 wire: a 9-byte header (Length 24-bit, Type 8-bit, Flags 8-bit, Reserved 1-bit, Stream ID 31-bit) plus a payload (RFC 9113 §4.1). [Clehaxze](https://clehaxze.tw/gemlog/2023/12-02-status-report-building-the-http2-client-for-drogon.gmi)

**Datagram.** A self-contained packet. UDP and QUIC carry datagrams; TCP and HTTP/2 do not.

**Multiplexing.** Interleaving frames from many streams over one connection so that requests and responses don't queue behind each other. Core HTTP/2 capability (RFC 9113 §1, [https://www.rfc-editor.org/info/rfc9113](https://www.rfc-editor.org/info/rfc9113)).

**Head-of-line (HoL) blocking.** A blocked unit at the front of a queue stalls everything behind it. HTTP/1.1 has *application-layer* HoL blocking (one request per connection at a time). HTTP/2 fixes that but inherits *TCP-layer* HoL blocking — a single dropped TCP segment stalls every multiplexed stream until retransmission. HTTP/3 is what finally fixes that (RFC 9114 abstract, [https://datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114)). [Wikipedia](https://en.wikipedia.org/wiki/HTTP/2)

**Round-trip time (RTT).** The time for a packet to travel to the peer and back. Reducing RTTs (by reusing connections, by 0-RTT TLS) is the dominant performance lever of HTTP/2 and HTTP/3.

**MTU (Maximum Transmission Unit).** Largest IP packet a link will carry without fragmentation; typically 1500 bytes on Ethernet. HTTP/2 frames may be much larger and are segmented by TCP.

**Window / flow control.** A receiver-advertised credit (in bytes) limiting how much data a sender may send before being acknowledged. HTTP/2 has *two* layers of flow control on top of TCP's: per-stream and per-connection, both starting at a 65,535-byte default and adjusted via `WINDOW_UPDATE` frames (RFC 9113 §5.2 and §6.9).

**Binary vs text protocol.** HTTP/1.1 is text framed by CRLF; HTTP/2 is a binary protocol with fixed-length frame headers. Binary parsers are simpler, faster, and less ambiguous.

**Huffman coding.** A variable-length entropy coding where frequent symbols get shorter codes. HPACK uses a fixed Huffman code optimized for HTTP header characters (RFC 7541 Appendix B, [https://www.rfc-editor.org/rfc/rfc7541.html](https://www.rfc-editor.org/rfc/rfc7541.html)).

**TLS 1.2 / 1.3.** Cryptographic transport security. TLS 1.3 (RFC 8446) reduces the handshake to a single RTT and removes weak primitives. HTTP/2 in browsers requires TLS 1.2+ and applies a cipher-suite blacklist (RFC 9113 §9.2.2, Appendix A). [Medium](https://cabulous.medium.com/http-2-and-how-it-works-9f645458e4b2)

**ALPN — Application-Layer Protocol Negotiation.** A TLS extension (RFC 7301, [https://datatracker.ietf.org/doc/html/rfc7301](https://datatracker.ietf.org/doc/html/rfc7301)) where the client offers protocol identifiers (`h2`, `http/1.1`, `h3`) inside the ClientHello and the server picks one inside the ServerHello — *no extra round trips*. The HTTP/2 token is `h2`; the cleartext variant is `h2c`. [Trustico](https://shop.trustico.com/blogs/stories/understanding-application-layer-protocol-negotiation-alpn-in-the-ssl-tls-handshake)[RFC Editor](https://www.rfc-editor.org/rfc/rfc7301.html)

**HPACK.** The HTTP/2 header-compression format (RFC 7541): a 61-entry static table of common header fields, a per-connection dynamic table, integer encoding with N-bit prefixes, and Huffman-coded literals. Designed in direct response to CRIME/BREACH-style attacks on gzip-compressed headers.

**QUIC.** A UDP-based, encrypted, multiplexed transport (RFC 9000) that replaces the TCP+TLS stack underneath HTTP/3.

**Pseudo-header.** HTTP/2's reserved request/response fields beginning with `:` — `:method`, `:scheme`, `:authority`, `:path`, `:status`, plus the Extended-CONNECT `:protocol` (RFC 9113 §8.3, RFC 8441 §4).

---

## 2. History and story

**Origins (2009–2012).** Mike Belshe and Roberto Peon at Google announced SPDY ("speedy") on the Chromium and Google Research blogs on 12 November 2009, framing it as an experimental application-layer protocol aimed at a 50 % page-load reduction via multiplexing, header compression, request prioritization, and TLS-by-default ([https://research.google/blog/a-2x-faster-web/](https://research.google/blog/a-2x-faster-web/)). The original lab tests used the top 25 sites and produced "up to 55% faster" page loads. SPDY was deployed in Chrome 6 in September 2010 and across Google services in January 2011, and was picked up by Mozilla (Firefox 13), Twitter (March 2012), nginx, Apache (`mod_spdy`), and F5 ([https://en.wikipedia.org/wiki/SPDY](https://en.wikipedia.org/wiki/SPDY)). [Google Research + 2](https://research.google/blog/a-2x-faster-web/)

**The HTTPbis Working Group.** The IETF HTTPbis WG, chaired by Mark Nottingham (Akamai/Fastly) since 2007, issued a Call for Proposals in 2012 to replace HTTP/1.1. Three serious proposals arrived: Google's SPDY; Microsoft's *HTTP Speed+Mobility* (Gabriel Montenegro et al., draft-montenegro-httpbis-speed-mobility, [https://datatracker.ietf.org/doc/html/draft-montenegro-httpbis-speed-mobility](https://datatracker.ietf.org/doc/html/draft-montenegro-httpbis-speed-mobility)) — itself based on SPDY but with explicit attention to mobile battery, optional rather than mandatory features, and WebSockets-style framing; and Network-Friendly HTTP Upgrade ([https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)). After a Facebook-recommended convergence in July 2012, the WG adopted SPDY as the starting draft in November 2012. [IETF Datatracker + 3](https://datatracker.ietf.org/person/mnot@mnot.net)

**Key people.** Editors and major contributors of the HTTP/2 specs: Mark Nottingham (chair, [https://datatracker.ietf.org/person/mnot@mnot.net](https://datatracker.ietf.org/person/mnot@mnot.net)), Martin Thomson (Mozilla, RFC 7540 / RFC 9113 editor), Cory Benfield (Apple, RFC 9113 co-editor), Roberto Peon (Google → Facebook, HPACK co-author), Hervé Ruellan (Canon, HPACK co-author), Patrick McManus (Mozilla, RFC 8441 author), Will Chan and Ryan Hamilton (Google), Daniel Stenberg (curl, http2/http3 explained authors), and Mike Belshe (originally Google, RFC 7540 co-author).

**Politics: the TLS-only debate.** Browser vendors (Firefox and Chrome) declared they would only implement HTTP/2 over TLS, but the IETF could not "require" TLS in the standard without rough consensus, which it didn't have. Nottingham's January 2014 post "Strengthening HTTP: A Personal View" ([https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)) lays this out: the WG documented `h2c` (cleartext) but de facto, browsers only ever implemented `h2` over TLS. Poul-Henning Kamp publicly objected to the protocol's complexity and the rushed schedule (Wikipedia, [https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)). The "encrypt everything" stance was reinforced by RFC 7258 ("Pervasive Monitoring Is an Attack") and shaped HTTP/2's deployment. [Mark Nottingham + 2](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)

**Milestones.**

- May 14, 2015: **RFC 7540** (HTTP/2) and **RFC 7541** (HPACK) published. Editors: Belshe (BitGo), Peon (Google), Thomson (Mozilla). [https://datatracker.ietf.org/doc/html/rfc7540](https://datatracker.ietf.org/doc/html/rfc7540) and [https://datatracker.ietf.org/doc/html/rfc7541](https://datatracker.ietf.org/doc/html/rfc7541). [Tech Invite](https://www.tech-invite.com/y75/tinv-ietf-rfc-7540.html)
- February 2020: **RFC 8740** updates HTTP/2 for TLS 1.3.
- **June 6, 2022**: **RFC 9113** publishes (Thomson, Benfield), obsoleting RFCs 7540 and 8740 and folding in the TLS 1.3 update; the same day, the WG ships RFC 9110 (Semantics, STD 97), RFC 9111 (Caching, STD 98), RFC 9112 (HTTP/1.1, STD 99), RFC 9114 (HTTP/3), RFC 9204 (QPACK) and RFC 9218 (Extensible Priorities). HTTP semantics are now version-independent. Crucially, **RFC 9113 deprecates the original RFC 7540 priority tree** because "the prioritization signaling in RFC 7540 was not successful" (RFC 9113 §5.3.2, [https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/)). [W3C + 5](https://lists.w3.org/Archives/Public/ietf-http-wg/2022AprJun/0135.html)

**What has fundamentally changed in the last 24 months (2024–2026).**

1. **Server Push is gone from browsers.** Chrome 106 (October 2022) disabled HTTP/2 Server Push by default; only ~1.25 % of HTTP/2 sites had ever used it ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)). Firefox 132 (October 29, 2024) removed support entirely. As of 2026 *no major browser* implements HTTP/2 Server Push ([https://en.wikipedia.org/wiki/HTTP/2_Server_Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)). The replacement pattern for the original use case is the `103 Early Hints` informational status combined with `Link: rel=preload`. [Chrome Developers + 2](https://developer.chrome.com/blog/removing-push)
2. **CVE-2023-44487 "Rapid Reset"** (10 October 2023) — Cloudflare absorbed an attack peaking at 201 Mrps, AWS at 155 Mrps, and Google at **398 Mrps** ([https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps)), the largest L7 DDoS ever recorded. Mitigations are now baked into every major server. [Qualys](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
3. **CVE-2024-27316 "HTTP/2 CONTINUATION Flood"** (April 3, 2024) — disclosed by Bartek Nowotarski via CERT/CC, hitting Apache httpd, Apache Tomcat (CVE-2024-24549), Apache Traffic Server (CVE-2024-31309), Envoy (CVE-2024-27919, CVE-2024-30255), Node.js (CVE-2024-27983), Go net/http (CVE-2023-45288), nghttp2 (CVE-2024-28182), AMPHP (CVE-2024-2653) and Tempesta FW (CVE-2024-2758). [https://kb.cert.org/vuls/id/421644](https://kb.cert.org/vuls/id/421644) / [https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html](https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html). [The Hacker News](https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html)
4. **CVE-2025-8671 "MadeYouReset"** — disclosed August 13, 2025 by Gal Bar Nahum, Anat Bremler-Barr, and Yaniv Harel of Tel Aviv University with Imperva. The attacker uses *malformed* WINDOW_UPDATE / PRIORITY / DATA frames to make the server send `RST_STREAM` against itself, bypassing post-Rapid-Reset client-reset rate limits. Affects Apache Tomcat, Netty, Varnish, F5, Fastly, AMPHP, Eclipse, Mozilla services, gRPC, Wind River, SUSE, Zephyr; Cloudflare and Akamai were not exposed. [https://kb.cert.org/vuls/id/767506](https://kb.cert.org/vuls/id/767506) / [https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/). [GBHackers + 3](https://gbhackers.com/http-2-madeyoureset-vulnerability/)
5. **RFC 9218 "Extensible Prioritization Scheme for HTTP"** (June 2022; deployed widely 2023–2025) — Kazuho Oku (Fastly) and Lucas Pardue (Cloudflare) replaced the failed RFC 7540 dependency tree with a simple `Priority:` header carrying `urgency` (0–7) and `incremental` flags, plus `PRIORITY_UPDATE` frames. Cloudflare reports up to 37 % faster page loads when enabled ([https://www.rfc-editor.org/rfc/rfc9218.html](https://www.rfc-editor.org/rfc/rfc9218.html)). [IETF](https://datatracker.ietf.org/doc/rfc9218/)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9218.html)
6. **Continued HTTP/3 displacement.** HTTP Archive's 2024 Web Almanac reports HTTP/1.1 is now used for only 21–22 % of home-page requests, down from 34 % in 2022 ([https://almanac.httparchive.org/en/2024/http](https://almanac.httparchive.org/en/2024/http)). Cloudflare Radar's 2025 Year in Review shows HTTP/2 and HTTP/3 both grew slightly across the year and HTTP/2 remains the plurality of all CDN traffic ([https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/)). W3Techs (April 2026) reports HTTP/2 used by ~35 % of the surveyed Web and HTTP/3 by ~38.8 % — but the W3Techs HTTP/3 number means *advertisement* of HTTP/3 via `alt-svc`/HTTPS records, not actual negotiated traffic, which the 2024 Almanac estimates near 30 %. ([https://w3techs.com/technologies/details/ce-http2](https://w3techs.com/technologies/details/ce-http2), [https://w3techs.com/technologies/details/ce-http3](https://w3techs.com/technologies/details/ce-http3).) [Httparchive + 4](https://almanac.httparchive.org/en/2024/http)

---

## 3. How it actually works

### 3.1 Connection bootstrap

After TCP and TLS, the client sends a 24-byte **connection preface** consisting of the literal ASCII bytes:

```
0x505249202a20485454502f322e300d0a0d0a534d0d0a0d0a
= "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n"
```

This was deliberately chosen to look like an unrecognized HTTP/1.1 method ("PRI") so legacy servers respond with `405`/`501` rather than crashing on binary data (RFC 9113 §3.4; explainer at [https://http.dev/pri](https://http.dev/pri)). The `PRI` method is registered as safe and idempotent and "is never used by an actual client." Both peers MUST follow up immediately with a `SETTINGS` frame. [HTTP + 2](https://http.dev/pri)

### 3.2 Framing layer

```
+-----------------------------------------------+
|                Length (24)                    |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+-------------------------------+
|R|                  Stream Identifier (31)                     |
+=+=============================================================+
|                   Frame Payload (0...Length)               ...|
+---------------------------------------------------------------+
```

Total fixed header: 9 bytes. `Length` is the payload length (defaults max 16,384 bytes; up to 16,777,215 by negotiation). `R` is reserved and MUST be zero (RFC 9113 §4.1).

### 3.3 Frame types

| Type | Hex | Purpose | Sent when |
|---|---|---|---|
| DATA | 0x0 | Application body bytes | Streaming request/response payloads |
| HEADERS | 0x1 | Header block, opens/uses a stream | Beginning of every request and response |
| PRIORITY | 0x2 | RFC 7540 priority signal — **deprecated in RFC 9113** | Largely ignored; retained for backward-compat parsing |
| RST_STREAM | 0x3 | Abort one stream | Cancellation, protocol error, end-user navigation away |
| SETTINGS | 0x4 | Connection-level parameters | First frame on each side; on every parameter change |
| PUSH_PROMISE | 0x5 | Server-initiated request synth | **Effectively dead** — Chrome and Firefox don't accept |
| PING | 0x6 | Liveness / RTT probe (8-byte opaque) | Keep-alive, RTT measurement |
| GOAWAY | 0x7 | Initiate graceful connection shutdown | Server restart, protocol error, idle limits |
| WINDOW_UPDATE | 0x8 | Open flow-control window | Receiver consumed buffered data |
| CONTINUATION | 0x9 | Continue a header block (no `END_HEADERS`) | When headers exceed `MAX_FRAME_SIZE` |

Source: RFC 9113 §6 ([https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/)). Note that `CONTINUATION` is the protocol surface exploited by CVE-2024-27316.

### 3.4 Stream state machine

```
                          +--------+
                send PP → | idle   | ← recv PP
                          +--------+
                  send H /  |    \  recv H
                  recv PP ' v     v ' send PP
              +-----------+        +-----------+
              | reserved  |        | reserved  |
              | (local)   |        | (remote)  |
              +-----------+        +-----------+
                  | send H              | recv H
                  v                     v
              +-----------+        +-----------+
              |   half    |        |   half    |
              |  closed   |←—open—→|  closed   |
              | (remote)  |        | (local)   |
              +-----------+        +-----------+
                  |   ES/RS               ES/RS  |
                  v                              v
              +--------------------------------------+
              |              closed                  |
              +--------------------------------------+
```

(H = HEADERS, PP = PUSH_PROMISE, ES = END_STREAM flag, RS = RST_STREAM. Authoritative version: RFC 9113 §5.1.)

### 3.5 HPACK (RFC 7541)

- **Static table** — 61 hard-coded common header pairs: indices 1–61, including `:authority`, `:method GET`, `:method POST`, `:path /`, `:status 200`, `accept-encoding gzip, deflate`, `cookie`, `user-agent`, etc. Full list: [https://www.rfc-editor.org/rfc/rfc7541.html](https://www.rfc-editor.org/rfc/rfc7541.html). [Liu](http://pike.lysator.liu.se/docs/ietf/rfc/75/rfc7541.xml)
- **Dynamic table** — per-direction, per-connection FIFO of recently-seen header fields, sized by `SETTINGS_HEADER_TABLE_SIZE` (default 4,096 bytes, with 32-byte overhead per entry).
- **Integer encoding** — N-bit-prefix variable-length integers (RFC 7541 §5.1).
- **String literals** — either raw octets or Huffman-coded (the H bit on the length octet) using the static Huffman code in RFC 7541 Appendix B. [Tech Invite](https://www.tech-invite.com/y75/tinv-ietf-rfc-7541-2.html)
- **Representations** — Indexed Header Field, Literal With Indexing, Literal Without Indexing, Literal Never Indexed (for sensitive values), and Dynamic Table Size Update. [IETF](https://datatracker.ietf.org/doc/html/rfc7541)

Why HPACK exists: gzip-compressed headers in SPDY were vulnerable to **CRIME** (2012) and **BREACH** (2013), which deduce secrets by observing compressed length under attacker-chosen prefixes. HPACK keeps secret-bearing fields in literal/never-indexed form and explicitly evaluates this attack class (RFC 7541 §7).

### 3.6 Flow control

Two windows per direction:

- **Stream window** — credit on each individual stream.
- **Connection window** — credit on the whole TCP connection.

Both default to 65,535 bytes; only DATA frames consume window. The receiver replenishes credit by sending `WINDOW_UPDATE`. **Note: SETTINGS_INITIAL_WINDOW_SIZE only changes future streams' initial windows; the connection window is *only* adjustable via `WINDOW_UPDATE`.** Pathological-window attacks (CVE-2019-9511 "Data Dribble", CVE-2019-9517 "Internal Data Buffering") exploit this asymmetry. nghttp2 sends a `WINDOW_UPDATE` once half the window is consumed ([https://en.wikipedia.org/wiki/Nghttp2](https://en.wikipedia.org/wiki/Nghttp2)). [Wikipedia](https://en.wikipedia.org/wiki/Nghttp2)

### 3.7 Stream priorities

RFC 7540's tree-based dependency-and-weight model required clients and servers to maintain a directed graph of streams with relative weights and exclusivity flags. In practice it was implemented inconsistently and many servers ignored client signals (RFC 9113 §5.3.1). RFC 9113 retains parsing for compatibility but deprecates the semantics. **RFC 9218** is the modern replacement: an HTTP `Priority:` header (and a `PRIORITY_UPDATE` frame) carrying: [Cloudflare + 3](https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/)

- `u=0..7` — urgency, 0 highest, 3 default, 7 background;
- `i=?1` — incremental: render bytes as they arrive instead of needing the whole resource.

A server announces `SETTINGS_NO_RFC7540_PRIORITIES = 1` to indicate it ignores RFC 7540 signals ([https://www.rfc-editor.org/rfc/rfc9218.html](https://www.rfc-editor.org/rfc/rfc9218.html)). Cloudflare reported ~37 % page-load improvement for HTTP/3 Extensible Priorities in their Speed Week 2022 announcement ([https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/](https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/)).

### 3.8 Server Push

`PUSH_PROMISE` (frame type 0x5) is sent on a *client-initiated* stream; it carries a synthetic request (method, scheme, authority, path) and reserves an *even-numbered* server-initiated stream. The pushed response then arrives on that new stream. The client may reject with `RST_STREAM`. In practice, push competed with cache for bandwidth, often shipped resources the client already had, and never got a working "Cache-Digest" mechanism. Chrome's data showed a small mean improvement and a large variance with frequent regressions — Jake Archibald's blog post documents the failure ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)). Push was also never implemented on most HTTP/3 stacks. **By 2026 it is functionally dead in the browser.** [Wikipedia + 2](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)

### 3.9 SETTINGS parameters (RFC 9113 §6.5.2)

| Setting | Default | Practical guidance |
|---|---|---|
| `HEADER_TABLE_SIZE` (0x1) | 4096 | Cloudflare/Google use 4096 — raising helps repeated headers but wastes memory |
| `ENABLE_PUSH` (0x2) | 1 | Browsers send 0; servers should treat 0 as the only sane value in 2026 |
| `MAX_CONCURRENT_STREAMS` (0x3) | unlimited | Per Cloudflare's Rapid Reset post-mortem, browsers assume 100 even before SETTINGS arrives; [Cloudflare](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/) pick 100, then enforce hard caps in DDoS mitigation. Must be ≥100 to interoperate. |
| `INITIAL_WINDOW_SIZE` (0x4) | 65,535 | Many tunings raise to 6,291,456 (6 MiB) for high-BDP uploads (Cloudflare patch, [https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/](https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/)) |
| `MAX_FRAME_SIZE` (0x5) | 16,384 | Range 16 KiB – 16 MiB; raising helps for big DATA frames |
| `MAX_HEADER_LIST_SIZE` (0x6) | unlimited | **Set this** — 16 KiB to 64 KiB. Without it, attackers can OOM you (CVE-2024-27316 et al.) |
| `SETTINGS_ENABLE_CONNECT_PROTOCOL` (0x8) | 0 | Set to 1 to allow Extended CONNECT [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/84/rfc8441.xml) (RFC 8441 — WebSockets, WebTransport) [HTTP Documentation](https://httpwg.org/specs/rfc8441.html) |
| `SETTINGS_NO_RFC7540_PRIORITIES` (0x9) | 0 | Set to 1 if you only honor RFC 9218 priorities |

### 3.10 ALPN negotiation and h2c

In TLS 1.2/1.3 ClientHello, the client offers an ordered ALPN list — typically `["h2", "http/1.1"]`, possibly preceded by `"h3"` for QUIC. The server picks one in ServerHello (RFC 7301, [https://datatracker.ietf.org/doc/html/rfc7301](https://datatracker.ietf.org/doc/html/rfc7301)). The HTTP/2 token `h2` MUST only be selected when TLS 1.2+ with the cipher-suite blacklist is honored. [RFC Editor](https://www.rfc-editor.org/rfc/rfc7301.html)[IETF](https://datatracker.ietf.org/doc/html/rfc7301)

**`h2c` (HTTP/2 Cleartext)** was originally specified via the HTTP/1.1 `Upgrade: h2c` mechanism in RFC 7540. **RFC 9113 removes that Upgrade dance entirely** — RFC 9113 §3.3 only describes "Starting HTTP/2 with prior knowledge", meaning the client just sends the connection preface on a known-cleartext endpoint. Browsers do not implement either `h2c` mode; it survives only inside trusted networks (gRPC over plaintext, sidecar-to-sidecar service mesh).

### 3.11 Error codes (RFC 9113 §7)

| Code | Hex | Meaning |
|---|---|---|
| NO_ERROR | 0x00 | Graceful shutdown |
| PROTOCOL_ERROR | 0x01 | Generic protocol violation |
| INTERNAL_ERROR | 0x02 | Implementation fault |
| FLOW_CONTROL_ERROR | 0x03 | Peer violated flow control |
| SETTINGS_TIMEOUT | 0x04 | SETTINGS not ACKed in time |
| STREAM_CLOSED | 0x05 | Frame received on a half-closed/closed stream |
| FRAME_SIZE_ERROR | 0x06 | Frame larger than allowed |
| REFUSED_STREAM | 0x07 | Stream not processed at all (safe to retry) |
| CANCEL | 0x08 | Stream no longer needed (client navigated away) |
| COMPRESSION_ERROR | 0x09 | HPACK state corrupted — connection-fatal |
| CONNECT_ERROR | 0x0a | TCP CONNECT tunnel error |
| ENHANCE_YOUR_CALM | 0x0b | Rate-limit refusal |
| INADEQUATE_SECURITY | 0x0c | Negotiated TLS not strong enough |
| HTTP_1_1_REQUIRED | 0x0d | Use HTTP/1.1 instead |

### 3.12 On-the-wire example

```
# Client preface (24 bytes):
50 52 49 20 2a 20 48 54 54 50 2f 32 2e 30 0d 0a
0d 0a 53 4d 0d 0a 0d 0a

# SETTINGS frame (empty, ACK off):
00 00 00       # length = 0
04             # type = SETTINGS
00             # flags = 0
00 00 00 00    # stream id = 0

# HEADERS frame for GET / (after HPACK indexing):
00 00 0d       # length = 13
01             # type = HEADERS
05             # flags = END_HEADERS | END_STREAM
00 00 00 01    # stream id = 1
82 86 84 41 0a 65 78 61 6d 70 6c 65 2e 63 6f 6d
# 0x82 = idx 2 (:method GET), 0x86 = idx 6 (:scheme http),
# 0x84 = idx 4 (:path /), 0x41 = literal :authority + indexed name 1,
# 0x0a = length 10, then "example.com"
```

(Adapted from RFC 7541 §C.3 and RFC 9113 §3.4; matches what Wireshark labels as "Magic" + "SETTINGS" + "HEADERS".)

### 3.13 End-to-end Mermaid sequence diagram

ServerClientServerClient#mermaid-rhv{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rhv .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rhv .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rhv .error-icon{fill:#CC785C;}#mermaid-rhv .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rhv .edge-thickness-normal{stroke-width:1px;}#mermaid-rhv .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rhv .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rhv .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rhv .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rhv .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rhv .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rhv .marker.cross{stroke:#A1A1A1;}#mermaid-rhv svg{font-family:inherit;font-size:16px;}#mermaid-rhv p{margin:0;}#mermaid-rhv .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rhv text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rhv .actor-line{stroke:#A1A1A1;}#mermaid-rhv .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rhv .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rhv #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rhv .sequenceNumber{fill:#5e5e5e;}#mermaid-rhv #sequencenumber{fill:#E5E5E5;}#mermaid-rhv #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rhv .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rhv .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rhv .labelText,#mermaid-rhv .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rhv .loopText,#mermaid-rhv .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rhv .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rhv .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rhv .noteText,#mermaid-rhv .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rhv .activation0{fill:transparent;stroke:#00000000;}#mermaid-rhv .activation1{fill:transparent;stroke:#00000000;}#mermaid-rhv .activation2{fill:transparent;stroke:#00000000;}#mermaid-rhv .actorPopupMenu{position:absolute;}#mermaid-rhv .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rhv .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rhv .actor-man circle,#mermaid-rhv line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rhv :root{--mermaid-font-family:inherit;}TCP three-way handshake (port 443)TLS 1.3 handshake with ALPNHTTP/2 startsReuse for many more streams ...SYNSYN, ACKACKClientHello { ALPN: [h2, http/1.1], cipher suites, key share }ServerHello { ALPN: h2 } + EncryptedExtensions + Certificate + FinishedFinishedConnection preface "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n"SETTINGS { MAX_CONCURRENT_STREAMS=100, INITIAL_WINDOW_SIZE=6MiB }SETTINGS { MAX_HEADER_LIST_SIZE=32KiB, ... }SETTINGS ACKSETTINGS ACKHEADERS (stream 1, END_HEADERS, END_STREAM) — :method GET :path /HEADERS (stream 1, END_HEADERS) — :status 200, content-type, ...DATA (stream 1) — body chunkDATA (stream 1, END_STREAM) — last body chunkWINDOW_UPDATE (stream 0, +N) — replenish connection windowGOAWAY (last_stream_id=N, NO_ERROR) — graceful closeTCP FIN

---

## 4. Deep connections to other protocols

**HTTP/1.1 (RFC 9112).** HTTP/2 preserves the *semantics* of HTTP — methods, status codes, headers, caching — and only changes the wire format. RFC 9110 (HTTP Semantics, June 2022, STD 97) was extracted exactly to make this version-independence explicit ([https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/)). What HTTP/2 replaces is HTTP/1.1's request line + CRLF text framing and its 6-connection workaround for parallelism. HTTP/1.1 pipelining never worked reliably because of head-of-line blocking and middlebox interference; HTTP/2 multiplexing is the proper fix. [IETF](https://datatracker.ietf.org/doc/rfc9110/)

**HTTP/3 (RFC 9114).** HTTP/3 ports HTTP semantics to QUIC. It eliminates TCP-level HoL blocking because each QUIC stream has independent loss recovery ([https://datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114)). HPACK is replaced by **QPACK (RFC 9204)** which uses dedicated unidirectional encoder/decoder streams to keep tables synchronized despite out-of-order delivery ([https://datatracker.ietf.org/doc/html/rfc9204](https://datatracker.ietf.org/doc/html/rfc9204)). ALPN token: `h3`. Discovery: either `Alt-Svc` headers (RFC 7838) or, increasingly, **HTTPS DNS records (RFC 9460)** which embed `alpn=h3` and IP hints directly in DNS, removing the first-load HTTP/2 fallback round trip. [RFC Editor + 3](https://www.rfc-editor.org/info/rfc9114)

**TCP.** HTTP/2 lives on a single TCP connection. This is a strength (one TLS handshake amortizes over hundreds of requests; HPACK's dynamic table accumulates value) and the protocol's defining weakness (one dropped segment freezes every stream). Also, TCP has no notion of HTTP "streams", so the kernel and middleboxes treat the whole flow as one — limiting how aggressively a server can prioritize. Cloudflare's posts on `tcp_notsent_lowat` and BBR for HTTP/2 prioritization ([https://blog.cloudflare.com/http-2-prioritization-with-nginx/](https://blog.cloudflare.com/http-2-prioritization-with-nginx/)) are essential reading on this interaction.

**TLS.** RFC 9113 §9.2 mandates TLS 1.2+ when ALPN is `h2`, with a long blacklist of weak cipher suites in Appendix A (RC4, CBC-mode SHA-1, etc.). RFC 8740 added the TLS 1.3 update; that is now folded into 9113. Browsers also forbid renegotiation while in HTTP/2.

**gRPC.** gRPC is built directly on HTTP/2 framing. It uses HEADERS (with `:method = POST`, `:path = /package.Service/Method`, `content-type: application/grpc`), DATA (with a 5-byte length-prefixed message), and HTTP/2 trailers (a HEADERS frame with `END_STREAM` carrying `grpc-status`, `grpc-message`). Server-streaming and bidi-streaming map to keeping the stream open in one or both directions. gRPC's well-known status codes (`OK=0`, `INVALID_ARGUMENT=3`, `NOT_FOUND=5`, `RESOURCE_EXHAUSTED=8`, `UNAVAILABLE=14`) are independent of HTTP status. gRPC's cleartext mode `h2c` is the reason `h2c` survives at all. (Reference: gRPC's protocol doc at [https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md).)

**Server-Sent Events (SSE).** SSE is just an HTTP response with `Content-Type: text/event-stream` and a long-lived body. Over HTTP/2 it works perfectly — better than over HTTP/1.1 because SSE no longer monopolizes one of the six TCP connections. It is one of the few streaming patterns that gets straightforwardly *better* under HTTP/2.

**WebSockets (RFC 6455 + RFC 8441).** Plain WebSockets bootstrap with a `GET` + `Upgrade: websocket` over HTTP/1.1 — that handshake doesn't exist in HTTP/2. **RFC 8441 (Patrick McManus, Mozilla, September 2018)** introduces *Extended CONNECT*: the server advertises `SETTINGS_ENABLE_CONNECT_PROTOCOL = 1`, the client sends a `CONNECT` request bearing a `:protocol = websocket` pseudo-header, and the resulting HTTP/2 stream then carries WebSocket frames as if it were a TCP socket ([https://datatracker.ietf.org/doc/html/rfc8441](https://datatracker.ietf.org/doc/html/rfc8441)). RFC 9220 extends the same pattern to HTTP/3. Browser support is in Firefox and Chrome but as of 2026 still has rough edges around proxies ([https://bugzilla.mozilla.org/show_bug.cgi?id=1434137](https://bugzilla.mozilla.org/show_bug.cgi?id=1434137)). [Liu + 2](https://pike.lysator.liu.se/docs/ietf/rfc/84/rfc8441.xml)

**HPACK (RFC 7541).** Companion document — see §3.5.

**QUIC (RFC 9000).** UDP-based encrypted multiplexed transport. Built-in TLS 1.3, 0-RTT resumption, connection migration via Connection IDs, per-stream loss recovery. It is the foundation of HTTP/3 and where new transport-level innovation now happens (multipath QUIC, MASQUE, WebTransport).

**ALPN (RFC 7301).** See §1 and §3.10. The HTTP/2 deployment story doesn't work without it — there is no other way for the server to know to switch to binary framing inside a single TLS handshake.

**Alt-Svc (RFC 7838) and HTTPS DNS records (RFC 9460).** `Alt-Svc: h3=":443"; ma=86400` lets a server advertise that the same origin is also reachable via HTTP/3, prompting the client to upgrade on subsequent loads. HTTPS records (DNS RR type 65, [https://datatracker.ietf.org/doc/rfc9460/](https://datatracker.ietf.org/doc/rfc9460/)) move that hint into DNS so the *first* request can already be HTTP/3. By December 2023 about 4 % of second-level domains had HTTPS records and ~25 % of the Tranco top-1M ([https://blog.apnic.net/2023/12/18/use-of-https-resource-records/](https://blog.apnic.net/2023/12/18/use-of-https-resource-records/)). [RFCinfo](https://rfcinfo.com/rfc-9460/)[APNIC Blog](https://blog.apnic.net/2023/12/18/use-of-https-resource-records/)

---

## 5. Real-world deployment

**Reference C/C++ implementations.**

- **nghttp2** (Tatsuhiro Tsujikawa) — the canonical C library, forked from `spdylay`. Powers Apache `mod_http2`, curl, Envoy's classic codec, and many language bindings. Ships `nghttpd`, `nghttpx`, `nghttp`, and the `h2load` benchmark ([https://nghttp2.org/](https://nghttp2.org/)). Latest releases through 2025 add HTTP/3 via ngtcp2 and have hardened against MadeYouReset. [GitHub + 2](https://github.com/nghttp2/nghttp2)
- **h2o** (Kazuho Oku, Fastly) — high-performance HTTP/1.1/2/3 server originally used by Fastly's edge.

**Web servers.**

- **Apache HTTP Server** ships HTTP/2 via `mod_http2` (since 2.4.17, October 2015). CVE-2024-27316 patched in 2.4.59. [Toolkit](https://toolkit.whysonil.dev/simulators/http2-streams/)[Windows Forum](https://windowsforum.com/threads/cve-2024-27316-apache-httpd-http-2-dos-and-azure-linux-attestation.401633/)
- **NGINX** added HTTP/2 in 1.9.5 (October 2015). Cloudflare maintained an out-of-tree HTTP/2 + SPDY patch and now ships its own Rust replacement (Pingora, public 2022; in 2025 announced replacing NGINX entirely on Cloudflare's edge — [https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/)). [Toolkit](https://toolkit.whysonil.dev/simulators/http2-streams/)[Cloudflare](https://blog.cloudflare.com/open-sourcing-our-nginx-http-2-spdy-code/)
- **Caddy** (Go) — HTTP/2 and HTTP/3 by default with automated TLS.
- **Microsoft IIS** — HTTP/2 since Windows Server 2016; HTTP/3 since Server 2022 ann. [Toolkit](https://toolkit.whysonil.dev/simulators/http2-streams/)
- **Cloudflare** — Pingora (Rust), Quiche (Rust QUIC/HTTP3), `lighttpd` legacy. Pingora's HTTP/2 uses the Rust `h2` crate, which received a MadeYouReset patch in `h2` 0.4.11. [Cloudflare](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)

**Proxies & meshes.**

- **Envoy** — HTTP/2 (nghttp2-based and the new `oghttp` codec) and HTTP/3 via quiche. Patches: CVE-2024-27919, CVE-2024-30255 (CONTINUATION flood) in 1.26.8 / 1.27.4 / 1.28.2 / 1.29.3. [Checkmarx](https://checkmarx.com/blog/what-you-should-know-http-2-continuation-flood-vulnerability/)
- **HAProxy** — added rate-limiting changes in 1.9 (2018) that incidentally protected it from Rapid Reset ([https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487](https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487)).
- **Traefik, Linkerd, Istio (Envoy-based).**

**Language stdlibs and frameworks.**

- Go `net/http` and `golang.org/x/net/http2` — HTTP/2 since 1.6 (Feb 2016). CVE-2023-45288 patched in 1.21.9 / 1.22.2 / `x/net` 0.23.0. [Toolkit](https://toolkit.whysonil.dev/simulators/http2-streams/)[Checkmarx](https://checkmarx.com/blog/what-you-should-know-http-2-continuation-flood-vulnerability/)
- Java — `java.net.http` (JDK 11+) supports HTTP/2 natively; **Netty** (4.1.x) is the workhorse for Vert.x/Spring Reactor; **Jetty** ships HTTP/2 + ALPN; Akka HTTP.
- Rust — **Hyper**, the **`h2` crate** (Cloudflare-maintained).
- Python — `aiohttp` with `hyper-h2` / `h2` library (Cory Benfield's python-hyper org), `httpx`, `Twisted`'s HTTP/2 plugin.
- Node.js — built-in `http2` module since 8.4 (RFC 8441 since v15 — [https://github.com/nodejs/node/pull/23284](https://github.com/nodejs/node/pull/23284)). CVE-2024-27983 patched. [GitHub](https://github.com/nodejs/node/commit/7b327ea909)
- .NET — `System.Net.Http.HttpClient` supports HTTP/2 since .NET Core 3.0; HTTP/3 since .NET 6 (preview)/7 (GA).

**Who deploys at scale.** Google, Cloudflare, Akamai, Fastly, AWS CloudFront, Meta/Facebook, Netflix, Twitter/X, GitHub, LinkedIn — all default to HTTP/2 and increasingly HTTP/3 to clients, with HTTP/2 (often) or HTTP/1.1 (still common) to origins. The 2024 Web Almanac chapter (Marx, Pollard, Böttger; doi:10.5281/zenodo.14065825) shows CDN-fronted requests are 96 % HTTP/2+, and only 21–22 % of home pages are HTTP/1.1 in 2024 ([https://almanac.httparchive.org/en/2024/http](https://almanac.httparchive.org/en/2024/http)). [Technologychecker](https://technologychecker.io/blog/http-protocol-adoption)

**Numbers worth knowing.**

- Akamai (2023): about 71 % of API requests and 58 % of site traffic on HTTP/2; HPACK reduced ingress by ~53 % in a Cloudflare study ([https://zuplo.com/learning-center/enhancing-api-performance-with-http-2-and-http-3-protocols](https://zuplo.com/learning-center/enhancing-api-performance-with-http-2-and-http-3-protocols)).
- LinkedIn reported 34 % faster page-load times after migrating to HTTP/2 (same source, 2023).
- The original SPDY whitepaper claimed up to 55 % page-load improvement; Wang et al. (NSDI 2014, "How Speedy is SPDY?", Wang/Balasubramanian/Krishnamurthy/Wetherall, [https://www.usenix.org/conference/nsdi14/technical-sessions/wang](https://www.usenix.org/conference/nsdi14/technical-sessions/wang)) found SPDY's gains were "easily overwhelmed" by JavaScript/CSS dependencies and reduced to ~7 % once browser computation was modeled — an important reality check.
- Memory footprint per stream in nghttp2 is roughly 1–2 KiB; per connection a few KiB plus the HPACK dynamic table size.

---

## 6. Failure modes and famous incidents

**CVE-2023-44487 — "HTTP/2 Rapid Reset"** (10 Oct 2023). Coordinated disclosure by Google Cloud, Cloudflare, AWS. Mechanics: open a stream with HEADERS, immediately send RST_STREAM. Because the rejected stream no longer counts against `MAX_CONCURRENT_STREAMS`, the client can churn an unbounded backlog of work onto the server. Peak attacks: **Google 398 Mrps, Cloudflare 201 Mrps, AWS 155 Mrps** — Google's was 7.5× the previous record ([https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps)). Cloudflare disclosed that during initial mitigation they reduced concurrent streams to 64 and broke browsers that assume 100 — they then restored to 100 ([https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)). Patches landed in nginx, nghttp2, Envoy, Apache, Go `net/http`, Node.js, .NET, etc., and most servers now track *frequency* of resets and close the TCP connection on abuse. [Field Effect + 4](https://fieldeffect.com/blog/rapid-reset-ddos-technique-new-request-per-second-record)

**CVE-2024-27316 — "HTTP/2 CONTINUATION Flood"** (April 3, 2024). Bartek Nowotarski / CERT/CC. An attacker opens a stream and sends an unbounded sequence of CONTINUATION frames *without* the `END_HEADERS` flag. Servers that buffer header fragments without enforcing `MAX_HEADER_LIST_SIZE` OOM (Apache httpd) or burn CPU (Envoy: ~1 core per 300 Mbps, [https://www.netizen.net/news/post/4105](https://www.netizen.net/news/post/4105)). Family of CVEs: 2024-27316 (Apache httpd, fixed in 2.4.59), 2024-24549 (Tomcat), 2024-31309 (Apache Traffic Server), 2024-27919 + 2024-30255 (Envoy), 2024-27983 (Node.js), 2023-45288 (Go), 2024-28182 (nghttp2 — fixed in 1.61.0), 2024-2653 (amphp), 2024-2758 (Tempesta FW). [https://kb.cert.org/vuls/id/421644](https://kb.cert.org/vuls/id/421644). [Security Affairs + 5](https://securityaffairs.com/161520/security/http-2-continuation-flood-attack.html)

**CVE-2025-8671 — "MadeYouReset"** (August 13, 2025). Gal Bar Nahum, Anat Bremler-Barr, Yaniv Harel (Tel Aviv University) with Imperva. Sends valid-looking HEADERS+DATA, then provokes the server into sending its own `RST_STREAM` via malformed WINDOW_UPDATE/PRIORITY/half-closed-stream tricks. Bypasses post-Rapid-Reset rate limits because the *server* is the one resetting. Affected Apache Tomcat (CVE-2025-48989), Netty (versions before 4.1.124.Final / 4.2.4.Final, CVE-2025-55163), Varnish (CVE through 7.6.x patched in 7.6.5/7.7.3/6.0.16), Fastly's H2O fork (fixed in 25.17 deployed June 2, 2025), Wind River, SUSE, F5, AMPHP, Eclipse, gRPC, Mozilla services, Zephyr. Cloudflare's Pingora was protected because Cloudflare doesn't terminate inbound HTTP at the Pingora layer; the Rust `h2` crate was patched in 0.4.11. [https://kb.cert.org/vuls/id/767506](https://kb.cert.org/vuls/id/767506) and [https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/). [GBHackers + 5](https://gbhackers.com/http-2-madeyoureset-vulnerability/)

**CVE-2019-9511 — 9518 — Netflix family** (August 2019). Discovered by Jonathan Looney (Netflix), except 9518 by Piotr Sikora (Google). [https://github.com/netflix/security-bulletins/blob/master/advisories/third-party/2019-002.md](https://github.com/netflix/security-bulletins/blob/master/advisories/third-party/2019-002.md).

- 9511 *Data Dribble* — manipulate window/priority to force 1-byte queue chunks.
- 9512 *Ping Flood* — endless PING storms.
- 9513 *Resource Loop* — perpetual priority-tree shuffle.
- 9514 *Reset Flood* — open + invalid request on each stream.
- 9515 *Settings Flood* — endless SETTINGS frames.
- 9516 *0-Length Headers Leak* — unbounded zero-length header allocation.
- 9517 *Internal Data Buffering* — keep HTTP/2 window open while choking TCP.
- 9518 *Empty Frames Flood* — empty-payload frames without `END_STREAM`.

**CVE-2016-6309** (OpenSSL 1.1.0a, Sep 26 2016). Use-after-free in `statem.c` when the TLS handshake message exceeds the 16 KiB buffer and `realloc` moves it. Critical (CVSS 10.0); affected only 1.1.0a. Practically relevant to HTTP/2 because HTTP/2 sites force OpenSSL adoption and large initial ALPN/SNI ClientHellos. [https://www.openssl.org/news/secadv/20160926.txt](https://www.openssl.org/news/secadv/20160926.txt). [Rapid7](https://www.rapid7.com/db/vulnerabilities/http-openssl-cve-2016-6309/)[Akaoma](https://cve.akaoma.com/vendor/openssl)

**HPACK Bomb (CVE-2016-6581).** A header field exactly the size of the HPACK dynamic table is inserted, then a header block of pure references to that entry is sent — yielding a >4096:1 compression ratio. 16 KiB on the wire blows up to 64 MiB+ in memory. python-hyper's hpack 2.3.0 fixed by enforcing maximum decompressed list size ([https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html](https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html)). A 2025 variant (CVE-2025-53020, "MadeYouReset"-discoverer Nahum's PoC) hits Apache httpd by exploiting unnecessary memory duplication for repeated header names. [Python-hyper + 2](https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html)

**Production pitfalls.**

- Bufferbloat with large initial windows (5–10 MiB) → high latency for high-priority responses unless `tcp_notsent_lowat` is set (Cloudflare, [https://blog.cloudflare.com/http-2-prioritization-with-nginx/](https://blog.cloudflare.com/http-2-prioritization-with-nginx/)).
- TCP HoL blocking under loss — measurable on lossy mobile links; HTTP/3 fixes it ([https://thenewstack.io/http-3-in-the-wild-why-it-beats-http-2-where-it-matters-most/](https://thenewstack.io/http-3-in-the-wild-why-it-beats-http-2-where-it-matters-most/)).
- Server Push misuse — pushing already-cached resources, fighting the rendering critical path.
- Prioritization not actually working — RFC 7540 dependency tree variability, hence RFC 9218.
- HPACK dynamic-table sync drift between client and reverse proxy when intermediaries re-encode.
- Forgetting `MAX_HEADER_LIST_SIZE` — every CONTINUATION-flood CVE owes its severity to this.

---

## 7. Fun facts and anecdotes

**The "PRISM" preface.** The 24-byte preface `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n` reads "PRISM" if you ignore whitespace. According to John Graham-Cumming's investigation of the GitHub commit history, the "PRI" verb was originally `FOO`; on July 8, 2013 — about a month after Edward Snowden disclosed PRISM — it was changed to `PRI`, and Mark Nottingham's account on Hacker News confirms the working group was talking about Snowden in the hallway when the placeholder went in ([https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html](https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html)). Wireshark labels the preface "Magic." The IANA HTTP Method Registry now lists `PRI` as a registered method that "is never used by an actual client."

**HTTP/2 vs HTTP/2.0.** The protocol was originally drafted as "HTTP/2.0" — the preface still says `HTTP/2.0`. The WG dropped the `.0` because the protocol is binary, version negotiation lives in ALPN, and there is no expectation of an HTTP/2.1. RFC 7540 explicitly discusses this; RFC 9113 simply says "HTTP/2" everywhere except in that legacy preface string.

**SPDY pronunciation.** "Speedy." It is *not* an acronym — Belshe and Peon explicitly disclaimed any expansion ([https://research.google/blog/a-2x-faster-web/](https://research.google/blog/a-2x-faster-web/)). [Wikipedia](https://en.wikipedia.org/wiki/SPDY)

**The TLS-only resolution.** The IETF couldn't *require* TLS, but Chrome and Firefox implementers said they would only support `h2`. So the spec documented `h2c` and the world deployed `h2`. Mark Nottingham summarized this as a "political" rather than technical decision ([https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)). [Mark Nottingham](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)

**Poul-Henning Kamp's farewell.** The Varnish/FreeBSD developer publicly criticized HTTP/2 as overcomplicated, schedule-driven, and a layering violation — "duplicating flow control that belongs in the transport layer" — and predicted exactly the fragility we ended up seeing ([https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)). His letter is one of the more honest dissents in modern protocol design. [Wikipedia](https://en.wikipedia.org/wiki/HTTP/2)

**April Fool's connection.** RFC 7168 (HTCPCP-TEA, April 1 2014) is the only IETF April-Fools RFC published *adjacent to* HTTP/2 work. It is mostly a joke about coffee and tea, but it shows the IETF culture in which HTTP/2 was being baked.

**Server Push's epitaph.** Jake Archibald and the Chrome networking team's 2020 analysis showed Push had *no* clear net performance benefit and frequent regressions. Evert Pot — who built `Prefer-Push` and a Node.js framework around push — wrote "HTTP/2 push is dead" ([https://evertpot.com/http-2-push-is-dead/](https://evertpot.com/http-2-push-is-dead/)) the day Chrome announced removal. The intended replacement is `103 Early Hints`, which is also more amenable to CDNs.

---

## 8. Practical wisdom

**Tuning checklist for an HTTP/2-terminating edge.**

| Knob | Recommended | Why |
|---|---|---|
| `SETTINGS_MAX_CONCURRENT_STREAMS` | **100** advertised, **hard cap at TCP-conn level via DDoS layer** | Browsers assume ≥100 even before SETTINGS arrives; lower values cause page-load failures; [Cloudflare](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/) the real DDoS bound goes elsewhere |
| `SETTINGS_INITIAL_WINDOW_SIZE` | **6 MiB for upload-heavy origins**; default fine for cacheable sites | Cloudflare's autotune doubles based on TCP BDP; [Cloudflare](https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/) defaults bottleneck on long fat networks ([https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/](https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/)) |
| `SETTINGS_MAX_FRAME_SIZE` | 16 KiB default; up to 65 KiB if you push large media | Larger reduces per-frame overhead but worsens HoL within a stream |
| `SETTINGS_MAX_HEADER_LIST_SIZE` | **16–64 KiB** | Without it, you are vulnerable to CONTINUATION Flood and HPACK bomb |
| `SETTINGS_HEADER_TABLE_SIZE` | 4096 default; raise on internal RPC links with stable headers | Trade memory for compression |
| `SETTINGS_ENABLE_PUSH` | **0** | Push is dead; advertise that fact |
| `SETTINGS_NO_RFC7540_PRIORITIES` | **1** if you implement RFC 9218 | Tells client to use the new scheme |
| `tcp_notsent_lowat` | **16 KiB** | Makes prioritization actually work; without it, servers stuff the kernel's TCP buffer regardless of stream priority (Cloudflare blog) |
| BBR congestion control | **Yes** | Pairs well with `tcp_notsent_lowat` |

**What to monitor.**

- **Stream resets per connection** — sudden spikes mean Rapid-Reset-style abuse.
- **GOAWAY frequency** — should be near zero outside graceful restarts.
- **HPACK eviction rate** — high eviction means the dynamic table is too small for your header churn.
- **Per-stream CPU and memory** — for CONTINUATION/0-length-header attacks.
- **`MAX_CONCURRENT_STREAMS` saturation** — for capacity planning.
- **TLS session resumption rate** — if low, you're paying a full handshake on every reconnect.

**Debugging commands.**

bash

```
# Negotiate and verbosely show frames:
curl --http2 -v https://example.com/

# nghttp client — pretty-prints frames:
nghttp -nv https://example.com/

# Load-test:
h2load -c100 -m100 --duration=30 https://example.com/

# Run a local HTTP/2 server for testing:
nghttpd -d /var/www -v 8443 server.key server.crt

# Wireshark — set SSLKEYLOGFILE first:
SSLKEYLOGFILE=/tmp/keys.log chromium ...
# Then in Wireshark: Edit → Preferences → Protocols → TLS → "(Pre)-Master-Secret log filename"
# Filter: http2

# Chrome dump:
chrome://net-export/  → Start Logging → reproduce → analyze in netlog-viewer
```

**Common misconfigurations.**

- Origin-side proxy speaking only HTTP/1.1 — you keep HoL blocking and lose the benefits of HPACK between edge and origin. Cloudflare offers "HTTP/2 to Origin" specifically for this.
- Mismatched window sizes between client and server — under-allocated INITIAL_WINDOW_SIZE caps throughput; over-allocated invites bufferbloat.
- Missing `MAX_HEADER_LIST_SIZE` (vulnerability surface).
- Failing to advertise `alt-svc: h3=":443"` — leaves you on HTTP/2 forever for clients that would otherwise upgrade.
- HTTP/2 over a load balancer that decrypts then re-encrypts to TCP: many such configurations silently downgrade to HTTP/1.1 to origin.

---

## 9. Learning resources (current as of 2026)

**RFCs (all freely available at rfc-editor.org).**

- **RFC 9113 — HTTP/2** (Thomson, Benfield; June 2022). The current spec. Key sections: §3 (Starting HTTP/2), §4 (Framing), §5 (Streams), §6 (Frame Definitions), §9.2 (TLS profile), Appendix A (cipher blacklist), Appendix B (changes from 7540). [https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/) — *advanced.* Last updated 2022.
- **RFC 7541 — HPACK** (Peon, Ruellan; May 2015). §2.3 (tables), §5.1 (integers), §5.2 (strings), §6 (representations), §7 (security). [https://datatracker.ietf.org/doc/html/rfc7541](https://datatracker.ietf.org/doc/html/rfc7541) — *advanced.*
- **RFC 9110 — HTTP Semantics** (Fielding, Nottingham, Reschke; STD 97, June 2022). The base spec for *all* HTTP versions. [https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/) — *intermediate.* [IETF](https://datatracker.ietf.org/doc/rfc9110/)
- **RFC 9111 — HTTP Caching** (same authors; STD 98). [https://datatracker.ietf.org/doc/html/rfc9111](https://datatracker.ietf.org/doc/html/rfc9111) — *intermediate.* [RFCinfo](https://rfcinfo.com/rfc-9111/)
- **RFC 9112 — HTTP/1.1** (STD 99). For comparison.
- **RFC 9114 — HTTP/3** (Bishop; June 2022). [https://datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114) — *advanced.*
- **RFC 9204 — QPACK** (Krasic, Bishop, Frindell). [https://datatracker.ietf.org/doc/html/rfc9204](https://datatracker.ietf.org/doc/html/rfc9204) — *advanced.*
- **RFC 9218 — Extensible Prioritization Scheme for HTTP** (Oku, Pardue). [https://www.rfc-editor.org/rfc/rfc9218.html](https://www.rfc-editor.org/rfc/rfc9218.html) — *intermediate.* [W3C](https://lists.w3.org/Archives/Public/ietf-http-wg/2022AprJun/0136.html)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9218.html)
- **RFC 8441 — Bootstrapping WebSockets with HTTP/2** (McManus). [https://datatracker.ietf.org/doc/html/rfc8441](https://datatracker.ietf.org/doc/html/rfc8441) — *intermediate.*
- **RFC 7301 — ALPN** (Friedl, Popov, Langley, Stephan). [https://datatracker.ietf.org/doc/html/rfc7301](https://datatracker.ietf.org/doc/html/rfc7301) — *intro.*
- **RFC 9460 — SVCB and HTTPS DNS records** (Schwartz, Bishop, Nygren; November 2023). [https://datatracker.ietf.org/doc/rfc9460/](https://datatracker.ietf.org/doc/rfc9460/) — *advanced.* [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc9460.html)
- **RFC 9458 — Oblivious HTTP** (Thomson, Wood; January 2024). [https://datatracker.ietf.org/doc/rfc9458/](https://datatracker.ietf.org/doc/rfc9458/) — *advanced.* [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg23922.html)[IETF](https://datatracker.ietf.org/doc/rfc9458/)
- **RFC 7838 — HTTP Alternative Services** (April 2016) — *intermediate.*

**Books.**

- **Barry Pollard, *HTTP/2 in Action* (Manning, 2019).** Practitioner-focused; still the most readable end-to-end book in 2026 even though not formally updated for RFC 9113. Pollard now co-authors the Web Almanac HTTP chapter, where his more current writing lives. [https://www.manning.com/books/http2-in-action](https://www.manning.com/books/http2-in-action) — *intermediate.*
- **Ilya Grigorik, *High Performance Browser Networking* (O'Reilly, 2nd ed.).** Chapters 11–13 cover HTTP/2 in deep detail. The full book is freely available at [https://hpbn.co/](https://hpbn.co/). — *intro to advanced.* [Amazon](https://www.amazon.com/High-Performance-Browser-Networking-performance/dp/1449344763)
- **Stephen Ludin & Javier Garza, *Learning HTTP/2* (O'Reilly, 2017).** Compact and mostly still accurate; not updated for RFC 9113. — *intro.*
- **Daniel Stenberg, *http2 explained* and *HTTP/3 explained***. Free booklets. [https://daniel.haxx.se/http3-explained/](https://daniel.haxx.se/http3-explained/). — *intro to intermediate.* [curl](https://daniel.haxx.se/blog/2018/11/26/http3-explained/)

**Engineering blogs (key posts).**

- Cloudflare: "HTTP/2 Rapid Reset: deconstructing the record-breaking attack" (Pardue & Desgats, 10 Oct 2023, [https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)); "MadeYouReset" (Aug 2025); "Better HTTP/2 Prioritization for a Faster Web" (Patrick Meenan); "Adopting a new approach to HTTP prioritization" (Pardue); "Delivering HTTP/2 upload speed improvements"; "NGINX structural enhancements for HTTP/2 performance".
- Google Cloud: "How it works: The novel HTTP/2 'Rapid Reset' DDoS attack" ([https://cloud.google.com/blog/products/identity-security/how-it-works-the-novel-http2-rapid-reset-ddos-attack](https://cloud.google.com/blog/products/identity-security/how-it-works-the-novel-http2-rapid-reset-ddos-attack)); "Google Cloud mitigated largest DDoS attack, peaking above 398 million rps".
- Chrome: "Remove HTTP/2 Server Push from Chrome" ([https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)); Jake Archibald's earlier critique.
- Mozilla Hacks: Patrick McManus's posts on HTTP/2 in Firefox and RFC 8441.
- Akamai blog: HTTP/2 deployment metrics and HTTP/3 readiness.
- Fastly blog: HTTP/3 and Extensible Priorities.
- HTTP Archive Web Almanac: 2024 HTTP chapter (Marx, Pollard, Böttger; doi:10.5281/zenodo.14065825), 2025 CDN chapter.

**Academic papers.**

- Wang, Balasubramanian, Krishnamurthy, Wetherall, **"How Speedy is SPDY?"** NSDI 2014. [https://www.usenix.org/conference/nsdi14/technical-sessions/wang](https://www.usenix.org/conference/nsdi14/technical-sessions/wang). The reality check on SPDY's "55% faster" marketing. [USENIX](https://www.usenix.org/conference/nsdi14/technical-sessions/wang)
- Kakhki, Jero, Choffnes, Nita-Rotaru, Mislove, **"Taking a long look at QUIC."** IMC 2017.
- Marx et al., **"Of the Utmost Importance: Resource Prioritization in HTTP/3 over QUIC"** (SCITEPRESS WEBIST 2019, doi:10.5220/0008191701300143). [RFC Editor](https://www.rfc-editor.org/rfc/rfc9218.html)
- Chatzoglou, Karopoulos, Kambourakis (2022), **"A hands-on gaze on HTTP/3 security through the lens of HTTP/2."** Computers & Security.

**Conference talks (YouTube).**

- Wang et al., "NSDI '14 — How Speedy is SPDY?" [https://www.youtube.com/watch?v=UNRgeUVCaMQ](https://www.youtube.com/watch?v=UNRgeUVCaMQ).
- Daniel Stenberg, "HTTP/3 with curl" — curl up 2022, [https://www.youtube.com/watch?v=TTCKl9-AydU](https://www.youtube.com/watch?v=TTCKl9-AydU); FOSDEM talks each year. [YouTube](https://www.youtube.com/watch?v=TTCKl9-AydU)
- Mark Nottingham — Software Engineering Radio episode 232 ([https://se-radio.net/2015/07/episode-232-mark-nottingham-on-http2/](https://se-radio.net/2015/07/episode-232-mark-nottingham-on-http2/)).
- Robin Marx (Akamai) — multiple talks on HTTP/3 prioritization at IETF and Velocity.
- Lucas Pardue (Cloudflare) — IETF 117–119 sessions on Rapid Reset, RFC 9218, and MASQUE.

**Podcasts.** SE Radio #232 (Nottingham on HTTP/2); Software Engineering Daily episodes on HTTP/3 (2022–2024); Changelog interviews with Stenberg; HTTP 203 (Surma & Archibald) episodes covering Server Push removal.

**University courses (publicly indexed material).**

- Stanford CS244 *Advanced Topics in Networking* — recurring HTTP/2 reproducibility projects.
- MIT 6.829 *Computer Networks* — TCP and HTTP performance.
- CMU 15-744 *Computer Networks* — typically includes HTTP/2 and QUIC lectures.
- Berkeley CS268 *Graduate Computer Networks*.

**Hands-on tools.**

- `nghttp2` tools: `nghttp` (client), `nghttpd` (server), `nghttpx` (proxy), `h2load` (benchmark), `inflatehd`/`deflatehd` (HPACK debug). [https://nghttp2.org/](https://nghttp2.org/). [Wikipedia](https://en.wikipedia.org/wiki/Nghttp2)
- Wireshark with TLS keylog (`SSLKEYLOGFILE`) — best protocol-level introspection available.
- `curl --http2 -v` and `curl --http3` (when built with nghttp3+ngtcp2 or quiche).
- Chrome `chrome://net-export/` and the netlog viewer.
- Test endpoints: `https://nghttp2.org/`, `https://http2.cloudflare.com/`, `https://http2.akamai.com/demo`.
- `h2spec` (Moto Ishizawa) — RFC compliance test suite, run by every serious implementation in CI.

---

## 10. Where things are heading (2025–2026 frontier)

**Active deprecations (settled).**

- HTTP/2 Server Push is dead in Chrome (106, Oct 2022) and Firefox (132, Oct 2024). Server-side support remains but has no client.
- RFC 7540 priority tree is replaced by **RFC 9218 Extensible Priorities**. Cloudflare, Fastly, and h2o ship it; Chrome/Firefox use the `Priority` header for HTTP/3 and increasingly for HTTP/2.
- `h2c` Upgrade dance — removed in RFC 9113. Only "prior knowledge" `h2c` remains, used by gRPC inside trusted networks.

**HTTP/3 displacement curve.** As of 2024 Web Almanac, HTTP/1.1 share fell to 21–22 % of home pages from 34 % in 2022; HTTP/2+ is the rest, with HTTP/3 actively used on ~30 % of measurable browser-to-CDN connections ([https://almanac.httparchive.org/en/2024/http](https://almanac.httparchive.org/en/2024/http)). Cloudflare Radar's 2025 Year in Review reports both HTTP/2 and HTTP/3 grew slightly across 2025 while HTTP/1.x continued shrinking, including a drop from 16 % to 2 % of CDN-served HTML between 2024 and 2025 ([https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/), [https://almanac.httparchive.org/en/2025/cdn](https://almanac.httparchive.org/en/2025/cdn)). HTTP/3 is supported by ~95 % of major browsers and by Safari since version 16 ([https://en.wikipedia.org/wiki/HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)). [ALM Corp](https://almcorp.com/blog/cloudflare-radar-2025-year-in-review-complete-analysis/)

**Active IETF work touching HTTP/2.**

- **HTTPWG (chaired by Mark Nottingham and Tommy Pauly)** — error-handling clarifications, streaming, structured fields work, signature/integrity drafts.
- **MASQUE WG** — CONNECT-UDP, CONNECT-IP, proxying anything through HTTP. Some MASQUE drafts include HTTP/2 fallbacks.
- **QUIC WG** — multipath, ACK frequency, qlog, address discovery.
- **WebTransport WG** — `draft-ietf-webtrans-http3-15` (October 2025) and `draft-ietf-webtrans-http2-13` (October 2025) define WebTransport over both HTTP/3 (production) and HTTP/2 (in spec, limited browser deployment as of early 2026). Uses Extended CONNECT (`:protocol = webtransport`) and `SETTINGS_ENABLE_CONNECT_PROTOCOL`.
- **OHAI WG** — RFC 9458 Oblivious HTTP (January 2024) is now in production: Apple's Private Cloud Compute, Google Safe Browsing OHTTP Gateway, Mozilla's Firefox telemetry via Fastly ([https://en.wikipedia.org/wiki/Oblivious_HTTP](https://en.wikipedia.org/wiki/Oblivious_HTTP)).

**Continued vulnerability research.** The Rapid-Reset → CONTINUATION Flood → MadeYouReset cadence suggests one significant HTTP/2 implementation-class vulnerability per year. Implementers are now encouraged to apply the RFC 9113 §10 hardening guidance proactively and to monitor frame-rate anomalies regardless of which frame.

**Speculative.** Some commentators expect HTTP/3 to overtake HTTP/2 share by ~2027 on the open web; CDN-heavy sites are already there for browser traffic, but bot, search, and API traffic remain stubbornly HTTP/1.1 and HTTP/2 ([https://blog.cloudflare.com/http3-usage-one-year-on/](https://blog.cloudflare.com/http3-usage-one-year-on/)). HTTP/2 is not going away on the inside of data centers any time soon — gRPC alone guarantees its operational relevance for the foreseeable future.

---

## 11. Hooks for the article, infographic, and podcast

### 60-second narrated hook (for the ear)

> In 2009, two engineers at Google — Mike Belshe and Roberto Peon — got fed up with how slow the web felt. They wrote an experimental protocol called SPDY, "speedy", that promised pages would load up to 55 percent faster. Six years later, in May 2015, that experiment became HTTP/2 — the first major upgrade to the web's core protocol since 1997. It put a binary framing layer on top of TCP, multiplexed everything onto a single connection, and compressed the cookies and headers nobody else thought to compress. By 2026, HTTP/2 carries roughly half the world's web traffic — sitting between aging HTTP/1.1 and the QUIC-based HTTP/3 that's still climbing. But here's the twist nobody saw coming: in October 2023, attackers turned HTTP/2's signature feature, stream cancellation, into the largest distributed denial-of-service attack ever recorded — 398 million requests per second against Google in two minutes. The protocol that made the web fast also made the most efficient DDoS vector ever invented. This is the story of HTTP/2.

### Striking statistic with source

> A two-minute DDoS attack against Google in August 2023 generated **398 million requests per second** — more requests than Wikipedia served in the entire month of September 2023 — using a botnet of just 20,000 machines. Source: Google Cloud Blog, October 10, 2023. [https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps).

### "Pause and think" moment with source

> Look at the very first 24 bytes of any HTTP/2 connection: `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`. The first letter of each non-blank line spells **PRISM**. The IANA-registered HTTP method `PRI` was added in July 2013 — about a month after Edward Snowden disclosed the NSA program of the same name. Mark Nottingham, then-chair of the IETF HTTP Working Group, confirmed on Hacker News that PRISM was being discussed in the meeting hallways while the placeholder for the preface was being chosen. Source: John Graham-Cumming's investigation of the GitHub commit history, [https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html](https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html).

### Failure-story arc — "Rapid Reset"

**Setup.** HTTP/2's killer feature is multiplexing: hundreds of streams over one TCP connection. To keep things sane, a `SETTINGS_MAX_CONCURRENT_STREAMS` value bounds how many can be open at once — typically 100. Clients also have a built-in escape hatch: send a `RST_STREAM` to abort a stream you no longer want. A user clicks away from a slow image, the browser cancels, the server moves on. This was deliberate, documented design.

**Mistake.** When a client sends `RST_STREAM`, the stream immediately stops counting against the concurrency limit — *even before the server has done any cleanup*. So a client can open a stream, RST it, open another, RST it, on and on, faster than the server can release the resources behind each one. The protocol designers assumed RST would be rare and cheap. It isn't.

**Consequence.** On August 25, 2023, Cloudflare's automated DDoS systems started mitigating attacks they'd never seen before. By August 28, AWS was tracking similar attacks peaking at 155 Mrps. Cloudflare hit 201 Mrps. Google saw 398 Mrps — about 7.5× the previous record. The botnet behind the Google attack: just 22,000 nodes. ([https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/).)

**Resolution.** On October 10, 2023, Cloudflare, Google, AWS, and the IETF coordinated a public disclosure under CVE-2023-44487. Patches landed in nginx, nghttp2, Envoy, Apache, Go's `net/http`, Node.js, .NET, and the Rust `h2` crate within days. The fix is conceptually simple: track the *rate* of stream resets per connection and tear the whole TCP connection down when it exceeds a threshold. RFC 9113 had implicit guidance for this; RFC implementers had not all applied it. Cloudflare also discovered, mid-mitigation, that browsers assume `MAX_CONCURRENT_STREAMS = 100` *before* receiving SETTINGS — so dropping below 100 broke real users, and Cloudflare backed off to 100. Two years later, in August 2025, Tel Aviv University researchers showed the same accounting flaw could be triggered with *server*-sent resets — "MadeYouReset", CVE-2025-8671. The same defenses, applied to server-initiated resets, hold the line. The wound is now scar tissue, but it shaped how every modern HTTP/2 stack handles the transition between protocol-level state and backend processing.

---

## 12. Citations

1. [https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
2. [https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
3. [https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
4. [https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)
5. [https://nvd.nist.gov/vuln/detail/CVE-2023-44487](https://nvd.nist.gov/vuln/detail/CVE-2023-44487)
6. [https://www.cyfirma.com/research/cve-2025-8671-http-2-madeyoureset-vulnerability-ddos-attack/](https://www.cyfirma.com/research/cve-2025-8671-http-2-madeyoureset-vulnerability-ddos-attack/)
7. [https://www.wiz.io/vulnerability-database/cve/cve-2025-8671](https://www.wiz.io/vulnerability-database/cve/cve-2025-8671)
8. [https://www.securityweek.com/madeyoureset-http2-vulnerability-enables-massive-ddos-attacks/](https://www.securityweek.com/madeyoureset-http2-vulnerability-enables-massive-ddos-attacks/)
9. [https://kb.cert.org/vuls/id/767506](https://kb.cert.org/vuls/id/767506)
10. [https://www.windriver.com/security/vulnerability-responses/http2-madeyoureset-vulnerability](https://www.windriver.com/security/vulnerability-responses/http2-madeyoureset-vulnerability)
11. [https://techcommunity.microsoft.com/blog/azurenetworksecurityblog/azure-application-gateway-protection-against-cve-2025-8671-madeyoureset/4452921](https://techcommunity.microsoft.com/blog/azurenetworksecurityblog/azure-application-gateway-protection-against-cve-2025-8671-madeyoureset/4452921)
12. [https://www.ibm.com/support/pages/security-bulletin-ibm-http-server-powered-apache-ibm-i-vulnerable-denial-service-attack-using-http2-protocol-cve-2024-27316](https://www.ibm.com/support/pages/security-bulletin-ibm-http-server-powered-apache-ibm-i-vulnerable-denial-service-attack-using-http2-protocol-cve-2024-27316)
13. [https://kb.cert.org/vuls/id/421644](https://kb.cert.org/vuls/id/421644)
14. [https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html](https://thehackernews.com/2024/04/new-http2-vulnerability-exposes-web.html)
15. [https://snyk.io/blog/exploiting-http-2-continuation-frames-dos-attacks/](https://snyk.io/blog/exploiting-http-2-continuation-frames-dos-attacks/)
16. [https://checkmarx.com/blog/what-you-should-know-http-2-continuation-flood-vulnerability/](https://checkmarx.com/blog/what-you-should-know-http-2-continuation-flood-vulnerability/)
17. [https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/)
18. [https://www.rfc-editor.org/info/rfc9113](https://www.rfc-editor.org/info/rfc9113)
19. [https://www.ietf.org/rfc/rfc9113.pdf](https://www.ietf.org/rfc/rfc9113.pdf)
20. [https://datatracker.ietf.org/doc/html/rfc7540](https://datatracker.ietf.org/doc/html/rfc7540)
21. [https://developer.chrome.com/blog/removing-push](https://developer.chrome.com/blog/removing-push)
22. [https://en.wikipedia.org/wiki/HTTP/2_Server_Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)
23. [https://chromestatus.com/feature/6302414934114304](https://chromestatus.com/feature/6302414934114304)
24. [https://groups.google.com/a/chromium.org/g/blink-dev/c/K3rYLvmQUBY](https://groups.google.com/a/chromium.org/g/blink-dev/c/K3rYLvmQUBY)
25. [https://evertpot.com/http-2-push-is-dead/](https://evertpot.com/http-2-push-is-dead/)
26. [https://datatracker.ietf.org/doc/rfc9218/](https://datatracker.ietf.org/doc/rfc9218/)
27. [https://www.rfc-editor.org/rfc/rfc9218.html](https://www.rfc-editor.org/rfc/rfc9218.html)
28. [https://research.google/blog/a-2x-faster-web/](https://research.google/blog/a-2x-faster-web/)
29. [https://lwn.net/Articles/362473/](https://lwn.net/Articles/362473/)
30. [https://www.stevesouders.com/blog/2009/11/12/speedy-twice-as-fast-as-http/](https://www.stevesouders.com/blog/2009/11/12/speedy-twice-as-fast-as-http/)
31. [https://infrequently.org/2009/11/spdy-the-web-only-faster/](https://infrequently.org/2009/11/spdy-the-web-only-faster/)
32. [https://en.wikipedia.org/wiki/SPDY](https://en.wikipedia.org/wiki/SPDY)
33. [https://www.usenix.org/conference/nsdi14/technical-sessions/wang](https://www.usenix.org/conference/nsdi14/technical-sessions/wang)
34. [https://www.usenix.org/system/files/conference/nsdi14/nsdi14-paper-wang_xiao_sophia.pdf](https://www.usenix.org/system/files/conference/nsdi14/nsdi14-paper-wang_xiao_sophia.pdf)
35. [https://w3techs.com/technologies/details/ce-http2](https://w3techs.com/technologies/details/ce-http2)
36. [https://w3techs.com/technologies/details/ce-http3](https://w3techs.com/technologies/details/ce-http3)
37. [https://blog.cloudflare.com/http3-usage-one-year-on/](https://blog.cloudflare.com/http3-usage-one-year-on/)
38. [https://almanac.httparchive.org/en/2024/http](https://almanac.httparchive.org/en/2024/http)
39. [https://almanac.httparchive.org/en/2025/cdn](https://almanac.httparchive.org/en/2025/cdn)
40. [https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/)
41. [https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)
42. [https://en.wikipedia.org/wiki/HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
43. [https://github.com/netflix/security-bulletins/blob/master/advisories/third-party/2019-002.md](https://github.com/netflix/security-bulletins/blob/master/advisories/third-party/2019-002.md)
44. [https://datatracker.ietf.org/doc/html/rfc8441](https://datatracker.ietf.org/doc/html/rfc8441)
45. [https://httpwg.org/specs/rfc8441.html](https://httpwg.org/specs/rfc8441.html)
46. [https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html](https://blog.jgc.org/2015/11/the-secret-message-hidden-in-every.html)
47. [https://en.neritam.com/2016/02/14/the-secret-message-hidden-in-every-http2-connection/](https://en.neritam.com/2016/02/14/the-secret-message-hidden-in-every-http2-connection/)
48. [https://www.eteknix.com/http2-opens-new-connections-word-prism/](https://www.eteknix.com/http2-opens-new-connections-word-prism/)
49. [https://http.dev/pri](https://http.dev/pri)
50. [https://datatracker.ietf.org/doc/html/rfc7541](https://datatracker.ietf.org/doc/html/rfc7541)
51. [https://www.rfc-editor.org/rfc/rfc7541.html](https://www.rfc-editor.org/rfc/rfc7541.html)
52. [https://httpwg.org/specs/rfc7541.html](https://httpwg.org/specs/rfc7541.html)
53. [https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html](https://python-hyper.org/projects/hpack/en/latest/security/CVE-2016-6581.html)
54. [https://github.com/galbarnahum/CVE-2025-53020-PoC](https://github.com/galbarnahum/CVE-2025-53020-PoC)
55. [https://datatracker.ietf.org/doc/rfc9460/](https://datatracker.ietf.org/doc/rfc9460/)
56. [https://www.rfc-editor.org/info/rfc9460](https://www.rfc-editor.org/info/rfc9460)
57. [https://blog.apnic.net/2023/12/18/use-of-https-resource-records/](https://blog.apnic.net/2023/12/18/use-of-https-resource-records/)
58. [https://datatracker.ietf.org/doc/rfc9110/](https://datatracker.ietf.org/doc/rfc9110/)
59. [https://datatracker.ietf.org/doc/html/rfc9110](https://datatracker.ietf.org/doc/html/rfc9110)
60. [https://datatracker.ietf.org/doc/html/rfc9111](https://datatracker.ietf.org/doc/html/rfc9111)
61. [https://www.rfc-editor.org/rfc/rfc9111.pdf](https://www.rfc-editor.org/rfc/rfc9111.pdf)
62. [https://en.wikipedia.org/wiki/Nghttp2](https://en.wikipedia.org/wiki/Nghttp2)
63. [https://github.com/nghttp2/nghttp2](https://github.com/nghttp2/nghttp2)
64. [https://nghttp2.org/documentation/h2load.1.html](https://nghttp2.org/documentation/h2load.1.html)
65. [https://blog.cloudflare.com/http-2-prioritization-with-nginx/](https://blog.cloudflare.com/http-2-prioritization-with-nginx/)
66. [https://blog.cloudflare.com/better-http-2-prioritization-for-a-faster-web/](https://blog.cloudflare.com/better-http-2-prioritization-for-a-faster-web/)
67. [https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/](https://blog.cloudflare.com/adopting-a-new-approach-to-http-prioritization/)
68. [https://blog.cloudflare.com/nginx-structural-enhancements-for-http-2-performance/](https://blog.cloudflare.com/nginx-structural-enhancements-for-http-2-performance/)
69. [https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/](https://blog.cloudflare.com/delivering-http-2-upload-speed-improvements/)
70. [https://blog.cloudflare.com/open-sourcing-our-nginx-http-2-spdy-code/](https://blog.cloudflare.com/open-sourcing-our-nginx-http-2-spdy-code/)
71. [https://blog.cloudflare.com/cloudflare-view-http3-usage/](https://blog.cloudflare.com/cloudflare-view-http3-usage/)
72. [https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view](https://www.mnot.net/blog/2014/01/04/strengthening_http_a_personal_view)
73. [https://www.mnot.net/blog/2014/03/17/trying_out_tls_for_http_urls](https://www.mnot.net/blog/2014/03/17/trying_out_tls_for_http_urls)
74. [https://www.geekpage.jp/en/blog/2013/akamai-http20.php](https://www.geekpage.jp/en/blog/2013/akamai-http20.php)
75. [https://www.theregister.com/2013/11/14/http_20_encryption_proposal_sparks_hot_debate/](https://www.theregister.com/2013/11/14/http_20_encryption_proposal_sparks_hot_debate/)
76. [https://datatracker.ietf.org/person/mnot@mnot.net](https://datatracker.ietf.org/person/mnot@mnot.net)
77. [https://en.wikipedia.org/wiki/HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)
78. [https://en.wikipedia.org/wiki/HTTP_Speed+Mobility](https://en.wikipedia.org/wiki/HTTP_Speed+Mobility)
79. [https://datatracker.ietf.org/doc/html/draft-montenegro-httpbis-speed-mobility](https://datatracker.ietf.org/doc/html/draft-montenegro-httpbis-speed-mobility)
80. [https://learn.microsoft.com/en-us/archive/blogs/ie/speed-and-mobility-an-approach-for-http-2-0-to-make-mobile-apps-and-the-web-faster](https://learn.microsoft.com/en-us/archive/blogs/ie/speed-and-mobility-an-approach-for-http-2-0-to-make-mobile-apps-and-the-web-faster)
81. [https://datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114)
82. [https://www.rfc-editor.org/info/rfc9114](https://www.rfc-editor.org/info/rfc9114)
83. [https://datatracker.ietf.org/doc/html/rfc9204](https://datatracker.ietf.org/doc/html/rfc9204)
84. [https://quicwg.org/](https://quicwg.org/)
85. [https://datatracker.ietf.org/doc/rfc9458/](https://datatracker.ietf.org/doc/rfc9458/)
86. [https://www.ietf.org/rfc/rfc9458.html](https://www.ietf.org/rfc/rfc9458.html)
87. [https://en.wikipedia.org/wiki/Oblivious_HTTP](https://en.wikipedia.org/wiki/Oblivious_HTTP)
88. [https://support.mozilla.org/en-US/kb/ohttp-explained](https://support.mozilla.org/en-US/kb/ohttp-explained)
89. [https://developers.google.com/safe-browsing/ohttp/reference](https://developers.google.com/safe-browsing/ohttp/reference)
90. [https://datatracker.ietf.org/doc/html/rfc7301](https://datatracker.ietf.org/doc/html/rfc7301)
91. [https://www.rfc-editor.org/rfc/rfc7301.html](https://www.rfc-editor.org/rfc/rfc7301.html)
92. [https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation)
93. [https://developer.mozilla.org/en-US/docs/Glossary/ALPN](https://developer.mozilla.org/en-US/docs/Glossary/ALPN)
94. [https://www.manning.com/books/http2-in-action](https://www.manning.com/books/http2-in-action)
95. [https://hpbn.co/](https://hpbn.co/)
96. [https://daniel.haxx.se/blog/2018/11/26/http3-explained/](https://daniel.haxx.se/blog/2018/11/26/http3-explained/)
97. [https://http3-explained.haxx.se/en](https://http3-explained.haxx.se/en)
98. [https://github.com/bagder](https://github.com/bagder)
99. [https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps](https://cloud.google.com/blog/products/identity-security/google-cloud-mitigated-largest-ddos-attack-peaking-above-398-million-rps)
100. [https://cloud.google.com/blog/products/identity-security/how-it-works-the-novel-http2-rapid-reset-ddos-attack](https://cloud.google.com/blog/products/identity-security/how-it-works-the-novel-http2-rapid-reset-ddos-attack)
101. [https://www.openssl.org/news/secadv/20160926.txt](https://www.openssl.org/news/secadv/20160926.txt)
102. [https://www.fortinet.com/blog/threat-research/analysis-of-openssl-large-message-size-handling-use-after-free-cve-2016-6309](https://www.fortinet.com/blog/threat-research/analysis-of-openssl-large-message-size-handling-use-after-free-cve-2016-6309)
103. [https://nvd.nist.gov/vuln/detail/CVE-2016-6309](https://nvd.nist.gov/vuln/detail/CVE-2016-6309)
104. [https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487](https://www.haproxy.com/blog/haproxy-is-not-affected-by-the-http-2-rapid-reset-attack-cve-2023-44487)
105. [https://blog.litespeedtech.com/2024/04/04/not-vulnerable-to-http-2-continuation-flood/](https://blog.litespeedtech.com/2024/04/04/not-vulnerable-to-http-2-continuation-flood/)
106. [https://nowotarski.info/http2-continuation-flood-technical-details/](https://nowotarski.info/http2-continuation-flood-technical-details/)
107. [https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)
108. [https://www.w3.org/TR/webtransport/](https://www.w3.org/TR/webtransport/)
109. [https://websocket.org/guides/future-of-websockets/](https://websocket.org/guides/future-of-websockets/)
110. [https://thenewstack.io/http-3-in-the-wild-why-it-beats-http-2-where-it-matters-most/](https://thenewstack.io/http-3-in-the-wild-why-it-beats-http-2-where-it-matters-most/)
111. [https://zuplo.com/learning-center/enhancing-api-performance-with-http-2-and-http-3-protocols](https://zuplo.com/learning-center/enhancing-api-performance-with-http-2-and-http-3-protocols)
112. [https://blog.axway.com/learning-center/software-development/updated-http-specifications](https://blog.axway.com/learning-center/software-development/updated-http-specifications)
113. [https://radar.cloudflare.com/adoption-and-usage](https://radar.cloudflare.com/adoption-and-usage)
114. [https://radar.cloudflare.com/reports/ddos-2025-q3](https://radar.cloudflare.com/reports/ddos-2025-q3)
115. [https://github.com/nodejs/node/pull/23284](https://github.com/nodejs/node/pull/23284)
116. [https://se-radio.net/2015/07/episode-232-mark-nottingham-on-http2/](https://se-radio.net/2015/07/episode-232-mark-nottingham-on-http2/)
117. [https://www.youtube.com/watch?v=UNRgeUVCaMQ](https://www.youtube.com/watch?v=UNRgeUVCaMQ)
118. [https://www.youtube.com/watch?v=TTCKl9-AydU](https://www.youtube.com/watch?v=TTCKl9-AydU)
119. [https://x.com/programmingart/status/1533908423682756609](https://x.com/programmingart/status/1533908423682756609)
120. [https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)