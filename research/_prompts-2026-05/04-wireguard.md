===== PROTOCOL · WIREGUARD · WireGuard =====

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
distilled into one document. Surface-level "what is WireGuard" content
already exists everywhere — what I need from you is depth, story, current
detail, and connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — Jason A. Donenfeld's 2015 first release as a
  one-developer side project, the famous "tiny enough to audit in a
  weekend" simplicity claim with the ~4,000-line Linux kernel module,
  Linus Torvalds's 2018 LKML quote ("can I just once again state my
  love for it?"), the kernel merge into mainline Linux 5.6 in March
  2020, the deliberate choice not to pursue an IETF RFC (Donenfeld has
  been vocal about why), the explosion of commercial adoption from
  ~2019 (Mullvad, then Tailscale, NordVPN's NordLynx, Cloudflare WARP),
  the 2022 Rosenpass post-quantum companion daemon, the 2023 AmneziaWG
  fork built to evade DPI in Russia and Iran.
- Mechanics deep enough that someone could re-implement a minimal
  WireGuard peer after reading: the four message types (Handshake
  Initiation, Handshake Response, Cookie Reply, Transport Data), the
  Noise_IK handshake on Curve25519 + ChaCha20-Poly1305 + BLAKE2s, the
  AllowedIPs / cryptokey-routing model, the 1-RTT handshake, the
  silent-on-unauthorized-packets philosophy, the rekey timers
  (REKEY_AFTER_TIME / REJECT_AFTER_TIME), the per-peer state machine.
- Real failures and famous incidents — relatively clean compared to
  IPsec, but: the early "no dynamic IPs / no hostname-on-Endpoint"
  rough edges, the 2018 NDSS-published formal analysis (Dowling &
  Paterson) that found and fixed minor identity-hiding gaps, the
  Wintun Windows driver crashes circa 2020–2021, the early Tailscale
  cryptokey-routing edge cases, the AmneziaWG / Russia censorship saga
  (the protocol is so distinctive on the wire that it's trivially
  fingerprintable), the Rosenpass deployment learnings.
- Connections to adjacent protocols — IPsec (the explicit competitor —
  write the comparison strongly and fairly), TLS (different model;
  WireGuard runs over UDP and does its own crypto), QUIC (different
  layer; compare), UDP (transport), IP (what gets tunneled),
  NAT-traversal (Tailscale's DERP and STUN-like ICE for mesh setups),
  Noise Protocol Framework (the framework WireGuard's handshake comes
  from).
- 2024–2026 developments — Rosenpass (the PQ companion that adds a
  ML-KEM handshake on top of WireGuard), AmneziaWG adoption growth,
  Tailscale's continued scale, Cloudflare WARP's daily active device
  count, ChaCha20 vs AEGIS proposals, MASQUE comparisons, NordLynx
  scale numbers, the absence of an IETF RFC continuing to be a
  conscious design choice, the WireGuard-rs and BoringTun Rust
  rewrites.
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
Xplore, ACM DL, USENIX, NDSS, Eurocrypt), archive.org for older or
dead links, the WireGuard website (wireguard.com), the lists.zx2c4.com
mailing-list archives, and the Tailscale / Cloudflare engineering blogs.
Past passes have left 121 `[needs source]` markers across 46 reports —
please try harder this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how WireGuard relates
to these — what it depends on, what depends on it, what it competes
with, what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), **IPsec**, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **WireGuard** — Jason A. Donenfeld's
minimal-by-design VPN protocol, first released in 2015 and now the
default tunneling protocol of choice for most new deployments. WireGuard
sits in deliberate opposition to IPsec's complexity: a single message
format, four packet types, a single Noise-based handshake, a single
modern ciphersuite (ChaCha20-Poly1305 + Curve25519 + BLAKE2s), and a
kernel module famously short enough to audit in a weekend (~4,000 lines
versus hundreds of thousands for IPsec/IKEv2 stacks). Please structure
the report to tell that story honestly while also covering the
mechanics rigorously, the trade-offs (no algorithmic agility, no
dynamic identity), and the modern PQ extension story.

