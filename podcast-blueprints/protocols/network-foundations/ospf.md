---
id: ospf
type: protocol
name: Open Shortest Path First
abbreviation: OSPF
etymology: "[O]pen [S]hortest [P]ath [F]irst"
category: network-foundations
year: 1989
rfc: RFC 2328
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [ip, ipv6, bgp, icmp, ethernet, wifi, arp, tcp, udp]
related_pioneers: [john-moy, radia-perlman, edsger-dijkstra]
related_outages: []
related_frontier: []
related_rfcs: [2328, 5340]
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSPF-Adjacency-process.drawio.png/500px-OSPF-Adjacency-process.drawio.png", caption: "The OSPF adjacency process — eight states from Down to Full. Every adjacency on every router walks this diagram every time a link comes up. Sticking in ExStart or Loading is the classic OSPF debugging signature.", credit: "Wikimedia Commons / CC BY-SA" }
visual_cues:
  - "Eight-state OSPF adjacency machine as a horizontal pipeline — Down, Init, 2-Way, ExStart, Exchange, Loading, Full — with the typical wedge points (MTU mismatch at ExStart, missing key at Init) called out in red."
  - "Side-by-side: a 1990s timeline of '40-second Dead' versus a 2026 timeline of '900 ms BFD detect + 50 ms SPF + 25 ms LFA reroute' — same failure, two orders of magnitude faster."
  - "A 32-by-32 spine-leaf fabric with one Type-1 LSA flooding outward over every adjacency, then the same fabric with the RFC 9667 Dynamic Flooding subgraph drawn as a sparse spanning tree — the contrast is the whole story."
  - "OSPF Flex-Algo as three transparent overlays on the same physical topology — Algo 128 'low-latency' tracing one path, Algo 129 'avoid leased lines' tracing another, Algo 130 'green-energy' tracing a third — all computed from the same LSDB."
  - "John Moy at a Proteon desk in 1988 sketching link-state on graph paper; Edsger Dijkstra at an Amsterdam café in 1956 doing the same — split-screen, thirty-three years apart, same algorithm."
  - "OSPFv2 24-byte header laid out as labelled bytes — Version, Type, Length, Router ID, Area ID, Checksum, AuType, Authentication — with the five packet types (Hello, DBD, LSR, LSU, LSAck) listed beside the Type field."
---

# OSPF — Open Shortest Path First

## In one breath

OSPF is the link-state interior gateway protocol that draws the map inside almost every enterprise, MPLS-VPN, and mid-tier provider network. Every router floods a description of its own links, every router holds an identical Link State Database, and every router independently runs Dijkstra's shortest-path-first algorithm on that database to compute its routing table. No router trusts another's path computation — they all derive the same answer from the same graph. If you have ever debugged a broken adjacency stuck in ExStart, you have met OSPF.

## The pitch (cold-open)

In 1956, a Dutch mathematician sat in an Amsterdam café and invented the shortest-path algorithm in about twenty minutes. He didn't publish it for three years and never gave it a catchy name. Three decades later, in an office park in Westborough, Massachusetts, an engineer named John Moy turned that algorithm into a protocol called OSPF. The spec they obey, RFC 2328, was published in April 1998 and is 244 pages long — Internet Standard 54, unchanged at the level of frame format for twenty-eight years. It is older than Wi-Fi. It is older than Google. It is older than half the people who configure it. And every modern feature you stack on top of it — Segment Routing, Flex-Algo, SRv6, BFD Strict-Mode — is an extension of that 1998 document, not a replacement.

## How it actually works

OSPF rides directly on IP as protocol number 89. There is no TCP underneath, no UDP. Reliability is implemented inside OSPF itself: every Link State Update is explicitly acknowledged, every LSA carries a sequence number and a checksum, and the Database Description exchange uses Init, More, and Master-Slave bits to keep both sides in lockstep. The simulator's spine has eight steps, and they are the spine of this section too.

First, Hello. Each OSPF-enabled interface multicasts a Hello packet to `224.0.0.5` — `FF02::5` for IPv6 — every ten seconds on a point-to-point link, every thirty seconds on a non-broadcast multi-access link. The Hello carries the router's ID, its options, and the list of neighbours it currently sees on this link. Bidirectional visibility is established the moment a Hello lists *you* in its neighbours field.

