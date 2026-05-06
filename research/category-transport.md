---
prompt_source: deep-research-prompts.txt:183-349 (CATEGORY · TRANSPORT)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/94662b7d-7724-4d2d-87f2-a77fb108e45d
sources: 313
duration: 16m 3s
research_mode: claude.ai Research
---

# Transport Protocols: A Family Field Guide

**TL;DR**

- Transport protocols are the layer-4 family that turns the unreliable, packet-switched Internet (IP) into something applications can actually use; the family is small (TCP, UDP, SCTP, DCCP, MPTCP, QUIC) but its choices ripple into nearly every other protocol on the Internet, and after four decades the dominant pair (TCP/UDP) has finally been joined by a third member — QUIC, standardized in May 2021 — that is now carrying close to half of human web traffic at large CDNs.
- The defining tension of the family is the same one Cerf and Kahn drew on a whiteboard in 1973: how do you build a reliable byte‑stream service on top of an unreliable datagram service, and what should you do for the applications that don't actually want a reliable byte stream? Almost every member is a different answer to that question, shaped by congestion collapse (1986), middlebox ossification (2000s), and the latency demands of modern web/AI/datacenter workloads (2020s).
- The 2024–2026 frontier is decisive: QUIC v2 (RFC 9369, May 2023) and Multipath QUIC (draft‑ietf‑quic‑multipath, late 2025/early 2026) are replacing TCP+TLS for web and media; BBRv3 has become the default congestion control for google.com and YouTube; L4S (RFC 9330/9331/9332, January 2023) is moving from spec to ISP deployment; the Ultra Ethernet Consortium 1.0 spec (June 2025) is rebuilding the datacenter transport layer from scratch; and ML‑KEM hybrid post‑quantum key exchange is now negotiated on roughly a third of HTTPS traffic. The big losers are SCTP (still niche, mostly WebRTC data channels and telephony) and DCCP (effectively dead, displaced by QUIC's unreliable‑datagram extension RFC 9221). [ACM Digital Library](https://dl.acm.org/doi/10.1145/3673422.3674889)[Nokia](https://www.nokia.com/bell-labs/research/l4s/)

---

## 1. Prerequisites and Glossary

Before any of the family members make sense, you need a working vocabulary. Definitions below are tight; each ends with one good explainer.

- **Packet** — A formatted unit of data carried by a packet-switched network; at the IP layer specifically called a *datagram*. (Kurose & Ross, 9th ed., 2025: [https://gaia.cs.umass.edu/kurose_ross/index.php](https://gaia.cs.umass.edu/kurose_ross/index.php))
- **Segment** — TCP's name for its protocol data unit (TCP header + payload), carried inside one IP packet. RFC 9293 §3.1 defines the format. ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293))
- **Datagram** — A self-contained, routed message with no delivery guarantee. UDP's PDU and the conceptual unit at the IP layer. RFC 768 (Postel, August 1980): [https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)
- **MTU (Maximum Transmission Unit)** — The largest L2 frame a link will accept (1500 bytes on classical Ethernet). Path MTU = the minimum MTU along a path. (RFC 8899 — Packetization Layer Path MTU Discovery: [https://www.rfc-editor.org/info/rfc8899](https://www.rfc-editor.org/info/rfc8899))
- **MSS (Maximum Segment Size)** — The largest TCP payload that fits in one segment without IP fragmentation; usually MTU − 40 (IPv4 + TCP) or − 60 (IPv6 + TCP). RFC 9293 §3.7.1.
- **Port** — 16‑bit demultiplexing tag at L4; identifies which application on a host gets a packet. RFC 9293 §3.1; RFC 768.
- **Socket** — The OS abstraction (file descriptor) that an application binds to a `(protocol, IP, port)` 5‑tuple to send/receive. Berkeley sockets API, 1983; covered in Stevens *UNIX Network Programming* and in *TCP/IP Illustrated v.1*, 2nd ed., 2011 ([https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/](https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/)).
- **Three‑way handshake** — TCP's `SYN → SYN/ACK → ACK` connection setup that exchanges initial sequence numbers and flow‑control state. RFC 9293 §3.5.
- **Congestion control** — Sender-side rate adaptation that prevents the network's buffers from overflowing. Founding paper: Van Jacobson & Mike Karels, "Congestion Avoidance and Control," SIGCOMM '88 ([https://ee.lbl.gov/papers/congavoid.pdf](https://ee.lbl.gov/papers/congavoid.pdf)).
- **Flow control** — Receiver-driven backpressure (TCP's *receive window*) that keeps the sender from outrunning the receiver's buffers. RFC 9293 §3.8.
- **Head‑of‑line (HoL) blocking** — When a single lost or delayed PDU stalls all logically independent data behind it. The classic motivator for QUIC streams. (Cloudflare overview: [https://blog.cloudflare.com/the-road-to-quic/](https://blog.cloudflare.com/the-road-to-quic/))
- **ARQ (Automatic Repeat reQuest)** — General term for "lose a packet, resend it"; TCP, SCTP, QUIC, MPTCP all use ARQ.
- **Retransmission** — The actual resend, triggered by timeout (RTO) or duplicate/selective ACK signal. Modern best practice: RACK‑TLP (RFC 8985, Feb 2021, [https://datatracker.ietf.org/doc/rfc8985/](https://datatracker.ietf.org/doc/rfc8985/)).
- **RTT (Round-Trip Time)** — Time from sending a byte to receiving its ACK; the universal clock of transport protocols.
- **BDP (Bandwidth‑Delay Product)** — `bandwidth × RTT`; the amount of data needed "in flight" to saturate a path. The natural target size for a congestion window.
- **Sliding window** — The flow/congestion-control invariant: at most `W` unacknowledged bytes outstanding; the window slides forward as ACKs arrive. RFC 9293 §3.8.6.
- **ACK / NACK** — Acknowledgment that data was received; NACK = explicit "I didn't get this." TCP uses cumulative + selective ACKs (SACK, RFC 2018); SCTP and QUIC use SACK‑style gap reports natively.
- **Sequence number** — Monotonic per-byte (TCP) or per-packet (QUIC) identifier used for ordering and loss detection. TCP: 32 bits, RFC 9293 §3.4. QUIC packet numbers: monotonically increasing, separate from stream offsets, RFC 9000 §12.3 ([https://datatracker.ietf.org/doc/html/rfc9000](https://datatracker.ietf.org/doc/html/rfc9000)).
- **Checksum** — End-to-end integrity check (TCP/UDP: 16‑bit one's complement; SCTP: CRC32c; QUIC: AEAD authentication tag, much stronger).
- **Encapsulation** — Wrapping one protocol's PDU inside another's payload (e.g., HTTP inside TLS inside TCP inside IPv4 inside Ethernet).
- **OSI layers / TCP-IP stack** — Seven-layer ISO model (1984) vs. the pragmatic four-layer Internet model (link, internet, transport, application). Transport = L4 in both. (See Tanenbaum *Computer Networks* 6th ed., 2021.)
- **Kernel vs userspace networking** — TCP/UDP/SCTP/DCCP are implemented in the OS kernel; QUIC is almost always in userspace (msquic, quiche, ngtcp2, picoquic, lsquic). The shift toward userspace + kernel‑bypass (XDP, AF_XDP, io_uring, DPDK) is a major 2020s trend ([https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/](https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/)).
- **Slow start / AIMD** — Jacobson's exponential ramp until first loss, then additive‑increase / multiplicative‑decrease. RFC 5681.
- **ECN (Explicit Congestion Notification)** — IP/TCP bits letting routers signal congestion *without* dropping packets. RFC 3168, extended for L4S in RFC 9331 ([https://datatracker.ietf.org/doc/rfc9331/](https://datatracker.ietf.org/doc/rfc9331/)).
- **Bufferbloat** — Excess buffering in network gear that destroys latency under load. Term coined by Jim Gettys at Bell Labs in 2010–2011 ([https://queue.acm.org/detail.cfm?id=2071893](https://queue.acm.org/detail.cfm?id=2071893)). [Bufferbloat.net](https://www.bufferbloat.net/projects/bloat/wiki/TechnicalIntro/)
- **Ossification** — Middleboxes and endpoints freezing protocol behavior so that new options/versions break, making evolution impossible. The reason QUIC exists in user space, runs on UDP, and encrypts almost everything ([https://datatracker.ietf.org/doc/rfc9369/](https://datatracker.ietf.org/doc/rfc9369/)).

---

## 2. The Arc of the Group

**1973–1974: The conceptual leap.** Vint Cerf (Stanford) and Bob Kahn (DARPA) wrote "A Protocol for Packet Network Intercommunication," *IEEE Transactions on Communications* COM‑22(5), May 1974, pp. 637–648 (DOI: 10.1109/TCOM.1974.1092259, [https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)). The paper described a single protocol — they called it "TCP" — that did everything: addressing, routing hints, sequencing, flow control, and reliability across heterogeneous packet networks. The architectural genius was the idea of *gateways* between networks, hiding L2 differences from the endpoints. [History of Information](https://historyofinformation.com/detail.php?id=915)

**1977–1978: The split.** Repeated implementation work at BBN, Stanford, ISI, and University College London (Peter Kirstein's group) revealed that some applications — packet voice, in particular — needed *speed* more than *reliability*. Jon Postel and David Reed argued for splitting Cerf and Kahn's monolithic TCP into two layers: a thin internetworking layer (IP) and an end‑to‑end transport layer above it. Reed went further and proposed a no‑frills datagram transport — what became UDP. Version 4 of the split design was finalized in 1978; this is the IPv4 and TCP we still run today. [Wikipedia](https://en.wikipedia.org/wiki/ARPANET)[Wikipedia](https://en.wikipedia.org/wiki/ARPANET)

**1980–1981: The base specs.**

- **RFC 768 — UDP**, J. Postel, 28 August 1980 ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)). Three pages. The most spartan, durable spec in networking. [IETF](https://datatracker.ietf.org/doc/html/rfc768)
- **RFC 793 — TCP**, J. Postel, September 1981. The foundational TCP document; replaced 41 years later by RFC 9293 (W. Eddy, ed., MTI Systems, August 2022, [https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293)). [IETF](https://www.ietf.org/rfc/rfc9293.pdf)

**1 January 1983 — Flag Day.** ARPANET cut over from NCP to TCP/IP on a single coordinated date, after a March 1982 DoD decision and months of pre-cuts. Roughly 400 hosts had to convert; non‑converters were disconnected ([https://en.wikipedia.org/wiki/Flag_day_(computing)](https://en.wikipedia.org/wiki/Flag_day_(computing)); Internet Society retrospective: [https://www.internetsociety.org/blog/2016/09/final-report-on-tcpip-migration-in-1983/](https://www.internetsociety.org/blog/2016/09/final-report-on-tcpip-migration-in-1983/)). Modern Internet folklore still uses "flag day" to mean any change you cannot do incrementally — a reminder that we will *never* coordinate one again. [Internet Society + 2](https://www.internetsociety.org/blog/2016/09/final-report-on-tcpip-migration-in-1983/)

**October 1986 — Congestion Collapse.** Throughput between Lawrence Berkeley National Laboratory and UC Berkeley (3 IMP hops, ~400 yards apart) collapsed from 32 kbps to 40 bps — a factor of 800 — because early BSD TCP retransmitted aggressively when packets were dropped, generating more drops. Multiple subsequent collapses followed ([https://www.es.net/about/esnet-history/unjamming-the-information-superhighway-and-saving-the-internet/](https://www.es.net/about/esnet-history/unjamming-the-information-superhighway-and-saving-the-internet/)). [Cs162 + 2](https://cs162.org/static/readings/jacobson-congestion.pdf)

**1988 — Jacobson & Karels.** "Congestion Avoidance and Control," SIGCOMM '88, pp. 314–329 ([https://ee.lbl.gov/papers/congavoid.pdf](https://ee.lbl.gov/papers/congavoid.pdf)). The paper gave us slow start, AIMD, exponential backoff of the retransmission timer (with Karn's algorithm), fast retransmit, and the "conservation of packets" principle. The fix shipped in 4.3BSD and saved the Internet. Six algorithms in one paper; arguably the highest‑leverage networking paper ever written. [Wikipedia](https://en.wikipedia.org/wiki/Network_congestion)[Substack](https://systemsapproach.substack.com/p/how-congestion-control-saved-the)

**1992 — Stevens.** W. Richard Stevens publishes *TCP/IP Illustrated, Volume 1: The Protocols* (Addison-Wesley, 1994). Together with the 1996 *Volumes 2/3* and his *UNIX Network Programming*, it educates an entire generation of practitioners. Updated by Kevin Fall in November 2011 (2nd ed., [https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/](https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/)). [Barnes & Noble + 2](https://www.barnesandnoble.com/w/tcp-ip-illustrated-kevin-fall/1141786585)

**Mid‑1990s — Dead ends.** ISO TP4 (the OSI transport class meant to compete with TCP) lost decisively. XTP (Xpress Transfer Protocol), VMTP, and various ATM-era darlings died. The first SYN flood (Kevin Mitnick on Tsutomu Shimomura, December 1994) was followed by the Panix attack of September 1996, which prompted CERT advisory CA-1996-21 and Bernstein/Schenk's SYN cookies ([https://www.giac.org/paper/gsec/2013/syn-cookies-exploration/103486](https://www.giac.org/paper/gsec/2013/syn-cookies-exploration/103486); [https://time.com/archive/6729702/panix-attack/](https://time.com/archive/6729702/panix-attack/)). [GIAC](https://www.giac.org/paper/gsec/2013/syn-cookies-exploration/103486)

**2000 — SCTP.** RFC 2960 (R. Stewart et al.) introduces the Stream Control Transmission Protocol, born to carry Signaling System 7 (SS7) telephony signaling over IP for VoIP cores. SCTP gives you message orientation, multi‑homing, and multiple streams in one association. Telcos adopted it; the open Internet largely did not, because middleboxes block protocol number 132. Refreshed as RFC 9260 in June 2022 (Stewart, Tüxen, Nielsen — [https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260)). [IETF](https://www.ietf.org/rfc/rfc9260.pdf)

**2006 — DCCP.** RFC 4340 (E. Kohler, M. Handley, S. Floyd) creates the Datagram Congestion Control Protocol — congestion-controlled but unreliable. A clean idea that found basically no users on the open Internet ([https://datatracker.ietf.org/doc/html/rfc4340](https://datatracker.ietf.org/doc/html/rfc4340)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc4340.txt)

**2010–2011 — Bufferbloat.** Jim Gettys at Bell Labs measures 1.2 second latencies on home links and coins "bufferbloat" (ACM Queue, November/December 2011, [https://queue.acm.org/detail.cfm?id=2071893](https://queue.acm.org/detail.cfm?id=2071893)). The community responds with CoDel, FQ‑CoDel, PIE, and eventually L4S. [ACM Queue](https://queue.acm.org/detail.cfm?id=2076798)

**2013 — MPTCP and QUIC.** RFC 6824 ships Multipath TCP v0; Apple deploys it in iOS 7 (September 2013) for Siri ([https://support.apple.com/en-us/101905](https://support.apple.com/en-us/101905)). At Google, Jim Roskind's QUIC project (Quick UDP Internet Connections), running over UDP and combining transport+TLS into one handshake, goes live in Chrome. [Wikipedia + 3](https://en.wikipedia.org/wiki/Multipath_TCP)

**2016 — BBR.** Cardwell, Cheng, Gunn, Yeganeh, Jacobson publish "BBR: Congestion-Based Congestion Control" (ACM Queue 14(5), Oct 2016 / CACM Feb 2017). A model‑based congestion control that targets Kleinrock's optimal point rather than fishing for losses.

**2018 — Homa.** Montazeri, Li, Alizadeh, Ousterhout publish "Homa: A Receiver-Driven Low-Latency Transport Protocol Using Network Priorities" at SIGCOMM 2018 ([https://arxiv.org/abs/1803.09615](https://arxiv.org/abs/1803.09615)). A receiver‑driven, message-oriented, prioritized datacenter transport — the first really serious attempt to replace TCP inside the datacenter. Ousterhout's October 2022 position paper "It's Time to Replace TCP in the Datacenter" ([https://arxiv.org/pdf/2210.00714](https://arxiv.org/pdf/2210.00714)) starts a fight that is still going. [arxiv](https://arxiv.org/pdf/1803.09615)[arxiv](https://arxiv.org/pdf/2210.00714)

**May 2021 — QUIC v1.** RFC 9000 (Iyengar & Thomson, eds., Fastly/Mozilla; [https://datatracker.ietf.org/doc/html/rfc9000](https://datatracker.ietf.org/doc/html/rfc9000)), RFC 9001 (TLS integration), RFC 9002 (loss detection/CC), RFC 8999 (version invariants). HTTP/3 (RFC 9114) follows in June 2022. [IETF](https://datatracker.ietf.org/doc/html/rfc9000)

**2022 — TCP and SCTP get their definitive specs.** RFC 9293 (Aug 2022) and RFC 9260 (June 2022) consolidate four decades of errata.

**January 2023 — L4S.** RFC 9330/9331/9332 ship the Low-Latency, Low-Loss, Scalable throughput architecture ([https://datatracker.ietf.org/doc/rfc9330/](https://datatracker.ietf.org/doc/rfc9330/)). [Nokia](https://www.nokia.com/bell-labs/research/l4s/)

**May 2023 — QUIC v2.** RFC 9369. Identical to v1 except for a few constants — explicitly a *grease* version, designed to keep the QUIC version field from ossifying ([https://datatracker.ietf.org/doc/rfc9369/](https://datatracker.ietf.org/doc/rfc9369/)).

**2024–2026.** BBRv3 becomes the default for google.com and YouTube; ML‑KEM hybrid PQC handshakes pass ~38% of Cloudflare HTTPS by March 2025 ([https://blog.cloudflare.com/pq-2025/](https://blog.cloudflare.com/pq-2025/)); Multipath QUIC enters last call (draft‑ietf‑quic‑multipath); the Ultra Ethernet Consortium publishes UE 1.0 (June 2025, [https://ultraethernet.org/uec-2025-in-review-preparing-for-what-comes-next-a-letter-from-uecs-chair/](https://ultraethernet.org/uec-2025-in-review-preparing-for-what-comes-next-a-letter-from-uecs-chair/)) — a new transport for AI/HPC over plain Ethernet+IP that explicitly competes with InfiniBand and RoCEv2. [Intelligent Living](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)[STORDIS](https://stordis.com/ultra-ethernet-consortium/)

The architects behind the field are roughly the same people across decades: **Cerf, Kahn, Postel, Reed** at the start; **Van Jacobson, Sally Floyd, Mike Karels, Vern Paxson, David D. Clark** in the congestion-control era; **Mark Handley, Eddie Kohler, Costin Raiciu, Olivier Bonaventure** for SCTP/DCCP/MPTCP; **Jim Roskind, Ian Swett, Jana Iyengar, Martin Thomson, Yuchung Cheng, Neal Cardwell, Daniel Stenberg** for QUIC and modern TCP; **John Ousterhout, Mohammad Alizadeh, Torsten Hoefler** for the datacenter generation.

---

## 3. Members and Their Roles

The user-supplied list is correct on every member but slightly imprecise on a few dates. Verified:

- **TCP — Transmission Control Protocol.** First spec'd in Cerf & Kahn 1974, formally separated from IP in 1978, **published as RFC 793 in September 1981** (not 1981 as a single date — the original RFC is September 1981), and consolidated as STD 7 / RFC 9293 in **August 2022** ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293)). Reach for it whenever you need a reliable, in‑order, congestion‑controlled byte stream and don't care about handshake latency. Default for SSH, SMTP, IMAP, Postgres wire protocol, gRPC over TCP, anything legacy. Still ~50–80% of bytes on most networks in 2025 ([https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)). [IETF](https://www.ietf.org/rfc/rfc9293.pdf)
- **UDP — User Datagram Protocol.** **RFC 768, J. Postel, 28 August 1980** ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)) — three pages, no congestion control, no reliability, no flow control. Reach for it when (a) you'll build your own transport on top (QUIC, WebRTC, gaming), (b) you need broadcast/multicast (DHCP, mDNS), or (c) latency matters more than completeness (DNS queries, NTP, VoIP RTP). [IETF](https://datatracker.ietf.org/doc/html/rfc768)
- **SCTP — Stream Control Transmission Protocol.** RFC 2960 (Oct 2000, Stewart et al.), refreshed and obsoleted by **RFC 9260 (June 2022)** ([https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260)). Connection‑oriented, reliable, message-oriented, multi‑homed, supports multiple ordered or unordered streams in one association, four-way handshake with cookie (immune to SYN flood). Niche on the open Internet because of NAT/middlebox hostility; ubiquitous in telco SS7‑over‑IP and as the data‑channel transport inside WebRTC (typically tunneled over DTLS/UDP because raw SCTP doesn't traverse the Internet). [IETF](https://datatracker.ietf.org/doc/html/rfc9260)[IETF](https://datatracker.ietf.org/doc/html/rfc9260)
- **MPTCP — Multipath TCP.** Experimental v0 in **RFC 6824 (January 2013)**, standardized as v1 in **RFC 8684 (March 2020)** ([https://datatracker.ietf.org/doc/html/rfc8684](https://datatracker.ietf.org/doc/html/rfc8684)). Apple shipped MPTCP for Siri in iOS 7 in September 2013 ([https://support.apple.com/en-us/101905](https://support.apple.com/en-us/101905)); upstreamed into Linux kernel 5.6 in March 2020 ([https://www.phoronix.com/news/Linux-5.6-Starts-Multipath-TCP](https://www.phoronix.com/news/Linux-5.6-Starts-Multipath-TCP)). Reach for it when you have multiple network interfaces (Wi-Fi+LTE on a phone, dual ISPs on a CPE, multiple datacenter NICs) and want either seamless handover or path aggregation while presenting a single TCP socket to the application. [Wikipedia + 5](https://en.wikipedia.org/wiki/Multipath_TCP)
- **QUIC.** Originally Google's gQUIC (deployed in Chrome around 2012–2013); the IETF rebuilt it from scratch and shipped **RFC 9000 in May 2021** ([https://datatracker.ietf.org/doc/html/rfc9000](https://datatracker.ietf.org/doc/html/rfc9000)) — *not* 2021 generically, May 27, 2021. UDP‑based, integrated TLS 1.3, multiplexed independent streams (no HoL blocking between streams), 0‑RTT and 1‑RTT handshakes, connection migration via connection IDs, almost the entire wire image authenticated/encrypted. Reach for it for HTTP/3, DNS-over-QUIC (RFC 9250), WebTransport, MoQ, low‑RTT mobile experiences, and any case where TCP+TLS combined handshake costs hurt. [Wikipedia](https://en.wikipedia.org/wiki/QUIC)[curl](https://daniel.haxx.se/blog/2021/05/27/quic-is-rfc-9000/)

**Members the user missed (that belong in the family view):**

- **DCCP — Datagram Congestion Control Protocol.** RFC 4340, March 2006, Kohler/Handley/Floyd ([https://www.ietf.org/rfc/rfc4340.txt](https://www.ietf.org/rfc/rfc4340.txt)). Bidirectional, unicast, *unreliable* but congestion-controlled — designed for streaming media that wants UDP's timeliness but doesn't want to be a network bully. Effectively dead in 2026: superseded by QUIC's unreliable‑datagram extension (RFC 9221, March 2022 — [https://datatracker.ietf.org/doc/rfc9221/](https://datatracker.ietf.org/doc/rfc9221/)). [RFC Editor + 2](https://www.rfc-editor.org/rfc/rfc4340.txt)
- **RFC 9221 (QUIC unreliable datagrams).** Not a separate transport but worth treating as one in the mental map: it gives QUIC a "UDP mode" with shared crypto + congestion control, which is what WebTransport and MoQ rely on. [RFC Editor](https://www.rfc-editor.org/rfc/rfc9221.html)
- **Homa.** Not yet an RFC; SIGCOMM 2018 + USENIX ATC 2021 + arXiv 2210.00714. Receiver-driven, message-oriented, uses in‑network priority queues, no connection state. Still research-grade in 2026 but the Linux kernel module exists, and Ousterhout is actively pushing it as TCP's datacenter replacement.
- **RoCEv2 (RDMA over Converged Ethernet, version 2).** Not really a transport in the IETF sense — it's the InfiniBand transport encapsulated in UDP over Ethernet, defined by the InfiniBand Trade Association rather than the IETF. But every datacenter RDMA deployment uses it, and any "transport family" view that ignores it misses where most cluster bytes actually go ([https://docs.nvidia.com/networking/display/MLNXOFEDv23070512/RDMA+over+Converged+Ethernet+(RoCE)](https://docs.nvidia.com/networking/display/MLNXOFEDv23070512/RDMA+over+Converged+Ethernet+(RoCE))). Requires Priority Flow Control (PFC) or DCQCN for losslessness. [Wikipedia](https://en.wikipedia.org/wiki/RDMA_over_Converged_Ethernet)[arxiv](https://arxiv.org/pdf/1806.08159)
- **UET — Ultra Ethernet Transport.** **UEC 1.0, June 2025** ([https://ultraethernet.org/uec-2025-in-review-preparing-for-what-comes-next-a-letter-from-uecs-chair/](https://ultraethernet.org/uec-2025-in-review-preparing-for-what-comes-next-a-letter-from-uecs-chair/)). A 562‑page open spec by AMD, Arista, Broadcom, Cisco, HPE, Intel, Meta, Microsoft (et al.) for AI/HPC scale-out. Connectionless, unordered, multipath (intelligent packet spray), packet‑trimming, selective retransmission. AMD's Pensando Pollara 400 is the first shipping NIC. The likely RoCEv2 successor. [arXiv + 2](https://arxiv.org/html/2508.08906v1)
- **RDP / RUDP.** "Reliable UDP" exists as a name on a dozen game-engine and embedded protocols (Enet, KCP, Quake3 networking, Mojang's "ENet" derivatives). RFC 908/1151 ("Reliable Data Protocol," 1984/1990) is moribund. Mention them for completeness, not because anyone deploys them.
- **SRT (Secure Reliable Transport).** Open-sourced by Haivision in 2017, used heavily in broadcast/contribution video. Built on UDP. Increasingly displaced by QUIC datagrams/MoQ but still common.
- **Honourable mentions inside the family but really at adjacent layers:** RTP/RTCP (real-time framing on top of UDP), TLS/DTLS (security on top of TCP/UDP, increasingly fused into QUIC), KCP (Chinese-origin reliable UDP common in gaming), Aeolus and Swift (Google datacenter transports referenced in BBRv3 papers), HPCC (high-precision congestion control for INT-enabled fabrics).

---

## 4. Internal Taxonomy — How to Mentally Cluster the Members

The meaningful axes:

| Axis | One end | Other end |
|---|---|---|
| **Reliability** | Reliable (TCP, SCTP, MPTCP, QUIC streams) | Unreliable (UDP, QUIC datagrams, DCCP, UET) |
| **Connection model** | Connection‑oriented (TCP, SCTP, QUIC, MPTCP, DCCP) | Connectionless (UDP, UET) |
| **Ordering** | Strictly ordered (TCP, MPTCP, single QUIC stream) | Unordered/per-message (UDP, SCTP unordered streams, QUIC datagrams, UET, Homa) |
| **Data unit** | Byte stream (TCP, MPTCP) | Message/datagram (UDP, SCTP, DCCP, Homa, QUIC datagrams, UET) |
| **Multipath** | Single path (TCP, UDP, QUIC v1) | Multipath (MPTCP, SCTP multi-homing, Multipath QUIC, UET) |
| **Implementation** | Kernel (TCP, UDP, SCTP, DCCP, MPTCP) | Userspace (QUIC, Homa userspace, UET libfabric) |
| **Encryption** | Plaintext / optional TLS bolt-on (TCP+TLS, UDP+DTLS, SCTP) | Mandatory integrated (QUIC, UET) |
| **Congestion control** | Mandatory (TCP, SCTP, DCCP, MPTCP, QUIC, UET, Homa) | Absent by design (UDP, raw RoCEv2 — relies on lossless fabric) |
| **HoL blocking** | Has it (TCP, MPTCP) | Mitigates it (QUIC streams, SCTP streams, Homa messages) |
| **Standards body** | IETF (TCP/UDP/SCTP/DCCP/MPTCP/QUIC) | Industry consortium (RoCEv2/IBTA, UET/UEC) |

**Decision tree for engineers (2026):**

1. **Are you writing a web/API client or server?** → HTTP/3 over QUIC for new builds; HTTP/2 over TCP+TLS as fallback. Don't touch TCP directly.
2. **Real-time media (call, game, live stream)?** → WebRTC (which uses SCTP/DTLS/UDP for data channels and SRTP/UDP for media), or, if you control both ends, MoQ over QUIC. SRT is a reasonable interim.
3. **A reliable byte stream between two services you control, on the public Internet?** → TCP + TLS 1.3, with BBRv3 if your kernel supports it. Add MPTCP if endpoints are multi-homed.
4. **Inside a single datacenter, low-latency RPCs, controlled fabric?** → RoCEv2 today, UET when hardware ships (late 2025/2026), Homa if you can run a research stack.
5. **You need fan-out telemetry, log shipping, or "fire and forget"?** → UDP, or QUIC datagrams if you also want encryption + congestion control.
6. **Telephony/SS7 signaling?** → SCTP. (Almost nothing else.)
7. **DNS?** → UDP first, TCP fallback for >512 B, DoH (TCP+TLS) or DoQ (QUIC, RFC 9250) for privacy.

---

## 5. How This Group Interacts with Other Protocol Groups

Transport sits at OSI L4 / Internet-stack "transport layer." Its neighbours:

- **Below: Internet/Link layer (IP, ICMP, Ethernet, ARP, MPLS).** Transports are deliberately decoupled from L3 — TCP runs over IPv4, IPv6, and even raw Ethernet in some industrial use cases. ICMP feeds back to transports (Path MTU Discovery, "destination unreachable" closing TCP/SCTP connections). Ethernet's framing (and its 1500-byte default MTU) constrains MSS and indirectly shapes BDP and BBR's estimates. RoCEv2/UET deliberately bypass most of L3's general-purpose machinery for performance.
- **Above: Application & API protocols.**
  - HTTP/1.1 (RFC 9112) and HTTP/2 (RFC 9113) ride TCP+TLS; HTTP/3 (RFC 9114, June 2022) rides QUIC.
    - gRPC defaults to HTTP/2 (so TCP+TLS), but gRPC-over-HTTP/3 is shipping in 2025.
    - WebSocket (RFC 6455) is TCP+TLS-only; **WebTransport** (W3C Working Draft, latest 22 October 2025; [https://www.w3.org/TR/webtransport/](https://www.w3.org/TR/webtransport/)) is its QUIC successor and now implemented in Chrome and Firefox, behind a flag in Safari 18.4+. [W3C](https://www.w3.org/wiki/WebTransport/Meetings2023)[Cloudflare](https://developers.cloudflare.com/moq/)
- **IoT / async messaging.** MQTT and AMQP run over TCP; **CoAP** runs over UDP and is one of the few non-DNS UDP applications without TLS-equivalent (CoAP-over-DTLS exists). These protocols often hit transport limits hard (LTE NB‑IoT links, kilobyte budgets).
- **Real-time A/V.** RTP/RTCP (RFC 3550) is the framing; the *transport* is SRTP-over-UDP for media and SCTP-over-DTLS-over-UDP for data inside WebRTC (RFC 8831). SRT, RIST, and now MoQ are eating WebRTC's lunch for one-to-many.
- **Security utilities.** TLS (RFC 8446 for 1.3) sits above TCP; DTLS (RFC 9147) does the same for UDP; **inside QUIC, TLS 1.3 is fused into the transport** (RFC 9001) — there is no plaintext QUIC. IPsec runs *below* TCP/UDP at L3.
- **DNS.** Originally UDP; TCP for large responses; DoT (RFC 7858) is TCP+TLS; DoH (RFC 8484) is HTTPS; DoQ (RFC 9250, May 2022) is QUIC.
- **Routing.** BGP runs over TCP port 179; OSPF directly over IP (no transport); fragility here causes many of the most spectacular outages discussed below.

The dependency graph is roughly: **TCP/UDP** depend on **IP**; **QUIC** depends on **UDP** (which it uses essentially as a thin demux/firewall-traversal substrate); **MPTCP** depends on **TCP**; **SCTP** depends on **IP** but is most often deployed in WebRTC over **DTLS over UDP**; **TLS/DTLS** depend on **TCP/UDP**; **HTTP/1‑3, gRPC, WebSocket, WebTransport, MoQ** depend on the transport family.

---

## 6. Common Patterns and Failure Modes

**Patterns that recur across the family:**

- **Three‑way (or four‑way) handshake** to exchange initial state. TCP: SYN/SYN-ACK/ACK; SCTP: INIT/INIT-ACK with cookie/COOKIE-ECHO/COOKIE-ACK (4-way, immune to SYN flood); QUIC: 1-RTT TLS 1.3 + 0-RTT resumption.
- **Sliding window** for both flow control (receiver) and congestion control (sender).
- **Slow start → congestion avoidance → fast retransmit → fast recovery** (Jacobson 1988; RFC 5681 for TCP; mirrored by SCTP §7 and QUIC RFC 9002).
- **AIMD** as the default fairness mechanism.
- **Cumulative + selective ACKs** (TCP SACK RFC 2018; SCTP gap reports; QUIC ACK ranges).
- **RACK‑TLP** for time‑based loss detection (RFC 8985, Feb 2021) — adopted in TCP, QUIC, and SCTP. [IETF](https://datatracker.ietf.org/doc/rfc8985/)
- **PMTU discovery** via ICMP (classical) or PLPMTUD (RFC 8899, packetization-layer probing — used by QUIC and modern SCTP).
- **Heartbeats** (SCTP HEARTBEAT, QUIC PING) to keep NAT bindings open and detect dead peers.
- **Exponential backoff** of retransmission timers (Karn's algorithm) and connection-establishment retries.
- **Nagle's algorithm + delayed ACKs** as the classic interactive‑latency footgun (TCP_NODELAY exists for this reason).
- **ECN** for congestion signaling without loss.
- **Port + 5‑tuple demultiplexing** plus connection IDs in QUIC for migration.

**Group-wide failure modes:**

- **Bufferbloat.** Excess buffering in routers, modems, Wi‑Fi APs causing seconds-long latencies under load. Origin: Jim Gettys, ACM Queue Nov–Dec 2011 ([https://queue.acm.org/detail.cfm?id=2071893](https://queue.acm.org/detail.cfm?id=2071893)). Mitigations: AQM (CoDel, FQ-CoDel, PIE), and now L4S (RFC 9330). [ACM Queue](https://queue.acm.org/detail.cfm?id=2071893)
- **Ossification.** Middleboxes assume specific TCP option layouts, IPID behaviors, or QUIC long-header bits, and break new protocol versions. Famous example: TCP Fast Open (RFC 7413) hits ~5% middlebox failure on the public Internet, which is why QUIC moved to UDP and encrypted nearly its whole wire image. RFC 9369 is *literally* an anti-ossification grease document ([https://datatracker.ietf.org/doc/rfc9369/](https://datatracker.ietf.org/doc/rfc9369/)).
- **NAT traversal.** Connection-oriented transports survive NAT only if state is kept; UDP-based transports rely on STUN/TURN/ICE. Mobile carriers' Carrier-Grade NATs frequently rebind every 30 seconds, killing long‑lived TCP without keepalives.
- **Head‑of‑line blocking.** A single dropped TCP segment freezes all multiplexed HTTP/2 streams; QUIC's per‑stream framing fixes this, but only for streams *within* a connection — drop the QUIC packet itself and the stream(s) it carries still suffer.
- **Retransmission storms.** What caused the 1986 collapse and recurs whenever a synchronization event (router reboot, link flap, WAN reconvergence) makes thousands of senders fire RTOs at once. Modern jittered backoff and ECN largely tame it.
- **SYN floods** and amplification attacks (DNS, NTP, memcached): connectionless and connection-establishment paths abused. Mitigations: SYN cookies (Bernstein/Schenk, 1996); SCTP's cookie handshake; QUIC's address validation (Retry packets, anti‑amplification 3× limit, RFC 9000 §8). [Qrator](https://blog.qrator.net/en/the-evolution-of-ddos-attacks-a-journey-from-1994_192/)
- **Ack amplification** in QUIC (mitigated by anti-amplification limit) and SCTP.
- **Spectre-of-the-Internet outages caused by neighboring layers, not transport itself:** BGP route leaks (Cloudflare July 2020; Cloudflare January 22, 2026), DNS misconfigurations, certificate expiries.

---

## 7. Industry Timeline

- **1969–1983** — ARPANET; NCP; the TCP/IP transition.
- **1983–1995** — TCP wins; UDP carries DNS/NTP/RIP. Stevens books (1990, 1994). Mosaic and the Web supercharge demand.
- **1996–2004** — Bandwidth + DDoS era. SYN cookies; SACK (RFC 2018, 1996); Reno → NewReno → CUBIC (Linux default 2006).
- **2000–2010** — SCTP, DCCP standardized, both fail to displace TCP/UDP on the open Internet. Datacenter-specific transports begin (DCTCP at Microsoft Research/Stanford, 2010).
- **2010–2017** — Mobile + bufferbloat era. CoDel (2012), FQ-CoDel (2014), MPTCP (Apple Siri, Sept 2013), HTTP/2 (2015), Google deploys gQUIC (~2013 onwards), BBR (2016). [Wikipedia](https://en.wikipedia.org/wiki/Multipath_TCP)
- **2018–2022** — IETF QUIC standardization; HTTP/3; RFC 9293 TCP refresh; RFC 9260 SCTP refresh; L4S RFCs published.
- **2023–2026** — QUIC v2 (May 2023); BBRv3 deployed by Google as default for google.com and YouTube traffic (Jul 2023 announcement at IETF 117, default through 2024–2025; [https://github.com/google/bbr](https://github.com/google/bbr)); ML-KEM hybrid PQC reaches ~38% of Cloudflare HTTPS by March 2025 ([https://blog.cloudflare.com/pq-2025/](https://blog.cloudflare.com/pq-2025/)); UEC 1.0 spec released June 2025; Multipath QUIC late-call/early RFC stage; MoQ Transport draft (draft-ietf-moq-transport-17, March 2026, [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)) approaches publication. [Intelligent Living](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)

**Who is pushing what:**

- **Google** (Cardwell, Cheng, Iyengar, Roskind alumni) — QUIC, BBRv1/2/3, RACK-TLP, gQUIC → IETF QUIC.
- **Cloudflare** (Pardue, Iyengar collaborators) — quiche, MASQUE, post-quantum, MoQ relay ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)).
- **Meta** (Roberto Peon, Alan Frindell) — mvfst QUIC, MoQ, HTTP/3 internals; ~75% of FB internal traffic on QUIC by Oct 2020. [Wikipedia](https://en.wikipedia.org/wiki/QUIC)
- **Apple** — MPTCP for Siri/Maps/Music, mandatory PQC on iMessage by end of 2024.
- **Microsoft** — msquic (open source), SMB-over-QUIC, UEC founding member.
- **Academia** — Stanford (CS144, Ousterhout's Homa), MIT (Alizadeh), TU Munich, UCLouvain (Bonaventure, Multipath QUIC), KTH/Karlstad (bufferbloat).
- **IETF working groups in 2026:** TCPM (TCP maintenance), TSVWG (transport area general), QUIC, MASQUE, MoQ, WEBTRANS, PEARG (privacy), CCWG (the new Congestion Control Working Group, where BBRv3 lives).
- **Standards bodies adjacent:** W3C WebTransport WG (CR ~90% complete as of October 2025), 3GPP (ATSSS for 5G uses MPTCP/MPQUIC), Ultra Ethernet Consortium (Linux Foundation JDF). [W3C](https://www.w3.org/wiki/WebTransport/Meetings2023)[HPCwire](https://www.hpcwire.com/2025/09/09/ultra-ethernet-has-arrived-one-network-to-rule-them-all/)
- **Open-source implementations:** Linux TCP/UDP/SCTP/MPTCP in kernel; FreeBSD has the most mature SCTP in any kernel; QUIC userspace stacks: msquic (Microsoft), quiche (Cloudflare, Rust), ngtcp2 (Tatsuhiro Tsujikawa, C), quic-go (Marten Seemann), mvfst (Meta), s2n-quic (AWS), picoquic (Christian Huitema), aioquic, lsquic (LiteSpeed).

---

## 8. Recommended Learning Paths (Current as of 2026)

**Order of attack for someone new to the family:**

1. Read Kurose & Ross Chapter 3 ("Transport Layer") — orientation. Then RFC 768 in one sitting.
2. Build the TCP labs from Stanford CS144 (you implement TCP yourself in C++).
3. Read Jacobson & Karels 1988 *and* the Cardwell BBRv1 paper back-to-back.
4. Read Grigorik's *High Performance Browser Networking* Part I (TCP) and Part III (HTTP/QUIC).
5. Skim RFC 9000 (QUIC) once for shape, then focus on §5 (connections), §13 (loss recovery), §17 (packet headers).
6. Watch a Wireshark capture of an HTTP/3 + ML-KEM handshake and an MPTCP Siri capture side by side.

**Resources (with year of last update):**

*Specifications.*

- **RFC 9293 — TCP** (Aug 2022) — [https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293) — *Authoritative; replaces RFC 793.* Sections 3.4 (sequence space), 3.5 (handshake), 3.7 (data) are essential. **Updated 2022.**
- **RFC 768 — UDP** (Aug 1980) — [https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768) — *Three pages.* Read it in five minutes. Last updated 1980; still current.
- **RFC 9000/9001/9002 — QUIC v1, QUIC-TLS, QUIC-RECOVERY** (May 2021); **RFC 8999** version invariants; **RFC 9221** unreliable datagrams (Mar 2022); **RFC 9369** QUIC v2 (May 2023). Index: [https://quicwg.org/](https://quicwg.org/).
- **RFC 9260 — SCTP** (Jun 2022) — [https://datatracker.ietf.org/doc/html/rfc9260](https://datatracker.ietf.org/doc/html/rfc9260).
- **RFC 8684 — MPTCP v1** (Mar 2020).
- **RFC 4340 — DCCP** (Mar 2006).
- **RFC 8985 — RACK-TLP** (Feb 2021).
- **RFC 9330/9331/9332 — L4S** (Jan 2023).
- **RFC 9114 — HTTP/3** (Jun 2022). **RFC 9250 — DNS-over-QUIC** (May 2022).
- **draft-ietf-quic-multipath** (active as of 2026): [https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath)
- **draft-ietf-moq-transport-17** (Mar 2026): [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- **UEC 1.0 Specification** (Jun 2025): [https://ultraethernet.org/](https://ultraethernet.org/)

*Books.*

- **Stevens & Fall, *TCP/IP Illustrated, Volume 1: The Protocols***, 2nd ed., Addison-Wesley, **15 November 2011**, 1056 pages. [https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/](https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/) — *Intermediate/advanced.* Still the deepest single book on the wire-level behavior of TCP/UDP/IP. **Last updated 2011.** [O'Reilly](https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/)
- **Tanenbaum & Wetherall, *Computer Networks***, 6th ed., Pearson, 2021. *Intro/intermediate.*
- **Kurose & Ross, *Computer Networking: A Top-Down Approach***, **9th edition, summer 2025** — [https://gaia.cs.umass.edu/kurose_ross/index.php](https://gaia.cs.umass.edu/kurose_ross/index.php) (8th ed. 2020 still widely used). *Intro.* **Updated 2025.** [University of Massachusetts](https://gaia.cs.umass.edu/kurose_ross/index.php)
- **Grigorik, *High Performance Browser Networking***, O'Reilly, 1st ed. **September 2013**, third release 16 September 2015; companion site continually updated at [https://hpbn.co/](https://hpbn.co/) — *Intermediate.* Best single text on TCP/UDP/TLS/HTTP/QUIC for application engineers. **Site updates ongoing (last visible refresh 2024).** [O'Reilly](https://www.oreilly.com/library/view/high-performance-browser/9781449344757/copyright-page01.html)[O'Reilly](https://www.oreilly.com/library/view/high-performance-browser/9781449344757/copyright-page01.html)
- **Stenberg, *HTTP/3 Explained***, free e-book, [https://http3-explained.haxx.se/](https://http3-explained.haxx.se/) — *Intro/intermediate.* **Updated through 2023.**
- **Peterson, Davie, & contributors, *TCP Congestion Control: A Systems Approach***, [https://tcpcc.systemsapproach.org](https://tcpcc.systemsapproach.org) — *Advanced.* **Living document, updates through 2024–2025.**

*Academic papers (canonical).*

- Cerf & Kahn, "A Protocol for Packet Network Intercommunication," *IEEE Trans. Comm.* COM-22(5), May 1974, DOI 10.1109/TCOM.1974.1092259.
- Jacobson & Karels, "Congestion Avoidance and Control," SIGCOMM '88, [https://ee.lbl.gov/papers/congavoid.pdf](https://ee.lbl.gov/papers/congavoid.pdf).
- Cardwell et al., "BBR: Congestion-Based Congestion Control," ACM Queue 14(5), Oct 2016 / CACM Feb 2017.
- Montazeri, Li, Alizadeh, Ousterhout, "Homa," SIGCOMM 2018, [https://arxiv.org/abs/1803.09615](https://arxiv.org/abs/1803.09615).
- Ousterhout, "It's Time to Replace TCP in the Datacenter," arXiv:2210.00714, Jan 2023.
- Zeynali et al., "Promises and Potential of BBRv3," PAM 2024, [https://inet-bbrv3eval.mpi-inf.mpg.de/](https://inet-bbrv3eval.mpi-inf.mpg.de/). [Mpg](https://inet-bbrv3eval.mpi-inf.mpg.de/)
- Hoefler et al., "Ultra Ethernet's Design Principles," arXiv 2508.08906, Aug 2025, [https://arxiv.org/html/2508.08906v1](https://arxiv.org/html/2508.08906v1).
- De Coninck & Bonaventure, "Multipath QUIC: Design and Evaluation," CoNEXT 2017, [https://multipath-quic.org/](https://multipath-quic.org/). [Multipath QUIC](https://multipath-quic.org/)

*Engineering blogs (current as of 2024–2026).*

- Cloudflare blog — series on QUIC ([https://blog.cloudflare.com/the-road-to-quic/](https://blog.cloudflare.com/the-road-to-quic/)), MASQUE ([https://blog.cloudflare.com/unlocking-quic-proxying-potential/](https://blog.cloudflare.com/unlocking-quic-proxying-potential/)), MoQ ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)), post-quantum ([https://blog.cloudflare.com/pq-2025/](https://blog.cloudflare.com/pq-2025/)), Radar Year in Review 2024/2025 ([https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)).
- Fastly engineering — "QUIC is RFC 9000," and PQC posts ([https://www.fastly.com/blog/future-proofing-tls-encryption-against-quantum-threats](https://www.fastly.com/blog/future-proofing-tls-encryption-against-quantum-threats), **Apr 2025**).
- Google bbr-dev mailing list and GitHub: [https://github.com/google/bbr](https://github.com/google/bbr) (active 2025).
- APNIC blog (Geoff Huston) — relentless empirical measurement of every transport change ([https://labs.apnic.net/](https://labs.apnic.net/)).
- Meta engineering — mvfst, QUIC at FB.
- Daniel Stenberg ("daniel.haxx.se") — running commentary on QUIC, HTTP, curl.
- Multipath-tcp.org blog — Apple's MPTCP usage ([https://www.multipath-tcp.org/](https://www.multipath-tcp.org/), posts through 2025).

*Video / talks.*

- IETF 117–125 plenary recordings on YouTube (CCWG, QUIC WG, MOQ WG). Specifically: "BBRv3: Algorithm Overview and Google's Public Internet Deployment" (IETF 119, Mar 2024) [https://datatracker.ietf.org/meeting/119/materials/](https://datatracker.ietf.org/meeting/119/materials/). [GitHub](https://github.com/google/bbr)
- Ben Eater's networking series (YouTube) — packets and Ethernet from first principles ([https://www.youtube.com/@BenEater](https://www.youtube.com/@BenEater)).
- Computerphile — multiple TCP/UDP/QUIC explainers.
- ACM SIGCOMM, USENIX NSDI, ATC paper recordings (annually).
- "How GitHub's Database Self-Destructed in 43 Seconds" — Hussein Nasser, YouTube — [https://www.youtube.com/watch?v=dsHyUgGMht0](https://www.youtube.com/watch?v=dsHyUgGMht0).
- Nick McKeown's lectures from CS144 (linked from [https://cs144.github.io/](https://cs144.github.io/)).

*Free university courses (current).*

- **Stanford CS144 — Introduction to Computer Networking** — McKeown & Levis. Course site [https://cs144.github.io/](https://cs144.github.io/), Stanford Online sessions Sep–Dec 2025 ([https://online.stanford.edu/courses/cs144-introduction-computer-networking](https://online.stanford.edu/courses/cs144-introduction-computer-networking)). *The* lab course where you implement TCP. **Updated 2025.** [Stanford Online](https://online.stanford.edu/courses/cs144-introduction-computer-networking)[CS DIY](https://csdiy.wiki/en/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/CS144/)
- MIT 6.829 — Computer Networks (graduate; Hari Balakrishnan).
- Princeton COS 461 — Computer Networks (Jen Rexford).
- CMU 15-441 — Networking and the Internet.
- Berkeley CS168 — Introduction to the Internet.

*Hands-on tools.*

- **Wireshark** ([https://www.wireshark.org/](https://www.wireshark.org/)) — current 4.x supports QUIC dissection out of the box; with the right keylog file, it decrypts HTTP/3.
- **tcpdump** + **tshark** for pipelines.
- **mininet** ([http://mininet.org/](http://mininet.org/)) — reproducible network emulation; CS144 uses it.
- **ns-3** — packet-level simulation; current BBRv3/L4S research uses it heavily.
- **qlog/qvis** ([https://qvis.quictools.info/](https://qvis.quictools.info/)) — log + visualize QUIC connections.
- **MPTCP-test** at [https://www.multipath-tcp.org/](https://www.multipath-tcp.org/).
- **iperf3, netperf, flent, tc-eBPF** for bench/AQM testing.

*Podcasts.*

- *The Hedge* and *NANOG Live* — operator perspective.
- *Software Engineering Daily* — frequent transport/QUIC episodes.
- *IPv6 Buzz* — adjacent.
- *Signals and Threads* (Jane Street) — occasionally networking, deep.

*Conference series to watch.*

- ACM SIGCOMM (annual; transport breakthroughs land here).
- USENIX NSDI / ATC.
- IETF 121/122/123/124/125 (2024–2026 meeting recordings).
- QUIC.dev / QUIC Summit (industry).
- Netdev Conf — Linux kernel networking (2024 in Vancouver).
- KubeCon (eBPF / Cilium tracks).
- SIGCOMM ANRW (Applied Networking Research Workshop).

---

## 9. Where Things Are Heading (2025–2026 Frontier)

**Active and accelerating:**

- **QUIC adoption.** As of 2025 Cloudflare reports 21% of all HTTPS requests are HTTP/3 ([https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/)) — but Cisco-cited industry estimates ([https://journals.sagepub.com/doi/10.1177/14614448251336438](https://journals.sagepub.com/doi/10.1177/14614448251336438)) put close to half of *consumer* Internet traffic in Europe/US/LatAm/AsiaPac on QUIC, because Meta and Google services dominate volume and are nearly 100% QUIC. TCP is not going away (still 50%+ of *requests*) but its share of *bytes* is shrinking fast. [Cloudflare](https://blog.cloudflare.com/radar-2025-year-in-review/)
- **Multipath QUIC.** draft-ietf-quic-multipath at version 21 in 2026, late call. Will give QUIC what MPTCP gave TCP — and because QUIC has connection IDs and migration built in, the design is cleaner. 3GPP ATSSS in 5G is moving in parallel.
- **MASQUE.** CONNECT-UDP (RFC 9298) and CONNECT-IP work in the IETF MASQUE WG — turning QUIC into a tunneling fabric, which is what Apple's iCloud Private Relay and Cloudflare's WARP rely on ([https://blog.cloudflare.com/unlocking-quic-proxying-potential/](https://blog.cloudflare.com/unlocking-quic-proxying-potential/)). [Cloudflare](https://blog.cloudflare.com/unlocking-quic-proxying-potential/)
- **L4S deployment.** RFC 9330/9331/9332 (Jan 2023). DOCSIS 4.0 cable modems shipping with L4S-capable AQM in 2024–2025 (Comcast). Apple shipped L4S support in iOS 17 / macOS Sonoma (June 2023 WWDC). The classic vs. scalable congestion control fairness debate is still live — see BBRv3 papers.
- **BBRv3.** Default for google.com and YouTube as of 2024. Independent measurements (Zeynali et al., PAM 2024; ANRW 2024) show BBRv3 is fairer than v1/v2 against itself but still unfriendly to CUBIC in a wide range of conditions — meaning the public-Internet "BBR vs. CUBIC fairness war" continues.
- **Datacenter transport revolution.** UEC 1.0 published June 2025; Broadcom Tomahawk Ultra Ethernet switch (250 ns latency) shipping; AMD Pensando Pollara 400 NIC available; Homa kernel module for Linux is production-ish. The decade-long question — *can Ethernet replace InfiniBand for AI scale-out?* — is being answered "yes, but with a brand-new transport on top." UET is connectionless, multipath by default, uses packet trimming, supports both ordered and unordered semantics. Expect this to be the dominant scale-out transport for AI training clusters by 2027–2028. [HPCwire](https://www.hpcwire.com/2025/09/09/ultra-ethernet-has-arrived-one-network-to-rule-them-all/)[Tom's Hardware](https://www.tomshardware.com/networking/ultra-ethernet-the-data-center-interconnection-of-tomorrow-detailed)
- **RoCEv2 entrenched.** Google A3 Ultra, A4 (Apr 2024 onwards) use RoCEv2 for AI fabrics ([https://cloud.google.com/blog/products/networking/rdma-rocev2-for-ai-workloads-on-google-cloud](https://cloud.google.com/blog/products/networking/rdma-rocev2-for-ai-workloads-on-google-cloud)). Most existing GPU clusters will be RoCEv2 for years; UET is the future, RoCEv2 is the present.
- **Post-quantum transport crypto.** ML-KEM (FIPS 203, August 2024) hybrid-with-X25519 is the de facto standard; Cloudflare measured ~38% of HTTPS using it by March 2025 ([https://blog.cloudflare.com/pq-2025/](https://blog.cloudflare.com/pq-2025/)); Apple iMessage's PQ3, Signal's PQXDH are deployed; Fastly rolled out ML-KEM in April 2025; Akamai followed later in 2025. PQ signatures are the harder problem — handshake size grows substantially, which interacts badly with QUIC's anti-amplification limit and TCP MSS. Active IETF work in 2026. [Intelligent Living + 2](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)
- **Programmable transport / kernel bypass.** XDP, AF_XDP, io_uring, eBPF-in-the-transport-layer — Cilium uses eBPF for L4 load balancing at Mbps-to-Tbps scales ([https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/](https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/)). Linux 6.x adds io_uring zero-copy networking. The kernel TCP stack will not disappear but high-performance services increasingly bypass it. [Eunomia](https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/)
- **WebTransport.** W3C CR ~90% complete as of Oct 2025 ([https://www.w3.org/TR/webtransport/](https://www.w3.org/TR/webtransport/)); Chrome+Firefox shipping; Safari behind a flag in 18.4 (March 2025). [W3C](https://www.w3.org/wiki/WebTransport/Meetings2023)
- **MoQ — Media over QUIC.** Cloudflare launched a global MoQ relay network in 2025 ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)). draft-ietf-moq-transport-17 dated 2 March 2026. Aims to unify the live-streaming stack (currently a mess of HLS+DASH+WebRTC+SRT) on a single QUIC-based protocol. Real production use cases: low-latency live sports, cloud gaming, real-time auctions. [Cloudflare](https://blog.cloudflare.com/moq/)[IETF](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)

**What will be obsolete in five years (2031):**

- DCCP, in any practical sense. (It already is.)
- SCTP on the public Internet (telco use cases will persist; WebRTC data channels likely migrate to QUIC datagrams via WebTransport).
- gQUIC entirely (already deprecated; IETF QUIC has fully replaced it).
- HTTP/2 over TCP for new public-Web deployments — though it'll persist for a long time as a fallback.
- RoCEv2 in new AI cluster designs (UET will displace it for greenfield by 2028).
- TCP Fast Open and most "new TCP options" — middlebox ossification means they won't reach meaningful deployment.

**Where the money/attention is:**

- Hyperscaler datacenter networking ($40B+ AI cluster build-out pulls all the air): UEC, Homa, RoCEv2, programmable NICs, GPU-aware transports.
- Mobile transport: Multipath QUIC + 3GPP ATSSS for 5G.
- Real-time media: MoQ + WebTransport vs. WebRTC.
- Post-quantum migration: regulators (NIST CNSA 2.0, EU CRA) are forcing the timeline; expect 2026–2030 to be a continuous PQ migration on the transport layer.

---

## 10. Hooks for the Article, Infographic, and Podcast

**60-second narrated hook (for the ear):**
"In October of 1986, the Internet broke. The link between Lawrence Berkeley Lab and UC Berkeley — 400 yards apart, three hops — slowed from 32 kilobits per second to 40 *bits* per second. A factor of nearly a thousand. Email started taking days. Researchers thought the experiment was over. Two engineers, Van Jacobson and Mike Karels, sat in a Berkeley coffee house and asked the right question: not 'why is the Internet broken?' but 'how did it ever work in the first place?' The fix they wrote took six months and fits in eight pages. We've been running it, in some form, on every connection of every device for almost forty years. This is the story of the layer that sits between the chaos of packets and the order of applications — the transport layer. The most boring, most consequential layer of computing nobody has ever heard of." [ES](https://www.es.net/about/esnet-history/unjamming-the-information-superhighway-and-saving-the-internet/)

**Striking statistic:**
The October 1986 congestion collapse dropped throughput from 32,000 bps to 40 bps — a 99.875% loss between two sites separated by a quarter-mile. Source: Jacobson & Karels, SIGCOMM 1988, [https://ee.lbl.gov/papers/congavoid.pdf](https://ee.lbl.gov/papers/congavoid.pdf).

**Pause-and-think moment:**
The base TCP specification was first written in 1981 (RFC 793) — and was not consolidated into a single, errata-free document for **forty-one years**, until RFC 9293 in August 2022. For four decades, the protocol that carried the Internet was specified across dozens of RFCs, with extensions, errata, and tribal knowledge spread between them. There is, in 2026, exactly one engineer in the world's biographical entry — Wesley Eddy — credited as the editor who finally pulled it all together ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293)). [IETF](https://datatracker.ietf.org/doc/html/rfc9293)[IETF](https://www.ietf.org/rfc/rfc9293.pdf)

**Failure-story arc — The 1986 Congestion Collapse:**

- *Setup:* The early Internet was 56 kbps end to end. 4.3BSD's TCP, written by people who had never seen a congested network, retransmitted aggressively on packet loss — sending duplicates of dropped packets, generating more congestion, generating more drops.
- *Mistake:* Implicit, architectural — the original TCP specification said nothing about how a sender should *back off* when the network was overloaded. Every implementer guessed.
- *Consequence:* In October 1986, the LBNL ↔ UC Berkeley link collapsed from 32 kbps to 40 bps. The collapse repeated. Bob Metcalfe (inventor of Ethernet) publicly predicted the Internet's imminent death. [Substack](https://systemsapproach.substack.com/p/how-congestion-control-saved-the)
- *Resolution:* Van Jacobson and Mike Karels, working at LBNL/UC Berkeley, wrote one paper — "Congestion Avoidance and Control," SIGCOMM '88 — that put six new algorithms (slow start, AIMD, RTT estimation, exponential backoff, fast retransmit, fast recovery) into BSD TCP. The fix was open source, kernel-level, and shipped in BSD 4.3-Tahoe in 1988. Within a year, every TCP implementation on Earth had adopted it. The Internet did not collapse again. The same paper is, by some counts, the most-cited networking publication of all time. [Wikipedia](https://en.wikipedia.org/wiki/Network_congestion)[Substack](https://systemsapproach.substack.com/p/how-congestion-control-saved-the)

**Alternative failure-story arc — AWS S3 outage, 28 February 2017:**

- *Setup:* An "authorized S3 team member" was debugging the S3 billing system using an "established playbook" that involved running a command to remove a small set of servers from one S3 subsystem. [NPR](https://www.npr.org/sections/thetwo-way/2017/03/03/518322734/amazon-and-the-150-million-typo)
- *Mistake:* They mistyped the input. Instead of removing a few servers, the command removed a much larger set — including the index and placement subsystems on which most of S3 depended. [Amazon Web Services](https://aws.amazon.com/message/41926/)[Amazon Web Services](https://aws.amazon.com/message/41926/)
- *Consequence:* For roughly four hours, US-EAST-1 S3 was unavailable; the AWS Service Health Dashboard *itself ran on S3* and could not update. Cyence estimated $150 million in S&P 500 impact; 54 of the top 100 retailers saw their websites slow ≥20% ([https://www.npr.org/sections/thetwo-way/2017/03/03/518322734/amazon-and-the-150-million-typo](https://www.npr.org/sections/thetwo-way/2017/03/03/518322734/amazon-and-the-150-million-typo)). Apple iCloud, Slack, Trello, Quora, Medium, and even AWS-monitoring services like Down Detector were degraded. [NPR + 3](https://www.npr.org/sections/thetwo-way/2017/03/03/518322734/amazon-and-the-150-million-typo)
- *Resolution:* Amazon modified the tooling to remove capacity more slowly with safeguards preventing any subsystem from going below minimum required capacity, partitioned the index subsystem into smaller cells, and moved the Service Health Dashboard onto multiple regions ([https://aws.amazon.com/message/41926/](https://aws.amazon.com/message/41926/)). This isn't a *transport* failure per se, but it cleanly illustrates how the entire stack — including transport-layer dependencies between AWS services — concentrates blast radius in one key place. [TechCrunch](https://techcrunch.com/2017/03/02/aws-cloudsplains-what-happend-to-s3-storage-on-monday/)[Gremlin](https://www.gremlin.com/blog/the-2017-amazon-s-3-outage)

---

## Caveats

- **QUIC traffic share figures vary widely** depending on whose vantage point: Cloudflare Radar reports HTTP/3 at ~21% of *requests* in 2025 ([https://blog.cloudflare.com/radar-2025-year-in-review/](https://blog.cloudflare.com/radar-2025-year-in-review/)), while industry analyses citing Cisco data suggest near 50% of consumer Internet traffic *bytes* are QUIC because of YouTube/Meta dominance ([https://journals.sagepub.com/doi/10.1177/14614448251336438](https://journals.sagepub.com/doi/10.1177/14614448251336438)). Don't conflate "share of HTTP requests at one CDN" with "share of bytes on the Internet" — they are very different measurements.
- **BBRv3 is the default for google.com and YouTube but its fairness with CUBIC remains debated.** Independent papers (Zeynali et al., PAM 2024 and ANRW 2024) show BBRv3 still under-shares with CUBIC in many scenarios. Treat Google's announcements as deployment facts, not as fairness proofs.
- **Ultra Ethernet 1.0 is a young spec.** Most "UEC-ready" hardware shipping in 2025 implements a subset; full 1.0 compliance is rolling out in 2026. Treat headline performance numbers (250 ns switch latency, etc.) as vendor claims pending broad independent benchmark. [Tom's Hardware](https://www.tomshardware.com/networking/ultra-ethernet-the-data-center-interconnection-of-tomorrow-detailed)
- **The user's task list dated TCP as 1981.** That is correct for RFC 793 (September 1981) — the canonical date — but Cerf & Kahn's TCP first appeared in May 1974, and the modern definitive spec is RFC 9293 (August 2022). The two-page spec for UDP is RFC 768 (28 August 1980), so the user's dates for TCP/UDP are conventional but coarse; 2022 (TCP refresh) and 1980 (UDP) are also defensible. [IETF](https://datatracker.ietf.org/doc/html/rfc9293)
- **MPTCP's "2013" date** in the user's list refers to RFC 6824 (the Experimental v0); the production-shape standard is RFC 8684 (March 2020) and the upstream Linux kernel implementation only landed in March 2020 (5.6). For "when can engineers actually use this in vanilla Linux," 2020 is the better date. [Multipath-tcp](https://multipath-tcp.org/)
- **DCCP and SCTP statements about "death" are deployment statements, not standards-track statements** — the RFCs are alive, the protocols still ship in Linux/FreeBSD, telco infrastructures still depend on SCTP. They are obscure on the open Internet, not formally deprecated.
- **Article 6 of the Cloudflare 2025 outage timeline (route leak January 22, 2026)** is post-task-cutoff in style but is a real Cloudflare blog post ([https://blog.cloudflare.com/route-leak-incident-january-22-2026/](https://blog.cloudflare.com/route-leak-incident-january-22-2026/)) reporting an event matching the task date. Treat this as a single-source claim until corroborated.
- **Several quoted "share of QUIC" figures from 2024–2025** are derived from Cloudflare or Cisco vantage points, both of which under-sample the long-tail Web. Real numbers are probably similar but not exactly comparable.