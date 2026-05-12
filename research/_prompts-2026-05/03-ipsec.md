===== PROTOCOL · IPSEC · IP Security =====

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
distilled into one document. Surface-level "what is IPsec" content already
exists everywhere — what I need from you is depth, story, current detail,
and connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the early-1990s genesis with Phil Karn's swIPe,
  Whitfield Diffie's NSA-era encryption-at-layer-3 advocacy, the 1995 RFC
  1825 family from Randall Atkinson, Steve Bellovin's STS / KryptoNet
  work, the Cisco / Microsoft / Sun politics, the 1998 IKEv1 (RFC 2409 +
  RFC 2407 + RFC 2408 ISAKMP) era and its byzantine reputation, the 2005
  IKEv2 (RFC 4306, then RFC 5996, then the current RFC 7296)
  consolidation, the 3GPP adoption story (S1, X2, N3 interfaces over
  IPsec), the 2024–2026 post-quantum push (RFC 8784 PPK extension, the
  IKEv2 PQ-KEM hybrid drafts), and the WireGuard pressure that has
  reshaped how IPsec is positioned.
- Mechanics deep enough that someone could re-implement a minimal IPsec
  data plane and a stripped-down IKEv2 initiator after reading: AH vs
  ESP, transport vs tunnel mode, SA / SAD / SPD, the IKEv2 handshake
  (IKE_SA_INIT → IKE_AUTH → CREATE_CHILD_SA → INFORMATIONAL), DH/ECDH
  groups, the AEAD ciphersuites (AES-GCM, ChaCha20-Poly1305), MOBIKE,
  NAT-T encapsulation on UDP 4500, IKEv2 over TCP (RFC 8229), the
  Intermediate Exchange (RFC 9242).
- Real failures and famous incidents — the Equation Group's
  BENIGNCERTAIN exploit on Cisco PIX (Shadow Brokers 2016), the
  Bleichenbacher-style oracle attacks on IKE (Felsch et al. USENIX
  2018 "The Dangers of Key Reuse"), the FragAttacks-era IP-fragmentation
  issues, strongSwan and Libreswan CVE history, the 2020 "weakness in
  IPsec Cookies" academic findings, real outages at carriers.
- Connections to adjacent protocols — IP / IPv6 (foundational), UDP
  (NAT-T encapsulation), TCP (IKEv2 over TCP), TLS (separate model;
  explicit comparison), **WireGuard** (the modern competitor — write
  the comparison strongly), GRE (often paired in GRE-over-IPsec), DTLS
  (Cisco AnyConnect / OpenConnect alternative), QUIC (the experimental
  IPsec-over-QUIC drafts).
- 2024–2026 developments — RFC 8784 (Quantum-Resistant Pre-Shared
  Keys for IKEv2), draft-ietf-ipsecme-ikev2-pq-auth, the IKEv2 PQ-KEM
  hybrid drafts (Kyber/ML-KEM), RFC 9242 Intermediate Exchange to
  shrink large PQ payloads, deployment status at hyperscalers, the
  3GPP 5G-Advanced security profile updates, OPNsense / pfSense /
  strongSwan 6.x feature rollouts.
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and
explicitly call out anything that has changed in the last 24 months.
Treat older sources as suspect and verify them against the current
state. Define every term you use — assume the reader is smart but new
to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL
or DOI. Do not fabricate citations. If a claim has no real source, mark
it `[needs source]` — but before doing that, attempt at least three
search variations including academic indices (Google Scholar, IEEE
Xplore, ACM DL, USENIX), archive.org for older or dead links, and the
relevant standards body (IETF datatracker, especially the IPSECME
working group, and 3GPP for the SA3 security specs). Past passes have
left 121 `[needs source]` markers across 46 reports — please try harder
this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how IPsec relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), **WireGuard**, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **IPsec** — the IP Security suite, covered
as a single bundled report on the four core wire protocols that
practitioners deploy together: **AH** (Authentication Header), **ESP**
(Encapsulating Security Payload), and the two generations of key
exchange — **IKEv1** (legacy, still in production at carriers) and
**IKEv2** (the modern default). They are conceptually one system: a
data-plane layer (AH/ESP) plus a control-plane key-exchange (IKE).
Please structure the report so the shared history, architecture, and
threat model are told once, then give each major component its own
"How it actually works" subsection with its own header layout and
worked example.