Second, the adjacency state machine. Neighbours progress through Down, Init, 2-Way, ExStart, Exchange, Loading, and Full — with Attempt for NBMA. On a multi-access segment such as Ethernet, routers elect a Designated Router and a Backup. The DR is the only neighbour every router on the segment becomes Full with, cutting the adjacency mesh from N-squared to N. Election is non-preemptive: once a DR is elected, a higher-priority arrival does not take over.

Third, synchronise the LSDB. Routers exchange Database Description packets carrying LSA *headers* — sequence, age, length — then send Link State Request packets asking for the LSAs they don't have, then receive them in Link State Update packets, then explicitly acknowledge with LSAck. On a healthy point-to-point link this whole dance — Hello to Full — takes well under a second.

Fourth, flood, throttle, age. Every LSA carries a 16-bit sequence number, a 16-bit age, and a 16-bit checksum. New LSAs flood through the area in seconds; routers refresh their own LSAs every thirty minutes (`LSRefreshTime` is 1800 seconds) and treat any LSA at `MaxAge`, 3600 seconds, as a withdrawal. The RFC 8405 SPF back-off algorithm — INITIAL 50 ms, SHORT_WAIT 200 ms, LONG_WAIT 5000 ms — throttles SPF runs when topology churns so the control plane doesn't melt.

Fifth, run Dijkstra. Once the LSDB is identical on every router, each runs the shortest-path-first algorithm — invented by Edsger Dijkstra in 1956, published in *Numerische Mathematik* in 1959 — on its own copy and installs the resulting tree into the forwarding table. Areas, with Area 0 as the mandatory backbone, keep LSDBs scoped so the SPF computation stays tractable. A typical campus area is 100 to 200 routers and an LSDB under 1 MB.

Sixth, stay converged. Modern deployments pair OSPF with Bidirectional Forwarding Detection — typical timers are 300 ms by 3 multipliers, so a failure shows up in roughly 900 milliseconds instead of the protocol's default 40-second Dead Interval. RFC 9355 BFD Strict-Mode goes further: the OSPF state machine refuses to progress past Init to 2-Way until the BFD session is up, killing the long-standing failure mode where BFD was configured but never came up and OSPF formed an adjacency anyway.

### Header at a glance

OSPFv2's common header is 24 bytes and looks like this when you read it byte by byte:

- **Version** — 1 byte. Always `2` for OSPFv2, `3` for OSPFv3.
- **Type** — 1 byte. The five packet types: `1` Hello, `2` Database Description, `3` Link State Request, `4` Link State Update, `5` Link State Acknowledgment.
- **Packet length** — 2 bytes. Whole OSPF packet, header included, in bytes.
- **Router ID** — 4 bytes. The 32-bit identifier of the originating router, formatted like an IPv4 address but not required to be routable. Convention is the highest loopback address.
- **Area ID** — 4 bytes. `0.0.0.0` for the backbone.
- **Checksum** — 2 bytes. Standard IP checksum over the packet, excluding the 64-bit Authentication field.
- **AuType** — 2 bytes. `0` no authentication, `1` simple cleartext password, `2` cryptographic — Keyed-MD5 in the original RFC, HMAC-SHA-1 through SHA-512 in RFC 5709.
- **Authentication** — 8 bytes. Meaning depends on AuType. For cryptographic auth this carries the KeyID, the cryptographic-data length, and a non-decreasing sequence number; the actual digest is appended after the OSPF body and is not counted in Packet Length.

OSPFv3's header is 16 bytes — the AuType and Authentication fields are gone, replaced by an Instance ID byte that lets multiple OSPFv3 instances share one link. Authentication moved out to either IPsec, per RFC 4552, or the Authentication Trailer appended after the body, per RFC 7166.

### State machine in three sentences

A neighbour starts in Down, hears a Hello and goes to Init, sees its own Router ID in the neighbour's Hello and goes to 2-Way, then on a point-to-point link or for a DR-to-non-DR pair on a multi-access segment proceeds through ExStart, Exchange, and Loading to Full. ExStart is master-slave negotiation: the higher Router ID wins and sets MS=1. Exchange is the DBD swap of LSA headers; Loading is the LSR/LSU exchange of the actual LSAs you don't already have; Full is "our LSDBs match — run Dijkstra."

### Reliability, area scoping, and security mechanics

OSPF is one of the very few production protocols to re-implement transport-layer guarantees above raw IP. Every Link State Update is acknowledged with an LSAck; every LSA carries a sequence number starting at `0x80000001`, a 16-bit checksum, and a 16-bit age that climbs to `MaxAge` of 3600 seconds. Reliable flooding is the protocol; there is no TCP to lean on.

