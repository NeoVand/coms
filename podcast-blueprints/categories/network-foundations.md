---
id: network-foundations
type: category
name: Network Foundations
description: The physical and logical layers that make networking possible. Addressing, framing, and routing at Layers 2-3 — before any transport protocol gets involved.
podcast_target_minutes: 30
protocols: [ethernet, arp, ipv4, ipv6, ospf, bgp, icmp]
related_pioneers: [bob-metcalfe, david-boggs, vint-cerf, bob-kahn, jon-postel, yakov-rekhter, steve-deering, radia-perlman, david-mills, paul-mockapetris, van-jacobson]
related_book_chapters:
  - story-of-the-internet/before-the-internet
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-1986-collapse
  - story-of-the-internet/osi-vs-tcp-ip
  - layer-2-3/ethernet
  - layer-2-3/wifi
  - layer-2-3/arp-and-ndp
  - layer-2-3/ipv4
  - layer-2-3/ipv6
  - layer-2-3/icmp
  - layer-2-3/bgp
  - famous-outages/arpanet-1980
  - famous-outages/as-7007-1997
  - famous-outages/pakistan-youtube-2008
  - famous-outages/china-telecom-2010
  - famous-outages/centurylink-2020
  - famous-outages/facebook-2021
  - famous-outages/rogers-2022
  - frontier/ipv6-mostly
  - frontier/rpki-aspa
  - frontier/ultra-ethernet
related_outages: [arpanet-1980, as-7007-1997, pakistan-youtube-2008, china-telecom-2010, centurylink-2020, facebook-2021, rogers-2022, att-mobility-2024]
related_frontier: [ipv6-mostly, rpki-aspa, ultra-ethernet, wifi-7-and-8, post-quantum]
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Xerox_Alto_mit_Rechner.JPG/500px-Xerox_Alto_mit_Rechner.JPG"
    caption: "The Xerox Alto (1973) — the workstation Ethernet was invented to network. Bob Metcalfe wired Altos together at Xerox PARC over a shared coaxial cable at 2.94 Mbps using CSMA/CD."
    credit: "Photo: Joho345 / Public Domain, via Wikimedia Commons"
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/500px-Internet_map_1024.jpg"
    caption: "A partial map of the internet by the Opte Project (2005). Each line connects two IP addresses — the web of routes IP makes possible. Blue is North America, green Asia-Pacific, red Europe."
    credit: "Image: Barrett Lyon / The Opte Project / CC BY 2.5, via Wikimedia Commons"
visual_cues:
  - "The five-layer stack as a tall column. Layer 1 at the bottom labelled 'copper, fibre, radio'. Layer 2 with two boxes — Ethernet and Wi-Fi. Layer 3 with four boxes — IPv4/IPv6, ARP/NDP, ICMP, BGP. Layer 4 thin bar with TCP and UDP. Layer 7 with HTTP, DNS, SSH, SMTP. Arrows showing each application riding through every layer below."
  - "An IPv4 header next to an IPv6 header, drawn to scale. IPv4 on the left, 20 to 60 bytes, with checksum and options shaded. IPv6 on the right, fixed at 40 bytes, no checksum, callouts for the 128-bit source and destination addresses."
  - "A timeline running from 1973 to 2026 with seven marker pins: 1973 Ethernet sketch, 1981 RFC 791 and RFC 792, 1982 RFC 826 ARP, 1983 ARPANET Flag Day, 1989 BGP on three napkins in Austin, 1998 RFC 2460 IPv6, 2026 IPv6 crosses 50 percent on Google."
  - "A schematic of the 4 October 2021 Facebook outage. Three layers stacked — backbone fibre, DNS prefixes, BGP advertisements — each one trusting the layer below. A red X over the BGP withdrawal at 15:39 UTC. A small inset of an engineer at a data centre door with bolt cutters."
  - "A two-pane diagram of ARP versus NDP. Left pane: ARP broadcasts 'who has 192.0.2.7?' to every host on the segment. Right pane: NDP sends a Neighbor Solicitation to a solicited-node multicast group, only the matching host wakes up."
  - "An 800 GbE switch port photographed with a quarter for scale, captioned with the IEEE 802.3df-2024 approval date of 16 February 2024 and the P802.3dj target of July 2026 for 1.6 TbE."
  - "The decision tree for picking a routing protocol. Single segment? Use Ethernet plus ARP or NDP. Cross subnets? IP. One administrative domain? OSPF or IS-IS. Between domains? BGP — there is no alternative."