IPsec's specification history is unusually layered. The 1995 RFC
1825–1829 originals were replaced by the 1998 RFC 2401–2409 series,
which were replaced by the 2005 RFC 4301–4309 series, the current
normative architecture being **RFC 4301** (architecture), **RFC 4302**
(AH), **RFC 4303** (ESP), and **RFC 7296** (IKEv2, current, with
updates in RFC 7427, RFC 8247, RFC 8784, RFC 9242, and more). As of
2026 the frontier is post-quantum IKEv2 — the PQ-PSK hybrid (RFC 8784)
is deployed, and the PQ-KEM hybrid drafts (using ML-KEM/Kyber) are
moving toward RFC status.

Related protocols and standards likely connected to IPsec that you
should verify and expand on:

  - **IP / IPv4 / IPv6** — IPsec lives at layer 3; explain how the
    Next Header / Protocol field selects AH (51) or ESP (50)
  - **UDP** — NAT-T encapsulation on UDP/4500 (RFC 3948), and IKE on
    UDP/500
  - **TCP** — IKEv2 over TCP (RFC 8229) for hostile firewalls
  - **TLS** — the standard "VPN comparison" — explain the model
    differences, why IPsec ≠ TLS-VPN
  - **WireGuard** — the modern competitor; write the comparison
    strongly and fairly (IPsec's flexibility vs WireGuard's simplicity)
  - **DTLS** — Cisco AnyConnect / OpenConnect use DTLS-VPN as an
    IPsec alternative; mention
  - **GRE** — GRE-over-IPsec is the classic Cisco site-to-site recipe
  - **QUIC** — the experimental IPsec-over-QUIC drafts and the
    overlap with MASQUE
  - **OSPF / BGP** — common routing protocols carried inside IPsec
    tunnels
  - **3GPP S1 / X2 / N3 interfaces** — carrier backhaul is almost
    entirely IPsec
  - **Kerberos** — GSS-API authentication in IKEv2 (RFC 4754)

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., SA, SAD, SPD, SPI, AH, ESP, transport mode, tunnel mode,
  IKE_SA_INIT, IKE_AUTH, CREATE_CHILD_SA, INFORMATIONAL, MOBIKE,
  NAT-T, DH group, ECDH group, AEAD, ESN, anti-replay window, PFS,
  rekey, EAP, GSS-API, IKEv1 main mode, aggressive mode, quick mode,
  Diffie-Hellman, PQ-KEM, PSK, PPK)
- [ ] **≥4** dated entries on the history timeline
  (1993 swIPe → 1995 RFC 1825 → 1998 RFC 2401/2409 → 2005 RFC 4301/4306
  → 2014 RFC 7296 IKEv2 → 2020 RFC 8784 PQ-PSK → 2023 RFC 9242
  Intermediate Exchange → 2024–2026 PQ-KEM drafts)
- [ ] Full ESP packet layout with bit widths AND AH packet layout with
      bit widths AND the IKEv2 message header + payload-chain layout
- [ ] IKEv2 SA state machine (mermaid `stateDiagram-v2`):
      IKE_SA_INIT → IKE_AUTH → ESTABLISHED → CREATE_CHILD_SA / REKEY →
      INFORMATIONAL / DELETE → CLOSED
- [ ] A sequence diagram of a full IKEv2 site-to-site bring-up:
      IKE_SA_INIT (DH, nonces, cookies) → IKE_AUTH (auth, CHILD_SA
      proposal, traffic selectors) → ESP data flow → REKEY →
      INFORMATIONAL DELETE
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (every 3GPP carrier backhaul, Cisco ASA / Firepower,
      Juniper SRX, Fortinet FortiGate, OPNsense / pfSense / strongSwan
      / Libreswan, OpenBSD iked, Microsoft Always-On VPN, Apple
      iOS/macOS IKEv2 client, AWS Site-to-Site VPN, Azure VPN Gateway,
      GCP Cloud VPN)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Phil Karn, Steve Bellovin, Cheryl Madson, Hugo Krawczyk, Tero
      Kivinen, Paul Wouters, Charlie Kaufman, Yoav Nir)
- [ ] **≥3** RFCs with number, year, status, and notable-section pointers
      (RFC 4301 architecture, RFC 4303 ESP, RFC 7296 IKEv2, plus
      RFC 8784 PQ-PSK, RFC 9242 Intermediate Exchange, RFC 8229
      IKEv2-over-TCP, RFC 3948 NAT-T)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (Shadow Brokers BENIGNCERTAIN on Cisco PIX 2016,
      Felsch et al. Bleichenbacher-on-IKE USENIX 2018, FragAttacks
      2021, the 2020 IPsec cookie weakness, strongSwan CVE-2023-26463)
