---
id: quic
type: chapter
part_id: transport
part_label: IV
part_title: Transport
title: QUIC
synopsis: Reliable transport in user space, on UDP, with TLS folded in.
podcast_target_minutes: 15
position_in_book: 29 of 75
listening_order:
  prev: transport/mptcp
  next: wireless/the-shared-medium
related_protocols: [quic, tcp, udp, http3, http2, tls, wifi, ip, mptcp, rtp]
related_pioneers: [jim-roskind, mike-belshe]
related_outages: []
related_frontier: [multipath-quic, moq-transport]
related_rfcs: [9000, 9114]
images: []
visual_cues:
  - "Cross-section of a QUIC packet on the wire: outer UDP header in clear, then the encrypted QUIC body sealing TLS 1.3 keys, multiple stream IDs, and acknowledgements under one crypto envelope."
  - "Side-by-side handshake comparison. Left: TCP three-way plus TLS 1.3 — two to three round trips before the first HTTP byte. Right: QUIC — one round trip, or zero on resumption."
  - "Timeline: 2012 Roskind starts gQUIC at Google, 2013 gQUIC in Chrome, 2016 IETF working group, May 2021 RFC 9000, June 2022 RFC 9114, May 2023 RFC 9369 v2, July 2025 in-kernel QUIC patch lands on Linux."
  - "A phone moving between Wi-Fi and cellular. TCP connection drops because the four-tuple changed. QUIC connection survives because the 64-bit connection ID is independent of the IP and UDP ports."
  - "A throughput chart above 500 Mbps: kernel TCP at the top, HTTP/2 just below, userspace QUIC trailing by up to 45.2%. An arrow labelled 'in-kernel QUIC, expected mainline 2026' points to the gap closing."
---

# Part IV, Chapter — QUIC

## The hook

QUIC is the first new transport to actually displace TCP at scale. It did so by accepting that the kernel cannot ship transport changes faster than once a decade — and by tunnelling inside UDP, the one protocol every middlebox on Earth already had to forward unchanged. By 2026, Meta reports more than seventy-five percent of its internet-facing traffic running on QUIC, Cloudflare serves it universally, and Apple's Network.framework offers it natively. The transport reshaped its own deployment ecosystem in five years.

## The story

### A Transport That Can Ship Updates

QUIC began as gQUIC at Google in 2012, written by Jim Roskind to solve a specific frustration. Every TCP improvement Google wanted to deploy had to wait years for kernel rollout across the heterogeneous internet, and many were stripped or blocked outright by middleboxes that had ossified on the existing wire format. Roskind's bet was different. Put the new transport in user space, tunnel it through UDP that no middlebox would touch, and ship updates with the next browser release.

The IETF QUIC Working Group, formed in 2016, took Google's experiment and modularised it. RFC 9000 standardised QUIC version one in May 2021. RFC 9114 defined HTTP/3 — HTTP semantics on top of QUIC — one year later, in June 2022. Then came RFC 9369 in May 2023: QUIC version two, a Standards-Track template for new versions of the protocol. Its wire-image version number is 0x6b3343cf — the first four bytes of the SHA-256 hash of the string "QUICv2 version number" — chosen specifically to exercise version negotiation and break any middlebox that had ossified on version one's Initial-packet salt. The protocol was designed, from RFC 9000 onward, to keep being changeable.

QUIC solves four problems at once.

### Four Problems Solved

The first is head-of-line blocking. In TCP, a single lost segment stalls every byte behind it, because the protocol guarantees an in-order byte stream. QUIC carries multiple streams in a single connection, with independent sequence numbers per stream — a lost packet on stream seven does not block delivery on streams one through six. This is the fix that HTTP/2 could not provide because HTTP/2 inherited TCP's stream model. The full mechanism — how the streams interleave, how loss recovery runs per stream — is the QUIC episode's job.

The second is connection setup. TCP plus TLS takes two to three round trips before the first byte of application data flows. QUIC folds the TLS 1.3 handshake into the QUIC handshake itself, achieving one-round-trip setup for new connections and zero-round-trip for resumptions. A typical mobile request is bottlenecked by latency, not bandwidth — every round trip eliminated is real user-visible improvement. The TLS episode covers the 1.3 simplification that made the fusion possible.

The third is network change. Your phone moving between Wi-Fi and cellular breaks TCP, because a TCP connection is bound to a four-tuple of source IP, source port, destination IP, destination port — change any element and the connection is gone. QUIC uses a sixty-four-bit connection ID that is independent of the underlying IP and UDP. The receiver matches arriving packets by connection ID, and an address change is invisible to the application. This is the same problem MPTCP solves at the TCP layer — the previous chapter is the parallel-universe answer.

The fourth, and deepest, is deployability. QUIC runs over UDP, which middleboxes already forward unchanged. The implementations live in user space, so an application can ship a transport bug fix in a binary update — no kernel reboot, no waiting for an OS release. Google could deploy QUIC features for chrome.com on a weekly cadence; with TCP they would have waited five years per change.

