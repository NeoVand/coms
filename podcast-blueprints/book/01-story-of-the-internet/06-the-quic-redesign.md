---
id: the-quic-redesign
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The QUIC Redesign
synopsis: Pulling reliable transport into user space and folding TLS into it.
podcast_target_minutes: 15
position_in_book: 16 of 84
listening_order:
  prev: story-of-the-internet/mobile-and-bufferbloat
  next: story-of-the-internet/the-ai-agent-layer
related_protocols: [tcp, mptcp, quic, udp, tls, http3, ip, sctp, rtp]
related_pioneers: [jim-roskind]
related_outages: []
related_frontier: []
related_rfcs: [9000, 4960]
images: []
visual_cues:
  - "A cross-section diagram of a packet on the wire: outer UDP header (kernel-visible, opaque), then an encrypted QUIC packet inside, with TLS 1.3 keys, streams, and acknowledgements all sealed under the crypto envelope."
  - "Two stacks side by side. Left: TCP plus TLS 1.3 — three round trips before the first byte of HTTP. Right: QUIC — one round trip, transport and crypto fused."
  - "A timeline: 2000 SCTP standardised, 2012 Roskind starts QUIC at Google, 2013 gQUIC in Chrome, 2016 IETF working group, May 2021 RFC 9000, 2025 — 35% of websites and 75% of Meta traffic on QUIC."
  - "A middlebox map of the public internet: NAT routers, firewalls, transparent proxies — every one of them happily forwarding UDP, every one of them dropping protocol number 132 (SCTP) on sight."
  - "An ossification chart: TCP options proposed since 2000 (TFO, MPTCP, SACK Permitted, Fast Open) with the years it took each one to reach 50% deployment."
---

# Part II, Chapter — The QUIC Redesign

## The hook

By 2012, TCP had a problem nobody could fix. The protocol was frozen in operating-system kernels and policed by every middlebox on the internet — every firewall, every NAT router, every transparent proxy inspecting and modifying its headers. Even Google could not roll out a new TCP feature in less than a decade. So a Google engineer named Jim Roskind made a different bet. Instead of fighting the middleboxes, he tunnelled a brand-new transport inside UDP — a protocol every box on Earth already had to forward unchanged — and put the whole thing in user space. The bet paid off. By 2025, QUIC carried thirty-five percent of all websites and over seventy-five percent of Meta's internet traffic.

## The story

### Why a New Transport in 2012

By 2012, TCP had ossified. The implementation lived inside operating-system kernels, which meant a fix had to wait for the next OS release. The headers travelled across firewalls, NAT routers, and transparent proxies that inspected every field and re-wrote anything they thought they understood. Anything you wanted to add — TCP Fast Open, Multipath TCP, the SACK Permitted option — had to survive being mangled by every intermediate device on the planet. Even Google, with its enormous deployment leverage, could not roll out new TCP features in less than a decade.

Jim Roskind started the QUIC project at Google in 2012 on a radically different premise. Instead of fighting the middleboxes, QUIC would tunnel a brand-new transport inside UDP datagrams. Middleboxes already had to forward UDP unchanged, so the new protocol could ride underneath their inspection. Inside the tunnel, three big things changed at once. The TLS 1.3 handshake fused with the transport handshake, so a secure connection came up in a single round trip instead of three. Streams were sequenced independently, which eliminated the head-of-line blocking that plagued HTTP/2 over TCP — one lost packet no longer froze every other request on the connection. And the entire protocol lived in user space, where applications could ship improvements monthly instead of waiting on the kernel.

The standardisation took the rest of the decade. RFC 9000 froze QUIC in May 2021 — substantially redesigned from Google's gQUIC of 2013, but recognisable as the same architecture. HTTP/3 — HTTP carried over QUIC — became the default transport choice for most large platforms. By 2025, QUIC carried roughly thirty-five percent of all websites and over seventy-five percent of Meta's internet traffic. The mechanism details — how the 1-RTT handshake works, how connection migration survives a Wi-Fi-to-cellular handover, how the streams interleave — are the QUIC episode's job. What matters here is the architectural move. Ossification, finally, has a release valve. The same envelope now carries multipath QUIC, RTP-over-QUIC for live media, and HTTP/3 datagrams.

