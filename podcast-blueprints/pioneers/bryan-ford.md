---
id: bryan-ford
type: pioneer
name: Bryan Ford
years: "1973–"
title: NAT-traversal academic anchor; P2P researcher
org: EPFL DEDIS Lab, formerly Yale
podcast_target_minutes: 6
protocols: [stun-turn-ice]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Bryan Ford
  credit: null
visual_cues:
  - "Portrait composition: a researcher at a whiteboard at EPFL, two stick-figure peers behind cartoon home routers connected by an arc labelled 82% UDP / 64% TCP"
  - "Diagram of UDP hole punching: two NATs back to back, a rendezvous server in the middle, dotted lines showing the simultaneous outbound packets that open the pinhole"
  - "Cover page of the 2005 USENIX ATC paper Peer-to-Peer Communication Across Network Address Translators, with Ford, Srisuresh and Kegel as authors, lying next to printed RFC 5128"
  - "A second panel showing the EPFL DEDIS lab today: a byzantine consensus diagram and a privacy-preserving protocol sketch on adjacent monitors"
---

# Bryan Ford

## In one sentence
Bryan Ford is the researcher whose 2005 USENIX paper turned NAT hole punching from folklore into a measured, citable technique — and produced the 82-percent UDP and 64-percent TCP success numbers that the rest of the field has been arguing with ever since.

## The hook (cold-open)
For most of the 2000s, two computers behind home routers could not reliably talk to each other directly. The conventional wisdom was a taxonomy of NAT flavours — full cone, restricted cone, port-restricted, symmetric — and a folklore of tricks for getting around them. In 2005, Bryan Ford, Pyda Srisuresh, and Dan Kegel published a paper at USENIX ATC that actually measured how often the tricks worked. The numbers — 82 percent for UDP, 64 percent for TCP — destroyed the four-flavours model and became the academic anchor for everything that followed, including the protocols we cover in the STUN, TURN, and ICE episode.

## The work

### Peer-to-Peer Communication Across NATs — USENIX ATC, 2005
The paper Ford co-authored with Srisuresh and Kegel is the canonical academic reference for NAT traversal. It did two things at once. It described the hole-punching technique cleanly — two peers behind NATs each send outbound packets to each other through a rendezvous server, opening matching pinholes in their respective routers — and then it actually tested it across a large sample of NATs in the wild. The 82-percent-UDP, 64-percent-TCP numbers are still the figures people cite. The mechanism itself lives in the STUN, TURN, and ICE episode; what matters for the biography is that this paper is the one that made the technique respectable.

### STUNT and TCP hole punching
Ford's follow-up work extended hole punching to TCP, which is harder than UDP because the operating system stack is involved in connection setup and the NATs treat SYN packets specially. The STUNT toolkit was the demonstration that TCP hole punching could be made to work in practice, and it fed directly into the IETF's standardisation effort.

### RFC 5128 and RFC 5382, 2008
With Saikat Guha — there is a separate episode on him — Ford co-authored RFC 5128, *State of Peer-to-Peer Communication Across Network Address Translators*, which is the IETF's survey of the problem and the techniques. He also co-authored RFC 5382, the behavioural requirements document that tells NAT vendors what their boxes have to do for TCP traversal to be possible at all. Together those two RFCs took the academic measurements and turned them into a standards-track expectation.

### EPFL DEDIS, present day
Ford is now a professor at EPFL, where he leads the DEDIS lab — Decentralized and Distributed Systems. The current work is on scalable byzantine-fault-tolerant systems and privacy-preserving protocols, a long way from home-router NATs but in the same intellectual neighbourhood: how do you get mutually-distrusting machines on the open internet to cooperate without a central authority.

## See also (other pioneer episodes)
Saikat Guha is the obvious next listen — he co-authored RFC 5128 with Ford and worked on the same NAT-traversal problem from the measurement and standards side. Beyond that, the STUN, TURN, and ICE episode is where the protocol mechanics this paper underwrote actually get explained.

## Sources

**Papers**
- [Peer-to-Peer Communication Across Network Address Translators — USENIX ATC 2005](https://bford.info/pub/net/p2pnat/)

**Wikipedia**
- [Bryan Ford — Wikipedia](https://en.wikipedia.org/wiki/Bryan_Ford_(computer_scientist))

**Homepage**
- [bford.info — Bryan Ford's homepage](https://bford.info/)
