===== PROTOCOL · PTP · Precision Time Protocol (IEEE 1588) =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, specs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is PTP" content
already exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — John Eidson's pioneering work at Agilent and HP
  Labs, the 2002 launch of IEEE 1588-2002, the massive 2008 revision
  (1588-2008, still the dominant deployed version in many industries),
  the 2019 revision (1588-2019, with security and unicast improvements),
  the 2024 revision in publication, the SMPTE 2059 broadcast profile
  story (2015), the ITU-T G.8275.1/.2 5G telecom profiles, the IEEE
  802.1AS-2020 gPTP for Time-Sensitive Networking (automotive / pro
  audio / industrial), the White Rabbit project at CERN reaching
  sub-nanosecond, and the Meta Time Card / Open Compute Project arc
  that put hardware PTP grandmasters into datacenters at scale.
- Mechanics deep enough that someone could implement a minimal PTP
  ordinary clock after reading: Sync / Follow_Up / Delay_Req / Delay_Resp
  message exchange, the master/slave (now "leader/follower" in
  modernized vocabulary) state machine, the Best Master Clock Algorithm
  (BMCA), one-step vs two-step clocks, transparent clocks and boundary
  clocks, hardware timestamping, the offset and delay computation,
  Peer Delay (P2P) vs End-to-End (E2E) mechanism, multicast vs unicast
  modes, profiles (default, power, telecom, automotive, broadcast).
- Real failures and famous incidents — the GPS spoofing attacks
  affecting PTP grandmasters in 2016–2024 (the GPS Week Number
  Rollover, the conflict-zone jamming events), the Itai Dabran et al.
  2017+ PTP-vulnerabilities papers, the 2024 ESnet PTP-related sync
  incidents, the long history of "stratum-1 holdover failed during
  outage" stories in HFT and broadcast.
- Connections to adjacent protocols — NTP (the OBVIOUS comparison;
  PTP achieves sub-microsecond on hardware-timestamped paths vs NTP's
  millisecond-range), Ethernet (PTP runs natively L2 in many profiles),
  UDP / IPv4 / IPv6 (alternative transports), the various TSN
  protocols (802.1AS gPTP, FRER, CBS, TAS), and NTS-PTP drafts for
  authentication.
- 2024–2026 developments — IEEE 1588-2024 in publication, AWS Time
  Sync Service moving to PTP under the hood with sub-100µs accuracy
  (2023–2024), Meta's Time Card v3 (2024), Open Compute Project Time
  Card adoption, the post-quantum PTP authentication TLV drafts, the
  TSN-in-cars rollout (Mercedes, BMW, Audi adopting gPTP for sensor
  fusion), the SMPTE 2110 broadcast plant rollouts continuing,
  ongoing 5G base-station deployment using G.8275.1/.2.
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
body (IEEE-SA, ITU-T, SMPTE, 3GPP, IETF NTP/TSN WGs). Past passes have
left 121 `[needs source]` markers across 46 reports — please try harder
this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how PTP relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, **NTP**, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, **PTP** (this report).

# Topic

The topic of this research is **PTP — Precision Time Protocol**
(IEEE 1588) — the network time-synchronization protocol that achieves
sub-microsecond accuracy on hardware-timestamped Ethernet, three to
six orders of magnitude better than NTP on the open internet. PTP is
the silent backbone of 5G base stations, broadcast TV plants, high-
frequency trading floors, and modern datacenter infrastructure.

Please structure the report so the **core mechanism** (Sync /
Follow_Up / Delay_Req / Delay_Resp + BMCA) is told once, then the
major **profiles** (default, telecom G.8275.x, broadcast SMPTE 2059,
automotive 802.1AS, power C37.238) each get a paragraph explaining
how they deviate from the default profile.

History anchors to verify:
- **John Eidson** (Agilent / HP Labs) the principal architect — drove
  the original concept
- **IEEE 1588-2002** — first published, narrow industrial focus
- **IEEE 1588-2008** ("v2") — massive revision, still the most widely
  deployed version as of 2026
- **IEEE 1588-2019** — current published standard; security TLVs,
  unicast improvements, hybrid masters
- **IEEE 1588-2024** — in publication / just published 2024
- **IEEE 802.1AS-2020** — gPTP for TSN (automotive, pro audio, industrial)
- **SMPTE ST 2059-1/2** — broadcast profile (2015)
- **ITU-T G.8275.1 / G.8275.2** — telecom full / partial timing support
  (2014 onward; central to 5G)
- **IEC 61588** — industrial profile
- **AES67** — professional audio profile
- **White Rabbit** at CERN — sub-nanosecond Ethernet extension (2010 onward)
- **Meta Time Card** / **OCP Time Card** — open-source PTP grandmaster
  hardware (2020 onward)
