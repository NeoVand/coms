---
id: transport
type: category
name: Transport
description: The foundation of network communication. These protocols handle how raw data moves reliably (or quickly) between two points on a network.
podcast_target_minutes: 28
protocols: [tcp, udp, quic, sctp, mptcp]
related_pioneers: [vint-cerf, bob-kahn, jon-postel, david-clark, van-jacobson, jim-roskind]
related_book_chapters:
  - story-of-the-internet/before-the-internet
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-1986-collapse
  - story-of-the-internet/osi-vs-tcp-ip
  - story-of-the-internet/mobile-and-bufferbloat
  - story-of-the-internet/the-quic-redesign
  - transport/tcp
  - transport/udp
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - famous-outages/sack-panic-2019
  - frontier/post-quantum
  - frontier/l4s-everywhere
  - frontier/ultra-ethernet
related_outages: [sack-panic-2019]
related_frontier: [post-quantum, l4s-everywhere, ultra-ethernet]
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/ARPANET_first_router.jpg/500px-ARPANET_first_router.jpg"
    caption: "The Interface Message Processor at UCLA, 1969 — the refrigerator-sized Honeywell minicomputer that processed the first ARPANET message, nearly two months before the famous LO transmission to SRI."
    credit: "Photo: Steve Jurvetson / CC BY 2.0, via Wikimedia Commons"
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/500px-Arpanet_logical_map%2C_march_1977.png"
    caption: "The ARPANET logical map, March 1977 — the network that would become the internet. Within six years it would cut over wholesale from NCP to TCP/IP on Flag Day, January 1 1983."
    credit: "ARPANET / Public Domain, via Wikimedia Commons"
visual_cues:
  - "A four-layer stack drawn as a column. Link layer at the bottom in grey — Ethernet, Wi-Fi, fibre. Network layer in blue — IP. Transport layer split into two boxes: TCP labelled reliable and ordered, UDP labelled fast and minimal. Application layer at the top with HTTP, SSH, DNS, RTP. Arrows showing TCP carrying HTTP and SSH, UDP carrying DNS and RTP."
  - "A side-by-side wire diagram. On the left, a TCP plus TLS handshake — three packets to set up TCP, then four more for TLS, totalling two round trips before any data flows. On the right, a QUIC 1-RTT handshake — one round trip, encryption included, then data. A 0-RTT resumption shown underneath as zero round trips."
  - "A congestion window growth chart. X axis time, Y axis cwnd. Four curves: Tahoe, a sawtooth that crashes to one on every loss. Reno, a sawtooth that halves on every loss. CUBIC, a smooth curve that probes high then plateaus near the previous peak. BBR, a flat line that tracks measured bottleneck bandwidth without waiting for loss."
  - "A timeline running 1973 to 2026 with eight pins. 1973 Cerf and Kahn whiteboard sketch. 1980 RFC 768 UDP. 1981 RFC 793 TCP. 1983 ARPANET Flag Day. 1986 the LBNL to UC Berkeley collapse from 32 kbps to 40 bps. 1988 Jacobson and Karels ship the fix. 2021 RFC 9000 QUIC. 2022 RFC 9293 the consolidated TCP."
  - "A diagram of middlebox ossification. Top half labelled traditional TCP — application, TCP, then a middlebox icon inspecting the headers and refusing anything new. Bottom half labelled the QUIC approach — application, QUIC encrypted, UDP wrapper, then the middlebox waving the UDP packet through because it cannot read inside."
  - "A bufferbloat illustration. A long blue queue inside a home router, packets stacked like cars in a traffic jam. A latency dial on the right reading 1000 ms in red. A caption reading 32 kbps to 40 bps, October 1986, three IMP hops, 400 yards apart."
  - "The whole transport family at one glance. Five circles labelled TCP, UDP, QUIC, SCTP, MPTCP, sized roughly by share of internet traffic — TCP and QUIC large, UDP medium, MPTCP small, SCTP tiny. Arrows from MPTCP and QUIC pointing back to TCP and UDP showing what they extend or replace."
---

# Transport

## In one breath

Transport is layer four — the layer that turns the unreliable, packet-switched internet into something applications can actually use. Five protocols sit here: TCP, UDP, SCTP, MPTCP, and QUIC. Together they carry virtually every byte that crosses the public internet, and the choices their designers made in the 1970s and 1980s still shape how every email, web page, and video call moves across the wire today.

## The pitch

