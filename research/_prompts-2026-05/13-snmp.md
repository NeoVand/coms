===== PROTOCOL · SNMP · Simple Network Management Protocol =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is SNMP" content
already exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the 1988 origin (Jeffrey Case, Mark Fedor, Martin
  Schoffstall, James Davin) building on SGMP as a stopgap "until OSI CMIP
  ships" but accidentally winning the management war; SNMPv1 (RFC 1067
  in Aug 1988, then RFC 1157 in May 1990); the deeply controversial
  1990s SNMPv2 attempts (v2p, v2c, v2u, v2*) that fractured the IETF
  for nearly a decade; SNMPv2c (RFC 1901–1908 in 1996) shipping
  *without* security; SNMPv3 (RFC 3411–3418 in 2002) finally landing
  the USM/VACM security model — and STILL being the canonical 2026
  baseline.
- Mechanics deep enough that someone could implement a minimal SNMP
  agent or manager after reading: PDU formats (GetRequest, GetNextRequest,
  GetBulkRequest, SetRequest, Trap, InformRequest), the ASN.1 BER
  encoding, OIDs and the OID tree, SMIv2 for MIB definition, the
  USM/VACM security model, community strings (v1/v2c) vs user-based
  security (v3).
- Real failures and famous incidents — CVE-2002-0012/0013 (the famous
  PROTOS ASN.1 paper that broke half the internet's SNMP
  implementations in February 2002), the long history of "public"
  community-string default exposure on hundreds of thousands of
  exposed devices, SNMP reflection DDoS amplification (the 650x
  amplification factor that made SNMP one of the worst amplifiers),
  the 2017 Cisco IOS SNMP vulnerabilities, the SolarWinds 2020
  supply-chain attack (technically Orion, but propagated via SNMP-
  collector-style trust paths and forever changed how the industry
  thinks about monitoring platforms).
- Connections to adjacent protocols — UDP (primary transport on
  161/162), TCP (rare bulk transport), TLS (RFC 6353 SNMP-over-
  TLS/DTLS, slow uptake), DTLS (already in this pass — SNMP-over-
  DTLS), NETCONF/YANG (the modern replacement story, RFC 7950 /
  RFC 6241), gNMI (Google's gRPC + Protobuf replacement), IPFIX
  (flow data, related), syslog (often paired).
- 2024–2026 developments — NETCONF/YANG / gNMI eating SNMP's lunch
  for new deployments; RFC 6353 SNMP-over-TLS push (slow); the IETF
  OPSAREA "managing transition off SNMP" discussion; telemetry
  streaming (model-driven telemetry, MDT) as the actual replacement
  in hyperscale; Cisco's gNMI-by-default push; SNMP nonetheless
  remaining the **only** management protocol shipped on every UPS,
  PDU, printer, and consumer router on Earth.
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
body (IETF datatracker, OPSAWG mailing list archives, IANA enterprise
numbers). Past passes have left 121 `[needs source]` markers across 46
reports — please try harder this round, but never invent a source to
avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how SNMP relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth
(DKIM/SPF/DMARC), SAML, LDAP, Matter+Thread, **DTLS**, PTP.

# Topic

The topic of this research is **SNMP — Simple Network Management
Protocol** — the connectionless, UDP-based, OID-addressed,
ASN.1-encoded protocol that has run network management for nearly four
decades. SNMPv1 was published in **RFC 1067 in August 1988** by
**Jeffrey Case, Mark Fedor, Martin Schoffstall, and James Davin** as
a stopgap "until OSI CMIP ships". CMIP never shipped, and SNMP
accidentally won — and is still the only management protocol that
*every* router, switch, UPS, PDU, printer, and consumer device speaks
in 2026. The canonical current version is **SNMPv3 (RFC 3411–3418,
December 2002)**, though enormous numbers of devices still run
SNMPv2c with community strings.

Related protocols and standards likely connected to SNMP that you
should verify and expand on:

  - **UDP** — primary transport on ports 161 (request) and 162 (trap);
    SNMP's connectionless design choice and its consequences.
  - **TCP** — rare bulk-transfer use; SNMPv3-over-TCP RFC 3430.
  - **TLS / DTLS** — RFC 6353 SNMP-over-TLS and SNMP-over-DTLS for
    transport security; slow adoption.
  - **NETCONF / YANG** — the modern IETF-blessed replacement
    (RFC 6241 NETCONF, RFC 7950 YANG 1.1).
  - **gNMI / gRPC / Protobuf** — Google's hyperscale replacement
    (gNMI = gRPC Network Management Interface).
  - **IPFIX / NetFlow** — flow telemetry, often paired with SNMP for
    interface counters vs flow records.
  - **syslog** — the canonical text-log pairing with SNMP traps.
  - **ASN.1 / BER** — SNMP's encoding heritage.
  - **ICMP** — `ping` as the simpler reachability tool alongside SNMP
    `sysUpTime`.
  - **DNS** — reverse DNS for SNMP-discovered hostnames.

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., manager, agent, NMS, MIB, MIB module, OID, SMI, SMIv1, SMIv2,
  community string, USM, VACM, PDU, GetRequest, GetNextRequest,
  GetBulkRequest, SetRequest, GetResponse, Trap, InformRequest,
  Report PDU, msgFlags, contextEngineID, engineBoots, engineTime,
  RMON, MIB-II, sysObjectID, ifTable, ifIndex, varbind, lexicographic
  ordering)
