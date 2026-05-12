===== PROTOCOL · DTLS · Datagram Transport Layer Security =====

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
all distilled into one document. Surface-level "what is DTLS" content
already exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — Nagendra Modadugu and Eric Rescorla's 2004
  Stanford paper "The Design and Implementation of Datagram TLS", the
  motivation (real-time UDP apps wanted TLS-level security without TCP's
  head-of-line blocking), the slow IETF path from RFC 4347 (DTLS 1.0,
  2006) through RFC 6347 (DTLS 1.2, 2012) to RFC 9147 (DTLS 1.3, April
  2022), the WebRTC adoption (DTLS-SRTP), the CoAP-secure binding, and
  the QUIC moment when an entire generation of cryptographers decided
  to redesign rather than reuse.
- Mechanics deep enough that someone could implement a minimal DTLS
  client / server after reading: record layer with explicit sequence
  numbers, the cookie exchange for DoS protection, fragmentation +
  reassembly of handshake messages, the per-record AEAD with explicit
  nonce, replay protection windows, retransmission timers, connection
  IDs in DTLS 1.3 (§5.1), and the differences from TLS 1.3 that DTLS
  must inherit because UDP is lossy and reordered.
- Real failures and famous incidents — Lucky 13 reaching DTLS variants
  (Al Fardan + Paterson 2013), OpenSSL Heartbleed (CVE-2014-0160) also
  affecting DTLS, the Bleichenbacher-style attacks on DTLS 1.2 (the
  ROBOT-style padding-oracle reuse), the F5 BIG-IP DTLS CVE-2020-5902
  saga, GnuTLS DTLS implementation flaws, and the early-WebRTC
  ICE-DTLS race conditions that bit Chrome / Firefox.
- Connections to adjacent protocols — TLS (the obvious sibling, but
  explain WHY UDP needed a separate spec), UDP (the transport), WebRTC
  (DTLS-SRTP is the security model for every video call you do),
  SRTP (key derivation via DTLS handshake), CoAP (CoAPS is DTLS-bound),
  QUIC (the "what if DTLS were built into the transport" answer),
  OpenVPN, IKEv2, and Bluetooth Mesh.
- 2024–2026 developments — DTLS 1.3 finally shipping in major libraries
  (BoringSSL, OpenSSL 3.2+, wolfSSL, Mbed TLS 3.5+), DTLS-over-QUIC
  drafts, post-quantum DTLS 1.3 work with ML-KEM hybrid key exchange,
  Connection ID adoption for mobility, and Matter / IoT moving from
  DTLS 1.2 to DTLS 1.3 patterns.
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
USENIX, IACR ePrint), archive.org for older or dead links, and the
relevant standards body (IETF datatracker, the TLS WG, the UTA WG). Past
passes have left 121 `[needs source]` markers across 46 reports — please
try harder this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how DTLS relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
**Bluetooth/BLE**, NAT-traversal (STUN/TURN/ICE), **IPsec**, **WireGuard**
(both for VPN-protocol comparison), OSPF, mDNS/DNS-SD, Kerberos,
OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC), SAML, LDAP, SNMP,
**Matter+Thread** (DTLS in early CoAP-secure paths), PTP.

# Topic

The topic of this research is **DTLS — Datagram Transport Layer
Security** — the UDP-friendly cousin of TLS. DTLS exists because TLS
assumes a reliable, in-order byte stream (TCP) and breaks if records
are reordered or lost; DTLS adds explicit sequence numbers, handshake
message numbering and fragmentation, replay windows, cookie-based DoS
protection during handshake, and retransmission state machines to
preserve TLS's security properties over a lossy, reordering transport.