In October 1986, the link between Lawrence Berkeley Lab and UC Berkeley — three hops, four hundred yards apart — slowed from thirty-two kilobits per second to forty bits per second. A factor of nearly a thousand. Email started taking days. Bob Metcalfe, the inventor of Ethernet, publicly predicted the internet's death. Two engineers in a Berkeley coffee house, Van Jacobson and Mike Karels, asked the right question — not why the internet was broken, but how it had ever worked in the first place. The fix they wrote took six months and fits in eight pages. We've been running it, in some form, on every connection of every device, for almost forty years. This episode is about the layer between the chaos of packets and the order of applications. The most boring, most consequential layer of computing nobody has ever heard of.

## The arc

### The Need for Reliable Transport

The year was 1973, and the ARPANET had a problem. The network worked — mostly — but its underlying protocol, the Network Control Program, was welded to the ARPANET hardware. Every node had to be an ARPANET node. There was no way to bridge to a satellite network, a packet radio network, or anything that hadn't been invented yet.

Vint Cerf and Bob Kahn saw what others didn't. The real challenge wasn't building one network, it was connecting all of them. They needed a protocol that made no assumptions about the underlying network — one that could ride on top of anything. Their 1974 paper, "A Protocol for Packet Network Intercommunication," published in the IEEE Transactions on Communications, introduced a single protocol they called TCP that did everything: addressing, routing hints, sequencing, flow control, and reliability across heterogeneous packet networks. The architectural genius was the gateway between networks, hiding link-layer differences from the endpoints. There's a separate episode on Vint Cerf and another on Bob Kahn that goes deep on this period.

### The Great Split

The original TCP was a monolith. It handled routing, reliability, and ordering all in one protocol. But Danny Cohen made a compelling case at ISI: real-time voice traffic couldn't tolerate TCP's insistence on retransmitting every lost packet. A dropped voice sample is gone — by the time a retransmission arrives, the conversation has moved on. Cohen also coined the terms big-endian and little-endian for byte ordering, which is its own story.

Between 1977 and 1978, repeated implementation work at BBN, Stanford, ISI, and Peter Kirstein's group at University College London made the case unavoidable. Jon Postel and David Reed argued for splitting Cerf and Kahn's monolithic TCP into two layers: a thin internetworking layer called IP, and an end-to-end transport layer above it. Reed went further and proposed a no-frills datagram transport — what became UDP. Version four of the split design was finalised in 1978. That's the IPv4 and TCP we still run today.

The base specs landed shortly after. RFC 768 — UDP, by Jon Postel, dated 28 August 1980. Three pages. The most spartan, durable spec in networking. RFC 793 — TCP, also Postel, September 1981. Forty-one years later, in August 2022, RFC 9293 finally consolidated four decades of TCP errata into one document — Wesley Eddy is the editor credited with pulling it all together.

The separation was a stroke of genius. New transport protocols could be built on top of IP without changing a single router. TCP became the workhorse of the internet, carrying SSH, FTP, SMTP, and HTTP. UDP became the foundation for real-time applications where speed matters more than perfection. And the door was left open for protocols yet to come. Postel also articulated the robustness principle in RFC 793 — be conservative in what you send, be liberal in what you accept — which shaped how the entire internet handles interoperability. The chapter on the OSI versus TCP/IP war goes deeper into why the split design beat the seven-layer ISO model.

### Flag Day

On 1 January 1983, the ARPANET cut over from NCP to TCP/IP on a single coordinated date, after a March 1982 DoD decision and months of pre-cuts. Roughly four hundred hosts had to convert. Non-converters were disconnected. Modern internet folklore still uses "flag day" to mean any change you cannot do incrementally — a reminder that we will never coordinate one again. The chapter on the 1981 burst covers this transition in detail.

### The 1986 Congestion Collapse

October 1986. The link between Lawrence Berkeley Lab and UC Berkeley — three IMP hops, four hundred yards apart — collapsed from thirty-two kilobits per second to forty bits per second. Throughput dropped by a factor of eight hundred. Early BSD TCP, written by people who had never seen a congested network, retransmitted aggressively when packets were dropped, which generated more drops. Multiple subsequent collapses followed. Bob Metcalfe predicted the internet's imminent death.

