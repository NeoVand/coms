---
id: how-to-learn-more/rfcs-to-read
type: chapter
part_id: how-to-learn-more
part_label: XIII
part_title: How to Learn More
title: RFCs Worth Reading
synopsis: A guided tour with section pointers — the documents that pay back the time investment.
podcast_target_minutes: 12
position_in_book: chapter 80 of 75
listening_order:
  prev: frontier/wifi-7-and-8
  next: how-to-learn-more/books
related_protocols: [tcp, tls, quic, dns, bgp, http1, http2, http3]
related_pioneers: [eric-rescorla, van-jacobson]
related_outages: []
related_frontier: []
related_rfcs: [9293, 793, 8446, 9000, 1035, 1034, 4271, 5681, 9110]
images: []
visual_cues:
  - "A reading shelf with eight RFCs, each spine labelled with its number and protocol — 9293, 8446, 9000, 1035, 4271, 5681, 1958, 9110."
  - "The TCP state diagram from RFC 9293 §3.3.2 rendered as a metro map, with TIME_WAIT highlighted at the end of the line."
  - "A timeline from 1981 (RFC 793) to 2022 (RFC 9293), with TLS 1.3 in 2018 and QUIC in 2021 marked as inflection points."
  - "Two columns: TCP+TLS taking 2 round trips, QUIC doing the same in 1 RTT — stopwatches drawn next to each."
  - "A 7-page pamphlet labelled RFC 1958 next to a 100-page tome labelled RFC 9293 — the short ones often matter more."
---

# Part XIII, Chapter — RFCs Worth Reading

## The hook
If you read three RFCs in your career, read these. They are the documents that taught the rest of the field how to write protocols. Eight specs, forty years of engineering, and most of them are shorter than the post-mortems you have already read this week.

## The story

### A reading list, in order

The first one is RFC 9293, the 2022 update of TCP. It obsoletes RFC 793 — Jon Postel's original from 1981 — and folds in forty years of clarifications. TCP is the single most-implemented protocol on the internet. The sections worth your time are 3.4 on sequence numbers and reliability, 3.6 on connection close and TIME_WAIT, and 3.8 on flow control. The state machine in 3.3.2 is worth memorising. How the three-way handshake actually works, and why TIME_WAIT lasts roughly 60 seconds, is the territory of the TCP episode — read the spec, then listen there.

Next is RFC 8446, TLS 1.3, published in August 2018. This is modern crypto-engineering at its best. Eric Rescorla edited it across five years and 28 drafts, and his prose is the model for how to write a security spec. Read the entire handshake section. The formal-methods analysis appendices are optional. The mechanism — how the handshake collapses to one round trip and why the legacy_version field still says "TLS 1.2" on the wire — is the TLS episode.

RFC 9000 is QUIC, from 2021. It is the first transport designed in user space, and the place to see how the lessons of TCP's 40 years got applied. Read section 2.1 on streams, section 9 on connection migration, and the 0-RTT material. Why a phone keeps its connection alive when it switches from Wi-Fi to cellular — that is the QUIC episode.

RFC 1035 is DNS, from 1987. Forty years old, still the canonical reference. Read it together with RFC 1034 on concepts. Together they are about a hundred pages, and they explain a system that has scaled to a billion hostnames. Paul Mockapetris wrote both. The DNS episode covers the hierarchy, caching, DoT and DoH; the spec covers the wire format.

RFC 4271 is BGP-4, from 2006. The protocol that decides how packets reach which continent. Section 5, on path attributes, is where most of the engineering interest lives. The BGP episode covers eBGP versus iBGP, TCP port 179, and the kind of misconfiguration that took Facebook off the internet for six hours in October 2021.

RFC 5681 is TCP Congestion Control, from 2009. It codifies slow start, congestion avoidance, fast retransmit, and fast recovery — the four algorithms Van Jacobson introduced in 1988, formalised over two decades. The next episode is about Van Jacobson; the spec is the formal version of the paper.

Then there is RFC 1958, Brian Carpenter's seven-page summary of why the internet is the way it is. End-to-end principle, layering, robustness — all in one short document. If you only have an afternoon, read this one.

Finally, RFC 9110, HTTP Semantics, from 2022. It cleanly separates what HTTP means — verbs, headers, status codes, content negotiation — from how it is encoded on the wire. Reading this once makes HTTP/1.1, HTTP/2, and HTTP/3 all click. Roy Fielding, Mark Nottingham, and Julian Reschke edited it; it obsoletes six earlier RFCs in the 7230s. Sections 9.2.2 on idempotent methods and 12 on content negotiation are the ones to flag.

