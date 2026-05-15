---
id: http3
type: protocol
name: HyperText Transfer Protocol 3
abbreviation: HTTP/3
etymology: "[H]yper[T]ext [T]ransfer [P]rotocol — the same name as 1.1 and 2; the /3 marks a new wire encoding on top of QUIC, not new semantics"
category: web-api
year: 2022
rfc: RFC 9114
standards_body: IETF
podcast_target_minutes: 22
related_book_chapters:
  - foundations/packets
  - foundations/ports-sockets
  - story-of-the-internet/the-web-arrives
  - story-of-the-internet/the-quic-redesign
  - story-of-the-internet/the-ai-agent-layer
  - transport/udp
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - web-api/http1
  - web-api/http2
  - web-api/http3
  - web-api/grpc
  - web-api/websockets-and-sse
  - web-api/mcp-and-a2a
  - utilities-security/dns
  - utilities-security/ssh
  - patterns-failures/failure-modes
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/books
  - how-to-learn-more/blogs
related_protocols: [http2, quic, tls, udp, rest, tcp, wifi, ip, websockets, http1, dns]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9110, 9460]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Googleplex-Patio-Aug-2014.JPG/500px-Googleplex-Patio-Aug-2014.JPG"
    caption: "The Googleplex in Mountain View, where Jim Roskind drafted QUIC in 2012 and Adam Langley, Jana Iyengar, Ian Swett, and Ryan Hamilton drove the iteration that became HTTP/3."
    credit: "Photo: The Pancake of Heaven! / CC BY-SA 4.0, via Wikimedia Commons"
visual_cues:
  - "A four-layer stack: HTTP semantics (RFC 9110) on top, then HTTP/3 framing plus QPACK (RFC 9114, RFC 9204), then QUIC streams plus QUIC-TLS plus loss/cc (RFC 9000/9001/9002), then UDP on port 443. Caption: 'The same HTTP, on a new transport.'"
  - "A side-by-side handshake comparison: TCP+TLS 1.3 stretching across two-to-three round trips, versus QUIC folding transport and TLS into a single 1-RTT exchange — and a 0-RTT resumption arrow that reaches the server with application data on the very first flight."
  - "The head-of-line-blocking contrast: a single dropped packet on an HTTP/2-over-TCP connection stalls every coloured stream behind it; the same dropped packet on HTTP/3-over-QUIC stalls only the stream it carried."
  - "A phone walking out of a coffee shop. On the left, the Wi-Fi 4-tuple connection breaks; on the right, the QUIC Connection ID survives the handoff to cellular and the video call keeps playing."
  - "The 21% plateau chart: Cloudflare-observed protocol share over 30 days ending April 2026 — HTTP/2 51%, HTTP/1.x 28%, HTTP/3 21% — annotated with the 2024 Zhang et al. paper showing the 500 Mbps inflection where HTTP/3 starts losing to HTTP/2."
  - "An attack-versus-defence cartoon: HTTP/2 Rapid Reset (CVE-2023-44487) sending 398 million RST_STREAMs per second at Google in August 2023, with QUIC's per-stream transport accounting drawn alongside as the structural reason HTTP/3 stacks were spared."
---

# HTTP/3 — HyperText Transfer Protocol 3

## In one breath

HTTP/3 is the third major version of HTTP, defined as a binary mapping of HTTP semantics onto QUIC — a UDP-based, TLS 1.3-native, multiplexed transport. The verbs, status codes, headers, and caching semantics are unchanged from HTTP/1.1; only the wire encoding moves from text framing to binary frames to QUIC streams. Connections set up in one round trip instead of two or three, a single lost packet only stalls the stream that owned it, and a phone moving from Wi-Fi to cellular keeps its session alive via Connection IDs. By Q1 2026 it carries roughly twenty-one percent of Cloudflare-observed web requests, and most of the running-software-on-the-internet decisions you make in 2026 — from CDN choice to firewall rules — touch it.

## The pitch (cold-open)

In October 2012, a Chrome engineer named Jim Roskind committed the first lines of code for "Quick UDP Internet Connections" — QUIC — and tunnelled a brand-new transport inside UDP to escape the middlebox ossification that was killing TCP innovation. Ten years and ten RFCs later, in June 2022, the IETF published RFC 9114 and HTTP/3 became real. Today, when you open Instagram, watch YouTube on your phone, or stream a Premier League match, there is about a one-in-five chance you are not speaking the language of the web — you are speaking HTTP/3. It runs on UDP. It encrypts every byte, including parts of its own header. It survives Wi-Fi-to-cellular handoff without dropping a packet. And as of 2026 it is, depending on which paper you read, both winning the future and losing on a 1 Gbps fibre line. We unpack both.

## How it actually works

HTTP/3 sits at the application layer. Below it sit HTTP/3's own binary frames and QPACK header compression. Below that sit QUIC streams and datagrams. Below that sit QUIC's TLS 1.3 integration and its loss-detection and congestion-control logic. Below that sits UDP on port 443. Switching an API from HTTP/2 to HTTP/3 is mostly a deployment change — the layer above QUIC is the same HTTP semantics defined by RFC 9110 that HTTP/1.1 and HTTP/2 also implement.

The first thing on the wire is a QUIC Initial packet from the client. It is a long-header packet, at least 1200 bytes of UDP payload, carrying a TLS ClientHello inside a CRYPTO frame. The ClientHello includes the ALPN identifier "h3" and a TLS 1.3 key share. The 1200-byte minimum is mandatory: QUIC enforces a three-to-one amplification cap on un-validated paths, so a server may never send back more than three times the bytes it received until it has validated the client address. Without the minimum, an attacker spoofing a victim's IP could turn a tiny Initial into a multi-kilobyte ServerHello aimed at the victim.

