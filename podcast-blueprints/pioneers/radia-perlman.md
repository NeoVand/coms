---
id: radia-perlman
type: pioneer
name: Radia Perlman
years: "1951–"
title: Inventor of the Spanning Tree Protocol
org: Digital Equipment Corporation, Sun, Intel
podcast_target_minutes: 6
protocols: [ethernet, ospf]
categories: []
related_book_chapters:
  - how-to-learn-more/books
awards:
  - { name: "Internet Hall of Fame", year: 2014, url: null }
  - { name: "ACM SIGCOMM Award", year: 2010, url: null }
  - { name: "USENIX Lifetime Achievement Award", year: 2007, url: null }
image:
  src: null
  alt: Portrait of Radia Perlman
  credit: null
visual_cues:
  - "Portrait composition: engineer at a 1980s DEC workstation, a hand-drawn graph of a switched LAN topology on the whiteboard with redundant links crossed out into a tree"
  - "Diagram of a meshed Ethernet bridge network on the left, the same network reduced to a loop-free spanning tree on the right, an arrow between them labelled IEEE 802.1D 1985"
  - "Cover of the textbook Interconnections — Bridges, Routers, Switches and Internetworking Protocols — sitting on a shelf next to a stack of US patents"
  - "Handwritten verse on a yellow legal pad: 'I think that I shall never see / A graph more lovely than a tree' — the Algorhyme poem from the Spanning Tree patent"
---

# Radia Perlman

## In one sentence
Radia Perlman is the engineer who invented the Spanning Tree Protocol in 1985, the algorithm that quietly stops every multi-switch Ethernet network on Earth from broadcast-storming itself to death.

## The hook (cold-open)
Plug two Ethernet switches together with more than one cable and, without help, they will forward the same broadcast packet around the loop forever. The network melts. In 1985, at Digital Equipment Corporation, Radia Perlman wrote the algorithm that fixes that — the switches talk to each other, elect a root, and prune the redundant links into a tree. It became IEEE 802.1D. It is running, right now, in the closet of almost every building you have ever worked in.

## The work

### Spanning Tree Protocol — IEEE 802.1D, 1985
Perlman's central contribution is the Spanning Tree Protocol. The problem it solves is specific: redundant links between Ethernet bridges are necessary for reliability, but they create loops, and a Layer 2 loop has no TTL to kill it. STP makes the bridges discover the topology themselves, elect a root, and disable the links that would close a loop — without an operator drawing the map. The mechanism lives in the Ethernet episode; what matters for the biography is that the standard shipped as IEEE 802.1D and every backbone Ethernet network in the world has depended on it ever since.

### TRILL and IS-IS
Perlman later designed TRILL — Transparent Interconnection of Lots of Links — a successor that lets Layer 2 networks use all their links instead of pruning most of them away, by borrowing routing-style shortest-path computation. She also contributed to IS-IS, the link-state interior gateway protocol that Dijkstra-style routing protocols are built on. The OSPF episode covers the same family of ideas at the IP layer.

### Interconnections, the textbook
Her book *Interconnections: Bridges, Routers, Switches and Internetworking Protocols* is the standard reference for the bridging-versus-routing distinction — what belongs at Layer 2, what belongs at Layer 3, and why the answers are not always obvious. It is the book the chapter on books in the "How to Learn More" part points readers to.

### Patents
Perlman holds over a hundred patents across networking and security. The press has called her the "Mother of the Internet" for the loop-prevention work that made every multi-switch Ethernet possible.

## Awards and recognition
Perlman was inducted into the Internet Hall of Fame in 2014, received the ACM SIGCOMM Award in 2010, and was given the USENIX Lifetime Achievement Award in 2007.

## Quotes
"I think that I shall never see / A graph more lovely than a tree." Perlman wrote the verse — titled "Algorhyme" — and it was included in the Spanning Tree Protocol patent itself. It is the rare patent text that has been quoted at conference talks for forty years.

## Where they appear in the book
- Part "How to Learn More," chapter "Books" — *Interconnections* is on the recommended reading list as the canonical text on bridges, routers, and switches.

## See also (other pioneer episodes)
The Spanning Tree Protocol is the Layer 2 cousin of the link-state routing ideas that produced OSPF and IS-IS — the OSPF episode and the Ethernet episode are the two protocol episodes most worth queuing up after this one.

## Sources

**Wikipedia**
- [Radia Perlman — Wikipedia](https://en.wikipedia.org/wiki/Radia_Perlman)

**Other**
- [Algorhyme — the Spanning Tree poem from the patent](https://courses.cs.washington.edu/courses/cse461/14sp/lectures/spanningtreepoem.txt)
