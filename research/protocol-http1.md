---
prompt_source: deep-research-prompts.txt:2846-3030 (PROTOCOL · HTTP/1.1)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/2d391a4b-41bf-4491-a38b-fbe41d271f44
research_mode: claude.ai Research
---

# HyperText Transfer Protocol (HTTP/1.1): A Deep Research Brief

> Source material for long-form articles, infographics, and a podcast series. Audience: smart engineers, some new to networking, some experienced. Compiled May 2026; sources prioritized 2024–2026.

---

## 1. Prerequisites and glossary

Every concept here is required for HTTP/1.1 to make sense. Definitions are deliberately tight; authoritative explainers are linked in §12.

**Layering models**

- **OSI 7-layer model**: ISO/IEC 7498-1 conceptual stack — Physical, Data link, Network, Transport, Session, Presentation, Application. HTTP is "Layer 7."
- **TCP/IP 4-layer model**: The model the Internet actually uses (RFC 1122) — Link, Internet, Transport, Application. HTTP rides on top of the Transport layer (TCP), which rides on the Internet layer (IP).

**Encodings**

- **ASCII / US-ASCII**: 7-bit character set (ANSI X3.4-1986) used as the lexical baseline for HTTP/1.1 protocol elements (method names, header field names, status text). RFC 9112 defines the message grammar in ABNF over US-ASCII octets.
- **ISO-8859-1 (Latin-1)**: 8-bit single-byte character set; historically the implicit charset for HTTP `text/*` field values; RFC 9110 §5.5 now requires field values to be limited to visible US-ASCII plus opaque bytes.
- **UTF-8**: Variable-length Unicode encoding (RFC 3629). Default for modern bodies, JSON (RFC 8259), and the new RFC 9651 Display String type.
- **Base64**: Binary-to-text encoding (RFC 4648) — used in HTTP Basic auth credentials and `Sec-WebSocket-Key`.
- **Percent-encoding ("URL-encoding")**: Octet escaping `%HH` defined in RFC 3986; how unsafe bytes survive a URI.
- **Chunked transfer encoding**: HTTP/1.1-only framing where the body is a sequence of `<hex-size>CRLF<bytes>CRLF…0CRLF[trailers]CRLF` (RFC 9112 §7.1).

**Cryptographic primitives**

- **Hash function**: One-way digest (e.g. SHA-256, FIPS 180-4). Used in ETags, Digest auth.
- **HMAC**: Keyed-hash MAC (RFC 2104) — substrate of Digest authentication's `qop=auth` and many bearer-token validations.

**Vocabulary** (from RFC 9110 §3 and RFC 9112 §2 unless noted)