Areas keep the SPF computation tractable. Area 0 is the backbone and must be contiguous; non-zero areas connect to it via Area Border Routers. A Standard area carries every LSA type. A Stub area drops Type-5 externals and gets a default route from the ABR instead. A Totally Stubby area, a Cisco knob, also drops Type-3 inter-area summaries. An NSSA — Not So Stubby Area, RFC 3101 — allows local Type-7 externals that the ABR optionally translates back into Type-5s at the area boundary. Virtual links exist to repair an Area-0 partition or re-attach a stranded area; modern guidance is "if you keep finding them in your config, redesign Area 0."

Security in 2026 means HMAC-SHA-256 authentication via RFC 5709 keychains for OSPFv2, and the Authentication Trailer per RFC 7166 for OSPFv3. Plaintext AuType=1 and bare Keyed-MD5 belong in a museum — and after the Nakibly disclosures at Black Hat in 2011 and 2013, even MD5 is not enough on its own. The 2026 rule of thumb is HMAC-SHA-256, BFD Strict-Mode where both ends support it, and an `acl deny ip any any 89` on every external segment.

## Where it shows up in production

**Microsoft Azure.** Azure's network fabric uses OSPF for internal route distribution between routers in the same region; BGP handles inter-region. Public ipspace.net analyses by Ivan Pepelnjak document the design pattern. Azure's January 25, 2023 ninety-minute global outage — covered in detail under "Things that go wrong" below — is, in operator terms, exactly the kind of IGP recompute storm OSPF deployments need to plan for.

**Cumulus Linux and NVIDIA SONiC.** Both ship OSPF via FRRouting as the canonical alternative to running BGP in the data centre. Cumulus is in production at Yahoo!, eBay, Snap, and across NVIDIA's reference Spectrum-X AI fabrics; SONiC powers top-of-rack switches at Microsoft Azure, LinkedIn, Tencent, and Alibaba. Both expose OSPF through the FRR `ospfd` and `ospf6d` daemons.

**FRRouting itself.** Forked from Quagga in April 2017 by Cumulus Networks, 6WIND, and Big Switch Networks — the announcement cited a backlog of about 3,000 unmerged Quagga patches as the trigger — FRR is now stewarded by the Linux Foundation. Its OSPF daemons ship in Vyatta and VyOS edge routers, OpenShift, Calico, and most cloud-native router VNFs. Configuration is via `vtysh`. Public CVE traffic — most recently CVE-2025-61103 and CVE-2025-61106 in October 2025 — tracks how widely FRR is deployed.

**Cisco IOS-XR and Juniper Junos.** The two dominant tier-2-and-up vendor stacks. Both ship OSPF with full Segment Routing per RFC 8665 and 8666, Flex-Algo per RFC 9350, and BFD Strict-Mode per RFC 9355. Cisco's IOS-XR has shipped Flex-Algo since 2019; Junos OS Evolved 24.2R1 in August 2024 brought Flex-Algo with SRLG-exclude and link-delay normalisation, plus OSPFv2 HMAC-SHA-2 keychain authentication, to ACX7000 and PTX10000 hardware.

**Tier-1 backbones run something else.** NTT, Verizon (the former MCI/UUNET asset), Lumen, Sprint, and Cogent historically chose IS-IS — Radia Perlman's parallel design — for the backbone. AT&T, Telstra, and many tier-2 and regional ISPs run OSPF. The rule from the mid-1990s religious war still holds: tier-1 backbones lean IS-IS, enterprise and mid-tier providers lean OSPF.

**Hyperscaler data-centre fabrics increasingly skip both.** RFC 7938 — "Use of BGP for Routing in Large-Scale Data Centers," Lapukhov, Premji, Mitchell, August 2016 — documents the eBGP-everywhere designs that Meta and Microsoft use in their leaf-spine fabrics. The cited rationale: BGP's simpler state machine, no DR/BDR, no adjacency states, plus better path-hunting controllability through ASN allocation and TCP-based transport. OSPF still appears in management overlays and in non-hyperscale fabrics, but in the hyperscale DC the protocol of the moment is BGP.

