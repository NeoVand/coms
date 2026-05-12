===== PROTOCOL · OSPF · Open Shortest Path First =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs, books,
engineering blog posts, conference talks, and podcasts on this topic, all
distilled into one document. Surface-level "what is OSPF" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — John Moy at Proteon in the late 1980s, the IETF
  OSPF working group, the IS-IS vs OSPF religious war of the late 80s/90s,
  the journey from OSPFv1 (RFC 1131, 1989) to OSPFv2 (RFC 2328, 1998 —
  still canonical) to OSPFv3 for IPv6 (RFC 5340, 2008), and the Moy book
  era at Cascade and Ascend.
- Mechanics deep enough that someone could re-implement a minimal OSPF
  speaker after reading: Hello protocol, neighbor adjacency state machine,
  LSA types 1–11, the link-state database, SPF (Dijkstra) computation,
  flooding, DR/BDR election, area types (stub, totally stubby, NSSA),
  authentication.
- Real failures and famous incidents — large-scale LSA flooding storms,
  the classic "incompatible OSPF MD5 keys" outage pattern, Microsoft's
  2019 Azure routing incident, route-flap dampening tales, the WANEM /
  Level 3 stories, OSPF Type 5/7 misconfigurations bringing down ASes.
- Connections to adjacent protocols — BGP as the eternal EGP counterpart,
  IS-IS as the eternal alternative IGP, MPLS label distribution, IPv4 vs
  IPv6 (OSPFv2 vs OSPFv3), the use of raw IP protocol 89 rather than
  TCP/UDP, multicast (224.0.0.5/224.0.0.6), Segment Routing.
- 2024–2026 developments — OSPF SR-MPLS (RFC 9355), SRv6 integration,
  OSPF Flex-Algo, BIER-TE, post-quantum signature work for OSPF
  authentication, IETF LSR working group drafts, FRRouting / BIRD /
  OpenBSD ospfd releases of the last 24 months.
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older
sources as suspect and verify them against the current state. Define every
term you use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or
DOI. Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL,
USENIX), archive.org for older or dead links, and the relevant standards
body (IETF datatracker for the LSR / OSPF working groups, NANOG archives,
RIPE Labs). Past passes have left 121 `[needs source]` markers across 46
reports — please try harder this round, but never invent a source to avoid
one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how OSPF relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, PTP. **IS-IS is the obvious
unlisted neighbor — pull it in heavily.**

# Topic

The topic of this research is **OSPF — Open Shortest Path First** — the
link-state Interior Gateway Protocol that, alongside IS-IS, has carried
most of the world's enterprise and service-provider IGP traffic for the
past three decades. OSPF was designed in the late 1980s at Proteon by
John Moy and standardised by the IETF as OSPFv1 in RFC 1131 (1989),
then OSPFv2 in RFC 2328 (1998), which remains the canonical text. OSPFv3
for IPv6 followed in RFC 5340 (2008). The story is partly technical —
Dijkstra's shortest-path-first algorithm applied to network topology
databases — and partly political: the late-80s/90s religious war between
OSPF (IETF, IP-native) and IS-IS (originally OSI, later adopted for IP).

OSPF runs directly over IP as protocol number 89 (no TCP, no UDP). It
uses link-local multicast (224.0.0.5 AllSPFRouters, 224.0.0.6
AllDRouters; FF02::5 / FF02::6 for OSPFv3). It is the IGP of choice for
most enterprise core networks and a large share of ISP backbones, with
IS-IS dominating Tier-1 and large-CDN backbones for historical and
scaling reasons.

Related protocols and standards likely connected to OSPF that you should
verify and expand on:

  - **BGP** (already in the encyclopedia) — the EGP that OSPF redistributes
    into and out of; the IGP-vs-EGP positioning is foundational.
  - **IS-IS** — the eternal alternative IGP; explain the OSPF-vs-IS-IS
    tradeoffs (TLV extensibility, area model, scalability, encoding).
  - **IPv4 / IPv6** — OSPFv2 is IPv4, OSPFv3 is IPv6 (and per RFC 5838
    also carries IPv4 in some deployments).
  - **MPLS** — OSPF-TE (RFC 3630) carries traffic-engineering extensions
    for MPLS label-distribution interaction with RSVP-TE / LDP.
  - **Segment Routing** — RFC 9355 (OSPF SR-MPLS extensions) and SRv6
    are the modern integration story.
  - **BFD** (Bidirectional Forwarding Detection) — sub-second failure
    detection paired with OSPF.
  - **Multicast** — OSPF uses 224.0.0.5 / 224.0.0.6 for adjacency and
    flooding (no IP multicast routing — pure link-local).
  - **TCP** — pointedly NOT used; OSPF is one of the rare modern protocols
    that runs on raw IP.

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (LSA, LSDB, SPF, Dijkstra, area, backbone area, ABR, ASBR, DR, BDR,
  Hello, adjacency, ExStart/Exchange/Loading/Full, stub area, totally
  stubby area, NSSA, Type-1 through Type-11 LSAs, opaque LSA, Router
  ID, MaxAge, LSRefreshTime, MD5/HMAC-SHA authentication, virtual link,
  sham link, Flex-Algo, segment-routing prefix-SID)