- [ ] **≥4** dated entries on the history timeline (1988 SGMP →
      RFC 1067 SNMPv1 → 1996 SNMPv2c → 2002 SNMPv3 → 2026 NETCONF
      eclipse)
- [ ] Full SNMP message format with bit widths AND PDU layout
      (Get/GetNext/GetBulk/Set/Response/Trap/Inform), plus the SNMPv3
      message security wrapper
- [ ] SNMP agent / NMS interaction state machine (mermaid
      `stateDiagram-v2`)
- [ ] Sequence diagram of an SNMPv2c GetBulk walk of `ifTable`
      (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (every Cisco/Juniper/Arista/MikroTik/Ubiquiti router
      and switch on the market — measured in the billions of installed
      devices; every APC/Eaton/CyberPower UPS and PDU; every networked
      printer; every Dell/HPE/Supermicro server iDRAC/iLO; PRTG
      monitoring 100K+ deployments, LibreNMS, Zabbix, Datadog
      network monitoring, Cacti (legacy), Nagios, SolarWinds Orion;
      AWS CloudWatch network insights uses SNMP indirectly)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Marshall Rose — the most prolific SNMP author and RFC 1157
      shepherd; Jeffrey Case — UTK and SNMP Research, original
      co-author; Martin Schoffstall — co-author; James Davin —
      co-author; Keith McCloghrie — Cisco / IETF "Mr. SNMP" / MIB
      architect; Steve Waldbusser — RMON, Net-SNMP; Wes Hardaker —
      Net-SNMP maintainer, USM author; David Perkins — MIB master)
- [ ] **≥3** RFCs with number, year, status, and notable-section pointers
      (1157 SNMPv1, 1901–1908 SNMPv2c, 3411–3418 SNMPv3 — particularly
      3414 USM, 3415 VACM, 3416 PDU operations — plus 6353 SNMP-over-
      TLS/DTLS, 7407 deprecation of SNMPv1/v2c authentication, the
      SMIv2 family 2578–2580)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (CVE-2002-0012 / CVE-2002-0013 PROTOS ASN.1 cluster
      Feb 2002 — the "everyone's SNMP is broken" wake-up call;
      SNMP reflection DDoS amplification with 650× amplification
      factor and the 2014 NTP/SNMP/SSDP amplifier era; the 2017
      Cisco IOS SNMP vulnerabilities CVE-2017-6736 / 6737 / 6738
      family; the SolarWinds Orion supply-chain attack Dec 2020
      and its lessons for monitoring-platform trust)
- [ ] **≥3** fun facts / anecdotes with sources (the "Simple" in SNMP
      being aspirational rather than accurate; the SNMPv2 fracture
      across v2p / v2c / v2u / v2* and how it nearly killed the
      protocol; the OSI CMIP-vs-SNMP religious war of the early
      1990s; `public` community string as the most-tried default
      password on the Internet; the MIB-II ifTable's
      lexicographic-walk design being responsible for every "SNMP
      walk took twenty minutes" complaint; the Net-SNMP project's
      lineage from UCD-SNMP from CMU-SNMP)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (community-string secrecy delusion, SNMPv3 USM key derivation
      gotchas, GetBulk max-repetitions tuning, polling-interval
      vs trap design, the `64-bit counter wrap` problem with HC
      counters, AgentX subagent gotchas, MTU and EMSGSIZE on large
      ifTables, the "SNMP returns lies" data-quality reality)