---

# Network Foundations

## In one breath

Network Foundations is everything that has to be working before any transport protocol gets involved — Layer 2 framing on copper, fibre, and radio, and Layer 3 addressing and routing on top of it. Seven protocols sit here: Ethernet, ARP, IPv4, IPv6, OSPF, BGP, and ICMP. They turn a planet of disconnected wires into a single network of networks, and when any of them misbehaves the rest of the stack — your TCP, your TLS, your HTTP — has nothing to ride on.

## The pitch

At 15:39 UTC on 4 October 2021, Facebook ran a routine command on its global backbone. Three minutes later, Facebook, Instagram, and WhatsApp vanished from the internet. Not slow. Not buggy. Vanished. Three billion users couldn't connect, because eight tiny pieces of routing data — eight numbers, really — disappeared from the world's routers. Engineers couldn't even badge into their own buildings to fix it. The protocol responsible is forty years old, was sketched on three sheets of paper at an IETF meeting in Austin in 1989, and runs every connection you've ever made between two networks. It's called BGP, and almost nobody outside our industry knows it exists. This episode is about the layer of the internet that nobody talks about — until it breaks.

## The arc

### Three streams that became one stack

The Network Foundations group did not arrive as a designed family. It congealed from three separate research streams in the 1970s. ARPANET, switched on in 1969, proved that packet switching worked at scale and produced the first host-to-host protocol, NCP. Then in 1973, at Xerox PARC in Palo Alto, a young engineer named Bob Metcalfe sketched a system where computers shared a single coaxial cable with simple rules for who could transmit. He had studied ALOHAnet, a radio network connecting Hawaiian islands, and realised the same trick would work in an office. He called it Ethernet, after the luminiferous aether that nineteenth-century physicists believed permeated space. Metcalfe and David Boggs built it; their seminal Communications of the ACM paper, "Ethernet: Distributed Packet Switching for Local Computer Networks," appeared in July 1976. The third stream came from Stanford and BBN, where Vint Cerf and Bob Kahn published "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications in May 1974, defining what would split into TCP and IP and inventing the term "internet" for a network of networks.

### The 1980 wake-up call

On 27 October 1980, ARPANET collapsed for roughly four hours. A malfunctioning IMP corrupted routing tables; bit-drops in storage produced multiple messages with conflicting timestamps that the garbage collector could not order; the protocol's broadcast machinery propagated the corruption everywhere. Eric Rosen wrote it up as RFC 789. It is one of the great post-mortems in internet history and arguably the first explicit lesson that control-plane bugs at network scale are catastrophic in ways no individual node can prevent. We come back to RFC 789 in the chapter on the 1986 collapse and the 1980 ARPANET outage episode.

### The 1981 to 1983 standardisation burst

Then came two years that built the modern stack. RFC 791 — IPv4 — and RFC 792 — ICMP — were published in September 1981 by Jon Postel at ISI. RFC 793, TCP, followed. David Plummer's seven-page RFC 826 defining ARP landed in November 1982. ARPANET's flag day cutover from NCP to TCP/IP was 1 January 1983. IEEE 802 had been formed in February 1980 and ratified 802.3 — Ethernet's formal standard — in 1983, with the famous DIX consortium of Digital, Intel, and Xerox behind it. The IETF itself was formed in January 1986. We unpack the 1981 burst in its own book chapter.

### The pioneers behind the architecture

Five names show up on every line of this category's history. Bob Metcalfe and David Boggs at PARC for Ethernet. Vint Cerf and Bob Kahn for TCP/IP architecture, both of them later Turing Award laureates. Jon Postel as the editor of the early RFCs and the first steward of IANA. Radia Perlman, who invented Spanning Tree Protocol in 1985 and made redundant Ethernet possible. Steve Deering, who invented IP multicast and led the IPv6 design with Bob Hinden. Yakov Rekhter, Kirk Lougheed, and Tony Li for BGP. David Mills for NTP and the Fuzzball routers that ran the early NSFNET backbone. Paul Mockapetris for DNS. And Van Jacobson, whose congestion control work in 1988 is the reason the internet survived the 1986 congestion collapse — there's a whole chapter on him in the book.

