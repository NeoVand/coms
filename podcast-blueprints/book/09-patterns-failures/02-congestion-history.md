---
id: congestion-history
type: chapter
part_id: patterns-failures
part_label: X
part_title: How Networks Actually Behave
title: A History of Congestion Control
synopsis: Tahoe to Reno to CUBIC to BBR to L4S, in one sitting.
podcast_target_minutes: 15
position_in_book: 63 of 84
listening_order:
  prev: patterns-failures/failure-modes
  next: famous-outages/arpanet-1980
related_protocols: [tcp, quic]
related_pioneers: [van-jacobson]
related_outages: []
related_frontier: [bbrv3-default, l4s-comcast-launch]
related_rfcs: [9293, 5681, 9438]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg
    caption: Van Jacobson, whose 1988 SIGCOMM paper with Mike Karels gave the internet its first congestion control.
    credit: Photo — Wikimedia Commons / public domain
visual_cues:
  - "A horizontal timeline labelled 1988 / 1990 / 1996 / 1995 / 2008 / 2016 / 2023, with Tahoe, Reno, NewReno, Vegas, CUBIC, BBR, L4S as stations along the line."
  - "A four-panel diagram showing the four eras: react to loss, react to delay, model the network, use explicit signalling — each panel a different cartoon of a sender and a bottleneck queue."
  - "A cliff graph: throughput between LBL and UC Berkeley dropping from 32 kbps to 40 bps in October 1986. The numbers labelled large at either side of the cliff."
  - "A split queue diagram for L4S: one lane labelled Classic with a long line of packets, one lane labelled L4S with a short line of packets being marked, not dropped, by the router."
  - "A fairness scoreboard: BBR vs CUBIC sharing one bottleneck, with BBR's bar dwarfing CUBIC's — the heterogeneous-fairness problem in one image."
---

# Part X, Chapter — A History of Congestion Control

## The hook

The arc of congestion control runs through four eras: react to loss, react to delay, model the network, use explicit signalling. Each generation reduced the cost of being a good citizen on the internet. We are going to walk that arc end to end — from the October 1986 collapse that started it, through every algorithm that shipped in a major operating system, to the L4S launch on Comcast in January 2025. One sitting. One arc.

## The story

### The Pre-1988 Era — No Congestion Control At All

Before 1988, TCP had no congestion control at all. The original 1981 specification — the document that today's RFC 9293 supersedes — described flow control, which keeps a fast sender from overflowing a slow receiver. It said nothing about not overflowing the network itself.

That was fine while the internet was small. By 1986 it stopped being fine. In October 1986, throughput between Lawrence Berkeley Lab and UC Berkeley — three IMP hops apart — collapsed from 32 kilobits per second to 40 bits per second. A thousand-fold degradation. Senders kept retransmitting; the network melted.

Van Jacobson and Mike Karels at Berkeley spent six months instrumenting the wire and reading the BSD source. Their 1988 SIGCOMM paper, *Congestion Avoidance and Control,* was the inflection point. Six algorithms in one paper. It saved the internet. The wall-clock account of the collapse itself lives in the chapter on the 1986 event in the Story of the Internet part of the book — here, we are tracking what came after.

### Loss-Based Algorithms — The Long Lineage

**Tahoe, 1988.** Jacobson and Karels' original. Slow start that doubles the congestion window every round trip. Additive-increase, multiplicative-decrease congestion avoidance. Fast retransmit on three duplicate ACKs. Exponential backoff on the retransmission timer. It shipped in 4.3BSD-Tahoe — that is where the algorithm got its name. How the mechanism actually works is the second half of the TCP episode.

**Reno, 1990.** Added fast recovery. When fast retransmit fires, halve the congestion window instead of dropping it to one MSS. Less brutal on the sender; faster to recover.

**NewReno, 1996, codified later in RFC 5681.** Handles the case where multiple packets are lost from the same window without falling out of fast recovery prematurely. It was the Linux default until 2006.

