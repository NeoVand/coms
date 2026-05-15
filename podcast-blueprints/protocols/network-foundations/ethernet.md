---
id: ethernet
type: protocol
name: Ethernet
abbreviation: Ethernet
etymology: "[E]ther — Metcalfe's nod to the discredited luminiferous ether of pre-Einstein physics"
category: network-foundations
year: 1983
rfc: null
standards_body: ieee
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/addressing
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - story-of-the-internet/before-the-internet
  - story-of-the-internet/the-1981-burst
  - layer-2-3/ethernet
  - layer-2-3/wifi
  - layer-2-3/arp-and-ndp
  - wireless/the-shared-medium
  - frontier/ultra-ethernet
related_protocols: [wifi, arp, ip, ipv6, tcp]
related_pioneers: [bob-metcalfe]
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: [wire-to-web]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethernet_frame.svg/500px-Ethernet_frame.svg.png
    caption: The Ethernet II frame — 7-byte preamble, 1-byte SFD, 6-byte destination MAC, 6-byte source MAC, 2-byte EtherType, 46–1500 bytes of payload, 4-byte FCS. The format DEC, Intel, and Xerox finalised in 1980 still rules the wire in 2026.
    credit: Image — Wikimedia Commons / Public Domain
visual_cues:
  - "A single horizontal line across the page with five workstations and a laser printer hung off it as taps — Metcalfe's 1973 PARC sketch redrawn, labelled 'the ether,' 2.94 Mbps, 11 November 1973."
  - "An exploded Ethernet II frame diagram with each field annotated by byte count and example hex value: preamble 0x55 x7, SFD 0xD5, dst FF:FF:FF:FF:FF:FF, src AA:BB:CC:00:00:01, EtherType 0x0806, ARP payload, FCS."
  - "A leaf-spine fabric diagram for an AI training cluster — 64 racks, top-of-rack switches at the leaves, eight spines above, every link labelled 800 GbE, with a callout: 'Broadcom Tomahawk 6, 102.4 Tbps single chip, June 2025.'"
  - "A side-by-side: left side a switch flooding an unknown destination MAC out every port; right side the same switch unicasting to one port after the MAC table learned the source from a returning frame."
  - "A timeline ribbon from 1973 to 2026 with rate doublings marked: 2.94 Mbps (1973), 10 Mbps (1980), 100 Mbps (1995), 1 Gbps (1999), 10 Gbps (2002), 100 Gbps (2010), 400 Gbps (2017), 800 Gbps (2024), 1.6 Tbps (2026 expected). Annotation at the bottom: 'same frame format throughout.'"
  - "A cutaway of a Tomahawk 6-Davisson switch with co-packaged optics — the optical engines sitting on the ASIC substrate, fibers going straight into the package, with a power-budget callout next to a stack of pluggable transceivers labelled '~180 MW for 1M GPUs the old way.'"
---

# Ethernet — The Wired Foundation of Local Networks

## In one breath

Ethernet is the Layer 2 protocol that every wired packet on the planet eventually touches. It wraps your data in a frame with a 6-byte source MAC, a 6-byte destination MAC, a 2-byte EtherType that names the payload, the payload itself up to 1500 bytes, and a 4-byte CRC at the tail. Switches learn which MAC lives behind which port and forward unicasts only where they belong. The frame format DEC, Intel, and Xerox locked down in 1980 still works on the 800-gigabit fiber feeding GPU clusters in 2026 — every email, video call, and model weight your laptop has ever sent has, at some point, ridden inside one of these frames.

## The pitch (cold-open)

On May 22, 1973, a 27-year-old at Xerox PARC named Bob Metcalfe wrote a memo, drew a single horizontal line across a page, and called it "the ether." Fifty-three years later, that line is running at 1.6 terabits per second — 533,000 times faster — and the same six-bytes-source, six-bytes-destination, two-bytes-type frame format from 1980 still works. Ethernet beat IBM's Token Ring, beat ATM, and is now actively absorbing InfiniBand inside AI training fabrics. This episode is about how it actually works on the wire, where it runs in production today, what breaks in the field, and why the industry just spent two years writing a 560-page specification to teach it new tricks for AI workloads.

## How it actually works

The simulator on the encyclopedia page walks you through a single conversation between two hosts on a switched LAN. Host A wants to talk to 192.168.1.50, but only knows the IP — not the MAC. So it broadcasts an ARP Request to FF:FF:FF:FF:FF:FF with EtherType 0x0806. The switch sees that broadcast arrive on port 1, records that source MAC 00:1A:2B:3C:4D:5E lives behind port 1, and floods the frame out every other port. Host B recognises its own IP in the request and unicasts an ARP Reply directly back, advertising MAC AA:BB:CC:DD:EE:FF. That single round trip teaches the switch both endpoints.