- [ ] **≥3** Wireshark / capture-tool filter examples (`snmp`,
      `udp.port == 161 or udp.port == 162`, `snmp.community`,
      `snmp.version == 3`, plus `tcpdump -i any port 161` and
      `snmpwalk -v2c -c public ...`)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Cisco gNMI-by-default push, Juniper Junos MDT defaults,
      OpenConfig YANG model growth, RFC 6353 SNMP-over-TLS slow
      uptake, the IETF OPSAREA SNMP-deprecation discussions,
      Net-SNMP 5.9.4 release, post-quantum considerations for
      SNMPv3 key derivation, the 2024–25 KEV catalog inclusions of
      SNMP CVEs, IPv6-only management plane trends)
- [ ] **≥1** 2025–2026 frontier development (model-driven telemetry
      / streaming telemetry replacing polling; gNMI Subscribe vs
      SNMP Trap; the OPSAWG retire-or-keep-SNMP discussion; SNMP
      remaining the lowest-common-denominator for non-hyperscale
      operators forever)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (SNMPv2c GetBulk walk of
      ifTable)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* SNMP makes sense. For
each: a one- or two-sentence definition and a link to a clear authoritative
explainer. Cover: UDP, port 161 vs 162, ASN.1, BER encoding, OID, the OID
tree (1.3.6.1.2.1 = mgmt; 1.3.6.1.4.1 = enterprises), MIB, MIB module,
SMI / SMIv2, varbind (variable binding), PDU, GetRequest, GetNextRequest,
GetBulkRequest, SetRequest, GetResponse, Trap (v1 and v2), InformRequest,
Report PDU, manager (NMS), agent, AgentX, RMON, MIB-II (RFC 1213 / 2863),
ifTable, ifIndex, sysObjectID, sysUpTime, community string (read /
write), USM (User-based Security Model), VACM (View-based Access
Control), authPriv vs authNoPriv vs noAuthNoPriv, MD5/SHA auth
protocols, DES/AES priv protocols, contextEngineID, engineBoots,
engineTime, lexicographic ordering.

## History and story

Origin in the late-1980s "Internet management problem": with IP
networks exploding, NSF and DoE needed a way to manage them. **SGMP
(Simple Gateway Monitoring Protocol)** appeared in 1987 as a
stopgap. **SNMPv1** — Jeffrey Case (UTK), Mark Fedor (Performance
Systems / NYSERNet), Martin Schoffstall (Rensselaer / PSI), James Davin
(MIT) — published as **RFC 1067 in August 1988**, then refined to
**RFC 1157 in May 1990**. The IETF intended SNMP as a stopgap "until
**OSI CMIP** ships" — but CMIP arrived too late and too heavy, and
SNMP entrenched. The "Simple" in SNMP was always aspirational.

The **SNMPv2 fracture (1993–1996)** is one of the great IETF
political failures: the working group split into SNMPv2p (party-based
security), SNMPv2c (community-based, no real security), SNMPv2u
(user-based), and SNMPv2* (a fifth attempt), and ultimately shipped
**SNMPv2c (RFC 1901–1908 in 1996)** as a pragmatic compromise that
**explicitly punted on security**. The community string "public"
became the most-tried default password on the Internet for two
decades.

**SNMPv3 (RFC 3411–3418, December 2002)** — Wes Hardaker, Bert
Wijnen, Russ Mundy, David Harrington — finally landed the **User-
based Security Model (USM)** and **View-based Access Control Model
(VACM)**, providing authentication, encryption, and fine-grained
access control. SNMPv3 is the canonical 2026 baseline for any
security-conscious deployment, though the SNMPv2c install base is
permanent.

The slow eclipse: **NETCONF (RFC 4741 in 2006 → RFC 6241 in 2011)
and YANG (RFC 6020 in 2010, YANG 1.1 RFC 7950 in 2016)** giving the
IETF a model-driven structured-config alternative. **gNMI** (Google,
2016) bringing gRPC + Protobuf to network management with
streaming telemetry. **OpenConfig** (2014+) unifying vendor-specific
YANG models. Despite all this, SNMP remains the **only** protocol on
every UPS, PDU, printer, and consumer router shipped in 2026.

Version-history table: SGMP → SNMPv1 → SNMPv2 fracture → SNMPv2c →
SNMPv3 → (frozen).

## How it actually works

