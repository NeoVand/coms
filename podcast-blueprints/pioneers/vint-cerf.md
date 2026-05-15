---
id: vint-cerf
type: pioneer
name: Vint Cerf
years: "1943–"
title: Co-inventor of TCP/IP
org: Stanford, DARPA, Google
podcast_target_minutes: 6
protocols: [tcp, udp, ipv4, ipv6, icmp]
categories: []
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - story-of-the-internet/before-the-internet
  - layer-2-3/ipv4
  - utilities-security/ntp
awards:
  - { name: "ACM Turing Award", year: 2004, url: null }
  - { name: "Presidential Medal of Freedom", year: 2005, url: null }
  - { name: "IEEE Alexander Graham Bell Medal", year: null, url: null }
image:
  src: null
  alt: Portrait of Vint Cerf
  credit: null
visual_cues:
  - "Portrait composition: Cerf in his trademark three-piece suit, mid-1970s Stanford office, blackboard behind him with two cloud shapes labelled 'ARPANET' and 'PRNET' connected by a single arrow"
  - "Cover page of the 1974 IEEE Transactions on Communications paper 'A Protocol for Packet Network Intercommunication' on a desk, with the word 'internet' circled in red pen"
  - "Split image: a Stanford whiteboard from 1974 covered in the original Transmission Control Program sketch on the left, and the same diagram split into TCP and IP boxes on the right"
  - "RFC 675 printed and stapled, December 1974 cover sheet visible, sitting next to a stack of later RFCs"
  - "Modern Cerf at a Google podium with an 'Internet Evangelist' name badge, bridging the 1974 and present-day eras"
---

# Vint Cerf

## In one sentence
Vint Cerf is the engineer who, with Bob Kahn, wrote the 1974 paper that coined the word "internet" and specified the protocol that became TCP/IP.

## The hook (cold-open)
In May 1974, the IEEE Transactions on Communications published a paper titled "A Protocol for Packet Network Intercommunication." Two authors: Vint Cerf at Stanford and Bob Kahn at DARPA. The paper coined a word — "internet," short for "internetworking of networks." It also specified a single piece of software they called the Transmission Control Program, designed to glue heterogeneous packet-switched networks together. That program later split into two protocols. We call them TCP and IP.

## The work

### The 1974 paper with Bob Kahn
The paper is the founding document. Cerf and Kahn — there's a separate episode on Bob Kahn — set out to solve a specific problem: how do you connect packet-switched networks that don't agree on packet sizes, addresses, or reliability guarantees? Their answer was to put a thin layer above all of them that everybody could agree on. We won't unpack the mechanism here; the TCP episode and the IPv4 episode each walk through what TCP and IP actually do on the wire. The biographical fact to hold onto is that the word "internet" and the architecture behind it both come from this one paper.

### The early TCP RFCs at Stanford
Through the mid-1970s, Cerf edited or co-edited many of the early TCP RFCs at Stanford with Yogen Dalal and Carl Sunshine. The headline document is RFC 675, dated December 1974 — the first detailed TCP specification. The Transmission Control Program of the 1974 paper became the protocol stack the network actually ran on, and Cerf was at the centre of that turning specification into something engineers could implement.

### Chief Internet Evangelist at Google
Cerf is still working. He is Google's Chief Internet Evangelist, and has been for years — the title is literal, not ironic. He travels, testifies, advises, and continues to push for what comes next: more addresses, better reach, an internet that extends beyond Earth. The career has a clean shape: he co-designed the protocol, edited the spec, and then spent the rest of his life advocating for the thing he built.

## Awards and recognition
Cerf shared the 2004 ACM Turing Award with Bob Kahn for the design of TCP/IP. He received the Presidential Medal of Freedom in 2005, and the IEEE Alexander Graham Bell Medal for his work on the internet's foundational protocols.

## Where they appear in the book
- Part "Foundations," chapter "What Is a Protocol?" — the 1974 paper is the canonical example of a protocol specification.
- Part "Foundations," chapter "The Layer Model" — TCP/IP is the layer model the chapter is built around.
- Part "The Story of the Internet," chapter "Before the Internet" — Cerf and Kahn's work is the moment the story pivots from ARPANET to internet.
- Part "Layer 2–3," chapter "IPv4" — Cerf is co-author of the addressing system the chapter describes.
- Part "Utilities & Security," chapter "NTP" — Cerf appears in the broader cast of internet founders the chapter pulls from.

## See also (other pioneer episodes)
Bob Kahn is the other name on the 1974 paper — there's a separate episode on him, and the two careers are best heard together.

The TCP episode and the IPv4 episode each pick up where this one leaves off — what the protocols Cerf co-designed actually do on the wire, and how they evolved across the decades.

## Sources

**Wikipedia**
- [Vint Cerf — Wikipedia](https://en.wikipedia.org/wiki/Vint_Cerf)
