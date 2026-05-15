---
id: tcp
type: protocol
name: Transmission Control Protocol
abbreviation: TCP
etymology: "[T]ransmission [C]ontrol [P]rotocol"
category: transport
year: 1981
rfc: RFC 9293
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/addressing
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/before-the-internet
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-1986-collapse
  - story-of-the-internet/osi-vs-tcp-ip
  - story-of-the-internet/the-web-arrives
  - story-of-the-internet/mobile-and-bufferbloat
  - story-of-the-internet/the-quic-redesign
  - layer-2-3/ethernet
  - layer-2-3/ipv4
  - layer-2-3/icmp
  - layer-2-3/bgp
  - transport/tcp
  - transport/udp
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - web-api/http1
  - web-api/http2
  - web-api/http3
  - web-api/websockets-and-sse
  - web-api/mcp-and-a2a
  - async-iot/amqp
  - async-iot/coap
  - realtime-av/webrtc
  - utilities-security/dns
  - utilities-security/ssh
  - utilities-security/email-stack
  - patterns-failures/patterns
  - patterns-failures/failure-modes
  - patterns-failures/congestion-history
  - famous-outages/arpanet-1980
  - famous-outages/mitnick-1994
  - famous-outages/sack-panic-2019
  - frontier/post-quantum
  - frontier/l4s-everywhere
  - frontier/ultra-ethernet
related_protocols: [udp, ip, ipv6, tls, http1, http2, http3, websockets, ssh, smtp, ftp, imap, bgp, mptcp, sctp, icmp, ipsec, quic, grpc]
related_pioneers: [vint-cerf, bob-kahn, jon-postel, van-jacobson]
related_outages: [nsfnet-1986-collapse, sack-panic-2019]
related_frontier: [l4s-comcast-launch, bbrv3-default]
related_rfcs: [9293, 5681, 9438, 8985, 7323, 6928, 7413, 5925, 8684, 9330, 4821]
related_journeys: [url-bar, wire-to-web]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tcp_state_diagram.svg/500px-Tcp_state_diagram.svg.png
    caption: The TCP finite state machine — every connection transitions through these eleven states from CLOSED through ESTABLISHED to TIME_WAIT.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "An illustrated TCP segment header — 20 bytes minimum, six 32-bit rows. Source/destination ports on the first row in one colour, sequence number in its own colour on row two, ACK number on row three, the eight one-bit flags clustered on row four."
  - "The three-way handshake as a sequence diagram with timing arrows: client SYN to server, server SYN-ACK back, client ACK forward. One full RTT from initiate to first byte allowed."
  - "A graph of TCP throughput vs time on a long-fat-pipe link, with three curves layered: classic Reno (sawtooth), CUBIC (smoother concave), BBR (flat at the bottleneck bandwidth, occasionally probing higher). Same path, three different congestion controllers."
  - "The state machine as a directed graph — eleven nodes for the eleven states, arrows labelled with the events that cause each transition. TIME_WAIT prominently labelled '60 seconds, 2× MSL, the most paranoid 60 seconds in networking.'"
  - "A side-by-side comparison: TCP+TLS handshake (3 round-trips) versus QUIC handshake (1 round-trip, or 0-RTT on resumption). Each round-trip drawn as a horizontal arrow with elapsed time."
  - "A photo of the Netflix Open Connect appliance — a single rack-mount server pushing 400 Gb/s of TLS-encrypted video over TCP, with a label calling out the AMD EPYC 7502P, dual 100 G NICs, 18 NVMe SSDs."
---

# TCP — Transmission Control Protocol

## In one breath

TCP is the protocol that turns the internet's best-effort packet fabric into something a database, a web browser, or a remote shell can actually use. It establishes a connection between two endpoints, numbers every byte so the receiver can detect missing data, acknowledges what arrives, retransmits what does not, and paces the sender so it never floods the network. Forty-five years after RFC 793, more than half of all internet traffic still rides on TCP — most banking, most file transfer, most email, most database protocols, and the roughly 51% of the web that has not yet moved to HTTP/3.

## The pitch

The current TCP specification, RFC 9293, was published in August 2022. It is younger than your phone. For 41 years before that, the entire internet ran on a 1981 document that Jon Postel edited at ISI — RFC 793 — without amendment. The protocol your laptop uses to load this article was, until very recently, formally specified by a piece of paper older than most working software engineers. This episode is about what is in TCP today: the headers, the state machine, the congestion controllers, the production tuning, the things that still go wrong in 2026, and the slow-motion handover to QUIC.