**Vegas, 1995.** A different idea entirely. Proactive instead of reactive — monitor round-trip time directly, slow down when it starts climbing, signal congestion *before* loss happens. Brilliant in a homogeneous network. Terrible mixed with Reno: a Vegas flow always loses to a more aggressive Reno flow on the same bottleneck. It never deployed widely.

**CUBIC, 2008.** Replaces additive-increase's linear ramp with a cubic function of time since the last loss. Recovers throughput much faster on long fat pipes — gigabit transcontinental links and the like. It became the Linux default in 2.6 kernels and stayed there. Default in Windows since 2017, default on macOS too. Standards Track as RFC 9438 in August 2023, after fifteen years in production.

**Compound, 2007.** Microsoft's hybrid: combined loss-based and delay-based components. Used in Windows for a while, withdrawn in newer versions.

### Model-Based and Signal-Based — The New Paradigm

**BBR, Google, 2016.** Fundamentally different from everything before. Instead of treating loss as the only signal, BBR models the bottleneck bandwidth and minimum RTT directly, then paces packets at a rate just below the model. It is robust to the random-loss problem — the situation where CUBIC over-reacts because not every lost packet means the network is full. Google deployed BBR by default for google.com and YouTube outbound traffic from 2016. **BBRv3** has been the production default since 2023, and the Frontier page tracks its rollout across Google Cloud — most of v3's two-year engineering effort went into fairness with non-BBR flows on shared bottlenecks.

**L4S — RFCs 9330, 9331, and 9332, January 2023.** The next paradigm. Instead of inferring congestion from loss or RTT, use ECN as a per-packet explicit signal. Cooperating senders mark packets ECT(1); routers with L4S support put those packets in a separate, isolated queue and mark CE — congestion experienced — *early,* before the queue grows. Senders react with a paced back-off rather than a half-the-window slash.

The result is sub-millisecond queuing latency at 100% link utilisation, for flows that participate. Comcast launched L4S in production in late January 2025 across six US metros, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S support in iOS 17 and macOS Sonoma in 2023, default for QUIC in newer releases. The full launch entry sits on the Frontier page.

The arc again, in one line: react to loss, then react to delay, then model the network, then use explicit signalling. Each generation reduced the cost of being a good citizen on the internet.

### The unsolved problem — heterogeneous fairness

Every congestion-control algorithm is fair to itself. Mix BBR with CUBIC on a shared bottleneck and BBR takes the lion's share. Mix L4S with classic flows in the wrong queue and L4S starves. Each new algorithm has had to fight not just for raw performance but for *coexistence* with the deployed base — a constraint that consumes most of the engineering effort. BBRv3 spent two years on coexistence work before it was production-ready. The textbook says one algorithm; the real internet is always running five at once.

## The figures

### Van Jacobson

Born 1950. A network researcher at Lawrence Berkeley Lab in the 1980s, later at Cisco, PARC, and Google. After the October 1986 collapse, he and Mike Karels published *Congestion Avoidance and Control* at SIGCOMM in 1988 — slow start, AIMD congestion avoidance, fast retransmit, exponential RTO backoff. Six algorithms in one paper; arguably the highest-leverage networking paper ever written. Their fixes shipped in 4.3BSD-Tahoe and saved the internet. He also wrote `traceroute`, the Berkeley Packet Filter inside `tcpdump`, and co-authored RFC 1144 on header compression for low-speed serial links. Three decades later he co-authored the 2016 BBR paper at Google. ACM SIGCOMM Award 2001, IEEE Internet Award 2003. The next episode is about him.

### RFC 5681 — TCP Congestion Control

Published 2009. Standards Track. The normative reference that codifies slow start, congestion avoidance, fast retransmit, and fast recovery — the four algorithms Jacobson introduced in 1988 — into a single document every TCP implementation cites. It obsoleted RFC 2581. Everything else in this chapter — CUBIC, BBR, L4S over TCP — extends or replaces specific pieces of it.

### RFC 9438 — CUBIC for Fast and Long-Distance Networks