**Enterprise WAN at scale.** Walmart, JPMorgan Chase, the U.S. Department of Defense's NIPRNet and SIPRNet, and large airlines run multi-area OSPF inside SD-WAN overlays — usually with stub or totally stubby branch areas and an Area 0 backbone of regional hubs. Exact numbers are not public, but Cisco Live operator talks across 2023–2025 cite 1,500 to 3,000 routers per OSPF domain split across 20 to 40 areas.

**MPLS-VPN PE-CE.** RFC 4577 and the OSPF sham-link feature mean virtually every enterprise consuming L3VPN service from AT&T, Verizon Business, Orange Business, or Telstra runs OSPF between the customer router and the carrier PE.

## Things that go wrong

**Nakibly and "Owning the Routing Table" — Black Hat 2011 and 2013.** The setup: a Cisco IOS 7200-series router running OSPF in an area with standard MD5 authentication, relying on the protocol's "fight-back" mechanism — when a router sees a false LSA purporting to come from itself, it re-originates the correct one to suppress the attack. Gabi Nakibly, then at Rafael and later at the Technion, and colleagues at Ben Gurion University's Telekom Innovation Laboratories found that the spec's fight-back trigger conditions are ambiguous. By crafting LSAs that pass the receiver's accept check but are not recognised as self-originated by the impersonated router, an attacker could inject persistent false topology that was never fought back. The 2013 follow-up extended the attack to wipe the routing table of a target from a single, well-crafted packet, and demonstrated that one compromised router could persistently take over the routing tables of every other router in the OSPF AS.

The lesson the industry took away: even MD5 was not enough to assume safety against an attacker who could speak OSPF on any link. The long arc that followed produced HMAC-SHA-256 in RFC 5709, the OSPFv3 Authentication Trailer in RFC 7166, BFD Strict-Mode in RFC 9355, and a permanent culture of paranoia about which interfaces are allowed to speak OSPF at all.

**Microsoft 365 / Azure WAN — January 25, 2023.** The setup: Microsoft's global WAN runs a private IGP plus BGP. A network engineer issued a planned change to update an IP address on a WAN router. The mistake, in Microsoft's own preliminary post-incident review: the command "had not been vetted using our full qualification process on the router on which it was executed" — and behaved very differently on that platform than expected. Instead of being scoped to one interface it caused the router to send messages to all other routers in the WAN, which then recomputed their adjacency and forwarding tables simultaneously. During that recompute, packets stopped forwarding.

The consequence: cascading BGP withdrawal and re-advertisement leaked outwards to the global Internet — Cisco's ThousandEyes captured the external view — and Teams, Outlook, SharePoint, and Xbox Live went degraded for ninety minutes worldwide. Mitigation began with a rollback at 07:05 UTC; full recovery at 12:43. The incident is the canonical post-2020 case study in why even non-public IGPs need staged-rollout and command vetting on a par with the BGP edge.

**Cisco OSPF LSA Manipulation Vulnerability — CVE-2013-0149.** All unfixed versions of Cisco IOS, IOS-XE, ASA, PIX, and FWSM running OSPF were vulnerable to a crafted LSA that could flush the target router's routing table and propagate the malicious LSA through the entire OSPF area. Recovery required deleting and reapplying the OSPF configuration or rebooting; `clear ip ospf process` did not help. Cisco disclosed it on August 1, 2013, as `cisco-sa-20130801-lsaospf`. A single attacker with OSPF adjacency could blackhole entire ASes. Cisco's workaround recommendation was MD5 authentication — exactly what Nakibly's work showed was not enough — which is why the long arc to HMAC-SHA and BFD Strict-Mode took the rest of the decade.

**FRRouting OSPF NULL-pointer DoS cluster — October 2025.** FRR versions 4.0 through 10.4.1 — the routing stack of Cumulus Linux, SONiC, OpenShift networking, Calico, and many cloud-native VNFs — had two flaws in `ospf_ext.c`. `show_vty_ext_pref_pref_sid` (CVE-2025-61106) and `show_vty_ext_link_lan_adj_sid` (CVE-2025-61103) failed to validate pointer references when processing OSPF extended-link and extended-prefix data carried in Segment-Routing-related LSAs. A specially crafted OSPF packet triggered a NULL-pointer dereference, an unauthenticated remote crash of the `ospfd` daemon, OSPF adjacency loss, and blackholed routing across the affected nodes. CVSS v3 was around 7.5. Fix shipped upstream in pull request #19480 in late October 2025. If you ship FRR in any product, confirm you are past 10.4.2 or carrying the backports.