## How it actually works

Every TCP connection starts as a three-way handshake, runs as a stream of acknowledged segments paced by a sliding window, and ends with a four-way close that holds the four-tuple in TIME_WAIT for about 60 seconds. The simulator on this protocol's page walks you through it: SYN with the client's initial sequence number, SYN-ACK with the server's number plus an acknowledgement of the client's, then ACK to seal it. ESTABLISHED. Data flows. Each segment carries the next sequence number; each acknowledgement names the next byte the receiver expects. When either side is done, it sends FIN, the other side acknowledges, sends its own FIN, the first side acknowledges back, and a socket sits in TIME_WAIT to swallow stragglers.

### Header at a glance

The minimum TCP header is **20 bytes**, fixed. Options can extend it up to 60.

- **Source and destination ports** — 16 bits each. These plus the IP source and destination form the four-tuple that uniquely identifies a connection.
- **Sequence number** — 32 bits. Numbers the *first byte of payload* in this segment. Each byte in the stream has its own sequence number; the field rolls over after 4 GB.
- **Acknowledgement number** — 32 bits. The next byte the receiver expects. Combined with cumulative semantics, one ACK acknowledges all bytes up to that point.
- **Data offset** — 4 bits. Header length in 32-bit words; ranges from 5 to 15.
- **Eight one-bit flags** — CWR, ECE, URG, ACK, PSH, RST, SYN, FIN. Two were repurposed from the old Reserved field for ECN signalling. SYN initiates a connection, FIN closes a direction, RST aborts, PSH asks the receiver to deliver immediately, ACK marks the acknowledgement number valid, URG/CWR/ECE you rarely think about.
- **Window** — 16 bits. The number of additional bytes the receiver is willing to accept. Multiply by the negotiated Window Scale option to get up to a 1 GB window — without scaling, you are capped at 65,535 bytes, and on a 100 ms transcontinental path that translates to ~5 Mbit/s of throughput regardless of link speed.
- **Checksum** — 16 bits. Computed over the IP pseudo-header plus TCP header plus data.
- **Urgent pointer** — 16 bits. Mostly historical.
- **Options** — variable. MSS (advertised in the SYN), Window Scale (RFC 7323), SACK Permitted and SACK (RFC 2018), Timestamps (RFC 7323), TCP-AO authentication (RFC 5925), TCP Fast Open cookies (RFC 7413), and the MPTCP subtypes (RFC 8684).

### State machine in three sentences

A passive opener sits in LISTEN; an active opener sends SYN and goes to SYN-SENT; the server responds SYN+ACK and enters SYN-RECEIVED; once the client's ACK lands, both sides are in ESTABLISHED. To close, the active side sends FIN and walks through FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT (where it sits for 2× the maximum segment lifetime, around 60 seconds on Linux), while the passive side walks CLOSE-WAIT → LAST-ACK → CLOSED. Eleven states, every transition driven by a flag combination on a received segment or an action from the application above.

### Reliability, flow, and security mechanics

TCP separates two kinds of pacing. **Flow control** keeps a fast sender from overwhelming a slow receiver — the receiver advertises its window in every ACK, the sender honours it. **Congestion control** keeps a sender from overwhelming the *network* — the sender maintains its own congestion window (cwnd) that lives only in its memory and never appears on the wire. Actual sending is bounded by the smaller of the two.

The four classical algorithms come from Van Jacobson's 1988 paper and are codified in RFC 5681:

- **Slow start** doubles cwnd every round-trip until it crosses a threshold called ssthresh.
- **Congestion avoidance** then adds about one MSS per round-trip — additive increase.
- **Fast retransmit** triggers when the sender sees three duplicate ACKs (the receiver telling it three times that it is missing the same byte), and retransmits without waiting for a timeout.
- **Fast recovery** halves cwnd on a fast retransmit instead of dropping it to one MSS.

The full story of how those algorithms came to be is the chapter on the 1986 Congestion Collapse — pair this episode with that one. The story of where they have gone since — Reno, NewReno, Vegas, CUBIC, Compound, BBR, L4S — is the chapter called *A History of Congestion Control*.

