---
id: yakov-rekhter
type: pioneer
name: Yakov Rekhter
years: "c. 1950–"
title: Co-creator of BGP
org: IBM, Cisco, Juniper Networks
podcast_target_minutes: 6
protocols: [bgp]
categories: []
related_book_chapters:
  - layer-2-3-foundations/bgp
awards:
  - { name: "IEEE Internet Award", year: 2014, url: null }
image:
  src: null
  alt: Portrait of Yakov Rekhter, co-creator of the Border Gateway Protocol
  credit: null
visual_cues:
  - "Three paper napkins on a Texas hotel-restaurant table in January 1989, the first sketch of BGP drawn in ballpoint pen — autonomous-system numbers as circles, peering sessions as lines between them"
  - "Portrait composition: a network engineer at an IBM workstation in the late 1980s, RFC 1105 draft pages on the desk beside him"
  - "A modern internet-routing dashboard showing 975,000 IPv4 prefixes and 225,000 IPv6 prefixes — the global routing table BGP carries today"
  - "Side-by-side title pages of RFC 1105 (June 1989) and RFC 4271 (January 2006), both with Rekhter's name on the author line"
---

# Yakov Rekhter

## In one sentence
Yakov Rekhter is the engineer who, with Kirk Lougheed at lunch during an IETF meeting in Austin in January 1989, sketched the Border Gateway Protocol on three paper napkins — and then spent the next thirty-plus years authoring the RFCs that turned that sketch into the routing protocol the entire public internet still runs on.

## The hook (cold-open)
In January 1989, at the twelfth meeting of the Internet Engineering Task Force in Austin, Texas, two engineers took a lunch break and came back with a routing protocol drawn on three sheets of paper. Yakov Rekhter, then at IBM, and Kirk Lougheed, then at Cisco, called it the Border Gateway Protocol. Within six months it was published as RFC 1105. Today, every transit and peering relationship on the public internet is a BGP session — roughly 975,000 IPv4 prefixes and 225,000 IPv6 prefixes are exchanged across those sessions as of January 2026. The internet runs on a protocol Rekhter sketched on three napkins.

## The work

### Austin, January 1989 — the two-napkin protocol
The story is famous inside the routing world and worth telling cleanly. At the twelfth IETF meeting in Austin in January 1989, Rekhter and Lougheed sketched the Border Gateway Protocol over lunch on three sheets of paper — which is why the routing community calls it the "two-napkin protocol" even though the count was three. The mechanism — TCP-based sessions between autonomous systems exchanging path-vector reachability information — is the subject of the BGP episode, and we leave the unpacking there. The biographical point is that the design that came back from lunch was good enough to ship. RFC 1105 was published in June 1989, only five months after the sketch.

### The RFC line, 1989 to today
Rekhter has stayed on the author line of BGP's defining documents ever since. The current standard, RFC 4271, was published in January 2006 — seventeen years after Austin — and Rekhter is still on it. In between and after, he has shaped or co-authored most of the BGP extensions in production use, including BGP/MPLS IP Virtual Private Networks (RFC 4364) — the standard that turned BGP into the control plane for service-provider VPNs — and many of the EVPN drafts that extend the same machinery to layer-2 services. The BGP episode covers what those extensions actually do; the biography is that one engineer has been the through-line on the document set for more than three decades.

### IBM, Cisco, Juniper
Rekhter's industry affiliation moves through the companies that built the routers BGP runs on. He did the original BGP work at IBM. He was at Cisco for the period during which BGP went from a working sketch to the protocol every backbone deployed. He has been a Juniper Networks Fellow for the long arc of Juniper's existence — Juniper being the company built around the second large-scale router platform of the commercial-internet era. The dump does not detail the year-by-year transitions, so we leave it at the three names.

## Awards and recognition
Rekhter received the IEEE Internet Award in 2014 — the IEEE's recognition of contributions to the technical, standards, and operational advancement of internet technology. The citation tracks the obvious thing: BGP is the routing protocol of the public internet, and Rekhter is the through-line author on it.

## Where they appear in the book
- Part "Layer 2–3: Foundations," chapter "BGP" — the chapter on the path-vector routing protocol that runs every transit and peering relationship on the public internet, sketched on three napkins in Austin in January 1989 and still authored, decades later, by the same engineer.

## See also (other pioneer episodes)
BGP is the exterior routing protocol of the internet, and its companion on the interior side is OSPF. John Moy's pioneer episode covers OSPF — the link-state protocol that runs inside autonomous systems while BGP runs between them. Listened to back-to-back, the Rekhter and Moy episodes are the two halves of the routing story: Moy on what happens inside an autonomous system, Rekhter on what happens between them.

For the founding context that BGP arrived into — the IP layer the protocol carries reachability information about — Vint Cerf and Bob Kahn's pioneer episodes are the prequel.

## Sources

**Wikipedia**
- [Yakov Rekhter — Wikipedia](https://en.wikipedia.org/wiki/Yakov_Rekhter)
