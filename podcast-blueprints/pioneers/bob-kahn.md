---
id: bob-kahn
type: pioneer
name: Bob Kahn
years: "1938–"
title: Co-inventor of TCP/IP
org: DARPA, BBN
podcast_target_minutes: 6
protocols: [tcp, ipv4, ipv6]
categories: []
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
awards:
  - { name: "ACM Turing Award", year: 2004, url: null }
  - { name: "Presidential Medal of Freedom", year: 2005, url: null }
  - { name: "National Medal of Technology", year: 1997, url: null }
image:
  src: null
  alt: Portrait of Bob Kahn
  credit: null
visual_cues:
  - "Portrait composition: Kahn in the early 1970s at DARPA, sleeves rolled up, standing in front of a wall map with three differently coloured network clouds — ARPANET, a packet-radio network, and a satellite network — each connected by a small box labelled 'gateway'"
  - "A late-1972 napkin sketch on a desk: three heterogeneous networks meeting at a central gateway, with the words 'open architecture' written in the margin"
  - "Cover page of the May 1974 IEEE Transactions on Communications paper 'A Protocol for Packet Network Intercommunication' next to a BBN IMP photograph"
  - "Founding-day shot of the Corporation for National Research Initiatives in 1986: Kahn at a Reston, Virginia desk, a CNRI nameplate visible"
  - "Split image: a Turing Award medal on the left, a Presidential Medal of Freedom on the right, dated 2004 and 2005"
---

# Bob Kahn

## In one sentence
Bob Kahn is the engineer who, while running the ARPANET project at DARPA, conceived open-architecture networking and then co-wrote the 1974 paper with Vint Cerf that became TCP/IP.

## The hook (cold-open)
In late 1972, Bob Kahn was managing the ARPANET project at DARPA. He started sketching a different problem. Not how to make one packet network work — that one already did — but how to interconnect packet networks that did not look anything like ARPANET. Radio networks. Satellite networks. Eventually Ethernets. He recruited Vint Cerf to collaborate, and the architecture they wrote down became the internet.

## The work

### ARPANET at BBN and DARPA
Kahn's first stage was the ARPANET itself. He worked at BBN on the original network, then moved to DARPA to manage the program. By 1972 the ARPANET worked. The interesting question for him was the next one: what about the networks that were not ARPANET? We don't unpack the ARPANET story here — it has its own thread through the book — but it's the production he had already shipped before he started on the internet.

### Open-architecture networking, late 1972
This is the conceptual move the episode is built around. Kahn began sketching how to interconnect packet-switched networks that did not agree on packet sizes, addresses, or reliability guarantees. The networks were heterogeneous on purpose — radio, satellite, wired — and the architecture had to assume that. He called it open-architecture networking. He recruited Vint Cerf, then at Stanford, to work on it with him. There's a separate episode on Cerf, and the two careers are best heard together.

### The 1974 paper and the gateway architecture
The collaboration produced the May 1974 IEEE Transactions on Communications paper "A Protocol for Packet Network Intercommunication." That paper coined the word "internet" and specified what became TCP/IP. Kahn's specific contribution was the design at the gateways — the boxes we now call routers — and the principles that fell out: best-effort delivery in the network, end-to-end reliability at the hosts, and gateways that hide the differences between L2 networks from the endpoints above. We won't unpack the mechanism here. The TCP episode and the IPv4 episode each walk through what those protocols do on the wire.

### Corporation for National Research Initiatives, 1986
Kahn's third act was institutional. In 1986 he founded the Corporation for National Research Initiatives — CNRI — a non-profit in Reston, Virginia, focused on strategic development of network-based information technologies. He has run it ever since. The career has a clear shape: ship ARPANET, then design the architecture that made the internet possible, then build an institution to keep working on what comes next.

## Awards and recognition
Kahn shared the 2004 ACM Turing Award with Vint Cerf for the design of TCP/IP. He received the Presidential Medal of Freedom in 2005 and the National Medal of Technology in 1997.

## Where they appear in the book
- Part "Foundations," chapter "What Is a Protocol?" — the 1974 paper with Cerf is the canonical example of a protocol specification.
- Part "Foundations," chapter "The Layer Model" — TCP/IP is the layer model the chapter is built around, and Kahn's gateway architecture is what makes the layering work across heterogeneous networks.

## See also (other pioneer episodes)
Vint Cerf is the other name on the 1974 paper — there's a separate episode on him, and the Cerf and Kahn episodes are designed to be heard as a pair.

The TCP episode and the IPv4 episode each pick up where this one leaves off — what the protocols Kahn co-designed actually do on the wire, and how they evolved across the decades that followed.

## Sources

**Wikipedia**
- [Bob Kahn — Wikipedia](https://en.wikipedia.org/wiki/Bob_Kahn)