DTLS is now the second-most-deployed cryptographic protocol on Earth
after TLS itself — every WebRTC video call, every Matter-over-Wi-Fi
device exchange in early specs, every CoAPS sensor exchange, and the
fast path in many enterprise VPNs (Cisco AnyConnect, Pulse Secure,
F5, OpenVPN's `--proto udp`) all use DTLS records under the hood.

History anchors to verify:
- **Nagendra Modadugu and Eric Rescorla**, *The Design and Implementation
  of Datagram TLS*, **NDSS 2004** — the foundational paper
- **RFC 4347** — DTLS 1.0, April 2006
- **RFC 6347** — DTLS 1.2, January 2012 (still the most deployed version)
- **RFC 5763** — Framework for DTLS-SRTP (key derivation), 2010
- **RFC 5764** — DTLS Extension to Establish Keys for SRTP, 2010
- **RFC 7250** — Raw Public Keys in TLS/DTLS, 2014
- **RFC 7925** — TLS/DTLS profiles for IoT, 2016
- **RFC 9147** — DTLS 1.3, **April 2022** — the long-awaited modernization
  aligned with TLS 1.3
- 2023–2026 — DTLS 1.3 deployment in BoringSSL, OpenSSL 3.2+,
  wolfSSL, Mbed TLS, and the Connection ID adoption for mobility

Related protocols and standards likely connected to DTLS that you
should verify and expand on:

  - **TLS** (RFC 8446) — the obvious sibling; explain why UDP demanded
    a separate spec rather than "just running TLS over UDP"
  - **UDP** — the transport
  - **WebRTC** — every WebRTC connection on Earth uses DTLS for key
    exchange + DTLS-SRTP for media
  - **SRTP** — the media-encryption-after-DTLS-handshake
  - **CoAP** — CoAPS = CoAP over DTLS; explain the IoT pattern
  - **QUIC** — the explicit "what if DTLS were built into the transport"
    answer; the QUIC design history is rooted in DTLS frustrations
  - **OpenVPN** — `--proto udp` uses DTLS-style records
  - **IPsec / IKEv2** — alternative for UDP-secure VPN
  - **WireGuard** — the modern UDP-VPN alternative that explicitly
    doesn't use DTLS
  - **Bluetooth Mesh** — uses DTLS-derived primitives in the security
    subsystem
  - **Matter** — early CoAP-secure paths use DTLS

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., record layer, AEAD, explicit nonce, replay window, epoch,
  cookie exchange, HelloVerifyRequest, handshake message_seq,
  fragmentation offset, retransmission, MTU, path MTU, Connection ID,
  ClientHello, ServerHello, EncryptedExtensions, KeyShare, PSK,
  early data / 0-RTT, post-handshake auth, anti-replay, ChangeCipherSpec
  vs the DTLS 1.3 ACK)
- [ ] **≥4** dated entries on the history timeline (2004 → 2026)
- [ ] Full DTLS 1.3 record-layer format with bit widths AND DTLS 1.2
      handshake-message format with bit widths
- [ ] State machine (mermaid `stateDiagram-v2`) — DTLS handshake state
      machine (Initial → Wait_HelloVerifyRequest → Wait_ServerHello →
      Wait_EncryptedExtensions → ... → Connected → Closed)
- [ ] A sequence diagram of the DTLS 1.3 handshake including the
      cookie exchange (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (every WebRTC stack: Chrome / Firefox / Safari / Zoom /
      Meet / Teams / Discord — billions of streams/day; Cisco
      AnyConnect; OpenVPN; F5 BIG-IP; Matter-over-Wi-Fi pairing;
      Cloudflare WARP)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Eric Rescorla, Nagendra Modadugu, Hannes Tschofenig, Sean Turner,
      Hanno Becker)
- [ ] **≥3** RFCs with number, year, status, and notable-section
      pointers (RFC 9147 DTLS 1.3, RFC 6347 DTLS 1.2, RFC 5764
      DTLS-SRTP, RFC 7925 IoT profiles)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (Lucky 13 in DTLS variant, OpenSSL Heartbleed
      CVE-2014-0160 affecting DTLS, F5 CVE-2020-5902 DTLS path, GnuTLS
      DTLS flaws, ICE-DTLS races in early WebRTC)