- **AWS Time Sync Service** — using PTP under the hood with sub-100µs
  accuracy claim (2023–2024)

Related protocols and standards likely connected to PTP that you
should verify and expand on:

  - **NTP** — explicit comparison; PTP for the hardware-timestamped
    LAN, NTP for the open internet
  - **Ethernet** — PTP runs natively L2 in many profiles (Ethertype
    0x88F7)
  - **UDP** — IP-transported variants use UDP ports 319 (event) / 320
    (general)
  - **IP / IPv6** — alternative L3 transport mode
  - **TLS** — comparison for NTS-KE-style auth in time protocols
  - **DNSSEC** — different but referenced for "synchronized
    infrastructure" trust chains
  - **TSN** (802.1Q + 802.1AS + 802.1Qbv + 802.1Qci) — PTP is the
    timing substrate
  - **gRPC / NTP-style RPC** — out-of-band management interfaces
    (`ptp4l` admin)

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., grandmaster, ordinary clock, boundary clock, transparent
  clock, BMCA, Sync, Follow_Up, Delay_Req, Delay_Resp, Pdelay_Req,
  Pdelay_Resp, one-step vs two-step, E2E vs P2P, hardware timestamping,
  PHC (PTP Hardware Clock), syntonization vs synchronization, offset
  from master, mean path delay, holdover, stratum, grandmaster
  capability, priority1/priority2, clock class, clock accuracy,
  offsetScaledLogVariance, announce interval, sync interval,
  delay-request interval, telecom profile, broadcast profile, gPTP,
  domain number)
- [ ] **≥4** dated entries on the history timeline (2002 → 2026)
- [ ] Full PTP message header format with bit widths AND Sync /
      Delay_Resp message body layouts with bit widths
- [ ] State machine (mermaid `stateDiagram-v2`) — PTP port state
      machine (INITIALIZING → LISTENING → MASTER / SLAVE / PASSIVE /
      UNCALIBRATED / FAULTY / DISABLED) per IEEE 1588-2019 Fig. 27
