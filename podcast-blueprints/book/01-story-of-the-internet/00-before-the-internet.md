---
id: before-the-internet
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: Before the Internet
synopsis: Xerox PARC, ARPANET, NCP — the three streams that flowed into TCP/IP.
podcast_target_minutes: 15
position_in_book: 10 of 84
listening_order:
  prev: foundations/ai-protocols
  next: story-of-the-internet/the-1981-burst
related_protocols: [ethernet, tcp, ip]
related_pioneers: [bob-metcalfe, david-boggs, vint-cerf]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/A_sketch_of_the_ARPANET_in_December_1969.png/500px-A_sketch_of_the_ARPANET_in_December_1969.png
    caption: A December 1969 sketch of the ARPANET — the four-node network that became the internet. UCLA, SRI, UCSB, and Utah; one IMP per site.
    credit: Image — DARPA / public domain, via Wikimedia Commons
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg/500px-Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg
    caption: An original BBN Interface Message Processor — the rugged minicomputer that served as ARPANET's first router. The protocol that ran between IMPs is what TCP/IP would later replace.
    credit: Photo — Erik Pitti, CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "A 1972 map of the United States with three overlays in different colors: ARPANET as a sparse cross-country backbone of about three dozen IMP sites, PRNET as a mobile radio cluster on the West Coast, SATNET as a transatlantic satellite hop. Each network labelled with its year of first traffic."
  - "A side-by-side schematic: on the left, the ARPANET model with hosts wired to IMPs and IMPs wired to each other; on the right, the PARC model with Alto workstations all hanging off a single coaxial cable, no central switch."
  - "A diagram of the question that produced the internet — a packet trying to hop from Ethernet to ARPANET to a satellite link, with three different framing formats and a thought bubble: 'who translates?'"
  - "A photo composite: Bob Metcalfe with the original 1973 Ethernet sketch, David Boggs at the PARC bench, Vint Cerf at a Stanford whiteboard. Captions include the key dates — 1973 for Ethernet, 1974 for the Cerf and Kahn paper."
  - "A timeline ribbon from 1969 to 1983 with three parallel tracks: ARPANET-with-NCP, PARC-with-Ethernet-and-PUP, and packet radio. All three converge on a single point labelled 'Flag Day, 1 January 1983 — TCP/IP cutover.'"
---

# Part II, Chapter — Before the Internet

## The hook

There was no single moment when the internet was invented. By 1972, three different networks were already running, each one solving a different piece of the problem, and only in retrospect do they look like one project. One was a wide-area research backbone wired together by refrigerator-sized routers. One was a coaxial cable on a single floor of a Xerox lab in Palo Alto. The third was a packet network on radios and satellites where the links flickered and the hosts moved. The internet is the name we gave to the layer that finally let those three talk to each other.

## The story

### Three Traditions, One Architecture

By 1972 there were three living networks worth talking about. The first was ARPANET, funded by DARPA and built by a Cambridge consultancy called BBN. It used the Network Control Program, NCP for short — a rigidly host-to-host protocol that assumed every node spoke the same language and trusted the IMPs, the Interface Message Processors, to deliver packets in order. ARPANET linked four sites at the end of 1969 — UCLA, SRI, UC Santa Barbara, and the University of Utah — and by 1972 it spanned dozens of universities and research labs.

The second tradition lived at Xerox PARC in Palo Alto. Bob Metcalfe and David Boggs were building Ethernet — a local-area network on coaxial cable where every host shouted onto the same wire and used carrier sensing to back off when collisions happened. The mechanism — frames, MAC addresses, CSMA/CD, the whole CSMA/CD story — is the second half of the Ethernet episode, so we'll skip it here. What matters for this chapter is the architectural idea that came with it. PARC ran a system called the PARC Universal Packet, PUP, on top of Ethernet, and PUP anticipated almost every architectural idea the internet would later canonise: variable-length packets, a thin internetworking layer, separate transport protocols above it.

The third tradition was packet radio. ARPA's Packet Radio Network, PRNET, came online in 1973. The Atlantic Packet Satellite Network, SATNET, followed in 1975. These networks had to deal with hosts moving around, links flickering on and off, and bandwidth that varied by orders of magnitude from one minute to the next. They could not assume an IMP-style fabric beneath them. The wire was not a wire.

That tension is what produced the internet. The question — how do you let a packet hop from Ethernet to ARPANET to a satellite link without any of them knowing about the others? — was the question Vint Cerf and Bob Kahn set out to answer in their 1974 paper. The mechanics of the answer they found, the split between an addressing layer and a reliability layer, are the subject of the IP episode and the TCP episode. The point of this chapter is that there was no obvious answer, because there was no obvious starting point. There were three.

### Why three? Because the problem was three problems

It is worth stopping on this for a moment, because it explains the shape of everything that came afterward. Local fabric, wide-area research backbone, and unreliable wireless each forced different design pressures. A protocol designed for a single coaxial cable in a Palo Alto lab did not have to think about routing or congestion. A protocol designed for thirty IMPs across the country did not have to think about a host that could disappear when its truck drove behind a hill. A protocol designed for a satellite hop did not have to think about microsecond-scale collisions on a shared bus.