### The 21% Plateau and the In-Kernel Push

The deployment story is not finished. As of the first quarter of 2026, QUIC carries roughly twenty-one percent of Cloudflare-observed web requests — flat or slightly declining for several months. The plateau correlates with a 2024 ACM Web Conference paper by Zhang and colleagues titled "QUIC is not Quick Enough over Fast Internet," which showed throughput regressions of up to 45.2 percent versus HTTP/2 at speeds above roughly 500 Mbps. The cause is receiver-side userspace ACK and copy overhead — the same user-space deployment trick that made QUIC shippable becomes the bottleneck on a fast link.

The fix in flight is in-kernel QUIC. Xin Long's roughly nine-thousand-line patch series for Linux landed in July 2025, and mainline merge is expected in 2026. When in-kernel QUIC ships, the throughput gap with kernel TCP closes — without giving up the user-space iteration path that got the protocol deployed in the first place. The same protocol can live in both places.

### What's On the Frontier

The next ten years of transport innovation are all riding on QUIC. Multipath QUIC, draft-ietf-quic-multipath, entered IESG Last Call in December 2025. It inherits MPTCP's algorithmic ideas but lives inside a transport that actually traverses middleboxes. HTTP Datagrams and Capsules, RFC 9297 from August 2022, standardised unreliable datagrams over HTTP/3 — the substrate for both MASQUE and WebTransport. The MASQUE working group then shipped CONNECT-UDP in RFC 9298, also August 2022, and CONNECT-IP in RFC 9484 in October 2023. Apple Private Relay and Cloudflare's WARP-related proxy services use these.

Two media transports sit on QUIC as well. Media-over-QUIC Transport, draft-ietf-moq-transport-17 from March 2026, is the first IETF media transport that intentionally is not RTP — sub-second live streaming with one-to-many publish/subscribe at CDN scale. RTP-over-QUIC, draft-ietf-avtcore-rtp-over-quic-14, entered Working Group Last Call in July 2025 and preserves the entire RTP ecosystem while gaining QUIC's encryption, NAT-friendliness, and zero-RTT setup.

By 2026, Meta reports more than seventy-five percent of its internet-facing traffic on QUIC, Cloudflare serves QUIC universally, Apple's Network.framework has offered native QUIC since iOS 18, and Safari 18 enables HTTP/3 by default. The transport reshaped its deployment ecosystem in five years.

## The figures

### Jim Roskind

Roskind designed and championed QUIC at Google starting around 2012. The original name was Quick UDP Internet Connections, and the original premise was a sentence long: UDP passes through every middlebox; layer reliability, multiplexing, and crypto on top of it in user space; iterate as a browser update instead of a kernel upgrade. Google deployed gQUIC in production from 2013 onwards. The IETF QUIC working group chartered in 2016 and shipped RFC 9000 in May 2021 — substantially redesigned from gQUIC, but recognisable as the same architecture. HTTP/3, RFC 9114 in June 2022, made QUIC the default modern transport for the web. By 2025 around thirty-five percent of the top ten million sites supported HTTP/3 and Meta reported more than seventy-five percent of its traffic on QUIC. There is a separate Roskind episode.

### Mike Belshe

Belshe co-created SPDY at Google in 2009 with Roberto Peon — the experimental binary, multiplexed, header-compressed transport that proved HTTP/1.1's head-of-line blocking and one-request-per-connection model could be replaced. SPDY shipped in Chrome in 2010. The IETF httpbis working group started HTTP/2 in 2012 using SPDY/2 as the base, and HTTP/2 was published as RFC 7540 in May 2015. Once HTTP/2 was on track, Google deprecated SPDY in Chrome — a textbook example of ship a thing, prove it works, hand it to the standards body, retire your own version. Belshe is now CEO of BitGo, the cryptocurrency custody firm. He belongs in this chapter because the QUIC story is the second act of the same playbook he and Peon ran with SPDY.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport

Published in May 2021, edited by Jana Iyengar and Martin Thomson. Proposed Standard. The document is the canonical specification for QUIC — connection IDs, paths, and migration in section five; loss recovery and congestion control in section thirteen; the long and short packet header formats in section seventeen. It is the working group's substantially redesigned successor to Google's gQUIC, and it is the standard that turned QUIC from a Google experiment into the modern web's default transport.

### RFC 9114 — HTTP/3

Published in June 2022, edited by Mike Bishop. Proposed Standard. The document defines HTTP semantics — the same methods, headers, and status codes developers already know — carried over QUIC instead of TCP. Each HTTP request maps to a QUIC stream, so a single lost packet only stalls its own stream rather than every other request on the connection. RFC 9114 is the spec that made QUIC the default web transport; the HTTP/3 episode picks up the application-layer story from here.

### Multipath QUIC