- [ ] A sequence diagram of the full Sync / Follow_Up / Delay_Req /
      Delay_Resp four-message exchange with timestamps T1/T2/T3/T4
      (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale
      numbers, and dates (5G base stations under G.8275.x — every
      mobile operator; NASDAQ + ICE + CME high-frequency trading;
      Meta / Google / AWS datacenters; SMPTE 2110 broadcast plants
      at NBC / BBC / Sky; CERN White Rabbit; AWS Time Sync Service
      sub-100µs)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (John Eidson, Doug Arnold, Kang Lee, George Zampetti, Greg
      Dowd, Michael Spelina, Dieter Sibold)
- [ ] **≥3** standards with version, year, status, and notable-section
      pointers (IEEE 1588-2008, 1588-2019, 1588-2024, 802.1AS-2020,
      ITU-T G.8275.1, SMPTE ST 2059-2)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (GPS Week Number Rollover events affecting PTP
      grandmasters 2016 / 2019, GPS jamming around conflict zones
      2020–2025, the 2024 ESnet PTP-related incident, the PTP
      vulnerability papers from Dabran et al.)
- [ ] **≥3** fun facts / anecdotes with sources (John Eidson's IEEE
      Technical Field Award 2005, the White Rabbit name origin at
      CERN, the Meta Time Card open-source story, the SMPTE 2110
      broadcast-IP transition story, the "AWS just rolled out PTP
      and everyone's clocks got better" 2023–24 beat)
- [ ] **≥3** practical pitfalls with concrete tuning advice (BMCA
      misconfig, transparent clock vs boundary clock choice, hardware
      timestamping vs software timestamping accuracy gap, multicast
      vs unicast on routed networks, asymmetric path delay causing
      offset bias, GPS antenna placement for grandmasters, holdover
      oscillator selection — TCXO vs OCXO vs Rb)
- [ ] **≥3** Wireshark / capture-tool filter examples (`ptp`,
      `eth.type == 0x88f7`, `ptp.v2.messagetype`, `udp.port == 319`,
      `ptp.v2.clockidentity`)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (IEEE 1588-2024 publication, AWS Time Sync sub-100µs rollout,
      Meta Time Card v3 release, OCP Time Card adoption, the
      ongoing 5G G.8275.1 rollout numbers, automotive gPTP wins)
- [ ] **≥1** 2025–2026 frontier development (PTP-over-QUIC research,
      post-quantum PTP authentication TLVs, the NTS-PTP draft, the
      AWS / Meta open-source grandmaster hardware ecosystem, gPTP
      in production cars)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (full PTP four-message
      Sync exchange)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* PTP makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: clock (oscillator), oscillator drift,
stability, accuracy vs precision, holdover, GPS / GNSS as a time
source, UTC, TAI, leap seconds, timestamping (software vs hardware),
PHC (Linux PTP Hardware Clock), NTP comparison, multicast, Ethernet
EtherType, UDP, IP, profile, domain, ordinary clock, boundary clock,
transparent clock, grandmaster, BMCA, syntonization (frequency only)
vs synchronization (phase + frequency), one-step vs two-step clock,
E2E vs P2P delay mechanism, the four PTP timestamps T1/T2/T3/T4,
offset, mean path delay, announce interval, sync interval,
clockClass, clockAccuracy, offsetScaledLogVariance, priority1,
priority2.

## History and story

The chronological narrative — John Eidson at Agilent in the late
1990s seeing the industrial-automation problem (factory floors
needed microsecond timing across copper Ethernet that NTP couldn't
deliver), the IEEE 1588-2002 launch as a narrow industrial standard,
the massive 2008 revision that opened the door to broader adoption
(transparent clocks, multiple profiles), Eidson's IEEE Technical
Field Award in 2005, the Doug Arnold / Meinberg / Microsemi era
when telecom carriers got serious about packet-based time for
LTE / 5G frequency sync (ITU-T G.8275.1 in 2014 → G.8275.2 in 2016),
the parallel broadcast industry's adoption via SMPTE 2059 (2015) to
replace expensive coax-based black-and-burst with IP video plants
(SMPTE 2110), the automotive industry's adoption of gPTP (IEEE
802.1AS-2020) for sensor fusion in autonomous-driving stacks, the
CERN White Rabbit project pushing sub-nanosecond, the 2019 revision
adding security TLVs, the 2024 revision in publication, and the
**2023–2024 inflection** when AWS announced Time Sync Service moving
to PTP-under-the-hood with a sub-100µs accuracy guarantee — bringing
hardware-timestamped time sync to the average EC2 customer for the
first time. Meta's Time Card and the Open Compute Project's adoption
of open-source PTP grandmaster hardware (2020 → 2024) is the
companion datacenter story.

Version-history table with what changed in each release.

## How it actually works

Cover the full mechanics.

### Message types and the four-timestamp exchange

PTP uses these message types (IEEE 1588-2019 §13):
- **Sync** (event message, hardware-timestamped on egress as **T1**
  on master, on ingress as **T2** on slave)
- **Follow_Up** (general message, carries T1 in two-step mode)
- **Delay_Req** (event message, slave sends, captures **T3** on
  egress and **T4** on master ingress)
- **Delay_Resp** (general message, master returns T4 to slave)
- **Pdelay_Req / Pdelay_Resp / Pdelay_Resp_Follow_Up** for P2P mode
- **Announce** (BMCA — leader-election)
- **Signaling** (unicast negotiation, profile-specific)
- **Management** (out-of-band)

The slave computes:
- `offset = ((T2 - T1) - (T4 - T3)) / 2`
- `meanPathDelay = ((T2 - T1) + (T4 - T3)) / 2`

This assumes **symmetric path delay** — asymmetry biases offset.

### One-step vs two-step clocks

- **One-step**: hardware timestamps the Sync message and writes T1
  into the egressing packet itself (requires hardware support)
- **Two-step**: software timestamps T1, then sends Follow_Up
  containing T1 separately (cheaper hardware, more messages)

### Boundary clocks and transparent clocks

- **Boundary Clock (BC)**: terminates PTP on each port, runs BMCA on
  each port; one slave port, multiple master ports
- **Transparent Clock (TC)**: forwards PTP messages and adds a
  **correctionField** equal to the residence time of the message in
  the switch — this removes the queuing-delay component from the
  slave's offset estimate
- TCs are why hardware-PTP-aware switches matter so much in practice

### Best Master Clock Algorithm (BMCA)

A deterministic comparison ordering (priority1 → clockClass →
clockAccuracy → offsetScaledLogVariance → priority2 → clockIdentity)
that elects the grandmaster across all clocks announcing in a domain.

### Profiles

- **Default profile** (IEEE 1588 itself, multicast, E2E)
- **Telecom G.8275.1** — frequency + phase, full timing support
  (hop-by-hop boundary clocks), used in 5G fronthaul
- **Telecom G.8275.2** — partial timing support (some hops not
  PTP-aware, unicast)
- **Broadcast SMPTE 2059** — for IP video plants, AES67 audio
- **gPTP 802.1AS** — TSN profile (one-step, P2P, single domain)
- **Power C37.238** — substation timing
- **AES67** — pro audio

### Transports

- **Ethernet L2** — EtherType 0x88F7 (most accurate, used by most
  profiles)
- **UDP/IPv4** — multicast 224.0.1.129 (default) on ports 319 (event)
  / 320 (general)
- **UDP/IPv6** — multicast FF0X::181
- **Unicast** — telecom profiles

### Security

- **IEEE 1588-2019 Annex P** added authentication TLVs (currently
  underspecified for production; NTS-PTP drafts in flight at IETF)

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of the four-message Sync exchange with T1/T2/T3/T4
2. State diagram of the PTP port state machine
3. PTP common header bit layout + Sync message body layout (table form)

## Deep connections to other protocols

Cover each related protocol in the topic list. Pay particular
attention to:
- **NTP** — the obvious comparison. NTP achieves ~1–10 ms accuracy
  over the open internet (software timestamps, server-side queuing,
  asymmetric paths). PTP achieves sub-microsecond on
  hardware-timestamped LANs and sub-100 nanoseconds in optimized
  datacenter / TSN deployments. NTP for the internet, PTP for the
  LAN — but the line is blurring with AWS Time Sync. NTS (RFC 8915)
  is NTP's modern authenticated form; NTS-PTP drafts are the PTP
  equivalent.
- **Ethernet** — PTP commonly runs L2 directly with EtherType 0x88F7
  for accuracy reasons (no IP header processing variance).
- **UDP / IPv4 / IPv6** — alternative L3 transport modes.
  Multicast addressing: 224.0.1.129 (v4), FF0X::181 (v6).
- **TLS / NTS** — comparison for authentication of time protocols;
  NTS-PTP is the analog of NTS-NTP.
- **TSN protocols** (802.1AS gPTP, FRER, CBS, TAS) — PTP is the
  timing substrate that makes all of these work.
- **5G / 3GPP** — 5G base stations require sub-1.5µs phase accuracy
  for TDD; G.8275.x profiles deliver this.
- **gRPC / SNMP** — out-of-band management interfaces.

## Real-world deployment

Major implementations — **`ptp4l`** (the linuxptp project's PTP daemon,
the de facto Linux reference), **`phc2sys`** (synchronizes the
system clock to PHC), **Meinberg LANTIME** (commercial grandmasters
+ software), **Microchip / Microsemi SyncServer**, **Spectracom /
Orolia**, **EndRun Technologies**, **Symmetricom (now Microsemi)**,
**OpenAVB** (automotive AVB / gPTP), **Apple's PTP support** in macOS
for AES67, **AWS Time Sync Service** (PTP under the hood from
late-2023). Named deployments: every 5G base station on Earth (3GPP
mandate via G.8275.x), every NYSE / NASDAQ / ICE / CME trading
floor (the MiFID II 2018 mandate forced sub-microsecond timestamping
in EU equities trading), the SMPTE 2110 IP video plants at NBC, BBC,
Sky, Disney+, every CERN experiment's data-acquisition system (White
Rabbit), the Meta / Google / AWS datacenters using Time Cards,
automotive OEMs (Mercedes, BMW, Audi) shipping gPTP in production
cars from 2022 onward.