WireGuard's specification is unusual — there is no IETF RFC, by design.
The normative spec is Donenfeld's 2017 NDSS paper *"WireGuard: Next
Generation Kernel Network Tunnel"* plus the live documentation at
wireguard.com. Linus Torvalds merged WireGuard into Linux mainline
5.6 in March 2020 after Donenfeld's full rewrite using the kernel's
Zinc crypto library (then later switching to the mainline kernel
crypto API as a compromise). The 2024–2026 frontier is Rosenpass
(post-quantum companion daemon, Andreas Hülsing et al.), the
AmneziaWG fork (DPI-evading variant), and the ongoing Cloudflare
WARP / Tailscale scale story.

Related protocols and standards likely connected to WireGuard that
you should verify and expand on:

  - **IPsec** — the explicit competitor; write a strong fair comparison
  - **TLS** — different model (per-byte-stream vs per-packet); explain
    why "TLS-VPN" exists and where it sits
  - **QUIC** — different layer (QUIC is per-stream; WireGuard is
    per-packet); the MASQUE comparison
  - **UDP** — WireGuard's only transport
  - **IP / IPv4 / IPv6** — what gets tunneled
  - **NAT-traversal (STUN/TURN/ICE)** — Tailscale uses ICE-like logic
    on top of WireGuard for mesh; Donenfeld's WireGuard alone doesn't
    do NAT traversal
  - **Noise Protocol Framework** — the cryptographic framework
    WireGuard's handshake (Noise_IK) is built from; Trevor Perrin's
    work
  - **Curve25519 / ChaCha20-Poly1305 / BLAKE2s** — Daniel J.
    Bernstein's crypto choices that WireGuard inherits
  - **ML-KEM / Kyber (Rosenpass)** — post-quantum companion
  - **OpenVPN** — the previous-generation TLS-based VPN that WireGuard
    largely displaced for self-hosted use

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., Noise Protocol Framework, Noise_IK, Curve25519, ChaCha20,
  Poly1305, ChaCha20-Poly1305, BLAKE2s, HKDF, cryptokey routing,
  AllowedIPs, Endpoint, peer, preshared key, PersistentKeepalive,
  REKEY_AFTER_MESSAGES, REKEY_AFTER_TIME, REJECT_AFTER_MESSAGES,
  REJECT_AFTER_TIME, MAC1, MAC2, cookie, formally-verified)
- [ ] **≥4** dated entries on the history timeline
  (2015 first release → 2017 NDSS paper → 2018 Torvalds endorsement →
  2020 Linux 5.6 mainline → 2022 Rosenpass v1 → 2023 AmneziaWG →
  2024–2026 commercial scale)
- [ ] Full WireGuard message-format layout with bit widths for all
      four message types (Handshake Initiation, Handshake Response,
      Cookie Reply, Transport Data)
- [ ] WireGuard peer state machine (mermaid `stateDiagram-v2`):
      Closed → HandshakeInitSent → HandshakeRespReceived → Established
      → Rekey → Closed, with cookie-reply branch
- [ ] A sequence diagram of a full WireGuard handshake + first
      Transport Data + rekey
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (Tailscale, Mullvad, NordVPN NordLynx, Cloudflare WARP
      with daily-active-device numbers, IVPN, ProtonVPN, OPNsense /
      pfSense WireGuard backend, Mozilla VPN powered by Mullvad,
      WireGuard built into Linux/Android/macOS/iOS/Windows native, the
      Headscale self-hosted Tailscale-coordinator)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Jason A. Donenfeld, Daniel J. Bernstein, Trevor Perrin, David
      Crawshaw + Brad Fitzpatrick at Tailscale, Maya Kaczorowski,
      Andreas Hülsing for Rosenpass)
- [ ] **≥3** specs / papers with title, year, and notable-section
      pointers (Donenfeld 2017 NDSS paper, Dowling & Paterson 2018
      formal analysis, the Tamarin-verified handshake paper, the
      Rosenpass whitepaper)
- [ ] **≥2** named failure incidents / rough edges with year, root
      cause (the early no-dynamic-IPs / no-hostname-Endpoint rough
      edges, Wintun driver Windows BSOD class circa 2020–2021, the
      Tailscale early cryptokey-routing edge cases, the AmneziaWG
      saga as a "the wire format is too distinctive" lesson)
- [ ] **≥3** fun facts / anecdotes with sources (the ~4,000-line
      kernel module compared to OpenVPN ~600K, Torvalds's quote in
      full, Donenfeld's pgpkey-as-self-photo joke, the
      cryptokey-routing slogan, the "no algorithmic agility" stance,
      Rosenpass naming origin)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (AllowedIPs as routing-table-cum-ACL trap, PersistentKeepalive
      defaults, MTU tuning — 1420 default is the famous correct
      answer for typical Ethernet, kernel-vs-userspace performance,
      Windows Wintun vs WinTUN, peer config rotation moves)