Draft-ietf-quic-multipath is in IETF Last Call as of late 2025 and early 2026. The protocol extends QUIC with multiple concurrent paths between endpoints — built into QUIC's connection-ID architecture rather than bolted on as TCP options the way MPTCP was. Use cases include aggregating Wi-Fi and cellular bandwidth on a phone, seamless handover when the user changes interfaces, and reaching a multi-homed server through whichever path is fastest. The 3GPP ATSSS standard for 5G already specifies both MPTCP and Multipath QUIC for traffic steering between cellular and Wi-Fi.

### Media-over-QUIC Transport

Draft-ietf-moq-transport-17, March 2026, is the IETF's Media-over-QUIC Transport — sub-second live streaming over QUIC, designed to replace the RTMP-into-HLS pipeline that streamers use today. Publishers send named objects to MoQ relays; subscribers fetch named objects from the nearest relay, with hop-by-hop QUIC. Object naming plus QUIC stream multiplexing mean a relay can drop objects under congestion — preserve key frames over delta frames — without the publisher coordinating. Cloudflare and Meta have public MoQ relay implementations; Twitch and YouTube are evaluating. WebRTC's lunch may finally be eaten for one-to-many use cases.

## What you'd see in the simulator

Press Play on the QUIC simulation and you'll see the move that the whole chapter is about. The client sends a single Initial packet over UDP, and inside that one packet sits a TLS 1.3 ClientHello. The server replies with its own Initial carrying a ServerHello, its certificate, and the keys to derive a shared secret. One round trip later, the connection is up and encrypted, and the first byte of HTTP can flow on the very next packet. A returning client can do it in zero round trips, replaying a session ticket from the previous connection. The contrast to keep in mind is the TCP-plus-TLS path the TCP and TLS episodes unpack in detail — three round trips before any application data, instead of one.

## What it taught the industry

Three things are now load-bearing in the way new transports get designed.

Ship in user space, or don't ship. Before QUIC, the assumption was that transport protocols live in the kernel because that's where the performance is. After QUIC, the assumption flipped. Putting the protocol in user space is what allowed Chrome and Meta to iterate gQUIC monthly while the IETF was still chartering the working group. The performance penalty turned out to be manageable. The deployment penalty of being in the kernel turned out to be lethal. The in-kernel QUIC patch landing on Linux in July 2025 is the second move — once the protocol is widely deployed, you can put a fast path in the kernel without giving up the user-space iteration path that got it there.

Encrypt the protocol headers, or watch them ossify. QUIC encrypts almost everything past the first few bytes — even most of the packet number is hidden under header protection. Anything a middlebox can read, a middlebox will eventually depend on; anything a middlebox depends on, the protocol can no longer change. RFC 9369's deliberately-randomised version number for QUIC v2 is the same lesson made operational: keep the change machinery exercised, or it rusts shut.

UDP is the new IP. For deployment purposes, the IP layer is no longer the universal substrate. UDP is — because UDP is the only thing the deployed middlebox fleet will reliably forward without inspection. That reframing is why every serious new transport since 2018 — Multipath QUIC, Media-over-QUIC, RTP-over-QUIC, the WebTransport API — sits inside UDP rather than asking for a new protocol number.

## Listening order

- **Before this chapter:** *MPTCP* — the parallel-universe answer to the same connection-survives-network-change problem, but at the TCP layer rather than on UDP. That chapter sets up why a sixty-four-bit connection ID inside QUIC is the cleaner fix.
- **After this chapter:** *The shared medium* — the book leaves transport behind and walks down to the radio layer where Wi-Fi, cellular, and the rest of the wireless world contend for airtime. Many of QUIC's design choices only make sense once you've seen what happens on those links.

## Where to go deeper

- The QUIC episode is the mechanism deep-dive — connection IDs, the 1-RTT and 0-RTT handshakes, per-stream loss recovery, the long and short packet header formats from section seventeen of RFC 9000.
- The TCP episode is the contrast study — slow start, AIMD, CUBIC, BBRv3 as Google's default since 2023, and the kernel-bound deployment story QUIC is escaping.
- The UDP episode explains why the eight-byte header that powers DNS and VoIP turned out to be the universal envelope for the next generation of transports.
- The TLS episode covers the 1.3 handshake — the two-round-trip-to-one simplification from 2018 that QUIC then fused with the transport setup.
- The HTTP/3 episode picks up where this chapter ends — the same HTTP API on top, QUIC underneath, independent streams, and a path to the majority of large-platform web traffic.
- The HTTP/2 episode is the immediate predecessor — Belshe and Peon's SPDY work, multiplexing on a single TCP connection, and the head-of-line blocking that QUIC was designed to escape.
- The MPTCP episode is the TCP-layer answer to multipath that Multipath QUIC inherits algorithmic ideas from.
- The RTP episode is where the QUIC envelope meets real-time media — and where the RTP-over-QUIC draft is taking the entire RTP ecosystem inside QUIC's encryption and migration story.