### Why UDP, Not a New Protocol Number

The decision to tunnel inside UDP rather than ship as a new IP protocol number was the most important deployment choice QUIC made — and it cuts against the architectural instinct of every transport designer who came before.

A new IP protocol number would have been the cleaner answer. SCTP — the Stream Control Transmission Protocol, standardised in RFC 4960 in 2007 — got one. SCTP is the better transport on paper. Multi-streaming inside a single connection, multi-homing across network interfaces, message-oriented framing instead of TCP's byte stream. It was designed for telecom signalling and runs everywhere inside 4G and 5G mobile cores. The full mechanism story belongs in the SCTP episode.

But SCTP cannot traverse the public internet. Middleboxes drop unknown protocol numbers, and SCTP packets between two hosts on different networks disappear within milliseconds. QUIC's designers had watched that play out for fifteen years. They picked UDP — a protocol every NAT, firewall, and middlebox already forwarded unchanged — and accepted the cost of putting a fully-encrypted reliable transport inside it. The cost was real. Every byte of a QUIC packet is processed in user space; the kernel sees only opaque UDP. But the benefit was deployment, and deployment is what the whole story turns on.

The structural lesson here is the lesson of the late-2010s protocol-design era. Encryption is what keeps a protocol evolvable, because encrypted bytes look like noise to the middleboxes that would otherwise ossify them. UDP is what makes that encryption deployable, because UDP is the one transport every box on the planet has to forward without looking. Anything not encrypted gets ossified by middlebox inspection within a decade. Anything not on UDP cannot traverse the deployed internet. Future transports — multipath QUIC, RTP-over-QUIC, the Media-over-QUIC live-streaming work — all sit inside the same envelope for the same reasons.

## The figures

### Jim Roskind

Roskind designed and championed QUIC at Google starting around 2012. The original name was Quick UDP Internet Connections, and the original premise was a sentence long: UDP passes through every middlebox; layer reliability, multiplexing, and crypto on top of it in user space; iterate as a browser update instead of a kernel upgrade. Google deployed gQUIC in production from 2013 onwards — every Chrome talking to every Google property over the new transport, in flight, before a single RFC existed. The IETF QUIC working group chartered in 2016 and shipped RFC 9000 in May 2021. HTTP/3 followed in RFC 9114 in June 2022 and made QUIC the default modern transport for the web. By 2025, around thirty-five percent of the top ten million sites support HTTP/3 and Meta reports more than seventy-five percent of its internet traffic on QUIC. There is a separate episode on Roskind.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport

Published in May 2021, edited by Jana Iyengar and Martin Thomson. Proposed Standard. The document is the canonical specification for QUIC — connection IDs, paths and migration in section five; loss recovery and congestion control in section thirteen; the long and short packet header formats in section seventeen. It is the working group's substantially redesigned successor to Google's gQUIC, and it is the standard that turned QUIC from a Google protocol into the modern web's default transport.

### RFC 4960 — Stream Control Transmission Protocol

Published in 2007, edited by Randall Stewart. Now Historic, obsoleted by RFC 9260. RFC 4960 specified SCTP — the multi-streaming, multi-homing, message-oriented transport that, on paper, was everything TCP wasn't. The protocol shipped, the standard was clean, and middleboxes refused to forward it. QUIC's designers used SCTP's fifteen-year deployment failure as the evidence base for their UDP decision.

## What you'd see in the simulator

Press Play on the QUIC simulation and you'll see the move that the whole chapter is about. The client sends a single Initial packet over UDP — and inside that one packet sits a TLS 1.3 ClientHello. The server replies with its own Initial carrying a ServerHello, its certificate, and the keys to derive a shared secret. One round trip later, the connection is up and encrypted. The first byte of HTTP can flow on the very next packet. A returning client can do it in zero round trips, replaying a session ticket from the previous connection.

