---
id: packets
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Packets & Encapsulation
synopsis: Encapsulation in pictures — frames inside packets inside segments.
podcast_target_minutes: 15
position_in_book: 4 of 75
listening_order:
  prev: foundations/addressing
  next: foundations/ports-sockets
related_protocols: [udp, tcp, ip, ethernet, wifi, mqtt, coap, quic, http3, tls]
related_pioneers: [bob-metcalfe]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/UDP_encapsulation.svg/500px-UDP_encapsulation.svg.png
    caption: Application data wrapped in a UDP datagram, then an IP packet, then an Ethernet frame. Each header is a fixed shape; only the payload region grows or shrinks.
    credit: Diagram — Wikimedia Commons / CC BY-SA 3.0
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/IPv4_Header.svg/500px-IPv4_Header.svg.png
    caption: The 20-byte IPv4 header. Each row is 32 bits; source and destination addresses each take a full row.
    credit: Diagram — Wikimedia Commons / CC BY-SA 3.0
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Ethernet_Type_II_Frame_format.svg/500px-Ethernet_Type_II_Frame_format.svg.png
    caption: The Ethernet II frame format that has not changed since 1980 — 14 bytes of header, up to 1500 bytes of payload, 4-byte CRC.
    credit: Diagram — Wikimedia Commons / public domain
visual_cues:
  - "A nested-Russian-doll cutaway: the letter 'G' from 'GET /index.html', wrapped in an HTTP message, inside a TCP segment numbered 42017, inside an IP packet with TTL 60, inside an Ethernet frame with a 32-bit CRC. Same byte, four wrappers."
  - "A timeline of switching paradigms — telephone circuit-switched call (1950s) versus ARPANET packet-switched (1969). On the circuit side, a continuous reserved channel; on the packet side, labelled chunks taking different paths through routers."
  - "A header-overhead bar chart: TCP+IP+Ethernet (~58 bytes) versus QUIC+UDP+IP+Ethernet (~50 bytes) versus MQTT (2-byte fixed header) versus CoAP (4-byte header). Same payload, dramatically different wrappers."
  - "A 1500-byte MTU diagram: 14-byte Ethernet header, 20-byte IP header, 20-byte TCP header, 1446 bytes of payload, 4-byte FCS — to scale, with the payload region taking up 96% of the frame."
  - "A side-by-side of an Ethernet frame and an 802.11 frame, with the 802.11 frame showing its three (sometimes four) MAC address fields versus Ethernet's two."
---

# Part I, Chapter — Packets & Encapsulation

## The hook

Right now, on this page load, the byte that says "G" in your "GET /index.html" is part of an HTTP message, inside a TCP segment numbered 42017, inside an IP packet with a TTL of 60, inside an Ethernet frame with a 32-bit CRC. The byte does not change. The wrappers around it change at every layer boundary. That is encapsulation, and it is the trick that lets the internet route trillions of packets per second through equipment that costs less than a car.

## The story

### Why Packet Switching Won

Until the late 1960s, every long-distance computer communication used circuit switching — the model the telephone network ran on. To send data from A to B, the network reserved a continuous channel between them for the duration of the call. The capacity was guaranteed but locked. Two hosts that exchanged a burst of data once a minute would tie up a circuit the other 59 seconds.

Paul Baran at RAND between 1962 and 1964, and Donald Davies at the National Physical Laboratory between 1965 and 1967, independently proposed a different idea. Chop the data into small packets, label each one with its destination, and let intermediate nodes forward each packet independently along whichever path is least busy. No reservation. No per-call setup. No wasted capacity. The 1969 ARPANET implemented this and never looked back.

A packet is a self-contained unit. It has a header — control information like addresses, length, and a checksum — and a payload, which is the bytes the application actually sent. Routers along the path read only the header. They never look at the payload, and they never remember anything about previous packets in the same conversation. That statelessness is what makes the whole thing scale. A router that had to remember every flow it had ever seen would have collapsed under its own bookkeeping by 1985.

### Why Layers Have Different Names For The Same Thing

The same chunk of bytes goes by four different names depending on which layer you are looking at. Frames at Layer 2 — that is Ethernet and Wi-Fi. Packets at Layer 3 — that is IP. Segments at Layer 4 if you are using TCP, or datagrams if you are using UDP. Messages at Layer 7 — that is HTTP and friends.

It looks like jargon for jargon's sake, but the names encode something real. They tell you the *scope* of the unit. A frame only matters between two devices on the same wire. A packet only matters end-to-end across the internet. A segment only matters to the two TCP endpoints holding the connection open. A message only matters to the application. When a packet is dropped at Layer 3, the Layer 2 frame that carried it is irrelevant. When a segment is retransmitted, the Layer 7 message it was part of has to be reassembled. Naming each unit lets engineers talk about loss, latency, and corruption at the right level without confusing themselves.

The same byte is all of these things at once. The "G" in your GET request is, simultaneously, an HTTP message byte, a TCP segment byte, an IP packet byte, and an Ethernet frame byte. Four labels, one byte. Each layer adds its own header on the way down and strips it on the way up.

### MTU and the 1500-byte ceiling

There is a number you should memorise: 1500. That is the largest packet most internet links will carry without fragmenting — the Ethernet maximum transmission unit, set by Bob Metcalfe in 1980 and never changed in forty-five years. Subtract 20 bytes of IP header and 20 bytes of TCP header, and the maximum useful payload per packet is 1460 bytes. Sending a 1 megabyte file means roughly 685 packets.

Path MTU Discovery is the mechanism that probes the path to find the largest packet size that survives end-to-end. When it works, you get the biggest packets the path can carry. When it fails — the dreaded MTU black hole — connections hang, because both sides keep sending packets that get silently dropped somewhere in the middle. The packets are too large. Nothing is acknowledging them. Neither side knows why. It is one of the more painful pathologies in operational networking, and it is entirely a consequence of that 1980 decision to cap Ethernet payloads at 1500 bytes.