### From shared wire to switched fabric

The original Ethernet was a shared coaxial cable — a bus where every device heard every transmission. Collisions were inevitable, and CSMA/CD was the traffic cop: listen before transmitting, and on collision back off for a random time and try again. The shift from hubs to switches in the 1990s changed everything. A hub was a repeater — every frame went to every port. A switch learns which MAC addresses live on which ports by watching source addresses, and after learning, forwards each frame to one port. Collisions disappeared. Full-duplex links doubled effective bandwidth. That single innovation — the Ethernet switch — is what made modern LANs possible, from small offices to hyperscale data centres running today at 400 and 800 gigabits per second.

### Diagnostics, routing, and the next generation

Three more protocols completed the foundation. In 1981, Jon Postel defined ICMP — the network's built-in diagnostic system. It reports errors like destination unreachable, time exceeded, and redirect, and it's the engine behind ping (Echo Request and Echo Reply) and traceroute (incrementing TTL values that collect time-exceeded responses from each router along the path). The mechanism story lives in the ICMP episode.

By 1989 the internet was outgrowing its routing. The original ARPANET had a single backbone. As multiple networks connected, somebody had to decide how traffic flowed between them. Yakov Rekhter and Kirk Lougheed sketched BGP at lunch during the 12th IETF meeting in Austin, Texas, in January 1989, on three sheets of paper that today hang on a wall at Cisco's Milpitas campus. They published it as RFC 1105 in June 1989. BGP treats each network as an autonomous system and exchanges route advertisements between them on TCP port 179. Today it carries about 975,000 IPv4 prefixes and 225,000 IPv6 prefixes globally, per Geoff Huston's January 2026 ISP Column. There's a separate BGP episode on the mechanism.

The most ambitious chapter of all began in the early 1990s. IPv4's 32-bit address space — 4.3 billion addresses — was running out. Three serious successors competed: TUBA (using OSI's CLNP), CATNIP, and SIPP. SIPP won and became IPv6. Steve Deering and Bob Hinden published RFC 1883 in 1995, RFC 2460 in 1998, and the current Internet Standard, RFC 8200, in July 2017. The header was simplified to a fixed 40 bytes. Broadcast was eliminated in favour of multicast. ARP's broadcast-based resolution was replaced by the Neighbor Discovery Protocol, which uses solicited-node multicast over ICMPv6. Hosts can autoconfigure globally unique addresses with SLAAC, no server required. On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time — 28 years after RFC 2460. Cloudflare and APNIC measure 40 to 43% from their vantage points, so the milestone is real but uneven. The IPv6 episode covers the rest.

## The people

### Bob Metcalfe

Invented Ethernet at Xerox PARC in 1973, co-authored the DIX Ethernet standard in 1980, and co-founded 3Com to commercialise it. He received the 2022 ACM Turing Award for the invention, standardisation, and commercialisation of Ethernet. There's a separate episode on him.

### David Boggs

Built the first 2.94 Mbps Ethernet at PARC alongside Metcalfe and co-authored the 1976 Ethernet paper. The other half of the engineering story behind the original PARC implementation. Has his own episode.

### Vint Cerf

Co-designed the TCP/IP protocol suite — including IP itself — with Bob Kahn. Their 1974 IEEE Transactions on Communications paper defined how heterogeneous networks could exchange data — the fundamental insight that created the internet. 2004 Turing Award. There's a full Vint Cerf episode.

### Bob Kahn

The other half of the 1974 TCP/IP paper. Co-architect of the protocol suite at Stanford and DARPA. Shared the 2004 Turing Award with Cerf. His episode runs separately.

### Jon Postel

Edited the early RFCs — 791 (IPv4), 792 (ICMP), 793 (TCP), 768 (UDP) — and was IANA's first steward. The reason the early internet had a coherent set of numbers and names. Covered in his own episode.

### David Plummer