Cover:

1. **Architecture** — manager/NMS polling agents (port 161); agents
   sending traps to managers (port 162); the asymmetric "request-
   response" model with rare async traps.
2. **Information model** — the OID tree; MIB modules defining
   managed objects in SMIv2 (RFC 2578–2580); managed objects as
   OID-addressed scalar values or conceptual tables; lexicographic
   walking via GetNext / GetBulk.
3. **PDUs** — GetRequest, GetNextRequest, GetBulkRequest (v2c+),
   SetRequest, Response, Trap (v1 special PDU; v2c+ uses SNMPv2-Trap),
   InformRequest, Report (v3 only).
4. **Message format (v1/v2c)** — SEQUENCE { version, community,
   PDU }, all ASN.1 BER encoded; varbind list as SEQUENCE OF
   SEQUENCE { OID, value }.
5. **Message format (v3)** — SEQUENCE { msgVersion, msgGlobalData
   (msgID, msgMaxSize, msgFlags, msgSecurityModel),
   msgSecurityParameters (USM-specific encoded as OCTET STRING),
   msgData (scopedPDU = contextEngineID + contextName + PDU,
   possibly encrypted) }.
6. **USM** — authentication via HMAC-MD5-96 or HMAC-SHA-96 (and
   HMAC-SHA-256-192 in modern); privacy via DES-CBC (deprecated)
   or AES-128-CFB; key derivation from a passphrase via SHA;
   engineBoots/engineTime for replay protection.
7. **VACM** — context-name-based access control; security-model +
   security-name + group; MIB views (included/excluded subtrees).
8. **MIB-II (RFC 1213, updated RFC 2863 for ifTable)** — the
   canonical "every device implements this" subtree: sysDescr,
   sysObjectID, sysUpTime, sysContact, sysName, sysLocation,
   ifTable (one row per interface), ipTable, tcpTable, udpTable.
9. **Traps and informs** — agent-initiated notifications;
   InformRequest is acknowledged (reliable), Trap is fire-and-
   forget (unreliable).
10. **Transports** — UDP/161 and UDP/162 (overwhelming default);
    TCP for bulk (RFC 3430); TLS/DTLS (RFC 6353).

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of an SNMPv2c GetBulk walk of `ifTable` (manager
   polls, agent responds, manager continues until end-of-MIB)
2. State diagram of an SNMPv3 message security processing pipeline
   (received → decoded → authenticated → decrypted → dispatched →
   responded)
3. SNMPv1/v2c message layout + SNMPv3 message layout (ASN.1 BER
   structure) as labelled tables

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **UDP** — primary transport on 161/162; SNMP's connectionless
  design choice, the trade-offs (no congestion control, no
  reliability, but cheap on agents).
- **TLS / DTLS** — RFC 6353 SNMP-over-TLS for TCP and SNMP-over-
  DTLS for UDP; slow adoption.
- **NETCONF / YANG** — the IETF-blessed replacement; RFC 6241
  NETCONF over SSH, YANG 1.1 RFC 7950.
- **gNMI / gRPC** — Google's hyperscale replacement built on
  HTTP/2 + Protobuf with streaming Subscribe.
- **IPFIX / NetFlow** — flow telemetry, paired with SNMP for
  interface counters.
- **syslog** — text-log pairing with SNMP traps.
- **ASN.1 / BER** — encoding heritage shared with LDAP, X.509,
  Kerberos.
- **ICMP** — ping for L3 reachability; SNMP for L4+ visibility.

## Real-world deployment

Major implementations — **Net-SNMP** (lineage: CMU-SNMP → UCD-SNMP →
Net-SNMP; Wes Hardaker as long-time maintainer; ships on every Linux
distro), **SNMP Research** (Jeffrey Case's company, the commercial
high-end agent vendor), **AdventNet WebNMS** (legacy), **Cisco IOS
SNMP**, **Juniper Junos SNMP**, **Arista EOS SNMP**, **MikroTik
RouterOS SNMP**, **Ubiquiti UniFi SNMP**. NMS platforms:
**PRTG** (Paessler, ~300K+ deployments), **LibreNMS** (open-source
fork of Observium), **Zabbix**, **Datadog Network Performance
Monitoring**, **Cacti** (legacy), **Nagios** / **Icinga**,
**SolarWinds Orion** (the famous one), **OpenNMS**, **Observium**,
**ManageEngine OpManager**, **Auvik**. Scale: every Cisco/Juniper/
Arista box on Earth — measured in the billions of installed devices;
every APC/Eaton/CyberPower UPS and PDU; every networked printer
(HP/Brother/Xerox); every Dell iDRAC, HPE iLO, Supermicro BMC.
The entire MSP industry runs on it. **Minimum 5 named deployments
with metrics.**

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **CVE-2002-0012 / CVE-2002-0013 PROTOS cluster** (Feb 2002) — the
  University of Oulu PROTOS team published systematic ASN.1
  fuzzing results that broke nearly every SNMP implementation
  shipping in 2001; multi-vendor patch storm; the "wake-up call"
  for protocol fuzzing.