- [ ] **≥4** dated entries on the history timeline (1987 → 2026)
- [ ] Full OSPFv2 packet format with bit widths AND OSPFv3 packet format
      differences (the IPv6 changes are non-trivial)
- [ ] OSPF neighbor adjacency state machine (mermaid `stateDiagram-v2`):
      Down → Attempt/Init → 2-Way → ExStart → Exchange → Loading → Full
- [ ] A sequence diagram of OSPF adjacency formation through full LSDB
      sync (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (enterprise core fleets, NTT, Comcast backbone, Microsoft
      Azure, AWS, Cisco IOS-XR / Juniper Junos / Arista EOS / FRRouting /
      BIRD / OpenBSD ospfd usage)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (John Moy as principal architect, Radia Perlman for link-state
      origin via SPF / spanning tree work, Edsger Dijkstra for the
      algorithm, plus modern OSPF WG figures: Acee Lindem, Tony
      Przygienda, Peter Psenak, Christian Hopps for IS-IS adjacency)
- [ ] **≥3** RFCs with number, year, status, and notable-section
      pointers — minimum RFC 2328 (OSPFv2), RFC 5340 (OSPFv3), RFC 9355
      (OSPF SR-MPLS), and ideally RFC 7770 (Router Info), RFC 3623
      (Graceful Restart), RFC 5709 (HMAC-SHA auth)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (Microsoft Azure routing incidents, large-scale LSA
      storm war stories from NANOG, the classic "MD5 key mismatch"
      outage pattern, route-flap dampening tales, AT&T / Sprint / Level
      3 backbone tales)
- [ ] **≥3** fun facts / anecdotes with sources (John Moy's OSPF book
      cover with the routers on it, the IS-IS-vs-OSPF holy war beats,
      the "Proteon thought it would win the router business" story,
      the Dijkstra-himself-disliked-the-name story for SPF)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (Hello/Dead intervals, SPF throttling — `spf-delay-ietf`, BFD
      pairing, LSA refresh tuning, area design — backbone reachability,
      virtual links to be avoided, MTU mismatches stuck in ExStart,
      authentication-key rollover, redistribution into BGP control)
- [ ] **≥3** Wireshark / capture-tool filter examples (`ospf`,
      `ospf.lsa.type`, `ospf.hello`, plus tcpdump `proto 89`)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (FRRouting OSPF SR-MPLS landings, IETF LSR WG drafts on Flex-Algo
      and BIER-TE, post-quantum auth work, OpenBSD 7.x ospfd updates,
      Cisco / Juniper TAC bulletins)
- [ ] **≥1** 2025–2026 frontier development (Flex-Algo deployments,
      SRv6 + OSPFv3, post-quantum OSPF authentication, BIER-TE)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (OSPF adjacency + first SPF run)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* OSPF makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: routing vs forwarding, IGP vs EGP,
distance-vector vs link-state vs path-vector, the autonomous system
concept, OSI L3, IPv4 and IPv6 addressing, multicast (link-local
specifically), Dijkstra's algorithm, graph theory basics (node, edge,
weight), Type-Length-Value encoding (for comparison with IS-IS), MD5
and HMAC-SHA authentication, MTU.

OSPF-specific terms to define: LSA, LSDB, area, backbone area (Area 0),
ABR (Area Border Router), ASBR (AS Boundary Router), DR (Designated
Router) and BDR, Hello packet, adjacency, neighbor, the seven
adjacency states (Down → Attempt/Init → 2-Way → ExStart → Exchange →
Loading → Full), stub area, totally stubby area, NSSA (Not-So-Stubby
Area), Type-1 Router LSA through Type-11 Opaque LSA, MaxAge,
LSRefreshTime, Router ID, virtual link, sham link.

## History and story

Origin: late 1987 / early 1988 at Proteon in Massachusetts. John Moy
was a Proteon engineer and chair of the IETF OSPF working group.
Proteon's "Proteon Routing Protocol" (PRP) was an early influence,
along with Radia Perlman's earlier link-state work (the IS-IS-precursor
work at DEC, the spanning tree algorithm). RFC 1131 (October 1989)
shipped OSPFv1. RFC 1247 (1991) reshaped it as OSPFv2 — and successive
revisions (RFC 1583 in 1994, RFC 2178 in 1997) led to the canonical
RFC 2328 in April 1998, which is still the binding spec.