Wrote RFC 826 in 1982 defining the Address Resolution Protocol — the elegantly simple broadcast-and-reply mechanism that bridges IP addresses to hardware addresses on local networks. The dump notes the RFC is seven pages and still essentially correct.

### Yakov Rekhter

Co-authored the Border Gateway Protocol (RFC 1105, 1989) with Kirk Lougheed at IBM, and later led the team behind RFC 4271 in 2006, the current BGP standard. Every commercial peering and transit relationship on the public internet rides BGP. Rekhter has his own episode.

### Steve Deering

Primary architect of IPv6, leading the design of 128-bit addressing, the simplified header, and multicast. Also invented IP multicast itself, fundamentally changing how one-to-many communication works on the internet. Covered in detail in his own episode.

### Radia Perlman

Invented Spanning Tree Protocol in 1985 (IEEE 802.1D), enabling redundant Ethernet without broadcast storms. Her "Algorhyme" poem — "I think that I shall never see / A graph more lovely than a tree…" — sits inside her STP patent. Later worked on TRILL. Has her own episode.

### David Mills

Best known for NTP, but also designed the Fuzzball routers and the gateway algorithms that ran the early NSFNET backbone. Mentioned here because Fuzzball was foundational to early IGP design.

### Paul Mockapetris

Author of RFC 1034 and RFC 1035 — DNS. Without DNS, IP addresses would still be passed around on paper. He sits in the Utilities and Security category but belongs in any honest list of the people who made the internet usable.

### Van Jacobson

Designed congestion control, traceroute, and BPF. The reason the internet survived the 1986 congestion collapse. He sits at the boundary between this category and Transport, and the chapter on the 1986 collapse covers his work in detail.

## The protocols (a guided tour)

### Ethernet

The wired foundation of local networks. Originally CSMA/CD on shared coax at 2.94 Mbps in 1973; today, full-duplex switched point-to-point links from 10 Mbps up to 800 Gbps, with IEEE 802.3df-2024 approved on 16 February 2024 and IEEE P802.3dj targeting 200 G per lane and 1.6 TbE for July 2026. Ethernet is what an engineer reaches for whenever the question is "how do I get bits across this room, this building, this rack?" The mechanism — frame format, MAC addressing, CSMA/CD's history, switching versus hubs, jumbo frames — lives in the Ethernet episode.

### ARP — Address Resolution Protocol

Resolves an IPv4 address to a MAC address on a local segment by broadcasting "who has 192.0.2.7? tell 192.0.2.1." Operates below IP, sitting at the Layer 2 / Layer 3 boundary. Stateless, trust-based, and the basis of "ARP poisoning" attacks. Used only on IPv4; IPv6 replaced it with NDP. The seven-page RFC 826 from David Plummer in November 1982 is still essentially correct. The ARP episode walks the request/reply, the cache, and the poisoning attack.

### IPv4 — Internet Protocol

The addressing system of the internet. 32-bit addresses, a 20-byte header without options, hop-by-hop forwarding using longest-prefix match in CIDR notation. Specified in RFC 791 by Jon Postel in September 1981. IANA's free IPv4 pool was exhausted in February 2011; the regional registries followed over the next decade. IPv4 survives via NAT and a thriving secondary market. The IPv4 episode walks the header, fragmentation, TTL, NAT, and CIDR.

### IPv6 — Internet Protocol version 6

128-bit addresses (340 undecillion of them), a simplified fixed 40-byte header, no in-network fragmentation (Path MTU Discovery via RFC 8201 instead), an extension-header chain, and link-local addresses by default. RFC 1883 in 1995, RFC 2460 in 1998, RFC 8200 in July 2017 as the current Internet Standard. As of 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time. Mobile carriers are the leading edge — France 86%, India over 75% IPv6-preferred, Germany 68% plus, US mobile carriers averaging 87% with T-Mobile around 93%. The IPv6 episode covers SLAAC, NDP, 464XLAT, and the 28-year-and-counting transition.

### OSPF — Open Shortest Path First

A link-state interior gateway protocol: every router builds an identical topology database by flooding link-state advertisements, then runs Dijkstra to compute its routing table. RFC 2328 for OSPFv2; RFC 5340 for OSPFv3, which carries IPv6. The default IGP for many enterprise networks. (Service providers and hyperscalers more often pick IS-IS for scale.) The OSPF episode covers areas, LSAs, the SPF calculation, and convergence behaviour.

