---
id: quic
type: protocol
name: QUIC
abbreviation: QUIC
etymology: "originally [Q]uick [U]DP [I]nternet [C]onnections; the IETF dropped the expansion in RFC 9000"
category: transport
year: 2021
rfc: RFC 9000
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-1986-collapse
  - story-of-the-internet/mobile-and-bufferbloat
  - story-of-the-internet/the-quic-redesign
  - layer-2-3/ethernet
  - transport/tcp
  - transport/udp
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - web-api/http2
  - web-api/http3
  - web-api/grpc
  - web-api/websockets-and-sse
  - async-iot/mqtt
  - realtime-av/rtp-and-rtcp
  - realtime-av/webrtc
  - realtime-av/moq-transport
  - utilities-security/ssh
  - patterns-failures/patterns
  - patterns-failures/failure-modes
  - patterns-failures/congestion-history
  - frontier/ultra-ethernet
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/blogs
  - how-to-learn-more/tools
related_protocols: [tcp, udp, tls, http2, http3, ip, wifi, mptcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9000, 9001, 9002, 8999, 9114, 9204, 9221, 9250, 9287, 9298, 9308, 9368, 9369, 9743]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Google_Data_Center%2C_The_Dalles.jpg/500px-Google_Data_Center%2C_The_Dalles.jpg
    caption: Google's data center in The Dalles, Oregon — where QUIC was born. Google developed QUIC internally starting in 2012 to replace TCP plus TLS, deploying it across Chrome and YouTube before standardising it as RFC 9000.
    credit: Photo — Google / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "A side-by-side handshake comparison: TCP plus TLS 1.3 (two round-trips before app data, drawn as four arrows) versus QUIC 1-RTT (one round-trip, two arrows) versus QUIC 0-RTT (client sends data in the very first packet, one arrow). Time scale on the left, milliseconds annotated."
  - "A QUIC packet anatomy: the long-header form on the left (Header Form bit, Fixed Bit, type bits, version, DCIL/DCID, SCIL/SCID, type-specific fields), the short header on the right (Header Form, Fixed Bit, Spin Bit, Reserved, Key Phase, Packet Number Length, DCID, encrypted packet number). Encrypted regions shaded; Connection ID highlighted as the field that survives migration."
  - "A phone walking out of a coffee shop. Two arrows from the phone — one to a Wi-Fi router (cut off as it leaves range), one to a cell tower (newly active). Above both, a single horizontal QUIC connection line labelled with one Connection ID. Caption: 'Same connection, two paths, no reconnect.'"
  - "The frame-type table from RFC 9000 §19 rendered as a colour-coded grid: PADDING/PING grey, ACK green, STREAM/RESET_STREAM/STOP_SENDING blue, CRYPTO yellow, NEW_CONNECTION_ID/RETIRE_CONNECTION_ID/PATH_CHALLENGE/PATH_RESPONSE purple, CONNECTION_CLOSE red, DATAGRAM (RFC 9221) orange, ACK_FREQUENCY (draft) outlined."
  - "Cloudflare's 2024 broadcast amplification incident as a diagram: one 1200-byte Initial packet on the left arriving at a broadcast IP, then 384 reply packets fanning out from a 128-core edge box on the right. A red 'amplification factor 384x' label."
  - "An adoption stack chart of HTTP versions on Cloudflare-observed traffic in Q1 2026 — HTTP/1.1 around 28%, HTTP/2 around 51%, HTTP/3 (over QUIC) around 21%. A second chart next to it: Meta's internal traffic, with QUIC over 75%."
---

# QUIC — A UDP-Based Multiplexed and Secure Transport

## In one breath

QUIC is what happens when Google looks at TCP plus TLS and decides it cannot be saved. It runs inside UDP datagrams, folds the TLS 1.3 handshake into the transport handshake, multiplexes independent streams to kill head-of-line blocking, and identifies a connection by a 64-bit Connection ID instead of an IP-and-port four-tuple — so your phone can hop from Wi-Fi to cellular without dropping the session. RFC 9000 standardised it in May 2021. By Q1 2026, HTTP/3 over QUIC is about 21% of Cloudflare-observed web requests, and Meta says more than 75% of its internet traffic rides on QUIC.

## The pitch

In 2012, a Google engineer named Jim Roskind looked at TCP — the protocol carrying nearly every byte you read on the web — and decided it could not be improved fast enough. Not because it was broken, but because it lived in the wrong place: every operating-system kernel on the planet, with middleboxes inspecting every header. Improving it took a decade per change. So Roskind built a replacement on top of UDP, jammed encryption inside the handshake, and called it QUIC. Today more than a third of the world's HTTP traffic runs on it, in-kernel QUIC patches are about to land in Linux mainline, and the next ten years of transport innovation — multipath, MASQUE, MoQ, post-quantum key exchange — are all riding on the wire image RFC 9000 froze.

## How it actually works

Every QUIC connection is a UDP flow on the outside and, on the inside, a fully encrypted reliable transport with multiplexed streams, integrated TLS 1.3 keys, and a Connection ID that survives address changes. The simulator on this page walks the standard 1-RTT case in five steps.

The client opens with a single Initial packet — long header, version 1, padded to at least 1200 bytes to stop amplification attacks. Inside is a CRYPTO frame carrying the TLS ClientHello. Notice that there is no separate SYN: the transport handshake and the cryptographic handshake are the same event.