The architecture that won — TCP/IP — is the one that took none of those three networks as canonical. Instead, it specified the gluing layer. It said: every network keeps doing whatever it does. We will define a packet format that all of them can carry, an address space that spans all of them, and a transport protocol on top that is robust to all of their pathologies. The thinness of that middle layer is the reason it survived. It did not pick sides.

## The figures

### Bob Metcalfe

Bob Metcalfe, born 1946, is the inventor of Ethernet. With David Boggs at Xerox PARC, he built the first 2.94 megabit-per-second Ethernet in 1973 to connect Alto workstations to laser printers. He co-authored the seminal paper *Ethernet — Distributed Packet Switching for Local Computer Networks* in *Communications of the ACM* in July 1976. In 1980 he co-authored the DIX specification with Digital, Intel, and Xerox, which the IEEE ratified as 802.3 in 1983. He founded 3Com in 1979 to commercialise Ethernet. Four decades later, every wired network on the planet — from a home router to an 800 gigabit-per-second AI training cluster — runs Ethernet at the link layer. His ACM Turing Award came in 2022.

### David Boggs

David Boggs, 1950 to 2022, co-invented Ethernet at Xerox PARC with Bob Metcalfe in 1973. He designed and built much of the original PARC Ethernet hardware — the actual coaxial-cable system that connected the Altos — and co-authored the 1976 CACM paper that introduced Ethernet to the world. He later worked on the PARC Universal Packet architecture and on early routing systems at DEC. The photographs of the first Ethernet bench almost always show his work.

### Vint Cerf

Vint Cerf, born 1943, is the co-inventor of TCP/IP. With Bob Kahn at DARPA, he designed the protocol suite that connected the three traditions this chapter has just walked through. Their 1974 paper *A Protocol for Packet Network Intercommunication*, in *IEEE Transactions on Communications*, coined the word *internet* — short for *internetworking of networks* — and described a single Transmission Control Program, which would later split into TCP and IP as separate layers. Cerf edited or co-edited many of the early TCP RFCs at Stanford with Yogen Dalal and Carl Sunshine, including RFC 675 in December 1974, the first detailed TCP specification. He continues to evangelise the internet as Google's Chief Internet Evangelist. Turing Award in 2004, Presidential Medal of Freedom in 2005.

## What it taught the industry

The lesson of this chapter is the lesson of the next twenty years of networking. The protocols that survive are the protocols that refuse to assume anything about the link beneath them. NCP welded itself to the ARPANET hardware — every node had to be an ARPANET node, with no way to bridge to other networks — and that is why NCP did not survive. Ethernet's PUP and the packet-radio experiments and ARPANET itself each made implicit assumptions about their substrate, and those assumptions are exactly the assumptions TCP/IP refused to make.

The ARPANET cutover from NCP to TCP/IP on Flag Day, 1 January 1983, is the moment the gluing layer won. It is also the subject of the next chapter but one. The chapters after this one trace how it actually happened — the standardisation burst from 1981 to 1983, the collapse of 1986, the OSI versus TCP/IP war that followed.

## Listening order

- **Before this chapter:** *Protocols for AI Agents* — the closing chapter of Part I sets up why protocol design still matters now, before we rewind to the 1970s for how it started.
- **After this chapter:** *The 1981–83 Standardisation Burst* — three streams converge into one published standard, on a deadline.

## Where to go deeper

- The Ethernet episode picks up the mechanism story — frames, MAC addresses, CSMA/CD, the move from shared coaxial bus to learning switches, and the run from 10 megabits per second up to 800 gigabits per second.
- The TCP episode covers the transport half of TCP/IP — connection setup, sequence numbers, retransmission, and the long line of congestion-control algorithms from Tahoe through CUBIC to BBR.
- The IP episode covers the addressing half — the 20-byte IPv4 header, TTL, fragmentation, the exhaustion of the 4.3-billion-address space, NAT, and the transition to IPv6.
- Bob Metcalfe and Vint Cerf both have their own pioneer episodes. David Boggs gets the co-credit he is owed in the Ethernet episode.

## Visual cues for image generation

- A 1972 map of the United States with three overlays in different colors: ARPANET as a sparse cross-country backbone of about three dozen IMP sites, PRNET as a mobile radio cluster on the West Coast, SATNET as a transatlantic satellite hop. Each network labelled with its year of first traffic.
- A side-by-side schematic: on the left, the ARPANET model with hosts wired to IMPs and IMPs wired to each other; on the right, the PARC model with Alto workstations all hanging off a single coaxial cable, no central switch.
- A diagram of the question that produced the internet — a packet trying to hop from Ethernet to ARPANET to a satellite link, with three different framing formats and a thought bubble: "who translates?"
- A photo composite: Bob Metcalfe with the original 1973 Ethernet sketch, David Boggs at the PARC bench, Vint Cerf at a Stanford whiteboard. Captions include the key dates — 1973 for Ethernet, 1974 for the Cerf and Kahn paper.
- A timeline ribbon from 1969 to 1983 with three parallel tracks: ARPANET-with-NCP, PARC-with-Ethernet-and-PUP, and packet radio. All three converge on a single point labelled "Flag Day, 1 January 1983 — TCP/IP cutover."