### BGP — Border Gateway Protocol

The path-vector inter-domain routing protocol on TCP port 179. Carries roughly 975,000 IPv4 and 225,000 IPv6 prefixes globally as of January 2026. Every commercial peering and transit relationship on the public internet rides BGP. Sketched on three sheets of paper at the 12th IETF meeting in Austin in January 1989, published as RFC 1105 in June 1989, current standard RFC 4271 from January 2006. BGP is the protocol the rest of the stack quietly depends on; when BGP misbehaves, the internet visibly breaks. The BGP episode covers the path-vector algorithm, attributes, route policy, RPKI, and the operational war stories.

### ICMP — Internet Control Message Protocol

The sibling of IP that carries error and diagnostic messages — Echo Request and Reply (ping), Destination Unreachable, Time Exceeded (traceroute's engine), Packet Too Big (Path MTU Discovery's engine), Redirect. Specified in RFC 792 by Jon Postel in September 1981. ICMPv6 (RFC 4443) is structurally larger because Neighbor Discovery and Multicast Listener Discovery are built on top of it. The ICMP episode walks ping, traceroute, the message types, and the security trade-offs of filtering ICMP at the edge.

## Advanced topics (from the deep-dive)

### VLANs and network segmentation

In a flat Layer 2 network, every device sees every other device's broadcast traffic. VLANs — Virtual LANs, IEEE 802.1Q — solve this by logically partitioning a physical switch into separate broadcast domains. A single 48-port switch can operate as multiple independent switches. VLAN tagging inserts a 4-byte header into Ethernet frames containing a 12-bit VLAN ID, with valid values from 1 to 4094. Trunk ports carry tagged frames from multiple VLANs between switches; access ports strip the tag and connect to end devices. Inter-VLAN routing requires a Layer 3 device — a router on a stick or a Layer 3 switch. VLANs are essential for security (isolating guest Wi-Fi from the corporate network), for performance (reducing broadcast storms), and for compliance (PCI DSS requires cardholder data on its own subnet).

### Spanning Tree Protocol

Redundant links between switches are essential for reliability — but they create loops that cause broadcast storms. Radia Perlman's Spanning Tree Protocol (IEEE 802.1D) prevents loops by electing a root bridge, calculating the shortest path from every switch to the root, and blocking redundant ports. Classic STP converges in 30 to 50 seconds after a topology change — an eternity for modern networks. Rapid Spanning Tree Protocol (RSTP, IEEE 802.1w) reduces this to 1 to 2 seconds with proposal and agreement handshakes. Multiple Spanning Tree Protocol (MSTP, 802.1s) maps multiple VLANs to fewer spanning-tree instances for efficiency. In modern data centres, STP is increasingly replaced by fabric architectures (VXLAN, EVPN) that eliminate loops at the protocol level while letting all links carry traffic at once.

### ARP security

ARP has no authentication — any device can claim any IP-to-MAC mapping. ARP spoofing (also called ARP poisoning) exploits this: an attacker sends fake ARP replies to redirect traffic through their machine, enabling man-in-the-middle attacks. Dynamic ARP Inspection is the primary defence. It intercepts ARP packets on untrusted ports and validates them against a DHCP-snooping binding table. If the IP-to-MAC mapping doesn't match a legitimate DHCP lease, the ARP packet is dropped. IPv6 replaces ARP entirely with the Neighbor Discovery Protocol, which runs over ICMPv6. NDP has its own spoofing risks; Secure Neighbor Discovery uses cryptographic addressing to authenticate neighbour advertisements.

### Wi-Fi roaming and mesh

When you walk from one room to another, your device must seamlessly switch from one access point to another. Basic roaming is slow — the client must re-authenticate with each new AP. IEEE 802.11r (Fast BSS Transition) pre-authenticates with target APs, reducing handoff to under 50 milliseconds. 802.11k (Radio Resource Management) helps clients discover nearby APs without scanning every channel. 802.11v (BSS Transition Management) lets APs steer clients toward less-congested access points. Together, 802.11r/k/v enable enterprise-grade seamless roaming. Wi-Fi mesh networks (802.11s) take this further — APs connect to each other wirelessly, forming a self-healing fabric where each AP acts as both an access point and a relay. Consumer mesh systems like Eero and Google WiFi use proprietary versions of this concept. The Wi-Fi episode in the Wireless category covers the rest.

