---
id: john-moy
type: pioneer
name: John T. Moy
years: "1955–"
title: Principal architect of OSPF
org: Proteon, Cascade Communications, Ascend Communications, Lucent Technologies, Sycamore Networks
podcast_target_minutes: 6
protocols: [ospf]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of John T. Moy
  credit: null
visual_cues:
  - "A late-1980s Proteon router on a workbench in Westborough, Massachusetts, with a printed RFC 1131 draft beside it."
  - "A whiteboard sketch of a link-state topology graph with Dijkstra's algorithm worked out in marker."
  - "The two Addison-Wesley book covers — OSPF: Anatomy of an Internet Routing Protocol and OSPF Complete Implementation — stacked on a desk next to a terminal showing C++ source."
  - "An IETF working group meeting room circa 1995, name placards reading OSPF WG and MOSPF WG."
---

# John T. Moy

## In one sentence
John Moy is the engineer who wrote both the specification and one of the first implementations of OSPF, the link-state interior routing protocol that has run inside enterprise and ISP networks for more than thirty years.

## The hook (cold-open)
In 1989, from a desk at Proteon in Westborough, Massachusetts, John Moy published RFC 1131 — the first OSPF specification — and shipped working code for it in the same stretch of work. Nine years later he published the canonical version, RFC 2328, which the IETF promoted to Standard 54 and which is still the OSPF every router vendor implements today. Then, in case anyone wondered exactly how to build one, he wrote a book that included a complete C++ OSPF speaker as source code. That is roughly the most thorough one-person handover of a routing protocol the field has ever seen.

## The work

### Mathematics, then BBN
Moy took a B.S. in mathematics from the University of Minnesota and an M.A. in mathematics from Princeton. He started writing router software at Bolt Beranek and Newman — the same BBN that had built the original IMPs for the ARPANET. The mathematical training shows up later in OSPF, which is built around Dijkstra's shortest-path algorithm running over a synchronised topology database.

### Proteon and RFC 1131
From 1987 to 1989 Moy was at Proteon Inc. in Westborough, Massachusetts. There he did the two pieces of work that anchor the rest of his career. He wrote the OSPF specification, published as RFC 1131 in 1989, and he wrote one of the first OSPF implementations to run on Proteon's routers. We cover what OSPF actually does — every router building an identical topology database and then running Dijkstra to compute its own routing table — in the OSPF episode. The point for the biography is that the spec and a working implementation came out of the same hands at roughly the same time, which is why the protocol arrived stable.

### Chairing the working groups
Through the late 1980s and into the 1990s Moy chaired the IETF OSPF Working Group and the MOSPF Working Group, MOSPF being the multicast extension. Chairing both meant he carried the protocol through its revisions in public — collecting interoperability reports, settling design arguments, and steering the document toward something every vendor could ship.

### RFC 2328 and Standard 54
By April 1998 Moy was Senior Consulting Engineer at Ascend Communications, and that month the IETF published RFC 2328 — OSPF Version 2 — which became Standard 54. RFC 2328 is the document router vendors still implement; later RFCs add features but do not displace it. Getting a routing protocol to full Standard status in the IETF is rare, and OSPFv2 is one of the few that made it.

### Two books
In 1998 Moy published *OSPF: Anatomy of an Internet Routing Protocol* with Addison-Wesley — the protocol explained from the inside by the person who designed it. In 2000 he followed it with *OSPF Complete Implementation*, which goes further: the book ships a working C++ OSPF speaker as part of its content. Most protocol books explain; this one hands you the code.

### Cascade, Ascend, Lucent, Sycamore
Moy's industry path tracks the consolidation of the 1990s networking industry. Proteon to Cascade Communications, then to Ascend Communications, then into Lucent Technologies via Lucent's 1999 acquisition of Ascend, and finally to Sycamore Networks as a Corporate Fellow. The Corporate Fellow title at Sycamore is the recognition that, by then, OSPF had become infrastructure.

## Where they appear in the book
The dump lists no chapter cross-references for John Moy. The OSPF episode is the natural place to hear the protocol mechanics he designed.

## See also (other pioneer episodes)
OSPF sits inside the family of interior routing protocols, and its story runs alongside the BGP story on the exterior side — if you have not yet listened to the BGP episode, that is the natural companion for understanding why OSPF was scoped the way it was.

For the BBN lineage that Moy came out of, the pioneer episodes on the original ARPANET engineers — the people who built the IMPs Moy later wrote router software for — are the prequel to this one.

## Visual cues for image generation
- A late-1980s Proteon router chassis open on a workbench in Westborough, Massachusetts, with a printout of RFC 1131 next to it.
- A whiteboard with a link-state topology graph and Dijkstra's algorithm worked out by hand in blue marker.
- The two Addison-Wesley OSPF book covers stacked on a wooden desk, a terminal in the background showing C++ source for an OSPF speaker.
- An IETF working group meeting room in the mid-1990s, paper name placards on the table reading "OSPF WG" and "MOSPF WG".
- A portrait-style composition: an engineer at a CRT terminal in a Massachusetts office park, late 1980s.

## Sources

### Wikipedia
- [John Moy — Wikipedia](https://en.wikipedia.org/wiki/John_Moy)
