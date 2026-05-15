---
id: l4s-everywhere
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: L4S Everywhere
synopsis: Sub-millisecond queuing latency for cooperating flows — Comcast launched in production January 2025.
podcast_target_minutes: 15
position_in_book: 75 of 75
listening_order:
  prev: frontier/post-quantum
  next: frontier/ipv6-mostly
related_protocols: [ip, tcp, webrtc, rtp]
related_pioneers: []
related_outages: []
related_frontier: [l4s-comcast-launch, bbrv3-default]
related_rfcs: [9330]
images:
  - src: ""
    caption: "A dual-queue AQM in cartoon form. Classic packets line up in a long queue and wait for losses; ECT(1)-marked L4S packets ride in a short, isolated queue and get marked, not dropped."
    credit: ""
visual_cues:
  - "A timeline from 2010 to 2025 with five stations: Bufferbloat coined (2010), CoDel, FQ-CoDel, PIE, RFC 9330 published (January 2023), Comcast launch (January 2025)."
  - "A split-queue diagram. One lane labelled Classic, one lane labelled L4S. The L4S lane is short and the router stamps a small mark on each packet rather than dropping it."
  - "A US map with six city pins: Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville MD, San Francisco — each labelled Comcast L4S, January 2025. Logos for Apple, NVIDIA GeForce NOW, Meta and Valve in a row underneath."
  - "A latency-vs-utilisation chart. Classic congestion control climbs into seconds of queueing as utilisation passes 90 percent. L4S stays flat at sub-millisecond queueing all the way to 100 percent."
  - "A diagram of the IP header's two-bit ECN field. The codepoint 01 is highlighted as ECT(1), captioned: previously unused, repurposed by L4S as the cooperating-flow signal."
---

# Part XII, Chapter — L4S Everywhere

## The hook

For 35 years, congestion control on the internet has been loss-based. When a packet is dropped, the sender slows down. By the time the packet is dropped, the queue is already full and every packet behind it has been delayed. L4S inverts the model. In late January 2025, Comcast launched it in production across six US metros. Sub-millisecond queueing delay on a residential ISP. This is the chapter on what changes when the dominant signal stops being loss.

## The story

### The Problem Bufferbloat Created

The motivating problem for L4S is bufferbloat. Jim Gettys at Bell Labs coined the term in 2010 in an ACM Queue article after he measured 1.2-second latencies on his home links. Cheap memory had made router and modem queues huge, and full queues meant seconds of delay before any loss signal made it back to a sender. The community's response progressed in four steps. CoDel. FQ-CoDel. PIE. And then L4S.

The deeper problem is the signal itself. Loss-based congestion control works, but the cost is queueing delay. The sender finds out about congestion only after the queue is full enough to drop a packet, and by then every packet behind that drop is already late. Forty years of TCP performance work has been about smoothing the consequences of that single design choice. The mechanism story for how TCP actually responds to loss — slow start, AIMD, fast retransmit — is the TCP episode.

L4S, which stands for Low Latency, Low Loss, Scalable throughput, was published in January 2023 as three RFCs. RFC 9330 is the architecture. RFC 9331 specifies the ECT(1) signalling. RFC 9332 specifies the Dual-Queue Coupled AQM, the queue-management algorithm a router needs in order to participate. The three together invert the model.

### How L4S Works — The ECT(1) Repurpose

The mechanism is a single bit pattern in the IP header. ECN, Explicit Congestion Notification, has lived in the IP header since RFC 3168. It is a two-bit field, and the codepoint 01 — called ECT(1) — was effectively unused for two decades. L4S claims it. A cooperating sender marks every packet ECT(1). A router with L4S support sees the mark and puts the packet in a separate, isolated queue. When that queue starts to grow, the router stamps a congestion mark on the packets instead of dropping them. The sender reacts to the mark with paced back-off, not the half-the-window slash that loss triggers.

The result is sub-millisecond queueing delay even at 100 percent link utilisation, for flows that participate. Classic flows in the other queue see no degradation. It is the first congestion-control change that delivers an order-of-magnitude latency improvement without requiring every sender on the internet to upgrade in lockstep.

The reference scalable congestion control — the sender-side algorithm that produces well-behaved L4S flows — is TCP Prague. Apple shipped L4S support in iOS 17 and macOS Sonoma at WWDC in June 2023, and extended it to iPadOS 17 and tvOS 17 the same year. That was the first mass-market client deployment.

The headline news for the chapter is the network side. Comcast launched L4S in production in late January 2025, in six US metros — Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville Maryland, and San Francisco — with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. DOCSIS 4.0 cable modems are shipping L4S-capable AQM through 2024 and 2025. This is the first large-scale deployment of the L4S architecture on a production access network. There is a dedicated L4S launch entry on the Frontier page that records the rollout in detail.

### WebRTC, AI, and the Active Spread

The second front is real-time media. WebRTC field trials are live in Chromium behind two flags — `WebRTC-RFC8888CongestionControlFeedback/Enabled` and `WebRTC-Bwe-ScreamV2/Enabled`. Combined with the per-packet feedback that RFC 8888 carries inside RTCP, L4S delivers sub-1-millisecond queueing delay for cooperating real-time flows. The benchmark paper is "Performance Evaluation of L4S in XR Scenarios" at IFIP Networking 2025. The mechanism for how a WebRTC peer connection is set up and how RTP carries media is the WebRTC episode and the RTP episode respectively.

Apple also wired L4S signalling into the APIs surfaced through Network.framework, so apps inherit it without any code change. That is a deliberate strategy. New transport features have historically taken a decade or more to leak into application code. Putting the signal under the framework boundary skips the wait.