What you will see in production today: **CUBIC** (RFC 9438, Standards Track since August 2023) is the default on Linux, Windows, and macOS. It replaces the linear additive-increase with a cubic function of time since the last loss, which scales much better on long-fat-pipe links. **BBR** abandons loss as the primary signal and instead models the path's bottleneck bandwidth and minimum RTT directly, pacing at the bandwidth-delay product. **RACK-TLP** (RFC 8985, February 2021) replaces the old "three duplicate ACKs" rule with time-based loss detection using transmit timestamps and SACK information.

For authentication of long-lived control sessions — BGP between routers, LDP between MPLS nodes — there is **TCP-AO** (RFC 5925, 2010), which finally landed natively in Linux 6.7 in January 2024 after a decade of waiting. It replaces the deprecated TCP-MD5 from RFC 2385. Until TCP-AO, BGP operators had been authenticating their sessions with an algorithm published in 1998 that the IETF had been telling them not to use since 2010.

## Where it shows up in production

**Linux kernel** is the workhorse of the cloud. Default congestion control is CUBIC since kernel 2.6.19 (2006); BBR is one `sysctl` away with `net.ipv4.tcp_congestion_control=bbr`. Initial cwnd is 10 segments (about 14,600 bytes) per RFC 6928. Linux 6.7 added TCP-AO; Linux 6.15 added io_uring zero-copy receive paths.

**FreeBSD with kTLS powers Netflix's Open Connect CDN.** Drew Gallatin's EuroBSDcon 2021 talk demonstrated **400 Gb/s of TLS-encrypted video from a single server** on commodity AMD EPYC 7502P silicon — 256 GB of DDR4-3200, dual Mellanox ConnectX-6 Dx 100G NICs, 18 NVMe SSDs, NIC-offload kTLS. By 2023 Netflix's CDN was pushing terabits per second across thousands of OCAs. TCP, not QUIC, carries Netflix.

**Google** runs **BBR** globally for google.com, YouTube, and Google Cloud. The public BBR rollout produced about a 4% mean throughput improvement on YouTube, more than 14% in some countries, and a 33% reduction in median RTT. **BBRv3** has been the default since 2024; the spec lives at `draft-ietf-ccwg-bbr` and is on revision 5 as of early 2026.

**Meta** runs more than 75% of internet-facing traffic on QUIC, but TCP still carries the rest — most service-to-service traffic inside the data centre, plus backwards-compatible client paths.

**Cloudflare** runs a heavily customised Linux TCP stack: SO_REUSEPORT plus eBPF for connection steering, per-CPU listen sockets, NGINX-tuned accept queues, custom TIME_WAIT and TCP memory tuning. The blog posts *the-sad-state-of-linux-socket-balancing* and *perfect-locality-and-three-epic-systemtap-scripts* are the canonical references.

**Apple** uses a BSD-derived TCP stack across iOS and macOS. NewReno + CUBIC are the defaults since iOS 5; ECN with L4S support is enabled by default since iOS 17 and macOS Sonoma. Apple ships MPTCP for system services — Siri, Maps, Music — to bridge Wi-Fi and cellular handoffs.

**Windows** has defaulted to CUBIC since Windows 10 1709 / Server 2019 and supports DCTCP and Compound TCP for data-centre paths.

**Userspace stacks** matter at the high end. lwIP for embedded, mTCP and F-Stack on DPDK, Seastar inside ScyllaDB, gVisor's netstack in Go, and AWS's own internal transport. They exist because the kernel TCP stack — even with BBR and io_uring — bottlenecks at multi-hundred-Gb/s line rates.

## Things that go wrong

TCP has had a long parade of vulnerabilities, mostly in implementations rather than the protocol itself.

**Sequence-prediction attacks** were the canonical TCP attack of the 1990s. Robert T. Morris's 1985 paper *A Weakness in the 4.2BSD Unix TCP/IP Software* pointed out that BSD's initial sequence number was a slow-counter plus a per-connection constant — entirely predictable. Kevin Mitnick used the technique on Christmas Day 1994 to forge a connection to Tsutomu Shimomura's machine at the San Diego Supercomputer Center; the chapter on Mitnick vs Shimomura 1994 is the full story. RFC 1948 (Bellovin, 1996) replaced the predictable formula with a hashed function of the four-tuple and a per-boot secret. Modern stacks use cryptographically random ISNs per RFC 9293 §3.4.1; the attack is now a teaching exercise.

