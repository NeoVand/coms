---
id: layer-model
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: The Layer Model
synopsis: Seven layers, the standards war that decided their fate, and where the layers blur.
podcast_target_minutes: 15
position_in_book: 2 of 75
listening_order:
  prev: foundations/what-is-a-protocol
  next: foundations/addressing
related_protocols: [tcp, ip, udp, icmp, quic, ethernet, wifi, arp, ipv6, bgp, sctp, mptcp, http1, tls, smtp, dns, ssh, websockets, grpc, mcp]
related_pioneers: [bob-kahn, vint-cerf, jon-postel, david-clark]
related_outages: []
related_frontier: []
related_rfcs: [9849]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSI_Model_v1.svg/500px-OSI_Model_v1.svg.png
    caption: The OSI 7-layer reference model, ratified by ISO in 1984. Forty years later it still shapes how every networking textbook teaches the stack — even though the internet itself runs the simpler 4-layer TCP/IP model.
    credit: Diagram — Wikimedia Commons / public domain
visual_cues:
  - "A vertical stack of six labelled boxes — L1 Physical at the bottom, then Data Link, Network, Transport, and a fused L5–7 Application at the top — with a single HTTP GET sliding down the stack and growing a new wrapper at every layer."
  - "Two stacks side by side: OSI's seven boxes on the left, TCP/IP's four on the right, dotted lines mapping each OSI box to its TCP/IP equivalent. Both stacks bottom out at the same Physical layer."
  - "A 1974 cover page of the Cerf and Kahn IEEE paper next to a 1978 split diagram showing the original monolithic TCP cleaving into IP underneath and TCP on top."
  - "David Clark at the IETF 24 podium in Cambridge, July 1992, with the words 'rough consensus and running code' rendered in chalk-on-blackboard above his head."
  - "An exploded view of a QUIC packet showing it riding on UDP at L4 but folding TLS 1.3 and stream multiplexing inside — with a caption: 'Is this L4? Or L4+5+6?'"
---

# Part I, Chapter — The Layer Model

## The hook

In late 1972, Bob Kahn at DARPA was sketching a problem nobody had solved: how do you let a computer on the ARPANET talk to one on a packet-radio network, or a satellite link, when those networks know nothing about each other? He brought in Vint Cerf at Stanford, and in May 1974 they published a paper that coined the word "internet." That paper described a single monolithic protocol that did everything. Four years later, three engineers would split it in half — and that split is the reason every protocol you use today exists.

## The story

### The Problem Layers Solve

The 1974 paper was titled *A Protocol for Packet Network Intercommunication*, in IEEE Transactions on Communications. The protocol it described was called TCP, and it did everything in one piece: routing hints, sequencing, flow control, reliability — one program, one design, one implementation.

By 1978, repeated implementation work at Stanford, BBN, and University College London had revealed the flaw. Some applications — packet voice, in particular — needed *speed* more than *reliability*. Forcing every application through the same reliable byte stream was wrong. Jon Postel and David Reed argued for splitting the monolith: a thin internetworking layer underneath called IP, and an end-to-end transport layer above it. That single architectural decision is the reason UDP, ICMP, and decades later QUIC could exist — without renegotiating with every router on the planet.

The deeper principle is older than networking: separate what changes together from what doesn't. The wire — copper, fibre, radio — changes every decade. The routing algorithm changes every few years. The web changes every Tuesday. Layered protocols let each move on its own clock, and let an engineer reason about one layer without holding the other six in their head.

The mechanic of it is encapsulation. Going down the stack, each layer wraps the previous payload with its own header. Going up, each layer strips its header and hands the rest to the next. That is why the same HTTP request rides unchanged across Wi-Fi at home, Ethernet in the office, and a satellite link to a server in Iowa.

### The Seven Layers, Honestly

OSI gives you seven layers. The honest version goes like this.

L1 — Physical. Volts on a wire, photons in a fibre, modulated radio. Specified by IEEE 802.3 for Ethernet PHYs, by 802.11 for Wi-Fi, by DOCSIS, fibre-optic standards, and the radio rules from the ITU. If your problem is "the cable is unplugged," it's L1.

L2 — Data Link. Frames addressed by 48-bit MAC addresses. Reaches one hop on a single segment. Ethernet and Wi-Fi live here, alongside ARP, the spanning tree protocol, and VLAN tags. Switches operate at L2.

L3 — Network. IP addresses, hop-by-hop forwarding, longest-prefix-match routing. IPv6, ICMP, BGP for inter-domain routing. Routers operate at L3 — they decrement TTL and forward across networks.