**The MD5-key-rollover classic — NANOG folklore at this point.** Two operators on either end of an OSPF adjacency change MD5 keys non-atomically. Operator A removes key 1 and adds key 2 at 02:00. Operator B is asleep. OSPF receives mismatched-key packets, drops them silently — some implementations log `OSPF-4-AUTH_TYPE_NBR_MISMATCH` — Hellos still go out but neighbours never reach 2-Way. The adjacency tears down at the Dead Interval, all routes through that neighbour disappear, and because the link still pings, on-call engineers spend hours chasing the wrong fault. The cure is multiple key IDs with overlapping validity windows — RFC 5709 §3.3 and the RFC 8177 key-chain model are explicitly designed for this. Junos OS Evolved 24.2R1, August 2024, made the rollover painless with HMAC-SHA-2 keychain support.

**LSA flooding storms from an unstable link.** A flaky fibre, a dirty optic, a misbehaving MACSEC link flaps on a sub-second timescale. Every up/down event re-originates a Router LSA; every router in the area floods it, runs SPF, reflects forwarding changes. Without throttling, the area enters CPU saturation — sometimes total loss of forwarding while routers spin in SPF. The cure: RFC 8405 SPF back-off (now standard on Cisco IOS-XR, Junos, Nokia SR OS), LSA-origination throttling (`timers throttle lsa all`), and dampening the offending link with carrier-delay or with the underlying transport, such as Ethernet OAM or BFD Echo.

## Common pitfalls (for the practitioner)

**Mismatched HelloInterval or DeadInterval — no adjacency, no negotiation.** Two routers will sit in Init forever if their Hello or Dead intervals differ by even one second. There is no negotiation in OSPF for these timers. Cure: standardise per-interface in your template; use `show ip ospf interface eth0` to dump both sides' actual values before you open a ticket. This is the single most common stuck-state in the protocol.

**The 40-second default DeadInterval is a 1990s artefact.** A 40-second DeadInterval means link-failure detection takes forty seconds — unacceptable on any modern backbone. Cure: pair OSPF with BFD (300 ms by 3 multiplier is roughly 900 ms detection), or use RFC 9355 BFD Strict-Mode, which refuses adjacency until BFD is up. Sub-second failover is the modern baseline.

**MTU mismatch wedges adjacency in ExStart.** OSPF places interface MTU in the DBD packet. If two neighbours disagree, both stay stuck in ExStart or Exchange. Symptoms: neighbours visible in `show ip ospf neighbor` at state ExStart but never progressing. Cure: fix the underlying MTU mismatch; as a workaround, configure `ip ospf mtu-ignore` on both ends (Cisco) or `mtu-ignore` (Junos / FRR). This is the single most common interview question on OSPF troubleshooting.

**Stuck in 2-Way on a broadcast segment.** Both routers have priority 0, so nobody can be DR. Cure: on every multi-access segment, choose your DR and BDR explicitly with `ip ospf priority` — pattern is 100 on the primary, 90 on the backup, 0 on routers that must never be DR. Default priority 1 makes the election a Router-ID race that depends on boot order — non-deterministic and entertaining to debug.

**LSA flooding storms in spine-leaf fabrics.** A single Type-1 LSA from one leaf in a 1024-spine fabric multicasts to every other leaf, and OSPF's default flooding is N-to-N. In an AI training cluster this melts the control plane. Cure: RFC 9667 Dynamic Flooding lets the area elect a flooding subgraph, and FRR and IOS-XR both implement it. Or skip OSPF entirely and use eBGP everywhere per RFC 7938, as Microsoft, Meta, and Google's DC fabrics do.

**Redistributing the full BGP table into OSPF.** A classic outage pattern: an internet-table-sized injection — about a million IPv4 routes in 2026 — becomes a million Type-5 LSAs, explodes the LSDB, drives all routers to MaxAge churn, and can wedge the AS. Cure: never `redistribute ospf into bgp` — or the inverse — without a route-map and a prefix-list permitting only the specific aggregates you actually want.

## Debugging it

The diagnostic command surface is consistent across vendors but spelled differently.

```
# Cisco
show ip ospf
show ip ospf neighbor
show ip ospf database
show ip ospf interface
show ip ospf border-routers
show ip ospf events       # IOS-XR

# Juniper
show ospf overview
show ospf neighbor
show ospf database
show ospf interface
show ospf statistics

# FRRouting (vtysh)
show ip ospf neighbor
show ip ospf database
show ip ospf interface
show ip ospf route
```