**SYN floods** in the mid-1990s exhausted server connection tables before a SYN-ACK could complete. D. J. Bernstein and Eric Schenk invented **SYN cookies** in days after the September 1996 Panix attack made the front page of the *Wall Street Journal*; the technique encodes the connection state inside the initial sequence number so the server allocates no memory until the third packet arrives.

**Off-path TCP exploits** (CVE-2016-5696) showed in August 2016 that the global challenge-ACK rate-limit counter from RFC 5961 was a side channel — a blind off-path attacker could probe it to infer whether two arbitrary hosts were talking, hijack non-encrypted TCP connections, and reset encrypted ones. Affected Linux 3.6 onward. Cao and colleagues at UC Riverside disclosed it; mitigations were added quickly.

**SACK Panic** in June 2019 (CVE-2019-11477) was the canonical case: a single TCP packet, no authentication required, would crash any vulnerable Linux host. Kernels 2.6.29 through 5.1 — ten years of unpatched code in the heart of every Linux server. The chapter on SACK Panic 2019 has the full disclosure timeline, the integer-overflow root cause, and what changed in Linux fuzzing infrastructure afterward.

**TIME_WAIT misconfigurations** are an evergreen production hazard. Operators reach for `net.ipv4.tcp_tw_recycle` to clear the state faster — but that sysctl was *removed* from Linux in 4.12 because it broke NAT'd clients sharing TCP timestamps. The right knobs are SO_REUSEADDR, server-side closes, and tuning the ephemeral port range plus `tcp_fin_timeout`.

## Common pitfalls (for the practitioner)

**Nagle plus delayed ACK equals 200 ms latency.** Nagle's algorithm coalesces small writes; delayed ACK batches acknowledgements. When both are on by default, an interactive request/response loop writing in small chunks can stall for up to 200 ms waiting for the receiver to ACK what the sender hasn't sent yet. Cure: `setsockopt(TCP_NODELAY, 1)` for any latency-sensitive application.

**Ephemeral port exhaustion** hits servers that make many short-lived outbound connections — calls to upstream APIs, scraping pipelines, microservice meshes without connection pooling. The local OS exhausts the ephemeral port range (default 32768–60999 on Linux). Sockets sit in TIME_WAIT for ~60 seconds, blocking each four-tuple. Cure: enable connection reuse — HTTP keep-alive, gRPC pooling — or widen the range with `net.ipv4.ip_local_port_range`. Server-side closes also help, because the *server* holds TIME_WAIT in that case, not the client.

**PMTU black holes** happen when a path drops large packets but does not return the ICMP Fragmentation Needed message — usually because some intermediate firewall rate-limits or blocks ICMP. The TCP connection hangs because every retransmit is also too large and also fails. Cure: enable PLPMTUD (RFC 4821, packetisation-layer probing at the application layer) or set TCP MSS clamping at the network edge.

## Debugging it

`ss -tin` shows per-socket cwnd, ssthresh, RTT, retransmits, and pacing rate — the modern replacement for `netstat`. `nstat` and `/proc/net/snmp` and `/proc/net/netstat` give counters: TCPLossProbes, TCPRetransFail, TCPSynRetrans, ListenDrops. `tcpdump -K` skips checksums for offload-friendly captures; Wireshark's *Expert Info* and *TCP analysis flags* surface out-of-order segments, retransmissions, duplicate ACKs, and zero windows automatically.

For deeper investigation, `bpftrace` and Brendan Gregg's bcc tools — `tcpconnect`, `tcpaccept`, `tcpretrans`, `tcpdrop` — are the modern replacements for the retired `tcp_probe`. Google's `packetdrill` lets you script wire-format tests that exercise specific TCP code paths; Google found ten Linux TCP bugs with it during Fast Open and Loss Probe development. The L4S Team Linux tree on GitHub is where you experiment with TCP Prague and AccECN.

The most common production misconfigurations that show up in those tools: a tiny `tcp_max_syn_backlog`, `somaxconn` left at the kernel default of 128, a low ephemeral-port range, all NIC RX queues bound by IRQ affinity to CPU 0, `tcp_wmem` capped at 4 MB on a server doing 200 ms WAN, and forgetting to enable the `fq` qdisc when you switch to BBR — BBR's pacing assumes fair queuing.