Host A now constructs a real data frame: destination MAC AA:BB:CC:DD:EE:FF, source MAC 00:1A:2B:3C:4D:5E, EtherType reverts to 0x0800 because the payload is now an IPv4 packet. The switch looks up the destination MAC in its forwarding table — hit — and sends the frame only out Host B's port. The reply comes back with the MACs swapped. From here on, the switch unicasts everything between these two hosts. Forwarding-table entries age out after a default of about 300 seconds if no traffic refreshes them.

That sequence — ARP broadcast, ARP unicast reply, data frame, switched delivery — is the spine of every wired LAN conversation in 2026. Everything else is variations on it.

### Header at a glance

Read it left to right, the way it lands on the wire:

- **Preamble, 7 bytes.** Alternating 1010… (`0x55` repeated). Not addressed, not part of the frame proper — it lets the receiving PHY recover the clock.
- **Start Frame Delimiter, 1 byte.** `0xD5` — the same alternating pattern but with the final bit flipped to 1, signalling that the next byte is the destination MAC.
- **Destination MAC, 6 bytes.** Unicast, multicast, or broadcast. `FF:FF:FF:FF:FF:FF` is broadcast. The least-significant bit of the first byte is the I/G flag — set means multicast.
- **Source MAC, 6 bytes.** Always unicast; the I/G bit must be 0. The first three bytes are the OUI assigned by IEEE Registration Authority; the last three are the manufacturer's NIC-specific portion.
- **EtherType (or Length), 2 bytes.** Values ≤ 1500 mean "length" in the older 802.3-with-LLC interpretation; values ≥ 1536 mean "EtherType." Ones to memorise: `0x0800` IPv4, `0x0806` ARP, `0x86DD` IPv6, `0x8100` 802.1Q VLAN tag, `0x88A8` 802.1ad QinQ, `0x8847` MPLS unicast, `0x888E` 802.1X EAPOL, `0x88E5` MACsec, `0x88CC` LLDP.
- **Payload, 46 to 1500 bytes.** Padded to 46 if shorter. The 1500-byte default MTU was a 1980 DIX choice that no operator has been brave enough to change end-to-end.
- **Frame Check Sequence, 4 bytes.** CRC-32 with polynomial `0x04C11DB7` over destination, source, type, and payload. Bad FCS means the frame is dropped silently — Ethernet detects errors but does not retransmit.
- **Interframe Gap, 96 bit-times of idle.** That is 9.6 µs at 10 Mbps and 0.96 ns at 100 GbE. Not part of the frame, but part of the wire-format contract.

A VLAN tag, when present, slides in between the source MAC and the EtherType: 4 bytes, with TPID `0x8100`, then a 3-bit priority, a 1-bit drop-eligible flag, and a 12-bit VLAN ID. That gives you 4094 usable VLANs per trunk.

### State machine in three sentences

A switched, full-duplex Ethernet link has no state machine in the protocol sense — every frame is independent, there is no connection setup, no acknowledgement, no retransmission timer. The switch's MAC-learning table is the closest thing to state, and even that is just a per-port last-seen timestamp on each source MAC, aged out after roughly 300 seconds. The original CSMA/CD state machine — listen, transmit, detect collision, jam, exponential backoff — survives only as a fossil; modern Ethernet links above 10 GbE are full-duplex by mandate, so collisions cannot happen.

### Reliability, framing, and the fossils we still live with

Ethernet does exactly two things to keep the wire honest. The CRC-32 in the FCS catches transmission errors — the receiver recomputes it, drops the frame on mismatch, and that's it. Reliability is left to whatever lives above (TCP, RoCEv2, Ultra Ethernet Transport). And the autonegotiation handshake (IEEE 802.3 Clause 28, 37, and 73) lets two PHYs swap fast link pulses or training sequences advertising speed, duplex, FEC mode, EEE, and PAUSE capability before the link comes up.

Two pieces of historical baggage are worth knowing because they still bite. **The 64-byte minimum frame size** exists because 10 Mbps coaxial Ethernet had to detect collisions before finishing transmission — 51.2 µs of slot time across the maximum 2.5 km, four-repeater diameter, equals 512 bit-times equals 64 bytes. Modern switched Ethernet has no collisions, but the minimum stays for backwards compatibility. Forty-five years on, every 800 GbE frame still respects slot-time math from a coax that nobody owns. **The 1500-byte MTU** is the same kind of fossil — a 1980 DIX choice that balanced latency against efficiency on a shared 10 Mbps cable. Jumbo frames at 9000 bytes were popularised by Alteon in 1998 and remain technically non-standard 28 years later; vendors merely agree by convention.

Security at Layer 2 used to mean "physical access required." That changed: **MACsec (IEEE 802.1AE)** does hop-by-hop AES-GCM encryption at line rate in switch ASICs, EtherType `0x88E5`, about 32 bytes of overhead per frame. **802.1X** with EAPOL (`0x888E`) does port-based authentication; pair them with MKA for key management and you have wire-speed encrypted, authenticated trunks between data-center switches.

## Where it shows up in production