Van Jacobson and Mike Karels published the fix in 1988 — "Congestion Avoidance and Control," SIGCOMM '88, pages 314 to 329. Six new algorithms in one paper: slow start, additive-increase multiplicative-decrease, exponential backoff of the retransmission timer with Karn's algorithm, fast retransmit, and fast recovery, all anchored on the conservation-of-packets principle. The fix shipped in 4.3BSD-Tahoe. Within a year, every TCP implementation on Earth had adopted it. The internet did not collapse again. By some counts it is the most-cited networking publication of all time. There's a separate episode on Van Jacobson, and the chapter on the 1986 collapse tells the full story.

### The Modern Innovators

Three more transport protocols followed. SCTP was published as RFC 2960 in October 2000 — Randall Stewart and colleagues at Cisco designed it to carry SS7 telephony signalling over IP for VoIP cores, with multi-streaming, multi-homing, and a four-way cookie handshake immune to SYN floods. It was refreshed as RFC 9260 in June 2022.

MPTCP shipped Multipath TCP version zero in RFC 6824 in January 2013. Apple deployed it in iOS 7 that September for Siri — its first major real-world adoption. Version one became RFC 8684 in March 2020, and the production-shape implementation landed upstream in Linux kernel 5.6 the same month.

QUIC was Jim Roskind's project at Google, started around 2012, deployed in Chrome from 2013 onwards under the name gQUIC. The IETF rebuilt it from scratch and shipped RFC 9000 on 27 May 2021. Jana Iyengar and Martin Thomson edited the spec, with Jana leading the standardisation effort that turned a Google experiment into an internet standard. There's a separate episode on Jim Roskind, and the chapter on the QUIC redesign covers the whole arc.

### The Ossification Problem

Why didn't we just improve TCP? The answer is ossification — one of the most frustrating phenomena in networked systems.

Over decades, an entire ecosystem of middleboxes grew up around TCP: firewalls that inspect TCP headers, NATs that rewrite port numbers, load balancers that track connection state, intrusion detection systems that parse TCP options. These devices learned the exact byte layout of TCP segments and made assumptions. Any change to TCP's wire format — even one permitted by the specification — risked being silently dropped or mangled by some middlebox along the path. TCP Fast Open, RFC 7413, hit roughly five percent middlebox failure on the public internet.

MPTCP tried a different approach, extending TCP itself to use multiple paths simultaneously. But its reliance on TCP options meant middleboxes could still interfere.

QUIC solved the ossification problem radically. Instead of changing TCP, it built an entirely new transport on top of UDP, which middleboxes pass through without inspection. Then QUIC went a step further: it encrypts nearly everything, including its own transport headers. Middleboxes can't interfere with what they can't read. RFC 9369, the QUIC v2 spec from May 2023, is identical to v1 except for a few constants — explicitly a grease document, designed to keep the QUIC version field from ossifying in the first place. Transport evolution through camouflage, hiding innovation inside a packet format the existing infrastructure already knows how to ignore.

### The Numbers

TCP and UDP together carry virtually one hundred percent of internet traffic. As of 2024, QUIC — which runs over UDP — carries over thirty percent of global web traffic, primarily through Google services and Cloudflare. Cloudflare Radar reports HTTP/3 at around twenty-one percent of HTTPS requests in 2025; industry analyses citing Cisco data put close to half of consumer internet bytes in Europe, the US, LatAm, and AsiaPac on QUIC, because Meta and Google services dominate volume and are nearly one hundred percent QUIC. The transport layer is the most fundamental, and least visible, part of the internet.

## The people

### Vint Cerf

Co-inventor of TCP/IP, born 1943, working at Stanford and DARPA in the foundational years. He designed the TCP/IP protocol suite alongside Bob Kahn and co-authored the 1974 paper "A Protocol for Packet Network Intercommunication" that defined how heterogeneous networks could exchange data reliably. There's a separate episode on him.

### Bob Kahn

Co-inventor of TCP/IP, born 1938, at DARPA. He conceived the idea of open-architecture networking while managing the ARPANET project, then recruited Vint Cerf to collaborate on the protocol design that would become the backbone of the internet. There's a separate episode on him.

### Jon Postel

RFC Editor and protocol architect, 1943 to 1998, at USC's Information Sciences Institute. He wrote the definitive RFC specifications for both TCP — RFC 793 — and UDP — RFC 768 — and served as the RFC Editor for nearly three decades, shaping the standards process that governs the internet. His robustness principle, articulated in RFC 793, became a guiding principle for protocol design. There's a separate episode on him.

### Danny Cohen