- **SNMP reflection / amplification DDoS** — 650× amplification
  factor making SNMP one of the worst amplifiers; the 2013–2014
  DDoS-amplifier era when SNMP, NTP, and DNS were the trio of
  shame; the BCP 38 ingress-filtering campaign.
- **`public` community string** — the decades-long "default
  password" that exposed hundreds of thousands of devices on
  Shodan / Censys.
- **CVE-2017-6736 / 6737 / 6738 Cisco IOS SNMP buffer overflow
  family** (Jun 2017) — Equation Group leak (Shadow Brokers)
  revealed nation-state-grade SNMP RCE exploits against IOS.
- **SolarWinds Orion supply-chain attack** (Dec 2020) — technically
  Orion product compromise, not SNMP itself, but propagated via
  the "monitoring platform with root credentials to everything"
  trust model that SNMP largely defines; the foundational lesson
  for monitoring-platform threat models.
- **CVE-2024-XXXX recent SNMPv3 USM key-derivation weaknesses** —
  cite specific KEV catalog entries.

## Fun facts and anecdotes

The "Simple" in SNMP being aspirational rather than accurate (a
former IETF chair quipped that "SNMP stands for Security's Not My
Problem"); the SNMPv2 fracture that nearly killed the protocol;
the OSI CMIP-vs-SNMP religious war of the early 1990s where IETF
"upstarts" beat the ITU establishment; `public` as the most-tried
default password on the Internet; the MIB-II ifTable's
lexicographic-walk design being responsible for every "SNMP walk
took twenty minutes" complaint; Net-SNMP's lineage from UCD-SNMP
(University of California, Davis) from CMU-SNMP (Carnegie Mellon);
Marshall Rose's RFC 1157 reportedly written in a marathon weekend;
Keith McCloghrie's nickname "Mr. SNMP" earned over 100+ MIB-defining
RFCs; the "RFC 1925 truths of networking" tradition's SNMP-mocking
lineage.

## Practical wisdom

What an engineer actually needs to know to use SNMP well — never
use SNMPv1 in 2026; always prefer SNMPv3 with authPriv + AES-128
(or AES-256 where supported); GetBulk max-repetitions tuning
(too low = many round trips, too high = MTU fragmentation);
polling-interval vs trap-based design (polling = guaranteed
visibility but high load; traps = low load but unreliable, design
for it); the **64-bit counter wrap problem** on 32-bit interface
counters at >10 Gbps (use HC counters from RFC 2233 ifXTable);
AgentX subagent gotchas (UNIX socket vs TCP); the "SNMP returns
lies" data-quality reality (vendor MIB inconsistencies are
legendary); MTU and EMSGSIZE on large ifTables (chunk via GetBulk
non-repeaters); reverse-DNS-via-SNMP-discovery patterns; SNMP-to-
Prometheus exporter bridging; the long deprecation of MD5 and DES
in v3. Include **at least 3 Wireshark/tcpdump capture filter
examples**.

## Pioneers and key contributors

- **Marshall Rose** — RFC 1157 author and the most prolific SNMP
  author overall; founder of Performance Systems International;
  the "voice of SNMP" through the 1990s; later POP3 / MIME / Beep
  work.
- **Jeffrey Case** — UTK and SNMP Research; original SGMP/SNMPv1
  co-author; long-running commercial SNMP authority.
- **Martin Schoffstall** — Rensselaer / PSI; SNMPv1 co-author.
- **James Davin** — MIT; SNMPv1 co-author; ASN.1 / SMI work.
- **Keith McCloghrie** — Cisco / IETF "Mr. SNMP" / MIB-II
  re-editor; the canonical interpreter of how to write a MIB
  module that doesn't suck.