The server replies with its own Initial plus a Handshake packet — ServerHello, encrypted extensions, certificate, Finished — all in CRYPTO frames. After this single round trip, both sides have 1-RTT keys derived by HKDF from the TLS handshake secrets. The client sends its TLS Finished plus the first HTTP/3 request inside short-header 1-RTT packets. Address validation completes; the server sends HANDSHAKE_DONE plus its first response. Returning clients can skip the first round trip entirely and send 0-RTT data with their very first flight, using a TLS 1.3 PSK from the previous session — but RFC 9001 warns that 0-RTT is replayable, so it is only safe for idempotent requests.

Each HTTP request maps to a single QUIC bidirectional stream. The client opens stream 0 for its first request, stream 4 for the second, stream 8 for the third — client-initiated bidirectional streams use IDs whose low two bits are zero. Inside the stream, the client sends a HEADERS frame containing a QPACK-compressed field section, then optionally DATA frames carrying a request body. The server's response comes back in HEADERS plus DATA on the same stream. The connection itself runs forever, multiplexing as many streams as the SETTINGS frames allow.

If a UDP packet carrying part of stream 4 is lost, only stream 4 stalls. Streams 0 and 8 keep delivering. This is the entire reason HTTP/3 exists — HTTP/2 over TCP could not do this because TCP is a single in-order byte stream, so any lost segment stalled every multiplexed stream above it.

If the client's IP address changes — typically a phone moving from Wi-Fi to cellular — the QUIC connection survives. Each peer issues one or more 0-to-20-byte Connection IDs in NEW_CONNECTION_ID frames; the server identifies the connection by its DCID, not by the four-tuple. The new path gets validated with PATH_CHALLENGE and PATH_RESPONSE, and the session continues. A video call does not stutter on the handoff. The Story of the Internet chapter "The QUIC Redesign" tells the longer arc of why this design choice — UDP, encrypted transport headers, user-space implementation — was the only way to ship a new transport on the deployed internet; we will not retell it here.

### Header at a glance

QUIC has two header forms. The long header is used during the handshake and version negotiation. Bit 0 is set to one. Bits 2 and 3 give the packet type — Initial, 0-RTT, Handshake, or Retry. Bit 1 is the fixed bit; a zero there is a v2-only "grease" signal. Then come a 32-bit version number, a one-byte Destination Connection ID length followed by the DCID itself (zero to twenty bytes), the same for the SCID, and a type-specific payload.

The short header is used for 1-RTT data and dominates a long-running connection. Bit 0 is zero. Bit 2 is the spin bit — a single bit endpoints toggle once per RTT so on-path observers can passively measure round-trip time without seeing anything else. Bit 5 is the key phase, which flips on key updates. Bits 6 and 7 give the packet-number length. Then come the DCID and the (header-protected) packet number.

Header protection (RFC 9001, section 5.4) XORs the first byte's low bits and the packet number with a mask derived from the encrypted payload, so observers cannot easily read packet numbers or correlate streams across paths. Most of the QUIC packet, including its packet-number, is opaque on the wire — and that is deliberate.

Inside the AEAD-protected payload sit typed QUIC frames: PADDING, PING, ACK, RESET_STREAM, STOP_SENDING, CRYPTO, NEW_TOKEN, STREAM (with low-three-bit OFF/LEN/FIN flags), MAX_DATA, MAX_STREAM_DATA, MAX_STREAMS, the various BLOCKED frames, NEW_CONNECTION_ID, RETIRE_CONNECTION_ID, PATH_CHALLENGE, PATH_RESPONSE, CONNECTION_CLOSE, HANDSHAKE_DONE, and the DATAGRAM frame from RFC 9221. Stream IDs and most lengths are encoded as variable-length integers — the upper two bits of the first byte give the length (1, 2, 4, or 8 bytes), the rest gives the value.

Inside a QUIC stream, HTTP/3 has its own seven frame types: 0x00 DATA, 0x01 HEADERS, 0x03 CANCEL_PUSH, 0x04 SETTINGS, 0x05 PUSH_PROMISE (deprecated in practice), 0x07 GOAWAY, 0x0d MAX_PUSH_ID. Plus reserved "greased" frame types of the form 0x21 plus 0x1f times N, which implementations must ignore — anti-ossification baked into the spec.

QUIC stream IDs are 62-bit varints. The two low bits decide direction and initiator. HTTP/3 request streams are client-initiated bidirectional (00). Unidirectional streams carry a stream-type prefix: 0x00 control, 0x01 server push, 0x02 QPACK encoder, 0x03 QPACK decoder. Closing the control stream is fatal — the error code is H3_CLOSED_CRITICAL_STREAM.

### State machine in three sentences

Each HTTP/3 request lives on its own QUIC bidirectional stream and walks a tiny state machine: the client opens the stream, sends HEADERS and optional DATA, half-closes by setting FIN; the server replies with HEADERS plus DATA and FIN; either side can RESET_STREAM with an error code at any time. Underneath, the QUIC connection itself has a single SETTINGS exchange on each side's control stream at start-up, exchanges NEW_CONNECTION_ID frames as needed for migration, and ends with GOAWAY plus CONNECTION_CLOSE. The connection-level state — handshake-in-progress, address-validated, 1-RTT keys installed, draining, closed — is QUIC's, not HTTP/3's; HTTP/3 is just the framing on top.

### Reliability, flow, and security mechanics

Reliability is per-stream. QUIC tracks ACKs at the packet level, but the application-visible effect is that bytes arrive in order on each stream and missing bytes on stream 4 do not block stream 8. Loss detection follows RFC 9002 — a NewReno-equivalent baseline. Most production deployments swap in CUBIC or BBRv1/v2/v3; user-space implementation is QUIC's superpower here, since the congestion controller can be hot-swapped without touching the kernel.