On the wire, Wireshark display filters and tcpdump capture filters cover almost everything you need:

```
# Wireshark display filters
ospf                       # all OSPF packets
ospf.hello                 # only Hellos
ospf.lsa.type == 5         # only AS-External LSAs (find redistribution leaks)
ospfv2 && ospf.hello       # OSPFv2 Hello only
ospfv3                     # OSPFv3
ospf.auth.type == 2        # cryptographic auth
ospf.lsa.age == 3600       # MaxAge — find LSAs being withdrawn

# tcpdump capture filters
tcpdump -i eth0 proto 89
tcpdump -i eth0 'proto 89 and host 224.0.0.5'
tcpdump -i eth0 -vvv 'ip proto ospf'
tcpdump -i eth0 'ip6 and proto 89'   # OSPFv3
```

The reliable troubleshooting flow is six steps. One: is Layer 1 and 2 up — `show interface`, `show lldp neighbors`. Two: are OSPF Hellos visible on the wire from both sides — `tcpdump -i eth0 proto 89`. Three: walk the six mismatch reasons Hellos are visible but adjacency never forms — Authentication, Area ID, HelloInterval, DeadInterval, MTU, Stub flag. Four: stuck in ExStart means MTU mismatch. Five: stuck in 2-Way on a broadcast segment means everyone has priority 0. Six: a flapping adjacency is almost always either an SPF storm or a BFD-without-strict-mode failure.

The 2026 timer baseline that ships in most vendor templates: leave Hello at 10 s and Dead at 40 s when BFD covers detection, set BFD timers to 300 ms tx / 300 ms rx with a multiplier of 3 (or aggressive 150 ms / 150 ms / 3 on high-quality fibre), set SPF throttle to `timers throttle spf 50 200 5000` (the RFC 8405 INITIAL / SHORT_WAIT / LONG_WAIT), set LSA-origination throttle to `timers throttle lsa all 0 5000 5000`, and leave MaxAge and LSRefreshTime alone — they are architectural constants.

## What's changing in 2026

**October 2025 — FRRouting OSPF NULL-pointer DoS, CVE-2025-61103 and CVE-2025-61106.** Crafted Extended Prefix and Extended Link Opaque LSAs crashed the OSPF daemon in `ospf_ext.c` for FRR v4.0 through v10.4.1. Fixed upstream in PR #19480. Patch immediately if your edge routers run FRR.

**2025 — RFC 9825, OSPF Prefix Administrative Tags.** Allows arbitrary administrative tags on OSPF prefixes — useful for redistribution policy without overloading the AS-External tag field. Co-authored by Acee Lindem, Peter Psenak, and Yingzhen Qu.

**2025 — RFC 9792, Prefix Flag Extension for OSPFv2 and v3.** A small but useful extension to per-prefix signalling.

**August 2024 — Junos OS Evolved 24.2R1.** Juniper added OSPFv2 HMAC-SHA-2 keychain authentication, Flex-Algo FAD with SRLG-exclude, and link-delay normalisation on ACX7000 and PTX10000 hardware — bringing Flex-Algo from "shipped in IOS-XR since 2019" to "shipped at multi-vendor parity."

**2024 — RFC 9667, Dynamic Flooding on Dense Graphs.** Targets OSPF and IS-IS scaling in spine-leaf AI fabrics. Instead of every router flooding to every neighbour, the area elects a leader that picks a flooding subgraph. The control plane stops melting when you stack 1024 spines. Authors: Tony Li, Peter Psenak, Huaimo Chen, Luay Jalil, Srinath Dontula.

**December 2023 — RFC 9513, OSPFv3 Extensions for SRv6.** SRv6 Capabilities TLV, SRv6 Locator advertisement, SRv6 End SID encoding for OSPFv3. This is the first protocol generation that targets OSPFv3 first — it puts OSPFv3 on functional parity with IS-IS for SRv6, which had RFC 9352. Edited by Peter Psenak.

**February 2023 — RFC 9355, OSPF BFD Strict-Mode.** With strict-mode signalled in Link-Local Signaling, neighbours must not progress from Init to 2-Way until the BFD session is up. A protocol-level fix for the long-known anti-pattern where BFD is configured but the OSPF adjacency forms anyway when BFD fails to come up. Available on Cisco IOS-XR 7.x, Junos 22.x, and FRR 9.x and later.