The IS-IS vs OSPF religious war: IS-IS came from OSI (ISO 10589) and
got adopted by major service providers in the early 90s (Cisco,
Bay/Wellfleet, then later Juniper). OSPF stayed dominant in enterprise.
The Sprint / MCI / UUNET adoption choices in the mid-90s essentially
calcified the tier-1-backbone-uses-IS-IS, enterprise-uses-OSPF split
that persists in 2026. Cover the technical reasons (TLV extensibility,
flat-vs-hierarchical area model, encoding stability across address
families) and the political reasons (vendor support, training pipelines,
RFC vs ISO discoverability).

John Moy left Proteon for Cascade Communications, then Ascend
Communications (which Lucent acquired in 1999), then ran the OSPF
working group through the OSPFv3 / IPv6 era. His Addison-Wesley book
*OSPF: Anatomy of an Internet Routing Protocol* (1998) became the
authoritative companion to RFC 2328, and his follow-up *OSPF Complete
Implementation* (2000) shipped a working OSPF speaker as a book.

OSPFv3 for IPv6 (RFC 5340, 2008) reworked the protocol to be address-family
agnostic — RFC 5838 later allowed OSPFv3 to also carry IPv4. RFC 9355
(2022) brought OSPFv2 SR-MPLS extensions; RFC 9513 (2023) standardised
OSPFv3 SR-MPLS. The 2024–2026 era is dominated by Flex-Algo deployments,
SRv6 integration, and post-quantum authentication discussions in the
LSR working group.

Version history table with what changed in each major release: OSPFv1
(1989), OSPFv2 (1991, then iterated to RFC 2328 in 1998), OSPFv3 (2008
for IPv6, 2010 RFC 5838 for IPv4 over OSPFv3), TE extensions (RFC 3630,
2003), GMPLS extensions (RFC 4203, 2005), Graceful Restart (RFC 3623,
2003), Cryptographic Authentication (RFC 5709, 2009), SR-MPLS extensions
(RFC 9355, 2022).

If anything has fundamentally changed in the last 24 months — a draft
reaching RFC status, an old spec being obsoleted, a new feature shipping
in a major implementation (FRRouting, BIRD, Cisco IOS-XR, Junos), a
deprecation — call it out explicitly here.

## How it actually works

Packet format: the OSPF header (24 bytes) with version, type (Hello,
Database Description, Link State Request, Link State Update, Link State
Acknowledgment), packet length, Router ID, Area ID, checksum, AuType,
Authentication (64 bits, replaced by HMAC trailer in modern auth).
OSPFv3 changes the header (drops authentication, uses IPsec instead in
the original spec; later updated by RFC 7166 to embed authentication
again).

The five OSPF packet types in full: Hello (type 1), DBD (Database
Description, type 2), LSR (Link State Request, type 3), LSU (Link State
Update, type 4), LSAck (Link State Acknowledgment, type 5).

LSA types — explain Types 1 through 11 in detail: Router LSA (Type 1),
Network LSA (Type 2), Summary LSA (Type 3, network) and Type 4 (ASBR),
AS-External LSA (Type 5), Group Membership LSA (Type 6, deprecated MOSPF),
NSSA External LSA (Type 7), External Attributes (Type 8, deprecated),
Link LSA (Type 8 in OSPFv3), Intra-Area Prefix LSA (Type 9 in OSPFv3),
Opaque LSAs (Types 9, 10, 11 in OSPFv2 — link, area, AS scope —
which carry TE, SR, and Router Information extensions).

The neighbor adjacency state machine: Down → Attempt (NBMA only) or
Init → 2-Way → ExStart → Exchange → Loading → Full. The DR/BDR election
mechanics on multi-access networks (Ethernet broadcast and NBMA),
priorities, the role of the AllDRouters multicast address.

SPF computation (Dijkstra) — when triggered, how partial vs full SPF
works in modern implementations, throttling (`spf-delay-ietf`),
incremental SPF.

Area design: backbone area (0/0.0.0.0), regular areas, stub areas,
totally stubby areas, NSSAs. ABR behavior. Virtual links across non-zero
areas. The hard rule that all non-backbone areas must connect to the
backbone (and the virtual-link escape hatch).

Authentication: null (Type 0), simple password (Type 1, plaintext,
useless), MD5 cryptographic auth (Type 2, RFC 2328 Annex D), HMAC-SHA
(RFC 5709, 2009). Key rollover. OSPFv3 historical reliance on IPsec
then move to RFC 7166 embedded auth.

