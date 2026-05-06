---
prompt_source: deep-research-prompts.txt:1756-1937 (PROTOCOL · IPv6)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/5a524438-11f5-44eb-b6ef-01359fc73a2c
research_mode: claude.ai Research
---

# Internet Protocol version 6 (IPv6): A Deep Research Report

*Compiled May 5, 2026. Bias toward 2024–2026 sources is explicit; older claims are flagged where current state has changed.*

---

## 1. Prerequisites and glossary

IPv6 sits at Layer 3 of the OSI model — the network layer of the TCP/IP stack. To follow the rest of this report, the following vocabulary is essential. Every definition is followed by an authoritative pointer.

- **OSI / TCP-IP layers.** OSI is a 7-layer reference model (Physical, Data Link, Network, Transport, Session, Presentation, Application); TCP/IP is the 4-layer model actually implemented (Link, Internet, Transport, Application). IP — both v4 and v6 — is the *Internet/Network* layer protocol that gives every host an address and routes packets between them. (IETF, RFC 1122; ISO/IEC 7498-1.)
- **Frame, packet, datagram, segment.** A *frame* is a Layer-2 unit (e.g., Ethernet). A *packet* is a Layer-3 unit (an IP packet). A *datagram* is a connectionless Layer-3/4 unit (UDP datagrams ride inside IP packets). A *segment* is a TCP unit. (RFC 1122.)
- **Header.** Fixed-format metadata at the front of a packet describing its handling (version, addresses, next protocol, length, etc.). The IPv6 header is fixed at 40 bytes (RFC 8200 §3).
- **Checksum.** A short integrity field computed over a packet so receivers can detect corruption. IPv4 has a header checksum; **IPv6 has none** — upper-layer protocols (TCP, UDP, ICMPv6) carry mandatory checksums computed over an *IPv6 pseudo-header* (RFC 8200 §8.1).
- **MTU (Maximum Transmission Unit).** The largest L3 payload a link will carry without fragmentation. IPv6 mandates **1280 bytes** as the minimum link MTU (RFC 8200 §5).
- **MAC address.** A 48-bit Layer-2 hardware address used inside an Ethernet/Wi-Fi frame to deliver to the next hop on the wire (IEEE 802).
- **ARP (Address Resolution Protocol).** IPv4's mechanism for mapping an IP address to a MAC address on the local link (RFC 826). **IPv6 abolishes ARP** and replaces it with the Neighbor Discovery Protocol carried over ICMPv6 (RFC 4861).
- **ICMP / ICMPv6.** The control/error-signaling protocol that lives alongside IP. In IPv4 ICMP is largely optional; in IPv6 **ICMPv6 is integral** — Neighbor Discovery, SLAAC, MLD, and PMTUD all depend on it (RFC 4443, RFC 4861).
- **Socket.** The OS-level endpoint `(address, port, protocol)` an application uses to send/receive over IP. IPv6 sockets use `AF_INET6` / `sockaddr_in6` (RFC 3493).
- **Handshake.** The packet exchange that establishes a connection (e.g., TCP three-way SYN/SYN-ACK/ACK; TLS's record-layer handshake).
- **Stream.** An ordered byte-flow abstraction provided above IP — most often by TCP, increasingly by QUIC (RFC 9000).
- **Encoding schemes.** IPv6 addresses are written in *colon-hex* (eight 16-bit groups). Per **RFC 5952**, the canonical text form requires lowercase hex, suppressed leading zeros, and a single `::` placed over the longest run of zero groups.
- **Cryptographic primitives.** SLAAC stable-privacy interface IDs (RFC 7217) use a hash construction (typically SHA-256 in modern Linux) over `(prefix, interface, network_id, secret_key)`. IPsec for IPv6 (AH and ESP, RFC 4301/4302/4303) uses HMAC, AES-GCM, ChaCha20-Poly1305, etc. Note that the originally *mandatory-to-implement* IPsec requirement was **demoted to optional** in RFC 6434 (2011) — a frequent source of myth. [OneUptime](https://oneuptime.com/blog/post/2026-03-20-temporary-vs-stable-ipv6-addresses/view)

---

## 2. History and story

### The trigger: IPv4 address exhaustion projections (1990–1992)

By 1990 the IETF had concluded that IPv4's 32-bit address space, paired with classful (Class A/B/C) allocation, would be exhausted within a few years — Class B in particular was projected to run out by ~1994 (Frank Solensky's now-famous projections to the IETF's ROAD — *Routing And Addressing* — group). The community responded on three parallel tracks: **CIDR** (RFC 1519, 1993) to slow allocation burn rate; **NAT** (RFC 1631, 1994) to share addresses; and **IPng** — IP Next Generation — to design a successor. [SlideShare](https://www.slideshare.net/slideshow/what-happened-to-ipv6-presented-by-geoff-huston/273318949)[Wikipedia](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)

### IPng: the candidates and the people

The IPng Area was formed in 1993 with co-area-directors **Scott Bradner** (Harvard) and **Allison Mankin** (NRL). RFC 1550 (Bradner & Mankin, December 1993) called for white papers; the major submissions were: [O'Reilly](https://www.oreilly.com/library/view/ipv6-essentials/0596001258/ch01.html)

- **TUBA** — *TCP and UDP with Bigger Addresses* (RFC 1347, 1992; white paper RFC 1561). Authored by Ross Callon, with Peter Ford and Mark Knopper. Reused ISO CLNP's 20-byte NSAP addresses and IS-IS routing. Strength: existing standard with much larger space. Weakness: required everyone to migrate to OSI semantics — politically a non-starter.
- **PIP** — Paul Francis's *Pip Near-term Architecture* (RFC 1621/1622). A radically different architecture using variable-length, hierarchical, source-routed addresses. Eventually merged into SIPP.
- **SIP / SIPP** — *Simple IP* / *Simple Internet Protocol Plus* (Steve Deering, originally with 64-bit addresses; later 128-bit "SIPP-16"; RFC 1710). Closest to IPv4 in spirit.
- **CATNIP** — *Common Architecture for the Internet* (Robert Ullmann, RFC 1707). Tried to unify IPv4, OSI, and IPX in one protocol. Judged "too incomplete" by the directorate.

The decisive moment was the **"BigTen" retreat near Chicago, 19–20 May 1994**, where the IPng Directorate met with the working-group chairs. After a two-day review SIPP and TUBA were judged workable but flawed; CATNIP was eliminated. Deering and Francis (SIPP co-chairs) then revised SIPP to incorporate TUBA-style autoconfiguration and a CIDR-style addressing structure. At the **Toronto IETF, 25 July 1994**, IPng was selected: SIPP-128 became the basis of IPv6, with Deering and Ross Callon co-chairing the new IPng Working Group and **Robert Hinden** as document editor. (RFC 1752, January 1995.) Why "version 6" — version 5 had been claimed by the experimental ST/ST-II Stream Protocol; SIP/SIPP took 6, leaving 7/8/9 to TUBA/PIP/CATNIP variants. [IETF + 4](https://tools.ietf.org/html/rfc1752)

### RFC version history

- **RFC 1883** (December 1995, Deering & Hinden) — the first IPv6 specification. Proposed Standard.
- **RFC 2460** (December 1998) — replaced RFC 1883; refined the header, extension-header rules, and fragmentation. It remained a *Draft Standard* for nearly two decades.
- **RFC 8200 / STD 86** (July 2017) — promoted IPv6 to *Internet Standard* (the highest IETF maturity level), folding in updates from RFC 5095 (deprecation of Routing Header Type 0, after Biondi/Ebalard's 2007 amplification attack), RFC 5722 (overlapping fragments), RFC 5871, RFC 6437 (Flow Label), RFC 6564, RFC 6935 (zero UDP checksum for tunnels), RFC 6946 (atomic fragments), RFC 7045 (extension-header transit), and RFC 7112 (oversized header chains). The most contentious change clarified that intermediate nodes MUST NOT process or insert extension headers other than Hop-by-Hop — and even Hop-by-Hop processing was relaxed.

### Politics, controversies, adoption

The original timeline assumed dual-stack would carry the network through transition by ~2005. Two forces broke that plan: NAT made IPv4 livable far longer than expected, and IPv6's "no new features" design gave operators little to buy. By 2011 the central IANA pool was exhausted (3 February 2011). RIR exhaustion followed: **APNIC 15 April 2011**, RIPE NCC 14 September 2012, LACNIC 10 June 2014, ARIN 24 September 2015, AFRINIC 21 April 2017. Each entered "last /8" rationing — in APNIC's case, members were limited to a single /22 (1,024 addresses). [Wikipedia](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)[APNIC Blog](https://blog.apnic.net/2015/08/07/ipv4-address-exhaustion-in-apnic/)

**World IPv6 Day** (8 June 2011) and the permanent **World IPv6 Launch** (6 June 2012) coordinated by the Internet Society pushed Google, Facebook, Yahoo, Akamai, Limelight, Comcast, AT&T, Time Warner Cable, and many CPE vendors over the line. [Wikipedia](https://en.wikipedia.org/wiki/World_IPv6_Day_and_World_IPv6_Launch_Day)

### What's changed in the last 24 months (2024–2026)

- **March 28, 2026:** Google's IPv6 dashboard recorded **50.1%** for the first time — IPv6 briefly surpassed IPv4 in Google's measured user base. This has not been *sustained* daily; values bounce 45–50% with weekend peaks.
- **APNIC Labs (April 2026)**, Cloudflare Radar, and other measurement bodies still place global IPv6 capability in the **40–43%** range — the 50% number is a Google-specific snapshot.
- **AWS public IPv4 address charge — 1 February 2024:** $0.005/IP/hour (≈$3.65/month) on every public IPv4 address, attached or not. This is the first hard *financial* push toward IPv6 from a hyperscaler at scale.
- **APNIC was allocated a new /12 (`2410::/12`) in 2024**, giving it a contiguous `2400::/11` to delegate, signalling speeding IPv6 demand in the Asia-Pacific region.
- **RFC 9637 (August 2024)** — added `3fff::/20` as a second IPv6 documentation prefix on top of the long-standing `2001:db8::/32`, large enough to model multi-AS networks. [IETF](https://datatracker.ietf.org/doc/rfc9637/)[The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24646.html)
- **RFC 9673 (October 2024)** — relaxed the Hop-by-Hop Options handling rules of RFC 8200, making HBH options actually deployable on real router silicon. [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24895.html)[Hjp](http://www.hjp.at/doc/rfc/rfc9673.html)
- **RFC 9602 (2024)** — reserved `5f00::/16` for SRv6 SIDs. [PTS](https://www.pts.se/contentassets/d0d9a3751ed547f8a29f46adde5c0542/20250205-se-ipv6-council---ietf-ipv6-news.pdf)
- **SoftBank (December 2025)** — announced what it described as the world's first commercial 5G deployment using **SRv6 MUP** (Mobile User Plane).
- **Microsoft Azure Fairwater** — at OCP Global Summit 2025, Microsoft presented SRv6 as the fabric for what it described as the largest AI back-end network in the world.
- **RFC 7217 stable-privacy IIDs** finally implemented in Windows 11 (verified December 2022) — meaning EUI-64 MAC-derived addresses are no longer the default on any major OS. [RIPE NCC](https://www.ripe.net/ripe/mail/archives/ipv6-wg/2022-December/003831.html)
- **AFRINIC governance crisis 2024–2025** has slowed African IPv4 transfer markets and indirectly increased pressure for IPv6 in the region.

Geoff Huston (APNIC) projected in October 2024 that on linear extrapolation IPv6 transition completes around **late 2045** — and noted the more disturbing possibility that v4/v6 coexistence is now a steady state rather than a transition. [Potaroo](https://www.potaroo.net/ispcol/2024-10/ipv6-transition.html)[Wikipedia](https://en.wikipedia.org/wiki/IPv6_deployment)

---

## 3. How it actually works

### Fixed IPv6 header (40 bytes, RFC 8200 §3)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version| Traffic Class |           Flow Label                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Payload Length        |  Next Header  |   Hop Limit   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                                                               |
+                         Source Address                        +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                                                               |
+                      Destination Address                      +
|                                                               |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| Field | Width | Purpose |
|---|---|---|
| Version | 4 bits | Always `0110` (6) |
| Traffic Class | 8 bits | DiffServ DSCP (6 bits) + ECN (2 bits), per RFC 2474 / RFC 3168 |
| Flow Label | 20 bits | Per-flow identifier; RFC 6437 redefined it as a flow hash for ECMP without parsing L4 |
| Payload Length | 16 bits | Bytes after the 40-byte header (extension headers + payload). Max 65,535; >65,535 needs the Jumbo Payload hop-by-hop option (RFC 2675) |
| Next Header | 8 bits | Same numbering as IPv4 Protocol; identifies the *next* header [Infoblox](https://www.infoblox.com/blog/ipv6-coe/creating-a-new-ipv6-extension-header/) (TCP=6, UDP=17, ICMPv6=58, or an extension header value) |
| Hop Limit | 8 bits | Decrements per router; 0 → ICMPv6 Time Exceeded |
| Source / Destination | 128 bits each | RFC 4291 addressing |

A literal first 8 bytes of a "vanilla" TCP-over-IPv6 packet with traffic class 0, flow label 0, payload 1440, next header TCP, hop limit 64 reads:

```
60 00 00 00  05 a0  06  40
```

(`6` = Version, `0 00 00 00` = TC+Flow, `05a0` = 1440, `06` = TCP, `40` = 64.)

### Extension headers (RFC 8200 §4)

Recommended order if multiple are present:

1. Hop-by-Hop Options (must be first; processed by every router on path; relaxed by RFC 9673) [Hjp](http://www.hjp.at/doc/rfc/rfc9673.html)[IETF](https://www.ietf.org/rfc/rfc8200.html)
2. Destination Options (when followed by Routing header — for waypoints)
3. Routing (Type 0 *deprecated* by RFC 5095; Segment Routing Header is Type 4, RFC 8754/RFC 8986)
4. Fragment (only the source fragments — no router fragmentation in IPv6)
5. Authentication Header (AH, RFC 4302) — integrity
6. Encapsulating Security Payload (ESP, RFC 4303) — confidentiality + integrity
7. Destination Options (final-destination)
8. Upper-layer header (TCP, UDP, ICMPv6, etc.)

Extension headers in the open Internet are widely dropped by middleboxes — RFC 9098 documents drop rates from Czyz et al. and others showing 25–55% loss for HBH-bearing packets traversing arbitrary networks. [RFC Editor](https://www.rfc-editor.org/rfc/rfc9098.html)

### Address types, scopes, formats (RFC 4291, RFC 5952)

- **Unicast** — one-to-one.
- **Multicast** (`ff00::/8`) — one-to-many. Important groups: `ff02::1` all-nodes link-local, `ff02::2` all-routers link-local, `ff02::1:ffXX:XXXX` solicited-node (last 24 bits of target).
- **Anycast** — same address advertised from multiple locations; the routing system chooses "nearest." Crucial for DNS root and CDN.
- **No broadcast** — IPv6 abolished it.

Scopes:

- Link-local `fe80::/10` — required on every IPv6 interface; never routed off-link; used for NDP and as next-hop in routing.
- Unique Local `fc00::/7` (RFC 4193, in practice `fd00::/8`) — private, organization-local.
- Global Unicast `2000::/3` — the routable Internet space (`2001::/16`, `2400::/12` APNIC, `2600::/12` ARIN, etc.).

Special addresses: `::` unspecified (used as source during DAD); `::1` loopback; `2001:db8::/32` and `3fff::/20` documentation; IPv4-mapped `::ffff:0:0/96` for socket APIs.

**RFC 5952 canonical text rules:** lowercase hex; suppress all leading zeros; the `::` must compress the *longest* run of zero 16-bit groups (and only one run); when two runs are equal, compress the leftmost. `2001:0DB8::0001` is wrong; `2001:db8::1` is correct. [Hjp](https://www.hjp.at/doc/rfc/rfc5952.html)[Hjp](https://www.hjp.at/doc/rfc/rfc5952.html)

### SLAAC + NDP — the full process (RFC 4861, RFC 4862, RFC 8981, RFC 7217)

When a host comes up on an IPv6 link:

1. **Form a tentative link-local.** Combine `fe80::/10` with a 64-bit Interface ID. Modern stacks default to RFC 7217 stable-privacy IIDs; legacy uses modified-EUI-64 (flip bit 7 of MAC, insert `fffe` in the middle). [OneUptime](https://oneuptime.com/blog/post/2026-03-20-slaac-overview/view)
2. **Duplicate Address Detection (DAD).** Join the solicited-node multicast `ff02::1:ffXX:XXXX` for the tentative address. Send a **Neighbor Solicitation (NS, ICMPv6 type 135)** with source `::` and target = tentative address. If no NA arrives within RetransTimer × DupAddrDetectTransmits, the address is unique. [NetworkAcademy.IO](https://www.networkacademy.io/ccna/ipv6/stateless-address-autoconfiguration-slaac)
3. **Router Solicitation (RS, ICMPv6 type 133)** to `ff02::2` (all routers). [Cloudswit](https://cloudswit.ch/blogs/what-is-slaac-ipv6-the-ultimate-beginners-guide/)[OneUptime](https://oneuptime.com/blog/post/2026-03-20-slaac-overview/view)
4. **Router Advertisement (RA, ICMPv6 type 134)** comes back from the router (also sent unsolicited every MaxRtrAdvInterval). RA carries: prefix(es) (PIO option), MTU, default-router lifetime, and the **M (Managed) and O (Other-config) flags** that drive the SLAAC-vs-DHCPv6 decision: `M=0,O=0` → SLAAC only; `M=0,O=1` → SLAAC + DHCPv6 for DNS etc.; `M=1` → DHCPv6 for the address itself. [Cloudswit](https://cloudswit.ch/blogs/what-is-slaac-ipv6-the-ultimate-beginners-guide/)
5. **Construct global address(es).** Combine each PIO prefix with an IID. Modern stacks generate one stable address (RFC 7217) and one or more rotating temporary addresses (RFC 8981, default 1-day preferred / 2-day valid lifetimes). [OneUptime](https://oneuptime.com/blog/post/2026-03-20-temporary-vs-stable-ipv6-addresses/view)
6. **DAD on each new address.**
7. **Address resolution thereafter:** to send to a neighbor whose link-layer address you don't know, send NS to its solicited-node multicast; the target replies with **Neighbor Advertisement (NA, ICMPv6 type 136)** containing its MAC.
8. **Redirect (ICMPv6 type 137)** is the analog of ICMP Redirect — a router tells you a better next hop on-link.

#### Mermaid sequence diagram — host joining an IPv6 link

```
sequenceDiagram
    participant H as Host (joining)
    participant L as Link (multicast)
    participant R as Router
    Note over H: Generate tentative link-local fe80::IID
    H->>L: NS (DAD), src=::, dst=ff02::1:ffXX:XXXX
    Note over H: Wait RetransTimer; no answer => unique
    H->>L: RS, src=fe80::IID, dst=ff02::2 (all-routers)
    R->>L: RA, src=fe80::R, dst=ff02::1 (all-nodes), prefix=2001:db8:1::/64, M=0 O=1
    Note over H: Form 2001:db8:1::IID (stable privacy, RFC 7217)
    Note over H: Form 2001:db8:1::TempIID (RFC 8981)
    H->>L: NS (DAD) for each new global address
    Note over H: After DAD, addresses become preferred
    H->>R: NS for default-gateway link-layer address
    R->>H: NA with R's MAC
    Note over H: ICMPv6 echo, AAAA query, etc.
    H->>L: MLDv2 Report joining ff02::1:ff... groups (RFC 3810)
    Note over H: Optional: DHCPv6 Information-Request if O=1\n         or DHCPv6 Solicit if M=1
```

### Path MTU Discovery (RFC 8201)

Because routers cannot fragment IPv6, the source must learn the smallest MTU on the path. It sends large packets; any router whose next-hop link is too small drops the packet and replies with **ICMPv6 Packet Too Big (type 2)** containing the next-hop MTU. The source caches the PMTU per destination. If ICMPv6 PTB messages are filtered (the classic "PMTUD black hole"), TCP stalls — the famous "I disabled IPv6 to fix it" pathology. RFC 8899 PLPMTUD lets transports probe without ICMPv6.

### ICMPv6 message-type cheat sheet (RFC 4443)

Errors (1–127): 1 Destination Unreachable, 2 Packet Too Big, 3 Time Exceeded, 4 Parameter Problem.
Informational (128–255): 128/129 Echo Request/Reply, 130–132 MLD Query/Report/Done, 133–137 RS/RA/NS/NA/Redirect, 138 Router Renumbering, 143 MLDv2 Report, 148/149 SEND CPS/CPA, 151–155 MRD, 157/158 DAR/DAC.

---

## 4. Deep connections to other protocols

- **IPv4 — coexistence and translation.** Dual-stack runs both protocols on the same interface (RFC 4213). Tunneling: 6to4 (`2002::/16`, RFC 3056, deprecated due to relay asymmetry), 6rd (RFC 5969, ISP-anchored 6to4), Teredo (RFC 4380, IPv6-over-UDP-over-IPv4-NAT, mostly defunct), ISATAP (RFC 5214, intra-site). Translation: NAT64 (RFC 6146), DNS64 (RFC 6147), 464XLAT (RFC 6877 — Mawatari/Kawashima/Byrne, the path T-Mobile US used), MAP-T (RFC 7599), MAP-E (RFC 7597). MAP variants are stateless and let ISPs scale CGNAT-style functionality without per-user state. [RFC Editor](https://www.rfc-editor.org/rfc/rfc6877.html)
- **TCP / UDP.** No on-the-wire change; the **pseudo-header** used for the checksum is different (128-bit src/dst plus 32-bit upper-layer length and 24-bit zero + 8-bit next-header). Per RFC 6935, UDP-encapsulating tunnels may use a zero UDP checksum.
- **Ethernet (IEEE 802.3).** EtherType `0x86DD` carries IPv6. Multicast MAC mapping is `33:33:xx:xx:xx:xx` where the last 32 bits are the low 32 bits of the IPv6 multicast address (RFC 2464). 802.11 Wi-Fi looks identical from L3.
- **DNS.** **AAAA** records (RFC 3596) carry 128-bit addresses. Reverse zone is **`ip6.arpa`** with each nibble reversed (so `2001:db8::1` → `1.0.0.0.…b.d.0.1.0.0.2.ip6.arpa`). Address selection is RFC 6724; **Happy Eyeballs v2 (RFC 8305)** races A and AAAA queries and connection attempts with a 250 ms IPv6 head start. Curl in 2025 added a parallel-fan-out tweak. A *v3* draft is in progress. [OneUptime](https://oneuptime.com/blog/post/2026-03-20-happy-eyeballs-algorithm-rfc8305/view)
- **DHCPv6 (RFC 8415).** Distinct from DHCPv4. Drives via M/O flags in RAs. Notable extensions: **Prefix Delegation (DHCPv6-PD, RFC 8415)** — a CPE router asks the ISP for an entire prefix (typically /56 or /48) it can sub-delegate. Android still does not implement DHCPv6 (Lorenzo Colitti's long-standing position), forcing SLAAC-only on a lot of mobile networks. [IETF](https://datatracker.ietf.org/doc/draft-ietf-v6ops-cpe-lan-pd/05/)[Makikiweb](http://www.makikiweb.com/ipv6/slaac_and_rfc8981.html)
- **MLD (Multicast Listener Discovery).** MLDv1 (RFC 2710) and MLDv2 (RFC 3810) are the IPv6 equivalent of IGMP, carried inside ICMPv6.
- **Routing protocols.** **MP-BGP (RFC 4760)** carries IPv6 prefixes via AFI=2/SAFI=1. **OSPFv3 (RFC 5340)** is a redesigned OSPF for IPv6 (instances per address family). **IS-IS** carries IPv6 via TLVs (RFC 5308). **6PE / 6VPE** (RFC 4798 / RFC 4659) tunnel IPv6 over an MPLS LSP that itself signals via IPv4.
- **MPLS / SRv6.** **Segment Routing over IPv6** (RFC 8754 SRH; RFC 8986 network programming; RFC 9352 IS-IS extensions; RFC 9252 BGP services; RFC 9259 OAM; RFC 9800 compressed segment lists; RFC 9602 reserves `5f00::/16` for SIDs) replaces MPLS labels with 128-bit IPv6 SIDs that encode both location and function. SoftBank (Dec 2025) announced the world's first commercial 5G SRv6 MUP service. Microsoft Azure Fairwater (OCP 2025) uses SRv6 in its AI back-end fabric. [Cisco + 2](https://www.cisco.com/c/en/us/support/docs/ip/ipv6-routing/220485-configure-design-and-migration-best-prac.html)
- **IPSec.** No longer mandatory-to-implement (RFC 6434, 2011) — though the AH/ESP machinery is the same as IPv4.
- **QUIC (RFC 9000) / HTTP/3 (RFC 9114).** Designed assuming IPv6 is normal; HE in browsers is what makes them feel fast on dual-stack.
- **mDNS / Zeroconf (RFC 6762).** Uses `ff02::fb` link-local multicast for `_services._dns-sd._udp.local.` discovery.
- **CGNAT.** The cost in state, hot logs, and lawful-intercept that drove T-Mobile, Comcast Mobile, Reliance Jio (>237 M IPv6 users by 2018), and most LTE/5G carriers to IPv6-only. [Internet Society](https://www.internetsociety.org/news/press-releases/2018/six-years-since-world-launch-ipv6-now-dominant-internet-protocol-for-many/)

---

## 5. Real-world deployment

### Stacks

- **Linux:** dual-stack since 2.1.x; current kernels (6.x, 2024–2026) implement RFC 7217 (`addr_gen_mode=2` or `=3` with `stable_secret`), RFC 8981 (`use_tempaddr=2`), MPTCP, SRv6 (`net.ipv6.seg6_*`), and as of 2024 Fedora/NetworkManager auto-enable CLAT for IPv6-mostly networks. [The Fedora Project](https://fedoraproject.org/wiki/Changes/IPv6-Mostly_Support_In_NetworkManager)
- **FreeBSD / NetBSD / OpenBSD / macOS / iOS:** all carry KAME-derived code. The **KAME Project** (1998–March 2006) was a joint effort of Fujitsu, Hitachi, IIJ, NEC, Toshiba, Yokogawa, Keio U. and U. Tokyo, a sub-project of WIDE, to produce a free reference IPv6/IPsec stack. Apple's IPv6 code path through Darwin is descended from KAME; the famous "dancing kame" turtle still appears at kame.net for IPv6-reachable visitors. [HandWiki](https://handwiki.org/wiki/KAME_project)
- **Microsoft Windows:** native dual-stack since Vista (2006). Windows 11 (December 2022 onward) finally implements RFC 7217 stable-privacy addresses; Windows Server 2025 supports DHCPv4 option 108 issuance for IPv6-mostly networks; Windows 11 has rolled out 464XLAT CLAT.
- **Android:** SLAAC-only (no DHCPv6); supports option 108 since Android 12; CLAT integrated. [Infoblox](https://www.infoblox.com/blog/ipv6-coe/dhcp-and-dhcpv6-options-differences/)
- **Cisco IOS / IOS-XR / NX-OS, Juniper Junos:** full SRv6 µSID support in Junos and IOS-XR 2024–2026 releases.

### Operators and hyperscalers

- **T-Mobile US** moved its mobile core to IPv6-only with 464XLAT (Cameron Byrne, NANOG 61, 2014; production scale on millions of phones). [Internet Society](https://www.internetsociety.org/deploy360/2014/case-study-t-mobile-us-goes-ipv6-only-using-464xlat/)
- **Reliance Jio** (India) launched IPv6-first in 2016; >237 M IPv6 users by 2017 — the single biggest reason India's IPv6 share runs 67–80% in 2025–2026. [Internet Society](https://www.internetsociety.org/news/press-releases/2018/six-years-since-world-launch-ipv6-now-dominant-internet-protocol-for-many/)
- **Comcast** has been a leading dual-stack operator since the 2012 Launch.
- **Meta** (Facebook): >99% of internal datacenter traffic is IPv6; entire new clusters are IPv6-only and serve IPv4 via L4/L7 load balancers (Saab/Hollmann presentations 2014–2017). Meta said internal IPv6 is **10–15% faster** than IPv4 (and on one carrier mobile measurement, 40% faster), driven mostly by NAT removal and caching effects. [UptimeRobot + 3](https://uptimerobot.com/knowledge-hub/devops/ipv4-ipv6/)
- **Google:** crossed 50% on March 28, 2026 (peak); routinely 45–48% otherwise.
- **AWS:** dual-stack ubiquitous, IPv6-only VPC option since 2021, public IPv4 *charge* since 1 February 2024 ($0.005/IP/hr).
- **Azure:** SRv6 in Fairwater AI back-ends (OCP 2025).
- **Cloudflare:** 98% of customer sites have IPv6 enabled; 2024 Year-in-Review measured 28.5% of dual-stacked requests over IPv6; 2025 Year-in-Review 30%+; 2024 IPv6-from-DNS analysis showed 13.2% server-side IPv6 (60.8% across the top 100 domains). [Cloudflare + 2](https://blog.cloudflare.com/radar-2024-year-in-review/)

### Country-level adoption (2025–2026 data)

| Source | Metric | Value |
|---|---|---|
| Google (March 28, 2026) | User traffic over IPv6 | 50.1% (peak), 45–48% typical |
| APNIC Labs (Apr 2026) | IPv6-capable users | ~43% global |
| Cloudflare Radar (2024) | Dual-stack requests over v6 | 28.5% |
| Cloudflare Radar (2025) | Dual-stack requests over v6 | ~30% |
| Google (Feb 2026) | France | 86% |
| APNIC | India | 67–80% |
| Google (Jun 2023) | Germany | 68% [Wikipedia](https://en.wikipedia.org/wiki/IPv6_deployment) |
| China official (Sep 2025) | IPv6 users | 865 M (77% of users); 34% of traffic |
| US carriers (avg 2026) | Mobile IPv6 | ~87% |

### Performance

Akamai measurements show >50% of dual-stacked hostnames have IPv6 throughput at least 50% better than IPv4, and 90% see ≥10% better. Cloudflare reports IPv6-side connections were 27% faster to load on average. Some academic studies (IEEE Xplore 2022) find +13 ms latency penalty on IPv6 in *certain* dual-stack paths — a reminder that the protocol isn't intrinsically faster; *less NAT and better-engineered IPv6 paths* are. [UptimeRobot + 2](https://uptimerobot.com/knowledge-hub/devops/ipv4-ipv6/)

### Routing-table footprint

Global IPv6 BGP table is ~210k prefixes (mid-2026); IPv4 ~970k. CIDR Report and Geoff Huston's BGP reports update daily.

---

## 6. Failure modes and famous incidents

- **CVE-2020-16898 — "Bad Neighbor"** (Microsoft, 13 October 2020). Windows `tcpip.sys` mishandled an ICMPv6 Router Advertisement with an even-length **RDNSS option** (RFC 8106). Buffer overflow → BSoD reliably; remote-code-execution claimed wormable. CVSS 8.8. Mitigation: patch, or `netsh int ipv6 set int * rabaseddnsconfig=disable`. Lesson: NDP is parsed by the kernel before any user-space firewall sees it.
- **CVE-2024-38063** (Microsoft, August 2024). Another `tcpip.sys` IPv6 bug — integer underflow in fragment reassembly (`Ipv6pReceiveFragment` / `Ipv6pReassemblyTimeout`). 16-bit overflow allocates 48 bytes; `memmove` copies up to 65,488 from attacker-controlled fragment payload. CVSS 9.8, "exploitable from anywhere on the link," patch released 13 August 2024. MalwareTech reverse-engineered it publicly within days. [GitHub + 5](https://github.com/AdminPentester/CVE-2024-38063-)
- **CVE-2023-6200** (Linux ICMPv6 race condition, fixed 2024). Race between `icmpv6_init` registration and `fib6_run_gc`. Modest scope but illustrates that even mature stacks still find IPv6 bugs. [Blog](https://u1f383.github.io/linux/2024/12/04/linux-kernel-icmpv6-and-cve-2023-6200.html)
- **Facebook outage — 4 October 2021.** Not strictly an IPv6 incident, but instructive: a backbone-capacity audit command, intended to probe paths, executed across all backbone routers. A bug in the audit tool failed to stop it. Backbone disconnected → DNS authoritatives auto-withdrew their BGP advertisements (a designed-in safety) → both v4 and v6 prefixes vanished simultaneously. Six-hour outage. Cloudflare and ThousandEyes published detailed timelines. Lesson for IPv6: parallel withdrawal of v4 and v6 can mean dual-stack is not redundancy — the **same** control plane took both down. [FB + 2](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- **Type 0 Routing Header amplification (2007).** Biondi & Ebalard demonstrated traffic-amplification attacks bouncing packets between two IPv6 routers via RH0; led to deprecation in RFC 5095.
- **Comcast 2017 IPv6 routing incident** and other transit "v6-only flaps" — most ISP outage post-mortems in the 2010s show v6 reachability problems mask easily because of Happy Eyeballs.
- **Apple iCloud Private Relay rollout (October 2021 onward).** First Apple service designed end-to-end on QUIC + IPv6-preferring egress. Egress prefers IPv6 when AAAA exists; Wikimedia community estimated 4–5% of editors would be blocked when full-rolled out (Apple iCloud Private Relay page on Meta-Wiki). Pure IPv4-only enterprise networks frequently see Private Relay break; Apple's documented response is per-network opt-out. [Cloudflare + 2](https://blog.cloudflare.com/icloud-private-relay/)
- **Common operational pitfalls (sources: RFC 9099, RFC 9098):**
  - **PMTUD black hole** when ICMPv6 PTB is filtered (the most common way "IPv6 is broken" actually means "your firewall is broken").
    - **Rogue RA / SLAAC attack** — any host can become "the router." Mitigation: **RA Guard** (RFC 6105 + RFC 7113) on access switches, plus ND inspection, plus DHCPv6 Shield (RFC 7610). RA Guard evasion via fragmented RAs (Gont) is fixed by RFC 6980. [Infoblox](https://blogs.infoblox.com/ipv6-coe/why-you-must-use-icmpv6-router-advertisements-ras/)[Infoblox](https://blogs.infoblox.com/ipv6-coe/why-you-must-use-icmpv6-router-advertisements-ras/)
    - **NDP cache exhaustion / NS flood**: with /64 subnets a remote attacker can scan addresses, forcing the router to create neighbor cache entries. Mitigation: rate-limit NS; use /127 on point-to-point; minimize on-link /64 exposure.
    - **Happy Eyeballs masking IPv6 brokenness** — users feel nothing but the operator sees latency tail.
    - **Broken IPv6 on home routers** — old CPE without prefix-delegation.
    - **ULA confusion** — `fc00::/7` is not magic privacy; without proper source-address selection rules (RFC 6724) ULAs leak.
    - **DHCPv6 vs SLAAC mismatch** — M/O flags misconfigured; Android's DHCPv6 absence is the #1 enterprise gotcha.

---

## 7. Fun facts and anecdotes (podcast-ready)

- **"It's my fault."** Vint Cerf has publicly blamed himself, repeatedly, for the 32-bit IPv4 address space — most quotably at Linux.conf.au 2011: *"You all know that we are almost out of IPv4 address space. I am a little embarrassed about that because I was the guy who decided that 32-bit was enough for the Internet experiment. My only defense is that that choice was made in 1977, and I thought it was an experiment."* He has also said (2016 Heidelberg Laureate Forum): *"If I could have justified it, putting in a 128-bit address space would have been nice so we wouldn't have to go through this painful, 20-year process of going from IPv4 to IPv6."* [Zorinaq](http://blog.zorinaq.com/vint-cerfs-internet-experiment-quote/)[CIO](https://www.cio.com/article/3123438/vint-cerfs-dream-do-over-2-ways-hed-make-the-internet-different.html)
- **Why "v6" not "v5":** Version 5 was claimed by the Internet Stream Protocol (ST/ST-II), an experimental real-time transport protocol designed at MIT/BBN in the 1970s.
- **Why 128 bits:** large enough to allow **EUI-64** embedding of any 48-bit MAC plus a 16-bit subnet identifier — and then keep 64 bits for hierarchical aggregation. The "/64-per-link" rule is fundamentally an artifact of that decision.
- **The 6bone (`3ffe::/16`).** Started March 1996 at the IETF outside the official process; first tunnels linked G6 (France), UNI-C (Denmark), and WIDE (Japan). At its 2003 peak, >150 prefixes routed at >1,000 sites in 50+ countries. Phased out per RFC 3701; routing ceased 6 June 2006 — date chosen so it could be celebrated as the first global "IPv6 Day". [HandWiki + 5](https://handwiki.org/wiki/6bone)
- **World IPv6 Day (8 June 2011)** and **World IPv6 Launch (6 June 2012)** — coordinated by the Internet Society. The 2012 launch had 50+ networks, 2,500+ websites, and committed router vendors permanently turning IPv6 *on*. [Bill Petro](https://billpetro.com/history-of-world-ipv6-day-june-6-2011/)
- **RFC 8200 (July 2017)** — IPv6 finally became an Internet Standard (STD 86), nineteen years after RFC 2460.
- **RFC 1149 / RFC 6214 — "IP over Avian Carriers."** RFC 6214 explicitly extends 1149 to IPv6: *"As IPv6 has a significantly larger minimum link MTU, larger and more mature pigeons are required to avoid undue packet loss. A minimum age of 1 year is suggested."* Yes, this is published. [Wikipedia](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)
- **RFC 5514 — "IPv6 over Social Networks"** (Eric Vyncke, Cisco, 1 April 2009). Each Facebook user becomes a router with a loopback; friend edges are point-to-point links. A working Facebook prototype was actually built. Its example prefix `2001:db8:face:b00c::/64` lives on in countless lab configs. [RFC Editor + 2](https://www.rfc-editor.org/rfc/rfc5514.html)
- **`face:b00c`, `dead:beef`, `c0fe:cafe`, `bad:1dea`** — the IPv6 hex-as-words humor was built into the protocol from the start because four-bit nibbles map to {0–9, a–f}. Linux kernel commits in 2024 removed `face:b00c` from a few internal traces because it was being mistaken for a real prefix in copy-pasted configs.
- **The IPv6 logo.** The IPv6 Forum's "Phase-1" Silver / "Phase-2" Gold "IPv6 Ready" logos launched September 2003; the Silver phase concluded in November 2011. The dancing turtle on kame.net is the unofficial mascot. [Ipv6ready](https://www.ipv6ready.org/about.html)
- **An unofficial IETF draft (early 2025) proposed allocating a 5-nonillion-address block to amateur radio operators** — captured by *The Register* alongside Starlink's "150 sextillion IPv6 addresses" announcement. Both real, both quotable.

---

## 8. Practical wisdom

### Linux sysctl knobs you'll actually touch

```
net.ipv6.conf.all.forwarding = 1            # enable routing
net.ipv6.conf.all.accept_ra = 0|1|2         # 2 = accept RA even when forwarding
net.ipv6.conf.all.use_tempaddr = 2          # RFC 8981 prefer temp
net.ipv6.conf.all.addr_gen_mode = 2         # RFC 7217 stable privacy (or 3 + stable_secret)
net.ipv6.conf.all.accept_redirects = 0      # disable in routers
net.ipv6.conf.all.accept_source_route = 0   # always
net.ipv6.neigh.default.gc_thresh3 = 8192    # raise on busy routers (NDP cache)
net.ipv6.route.max_size = 4194304
net.ipv6.conf.all.disable_ipv6 = 0          # never set this to 1 to "fix" things
```

### What to monitor

- **NDP cache size and churn** (`ip -6 neigh | wc -l`, kernel `Ipv6pNeighborCacheSize` counters) — early warning of scan attacks on `/64`.
- **RA churn** — unexpected RAs from non-router MACs trip RA-Guard alarms.
- **AAAA query failure rate** at recursive resolvers.
- **PMTU cache size** (`ip -6 route show cache`) — unusually high indicates a black hole somewhere.
- **ICMPv6 PTB egress** — if your firewall is dropping it, PMTUD breaks.

### Debugging tools

- `tcpdump -ni eth0 'ip6 or proto ipv6-icmp'`; for SLAAC: `'icmp6 and ip6[40] >= 133 and ip6[40] <= 137'`.
- `ip -6 addr / ip -6 route / ip -6 neigh` (iproute2).
- `ndisc6`, `rdisc6`, `rltraceroute6`, `addr6` (the `ipv6toolkit` from Fernando Gont).
- `mtr -6`.
- Wireshark filter cookbook: `ipv6.dst == ff02::1`, `icmpv6.type == 134`, `ipv6.flow != 0`.
- `test-ipv6.com` for end-host sanity; `ripe.net` Atlas probes for path-from-anywhere; APNIC Labs measurement script for IPv6 capability.

### Common misconfigurations

- **Forgetting `net.ipv6.conf.all.forwarding=1`** on a router.
- **Blocking *all* ICMPv6.** Breaks NDP, MLD, PMTUD. RFC 4890 lists what you may safely filter; the short answer is "very little."
- **Disabling IPv6 to 'fix' issues.** Almost always masks a real bug while creating new ones (Windows is fragile if v6 is fully disabled; macOS Happy Eyeballs degrades).
- **Tuning PMTU:** set MTU to 1280 for tunnels; on dual-stack VPNs that mix v4 and v6, set the inside MTU explicitly.
- **DHCPv6 vs SLAAC.** Use **SLAAC** for client devices on most networks; **DHCPv6 (M=1)** when you need centralized address logging on a network without Android; **DHCPv6-PD** always between ISP and CPE; **IPv6-mostly (option 108 + PREF64 RA + 464XLAT CLAT)** is the modern enterprise default for new deployments (RFC 8925, RFC 8781, RFC 6877).

---

## 9. Learning resources (current as of 2026)

### RFCs (with section pointers)

- **RFC 8200 / STD 86** — Core IPv6 specification (July 2017). §3 header, §4 extension headers, §5 packet sizes, §8 upper-layer issues. [https://www.rfc-editor.org/rfc/rfc8200](https://www.rfc-editor.org/rfc/rfc8200)
- **RFC 4291** — Addressing architecture. Last updated 2006; some terminology revisited in RFC 8064 (2017) and RFC 9637 (2024).
- **RFC 4861** — Neighbor Discovery (2007). [https://www.rfc-editor.org/rfc/rfc4861](https://www.rfc-editor.org/rfc/rfc4861)
- **RFC 4862** — SLAAC (2007). [https://www.rfc-editor.org/rfc/rfc4862](https://www.rfc-editor.org/rfc/rfc4862)
- **RFC 4443** — ICMPv6 (2006).
- **RFC 5952** — Address text representation (2010, still current).
- **RFC 6724** — Default address selection (2012; revision in WG 2025).
- **RFC 7217** — Stable privacy IIDs (2014).
- **RFC 8064** — Default to RFC 7217 (2017).
- **RFC 8504** — IPv6 Node Requirements (2019).
- **RFC 8981** — Temporary addresses (2021, obsoletes 4941).
- **RFC 8305** — Happy Eyeballs v2 (2017); v3 in WG. [RFC Editor](https://www.rfc-editor.org/info/rfc8305)
- **RFC 9099** — Operational security for IPv6 (2021). [Packetizer](https://www.packetizer.com/rfc/rfc9099/)
- **RFC 8200 vs RFC 8504** — read both; 8504 is the "what an IPv6 host MUST do today" companion.
- **RFC 9637** (Aug 2024) — `3fff::/20` documentation prefix.
- **RFC 9673** (Oct 2024) — Hop-by-Hop processing relaxation, updates 8200. [Packetizer](https://www.packetizer.com/rfc/rfc9673/)
- **RFC 9602** (2024) — `5f00::/16` reserved for SRv6.
- **RFC 8986** (2021) — SRv6 Network Programming. [IETF](https://datatracker.ietf.org/doc/rfc8986/)
- **RFC 9252** (2022), **RFC 9259** (2022), **RFC 9352** (2023), **RFC 9800** (2024) — SRv6 services / OAM / IS-IS / compressed SIDs.
- **RFC 8925** (2020) — DHCPv4 Option 108 IPv6-only Preferred. **RFC 8781** — PREF64 in RAs. **RFC 6877** — 464XLAT. [Infoblox](https://www.infoblox.com/blog/ipv6-coe/dhcp-and-dhcpv6-options-differences/)[Infoblox](https://blogs.infoblox.com/ipv6-coe/configuring-infoblox-vnios-for-ipv6-only-networks/)

### Books (with edition years)

- **Silvia Hagen, *IPv6 Essentials*, 3rd ed., O'Reilly, 2014.** Still the canonical operational reference; the deep stack/protocol bits remain accurate. (No 4th edition published as of 2026.) [Amazon](https://www.amazon.com/IPv6-Essentials-Integrating-into-Network/dp/1449319211)
- **Kevin Fall & W. Richard Stevens, *TCP/IP Illustrated, Vol. 1*, 2nd ed., Addison-Wesley, 2011.** Chapters 5 (IPv6) and 8 (ICMPv6) remain the gold standard for byte-level walk-throughs.
- **Tom Coffeen, *IPv6 Address Planning*, O'Reilly, 2014.** Best practical guide to designing addressing plans; still in print.
- **Pete Loshin, *IPv6: Theory, Protocol, and Practice*, 2nd ed., 2003 (dated but readable history).**
- **Juniper "Day One" books**, including *Day One: Configuring SRv6 on Junos* (2024).

### Academic papers

- Czyz, Luckie, Allman, Beverly, Kreibich, Bailey: *Don't Forget to Lock the Back Door! A Characterization of IPv6 Network Security Policy* (NDSS 2016). DOI 10.14722/ndss.2016.23047.
- Saidi, Gasser, Smaragdakis: *One bad apple can spoil your IPv6 privacy.* SIGCOMM CCR 52:2, 2022.
- Sattler et al., *Lazy Eye Inspection: Capturing the State of Happy Eyeballs Implementations.* IMC 2025. [ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/RFC8305)
- Hsu, Feamster, Pearce, Li, *The Impact of IP Version on Household Internet Speed* (POMACS 9:3, 2025), DOI 10.1145/3771579. [ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/RFC8305)
- Geoff Huston's APNIC Labs reports and ISP Column (monthly): [https://labs.apnic.net](https://labs.apnic.net) and [https://www.potaroo.net/ispcol/](https://www.potaroo.net/ispcol/). *The IPv6 Transition* (Oct 2024) is the must-read 2024 piece.

### Engineering blog posts (2024–2026)

- **Cloudflare:** *Cloudflare Radar 2024 Year in Review* (Dec 2024) and *2025 Year in Review* (Dec 2025); *Using DNS to estimate the worldwide state of IPv6 adoption* (Dec 2023, still cited 2025–2026).
- **Meta engineering:** *IPv6: it's time to get on board* (2015); *Legacy support on IPv6-only infra* (2017); *More details about the October 4 outage* (2021).
- **APNIC Blog:** *Google hits 50% IPv6* (Apr 2026); *IPv6 deployment at APRICOT 2026* (Mar 2026); *Project IPv6-first* (Apr 2026); *The IPv6 transition* (Oct 2024); *Unveiling IPv6 scanning dynamics* (Feb 2026).
- **AWS:** *New – AWS Public IPv4 Address Charge + Public IP Insights* (Jul 2023; effective 1 Feb 2024).
- **RIPE Labs:** Ondrej Caletka, *Deploying IPv6-Mostly Access Networks* (2022, still cited).
- **Akamai/Akamai SOTI** measurements.
- **Segment-routing.net:** SRv6 conference and deployment news (2024–2026).

### Talks & podcasts

- **PacketPushers — IPv6 Buzz** (Ed Horley, Tom Coffeen, Scott Hogg). Episode IPB166 *Reflections and Projections for IPv6 in 2024 and 2025*; IPB160 *The Making of RFC 9637 - IPv6 Documentation Prefix* (2024). [Packet Pushers](https://packetpushers.net/podcasts/ipv6-buzz/ipb160-the-making-of-rfc-9637-ipv6-documentation-prefix/)
- **PacketPushers — Heavy Networking** IPv6-themed episodes (2024–2026).
- **APNIC PING podcast** — Geoff Huston monthly slot on IPv6 (Nov 2024 episode is essential). [APNIC Blog](https://blog.apnic.net/2024/11/14/podcast-the-ipv6-transition/)
- **NANOG 92 (Toronto, Oct 2024) — Geoff Huston, "IPv6 Transition: Why is this taking SO LONG?"**
- **APRICOT 2026 IPv6 Deployment session** (March 2026; CNNIC, Telstra, et al.).
- **Cisco Live 2025 — SRv6 case studies (Rijkswaterstaat, Nebius).** [Segment Routing](https://www.segment-routing.net/new-news)

### Free university courses

- **Stanford CS144 — Introduction to Computer Networks** (Nick McKeown, Philip Levis). Course materials and lab (build your own TCP) freely online. Most recent term 2024–25.
- **MIT 6.829 — Computer Networks** (Hari Balakrishnan). OCW notes.
- **Princeton COS 461.**
- **UC Berkeley CS168 — Introduction to the Internet** (Sylvia Ratnasamy, 2024 syllabus).

### Hands-on tools

- **test-ipv6.com** — browser-side end-to-end check.
- **Hurricane Electric `tunnelbroker.net`** — free 6in4 tunnels (still operating in 2026, though declining in relevance as native v6 spreads); the **HE.net IPv6 Certification ladder** ("Sage" being the top tier) is still the best gamified onramp.
- **Wireshark** — built-in dissectors for ICMPv6, NDP, MLD, SRH.
- **GNS3 / EVE-NG / Containerlab** — for multi-router IPv6 lab topologies (Containerlab is the modern choice in 2025–2026).
- **Scapy** for packet crafting; **THC-IPv6 toolkit** (Marc Heuse) and **ipv6toolkit** (Fernando Gont) for security testing.
- **APNIC Labs measurement system**, RIPE Atlas probes, Cloudflare Radar API.

---

## 10. Where things are heading (2025–2026 frontier)

### Active IETF working groups

- **6man** (IPv6 Maintenance) — RFC 9673, ongoing work on HBH options, address architecture cleanups.
- **v6ops** (IPv6 Operations) — RFC 9637 documentation, *IPv6-Mostly Networks* (`draft-ietf-v6ops-6mops`), *CPE LAN Prefix Delegation* (`draft-ietf-v6ops-cpe-lan-pd`), *IPv6 Network Deployment Monitoring* (Pang et al. 2026). [PTS + 2](https://www.pts.se/contentassets/d0d9a3751ed547f8a29f46adde5c0542/20250205-se-ipv6-council---ietf-ipv6-news.pdf)
- **softwire** — MAP-T/MAP-E, lightweight 4over6.
- **6lo** — IPv6 over constrained networks (Bluetooth LE, NFC, Power Line, G.9959).
- **lpwan** — Schc compression for LoRa/NB-IoT.
- **intarea** — Internet area, including ICMP extensions.
- **spring / srv6ops** — SRv6 standardization and operational practice.
- **lamps** — IPv6 in PKIX/cert SANs.

### Hot topics

- **SRv6 µSID** (Compressed SIDs, RFC 9800) — production at Bell Canada, Rijkswaterstaat, Nebius, Microsoft Fairwater, SoftBank 5G.
- **IPv6-only deployments and IPv6-mostly transition** — RFC 6586 (2012, lessons), RFC 7755 (MAP-T), RFC 7596/7597 (MAP-E), RFC 8683 (NAT64 considerations), RFC 8925 + RFC 8781 + RFC 6877 (the modern recipe), now propagating into Windows 11, NetworkManager, systemd.
- **NAT64/464XLAT operationalization** — Apple has shipped CLAT in macOS for years; Microsoft committed to a Windows 11 CLAT update (Infoblox documentation). [Infoblox](https://www.infoblox.com/blog/ipv6-coe/dhcp-and-dhcpv6-options-differences/)
- **IPv6 in 5G/6G** — 3GPP Release 8 mandated v6; SRv6 MUP (RFC drafts in progress) is now a commercial deployment as of December 2025. 6G discussions in 3GPP for 2026–2030 assume v6-native. [Wikipedia](https://en.wikipedia.org/wiki/IPv6_deployment)
- **ULA consolidation debates** — periodic 6man flashpoints over whether `fc00::/7` should be globally registered (the centralized half) or allowed as random.
- **"Plain IPv6" simplification trend** — push to deprecate Atomic Fragments (RFC 8021), formally retire 6to4 and Teredo, and reduce extension-header proliferation (RFC 7872 measured drop rates; ongoing "do not invent new extension headers" stance in 8200 §4.8).
- **IoT addressing** — Thread (IEEE 802.15.4 + 6LoWPAN, RFC 4944/RFC 6282), Matter assumes IPv6-only in the smart-home; lpwan SCHC for LPWAN.
- **APNIC pool / RIR markets** — IPv4 transfer prices stabilized at $30–$40 in 2024 (Geoff Huston) after a COVID-era spike; **APNIC received an additional /12 (`2410::/12`) from IANA** in 2024 making it a `2400::/11`. [Apnic](https://labs.apnic.net/index.php/2024/10/19/the-ipv6-transition/)
- **IPv4-as-a-service.** Cogent, Hurricane Electric, IPv4.global, and others now lease IPv4 ranges — turning IPv4 reachability into a commodity SKU on top of v6 transit.

### Recent (2024–2026) RFCs to know

| RFC | Date | Topic |
|---|---|---|
| 9602 | 2024 | `5f00::/16` SRv6 SID block |
| 9637 | Aug 2024 | `3fff::/20` documentation |
| 9673 | Oct 2024 | HBH Options processing (updates 8200) [Hjp](http://www.hjp.at/doc/rfc/rfc9673.html) |
| 9800 | 2024 | Compressed SRv6 segment lists |
| (drafts) | 2024–26 | `draft-ietf-v6ops-6mops` IPv6-Mostly; `draft-ietf-6man-rfc6724-update`; Happy Eyeballs v3 |

---

## 11. Hooks for the article, infographic, and podcast

### A 60-second narrated hook (written for the ear)

> Pick up your phone. There's a number on it — not the one you call. It's the address your phone uses to find anything on the internet. For decades, all of those numbers came from a pool of about four billion. Four billion sounded infinite in 1977, when one engineer at the Pentagon — Vint Cerf — set the size. It wasn't. The internet ate the pool around 2011, and we've been living on fumes, address-translation hacks, and rented IP addresses ever since. Quietly, in the background, a successor protocol named IPv6 — with three hundred and forty undecillion addresses, more than there are atoms in your body times the population of the Earth — has been creeping into the wires. On March 28th, 2026, for the first time in history, more than half of Google's traffic arrived over it. Half. After thirty-one years. This is the story of why a forty-byte header took longer than the entire Apollo program — and what, finally, is making it win.

### A striking statistic with source

**On 28 March 2026, IPv6 carried 50.10% of traffic to Google's services for the first time — 31 years after RFC 1883 specified it and 14 years after the World IPv6 Launch.** (Google IPv6 statistics; reported by APNIC Blog, *The Register*, TechSpot, all 17–28 April 2026.)

### A "pause and think" moment

The IPv6 working group selected 128-bit addresses partly to allow EUI-64 — embedding any 48-bit Ethernet MAC address into the bottom half of every IPv6 address. The consequence, which most engineers never notice: for almost two decades, every IPv6 device that used SLAAC was effectively *advertising its hardware MAC to every server on Earth that it talked to*. RFC 4941 (2007) tried to patch the privacy hole; RFC 7217 (2014) replaced the MAC with a per-network hash; RFC 8981 (2021) formalized rotating temporary addresses. **Windows 11 didn't implement RFC 7217 until December 2022 — meaning Microsoft customers were leaking MAC addresses in their IPv6 traffic for *fifteen years* after the privacy hole was widely known.** That is the gap between protocol design and protocol *deployment* — and it's one of the deepest reasons IPv6 is still only halfway adopted. [OneUptime](https://oneuptime.com/blog/post/2026-03-20-slaac-stable-privacy-addresses/view)[RIPE NCC](https://www.ripe.net/ripe/mail/archives/ipv6-wg/2022-December/003831.html)

### A failure-story arc — "Bad Neighbor" (CVE-2020-16898)

**Setup.** October 2020. Windows 10 has shipped IPv6 enabled by default for fourteen years. Inside the kernel, `tcpip.sys` parses every Router Advertisement that arrives on every interface — including the Recursive DNS Server (RDNSS) option from RFC 8106, which lets a router tell a host where to find DNS servers without DHCPv6. The option's *Length* field is supposed to be odd, in eight-byte units: 3 for one DNS address, 5 for two, and so on.

**Mistake.** Microsoft's parser took the length at face value. Send an *even* length — say, 4 — and the parser believes a second 16-byte DNS address starts in the middle of the structure. The last eight bytes get reinterpreted as the start of a *new* option, whose type field the attacker controls. With a fragmented packet to bypass NdisGetDataBuffer rules, attacker-controlled bytes overrun a 32-byte storage buffer in kernel pool memory.

**Consequence.** Any host on the same link, sending one crafted ICMPv6 packet, can blue-screen — and credibly, with work, achieve remote-kernel-code-execution on Windows 10, Windows Server 2019, and Server Core 1903/1909/2004. Microsoft assigns CVSS 8.8. Researchers call it potentially *wormable*. McAfee, Rapid7, SANS, Trustwave all publish detection signatures within days. The exploit primitive is *"send one router advertisement"* — the most ordinary packet on an IPv6 LAN.

**Resolution.** Microsoft patches on the 13 October 2020 Patch Tuesday. Operators who can't patch immediately disable the RDNSS option per-interface (`netsh int ipv6 set int * rabaseddnsconfig=disable`). The deeper lesson is repeated four years later, almost beat-for-beat: **CVE-2024-38063 (August 2024)**, an integer underflow in IPv6 fragment reassembly in the same `tcpip.sys`, scores 9.8. The takeaway for any podcast or article: NDP and IPv6 fragment processing live in the kernel and execute before any application-layer firewall sees a packet — and the surface is large enough that a quarter-century-old protocol still ships exploitable code paths today.

---

## 12. Citations

1. [https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
2. [https://stats.labs.apnic.net/ipv6/](https://stats.labs.apnic.net/ipv6/)
3. [https://en.wikipedia.org/wiki/IPv6_deployment](https://en.wikipedia.org/wiki/IPv6_deployment)
4. [https://www.theregister.com/2026/04/17/ipv6_50_percent_google/](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
5. [https://blog.apnic.net/2026/03/16/ipv6-deployment-at-apricot-2026-scanning-generative-ai-a-home-network-and-a-city/](https://blog.apnic.net/2026/03/16/ipv6-deployment-at-apricot-2026-scanning-generative-ai-a-home-network-and-a-city/)
6. [https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)
7. [https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)
8. [https://www.internetsociety.org/deploy360/ipv6/statistics/](https://www.internetsociety.org/deploy360/ipv6/statistics/)
9. [https://www.techspot.com/news/112108-google-briefly-reaches-ipv6-parity-half-users-connect.html](https://www.techspot.com/news/112108-google-briefly-reaches-ipv6-parity-half-users-connect.html)
10. [https://www.internetsociety.org/blog/2017/07/rfc-8200-ipv6-has-been-standardized/](https://www.internetsociety.org/blog/2017/07/rfc-8200-ipv6-has-been-standardized/)
11. [https://www.ietf.org/blog/ipv6-internet-standard/](https://www.ietf.org/blog/ipv6-internet-standard/)
12. [https://en.wikipedia.org/wiki/IPv6](https://en.wikipedia.org/wiki/IPv6)
13. [https://datatracker.ietf.org/doc/html/rfc2460](https://datatracker.ietf.org/doc/html/rfc2460)
14. [https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200)
15. [https://www.rfc-editor.org/rfc/rfc8200.html](https://www.rfc-editor.org/rfc/rfc8200.html)
16. [https://packetpushers.net/podcasts/ipv6-buzz/ipb166-reflections-and-projections-for-ipv6-in-2024-and-2025/](https://packetpushers.net/podcasts/ipv6-buzz/ipb166-reflections-and-projections-for-ipv6-in-2024-and-2025/)
17. [https://www.ripe.net/support/training/ripe-ncc-educa/presentations/bob-hinden-ipv6-pastpresentfuture.pdf](https://www.ripe.net/support/training/ripe-ncc-educa/presentations/bob-hinden-ipv6-pastpresentfuture.pdf)
18. [https://www.hjp.at/doc/rfc/rfc1752.html](https://www.hjp.at/doc/rfc/rfc1752.html)
19. [https://tools.ietf.org/html/rfc1752](https://tools.ietf.org/html/rfc1752)
20. [https://tools.ietf.org/html/draft-ford-ipng-tuba-whitepaper-00](https://tools.ietf.org/html/draft-ford-ipng-tuba-whitepaper-00)
21. [https://datatracker.ietf.org/doc/html/draft-hinden-ipng-overview-00](https://datatracker.ietf.org/doc/html/draft-hinden-ipng-overview-00)
22. [https://www.sobco.com/ipng/internet-drafts/index.html](https://www.sobco.com/ipng/internet-drafts/index.html)
23. [https://blog.lacnic.net/en/ipv6-internet/](https://blog.lacnic.net/en/ipv6-internet/)
24. [https://www.oreilly.com/library/view/ipv6-essentials/0596001258/ch01.html](https://www.oreilly.com/library/view/ipv6-essentials/0596001258/ch01.html)
25. [https://www.segment-routing.net/srv6-news](https://www.segment-routing.net/srv6-news)
26. [https://digital-strategy.ec.europa.eu/en/miscellaneous/japan-softbank-launches-worlds-first-5g-service-using-segment-routing-ipv6-mobile-user-plane](https://digital-strategy.ec.europa.eu/en/miscellaneous/japan-softbank-launches-worlds-first-5g-service-using-segment-routing-ipv6-mobile-user-plane)
27. [https://www.segment-routing.net/conferences/Paris25/](https://www.segment-routing.net/conferences/Paris25/)
28. [https://arxiv.org/pdf/2205.04193](https://arxiv.org/pdf/2205.04193)
29. [https://www.ciscolive.com/c/dam/r/ciscolive/global-event/docs/2025/pdf/BRKENT-2520.pdf](https://www.ciscolive.com/c/dam/r/ciscolive/global-event/docs/2025/pdf/BRKENT-2520.pdf)
30. [https://datatracker.ietf.org/wg/srv6ops/about/](https://datatracker.ietf.org/wg/srv6ops/about/)
31. [https://www.cisco.com/c/en/us/support/docs/ip/ipv6-routing/220485-configure-design-and-migration-best-prac.html](https://www.cisco.com/c/en/us/support/docs/ip/ipv6-routing/220485-configure-design-and-migration-best-prac.html)
32. [https://datatracker.ietf.org/doc/rfc8986/](https://datatracker.ietf.org/doc/rfc8986/)
33. [https://www.mcafee.com/blogs/other-blogs/mcafee-labs/cve-2020-16898-bad-neighbor/](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/cve-2020-16898-bad-neighbor/)
34. [https://github.com/advanced-threat-research/CVE-2020-16898](https://github.com/advanced-threat-research/CVE-2020-16898)
35. [https://www.rapid7.com/blog/post/2020/10/14/there-goes-the-neighborhood-dealing-with-cve-2020-16898-a-k-a-bad-neighbor/](https://www.rapid7.com/blog/post/2020/10/14/there-goes-the-neighborhood-dealing-with-cve-2020-16898-a-k-a-bad-neighbor/)
36. [https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/bad-neighbors-can-break-windows-cve-2020-16898/](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/bad-neighbors-can-break-windows-cve-2020-16898/)
37. [https://digital.nhs.uk/cyber-alerts/2020/cc-3638](https://digital.nhs.uk/cyber-alerts/2020/cc-3638)
38. [https://isc.sans.edu/diary/CVE-2020-16898:+Windows+ICMPv6+Router+Advertisement+RRDNS+Option+Remote+Code+Execution+Vulnerability/26684](https://isc.sans.edu/diary/CVE-2020-16898:+Windows+ICMPv6+Router+Advertisement+RRDNS+Option+Remote+Code+Execution+Vulnerability/26684)
39. [https://malwaretech.com/2024/08/exploiting-CVE-2024-38063.html](https://malwaretech.com/2024/08/exploiting-CVE-2024-38063.html)
40. [https://www.opswat.com/blog/comprehensive-breakdown-of-cve-2024-38063-a-critical-threat-in-the-windows-tcp-ip-stack](https://www.opswat.com/blog/comprehensive-breakdown-of-cve-2024-38063-a-critical-threat-in-the-windows-tcp-ip-stack)
41. [https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)
42. [https://aws.amazon.com/about-aws/whats-new/2024/02/aws-free-tier-750-hours-free-public-ipv4-addresses/](https://aws.amazon.com/about-aws/whats-new/2024/02/aws-free-tier-750-hours-free-public-ipv4-addresses/)
43. [https://labs.ripe.net/author/dan-fidler/aws-introduces-charges-for-public-ipv4-use/](https://labs.ripe.net/author/dan-fidler/aws-introduces-charges-for-public-ipv4-use/)
44. [https://engineering.fb.com/2015/09/14/networking-traffic/ipv6-it-s-time-to-get-on-board/](https://engineering.fb.com/2015/09/14/networking-traffic/ipv6-it-s-time-to-get-on-board/)
45. [https://engineering.fb.com/2017/01/17/production-engineering/legacy-support-on-ipv6-only-infra/](https://engineering.fb.com/2017/01/17/production-engineering/legacy-support-on-ipv6-only-infra/)
46. [https://blogs.infoblox.com/ipv6-coe/can-ipv6-really-be-faster-than-ipv4-part-1/](https://blogs.infoblox.com/ipv6-coe/can-ipv6-really-be-faster-than-ipv4-part-1/)
47. [https://blog.ipspace.net/2014/03/facebook-is-close-to-having-ipv6-only/](https://blog.ipspace.net/2014/03/facebook-is-close-to-having-ipv6-only/)
48. [https://atscaleconference.com/videos/a-history-of-ipv6-challenges-in-facebook-data-centers/](https://atscaleconference.com/videos/a-history-of-ipv6-challenges-in-facebook-data-centers/)
49. [https://www.internetsociety.org/deploy360/2014/case-study-t-mobile-us-goes-ipv6-only-using-464xlat/](https://www.internetsociety.org/deploy360/2014/case-study-t-mobile-us-goes-ipv6-only-using-464xlat/)
50. [https://archive.nanog.org/sites/default/files/wednesday_general_byrne_breakingfree_11.pdf](https://archive.nanog.org/sites/default/files/wednesday_general_byrne_breakingfree_11.pdf)
51. [https://www.rfc-editor.org/rfc/rfc6877.html](https://www.rfc-editor.org/rfc/rfc6877.html)
52. [https://datatracker.ietf.org/doc/rfc9637/](https://datatracker.ietf.org/doc/rfc9637/)
53. [https://blog.ipspace.net/2025/01/rfc9637-ipv6-documentation-prefix/](https://blog.ipspace.net/2025/01/rfc9637-ipv6-documentation-prefix/)
54. [https://datatracker.ietf.org/doc/rfc9673/](https://datatracker.ietf.org/doc/rfc9673/)
55. [https://www.rfc-editor.org/rfc/rfc9673.html](https://www.rfc-editor.org/rfc/rfc9673.html)
56. [https://datatracker.ietf.org/doc/html/rfc4862](https://datatracker.ietf.org/doc/html/rfc4862)
57. [https://www.networkacademy.io/ccna/ipv6/stateless-address-autoconfiguration-slaac](https://www.networkacademy.io/ccna/ipv6/stateless-address-autoconfiguration-slaac)
58. [https://chrisgrundemann.com/index.php/2012/introducing-ipv6-neighbor-discovery-slaac/](https://chrisgrundemann.com/index.php/2012/introducing-ipv6-neighbor-discovery-slaac/)
59. [http://blog.zorinaq.com/vint-cerfs-internet-experiment-quote/](http://blog.zorinaq.com/vint-cerfs-internet-experiment-quote/)
60. [https://www.cio.com/article/3123438/vint-cerfs-dream-do-over-2-ways-hed-make-the-internet-different.html](https://www.cio.com/article/3123438/vint-cerfs-dream-do-over-2-ways-hed-make-the-internet-different.html)
61. [https://www.engadget.com/2011-01-26-vint-cerf-on-ipv4-depletion-who-the-hell-knew-how-much-address.html](https://www.engadget.com/2011-01-26-vint-cerf-on-ipv4-depletion-who-the-hell-knew-how-much-address.html)
62. [https://dltj.org/article/vint-cerf-ip-addressing/](https://dltj.org/article/vint-cerf-ip-addressing/)
63. [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
64. [https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/)
65. [https://en.wikipedia.org/wiki/2021_Facebook_outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
66. [https://www.thousandeyes.com/blog/facebook-outage-analysis](https://www.thousandeyes.com/blog/facebook-outage-analysis)
67. [https://www.kentik.com/blog/facebooks-historic-outage-explained/](https://www.kentik.com/blog/facebooks-historic-outage-explained/)
68. [https://www.techtarget.com/searchnetworking/feature/3-lessons-from-the-2021-Facebook-outage-for-network-pros](https://www.techtarget.com/searchnetworking/feature/3-lessons-from-the-2021-Facebook-outage-for-network-pros)
69. [https://datatracker.ietf.org/doc/rfc9099/](https://datatracker.ietf.org/doc/rfc9099/)
70. [https://blog.apnic.net/2022/06/07/rfc-9099-operational-security-considerations-for-ipv6-networks/](https://blog.apnic.net/2022/06/07/rfc-9099-operational-security-considerations-for-ipv6-networks/)
71. [https://www.pts.se/contentassets/d0d9a3751ed547f8a29f46adde5c0542/20250205-se-ipv6-council---ietf-ipv6-news.pdf](https://www.pts.se/contentassets/d0d9a3751ed547f8a29f46adde5c0542/20250205-se-ipv6-council---ietf-ipv6-news.pdf)
72. [https://www.ripe.net/ripe/mail/archives/ipv6-wg/2022-December/003831.html](https://www.ripe.net/ripe/mail/archives/ipv6-wg/2022-December/003831.html)
73. [https://www.rfc-editor.org/rfc/rfc8981.html](https://www.rfc-editor.org/rfc/rfc8981.html)
74. [https://datatracker.ietf.org/doc/html/rfc7217](https://datatracker.ietf.org/doc/html/rfc7217)
75. [http://www.makikiweb.com/ipv6/slaac_and_rfc8981.html](http://www.makikiweb.com/ipv6/slaac_and_rfc8981.html)
76. [https://en.wikipedia.org/wiki/World_IPv6_Day_and_World_IPv6_Launch_Day](https://en.wikipedia.org/wiki/World_IPv6_Day_and_World_IPv6_Launch_Day)
77. [https://www.worldipv6launch.org/](https://www.worldipv6launch.org/)
78. [https://www.internetsociety.org/news/press-releases/2018/six-years-since-world-launch-ipv6-now-dominant-internet-protocol-for-many/](https://www.internetsociety.org/news/press-releases/2018/six-years-since-world-launch-ipv6-now-dominant-internet-protocol-for-many/)
79. [https://datatracker.ietf.org/doc/rfc5514/](https://datatracker.ietf.org/doc/rfc5514/)
80. [https://en.wikipedia.org/wiki/April_Fools%27_Day_Request_for_Comments](https://en.wikipedia.org/wiki/April_Fools%27_Day_Request_for_Comments)
81. [https://www.nic.ad.jp/en/ip/ipv4pool/](https://www.nic.ad.jp/en/ip/ipv4pool/)
82. [https://en.wikipedia.org/wiki/IPv4_address_exhaustion](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
83. [https://blog.apnic.net/2019/12/13/keep-calm-and-carry-on-the-status-of-ipv4-address-allocation/](https://blog.apnic.net/2019/12/13/keep-calm-and-carry-on-the-status-of-ipv4-address-allocation/)
84. [https://www.apnic.net/manage-ip/ipv4-exhaustion/](https://www.apnic.net/manage-ip/ipv4-exhaustion/)
85. [https://en.wikipedia.org/wiki/6bone](https://en.wikipedia.org/wiki/6bone)
86. [https://datatracker.ietf.org/doc/html/rfc3701](https://datatracker.ietf.org/doc/html/rfc3701)
87. [https://blog.cloudflare.com/radar-2024-year-in-review/](https://blog.cloudflare.com/radar-2024-year-in-review/)
88. [https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)
89. [https://blog.cloudflare.com/ipv6-from-dns-pov/](https://blog.cloudflare.com/ipv6-from-dns-pov/)
90. [https://blog.cloudflare.com/98-percent-ipv6/](https://blog.cloudflare.com/98-percent-ipv6/)
91. [https://blog.cloudflare.com/icloud-private-relay/](https://blog.cloudflare.com/icloud-private-relay/)
92. [https://support.apple.com/en-us/102602](https://support.apple.com/en-us/102602)
93. [https://meta.wikimedia.org/wiki/Apple_iCloud_Private_Relay](https://meta.wikimedia.org/wiki/Apple_iCloud_Private_Relay)
94. [https://datatracker.ietf.org/doc/html/rfc8305](https://datatracker.ietf.org/doc/html/rfc8305)
95. [https://en.wikipedia.org/wiki/Happy_Eyeballs](https://en.wikipedia.org/wiki/Happy_Eyeballs)
96. [https://daniel.haxx.se/blog/2025/08/04/even-happier-eyeballs/](https://daniel.haxx.se/blog/2025/08/04/even-happier-eyeballs/)
97. [https://www.amazon.com/IPv6-Essentials-Integrating-into-Network/dp/1449319211](https://www.amazon.com/IPv6-Essentials-Integrating-into-Network/dp/1449319211)
98. [https://blog.apnic.net/2024/10/22/the-ipv6-transition/](https://blog.apnic.net/2024/10/22/the-ipv6-transition/)
99. [https://www.potaroo.net/ispcol/2024-10/ipv6-transition.html](https://www.potaroo.net/ispcol/2024-10/ipv6-transition.html)
100. [https://labs.apnic.net/presentations/store/2025-02-24-apricot-ipv6.pdf](https://labs.apnic.net/presentations/store/2025-02-24-apricot-ipv6.pdf)
101. [https://blog.apnic.net/2024/11/14/podcast-the-ipv6-transition/](https://blog.apnic.net/2024/11/14/podcast-the-ipv6-transition/)
102. [http://6lab.cz/rogue-router-advertisement-attack/](http://6lab.cz/rogue-router-advertisement-attack/)
103. [https://datatracker.ietf.org/doc/rfc7113/](https://datatracker.ietf.org/doc/rfc7113/)
104. [https://blogs.infoblox.com/ipv6-coe/why-you-must-use-icmpv6-router-advertisements-ras/](https://blogs.infoblox.com/ipv6-coe/why-you-must-use-icmpv6-router-advertisements-ras/)
105. [https://datatracker.ietf.org/doc/html/rfc5952](https://datatracker.ietf.org/doc/html/rfc5952)
106. [https://www.kame.net/](https://www.kame.net/)
107. [https://en.wikipedia.org/wiki/KAME_project](https://en.wikipedia.org/wiki/KAME_project)
108. [https://www.kame.net/newsletter/20051107/](https://www.kame.net/newsletter/20051107/)
109. [https://datatracker.ietf.org/doc/rfc8925/](https://datatracker.ietf.org/doc/rfc8925/)
110. [https://labs.ripe.net/author/ondrej_caletka_1/deploying-ipv6-mostly-access-networks/](https://labs.ripe.net/author/ondrej_caletka_1/deploying-ipv6-mostly-access-networks/)
111. [https://www.infoblox.com/blog/ipv6-coe/configuring-infoblox-vnios-for-ipv6-only-networks/](https://www.infoblox.com/blog/ipv6-coe/configuring-infoblox-vnios-for-ipv6-only-networks/)
112. [https://fedoraproject.org/wiki/Changes/IPv6-Mostly_Support_In_NetworkManager](https://fedoraproject.org/wiki/Changes/IPv6-Mostly_Support_In_NetworkManager)
113. [https://www.rfc-editor.org/rfc/rfc9098.html](https://www.rfc-editor.org/rfc/rfc9098.html)
114. [https://www.infoblox.com/blog/ipv6-coe/creating-a-new-ipv6-extension-header/](https://www.infoblox.com/blog/ipv6-coe/creating-a-new-ipv6-extension-header/)
115. [https://www.worldipv6launch.org/participants/](https://www.worldipv6launch.org/participants/)
116. [https://datatracker.ietf.org/group/v6ops/documents/](https://datatracker.ietf.org/group/v6ops/documents/)
117. [https://datatracker.ietf.org/doc/draft-ietf-v6ops-cpe-lan-pd/05/](https://datatracker.ietf.org/doc/draft-ietf-v6ops-cpe-lan-pd/05/)
118. [https://www.ipv6ready.org/about.html](https://www.ipv6ready.org/about.html)
119. [https://www.rapidseedbox.com/blog/ipv6-faster-than-ipv4](https://www.rapidseedbox.com/blog/ipv6-faster-than-ipv4)
120. [https://www.rfc-editor.org/rfc/rfc6877.txt](https://www.rfc-editor.org/rfc/rfc6877.txt)

---

*Caveats:* (a) The "Google 50.1% on March 28, 2026" milestone is a single-day peak from one measurement source; APNIC Labs and Cloudflare Radar still see global IPv6 capability in the 40–43% range as of April 2026 — treat the headline number as a marker rather than a steady state. (b) Some performance claims (Facebook 10–15%, Akamai mobile 5%, "40% faster on one mobile carrier") come from operator-published measurements that have not been independently re-verified at scale in 2024–2026. (c) The published behavior of CVE-2020-16898 has well-documented BSoD reproductions; reliable RCE in the wild was never publicly demonstrated. (d) Where I could not find a 2024–2026 update for an older fact (e.g., specific DHCPv6 client-vendor support matrices), I cited the most recent verifiable source rather than fabricate currency. (e) RFC 9602's exact registry text was not directly verified in this research pass and should be confirmed against the RFC Editor before publication.