- **socket**: Operating-system endpoint for a TCP/UDP connection (`<IP, port>` 4-tuple including peer).
- **header (field)**: Named metadata item in a request/response. RFC 9110 prefers "field"; "header" remains in common use.
- **checksum**: Integrity value over bytes; HTTP itself has none — relies on TCP/TLS.
- **handshake**: The setup exchange of a connection (TCP 3-way; TLS 1.2 has 2 RTT, TLS 1.3 has 1 RTT and supports 0-RTT).
- **stream**: Logical channel within a multiplexed connection (HTTP/2 frames, HTTP/3 QUIC streams). HTTP/1.1 has no streams — one request occupies the connection.
- **frame**: Smallest protocol unit in HTTP/2 (RFC 9113) and QUIC (RFC 9000). HTTP/1.1 is text-line based and frameless.
- **datagram**: Unreliable packet (UDP, QUIC datagram extension RFC 9221).
- **MIME type / media type**: `type/subtype[;params]` per RFC 2046; conveyed via `Content-Type`.
- **URI / URL / URN**: URI is the umbrella (RFC 3986). URL is a locator (`http://example.com/a`); URN is a name (`urn:isbn:…`).
- **port**: 16-bit TCP/UDP demultiplexer. HTTP defaults to 80; HTTPS to 443 (RFC 9110 §4.2).
- **octet**: 8-bit byte; preferred term in IETF specs.
- **request line**: `method SP request-target SP HTTP-version CRLF` (RFC 9112 §3).
- **status line**: `HTTP-version SP status-code SP [reason-phrase] CRLF` (RFC 9112 §4).
- **CRLF**: Carriage-return + line-feed (`\r\n`, 0x0D 0x0A); HTTP's line terminator.
- **idempotent**: Multiple identical requests produce the same effect as one (RFC 9110 §9.2.2). GET, HEAD, PUT, DELETE, OPTIONS, TRACE.
- **safe method**: No state change intent (RFC 9110 §9.2.1). GET, HEAD, OPTIONS, TRACE.
- **cacheable**: Method/response combination eligible for storage (RFC 9110 §9.2.3, RFC 9111).
- **proxy**: Forwarding intermediary chosen by the client.
- **reverse proxy / gateway**: Acts as an origin to clients but forwards inbound; Cloudflare, nginx-as-LB, Envoy. [RFC Editor](https://www.rfc-editor.org/rfc/rfc9110.pdf)
- **tunnel**: Blind relay (CONNECT method). [RFC Editor](https://www.rfc-editor.org/rfc/rfc9110.pdf)
- **intermediary**: Any of the above.
- **hop-by-hop header**: Applies to a single connection only (e.g. `Connection`, `TE`, `Transfer-Encoding`, `Upgrade`); MUST NOT be forwarded.
- **end-to-end header**: Forwarded unchanged through intermediaries.
- **content negotiation**: Choosing among representations via `Accept*` (proactive) or 300/Vary (reactive) — RFC 9110 §12.
- **entity / payload / message body**: Older terms; RFC 9110 standardizes "content" (the bytes after the empty line) and "representation" (content + metadata).
- **transfer encoding**: How the body is framed on the wire (`chunked`, `gzip`, `deflate`). Hop-by-hop.
- **content encoding**: Compression applied to the representation itself (`gzip`, `br`, `zstd`). End-to-end.
- **persistent connection / keep-alive**: TCP connection reused across multiple HTTP exchanges (default in 1.1).
- **pipelining**: Sending request *N+1* before response *N* arrives (RFC 9112 §9.3.2). Effectively dead in browsers — see §6.

---

## 2. History and story

**1989–1991 — Geneva.** On 12 March 1989 Tim Berners-Lee submitted *Information Management: A Proposal* to his manager Mike Sendall at CERN; Sendall famously wrote "Vague but exciting" on the cover. By Christmas 1990, on a NeXT Cube workstation in his CERN office (sticker: *"This machine is a server. DO NOT POWER IT DOWN!!"*), Berners-Lee had built the first browser/editor `WorldWideWeb`, the first server `CERN httpd`, and served the world's first page from `info.cern.ch`. [Wikipedia + 2](https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web)

**1991–1995 — HTTP/0.9 and HTTP/1.0.** The original "HTTP" was a one-line `GET /path` returning raw HTML; no headers, no status codes. Early features (headers, status codes, MIME types) were added experimentally between 1992 and 1995 in NCSA Mosaic (Marc Andreessen, U. Illinois 1993) and Netscape Navigator. The IETF created the HTTP working group in late 1994. Phillip Hallam-Baker proposed the `Referer` header at CERN in 1995 — and misspelled it; the typo was set in stone before anyone noticed. [Grokipedia + 2](https://grokipedia.com/page/HTTP)

**RFC 1945 (May 1996) — HTTP/1.0**, by Tim Berners-Lee (MIT/LCS), Roy Fielding (UC Irvine), and Henrik Frystyk Nielsen (MIT/LCS). Informational, not a Standard. It documented "common practice" while standardisation continued. [IETF](https://datatracker.ietf.org/doc/html/rfc1945)[IETF](https://datatracker.ietf.org/doc/html/rfc1945)

**RFC 2068 (January 1997) — HTTP/1.1**, by Roy Fielding, Jim Gettys, Jeffrey Mogul, Henrik Frystyk, and Tim Berners-Lee. Introduced persistent connections by default, `Host` header (essential for virtual hosting and IP scarcity), chunked transfer encoding, content negotiation, range requests, cache validators, and pipelining.

**RFC 2616 (June 1999)** revised HTTP/1.1 (same authors plus Larry Masinter and Paul Leach). It became the canonical HTTP reference for **15 years**. [INNOQ](https://www.innoq.com/en/blog/2025/04/a-brief-history-of-http/)

**The long stagnation 1999–2014.** No new HTTP version. The IETF reorganised the work as **httpbis** (chair: **Mark Nottingham**, then at Yahoo!, later Akamai/Fastly/Cloudflare). Editor **Julian Reschke** of greenbytes drove the editorial work alongside Fielding. Roy Fielding's 2000 UC Irvine PhD thesis *"Architectural Styles and the Design of Network-based Software Architectures"* (advisor Richard N. Taylor) retrofitted the **REST** style onto the protocol Fielding had also helped design. SOAP, AJAX, JSON, REST APIs, and HTTPS-everywhere all happened on a frozen RFC 2616. [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/abstract.htm)

**RFC 7230–7235 (June 2014).** Six-document split (Messaging, Semantics, Conditional Requests, Range Requests, Caching, Authentication). Editors: Roy Fielding (Adobe) and Julian Reschke (greenbytes). [RFC Editor](https://www.rfc-editor.org/info/rfc7230)

**RFC 9110, 9111, 9112, 9113, 9114 (June 2022).** The current canonical set, all published the same week:

- **RFC 9110 — HTTP Semantics** (STD 97). Editors Fielding, Nottingham, Reschke. Obsoletes 2818, 7231–7235, 7538, 7615, 7694, parts of 7230. The version-independent core. [IETF](https://datatracker.ietf.org/doc/rfc9110/)
- **RFC 9111 — HTTP Caching**. Replaces 7234.
- **RFC 9112 — HTTP/1.1** (STD 99). Replaces the messaging parts of 7230. Now an Internet Standard, not just Proposed. [RFC Editor](https://www.rfc-editor.org/rfc/rfc9112.html)
- **RFC 9113 — HTTP/2**. Replaces 7540. Notably *deprecates Server Push*.
- **RFC 9114 — HTTP/3**. Editor **Mike Bishop** (Akamai). HTTP over QUIC. [IETF](https://datatracker.ietf.org/doc/html/rfc9114)

**What changed in the last 24 months (mid-2024 → mid-2026):**

- **RFC 9651 — Structured Field Values for HTTP** (Sept 2024), Mark Nottingham (Cloudflare) and Poul-Henning Kamp. Obsoletes RFC 8941; adds Date and Display String types. The ABNF-replacement substrate for new HTTP fields. [IETF + 2](https://datatracker.ietf.org/doc/rfc9651/)
- **RFC 9576/9577/9578 — Privacy Pass** (June 2024). RFC 9577 defines a new HTTP authentication scheme (`Authorization: PrivateToken token=…`). Already in production: Apple's *Private Access Tokens*, Cloudflare's anti-CAPTCHA, Kagi search. [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24456.html)[Apple Developer](https://developer.apple.com/forums/thread/806866)
- **draft-ietf-httpbis-safe-method-w-body — The HTTP QUERY method** (Reschke/Snell/Bishop). At draft -14 (November 2025); declares a safe, idempotent method that takes a body — closing a 25-year gap in the method matrix. [Potaroo](https://www.potaroo.net/ietf/html/ids-wg-httpbis.html)[IETF](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/12/)
- **draft-ietf-httpbis-resumable-upload** (Kleidl/Zhang/Pardue), at draft -11 in March 2026; defines `Upload-Offset`, `Upload-Complete`, and the 104 Upload Resumption Supported informational status. Direct IETF descendant of the tus protocol. [IETF](https://datatracker.ietf.org/doc/active/)
- **draft-ietf-httpbis-rfc6265bis-22** (Bingler/West/Wilander, Dec 2025) — the long-running cookie revision continues, with **draft-ietf-httpbis-layered-cookies-01** (van Kesteren/Hofmann, Apple/Google, Nov 2025) proposing to obsolete *both* RFC 6265 and 6265bis. [IETF](https://datatracker.ietf.org/doc/active/)[IETF](https://datatracker.ietf.org/doc/active/)
- **draft-ietf-httpbis-connect-tcp-11** (B. Schwartz, March 2026) — Template-Driven HTTP CONNECT Proxying for TCP, a MASQUE/proxy spec. [IETF](https://datatracker.ietf.org/doc/active/)
- **draft-ietf-httpbis-pre-denied-00** (Nottingham, April 2026) — proposed status code for early-denied requests. [IETF](https://datatracker.ietf.org/doc/active/)
- **HTTP Working Group rechartering** announced by Mark Nottingham on 7 July 2025; the WG continues under co-chairs **Mark Nottingham** (Cloudflare) and **Tommy Pauly** (Apple), and Pauly is also IAB Chair. [W3C + 3](https://lists.w3.org/Archives/Public/ietf-http-wg/2025JulSep/0005.html)

---

## 3. How it actually works

### 3.1 Message format

```
HTTP-message   = start-line CRLF
                 *( field-line CRLF )
                 CRLF
                 [ message-body ]

start-line     = request-line / status-line
request-line   = method SP request-target SP HTTP-version CRLF
status-line    = HTTP-version SP status-code SP [ reason-phrase ] CRLF
field-line     = field-name ":" OWS field-value OWS
```

(RFC 9112 §2.2, §3, §4, §5; RFC 9110 §5)

- `SP` = single space (0x20). `CRLF` = `\r\n` (0x0D 0x0A). `OWS` = optional whitespace.
- The empty CRLF separates the field section from the body.
- Field names are case-insensitive ASCII tokens; field values are mostly opaque bytes, with structured field syntax available via RFC 9651.

### 3.2 Methods (RFC 9110 §9 + RFC 5789 + draft QUERY)

| Method | Safe | Idempotent | Cacheable | Body req? | Notes |
|---|---|---|---|---|---|
| GET | ✓ | ✓ | ✓ | no | Retrieve representation |
| HEAD | ✓ | ✓ | ✓ | no | Same as GET, no body |
| OPTIONS | ✓ | ✓ | – | optional | CORS preflight, capability discovery |
| TRACE | ✓ | ✓ | – | no | Loopback diagnostic; often disabled |
| POST | ✗ | ✗ | conditional | usually | Process payload; everything-else method |
| PUT | ✗ | ✓ | – | yes | Replace target representation |
| DELETE | ✗ | ✓ | – | optional | Remove resource |
| PATCH (RFC 5789) | ✗ | ✗ | – | yes | Partial update; not idempotent by spec |
| CONNECT | ✗ | ✗ | – | no | Establish TCP tunnel through proxy |
| QUERY (draft-14) | ✓ | ✓ | ✓ | yes | GET-with-body for safe queries |

### 3.3 Status codes (RFC 9110 §15, with notable extensions)

| Code | Class | Meaning | Defined in |
|---|---|---|---|
| 100 | 1xx | Continue | 9110 §15.2.1 |
| 101 | 1xx | Switching Protocols (WebSocket, h2c) | 9110 §15.2.2 |
| 103 | 1xx | Early Hints | RFC 8297 |
| 104 | 1xx | Upload Resumption Supported (draft) | resumable-upload |
| 200 | 2xx | OK | 9110 §15.3.1 |
| 201 | 2xx | Created | 9110 §15.3.2 |
| 204 | 2xx | No Content | 9110 §15.3.5 |
| 206 | 2xx | Partial Content (Range) | 9110 §15.3.7 |
| 301 | 3xx | Moved Permanently | 9110 §15.4.2 |
| 302 | 3xx | Found | 9110 §15.4.3 |
| 303 | 3xx | See Other | 9110 §15.4.4 |
| 304 | 3xx | Not Modified (validator hit) | 9110 §15.4.5 |
| 307 | 3xx | Temporary Redirect (preserves method) | 9110 §15.4.8 |
| 308 | 3xx | Permanent Redirect (preserves method) | 9110 §15.4.9 |
| 400 | 4xx | Bad Request | 9110 §15.5.1 |
| 401 | 4xx | Unauthorized | 9110 §15.5.2 |
| 403 | 4xx | Forbidden | 9110 §15.5.4 |
| 404 | 4xx | Not Found | 9110 §15.5.5 |
| 405 | 4xx | Method Not Allowed | 9110 §15.5.6 |
| 408 | 4xx | Request Timeout | 9110 §15.5.9 |
| 409 | 4xx | Conflict | 9110 §15.5.10 |
| 410 | 4xx | Gone | 9110 §15.5.11 |
| 411 | 4xx | Length Required | 9110 §15.5.12 |
| 413 | 4xx | Content Too Large | 9110 §15.5.14 |
| 414 | 4xx | URI Too Long | 9110 §15.5.15 |
| 415 | 4xx | Unsupported Media Type | 9110 §15.5.16 |
| 416 | 4xx | Range Not Satisfiable | 9110 §15.5.17 |
| 417 | 4xx | Expectation Failed | 9110 §15.5.18 |
| **418** | 4xx | **I'm a Teapot** (joke) | RFC 2324 (1998) |
| 421 | 4xx | Misdirected Request | 9110 §15.5.20 |
| 422 | 4xx | Unprocessable Content | 9110 §15.5.21 |
| 425 | 4xx | Too Early | RFC 8470 |
| 426 | 4xx | Upgrade Required | 9110 §15.5.22 |
| 428 | 4xx | Precondition Required | RFC 6585 |
| 429 | 4xx | Too Many Requests | RFC 6585 |
| 431 | 4xx | Request Header Fields Too Large | RFC 6585 |
| **451** | 4xx | **Unavailable For Legal Reasons** (Bradbury) | RFC 7725 (Tim Bray, Feb 2016) |
| 500 | 5xx | Internal Server Error | 9110 §15.6.1 |
| 501 | 5xx | Not Implemented | 9110 §15.6.2 |
| 502 | 5xx | Bad Gateway | 9110 §15.6.3 |
| 503 | 5xx | Service Unavailable | 9110 §15.6.4 |
| 504 | 5xx | Gateway Timeout | 9110 §15.6.5 |
| 505 | 5xx | HTTP Version Not Supported | 9110 §15.6.6 |
| 511 | 5xx | Network Authentication Required | RFC 6585 |

### 3.4 Header categories and the headers that matter

RFC 9110 collapsed the older "general/request/response/entity" taxonomy into "control data, fields, content, trailers." Inventory of what an engineer actually meets:

- **Routing/framing**: `Host` (mandatory in 1.1, RFC 9112 §3.2; reject with 400 if missing or duplicated), `Connection` (`keep-alive`, `close`, `upgrade` — hop-by-hop), `Content-Length`, `Transfer-Encoding` (`chunked`, `gzip`, `deflate`; hop-by-hop), `TE`, `Trailer`, `Upgrade`.
- **Content metadata**: `Content-Type`, `Content-Encoding` (`gzip`, `br`, `zstd`), `Content-Language`, `Content-Location`, `Content-Disposition`.
- **Negotiation**: `Accept`, `Accept-Encoding`, `Accept-Language`, `Vary` (response side).
- **Auth**: `Authorization`, `WWW-Authenticate`, `Proxy-Authorization`, `Proxy-Authenticate`.
- **Cookies**: `Cookie`, `Set-Cookie` (RFC 6265, 6265bis-22, layered-cookies-01).
- **Caching**: `Cache-Control`, `ETag`, `If-Match`, `If-None-Match`, `If-Modified-Since`, `Last-Modified`, `Expires`, `Pragma` (deprecated in RFC 9111), `Age`, `Vary`.
- **Range**: `Range`, `If-Range`, `Content-Range`, `Accept-Ranges`.
- **Identity / diagnostics**: `User-Agent`, `Server`, `Via`, `Forwarded` (RFC 7239), `Date`, `Referer` (sic), `Location`.
- **Modern security**: `Strict-Transport-Security` (HSTS), `Content-Security-Policy`, `Cross-Origin-*`.

### 3.5 Persistent connections and the death of pipelining

Per RFC 9112 §9, HTTP/1.1 connections are persistent unless `Connection: close` is sent. Pipelining (RFC 9112 §9.3.2) lets a client queue requests on a single connection without waiting for responses. In practice **every major browser disabled or never enabled it** because of:

1. **Head-of-line blocking** — a slow first response stalls all queued ones.
2. **Buggy proxies** that desync request/response order.
3. The smuggling class of attacks (see §6).

Modern guidance: never enable HTTP/1.1 pipelining in production. Use HTTP/2 or HTTP/3 multiplexing instead.

### 3.6 Chunked transfer encoding — wire format

The classic Wikipedia example, byte-by-byte:

```
HTTP/1.1 200 OK\r\n
Content-Type: text/plain\r\n
Transfer-Encoding: chunked\r\n
\r\n
4\r\n
Wiki\r\n
6\r\n
pedia \r\n
E\r\n
in \r\n
\r\n
chunks.\r\n
0\r\n
\r\n
```

Each chunk is `<hex length>CRLF<bytes>CRLF`; `0CRLF[trailers]CRLF` terminates. Note `E` = 14 decimal (matches `"in \r\n\r\nchunks."` length). RFC 9112 §7.1.

### 3.7 Content negotiation and quality values

Proactive: client advertises preferences with quality values 0.0–1.0:

```
Accept: text/html;q=1.0, application/xhtml+xml;q=0.9, */*;q=0.1
Accept-Encoding: br, gzip;q=0.9, identity;q=0.5
Accept-Language: en-US,en;q=0.8,fr;q=0.6
```

Server picks one; signals the choice with `Content-Type`/`Content-Language`/`Content-Encoding` and tells caches what mattered with `Vary: Accept-Encoding, Accept-Language` (RFC 9110 §12, RFC 9111 §4.1).

### 3.8 Caching model (RFC 9111)

A response is **fresh** if `now < generation_time + max_age` (where `max_age` comes from `Cache-Control: max-age=`, falling back to `Expires`). When stale, the cache **validates** with a conditional GET using `If-None-Match: <ETag>` or `If-Modified-Since`. Validation either returns 304 (reuse stored body) or 200 (replace).

Important `Cache-Control` directives (RFC 9111 §5.2):

- `max-age=N` / `s-maxage=N` (shared)
- `public` / `private` / `no-store`
- `no-cache` (must revalidate before reuse) [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
- `must-revalidate` / `proxy-revalidate` (no stale-on-disconnect serving) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9111.html)
- `immutable` (RFC 8246) — version-pinned URL, never validate
- `stale-while-revalidate` / `stale-if-error` (RFC 5861)

`Warning` is now obsolete (RFC 9111 §5.5). [Runebook.dev](https://runebook.dev/en/docs/http/rfc9111/section-8.3)

### 3.9 Authentication (RFC 9110 §11)

- **Basic** (RFC 7617): `Authorization: Basic base64(user:pass)`. Cleartext; only safe over TLS.
- **Digest** (RFC 7616): nonce + `qop=auth` + SHA-256/-512-256; rarely used today.
- **Bearer** (RFC 6750): `Authorization: Bearer <token>`. Foundation of OAuth 2.
- **Privacy Pass** (RFC 9577): `Authorization: PrivateToken token=…` — newest scheme, blind-signed anonymous tokens. [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24456.html)

### 3.10 Upgrade mechanism

The hop-by-hop `Upgrade` + `Connection: Upgrade` allows in-place protocol switch on a single TCP connection. Two big users:

- **WebSocket** (RFC 6455) bootstraps via `Upgrade: websocket`; server replies **101 Switching Protocols** with `Sec-WebSocket-Accept = base64(SHA1(client-key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")) :antCitation[]{citations="fcb0b77d-9ecc-4046-ba3d-2ea23622de28" injected="space"}`.
- **h2c** (cleartext HTTP/2): `Upgrade: h2c` from HTTP/1.1; in practice nearly nobody used h2c — HTTP/2 in the wild is `h2` over TLS+ALPN.

### 3.11 CONNECT tunneling

`CONNECT example.com:443 HTTP/1.1` asks a forward proxy to open a raw TCP tunnel. Used for HTTPS through corporate proxies and for the new MASQUE work (UDP/IP over HTTP).

### 3.12 Range requests (RFC 9110 §14)

`Range: bytes=0-499` → 206 with `Content-Range: bytes 0-499/2345`. Multiple ranges produce `multipart/byteranges`. The `Range` header is the basis of resumable downloads — and was the attack surface for CVE-2011-3192 (§6).

### 3.13 Robustness principle controversy

Postel's "be conservative in what you do, be liberal in what you accept" — RFC 9110 §2 and RFC 9112 §11 explicitly *push back* on Postel: leniency in HTTP/1.1 framing is the root cause of nearly all request-smuggling bugs (Kettle 2019, 2025).

### 3.14 Real on-the-wire byte sequences

**Request (38 bytes header section + 0-byte body):**

```
GET /index.html HTTP/1.1\r\n
Host: example.com\r\n
User-Agent: curl/8.5.0\r\n
Accept: */*\r\n
\r\n
```

Hex (first line): `47 45 54 20 2F 69 6E 64 65 78 2E 68 74 6D 6C 20 48 54 54 50 2F 31 2E 31 0D 0A`

**Response:**

```
HTTP/1.1 200 OK\r\n
Date: Tue, 05 May 2026 10:00:00 GMT\r\n
Server: nginx/1.27.4\r\n
Content-Type: text/html; charset=utf-8\r\n
Content-Length: 13\r\n
Cache-Control: max-age=60\r\n
ETag: "9a1f-deadbeef"\r\n
\r\n
Hello, world!
```

### 3.15 Sequence diagram — keep-alive request/response

ServerClientServerClient#mermaid-roo{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-roo .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-roo .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-roo .error-icon{fill:#CC785C;}#mermaid-roo .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-roo .edge-thickness-normal{stroke-width:1px;}#mermaid-roo .edge-thickness-thick{stroke-width:3.5px;}#mermaid-roo .edge-pattern-solid{stroke-dasharray:0;}#mermaid-roo .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-roo .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-roo .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-roo .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-roo .marker.cross{stroke:#A1A1A1;}#mermaid-roo svg{font-family:inherit;font-size:16px;}#mermaid-roo p{margin:0;}#mermaid-roo .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-roo text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-roo .actor-line{stroke:#A1A1A1;}#mermaid-roo .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-roo .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-roo #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-roo .sequenceNumber{fill:#5e5e5e;}#mermaid-roo #sequencenumber{fill:#E5E5E5;}#mermaid-roo #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-roo .messageText{fill:#E5E5E5;stroke:none;}#mermaid-roo .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-roo .labelText,#mermaid-roo .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-roo .loopText,#mermaid-roo .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-roo .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-roo .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-roo .noteText,#mermaid-roo .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-roo .activation0{fill:transparent;stroke:#00000000;}#mermaid-roo .activation1{fill:transparent;stroke:#00000000;}#mermaid-roo .activation2{fill:transparent;stroke:#00000000;}#mermaid-roo .actorPopupMenu{position:absolute;}#mermaid-roo .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-roo .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-roo .actor-man circle,#mermaid-roo line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-roo :root{--mermaid-font-family:inherit;}TCP three-way handshake (once)Optional TLS 1.3 handshake (1-RTT)Connection: keep-alive (default in HTTP/1.1)SYNSYN+ACKACKClientHello (ALPN: h2,http/1.1)ServerHello, Cert, FinishedFinishedGET /a HTTP/1.1\r\nHost:…\r\n\r\nHTTP/1.1 200 OK + bodyGET /b HTTP/1.1\r\nHost:…\r\n\r\nHTTP/1.1 200 OK + bodyConnection: close (or idle timeout)FIN

---

## 4. Deep connections to other protocols

**TCP (RFC 9293).** HTTP/1.1's transport substrate. Every connection starts with the SYN/SYN-ACK/ACK three-way handshake (≥1 RTT). Slow-start (RFC 5681) caps initial throughput; Nagle's algorithm coalesces small writes — most HTTP servers/clients set `TCP_NODELAY` to disable it. Cloudflare's Pingora rebuild emphasized that **connection reuse** is the dominant performance lever; switching origins to Pingora cut new origin connections by ~3× and, for one major customer, raised the connection-reuse ratio from 87.1% to 99.92%, saving "434 years of handshake time per day" globally. [Cloudflare](https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/)

**TLS (RFC 8446 for 1.3).** HTTPS = HTTP over TLS, default port 443. TLS 1.3 cut the handshake to 1 RTT (and 0-RTT with replay risk). **ALPN** (RFC 7301) negotiates which application protocol runs above TLS: `h2`, `http/1.1`, `h3`. The 2010s shift to HTTPS-by-default was driven by the Snowden disclosures (2013), Let's Encrypt's free CA (launched 2015), browser pressure (Chrome's "Not Secure" labels from 2018), and HSTS (RFC 6797). As of mid-September 2025 ~43% of human-generated connections to Cloudflare are protected with the post-quantum **X25519MLKEM768** hybrid key agreement; by March 2025 it exceeded one-third of human web traffic to Cloudflare. TLS 1.0/1.1 are deprecated (RFC 8996, 2021); plain HTTP increasingly blocked. [Cloudflare](https://blog.cloudflare.com/automatically-secure/)[Cloudflare](https://blog.cloudflare.com/post-quantum-zero-trust/)

**HTTP/2 (RFC 9113, 2022; was RFC 7540, 2015).** Same semantics as HTTP/1.1 (RFC 9110), different wire format: binary frames over a single TCP connection, multiplexed streams, **HPACK** header compression (RFC 7541). Server Push was *removed* in RFC 9113 (browsers had stopped honoring it). HTTP/2 dominates today's modern web and is roughly half of Cloudflare traffic; HTTP/3 share is climbing.

**HTTP/3 (RFC 9114, 2022).** Same semantics; transport is **QUIC** (RFC 9000) over UDP, with TLS 1.3 baked in. Eliminates TCP head-of-line blocking. Per Cloudflare Radar's *2025 Year in Review*, 15 countries/regions now send more than a third of their requests over HTTP/3; bot-heavy networks remain mostly HTTP/1.x. ALPN id is `h3`. Discovery via `Alt-Svc` (RFC 7838) or DNS HTTPS records. [Cloudflare](https://blog.cloudflare.com/radar-2025-year-in-review/)[Cloudflare](https://blog.cloudflare.com/radar-2025-year-in-review/)

**WebSocket (RFC 6455, 2011).** Pure piggyback: HTTP/1.1 Upgrade handshake, then frames are WebSocket's own protocol (not HTTP). RFC 8441 added bootstrapping over HTTP/2 via Extended CONNECT; RFC 9220 over HTTP/3. [RFCinfo + 3](https://rfcinfo.com/rfc-6455/)

**REST.** Roy Fielding's 2000 UC Irvine dissertation (Chapter 5) names six architectural constraints: **client-server, stateless, cacheable, layered, uniform interface, and (optional) code-on-demand**. Fielding wrote both the dissertation and the HTTP RFCs — REST is the post-hoc rationale for HTTP's design choices, not the other way around. [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)

**SOAP.** XML-based RPC by Microsoft/IBM/others (W3C, 2003), tunneled over HTTP POST with `SOAPAction` header. The verbose enterprise alternative that REST/JSON displaced in the 2010s. Still common in finance, telco, and SAP ecosystems.

**JSON-RPC 2.0** (jsonrpc.org spec, 2010). Lightweight stateless RPC; conventionally over HTTP POST with `Content-Type: application/json`. Sees a renaissance in 2024–2026 as the wire format for AI agent protocols.

**OAuth 2.0 (RFC 6749, 2012) + Bearer (RFC 6750).** Pure HTTP overlay: redirects (302/303) for the authorization-code dance, `Authorization: Bearer` for resource access, well-known URIs (RFC 8615) for discovery (`/.well-known/oauth-authorization-server`, RFC 8414, and `/.well-known/oauth-protected-resource`, **RFC 9728**, April 2025). **OAuth 2.1** is at draft-15 (March 2026); it consolidates a decade of best practices, mandates PKCE for the Authorization Code flow, and removes the Implicit and Resource Owner Password Credentials grants. [IETF + 2](https://datatracker.ietf.org/doc/html/rfc6750)

**MCP — Model Context Protocol** (Anthropic, launched 25 Nov 2024). Wire format is JSON-RPC 2.0; transports are **stdio** (local) and **Streamable HTTP** (remote). The original 2024-11-05 spec used HTTP+SSE on two endpoints (GET for SSE, POST for messages); the 2025-03-26 revision introduced **Streamable HTTP** — a single endpoint accepting POST and GET, with optional SSE streaming on the response side, plus an `Mcp-Session-Id` response header for stateful sessions. The HTTP+SSE transport is deprecated; backwards compatibility is documented. Authentication is OAuth 2.1-style (PKCE mandatory, RFC 9728 Resource Metadata). [GitHub + 5](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md)

**A2A — Agent2Agent** (Google, announced 9 April 2025; v0.3 on 31 July 2025 added gRPC support). Built directly on HTTPS + JSON-RPC 2.0 + Server-Sent Events. Agents publish an **Agent Card** at `/.well-known/agent.json` (analogous to robots.txt); supports synchronous request/response, SSE streaming for long tasks, and webhook push notifications. >150 partner organizations including Salesforce, SAP, Atlassian, ServiceNow, MongoDB, PayPal, LangChain. [Apono + 7](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)

**Other relatives:**

- **HTTP/0.9** — one-line `GET /path`, no headers, no status, only HTML. RFC 9112 Appendix C.1 still describes it.
- **HTTP/1.0** (RFC 1945, 1996) — added headers and status codes; no `Host`, so virtual hosting was a kludge.
- **Server-Sent Events** — `text/event-stream` over HTTP, defined in WHATWG HTML Living Standard; one-way push. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-incremental-00)
- **gRPC** — Google's RPC framework; runs **only on HTTP/2**. Conceptual sibling of REST.
- **CoAP** (RFC 7252, 2014) — constrained-device HTTP analog over UDP for IoT.
- **QUIC** (RFC 9000) — transport for HTTP/3.
- **ALPN** (RFC 7301) — TLS extension for protocol selection.
- **Alt-Svc** (RFC 7838) — `Alt-Svc: h3=":443"` advertises alternate transports.
- **MIME** (RFC 2045–2049) — where `Content-Type`, multipart bodies, and base64 came from. RFC 9112 Appendix B explicitly documents HTTP-vs-MIME divergences.
- **URI/URL** (RFC 3986) — `http`/`https` schemes are formally re-defined in RFC 9110 §4.2.
- **Cookies** (RFC 6265, 2011) — currently being replaced by 6265bis-22 / layered-cookies-01.
- **SMTP** (RFC 5321) — HTTP's header-line, `Name: value` style is direct DNA from RFC 822 mail headers.
- **FTP** (RFC 959, 1985) — the protocol HTTP killed: dual control/data connections, opaque sessions, badly behaved through firewalls.
- **Gopher** (RFC 1436, 1993) — HTTP's hierarchical predecessor; effectively extinct after the web's rise.

---

## 5. Real-world deployment

**Servers.** Per Netcraft's December 2025 survey (1.39 billion sites): nginx 24.6%, Apache httpd ~12.6%, Cloudflare ~13.5%, OpenResty 6.83%, Microsoft IIS ~1.4%. Nginx overtook Apache for total sites in April 2019 and overtook Apache among the top-million busiest sites in early 2025. Other heavyweights: **Caddy** (memory-safe, automatic Let's Encrypt), **lighttpd**, **HAProxy**, **Envoy** (used by every modern service mesh), **LiteSpeed** (~14.8% by some industry counts; dominant in HTTP/3 web hosting). Igor Sysoev created nginx in 2002 and left NGINX, Inc. in 2022 after 20 years. [Netcraft + 5](https://www.netcraft.com/blog/december-2025-web-server-survey)

**Cloudflare's Pingora** (Rust, open-sourced 28 Feb 2024) replaced the company's NGINX-based proxy. By 2024 it was serving **>1 trillion requests per day**; the open-source crate is "battle tested as it has been serving more than 40 million Internet requests per second for more than a few years"; in production Pingora consumes about 70% less memory and 60% less CPU than the legacy stack. Pingora-origin alone clears 35 million requests per second. The 2025 *trie-hard* optimization removed 1.28% of CPU across the fleet by speeding up internal-header stripping. [LowEndTalk + 6](https://lowendtalk.com/discussion/181437/cloudflare-ditches-nginx-for-in-house-rust-written-pingora)

**Other CDN/edge scale points:** Fastly publicly states its edge cloud "processes 1.8 trillion HTTP requests daily." Cloudflare's network averages ~81 million requests/sec and peaks at 129 million RPS as of 2025. Akamai Pingora-equivalent scale is similar order-of-magnitude. [Fastly](https://www.fastly.com/blog/fastlys-resilience-to-http-1-1-desynchronization-attacks)[Medium](https://medium.com/@sunnykgupta/the-engineers-tl-dr-top-internet-trends-from-cloudflare-s-report-6277e8103590)

**Client libraries.** libcurl (Daniel Stenberg, 1998–); Go `net/http` (stdlib); Python `urllib3`/`requests` (Kenneth Reitz, 2011) and the modern HTTP/2-capable `httpx`; Node.js built-in `http`/`https` and `undici`; Java `java.net.http.HttpClient` (JDK 11+); Rust `hyper` (low-level) and `reqwest` (high-level); OkHttp (Square, Android-dominant); .NET `HttpClient`. Reference implementations from CERN/W3C: **libwww** (1992–), the original test bed for HTTP semantics.

**Traffic-version share (Cloudflare Radar 2025 Year in Review).** Globally, HTTP/2 remains dominant (~50%+); HTTP/3 has plateaued around 21–28% for human traffic; HTTP/1.x remains substantial (~25–30% globally) and is *over-represented* in bot traffic. Seven countries/regions saw HTTP/3 below 10% in 2025 due to bot HTTP/1.x dominance: Hong Kong, Dominica, Singapore, Ireland, Iran, Seychelles, Gibraltar. 15 countries crossed one-third HTTP/3; Georgia hit 38%. (Note: snippets from secondary aggregators citing Radar give slightly different breakdowns; *the canonical real-time chart is at radar.cloudflare.com*.) [Cloudflare](https://blog.cloudflare.com/radar-2025-year-in-review/)

---

## 6. Failure modes and famous incidents

**HTTP request smuggling — the original (Watchfire, 2005).** Chaim Linhart, Amit Klein, Ronen Heled, Steve Orrin published *"HTTP Request Smuggling"* — exploited disagreements between front-end and back-end on `Content-Length` vs `Transfer-Encoding` framing. [arXiv](https://arxiv.org/html/2510.09952v1)[Trimstray](https://trimstray.github.io/assets/pdfs/HTTP-Request-Smuggling.pdf)

**Slowloris (Robert "RSnake" Hansen, 2009).** Single host opens many TCP connections and dribbles partial headers, exhausting Apache's per-connection thread pool. Mitigation: nginx event loop, Apache's `mod_reqtimeout`, reverse-proxy buffering. [Jsmon Blog](https://blogs.jsmon.sh/what-is-slowloris-attack-ways-to-exploit-examples-and-impact/)[Invicti](https://www.invicti.com/learn/slowloris-attack)

**Apache Range Header DoS — CVE-2011-3192 (August 2011).** A `Range: bytes=0-,5-1,5-2,…` header with many overlapping ranges caused Apache 1.3 / 2.0.x prior to 2.0.65 / 2.2.x prior to 2.2.20 to allocate enormous buffers per request. Patched in 2.2.21. [ScanRepeat + 3](https://scanrepeat.com/web-security-knowledge-base/apache-range-header-dos-cve-2011-3192)

**Heartbleed (CVE-2014-0160, OpenSSL).** A TLS bug, not HTTP, but it spilled HTTPS-protected memory across the web. Cited here because every HTTPS deployment was affected.

**HTTP Desync Attacks: Request Smuggling Reborn (James Kettle, PortSwigger, Black Hat USA 2019).** Industrialised the Watchfire idea; coined the modern attack taxonomy: CL.TE, TE.CL, TE.TE.

**HTTP/2: The Sequel is Always Worse (Kettle, Black Hat EU 2021).** Moved smuggling into HTTP/2-to-HTTP/1.1 downgrade interfaces.

**Browser-Powered Desync Attacks (Kettle, Black Hat USA 2022).** Attacks executed inside a victim's browser against servers like Amazon, Akamai, AWS ALB, Cisco ASA WebVPN. [Dark Reading](https://www.darkreading.com/application-security/researcher-at-black-hat-describes-new-htpp-request-smuggling-attack)

**HTTP/2 Rapid Reset — CVE-2023-44487 (October 2023).** Attackers exploited HTTP/2's `RST_STREAM` to open and instantly cancel streams, leaving the server doing useless work. Coordinated disclosure by Google, AWS, and Cloudflare. Peak attacks: 398 million RPS (Google), 201 million RPS (Cloudflare), 155 million RPS (AWS) — all multiples of the previous record. Tracks back to HTTP/1.1 because many HTTP/2 deployments translate downstream into HTTP/1.1, propagating the abuse. [Cloudflare](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)[Qualys](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)

**MadeYouReset — CVE-2025-8671 (August 2025).** Variant of Rapid Reset using protocol-violation-triggered server-side resets; affects Apache Tomcat (CVE-2025-48989), F5 BIG-IP (CVE-2025-54500), Netty (CVE-2025-55163). Cloudflare's Pingora was protected by 2023 Rapid Reset mitigations; the underlying `h2` Rust crate <0.4.11 was potentially vulnerable. [The Hacker News](https://thehackernews.com/2025/08/new-http2-madeyoureset-vulnerability.html)[Cloudflare](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)

**HTTP/1.1 Must Die: The Desync Endgame (Kettle, Black Hat USA 2025 / DEF CON 33).** New classes including 0.CL desync, parser-discrepancy primitives, browser-powered desync, chunk-extension obfuscation. Public CVEs assigned: **CVE-2025-32094** (Akamai), **CVE-2025-4366** (Cloudflare Pingora ingress), **CVE-2025-43859**, **CVE-2025-55315**. Kettle's banner thesis: *"HTTP/1.1 has a fatal flaw: attackers can create extreme ambiguity about where one request ends and the next request starts."* PortSwigger and the research team netted >$200k in bug bounties in two weeks. Recommended fix: deprecate HTTP/1.1 on internal/upstream hops; use HTTP/2 end-to-end. [Blackhat + 4](https://i.blackhat.com/BH-USA-25/Presentations/US-25-Kettle-HTTP1-Must-Die-The-Desync-Endgame-Wednesday.pdf?_gl=1*insvcm*_gcl_au*MTQxNTIwMzQ0My4xNzUxNjIyNjMz*_ga*MjAxODUxMTg0OC4xNzUxNjIyNjM0*_ga_K4JK67TFYV*czE3NTY3OTU5ODEkbzU1JGcxJHQxNzU2Nzk2NzYyJGo1NSRsMCRoMA..&_ga=2.111489220.1394109082.1756795982-2018511848.1751622634)

**Common production pitfalls.**

- `Transfer-Encoding: chunked` *and* `Content-Length` both sent → smuggling vector. RFC 9112 §6 says strip the `Content-Length` and trust `Transfer-Encoding`; many parsers don't. [SecQuest](https://www.secquest.co.uk/white-papers/http-request-smuggling)
- Duplicate `Content-Length` headers with different values.
- Header injection via CR/LF in user-controlled input → response splitting (CWE-113).
- Hop-by-hop header confusion: forwarding `Connection`, `TE`, `Upgrade`, `Trailer`, `Transfer-Encoding`, `Keep-Alive`, `Proxy-Authenticate`, `Proxy-Authorization` end-to-end.
- Mismatched timeouts between L4/L7/origin causing zombie sockets and slowloris-amplification.

---

## 7. Fun facts and anecdotes

- **The `Referer` typo (Phillip Hallam-Baker, March 1995).** In a public mailing-list reply Hallam-Baker wrote: *"That's okay, neither one (referer or referrer) is understood by 'spell' anyway. I say we should just blame it on France."* The misspelling rode RFC 1945 (1996) into permanent infamy. Modern specs (Referrer-Policy, the DOM `referrer` property) use the correct spelling — making the mismatch worse. [W3C](https://lists.w3.org/Archives/Public/ietf-http-wg/1995JanMar/0109.html)[Wikipedia](https://en.wikipedia.org/wiki/HTTP_referer)
- **HTTP 418 I'm a Teapot.** RFC 2324, 1 April 1998, by Larry Masinter, then at Xerox PARC: the *Hyper Text Coffee Pot Control Protocol*. Per Masinter, "satire — to spoof ways in which HTTP had been extended inappropriately." Extended for tea by RFC 7168 (April 2014). In August 2017 Mark Nottingham asked Node.js, Go, Python `requests`, and ASP.NET to drop 418; **15-year-old Shane Brunswick** registered save418.com and the #save418 hashtag, the projects reversed, and 418 has been formally reserved ever since. Python 3.9 (Oct 2020) shipped `IM_A_TEAPOT`. `google.com/teapot` returns a real 418. [The History of the Web](https://thehistoryoftheweb.com/im-a-teapot/)[Wikipedia](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
- **HTTP 451 Unavailable For Legal Reasons (RFC 7725, Tim Bray, February 2016).** Number chosen as a deliberate Bradbury reference (*Fahrenheit 451* — the temperature at which paper auto-ignites). Originally informal proposals by Chris Applegate (2008) and Terence Eden (2012). Includes a `Link: <…>; rel="blocked-by"` header to identify the entity enforcing the block. [HTTP Tiger + 2](https://httptiger.org/codes/451.html)
- **The "X-" deprecation (RFC 6648, June 2012).** Saint-Andre, Crocker, Nottingham. After 30 years of `X-Forwarded-For`, `X-Frame-Options`, etc., the IETF formally said: stop using `X-`. Existing names get grandfathered; *new* parameters MUST NOT use the prefix. [Hjp](https://www.hjp.at/doc/rfc/rfc6648.html)[RFC Editor](https://www.rfc-editor.org/rfc/rfc6648)
- **Tim Berners-Lee's NeXT.** One of Steve Jobs' post-Apple machines. Sticker still readable in CERN's archive. The first website still resolves: `http://info.cern.ch/hypertext/WWW/TheProject.html`.
- **Why "GET" not "RETRIEVE."** Berners-Lee's sensibility favored extreme brevity: methods were 3–7 ASCII chars to be readable in `telnet`. The same taste produced `Host`, `If-Match`, `Vary`.
- **Why `Host` was added in 1.1.** Pre-Host, one IP = one site. With virtual hosting, a single IPv4 could front thousands of sites — vital as IPv4 exhaustion approached. RFC 9112 §3.2: a 1.1 server **must** reject requests lacking `Host`.
- **Do Not Track.** Proposed by Mozilla (Sid Stamm, Jonathan Mayer, 2010). Killed by the absence of any enforcement mechanism and Microsoft's decision to turn it on by default in IE10, which advertisers used as grounds to ignore it. Officially withdrawn by W3C TPWG in 2018. Survives as `Sec-GPC` (Global Privacy Control).
- **Quotable Roy Fielding** (dissertation, 2000): *"REST emphasizes scalability of component interactions, generality of interfaces, independent deployment of components, and intermediary components to reduce interaction latency, enforce security, and encapsulate legacy systems."* [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/abstract.htm)
- **Quotable Mark Nottingham** (RFC 9518, 2023): *"Centralization is best understood not as a single condition, but as a tendency that emerges from the interaction of design choices, market structure, and policy."*
- **Quotable James Kettle** (Black Hat 2025): *"In truth, HTTP/1.1 is so densely packed with critical vulnerabilities, you can literally find them by mistake."* [Cybernoz](https://cybernoz.com/http-1-1-must-die-what-this-means-for-in-house-pentesters/)[PortSwigger](https://portswigger.net/blog/http-1-1-must-die-what-this-means-for-in-house-pentesters)

---

## 8. Practical wisdom

- **Connection pooling.** For a typical service-to-service call: pool size ≈ p99 concurrent in-flight requests. Defaults: Go `http.Transport` `MaxIdleConnsPerHost = 2` (raise it!); Node.js `http.Agent` `maxSockets = ∞` per host (cap it!); Java `HttpClient` shares one pool by default.
- **Keep-alive timeouts.** nginx `keepalive_timeout 75s` (default); Apache `KeepAliveTimeout 5` (default — too short for many APIs); Go server `IdleTimeout` defaults to 0 (no idle timeout, uses ReadHeaderTimeout); Node `server.keepAliveTimeout = 5000ms`. Mismatched client/server timeouts produce 502s on closed sockets. Always set the **server** timeout > **load balancer** idle > **upstream connection idle**.
- **Pipelining is dead — never enable it.** Modern browsers don't, modern proxies don't reliably handle it, request smuggling thrives on it.
- **Defaults to be skeptical of.**
  - `proxy_buffer_size` (nginx default 4k or 8k) — too small breaks long Set-Cookie chains.
    - `client_max_body_size 1m` (nginx) — 413 surprises on PUT/POST.
    - `LimitRequestFieldSize 8190` (Apache) — same for huge JWTs in headers.
    - Cloudflare default request body cap (100 MB on Free).
- **Monitor.** RPS, p50/p95/p99 latency, *connection-reuse ratio* (Cloudflare's flagship metric — a 12% gap costs you "434 years per day" at scale), 4xx vs 5xx ratios separately, retry-after counts, slow-loris signature (high concurrent-conn-per-IP with low byte-rate).
- **Debugging toolkit.** `curl -v --http1.1`, `curl --trace-ascii`, `tcpdump -i any -A 'tcp port 80'`, Wireshark with the `http` display filter, `mitmproxy` (open-source, scriptable), Charles (commercial, GUI), browser DevTools Network panel. For TLS-encrypted traffic, set `SSLKEYLOGFILE` so Wireshark can decrypt.
- **Common misconfigurations.** Missing `Host` handling in custom servers (silent fallback to first vhost = security bug); incorrect `Content-Length` (off-by-one truncates body); double `Content-Length`; `Content-Length` + `Transfer-Encoding: chunked` (smuggling); not stripping hop-by-hop headers in proxies.

---

## 9. Learning resources (current as of May 2026)

**RFCs (free, authoritative).**

- RFC 9110 *HTTP Semantics* (June 2022) — start here. Section 9 (methods), 15 (status codes), 11 (auth). Advanced.
- RFC 9111 *HTTP Caching* (June 2022). Intermediate.
- RFC 9112 *HTTP/1.1* (June 2022). Advanced. The wire format Bible.
- RFC 9113 *HTTP/2* (June 2022). Advanced.
- RFC 9114 *HTTP/3* (June 2022). Advanced.
- RFC 9651 *Structured Field Values* (Sept 2024). Intermediate; obsoletes RFC 8941.
- RFC 6455 *WebSocket* (Dec 2011). Intermediate.

**Books.**

- *HTTP: The Definitive Guide* — David Gourley & Brian Totty, O'Reilly 2002. **Note: 23 years old.** Conceptually still excellent (caching chapter, proxies, intermediaries) but predates persistent HTTPS, HTTP/2, HTTP/3, and modern security. Treat as historical context. Intro→Intermediate.
- *High Performance Browser Networking* — Ilya Grigorik (Google → Shopify), O'Reilly 2013, freely readable at hpbn.co. **No major paper revision since 2013** — the HTTP/3 and modern TLS chapters are not in print; the website has minor errata. Still the best single-volume primer on networking-for-the-web. Intermediate→Advanced. [Amazon](https://www.amazon.com/High-Performance-Browser-Networking-performance/dp/1449344763)
- *Web Protocols and Practice* — Krishnamurthy & Rexford, 2001. Academic, dated, but the proxy/caching chapters are still uniquely deep. Advanced.
- *Learning HTTP/2* — Stephen Ludin & Javier Garza, O'Reilly 2017. Practical HTTP/2 deployment. Intermediate.
- *Real-World Cryptography* — David Wong, Manning 2021. Companion to TLS chapters. Intermediate.

**Academic papers & theses.**

- Roy T. Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine 2000. The REST source. [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- Padhye, Firoiu, Towsley, Kurose, *"Modeling TCP Throughput: A Simple Model and its Empirical Validation"*, SIGCOMM 1998 — cited everywhere in HTTP performance work.
- Fielding & Reschke, *"HTTP Semantics and Content"*, RFC 7231/9110 — read alongside.
- Recent ACM IMC 2025 papers on HTTP/2 conformance and middlebox compliance (e.g. Attia et al., *"The Developer, the RFC, and the Middlebox"*). [ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/RFC9110)

**Engineering blogs (active 2024–2026).**

- Cloudflare Blog — Lucas Pardue, Yagiz Nizipli, Sam Bhuiyan; *Pingora* series, *MadeYouReset* (Aug 2025), *HTTP/3 usage* (annual), *Radar Year in Review*.
- PortSwigger Research — James Kettle. The smuggling canon.
- Google Online Security Blog — Rapid Reset disclosure.
- AWS Architecture Blog — desync mitigation mode (ALB).
- Stripe API design philosophy (Brandur Leach, archives).
- Discord Engineering — "How Discord Stores Trillions of Messages" and HTTP-edge posts.
- Netflix Tech Blog — edge tier, ZUUL.
- Fastly Blog — Mark Nottingham, Kazuho Oku.

**YouTube / talks.**

- *HTTP/1.1 Must Die — The Desync Endgame*, James Kettle, Black Hat USA 2025 / DEF CON 33.
- *HTTP/2 The Sequel is Always Worse*, Kettle, Black Hat EU 2021.
- *HTTP/3*, Lucas Pardue, multiple Cloudflare TV episodes (2023–2025).
- Mark Nottingham QCon and IETF talks on Structured Fields (2024–2025).
- Stanford CS144 *Computer Networks* lectures (Nick McKeown, Philip Levis) — full course freely posted.
- *HTTP 203* podcast/video — Jake Archibald & Surma (now intermittent; archive on Chrome Developers YouTube).

**Podcasts.**

- *Software Engineering Daily* — multiple HTTP/QUIC episodes.
- *Signals & Threads* (Jane Street) — episodes on internal RPC and protocol design.
- *Cloudflare TV* — Lucas Pardue protocol-week archives.

**University courses.**

- Stanford **CS144** Computer Networks (McKeown/Levis). Reference course; lab builds a TCP stack.
- MIT **6.829** Computer Networks (graduate).
- CMU **15-441** Computer Networks.
- Berkeley **CS168**.

**Hands-on tooling.**

- `mitmproxy` — scriptable interception proxy (open source).
- HTTP Toolkit — Tim Perry; modern GUI mitmproxy alternative.
- Postman / Bruno / HTTPie — request crafting.
- httpbin.org and requestbin — toy reflectors for debugging.
- Wireshark with `http`, `http.request.method == "GET"`, `tls.handshake.type == 1` filters.
- Browser DevTools Network panel; **Initiator** column is underused for tracing.

---

## 10. Where things are heading (2025–2026 frontier)

- **HTTP/1.1's role is shrinking but not vanishing.** Bot traffic, CLI tools (curl, scripts), legacy IoT, internal microservices, and debugging will keep it alive for a decade. Browser→edge traffic is now overwhelmingly HTTP/2 or HTTP/3.
- **The IETF httpbis pipeline (active in 2025–2026).** Per the IETF Datatracker active drafts list, current work items include:
  - **QUERY method** (draft -14, Nov 2025) — heading for IESG.
    - **Resumable uploads** (draft -11, March 2026).
    - **Cookies (6265bis-22, Dec 2025)** and the more radical **layered-cookies-01** that would obsolete both 6265 and 6265bis.
    - **No-Vary-Search** caching extension.
    - **Connect-tcp** (draft -11) for MASQUE-style template proxying.
    - **HTTP Unencoded Digest** (draft -04, March 2026).
    - **Pre-Denied** status (draft -00, April 2026, Nottingham).
    - **Incremental HTTP Messages** — formalize streaming behavior across versions.
    - **Privacy Pass** suite finalized as RFC 9576/9577/9578 (June 2024), now deploying in production (Apple PAT, Cloudflare, Kagi).
- **HTTP/3 adoption curve.** Roughly 21–30% of human web traffic in 2025 (Cloudflare), with 15+ countries above one-third. Crawlers/search-engine bots remain stubbornly on HTTP/1.x or HTTP/2. The biggest blocker is middlebox UDP filtering and limited HTTP/3 support in older client libraries.
- **Post-quantum impact on HTTP.** As of mid-September 2025, **~43% of human-generated connections to Cloudflare** use the **X25519MLKEM768** hybrid key agreement. ML-KEM ClientHellos no longer fit in a single packet, exposing decade-old protocol-ossification bugs in middleboxes (tracked at tldr.fail). Post-quantum *signatures* (ML-DSA) for certificates remain harder — larger, slower, not yet at default-on scale. [Cloudflare](https://blog.cloudflare.com/automatically-secure/)[Cloudflare](https://blog.cloudflare.com/post-quantum-to-origins/)
- **Working Group leadership (2025–2026).** httpbis is co-chaired by **Mark Nottingham** (Cloudflare; chair since 2007; on IAB from IETF 122 in March 2025) and **Tommy Pauly** (Apple; also IAB Chair). The Area Director rotation, plus Nottingham's July 2025 rechartering proposal, signal continued investment. [Sched + 2](https://igf2025.sched.com/mnot)
- **Deprecations.** TLS 1.0/1.1 dead (RFC 8996, 2021). Plain HTTP increasingly blocked: Chrome warns; Apple Private Relay strips. HTTP/2 Server Push removed in RFC 9113. RFC 9111 marks `Warning` obsolete. RFC 6648 deprecated `X-` prefixes back in 2012 and is finally near-universal.
- **Security frontier.** James Kettle's 2025 thesis is moving from research to engineering policy: **HTTP/1.1 on upstream/origin hops should be deprecated**. Fastly already enforces this internally; Akamai and Cloudflare patched specific desync CVEs; nginx still has gaps for 0.CL. [Fastly + 2](https://www.fastly.com/blog/fastlys-resilience-to-http-1-1-desynchronization-attacks)

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook (read aloud — written for the ear):**

> Thirty-five years ago, in a Swiss physics lab, a quiet British engineer wrote a memo his boss called *"vague but exciting."* Tim Berners-Lee's Christmas-1990 NeXT cube — the one with the handwritten sticker reading "DO NOT POWER IT DOWN" — booted the world's first web server. The protocol it spoke had no version, no headers, just one verb: **GET**. By 1997 that toy had become **HTTP/1.1**, and for fifteen years the web stood still on a single document, RFC 2616. Then in 2014, the whole spec was split into six. In 2022, it was rewritten as five. In 2024, structured fields modernized its DNA. And in August 2025, James Kettle stood on a Black Hat stage and said the unthinkable: *"HTTP/1.1 must die."* This is the story of a protocol that refuses to.

**Striking statistic.** **Cloudflare's Pingora proxy serves over a trillion requests per day** while using *one third* of the CPU and memory of its NGINX predecessor — and improved connection reuse for one major customer from 87.1% to 99.92%, saving "**434 years of TLS/TCP handshake time per day**." [LowEndTalk + 2](https://lowendtalk.com/discussion/181437/cloudflare-ditches-nginx-for-in-house-rust-written-pingora)

**Pause-and-think moment.** *"The protocol RFC says when both `Content-Length` and `Transfer-Encoding: chunked` are present, ignore the Content-Length. But which parser in your stack actually does that — your CDN, your load balancer, your application server, or your ORM-side library? If any two of them disagree, an attacker can pour bytes into one request that another sees as the next user's request. This is request smuggling. It's been known since 2005. We're still finding new variants in 2026."*

**Failure-story arc.**

- **Setup.** August 2023: Google, AWS, and Cloudflare each see record DDoS traffic. Cloudflare logs 201 million requests per second; AWS 155M; Google peaks at 398 million RPS — *five times* the previous record, from a botnet of just 22,000 machines. [Qualys](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)[CSO Online](https://www.csoonline.com/article/655106/built-in-weakness-in-http-2-protocol-exploited-for-massive-ddos-attacks.html)
- **Mistake.** HTTP/2's RST_STREAM frame lets a client cancel a stream and immediately open another. The protocol counts only open or half-closed streams against the concurrency cap. Servers were trusting that asymmetry. [Cloudflare](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
- **Consequence.** Almost every HTTP/2 implementation on Earth is vulnerable. CVE-2023-44487 (CVSS 7.5) is filed under coordinated disclosure on 10 October 2023. [OpenLogic](https://www.openlogic.com/blog/cve-2023-44487-http-2-rapid-reset)[Anvilogic](https://www.anvilogic.com/threat-reports/http2-rapid-reset-ddos-cve-2023)
- **Resolution.** Web servers and proxies ship `RST_STREAM` rate-limits. Cloudflare, AWS, and Google patch first; nginx, Apache, IIS, F5, Tomcat, Envoy, Netty all follow within weeks. Two years later, MadeYouReset (CVE-2025-8671) shows the family isn't dead — but the 2023 mitigations blunt it. The lesson: **modern HTTP versions inherit twenty years of HTTP/1.1's framing ambiguities, and every layer of leniency you add to your parser is a security liability.**

---

## 12. Citations

1. RFC 9112 — HTTP/1.1 (June 2022, STD 99). [https://www.rfc-editor.org/rfc/rfc9112.html](https://www.rfc-editor.org/rfc/rfc9112.html) — DOI 10.17487/RFC9112
2. RFC 9110 — HTTP Semantics (June 2022, STD 97). [https://www.rfc-editor.org/rfc/rfc9110.html](https://www.rfc-editor.org/rfc/rfc9110.html) — DOI 10.17487/RFC9110
3. RFC 9111 — HTTP Caching (June 2022). [https://www.rfc-editor.org/rfc/rfc9111.html](https://www.rfc-editor.org/rfc/rfc9111.html) — DOI 10.17487/RFC9111
4. RFC 9113 — HTTP/2 (June 2022). [https://datatracker.ietf.org/doc/rfc9113/](https://datatracker.ietf.org/doc/rfc9113/) — DOI 10.17487/RFC9113
5. RFC 9114 — HTTP/3 (June 2022). [https://datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114) — DOI 10.17487/RFC9114
6. RFC 7230 — HTTP/1.1 Message Syntax (June 2014, obsoleted). [https://www.rfc-editor.org/info/rfc7230](https://www.rfc-editor.org/info/rfc7230) — DOI 10.17487/RFC7230
7. RFC 2616 — HTTP/1.1 (June 1999). [https://www.w3.org/Protocols/rfc2616/rfc2616-sec17.html](https://www.w3.org/Protocols/rfc2616/rfc2616-sec17.html)
8. RFC 2068 — HTTP/1.1 (January 1997). Cited at [https://www.rfc-editor.org/info/rfc2068](https://www.rfc-editor.org/info/rfc2068)
9. RFC 1945 — HTTP/1.0 (May 1996). [https://datatracker.ietf.org/doc/html/rfc1945](https://datatracker.ietf.org/doc/html/rfc1945)
10. RFC 9651 — Structured Field Values (Sept 2024). [https://www.rfc-editor.org/rfc/rfc9651](https://www.rfc-editor.org/rfc/rfc9651) — DOI 10.17487/RFC9651 [W3C](https://lists.w3.org/Archives/Public/ietf-http-wg/2024JulSep/0316.html)
11. RFC 8941 — Structured Field Values (Feb 2021, obsoleted by 9651). [https://www.rfc-editor.org/rfc/rfc8941](https://www.rfc-editor.org/rfc/rfc8941)
12. RFC 6648 — Deprecating "X-" Prefix (June 2012). [https://www.rfc-editor.org/rfc/rfc6648](https://www.rfc-editor.org/rfc/rfc6648) — DOI 10.17487/RFC6648
13. RFC 6455 — The WebSocket Protocol (Dec 2011). [https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)
14. RFC 7725 — HTTP Status 451 (Tim Bray, Feb 2016). [https://datatracker.ietf.org/doc/html/rfc7725](https://datatracker.ietf.org/doc/html/rfc7725)
15. RFC 2324 — HTCPCP / 418 I'm a Teapot (April 1, 1998). [https://www.rfc-editor.org/rfc/rfc2324](https://www.rfc-editor.org/rfc/rfc2324)
16. RFC 7168 — HTCPCP-TEA (April 2014). Referenced via Wikipedia article above.
17. RFC 6749 — OAuth 2.0 (Oct 2012). [https://datatracker.ietf.org/doc/html/rfc6749](https://datatracker.ietf.org/doc/html/rfc6749)
18. RFC 6750 — OAuth 2.0 Bearer Token (Oct 2012). [https://datatracker.ietf.org/doc/html/rfc6750](https://datatracker.ietf.org/doc/html/rfc6750)
19. draft-ietf-oauth-v2-1 — OAuth 2.1 (latest -15, March 2026). [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
20. RFC 9728 — OAuth 2.0 Protected Resource Metadata (April 2025). Referenced via OAuth roadmap draft.
21. RFC 9576 — Privacy Pass Architecture (June 2024). [https://www.rfc-editor.org/info/rfc9576](https://www.rfc-editor.org/info/rfc9576)
22. RFC 9577 — Privacy Pass HTTP Authentication Scheme (June 2024). [https://datatracker.ietf.org/doc/rfc9577/](https://datatracker.ietf.org/doc/rfc9577/) — DOI 10.17487/RFC9577
23. RFC 9578 — Privacy Pass Issuance Protocols (June 2024). [https://www.rfc-editor.org/rfc/rfc9578.html](https://www.rfc-editor.org/rfc/rfc9578.html)
24. draft-ietf-httpbis-safe-method-w-body — HTTP QUERY method, latest -14 (18 Nov 2025). [https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/)
25. draft-ietf-httpbis-resumable-upload — Resumable Uploads for HTTP, draft -11 (2 March 2026). [https://datatracker.ietf.org/doc/draft-ietf-httpbis-resumable-upload/](https://datatracker.ietf.org/doc/draft-ietf-httpbis-resumable-upload/)
26. draft-ietf-httpbis-rfc6265bis-22 — Cookies (1 Dec 2025). [https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/)
27. draft-ietf-httpbis-layered-cookies-01 (van Kesteren/Hofmann, 18 Nov 2025). [https://datatracker.ietf.org/doc/draft-ietf-httpbis-layered-cookies/](https://datatracker.ietf.org/doc/draft-ietf-httpbis-layered-cookies/)
28. draft-ietf-httpbis-connect-tcp-11 (Schwartz, 20 March 2026). Active drafts listing [https://datatracker.ietf.org/doc/active/](https://datatracker.ietf.org/doc/active/)
29. draft-ietf-httpbis-pre-denied-00 (Nottingham, 3 April 2026). [https://datatracker.ietf.org/person/mnot@mnot.net](https://datatracker.ietf.org/person/mnot@mnot.net)
30. IETF httpbis active drafts. [https://www.potaroo.net/ietf/html/ids-wg-httpbis.html](https://www.potaroo.net/ietf/html/ids-wg-httpbis.html) and [https://datatracker.ietf.org/doc/active/](https://datatracker.ietf.org/doc/active/)
31. IETF httpbis WG rechartering proposal (Mark Nottingham, 7 July 2025). [https://lists.w3.org/Archives/Public/ietf-http-wg/2025JulSep/0005.html](https://lists.w3.org/Archives/Public/ietf-http-wg/2025JulSep/0005.html)
32. Mark Nottingham IETF profile (chair since 2007; Cloudflare). [https://datatracker.ietf.org/person/mnot@mnot.net](https://datatracker.ietf.org/person/mnot@mnot.net) and [https://www.mnot.net/personal/resume/](https://www.mnot.net/personal/resume/)
33. Tommy Pauly IETF profile (httpbis co-chair, IAB Chair). [https://datatracker.ietf.org/person/Tommy%20Pauly](https://datatracker.ietf.org/person/Tommy%20Pauly)
34. Tim Berners-Lee, *Information Management: A Proposal*, March 1989, CERN. [https://cds.cern.ch/record/369245/files/dd-89-001.pdf](https://cds.cern.ch/record/369245/files/dd-89-001.pdf) and the HTML reproduction [https://www.w3.org/History/1989/proposal.html](https://www.w3.org/History/1989/proposal.html)
35. CERN, *A short history of the Web*. [https://home.cern/science/computing/birth-web/short-history-web](https://home.cern/science/computing/birth-web/short-history-web)
36. World Wide Web Foundation, *History of the Web*. [https://webfoundation.org/about/vision/history-of-the-web/](https://webfoundation.org/about/vision/history-of-the-web/)
37. Wikipedia, *History of the World Wide Web* (last edited 2025). [https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web](https://en.wikipedia.org/wiki/History_of_the_World_Wide_Web)
38. Roy T. Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine 2000. [https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm) and [https://roy.gbiv.com/pubs/dissertation/fielding_dissertation.pdf](https://roy.gbiv.com/pubs/dissertation/fielding_dissertation.pdf)
39. Phillip Hallam-Baker on the Referer typo (10 March 1995). [https://lists.w3.org/Archives/Public/ietf-http-wg/1995JanMar/0109.html](https://lists.w3.org/Archives/Public/ietf-http-wg/1995JanMar/0109.html)
40. Wikipedia, *Phillip Hallam-Baker*. [https://en.wikipedia.org/wiki/Phillip_Hallam-Baker](https://en.wikipedia.org/wiki/Phillip_Hallam-Baker)
41. Wikipedia, *HTTP referer*. [https://en.wikipedia.org/wiki/HTTP_referer](https://en.wikipedia.org/wiki/HTTP_referer)
42. Watchfire/Linhart-Klein-Heled-Orrin, *HTTP Request Smuggling* (2005). [https://trimstray.github.io/assets/pdfs/HTTP-Request-Smuggling.pdf](https://trimstray.github.io/assets/pdfs/HTTP-Request-Smuggling.pdf) and the Bugtraq announcement [https://seclists.org/bugtraq/2005/Jun/25](https://seclists.org/bugtraq/2005/Jun/25)
43. James Kettle, *HTTP Desync Attacks: Request Smuggling Reborn* (Black Hat USA 2019). [https://portswigger.net/research/http-desync-attacks-request-smuggling-reborn](https://portswigger.net/research/http-desync-attacks-request-smuggling-reborn)
44. James Kettle, *HTTP/2: The Sequel is Always Worse* (Black Hat EU 2021). [https://portswigger.net/research/http2](https://portswigger.net/research/http2)
45. James Kettle, *HTTP/1.1 Must Die: The Desync Endgame*, Black Hat USA 2025 slides. [https://i.blackhat.com/BH-USA-25/Presentations/US-25-Kettle-HTTP1-Must-Die-The-Desync-Endgame-Wednesday.pdf](https://i.blackhat.com/BH-USA-25/Presentations/US-25-Kettle-HTTP1-Must-Die-The-Desync-Endgame-Wednesday.pdf) and PortSwigger blog [https://portswigger.net/blog/http-1-1-must-die-what-this-means-for-in-house-pentesters](https://portswigger.net/blog/http-1-1-must-die-what-this-means-for-in-house-pentesters)
46. Fastly response to Kettle 2025 (CVE-2025-32094, CVE-2025-4366). [https://www.fastly.com/blog/fastlys-resilience-to-http-1-1-desynchronization-attacks](https://www.fastly.com/blog/fastlys-resilience-to-http-1-1-desynchronization-attacks)
47. The Hacker News, *MadeYouReset / CVE-2025-8671* (Aug 2025). [https://thehackernews.com/2025/08/new-http2-madeyoureset-vulnerability.html](https://thehackernews.com/2025/08/new-http2-madeyoureset-vulnerability.html)
48. Cloudflare, *MadeYouReset thwarted by Rapid Reset mitigations* (2025). [https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)
49. CISA, *HTTP/2 Rapid Reset, CVE-2023-44487* (10 Oct 2023). [https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
50. Cloudflare, *HTTP/2 Rapid Reset: technical breakdown* (2023). [https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
51. Apache, *CVE-2011-3192 — Range header DoS*. [https://httpd.apache.org/security/CVE-2011-3192.txt](https://httpd.apache.org/security/CVE-2011-3192.txt)
52. Slowloris attack background; RSnake 2009. [https://www.invicti.com/learn/slowloris-attack](https://www.invicti.com/learn/slowloris-attack) and DEV Community write-up [https://dev.to/kalkwst/boring-a-server-to-death-the-slow-loris-attack-2do](https://dev.to/kalkwst/boring-a-server-to-death-the-slow-loris-attack-2do)
53. Cloudflare Radar, *2025 Year in Review*. [https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/) and [https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)
54. Cloudflare Radar, *2024 Year in Review*. [https://blog.cloudflare.com/radar-2024-year-in-review/](https://blog.cloudflare.com/radar-2024-year-in-review/)
55. Cloudflare, *How we built Pingora* (2022/2024). [https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/](https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/)
56. Pingora open-source repository (Cloudflare). [https://github.com/cloudflare/pingora](https://github.com/cloudflare/pingora)
57. Cloudflare, *trie-hard: saving compute 1% at a time* (2025). [https://blog.cloudflare.com/pingora-saving-compute-1-percent-at-a-time/](https://blog.cloudflare.com/pingora-saving-compute-1-percent-at-a-time/)
58. Netcraft Web Server Survey, December 2025. [https://www.netcraft.com/blog/december-2025-web-server-survey](https://www.netcraft.com/blog/december-2025-web-server-survey) ; March 2025 [https://www.netcraft.com/blog/march-2025-web-server-survey](https://www.netcraft.com/blog/march-2025-web-server-survey) ; August 2025 [https://www.netcraft.com/blog/august-2025-web-server-survey](https://www.netcraft.com/blog/august-2025-web-server-survey)
59. Cloudflare, *State of the post-quantum Internet in 2025*. [https://blog.cloudflare.com/pq-2025/](https://blog.cloudflare.com/pq-2025/)
60. Cloudflare, *Conventional cryptography is under threat / Zero Trust PQC* (March 2025). [https://blog.cloudflare.com/post-quantum-zero-trust/](https://blog.cloudflare.com/post-quantum-zero-trust/)
61. Cloudflare, *Automatically Secure: 6,000,000 domains* (2025). [https://blog.cloudflare.com/automatically-secure/](https://blog.cloudflare.com/automatically-secure/)
62. Anthropic, MCP Specification 2025-03-26 — Transports. [https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
63. fka.dev, *Why MCP Deprecated SSE and Went with Streamable HTTP* (June 2025). [https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
64. Auth0, *Why MCP's Move Away from SSE Simplifies Security* (2025). [https://auth0.com/blog/mcp-streamable-http/](https://auth0.com/blog/mcp-streamable-http/)
65. Cloudflare Agents docs, MCP Transport. [https://developers.cloudflare.com/agents/model-context-protocol/transport/](https://developers.cloudflare.com/agents/model-context-protocol/transport/)
66. Google Developers Blog, *Announcing the Agent2Agent Protocol* (April 2025). [https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
67. A2A Protocol GitHub. [https://github.com/a2aproject/A2A](https://github.com/a2aproject/A2A)
68. A2A Protocol specification. [https://a2a-protocol.org/latest/specification/](https://a2a-protocol.org/latest/specification/)
69. IBM, *What Is Agent2Agent (A2A) Protocol?* [https://www.ibm.com/think/topics/agent2agent-protocol](https://www.ibm.com/think/topics/agent2agent-protocol)
70. Apono, *What is A2A and How to Adopt It?* (covering v0.3 July 2025 release). [https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)
71. arXiv, *Improving Google A2A Protocol* (May 2025). [https://arxiv.org/pdf/2505.12490](https://arxiv.org/pdf/2505.12490)
72. MDN, *HTTP caching*. [https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
73. MDN, *Cache-Control* header. [https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
74. MDN, *Evolution of HTTP*. [https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP)
75. INNOQ, *A Brief History of HTTP* (April 2025). [https://www.innoq.com/en/blog/2025/04/a-brief-history-of-http/](https://www.innoq.com/en/blog/2025/04/a-brief-history-of-http/)
76. Wikipedia, *Hyper Text Coffee Pot Control Protocol* (RFC 2324; Save 418 movement; Mark Nottingham 2017). [https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
77. Wikipedia, *HTTP 451*. [https://en.wikipedia.org/wiki/HTTP_451](https://en.wikipedia.org/wiki/HTTP_451)
78. Wikipedia, *WebSocket* (RFC 6455 history; Ian Hickson; Ian Fette). [https://en.wikipedia.org/wiki/WebSocket](https://en.wikipedia.org/wiki/WebSocket)
79. Akamai blog (Mike Bishop), *The Next Generation of HTTP* — covers RFC 9110–9114 publication. [https://www.akamai.com/blog/news/the-next-generation-of-http](https://www.akamai.com/blog/news/the-next-generation-of-http)
80. Wikipedia, *REST*. [https://en.wikipedia.org/wiki/REST](https://en.wikipedia.org/wiki/REST)
81. Ilya Grigorik, *High Performance Browser Networking* (O'Reilly 2013, hpbn.co). [https://hpbn.co/](https://hpbn.co/)
82. PortSwigger, *Top 10 web hacking techniques of 2024*. [https://portswigger.net/research/top-10-web-hacking-techniques-of-2024](https://portswigger.net/research/top-10-web-hacking-techniques-of-2024)
83. James Kettle's research portfolio. [https://jameskettle.com/](https://jameskettle.com/)
84. SquidSec, *HTTP Request Smuggling in 2025* (Nov 2025) — pipelining vs smuggling. [https://squidhacker.com/2025/11/http-request-smuggling-in-2025-how-to-distinguish-real-desync-vulnerabilities-from-http-request-pipelining-and-stop-wasting-everyones-time/](https://squidhacker.com/2025/11/http-request-smuggling-in-2025-how-to-distinguish-real-desync-vulnerabilities-from-http-request-pipelining-and-stop-wasting-everyones-time/)
85. Cloudflare, *Examining HTTP/3 usage one year on* (2023). [https://blog.cloudflare.com/http3-usage-one-year-on/](https://blog.cloudflare.com/http3-usage-one-year-on/)
86. W3Techs, HTTP/3 and HTTP/2 usage stats. [https://w3techs.com/technologies/details/ce-http3](https://w3techs.com/technologies/details/ce-http3) and [https://w3techs.com/technologies/details/ce-http2](https://w3techs.com/technologies/details/ce-http2)
87. WebSocket.org, *WebSocket Protocol Guide* — handshake, RFC 8441 over HTTP/2, RFC 9220 over HTTP/3. [https://websocket.org/guides/websocket-protocol/](https://websocket.org/guides/websocket-protocol/)
88. WebSocket.org, *WebSocket HTTP Headers Reference*. [https://websocket.org/reference/headers/](https://websocket.org/reference/headers/)
89. ALM Corp summary of Cloudflare Radar 2025 — caveat: secondary aggregator, included for traffic-share narrative; primary source is Cloudflare Radar itself. [https://almcorp.com/blog/cloudflare-radar-2025-year-in-review-complete-analysis/](https://almcorp.com/blog/cloudflare-radar-2025-year-in-review-complete-analysis/)
90. IETF blog, *New IAB and IESG seated at IETF 122* (March 2025). [https://www.ietf.org/blog/nomcom-announcement-2025/](https://www.ietf.org/blog/nomcom-announcement-2025/)
91. IETF httpbis WG materials. [https://httpwg.org/wg-materials/](https://httpwg.org/wg-materials/)
92. CERN Document Server, *Information Management: A Proposal* PDF. [https://cds.cern.ch/record/369245/files/dd-89-001.pdf](https://cds.cern.ch/record/369245/files/dd-89-001.pdf)
93. The History of the Web, *Sorry Computer, You're Not a Teapot*. [https://thehistoryoftheweb.com/im-a-teapot/](https://thehistoryoftheweb.com/im-a-teapot/)
94. The Register, *IETF publishes HTTP/3 RFC* (June 2022). [https://www.theregister.com/2022/06/07/http3_rfc_9114_published/](https://www.theregister.com/2022/06/07/http3_rfc_9114_published/)
95. Wikipedia, *HTTP* and *HTTP/1.1* version history (Grokipedia/Wikipedia cross-references). [https://grokipedia.com/page/HTTP](https://grokipedia.com/page/HTTP)

**Caveats / unsourced or contested items.** (1) Wikipedia/Grokipedia were used only for historical narrative cross-checks and timeline scaffolding; the underlying primary RFCs/CERN docs are cited above. (2) Linux web-server market-share at the OS level (Command Linux 2025) should be treated as secondary. (3) Some "trillion requests/day" claims (Pingora 1T/day, Fastly 1.8T/day) are public marketing numbers from the vendors' engineering blogs — likely directionally correct but unaudited. (4) Cloudflare 2025 Radar HTTP-version share is summarised across blog posts and the live Radar dashboard; specific percentage breakdowns for HTTP/1.1 vs 2 vs 3 fluctuate week-to-week and are best read off [https://radar.cloudflare.com/adoption-and-usage](https://radar.cloudflare.com/adoption-and-usage) at consumption time. (5) Quotes attributed to Berners-Lee (Mike Sendall's "Vague but exciting") and to Phillip Hallam-Baker (Referer email) are well-attested in primary sources cited; the broader "story" framing in §2 reflects historical consensus and should be sanity-checked against the original CERN proposal text before publication. (6) The exact `[needs source]` items: precise Apache/Nginx default keepalive_timeout values cited reflect documentation as of 2025 but are environment- and distribution-specific. The "434 years/day handshake savings" figure is Cloudflare's; the assumption set (request volume, RTT distribution, pre-Pingora reuse rate) is described in their post but not independently audited.