Provide **three** diagrams in mermaid-compatible text:
1. A sequence diagram of OSPF adjacency formation through full LSDB sync
   on a point-to-point link (`sequenceDiagram`)
2. A state diagram of the neighbor adjacency state machine (`stateDiagram-v2`)
3. OSPFv2 header + Hello packet bit layout, AND OSPFv3 header bit layout
   (as table form with bit offsets)

## Deep connections to other protocols

Cover each related protocol listed in the topic. Pay particular attention to:

- **BGP** — the IGP-vs-EGP positioning. OSPF carries internal-topology
  knowledge; BGP carries inter-AS reachability. Explain redistribution
  (and its dangers — Type-5 LSA explosion). Explain how BGP next-hop
  reachability resolves through OSPF (recursive lookup).
- **IS-IS** — the eternal alternative IGP. Compare: TLV-based encoding
  (IS-IS) vs fixed-format LSAs (OSPF), flat areas vs hierarchical,
  separate IGP packet format vs OSPF-on-IP. Why tier-1 backbones tend
  to run IS-IS. Why enterprise runs OSPF.
- **IPv4 / IPv6** — OSPFv2 is IPv4 only; OSPFv3 handles both. The
  practical migration story.
- **MPLS** — OSPF-TE (RFC 3630) feeds RSVP-TE / LDP. OSPF SR-MPLS
  (RFC 9355) distributes prefix-SIDs and adjacency-SIDs.
- **BFD** — sub-second OSPF failure detection. Most modern deployments
  pair OSPF with BFD timers around 50–150ms rather than relying on
  Hello/Dead.
- **Multicast** — OSPF uses link-local 224.0.0.5 and 224.0.0.6 (FF02::5
  and FF02::6 for OSPFv3). It does not need IP multicast routing.
- **TCP / UDP** — explicitly NOT used. OSPF runs on IP protocol 89.
  Compare with BGP (TCP/179) and explain the tradeoff: reliability
  is in OSPF's own LSA acknowledgment, not in a transport layer.

Then proactively name any related protocols missed from the list:
- **RIP / RIPv2 / RIPng** — the distance-vector predecessor.
- **EIGRP** — Cisco's proprietary advanced distance-vector.
- **Segment Routing (SR-MPLS, SRv6)** — the modern source-routing layer
  that OSPF and IS-IS now distribute.
- **BIER / BIER-TE** — bit-index explicit replication, distributed via
  OSPF extensions.

## Real-world deployment

Major implementations — named:
- **Cisco IOS / IOS-XE / IOS-XR / NX-OS** — the canonical commercial OSPF.
- **Juniper Junos** — the other dominant commercial stack.
- **Arista EOS** — heavy in data-center and enterprise.
- **Nokia SR OS** — service-provider.
- **FRRouting** — the open-source dominant stack today (forked from Quagga
  in 2017), widely deployed in Linux-based switches (Cumulus, SONiC).
- **BIRD** — extensively used in Internet exchanges and at NLNetLabs / RIPE.
- **OpenBSD `ospfd`** — small, auditable, used in security-sensitive
  deployments.
- **Microsoft Windows RRAS** — yes, Windows Server still ships OSPF.

Real numbers: typical enterprise OSPF area sizes (200–500 routers per
area is a rough upper bound; backbone area sizes well into the thousands
for large enterprises), convergence times (sub-second with BFD + SPF
throttling vs default 40-second Dead intervals), LSDB sizes for large
deployments, memory footprint per LSA.

Specific deployments:
- **Microsoft Azure** — uses OSPF internally for many fabric components;
  the 2019 routing incidents.
- **AWS** — VPC route tables and Transit Gateway internals.
- **Comcast / NTT / Verizon backbones** — IS-IS dominates Tier-1 but OSPF
  shows up in customer-edge and enterprise-VPN contexts.
- **Cumulus Linux / SONiC** — open networking OSes built on FRRouting.
- **Hyperscaler data center fabrics** — many use OSPF in spine-leaf
  Clos topologies despite the rise of BGP-only data centers (RFC 7938).

## Failure modes and famous incidents

LSA flooding storms — when an unstable link causes constant Type-1 LSA
re-origination, the entire area gets churned through SPF repeatedly.
The classic mitigation is SPF throttling + LSA throttling
(`timers throttle spf`, `timers throttle lsa all`).

The "incompatible OSPF MD5 keys" outage pattern — change the key on one
side, the other side still has the old key, adjacencies drop everywhere
the change rolls out, network partitions while operators scramble. Each
vendor has its own key-rollover semantics; rolling key IDs is the
intended workaround.

Microsoft Azure 2019 routing incident — investigate the public root cause.

Route-flap dampening tales — including the way OSPF responds to
flapping links (LSA re-origination, SPF runs, traffic blackholing
during convergence).