The server replies with its own Initial (carrying the ServerHello) followed by Handshake packets carrying the certificate, certificate verify, and Finished. The server is allowed to send no more than three times the bytes the client has sent until the client's address is validated — that is the protocol's anti-amplification rule, RFC 9000 §8.

The client sends Handshake Finished and immediately switches to short-header 1-RTT packets. The connection is now fully established with forward-secret keys. The server confirms by sending a HANDSHAKE_DONE frame and starts issuing fresh Connection IDs for migration.

Then application data flows over streams. Each stream has its own offset and its own flow control credit. A lost packet only stalls the stream whose bytes were in it; every other stream keeps moving. That is the head-of-line-blocking fix HTTP/2 over TCP could not provide.

When either side is done, a single CONNECTION_CLOSE frame ends the session. No four-way FIN dance — one packet, an error code, an optional reason string, and a brief draining period before state is freed.

### Header at a glance

QUIC has two header forms. The Header Form bit picks between them.

The **long header** is used during the handshake — Initial, 0-RTT, Handshake, Retry, Version Negotiation. It carries the version number explicitly (`0x00000001` for v1, `0x6b3343cf` for v2), a Destination Connection ID up to 20 bytes, a Source Connection ID up to 20 bytes, and type-specific fields like a Token and a Length and an encrypted Packet Number. Variable-length integers are everywhere — two top bits of the first byte choose 1, 2, 4, or 8-byte encoding.

The **short header** is used after the handshake completes. It is shorter on purpose. One Header Form bit (zero), one Fixed Bit (the famous "QUIC bit" that RFC 9287 negotiates greasing of), one Spin Bit for passive RTT measurement, two Reserved bits, a Key Phase bit, two Packet Number Length bits, then the Destination Connection ID with no length on the wire (the endpoint just knows), then the encrypted packet number, then the AEAD-protected payload.

Inside the payload, everything is **frames**. RFC 9000 §19 defines about thirty types: PADDING, PING, ACK and ACK_ECN, RESET_STREAM, STOP_SENDING, CRYPTO (carries TLS records), NEW_TOKEN, the eight STREAM variants, MAX_DATA / MAX_STREAM_DATA / MAX_STREAMS for flow control, NEW_CONNECTION_ID and RETIRE_CONNECTION_ID, PATH_CHALLENGE and PATH_RESPONSE for migration, CONNECTION_CLOSE in transport and application flavours, HANDSHAKE_DONE, the DATAGRAM frame from RFC 9221, and the draft ACK_FREQUENCY at type `0xaf`.

### State machine in three sentences

A QUIC endpoint moves through three encryption levels — Initial, then Handshake, then 1-RTT — and the connection is fully established once the client sends Handshake Finished and the server sends HANDSHAKE_DONE. The connection itself lives until either side sends CONNECTION_CLOSE or the idle timer (negotiated via the `max_idle_timeout` transport parameter, often 30 seconds in production CDNs) fires. Migration is a sub-state: when a packet arrives on a new four-tuple, the endpoint runs a PATH_CHALLENGE / PATH_RESPONSE round trip and resets the congestion controller for the new path before trusting it.

### Reliability, flow, and security mechanics

Loss detection is TCP-flavoured but cleaner. RFC 9002 defines a `time_threshold` of 9/8 of the smoothed RTT and a `packet_threshold` of three packets of reordering, plus a Probe Timeout equal to smoothed RTT plus four times RTT variance plus the peer's `max_ack_delay`. The reference congestion controller is NewReno; quiche, msquic, mvfst, and Google's QUICHE all also ship CUBIC, BBR, BBRv2, and BBRv3. Pluggable congestion control is one of the entire reasons QUIC exists — you cannot ship a new TCP congestion controller without an OS upgrade, but you can ship a new QUIC one in a binary update.

Encryption is everywhere. RFC 9001 keys Initial packets from the Destination Connection ID via a fixed `initial_salt` — they are obfuscated rather than secret, on the theory that on-path observers should not be able to passively log handshake metadata even before the real keys exist. Handshake packets use TLS 1.3 handshake keys. 1-RTT packets use application keys derived from TLS exporters labelled `quic key`, `quic iv`, `quic hp`, `quic ku` in v1 and `quicv2 *` in v2. On top of AEAD encryption of every payload, QUIC adds **header protection**: the packet number and a few bits of the first byte are XORed with a mask derived from sampling 16 bytes of the encrypted payload through AES-ECB or ChaCha20. The result is that almost everything except the Connection ID and a handful of framing bits is opaque to the network.

Connection migration is the feature most TCP veterans find hard to believe. The connection is named by Connection ID, not four-tuple. Either side can issue several CIDs via NEW_CONNECTION_ID frames; the client picks a fresh one when it changes four-tuple to defeat linkability. When your phone hops from Wi-Fi to cellular, the underlying IP and port change but the QUIC connection survives — the receiver matches the new packet by Connection ID. There is one footnote: clients with zero-length CIDs cannot migrate, and Chrome notably uses zero-length CIDs by default, which produced visible failures behind ISP carrier-grade NATs with 20-second UDP timeouts.

## Where it shows up in production

