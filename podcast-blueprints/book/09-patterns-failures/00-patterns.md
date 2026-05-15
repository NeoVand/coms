---
id: patterns
type: chapter
part_id: patterns-failures
part_label: X
part_title: How Networks Actually Behave
title: Recurring Patterns
synopsis: Handshakes, sliding windows, keepalives, ECN, hashing — the Lego pieces every protocol uses.
podcast_target_minutes: 12
position_in_book: 61 of 75
listening_order:
  prev: utilities-security/email-stack
  next: patterns-failures/failure-modes
related_protocols: [tls, ssh, mqtt, sctp, tcp, quic, http2, websockets, bgp, ip, dns, rest, kafka]
related_pioneers: []
related_outages: [centurylink-flowspec-2020]
related_frontier: [l4s-comcast-launch]
related_rfcs: [8446]
images: []
visual_cues:
  - "A side-by-side comparison of four handshakes — TCP's SYN/SYN-ACK/ACK, TLS 1.3's ClientHello/ServerHello/Finished, MQTT 5's CONNECT/CONNACK, and SCTP's four-way INIT/INIT-ACK/COOKIE-ECHO/COOKIE-ACK — drawn on the same time axis so the listener sees the shape rhyme."
  - "A sliding-window strip cartoon: bytes in flight as coloured tiles between two endpoints, with the window sliding forward each time an ACK arrives. A second pane shows the window stalled because rwnd hit zero."
  - "A round-trip ladder showing TLS 1.2 at two RTTs, TLS 1.3 at one RTT, QUIC at one RTT, and QUIC 0-RTT at zero RTTs — with a red asterisk on the 0-RTT path labelled 'replay risk: idempotent only.'"
  - "An ECN packet diagram: the 2-bit ECN field in the IP header, marked CE by a router, echoed back by the receiver, and the sender responding by easing off — no drop required."
  - "The CenturyLink Flowspec loop drawn as a feedback diagram: bad rule pushed -> BGP sessions die -> sessions re-establish -> rule re-pushed -> sessions die again. Cloudflare's 3.5 percent global traffic dip annotated on the side."
---

# Part X, Chapter — Recurring Patterns

## The hook

Knowing the handshake pattern means you understand 80 percent of TLS, SSH, MQTT, and SCTP setup before you even open their specs. The other 20 percent is the part worth investing time in. Read about ten protocols and you stop seeing ten new things — you start seeing the same handful of patterns repeat. This chapter names them.

## The story

### The Engineering Vocabulary

Once you have read about ten protocols, the same shapes start to appear. A new spec stops being days of work and becomes minutes — most of it turns out to be a particular instantiation of a pattern you already understand. Engineering literacy compounds. The point of this chapter is to enumerate those patterns, name them, and note where each one shows up. The next chapter does the mirror image — the recurring failure modes.

### Handshakes — Establishing Mutual State

A handshake is two parties establishing state on both sides before any real work flows. The shape is always the same: party A proposes, party B confirms with its own proposal, party A acknowledges. TCP does it as SYN, SYN-ACK, ACK. TLS 1.2 does it as ClientHello, ServerHello, Finished, across two round-trips. TLS 1.3, codified in RFC 8446 in 2018, did it in one. MQTT 5 does it as CONNECT and CONNACK. SCTP, the multi-streaming transport, does it in four messages — INIT, INIT-ACK, COOKIE-ECHO, COOKIE-ACK — with the cookie added specifically to defeat SYN floods.

How any of these handshakes actually works frame-by-frame is the job of each protocol's own episode. The point here is the shape. The number of round-trips defines the connection-setup latency, and shrinking it is one of the recurring optimisations in protocol design. TLS 1.3 went from two round-trips to one. QUIC went from three round-trips for TCP-plus-TLS down to one for a new connection — and to zero for resumption, sending application data in the very first packet, encrypted under a previously-established key.