The unresolved political fight is L4S-versus-classic fairness. Scalable congestion control flows starve out CUBIC and Reno when they share a single FIFO queue, which is exactly why Dual-Queue AQM is required. The bottleneck has to classify and isolate. The BBRv3 community continues to publish papers on whether scalable and classic algorithms can ever share a single queue fairly. There is more on that thread in the BBRv3 frontier entry.

L4S deployment as of mid-2026 is infrastructure-shaped. Clients — Apple, Chrome WebRTC — and ISPs — Comcast on DOCSIS — are ahead of the middle of the network. The long pole is server-side ECN handling and CDN AQM upgrades. The next 24 months will tell whether L4S becomes the new default or stays a niche feature for cloud gaming and live media.

## The figures

### L4S Launches in Production at Comcast

January 2025. Comcast turns up L4S on production residential service in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville Maryland, and San Francisco. Launch partners are Apple, NVIDIA GeForce NOW, Meta, and Valve. The mechanism, end to end: cooperating senders mark packets ECN-Capable, routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient, senders react to marks like minor losses without backing off as hard. The result is bufferbloat avoided in real time — cloud gaming and video calls get the headroom they need without starving classic TCP. Apple shipped L4S support across iOS 17, iPadOS 17, macOS Sonoma, and tvOS 17 in 2023, on by default for QUIC in newer releases. The full record lives on the L4S launch entry on the Frontier page.

### BBRv3 Default for Google + YouTube

BBR — Bottleneck Bandwidth and Round-trip propagation time — is Google's congestion control. It abandons loss as the primary signal and instead models the path's bottleneck bandwidth and RTT. Cardwell, Cheng, Gunn, Yeganeh, and Jacobson published it at ACM Queue in 2016 and again in CACM in February 2017. BBRv1's gain over CUBIC was about 4 percent globally on YouTube, more than 14 percent in some countries, and a 33 percent reduction in median RTT. BBRv3 has been the default for google.com and YouTube traffic since 2023 and is the default on Google Cloud. It is now `draft-ietf-ccwg-bbr` inside the IETF's Congestion Control Working Group, with revisions -04 and -05 landing through 2025 and 2026. Available in Linux via `sysctl net.ipv4.tcp_congestion_control=bbr`, paired with the FQ qdisc that BBR pacing requires. The BBRv3 frontier entry has the full history.

### RFC 9330 — Low Latency, Low Loss, and Scalable Throughput (L4S) — Architecture

Published January 2023. Edited by Bob Briscoe and others. Informational status. It defines the L4S architecture: cooperating senders mark ECT(1), routers isolate and mark instead of drop, dual-queue coupling preserves classic-flow behaviour in the other queue. Companion documents RFC 9331 specify the ECT(1) signalling, and RFC 9332 the Dual-Queue Coupled AQM.

## What it taught the industry

For three and a half decades, every production congestion control algorithm read the same single-bit signal: loss. Tahoe, Reno, NewReno, Vegas, CUBIC. Even BBR, which models the path, still treats loss as the canonical event. L4S is the first time the industry has shipped an alternative signal that scales — explicit, per-packet, sub-RTT marking — and the first time a major residential ISP has deployed it. The lesson the rollout is teaching is that the network can carry a richer signal than loss if both endpoints and the bottleneck cooperate, and that the cost of cooperation can be hidden inside operating system frameworks rather than pushed onto application developers. Whether that lesson generalises to every CDN, every cloud, and every middlebox is the open question for the rest of the decade.

## Listening order

- **Before this chapter:** "Post-Quantum TLS" — the previous frontier entry, on the other industry-wide migration the next 24 months will decide.
- **After this chapter:** "IPv6-Mostly" — the next frontier entry, on the network-layer transition that finally has wind behind it.

## Where to go deeper

- The TCP episode picks up the mechanism story in full — slow start, AIMD, fast retransmit, and how CUBIC, BBR, and L4S Prague all fit on top of the same wire format.
- The IP episode covers the ECN field that L4S repurposes, and how the ECT(1) codepoint sits inside the eight bits that used to be Type of Service.
- The WebRTC episode covers the peer-connection setup that the L4S browser field trials are built on top of.
- The RTP episode covers the real-time media format whose RTCP feedback channel — extended by RFC 8888 — is what makes per-packet L4S marking actionable for video calls and cloud gaming.

## Visual cues for image generation

- A timeline from 2010 to 2025 with five stations: Bufferbloat coined (2010), CoDel, FQ-CoDel, PIE, RFC 9330 published (January 2023), Comcast launch (January 2025).
- A split-queue diagram. One lane labelled Classic, one lane labelled L4S. The L4S lane is short and the router stamps a small mark on each packet rather than dropping it.
- A US map with six city pins: Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville MD, San Francisco — each labelled Comcast L4S, January 2025. Logos for Apple, NVIDIA GeForce NOW, Meta and Valve in a row underneath.
- A latency-versus-utilisation chart. Classic congestion control climbs into seconds of queueing as utilisation passes 90 percent. L4S stays flat at sub-millisecond queueing all the way to 100 percent.
- A diagram of the IP header's two-bit ECN field, with the codepoint 01 highlighted as ECT(1), captioned: previously unused, repurposed by L4S as the cooperating-flow signal.

## Sources

- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [google/bbr GitHub repo](https://github.com/google/bbr)
- [IETF — draft-ietf-ccwg-bbr](https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/)
- [RFC 9330 — L4S Architecture](https://datatracker.ietf.org/doc/rfc9330/)
