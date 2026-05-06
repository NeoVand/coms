---
prompt_source: deep-research-prompts.txt:8803-8980 (PROTOCOL · BGP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/224835db-e46c-4598-a95b-a00003cde6fb
research_mode: claude.ai Research
---

# The Border Gateway Protocol (BGP): A Deep Field Manual for Smart Engineers

*A research dossier prepared 5 May 2026. The audience is engineers — some new, some experienced. Surface-level "what is BGP" content is omitted. Where a claim cannot be sourced, it is marked `[needs source]` rather than fabricated. Sources from the May 2024 – May 2026 window are flagged where they update older material.*

---

## Prerequisites and glossary

BGP is a control-plane protocol that runs on top of TCP and rides on top of IP. To read the rest of this report without bluffing, here are the concepts you should be solid on. Each is a one- or two-sentence definition with a link to a clear authoritative explainer.

**Stack and packet basics**

- **OSI / TCP-IP layers.** Standard mental model for stacking link, network, transport, application. BGP is technically an application-layer protocol that runs over TCP. ([https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122)) [Cisco Community](https://community.cisco.com/t5/networking-knowledge-base/an-intro-to-bgp-and-it-s-message-types-with-pcap/ta-p/4432754)
- **Frame.** A link-layer protocol data unit (PDU), e.g. Ethernet. Contains a header, payload, FCS. ([https://datatracker.ietf.org/doc/html/rfc894](https://datatracker.ietf.org/doc/html/rfc894))
- **Datagram.** A self-contained network-layer PDU; in IP, an "IP datagram." ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791))
- **Header.** The structured prefix bytes describing how to interpret the payload (TCP header, IP header, BGP message header). ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791))
- **Checksum.** A redundancy field used by IP/TCP/UDP to detect bit errors. BGP itself has no checksum because TCP provides one. ([https://datatracker.ietf.org/doc/html/rfc1071](https://datatracker.ietf.org/doc/html/rfc1071))
- **Stream.** A reliable, ordered byte sequence delivered by TCP. BGP messages are framed inside this stream. ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293))
- **Socket.** The OS endpoint identified by (IP address, TCP port, protocol). BGP listens on TCP/179. ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293))
- **Handshake.** TCP's three-way SYN / SYN-ACK / ACK exchange that establishes the byte stream BGP rides over. ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293))

**Network-layer addressing**

