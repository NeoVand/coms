---
id: tcp
type: chapter
part_id: transport
part_label: IV
part_title: Transport
title: TCP
synopsis: Reliable byte streams, four decades of congestion control.
podcast_target_minutes: 15
position_in_book: 25 of 75
listening_order:
  prev: layer-2-3/bgp
  next: transport/udp
related_protocols: [tcp, ssh, http1, http2, tls, quic, grpc, ip, bgp]
related_pioneers: [van-jacobson]
related_outages: [nsfnet-1986-collapse, sack-panic-2019]
related_frontier: [l4s-comcast-launch, bbrv3-default]
related_rfcs: [793, 9293, 1948, 4987, 9438, 9000, 5681]
images:
  - src: ""
    caption: "The first page of Jacobson and Karels — Congestion Avoidance and Control, SIGCOMM '88."
    credit: "ACM SIGCOMM"
visual_cues:
  - "A throughput chart of the LBL-to-UC-Berkeley link in October 1986. The line drops vertically from 32 kbps to 40 bps. Annotated: three IMP hops, less than 400 yards of physical distance, a 1000x degradation."
  - "RFC 793 cover page next to RFC 9293 cover page. Forty-one years between them. Thirteen errata documents stacked between."
  - "A timeline of TCP congestion control: Tahoe (1988), Reno, NewReno, Vegas, CUBIC (RFC 9438, 2023), Compound, BBRv1 (2016), BBRv2, BBRv3 (default 2023), L4S Prague (Comcast launch January 2025)."
  - "A side-by-side throughput chart for Linux 6.15: epoll receive at ~74 Gb/s versus io_uring zcrx at ~106 Gb/s on a single TCP flow. A 40 percent jump for free."
  - "A single TCP packet with a tiny MSS, captioned: SACK Panic, June 17 2019. One packet, no authentication, kernels 2.6.29 through 5.1, ten years of unpatched code."
---

# Part IV, Chapter — TCP

## The hook

RFC 793, the original TCP specification, was the canonical TCP standard for forty-one years. Almost certainly the longest unmodified IETF spec ever published. RFC 9293 finally consolidated thirteen errata documents into a single replacement in August 2022. The wire format that two endpoints used to talk to each other in 1985 still works today. That kind of stability does not happen by accident. This is the chapter on the protocol that turns the internet's best-effort fabric into something a database can actually trust, and on the four decades of congestion control work that kept it from melting under its own weight.

## The story

### Reliability as a Service

TCP is the protocol that turns the internet's best-effort datagram fabric into something a database, a web browser, or an SSH session can actually use. It opens a connection between two endpoints, numbers every byte so receivers can detect missing data, acknowledges what arrives, retransmits what does not, and paces the sender so it never floods the network. How the three-way handshake actually works, and how the sliding window flow control fits together with the retransmission machinery — that's the TCP protocol episode. This chapter is about the story.

Forty-five years after RFC 793 in September 1981, TCP is still the workhorse. Over half of all internet traffic. Most banking, file transfer, email, database protocols. Roughly fifty-one percent of HTTP traffic still rides over HTTP/1.1 or HTTP/2, and both of those run on TCP. The wire format is one of the great quiet achievements of computing. A TCP segment captured in 1985 and a TCP segment captured today differ only in the values of the optional fields. The header layout has not moved.

### Three Costs You Pay for Reliability

The cost of TCP's reliability is captured by three numbers.

The handshake adds a round-trip before any data flows. SYN, SYN-ACK, ACK is one full round-trip-time of delay between client and server before the first byte of payload is allowed to move. On a transcontinental link with a hundred milliseconds of round-trip-time, that's a hundred milliseconds of latency built into every new connection. TLS 1.2 added another one to two round trips for crypto setup; TLS 1.3 cut that to one. The accumulated round trips are the entire reason QUIC folded the crypto setup into the transport handshake. The mechanism story for that — one round trip for new connections, zero round trips for repeats — is the QUIC episode.

Head-of-line blocking stalls every byte behind a single lost segment. Multiplexed application protocols feel this most acutely. HTTP/2 and gRPC over HTTP/2 share one TCP connection across many logical streams, so one dropped TCP packet stalls all of them until the retransmission arrives. Unmultiplexed protocols like HTTP/1.1 or an SSH terminal session feel it less because there is only one logical stream to stall in the first place. The HTTP/2 episode and the QUIC episode both pick up this thread; QUIC moves stream ordering above the loss-detection layer specifically to escape it.