- [ ] **≥3** fun facts / anecdotes with sources (the Stanford-2004
      paper's "we just changed three lines of OpenSSL and shipped it"
      energy, Eric Rescorla's IETF chairmanship arc, the DTLS 1.3
      decade-long bake, the QUIC team's "we wanted DTLS for HTTP and
      gave up" beat, the Connection ID Aha moment)
- [ ] **≥3** practical pitfalls with concrete tuning advice (MTU and
      path MTU discovery for fragmented handshakes, retransmission
      timer tuning, replay window sizing, cookie-rotation, anti-DoS,
      the OpenSSL `-mtu` flag, Wireshark DTLS dissection caveats)
- [ ] **≥3** Wireshark / capture-tool filter examples (`dtls`,
      `dtls.handshake.type == 1`, `dtls.epoch`,
      `udp.port == 5061 && dtls`)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (DTLS 1.3 in BoringSSL master, OpenSSL 3.2 DTLS 1.3 GA, wolfSSL
      DTLS 1.3 stable, Mbed TLS 3.5+ DTLS 1.3, draft-tls-dtls-quic
      progress, ML-KEM-hybrid drafts)
- [ ] **≥1** 2025–2026 frontier development (post-quantum DTLS 1.3
      hybrid, DTLS-over-QUIC research, Connection ID mobility shipping,
      Bluetooth Mesh transitioning to DTLS-1.3-derived security)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (DTLS 1.3 handshake +
      first encrypted application record)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* DTLS makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: UDP datagram, MTU, fragmentation,
record layer, handshake vs record, AEAD (AES-GCM, ChaCha20-Poly1305),
explicit vs implicit nonce, replay window, epoch, sequence number,
TLS handshake (briefly — assume the reader has skimmed TLS 1.3),
PSK, ECDHE, X.509 certificate, certificate chain, SNI, ALPN, 0-RTT
/ early data, post-quantum key exchange, ML-KEM (Kyber), hybrid key
share, Connection ID, anti-amplification, cookie exchange,
HelloVerifyRequest (DTLS 1.2) vs HelloRetryRequest (DTLS 1.3), KeyUpdate.

## History and story

The chronological narrative — the 2004 Stanford paper by Nagendra
Modadugu and Eric Rescorla, written because Cisco / VoIP / OpenVPN
deployers wanted TLS over UDP and had been shoehorning TLS over
TLS-over-stunnel hacks. The IETF TLS WG's slow path: RFC 4347 (DTLS
1.0, April 2006) shipped on the back of TLS 1.1, then RFC 6347 (DTLS
1.2, January 2012). Real-world adoption ramped in 2011–2014 as
WebRTC made DTLS-SRTP the standard (RFC 5763 + 5764). The 2014
Heartbleed catastrophe affected DTLS too because OpenSSL shared the
heartbeat code path. The TLS 1.3 process from 2014–2018 raised the
question "what about DTLS 1.3?" early, but the working group
explicitly held DTLS back to avoid blocking TLS 1.3; DTLS 1.3 took
**four more years**, finally landing as RFC 9147 in **April 2022**.
DTLS 1.3 then took another **18 months** to reach production in
mainstream libraries: BoringSSL added it 2023, OpenSSL shipped it
in 3.2 (December 2023), wolfSSL stabilized DTLS 1.3 in 2023, Mbed
TLS 3.5+ (2024). The QUIC story is the relevant counterpoint: the
QUIC working group considered building on DTLS and explicitly
rejected it, choosing to integrate cryptography into the transport
itself. Today (2026) the headline shift is DTLS 1.3 deployment +
Connection IDs enabling mobility + the ML-KEM hybrid drafts for
post-quantum.

Version-history table with what changed in each release.

## How it actually works

Cover the full mechanics.

### Record layer

- Format: ContentType (1B) + Version (2B) + Epoch (2B) + Sequence
  Number (6B, DTLS 1.2; mostly implicit-encrypted in DTLS 1.3 with a
  16-bit visible portion) + Length (2B) + Encrypted Payload + AEAD tag
- AEAD construction: explicit nonce (DTLS 1.2) vs derived nonce (DTLS
  1.3, XORed from sequence number)
- Replay protection: sliding window of received sequence numbers per
  epoch (size 32, 64, or 128 typical)
- Epoch increments on each KeyUpdate / new handshake

### Handshake state machine + reliable delivery

- Each handshake message gets a `message_seq` field
- Fragmentation: a single handshake message can span multiple records
  if larger than path MTU; fragments carry `fragment_offset` +
  `fragment_length`
- Retransmission: timer-based, doubling on each retry (RFC 9147 §5.8.1)
- DTLS 1.3 introduces an ACK message replacing 1.2's
  ChangeCipherSpec-based plumbing

### Cookie exchange (anti-DoS)

- ClientHello → server replies with **HelloVerifyRequest (1.2)** or
  **HelloRetryRequest with cookie (1.3)**
- Client re-sends ClientHello with the cookie
- Prevents amplification / source-address spoofing attacks

### Connection ID (DTLS 1.3 §5.1)

- Optional explicit ID in the record header; lets a peer migrate
  IP/port without renegotiation (mobility, NAT rebinding)
- Negotiated in ClientHello / ServerHello via the `connection_id`
  extension

### Security model

- Same cipher suites as TLS 1.3 (TLS_AES_128_GCM_SHA256,
  TLS_CHACHA20_POLY1305_SHA256, TLS_AES_256_GCM_SHA384)
