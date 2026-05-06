---
prompt_source: deep-research-prompts.txt:1037-1215 (PROTOCOL · Ethernet)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/d36f396a-5b19-406f-9a0a-94292c142ce2
research_mode: claude.ai Research
---

# Ethernet: A Deep Research Report (May 2026)

## Prerequisites and glossary

To make Ethernet make sense, define these first:

- **OSI / TCP-IP stack**: Layered model of networking. Ethernet lives at Layer 1 (physical) and Layer 2 (data link) of the OSI model; in the TCP/IP four-layer model it is the "link layer." ([https://en.wikipedia.org/wiki/OSI_model](https://en.wikipedia.org/wiki/OSI_model))
- **Frame**: The Layer 2 unit of transmission. Ethernet frames carry MAC addresses, an EtherType, payload, and a checksum. ([https://en.wikipedia.org/wiki/Ethernet_frame](https://en.wikipedia.org/wiki/Ethernet_frame))
- **Packet / datagram**: Layer 3 unit (e.g., IP packet) carried *inside* an Ethernet frame's payload.
- **MAC address**: 48-bit hardware address; the first 24 bits are the OUI assigned by IEEE Registration Authority. Two flag bits in the first byte: **I/G** (individual/group → unicast vs multicast; LSB of first byte) and **U/L** (universal/locally administered; second-LSB). ([https://en.wikipedia.org/wiki/MAC_address](https://en.wikipedia.org/wiki/MAC_address))
- **Header / payload / FCS**: Header = addressing/control, payload = upper-layer data, FCS = 32-bit CRC trailer for error detection. ([https://en.wikipedia.org/wiki/Ethernet_frame](https://en.wikipedia.org/wiki/Ethernet_frame))
- **MTU (Maximum Transmission Unit)**: Largest payload an interface accepts. Standard Ethernet MTU = 1500 bytes; "jumbo frames" typically = 9000 bytes (non-standard but ubiquitous). ([https://en.wikipedia.org/wiki/Jumbo_frame](https://en.wikipedia.org/wiki/Jumbo_frame))
- **Collision domain / broadcast domain**: A collision domain is the segment where two transmitters can interfere; a broadcast domain is where a broadcast frame reaches. Switches break collision domains; routers (or VLANs) break broadcast domains.
- **VLAN (Virtual LAN, IEEE 802.1Q)**: Logical L2 segmentation tagged into the frame using a 4-byte tag (TPID 0x8100, then 3-bit PCP, 1-bit DEI, 12-bit VID for up to 4094 VLANs). ([https://en.wikipedia.org/wiki/IEEE_802.1Q](https://en.wikipedia.org/wiki/IEEE_802.1Q)) [ScienceDirect](https://www.sciencedirect.com/topics/computer-science/virtual-local-area-network-tag)[JumpCloud](https://jumpcloud.com/it-index/what-is-802-1q)
- **Autonegotiation**: IEEE 802.3 mechanism in which two PHYs exchange capability pulses to choose the best common speed/duplex.
- **PHY / MAC / LLC**: PHY = physical-layer chip; MAC = media-access control sublayer; LLC = logical link control (IEEE 802.2, mostly historical for IP traffic). ([https://en.wikipedia.org/wiki/Physical_coding_sublayer](https://en.wikipedia.org/wiki/Physical_coding_sublayer))
- **PCS / PMA / PMD**: PHY sublayers — PCS does line coding/scrambling/FEC framing, PMA does serialization/deserialization, PMD is the optical/electrical interface. ([https://ethernetalliance.org/blog/2018/03/28/a-deep-dive-into-the-802-3bs-200gbase-r-and-400gbase-r-pcspma/](https://ethernetalliance.org/blog/2018/03/28/a-deep-dive-into-the-802-3bs-200gbase-r-and-400gbase-r-pcspma/)) [Wikipedia](https://en.wikipedia.org/wiki/Physical_coding_sublayer)
- **SFP / QSFP / QSFP-DD / OSFP**: Pluggable optical/electrical transceiver form factors. SFP = 1×lane, QSFP = 4×lane, QSFP-DD/OSFP = 8×lane (used for 400G/800G/1.6T). ([https://en.wikipedia.org/wiki/Small_Form-factor_Pluggable](https://en.wikipedia.org/wiki/Small_Form-factor_Pluggable))
- **Encoding schemes**: Manchester (10 Mbps), 4B/5B + MLT-3 (100BASE-TX), 8B/10B (1GbE), 64B/66B (10GbE+, including a 256B/257B transcode at 200/400G), PAM-4 (4-level pulse-amplitude modulation, 200G+/lane). ([https://en.wikipedia.org/wiki/Physical_coding_sublayer](https://en.wikipedia.org/wiki/Physical_coding_sublayer))
- **FEC (Forward Error Correction)**: Reed-Solomon codes RS(528,514) "KR4" (NRZ) and RS(544,514) "KP4" (PAM-4) target post-FEC BER ≤ 10⁻¹³. ([https://mapyourtech.com/rs-fec-reed-solomon-forward-error-correction/](https://mapyourtech.com/rs-fec-reed-solomon-forward-error-correction/))
- **CRC (Cyclic Redundancy Check)**: Polynomial-based checksum; Ethernet uses a 32-bit CRC in the FCS.
- **Handshake / autonegotiation**: Capability advertisement before the link comes up.
- **Stream**: A continuous reliable byte sequence (TCP) — *not* what Ethernet provides; Ethernet is best-effort frames.
- **Socket**: OS-level endpoint abstraction for sending/receiving data, ultimately bound to an Ethernet interface for L2 transmission.

## History and story

**The originating moment**: On **May 22, 1973**, Bob Metcalfe — a 27-year-old researcher at Xerox PARC who had finished his Harvard PhD by adapting work on the University of Hawaii's ALOHAnet — circulated a memo titled "Alto Ethernet" with hand-drawn diagrams of an "ETHER!" network linking PARC's Alto personal computers to share a high-speed laser printer ([https://www.computerhistory.org/tdih/may/22/](https://www.computerhistory.org/tdih/may/22/); [https://www.digibarn.com/collections/diagrams/ethernet-original/](https://www.digibarn.com/collections/diagrams/ethernet-original/)). Metcalfe named it after the discredited "luminiferous ether" because the medium could be coax, twisted pair, fiber, radio — anything ([https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/](https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/)). His insight, lifted from ALOHAnet but improved with carrier sense and binary exponential backoff: **listen before you talk**, and if you collide, back off randomly. [Wikipedia](https://en.wikipedia.org/wiki/Robert_Metcalfe)[Enterprise Networking Planet](https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/)

**The build**: Metcalfe recruited Stanford grad student **David Boggs**, and on **November 11, 1973** the first Ethernet ran at PARC at the famous **2.94 Mbps** (chosen because it matched the Alto's system clock divided down). By 1975 ~100 Altos at PARC were connected; the Alto / Ethernet / laser-printer trio became the prototype of the modern office computer ([https://amturing.acm.org/award_winners/metcalfe_3968158.cfm](https://amturing.acm.org/award_winners/metcalfe_3968158.cfm)). Metcalfe, Boggs, Chuck Thacker, and Butler Lampson filed the patent in 1975 (granted 1977). The seminal **Metcalfe & Boggs 1976 CACM paper, "Ethernet: Distributed Packet Switching for Local Computer Networks,"** introduced the term and the throughput model E = (P/C)/(P/C + W·T) ([https://cacm.acm.org/opinion/still-networking/](https://cacm.acm.org/opinion/still-networking/); [https://arxiv.org/abs/2603.19406](https://arxiv.org/abs/2603.19406)). [ACM + 3](https://amturing.acm.org/award_winners/metcalfe_3968158.cfm)

**Standardization (DIX → IEEE 802.3)**: After leaving Xerox in 1979 and founding **3Com**, Metcalfe brokered the **DIX consortium (DEC, Intel, Xerox)** to publish the 10 Mbps Ethernet "Blue Book" in 1980. IEEE Project 802 began the same year, but IBM (Token Ring) and General Motors (Token Bus) submitted competing proposals — which is why the IEEE assigned 802.3 to Ethernet, 802.4 to Token Bus, 802.5 to Token Ring ([https://www.computerweekly.com/news/252489944/How-Ethernet-became-the-worlds-networking-standard](https://www.computerweekly.com/news/252489944/How-Ethernet-became-the-worlds-networking-standard)). **IEEE 802.3 was published in 1983**. [Harvard SEAS](https://seas.harvard.edu/news/turing-award-honors-harvard-alum-bob-metcalfe-inventor-ethernet)[Computer Weekly](https://www.computerweekly.com/news/252489944/How-Ethernet-became-the-worlds-networking-standard)

**The Token Ring war (1980s–early 1990s)**: IBM's Token Ring (originated by Olof Soderblom, IBM Zurich) was technically arguably better — deterministic, no collisions, faster (16 Mbps to Ethernet's 10) — but it was IBM-controlled, royalty-burdened, and roughly 5× the cost ([https://www.networkworld.com/article/816207/lan-wan-ethernet-vs-token-ring.html](https://www.networkworld.com/article/816207/lan-wan-ethernet-vs-token-ring.html); [http://www.righto.com/2021/02/strange-chip-teardown-of-vintage-ibm-token-ring-controller](http://www.righto.com/2021/02/strange-chip-teardown-of-vintage-ibm-token-ring-controller)). The arrival of **10BASE-T (1990, IEEE 802.3i)** running over commodity unshielded twisted pair killed it. By 1995 the market had ~23.7 million Ethernet adapters shipped vs. 3.8 million Token Ring ([https://kenney.faculty.ucdavis.edu/wp-content/uploads/sites/332/2018/03/Sponsors-Communities-and-Standards_-Ethernet-vs.-Token-Ring-in-the-Local-Area-Networking-Business.pdf](https://kenney.faculty.ucdavis.edu/wp-content/uploads/sites/332/2018/03/Sponsors-Communities-and-Standards_-Ethernet-vs.-Token-Ring-in-the-Local-Area-Networking-Business.pdf)). [Network World + 2](https://www.networkworld.com/article/816207/lan-wan-ethernet-vs-token-ring.html)

**Speed history (canonical milestones)**:

- 1980: 10 Mbps DIX (10BASE5 "Thicknet" yellow garden-hose coax)
- 1985: 10BASE2 "Thinnet" / "Cheapernet"
- 1990: 10BASE-T (twisted pair)
- 1995: 100BASE-TX Fast Ethernet (802.3u)
- 1998–1999: 1000BASE-X / 1000BASE-T Gigabit (802.3z/ab)
- 2002: 10GbE (802.3ae)
- 2010: 40/100GbE (802.3ba)
- 2017: 200/400GbE (802.3bs)
- **2024: 800GbE — IEEE 802.3df-2024 approved Feb 16 2024, published March 2024** ([https://standards.ieee.org/ieee/802.3df/11107/](https://standards.ieee.org/ieee/802.3df/11107/); [https://en.wikipedia.org/wiki/Terabit_Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)) [Wikipedia](https://en.wikipedia.org/wiki/Terabit_Ethernet)
- **2025–2026: 1.6 TbE — IEEE P802.3dj** (200 Gb/s/lane SerDes; 3rd Working Group recirculation ballot closed Dec 16 2025 with 87% approval; expected completion 2026) ([https://grouper.ieee.org/groups/802/3/email_dialog/msg01764.html](https://grouper.ieee.org/groups/802/3/email_dialog/msg01764.html)) [Electronic Design](https://www.electronicdesign.com/technologies/communications/wired/ethernet/article/55267242/ethernet-alliance-how-emerging-ethernet-standards-will-propel-hyperscale-data-centers-and-ml-apps)[Ieee](https://grouper.ieee.org/groups/802/3/email_dialog/msg01764.html)

**Recent recognition**: **Bob Metcalfe received the 2022 ACM A.M. Turing Award** (announced March 2023) "for the invention, standardization, and commercialization of Ethernet" ([https://awards.acm.org/about/2022-turing](https://awards.acm.org/about/2022-turing)). David Boggs died in 2022. The 50th anniversary was celebrated at the Computer History Museum on May 22, 2023 ([https://computerhistory.org/press-releases/ethernet50/](https://computerhistory.org/press-releases/ethernet50/)). [ACM Awards + 2](https://awards.acm.org/about/2022-turing)

**What changed in the last 24 months (2024–2026)**:

- 802.3df-2024 (800GbE, 100G/lane) ratified Feb 2024.
- 802.3dj 200G/lane work moved through Working Group ballots; AI-driven 1.6 TbE timeline accelerated.
- **Ultra Ethernet Consortium 1.0 specification released June 11, 2025** (~560 pages) — the first major ground-up rethink of how Ethernet carries RDMA traffic ([https://ultraethernet.org/ultra-ethernet-consortium-uec-launches-specification-1-0-transforming-ethernet-for-ai-and-hpc-at-scale/](https://ultraethernet.org/ultra-ethernet-consortium-uec-launches-specification-1-0-transforming-ethernet-for-ai-and-hpc-at-scale/)).
- Broadcom **Tomahawk 6 (102.4 Tbps single-chip)** shipped June 2025; Tomahawk 6-Davisson with co-packaged optics shipped October 2025 ([https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html](https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html); [https://investors.broadcom.com/news-releases/news-release-details/broadcom-announces-tomahawkr-6-davisson-industrys-first-1024](https://investors.broadcom.com/news-releases/news-release-details/broadcom-announces-tomahawkr-6-davisson-industrys-first-1024)). [Nokia + 2](https://www.nokia.com/blog/nokia-celebrates-the-future-of-ai-networking-with-ultra-ethernet-consortium/)
- **NVIDIA Spectrum-X**, announced Computex 2024, deployed by xAI Colossus, Microsoft, CoreWeave; Spectrum-X1600 (102.4 Tbps) expected 2H 2026 ([https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)). [TrendForce](https://www.trendforce.com/insights/infiniband-vs-ethernet)
- **IEEE 802.1DG-2025** (TSN profile for automotive in-vehicle Ethernet) published ([https://1.ieee802.org/publication-ieee-802-1dg-2025/](https://1.ieee802.org/publication-ieee-802-1dg-2025/)). [Ieee802](https://1.ieee802.org/publication-ieee-802-1dg-2025/)[Ieee802](https://1.ieee802.org/publication-ieee-802-1dg-2025/)

## How it actually works

### Frame format (Ethernet II / DIX, the dominant variant)

```
[Preamble 7B][SFD 1B][Dest MAC 6B][Src MAC 6B][EtherType 2B][Payload 46–1500B][FCS 4B]   <-- "frame"
                                                                                  + IPG 96 bit-times
\___________________________________ packet on the wire ___________________________________/
```

- **Preamble (7 bytes)**: `0x55 0x55 0x55 0x55 0x55 0x55 0x55` — alternating 1010… for clock recovery ([https://en.wikipedia.org/wiki/Ethernet_frame](https://en.wikipedia.org/wiki/Ethernet_frame)). [ComputerNetworkingNotes](https://www.computernetworkingnotes.com/ccna-study-guide/ethernet-frame-format-explained.html)
- **SFD (Start Frame Delimiter, 1 byte)**: `0xD5` (10101011) — final bit flipped to 1 marks the next byte as the destination MAC. [GeeksforGeeks](https://www.geeksforgeeks.org/computer-networks/ethernet-frame-format/)
- **Destination MAC (6 bytes)**: `FF:FF:FF:FF:FF:FF` = broadcast; LSB of first byte = 1 → multicast group.
- **Source MAC (6 bytes)**: Always unicast (I/G bit must be 0).
- **EtherType / Length (2 bytes)**: ≤ 1500 (0x05DC) means "length" (IEEE 802.3 with LLC); ≥ 1536 (0x0600) means "EtherType" (Ethernet II). Notable values: **0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6, 0x8100 802.1Q VLAN tag, 0x88A8 802.1ad QinQ, 0x8847 MPLS unicast, 0x888E 802.1X EAPOL, 0x88E5 MACsec, 0x8892 PROFINET RT, 0x88CC LLDP** ([https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml](https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml); [https://en.wikipedia.org/wiki/EtherType](https://en.wikipedia.org/wiki/EtherType)). [Wikipedia + 2](https://en.wikipedia.org/wiki/Ethernet_frame)
- **Payload (46–1500 bytes)**: Padded to 46 if shorter. [OmniSecu](https://www.omnisecu.com/tcpip/ethernet-frame-format.php)[Liu](https://pike.lysator.liu.se/docs/ietf/rfc/08/rfc0894.xml)
- **FCS (4 bytes)**: CRC-32 (polynomial 0x04C11DB7) over Dest+Src+Type+Payload.
- **Interframe Gap (IFG)**: 96 bit times (12 bytes) of idle, e.g., 9.6 µs at 10 Mbps, 0.96 ns at 100 GbE. [Fiveable](https://fiveable.me/lists/ethernet-frame-structure-essentials)

A real on-the-wire byte sequence for an ARP "who has 10.0.0.2, tell 10.0.0.1" from `aa:bb:cc:00:00:01`:

```
Preamble/SFD:   55 55 55 55 55 55 55 D5
Dest MAC:       FF FF FF FF FF FF                   ; broadcast
Src  MAC:       AA BB CC 00 00 01
EtherType:      08 06                                ; ARP
ARP payload:    00 01 08 00 06 04 00 01              ; HW=Eth, Proto=IPv4, op=request
                AA BB CC 00 00 01 0A 00 00 01        ; sender MAC, sender IP
                00 00 00 00 00 00 0A 00 00 02        ; target MAC (unknown), target IP
Pad to 46:      00 × 18
FCS:            <CRC32>
```

### MAC addressing details

Bit 0 of byte 0 is the **I/G bit** (0=unicast, 1=multicast/broadcast); bit 1 is the **U/L bit** (0=universal/OUI-based, 1=locally administered) ([https://en.wikipedia.org/wiki/MAC_address](https://en.wikipedia.org/wiki/MAC_address)). The OUI (first 3 bytes) is purchased from IEEE; the lower 3 bytes (NIC specific) are assigned by the manufacturer.

### CSMA/CD — historical, now obsolete

Original Ethernet used **Carrier Sense Multiple Access with Collision Detection**: listen, if idle transmit, if you detect another transmitter's energy collide → send 32-bit jam, stop, wait a random multiple of slot time (51.2 µs at 10 Mbps), retry with **truncated binary exponential backoff** up to 16 attempts. The **64-byte minimum frame size** is a direct consequence of slot-time math: at 10 Mbps the round-trip propagation across the maximum 2.5 km / 4 repeater diameter is ≤ 51.2 µs = 512 bit-times = 64 bytes. A station transmitting 64+ bytes is guaranteed to still be transmitting when any collision returns ([https://intronetworks.cs.luc.edu/1/html/ethernet.html](https://intronetworks.cs.luc.edu/1/html/ethernet.html)). Modern switched, full-duplex Ethernet has no collisions — every link is point-to-point, simultaneous send/receive — so CSMA/CD is dead, but the 64-byte minimum stays for backwards compatibility. [An Introduction to Computer Networks + 2](https://intronetworks.cs.luc.edu/1/html/ethernet.html)

### Full-duplex, autonegotiation, flow control

- **Full-duplex**: separate TX/RX pairs (or wavelengths) — no contention.
- **Autonegotiation (Clause 28/37/73)**: PHYs send fast link pulses or training sequences advertising speed, duplex, FEC, EEE, pause capability.
- **PAUSE frames (802.3x)**: sent to MAC `01:80:C2:00:00:01` with EtherType `0x8808`; tells the link partner to halt for N quanta. **Priority Flow Control (PFC, 802.1Qbb)** does this per 802.1p priority — essential for lossless RoCE.

### VLAN tag (802.1Q) and QinQ (802.1ad)

Inserted between Src MAC and EtherType:

```
[TPID 0x8100][PCP 3b | DEI 1b | VID 12b]
```

VID 0 = priority-only, 1 = default, 4095 reserved, so 4094 usable VLANs ([https://en.wikipedia.org/wiki/IEEE_802.1Q](https://en.wikipedia.org/wiki/IEEE_802.1Q)). QinQ uses outer TPID 0x88A8 (S-tag) plus inner 0x8100 (C-tag) for service-provider double-tagging. [Wikipedia](https://en.wikipedia.org/wiki/IEEE_802.1Q)[Ping Labz](https://www.pinglabz.com/802-1q-vlan-tag-explained/)

### Physical-layer encoding evolution

| Speed | Encoding | Notes |
|---|---|---|
| 10 Mbps | Manchester | Self-clocking, 50% efficiency |
| 100BASE-TX | 4B/5B + MLT-3 | 125 MBd over Cat-5 |
| 1000BASE-X (fiber) | 8B/10B | 1.25 GBd |
| 1000BASE-T | PAM-5 4-D trellis | All 4 pairs at 125 MBd |
| 10GbE / 25GbE / 40GbE / 100GbE | 64B/66B (NRZ) | 10.3125 / 25.78125 GBd per lane |
| 200G / 400G / 800G | 64B/66B → 256B/257B transcode + RS(544,514) FEC + PAM-4 | 26.5625/53.125 GBd PAM-4 |
| 1.6T (802.3dj) | 256B/257B + concatenated FEC + PAM-4 | 212.5 GBd PAM-4 (200 Gb/s/lane) |

([https://en.wikipedia.org/wiki/Physical_coding_sublayer](https://en.wikipedia.org/wiki/Physical_coding_sublayer); [https://ethernetalliance.org/blog/2018/03/28/a-deep-dive-into-the-802-3bs-200gbase-r-and-400gbase-r-pcspma/](https://ethernetalliance.org/blog/2018/03/28/a-deep-dive-into-the-802-3bs-200gbase-r-and-400gbase-r-pcspma/))

### PCS/PMA/PMD sublayers, simplified

- **PCS** transcodes 64B blocks into 66B blocks (sync header `01` for data, `10` for control), scrambles, distributes across virtual lanes, adds alignment markers, computes/places RS-FEC parity.
- **PMA** does bit muxing, gearboxing, lane skew handling, clock recovery (CDR), PAM-4 gray coding.
- **PMD** is the actual transceiver — laser/photodiode for optics, line driver/receiver for copper.

### Sequence diagram (Mermaid) — switched, full-duplex frame transmission

Host BB NIC (MAC+PHY)Ethernet SwitchA NIC (MAC+PHY)App on Host AHost BB NIC (MAC+PHY)Ethernet SwitchA NIC (MAC+PHY)App on Host A#mermaid-rfg{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfg .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfg .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfg .error-icon{fill:#CC785C;}#mermaid-rfg .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfg .edge-thickness-normal{stroke-width:1px;}#mermaid-rfg .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfg .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfg .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfg .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfg .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfg .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfg .marker.cross{stroke:#A1A1A1;}#mermaid-rfg svg{font-family:inherit;font-size:16px;}#mermaid-rfg p{margin:0;}#mermaid-rfg .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .actor-line{stroke:#A1A1A1;}#mermaid-rfg .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfg .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfg #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfg .sequenceNumber{fill:#5e5e5e;}#mermaid-rfg #sequencenumber{fill:#E5E5E5;}#mermaid-rfg #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfg .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfg .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg .labelText,#mermaid-rfg .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .loopText,#mermaid-rfg .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfg .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfg .noteText,#mermaid-rfg .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfg .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfg .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfg .actorPopupMenu{position:absolute;}#mermaid-rfg .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfg .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg .actor-man circle,#mermaid-rfg line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfg :root{--mermaid-font-family:inherit;}ARP cache lookup → MAC of Balt[Hit (port known)][Miss / Broadcast]Learn SA→ingress port (MAC table aging ~300 s)send(IP packet, dst=10.0.0.2)Build frame: [DA|SA|0x0800|IPv4|FCS]64B/66B encode → PAM-4 → opticsPHY signal (preamble, SFD, frame)Recover bits, strip preamble, validate FCSLookup DA in MAC table (CAM)Forward only out matching portFlood to all VLAN member portsFCS check, deliver to MACPass IP packet up the stack

CSMA/CD half-duplex equivalent (legacy):

BWireABWireA#mermaid-rfh{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfh .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfh .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfh .error-icon{fill:#CC785C;}#mermaid-rfh .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfh .edge-thickness-normal{stroke-width:1px;}#mermaid-rfh .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfh .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfh .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfh .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfh .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfh .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfh .marker.cross{stroke:#A1A1A1;}#mermaid-rfh svg{font-family:inherit;font-size:16px;}#mermaid-rfh p{margin:0;}#mermaid-rfh .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .actor-line{stroke:#A1A1A1;}#mermaid-rfh .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfh .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfh #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfh .sequenceNumber{fill:#5e5e5e;}#mermaid-rfh #sequencenumber{fill:#E5E5E5;}#mermaid-rfh #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfh .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfh .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh .labelText,#mermaid-rfh .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .loopText,#mermaid-rfh .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfh .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfh .noteText,#mermaid-rfh .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfh .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfh .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfh .actorPopupMenu{position:absolute;}#mermaid-rfh .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfh .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh .actor-man circle,#mermaid-rfh line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfh :root{--mermaid-font-family:inherit;}Carrier sense — idle?Begin transmit frameBegin transmit frame (collision!)Detect collision, send 32-bit jamDetect collision, send 32-bit jamBackoff = random(0..2^k-1) × slot timeBackoff = random(0..2^k-1) × slot timeRetry after backoff

## Deep connections to other protocols

- **ARP (RFC 826, Plummer 1982)**: ARP *runs directly on Ethernet* with EtherType `0x0806`. It's not "above" or "below" Ethernet — it is *inside* an Ethernet frame, mapping IPv4 addresses to MAC addresses by broadcast. Without ARP you cannot send IPv4 over Ethernet ([https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826)).
- **IPv4 (RFC 791) on Ethernet (RFC 894, 1984)**: EtherType `0x0800`. Minimum frame padding to 46 bytes is *not* part of the IP datagram — IP's Total Length field tells the receiver where the payload truly ends ([https://www.rfc-editor.org/rfc/rfc894.html](https://www.rfc-editor.org/rfc/rfc894.html)).
- **IPv6 (RFC 8200)**: EtherType `0x86DD`. Replaces ARP with **Neighbor Discovery Protocol (NDP, ICMPv6)**, which uses multicast MAC addresses derived from the solicited-node IPv6 multicast group instead of broadcast.
- **Wi-Fi (IEEE 802.11)**: Often described as "wireless Ethernet" (Metcalfe insists on the name). 802.11 is a **sibling**, not a child, of 802.3: it uses the same 48-bit MAC addressing and presents the same Ethernet-like frame service to upper layers, but its MAC is fundamentally different (CSMA/CA, RTS/CTS, hidden-terminal handling). When a Wi-Fi access point bridges to wired Ethernet, it translates 802.11 frames to 802.3 frames ([https://awards.acm.org/about/2022-turing](https://awards.acm.org/about/2022-turing)).
- **STP/RSTP/MSTP (802.1D, 802.1w, 802.1s)**: Spanning Tree Protocol elects a root bridge and blocks redundant ports to break L2 loops. RSTP cuts convergence from ~30–50 s to a few seconds; MSTP allows multiple spanning trees per VLAN group. [Beaming](https://www.beaming.co.uk/knowledge-base/techs-understanding-spanning-tree-protocol-stp/)[LinkedIn](https://www.linkedin.com/advice/3/how-can-spanning-tree-protocol-prevent-broadcast-cogmc)
- **LACP (802.3ad → 802.1AX)**: Bundles parallel links into a single logical port; uses LACPDUs (slow protocol multicast `01:80:C2:00:00:02`).
- **802.1X**: Port-based authentication (EAPOL, EtherType `0x888E`), the basis of enterprise Wi-Fi WPA-Enterprise and wired NAC.
- **MACsec (802.1AE)**: Hop-by-hop AES-GCM encryption at L2 with EtherType `0x88E5`; pairs with 802.1X+MKA for key management; adds ~32 B overhead, line-rate in switch ASICs ([https://en.wikipedia.org/wiki/IEEE_802.1AE](https://en.wikipedia.org/wiki/IEEE_802.1AE)). [FirstPassLab](https://firstpasslab.com/blog/2026-03-09-macsec-802-1ae-wire-speed-encryption-campus-datacenter-guide/)[FirstPassLab](https://firstpasslab.com/blog/2026-03-09-macsec-802-1ae-wire-speed-encryption-campus-datacenter-guide/)
- **PoE (802.3af 15.4 W / at 30 W / bt 60–90 W)**: Power on data pairs (Mode A) or spare pairs (Mode B); 802.3bt adds 4-pair powering ([https://en.wikipedia.org/wiki/Power_over_Ethernet](https://en.wikipedia.org/wiki/Power_over_Ethernet)). [Wikipedia](https://en.wikipedia.org/wiki/Power_over_Ethernet)
- **TRILL (RFC 6325) and SPB (802.1aq)**: Both replace STP with IS-IS-routed L2 fabrics. **Both lost in the market to VXLAN+EVPN** because VXLAN runs over plain IP and required no new switch hardware ([https://blog.ipspace.net/2024/04/spb-trill-evpn/](https://blog.ipspace.net/2024/04/spb-trill-evpn/)).
- **VXLAN (RFC 7348)**: L2-over-UDP overlay; the canonical hyperscale tenant-isolation protocol; pairs with EVPN (BGP) as control plane.
- **MPLS over Ethernet**: EtherType `0x8847` (unicast), `0x8848` (multicast); how carriers backhaul L2/L3 VPNs.
- **PPPoE (RFC 2516)**: PPP discovery `0x8863` + session `0x8864`; the protocol your DSL/fiber CPE uses to authenticate to the ISP.
- **EtherCAT**: Ethernet frame with EtherType `0x88A4`; one master frame circulates through slaves on the fly, each slave reading/writing its slot as the frame passes (microsecond cycle times). Skips IP entirely ([https://dewesoft.com/blog/what-is-ethercat-protocol](https://dewesoft.com/blog/what-is-ethercat-protocol)).
- **PROFINET RT**: EtherType `0x8892` jumps from L2 directly to L7 to skip TCP/IP latency ([https://us.profinet.com/profinet-explained/](https://us.profinet.com/profinet-explained/)).
- **TSN (Time-Sensitive Networking)**: Suite of 802.1 amendments — 802.1AS (gPTP timing), 802.1Qbv (Time-Aware Shaper), 802.1Qbu/802.3br (frame preemption), 802.1CB (frame replication & elimination), and the new **802.1DG-2025** automotive profile ([https://1.ieee802.org/publication-ieee-802-1dg-2025/](https://1.ieee802.org/publication-ieee-802-1dg-2025/)). [zigron](https://zigron.com/2025/09/03/tsn-fundamentals-802-1as-802-1qbv/)[IEEE](https://standards.ieee.org/wp-content/uploads/2025/10/D1_08_Janos-Farkas-Time-Sensitive-Networking-Standardization.pdf)
- **Ethernet OAM**: 802.1ag CFM and ITU-T Y.1731 add carrier-grade fault management (continuity check, loopback, link trace).
- **LLDP (802.1AB)**: Vendor-neutral neighbor discovery, EtherType `0x88CC`. The protocol your network-management tool uses to draw topology.
- **PCIe**: PCIe Gen 3 borrowed Ethernet's 8B/10B; Gen 4–6 use 128B/130B and PAM-4 patterned after Ethernet's. PCIe 6.0 PAM-4 + FEC choices are essentially what the 802.3 PCS sublayer does. Direct lineage.
- **InfiniBand / RoCE / RoCEv2**: IB is a competing fabric; **RoCEv2 encapsulates IB transport in UDP/IP/Ethernet** (UDP port 4791) — the protocol Meta runs on 24,000-GPU clusters to train Llama 3 ([https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/)). [Fibermall + 2](https://www.fibermall.com/blog/rocev2-ultimate-guide-to-low-latency.htm)

## Real-world deployment

**Software stacks**

- Linux kernel `net/ethernet/eth.c` and `drivers/net/ethernet/` (Intel `ixgbe`/`i40e`/`ice`/`idpf`, Mellanox `mlx5`, Broadcom `bnxt_en`).
- **DPDK** for kernel-bypass userspace packet I/O at line rate.
- BSD network stack, Windows NDIS, ESXi vmkernel.

**Switch silicon (merchant)**

- **Broadcom Tomahawk 6** — 102.4 Tbps single-chip (June 2025); Tomahawk 6-Davisson with co-packaged optics (Oct 2025); supports 64×1.6T, 128×800G, 256×400G, or 512×200G ports per chip ([https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html](https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html)). [GlobeNewswire + 2](https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html)
- Broadcom Trident, Jericho families; Marvell Teralynx; Cisco Silicon One; **NVIDIA Spectrum-4** (51.2 Tbps) and roadmapped Spectrum-X1600 (102.4 Tbps, 2H 2026).

**NICs**

- NVIDIA ConnectX-7/8 and BlueField-3/4 SuperNIC; **AMD Pensando Pollara 400 GbE** (deployed at Oracle Cloud as the first UEC-compliant NIC, 2025); Broadcom Thor; Intel E810/E830. [Data Center Dynamics + 2](https://www.datacenterdynamics.com/en/news/ultra-ethernet-consortium-launches-10-specification/)

**Network operating systems**

- **SONiC** (Software for Open Networking in the Cloud) — open-source NOS originated at Microsoft, now a Linux Foundation project; runs on white-box switches at Microsoft Azure, Alibaba, and via vendors like Edgecore, Asterfusion ([https://sonicfoundation.dev/](https://sonicfoundation.dev/)). [Lightwave](https://www.lightwaveonline.com/network-design/packet-transport/article/14285026/orange-implements-sonic-based-operating-system-on-edgecore-whitebox-switch)[Sonicfoundation](https://sonicfoundation.dev/sonic-the-leading-open-source-network-operating-system-sees-unparalleled-growth-with-10-new-members-and-expansion-into-enterprise-edge/)
- Cisco NX-OS / IOS-XE, Arista EOS, Juniper Junos, Nokia SR Linux.

**Topologies at hyperscale**

- Folded **Clos / leaf-spine / fat-tree** is the canonical Ethernet datacenter fabric.
- Google's **Jupiter** moved (in 2022 SIGCOMM paper "Jupiter Evolving") from a Clos with electrical spine to a **direct-connect mesh of aggregation blocks via MEMS Optical Circuit Switches with SDN** — yielding 5× speed/capacity, 30% lower CapEx, 41% lower power, and as of 2024 supporting >13 Pb/s of bisection bandwidth ([https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/](https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/); [https://cloud.google.com/blog/products/networking/speed-scale-reliability-25-years-of-data-center-networking](https://cloud.google.com/blog/products/networking/speed-scale-reliability-25-years-of-data-center-networking)).
- Meta runs a separate "AI Zone" backend with two-stage Clos using Rack Training Switches (RTSWs) and Cluster Training Switches (CTSWs) over RoCEv2; their SIGCOMM 2024 paper details job-aware traffic engineering and abandoning DCQCN in favor of collective-library-driven receiver pacing for AI workloads ([https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/)). [FB](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/)[ACM Digital Library](https://dl.acm.org/doi/10.1145/3651890.3672233)
- **Rail-optimized** fabrics for AI: each GPU's NIC connects to a separate "rail" leaf so all-reduce traffic is one hop.

**Performance numbers (2026)**

- Cut-through switching: ~300 ns–1 µs per hop on modern data-center silicon; store-and-forward: serialization-limited.
- 800 GbE optics shipping in volume; 1.6 TbE in early production (Broadcom Tomahawk 6, NVIDIA roadmap).
- NVIDIA reports Spectrum-X delivers ~95% effective throughput vs ~60% on best-effort Ethernet for AI workloads ([https://www.networkworld.com/article/4050881/nvidia-networking-roadmap-ethernet-infiniband-co-packaged-optics-will-shape-data-center-of-the-future.html](https://www.networkworld.com/article/4050881/nvidia-networking-roadmap-ethernet-infiniband-co-packaged-optics-will-shape-data-center-of-the-future.html)). [Network World](https://www.networkworld.com/article/4050881/nvidia-networking-roadmap-ethernet-infiniband-co-packaged-optics-will-shape-data-center-of-the-future.html)
- Ethernet switching market exceeded $30 B in 2021; Dell'Oro forecasts ~$80 B over five years driven by AI ([https://awards.acm.org/about/2022-turing](https://awards.acm.org/about/2022-turing); [https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/](https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/)). [ACM Awards](https://awards.acm.org/about/2022-turing)[SDxCentral](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)

## Failure modes and famous incidents

- **The 1980 Xerox "self-melting" network**: Metcalfe has recounted seeing a PARC Ethernet saturate itself due to a runaway broadcast; the originating anecdote of "broadcast storm" mythology. *[needs verifiable primary source]*
- **Broadcast storms / L2 loops**: A single L2 loop without STP causes frames to multiply exponentially because Ethernet has no TTL. Switch CPUs hit 100%, MAC tables thrash because the same source MAC arrives from multiple ports ([https://blog.apnic.net/2019/05/28/broadcast-storms-in-service-provider-networks/](https://blog.apnic.net/2019/05/28/broadcast-storms-in-service-provider-networks/)). [Atlantic + 3](https://www.atlantic.com/htmly/2021/08/spanning-tree-protocol-and-broadcast-storm)
- **Beth Israel Deaconess Medical Center, Nov 13–17 2002**: A multi-day outage stemming from a Spanning Tree topology that took 4 days to recover; widely cited in CIO casework. *[primary case study cited in IT trade press; confirm before publishing]*
- **Facebook / Meta global outage, October 4 2021 (~6 hours)**: Root cause was a backbone-router maintenance command whose audit-tool bug let it execute, disconnecting all data centers. Cascading effects included DNS withdrawing BGP routes — but the *underlying* fault was an L2/L3 backbone reachability collapse, not BGP itself. Employees couldn't enter buildings because badge readers depended on the same network ([https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/); [https://krebsonsecurity.com/2021/10/what-happened-to-facebook-instagram-whatsapp/](https://krebsonsecurity.com/2021/10/what-happened-to-facebook-instagram-whatsapp/)). [SOC Prime](https://socprime.com/blog/what-is-bgp-and-how-its-failure-took-facebook-down/)
- **AWS US-EAST-1, December 7 2021**: An automated capacity-scaling job triggered a flood of internal client connections that overwhelmed the networking devices between AWS's internal network and main network — a textbook case of **internal control-plane congestion at scale** masquerading as DNS failure ([https://aws.amazon.com/message/12721/](https://aws.amazon.com/message/12721/)). [Amazon Web Services](https://aws.amazon.com/message/12721/)
- **AWS US-EAST-1, October 20 2025**: DynamoDB regional endpoint DNS resolution failure cascaded into EC2 launch impairments and NLB health-check failures. Recovery completed 3:01 PM PT same day. Pattern matches 2021 — internal subsystem dependency loops ([https://www.thestack.technology/aws-outage-cause-network/](https://www.thestack.technology/aws-outage-cause-network/)). [The Stack](https://www.thestack.technology/aws-outage-cause-network/)
- **VLAN hopping**: Two attack classes — **switch spoofing** (attacker speaks DTP to trick a switch into trunk mode) and **double tagging** (frame with outer tag matching trunk native VLAN, inner tag for victim VLAN; switch strips outer, forwards inner — strictly one-way) ([https://en.wikipedia.org/wiki/VLAN_hopping](https://en.wikipedia.org/wiki/VLAN_hopping)). [Medium](https://medium.com/@enyel.salas84/preventing-vlan-hopping-attacks-in-cisco-networks-a-ccna-level-guide-4458a6fc518a)[DeepWiki](https://deepwiki.com/frostbits-security/MITM-cheatsheet/2.4-vlan-hopping)
- **MAC flooding / CAM table overflow**: Tools like `macof` from dsniff flood random MACs to exhaust the switch CAM, forcing the switch into hub-like flooding — defense is port security/sticky MAC.
- **ARP spoofing / poisoning**: Gratuitous ARP for a victim's IP poisons others' caches; defense is **Dynamic ARP Inspection (DAI)** plus **DHCP snooping**.
- **Cisco Catalyst 9000 Ethernet-frame DoS (CVE-2025, advisory cisco-sa-cat9k-PtmD7bgy)**: Crafted Ethernet frames cause an egress port to drop all outbound traffic; unauthenticated, adjacent attacker ([https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cat9k-PtmD7bgy](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cat9k-PtmD7bgy)). [Cisco Security](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cat9k-PtmD7bgy)
- **Cisco SNMP RCE — CVE-2025-20352, "Operation Zero Disco" (Oct 2025)**: Active rootkit campaign on Catalyst 9300/9400/3750G; attackers set a universal password containing "disco" ([https://www.trendmicro.com/en_us/research/25/j/operation-zero-disco-cisco-snmp-vulnerability-exploit.html](https://www.trendmicro.com/en_us/research/25/j/operation-zero-disco-cisco-snmp-vulnerability-exploit.html)). [Trend Micro](https://www.trendmicro.com/en_us/research/25/j/operation-zero-disco-cisco-snmp-vulnerability-exploit.html)
- **Cisco Catalyst chained vulnerabilities — CVE-2026-20114 + CVE-2026-20110 (March 2026)**: Lobby Ambassador account command injection + privilege escalation puts Catalyst 9300 into maintenance mode = DoS ([https://www.networkworld.com/article/4150169/chained-vulnerabilities-in-cisco-catalyst-switches-could-induce-denial-of-service.html](https://www.networkworld.com/article/4150169/chained-vulnerabilities-in-cisco-catalyst-switches-could-induce-denial-of-service.html)). [Network World](https://www.networkworld.com/article/4150169/chained-vulnerabilities-in-cisco-catalyst-switches-could-induce-denial-of-service.html)
- **Arista CVE-2024-27890/27892**: gNMI Set authentication bypass via OpenConfig ([https://www.arista.com/en/support/advisories-notices/security-advisory/19862-security-advisory-0099](https://www.arista.com/en/support/advisories-notices/security-advisory/19862-security-advisory-0099)). [Arista](https://www.arista.com/en/support/advisories-notices/security-advisory/19862-security-advisory-0099)
- **Duplex mismatch**: Still a real failure mode in 2026 — one side hard-coded full-duplex, other auto-negotiated to half. Symptoms: late collisions, FCS errors, throughput collapse under load while ping seems fine.
- **LACP misconfigurations**: Mismatched modes (active/passive both passive = no LAG; "on" vs LACP creates loops). Caused production storms when bonded uplinks fall back to independent links and STP reconverges.

## Fun facts and anecdotes

- **The name "Ethernet"**: Metcalfe deliberately invoked the discredited **luminiferous ether** of pre-Einstein physics — "an omnipresent, completely-passive medium for the propagation of electromagnetic waves." The first medium was coax, but the name kept the door open for twisted pair, fiber, radio, even powerline ([https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/](https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/)). [SciHi Blog](http://scihi.org/robert-metcalfe-ethernet/)[Enterprise Networking Planet](https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/)
- **The hand-drawn diagram**: The famous Ethernet sketch was first drawn by Metcalfe in his **May 22, 1973 PARC memo**, then re-drawn for a 1976 NCC slide showing taps, terminators, and "ether" as a passive bus ([https://www.ieee802.org/3/ethernet_diag.html](https://www.ieee802.org/3/ethernet_diag.html); [https://www.digibarn.com/collections/diagrams/ethernet-original/](https://www.digibarn.com/collections/diagrams/ethernet-original/)). [IEEE802](https://www.ieee802.org/3/ethernet_diag.html)
- **2.94 Mbps**: Chosen because the Alto's clock divided cleanly to that rate — about **10,000× faster than the RS-232 terminal links it replaced** ([https://news.mit.edu/2023/bob-metcalfe-wins-acm-turing-award-0322](https://news.mit.edu/2023/bob-metcalfe-wins-acm-turing-award-0322)). [MIT News](https://news.mit.edu/2023/bob-metcalfe-wins-acm-turing-award-0322)
- **Why MAC addresses are 48 bits**: Xerox's John Shoch had originally proposed 16-bit addresses; the team enlarged to 48 bits so every Ethernet device on the planet for the foreseeable future could have a globally unique address with room to spare. Two flag bits (I/G, U/L) cost essentially nothing.
- **The "I ate my words" story**: In a 1995 InfoWorld column Metcalfe predicted the Internet would "go spectacularly supernova and in 1996 catastrophically collapse" and promised to eat his words otherwise. At his 1997 WWW6 keynote in Santa Clara, he put a printed copy in a blender with water and drank it on stage ([https://en.wikipedia.org/wiki/Robert_Metcalfe](https://en.wikipedia.org/wiki/Robert_Metcalfe)).
- **Metcalfe's Law**: Value of a network ∝ n². Coined and popularized by George Gilder in 1993 attributing it to Metcalfe's 1970s sales viewgraphs. [Enterprise Networking Planet](https://www.enterprisenetworkingplanet.com/standards-protocols/metcalfes-law-how-ethernet-beat-ibm-and-changed-the-world/)
- **"Listen before you talk"**: Metcalfe's elegant summary of the CSMA/CD insight that distinguished Ethernet from ALOHAnet's "talk and pray." [Rjlipton](https://rjlipton.com/2023/03/25/the-2022-turing-award/)
- **Why IEEE 802.3 letter suffixes go 802.3a, b, …, z, then aa, ab…**: They literally ran out of letters. After 802.3z (Gigabit Ethernet over fiber, 1998) came 802.3ab (1000BASE-T), then later 802.3ae, …, eventually 802.3df (800GbE) and 802.3dj (1.6 TbE).
- **EtherType numbering oddities**: 0x0800 (IPv4) was assigned by Xerox to DARPA in the early 1980s; 0x0806 (ARP) sits next door. IPv6 got **0x86DD** in 1996 — the suffix "DD" has no special meaning but the high byte 0x86 was a convenient assignment block.
- **1500 vs 9000 byte MTU**: 1500 was a 1980 DIX choice — it balanced latency vs efficiency on a shared 10 Mbps coax. Jumbo frames (9000 B) were popularized by Alteon in 1998 and remain technically non-standard 28 years later, with vendors merely agreeing by convention ([https://en.wikipedia.org/wiki/Jumbo_frame](https://en.wikipedia.org/wiki/Jumbo_frame)).
- **April Fools' RFCs**: RFC 1149 (1990) "IP over Avian Carriers" was actually implemented at the Bergen Linux User Group in 2001 with 9 packets, 4 of which arrived. RFC 3251 (April 2002) "Electricity over IP" inverts the stack.
- **The "Token Ring is dead" moment**: At the May 22, 2023 Computer History Museum 50th-anniversary celebration, Metcalfe still insisted on calling Wi-Fi "Wireless Ethernet" ([https://awards.acm.org/about/2022-turing](https://awards.acm.org/about/2022-turing)). [Harvard SEAS](https://seas.harvard.edu/news/turing-award-honors-harvard-alum-bob-metcalfe-inventor-ethernet)
- **Jupiter → Vesper**: Google moved from Clos to direct-connect with optical circuit switches because pluggable optics consumed too much power; Jensen Huang has publicly said that scaling 1M GPUs with traditional pluggable optics would consume ~180 MW, which is why NVIDIA pivoted to co-packaged optics in Quantum-X Photonics and Spectrum-X Photonics ([https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025](https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025)). [Introl](https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025)

## Practical wisdom

- **MTU and PMTUD blackholes**: A path with 1500-byte MTU between two hosts believing the path is 9000 will fail when DF-set packets exceed 1500 and ICMP "fragmentation needed" is filtered. Symptoms: small pings and TLS handshake work, large transfers stall mid-stream. Fix: enable PMTUD properly, allow ICMP type 3 code 4, or clamp TCP MSS (`iptables ... --clamp-mss-to-pmtu`).
- **Storm control + BPDU guard**: Always enable on access ports. BPDU guard err-disables a port that receives a BPDU (a user plugged in a rogue switch); root guard prevents superior BPDUs from changing the root bridge.
- **Jumbo frames**: Enable end-to-end (host MTU = switch MTU = peer MTU) or expect black holes. NFS/iSCSI/RoCE benefit; mixed-MTU L2 segments are an operational hazard.
- **Interface error counters worth watching**: CRC errors (cabling/SFP), runts (<64 B fragments — expected only on half-duplex), giants (>1518 B without jumbo support), late collisions (duplex mismatch on half-duplex), input drops (buffer exhaustion), pause counters (PFC oscillation). On modern NICs also: RX no-buffer, TX timeout, DMA errors.
- **Troubleshooting toolkit**:
  - `tcpdump -i eth0 -nn -e ether host AA:BB:CC:DD:EE:FF` for L2 capture.
    - **Wireshark filters**: `eth.fcs.status == "Bad"`, `vlan.id == 100`, `arp`, `lldp`.
    - **Mirror / SPAN ports** for passive capture; **sFlow / NetFlow / IPFIX** for sampled telemetry.
    - **ethtool** for ring buffer sizes (`-G`), interrupt coalescing (`-C`), pause (`-A`), FEC mode (`--show-fec`), driver/firmware version.
- **Common misconfigurations**: autoneg/duplex mismatch, LACP fallback, VTP server with empty config wiping VLAN db, native VLAN mismatch on trunks (security and CDP/STP misalignment), TPID mismatch on QinQ.
- **Native VLAN security**: Set native VLAN on trunks to an unused dedicated ID *and* tag the native VLAN (`vlan dot1q tag native`) to defeat double-tagging attacks. [TechTarget](https://www.techtarget.com/searchsecurity/definition/VLAN-hopping)
- **L2 hardening checklist**: Port security, BPDU guard, root guard, DHCP snooping, Dynamic ARP Inspection, IP Source Guard, 802.1X for ports facing users, MACsec for inter-switch links, disable DTP (`switchport nonegotiate`), shut unused ports into a parking VLAN. [Imperva](https://www.imperva.com/learn/availability/vlan-hopping/)[JumpCloud](https://jumpcloud.com/it-index/what-is-vlan-hopping)
- **NIC tuning for high-throughput**: Increase RX/TX rings (`ethtool -G eth0 rx 4096 tx 4096`), enable RSS (Receive Side Scaling) with the right number of queues, pin IRQs to NUMA-local cores (`/proc/irq/*/smp_affinity`), enable XDP for sub-microsecond paths, disable EEE on latency-sensitive links.

## Learning resources (current as of 2026)

**Authoritative specifications**

- IEEE 802.3-2022 (consolidated base, free via IEEE GET program) — [https://standards.ieee.org/ieee/802.3/10422/](https://standards.ieee.org/ieee/802.3/10422/)
- **IEEE 802.3df-2024** (800 GbE / 400 GbE amendment) — published March 2024 — [https://standards.ieee.org/ieee/802.3df/11107/](https://standards.ieee.org/ieee/802.3df/11107/)
- **IEEE P802.3dj** (200/400/800/1.6 T at 200 G/lane) — Working Group ballot Dec 2025; expected ratified 2026 — [https://www.ieee802.org/3/dj/index.html](https://www.ieee802.org/3/dj/index.html)
- IEEE 802.1Q-2022 (VLAN bridging consolidated, with 802.1ad/ah/aq inside)
- RFC 826 (ARP, 1982) — [https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826)
- RFC 894 (IP over Ethernet, 1984) — [https://www.rfc-editor.org/rfc/rfc894](https://www.rfc-editor.org/rfc/rfc894)
- RFC 1042 (IP over IEEE 802 with SNAP, 1988)
- RFC 8200 (IPv6 base, 2017)
- **Ultra Ethernet 1.0 specification** (June 2025, ~560 pages) — [https://ultraethernet.org/](https://ultraethernet.org/)

**Books**

- Spurgeon & Zimmerman, *Ethernet: The Definitive Guide*, 2nd ed., O'Reilly, **2014** — still the best frame-and-PHY reference; pre-dates 100/200/400/800 GbE chapters but L2 fundamentals are unchanged ([https://www.oreilly.com/library/view/ethernet-the-definitive/9781449362980/](https://www.oreilly.com/library/view/ethernet-the-definitive/9781449362980/)).
- Tanenbaum, Feamster & Wetherall, *Computer Networks*, **6th ed., Pearson, 2021** — [https://www.pearson.com/en-us/subject-catalog/p/computer-networks/P200000003188/9780137523214](https://www.pearson.com/en-us/subject-catalog/p/computer-networks/P200000003188/9780137523214) [Pearson](https://www.pearson.com/en-us/subject-catalog/p/computer-networks/P200000003188/9780137523214)
- Kurose & Ross, *Computer Networking: A Top-Down Approach*, **8th ed. 2021** (a 9th edition is rumored but not confirmed as of May 2026; treat any 9th-ed claim as unverified). Chapter 6 covers Ethernet/LAN. [Amazon](https://www.amazon.com/Computer-Networking-Global-James-Kurose/dp/1292405465)
- Comer, *Internetworking with TCP/IP, Vol. 1*, 6th ed.

**Foundational papers**

- Metcalfe, R. M., & Boggs, D. R. (July 1976). "Ethernet: Distributed Packet Switching for Local Computer Networks," *Communications of the ACM* 19(7) — DOI: 10.1145/360248.360253 — [https://dl.acm.org/doi/10.1145/360248.360253](https://dl.acm.org/doi/10.1145/360248.360253) [History of Information](https://www.historyofinformation.com/detail.php?id=930)
- Borrill, P. (2026). "The Bilateral Efficiency of Ethernet: Recalibrating Metcalfe and Boggs After Fifty Years," arXiv:2603.19406 — [https://arxiv.org/abs/2603.19406](https://arxiv.org/abs/2603.19406)
- Poutievski, L., et al. (2022). "Jupiter Evolving: Transforming Google's Datacenter Network via Optical Circuit Switches and SDN," SIGCOMM '22 — DOI: 10.1145/3544216.3544265 — [https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/](https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/)
- Bai et al. (Meta, 2024). "RDMA over Ethernet for Distributed AI Training at Meta Scale," SIGCOMM '24 — DOI: 10.1145/3651890.3672233

**Engineering blogs (2024–2026)**

- Meta Engineering: "RoCE networks for distributed AI training at scale" (Aug 2024) — [https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/)
- Google Cloud: "Jupiter now scales to 13 Petabits per second" (2024)
- NVIDIA Networking technical blog (Spectrum-X, BlueField, Quantum-X) — [https://blogs.nvidia.com/](https://blogs.nvidia.com/)
- Cloudflare blog (regular L2/L3 deep-dives)
- ipSpace.net by Ivan Pepelnjak — sharp ongoing analysis of EVPN, VXLAN, SPB, AI fabrics — [https://blog.ipspace.net/](https://blog.ipspace.net/)

**Video / channels**

- Stanford **CS144 Introduction to Computer Networking** (Levis & McKeown), Fall 2025 iteration — [https://cs144.github.io/](https://cs144.github.io/) — labs build a TCP/IP stack from sockets up; YouTube playlist [https://www.youtube.com/playlist?list=PLvFG2xYBrYAQCyz4Wx3NPoYJOFjvU7g2Z](https://www.youtube.com/playlist?list=PLvFG2xYBrYAQCyz4Wx3NPoYJOFjvU7g2Z) [CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- Computerphile: "Ethernet" with David Brailsford (still canonical introduction)
- Ben Eater: networking-from-scratch series (most recent uploads through 2024)
- Jim Kurose's lecture videos (companion to Top-Down Approach)

**Free university courses**

- **Stanford CS144** (above)
- **MIT 6.829** Computer Networks (graduate; lecture notes posted)
- **Princeton COS 461** Computer Networks (Feamster/Rexford lineage)
- **CMU 15-441/641** Computer Networks
- **Berkeley CS 168** Introduction to the Internet

**Podcasts**

- *Heavy Networking* (Packet Pushers) — weekly, regularly covers Ethernet/AI fabric topics
- *Network Collective* — long-form historical episodes (the History of Networking series interviews Metcalfe, Vint Cerf, Radia Perlman)
- *IEEE Spectrum* podcast — Metcalfe Turing Award episode (2023)

**Hands-on tools**

- **Wireshark / tshark** (active development, 2026)
- **Containerlab** — Docker-based topology emulation, the modern replacement for GNS3/EVE-NG for cloud-native lab work — [https://containerlab.dev/](https://containerlab.dev/)
- GNS3 / EVE-NG — full-VM emulation; still active
- **Mininet** — Python-driven SDN/L2 emulation
- Cisco Packet Tracer — entry-level simulator
- **scapy** — Python frame-crafting; ideal for ARP/VLAN/STP experiments

## Where things are heading (2025–2026 frontier)

**Ultra Ethernet Consortium (UEC)**

- Founded **July 19, 2023** under the Linux Foundation by **AMD, Arista, Broadcom, Cisco, Eviden (Atos), HPE, Intel, Meta, Microsoft** ([https://www.linuxfoundation.org/press/announcing-ultra-ethernet-consortium-uec](https://www.linuxfoundation.org/press/announcing-ultra-ethernet-consortium-uec)). [Fibermall](https://www.fibermall.com/blog/what-is-ultra-ethernet-consortium.htm)[LinkedIn](https://www.linkedin.com/company/ultraethernet)
- 97+ members by mid-2025 including NVIDIA (which joined later despite InfiniBand allegiance), Oracle, Nokia, plus Chinese hyperscalers. [Ultraethernet](https://ultraethernet.org/ultra-ethernet-consortium-welcomes-40-new-industry-leaders/)
- **UEC Specification 1.0 published June 11, 2025** (~560 pages): defines the **Ultra Ethernet Transport (UET)** — a modern RDMA over Ethernet/IP that introduces packet spraying with multipath, selective retransmission, in-network telemetry-driven congestion control, optional credit-based flow control, and ephemeral/connectionless transport state to scale to millions of endpoints ([https://ultraethernet.org/ultra-ethernet-consortium-uec-launches-specification-1-0-transforming-ethernet-for-ai-and-hpc-at-scale/](https://ultraethernet.org/ultra-ethernet-consortium-uec-launches-specification-1-0-transforming-ethernet-for-ai-and-hpc-at-scale/)). [STORDIS](https://stordis.com/ultra-ethernet-consortium/)
- AMD's **Pensando Pollara 400 GbE** is the first UEC-compliant NIC (announced June 2025, deployed at Oracle Cloud). [Data Center Dynamics](https://www.datacenterdynamics.com/en/news/ultra-ethernet-consortium-launches-10-specification/)

**800 GbE (802.3df-2024)**

- Eight 100 Gb/s lanes (PAM-4) electrical and optical. Volume shipping in 2025; default fabric uplink for new AI buildouts in 2026 per Dell'Oro reporting.

**1.6 TbE (802.3dj)**

- Eight 200 Gb/s PAM-4 lanes. 3rd recirculation ballot Dec 16 2025, 87% approve; expected ratification mid-2026. Broadcom Tomahawk 6 already implements it. [Ieee](https://grouper.ieee.org/groups/802/3/email_dialog/msg01764.html)

**AI / ML networking landscape**

- **InfiniBand** (NVIDIA Quantum-2/Quantum-X) still leads pure latency for the largest training clusters but is losing share — 80% of AI back-end networks in 2023, eroding fast ([https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/](https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/)). [SDxCentral](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)
- **NVIDIA Spectrum-X** (Spectrum-4 switch + BlueField-3 SuperNIC + adaptive routing + telemetry-based congestion control) ports InfiniBand tricks to Ethernet; deployed at xAI Colossus, Microsoft, CoreWeave, Stargate. [DEV Community](https://dev.to/firstpasslab/how-nvidia-spectrum-x-ports-infiniband-tricks-to-ethernet-for-ai-fabrics-3h24)[SDxCentral](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)
- **Broadcom Tomahawk 6 / Tomahawk Ultra** + **Thor Ultra 800 GbE NIC**: open Ethernet alternative; Tomahawk 6-Davisson is the first 102.4 Tbps switch with co-packaged optics (Oct 2025). [GlobeNewswire](https://www.globenewswire.com/news-release/2025/10/08/3163429/19933/en/Broadcom-Announces-Tomahawk-6-Davisson-the-Industry-s-First-102-4-Tbps-Ethernet-Switch-with-Co-Packaged-Optics.html)
- **Meta's RoCEv2** for Llama training: 24,000-GPU clusters; abandoned DCQCN for collective-library-coordinated receiver-driven scheduling (SIGCOMM 2024 paper). [ACM Digital Library](https://dl.acm.org/doi/10.1145/3651890.3672233)
- 650 Group estimates **91% of AI workloads will run on Ethernet by 2029** ([https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/](https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/)). [DriveNets](https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/)

**Co-Packaged Optics (CPO) and Linear Pluggable Optics (LPO)**

- **CPO**: optical engines integrated on the switch ASIC package; Broadcom Tomahawk 6-Davisson and NVIDIA Quantum-X / Spectrum-X Photonics shipping; 3.5× power efficiency and ~10× link reliability claimed ([https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025](https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025)). [Connector Supplier + 2](https://connectorsupplier.com/linear-optics-and-cpo-support-power-conservation-in-the-data-center/)
- **LPO**: keeps pluggable form factor but removes the DSP, shifting equalization to host ASIC. ~50% power reduction, near-zero latency. **LPO MSA 100G-DR-LPO spec released March 2025** ahead of OFC 2025 ([https://www.flexoptix.net/en/blog/blog/introducing-linear-pluggable-optics](https://www.flexoptix.net/en/blog/blog/introducing-linear-pluggable-optics)). [Chipstrat + 2](https://www.chipstrat.com/p/linear-optics-trade-offs-lro-and)
- LRO (Linear Receive Optics) is an intermediate — DSP only on TX side. [Chipstrat](https://www.chipstrat.com/p/linear-optics-trade-offs-lro-and)

**Energy Efficient Ethernet (802.3az, 2010) at AI scale**

- LPI (Low Power Idle) saves ~50% on idle links. At AI scale, modern thinking is that links are rarely idle but per-bit-energy improvement (pJ/bit) at the SerDes level matters more — driving CPO and 224G SerDes (Gen4 PAM-4). [Cisco](https://www.cisco.com/assets/sol/sb/Switches_Emulators_v2_3_5_xx/help/250/tesla_250_olh/ts_port_management_09_28.html)

**TSN for industrial / automotive**

- **IEEE 802.1DG-2025** automotive in-vehicle profile published.
- 802.1ASdm-2024 (hot standby gPTP), 802.1ASdn-2024 (YANG), 802.1Qdy-2025 (MSTP YANG) all published in the 24-month window.
- TSN is the foundation of single-pair Ethernet (10BASE-T1S/L) replacing CAN bus in cars and brownfield fieldbuses in factories.

**Things being deprecated**

- **CSMA/CD**: not in the standard for new speeds (every Ethernet ≥10 GbE is full-duplex only).
- **Half-duplex Gigabit**: never deployed in production.
- **Token Ring, FDDI, ATM LAN Emulation**: long dead.
- **Spanning Tree as the primary L2 control plane** in datacenters: replaced by routed leaf-spine + EVPN/VXLAN. STP survives only as a safety net.
- **TRILL**: effectively dead; SPB has narrow vendor-specific (Avaya/Extreme) deployment but lost the war to EVPN+VXLAN. [ipSpace.net](https://blog.ipspace.net/2024/04/spb-trill-evpn/)[The Networking Nerd](https://networkingnerd.net/2016/05/11/the-death-of-trill/)

## Hooks for the article, infographic, and podcast

**60-second narrated hook (for the ear)**

> In May of 1973, a 27-year-old at Xerox PARC named Bob Metcalfe wrote a memo. He drew a single horizontal line across a page, hung some computers off it, and called it "the ether." Fifty-three years later, every byte you've ever sent — every email, every video call, every model weight in every GPU cluster training the next AI — has at some point ridden across a wire that traces its lineage back to that line. Ethernet is the protocol that refused to die. It beat IBM, it beat Token Ring, it beat ATM, it's currently absorbing InfiniBand. It started at three megabits per second. As of 2026, it's running at 1.6 terabits — 533,000 times faster — and the same frame format from 1980 still works. That's the story.

**Striking statistic**

> Ethernet switching alone exceeded **$30 billion in revenue in 2021** (IDC, cited by ACM with the 2022 Turing Award), and Dell'Oro projects AI-driven Ethernet growth will drive **~$80 billion in datacenter switch sales over five years** ([https://awards.acm.org/about/2022-turing](https://awards.acm.org/about/2022-turing); [https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/](https://drivenets.com/blog/why-infiniband-falls-short-of-ethernet-for-ai-networking/)). [ACM Awards](https://awards.acm.org/about/2022-turing)[SDxCentral](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)

**Pause-and-think moment**

> The same 1500-byte MTU that DEC, Intel, and Xerox chose for 10 megabits-per-second coax in 1980 is still the default on the 800-gigabit fiber feeding GPU clusters in 2026. We are sending modern AI traffic through a packet size optimized for a shared cable that doesn't exist anymore — and the cost of changing it is so high that nobody has ([https://en.wikipedia.org/wiki/Jumbo_frame](https://en.wikipedia.org/wiki/Jumbo_frame)).

**Failure-story arc — Meta, October 4, 2021**

> *Setup:* Meta's backbone network — tens of thousands of miles of fiber linking every Facebook data center — is managed by automated tools that an audit subsystem is supposed to keep safe. *Mistake:* A routine command, intended only to *measure* backbone capacity, executes for real because of a bug in the audit tool. Every backbone connection drops simultaneously. *Consequence:* Inside Meta's data centers, the DNS servers — designed to withdraw their BGP routes if they cannot reach the data centers — withdraw themselves from the global internet. Facebook, Instagram, WhatsApp, and Oculus disappear. Engineers can't fix it remotely because the tools they need to log in are inside the network that just vanished. They can't even enter the buildings — the badge readers are on the same network. *Resolution:* Engineers physically drive to the data centers, get past the broken badge readers, plug laptops directly into routers, and roll back the change. Six hours later, BGP routes return; DNS recovers; the world's third-largest application stack reappears. The cause was not a hack. It was a routine network change, gone exactly as wrong as a routine network change can go ([https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)). [FB + 5](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

## Caveats

- The "1980 Xerox network self-melting" anecdote is widely repeated in Ethernet folklore but I could not locate a verifiable primary source in this research; it is marked `[needs source]` and should be confirmed against Metcalfe's *Packet Communication* book or his oral histories at the Computer History Museum before publication.
- The exact characterization of the 2025 AWS US-EAST-1 outage and the chained Cisco Catalyst CVEs are still being analyzed in 2026; CVE numbers should be re-verified at NVD before press.
- The 9th edition of Kurose & Ross is rumored in some forum threads but not confirmed by Pearson as of May 2026; the 8th edition (2021) is the safe citation.
- A 3rd edition of Spurgeon's *Ethernet: The Definitive Guide* has been hinted at by O'Reilly Q&A copy but remains unpublished as of May 2026.
- Ultra Ethernet Consortium 1.0 is a fresh specification (June 2025); real interoperability data, NIC-to-switch compliance, and head-to-head benchmarks against InfiniBand will solidify through 2026 and should be re-checked before any "winner" framing.
- Throughout, I have distinguished marketing claims (e.g., NVIDIA's 1.6× and 95% throughput numbers for Spectrum-X; DriveNets' 18% better-than-InfiniBand) from neutral technical reporting; treat vendor performance claims as directional rather than absolute.