Network pioneer, 1937 to 2019, at USC ISI. He advocated for splitting the monolithic TCP into separate transport and network layers, enabling diverse transport protocols to coexist. He also coined the terms big-endian and little-endian for byte ordering. He doesn't have his own episode, but his fingerprints are on every layered transport you've ever used.

### Jim Roskind

QUIC architect at Google, born in the 1960s. He designed QUIC to solve TCP's fundamental limitations for the modern web, introducing zero round-trip-time connection establishment and multiplexed streams without head-of-line blocking. There's a separate episode on him.

### Jana Iyengar

QUIC standardisation lead, at Google and then Fastly. She led the IETF effort that transformed QUIC from a Google experiment into RFC 9000, navigating the complex process of building industry consensus around a new transport protocol.

### Randall Stewart

SCTP architect at Cisco. He designed SCTP to provide reliable multi-stream transport, enabling telephony signalling networks to transition from legacy SS7 to IP-based infrastructure.

### Van Jacobson

Co-author of the 1988 SIGCOMM paper that saved the internet from congestion collapse. With Mike Karels he gave us slow start, AIMD, exponential backoff, fast retransmit, and fast recovery — the algorithms that keep TCP stable to this day. He has been involved in nearly every major congestion-control development since, including BBR. There's a separate episode on him.

### David Clark

Architect of the early internet at MIT, central to the design decisions that produced the layered TCP/IP we still run. He doesn't appear in the founding TCP paper, but he was in the room for the calls that shaped the protocol's philosophy. There's a separate episode on him.

## The protocols (a guided tour)

### TCP — Transmission Control Protocol

TCP guarantees ordered, reliable delivery of data between applications. First spec'd in Cerf and Kahn 1974, formally separated from IP in 1978, published as RFC 793 in September 1981, and consolidated as STD 7 / RFC 9293 in August 2022. Reach for it whenever you need a reliable, in-order, congestion-controlled byte stream and don't care about handshake latency. It's the default for SSH, SMTP, IMAP, the Postgres wire protocol, gRPC over TCP, and almost anything legacy. Still around fifty to eighty percent of bytes on most networks in 2025. The TCP episode walks through the three-way handshake, sequence numbers, windowing, and the full congestion-control story.

### UDP — User Datagram Protocol

UDP is fire-and-forget delivery — fast but with no guarantees. RFC 768, August 1980, three pages. No congestion control, no reliability, no flow control. Reach for it when you'll build your own transport on top — QUIC, WebRTC, gaming — when you need broadcast or multicast — DHCP, mDNS — or when latency matters more than completeness — DNS queries, NTP, voice over IP. The UDP episode covers the spec in five minutes and then gets into why the simplest protocol in networking is also one of the most important.

### QUIC — QUIC

QUIC is a UDP-based transport with built-in encryption and multiplexing — the future of the web. Originally Google's gQUIC from around 2012, the IETF rebuilt it from scratch and shipped RFC 9000 on 27 May 2021, with RFC 9001 for TLS integration and RFC 9002 for loss detection. Multiplexed independent streams with no head-of-line blocking between them, zero and one round-trip-time handshakes, connection migration via connection IDs, and almost the entire wire image authenticated and encrypted. Reach for it for HTTP/3, DNS-over-QUIC (RFC 9250), WebTransport, MoQ, low-RTT mobile experiences, and any case where TCP plus TLS combined handshake costs hurt. The QUIC episode is the deep dive.

### SCTP — Stream Control Transmission Protocol

SCTP is multi-streaming, multi-homing transport — TCP's more capable but less popular cousin. RFC 2960 in October 2000, refreshed as RFC 9260 in June 2022. Connection-oriented, reliable, message-oriented, multi-homed, with multiple ordered or unordered streams in one association, and a four-way handshake with cookie that's immune to SYN floods. Niche on the open internet because of NAT and middlebox hostility — middleboxes block IP protocol number 132 — but ubiquitous in telco SS7-over-IP and as the data-channel transport inside WebRTC, typically tunneled over DTLS over UDP because raw SCTP doesn't traverse the open internet. The SCTP episode covers what it gets right that TCP doesn't.

### MPTCP — Multipath TCP

MPTCP is TCP that uses multiple network paths simultaneously — Wi-Fi and cellular at the same time. Experimental v0 in RFC 6824 in January 2013, standardised as v1 in RFC 8684 in March 2020. Apple shipped it for Siri in iOS 7 in September 2013. Upstreamed into Linux kernel 5.6 in March 2020. Reach for it when you have multiple network interfaces — Wi-Fi plus LTE on a phone, dual ISPs on a customer-premises router, multiple datacenter NICs — and you want either seamless handover or path aggregation while presenting a single TCP socket to the application. The MPTCP episode covers the subflow design and Apple's deployment story.