- Same key schedule (HKDF-Expand-Label, traffic secrets)
- Same authentication options (certificate, PSK, raw public key
  per RFC 7250)

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of DTLS 1.3 handshake with cookie exchange
2. State diagram of the DTLS 1.3 handshake state machine
3. DTLS 1.3 record-layer + handshake-message PDU bit layout (table form)

## Deep connections to other protocols

Cover each related protocol in the topic list. Pay particular attention to:
- **TLS** — explain the precise differences: explicit sequence numbers,
  cookie exchange, handshake reliability, no ChangeCipherSpec. Stress
  that DTLS is *not* "TLS over UDP" — naively running TLS over UDP
  fails because TLS's MAC depends on implicit ordering and TLS has no
  retransmission.
- **UDP** — DTLS lives at OSI layer 5/6 on top of UDP; explain MTU
  interaction, fragmentation, and the loss/reorder model.
- **WebRTC** — every browser-to-browser WebRTC call uses DTLS-SRTP
  (DTLS handshake authenticates and derives keys for SRTP media).
  Explain the ICE → DTLS → SRTP flow.
- **SRTP** — DTLS-SRTP (RFC 5764) is the most-deployed real use of
  DTLS by stream count.
- **CoAP** — CoAPS = CoAP over DTLS, the IoT-secure pattern; explain
  the RFC 7925 profile and the Matter / IoT context.
- **QUIC** — the "successor" if you squint; QUIC integrates the
  cryptography into the transport rather than sitting above UDP.
  Explain why the QUIC team chose to use the TLS 1.3 handshake state
  machine but a custom record layer.
- **OpenVPN** — `--proto udp` uses DTLS-style records; Cisco AnyConnect
  uses DTLS as the fast path with TLS as the control fallback.
- **IPsec / IKEv2 / WireGuard** — alternative UDP-secure designs.
  Explain why WireGuard explicitly avoided DTLS (Trevor Perrin's Noise
  protocol framework, simpler key schedule).
- **Bluetooth Mesh** — uses DTLS-derived AEAD primitives in its
  security subsystem.

## Real-world deployment

Major implementations — **OpenSSL** (DTLS 1.3 in 3.2+, December 2023),
**BoringSSL** (Google, DTLS 1.3 stable 2023), **wolfSSL** (DTLS 1.3
GA), **Mbed TLS** (Arm-stewarded, DTLS 1.3 in 3.5+), **GnuTLS**,
**libDTLS** (the WolfSSL-managed lightweight stack), **tinyDTLS** (the
IoT-friendly stack). Named deployments: every WebRTC stack in production
(Zoom, Google Meet, Microsoft Teams, Discord, Slack Huddles, FaceTime,
Jitsi) — collectively billions of streams per day; Cisco AnyConnect
VPN (massive enterprise footprint); Cloudflare WARP secondary mode;
F5 BIG-IP and Citrix Gateway; OpenVPN's `--proto udp`; Matter-over-Wi-Fi
pairing exchanges in CoAPS contexts; the entire CoAPS IoT footprint.
Real numbers where they're published.

## Failure modes and famous incidents

Named incidents:
- **OpenSSL Heartbleed** (CVE-2014-0160, April 2014) — the DTLS heartbeat
  variant of the bug let attackers leak memory over DTLS sessions; not
  the main attack vector but real
- **Lucky 13 in DTLS** (Al Fardan + Paterson 2013) — the padding-oracle
  timing attack on CBC-mode ciphers reached DTLS variants in OpenSSL
  and GnuTLS
- **Bleichenbacher / ROBOT-style attacks** on DTLS 1.2 implementations
  (2017–2018)
- **F5 BIG-IP DTLS CVE-2020-5902** — the TMUI exploit chain that
  included DTLS-handshake paths
- **GnuTLS DTLS flaws** — multiple CVEs over the years
  (e.g., CVE-2014-0092 affected both)
- **ICE-DTLS race conditions** in early WebRTC (2014–2016) — Chrome
  and Firefox shipped fixes for cases where ICE candidate changes
  during DTLS handshake caused session corruption

Each told as setup → mistake → consequence → resolution.

## Fun facts and anecdotes