The cost of zero round-trip data is replayability. An attacker who captures the first packet of a 0-RTT exchange can replay it later. Section 8 of RFC 8446 spells out the security implications and limits 0-RTT to idempotent requests. Browsers restrict it to GET. Servers should refuse it for any state-mutating operation. The TLS episode and the QUIC episode walk through how the keys actually get derived; the takeaway here is that every speed-up of a handshake comes with a security trade-off, and the spec writers had to spell it out.

### Sliding Windows — Decoupling Send From ACK

A sliding window decouples sending rate from acknowledgement rate. The sender may have N bytes in flight at once; as ACKs arrive, the window slides forward. Without this, a sender would have to wait for an ACK after every byte — which is fine on a LAN and disastrous on a satellite link where round-trip times are hundreds of milliseconds.

TCP has had sliding windows since 1981. The window's size is governed by either flow control — the rwnd field in the TCP header that the receiver advertises so the sender does not overflow it — or congestion control, the cwnd state variable that lives only in the sender's memory and exists so the sender does not overflow the network. The actual sending limit is the smaller of the two.

Modern protocols inherit the same idea. QUIC has per-stream and per-connection flow control. HTTP/2 has its own application-layer flow control on top of TCP's transport flow control — a cause of considerable confusion when both windows close at the same time. The TCP and QUIC episodes go into the actual algorithms — slow start, AIMD, CUBIC, BBR — but the pattern is universal across reliable transports.

### Keepalives, ECN, Consistent Hashing

Keepalives detect a dead peer when no data is flowing. SSH sends a 1-byte ping every 30 seconds. WebSocket has explicit Ping and Pong frames. HTTP/2 has PING frames. BGP sessions exchange KEEPALIVE messages every 60 seconds, and if no message arrives within the 180-second HoldTime, the session resets and the routes that came over it are withdrawn from the routing table. That last one is exactly what cascaded into the August 2020 CenturyLink outage we cover later in this chapter. Without keepalives, a stateful firewall sitting between you and the peer might silently drop the connection state, and you would only notice when you finally tried to send.

ECN — Explicit Congestion Notification, defined in RFC 3168 — lets routers signal congestion without dropping packets. The router marks a 2-bit field in the IP header, the receiver echoes it back, the sender slows down. The future of low-latency networking depends entirely on ECN being widely supported. L4S — RFCs 9330, 9331, and 9332 — is built on top of it, and Comcast launched L4S in production in late January 2025 across six US metros. The L4S launch entry on the Frontier page has the full deployment story.

Consistent hashing distributes load across a fleet so that adding or removing a node only re-routes a fraction of traffic, not all of it. The MIT 1997 paper by Karger and colleagues invented it. DNS anycast uses it. CDN cache placement uses it. Distributed databases like Cassandra and DynamoDB use it. Nearly every internet-scale system uses it now.

Idempotency keys make retries safe. A request with the same key, sent twice, has the effect of being processed once. Stripe pioneered this for payments in 2015. It is now standard in REST APIs, in Kafka producers, and in any system that needs at-least-once semantics without duplicate side effects.

### Patterns are why protocol literacy compounds

This is the closing callout from the chapter, and it is worth saying out loud. Knowing the handshake pattern means you understand 80 percent of TLS, SSH, MQTT, and SCTP setup before you read their specs. Knowing the sliding window means HTTP/2 flow control and QUIC stream credits are not surprises. Knowing keepalives means you spot the BGP HoldTime in someone's outage post-mortem and immediately know what cascaded. Read the patterns first; protocol-specific details slot in around them.

## The figures

### The CenturyLink Flowspec loop — August 30, 2020