NANOG mailing-list classics — search for "OSPF" on the NANOG archive
for outage post-mortems and operator war stories.

Specific CVEs to look up:
- CVE-2016-3372 (Quagga OSPF DoS)
- CVE-2020-12867 (FRRouting OSPF)
- CVE-2022-26129 (FRRouting OSPF)
- Cisco IOS OSPF advisories (multiple over the years — search Cisco
  Security Advisories for "OSPF")
- The 2013 Black Hat "Owning the Routing Table" talk by Gabi Nakibly
  (LSA injection attacks)

Each told as setup → mistake → consequence → resolution.

## Fun facts and anecdotes

The name itself — "Open Shortest Path First" — was chosen partly as a
counter to Cisco's proprietary IGRP, signalling that this was an open
standard. John Moy's books are notoriously thick (the 1998 *Anatomy*
book is 384 pages, the 2000 *Complete Implementation* book is 800+
pages and includes the source code of an entire OSPF speaker — perhaps
the only such "book that compiles" in protocol history).

The Dijkstra/SPF naming story — Dijkstra himself reportedly disliked
"SPF" as an abbreviation for his algorithm; in his original 1959 paper
it has no name.

The IS-IS-vs-OSPF religious war — find quotes from the era. Radia
Perlman, who designed the precursor IS-IS-style protocol at DEC, has
talked about the politics in interviews.

The 224.0.0.5 / 224.0.0.6 address assignments — why those specific
link-local multicasts? Who got the IANA allocations and when?

## Practical wisdom

What an engineer actually needs to know to use OSPF well:

- **Timers** — Hello (default 10s on broadcast, 30s on NBMA), Dead
  (default 4× Hello), RouterDeadInterval. Pair with BFD for sub-second
  convergence (default `bfd interval 300 min-rx 300 multiplier 3` or
  tighter).
- **SPF throttling** — `timers throttle spf 50 200 5000` (IOS-XR style),
  `protocols ospf timers spf delay 50 holdtime 200 max-holdtime 5000`
  (Junos). The IETF best-current-practice is RFC 8405.
- **LSA throttling** — `timers throttle lsa all 0 5000 5000`.
- **Area design** — keep areas ≤200 routers, use stub/totally-stubby/NSSA
  for spoke sites that don't need full external visibility, avoid virtual
  links (a sign of broken area design).
- **MTU mismatch stuck in ExStart** — the classic "OSPF stuck in ExStart"
  symptom is an MTU mismatch on the DBD packet. `ip ospf mtu-ignore`
  is the workaround, but fix the MTU.
- **Authentication-key rollover** — use multiple key IDs and rotate them;
  don't change the key value of an existing ID across a live network.
- **Redistribution into BGP** — guard with route-maps and prefix-lists.
  Naive redistribution of all OSPF Type-5 LSAs into BGP has caused
  many incidents.
- **DR/BDR design** — set OSPF priority deliberately on multi-access
  segments; don't let it be elected by router ID alone.
- **`show ip ospf neighbor`** / **`show ip ospf database`** — the two
  commands you'll run most often.

Include **at least 3 Wireshark/tcpdump capture filter examples** with
what each one is good for:
- `ospf` — all OSPF traffic
- `ospf.hello` — just Hello packets, useful for adjacency debugging
- `ospf.lsa.type == 5` — AS-External LSAs, useful for redistribution audits
- `tcpdump -i eth0 proto 89` — at the IP layer

## Pioneers and key contributors

- **John Moy** (1957–) — the principal architect of OSPF. Proteon
  engineer, IETF OSPF WG chair, author of *OSPF: Anatomy of an Internet
  Routing Protocol* (1998) and *OSPF Complete Implementation* (2000).
  Moved to Cascade then Ascend then Lucent. Full bio with awards,
  quotes, Wikipedia URL.
- **Radia Perlman** (1951–) — link-state pioneer. Designed the
  IS-IS-precursor link-state protocol at DEC (CLNP/DECnet Phase V) and
  the Spanning Tree Protocol; her "Algorhyme" poem is folklore. Already
  in the encyclopedia for STP — extend her record for the link-state
  contribution.
- **Edsger W. Dijkstra** (1930–2002) — invented the shortest-path-first
  algorithm in 1956 (published 1959). Turing Award 1972. The foundation
  of OSPF's SPF computation.
- **Acee Lindem** — long-time IETF OSPF / LSR WG co-chair, currently at
  LabN Consulting, lead author or contributor on dozens of OSPF RFCs
  including the modern SR-MPLS extensions.
- **Tony Przygienda** — Juniper, LSR WG; key figure in modern OSPF /
  IS-IS evolution and the RIFT (Routing in Fat Trees) work.