**Hyperscale switch silicon** is where the modern Ethernet story is loudest. **Broadcom Tomahawk 6** shipped in June 2025 as the world's first 102.4 Tbps single-chip switch — a single ASIC drives 64 ports of 1.6T, or 128 of 800G, or 256 of 400G, or 512 of 200G. **Tomahawk 6-Davisson**, with co-packaged optics on the ASIC substrate, shipped in October 2025. NVIDIA's **Spectrum-4** runs at 51.2 Tbps; **Spectrum-X1600** at 102.4 Tbps is expected in the second half of 2026. Marvell Teralynx, Cisco Silicon One, and Broadcom Trident and Jericho fill out the merchant-silicon market.

**Google's Jupiter fabric** is the canonical hyperscale Ethernet datacenter. The 2022 SIGCOMM paper "Jupiter Evolving" describes their move from a Clos with electrical spine to a direct-connect mesh of aggregation blocks linked by MEMS Optical Circuit Switches under SDN control. Result, as reported in the paper and on the Google Cloud blog: 5× speed and capacity, 30% lower CapEx, 41% lower power, and as of 2024 over 13 petabits per second of bisection bandwidth. The encyclopedia's Ultra Ethernet chapter has more on why the optics moved into the switch package itself.

**Meta runs RoCEv2 over Ethernet** on its 24,000-GPU clusters to train Llama 3. Their SIGCOMM 2024 paper, "RDMA over Ethernet for Distributed AI Training at Meta Scale," details a two-stage Clos with Rack Training Switches and Cluster Training Switches, job-aware traffic engineering, and the operational decision to abandon DCQCN — the standard datacenter congestion-control algorithm — in favour of receiver-driven pacing coordinated by the collective communication library. That last move took congestion control out of the network and into the AI framework.

**xAI's Colossus, Microsoft Azure, CoreWeave, and Stargate** all deploy NVIDIA Spectrum-X — Spectrum-4 switch plus BlueField-3 SuperNIC plus adaptive routing and telemetry-based congestion control. NVIDIA reports Spectrum-X delivers ~95% effective throughput on AI workloads versus ~60% on best-effort Ethernet.

**SONiC**, Software for Open Networking in the Cloud, is the open-source NOS that originated at Microsoft and now lives at the Linux Foundation. It runs on white-box switches at Microsoft Azure, Alibaba, and through vendors like Edgecore and Asterfusion. The proprietary world is Cisco NX-OS and IOS-XE, Arista EOS, Juniper Junos, and Nokia SR Linux.

**Oracle Cloud** deployed AMD's **Pensando Pollara 400 GbE** in 2025 as the first UEC-compliant NIC — the first commercial NIC implementing the new Ultra Ethernet Transport.

**Linux drivers** at the kernel level: `net/ethernet/eth.c` plus the per-vendor stacks under `drivers/net/ethernet/` — Intel `ixgbe`, `i40e`, `ice`, `idpf`; Mellanox `mlx5`; Broadcom `bnxt_en`. **DPDK** is the kernel-bypass alternative for line-rate userspace I/O.

**The commercial scale**: Ethernet switching alone exceeded $30 billion in revenue in 2021, and Dell'Oro projects roughly $80 billion in datacenter switch sales over the next five years driven by AI buildouts.

## Things that go wrong

**The Meta global outage of October 4, 2021** is the textbook L2/L3 backbone failure of the modern era. A routine command, intended only to measure backbone capacity, executed for real because of a bug in the audit subsystem that was supposed to keep it safe. Every backbone connection between Meta data centers dropped simultaneously. Meta's DNS servers, designed to withdraw their BGP routes when they could not reach the data centers, withdrew themselves from the global internet. Facebook, Instagram, WhatsApp, and Oculus disappeared for about six hours.

The compounding details are what make it famous. Engineers couldn't fix it remotely because the tools they needed to log in lived inside the network that had just vanished. They couldn't enter the buildings to fix it physically because the badge readers ran on the same network. Recovery required driving to data centers, getting past broken badge readers, and plugging laptops directly into routers. The cause was not a hack. It was a routine network change going exactly as wrong as a routine network change can go.

**The AWS US-EAST-1 outage on December 7, 2021** is the same shape one layer down. An automated capacity-scaling job triggered a flood of internal client connections that overwhelmed the networking devices between AWS's internal network and the main network — internal control-plane congestion at scale, masquerading as DNS failure. The October 20, 2025 US-EAST-1 outage rhymed: a DynamoDB regional endpoint DNS resolution failure cascaded into EC2 launch impairments and NLB health-check failures. Pattern matches 2021 — internal subsystem dependency loops.

**Broadcast storms and L2 loops.** A single Layer 2 loop without Spanning Tree causes frames to multiply exponentially because Ethernet has no TTL field. Switch CPUs hit 100%, and MAC tables thrash because the same source MAC arrives from multiple ports. The classic mitigation is STP (802.1D), RSTP (802.1w), or MSTP (802.1s); the modern datacenter answer is to route everything at Layer 3 with leaf-spine plus EVPN/VXLAN and treat STP as a safety net.