Congestion control cuts your sending rate the moment a packet is lost, even if the loss was unrelated to congestion. On wireless networks, packets drop from radio interference rather than queue overflow, and classic TCP overreacts. That's the entire reason BBR, from Google in 2016, modelled the network instead of inferring from loss. And it's the reason L4S, in 2023, replaced loss with explicit ECN marking for cooperating flows.

Three pre-existing security incidents from the 1990s are worth flagging because their lessons are baked into modern stacks. TCP sequence-prediction, exploited by Kevin Mitnick in 1994, abused predictable initial sequence numbers from BSD's linear ISN counter. RFC 1948 in 1996 replaced it with a cryptographically hashed function of the four-tuple. SYN floods in the mid-1990s exhausted server connection tables before D.J. Bernstein's SYN cookies — written up in RFC 4987 — made the SYN response stateless. Smurf attacks in 1997 abused IP broadcast to amplify TCP RST floods. Modern stacks defeat all three; the design lessons live in RFC 9293's security considerations section.

### Congestion Control: Tahoe Through BBR Through L4S

The single most important change in TCP's history is the 1988 congestion avoidance work by Van Jacobson and Mike Karels. Slow start, AIMD, fast retransmit, exponential backoff. Six algorithms in one paper. They prevented the 1986 collapse from ever repeating. There is a Van Jacobson episode that picks up his story in full — and the 1986 NSFNET collapse has its own entry in the Famous Outages part of the book, which we'll come back to in a minute.

Since 1988, the single most important change has been CUBIC — RFC 9438, the default in Linux, Windows and Apple stacks since the late 2000s — and BBR from Google in 2016, now BBRv3, the default for google.com and YouTube traffic since 2023.

The story of TCP, more than any other transport, is the story of congestion control. Everything else — flow control, error recovery, connection state — settled by 1988. The active research has moved through Reno, NewReno, Vegas, CUBIC, Compound, BBR v1 and v2 and v3, and now L4S with TCP Prague. Each generation refined the inference about network state from increasingly sparse signals.

The most recent paradigm shift: L4S replaces loss-as-signal with explicit ECN marking. Cooperating senders mark packets ECT(1). Routers put them in a separate isolated queue and mark Congestion Experienced early, before the queue grows. The result is sub-millisecond queuing latency at full link utilisation. Comcast launched L4S in production in late January 2025, in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville, and San Francisco, with Apple, NVIDIA GeForce NOW, Meta and Valve as launch partners. Apple iOS 17 and macOS Sonoma defaulted L4S support for QUIC. The L4S launch entry on the Frontier page has the full account.

### What Shipped in 2024-2026

Linux 6.7, January 2024, merged native TCP-AO. Five thousand lines of new networking code, finally giving Linux a modern replacement for the deprecated TCP-MD5 used by BGP and LDP. The same release added microsecond-resolution TCP timestamps.

AccECN — `draft-ietf-tcpm-accurate-ecn-34` from March 2025 — is on the Standards Track path. It reallocates the old ECN-Nonce bit to deliver more than one congestion signal per round-trip-time. That is the precondition L4S over TCP needs for fine-grained congestion response.

Linux 6.15, mid-2025, landed io_uring zero-copy receive — `io_uring zcrx` — integrated with the kernel TCP stack. Single-flow throughput jumped from roughly seventy-four gigabits per second on epoll to roughly one hundred and six gigabits per second on io_uring zcrx. A forty percent throughput improvement for high-bandwidth servers without any application changes.

The vulnerability surface keeps producing CVEs. CVE-2019-11477, the SACK Panic, was the canonical case. A single TCP packet, no authentication, would crash any vulnerable Linux host across kernels 2.6.29 through 5.1 — ten years of unpatched code in the heart of every Linux server. Netflix's Jonathan Looney found it. The full account is in the SACK Panic entry in the Famous Outages part of the book. Modern kernel networking is now fuzzed continuously by syzkaller, and most TCP CVEs since 2020 have been found by fuzzing rather than by humans.

## The figures

### Van Jacobson

Born 1950. Lawrence Berkeley Lab, then Cisco, then PARC, then Google. The man who saved the internet from congestion collapse. After the October 1986 collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley dropped from thirty-two kilobits per second to forty bits per second — Jacobson and Mike Karels published *Congestion Avoidance and Control* at SIGCOMM '88. Slow start, AIMD congestion avoidance, fast retransmit, exponential RTO backoff, a refined RTT estimator. Six algorithms in one paper. Arguably the highest-leverage networking paper ever written. Their fixes shipped in 4.3BSD-Tahoe and saved the internet. He also wrote traceroute, tcpdump's BPF — the Berkeley Packet Filter — and co-authored RFC 1144 on header compression for low-speed serial links. Co-author of the 2016 BBR paper at Google: congestion control for a second internet generation. ACM SIGCOMM Award 2001, IEEE Internet Award 2003. There is a separate Van Jacobson episode.