## What's changing in 2026

**Linux 6.15 (mid-2025)** landed io_uring zero-copy receive (`io_uring zcrx`) integrated with the kernel TCP stack. Single-flow throughput jumped from ~74 Gb/s on epoll to ~106 Gb/s on io_uring zcrx — about a 40% improvement for high-bandwidth servers without any application changes.

**AccECN** (`draft-ietf-tcpm-accurate-ecn-34`, March 2025) is on the Standards Track path. It reallocates the old ECN-Nonce bit to carry more than one congestion signal per round-trip — the precondition that L4S over TCP needs for fine-grained congestion response.

**Comcast launched L4S in production in late January 2025** across Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (MD), and San Francisco — sub-millisecond queuing latency for cooperating flows, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The first large-scale deployment of the L4S architecture (RFCs 9330/9331/9332) on a production access network. The full launch entry is on the Frontier page.

**Linux 6.7 (January 2024)** merged native TCP-AO — five thousand lines of new networking code finally giving Linux a modern replacement for the deprecated TCP-MD5 used by BGP and LDP. Same release added microsecond-resolution TCP timestamps.

**BBRv3** has been the default for google.com and YouTube since 2024 and is now `draft-ietf-ccwg-bbr` revision 5 inside the IETF Congestion Control Working Group, the successor venue to the closed iccrg.

The longer arc: **QUIC carries about 21% of Cloudflare-observed web requests** as of Q1 2026, and more than 75% of Meta's internet traffic. The marginal new application protocol effort is going into QUIC. TCP retains the long tail — SSH, BGP, IMAP, SMTP, databases, internal RPC, IPsec control planes — and that long tail is most of the bytes on the internet outside the web.

## Fun facts (host material)

**RFC 793 was the spec for 41 years.** From September 1981 until RFC 9293 in August 2022. Jon Postel's original document was almost certainly the longest unmodified IETF specification ever. RFC 9293, edited by Wesley Eddy, finally consolidated 13 errata documents into a single readable spec.

**The window field is only 16 bits.** Maximum 65,535 bytes. On a 100 ms transcontinental path that caps throughput at about 5 Mbit/s — line speed for a modem in 1995, useless for anything modern. The Window Scale option from RFC 7323 (1992) shifts the window left by up to 14 bits, allowing windows up to 1 GB. Without it, modern long-fat-pipe networking would be impossible.

**TIME_WAIT exists because of stragglers.** After active close, a socket sits in TIME_WAIT for about 60 seconds — twice the maximum segment lifetime. Why? A delayed segment from the old connection could otherwise re-enter a freshly-opened connection on the same four-tuple and be misinterpreted as legitimate data. This is the most paranoid 60 seconds in networking, and the Maximum Segment Lifetime is 30 seconds on Linux because that was the longest a packet was thought to be able to wander the early internet before being TTL-killed. Modern packets do not wander for 30 seconds; the constant has not been updated.

**"BBR" stands for "Bottleneck Bandwidth and Round-trip propagation time."** Cardwell, Cheng, Gunn, Hassas Yeganeh, and Jacobson realised those two parameters fully describe an ideal sending path. Leonard Kleinrock had pointed out the optimal operating point in the 1970s; it took 40 years for production stacks to chase it.

**The April Fools' RFCs include one that actually got implemented.** RFC 1149 ("IP over Avian Carriers") was implemented by the Bergen Linux User Group in 2001 — packets in tubes attached to pigeons. Note that it was IP, not TCP. The closest April-1 RFC to a TCP joke is RFC 8962, "Establishing the Protocol Police."

**Postel's Robustness Principle** — *be conservative in what you do, be liberal in what you accept from others* — first appeared in his RFC 760 introduction in 1980 and entered the cultural canon. Modern security writers (Sassaman, Allman) have argued the principle aged badly: lenient receivers let buggy senders thrive. IETF practice in the 2020s has tilted toward strict validation. A nice example of a load-bearing piece of engineering culture being quietly retired.

## Where this connects in the book

