---
id: reliability-speed
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Reliability vs Speed
synopsis: The defining tradeoff — TCP vs UDP, and why QUIC tries to have both.
podcast_target_minutes: 15
position_in_book: 6 of 84
listening_order:
  prev: foundations/ports-sockets
  next: foundations/client-server-p2p
related_protocols: [tcp, udp, rtp, quic, tls, ip, wifi, ethernet]
related_pioneers: [van-jacobson]
related_outages: []
related_frontier: [bbrv3-default, l4s-comcast-launch]
related_rfcs: [9438, 8312, 9330, 9000, 9001]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg
    caption: Van Jacobson, co-author with Mike Karels of "Congestion Avoidance and Control" (SIGCOMM '88) — the paper whose slow start, AIMD, and fast retransmit fixes shipped in 4.3BSD-Tahoe and stopped the 1986 cascade. Three decades later he was a co-author of the BBR paper at Google.
    credit: Photo — Wikimedia Commons / public domain
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg
    caption: The ARPA Network in September 1973 — a few dozen IMPs and hosts. By 1986 the same architecture was carrying NSFNET traffic, and the buffers between Lawrence Berkeley Lab and UC Berkeley, three hops apart, were where Jacobson watched throughput collapse from 32 kbps to 40 bps.
    credit: Image — ARPA / public domain, via Wikimedia Commons
visual_cues:
  - "A spectrum bar from raw speed on the left (UDP, 8-byte header) to guaranteed delivery on the right (TCP, 1-RTT handshake), with QUIC sitting in the middle and a callout reading 'per-stream reliability over UDP'."
  - "A four-panel loop diagram of Jacobson's 1988 recipe: slow start doubles cwnd each RTT, fast retransmit fires on three duplicate ACKs, fast recovery halves cwnd, congestion avoidance climbs linearly — arrows looping back into each other."
  - "A timeline running 1981 to 2025: RFC 793, the October 1986 collapse, the 1988 SIGCOMM paper, SACK in 1996, CUBIC in 2006, BBRv1 in 2016, RACK-TLP in 2021, BBRv3 default and L4S RFCs in 2023, Comcast L4S launch in January 2025."
  - "Two side-by-side bandwidth-time graphs: classic TCP firing in bursts that overflow a buffer and trigger drops, versus BBR pacing each packet at the bottleneck rate so the buffer stays nearly empty."
  - "A QUIC connection cross-section: outer UDP header, then multiple independent streams inside the encrypted envelope, each with its own retransmission queue — one stream stalled on a lost packet while the others keep flowing."
---

# Part I, Chapter — Reliability vs Speed

## The hook

In October 1986, throughput between Lawrence Berkeley Lab and UC Berkeley — three IMP hops apart, about four hundred yards on the same site — collapsed from thirty-two kilobits per second to forty bits per second. A factor of eight hundred. The cause was not the wire. It was the protocol that everyone had agreed to trust. That collapse forced a decision the whole internet has been re-deciding ever since: when do you wait for a packet to be confirmed, and when do you just send the next one? Reliability versus speed is the oldest tradeoff in networking, and forty years later it is still writing itself.

## The story

### The Fundamental Tradeoff

Every transport protocol picks a position on a single axis. On one end is connection-oriented delivery — TCP. Before any data flows, the two sides shake hands and agree on sequence numbers. Every byte is acknowledged. Lost segments are retransmitted. Bytes arrive in order, no duplicates, or they do not arrive at all. The cost is structural: a handshake adds a round trip, retransmissions add delay, flow control caps throughput, and head-of-line blocking stalls every byte queued behind a lost one.

On the other end is connectionless delivery — UDP. No setup, no acknowledgements, no ordering guarantees, no retransmission. The header is eight bytes and the connection state is zero. The cost there is also structural: when packets vanish or arrive out of order, your application has to deal with it.

That single axis drives the entire ecosystem above. Web pages need every byte, in order — TCP. Live video and voice can drop a frame more cheaply than they can wait for one — UDP, with RTP for framing and timing. The mechanism details belong to the TCP, UDP, and RTP episodes. What this chapter is about is the consequence of that choice rippling up through forty years of internet history.

QUIC is the modern attempt to refuse the choice — reliable when you need it, fast by default — built on top of UDP with selective retransmission per stream. We get to QUIC at the end. First we have to walk through the reason it had to be invented.

### October 1986: The First Collapse

Three IMP hops. Four hundred yards of cable on the same site. Thirty-two kilobits per second falling to forty. A thousand-fold drop, repeating in cascades across the NSFNET backbone.

The cause was TCP itself. Early BSD TCP retransmitted aggressively when it saw loss. When the network was actually congested, every retransmission generated more loss, which generated more retransmissions. The network was eating itself. We cover the wall-clock account in the chapter on the 1986 collapse in the Famous Outages part of the book — what this chapter cares about is the fix.

Van Jacobson and Mike Karels at Berkeley spent the next eighteen months on it. Their 1988 SIGCOMM paper, *Congestion Avoidance and Control,* gave the world six algorithms in a single document — slow start, AIMD congestion avoidance, fast retransmit, fast recovery, exponential RTO backoff, and Karn's algorithm for round-trip-time estimation under retransmission ambiguity. The fixes shipped in 4.3BSD-Tahoe and saved the internet. How each algorithm works mechanically is the second half of the TCP episode. There is also a separate episode on Van Jacobson himself.

The principle they articulated has held up for forty years: *conservation of packets.* A sender should put one packet into the network only when an acknowledgement confirms a previous packet has left it. Every congestion controller since is variations on that theme.

### CUBIC — A Curve That Scales

By the mid-2000s, the networks had outgrown Reno's polite linear ramp. On a fat long pipe — say a one-gigabit transcontinental link with a hundred-millisecond round trip, a bandwidth-delay product of twelve and a half megabytes — adding one packet per RTT was glacial. After a single loss it could take hundreds of RTTs to refill the pipe. Bandwidth was sitting unused while TCP slowly tiptoed back up.

In 2008, Sangtae Ha, Injong Rhee, and Lisong Xu at North Carolina State University published CUBIC. The trick was to replace AIMD's linear function with a cubic function of time since the last loss. Far from the previous congestion window, CUBIC ramps fast; near it, it slows down and probes carefully; if the probe does not trigger loss, it accelerates past the previous max. The cubic curve is symmetric, so two flows with different RTTs converge to fairness.

CUBIC shipped as the Linux default in kernel 2.6.19 in 2006, before any RFC blessed it. Windows 10 1709 and Server 2019 made it Windows's default. macOS uses it. RFC 9438, in August 2023, finally moved CUBIC onto the Standards Track, replacing the 2018 informational RFC 8312. Most TCP traffic on the internet today is CUBIC.

### BBR — Stop Treating Loss as the Signal

Loss is a terrible primary signal because modern paths drop packets for reasons that have nothing to do with congestion — a wireless retry budget exhausted, a lossy fibre amplifier, a buffer overflowing somewhere a thousand miles away. CUBIC backs off in all of those cases too, even when the bottleneck was not actually full.

Van Jacobson — returning, decades later, to the same problem — and a Google team published *BBR: Congestion-Based Congestion Control* in 2016. Instead of treating loss as the signal, BBR continuously *models* the path. It estimates the bottleneck bandwidth and the minimum RTT, and paces packets to fill exactly the bandwidth-delay product — no more, no less. Buffers stay empty. Loss becomes irrelevant unless something physical actually fails.

BBRv1 hit a four-percent mean throughput improvement on YouTube globally, more than fourteen percent in some countries, and a thirty-three percent reduction in median RTT. BBRv3 has been the default for google.com and YouTube traffic since 2023, and the Frontier page tracks the rollout. On Linux you turn it on with a sysctl flip to `tcp_congestion_control=bbr`, paired with the FQ qdisc that BBR's pacing requires.

The single change underneath all of this is the move from *fire bursts and react to loss* to *pace at the actual bottleneck rate.* Classic TCP empties the congestion window into the wire as fast as the NIC can clock packets out. BBR paces each packet at the estimated bottleneck rate. The bursts disappear. AQM drops disappear with them. Buffers stay nearly empty, latency stays near base RTT, and throughput stays at the bottleneck.

### L4S — Sub-Millisecond Queuing

Even BBR cannot fix bufferbloat caused by other senders' classic TCP filling the same buffer. The buffer is in the network, not in BBR. The network has to start helping.

L4S — Low Latency, Low Loss, Scalable throughput — is the IETF's answer, codified in RFCs 9330, 9331, and 9332 in January 2023. The mechanism: cooperating senders mark every packet ECN-Capable and treat ECN marks like minor losses without backing off as hard. Routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient. Classic TCP shares the same path and converges to fair throughput, but L4S traffic gets sub-millisecond queuing latency at the same time.

Comcast launched L4S in production in late January 2025 in six US cities — Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville in Maryland, and San Francisco — with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S in iOS 17 and macOS Sonoma and turned it on by default for QUIC in newer releases. The same architecture supports cloud gaming, video calls, and AI-assistant audio at the same time as a 4K download — without bufferbloat, without classic TCP getting starved. The launch entry on the Frontier page has the full account.

### QUIC — Reliability Per Stream

QUIC is the most ambitious attempt yet to have both reliability and speed at the same time. The key insight: the unit of reliability should not be the whole connection.

A QUIC connection carries multiple independent streams. Each stream has its own sequence numbers and its own retransmission queue. When a packet is lost, only the streams it carried get held back — the rest keep flowing. This is the head-of-line blocking problem TCP could never fully solve, fixed by moving the framing layer down into the transport itself.

QUIC also fuses transport and security. RFC 9000 specifies the transport, RFC 9001 specifies the TLS 1.3 integration. What used to be one round trip for the TCP handshake plus one or two for TLS is now a single 1-RTT handshake; with session resumption a returning client can send application data in the very first packet, a 0-RTT connection. Connections survive an IP-address change, so your phone can switch from Wi-Fi to cellular mid-page-load and the QUIC connection keeps going on the new path. The mechanism — packet numbers, the long and short headers, connection IDs, the loss-recovery state machine — is the QUIC episode.

### Where the Tradeoff Goes Next

The next round will be in the datacenter. Inside a single GPU cluster training a frontier model, the assumptions baked into TCP and even QUIC start to creak. The Ultra Ethernet Consortium specification, published in June 2025, builds a new transport layer on plain Ethernet plus IP for AI and HPC scale-out: connectionless, multipath with intelligent packet spray, packet trimming, selective retransmission. The principle Jacobson articulated in 1988 — match what you put in to what the network can carry — is unchanged. The implementation gets re-derived for every new generation of hardware.

## The figures

### Van Jacobson

A network researcher at Lawrence Berkeley Lab in the 1980s, later at Cisco, PARC, and Google. After the October 1986 collapse, he and Mike Karels published *Congestion Avoidance and Control* at SIGCOMM '88 — slow start, AIMD, fast retransmit, exponential RTO backoff. Six algorithms in one paper, arguably the highest-leverage networking paper ever written. He also wrote `traceroute`, the Berkeley Packet Filter inside `tcpdump`, and co-authored RFC 1144 on header compression for slow serial links. Three decades later, he was a co-author of the 2016 BBR paper at Google — congestion control for a second internet generation. ACM SIGCOMM Award 2001, IEEE Internet Award 2003. There is a separate episode on him.

### BBRv3 default for Google and YouTube

Google's BBR replaced CUBIC for google.com and YouTube traffic in 2023 and is the default congestion controller on Google Cloud. BBRv1's gain was four percent mean throughput on YouTube globally in 2017, with a thirty-three percent reduction in median RTT. BBRv3 is now `draft-ietf-ccwg-bbr` inside the IETF Congestion Control Working Group, refining the bandwidth probing, packet conservation, and convergence properties of earlier versions.

### L4S launches in production at Comcast

On the 29th of January 2025, Comcast turned on L4S for residential customers in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville, and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The Frontier page tracks the rollout.

### RFC 9438 — CUBIC for Fast and Long-Distance Networks

Published August 2023 by Lisong Xu, Sangtae Ha, Injong Rhee, Vidhi Goel, and Lars Eggert. Standards Track. Specifies the cubic congestion-window function as a replacement for Reno's linear AIMD on long fat pipes, obsoleting the 2018 informational RFC 8312. This is the canonical reference for the algorithm that carries most TCP traffic on the internet today.

### RFC 9330 — Low Latency, Low Loss, and Scalable Throughput (L4S) — Architecture

Published January 2023 by Bob Briscoe and others. Informational. Specifies the L4S architecture — the ECN-Capable marking convention, the DualQ Coupled AQM, and the rules cooperating senders follow to keep queues at sub-millisecond depth. RFCs 9331 and 9332 specify the codepoint and the AQM in normative detail.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport

Published May 2021 by Jana Iyengar and Martin Thomson. Proposed Standard. Specifies QUIC version 1 — connection IDs and migration in section five, loss recovery and congestion control in section thirteen, packet header formats in section seventeen. RFC 9001 specifies the TLS 1.3 integration. Together they fold what used to be three protocols — TCP, TLS, and HTTP framing — into one.

## What it taught the industry

Three things are now load-bearing in the way transports are designed.

*Congestion control is not optional.* Before 1988, TCP had flow control — do not overflow the receiver — but no notion of do not overflow the network. After 1988, every reliable transport on Earth shipped with congestion control. QUIC inherits the same algorithms; L4S evolves them with explicit signalling rather than inferred loss; but the assumption that senders must back off when the network is full is now permanent.

*Loss as a signal works, until it does not.* Jacobson's 1988 algorithms assumed packet loss meant congestion. That was true when the wire was reliable and queues were small. By the 2010s, with wireless networks losing packets to interference and fibre links hiding loss in multi-megabyte buffers, the signal got noisy. BBR replaced inference with a model of the path. L4S replaces loss entirely with explicit ECN marking. Each generation reduced the cost of being a good citizen on the internet.

*The unit of reliability is a design choice.* TCP picked the connection. UDP picked nothing. QUIC picked the stream. Ultra Ethernet, in 2025, is picking something different again for inside-the-datacenter traffic. The tradeoff is the same one Jacobson framed in 1988. The right granularity keeps moving with the hardware.

## Listening order

- **Before this chapter:** *Ports & Sockets* — once you understand how a process picks up an incoming connection, the question of *what kind of connection* is the next thing to ask. That is this chapter.
- **After this chapter:** *Client-Server vs Peer-to-Peer* — having decided how reliably you want to talk, the next decision is whether you talk to a single trusted server or to anybody on the network. The shape of the application changes accordingly.

## Where to go deeper

- **The TCP episode** picks up the mechanism story — the three-way handshake, the state machine, slow start, AIMD, fast retransmit, the full congestion-control toolkit, what it costs in production today.
- **The UDP episode** is the short, sharp counterpart — eight bytes of header, no state, and the design choices that make DNS, gaming, and live media possible.
- **The RTP episode** covers the framing layer that real-time audio and video bolt on top of UDP — sequence numbers, timestamps, payload type, and the RTCP feedback channel.
- **The QUIC episode** picks up the modern coda — 1-RTT handshakes, 0-RTT resumption, connection migration, per-stream loss recovery.
- **The TLS episode** covers the security layer that QUIC fuses into the transport — the 1.3 handshake, certificates, and what changes when encryption moves from a layer above transport to a layer inside it.
- **The chapter on the QUIC redesign in Part II** tells the deployment story — why a brand-new transport had to tunnel inside UDP rather than ship as a new IP protocol number.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [google/bbr GitHub repo](https://github.com/google/bbr)
- [IETF — draft-ietf-ccwg-bbr](https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/)
- [RCR Wireless — Comcast launches L4S in production](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [RFC 9438 — CUBIC for Fast and Long-Distance Networks](https://www.rfc-editor.org/rfc/rfc9438.html)
- [RFC 9330 — L4S Architecture](https://datatracker.ietf.org/doc/rfc9330/)
- [RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)
- [Wikipedia — Van Jacobson](https://en.wikipedia.org/wiki/Van_Jacobson)