### BGP route policies

BGP doesn't just exchange routes — operators use policy to control which routes they accept, prefer, and advertise. This is the art of internet traffic engineering. Route filtering uses prefix lists and AS-path filters to accept only legitimate routes. The Resource Public Key Infrastructure (RPKI) uses cryptographic certificates to validate that an autonomous system is authorised to announce a given prefix. Local preference controls outbound traffic by assigning weights to routes — higher preference means "prefer this path." MED, the Multi-Exit Discriminator, hints to neighbouring ASes which entry point to use. AS-path prepending makes a path look longer to discourage inbound traffic through that link. BGP communities tag routes with metadata that triggers policies in other networks; standard communities like "no-export" prevent route propagation, and large communities (RFC 8092) enable fine-grained traffic engineering across multi-provider networks. We come back to RPKI and ASPA in the deep-dive on routing security.

## Recurring themes

The first theme is **layering as a universal pattern**. Each protocol in this category does one job — Ethernet frames, IP routes, ICMP diagnoses, BGP propagates reachability between domains — and trusts the layer below it. Encapsulation is the visible artefact: a single Wi-Fi 7 link can carry a TLS-protected gRPC call inside QUIC inside UDP inside IPv6 inside an 802.11 frame, and every layer strips its own header without looking at the others. The same pattern shows up everywhere else in the encyclopedia, but it was invented here, in the Cerf-and-Kahn paper of 1974.

The second theme is **the control plane versus the data plane**. The control plane — BGP, OSPF, IS-IS, ARP, NDP — builds state. The data plane forwards packets at line rate. P4 and SDN are about exposing both as software. Almost every catastrophic outage in this category is a control-plane bug at network scale: ARPANET 1980, AS 7007 in 1997, Pakistan/YouTube in 2008, CenturyLink in 2020, Facebook in 2021, Rogers in 2022. The data plane is dumb on purpose; the control plane is smart and dangerous.

The third theme is **trust by default, cryptography by retrofit**. ARP trusts every reply. Classic BGP trusts every neighbour. IPv4 has no built-in authentication. Every cryptographic addition — MACsec, IPsec, RPKI, ASPA, BGPsec — has been bolted on after deployment, and the bolt-on is always slow. RPKI took fifteen years to cross 50% of IPv4 prefixes (May 2024). ASPA, which validates AS_PATH against provider authorisations, is the actively-deployed-soon successor — drafts -25 and -26 as of April 2026, with Cisco running an Early Field Trial on IOS-XR. Post-quantum is the next bolt-on: Cloudflare turned on hybrid post-quantum IPsec generally available in 2025.

The fourth theme is **transitions take decades, not years**. IPv6 was specified in 1998 and crossed 50% of Google's traffic in 2026 — 28 years. NSFNET retirement to commercial backbone took roughly a decade with CIDR (1993) and BGP-4 carrying the load. SRv6 versus SR-MPLS is the current generational transition in service-provider cores, and the migration paths documented in IETF SPRING/srv6ops drafts assume years of dual-stack and interworking, not a flag day. The lesson the category teaches is that flag days like ARPANET's 1 January 1983 cutover are the exception, not the rule.

## Where this connects in the book