- **Peter Psenak** — Cisco, principal author of OSPF SR-MPLS extensions
  (RFC 9355) and Flex-Algo work.
- **Christian Hopps** — LabN / IS-IS adjacent, frequent contributor.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- **Authoritative specifications** — RFC 2328 (OSPFv2, 1998, with
  section pointers: §10 neighbor state machine, §13 flooding, §16
  SPF calculation, Annex D authentication), RFC 5340 (OSPFv3), RFC
  9355 (OSPF SR-MPLS), RFC 5709 (HMAC-SHA auth), RFC 3623 (Graceful
  Restart), RFC 7770 (Router Information LSA), RFC 8405 (SPF Back-Off).
- **Books** — Moy, *OSPF: Anatomy of an Internet Routing Protocol*
  (Addison-Wesley, 1998); Moy, *OSPF Complete Implementation* (2000);
  Russ White, *Optimal Routing Design* (Cisco Press, 2005); Iljitsch
  van Beijnum, *BGP* (covers OSPF interaction); Jeff Doyle, *Routing
  TCP/IP Vol 1* (2nd ed., 2005, Cisco Press) — the OSPF chapter is
  the gold standard for vendor-agnostic intro.
- **Academic papers** — Moy's original IETF presentations, the IS-IS
  vs OSPF analytical papers from the 90s (search ACM DL), the
  modern Segment Routing IGP-extension papers.
- **Long-form engineering blog posts** — Ivan Pepelnjak's blog
  (ipspace.net) — extensive OSPF coverage; Cloudflare on network
  protocols; Cisco Live recordings on YouTube.
- **YouTube videos** — David Bombal OSPF series, Cisco Live
  BRKRST-2337 OSPF deep dives, NANOG conference recordings (search
  "NANOG OSPF").
- **Podcasts** — Packet Pushers (multiple OSPF / IS-IS episodes),
  Heavy Networking, Network Collective.
- **Free university courses** — Stanford CS 144 (Networking), MIT
  6.829 (Computer Networks), Princeton COS 461 — OSPF lectures.
- **Hands-on tools** — GNS3, Containerlab, EVE-NG (network emulators
  that run real Cisco/Juniper images), FRRouting Docker images,
  Wireshark with OSPF dissectors.

## Where things are heading (2025–2026 frontier)

- **OSPF Flex-Algo** — multiple parallel SPF computations with
  different constraints (latency-optimised, capacity-optimised,
  affinity-based). Distributed via opaque LSA type 10. Deployment
  starting in 2024–2025 at large enterprises and tier-2 ISPs.
- **SRv6 + OSPFv3** — RFC 9513 (2023) and follow-up drafts. The
  long-term replacement of MPLS in some operator networks.
- **BIER-TE** (Bit Index Explicit Replication, Traffic-Engineered) —
  OSPF extensions distributing BIER topology, useful for multicast
  optimisation in modern fabrics.
- **Post-quantum authentication** — IETF LSR WG drafts on PQ-safe
  OSPF authentication (late 2024 onward).
- **Convergence performance** — work on sub-50ms convergence in
  large fabrics, combining BFD, micro-loop avoidance, SR-LFA.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook: the one beat that gets a non-expert to
  listen, written for the ear (the Dijkstra-in-1956 → every-enterprise-
  network-today framing).
- A striking statistic that captures importance, with source (number of
  routers running OSPF globally, or the share of enterprise IGPs that
  are OSPF).
- A "pause and think" moment: a fact that should make even a
  knowledgeable reader stop and reconsider, with source (e.g., that
  the canonical OSPFv2 spec is from 1998 and is still binding).