**Google** was the first production user, in 2014, with the gQUIC dialect across Chrome and YouTube. The 2017 SIGCOMM paper by Langley and a long author list reported gQUIC carrying about 7% of all internet traffic, with measured wins on YouTube rebuffer rate (down 15 to 18%) and Google Search latency (down 3.6 to 8%). IETF QUIC has been the default for chrome.com and youtube.com since 2020. Google says more than half of all Chrome traffic uses QUIC.

**Meta** is the largest production deployment by share. As of late 2020 the Facebook engineering blog reported "more than 75 percent of our internet traffic uses QUIC and HTTP/3" across Facebook, Instagram, and WhatsApp web and mobile. Meta's open-source implementation, mvfst, runs at that scale. TCP is retained mainly for legacy clients.

**Cloudflare** runs `quiche` on every edge, serves HTTP/3 by default for every site behind their CDN, and operates the second relay in iCloud Private Relay. They open-sourced `tokio-quiche` in December 2025 — the async wrapper around `quiche` powering Apple's Private Relay Proxy B, Cloudflare WARP MASQUE, and the Oxy proxy framework at, in their phrasing, "millions of HTTP/3 RPS." Cloudflare also launched a global Media-over-QUIC relay network across more than 330 cities in 2025.

**Apple** added experimental QUIC in Safari 14 with macOS Big Sur and iOS 14, enabled HTTP/3 by default in Safari 16, and shipped native QUIC in `Network.framework` in iOS 18 and macOS 15. iCloud Private Relay (2021 onward) is the largest consumer MASQUE deployment. CloudKit and iCloud sync use QUIC for low-latency mobile updates.

**Microsoft**'s `msquic` powers Windows SMB-over-QUIC starting in Server 2022, IIS HTTP/3, and the .NET 7 and 8 networking stacks. Akamai, Fastly, and LiteSpeed all serve HTTP/3 at the edge; Akamai is one of three Apple Private Relay egress operators alongside Cloudflare and Fastly.

The aggregate adoption number for HTTP/3 was about 35% of top-10-million websites by W3Techs in early 2025 — but Cloudflare's measurement of actual HTTP/3 *use* (as opposed to advertised support) plateaued around 21% of their web requests through Q1 2026. Different metrics, both real.

## Things that go wrong

**Cloudflare's broadcast-address QUIC amplification, 2024**, is the cleanest cautionary tale. QUIC servers are designed to scale by giving each CPU core its own listener, with packets steered by destination port. When Cloudflare let QUIC speak on every IP in an anycast prefix, it also spoke on the broadcast IP at the end of each prefix. A single Initial packet to that address woke up every core's listener at once. Each one independently believed it was being asked to start a connection.

On a 128-core machine, one tiny 1200-byte packet generated up to 384 reply packets, each potentially a several-hundred-byte Retry. From the outside this looked like a perfect amplification attack — small input, large output, source address spoofable. Cloudflare's network had briefly become a free DDoS amplifier. They disabled broadcast functionality at the network layer for the affected prefixes, then patched the QUIC stack to recognise and reject broadcast destinations, and published a postmortem. The lesson is the recurring one: at scale, protocol bugs are operational bugs.

**CVE-2022-30591 in quic-go** was a Slowloris-style PMTU-discovery probe-timer overflow that researchers at the University of Piraeus rode to drive Caddy servers above 99% CPU. The fix was a simple bound on the timer, but it took a coordinated disclosure to roll out across every quic-go consumer.

**CVE-2024-26190 in msquic** (March 2024) was a memory leak in repeated transport-parameter decode, affecting .NET 7 and 8 and PowerShell 7.3 and 7.4 on Windows. Patched in msquic 2.1.12, 2.2.7, and 2.3.5.

**CVE-2023-23392 and CVE-2023-24898 in Microsoft's HTTP/3 and SMB-over-QUIC stacks** were both pre-auth bugs found by Akamai's Ben Barnea — a remote heap overflow in `http.sys` and a denial-of-service in `srvnet.sys` triggered by abusing concurrent QUIC streams. Both fixed in Patch Tuesday 2023.

**CVE-2025-4820 and CVE-2025-4821 in quiche** were ACK-range validation bugs that let an attacker grow the congestion window past path capacity, with one variant crashing on integer overflow. Fixed in quiche 0.24.x. **CVE-2025-7054** in the same library was a RETIRE_CONNECTION_ID infinite loop that pegged CPU on specially-crafted frames. **CVE-2026-32179** in msquic is an integer underflow that escalates to remote elevation of privilege; fixed in 2.4.18 and 2.5.7. The pattern is the protocol surface is large, the implementations are intricate, and connection-ID handling has been the recurring sharp edge.

The chapter "A History of Congestion Control" — covered in its own episode — picks up the longer arc of how loss-based, delay-based, model-based, and explicit-signal congestion controllers have all eventually shown up inside QUIC, and the chapter "Failure Modes" enumerates the bestiary (bufferbloat, ossification, MTU black holes) that QUIC was designed to dodge.

## Common pitfalls

**UDP gets blocked.** Corporate firewalls, school networks, and a small fraction of mobile carriers block UDP on port 443. Browsers fall back to TCP plus HTTP/2, but the fallback adds 1 to 2 RTTs of detection. If you need consistent QUIC, validate connectivity before you depend on it.