- [ ] **≥3** fun facts / anecdotes with sources (Phil Karn's swIPe and
      the "we did it in spite of the NSA" narrative, the "IKEv1 is the
      most baroque protocol the IETF ever shipped" Bellovin quote, the
      Equation Group / Shadow Brokers / Cisco PIX saga, the strongSwan
      vs Libreswan vs FreeS/WAN fork history, Tero Kivinen's 20-year
      IKEv2 editor stint)
- [ ] **≥3** practical pitfalls with concrete tuning advice (DH group
      negotiation gotchas, MTU/PMTUD with tunnel mode, NAT-T detection
      failures, anti-replay window sizing, rekey timing, ESP-null vs
      AH choice, IKEv2 fragmentation RFC 7383, the strongSwan
      `/etc/swanctl/swanctl.conf` traps)
- [ ] **≥3** Wireshark / capture-tool filter examples
      (`isakmp`, `esp`, `udp.port == 500`, `udp.port == 4500`, plus
      how to decrypt ESP given the SA keys via the Wireshark ESP-SA
      table)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (RFC 9242 publication, PQ-KEM hybrid draft progress, strongSwan
      6.x release, OPNsense IKEv2 PQ rollout, Azure VPN PQ preview,
      3GPP 5G-Advanced security updates)
- [ ] **≥1** 2025–2026 frontier development (post-quantum IKEv2,
      IPsec-over-QUIC drafts, IKEv2 with HPKE, 3GPP PQ requirements
      for 6G)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (an IKEv2 site-to-site
      bring-up with subsequent ESP data flow)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* IPsec makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: IP packet structure, IP Protocol field,
encryption (symmetric, asymmetric, AEAD), AES, AES-GCM,
ChaCha20-Poly1305, Diffie-Hellman, ECDH, X25519, post-quantum KEM
(ML-KEM / Kyber), HMAC, digital signature, certificate, PSK,
authentication-vs-encryption distinction, replay attack, NAT, NAT-T,
PMTUD, MTU, fragmentation, SA / SAD / SPD / SPI, transport vs tunnel
mode, security gateway, EAP, GSS-API.

## History and story

