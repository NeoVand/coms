===== PROTOCOL · CELLULAR · 4G LTE and 5G NR =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, 3GPP specs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is 5G" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the 3GPP founding (December 1998, the merger
  of ETSI / ARIB / ATIS / CCSA / TSDSI / TTA / TTC), the Release-cadence
  history, the WCDMA vs CDMA2000 fork that eventually re-merged, the
  Qualcomm CDMA story.
- Mechanics deep enough that someone could re-implement the user-plane
  protocol stack after reading: PHY (OFDMA + numerology), MAC (HARQ,
  scheduling), RLC (AM/UM/TM), PDCP (header compression + crypto),
  RRC (connection states), NAS (mobility + session management).
- The Core Network evolution: EPC (S1, X2, S5/S8, S11, SGi) → 5GC
  (N1, N2, N3, N4, Xn, N9, N6) — what each interface carries and why
  the names changed.
- Real failures and famous incidents — SS7 / Diameter signalling
  abuse, IMSI catchers (Stingrays), the various ASN.1 implementation
  bugs (CVE-2017-9417, CVE-2020-12352 IIRC), the Crown Castle and
  Verizon outages.
- 2024–2026 developments — 5G-Advanced (Release 18 frozen Dec 2024,
  Release 19 in progress, Release 20 study items), Open RAN deployments
  (Vodafone UK, Deutsche Telekom, AT&T), Starlink Direct-to-Cell with
  T-Mobile (live Jan 2025), AT&T + AST SpaceMobile, mobile-core moves
  to public cloud (DISH on AWS Wavelength, Rakuten Symphony).
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older sources
as suspect and verify them against the current state. Define every term you
use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or
DOI. Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL),
archive.org for older or dead links, and the relevant standards body (3GPP
portal, ITU, GSMA, O-RAN ALLIANCE).

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers 51 protocols across 7
categories. **Cellular is the largest wireless deployment on Earth** —
~9 billion subscriptions worldwide — and is currently absent from the
encyclopedia. Your report needs to help me write a single TS protocol
record covering 4G LTE + 5G NR as a bundled topic.

Categories already covered:

- **Network foundations** — Ethernet, ARP, IPv4, IPv6, BGP, ICMP, OSPF
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0, IPsec, NAT-traversal
- **Wireless** — Wi-Fi (802.11), Bluetooth (Classic + BLE) — *Cellular joins here*

# Topic

The topic is **Cellular networking — 4G LTE + 5G NR as a bundled protocol**.
The encyclopedia bundles related protocols when they share a standards body
and a coherent technical story (Bluetooth Classic + BLE; STUN + TURN + ICE;
SPF + DKIM + DMARC). 4G LTE and 5G NR share 3GPP, share most of the user-
plane stack design philosophy, share the IPv6 mandate, share the IPsec-on-
backhaul mandate, and are in practice interoperable on real networks
(5G NSA *uses* 4G LTE as the anchor).

Note: this is the encyclopedia, not a 3GPP textbook. I want **engineering**
detail (what's on the wire, what the protocol numbers mean, why the state
machine has the states it has) more than spectrum-and-licensing detail.
Scope the report to teach a competent backend engineer how to think about
the cellular network as a stack of protocols.