The contrast to imagine is the TCP plus TLS path the QUIC episode unpacks in detail. There, the client first does a three-way TCP handshake — SYN, SYN-ACK, ACK — and only then begins a separate TLS handshake on top. Three round trips before the first byte of application data. QUIC fuses the two into one. That single fusion is the visible, on-the-wire shape of the architectural bet.

## What it taught the industry

Three things are now load-bearing in the way new transports get designed.

**Ship in user space, or don't ship.** Before QUIC, the assumption was that transport protocols live in the kernel because that's where the performance is. After QUIC, the assumption flipped. Putting the protocol in user space is what allowed Chrome and Meta to iterate gQUIC monthly while the IETF was still chartering the working group. The performance penalty turned out to be manageable; the deployment penalty of being in the kernel turned out to be lethal. Every transport innovation since — multipath QUIC, Media-over-QUIC, HTTP/3 datagrams — has shipped in user space first and asked questions about kernel offload later.

**Encrypt the protocol headers, or watch them ossify.** The lesson SCTP taught by failing, QUIC ratified by succeeding. Anything a middlebox can read, a middlebox will eventually depend on; anything a middlebox depends on, the protocol can no longer change. QUIC encrypts almost everything past the first few bytes — even most of the packet number is hidden under header protection. That's not paranoia. That's how the protocol stays evolvable for the next thirty years.

**UDP is the new IP.** For deployment purposes, the IP layer is no longer the universal substrate. UDP is — because UDP is the only thing the deployed middlebox fleet will reliably forward without inspection. That reframing is why every serious new transport since 2018 — multipath QUIC, MoQ, the WebTransport API — sits inside UDP rather than asking for a new protocol number. The question stopped being *what's the cleanest layering* and started being *what survives contact with the production internet*.

## Listening order

- **Before this chapter:** *The Mobile and Bufferbloat Decade* — Wi-Fi, LTE, and oversized router buffers turning a 2010s smartphone into a worst-case network for TCP's loss-based assumptions. That chapter is the pressure that made the QUIC redesign worth doing.
- **After this chapter:** *The AI Agent Layer (2024–)* — once HTTP/3 over QUIC is the substrate, the next layer up is the agent-to-agent protocols built on top of it. The transport story hands off to the application story.

## Where to go deeper

- **The QUIC episode** is the mechanism deep-dive — the 1-RTT handshake, the 0-RTT replay path, connection IDs and migration, per-stream loss recovery, the packet header formats from section seventeen of RFC 9000.
- **The TCP episode** is the contrast study. Slow start, AIMD, CUBIC, BBRv3 as Google's default since 2023 — the algorithms QUIC inherits and the kernel-bound deployment story QUIC is escaping.
- **The UDP episode** explains why the eight-byte header that powers DNS lookups and VoIP calls turned out to be the universal envelope for the next generation of transports.
- **The TLS episode** covers the 1.3 handshake — the two-round-trip-to-one-round-trip simplification from 2018 that QUIC then fused with the transport setup.
- **The HTTP/3 episode** picks up where this chapter ends — same HTTP API on top, QUIC underneath, independent streams, the path to thirty-five percent of web traffic by 2025.
- **The SCTP episode** is the cautionary tale. The technically superior transport that middleboxes refused to forward — the fifteen-year deployment failure that taught QUIC's designers to pick UDP.
- **The MPTCP episode** is the parallel-universe answer to the same problem. Apple shipped Multipath TCP in iOS 7 in 2013 for Siri; Linux added native support in kernel 5.6 in 2020. Same goal — survive a Wi-Fi-to-cellular handover — different layer.
- **The RTP episode** is where the QUIC envelope meets real-time media. Timestamps, sequence numbers, payload-type identification — and now, increasingly, all of it carried inside QUIC instead of bare UDP.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
