---
prompt_source: deep-research-prompts.txt:3212-3391 (HTTP/3)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/62adf4c2-20e9-4108-803a-bc16051c41e2
research_mode: claude.ai Research
---

# HTTP/3: A Deep, Citation-Backed Field Report (May 2026)

**TL;DR**

- HTTP/3 (RFC 9114, June 2022, M. Bishop ed., Akamai) is the third major version of HTTP, defined as a binary mapping of HTTP semantics (RFC 9110) onto QUIC (RFC 9000), a UDP-based, TLS 1.3–native, multiplexed transport that originated as Jim Roskind's "Quick UDP Internet Connections" experiment at Google in 2012; the IETF QUIC Working Group, formed in 2016, modularized it and shipped QUIC v1 in May 2021 and HTTP/3 thirteen months later.
- As of Q1 2026 HTTP/3 carries roughly **21% of Cloudflare-observed web requests** — flat or slightly declining for several months — while HTTP/2 dominates at ~51% and HTTP/1.x stubbornly persists near 28%; the plateau correlates with the 2024 ACM Web Conference paper "QUIC is not Quick Enough over Fast Internet" showing up-to-45% throughput regressions vs. HTTP/2 above ~500 Mbps due to receiver-side userspace ACK and copy overhead, and motivates the in-kernel QUIC patches Xin Long posted in July 2025.
- The last 24 months have been dominated by (a) the **MadeYouReset** DoS family (CVE-2025-8671, disclosed 13 Aug 2025) and the older HTTP/2 Rapid Reset (CVE-2023-44487) which forced HTTP/3 stacks to harden their stream-reset accounting; (b) the maturation of nginx HTTP/3 to stable in 1.25.0 (23 May 2023) and Caddy 2.6 having shipped HTTP/3 by default since Sep 2022; (c) the IESG Last Call for **Multipath QUIC** (draft-ietf-quic-multipath-17, Dec 2025); (d) **Encrypted Client Hello (ECH)** approval in 2025 (RFC 9849-track); and (e) ongoing rollout of HTTP/3 datagrams (RFC 9297), MASQUE (RFCs 9298 / 9484), WebTransport-over-HTTP/3 and QUIC v2 (RFC 9369).

---

## Prerequisites and glossary

*Definitions assume a reader who knows TCP at a textbook level but has not implemented a transport before. Each link points to an authoritative or canonical explainer.*

