---
id: the-1981-burst
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The 1981–83 Standardisation Burst
synopsis: RFC 791/792/793, the ARPANET flag day, and IEEE 802.3 ratified — three years that locked in the stack.
podcast_target_minutes: 15
position_in_book: 11 of 84
listening_order:
  prev: story-of-the-internet/before-the-internet
  next: story-of-the-internet/the-1986-collapse
related_protocols: [ip, tcp, icmp, ethernet, udp, quic]
related_pioneers: [jon-postel]
related_outages: []
related_frontier: []
related_rfcs: [791, 792, 793, 9293]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Jonpostel.jpg/330px-Jonpostel.jpg
    caption: Jon Postel at USC ISI — RFC Editor for nearly three decades and editor of RFC 791, 792, and 793.
    credit: Photo — Wikimedia Commons
visual_cues:
  - "A timeline strip of 1980–1983 with five pins: UDP (RFC 768, August 1980), RFC 791 / 792 / 793 (September 1981), ARPANET flag day (1 January 1983), IEEE 802.3 ratified (1983). Each pin captioned with a one-line consequence."
  - "A before/after stack diagram: on the left, a single monolithic Transmission Control Program box bundling addressing, sequencing, flow control, retransmission. On the right, the split — IP as a thin layer below, TCP and UDP and ICMP all riding on top in parallel."
  - "A button with the slogan 'I survived the TCP/IP transition' rendered in 1983 graphic-design style — the actual artefact ARPANET operators wore after the cutover."
  - "A map of the roughly 400 ARPANET hosts on 31 December 1982, colour-coded green for converted and red for not-yet-converted, with a clock ticking down to midnight."
  - "A layered diagram showing the LAN/WAN seam: 802.3 Ethernet frames on the left, IP packets riding inside them, and a router on the right re-framing the same packet onto a long-haul link. A caption: 'forty-three years and counting.'"
---

# Part II, Chapter — The 1981–83 Standardisation Burst

## The hook

The flag day was a forcing function. There was no committee that could have produced a softer transition. NCP and TCP/IP had to coexist for as little time as possible, because every additional month of dual-stack maintenance was a month nobody was building anything new. So on 1 January 1983, the old protocol got switched off. Roughly four hundred hosts had to convert. The ones that missed the deadline simply lost connectivity.

## The story

### Three Years That Decided Everything

Between January 1980 and January 1983, the internet went from a research curiosity to a system you could rely on. The architectural decision had already been made — split the original combined Transmission Control Program into a thin internetworking layer, IP, underneath, and an end-to-end transport, TCP, above it. But the specifications still needed to harden, and a critical mass of hosts had to actually convert.

In September 1981, Jon Postel at USC's Information Sciences Institute shipped three RFCs in rapid succession: RFC 791 for the Internet Protocol, RFC 792 for ICMP, and RFC 793 for the Transmission Control Protocol. These are the documents the modern internet still cites. RFC 793 was the canonical TCP specification for the next forty-one years, until RFC 9293 obsoleted it in 2022.

On 1 January 1983, ARPANET executed its famous flag day. NCP — the Network Control Program that had run the network since 1970 — was switched off, and TCP/IP became the only protocol allowed on the wire. Roughly four hundred hosts had to convert. Sites that missed the deadline simply lost connectivity. Survivors got buttons reading I survived the TCP/IP transition. Most historians treat this date as the birthday of the modern internet.

In parallel, the IEEE 802.3 working group ratified its Ethernet standard, originally a Xerox/DEC/Intel collaboration. LAN technology and WAN technology now had a clean interface — the IP packet — and could evolve independently. That separation has held for forty-three years.

### The Architectural Decision That Made the Rest Possible

The split that mattered most was not legal or organisational. It was the separation of TCP from IP, finalised in RFC 791 and RFC 793, both dated September 1981. For the previous decade, the experimental Transmission Control Program had bundled everything into a single reliable byte-stream: addressing, sequencing, flow control, retransmission. David Reed and Jon Postel argued in 1978 that some applications — packet voice in particular — needed speed more than reliability, and that fusing the two services made it impossible for protocols like the future UDP, which shipped in August 1980, ICMP in 1981, or eventually QUIC in 2021 to exist at all.

The decision to peel IP off as a thin internetworking layer underneath TCP is the reason the modern internet has more than one transport protocol. Without that separation, every new transport would have had to renegotiate with every router on the planet. With it, UDP could ship in 1980 over the same IP fabric without changing anything below it. How TCP actually delivers a reliable byte-stream over that fabric — the three-way handshake, sequence numbers, the sliding window — is the subject of the TCP episode. How UDP gets away with an eight-byte header and no guarantees is the UDP episode. How QUIC eventually went back and rebuilt the whole stack on top of UDP is the QUIC episode. The chapter's job is the architectural choice that let any of those episodes happen at all.

This is the deepest principle of the era: separate what changes together from what doesn't. Transports change; addressing doesn't. Wires change; packets don't. The architecture that survived four decades was the one that made each layer free to evolve on its own clock.

## The figures

### Jon Postel

