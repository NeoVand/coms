---
prompt_source: deep-research-prompts.txt:13-181 (CATEGORY · NETWORK FOUNDATIONS)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/d03a32a0-fe34-4704-9dc4-c23d6cb07152
sources: 295
duration: 27m 4s
research_mode: claude.ai Research
---

# Network Foundations: A Research Report on the Layer 2–3 Protocols That Make the Internet Possible

*Compiled May 2026. Audience: working engineers and engineering teams. Reshape-ready for long-form articles, infographics, and a podcast series.*

---

## 1. Prerequisites and glossary

This is a working engineer's vocabulary list. Every term here recurs throughout the report. Keep this section as a sidebar in any derivative content.

- **Frame vs packet vs datagram.** A *frame* is the Layer-2 protocol data unit (PDU) — e.g., an Ethernet frame with MAC headers, FCS, and a payload. A *packet* is the Layer-3 PDU; in IP usage it is also called a *datagram* (emphasizing that it is independently routed and unreliable). Datagrams ride inside frames. (RFC 791; Tanenbaum 6e Ch. 3–5.)
- **MAC address.** A 48-bit (EUI-48) identifier burned into a NIC, with a U/L (Universal/Local) bit and an I/G (Individual/Group) bit. Globally unique when the OUI is registered with IEEE. (IEEE 802; RFC 7042.)
- **MTU / PDU.** Maximum Transmission Unit is the largest frame payload a link will carry without fragmenting. PDU is the generic term for "the chunk a layer hands its peer." Default Ethernet MTU is 1500 bytes; jumbo frames push to 9000+; IPv6 requires a 1280-byte minimum link MTU (RFC 8200 §5).
- **Unicast / multicast / broadcast / anycast.** Unicast: one sender → one receiver. Multicast: one → many subscribers (IPv4 224/4, IPv6 ff00::/8). Broadcast: one → all on a segment (IPv4 255.255.255.255 or subnet broadcast; IPv6 has no broadcast — it uses link-local multicast instead). Anycast: one address advertised from many places; routing picks the closest (used by root DNS, public resolvers like 1.1.1.1, CDNs).
- **ARP / MAC table.** ARP cache: an IPv4-host map of IP→MAC for hosts on the local segment (RFC 826). MAC (CAM) table: a switch's map of MAC→port, populated by learning source MACs of arriving frames.
- **Switching vs routing.** A switch forwards frames within a single broadcast domain using MAC tables (L2). A router forwards packets between subnets using a routing table and decrements TTL/Hop Limit (L3). Modern "L3 switches" do both.
- **Encapsulation.** Each layer wraps the layer above with its own header/trailer; on receive, each layer strips its own. The reason a single Wi-Fi 7 link can carry a TLS-protected gRPC call inside QUIC inside UDP inside IPv6 inside an 802.11 frame.
- **Autonomous System (AS).** A network or set of networks under a single routing policy, identified by an Autonomous System Number (ASN, 16- or 32-bit). The unit of inter-domain routing. (RFC 4271; RFC 6793 for 4-byte ASNs.)
- **Routing table vs forwarding table (RIB vs FIB).** The Routing Information Base is the control-plane database of all known routes. The Forwarding Information Base is the data-plane lookup structure (often programmed into ASIC TCAM) used at line-rate to forward packets.
- **Control plane vs data plane.** Control plane builds state (BGP/OSPF/IS-IS/ARP/NDP). Data plane forwards packets at line rate. P4 and SDN are about exposing both as software.
- **Link-local vs global.** Link-local addresses (IPv4 169.254/16, IPv6 fe80::/10) are valid only on a single link, never routed. Global addresses are routable across the Internet.
- **NAT / CGNAT.** Network Address Translation rewrites packet headers so many private IPs share a public IP. Carrier-Grade NAT does this at ISP scale. The reason IPv4 has lasted so long past exhaustion — and the reason end-to-end is broken on most networks today. [The Register](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
- **CIDR / subnetting.** Classless Inter-Domain Routing replaced fixed Class A/B/C with prefix-length notation (e.g., 10.0.0.0/8). Enabled aggregation that kept the BGP table from collapsing in the 1990s. (RFC 4632.)
- **TTL / Hop Limit.** Time-To-Live (IPv4) and Hop Limit (IPv6) are decrement-on-forward counters that kill looping packets. When zero, the router drops and may emit ICMP Time Exceeded — the basis of `traceroute`.
- **Half / full duplex.** Half: one direction at a time, with collisions (original CSMA/CD Ethernet on coax/hub). Full: simultaneous TX and RX on separate pairs (modern switched Ethernet — collisions are formally impossible).
- **Collision domain vs broadcast domain.** A collision domain is the set of stations that can collide; switches break collision domains. A broadcast domain is the set of stations that receive the same broadcast/flooded frames; routers break broadcast domains. VLANs slice broadcast domains logically over the same physical infrastructure.

Authoritative entry-points: the IETF Datatracker ([https://datatracker.ietf.org/](https://datatracker.ietf.org/)), IEEE 802 ([https://www.ieee802.org/](https://www.ieee802.org/)), and Geoff Huston's ISP Column at potaroo.net.

---

## 2. The arc of the group

The "Network Foundations" group did not arrive as a designed family — it congealed from three originally separate research streams in the early-to-mid 1970s, was force-fit into a coherent stack in the early 1980s, and has been continuously re-pressurized since.

**The three streams.** First: ARPANET (1969), which proved packet switching at scale and produced the Network Control Program (NCP), the first host-to-host protocol. Second: Xerox PARC, where Bob Metcalfe and David Boggs built the first 2.94 Mbps Ethernet in 1973 to connect Altos to laser printers; the patent application was filed in 1975 and the seminal *Communications of the ACM* paper, "Ethernet: Distributed Packet Switching for Local Computer Networks," appeared in July 1976. Third: Stanford and BBN, where Vint Cerf and Bob Kahn published "A Protocol for Packet Network Intercommunication" in *IEEE Transactions on Communications* in May 1974, defining what would split into TCP and IP and inventing the term "internet" for a network of networks. [Wikipedia + 2](https://en.wikipedia.org/wiki/Ethernet)

**The 1980 wake-up call.** On 27 October 1980 ARPANET collapsed for roughly four hours. A malfunctioning IMP corrupted routing tables; bit-dropping in storage produced multiple messages with different timestamps that the garbage collector could not order; the protocol's broadcast machinery then propagated the corruption everywhere. RFC 789 (Eric Rosen) is one of the great post-mortems in Internet history and arguably the first explicit lesson that *control-plane bugs at network scale are catastrophic in ways no individual node can prevent.* [Thisdayintechhistory + 2](https://thisdayintechhistory.com/10/27/first-major-arpanet-outage/)

**The 1981–1983 standardization burst.** RFC 791 (IPv4) and RFC 792 (ICMP) were published in September 1981 by Jon Postel; RFC 793 (TCP) followed. RFC 826 (ARP) by David Plummer landed in November 1982. ARPANET's "flag day" cutover from NCP to TCP/IP was 1 January 1983. IEEE 802 had been formed in February 1980 and ratified 802.3 (Ethernet) in 1983 with the famous "DIX" (Digital/Intel/Xerox) consortium behind it. The IETF itself was formed in January 1986. [RFC Editor](https://www.rfc-editor.org/rfc/rfc826)

**The architects (besides individual protocol authors).**

- **Robert Metcalfe & David Boggs** — Ethernet at PARC; Metcalfe received the 2022 ACM Turing Award for "the invention, standardization, and commercialization of Ethernet" ([https://awards.acm.org/award-recipients/metcalfe_3968158](https://awards.acm.org/award-recipients/metcalfe_3968158)). [ACM Awards](https://awards.acm.org/award-recipients/metcalfe_3968158)
- **Vinton Cerf & Robert Kahn** — TCP/IP architecture; 2004 Turing Award.
- **Jon Postel** — Editor of the early RFCs (791, 792, 793, 768) and IANA's first steward.
- **David Mills** — NTP, but also the "Fuzzball" routers and gateway algorithms that ran the early NSFNET backbone.
- **Paul Mockapetris** — DNS (RFC 1034/1035), without which IP addresses would still be passed around on paper.
- **Radia Perlman** — Spanning Tree Protocol (1985, IEEE 802.1D), enabling redundant Ethernet without broadcast storms; later TRILL. Her "Algorhyme" poem ("I think that I shall never see / A graph more lovely than a tree…") is in her STP patent ([https://en.wikipedia.org/wiki/Radia_Perlman](https://en.wikipedia.org/wiki/Radia_Perlman)). [Wikipedia](https://en.wikipedia.org/wiki/Radia_Perlman)[University of Washington](https://courses.cs.washington.edu/courses/cse461/14sp/lectures/spanningtreepoem.txt)
- **Steve Deering** — IP multicast and (with Bob Hinden) IPv6 (RFC 8200).
- **Yakov Rekhter, Kirk Lougheed, and Tony Li** — BGP. The protocol was sketched on three sheets of paper (the "two-napkin protocol") at the 12th IETF meeting in Austin, Texas, in January 1989, and published as RFC 1105 in June 1989 ([https://www.rfc-editor.org/rfc/rfc1105](https://www.rfc-editor.org/rfc/rfc1105)). The current standard is RFC 4271 (2006), still authored by Rekhter et al. [Wikipedia + 2](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- **Van Jacobson** — congestion control, traceroute, BPF; the reason the Internet survived the 1986 congestion collapse.

**Pivotal moments and dead ends.**

- **OSI vs TCP/IP (1980s).** The seven-layer ISO/OSI suite was the official standard, blessed by governments and the ITU; TCP/IP was the rough-running, free, deployed alternative. By 1992 OSI was effectively dead at the protocol level, though its layer model lives on as pedagogy.
- **NSFNET → commercial Internet (1995).** NSFNET decommissioning in April 1995 transferred backbone responsibility to commercial providers, requiring inter-provider policy routing — exactly what BGP-4 and CIDR (RFC 1519, 1993) had been built for.
- **IPv5 / ST-II.** The Internet Stream Protocol (RFC 1190, 1990) was assigned protocol version 5, which is why IPv6 (originally "IPng") got 6.
- **ATM-to-the-desktop (mid-1990s).** Asynchronous Transfer Mode promised connection-oriented cell switching all the way to the host. It lost to switched Ethernet on cost and the "dumb network, smart hosts" argument.
- **IPng selection (1993–1995).** Three serious proposals: TUBA (using OSI's CLNP), CATNIP, and SIPP (which won and became IPv6). RFC 1752 documents the choice. RFC 2460 (1998) was the original IPv6 spec; RFC 8200 (2017) is the current Internet Standard.
- **The 2008 BGP awakening.** When Pakistan Telecom hijacked YouTube (see §10), the operator community finally accepted that BGP's trust model required cryptographic underpinnings. RPKI work that had been niche academic research became operationally urgent.

---

## 3. Members and their roles

**Ethernet (1973 invention; July 1976 paper; IEEE 802.3-1983 first standard).** The default Layer-2 fabric of wired networks. Originally CSMA/CD on shared coax; today, full-duplex switched point-to-point links from 10 Mbps up to 800 Gbps (IEEE 802.3df-2024) with 1.6 Tbps standardization (IEEE P802.3dj) targeted for 2026. An engineer reaches for Ethernet whenever the question is "how do I get bits across this room/building/rack?"

**802.11 / Wi-Fi (first standard 1997, 802.11-1997, 2 Mbps).** Wireless LAN. Same MAC abstraction as Ethernet (broadly), but with CSMA/CA (collision avoidance) and a complex management plane. Current generation Wi-Fi 7 / 802.11be was published 22 July 2025; Wi-Fi 8 / 802.11bn ("Ultra High Reliability") is targeted for 2028 ([https://www.ieee802.org/11/](https://www.ieee802.org/11/)). [IEEE802](https://www.ieee802.org/11/)[Wikipedia](https://en.wikipedia.org/wiki/IEEE_802.11bn)

**ARP — Address Resolution Protocol (RFC 826, November 1982, David Plummer).** Resolves IPv4 address → MAC on a local segment by broadcasting "who has 192.0.2.7? tell 192.0.2.1." Operates below IP as part of the L2/L3 boundary. Stateless, trust-based, and the basis of "ARP poisoning" attacks. Used only on IPv4; IPv6 replaced it with NDP. [Wikipedia](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)

**IPv4 — Internet Protocol version 4 (RFC 791, September 1981).** 32-bit addresses, 20-byte header (without options), hop-by-hop forwarding using longest-prefix match in CIDR. Effectively exhausted at IANA in February 2011 and at the RIRs over the next decade; survives via NAT and a thriving secondary market.

**IPv6 — Internet Protocol version 6 (RFC 1883, 1995; RFC 2460, 1998; RFC 8200, July 2017 — current Internet Standard 86).** 128-bit addresses (340 undecillion), simplified fixed 40-byte header, no in-network fragmentation (PMTUD via RFC 8201), extension-header chain, and link-local addresses by default. As of late March 2026, Google measured a peak of 50.1% of its traffic over IPv6 — the first time IPv6 has crossed 50% on that dashboard, although weekday averages remain ~45–48% ([https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/), [https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)). Cloudflare Radar puts IPv6 HTTP request share at ~40.1% and APNIC Labs puts IPv6-capable networks at ~43.13% — so the milestone is real but not uniform. [The Register + 4](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)

**BGP — Border Gateway Protocol (RFC 1105, June 1989; current RFC 4271, January 2006).** Path-vector inter-domain routing protocol on TCP/179. Carries ~975K IPv4 and ~225K IPv6 prefixes globally as of January 2026 per Geoff Huston's annual review ([https://www.potaroo.net/ispcol/2026-01/bgp2025.html](https://www.potaroo.net/ispcol/2026-01/bgp2025.html)). Every commercial peering and transit relationship on the public Internet rides BGP. The protocol the rest of the stack quietly depends on; when BGP misbehaves, the Internet visibly breaks. [RFC Editor](https://www.rfc-editor.org/rfc/rfc4271.html)[RFC Editor](https://www.rfc-editor.org/rfc/rfc1105)

**ICMP — Internet Control Message Protocol (RFC 792, September 1981; ICMPv6 RFC 4443).** Sibling of IP that carries error and diagnostic messages: Echo Request/Reply (ping), Destination Unreachable, Time Exceeded (traceroute's engine), Packet Too Big (Path MTU Discovery's engine), Redirect. ICMPv6 is structurally larger because NDP and MLD are built on top of it.

### Members to add (verified relevant)

**NDP — Neighbor Discovery Protocol (RFC 4861).** IPv6's replacement for ARP plus router discovery, prefix discovery, and Duplicate Address Detection. Uses ICMPv6 multicast on the link.

**DHCP / DHCPv6 (RFC 2131; RFC 8415).** Dynamic Host Configuration. On IPv4, the standard host-bootstrap mechanism. On IPv6, DHCPv6 is optional and often paired with SLAAC; DHCPv6-PD (Prefix Delegation) is how Starlink, mobile carriers, and home ISPs hand /56 or /64 prefixes to CPE. [CellStream](https://www.cellstream.com/2025/05/06/does-starlink-support-ipv6/)

**RA / SLAAC (RFC 4862).** Router Advertisement-driven Stateless Address Autoconfiguration: the IPv6 host learns the prefix and default router from RAs and self-assigns an address using either EUI-64 or RFC 7217 stable-private addressing.

**OSPF (RFC 2328 for v2; RFC 5340 for v3).** Open Shortest Path First, the dominant link-state IGP. Uses Dijkstra over a flooded link-state database within a routing area. The default IGP for many enterprise networks.

**IS-IS (ISO 10589; RFC 1195 for IP integration).** Link-state IGP from the OSI world that survived because it scales better than OSPF in very large operator networks. Common in service provider cores.

**RIP (RFC 1058 / RFC 2453).** Routing Information Protocol — distance-vector with hop count, max 15 hops. Now a teaching protocol; obsolete operationally.

**EIGRP (RFC 7868).** Cisco's enhanced distance-vector (originally proprietary, opened 2013). Diffusing Update Algorithm (DUAL); largely confined to Cisco enterprise.

**MPLS (RFC 3031).** Multi-Protocol Label Switching: 4-byte shim header inserted between L2 and L3 carrying a 20-bit label that drives label-swap forwarding. Underpins almost every service-provider VPN and traffic-engineered backbone.

**VLAN / 802.1Q (IEEE 802.1Q-2022).** 12-bit VLAN ID inserted in the Ethernet header; logically partitions a switched fabric into separate broadcast domains.

**STP / RSTP (IEEE 802.1D-1998 / 802.1w / 802.1Q).** Spanning Tree, Rapid STP, MSTP. Builds a loop-free active topology over a meshed bridged network. Radia Perlman's contribution.

**LACP (IEEE 802.1AX).** Link Aggregation Control Protocol bundles multiple physical links into a single logical link with load distribution and fault tolerance.

**LLDP (IEEE 802.1AB).** Link Layer Discovery Protocol — neighbor discovery between switches and other 802.1 devices. The vendor-neutral cousin of CDP.

**PPP (RFC 1661) / PPPoE (RFC 2516).** Point-to-Point Protocol, the framing/auth/IPCP layer for serial and DSL links. PPPoE wraps PPP in Ethernet for residential broadband.

**GRE (RFC 2784/2890).** Generic Routing Encapsulation: minimalist L3 tunneling protocol, often used to wrap arbitrary payloads inside IP.

**VXLAN (RFC 7348).** Virtual eXtensible LAN: 24-bit VNI, MAC-in-UDP, port 4789. The dominant data-center overlay encapsulation.

**Geneve (RFC 8926).** Generic Network Virtualization Encapsulation: VXLAN's extensible successor with TLV options. Adopted by NSX, Open vSwitch, and increasingly by hyperscaler fabrics.

**SRv6 / Segment Routing (RFC 8402; RFC 8754 for SRv6 SRH; RFC 8986 for the network-programming model).** Source-routed paths encoded as a list of IPv6 addresses (SRv6) or MPLS labels (SR-MPLS). Eliminates LDP/RSVP-TE complexity by pushing path state to the ingress.

**BFD (RFC 5880).** Bidirectional Forwarding Detection: sub-second liveness for any L3 next hop, used to drive faster IGP/BGP convergence.

**IGMP / MLD / PIM (RFC 3376; RFC 3810; RFC 7761).** IGMP/MLD let hosts join multicast groups; PIM (Protocol Independent Multicast) builds the inter-router distribution trees. The plumbing for IPTV, financial multicast feeds, and intra-DC pub/sub.

**802.1X (IEEE 802.1X-2020).** Port-based network access control with EAP. The reason your laptop authenticates before getting a working enterprise IP.

**MACsec (IEEE 802.1AE; key agreement via 802.1X-MKA).** AES-GCM line-rate encryption at L2, hop-by-hop. The link-layer counterpart to IPsec.

**IPsec (RFC 4301/4303 for ESP, RFC 7296 for IKEv2).** End-to-end or gateway-to-gateway authentication and encryption at L3. Cloudflare turned on hybrid post-quantum (ML-KEM) IPsec generally available in 2025 ([https://blog.cloudflare.com/post-quantum-ipsec/](https://blog.cloudflare.com/post-quantum-ipsec/)).

---

## 4. Internal taxonomy — how to mentally cluster the members

Useful axes:

| Axis | Pole A | Pole B |
|---|---|---|
| Layer | L2 (Ethernet, 802.11, ARP, NDP, STP, LACP, LLDP, MACsec, VLAN, PPP, MPLS) | L3 (IPv4/6, ICMP, BGP, OSPF, IS-IS, RIP, EIGRP, IPsec, GRE, VXLAN payload, Geneve payload, SRv6) |
| Forwarding scope | Broadcast domain (ARP, STP, NDP, IGMP) | Routed (IP, BGP, OSPF, IS-IS) |
| Routing scope | Intra-domain / IGP (OSPF, IS-IS, EIGRP, RIP) | Inter-domain / EGP (BGP) |
| Algorithm | Distance-vector (RIP, EIGRP) | Link-state (OSPF, IS-IS) |
|  | Path-vector (BGP) | Source-routing (Segment Routing) |
| State | Stateless (IP, ICMP, ARP request) | Stateful (BGP session, OSPF adjacency, BFD session) |
| Function | Address resolution (ARP, NDP) | Forwarding (Ethernet bridging, IP) / Routing (BGP, OSPF) |
| Medium | Wired (Ethernet 802.3) | Wireless (802.11, 802.15.4) |
| Topology assumption | Multi-access (Ethernet, 802.11) | Point-to-point (PPP, most modern fiber Ethernet) |
| Trust model | Implicit (ARP, classic BGP) | Cryptographic (MACsec, IPsec, RPKI/ROV, BGPsec, ASPA) |

**A pragmatic decision tree.**

1. *Are you on a single segment?* → L2 problem. Use Ethernet/802.11 + ARP/NDP. If you have loops or redundancy, STP/RSTP. If you need many segments on one wire, VLANs. If you need link bonding, LACP.
2. *Do you need to cross subnets?* → L3 problem. IPv4 if you have addresses; IPv6 always alongside.
3. *Within one administrative domain?* → IGP. Pick OSPF for typical enterprise; IS-IS if you're a service provider or hyperscaler; static + BFD for small deterministic topologies.
4. *Between administrative domains?* → BGP. There is no alternative.
5. *Need traffic engineering or service overlays?* → MPLS (legacy), SR-MPLS (modern, simpler), or SRv6 (greenfield, IPv6-native).
6. *Need DC overlay?* → EVPN-VXLAN today; Geneve where extensibility matters.
7. *Need encryption?* → MACsec for hop-by-hop on a campus or DCI; IPsec for tunnel-mode WAN; TLS/QUIC for application sessions.

---

## 5. How this group interacts with other protocol groups

L2-L3 is the *substrate* on which everything else is constructed. The relationships are layered, but with several non-obvious couplings.

- **Transport (TCP, UDP, QUIC).** TCP and UDP are L4 over IP; both compute checksums over an IP pseudo-header (RFC 9293 §3.1, RFC 8200 §8.1 for IPv6), which is why a NAT box must rewrite them or break the connection. QUIC (RFC 9000) is UDP-encapsulated and pulls reliable transport into user space, but it still hits exactly the same MTU, ECMP, and middlebox issues as TCP — and on IPv6-only mobile networks, its UDP packets traverse 464XLAT (RFC 6877) just like everything else. [IETF](https://www.ietf.org/rfc/rfc9293.pdf)
- **Web/API (HTTP, gRPC).** HTTP/3 is QUIC over UDP over IP. gRPC is HTTP/2 today, HTTP/3 increasingly. None of them care which IP version they ride on, but BGP route leaks and IPv6 RA storms still take them all down.
- **Asynchronous and IoT (MQTT, AMQP, CoAP).** MQTT/AMQP run over TCP; CoAP runs over UDP and is specifically designed for constrained 6LoWPAN networks where IPv6 has been compressed to fit IEEE 802.15.4 frames (RFC 6282). The IPv6 mandate in 3GPP Release 8 is a major reason cellular IoT works at all. [Wikipedia](https://en.wikipedia.org/wiki/IPv6_deployment)
- **Real-time A/V (RTP, WebRTC, SRT).** RTP runs over UDP. WebRTC adds ICE/STUN/TURN to negotiate around NAT — a problem that wouldn't exist if IPv6 were universal. SRT (Secure Reliable Transport) is increasingly used over public Internet for broadcast contribution.
- **Utilities and security (TLS, DNSSEC, RPKI).** TLS doesn't care about L3, but TLS-over-QUIC's handshake interacts with IP fragmentation and MTU. DNSSEC's chain of trust is independent of routing, but BGP hijacks of DNS infrastructure have real consequences (the Facebook 2021 outage was a *withdrawal* of DNS-server prefixes). RPKI (RFC 6480, 6482, 8210) is the cryptographic underlay for BGP origin validation; it depends on the routing it secures, which is one reason its bootstrap took so long.

**Stack position.** In OSI: this group is L1 (PHY parts of Ethernet/802.11), L2 (frames, MAC, switching, VLANs, MPLS arguably), and L3 (IP, ICMP, routing). In the TCP/IP four-layer model: Link + Internet layers. Everything above is "the application" by Internet-engineering convention.

**Dependency direction.** Almost everything depends on this group; this group depends only on physical-layer encoding (cable specs, radio standards, optics MSAs) and on DNS for human usability — though the protocols themselves work fine without DNS, which is why outage post-mortems often distinguish "DNS down" from "BGP down."

---

## 6. Common patterns and failure modes

**Recurring design patterns.**

- **Hop-by-hop forwarding** with **TTL/Hop Limit decrement** — the universal escape valve against routing loops.
- **Address resolution** at the L2/L3 boundary (ARP, NDP).
- **Neighbor discovery and hello/keepalive messages** — every routing protocol has its own (OSPF Hello, IS-IS Hello, BGP KEEPALIVE, BFD Control), with **hold timers** that determine how long a silent neighbor takes to be declared dead.
- **Split horizon and poison reverse** — distance-vector loop suppression by not re-advertising a route back where you learned it (split horizon), or advertising it with infinite metric (poison reverse).
- **Graceful restart / NSR / NSF** — letting the data plane keep forwarding while the control plane reboots.
- **ECMP (Equal-Cost Multi-Path)** — load-spread by hashing on a 5-tuple (often src/dst IP + src/dst port + protocol). The hash collisions are why "elephant flows" still cause problems.
- **Fragmentation and reassembly** — IPv4 routers may fragment; IPv6 routers must not (RFC 8200), so PMTUD becomes load-bearing.
- **Path MTU Discovery** (RFC 8201) — sender lowers MSS on receipt of ICMP Packet Too Big.
- **Longest-prefix match** — the foundational FIB lookup rule that lets `/24`s override `/16`s and is, simultaneously, the reason BGP hijacks of more-specifics work.

**Group-wide failure modes.**

- **Routing loops** (microloops during convergence; durable loops from misconfiguration).
- **Broadcast storms** in L2 networks without STP — the failure mode Perlman invented STP to prevent.
- **MAC flapping** when the same MAC appears on multiple ports (bridging loops, dual-homed VMs without LACP).
- **ARP poisoning / Gratuitous ARP attacks** — local L2 trust exploited.
- **BGP route leaks and hijacks** — propagation of routes outside agreed policy boundaries (RFC 7908 taxonomy). RPKI ROV mitigates origin hijacks; ASPA (draft-ietf-sidrops-aspa-verification, expected to publish 2026) mitigates leaks.
- **IPv6 RA flooding** — rogue Router Advertisements blackhole IPv6 traffic; mitigation is RA Guard (RFC 6105).
- **Asymmetric routing** — paths return via a different route than they took out, breaking stateful middleboxes.
- **MTU black holes** — ICMP "Packet Too Big" filtered, sender never learns to lower MTU, large packets vanish silently. Has bitten enterprise tunnels for 30 years.
- **Blackholing** — both the diagnostic kind (a /24 sinkhole for DDoS mitigation, RTBH) and the failure kind (Pakistan→YouTube).
- **Microloops** — during reconvergence, two routers briefly disagree about the next hop. Loop-Free Alternates (RFC 5286) and TI-LFA in segment routing exist to suppress them.

---

## 7. Industry timeline

**The last 50 years, compressed.**

- 1973 → first Ethernet at PARC.
- 1974 → Cerf/Kahn TCP paper.
- 1981 → RFCs 791/792/793 (IPv4, ICMP, TCP).
- 1983 → ARPANET cuts over to TCP/IP; first 802.3 standard.
- 1985 → Perlman invents STP.
- 1989 → BGP designed at IETF Austin; RFC 1105.
- 1995 → NSFNET retires; Internet commercialized; CIDR fully deployed; IPv6 design selected.
- 1997 → first 802.11 (Wi-Fi).
- 1998 → RFC 2460 (IPv6).
- 2008 → Pakistan/YouTube hijack catalyzes RPKI; first commercial 802.11n.
- 2011 → IANA exhausts unallocated IPv4.
- 2017 → RFC 8200 promotes IPv6 to Internet Standard.
- 2024 → IEEE 802.3df-2024 standardizes 800 GbE; Wi-Fi 7 certification opens (8 January 2024); RPKI ROV crosses 50% of IPv4 prefixes ([https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)). [Wikipedia](https://en.wikipedia.org/wiki/Wi-Fi_7)[MANRS](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- 2025 → IEEE 802.11be (Wi-Fi 7) published 22 July 2025; Cloudflare ships hybrid post-quantum IPsec; SRv6 adoption accelerates in Tier-1 service-provider transport networks. [IEEE802](https://www.ieee802.org/11/)
- March 2026 → IPv6 reaches 50.1% of Google traffic for the first time. [Cloudnews](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)

**What replaced what.**

- Token Ring → Ethernet (cost, simplicity, full-duplex switching).
- Frame Relay / ATM → MPLS (mid-2000s) → Segment Routing (SR-MPLS today, SRv6 selectively).
- LDP/RSVP-TE → SR-MPLS (control plane simplification — no LDP needed).
- OTV/VPLS → EVPN-VXLAN in DCs ([https://www.netpilot.io/blog/evpn-vxlan-data-center-guide](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)). [Netpilot](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)
- RIP/IGRP → OSPF/IS-IS in any non-trivial network.
- Classful routing → CIDR (1993).
- Spanning Tree as the *active* loop-prevention in DCs → BGP-based fabrics with EVPN.
- IPv4 with NAT → IPv6 + 464XLAT in mobile carriers; mobile US carriers averaged ~87% IPv6 in 2026, with T-Mobile ~93% ([https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)). [PBX Science](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)

**Active in 2025–2026.**

- IEEE P802.3dj (200/400/800 G/1.6 T with 200 G per lane) targeting July 2026 completion ([https://www.ieee802.org/3/dj/index.html](https://www.ieee802.org/3/dj/index.html)). [Wikipedia](https://en.wikipedia.org/wiki/Terabit_Ethernet)
- IETF SIDROPS finishing ASPA profile and verification drafts (aspa-profile-26 and aspa-verification-25, April 2026; [https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)).
- IETF V6OPS pushing 464XLAT/CLAT recommendations (draft-ietf-v6ops-claton).
- IETF SPRING / 6MAN refining SRv6 deployment guidance and SRv6 ↔ SR-MPLS interworking.
- IETF BESS / EVPN-VXLAN underlay migration from IPv4 to IPv6.
- IEEE 802.11bn (Wi-Fi 8 / Ultra High Reliability) — Draft 1.0 reached July 2025; final ratification expected 2028. [Samsung Research](https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8)

**Who's pushing.**

- **IEEE 802.3** for Ethernet PHYs and rates.
- **IEEE 802.11** for Wi-Fi.
- **IETF working groups**: IDR (BGP), 6MAN (IPv6 maintenance), V6OPS (IPv6 operations), GROW (global routing operations), BABEL (Babel routing protocol), BESS (EVPN/L2VPN/L3VPN services), LSR (link-state routing — OSPF, IS-IS), RTGWG (routing area working group), SIDROPS (RPKI/BGPsec/ASPA), SPRING (segment routing), IPSECME (IPsec maintenance, including post-quantum).
- **Hyperscalers** (Meta, Google, AWS, Microsoft) drive scale requirements and program much of their own data-plane (Meta's Express Backbone, Google's B4/Jupiter, AWS's Scalable Reliable Datagram).
- **Open source**: FRRouting ([https://frrouting.org/](https://frrouting.org/)), BIRD ([https://bird.network.cz/](https://bird.network.cz/)), OpenBGPD, sFlow, Containerlab, netlab.
- **Academia**: CAIDA, MIT, Stanford, Princeton, CMU, ETH Zürich, Columbia, NDSS / SIGCOMM / NSDI / IMC venues.
- **Operator forums**: NANOG (North America), RIPE (Europe), APNIC (Asia-Pacific), AfriNIC, LACNIC, APRICOT.

---

## 8. Recommended learning paths (current as of 2026)

**Best learning order.** (i) Ethernet + ARP/NDP + Wi-Fi at the wire level. (ii) IPv4 then IPv6 addressing and forwarding. (iii) ICMP and traceroute. (iv) Static routing → RIP (just for the model) → OSPF/IS-IS. (v) BGP. (vi) MPLS / Segment Routing. (vii) Overlays: VXLAN/Geneve/EVPN. (viii) Security: IPsec, MACsec, RPKI, ASPA. (ix) Modern data-center fabrics (BGP-everywhere, EVPN-VXLAN). (x) Operations: BFD, ECMP hashing, MTU, observability (sFlow/IPFIX).

### RFCs (with section pointers)

- **RFC 791** — IPv4 Specification (1981). §3 (header format), §3.2 (fragmentation). [https://www.rfc-editor.org/rfc/rfc791](https://www.rfc-editor.org/rfc/rfc791)
- **RFC 792** — ICMP. Echo, Time Exceeded, Destination Unreachable.
- **RFC 826** — ARP. Read it once; it's seven pages and still essentially correct. [https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826)
- **RFC 1918** — Private address allocation (10/8, 172.16/12, 192.168/16). [https://datatracker.ietf.org/doc/html/rfc1918](https://datatracker.ietf.org/doc/html/rfc1918) [IETF](https://datatracker.ietf.org/doc/html/rfc1918)
- **RFC 2460 / RFC 8200** — IPv6 specification; current STD 86. §3 header, §4 extension headers, §5 packet size. [https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200)
- **RFC 8201** — Path MTU Discovery for IPv6.
- **RFC 4271** — BGP-4. §5 (path attributes), §9 (UPDATE handling and decision process). [https://www.rfc-editor.org/rfc/rfc4271](https://www.rfc-editor.org/rfc/rfc4271)
- **RFC 9293** — Updated TCP specification (2022) — though TCP is L4, this is the canonical text for the IP/TCP boundary, including IPv6 pseudo-header. [https://datatracker.ietf.org/doc/rfc9293/](https://datatracker.ietf.org/doc/rfc9293/) [Hjp](https://www.hjp.at/doc/rfc/rfc9293.html)
- **RFC 7454** — BGP operations and security BCP. [https://datatracker.ietf.org/doc/html/rfc7454](https://datatracker.ietf.org/doc/html/rfc7454)
- **RFC 6480 / RFC 6482 / RFC 8210** — RPKI architecture, ROA profile, RTR protocol.
- **RFC 7432 / RFC 8365** — EVPN; VXLAN-based EVPN.
- **RFC 7348 / RFC 8926** — VXLAN; Geneve.
- **RFC 8402 / RFC 8754 / RFC 8986** — Segment Routing architecture; SRv6 SRH; SRv6 network programming.
- **RFC 7908** — Problem definition and classification of BGP route leaks.
- **Internet-Drafts of note in 2026**: draft-ietf-sidrops-aspa-verification-25, draft-ietf-sidrops-aspa-profile-26, draft-ietf-srv6ops-srv6-deployment, draft-ietf-v6ops-claton.

### Books (verify edition)

- **Tanenbaum, Feamster & Wetherall — *Computer Networks* (6th ed., Pearson, 2021).** Chapters 3–5 cover the data link layer through the network layer end-to-end. *Intermediate.* [https://www.pearson.com/en-us/pearsonplus/p/9780137523214](https://www.pearson.com/en-us/pearsonplus/p/9780137523214) [Pearson](https://www.pearson.com/se/Nordics-Higher-Education/subject-catalogue/information-systems/Computer-networks-6e1.html)
- **Kurose & Ross — *Computer Networking: A Top-Down Approach* (8th ed., Pearson, 2020/21).** Chapters 4–6 (Network Layer Data Plane, Network Layer Control Plane, Link Layer and LANs). *Intro to intermediate.* [https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780135928615](https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780135928615) [Scribd](https://www.scribd.com/document/1012398554/Computer-Networking-A-Top-Down-Approach-8th-Edition-James-F-Kurose-instant-ebook-access)
- **Peterson & Davie — *Computer Networks: A Systems Approach* (6th/7th ed.; companion site at [https://book.systemsapproach.org/](https://book.systemsapproach.org/)).** *Intermediate.*
- **Russ White — *Computer Networking Problems and Solutions* (Addison-Wesley, 2017; current).** Best book for *why* networks make the design choices they do. *Intermediate to advanced.*
- **Doyle & Carroll — *Routing TCP/IP, Volume I & II* (Cisco Press; latest editions).** Standard for IGPs and BGP from a vendor-CLI perspective. *Intermediate.*
- **Halabi — *Internet Routing Architectures* (Cisco Press; 2nd ed. is the canonical BGP text; supplement with Iljitsch van Beijnum's *BGP* O'Reilly book).** *Advanced for BGP.*
- **W. Richard Stevens — *TCP/IP Illustrated, Vol. 1* (2nd ed., 2011, with Kevin Fall).** Still the gold-standard packet-level walkthrough. *Intermediate.*
- **Perlman — *Interconnections: Bridges, Routers, Switches and Internetworking Protocols* (2nd ed., 1999).** Older but uniquely clear on bridging vs routing. *Intermediate.*

### Academic papers

- Cerf & Kahn, "A Protocol for Packet Network Intercommunication," *IEEE Trans. Comm.* COM-22(5):637–648, May 1974. Reprint: [https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf) [SCIRP](https://www.scirp.org/reference/referencespapers?referenceid=3816515)
- Metcalfe & Boggs, "Ethernet: Distributed Packet Switching for Local Computer Networks," *CACM* 19(7):395–404, July 1976. DOI: 10.1145/360248.360253.
- Rosen, "Vulnerabilities of Network Control Protocols: An Example," RFC 789 / *ACM SIGSOFT SEN* 6(1), 1981 — the 1980 ARPANET collapse post-mortem.
- Bates et al., "BGP Route Flap Damping," RFC 2439 (and the long subsequent literature retracting much of it).
- Goldberg et al., "How Secure are Secure Interdomain Routing Protocols?" *SIGCOMM* 2010 — the realistic baseline for what BGP security can and can't deliver.
- Furuness et al., "Securing BGP ASAP: ASPA and other Post-ROV Defenses," *NDSS* 2025 ([https://www.ndss-symposium.org/wp-content/uploads/2025-675-paper.pdf](https://www.ndss-symposium.org/wp-content/uploads/2025-675-paper.pdf)).
- Wang et al., "A Large-Scale IPv6-Based Measurement of the Starlink Network," arXiv:2412.18243 (v3 23 January 2026) — first comprehensive measurement of Starlink's IPv6 backbone, identifying 49 PoPs and ~5.98M user routers. [arXiv](https://arxiv.org/abs/2412.18243)

### Engineering blog posts (vetted for 2024–2026 relevance)

- Cloudflare blog, "Understanding how Facebook disappeared from the Internet" (4 Oct 2021) — [https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/)
- Cloudflare, "Helping build a safer Internet by measuring BGP RPKI Route Origin Validation" — [https://blog.cloudflare.com/rpki-updates-data/](https://blog.cloudflare.com/rpki-updates-data/)
- Cloudflare, "Post-quantum encryption for Cloudflare IPsec is generally available" (2025) — [https://blog.cloudflare.com/post-quantum-ipsec/](https://blog.cloudflare.com/post-quantum-ipsec/)
- Meta Engineering, "More details about the October 4 outage" (5 Oct 2021) — [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- ThousandEyes, "Facebook Outage Analysis" / "Rogers Outage Analysis: July 8, 2022" / "CenturyLink/Level 3 Outage Analysis."
- Kentik blog, Doug Madory's RPKI ROV adoption series and "A Brief History of the Internet's Biggest BGP Incidents."
- APNIC Blog ([https://blog.apnic.net/](https://blog.apnic.net/)) — Geoff Huston, "Google hits 50% IPv6" (28 Apr 2026), and the ISP Column at [https://www.potaroo.net/](https://www.potaroo.net/).
- RIPE Labs ([https://labs.ripe.net/](https://labs.ripe.net/)) — measurement and policy.
- AWS, "Public IPv4 address charge" announcement (Feb 2024, $0.005/hour effective change that materially shifted hyperscaler IPv6 economics).

### YouTube and talks

- **Ben Eater**, "Networking" series — physical-layer through Ethernet for a hardware audience.
- **David Bombal** — Cisco-flavored intros to OSPF/EIGRP/BGP/Wireshark.
- **Computerphile** — short animated explainers (BGP, IPv6, NAT, Ethernet history with Metcalfe).
- **Ivan Pepelnjak's ipSpace.net** — webinars and the "Network Engineering" YouTube channel; current as of 2026 ([https://blog.ipspace.net/](https://blog.ipspace.net/)).
- **NANOG conference recordings** ([https://www.nanog.org/](https://www.nanog.org/)) — Doug Madory's BGP analyses, Job Snijders on RPKI/ASPA.
- **RIPE meeting recordings** ([https://ripe.net/](https://ripe.net/)) — operational war stories from European ISPs.

### Podcasts

- **Heavy Networking / Packet Pushers** — long-form interviews; the de-facto industry podcast ([https://packetpushers.net/](https://packetpushers.net/)).
- **IPv6 Buzz** (Packet Pushers family) — IPv6 deployment stories.
- **The Hedge** with Russ White, Tom Ammon, Eyvonne Sharp — design and protocol depth.
- **Telemetry Now** (Kentik) — measurement and routing security.
- **NANOG Stories**.

### Free university courses

- **Stanford CS144 — Introduction to Computer Networking** (Nick McKeown, Phil Levis). Re-runs annually; the 2025 offering ran Sep–Dec 2025. The lab builds a TCP/IP stack and an IP router in C++ from scratch. [https://cs144.github.io/](https://cs144.github.io/). *Intro/intermediate, hands-on.* [Stanford Online](https://online.stanford.edu/courses/cs144-introduction-computer-networking)[CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- **MIT 6.829 — Computer Networks** (graduate); 6.5810 (formerly 6.S081) for systems-style depth.
- **Princeton COS 461 — Computer Networks** (Jen Rexford / Mike Freedman).
- **Berkeley CS168 — Introduction to the Internet: Architecture and Protocols.**
- **CMU 15-441 — Computer Networks.**

### Hands-on tools

- **Wireshark** — packet capture and dissection. [https://www.wireshark.org/](https://www.wireshark.org/)
- **tcpdump / tshark** — CLI capture.
- **scapy** — Python packet crafting. Essential for understanding ARP, NDP, ICMPv6.
- **GNS3 / EVE-NG** — VM-based emulation with vendor images.
- **Containerlab** (Nokia-led, MIT-licensed) — modern lab tool, lightweight, FRR/SR Linux/cEOS/SR OS images. [https://containerlab.dev/](https://containerlab.dev/) [Open-Source Network Simulators](https://brianlinkletter.com/2021/05/use-containerlab-to-emulate-open-source-routers/)
- **netlab** (Ivan Pepelnjak) — declarative topologies on top of Containerlab.
- **Mininet** — SDN-focused emulation.
- **Cisco Packet Tracer** — for CCNA-style learning.
- **FRRouting** — open-source routing daemon (BGP, OSPF, IS-IS, LDP, BFD). [https://frrouting.org/](https://frrouting.org/)
- **BIRD / OpenBGPD** — alternate BGP daemons; OpenBGPD especially common in IXPs.
- **BGP Looking Glasses** — e.g., RIPE NCC RIS Live, Hurricane Electric ([https://lg.he.net/](https://lg.he.net/)), RouteViews ([https://www.routeviews.org/](https://www.routeviews.org/)).
- **RPKI validators** — Routinator (NLnet Labs), Fort, rpki-client.
- **BGPlay / BGPalerter** — visualizing and alerting on BGP changes.
- **RIPE Atlas** — globally distributed measurement probes ([https://atlas.ripe.net/](https://atlas.ripe.net/)).
- **NIST RPKI Monitor** — [https://rpki-monitor.antd.nist.gov/](https://rpki-monitor.antd.nist.gov/)

### Conferences

- **ACM SIGCOMM** — annual research summit.
- **USENIX NSDI / OSDI** — networked systems research.
- **ACM IMC** — Internet measurement.
- **NANOG / RIPE / APRICOT / AfriNIC / LACNIC** — operator meetings.
- **IETF** — three meetings a year; recordings at [https://www.ietf.org/how/meetings/](https://www.ietf.org/how/meetings/).
- **NDSS** — security side, increasingly relevant for routing security.

---

## 9. Where things are heading (2025–2026 frontier)

**BGP routing security.** RPKI ROV crossed the inflection point. By May 2024, more than 50% of IPv4 routes had ROAs; roughly three-quarters of IP traffic was bound for RPKI-secured destinations ([https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)). Cloudflare's separate measurement of *enforcement* (ASes that drop invalids) puts the directly-protected user population at ~261M (~6.5%), but, because almost every Tier-1 transit drops invalids, *indirect* validation suppresses invalid-route propagation by a factor of two to three ([https://blog.cloudflare.com/rpki-updates-data/](https://blog.cloudflare.com/rpki-updates-data/), [https://www.kentik.com/blog/exploring-the-latest-rpki-rov-adoption-numbers/](https://www.kentik.com/blog/exploring-the-latest-rpki-rov-adoption-numbers/)). MANRS surpassed 1,190 participants in 2024 and continued growing through 2025 under Global Cyber Alliance stewardship ([https://manrs.org/2025/02/manrs-update-one-year-under-gca/](https://manrs.org/2025/02/manrs-update-one-year-under-gca/)). [MANRS + 4](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)

**ASPA and BGPsec.** ASPA (draft-ietf-sidrops-aspa-verification-25 and -profile-26 as of April 2026) is the actively-deployed-soon AS_PATH validation mechanism: cryptographic provider-authorization records that detect route leaks and many forged-path hijacks. Cisco reported an Early Field Trial implementation on IOS-XR in 2025. BGPsec (RFC 8205) remains "wait for the next router generation" — its per-update signing burden is too high for current CPUs; ASPA is the pragmatic path. ([https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)) [IETF + 3](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)

**IPv6 deployment.** IPv6 reached 50.1% of Google's traffic on 28 March 2026, with weekday averages ~45–48% and Cloudflare/APNIC measuring 40–43% from their vantage points ([https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/), [https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)). Mobile carriers are the leading edge — France 86%, India >75% IPv6-preferred, Germany 68%+, US mobile carriers averaging 87%. AWS's $0.005/hour public-IPv4 charge (effective February 2024) made IPv6-only architectures financially compelling at scale. [Cloudnews + 5](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)

**IPv6-only / IPv4-as-a-Service / 464XLAT.** RFC 6877's 464XLAT is now the standard mechanism to keep IPv4 applications working on IPv6-only access networks, paired with NAT64/DNS64 (RFCs 6146/6147). Modern Android, iOS 9+, and macOS 13+ run CLAT natively; Windows 11 added it. The IETF V6OPS working group's draft-ietf-v6ops-claton consolidates host recommendations. [Army Futures Command](https://www.hpc.mil/solution-areas/networking/ipv6-knowledge-base/frequently-asked-questions/available-ipv6-cell-phones-and-wireless-carriers)

**Wi-Fi 7 and Wi-Fi 8.** IEEE 802.11be-2024 (Wi-Fi 7) was published 22 July 2025; the Wi-Fi Alliance certification opened 8 January 2024 ([https://en.wikipedia.org/wiki/Wi-Fi_7](https://en.wikipedia.org/wiki/Wi-Fi_7)). Key features: 320-MHz channels in 6 GHz, 4096-QAM, Multi-Link Operation (MLO), preamble puncturing, restricted Target Wake Time. As of late April 2026, Wi-Fi Alliance reports >500M certified devices shipped; IDC projects 120M Wi-Fi 7 access-point shipments by end-2026. Wi-Fi 8 (802.11bn / Ultra High Reliability, [https://en.wikipedia.org/wiki/IEEE_802.11bn](https://en.wikipedia.org/wiki/IEEE_802.11bn)): Draft 1.0 reached July 2025, final ratification scheduled March 2028, certification December 2027. Goals: not faster — same 23 Gbit/s peak — but 25% better throughput in poor signal conditions, 25% lower 95th-percentile latency, 25% fewer dropped packets during roaming. Multi-AP coordination and Seamless Roaming Domain are the headline new mechanisms. [IEEE802 + 7](https://www.ieee802.org/11/)

**800 GbE and Terabit Ethernet.** IEEE 802.3df-2024 (800 GbE, with 400 GbE on 100 G lanes) was approved 16 February 2024 and published in 2024 ([https://en.wikipedia.org/wiki/Terabit_Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)). IEEE P802.3dj — covering 200 G/lane, 1.6 TbE, and updates for 200/400/800 G — is targeting completion in July 2026, though slip risk has been publicly noted ([https://www.ieee802.org/3/dj/index.html](https://www.ieee802.org/3/dj/index.html)). AI training fabrics are the demand engine; "lossless Ethernet" with RoCEv2 is replacing InfiniBand in many large GPU clusters. [Wikipedia + 3](https://en.wikipedia.org/wiki/Terabit_Ethernet)

**SRv6 vs SR-MPLS.** SR-MPLS reuses existing MPLS data planes with software upgrades and dominates among service providers today. SRv6 — encoding paths as IPv6 destination-address lists in a Segment Routing Header — needs hardware that can parse the SRH at line rate, which is increasingly common in 2025–2026 silicon. The pragmatic path documented in IETF SPRING/srv6ops drafts is migrate-via-SR-MPLS-then-SRv6, with interworking gateways, 6oM (SRv6 over MPLS), and dual-stack PEs to bridge the transition ([https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html](https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html)). [IETF + 4](https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html)

**Programmable forwarding and in-network computing.** P4 (Programming Protocol-Independent Packet Processors) has matured into the standard data-plane language. SmartNICs and DPUs (NVIDIA BlueField, AMD Pensando, Intel IPU) push P4 logic to the host edge. Active research in 2025–2026 covers P4-based DDoS mitigation, in-network caching for KV stores, and in-network ML inference offload (cf. arXiv:2507.22165 on programmable data planes for security; arXiv:2503.17554 on the P4sim ns-3 integration). [NetworkComputing](https://www.networkcomputing.com/switches-routers/p4-programming-the-network-s-forwarding-plane)[arxiv](https://arxiv.org/pdf/2507.22165)

**EVPN-VXLAN displacing legacy L2 in datacenters.** With Cisco DCNM reaching end-of-support in April 2026, large enterprises are moving from VLAN-and-STP fabrics to BGP-EVPN with VXLAN overlays as the standard model ([https://www.netpilot.io/blog/evpn-vxlan-data-center-guide](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)). RFC 7432 (EVPN) and RFC 8365 (VXLAN encapsulation) are the standards spine; multi-vendor interoperability has improved but route-target auto-derivation, ESI handling, and BUM replication remain operational gotchas. The biggest new use case is AI training cluster fabrics that need lossless Ethernet, very low latency, and ECMP that doesn't polarize on elephant flows. IETF BESS is finishing draft-sajassi-bess-evpn-fabric-migration to migrate EVPN underlays from IPv4 to IPv6. [Netpilot + 2](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)

**AI/ML for routing optimization.** Production deployments are still narrow — anomaly detection on flow telemetry, traffic-engineering controllers that adjust SR policies based on predicted demand, congestion-control reinforcement learning at the host. The promise of "let an LLM operate your network" is mostly speculative in 2026; the deployed reality is "use ML to score telemetry and surface incidents to humans."

**Post-quantum considerations for IPsec/MACsec.** ML-KEM (FIPS-203) is the lattice-based key-encapsulation mechanism standardized by NIST. Cloudflare turned on hybrid post-quantum IPsec (per draft-ietf-ipsecme-ikev2-mlkem, finalized late 2025) generally available in 2025 ([https://blog.cloudflare.com/post-quantum-ipsec/](https://blog.cloudflare.com/post-quantum-ipsec/)). Cisco's CSfC-aligned IPsec/MACsec roadmap uses RFC 8784 PPKs as a transitional mechanism, with full ML-KEM support across the Cisco 8000 line ([https://www.cisco.com/c/dam/en_us/about/trust-center/post-quantum-resistant-secure-wan-white-paper.pdf](https://www.cisco.com/c/dam/en_us/about/trust-center/post-quantum-resistant-secure-wan-white-paper.pdf)). For MACsec, IEEE 802.11 has begun a post-quantum-cryptography Task Group (TGbt). Government deadlines drive this: NSA's CNSA 2.0 mandates PQ key establishment for new equipment from 2027; expected national deadlines run to 2030. [National Security Agency](https://www.nsa.gov/Portals/75/documents/resources/everyone/csfc/capability-packages/CSfC%20Post%20Quantum%20Cryptography%20Guidance%20Addendum%201_0%20Draft%20_5.pdf?ver=wCGPoDQXcJKEWTgbH8xsRA%3D%3D)

**Satellite networking and routing implications.** SpaceX Starlink runs IPv4 behind CGNAT and natively-routed IPv6 (a /56 to subscribers via DHCPv6-PD); per Wang et al., the backbone consists of 49 PoPs, and ~5.98M IPv6-addressed user routers were observed across 165 countries (arXiv:2412.18243v3, January 2026). Starlink is one of the largest publicly visible IPv6-only access deployments — and one of the earliest large-scale uses of LEO inter-satellite laser links carrying ordinary IP traffic with terrestrial-style BGP at the gateways. [CellStream](https://www.cellstream.com/2025/05/06/does-starlink-support-ipv6/)[arXiv](https://arxiv.org/abs/2412.18243)

**What will be obsolete or marginal in five years.**

- Pure 802.1D/RSTP-only data centers (already gone in any new build).
- LDP and RSVP-TE in service-provider cores (replaced by SR).
- IPv4-only enterprise WANs (replaced by dual-stack or IPv6-mostly).
- 1 Gbps as the base server-NIC speed in DCs (10/25/100 G now baseline).
- ARP-only L2 networks in greenfield builds (always paired with NDP).
- Pre-RPKI BGP peering: a non-validating large transit will be a competitive disadvantage by 2028.

---

## 10. Hooks for the article, infographic, and podcast

### 60-second narrated hook (for the ear)

> *"At 15:39 UTC on October 4th, 2021, Facebook ran a routine command on its global backbone. Three minutes later, Facebook, Instagram, and WhatsApp vanished from the internet. Not slow. Not buggy. Vanished. Three billion users couldn't connect, because eight tiny pieces of routing data — eight numbers, really — disappeared from the world's routers. Engineers couldn't even badge into their own buildings to fix it; the badge readers needed Facebook DNS, and Facebook DNS needed those eight numbers. The protocol responsible is forty years old, was sketched on three sheets of paper at an IETF meeting in Austin in 1989, and runs every connection you've ever made between two networks. It's called BGP, and almost nobody outside our industry knows it exists. This series is about the layer of the internet that nobody talks about — until it breaks. And then it's the only thing anybody talks about."*

### A striking statistic with source

On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time in its history — 28 years after IPv6 was specified in RFC 2460 (Google IPv6 stats; APNIC commentary at [https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/); *The Register* [https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)). On the same day, only 40% of HTTP requests on Cloudflare's network were IPv6, and APNIC Labs measured 43% IPv6-capable networks — so the milestone is real but uneven, and IPv4 is still the dominant protocol on most of the planet. [Cloudnews](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)[The Register](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)

### A "pause and think" moment with source

The two senior engineers responsible for the first BGP specification, Yakov Rekhter and Kirk Lougheed, sketched the protocol at lunch during the 12th IETF meeting in Austin, Texas, on three sheets of paper that today hang on the wall at Cisco's Milpitas campus. The protocol they sketched, with minor revisions, runs every transit and peering relationship on the public internet — about one million IPv4 prefixes and 225,000 IPv6 prefixes as of January 2026 ([https://www.potaroo.net/ispcol/2026-01/bgp2025.html](https://www.potaroo.net/ispcol/2026-01/bgp2025.html)). It has no built-in authentication. It trusts every neighbor by default. It is, in the words of one of its authors, "well enough." The internet runs on "well enough" written on three napkins. [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)[Potaroo](https://www.potaroo.net/ispcol/2025-06/daybgp.html)

### A failure-story arc — pick one

We recommend the **2021 Facebook outage** as the lead, because every fact is publicly documented and the dramatic structure is clean. Alternative outages are listed afterward with their punchlines for variety.

**Setup.** Monday, 4 October 2021. Facebook (parent company since renamed Meta) operates a global backbone connecting tens of thousands of miles of fibre between data centres. Its DNS servers live in smaller "edge" facilities. Those DNS servers are programmed with a safety: if they cannot reach the data centres, they withdraw their own BGP advertisements, on the theory that a DNS server that can't answer authoritatively shouldn't be reached. This is supposed to be a defensive mechanism. [FB](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

**Mistake.** During routine maintenance, an engineer issues a command intended to assess the availability of global backbone capacity. Meta's audit tooling — designed to catch destructive commands — has a bug, and does not stop it. The command takes down the entire backbone ([https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)). [FB](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

**Consequence.** At 15:39 UTC, Cloudflare and others detect a flood of BGP UPDATE messages from Facebook AS32934 — and then a wave of WITHDRAWALs of the IPv4 and IPv6 prefixes covering the DNS servers. The "safety" fires correctly: DNS servers, isolated from the backbone, withdraw their routes. From the outside, Facebook ceases to exist. Public resolvers like 1.1.1.1 and 8.8.8.8 start returning SERVFAIL for facebook.com ([https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/)). Apps and humans retry aggressively, generating a 30× DNS query surge on public resolvers. WhatsApp, Instagram, Oculus all go dark. Internally, Facebook engineers can't get into the network to fix it, because their internal tools depend on the same DNS, and their physical badge readers depend on the same network. People are reportedly dispatched to data centres with bolt cutters. The estimated revenue impact crosses $60M; Mark Zuckerberg's net worth drops by more than $6B in a day ([https://en.wikipedia.org/wiki/2021_Facebook_outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)). In developing countries where Facebook's "Free Basics" program is the de-facto internet, communication, business, and humanitarian work pause for seven hours. [Cloudflare + 4](https://blog.cloudflare.com/october-2021-facebook-outage/)

**Resolution.** A little before 21:00 UTC, after roughly six hours, Facebook re-establishes backbone connectivity. DNS prefix advertisements return at 21:05 UTC. Cached DNS clears worldwide over the next several hours. Meta's post-mortem the next day acknowledges configuration tooling and audit-bypass as the root cause; the BGP withdrawal was the *symptom* of the larger backbone failure, not its cause. The incident becomes the single most-cited modern example of why you should never have a single dependency chain run through your own product. [Wikipedia](https://en.wikipedia.org/wiki/2021_Facebook_outage)[Wikipedia](https://en.wikipedia.org/wiki/2021_Facebook_outage)

**Why this story works for the podcast.** Three layers — BGP, DNS, and physical access — fail in cascade because each one trusts the layer below it. It's a parable about emergent fragility in trusted distributed systems, which is the entire arc of this protocol family.

### Other strong candidates (with verified one-line punchlines)

- **27 October 1980 — ARPANET 4-hour collapse.** A single IMP's bit-drop in stored timestamps caused a corrupted-message flood across the entire pre-Internet. The post-mortem became RFC 789 — perhaps the first formal protocol-level incident report. [VICE](https://www.vice.com/en/article/happy-anniversary-to-the-early-internets-first-network-wide-crash/)
- **25 April 1997 — AS 7007 incident.** A small Florida ISP's misconfigured Bay Networks router de-aggregated the entire global routing table into /24s and re-originated them as AS 7007. Sprint and large parts of the Internet collapsed for hours. The fact that withdrawal of the source did not immediately stop propagation is what made it last. Vince Bono's apology email to NANOG is preserved at [https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html). [Noction + 2](https://www.noction.com/blog/bgp-security-prefixes-authorization)
- **24 February 2008 — Pakistan Telecom hijacks YouTube.** Pakistan ordered ISPs to block YouTube. Pakistan Telecom (AS 17557) advertised 208.65.153.0/24 (more specific than YouTube's 208.65.152.0/22) intending to null-route it locally. Their upstream PCCW (AS 3491) didn't filter, and the route went global. YouTube was unreachable for ~2 hours. The canonical post-mortem is from RIPE NCC ([https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)). This single incident forced RPKI from research curiosity to operational priority. [Uwaterloo](https://crysp.uwaterloo.ca/courses/cs458/F08-lectures/local/www.renesys.com/blog/2008/02/pakistan_hijacks_youtube_1.shtml.html)[RIPE Network Coordination Center](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- **8 April 2010 — China Telecom 18-minute hijack.** AS 23724 originated routes to ~50,000 prefixes (cited as "15% of the Internet's destinations" in the U.S.-China Economic and Security Review Commission report). Whether intentional or misconfiguration is contested; what is undisputed is that the hijack was *interceptive* (traffic flowed in, was processed, and flowed back out the right way), which was extraordinarily rare for the time and which is what fuelled the espionage hypothesis ([https://citizenlab.ca/2012/12/characterizing-large-scale-routing-anomalies-a-case-study-of-the-china-telecom-incident/](https://citizenlab.ca/2012/12/characterizing-large-scale-routing-anomalies-a-case-study-of-the-china-telecom-incident/)). [eWEEK + 2](https://www.eweek.com/security/claims-china-hijacked-15-percent-of-web-traffic-are-overhyped-experts-say/)
- **30 August 2020 — CenturyLink/Level 3 Flowspec loop.** An incorrectly-formatted BGP Flowspec rule (pushed to mitigate a customer's DDoS) blocked BGP itself across the entire Level 3 backbone. The rule killed the BGP session that delivered it; the session re-established; the rule was re-pushed; the session died again. CenturyLink/Level 3 — one of the world's largest tier-1 transit providers — was effectively in a control-plane infinite loop for ~5 hours. Cloudflare measured a 3.5% drop in *global* internet traffic ([https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)). A subsequent court filing showed Level 3 had to ask other tier-1s to de-peer to drain the BGP-update queue. [Bits in Flight + 3](https://www.bitsinflight.com/is-your-internet-connectivity-really-redundant/)
- **8 July 2022 — Rogers Communications Canada-wide outage.** A maintenance change to BGP route policy in the IP core inadvertently allowed a full BGP table redistribution into OSPF. The flood overwhelmed core router CPU and memory; the core crashed; 12+ million Canadian customers lost wireless, wireline, internet, and Interac debit-card service for ~15 hours. The CRTC's 2024 executive summary formally identified missing route filters and lab-testing skipped due to an algorithm down-grading risk from "High" to "Low" after earlier phases succeeded ([https://crtc.gc.ca/eng/publications/reports/xona2024.htm](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)). [Canadian Radio-television and Telecommunications Commission + 2](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm)
- **22 February 2024 — AT&T Mobility 12-hour outage.** A network change with an equipment configuration error at 02:42 CT pushed the AT&T mobility network into "protect mode," disconnecting all wireless devices nationwide. 125M+ devices, 92M+ blocked voice calls, 25K+ failed 911 calls, 12-hour restoration. Not BGP — but the FCC's report ([https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf](https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf)) reads like every BGP outage post-mortem: insufficient peer review, missing controls, unscanned changes. [Fierce Network + 2](https://www.fierce-network.com/wireless/fcc-reports-atts-nationwide-outage-february)

---

## 11. Citations (numbered in order of appearance)

1. RFC 791 — Internet Protocol (Postel, 1981). [https://www.rfc-editor.org/rfc/rfc791](https://www.rfc-editor.org/rfc/rfc791)
2. RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification (Deering & Hinden, July 2017). [https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200)
3. RFC 8201 — Path MTU Discovery for IP version 6.
4. RFC 826 — An Ethernet Address Resolution Protocol (Plummer, November 1982). [https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826) [RFC Editor](https://www.rfc-editor.org/rfc/rfc826)
5. RFC 7042 — IANA considerations and IETF protocol usage for IEEE 802 parameters.
6. IEEE 802 working group hub. [https://www.ieee802.org/](https://www.ieee802.org/)
7. RFC 9293 — Updated Transmission Control Protocol (TCP) specification (2022). [https://datatracker.ietf.org/doc/rfc9293/](https://datatracker.ietf.org/doc/rfc9293/)
8. Tanenbaum, Feamster, Wetherall, *Computer Networks*, 6th ed., Pearson, 2021. [https://www.pearson.com/en-us/pearsonplus/p/9780137523214](https://www.pearson.com/en-us/pearsonplus/p/9780137523214)
9. Cerf & Kahn, "A Protocol for Packet Network Intercommunication," IEEE Trans. Comm. COM-22(5):637–648, May 1974. [https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)
10. Metcalfe & Boggs, "Ethernet: Distributed Packet Switching for Local Computer Networks," CACM 19(7), July 1976; ACM Turing Award citation for Metcalfe at [https://awards.acm.org/award-recipients/metcalfe_3968158](https://awards.acm.org/award-recipients/metcalfe_3968158)
11. RFC 789 — Vulnerabilities of Network Control Protocols: An Example (Rosen, 1981).
12. Computer History Museum, "October 27: The First Major Network Crash, the Four-Hour Collapse of the ARPANET, Occurred." [https://www.computerhistory.org/tdih/october/27/](https://www.computerhistory.org/tdih/october/27/)
13. RFC 1105 — A Border Gateway Protocol (Lougheed & Rekhter, June 1989). [https://www.rfc-editor.org/rfc/rfc1105](https://www.rfc-editor.org/rfc/rfc1105)
14. RFC 4271 — A Border Gateway Protocol 4 (BGP-4) (Rekhter, Li, Hares eds., January 2006). [https://www.rfc-editor.org/rfc/rfc4271](https://www.rfc-editor.org/rfc/rfc4271)
15. Computer History Museum, "The Two-Napkin Protocol." [https://computerhistory.org/blog/the-two-napkin-protocol/](https://computerhistory.org/blog/the-two-napkin-protocol/)
16. Radia Perlman, Wikipedia entry and "Algorhyme" poem source. [https://en.wikipedia.org/wiki/Radia_Perlman](https://en.wikipedia.org/wiki/Radia_Perlman)
17. National Inventors Hall of Fame, "Piano and Protocols: The Story of Inventor Radia Perlman." [https://www.invent.org/blog/inventors/spanning-tree-protocol](https://www.invent.org/blog/inventors/spanning-tree-protocol)
18. Geoff Huston, "BGP in 2025," ISP Column, January 2026. [https://www.potaroo.net/ispcol/2026-01/bgp2025.html](https://www.potaroo.net/ispcol/2026-01/bgp2025.html)
19. RFC 4861 — Neighbor Discovery for IP version 6 (NDP).
20. RFC 8415 — Dynamic Host Configuration Protocol for IPv6 (DHCPv6).
21. RFC 4862 — IPv6 Stateless Address Autoconfiguration (SLAAC).
22. RFC 2328 — OSPF Version 2; RFC 5340 — OSPFv3.
23. RFC 1195 — Use of OSI IS-IS for Routing in TCP/IP and Dual Environments.
24. RFC 7868 — Cisco's EIGRP.
25. RFC 3031 — Multiprotocol Label Switching Architecture.
26. RFC 8402 — Segment Routing Architecture; RFC 8754 — IPv6 Segment Routing Header (SRH); RFC 8986 — SRv6 Network Programming.
27. RFC 5880 — Bidirectional Forwarding Detection (BFD).
28. IEEE 802.1AE — MACsec; IEEE 802.1X-2020 — port-based access control.
29. RFC 4301 — Security Architecture for the Internet Protocol; RFC 7296 — IKEv2.
30. APNIC Blog, "Google hits 50% IPv6," 28 April 2026. [https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
31. The Register, "Google: IPv6 carried half of internet traffic for one day," 17 April 2026. [https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
32. Google IPv6 statistics dashboard. [https://www.google.com/intl/en/ipv6/statistics.html](https://www.google.com/intl/en/ipv6/statistics.html)
33. Wikipedia, "IPv6 deployment." [https://en.wikipedia.org/wiki/IPv6_deployment](https://en.wikipedia.org/wiki/IPv6_deployment)
34. PBX Science, "28 Years to Cross the Line: Why Did IPv6 Take So Long to Reach 50%?" [https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)
35. Madory & Snijders, "RPKI ROV Deployment Reaches Major Milestone," MANRS / NANOG, 1 May 2024. [https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/) ; Kentik update at [https://www.kentik.com/blog/exploring-the-latest-rpki-rov-adoption-numbers/](https://www.kentik.com/blog/exploring-the-latest-rpki-rov-adoption-numbers/)
36. Cloudflare, "Helping build a safer Internet by measuring BGP RPKI Route Origin Validation." [https://blog.cloudflare.com/rpki-updates-data/](https://blog.cloudflare.com/rpki-updates-data/)
37. NIST RPKI Monitor. [https://rpki-monitor.antd.nist.gov/](https://rpki-monitor.antd.nist.gov/)
38. SIDN, "Adoption of RPKI/ROV security protocol progressing very quickly." [https://www.sidn.nl/en/news-and-blogs/adoption-of-rpki-rov-security-protocol-progressing-very-quickly](https://www.sidn.nl/en/news-and-blogs/adoption-of-rpki-rov-security-protocol-progressing-very-quickly)
39. draft-ietf-sidrops-aspa-verification (current -25, April 2026). [https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)
40. draft-ietf-sidrops-aspa-profile (current -26, April 2026). [https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/)
41. Furuness et al., "Securing BGP ASAP: ASPA and other Post-ROV Defenses," NDSS 2025. [https://www.ndss-symposium.org/wp-content/uploads/2025-675-paper.pdf](https://www.ndss-symposium.org/wp-content/uploads/2025-675-paper.pdf)
42. RFC 7908 — Problem Definition and Classification of BGP Route Leaks.
43. Wikipedia, "AS 7007 incident." [https://en.wikipedia.org/wiki/AS_7007_incident](https://en.wikipedia.org/wiki/AS_7007_incident)
44. Bono, "7007 Explanation and Apology," NANOG, April 1997. [https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)
45. RIPE NCC, "YouTube Hijacking: A RIPE NCC RIS case study." [https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
46. CircleID, "Pakistan Hijacks YouTube: A Closer Look." [https://circleid.com/posts/82258_pakistan_hijacks_youtube_closer_look](https://circleid.com/posts/82258_pakistan_hijacks_youtube_closer_look)
47. Madory, "A Brief History of the Internet's Biggest BGP Incidents," Kentik. [https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/](https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/)
48. Citizen Lab, "Characterizing Large-Scale Routing Anomalies: A Case Study of the China Telecom Incident." [https://citizenlab.ca/2012/12/characterizing-large-scale-routing-anomalies-a-case-study-of-the-china-telecom-incident/](https://citizenlab.ca/2012/12/characterizing-large-scale-routing-anomalies-a-case-study-of-the-china-telecom-incident/)
49. Demchak & Shavitt, "China's Maxim — Leave No Access Point Unexploited: The Hidden Story of China Telecom's BGP Hijacking," Military Cyber Affairs. [https://digitalcommons.usf.edu/cgi/viewcontent.cgi?article=1050&context=mca](https://digitalcommons.usf.edu/cgi/viewcontent.cgi?article=1050&context=mca)
50. Cloudflare, "Understanding how Facebook disappeared from the Internet." [https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/)
51. Meta Engineering, "More details about the October 4 outage." [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
52. ThousandEyes, "Facebook Outage Analysis." [https://www.thousandeyes.com/blog/facebook-outage-analysis](https://www.thousandeyes.com/blog/facebook-outage-analysis)
53. Wikipedia, "2021 Facebook outage." [https://en.wikipedia.org/wiki/2021_Facebook_outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
54. Cloudflare, "Cloudflare's view of the Rogers Communications outage in Canada." [https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/](https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/)
55. Kentik, "A deeper dive into the Rogers outage." [https://www.kentik.com/blog/a-deeper-dive-into-the-rogers-outage/](https://www.kentik.com/blog/a-deeper-dive-into-the-rogers-outage/)
56. CRTC, "Assessment of Rogers Networks for Resiliency and Reliability Following the 8 July 2022 Outage" (full and executive summary). [https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm) and [https://crtc.gc.ca/eng/publications/reports/xona2024.htm](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
57. Wikipedia, "2022 Rogers Communications outage." [https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage](https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage)
58. Cloudflare, "August 30th 2020: Analysis of CenturyLink/Level(3) outage." [https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)
59. ThousandEyes, "CenturyLink / Level 3 Outage Analysis." [https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis](https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis)
60. FCC, "February 22, 2024 AT&T Mobility Network Outage Report and Findings." [https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf](https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf) and DOC-404150A1.pdf
61. AT&T, "AT&T Network Update." [https://about.att.com/pages/network-update](https://about.att.com/pages/network-update)
62. Wikipedia, "Wi-Fi 7 / IEEE 802.11be-2024." [https://en.wikipedia.org/wiki/Wi-Fi_7](https://en.wikipedia.org/wiki/Wi-Fi_7)
63. IEEE 802.11 Working Group hub. [https://www.ieee802.org/11/](https://www.ieee802.org/11/)
64. SPOTO / industry reporting on Wi-Fi 7 deployment 2026. [https://cciedump.spoto.net/news/wi-fi-7-mass-deployment-accelerates-in-2026-as-global-enterprises-and-carriers-race-to-upgrade-network-infrastructure.html](https://cciedump.spoto.net/news/wi-fi-7-mass-deployment-accelerates-in-2026-as-global-enterprises-and-carriers-race-to-upgrade-network-infrastructure.html)
65. Wikipedia, "IEEE 802.11bn." [https://en.wikipedia.org/wiki/IEEE_802.11bn](https://en.wikipedia.org/wiki/IEEE_802.11bn)
66. Samsung Research, "IEEE 802.11bn (Ultra-High Reliability (UHR), Wi-Fi 8)." [https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8](https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8)
67. Wikipedia, "Terabit Ethernet." [https://en.wikipedia.org/wiki/Terabit_Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)
68. IEEE P802.3dj task force home. [https://www.ieee802.org/3/dj/index.html](https://www.ieee802.org/3/dj/index.html)
69. IEEE SA, "Ethernet's Next Bar is Now – 800 Gb/s!" [https://standards.ieee.org/beyond-standards/ethernets-next-bar/](https://standards.ieee.org/beyond-standards/ethernets-next-bar/)
70. Ciena, "Scaling transport networks – The transition to Segment Routing." [https://www.ciena.com/insights/blog/2025/scaling-transport-networks-the-transition-to-segment-routing](https://www.ciena.com/insights/blog/2025/scaling-transport-networks-the-transition-to-segment-routing)
71. draft-ietf-srv6ops-srv6-deployment. [https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html](https://www.ietf.org/archive/id/draft-ietf-srv6ops-srv6-deployment-01.html)
72. NetPilot, "EVPN-VXLAN Data Center Fabric: Complete 2026 Guide." [https://www.netpilot.io/blog/evpn-vxlan-data-center-guide](https://www.netpilot.io/blog/evpn-vxlan-data-center-guide)
73. RFC 7432 — BGP MPLS-Based Ethernet VPN; RFC 8365 — VXLAN-based EVPN.
74. draft-sajassi-bess-evpn-fabric-migration. [https://datatracker.ietf.org/doc/draft-sajassi-bess-evpn-fabric-migration/](https://datatracker.ietf.org/doc/draft-sajassi-bess-evpn-fabric-migration/)
75. RFC 6877 — 464XLAT.
76. draft-ietf-v6ops-claton — 464XLAT CLAT Node Recommendations. [https://datatracker.ietf.org/doc/html/draft-ietf-v6ops-claton-07](https://datatracker.ietf.org/doc/html/draft-ietf-v6ops-claton-07)
77. Cloudflare, "Post-quantum encryption for Cloudflare IPsec is generally available." [https://blog.cloudflare.com/post-quantum-ipsec/](https://blog.cloudflare.com/post-quantum-ipsec/)
78. Cisco, "The Journey to Post-Quantum Cryptography in WAN Infrastructure" (white paper). [https://www.cisco.com/c/dam/en_us/about/trust-center/post-quantum-resistant-secure-wan-white-paper.pdf](https://www.cisco.com/c/dam/en_us/about/trust-center/post-quantum-resistant-secure-wan-white-paper.pdf)
79. Wang et al., "A Large-Scale IPv6-Based Measurement of the Starlink Network," arXiv:2412.18243v3, January 2026. [https://arxiv.org/abs/2412.18243](https://arxiv.org/abs/2412.18243)
80. Singh et al., "Programmable Data Planes for Network Security," arXiv:2507.22165. [https://arxiv.org/pdf/2507.22165](https://arxiv.org/pdf/2507.22165)
81. MANRS, "MANRS Update: One Year Under GCA." [https://manrs.org/2025/02/manrs-update-one-year-under-gca/](https://manrs.org/2025/02/manrs-update-one-year-under-gca/)
82. MANRS, "Recap: 2nd MANRS Community Meeting 2025." [https://manrs.org/2025/11/recap-2nd-manrs-community-meeting-2025/](https://manrs.org/2025/11/recap-2nd-manrs-community-meeting-2025/)
83. Kurose & Ross, *Computer Networking: A Top-Down Approach*, 8th ed., Pearson, 2020/21. [https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780135928615](https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780135928615)
84. Stanford CS144 course site. [https://cs144.github.io/](https://cs144.github.io/) ; Stanford Online listing [https://online.stanford.edu/courses/cs144-introduction-computer-networking](https://online.stanford.edu/courses/cs144-introduction-computer-networking)
85. Containerlab. [https://containerlab.dev/](https://containerlab.dev/)
86. FRRouting. [https://frrouting.org/](https://frrouting.org/)
87. RFC 1918 — Address Allocation for Private Internets. [https://datatracker.ietf.org/doc/html/rfc1918](https://datatracker.ietf.org/doc/html/rfc1918)
88. Internet Society, "Statistics on the Adoption of IPv6." [https://www.internetsociety.org/deploy360/ipv6/statistics/](https://www.internetsociety.org/deploy360/ipv6/statistics/)

*Where any individual fact above relies on a single source rather than independent corroboration — notably the AT&T 2024 outage scope numbers (relayed from FCC docket DOC-404154A1) and the Wi-Fi 7 shipment estimates from IDC — the reader should treat the precise figure as authoritative-as-of-publication rather than absolute. Conflicts between Google's 50.1% IPv6 figure (28 March 2026) and Cloudflare/APNIC's lower numbers are flagged inline; they reflect genuinely different vantage points, not one source being wrong.*