L4 — Transport. End-to-end semantics. TCP gives you a reliable, ordered byte stream. UDP gives you fire-and-forget datagrams. SCTP adds multi-streaming, MPTCP adds multi-path, and now QUIC folds in encryption. L4 is the first layer with a *port* — the demux that picks which application gets the bytes.

L5 to L7 — Session, Presentation, Application. OSI's three top layers. In practice the line between them is a fiction. HTTP does session, presentation, and application all at once. TLS is "kind of L5/6," but on QUIC it's fused into L4. SMTP, DNS, SSH, WebSockets, gRPC, MCP — everything an engineer touches sits up here.

The IETF stack pragmatically collapses 5 through 7 into one Application layer. That's the four-layer TCP/IP model: Link, Internet, Transport, Application. It maps to OSI but doesn't pretend the upper three are usefully distinct.

### How TCP/IP Won the Standards War

Through the 1980s, the official future of networking was OSI. ISO and the ITU promoted the seven-layer suite — TP4 transport, CLNP networking — with full institutional backing: European PTTs, the U.S. government's GOSIP mandate, the prestige of a global standards body. TCP/IP was, in those rooms, considered a research project that would be replaced.

It was not. By July 1992, when David D. Clark gave his "A Cloudy Crystal Ball" plenary at the 24th IETF meeting in Cambridge, Massachusetts, he could distil the IETF's working culture into the sentence that decided the question: *"We reject: kings, presidents and voting. We believe in: rough consensus and running code."* OSI shipped specifications. The IETF shipped code. Code won.

The win was never about elegance — OSI's seven layers are arguably cleaner. It was about deployment economics. By 1992, TCP/IP was already running on every Unix box in every university, every BSD-derived workstation, every router on the NSFNET backbone. Switching to OSI would have required a coordinated global flag day. The internet had quietly become too big to migrate.

David Clark's quote is the closest thing the internet community has to a national anthem. It says: standards are documents about behaviour we have already shipped, not theories we hope someone will adopt. It is the reason new protocols appear as Internet Drafts with reference implementations, not as ISO documents. And it is why — even in 2026 — every protocol in this lab traces back to a draft someone could install and run.

### Where the Layers Blur

Real protocols don't always respect the model.

QUIC runs on UDP at L4 but implements its own reliability, congestion control, and multiplexing in user space, and folds TLS 1.3 directly into the handshake. Is QUIC L4, or L4 plus L5 plus L6? Both, honestly. The mechanism story is the QUIC episode.

MPLS sits between L2 and L3 — a 4-byte shim header that drives label-swap forwarding underneath IP. The community calls it "Layer 2.5" because no other label fits.

ICMP is "Layer 3" but it doesn't carry application data; it carries control messages *about* L3.

Network Address Translation rewrites L3 source addresses *and* L4 source ports together — breaking the strict layer separation in exchange for IPv4 address conservation.

Encrypted Client Hello — that's RFC 9849, a 2025 draft from the IETF TLS working group — hides the L7 SNI inside an L5/6 TLS extension so middleboxes can't see the destination domain.

The model is a *map*, not the territory. The map is invaluable: it lets you reason about responsibilities, predict failures, and design new protocols. But every model has its edge cases, and every edge case is where the most interesting engineering happens.

One last working definition. When you read "X is a Layer 4 protocol," what that really means is: X provides services to whatever is above it, and consumes services from whatever is below it. Swap out the layer underneath — IP for IPv6, Ethernet for Wi-Fi, fibre for radio — and X keeps working. That replaceability *is* the layer. Anything tightly coupled to its substrate isn't really layered.

## The figures

### Bob Kahn

Co-inventor of TCP/IP, born 1938, at DARPA and BBN. He conceived the idea of open-architecture networking while managing the ARPANET project at DARPA, then in late 1972 started sketching how to interconnect packet-switched networks that did not look like the ARPANET — radio nets, satellite nets, eventually Ethernets. He recruited Vint Cerf to collaborate on what became TCP/IP, and designed the protocols at the gateways — what we now call routers. ACM Turing Award in 2004, Presidential Medal of Freedom in 2005. He has his own episode.

### Vint Cerf

Co-inventor of TCP/IP, born 1943, at Stanford and DARPA and now Google. He designed the TCP/IP protocol suite alongside Bob Kahn and co-authored the foundational 1974 paper that coined the word "internet" for "internetworking of networks." He edited or co-edited many of the early TCP RFCs at Stanford with Yogen Dalal and Carl Sunshine, including RFC 675 in December 1974 — the first detailed TCP specification. Turing Award 2004, Presidential Medal of Freedom 2005. He has his own episode.