Jon Postel, who lived from 1943 to 1998, was the RFC Editor for nearly three decades and the steward of the standards process that still governs the internet. From USC's Information Sciences Institute he edited the foundational TCP/IP specs — RFC 791 for IPv4 in September 1981, RFC 792 for ICMP, RFC 793 for TCP, and earlier RFC 768 for UDP in August 1980. RFC 768 is three pages long, the most spartan and durable specification in networking. With David Reed in 1978 he made the argument that split the monolithic TCP into IP plus a separate transport — the architectural decision that made UDP and, decades later, QUIC possible. He was also the first steward of what became IANA. His Robustness Principle — be conservative in what you send, be liberal in what you accept — first appeared in his RFC 760 introduction and entered the cultural canon. He has his own episode in the pioneers part of the book.

### RFC 791 — Internet Protocol

Published in September 1981 with Jon Postel as editor, RFC 791 specified the IPv4 packet format: a twenty-byte header with source and destination addresses, a TTL field that routers decrement to prevent infinite loops, a protocol number identifying what's inside, and fragmentation fields for splitting oversized packets. It is still an internet standard. RFC 9293 obsoletes RFC 791's transport-layer counterpart, but RFC 791 itself remains the IPv4 reference.

### RFC 792 — Internet Control Message Protocol

Also September 1981, also edited by Jon Postel. RFC 792 defined the diagnostic and error-reporting protocol that sits directly on IP — protocol number 1, no ports. Every ping and every traceroute on Earth still relies on it. Internet standard.

### RFC 793 — Transmission Control Protocol

Jon Postel's September 1981 specification of TCP — the connection setup, sequence numbers, acknowledgements, the sliding window. It governed the dominant transport on the internet for forty-one years before being obsoleted in 2022. Now classified historic.

### RFC 9293 — Transmission Control Protocol (TCP)

Edited by Wesley Eddy of MTI Systems and published in 2022, RFC 9293 is the current TCP specification. It rolls up RFC 793 plus six other RFCs — 879, 2873, 6093, 6429, 6528, and 6691 — into a single internet standard. Same protocol, four decades of clarifications folded in.

## What it taught the industry

The standardisation burst taught the industry that hard deadlines beat soft transitions. Dual-stack was a tax on every operator until the day NCP got turned off, and the only way to end the tax was to set a date and mean it. It taught the industry that layering is an economic decision, not a theoretical one — separating IP from TCP is what let UDP, ICMP, and eventually QUIC ship without rewriting the routers. And it taught the industry that the right place for the LAN/WAN boundary is the IP packet, which is why a 10 Mbps coaxial bus from 1983 and an 800 Gbps optical link from 2024 still carry the same payload.

## Listening order

- **Before this chapter:** *Before the Internet — the world of NCP, ARPANET-only addressing, and a single monolithic Transmission Control Program. That chapter sets up why the split this one describes was necessary.*
- **After this chapter:** *The 1986 Congestion Collapse — three years after the flag day, the network melts down between two computers four hundred yards apart at Berkeley, and Van Jacobson has to invent congestion control to save it.*

## Where to go deeper

- The IP episode picks up the mechanism — the twenty-byte header, TTL, fragmentation, how routers actually forward a packet hop by hop.
- The TCP episode covers what RFC 793 and now RFC 9293 specify in detail: the three-way handshake, sequence numbers, the sliding window, and the long evolution of congestion control from Tahoe and Reno through CUBIC to BBR.
- The UDP episode is the eight-byte header and the design philosophy of leaving reliability to the application — DNS, gaming, VoIP, and the substrate underneath QUIC.
- The ICMP episode is ping, traceroute, Path MTU Discovery, and the long-running debate about whether firewalls should block it.
- The Ethernet episode walks from the 1973 Xerox PARC coaxial bus through the 1980 DIX standard, the 1983 IEEE ratification, and the switch-and-full-duplex transformation that took Ethernet from 10 Mbps to 800 Gbps.
- The QUIC episode is the modern coda — Google looking at TCP plus TLS forty years later and saying we can do better, by collapsing the handshake to one round trip and running the whole thing over UDP.

## Visual cues for image generation

- A 1980–1983 timeline with five pins — UDP in August 1980, the three Postel RFCs in September 1981, the ARPANET flag day on 1 January 1983, and IEEE 802.3 ratified in 1983 — each captioned with one consequence.
- A before/after stack diagram: a single monolithic Transmission Control Program on the left, the layered split of IP underneath with TCP, UDP, and ICMP riding on top in parallel on the right.
- The actual I survived the TCP/IP transition button rendered in 1983 graphic-design style.
- A map of the roughly four hundred ARPANET hosts on 31 December 1982, colour-coded green for converted and red for not-yet-converted, with a clock ticking down to midnight.
- A layered diagram of the LAN/WAN seam: 802.3 frames on the left, IP packets riding inside them, a router on the right re-framing the same packet onto a long-haul link, captioned forty-three years and counting.

## Sources

- [RFC 791 — Internet Protocol](https://www.rfc-editor.org/rfc/rfc791)
- [RFC 792 — Internet Control Message Protocol](https://www.rfc-editor.org/rfc/rfc792)
- [RFC 793 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc793)
- [RFC 9293 — Transmission Control Protocol (TCP)](https://datatracker.ietf.org/doc/html/rfc9293)
- [Jon Postel — Wikipedia](https://en.wikipedia.org/wiki/Jon_Postel)
- [Robustness principle — Wikipedia](https://en.wikipedia.org/wiki/Robustness_principle)