**Connection migration breaks middleboxes.** Some stateful NATs and transparent proxies drop a connection when its source IP suddenly changes — they assume it is a new flow. QUIC's Path Validation handshake (RFC 9000 §8) fixes this when both endpoints support it, but you still see real-world breakage where the middlebox simply refuses the new four-tuple.

**Higher CPU than kernel TCP.** QUIC encryption plus user-space implementation costs roughly 2× the CPU per byte of a tuned kernel TCP stack. CDNs offload to TLS-acceleration NICs (kTLS-style); plain servers should expect higher load. The 2024 ACM Web Conference paper "QUIC is not Quick Enough over Fast Internet" measured up to 45.2% throughput regressions versus HTTP/2 above about 500 Mbps, mostly from receiver-side userspace ACK and copy overhead. The fix in flight is in-kernel QUIC — Xin Long's roughly 9,000-line patch series for Linux landed in July 2025, with mainline merge expected in 2026.

**Default UDP buffers are too small.** quic-go documents that you should raise `net.core.rmem_max` and `net.core.wmem_max` via sysctl to several megabytes; without it, the kernel drops packets on bursty 10 Gb/s flows and your throughput collapses for reasons the application logs cannot see.

**Disabling GSO and GRO is a CPU trap.** UDP Generic Segmentation Offload arrived in Linux 4.18, UDP Generic Receive Offload in 5.0; Cloudflare's quiche uses both. Turn them off on the NIC and you become CPU-bound at moderate throughput. The 2025 ACM paper on "QUIC's Throughput Speedbumps" measured GSO and GRO together cutting I/O cost from 60.7% of CPU down to 21.3%, putting `quicly` within 2% of kernel-bypass DPDK.

**Zero-length Connection IDs disable migration.** Chrome's default is zero-length CIDs, which means no migration, which means short NAT timeouts on carrier-grade NATs kill the connection. If migration matters, both ends need non-zero CIDs and an `active_connection_id_limit` greater than 2.

**Forgetting the 1200-byte Initial floor** will get your client silently dropped by some servers. The minimum is per RFC 9000 §8.1 and is there for both anti-amplification and PMTU reasons.

## Debugging it

**Capture pcaps on UDP port 443 with `SSLKEYLOGFILE` set.** Without the TLS keys exported via the OpenSSL keylog convention, every QUIC packet body is opaque. Wireshark 4.5.0 or later has the QUIC dissector and will decrypt with the keylog file.

**Convert pcaps to qlog with `pcap2qlog`, then visualise in qvis** at qvis.quictools.info. qvis is the canonical "sequence diagram plus congestion graph" viewer, maintained by Robin Marx (originally at Hasselt, now at Akamai). The qlog schema itself is at IETF Last Call as `draft-ietf-quic-qlog-main-schema-13` — it is being formalised as an IETF logging standard, not just a Cloudflare/Akamai/Meta convention.

**Check ALPN with curl.** `curl --http3 -v https://cloudflare-quic.com` forces QUIC; `curl -sI https://google.com | grep -i alt-svc` shows whether a server advertises HTTP/3 via the `Alt-Svc` header. The right ALPN tokens are `h3` for HTTP/3, `doq` for DNS-over-QUIC, `hq-interop` for the test runner.

**Watch with tcpdump.** `sudo tcpdump -i any udp port 443` is the lazy first move. For real protocol inspection, `quiche-client` or `h3i` (Cloudflare's low-level HTTP/3 testing CLI) give you per-frame visibility.

**Run the QUIC Interop Runner** at github.com/quic-interop/quic-interop-runner. It is a Docker-based matrix that pairs every major QUIC implementation against every other and runs handshake, version negotiation, retry, transfer, multiplexing, key update, and migration tests. Live results are at interop.seemann.io.

**Tune Linux UDP buffers** via `sysctl net.core.rmem_max=<bytes>` and `net.core.wmem_max=<bytes>`. **Tune the transport parameters that matter**: `initial_max_data` (connection-level credit; defaults are too low for fat pipes), `initial_max_streams_bidi` and `_uni` (concurrent streams; SMB-over-QUIC limits to 1), `max_idle_timeout` (production CDNs often pick 30 seconds), `max_udp_payload_size` (must be ≥1200 and ≤65527), `disable_active_migration` (off for most clients), `active_connection_id_limit` (greater than 2 for migration), and once supported, `min_ack_delay` from the ack-frequency draft — a big lever on satellite or other high-RTT paths.

**What to monitor in observability**: per-connection RTT, smoothed RTT and RTT variance, congestion window, bytes-in-flight, retransmit rate, ECN-CE marks, packet number gaps, stream count, and pacing rate versus measured throughput. Retain Connection IDs in your traces so you can correlate across migration events.

## What's changing in 2026

**March 2026 — Multipath QUIC reaches `draft-ietf-quic-multipath-21`.** Edited by Liu, Ma, De Coninck, Bonaventure, Huitema, and Kuehlewind. Mechanism settled on explicit Path Identifiers in PATH_ABANDON, PATH_AVAILABLE, and PATH_ACK frames. Apple, Google, Alibaba, and Tessares have already deployed predecessors. The draft is approaching IESG processing.

**March 2025 — RFC 9743, "Specifying New Congestion Control Algorithms" (Duke and Fairhurst eds.) became BCP 133.** The standards-track home for any new QUIC congestion controller, including the multipath ones.

**2025 into 2026 — Acknowledgment Frequency** reached `draft-ietf-quic-ack-frequency-14` (Iyengar, Swett, Kühlewind), defining the `ACK_FREQUENCY` frame at type `0xaf` and the `IMMEDIATE_ACK` frame, plus the `min_ack_delay` transport parameter. A big lever for satellite, mobile, or any other high-RTT path.

**June 2025 — Reliable Stream Reset reached `draft-ietf-quic-reliable-stream-reset-07`,** defining `RESET_STREAM_AT` for partial-delivery resets — motivated by WebTransport's reliable-prefix needs.

**Mid-September 2025 — Apple iOS 26, iPadOS 26, and macOS Sequoia turned on hybrid post-quantum key exchange (X25519MLKEM768) by default for TLS 1.3, including QUIC.** OpenSSL 3.5 had enabled it earlier; per Cloudflare Radar, the share of human-driven traffic with PQC key exchange crossed a majority by year end. Open problem: ML-DSA-65 certificate chains are roughly 12 KB and interact poorly with the QUIC 3× anti-amplification cap before address validation.

**December 2025 — Cloudflare open-sourced `tokio-quiche`,** the async Tokio wrapper around `quiche` powering iCloud Private Relay Proxy B and Cloudflare WARP MASQUE.

**July 2025 — Xin Long posted the in-kernel QUIC patch series for Linux (about 9,000 lines)** as `IPPROTO_QUIC`, mirroring `IPPROTO_MPTCP`. The TLS handshake is delegated to userspace via `tlshd`. Mainline merge expected in 2026. When in-kernel QUIC ships, the throughput gap with kernel TCP closes.

**MoQ Transport reached `draft-ietf-moq-transport-17` (March 2026)** with editors Nandakumar (Cisco), Vasiliev (Google), Swett (Google), and Frindell (Meta). The chapter on MoQ Transport has the full story of the working group's internal fork (Luke Curley's `draft-lcurley-moq-lite-02`, November 2025: "MoqTransport has become too complicated") and the eleven-vendor interop demo at NAB 2026.