**February 2023 — RFC 9350, IGP Flexible Algorithm.** The headline OSPF feature of the decade. A router originates a Flexible Algorithm Definition TLV inside the Router Information Opaque LSA, defining a calculation type, a metric type (IGP cost, TE cost, min-delay), and a set of constraints (include or exclude admin-groups, exclude SRLGs, max-link-delay). Routers participating in a Flex-Algo each compute an independent SPF tree under that algorithm's constraints, and SR Prefix-SIDs are advertised per-algorithm. The practical result: an operator can carve a single OSPF/SR fabric into multiple virtual planes — "Algo 128 = low-latency-only, Algo 129 = avoid leased lines, Algo 130 = green-energy paths" — without VRFs or RSVP-TE. Cisco Live 2025 talk BRKMPL-2129 documents production deployments.

**Sub-50 ms convergence is the new service-provider baseline.** Combining BFD (450 to 900 ms detection), RFC 8405 SPF back-off (50 ms INITIAL), Loop-Free Alternates (RFC 5286), Remote-LFA (RFC 7490), and SR Topology-Independent LFA (RFC 9085), modern OSPF/SR-MPLS deployments achieve end-to-end forwarding restoration in 25 to 50 milliseconds — competitive with SDH/SONET 50 ms protection.

**Post-quantum authentication is on the horizon.** The IETF LSR working group has drafts circulating to allow OSPF authentication trailers to use HMAC-SHA-3 and to layer ML-DSA / Dilithium signatures. As of May 2026 these remain drafts; HMAC-SHA-256 stays the recommended production default.

## Fun facts (host material)

**The "F" in OSPF is for "First", not "Fastest".** Common misreading: OSPF stands for "first-fit" or "fastest path." In fact, *Shortest Path First* was the popular name in the 1980s for Dijkstra's algorithm. The protocol is named after the algorithm, not the routing strategy.

**RFC 2328 is the longest unmodified Internet Standard still in active service.** OSPFv2, April 1998, is 244 pages, STD 54, and has been the canonical spec for twenty-eight years. The frame format and core algorithm have not changed. Everything new since — Segment Routing, Flex-Algo, SRv6, BFD Strict-Mode — is layered on through Opaque LSAs and Router Information TLVs, not by rewriting the protocol.

**OSPF has reliable delivery without TCP.** OSPF runs directly on IP as protocol number 89. There is no TCP underneath. Reliability is implemented in OSPF itself: every LSU is explicitly acknowledged with an LSAck; LSAs carry sequence numbers and checksums; the DBD exchange uses Init / More / Master-Slave bits. OSPF is one of the very few production protocols to re-implement transport-layer guarantees above raw IP.

**Radia Perlman designed the competitor, not OSPF.** Radia Perlman — inventor of Spanning Tree Protocol and "Mother of the Internet" — designed IS-IS, the link-state IGP that competed with OSPF and won the tier-1 ISP backbone. The Lemelson-MIT Program credits her with developing the algorithms that make *both* IS-IS and OSPF efficient and scalable. There's a separate episode on her — and one on Edsger Dijkstra too.

**John Moy shipped a working OSPF as a book.** In 2000 Addison-Wesley published Moy's *OSPF Complete Implementation* — a 350-plus-page book that includes the full C++ source code of a portable OSPF speaker, complete with a Linux routing daemon and a Linux/Windows OSPF simulator. AVL trees, Patricia tries, the LSDB ageing and flooding code, the neighbour state machine, Cygwin/Linux/Windows ports — all printed. This is among the very few production-quality protocol implementations ever printed as a book in publishing history.

**224.0.0.5 and 224.0.0.6 are reserved forever.** IANA's IPv4 Multicast Address Space Registry allocates 224.0.0.0/24 as the "Local Network Control Block" — never forwarded by any router. `224.0.0.5` is "OSPFIGP" and `224.0.0.6` is "OSPFIGP-Designated Routers". They were assigned during the OSPFv1 era and have been listed in IANA's registry continuously since the late 1980s. The IPv6 equivalents are `FF02::5` and `FF02::6` in the link-local scope.

## Where this connects in the book

OSPF doesn't appear in the current chapter list — it's covered as a protocol blueprint only. When the book episodes on layer-2-3 routing get to interior gateway protocols, this is the page they will point to.

## See also (other protocol episodes)