Published August 2023. Standards Track. Specifies the cubic-window growth function that has been the Linux default congestion control since the 2.6 kernel. It obsoleted RFC 8312. Fifteen years between the algorithm shipping in production and it earning a Standards Track number — a useful reminder of how the IETF and the deployed internet relate to one another.

### BBRv3 Default for Google + YouTube

The production status. Google's model-based congestion control replaced CUBIC for google.com and YouTube traffic from 2023, and is the default on Google Cloud. BBRv1's gain over CUBIC was about 4% globally on YouTube — more than 14% in some countries — and a 33% reduction in median RTT. BBRv3 is now `draft-ietf-ccwg-bbr` inside the IETF's Congestion Control Working Group. Available in Linux via `sysctl net.ipv4.tcp_congestion_control=bbr`, paired with the FQ qdisc that BBR's pacing requires.

### L4S Launches in Production at Comcast

Sub-millisecond queuing latency on a residential ISP. Comcast launched L4S in late January 2025 in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (Maryland), and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The mechanism: cooperating senders mark packets ECN-Capable; routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient; senders react to marks like minor losses without backing off as hard. Bufferbloat, avoided in real time.

## What it taught the industry

Three things are now permanent.

**Congestion control is not optional.** Before 1988, TCP had flow control but no notion of don't-overflow-the-network. After 1988, every reliable transport on Earth shipped with congestion control. QUIC inherits the same family of algorithms; L4S evolves them with explicit signalling rather than inferred loss; but the assumption that *senders must back off when the network is full* is now load-bearing.

**Loss as a signal works, until it doesn't.** Jacobson's algorithms assumed packet loss meant congestion. That was true in 1988, when the wire was reliable and queues were small. By the 2010s — wireless networks losing packets to radio interference, fibre links with multi-megabyte buffers hiding loss for seconds — the signal got noisy. BBR modelled the path's bottleneck bandwidth and minimum RTT directly instead of waiting for loss. L4S replaces loss entirely with explicit ECN marking. Each generation paid less of a tax for being polite.

**Coexistence is most of the work.** The textbook describes a single algorithm; the real internet runs five at once. Every new entrant — Vegas in 1995, BBR in 2016, L4S in 2023 — has had to prove not just that it is faster in a clean room but that it does not starve the algorithms already deployed. Vegas failed that test and never shipped widely. BBRv3 passed it after two years of engineering. L4S passes it by isolating its traffic in a separate queue at the router. The constraint shapes everything.

## Listening order

- **Before this chapter:** *Failure Modes* — the catalogue of how networks break in the wild. It sets up congestion collapse as one entry in a longer taxonomy of failure, so this chapter can focus on the one fix that became the template for the field.
- **After this chapter:** *ARPANET 1980 — The First Major Crash.* The opening of the Famous Outages part of the book. The 1980 ARPANET crash predates Jacobson's 1988 fix by eight years and is a useful reminder that the internet has been crashing in interesting ways for as long as it has existed.

## Where to go deeper

- **The TCP episode** picks up the mechanism story — how slow start actually doubles the window, how AIMD shapes a sawtooth, how fast retransmit detects loss in one round trip. If you wanted the *why* of each algorithm, this chapter; if you want the *how* of every TCP option in 2026, the TCP episode.
- **The QUIC episode** is the modern coda. QUIC inherits the same congestion-control family but lives in user space on top of UDP — which means new algorithms can ship without waiting for kernel updates. That is part of why BBRv3 and L4S can roll out as fast as they have.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [RFC 9293 — Transmission Control Protocol (TCP)](https://datatracker.ietf.org/doc/html/rfc9293)
- [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681)
- [RFC 9438 — CUBIC for Fast and Long-Distance Networks](https://www.rfc-editor.org/rfc/rfc9438.html)
- [google/bbr GitHub repo](https://github.com/google/bbr)
- [IETF — draft-ietf-ccwg-bbr](https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/)
- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [Wikipedia — Van Jacobson](https://en.wikipedia.org/wiki/Van_Jacobson)