The 2004 Stanford paper's pragmatic "we just changed three lines of
OpenSSL and shipped it" energy, Eric Rescorla's parallel career as
TLS 1.3 editor (he is the most prolific TLS RFC author by a wide
margin), the **10-year gap** between TLS 1.3 (RFC 8446, August 2018)
and DTLS 1.3 (RFC 9147, April 2022) — a four-year DTLS-1.3 process
even after TLS 1.3 finalized, the QUIC working group's explicit "we
wanted DTLS but couldn't" beat, the Connection ID feature being
DTLS's only meaningful improvement over QUIC for mobile carriers, the
fact that DTLS still has no widely-deployed "0-RTT data" mode
comparable to TLS 1.3's because real-world DTLS apps are mostly key
exchange for SRTP and don't need 0-RTT for application data.

## Practical wisdom

What an engineer actually needs to know to use DTLS well:
- **MTU**: handshake messages are often larger than typical 1500-byte
  Ethernet MTU, especially with PQ key shares — fragmentation is
  mandatory; OpenSSL's `-mtu` flag, mbedtls's `MBEDTLS_SSL_OUT_CONTENT_LEN`
- **Retransmission timer**: start at 1 second, double up to ~60 seconds
  (RFC 9147 §5.8.1); tune lower for in-datacenter use, higher for
  cellular IoT
- **Replay window**: 64 entries is the default in OpenSSL; size up
  for high-rate flows
- **Cookie rotation**: short-lived secret keys for the cookie HMAC;
  rotate every few minutes to bound DoS state
- **Connection ID**: enable it for mobile clients; massive UX win on
  cellular ↔ Wi-Fi transitions
- **AEAD-only**: in DTLS 1.3, CBC-mode is gone; if you're still on
  DTLS 1.2, force AEAD ciphers and avoid Lucky-13-vulnerable suites
- **Anti-amplification**: in DTLS 1.3, server response is limited to
  3× the client's initial flight until the cookie round-trip completes
- **Debug**: capture with Wireshark, set the SSLKEYLOGFILE env var
  for OpenSSL / BoringSSL clients to decrypt in-tree

## Pioneers and key contributors

- **Eric Rescorla** — co-author of the 2004 paper, lead editor of
  TLS 1.3 (RFC 8446) and DTLS 1.3 (RFC 9147), former Mozilla CTO,
  now at Anchor / startup, IETF TLS WG chair for many years
- **Nagendra Modadugu** — co-author of the 2004 Stanford paper,
  Google engineer
- **Hannes Tschofenig** — IETF veteran, EMU / Smart Object work,
  DTLS IoT profiles (RFC 7925)
- **Sean Turner** — IETF chair / WG chair, helped land DTLS 1.3
- **Hanno Becker** — Arm cryptography engineer, DTLS 1.3 in Mbed TLS

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- **Specifications** — RFC 9147 (DTLS 1.3 — note §4 record layer, §5
  handshake, §5.1 Connection ID, §5.8 retransmission); RFC 6347 (DTLS
  1.2, still operationally relevant); RFC 5763/5764 (DTLS-SRTP);
  RFC 7925 (IoT profiles); RFC 7250 (Raw Public Keys); RFC 9001 (QUIC
  uses TLS, the explicit alternative)
- **Foundational paper** — Modadugu & Rescorla, *The Design and
  Implementation of Datagram TLS*, NDSS 2004
- **Books** — *Bulletproof TLS and PKI* by Ivan Ristić (2022 ed.), the
  DTLS chapter; *The Illustrated TLS Connection* (Michael Driscoll,
  online, current to 2024); *Network Security with OpenSSL* (Viega,
  Messier, Chandra — older but still the OpenSSL DTLS reference)
- **Academic papers** — Lucky 13 (Al Fardan & Paterson, S&P 2013), the
  Heartbleed analysis (Durumeric et al., IMC 2014), the BLEDOM /
  DROWN / ROBOT family extensions to DTLS where applicable
- **Engineering blog posts** — Cloudflare blog on TLS / DTLS / QUIC
  (Nick Sullivan, Daniel Stenberg), Mozilla Hacks DTLS posts, the
  Filippo Valsorda QUIC vs DTLS commentary, the Google Security blog
  on BoringSSL DTLS 1.3
- **YouTube** — IETF TLS WG meetings (recorded), Real World Crypto talks
  on DTLS 1.3 (2022–2024), Cloudflare's Crypto Week talks
- **Podcasts** — Security Now (DTLS 1.3 episodes), Cloudflare's
  podcast on PQ TLS / DTLS
- **Hands-on tools** — `openssl s_client -dtls1_3 -connect host:port`,
  Wireshark with DTLS dissector, `socat` for DTLS tunnels, BoringSSL
  `bssl` CLI, mbedtls's `dtls_client` / `dtls_server` examples