Related protocols already in the encyclopedia that should be cross-linked:

  - IPv4 / IPv6 (user-plane carries IP)
  - TCP / UDP (transport over the cellular link)
  - IPsec (mandatory on every S1/X2/N2/N3 interface)
  - QUIC (5G performance vs TCP on lossy links — frontier topic)
  - HTTP/2 + HTTP/3 (5GC service-based architecture uses HTTP/2 between
    NFs)
  - DNS (5G's DNS-over-HTTPS for the UE)
  - TLS (5GC interfaces are TLS-protected)
  - SIP (VoLTE / VoNR signalling)
  - RTP (VoLTE voice payload)
  - WebRTC (cellular-Wi-Fi calling handoff)
  - Wi-Fi (Wi-Fi calling, Hotspot 2.0, Passpoint)
  - Bluetooth (LTE-U / LAA 5 GHz coexistence)

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced (UE, eNB / gNB,
      EPC / 5GC, MME / AMF, SGW / UPF, PGW / SMF, HSS / UDM, PCRF / PCF,
      IMSI / SUPI / SUCI, GUTI / 5G-GUTI, TAU / Registration, APN / DNN,
      RRC_IDLE / CONNECTED / INACTIVE, RNTI, HARQ, OFDMA, numerology,
      slicing, MIMO/mMIMO, FR1/FR2, mmWave, NSA/SA, EN-DC/NR-DC).
- [ ] **≥4** dated entries on the history timeline (1G TACS/AMPS,
      GSM 1991, UMTS 2001, LTE Release 8 2008, 5G NR Release 15 2018,
      5G-Advanced Release 18 2024, 6G study 2026).
- [ ] **Full radio stack** with bit widths where relevant — PHY (OFDMA
      subcarrier 15/30/60/120 kHz spacing per numerology), MAC (HARQ
      8-bit process ID, scheduling grants), RLC (10/16-bit SN), PDCP
      (12/18-bit SN + AES-CTR / SNOW3G crypto), RRC (state machine),
      NAS (mobility management).
- [ ] **A 5GC service-based architecture diagram** (mermaid) — UE,
      gNB, AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF — and
      what each interface (N1, N2, N3, N4, N5, N6, N7, N8, N11, N15)
      carries.
- [ ] **A registration + PDU session establishment** sequence diagram
      (mermaid `sequenceDiagram`) showing UE ↔ gNB ↔ AMF ↔ SMF ↔ UPF.
- [ ] **≥5** named real-world deployments with org names, scale, and
      dates (T-Mobile USA 5G-SA, Verizon C-band rollout, AT&T + AST
      SpaceMobile, DISH cloud-native 5G core, Vodafone UK Open RAN,
      Reliance Jio 5G-SA, Rakuten Symphony, China Mobile, DT, Orange).
- [ ] **≥3** pioneer / key-contributor candidates with full bios.
      Strong candidates: Andrew Viterbi (CDMA / Qualcomm co-founder),
      Irwin Jacobs (Qualcomm co-founder), Marty Cooper (DynaTAC inventor,
      "father of the cell phone"), Phil Karn (CDMA / IPsec — already
      in encyclopedia for IPsec), Erik Dahlman (Ericsson LTE/NR
      architect), Stefania Sesia / Issam Toufik (LTE/NR canonical
      textbook authors), Takehiro Nakamura (NTT DOCOMO 5G architect).
- [ ] **≥5** key 3GPP specs with version / release / notable sections.
      TS 36.300 (LTE overall), TS 38.300 (NR overall), TS 24.501 (5G
      NAS), TS 23.501 (5GS architecture), TS 33.501 (5G security),
      TS 38.331 (NR RRC), TS 38.401 (NG-RAN architecture).
- [ ] **≥3** named failure incidents — SS7 signalling fraud, Diameter
      abuse, IMSI catcher (Stingray) revelations, T-Mobile 911 outage
      June 2020, FAA / Verizon C-band altimeter saga 2022, Crowdstrike-
      adjacent mobile operator issues 2024, Optus AU 14-hour outage
      Nov 2023.
- [ ] **≥3** fun facts / anecdotes with sources (Marty Cooper's
      April-3-1973 first cellular call to Bell Labs from a Manhattan
      sidewalk; the IMSI's MCC=234 means UK; the original IS-95 CDMA
      Qualcomm vs GSM World wars; the Edholm's Law "wireless
      catches wired every 5 years" curve).
- [ ] **≥3** practical pitfalls — IPv6 deployment on cellular (PDP
      context types, 464XLAT), VoLTE codec mismatch, ICMP filtering
      on cellular blocking PMTUD, eSIM provisioning failures, NSA
      vs SA mode misconfiguration, the carrier-grade NAT pain.
- [ ] **≥3** Wireshark / debug-tool hints (Wireshark's GTP / S1AP /
      NGAP / RRC / NAS dissectors, srsRAN / Open5GS / free5GC for
      local labs, AirScout / QXDM for OEM tooling).
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Release 18 freeze Dec 2024; Starlink Direct-to-Cell live Jan
      2025; Rel-19 work items; AST SpaceMobile commercial agreement
      AT&T 2024; Open RAN at Vodafone UK 2024; T-Mobile + SpaceX
      satellite-to-cell beta).
- [ ] **≥1** 2025–2026 frontier development (6G study items, AI/ML
      in air interface, Reconfigurable Intelligent Surfaces, NTN
      direct-to-handset, terahertz / sub-THz spectrum).
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
      (see end of template; matches the Protocol TypeScript interface).
- [ ] **Appendix B** — Simulator step list. A 6–10 step animation of
      the **5G initial registration + first PDU session** flow
      (RRC Setup → Registration Request → AKA authentication →
      Security Mode → Registration Accept → PDU Session Establishment
      Request → SMF + UPF setup → user-plane up).
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications.

# How to structure the report

Use the v2 template's standard section structure (Prerequisites and
glossary → History and story → How it actually works → Deep connections
to other protocols → Real-world deployment → Failure modes and famous
incidents → Fun facts and anecdotes → Practical wisdom → Pioneers and
key contributors → Learning resources current as of 2026 → Where things
are heading 2025–2026 frontier → Hooks for article/infographic/podcast →
Appendix A → Appendix B → Citations).

Key scope-defining decisions for *this* protocol:

1. **Bundle 4G LTE and 5G NR as one encyclopedia node.** Cover the
   evolution and the differences, but don't try to make this two
   separate reports. The Bluetooth precedent (BR/EDR + BLE in one
   node) is the model.

2. **Engineering depth over policy.** The reader is a backend engineer,
   not an FCC commissioner. Spend pages on the protocol stack and the
   state machines, not on spectrum auctions and lobbying.

3. **5G NR Standalone (SA) is the canonical 5G.** Non-Standalone (NSA)
   exists but is a transitional architecture. Explain NSA, then build
   the rest of the report around SA + the 5GC service-based architecture.

4. **Include VoLTE / VoNR.** Voice over cellular is its own protocol
   sub-stack (SIP / RTP over IMS over LTE/NR) and is invisible to most
   IP engineers — explain it.

5. **The IPsec footprint is huge.** Every S1, every X2, every N2/N3 is
   IPsec-mandated by 3GPP TS 33.401 (LTE) and TS 33.501 (5G). Make this
   explicit and cross-link to the [[ipsec|IPsec]] page.

6. **6G is a future-section topic only.** Mention Release 20 study
   items and the ITU IMT-2030 framework, but the protocol is still
   science fiction in 2026.

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations.

==========
