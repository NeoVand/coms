---
id: web-api/http3
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: HTTP/3
synopsis: HTTP semantics on QUIC. The plateau is real but so is the agenda.
podcast_target_minutes: 15
position_in_book: chapter 41 of 75
listening_order:
  prev: web-api/http2
  next: web-api/rest-and-graphql
related_protocols: [http3, http2, quic, tcp, udp, tls, wifi, http1, mptcp, ip, dns]
related_pioneers: []
related_outages: []
related_frontier: [multipath-quic, ech-rfc-9849]
related_rfcs: [9114, 9110, 9000, 9849, 9460]
images: []
visual_cues:
  - "Stacked bar of Cloudflare-observed traffic in Q1 2026: HTTP/1.x at 28%, HTTP/2 at 51%, HTTP/3 at 21% — with a flat trendline on the HTTP/3 segment."
  - "Side-by-side handshake timeline — TCP+TLS 1.3 needing two round trips before data flows, versus QUIC folding transport and TLS into one round trip."
  - "A phone walking from a Wi-Fi access point to a cellular tower, with the same QUIC connection ID surviving the network change while the IP addresses change underneath."
  - "Diagram of an HTTP/3 connection with three independent QUIC streams — one packet drop on stream 2 stalls only stream 2; streams 1 and 3 keep flowing."
  - "Architecture sketch of in-kernel QUIC on Linux: an IPPROTO_QUIC socket in the kernel, with the TLS handshake delegated to a userspace tlshd daemon."
---

# Part VI, Chapter — HTTP/3

## The hook

HTTP/3 sits at about 21% of Cloudflare-observed traffic in Q1 2026, and that number is flat. It has been flat for months. The plateau lines up with a 2024 paper that measured up to 45% throughput regressions versus HTTP/2 once you push past 500 megabits per second — and the cause is not the wire format. It is that the receiver is doing acknowledgments and packet copies in userspace. This is the chapter where the third version of HTTP grows up, hits a wall, and the kernel community starts writing the patch.

## The story

### Same HTTP, a new transport

HTTP/3 is the third major version of HTTP, and on the surface nothing has changed. Same verbs. Same status codes. Same header semantics — the ones standardised in RFC 9110, the HTTP Semantics document. What changed is the layer underneath. HTTP/3, defined in RFC 9114 and edited by Mark Bishop of Akamai in June 2022, is a binary mapping of those HTTP semantics onto QUIC, the UDP-based transport in RFC 9000.

The wire encoding had to change a little. HTTP/2 used a header compression scheme called HPACK; HTTP/3 uses QPACK, defined in RFC 9204, because QUIC's stream ordering does not match TCP's byte ordering. Application code does not need to know any of this.

What does change is everything beneath the application. Multiplexed streams in HTTP/3 are truly independent at the transport layer. A lost UDP packet only stalls the stream that owned the lost data — the other streams keep flowing. Connection setup folds into the TLS 1.3 handshake at zero or one round trip. And QUIC's connection IDs survive network changes, so a phone moving between Wi-Fi and cellular keeps its HTTP/3 sessions alive without re-handshaking. How any of this actually works on the wire is the QUIC episode — connection IDs, packet number spaces, the loss-recovery state machine. We are telling the chapter story here.

One footnote from the spec side. QUIC v2 was published in May 2023 by Martin Duke as a Standards-Track template for new QUIC versions. Its wire-image version number is 0x6b3343cf — the first four bytes of the SHA-256 of the string "QUICv2 version number" — chosen specifically to exercise version negotiation and break middleboxes that had ossified on v1's Initial-packet salt. The IETF was telling the network in advance: do not assume the version field will sit still.

### Adoption — and the plateau

The browser timeline is short and consistent. By 2018, HTTP/3's Google-internal predecessor gQUIC was carrying meaningful traffic. Chrome enabled HTTP/3 by default in April 2020. Firefox followed in May 2021. Apple shipped Safari 14 with experimental HTTP/3 in September 2020 and turned it on by default in Safari 16 in September 2024. Cloudflare announced edge support in September 2019. Cloudflare, Fastly, and Akamai all serve HTTP/3 universally today.

The server side took longer. Mainline nginx 1.25.0, released on 23 May 2023, finally merged the QUIC stack and shipped HTTP/3 as a stable feature after years of experimental builds. Caddy 2.6 has shipped HTTP/3 by default since September 2022. HAProxy 2.6 added experimental HTTP/3 in May 2022 and stabilised it in versions 2.8 and 3.0. curl got HTTP/3 in default Debian 13 — trixie — in October 2025. Apache httpd still has no production HTTP/3 build.

So the support is there. The deployment is there. And yet, as of Q1 2026, HTTP/3 carries roughly 21% of Cloudflare-observed web requests — flat or slightly declining for several months. HTTP/2 still dominates at about 51%. HTTP/1.x persists near 28%.

