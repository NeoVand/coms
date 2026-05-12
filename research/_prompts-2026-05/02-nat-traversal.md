===== PROTOCOL · NAT-TRAVERSAL · STUN, TURN, ICE =====

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
distilled into one document. Surface-level "what is STUN" content already
exists everywhere — what I need from you is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — Saikat Guha and Paul Francis's 2003 NAT-behaviour
  measurement work at Cornell, Jonathan Rosenberg as the workhorse author
  who wrote essentially the whole NAT-traversal RFC stack at dynamicsoft /
  Cisco / Skype, the 2008-era VoIP wave that forced production-grade STUN
  and TURN, the WebRTC era from ~2012 when STUN/TURN/ICE went from
  telco-only to every browser, and the modern 2024–2026 evolution
  including STUN/TURN over QUIC (RFC 9747), ICE-PAC, and the deprecation
  of STUN's old RFC 3489 classification scheme.
- Mechanics deep enough that someone could re-implement a minimal STUN
  client, a minimal TURN allocator, and an ICE agent after reading: STUN
  message structure with magic cookie + transaction ID + TLV attributes,
  XOR-MAPPED-ADDRESS, MESSAGE-INTEGRITY, FINGERPRINT, the TURN allocate
  / refresh / send / data / channel-bind dance, ICE candidate gathering /
  pair prioritisation / connectivity-check / nominated-pair selection.
- Real failures and famous incidents — WebRTC IP-leak (mDNS-candidate
  mitigation), TURN credential leaks in mobile apps, coturn CVEs
  (CVE-2020-26262, CVE-2023-26129), Cloudflare's TURN-as-a-service launch
  notes from 2024, the Twilio STUN/TURN dependency that took down Discord
  voice on several occasions.
- Connections to adjacent protocols — WebRTC is the obvious huge one, but
  also SIP, RTP, SDP, the underlying UDP/TCP/TLS/DTLS transports, QUIC
  (STUN over QUIC), and how ICE interacts with IPv4 vs IPv6 dual-stack
  candidates.
- 2024–2026 developments — RFC 9747 (STUN over (D)TLS over TCP, formally
  obsoletes parts of older transport rules), draft-ietf-tram-stun-pmtud,
  ICE-PAC (Patiently Awaiting Connectivity), server-reflexive privacy
  proposals, Cloudflare and Twilio public ICE/TURN service scale numbers
  from 2024–2025, HEVC + AV1 media coupling forcing TURN allocation
  sizing changes.
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
body (IETF datatracker, especially the TRAM, ICE, and MMUSIC working
groups). Past passes have left 121 `[needs source]` markers across 46
reports — please try harder this round, but never invent a source to
avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how NAT traversal relates
to these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, IPsec, WireGuard, OSPF, mDNS/DNS-SD, Kerberos, OpenID
Connect, ACME, email-auth (DKIM/SPF/DMARC), SAML, LDAP, SNMP,
Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **NAT traversal**, covered as a single
bundled report on the three protocols that practitioners almost always
deploy together: **STUN** (Session Traversal Utilities for NAT), **TURN**
(Traversal Using Relays around NAT), and **ICE** (Interactive
Connectivity Establishment). They are three RFCs but one mental model —
ICE is the choreography that uses STUN to discover candidates and TURN
to relay when nothing else works. Please structure the report so the
shared glossary, history, and motivation are told once, then give each
of STUN, TURN, and ICE its own "How it actually works" subsection with
its own header layout, state machine, and worked example.

STUN started life as RFC 3489 in March 2003 (Rosenberg, Weinberger,
Huitema, Mahy) and was almost entirely rewritten as RFC 5389 in 2008
(Rosenberg, Mahy, Matthews, Wing). TURN came in RFC 5766 (2010), ICE in
RFC 5245 (2010). The current normative trio is RFC 8489 (STUN), RFC 8656
(TURN), and RFC 8445 (ICE), all updated in 2018–2020. As of 2026 the
frontier work is RFC 9747 (STUN over (D)TLS over TCP semantics tightened
and STUN-over-QUIC), draft-ietf-ice-pac, and various media-coupling
drafts driven by WebRTC NV.

