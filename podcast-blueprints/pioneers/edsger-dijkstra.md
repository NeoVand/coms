---
id: edsger-dijkstra
type: pioneer
name: Edsger W. Dijkstra
years: "1930–2002"
title: Inventor of the shortest-path-first algorithm
org: Mathematisch Centrum, Eindhoven University of Technology, Burroughs, UT Austin
podcast_target_minutes: 6
protocols: [ospf]
categories: []
related_book_chapters: []
awards:
  - { name: "ACM Turing Award", year: 1972, url: null }
  - { name: "ACM PODC Influential-Paper Award (the Dijkstra Prize, named for him)", year: 2002, url: null }
image:
  src: null
  alt: Portrait of Edsger W. Dijkstra
  credit: null
visual_cues:
  - "Portrait composition: a thin man at a small Amsterdam café table in 1956, a single sheet of paper, a cup of coffee, a graph of weighted edges sketched in fountain pen"
  - "The opening page of Numerische Mathematik volume one, 1959, with the three-page paper 'A note on two problems in connexion with graphs' visible — a paper that does not name the algorithm it introduces"
  - "A blackboard at UT Austin in the 1990s covered in immaculate handwritten EWD-style notes, the number EWD 1036 in the corner"
  - "An OSPF link-state database on a router console on the right of the frame, the same graph from the café table on the left, an arrow between them"
---

# Edsger W. Dijkstra

## In one sentence
Edsger Dijkstra is the Dutch computer scientist who, in twenty minutes at an Amsterdam café table in 1956, invented the shortest-path algorithm that every OSPF router on the internet still runs every time the topology changes.

## The hook (cold-open)
In 1956, sitting in a café in Amsterdam with his fiancée and no pencil, Edsger Dijkstra worked out in his head an algorithm to find the shortest path through a graph. He published it three years later as a three-page note in the first volume of Numerische Mathematik. The paper does not even give the algorithm a name. Seventy years on, that algorithm is the computational core of every link-state routing protocol on the internet.

## The work

### The shortest-path algorithm — Amsterdam, 1956
Dijkstra was working at the Mathematisch Centrum in Amsterdam when he designed what is now universally called Dijkstra's algorithm. It was published in 1959 as "A note on two problems in connexion with graphs" in Numerische Mathematik, volume one, pages 269 to 271. Three pages. No name for the algorithm. The interesting fact for this episode is not how the algorithm works — that belongs in the OSPF episode — but what it became. Every link-state routing protocol on the internet is built on it. OSPF runs it. IS-IS runs it. ATM's PNNI ran it. Modern segment-routing Flex-Algo planes still run it under the hood. When a link flaps anywhere in a large network and every router recomputes its routing table, the computation is Dijkstra's.

### Programming as an intellectual discipline
Dijkstra's networking legacy is the algorithm, but his career was much broader, and the Turing Award citation captures the breadth. He wrote the THE multiprogramming operating system. He invented semaphores, the synchronisation primitive that makes concurrent programming tractable. He published "Go To Statement Considered Harmful" as a letter to the Communications of the ACM in March 1968 — three pages that reshaped how a generation of programmers thought about control flow. He developed guarded commands and was one of the founders of structured programming. The throughline is the insistence that programs should be composed correctly from the start, not debugged into correctness afterwards.

### Eindhoven, Burroughs, and UT Austin
Dijkstra moved from the Mathematisch Centrum to Eindhoven University of Technology, then to Burroughs Corporation as a research fellow, and in 1984 to the University of Texas at Austin, where he held the Schlumberger Centennial Chair in Computer Sciences until his death on the sixth of August 2002. The Austin years produced the long sequence of handwritten technical notes — the EWDs, numbered into the thousands — that are now archived and read as a literature of their own.

## Awards and recognition
Dijkstra received the ACM Turing Award in 1972, with a citation that reads, in part, "for fundamental contributions to programming as a high, intellectual challenge; for eloquent insistence and practical demonstration that programs should be composed correctly, not just debugged into correctness." After his death, ACM's Symposium on Principles of Distributed Computing renamed its influential-paper award the Dijkstra Prize in his honour.

## Quotes
"Computer science is no more about computers than astronomy is about telescopes." Widely attributed to Dijkstra and consistent with the position he argued across the EWD notes — that the discipline is about the structure of computation, not the machines that happen to perform it. It is the line of his that has travelled furthest outside the field.

## Where they appear in the book
The dump lists no specific chapters that reference Dijkstra by name. The natural place for him in the book is wherever link-state routing comes up — that is the OSPF episode's territory.

## See also (other pioneer episodes)
The most direct cross-promo is to the OSPF episode itself, which is where Dijkstra's algorithm earns its keep on the modern internet. From there, the Radia Perlman episode is the obvious next stop — Perlman built Spanning Tree at Layer 2 and contributed to IS-IS, the other major link-state protocol that runs Dijkstra's algorithm — and the John Moy episode covers the engineer who turned the algorithm into the OSPF specification the IETF actually shipped.

## Sources

**Wikipedia**
- [Edsger W. Dijkstra — Wikipedia](https://en.wikipedia.org/wiki/Edsger_W._Dijkstra)

**Quotes**
- [Edsger W. Dijkstra — Wikiquote](https://en.wikiquote.org/wiki/Edsger_W._Dijkstra)