Flow control is two-tiered. Per-stream limits use MAX_STREAM_DATA frames; per-connection limits use MAX_DATA. Independent budgets stop a single fat stream from starving the rest of the connection.

Encryption is mandatory and integrated. There is no unencrypted HTTP/3. QUIC fuses TLS 1.3 (RFC 8446) into the transport — handshake messages travel in CRYPTO frames inside Initial and Handshake packets, and AEAD keys (AES-GCM or ChaCha20-Poly1305) are derived by HKDF from TLS handshake and application secrets. Every QUIC packet is authenticated and encrypted, including parts of its own header.

QPACK is the header-compression story. It splits HPACK's single table model into two unidirectional streams plus two tables — a 99-entry static table and a per-connection dynamic table. The encoder sends insertions on the encoder stream and indexed references in the HEADERS frame; the decoder acks insertions on the decoder stream. Because QUIC streams are independent, the encoder must avoid referencing entries the decoder has not yet acked, or accept that referencing streams will block. SETTINGS_QPACK_BLOCKED_STREAMS bounds how many streams can do so. QPACK trades a tiny compression ratio versus HPACK for the property that headers cannot deadlock under packet reordering. RFC 9204, section 1.1, notes that QPACK is also "a name, not an acronym."

The known SETTINGS identifiers are SETTINGS_QPACK_MAX_TABLE_CAPACITY (0x01), SETTINGS_MAX_FIELD_SECTION_SIZE (0x06), SETTINGS_QPACK_BLOCKED_STREAMS (0x07), SETTINGS_ENABLE_CONNECT_PROTOCOL (0x08, for Extended CONNECT and WebTransport), and SETTINGS_H3_DATAGRAM (0x33, for RFC 9297 datagrams). Plus greased identifiers, which must be ignored.

Error codes start at 0x100 — H3_NO_ERROR — and run through H3_VERSION_FALLBACK at 0x110, with QPACK errors at 0x200-0x202 and H3_DATAGRAM_ERROR at 0x33 (RFC 9297). The most operationally common are H3_EXCESSIVE_LOAD (0x107) and H3_REQUEST_CANCELLED (0x10c).

## Where it shows up in production

**Cloudflare** turned on HTTP/3 edge support in September 2019 and now serves it for every site behind the network by default. Roughly thirty percent of HTTPS bytes Cloudflare serves negotiate HTTP/3. Cloudflare also maintains quiche — the Rust QUIC library that powers its edge — as open source, and integrates it into its quiche-patched nginx fork.

**Google** runs HTTP/3 on chrome.com, youtube.com, and most of its web properties. The deployment that drove standardisation was gQUIC, which by SIGCOMM 2017 carried about thirty percent of Google's egress and roughly seven percent of all Internet traffic, with measured 3.6-to-8 percent Search latency reductions and 15-to-18 percent YouTube rebuffering reductions. Today Google's google-quiche stack runs in Chrome and on Google Front End.

**Meta** moves the majority of bytes from Facebook, Instagram, and WhatsApp over HTTP/3. Meta's mvfst stack — open-source C++ — carries more than 75 percent of Meta's internet traffic and produces, per Robin Marx's 2020 ANRW paper, about 30 billion qlog events daily. The structured-logging volume is the largest production QUIC observability deployment by event count.

**Apple** ships HTTP/3 across iCloud, the App Store, and Private Relay (which runs on MASQUE-class CONNECT-UDP and CONNECT-IP from RFCs 9298 and 9484). Safari 14 had experimental HTTP/3 in September 2020; Safari 16 turned it on by default for everyone in September 2024. Apple Network.framework offers native QUIC since iOS 18.

**Microsoft** built msquic into Windows Server 2022, Windows 11, IIS, and .NET 8+. The same library is used by SMB-over-QUIC and by .NET's HttpClient.

**Amazon CloudFront** has served HTTP/3 since 2022 and uses s2n-quic (Rust) for the edge. AWS, Cloudflare, and Google jointly co-disclosed Rapid Reset on 10 October 2023, with peak attack rates of 155 million, 201 million, and 398 million requests per second respectively.

**Browsers**: Chrome enabled HTTP/3 by default in April 2020. Edge followed the same year. Firefox enabled it in May 2021. Safari, as above, in September 2024.

**Servers and proxies**: nginx tech-previewed HTTP/3 in June 2020 and merged the QUIC stack into mainline 1.25.0 on 23 May 2023, with stable status arriving over the 1.25.x and 1.27.x line. Caddy 2.6 (September 2022) shipped HTTP/3 default-on, using quic-go. LiteSpeed/OpenLiteSpeed got there first, in June 2021. HAProxy added experimental HTTP/3 in 2.6 (May 2022) and stabilised through 2.8 LTS once OpenSSL's QUIC API settled. Envoy and Istio reached GA HTTP/3 in 2023 with a quiche backend. Apache httpd has no production HTTP/3 module as of May 2026.

**Clients**: curl with `--http3` works reliably when built against ngtcp2; the OpenSSL QUIC backend that Stenberg measured in 2024 was four times slower and used twenty-five times more memory. Debian 13/trixie became the first major distribution to ship HTTP/3 in the default `curl` binary in October 2025 by switching to the OpenSSL 3.3+ backend.