- **OSI / TCP-IP layering** — HTTP/3 sits at the application layer (L7); QUIC at the transport layer (L4); UDP/IP underneath. RFC 1122 defines the four-layer Internet model.
- **Socket** — the OS-level endpoint (IP+port) abstraction. For HTTP/3 you use a UDP socket, not TCP. (Beej's Guide to Network Programming, 2024 ed.)
- **Packet vs datagram vs frame vs message** — *Packet*: a unit of QUIC sent inside one UDP datagram. *Datagram*: a single UDP delivery unit (may carry multiple coalesced QUIC packets in 1 UDP datagram per RFC 9000 §12.2). *Frame*: a typed payload inside a QUIC packet (STREAM, ACK, CRYPTO, …) or an HTTP/3 frame inside a QUIC stream (DATA, HEADERS, …). *Message*: a request/response pair at HTTP semantics level.
- **Stream** — an ordered, flow-controlled byte sequence inside a QUIC connection, identified by a 62-bit ID. Bidirectional or unidirectional, client- or server-initiated, encoded by the bottom two bits of the stream ID.
- **Multiplexing** — running many streams concurrently over one connection. HTTP/2 multiplexed over one TCP byte-stream and inherited TCP head-of-line blocking; QUIC multiplexes at the transport layer with independent stream byte-streams.
- **Head-of-line (HOL) blocking** — a single lost packet stalls everything that comes after it. TCP HOL blocks all HTTP/2 streams on loss; QUIC HOL only blocks the single affected stream.
- **Congestion control** — sender's rule for how fast to send. RFC 9002 defines a NewReno-equivalent baseline for QUIC; deployments commonly use CUBIC, BBRv1/v2/v3.
- **Flow control** — receiver-driven backpressure (per-stream and per-connection in QUIC).
- **MTU and PMTU** — maximum transmission unit; QUIC requires path supports ≥1200 bytes UDP payload before sending Initial packets.
- **NAT / stateful firewall** — middleboxes that map and time out flows; QUIC's connection migration via Connection IDs is designed to survive NAT rebinding.
- **Handshake** — the authenticated key-exchange. QUIC fuses TLS 1.3 (RFC 8446) into the transport so the first flight establishes both transport and crypto state.
- **TLS 1.3** (RFC 8446, Aug 2018, E. Rescorla) — the only TLS version permitted by QUIC; provides 1-RTT and (replay-vulnerable) 0-RTT.
- **ALPN** (RFC 7301) — TLS extension that names the application protocol; HTTP/3 uses the ALPN identifier `"h3"` (was `"h3-29"` and earlier draft tokens). [IETF](https://datatracker.ietf.org/doc/html/rfc9369.html)
- **Header / field section** — RFC 9110 prefers "field" over "header"; QPACK calls them "field lines."
- **HPACK / QPACK** — Huffman + dynamic-table header compression. HPACK (RFC 7541) is HTTP/2's; QPACK (RFC 9204) is HPACK adapted to QUIC's out-of-order delivery via separate encoder/decoder streams. [Andy Pearce](https://www.andy-pearce.com/blog/posts/2023/Apr/http3-in-practice-http3/)
- **Variable-length integer (varint)** — QUIC encodes integers in 1, 2, 4, or 8 bytes; the upper two bits of the first byte give 2^n where n∈{0,1,2,3} (RFC 9000 §16).
- **Connection ID** — an identifier (0-20 bytes in v1) chosen by each endpoint, used for routing rather than 4-tuple, enabling connection migration.
- **0-RTT / 1-RTT** — number of round-trips before application data flows.
- **Checksum / AEAD** — UDP has a 16-bit checksum; QUIC additionally authenticates and encrypts every packet with AES-GCM or ChaCha20-Poly1305 AEAD plus a separate header-protection mask.
- **ECN** (Explicit Congestion Notification, RFC 3168) — IP-layer 2-bit field; QUIC treats ECN-CE as a congestion signal alongside loss.
- **Alt-Svc** (RFC 7838) and **HTTPS DNS RR** (RFC 9460, Schwartz/Bishop/Nygren, Nov 2023) — service-discovery mechanisms that tell a client an origin can be reached via `"h3"`.

Authoritative explainer for newcomers: Daniel Stenberg's *HTTP/3 Explained* ([https://http3-explained.haxx.se/](https://http3-explained.haxx.se/), last substantive revision 2024) and Robin Marx's two-part *HTTP/3 from A to Z* on Smashing Magazine (2021, still accurate for fundamentals).

---

## History and story

**Pre-history (2009–2012).** Google's *SPDY* prototype (Mike Belshe, Roberto Peon, 2009) showed that multiplexing over a single TLS-on-TCP connection beat HTTP/1.1's six-connection-per-origin scramble. SPDY became the seed of HTTP/2 (RFC 7540, May 2015) under HTTPbis WG chair Mark Nottingham. But two TCP-level scars remained: head-of-line blocking on packet loss, and middlebox ossification — TCP options and even sequence numbers had become so heavily inspected that you could not change the wire without breaking traversal.

**Genesis at Google (2012–2016).** Jim Roskind, a former Netscape Java security architect turned Chrome engineer, drafted "QUIC: Design Document and Specification Rationale" in 2012 and committed the first Chromium code (CL 11125002, "Add QuicFramer and friends," 16 Oct 2012). The first public Chromium experiment landed in Chrome 29 (20 Aug 2013). Google's "gQUIC" fused custom crypto, transport, and HTTP/2-style framing into a monolith. Adam Langley, Jana Iyengar, Ian Swett, and Ryan Hamilton drove iteration; by SIGCOMM 2017 (Langley et al., "The QUIC Transport Protocol: Design and Internet-Scale Deployment," doi:10.1145/3098822.3098842) gQUIC carried ~30% of Google's egress and ~7% of all Internet traffic, with measured 3.6–8% Search latency and 15–18% YouTube rebuffering reductions. [Wikipedia](https://en.wikipedia.org/wiki/Jim_Roskind)[ACM SIGCOMM](https://conferences.sigcomm.org/sigcomm/2017/files/program/ts-5-1-QUIC.pdf)

**IETF standardization (2016–2022).** The IETF QUIC Working Group was chartered in October 2016 (IETF-97 in Seoul, the first meeting in November 2016). The WG split the monolith: QUIC the transport became its own thing, TLS 1.3 replaced gQUIC's homegrown crypto, and the HTTP mapping was carved off. Mark Nottingham, chair of HTTPbis and at one point QUIC, proposed in October 2018 renaming "HTTP-over-QUIC" to "HTTP/3" to make the layering explicit; the rename was accepted within days. The IESG approved the package in 2021–2022. The core RFCs: [ACM SIGCOMM + 2](https://conferences.sigcomm.org/sigcomm/2017/files/program/ts-5-1-QUIC.pdf)

| RFC | Title | Editors | Pub |
|---|---|---|---|
| 8999 | Version-Independent Properties of QUIC | M. Thomson | May 2021 |
| 9000 | QUIC: A UDP-Based Multiplexed and Secure Transport | J. Iyengar (Fastly), M. Thomson (Mozilla) | May 2021 |
| 9001 | Using TLS to Secure QUIC | M. Thomson, S. Turner | May 2021 |
| 9002 | QUIC Loss Detection and Congestion Control | J. Iyengar, I. Swett | May 2021 |
| 9110 | HTTP Semantics (STD 97) | R. Fielding, M. Nottingham, J. Reschke | Jun 2022 |
| 9111 | HTTP Caching | R. Fielding, M. Nottingham, J. Reschke | Jun 2022 |
| 9112 | HTTP/1.1 | same | Jun 2022 |
| 9113 | HTTP/2 | M. Thomson, C. Benfield | Jun 2022 |
| 9114 | HTTP/3 | M. Bishop (Akamai) | Jun 2022 |
| 9204 | QPACK Field Compression for HTTP/3 | C. Krasic, M. Bishop, A. Frindell (ed.) | Jun 2022 |

That June 2022 cluster was a quiet RFC big-bang: it obsoleted RFC 7230–7235, RFC 7540 (HTTP/2), RFC 7234 (caching), RFC 2818 ("HTTPS"), and several smaller standards, replacing twenty years of HTTP specs with a clean five-document set. The Register (7 Jun 2022) called HTTP/3 "the day TCP stopped being assumed." [Cloudflare](https://blog.cloudflare.com/cloudflare-view-http3-usage/)

**Adoption (2018–2024).** Cloudflare announced HTTP/3 edge support in Sep 2019 alongside Chrome Canary and Firefox Nightly. Chrome enabled HTTP/3 for all users by default in April 2020. Firefox followed in May 2021. Apple shipped Safari 14 with experimental HTTP/3 in Sep 2020 and turned it on for everyone in Safari 16 in September 2024. nginx tech-previewed HTTP/3 in June 2020, shipped binary packages in Feb 2023, and merged the QUIC stack into mainline 1.25.0 on 23 May 2023 (still labeled "experimental" through 1.25.x; multipath TCP support and stable QUIC fixes shipped in 1.30.0 in late 2025). Caddy 2.6 (20 Sep 2022) was the first major general-purpose server to enable HTTP/3 by default; LiteSpeed had done so earlier in June 2021. HAProxy added experimental HTTP/3 in 2.6 (31 May 2022) and made it more usable in 2.8/3.0 once OpenSSL 3.5 settled the QUIC API question. curl's HTTP/3 has been "experimental" through 2024–2025; Debian 13/trixie became the first major distribution to ship HTTP/3 in the default `curl` CLI in October 2025 by switching to the OpenSSL 3.3+ QUIC backend (curl 8.16.0-2). Apache httpd has no production HTTP/3. [Wikipedia](https://en.wikipedia.org/wiki/HTTP/3)[Samuel Henrique](https://samueloph.dev/blog/debian-curl-now-supports-http3/)

**Politics and rejected alternatives.** SCTP (RFC 4960) and Multipath TCP (RFC 8684) had answered some of the same problems for years but failed because middleboxes dropped non-TCP/UDP traffic. TCPCrypt (RFC 8548) tried opportunistic transport encryption and went nowhere. The QUIC WG explicitly chose UDP as its substrate to escape ossification; encrypted transport headers (Initial-packet crypto using a version-specific salt; spin-bit being the only deliberate observable) were a political fight, with operators (especially mobile carriers) lobbying for visibility and privacy advocates lobbying for darkness. The famous *spin bit* — a single bit endpoints toggle to enable passive RTT estimation — was the subject of literally hundreds of mailing-list messages.

**The last 24 months (2024–2026).** Major shifts:

- **QUIC v2 (RFC 9369, May 2023, M. Duke)** is now a published Standards-Track template for new QUIC versions; its wire-image version number is `0x6b3343cf` (the first 4 bytes of `sha256("QUICv2 version number")`). It exists almost solely to exercise version negotiation and break middleboxes that ossified on v1's Initial-packet salt.
- **HTTP Datagrams and Capsules (RFC 9297, Aug 2022, D. Schinazi & L. Pardue)** standardized unreliable datagrams over HTTP/3 (and a reliable Capsule fallback for HTTP/1/2), enabling MASQUE and WebTransport.
- **MASQUE WG**: RFC 9298 (Proxying UDP in HTTP, Aug 2022, D. Schinazi) and RFC 9484 (Proxying IP in HTTP, Oct 2023) ship CONNECT-UDP and CONNECT-IP. Apple Private Relay and Cloudflare's WARP-related proxy services use these. [RFC Editor](https://www.rfc-editor.org/info/rfc9298)[IETF](https://datatracker.ietf.org/doc/rfc9484/)
- **WebTransport over HTTP/3** is at draft-ietf-webtrans-http3-15 (March 2026). Chrome and Edge ship implementations; ASP.NET Core Kestrel has experimental support. [Microsoft](https://devblogs.microsoft.com/dotnet/experimental-webtransport-over-http-3-support-in-kestrel/)
- **Multipath QUIC** (draft-ietf-quic-multipath, edited by Y. Liu / Y. Ma / Q. De Coninck / O. Bonaventure / C. Huitema / M. Kuehlewind) entered IESG Last Call in December 2025 (draft-17/-18); the latest draft -21 is dated 17 March 2026. Alibaba and Apple have already deployed predecessors. [IETF QUIC Working Group](https://quicwg.org/multipath/draft-ietf-quic-multipath.html)[IETF](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/)
- **Reliable Stream Resets** (draft-ietf-quic-reliable-stream-reset, M. Seemann & K. Oku, latest -07 in June 2025) defines `RESET_STREAM_AT` so a sender can reset a stream while guaranteeing delivery up to a byte offset — wanted by WebTransport for reliable initial bytes.
- **Encrypted Client Hello (ECH)** was approved by the TLS WG and entered the RFC editor queue in 2025 (RFC 9849 series, IANA registry allocated 2025-07-30). Cloudflare turned it on for ~70% of its zones; Russia began censoring ECH connections; major browsers ship ECH gated by HTTPS DNS records (RFC 9460). [Feisty Duck](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication)[CISecurity](https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello)
- **Linux kernel QUIC**: Xin Long posted the first ~9,000-line in-kernel QUIC patch series on 22 Jul 2025 (LWN coverage); mainline merge expected 2026 at earliest. The design uses `IPPROTO_QUIC` (mirroring `IPPROTO_MPTCP`) with the TLS handshake delegated to userspace via `tlshd`. [Tux Machines + 2](https://news.tuxmachines.org/n/2025/07/31/LWN_s_Kernel_Coverage.shtml)
- **The HTTP/3 plateau**: the 2024 ACM WWW paper by Zhang et al. ("QUIC is not Quick Enough over Fast Internet," doi:10.1145/3589334.3645323) showed up to 45.2% throughput loss vs HTTP/2 above ~500 Mbps. Cloudflare Radar accordingly showed HTTP/3 share decline from a 28% peak (May 2023) to ~21% in Q1 2026 — though methodology debates continue (HTTP Archive's 2024 Web Almanac, Marx/Pollard/Böttger, doi:10.5281/zenodo.14065825, reports ~30% of *capable* sites loaded over HTTP/3 even though only 7–9% of page loads in clean crawls do). [ACM Digital Library](https://dl.acm.org/doi/10.1145/3589334.3645323)[Httparchive](https://almanac.httparchive.org/en/2024/http)

---

## How it actually works

This is the section to take to the whiteboard if you wanted to write a minimal HTTP/3 client. Section references throughout are to RFC 9114 unless otherwise noted; QUIC details come from RFC 9000.

### Layering

```
+---------------------------------+
| HTTP semantics (RFC 9110)       |  request/response, methods, statuses
+---------------------------------+
| HTTP/3 framing (RFC 9114)       |  DATA / HEADERS / SETTINGS / GOAWAY ...
| QPACK (RFC 9204)                |  field compression
+---------------------------------+
| QUIC streams + datagrams        |  RFC 9000 + RFC 9221
| QUIC TLS (RFC 9001)             |  TLS 1.3 baked into transport
| QUIC loss + cc (RFC 9002)       |  NewReno baseline; CUBIC/BBR in practice
+---------------------------------+
| UDP (RFC 768) / IP              |  default port 443 udp
+---------------------------------+
```

### Variable-length integers (RFC 9000 §16)

The first 2 bits of the first byte give the length: 00→1 byte, 01→2 bytes, 10→4 bytes, 11→8 bytes; the remaining bits hold the value. Examples:

- `25` (0x25) → 0x25 (1 byte, value 37)
- `0x9d7f3e7d` → 0x9d7f3e7d (4 bytes prefix `10`, value 494,878,333)
- `0xc2197c5eff14e88c` → 8 bytes value 151,288,809,941,952,652
Used everywhere: stream IDs, frame types, frame lengths, settings, error codes.

### QUIC long header (used during handshake & version negotiation)

```
 0                   1                   2                   3
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|1|1|T T|R R|P P|       Version (32)                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| DCID Len (8)  |  Destination Connection ID (0..160)           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| SCID Len (8)  |  Source Connection ID (0..160)                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Type-specific payload (Initial / 0-RTT / Handshake / Retry)   |
```

- Bit 0 (header form) = 1 → long header. [RFC Editor](https://www.rfc-editor.org/rfc/rfc8999.html)
- Bit 1 (fixed bit) = 1; the WG calls a 0 here a "grease" or v2-only signal (RFC 9287, "Greasing the QUIC Bit").
- Bits 2–3 (T): packet type — 00 Initial, 01 0-RTT, 10 Handshake, 11 Retry (in v1). [Washington University in St. Louis](https://www.cse.wustl.edu/~jain/cse570-21/ftp/quic/index.html)
- Bits 4–5 (R): reserved (must be 0 after header protection removed).
- Bits 6–7 (P): packet number length minus 1, for Initial/0-RTT/Handshake.
- Initial packets carry the TLS ClientHello/ServerHello in CRYPTO frames and an optional Token.

### QUIC short header (used for 1-RTT data)

```
+-+-+-+-+-+-+-+-+
|0|1|S|R|R|K|P P|
+-+-+-+-+-+-+-+-+
| Destination Connection ID (0..160) |
+------------------------------------+
| Packet Number (8/16/24/32)         |
+------------------------------------+
| Protected Payload                  |
```

- Bit 0 = 0 → short header.
- Bit 1 = 1 fixed. [arXiv](https://arxiv.org/html/2511.08375v1)
- Bit 2 (S): the **spin bit** — toggled per-RTT for passive RTT measurement. [arXiv](https://arxiv.org/html/2511.08375v1)
- Bits 3–4 (R): reserved.
- Bit 5 (K): key phase — flips on key updates. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-transport-08)
- Bits 6–7 (P): packet-number length.

Header protection (RFC 9001 §5.4) XORs the first byte's low bits and the packet-number with a mask derived from the encrypted payload, so on-path observers cannot easily read packet numbers or correlate streams. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath-14)

### QUIC frames inside a packet payload

The payload (after AEAD decryption) is a concatenation of typed frames:

- 0x00 PADDING; 0x01 PING
- 0x02–0x03 ACK (+ECN)
- 0x04 RESET_STREAM; 0x05 STOP_SENDING
- 0x06 CRYPTO; 0x07 NEW_TOKEN
- 0x08–0x0f STREAM (low 3 bits = OFF/LEN/FIN flags)
- 0x10 MAX_DATA; 0x11 MAX_STREAM_DATA; 0x12–0x13 MAX_STREAMS
- 0x14 DATA_BLOCKED; 0x15 STREAM_DATA_BLOCKED; 0x16–0x17 STREAMS_BLOCKED
- 0x18 NEW_CONNECTION_ID; 0x19 RETIRE_CONNECTION_ID
- 0x1a PATH_CHALLENGE; 0x1b PATH_RESPONSE
- 0x1c–0x1d CONNECTION_CLOSE; 0x1e HANDSHAKE_DONE
- 0x30/0x31 DATAGRAM (RFC 9221)
- 0x35 RESET_STREAM_AT (Reliable Stream Resets, future)

### HTTP/3 frame types (RFC 9114 §7.2)

| Type | Name | Notes |
|---|---|---|
| 0x00 | DATA | request/response body |
| 0x01 | HEADERS | QPACK-compressed field section |
| 0x03 | CANCEL_PUSH | reserved; rarely used |
| 0x04 | SETTINGS | first frame on each control stream |
| 0x05 | PUSH_PROMISE | server push (deprecated in practice) |
| 0x07 | GOAWAY | graceful shutdown w/ last stream/push ID |
| 0x0d | MAX_PUSH_ID | client increases push ID limit |

Reserved frame types `0x21+0x1f*N` ("greased") MUST be ignored — anti-ossification.

### Stream types (RFC 9114 §6)

QUIC stream IDs are 62-bit varints. The 2 low bits decide direction and initiator: `00` client-initiated bidirectional; `01` server-initiated bidirectional; `02` client-initiated unidirectional; `03` server-initiated unidirectional.

For HTTP/3, request/response runs on client-initiated bidirectional streams (IDs 0, 4, 8, …). Unidirectional streams carry a varint stream-type prefix:

| Prefix | Stream | Direction |
|---|---|---|
| 0x00 | Control | exactly one each direction |
| 0x01 | Push (server→client) | rare in practice |
| 0x02 | QPACK encoder | unidirectional, by both peers |
| 0x03 | QPACK decoder | unidirectional, by both peers |

Closing the control stream is fatal — H3_CLOSED_CRITICAL_STREAM.

### Connection establishment — the wire dance

```
sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: UDP src/dst port 443, 1200+ byte Initial datagram required

    C->>S: Initial[CRYPTO(ClientHello, ALPN=h3, TLS1.3 keyshare, SNI/ECH)]
    S->>C: Initial[CRYPTO(ServerHello, encrypted_ext, cert, ...)] + Handshake[CRYPTO(...)]
    Note over C,S: 1-RTT keys derived; AEAD-protected short headers next
    C->>S: Handshake[CRYPTO(Finished)] + 1-RTT[STREAM(0): HEADERS, DATA]
    S->>C: 1-RTT[HANDSHAKE_DONE, NEW_CONNECTION_ID, STREAM(0): HEADERS, DATA]

    Note over C,S: Both endpoints SETTINGS frames on control streams (type 0x00)
    Note over C,S: SETTINGS_QPACK_MAX_TABLE_CAPACITY, ...
    Note over C,S: Subsequent requests reuse the connection; 0-RTT possible on resumption
```

For 0-RTT: the client uses a TLS 1.3 PSK from a prior session and sends `0-RTT` long-header packets carrying request data with the first flight. RFC 9001 §9.2 warns that 0-RTT is replayable — never use it for non-idempotent requests.

### SETTINGS frame identifiers (RFC 9114 §7.2.4 + extensions)

| Identifier | Name | Default | Effect |
|---|---|---|---|
| 0x01 | SETTINGS_QPACK_MAX_TABLE_CAPACITY | 0 | QPACK dynamic table size in bytes |
| 0x06 | SETTINGS_MAX_FIELD_SECTION_SIZE | unbounded | per-request header size cap |
| 0x07 | SETTINGS_QPACK_BLOCKED_STREAMS | 0 | concurrent streams that may block on QPACK |
| 0x08 | SETTINGS_ENABLE_CONNECT_PROTOCOL | 0 | Extended CONNECT (RFC 8441/9220) |
| 0x33 | SETTINGS_H3_DATAGRAM | 0 | enable RFC 9297 datagrams |
| reserved | greased identifiers `0x1f*N+0x21` | — | MUST be ignored |

### HTTP/3 error codes (RFC 9114 §8.1)

`H3_NO_ERROR=0x100`, `H3_GENERAL_PROTOCOL_ERROR=0x101`, `H3_INTERNAL_ERROR=0x102`, `H3_STREAM_CREATION_ERROR=0x103`, `H3_CLOSED_CRITICAL_STREAM=0x104`, `H3_FRAME_UNEXPECTED=0x105`, `H3_FRAME_ERROR=0x106`, `H3_EXCESSIVE_LOAD=0x107`, `H3_ID_ERROR=0x108`, `H3_SETTINGS_ERROR=0x109`, `H3_MISSING_SETTINGS=0x10a`, `H3_REQUEST_REJECTED=0x10b`, `H3_REQUEST_CANCELLED=0x10c`, `H3_REQUEST_INCOMPLETE=0x10d`, `H3_MESSAGE_ERROR=0x10e`, `H3_CONNECT_ERROR=0x10f`, `H3_VERSION_FALLBACK=0x110`, plus QPACK errors `0x200-0x202` and `H3_DATAGRAM_ERROR=0x33` (RFC 9297).

### QPACK in 200 words (RFC 9204)

QPACK splits HPACK into two unidirectional QUIC streams (encoder type 0x02, decoder type 0x03) plus two tables: a 99-entry static table and a per-connection dynamic table. The encoder sends *insertions* on the encoder stream and *literals or indexed references* in the HEADERS frame; the decoder acks insertions on the decoder stream. Because QUIC streams are independent, the encoder must avoid referencing dynamic-table entries the decoder hasn't acked yet, or accept that referencing streams will *block*. SETTINGS_QPACK_BLOCKED_STREAMS limits how many can do so. This is the main subtlety: QPACK trades a tiny compression ratio versus HPACK for the ability to never deadlock under reordering.

### Connection IDs and migration

Each peer issues one or more Connection IDs (NEW_CONNECTION_ID frames). On a NAT rebinding or Wi-Fi→cellular handoff, the client sends packets from the new 5-tuple but with the old DCID. The server validates the new path with PATH_CHALLENGE/PATH_RESPONSE and continues. This is the killer feature for mobile and the one feature most often broken by stateful firewalls.

### Service discovery: Alt-Svc and HTTPS DNS RR

A TCP-served origin can advertise `Alt-Svc: h3=":443"; ma=86400` to tell the client "next time, try HTTP/3 on UDP/443" (RFC 7838). Better, RFC 9460 (Schwartz/Bishop/Nygren, Nov 2023) defines `HTTPS` and `SVCB` DNS records that carry `alpn=h3,h2`, `ipv4hint`, `ech=…`, etc., letting the client try HTTP/3 on the *first* connection without an HTTP/2 round-trip. Web Almanac 2024 found that 99% of HTTP/3 page loads it observed were triggered by HTTPS DNS records. [Httparchive](https://almanac.httparchive.org/en/2024/http)

---

## Deep connections to other protocols

**HTTP/2 (RFC 9113).** HTTP/3 is, very deliberately, "HTTP/2's request/response semantics, with HTTP/2's framing replaced by QUIC streams and HPACK replaced by QPACK." Server Push (PUSH_PROMISE) is in the spec but unused — Cloudflare and Chrome dropped it for HTTP/3 in favor of 103 Early Hints. Stream IDs and dependency-based prioritization are gone; RFC 9218 ("Extensible Prioritization Scheme for HTTP," Pardue/Oku) replaces them with a simple urgency/incremental Priority header. [Hacker News](https://news.ycombinator.com/item?id=31647033)

**QUIC (RFC 9000/9001/9002).** QUIC is HTTP/3's transport and would not exist without it, but QUIC is now an independent platform: DNS-over-QUIC (RFC 9250), SMB-over-QUIC (Microsoft), gRPC-over-HTTP/3 (cloud SDKs), and even SSH-over-QUIC research. RFC 9221 added the unreliable DATAGRAM frame extension.

**TLS 1.3 (RFC 8446).** QUIC integrates TLS at the record level: instead of TLS records the handshake messages travel in CRYPTO frames inside Initial and Handshake packets, sharing AEAD keys derived by HKDF from TLS handshake/application secrets. There is no TLS version other than 1.3 with QUIC.

**UDP (RFC 768).** Pure substrate. QUIC must enforce a 3:1 amplification cap on un-validated paths (RFC 9000 §8.1): a server may not send more than 3× the bytes the client sent until address-validated, which is why minimum 1200-byte Initial packets are mandated.

**REST.** REST is an architectural style, not a protocol; HTTP/3 inherits all the REST mechanics from RFC 9110 (methods, status codes, content negotiation, conditional requests) unchanged. For an API author, switching from HTTP/2 to HTTP/3 is mostly a deployment change.

**HTTP/1.1 (RFC 9112).** Still ubiquitous (~28% of requests in 2026). HTTP/3's binary framing, like HTTP/2's, eliminates the request-smuggling class of attacks that PortSwigger's James Kettle keeps mining out of CL.0/0.CL desync (Akamai CVE-2025-32094, Cloudflare CVE-2025-4366) — but only on hops that actually speak HTTP/3 end-to-end.

**HTTP semantics (RFC 9110), caching (RFC 9111), HTTP/1.1 (RFC 9112).** The same June 2022 cluster. RFC 9110 is the canonical reference for what an HTTP method or status code "means" today.

**ALPN (RFC 7301).** TLS extension that selects "h3"; without it, a UDP/443 listener has no way to know whether to speak HTTP/3 or DoQ. The token went from "hq-29"/"h3-29" through draft tokens to plain "h3" at RFC publication.

**Alt-Svc (RFC 7838).** First-hit fallback discovery via an HTTP response header.

**HTTPS DNS RR (RFC 9460).** Same idea, but pre-connection. Carries ALPN, port, IP hints, and ECH config.

**MASQUE (RFCs 9297 / 9298 / 9484).** Proxying UDP and IP through HTTP/3. Apple's iCloud Private Relay, Google's IP Protection, and Cloudflare WARP all build on MASQUE-class designs.

**WebTransport over HTTP/3** (draft-ietf-webtrans-http3-15, March 2026; A. Frindell, E. Kinnear, V. Vasiliev). Bidirectional/unidirectional streams + datagrams piggy-backed on a single HTTP/3 CONNECT extended request. Targets games, real-time media, and anything WebSocket can't do well.

**gRPC.** gRPC over HTTP/3 has shipped in the major SDKs since 2024; the wire is unchanged (binary framing inside DATA frames, grpc-* trailers).

**WebSocket over HTTP/3 (RFC 9220, R. Hamilton, June 2022).** Defined; barely deployed. As of early 2026 no major browser ships production WebSocket-over-HTTP/3.

**Server-Sent Events (SSE, WHATWG).** Just an `text/event-stream` HTTP response — works unchanged on HTTP/3 and benefits from no-HOL multiplexing.

**DNS-over-HTTPS (RFC 8484) / DNS-over-QUIC (RFC 9250).** Encrypted DNS resolvers; ECH discovery (HTTPS DNS records) often arrives via DoH/DoQ.

**ECH (RFC 9849, queue 2025).** TLS extension that encrypts the inner ClientHello (incl. SNI) under a key fetched from the HTTPS DNS RR. Cloudflare deployed ECH; Russia censors it.

**ECN (RFC 3168) and L4S (RFC 9330).** QUIC carries ECN feedback in ACK_ECN frames. L4S (Low Latency, Low Loss, Scalable) is the next-generation AQM coupling, with QUIC implementations (Apple, Google) experimenting.

**MPTCP (RFC 8684) and SCTP (RFC 9260).** MPTCP-the-rejected-alternative now lives on as inspiration for Multipath QUIC; SCTP barely runs anywhere except WebRTC's data channel and telephony signaling.

**QPACK (RFC 9204), HTTP/3 Datagrams (RFC 9297), Reliable Stream Resets (draft-07).** Already covered; all are HTTP/3-adjacent extensions.

---

## Real-world deployment

**Open-source QUIC stacks (curated, current as of May 2026).**

| Implementation | Lang | Owner | Notes |
|---|---|---|---|
| quiche | Rust | Cloudflare | nginx integration; powers Cloudflare's edge |
| msquic | C | Microsoft | Used in Windows kernel, IIS, .NET 8+ |
| quic-go | Go | Marten Seemann (community) | Caddy, Traefik, syncthing |
| ngtcp2 + nghttp3 | C | Tatsuhiro Tsujikawa | curl's preferred backend |
| lsquic | C | LiteSpeed | OpenLiteSpeed, ZeroTier |
| aioquic | Python | Jeremy Lainé | reference + research |
| picoquic | C | Christian Huitema | research, IETF interop |
| mvfst | C++ | Meta | Facebook apps, 75%+ Meta traffic |
| s2n-quic | Rust | AWS | CloudFront, S3 |
| google-quiche | C++ | Google | Chrome, GFE |
| OpenSSL QUIC | C | OpenSSL 3.2+ | now the basis of Debian curl 8.16; Stenberg measured it 4× slower / 25× more memory than ngtcp2 in 2024 |
| BoringSSL | C | Google | TLS only; QUIC pluggable |

**Servers & proxies.**

- **nginx** — experimental in 1.25.0 (23 May 2023); production-grade with OpenSSL 3.5+ from 1.29.x onward; CVE-2024-31079, -32760, -34161, -35200 patched mid-2024. Cloudflare maintains a separate quiche-patched nginx.
- **Caddy** — HTTP/3 default-on since 2.6 (Sep 2022). Uses quic-go.
- **HAProxy** — experimental in 2.6 (May 2022); usable in 2.8 LTS once OpenSSL caught up; `quic4@` bind syntax.
- **LiteSpeed / OpenLiteSpeed** — first server with HTTP/3 default-on (6.0.2, June 2021).
- **Microsoft IIS** — built into Windows Server 2022 / Windows 11 via msquic.
- **Envoy / Istio** — quiche backend, GA HTTP/3 since 2023.
- **Apache httpd** — no production HTTP/3 module as of 2026.

**CDNs and clouds.** Cloudflare (Sep 2019), Google (rolled together with Chrome), Fastly, Akamai, Microsoft (Azure Front Door), Apple (iCloud, App Store via Private Relay), Meta (FB/Instagram apps; mvfst), Amazon CloudFront (since 2022). AWS, Cloudflare, and Google jointly co-disclosed Rapid Reset on 10 Oct 2023 — peak attack rates of 155M/201M/398M rps respectively.

**Browsers.** Chrome (Apr 2020), Edge (Chromium, 2020), Firefox (May 2021), Safari (Sep 2024 universally; experimental from 2020).

**Performance numbers, real published.**

- Langley et al., SIGCOMM 2017: 3.6–8% Search latency reduction, 15–18% YouTube rebuffering reduction at gQUIC scale. [ACM SIGCOMM](https://conferences.sigcomm.org/sigcomm/2017/files/program/ts-5-1-QUIC.pdf)
- Meta engineering, Oct 2020: HTTP/3 + mvfst carrying ~75% of Meta's app traffic, with measurable improvements to media playback start times.
- Cloudflare blog, May 2023: HTTP/3 share grew from ~14% to ~28% of Cloudflare-network traffic over twelve months.
- Zhang et al., ACM WWW 2024: up to 45.2% throughput reduction vs HTTP/2 above 1 Gbps; ~500 Mbps inflection point on Chrome; root-cause = userspace ACK processing and missing UDP GRO/GSO. [ACM Digital Library](https://dl.acm.org/doi/pdf/10.1145/3589334.3645323)[arXiv](https://arxiv.org/abs/2310.09423)
- TechnologyChecker.io, Apr 2026 cross-referenced Cloudflare Radar: HTTP/2 51.04%, HTTP/1.x 27.84%, HTTP/3 21.11% over 30 days ending 9 Apr 2026 (the figures are reasonable but the site is a marketing-tracker; treat them as directional, not authoritative).

---

## Failure modes and famous incidents

**HTTP/2 Rapid Reset — CVE-2023-44487 (disclosed 10 Oct 2023).** Discovered after attackers in August 2023 hit Google with 398 million requests/second, Cloudflare with 201 Mrps, and AWS with 155 Mrps — peak rps records by an order of magnitude. The technique exploited HTTP/2's RST_STREAM: a client could open a stream and immediately reset it, the server would still allocate compute for the request before tearing down, and per-connection stream-cancellation was effectively unbounded. **HTTP/3 implementations** were "not currently believed to be affected" because of QUIC's per-stream flow-control, but several vendors proactively patched analogous accounting bugs. Notable patches: nghttp2 GHSA-vx74-f528-fxqg; Go `golang.org/x/net/http2` cap; nginx; Netty; AWS ALB; Cloudflare. Red Hat's RHSB-2023-003 lists scores of products.

**MadeYouReset — CVE-2025-8671 (disclosed 13 Aug 2025).** Discovered by Gal Bar Nahum, Anat Bremler-Barr, Yaniv Harel (Tel Aviv University & Imperva). Where Rapid Reset abused *client-sent* RST_STREAM, MadeYouReset induces the *server* to send RST_STREAM (via malformed WINDOW_UPDATE, PRIORITY, or frames on half-closed streams). Servers then mark the stream closed for protocol accounting while the backend keeps processing, bypassing the post-Rapid-Reset MAX_CONCURRENT_STREAMS guard. Per-vendor IDs: Apache Tomcat CVE-2025-48989, F5 BIG-IP CVE-2025-54500, Netty CVE-2025-55163. Fastly fixed in H2O 25.17 by 2 June 2025; Varnish 7.6.5/7.7.3/6.0.16; Microsoft Azure Application Gateway already protected via 2023 mitigations. **HTTP/3 implementations**: again, not directly affected because HTTP/3 stream cancellation maps onto QUIC RESET_STREAM with separate accounting; but the IETF HTTP-WG explicitly clarified that "this is not a protocol vulnerability" — implementations of *any* HTTP version that decouple stream-state accounting from backend completion are at risk.

**Hash DoS in QUIC implementations (NCC Group, 2025).** Pierre Bottine and team at NCC found hash-table-collision DoS in xquic (Alibaba) in late 2024; subsequent review identified CVE-2025-23020 (kwik), CVE-2025-24947 (lsquic, fixed 4.2.0), and bugs in picoquic, ngtcp2 example server, Ericsson Rask MP-QUIC. Cause: predictable-seeded hash tables for connection-ID lookup. [NCC Group](https://www.nccgroup.com/research-blog/technical-advisory-hash-denial-of-service-attack-in-multiple-quic-implementations/)[GitHub](https://github.com/ncc-pbottine/QUIC-Hash-Dos-Advisory)

**Microsoft msquic CVE-2024-26190 (Mar 2024).** Memory-allocation amplification in Windows .NET 7/8 stack — a peer could induce small repeated allocations that persisted for the connection lifetime. Patched in .NET 7.0.17 / 8.0.3.

**nginx HTTP/3 cluster (Apr–May 2024).** CVE-2024-24989/24990 (worker-process segfaults on crafted QUIC), CVE-2024-31079, CVE-2024-32760 (worker memory disclosure where MTU > 4096), CVE-2024-34161, CVE-2024-35200 (NULL-pointer DoS in HTTP/3 module). All disclosed by CISPA's Nils Bars; patched in 1.25.4–1.27.0. [nginx](https://nginx.org/en/CHANGES)

**Operational, not CVE: UDP filtering and connection migration.** University and corporate networks routinely block or rate-limit UDP/443; users see endless TCP fallback. Cloudflare community threads (e.g., minseokhanportfolio.com on QUT Wi-Fi, Oct 2025) regularly ask Cloudflare to disable HTTP/3 per-zone for this reason. Stateful firewalls that track 4-tuple flows break QUIC connection migration; the QUIC-LB draft (draft-ietf-quic-load-balancers, near publication 2025) addresses load-balancer-side stateless routing via Connection ID encoding.

**Amplification + Retry (RFC 9000 §8).** Without enforcement of the 3:1 limit and Retry tokens, an attacker spoofing a victim's IP could turn a tiny Initial packet into a multi-kilobyte ServerHello. Nawrocki et al. ("QUICsand," ACM IMC 2021) measured live amplification scans hitting deployed QUIC servers. RETRY-token handshake flooding remains a real attack surface; QFAM (arXiv:2412.08936, Dec 2024) proposes adding a cryptographic puzzle to the Retry packet. [Springer](https://link.springer.com/article/10.1007/s10207-022-00630-6)[arxiv](https://arxiv.org/pdf/2412.08936)

**Ossification creeping back.** RFC 9369 explicitly notes middleboxes already keying off the v1 Initial salt. Hilal et al. ("Unpacking Internet Ossification," ACM Networking 2026) measured path-impairing middleboxes and confirmed QUIC v2 deployment is partly motivated by middleboxes that *only* allow QUIC v1.

---

## Fun facts and anecdotes

- **"QUIC" is officially not an acronym.** Roskind's 2012 internal Google doc called it "Quick UDP Internet Connections," but RFC 9000 §1.2 drops the expansion: *"QUIC is a name, not an acronym."* The IETF made this normative because the WG could not agree the protocol was actually "quick" in all conditions. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-qpack-11)[IETF](https://datatracker.ietf.org/doc/html/rfc9000)
- **The ALPN identifier journey.** From "Q043"/"Q046"/etc. (gQUIC versions) to "hq" (HTTP-over-QUIC) to "h3-29" (the last interop draft) to plain `"h3"` in 2022. Web servers still publish `alt-svc: h3=":443", h3-29=":443"` for clients that haven't updated.
- **The naming rename.** Mark Nottingham's 28 Oct 2018 mailing-list message "Why HTTP/3?" got the protocol its number; the IETF approved within 72 hours. Daniel Stenberg blogged the change the same week and updated *HTTP/3 Explained* before NGINX even had a draft.
- **No server push.** RFC 9114 still defines PUSH_PROMISE (frame 0x05) and MAX_PUSH_ID (0x0d), but **Cloudflare announced they would not implement it**, Chrome removed HTTP/2 push in 2022, and the future direction is 103 Early Hints. The functional successor is `SETTINGS_ENABLE_CONNECT_PROTOCOL` for things like WebTransport/WebSocket-over-HTTP/3.
- **The spin bit fight.** A single bit consumed hundreds of mailing-list posts and multiple IETF interim meetings. It exists, on by default, only for *passive* RTT estimation by network operators who otherwise saw nothing.
- **QPACK is also "not an acronym."** RFC 9204 §1.1: *"QPACK is a name, not an acronym."* The IETF apparently liked this trick.
- **HTTP over carrier pigeon.** RFC 1149 (1990, 1 April) and RFC 2549 (1999, with QoS) defined IP-over-Avian-Carriers. Bergen Linux User Group implemented it in 2001 with 9 packets, 64% loss, 6,165 ms ping. RFC 2324 (1998) defined the Hyper Text Coffee Pot Control Protocol, which RFC 7168 (2014) extended to teapots. None of these are HTTP/3, but you will be asked.
- **The IETF hackathons.** From IETF-100 (Singapore, Nov 2017) onward, every IETF week has had a QUIC interop matrix showing which implementations could actually talk to which. Marten Seemann's automated continuous interop runner replaced the Google spreadsheet around 2020.
- **Lucas Pardue's videos.** Cloudflare's Lucas Pardue (now at Cloudflare R&D) co-edits HTTP/3 prioritization (RFC 9218) and HTTP Datagrams (RFC 9297) and runs the YouTube channel "Lucas Pardue" (last upload Q1 2026) with single-best-source explainers of QPACK, datagrams, and qlog.
- **The 30-billion-events fact.** Robin Marx's 2020 ANRW paper reported Facebook (now Meta) logging "30 billion qlog events daily" in production via mvfst — the largest single deployment of structured QUIC logging. [ResearchGate](https://www.researchgate.net/publication/354590001_Visualizing_QUIC_and_HTTP3_with_qlog_and_qvis)
- **Stenberg's funding.** Daniel Stenberg has worked on curl HTTP/3 first as a Mozilla employee (2014–2018), then independently, with sponsorship from wolfSSL since 2018. He published *HTTP/3 Explained* on 26 November 2018, before any RFC existed. [curl](https://daniel.haxx.se/blog/author/daniel/page/49/)

---

## Practical wisdom

**Tuning parameters worth knowing.**

| Knob | Typical default | When to change |
|---|---|---|
| `idle_timeout` (transport param) | 30 s | reduce in load-balanced fleets to reclaim memory; raise for IoT |
| `initial_max_data` (conn-level flow control) | 12 MB (msquic), 1 MB (nginx) | bulk-transfer workloads need >10 MB |
| `initial_max_stream_data_bidi_local` | varies | mobile uplink throttles benefit from larger windows |
| `initial_max_streams_bidi` | 100 | API gateways with bursty fan-out need more |
| Congestion control | NewReno (RFC 9002) | swap to CUBIC (Linux default) or BBR/BBRv2/BBRv3 — userspace hot-swap is QUIC's superpower |
| 0-RTT | off by default | enable only for idempotent GETs; replay-window is the entire ticket lifetime |
| `net.core.rmem_max` / `wmem_max` | 208 KiB on Linux | raise to 26 MiB for high-BDP servers; the 2024 paper showed kernel UDP socket buffers are the bottleneck |
| UDP GSO/GRO | varies | enable `UDP_SEGMENT` segmentation offload on Linux 4.18+; this single change closes most of the HTTP/2 vs HTTP/3 throughput gap |
| qlog | off | turn on for triage; volumes can be enormous but Meta showed it's tractable |

**Connection migration in load-balanced environments.** Without QUIC-LB (draft-ietf-quic-load-balancers, near final 2025) you must use the L3DSR/anycast path or the same Connection-ID prefix routing across LB nodes. Cloudflare's quiche encodes server identity in the CID; Google encodes load-balancer assignment in the first 8 bytes.

**0-RTT vs 1-RTT replay.** Per RFC 9001 §9.2, anything sent in 0-RTT data is replayable. Use `Early-Data: 1` (RFC 8470) at HTTP and reject non-idempotent methods server-side or behind a CDN.

**Debugging.** SSLKEYLOGFILE works for QUIC since OpenSSL 3.2 / BoringSSL 2022; Wireshark 4.0+ decrypts QUIC and HTTP/3 inline. For the structured view, log qlog (JSON or qlog-binary) and feed it into qvis ([https://qvis.quictools.info/](https://qvis.quictools.info/), last commit 2024) — the sequence-diagram and congestion-control panels are uniquely good. h2load supports HTTP/3 via ngtcp2 since v1.45 (2022). curl with `--http3` works reliably when built against ngtcp2; OpenSSL-QUIC-backed curl is "experimental" and slow.

**Common misconfigurations.**

1. Forgetting to open UDP/443 on the firewall (most common cause of "HTTP/3 doesn't work" on user-managed servers).
2. Returning Alt-Svc but not actually listening on UDP/443 — clients then race and time out.
3. Mismatched ALPN: the server only advertises "h3-29" while the client wants "h3".
4. Truncated HTTPS DNS records — some authoritative servers strip RR types they don't understand.
5. Allowing 0-RTT for POST endpoints.
6. Not bumping `net.core.rmem_max`; without this, the kernel drops UDP under load and HTTP/3 looks like it's "broken under congestion."

---

## Learning resources (current as of 2026)

**Primary specifications (RFCs)**

| RFC / Draft | Title | Last published | URL | Level | Section pointers |
|---|---|---|---|---|---|
| RFC 9114 | HTTP/3 | 2022-06 | [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114) | advanced | §4 (handshake), §6 (streams), §7 (frames), §8 (errors) |
| RFC 9000 | QUIC core | 2021-05 | [https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000) | advanced | §5–8 (handshake/path), §16 (varints), §17 (header formats), §19 (frames) |
| RFC 9001 | TLS over QUIC | 2021-05 | [https://www.rfc-editor.org/rfc/rfc9001](https://www.rfc-editor.org/rfc/rfc9001) | advanced | §5 (packet protection), §9 (security) |
| RFC 9002 | Loss detection / cc | 2021-05 | [https://www.rfc-editor.org/rfc/rfc9002](https://www.rfc-editor.org/rfc/rfc9002) | advanced | §5 (loss), §7 (cc), App. B (NewReno) |
| RFC 9204 | QPACK | 2022-06 | [https://www.rfc-editor.org/rfc/rfc9204](https://www.rfc-editor.org/rfc/rfc9204) | advanced | §3 (tables), §4 (representations), §5 (state) |
| RFC 9220 | WebSocket over HTTP/3 | 2022-06 | [https://www.rfc-editor.org/rfc/rfc9220](https://www.rfc-editor.org/rfc/rfc9220) | intermediate | all 6 pages |
| RFC 9297 | HTTP Datagrams + Capsule | 2022-08 | [https://www.rfc-editor.org/rfc/rfc9297](https://www.rfc-editor.org/rfc/rfc9297) | intermediate | §2 (dgram), §3 (capsule) |
| RFC 9298 | Proxying UDP in HTTP | 2022-08 | [https://www.rfc-editor.org/rfc/rfc9298](https://www.rfc-editor.org/rfc/rfc9298) | intermediate | §3 (URI templates) |
| RFC 9369 | QUIC v2 | 2023-05 | [https://www.rfc-editor.org/rfc/rfc9369](https://www.rfc-editor.org/rfc/rfc9369) | intermediate | §3 (changes from v1) |
| RFC 9460 | SVCB / HTTPS DNS | 2023-11 | [https://www.rfc-editor.org/rfc/rfc9460](https://www.rfc-editor.org/rfc/rfc9460) | intermediate | §2, §9 |
| RFC 8446 | TLS 1.3 | 2018-08 | [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446) | advanced | §2 (handshake), §4.2.11 (PSK) |
| draft-ietf-quic-multipath-21 | Multipath QUIC | 2026-03 | [https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/) | advanced | §3 (path mgmt) |
| draft-ietf-webtrans-http3-15 | WebTransport over HTTP/3 | 2026-03 | [https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/) | intermediate | §3, §4 |
| draft-ietf-tls-esni-25 | TLS ECH | 2025-06 | [https://datatracker.ietf.org/doc/draft-ietf-tls-esni/](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/) | advanced | §6 (HPKE), §10 (security) |

**Books**

| Title | Author | URL | Last update | Level |
|---|---|---|---|---|
| HTTP/3 Explained | Daniel Stenberg | [https://http3-explained.haxx.se/](https://http3-explained.haxx.se/) | 2024 (continuous) | intro |
| High Performance Browser Networking, 1e | Ilya Grigorik | [https://hpbn.co/](https://hpbn.co/) | 2013 (still relevant for fundamentals; pre-HTTP/3) | intermediate |
| Learning HTTP/2 | Garza/Pollard | O'Reilly 2017 | 2017 (does *not* cover HTTP/3; use Stenberg) | intro |
| HTTP/3 in Action (Manning) | Khulwinder Brar (forthcoming) | manning.com | MEAP 2025 | intermediate |

**Academic papers**

- Langley et al., "The QUIC Transport Protocol: Design and Internet-Scale Deployment," SIGCOMM 2017, doi:10.1145/3098822.3098842 — the deployment paper.
- Yang, Iyengar et al., "How Facebook is bringing QUIC to billions" (Meta engineering blog, 21 Oct 2020). [https://engineering.fb.com/2020/10/21/networking-traffic/how-facebook-is-bringing-quic-to-billions/](https://engineering.fb.com/2020/10/21/networking-traffic/how-facebook-is-bringing-quic-to-billions/)
- Marx, Piraux, Quax, Lamotte, "Debugging QUIC and HTTP/3 with qlog and qvis," ANRW 2020, doi:10.1145/3404868.3406663.
- Zhang et al., "QUIC is not Quick Enough over Fast Internet," ACM WWW 2024, doi:10.1145/3589334.3645323 (arXiv:2310.09423).
- Chen, Jaeger, Zirngibl, "RFC 9000 and its Siblings: An Overview of QUIC Standards," TUM NET-2024-04-1.
- Niere et al., "Encrypted Client Hello in Censorship Circumvention," PoPETs FOCI 2025.

**Engineering blogs (recent)**

- Cloudflare HTTP/3 series — [https://blog.cloudflare.com/tag/http3/](https://blog.cloudflare.com/tag/http3/) (active 2024–2026).
- Daniel Stenberg, "HTTP/3 in curl mid 2024," [https://daniel.haxx.se/blog/2024/06/10/http-3-in-curl-mid-2024/](https://daniel.haxx.se/blog/2024/06/10/http-3-in-curl-mid-2024/)
- Samuel Henrique, "Debian's curl now supports HTTP/3" (4 Jul 2024, updated Oct 2025), [https://samueloph.dev/blog/debian-curl-now-supports-http3/](https://samueloph.dev/blog/debian-curl-now-supports-http3/)
- Microsoft msquic blog — [https://github.com/microsoft/msquic/wiki](https://github.com/microsoft/msquic/wiki)
- Fastly QUIC posts (h2o + ngtcp2 hybrid) 2024–2025.

**Talks / videos**

- Lucas Pardue's QUIC and HTTP/3 talks (Cloudflare TV / IETF) — 2020–2024.
- Robin Marx, "Fixing HTTP/2 and Preparing for HTTP/3 over QUIC," Velocity Berlin 2019; updated talks 2022–2024.
- "Demystifying QUIC from the Specifications" — arXiv 2511.08375v1, Nov 2025 — useful when you want a single-PDF-for-implementers.

**Podcasts**

- *Packet Pushers*: "Heavy Networking" episodes 643, 720 (HTTP/3 & QUIC, 2022–2024).
- *IPv6 Buzz* — adjacent transport-layer episodes.
- *On The Metal* (Oxide Computer) — kernel networking episodes touching QUIC.
- *Telecom Lobby* — operator perspective on QUIC observability.

**University courses (most are general networking with QUIC modules)**

- Stanford CS 144 (Levis & Mazières) — [https://cs144.github.io/](https://cs144.github.io/) — 2025 Autumn iteration; assignments build a TCP-in-userspace; use as a transport-protocol on-ramp.
- MIT 6.5840 (Distributed Systems, formerly 6.824) — touches QUIC in 2024 lectures.
- CMU 15-441/641 — undergraduate networking.
- Berkeley CS 168, Princeton COS 461 — both teach modern transports.

**Hands-on tools**

- qvis — [https://qvis.quictools.info/](https://qvis.quictools.info/) — qlog visualizer; last meaningful UI update 2024.
- pcap2qlog — [https://github.com/quiclog/pcap2qlog](https://github.com/quiclog/pcap2qlog) — convert Wireshark captures to qlog.
- Wireshark with QUIC dissection — built in since 3.6, decryption via SSLKEYLOGFILE works for QUIC since 2022.
- h2load (part of nghttp2) — HTTP/3 benchmarking via ngtcp2.
- nghttp / nghttpx — lightweight HTTP/3 client and proxy.
- curl `--http3` and `--http3-only` — works with ngtcp2 build; experimental with OpenSSL backend.
- quic-tracker / qns (QUIC Network Simulator) — test fixture used by IETF interop.

---

## Where things are heading (2025–2026 frontier)

**Active standards work (IETF QUIC WG, HTTPbis WG, MASQUE WG, WebTransport WG, TLS WG).**

- **Multipath QUIC** — IESG Last Call closed Dec 2025 (draft -17/-18); RFC publication likely H1 2026. Will be the headline post-RFC-9000 transport feature. Apple, Alibaba, Tessares already using preceding drafts.
- **QUIC v2 (RFC 9369)** — published. Adoption is real but quiet; mainly used as a probe to detect ossification.
- **Reliable Stream Resets (RESET_STREAM_AT)** — draft-07, expires Dec 2025; expected RFC in 2026. Required by WebTransport's serialized handshake guarantees.
- **MASQUE family** — RFC 9298 (UDP-over-HTTP) and 9484 (IP-over-HTTP) shipped; Connect-UDP-Listen and bound proxying drafts live; deployed at scale by Apple Private Relay and Cloudflare.
- **WebTransport** — draft-ietf-webtrans-http3-15 (Mar 2026) is in WG Last Call; HTTP/2 fallback draft progressing.
- **HTTP Priority (RFC 9218)** — published 2022 but still rolling out in CDNs (replaces HTTP/2 dependency tree).
- **QUIC-LB / QUIC Load Balancers** — near publication 2025; tells you how to encode a server identifier in a Connection ID so a stateless LB can route migrated paths correctly.
- **ECH** — approved by TLS WG 2025; in RFC editor queue (RFC 9849 series). Already deployed by Cloudflare; censorship-resistance debates ongoing.
- **L4S over QUIC** — RFC 9330–9332 published 2023; Apple iOS 17+ runs QUIC over L4S in some markets.
- **Linux kernel QUIC** — Xin Long's series posted 22 Jul 2025; first 9k LoC; mainline merge expected sometime in 2026 best case. Will dramatically change the throughput picture for HTTP/3 servers.
- **Hot research directions**: kernel-bypass QUIC (DPDK + Cloudflare's quiche-on-XDP experiments); per-stream TLS rekeying; post-quantum hybrid key exchange in QUIC's TLS (X25519MLKEM768 in draft); HTTP/3 prioritization with reinforcement learning (multiple 2024–2025 ACM Networking papers); AI-bot share of HTTP/3 (low — bots cling to HTTP/1.1 and HTTP/2).

**Likely-deprecated / shrinking.**

- HTTP/2 server push — already gone from Chrome HTTP/2 in 2022; HTTP/3 PUSH_PROMISE is essentially dead-on-arrival.
- gQUIC versions Q0xx — Google moved everything to IETF QUIC by 2021; legacy ALPNs only matter for ancient clients.
- Alt-Svc as the *primary* discovery mechanism — being supplanted by HTTPS DNS records.

**What would change the picture dramatically.**

- Kernel-merged Linux QUIC (closes the 500-Mbps Mbps cliff).
- AWS CloudFront enabling HTTP/3 by default for all distributions (still off by default for many in 2026).
- MASQUE-based VPN-replacement adoption beyond Apple iCloud Private Relay.
- A second Rapid-Reset-class CVE that *does* affect HTTP/3 implementations (the protocol's per-stream isolation has held so far; the next class of bug will be QPACK-state or accounting-mismatch).

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook (for non-experts).**

> "In 2012, a Google engineer named Jim Roskind got tired of waiting. Tired of TCP — the protocol that's been carrying every web page you've ever loaded since 1981 — taking three round-trips to start a conversation. Tired of one lost packet stalling six other downloads. So he built something new. He called it QUIC, for Quick UDP Internet Connections, but the name stuck even after the acronym was officially abandoned. Today, when you open Instagram, watch YouTube on your phone, or stream a Premier League match, there's about a one-in-five chance you're not speaking the language of the web. You're speaking HTTP/3 — Roskind's experiment, ten years on, polished by the IETF and shipping in every browser. It runs on UDP. It encrypts every byte, including parts of its own header. It survives switching from Wi-Fi to cellular without missing a packet. And it's the first time since 1991 that the web's foundational protocol has actually been replaced. Here's the story of how that happened — and why, in 2026, HTTP/3 is winning, losing, and rewriting itself, all at once." [KeyCDN](https://www.keycdn.com/blog/quic)

**Striking statistic.**

> *On Google's network, an early version of QUIC reduced YouTube rebuffering events by 15–18% — and Google Search latency by 3.6–8% — for billions of users. Yet a decade later, on a 1 Gbps fiber connection, HTTP/3 is up to 45.2% slower than the protocol it was meant to replace. Both numbers are real. Both come from peer-reviewed papers. Both are about the same protocol.* (Sources: Langley et al., SIGCOMM 2017, doi:10.1145/3098822.3098842; Zhang et al., ACM WWW 2024, doi:10.1145/3589334.3645323.)

**Pause and think.**

> *The single most influential change in the last twenty years of HTTP wasn't HTTP/3. It was the decision, made in an IETF meeting room in 2016, that the new protocol would encrypt its own transport headers — denying middleboxes, ISPs, and governments the ability to passively observe almost anything about a connection except its existence. That single decision is why HTTP/3 has connection migration. It's why we have ECH. It's why Russia censors QUIC traffic to Cloudflare. And it's why Linux still doesn't have a kernel implementation, ten years on. Pause and ask: how many of today's "obvious" Internet realities — encrypted SNI, encrypted DNS, anti-fingerprinting browsers — would not exist if the QUIC working group had compromised on header visibility?*

**Failure-story arc: HTTP/2 Rapid Reset (CVE-2023-44487).**

> **Setup.** August 2023. The HTTP/2 protocol is twelve years old. It allows a single TCP connection to multiplex many concurrent requests, identified by *streams*, and lets either side cancel a stream instantly with a 13-byte RST_STREAM frame. Servers implement a `MAX_CONCURRENT_STREAMS` limit — 100 by default. But the limit only counts *open* streams, not streams that the server is still computing responses for after a cancellation.
> 
> **Mistake.** An attacker realizes that if you open a stream and immediately cancel it, the server is required by the protocol to allocate request-processing resources before tearing down. With ~100 streams in flight at any time and instant cancellations, the attacker can drive a server through *thousands* of fake requests per connection per second — at near-zero cost to themselves. Multiply by a botnet and you get the largest DDoS attacks ever recorded.
> 
> **Consequence.** On 10 October 2023, Google, Cloudflare, and Amazon Web Services jointly publish a coordinated disclosure. Google reports peak attack rates of **398 million requests per second** — eight times the previous Internet record. Cloudflare records 201 Mrps; AWS, 155 Mrps. CVSS 7.5. CVE-2023-44487. Affected: Apache, nginx, Netty, Go's `golang.org/x/net/http2`, NodeJS, IIS, Cisco, every major load balancer, almost every cloud. Many sites went down before the patches landed. CISA issues a binding directive.
> 
> **Resolution.** Within hours of disclosure, every major HTTP/2 implementation ships a patch: track *unanswered* RST_STREAM frames per connection, and either rate-limit them or terminate the connection on threshold. HAProxy turns out to have been immune since 2018 because of a 1.9-era design choice. HTTP/3 implementations are spared because QUIC tracks per-stream state in the transport layer, not the application — so canceling a stream actually frees the resources. The lesson lands. Until two years later, **MadeYouReset** (CVE-2025-8671) reveals the same accounting mistake on the *server*-initiated RST path. The pattern repeats, with smaller blast radius, but the same root cause: stream-state in the protocol decoupled from stream-state in the backend.

The arc tells itself: a 13-byte frame, a 12-year-old protocol, a billion-dollar industry caught flat-footed, and a coordinated nine-vendor disclosure that made infrastructure history.

---

## Caveats

- **Numbers are fragile.** Cloudflare Radar, W3Techs, and HTTP Archive measure different things on different populations and disagree by 10+ percentage points on HTTP/3 share. The ~21% Q1 2026 figure is corroborated by TechnologyChecker.io's reading of 30 days of Cloudflare Radar but I have not been able to cross-check on Cloudflare Radar directly; treat ranges, not point estimates.
- **The "QUIC slower than HTTP/2 over fast Internet" claim is real but has caveats.** Zhang et al.'s 45.2% figure is for synthetic bulk transfers on Linux Chrome with default kernel settings. Tuning UDP buffers and turning on UDP GSO/GRO closes most of the gap. Wider deployment of these mitigations (and an in-kernel Linux QUIC) will likely change the share story by 2027.
- **MadeYouReset is principally an HTTP/2 issue.** Several vendors note "HTTP/3 implementations are not currently believed to be affected" — but this is a function of how QUIC accounts for stream state, not a guarantee. Do not assume HTTP/3 is immune to the *class* of accounting-mismatch DoS.
- **WebSocket-over-HTTP/3 is specified (RFC 9220) but barely deployed** as of early 2026 — websocket.org's tracker calls Chrome's status "Intent to Prototype" and notes no production browser implementation. If a podcast guest claims their app uses it, push back.
- **Some implementation timelines (e.g., LiteSpeed's "first to ship HTTP/3 default-on" date 7 June 2021)** come from Wikipedia and vendor blogs; verify against changelogs before publishing.
- **Linux kernel QUIC** is still pre-merge as of May 2026. A "Linux now has QUIC" headline would be premature.
- **The MadeYouReset attribution** to Tel Aviv University and Imperva is well-sourced (CERT VU`#767506`, The Hacker News, Wiz), but specific vendor patch dates (Fastly H2O 25.17 on 2 June 2025, Varnish 7.6.5/7.7.3) come from vendor advisories — confirm against vendor security pages before broadcasting.
- **One source flagged for caution.** TechnologyChecker.io (cited for Q1 2026 protocol share) reads as a marketing tracker; its analysis is plausible and matches the directional Cloudflare Radar data, but it is not the same as a Cloudflare Radar primary citation. Where possible, cite Cloudflare Radar's Year-in-Review pages directly.
- **Older sources verified or flagged.** Langley et al. SIGCOMM 2017 numbers describe gQUIC, not IETF QUIC; the 7%-of-Internet share was 2017, not now. RFC 7540 (HTTP/2) is obsolete since June 2022 — cite RFC 9113 instead. RFC 7230–7235 are obsolete — cite RFC 9110–9112. Stenberg's *HTTP/3 Explained* started in 2018 and has continuous updates; treat it as living, not historical.
- **Speculation flagged.** "HTTP/3 share will rebound after Linux-kernel QUIC ships" is a forward-looking claim; it depends on hardware deployment timelines and is not yet observable.