- **IPv4.** 32-bit addressing, the original BGP NLRI. ([https://datatracker.ietf.org/doc/html/rfc791](https://datatracker.ietf.org/doc/html/rfc791))
- **IPv6.** 128-bit addressing, carried by BGP via the multiprotocol extensions. ([https://datatracker.ietf.org/doc/html/rfc8200](https://datatracker.ietf.org/doc/html/rfc8200))
- **CIDR (Classless Inter-Domain Routing).** Replaces address classes with arbitrary `prefix/length` masks; co-evolved with BGP-4. ([https://datatracker.ietf.org/doc/html/rfc4632](https://datatracker.ietf.org/doc/html/rfc4632))
- **Prefix.** A range of IP addresses denoted as `network/length`, e.g. `192.0.2.0/24`. The unit of BGP advertisement.
- **Longest prefix match (LPM).** Forwarding rule: when multiple routes match a destination, the most specific (longest mask) wins. ([https://datatracker.ietf.org/doc/html/rfc1812](https://datatracker.ietf.org/doc/html/rfc1812))
- **Bogon.** A prefix that is not currently allocated by any RIR or is reserved (RFC 1918, etc.) and should not appear in the global routing table. ([https://www.cidr-report.org/](https://www.cidr-report.org/)) [APNIC Blog](https://blog.apnic.net/2026/03/24/the-why-and-what-of-the-cidr-report/)

**Autonomy and policy**

- **Autonomous System (AS).** A network with a single administrative routing policy. Internally it can run anything (OSPF, IS-IS); externally it speaks BGP. ([https://en.wikipedia.org/wiki/Autonomous_system_(Internet)](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)))
- **AS Number / ASN.** The 16- or 32-bit identifier for an AS, allocated by IANA via the RIRs (ARIN, RIPE NCC, APNIC, LACNIC, AFRINIC). 32-bit ASNs were introduced in RFC 4893 (2007), obsoleted by RFC 6793 (2012). The placeholder `AS_TRANS = 23456` represents a 4-byte ASN to a 2-byte-only speaker. ([https://datatracker.ietf.org/doc/html/rfc6793](https://datatracker.ietf.org/doc/html/rfc6793)) [WikiMili + 3](https://wikimili.com/en/AS_7007_incident)
- **eBGP / iBGP (External / Internal BGP).** eBGP runs between routers in different ASes; iBGP between routers in the same AS. iBGP requires a full mesh unless route reflectors or confederations are used. ([https://en.wikipedia.org/wiki/Border_Gateway_Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- **IGP vs EGP.** Interior Gateway Protocols (OSPF, IS-IS, RIP) carry routes inside one AS; Exterior Gateway Protocols (originally EGP per RFC 904, today BGP) carry routes between ASes. ([https://datatracker.ietf.org/doc/html/rfc904](https://datatracker.ietf.org/doc/html/rfc904))
- **Route reflector (RR).** An iBGP scaling technique (RFC 4456) in which one router re-advertises iBGP routes to its clients, breaking the n² mesh. ([https://datatracker.ietf.org/doc/html/rfc4456](https://datatracker.ietf.org/doc/html/rfc4456))
- **Confederation.** Subdivides an AS into sub-ASes that exchange iBGP-like updates (RFC 5065). ([https://datatracker.ietf.org/doc/html/rfc5065](https://datatracker.ietf.org/doc/html/rfc5065))
- **Peering / transit.** Settlement-free peer-to-peer exchanges traffic only between the two networks and their customers; transit is paid carriage of traffic to the rest of the Internet.
- **IXP (Internet Exchange Point).** A switching fabric (often Layer 2) where many ASes meet to peer; large IXPs run BIRD/OpenBGPD route servers. ([https://www.ripe.net/](https://www.ripe.net/))
- **Tier-1 / Tier-2 / Tier-3 ISP.** Tier-1s reach the entire DFZ purely via settlement-free peering (Lumen, Cogent, NTT, GTT, Telia/Arelion, Tata, etc.); Tier-2s buy transit from Tier-1s but peer extensively; Tier-3s only buy transit. The terminology is informal.

**BGP-specific vocabulary**

- **NLRI (Network Layer Reachability Information).** The set of prefixes carried by an UPDATE. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- **Path attribute.** Metadata attached to NLRI: `ORIGIN`, `AS_PATH`, `NEXT_HOP`, `MED`, `LOCAL_PREF`, `ATOMIC_AGGREGATE`, `AGGREGATOR`, `COMMUNITIES` (RFC 1997), `LARGE_COMMUNITIES` (RFC 8092), `MP_REACH_NLRI` / `MP_UNREACH_NLRI` (RFC 4760), `AS4_PATH`, `AS4_AGGREGATOR`. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- **RIB / FIB.** The Routing Information Base is the BGP daemon's view (Adj-RIB-In, Loc-RIB, Adj-RIB-Out); the Forwarding Information Base is what the data plane actually uses to forward packets. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- **MRAI (Minimum Route Advertisement Interval).** Per-peer rate-limiter on update messages, default ~30s for eBGP, ~5s for iBGP in many implementations. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- **Add-Path.** Extension allowing a peer to advertise multiple paths for the same prefix (RFC 7911). ([https://datatracker.ietf.org/doc/html/rfc7911](https://datatracker.ietf.org/doc/html/rfc7911))
- **GTSM (Generalized TTL Security Mechanism).** Sets the IP TTL of eBGP packets to 255 and rejects anything below a threshold (e.g. 254) — a poor person's way to ensure the peer is on-link (RFC 5082). ([https://datatracker.ietf.org/doc/html/rfc5082](https://datatracker.ietf.org/doc/html/rfc5082))
- **TCP-MD5 / TCP-AO.** RFC 2385 (deprecated) used MD5 to sign TCP segments between BGP peers; RFC 5925 TCP-AO replaced it with stronger algorithms. ([https://datatracker.ietf.org/doc/html/rfc5925](https://datatracker.ietf.org/doc/html/rfc5925)) [IETF](https://datatracker.ietf.org/doc/html/rfc7454)
- **BFD (Bidirectional Forwarding Detection).** Sub-second liveness protocol used to take BGP sessions down faster than the HoldTimer (RFC 5880). ([https://datatracker.ietf.org/doc/html/rfc5880](https://datatracker.ietf.org/doc/html/rfc5880))
- **Looking glass.** A web/CLI service exposing read-only `show ip bgp …` from a remote router; used to confirm what the Internet sees of your prefix. ([https://lg.he.net/](https://lg.he.net/))
- **MRT (Multi-Threaded Routing Toolkit) format.** Standard format for archiving BGP messages (RFC 6396). RouteViews and RIPE RIS publish MRT dumps. ([https://datatracker.ietf.org/doc/html/rfc6396](https://datatracker.ietf.org/doc/html/rfc6396))
- **RouteViews / RIPE RIS.** Two long-running route collector projects that peer with hundreds of operators worldwide and publish MRT dumps for research. ([http://www.routeviews.org/](http://www.routeviews.org/) ; [https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/](https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/))
- **BMP (BGP Monitoring Protocol).** Out-of-band streaming of a router's BGP state to a collector (RFC 7854). ([https://datatracker.ietf.org/doc/html/rfc7854](https://datatracker.ietf.org/doc/html/rfc7854))

**Cryptographic primitives and routing security**

- **RPKI (Resource Public Key Infrastructure).** A PKI in which the RIRs are trust anchors signing certificates that bind IP prefixes and ASNs to resource holders (RFC 6480). ([https://datatracker.ietf.org/doc/html/rfc6480](https://datatracker.ietf.org/doc/html/rfc6480)) [Nist](https://rpki-monitor.antd.nist.gov/Methodology)
- **ROA (Route Origin Authorization).** A signed object stating "AS *X* is allowed to originate prefix *P/L* up to maxLength *M*." Updated profile in RFC 9582 (May 2024). ([https://datatracker.ietf.org/doc/rfc9582/](https://datatracker.ietf.org/doc/rfc9582/)) [Kentik +2](https://www.kentik.com/blog/measuring-rpki-rov-adoption-with-netflow/)
- **ROV (Route Origin Validation).** Procedure of comparing received BGP announcements against ROAs and marking them Valid / Invalid / NotFound (RFC 6811). ([https://datatracker.ietf.org/doc/html/rfc6811](https://datatracker.ietf.org/doc/html/rfc6811))
- **BGPsec.** Cryptographic AS_PATH protection (RFC 8205, 2017) that signs each hop. Almost zero real-world deployment. ([https://datatracker.ietf.org/doc/rfc8205/](https://datatracker.ietf.org/doc/rfc8205/)) [Internet Society](https://www.internetsociety.org/blog/2017/10/bgpsec-reality-now/)
- **ASPA (Autonomous System Provider Authorization).** A signed object listing an AS's upstream providers, used to detect route leaks at the AS_PATH level. As of May 2026 still an Internet-Draft (`draft-ietf-sidrops-aspa-verification-25`, `draft-ietf-sidrops-aspa-profile-26`). ([https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)) [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-sidrops-aspa-verification-20)
- **MANRS (Mutually Agreed Norms for Routing Security).** Operator initiative requiring filtering, anti-spoofing, coordination, and global validation. ([https://manrs.org/](https://manrs.org/))

---

## History and story

The Border Gateway Protocol began with a sandwich.

In **January 1989, at IETF 12 in Austin, Texas**, Yakov Rekhter (then at IBM's T.J. Watson Research Center) and Kirk Lougheed (Cisco) — and, by some accounts, Cisco's Len Bosack — sat in the meeting hall cafeteria and sketched the protocol on the backs of napkins. The original napkins themselves were lost to a landfill, but Cisco's archivist preserved photocopies, which now hang on the wall of a routing-protocol development area at Cisco in Milpitas, California. The "two-napkin" sketches were later expanded to three handwritten sheets — hence the name "Two-Napkin Protocol," sometimes "three-napkin." ([https://computerhistory.org/blog/the-two-napkin-protocol/](https://computerhistory.org/blog/the-two-napkin-protocol/) ; [https://weare.cisco.com/c/r/weare/amazing-stories/amazing-things/two-napkin.html](https://weare.cisco.com/c/r/weare/amazing-stories/amazing-things/two-napkin.html) ; [https://en.wikipedia.org/wiki/Border_Gateway_Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)) [Computer History Museum + 3](https://computerhistory.org/blog/the-two-napkin-protocol/)

What problem were they trying to solve? **EGP (RFC 904, 1984)** was the existing exterior protocol. EGP assumed a single tree-shaped Internet with the NSFNET as backbone — it could not handle cycles or general graph topology. As ARPANET was decommissioned (28 February 1989) and the Internet shifted to a multi-backbone topology with commercial networks, EGP collapsed under its own assumptions. Vint Cerf even read his "Requiem for ARPANET" at the same IETF 12 meeting where BGP was first floated. ([https://www.catchpoint.com/blog/what-is-bgp](https://www.catchpoint.com/blog/what-is-bgp)) [Catchpoint](https://blog.catchpoint.com/2019/10/21/bgp-basics-and-history/)

The standards trail:

- **RFC 1105 — BGP-1 (June 1989).** Rekhter and Lougheed. Initial spec, the napkin protocol made standard. ([https://datatracker.ietf.org/doc/rfc1105/](https://datatracker.ietf.org/doc/rfc1105/))
- **RFC 1163 — BGP-2 (June 1990).** Cleaner state machine.
- **RFC 1267 — BGP-3 (October 1991).** Stabilised the protocol; widely deployed.
- **RFC 1771 — BGP-4 (March 1995).** The major version: introduced **CIDR** support, AS_PATH aggregation, and removed address classes from BGP forever.
- **RFC 4271 — BGP-4 (January 2006).** The current normative spec, edited by Rekhter, Tony Li, and Susan Hares (IDR working-group chair for many years). Corrected ambiguities in 1771 and absorbed common operational practice. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271)) [IETF](https://datatracker.ietf.org/doc/html/rfc4271)[Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)

**Four-byte ASNs.** RFC 4893 (May 2007) defined four-octet ASN support, with the placeholder AS_TRANS=23456 used to talk to legacy "OLD" speakers. RFC 4893 was obsoleted by **RFC 6793 (December 2012)**, which is the current spec and added clearer error handling. ([https://datatracker.ietf.org/doc/html/rfc6793](https://datatracker.ietf.org/doc/html/rfc6793) ; [https://datatracker.ietf.org/doc/html/rfc4893](https://datatracker.ietf.org/doc/html/rfc4893)) [IETF + 2](https://datatracker.ietf.org/doc/html/rfc4893)

**Politics, people, and the alternatives that lost.** BGP's chief rival was **IDRP (ISO 10747)**, an OSI-stack inter-domain protocol pushed in the early 1990s by ISO partisans. BGP-4 won because it was simple, supported CIDR, was already running on Cisco IOS in production, and had an interoperable two-vendor implementation by IBM and Cisco. The work happened largely inside the IETF's IDR (Inter-Domain Routing) working group; key designers and editors include Rekhter, Lougheed, Tony Li, Susan Hares, Paul Traina, John Scudder, Jeff Haas, and (later) Job Snijders. Funding was indirect: vendors paid their own engineers' time, and the original deployments rode on NSFNET money.

**What changed in the last 24 months (May 2024 – May 2026).** Several normative documents that engineers will hit in production:

- **RFC 9582 — A Profile for Route Origin Authorizations (ROAs)** (May 2024). Replaces RFC 6482; clarifies X.509 extensions, fixes errata, mandates a canonicalisation procedure. Authors Snijders, Maddison, Lepinski, Kong, Kent. ([https://datatracker.ietf.org/doc/rfc9582/](https://datatracker.ietf.org/doc/rfc9582/)) [APNIC Blog + 2](https://blog.apnic.net/2025/01/28/rpkis-2024-year-in-review/)
- **RFC 9687 — BGP-4 Send Hold Timer** (November 2024). Adds `SendHoldTimer` to the FSM so a speaker tears its session down if its TCP socket stops draining (the "BGP zombie" failure mode). Authors Snijders, Cartwright-Cox, Qu. Updates RFC 4271. ([https://datatracker.ietf.org/doc/rfc9687/](https://datatracker.ietf.org/doc/rfc9687/)) [IETF](https://datatracker.ietf.org/doc/rfc9687/)[IETF](https://datatracker.ietf.org/doc/rfc9687/)
- **RFC 9774 — Deprecation of `AS_SET` and `AS_CONFED_SET`** (May 2025). Promotes the previous BCP-172 advice to a normative MUST NOT. BGP speakers now have to "treat-as-withdraw" any UPDATE containing an AS_SET. Updates RFC 4271, RFC 5065, obsoletes RFC 6472. ([https://datatracker.ietf.org/doc/rfc9774/](https://datatracker.ietf.org/doc/rfc9774/)) [ACM Digital Library + 3](https://dl.acm.org/doi/10.17487/RFC9774)
- (Slightly older but still in window) **RFC 9234 — Route Leak Prevention via OPEN-message Roles and the OTC attribute** (May 2022). Allowed routers to negotiate Provider/Customer/Peer/RS roles inline. Already deployed in BIRD, FRR, and IOS-XR/Junos by 2024. ([https://www.rfc-editor.org/rfc/rfc9234.html](https://www.rfc-editor.org/rfc/rfc9234.html)) [IETF](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9234.html)
- **RFC 9494 — Long-Lived Graceful Restart for BGP** (November 2023). Introduces `LLGR_STALE` and `NO_LLGR` communities and the LLGR capability so stale routes can be retained beyond the 4095s GR cap. ([https://datatracker.ietf.org/doc/rfc9494/](https://datatracker.ietf.org/doc/rfc9494/)) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9494.pdf)
- **RFC 9552 — BGP-LS, refreshed** (December 2023). Obsoletes RFC 7752 / RFC 9029, the link-state distribution mechanism used by SR controllers and PCEs. ([https://www.rfc-editor.org/rfc/rfc9552.html](https://www.rfc-editor.org/rfc/rfc9552.html)) [RFC Editor](https://www.rfc-editor.org/info/rfc9552)
- **RFC 8950 — IPv4 NLRI with IPv6 Next Hop** (November 2020, deployed broadly only after 2023). Underpins IPv6-only data-centre underlays. Cisco IOS-XE 17.8 added VPNv4-with-IPv6-next-hop in 2022. ([https://datatracker.ietf.org/doc/html/rfc8950](https://datatracker.ietf.org/doc/html/rfc8950)) [Cisco](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m-support-bgp-vpn-evpn-nexthop.pdf)
- **ASPA progress (2024–2026).** `draft-ietf-sidrops-aspa-verification` reached `-25` (October 2025); `draft-ietf-sidrops-aspa-profile` reached `-26` (April 2026). Cisco reported an **Early Field Trial of ASPA on IOS-XR in 2025**; OpenBGPD, BIRD 2.16+, and Routinator have ASPA support. As of May 2026, the SIDROPS chair Job Snijders has signalled the WG is "close to last call." ([https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/) ; [https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/) ; [https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/](https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/)) [IETF + 2](https://datatracker.ietf.org/doc/html/draft-ietf-sidrops-aspa-verification-24)
- **FCC Notice of Proposed Rulemaking (June 2024).** First-ever U.S. federal proposal to compel the nine largest BIAS providers (AT&T, Altice, Charter, Comcast, Cox, Lumen, T-Mobile, TDS/US Cellular, Verizon) to file BGP Routing Security Risk Management Plans and quarterly RPKI deployment reports. As of March 2024, only ~22% of U.S. originated routes had ROAs; the NPRM is intended to push that number up. ([https://docs.fcc.gov/public/attachments/DOC-402609A1.pdf](https://docs.fcc.gov/public/attachments/DOC-402609A1.pdf)) [HWG LLP](https://hwglaw.com/2024/06/17/fccs-proposed-border-gateway-protocol-rules/)[Federal Register](https://www.federalregister.gov/documents/2024/06/17/2024-13048/reporting-on-border-gateway-protocol-risk-mitigation-progress-secure-internet-routing)

---

## How it actually works

### 1. Transport

BGP runs on **TCP port 179**. The well-known port appears in the BGP server's listening socket; the client picks an ephemeral source port. Once TCP is established, BGP layers its own framed, type-tagged messages on top of the byte stream. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271)) [Cisco Community](https://community.cisco.com/t5/networking-knowledge-base/an-intro-to-bgp-and-it-s-message-types-with-pcap/ta-p/4432754)

### 2. The 19-byte fixed header

Every BGP message starts with a 19-byte header:

| Bytes | Field | Notes |
|---|---|---|
| 0–15 | Marker | All ones (0xFFFF…FF). Originally a place to hold an authentication digest; now vestigial. |
| 16–17 | Length | Total length in bytes (header + body), 19 ≤ Length ≤ 4096 (or 65535 with extended-message capability). |
| 18 | Type | 1 = OPEN, 2 = UPDATE, 3 = NOTIFICATION, 4 = KEEPALIVE, 5 = ROUTE-REFRESH (RFC 2918). |

([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271) ; [https://www.rfc-editor.org/rfc/rfc2918](https://www.rfc-editor.org/rfc/rfc2918))

### 3. OPEN message body

After the header:

| Bytes | Field |
|---|---|
| 1 | Version (4) |
| 2 | My Autonomous System (16-bit; AS_TRANS=23456 if real ASN is 4-byte) |
| 2 | Hold Time (default 180 s in Cisco; 90 s in many others) |
| 4 | BGP Identifier (a 32-bit router ID, typically a loopback IPv4) |
| 1 | Optional Parameters Length |
| N | Optional Parameters (capability advertisements: Multiprotocol RFC 4760, Route Refresh, 4-byte ASN RFC 6793, Graceful Restart RFC 4724, LLGR RFC 9494, Add-Path RFC 7911, BGP Roles RFC 9234, Extended Next Hop RFC 8950, Send Hold Timer RFC 9687, BGPsec RFC 8205) |

([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271) ; [https://datatracker.ietf.org/doc/html/rfc5492](https://datatracker.ietf.org/doc/html/rfc5492))

### 4. UPDATE message body

```
Withdrawn Routes Length (2 bytes)
Withdrawn Routes (variable)         ; list of (length, prefix) tuples
Total Path Attribute Length (2 bytes)
Path Attributes (variable)          ; ORIGIN, AS_PATH, NEXT_HOP, MED,
                                    ; LOCAL_PREF, ATOMIC_AGGREGATE,
                                    ; AGGREGATOR, COMMUNITIES (1997),
                                    ; LARGE_COMMUNITIES (8092),
                                    ; MP_REACH_NLRI / MP_UNREACH_NLRI (4760),
                                    ; AS4_PATH / AS4_AGGREGATOR (6793),
                                    ; OTC (9234), Prefix-SID (8669)…
NLRI (variable)                     ; list of (length, prefix) tuples
```

A single UPDATE may carry one set of attributes plus many NLRI prefixes that share those attributes, plus an arbitrary list of withdrawals. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))

### 5. NOTIFICATION message body

`Error code (1) | Error subcode (1) | Data (variable)`. Sending a NOTIFICATION terminates the session. Subcodes include 6/4 "Administrative Reset," 6/3 "Peer De-configured," 1/1 "Unsupported Version Number," and so on. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))

### 6. KEEPALIVE

A keepalive is just the 19-byte header, with Length=19, Type=4. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))

### 7. Annotated hex of an OPEN

A real captured OPEN of length 29 from a Cisco router with ASN 65033, holdtime 180 s, BGP-ID 192.168.0.33, no optional params ([https://hpd.gasmi.net/](https://hpd.gasmi.net/)):

```
FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF   ; Marker (16 bytes, all 1s)
00 1D                                            ; Length = 29
01                                               ; Type = 1 (OPEN)
04                                               ; Version = 4
FE 09                                            ; My AS = 65033
00 B4                                            ; Hold Time = 180 s
C0 A8 00 21                                      ; BGP Identifier = 192.168.0.33
00                                               ; Opt Param Length = 0
```

A real keepalive is exactly:

```
FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF 00 13 04
```

Length=0x0013 (19), Type=4. ([https://www.networklessons.com/bgp/bgp-messages](https://www.networklessons.com/bgp/bgp-messages))

### 8. Finite state machine

#mermaid-rjf{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rjf .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rjf .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rjf .error-icon{fill:#CC785C;}#mermaid-rjf .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rjf .edge-thickness-normal{stroke-width:1px;}#mermaid-rjf .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rjf .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rjf .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rjf .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rjf .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rjf .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjf .marker.cross{stroke:#A1A1A1;}#mermaid-rjf svg{font-family:inherit;font-size:16px;}#mermaid-rjf p{margin:0;}#mermaid-rjf defs #statediagram-barbEnd{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjf g.stateGroup text{fill:#A1A1A1;stroke:none;font-size:10px;}#mermaid-rjf g.stateGroup text{fill:#E5E5E5;stroke:none;font-size:10px;}#mermaid-rjf g.stateGroup .state-title{font-weight:bolder;fill:#E5E5E5;}#mermaid-rjf g.stateGroup rect{fill:transparent;stroke:#A1A1A1;}#mermaid-rjf g.stateGroup line{stroke:#A1A1A1;stroke-width:1;}#mermaid-rjf .transition{stroke:#A1A1A1;stroke-width:1;fill:none;}#mermaid-rjf .stateGroup .composit{fill:#f4f4f4;border-bottom:1px;}#mermaid-rjf .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#mermaid-rjf .state-note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rjf .state-note text{fill:#E5E5E5;stroke:none;font-size:10px;}#mermaid-rjf .stateLabel .box{stroke:none;stroke-width:0;fill:transparent;opacity:0.5;}#mermaid-rjf .edgeLabel .label rect{fill:transparent;opacity:0.5;}#mermaid-rjf .edgeLabel{background-color:transparent;text-align:center;}#mermaid-rjf .edgeLabel p{background-color:transparent;}#mermaid-rjf .edgeLabel rect{opacity:0.5;background-color:transparent;fill:transparent;}#mermaid-rjf .edgeLabel .label text{fill:#E5E5E5;}#mermaid-rjf .label div .edgeLabel{color:#E5E5E5;}#mermaid-rjf .stateLabel text{fill:#E5E5E5;font-size:10px;font-weight:bold;}#mermaid-rjf .node circle.state-start{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjf .node .fork-join{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjf .node circle.state-end{fill:#A1A1A1;stroke:#f4f4f4;stroke-width:1.5;}#mermaid-rjf .end-state-inner{fill:#f4f4f4;stroke-width:1.5;}#mermaid-rjf .node rect{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-rjf .node polygon{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-rjf #statediagram-barbEnd{fill:#A1A1A1;}#mermaid-rjf .statediagram-cluster rect{fill:transparent;stroke:#A1A1A1;stroke-width:1px;}#mermaid-rjf .cluster-label,#mermaid-rjf .nodeLabel{color:#E5E5E5;}#mermaid-rjf .statediagram-cluster rect.outer{rx:5px;ry:5px;}#mermaid-rjf .statediagram-state .divider{stroke:#A1A1A1;}#mermaid-rjf .statediagram-state .title-state{rx:5px;ry:5px;}#mermaid-rjf .statediagram-cluster.statediagram-cluster .inner{fill:#f4f4f4;}#mermaid-rjf .statediagram-cluster.statediagram-cluster-alt .inner{fill:#CC785C;}#mermaid-rjf .statediagram-cluster .inner{rx:0;ry:0;}#mermaid-rjf .statediagram-state rect.basic{rx:5px;ry:5px;}#mermaid-rjf .statediagram-state rect.divider{stroke-dasharray:10,10;fill:#CC785C;}#mermaid-rjf .note-edge{stroke-dasharray:5;}#mermaid-rjf .statediagram-note rect{fill:#2D2D2D;stroke:#A1A1A1;stroke-width:1px;rx:0;ry:0;}#mermaid-rjf .statediagram-note rect{fill:#2D2D2D;stroke:#A1A1A1;stroke-width:1px;rx:0;ry:0;}#mermaid-rjf .statediagram-note text{fill:#E5E5E5;}#mermaid-rjf .statediagram-note .nodeLabel{color:#E5E5E5;}#mermaid-rjf .statediagram .edgeLabel{color:red;}#mermaid-rjf #dependencyStart,#mermaid-rjf #dependencyEnd{fill:#A1A1A1;stroke:#A1A1A1;stroke-width:1;}#mermaid-rjf .statediagramTitleText{text-anchor:middle;font-size:18px;fill:#E5E5E5;}#mermaid-rjf :root{--mermaid-font-family:inherit;}ManualStart / TCP_CR_AckedConnectRetryTimer expires / TCP failsConnectRetryTimerTCP established → send OPENTCP established → send OPENreceive valid OPEN → send KEEPALIVENOTIFICATION / HoldTimerreceive KEEPALIVENOTIFICATION / HoldTimer / SendHoldTimer (RFC 9687)NOTIFICATION / HoldTimer / SendHoldTimerIdleConnectActiveOpenSentOpenConfirmEstablished

Timers (defaults vary by vendor): ConnectRetryTimer 120 s; HoldTimer 90 s default per RFC 4271 (Cisco IOS uses 180 s); KeepaliveTimer = HoldTime/3; MRAI 30 s eBGP / 5 s iBGP (often 0 in modern code); SendHoldTimer (RFC 9687, 2024) recommended ≥ HoldTime. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271) ; [https://datatracker.ietf.org/doc/rfc9687/](https://datatracker.ietf.org/doc/rfc9687/))

### 9. Sequence of an eBGP session bring-up

Router B (AS65002)Router A (AS65001)Router B (AS65002)Router A (AS65001)#mermaid-rjg{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rjg .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rjg .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rjg .error-icon{fill:#CC785C;}#mermaid-rjg .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rjg .edge-thickness-normal{stroke-width:1px;}#mermaid-rjg .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rjg .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rjg .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rjg .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rjg .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rjg .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjg .marker.cross{stroke:#A1A1A1;}#mermaid-rjg svg{font-family:inherit;font-size:16px;}#mermaid-rjg p{margin:0;}#mermaid-rjg .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rjg text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjg .actor-line{stroke:#A1A1A1;}#mermaid-rjg .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rjg .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rjg #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rjg .sequenceNumber{fill:#5e5e5e;}#mermaid-rjg #sequencenumber{fill:#E5E5E5;}#mermaid-rjg #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rjg .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rjg .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rjg .labelText,#mermaid-rjg .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjg .loopText,#mermaid-rjg .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjg .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rjg .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rjg .noteText,#mermaid-rjg .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjg .activation0{fill:transparent;stroke:#00000000;}#mermaid-rjg .activation1{fill:transparent;stroke:#00000000;}#mermaid-rjg .activation2{fill:transparent;stroke:#00000000;}#mermaid-rjg .actorPopupMenu{position:absolute;}#mermaid-rjg .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rjg .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rjg .actor-man circle,#mermaid-rjg line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rjg :root{--mermaid-font-family:inherit;}State = EstablishedKEEPALIVE every ~60sTCP FIN, return to IdleTCP SYN (port 179)TCP SYN-ACKTCP ACKBGP OPEN (Version=4, MyAS=65001, HoldTime=180, ID=10.0.0.1, caps)BGP OPEN (Version=4, MyAS=65002, HoldTime=180, ID=10.0.0.2, caps)BGP KEEPALIVEBGP KEEPALIVEBGP UPDATE (NLRI 192.0.2.0/24, AS_PATH 65001, NEXT_HOP 10.0.0.1, …)BGP UPDATE (NLRI 198.51.100.0/24, AS_PATH 65002, …)BGP UPDATE (Withdraw 192.0.2.0/24)NOTIFICATION 6/4 (Administrative Reset)

### 10. Best-path selection algorithm

When a BGP speaker has multiple paths to the same prefix, it walks down this ladder, stopping at the first tiebreaker that is decisive:

1. **Weight** — Cisco-only, locally configured, highest wins.
2. **LOCAL_PREF** — highest wins; iBGP-scoped.
3. Locally originated routes (network statement / aggregate / redistribute) win over learned ones.
4. **Shortest AS_PATH.**
5. **Lowest ORIGIN** (IGP < EGP < Incomplete).
6. **Lowest MED** — only between paths from the same neighbor AS by default.
7. **eBGP over iBGP.**
8. **Lowest IGP cost to NEXT_HOP.**
9. Oldest external route (stability tiebreaker).
10. Lowest router ID (BGP Identifier).
11. Shortest cluster-list length (route-reflector environments).
12. Lowest neighbor IP address.

([https://en.wikipedia.org/wiki/Border_Gateway_Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol) ; [https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))

### 11. Filtering and policy

Practical knobs: prefix-lists (match prefix + length range), AS-path access-lists (regex over AS_PATH), route-maps that can `set` LOCAL_PREF / MED / community / next-hop. Communities (RFC 1997) carry 32-bit tags; large communities (RFC 8092) carry 96 bits and don't suffer the 16-bit-ASN-in-the-low-half problem. ([https://datatracker.ietf.org/doc/html/rfc8092](https://datatracker.ietf.org/doc/html/rfc8092)) [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)

### 12. Session security

- **TCP-MD5 (RFC 2385).** Deprecated.
- **TCP-AO (RFC 5925).** Modern HMAC-based replacement; deployment is patchy.
- **GTSM (RFC 5082).** Send eBGP packets with TTL=255, drop incoming if TTL<254. Cheap, effective against spoofed packets from off-path attackers. ([https://datatracker.ietf.org/doc/html/rfc5082](https://datatracker.ietf.org/doc/html/rfc5082))
- **RPKI ROV (RFC 6811, RFC 9582).** Drops invalid origin announcements. ~54% of IPv4 routes have ROAs and ~74% of traffic destinations were ROA-covered as of December 2024 according to MANRS/Kentik. ([https://manrs.org/2025/01/rpki-growth-2024/](https://manrs.org/2025/01/rpki-growth-2024/)) [MANRS](https://manrs.org/2025/01/rpki-growth-2024/)
- **BGPsec (RFC 8205).** Negligible deployment.
- **ASPA.** Drafts approaching last call (May 2026).
- **BGP Roles + OTC (RFC 9234).** Real-world deployment growing; Cloudflare and others advocate it as the simplest and most actionable AS-path-leak defence. ([https://blog.apnic.net/2025/09/05/preventing-route-leaks-made-simple-bgp-roleplay/](https://blog.apnic.net/2025/09/05/preventing-route-leaks-made-simple-bgp-roleplay/)) [APNIC Blog](https://blog.apnic.net/2025/07/22/how-can-rpki-can-be-made-quantum-safe/)

### 13. Common extensions (a tour)

- **Multiprotocol BGP, RFC 4760.** Adds `MP_REACH_NLRI` / `MP_UNREACH_NLRI`, allowing IPv6, VPNv4, VPNv6, EVPN, multicast, link-state, and FlowSpec to ride one TCP session. [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- **BGP/MPLS L3VPN, RFC 4364.**
- **EVPN, RFC 7432.**
- **BGP-LS, RFC 9552 (obsoletes RFC 7752 / RFC 9029).** Distributes IGP topology to a controller (PCE, ALTO). [RFC Editor](https://www.rfc-editor.org/rfc/rfc9552.html)
- **BGP FlowSpec, RFC 8955 / RFC 8956.** Distributes packet-filter ACLs via BGP for DDoS mitigation.
- **BGP SR / Prefix-SID, RFC 8669.** Carries Segment Routing identifiers.
- **BMP, RFC 7854.** Read-only stream of BGP state to a collector.
- **Add-Path, RFC 7911.** Advertise multiple paths per prefix.
- **Graceful Restart RFC 4724; LLGR RFC 9494.** Preserve forwarding through a control-plane restart.

---

## Deep connections to other protocols

**TCP.** BGP runs on top of TCP/179. It chose TCP (over UDP or a custom transport) for reliability, in-order delivery, congestion control, and authentication. The cost is **head-of-line blocking**: a slow processor on either side delays everything. RFC 9687 (2024) was created precisely because TCP can advertise a zero receive window indefinitely, and historical BGP implementations would happily wait forever, producing "BGP zombies" — withdrawn routes that linger because the withdraw never made it through. ([https://datatracker.ietf.org/doc/rfc9687/](https://datatracker.ietf.org/doc/rfc9687/)) TCP-MD5 is being supplanted by TCP-AO (RFC 5925) and GTSM (RFC 5082).

**DNS.** BGP and DNS are co-dependent in a way that makes outages spectacular. DNS lookups are IP packets, so they need BGP-supplied routes to find a resolver. But authoritative DNS servers are themselves reachable only because BGP advertises their prefixes. The **Facebook/Meta outage of 4 October 2021** is the textbook case: a backbone change caused Meta's edge DNS servers to withdraw their BGP routes (they were configured to do so when they couldn't reach the data centres). The outside world saw `facebook.com` SERVFAIL, Cloudflare's 1.1.1.1 saw 30× normal query load, employees couldn't even badge into their offices because the access systems also depended on internal Facebook DNS. Outage lasted ~7 hours. ([https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/) ; [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)) [FB + 2](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

**IPv4.** BGP-4 was originally IPv4-only; NLRI bytes were `(length, prefix)` tuples assumed to be IPv4. The MP-BGP extensions in RFC 4760 generalised this by introducing `MP_REACH_NLRI` and the AFI/SAFI tag (Address Family Identifier / Subsequent AFI). IPv4 unicast is AFI=1, SAFI=1. ([https://datatracker.ietf.org/doc/html/rfc4760](https://datatracker.ietf.org/doc/html/rfc4760))

**IPv6.** Carried as AFI=2/SAFI=1 via MP-BGP. Modern hyperscalers run **IPv6-only underlays** with **RFC 8950** (advertising IPv4 NLRI with an IPv6 next-hop). Cisco IOS-XE 17.8 added VPNv4-with-IPv6-next-hop support; FRR and Junos have it too. ([https://datatracker.ietf.org/doc/html/rfc8950](https://datatracker.ietf.org/doc/html/rfc8950)) [Cisco](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-routing/b-ip-routing/m-support-bgp-vpn-evpn-nexthop.pdf)

**OSPF / IS-IS / RIP.** Interior gateway protocols. BGP's `NEXT_HOP` is typically resolved through the IGP. iBGP requires the IGP to provide reachability to neighbour loopbacks. IS-IS/OSPF and BGP-LS together feed a controller's traffic-engineering computation. ([https://datatracker.ietf.org/doc/html/rfc2328](https://datatracker.ietf.org/doc/html/rfc2328))

**MPLS.** MPLS labels carry packets; BGP signals labels via labelled-unicast (RFC 8277), VPNv4/VPNv6 (RFC 4364), and EVPN (RFC 7432). ([https://datatracker.ietf.org/doc/html/rfc4364](https://datatracker.ietf.org/doc/html/rfc4364))

**Segment Routing (SR / SRv6).** Builds on MPLS or IPv6 source routing. BGP carries SR information through Prefix-SID (RFC 8669) and BGP-LS-SRv6 (RFC 9514). ([https://datatracker.ietf.org/doc/rfc9514/](https://datatracker.ietf.org/doc/rfc9514/))

**RPKI (RFC 6480 family).** Out-of-band PKI for routing. Operators publish ROAs (RFC 9582) into RPKI repositories; routers use the RTR protocol (RFC 8210, soon RFC 8210bis) to receive validated payloads from a relying-party validator (Routinator, OctoRPKI, FORT, rpki-client). ([https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/](https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/))

**BGPsec (RFC 8205).** A direct in-band path-protection extension. Each AS signs the AS_PATH using a router certificate stored in RPKI. The combinatorial explosion of signature size, the unavailability of fast crypto in router silicon, and the lack of incremental deployment benefit have left BGPsec almost entirely unimplemented in production. ASPA, RFC 9234, and conventional filtering have eaten its lunch. [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC8205)[Sidnlabs](https://www.sidnlabs.nl/downloads/6mCHukPGqoY0ojSMqfIadD/3dd4a89b54d6eb38bf634076505eec8c/PQC_for_the_RPKI.pdf)

**BFD (RFC 5880).** Sub-second liveness check for the underlying L2/L3 path. Used to bring BGP sessions down faster than the 90 s HoldTimer would allow. ([https://datatracker.ietf.org/doc/html/rfc5880](https://datatracker.ietf.org/doc/html/rfc5880))

**GRE.** Common encapsulation used to tunnel BGP between routers across an intermediate L3 cloud (e.g., over the public Internet for multihop eBGP).

**BMP (RFC 7854) and NETCONF/YANG.** Modern operations: BMP streams real-time BGP state out of the router to a collector; NETCONF/YANG (RFC 6020/RFC 6241/RFC 7950) provide model-driven config, gradually replacing screen-scraped CLI in big networks.

**IDRP (ISO 10747).** The OSI-stack inter-domain protocol that lost. In 1995 BGP-4 won by being shipping code and supporting CIDR.

**EGP (RFC 904).** Predecessor; assumed a tree-structured Internet with a single backbone. Decommissioned circa 1995. ([https://datatracker.ietf.org/doc/html/rfc904](https://datatracker.ietf.org/doc/html/rfc904))

**CIDR (RFC 4632).** Co-evolved with BGP-4 in 1993–1995; eliminated address classes and let prefix masks be arbitrary lengths, allowing aggregation and pulling the routing-table-size curve down by an order of magnitude. ([https://datatracker.ietf.org/doc/html/rfc4632](https://datatracker.ietf.org/doc/html/rfc4632)) [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)

---

## Real-world deployment

### Implementations

- **Cisco IOS / IOS-XR / NX-OS.** Reference commercial BGP. IOS-XR added ASPA EFT in 2025.
- **Juniper Junos.** Long history of large-table BGP. Affected by the **20 May 2025 Prefix-SID 0x00 incident**, where a malformed BGP UPDATE caused JunOS and Arista EOS to reset sessions while IOS-XR/Nokia SR OS handled it gracefully under RFC 7606. ([https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident](https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident)) [Benjojo](https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident)
- **Nokia SR OS, Arista EOS, Mikrotik RouterOS.**
- **FRRouting (FRR).** Linux-Foundation fork of Quagga; widely used in SONiC/data-centre environments. CVEs continue to flow, e.g. CVE-2024-55553 (RPKI re-validation buffer issue), CVE-2024-44070, CVE-2025-61102/61106/61107 (OSPF NULL-pointer DoS through crafted LSAs). ([https://frrouting.org/security/](https://frrouting.org/security/)) [Ptsecurity](https://dbugs.ptsecurity.com/vulnerability/PT-2025-1316)[SentinelOne](https://www.sentinelone.com/vulnerability-database/cve-2025-61106/)
- **BIRD.** The Czech-NIC open-source daemon and the *de facto* reference for IXP route servers. **BIRD 3.0**, released **January 2025**, was the first stable multithreaded version, scaling to 5,000+ peers; BIRD 2.16 (December 2024) shipped ASPA support. ([https://bird.nic.cz/](https://bird.nic.cz/)) [Freshfoss + 2](https://freshfoss.com/projects/bird)
- **OpenBGPD (OpenBSD).** Curated for security; many IXPs run it.
- **GoBGP.** Used by Calico, MetalLB, kube-router, Tigera; not the highest-performance daemon (Justin Pietsch's measurements). ([https://github.com/osrg/gobgp](https://github.com/osrg/gobgp)) [Medium](https://medium.com/the-elegant-network/comparing-open-source-bgp-stacks-with-internet-routes-6a7371641dcb)
- **ExaBGP.** Python; popular for blackholing and event-driven automation.
- **Quagga.** Mostly subsumed by FRR.
- **RustyBGPd.** Experimental Rust implementation.

### Who runs BGP at scale

- **Tier-1 ISPs.** Lumen, Cogent, NTT (AS2914), Telia/Arelion, GTT, Tata, Zayo, Telecom Italia Sparkle.
- **Hyperscalers.** Google (AS15169), Meta (AS32934), AWS (AS16509), Microsoft, Cloudflare (AS13335), Akamai (AS20940). Meta's data-centre fabric paper at NSDI 2021 documents how Facebook chose BGP4 with hierarchical AS numbering and route summarisation as the only routing protocol inside a data-centre fabric — a design now common across the industry. ([https://www.usenix.org/conference/nsdi21/presentation/abhashkumar](https://www.usenix.org/conference/nsdi21/presentation/abhashkumar)) Meta also runs **Edge Fabric** for performance-aware egress (SIGCOMM 2017). ([https://research.fb.com/blog/2017/08/steering-oceans-of-content-to-the-world/](https://research.fb.com/blog/2017/08/steering-oceans-of-content-to-the-world/)) [FB](https://engineering.fb.com/2014/11/14/production-engineering/introducing-data-center-fabric-the-next-generation-facebook-data-center-network/)[FB](https://research.fb.com/blog/2017/08/steering-oceans-of-content-to-the-world/)
- **Microsoft SONiC** (open-source NOS) uses FRR.
- **Cloudflare's anycast** advertises the same /24s from hundreds of POPs and lets BGP+anycast pull users to the nearest one.

### Topologies inside an AS

- **Full-mesh iBGP.** O(n²) sessions; useless beyond a handful of routers.
- **Route reflectors (RFC 4456).** Hierarchical; clients peer to reflectors only.
- **Confederations (RFC 5065).** Sub-ASNs.

### Internet-scale numbers (snapshot Q1 2026)

- **DFZ size** (default-free zone): the IPv4 routing table now exceeds **~1.0 million prefixes for all peers** as of late 2025; Geoff Huston's vantage point in AS131072 reported **1,026 BGP peers seeing roughly 1.2 million IPv4 prefixes** at the start of 2026, with ~50,000 prefix-count variance across peers. ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)) IPv6 DFZ is ~200,000 prefixes (the precise figure varies; one secondary source pegs IPv6 DFZ "more than 300,000" — different methodology, different vantage point). ([https://ipgeolocation.io/guides/what-is-an-asn](https://ipgeolocation.io/guides/what-is-an-asn)) `[needs source for a single, current 2026 IPv6 DFZ count from a primary measurement]` [APNIC Blog](https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/)[Ipgeolocation](https://ipgeolocation.io/guides/what-is-an-asn)
- **Active ASNs visible in BGP:** roughly **80,000** out of ~120,000 allocated as of 2026. ([https://ipgeolocation.io/guides/what-is-an-asn](https://ipgeolocation.io/guides/what-is-an-asn) ; [https://en.wikipedia.org/wiki/Autonomous_system_(Internet)](https://en.wikipedia.org/wiki/Autonomous_system_(Internet))) IANA assigned ASNs surpassed 100,000 by December 2020. [Ipgeolocation + 2](https://ipgeolocation.io/guides/what-is-an-asn)
- **Updates and churn.** Geoff Huston's 2025 report records 15,000–25,000 IPv4 withdrawals/day in normal periods, with brief 75,000/day spikes during 2022. **Less than 5% of unstable prefixes generated half of all IPv4 BGP updates in December 2025**; 50 origin ASNs accounted for one third of all updates. The DFZ remains generally stable. ([https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/](https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/)) [APNIC Blog + 2](https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/)
- **AS4155 (USDA) cleanup, 1 November 2025.** USDA collapsed 3,122 more-specific prefixes covering ~965,000 addresses down to 23 prefixes covering 3.1 M addresses, visible globally as a step change in the DFZ. ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)) [Apnic](https://labs.apnic.net/index.php/2026/01/06/bgp-in-2025/)
- **Egypt cable-fire BGP signature, 7 July 2025.** Ramses Central fire in Cairo killed four people and produced a measurable drop in Egyptian-origin BGP advertisements, used as a forensic timeline. ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)) [Google APIs](https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5629/20260204_Huston_Bgp_In_2025_v1.pdf)

### IXPs

Most large IXPs run **BIRD or OpenBGPD route servers** so that members get one BGP session and pick up routes to many peers. RFC 7947 codifies route-server semantics. **MANRS** publishes a public observatory of conformant operators. ([https://observatory.manrs.org/](https://observatory.manrs.org/))

### Memory and convergence

A single `(prefix, attributes)` entry in a Loc-RIB occupies on the order of a few hundred bytes; Adj-RIB-In can multiply that by the number of peers. Hardware FIB capacity is measured in TCAM entries and is the binding constraint — Geoff Huston quantifies that a 10-Tbps line card with 900-byte average packet must make a forwarding decision in roughly 70 ns, requiring TCAM/CAM-style lookups for a million-entry table. ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/)) Convergence for a typical eBGP withdrawal is sub-second within a region; cross-Internet convergence after a major leak runs to minutes. [apnic](https://blog.apnic.net/2026/01/08/bgp-in-2025/)

### RPKI deployment as of December 2024 / early 2026

- **~54% of IPv4 prefixes** and **~54% of IPv6 prefixes** are ROA-covered. [MANRS](https://manrs.org/2025/01/rpki-growth-2024/)
- **~74% of IP traffic** is destined to ROA-covered networks (Kentik). [MANRS](https://manrs.org/2025/01/rpki-growth-2024/)
- The first time IPv4 crossed 50% ROA coverage was **May 2024**; IPv6 had crossed earlier, in late 2023. [Nanog](https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/)[Nanog](https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/)
- ([https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/](https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/) ; [https://manrs.org/2025/01/rpki-growth-2024/](https://manrs.org/2025/01/rpki-growth-2024/))

---

## Failure modes and famous incidents

Every operator should be able to tell these stories.

### 1997 — AS 7007

**What happened.** On 25 April 1997 at 11:30 EST, **MAI Network Services** (AS7007) — sometimes mis-attributed to the Florida Internet Exchange — leaked a deaggregated copy of much of the global routing table as /24s with AS_PATH=7007 to its upstreams. Because /24s win longest-prefix match over /16s and /8s, traffic for much of the Internet was suddenly funnelled toward AS7007's tiny edge routers. **Result:** several hours of partial Internet meltdown. Memory of this incident drives modern max-prefix limits and prefix filtering. ([https://en.wikipedia.org/wiki/AS_7007_incident](https://en.wikipedia.org/wiki/AS_7007_incident) ; [https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)) [Nanog + 3](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)

### 2008 — YouTube vs. Pakistan Telecom

**What happened.** On 24 February 2008, the Pakistani government ordered ISPs to block YouTube. **Pakistan Telecom (AS17557)** announced the more-specific 208.65.153.0/24 internally as a black-hole; the announcement leaked to **PCCW (AS3491)**, which propagated it. YouTube's covering /22 lost to the /24 across most of the DFZ. ~97 ASNs carried the bad route within minutes. **Outage:** ~80 minutes, until PCCW disconnected Pakistan Telecom; YouTube announced /25s in retaliation but propagation was limited because most operators filter prefixes longer than /24. ([https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)) [CircleID + 3](https://circleid.com/posts/82258_pakistan_hijacks_youtube_closer_look)

### 2018 — Amazon Route 53 hijack stealing MyEtherWallet

**What happened.** On 24 April 2018 at 11:05 UTC, **eNet (AS10297)** in Columbus, Ohio originated five /24s of Amazon's Route 53 prefix space (205.251.192.0/24, etc.) for two hours. Operators including 1&1, Hurricane Electric, and BroadbandOne accepted the announcements; Level3, Cogent, and NTT (MANRS members) filtered them. A fake DNS server in Equinix Chicago answered queries for `myetherwallet.com` with phishing IPs hosted in Russia. **Loss:** ~$150,000 in Ethereum siphoned from victims who clicked through the self-signed-certificate warning. ([https://www.internetsociety.org/blog/2018/04/amazons-route-53-bgp-hijack/](https://www.internetsociety.org/blog/2018/04/amazons-route-53-bgp-hijack/) ; [https://www.theregister.com/2018/04/24/myetherwallet_dns_hijack/](https://www.theregister.com/2018/04/24/myetherwallet_dns_hijack/)) [Internet Society + 3](https://www.internetsociety.org/blog/2018/04/amazons-route-53-bgp-hijack/)

### 2019 — Verizon × DQE × Allegheny Technologies

**What happened.** On 24 June 2019, **DQE Communications (AS33154)** in Pittsburgh used a Noction BGP optimizer to fragment Internet routes into more-specifics inside its network. It announced these to its customer **Allegheny Technologies (AS396531)**, a steel manufacturer. Allegheny's static route to its other transit provider **Verizon (AS701)** had no inbound filter; Verizon redistributed the leak to the world. ~20,000 prefixes for ~2,400 networks were rerouted through a steel mill's edge. **Cloudflare lost 15% of global traffic at peak.** Cloudflare's blog "How Verizon and a BGP Optimizer Knocked Large Parts of the Internet Offline Today" became canonical reading. ([https://blog.cloudflare.com/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today/](https://blog.cloudflare.com/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today/)) [Cloudflare Blog + 3](https://blog.cloudflare.com/de-de/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today-de-de/)

### 2020 — Rostelecom

**What happened.** On 1 April 2020, **Rostelecom (AS12389)** announced ~8,800 prefixes for major content providers (Google, Facebook, Akamai, Amazon, Cloudflare, Hetzner, Digital Ocean) for ~2 hours. RPKI-validating networks like Telia and NTT ignored the bad routes; others did not. Suspected configuration error from a BGP optimizer, but the geopolitical context made many observers uneasy. ([https://www.darkreading.com/cyber-risk/101-why-bgp-hijacking-just-won-t-die](https://www.darkreading.com/cyber-risk/101-why-bgp-hijacking-just-won-t-die))

### 2021 — Facebook (Meta) October outage

**What happened.** On 4 October 2021 at 15:39 UTC, a Meta engineer ran a routine command intended to assess global backbone capacity. A bug in the change-audit tool failed to catch a side effect: the command disconnected Meta's entire backbone. Meta's smaller PoPs, configured to withdraw their BGP advertisements when they couldn't talk to a data centre, did so. Within minutes Meta's authoritative DNS prefixes were withdrawn, `facebook.com` / `instagram.com` / `whatsapp.com` SERVFAIL'd globally. Internal tools that depended on the same DNS broke. Engineers couldn't badge into Meta buildings (badge readers used internal DNS). Recovery required physical access to console-port routers. Outage: **15:39–22:05 UTC ≈ 6.5 hours.** Cloudflare's 1.1.1.1 saw a 30× spike in queries because every device on Earth retried in lockstep. ([https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/) ; [https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)) [FB + 4](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

### 2022 — Rogers Communications (Canada)

**What happened.** On 8 July 2022 at 04:58 EDT, **Rogers** was in phase 6 of a 7-phase IP core upgrade. A configuration change deleted a routing filter on three Distribution Routers; that allowed all possible Internet routes to be redistributed into the core. The core routers' memory and CPU exceeded capacity within minutes. The **shared wireless+wireline IP core** then collapsed; 12 million Canadians lost mobile, home Internet, and 911 service for ~26 hours. Rogers staff couldn't communicate because their internal management network depended on the same data plane; they had to ship SIM cards from competitors via courier. The CRTC's contracted Xona Partners review (executive summary released July 2024) found the network failure **could have been prevented** with overload-protection mechanisms; it has now produced industry-wide recommendations for separated wireline/wireless cores and out-of-band management. ([https://crtc.gc.ca/eng/publications/reports/xona2023.htm](https://crtc.gc.ca/eng/publications/reports/xona2023.htm) ; [https://crtc.gc.ca/eng/publications/reports/xona2024.htm](https://crtc.gc.ca/eng/publications/reports/xona2024.htm) ; [https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641](https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641)) [Canadian Radio-television and Telecommunications Commission + 5](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)

### 2022 — KlaySwap (Korean DeFi exchange, Feb 2022)

**What happened.** On 3 February 2022, attackers performed a BGP hijack against Kakao Corp's prefix 211.249.216.0/21 (sister AS9457 to AS6461 via Dreamline) and 121.53.104.0/23 to redirect requests for the **Kakao SDK** JavaScript file (loaded by the KLAYswap web app). Replaced JS authorised user wallets to attacker-controlled smart contracts. The attack used a BGP hijack to **also obtain a valid TLS certificate** for `developers.kakao.com` via DCV — bypassing TLS entirely. **Loss: ~$1.9M, ~$1M ultimately laundered.** Princeton CITP characterised it as the first known live attack that leveraged BGP to break the WebPKI. ([https://manrs.org/2022/02/klayswap-another-bgp-hijack-targeting-crypto-wallets/](https://manrs.org/2022/02/klayswap-another-bgp-hijack-targeting-crypto-wallets/) ; [https://blog.citp.princeton.edu/2022/03/09/attackers-exploit-fundamental-flaw-in-the-webs-security-to-steal-2-million-in-cryptocurrency/](https://blog.citp.princeton.edu/2022/03/09/attackers-exploit-fundamental-flaw-in-the-webs-security-to-steal-2-million-in-cryptocurrency/)) [Medium + 5](https://medium.com/s2wblog/post-mortem-of-klayswap-incident-through-bgp-hijacking-en-3ed7e33de600)

### 2022 — Celer Bridge

**What happened.** August 2022, BGP hijack targeted Amazon address space hosting the Celer cryptocurrency bridge front-end; attackers placed bogus IRR objects in AltDB to fool upstream filters. **Loss: ~$235,000.** ([https://www.kentik.com/blog/bgp-hijacks-targeting-cryptocurrency-services/](https://www.kentik.com/blog/bgp-hijacks-targeting-cryptocurrency-services/)) [APNIC Blog + 2](https://blog.apnic.net/2022/11/07/what-can-be-learned-from-bgp-hijacks-targeting-cryptocurrency-services/)

### 2024 — Orange España (3 Jan 2024)

A threat actor "Snow" used credentials harvested by infostealer malware to log in to Orange Spain's RIPE NCC account, edited ROAs to make legitimate prefixes RPKI-invalid, and broke routing for hours. **First major outage caused by RPKI being too strict against an attacker-modified ROA set.** Lesson: enforce 2FA on RIR portals. ([https://securityboulevard.com/2024/01/orange-spain-outage/](https://securityboulevard.com/2024/01/orange-spain-outage/))

### 2024 — Cloudflare 1.1.1.1 incident (27 June 2024)

A Brazilian ISP **Eletronet (AS267613)** announced 1.1.1.1/32 (a host-route hijack of the most famous /32 on the Internet). **Nova (AS262504)** also leaked 1.1.1.0/24. **PEER 1 Global Internet Exchange (AS1031)** — a Tier-1 — accepted both and propagated. **Cloudflare had a valid ROA** for 1.1.1.0/24, but ROAs cover up to maxLength /24, so a /32 announcement is not RPKI-invalid. ~300 networks in 70 countries lost 1.1.1.1 for some users. ([https://blog.cloudflare.com/cloudflare-1111-incident-on-june-27-2024/](https://blog.cloudflare.com/cloudflare-1111-incident-on-june-27-2024/))

### 2025 — Junos/Arista BGP Prefix-SID corrupted-attribute reset (20 May 2025)

A malformed BGP UPDATE carrying an all-zero RFC 8669 Prefix-SID attribute (40), originated by AS9304 Hutchison or AS135338 Starcloud, leaked from internal-only territory onto the public DFZ via Hutchison's many IXP connections. **JunOS and Arista EOS** crashed sessions on receipt; **IOS-XR, Nokia SR OS, BIRD** correctly applied RFC 7606 "treat-as-withdraw." Significant transient global routing instability. The incident illustrated again how slow vendors are to implement RFC 7606 across all attribute types. ([https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident](https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident)) [Benjojo + 3](https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident)

### 2025 — Cloudflare 1.1.1.1 outage (14 July 2025)

Internal Cloudflare config error caused withdrawal of 1.1.1.0/24 and 1.0.0.0/24 routes for ~1 hour. Some observers saw the resulting RPKI-invalid back-up announcement and suspected a hijack — Doug Madory at Kentik publicly identified the propagation pattern as a withdraw, not a hijack. ([https://www.kentik.com/blog/cloudflares-dns-downtime-why-bgp-hijacks-were-never-to-blame/](https://www.kentik.com/blog/cloudflares-dns-downtime-why-bgp-hijacks-were-never-to-blame/)) [ThousandEyes](https://www.thousandeyes.com/blog/cloudflare-outage-analysis-july-14-2025)[Kentik](https://www.kentik.com/blog/cloudflares-dns-downtime-why-bgp-hijacks-were-never-to-blame/)

### 2026 — Cloudflare Miami IPv6 route leak (22 January 2026)

Policy automation removed a prefix list, leaving an overly-permissive export policy that re-distributed Cloudflare's internal IPv6 prefixes to peers and providers in Miami. ~12 Gbps dropped, 25 minutes of IPv6 congestion, mixed Type-3 and Type-4 leak per RFC 7908. Cloudflare's postmortem describes patching the automation, adding empty-policy detection in CI/CD, and explicit "received from peer/provider" rejection communities. ([https://blog.cloudflare.com/route-leak-incident-january-22-2026/](https://blog.cloudflare.com/route-leak-incident-january-22-2026/)) [Bleeping Computer + 3](https://www.bleepingcomputer.com/news/security/cloudflare-misconfiguration-behind-recent-bgp-route-leak/)

### CVEs (selected, 2024–2026)

- **CVE-2022-40476 (FRR).** Existing.
- **CVE-2024-34088 (FRR).** OSPF DoS via NULL pointer. ([https://cyber.vumetric.com/vulns/CVE-2024-34088/unspecified-vulnerability-in-frrouting/](https://cyber.vumetric.com/vulns/CVE-2024-34088/unspecified-vulnerability-in-frrouting/))
- **CVE-2024-44070, CVE-2024-55553 (FRR).** Improper resource release / RPKI re-validation buffer issue causing global re-validation storm. ([https://dbugs.ptsecurity.com/vulnerability/PT-2025-1316](https://dbugs.ptsecurity.com/vulnerability/PT-2025-1316)) [Ptsecurity](https://dbugs.ptsecurity.com/vulnerability/PT-2025-1316)
- **CVE-2025-61099, 61102, 61106, 61107 (FRR).** Multiple OSPF NULL-pointer DoS via crafted LSAs in `ospf_ext.c`, fixed in 10.4.x. ([https://www.sentinelone.com/vulnerability-database/cve-2025-61106/](https://www.sentinelone.com/vulnerability-database/cve-2025-61106/)) [SentinelOne](https://www.sentinelone.com/vulnerability-database/cve-2025-61106/)
- **Cartwright-Cox BGP attribute fuzzing class (2023–2025).** Generic class of crafted-attribute DoS where a payload travels unharmed until it hits a specific vendor; affected JunOS and Arista (May 2025). Some vendors did not patch promptly. ([https://www.securityweek.com/bgp-flaw-can-be-exploited-for-prolonged-internet-outages/](https://www.securityweek.com/bgp-flaw-can-be-exploited-for-prolonged-internet-outages/)) [SecurityWeek](https://www.securityweek.com/bgp-flaw-can-be-exploited-for-prolonged-internet-outages/)[SecurityWeek](https://www.securityweek.com/bgp-flaw-can-be-exploited-for-prolonged-internet-outages/)

### Common pitfalls

- **AS-path prepending used too aggressively.** Now it's just a longer path, sometimes preferred over a shorter leaked path. Geoff Huston's BGP-in-2025 update churn data shows a small number of pathological prependers generate a third of all updates. ([https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/](https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/)) [LACNIC Blog](https://blog.lacnic.net/en/a-much-needed-bgp-rfc-as-path-prepending/)
- **MED across ASes.** MED is meaningful only between paths from the same neighbour AS. Comparing MEDs cross-AS is meaningless and often misconfigured.
- **Missing inbound/outbound filters** (the AS7007 / Verizon/DQE story in modern dress).
- **Route flap dampening misconfiguration.** RIPE-378 deprecated default RFD parameters in 2006; 2020s recommendation is RFC 7196 / RIPE-580.
- **Static route redistribution into BGP.** Famously the Rogers 2022 trigger.
- **ROA mismatches.** Common to break valid routes when changing transit providers without updating ROAs; the 2024 Orange Spain attack made ROAs themselves the weapon.
- **More-specific ROAs not covering /32 hijacks** (the 1.1.1.1 case).

---

## Fun facts and anecdotes

- **The napkin location, verified.** IETF 12, Austin, Texas, January 1989. Yakov Rekhter (IBM Watson) and Kirk Lougheed (Cisco) sketched on cafeteria napkins. Len Bosack (Cisco co-founder) was at the table. The napkins were thrown away; Cisco kept photocopies and the photocopies hang in Milpitas. The protocol was called the "Two-Napkin Protocol" because the original two napkins were expanded to three handwritten sheets that became the first interoperable code. ([https://computerhistory.org/blog/the-two-napkin-protocol/](https://computerhistory.org/blog/the-two-napkin-protocol/) ; [https://en.wikipedia.org/wiki/Border_Gateway_Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- **The 16-byte all-ones Marker** field was originally a placeholder for an authentication digest. It is now vestigial; modern authentication is below BGP (TCP-MD5/TCP-AO) or above (RPKI/BGPsec/ASPA). The cumulative running joke that "BGP doesn't have a real authentication story for 30+ years" rests on this fact. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- **Yakov Rekhter's other contributions.** MPLS (he's a co-author of the seminal Tag Switching work), RSVP-TE, BGP/MPLS L3VPNs (RFC 4364), CIDR (RFC 4632), and over 80 RFCs. ([https://en.wikipedia.org/wiki/Yakov_Rekhter](https://en.wikipedia.org/wiki/Yakov_Rekhter))
- **AS-path 666 as black-hole community.** Some networks accept the BGP community `<AS>:666` to drop traffic to a prefix at the carrier — a DDoS mitigation idiom popularised by RFC 7999 (BLACKHOLE community). ([https://datatracker.ietf.org/doc/html/rfc7999](https://datatracker.ietf.org/doc/html/rfc7999))
- **BGP "AS-path poisoning."** Operators sometimes prepend an AS in the path that they want to **avoid**; that AS sees its own number, considers it a loop, drops the route. Used historically for traffic engineering and now, sometimes, by researchers. ([https://en.wikipedia.org/wiki/BGP_hijacking](https://en.wikipedia.org/wiki/BGP_hijacking))
- **Andree Toonk's BGPmon** (acquired by OpenDNS, then Cisco) and Doug Madory's work at Renesys/Oracle/Kentik produced most of the public timeline of BGP incidents. ([https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/](https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/))
- **RIPE NCC's RIS** has been collecting MRT dumps since 2001; **Oregon RouteViews** since 1997. Together they're the closest the Internet has to a continuous historical log of itself. ([https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/](https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/))
- **RFC 1925 ("The Twelve Networking Truths," April 1996).** Truth #11: "Every old idea will be proposed again with a different name and a different presentation, regardless of whether it works." Truth #6a: "It is always possible to add another level of indirection." A surprising amount of BGP work is rediscovery — ASPA is in part RFC 1965 (BGP Confederations) revisited with cryptography. ([https://datatracker.ietf.org/doc/html/rfc1925](https://datatracker.ietf.org/doc/html/rfc1925))
- **RFC 2549 (IP over Avian Carriers, April 1999) and RFC 6214 (IPv6 over Avian Carriers, April 2011)** — April-1 RFCs that don't directly target BGP but get cited in NANOG when somebody complains about route convergence times. ([https://datatracker.ietf.org/doc/html/rfc2549](https://datatracker.ietf.org/doc/html/rfc2549))
- **The 512K Day (12 August 2014).** When the IPv4 DFZ crossed 512,000 prefixes, older Cisco line cards with default 512K-route TCAMs failed silently. eBay, LastPass, and Microsoft Azure had visible outages. Lesson: pay attention to your hardware FIB ceiling years in advance. ([https://en.wikipedia.org/wiki/Border_Gateway_Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- **"BGP zombies"** are routes that should have been withdrawn but persist. Geoff Huston dedicated a full 2025 podcast episode to them; APNIC research suggests they correlate with TCP zero-window stalls fixed by RFC 9687's SendHoldTimer. ([https://blog.apnic.net/2025/03/06/podcast-night-of-the-bgp-zombies/](https://blog.apnic.net/2025/03/06/podcast-night-of-the-bgp-zombies/))

---

## Practical wisdom

If you actually run BGP, this is what matters more than the spec.

**Defaults to be skeptical of.**

- Cisco default HoldTime is 180 s (RFC 4271 says 90 s if unconfigured). Verify your peers agree. ([https://datatracker.ietf.org/doc/html/rfc4271](https://datatracker.ietf.org/doc/html/rfc4271))
- MRAI 30 s eBGP / 5 s iBGP is from RFC 4271; many modern code bases default to 0 for fast convergence. Know which.
- KeepaliveTimer = HoldTime / 3 by convention.
- Receiving a session into Established does not mean it is healthy: check `SendHoldTimer` (RFC 9687) and BMP for stuck output queues.

**What to monitor.**

- Session up/down (SNMP, BMP).
- **Prefix counts in / out per peer** (a huge spike means a leak coming at you).
- Per-second update rates and withdrawal rates.
- **RIB size and FIB programming time** — a slow FIB write means data plane lags control plane.
- BGP convergence after intentional failures (use planned drains).
- ROA validation outcomes (Valid / Invalid / NotFound) per peer.

**Production debugging tools.**

- `show bgp neighbor`, `show ip bgp X.X.X.X` (Cisco), `show route protocol bgp` (Junos), `show ip bgp summary` (FRR).
- **Looking glasses** — Hurricane Electric ([https://lg.he.net/](https://lg.he.net/)), bgp.he.net, Cogent, NTT, RIPE RIS Live ([https://ris-live.ripe.net/](https://ris-live.ripe.net/)).
- **BGPstream by CAIDA** ([https://bgpstream.caida.org/](https://bgpstream.caida.org/)) for retrospective MRT analysis.
- **bgp.tools** for live propagation views.
- **BMP collectors** (OpenBMP, Kentik, ThousandEyes, Cisco Crosswork).
- **Traceroute correlation** to confirm where traffic actually goes vs. what BGP says.

**Common misconfigurations to grep for in your own configs.**

- No inbound or outbound prefix list on an eBGP neighbour. (Almost every famous incident.)
- Allow-all import policies on a route reflector.
- Static routes accidentally redistributed into BGP (Rogers 2022).
- AS-path filter that lets your customer-cone learn a peer's prefixes (DQE/Verizon 2019).
- Sister-network blind trust (Orange España 2024).

**Tuning levers.**

- **BFD** (RFC 5880) for sub-second peer-down detection. Don't trust HoldTimer for fast failover.
- **GR / LLGR** (RFC 4724 / RFC 9494). LLGR is dangerous if misused — Ivan Pepelnjak's blog calls out cases where it just hides convergence problems for 4095 + N seconds. ([https://blog.ipspace.net/2024/01/bgp-graceful-restart-harmful/](https://blog.ipspace.net/2024/01/bgp-graceful-restart-harmful/))
- **max-prefix limits per neighbour.** Tear down sessions that suddenly send 10× their normal count. [Cloudflare](https://blog.cloudflare.com/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today/)
- **ROV with reject-invalid policy.** Don't merely tag invalids — drop them.
- **GTSM (RFC 5082).** TTL-based off-path attack mitigation.
- **TCP-AO (RFC 5925)** in place of TCP-MD5 (RFC 2385 deprecated).

**Operate per RFC 7454 (BCP 194, BGP Operations and Security).** Two-and-a-half pages of the most field-tested advice in BGP: filter on prefix and AS-path, use TTL/TCP-AO/GTSM, run max-prefix, scrub communities at borders, deploy automation. ([https://datatracker.ietf.org/doc/html/rfc7454](https://datatracker.ietf.org/doc/html/rfc7454)) [Tech Invite](https://www.tech-invite.com/y70/tinv-ietf-rfc-7454.html)

**Operate per MANRS** (Mutually Agreed Norms for Routing Security): filtering, anti-spoofing, coordination, RPKI ROA + ROV. ([https://manrs.org/](https://manrs.org/))

---

## Learning resources (current as of May 2026)

### RFCs (all on [https://datatracker.ietf.org/](https://datatracker.ietf.org/))

- **RFC 4271 (2006).** BGP-4 core. *Advanced.*
- **RFC 4760 (2007).** Multiprotocol BGP. *Intermediate.*
- **RFC 6793 (2012).** 4-octet ASN. *Intermediate.*
- **RFC 7454 / BCP 194 (2015).** BGP Operations and Security. *Intermediate, essential ops reading.*
- **RFC 6480 / 6810 / 6811 (2012–2013).** RPKI / RTR / ROV.
- **RFC 8205 (2017).** BGPsec. *Read for context only — not deployed.*
- **RFC 9234 (2022).** BGP Roles & OTC.
- **RFC 9494 (2023).** Long-Lived Graceful Restart.
- **RFC 9552 (2023).** BGP-LS, refreshed.
- **RFC 9582 (May 2024).** ROA profile, refreshed.
- **RFC 9687 (Nov 2024).** Send Hold Timer — closes the BGP-zombie failure mode.
- **RFC 9774 (May 2025).** Deprecation of AS_SET / AS_CONFED_SET.
- **draft-ietf-sidrops-aspa-verification-25 (Oct 2025).** ASPA verification, near WG last call.
- **draft-ietf-sidrops-aspa-profile-26 (Apr 2026).** ASPA RPKI object profile.

### Books

- **Sam Halabi, *Internet Routing Architectures*, Cisco Press (2nd ed. 2000).** Classic but dated for the modern Internet. *Intermediate.*
- **Iljitsch van Beijnum, *BGP*, O'Reilly (2002).** Excellent introduction, dated.
- **Jeff Doyle & Jennifer DeHaven Carroll, *Routing TCP/IP, Volume II*, Cisco Press (2nd ed. 2016).** Still cited.
- **Russ White, Don Slice, Alvaro Retana, *Optimal Routing Design*, Cisco Press (2005).**
- **Stuart Fordham, *BGP for Cisco Networks* (2014, 4th ed. 2018).**
- **Randy Zhang & Micah Bartell, *BGP Design and Implementation*, Cisco Press (2003).**
- **Editorial assessment.** As of 2026, *the field is overdue a comprehensive modern textbook* covering RPKI, ASPA, BGP-LS, EVPN, SRv6, hyperscaler-style data-centre BGP, and the post-quantum question. There are excellent fragments (Geoff Huston's annual essays, Job Snijders' RPKI tutorials, Doug Madory's incident write-ups) but no single up-to-date book.

### Academic papers

- Gao & Rexford, **"Stable Internet Routing Without Global Coordination,"** IEEE/ACM TON 2001. [https://doi.org/10.1109/90.974523](https://doi.org/10.1109/90.974523)
- Griffin & Wilfong, **"An Analysis of BGP Convergence Properties,"** SIGCOMM 1999.
- Spring et al., **"Quantifying the Causes of Path Inflation,"** SIGCOMM 2003.
- Abhashkumar et al., **"Running BGP in Data Centers at Scale,"** NSDI 2021. [https://www.usenix.org/conference/nsdi21/presentation/abhashkumar](https://www.usenix.org/conference/nsdi21/presentation/abhashkumar)
- Schulmann et al., **"RPKI: Not Perfect But Good Enough,"** arXiv 2409.14518 (2024).
- Doesburg, **"Post-Quantum Cryptography for the RPKI"** (master's thesis, 2025) and **"pqRPKI: A Practical RPKI Architecture for the Post-Quantum Era,"** arXiv 2603.06968 (2026).
- Birge-Lee et al., **Princeton CITP analysis of KLAYswap** (2022).
- Xygkou, Chariton, Dimitropoulos, Dainotti, **"A First Look into Long-lived BGP Zombies,"** ACM IMC 2025.

### Engineering blogs (2024–2026 highlights)

- Cloudflare. "How Verizon and a BGP Optimizer Knocked Large Parts of the Internet Offline Today" (2019); "Understanding How Facebook Disappeared from the Internet" (Oct 2021); "Cloudflare 1.1.1.1 incident on June 27, 2024"; "Route leak incident on January 22, 2026." ([https://blog.cloudflare.com/](https://blog.cloudflare.com/))
- APNIC Blog, especially Geoff Huston's annual **"BGP in 2025"** (Jan 2026), "BGP updates in 2025" (Jan 2026), and "RPKI's 2025 year in review" (Feb 2026).
- Engineering at Meta — outage details (Oct 2021); "Running BGP in large-scale data centers" (May 2021).
- Kentik Blog — Doug Madory on incident histories and Cloudflare 1.1.1.1 outages.
- ThousandEyes — outage analyses (Cloudflare 2025, Facebook 2021, Rogers 2022).
- Job Snijders / RIPE Labs — annual RPKI year-in-review.
- benjojo (Ben Cartwright-Cox) — `blog.benjojo.co.uk`, BGP fuzzing and incident analysis.

### YouTube / talks

- **NANOG talks** by Doug Madory ("A Brief History of the Internet's Biggest BGP Incidents," NANOG 88+), Job Snijders (RPKI), Andree Toonk (hijack monitoring), Susan Hares (IDR WG status). [https://nanog.org/](https://nanog.org/)
- **Geoff Huston, "BGP in 2025"** at NANOG 96, Feb 2026. [https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5629/20260204_Huston_Bgp_In_2025_v1.pdf](https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5629/20260204_Huston_Bgp_In_2025_v1.pdf)
- **APNIC PING podcast** — "BGP in review for 2025" (Feb 2026); "Night of the BGP zombies" (Mar 2025); "DFOH, MVP, and GILL" (May 2025); "A day in the life of BGP" (Jul 2025).
- **Practical Networking BGP series** (Ed Harmoush) — accessible intro.
- **Tom Scott, "How does the Internet actually work?"** (general audience).

### Podcasts

- **Packet Pushers Heavy Networking** has multiple BGP episodes, including 2024 BGP-DC fabric and RPKI specials.
- **The Hedge** by Russ White (host) — frequent BGP and SRv6 deep-dives.
- **APNIC PING.**
- **Network Collective.**

### University courses (verify current term)

- **Stanford CS 144** — Introduction to Computer Networking (Levis & McKeown). Routing lectures are weeks 5–6 in 2024–2025; BGP gets one to two lectures. [https://cs144.github.io/](https://cs144.github.io/)
- **Stanford CS 249i** — *The Modern Internet* (Zakir Durumeric). Covers BGP, RPKI, MPLS, BGP Communities, hijacking. [https://cs249i.stanford.edu/](https://cs249i.stanford.edu/)
- MIT 6.829, Princeton COS 461 (Nick Feamster, then Chicago — current versions check Feamster's course pages), CMU 15-441/641, Berkeley EECS 122 — all carry one to two lectures of inter-domain routing.

### Hands-on

- **BIRD** — [https://bird.network.cz](https://bird.network.cz) / [https://bird.nic.cz/](https://bird.nic.cz/) (BIRD 3.0 multithreaded, Jan 2025).
- **FRRouting** — [https://frrouting.org/](https://frrouting.org/)
- **OpenBGPD** — [https://www.openbgpd.org/](https://www.openbgpd.org/)
- **GoBGP** — [https://github.com/osrg/gobgp](https://github.com/osrg/gobgp)
- **ExaBGP** — [https://github.com/Exa-Networks/exabgp](https://github.com/Exa-Networks/exabgp)
- **CAIDA BGPstream** — [https://bgpstream.caida.org/](https://bgpstream.caida.org/)
- **RIPE RIS** — [https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/](https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/)
- **RouteViews** — [http://www.routeviews.org/](http://www.routeviews.org/)
- **CIDR Report** — [https://www.cidr-report.org/](https://www.cidr-report.org/)
- **bgp.he.net** Hurricane Electric BGP toolkit.
- **Containerlab** — [https://containerlab.dev/](https://containerlab.dev/), ideal for spinning up BGP topologies with FRR/BIRD/SR-Linux.
- **bgpsim** — research-oriented simulator.
- **Geoff Huston's site, [https://bgp.potaroo.net/](https://bgp.potaroo.net/)**, the longest continuously running BGP analytics dashboard.

---

## Where things are heading (2025–2026 frontier)

**IDR working group (charter and active drafts).** Active in 2026, chaired in part by Sue Hares. Non-trivial active drafts include: `draft-ietf-idr-deprecate-as-set-confed-set` (now RFC 9774), `draft-ietf-idr-bgp-bfd-strict-mode-16`, `draft-ietf-idr-bgp-ls-isis-flood-reflection`, `draft-ietf-idr-flowspec-srv6`, `draft-ietf-idr-performance-routing` (latency-aware BGP), `draft-ietf-idr-flowspec-redirect-ip`, plus an RFC4271bis effort starting in late 2025. [https://datatracker.ietf.org/wg/idr/about/](https://datatracker.ietf.org/wg/idr/about/)

**SIDROPS working group.** Renewed charter requires multiple interoperable implementations before standards-track publication — a first for the WG. Highest-profile workstream is **ASPA**: draft-ietf-sidrops-aspa-verification-25 (Oct 2025) and draft-ietf-sidrops-aspa-profile-26 (Apr 2026). Cisco IOS-XR EFT shipped in 2025; OpenBGPD, Routinator, Krill, BIRD 2.16+ all support ASPA in some form. Expectation as of mid-2026 is RFC publication late 2026. ([https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/](https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/)) New work also includes `draft-ietf-sidrops-rpki-prefixlist` (Signed Prefix Lists, December 2025) and `draft-ietf-sidrops-8210bis` (RTR v2).

**GROW working group.** Operations and route leaks. RFC 9319, RFC 9886, and the long-running `draft-ietf-grow-as-path-prepending` are the touchstones.

**BGPsec.** Effectively stalled. The 2024 SIDROPS literature describes BGPsec as having "negligible deployment in practice." ASPA has eaten its mindshare. ([https://www.sidnlabs.nl/downloads/6mCHukPGqoY0ojSMqfIadD/3dd4a89b54d6eb38bf634076505eec8c/PQC_for_the_RPKI.pdf](https://www.sidnlabs.nl/downloads/6mCHukPGqoY0ojSMqfIadD/3dd4a89b54d6eb38bf634076505eec8c/PQC_for_the_RPKI.pdf))

**RPKI deployment.** ~54% of IPv4 prefixes ROA-covered (NIST RPKI Monitor / MANRS). ~74% of traffic. Comcast deployed RPKI in 2024; the Dutch government mandated it for all government systems by end-2024; the U.S. FCC NPRM (June 2024) targets the nine largest BIAS providers for compulsory plans. Adoption is no longer the bottleneck for sophisticated networks; **incomplete adoption among smaller transit providers is the bottleneck** (the 2024 Cloudflare 1.1.1.1 incident is the cleanest demonstration). ([https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/](https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/))

**AI / ML for BGP anomaly detection.** Multiple 2024–2026 papers (Cristel Pelsser's GILL, "DFOH" — Detecting Forged Origin Hijacks, "MVP" — Multi-View Pivots) apply ML over RIS/RouteViews data. APNIC's PING podcast covered Pelsser's work in May 2025. Production deployment is by Kentik, Catchpoint, and Cloudflare Radar's route-leak detection system, which uses inferred AS-relationships to flag valley-free violations in real time. ([https://blog.apnic.net/2025/05/15/podcast-dfoh-mvp-and-gill-new-ways-of-looking-at-bgp/](https://blog.apnic.net/2025/05/15/podcast-dfoh-mvp-and-gill-new-ways-of-looking-at-bgp/))

**BGP role enforcement (RFC 9234) deployment.** Visible in route-views2 RIB dumps from 2023; growing in 2024–2026. Cloudflare's September 2025 APNIC guest post argues this is the cheapest, most actionable defence for a transit operator. ([https://blog.apnic.net/2025/09/05/preventing-route-leaks-made-simple-bgp-roleplay/](https://blog.apnic.net/2025/09/05/preventing-route-leaks-made-simple-bgp-roleplay/))

**BGP-LS for traffic engineering and SR.** RFC 9552 published December 2023; SRv6 extensions in RFC 9514. Standard plumbing for path-computation-element (PCE) controllers; running in production at NTT, Telia, Comcast, AT&T, and large hyperscaler backbones.

**IPv6-only DFZ trends.** Geoff Huston (Jan 2026): IPv4 DFZ growth resumed in 2025 after a 2021–2024 plateau. IPv6 DFZ continues to grow steadily but more slowly. The hyperscalers run **dual-stack publicly and IPv6-only inside data centres** using RFC 8950 to carry IPv4 NLRI over an IPv6 next-hop. ([https://blog.apnic.net/2026/01/08/bgp-in-2025/](https://blog.apnic.net/2026/01/08/bgp-in-2025/))

**Quantum threats.** RPKI relies on RSA-2048 signatures, which are vulnerable to a sufficiently large quantum computer. SIDROPS has multiple drafts in flight: `draft-doesburg-sidrops-nullscheme` (a clever scheme that sidesteps signing one-time-use EE certs entirely), `draft-doesburg-2025-pqc`, `schulmann-2025-pruning` (iRPKI), and the academic pqRPKI proposal (arXiv 2603.06968, 2026) that uses Merkle Tree Ladders to amortise post-quantum signature size. Concerns include repository size blow-ups (Falcon/ML-DSA signatures are much larger), long dual-stack transition, and operational compatibility. ([https://blog.apnic.net/2025/07/22/how-can-rpki-can-be-made-quantum-safe/](https://blog.apnic.net/2025/07/22/how-can-rpki-can-be-made-quantum-safe/))

**TCP-AO replacing TCP-MD5.** Deployment is patchy; many vendor implementations remain partial. RFC 9687's mention of TCP-AO is one of several hints that the IETF has decisively moved past MD5.

**The "BGP is fundamentally insecure" narrative — has it changed?** Yes. In 2026 it is more accurate to say that BGP **was** fundamentally insecure, that ROV addresses origin attacks (~54% prefix coverage), that ASPA is on the cusp of solving on-path AS leaks, that RFC 9234 is doing the same job in-band right now for participating networks, and that the FCC mandate (June 2024 NPRM) is the first national regulatory backstop for routing security. The remaining hard problems are **stealthy hijacks under incomplete ROV adoption** ([https://datatracker.ietf.org/doc/draft-li-sidrops-stealthy-hijacking/](https://datatracker.ietf.org/doc/draft-li-sidrops-stealthy-hijacking/)) and **post-quantum migration** of the RPKI itself.

**FCC mandate (2024).** The June 2024 NPRM was unanimously adopted; reply comments closed August 2024. It compels nine named providers to file confidential BGP Routing Security Risk Management Plans annually and quarterly RPKI deployment data. As of May 2026 the rulemaking is still in the comment-and-response phase and final rules have not been adopted — implementations should be tracked against the docket (PS Docket 24-146, 22-90). `[needs source for the most recent FCC docket status as of May 2026]`

---

## Hooks for the article, infographic, and podcast

### A 60-second narrated hook (non-expert friendly)

> "In January 1989, two engineers — one from IBM, one from Cisco — sat at a hotel cafeteria in Austin, Texas, and sketched a routing protocol on the back of a couple of napkins. They called it the Border Gateway Protocol, BGP. They thought it was a stop-gap. Thirty-seven years later, BGP runs the entire Internet. It's the protocol that decides which path your video, your phone call, your bank transaction will take across millions of miles of fiber and tens of thousands of independent networks. It has no central authority. It runs on a kind of trust. And every now and then — say, when a small steel mill in Pittsburgh accidentally tells the world it knows how to reach Cloudflare and Amazon — that trust breaks, and a slice of the Internet goes dark. This is the story of how that worked, why it still works, and what's quietly changing underneath it."

### A striking statistic with source

> The global IPv4 default-free zone now exceeds **one million prefixes** for every BGP peer on the Internet, and BGP processes around **20,000 route withdrawals every day** under normal conditions. Yet **less than 5% of unstable prefixes generate fully half** of all those updates. Most of the Internet is, in fact, very stable; a tiny fraction generates almost all the noise. (Geoff Huston, APNIC, "BGP in 2025" / "BGP updates in 2025," January 2026.)

### A "pause and think" moment

> Pause and think: every time you load a webpage, the path your packets take between you and the server is the result of an unbroken global negotiation that has been continuously running, with no single owner, since 1994. There is no central database. There is no master copy. When Facebook went down in October 2021, **it wasn't hacked**. A single command in a routine maintenance script told one of Facebook's routers to stop telling its neighbours where Facebook was. The neighbours believed it. Within minutes the entire Internet had forgotten that Facebook existed. The recovery took six and a half hours, mostly because Facebook engineers couldn't badge into their own buildings — the badge readers also depended on Facebook DNS, which depended on the same BGP routes. (Sources: Cloudflare and Meta engineering postmortems, 4–5 October 2021.)

### A failure-story arc — Rogers Canada, July 2022

> **Setup.** July 2022. Rogers Communications carries about a third of Canada's mobile and home Internet. They have ~12 million customers. Wireless and wired services share a single IP core network. They are in the middle of a seven-phase upgrade. Phases one through five have gone fine. Phase six is rated low-risk because of the others.
> 
> **Mistake.** At 04:58 EDT on 8 July 2022, an engineer pushes a configuration change to three core distribution routers. The change deletes a routing filter. With the filter gone, every possible Internet route now floods into the core. The routers' memory and CPU are sized for the filtered set, not the firehose. They saturate. They start dropping packets. They drop their BGP sessions. The core converges on a state where it can't route anything.
> 
> **Consequence.** Within minutes, 12 million Canadians lose mobile data, home Internet, landline phone, and 911. Interac payments fail nationwide; debit cards stop working at point-of-sale terminals. The Canadian Radio-television and Telecommunications Commission (CRTC) is itself a Rogers customer and goes offline too. Rogers' own management network depends on the same core; staff can't log in remotely. The internal NOC takes 2 hours and 7 minutes to physically reach a console. SIM cards from Bell and Telus have to be physically couriered to remote sites so engineers can talk to each other. [Canadian Radio-television and Telecommunications Commission](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm)
> 
> **Resolution.** It takes 14 hours just to identify the root cause from router logs. The outage lasts 26 hours. The CRTC commissions Xona Partners to perform an independent technical review; the executive summary, released July 2024, concludes the failure was preventable with overload-protection and out-of-band management, and recommends that all Canadian telcos separate wireline and wireless cores, deploy independent management plane, and adopt diversified backup connectivity. Rogers reports back to the CRTC in January 2024 confirming all recommendations have been implemented; full separation of cores (in partnership with Cisco) is ongoing. [CBC News](https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641)[Global News](https://globalnews.ca/news/10607346/rogers-outage-independent-report-crtc/)
> 
> **The lesson.** Even the most experienced operators can take down a country with one BGP filter. The defences are unglamorous: filters that fail closed, an out-of-band management network that survives the data plane, change management with consistent risk scoring, and the humility to assume the next phase is not safer than the last.

---

*End of report.*