**The Beth Israel Deaconess Medical Center outage of November 13–17, 2002** is the case study that taught a generation of hospital CIOs about Spanning Tree. A topology problem took four days to fully recover. The dump flags this one as needing primary-source confirmation; we keep it here because the lesson — that Layer 2 control-plane misbehaviour can take down a hospital — is real even if the specifics need verifying.

**Cisco Catalyst 9000 Ethernet-frame DoS**, advisory `cisco-sa-cat9k-PtmD7bgy` from 2025, lets an unauthenticated, adjacent attacker cause an egress port to drop all outbound traffic with crafted Ethernet frames. **Cisco SNMP RCE, CVE-2025-20352, "Operation Zero Disco" (October 2025)** — an active rootkit campaign on Catalyst 9300, 9400, and 3750G boxes; attackers set a universal password containing "disco," hence the name. **Chained vulnerabilities CVE-2026-20114 and CVE-2026-20110 (March 2026)** combine a Lobby Ambassador account command injection with a privilege escalation to put a Catalyst 9300 into maintenance mode — a denial of service. **Arista CVE-2024-27890 and 27892** are gNMI Set authentication bypass via OpenConfig. The pattern in 2025–2026: switch management planes, not the data plane, are where the new CVEs land.

**VLAN hopping** comes in two flavours. **Switch spoofing** has the attacker speak Dynamic Trunking Protocol (DTP) to trick a switch port into trunk mode. **Double tagging** wraps a frame with an outer tag matching the trunk's native VLAN and an inner tag for the victim VLAN; the switch strips the outer, forwards the inner — strictly one-way, but it works. The defence is to set the native VLAN on trunks to a dedicated unused ID, tag the native VLAN explicitly (`vlan dot1q tag native`), and disable DTP on user-facing ports.

**MAC flooding (CAM-table overflow)** with tools like `macof` from dsniff exhausts the switch CAM and forces the switch to flood every frame like a hub — a passive eavesdropping setup. Defence is port security with sticky MAC.

**ARP spoofing** is the entry-level network attack: gratuitous ARP for a victim's IP poisons everyone else's caches. Defence: Dynamic ARP Inspection (DAI) plus DHCP snooping. The ARP and NDP chapter episode covers this in more detail, including how Firesheep on coffee-shop Wi-Fi in 2010 was the proximate cause of the industry-wide HTTPS-everywhere push.

**Duplex mismatch** is still a real failure mode in 2026 — one side hard-coded full-duplex, the other auto-negotiated and fell back to half. Symptoms: late collisions, FCS errors, throughput collapse under load, but ping looks fine. **LACP misconfiguration** — both ends in passive mode means no LAG forms; mode `on` against LACP creates loops. Bonded uplinks fall back to independent links and Spanning Tree reconverges in production.

## Common pitfalls (for the practitioner)

- **PMTUD blackholes.** A path with a 1500-byte MTU between two hosts that believe the path is 9000 will fail when DF-set packets exceed 1500 and the ICMP "fragmentation needed" reply is filtered. Symptom: small pings and TLS handshakes work, large transfers stall mid-stream. Fix: enable PMTUD properly, allow ICMP type 3 code 4, or clamp TCP MSS — `iptables ... --clamp-mss-to-pmtu`.
- **Jumbo frames.** Enable end-to-end (host MTU = switch MTU = peer MTU) or expect black holes. NFS, iSCSI, and RoCE benefit; mixed-MTU L2 segments are an operational hazard.
- **Storm control plus BPDU guard on access ports.** BPDU guard err-disables a port that receives a BPDU — that is, the port that just had a rogue switch plugged into it. Root guard prevents superior BPDUs from changing the root bridge.
- **Native VLAN security.** Set the native VLAN on trunks to an unused, dedicated ID and tag the native VLAN explicitly with `vlan dot1q tag native` to defeat double-tagging attacks.
- **L2 hardening checklist.** Port security, BPDU guard, root guard, DHCP snooping, Dynamic ARP Inspection, IP Source Guard, 802.1X for ports facing users, MACsec for inter-switch links, disable DTP with `switchport nonegotiate`, and shut unused ports into a parking VLAN.
- **NIC tuning for high throughput.** Increase RX/TX rings (`ethtool -G eth0 rx 4096 tx 4096`), enable RSS with the right number of queues, pin IRQs to NUMA-local cores via `/proc/irq/*/smp_affinity`, enable XDP for sub-microsecond paths, disable EEE on latency-sensitive links.

## Debugging it

**Wireshark and tshark filters worth memorising:** `eth.fcs.status == "Bad"` to find frames the FCS rejected, `vlan.id == 100` to isolate one VLAN, plain `arp` and `lldp` for the L2 control plane. Mirror or SPAN ports give you a passive-tap copy of traffic; sFlow, NetFlow, and IPFIX give you sampled telemetry.

**`tcpdump`** on the host: `tcpdump -i eth0 -nn -e ether host AA:BB:CC:DD:EE:FF` shows every frame to or from a specific MAC, with the `-e` flag printing the link-layer header. `tshark -i eth0 -T fields -e eth.src -e eth.dst -e eth.type -c 10` is the scriptable equivalent.