- **Steve Waldbusser** — RMON inventor (RFC 1271 / 1757 / 2819);
  Net-SNMP early author.
- **Wes Hardaker** — Net-SNMP long-time maintainer; USM author /
  SNMPv3 implementer; later DNS / DNSSEC.
- **David Perkins** — the "MIB master"; co-author of
  *Understanding SNMP MIBs*.
- **Bert Wijnen** — SNMPv3 architect.
- **Russ Mundy** — SNMPv3 security work.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- Authoritative specifications — RFC 1157 (SNMPv1), 1901–1908
  (SNMPv2c), 3411–3418 (SNMPv3) — particularly 3414 USM, 3415
  VACM, 3416 PDU operations; RFC 6353 SNMP-over-TLS/DTLS; RFC
  7407 deprecation of SNMPv1/v2c authentication; SMIv2 family
  2578–2580; RFC 2863 ifTable; RFC 3877 RMON.
- Books — *SNMP, SNMPv2, SNMPv3, and RMON 1 and 2* (Stallings, 3rd
  ed); *Understanding SNMP MIBs* (Perkins/McGinnis); *Essential
  SNMP* (Mauro/Schmidt, O'Reilly 2nd ed); *Network Management
  Fundamentals* (Clemm, Cisco Press).
- Academic papers — the original PROTOS / Oulu fuzzing paper; the
  SNMPv3 design papers; gNMI vs SNMP comparison papers from
  Cisco Live and NANOG.
- Long-form engineering blog posts — Cloudflare on network
  observability, Cisco DevNet on gNMI/YANG migration, NANOG
  archives on SNMP scaling.
- YouTube videos — NANOG SNMP-vs-gNMI talks, Cisco Live SNMPv3
  deep-dives, Wes Hardaker IETF presentations on Net-SNMP.
- Podcasts — *Packet Pushers*, *Heavy Networking* episodes on
  network management; *Network Collective*.
- Free university courses — Stanford CS 144 networking; Stanford
  CS 244 advanced topics in networking touching on management.
- Hands-on tools — Net-SNMP (`snmpget`, `snmpwalk`, `snmpbulkwalk`,
  `snmptable`, `snmpd`), MIB Browser (iReasoning, free), Wireshark
  SNMP dissector, PRTG free tier, LibreNMS docker-compose lab,
  Cisco Modeling Labs / EVE-NG for hands-on SNMP-on-real-IOS.

## Where things are heading (2025–2026 frontier)

NETCONF/YANG and especially gNMI eating SNMP's lunch for new
deployments in hyperscale; **streaming telemetry** (model-driven
telemetry, MDT) replacing polling as the dominant data model;
Cisco's gNMI-by-default push in IOS XR / NX-OS; Juniper Junos MDT
defaults; OpenConfig YANG model unification across vendors; the
IETF OPSAREA "managing transition off SNMP" discussion (no
deprecation timeline, but operational guidance documents in
progress); RFC 6353 SNMP-over-TLS adoption (slow); SNMP nonetheless
remaining the **only** management protocol on every UPS, PDU,
printer, and consumer router for the foreseeable future. Headline
metrics to chase: % of new datacenter switches shipping with gNMI
enabled, SNMP-over-TLS adoption rate at major MSPs, the ratio of
poll-based to stream-based telemetry traffic on a typical Tier-1
backbone.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook
- A striking statistic that captures importance, with source
- A "pause and think" moment
- A failure-story arc (PROTOS 2002 or SNMP amplification DDoS work well)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: snmp
name: Simple Network Management Protocol
abbreviation: SNMP
categoryId: utilities-security  (or propose a new "operations/management" if appetite exists)
port: 161 (manager → agent), 162 (agent → manager traps)
year: 1988 (SNMPv1); 2002 (SNMPv3)
rfc: RFC 1157 (v1); RFC 1901–1908 (v2c); RFC 3411–3418 (v3)
standardsBody: ietf
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency, throughput, overhead }
connections: <udp, tcp, tls, dtls, asn1, syslog, ipfix>
links: { wikipedia, official (datatracker.ietf.org/wg/opsawg), spec }
image: <Wikimedia URL — SNMP manager/agent diagram or OID tree>
```

### A.2 Header / wire-format layout

Provide BOTH:
- SNMPv1/v2c message layout: SEQUENCE { version INTEGER, community
  OCTET STRING, PDU CHOICE { GetRequest, GetNextRequest, ...,
  Response, Trap, GetBulkRequest, InformRequest, SNMPv2-Trap,
  Report } } with varbind-list structure
- SNMPv3 message layout: msgVersion, msgID, msgMaxSize, msgFlags
  (auth/priv/reportable), msgSecurityModel, msgSecurityParameters
  (USM-specific encoding with authoritativeEngineID, engineBoots,
  engineTime, userName, authParameters, privParameters), scopedPDU
  (contextEngineID, contextName, PDU)

### A.3 State machine

SNMPv3 incoming-message processing state machine in mermaid
`stateDiagram-v2`: Received → Decoded → AuthChecked → PrivDecrypted
→ Dispatched → ResponseGenerated.

### A.4 Code example

- `python` — using `pysnmp` to do an SNMPv3 GetBulk walk of ifTable
- `javascript` — Node.js `net-snmp` library doing a v2c walk
- `cli` — `snmpget -v3 -l authPriv -u admin -a SHA -A authpass -x AES -X privpass router1 sysDescr.0`;
  `snmpwalk -v2c -c public switch1 ifTable`; `snmptrap`; `snmpbulkwalk`
- `wire` — sectioned dump: SNMPv2c GetBulk request, GetBulk response
  with varbinds, SNMPv2-Trap; plus an SNMPv3 authPriv get with
  encrypted scopedPDU

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. Cisco gNMI-by-default push, Juniper
Junos MDT defaults, Net-SNMP 5.9.4 release, RFC 6353 SNMP-over-TLS
slow adoption, OPSAWG SNMP-transition guidance drafts, KEV catalog
SNMP CVEs 2024–25.

### A.6 Real-world deployments

≥5 named: every Cisco/Juniper/Arista/MikroTik router on Earth, every
APC/Eaton UPS, every HP/Brother/Xerox printer, PRTG ~300K
deployments, LibreNMS install base, SolarWinds Orion legacy.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Marshall Rose with full bio, Jeffrey Case, Keith McCloghrie,
Wes Hardaker.

### A.12 RFC records ≥3

RFC 1157 (SNMPv1), RFC 1901–1908 (SNMPv2c), RFC 3411–3418 (SNMPv3)
— particularly 3414 USM, 3415 VACM, 3416 PDUs — plus RFC 6353
(SNMP-over-TLS/DTLS), RFC 7407 (auth deprecation), SMIv2 RFC
2578–2580.

### A.13 New glossary concepts

≥10 — manager/agent, MIB, OID, SMIv2, varbind, PDU types, community
string, USM, VACM, contextEngineID, engineBoots, engineTime, trap,
inform, RMON, MIB-II, ifTable, lexicographic walk.

### A.14 Frontier entry

"NETCONF/gNMI displacing SNMP for new datacenter deployments; SNMP
forever in long-tail edge devices" as a frontier entry with metrics
(streaming-telemetry vs SNMP-polling traffic ratios on Tier-1
backbones; vendor gNMI default-on rollouts).

### A.15 Journey suggestion

"How a NOC sees the network" — ICMP → SNMP → syslog → NetFlow/IPFIX
→ gNMI streaming telemetry, a journey through observability layers.

### A.16 Comparison pair

"SNMP vs NETCONF/YANG" (the classic poll-based vs model-driven
config) and "SNMP vs gNMI streaming telemetry" (poll vs subscribe).

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "1988: a stopgap until CMIP" (the SGMP→SNMP origin)
- Timeline: 1988 SNMPv1 → 1996 SNMPv2c fracture → 2002 SNMPv3 →
  2002 PROTOS → 2014 DDoS amplifier era → 2016 gNMI → 2026
  long-tail dominance
- Callout: "The SNMPv2 fracture that nearly killed the protocol"
- Image: Wikimedia of an early Cisco AGS router or a UPS rack
- Diagram: OID tree from `1.3.6.1.2.1` (mgmt) and `1.3.6.1.4.1`
  (enterprises)
- Pioneers: Rose + Case + McCloghrie + Hardaker mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (SolarWinds 2020 if present) +
new proposals. Strong candidates for new outage records:
- PROTOS 2002 ASN.1 cluster (Feb 2002) — protocol-design /
  software-bug
- SNMP amplification DDoS era (2013–2014) — protocol-design
- Cisco IOS SNMP Equation Group RCE family (CVE-2017-6736 et al.,
  Jun 2017) — software-bug / security
- SolarWinds Orion supply-chain attack (Dec 2020) — security
  (cross-reference existing outage)

### A.19 Embedded media

Highest-signal: Wes Hardaker IETF talks, NANOG SNMP-vs-gNMI panels,
the Net-SNMP project page, a Wireshark capture playground for
SNMPv1/v2c/v3.

### A.20 Prerequisites

```
concepts: [udp, port, asn1, encoding, polling, observability, hierarchy]
protocols: [udp, ip]
```

### A.21 Name highlight

```
"[S]imple [N]etwork [M]anagement [P]rotocol"  (SNMP)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for an SNMPv2c GetBulk walk of `ifTable`.
10–14 step annotations; explain *what* each PDU is and *why* the
reader is seeing it (e.g., "GetBulk asks for non-repeaters [scalars]
plus max-repetitions copies of the repeating columns — the manager
walks the table by passing each response's last OID back as the
next request's starting point").

### A.23 Category placement

Recommended: place under **`utilities-security`** (existing). SNMP
is the canonical "operations / network management" protocol and
doesn't fit cleanly into the proposed "identity" or "wireless-pan"
new categories. If a future "operations / observability" category
is created (alongside syslog, IPFIX, NetFlow, NETCONF, gNMI, OTel-
transport), it would belong there:

```
id: operations
name: Operations & Observability
color: <suggest a hex; a slate or steel distinct from existing>
glowColor: <complementary>
description: Protocols for network management, telemetry, logging, and observability.
icon: <lucide-react icon name, e.g., "activity" or "gauge">
```

---

# Appendix B — Simulator step list

Author a simulation of an **SNMPv2c GetBulk walk of `ifTable`** — the
canonical "discover all interfaces and their counters" flow. Provide
6–10 steps in the shape:

```
title: "SNMPv2c GetBulk walk of ifTable"
description: "Watch a manager poll a switch for interface descriptions and counters using GetBulkRequest."
actors:
  - { id: "nms", label: "NMS (Manager)", icon: "monitor", position: "left" }
  - { id: "agent", label: "Agent (Switch)", icon: "switch", position: "right" }
userInputs:
  - { id: "community", label: "Community string", type: "text", defaultValue: "public" }
  - { id: "maxRep", label: "Max-repetitions", type: "number", defaultValue: "10" }
steps:
  - id: getbulk1
    label: "GetBulkRequest start"
    description: "Manager asks for ifDescr.0 onward with non-repeaters=0, max-repetitions=10."
    fromActor: nms
    toActor: agent
    duration: 1000
    highlight: [community, request-id, varbind-list]
    layers:
      - IP: { src: "10.0.0.5", dst: "10.0.0.10" }
      - UDP: { sport: 49152, dport: 161 }
      - SNMP: { version: "v2c", community: "public", pdu: "GetBulkRequest", request-id: 1, max-repetitions: 10 }
  - id: response1
    label: "GetResponse (10 entries)"
    description: "Agent walks ifDescr from ifIndex 1 through 10 lexicographically."
    fromActor: agent
    toActor: nms
    duration: 1200
    highlight: [varbind-list]
    layers:
      - UDP: { sport: 161, dport: 49152 }
      - SNMP: { pdu: "Response", varbinds: "[ifDescr.1, ifDescr.2, ..., ifDescr.10]" }
  - id: getbulk2
    label: "GetBulkRequest continue"
    description: "Manager uses last returned OID (ifDescr.10) as new starting point."
    ...
  - id: response2
    label: "GetResponse (end-of-MIB-view marker)"
    description: "Agent returns endOfMibView for OIDs past the last ifDescr row."
    ...
  - id: bulkcounters
    label: "GetBulkRequest for ifHCInOctets"
    description: "Manager pivots to high-capacity 64-bit counters in ifXTable."
    ...
  - id: trap
    label: "linkDown Trap"
    description: "Agent sends asynchronous SNMPv2-Trap on UDP/162 when ifIndex 3 goes down."
    fromActor: agent
    toActor: nms
    duration: 800
    highlight: [trap-oid, snmpTrapOID.0]
    layers:
      - UDP: { sport: 162, dport: 162 }
      - SNMP: { pdu: "SNMPv2-Trap", snmpTrapOID: "1.3.6.1.6.3.1.1.5.3" }
```

The layers should reflect: IP → UDP → SNMP. For a v3 variant,
add the USM security wrapper between SNMP and the inner scopedPDU.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