### The 1986 Congestion Collapse

October 1986. The early internet ran TCP without any real congestion-control feedback loop. BSD TCP retransmitted aggressively when ACKs were late: a missing ACK at time *t* meant "the packet is probably gone, send again." Across the link from Lawrence Berkeley Lab to UC Berkeley — a path of three IMP hops, less than four hundred yards of physical distance — that policy worked fine until traffic levels rose. As load grew, queues at the IMPs filled, ACKs took longer, senders interpreted the delay as loss and retransmitted, the retransmissions filled queues further, and the network entered a positive-feedback loop where every additional packet made delivery less likely. Throughput on the LBL-to-UCB path collapsed from thirty-two kilobits per second to forty bits per second. A thousand-times degradation across a four-hundred-yard path. The first proof that a protocol designed for a small research network could fail catastrophically under production load. Jacobson and Karels spent six months instrumenting the wire and reading the BSD source. Their fix shipped in 4.3BSD-Tahoe and propagated to every TCP stack on earth. Full account in the Famous Outages part of the book.

### SACK Panic

June 17, 2019. Netflix's Jonathan Looney discovered that with a small enough MSS — easily set by a remote peer — a single socket buffer could be split into more than 65,535 GSO segments. The 16-bit `gso_segs` counter overflowed. The kernel panicked. A single TCP packet, no authentication, instant remote denial of service. CVSS 7.5. Most Linux servers on the public internet were vulnerable. Operators scrambled to patch; many disabled SACK as an interim mitigation. Mainline kernel patch shipped within days. The post-disclosure work led to better TCP fuzzing infrastructure and to RACK-TLP — RFC 8985 in February 2021 — replacing the older "three duplicate ACKs" loss-detection rule. Full account in the Famous Outages part of the book.

### L4S Launches in Production at Comcast

L4S — Low Latency, Low Loss, Scalable throughput — is the IETF architecture from RFCs 9330, 9331 and 9332, January 2023, for sub-millisecond queuing latency. Comcast launched it in production on January 29, 2025, in six metro areas, with Apple, NVIDIA GeForce NOW, Meta and Valve as launch partners. Cooperating senders mark packets ECN-Capable; routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient; senders react to marks like minor losses without backing off as hard. Bufferbloat avoided in real time. Latency-sensitive apps get the headroom they need without starving classic TCP.

### BBRv3 Default for Google + YouTube

BBR — Bottleneck Bandwidth and Round-trip propagation time — abandons loss as the primary signal and instead models the path's bottleneck bandwidth and RTT. Cardwell, Cheng, Gunn, Yeganeh, and Jacobson published it at ACM Queue in 2016. BBRv1's gain over CUBIC was about four percent globally on YouTube, more than fourteen percent in some countries, and a thirty-three percent reduction in median RTT. BBRv3 is now `draft-ietf-ccwg-bbr` inside the IETF's Congestion Control Working Group, and Google has been running it as the default for google.com and YouTube traffic since 2023. Available in Linux via `sysctl net.ipv4.tcp_congestion_control=bbr`, paired with the FQ qdisc that BBR's pacing requires.

### RFC 9293 — Transmission Control Protocol (TCP)

Published August 2022, edited by W. Eddy. Internet Standard. Obsoletes RFC 793 and six other documents. The current normative TCP specification — header format in section 3.1, sequence numbers in 3.4, the three-way handshake in 3.5, sliding-window flow control in 3.8. Forty-one years after RFC 793, this is the document that finally consolidated thirteen errata into a single coherent spec.

### RFC 5681 — TCP Congestion Control

Published 2009, by Allman, Paxson, and Blanton. Standards Track. Obsoletes RFC 2581. The standardisation of the four core congestion control algorithms that came out of Jacobson and Karels: slow start, congestion avoidance, fast retransmit, fast recovery. The document every TCP stack on earth implements.

### RFC 9438 — CUBIC for Fast and Long-Distance Networks

Published 2023, by Xu, Ha, Rhee, Goel, and Eggert. Standards Track. Obsoletes RFC 8312. CUBIC has been the Linux default since kernel 2.6.19 in 2006 and the Windows default since 2017. RFC 9438 promoted it to Standards Track. Replaces AIMD's linear ramp with a cubic function of time since the last loss — much friendlier to long fat pipes.

## What you'd see in the simulator