Related protocols and standards likely connected to NAT traversal that
you should verify and expand on:

  - **WebRTC** — the dominant consumer of all three; every browser ships
    a full ICE agent
  - **SIP** — the original VoIP carrier that drove the 2003–2010 work
  - **SDP** — carries ICE candidates in offer/answer
  - **RTP / SRTP** — the media streams ICE eventually carries
  - **UDP / TCP** — STUN and TURN run over both; ICE prefers UDP
  - **TLS / DTLS** — STUN-over-TLS and DTLS-SRTP keying coexist
  - **QUIC** — RFC 9747's STUN-over-QUIC, plus emerging MASQUE/CONNECT-UDP overlap
  - **IPv4 / IPv6** — dual-stack candidate gathering, happy-eyeballs-style ordering
  - **mDNS / DNS-SD** — the WebRTC mDNS-candidate IP-leak mitigation
  - **XMPP / Jingle** — pre-WebRTC NAT-traversal carrier
  - **WireGuard / IPsec** — different model (overlay vs hole-punch) but
    same problem; explain the comparison

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., NAT, full-cone NAT, address-restricted cone, port-restricted cone,
  symmetric NAT, hairpinning, EIM, EDM, server-reflexive address,
  peer-reflexive address, relayed address, host candidate, srflx
  candidate, prflx candidate, relay candidate, 5-tuple, transaction ID,
  magic cookie, MESSAGE-INTEGRITY, FINGERPRINT, REALM, NONCE, allocation,
  permission, channel binding, lite vs full ICE, nominated pair,
  trickle ICE, consent freshness)
- [ ] **≥4** dated entries on the history timeline
  (2003 RFC 3489 → 2008 RFC 5389 → 2010 RFC 5245/5766 → 2018–2020 RFC
  8445/8489/8656 → 2024 RFC 9747)
- [ ] Full STUN message layout with bit widths AND TURN-specific
  attribute layouts AND ICE candidate-attribute syntax
- [ ] ICE agent state machine (mermaid `stateDiagram-v2`):
      Gathering → Connectivity Checks → Nominating → Completed → Failed
- [ ] A sequence diagram of a WebRTC ICE exchange:
      candidate gathering → offer/answer with candidates → STUN binding
      checks → TURN allocate (if needed) → nominated pair → media flow
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (Google stun.l.google.com fleet, Cloudflare Realtime
      TURN-as-a-service, Twilio Network Traversal Service, Discord voice
      backbone, Zoom Phone, Apple FaceTime, Microsoft Teams TURN,
      WhatsApp voice, Slack Huddles)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Jonathan Rosenberg, Saikat Guha, Christer Holmberg, Bryan Ford,
      Philip Matthews, Tim Panton, Justin Uberti)
- [ ] **≥3** RFCs with number, year, status, and notable-section pointers
      (RFC 8489 STUN, RFC 8656 TURN, RFC 8445 ICE, plus the predecessors
      RFC 3489 / 5389 / 5245 / 5766 and the 2024 RFC 9747)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (WebRTC IP-leak 2015+ and the mDNS mitigation, coturn
      CVE-2020-26262, CVE-2023-26129, Discord voice outages tied to
      Twilio TURN, the 2022 TURN credential-leak class in mobile apps)
- [ ] **≥3** fun facts / anecdotes with sources (Rosenberg's
      one-person-RFC-stack volume, the "STUN classifies NATs" misconception
      that RFC 5389 explicitly walked back, the `stun.l.google.com:19302`
      port number trivia, the Skype P2P-supernode story)
- [ ] **≥3** practical pitfalls with concrete tuning advice (TURN
      allocation TTL and refresh interactions, consent-freshness
      defaults, ICE keepalive intervals, dual-stack candidate ordering,
      mDNS-candidate handling in non-browser apps, TURN/TLS vs TURN/TCP
      port-443 fallback)
- [ ] **≥3** Wireshark / capture-tool filter examples
      (`stun`, `stun.attribute_type == 0x0020`, `udp.port == 3478`,
      `tcp.port == 5349`, plus how to read TURN ChannelData)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (RFC 9747 publication, Cloudflare Realtime TURN GA, Twilio NTS
      price/feature updates, Chromium changes to ICE, draft-ietf-ice-pac
      progress, server-reflexive privacy work)
- [ ] **≥1** 2025–2026 frontier development (STUN over QUIC, ICE-PAC,
      MASQUE CONNECT-UDP overlap with TURN, post-quantum considerations
      for STUN-over-DTLS)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (a WebRTC ICE handshake)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* NAT traversal makes
