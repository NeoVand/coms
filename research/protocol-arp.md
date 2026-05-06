---
prompt_source: deep-research-prompts.txt:1395-1573 (PROTOCOL · ARP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/bcd97a1a-d4cc-4d4a-86ef-63a725d6cdb7
research_mode: claude.ai Research
---

# The Address Resolution Protocol (ARP): A Network Foundations Deep Dive

> **Scope.** This is an educational reference for engineers — some new to networking, some seasoned — covering everything from "what is a MAC address" to "why EVPN proxy-ARP suppression breaks application-layer keepalives." Today's date is **2026-05-05**. Sources are weighted toward 2024–2026 where the topic is current; original RFCs and primary sources are used for historical claims. Anything that has shifted in the last 24 months is explicitly flagged ⚡.

---

## 1. Prerequisites and glossary

Before ARP makes any sense, a reader needs roughly fifteen ideas. One- or two-sentence definitions, with authoritative pointers:

- **OSI 7-layer model and the TCP/IP 4-layer model.** The OSI reference model (ISO/IEC 7498-1) splits networking into Physical (L1), Data Link (L2), Network (L3), Transport (L4), Session (L5), Presentation (L6), Application (L7); the TCP/IP model collapses these into Link, Internet, Transport, Application. ARP straddles the L2/L3 boundary — see §7 for the famous "layer 2.5" debate.
- **Physical layer (L1).** The actual signaling medium — copper, fiber, radio — concerned with bits, voltages, modulation, and line coding (e.g., 8b/10b, PAM-4).
- **Data link layer (L2) / framing.** The layer that moves bits between nodes on the same physical segment, encapsulating them in **frames** with start-of-frame markers, source/destination link-layer addresses, an EtherType, payload, and a CRC. Ethernet (IEEE 802.3) and Wi-Fi (IEEE 802.11) are the two dominant L2 technologies in 2026.
- **Network layer (L3).** End-to-end logical addressing and forwarding across many L2 hops; for the public Internet this is essentially IPv4 (RFC 791) and IPv6 (RFC 8200).
- **MAC address / EUI-48.** A 48-bit globally administered hardware identifier assigned to a NIC, divided into a 24-bit OUI (organizationally unique identifier, assigned by the IEEE Registration Authority) and a 24-bit device portion. Two flag bits in the first octet matter: the I/G bit (individual/group, i.e., unicast vs multicast) and the U/L bit (universally vs locally administered). The all-ones address `FF:FF:FF:FF:FF:FF` is the Ethernet broadcast.
- **Frame vs packet vs datagram.** A *frame* is an L2 PDU (e.g., an Ethernet frame); a *packet* is an L3 PDU (e.g., an IP packet); a *datagram* is the connectionless variant of a packet (UDP datagram, IP datagram). Pedants disagree at the margins; the canonical Stevens definitions are in *TCP/IP Illustrated, Vol. 1, 2nd ed.* (Fall & Stevens, 2011). [Pearsoncmg](https://ptgmedia.pearsoncmg.com/images/9780321336316/samplepages/0321336313.pdf)
- **Header.** A fixed-format prefix on a PDU that carries addressing, length, type, and control fields; ARP itself is essentially all header (28 bytes, no payload).
- **Checksum / FCS.** Error-detection code; Ethernet uses a 32-bit CRC ("Frame Check Sequence") computed over the frame. ARP itself has no internal checksum — it relies on the L2 FCS.
- **EtherType.** A 16-bit field at offset 12 of an Ethernet II frame that names the upper-layer protocol. `0x0800` = IPv4, `0x86DD` = IPv6, `0x0806` = ARP, `0x8035` = RARP, `0x8100` = 802.1Q VLAN tag. [Medium](https://cyberbruharmy.medium.com/understanding-arp-address-resolution-protocol-functionality-packet-structure-layer-mapping-2aa3b6a6fd25)
- **MTU.** Maximum Transmission Unit — the largest payload the L2 can carry without fragmentation. Classic Ethernet MTU = 1500 bytes; "jumbo frames" go up to 9000+. ARP frames are tiny (42–60 bytes on the wire after Ethernet padding) and never need fragmenting.
- **Broadcast / multicast / unicast.** Unicast = one recipient; multicast = one to a subscribed group (Ethernet multicast addresses have the I/G bit set, e.g., `01:00:5E:xx:xx:xx` for IPv4 multicast); broadcast = all stations on the L2 segment. ARP requests are L2 broadcast.
- **ARP cache (or "neighbor table").** A per-interface table mapping known IP addresses to MAC addresses, with each entry having a state (e.g., REACHABLE, STALE, DELAY, PROBE, FAILED on Linux, modeled on RFC 4861's IPv6 ND state machine; Windows Vista+ adopted the same model). [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/address-resolution-protocol-arp-caching-behavior)
- **VLAN (IEEE 802.1Q).** A 4-byte tag inserted into the Ethernet header that segments one physical L2 into multiple broadcast domains; ARP is bounded by the VLAN.
- **Subnet / prefix.** A contiguous block of IP addresses sharing a prefix length (e.g., `10.0.0.0/24`). A host issues an ARP for an IP only if the destination is "on-link" (in the same prefix); off-link traffic gets ARPed for the default gateway's IP.
- **Default gateway.** The router IP a host sends off-subnet packets to. In practice, most ARP traffic on a busy server is for the gateway, not other hosts.

Authoritative starting points for these definitions: ISO/IEC 7498-1 (OSI model); IEEE Std 802 family for MAC/Ethernet; RFC 791 (IPv4); RFC 8200 (IPv6); RFC 1122 (Internet host requirements, which places ARP in the link layer); Fall & Stevens, *TCP/IP Illustrated, Vol. 1*, 2nd ed., Addison-Wesley 2011 (ISBN 978-0-321-33631-6). [Wikipedia](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)[Pearsoncmg](https://ptgmedia.pearsoncmg.com/images/9780321336316/samplepages/0321336313.pdf)

---

## 2. History and story

### Origin (1981–1982)

By 1981 the ARPA Internet community had a problem. **DEC, Intel, and Xerox** ("DIX") had jointly published the 10 Mbit Ethernet specification, replacing the 3 Mbit experimental Ethernet that Bob Metcalfe and David Boggs had built at **Xerox PARC** in 1973–1976. Ethernet used 48-bit hardware addresses; the Internet Protocol used 32-bit addresses; CHAOSnet (MIT) used 16-bit addresses; Xerox PUP used yet another scheme; DECnet, AppleTalk, and others all had their own. Several protocols had to share the same cable, but how does the IP module on host A learn the Ethernet address of host B? [Fandom](https://computerprojectsduff.fandom.com/wiki/Address_Resolution_Protocol(ARP))[Studocu](https://www.studocu.com/en-us/document/michigan-state-university/adv-computer-networks-com/rfc826/33687560)

Two design alternatives were on the table and *lost*:

1. **Embedding the hardware address in the protocol address** (Xerox PUP's approach — use the host portion of the network address as the Ethernet address directly). This worked for PUP but fundamentally couldn't scale to 32-bit IPv4 with 48-bit Ethernet, and it tied L3 addressing to L2 hardware.
2. **Static configuration tables** distributed manually or by a central authority. Operationally horrible at any scale.

The winner was a small dynamic-discovery protocol written by **David C. Plummer** while he was at **Symbolics, Inc.** (243 Vassar Street, Cambridge MA — the Symbolics Lisp Machine company spun out of the MIT AI Lab). Plummer's RFC 826, "An Ethernet Address Resolution Protocol — or — Converting Network Protocol Addresses to 48.bit Ethernet Address for Transmission on Ethernet Hardware," was published in **November 1982** and listed his contact as `DCP@MIT-MC` (the MIT-Multics-MC machine). RFC 826 is currently designated **STD 37** (Internet Standard 37) and has never been obsoleted in 44 years — only updated by RFC 5227. [IETF + 2](https://tools.ietf.org/html/rfc826)

> ⚠️ Disambiguation: this **David C. Plummer** of Symbolics/MIT-MC is **not** the **Dave Plummer of "Dave's Garage"** YouTube fame. The latter is the Microsoft engineer (born 1968) who wrote the Windows NT Task Manager; he was 14 in November 1982. They are distinct people; the Wikipedia page for "Dave Plummer" refers to the Microsoft engineer, and the Symbolics Plummer's email address `DCP@MIT-MC` is preserved in the body of RFC 826 itself. [Vintage Computer Federation](https://vcfed.org/bio-david-plummer/)[RFC Editor](https://www.rfc-editor.org/rfc/rfc826)

### What the design got right

RFC 826 was deliberately **protocol-agnostic**. The HLEN and PLEN fields are variable: the protocol was designed to outlive any specific hardware or any specific Layer 3. Plummer wrote: *"This protocol was originally designed for the DEC/Intel/Xerox 10Mbit Ethernet. It has been generalized to allow it to be used for other types of networks."* Forty-four years later, ATM, Frame Relay, FDDI, Token Ring, and packet radio have all used the same wire format with different HLEN/PLEN values. [IETF](https://tools.ietf.org/html/rfc826)

### Milestones in the family tree

| Year | RFC | What it did |
|---|---|---|
| 1982 | **RFC 826** (STD 37) | The original ARP. Plummer, Symbolics. |
| 1984 | **RFC 903** (STD 38) | Reverse ARP (RARP) — diskless workstations get IP from MAC. |
| 1987 | **RFC 1027** | Proxy ARP (the "ARP hack") — Carl-Mitchell & Quarterman, U. of Texas at Austin. |
| 1990 | **RFC 1149** | IP over Avian Carriers (April Fools'). Discusses encapsulation; ARP-like resolution to bird is left as an exercise. The Bergen Linux User Group implemented it for real on April 28, 2001, with 55% packet loss. |
| 1996 | RFC 2002 / 2005 | Mobile IP, including gratuitous-ARP usage on home agents. |
| 1998 | **RFC 2390** | Inverse ARP (InARP) — find a peer's L3 from L2 (Frame Relay DLCIs). |
| 1998 | **RFC 2225** | Classical IP and ATMARP over ATM. |
| 2007 | **RFC 4861** | IPv6 Neighbor Discovery — replaces ARP for IPv6. |
| 2008 | **RFC 5227** (Apple, Cheshire) | IPv4 Address Conflict Detection (ARP probe & announce). |
| 2010 | **RFC 5798** | VRRPv3 — gratuitous ARP on master election. |
| 2012 | **RFC 6775** | 6LoWPAN ND — registration-based ND for IoT. |
| 2013 | **RFC 6820** | Address Resolution Problems in Large Data Center Networks. |
| 2018 | **RFC 8302** | TRILL ARP/ND optimization. |
| 2020 | **RFC 8925** | IPv6-Only Preferred DHCPv4 option [ACM Digital Library](https://dl.acm.org/doi/book/10.17487/RFC8925) (option 108) — the standards-track on-ramp to IPv6-mostly. |
| 2021 | **RFC 9047** | Propagation of ARP/ND flags in EVPN. [Juniper Networks](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn.html) |
| 2021 | **RFC 9131** | Gratuitous Neighbor Discovery (updates 4861). |
| 2021 | **RFC 9135** | Integrated Routing and Bridging in EVPN [Juniper Networks](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn.html) — the "ARP suppression" RFC. |
| 2021 | **RFC 9161** | Operational aspects of proxy-ARP/ND in EVPN. |

### What's changed in the last 24 months ⚡ (April 2024 – May 2026)

- **VRRPv3 has been re-issued.** RFC 9568 (April 2024) updates and supersedes RFC 5798 as the current VRRPv3 specification for IPv4 and IPv6, including the gratuitous-ARP behavior on master transition. [IETF](https://datatracker.ietf.org/doc/draft-ietf-v6ops-6mops/)
- **IPv6-Mostly operational guidance.** The IETF v6ops draft `draft-ietf-v6ops-6mops` (multiple revisions through March 2026) is on track to RFC. It standardizes how RFC 8925, RFC 8781 (PREF64 in RAs), and 464XLAT compose. SC24 (the supercomputing conference, Nov 2024) and SC25 ran an IPv6-only Wi-Fi SSID using RFC 8925 in production; both Apple and Android shipped clients that respect option 108. [Packet Pushers](https://packetpushers.net/podcasts/ipv6-buzz/ipb168-deploying-ipv6-only-wi-fi-at-the-sc24-conference/)
- **MAC randomization shift.** iOS 18 (Sept 2024), iPadOS 18, and macOS Sequoia 15 introduced a "Rotate Wi-Fi Address" mode on top of the per-SSID private MAC introduced in iOS 14 (2020). Default for open / pre-WPA2 networks is to rotate every 14 days; secure networks use a fixed but per-SSID MAC. This breaks captive portals, MAC-based DHCP reservations, and ARP-cache freshness assumptions in unpredictable ways. [Datavalet + 3](https://www.datavalet.com/blog/understanding-mac-address-rotation-in-ios18)
- **The Linux kernel became its own CVE Numbering Authority on Feb 13, 2024**, leading to a flood of kernel CVEs — 3,529 in 2024 and accelerating in 2025. The neighbour subsystem has not had a "headline" critical CVE in 2024–2026 to my knowledge, but the volume changes the patching calculus. [CIQ](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)
- **No new ARP RFC has obsoleted RFC 826.** STD 37 is still STD 37 in May 2026.

### Politics and "what didn't win"

Plummer credits MIT's **David Moon** ("MOON@SCRC@MIT-MC", per RFC 826's acknowledgments) for the more detailed packet-handling rules. The protocol was designed in the era of the **Internet Engineering Notes (IEN)** transitioning into the IETF; ARP itself is one of the earliest Standards-Track documents and slipped into STD 37 with virtually no controversy because it solved an immediate operational problem. The *real* fight came years later, when IPv6 working groups debated whether to extend ARP to 128-bit addresses or to design something new — they chose new (NDP, RFC 4861), folding address resolution into ICMPv6.

---

## 3. How it actually works

### 3.1 Packet format (RFC 826)

ARP is a **single 28-byte fixed-format message** for IPv4-over-Ethernet. The full structure (all multi-byte fields are network byte order, "high byte first" as Plummer wrote — this matters because contemporary VAXes and PDP-11s were little-endian): [RFC Editor](https://www.rfc-editor.org/rfc/rfc826)[RFC Editor](https://www.rfc-editor.org/rfc/rfc826)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Hardware Type         |         Protocol Type         |   ar$hrd / ar$pro
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     HLEN      |     PLEN      |          Operation            |   ar$hln / ar$pln / ar$op
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                Sender Hardware Address (SHA, 6 bytes)         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                |  Sender Protocol Addr (SPA)  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        SPA cont (4B)           |  Target Hardware Addr (THA)  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                THA continued (rest of 6 bytes)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                  Target Protocol Address (TPA, 4 bytes)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Fields, in detail:

- **Hardware Type (`ar$hrd`)**, 16 bits. `1` = Ethernet (IEEE 802.3); `6` = IEEE 802 networks; `15` = Frame Relay; `16` = ATM; `17` = HDLC; full registry at IANA "ARP Parameters."
- **Protocol Type (`ar$pro`)**, 16 bits. Same numbering as Ethernet EtherType. `0x0800` = IPv4 (the universal case).
- **HLEN (`ar$hln`)**, 8 bits. Length of hardware address in bytes — `6` for Ethernet/EUI-48.
- **PLEN (`ar$pln`)**, 8 bits. Length of protocol address in bytes — `4` for IPv4.
- **Operation (`ar$op`)**, 16 bits. `1` = Request; `2` = Reply; `3` = RARP request; `4` = RARP reply; `8` = InARP request; `9` = InARP reply (RFC 2390). The operation is the *only* way to tell a request from a reply on the wire — there's no flag bit elsewhere. [RFC Editor](https://www.rfc-editor.org/rfc/rfc2390.html)[Hjp](https://www.hjp.at/doc/rfc/rfc2390.html)
- **Sender Hardware Address (SHA)**, HLEN bytes. The MAC of whoever generated this packet.
- **Sender Protocol Address (SPA)**, PLEN bytes. Their IP.
- **Target Hardware Address (THA)**, HLEN bytes. In a *request*, this is unknown — typically zero (`00:00:00:00:00:00`) and ignored. In a *reply*, it's the requester's MAC, copied from the request's SHA.
- **Target Protocol Address (TPA)**, PLEN bytes. The IP being asked about (request) or confirmed (reply).

Because the L2 frame for an ARP packet is `14 (Eth header) + 28 (ARP) = 42` bytes — below the Ethernet minimum of 60 bytes (64 including FCS) — the NIC pads with 18 zero bytes. The famous **"60-byte ARP frame"** trivia trips up everyone who counts bytes for the first time.

### 3.2 A real on-the-wire hex sequence

A typical broadcast ARP request from `192.168.1.10` (`aa:bb:cc:dd:ee:01`) asking who owns `192.168.1.1`, captured by `tcpdump -e -n -X`:

```
ff ff ff ff ff ff aa bb cc dd ee 01 08 06    ← Eth: dst=bcast, src=aa:..., type=0x0806 (ARP)
00 01                                          ← ar$hrd = 1 (Ethernet)
08 00                                          ← ar$pro = 0x0800 (IPv4)
06 04                                          ← HLEN=6, PLEN=4
00 01                                          ← ar$op = 1 (request)
aa bb cc dd ee 01                              ← SHA
c0 a8 01 0a                                    ← SPA = 192.168.1.10
00 00 00 00 00 00                              ← THA = unknown
c0 a8 01 01                                    ← TPA = 192.168.1.1
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00   ← Ethernet pad
```

The reply from the gateway (`11:22:33:44:55:01`):

```
aa bb cc dd ee 01 11 22 33 44 55 01 08 06    ← Eth: dst=requester, src=gateway, type=ARP
00 01 08 00 06 04 00 02                        ← request → reply (op=2)
11 22 33 44 55 01 c0 a8 01 01                  ← SHA, SPA = gateway
aa bb cc dd ee 01 c0 a8 01 0a                  ← THA, TPA = requester
... pad ...
```

### 3.3 Cache lifecycle, gratuitous ARP, ARP probe/announce

The **ARP cache** has classically been three-state (free / resolving / resolved); modern Linux (since 2.2, ~1999) and Windows Vista+ have aligned to the **RFC 4861 ND state machine** even for IPv4 ARP. States are: INCOMPLETE → REACHABLE → STALE → DELAY → PROBE → FAILED. The reachable timer defaults to 30 seconds × random[0.5–1.5] = 15–45 s; on Windows Vista+ this is computed identically. Unused entries transition to STALE and only resolve again if traffic flows to them. [Microsoft Learn + 2](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/address-resolution-protocol-arp-caching-behavior)

**Gratuitous ARP** is a loose term covering two distinct, RFC-826-legal-but-unusual messages:

- **ARP Announcement** (RFC 5227 §3): an ARP **request** with SPA = TPA = the host's own IP. There is no expected reply; it tells everyone on the segment "I now claim this IP, update your caches." Used at boot, on interface up, and on VRRP/HSRP failover.
- **ARP Reply unsolicited** (also called "gratuitous reply"): an ARP reply sent without a preceding request. Older Cisco, Huawei, and Nokia HA routers periodically emit these to keep upstream switch CAM tables fresh. [Lindsay Hill](https://lkhill.com/war-stories-gratuitous-arp-and-vrrp/)

**ARP Probe** (RFC 5227 §2.1.1): an ARP request with SPA = `0.0.0.0`, TPA = the IP the host is *about* to claim. The all-zero SPA is the magic flag that says "I'm not asserting this IP yet — I'm asking if anyone else is using it." If a reply comes back, the host *must not* configure the address. Standard timing constants: `PROBE_NUM=3`, `PROBE_MIN=1s`, `PROBE_MAX=2s`, `ANNOUNCE_NUM=2`, `ANNOUNCE_INTERVAL=2s`, `DEFEND_INTERVAL=10s`, `MAX_CONFLICTS=10`, `RATE_LIMIT_INTERVAL=60s`. Stuart Cheshire (Apple) was the lead author; this is the mechanism behind the `169.254/16` IPv4 Link-Local algorithm. Fedora has shipped ACD on by default since the mid-2010s. [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/52/rfc5227.xml)

**Proxy ARP** (RFC 1027): a router answers ARP requests on behalf of hosts that live on a different physical segment, advertising its own MAC. Hosts then send packets to the router thinking they're sending direct, and the router forwards them. The phrase "the ARP hack" in RFC 1027 is the original authors' phrase — it was always controversial. [Muonics](https://www.muonics.com/rfc/rfc1027.php)

### 3.4 Sequence diagram

Other host C (10.0.0.7)Host B (10.0.0.6)L2 broadcast domainHost A (10.0.0.5)Other host C (10.0.0.7)Host B (10.0.0.6)L2 broadcast domainHost A (10.0.0.5)#mermaid-rgb{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rgb .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rgb .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rgb .error-icon{fill:#CC785C;}#mermaid-rgb .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rgb .edge-thickness-normal{stroke-width:1px;}#mermaid-rgb .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rgb .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rgb .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rgb .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rgb .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rgb .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rgb .marker.cross{stroke:#A1A1A1;}#mermaid-rgb svg{font-family:inherit;font-size:16px;}#mermaid-rgb p{margin:0;}#mermaid-rgb .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rgb text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgb .actor-line{stroke:#A1A1A1;}#mermaid-rgb .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rgb .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rgb #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgb .sequenceNumber{fill:#5e5e5e;}#mermaid-rgb #sequencenumber{fill:#E5E5E5;}#mermaid-rgb #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgb .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rgb .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rgb .labelText,#mermaid-rgb .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgb .loopText,#mermaid-rgb .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgb .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rgb .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rgb .noteText,#mermaid-rgb .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgb .activation0{fill:transparent;stroke:#00000000;}#mermaid-rgb .activation1{fill:transparent;stroke:#00000000;}#mermaid-rgb .activation2{fill:transparent;stroke:#00000000;}#mermaid-rgb .actorPopupMenu{position:absolute;}#mermaid-rgb .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rgb .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rgb .actor-man circle,#mermaid-rgb line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rgb :root{--mermaid-font-family:inherit;}A wants to send IP packet to 10.0.0.6,checks ARP cache → MISSTPA ≠ my IP → drop(but may snoop SHA/SPA into cache)TPA == my IP → answeralso cache A_MAC↔10.0.0.5cache 10.0.0.6 → B_MAC,state=REACHABLE for ~15–45sARP Requestop=1, SHA=A_MAC, SPA=10.0.0.5,THA=00:..:00, TPA=10.0.0.6,L2 dst=FF:FF:FF:FF:FF:FFdeliverdeliverARP Reply (unicast)op=2, SHA=B_MAC, SPA=10.0.0.6,THA=A_MAC, TPA=10.0.0.5IP packet, finally!

### 3.5 Edge cases

- **Duplicate IP detection.** Two hosts with the same IP both reply to the same request → caches flip-flop, applications see intermittent reachability, switch CAM tables thrash. RFC 5227's ACD prevents this only if both hosts implement it.
- **Race conditions.** Between the moment a host sends an ARP request and gets a reply, queued packets are buffered; Linux defaults to `unres_qlen=3` packets. Higher-RTT links can drop traffic during cache fills if tuned wrong. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc6820.html)[Baeldung](https://www.baeldung.com/linux/arp-settings)
- **Cache poisoning.** ARP has no authentication. Any host on the segment can send unsolicited replies and overwrite cache entries — the basis of the ettercap/dsniff MITM family (see §6).
- **MAC mobility.** When a VM live-migrates, the destination hypervisor sends a gratuitous ARP/RARP to update upstream switch CAMs. A flapping VM can produce thousands of these.

---

## 4. Deep connections to other protocols

**Ethernet (IEEE 802.3 / DIX).** ARP runs *directly* on Ethernet — its EtherType is `0x0806`. There is no IP header in an ARP packet. Plummer designed ARP to be Ethernet-shaped (broadcast resolution; 48-bit hardware addresses) but generalized via HLEN/PLEN.

**IPv4 (RFC 791).** ARP is *the* mechanism that lets IPv4 sit on an Ethernet. Without ARP, every IPv4-over-Ethernet packet would require static MAC↔IP mappings. RFC 1122 places ARP "in the link layer" — Stevens originally agreed; later editions and RFC 826 itself sit it astride L2/L3.

**802.11 (Wi-Fi).** ARP works the same on Wi-Fi as on Ethernet — Wi-Fi frames carry an EtherType in the LLC/SNAP header. The wrinkles are: (1) broadcasts are expensive on radio (lowest data rate, no block-ack) and modern APs implement **ARP proxying** to convert broadcast ARP into unicast queries against a learned table; (2) **MAC randomization** in iOS 14+, Android 10+, and Windows 10+ changes the host's MAC per-SSID, and iOS 18 / macOS Sequoia introduce a "Rotate Wi-Fi Address" mode that changes it every 14 days on weak/open networks. ARP caches and DHCP reservations have to assume MACs are not stable identities anymore. Cisco Meraki has documented iOS 14 sending malformed ARP replies that carried the hardware MAC instead of the randomized one — a bug in early implementations that caused false duplicate-IP alarms. [ANTlabs](https://www.antlabs.com/advisories/advisory-ios-18-mac-randomization-what-it-means-for-your-hotel-wi-fi-2/)[Cisco Meraki](https://documentation.meraki.com/General_Administration/Cross-Platform_Content/Meraki_and_MAC_Address_Randomization)

**DHCP.** When a host gets a DHCPv4 lease (RFC 2131), it should — per RFC 5227 — send ARP probes for the offered address before declaring the lease bound, and ARP announcements after. Switches running **DHCP snooping** build an IP↔MAC↔port binding table, which is then consumed by **Dynamic ARP Inspection** to drop forged ARPs.

**RARP (RFC 903, 1984).** The reverse problem: "I know my MAC, what's my IP?" Used by diskless workstations before BOOTP. Effectively dead by 2000; replaced by BOOTP and then DHCP. Wire format identical to ARP, opcodes 3/4, EtherType `0x8035`.

**InARP (RFC 2390, 1998).** "I know your hardware address (your DLCI on a Frame Relay PVC), what's your IP?" Encapsulated in NLPID/SNAP rather than directly on the link; opcodes 8/9. Lives on in legacy WAN gear. [Ccna-classes + 2](https://ccna-classes.com/ccna-exam-preparation/what-is-inverse-arp-in-networking/)

**ATMARP (RFC 2225, 1998).** "Classical IP and ARP over ATM." Over a Logical IP Subnet (LIS), uses an ATMARP server as a directory because ATM has no broadcast; the server is queried on a well-known VC. Mostly historical; pieces of its directory-server thinking reappear in EVPN. [FAQs.org](http://www.faqs.org/rfcs/rfc2225.html)[Hjp](https://www.hjp.at/doc/rfc/rfc2225.html)

**IPv6 NDP (RFC 4861, 2007).** Replaces ARP entirely for IPv6. Runs over ICMPv6 (Type 135 = Neighbor Solicitation, 136 = Neighbor Advertisement, 133/134 = Router Solicit/Advert, 137 = Redirect). Uses solicited-node multicast addresses (`FF02::1:FFxx:xxxx`) instead of broadcast — hosts only "hear" NS messages for IPs they actually own, dramatically reducing CPU interrupts compared to broadcast ARP. NDP is updated by a long list: RFCs 5942, 6980, 7048, 7527, 7559, 8028, 8319, 8425, 9131, 9685, 9762, 9926. RFC 9131 (October 2021) added "gratuitous ND" semantics so first-hop routers proactively populate the neighbor cache when a host announces a new address — directly analogous to RFC 5227 announcements. [RFC Editor](https://www.rfc-editor.org/rfc/rfc4861.html)[IETF](https://datatracker.ietf.org/doc/rfc9131/)

**Proxy ARP (RFC 1027).** A router answers ARP for IPs not on its own segment. Used historically to subnet without changing host configurations; today mostly seen in mobile/VPN concentrators and in EVPN proxy-ARP/ND functions.

**Gratuitous ARP.** Loose name for ARP announcements and unsolicited replies (see §3.3). Sent on interface up, on VRRP/HSRP/GLBP master change, on VM migration, and (in some HA systems) periodically to refresh switch CAMs.

**GARP (Generic Attribute Registration Protocol) / MRP.** Confusingly named, but **unrelated to ARP**. IEEE 802.1ak defines MRP (Multiple Registration Protocol) which obsoleted GARP; both deal with VLAN/multicast registration on bridges. The naming collision causes hours of confusion every year for new engineers.

**VRRP (RFC 5798, 2010; obsoleted by RFC 9568, April 2024).** A virtual router that masters can fail between physical routers. The master owns a virtual MAC (`00:00:5E:00:01:VRID`) and, on becoming master, *broadcasts a gratuitous ARP request* with the virtual MAC for every IPv4 address it owns. For IPv6, it sends an unsolicited NA. Without that gratuitous ARP, switch CAM tables wouldn't update and traffic would silently drop until aging.

**HSRP (Cisco proprietary).** Older than VRRP, same idea: virtual IP with virtual MAC, gratuitous-ARPs on master change. HSRP virtual MAC is `00:00:0C:07:AC:xx`. HSRP is the source of the long-running war story about migration from HSRP→VRRP causing brief traffic loss while CAM tables relearn.

**EVPN ARP suppression (RFC 9135, 9047, 9161, all 2021).** In a VXLAN/EVPN data center fabric, every leaf switch learns IP↔MAC bindings via BGP EVPN Type-2 routes. When a host sends an ARP request, the local leaf responds out of the BGP-learned database without flooding to the fabric — *ARP suppression*. RFC 9135 specifies the symmetric and asymmetric IRB models; RFC 9047 defines the EVPN extended community that propagates ARP/ND flags (e.g., the "static" or "router" bit); RFC 9161 covers operational aspects. **Caveat operators learned the hard way (APNIC blog, 2021)**: applications that use broadcast ARPs as keepalives between cluster members get silently broken by aggressive ARP suppression. ARP probes (`SPA=0.0.0.0`) must *not* be suppressed, or duplicate-IP detection breaks.

**802.1X.** Port-based authentication; not directly an ARP topic, but in production every "ARP storm caused by misbehaving NIC" investigation ends up looking at 802.1X re-auths and **MAC Authentication Bypass (MAB)**, where unsupplicated devices are admitted by MAC.

**Dynamic ARP Inspection (DAI).** Cisco/Arista/Juniper switch feature that intercepts ARP on untrusted ports and validates SHA/SPA against the DHCP-snooping binding table. Forged ARPs are dropped and logged. Requires DHCP snooping to be enabled on the same VLAN. [Cisco Meraki](https://documentation.meraki.com/Switching/MS_-_Switches/Operate_and_Maintain/How-Tos/Dynamic_ARP_Inspection)[Readthedocs](https://grumpy-networkers-journal.readthedocs.io/en/latest/VENDOR/CISCO/SWITCHING/DAI.html)

**DHCP snooping.** Switch tracks DHCP DISCOVER/REQUEST/ACK on trusted/untrusted ports, builds a MAC↔IP↔port table that DAI and IP Source Guard consume. [NetworkAcademy.IO](https://www.networkacademy.io/ccna/network-security/dynamic-arp-inspection-dai)

**SEND (RFC 3971).** Cryptographic IPv6 Neighbor Discovery using Cryptographically Generated Addresses (CGA) and (after RFC 6494/6495) RPKI certificates. Solves the NDP-spoofing equivalent of ARP poisoning. NIST SP 800-119 §5.4.3 candidly states SEND is "neither widely implemented nor deployed." Almost no production network uses it as of 2026. [Army Futures Command](https://www.hpc.mil/solution-areas/networking/ipv6-knowledge-base/ipv6-knowledge-base-security/neighbor-discovery-protocol-attacks)

**6LoWPAN ND (RFC 6775, 2012).** A pared-down ND for IEEE 802.15.4 IoT meshes. Eliminates multicast-based address resolution; introduces a **registration-based** model (Address Registration Option ARO) where hosts unicast their IPv6/MAC to a 6LoWPAN router that acts as a directory. The neighbor cache becomes a *registry*. This is the IETF's most explicit acknowledgement that broadcast/multicast resolution doesn't scale. [RFC Editor](https://www.rfc-editor.org/rfc/rfc6775.html)[IETF](https://datatracker.ietf.org/doc/html/rfc6775)

**TRILL (RFC 6325) and SPB (IEEE 802.1aq).** Layer-2 multipathing fabrics that compete with EVPN. RFC 8302 (January 2018) defines TRILL ARP/ND optimization: edge RBridges learn IP↔MAC bindings (via DHCP snooping, gratuitous ARP, RARP, or directory) and respond locally to ARP/ND, suppressing campus-wide flooding — same idea as EVPN ARP suppression, different control plane (IS-IS instead of BGP). SPB has equivalent shortcut mechanisms. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8302.html)

---

## 5. Real-world deployment

**Linux kernel.** ARP is implemented in the unified `net/ipv4/arp.c` plus the generic neighbour subsystem (`net/core/neighbour.c`). Knobs live under `/proc/sys/net/ipv4/neigh/<iface>/`:

- `gc_thresh1` (default **128**) — minimum entries kept; GC won't run below this. [Linux Man Pages](https://linux.die.net/man/7/arp)
- `gc_thresh2` (default **512**) — soft maximum; GC runs after 5 s if exceeded. [Linux Man Pages](https://linux.die.net/man/7/arp)
- `gc_thresh3` (default **1024**) — hard maximum; new entries fail with `arp_cache: neighbor table overflow!` if exceeded. [Linux Man Pages](https://linux.die.net/man/7/arp)[IT Blog](https://ixnfo.com/en/changing-gc_thresh-on-linux.html)
- `base_reachable_time_ms` (default 30000) — the RFC-4861-style reachable timer base.
- `gc_stale_time` (default 60 s) — how often stale entries are revalidated.
- `unres_qlen` (default 3) — packets buffered while resolution pending. [Baeldung](https://www.baeldung.com/linux/arp-settings)
- `locktime` (default 1 s) — hysteresis to prevent cache thrashing on conflicting entries. [Linux Man Pages](https://linux.die.net/man/7/arp)

OpenStack Neutron's documentation (Ubuntu Launchpad bug #1780348) explicitly recommends bumping these to `1024/2048/4096` or `16384/28672/32768` for cloud hosts running multiple namespaces, because Linux's neighbor table is **not namespaced** for sizing purposes — every namespace shares the global hash table. The legacy userland tools are `arp` (deprecated) and `ip neighbour` (modern). The userspace `arpd` daemon exists for very large hosts. [Ubuntu](https://bugs.launchpad.net/bugs/1780348)

**BSD.** Has had ARP since 4.2BSD (1983); the current implementations are in `sys/netinet/if_ether.c` (FreeBSD/macOS/OpenBSD/NetBSD). BSD invented `route -n monitor` and the `arp` userland tool that everyone copied.

**Windows.** Vista and later use the unified neighbor cache modeled on RFC 4861 — same state machine for IPv4 and IPv6. Reachable time is computed from `BaseReachableTime` × random[0.5,1.5] = 15–45 s by default. Pre-Vista (XP/2003) used `ArpCacheLife` and `ArpCacheMinReferencedLife` registry knobs; these are obsolete on modern Windows. Userland: `arp -a`, `netsh interface ipv4 show neighbors`. [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/address-resolution-protocol-arp-caching-behavior)

**Cisco IOS / IOS-XE.** Default ARP timeout 4 hours (14400 s); per-interface tunable via `arp timeout <seconds>`. Dynamic ARP Inspection, IP Source Guard, and per-VLAN proxy ARP are configured at the interface or VLAN level.

**Juniper Junos.** ARP table is shared across logical systems; default aging 20 minutes. EVPN proxy ARP and ARP suppression on QFX/MX since Junos 17.2R1 (MX/EX9200) and 17.3R1 (QFX10000). Documented at juniper.net/documentation under "EVPN Proxy ARP and ARP Suppression." [Juniper Networks](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn-proxy-arp-support.html)

**FRRouting.** Open-source routing stack. EVPN ARP/ND suppression is a kernel feature (`bridge_slave neigh_suppress on`), with FRR's `zebra` daemon distributing learned bindings via BGP EVPN Type-2 routes. [FRRouting](https://docs.frrouting.org/en/latest/vrrp.html)[FRRouting](https://docs.frrouting.org/en/latest/evpn.html)

**VyOS, Open vSwitch.** Commodity open-source switches; OVS supports ARP responder flows (used heavily by OpenStack Neutron and Nicira/VMware NSX) where the controller pre-populates ARP responses in the flow table.

**AWS VPC.** AWS published in their *Logical Separation on AWS* whitepaper that "while ARP packets trigger an authenticated database look-up, ARP packets never hit the network as they are not needed for discovery of the virtual network topology." The hypervisor virtual switch synthesizes ARP replies from the central VPC mapping service. Consequence: ARP spoofing is not possible inside a VPC; transitive routing is forbidden; broadcast and multicast are dropped (multicast partially restored via Transit Gateway multicast as of 2020). EC2 instances cannot send packets with a source MAC other than the assigned ENI MAC — the hypervisor drops them. [AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/vpc-and-accompanying-features.html)

**Azure** uses an OpenFlow-based virtual switch (VFP) with very similar semantics: synthesized ARP, no broadcast, MAC pinning.

**GCP** uses Andromeda; same family.

**Hyperscale numbers.** RFC 6820 (2013) called out that data-center ToR switches and edge routers spend significant CPU on ARP/ND when neighbor counts cross the **10⁴–10⁵ per-segment** threshold. Modern data-center switch silicon (Broadcom Tomahawk, Trident, Jericho) supports neighbor tables in the ~100K–500K range; EVPN ARP suppression pushes the burden into the BGP control plane, where 1M-route scale is normal.

**Carrier patterns.** Mobile operator GGSN/PGW hosts gateway IPs for millions of subscribers; ARP is essentially never used because traffic comes off GTP tunnels with explicit next-hop forwarding. ISP edge routers running PPPoE never ARP customers either. ARP scale problems show up specifically in IXP (Internet Exchange) peering LANs with 1500+ peers on one shared VLAN — RFC 9161 EVPN proxy-ARP is one solution; per-port ARP-rate-limiting is the bandaid most IXPs use today.

---

## 6. Failure modes and famous incidents

**ARP cache exhaustion (`neighbor table overflow`).** The single most common Linux ARP-related production failure, especially in OpenStack and Kubernetes hosts running many network namespaces. Symptom: `dmesg` floods with `neighbour: arp_cache: neighbor table overflow!`, intermittent loss of connectivity to *some* peers, alarmingly random. Fix: raise `gc_thresh1/2/3`. Documented as Ubuntu/OpenStack bug 1780348 (2018, still relevant in 2026). [Ubuntu](https://bugs.launchpad.net/bugs/1780348)[nixCraft](https://www.cyberciti.biz/faq/centos-redhat-debian-linux-neighbor-table-overflow/)

**ARP spoofing / cache poisoning.** Disclosed publicly by Steve Bellovin in 1989 and weaponized in **Dug Song's `dsniff` suite** (1999), which included `arpspoof`, `dnsspoof`, `mailsnarf`, `urlsnarf`, `webmitm`, and `sshmitm`. The companion tool **Ettercap** (Ornaghi & Valleri, 2001) extended this with a GUI and bridged-mode interception. The "Firesheep era" (Eric Butler, October 2010) popularized session-cookie hijacking on coffee-shop Wi-Fi using ARP poisoning + HTTP sniffing — every IT publication ran an article and the practical attack accelerated industry adoption of HTTPS-everywhere. Note the underlying ARP weakness has no CVE because it is a *design* property of RFC 826 (no authentication), not an implementation bug; specific CVEs exist against switches that fail to enforce DAI properly and against host stacks that mishandle malformed ARP packets. [Wikipedia](https://en.wikipedia.org/wiki/DSniff)[Wikipedia](https://en.wikipedia.org/wiki/DSniff)

**arpwatch.** LBL's classic monitoring daemon (Lawrence Berkeley National Lab, originally Craig Leres). Watches ARP traffic and emails on every new IP↔MAC pair — still standard Tier-1 NOC tooling in 2026 because nothing has replaced its simplicity.

**AWS US-EAST-1, April 21, 2011.** Often called an "ARP storm" in lore but the published Amazon postmortem makes clear the root cause was a network change that misrouted EBS replication traffic onto a lower-capacity network, isolating EBS nodes; when traffic was restored, **all EBS nodes simultaneously tried to re-mirror**, exhausting cluster space. The L2 component is real (it was a network-change misconfiguration), but the lasting damage was a re-mirroring storm in the storage layer, not a strict ARP storm. The 4-day outage took down Reddit, Quora, Foursquare, Heroku, and Hootsuite. (Source: Amazon's *Summary of the Amazon EC2 and Amazon RDS Service Disruption*.)

**AWS US-EAST-1, June 29, 2012.** Power loss in one AZ caused EC2/EBS recovery to bottleneck on a server-boot bottleneck and inconsistent EBS volumes. Again, popularly described as having "ARP/L2 issues" but Amazon's published RCA points at power, datastore failover, and boot-time bottlenecks, not ARP per se. [Amazon Web Services](https://aws.amazon.com/message/67457/)

**Cloudflare incidents 2024–2026.** No major Cloudflare outage in this window has been publicly attributed to ARP or gratuitous ARP. The September 17, 2024 incident was a BGP withdrawal due to an Addressing-team configuration error; June 20, 2024 was a DDoS-mitigation latent-bug issue; June 27, 2024 was BGP RPKI/route-leak; the November 18, 2025 event was a Bot Management feature-file generation bug. Worth flagging because the lore often blames "ARP storms" for cloud outages that actually have other root causes. [Cloudflare + 3](https://blog.cloudflare.com/cloudflare-incident-on-september-17-2024/)

**VRRP/HSRP failover ARP issues** (Lindsay Hill, "War Stories: Gratuitous ARP and VRRP," lkhill.com). A real, recurring class of bug: switch CAM tables age out the virtual MAC because regular VRRP advertisements use the *physical* source MAC, not the virtual one; downstream switches then *flood* unicast frames destined to the virtual MAC across the segment. Huawei issued patches that emit periodic gratuitous ARPs every 60 s from the master to keep CAMs fresh; Cisco/Nokia have similar mechanisms. Asymmetric-routing firewall policies that drop the virtual-IP source make this particularly nasty. [Lindsay Hill](https://lkhill.com/war-stories-gratuitous-arp-and-vrrp/)[Lindsay Hill](https://lkhill.com/war-stories-gratuitous-arp-and-vrrp/)

**EVPN ARP suppression breaking application keepalives** (APNIC blog, December 2021). Cluster software (some HA database products were named) uses broadcast ARP requests as cheap inter-node liveness checks. EVPN ARP suppression converts these into local proxy responses — every node sees its peers as "alive" forever, fencing fails to fire, split-brain ensues. The fix: configure ARP suppression to honor probes (SPA=0.0.0.0) and to selectively forward gratuitous ARP, or to flood ARP at low rate.

**iOS 14 malformed ARP replies.** Cisco Meraki documented iOS 14 sending ARP replies that carried the *hardware* MAC instead of the randomized per-SSID MAC, producing false duplicate-IP alarms on enterprise networks. Fixed in subsequent iOS minor releases. [Cisco Meraki](https://documentation.meraki.com/General_Administration/Cross-Platform_Content/Meraki_and_MAC_Address_Randomization)

**Linux kernel ARP CVEs.** Specific high-profile examples include CVE-2008-2729, CVE-2012-3552 (race conditions), and various ones in the broader netfilter/neigh path; no single ARP CVE has been catastrophic in 2024–2026 in the mold of CVE-2024-1086 (netfilter use-after-free, exploited in ransomware per CISA KEV October 2025) — but the volume of kernel CVEs has exploded since the kernel became a CNA on Feb 13, 2024 (3,529 in 2024 alone, per CIQ), so the operational story is "patch faster," not "ARP is broken." [Sysdig](https://www.sysdig.com/blog/detecting-cve-2024-1086-the-decade-old-linux-kernel-vulnerability-thats-being-actively-exploited-in-ransomware-campaigns)[CIQ](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)

---

## 7. Fun facts and anecdotes

- **The 28-byte packet trivia.** ARP-over-IPv4-over-Ethernet is exactly 28 bytes, padded to 60 bytes (64 with FCS) by the NIC. Roughly the size of two IPv6 addresses.
- **HLEN/PLEN are variable on purpose.** Plummer, RFC 826: *"Generalizations have been made which allow the protocol to be used for non-10Mbit Ethernet hardware. Some packet radio networks are examples of such hardware."* The protocol was *designed* to outlive Ethernet; it has — Token Ring and FDDI are dead, ATM is dead, but ARP still rides 100 GbE. [IETF](https://datatracker.ietf.org/doc/html/rfc826)
- **The "ARP hack" was named by its inventors.** RFC 1027 (Carl-Mitchell & Quarterman, 1987): *"an ARP-based method (commonly known as 'Proxy ARP' or the 'ARP hack') was chosen."* It was always known to be a kludge, even in 1987. [Muonics](https://www.muonics.com/rfc/rfc1027.php)
- **ARP-as-keepalive is a real thing.** Many HA cluster stacks use broadcast ARP as cheap heartbeats. EVPN ARP suppression breaks them silently. The APNIC article's language ("plenty of things... developers became over-reliant on the fact the network will just deliver anything they put on the wire") is the cleanest summary. [APNIC Blog](https://blog.apnic.net/2021/12/01/arp-problems-in-evpn/)
- **The "layer 2.5" debate.** RFC 826 places ARP in the link layer. RFC 1122 §2.3.2.1 also discusses ARP in its link-layer section. Stevens (1994) put it in the data-link layer; Fall & Stevens (2nd ed., 2011) introduce the phrase "an intermediate layer 2.5." Cisco documentation oscillates between L2 and L2.5 depending on the document. The pragmatic answer: ARP is L2 because it has an EtherType, no IP header, and isn't routed; ARP is L3-aware because it carries IP addresses as data. Both are correct; arguing about it is what networking dinner conversations are made of. [Networkbulls](https://www.networkbulls.com/ask/why-arp-called-a-layer-25-protocol)
- **RFC 1149 (April Fools', 1990) and ARP.** RFC 1149 ("IP datagrams on avian carriers") doesn't define an ARP equivalent — pigeons are presumed to know each other. The Bergen Linux User Group implemented IPoAC for real on April 28, 2001, with 4 of 9 packets returning, RTTs of 53 minutes to ~1h46m. RFC 2549 (1999) added QoS classes; RFC 6214 (2011) added IPv6 support. The lore is that the 55% packet loss rate matches some early municipal ADSL providers. [Grokipedia](https://grokipedia.com/page/IP_over_Avian_Carriers)
- **The DCP/Dave Plummer mixup.** Two completely separate Plummers. **David C. Plummer (Symbolics, MIT-MC)** wrote RFC 826 in 1982 at age — well, sometime in his 20s/30s, working on Lisp Machines at the same Symbolics that gave the world ZetaLisp and registered symbolics.com on March 15, 1985 (the first .com domain ever). **David William "Dave" Plummer (born 1968, Regina, Saskatchewan)** wrote Windows NT Task Manager at Microsoft starting 1993, runs the *Dave's Garage* YouTube channel since 2018. Conflating them is one of the easiest fact-checks to fail. The original RFC 826 explicitly lists `DCP@MIT-MC` and Symbolics's address (243 Vassar Street, Cambridge MA) — both unmistakably the *first* Plummer. [Wikipedia + 3](https://en.wikipedia.org/wiki/Symbolics)
- **The Symbolics connection to .com.** symbolics.com was registered March 15, 1985 — the first ever .com domain. The same company employed RFC 826's author. Two separate networking firsts, same company.
- **GARP ≠ Gratuitous ARP.** IEEE 802.1's "Generic Attribute Registration Protocol" was renamed MRP in 802.1ak. The acronym collision with "Gratuitous ARP" is real; in mailing list archives you can find IETF participants requesting that "GARP" never be used as shorthand for gratuitous ARP for this exact reason.

---

## 8. Practical wisdom

### Tuning

- **Linux server in a busy DC**: bump `net.ipv4.neigh.default.gc_thresh1=4096`, `gc_thresh2=8192`, `gc_thresh3=16384`. Mirror for IPv6: `net.ipv6.neigh.default.gc_thresh{1,2,3}`.
- **Linux router/NAT**: same thresholds higher; consider `gc_stale_time=3600` to reduce revalidation churn. Ubuntu/Canonical openstack-charms' default is `1024/2048/4096`.
- **Enterprise WAN edge**: lower `arp timeout` from Cisco's default 14400 s to ~300 s if you have rapid IP churn from VPNs.
- **VRRP/HSRP**: ensure periodic gratuitous ARP is on (Cisco `standby preempt`/`vrrp accept-mode`; Junos `failover-delay`) so switch CAM tables don't age the virtual MAC.

### Defaults to be skeptical of

- Linux's `gc_thresh3=1024` on any host with more than ~700 neighbors will silently drop traffic. Always raise it on cloud hosts.
- Cisco's 4-hour ARP timeout is *longer* than the typical CAM table aging (5 minutes), which will make hosts flood unicast frames after 5 minutes of silence. Either match them or accept the flooding.
- "Gratuitous ARP" is sometimes filtered by overzealous switch DAI configuration. Verify DAI doesn't drop probes (SPA=0).

### What to monitor

- `cat /proc/net/arp | wc -l` and compare to `gc_thresh3`.
- `ip -s neighbor show` for failure counts.
- Switch interface counters for unknown-unicast flooding (rule of thumb: more than ~1% of traffic flooded means CAM/ARP timer mismatch).
- `arpwatch` for new MAC↔IP pairings — still the single highest-signal alert in a quiet enterprise.
- DAI deny counters: `show ip arp inspection statistics`.

### Production debugging

- **`ip neigh show`** — the modern tool; shows state (REACHABLE/STALE/DELAY/PROBE/FAILED).
- **`arp -an`** — legacy but universal; quick scan.
- **`arping <ip>`** — actively send an ARP request and time it (Linux's iputils-arping). Distinguishes "can't reach you" from "can reach you, app is broken."
- **`tcpdump -nn -e -i any 'arp'`** — see all ARP on a host. `-e` shows L2 addresses. Add `arp host 10.0.0.1` to filter.
- **Wireshark display filters**: `arp` (everything); `arp.opcode == 1` (requests); `arp.opcode == 2` (replies); `arp.src.proto_ipv4 == 0.0.0.0` (probes); `arp.duplicate-address-detected` (Wireshark's heuristic for conflicts). [Ask Wireshark](https://ask.wireshark.org/question/1506/display-arp-and-icmp-only/)
- **Scapy** for crafting test ARPs: `Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst="10.0.0.1")`.

### Common misconfigurations

- **Duplicate static IP** — RFC 5227 ACD will flag if both ends implement it; Linux logs `IPv4: 10.0.0.5 sent an invalid ARP reply` style messages.
- **Asymmetric proxy ARP** — one router proxies, another doesn't, so half the hosts learn the wrong MAC.
- **MAC flapping in EVPN** — same MAC seen on two different VTEPs, causing Type-2 route advertisement-withdrawal storms. RFC 9135 §7 specifies the mobility procedure. [IETF](https://datatracker.ietf.org/doc/rfc9135/)
- **iOS-14-style malformed ARP replies** — produced false duplicate-IP alarms in enterprises until fixed.
- **NIC `promiscuous mode` plus a misconfigured bridge** — the bridge replies to ARP for IPs it shouldn't own, hijacking traffic accidentally.

---

## 9. Learning resources (current as of May 2026)

### Specifications (free, primary)

- **RFC 826** — Plummer, Nov 1982. The original. STD 37. [https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826) — *intro/intermediate; never updated.*
- **RFC 5227** — Cheshire, Apple, July 2008. ARP probe & announce, ACD. [https://datatracker.ietf.org/doc/html/rfc5227](https://datatracker.ietf.org/doc/html/rfc5227) — *intermediate; current.*
- **RFC 1027** — Proxy ARP. [https://datatracker.ietf.org/doc/html/rfc1027](https://datatracker.ietf.org/doc/html/rfc1027) — *intermediate; historical but still operative.*
- **RFC 4861** — IPv6 Neighbor Discovery. [https://www.rfc-editor.org/rfc/rfc4861](https://www.rfc-editor.org/rfc/rfc4861) — *advanced; many updates (5942, 6980, 7048, 7527, 7559, 8028, 8319, 8425, 9131, 9685, 9762, 9926).*
- **RFC 5798** (and **RFC 9568**, April 2024) — VRRPv3. [https://datatracker.ietf.org/doc/html/rfc5798](https://datatracker.ietf.org/doc/html/rfc5798) — *advanced; ⚡ 9568 is the current version since 2024.*
- **RFC 6820** — Address Resolution Problems in Large Data Center Networks. [https://datatracker.ietf.org/doc/html/rfc6820](https://datatracker.ietf.org/doc/html/rfc6820) — *advanced; problem-statement, set the stage for EVPN suppression.*
- **RFC 9131, 9135, 9047, 9161** — Gratuitous ND; EVPN IRB; ARP/ND flag propagation; proxy-ARP/ND in EVPN. — *all 2021, current; advanced.* [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC9131)[IETF](https://datatracker.ietf.org/doc/rfc9047/)
- **RFC 8925** — IPv6-Only Preferred DHCPv4 option. [https://datatracker.ietf.org/doc/rfc8925/](https://datatracker.ietf.org/doc/rfc8925/) — *intermediate; the wedge for IPv6-mostly networks.*
- **RFC 6775** — 6LoWPAN ND. [https://datatracker.ietf.org/doc/html/rfc6775](https://datatracker.ietf.org/doc/html/rfc6775) — *advanced.*
- **RFC 8302** — TRILL ARP/ND optimization. [https://tools.ietf.org/html/rfc8302](https://tools.ietf.org/html/rfc8302) — *advanced.*

### Books (latest editions)

- **Fall, Kevin R. & Stevens, W. Richard. *TCP/IP Illustrated, Volume 1: The Protocols*, 2nd Edition.** Addison-Wesley, 2011. ISBN 978-0-321-33631-6. ARP coverage in Chapter 4 of the 1st edition is folded into Chapter 4 of the 2nd ed., which integrates IPv4 and IPv6 throughout. *Status (May 2026): 2nd edition is still the latest. A 3rd edition has not been published.* — *intermediate to advanced.*
- **Kurose, James F. & Ross, Keith W. *Computer Networking: A Top-Down Approach*, 8th edition.** Pearson, 2021. ARP is in **§6.4.1 "Link-Layer Addressing and ARP."** A 9th edition is anticipated but not confirmed published as of May 2026 — verify before assigning. — *intro/intermediate.* [Slideshare](https://www.slideshare.net/slideshow/computer-networking-a-top-down-approach-8th-edition-james-f-kurose/276851288)
- **Tanenbaum, A. S., Feamster, N., & Wetherall, D. *Computer Networks*, 6th edition.** Pearson, 2021. — *intro/intermediate; broader networking textbook.*
- **Hagen, S. *IPv6 Essentials*, 3rd ed.** O'Reilly, 2014 — *intermediate; outdated for post-2024 NDP additions.*

### Engineering blogs (2024–2026 currency)

- **APNIC Blog: "ARP problems in EVPN"** (Dinesh Dutt et al., December 2021; still the single best operational deep-dive). [https://blog.apnic.net/2021/12/01/arp-problems-in-evpn/](https://blog.apnic.net/2021/12/01/arp-problems-in-evpn/) — *intermediate.*
- **RIPE Labs: "Deploying IPv6-Mostly Access Networks"** (Ondřej Caletka, 2022, plus 2024–2026 updates). [https://labs.ripe.net/](https://labs.ripe.net/) — *intermediate; current.*
- **AWS Architecture & Networking Blogs** — VPC ARP synthesis explained in *Logical Separation on AWS* whitepaper. [https://docs.aws.amazon.com/whitepapers/latest/logical-separation/vpc-and-accompanying-features.html](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/vpc-and-accompanying-features.html)
- **ipSpace.net (Ivan Pepelnjak)** — multiple posts on AWS VPC, EVPN ARP, DC fabric design. [https://blog.ipspace.net/](https://blog.ipspace.net/) — *advanced; opinionated, accurate.*
- **Cloudflare blog** — for incident postmortems (2024–2026 archive at [https://blog.cloudflare.com/tag/outage/](https://blog.cloudflare.com/tag/outage/)). Note: 2024–2026 outages were *not* ARP-related; useful for understanding modern data-center architecture.
- **Lindsay Hill, "War Stories: Gratuitous ARP and VRRP"** (lkhill.com) — *intermediate; the canonical "CAM table aging vs gratuitous ARP" story.*
- **Juniper Networks documentation: EVPN Proxy ARP and ARP Suppression.** [https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn-proxy-arp-support.html](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn-proxy-arp-support.html) — *advanced; vendor.*
- **Cisco Press, *VXLAN BGP EVPN Enhancements***. [https://www.ciscopress.com/articles/article.asp?p=2803865](https://www.ciscopress.com/articles/article.asp?p=2803865) — *advanced.*

### YouTube and video (verify currency)

- **Ben Eater** — packet-switched networking series (2021–onward). The "Networking" playlist covers ARP at the wire level by hand. [https://www.youtube.com/@BenEater](https://www.youtube.com/@BenEater) — *intro; evergreen.*
- **Computerphile** — multiple ARP/IP videos. — *intro.*
- **NetworkChuck** — ARP poisoning and DAI demos (2023–2025). — *intro/intermediate.*
- **Dave's Garage** (Dave Plummer the Microsoft engineer, *not* RFC 826's author). [https://www.youtube.com/c/DavesGarage](https://www.youtube.com/c/DavesGarage) — covers Windows internals and 10 GbE home networking; **does not have a video specifically on RFC 826** as of May 2026 (per channel search). The disambiguation matters: people watch his channel expecting RFC 826 origin stories and don't get them.
- **CS144 lectures (Stanford), Philip Levis & Nick McKeown.** Full course on YouTube; ARP appears in the link-layer lectures. [https://cs144.github.io/](https://cs144.github.io/)

### University courses (course numbers)

- **Stanford CS144 — Introduction to Computer Networking** (Levis/McKeown). Materials publicly available; the lab assignments build a TCP/IP stack from scratch — Checkpoint 5 is "implement an ARP-using NetworkInterface." [https://cs144.github.io/](https://cs144.github.io/) [CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- **MIT 6.829 — Computer Networks** (Hari Balakrishnan). Graduate, advanced.
- **Princeton COS 461 — Computer Networks** (Jennifer Rexford). [https://www.cs.princeton.edu/courses/archive/spring24/cos461/](https://www.cs.princeton.edu/courses/archive/spring24/cos461/)
- **UC Berkeley CS168 — Introduction to the Internet: Architecture and Protocols.** Undergraduate; 2024 materials online.
- **CMU 15-441/641 — Computer Networks.** Multi-decade course; covers ARP in link-layer module.

### Podcasts

- **Packet Pushers / Heavy Networking** — search "ARP" or "EVPN ARP suppression"; long-form interviews.
- **Packet Pushers IPv6 Buzz** — "IPB168: Deploying IPv6-Only Wi-Fi at the SC24 Conference" (2024) is a great real-world case for RFC 8925 / ARP retirement.
- **History of Networking podcast** (Russ White, Donald Sharp) — multiple episodes on Ethernet, BGP, EVPN; ARP origin stories appear.

### Hands-on tools

- **Wireshark** — [https://www.wireshark.org/](https://www.wireshark.org/). Display-filter reference at [https://www.wireshark.org/docs/dfref/](https://www.wireshark.org/docs/dfref/). Free.
- **tcpdump** — `tcpdump -e -nn arp` is the universal one-liner.
- **Scapy** — Python; `from scapy.all import Ether, ARP, sendp`. Best tool for crafting weird ARPs.
- **arping** — Linux iputils, also Thomas Habets' standalone version.
- **packetlife.net cheat sheets** — ARP, NDP, VRRP one-pagers.
- **Containerlab** (Nokia) — declarative network lab with FRR/SR Linux nodes; ideal for testing EVPN ARP suppression locally. [https://containerlab.dev/](https://containerlab.dev/)
- **GNS3 / EVE-NG** — virtual network labs running real vendor images.
- **Mininet / mininet-wifi** — for academic-style switching/ARP experiments.

---

## 10. Where things are heading (2025–2026 frontier)

**ARP is not being deprecated.** RFC 826 / STD 37 is still STD 37 in May 2026 with no obsoleting RFC in sight. The protocol is too embedded in IPv4 to remove without removing IPv4 itself, and IPv4 has not gone away. What *is* happening:

1. **IPv6-mostly is going mainstream.** RFC 8925 (DHCP option 108, IPv6-Only Preferred), combined with RFC 8781 (PREF64 in RAs) and 464XLAT (RFC 6877), lets a single SSID/VLAN serve dual-stack laptops *and* IPv6-only-capable phones simultaneously, with the IPv6-only-capable hosts **never running ARP**. Apple iOS/macOS, Android, and recent macOS (12.0.1+) all request option 108 by default; Windows is the laggard (CLAT in cellular only as of 2025; expanding). The IETF v6ops working group has `draft-ietf-v6ops-6mops-07` (March 2026) on track to become an RFC. Practical effect: every IPv6-mostly device retired from ARP by IPv6-only operation is one less ARP-cache entry on every router on the segment — a real and measurable scale win for IXPs and large campuses. [LACNIC Blog + 3](https://blog.lacnic.net/en/ipv6-mostly-frontier/)
2. **EVPN proxy-ARP/ND is becoming the data-center default.** RFC 9135, 9047, 9161 (all 2021) are now table-stakes features in Arista EOS, Cisco NX-OS/IOS-XE, Juniper Junos, Nokia SR Linux, FRRouting/SONiC. The flood-and-learn era is ending in greenfield DC builds. ARP packets stop at the leaf switch; the BGP EVPN control plane carries the bindings. RFC 9135's mobility procedures (gratuitous ARP on move, ARP probe to confirm) are the new "operational ARP."
3. **MAC randomization changes ARP-cache assumptions.** ⚡ The 2024–2026 window saw iOS 18 / iPadOS 18 / macOS Sequoia 15 introduce "Rotate Wi-Fi Address" (rotating per-SSID MAC every ~14 days for weak/open networks), on top of the per-SSID private MAC introduced in iOS 14 / Android 10. This has subtle effects: MAC-based DHCP reservations break; captive-portal "remember me" breaks; ARP caches age MAC entries that would have lasted forever before; RADIUS MAB authentication is unreliable for consumer devices. Enterprises are responding with **Hotspot 2.0 / Passpoint** profiles that authenticate at the WPA3 layer rather than the MAC layer, and with EAP-based identity rather than MAC. [ANTlabs + 4](https://www.antlabs.com/advisories/advisory-ios-18-mac-randomization-what-it-means-for-your-hotel-wi-fi-2/)
4. **DETNET / TSN.** Deterministic networking (IEEE 802.1Qbv, 802.1AS, IETF DETNET WG) for industrial and audio-video applications uses pre-configured paths and resource reservation; ARP still happens but is decoupled from real-time scheduling. Expect more standardized "static ARP via NETCONF/YANG" in this space.
5. **SDN/EVPN replacing flood-and-learn.** SONiC, Aruba CX, and disaggregated NOS deployments increasingly assume EVPN control plane from day one. The legacy "MAC moves due to spanning-tree change → flooded unicast → CAM-table churn → broken VRRP failover" failure family is going away, replaced by EVPN-specific failure modes (Type-2 route storms on MAC mobility, asymmetric IRB inconsistencies) that are documented in RFC 9135 itself.
6. **SEND remains stillborn.** RFC 3971 SEND with CGAs and RPKI-anchored certificates would solve NDP spoofing the way DNSSEC solves DNS spoofing. NIST SP 800-119 §5.4.3 acknowledged in 2010 that it isn't deployed; nothing has changed in 2024–2026. The pragmatic alternatives — RA-Guard (RFC 6105/7113), DHCPv6-Shield (RFC 7610), ND inspection on switches — are what people actually deploy.
7. **Active drafts touching ARP-like behavior** (May 2026 IETF datatracker):

- `draft-ietf-v6ops-6mops` — IPv6-Mostly operational guidance.
- `draft-ietf-v6ops-claton` — CLAT node behavior recommendations.
- `draft-ietf-bess-evpn-proxy-arp-nd` updates — operational proxy-ARP/ND.
- `draft-ietf-6lo-rfc6775-update` — 6LoWPAN ND registration extensions.
- Various BESS WG drafts on EVPN MAC/IP route handling.

**Net assessment:** ARP itself is not changing — its 28-byte wire format will outlive most current engineers. What's changing is *where* ARP runs, *how often* it's allowed to broadcast, and *who* answers it. Centralized control planes (EVPN BGP, VPC mapping services, OVS controllers) are eating the broadcast resolution model from below; IPv6-mostly is killing ARP for an increasing share of devices from above.

---

## 11. Hooks for the article, infographic, and podcast

### 60-second narrated hook (for the ear)

> *In November 1982, a Symbolics engineer named David Plummer typed up an eleven-page document at MIT, sent it from the address `DCP@MIT-MC`, and registered it as Request for Comments 826. It was a fix for a small problem: when an Ethernet card sees a 32-bit IP address, how does it figure out which 48-bit hardware address to send the frame to? Plummer's answer was to broadcast a question — "who has 192.168.1.1?" — and let the rightful owner reply.*
> *Forty-four years later, every video call you've ever made, every web page you've ever loaded over Wi-Fi, every car-to-cloud telemetry packet from a Tesla — has begun, somewhere on the wire, with that exact question. Plummer's protocol has never been replaced. It's still RFC 826. It's still 28 bytes. And it's still trusted by default, which is why ARP is also the basis of every coffee-shop man-in-the-middle attack from the past two decades. Today we'll trace ARP from a Lisp Machine in Cambridge to an EVPN data-center fabric in 2026 — what it gets right, where it bleeds, and why the people trying to retire it have to pry it from the cold dead hands of every router still running IPv4.*

### Striking statistic

In a 2013 IETF problem statement (RFC 6820, "Address Resolution Problems in Large Data Center Networks"), the IETF acknowledged that broadcast ARP scales sublinearly: at the **10⁴–10⁵ neighbors per L2 domain** range, ARP alone consumes meaningful router CPU. By 2020, every major hyperscaler had abandoned flood-and-learn in favor of synthesized ARP responses. AWS published in their Logical Separation whitepaper that "ARP packets never hit the network as they are not needed for discovery of the virtual network topology" — every single ARP request inside a VPC is intercepted and answered by the hypervisor from an authenticated central database. ARP's broadcast model didn't survive the cloud era; the protocol survived only by being virtualized away.

### Pause-and-think moment

RFC 5227 (Cheshire, 2008) section 1.2 contains a meditation on what an "innocent question" means in a networking protocol: *"Some readers pointed out that it is probably impossible to ask any truly pure question; asking any question necessarily invites speculation about why the interrogator wants to know the answer. Just as someone pointing to an empty seat and asking, 'Is anyone sitting here?' implies an unspoken '... because if not then I will,' the same is true here. An ARP Probe with an all-zero 'sender IP address' may ostensibly be merely asking an innocent question ('Is anyone using this address?'), but an intelligent implementation that knows how IPv4 Address Conflict Detection works should be able to recognize this question as the precursor to claiming the address."* This is one of the rare RFCs that reads like philosophy. Pause here: a protocol designer in 2008 had to anticipate that two well-behaved hosts could ask the same innocent question at the same time, and built in a tiebreaker. ARP isn't just a wire format — it's a social contract.

### Failure-story arc (setup → mistake → consequence → resolution)

**Setup.** A large enterprise migrates from HSRP to VRRP on its core routers because their new vendor doesn't support Cisco's proprietary HSRP. They schedule a maintenance window, plan to flip the configuration, and assume the gratuitous ARP from the new VRRP master will retrain switch CAM tables and host ARP caches in seconds.

**Mistake.** They didn't realize the old HSRP virtual MAC (`00:00:0C:07:AC:xx`) and the new VRRP virtual MAC (`00:00:5E:00:01:xx`) are *different* MACs for the same virtual IP. Hosts on the network keep their old ARP cache entries pointing to the HSRP MAC; switches still have the HSRP MAC in their CAM tables; and a firewall in the path was configured to drop traffic from the new VRRP physical IPs because they hadn't been added to the source-IP allowlist.

**Consequence.** During the cutover, every host on the LAN sends packets to the HSRP MAC, which is now unowned. Switches flood those frames. The new VRRP master sends gratuitous ARPs but only the hosts whose ARP entries had aged out actually update; long-lived entries (Cisco IOS hosts with the 4-hour timer) keep sending to a ghost. Application connections silently freeze. A 4-minute "we'll see slight blip" maintenance window stretches to 47 minutes of partial outage, with a bonus split-brain where some hosts reach the right router and others don't.

**Resolution.** The team manually clears ARP caches on critical servers (`ip neigh flush dev eth0`), updates the firewall ACL to permit the new VRRP physical IPs (so the periodic VRRP advertisements fire and hosts re-learn), and shortens the ARP timer to 5 minutes going forward to bound the worst case. They write a runbook: every L2 redundancy protocol change must include (a) confirming the physical-IP allowlists on every L3 hop, (b) shortening ARP timers in advance, (c) sourcing periodic gratuitous ARPs from the master, and (d) staging the change behind a maintenance window long enough that the worst-case ARP timer can expire naturally. This is the lesson Lindsay Hill writes up at lkhill.com under "War Stories: Gratuitous ARP and VRRP" — and it is the specific class of problem that EVPN's BGP control plane was designed to eliminate.

---

## Caveats

- **The DCP/Dave Plummer disambiguation is critical.** Multiple aggregator websites and student wikis confuse the two; the only definitive evidence is RFC 826's own contact line (`DCP@MIT-MC` and Symbolics, 243 Vassar Street, Cambridge MA), the symbolics.com / Lisp Machine company's history, and the *Dave's Garage* Plummer's own bio confirming he was 14 years old in November 1982. Anyone who asks "Dave Plummer to interview him about RFC 826" is going to get redirected; he didn't write it.
- **AWS US-EAST-1 outages are routinely mis-attributed to ARP.** Amazon's published RCAs (April 2011, June 2012) describe re-mirroring storms, power/datastore failover, and control-plane bottlenecks — not ARP storms in the strict sense. The 2024–2026 Cloudflare outages (June, September 2024; March, June, November, December 2025; February 2026) have all been attributed by Cloudflare's own postmortems to BGP, R2 storage credentials, ML feature-file generation, and similar — *not* to ARP or gratuitous ARP. Lore is louder than RCAs; rely on the postmortems.
- **"Layer 2.5" is opinion, not standard.** RFC 826 and RFC 1122 place ARP in the link layer. Stevens 1st edition agreed; Fall & Stevens 2nd edition introduced the 2.5 phrasing as a teaching device. Either answer is defensible; expect interview disagreement.
- **Linux kernel CVE volumes since Feb 2024 are misleading.** The kernel project's decision to be its own CNA created a 10× spike in CVE counts (3,529 in 2024 per CIQ analysis) without a corresponding increase in actual exploitable bugs. Filtering by CISA KEV or NVD-confirmed exploitation is the right way to triage. No 2024–2026 CVE has had ARP as a root cause at the level of CVE-2024-1086 (netfilter UAF, exploited in ransomware campaigns).
- **EVPN ARP suppression behavior varies by vendor.** RFC 9135 specifies symmetric and asymmetric IRB; in practice Cisco IOS-XR and Juniper Junos default to *different* models (symmetric for IOS-XR, asymmetric for older Junos). Verify before assuming portable behavior.
- **MAC randomization defaults differ across iOS/Android versions.** iOS 14–17: per-SSID fixed private MAC. iOS 18+: rotating mode for weak/open networks (every ~14 days), fixed for WPA2+. Android 10+: per-SSID by default; Android 11+ optional global non-persistent in developer options. Windows 10/11: per-SSID optional, off by default for managed devices. Don't assume any single behavior.
- **MAC address scale.** EUI-48 (48 bits, ≈281 trillion addresses) was thought inexhaustible in 1982. With ubiquitous virtualization, container networks, and randomization, the OUI-allocated portion is now under measurable pressure; IEEE Std 802c-2017 introduced "Standard Local Area MAC Address" (SLAP) ranges for locally-administered MACs. Watch this space.
- **Some claims I could not verify from primary sources** (kept honest):
  - Specific bit-level layout of certain Cisco proprietary HSRP timers `[needs source]`.
    - The exact hop count and packet loss of the Bergen Linux User Group's IPoAC implementation come from the Wikipedia and Grokipedia summaries (55% loss, 4 of 9 packets), which cite the original CPIP project page; those numbers are widely repeated but the primary CPIP page is no longer reliably online — treat as probably-accurate folklore rather than rigorously verified data.
    - Plummer's exact age in 1982 and his role at Symbolics beyond being an employee `[needs source]` — RFC 826 confirms only his title (employee at Symbolics, 243 Vassar St) and his MIT-MC mailbox.

ARP is one of those protocols where the deeper you look, the more the seams of the early Internet show through: Symbolics Lisp Machines, Xerox PARC Ethernet, the IEN-to-RFC transition, the casual confidence of 1982 that "we'll trust each other on the LAN." Forty-four years later we're still patching that trust assumption with DAI, EVPN suppression, and IPv6-mostly retirement. ARP isn't going away. It just spends more and more of its time being intercepted, suppressed, or respectfully bypassed.