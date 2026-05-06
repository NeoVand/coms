---
prompt_source: deep-research-prompts.txt:1574-1755 (PROTOCOL · IPv4)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/91beec93-9a08-4cc3-90be-4caa5fd067bd
research_mode: claude.ai Research
---

# Internet Protocol version 4 (IPv4): A Deep Engineering Reference (May 2026)

## TL;DR

- IPv4 is the 32-bit, best-effort, connectionless, datagram-switched Internet-layer protocol standardised in **RFC 791 (September 1981)** that still carries roughly half of all Internet traffic in 2026 — even though every Regional Internet Registry (RIR) effectively exhausted its free pool between 2011 and 2017, and Google measured IPv6 reaching ~50% of its users for the first time on 28 March 2026 ([https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)). [Hevs](https://course.hevs.io/did/eda-docs/eda_libs/Ethernet/ipv4.html)
- The protocol survives because of an enormous accreted layer of patches — CIDR (RFC 4632), NAT/CGNAT (RFC 6598/6888), DSCP/ECN (RFCs 2474/3168), Path MTU Discovery, RFC 6864's relaxation of the IPID rule, MAP-T/MAP-E/DS-Lite for IPv4-as-a-Service, and a lively secondary market where /16 blocks dropped below $20/IP for the first time since 2019 in mid-2025 ([https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/](https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/)). [Ipbnb](https://ipbnb.com/blog/ipv4-address-price-2026)
- For engineers in 2026 the practical posture is: **assume dual-stack, design for IPv6-first new-build, treat IPv4 as a billable scarce resource** (AWS now charges $0.005/hr per public IPv4 address since 1 Feb 2024 — ~$43/yr), avoid in-network fragmentation, clamp TCP MSS to your real path MTU, monitor conntrack/ICMP rates, and plan for CGNAT-induced asymmetric reachability. [The Register](https://www.theregister.com/2023/07/31/aws_says_ipv4_addresses_cost/)

---

## 1. Prerequisites and glossary

A reader needs the following terminology before any IPv4 mechanism makes sense. Each term gets a one-to-two sentence operational definition and a pointer to an authoritative explainer.

**OSI / TCP-IP layering.** OSI is a 7-layer reference model (Physical, Data Link, Network, Transport, Session, Presentation, Application). The TCP/IP stack collapses these into 4 layers (Link, Internet, Transport, Application) where IPv4 sits at the Internet layer. RFC 1122 §1.1 is the canonical mapping ([https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122)).

**Bit / Octet / Byte.** A *bit* is a binary 0/1. An *octet* is exactly 8 bits — the IETF deliberately uses "octet" rather than "byte" because, in the 1970s, "byte" sometimes meant 6, 7, 8, or 9 bits depending on the host (e.g., PDP-10 used 36-bit words and variable bytes). RFC 791 says "octet" throughout for that reason.

**Endianness / Network byte order.** "Big-endian" stores the most-significant byte first; "little-endian" the least-significant. Internet headers are *network byte order = big-endian*. Danny Cohen's IEN 137 "On Holy Wars and a Plea for Peace" (1 April 1980) is the foundational rant that settled the convention ([https://www.ietf.org/rfc/ien/ien137.txt](https://www.ietf.org/rfc/ien/ien137.txt)). [Cwru](http://bear.ces.cwru.edu/eecs_314/endian_ien-137.html)

**Datagram.** A self-contained, independently routable unit of data with all addressing information in its header — IPv4's basic delivery unit. Coined by Louis Pouzin's CYCLADES project; carried into IP by Cerf & Kahn ([https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)).

**Frame.** The link-layer encapsulation unit (e.g., Ethernet frame) inside which an IP datagram is carried. IEEE 802.3 defines Ethernet frames; RFC 894 defines how IPv4 datagrams sit inside them.

**Packet.** Generic term for any encapsulated, addressable network unit. Often used interchangeably with "datagram" at the IP layer but technically broader.

**Header.** The fixed-and-optional metadata at the start of a PDU. The IPv4 header is 20–60 bytes (RFC 791 §3.1).

**Checksum.** Integrity check over a header (and sometimes payload). IPv4 uses a 16-bit one's-complement-of-the-one's-complement-sum over the header only (RFC 1071, [https://datatracker.ietf.org/doc/html/rfc1071](https://datatracker.ietf.org/doc/html/rfc1071)).

**MTU (Maximum Transmission Unit).** The largest L3 PDU a link can carry without fragmentation. Ethernet's classic MTU is 1500 bytes; RFC 791 mandates that all IPv4 hosts accept at least 576-byte datagrams ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc6274.txt)[Hevs](https://course.hevs.io/did/eda-docs/eda_libs/Ethernet/ipv4.html)

**Fragmentation / Reassembly.** Splitting a datagram into pieces (each carrying the same Identification and a Fragment Offset) when it exceeds a downstream MTU; reassembly happens only at the destination. RFC 791 §3.2 procedure; RFC 815 reassembly algorithm.

**Unicast / Multicast / Broadcast / Anycast.** Unicast = one-to-one. Multicast = one-to-many subscribers (IGMP-managed groups in 224.0.0.0/4, RFC 1112). Broadcast = one-to-all-on-subnet (255.255.255.255 limited, or directed broadcast to subnet's all-ones address — see RFC 919, RFC 2644). Anycast = the same address advertised from multiple locations; routing picks the topologically nearest (RFC 4786).

**Socket.** The endpoint abstraction `(IP address, transport protocol, port)` that an application binds to. Original Berkeley socket API (4.2BSD, 1983) is the de-facto standard.

**Handshake.** A multi-step exchange to establish state — e.g., TCP's 3-way SYN, SYN-ACK, ACK (RFC 9293). IPv4 itself has no handshake; it is connectionless.

**Stream vs. Datagram service.** TCP gives an in-order, reliable byte-stream over IP; UDP (RFC 768) gives unreliable, unordered datagrams.

**Routing vs. Forwarding.** *Routing* is the control-plane process of building tables (BGP/OSPF/IS-IS/RIP). *Forwarding* is the data-plane action of looking up a destination and sending the packet on. RFC 1812 §5 ([https://datatracker.ietf.org/doc/html/rfc1812](https://datatracker.ietf.org/doc/html/rfc1812)).

**Subnet / Prefix / CIDR.** A subnet is a contiguous block of IP space identified by a prefix (e.g., 192.0.2.0/24 = first 24 bits fixed). CIDR (RFC 4632) replaced the original A/B/C "classful" partitioning with arbitrary-length prefixes. [Wikipedia](https://en.wikipedia.org/wiki/IPv4)

**Autonomous System (AS) and BGP.** An AS is a set of IP networks under a single routing administration, identified by an ASN. BGP-4 (RFC 4271) is the inter-AS path-vector protocol of the Internet's default-free zone. [Wikipedia](https://en.wikipedia.org/wiki/BGP_hijacking)

**TTL (Time To Live).** An 8-bit hop counter decremented at each router; reaching zero discards the packet and triggers ICMP Time Exceeded (RFC 791; behaviour clarified in RFC 1812). [Hevs](https://course.hevs.io/did/eda-docs/eda_libs/Ethernet/ipv4.html)

**ICMP.** The Internet Control Message Protocol (RFC 792) carries IP-layer error and diagnostic messages (Echo, Destination Unreachable, Time Exceeded, Fragmentation Needed). Encapsulated *inside* IPv4 with Protocol = 1.

**ARP.** Address Resolution Protocol (RFC 826) maps IPv4 addresses to MAC addresses on a broadcast link. Not encapsulated in IP — it rides directly on Ethernet (EtherType 0x0806).

**NAT / PAT.** Network Address Translation rewrites IP source/destination addresses; PAT also rewrites L4 ports (sometimes called NAPT, RFC 3022). CGNAT extends this to ISP scale using 100.64.0.0/10 (RFC 6598, RFC 6888). [Cisco](https://www.cisco.com/c/en/us/support/docs/security/umbrella/225267-configure-cgnat-carrier-grade-nat-ips.html)

**DNS.** The Domain Name System (RFC 1034/1035) maps human-readable names to IPv4 (A) and IPv6 (AAAA) records.

**Cryptographic primitives** (only background needed for IPv4 directly): IPv4 has none built-in; security is added by IPsec (RFC 4301), TLS (RFC 8446) above transport, or MACsec (IEEE 802.1AE) below.

---

## 2. History and story

### 2.1 Origins (1969–1974)

ARPANET went live in 1969 using NCP (Network Control Program), a host-to-host protocol that assumed a single homogeneous network. By 1972 Robert Kahn (then at DARPA, formerly BBN) was pushing for "open architecture networking" — a way to interconnect heterogeneous packet networks. He recruited Vinton Cerf at Stanford. Their May 1974 IEEE paper, **"A Protocol for Packet Network Intercommunication"** (IEEE Trans. Commun. COM-22(5):637–648, [https://doi.org/10.1109/TCOM.1974.1092259](https://doi.org/10.1109/TCOM.1974.1092259)), described a single Transmission Control Program. That paper still bundled what we now call TCP and IP together. [ADS](https://ui.adsabs.harvard.edu/abs/1974ITCom..22..637C/abstract)

### 2.2 The TCP/IP split (1977–1981)

Through TCP versions 1, 2, 3, and the eventual split, Cerf, Jon Postel (USC/ISI), Danny Cohen, and others realised the reliability function (TCP) and the routing/addressing function (IP) should separate. Postel's IEN 2 (1977) proposed it; **IEN 41 / 44 (1978)** described IPv4 as a distinct protocol; **RFC 760 (January 1980)** was the first standalone IP spec; **RFC 791 (September 1981)** by Postel is the canonical text we still cite ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791)). Steve Crocker founded the RFC series in 1969 with RFC 1. [Wikipedia](https://en.wikipedia.org/wiki/IPv4)

The "flag day" was **1 January 1983**, when ARPANET cut over from NCP to TCP/IP, with hosts coordinated by NIC at SRI. The US DoD declared TCP/IP the standard for military computer networking in March 1982 ([https://en.wikipedia.org/wiki/IPv4](https://en.wikipedia.org/wiki/IPv4)). [Wikipedia](https://en.wikipedia.org/wiki/IPv4)

### 2.3 The big-endian/little-endian war

On 1 April 1980 Danny Cohen at USC/ISI published **IEN 137, "On Holy Wars and a Plea for Peace"** ([https://www.ietf.org/rfc/ien/ien137.txt](https://www.ietf.org/rfc/ien/ien137.txt)), arguing that all network protocols should pick *one* byte order regardless of host architecture. The IETF chose big-endian; that's why every IPv4 header field is interpreted MSB-first, and why C programmers still call `htonl()`/`ntohl()` to this day. The paper appeared in IEEE Computer (October 1981), DOI 10.1109/C-M.1981.220208 ([https://dl.acm.org/doi/10.1109/C-M.1981.220208](https://dl.acm.org/doi/10.1109/C-M.1981.220208)).

### 2.4 Rivals that lost

- **XNS (Xerox Network Systems, late 1970s)** — technically influential (its Internet Datagram Protocol is the direct ancestor of Novell IPX), but proprietary and confined to Xerox's PARC ecosystem.
- **PUP (PARC Universal Packet)** — Xerox's earlier datagram protocol, a direct intellectual ancestor.
- **OSI/CLNP (ISO 8473)** — the formal-ISO competitor, mandated by US GOSIP in 1990 but operationally outcompeted; CLNP survives only inside IS-IS today.
- **DECnet, AppleTalk, SNA** — vendor stacks displaced as dual-stack TCP/IP machines won the LAN.

### 2.5 Classful → CIDR (1981–1993)

Original RFC 791 defined Class A (/8), B (/16), C (/24), D (multicast), E (reserved). By the late 1980s the routing table was exploding and B-blocks were running out. **RFC 1338 (1992)** and the canonical **RFC 1519 (1993)**, now superseded by **RFC 4632 (2006)**, introduced CIDR — variable-length prefixes plus aggregation. This bought a decade. Vint Cerf has called the original 32-bit choice his most regrettable design decision.

### 2.6 IPng and the long road to IPv6

By 1992 the IETF launched the IPng process; proposals included TUBA (use CLNP), PIP, SIP, CATNIP, and SIPP — Steve Deering's SIPP, evolved with 128-bit addresses, became IPv6 (RFC 1883, 1995; current spec **RFC 8200**, 2017, [https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200)). Variable-length address proposals were rejected for hardware-implementation simplicity.

### 2.7 IPv4 patches that mattered

- **RFC 1349 (1992)** — Type-of-Service field clarifications (later obsoleted).
- **RFC 2474 (December 1998)** — redefines the TOS octet as 6-bit DSCP + 2-bit CU ([https://datatracker.ietf.org/doc/html/rfc2474](https://datatracker.ietf.org/doc/html/rfc2474)). [Datahacker](https://datahacker.blog/industry/technology-menu/networking/breaking-down-ipv4-address-headers)[Wikipedia](https://en.wikipedia.org/wiki/Type_of_service)
- **RFC 3168 (September 2001)** — Explicit Congestion Notification, claiming the lower 2 bits of the DS field.
- **RFC 6864 (February 2013)** — relaxes the IPID uniqueness rule for *atomic* (non-fragmenting, DF=1) datagrams; the original RFC 791 rule, taken literally, capped each source/destination/protocol triple at 6.4 Mbps for 1500-byte packets, which every modern stack already violated ([https://datatracker.ietf.org/doc/rfc6864/](https://datatracker.ietf.org/doc/rfc6864/)). [RFC Editor +2](https://www.rfc-editor.org/rfc/rfc6864)
- **RFC 7042 (October 2013)** — IANA considerations for IEEE 802 parameters, often referenced for EtherType 0x0800 (IPv4) and 0x86DD (IPv6).
- **RFC 6890 (April 2013)** — consolidated special-purpose address registries ([https://datatracker.ietf.org/doc/html/rfc6890](https://datatracker.ietf.org/doc/html/rfc6890)), obsoleting RFC 5735/5736. [IETF](https://datatracker.ietf.org/doc/html/rfc6890)

### 2.8 Exhaustion timeline

- **3 February 2011** — IANA distributed its last five /8 blocks to the RIRs, depleting the global free pool ([https://www.nic.ad.jp/en/ip/ipv4pool/](https://www.nic.ad.jp/en/ip/ipv4pool/)).
- **15 April 2011** — APNIC reached its "final /8" rationing phase. [Infoblox](https://www.infoblox.com/blog/ipv6-coe/stages-of-ipv4-address-exhaustion/)
- **14 September 2012** — RIPE NCC. [Infoblox](https://www.infoblox.com/blog/ipv6-coe/arin-reaches-phase-4-ipv4-exhaustion/)
- **10 June 2014** — LACNIC. [Wikipedia](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
- **24 September 2015** — ARIN.
- **21 April 2017** — AFRINIC. [Wikipedia](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
- **April 2011** — Microsoft bought 666,624 IPv4 addresses from bankrupt Nortel for $7.5M ($11.25/IP), launching the modern secondary market ([https://ipbnb.com/blog/ipv4-address-price-2026](https://ipbnb.com/blog/ipv4-address-price-2026)). [Ipbnb](https://ipbnb.com/blog/ipv4-address-price-2026)

### 2.9 What changed in the last 24 months (2024–2026)

- **1 February 2024** — AWS began charging **$0.005 per public IPv4 address per hour** ($43.80/yr) on every service in every region ([https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)). Cloudflare estimated this as a ~$2B "tax on the Internet" ([https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)). [Astuto](https://www.astuto.ai/blogs/understanding-the-aws-public-ipv4-price-hike)[Cloudflare](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)
- **2024–2025** — IPv4 secondary market peaked then softened. Mid-2024 averages were $32–$36/IP; in **June 2025** /16 prices fell below $20/IP for the first time since 2019 ([https://ipbnb.com/blog/ipv4-address-price-2026](https://ipbnb.com/blog/ipv4-address-price-2026)). January 2026 mean: $22/IP, with a /14 block transferred at $9/IP ([https://www.potaroo.net/ispcol/2026-01/addr2025.html](https://www.potaroo.net/ispcol/2026-01/addr2025.html)). [I + 2](https://blog.i.lease/ipv4-address-price-history-from-exhaustion-to-2026/)
- **End-2025** — Global BGP DFZ surpassed **1,000,000 IPv4 prefixes** in September 2025 (~1,040,000–1,050,000 by year-end) plus ~241,800 IPv6 prefixes ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)). [Wikipedia](https://en.wikipedia.org/wiki/Default-free_zone)[Grokipedia](https://grokipedia.com/page/default_free_zone)
- **28 March 2026** — Google's IPv6 statistics first crossed **50.1%** for a single day ([https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)); APNIC reports its smoothed measurement at ~43% ([https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)). [The Register](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
- **8 July 2024** — CRTC/Xona Partners published the official root-cause assessment of the 2022 Rogers outage, attributing it to an ACL/policy-filter deletion that flooded OSPF with the BGP table ([https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm)). [Canadian Radio-television and Telecommunications Commission](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- **Linux 6.3 (April 2023, broadly deployed in 2024)** introduced **BIG TCP for IPv4**, allowing TSO/GRO superpackets above 64 KB via a hop-by-hop-style mechanism, lifting per-flow throughput dramatically on 100/200 Gb NICs ([https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP](https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP)). [Phoronix](https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP)

---

## 3. How it actually works

### 3.1 The packet format

The IPv4 header is 20 bytes minimum, 60 bytes maximum (4-bit IHL field × 4-byte words). Field-by-field, with bit widths ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791) §3.1):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |    DSCP   |ECN|        Total Length           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|     Fragment Offset     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |        Header Checksum        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (0–40 bytes)        |   Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- **Version (4 bits)** — always `0100` = 4 for IPv4.
- **IHL (4 bits)** — header length in 32-bit words; minimum 5 (=20 bytes), max 15 (=60 bytes). [Hevs](https://course.hevs.io/did/eda-docs/eda_libs/Ethernet/ipv4.html)[Wikipedia](https://en.wikipedia.org/wiki/IPv4)
- **DSCP (6 bits) + ECN (2 bits)** — formerly the single 8-bit "Type of Service". DSCP per RFC 2474 selects per-hop forwarding behaviour (CS0–CS7, AFxx, EF). ECN per RFC 3168: `00`=Not-ECT, `01` and `10`=ECT(0)/(1), `11`=CE (Congestion Experienced) ([https://datatracker.ietf.org/doc/html/rfc2474](https://datatracker.ietf.org/doc/html/rfc2474), [https://datatracker.ietf.org/doc/html/rfc3168](https://datatracker.ietf.org/doc/html/rfc3168)). [University of Aberdeen](https://www.erg.abdn.ac.uk/users/gorry/course/inet-pages/dscp.html)
- **Total Length (16 bits)** — entire datagram in bytes, max 65,535. RFC 791 mandates minimum host MTU 576; RFC 1122 §3.3.3 makes 576 the safe assumed default. [RFC Editor](https://www.rfc-editor.org/rfc/rfc6274.txt)
- **Identification (16 bits)** — set by sender; used only for reassembly. Per RFC 6864 (2013), atomic datagrams (DF=1, MF=0, FO=0) **may** reuse this value; non-atomic datagrams **must not** repeat within the Maximum Datagram Lifetime per source/destination/protocol triple. [Liu + 2](https://pike.lysator.liu.se/docs/ietf/rfc/68/rfc6864.xml)
- **Flags (3 bits)** — bit 0 reserved (the famous "evil bit" of RFC 3514), bit 1 = DF (Don't Fragment), bit 2 = MF (More Fragments). [Uspto](https://ptacts.uspto.gov/ptacts/public-informations/petitions/1493855/download-documents?artifactId=ypdY9YCMXgJ6TNRD2te7rgTr4M7oZjGdFD5b6C_iTqnjWduJLZllTUI)
- **Fragment Offset (13 bits)** — in 8-byte units, allowing offsets 0–8191×8 = up to 65,528 bytes. [Uspto](https://ptacts.uspto.gov/ptacts/public-informations/petitions/1493855/download-documents?artifactId=ypdY9YCMXgJ6TNRD2te7rgTr4M7oZjGdFD5b6C_iTqnjWduJLZllTUI)[Wikipedia](https://en.wikipedia.org/wiki/IPv4)
- **TTL (8 bits)** — originally seconds, now decremented per hop (RFC 1812 §5.3.1). On reaching 0 router discards and emits ICMP Time Exceeded (Type 11). [Nmu + 2](https://euclid.nmu.edu/~rappleto/Classes/CS442/Notes/IPv6/IPv4_Header/)
- **Protocol (8 bits)** — next-header demultiplexer: 1 = ICMP, 2 = IGMP, 6 = TCP, 17 = UDP, 41 = IPv6 encap, 47 = GRE, 50 = ESP, 51 = AH, 89 = OSPF, 132 = SCTP. Full list at IANA. [Nmu](https://euclid.nmu.edu/~rappleto/Classes/CS442/Notes/IPv6/IPv4_Header/)[Nmu](https://euclid.nmu.edu/~rappleto/Classes/CS442/Notes/IPv6/IPv4_Header/)
- **Header Checksum (16 bits)** — one's-complement sum of all 16-bit half-words of the header with the checksum field set to zero, then one's-complemented. Recomputed at *every* router because TTL changes (RFC 1071, [https://datatracker.ietf.org/doc/html/rfc1071](https://datatracker.ietf.org/doc/html/rfc1071)). [Hevs + 2](https://course.hevs.io/did/eda-docs/eda_libs/Ethernet/ipv4.html)
- **Source / Destination (32 bits each)** — dotted-quad addresses.
- **Options + Padding** — rarely used in production; many networks drop packets with options for performance and security reasons. [Wikipedia](https://en.wikipedia.org/wiki/IPv4)

### 3.2 Header checksum algorithm (RFC 1071)

1. Set checksum field to 0.
2. Sum all 16-bit words in the header using one's-complement addition (carry is wrapped back into the LSB).
3. Take the one's complement of the result.
4. Insert into checksum field.
5. Verifier: sum every 16-bit word of the received header — including the checksum — and the result must be `0xFFFF` (= one's complement zero).

### 3.3 Fragmentation/reassembly state machine

A router with outbound MTU `M` receives a datagram of total length `L`:

- If `L ≤ M` → forward.
- If `L > M` and DF=1 → drop, send ICMP Type 3 Code 4 ("Fragmentation Needed") with the next-hop MTU in the message (RFC 1191 PMTUD).
- If `L > M` and DF=0 → split data into chunks of `(M − IHL×4)` rounded down to multiples of 8 octets; copy header into each fragment, set MF=1 on all but the last, set Fragment Offset accordingly, recompute Total Length and Header Checksum.

The receiver buffers fragments keyed by `(src, dst, protocol, ID)`, sets a reassembly timer (per RFC 1122, ≥60s recommended), and assembles or drops on timeout.

### 3.4 On-the-wire byte sequence (illustration)

A minimal UDP/IPv4 packet from 192.168.0.1 to 192.168.0.199, no options, no fragmentation, total length 0x73 (115 bytes):

```
45 00 00 73 00 00 40 00 40 11 B8 61 C0 A8 00 01 C0 A8 00 C7
```

Decoded: Version=4, IHL=5, TOS=0x00, TotLen=0x0073, ID=0x0000, Flags=DF, FO=0, TTL=64 (0x40), Protocol=0x11 (UDP), Checksum=0xB861, Src=0xC0A80001, Dst=0xC0A800C7. Cross-check via the swift-rfc-791 reference implementation ([https://github.com/swift-standards/swift-rfc-791](https://github.com/swift-standards/swift-rfc-791)). [GitHub](https://github.com/swift-standards/swift-rfc-791)

### 3.5 Edge cases

- **TTL=0 in transit** — discard, send ICMP Time Exceeded; this is exactly how `traceroute` works (varying TTL from 1 upward).
- **Options handling** — RFC 791 says hosts/gateways MUST accept options; reality, since the early 2000s, is that almost everyone drops or de-prioritises them (especially Source Route, Record Route, Timestamp). RFC 7126 documents acceptable filtering.
- **PMTUD black holes** — if an intermediate firewall silently drops ICMP Type 3 Code 4, the sender keeps retransmitting full-size packets and never learns the path can't carry them; symptoms are stalled TLS handshakes and small queries that work but big ones that don't.
- **Tiny-fragment / overlap attacks** — Teardrop and FragmentSmack abuse reassembly logic.

### 3.6 Security model

There is none. RFC 791 has no authentication, integrity protection, or confidentiality. RFC 6274 ([https://www.rfc-editor.org/rfc/rfc6274.txt](https://www.rfc-editor.org/rfc/rfc6274.txt)) is the IETF's 2011 security assessment of IPv4. IPsec (RFC 4301) was bolted on later; in practice TLS at the transport-adjacent layer handles confidentiality for most application traffic.

### 3.7 Sequence diagram (Mermaid)

```
sequenceDiagram
    autonumber
    participant A as Host A (10.0.0.5/24)
    participant SwA as Switch A
    participant R as Router (10.0.0.1 / 198.51.100.1)
    participant SwB as Switch B
    participant B as Host B (203.0.113.7)

    Note over A: App writes 4000 B to UDP socket → IPv4 stack
    A->>A: Build IPv4 datagram (TotLen=4028, ID=0xABCD, DF=0)
    A->>A: Need MAC for next-hop 10.0.0.1; ARP cache miss
    A->>SwA: ARP Request "Who has 10.0.0.1?" (broadcast)
    SwA-->>R: ARP Request flooded
    R-->>A: ARP Reply "10.0.0.1 is at aa:bb:cc:dd:ee:ff"
    A->>R: Ethernet frame, EtherType 0x0800, IPv4 datagram
    Note over R: Egress link MTU = 1500. Datagram is 4028 B, DF=0
    R->>R: Fragment into 3 pieces, copy ID=0xABCD,<br/>set MF=1 on first two, FO accordingly,<br/>decrement TTL, recompute header checksum
    R->>SwB: Frame 1 (offset 0, MF=1, 1500 B)
    R->>SwB: Frame 2 (offset 185, MF=1, 1500 B)
    R->>SwB: Frame 3 (offset 370, MF=0, 1068 B)
    SwB-->>B: All three fragments delivered
    B->>B: Reassemble by (src,dst,proto,ID); start 60s timer
    B->>B: Deliver complete 4000 B payload to UDP layer

    alt Path includes a 1280-byte tunnel and DF=1
        A->>R: Datagram TotLen=1500, DF=1
        R-->>A: ICMP Type 3 Code 4, Next-Hop MTU=1280
        A->>A: Cache PMTU=1280 for dst, retransmit smaller
    end
```

---

## 4. Deep connections to other protocols

**TCP (RFC 9293, originally RFC 793).** Runs *on top of* IPv4; encapsulated with Protocol=6. TCP provides reliability, ordering, flow and congestion control on top of IPv4's best-effort datagram service. The two were one protocol in the 1974 Cerf/Kahn paper and were split precisely so that connectionless services like DNS and voice could exist.

**UDP (RFC 768).** Also rides on IPv4 (Protocol=17). Trivially thin — adds only ports and an optional checksum. Foundation for DNS, DHCP, NTP, QUIC, and most amplification DDoS vectors.

**Ethernet (IEEE 802.3).** The dominant L2 carrier; an IPv4 datagram rides inside an Ethernet frame with EtherType **0x0800** (RFC 894). The 1500-byte default MTU drives almost every IPv4 fragmentation pitfall.

**ARP (RFC 826).** Resolves IPv4 → MAC on a link. Independent of IPv4 (its own EtherType 0x0806) but indispensable: every IPv4 unicast on Ethernet first triggers an ARP lookup.

**DNS (RFC 1034/1035, modern updates RFC 8484 DoH, RFC 7858 DoT).** Maps names to IPv4 (A) and IPv6 (AAAA) records. Without DNS the human web doesn't work; it usually rides UDP/IPv4 port 53.

**802.11 / Wi-Fi (IEEE 802.11-2020).** Another L2 carrier. Wi-Fi frames carry IPv4 with the same 0x0800 EtherType inside an LLC/SNAP header. Practical wrinkles: 802.11 fragmentation, retry behaviour, power-save mode all interact with IPv4 latency.

**IPv6 (RFC 8200).** The successor: 128-bit addresses, fixed 40-byte header, no in-network fragmentation, mandatory ICMPv6/ND. Coexists with IPv4 via dual-stack, NAT64/DNS64 (RFC 6146/6147), 464XLAT (RFC 6877), DS-Lite (RFC 6333), MAP-T (RFC 7599), MAP-E (RFC 7597), 6rd (RFC 5969).

**ICMP (RFC 792).** Companion control protocol *inside* IPv4 (Protocol=1). Carries Echo Request/Reply (ping), Destination Unreachable, Time Exceeded (traceroute), Redirect, Fragmentation Needed (PMTUD).

**IGMP (RFC 3376).** Internet Group Management Protocol; how IPv4 hosts subscribe to multicast groups. Protocol=2.

**NAT/PAT (RFC 3022, RFC 6888 for CGNAT).** Lets many hosts share fewer public IPv4 addresses. The single most important reason IPv4 still works in 2026.

**CIDR (RFC 4632).** Not a wire protocol but the addressing/aggregation discipline that prevented the 1990s routing-table collapse and enabled IPv4 to survive past its classful bounds.

**DHCP (RFC 2131) / BOOTP (RFC 951).** Dynamic IPv4 host configuration — assigns address, mask, gateway, DNS — over UDP ports 67/68.

**BGP (RFC 4271).** The Internet's inter-AS path-vector routing protocol; carries IPv4 prefixes (and IPv6 via MP-BGP, RFC 4760). Currently advertises ~1.05 million IPv4 routes globally ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)). [Grokipedia](https://grokipedia.com/page/default_free_zone)

**OSPF (RFC 2328 v2 for IPv4) / IS-IS (RFC 1195).** Intra-AS link-state IGPs that compute IPv4 forwarding tables.

**MPLS (RFC 3031).** Label-switched forwarding under IPv4; foundational for service-provider VPNs (RFC 4364), traffic engineering, and Segment Routing-MPLS.

**IPsec (RFC 4301/4302/4303).** Authentication Header (Protocol=51) and Encapsulating Security Payload (Protocol=50) wrap IPv4 to provide integrity and/or confidentiality.

**GRE (RFC 2784).** Generic Routing Encapsulation (Protocol=47); a thin wrapper used for tunnels, often for carrying multicast or non-IP across an IPv4 backbone.

**VRRP (RFC 5798).** Virtual Router Redundancy Protocol — multiple physical routers share a virtual IPv4 default-gateway address.

**RIP (RFC 2453).** Distance-vector IGP; obsolete in production but pedagogically useful and still found in small networks.

**SCTP (RFC 9260).** Streams Control Transmission Protocol — a third L4 alongside TCP/UDP, used in telecom (Diameter, SIGTRAN). Protocol=132.

**QUIC (RFC 9000).** Built on UDP (and therefore IPv4 or IPv6). Pulls TLS, congestion control, and stream multiplexing into the transport, partly to escape IPv4-middlebox ossification of TCP.

---

## 5. Real-world deployment

### 5.1 Major implementations

- **Linux kernel** — the workhorse of public Internet servers; `net/ipv4/` directory; recent additions include BIG TCP for IPv4 in 6.3 ([https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP](https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP)), MPTCP, and rich XDP/eBPF hooks.
- **FreeBSD / OpenBSD / NetBSD** — descendants of the original 4.4BSD stack that defined sockets; drives Netflix's Open Connect appliances.
- **Windows TCP/IP stack** — rewritten as a dual IPv4/IPv6 "Next-Generation TCP/IP Stack" in Vista (2006); current Windows 11/Server 2025 inherits this.
- **Cisco IOS / IOS XE / IOS XR / NX-OS** — proprietary; runs the bulk of enterprise and carrier IPv4 routing.
- **Juniper Junos (FreeBSD-derived control plane)** — dominant in Tier-1 backbones.
- **Userspace fast paths** — DPDK ([https://www.dpdk.org](https://www.dpdk.org)), VPP/FD.io, mTCP, F-Stack, Snabb. DPDK on Intel E810 hits **14.88 Mpps per core at 10 GbE** and scales linearly to ~148 Mpps at 100 GbE on 8 cores ([https://johal.in/pf_ring-packet-capture-python-dpdk-for-high-speed-network-monitoring/](https://johal.in/pf_ring-packet-capture-python-dpdk-for-high-speed-network-monitoring/)). Recent measurements show that on AMD EPYC 9005 with 100 GbE Intel E810 NICs, a single Linux process saturates ≤25 Gbps while DPDK reaches near line rate with one core ([https://arxiv.org/pdf/2509.25015](https://arxiv.org/pdf/2509.25015)). [Johal AI Hub](https://johal.in/pf_ring-packet-capture-python-dpdk-for-high-speed-network-monitoring/)[arxiv](https://arxiv.org/pdf/2509.25015)
- **Embedded** — lwIP (used in countless STM32/ESP32 projects), picoTCP, and Adam Dunkels' uIP (the canonical few-kilobyte stack).

### 5.2 Production scale

- **AWS** owns ~1.7% of the IPv4 space (~100M addresses) ([https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)). Since 1 Feb 2024 it charges $0.005/IP/hour. [Cloudflare](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)[Cloudflare](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)
- **Cloudflare** runs anycasted IPv4 prefixes from 300+ cities; has publicly mitigated DDoS attacks up to **31.4 Tbps** in Q4 2025 ([https://blog.cloudflare.com/ddos-threat-report-2025-q4/](https://blog.cloudflare.com/ddos-threat-report-2025-q4/)). [Cloudflare](https://blog.cloudflare.com/ddos-threat-report-2025-q4/)[Intelligentciso](https://www.intelligentciso.com/2026/02/09/cloudflares-2025-q4-ddos-threat-report-a-record-setting-31-4-tbps-attack-caps-a-year-of-massive-ddos-assaults/)
- **CGNAT** is now standard in mobile and many wireline ISPs, using **100.64.0.0/10** per RFC 6598. Issues include port-exhaustion at 64K connections per public IP, conntrack-table sizing (Linux `nf_conntrack_max`), and breaking inbound connectivity for self-hosters and STUN-dependent apps ([https://blog.apnic.net/2022/05/03/how-nat-traversal-works-concerning-cgnats/](https://blog.apnic.net/2022/05/03/how-nat-traversal-works-concerning-cgnats/)).
- **IPv4-as-a-Service** — DS-Lite (RFC 6333), MAP-T (RFC 7599), MAP-E (RFC 7597), 464XLAT (RFC 6877). Free.fr's well-known FTTH deployment uses 4rd; Reliance Jio in India deployed IPv6-first with NAT64/464XLAT for residual IPv4 access ([https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)). [Wikipedia](https://en.wikipedia.org/wiki/IPv4_Residual_Deployment)[APNIC Blog](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- **DFZ size** — ~1.05M IPv4 prefixes from ~46,800 originating ASNs as of late 2025 ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)). DFZ growth was about 44,000 new IPv4 entries in 2025, ~2% YoY. [Wikipedia](https://en.wikipedia.org/wiki/Default-free_zone)[APNIC Blog](https://blog.apnic.net/2026/01/08/bgp-in-2025/)

---

## 6. Failure modes and famous incidents

**Ping of Death (1996–1997).** Oversized fragmented ICMP packets that, when reassembled, exceeded 65,535 bytes, crashing many IPv4 stacks. Patches landed in late 1996; a later Windows-specific revival of the technique was tracked as **CVE-2013-3183** and **CVE-2020-16898** (the latter actually IPv6 ND, but often grouped).

**Teardrop, LAND, Smurf (late 1990s).** Teardrop sent overlapping fragments to crash reassembly logic; LAND sent packets with src=dst (loopback DoS); Smurf used directed broadcast amplification of ICMP Echo. RFC 2644 ("Directed Broadcast", 1999) made directed broadcast forwarding off-by-default in routers.

**Morris Worm (2 November 1988).** Exploited a buffer overflow in `fingerd` and a debug backdoor in `sendmail`; infected ~6,000 of the Internet's then ~60,000 hosts ([https://en.wikipedia.org/wiki/Morris_worm](https://en.wikipedia.org/wiki/Morris_worm)). The IPv4 layer simply *worked* — that was the lesson: a single-protocol homogeneous Internet was suddenly globally vulnerable. [We Live Security + 4](https://www.welivesecurity.com/2008/11/02/the-morris-worm-a-malware-prototype/)

**AS 7007 incident (25 April 1997).** A small Florida ISP (MAI Network Service) leaked the entire BGP table back as more-specifics, blackholing huge swathes of the Internet. The first widely-known route leak; chronicled by Doug Madory ([https://nanog.org/stories/articles/a-brief-history-of-the-internets-biggest-bgp-incidents/](https://nanog.org/stories/articles/a-brief-history-of-the-internets-biggest-bgp-incidents/)).

**SQL Slammer / Sapphire (25 January 2003).** A 376-byte UDP/IPv4 worm (404 bytes including headers) doubled in infected hosts every 8.5 seconds and infected ~75,000 vulnerable MS SQL Server hosts in 10 minutes, crashing routers worldwide ([https://en.wikipedia.org/wiki/SQL_Slammer](https://en.wikipedia.org/wiki/SQL_Slammer), [https://www.caida.org/catalog/papers/2003_sapphire/](https://www.caida.org/catalog/papers/2003_sapphire/)). Demonstrated that IPv4's connectionless UDP path could be weaponised at the speed of light. [CAIDA + 2](https://www.caida.org/catalog/papers/2003_sapphire/)

**Code Red (July 2001), Code Red II, Nimda.** TCP/IPv4 worms spreading via IIS vulnerabilities; widely cited precursors to Slammer.

**Pakistan Telecom YouTube hijack (24 February 2008).** PTCL (AS17557) announced 208.65.153.0/24 — a more-specific of YouTube's 208.65.152.0/22 — to internally null-route YouTube, but PCCW Global (AS3491) propagated the route globally, blackholing YouTube for ~2 hours ([https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/), [https://research.google/pubs/youtube-hijacking-february-24th-2008-analysis-of-bgp-routing-dynamics/](https://research.google/pubs/youtube-hijacking-february-24th-2008-analysis-of-bgp-routing-dynamics/)). The textbook BGP-via-IPv4 prefix-hijack. [RIPE Network Coordination Center](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)[MANRS](https://manrs.org/2020/09/what-is-bgp-prefix-hijacking-part-1/)

**Spamhaus DDoS (March 2013).** A DNS-amplification attack reached **~300 Gbps** (largest publicly reported at the time), launched by CyberBunker/STOPhaus; mitigated by Cloudflare anycast and Tier-1 cooperation ([https://blog.cloudflare.com/the-ddos-that-almost-broke-the-internet/](https://blog.cloudflare.com/the-ddos-that-almost-broke-the-internet/), [https://krebsonsecurity.com/2016/08/inside-the-attack-that-almost-broke-the-internet/](https://krebsonsecurity.com/2016/08/inside-the-attack-that-almost-broke-the-internet/)). Root cause: open DNS resolvers + IPv4 source-address spoofing not blocked by BCP38. [Dn + 2](https://dn.org/dns-amplification-attacks-and-their-role-in-distributed-denial-of-service-campaigns/)

**Mirai / Dyn (October 2016).** ~1.1 Tbps IoT-botnet attack on OVH; later took out Dyn DNS and much of the US East Coast Internet. Showed that IPv4 + default IoT credentials = systemic risk. [Flowtriq](https://flowtriq.com/blog/top-10-ddos-attacks-history)

**GitHub memcached DDoS (28 February 2018).** **1.35 Tbps** record at the time, using memcached UDP/11211 reflection with up to 51,000× amplification; mitigated by Akamai Prolexic in ~10 minutes ([https://thehackernews.com/2018/03/biggest-ddos-attack-github.html](https://thehackernews.com/2018/03/biggest-ddos-attack-github.html)). [The Hacker News + 2](https://thehackernews.com/2018/03/biggest-ddos-attack-github.html)

**FragmentSmack (CVE-2018-5391) and SegmentSmack (CVE-2018-5390), August 2018.** Linux IPv4/IPv6 fragment reassembly degenerated into a worst-case linked-list traversal under crafted random offsets, saturating CPU at 30 kpps ([https://www.kb.cert.org/vuls/id/641765/](https://www.kb.cert.org/vuls/id/641765/), [https://security.paloaltonetworks.com/CVE-2018-5391](https://security.paloaltonetworks.com/CVE-2018-5391)). Patched in upstream by switching to rb-tree reassembly and tightening the reassembly memory limits.

**MikroTik RouterOS bugs (2018–).** CVE-2018-14847 (Winbox auth bypass), CVE-2018-7445 (SMB stack overflow), CVE-2023-30799 — repeatedly turned MikroTik IPv4 routers into botnet/proxy infrastructure.

**IP fragmentation IDS evasion (Ptacek & Newsham, 1998; Caspar/Caceres, 2018).** Overlapping fragments where different OSes prefer different overlap policies remain a real evasion vector.

**Facebook/Meta outage (4 October 2021).** A backbone-maintenance script ran a command that withdrew Facebook's BGP advertisements for the prefixes carrying their own authoritative DNS, taking facebook.com / instagram.com / WhatsApp offline globally for ~6 hours ([https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/), [https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/)). Not strictly an IPv4 protocol bug — a routing/operational fault — but the largest reachability event of the decade. [Wikipedia](https://en.wikipedia.org/wiki/2021_Facebook_outage)

**Rogers Communications outage (8 July 2022, 26 hours, 12M users).** Removal of an ACL filter from a distribution router redistributed the full BGP table into OSPF, overloading core routers' CPU/RAM and crashing them; converged wireless+wireline IP core meant *everything* (including 911) fell. Confirmed by CRTC's 2024 Xona Partners report ([https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm), [https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641](https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641)). [Radio-Canada + 2](https://ici.radio-canada.ca/rci/en/news/2086093/human-error-caused-2022-rogers-outage-system-deficiencies-made-it-worse-report)

**Cloudflare DDoS records 2024–2025.** Hyper-volumetric attacks scaled 700% YoY, peaking at **31.4 Tbps** (35 seconds, December 2025) launched by the Aisuru-Kimwolf Android-TV botnet ([https://blog.cloudflare.com/ddos-threat-report-2025-q4/](https://blog.cloudflare.com/ddos-threat-report-2025-q4/), [https://radar.cloudflare.com/reports/ddos-2025-q4](https://radar.cloudflare.com/reports/ddos-2025-q4)). [Cloudflare Radar](https://radar.cloudflare.com/reports/ddos-2025-q4)[Intelligentciso](https://www.intelligentciso.com/2026/02/09/cloudflares-2025-q4-ddos-threat-report-a-record-setting-31-4-tbps-attack-caps-a-year-of-massive-ddos-assaults/)

**Frontier (April 2024).** Cyberattack disrupted Frontier's IT/OSS systems, causing extended IPv4-service customer-support outages ([https://www.cablepapa.com/blog/frontier-internet-outage-causes-solutions-and-how-to-stay-connected/](https://www.cablepapa.com/blog/frontier-internet-outage-causes-solutions-and-how-to-stay-connected/)). [Lumen 2024–2026 outages tracked but no single major root-cause publication; `[needs source]` for a definitive incident report.] [CablePapa](https://www.cablepapa.com/blog/frontier-internet-outage-causes-solutions-and-how-to-stay-connected/)

---

## 7. Fun facts and anecdotes

- **"Datagram" comes from CYCLADES** (Louis Pouzin's French research network, 1972) — Cerf and Kahn adopted both the word and the connectionless model. "Octet" was preferred over "byte" because in the 1970s "byte" still varied between 6, 7, 8, and 9 bits across hosts.
- **The Evil Bit (RFC 3514, Steve Bellovin, 1 April 2003).** Proposed that the high-order reserved bit of the Flags field signal "this packet has evil intent" ([https://datatracker.ietf.org/doc/html/rfc3514](https://datatracker.ietf.org/doc/html/rfc3514)). Reactions include a half-serious FreeBSD implementation and a worried email Bellovin received from someone in broadcast IP-rights enforcement ([https://www.cs.columbia.edu/~smb/3514.html](https://www.cs.columbia.edu/~smb/3514.html)). [Wikipedia + 3](https://en.wikipedia.org/wiki/Evil_bit)
- **RFC 1149 — IP over Avian Carriers (David Waitzman, 1 April 1990)** ([https://www.rfc-editor.org/rfc/rfc1149](https://www.rfc-editor.org/rfc/rfc1149)) — actually demonstrated by the Bergen Linux User Group in April 2001: 9 packets, 55% loss, latency 3,000–6,000 seconds. Updated by RFC 2549 (QoS, 1999) and RFC 6214 (IPv6, 2011). [RFC 1149 + 2](https://rfc1149.uk/)
- **Postel's Law / Robustness Principle.** Jon Postel, RFC 793 §2.10 (1981): "Be conservative in what you do, be liberal in what you accept from others." Four decades later it's the most-cited and most-debated design principle in networking; modern security folks argue it incentivises ambiguous receivers and parser bugs.
- **The big-endian/little-endian Holy Wars.** Cohen's IEN 137 takes its imagery from *Gulliver's Travels* (Lilliput vs Blefuscu over which end of the egg to crack); the IETF chose big-endian, Intel and DEC chose little-endian, and the term "byte order" enters every networking interview because of this fight. [Ufrj](https://ic.ufrj.br/~gabriel/progpar/danny_co.pdf)
- **127.0.0.0/8 is a /8 for loopback.** That's 16,777,216 addresses for "localhost". Postel's choice was generous; in 2024 IETF drafts (e.g., draft-schoen-intarea-unicast-127, on/off through 2024–2026) have proposed reclaiming 127.1.0.0/16 onwards as unicast. Not yet adopted as of May 2026; verify status before quoting.
- **Class-A handouts.** MIT (18.0.0.0/8), HP-merged DEC (16.0.0.0/8), Apple (17.0.0.0/8), Ford (19.0.0.0/8), Halliburton (34.0.0.0/8 — later sold to AWS for ~$110M in 2017), General Electric, IBM, Xerox, AT&T, US DoD, and the US Postal Service all received entire /8 blocks in the 1980s. Many have since been sold or split.
- **Cerf and Kahn won the 2004 ACM Turing Award** "for pioneering work on internetworking, including the design and implementation of the Internet's basic communications protocols, TCP/IP" ([https://amturing.acm.org/award_winners/cerf_1083211.cfm](https://amturing.acm.org/award_winners/cerf_1083211.cfm)). They received it in February 2005. [ACM Awards](https://awards.acm.org/award_winners/kahn_4598637)[ICANN](https://www.icann.org/en/announcements/details/icann-chairman-of-the-board-wins-prestigious-turing-award-16-2-2005-en)
- **RFC 5841 ("TCP Option to Denote Packet Mood", 1 April 2010)** lets you tag packets as 😀, 😢, etc. — reliably one of the IETF's best April Fools.
- **Microsoft's $7.5M Nortel buy (April 2011).** First major secondary-market IPv4 transaction at $11.25/IP. By peak 2021, /16 prices reached $45–$60/IP; by January 2026, the mean is ~$22/IP and a /14 sold at $9/IP ([https://www.potaroo.net/ispcol/2026-01/addr2025.html](https://www.potaroo.net/ispcol/2026-01/addr2025.html)). [Potaroo](https://www.potaroo.net/ispcol/2026-01/addr2025.html)

---

## 8. Practical wisdom

**MTU and Path MTU Discovery.** Default Ethernet MTU is 1500. PPPoE (residential DSL) is 1492. Wireguard tunnels are 1420. IPsec ESP tunnel-mode in transport over IPv4 is typically 1438. **Path MTU Discovery black holes** are caused by middleboxes that drop ICMP Type 3 Code 4. Mitigations: TCP MSS clamping at the firewall (`iptables ... -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`), or RFC 4821 Packetisation Layer PMTUD.

**Avoid in-network fragmentation.** RFC 6864 and operational experience say emit DF=1 atomic datagrams; let TCP MSS or application-level chunking handle fit. CGNATs, LAGs, and many middleboxes mishandle fragments.

**TCP MSS clamping.** Standard on every consumer router for PPPoE; also essential on tunnels. Without it, large TCP segments arrive with DF=1, the tunnel's lower MTU drops them, the resulting ICMPs disappear, and connections stall.

**Sysctl tunables that matter on Linux.** `net.ipv4.ip_forward=1` to enable forwarding; `net.ipv4.conf.all.rp_filter=1` for strict reverse-path checking (RFC 3704 / BCP 84) to prevent spoofed-source ingress; `net.core.somaxconn` for accept-queue size; `net.ipv4.tcp_max_syn_backlog`; `net.netfilter.nf_conntrack_max` and `nf_conntrack_buckets` for NAT/CGNAT scale; `net.ipv4.tcp_tw_reuse` and `tcp_fin_timeout` for high-churn front-ends. Reference: `man 7 tcp` ([https://man7.org/linux/man-pages/man7/tcp.7.html](https://man7.org/linux/man-pages/man7/tcp.7.html)).

**What to monitor.** Packet loss (per-link drop counters), TCP retransmits (`ss -i`, `nstat`), ICMP rate (sudden spike of Type 3 Code 4 = MTU issue; flood of Type 11 = routing loop), conntrack table fill, fragmentation counters (`/proc/net/netstat` Ip*Frag*), BGP session flaps.

**Debugging moves.**

- `tcpdump -nn -i eth0 'icmp[icmptype]==icmp-unreach'` to catch PMTUD signals.
- `tcpdump -nn -i eth0 '(ip[6:2] & 0x3fff) != 0'` to see fragments.
- `mtr --tcp -P 443 host` for asymmetric/loss diagnosis.
- `traceroute -F -M 1500 host` to find the MTU-limiting hop.
- `conntrack -L | wc -l` to size CGNAT/firewall tables.
- `ss -intp` for live TCP state and congestion-control variables.

**Common misconfigurations.**

- Asymmetric routing breaking stateful firewalls and rp_filter=1.
- MTU mismatches between SP and CPE.
- NAT hairpinning failures (clients can't reach their public IP from inside).
- RFC1918 leaks into BGP (BCP38/RFC3704 ingress filtering missing).
- Stale bogon filters blocking newly-allocated prefixes (especially after RIR de-bogonisation events).
- CGNAT port-exhaustion (~64,512 ephemeral ports per public IP per protocol).

---

## 9. Learning resources (current as of May 2026)

### Specifications

- **RFC 791 — INTERNET PROTOCOL** (Postel, Sep 1981) — the canonical text. [https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791). Level: required reading at all levels. Last updated: errata maintained at [https://www.rfc-editor.org/errata/rfc791](https://www.rfc-editor.org/errata/rfc791).
- **RFC 1122 — Requirements for Internet Hosts: Communication Layers** (Braden, Oct 1989). [https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122). Intermediate.
- **RFC 1812 — Requirements for IP Version 4 Routers** (Baker, Jun 1995). [https://datatracker.ietf.org/doc/html/rfc1812](https://datatracker.ietf.org/doc/html/rfc1812). Advanced.
- **RFC 6864 — Updated Specification of the IPv4 ID Field** (Touch, Feb 2013). [https://datatracker.ietf.org/doc/rfc6864/](https://datatracker.ietf.org/doc/rfc6864/). Advanced.
- **RFC 8200 — IPv6 Specification** (Deering & Hinden, Jul 2017) — for context. [https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200).
- **RFC 6890 — Special-Purpose IP Address Registries** (Cotton et al., Apr 2013). [https://datatracker.ietf.org/doc/html/rfc6890](https://datatracker.ietf.org/doc/html/rfc6890). (Obsoletes RFC 5735/5736.) [IETF](https://datatracker.ietf.org/doc/html/rfc6890)[Wikidata](https://www.wikidata.org/wiki/Q47462480)
- **RFC 2474 — DSCP** (Nichols et al., Dec 1998). [https://datatracker.ietf.org/doc/html/rfc2474](https://datatracker.ietf.org/doc/html/rfc2474).
- **RFC 3168 — ECN** (Ramakrishnan, Floyd, Black, Sep 2001). [https://datatracker.ietf.org/doc/html/rfc3168](https://datatracker.ietf.org/doc/html/rfc3168).
- **RFC 4632 — CIDR** (Fuller & Li, Aug 2006). [https://datatracker.ietf.org/doc/html/rfc4632](https://datatracker.ietf.org/doc/html/rfc4632).
- **RFC 6274 — Security Assessment of IPv4** (Gont, Jul 2011). [https://www.rfc-editor.org/rfc/rfc6274.txt](https://www.rfc-editor.org/rfc/rfc6274.txt).

### Books

- **Fall & Stevens, *TCP/IP Illustrated, Volume 1, 2nd Ed.* (Addison-Wesley, 2011).** Chapters 5 (IPv4/IPv6 Headers), 8 (ICMP), 10 (Fragmentation). Still the gold standard. Intermediate–advanced.
- **Comer, *Internetworking with TCP/IP, Vol. 1, 6th Ed.* (Pearson, 2013).** Intermediate; rigorous undergraduate text.
- **Kurose & Ross, *Computer Networking: A Top-Down Approach, 8th Ed.* (Pearson, 2021).** The default undergraduate textbook in 2025–2026; chapters 4–5 cover IPv4. Intro–intermediate.
- **Peterson & Davie, *Computer Networks: A Systems Approach, 6th Ed.* (Morgan Kaufmann, 2022; open-source online edition continually updated, latest 6.2-dev in 2025).** Free at [https://book.systemsapproach.org/](https://book.systemsapproach.org/). Intermediate.
- **Tanenbaum & Wetherall (now Feamster), *Computer Networks, 6th Ed.* (Pearson, 2021).** Intermediate.

### Foundational papers

- **Cerf & Kahn, "A Protocol for Packet Network Intercommunication"** (IEEE Trans. Commun., May 1974). DOI 10.1109/TCOM.1974.1092259. [https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf). [ADS](https://ui.adsabs.harvard.edu/abs/1974ITCom..22..637C/abstract)
- **Saltzer, Reed & Clark, "End-to-End Arguments in System Design"** (ACM TOCS 2(4), Nov 1984). DOI 10.1145/357401.357402. [https://web.mit.edu/saltzer/www/publications/endtoend/endtoend.pdf](https://web.mit.edu/saltzer/www/publications/endtoend/endtoend.pdf). [Medium](https://dominik-tornow.medium.com/paper-summary-end-to-end-arguments-in-system-design-53b1db6dfa8d)
- **Jacobson, "Congestion Avoidance and Control"** (SIGCOMM 1988). DOI 10.1145/52324.52356. Background context for why TCP-over-IPv4 didn't collapse.
- **Cohen, "On Holy Wars and a Plea for Peace"** (IEN 137, 1980; IEEE Computer Oct 1981). DOI 10.1109/C-M.1981.220208. [https://www.ietf.org/rfc/ien/ien137.txt](https://www.ietf.org/rfc/ien/ien137.txt).
- **Moore et al., "The Spread of the Sapphire/Slammer Worm"** (CAIDA, 2003). [https://www.caida.org/catalog/papers/2003_sapphire/](https://www.caida.org/catalog/papers/2003_sapphire/).

### Long-form engineering blogs (2024–2026)

- **Cloudflare blog — "Amazon's $2bn IPv4 tax"** (Jul 2023, still timely). [https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/).
- **Cloudflare DDoS Threat Report Q4 2025**. [https://blog.cloudflare.com/ddos-threat-report-2025-q4/](https://blog.cloudflare.com/ddos-threat-report-2025-q4/).
- **APNIC Blog — "BGP in 2025"** (Geoff Huston, Jan 2026). [https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/).
- **APNIC Blog — "Google hits 50% IPv6"** (Apr 2026). [https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/).
- **AWS Networking & Content Delivery — "Identify and optimize public IPv4 address usage on AWS"**. [https://aws.amazon.com/blogs/networking-and-content-delivery/identify-and-optimize-public-ipv4-address-usage-on-aws/](https://aws.amazon.com/blogs/networking-and-content-delivery/identify-and-optimize-public-ipv4-address-usage-on-aws/).
- **Meta Engineering — "More details about the October 4 outage"** (2021, but still the canonical post-mortem). [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/).
- **Netflix Tech Blog — Open Connect & FreeBSD networking series** (search "netflixtechblog.com freebsd").
- **Geoff Huston's "ISP Column" / Potaroo** — monthly long-form on routing & addressing. [https://www.potaroo.net/ispcol/](https://www.potaroo.net/ispcol/).

### YouTube / video

- **Stanford CS144 lectures (Levis & McKeown / 2025–26 edition)**. [https://cs144.github.io/](https://cs144.github.io/). Build a complete TCP/IPv4 stack in C++. [CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)[CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- **Computerphile — "Internet Protocol" series** with Richard Mortier (multiple, 2018–2024).
- **Ben Eater — "Networking" series** on Ethernet/ARP/IP at the byte level (YouTube, 2022–).
- **NANOG & RIPE conference channels** — free, archive of operator talks.
- **Cerf & Kahn 2004 Turing Award Lecture**. [https://www.youtube.com/watch?v=JLAfLWE76fE](https://www.youtube.com/watch?v=JLAfLWE76fE).

### Podcasts (specific episodes)

- **Packet Pushers Heavy Networking** — many episodes on CGNAT, IPv6 transition; recent: "IPv4 Exhaustion and the Cloud Tax" (search packetpushers.net).
- **The History of Networking (Russ White / Donald Sharp)** — episodes on CIDR, BGP origins, IPv6 design.
- **IPv6 Buzz** (Ed Horley, Tom Coffeen, Scott Hogg) — "AWS IPv4 Charging" and "MAP-T at Scale" episodes.
- **On the Metal (Oxide Computer)** — interviews with Bryan Cantrill et al.; sporadic networking-history coverage.
- **Software Engineering Daily** — multiple episodes on Cloudflare and AWS networking architecture.

### University courses (with course numbers)

- **Stanford CS144** — Introduction to Computer Networking (Levis/McKeown). [https://cs144.github.io/](https://cs144.github.io/).
- **MIT 6.829** — Computer Networks (Balakrishnan). MIT OCW publishes selected materials.
- **Princeton COS 461** — Computer Networks (Rexford). [https://www.cs.princeton.edu/courses/archive/spring24/cos461/](https://www.cs.princeton.edu/courses/archive/spring24/cos461/).
- **CMU 15-441/641** — Computer Networks. Project: build a TCP-like protocol over UDP.
- **Berkeley CS 168** — Introduction to the Internet: Architecture and Protocols (Sylvia Ratnasamy). [https://sp25.cs168.io/](https://sp25.cs168.io/).

### Hands-on tools

- **Wireshark** with sample captures from cloudshark.org and pcap-tracewrangler — essential.
- **Cisco Packet Tracer** for entry-level lab; **GNS3** and **EVE-NG** for production-fidelity emulation.
- **Containerlab** (Nokia) — modern, declarative network labs in containers. [https://containerlab.dev/](https://containerlab.dev/).
- **Mininet** — kernel-namespace SDN/topology lab. [http://mininet.org/](http://mininet.org/).
- **Subnet calculators** — `ipcalc(1)`, sipcalc, online at subnetcalculator.com.
- **RIPE Atlas** — global measurement network. [https://atlas.ripe.net/](https://atlas.ripe.net/).
- **Cloudflare Radar** — live BGP/DDoS/IPv6 stats. [https://radar.cloudflare.com/](https://radar.cloudflare.com/).
- **BGPlay (RIPEstat)** — visualise BGP route changes. [https://stat.ripe.net/](https://stat.ripe.net/).

---

## 10. Where things are heading (2025–2026 frontier)

**IPv6 finally crossing 50%.** Google's measurement crossed 50.1% on a single day on 28 March 2026 ([https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)); APNIC's smoothed view sits at ~43% ([https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)). India, France, Germany, and Belgium are all >70%; the US is just over 50%. Linear growth of ~3.3 pp/year since 2018 suggests ~80% by 2030 if the trend holds — but the bigger debate is whether we asymptote at 60–75% with a permanent IPv4 long tail. [The Register + 5](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)

**Cloud IPv4 pricing.** AWS's $0.005/hr charge has held since Feb 2024 ([https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)). GCP and Azure have followed with similar structures. Hetzner charges €1/IPv4/month. The pricing signal is now industry-wide. [The Register](https://www.theregister.com/2023/07/31/aws_says_ipv4_addresses_cost/)[TechPlanet](https://techplanet.today/post/ipv6-adoption-reaches-50-the-long-journey-toward-internets-next-generation)

**IPv4 secondary market.** /16 prices fell below $20/IP in June 2025 — the first time since 2019 — driven by hyperscalers leaving the buy-side after stockpiling ([https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/](https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/)). Mean January 2026 price: $22; a /14 transferred at $9/IP. Lease prices have been flatter at $0.38–$0.50/IP/month ([https://www.ipxo.com/blog/ipv4-lease-price-trends-2025/](https://www.ipxo.com/blog/ipv4-lease-price-trends-2025/)). [IPXO + 3](https://www.ipxo.com/blog/ipv4-lease-price-trends-2025/)

**Active IETF working groups.**

- **V6OPS** (IPv6 Operations) — drafts on IPv4-as-a-Service deprecation, IPv6-only data centres.
- **INTAREA** (Internet Area) — including the long-running "unicast use of 127/8" experiment.
- **6MAN** — IPv6 maintenance.
- **IPPM** — performance metrics.
- **BMWG** — benchmarking.
- **TSVAREA / QUIC / MASQUE** — transport-layer evolution above IPv4.

**Programmable data planes.** P4 (P4.org consortium under ONF) and SmartNIC offload (Pensando, Mellanox/NVIDIA BlueField-3, Intel IPU) are pushing IPv4 forwarding into per-packet line-rate hardware. eBPF/XDP delivers ~25–40 Mpps per core in software (kernel-bypass DPDK still leads at ~14.88 Mpps per core fully in userspace; [https://johal.in/pf_ring-packet-capture-python-dpdk-for-high-speed-network-monitoring/](https://johal.in/pf_ring-packet-capture-python-dpdk-for-high-speed-network-monitoring/)).

**Segment Routing.** SR-MPLS is now standard in carriers; SRv6 lets operators encode source-routes inside IPv6 addresses, an explicit IPv6-first move. SR-IPv4 (via MPLS) coexists.

**MAP-T / MAP-E / DS-Lite / 464XLAT** are the standardised IPv4-as-a-Service stacks for IPv6-only access networks. 464XLAT in mobile (T-Mobile US) is the largest deployment by user count.

**Recent measurement.** APNIC daily IPv6 measurement ([https://stats.labs.apnic.net/ipv6](https://stats.labs.apnic.net/ipv6)) and Eric Vyncke's daily statistics ([https://www.vyncke.org/ipv6status/](https://www.vyncke.org/ipv6status/)) are the operator-grade dashboards beyond Google.

**What's actually being deprecated.** RFC 791's options field is effectively dead in production. Strict source routing (LSRR/SSRR) is widely blocked since the 2000s. The Class A/B/C language survives only in textbooks. IPv4 multicast (IGMP) survives in IPTV and on enterprise LANs but is largely gone from the public Internet. The Identification field is dead-letter for atomic datagrams (RFC 6864). [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/68/rfc6864.xml)

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook.** "In 1981, Jon Postel published a 45-page document called RFC 791. It described a way to chop messages into self-addressed envelopes called *datagrams* and lob them at any of about four billion destinations on something called the Internet. Forty-five years later, that document still runs the planet — propping up an Internet of 30 billion devices, a $20 billion-a-year address resale market, and AWS bills with a brand-new line item for renting the very same 32-bit numbers Postel handed out for free. This is the story of IPv4: how a teenager-long government experiment refused to die, and what it cost us to keep it alive."

**Striking statistics (with sources).**

- Only ~3.9 million unallocated IPv4 addresses remain across all RIRs at the start of 2026 ([https://ipbnb.com/blog/ipv4-address-price-2026](https://ipbnb.com/blog/ipv4-address-price-2026)). [Ipbnb](https://ipbnb.com/blog/ipv4-address-price-2026)
- The global BGP DFZ exceeded **1,000,000 IPv4 prefixes** in September 2025, advertised by ~46,800 ASNs ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)). [Wikipedia](https://en.wikipedia.org/wiki/Default-free_zone)
- A /16 IPv4 block sold at under $20 per address in June 2025 — the first time since 2019; a January 2026 /14 sold at $9/IP, while smaller /24 blocks still command $35–$45/IP ([https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/](https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/)). [ARIN](https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/)[Ipbnb](https://ipbnb.com/blog/ipv4-address-price-2026)
- Cloudflare blocked **47.1 million DDoS attacks in 2025**, peaking at **31.4 Tbps** for one 35-second burst — almost all riding IPv4 ([https://blog.cloudflare.com/ddos-threat-report-2025-q4/](https://blog.cloudflare.com/ddos-threat-report-2025-q4/)). [Cloudflare Radar](https://radar.cloudflare.com/reports/ddos-2025-q4)[Intelligentciso](https://www.intelligentciso.com/2026/02/09/cloudflares-2025-q4-ddos-threat-report-a-record-setting-31-4-tbps-attack-caps-a-year-of-massive-ddos-assaults/)
- AWS owns ~1.7% of the entire IPv4 address space, roughly 100 million addresses ([https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)). [Cloudflare](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)[Cloudflare](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)
- Google's IPv6 share hit 50.1% on 28 March 2026 — 28 years after IPv6 was first standardised ([https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)).

**"Pause and think" moment.** "Read literally, the original IPv4 specification limits any pair of hosts to **6.4 megabits per second** for typical 1500-byte packets — because the 16-bit Identification field would have to repeat. Every TCP connection above 6.4 Mbps you've made since 1995 has technically violated RFC 791. The IETF didn't fix it until February 2013, with RFC 6864, by retroactively legalising what every implementation was already doing." ([https://datatracker.ietf.org/doc/rfc6864/](https://datatracker.ietf.org/doc/rfc6864/)). [RFC Editor](https://www.rfc-editor.org/info/rfc6864)[Tech Invite](https://www.tech-invite.com/y65/tinv-ietf-rfc-6864.html)

**Failure-story arc — Pakistan vs. YouTube, 24 February 2008.**

- *Setup.* The Pakistani government orders all national ISPs to block YouTube over a video deemed offensive. Pakistan Telecom's engineers want to blackhole the traffic locally. They configure a static route for **208.65.153.0/24** — a more-specific slice of YouTube's announced **208.65.152.0/22** — pointed at null0. Standard internal-blackhole technique.
- *Mistake.* By configuration error, they redistribute that /24 into BGP toward their upstream, **PCCW Global (AS 3491)**. PCCW does not filter the announcement.
- *Consequence.* At 18:47 UTC, the more-specific /24 floods the global routing table. Because BGP prefers longer prefixes, almost every router on the Internet sends YouTube traffic to Karachi. YouTube goes dark globally for approximately two hours.
- *Resolution.* At 20:07 UTC, YouTube engineers begin announcing the same /24 themselves; minutes later they de-aggregate further to two /25s (208.65.153.0/25 and 208.65.153.128/25) to claw back transit. PCCW finally withdraws AS 17557's announcements at ~20:50 UTC. The world breathes again. The aftermath drives long-term work on RPKI, BGPsec, and MANRS — none of which would have been deployed in time to stop the original mistake. ([https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/))

---

## Caveats

- **Claims marked `[needs source]`.** Specific 2024–2026 Lumen/Frontier IPv4-protocol-level outage post-mortems were not located beyond aggregator status pages and one Frontier April-2024 cyberattack reference; treat any specific dates/causes for those carriers in this period as unverified.
- **Forward-looking projections.** IPv4 lease/sale prices for 2026 cited from CircleID and IPXO are explicitly forecasts, using verbs like "expected" and "may" — they are not transacted history. The historical price points (June 2025 sub-$20 /16, January 2026 $9/IP /14) come from Geoff Huston's Potaroo column drawing on RIR transfer registries and are corroborated by ARIN's own blog post.
- **Google's "50% IPv6" milestone** is a single-day daily reading; the smoothed multi-week average measured by APNIC remains at ~43% as of late April 2026. Reports vary because Google measures its own traffic, APNIC samples ad-network beacons, and Cloudflare Radar measures its HTTP traffic; the three are reconcilable but differ at any given moment.
- **DDoS records** (e.g., 31.4 Tbps Q4 2025) are self-reported by mitigation providers; "largest publicly disclosed" is a careful caveat.
- **Conflicting Rogers outage durations** (15 vs. 26 hours): the official CRTC/Xona report identifies the outage as starting 04:43 EDT 8 July 2022 and lasting more than a full day for some services; some early Cloudflare/Kentik posts cite ~15 hours for primary BGP/traffic recovery. Both are correct at different layers of the stack.
- **The "IPv4 will sunset" narrative** has been wrong for 30 years. As of May 2026, IPv4 is *more* commercialised, not less — exactly the opposite of what was predicted at exhaustion. Plan IPv6 deployments for the long term, but do not assume IPv4 is going away inside any operational planning horizon under five years.
- **Some ranges and field semantics** (e.g., "127/8 might be partly reclaimed", "options are dead") reflect *de facto* operational reality, not RFC normative status. Verify against current RFC editor errata before quoting in standards-sensitive contexts.