### The Conservation of Bytes

Headers cost something. A 1500-byte Ethernet frame might carry only 1448 bytes of useful TCP payload — 40 bytes of TCP options, 20 of IP, plus the 14-byte Ethernet header and a 4-byte CRC. On a satellite link priced per byte, those overheads are real money. That is exactly why MQTT, designed at IBM in 1999 for monitoring oil pipelines over satellite, has a 2-byte minimum header. And why CoAP, which is the IoT version of REST, has a 4-byte one. We cover both in their own episodes — the MQTT episode digs into publish-subscribe and the broker model, and the CoAP episode covers REST semantics over UDP for constrained devices.

Headers also cost time. Every byte added to a packet is a byte that has to be sent, propagated, received, and parsed. For QUIC and HTTP/3 running over TLS 1.3, the per-packet header is around 25 to 30 bytes — small enough to fit roughly 50 packets in a single MTU, large enough to encode a connection ID, a packet number, and an authenticated encryption tag. How QUIC pulls that off is the subject of the QUIC episode and the HTTP/3 episode.

The eternal trade-off is expressiveness versus overhead. A header that names the source IP, the destination IP, source port, destination port, sequence number, ACK number, window size, options, checksum, and TLS metadata gives the receiver enough information to do reliability, congestion control, and security correctly. A header that says only "this is a 1500-byte chunk, somewhere" is faster to transmit but useless for anything beyond raw throughput. Forty years of protocol design is the search for the right balance at each layer of the stack.

## The figures

### Bob Metcalfe

Bob Metcalfe, born 1946, built the first 2.94 megabit-per-second Ethernet in 1973 at Xerox PARC with David Boggs to connect Alto workstations to laser printers. He co-authored the seminal *Ethernet: Distributed Packet Switching for Local Computer Networks* in *Communications of the ACM* in July 1976, then co-authored the DIX specification — Digital, Intel, Xerox — in 1980, which the IEEE ratified as 802.3 in 1983. He founded 3Com in 1979 to commercialise it. Today, four decades later, every wired network on the planet — from your home router to an 800-gigabit-per-second AI training cluster — runs Ethernet at the link layer. He won the ACM Turing Award in 2022, the IEEE Medal of Honor in 1996, and the National Medal of Technology in 2003. There is a separate Bob Metcalfe episode in the pioneers track.

## Where to go deeper

This chapter touched ten protocols in passing. Each has a full episode that picks up the mechanism story.

The TCP episode covers segments, sequence numbers, the three-way handshake, and the congestion-control lineage from Tahoe and Reno through CUBIC to Google's BBR — BBRv3 has been the default for google.com and YouTube since 2023. The UDP episode is the short, sharp companion: an 8-byte header, no connection, no acknowledgement, and the protocol that DNS, online gaming, live video, and VoIP all sit on top of.

The IP episode covers the 20-byte header in detail — TTL, protocol number 6 for TCP and 17 for UDP, fragmentation fields — and how IPv4's 32-bit address space, vast in 1981, was effectively exhausted by 2011. The Ethernet episode picks up the 1973 Xerox PARC story and walks through the shift from shared coaxial cable with CSMA/CD to switched full-duplex links and the 800-gigabit IEEE 802.3df standard ratified in 2024. The Wi-Fi episode covers 802.11's evolution from 2 megabits in 1997 to Wi-Fi 7's 46 gigabits in 2024, and the airtime arithmetic that lets it share the 2.4 gigahertz band with Bluetooth, Zigbee, and Thread.

The QUIC episode and the HTTP/3 episode pick up the modern transport story — combining the transport handshake with the TLS handshake into a single round trip, eliminating the head-of-line blocking that plagued HTTP/2 over TCP, and handing the web a transport that survives a Wi-Fi-to-cellular handoff without dropping the connection. The TLS episode is the security counterpart — confidentiality, integrity, and authentication, with TLS 1.3 cutting the 2018 handshake from two round trips down to one. The MQTT episode and the CoAP episode are the two IoT bookends — pub-sub over a 2-byte header, and REST-over-UDP with a 4-byte header.

## Listening order

- **Before this chapter:** *Addressing & Identity* — the previous chapter explains who packets are addressed *to*, which is the precondition for talking about how they are wrapped and forwarded.
- **After this chapter:** *Ports & Sockets* — the next chapter zooms in on the Layer 4 endpoint identifiers, which is what the receiver uses to figure out which application a segment belongs to.

## Visual cues for image generation

- A nested cutaway of the four wrappers around a single byte: the "G" of GET, then HTTP message, then TCP segment 42017, then IP packet with TTL 60, then Ethernet frame with CRC. Same byte at the centre, four labels.
- A split-panel comparison of circuit switching and packet switching. Left panel: a 1950s telephone exchange with a continuous reserved line between two phones. Right panel: a 1969 ARPANET diagram with packets taking different paths through IMPs.
- A 1500-byte MTU diagram drawn to scale: 14-byte Ethernet header, 20-byte IP header, 20-byte TCP header, 1446-byte payload, 4-byte FCS. Annotation calling out that Bob Metcalfe set this number in 1980 and it has not moved since.
- A header-overhead bar chart comparing TCP-plus-IP-plus-Ethernet (~58 bytes) against QUIC-plus-UDP-plus-IP-plus-Ethernet (~50 bytes), MQTT (2-byte fixed header), and CoAP (4-byte header), with annotations on what each protocol is optimising for.
- A diagram of the MTU black hole pathology: sender sends 1500-byte packets, a middle router silently drops them because its link only carries 1400, neither end knows why the connection has stalled.
