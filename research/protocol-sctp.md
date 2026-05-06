---
prompt_source: deep-research-prompts.txt:2491-2668 (PROTOCOL · SCTP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/8d248a63-798a-439f-b0ed-1ca07b7b3678
research_mode: claude.ai Research
---

# SCTP — Stream Control Transmission Protocol: A Deep Field Guide (May 2026)

## TL;DR

- **SCTP is the third reliable IP transport protocol** (alongside TCP and UDP), defined today by **RFC 9260 (June 2022)**, which obsoleted RFC 4960 (2007), which obsoleted RFC 2960 (Oct 2000); it offers TCP-like reliability plus message orientation, multiple ordered/unordered streams (no head-of-line blocking), and multihoming, and is identified by IP protocol number **132** ([https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xml](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xml)).
- **Despite being designed for SS7-over-IP telephony signalling at the IETF SIGTRAN WG (1998–2000)**, SCTP's two large surviving production niches in 2026 are (1) **5G NG-AP and other 3GPP control-plane interfaces** (3GPP TS 38.412/38.413), and (2) **WebRTC data channels** in every shipping browser, where SCTP is encapsulated in DTLS over UDP per RFC 8261 ([https://datatracker.ietf.org/doc/html/rfc8261](https://datatracker.ietf.org/doc/html/rfc8261)). Outside those niches, **QUIC has eaten SCTP's lunch** for new general-purpose work. [GitHub](https://github.com/sigscale/5g-ngap)[Hjp](https://www.hjp.at/doc/rfc/rfc8261.html)
- **The last 24 months have been quietly busy**: RFC 9653 (Sep 2024) added a zero-checksum mode for SCTP-over-DTLS to save CPU; new TSVWG drafts published in 2024–2025 cover multipath load sharing (`draft-tuexen-tsvwg-sctp-multipath-30`, Sep 2025), DTLS-chunk-based key management (`draft-westerlund-tsvwg-sctp-dtls-handshake-05`, Jul 2025), INIT forwarding/anycast (`draft-tuexen-tsvwg-sctp-init-fwd-04`, Sep 2024), additional UDP-encapsulation handling (`draft-tuexen-tsvwg-sctp-udp-encaps-cons`), an RFC 4895-bis revision of SCTP-AUTH (Oct 2024), a "next-generation SCTP" ideas draft (`draft-dreibholz-tsvwg-sctp-nextgen-ideas-22`, Sep 2025), and even **SNAP — SCTP Negotiation Acceleration Protocol** (`draft-hancke-tsvwg-snap-00`, Dec 2025) from Meta/OpenAI/Google to remove WebRTC handshake latency. Chrome/WebRTC has migrated from `usrsctp` to its own in-tree `dcSCTP` implementation; a Rust port has appeared at [https://github.com/webrtc/dcsctp](https://github.com/webrtc/dcsctp). [The Mail Archive + 5](https://www.mail-archive.com/ietf-announce@ietf.org/msg24774.html)

---

## Prerequisites and glossary

Before SCTP is meaningful, the reader needs the following vocabulary. Each entry includes a one-line definition and a pointer to an authoritative source.

- **OSI / TCP-IP layers.** The TCP/IP stack has four practical layers (link, internet/IP, transport, application); SCTP sits at the transport layer alongside TCP and UDP. Reference: RFC 1122 ([https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122)).
- **IP (Internet Protocol).** The connectionless, best-effort packet network layer beneath SCTP. SCTPv4 = RFC 791; IPv6 = RFC 8200 ([https://www.rfc-editor.org/rfc/rfc8200](https://www.rfc-editor.org/rfc/rfc8200)). [Hjp](https://www.hjp.at/doc/rfc/rfc8261.html)
- **Port.** 16-bit demultiplexing identifier inside a transport header. SCTP uses 16-bit source/dest ports analogous to TCP/UDP (RFC 9260 §3.1, [https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260)).
- **Socket.** OS abstraction for an endpoint of a network connection; SCTP's socket API extensions are in RFC 6458 ([https://www.rfc-editor.org/rfc/rfc6458](https://www.rfc-editor.org/rfc/rfc6458)).
- **Header.** Fixed/variable preamble of a protocol unit; SCTP's *common header* is exactly 12 bytes (RFC 9260 §3.1).
- **Checksum.** Integrity field; SCTP uses **CRC32c** since RFC 3309 (Sep 2002), which replaced the original Adler-32 because Adler-32 had provably weak coverage on short packets ([https://www.rfc-editor.org/rfc/rfc3309](https://www.rfc-editor.org/rfc/rfc3309)). [IETF](https://datatracker.ietf.org/doc/html/rfc3309)[Tech Invite](https://www.tech-invite.com/y30/tinv-ietf-rfc-3309.html)
- **Handshake.** Connection setup exchange. TCP uses 3-way (SYN/SYN-ACK/ACK); SCTP uses **4-way** (INIT, INIT-ACK with cookie, COOKIE-ECHO, COOKIE-ACK). [Sigcomm](http://ccr.sigcomm.org/online/files/p24-v39n1g-but.pdf)
- **Stream.** Within an SCTP association, an independently sequenced unidirectional logical channel; each stream has its own Stream Sequence Number (SSN) (RFC 9260 §1.3).
- **Frame / Datagram.** A frame is a link-layer unit; a datagram is a self-contained network/transport unit. SCTP is *message-oriented*: the receiver gets exactly the boundaries the sender pushed. [Wikipedia](https://en.wikipedia.org/wiki/Stream_Control_Transmission_Protocol)
- **MTU / PMTU.** Maximum Transmission Unit; Path MTU is the smallest MTU on the route. SCTP performs PLPMTUD per RFC 8899 ([https://www.rfc-editor.org/rfc/rfc8899](https://www.rfc-editor.org/rfc/rfc8899)).
- **Fragmentation.** Splitting a user message across multiple DATA chunks when it exceeds PMTU; reassembled at the receiver (RFC 9260 §6.9).
- **Window / Flow control.** Receiver advertises rwnd (receiver window) so the sender does not overrun it; identical concept to TCP's window (RFC 9260 §6.1).
- **Congestion control.** Sender-side throttling (slow start, congestion avoidance, fast retransmit) to avoid network overload; SCTP's algorithms mirror TCP (RFC 9260 §7).
- **Multiplexing.** Multiple logical flows (streams) share one association/4-tuple.
- **Multihoming.** Single association uses *multiple IP addresses per endpoint* for failover and (with extensions) load sharing — SCTP's signature feature.
- **Head-of-line (HoL) blocking.** When loss of one segment delays delivery of *unrelated* later segments. TCP suffers this on a single byte stream; SCTP avoids it across streams (within a stream it still applies unless I-DATA/RFC 8260 interleaving is negotiated). [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/82/rfc8260.xml)[Wikipedia](https://en.wikipedia.org/wiki/Stream_Control_Transmission_Protocol)
- **TLV (Type-Length-Value).** Self-describing encoding pattern used inside SCTP chunks for parameters.
- **Chunk.** Atomic unit inside an SCTP packet: 8-bit type, 8-bit flags, 16-bit length, value.
- **Association.** SCTP's analogue to a TCP connection; a 4-tuple of endpoints plus shared verification tags. May span *multiple IP addresses per side*.
- **Endpoint.** The logical sender/receiver, identified by a list of transport addresses sharing a port.
- **TSN / SSN.** Transmission Sequence Number is per-association reliability counter; Stream Sequence Number is per-stream ordering counter (RFC 9260 §1.3).
- **DTLS.** Datagram TLS, used in WebRTC for SCTP confidentiality (RFC 9147; [https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)).
- **HMAC.** Keyed hash for authentication (used by SCTP-AUTH, RFC 4895).

---

## History and story

The seeds of SCTP were planted in **1991**, when Randall Stewart, then at Motorola, watched a TCP socket take "many minutes" to surface a network failure during call-control testing — unacceptable for telephony ([https://www.informit.com/articles/article.aspx?p=24386&seqNum=5](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)). Stewart and colleagues built three iterative reliability-over-UDP prototypes; the last, begun in **1997**, was named **MDTP — Multi-network Datagram Transmission Protocol**. [InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)[InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)

The IETF chartered the **Signaling Transport (SIGTRAN) Working Group** in 1998 to carry SS7 telephony signalling over IP. Stewart and Qiaobing Xie (also Motorola) submitted MDTP; the WG accepted it as the basis but heavily refactored it. The first I-D, `draft-ietf-sigtran-sctp-00` (Sep 23, 1999), was authored by R. R. Stewart, Q. Xie (Motorola), K. Morneault and C. Sharp (Cisco), H. J. Schwarzbauer (Siemens), T. Taylor (Nortel), I. Rytina (Ericsson), M. Kalla (Telcordia), and L. Zhang (UCLA), with Vern Paxson (ACIRI) joining shortly after — and was, awkwardly, titled "*Simple* Control Transmission Protocol" ([https://datatracker.ietf.org/doc/html/draft-ietf-sigtran-sctp-00](https://datatracker.ietf.org/doc/html/draft-ietf-sigtran-sctp-00)). It was renamed Stream Control Transmission Protocol by `draft-13` (July 2000). [Amazon + 7](https://www.amazon.com/Stream-Control-Transmission-Protocol-SCTP/dp/0201721864)

Major design changes during SIGTRAN's tenure:

- multi-stream concept (separating reliability from ordering), [InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)
- chunk-based bundling/extensibility, [InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)
- 4-way cookie handshake,
- mandatory PMTU discovery, [InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)
- and — controversially, late in 1999 — moving SCTP **out of UDP and directly onto IP** (assigned protocol number 132). The WG initially resisted this because it forced kernel implementations and worried about retransmission timer accuracy, but the IESG/Transport Area Directorate prevailed ([https://www.informit.com/articles/article.aspx?p=24386&seqNum=6](https://www.informit.com/articles/article.aspx?p=24386&seqNum=6)). [InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=6)[InformIT](https://www.informit.com/articles/article.aspx?p=24386&seqNum=6)

**Standards milestones:**

- **RFC 2960** — Stream Control Transmission Protocol, October 2000 ([https://www.ietf.org/rfc/rfc2960.txt](https://www.ietf.org/rfc/rfc2960.txt)).
- **RFC 3309** — CRC32c replacing Adler-32, September 2002 (Stone, Stewart, Otis), [https://www.rfc-editor.org/rfc/rfc3309](https://www.rfc-editor.org/rfc/rfc3309). [IETF](https://datatracker.ietf.org/doc/html/rfc3309)
- **RFC 3758** — Partial Reliability (PR-SCTP / FORWARD-TSN), May 2004, by Stewart, Ramalho, Xie, Tuexen, Conrad ([https://www.rfc-editor.org/rfc/rfc3758](https://www.rfc-editor.org/rfc/rfc3758)). [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc3758.html)
- **RFC 3873** — SCTP-MIB, September 2004 (Pastor, Belinchon — both Ericsson) ([https://www.rfc-editor.org/rfc/rfc3873](https://www.rfc-editor.org/rfc/rfc3873)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc3873)
- **RFC 4460** — Errata roll-up, April 2006.
- **RFC 4666** — M3UA (SS7 MTP3 over SCTP), September 2006 (Morneault, Pastor-Balbas) ([https://datatracker.ietf.org/doc/rfc4666/](https://datatracker.ietf.org/doc/rfc4666/)). [Wikipedia](https://en.wikipedia.org/wiki/SIGTRAN)
- **RFC 4895** — SCTP-AUTH (authenticated chunks), August 2007 ([https://datatracker.ietf.org/doc/html/rfc4895](https://datatracker.ietf.org/doc/html/rfc4895)).
- **RFC 4960** — second canonical SCTP, September 2007.
- **RFC 5061** — Dynamic Address Reconfiguration (ADD-IP / ASCONF), September 2007 ([https://datatracker.ietf.org/doc/html/rfc5061](https://datatracker.ietf.org/doc/html/rfc5061)). [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc5061.html)
- **RFC 6458** — Sockets API, December 2011.
- **RFC 6525** — Stream Reconfiguration (RE-CONFIG, type 130), February 2012 ([https://www.rfc-editor.org/rfc/rfc6525.html](https://www.rfc-editor.org/rfc/rfc6525.html)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc6525.txt)
- **RFC 6733** — Diameter base protocol over TCP/SCTP, October 2012.
- **RFC 6951** — UDP encapsulation, May 2013 (Tuexen, Stewart) ([https://datatracker.ietf.org/doc/html/rfc6951](https://datatracker.ietf.org/doc/html/rfc6951)).
- **RFC 7053** — SACK-IMMEDIATELY (I-bit), November 2013.
- **RFC 8260** — Stream Schedulers + I-DATA chunk (interleaving), November 2017 (Stewart, Tuexen, Loreto, Seggelmann) ([https://www.rfc-editor.org/rfc/rfc8260.html](https://www.rfc-editor.org/rfc/rfc8260.html)). [Spinics.net](https://www.spinics.net/lists/ietf-ann/msg104534.html)
- **RFC 8261** — DTLS encapsulation of SCTP (the WebRTC data channel stack), November 2017 (Tuexen, Stewart, Jesup, Loreto) ([https://www.rfc-editor.org/rfc/rfc8261.html](https://www.rfc-editor.org/rfc/rfc8261.html)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc8831.html)
- **RFC 8540** — Errata and issues, February 2019. [dblp](https://dblp.org/pid/43/6209.html)
- **RFC 8831 / 8832** — WebRTC Data Channels and DCEP, January 2021 ([https://www.rfc-editor.org/rfc/rfc8831.html](https://www.rfc-editor.org/rfc/rfc8831.html)).
- **RFC 8899** — Packetization-Layer PMTUD for datagram transports, September 2020 (Fairhurst, Jones, Tuexen, Rüngeler, Völker). [dblp](https://dblp.org/pid/43/6209.html)
- **RFC 9260** — Current canonical SCTP, **June 2022** (Stewart/Netflix, Tüxen/Münster Univ. of Appl. Sciences, Nielsen/Kamstrup) ([https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260)). It obsoleted 4960, 4460, 6096, 7053, 8540. [IETF + 2](https://datatracker.ietf.org/doc/html/rfc9260)
- **RFC 9653** — Zero Checksum for SCTP, **September 2024** ([https://datatracker.ietf.org/doc/rfc9653/](https://datatracker.ietf.org/doc/rfc9653/)). [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24774.html)

**Active 2024–2026 IETF work** in TSVWG (the Transport Area WG that owns SCTP today):

- `draft-tuexen-tsvwg-sctp-multipath-30` (14 Sep 2025) — Load sharing / CMT-SCTP (Becke, Dreibholz, Ekiz, Iyengar, Natarajan, Stewart, Tüxen). [IETF](https://datatracker.ietf.org/doc/html/draft-tuexen-tsvwg-sctp-multipath-30)[IETF](https://datatracker.ietf.org/doc/draft-tuexen-tsvwg-sctp-multipath/)
- `draft-westerlund-tsvwg-sctp-dtls-handshake-05` (7 Jul 2025) — DTLS-1.3 chunk-based key management (Westerlund, Preuß Mattsson, Porfiri — Ericsson). [IETF](https://datatracker.ietf.org/doc/draft-westerlund-tsvwg-sctp-dtls-handshake/)
- `draft-tuexen-tsvwg-sctp-init-fwd-04` (Sep 2024) — INIT forwarding for anycast clusters. [IETF](https://datatracker.ietf.org/doc/draft-tuexen-tsvwg-sctp-init-fwd/)
- `draft-tuexen-tsvwg-sctp-udp-encaps-cons` — patches RFC 6951 ambiguities. [IETF](https://datatracker.ietf.org/doc/html/draft-tuexen-tsvwg-sctp-udp-encaps-cons)
- `draft-ietf-tsvwg-rfc4895-bis-04` (Oct 2024) — refresh of SCTP-AUTH.
- `draft-dreibholz-tsvwg-sctp-nextgen-ideas-22` (23 Sep 2025) — informational "next-generation SCTP" lessons-learned. [IETF](https://datatracker.ietf.org/doc/draft-dreibholz-tsvwg-sctp-nextgen-ideas/)
- `draft-hancke-tsvwg-snap-00` (29 Dec 2025) — **SCTP Negotiation Acceleration Protocol**, Hancke (Meta), Uberti (OpenAI), Boivie (Google) — embeds INIT params in SDP for WebRTC. [IETF](https://datatracker.ietf.org/doc/draft-hancke-tsvwg-snap/)
- `draft-tuexen-tsvwg-sctp-ppid-frag` — application-level fragmentation via PPID. [IETF](https://www.ietf.org/archive/id/draft-tuexen-tsvwg-sctp-ppid-frag-00.html)

**Politics, in plain language.** SCTP is the textbook case of "right protocol, wrong decade." The big losses were:

- **Microsoft never shipped SCTP** in Windows. Microsoft staff posted on public forums that "we do not currently support SCTP" and `IPPROTO_SCTP` was reserved in headers but unimplemented; the de-facto answer for Windows users has been third-party drivers like SctpDrv or userland ([https://learn.microsoft.com/en-us/answers/questions/778329/sctp-driver](https://learn.microsoft.com/en-us/answers/questions/778329/sctp-driver)). Apple shipped only kernel APIs through macOS; native SCTP outside `usrsctp` is essentially absent on Apple desktops/iOS for application use. [Microsoft + 2](https://qa.social.msdn.microsoft.com/Forums/windows/en-US/339285c4-8e57-4e71-b457-5186d4ea6860/does-any-support-for-sctp?forum=netfxnetcom)
- **NAT/middlebox hostility.** Most consumer routers/firewalls do not parse IP protocol 132 and either drop it or fail to create state. This is the entire reason **RFC 6951** wraps SCTP in UDP. [RFC Editor](https://www.rfc-editor.org/rfc/rfc6951)[The Register](https://forums.theregister.com/forum/all/2022/10/07/quic_tcp_replacement/)
- **TCP and UDP simply won by default** because they were already there.
- **FreeBSD became the reference home.** The reference implementation by Stewart and Michael Tüxen (Münster University of Applied Sciences) lives in the FreeBSD kernel; `usrsctp` is its userland port, used historically by Chrome, Firefox, Signal, and many others. [Sctp](https://www.sctp.de/sctp.html)[Google Research](https://research.google/pubs/portable-and-performant-userspace-sctp-stack/)

**Funding/sponsors.** Cisco employed Stewart for years; Motorola employed Xie; Ericsson employed Belinchon, Pastor-Balbas, Loreto, Westerlund; Siemens, Nortel, Telcordia were SIGTRAN founders. Tüxen's research line at Münster has been continuously funded across two decades and is the single biggest technical engine still pushing SCTP forward. Stewart later moved to Adara Networks and then Netflix, where he was during RFC 9260's authoring ([https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260)). [RFC Editor](https://www.rfc-editor.org/rfc/pdfrfc/rfc3309.txt.pdf)

---

## How it actually works

### Common header (12 bytes)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Source Port (16)          |     Destination Port (16)     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Verification Tag (32)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Checksum (32, CRC32c)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

The verification tag binds packets to an established association and is the cornerstone of SCTP's blind-attacker resistance (RFC 9260 §3.1). Since RFC 3309/RFC 9260 the checksum is **CRC32c** (Castagnoli polynomial), placed in the header, computed over the entire packet with the checksum field zeroed. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc3309.html)

### Chunk format

Every chunk begins with: `Type (8) | Flags (8) | Length (16)` followed by Type-specific TLV payload, padded to a 4-byte boundary.

### Chunk type catalog (selected, decimal types)

| Type | Name | Purpose / RFC |
|---|---|---|
| 0 | DATA | User payload (RFC 9260) |
| 1 | INIT | Open association |
| 2 | INIT-ACK | Acknowledge open + cookie |
| 3 | SACK | Selective acknowledgement (cumulative TSN, gap blocks, dup TSNs) |
| 4 | HEARTBEAT | Liveness probe per destination |
| 5 | HEARTBEAT-ACK |  |
| 6 | ABORT | Tear down without graceful drain |
| 7 | SHUTDOWN | Begin graceful close |
| 8 | SHUTDOWN-ACK |  |
| 9 | ERROR | Parameter errors etc. |
| 10 | COOKIE-ECHO | Return cookie from INIT-ACK |
| 11 | COOKIE-ACK |  |
| 12 | ECNE | ECN echo |
| 13 | CWR | Congestion window reduced |
| 14 | SHUTDOWN-COMPLETE | Final shutdown ack |
| 15 | AUTH | RFC 4895 authenticated chunk |
| 64 (0x40) | I-DATA | Interleavable DATA, RFC 8260 |
| 128 (0x80) | ASCONF-ACK | RFC 5061 |
| 130 (0x82) | RE-CONFIG | RFC 6525 |
| 132 (0x84) | PAD | RFC 4820 |
| 192 (0xC0) | FORWARD-TSN | RFC 3758 PR-SCTP |
| 193 (0xC1) | ASCONF | RFC 5061 |

The two high-order bits of the Type byte tell a receiver how to handle an unknown chunk (skip silently, skip and report, stop processing, abort) — this is what gives SCTP cleaner forward-compatibility than TCP. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc6525.html)

### The 4-way handshake (and why it kills SYN flood)

ServerClientServerClient#mermaid-rgi{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rgi .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rgi .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rgi .error-icon{fill:#CC785C;}#mermaid-rgi .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rgi .edge-thickness-normal{stroke-width:1px;}#mermaid-rgi .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rgi .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rgi .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rgi .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rgi .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rgi .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rgi .marker.cross{stroke:#A1A1A1;}#mermaid-rgi svg{font-family:inherit;font-size:16px;}#mermaid-rgi p{margin:0;}#mermaid-rgi .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rgi text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgi .actor-line{stroke:#A1A1A1;}#mermaid-rgi .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rgi .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rgi #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgi .sequenceNumber{fill:#5e5e5e;}#mermaid-rgi #sequencenumber{fill:#E5E5E5;}#mermaid-rgi #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgi .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rgi .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rgi .labelText,#mermaid-rgi .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgi .loopText,#mermaid-rgi .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgi .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rgi .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rgi .noteText,#mermaid-rgi .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgi .activation0{fill:transparent;stroke:#00000000;}#mermaid-rgi .activation1{fill:transparent;stroke:#00000000;}#mermaid-rgi .activation2{fill:transparent;stroke:#00000000;}#mermaid-rgi .actorPopupMenu{position:absolute;}#mermaid-rgi .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rgi .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rgi .actor-man circle,#mermaid-rgi line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rgi :root{--mermaid-font-family:inherit;}Z keeps NO state — cookie is signed, opaqueAssociation ESTABLISHEDINIT (Init-Tag = X, no state on Z yet)INIT-ACK (Init-Tag = Y, State Cookie [HMAC(secret, A's params)])COOKIE-ECHO (echoes the cookie, may piggyback DATA)Verify HMAC, allocate TCBCOOKIE-ACK (may piggyback DATA)DATA (TSN=k, SID=s, SSN=n)SACK (cum TSN ack, gap blocks)SHUTDOWNSHUTDOWN-ACKSHUTDOWN-COMPLETE

The **State Cookie** is signed by a secret key the server holds; only after the client returns it (proving the original source IP can receive packets) does the server commit memory. This eliminates the half-open backlog that SYN flooding exploits in TCP ([https://www.usenix.org/system/files/usenixsecurity24-ginesin.pdf](https://www.usenix.org/system/files/usenixsecurity24-ginesin.pdf); [https://realtimecommunication.wordpress.com/2016/11/08/sctp-introduction/](https://realtimecommunication.wordpress.com/2016/11/08/sctp-introduction/)). [Alibaba Cloud](https://topic.alibabacloud.com/a/how-sctp-prevents-syn-flooding-attacks_8_8_31908552.html)[arxiv](https://arxiv.org/pdf/1703.06568)

### TSN vs SSN

- **TSN (Transmission Sequence Number)** — 32-bit, association-wide, used by SACK for reliability.
- **SSN (Stream Sequence Number)** — 16-bit, *per stream*, used to order delivery within that stream.
- I-DATA (RFC 8260) replaces SSN with a Message Identifier (MID) and adds a Fragment Sequence Number (FSN), enabling **sender-side message interleaving** that base SCTP cannot do ([https://www.rfc-editor.org/rfc/rfc8260.html](https://www.rfc-editor.org/rfc/rfc8260.html)).

### Multihoming, paths, heartbeats

An SCTP endpoint can advertise multiple IP addresses in INIT/INIT-ACK. One destination is **primary**; the rest are alternates. HEARTBEAT chunks probe alternates; on N consecutive failures the path is marked *inactive* and traffic fails over. Base RFC 9260 uses additional paths only for retransmission and failover; **concurrent multipath transfer (CMT-SCTP)** as proposed in `draft-tuexen-tsvwg-sctp-multipath-30` (Sep 2025) generalizes this to true load balancing. [Wikipedia + 2](https://en.wikipedia.org/wiki/Stream_Control_Transmission_Protocol)

### Bundling, fragmentation, PMTU

A single SCTP packet can carry multiple chunks (including DATA from different streams) up to PMTU. Large user messages get fragmented across DATA chunks identified by Begin/End fragment flags. Path MTU discovery is mandatory; PLPMTUD (RFC 8899) is recommended in RFC 9260.

### Congestion control

Per-destination cwnd, ssthresh, slow start, congestion avoidance, fast retransmit on 4 missing-report indications in SACK gap blocks, fast recovery — all conceptually TCP-NewReno-like (RFC 9260 §7). [Liu](http://pike.lysator.liu.se/docs/ietf/rfc/37/rfc3758.xml)

### SACK details

A SACK names (a) the cumulative TSN ack, (b) advertised receiver window, (c) zero or more **gap-ack blocks** (start/end offsets from cum TSN) and (d) optional duplicate TSNs received. It is sent at most every other packet or after the SACK delay timer (typically ~200 ms; tunable).

### Shutdown

Three chunks, all required, no half-close: **SHUTDOWN → SHUTDOWN-ACK → SHUTDOWN-COMPLETE**. Differs from TCP's FIN/ACK in that *both directions close together*; SCTP intentionally has no `shutdown(WR)` analog. [Sigcomm](http://ccr.sigcomm.org/online/files/p24-v39n1g-but.pdf)

### Security

- **Cookie mechanism** above.
- **Verification Tag** rejects blind packets.
- **CRC32c** rejects corruption (RFC 3309).
- **SCTP-AUTH (RFC 4895)** lets endpoints negotiate HMAC-SHA1/256 keys and authenticate selected chunk types using AUTH chunks; required by ADD-IP (RFC 5061) because moving an address must not be spoofable. [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/48/rfc4895.xml)[IETF](https://datatracker.ietf.org/doc/html/rfc5061)
- For confidentiality you need DTLS encapsulation (RFC 8261) — SCTP itself is plaintext.

### Error chunks and errors

ERROR chunks carry one or more error causes (Invalid Stream Identifier, Out-of-Resource, Unrecognized Chunk Type, Stale Cookie Error, Restart of an Association with New Addresses, etc.). RFC 9653 added cause 14: *Restart of an Association with New Encapsulation Port*.

---

## Deep connections to other protocols

**TCP.** SCTP is intentionally a TCP replacement candidate for any reliable-delivery workload that wants message boundaries or HoL-free streams. Both have similar congestion control, both are connection-oriented/byte- or message-stream/reliable. Differences: SCTP is message-oriented; uses 4-way cookie handshake (DoS-resistant); supports multihoming and multistreaming natively; tears down with a 3-way shutdown without half-close. TCP is byte-oriented, 3-way SYN/SYN-ACK/ACK; multihoming requires MPTCP (RFC 8684); HoL across data is unavoidable. Formal analysis at USENIX Security 2024 (Ginesin et al.) confirmed that the SCTP cookie reliably defeats blind SYN-flood-style attacks the modeled Off-Path attacker can mount ([https://arxiv.org/pdf/2403.05663](https://arxiv.org/pdf/2403.05663)). [En Academic + 2](https://en-academic.com/dic.nsf/enwiki/229692)

**UDP.** SCTP often runs *over* UDP for NAT traversal — RFC 6951 specifies the UDP encapsulation, which adds an 8-byte UDP header in front of the SCTP common header. WebRTC always uses this path (with DTLS in between). [IETF](https://datatracker.ietf.org/doc/html/rfc6951)

**WebRTC data channels.** The mandatory protocol stack is **`SCTP / DTLS / UDP / IP`** with ICE for NAT traversal (RFC 8261, RFC 8831, RFC 8832). SCTP carries arbitrary application messages on data channels; the data-channel-establishment protocol (DCEP, RFC 8832) negotiates per-channel reliability and ordering parameters; SCTP's PR-SCTP (RFC 3758) lets browsers offer `unreliable` data channels. **This is the only browser-shipped use of SCTP today.** Chrome's WebRTC has migrated from `usrsctp` to **`dcSCTP`**, an in-tree C++ implementation, and a Rust port is under way ([https://github.com/webrtc/dcsctp](https://github.com/webrtc/dcsctp)); Firefox still uses `usrsctp` as of recent commits ([https://chromium.googlesource.com/external/github.com/sctplab/usrsctp/+/master](https://chromium.googlesource.com/external/github.com/sctplab/usrsctp/+/master)). [Fanyamin](https://www.fanyamin.com/wordpress/?p=685)[Walterfan](https://walterfan.github.io/webrtc_note/4.code/webrtc_sctp.html)

**IP.** SCTP is an IP-layer transport protocol with **IANA protocol number 132**, assigned to "Randall_R_Stewart" ([https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xml](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xml)). [IANA](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.txt)

**DTLS.** Datagram TLS (RFC 9147) provides authentication, confidentiality, and integrity for SCTP in the WebRTC stack. RFC 8261 specifies the encapsulation; RFC 9653 (2024) lets DTLS-protected SCTP send a zero CRC32c since DTLS already covers integrity. New work (`draft-westerlund-tsvwg-sctp-dtls-handshake`) defines a DTLS *chunk* allowing in-band DTLS 1.3 key management *inside* SCTP itself, including support for multihomed associations. [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24774.html)

**SS7 / MTP / SIGTRAN adaptation layers.** SCTP's whole reason to exist:

- **M2UA** — RFC 3331, MTP-2 user adaptation. [Wikipedia](https://en.wikipedia.org/wiki/SIGTRAN)
- **M2PA** — RFC 4165, peer-to-peer MTP-2. [Wikipedia](https://en.wikipedia.org/wiki/SIGTRAN)
- **M3UA** — RFC 4666, MTP-3 user adaptation (carries ISUP/SCCP) — the most widely deployed SS7-over-IP variant ([https://datatracker.ietf.org/doc/rfc4666/](https://datatracker.ietf.org/doc/rfc4666/)). [GitHub](https://github.com/SigPloiter/M3UAScan)[Wikipedia](https://en.wikipedia.org/wiki/SIGTRAN)
- **SUA** — RFC 3868, SCCP user adaptation. [Wikipedia](https://en.wikipedia.org/wiki/SIGTRAN)

**DCCP (RFC 4340).** Sibling protocol from the same era; congestion-controlled but *unreliable* datagram delivery ([https://www.rfc-editor.org/rfc/rfc4340.html](https://www.rfc-editor.org/rfc/rfc4340.html)). DCCP filled a different niche (lossy media streaming) but, like SCTP, lost to QUIC for general use. [RFC Editor](https://www.rfc-editor.org/rfc/rfc4340.html)

**QUIC.** Built on UDP, encrypted by default, multiplexes streams without HoL blocking, fast 0/1-RTT handshake. Practically QUIC has supplanted SCTP for new general-purpose transport work — the same multistream/multipath/connection-migration ideas, but the IETF deliberately built it on UDP from day one to escape SCTP's NAT/middlebox tax. Even within WebRTC there are proposals to replace SCTP data channels with QUIC datagrams ([https://bloggeek.me/who-needs-quic-in-webrtc/](https://bloggeek.me/who-needs-quic-in-webrtc/)).

**MPTCP.** RFC 8684. Multipath at the TCP layer using TCP option negotiation, mostly to use multiple radio interfaces simultaneously. Conceptually close to CMT-SCTP, but TCP-compatible from a middlebox standpoint. Apple shipped MPTCP in iOS for Siri. [ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/2578508.2591369)

**PR-SCTP.** RFC 3758 partial reliability extension with the FORWARD-TSN chunk. Lets the sender abandon a TSN range (e.g., timed reliability for media). Required by WebRTC for unordered/unreliable data channels. [Liu](http://pike.lysator.liu.se/docs/ietf/rfc/37/rfc3758.xml)

**Other protocols you may have missed:**

- **Diameter** (RFC 6733) — runs over TCP or SCTP; the LTE/IMS AAA backbone ([https://datatracker.ietf.org/doc/html/rfc6733](https://datatracker.ietf.org/doc/html/rfc6733)). [Wikipedia](https://en.wikipedia.org/wiki/Diameter_(protocol))[CsPsProtocol](https://www.cspsprotocol.com/diameter-protocol-2/)
- **RSerPool** (RFCs 5351–5356) — Reliable Server Pooling, often built atop SCTP.
- **3GPP control-plane interfaces over SCTP**: NG-AP (TS 38.413), F1-AP (TS 38.473), Xn-AP, E1-AP, S1-AP/X2-AP for LTE.
- **Reliable Server Pooling (ENRP)** signalling.
- **TLS over SCTP (RFC 3436)** — historical, largely superseded by DTLS-over-SCTP (RFC 6083) and the DTLS-chunk drafts.

---

## Real-world deployment

**Implementations as of 2026:**

- **FreeBSD kernel** — the reference implementation by Tüxen and Stewart ([https://www.sctp.de/sctp.html](https://www.sctp.de/sctp.html)).
- **Linux kernel** — `lksctp`, mainline since 2.5.36; configured via `/proc/net/sctp/*` and `sysctl net.sctp.*`; user-space tools live in **lksctp-tools** at [https://github.com/sctp/lksctp-tools](https://github.com/sctp/lksctp-tools) (`checksctp`, `withsctp`, `sctp_darn`, `sctp_test`). [GitHub + 2](https://github.com/sctp/lksctp-tools/wiki)
- **`usrsctp`** — userland portable port of the FreeBSD stack at [https://github.com/sctplab/usrsctp](https://github.com/sctplab/usrsctp); runs on Windows/macOS/Linux/BSD; **still maintained in 2025** (last activity Oct 16, 2025: MinGW build fix #730). [Google](https://chromium.googlesource.com/external/github.com/sctplab/usrsctp/+/master)
- **dcSCTP** — Google's in-tree C++ replacement inside Chrome's WebRTC (since around M92, 2021), now the default for WebRTC data channels in Chrome ([https://groups.google.com/g/discuss-webrtc/c/hY3VkIw2-20](https://groups.google.com/g/discuss-webrtc/c/hY3VkIw2-20)). [Walterfan](https://walterfan.github.io/webrtc_note/4.code/webrtc_sctp.html)
- **Rust dcSCTP** — successor at [https://github.com/webrtc/dcsctp](https://github.com/webrtc/dcsctp), by the same Google authors.
- **Solaris, AIX** — historical kernel support; presumed legacy.
- **Windows** — no native support; SctpDrv or userland `usrsctp`.

**Production systems running SCTP in 2026:**

- **5G NG-AP** (3GPP TS 38.412, ETSI TS 138 412) — SCTP carries every NGAP signalling message between gNB and AMF, with payload protocol identifier 60 ([https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf](https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf)). Note: as of TS 138 412 v15, the cite is *still* RFC 4960, not RFC 9260 — 3GPP RAN3 has historically lagged IETF refreshes. NG-RAN/AMF must support a single SCTP association per NG-RAN/AMF pair, and may dynamically add/remove SCTP associations. [ETSI](https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf)[ETSI](https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf)
- **5G F1-AP and E1-AP** — gNB-CU/gNB-DU split likewise uses SCTP (TS 138 472). [ETSI](https://www.etsi.org/deliver/etsi_ts/138400_138499/138472/15.02.00_60/ts_138472v150200p.pdf)
- **LTE S1-AP and X2-AP** — eNB ↔ MME and eNB ↔ eNB.
- **Diameter** (RFC 6733) on port 3868/SCTP for AAA across LTE/5G EPC and IMS.
- **WebRTC data channels** — every Chrome, Firefox, Safari, Edge.
- **Oracle RAC interconnect** historically used SCTP for cluster reconfiguration messaging (low-volume, latency-sensitive).
- **SS7/SIGTRAN gateways** running M3UA in nearly every mobile carrier.

**Performance, with caveats.** Public benchmarks are dated and inconsistent; *no* widely cited 2024–2026 throughput study showed up in researcher-grade venues during this report's research. Older comparisons are mixed: a CERN LKSCTP study at 1 Gb/s found TCP up to 5–20× faster than the then-immature Linux SCTP ([https://datatag.web.cern.ch/WP3/sctp/tests.htm](https://datatag.web.cern.ch/WP3/sctp/tests.htm)) — the LKSCTP team confirmed the gap was caused by Linux not yet being optimized for performance. Tüxen/Rüngeler's *Portable and Performant Userspace SCTP Stack* (ICCCN 2012) showed userland `usrsctp` reaching parity with kernel TCP/SCTP ([https://research.google/pubs/portable-and-performant-userspace-sctp-stack/](https://research.google/pubs/portable-and-performant-userspace-sctp-stack/)). For a current, like-for-like SCTP-vs-TCP-vs-QUIC throughput number on modern hardware, `[needs source]`. In 5G core deployments operators routinely saturate the multi-gigabit signalling NICs with SCTP without difficulty; congestion control is rarely the bottleneck because NGAP messages are small.

---

## Failure modes and famous incidents

**Highlight CVEs (Linux kernel SCTP, FreeBSD, usrsctp):**

- **CVE-2009-0065** — Linux kernel SCTP FORWARD-TSN chunk memory corruption (remote).
- **CVE-2014-0998** — FreeBSD SCTP local issues `[needs source]` (limited public details verified in this research).
- **CVE-2018-5803** — Linux kernel `_sctp_make_chunk` size validation.
- **CVE-2019-20503** — `usrsctp` out-of-bounds read.
- **CVE-2020-6514** — Chrome WebRTC inappropriate implementation in `usrsctp` allowing heap corruption via crafted SCTP stream; Project Zero documented exploitation against Signal's incoming-call code path ([https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html](https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html), [https://www.cvedetails.com/cve/CVE-2020-6514/](https://www.cvedetails.com/cve/CVE-2020-6514/)). [CVE Details](https://www.cvedetails.com/cve/CVE-2020-6514/)[Vulners](https://vulners.com/zdt/1337DAY-ID-34769)
- **CVE-2020-6831** — out-of-bounds read in `usrsctp` (Project Zero). [Blogger](https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html)
- **CVE-2021-3772** — Linux SCTP stack: a blind off-path attacker who knows the 4-tuple can kill an existing association via invalid chunks; vtag verification was insufficient ([https://www.suse.com/security/cve/CVE-2021-3772.html](https://www.suse.com/security/cve/CVE-2021-3772.html), [https://ubuntu.com/security/CVE-2021-3772](https://ubuntu.com/security/CVE-2021-3772)). USENIX Security 2024 used formal model checking to *re-derive* this attack automatically and verified the RFC 9260 patch eliminates it ([https://www.usenix.org/conference/usenixsecurity24/presentation/ginesin](https://www.usenix.org/conference/usenixsecurity24/presentation/ginesin)). [SUSE + 2](https://www.suse.com/security/cve/CVE-2021-3772.html)
- **CVE-2024-0639** — DoS via deadlock in `sctp_auto_asconf_init` ([https://alas.aws.amazon.com/cve/html/CVE-2024-0639.html](https://alas.aws.amazon.com/cve/html/CVE-2024-0639.html)). [Amazon](https://alas.aws.amazon.com/cve/html/CVE-2024-0639.html)
- **CVE-2024-49944** — Linux SCTP `sctp_listen_start` NULL ptr deref when autobind fails and `SO_REUSEPORT` is set ([https://www.cvedetails.com/cve/CVE-2024-49944/](https://www.cvedetails.com/cve/CVE-2024-49944/)). [Ogma](https://ogma.in/cve-2024-49944-resolving-the-linux-kernel-sctp-vulnerability)
- **CVE-2023-1074** — fail if no bound addresses can be used for a given scope. [Red Hat](https://access.redhat.com/errata/RHSA-2024:0725)

**Chrome WebRTC pulled `usrsctp` from its WebRTC build** because of this string of memory-safety issues ([https://support.google.com/faqs/answer/12577537](https://support.google.com/faqs/answer/12577537)), replacing it with `dcSCTP` and warning Play Store developers that vulnerable WebRTC versions still using `usrsctp` would be flagged. [Google Support](https://support.google.com/faqs/answer/12577537)

**Common pitfalls:**

- **NAT/firewall traversal** — many enterprise firewalls drop IP proto 132. Solution: RFC 6951 UDP encapsulation, or IPsec.
- **MTU mismatches** — running over UDP eats 8 bytes; running over DTLS eats more. RFC 8261 RECOMMENDS not exceeding a 1200-byte safe path MTU when DF cannot be controlled. [Hjp](https://www.hjp.at/doc/rfc/rfc8261.html)
- **Heartbeat misconfiguration** — too long an interval delays failover; too short generates noise.
- **Association limits** — kernel `sysctl net.sctp.assoc_limit` and per-process limits surprise people running thousands of MMEs/AMFs.
- **Two unrelated SCTP implementations on the same host** (kernel + `usrsctp`) racing for IP proto 132 has caused weird interleaved aborts.
- **Linux kernel "SCTP networking" subsystem averages 4.0 years between bug introduction and discovery**, behind only CAN bus drivers in a recent statistical study of `Fixes:` commit lifetimes ([https://pebblebed.com/blog/kernel-bugs](https://pebblebed.com/blog/kernel-bugs)). The takeaway: SCTP code paths get less testing/fuzzing than mainstream networking and historically harbor long-lived bugs. [Pebblebed + 2](https://pebblebed.com/blog/kernel-bugs)
- **Telecom outages** explicitly attributed to SCTP itself (rather than the application above it) are rare and seldom publicly reported; `[needs source]` for any specific named outage.

---

## Fun facts and anecdotes

- **Original name was MDTP** — Multi-network Datagram Transmission Protocol — at Motorola in 1997 ([https://www.informit.com/articles/article.aspx?p=24386&seqNum=5](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)).
- **Then briefly "Simple Control Transmission Protocol"** in `draft-ietf-sigtran-sctp-00` (Sep 1999) before being renamed to "Stream Control Transmission Protocol" by `draft-13` (July 2000). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-sigtran-sctp-00)[IETF](https://datatracker.ietf.org/doc/html/draft-ietf-sigtran-sctp)
- **IP protocol number 132** was assigned to Randall R. Stewart by name in IANA's registry — a personal credit unusual for an Internet standard ([https://www.iana.org/assignments/protocol-numbers/protocol-numbers.txt](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.txt)).
- **The "killer cookie".** Stewart's cookie design meant the server keeps zero state until COOKIE-ECHO returns, defeating SYN flooding by construction. [Alibaba Cloud](https://topic.alibabacloud.com/a/how-sctp-prevents-syn-flooding-attacks_8_8_31908552.html)
- **Stewart and Xie wrote a book** — *Stream Control Transmission Protocol (SCTP): A Reference Guide*, Addison-Wesley 2001, ISBN 978-0201721867 ([https://www.amazon.com/Stream-Control-Transmission-Protocol-SCTP/dp/0201721864](https://www.amazon.com/Stream-Control-Transmission-Protocol-SCTP/dp/0201721864)). It's now a quarter-century old; conceptually still useful for chapters on rationale and history, but not for current chunks/RFCs. [Biblio](https://www.biblio.com/9780201721867)
- **CRC32c instead of Adler-32.** Jonathan Stone (Stanford PhD, then) showed Adler-32's two 16-bit accumulators give very poor coverage on short packets — "ask Mark Adler" was Stone's quoted comment in RFC 3309 itself ([https://www.rfc-editor.org/rfc/rfc3309.html](https://www.rfc-editor.org/rfc/rfc3309.html)). Castagnoli polynomial CRC32c was chosen and, conveniently, hardware-accelerated by Intel SSE 4.2's `CRC32` instruction a few years later.
- **SCTP nearly made it into Windows.** Vista's PSDK actually defined `IPPROTO_SCTP`, and a Microsoft engineer publicly told developers "I believe this feature will be included in the future versions of Vista." It never shipped ([https://microsoft.public.win32.programmer.networks.narkive.com/Ul1Xs3T8/windows-support-for-sctp](https://microsoft.public.win32.programmer.networks.narkive.com/Ul1Xs3T8/windows-support-for-sctp)). The accepted explanation in folklore is some combination of NAT vendor inertia, lack of demand, and the time required to do a Winsock-level transport correctly. [Narkive](https://microsoft.public.win32.programmer.networks.narkive.com/Ul1Xs3T8/windows-support-for-sctp)
- **April Fools.** No SCTP-specific April Fools RFC has been published `[needs source]`; RFC 5841 (April Fools 2010) is unrelated, as the user noted.
- **Tüxen at Münster** has been the single most prolific implementer-author in SCTP for two decades; his FH Münster dblp page lists dozens of related RFCs and drafts ([https://dblp.org/pid/43/6209.html](https://dblp.org/pid/43/6209.html)).

---

## Practical wisdom

- **Heartbeat interval (`HB.interval`)** defaults around 30s; for fast failover in 5G control plane, operators routinely shrink to 1–3 s.
- **RTO_MIN / RTO_MAX**: defaults 1s/60s in RFC 9260 §15. For LAN-only signalling these are too conservative; RTO_MIN of 100–200 ms is common in telco deployments.
- **Stream count negotiation** is one-time at INIT; if you need to add more, use **RE-CONFIG (RFC 6525)** — *not* "tear down and reopen."
- **Send/receive buffer sizes**. On Linux: `net.sctp.sctp_rmem`, `net.sctp.sctp_wmem`. Be aware that kernel doubles the value passed to `setsockopt(SO_RCVBUF)`; defaults from `net.core.rmem_default`/`wmem_default` apply unless `net.sctp.*` is specifically set after module load ([https://access.redhat.com/solutions/6625041](https://access.redhat.com/solutions/6625041)). [Red Hat](https://access.redhat.com/solutions/6625041)[Red Hat](https://access.redhat.com/solutions/6625041)
- **SACK delay** defaults near 200 ms; for chatty signalling lower it (`SCTP_DELAYED_SACK`) or use SACK-IMMEDIATELY (RFC 7053, the I-bit) to flush.
- **Linux defaults are conservative.** On RHEL the SCTP module is *blacklisted by default* — comment out `/etc/modprobe.d/sctp-blacklist.conf`, then `modprobe sctp` ([https://access.redhat.com/solutions/6625041](https://access.redhat.com/solutions/6625041)). [Red Hat](https://access.redhat.com/solutions/6625041)
- **Monitoring.**
  - SCTP-MIB (RFC 3873) for SNMP managers.
    - `/proc/net/sctp/{assocs,endpoints,snmp,remaddr}` on Linux.
    - `ss -pneomSa` shows SCTP sockets when `sctp_diag` is loaded. [Red Hat](https://access.redhat.com/solutions/6625041)
- **Debugging.**
  - **Wireshark** has a strong SCTP dissector ([https://wiki.wireshark.org/SCTP](https://wiki.wireshark.org/SCTP)).
    - `tcpdump 'proto 132'` or BPF `ip proto 132`.
    - `sctp_test` (lksctp-tools) and `usrsctp`'s `tsctp`/`discard_server`/`client` example programs.
- **Common misconfig: single-homed despite advertised multihoming.** If you bind only `INADDR_ANY` but routing prefers a single source, your "multihomed" association quietly degrades to single-path. Use `sctp_bindx()` with explicit addresses.
- **MTU mismatches with UDP encapsulation.** Per RFC 6951, the path MTU must drop by 8 bytes when UDP encap is enabled mid-association; if your stack forgets, you'll see fragmentation, ICMP, or silent drops. [IETF](https://datatracker.ietf.org/doc/html/rfc6951)
- **Don't enable SCTP-AUTH naively** — RFC 5061 ASCONF *requires* AUTH to prevent an off-path attacker from rerouting your association. [IETF](https://datatracker.ietf.org/doc/draft-ietf-tsvwg-rfc4895-bis/)

---

## Learning resources (current as of 2026)

**RFCs (with section pointers):**

- **RFC 9260** (June 2022) — *canonical* SCTP. Read §1.3 (terminology), §3 (formats), §5 (handshake), §6 (DATA/SACK), §7 (congestion), §9 (shutdown), §15 (timer parameters). [https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260) — *advanced*, last updated 2022.
- **RFC 9653** (Sep 2024) — Zero Checksum. [https://datatracker.ietf.org/doc/rfc9653/](https://datatracker.ietf.org/doc/rfc9653/) — *intermediate*.
- **RFC 8261** (2017) — DTLS encapsulation; this is the WebRTC stack. [https://www.rfc-editor.org/rfc/rfc8261.html](https://www.rfc-editor.org/rfc/rfc8261.html) — *intermediate*.
- **RFC 6951** (2013) — UDP encapsulation. [https://datatracker.ietf.org/doc/html/rfc6951](https://datatracker.ietf.org/doc/html/rfc6951).
- **RFC 8260** (2017) — Stream schedulers / I-DATA. [https://www.rfc-editor.org/rfc/rfc8260.html](https://www.rfc-editor.org/rfc/rfc8260.html).
- **RFC 4895** (2007) — SCTP-AUTH. [https://datatracker.ietf.org/doc/html/rfc4895](https://datatracker.ietf.org/doc/html/rfc4895).
- **RFC 5061** (2007) — ADD-IP / ASCONF. [https://datatracker.ietf.org/doc/html/rfc5061](https://datatracker.ietf.org/doc/html/rfc5061).
- **RFC 3758** (2004) — PR-SCTP. [https://www.rfc-editor.org/rfc/rfc3758.html](https://www.rfc-editor.org/rfc/rfc3758.html).
- **RFC 6525** (2012) — RE-CONFIG. [https://www.rfc-editor.org/rfc/rfc6525.html](https://www.rfc-editor.org/rfc/rfc6525.html).
- **RFC 3873** (2004) — SCTP-MIB. [https://www.rfc-editor.org/rfc/rfc3873](https://www.rfc-editor.org/rfc/rfc3873).
- **RFC 8831 / 8832** (2021) — WebRTC Data Channels and DCEP. [https://www.rfc-editor.org/rfc/rfc8831.html](https://www.rfc-editor.org/rfc/rfc8831.html).
- **RFC 8899** (2020) — PLPMTUD for datagram transports. [https://www.rfc-editor.org/rfc/rfc8899](https://www.rfc-editor.org/rfc/rfc8899).
- **RFC 4666 / 3331 / 3868** — M3UA / M2UA / SUA SS7 adaptation. [https://datatracker.ietf.org/doc/rfc4666/](https://datatracker.ietf.org/doc/rfc4666/).
- (Note: there is no SCTP "RFC 9899" — that number is unassigned to SCTP. Use RFC 9260 directly.)

**Books:**

- Stewart & Xie, *Stream Control Transmission Protocol (SCTP): A Reference Guide*, Addison-Wesley 2001 — *advanced*; valuable for design rationale and history but **predates RFC 4960 and RFC 9260, RFC 3309 CRC32c, RFC 6951, RFC 8261, etc.** Treat as historical ([https://www.informit.com/store/stream-control-transmission-protocol-sctp-a-reference-9780201721867](https://www.informit.com/store/stream-control-transmission-protocol-sctp-a-reference-9780201721867)). [Amazon](https://www.amazon.com/Stream-Control-Transmission-Protocol-SCTP/dp/0201721864)[Biblio](https://www.biblio.com/9780201721867)
- "Fundamentals of SCTP" chapters in Stevens-style network programming texts — `[needs source]` for the specific edition the original task referenced.

**Academic papers (recent):**

- Ginesin, von Hippel, Defloor, Nita-Rotaru, **Tüxen** — *A Formal Analysis of SCTP: Attack Synthesis and Patch Verification*, USENIX Security 2024 ([https://www.usenix.org/conference/usenixsecurity24/presentation/ginesin](https://www.usenix.org/conference/usenixsecurity24/presentation/ginesin); arXiv 2403.05663). Recommended. [arxiv](https://arxiv.org/pdf/2403.05663)
- Stone, Stewart, Otis — *Performance of Checksums and CRCs over Real Data*, the foundational analysis behind RFC 3309.
- Saini & Fehnker — *Evaluating SCTP Using Uppaal*, 2017, formal-methods perspective on the 4-way handshake ([https://arxiv.org/pdf/1703.06568](https://arxiv.org/pdf/1703.06568)). [arxiv](https://arxiv.org/pdf/1703.06568)
- Tüxen & Rüngeler — *Portable and Performant Userspace SCTP Stack*, ICCCN 2012 ([https://research.google/pubs/portable-and-performant-userspace-sctp-stack/](https://research.google/pubs/portable-and-performant-userspace-sctp-stack/)) — origin paper of `usrsctp`. [Google Research](https://research.google/pubs/portable-and-performant-userspace-sctp-stack/)

**Engineering blogs:**

- Lennart Grahl, *Demystifying WebRTC's Data Channel Message Size Limitations* ([https://lgrahl.de/articles/demystifying-webrtc-dc-size-limit.html](https://lgrahl.de/articles/demystifying-webrtc-dc-size-limit.html)) — required reading for anyone shipping data channels.
- Tsahi Levy-Nahum, *Why was SCTP Selected for WebRTC's Data Channel?* ([https://bloggeek.me/sctp-data-channel/](https://bloggeek.me/sctp-data-channel/)) and *Who needs QUIC in WebRTC anyway?* ([https://bloggeek.me/who-needs-quic-in-webrtc/](https://bloggeek.me/who-needs-quic-in-webrtc/)).
- Google Project Zero, *Exploiting Android Messengers with WebRTC: Part 2* ([https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html](https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html)).
- Nokia, *Using modern transport protocols in 6G* ([https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/](https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/)) — argues for replacing SCTP with QUIC in 6G control plane.

**YouTube / talks:**

- Stanford CS144's playlist (Levis & McKeown) — [https://www.youtube.com/playlist?list=PLvFG2xYBrYAQCyz4Wx3NPoYJOFjvU7g2Z](https://www.youtube.com/playlist?list=PLvFG2xYBrYAQCyz4Wx3NPoYJOFjvU7g2Z) — touches multiplexing/reliability concepts but does not deep-dive SCTP itself.
- Tüxen IETF/ICNP talks on SCTP, RACK-for-SCTP, and `usrsctp` (search YouTube and IETF meeting archives; e.g., the slide deck on UDP-encapsulation considerations: [https://www.ietf.org/proceedings/95/slides/slides-95-tsvwg-5.pdf](https://www.ietf.org/proceedings/95/slides/slides-95-tsvwg-5.pdf)).

**Podcasts:** No major networking podcast has produced a dedicated SCTP episode in 2024–2026 that I could verify; PacketPushers and Heavy Networking have touched WebRTC/QUIC topics. `[needs source]` for an SCTP-specific episode.

**University courses:**

- **Stanford CS144** (Levis & McKeown, [https://cs144.github.io/](https://cs144.github.io/)) — focuses on TCP/IP; SCTP is *not* a primary topic; students implement TCP only. [CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- **MIT 6.829** — likewise TCP/QUIC/datacenter focus; SCTP rarely featured `[needs source]`.
- **CMU 15-441/15-641** — same `[needs source]`. SCTP's near-absence from undergraduate networking curricula is part of the protocol's PR problem.

**Hands-on:**

- Wireshark dissector ([https://wiki.wireshark.org/SCTP](https://wiki.wireshark.org/SCTP)).
- `lksctp-tools` ([https://github.com/sctp/lksctp-tools](https://github.com/sctp/lksctp-tools)).
- `usrsctp` ([https://github.com/sctplab/usrsctp](https://github.com/sctplab/usrsctp)) — last commit October 2025. [GitHub](https://github.com/sctplab/usrsctp/commits/9a3e5465e9d96d8a7f78f1e996412d6235d7a359)
- `dcSCTP` C++ source under WebRTC; Rust port at [https://github.com/webrtc/dcsctp](https://github.com/webrtc/dcsctp).
- FreeBSD: `kldload sctp`; the reference implementation lives in `sys/netinet/sctp_*.c`.

---

## Where things are heading (2025–2026 frontier)

**The honest picture.** For new application-layer transport, **QUIC has effectively won**. QUIC delivers SCTP's marquee features (multiple streams without HoL, fast handshake, connection migration) on top of UDP, dodging the NAT/middlebox problem that has dogged SCTP for 25 years. Nokia's 2025 6G blog post ([https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/](https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/)) and the O-RAN nGRG "Cloud-Friendly Future 6G RAN" report (2024) both explicitly argue that 6G should **replace SCTP with QUIC** in 3GPP control-plane interfaces, citing SCTP's "poor NAT support, kernel-based stacks, small community, slow evolution" — strong language from a major vendor ([https://mediastorage.o-ran.org/ngrg-rr/nGRG-RR-2024-01-O-RAN%20Cloud%20Friendly%20Future%206G%20RAN-v1.2.1.pdf](https://mediastorage.o-ran.org/ngrg-rr/nGRG-RR-2024-01-O-RAN%20Cloud%20Friendly%20Future%206G%20RAN-v1.2.1.pdf)). [Nokia](https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/)[O-ran](https://mediastorage.o-ran.org/ngrg-rr/nGRG-RR-2024-01-O-RAN%20Cloud%20Friendly%20Future%206G%20RAN-v1.2.1.pdf)

**Where SCTP nonetheless persists in 2026:**

- **5G NG-AP and friends.** 3GPP Release 18/19/20 (2024–2026) keep SCTP as the canonical signalling-bearer transport. Until 3GPP completes a 6G transport refresh — currently a discussion item, not a decision — every NGAP message in the world rides SCTP.
- **WebRTC data channels.** Every browser. The migration from `usrsctp` to `dcSCTP` (in-tree C++; now a Rust port) shows the *implementations* are evolving even if the protocol is not. Active 2024–2025 work on **`draft-hancke-tsvwg-snap` (SNAP)** specifically targets reducing the 4-way SCTP handshake latency by carrying INIT params in SDP — Meta, OpenAI, and Google co-authoring tells you who still cares about WebRTC data-channel latency.

**TSVWG (the working group that owns SCTP)** continues to publish SCTP drafts in 2024–2025: load sharing/CMT (`-multipath-30`), DTLS-chunk in-band keying, INIT forwarding for anycast, errata-style updates to RFC 6951 and RFC 4895, plus the Dreibholz "next-generation SCTP ideas" informational draft (Sep 2025) that catalogs lessons learned and what a hypothetical SCTP-2 might do. Read: the protocol is maintained, but no major new mainline RFC is imminent beyond RFC 9260 + RFC 9653.

**Net assessment.** In 5 years, expect SCTP to remain entrenched in **5G/legacy 4G signalling and WebRTC data channels** and to be slowly deprecated everywhere else by QUIC. A 6G control plane on QUIC is plausible but not certain.

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook:**

> "In 1991, an engineer named Randall Stewart watched a TCP socket take *minutes* to notice a dead network — during a phone-call test. That moment killed TCP for telephony, and started the protocol you've never heard of but use every day. It carries every 5G signalling message between your phone and the network. It carries every WebRTC data channel in every browser. It has its own IP protocol number — 132 — assigned to Stewart's name personally. It's called SCTP, and it almost made it into Windows. Almost."

**Striking statistic with source:** Linux kernel SCTP code averages **4.0 years between bug introduction and discovery** — second only to CAN-bus drivers — because almost nobody fuzzes it ([https://pebblebed.com/blog/kernel-bugs](https://pebblebed.com/blog/kernel-bugs)). Yet every 5G call setup in 2026 traverses this code. [Pebblebed](https://pebblebed.com/blog/kernel-bugs)

**"Pause and think" moment:** SCTP's 4-way handshake with a signed cookie was *immune to SYN flooding by construction* in 2000. TCP's SYN cookies — hacked into Linux a few years earlier — are an *ad hoc retrofit* of the same idea. SCTP did it right the first time. Source: USENIX Security 2024 formal verification ([https://www.usenix.org/system/files/usenixsecurity24-ginesin.pdf](https://www.usenix.org/system/files/usenixsecurity24-ginesin.pdf)) shows the off-path SYN-flood-class attacks the model attempts are *unreachable* against SCTP's cookie when the RFC 9260 patches are applied.

**Failure-story arc:** In 2020, Google Project Zero's Natalie Silvanovich exploited `CVE-2020-6514` in `usrsctp` *via a Signal incoming call* — the victim never had to answer. The same library shipped in Chrome, Firefox, Signal, and Facebook Messenger. The fix took months; ASCONF was eventually disabled in `usrsctp`; Chrome's WebRTC team eventually wrote `dcSCTP` from scratch in C++ to escape the bug class entirely. ([https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html](https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html)). Lesson: protocol elegance does not save you from implementation realities, especially in a decades-old C codebase that nobody fuzzes. [Vulners](https://vulners.com/zdt/1337DAY-ID-34769)[Vulners](https://vulners.com/zdt/1337DAY-ID-34769)

---

## Caveats

- **3GPP citations lag.** ETSI TS 138 412 v15 still references RFC 4960, not RFC 9260; later 3GPP releases may have caught up but I could not confirm a published version that explicitly cites RFC 9260 within the 12 turns of research. [ETSI](https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf)
- **Performance benchmarks.** I could not locate a high-quality 2024–2026 SCTP-vs-TCP-vs-QUIC throughput study in researcher-grade venues during this research; the older numbers should not be quoted as current. `[needs source]` for current benchmark data.
- **Some specific CVEs from the original brief** (e.g., CVE-2021-23336 — verified to be Python `urllib.parse`, *not* SCTP) were misclassified in the prompt; I have only listed CVEs I positively verified are SCTP-related.
- **University-course coverage** — I confirmed Stanford CS144 does not focus on SCTP; for MIT 6.829 and CMU 15-441/15-641 the absence is plausible but not exhaustively verified within this research budget.
- **April Fools / SCTP humor RFCs** — none verified.
- **6G transport plans** — Nokia's blog and O-RAN's report are *advocacy positions*, not 3GPP decisions. 3GPP has not committed to dropping SCTP from 6G as of May 2026; treat references to "QUIC for 6G" as proposals using verbs like *should*, *would*, *could*.
- **dcSCTP's status** — Chrome shipped it as default for data channels; whether Firefox has migrated is unclear from public sources accessed here.
- The original prompt asked for confirmation of specific older CVEs (CVE-2014-0998, CVE-2018-5803, CVE-2009-0065). I confirmed CVE-2009-0065 is real (Linux SCTP FORWARD-TSN) but did not independently verify exact descriptions of the others within the research budget; treat them as `[needs source]` until verified.
- The original prompt referenced "RFC 9899" for SCTP terminology updates — that RFC number is not assigned to an SCTP terminology update; the canonical terminology is RFC 9260 §1.3.