## Advanced topics (from the deep-dive)

### Congestion control algorithms

Congestion control is the art of sending data as fast as possible without overwhelming the network. TCP's algorithms have evolved dramatically over four decades.

TCP Tahoe in 1988 introduced slow start and congestion avoidance. Start with a small window, double it each round trip during slow start, then switch to linear growth after detecting congestion. On packet loss, reset the window to one — devastating for performance.

TCP Reno in 1990 added fast recovery: on triple duplicate ACKs, halve the window instead of resetting to one. That simple change dramatically improved throughput.

CUBIC, from 2006 and the Linux default since kernel 2.6.19, uses a cubic function for window growth — aggressive probing for bandwidth followed by a gentle approach near the last-known capacity. It's the most widely deployed algorithm today and is now Standards Track as RFC 9438 (2023).

BBR, from Google in 2016, took a fundamentally different approach. Instead of reacting to loss, BBR actively measures the bottleneck bandwidth and minimum round-trip time, then paces packets to match the path's capacity. It performs dramatically better on long-distance, high-bandwidth links. BBRv3 has been the default for google.com and YouTube since 2023, though independent measurements (Zeynali et al., PAM 2024) show it's still unfriendly to CUBIC in many real-world conditions — the public-internet fairness debate is far from settled.

### Flow control and the sliding window

Flow control prevents a fast sender from overwhelming a slow receiver. TCP's sliding window is elegant: the receiver advertises its available buffer space — the receive window — in every ACK. If the receiver's window shrinks to zero, the sender must stop. To avoid deadlock if a window update gets lost, TCP uses persist timers — small probe packets sent periodically to check if the window has reopened.

Window scaling, RFC 7323, extends the sixteen-bit window field beyond sixty-five kilobytes using a scale factor negotiated during the handshake. Without it, high-bandwidth long-distance links would be limited to roughly five megabits per second on a hundred-millisecond round trip.

Nagle's algorithm, RFC 896 from 1984, coalesces small writes into larger segments to reduce overhead. Today it interacts pathologically with delayed ACKs and causes two-hundred-millisecond latency spikes — most interactive applications disable it with TCP_NODELAY.

### The bufferbloat problem

Oversized router buffers — often hundreds of megabytes — let queues grow enormous before any packets are dropped. Congestion-control algorithms that rely on loss as a signal (Tahoe, Reno, CUBIC) don't react until buffers overflow, by which point latency has ballooned from ten milliseconds to a thousand. This is bufferbloat, a term Jim Gettys coined at Bell Labs in 2010 after measuring 1.2-second latencies on home links. It's why your internet feels slow when someone starts a big download. The solutions are Active Queue Management — CoDel, PIE, FQ-CoDel — and algorithms like BBR that measure latency instead of waiting for loss. There's a separate frontier entry on L4S, RFC 9330, 9331, and 9332 (January 2023), which extends ECN signalling into a low-latency, scalable congestion-control regime now shipping in DOCSIS 4.0 cable modems and Apple's iOS 17.

### TCP Fast Open

Standard TCP requires a full round trip for the three-way handshake before any data can flow. TCP Fast Open, RFC 7413, allows data in the SYN packet itself. On the first connection, the server sends a cookie in the SYN-ACK. On subsequent connections, the client includes this cookie and application data in the SYN. The server processes the data immediately, saving one round trip. TFO is widely deployed in Linux, macOS, and iOS, but it faces challenges: middleboxes sometimes strip the TFO option, and idempotency is required because the SYN data might be delivered twice. It's a textbook example of why QUIC moved off TCP entirely.

## Recurring themes

The defining tension of the family is the same one Cerf and Kahn drew on a whiteboard in 1973. How do you build a reliable byte-stream service on top of an unreliable datagram service? And what should you do for the applications that don't actually want a reliable byte stream? Almost every member of the family is a different answer to that question. TCP says: do the reliable thing well and let the slow handshake be the price. UDP says: give applications the bare minimum and let them build what they need on top. SCTP says: messages, not bytes, with multi-homing baked in. MPTCP says: use every path you have. QUIC says: tear it all up, put it in user space, encrypt everything.