Origin — Phil Karn's 1993 swIPe (a userspace IP-security tunneling
experiment), the NSA-era backstory of Whitfield Diffie advocating for
encryption-at-layer-3, Randall Atkinson's 1995 RFC 1825–1829 series at
the Naval Research Lab. The 1998 second-generation RFCs (RFC 2401
architecture, RFC 2406 ESP, RFC 2402 AH, RFC 2407 DOI, RFC 2408
ISAKMP, RFC 2409 IKEv1). The notorious complexity of IKEv1 — Steve
Bellovin and Bruce Schneier's 1999 cryptanalysis paper, Niels Ferguson
and Bruce Schneier's "A Cryptographic Evaluation of IPsec" (2000)
which famously called IPsec "too complex to be secure" while still
endorsing it as the best option. The 2005 third-generation RFC 4301
family that fixed many of those issues and introduced IKEv2 (RFC 4306).
The 2014 IKEv2 consolidation in RFC 7296 (current). The 3GPP adoption
story — every LTE and 5G interface backhaul mandates IPsec for S1, X2,
N3. The strongSwan / Libreswan / openSWAN fork lineage from
FreeS/WAN (Hugh Daniel and John Gilmore's Linux project). The 2016
Shadow Brokers leak that revealed BENIGNCERTAIN, an NSA exploit
against Cisco PIX IKEv1 — narrate this beat. The 2024–2026 post-quantum
push (RFC 8784 PQ-PSK already deployed, PQ-KEM hybrid drafts moving
toward RFC). The pressure from WireGuard that has reframed IPsec's
positioning — explain this honestly. Version history table with what
changed in each major generation.

## How it actually works

Four parallel sub-sections — AH, ESP, IKEv1 (briefly, mostly for
historical context), IKEv2 (in depth) — because while they share an
architecture (RFC 4301), the wire formats and state machines are
distinct. The shared base (SA, SAD, SPD, SPI selection, transport vs
tunnel mode, the Security Policy Database matching flow) is described
once up front, then each protocol's subsection covers its own
mechanics.

For **AH**: the packet format (Next Header, Payload Length, SPI,
Sequence Number, ICV), the "authenticates the IP header too" property
that makes it incompatible with NAT, why almost everyone uses ESP
instead of AH.

For **ESP**: the packet format (SPI, Sequence Number, Payload Data,
Padding, Pad Length, Next Header, ICV), how AEAD ciphers (AES-GCM,
ChaCha20-Poly1305) collapse encryption + integrity, ESN (Extended
Sequence Number) for high-throughput, the anti-replay window.

For **IKEv1**: a concise summary — main mode vs aggressive mode, quick
mode, the eight messages of phase 1 + three of phase 2, why it's
considered baroque and why it's still running on millions of devices.

For **IKEv2**: the four exchange types (IKE_SA_INIT, IKE_AUTH,
CREATE_CHILD_SA, INFORMATIONAL), the message header + payload chain
(SA, KE, Nonce, IDi/IDr, AUTH, TSi/TSr, ENCR), DH/ECDH/PQ-KEM groups,
the AUTH payload (PSK / signature / EAP / null), MOBIKE (RFC 4555)
for endpoint mobility, IKEv2 fragmentation (RFC 7383), IKEv2 over TCP
(RFC 8229), the Intermediate Exchange (RFC 9242), NAT-T encapsulation
on UDP/4500 (RFC 3948), the PQ extensions (RFC 8784 PPK + draft PQ-KEM).

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of a full IKEv2 site-to-site bring-up
2. IKEv2 SA state machine (`stateDiagram-v2`)
3. ESP packet bit layout + AH packet bit layout + IKEv2 message header
   layout (table form)

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **WireGuard** — the modern competitor; do the comparison fairly.
  IPsec wins on flexibility (any auth, any cipher, any cert PKI,
  carrier-grade ecosystem); WireGuard wins on simplicity, audit
  surface, performance. Reference Donenfeld's 2017 paper and the
  honest tradeoffs. Note that IPsec dominates carrier and enterprise;
  WireGuard dominates new self-hosted deployments.
- **TLS** — completely different model: IPsec wraps packets, TLS
  wraps a single bytestream. Explain why "TLS-VPN" (OpenVPN,
  AnyConnect-DTLS) exists and where IPsec wins/loses against it.
- **GRE** — GRE-over-IPsec is the classic Cisco recipe for routing
  protocols through an IPsec tunnel. Explain why and when.
- **UDP / TCP** — NAT-T encapsulation on UDP/4500, IKEv2-over-TCP
  for restrictive firewalls.
- **QUIC** — experimental IPsec-over-QUIC drafts; conceptual overlap
  with MASQUE.
- **IPv6** — IPsec was originally mandated for IPv6 (later relaxed);
  the AH/ESP positioning in the IPv6 extension-header chain.
- **OSPF / BGP** — what routing protocols look like running inside
  an IPsec tunnel; carrier backhaul patterns.
- **3GPP S1 / X2 / N2 / N3 interfaces** — IPsec is mandatory for these
  carrier interfaces; explain the scale.
- **Kerberos** — IKEv2 GSS-API authentication (RFC 4754) is a
  real-world bridge.

## Real-world deployment

Major implementations — strongSwan (the de-facto reference IKEv2 stack
on Linux, run by Andreas Steffen's team at HSR/OST), Libreswan (the
Red Hat / Paul Wouters fork descended from FreeS/WAN), OpenBSD's iked
(Reyk Floeter's clean-room rewrite), Apple's macOS/iOS native IKEv2
client (which won the consumer-VPN game by default), Microsoft
Always-On VPN, Cisco ASA / Firepower, Juniper SRX, Fortinet FortiGate,
OPNsense / pfSense. Cloud VPN gateways: AWS Site-to-Site VPN, Azure
VPN Gateway, GCP Cloud VPN — give the scale numbers and SKUs.
**Minimum 5 named deployments with metrics.**

3GPP deployment numbers — essentially every cellular carrier in the
world runs IPsec on S1/X2/N3. This is the largest IPsec deployment by
far; cite the relevant 3GPP TS 33.401 / TS 33.501 specs.

## Failure modes and famous incidents

The Shadow Brokers 2016 leak revealing BENIGNCERTAIN, an NSA tool
extracting IKEv1 PSKs from Cisco PIX (CVE-2016-6415). Felsch, Mainka,
Mladenov, Schwenk's 2018 USENIX paper "The Dangers of Key Reuse:
Practical Attacks on IPsec IKE" demonstrating Bleichenbacher-style
oracle attacks against several IKE implementations. The FragAttacks
class (Vanhoef 2021) which exposed IP-fragmentation issues that bit
IPsec tunnel-mode flows. The "weaknesses in IPsec cookies" 2020
academic findings. strongSwan CVE history (CVE-2023-26463 X.509
constraint bypass, CVE-2021-45079 EAP authentication bypass). The
notorious operational pitfalls — site-to-site tunnels staying up "but
not forwarding" because of SPD/SAD mismatches, the "PMTUD black hole"
that drops large flows. Each told as setup → mistake → consequence →
resolution, with CVE numbers where they exist.

## Fun facts and anecdotes

- Phil Karn wrote swIPe (1993) as a userspace tunneling proof-of-concept
  while at Qualcomm, partially to embarrass the NSA's position on
  layer-3 crypto.
- Niels Ferguson and Bruce Schneier's 2000 "A Cryptographic Evaluation
  of IPsec" famously concluded IPsec was "too complex to be secure"
  while also endorsing it as the best available — verify the wording.
- IKEv1 was widely considered the most baroque protocol the IETF ever
  shipped; verify the Bellovin quote on this.
- Tero Kivinen has been the IKEv2 RFC editor for ~20 years — find the
  story.
- The FreeS/WAN → Openswan → strongSwan / Libreswan fork lineage; Hugh
  Daniel and John Gilmore funded FreeS/WAN to put strong crypto into
  Linux during the export-control era.
- The Shadow Brokers / BENIGNCERTAIN saga as a real espionage thriller.
- 3GPP made IPsec mandatory for S1 backhaul in LTE; this is why every
  carrier engineer knows IKEv2 even if they call themselves "RF people".

## Practical wisdom

What an engineer actually needs to know — DH/ECDH group selection
(stay on group 14 minimum, prefer 19/20/21 or 31, modern deployments
use X25519 = group 31), AEAD cipher choice (AES-GCM-128/256,
ChaCha20-Poly1305), IKEv2 fragmentation (RFC 7383) vs IP fragmentation,
PMTUD with tunnel mode (the famous "subtract 50–80 bytes" rule), MTU
tuning (1400 is a common safe choice), NAT-T detection failures and
the UDP/500 → UDP/4500 transition, anti-replay window sizing for
high-throughput links (default 64 is often too small), MOBIKE for
mobile clients, IKEv2 over TCP (RFC 8229) for hostile firewalls,
keepalive intervals (DPD), rekey timing (lifetime soft vs hard), the
strongSwan `swanctl.conf` syntax and `swanctl --list-sas` debug move,
how to read `ip xfrm state` and `ip xfrm policy`. Include **at least
3** Wireshark filter examples (`isakmp`, `esp`, `udp.port == 500 ||
udp.port == 4500`, and how to populate the Wireshark ESP-SA table to
decrypt captures).

## Pioneers and key contributors

- **Phil Karn** — Qualcomm; swIPe (1993), KA9Q TCP/IP stack, longtime
  cryptography advocate. Wikipedia URL.
- **Steve Bellovin** — Columbia / AT&T Bell Labs; 1999 IKE cryptanalysis,
  general crypto pioneer.
- **Whitfield Diffie** — Stanford / Sun; co-inventor of public-key
  cryptography, advocate of layer-3 encryption.
- **Cheryl Madson** — Cisco; co-author of multiple IPsec RFCs.
- **Naganand Doraswamy** — co-author of the canonical "IPSec" book
  with Dan Harkins.
- **Hugo Krawczyk** — IBM Research; cryptographic underpinnings of IKE
  (SIGMA, HKDF, RFC 5869 used in IKEv2 KDF).
- **Charlie Kaufman** — Microsoft; original IKEv2 author (RFC 4306, 7296).
- **Tero Kivinen** — INSIDE Secure / AuthenTec; ~20-year IKEv2 RFC
  editor.
- **Paul Wouters** — Red Hat / Aiven; current IETF IPSECME chair,
  Libreswan maintainer.
- **Andreas Steffen** — HSR/OST; strongSwan creator and maintainer.
- **Yoav Nir** — Dell; co-author on many recent IKEv2 RFCs.
- **Reyk Floeter** — OpenBSD; clean-room IKEv2 implementation iked.

## Learning resources (current as of 2026)

For each resource: URL, one-sentence description, level
(intro / intermediate / advanced), and the year last updated. Cover:

- Authoritative specifications — RFC 4301 (architecture), RFC 4303
  (ESP), RFC 4302 (AH), RFC 7296 (IKEv2), RFC 8784 (PQ-PSK), RFC 9242
  (Intermediate Exchange), RFC 8229 (IKEv2-over-TCP), RFC 3948 (NAT-T),
  with section pointers for the load-bearing parts. The 3GPP TS 33.501
  spec for 5G security.
- Books — *IPSec: The New Security Standard for the Internet,
  Intranets, and Virtual Private Networks* (Doraswamy & Harkins, 2003)
  — dated but canonical; *Network Security: Private Communication in
  a Public World* (Kaufman, Perlman, Speciner) — chapters on IPsec
  and IKE; *Practical Cryptography* (Ferguson & Schneier) — the IPsec
  critique chapter.
- Academic papers — Ferguson & Schneier 2000 "A Cryptographic
  Evaluation of IPsec"; Felsch et al. 2018 USENIX "The Dangers of
  Key Reuse"; the various PQ-IKEv2 papers from CRYPTO/Eurocrypt.
- Long-form engineering blog posts — strongSwan documentation
  (extensive), Cloudflare's IPsec posts, AWS VPN deep dives, Wouters'
  Libreswan posts.
- YouTube videos — Andreas Steffen's IPsec / strongSwan talks, IETF
  IPSECME session recordings, RIPE conference IPsec talks.
- Podcasts — *Packet Pushers* IPsec episodes, *Down the Security
  Rabbithole* IKE episodes.
- Free courses — Stanford CS155, the strongSwan University tutorials,
  the OPNsense / pfSense documentation.
- Hands-on tools — strongSwan `swanctl`, Libreswan `ipsec`, OpenBSD
  `iked`, Wireshark `isakmp`/`esp` dissectors, scapy IKEv2
  fuzzing scripts.

## Where things are heading (2025–2026 frontier)

Post-quantum IPsec — RFC 8784 (PQ-PSK) is deployed at sensitive
carriers and governments; the PQ-KEM hybrid drafts using ML-KEM
(Kyber) are moving toward RFC status, and the Intermediate Exchange
(RFC 9242) exists specifically to carry the large PQ payloads. The
3GPP 5G-Advanced (Release 18+) security profiles are nudging carriers
toward PQ. IPsec-over-QUIC drafts (yes, really — explain the
motivation). The pressure from WireGuard has reshaped IPsec's
positioning: enterprises and carriers stay; new self-hosted
deployments leave. The IETF IPSECME working group's current agenda.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to
three sentences and stand on its own.

- A 60-second narrated hook (the "every phone call you make crosses
  IPsec" beat).
- A striking statistic (every LTE/5G S1 interface uses IPsec — that's
  billions of devices).
- A "pause and think" moment (Schneier called it "too complex to be
  secure" 25 years ago, and we still run it everywhere).
- A failure-story arc (BENIGNCERTAIN / Shadow Brokers / Cisco PIX
  works exceptionally well as a podcast story).

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: ipsec
name: Internet Protocol Security
abbreviation: IPsec
categoryId: <recommend: utilities-security, or propose a new "vpn-tunneling" category alongside WireGuard>
port: 500 (IKE UDP), 4500 (IKE/ESP NAT-T UDP), IP protocol 50 (ESP), IP protocol 51 (AH)
year: 1995 (RFC 1825) / 1998 (RFC 2401) / 2005 (RFC 4301, current)
rfc: RFC 4301 (architecture), RFC 4303 (ESP), RFC 7296 (IKEv2)
standardsBody: ietf
oneLiner: <single sentence — elevator pitch for the whole suite>
overview: <2–3 paragraphs of polished prose covering AH, ESP, IKEv1, IKEv2>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items (site-to-site VPN, remote-access VPN, carrier backhaul, cloud VPC peering, secure routing protocol carriage, government/military)
performance: { latency, throughput, overhead }
connections: [ip, ipv6, udp, tcp, tls, wireguard, gre, dtls, quic, ospf, bgp, kerberos]
links: { wikipedia, rfc, official }
image: <Wikimedia URL — likely an IPsec topology / ESP packet diagram>
```

### A.2 Header / wire-format layout

Provide all three:
- ESP packet (SPI 32b, Sequence Number 32b, Payload Data variable,
  Padding 0–255b, Pad Length 8b, Next Header 8b, ICV variable)
- AH packet (Next Header 8b, Payload Length 8b, Reserved 16b, SPI 32b,
  Sequence Number 32b, ICV variable)
- IKEv2 message header (Initiator SPI 64b, Responder SPI 64b, Next
  Payload 8b, Major+Minor Version 8b, Exchange Type 8b, Flags 8b,
  Message ID 32b, Length 32b) + the payload-chain pattern

### A.3 State machine

IKEv2 SA state machine in mermaid `stateDiagram-v2`:
INITIAL → IKE_SA_INIT (DH, nonces, cookies) → IKE_AUTH → ESTABLISHED →
CREATE_CHILD_SA / REKEY → INFORMATIONAL DELETE → CLOSED, with MOBIKE
re-anchoring as a side transition.

### A.4 Code example

- `python` — using `scapy` to craft and parse an IKEv2 IKE_SA_INIT
  exchange; using `cryptography` for a hand-rolled ESP encrypt/decrypt
  with AES-GCM
- `javascript` — Node.js demo with `node-ipsec` or a minimal IKEv2 raw
  packet (acknowledge JS is rare in IPsec land)
- `cli` — `swanctl --initiate`, `ipsec status`, `ip xfrm state`, `ip
  xfrm policy`, `tcpdump -i any 'udp port 500 or udp port 4500 or
  proto 50'`
- `wire` — sectioned dump: IKE_SA_INIT request, IKE_SA_INIT response,
  IKE_AUTH (encrypted), an ESP data packet

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. RFC 9242 publication (Intermediate
Exchange), PQ-KEM hybrid draft progress, strongSwan 6.x release with
PQ support, OPNsense PQ rollout, Azure VPN PQ preview, 3GPP 5G-Advanced
security updates.

### A.6 Real-world deployments

≥5 named: every LTE/5G carrier backhaul (3GPP TS 33.501), Cisco ASA /
Firepower, Juniper SRX, Fortinet FortiGate, Microsoft Always-On VPN,
Apple iOS/macOS IKEv2, AWS Site-to-Site VPN, Azure VPN Gateway, GCP
Cloud VPN, OPNsense / pfSense (strongSwan-based), OpenBSD iked.

### A.7 Fun facts ≥3

Including Phil Karn's swIPe, Schneier's "too complex" critique,
BENIGNCERTAIN / Shadow Brokers, Tero Kivinen's long editor stint.

### A.8 Practical wisdom (sysctls/pitfalls/tools)

Including `net.ipv4.conf.all.accept_redirects`, MTU tuning, the
`xfrm` Linux subsystem, strongSwan `swanctl.conf`, common
PMTUD-black-hole symptoms.

### A.9 Wireshark hints ≥3

Including `isakmp`, `esp`, `udp.port == 500 || udp.port == 4500`,
plus how to decrypt ESP with known SA keys via the ESP-SA table.

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Phil Karn with full bio.

### A.12 RFC records ≥3

RFC 4301 (architecture), RFC 4303 (ESP), RFC 7296 (IKEv2), plus
RFC 8784 (PQ-PSK), RFC 9242 (Intermediate Exchange), and historical
RFC 1825 / 2401 / 4306.

### A.13 New glossary concepts

≥12 — SA, SAD, SPD, SPI, AH, ESP, transport mode, tunnel mode, IKEv2
exchanges, MOBIKE, NAT-T, AEAD, PFS, EAP, GSS-API, anti-replay window,
PQ-KEM, PSK, PPK, etc.

### A.14 Frontier entry

Post-quantum IKEv2 as the headline frontier entry — RFC 8784 deployed,
PQ-KEM hybrid drafts moving toward RFC, 3GPP 5G-Advanced PQ
requirements. Plus optionally IPsec-over-QUIC as a secondary frontier.

### A.15 Journey suggestion

"How a phone call crosses a carrier's IPsec backhaul" — 5–6 step
journey from UE → eNodeB → IPsec tunnel → S-GW/P-GW → Internet,
linking to ip, ipv6, udp, bgp, ospf.

### A.16 Comparison pair

"IPsec vs WireGuard" is the headline framing (write it strongly and
fairly). Secondary: "IPsec vs TLS-VPN".

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "1993, a Qualcomm office and Phil Karn's swIPe"
- Timeline: 1993 → 1995 (RFC 1825) → 1998 (RFC 2401/IKEv1) →
  2005 (RFC 4301/IKEv2) → 2014 (RFC 7296 consolidation) → 2016
  (BENIGNCERTAIN leak) → 2020 (RFC 8784 PQ-PSK) → 2023 (RFC 9242
  Intermediate Exchange)
- Callout: "Schneier called IPsec 'too complex to be secure' — and
  endorsed it anyway"
- Image: Wikimedia of Whitfield Diffie or Phil Karn
- Diagram: ESP transport-vs-tunnel-mode packet structures side-by-side
- Pioneers section embedded: Karn + Diffie + Kivinen mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely none) + new proposals.
Strong candidates for new outage records:
- BENIGNCERTAIN / Shadow Brokers (2016) — security
- Felsch et al. IKE Bleichenbacher (2018) — protocol-design / security
- strongSwan CVE-2023-26463 — software-bug
- FragAttacks-on-IPsec (2021) — protocol-design

### A.19 Embedded media

Highest-signal: Andreas Steffen's strongSwan talks, Paul Wouters'
Libreswan talks, an IETF IPSECME session recording, the OPNsense IPsec
tutorial videos.

### A.20 Prerequisites

```
concepts: [packet, header, encryption, public-key, hash, mac, certificate, port, ipv4-address, nat]
protocols: [ip, ipv6, udp, tcp, tls]
```

### A.21 Name highlight

```
"[I]nternet [P]rotocol [Sec]urity"   (IPsec)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for a full IKEv2 site-to-site bring-up:
IKE_SA_INIT (KE, Nonce, cookie) → IKE_AUTH (encrypted auth + traffic
selectors) → ESTABLISHED + ESP data flow → CREATE_CHILD_SA rekey →
INFORMATIONAL DELETE. 10–14 step annotations; explain *what* each
payload is and *why* the reader is seeing it (e.g., "this is the AUTH
payload — it proves the initiator owns the identity claimed in IDi by
signing prior protocol messages with the configured PSK or
certificate").

### A.23 Category placement

Reasonable options:
- Fit into existing `utilities-security`
- **Propose a new "vpn-tunneling" category** to house IPsec alongside
  WireGuard coming in this same pass

```
id: vpn-tunneling
name: VPN & Tunneling
color: <suggest a deep blue / steel>
glowColor: <complementary>
description: Protocols that encapsulate and protect IP traffic across untrusted networks — site-to-site VPN, remote access, carrier backhaul.
icon: <lucide icon e.g., "shield" or "tunnel" or "lock">
```

---

# Appendix B — Simulator step list

Author **one** simulation: a full IKEv2 site-to-site bring-up followed
by ESP data flow. Provide 8–10 steps in the shape:

```
title: "IPsec Site-to-Site: IKEv2 + ESP"
description: "Watch two security gateways negotiate keys with IKEv2, then carry an encrypted ESP packet."
actors:
  - { id: "gw-a", label: "Gateway A (Initiator)", icon: "gateway", position: "left" }
  - { id: "gw-b", label: "Gateway B (Responder)", icon: "gateway", position: "right" }
userInputs:
  - { id: "dhGroup", label: "DH/ECDH group", type: "select", options: ["14", "19", "20", "31 (X25519)"], defaultValue: "31 (X25519)" }
  - { id: "auth", label: "Auth method", type: "select", options: ["PSK", "RSA-SIG", "ECDSA", "PSK+PPK (PQ)"], defaultValue: "ECDSA" }
  - { id: "natT", label: "NAT-T (port 4500)", type: "boolean", defaultValue: false }
steps:
  - id: ike_sa_init_req
    label: "IKE_SA_INIT request"
    description: "Initiator sends SA proposals, KEi (DH public), Ni (nonce)."
    fromActor: gw-a
    toActor: gw-b
    duration: 1000
    highlight: [SA, KEi, Ni, SPI-i]
    layers:
      - IP: { src: "203.0.113.1", dst: "198.51.100.1" }
      - UDP: { sport: 500, dport: 500 }
      - IKEv2: { exchange: "IKE_SA_INIT", payloads: ["SA","KEi","Ni"] }
  - id: ike_sa_init_resp
    label: "IKE_SA_INIT response"
    ...
  - id: ike_auth_req
    label: "IKE_AUTH request (encrypted)"
    description: "Initiator sends IDi, AUTH, SA proposal for CHILD_SA, traffic selectors — all inside the encrypted IKEv2 SK payload."
    highlight: [SK, IDi, AUTH, SAi2, TSi, TSr]
    ...
  - id: ike_auth_resp
    label: "IKE_AUTH response (encrypted)"
    ...
  - id: esp_data_out
    label: "ESP data (A→B)"
    description: "Encrypted user packet flows over UDP/4500 (NAT-T) or raw IP protocol 50."
    highlight: [ESP SPI, Sequence Number, encrypted payload]
    ...
  - id: esp_data_in
    label: "ESP data (B→A)"
    ...
  - id: create_child_rekey
    label: "CREATE_CHILD_SA (rekey)"
    ...
  - id: informational_delete
    label: "INFORMATIONAL DELETE"
    ...
```

The layers should reflect the actual protocol stack — for IKEv2 packets,
IP → UDP (500 or 4500) → IKEv2; for ESP packets, IP (or IP → UDP/4500
for NAT-T) → ESP → inner-IP → inner-payload.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three
search variations.

==========