sense. For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: NAT (and its sub-types — full-cone,
address-restricted cone, port-restricted cone, symmetric, plus the
modern EIM/EDM/APDM taxonomy from RFC 4787), hairpinning, port-mapping
preservation, 5-tuple, UDP, TCP, TLS, DTLS, ICE candidate types (host,
srflx, prflx, relay), STUN message structure, TURN allocation /
permission / channel binding, ICE check / nomination / aggressive
nomination / trickle ICE / consent freshness / lite-ICE, mDNS-candidate.

## History and story

Origin — Saikat Guha and Paul Francis's measurement work at Cornell on
NAT behaviour (2003–2005), Bryan Ford's "Peer-to-peer communication
across NATs" 2005 USENIX paper which is the canonical academic
reference, Jonathan Rosenberg's prolific RFC authorship at dynamicsoft
and later Cisco — he is essentially the sole-name on RFC 3489, lead
author on RFC 5389, RFC 5245, and RFC 5766. The 2003 → 2008 rewrite
where the IETF explicitly removed the "STUN classifies NAT type"
behaviour and reframed STUN as a utility, not a protocol. The TURN
debate (relays are expensive; nobody wanted to be the bagholder). The
2010 publication of ICE/TURN as proposed standards. The WebRTC era
(2012–2017) where Google's libwebrtc and the W3C/IETF rtcweb effort
mainstreamed ICE in every browser. The 2018–2020 refresh (RFC 8445,
8489, 8656) that consolidated the trio. The 2024 RFC 9747 update for
STUN-over-(D)TLS-over-TCP and STUN-over-QUIC. If anything has changed
in the last 24 months — RFC 9747, draft-ietf-ice-pac progress, the
WebRTC NV ICE updates — call it out explicitly.

## How it actually works

Three parallel sub-sections — one for STUN, one for TURN, one for ICE —
because while they share a wire format (TURN and ICE extend STUN), the
state machines and operational semantics are distinct. The shared base
(STUN message format, transaction ID, magic cookie, TLV attributes,
short-term / long-term credentials) is described once up front, then
each protocol's subsection covers its own additional attributes and
behaviour.

For **STUN**: message format (20-byte header + TLV attributes), the
Binding Request / Binding Response exchange, XOR-MAPPED-ADDRESS, the
short-term and long-term credential mechanisms, MESSAGE-INTEGRITY,
FINGERPRINT, what RFC 5389 deliberately removed from RFC 3489 (NAT
type classification), STUN over UDP / TCP / TLS / DTLS / QUIC.

For **TURN**: the Allocate request/response, allocation lifetimes and
refreshes, CreatePermission, Send/Data indications, channel bindings
(ChannelData messages), the difference between TURN-UDP, TURN-TCP
(RFC 6062), TURN-TLS, and TURN-DTLS, allocation quotas and rate
limiting, the third-party-authorisation mechanism (oAuth-style tokens
in RFC 7635).

For **ICE**: candidate gathering, candidate-pair formation, priority
calculation (the famous formula), connectivity checks, role conflict
resolution (controlling/controlled), nominated pair, regular vs
aggressive nomination, lite-ICE for servers, trickle ICE for low-latency
setup, consent freshness (RFC 7675).

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of a WebRTC ICE flow: gather → offer/answer →
   connectivity checks → TURN-allocate (fallback) → nominated pair → media
2. ICE agent state machine (`stateDiagram-v2`): Gathering → Checking →
   Connected → Completed → Failed → Closed
3. STUN message header + attribute TLV bit layout (table form), with
   TURN-specific attribute extensions and an ICE-candidate SDP line
   example

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **WebRTC** — every PeerConnection embeds an ICE agent; explain how
  SDP carries candidates, how trickle ICE works in the JS API
- **SIP / SDP** — the original carrier; explain how the SIP offer/answer
  model embeds ICE candidates
- **RTP / SRTP** — what eventually flows over the selected pair, and
  how DTLS-SRTP keying intersects with TURN relaying
- **QUIC** — RFC 9747's STUN-over-QUIC, and the conceptual overlap with
  MASQUE's CONNECT-UDP (which is "TURN over HTTP/3" in spirit)
- **IPv4 vs IPv6** — dual-stack candidate gathering, happy-eyeballs-style
  pair ordering, the increasingly common IPv6-only-with-NAT64 case