**`ethtool`** is the Swiss Army knife for the local interface: `-G` for ring buffer sizes, `-C` for interrupt coalescing, `-A` for pause frames, `--show-fec` for FEC mode, `-S eth0 | head -20` for the per-driver counters. On Linux bridges, `bridge fdb show` dumps the entire forwarding database — every MAC the switch has learned, with its port and aging timer.

**Interface error counters worth watching.** CRC errors point to cabling or SFP problems. Runts (frames under 64 bytes) are expected only on half-duplex; on a full-duplex link they signal trouble. Giants (over 1518 bytes without jumbo support) mean an MTU mismatch. Late collisions are the classic duplex-mismatch signature on half-duplex. Input drops mean buffer exhaustion. PAUSE counters that climb mean PFC is oscillating. On modern NICs add RX-no-buffer, TX timeout, and DMA errors.

**Containerlab** is the modern Docker-based topology emulator that has largely replaced GNS3 and EVE-NG for cloud-native lab work. Mininet covers Python-driven SDN and L2 emulation. **scapy** crafts arbitrary Ethernet frames in Python and is unbeatable for ARP, VLAN, and STP experiments — the canonical record's code example uses it.

## What's changing in 2026

- **March 2026 — Cisco Catalyst chained vulnerabilities (CVE-2026-20114 + CVE-2026-20110)** combine a Lobby Ambassador account command injection with a privilege escalation that puts a Catalyst 9300 into maintenance mode. Patch advisories live on Cisco's security site; CVE numbers will firm up at NVD over the coming months.
- **2026 (expected) — IEEE 802.3dj, 1.6 TbE.** Eight 200 Gb/s PAM-4 lanes. The 3rd Working Group recirculation ballot closed 16 December 2025 with 87% approval; ratification expected mid-2026. Broadcom Tomahawk 6 already implements it.
- **October 2025 — Broadcom Tomahawk 6-Davisson** ships as the industry's first 102.4 Tbps Ethernet switch with co-packaged optics. The optics moves into the switch package, eliminating per-port pluggable transceivers and their power overhead.
- **October 2025 — "Operation Zero Disco" (CVE-2025-20352)** active campaign on Cisco Catalyst 9300/9400/3750G via SNMP RCE.
- **September 2025 — IEEE 802.1DG-2025**, the TSN profile for automotive in-vehicle Ethernet, published. 802.1ASdm-2024 (hot-standby gPTP), 802.1ASdn-2024 (YANG), and 802.1Qdy-2025 (MSTP YANG) all landed in the same window. Single-pair Ethernet (10BASE-T1S/L) is the new fieldbus and is starting to displace CAN bus in cars.
- **June 11, 2025 — Ultra Ethernet Consortium Specification 1.0** published. Roughly 560 pages. Defines Ultra Ethernet Transport (UET): packet spraying with multipath, selective retransmission, in-network telemetry-driven congestion control, optional credit-based flow control, and ephemeral, connectionless transport state to scale to millions of endpoints. The full story belongs to the Ultra Ethernet chapter episode.
- **June 2025 — AMD's Pensando Pollara 400 GbE** ships as the first UEC-compliant NIC, deployed at Oracle Cloud.
- **June 2025 — Broadcom Tomahawk 6** ships as the first 102.4 Tbps single-chip switch.
- **March 2025 — LPO MSA 100G-DR-LPO spec** released ahead of OFC 2025. Linear Pluggable Optics keeps the pluggable form factor but removes the DSP, shifting equalisation to the host ASIC. Roughly 50% power reduction and near-zero added latency.
- **February–March 2024 — IEEE 802.3df-2024 (800 GbE)** approved 16 February 2024, published March 2024. Eight 100 Gb/s PAM-4 lanes. Volume shipping in 2025 and the default fabric uplink for new AI buildouts in 2026 per Dell'Oro.
- **2024 — NVIDIA Spectrum-X** announced at Computex and deployed at xAI Colossus, Microsoft, and CoreWeave. Adaptive routing plus telemetry-based congestion control on Ethernet, ported from InfiniBand.

## Fun facts (host material)

**The name.** Metcalfe deliberately invoked the discredited luminiferous ether of pre-Einstein physics — "an omnipresent, completely passive medium for the propagation of electromagnetic waves." The first medium was coax, but the name kept the door open for twisted pair, fiber, radio, even powerline. The trick worked: every one of those is now Ethernet at the link layer.

**2.94 Mbps.** The first Ethernet, running between Altos at PARC on 11 November 1973, ran at 2.94 megabits per second because that was the Alto's clock divided down. It was about ten thousand times faster than the RS-232 terminal links it replaced. By 1975, around 100 Altos at PARC were connected; the Alto plus Ethernet plus laser-printer trio became the prototype of the modern office computer.