- [ ] **≥3** Wireshark / capture-tool filter examples
      (`wg` (recent Wireshark dissector), `udp.port == 51820`, plus
      a note that beyond the message-type byte WireGuard payloads
      are fully encrypted and indistinguishable)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Rosenpass 1.0, AmneziaWG growth, Cloudflare WARP scale, NordVPN
      NordLynx scale, the BoringTun / wireguard-go updates, Tailscale
      growth)
- [ ] **≥1** 2025–2026 frontier development (Rosenpass adoption,
      AmneziaWG / DPI-evasion, AEGIS-256 evaluation, MASQUE
      comparison)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (the WireGuard 1-RTT
      handshake plus transport data)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* WireGuard makes
sense. For each: a one- or two-sentence definition and a link to a
clear authoritative explainer. Cover: UDP, IP, public-key cryptography,
Diffie-Hellman, Curve25519 / X25519, AEAD, ChaCha20-Poly1305, hash
function, BLAKE2s, HKDF, Noise Protocol Framework, Noise_IK pattern,
1-RTT, 0-RTT, perfect forward secrecy (PFS), pre-shared key (PSK),
TUN device, kernel module vs userspace, MTU, NAT.

## History and story

Origin — Jason A. Donenfeld first released WireGuard in 2015 as a
side project after struggling with IPsec and OpenVPN. The 2016
mailing-list traffic where the design solidified. The August 2017
NDSS paper "WireGuard: Next Generation Kernel Network Tunnel" — the
canonical normative reference. The August 2018 Linus Torvalds LKML
post calling WireGuard "a work of art" compared to OpenVPN and IPsec
horrors — get the full quote with date and citation. The long road
from out-of-tree kernel module to Linux 5.6 mainline (March 29, 2020),
including the Zinc-vs-kernel-crypto-API debate. The deliberate decision
not to pursue an IETF RFC — explain Donenfeld's stated reasons (the
IETF process incentivises bloat, agility, configurability; WireGuard's
identity is the opposite). The commercial pickup wave: Mullvad early
adopter, then NordVPN NordLynx (a NordVPN-modified WireGuard with
their own NAT layer), then Cloudflare WARP (built on BoringTun, the
Rust userspace WireGuard from Cloudflare, 2019), then Tailscale
(2019, founded by David Crawshaw and Brad Fitzpatrick, both ex-Google),
which built a coordination plane on top of WireGuard. The 2022
Rosenpass release (Andreas Hülsing and collaborators) adding ML-KEM
post-quantum handshake as a companion daemon. The 2023 AmneziaWG fork
created to evade DPI in Russia and Iran by adding randomised junk
bytes to defeat the very-distinctive WireGuard fingerprint. Version
history table — although versioning is informal, list the major
inflection points. If anything has changed in the last 24 months —
Rosenpass 1.0, AmneziaWG growth, MASQUE comparison work — call it out.

## How it actually works

A single coherent section because WireGuard is genuinely one protocol
with four packet types and one handshake. Cover, in order:

- **Cryptokey routing** — the conceptual heart. Each peer has a
  long-term Curve25519 keypair; AllowedIPs maps source/destination
  IP prefixes to specific peers' public keys. Explain why this
  collapses ACL + routing into one structure.
- **The four message types**: Handshake Initiation (148 bytes),
  Handshake Response (92 bytes), Cookie Reply (64 bytes), Transport
  Data (variable). Give full bit-width layouts of each.
- **The Noise_IK handshake**: 1-RTT, mutual auth on Curve25519, with
  initiator's static key encrypted under the responder's static
  (the "IK" pattern). Walk through the chained HKDF derivations,
  the timestamp-based replay protection (TAI64N), the optional PSK
  mixin, the MAC1/MAC2 cookie mechanism for DoS resistance.
- **Transport data**: 4-byte type, 4-byte receiver index, 8-byte
  nonce (counter), encrypted payload, 16-byte Poly1305 tag.
  ChaCha20-Poly1305 keyed from the handshake.
- **Rekey timers**: REKEY_AFTER_TIME (120s), REKEY_AFTER_MESSAGES
  (2^60), REJECT_AFTER_TIME (180s), REJECT_AFTER_MESSAGES (2^64 -
  2^13 - 1), the precise rekey-initiation policy.
