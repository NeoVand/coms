---
prompt_source: deep-research-prompts.txt:3392-3576 (WS)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/d762c7ea-455c-4e29-b04d-f2badfd5e5d9
research_mode: claude.ai Research
---

# The WebSocket Protocol: A Deep Educational Reference (May 2026)

## TL;DR

- **WebSocket (WS), defined by RFC 6455 (Dec 2011, edited by Ian Fette of Google and Alexey Melnikov of Isode), is still the dominant browser-native, full-duplex, message-framed transport on top of TCP+TLS — universally supported (~99% of browsers since 2012), and as of early 2026 it remains the right default for real-time web work despite the existence of HTTP/2 bootstrap (RFC 8441), HTTP/3 bootstrap (RFC 9220), and WebTransport.** The HTTP/3 bootstrap and WebTransport are real but not yet broadly shipped in production browsers/servers. [WebSocket](https://websocket.org/guides/future-of-websockets/)
- **The most consequential changes in the last 24 months are not in RFC 6455 itself but in its ecosystem**: a wave of high-impact CVEs in major implementations (CVE-2024-37890 in Node `ws`; CVE-2025-10148 in libcurl reviving the very cache-poisoning attack masking was designed to prevent; CVE-2025-43855 in tRPC; CVE-2025-5399 in libcurl), the archival and successful re-forking of Gorilla WebSocket (Go) and `nhooyr/websocket` becoming `coder/websocket`, Cloudflare's WebSocket Hibernation API for Durable Objects, Slack's documented 5M+ concurrent sessions, and the AI-agent-protocol (MCP, A2A) debate over whether to use WebSockets, SSE, or HTTP+SSE-streamable as the transport.
- **For builders**: Use `wss://` (TLS) over HTTP/1.1 today; enable `permessage-deflate` only when you understand BREACH/CRIME risk; design for sticky-less reconnection with idempotency keys and bounded buffers; track close-code distributions (1000/1001/1006/1008/1011/1012); expect WebTransport to become a genuine option for *some* workloads (gaming, unreliable datagrams) by 2027–2028 but not a wholesale replacement.

---

## 1. Prerequisites and Glossary

WebSocket only makes sense once a few layered concepts are clear. The protocol straddles the application and transport layers and inherits behaviour from each.

- **OSI / TCP-IP layers.** The OSI 7-layer model (Physical, Data Link, Network, Transport, Session, Presentation, Application) is conceptual; the practical model on the internet is the 4-layer TCP/IP stack (Link, Internet/IP, Transport/TCP-UDP, Application). WebSocket is an *application-layer* protocol that runs over a single TCP connection, optionally wrapped in TLS, and that negotiates itself via HTTP. (See RFC 6455 §1.7, "Relationship to TCP and HTTP.")
- **TCP (Transmission Control Protocol).** A reliable, in-order, byte-stream transport; delivers a stream of bytes with no inherent message boundaries. WebSocket re-introduces message boundaries via its frame format on top of TCP. [Wikipedia](https://en.wikipedia.org/wiki/WebSocket)[Sociss Class](https://sociss.edu.vn/lessons/web-socket)
- **UDP (User Datagram Protocol).** Connectionless datagrams; used by QUIC (and therefore HTTP/3 and WebTransport) but not by classic WebSocket.
- **TLS (Transport Layer Security).** Cryptographic encapsulation of TCP. `wss://` = WebSocket-over-TLS-over-TCP, conventionally on port 443; `ws://` = plaintext, conventionally on port 80.
- **Socket.** An OS-level endpoint of a bidirectional communication channel, identified by (IP, port, protocol). The "WebSocket" name is a deliberate echo: it gives JavaScript in a browser something close to raw socket semantics, with safety rails.
- **Header.** A key/value metadata pair carried on a request, response, or frame. WebSocket uses HTTP headers only during the opening handshake (`Upgrade`, `Connection`, `Sec-WebSocket-*`); once the upgrade completes, headers disappear and binary *frames* take over.
- **Frame.** A unit of WebSocket data on the wire: a small fixed prefix (FIN, RSV1-3, opcode, MASK, payload-length) followed by an optional 4-byte mask and the payload.
- **Message.** One or more contiguous frames with the same opcode (the first frame's). Fragmentation is a property of the protocol, not the application.
- **Datagram.** A self-contained, unreliable packet (UDP, QUIC datagrams, WebTransport datagrams). WebSocket does *not* expose datagrams; it is strictly a reliable byte/message stream.
- **Stream.** A logical, ordered byte/message channel. HTTP/2 and HTTP/3 multiplex many streams over one connection; classic WebSocket = one stream per TCP connection.
- **Handshake.** A negotiation prelude: TCP handshake (3-way SYN/SYN-ACK/ACK), TLS handshake (1.3 = 1-RTT or 0-RTT), then the WebSocket *opening handshake* (HTTP `Upgrade: websocket` request + `101 Switching Protocols` response). Closure has its own *closing handshake* (Close frames).
- **Checksum.** Integrity check at lower layers (IP, TCP). WebSocket does not add its own; it relies on TCP for reliability and TLS for integrity.
- **Encoding scheme.** WebSocket text frames must be valid UTF-8 (RFC 3629); the protocol *requires* the receiver to fail the connection on invalid UTF-8 in a text frame (RFC 6455 §8.1). Binary frames are application-defined byte sequences. Base64 (RFC 4648) is used to encode the 16-byte client nonce in `Sec-WebSocket-Key` and the 20-byte SHA-1 digest in `Sec-WebSocket-Accept`.
- **Cryptographic primitives.** SHA-1 (FIPS 180-4) is used in the handshake for `Sec-WebSocket-Accept`, *not* as a security primitive but as a unique-string proof; the protocol relies on TLS for confidentiality. Per-frame XOR masking with a 32-bit key derived from a strong RNG (RFC 4086) is *not* encryption — it is an anti-cache-poisoning primitive (more on that below). [IETF](https://tools.ietf.org/html/rfc6455)
- **Origin.** The (scheme, host, port) tuple of the page that opened the WebSocket; sent by the browser in the `Origin` header at handshake time so servers can enforce same-origin/CORS-style policy.
- **Subprotocol.** A higher-level application protocol negotiated via `Sec-WebSocket-Protocol` (e.g., `mqtt`, `v12.stomp`, `wamp`, `graphql-transport-ws`).
- **Extension.** A wire-level modification negotiated via `Sec-WebSocket-Extensions` (e.g., `permessage-deflate` from RFC 7692).

Authoritative explainers: RFC 6455 (`https://www.rfc-editor.org/rfc/rfc6455`), MDN's "Writing WebSocket servers" (`https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers`), Ilya Grigorik's *High Performance Browser Networking* ch. 17 (`https://hpbn.co/websocket/`). [O'Reilly](https://www.oreilly.com/library/view/high-performance-browser/9781449344757/ch17.html)

---

## 2. History and Story

**Pre-history (2005–2008): the Comet era.** Before WebSocket existed, "real-time web" meant *Comet* — Alex Russell's umbrella term for HTTP long-polling, hidden iframes, and `XMLHttpRequest` streaming hacks. Long-polling held a request open until the server had something to say; BOSH (Bidirectional-streams Over Synchronous HTTP, XEP-0124) wrapped XMPP over the same trick. These worked, but they paid the full HTTP-header tax on every message, used multiple connections, and confused intermediaries. (RFC 6202 documents the practice and its problems and is cited by RFC 6455 §1.1.) [Sociss Class](https://sociss.edu.vn/lessons/web-socket)[RFC Editor](https://www.rfc-editor.org/rfc/rfc6455.html)

**The naming, June 2008.** WebSocket was first sketched as `TCPConnection` in the HTML5 draft. **Michael Carter** led a series of `whatwg` mailing-list/IRC discussions in June 2008 that produced the first version of the protocol; the name "WebSocket" was coined together with **Ian Hickson** (then at Google, editor of HTML5/WHATWG) on the `#whatwg` IRC channel, and Hickson authored it into the HTML5 spec. ([Wikipedia history section, citing the original WHATWG mailing-list and IRC logs](https://en.wikipedia.org/wiki/WebSocket); [Carter's `cometdaily` announcement](https://en.wikipedia.org/wiki/WebSocket).) [Wikipedia + 2](https://en.wikipedia.org/wiki/WebSocket)

**2009: First browser ship.** Google Chrome 4 shipped WebSocket enabled by default in December 2009. Firefox 4 followed in 2011 (`MozWebSocket` initially, then `WebSocket`). [Wikipedia](https://en.wikipedia.org/wiki/WebSocket)

**Feb 2010: protocol moves to IETF.** Development moved from W3C/WHATWG to a new IETF working group called **HyBi** ("BiDirectional or Server-Initiated HTTP"), formed to standardise the wire protocol. (IETF HyBi WG charter: `https://datatracker.ietf.org/wg/hybi/about/`.) Ian Hickson authored two more revisions there before handing the editor pen to **Ian Fette (Google)**, joined by **Alexey Melnikov (Isode Ltd.)** as co-editor. [Wireshark Wiki + 4](https://wiki.wireshark.org/WebSocket)

**Drafts: hixie-75, hixie-76, hybi-00 through hybi-17.** The early Hickson drafts (`hixie-75`, `hixie-76`) had two fatal problems: (a) `hixie-76` broke compatibility with reverse proxies by sending eight bytes of key data after the headers without advertising them in `Content-Length`, which intermediaries silently dropped (`https://en.wikipedia.org/wiki/WebSocket`), and (b) more seriously, a security analysis showed the protocol could be tricked into poisoning HTTP caches. Hybi rewrote the wire format and the handshake into the form we know. [GitHub](https://github.com/Atmosphere/atmosphere/wiki/How-to-use-the-older-WebSocket-draft-00-hybi-00-hixie-76-protocol)[Wikipedia](https://en.wikipedia.org/wiki/WebSocket)

**The 2010 security crisis.** The decisive paper was **"Talking to Yourself for Fun and Profit"** by Lin-Shung Huang, Eric Y. Chen, Adam Barth, Eric Rescorla, and Collin Jackson (Carnegie Mellon + Google + RTFM), presented at **W2SP 2011** (`http://www.adambarth.com/papers/2011/huang-chen-barth-rescorla-jackson.pdf`). Using a real ad network, they paid less than $1 per successful exploit to demonstrate that ~7% of browsers sat behind transparent proxies whose buggy HTTP parsing could be tricked, via Java/Flash/HTML5 socket APIs, into IP-hijack and cache-poisoning attacks (Java: 6.1% IP-hijack, Flash: 7%; cache poisoning ~0.2%). They tested three "strawman" handshakes (POST-, Upgrade-, CONNECT-based) and recommended that *every byte the attacker controls on the wire be XOR-masked with a fresh, unpredictable 32-bit key per frame*, so no one byte sequence the attacker chooses appears verbatim on the wire. **In November 2010, in response to these attacks, Mozilla Firefox 4 and Opera 11 shipped WebSocket disabled by default**, and the HyBi WG adopted a variant of the masking proposal that became §5.3 of RFC 6455. ([Slides/paper summary](http://www.adambarth.com/papers/2011/huang-chen-barth-rescorla-jackson.pdf); [Firefox/Opera disable](https://www.spamfighter.com/News-15538-Websocket-Support-Disabled-in-Opera-and-Firefox-Browsers.htm).) [Slideplayer + 2](https://slideplayer.com/slide/3923436/)

**Dec 2011: RFC 6455 published.** Internet Standards Track, DOI 10.17487/RFC6455 (`https://datatracker.ietf.org/doc/rfc6455/`). It is now part of STD 34. The Sec-WebSocket-Version registry advanced through 0, 4, 5, 6, 7, 8 and finalised at **13** — versions 9–12 were burned in the registry but never used because they were editorial-only changes (§4.4 NOTE in RFC 6455). [RFC Editor + 2](https://www.rfc-editor.org/rfc/rfc6455.html)

**Post-2011 evolution.**

- **RFC 7692 (Dec 2015), Compression Extensions for WebSocket** — *editor: Takeshi Yoshino (Google)* — defines `permessage-deflate`, the only widely deployed extension. ([RFC announcement](https://hybi.ietf.narkive.com/3hFsmK9v/rfc-7692-on-compression-extensions-for-websocket).)
- **RFC 7936 (2016)** — clarifies the Subprotocol Name Registry. [Wikidata](https://www.wikidata.org/wiki/Q47471455)
- **RFC 8307 (2018)** — Well-Known URIs for WebSocket. [Wikidata](https://www.wikidata.org/wiki/Q47471455)
- **RFC 8441 (Sep 2018), Bootstrapping WebSockets with HTTP/2** — *editor: Patrick McManus (Mozilla)* — introduces the HTTP/2 *Extended CONNECT* method with `:protocol = websocket` and a new `SETTINGS_ENABLE_CONNECT_PROTOCOL` (value 0x8). It updates RFC 6455. (`https://datatracker.ietf.org/doc/html/rfc8441`.) [IETF + 5](https://datatracker.ietf.org/doc/html/rfc8441)
- **RFC 9220 (June 2022), Bootstrapping WebSockets with HTTP/3** — *editor: Ryan Hamilton (Google)* — adapts the same Extended CONNECT trick to HTTP/3/QUIC. (`https://datatracker.ietf.org/doc/html/rfc9220`.) [Muonics](https://www.muonics.com/rfc/rfc9220.php)

**What changed in 2024–2026 (the 24-month window).** RFC 6455 itself has not changed. What did change:

1. Browser/server implementation status of RFC 8441 stabilised — Firefox 65 (2019) shipped it, Chrome shipped it; many servers (nginx, Spring) still partial. Mattermost, in 2025, documented Chrome 95+ failures behind HTTP/2 proxies that don't translate Extended CONNECT. ([Spring Framework #34044, Dec 2024](https://github.com/spring-projects/spring-framework/issues/34044); [nginx ticket #1992](https://trac.nginx.org/nginx/ticket/1992).) [Mozilla Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1434137)
2. **RFC 9220 has effectively zero production deployment as of early 2026.** Chrome reached only "Intent to Prototype"; Firefox/Safari nothing; LiteSpeed/Caddy do not implement it. ([Chromium Intent to Prototype thread](https://groups.google.com/a/chromium.org/g/blink-dev/c/KOupRe29WhY); [Jetty issue #14294, Jan 2026](https://github.com/jetty/jetty.project/issues/14294).) [WebSocket](https://websocket.org/guides/future-of-websockets/)
3. **Major library churn.** `nhooyr/websocket` (Go) became `coder/websocket` in 2024; `gorilla/websocket` was archived in late 2022 but remained widely used and was un-archived/community-maintained, with releases still landing in 2024 (see `https://github.com/gorilla/websocket/releases`).
4. **A wave of CVEs** disclosed in 2024–2025 (see §6).
5. **AI agent protocols entered the picture.** MCP (Model Context Protocol, Anthropic) and A2A (Agent2Agent, Google) made very deliberate transport choices; MCP's *Streamable HTTP* (POST + optional SSE) replaced an earlier HTTP+SSE transport. A formal MCP SEP-1288 (Aug 2025) proposes a WebSocket transport for MCP (`https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1288`). A2A is JSON-RPC 2.0 + HTTP(S) + SSE; it does *not* mandate WebSocket (`https://a2a-protocol.org/latest/specification/`). [Roo Code](https://docs.roocode.com/features/mcp/server-transports)[IBM](https://www.ibm.com/think/topics/agent2agent-protocol)
6. **Cloudflare's WebSocket Hibernation API** for Durable Objects became GA, billing only when JS executes and surviving idle WebSocket connections without server cost (`https://developers.cloudflare.com/durable-objects/best-practices/websockets/`).

---

## 3. How It Actually Works

### 3.1 Opening handshake (HTTP/1.1)

A WebSocket connection starts as a perfectly ordinary HTTP/1.1 request with `Upgrade: websocket`. From RFC 6455 §1.3 / §4.1:

```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
```

The server, if it accepts, replies with `101 Switching Protocols`:

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

`Sec-WebSocket-Accept` is computed deterministically: take the client's base64-encoded `Sec-WebSocket-Key`, **concatenate** the **magic GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`**, **SHA-1** the result, **base64-encode** the 20-byte digest. (RFC 6455 §4.2.2.) This is *not* authentication — it is a self-contained proof that the server actually understood the WebSocket handshake (rather than, e.g., being a confused HTTP cache). The GUID was chosen because it is a globally-unique random value "unlikely to be used by network endpoints that do not understand the WebSocket Protocol" (RFC 6455 §1.3 / §4.1). [justprotocols](https://justprotocols.com/protocols/websocket)[Gangofcoders](https://www.gangofcoders.net/solution/what-does-258eafa5-e914-47da-95ca-c5ab0dc85b11-means-in-websocket-protocol/)

Header reference (RFC 6455 §11.3):

| Header | Direction | Meaning |
|---|---|---|
| `Upgrade: websocket` | both | Standard HTTP upgrade token. |
| `Connection: Upgrade` | both | Required for the upgrade to be processed by HTTP/1.1 intermediaries. |
| `Sec-WebSocket-Key` | client→server | 16 random bytes, base64-encoded (24 chars). |
| `Sec-WebSocket-Accept` | server→client | base64(SHA1(Key + GUID)). |
| `Sec-WebSocket-Version` | client→server | `13` is the only accepted value today (per IANA registry). [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-WebSocket-Version) |
| `Sec-WebSocket-Protocol` | both | Comma-separated subprotocols offered by client; [IETF](https://datatracker.ietf.org/doc/html/rfc6455) single chosen subprotocol returned by server. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) |
| `Sec-WebSocket-Extensions` | both | Offered/accepted extensions [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (e.g., `permessage-deflate`). |
| `Origin` | client→server | The page's origin — used by the server for origin policy. |

### 3.2 Frame format (RFC 6455 §5.2)

Bit layout (frames are byte-aligned; first row = bits 0–31):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               | Masking-key, if MASK set to 1 |
+-------------------------------+-------------------------------+
|     Masking-key (continued)   |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

- **FIN (1 bit).** 1 = final frame of message; 0 = more frames will follow (fragmentation). [IETF](https://tools.ietf.org/html/rfc6455)
- **RSV1, RSV2, RSV3 (1 bit each).** MUST be 0 unless an extension that defines them is negotiated. `permessage-deflate` (RFC 7692) defines RSV1 = "this frame's payload is DEFLATE-compressed". [IETF](https://tools.ietf.org/html/rfc6455)
- **Opcode (4 bits).** `0x0` continuation, `0x1` text (UTF-8), `0x2` binary, `0x8` close, `0x9` ping, `0xA` pong; `0x3-0x7` reserved non-control, `0xB-0xF` reserved control. [IETF + 3](https://tools.ietf.org/html/rfc6455)
- **MASK (1 bit).** **Client-to-server frames MUST set MASK=1; server-to-client frames MUST set MASK=0.** A server that receives an unmasked frame MUST fail the connection with code 1002 (RFC 6455 §5.1). [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- **Payload length (7 bits, with extension).** 0–125 = literal length; 126 = next 2 bytes are uint16 length; 127 = next 8 bytes are uint64 length (high bit MUST be 0). Maximum is 2^63 bytes per frame. [justprotocols + 2](https://justprotocols.com/protocols/websocket)
- **Masking key (32 bits, present iff MASK=1).** Random per-frame.
- **Payload data.** Optionally compressed (if `permessage-deflate` agreed and RSV1=1), then XOR-masked with the key, repeating the 4-byte key (`payload[i] ^= key[i % 4]`). [justprotocols](https://justprotocols.com/protocols/websocket)

**Control frames** (close 0x8, ping 0x9, pong 0xA) are required to be ≤ 125 bytes, MUST NOT be fragmented, and MUST have FIN=1. This is why custom close-reason strings are limited to 123 bytes (125 − 2 bytes for the close code).

### 3.3 A real on-the-wire example

Client sends the text message `Hello` with mask key `0x37fa213d`:

```
Hex:       81  85   37 fa 21 3d   7f 9f 4d 51 58
Field:     |   |    |- mask key-| |- masked "Hello" -|
           |   `-- MASK=1, len=5
           `------ FIN=1, opcode=0x1 (text)
```

`'H' ^ 0x37 = 0x7f`, `'e' ^ 0xfa = 0x9f`, `'l' ^ 0x21 = 0x4d`, `'l' ^ 0x3d = 0x51`, `'o' ^ 0x37 = 0x58`. Server sends `Hello` back unmasked: `81 05 48 65 6c 6c 6f`. (Walk-through derived from MDN's "Writing WebSocket servers", `https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers`.)

### 3.4 Connection state machine (WebSocket API, WHATWG)

```
            (new WebSocket(url))
                   |
                   v
              CONNECTING
                   |
       HTTP 101 + Sec-WebSocket-Accept verified
                   |
                   v
                  OPEN  <----+
                   |         |
       send/receive data, ping/pong (each side)
                   |         |
       (close()/recv close)  |
                   |         |
                   v         |
                CLOSING -----+
                   |
       close handshake completes / TCP closes
                   |
                   v
                CLOSED  (close event fires with code+reason+wasClean)
```

### 3.5 Closing handshake

Either side may send a Close frame (opcode 0x8) with a 2-byte big-endian close code and an optional UTF-8 reason (≤ 123 bytes). The peer SHOULD echo a Close frame back; then both sides close the underlying TCP connection. The close codes are listed in §6.

### 3.6 Mermaid sequence diagram

ServerProxy / LBClient (browser)ServerProxy / LBClient (browser)#mermaid-rfb{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfb .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfb .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfb .error-icon{fill:#CC785C;}#mermaid-rfb .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfb .edge-thickness-normal{stroke-width:1px;}#mermaid-rfb .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfb .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfb .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfb .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfb .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfb .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfb .marker.cross{stroke:#A1A1A1;}#mermaid-rfb svg{font-family:inherit;font-size:16px;}#mermaid-rfb p{margin:0;}#mermaid-rfb .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfb text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfb .actor-line{stroke:#A1A1A1;}#mermaid-rfb .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfb .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfb #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfb .sequenceNumber{fill:#5e5e5e;}#mermaid-rfb #sequencenumber{fill:#E5E5E5;}#mermaid-rfb #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfb .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfb .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfb .labelText,#mermaid-rfb .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfb .loopText,#mermaid-rfb .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfb .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfb .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfb .noteText,#mermaid-rfb .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfb .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfb .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfb .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfb .actorPopupMenu{position:absolute;}#mermaid-rfb .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfb .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfb .actor-man circle,#mermaid-rfb line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfb :root{--mermaid-font-family:inherit;}WebSocket OPENloop[heartbeat]TCP SYNTCP SYNSYN-ACKSYN-ACKTLS ClientHello (if wss://)TLS ServerHello, FinishedGET /chat HTTP/1.1\nUpgrade: websocket\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\nSec-WebSocket-Version: 13\nSec-WebSocket-Protocol: chat\nSec-WebSocket-Extensions: permessage-deflateHTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\nSec-WebSocket-Protocol: chat\nSec-WebSocket-Extensions: permessage-deflateFrame FIN=1 op=0x1 MASK=1 "Hello"Frame FIN=1 op=0x1 MASK=0 "Hi"Ping (0x9)Pong (0xA)Close (0x8) code=1000 reason="bye"Close (0x8) code=1000TCP FIN

### 3.7 Security model in one paragraph

WebSocket is an *origin-based* protocol: the browser sends `Origin`, and the server enforces what it wants. The wire is protected by TLS for confidentiality and integrity. **Masking does not protect data confidentiality** — anyone who can read the wire can also read the key, which is sent in clear right next to the masked payload. Masking exists *exclusively* to ensure that an attacker who controls the application-layer payload cannot deterministically choose the bytes that appear on the wire, defeating the proxy-cache-poisoning attacks of Huang et al. The masking key MUST come from a strong RNG (RFC 4086), MUST be fresh per frame, and MUST be unpredictable. (This is exactly the rule libcurl violated; see §6.) [justprotocols](https://justprotocols.com/protocols/websocket)[IETF](https://tools.ietf.org/html/rfc6455)

---

## 4. Deep Connections to Other Protocols

### TCP

WebSocket is layered directly on top of one TCP connection (RFC 6455 §1.7). It inherits in-order, reliable byte-stream delivery; it does not add its own retransmission. It is therefore vulnerable to **TCP head-of-line blocking** — one lost segment stalls everyone using that connection — which is one of the motivations for moving to QUIC.

### TLS

`wss://` = TLS over TCP, then WebSocket over TLS. RFC 6455 §10 mandates TLS for cross-origin and for any application that handles credentials. Mixed-content rules in browsers will block `ws://` from `https://` pages. TLS 1.3's 1-RTT/0-RTT handshakes (RFC 8446) reduce the connection-setup cost that has historically been the biggest ergonomic disadvantage of WebSocket compared to long-polling on already-warm HTTP/2 connections.

### HTTP/1.1

The opening handshake *is* an HTTP/1.1 request using the `Upgrade` mechanism (RFC 7230 §6.7). Once the upgrade succeeds, HTTP semantics no longer apply — the bytes on the wire are WebSocket frames. The single-stream, no-multiplexing nature of HTTP/1.1 is exactly inherited.

### HTTP/2

RFC 8441 (McManus, Mozilla, Sep 2018) lets a WebSocket ride a single HTTP/2 stream via *Extended CONNECT* with `:protocol=websocket`. Servers must advertise `SETTINGS_ENABLE_CONNECT_PROTOCOL=1`. Once the stream is established, framing reverts to RFC 6455 — but `Sec-WebSocket-Key` / `Sec-WebSocket-Accept` are dropped (their work is done by HPACK and `:authority`). Practical effects: many WebSockets share one TCP connection (no per-connection 6-origin limit), HPACK header compression saves bytes, and TCP-level HOL blocking still applies. Browser support: Firefox 65 (2019) shipped this; Chrome shipped behind a flag and then by default; some servers (older nginx, older Spring) reject the resulting `CONNECT` and produce `405 Method Not Allowed` (`https://github.com/spring-projects/spring-framework/issues/34044`). [Hjp +2 + 4](https://www.hjp.at/doc/rfc/rfc8441.html)

### HTTP/3 and QUIC

RFC 9220 (Hamilton, Google, June 2022) maps the same Extended CONNECT trick onto HTTP/3 (which itself runs on QUIC, RFC 9000). The setting code 0x8 is reused. Benefits in theory: QUIC eliminates TCP-level HOL blocking, supports connection migration across network changes, and offers 0/1-RTT setup. **In practice, as of May 2026, no major browser or production server has shipped RFC 9220.** Chrome reached "Intent to Prototype" only; LiteSpeed's `lsquic`, Caddy, and Jetty do not yet implement it. (`https://groups.google.com/a/chromium.org/g/blink-dev/c/KOupRe29WhY`; `https://github.com/jetty/jetty.project/issues/14294`.) That gap is the main reason RFC 6455-over-HTTP/1.1 remains the practical default. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)[WebSocket](https://websocket.org/guides/future-of-websockets/)

### WebTransport

Not WebSocket. WebTransport (W3C draft, IETF webtrans WG) is a *separate* browser API that exposes QUIC's reliable streams *and* unreliable datagrams. It runs over HTTP/3 and offers what WebSocket cannot: multiple independent reliable streams *and* fire-and-forget datagrams on one connection, plus connection migration. It is **not** designed to be a drop-in replacement; it is complementary. Browser support is uneven — Chrome/Edge fully, Firefox partially, Safari not. Ably's analysis ("Can WebTransport replace WebSockets?") concludes WebSockets remain the right default for most real-time apps and recommends WebTransport for advanced use cases (gaming, mixed-reliability media, multiplexed streams) (`https://ably.com/blog/can-webtransport-replace-websockets`). [GetStream](https://getstream.io/blog/websocket-sse/)[WebSocket](https://websocket.org/guides/future-of-websockets/)

### SSE (Server-Sent Events)

A *unidirectional* server-to-client stream (`Content-Type: text/event-stream`) defined in WHATWG HTML. SSE uses plain HTTP, has built-in `EventSource` reconnection with `Last-Event-ID` replay, and works through nearly every proxy. Under HTTP/1.1, browsers cap SSE at 6 connections per origin; under HTTP/2 multiplexing this constraint disappears. SSE is *not* WebSocket's competitor for chat/games; it is an excellent fit for token-streaming (LLMs), dashboards, and notifications, and the AI-streaming era has visibly increased its mindshare. (See `https://websocket.org/comparisons/sse/`.) [GetStream](https://getstream.io/blog/websocket-sse/)[GetStream](https://getstream.io/blog/websocket-sse/)

### REST

REST is an architectural style atop HTTP request/response. WebSocket complements REST: a typical app uses REST/GraphQL for stateless reads/writes and WebSocket for push/notifications. WebSocket is a poor fit for cacheable resource representations (no HTTP caching exists for WebSocket payloads).

### GraphQL

GraphQL itself is transport-agnostic; *subscriptions* — its push primitive — are typically delivered over WebSocket using a subprotocol. The earliest spec was `subscriptions-transport-ws` (Apollo, 2016), now superseded by **`graphql-transport-ws`** by Denis Badurina (Apollo's recommended path; `https://the-guild.dev/blog/graphql-over-websockets`). The newer `graphql-ws` library uses the IANA-registered subprotocol `graphql-transport-ws`. SSE-based GraphQL subscriptions have also gained traction (WunderGraph, the GraphQL-over-HTTP working group). [GraphQL + 2](https://graphql.org/learn/subscriptions/)

### JSON-RPC 2.0

A transport-agnostic RPC envelope (`{"jsonrpc":"2.0","method":"…","params":…,"id":…}`) that pairs naturally with WebSocket because both peers can initiate messages. Used heavily in Ethereum execution clients (Geth, Besu, Nethermind), the Language Server Protocol, the Chrome DevTools Protocol, and — crucially — MCP and A2A (`https://www.jsonrpc.org/specification`). [GitHub](https://github.com/Hindol/json-rpc)

### MCP (Model Context Protocol, Anthropic)

MCP uses JSON-RPC 2.0 framing. Its initial transport was *stdio* (process-local) plus an HTTP+SSE remote transport (one POST endpoint for client→server, one SSE endpoint for server→client). In 2025 MCP introduced **Streamable HTTP** (`POST /mcp` with optional `Accept: text/event-stream` upgrading the response into an SSE stream), deprecating the older HTTP+SSE transport (`https://modelcontextprotocol.io/specification/2025-06-18/basic/transports`). **WebSocket is not an official MCP transport as of May 2026**, but **SEP-1288 (Aug 2025)** is an active proposal to add one; the controversial pieces are how to convey `Mcp-Session-Id` (which becomes a JSON-RPC field instead of an HTTP header because browser WebSocket APIs cannot read post-handshake headers) and authentication (`https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1288`). Community gateways (`ConechoAI/nchan-mcp-transport`) bridge MCP to WebSocket today. [GitHub](https://github.com/ConechoAI/nchan-mcp-transport)

### A2A (Agent2Agent, Google)

A2A is JSON-RPC 2.0 over HTTPS, with **Server-Sent Events for streaming** and webhooks for very long-running tasks. v0.3 also lists a gRPC transport binding. **A2A does not use WebSockets** in its current spec (`https://a2a-protocol.org/latest/specification/`). The reasoning given by Google is "reuse existing, well-understood standards" with strong intermediary support — a recurring theme in agent-protocol design. [IBM + 2](https://www.ibm.com/think/topics/agent2agent-protocol)

### MQTT, STOMP, WAMP, SOAP — WebSocket subprotocols

The IANA "WebSocket Subprotocol Name Registry" (`https://www.iana.org/assignments/websocket/websocket.xml`) is the authoritative list. Notable entries:

- **`mqtt`** (registered by OASIS MQTT TC) — MQTT 3.1.1 and 5.0 over WebSocket use binary frames carrying MQTT control packets; required by browser clients. (`https://docs.solace.com/API/MQTT-v50-Prtl-Conformance-Spec/mqtt-v50-6-using-websocket-as-network-transport.htm`.) [DeepWiki](https://deepwiki.com/mcxiaoke/mqtt/4.2-using-mqtt-over-websocket)
- **`v10.stomp`, `v11.stomp`, `v12.stomp`** — STOMP framing over WebSocket; ActiveMQ Classic exposes both Stomp-over-WebSocket and MQTT-over-WebSocket out of the box (`https://activemq.apache.org/components/classic/documentation/websockets`). [Apache ActiveMQ](https://activemq.apache.org/components/classic/documentation/websockets)
- **`wamp`** — WebSocket Application Messaging Protocol (pub/sub + RPC). [GitHub](https://github.com/larseggert/iana-assignments/blob/master/websocket/websocket.txt)
- **`soap`** — SOAP over WebSocket (Microsoft).
- **`graphql-transport-ws`**, **`graphql-ws`**, **`bbf-usp-protocol`**, etc.

### SignalR (Microsoft)

SignalR is a higher-level real-time framework that *prefers* WebSocket and falls back to Server-Sent Events and then to Long Polling. It performs an HTTP `negotiate` to choose. Blazor Server even removed Long-Polling fallback in some versions to enforce WebSocket-only. (`https://learn.microsoft.com/en-us/aspnet/signalr/overview/getting-started/introduction-to-signalr`.) [Notch + 2](https://wearenotch.com/blog/signalr-websockets/)

### Socket.IO / Engine.IO

Crucially, **Socket.IO is not a WebSocket implementation**; it is a custom protocol on top of "Engine.IO", which uses HTTP long-polling first and then upgrades to WebSocket if possible. Each Socket.IO message becomes a WebSocket frame containing `42["event","payload"]` (with packet types and namespace prefixes), so a raw WebSocket client cannot connect to a Socket.IO server (`https://socket.io/docs/v4/`). Socket.IO adds rooms, automatic reconnection, namespaces, and acknowledgements — features that raw RFC 6455 deliberately leaves to the application.

### RFC 7692 (`permessage-deflate`)

The single widely-used extension, by Takeshi Yoshino. Applies DEFLATE per-message, optionally reusing the LZ77 sliding window across messages (`server_no_context_takeover`, `client_no_context_takeover`, `server_max_window_bits`, `client_max_window_bits`). Saves 50–80% on text. **Risks**: BREACH/CRIME-class attacks if attacker-controlled and secret data are mixed in the same compression context (`https://websocket.org/guides/websocket-protocol/`); also a known DoS surface for "compression-bomb" payloads. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc7692.html)

---

## 5. Real-World Deployment

### Major libraries (named, stable as of May 2026)

| Language | Library | Notes |
|---|---|---|
| Node.js | `ws` (websockets/ws) | The de-facto Node WebSocket library; underpins `socket.io`, Apollo, etc. CVE-2024-37890 disclosed June 2024. |
| Python | `websockets` (Aymeric Augustin) | Async/await, broad RFC-6455 conformance, `permessage-deflate`. |
| Python (alt.) | `aiohttp.WebSocket`, `Tornado` | Tornado patched CVE-2025-47287 (multipart-form DoS, indirectly affects WebSocket-handling apps). [OSV](https://osv.dev/vulnerability/CVE-2025-47287) |
| Rust | `tokio-tungstenite` / `tungstenite` | Sync core + Tokio async wrapper. |
| Rust (alt.) | `fastwebsockets`, `axum` ws extractor | Cloudflare, Discord, others rely on Rust at the edge. |
| Go | `gorilla/websocket` | Archived 2022, then community-maintained; still widely used; June 2024 release. |
| Go | `coder/websocket` (formerly `nhooyr/websocket`) | Recommended for new code; supports concurrent writes; context-based; `permessage-deflate`. |
| Go (perf) | `gobwas/ws`, `lesismal/nbio` | Event-driven, very high concurrency. |
| Java | `Tyrus` (JSR 356), `Jetty WebSocket`, `Undertow`, `java-websocket` | Tomcat embeds Jetty's. |
| JVM HTTP clients | `OkHttp` | Square's; the standard for Android WebSocket clients. |
| .NET | `System.Net.WebSockets`, `SignalR` | First-class in ASP.NET Core. |
| C/C++ | `libwebsockets`, `µWebSockets`, `Boost.Beast`, `libcurl` (since 7.86) | curl gained native WebSocket in Oct 2022 (`https://curl.se/`). |

### Reference servers / proxies

- **nginx** — terminates WebSocket via `proxy_pass http://backend; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 86400;`. Does **not** translate HTTP/2 Extended CONNECT (`https://trac.nginx.org/nginx/ticket/1992`).
- **HAProxy** — first-class WebSocket support; widely used in front of WhatsApp-style chat servers.
- **Envoy** — supports HTTP/1.1 and HTTP/2 WebSocket including Extended CONNECT; used by Slack at the edge for TLS termination (`https://slack.engineering/traffic-101-packets-mostly-flow/`).
- **Cloudflare Edge / Workers / Durable Objects** — Durable Objects expose both the standard WebSocket API and a **Hibernation API** that serializes per-connection state into the runtime, evicts the JS heap, and **does not bill compute duration while idle** — a meaningful cost reduction for long-lived idle connections (`https://developers.cloudflare.com/durable-objects/best-practices/websockets/`).

### Production systems with public numbers

- **Slack.** "Tens of millions of channels per host" on Channel Servers; Gateway Servers maintain user→channel WebSocket subscriptions; *over 5 million simultaneous WebSocket sessions at peak weekday hours* per ByteByteGo's writeup of Slack's architecture; messages delivered in-region in ~500 ms at the architecture's claimed end-to-end latency. Failure mode: "Degraded Mode" banner when WebSocket establishment fails — clients still work via REST. (`https://slack.engineering/real-time-messaging/`; `https://blog.bytebytego.com/p/how-slack-supports-billions-of-daily`.) [ByteByteGo](https://blog.bytebytego.com/p/how-slack-supports-billions-of-daily)
- **Discord.** Erlang/Elixir + Cowboy (the BEAM-native HTTP/WebSocket server) for the gateway; Rust via Rustler for hot data structures. Discord publicly reported **>12 million concurrent users**, **>26 million WebSocket events/sec to clients**, and built voice signalling on the same stack — and **2.6 million concurrent voice users with 220 Gbps egress** (different number, voice-specific, served by a separate Discord Voice fleet) (`https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/`; `https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc`). Discord rate-limits bots to 1,000 IDENTIFY calls per WebSocket per 24 hours and shards bots above 2,500 guilds (`https://docs.discord.com/developers/events/gateway`). [Elixir Programming Language](https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/)
- **WhatsApp.** Erlang/OTP on the BEAM with a modified XMPP (later proprietary) protocol; a single chat server has been documented in WhatsApp engineering talks to hold **2+ million concurrent TCP connections per box** (the famous 2012 milestone, since exceeded). Public talks suggest a frontend fleet of around 150 chat servers handling 100+ million concurrents. (`https://blog.bytebytego.com/p/how-whatsapp-handles-40-billion-messages`; `https://singhajit.com/whatsapp-scaling-secrets/`.) WhatsApp Web specifically uses WebSocket for its multi-device sync.
- **Trading platforms.** Binance, Coinbase, Kraken expose public market-data WebSocket APIs; trading firms typically push thousands of messages/sec on a single `wss://` stream and use binary subprotocols or compressed JSON.
- **Cloudflare AI Gateway.** Migrated to a WebSocket interface in 2025 to avoid HTTP/2 keep-alive complexity for AI-token streaming; uses Durable Objects (`https://blog.cloudflare.com/do-it-again/`).

### Performance characteristics (where measured)

- **Per-connection memory.** Discord/WhatsApp report **~2 KB per idle Erlang process per WebSocket connection** as a typical footprint; Cloudflare Durable Objects with Hibernation similarly avoid memory cost while idle.
- **Throughput.** `µWebSockets` and `nbio` benchmarks show > 1M msgs/sec on a single core for tiny messages on loopback; production numbers are dominated by TLS, fan-out, and serialization.
- **Latency.** End-to-end p50 latency in well-deployed real-time systems sits in the **tens of milliseconds within-region, hundreds of ms cross-region**. RTT on TLS 1.3 wss handshakes is 1 RTT (or 0-RTT with session resumption) plus one HTTP roundtrip = typically ~3 RTTs total to OPEN.
- **Scale limits.** A single OS process can comfortably hold hundreds of thousands of WebSocket connections on Linux with epoll and large `nofile`/`somaxconn` settings; the bottleneck is usually fan-out (broadcasting to N peers is O(N)) and TLS termination CPU, not raw socket count. Discord's engineering blog explicitly explains how naive per-connection synchronous fan-out melts down at 50 k concurrent guild members and how they batch + use direct ByteBuffer duplicates to amortize serialization.

---

## 6. Failure Modes and Famous Incidents

### Close codes (the failure-mode taxonomy)

| Code | Name | Meaning | Sent on the wire? |
|---|---|---|---|
| 1000 | Normal Closure | Clean close. | Yes |
| 1001 | Going Away | Server shutting down or page navigating away. | Yes |
| 1002 | Protocol error | Malformed frame; **mask violation**; reserved-bit violation. | Yes |
| 1003 | Unsupported Data | Got binary when only text accepted, etc. | Yes |
| 1004 | Reserved | Don't use. | No |
| 1005 | No Status Rcvd | Local-only: peer closed without code. | **No** |
| 1006 | Abnormal Closure | Local-only: TCP dropped/RST without close frame. | **No** |
| 1007 | Invalid frame payload data | Invalid UTF-8 in a text frame. | Yes |
| 1008 | Policy Violation | Generic policy fail (often auth). | Yes |
| 1009 | Message Too Big | Receiver rejects oversize message. | Yes |
| 1010 | Mandatory Ext. | Client-required extension not negotiated. | Yes |
| 1011 | Internal Error | Unhandled server exception. | Yes |
| 1012 | Service Restart | Graceful restart. | Yes |
| 1013 | Try Again Later | Backpressure / temporary unavailability. | Yes |
| 1014 | Bad Gateway | Upstream failure. | Yes |
| 1015 | TLS handshake failure | Local-only. | **No** |
| 3000–3999 | Reserved for libraries/IANA-registered. |  | Yes |
| **4000–4999** | **Application-defined.** [WebSocket](https://websocket.org/reference/close-codes/) Use freely. |  | Yes |

(`https://websocket.org/reference/close-codes/`; RFC 6455 §7.4.) Operational rule: **track the distribution of close codes per minute**. A spike in 1006 = network/load-balancer; 1008 = auth deploy; 1011 = server crash; 1012 = expected during deploys.

### Catalogued CVEs (with numbers)

- **CVE-2024-37890** — **`ws` (Node.js)** DoS via large numbers of HTTP request headers exceeding `server.maxHeadersCount`, crashing the server. CVSS 7.5 High. Reported by Ryan LaPointe on June 16, 2024. Fixed in `ws@5.2.4 / 6.2.3 / 7.5.10 / 8.17.1`. Workaround: `--max-http-header-size` or `server.maxHeadersCount=0`. (`https://github.com/advisories/GHSA-3h5v-q93c-6h6q`; `https://nvd.nist.gov/vuln/detail/CVE-2024-37890`.) [GitHub + 2](https://github.com/opensearch-project/dashboards-reporting/issues/377)
- **CVE-2025-10148** — **libcurl** WebSocket client used a *fixed* 32-bit mask for every outgoing frame instead of a fresh per-frame key — exactly the mistake RFC 6455 §10.3 was written to forbid. A malicious server could **revive proxy cache poisoning** ("Talking to Yourself" all over again) when libcurl-using apps speak `ws://` through a defective proxy. Fixed in curl 8.16.0; affected versions 8.11.0–8.15.x. (`https://curl.se/docs/CVE-2025-10148.html`.) [curl](https://curl.se/docs/CVE-2025-10148.html)
- **CVE-2025-5399** — **libcurl** WebSocket endless loop on a malicious server packet; thread/process must be killed externally. (`https://curl.se/docs/CVE-2025-5399.html`.) [curl](https://curl.se/docs/CVE-2025-5399.html)
- **CVE-2025-43855** — **tRPC v11** WebSocket DoS: an unauthenticated client sending a malformed `connectionParams` JSON crashes the server because the error is rethrown after handling. (`https://github.com/advisories/GHSA-pj3v-9cm8-gvj8`.) [GitHub](https://github.com/advisories/GHSA-pj3v-9cm8-gvj8)
- **CVE-2025-47287** — **Tornado (Python)** multipart parser logs warnings synchronously and continues on error, enabling log-amplification DoS; affects Tornado-hosted WebSocket apps (`https://osv.dev/vulnerability/CVE-2025-47287`). [OSV](https://osv.dev/vulnerability/CVE-2025-47287)
- **CVE-2025-1094** — PostgreSQL SQL-injection-to-RCE via WebSocket-based admin tooling (PoC chains SQLi → WebSocket hijack) (`https://github.com/soltanali0/CVE-2025-1094-Exploit`). [GitHub](https://github.com/soltanali0/CVE-2025-1094-Exploit)
- **CVE-2024-55591 / CVE-2025-24472** — **Fortinet FortiOS / FortiProxy** authentication bypass via crafted requests to a Node.js WebSocket module exposing super-admin privileges; **exploited in the wild** (`https://www.fortiguard.com/psirt/FG-IR-24-535`). [FortiGuard](https://www.fortiguard.com/psirt/FG-IR-24-535)
- **CVE-2020-7693** — `sockjs` (npm) crash on `Upgrade: websocket` due to malformed header handling. Older but still cited in new advisories. [Resolvedsecurity](https://www.resolvedsecurity.com/vulnerability-catalog/CVE-2020-7693)

### Famous outages and incidents

- **Slack incident, Feb 22, 2022.** A reconnect-storm-class failure: a database-permissions change caused a query to read across all Vitess shards, missed memcached, melted the database; clients couldn't boot. Recovery used "the client-boot throttle" — Slack literally rate-limited clients establishing WebSocket sessions to break the metastable cascading-failure state. The post-mortem references Bronson, Charapko, Aghayev & Zhu's HotOS 2021 paper "Metastable States in Distributed Systems" and Cook's "How Complex Systems Fail." (`https://slack.engineering/slacks-incident-on-2-22-22/`.) [Slack](https://slack.engineering/slacks-incident-on-2-22-22/)
- **Cloudflare incident, June 20, 2024.** A new DDoS-mitigation rule deployed 14:14–17:06 UTC triggered a latent infinite-loop in the rate-limiting code path; HTTP request handler processes pinned CPU at 100%; up to 2.1% of requests failed. Long-lived WebSocket connections behind Cloudflare were silently affected when Traffic Manager re-routed traffic out of saturated regions. (`https://blog.cloudflare.com/cloudflare-incident-on-june-20-2024/`.) [Cloudflare](https://blog.cloudflare.com/cloudflare-incident-on-june-20-2024/)[Cloudflare](https://blog.cloudflare.com/cloudflare-incident-on-june-20-2024/)
- **Cloudflare outage, Nov 18, 2025.** A ClickHouse permissions change made a Bot Management feature-file double in size, exceeded an in-process limit, and cascaded to Workers KV, Turnstile, and Access — which in turn affected Durable-Object-hosted WebSocket apps and a third of the top 10 000 sites. (`https://controld.com/blog/biggest-cloudflare-outages/`.) [Cloudflare Blog](https://blog.cloudflare.com/tag/post-mortem/)

### Common pitfalls (the production checklist)

1. **Idle timeouts in proxies.** AWS ELB defaults to 60s; nginx proxies need `proxy_read_timeout` raised; HAProxy needs `timeout tunnel`. Without keepalive, WebSocket connections die silently and clients see code 1006.
2. **Sticky sessions.** Without sticky session affinity at the LB, the HTTP `negotiate`/`Upgrade` and the resulting WebSocket can land on different backends. SignalR explicitly documents this.
3. **Head-of-line blocking.** TCP-level: one slow message blocks the connection. HTTP/2 Extended CONNECT helps inter-stream but not intra-stream.
4. **Heartbeats not negotiated.** RFC 6455 ping/pong is optional; many libraries default to OFF. Cloudflare Durable Objects auto-handle ping/pong without waking the object.
5. **Compression negotiated unsafely.** `permessage-deflate` + secrets + attacker-controlled prefix = BREACH-class side-channel.
6. **`Origin` not validated.** Servers that skip origin checks accept WebSocket requests from any page → CSWSH (Cross-Site WebSocket Hijacking) when authentication is by cookie.
7. **DNS rebinding** for `ws://localhost`-style services (called out explicitly in the MCP transport spec).

---

## 7. Fun Facts and Anecdotes

- **The name was coined on IRC.** Ian Hickson and Michael Carter named "WebSocket" together on the `#whatwg` IRC channel in 2008; the original draft called it `TCPConnection`. (`https://wiki.wireshark.org/WebSocket`.) [Wikipedia + 2](https://en.wikipedia.org/wiki/WebSocket)
- **The magic GUID is just a UUID.** `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` was chosen for being unique and memorable — *not* for cryptographic significance. Per RFC 6455 §1.3, the goal was a constant string "unlikely to be used by network endpoints that do not understand the WebSocket Protocol." It is *not* secret and *not* changing.
- **Firefox 4 and Opera 11 shipped with WebSocket disabled.** In November 2010, both browsers turned WebSocket off in response to the "Talking to Yourself" paper, and only re-enabled it after the masking change went into the spec — a remarkable example of academic security work directly delaying and reshaping a shipping web standard.
- **The masking key is XOR, deliberately.** Adam Barth and the Hybi WG considered alternatives but XOR with a fresh 32-bit key was the cheapest mechanism that satisfied "no attacker-chosen byte sequence appears verbatim on the wire." It is *not* encryption — it just changes the bytes.
- **Ports were chosen for proxy traversal, not protocol design.** RFC 6455 §1.7 explicitly notes WebSocket is designed to ride ports 80/443 *because* that is what proxies and corporate firewalls actually allow.
- **The 16-byte key + 24-byte base64.** `Sec-WebSocket-Key` is 16 random bytes encoded via base64 = 24 ASCII characters ending in `==`. The `Hello` example `dGhlIHNhbXBsZSBub25jZQ==` decodes to "the sample nonce" — the literal string used in RFC 6455's worked example.
- **Curl was the WebSocket holdout.** curl finally added WebSocket support in version 7.86 (Oct 2022), and then promptly shipped two CVEs (predictable mask CVE-2025-10148; endless-loop CVE-2025-5399) in 2025. The first revived the exact attack class WebSocket masking was created to prevent.
- **Discord's bot rate limit is 1,000 IDENTIFY/24h.** Exceed it and your bot's token gets reset and the owner gets an email — a real-world example of WebSocket connection-establishment as an abuse vector worth rate-limiting separately from message volume.
- **Cloudflare Workers will hibernate your WebSocket.** Idle WebSockets backed by Durable Objects evict the JS isolate from memory, persist per-connection state via `serializeAttachment`, auto-respond to RFC 6455 ping frames *without waking the object*, and don't bill compute. This is one of the most novel WebSocket runtime designs to land in the last two years.

---

## 8. Practical Wisdom

### Defaults to be skeptical of

- **No heartbeat.** Most libraries disable ping/pong by default. Set ping interval to 20–30 s, pong timeout to 10 s. Without this, NAT/LB idle-timeouts will silently drop your TCP and you'll see 1006 minutes after the failure.
- **`permessage-deflate` always-on.** Default compression context is shared across messages, raises memory significantly per connection, and opens BREACH-class risks. Negotiate `server_no_context_takeover; client_no_context_takeover` if you don't need cross-message compression.
- **Unbounded message size.** Set max payload (e.g., 1 MiB) and max-frame; a single 2 GiB message will OOM your worker.
- **`Origin: *` style permissive checks.** Always check Origin server-side.
- **Sticky-session-by-IP at the LB.** Mobile clients change IP often; prefer cookie-based affinity or stateless designs.

### What to monitor

1. **Concurrent connection count** per server (with quantiles).
2. **New-connection rate** — reconnect storms show up here first.
3. **Close-code distribution** as a stacked timeseries — your single best alarming signal.
4. **Ping-pong RTT p95/p99** as a proxy for end-to-end health.
5. **Bytes in/out per connection** and **messages per second** per connection.
6. **Memory per process / per connection** — gradually growing means a hibernation/leak.
7. **TLS handshake failures (1015 and pre-101 5xx)**.

### Common debugging moves

- **Browser DevTools → Network → "WS" filter.** Chrome/Firefox/Safari show frames with FIN, opcode, payload, and direction; Chrome decodes Socket.IO/Engine.IO packets too.
- **`wscat`** (`npm i -g wscat`) for interactive sessions: `wscat -c wss://api.example.com -H "Authorization: Bearer …"`.
- **`websocat`** for scriptable testing (Rust binary, "netcat for WebSockets"): `websocat wss://echo.websocket.org`, `websocat -s 8080`, plus pipes (`websocat tcp:127.0.0.1:22 ws-l:127.0.0.1:1234`).
- **`curl --include ws://…`** since curl 7.86.
- **Postman** added WebSocket support in 2021; Insomnia and Hoppscotch also support it.
- **Wireshark** — recognises WebSocket frames natively (`websocket` filter).
- **Autobahn TestSuite** — the canonical conformance test for any WebSocket implementation; gorilla/websocket and most major libraries publish their Autobahn results.

### Design rules-of-thumb

- Treat `1000` and `1001` as normal; reconnect on `1006`, `1011`, `1012`, `1013` with jittered exponential backoff (e.g., 1, 2, 4, 8, 16 s with ±25% jitter).
- **Don't reconnect on `1008`/`1003`/`1002`** — these are bugs/auth failures; surface them.
- Use **idempotency keys** on each outbound message so the server can deduplicate after a reconnect — RFC 6455 makes no delivery guarantees.
- **Bound your client-side outbox** (e.g., 100 messages, 1 MiB) and drop oldest on overflow.
- Pin your reconnection client to a *resume token* the server issues on connect; on reconnect, resume from the last delivered message id (Discord's `resume_gateway_url` is the canonical pattern).

---

## 9. Learning Resources (Current as of May 2026)

### RFCs (start here)

- **RFC 6455 — The WebSocket Protocol** (Fette, Melnikov; Dec 2011). Read §1.3 (handshake), §5.2 (frames), §5.3 (masking), §7.4 (close codes), §10 (security). [`https://www.rfc-editor.org/rfc/rfc6455`]. Level: intermediate–advanced.
- **RFC 7692 — Compression Extensions for WebSocket** (Yoshino; Dec 2015). Read §7 for parameters, §8 for security. [`https://datatracker.ietf.org/doc/html/rfc7692`]. Intermediate.
- **RFC 8441 — Bootstrapping WebSockets with HTTP/2** (McManus; Sep 2018). Sections 3, 4, 5 are the core. [`https://datatracker.ietf.org/doc/html/rfc8441`]. Intermediate.
- **RFC 9220 — Bootstrapping WebSockets with HTTP/3** (Hamilton; Jun 2022). Short. [`https://datatracker.ietf.org/doc/html/rfc9220`]. Intermediate.
- **WHATWG HTML Living Standard, "Web sockets" section** — the *API* spec (separate from the *protocol* spec). Continuously updated. [`https://websockets.spec.whatwg.org/`]. Intro–intermediate.

### Books

- **Ilya Grigorik, *High Performance Browser Networking*, O'Reilly. Chapter 17 ("WebSocket"), Chapter 16 (SSE), Chapter 18 (WebRTC).** Free at [`https://hpbn.co/websocket/`]. Last substantive update 2013 but mostly still accurate; Grigorik is now Distinguished Engineer at Shopify. Level: intermediate. (For 2024-current performance updates, supplement with the HTTP/2 and HTTP/3 chapters and the engineering blogs below.) [Amazon](https://www.amazon.com/High-Performance-Browser-Networking-performance/dp/1449344763)[Amazon](https://www.amazon.com/High-Performance-Browser-Networking-performance/dp/1449344763)

### Academic papers

- **Huang, Chen, Barth, Rescorla, Jackson — "Talking to Yourself for Fun and Profit" — W2SP 2011.** [`http://www.adambarth.com/papers/2011/huang-chen-barth-rescorla-jackson.pdf`]. Advanced. The foundational security paper that shaped masking.
- **Bronson, Charapko, Aghayev, Zhu — "Metastable States in Distributed Systems" — HotOS 2021.** Cited by Slack's 2-22-22 incident retro; essential for understanding WebSocket reconnect storms.

### Engineering blog posts (named, dated)

- **Slack, "Real-time Messaging" (2023).** [`https://slack.engineering/real-time-messaging/`]. Slack's GS/CS/AS/PS architecture, consistent hashing via CHARMs, Consul, Envoy. Advanced.
- **Slack, "Slack's Incident on 2-22-22" (2022).** [`https://slack.engineering/slacks-incident-on-2-22-22/`]. Metastable failure post-mortem. Advanced.
- **Slack, "Traffic 101: Packets Mostly Flow" (2024).** [`https://slack.engineering/traffic-101-packets-mostly-flow/`]. Edge PoPs, Envoy, Degraded Mode. Intermediate.
- **Discord, "How Discord Handles Two and Half Million Concurrent Voice Users using WebRTC" (2018, still canonical).** [`https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc`]. Advanced.
- **Elixir-lang, "Real time communication at scale with Elixir at Discord" (2020).** [`https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/`]. The 12M concurrents / 26M events/sec numbers. Advanced.
- **Discord Developer Docs, "Gateway API."** [`https://docs.discord.com/developers/events/gateway`]. Reference; intro.
- **Cloudflare Blog, "DO it again: how we used Durable Objects to add WebSockets support and authentication to AI Gateway" (2025).** [`https://blog.cloudflare.com/do-it-again/`]. Intermediate.
- **Cloudflare Docs, "Use WebSockets with Durable Objects" + "Build a WebSocket server".** [`https://developers.cloudflare.com/durable-objects/best-practices/websockets/`]. Intermediate.
- **ByteByteGo, "How Slack Supports Billions of Daily Messages" (2024) and "How WhatsApp Handles 40 Billion Messages Per Day" (2024).** Pop-engineering but well-sourced summaries.
- **Ably, "Can WebTransport replace WebSockets?"** [`https://ably.com/blog/can-webtransport-replace-websockets`]. Intermediate.
- **Ably, "How to scale WebSockets for high-concurrency systems."** [`https://ably.com/topic/the-challenge-of-scaling-websockets`]. Intermediate.
- **WebSocket.org guides and standards tracker** by Matthew O'Riordan (Ably co-founder), updated through 2026. [`https://websocket.org/standards/`]. Intro–intermediate.

### YouTube/talks

- **Jake Heinz / Discord engineering — "Real time messaging on Discord with Elixir"** (Code BEAM, 2020) — the source for many of the Discord scale numbers.
- **Anton Lavrik — "A Reflection on Building the WhatsApp Server"** (Code BEAM 2018) — WhatsApp's original 2M+/box revelation in updated form.
- **Hacktivity 2019 — Mikhail Egorov, "Unveiling Vulnerabilities in WebSocket APIs."** [GitHub](https://github.com/PalindromeLabs/awesome-websocket-security)

### Free university and self-paced courses

- **Stanford CS144 ("Introduction to Computer Networking")** — covers TCP/IP, HTTP, sockets in depth. Course materials are openly published. Intro–intermediate.
- **MIT 6.829 ("Computer Networks")** — graduate-level, with QUIC and HTTP/3 in recent offerings. Advanced.
- **UC Berkeley CS168 ("Introduction to the Internet: Architecture and Protocols")** — strong on the layering questions WebSocket sits inside. Intro.

### Hands-on tools (verified active in 2026)

- **`websocket.org/echo`** (Postman-hosted echo) and **`wss://echo.websocket.events`** (Lob-hosted) — the standard echo tests.
- **`wscat`** (npm) — interactive CLI.
- **`websocat`** (Rust) — `vi/websocat`, latest release Dec 2025; the most powerful CLI with socat-like features.
- **Postman / Insomnia / Hoppscotch** WebSocket tabs.
- **Chrome DevTools, Firefox DevTools** — Network panel, "WS" filter.
- **Autobahn|Testsuite** — conformance tests.

### Podcasts / episodes

- **The Pragmatic Engineer — episodes covering Cloudflare's Nov 2025 outage and post-mortem culture** (Gergely Orosz). Useful for the *practice* of running real-time systems.
- **Software Engineering Daily** — multiple episodes on Discord and Slack architecture across 2020–2024.
- **InfoQ "Real-Time Messaging Architecture at Slack"** podcast/article (Apr 2023; `https://www.infoq.com/news/2023/04/real-time-messaging-slack/`).

---

## 10. Where Things Are Heading (2025–2026 Frontier)

**Status of the standards.** RFC 6455 is unchanged and remains the reference. RFC 8441 (HTTP/2) is the most useful evolution and is now at-or-near-default in major browsers. **RFC 9220 (HTTP/3) has effectively no production deployment as of May 2026** (`https://websocket.org/guides/future-of-websockets/`), with Chrome at "Intent to Prototype" and Jetty users still filing tickets asking for it (`https://github.com/jetty/jetty.project/issues/14294`). This is striking: a 4-year-old IETF Standards Track RFC, no shipped browser. Reasons: (1) the practical wins of HTTP/3-WebSocket over HTTP/1.1-WebSocket are modest in latency for most workloads, (2) middleboxes still routinely break QUIC, (3) `nginx` does not translate Extended CONNECT, so most edge stacks would need rework. [WebSocket](https://websocket.org/guides/future-of-websockets/)

**WebTransport.** Stable in Chrome and Edge, partial in Firefox, absent in Safari. The W3C draft and IETF webtrans WG continue to iterate; Ably and Cloudflare both ship limited WebTransport experiments. **Forecasts are speculative**, but the reasonable industry view (Ably, Cloudflare, websocket.org) is **2-3 years to broad production viability** — call it 2027–2028. The use cases that genuinely *need* WebTransport (mixed-reliability media, multiple parallel reliable streams without HOL blocking, connection migration) are real but narrower than WebSocket's. Anything billed as "WebTransport will replace WebSockets" is editorial and uses speculative verbs ("could", "may", "should").

**WebSocketStream API.** Chrome shipped a `WebSocketStream` ReadableStream/WritableStream-based JS API to add backpressure, but it is *non-standard* and *single-engine* (Chromium only). MDN explicitly advises against relying on it and says the WebTransport API is the expected long-term direction (`https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API`).

**IETF activity.** The HyBi WG concluded; relevant ongoing work is in **httpbis** and **webtrans**. The most active recent thread directly affecting WebSocket usage is the AI-agent transport debate: how MCP and A2A should multiplex JSON-RPC over HTTP/SSE/WebSocket.

**MCP transport evolution.** MCP's Streamable HTTP (2025) is the current default; the SEP-1288 WebSocket transport (Aug 2025, in-review under @Kludex's sponsorship) would standardise WebSocket as a first-class option, with `mcpSessionId` moved into the JSON-RPC payload because browsers cannot read post-handshake headers. Whether this lands in 2026 or is absorbed into a more general "stateful transport" SEP remains uncertain.

**The AI-streaming era is reshaping the SSE/WebSocket trade-off.** OpenAI, Anthropic, and most LLM providers stream tokens via SSE because it is the simplest one-direction-stream-per-request model. Vercel's AI SDK deprecated its HTTP+SSE transport in favor of pluggable transports; an emerging pattern is "Durable Sessions" — managed, resumable WebSocket-or-SSE sessions for agent workflows.

**Library trends to watch.**

- `coder/websocket` (Go) is the recommended path for new Go code.
- `tokio-tungstenite` (Rust) and `axum` ws handlers continue to dominate Rust.
- Node `ws` will continue to be load-bearing infra; expect more security disclosures (in 2024 there was one; in 2025 Fortinet's auth-bypass derived from a `ws`-using module).
- Cloudflare Durable Object Hibernation will likely be copied: Fly.io, Vercel, Deno Deploy each have variations.

**Strong claim, dated May 2026.** If you are designing a real-time system today, **build on RFC 6455 over HTTP/1.1 with TLS 1.3**, plan for HTTP/2 (RFC 8441) when your edge supports it, and treat WebTransport/HTTP/3-WebSocket as a 2027+ option, not a 2026 one. Don't pre-architect for HTTP/3-WebSocket migration; the API surface (`WebSocket`) does not change, so the migration is mostly an infrastructure change.

---

## 11. Hooks for the Article, Infographic, and Podcast

### 60-second narrated hook (written for the ear)

> "In 2010, Mozilla and Opera shipped a major web feature… and then turned it off. The feature was WebSocket — the thing that lets your browser hold open a two-way pipe to a server. Chat apps. Multiplayer games. Live trading. The reason they turned it off was a paper called *Talking to Yourself for Fun and Profit*. A handful of researchers had bought one dollar of online ads, used those ads to run code in random people's browsers, and tricked corporate proxies into caching attacker-controlled web pages — for *every* user on those proxies. The fix was almost ridiculously simple: every byte the browser sends gets XORed with a random four-byte key. Not for secrecy — TLS already does that — but to make sure the attacker can't choose what bytes appear on the wire. That tiny change is why WebSocket exists in its current form. Fourteen years later, in 2025, the curl team accidentally reused the same key for every frame, and a researcher noticed. The exact same attack came back. Same paper. Same fix. The internet has a long memory — but only if you read the RFCs."

### Striking statistic (with source)

> **"In an internet ad campaign that cost less than $1 per successful exploitation, researchers showed that ~7% of browsers were behind transparent proxies vulnerable to cache poisoning via the original WebSocket draft — directly causing Firefox and Opera to ship the protocol disabled by default in 2010."** Source: Huang, Chen, Barth, Rescorla, Jackson, *Talking to Yourself for Fun and Profit*, W2SP 2011 (`http://www.adambarth.com/papers/2011/huang-chen-barth-rescorla-jackson.pdf`).

### "Pause and think" moment

> "WebSocket masking is XOR with a random 32-bit key — *and the key is sent in plaintext, right next to the masked payload.* If you're thinking 'that gives you zero confidentiality', you are exactly right. Now ask: **why did the IETF mandate it anyway?** … The answer reframes how you should think about every protocol you'll ever design. Cryptography solves attacker-as-eavesdropper. WebSocket masking solves attacker-as-application. They're different threat models, and they need different tools."

### Failure-story arc (setup, mistake, consequence, resolution)

- **Setup (2008–2010).** WebSocket is the obvious next step for the web: a single TCP connection for live data. The first drafts (`hixie-75`, `hixie-76`) ride HTTP, with random key bytes appended raw to the request and response.
- **Mistake (Mar–Nov 2010).** Hidden assumption: every HTTP intermediary on the planet correctly passes through bytes it doesn't understand. Reality: a measurable percentage of corporate proxies "speak HTTP" by pattern-matching, mis-cache, and mis-forward.
- **Consequence (Nov 2010).** Lin-Shung Huang and colleagues at CMU + Google + RTFM run a paid ad campaign that confirms it. ~7% of users sit behind these proxies. Cache poisoning costs less than $1. Firefox and Opera **ship WebSocket disabled by default**.
- **Resolution (Dec 2010 – Dec 2011).** The HyBi WG redesigns the wire: `Sec-WebSocket-Key` and `-Accept` replace appended-key bytes; **per-frame XOR masking with a fresh 32-bit key** ensures attacker-controlled payloads never look like attacker-chosen HTTP requests on the wire. Firefox 6 and Opera 12 re-enable. RFC 6455 ships in December 2011.
- **The coda (Sep 2025).** libcurl, fifteen years later, ships WebSocket support that uses a *fixed* mask. CVE-2025-10148 is filed. The fix: do exactly what RFC 6455 §5.3 already says: pick a fresh, unpredictable key for every frame. The fire is the same fire.

This is the arc. The lesson is the lesson.

---

## Caveats

1. **Speculative claims about WebTransport/HTTP/3 adoption** are flagged. Sources like `websocket.org` (run by Ably's co-founder Matthew O'Riordan) are well-informed but commercial; their forecasts ("2027 production-ready for early adopters", "2028 mainstream") use speculative verbs and should be treated as estimates, not facts.
2. **Several Slack/Discord/WhatsApp scale numbers come from engineering blogs and conference talks rather than peer-reviewed sources.** Discord's 12M concurrent / 26M events-per-second figure is from a 2020 Elixir-lang interview; current numbers are presumably higher but undocumented. Slack's "5M+ simultaneous WebSocket sessions" is sourced from ByteByteGo's analysis (`https://blog.bytebytego.com/p/how-slack-supports-billions-of-daily`) which itself draws on Slack engineering posts, but Slack's own 2023 post phrases this as "tens of millions of channels per host" and "millions of connected clients" without a single headline number.
3. **WhatsApp's "2 million concurrents per box" is the 2012 milestone**; current per-box numbers are not publicly disclosed. Treat the cited 60,000-per-WebSocket-handler figure as an illustrative system-design figure from a third-party article, not WhatsApp engineering.
4. **CVE-2024-XXXX in some 2024 WebSocket-compression context** mentioned by some standards trackers could not be matched to a specific real CVE id; included items use confirmed numbers.
5. **MCP and A2A are evolving fast** (MCP versions dated 2024-11-05, 2025-03-26, 2025-06-18; A2A v0.2/v0.3). Anything we say about their transports may be outdated within a quarter; verify against the current spec at `https://modelcontextprotocol.io/specification` and `https://a2a-protocol.org/latest/specification/`.
6. **`gorilla/websocket` archival history** is widely repeated but contradictory: the GitHub repo currently shows ongoing 2024 activity. The original archival/un-archival timeline matters less than the fact that the project remains usable; new code should still default to `coder/websocket`.
7. **A 2026 SignalR/Blazor change** removed the long-polling fallback in Blazor Server; for general SignalR (not Blazor) the WebSocket → SSE → Long-Polling fallback ladder remains.
8. **The 5+ million concurrent connections per server** quoted in the user's question is *not* a confirmed Discord public figure — Discord publishes voice-specific (2.6M+ concurrents) and gateway-wide (12M+) numbers, but not "per-server" in a way that maps cleanly to that phrasing. The closest equivalents are WhatsApp's "2M+ TCP per box" (2012, since exceeded but undisclosed) and Cowboy/Erlang single-box benchmarks.
9. **Cryptographic "primitive" framing:** SHA-1 in `Sec-WebSocket-Accept` is *not* used as a security primitive. Saying "WebSocket relies on SHA-1" is misleading; the protocol's confidentiality and integrity rely on TLS, not on SHA-1.