**Why MAC addresses are 48 bits.** Xerox's John Shoch had originally proposed 16. The team enlarged the field so every Ethernet device on the planet for the foreseeable future could have a globally unique address with room to spare. Two flag bits — I/G for individual versus group, and U/L for universally administered versus locally administered — cost essentially nothing.

**"I ate my words."** In a 1995 InfoWorld column Metcalfe predicted the Internet would "go spectacularly supernova and in 1996 catastrophically collapse," and promised to eat his words otherwise. At his 1997 WWW6 keynote in Santa Clara, he put a printed copy of the column in a blender with water and drank it on stage.

**The 802.3 letter suffixes ran out at z.** After 802.3z (Gigabit Ethernet over fiber, 1998) came 802.3ab (1000BASE-T), then later 802.3ae, all the way to 802.3df (800 GbE) and 802.3dj (1.6 TbE). The standards process kept producing letters faster than the alphabet could supply them.

**RFC 1149 — IP over Avian Carriers.** The 1990 April Fools' RFC for IP over carrier pigeons. The Bergen Linux User Group actually implemented it in 2001: nine packets sent, four arrived. RFC 3251 from April 2002, "Electricity over IP," inverts the stack the other way.

**Bob Metcalfe still calls Wi-Fi "Wireless Ethernet."** At the May 22, 2023 Computer History Museum 50th-anniversary celebration, he insisted on it. He has a point — 802.11 uses the same 48-bit MAC addressing and presents the same Ethernet-like frame service to upper layers, even if the MAC algorithm itself (CSMA/CA, with hidden-terminal handling and explicit ACKs) is fundamentally different.

## Where this connects in the book

- **Part Foundations, "What Is a Protocol?"** — opens the series with the basic question, using Ethernet as one of the worked examples for the rules-of-the-game framing.
- **Part Foundations, "The Layer Model"** — Ethernet sits at Layer 1 and Layer 2 of the OSI model, and at the link layer of the TCP/IP four-layer model. This chapter is the one that walks you through where the layers blur and why Ethernet is the canonical case where they do.
- **Part Foundations, "Addressing & Identity"** — how a packet finds your laptop. MACs, IPs, ports. Ethernet's 48-bit MAC is the bottom of that stack.
- **Part Foundations, "Packets & Encapsulation"** — encapsulation in pictures. Frames inside packets inside segments. Ethernet is the outermost wrapper on the wire.
- **Part Foundations, "Ports & Sockets"** — how one machine runs a hundred services. Ports live above Ethernet but Ethernet is what gets the byte to the right machine first.
- **Part Foundations, "Reliability vs Speed"** — TCP versus UDP, and why QUIC tries to have both. Ethernet sits beneath them all as the best-effort frame layer.
- **Part Story of the Internet, "Before the Internet"** — Xerox PARC, ARPANET, NCP. The three streams that flowed into TCP/IP. Ethernet is the local-fabric tradition, alongside ARPANET's wide-area research backbone and PRNET/SATNET's wireless.
- **Part Story of the Internet, "The 1981–83 Standardisation Burst"** — the three years that decided everything. Postel's RFC 791, 792, 793; the January 1, 1983 ARPANET flag day; and IEEE 802.3 ratified the same year, locking in the LAN/WAN interface that has held for forty-three years.
- **Part Layer 2–3, "Ethernet"** — the deep history chapter. From PARC coaxial cable to 800 GbE in AI training fabrics, the speed-doubling timeline, the frame format that never changed, and the AI-fabric gold rush.
- **Part Layer 2–3, "Wi-Fi"** — CSMA/CA on the airwaves. The sibling-not-child relationship between 802.11 and 802.3, including why Mathy Vanhoef breaks Wi-Fi every two years on stage.
- **Part Layer 2–3, "ARP and NDP"** — how a packet finds the next physical hop. STD 37 has not been obsoleted in 44 years. Includes Firesheep and the HTTPS-everywhere push, plus AWS's special "we don't run ARP" architecture.
- **Part Wireless, "The shared medium"** — why wireless networking is a different problem from wired networking. Ethernet's wired-medium assumptions are exactly what 802.11 cannot make.
- **Part The Modern Frontier, "Ultra Ethernet"** — replacing RoCEv2 in AI training fabrics. Specification 1.0 published 11 June 2025. The full story of UEC, packet spraying, and what Meta learned at Llama-3 scale lives here.

## See also (other protocol episodes)

**Wi-Fi.** The contrast is everything. Ethernet uses dedicated copper or fiber per link; Wi-Fi uses shared radio. Ethernet runs full-duplex on switched links with no collisions; Wi-Fi uses CSMA/CA on a half-duplex shared medium with explicit per-frame ACKs. Ethernet frames carry two MAC addresses (source and destination); Wi-Fi frames carry three or four (Receiver, Transmitter, Destination, Source) because the access point sits in the middle. Ethernet inherits security from physical access; Wi-Fi mandates encryption. If you've heard the Wi-Fi episode, this one is the wired-cousin episode where the medium is finally yours alone.