The HTTP/3-capable QUIC stacks worth knowing: quiche (Cloudflare, Rust), msquic (Microsoft, C), quic-go (community/Marten Seemann, Go — used by Caddy, Traefik, Syncthing), ngtcp2 plus nghttp3 (Tatsuhiro Tsujikawa, C — curl's preferred backend), lsquic (LiteSpeed, C), aioquic (Jeremy Lainé, Python — reference plus research), picoquic (Christian Huitema, C — research and IETF interop), mvfst (Meta, C++), s2n-quic (AWS, Rust), google-quiche (Google, C++), and the OpenSSL QUIC stack from 3.2+.

## Things that go wrong

**HTTP/2 Rapid Reset — CVE-2023-44487 (10 October 2023).** In August 2023, attackers hit Google with 398 million requests per second, Cloudflare with 201 million, and AWS with 155 million — peak L7 records by an order of magnitude. The technique exploited HTTP/2's RST_STREAM: a client could open a stream and immediately reset it, the server would still allocate request-processing resources before tearing down, and per-connection stream-cancellation was effectively unbounded. Within hours of the coordinated 10 October disclosure, every major HTTP/2 implementation patched — track unanswered RST_STREAM frames per connection, rate-limit them, terminate on threshold. CISA issued a binding directive. **HTTP/3 implementations were spared** because QUIC's transport-layer per-stream accounting actually frees the resources when a stream is reset; several vendors still proactively patched analogous bugs in their HTTP/3 stacks. The Web/API chapter "HTTP/2" tells the longer story of this attack arc and its sequel; we keep the HTTP/3-relevant bit here.

**MadeYouReset — CVE-2025-8671 (13 August 2025).** Discovered by Gal Bar Nahum, Anat Bremler-Barr, and Yaniv Harel at Tel Aviv University and Imperva. Where Rapid Reset abused client-sent RST_STREAM, MadeYouReset induces the server to send RST_STREAM by sending malformed WINDOW_UPDATE, PRIORITY, or other frames on half-closed streams. Servers then mark the stream closed for accounting while the backend keeps processing — bypassing the post-Rapid-Reset MAX_CONCURRENT_STREAMS guard. Per-vendor IDs include Apache Tomcat CVE-2025-48989, F5 BIG-IP CVE-2025-54500, and Netty CVE-2025-55163. Fastly fixed in H2O 25.17 by 2 June 2025. Again HTTP/3 stacks were not directly affected — but the IETF HTTP-WG explicitly clarified that "this is not a protocol vulnerability." Any implementation, in any HTTP version, that decouples stream-state accounting from backend completion is at risk.

**Hash-collision DoS in QUIC implementations (NCC Group, 2025).** Pierre Bottine and team found hash-table-collision DoS in xquic (Alibaba) in late 2024; subsequent review identified CVE-2025-23020 in kwik, CVE-2025-24947 in lsquic (fixed 4.2.0), and bugs in picoquic, the ngtcp2 example server, and Ericsson Rask MP-QUIC. Cause: predictable-seeded hash tables for connection-ID lookup. Fix: seed the table with a per-process random key and rate-limit the create path.

**Microsoft msquic CVE-2024-26190 (March 2024).** Memory-allocation amplification in the Windows .NET 7/8 stack — a peer could induce small repeated allocations that persisted for the connection lifetime. Patched in .NET 7.0.17 and .NET 8.0.3.

**The nginx HTTP/3 cluster (April-May 2024).** CVE-2024-24989 and -24990 (worker-process segfaults on crafted QUIC), CVE-2024-31079, CVE-2024-32760 (worker memory disclosure where MTU exceeded 4096), CVE-2024-34161, and CVE-2024-35200 (NULL-pointer DoS in the HTTP/3 module). All disclosed by CISPA's Nils Bars and patched across nginx 1.25.4 through 1.27.0.

**Operational, not CVE — UDP filtering and stateful-firewall handoff.** University and corporate networks routinely block or rate-limit UDP/443; users see endless TCP fallback. Cloudflare community threads regularly ask Cloudflare to disable HTTP/3 per-zone for this reason. Stateful firewalls that track 4-tuple flows break QUIC connection migration; the QUIC-LB draft (draft-ietf-quic-load-balancers, near publication 2025) addresses load-balancer-side stateless routing by encoding server identity in the Connection ID.

**Amplification and Retry abuse (RFC 9000, section 8).** Without enforcement of the 3-to-1 byte limit and Retry tokens, an attacker spoofing a victim's IP could turn a tiny Initial packet into a multi-kilobyte ServerHello aimed at the victim. Nawrocki et al.'s "QUICsand" paper at ACM IMC 2021 measured live amplification scans hitting deployed QUIC servers. Retry-token handshake flooding remains a real attack surface; the December 2024 QFAM proposal adds a cryptographic puzzle to the Retry packet.

**Ossification creeping back.** RFC 9369 explicitly notes middleboxes already keying off QUIC v1's Initial-packet salt. The QUIC v2 wire-image version number is 0x6b3343cf — the first four bytes of `sha256("QUICv2 version number")` — chosen specifically to exercise version negotiation and break middleboxes that ossified on v1. The chapter on Failure Modes covers the broader bestiary; ossification is one case where HTTP/3 is both the cure and, increasingly, the patient.

## Common pitfalls (for the practitioner)

- **Alt-Svc bootstrap still pays the TCP+TLS round trip.** A new client does not know to try HTTP/3 until it sees an `Alt-Svc: h3=":443"; ma=86400` header in an HTTP/1.1 or HTTP/2 response. The first connection still costs the TCP+TLS handshake. The HTTPS DNS RR (RFC 9460, November 2023) closes the gap by carrying `alpn=h3` and ECH config in DNS itself, but adoption is partial. Web Almanac 2024 found that 99 percent of HTTP/3 page loads it observed were triggered by HTTPS DNS records.
- **CDN coverage is much better than origin coverage.** Cloudflare, Fastly, and Akamai serve HTTP/3 universally; origin servers running older nginx, Apache, or IIS often do not. If your site sits behind a CDN, you have HTTP/3 for free. If you serve directly from origin, you need a recent nginx, Caddy, or H2O build.
- **Forgetting to open UDP/443 on the firewall.** The single most common cause of "HTTP/3 doesn't work" on user-managed servers.
- **Returning Alt-Svc but not actually listening on UDP/443.** Clients then race the TCP fallback against a UDP timeout and see slow page loads.
- **Mismatched ALPN identifiers.** A server still advertising "h3-29" while the client wants "h3" — a holdover from interop drafts that should be cleaned up.
- **Truncated HTTPS DNS records.** Some authoritative DNS servers strip RR types they do not understand. The DNS chapter covers this in more depth; the symptom for HTTP/3 is that the first connection always falls back.
- **Allowing 0-RTT for POST endpoints.** RFC 9001, section 9.2: 0-RTT data is replayable for the entire ticket lifetime. Use the `Early-Data: 1` header (RFC 8470) and reject non-idempotent methods server-side or behind a CDN.
- **Not bumping `net.core.rmem_max` and `wmem_max`.** Linux defaults around 208 KiB; raising these to roughly 26 MiB on high-bandwidth-delay-product servers closes most of the kernel-side throughput gap. Without this, the kernel drops UDP under load and HTTP/3 looks "broken under congestion."
- **Leaving UDP segmentation offload off.** Enabling UDP_SEGMENT (Linux 4.18+) closes most of the HTTP/2-versus-HTTP/3 throughput gap from the 2024 ACM paper.

## Debugging it

- **curl with `--http3` and `--http3-only`.** Reliable when curl is built with ngtcp2; experimental and slow with the OpenSSL QUIC backend. `curl -sI https://cloudflare-quic.com | grep -i alt-svc` checks if a server advertises HTTP/3 via Alt-Svc.
- **Wireshark 4.0+** dissects HTTP/3 inline, but you need the QUIC session secrets. Set `SSLKEYLOGFILE`; OpenSSL 3.2+ and BoringSSL since 2022 write the keys.
- **qlog plus qvis** (https://qvis.quictools.info/, last meaningful UI update 2024). Log structured qlog (JSON or qlog-binary) and feed it to qvis — the sequence-diagram and congestion-control panels are uniquely good. Meta showed at scale that qlog volumes are tractable.
- **pcap2qlog** (github.com/quiclog/pcap2qlog) converts a Wireshark capture into qlog when you cannot instrument the endpoints.
- **h2load** from the nghttp2 suite — HTTP/3 benchmarking via ngtcp2 since v1.45 (2022).
- **nghttp and nghttpx** — lightweight HTTP/3 client and proxy.
- **Sysctls that matter**: `net.core.rmem_max`, `net.core.wmem_max`, `net.core.netdev_max_backlog`, and the UDP_SEGMENT segmentation offload toggle. Raising the receive buffer and enabling GSO/GRO is the single biggest production win.
- **Tuning knobs in the QUIC stack**: `idle_timeout` (default 30 s — drop in load-balanced fleets to reclaim memory), `initial_max_data` (12 MB in msquic, 1 MB in nginx — bulk transfers want >10 MB), `initial_max_stream_data_bidi_local`, `initial_max_streams_bidi` (default 100 — API gateways with bursty fan-out want more), and the choice of NewReno vs CUBIC vs BBRv2/v3.

## What's changing in 2026

- **March 2026 — Multipath QUIC draft -21.** `draft-ietf-quic-multipath` entered IESG Last Call in December 2025 at draft -17/-18; the latest is -21 dated 17 March 2026. Inherits MPTCP's algorithmic ideas (subflows, coupled congestion control, packet scheduling) inside a transport that actually traverses middleboxes. Apple, Alibaba, and Tessares already deployed predecessor drafts. RFC publication is likely in the first half of 2026.
- **March 2026 — WebTransport over HTTP/3 draft -15.** `draft-ietf-webtrans-http3` is in WG Last Call. Bidirectional and unidirectional QUIC streams plus datagrams piggy-backed on a single HTTP/3 CONNECT extended request. Chrome and Edge ship implementations; ASP.NET Core Kestrel has experimental support. The HTTP/2 fallback draft is progressing in parallel.
- **2025-07-30 — Encrypted Client Hello allocated.** ECH was approved by the TLS WG in 2025 and entered the RFC editor queue (RFC 9849-track), with the IANA registry allocated 30 July 2025. Cloudflare turned ECH on for roughly seventy percent of its zones; Russia began censoring ECH connections; major browsers ship ECH gated by HTTPS DNS records (RFC 9460).
- **22 July 2025 — Linux kernel QUIC patch series.** Xin Long posted the first ~9,000-line in-kernel QUIC patch series, covered by LWN. The design uses `IPPROTO_QUIC` (mirroring `IPPROTO_MPTCP`), with the TLS handshake delegated to userspace via `tlshd`. Mainline merge is expected in 2026 at earliest. When it ships, the throughput gap with kernel TCP closes — and the HTTP/3 share story may rebound.
- **June 2025 — Reliable Stream Resets draft -07.** `draft-ietf-quic-reliable-stream-reset` (M. Seemann and K. Oku) defines `RESET_STREAM_AT` so a sender can reset a stream while guaranteeing delivery up to a byte offset — wanted by WebTransport for reliable initial bytes. Expected RFC in 2026.
- **2024-Q4 — nginx 1.25 HTTP/3 stable.** After years of plug-in modules, mainline nginx finally shipped HTTP/3 as a stable feature. Cloud-init images and Docker base images followed within months.
- **2024 — WebTransport API ships in Chrome stable.** The JavaScript API on top of HTTP/3 datagrams and streams reached Chrome stable; replaces WebSocket for some low-latency client-server use cases.
- **2024 — Zhang et al. "QUIC is not Quick Enough over Fast Internet"** (ACM Web Conference, doi:10.1145/3589334.3645323). Up to 45.2 percent throughput loss versus HTTP/2 above roughly 500 Mbps on Chrome with default Linux kernel settings. Cause: receiver-side userspace ACK and copy overhead, missing UDP GRO/GSO. The single most important paper for understanding why HTTP/3 share has plateaued. Most of the gap closes if you enable UDP segmentation offload and raise socket buffers.
- **The 21% plateau.** Cloudflare-observed HTTP/3 share peaked around 28 percent in May 2023 and has since drifted down to roughly 21 percent in Q1 2026. HTTP/2 dominates at about 51 percent; HTTP/1.x persists near 28 percent. Methodology debates are real — HTTP Archive's 2024 Web Almanac reports about 30 percent of capable sites loading over HTTP/3 in their crawl. Treat ranges, not point estimates.
- **Quiet but published — QUIC v2 (RFC 9369, May 2023).** A Standards-Track template for new QUIC versions; the wire-image version number is 0x6b3343cf — the first four bytes of `sha256("QUICv2 version number")`. It exists almost solely to exercise version negotiation and break middleboxes that ossified on QUIC v1's Initial-packet salt.
- **HTTP Datagrams (RFC 9297, August 2022)** plus **MASQUE (RFC 9298, August 2022; RFC 9484, October 2023)** are the platform layer for Apple iCloud Private Relay, Google IP Protection, and Cloudflare WARP-related services. CONNECT-UDP and CONNECT-IP are now production technologies.

## Fun facts (host material)

- **The same semantics as HTTP/1.1 from 1997.** A GET request in HTTP/3 means exactly what it meant in HTTP/1.1 — same verbs, same status codes, same headers, same content negotiation, same caching semantics. Only the wire encoding changed: text framing in 1.1, binary frames in 2, QUIC streams in 3. RFC 9110 (HTTP Semantics) explains all three at once.
- **"QUIC" is officially not an acronym.** Roskind's 2012 internal Google doc called it "Quick UDP Internet Connections," but RFC 9000, section 1.2, drops the expansion: "QUIC is a name, not an acronym." The IETF made this normative because the working group could not agree the protocol was actually "quick" in all conditions. RFC 9204 plays the same trick for QPACK.
- **No more head-of-line blocking — the entire reason HTTP/3 exists.** In HTTP/2 over TCP, a single dropped packet stalls every stream on the connection. In HTTP/3 over QUIC, only the stream that owned the lost data stalls, because QUIC streams are independent at the transport layer. That is the whole point.
- **The naming rename.** Mark Nottingham's 28 October 2018 mailing-list message "Why HTTP/3?" got the protocol its number; the IETF approved within 72 hours. Daniel Stenberg blogged the change the same week and updated *HTTP/3 Explained* before nginx had even shipped a draft.
- **Server Push is dead on arrival.** RFC 9114 still defines PUSH_PROMISE (frame 0x05) and MAX_PUSH_ID (0x0d), but Cloudflare announced they would not implement it, Chrome removed HTTP/2 push in 2022, and the functional successor is the 103 Early Hints informational status with `Link: rel=preload`.
- **The spin bit fight.** A single bit consumed hundreds of mailing-list posts and multiple IETF interim meetings. It exists, on by default, only so network operators can passively measure RTT — the single observable QUIC offers them in exchange for the encrypted transport headers.
- **The RFC 9114 cluster of June 2022 was a quiet RFC big-bang.** It obsoleted RFC 7230-7235, RFC 7540 (HTTP/2), RFC 7234 (caching), RFC 2818 ("HTTPS"), and several smaller standards, replacing twenty years of HTTP specs with a clean five-document set. *The Register* called it "the day TCP stopped being assumed."
- **Meta logs about thirty billion qlog events daily** in production via mvfst — the largest single deployment of structured QUIC logging by event count, per Robin Marx's 2020 ANRW paper. The volumes are enormous; Meta showed they are tractable.

## Where this connects in the book

- **Part Foundations — Chapter "Packets & Encapsulation"** — frames inside packets inside segments; HTTP/3 sits at the top of that stack but pushes most of its work into the QUIC layer below.
- **Part Foundations — Chapter "Ports & Sockets"** — how UDP/443 demuxes to the HTTP/3 listener, and why "open UDP/443" is the firewall change every HTTP/3 deployment forgets.
- **Part Story of the Internet — Chapter "The Web Is Built On Top"** — Berners-Lee's 1989 memo, the 1993 CERN release, and why HTTP succeeded for the same reason TCP/IP did. HTTP/3 is the latest move within that frame.
- **Part Story of the Internet — Chapter "The QUIC Redesign"** — the longer story of why a new transport in 2012, why UDP and not a new protocol number, and why encrypted transport headers are what keep a protocol evolvable.
- **Part Story of the Internet — Chapter "The AI Agent Layer (2024–)"** — MCP and A2A run over HTTP/3 when available; the new application layer rides the new transport.
- **Part Transport — Chapter "UDP"** — the substrate. Almost all UDP growth in the last five years has been QUIC.
- **Part Transport — Chapter "SCTP"** — the better TCP that lost the deployment war; the canonical justification for QUIC's choice to tunnel inside UDP.
- **Part Transport — Chapter "MPTCP"** — Wi-Fi plus cellular at the same time, transparently. Multipath QUIC is the succession.
- **Part Transport — Chapter "QUIC"** — the deepest dive on the transport HTTP/3 rides on; user-space, on UDP, with TLS folded in.
- **Part Web/API — Chapter "HTTP/1.1"** — the text protocol still at 28 percent of traffic, and why.
- **Part Web/API — Chapter "HTTP/2"** — the binary-framing predecessor and the security saga (Rapid Reset, CONTINUATION Flood, MadeYouReset) that has not stopped.
- **Part Web/API — Chapter "HTTP/3"** — the chapter-length narrative: same HTTP, new transport; the plateau is real but so is the agenda.
- **Part Web/API — Chapter "gRPC"** — typed RPC over HTTP/2; native HTTP/3 support is in active 2024-2026 working-group work.
- **Part Web/API — Chapter "WebSockets and SSE"** — the older server-push pair; WebTransport over HTTP/3 is the longer-term replacement, but neither WebSocket nor SSE will leave the field before 2027-2028.
- **Part Web/API — Chapter "MCP and A2A"** — the agent layer; both protocols use HTTP/3 when available.
- **Part Utilities & Security — Chapter "DNS"** — the HTTPS DNS RR (RFC 9460) is what lets a browser try HTTP/3 on the very first connection without an HTTP/2 round trip.
- **Part Utilities & Security — Chapter "SSH"** — adjacent because of `draft-michel-ssh3`, an experimental SSH-over-HTTP/3 reimplementation; not production but instructive.
- **Part Patterns and Failures — Chapter "Failure Modes"** — bufferbloat, ossification, head-of-line blocking, MTU black holes — HTTP/3 is partly built to fix two of these and partly subject to the rest.
- **Part How to Learn More — Chapter "RFCs Worth Reading"** — RFC 9000 and RFC 9110 both make the canonical list.
- **Part How to Learn More — Chapter "Books"** — Daniel Stenberg's *HTTP/3 Explained* and Ilya Grigorik's *High Performance Browser Networking* are the two starting points.
- **Part How to Learn More — Chapter "Blogs"** — the Cloudflare HTTP/3 tag and Daniel Stenberg's blog are the most-cited engineering sources for ongoing developments.

## See also (other protocol episodes)

- **The QUIC episode.** This is the deep-dive one floor down. HTTP/3 is the application protocol; QUIC is the transport that does almost all the work — multiplexing, encryption, loss recovery, connection migration, congestion control, 0-RTT. If you want to understand why HTTP/3 looks the way it does, you watch QUIC.

- **The HTTP/2 episode.** The contrast is everything. HTTP/2 multiplexed many streams over one TCP connection and inherited TCP's head-of-line blocking — the very feature that made it succeed (multiplexing) turned a single dropped packet into a whole-connection stall. HTTP/3 is, very deliberately, "HTTP/2's request-response semantics, with HTTP/2's framing replaced by QUIC streams and HPACK replaced by QPACK." Server Push and dependency-based prioritization are gone; RFC 9218 replaces priorities with a simple urgency/incremental Priority header.

- **The HTTP/1.1 episode.** Still ubiquitous — about 28 percent of requests in 2026. HTTP/1.1 is the text protocol you can debug with netcat; HTTP/3 is the binary protocol you debug with qvis. Both implement RFC 9110 semantics.

- **The TLS episode.** QUIC integrates TLS 1.3 at the record level — handshake messages travel in CRYPTO frames inside Initial and Handshake packets, sharing AEAD keys derived by HKDF from TLS handshake secrets. There is no TLS version other than 1.3 with QUIC, and there is no unencrypted HTTP/3.

- **The UDP episode.** Pure substrate. QUIC must enforce a 3-to-1 amplification cap on un-validated paths (RFC 9000, section 8.1), which is why minimum 1200-byte Initial packets are mandated. UDP's universal NAT and firewall traversal is what makes HTTP/3 deployable without changes to network infrastructure.

- **The REST episode.** REST is an architectural style, not a protocol; HTTP/3 inherits all the REST mechanics from RFC 9110 unchanged. For an API author, switching from HTTP/2 to HTTP/3 is mostly a deployment change.

- **The DNS episode.** The HTTPS DNS RR (RFC 9460, November 2023) is what tells the browser "this site speaks h3" before the first connection — closing the Alt-Svc bootstrap gap. Web Almanac 2024 found 99 percent of HTTP/3 page loads were triggered by HTTPS DNS records.

- **The Wi-Fi episode.** Connection migration via Connection IDs is the killer feature for mobile — the moment your phone walks out of the house, the underlying IP changes from Wi-Fi to cellular, and only QUIC keeps the session alive.

- **The IP episode.** Underneath UDP. The 4-tuple that pins TCP to a path is the same 4-tuple QUIC explicitly disowns by routing on Connection ID instead.

- **The WebSocket episode.** RFC 9220 defines WebSocket over HTTP/3 — defined, but barely deployed; no major browser ships a production implementation as of early 2026. The longer-term replacement is WebTransport over HTTP/3, but for new projects in 2026 the choice is rarely WebTransport.

## Visual cues for image generation

- "A four-layer stack: HTTP semantics (RFC 9110) on top, then HTTP/3 framing plus QPACK (RFC 9114, RFC 9204), then QUIC streams plus QUIC-TLS plus loss/cc (RFC 9000/9001/9002), then UDP on port 443. Caption: 'The same HTTP, on a new transport.'"
- "A side-by-side handshake comparison: TCP+TLS 1.3 stretching across two-to-three round trips, versus QUIC folding transport and TLS into a single 1-RTT exchange — and a 0-RTT resumption arrow that reaches the server with application data on the very first flight."
- "The head-of-line-blocking contrast: a single dropped packet on an HTTP/2-over-TCP connection stalls every coloured stream behind it; the same dropped packet on HTTP/3-over-QUIC stalls only the stream it carried."
- "A phone walking out of a coffee shop. On the left, the Wi-Fi 4-tuple connection breaks; on the right, the QUIC Connection ID survives the handoff to cellular and the video call keeps playing."
- "The 21% plateau chart: Cloudflare-observed protocol share over 30 days ending April 2026 — HTTP/2 51%, HTTP/1.x 28%, HTTP/3 21% — annotated with the 2024 Zhang et al. paper showing the 500 Mbps inflection where HTTP/3 starts losing to HTTP/2."
- "An attack-versus-defence cartoon: HTTP/2 Rapid Reset (CVE-2023-44487) sending 398 million RST_STREAMs per second at Google in August 2023, with QUIC's per-stream transport accounting drawn alongside as the structural reason HTTP/3 stacks were spared."

## Sources

**RFCs**
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9001 — Using TLS to Secure QUIC](https://www.rfc-editor.org/rfc/rfc9001)
- [RFC 9002 — QUIC Loss Detection and Congestion Control](https://www.rfc-editor.org/rfc/rfc9002)
- [RFC 9204 — QPACK Field Compression for HTTP/3](https://www.rfc-editor.org/rfc/rfc9204)
- [RFC 9220 — WebSocket over HTTP/3](https://www.rfc-editor.org/rfc/rfc9220)
- [RFC 9297 — HTTP Datagrams and the Capsule Protocol](https://www.rfc-editor.org/rfc/rfc9297)
- [RFC 9298 — Proxying UDP in HTTP](https://www.rfc-editor.org/rfc/rfc9298)
- [RFC 9369 — QUIC v2](https://www.rfc-editor.org/rfc/rfc9369)
- [RFC 9460 — Service Binding and Parameter Specification via the DNS (SVCB and HTTPS RRs)](https://www.rfc-editor.org/rfc/rfc9460)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 8999 — Version-Independent Properties of QUIC](https://www.rfc-editor.org/rfc/rfc8999.html)
- [draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/)
- [draft-ietf-webtrans-http3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)
- [draft-ietf-tls-esni (ECH)](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/)
- [draft-ietf-quic-multipath (HTML, quicwg.org)](https://quicwg.org/multipath/draft-ietf-quic-multipath.html)
- [RFC 9484 — Proxying IP in HTTP](https://datatracker.ietf.org/doc/rfc9484/)

**Papers**
- [Langley et al. — The QUIC Transport Protocol: Design and Internet-Scale Deployment (SIGCOMM 2017)](https://conferences.sigcomm.org/sigcomm/2017/files/program/ts-5-1-QUIC.pdf)
- [Zhang et al. — QUIC is not Quick Enough over Fast Internet (ACM Web Conference 2024)](https://dl.acm.org/doi/10.1145/3589334.3645323)
- [Zhang et al. — QUIC is not Quick Enough (PDF)](https://dl.acm.org/doi/pdf/10.1145/3589334.3645323)
- [Zhang et al. — QUIC is not Quick Enough (arXiv preprint)](https://arxiv.org/abs/2310.09423)
- [Marx et al. — Visualizing QUIC and HTTP/3 with qlog and qvis (ANRW 2020)](https://www.researchgate.net/publication/354590001_Visualizing_QUIC_and_HTTP3_with_qlog_and_qvis)
- [Demystifying QUIC from the Specifications (arXiv 2511.08375v1, Nov 2025)](https://arxiv.org/html/2511.08375v1)
- [QFAM — Cryptographic puzzle in QUIC Retry (arXiv, Dec 2024)](https://arxiv.org/pdf/2412.08936)
- [QUICsand-class amplification (Springer)](https://link.springer.com/article/10.1007/s10207-022-00630-6)
- [Web Almanac 2024 — HTTP chapter](https://almanac.httparchive.org/en/2024/http)

**Vendor and engineering blogs**
- [Cloudflare — HTTP/3 usage view](https://blog.cloudflare.com/cloudflare-view-http3-usage/)
- [Cloudflare — HTTP/3 tag](https://blog.cloudflare.com/tag/http3/)
- [Meta Engineering — How Facebook is bringing QUIC to billions](https://engineering.fb.com/2020/10/21/networking-traffic/how-facebook-is-bringing-quic-to-billions/)
- [Daniel Stenberg — HTTP/3 in curl mid 2024](https://daniel.haxx.se/blog/2024/06/10/http-3-in-curl-mid-2024/)
- [Daniel Stenberg — author archive](https://daniel.haxx.se/blog/author/daniel/page/49/)
- [Daniel Stenberg — HTTP/3 Explained](https://http3-explained.haxx.se/)
- [Samuel Henrique — Debian's curl now supports HTTP/3](https://samueloph.dev/blog/debian-curl-now-supports-http3/)
- [Microsoft msquic wiki](https://github.com/microsoft/msquic/wiki)
- [Microsoft .NET — Experimental WebTransport over HTTP/3 in Kestrel](https://devblogs.microsoft.com/dotnet/experimental-webtransport-over-http-3-support-in-kestrel/)
- [NCC Group — Hash DoS in multiple QUIC implementations](https://www.nccgroup.com/research-blog/technical-advisory-hash-denial-of-service-attack-in-multiple-quic-implementations/)
- [QUIC-Hash-Dos advisory (NCC)](https://github.com/ncc-pbottine/QUIC-Hash-Dos-Advisory)
- [nginx CHANGES](https://nginx.org/en/CHANGES)
- [Andy Pearce — HTTP/3 in practice](https://www.andy-pearce.com/blog/posts/2023/Apr/http3-in-practice-http3/)
- [Washington University CSE — QUIC overview](https://www.cse.wustl.edu/~jain/cse570-21/ftp/quic/index.html)
- [Feisty Duck — ECH approved for publication](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication)
- [CIS — Security control changes due to TLS Encrypted ClientHello](https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello)
- [KeyCDN — QUIC overview](https://www.keycdn.com/blog/quic)
- [pcap2qlog (quiclog)](https://github.com/quiclog/pcap2qlog)
- [qvis](https://qvis.quictools.info/)
- [High Performance Browser Networking (Grigorik)](https://hpbn.co/)
- [Stanford CS 144](https://cs144.github.io/)

**News**
- [LWN coverage — Linux kernel QUIC patch series](https://news.tuxmachines.org/n/2025/07/31/LWN_s_Kernel_Coverage.shtml)
- [Hacker News discussion — HTTP/3 priorities](https://news.ycombinator.com/item?id=31647033)

**Wikipedia**
- [Wikipedia — HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- [Wikipedia — Jim Roskind](https://en.wikipedia.org/wiki/Jim_Roskind)