The reliability-versus-speed tradeoff shows up everywhere downstream. DNS picks UDP first and falls back to TCP for large responses. Real-time media — RTP, SRT, MoQ — runs on UDP because a retransmission that arrives after the audio frame has played is worse than a missed sample. The web went the other way for thirty years and is now reversing, with HTTP/3 over QUIC carrying close to half of consumer internet bytes.

The other big theme is the ossification trap. Every choice you bake into a protocol's wire format is a choice middleboxes will assume is permanent. The ones who built TCP in 1981 had no way of knowing that, decades later, the firewalls and NATs they enabled would lock the protocol into amber. QUIC's response — ride on UDP, encrypt the headers, periodically grease the version field to keep the parsers honest — is a design philosophy as much as a protocol. Watch for it in every modern protocol you read.

And finally: the algorithmic genius of one or two people, deployed on a global scale, can save or sink the internet. Jacobson and Karels in 1988. Roskind and Iyengar a generation later. The transport layer is small, the people who shape it are few, and the leverage they have over how the network feels is enormous.

## Where this connects in the book

- The chapter on what came before the internet sets up why the ARPANET needed transport at all.
- The chapter on the 1981 burst covers Flag Day and the cutover from NCP to TCP/IP.
- The chapter on the 1986 collapse tells the full story of congestion collapse and the Jacobson-Karels rescue.
- The chapter on OSI versus TCP/IP explains why the layered TCP/IP design beat the seven-layer ISO model.
- The chapter on mobile and bufferbloat connects MPTCP, CoDel, and the move to QUIC.
- The chapter on the QUIC redesign covers Roskind's project, the IETF rebuild, and HTTP/3.
- The TCP, UDP, SCTP, MPTCP, and QUIC chapters each go deep on one protocol.
- The SACK Panic 2019 outage entry shows how a kernel-level transport bug can take down millions of Linux servers at once.

## See also (other category episodes)