**The BGP episode.** OSPF is an IGP and BGP is an EGP, and they cohabit in nearly every production network. iBGP next-hop resolution depends on OSPF: when an iBGP peer advertises a prefix, its next-hop is typically a loopback that is not directly connected, and the local router resolves that next-hop recursively through its IGP — almost always OSPF or IS-IS — to find the actual outgoing interface and MAC. If OSPF loses the next-hop, the iBGP-learned route becomes "next-hop unreachable" and is withdrawn. OSPF convergence is a precondition for BGP convergence.

**The IPv6 episode.** OSPFv2 carries IPv4 only. OSPFv3, RFC 5340 from 2008, was rewritten for IPv6 but via RFC 5838 can also carry IPv4 as a separate address family. Dual-stack networks more commonly run OSPFv2 for IPv4 and OSPFv3 for IPv6 as parallel control planes. SRv6 (RFC 9513, December 2023) is the first protocol generation that targets OSPFv3 first.

**The Ethernet episode.** OSPF on a multi-access broadcast segment such as Ethernet uses DR/BDR election to cut the adjacency mesh from N-squared to N. The election mechanics — non-preemptive, highest priority then highest Router ID — are an OSPF-specific layer on top of the Ethernet broadcast domain.

**The TCP and UDP episodes.** OSPF explicitly does *not* use TCP or UDP. It runs on IP protocol 89 and implements its own reliable flooding. The trade-off vs BGP, which uses TCP port 179: OSPF gets link-local multicast discovery and zero peer configuration, but everything past hop 1 needs to be reinvented. BGP gets TCP delivery and ordering for free but needs explicit peers.

## Visual cues for image generation

- The eight-state OSPF adjacency machine drawn as a horizontal pipeline — Down, Init, 2-Way, ExStart, Exchange, Loading, Full — with the typical wedge points (MTU mismatch at ExStart, missing key at Init) called out in red.
- Side-by-side timelines: '40-second Dead' from the 1990s versus '900 ms BFD detect + 50 ms SPF + 25 ms LFA reroute' from 2026 — same failure, two orders of magnitude faster.
- A 32-by-32 spine-leaf fabric with one Type-1 LSA flooding outward over every adjacency, then the same fabric with the RFC 9667 Dynamic Flooding subgraph drawn as a sparse spanning tree.
- OSPF Flex-Algo as three transparent overlays on the same physical topology — Algo 128 'low-latency' tracing one path, Algo 129 'avoid leased lines' tracing another, Algo 130 'green-energy' tracing a third — all computed from the same LSDB.
- A split-screen sketch: John Moy at a Proteon desk in 1988 drawing link-state on graph paper; Edsger Dijkstra at an Amsterdam café in 1956 doing the same.
- The OSPFv2 24-byte header laid out as labelled bytes with the five packet types (Hello, DBD, LSR, LSU, LSAck) called out alongside the Type field.

## Sources

### RFCs

- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [RFC 5340 — OSPF for IPv6 (OSPFv3)](https://www.rfc-editor.org/rfc/rfc5340)
- [RFC 9350 — IGP Flexible Algorithm](https://www.rfc-editor.org/rfc/rfc9350)
- [RFC 9513 — OSPFv3 Extensions for SRv6](https://www.rfc-editor.org/rfc/rfc9513)
- [RFC 9667 — Dynamic Flooding on Dense Graphs](https://www.rfc-editor.org/rfc/rfc9667)

### Vendor and engineering

- [FRRouting project](https://frrouting.org/)
- [Junos OS Evolved 24.2R1 release notes](https://supportportal.juniper.net/s/article/Junos-OS-Evolved-24-2R1-Release-Notes)
- [FRR PR #19480 — CVE-2025-61103 / 61106 fix](https://github.com/FRRouting/frr/pull/19480)
- [Cisco Live BRKMPL-2129 — SR Flex-Algo (2025)](https://www.ciscolive.com/c/dam/r/ciscolive/global-event/docs/2025/pdf/BRKMPL-2129.pdf)
- [IETF LSR Working Group](https://datatracker.ietf.org/wg/lsr/about/)
- [Containerlab](https://containerlab.dev)

### Wikipedia

- [Open Shortest Path First](https://en.wikipedia.org/wiki/Open_Shortest_Path_First)

### Archives

- [NANOG 50 — Eastlake on RBridges/TRILL (Perlman context)](https://archive.nanog.org/meetings/nanog50/presentations/Sunday/NANOG50.Talk8.EastLake-final-RBridgesAndTRILL%2026.pdf)