On August 30, 2020, an incorrectly-formatted BGP Flowspec rule pushed by CenturyLink (Level 3, AS 3356) to mitigate a customer's DDoS accidentally matched BGP itself. Routers across the tier-1 backbone started filtering their own BGP keepalives. Sessions died, re-established, re-received the same rule, and died again. Cloudflare measured a 3.5 percent drop in worldwide internet traffic across roughly five hours. CenturyLink had to ask other tier-1s to de-peer with them temporarily so the bad rule could drain. The lesson — do not deploy a feature whose failure mode disables the channel that controls it — is the canonical example of why the keepalive pattern matters. The full incident has its own entry in the Famous Outages part of the book.

### L4S Launches in Production at Comcast — January 2025

L4S is Low Latency, Low Loss, Scalable throughput — the IETF architecture for sub-millisecond queuing latency, standardised as RFCs 9330, 9331, and 9332 in January 2023. Cooperating senders mark every packet ECN-Capable. Routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient. Senders react to marks like minor losses without backing off as hard. Comcast launched it in production on January 29, 2025 in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (MD), and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S support in iOS 17, iPadOS 17, macOS Sonoma, and tvOS 17 back in 2023, on by default for QUIC in newer releases. The full entry is on the Frontier page.

### RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3

Published in August 2018, edited by Eric Rescorla, proposed standard. It obsoletes RFCs 5077, 5246, and 6961 and replaces TLS 1.2. The two parts that get cited the most: section 5, the Record Protocol, and section 7.1, the key schedule built on HKDF-Extract and HKDF-Expand-Label. Appendix D.4 is the famous one — the middlebox-compatibility hacks that make TLS 1.3 traffic on the wire look like TLS 1.2 so that broken middleboxes do not drop it. RFC 8446 is also the document that defines 0-RTT and writes down its replay caveats in section 8.

## Listening order

- **Before this chapter:** *"The Email Stack"* — closes Part IX with the SMTP/IMAP/DMARC story; this chapter pivots from any one protocol to the patterns common to all of them.
- **After this chapter:** *"Failure Modes"* — the mirror image. Same compounding-literacy idea, applied to the recurring ways networks break.

## Where to go deeper

- The TCP episode picks up sliding windows at the byte level — rwnd, cwnd, slow start, AIMD, fast retransmit.
- The TLS episode walks the 1.3 handshake message-by-message and explains the 1-RTT and 0-RTT key schedules.
- The QUIC episode covers the combined transport-and-TLS handshake, per-stream flow control, and connection migration.
- The SSH and MQTT episodes show two more instances of the handshake shape on very different protocols.
- The SCTP episode covers the four-way INIT-cookie handshake and the multi-streaming pattern that QUIC eventually inherited.
- The HTTP/2 and WebSocket episodes both show keepalive PING frames in production protocols.
- The BGP episode covers KEEPALIVE and HoldTime in detail and is the prerequisite for the CenturyLink outage chapter.
- The DNS episode shows consistent hashing and anycast as the actual delivery mechanism for root and recursive resolvers.
- The REST and Kafka episodes both treat idempotency keys as a first-class operational concern.

## Visual cues for image generation

- A four-up handshake comparison — TCP three-way, TLS 1.3 1-RTT, MQTT 5 CONNECT/CONNACK, SCTP four-way with the cookie — on a shared time axis so the shapes rhyme visually.
- A sliding-window animation strip showing bytes in flight, ACKs returning, and the window sliding forward; a second pane showing the window stalled at rwnd zero.
- A round-trip ladder comparing TLS 1.2 at two RTTs, TLS 1.3 at one RTT, QUIC at one RTT, and QUIC 0-RTT at zero RTTs, with a red caveat on the 0-RTT branch reading "idempotent only."
- An ECN packet diagram showing the 2-bit field marked CE by a router, echoed by the receiver, and the sender easing off — no packet drop in the picture.
- The CenturyLink Flowspec loop as a positive-feedback diagram with Cloudflare's 3.5 percent global traffic dip annotated on the side.

## Sources

- [Cloudflare — August 30th 2020 CenturyLink/Level(3) outage analysis](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)
- [ThousandEyes — CenturyLink / Level 3 Outage Analysis](https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis)
- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