**WebTransport over HTTP/3** is at `draft-ietf-webtrans-http3-15` (March 2026, Frindell, Kinnear, Vasiliev). Cross-browser Baseline status reached in March/April 2026 with Safari 26.4. **MASQUE** ships CONNECT-UDP (RFC 9298) and CONNECT-IP (RFC 9484); Apple Private Relay and Cloudflare WARP run on top of these. **RTP-over-QUIC (RoQ)** entered Working Group Last Call in July 2025 as `draft-ietf-avtcore-rtp-over-quic-14`, ALPN `roq`, preserving the entire RTP ecosystem inside a QUIC envelope.

**QUIC v2 (RFC 9369, May 2023) is still being deployed gradually.** Its sole purpose is to prove the network can handle a different version number — same protocol, renumbered packet-type bits, different `initial_salt` and HKDF labels. Production deployment is the test that the version-negotiation machinery actually still works before any meaningful future v3 ships.

## Fun facts

QUIC originally stood for **Quick UDP Internet Connections** in Roskind's 2012 design rationale at Google. The IETF working group declared "in the IETF's use of the word, QUIC is not an acronym; it is simply the name of the protocol," and RFC 9000 carries no expansion at all. The name is now an unexplained four-letter word like HTTP or TCP.

**A QUIC connection is identified by a 64-bit Connection ID,** not by the four-tuple TCP uses. When your phone moves between Wi-Fi and cellular, the IP and port change but the receiver matches the new packet by Connection ID and the connection survives. This is why HTTP/3 video calls do not stutter on handoff — and it is the single feature TCP cannot retrofit.

**QUIC encrypts almost the entire packet.** TCP segment headers are visible to anyone on path: sequence numbers, ACK numbers, window sizes. QUIC encrypts everything except the Connection ID, the packet number (and that is header-protected), and a few framing bits. This blocks decades of network-side observation tools — and is why some operators still resist it.

**RFC 9369, QUIC v2, is an entire Standards-Track RFC whose purpose is to be different.** Same protocol, no new features. Its wire-image version number is `0x6b3343cf` — the first four bytes of `sha256("QUICv2 version number")` — chosen specifically to exercise version negotiation and break middleboxes that ossified on v1's Initial-packet salt.

**The Spin Bit war.** A single bit — the latency Spin Bit in the short header — generated several hundred mails and hours of working-group discussion. Operators wanted passive RTT visibility from on path; privacy advocates worried about information leakage. The compromise: it is optional and must be implemented in a way that is unpredictable to non-coordinating endpoints.

**"Turtles all the way down."** The MASQUE working draft's keyword list literally includes `quic in quic`. Apple's iCloud Private Relay tunnels HTTP/3 inside HTTP/3 across two operators (Apple, then Cloudflare or Akamai or Fastly). Tommy Pauly noted at EPIQ 2021 that *encapsulating* HTTP/2 traffic inside QUIC for Private Relay's first hop actually *improves* performance, because it shields TCP from imperfect mobile networks.

**Robin Marx's qlog crusade.** Marx — then at Hasselt, now at Akamai — almost single-handedly pushed structured logging into the QUIC working group. His EPIQ/SIGCOMM 2020 demo paper documented Facebook logging 30 billion qlog events per day in production.