- **The 1981–83 Standardisation Burst** (Part II) — RFCs 791, 792, 793, the ARPANET flag day, IEEE 802.3 ratified. The three years that locked TCP/IP into the stack.
- **The 1986 Congestion Collapse** (Part II) — Van Jacobson, Mike Karels, the six algorithms, the moment TCP became a protocol you could trust at scale. Pair this episode with that one.
- **The OSI vs TCP/IP War** (Part II) — David Clark's "rough consensus and running code." Why TCP/IP won the standards fight.
- **The Mobile and Bufferbloat Decade** (Part II) — what happened to TCP's congestion control once cheap memory put multi-megabyte buffers in front of it.
- **The QUIC Redesign** (Part II) — why a new transport had to ship in the 2010s, and how it tunneled inside UDP to escape TCP's ossification.
- **TCP** (Part IV — Transport) — a deeper survey of TCP itself, organised around the chapter format. The mechanism story this episode opens.
- **Ethernet, IPv4, ICMP, BGP** (Part III — Layer 2-3) — the layers TCP rides on top of. BGP in particular is the canonical long-lived TCP control session, which is why TCP-AO exists.
- **HTTP/1.1, HTTP/2, HTTP/3, WebSockets and SSE** (Part VI — Web/API) — the protocols whose evolution drove most of the modern TCP optimisation work. HTTP/2's multiplexing exposed TCP head-of-line blocking; HTTP/3 escapes it via QUIC.
- **The Email Stack, DNS, SSH** (Part IX — Utilities & Security) — the long-tail TCP citizens. Most internet bytes outside the web still travel on these.
- **Recurring Patterns** (Part X) — handshakes, sliding windows, keepalives. TCP is the canonical example for half of them.
- **Failure Modes** (Part X) — bufferbloat, ossification, head-of-line blocking, MTU black holes. TCP shows up in most of them.
- **A History of Congestion Control** (Part X) — Tahoe through BBR through L4S in one sitting. The technical companion to the 1986 chapter.
- **Mitnick vs Shimomura 1994** (Part XI) — the sequence-prediction attack that ended the era of trusting source IPs.
- **SACK Panic 2019** (Part XI) — a single TCP packet, twenty-three-year-old code, instant kernel panic. The case study in continuous fuzzing.
- **L4S Everywhere** and **Post-Quantum TLS** (Part XII — The Modern Frontier) — what is changing about the transport layer in 2024–2026.

## See also (other protocol episodes)

**TCP versus UDP** — TCP guarantees every byte arrives in order at the cost of latency; UDP fires datagrams and lets the application worry. Connection-oriented versus connectionless, 20-byte versus 8-byte header, retransmission and congestion control versus none of either. Use TCP when delivery and ordering matter; use UDP when latency wins and the application can tolerate loss (DNS lookups, NTP, real-time media, anything riding QUIC). The UDP episode pairs naturally with this one.

**TCP versus QUIC** — QUIC is what you get when a team at Google in 2012 looks at TCP plus TLS plus the ossification problem and decides to start over. Reliable, multiplexed, encrypted transport in user space, on UDP, with the TLS 1.3 handshake folded into the transport handshake. One round-trip setup instead of three; zero round-trips on resumption. No head-of-line blocking across streams. Connection migration when your IP changes. The QUIC episode is the through-line for the next decade of transport innovation.

**TCP versus MPTCP** — Multipath TCP is an *extension* of TCP, not a replacement. A single MPTCP socket can ride multiple subflows on different interfaces — Wi-Fi plus cellular, for the canonical Apple Siri use case. Apple shipped it in iOS 7 in 2013; Linux merged the upstream implementation in kernel 5.6 in 2020. Where it works (controlled paths) it works well; where it does not (long-tail public-internet middleboxes), it falls back to plain TCP. The future of multipath transport is multipath QUIC, currently in IETF Last Call.

**TCP versus SCTP** — SCTP is the better TCP that lost the deployment war. Multi-streaming, multi-homing, message-oriented — every architectural choice TCP got wrong, fixed. SCTP cannot traverse the public internet because middleboxes drop unknown protocol numbers. The lesson SCTP teaches is the lesson QUIC applied: tunnel inside UDP. SCTP survives where it is end-to-end controllable — telecom signalling (SIGTRAN, Diameter) and WebRTC data channels.

**TCP plus TLS** — TLS encrypts the byte stream that TCP reliably delivers. TCP first establishes its three-way handshake; TLS then performs its own handshake on top, negotiating cipher suites and exchanging keys. Once both handshakes complete, all application data flows through TLS encryption over the TCP stream. Together they are the secure transport foundation for HTTPS and most encrypted internet traffic. The double handshake — one for TCP, one for TLS — is exactly what QUIC was designed to collapse.

