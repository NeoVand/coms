---
id: van-jacobson
type: pioneer
name: Van Jacobson
years: "1950–"
title: Father of TCP Congestion Control
org: Lawrence Berkeley Lab, Cisco, PARC, Google
podcast_target_minutes: 8
protocols: [tcp]
categories: []
related_book_chapters:
  - foundations/reliability-speed
  - story-of-the-internet/the-1986-collapse
  - transport/tcp
  - realtime-av/rtp-and-rtcp
  - realtime-av/sip-and-sdp
  - how-networks-behave/congestion-history
  - how-to-learn-more/rfcs-to-read
awards:
  - { name: "IEEE Internet Award", year: 2003, url: null }
  - { name: "ACM SIGCOMM Award", year: 2001, url: null }
image:
  src: null
  alt: Portrait of Van Jacobson
  credit: null
visual_cues:
  - "Chalkboard covered in slow-start and AIMD equations, a sawtooth congestion-window plot drawn in chalk, late-1980s Berkeley office"
  - "Split-screen graph: throughput crashing from 32 kbps to 40 bps in October 1986, then climbing back up after the 4.3BSD-Tahoe fix"
  - "Stack of three artifacts on a desk — a printout of the SIGCOMM '88 paper, a tcpdump trace, and a 2016 BBR paper from Google"
  - "Portrait composition: engineer at a green-screen terminal, BSD source on screen, Lawrence Berkeley Lab badge clipped to shirt pocket"
---

# Van Jacobson

## In one sentence
Van Jacobson is the engineer who shipped the six algorithms that stopped the internet from collapsing in 1988, and then thirty years later shipped its replacement at Google.

## The hook (cold-open)
In October 1986, the link between Lawrence Berkeley Lab and UC Berkeley — about four hundred yards of cable — dropped from 32 kilobits per second to 40 bits per second. A factor of eight hundred. The internet was eating itself. Two years later, Van Jacobson and Mike Karels published a single paper with six algorithms in it, shipped them in 4.3BSD-Tahoe, and the collapse stopped. That paper is arguably the highest-leverage networking paper ever written.

## The work

### The 1988 SIGCOMM paper
The paper was called "Congestion Avoidance and Control." Jacobson and Karels at Lawrence Berkeley Lab put six things in it: slow start, AIMD — additive-increase, multiplicative-decrease — congestion avoidance, fast retransmit, exponential RTO backoff, and the connecting glue that made them all coexist inside one TCP sender. We won't unpack the mechanisms here — the TCP episode walks through what each of those does on the wire, and the chapter on the 1986 Congestion Collapse tells the story of the meltdown itself. What matters for the biography is this: the fixes shipped in 4.3BSD-Tahoe, every TCP stack on earth inherited them, and the internet kept working.

### The other tools
Jacobson didn't only write papers. He wrote traceroute — the tool every engineer reaches for when a packet doesn't come back. He wrote BPF, the Berkeley Packet Filter, which is the kernel hook tcpdump sits on, and which thirty-something years later became eBPF and ate observability. He co-authored RFC 1144, the spec for compressing TCP and IP headers down to a handful of bytes so dial-up SLIP links could carry interactive traffic. Three production artifacts that any working engineer has touched in the last week.

### The second act at Google
In 2016, Jacobson co-authored the BBR paper at Google — Bottleneck Bandwidth and Round-trip propagation time. BBR is congestion control for a second internet generation: it models the path instead of treating packet loss as the only signal. Google deployed it on google.com and YouTube, replacing CUBIC for that traffic. The detail to hold onto is the symmetry — the same engineer who wrote the algorithms that saved TCP in 1988 wrote the algorithms that replaced them, in production, at internet scale, in 2016.

## Awards and recognition
Jacobson received the ACM SIGCOMM Award in 2001 and the IEEE Internet Award in 2003 — both for the congestion-control work.

## Where they appear in the book
- Part "Foundations," chapter "Reliability vs Speed" — the trade-off the 1988 algorithms had to solve.
- Part "The Story of the Internet," chapter "The 1986 Congestion Collapse" — the meltdown and the six-algorithm fix; the centrepiece chapter for Jacobson.
- Part "Transport," chapter "TCP" — the protocol the algorithms live inside.
- Part "Real-time A/V," chapter "RTP and RTCP" — Jacobson is referenced in the lineage of real-time transport work.
- Part "Real-time A/V," chapter "SIP and SDP" — same lineage, different layer.
- Part "How Networks Actually Behave," chapter "A History of Congestion Control" — the long arc from Tahoe to Reno to CUBIC to BBR.
- Part "How to Learn More," chapter "RFCs Worth Reading" — RFC 1144 sits on that list.

## See also (other pioneer episodes)
The 1988 paper was a fix for a problem set up fifteen years earlier when TCP was first specified — see the TCP episode for the protocol itself, and the chapter on the 1986 Congestion Collapse for the surrounding cast.

The BBR work at Google is a second-generation answer to the same question CUBIC tried to answer — the chapter on the history of congestion control walks through the lineage if you want the other names in the room.

## Sources

**Wikipedia**
- [Van Jacobson — Wikipedia](https://en.wikipedia.org/wiki/Van_Jacobson)