The plateau is not a mystery. It correlates closely with a 2024 paper from the ACM Web Conference, "QUIC is not Quick Enough over Fast Internet" by Zhang and colleagues, which measured throughput regressions of up to 45.2% versus HTTP/2 above roughly 500 megabits per second. The cause is structural. QUIC implementations live above the kernel. Every packet the receiver acknowledges costs a context switch the kernel TCP stack does not pay. Every packet copy out of the network buffer is a copy the kernel TCP stack does not pay. On a slow link none of this matters. On a fast link it dominates.

The fix in flight is in-kernel QUIC. Xin Long posted the first roughly nine-thousand-line in-kernel QUIC patch series for Linux on 22 July 2025 — there is solid LWN coverage. The design uses a new socket protocol, IPPROTO_QUIC, mirroring the way IPPROTO_MPTCP was introduced for Multipath TCP. The TLS handshake is delegated to userspace via the tlshd daemon, which keeps the cryptographic code out of the kernel. Mainline merge is expected in 2026 at the earliest. If it lands and the regressions evaporate, the next slice of the chart could finally bend up.

### The active frontier

The next ten years of HTTP innovation are being shaped by working-group output from 2024 through 2026. Five threads are worth knowing.

The first is Multipath QUIC. The IETF draft, draft-ietf-quic-multipath, entered IESG Last Call in December 2025; the latest draft, dash twenty-one, is dated 17 March 2026. Alibaba and Apple have already deployed predecessors. The point is to inherit Multipath TCP's algorithmic ideas, but inside a transport that actually traverses the middleboxes of the modern internet — something MPTCP famously struggles with. There is more on this in the Multipath QUIC entry on the Frontier page.

The second is HTTP Datagrams and Capsules, standardised in RFC 9297 in August 2022 by David Schinazi and Lucas Pardue. That work standardised unreliable datagrams over HTTP/3 — the substrate that everything below is built on.

The third is MASQUE — Multiplexed Application Substrate over QUIC Encryption — the working group that ships CONNECT-UDP and CONNECT-IP. Apple Private Relay and Cloudflare's WARP-related proxy services are the deployment story.

The fourth is WebTransport over HTTP/3, currently at draft-ietf-webtrans-http3-15 from March 2026. Chrome and Edge ship implementations; ASP.NET Core's Kestrel server has experimental support. WebTransport is what WebSocket would look like if it were redesigned in 2024.

The fifth is Encrypted Client Hello — ECH. The TLS working group approved it; it entered the RFC editor queue in 2025 as RFC 9849, and the IANA registry was allocated on 30 July 2025. Cloudflare turned ECH on for about 70% of its zones. Russia began censoring ECH connections almost immediately. Major browsers ship ECH gated by HTTPS DNS records, the format defined in RFC 9460. There is a dedicated entry for the ECH publication in the Frontier section.

There is also one smaller QUIC-level draft worth flagging: Reliable Stream Resets — draft-ietf-quic-reliable-stream-reset, by Marten Seemann and Kazuho Oku, latest revision dash seven from June 2025. It defines RESET_STREAM_AT, which WebTransport needs so that the reliable initial bytes of a stream can be guaranteed even after a reset.

## The figures

### Multipath QUIC

Multipath QUIC is in IETF last call as of late 2025 and early 2026. The protocol extends QUIC with multiple concurrent paths between endpoints, the same way Multipath TCP extended TCP — but built into QUIC's connection-ID architecture rather than bolted on as TCP options. The use cases include aggregating Wi-Fi and cellular bandwidth on a phone, seamless network handover when the user changes interfaces, and reaching a multi-homed server through whichever path is fastest. Apple already does the Wi-Fi-plus-cellular trick with MPTCP for Siri. The 3GPP ATSSS standard for 5G already specifies both MPTCP and Multipath QUIC for steering traffic between cellular and Wi-Fi.

### Encrypted Client Hello, published as RFC 9849

ECH hides the SNI and the other ClientHello fields that previously let middleboxes and ISPs see which site you were visiting. It took 25 IETF drafts and was finally published as RFC 9849 in 2025. Cloudflare deploys ECH for roughly 70% of the websites it fronts; Chrome and Firefox both support it. The architecture is neat: the server publishes an ECHConfig in DNS using an HTTPS resource record; the client encrypts the inner ClientHello to that key and wraps it in an outer ClientHello that uses a generic "cloudflare-ech.com" SNI. From the network's perspective, every fronted site looks the same.

### RFC 9114 — HTTP/3

Published in June 2022, edited by Mark Bishop of Akamai. Proposed standard. It defines HTTP/3 as the binary mapping of HTTP semantics onto QUIC — the wire format, the use of QPACK for headers, and the handling of streams, settings, and connection lifecycle.

### RFC 9110 — HTTP Semantics

Published in 2022, edited by Roy Fielding, Mark Nottingham, and Julian Reschke. Internet Standard. It obsoletes RFCs 7230 through 7235 and consolidates the version-independent semantics of HTTP — methods, status codes, headers, content negotiation, idempotency. It is the document HTTP/3 maps onto.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport

Published in 2021, edited by Jana Iyengar and Martin Thomson. Proposed standard. It defines connections, connection IDs, paths and migration, loss recovery and congestion control, and the long and short packet header formats. The full mechanism story is the QUIC episode.

### RFC 9849 — TLS Encrypted Client Hello, registration entries

Published in 2025 by the IETF TLS Working Group. The Encrypted Client Hello specification — the registration-entries document that finally moves SNI encryption out of perpetual draft.

### RFC 9460 — Service Binding and Parameter Specification via the DNS

Published in 2023 by Ben Schwartz, Mark Bishop, and Erik Nygren. Proposed standard. It defines the SVCB and HTTPS DNS resource records — the DNS hooks that ECH-enabled browsers use to discover the server's ECH configuration before they connect.

## What you'd see in the simulator

The HTTP/3 simulator replaces TCP with QUIC underneath and shows what happens when you press play. UDP packets fly between client and server — no SYN, no SYN-ACK, no separate TLS hello after that. Instead the very first flight carries the TLS 1.3 handshake and the QUIC transport parameters together, in a single round trip. The server replies with the rest of the handshake and the certificate. The client validates and is ready to send HTTP requests. Each request maps to its own QUIC stream, and you can watch streams interleave across the same connection. If the simulator drops a packet on one stream, only that stream stalls; the other streams keep delivering bytes. That last part is the headline difference from the HTTP/2 picture, where a single TCP loss freezes everything.

## What it taught the industry

It taught the industry three things.

First, that swapping the transport under HTTP can be done without breaking applications — same verbs, same status codes, same headers, a different layer underneath. That insight is now load-bearing for the whole MASQUE and WebTransport agenda.

Second, that performance is not won by a wire format alone. QUIC's design beats TCP plus TLS on round trips and on stream independence, but the implementation has to live somewhere. Putting it in userspace was the right move for shipping; keeping it there is the wrong move for high-bandwidth links. The 45% regression paper made that visible, and the in-kernel QUIC patch series is the response.

Third, that the IETF process has not slowed down. RFC 9000 in 2021. RFC 9114 in 2022. RFC 9297 for datagrams in 2022. RFC 9460 for HTTPS DNS records in 2023. RFC 9849 for ECH in 2025. Multipath QUIC and WebTransport on track for 2026 and beyond. The plateau in deployment numbers is not the same as a plateau in the standards — those are still moving fast.

## Listening order

- **Before this chapter:** "HTTP/2" — sets up the binary, multiplexed model HTTP/3 inherits, and the head-of-line blocking problem at the TCP layer that motivated moving to QUIC.
- **After this chapter:** "REST and GraphQL" — shifts from the wire to the API style, looking at how the request-response semantics that HTTP/3 preserves get used at the application layer.

## Where to go deeper

- The QUIC episode picks up the mechanism — connection IDs, the 1-RTT and 0-RTT handshake, packet number spaces, loss recovery, and connection migration.
- The HTTP/2 episode covers the streams-and-frames model that HTTP/3 inherits, plus HPACK, server push, and the head-of-line blocking story at the TCP layer.
- The TLS episode explains the 1.3 handshake that QUIC folds into its first flight, and is the home for the full ECH story now that RFC 9849 has shipped.
- The UDP episode is the substrate — fire-and-forget datagrams with no kernel state, which is what makes putting a new transport above them possible at all.
- The Multipath TCP episode is the algorithmic ancestor of Multipath QUIC — same ideas, harder middlebox traversal, which is exactly what the QUIC version is trying to fix.
- The DNS episode explains the HTTPS resource record format from RFC 9460 that ECH-enabled browsers query before they connect.

## Visual cues for image generation

- Stacked bar of Cloudflare-observed traffic in Q1 2026: HTTP/1.x at 28%, HTTP/2 at 51%, HTTP/3 at 21%, with a flat trendline on the HTTP/3 segment.
- Side-by-side handshake timeline — TCP plus TLS 1.3 needing two round trips before data flows, versus QUIC folding transport and TLS into one round trip.
- A phone walking from a Wi-Fi access point to a cellular tower, with the same QUIC connection ID surviving the network change while the IP addresses change underneath.
- Diagram of an HTTP/3 connection with three independent QUIC streams — one packet drop on stream 2 stalls only stream 2; streams 1 and 3 keep flowing.
- Architecture sketch of in-kernel QUIC on Linux: an IPPROTO_QUIC socket in the kernel, with the TLS handshake delegated to a userspace tlshd daemon.

## Sources

- [IETF — draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath)
- [Feisty Duck — ECH approved for publication](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication.html)
- [CISecurity — security control changes due to ECH](https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello)
- [RFC 9114 — HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 9110 — HTTP Semantics](https://datatracker.ietf.org/doc/rfc9110/)
- [RFC 9000 — QUIC](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC 9849 — TLS Encrypted Client Hello](https://www.rfc-editor.org/rfc/rfc9849)
- [RFC 9460 — SVCB and HTTPS DNS Resource Records](https://www.rfc-editor.org/rfc/rfc9460)