- **mDNS / DNS-SD** — the Chrome mDNS-candidate mitigation that
  replaced real local-IP host candidates with `.local` names to plug
  the WebRTC IP-leak vector
- **WireGuard / IPsec** — the overlay alternative; explain why some
  workloads choose VPN over hole-punch and why mesh-VPNs like Tailscale
  reimplement ICE-like logic on top of WireGuard
- **TURN vs SOCKS5 / HTTP CONNECT** — proxying cousins
- **Apple's NAT64/CLAT, Google's PSE, carrier CGNAT** — why srflx
  candidates alone are unreliable in 2026

## Real-world deployment

Major implementations — named: `coturn` (the de-facto open-source TURN
server, maintained by Pavel Rozhkov; powers Jitsi, Element/Matrix,
Mattermost, Discord historically), `restund`, `Pion` (Go), `libnice`,
`libjuice`, Cisco's commercial TURN, Twilio Network Traversal Service,
Cloudflare Realtime TURN-as-a-service (GA in 2024), Google's anycast
`stun.l.google.com` fleet on port 19302. Real numbers: Cloudflare's
2024 launch numbers, Discord voice scale, Apple FaceTime call volume,
Microsoft Teams TURN deployment scale. **Minimum 5 named deployments
with metrics.**

## Failure modes and famous incidents

The WebRTC IP-leak (2015 → Chrome mDNS-candidate mitigation 2019),
coturn CVE-2020-26262 (loopback relay bypass), CVE-2023-26129 (denial
of service), the recurring class of TURN credential leaks in mobile
apps (apps embedding long-term TURN credentials in client binaries),
Discord voice outages tied to Twilio TURN backplane, the 2022 Slack
Huddles ICE-fallback incidents, symmetric-NAT-only carriers (notably
some LTE networks) breaking peer-to-peer entirely without TURN. Each
told as setup → mistake → consequence → resolution, with CVE numbers
where they exist.

## Fun facts and anecdotes

- Jonathan Rosenberg's RFC count — he's been called "the one-man IETF
  RTC group" for a reason; quantify the count.
- The "STUN" backronym: originally Simple Traversal of UDP through NATs
  (RFC 3489), renamed Session Traversal Utilities for NAT in RFC 5389
  to acknowledge it's a toolbox, not a protocol.
- The 2003 STUN's NAT-classification scheme that turned out to be
  unreliable in the wild — almost every Wikipedia diagram you'll find
  is based on the deprecated taxonomy.
- The `stun.l.google.com:19302` port-number trivia (chosen because
  19302 is "STUN" on a phone keypad? Verify this folklore).
- Skype's pre-Microsoft P2P supernode design as a parallel-universe
  NAT traversal that didn't use STUN.
- The Bryan Ford "STUNT" experimental TCP-hole-punch paper (2005).
- The IETF "TRAM" working group naming pun.

## Practical wisdom

What an engineer actually needs to know — TURN allocation TTL defaults
(600s) and refresh-before-expiry windows, consent-freshness (RFC 7675)
keepalive intervals, ICE keepalive vs consent freshness distinction,
short-term-credential vs long-term-credential choice, port allocation:
3478 for STUN/TURN UDP/TCP, 5349 for STUN/TURN TLS/DTLS, why port 443
TURN-over-TLS fallback exists, dual-stack candidate-pair ordering,
mDNS-candidate handling for non-browser ICE agents (your server needs
to resolve `.local`), TURN bandwidth pricing as a real ops concern
(Twilio bills per GB relayed; Cloudflare 2024 pricing), the
`iceTransportPolicy: 'relay'` testing trick to force TURN paths.
Include **at least 3** Wireshark filter examples
(`stun`, `stun.att.type`, `udp.port in {3478, 5349, 19302}`, plus
nice tricks for matching transaction IDs across request/response pairs).

## Pioneers and key contributors

- **Jonathan Rosenberg** — dynamicsoft / Cisco / Skype / Five9; the
  workhorse author of RFC 3489, 5389, 5245, 5766, plus most of SIP.
  Wikipedia URL and bio.
- **Saikat Guha** — Cornell PhD, Microsoft Research; the NAT-behaviour
  measurement work that grounded the IETF's understanding.
- **Bryan Ford** — Yale / EPFL; the canonical 2005 USENIX P2P-NAT paper
  and the STUNT TCP-hole-punch follow-up.