## Where this connects in the book

- **Part Foundations / "The Layer Model"** — where QUIC sits in the stack and why "transport" is a layer at all.
- **Part Foundations / "Packets & Encapsulation"** — what the QUIC packet looks like once you wrap it in UDP, IP, and Ethernet.
- **Part Foundations / "Ports & Sockets"** — why UDP port 443 is the QUIC port, and how the kernel demultiplexes.
- **Part Foundations / "Reliability vs Speed"** — the defining transport tradeoff and where QUIC tries to have both.
- **Part Story of the Internet / "The 1981–83 Standardisation Burst"** — the architectural decision (TCP and IP as separate layers) that made it possible for any new transport, including QUIC, to ride the same IP fabric.
- **Part Story of the Internet / "The 1986 Congestion Collapse"** — the night TCP almost killed itself, and how Van Jacobson's six algorithms became the pattern QUIC's congestion controllers still extend.
- **Part Story of the Internet / "The Mobile and Bufferbloat Decade"** — why your home internet got laggy under load, and why QUIC's user-space pacing was the eventual escape from the kernel's ossified TCP stack.
- **Part Story of the Internet / "The QUIC Redesign"** — the full origin story (Roskind at Google in 2012, gQUIC, the IETF rewrite, the choice to tunnel inside UDP rather than ship a new IP protocol number, the ossification lesson SCTP taught).
- **Part Layer 2–3 / "Ethernet"** — what the wire underneath QUIC is, and why the 1500-byte MTU still rules in production.
- **Part Transport / "TCP"** — the four-decade workhorse QUIC was designed to displace, and the costs of TCP reliability that motivated every QUIC design choice.
- **Part Transport / "UDP"** — the eight-byte header that became the substrate for the next generation of internet transports.
- **Part Transport / "SCTP"** — the better-on-paper transport that lost the deployment war because middleboxes do not understand it; the canonical justification for QUIC's UDP encapsulation.
- **Part Transport / "MPTCP"** — Multipath TCP shipped in iOS 7 (2013) for Siri; Multipath QUIC inherits its algorithmic ideas inside a transport that actually traverses middleboxes.
- **Part Transport / "QUIC"** — the chapter-length companion to this episode, with deeper history and the four-problems-solved framing.
- **Part Web / API / "HTTP/2"** — the protocol whose head-of-line blocking over TCP is the canonical "why QUIC exists" example.
- **Part Web / API / "HTTP/3"** — HTTP semantics on QUIC, the adoption plateau, the in-kernel push, the active frontier (Multipath QUIC, MASQUE, WebTransport, ECH).
- **Part Web / API / "gRPC"** — built on HTTP/2 today, with native HTTP/3 support gated on widespread server-side QUIC.
- **Part Web / API / "WebSockets and SSE"** — the older real-time models that WebTransport over HTTP/3 (eventually) supersedes.
- **Part Async / IoT / "MQTT"** — MQTT-over-QUIC has no ratified OASIS standard yet; EMQX 5.x ships production support.
- **Part Real-time A/V / "RTP and RTCP"** — RTP-over-QUIC (`draft-ietf-avtcore-rtp-over-quic-14`) entered WG Last Call July 2025; preserves the RTP ecosystem inside a QUIC envelope.
- **Part Real-time A/V / "WebRTC"** — the only way for a browser to send a UDP packet today, and the protocol the WebTransport API will partially generalise.
- **Part Real-time A/V / "MoQ Transport"** — sub-second live streaming over QUIC, the first IETF media transport that intentionally is not RTP, and the working-group fork drama.
- **Part Utilities & Security / "SSH"** — first widely-deployed protocol to ship post-quantum crypto by default (OpenSSH 10.0, April 2025), six months before TLS X25519MLKEM768 reached default-on in iOS 26.
- **Part Patterns & Failures / "Recurring Patterns"** — handshakes, sliding windows, keepalives, ECN, consistent hashing — the engineering vocabulary every new transport, including QUIC, instantiates.
- **Part Patterns & Failures / "Failure Modes"** — bufferbloat, ossification, head-of-line blocking, MTU black holes — the bestiary QUIC was designed to dodge.
- **Part Patterns & Failures / "A History of Congestion Control"** — Tahoe through Reno through CUBIC through BBR through L4S, all of which now ship inside QUIC.
- **Part Frontier / "Ultra Ethernet"** — the AI-training-fabric transport whose design pressures (packet spraying, selective retransmission, connectionless transport state) echo many QUIC choices.
- **Part How to Learn More / "RFCs Worth Reading"** — RFC 9000 is on the short list, with sections 2.1 (streams), 9 (migration), and 0-RTT singled out.
- **Part How to Learn More / "Blogs"** and **"Tools"** — Cloudflare blog, Daniel Stenberg, Wireshark, curl, qvis.

## See also

If you have heard the **TCP episode**, the contrast is everything: same job (reliable byte-stream transport with congestion control), totally different deployment story. TCP lives in the kernel, gets standardised slowly, and is the protocol QUIC was designed to replace. QUIC re-implements the reliable bytestream, congestion control, and loss recovery in user space, and adds streams, encryption, and migration on top. TCP HOL blocking across multiplexed HTTP/2 streams is the canonical "why QUIC exists" example.