## Failure modes and famous incidents

Named incidents:
- **GPS Week Number Rollover** (2019, repeats every 19.7 years) —
  many PTP grandmasters that used GPS as primary reference clock
  rolled their week-number field, causing time-jumps in stratum-1
  outputs; multiple HFT firms and broadcast plants saw incidents
- **GPS jamming in conflict zones** (2020–2025) — Eastern Europe,
  Middle East, North Korea border — PTP grandmasters near affected
  airspace lost sync; broadcast plants had to switch to holdover
- **Itai Dabran et al. PTP-vulnerabilities paper** (2017+) — showed
  unauthenticated PTP could be spoofed to inject offset; motivated
  the IEEE 1588-2019 Annex P security TLVs
- **2024 ESnet PTP-related sync incidents** — research-network
  timing failures cascaded into experiment data-quality issues
- **Asymmetric-path-delay biases** — the eternal practical pitfall;
  countless production outages where a route change introduced
  asymmetry and clocks drifted apart by tens of microseconds
- **Holdover oscillator failures** during long GPS outages —
  stratum-1 TCXO holdovers drift faster than OCXO / Rb / Cs

Each told as setup → mistake → consequence → resolution.

## Fun facts and anecdotes

John Eidson winning the IEEE Technical Field Award in 2005 for
1588 — only the second time a network-protocol-author had won
[verify], the "White Rabbit" name origin (the project's mascot is
Lewis Carroll's *Alice in Wonderland* white rabbit, who is
obsessed with time), the Meta Time Card story (open-sourced
hardware grandmaster designed by Meta engineers, then adopted by
OCP and shipped by Wiwynn, Edgecore, and others), the SMPTE
2110-3 audio-essence story (PTP-locked audio over IP letting
broadcasters tear out coax), the AWS 2023 announcement of Time
Sync Service "going PTP" that quietly delivered sub-100µs to
every EC2 instance with a single API call, the MiFID II
unintended-consequence: EU equity-trading regulation forced
sub-100µs timestamping that drove demand for affordable PTP
grandmasters across the industry.