- **Cookie / DoS resistance**: when under load, peers reply with a
  Cookie Reply requiring the initiator to include MAC2 derived from
  the cookie + responder's identity.
- **Silent-on-unauthorized-packets**: any packet that fails
  authentication is dropped without a response — the protocol is
  designed to be invisible to scanners.
- **Roaming / endpoint migration**: peers update their stored
  Endpoint when a valid authenticated packet arrives from a new
  source, supporting transparent roaming.

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of a full WireGuard handshake + first Transport
   Data + rekey
2. WireGuard peer state machine (`stateDiagram-v2`)
3. WireGuard message-format bit layouts for all four message types
   (table form)

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **IPsec** — the explicit competitor; do the comparison fairly. IPsec
  wins on flexibility, carrier ecosystem, regulatory acceptance, and
  algorithmic agility (which has its own downsides). WireGuard wins on
  simplicity, audit surface, performance (kernel-fast-path on Linux),
  modern crypto only, and operational sanity. State the obvious truth:
  enterprises and carriers still run IPsec; nearly every new
  self-hosted or commercial-VPN deployment runs WireGuard.
- **TLS** — different model (per-stream vs per-packet, TCP vs UDP).
  Explain why "TLS-VPN" (OpenVPN, AnyConnect-DTLS) still exists in
  some contexts and where WireGuard sits relative to it.
- **QUIC** — different layer; QUIC is per-stream and tied to
  HTTP/3-style applications; WireGuard is per-packet and tunnels IP.
  Mention the MASQUE / CONNECT-IP work that puts IP-in-HTTP-over-QUIC
  as a different way to tunnel.
- **Noise Protocol Framework** — explicitly an upstream dependency.
  Trevor Perrin's framework; WireGuard uses Noise_IK with concrete
  Curve25519 / ChaCha20-Poly1305 / BLAKE2s instantiations.
- **NAT-traversal (STUN/TURN/ICE)** — WireGuard alone doesn't do
  NAT traversal. Tailscale (and Headscale) reimplement ICE-like
  logic on top of WireGuard for mesh deployments. Explain this.
- **UDP** — the only transport; no TCP-fallback, by design.
- **IP / IPv4 / IPv6** — what gets tunneled; AllowedIPs is just a
  list of IP prefixes.
- **OpenVPN** — the previous-generation VPN that WireGuard largely
  displaced; explain the architectural differences.

## Real-world deployment

Major implementations — the in-tree Linux kernel module (Donenfeld,
mainline since 5.6 in 2020), wireguard-go (the userspace Go reference
implementation, also Donenfeld), wireguard-rs (the Rust port),
BoringTun (Cloudflare's Rust userspace WireGuard, MIT-licensed, 2019),
wireguard-windows (Wintun-based), the iOS/macOS native client (via
Network Extension), the Android in-kernel since Android 12.

Commercial deployments — Mullvad (early adopter, ~2019), NordVPN
NordLynx (with a custom NAT layer to avoid storing client IPs),
Cloudflare WARP (built on BoringTun, with daily-active-device numbers
in the tens of millions), Tailscale (Crawshaw and Fitzpatrick, 2019,
built mesh-VPN as a service on WireGuard), Mozilla VPN (powered by
Mullvad), IVPN, ProtonVPN. Self-hosted: OPNsense / pfSense both ship
a WireGuard backend; the Headscale open-source Tailscale-coordinator
fork; Algo VPN's WireGuard-only mode. Real numbers required.
**Minimum 5 named deployments with metrics.**

## Failure modes and famous incidents

WireGuard's track record is notably clean for a security protocol —
the small audit surface has paid off. But cover honestly:

- The early-2018 mailing-list rough edges where the protocol assumed
  static IPs and didn't allow hostnames in `Endpoint` (Donenfeld
  resisted this; tooling like wg-quick eventually filled the gap).
- The 2018 Dowling & Paterson formal analysis at NDSS that found
  minor identity-hiding gaps in the early handshake — fixed before
  mainline merge. Cite the paper.
- The Wintun Windows driver crashes / BSODs circa 2020–2021 — driver
  issues, not protocol issues, but they hit real users.
- The Tailscale early cryptokey-routing edge cases where AllowedIPs
  overlaps caused subtle misroutes — Tailscale-specific, not in
  WireGuard core.