## Where things are heading (2025–2026 frontier)

DTLS 1.3 finally shipping in major libraries (BoringSSL, OpenSSL
3.2+, wolfSSL, mbedtls), DTLS-over-QUIC drafts (yes, that's a real
draft — using QUIC frames to carry DTLS records for hybrid
deployments), post-quantum DTLS 1.3 hybrid drafts (ML-KEM-768 +
X25519 key share, mirroring the TLS work), Connection ID adoption
for cellular ↔ Wi-Fi mobility, Bluetooth Mesh transitioning to
DTLS-1.3-derived security primitives, and the open question of
whether DTLS 1.3 will ever supplant DTLS 1.2 in IoT firmware where
flash budgets are tight.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook (the WebRTC angle — "every video call you
  ever made started with a DTLS handshake")
- A striking statistic that captures importance, with source
- A "pause and think" moment (e.g., "DTLS 1.3 took 10 years longer
  than TLS 1.3 to land, and that's because UDP is hard")
- A failure-story arc (Heartbleed in DTLS, or the F5 CVE-2020-5902)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: dtls
name: Datagram Transport Layer Security
abbreviation: DTLS
categoryId: utilities-security
port: <none — typically uses the same UDP port as the application protocol
       (e.g., 5061 for SIP-over-DTLS, 5684 for CoAPS, dynamic for WebRTC)>
year: 2006 (RFC 4347 DTLS 1.0); 2022 (RFC 9147 DTLS 1.3)
rfc: RFC 9147
standardsBody: ietf
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items (WebRTC media key exchange, CoAPS IoT,
          OpenVPN UDP fast path, Cisco AnyConnect, Bluetooth Mesh
          security primitives, Matter-over-Wi-Fi early paths)
performance: { latency, throughput, overhead }
connections: [tls, udp, webrtc, srtp, coap, quic, matter-thread, bluetooth]
links: { wikipedia, rfc (RFC 9147), official (datatracker TLS WG) }
image: <Wikimedia URL of an OSI-stack diagram with DTLS highlighted,
        or the IETF TLS WG logo>
```

### A.2 Header / wire-format layout

Provide BOTH:
- **DTLS 1.3 record-layer** layout (Unified Header w/ Connection ID +
  Encrypted Sequence Number + Length + Encrypted Payload + AEAD tag,
  with bit widths)
- **DTLS 1.2 record-layer** layout (ContentType + Version + Epoch +
  Sequence Number + Length + Payload, with bit widths) for comparison
- **Handshake message** layout (HandshakeType + Length + MessageSeq
  + FragmentOffset + FragmentLength + Body)

### A.3 State machine

DTLS 1.3 handshake state machine in mermaid `stateDiagram-v2`:
Start → Wait_HelloRetryRequest → Wait_ServerHello → Wait_EE →
Wait_CertCR → Wait_Cert → Wait_CV → Wait_Finished → Connected →
KeyUpdate → Closed.

### A.4 Code example

- `python` — using `cryptography` + `socket` or `dtlssocket` to do a
  DTLS handshake; or using `aiocoap` for CoAPS
- `javascript` — Node's `dgram` + a DTLS wrapper (or the
  `node-dtls-client` library), plus a browser WebRTC handshake snippet
  to show the implicit DTLS use
- `cli` — `openssl s_client -dtls1_3 -connect host:5684`,
  `openssl s_server -dtls1_3 -cert ... -key ... -accept 5684`
- `wire` — sectioned dump: ClientHello (initial), HelloRetryRequest
  with cookie, ClientHello (with cookie), ServerHello,
  EncryptedExtensions, Certificate, CertificateVerify, Finished,
  first ApplicationData record

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. DTLS 1.3 in OpenSSL 3.2 (Dec 2023),
DTLS 1.3 in BoringSSL master (2023), wolfSSL DTLS 1.3 GA (2023),
Mbed TLS 3.5+ DTLS 1.3 (2024), the ML-KEM hybrid drafts progress,
Connection ID adoption telemetry from Cloudflare / Google.

### A.6 Real-world deployments

≥5 named: WebRTC (Chrome / Firefox / Safari / every video-call
provider), Cisco AnyConnect, OpenVPN UDP fast path, F5 BIG-IP DTLS
VPN, Cloudflare WARP, Matter-over-Wi-Fi early paths, CoAPS in
industrial IoT (Siemens / Bosch / Honeywell).

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark hints ≥3

```
- filter: "dtls"
  description: All DTLS traffic
- filter: "dtls.handshake.type == 1"
  description: ClientHello messages
- filter: "dtls.handshake.cookie"
  description: Cookies in HelloVerifyRequest (DTLS 1.2) or HelloRetryRequest (DTLS 1.3)
- filter: "dtls.epoch > 0"
  description: Encrypted application-data records
- filter: "udp.port == 5684 && dtls"
  description: CoAPS traffic
```

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Eric Rescorla with full bio (Stanford → Mozilla → Anchor,
TLS 1.3 + DTLS 1.3 editor, IETF TLS WG chair).

### A.12 RFC records ≥3

RFC 9147 (DTLS 1.3, 2022, Proposed Standard), RFC 6347 (DTLS 1.2,
2012, Proposed Standard), RFC 5764 (DTLS-SRTP, 2010), RFC 7925 (IoT
profiles, 2016).

### A.13 New glossary concepts

≥10 — record layer, AEAD, epoch, sequence number, cookie exchange,
HelloVerifyRequest, HelloRetryRequest, fragmentation offset,
retransmission timer, replay window, Connection ID, ML-KEM, hybrid
key share.

### A.14 Frontier entry

DTLS 1.3 + Post-Quantum Hybrid + Connection ID Mobility as a
combined frontier entry with metrics and sources.

### A.15 Journey suggestion

"How your video call gets encrypted" — a 4–5 step journey covering
ICE candidate selection → DTLS handshake → SRTP key derivation →
media flow.

### A.16 Comparison pair

"DTLS vs TLS" (UDP vs TCP framing) and "DTLS vs QUIC" (above-UDP
crypto vs in-transport crypto) are the two obvious ones.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "Stanford 2004, three lines of OpenSSL" (Modadugu +
  Rescorla origin)
- Timeline: 2004 → 2006 → 2010 (DTLS-SRTP) → 2012 → 2014 (Heartbleed)
  → 2018 (TLS 1.3) → 2022 (DTLS 1.3) → 2024 (PQ drafts)
- Callout: "Why DTLS waited 10 years longer than TLS 1.3"
- Image: Wikimedia of Eric Rescorla or the IETF TLS WG meeting
- Diagram: DTLS-SRTP flow in WebRTC
- Pioneers section embedded: Rescorla + Modadugu + Tschofenig
  mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (none likely apply directly) + new
proposals. Strong candidates for new outage / incident records:
- OpenSSL Heartbleed DTLS variant (CVE-2014-0160) — software-bug
- F5 BIG-IP DTLS CVE-2020-5902 — security
- Early-WebRTC ICE-DTLS race conditions (2014–2016) — protocol-design

### A.19 Embedded media

Highest-signal: Real World Crypto 2023 talk on DTLS 1.3, Cloudflare's
PQ-TLS / PQ-DTLS deep-dive video, the Filippo Valsorda interview
on QUIC vs DTLS, and an interactive playground (the
*Illustrated TLS Connection* DTLS section if it exists, otherwise
the OpenSSL `s_client -dtls1_3` CLI tutorial).

### A.20 Prerequisites

```
concepts: [packet, datagram, encryption, public-key-crypto, handshake, mtu, aead]
protocols: [udp, tls, webrtc, coap]
```

### A.21 Name highlight

```
"[D]atagram [T]ransport [L]ayer [S]ecurity"  (DTLS)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for DTLS 1.3 handshake with cookie
exchange. 10–14 step annotations; explain *what* each message is and
*why* the reader is seeing it (initial ClientHello, anti-DoS cookie
round-trip via HelloRetryRequest, second ClientHello, ServerHello +
EncryptedExtensions, Certificate + CertificateVerify, Finished,
first application data record).

### A.23 Category placement

Place in **utilities-security** (alongside TLS, SSH). No new category
needed — DTLS sits squarely in the cryptographic-transport family.

---

# Appendix B — Simulator step list

Author **one** simulation: **DTLS 1.3 handshake including cookie
exchange + first encrypted application record**. This makes the
handshake-reliability story concrete.

```
title: "DTLS 1.3 Handshake with Cookie Exchange"
description: "Watch a client establish a DTLS 1.3 session with a
              server, including the anti-DoS cookie round-trip, and
              send its first encrypted record."
actors:
  - { id: "client", label: "DTLS Client", icon: "laptop", position: "left" }
  - { id: "server", label: "DTLS Server", icon: "server", position: "right" }
userInputs:
  - { id: "mtu", label: "Path MTU (bytes)", type: "number", defaultValue: "1400" }
  - { id: "cipher", label: "Cipher suite", type: "select",
      options: ["TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256"],
      defaultValue: "TLS_AES_128_GCM_SHA256" }
steps:
  - id: ch1
    label: "ClientHello (initial)"
    description: "Client sends its first ClientHello with no cookie. Carries key shares (X25519, ML-KEM-768 hybrid), supported groups, signature algorithms."
    fromActor: client
    toActor: server
    duration: 1100
    highlight: [KeyShare, CipherSuites, SignatureAlgorithms]
    layers:
      - UDP: { sport: 50000, dport: 5684 }
      - DTLS Record: { ContentType: "Handshake", Epoch: 0, SeqNo: 0 }
      - Handshake: { Type: "ClientHello", MessageSeq: 0 }
  - id: hrr
    label: "HelloRetryRequest with cookie"
    description: "Server replies with a HelloRetryRequest carrying a cookie. This proves to the server that the client can receive at its claimed IP — anti-amplification / anti-spoofing."
    fromActor: server
    toActor: client
    duration: 1000
    highlight: [Cookie, Extensions]
    layers:
      - UDP: { sport: 5684, dport: 50000 }
      - DTLS Record: { ContentType: "Handshake", Epoch: 0, SeqNo: 0 }
      - Handshake: { Type: "HelloRetryRequest", MessageSeq: 1, Cookie: "0x...32 bytes" }
  - id: ch2
    label: "ClientHello (with cookie)"
    description: "Client re-sends ClientHello echoing the cookie. Server can now allocate handshake state without DoS risk."
    fromActor: client
    toActor: server
    duration: 1100
    highlight: [Cookie, KeyShare]
    layers:
      - DTLS Record: { ContentType: "Handshake", Epoch: 0, SeqNo: 1 }
      - Handshake: { Type: "ClientHello", MessageSeq: 2, Cookie: "echoed" }
  - id: sh
    label: "ServerHello + EncryptedExtensions"
    description: "Server picks the cipher suite, completes the key exchange, sends ServerHello plus encrypted EncryptedExtensions, Certificate, CertificateVerify, Finished — possibly fragmented over multiple records to fit MTU."
    fromActor: server
    toActor: client
    duration: 1500
    highlight: [ServerKeyShare, Certificate, Finished]
    layers:
      - DTLS Record: { ContentType: "Handshake", Epoch: 0, SeqNo: 1, Fragmented: true }
      - Handshake: { Type: "ServerHello → Finished", MessageSeq: "3..7" }
  - id: cliFinished
    label: "Client Finished + ACK"
    description: "Client verifies the server's Finished, sends its own Certificate (if requested), CertificateVerify, and Finished. DTLS 1.3 introduces an explicit ACK record covering received handshake messages."
    fromActor: client
    toActor: server
    duration: 1300
    highlight: [Finished, ACK]
    layers:
      - DTLS Record: { ContentType: "Handshake", Epoch: 2, SeqNo: 0 }
      - Handshake: { Type: "Finished", MessageSeq: 8 }
      - ACK: { covers: "3..7" }
  - id: appdata
    label: "First Application Data"
    description: "Client sends its first encrypted application record under the new traffic keys. Sequence number lives in the encrypted record header; replay window protects against retransmits."
    fromActor: client
    toActor: server
    duration: 900
    highlight: [Epoch, EncryptedPayload]
    layers:
      - DTLS Record: { ContentType: "ApplicationData", Epoch: 3, SeqNo: 0 }
      - Payload: "GET /sensor/temp"
  - id: keyupdate
    label: "KeyUpdate"
    description: "Some time later, client sends a KeyUpdate. Both sides rotate traffic keys; epoch increments. Replay window resets."
    fromActor: client
    toActor: server
    duration: 800
    highlight: [Epoch]
    layers:
      - DTLS Record: { ContentType: "Handshake", Epoch: 3, SeqNo: 12 }
      - Handshake: { Type: "KeyUpdate", MessageSeq: 9 }
  - id: close
    label: "close_notify"
    description: "Either peer sends close_notify alert; session ends cleanly."
    fromActor: client
    toActor: server
    duration: 700
    highlight: [Alert]
    layers:
      - DTLS Record: { ContentType: "Alert", Epoch: 4, SeqNo: 0 }
      - Alert: { Level: "warning", Description: "close_notify (0)" }
```

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