## Practical wisdom

What an engineer actually needs to know to use PTP well:
- **Hardware timestamping** — non-negotiable for sub-microsecond
  accuracy; check `ethtool -T <iface>` for `SOF_TIMESTAMPING_TX_HARDWARE`
  / `_RX_HARDWARE` support
- **`ptp4l` config**: pick the right profile (`-f /etc/linuxptp/default.cfg`,
  `gPTP.cfg`, `G.8275.1.cfg`), set the right `clockClass` and
  `priority1` on the grandmaster
- **Transport choice**: L2 (`network_transport L2`) for highest
  accuracy; UDPv4 / UDPv6 if you need to cross routers (with
  boundary clocks at each hop)
- **PHC sync to system clock**: `phc2sys -s eth0 -w` to slew the
  kernel clock toward the PHC
- **Boundary vs transparent**: boundary clocks at L3 hops, transparent
  clocks at L2 hops for best accuracy
- **Holdover oscillator**: TCXO (~1 µs/sec drift) for low-cost
  endpoints, OCXO (~0.1 µs/sec) for boundary clocks, Rb (~1 ns/sec) for
  stratum-1 holdover, Cs for ultra-critical
- **GPS antenna**: sky view matters; multi-path indoors will kill
  accuracy; consider GNSS-multi-constellation receivers (GPS +
  Galileo + GLONASS + BeiDou) for resilience
- **Asymmetry**: measure with a portable PTP analyzer; routes
  through firewalls / SD-WAN often inject asymmetry
- **Monitoring**: log `master_offset`, `s2` (Servo state), `freq`
  (frequency adjustment) from `ptp4l` continuously; alarm on offset
  > threshold

## Pioneers and key contributors

- **John Eidson** — the father of PTP, Agilent / HP Labs, IEEE
  Technical Field Award (2005), author of *Measurement, Control, and
  Communication Using IEEE 1588* (Springer, 2006)
- **Kang Lee** — NIST, built the original PTP conformance test
  framework
- **Doug Arnold** — Meinberg, IEEE 1588 Working Group chair
- **Dieter Sibold** — NIST / PTB time labs
- **George Zampetti** — Microsemi / Microchip, frequency-sync expert,
  G.8275.x architect
- **Michael Spelina** — long-time PTP standards work
- **Greg Dowd** — Microchip, telecom-profile work
- **Maciej Lipinski / Javier Serrano** — CERN White Rabbit project leads

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- **Specifications** — IEEE 1588-2019 (the canonical reference;
  IEEE Xplore, paywalled); IEEE 1588-2024 (just published); IEEE
  802.1AS-2020 (gPTP); ITU-T G.8275.1 / G.8275.2 (telecom profiles,
  ITU-T website); SMPTE ST 2059-1/2 (broadcast); AES67 (pro audio);
  IETF draft-ietf-ntp-nts-for-ptp (NTS for PTP)
- **Books** — *Measurement, Control, and Communication Using IEEE
  1588* (Eidson, Springer, 2006); *Synchronization Networks: Theory
  and Practice* by Bregni (older but classic); the *Linux PTP*
  documentation
- **Engineering blog posts** — Meta Engineering posts on Time Card
  v1/v2/v3 (2020 → 2024), AWS blog on Time Sync Service moving to
  PTP (2023), Google's TrueTime / Spanner posts (adjacent),
  Cloudflare's roughtime / NTP posts, Meinberg whitepapers, Microchip
  / Microsemi whitepapers
- **Academic papers** — Eidson's seminal 1588 papers; Lipinski et
  al. on White Rabbit; the various PTP-security papers; Meta's
  open-time / Time Card papers (NSDI / SIGCOMM)
- **YouTube** — the Meinberg PTP training series, the IEEE 1588 WG
  recorded talks, conference talks on Meta Time Card, SMPTE 2110
  talks
- **Free courses** — Meinberg Academy modules, the NIST PTP
  reference page
- **Hands-on tools** — `ptp4l` + `phc2sys` (Linux PTP), the
  `pmc` management tool, Wireshark with PTP dissector, the Meinberg
  LANTIME web UI, Microchip SyncServer GUI, the Meta open-source
  Time Card emulator

## Where things are heading (2025–2026 frontier)