**ARP.** ARP is not above or below Ethernet — it runs *inside* an Ethernet frame, EtherType `0x0806`, and resolves IPv4 addresses to MAC addresses by broadcast. Without ARP you cannot send IPv4 over Ethernet. The ARP episode covers the 28-byte protocol that Plummer wrote in November 1982 and that has not been obsoleted in 44 years — and the operational footguns: AWS does not run ARP inside VPCs; Linux's `gc_thresh3=1024` default silently drops cloud traffic with more than ~700 neighbours; iOS 18 rotates Wi-Fi MAC addresses every 14 days on weak networks.

**IPv4.** IPv4 packets ride inside Ethernet frames with EtherType `0x0800`. The Ethernet frame's destination MAC is either the final host (if local) or the default gateway router. At each router hop, the IP header stays the same but the Ethernet frame is stripped and rebuilt with new source and destination MACs. IPv4's Total Length field tells the receiver where the payload truly ends — Ethernet's 46-byte minimum padding is not part of the IP datagram.

**IPv6.** Same encapsulation model as IPv4, different EtherType: `0x86DD`. The big change is at the address-resolution layer: instead of ARP, IPv6 uses **Neighbor Discovery Protocol (NDP)** over ICMPv6, which sends Neighbor Solicitation messages to solicited-node multicast MAC addresses (`33:33:FF:xx:xx:xx`) instead of broadcasting. That dramatically reduces overhead on large networks. The day ARP becomes vestigial is approaching, especially with IPv6-mostly deployments using DHCP option 108.

## Visual cues for image generation

- A single horizontal line across the page with five workstations and a laser printer hung off it as taps — Metcalfe's 1973 PARC sketch redrawn, labelled "the ether," 2.94 Mbps, 11 November 1973.
- An exploded Ethernet II frame diagram with each field annotated by byte count and example hex value: preamble `0x55` × 7, SFD `0xD5`, destination `FF:FF:FF:FF:FF:FF`, source `AA:BB:CC:00:00:01`, EtherType `0x0806`, ARP payload, FCS.
- A leaf-spine fabric diagram for an AI training cluster — 64 racks, top-of-rack switches at the leaves, eight spines above, every link labelled 800 GbE, with a callout: "Broadcom Tomahawk 6, 102.4 Tbps single chip, June 2025."
- A side-by-side: left, a switch flooding an unknown destination MAC out every port; right, the same switch unicasting to one port after the MAC table learned the source from a returning frame.
- A timeline ribbon from 1973 to 2026 with rate doublings marked: 2.94 Mbps (1973), 10 Mbps (1980), 100 Mbps (1995), 1 Gbps (1999), 10 Gbps (2002), 100 Gbps (2010), 400 Gbps (2017), 800 Gbps (2024), 1.6 Tbps (2026 expected). Annotation at the bottom: "same frame format throughout."
- A cutaway of a Tomahawk 6-Davisson switch with co-packaged optics — the optical engines sitting on the ASIC substrate, fibers going straight into the package, with a power-budget callout next to a stack of pluggable transceivers labelled "~180 MW for 1 M GPUs the old way."

## Sources

### IEEE standards