- The AmneziaWG saga: because WireGuard's wire format starts with a
  distinctive type byte and has predictable lengths, it's trivially
  fingerprintable by DPI. Russia and Iran began blocking WireGuard
  by signature in 2022–2023. AmneziaWG adds randomised junk bytes
  and padding to evade. This is not a CVE but it's a real-world
  failure mode of the "no algorithmic agility, no obfuscation"
  design stance.
- Rosenpass deployment learnings around running a PQ companion
  daemon next to WireGuard.

## Fun facts and anecdotes

- The ~4,000-line Linux kernel module figure (verify the current
  number — closer to 4–5K lines depending on what you count) vs
  OpenVPN's ~600,000 LoC. The exact comparison is in Donenfeld's
  NDSS paper.
- Linus Torvalds's August 2018 LKML quote — get it exactly: "Can I
  just once again state my love for it and hope it gets merged soon?
  Maybe the code isn't perfect, but I've skimmed it, and compared to
  the horrors that are OpenVPN and IPsec, it's a work of art."
  Pull the full URL.
- Donenfeld's deliberate non-IETF stance — find the relevant
  mailing-list or talk where he explains why.
- The "no algorithmic agility" choice — a deliberate inversion of
  TLS / IPsec philosophy. Explain why this is controversial and
  why the WireGuard team holds the line.
- Rosenpass naming — "Rosen" + WireGuard's German pun ("Rosen-pass"
  as in mountain pass).
- Tailscale's founding story (Crawshaw and Fitzpatrick, both ex-Google,
  building the network they wished they had).
- The AmneziaWG fork name (Amnezia is a Russian VPN-circumvention
  project).

## Practical wisdom

What an engineer actually needs to know — AllowedIPs is both an ACL
and a routing table (this is the cryptokey-routing slogan); a peer
with `AllowedIPs = 0.0.0.0/0, ::/0` becomes a default gateway,
which is desired for client-VPNs but a footgun for site-to-site.
PersistentKeepalive defaults (off by default; 25s is the common
behind-NAT recommendation). MTU tuning — the default is 1420 on
Linux because WireGuard adds 60 bytes of overhead on IPv4 Ethernet
(80 on IPv6); explain the math and the PMTUD-black-hole avoidance.
Kernel-vs-userspace performance: the in-tree kernel module is multi-Gbps
on commodity hardware; wireguard-go is closer to 1–2 Gbps; BoringTun
sits between. Windows Wintun vs the older OpenVPN TAP driver. Peer
config rotation moves: `wg syncconf`, `wg set`. Tooling: `wg-quick`,
`wg show`, the `wg-easy` web UI, `wgcf` for Cloudflare WARP. Include
**at least 3** Wireshark / capture filter examples (`wg`,
`udp.port == 51820`, `udp port 51820 and len > 100`), and a note
that beyond the message-type byte, WireGuard payloads are encrypted
and unstructured on the wire.

## Pioneers and key contributors

- **Jason A. Donenfeld** — principal author, continuing maintainer of
  WireGuard, the Linux kernel module, wireguard-go, wireguard-windows;
  also kernel-crypto contributions; runs zx2c4.com. Wikipedia URL.
- **Daniel J. Bernstein** — the cryptographer behind Curve25519,
  ChaCha20-Poly1305, and arguably the philosophical influence
  ("modern cryptography is simple cryptography"). Not a WireGuard
  developer per se, but his primitives are WireGuard.
- **Trevor Perrin** — author of the Noise Protocol Framework which
  underpins WireGuard's handshake (Noise_IK).
- **David Crawshaw** — Tailscale co-founder, ex-Google, prolific
  systems engineer; drove the Tailscale-on-WireGuard architecture.
- **Brad Fitzpatrick** — Tailscale co-founder, creator of LiveJournal
  / memcached / OpenID, ex-Google; the other half of Tailscale.
- **Maya Kaczorowski** — formerly at GitHub / Tailscale, the
  zero-trust narrative voice for mesh-VPN-on-WireGuard.
- **Andreas Hülsing** — Eindhoven University, lead on Rosenpass and
  major post-quantum cryptographer (SPHINCS, ML-KEM).
- **Karolin Varner** — Rosenpass cryptographic engineer.

## Learning resources (current as of 2026)

For each resource: URL, one-sentence description, level
(intro / intermediate / advanced), and the year last updated. Cover:

