---
id: david-boggs
type: pioneer
name: David Boggs
years: "1950–2022"
title: Co-inventor of Ethernet
org: Xerox PARC, Digital Equipment Corporation
podcast_target_minutes: 6
protocols: [ethernet]
categories: []
related_book_chapters:
  - foundations/what-is-a-protocol
  - the-story-of-the-internet/before-the-internet
  - layer-2-3-foundations/ethernet
awards: []
image:
  src: null
  alt: Portrait of David Boggs
  credit: null
visual_cues:
  - "Portrait composition: a young engineer in the 1970s at Xerox PARC, oscilloscope on the bench, a length of yellow coaxial cable looped over his shoulder"
  - "The original PARC Ethernet diagram: Alto workstations tapped into a single coax run, '2.94 Mbps' lettered above the cable"
  - "Cover page of the May 1976 Communications of the ACM with the Metcalfe and Boggs Ethernet paper visible"
  - "A vampire tap clamped onto thick yellow Ethernet cable, soldering iron and a hand-wound transformer next to it on a PARC workbench"
---

# David Boggs

## In one sentence
David Boggs is the radio-engineer-turned-PARC-builder who, with Bob Metcalfe in 1973, designed and physically built the first Ethernet — a 2.94-megabit-per-second coaxial network that became the wired foundation of every office, data centre, and home in the world.

## The hook (cold-open)
Most people know the name Bob Metcalfe. The 1973 memo that sketched Ethernet has Metcalfe's name on it. But the working hardware — the transceivers, the interface boards, the timing — was built by his collaborator, David Boggs. Boggs was the engineer at the soldering iron. Without him, Ethernet is a memo. With him, it is the cable that connected the first Alto workstations at Xerox PARC and, fifty years later, every server in every rack on Earth.

## The work

### Ethernet at Xerox PARC, 1973
Boggs co-invented Ethernet at Xerox PARC with Bob Metcalfe in 1973. The first version ran at 2.94 megabits per second over a single coaxial cable, and it was the network the Alto workstations talked over. Boggs designed and built much of the original PARC Ethernet hardware — not the abstract protocol, the actual electronics that put bits on the wire and pulled them back off. The protocol mechanics — framing, addressing, CSMA/CD, the move from coax to switched twisted pair — are the subject of the Ethernet episode. What matters here is that the working system existed because Boggs built it.

### The 1976 CACM paper
In May 1976, Boggs and Metcalfe published *Ethernet: Distributed Packet Switching for Local Computer Networks* in Communications of the ACM. That paper is how the rest of the world learned what Ethernet was. It is one of the most cited papers in the history of computer networking, and it set the template for what a local area network looked like — a shared medium, statistical access, no central controller. The chapter on what a protocol is and the chapter Before the Internet both reach back to this paper as a reference point.

### PARC Universal Packet
Beyond Ethernet, Boggs worked on PUP — the PARC Universal Packet architecture — an internetworking design that ran at PARC in parallel with the early TCP/IP work happening on the ARPANET. PUP was an end-to-end packet protocol that bridged Ethernet to other networks years before TCP/IP became universal, and many of the ideas it explored fed back into the wider internetworking effort.

### DEC and routing
After PARC, Boggs moved to Digital Equipment Corporation, where he worked on early routing systems during the period when commercial multi-vendor internetworking was first taking shape.

## Where they appear in the book
- The Foundations chapter What Is a Protocol? — the 1976 CACM paper is one of the touchstones for what a protocol specification looks like in the wild.
- The Story of the Internet chapter Before the Internet — Ethernet is the local-network half of the story that the ARPANET is the wide-area half of, and Boggs is on the PARC side of that picture.
- The Layer 2–3 Foundations chapter on Ethernet — the protocol he co-invented gets its full mechanism treatment there.

## See also (other pioneer episodes)
Ethernet's other co-inventor, Bob Metcalfe, is the partner half of this story — if there is a Metcalfe episode in this series, it is the natural next listen. On the Layer 2 side, Radia Perlman's Spanning Tree Protocol is the algorithm that made multi-switch Ethernet networks survive the move out of a single coaxial cable, and her episode picks up where this one leaves off.

## Sources

**Wikipedia**
- [David Boggs — Wikipedia](https://en.wikipedia.org/wiki/David_Boggs)