- [IEEE 802.3-2022 (consolidated base)](https://standards.ieee.org/ieee/802.3/10422/)
- [IEEE 802.3df-2024 (800 GbE / 400 GbE amendment)](https://standards.ieee.org/ieee/802.3df/11107/)
- [IEEE P802.3dj 1.6 TbE — December 2025 ballot](https://grouper.ieee.org/groups/802/3/email_dialog/msg01764.html)
- [IEEE P802.3dj working group](https://www.ieee802.org/3/dj/index.html)
- [IEEE 802.1DG-2025 — automotive TSN profile](https://1.ieee802.org/publication-ieee-802-1dg-2025/)

### RFCs

- [RFC 826 — An Ethernet Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826)
- [RFC 894 — IP over Ethernet](https://www.rfc-editor.org/rfc/rfc894)

### Foundational papers

- [Metcalfe & Boggs (1976) — "Ethernet: Distributed Packet Switching for Local Computer Networks," CACM 19(7)](https://dl.acm.org/doi/10.1145/360248.360253)
- [Borrill (2026) — "The Bilateral Efficiency of Ethernet: Recalibrating Metcalfe and Boggs After Fifty Years"](https://arxiv.org/abs/2603.19406)
- [Poutievski et al. (2022) — "Jupiter Evolving," SIGCOMM '22](https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/)
- [Bai et al., Meta (2024) — "RDMA over Ethernet for Distributed AI Training at Meta Scale," SIGCOMM '24](https://dl.acm.org/doi/10.1145/3651890.3672233)

### Vendor and engineering blogs

- [Broadcom — Tomahawk 6 ships, June 2025](https://www.globenewswire.com/news-release/2025/06/03/3092820/19933/en/Broadcom-Ships-Tomahawk-6-World-s-First-102-4-Tbps-Switch.html)
- [Broadcom — Tomahawk 6-Davisson with co-packaged optics, October 2025](https://www.globenewswire.com/news-release/2025/10/08/3163429/19933/en/Broadcom-Announces-Tomahawk-6-Davisson-the-Industry-s-First-102-4-Tbps-Ethernet-Switch-with-Co-Packaged-Optics.html)
- [Meta Engineering — RoCE networks for distributed AI training at scale](https://engineering.fb.com/2024/08/05/data-center-engineering/roce-network-distributed-ai-training-at-scale/)
- [Meta Engineering — October 4 2021 outage details](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Google Cloud — 25 years of data-center networking](https://cloud.google.com/blog/products/networking/speed-scale-reliability-25-years-of-data-center-networking)
- [SDxCentral — Inside Spectrum-X](https://www.sdxcentral.com/analysis/inside-spectrum-x-nvidias-ethernet-networking-platform/)
- [Ethernet Alliance — 200/400GBASE-R PCS/PMA deep dive](https://ethernetalliance.org/blog/2018/03/28/a-deep-dive-into-the-802-3bs-200gbase-r-and-400gbase-r-pcspma/)
- [ipSpace.net — SPB, TRILL, EVPN](https://blog.ipspace.net/2024/04/spb-trill-evpn/)
- [Ultra Ethernet Consortium — Specification 1.0 launch](https://ultraethernet.org/ultra-ethernet-consortium-uec-launches-specification-1-0-transforming-ethernet-for-ai-and-hpc-at-scale/)
- [Linux Foundation — Ultra Ethernet Consortium announcement](https://www.linuxfoundation.org/press/announcing-ultra-ethernet-consortium-uec)
- [SONiC Foundation](https://sonicfoundation.dev/)
- [FlexOptix — Linear Pluggable Optics](https://www.flexoptix.net/en/blog/blog/introducing-linear-pluggable-optics)
- [Introl — fiber-optics state of the art 2025](https://introl.com/blog/fiber-optics-data-center-state-of-art-optical-interconnect-2025)

### Security advisories

- [Cisco — Catalyst 9000 Ethernet-frame DoS (cisco-sa-cat9k-PtmD7bgy)](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cat9k-PtmD7bgy)
- [Trend Micro — Operation Zero Disco (CVE-2025-20352)](https://www.trendmicro.com/en_us/research/25/j/operation-zero-disco-cisco-snmp-vulnerability-exploit.html)
- [Network World — chained Catalyst CVEs (March 2026)](https://www.networkworld.com/article/4150169/chained-vulnerabilities-in-cisco-catalyst-switches-could-induce-denial-of-service.html)
- [Arista — gNMI Set authentication bypass](https://www.arista.com/en/support/advisories-notices/security-advisory/19862-security-advisory-0099)

### News

- [Computerworld — How Ethernet became the world's networking standard](https://www.computerweekly.com/news/252489944/How-Ethernet-became-the-worlds-networking-standard)
- [Network World — Ethernet vs Token Ring](https://www.networkworld.com/article/816207/lan-wan-ethernet-vs-token-ring.html)
- [Network World — NVIDIA networking roadmap](https://www.networkworld.com/article/4050881/nvidia-networking-roadmap-ethernet-infiniband-co-packaged-optics-will-shape-data-center-of-the-future.html)
- [Krebs on Security — what happened to Facebook, Instagram, WhatsApp (October 2021)](https://krebsonsecurity.com/2021/10/what-happened-to-facebook-instagram-whatsapp/)
- [The Stack — AWS October 2025 outage cause](https://www.thestack.technology/aws-outage-cause-network/)
- [AWS — December 2021 US-EAST-1 post-mortem](https://aws.amazon.com/message/12721/)
- [Computer History Museum — Ethernet 50th anniversary](https://computerhistory.org/press-releases/ethernet50/)
- [MIT News — Metcalfe wins ACM Turing Award](https://news.mit.edu/2023/bob-metcalfe-wins-acm-turing-award-0322)
- [ACM — 2022 Turing Award page for Bob Metcalfe](https://awards.acm.org/about/2022-turing)

### Wikipedia

- [Ethernet frame](https://en.wikipedia.org/wiki/Ethernet_frame)
- [MAC address](https://en.wikipedia.org/wiki/MAC_address)
- [Robert Metcalfe](https://en.wikipedia.org/wiki/Robert_Metcalfe)
- [IEEE 802.1Q (VLAN)](https://en.wikipedia.org/wiki/IEEE_802.1Q)
- [IEEE 802.1AE (MACsec)](https://en.wikipedia.org/wiki/IEEE_802.1AE)
- [VLAN hopping](https://en.wikipedia.org/wiki/VLAN_hopping)
- [Jumbo frame](https://en.wikipedia.org/wiki/Jumbo_frame)
- [EtherType](https://en.wikipedia.org/wiki/EtherType)
- [Power over Ethernet](https://en.wikipedia.org/wiki/Power_over_Ethernet)
- [Physical coding sublayer](https://en.wikipedia.org/wiki/Physical_coding_sublayer)
- [Terabit Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)
- [OSI model](https://en.wikipedia.org/wiki/OSI_model)
