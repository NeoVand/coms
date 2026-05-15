---
id: the-1986-collapse
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The 1986 Congestion Collapse
synopsis: 32 kbps to 40 bps in 400 yards — and Van Jacobson's six-algorithm fix.
podcast_target_minutes: 15
position_in_book: 12 of 84
listening_order:
  prev: story-of-the-internet/the-1981-burst
  next: story-of-the-internet/osi-vs-tcp-ip
related_protocols: [tcp, quic]
related_pioneers: [van-jacobson]
related_outages: [nsfnet-1986-collapse]
related_frontier: [l4s-comcast-launch]
related_rfcs: [5681]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg
    caption: Van Jacobson, who in 1988 wrote the six algorithms that ship in every operating system today.
    credit: Photo — Wikimedia Commons / public domain
visual_cues:
  - "Two graphs side-by-side: throughput between LBL and UC Berkeley before October 1986 (a flat line at 32 kbps) and after (a spiky drop to 40 bps). 1000× degradation labelled at the cliff."
  - "A diagram of the positive feedback loop — sender retransmits, queues fill, ACKs delay, sender retransmits more. Arrows looping back on themselves, getting redder with each cycle."
  - "A timeline showing congestion-control algorithms branching off Tahoe in 1988: Reno, NewReno, Vegas, CUBIC, Compound, BBR v1/v2/v3, Prague over L4S. The shape is a tree rooted in one paper."
  - "Three duplicate ACKs arriving back at a sender, each labelled 'Ack 1001', and the sender immediately retransmitting segment 1001 — the visual signature of fast retransmit."
  - "A photo of Van Jacobson at the chalkboard, with the SIGCOMM '88 paper title behind him."
---

# Part II, Chapter — The 1986 Congestion Collapse

## The hook

In October 1986, two computers four hundred yards apart at Berkeley tried to talk to each other. The connection had been running fine. Then, suddenly, it slowed to forty bits per second — about as fast as a person tapping Morse code. The early internet was collapsing under its own weight. Two engineers, Van Jacobson and Mike Karels, sat down to figure out why. The fix they shipped two years later is still inside every web page, every video, every message you load today.

## The story

### The First Collapse

The path was three hops long. Lawrence Berkeley Lab to UC Berkeley, three IMPs apart, less than four hundred yards of physical distance. Throughput should have been 32 kilobits per second. In October 1986 it dropped to 40 bits per second. A thousand-fold degradation across a four-hundred-yard hop, on a network that was *supposed* to be working.

The cause was TCP itself. Early BSD TCP retransmitted aggressively when acknowledgements were late — and as the network filled up, every retransmission added more load. Senders kept piling on. Queues kept growing. Acknowledgements kept arriving later, which made senders retransmit even more, which made queues grow even further. The internet had entered a positive feedback loop, and every cycle ran hotter than the last.

Van Jacobson and Mike Karels at Berkeley spent six months instrumenting the wire and reading the BSD source. Their 1988 SIGCOMM paper, *Congestion Avoidance and Control,* introduced **six algorithms in a single document**: slow start, AIMD congestion avoidance, fast retransmit, fast recovery, exponential RTO backoff, and a refined RTT estimator. The fixes shipped in 4.3BSD-Tahoe and propagated to every TCP implementation on Earth.

The deeper principle they articulated has held up for nearly forty years: **conservation of packets.** A sender should put one packet into the network only when an acknowledgement confirms a previous packet has left it. Everything since — including QUIC in 2021 and Google's BBR in 2016 — is variations on that theme.

### Why "Three Duplicate ACKs"?

One mechanical detail from the 1988 paper deserves a moment because it shows up in every TCP stack today. Jacobson's *fast retransmit* triggers when the sender sees **three duplicate acknowledgements** — three ACKs all naming the same next-expected-byte. Why three?

The intuition is reordering tolerance. A single duplicate ACK could just mean a packet was reordered by the network and arrived out of sequence. Two duplicates is suspicious but still possibly reordering. Three duplicates means the packet is almost certainly *lost*, not reordered — the receiver has seen three later packets without seeing the one in question. Jacobson chose three as the threshold that minimised false retransmits in the BSD measurements.

Forty years later, three duplicate ACKs is still the trigger. The number is hardcoded into RFC 5681 and every modern TCP implementation. CUBIC, BBR, NewReno — all of them inherit it unchanged. The mechanism is so universal that it has a name everyone knows — *fast retransmit* — and a paper-trail that runs back to a single 1988 design choice.

The 1986 collapse is the moment TCP went from working-most-of-the-time to *a protocol you could trust at scale*. Every later congestion-control algorithm — Reno, NewReno, Vegas, CUBIC, Compound, BBR v1/v2/v3, Prague over L4S — is a refinement of Jacobson's six. The branch point of the entire field is one paper.

## The figures

### Van Jacobson — who he is

A network researcher at Lawrence Berkeley Lab in the 1980s, later at Cisco, PARC, and Google. The 1988 SIGCOMM paper with Mike Karels is the most consequential thing he wrote, but not the only one — he also wrote `traceroute`, the Berkeley Packet Filter inside `tcpdump`, RFC 1144 (TCP/IP header compression for slow serial links), and three decades later co-authored the 2016 BBR paper at Google. ACM SIGCOMM Award 2001, IEEE Internet Award 2003. There is a separate episode on him.

### RFC 5681 — what's actually in it