The TCP simulation in the app walks through a connection lifecycle. Press Play and you see the client send a SYN to the server, the server reply with SYN-ACK, the client complete the handshake with an ACK. One full round-trip-time before any payload moves. Then data flows: each segment carries a sequence number, the receiver returns cumulative ACKs, and the sliding window opens up as bytes are confirmed. The simulator shows the application-layer payload being wrapped in a TCP segment, the TCP segment being wrapped in an IP packet, the IP packet being wrapped in an Ethernet frame — encapsulation, layer by layer, all the way down. When a segment is lost, the receiver's duplicate ACKs trigger a fast retransmit. When the transfer completes, the connection closes with the four-way FIN/ACK shutdown. This is the mechanic, in miniature, that more than half the internet's traffic runs on.

## What it taught the industry

Three things sit downstream of this chapter.

Conservation of packets is the load-bearing principle. Put one packet into the network only when an ACK confirms a previous one has left it. Jacobson and Karels' 1988 formulation has held for forty years. Every later congestion-control algorithm — Reno, NewReno, Vegas, CUBIC, Compound, BBR v1 through v3, Prague over L4S — is a refinement of those original six. The internet does not work without it.

Wire-format stability is a feature, not stagnation. RFC 793 stood for forty-one years before RFC 9293 replaced it, and the replacement changed nothing on the wire. A 1985 capture parses cleanly with a 2026 dissector. That is what allows operating systems, NICs, middleboxes, and applications written across four decades to interoperate without coordination. Most of the protocols layered on top of TCP — HTTP/1.1, SSH, SMTP, BGP — depend on that property to keep working at all.

Decades-old code paths still hide remote-DoS bugs. SACK Panic was a sixteen-bit counter overflow in code that had shipped for ten years. Modern kernel networking is now fuzzed continuously by syzkaller, and most TCP CVEs since 2020 have been found by fuzzing rather than by humans. The industry has accepted that the only way to keep a forty-year-old protocol stack safe is to attack it harder than the attackers do.

## Listening order

- **Before this chapter:** *BGP* — every BGP session runs over TCP port 179, relying on TCP's reliable delivery because routing information must never be lost or corrupted. The chapter that sets up why this one matters at all.
- **After this chapter:** *UDP* — TCP's opposite number. No connection, no acknowledgments, no retransmission, no congestion control. The protocol that exists because reliability is sometimes the wrong trade.

## Where to go deeper

- **The TCP episode** picks up the mechanism story — the three-way handshake, sequence numbers, the sliding window, fast retransmit, slow start, AIMD, and the full congestion control state machine.
- **The QUIC episode** explains the protocol that was designed specifically to escape TCP's three costs — one-RTT handshake combined with TLS, per-stream loss recovery, connection migration over UDP.
- **The TLS episode** is the crypto setup that piles on top of TCP's handshake — and the TLS 1.3 round-trip reduction story that motivated half of QUIC's design.
- **The HTTP/2 episode** is where head-of-line blocking really bites — many streams, one TCP connection, one lost packet stalls them all.
- **The SSH and HTTP/1.1 episodes** are the unmultiplexed protocols that feel head-of-line blocking least — single stream, single stall.
- **The BGP and IP episodes** are the layers below: the addressing fabric and the inter-domain routing that move TCP segments hop by hop.
- **The Van Jacobson episode** is the human story behind every congestion-control algorithm in this chapter.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Jacobson — Congestion Avoidance and Control (SIGCOMM '88)](https://ee.lbl.gov/papers/congavoid.pdf)
- [Wikipedia — Congestive collapse](https://en.wikipedia.org/wiki/Network_congestion#Congestive_collapse)
- [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681)
- [Netflix Security Bulletin — TCP SACK PANIC](https://github.com/Netflix/security-bulletins/blob/master/advisories/third-party/2019-001.md)
- [Red Hat — TCP SACK PANIC vulnerability](https://access.redhat.com/security/vulnerabilities/tcpsack)
- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [google/bbr GitHub repo](https://github.com/google/bbr)
- [IETF — draft-ietf-ccwg-bbr](https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/)
- [RFC 793 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc793)
- [RFC 9293 — Transmission Control Protocol (TCP)](https://datatracker.ietf.org/doc/html/rfc9293)
- [RFC 1948 — Defending Against Sequence Number Attacks](https://www.rfc-editor.org/rfc/rfc1948)
- [RFC 4987 — TCP SYN Flooding Attacks and Common Mitigations](https://www.rfc-editor.org/rfc/rfc4987)
- [RFC 9438 — CUBIC for Fast and Long-Distance Networks](https://www.rfc-editor.org/rfc/rfc9438.html)
- [RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)
- [Van Jacobson — Wikipedia](https://en.wikipedia.org/wiki/Van_Jacobson)