- **Christer Holmberg** — Ericsson; co-author on RFC 8445 ICE.
- **Philip Matthews** — Avaya / co-author on RFC 5766 TURN and RFC 8656.
- **Justin Uberti** — Google; lead WebRTC architect, drove ICE adoption
  in browsers; later at Microsoft and Anthropic.
- **Tim Panton** — IETF community pillar on WebRTC and ICE.
- **Pavel Rozhkov** — coturn maintainer (since ~2012); the human behind
  the open-source TURN that everyone runs.

## Learning resources (current as of 2026)

For each resource: URL, one-sentence description, level
(intro / intermediate / advanced), and the year last updated. Cover:

- Authoritative specifications — RFC 8489 (STUN), RFC 8656 (TURN), RFC
  8445 (ICE), RFC 9747 (STUN-over-QUIC and transport semantics), RFC
  7675 (consent freshness), RFC 7065 (TURN URIs), RFC 6062 (TURN-TCP),
  with section pointers for the load-bearing parts.
- Books — *WebRTC Cookbook* (O'Reilly), *Real-Time Communication with
  WebRTC* (Loreto & Romano, O'Reilly), Alan B. Johnston & Daniel C.
  Burnett's WebRTC book chapters on ICE.
- Academic papers — Ford 2005 USENIX "Peer-to-peer communication
  across NATs"; Guha et al. NAT-behaviour studies; RFC 5128 (P2P
  comms through NATs survey).
- Long-form engineering blog posts — Cloudflare 2024 Realtime TURN GA
  posts, Twilio's classic "What is WebRTC" series, Discord's voice
  infra writeups, Tailscale's "How NAT traversal works" blog post
  (one of the best free resources, ~2020 with 2023 updates).
- YouTube — Justin Uberti talks, IETF working group session recordings,
  Computerphile's WebRTC explainer.
- Podcasts — *Packet Pushers*, *kranky geek* WebRTC conference talks
  (annual since 2014).
- Free courses — Stanford CS244 networking, the WebRTC for the
  Curious online book (free, updated 2024).
- Hands-on tools — `trickle-ice` (webrtc.github.io/samples), Cloudflare's
  TURN sandbox, `stunclient` from coturn, Wireshark with the `stun`
  dissector.

## Where things are heading (2025–2026 frontier)

STUN over QUIC (RFC 9747) — adoption status. ICE-PAC
(draft-ietf-ice-pac) — letting ICE start trying paths before all
candidates are gathered. MASQUE / CONNECT-UDP as a "TURN replacement"
for HTTP/3-native deployments. Post-quantum considerations for
STUN-over-DTLS. Server-reflexive-privacy proposals that obscure the
real public IP from peers. The Cloudflare and Twilio commercial
TURN-as-a-service scale numbers from 2024–2025.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to
three sentences and stand on its own.

- A 60-second narrated hook (the "your video call shouldn't work, but
  it does" beat).
- A striking statistic (e.g., "X% of WebRTC calls fall back to TURN
  on cellular").
- A "pause and think" moment.
- A failure-story arc (the WebRTC IP-leak saga works well, as does
  Discord-Twilio).

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: nat-traversal
name: NAT Traversal (STUN, TURN, ICE)
abbreviation: STUN/TURN/ICE
categoryId: <recommend: utilities-security, or propose a new "real-time-infrastructure" category>
port: 3478 (STUN/TURN UDP/TCP), 5349 (STUN/TURN TLS/DTLS), 19302 (Google's STUN convention)
year: 2003 (RFC 3489 STUN) / 2010 (TURN, ICE)
rfc: RFC 8489 (STUN), RFC 8656 (TURN), RFC 8445 (ICE)
standardsBody: ietf
oneLiner: <single sentence — the elevator pitch for the whole trio>
overview: <2–3 paragraphs of polished prose covering all three>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items (WebRTC, VoIP, video calls, P2P file transfer, IoT remote access, gaming voice chat)
performance: { latency, throughput, overhead }
connections: [webrtc, sip, sdp, rtp, udp, tcp, tls, dtls, quic, ipv4, ipv6, mdns-dns-sd, wireguard, ipsec]
links: { wikipedia, rfc, official }
image: <Wikimedia URL — likely a NAT-traversal topology diagram>
```

### A.2 Header / wire-format layout

Provide all three:
- STUN message header (20 bytes: 2b type, 14b message type, 16b length,
  32b magic cookie 0x2112A442, 96b transaction ID) + standard attributes
  TLV (XOR-MAPPED-ADDRESS, USERNAME, MESSAGE-INTEGRITY, FINGERPRINT,
  ERROR-CODE)
- TURN-specific attributes (LIFETIME, XOR-RELAYED-ADDRESS,
  XOR-PEER-ADDRESS, DATA, CHANNEL-NUMBER, REQUESTED-TRANSPORT,
  RESERVATION-TOKEN) + the ChannelData header (4b channel number,
  16b length, payload)
- ICE candidate SDP `a=candidate:` line syntax with field-by-field
  breakdown (foundation, component, transport, priority, IP, port,
  type, related-address, related-port, generation, ufrag, network-id)

### A.3 State machine

ICE agent state machine in mermaid `stateDiagram-v2`:
Gathering → Connectivity Checks (Frozen / Waiting / In-Progress) →
Succeeded → Nominated → Completed → Failed → Closed (with consent
freshness as a self-loop on Completed).

### A.4 Code example

- `python` — using `aiortc` to establish a peer connection with explicit
  ICE server config, plus a raw STUN binding request using `stun` lib
- `javascript` — browser `RTCPeerConnection` with `iceServers`, logging
  `icecandidate` events; also a tiny Node.js TURN allocate using `node-turn`
- `cli` — `turnutils_stunclient`, `turnutils_uclient`, `coturn` server
  config snippet, `trickle-ice` page usage
- `wire` — sectioned dump: STUN Binding Request, STUN Binding Success
  Response with XOR-MAPPED-ADDRESS, TURN Allocate, ICE Connectivity
  Check with USE-CANDIDATE

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. RFC 9747 publication, Cloudflare Realtime
TURN GA, Chromium ICE changes, draft-ietf-ice-pac progress, Twilio NTS
pricing/feature updates, server-reflexive privacy work.

### A.6 Real-world deployments

≥5 named: Google STUN fleet, Cloudflare Realtime, Twilio NTS, Discord
voice, Microsoft Teams TURN, Apple FaceTime, Zoom Phone, WhatsApp voice,
Jitsi Meet (coturn-based).

### A.7 Fun facts ≥3

Including the STUN backronym change (Simple Traversal → Session
Traversal Utilities), Rosenberg's prolific RFC count, the deprecated
NAT-classification taxonomy.

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark hints ≥3

Including `stun`, `udp.port == 3478`, `stun.att.type == 0x0020`
(XOR-MAPPED-ADDRESS), and how to follow a TURN allocation.

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Jonathan Rosenberg with full bio.

### A.12 RFC records ≥3

RFC 8489 (STUN, current), RFC 8656 (TURN, current), RFC 8445 (ICE,
current), plus historical RFC 3489 / 5389 / 5245 / 5766 and the 2024
RFC 9747.

### A.13 New glossary concepts

≥12 — NAT taxonomy terms, STUN attributes, TURN allocation/permission/
channel, ICE candidate types, trickle ICE, consent freshness, etc.

### A.14 Frontier entry

STUN-over-QUIC (RFC 9747) and/or ICE-PAC as frontier entries with
metrics and sources.

### A.15 Journey suggestion

"How a video call gets through your NAT" — 5–6 step journey covering
the full WebRTC ICE handshake from candidate gathering to media flow,
linking to webrtc, sdp, rtp, udp, tls.

### A.16 Comparison pair

"STUN vs TURN" (when does ICE fall back?) and "ICE vs WireGuard mesh
NAT-traversal" (hole-punch vs overlay) are the two obvious framings.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "2003, a Cornell hallway and a dynamicsoft cubicle"
  (Guha/Francis measurements + Rosenberg RFC 3489)
- Timeline: 2003 → 2008 (RFC 5389 rewrite) → 2010 (ICE/TURN) →
  2012 (WebRTC mainstreams ICE) → 2018–2020 (refresh trio) → 2024
  (RFC 9747)
- Callout: "STUN does not classify your NAT (anymore)"
- Image: Wikimedia of typical NAT-topology diagram, or an IETF group photo
- Diagram: ICE candidate priority calculation visualised
- Pioneers section embedded: Rosenberg + Ford + Guha mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely none) + new proposals.
Strong candidates for new outage records:
- WebRTC IP-leak (2015) — protocol-design / privacy
- coturn CVE-2020-26262 — software-bug / security
- Discord–Twilio TURN outages (multiple) — capacity / dependency
- Mobile-app TURN credential leaks (class incident) — security / human-error

### A.19 Embedded media

Highest-signal: Justin Uberti WebRTC talk, Tailscale "How NAT traversal
works" blog (article-as-media), `webrtc.github.io/samples/trickle-ice`
playground, kranky geek WebRTC conference highlight reel.

### A.20 Prerequisites

```
concepts: [packet, header, port, socket, ipv4-address, encryption, udp-vs-tcp]
protocols: [udp, tcp, tls, ipv4, ipv6, webrtc, sdp, sip]
```

### A.21 Name highlight

```
"[S]ession [T]raversal [U]tilities for [N]AT"   (STUN)
"[T]raversal [U]sing [R]elays around [N]AT"     (TURN)
"[I]nteractive [C]onnectivity [E]stablishment"  (ICE)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for a WebRTC ICE exchange: candidate
gathering → SDP offer with candidates → SDP answer → STUN connectivity
checks both ways → role conflict / nomination → media flow on
nominated pair, with a TURN-fallback branch shown. 10–14 step
annotations; explain *what* each message is and *why* the reader is
seeing it (e.g., "this is a STUN Binding Request with the
PRIORITY/USE-CANDIDATE attributes — it's a peer connectivity check,
not a server query").

### A.23 Category placement

Reasonable options:
- Fit into existing `utilities-security` (since it's plumbing)
- Fit into `realtime-av` (since 95% of usage is WebRTC)
- **Propose a new "real-time-infrastructure" category** that would
  also house WebRTC, SDP, ICE — the plumbing of real-time

```
id: real-time-infra
name: Real-time Infrastructure
color: <suggest a teal/cyan>
glowColor: <complementary>
description: Plumbing protocols that make peer-to-peer real-time communication possible across the modern internet.
icon: <lucide icon e.g., "network" or "router">
```

---

# Appendix B — Simulator step list

Author **one** simulation: a WebRTC ICE handshake between two browsers,
with a TURN-fallback branch shown explicitly. Provide 8–10 steps in
the shape:

```
title: "WebRTC ICE: Candidate Gathering to Media Flow"
description: "Watch two browsers discover each other through NATs, fall back to a TURN relay, and start media."
actors:
  - { id: "alice", label: "Alice (Browser)", icon: "browser", position: "left" }
  - { id: "stun", label: "STUN Server", icon: "server", position: "center-left" }
  - { id: "turn", label: "TURN Relay", icon: "server", position: "center-right" }
  - { id: "bob", label: "Bob (Browser)", icon: "browser", position: "right" }
userInputs:
  - { id: "natType", label: "NAT type (Alice)", type: "select", options: ["EIM", "EDM", "symmetric"], defaultValue: "EIM" }
  - { id: "forceRelay", label: "Force TURN", type: "boolean", defaultValue: false }
steps:
  - id: gather-host
    label: "Host candidate"
    description: "Browser enumerates local network interfaces."
    fromActor: alice
    toActor: alice
    duration: 800
    highlight: [candidate type, IP, port]
    layers:
      - IP: { src: "192.168.1.10" }
      - ICE: { type: "host", priority: "..." }
  - id: stun-binding-req
    label: "STUN Binding Request"
    ...
  - id: stun-binding-resp
    label: "STUN Binding Response"
    description: "STUN server replies with XOR-MAPPED-ADDRESS — the public IP:port."
    highlight: [XOR-MAPPED-ADDRESS, transaction ID]
    ...
  - id: turn-allocate
    label: "TURN Allocate (fallback)"
    ...
  - id: offer-answer
    label: "SDP offer/answer with candidates"
    ...
  - id: ice-check
    label: "STUN Connectivity Check"
    description: "Both sides probe candidate pairs with STUN Binding Requests carrying USE-CANDIDATE."
    ...
  - id: nominated
    label: "Nominated pair"
    ...
  - id: media
    label: "Media flows"
    ...
```

The layers should reflect the actual protocol stack — for STUN packets,
IP → UDP (or TCP/TLS) → STUN; for the eventual media,
IP → UDP → SRTP/DTLS-SRTP → RTP.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three
search variations.

==========