Published in September 2009, *TCP Congestion Control,* by Mark Allman, Vern Paxson, and Ethan Blanton. It obsoletes RFC 2581 (1999) and codifies the four algorithms Jacobson introduced in 1988 — slow start, congestion avoidance, fast retransmit, fast recovery — into a single normative reference that every TCP implementation cites. Standards Track. The document is the canonical text on how TCP behaves under loss; everything else (CUBIC in RFC 9438, BBR drafts, L4S over TCP) extends or replaces specific pieces of it.

### The outage page entry

Conservation of packets and slow start are the *fix*. The *event* itself — the multi-week LBL-to-UCB collapse, the three-IMP-hop topology, the goodput numbers, the cascade of senders chasing late ACKs — has its own entry in the Famous Outages registry under *The 1986 Congestion Collapse*. If you want the wall-clock account or to see how it sits next to AS 7007, Facebook 2021, or SACK Panic, that's where to look.

### L4S — Comcast's January 2025 launch

L4S (Low Latency, Low Loss, Scalable throughput) is the next paradigm. Instead of inferring congestion from loss or RTT, cooperating senders mark packets with ECN; routers running the DualQ Coupled AQM put marked packets in a separate isolated queue and signal congestion *early*, before the queue grows. The result is sub-millisecond queuing latency at full link utilisation.

Comcast launched L4S in production in late January 2025 across six US metros — Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (MD), and San Francisco — with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S support in iOS 17, iPadOS 17, macOS Sonoma, and tvOS 17 back in 2023. The Frontier page has the full launch entry.

## What you'd see in the simulator

Press Play on the TCP simulation and you'll see the Berkeley story in miniature. The client sends SYN — a "knock on the door" with an initial sequence number. The server sends SYN-ACK, acknowledging the client's number and proposing its own. The client sends ACK, and both sides land in ESTABLISHED.

Then data flows. The client sends a segment, the server acknowledges it, and the sequence numbers tick forward. In a healthy network, that's the whole story. In the 1986 collapse, it wasn't — because if the ACK was late, the sender retransmitted, and if the network was already full, the retransmissions only made things worse. The simulation shows the happy path; what you have to imagine is what happens when every step gets fed back into the previous one a thousand times faster than it can drain.

## What it taught the industry

Three things are now permanent in the way networks are designed.

**Congestion control is not optional.** Before 1988, TCP had flow control — don't overflow the receiver — but no notion of *don't overflow the network*. After 1988, every reliable transport on Earth shipped with congestion control. Modern QUIC inherits the same algorithms; L4S evolves them with explicit signalling rather than inferred loss; but the assumption that *senders must back off when the network is full* is now load-bearing.

**Loss as a signal works, until it doesn't.** Jacobson's algorithms assumed packet loss meant congestion. That was true in 1988, when the wire was reliable and queues were small. By the 2010s — wireless networks losing packets to radio interference, fibre links with multi-megabyte buffers hiding loss for seconds — the signal got noisy. Google's BBR (2016) modelled the path's bottleneck bandwidth and minimum RTT directly instead of waiting for loss. L4S replaces loss entirely with explicit ECN marking. Each generation reduced the cost of being a good citizen on the internet.

**Code that has not changed in years is code that has not been re-tested in years.** This lesson came later — really after the 2019 SACK Panic disclosure — but the 1986 collapse is its first instance. The retransmit-on-timeout policy in BSD TCP had been working for years before it broke catastrophically under load. The Berkeley fix held for decades. The next big production breakages would also come from code paths nobody thought to question. Continuous fuzzing of network code is now standard; it is a direct descendant of the discipline 1986 forced.

## Listening order

- **Before this chapter:** *The 1981–83 Standardisation Burst* — RFC 791, 792, 793, the ARPANET flag day, IEEE 802.3 ratified. Three years that locked the stack in place. Without that consolidation, the 1986 collapse would have been one of many; with it, the collapse hit a single shared protocol that every host on Earth was running.
- **After this chapter:** *The OSI vs TCP/IP War* — by 1992, official opinion still held that TCP/IP would be replaced by OSI's seven-layer suite. The IETF answered with David Clark's "rough consensus and running code." The fact that Berkeley *shipped a fix* in 4.3BSD-Tahoe is part of why that line landed.

## Where to go deeper

- **The TCP episode** picks up the mechanism story — the header layout, the state machine, the full congestion-control toolkit, what it costs in production today. If you wanted the *why* of Berkeley's fix, this chapter; if you want the *how* of every TCP option in 2026, the TCP episode.
- **The QUIC episode** is the modern coda. Jim Roskind at Google, 2012, looked at TCP's accumulated middlebox damage and decided to rebuild reliable transport in user space on top of UDP. The 1988 algorithms travel forward — slow start, AIMD, BBR — but the ossification problem is finally addressed at the architectural level.
- **The chapter on the SACK Panic of 2019** is the corollary. A protocol option in widespread use for 23 years had a remote-trigger denial-of-service bug nobody noticed. Same protocol family, same lesson about complacency, thirty-three years later.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Jacobson — *Congestion Avoidance and Control* (SIGCOMM '88)](https://ee.lbl.gov/papers/congavoid.pdf)
- [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681)
- [RCR Wireless — Comcast launches L4S in production](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [Wikipedia — Congestive collapse](https://en.wikipedia.org/wiki/Network_congestion#Congestive_collapse)