- **Before the internet** — the ARPANET origin story and the 1969 first message; the necessary prologue to anything in this category.
- **The 1981 burst** — the year RFC 791, RFC 792, and RFC 793 all landed and the modern stack snapped into place.
- **The 1986 collapse** — Van Jacobson, congestion control, and the lesson that the network's behaviour at scale is not the sum of its endpoints.
- **OSI versus TCP/IP** — why the seven-layer ISO/OSI suite that governments blessed lost to the rough-running, free, deployed alternative.
- **The chapters on Ethernet, Wi-Fi, ARP/NDP, IPv4, IPv6, ICMP, and BGP** — one chapter per protocol in Part II of the book, the long-form pair to each protocol episode.
- **The 1980 ARPANET collapse** chapter, **the AS 7007 incident**, **the Pakistan/YouTube hijack**, **the China Telecom 18-minute hijack**, **the CenturyLink Flowspec loop**, **the Facebook 2021 outage**, **the Rogers 2022 outage** — every famous outage in the book that turns on a Layer 2 or Layer 3 failure.
- **The IPv6-mostly chapter on the Frontier page** — where the 28-year transition is going next.
- **The RPKI/ASPA chapter on the Frontier page** — what comes after 50% RPKI ROV adoption.
- **The Ultra Ethernet chapter on the Frontier page** — 800 GbE, 1.6 TbE, and the AI training fabrics driving lossless Ethernet.

## See also (other category episodes)

The Transport episode is the layer immediately above this one. TCP and UDP are what HTTP, DNS, SSH, and SMTP ride on, and both compute checksums over an IP pseudo-header — which is why a NAT box must rewrite them or break the connection. Everything in Network Foundations exists so that Transport has a network to send packets across.

The Wireless category is the sibling of this one at Layer 2. Wi-Fi (802.11) shares the same MAC abstraction as Ethernet, but uses CSMA/CA — collision avoidance — instead of CSMA/CD, and adds a complex management plane. Cellular, Bluetooth, UWB, NFC, and Zigbee all sit there too. When you trace a packet from your laptop, the Layer 1 and 2 it crosses on the first hop is almost always wireless these days.

The Utilities and Security category contains DNS, TLS, SSH, NTP, and the email stack — protocols that don't fit cleanly into the layered model but that everything else depends on. RPKI, the cryptographic underlay for BGP origin validation, lives there. The Facebook 2021 outage that opens this episode was a BGP withdrawal that took down DNS, which made the operations team's badge readers fail — three categories failing in cascade.

## Sources

### RFCs