PTP-over-QUIC research (very early; the SCION crowd has prototypes),
post-quantum PTP authentication via NTS-PTP-style TLVs, the Meta
Time Card v3 (2024) and Open Compute Project Time Card adoption
spreading to most hyperscalers, the AWS Time Sync Service evolution
(sub-100µs SLA broadening), the ongoing TSN work in automotive
(gPTP in cars from 2022 → 2026 mass-market), the SMPTE 2110
broadcast IP-plant rollouts continuing to displace coax (~50% of
US major broadcasters by mid-2026 [verify]), and the open question
of whether GNSS-independent grandmaster designs (relying on optical
links to NIST / national labs) will become economical.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook (the "your trades, your video, your
  5G call all depend on PTP" angle)
- A striking statistic that captures importance, with source
- A "pause and think" moment (e.g., "PTP is three orders of magnitude
  more accurate than NTP — and AWS just gave it to every EC2 instance
  in 2023")
- A failure-story arc (the GPS Week Number Rollover affecting PTP
  grandmasters, or a real HFT outage from asymmetric routing)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: ptp
name: Precision Time Protocol
abbreviation: PTP
categoryId: utilities-security
port: 319 (event) / 320 (general) UDP; or Ethertype 0x88F7 (L2)
year: 2002 (IEEE 1588-2002); 2008 (1588-2008); 2019 (1588-2019); 2024 (1588-2024)
rfc: IEEE 1588-2019
standardsBody: ieee
oneLiner: <single sentence — elevator pitch about sub-microsecond sync>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items (5G base stations, HFT timestamping,
          broadcast IP video, datacenter clock sync, automotive sensor
          fusion, industrial automation, scientific experiments)
performance: { latency, throughput, overhead }
connections: [ntp, ethernet, udp, ipv4, ipv6, tls]
links: { wikipedia, official (ieee 1588), spec }
image: <Wikimedia URL of a PTP topology diagram or a grandmaster appliance>
```

### A.2 Header / wire-format layout

Provide:
- **PTP common header** (34 bytes per IEEE 1588-2019 §13.3) layout
  with bit widths: transportSpecific (4b) + messageType (4b) +
  reserved (4b) + versionPTP (4b) + messageLength (16b) + domainNumber
  (8b) + reserved (8b) + flagField (16b) + correctionField (64b) +
  reserved (32b) + sourcePortIdentity (80b) + sequenceId (16b) +
  controlField (8b) + logMessageInterval (8b)
- **Sync message body** layout (originTimestamp 80b: secondsField 48b
  + nanosecondsField 32b)
- **Delay_Resp message body** layout (receiveTimestamp 80b +
  requestingPortIdentity 80b)

### A.3 State machine

PTP port state machine in mermaid `stateDiagram-v2`:
INITIALIZING → LISTENING → MASTER / SLAVE / PASSIVE / UNCALIBRATED /
PRE_MASTER / FAULTY / DISABLED, with the BMCA-driven transitions.

### A.4 Code example

- `python` — using `ptpython` or `python-ptp` to send/receive PTP
  messages; or reading `/sys/class/ptp/ptp0/` Linux PHC values
- `javascript` — Node.js sending raw PTP packets via `raw-socket`
  (educational, not production)
- `cli` — `ptp4l -i eth0 -m`, `phc2sys -s eth0 -w`, `pmc -u -b 0
  'GET CURRENT_DATA_SET'`
- `wire` — sectioned dump: Announce, Sync, Follow_Up, Delay_Req,
  Delay_Resp

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. IEEE 1588-2024 publication, AWS Time
Sync sub-100µs rollout (Oct 2023), Meta Time Card v3 (2024), OCP
Time Card adoption, the ongoing 5G G.8275.1 rollout, the gPTP in
production cars wins.

### A.6 Real-world deployments

≥5 named: every 5G base station (G.8275.x mandate from 3GPP),
NASDAQ + ICE + CME HFT, Meta / Google / AWS datacenters (Time
Cards), SMPTE 2110 broadcast plants at NBC / BBC / Sky / Disney+,
CERN White Rabbit, AWS Time Sync Service (sub-100µs SLA, 2023+).

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark hints ≥3

```
- filter: "ptp"
  description: All PTP traffic (both L2 and UDP transports)
- filter: "eth.type == 0x88f7"
  description: PTP-over-Ethernet (L2)
- filter: "ptp.v2.messagetype == 0"
  description: PTP Sync messages only
- filter: "ptp.v2.messagetype == 1"
  description: PTP Delay_Req messages
- filter: "udp.port == 319 or udp.port == 320"
  description: PTP-over-UDP/IPv4
- filter: "ptp.v2.clockidentity == aa:bb:cc:ff:fe:dd:ee:ff"
  description: Messages from a specific grandmaster
```

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including John Eidson with full bio (Agilent / HP Labs; IEEE
Technical Field Award 2005; author of the 2006 Springer book).

### A.12 Standards records ≥3

IEEE 1588-2008 (still widely deployed), IEEE 1588-2019 (current),
IEEE 1588-2024 (just published), IEEE 802.1AS-2020 (gPTP), ITU-T
G.8275.1 (telecom full timing).

### A.13 New glossary concepts

≥12 — grandmaster, ordinary clock, boundary clock, transparent
clock, BMCA, Sync, Follow_Up, Delay_Req, Delay_Resp, one-step,
two-step, E2E, P2P, hardware timestamping, PHC, gPTP, telecom
profile, broadcast profile, holdover, syntonization, leap second,
TAI, UTC.

### A.14 Frontier entry

PTP-over-QUIC + NTS-PTP authentication + AWS Time Sync + Meta Time
Card open-source ecosystem as a combined frontier entry with metrics
and sources.

### A.15 Journey suggestion

"How time gets to your 5G call" — a 4–5 step journey covering GNSS
→ stratum-1 grandmaster → boundary clocks in the fronthaul → 5G
gNodeB → user equipment. Or alternatively "How NASDAQ timestamps
your order" with HFT focus.

### A.16 Comparison pair

"PTP vs NTP" is the obvious one. Also "PTP boundary vs transparent
clock" as a deployment comparison.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "Agilent, late 1990s — John Eidson and the factory floor"
- Timeline: 2002 → 2008 → 2014 (G.8275.1) → 2015 (SMPTE 2059) → 2019
  → 2020 (802.1AS) → 2023 (AWS) → 2024 (1588-2024)
- Callout: "Why MiFID II made PTP a regulatory requirement in EU
  equities"
- Image: Wikimedia of a Meinberg LANTIME or Meta Time Card
- Diagram: PTP four-message exchange with T1/T2/T3/T4 timestamps and
  the offset formula
- Pioneers section embedded: Eidson + Arnold + Lee mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (none likely apply directly) +
new proposals. Strong candidates for new outage records:
- GPS Week Number Rollover affecting PTP grandmasters (2019) —
  protocol-design / hardware
- GPS jamming in conflict zones disrupting broadcast PTP (2020–25) —
  hardware / security
- 2024 ESnet PTP-related sync incident — software-bug
- A representative HFT asymmetric-path-delay outage — configuration

### A.19 Embedded media

Highest-signal: the Meinberg PTP training series on YouTube, the
Meta engineering Time Card v3 demo video (2024), the AWS re:Invent
2023 Time Sync announcement, and an interactive playground (the
`ptp4l` Docker tutorial or the IEEE 1588 simulator if one is
publicly available).

### A.20 Prerequisites

```
concepts: [packet, frame, multicast, ethernet-frame, clock-skew, gnss]
protocols: [ntp, ethernet, udp, ipv4, ipv6]
```

### A.21 Name highlight

```
"[P]recision [T]ime [P]rotocol"  (PTP)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for the four-message Sync exchange with
T1/T2/T3/T4 and the offset / mean-path-delay computation. 10–14
step annotations; explain *what* each message is and *why* the
reader is seeing it (BMCA election via Announce, Sync from master,
Follow_Up carrying T1 in two-step mode, slave's Delay_Req,
Delay_Resp returning T4, offset and meanPathDelay computation,
servo adjustment of the slave clock, next round).

### A.23 Category placement

Place in **utilities-security** (alongside NTP, DNS, DHCP). PTP is
a service-tier infrastructure protocol like NTP — no need for a new
category. If the encyclopedia ever adds a dedicated "time and
synchronization" subcategory, PTP and NTP would anchor it together.

---

# Appendix B — Simulator step list

Author **one** simulation: the **full PTP four-message Sync exchange
between a Master (grandmaster) and a Slave (ordinary clock)** with
visible T1/T2/T3/T4 timestamps. This is the iconic PTP diagram and
makes the offset / mean-path-delay computation intuitive.

```
title: "PTP Sync Exchange — Master to Slave with T1/T2/T3/T4"
description: "Watch a PTP master synchronize a slave clock through
              the four-message Sync / Follow_Up / Delay_Req /
              Delay_Resp exchange, with visible nanosecond timestamps."
actors:
  - { id: "master", label: "Master (Grandmaster)", icon: "clock", position: "left" }
  - { id: "slave",  label: "Slave (Ordinary Clock)", icon: "device", position: "right" }
userInputs:
  - { id: "transport", label: "Transport", type: "select",
      options: ["L2 Ethernet (0x88F7)", "UDP/IPv4 multicast", "UDP/IPv6 multicast"],
      defaultValue: "L2 Ethernet (0x88F7)" }
  - { id: "twoStep", label: "Two-step mode", type: "boolean", defaultValue: "true" }
  - { id: "syncInterval", label: "Sync interval (logSyncInterval)", type: "number", defaultValue: "0" }
steps:
  - id: announce
    label: "Announce (BMCA)"
    description: "Master sends Announce messages advertising its grandmaster identity, clockClass, clockAccuracy, and priority. Slave runs BMCA and elects this master."
    fromActor: master
    toActor: slave
    duration: 1200
    highlight: [grandmasterIdentity, clockClass, priority1]
    layers:
      - Ethernet: { type: "0x88F7", dst: "01:1B:19:00:00:00" }
      - PTP Header: { messageType: "0xB Announce", versionPTP: 2, sequenceId: 100 }
      - PTP Announce: { grandmasterIdentity: "aa:bb:cc:ff:fe:dd:ee:ff", clockClass: 6, priority1: 128 }
  - id: sync
    label: "Sync — timestamp T1"
    description: "Master sends Sync. Hardware timestamps the egress moment as T1 = 100.000000123. In two-step mode the message itself carries no timestamp."
    fromActor: master
    toActor: slave
    duration: 1100
    highlight: [originTimestamp, T1]
    data: "T1 = 100.000000123 s"
    layers:
      - Ethernet: { type: "0x88F7" }
      - PTP Header: { messageType: "0x0 Sync", sequenceId: 200, flagField: "twoStepFlag=1" }
      - PTP Sync: { originTimestamp: "0 (two-step)" }
  - id: t2
    label: "Slave receives Sync — captures T2"
    description: "Slave's NIC hardware timestamps the ingress moment as T2 = 100.000150789. Slave stores T2 awaiting Follow_Up."
    fromActor: slave
    toActor: slave
    duration: 700
    highlight: [T2]
    data: "T2 = 100.000150789 s"
    layers:
      - Slave PHC: { event: "RX timestamp captured" }
  - id: followup
    label: "Follow_Up carries T1"
    description: "Master sends Follow_Up containing the precise T1 captured on Sync egress. Slave now knows T1 and T2."
    fromActor: master
    toActor: slave
    duration: 900
    highlight: [preciseOriginTimestamp, T1]
    data: "T1 = 100.000000123 s"
    layers:
      - PTP Header: { messageType: "0x8 Follow_Up", sequenceId: 200 }
      - PTP Follow_Up: { preciseOriginTimestamp: "100.000000123" }
  - id: delayreq
    label: "Delay_Req — timestamp T3"
    description: "Slave sends Delay_Req. Slave's NIC hardware timestamps the egress moment as T3 = 100.500000456."
    fromActor: slave
    toActor: master
    duration: 1100
    highlight: [T3]
    data: "T3 = 100.500000456 s"
    layers:
      - PTP Header: { messageType: "0x1 Delay_Req", sequenceId: 50 }
      - PTP Delay_Req: { originTimestamp: "100.500000456" }
  - id: t4
    label: "Master receives Delay_Req — captures T4"
    description: "Master's NIC hardware timestamps the ingress as T4 = 100.500150234."
    fromActor: master
    toActor: master
    duration: 700
    highlight: [T4]
    data: "T4 = 100.500150234 s"
    layers:
      - Master PHC: { event: "RX timestamp captured" }
  - id: delayresp
    label: "Delay_Resp returns T4"
    description: "Master sends Delay_Resp containing T4 and the requesting slave's port identity. Slave now has all four timestamps."
    fromActor: master
    toActor: slave
    duration: 900
    highlight: [receiveTimestamp, T4]
    data: "T4 = 100.500150234 s"
    layers:
      - PTP Header: { messageType: "0x9 Delay_Resp", sequenceId: 50 }
      - PTP Delay_Resp: { receiveTimestamp: "100.500150234", requestingPortIdentity: "<slave port>" }
  - id: compute
    label: "Slave computes offset and meanPathDelay"
    description: "Slave applies the canonical formulas: offset = ((T2-T1)-(T4-T3))/2; meanPathDelay = ((T2-T1)+(T4-T3))/2. Servo adjusts the slave clock."
    fromActor: slave
    toActor: slave
    duration: 1200
    highlight: [offset, meanPathDelay]
    data: "offset ≈ +150.278 µs, meanPathDelay ≈ +150.500 µs"
    layers:
      - Slave Servo: { adjust: "step or slew", newFreqOffset: "-150 ppb" }
  - id: nextsync
    label: "Next Sync round (steady state)"
    description: "Master will send the next Sync at logSyncInterval (default 1 second). Over many rounds the slave's PI servo locks frequency and phase to within tens of nanoseconds on hardware-timestamped paths."
    fromActor: master
    toActor: slave
    duration: 800
    highlight: [logSyncInterval]
    layers:
      - PTP Header: { messageType: "0x0 Sync", sequenceId: 201 }
```

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