- A failure-story arc: a real incident retold as a clean dramatic
  sequence — setup, mistake, consequence, resolution (the Azure 2019
  routing incident, or a NANOG-archive LSA-storm post-mortem).

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: ospf
name: Open Shortest Path First
abbreviation: OSPF
categoryId: network-foundations
port: none (IP protocol 89)
year: 1989
rfc: RFC 2328 (OSPFv2), RFC 5340 (OSPFv3)
standardsBody: ietf
oneLiner: The link-state Interior Gateway Protocol that runs most enterprise core networks and a large share of ISP backbones.
overview: <2–3 paragraphs of polished prose covering OSPFv2 and OSPFv3>
howItWorks: 4–6 steps as { title, description } — Hello/adjacency, LSDB sync, SPF, flooding, area design
useCases: 5–7 bullet items — enterprise core, DC fabric, ISP IGP, IPv6 IGP, MPLS-TE substrate, SR-MPLS distribution
performance: { latency: "sub-second with BFD", throughput: "control-plane only", overhead: "Hello every 10s + LSA refresh every 30min" }
connections: [bgp, ipv4, ipv6, ethernet, icmp]
links: { wikipedia, rfc, official (IETF LSR WG) }
image: <Wikimedia URL of John Moy or OSPF area diagram>
```

### A.2 Header / wire-format layout

Provide BOTH:
- OSPFv2 24-byte header + Hello packet body (Network Mask, HelloInterval,
  Options, Rtr Pri, RouterDeadInterval, Designated Router, Backup DR,
  Neighbor list).
- OSPFv3 16-byte header (notable differences from v2: no AuType/auth in
  header, Instance ID, Reserved).

### A.3 State machine

```
stateMachine:
  title: OSPF Neighbor Adjacency
  mermaid: |
    stateDiagram-v2
      [*] --> Down
      Down --> Init: Hello received
      Init --> TwoWay: Hello with our RID
      TwoWay --> ExStart: DR/BDR election done
      ExStart --> Exchange: master/slave negotiated
      Exchange --> Loading: DBD complete
      Loading --> Full: LSRs satisfied
      Full --> Down: dead timer expired
  states:
    - { id: Down, name: Down, description: "No Hellos received" }
    - { id: Init, name: Init, description: "Hello received, not yet 2-way" }
    ...
```

### A.4 Code example

A minimal working example in **3 languages + a wire-format dump**:
- `python` — using `scapy` to craft and parse OSPF Hello packets
- `cli` — `vtysh` (FRRouting) configuring an OSPF area, plus
  `show ip ospf neighbor` / `show ip ospf database`; also OpenBSD
  `ospfctl` examples
- `wire` — sectioned dump: Hello → DBD → LSR → LSU → LSAck → Full adjacency
- `javascript` — minimal LSA parser for a captured PCAP file using
  `node-pcap` or similar

### A.5 Recent changes (dated, 2024–2026)

Minimum 5 dated entries — recent IETF LSR WG progress on Flex-Algo,
SRv6 OSPFv3 drafts, post-quantum auth work, FRRouting OSPF SR-MPLS
shipping, OpenBSD 7.x ospfd updates, Cisco / Juniper releases.

### A.6 Real-world deployments

≥5 named: Cisco-deployed enterprise fleets, FRRouting in Cumulus/SONiC
data-center switches, OpenBSD ospfd in security-sensitive deployments,
Microsoft Azure fabric internals, AWS Transit Gateway internals, NTT /
Comcast specific OSPF use cases, Cloudflare Magic Transit.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

Pitfalls: Hello/Dead mismatch, MTU mismatch in ExStart, key-rollover,
area-design overrun, virtual-link abuse, naive redistribution. Tools:
Wireshark, GNS3, Containerlab, FRRouting `vtysh`, Cisco / Junos CLI.

### A.9 Wireshark hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including John Moy (full bio), Radia Perlman (extension of existing
record), Dijkstra (cross-reference), Acee Lindem, Tony Przygienda,
Peter Psenak.

### A.12 RFC records ≥3

RFC 2328 (OSPFv2, 1998, Internet Standard), RFC 5340 (OSPFv3, 2008,
Proposed Standard updated to Internet Standard), RFC 9355 (OSPF SR-MPLS,
2022, Proposed Standard), RFC 5709 (HMAC-SHA auth, 2009), RFC 3623
(Graceful Restart, 2003), RFC 7770 (Router Info, 2016).

### A.13 New glossary concepts ≥10

LSA, LSDB, area, ABR, ASBR, DR, BDR, Hello, adjacency, ExStart,
Exchange, Loading, Full, stub area, totally stubby area, NSSA,
Router LSA, Network LSA, Summary LSA, External LSA, NSSA External
LSA, Opaque LSA, MaxAge, Router ID, virtual link, sham link,
Flex-Algo, prefix-SID, adjacency-SID, SPF throttling.

### A.14 Frontier entry

OSPF Flex-Algo as a frontier entry with metrics (deployment count,
2024–2026 progress) and sources.

### A.15 Journey suggestion

"How a packet finds its way across a corporate network" — a 4–5 step
journey covering ARP → Ethernet → IPv4 routing → OSPF route lookup
in the FIB → BGP for the inter-AS leg.

### A.16 Comparison pair

"OSPF vs IS-IS" is the obvious one — make it strong. Optional second:
"OSPF vs BGP (IGP vs EGP)".

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "1987, Westborough Massachusetts" (Proteon origin)
- Timeline: 1959 (Dijkstra) → 1987 (Proteon) → 1989 (OSPFv1) → 1998
  (RFC 2328) → 2008 (OSPFv3) → 2022 (SR-MPLS) → 2024+ (Flex-Algo)
- Callout: "The IS-IS vs OSPF religious war"
- Image: Wikimedia of John Moy OR an OSPF area-design diagram
- Diagram: OSPF area hierarchy (backbone + areas + ABR + ASBR)
- Pioneers section embedded: Moy + Perlman + Dijkstra mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outages — likely none directly OSPF-caused in
the registry. Propose new outage records:
- Microsoft Azure 2019 routing incident (if OSPF involvement
  confirmed) — protocol-design or configuration category
- A NANOG-archive LSA-storm war story with specifics
- The 2013 Black Hat OSPF LSA injection demo — security category

### A.19 Embedded media

Highest-signal: Cisco Live OSPF deep-dive recording, ipspace.net
OSPF webinar, NANOG OSPF talk, FRRouting docs / tutorial videos.

### A.20 Prerequisites

```
concepts: [packet, frame, ip-address, subnet, routing-vs-forwarding, ipv4, ipv6, multicast, graph-theory, dijkstra]
protocols: [ipv4, ipv6, ethernet, arp, bgp, icmp]
```

### A.21 Name highlight

```
"[O]pen [S]hortest [P]ath [F]irst"  (OSPF)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for two routers forming a full adjacency on
a point-to-point link, starting from cold boot through Hello, 2-Way,
ExStart, Exchange (DBD), Loading (LSR/LSU/LSAck), Full, and a first
SPF computation. 10–14 step annotations.