If you have heard the **UDP episode**, QUIC is the reason UDP went from a niche transport (DNS, NTP, RTP) to the fastest-growing protocol on the internet by relative volume. Choosing UDP as the substrate — rather than asking middleboxes to forward a brand-new IP protocol number — was QUIC's most important deployment decision, and the one SCTP failed to make.

If you have heard the **TLS episode**, QUIC depends on TLS 1.3 for key negotiation but does not run TLS as a sub-layer. Instead, QUIC carries TLS handshake records inside CRYPTO frames and uses TLS exporter keys to seed AEAD per packet — that is RFC 9001. There is no DTLS in this stack; that was an early option that lost.

If you have heard the **HTTP/2 episode**, QUIC supersedes parts of it: streams, multiplexing, server push (deprecated in HTTP/3), HPACK (replaced by QPACK). HTTP/3 is HTTP semantics plus QUIC streams plus QPACK; everything else is the same.

If you have heard the **HTTP/3 episode**, QUIC is what it runs on. Each request and response is one bidirectional QUIC stream; control streams carry SETTINGS and QPACK encoder/decoder data. A "connection" to an origin is one QUIC connection multiplexing all the requests.

## Visual cues for image generation

- A side-by-side handshake comparison: TCP plus TLS 1.3 (two round-trips before app data, four arrows) versus QUIC 1-RTT (one round-trip, two arrows) versus QUIC 0-RTT (client sends data in the very first packet, one arrow). Time scale on the left, milliseconds annotated.
- A QUIC packet anatomy: long-header form on the left (Header Form, Fixed Bit, type bits, Version, DCIL/DCID, SCIL/SCID, type-specific fields), short header on the right (Header Form, Fixed Bit, Spin Bit, Reserved, Key Phase, Packet Number Length, DCID, encrypted Packet Number). Encrypted regions shaded; Connection ID highlighted as the field that survives migration.
- A phone walking out of a coffee shop. Two arrows from the phone — one to a Wi-Fi router (cut off as it leaves range), one to a cell tower (newly active). Above both, a single horizontal QUIC connection line labelled with one Connection ID. Caption: "Same connection, two paths, no reconnect."
- The frame-type table from RFC 9000 §19 as a colour-coded grid: PADDING/PING grey, ACK green, STREAM/RESET_STREAM/STOP_SENDING blue, CRYPTO yellow, NEW_CONNECTION_ID/RETIRE_CONNECTION_ID/PATH_CHALLENGE/PATH_RESPONSE purple, CONNECTION_CLOSE red, DATAGRAM (RFC 9221) orange, ACK_FREQUENCY (draft) outlined.
- Cloudflare's 2024 broadcast amplification incident as a diagram: one 1200-byte Initial packet on the left arriving at a broadcast IP, then 384 reply packets fanning out from a 128-core edge box on the right. A red "amplification factor 384x" label.
- An adoption stack chart of HTTP versions on Cloudflare-observed traffic in Q1 2026 — HTTP/1.1 around 28%, HTTP/2 around 51%, HTTP/3 (over QUIC) around 21%. A second chart next to it: Meta's internal traffic, with QUIC over 75%.

## Sources

**RFCs**