**TCP plus HTTP** — HTTP/1.1 sends plaintext requests and responses over a TCP connection, one at a time. HTTP/2 multiplexes many request-response streams over a single TCP connection — gaining efficiency but inheriting TCP's head-of-line blocking when packets are lost. WebSocket upgrades an HTTP connection into a bidirectional message stream over the same TCP socket. The web's three-decade history is the history of layering more sophisticated semantics on top of TCP and eventually moving off it.

**TCP plus BGP** — BGP runs over TCP port 179 between routers in different autonomous systems. TCP's reliable, ordered delivery is what guarantees that route announcements never arrive corrupted or out of order. The reason TCP-AO and (before it) TCP-MD5 exist is to authenticate these long-lived sessions against off-path attackers — a lost route announcement could create routing loops or black holes in the global internet.

**TCP plus IPsec** — IPsec usually runs over IP directly (ESP / AH), but its IKE control channel rides on UDP, and many real-world VPN deployments tunnel TCP through IPsec for the encrypted payload. The episode on IPsec spends time on this layering — how a TCP segment ends up inside an ESP-encrypted IP packet inside another IP packet across the public internet.

## Sources

**Specifications**

- [RFC 9293 — Transmission Control Protocol (TCP)](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681)
- [RFC 9438 — CUBIC for Fast and Long-Distance Networks](https://www.rfc-editor.org/rfc/rfc9438.html)
- [RFC 8985 — RACK-TLP Loss Detection](https://datatracker.ietf.org/doc/rfc8985/)
- [RFC 7323 — TCP Window Scale, Timestamps, PAWS](https://datatracker.ietf.org/doc/html/rfc7323)
- [RFC 7413 — TCP Fast Open](https://www.rfc-editor.org/rfc/rfc7413)
- [RFC 6928 — Initial cwnd of 10](https://datatracker.ietf.org/doc/html/rfc6928)
- [RFC 6298 — Computing TCP's Retransmission Timer](https://www.rfc-editor.org/rfc/rfc6298.html)
- [RFC 8684 — Multipath TCP v1](https://datatracker.ietf.org/doc/html/rfc8684.html)
- [RFC 9330 — L4S Architecture](https://datatracker.ietf.org/doc/rfc9330/)
- [RFC 4821 — PLPMTUD](https://datatracker.ietf.org/doc/html/rfc4821)
- [draft-ietf-ccwg-bbr — BBRv3](https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/)
- [draft-ietf-tcpm-accurate-ecn — AccECN](https://datatracker.ietf.org/doc/draft-ietf-tcpm-accurate-ecn/)

**Papers**

- [Cerf & Kahn — A Protocol for Packet Network Intercommunication (1974)](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)
- [Jacobson — Congestion Avoidance and Control (SIGCOMM '88)](https://ee.lbl.gov/papers/congavoid.pdf)
- [Cardwell et al. — BBR: Congestion-Based Congestion Control (CACM 2017)](https://queue.acm.org/detail.cfm?id=3022184)

**Engineering blogs**

- [Cloudflare — Linux socket balancing](https://blog.cloudflare.com/the-sad-state-of-linux-socket-balancing/)
- [Google Cloud — TCP BBR comes to GCP](https://cloud.google.com/blog/products/networking/tcp-bbr-congestion-control-comes-to-gcp-your-internet-just-got-faster)
- [Netflix on FreeBSD — 400 Gb/s case study](https://freebsdfoundation.org/end-user-stories/netflix-case-study/)
- [Meta — Bringing QUIC to billions](https://engineering.fb.com/2020/10/21/networking-traffic/how-facebook-is-bringing-quic-to-billions/)
- [Phoronix — Linux 6.15 io_uring zero-copy receive](https://www.phoronix.com/news/Linux-6.15-IO_uring)
- [LWN — TCP-AO landing in Linux 6.7](https://lwn.net/Articles/940178/)

**News and references**

- [RCR Wireless — Comcast launches L4S in production](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Netflix Security Bulletin — TCP SACK PANIC](https://github.com/Netflix/security-bulletins/blob/master/advisories/third-party/2019-001.md)
- [DJB — SYN cookies](https://cr.yp.to/syncookies.html)
- [Wikipedia — Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)