- Authoritative specifications — Donenfeld's 2017 NDSS paper
  *"WireGuard: Next Generation Kernel Network Tunnel"* (the
  normative spec); wireguard.com (live docs); the Noise Protocol
  Framework spec (noiseprotocol.org).
- Books — Mike Smith's *WireGuard: A Modern VPN Solution*; Tailscale's
  online "How Tailscale Works" guide which is the gold-standard
  cryptokey-routing explainer; Jonathan Corbet's LWN articles on
  the kernel merge.
- Academic papers — Donenfeld 2017 NDSS; Dowling & Paterson 2018
  NDSS formal analysis; Tamarin-prover follow-up papers; Rosenpass
  whitepaper (2022).
- Long-form engineering blog posts — Cloudflare's "WARP and
  BoringTun" series; Tailscale's "How NAT traversal works" and
  "Cryptokey Routing" posts; Mullvad engineering posts on NordLynx-
  style NAT layers; Algo VPN docs.
- YouTube videos — Donenfeld's talks (linux.conf.au 2018, BSDCan,
  Black Hat USA), Crawshaw and Fitzpatrick Tailscale talks,
  Computerphile WireGuard explainer.
- Podcasts — *Software Engineering Daily* WireGuard episodes,
  Tailscale podcast appearances, *Down the Security Rabbithole*.
- Free courses — Tailscale's free university content, the
  WireGuard tutorial on wireguard.com, Algo VPN GitHub.
- Hands-on tools — `wg-quick`, `wg show`, `wg-easy`, Cloudflare
  WARP CLI, Tailscale CLI, Headscale, OPNsense / pfSense
  WireGuard UI, the official WireGuard mobile apps.

## Where things are heading (2025–2026 frontier)

Rosenpass adoption — the ML-KEM post-quantum companion daemon
(Andreas Hülsing et al., v1.0 in 2023, growing deployment in 2025).
AmneziaWG and the broader DPI-evasion fork ecosystem — what
percentage of Russian/Iranian VPN traffic uses it. The persistent
discussion around AEGIS-256 as a future ciphersuite (the IETF has
been standardising AEGIS; WireGuard's "no agility" stance means
adopting it would require a new packet format). MASQUE / CONNECT-IP
as a "WireGuard over HTTP/3" alternative for hostile networks.
Tailscale and Cloudflare WARP continuing to scale (give 2024–2026
numbers). The Apple/Google native-platform WireGuard support
continuing to mature.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to
three sentences and stand on its own.