- [RFC 791 — Internet Protocol (Postel, 1981)](https://www.rfc-editor.org/rfc/rfc791)
- [RFC 826 — An Ethernet Address Resolution Protocol (Plummer, 1982)](https://www.rfc-editor.org/rfc/rfc826)
- [RFC 1105 — A Border Gateway Protocol (Lougheed & Rekhter, 1989)](https://www.rfc-editor.org/rfc/rfc1105)
- [RFC 1918 — Address Allocation for Private Internets](https://datatracker.ietf.org/doc/html/rfc1918)
- [RFC 4271 — A Border Gateway Protocol 4 (BGP-4)](https://www.rfc-editor.org/rfc/rfc4271)
- [RFC 7454 — BGP Operations and Security BCP](https://datatracker.ietf.org/doc/html/rfc7454)
- [RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification](https://datatracker.ietf.org/doc/html/rfc8200)
- [RFC 9293 — Updated Transmission Control Protocol Specification](https://datatracker.ietf.org/doc/rfc9293/)
- [draft-ietf-sidrops-aspa-verification](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)
- [draft-ietf-sidrops-aspa-profile](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/)
- [draft-ietf-srv6ops-srv6-deployment](https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html)
- [draft-ietf-v6ops-claton](https://datatracker.ietf.org/doc/html/draft-ietf-v6ops-claton-07)
- [draft-sajassi-bess-evpn-fabric-migration](https://datatracker.ietf.org/doc/draft-sajassi-bess-evpn-fabric-migration/)

### Papers

- [Cerf & Kahn, "A Protocol for Packet Network Intercommunication," IEEE Trans. Comm., May 1974](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)
- [Furuness et al., "Securing BGP ASAP: ASPA and other Post-ROV Defenses," NDSS 2025](https://www.ndss-symposium.org/wp-content/uploads/2025-675-paper.pdf)
- [Wang et al., "A Large-Scale IPv6-Based Measurement of the Starlink Network," arXiv:2412.18243](https://arxiv.org/abs/2412.18243)
- [Singh et al., "Programmable Data Planes for Network Security," arXiv:2507.22165](https://arxiv.org/pdf/2507.22165)

### Vendor / engineering blogs

- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Cloudflare — Helping build a safer Internet by measuring BGP RPKI Route Origin Validation](https://blog.cloudflare.com/rpki-updates-data/)
- [Cloudflare — Post-quantum encryption for Cloudflare IPsec is generally available](https://blog.cloudflare.com/post-quantum-ipsec/)
- [Cloudflare — Analysis of the August 30 2020 CenturyLink/Level 3 outage](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)
- [Cloudflare's view of the Rogers Communications outage in Canada](https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Geoff Huston — BGP in 2025 (ISP Column, January 2026)](https://www.potaroo.net/ispcol/2026-01/bgp2025.html)
- [APNIC — Google hits 50% IPv6 (28 April 2026)](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- [MANRS — RPKI ROV Deployment Reaches Major Milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Kentik — Exploring the Latest RPKI ROV Adoption Numbers](https://www.kentik.com/blog/exploring-the-latest-rpki-rov-adoption-numbers/)
- [Kentik — A deeper dive into the Rogers outage](https://www.kentik.com/blog/a-deeper-dive-into-the-rogers-outage/)
- [Kentik — A Brief History of the Internet's Biggest BGP Incidents](https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/)
- [ThousandEyes — Facebook Outage Analysis](https://www.thousandeyes.com/blog/facebook-outage-analysis)
- [ThousandEyes — CenturyLink / Level 3 Outage Analysis](https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis)
- [NetPilot — EVPN-VXLAN Data Center Fabric: Complete 2026 Guide](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)
- [Cisco — Post-Quantum Resistant Secure WAN white paper](https://www.cisco.com/c/dam/en_us/about/trust-center/post-quantum-resistant-secure-wan-white-paper.pdf)
- [Ciena — Scaling transport networks: the transition to Segment Routing](https://www.ciena.com/insights/blog/2025/scaling-transport-networks-the-transition-to-segment-routing)
- [Samsung Research — IEEE 802.11bn (Ultra-High Reliability, Wi-Fi 8)](https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8)
- [IEEE SA — Ethernet's Next Bar is Now 800 Gb/s](https://standards.ieee.org/beyond-standards/ethernets-next-bar/)
- [IEEE P802.3dj task force home](https://www.ieee802.org/3/dj/index.html)
- [RIPE NCC — YouTube Hijacking: A RIS case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [Citizen Lab — Characterizing Large-Scale Routing Anomalies (China Telecom incident)](https://citizenlab.ca/2012/12/characterizing-large-scale-routing-anomalies-a-case-study-of-the-china-telecom-incident/)
- [CRTC — Assessment of Rogers Networks Following the 8 July 2022 Outage](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- [FCC — February 22 2024 AT&T Mobility Network Outage Report](https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf)
- [Bono, "7007 Explanation and Apology," NANOG, April 1997](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)
- [ACM — Bob Metcalfe Turing Award citation](https://awards.acm.org/award-recipients/metcalfe_3968158)
- [Computer History Museum — The Two-Napkin Protocol](https://computerhistory.org/blog/the-two-napkin-protocol/)

### News

- [The Register — Google: IPv6 carried half of internet traffic for one day (17 April 2026)](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
- [Cloudnews — IPv6 beats IPv4 on Google for the first time](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)
- [PBX Science — 28 Years to Cross the Line: Why Did IPv6 Take So Long to Reach 50%?](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)
- [Vice — Happy Anniversary to the Early Internet's First Network-Wide Crash](https://www.vice.com/en/article/happy-anniversary-to-the-early-internets-first-network-wide-crash/)

### Wikipedia

- [Ethernet](https://en.wikipedia.org/wiki/Ethernet)
- [Address Resolution Protocol](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)
- [Border Gateway Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- [IPv6 deployment](https://en.wikipedia.org/wiki/IPv6_deployment)
- [Radia Perlman](https://en.wikipedia.org/wiki/Radia_Perlman)
- [Terabit Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)
- [Wi-Fi 7 / IEEE 802.11be-2024](https://en.wikipedia.org/wiki/Wi-Fi_7)
- [IEEE 802.11bn](https://en.wikipedia.org/wiki/IEEE_802.11bn)
- [AS 7007 incident](https://en.wikipedia.org/wiki/AS_7007_incident)
- [2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [2022 Rogers Communications outage](https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage)