### Jon Postel

RFC Editor and protocol architect, 1943 to 1998, at USC Information Sciences Institute. He edited the foundational TCP/IP RFCs — RFC 791 for IPv4 in September 1981, RFC 792 for ICMP, RFC 793 for TCP, RFC 768 for UDP in August 1980 (three pages, the most spartan and durable spec in networking) — and served as the RFC Editor for nearly three decades. He argued, with David Reed, for splitting the original monolithic TCP into IP plus a separate transport layer in 1978 — the architectural decision this chapter turns on. The "Robustness Principle" — *be conservative in what you send, be liberal in what you accept* — is his. He has his own episode.

### David D. Clark

Architect of the Internet and IETF philosopher, born 1944, at MIT CSAIL. Chief Protocol Architect of the Internet from 1981 to 1989, when most of the architectural decisions that shape the internet today were made: the end-to-end principle, the four-layer model, the separation of mechanism from policy. The "rough consensus and running code" line is from his July 1992 IETF 24 plenary in Cambridge. He has his own episode.

### RFC 9849 — TLS Encrypted Client Hello

Published as an IETF TLS working group draft in 2025. It defines the registration entries for Encrypted Client Hello, the TLS extension that hides the Server Name Indication — the destination hostname — from middleboxes on the path. It is the chapter's example of a layer-bending modern protocol: an L5/6 TLS extension whose job is to obscure an L7 identifier from the network underneath.

## What it taught the industry

Three things settled into networking practice because of the layered approach and the war that ratified it.

First, *separation of concerns is a deployment strategy, not just an aesthetic*. Splitting TCP into IP plus transport in 1978 meant UDP could be invented in 1980 without touching a single router. QUIC could be invented in 2012 without touching a single router. Every transport innovation since has been able to ship as a user-space library because the layer below it is stable and dumb.

Second, *running code beats elegant specifications*. OSI was the cleaner design. TCP/IP was the one shipping on every Unix box. The IETF formalised that preference into a working method — Internet Drafts with reference implementations, plenary debate, rough consensus. Every protocol covered in this lab traces back to a draft someone could install and run.

Third, *the map is not the territory*. The seven-layer model is a teaching tool. Real protocols cross layer boundaries when the engineering demands it: QUIC fuses transport and crypto, NAT couples L3 and L4 rewrites, ECH smuggles an L7 hostname inside an L5/6 extension. The layers tell you where to start reasoning, not where to stop.

## Listening order

- **Before this chapter:** *What Is a Protocol?* — the prior chapter sets up what a protocol *is* — an agreement between two endpoints about how to exchange bits — before this one stacks those agreements seven deep and shows why the stacking matters.
- **After this chapter:** *Addressing and Identity* — the next chapter zooms into a single layer pair, L3 and L2, to ask the next question: once you have a layered stack, how does a packet actually find its destination?

## Where to go deeper

- The TCP episode picks up where this chapter leaves off — the three-way handshake, the sequence-number machinery, congestion control from Tahoe through CUBIC and BBR, and why TCP is still the default reliable transport in 2026.
- The IP episode covers the L3 mechanism this chapter only names — the 20-byte IPv4 header, TTL, fragmentation, and the routing model that lets the same packet cross Wi-Fi, Ethernet, and satellite links unchanged.
- The UDP episode is the counterweight — the 8-byte header, the deliberate absence of guarantees, and why DNS, gaming, and QUIC all chose to build on top of it.
- The QUIC episode is this chapter's modern coda — what happens when you collapse L4, L5, L6, and the TLS handshake into one protocol running over UDP, and what that means for the layer model going forward.
- The TLS episode picks up the encryption story — including how RFC 9849's Encrypted Client Hello hides the SNI from on-path observers.
- The Ethernet, Wi-Fi, and ARP episodes cover the L2 layer that this chapter names but defers — frame formats, MAC addresses, switching, and the bridge between L3 and L2.
- The IPv6 and BGP episodes pick up the long arc of L3 — IPv6's 128-bit address space and stateless autoconfiguration, and BGP's role as the inter-domain routing glue that makes the internet a network of networks.
- The SCTP and MPTCP episodes show the L4 alternatives that exist alongside TCP — multi-streaming and multi-path transport, and why neither displaced TCP on the public internet.
- The HTTP/1.1, SMTP, DNS, SSH, WebSocket, gRPC, and MCP episodes pick up the L5–7 application protocols this chapter only lists — each one is a different shape of conversation built on top of the lower layers.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