- A 60-second narrated hook (the "Linus Torvalds called it a work of
  art" beat — or the "4,000 lines vs 600,000 lines" beat).
- A striking statistic (Cloudflare WARP's daily active devices is a
  great one — or Tailscale's growth — or the Linux mainline merge
  date as a coronation moment).
- A "pause and think" moment (one developer + four years + small enough
  to audit = today's default VPN protocol; what does that say about
  IETF processes?).
- A failure-story arc — the AmneziaWG / DPI-fingerprinting saga as a
  cautionary tale about "no obfuscation" design choices.

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: wireguard
name: WireGuard
abbreviation: WG
categoryId: <recommend: utilities-security, or the proposed "vpn-tunneling" category alongside IPsec>
port: 51820 (default UDP, configurable)
year: 2015 (first release) / 2020 (Linux mainline)
rfc: <none — normative spec is Donenfeld's 2017 NDSS paper>
standardsBody: de-facto
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items (remote-access VPN, site-to-site VPN, mesh VPN via Tailscale, commercial consumer VPN, Cloudflare WARP, self-hosted homelab access)
performance: { latency, throughput, overhead }
connections: [udp, ip, ipv6, ipsec, tls, quic, nat-traversal, openvpn]
links: { wikipedia, official (wireguard.com), paper }
image: <Wikimedia URL — WireGuard logo or topology diagram>
```

### A.2 Header / wire-format layout

Provide all four message types:
- Handshake Initiation (148 bytes: type 1B, reserved 3B, sender index
  4B, unencrypted ephemeral 32B, encrypted static 32+16B, encrypted
  timestamp 12+16B, MAC1 16B, MAC2 16B)
- Handshake Response (92 bytes: type 1B, reserved 3B, sender index 4B,
  receiver index 4B, unencrypted ephemeral 32B, encrypted nothing
  0+16B, MAC1 16B, MAC2 16B)
- Cookie Reply (64 bytes: type 1B, reserved 3B, receiver index 4B,
  nonce 24B, encrypted cookie 16+16B)
- Transport Data (variable: type 1B, reserved 3B, receiver index 4B,
  counter 8B, encrypted payload + Poly1305 tag)

### A.3 State machine

WireGuard peer state machine in mermaid `stateDiagram-v2`:
Closed → HandshakeInitSent → HandshakeRespReceived → Established →
Rekey (back to HandshakeInitSent) → Closed, with a side branch for
CookieReply on DoS.

### A.4 Code example

- `python` — using `pywireguard` or a from-scratch Noise_IK
  implementation showing a Handshake Initiation construction
- `javascript` — Node.js using `node-wireguard` or a minimal
  userspace example (acknowledge JS is rare in WireGuard land)
- `cli` — `wg genkey | tee privatekey | wg pubkey > publickey`,
  `wg-quick up wg0`, `wg show`, a full `/etc/wireguard/wg0.conf`
  example, `wg syncconf`
- `wire` — sectioned dump: Handshake Initiation, Handshake Response,
  first Transport Data, a rekey trigger

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. Rosenpass 1.0 release, AmneziaWG
growth, Cloudflare WARP scale milestone, Tailscale growth, BoringTun
updates, wireguard-go updates.

### A.6 Real-world deployments

≥5 named: Cloudflare WARP, Tailscale, Mullvad, NordVPN NordLynx,
Mozilla VPN (Mullvad-powered), IVPN, ProtonVPN, OPNsense / pfSense,
Headscale, Algo VPN — give scale numbers.

### A.7 Fun facts ≥3

Including the ~4,000-line kernel module, Linus's quote, the
deliberate non-IETF stance, Rosenpass naming pun.

### A.8 Practical wisdom (sysctls/pitfalls/tools)

Including AllowedIPs as routing-cum-ACL, PersistentKeepalive,
MTU 1420 default, kernel-vs-userspace tradeoffs.

### A.9 Wireshark hints ≥3

Including the `wg` dissector (added 2019), `udp.port == 51820`, and
the fact that beyond the type byte, packets are encrypted.

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Jason A. Donenfeld with full bio.

### A.12 Spec records ≥3

Donenfeld 2017 NDSS (the normative spec), Dowling & Paterson 2018
NDSS (formal analysis), the Noise Protocol Framework spec (Perrin,
ongoing), the Rosenpass whitepaper (2022). Explicitly note: no IETF
RFC, by design.

### A.13 New glossary concepts

≥10 — Noise Protocol Framework, Noise_IK, cryptokey routing,
AllowedIPs, ChaCha20-Poly1305, BLAKE2s, Curve25519, PersistentKeepalive,
MAC1/MAC2, cookie reply, 1-RTT, formally-verified.

### A.14 Frontier entry

Rosenpass (post-quantum WireGuard companion) as the headline frontier
entry with metrics and sources. Plus AmneziaWG as a separate
"DPI-resistance" frontier entry.

### A.15 Journey suggestion

"How a Tailscale device joins a tailnet" — 5–6 step journey from key
generation → coordination server check-in → NAT traversal (DERP
fallback) → WireGuard handshake → cryptokey routing, linking to
nat-traversal, udp, dns, oauth2 (Tailscale uses OAuth/OIDC for
identity).

### A.16 Comparison pair

"WireGuard vs IPsec" is the headline framing. Secondary: "WireGuard
vs OpenVPN" or "WireGuard vs MASQUE-CONNECT-IP".

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "2015, a side project to escape IPsec hell" (Donenfeld
  origin)
- Timeline: 2015 (first release) → 2017 (NDSS paper) → 2018 (Linus
  endorsement) → 2020 (Linux 5.6 mainline) → 2022 (Rosenpass) →
  2023 (AmneziaWG)
- Callout: "Linus Torvalds called it 'a work of art'"
- Image: WireGuard logo / Donenfeld photo / a kernel-mainline-merge
  commit screenshot
- Diagram: cryptokey-routing AllowedIPs table visualised
- Pioneers section embedded: Donenfeld + Bernstein + Perrin mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely none) + new proposals.
Strong candidates for new outage records:
- AmneziaWG / Russia DPI fingerprinting (2022–2023) — protocol-design
- Wintun Windows BSOD class (2020–2021) — software-bug
- Dowling & Paterson 2018 minor identity-hiding gap — protocol-design
  (academic finding, fixed pre-mainline)

### A.19 Embedded media

Highest-signal: Donenfeld's linux.conf.au 2018 talk, Tailscale's
"How NAT traversal works" interactive page, Cloudflare's BoringTun
deep-dive talk, Computerphile's WireGuard explainer.

### A.20 Prerequisites

```
concepts: [packet, port, ipv4-address, encryption, public-key, hash, aead, perfect-forward-secrecy]
protocols: [udp, ip, ipv6]
```

### A.21 Name highlight

```
"[W]ire[G]uard"   (WG)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for the WireGuard handshake + first
Transport Data + rekey. 10–14 step annotations; explain *what* each
message is and *why* the reader is seeing it (e.g., "this is the
Handshake Initiation — note the ephemeral key in plaintext, then
the static key encrypted under the responder's static; this is the
Noise_IK pattern at work").

### A.23 Category placement

Reasonable options:
- Fit into existing `utilities-security`
- **Propose a new "vpn-tunneling" category** alongside IPsec coming
  in this same pass:

```
id: vpn-tunneling
name: VPN & Tunneling
color: <suggest deep blue / steel — coordinate with IPsec proposal>
glowColor: <complementary>
description: Protocols that encapsulate and protect IP traffic across untrusted networks — site-to-site VPN, remote access, mesh overlay.
icon: <lucide icon e.g., "shield" or "tunnel" or "lock">
```

---

# Appendix B — Simulator step list

Author **one** simulation: the WireGuard 1-RTT handshake plus first
Transport Data, with a Rekey beat at the end. Provide 8–10 steps in
the shape:

```
title: "WireGuard Handshake and Transport"
description: "Watch two peers complete the Noise_IK 1-RTT handshake, exchange transport data, and rekey."
actors:
  - { id: "alice", label: "Peer A (Initiator)", icon: "laptop", position: "left" }
  - { id: "bob", label: "Peer B (Responder)", icon: "server", position: "right" }
userInputs:
  - { id: "psk", label: "Pre-shared key (optional)", type: "boolean", defaultValue: false }
  - { id: "keepalive", label: "PersistentKeepalive (s)", type: "number", defaultValue: "25" }
  - { id: "endpoint", label: "Bob's Endpoint", type: "text", defaultValue: "203.0.113.5:51820" }
steps:
  - id: hs_init
    label: "Handshake Initiation"
    description: "Alice sends 148-byte Handshake Initiation with ephemeral X25519, encrypted static key, encrypted timestamp."
    fromActor: alice
    toActor: bob
    duration: 1000
    highlight: [type, sender, ephemeral, encrypted-static, MAC1]
    layers:
      - IP: { src: "alice", dst: "bob" }
      - UDP: { sport: "51820", dport: "51820" }
      - WireGuard: { type: 1, sender: "0xAABB1122", ephemeral: "...", encryptedStatic: "...", MAC1: "..." }
  - id: hs_resp
    label: "Handshake Response"
    description: "Bob replies with 92-byte Handshake Response — completes the 1-RTT, both sides now hold transport keys."
    highlight: [type, sender, receiver, ephemeral, MAC1]
    ...
  - id: data_out
    label: "Transport Data (A→B)"
    description: "Alice sends an IP packet encrypted under the transport-send key with a 64-bit counter nonce."
    highlight: [type, receiver, counter, encrypted-payload]
    ...
  - id: data_in
    label: "Transport Data (B→A)"
    ...
  - id: keepalive
    label: "Keepalive"
    description: "PersistentKeepalive fires — Alice sends an empty transport-data packet to keep the NAT mapping alive."
    ...
  - id: cookie_dos
    label: "Cookie Reply (under load)"
    description: "If Bob is under DoS load, he replies with a Cookie Reply forcing future Handshake Initiations to include MAC2."
    ...
  - id: rekey_init
    label: "Rekey: new Handshake Initiation"
    description: "After REKEY_AFTER_TIME (120s), Alice initiates a fresh handshake to derive new transport keys."
    ...
  - id: rekey_resp
    label: "Rekey: Handshake Response"
    ...
```

The layers should reflect the actual protocol stack — for every
WireGuard message, IP → UDP → WireGuard message. Inside Transport
Data, an inner IP packet is encrypted and not visible until decrypted.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three
search variations.

==========