The Network Foundations episode is the layer below this one — IP, Ethernet, BGP, ARP. Transport assumes that layer is delivering best-effort packets between hosts; everything we discuss here is about what to do once those packets arrive (or don't).

The Web/API episode is the layer above. HTTP/1.1 and HTTP/2 ride on TCP plus TLS. HTTP/3 rides on QUIC. gRPC defaults to HTTP/2 today and is shipping over HTTP/3 in 2025. WebSocket is TCP-only; WebTransport is its QUIC successor. Almost every choice in that episode is constrained by what the transport layer makes possible.

The Real-time A/V episode is the high-level cousin. RTP, SRT, and the new MoQ protocol all sit on top of UDP for the same reason DNS and NTP do — they need timeliness more than completeness. WebRTC's data channels use SCTP tunnelled over DTLS over UDP, which is one of the strangest stack diagrams in modern networking and is covered there.

## Visual cues for image generation

- A four-layer stack drawn as a column. Link layer at the bottom in grey — Ethernet, Wi-Fi, fibre. Network layer in blue — IP. Transport layer split into two boxes: TCP labelled reliable and ordered, UDP labelled fast and minimal. Application layer at the top with HTTP, SSH, DNS, RTP. Arrows showing TCP carrying HTTP and SSH, UDP carrying DNS and RTP.
- A side-by-side wire diagram. On the left, a TCP plus TLS handshake — three packets to set up TCP, then four more for TLS, totalling two round trips before any data flows. On the right, a QUIC 1-RTT handshake — one round trip, encryption included, then data. A 0-RTT resumption shown underneath as zero round trips.
- A congestion window growth chart. X axis time, Y axis cwnd. Four curves: Tahoe, a sawtooth that crashes to one on every loss. Reno, a sawtooth that halves on every loss. CUBIC, a smooth curve that probes high then plateaus near the previous peak. BBR, a flat line that tracks measured bottleneck bandwidth without waiting for loss.
- A timeline running 1973 to 2026 with eight pins. 1973 Cerf and Kahn whiteboard sketch. 1980 RFC 768 UDP. 1981 RFC 793 TCP. 1983 ARPANET Flag Day. 1986 the LBNL to UC Berkeley collapse from 32 kbps to 40 bps. 1988 Jacobson and Karels ship the fix. 2021 RFC 9000 QUIC. 2022 RFC 9293 the consolidated TCP.
- A diagram of middlebox ossification. Top half labelled traditional TCP — application, TCP, then a middlebox icon inspecting the headers and refusing anything new. Bottom half labelled the QUIC approach — application, QUIC encrypted, UDP wrapper, then the middlebox waving the UDP packet through because it cannot read inside.
- A bufferbloat illustration. A long blue queue inside a home router, packets stacked like cars in a traffic jam. A latency dial on the right reading 1000 ms in red. A caption reading bufferbloat — the reason your internet feels slow when someone starts a big download.
- The whole transport family at one glance. Five circles labelled TCP, UDP, QUIC, SCTP, MPTCP, sized roughly by share of internet traffic — TCP and QUIC large, UDP medium, MPTCP small, SCTP tiny. Arrows from MPTCP and QUIC pointing back to TCP and UDP showing what they extend or replace.

## Sources

### RFCs

- [RFC 768 — UDP](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 793 / RFC 9293 — TCP](https://datatracker.ietf.org/doc/html/rfc9293)
- [RFC 9260 — SCTP](https://datatracker.ietf.org/doc/html/rfc9260)
- [RFC 8684 — MPTCP v1](https://datatracker.ietf.org/doc/html/rfc8684)
- [RFC 4340 — DCCP](https://datatracker.ietf.org/doc/html/rfc4340)
- [RFC 9000 — QUIC](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC 9221 — QUIC unreliable datagrams](https://datatracker.ietf.org/doc/rfc9221/)
- [RFC 9369 — QUIC v2](https://datatracker.ietf.org/doc/rfc9369/)
- [RFC 8985 — RACK-TLP](https://datatracker.ietf.org/doc/rfc8985/)
- [RFC 9330 — L4S architecture](https://datatracker.ietf.org/doc/rfc9330/)
- [RFC 9331 — L4S ECN](https://datatracker.ietf.org/doc/rfc9331/)
- [RFC 8899 — PLPMTUD](https://www.rfc-editor.org/info/rfc8899)
- [draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [QUIC working group index](https://quicwg.org/)

### Papers

- [Cerf and Kahn, A Protocol for Packet Network Intercommunication, 1974](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)
- [Jacobson and Karels, Congestion Avoidance and Control, SIGCOMM 88](https://ee.lbl.gov/papers/congavoid.pdf)
- [Jacobson congestion paper, CS162 mirror](https://cs162.org/static/readings/jacobson-congestion.pdf)
- [Montazeri et al., Homa, SIGCOMM 2018](https://arxiv.org/abs/1803.09615)
- [Ousterhout, It's Time to Replace TCP in the Datacenter, 2022](https://arxiv.org/pdf/2210.00714)
- [Hoefler et al., Ultra Ethernet's Design Principles, 2025](https://arxiv.org/html/2508.08906v1)
- [RoCEv2 design background](https://arxiv.org/pdf/1806.08159)
- [Zeynali et al., Promises and Potential of BBRv3, PAM 2024](https://inet-bbrv3eval.mpi-inf.mpg.de/)
- [Multipath QUIC project](https://multipath-quic.org/)
- [ACM Digital Library — transport survey](https://dl.acm.org/doi/10.1145/3673422.3674889)

### Vendor / engineering blogs

- [Cloudflare — The Road to QUIC](https://blog.cloudflare.com/the-road-to-quic/)
- [Cloudflare — MoQ](https://blog.cloudflare.com/moq/)
- [Cloudflare — Post-quantum 2025](https://blog.cloudflare.com/pq-2025/)
- [Cloudflare — Radar Year in Review 2025](https://blog.cloudflare.com/radar-2025-year-in-review/)
- [Cloudflare — Unlocking QUIC proxying potential (MASQUE)](https://blog.cloudflare.com/unlocking-quic-proxying-potential/)
- [Cloudflare — Route leak January 22 2026](https://blog.cloudflare.com/route-leak-incident-january-22-2026/)
- [Cloudflare developers — MoQ](https://developers.cloudflare.com/moq/)
- [Daniel Stenberg — QUIC is RFC 9000](https://daniel.haxx.se/blog/2021/05/27/quic-is-rfc-9000/)
- [Fastly — Future-proofing TLS against quantum threats](https://www.fastly.com/blog/future-proofing-tls-encryption-against-quantum-threats)
- [Google — BBR on GitHub](https://github.com/google/bbr)
- [Google Cloud — RDMA RoCEv2 for AI workloads](https://cloud.google.com/blog/products/networking/rdma-rocev2-for-ai-workloads-on-google-cloud)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [Multipath TCP project](https://www.multipath-tcp.org/)
- [Phoronix — Linux 5.6 starts Multipath TCP](https://www.phoronix.com/news/Linux-5.6-Starts-Multipath-TCP)
- [Eunomia — eBPF ecosystem progress 2024 to 2025](https://eunomia.dev/blog/2025/02/12/ebpf-ecosystem-progress-in-20242025-a-technical-deep-dive/)
- [Apple support — MPTCP usage](https://support.apple.com/en-us/101905)
- [STORDIS — Ultra Ethernet Consortium](https://stordis.com/ultra-ethernet-consortium/)
- [Ultra Ethernet Consortium — UEC 2025 in review](https://ultraethernet.org/uec-2025-in-review-preparing-for-what-comes-next-a-letter-from-uecs-chair/)
- [Ultra Ethernet Consortium](https://ultraethernet.org/)
- [NVIDIA — RoCE documentation](https://docs.nvidia.com/networking/display/MLNXOFEDv23070512/RDMA+over+Converged+Ethernet+(RoCE))
- [APNIC labs — Geoff Huston measurement](https://labs.apnic.net/)
- [Cloudflare Radar 2025](https://radar.cloudflare.com/year-in-review/2025)
- [AWS message — S3 outage 28 February 2017](https://aws.amazon.com/message/41926/)
- [ES.net — Unjamming the information superhighway](https://www.es.net/about/esnet-history/unjamming-the-information-superhighway-and-saving-the-internet/)
- [systemsapproach — How congestion control saved the internet](https://systemsapproach.substack.com/p/how-congestion-control-saved-the)
- [Internet Society — Final report on TCP/IP migration in 1983](https://www.internetsociety.org/blog/2016/09/final-report-on-tcpip-migration-in-1983/)
- [TCP Congestion Control: A Systems Approach](https://tcpcc.systemsapproach.org)
- [HPBN companion site](https://hpbn.co/)
- [HTTP/3 Explained](https://http3-explained.haxx.se/)
- [W3C WebTransport](https://www.w3.org/TR/webtransport/)
- [Bufferbloat technical intro](https://www.bufferbloat.net/projects/bloat/wiki/TechnicalIntro/)
- [GIAC — SYN cookies exploration](https://www.giac.org/paper/gsec/2013/syn-cookies-exploration/103486)
- [Qrator — Evolution of DDoS attacks](https://blog.qrator.net/en/the-evolution-of-ddos-attacks-a-journey-from-1994_192/)
- [ACM Queue — Bufferbloat (Gettys)](https://queue.acm.org/detail.cfm?id=2071893)
- [ACM Queue — Bufferbloat follow-up](https://queue.acm.org/detail.cfm?id=2076798)

### News

- [NPR — Amazon and the 150 million dollar typo](https://www.npr.org/sections/thetwo-way/2017/03/03/518322734/amazon-and-the-150-million-typo)
- [TechCrunch — AWS cloudsplains the S3 outage](https://techcrunch.com/2017/03/02/aws-cloudsplains-what-happend-to-s3-storage-on-monday/)
- [Gremlin — The 2017 Amazon S3 outage](https://www.gremlin.com/blog/the-2017-amazon-s-3-outage)
- [Time — Panix attack archive](https://time.com/archive/6729702/panix-attack/)
- [Tom's Hardware — Ultra Ethernet detailed](https://www.tomshardware.com/networking/ultra-ethernet-the-data-center-interconnection-of-tomorrow-detailed)
- [HPCwire — Ultra Ethernet has arrived](https://www.hpcwire.com/2025/09/09/ultra-ethernet-has-arrived-one-network-to-rule-them-all/)
- [Intelligent Living — Quantum hybrid TLS ML-KEM browser](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)
- [Sage Journals — consumer internet QUIC share](https://journals.sagepub.com/doi/10.1177/14614448251336438)

### Wikipedia

- [ARPANET](https://en.wikipedia.org/wiki/ARPANET)
- [Flag day (computing)](https://en.wikipedia.org/wiki/Flag_day_(computing))
- [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP)
- [Network congestion](https://en.wikipedia.org/wiki/Network_congestion)
- [QUIC](https://en.wikipedia.org/wiki/QUIC)
- [RDMA over Converged Ethernet](https://en.wikipedia.org/wiki/RDMA_over_Converged_Ethernet)
- [History of Information — Cerf and Kahn 1974](https://historyofinformation.com/detail.php?id=915)