## The figures

### Eric Rescorla
Editor of TLS 1.3. Five years, 28 drafts, and a final spec that dropped insecure cipher suites, fused the handshake to one round trip, and made AEAD mandatory. He also designed the middlebox-compatibility hacks — the legacy_version field, the fake ChangeCipherSpec — that let TLS 1.3 deploy on the open internet despite roughly 3% of middleboxes parsing the version field. He wrote the standard practitioner's text, *SSL and TLS: Designing and Building Secure Systems*, in 2000, and continues to chair IETF working groups on TLS, OAuth, and encrypted DNS. He is the reason your browser's HTTPS handshake takes one round trip in 2026 instead of two.

### Van Jacobson
The man who saved the internet from congestion collapse. After the October 1986 collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley dropped from 32 kbps to 40 bps — Jacobson and Mike Karels published "Congestion Avoidance and Control" at SIGCOMM '88. Six algorithms in one paper: slow start, AIMD congestion avoidance, fast retransmit, exponential RTO backoff, and the rest. Their fixes shipped in 4.3BSD-Tahoe and saved the internet. He also wrote traceroute, the BPF that powers tcpdump, and co-authored RFC 1144. In 2016 he co-authored the BBR paper at Google — congestion control for a second internet generation, now the default for google.com and YouTube. The next episode is about him.

### RFC 9293 — Transmission Control Protocol (TCP)
The 2022 internet-standard update edited by Wesley Eddy at MTI Systems. It obsoletes seven earlier documents, including the original RFC 793 from 1981, and folds in forty years of errata and clarifications. Internet standard status.

### RFC 793 — Transmission Control Protocol
Jon Postel's original from 1981. Now historic, formally obsoleted by RFC 9293, but still the document where TCP first appeared in finished form.

### RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3
Eric Rescorla's 2018 proposed standard. Obsoletes three earlier RFCs including TLS 1.2. Notable sections include §5 on the Record Protocol, §7.1 on the HKDF key schedule, and §D.4 on the middlebox-compatibility hacks that make 1.3 look like 1.2 on the wire.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport
The 2021 proposed standard edited by Jana Iyengar and Martin Thomson. Notable sections include §5 on connections, connection IDs and migration; §13 on loss recovery and congestion control; and §17 on the long and short packet header formats.

### RFC 1035 — Domain Names — Implementation and Specification
Paul Mockapetris, 1987. Internet standard. The wire format and implementation half of DNS.

### RFC 1034 — Domain Names — Concepts and Facilities
Paul Mockapetris, 1987. Internet standard. The architecture half — read it before 1035.

### RFC 4271 — A Border Gateway Protocol 4 (BGP-4)
The 2006 standards-track update edited by Yakov Rekhter, Tony Li, and Susan Hares. Obsoletes RFC 1771. Section 5 on path attributes is the engineering heart.

### RFC 5681 — TCP Congestion Control
Mark Allman, Vern Paxson, and Ethan Blanton, 2009. Standards track. Obsoletes RFC 2581. The formal version of Jacobson and Karels's 1988 paper — slow start, congestion avoidance, fast retransmit, fast recovery.

### RFC 9110 — HTTP Semantics
Roy Fielding, Mark Nottingham, and Julian Reschke, 2022. Internet standard. Obsoletes six earlier RFCs in the 7230 series. Notable sections include §9.2.2 on idempotent methods like PUT, DELETE, and GET, and §12 on content negotiation.

## Listening order

- **Before this chapter:** "Wi-Fi 7 and 8" — closes the Frontier section by looking at where wireless is heading; this chapter pivots from frontier to canon.
- **After this chapter:** "Books" — once the specs are on your shelf, the next reading list moves to long-form treatments.

## Where to go deeper

The TCP episode picks up the mechanism story — sequence numbers, the three-way handshake, TIME_WAIT, the state machine. The TLS episode covers the 1-RTT handshake, AEAD, and why the wire still says 1.2. The QUIC episode walks through streams, connection migration, and 0-RTT. The DNS episode covers the resolver chain, DNSSEC, and DoH. The BGP episode covers eBGP versus iBGP, TCP port 179, and the Facebook outage of October 2021. The HTTP/1.1, HTTP/2, and HTTP/3 episodes cover what the semantics of RFC 9110 actually look like on the wire. And the next episode is about Van Jacobson — the engineer behind RFC 5681's algorithms and BBR.