### A.23 Category placement

Fits naturally into **network-foundations** alongside BGP, IP, and
the other Layer-3 control-plane protocols. Optionally propose a sub-
category split (routing-protocols vs addressing) — but the simpler
move is to leave it in network-foundations.

---

# Appendix B — Simulator step list

Author one simulation: **OSPF Adjacency Formation + First LSU Flooding**.

```
title: "OSPF Adjacency and First SPF"
description: "Watch two routers go from cold boot to a Full adjacency and a complete LSDB."
actors:
  - { id: "r1", label: "Router 1 (RID 1.1.1.1)", icon: "router", position: "left" }
  - { id: "r2", label: "Router 2 (RID 2.2.2.2)", icon: "router", position: "right" }
userInputs:
  - { id: "helloInterval", label: "Hello interval (s)", type: "number", defaultValue: "10" }
  - { id: "areaId", label: "Area ID", type: "text", defaultValue: "0.0.0.0" }
  - { id: "auth", label: "Authentication", type: "select", options: ["none", "MD5", "HMAC-SHA-256"], defaultValue: "none" }
steps:
  - id: hello1
    label: "Hello (R1 → multicast)"
    description: "R1 sends a Hello to 224.0.0.5, listing no neighbors yet."
    fromActor: r1
    toActor: r2
    duration: 1200
    highlight: [HelloInterval, RouterDeadInterval, NeighborList]
    layers:
      - IP: { src: "10.0.0.1", dst: "224.0.0.5", proto: 89, TTL: 1 }
      - OSPF: { version: 2, type: 1 (Hello), areaID: "0.0.0.0", RID: "1.1.1.1" }
      - Hello: { netmask: "255.255.255.252", helloInt: 10, deadInt: 40, neighbors: [] }
  - id: hello2
    label: "Hello (R2 → multicast, includes R1)"
    description: "R2 responds with R1 in its Neighbor list — bidirectional sight achieved."
    fromActor: r2
    toActor: r1
    duration: 1200
    layers:
      - OSPF: { type: 1, neighbors: ["1.1.1.1"] }
  - id: state-2way
    label: "State → 2-Way"
    description: "Both sides have seen their own RID in the other's Hello."
  - id: dbd-master
    label: "DBD (Master/Slave negotiation)"
    description: "Higher RID becomes master; DBD packets list LSA headers in the LSDB."
    fromActor: r2
    toActor: r1
    highlight: [DD-Sequence, I/M/MS bits]
    layers:
      - OSPF: { type: 2 (DBD), seq: "0x100", IMMS: "I+M+MS" }
  - id: lsr
    label: "Link State Request"
    description: "R1 requests the LSAs it doesn't have."
  - id: lsu
    label: "Link State Update"
    description: "R2 sends Type-1 Router LSAs and any Type-2/3/5 it has."
    highlight: [LSA Header, LSA Type, Link ID, Sequence, Age]
  - id: lsack
    label: "Link State Acknowledgment"
    description: "R1 acks the LSAs."
  - id: state-full
    label: "State → Full"
    description: "Adjacency complete; SPF runs on the new LSDB."
  - id: spf
    label: "SPF (Dijkstra) computation"
    description: "Each router computes shortest paths from itself as root."
    highlight: [Cost, Next-hop, SPF tree]
```

Optionally a second simulation: **OSPF Hello on a multi-access broadcast
segment with DR/BDR election** (4 routers, election, then adjacency only
to DR/BDR).

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