- [RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC 8999 — Version-Independent Properties of QUIC](https://www.rfc-editor.org/rfc/rfc8999.html)
- [RFC 9001 — Using TLS to Secure QUIC](https://datatracker.ietf.org/doc/html/rfc9001)
- [RFC 9002 — QUIC Loss Detection and Congestion Control](https://datatracker.ietf.org/doc/html/rfc9002)
- [RFC 9114 — HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 9204 — QPACK](https://datatracker.ietf.org/doc/rfc9204/)
- [RFC 9221 — An Unreliable Datagram Extension to QUIC](https://datatracker.ietf.org/doc/html/rfc9221)
- [RFC 9250 — DNS over Dedicated QUIC Connections](https://www.rfc-editor.org/rfc/rfc9250.html)
- [RFC 9287 — Greasing the QUIC Bit](https://datatracker.ietf.org/doc/rfc9287/)
- [RFC 9298 — Proxying UDP in HTTP](https://datatracker.ietf.org/doc/html/rfc9298)
- [RFC 9308 — Applicability of the QUIC Transport Protocol](https://www.rfc-editor.org/rfc/rfc9308.html)
- [RFC 9368 — Compatible Version Negotiation for QUIC](https://datatracker.ietf.org/doc/html/rfc9368)
- [RFC 9369 — QUIC Version 2](https://datatracker.ietf.org/doc/html/rfc9369)
- [draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/)
- [draft-ietf-quic-ack-frequency](https://datatracker.ietf.org/doc/draft-ietf-quic-ack-frequency/)
- [draft-ietf-quic-reliable-stream-reset](https://datatracker.ietf.org/doc/draft-ietf-quic-reliable-stream-reset/)
- [draft-ietf-quic-qlog-main-schema](https://datatracker.ietf.org/doc/html/draft-ietf-quic-qlog-main-schema)
- [draft-ietf-webtrans-http3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)

**Papers**

- [Langley et al., "The QUIC Transport Protocol: Design and Internet-Scale Deployment," SIGCOMM 2017](https://doi.org/10.1145/3098822.3098842)
- [Marx et al., "Visualizing QUIC and HTTP/3 with qlog and qvis," SIGCOMM 2020 demo](https://dl.acm.org/doi/10.1145/3405837.3412356)
- [Marx et al., "Debugging QUIC and HTTP/3 with qlog and qvis," ANRW 2020](https://dl.acm.org/doi/abs/10.1145/3404868.3406663)
- [Bünstorf and Jaeger, "MsQuic — A High-speed QUIC Implementation," TUM NET-2023-11](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2023-11-1/NET-2023-11-1_01.pdf)
- ["QUIC on the Fast Lane," ScienceDirect 2024](https://www.sciencedirect.com/science/article/pii/S014036642400166X)
- ["Demystifying QUIC from the Specifications," arXiv 2511.08375](https://arxiv.org/html/2511.08375v1)
- [Chen, Jaeger, Zirngibl, "RFC 9000 and its Siblings: An Overview of QUIC Standards," TUM NET-2024-04](https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-04-1/NET-2024-04-1_02.pdf)

**Vendor and engineering blogs**

- [Cloudflare — The Road to QUIC](https://blog.cloudflare.com/the-road-to-quic/)
- [Cloudflare — Accelerating UDP packet transmission for QUIC](https://blog.cloudflare.com/accelerating-udp-packet-transmission-for-quic/)
- [Cloudflare — Async QUIC and HTTP/3 made easy: tokio-quiche is now open source](https://blog.cloudflare.com/async-quic-and-http-3-made-easy-tokio-quiche-is-now-open-source/)
- [Cloudflare — Mitigating broadcast address QUIC amplification](https://blog.cloudflare.com/mitigating-broadcast-address-attack/)
- [Cloudflare — Examining HTTP/3 usage one year on](https://blog.cloudflare.com/http3-usage-one-year-on/)
- [Cloudflare — Media over QUIC](https://blog.cloudflare.com/moq/)
- [Cloudflare — iCloud Private Relay](https://blog.cloudflare.com/icloud-private-relay/)
- [Meta engineering — How Facebook is bringing QUIC to billions](https://engineering.fb.com/2020/10/21/networking-traffic/how-facebook-is-bringing-quic-to-billions/)
- [Fastly — The Maturing of QUIC](https://www.fastly.com/blog/maturing-of-quic)
- [Fastly — QUIC is now RFC 9000](https://www.fastly.com/blog/quic-is-now-rfc-9000)
- [Akamai — The Next Generation of HTTP](https://www.akamai.com/blog/news/the-next-generation-of-http)
- [Akamai — A QUIC Shutdown: SMB-over-QUIC DoS](https://www.akamai.com/blog/security-research/smb-over-quic-dos-windows-servers)
- [quic-go documentation — Connection Migration, Optimizations, Transport](https://quic-go.net/docs/quic/connection-migration/)
- [Tailscale — Enhance UDP throughput for QUIC and HTTP/3 on Linux](https://tailscale.com/blog/quic-udp-throughput)
- [AWS — s2n-quic BBRv2 design (issue #1202)](https://github.com/aws/s2n-quic/issues/1202)
- [Google research — The QUIC Transport Protocol paper page](https://research.google/pubs/the-quic-transport-protocol-design-and-internet-scale-deployment/)

**Standards-body and tooling**

- [IETF QUIC Working Group](https://quicwg.org/)
- [QUIC implementations list](https://quicwg.org/implementations)
- [QUIC Interop Runner (GitHub)](https://github.com/quic-interop/quic-interop-runner)
- [qvis — qlog/pcap visualizer](https://qvis.quictools.info/)
- [quiclog/qvis on GitHub](https://github.com/quiclog/qvis)
- [Cloudflare quiche](https://github.com/cloudflare/quiche)
- [Microsoft msquic](https://github.com/microsoft/msquic)
- [quic-go on GitHub](https://github.com/quic-go/quic-go)
- [Xin Long's in-kernel QUIC for Linux](https://github.com/lxin/quic)

**News and reviews**

- [HTTP/3 is at 35% adoption — DEV.to summary](https://dev.to/linou518/http3-is-at-35-adoption-you-cant-call-quic-a-future-technology-anymore-2ghm)
- [Cloudflare Radar 2025 Year in Review summary](https://almcorp.com/blog/cloudflare-radar-2025-year-in-review-complete-analysis/)
- [APNIC blog — Investigation into Apple's relay network](https://blog.apnic.net/2023/01/25/an-investigation-into-apples-new-relay-network/)
- [Microsoft msquic security advisory GHSA-2x7m-gf85-3745](https://github.com/microsoft/msquic/security/advisories/GHSA-2x7m-gf85-3745)
- [GitLab advisory — CVE-2026-32179 in msquic](https://advisories.gitlab.com/nuget/microsoft.native.quic.msquic.openssl/CVE-2026-32179/)

**Books and courses**

- [Daniel Stenberg, HTTP/3 Explained (free GitBook)](https://http3-explained.haxx.se/en)
- [Stanford CS144 — Introduction to Computer Networking](https://cs144.github.io/)

**Wikipedia**

- [QUIC](https://en.wikipedia.org/wiki/QUIC)
- [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- [Head-of-line blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking)
- [Jim Roskind](https://en.wikipedia.org/wiki/Jim_Roskind)
- [User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol)
- [OSI model](https://en.wikipedia.org/wiki/OSI_model)
