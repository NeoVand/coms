import type { StorySection } from './category-stories/types';

export interface FoundationSection {
	id: string;
	title: string;
	sections: StorySection[];
}

export const foundationSections: FoundationSection[] = [
	{
		id: 'what-is-a-protocol',
		title: 'What Is a Protocol?',
		sections: [
			{
				type: 'narrative',
				title: 'Rules for Communication',
				text: `A {{protocol|protocol}} is a set of rules that two systems agree to follow so they can exchange information. When you send a message over the internet, dozens of protocols cooperate — each handling a specific job, like addressing, reliability, or encryption.

Think of human communication: when you call someone, you both agree to speak the same language, take turns talking, and say "hello" before launching into conversation. Network protocols work the same way — they define the format of messages, the order of exchanges, and what to do when something goes wrong.

Protocols are defined in public documents called RFCs (Requests for Comments). Anyone can read them, and anyone can build software that implements them. This openness is what made the internet possible — no single company controls how computers talk to each other.`
			},
			{
				type: 'diagram',
				definition: `graph LR
  A["Client"] -->|"1. SYN"| B["Server"]
  B -->|"2. SYN-ACK"| A
  A -->|"3. ACK"| B
  A -->|"4. Request"| B
  B -->|"5. Response"| A`,
				caption: 'A protocol defines the exact sequence of messages. Here, TCP requires a three-way handshake before any data can flow — both sides must agree on the rules first.'
			},
			{
				type: 'callout',
				title: 'Postel\'s Law',
				text: 'Be conservative in what you send, be liberal in what you accept. This principle, from Jon Postel\'s RFC 760, guided decades of protocol design — send strictly correct messages, but tolerate minor deviations from others.'
			}
		]
	},
	{
		id: 'layer-model',
		title: 'The Layer Model',
		sections: [
			{
				type: 'narrative',
				title: 'The Problem Layers Solve',
				text: `In late 1972, Bob Kahn at DARPA was sketching a problem nobody had solved: how do you let a computer on the ARPANET talk to one on a packet-radio network, or a satellite link, when those networks know nothing about each other? He brought in [[pioneer:vint-cerf|Vint Cerf]] at Stanford, and in May 1974 they published "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications — the paper that coined the word "internet" and described a single, monolithic protocol they called TCP that did everything: routing hints, sequencing, flow control, reliability.

By 1978, repeated implementation work at Stanford, BBN, and University College London revealed the flaw. Some applications — packet voice, in particular — needed **speed** more than **reliability**. Forcing every application through the same reliable byte-stream was wrong. [[pioneer:jon-postel|Jon Postel]] and David Reed argued for splitting the monolith: a thin internetworking layer (IP) underneath, and an end-to-end transport layer above it. That single architectural decision is the reason [[udp|UDP]], [[icmp|ICMP]], and decades later [[quic|QUIC]] could exist without renegotiating with every router on the planet.

The deeper principle is older than networking: separate what changes together from what doesn't. The wire (copper, fibre, radio) changes every decade. The routing algorithm changes every few years. The web changes every Tuesday. Layered protocols let each move on its own clock — and let an engineer reason about one layer without holding the other six in their head.`
			},
			{
				type: 'diagram',
				title: 'What Each Layer Adds — A Single Web Request',
				definition: `graph TD
  APP["<b>L7 Application</b><br/>HTTP — GET /index.html"]
  TLS["<b>L5-7 Security</b><br/>TLS — wraps + encrypts"]
  TCP["<b>L4 Transport</b><br/>TCP — adds ports, seq #, ACKs"]
  IP["<b>L3 Internet</b><br/>IP — adds src/dst addresses, TTL"]
  ETH["<b>L2 Data Link</b><br/>Ethernet — adds src/dst MAC, FCS"]
  PHY["<b>L1 Physical</b><br/>Bits on copper / fibre / radio"]

  APP -->|"each layer wraps the one above"| TLS
  TLS --> TCP
  TCP --> IP
  IP --> ETH
  ETH --> PHY`,
				caption:
					'Going down the stack, each layer wraps the previous payload with its own header — encapsulation. Going up, each layer strips its header and hands the rest to the next. This is why the same HTTP request rides unchanged across Wi-Fi at home, Ethernet in the office, and a satellite link to a server in Iowa.'
			},
			{
				type: 'narrative',
				title: 'The Seven Layers, Honestly',
				text: `**L1 — Physical.** Volts on a wire, photons in a fibre, modulated radio. Specified by IEEE 802.3 (Ethernet PHYs), 802.11 (Wi-Fi), DOCSIS, fibre-optic standards, and the radio rules from the ITU. If your problem is "the cable is unplugged," it's L1.

**L2 — Data Link.** Frames addressed by 48-bit {{mac-address|MAC addresses}}. Reaches one hop on a single segment. [[ethernet|Ethernet]] (RFC-less; IEEE 802.3) and [[wifi|Wi-Fi]] (802.11) live here, alongside [[arp|ARP]], the spanning tree protocol, and VLAN tags. Switches operate at L2.

**L3 — Network.** [[ip|IP]] addresses, hop-by-hop forwarding, longest-prefix-match routing. [[ipv6|IPv6]], [[icmp|ICMP]], [[bgp|BGP]] for inter-domain routing. Routers operate at L3 — they decrement TTL and forward across networks.

**L4 — Transport.** End-to-end semantics. [[tcp|TCP]] (reliable, ordered byte stream), [[udp|UDP]] (fire-and-forget datagrams), SCTP (multi-streamed), [[mptcp|MPTCP]] (multi-path), and now [[quic|QUIC]] which folds in encryption. The first layer with a **port** — the demux that picks which application gets the bytes.

**L5–7 — Session, Presentation, Application.** OSI's three top layers. In practice the line between them is a fiction: [[http1|HTTP]] does session, presentation, and application at once. [[tls|TLS]] is "kind of L5/6" but on [[quic|QUIC]] it's fused into L4. [[smtp|SMTP]], [[dns|DNS]], [[ssh|SSH]], [[websockets|WebSockets]], [[grpc|gRPC]], [[mcp|MCP]] — everything an engineer touches sits up here.

The IETF stack pragmatically collapses 5–7 into one Application layer. That's the four-layer TCP/IP model: Link, Internet, Transport, Application. It maps to OSI but doesn't pretend the upper three are usefully distinct.`
			},
			{
				type: 'diagram',
				title: 'OSI vs TCP/IP — Side by Side',
				definition: `graph TD
  subgraph OSI["OSI — 7 layers (1984, ISO 7498)"]
    direction TB
    O7["L7 Application"] --- O6["L6 Presentation"]
    O6 --- O5["L5 Session"]
    O5 --- O4["L4 Transport"]
    O4 --- O3["L3 Network"]
    O3 --- O2["L2 Data Link"]
    O2 --- O1["L1 Physical"]
  end
  subgraph TCPIP["TCP/IP — 4 layers (RFC 1122, 1989)"]
    direction TB
    T4["Application — HTTP, DNS, SSH, TLS"] --- T3["Transport — TCP, UDP, QUIC"]
    T3 --- T2["Internet — IP, ICMP, BGP"]
    T2 --- T1["Link — Ethernet, Wi-Fi, ARP"]
  end
  O7 -.->|maps| T4
  O6 -.->|maps| T4
  O5 -.->|maps| T4
  O4 -.->|maps| T3
  O3 -.->|maps| T2
  O2 -.->|maps| T1
  O1 -.->|maps| T1`,
				caption:
					'OSI is a teaching tool with seven crisp boxes. TCP/IP is what the internet actually runs and collapses the three top boxes into one practical "Application" layer. Both end at the wire — only the bookkeeping above differs.'
			},
			{
				type: 'narrative',
				title: 'How TCP/IP Won the Standards War',
				text: `Through the 1980s the official future of networking was OSI. ISO and the ITU promoted the seven-layer suite — TP4 transport, CLNP networking — with full institutional backing: European PTTs, the U.S. government's GOSIP mandate, the prestige of a global standards body. TCP/IP was, in those rooms, considered a research project that would be replaced.

It was not. By July 1992, when [[pioneer:david-clark|David D. Clark]] gave his "A Cloudy Crystal Ball" plenary at the 24th IETF meeting in Cambridge, MA, he could distill the IETF's working culture into the sentence that decided the question: **"We reject: kings, presidents and voting. We believe in: rough consensus and running code."** OSI shipped specifications. The IETF shipped code. Code won.

The win was never about elegance — OSI's seven layers are arguably cleaner. It was about deployment economics. By 1992, TCP/IP was already running on every Unix box in every university, every BSD-derived workstation, every router on the NSFNET backbone. Switching to OSI would have required a coordinated global flag day. The internet had quietly become too big to migrate.`
			},
			{
				type: 'callout',
				title: 'Rough Consensus and Running Code',
				text: 'David Clark\'s 1992 IETF quote is the closest thing the internet community has to a national anthem. It says: standards are documents about behavior we have already shipped, not theories we hope someone will adopt. It is the reason new protocols appear as Internet Drafts with reference implementations, not as ISO documents. And it is why — even in 2026 — every protocol in this lab traces back to a draft someone could install and run.'
			},
			{
				type: 'narrative',
				title: 'Where the Layers Blur',
				text: `Real protocols don't always respect the model:

- [[quic|QUIC]] runs on [[udp|UDP]] (L4) but implements its own reliability + congestion control + multiplexing in user space, and folds [[tls|TLS]] 1.3 directly into the handshake. Is QUIC L4 or L4+L5+L6? Both, honestly.
- MPLS sits between L2 and L3 — a 4-byte shim header that drives label-swap forwarding underneath IP. The community calls it "Layer 2.5" because no other label fits.
- [[icmp|ICMP]] is "Layer 3" but it doesn't carry application data; it carries control messages **about** L3.
- Network Address Translation (NAT) rewrites L3 source addresses **and** L4 source ports together — breaking the strict layer separation in exchange for IPv4 address conservation.
- Encrypted Client Hello (RFC 9849) hides the L7 SNI inside an L5/6 TLS extension so middleboxes can't see the destination domain.

The model is a **map**, not the territory. The map is invaluable: it lets you reason about responsibilities, predict failures, and design new protocols. But every model has its edge cases, and every edge case is where the most interesting engineering happens.`
			},
			{
				type: 'callout',
				title: 'A Layer Is Defined by What It Replaces',
				text: 'When you read "X is a Layer 4 protocol," what that really means is: X provides services to whatever is above it (Layer 5+) and consumes services from whatever is below it (Layer 3). Swap out the layer underneath — IP for IPv6, Ethernet for Wi-Fi, fibre for radio — and X keeps working. That replaceability **is** the layer. Anything tightly coupled to its substrate isn\'t really layered.'
			}
		]
	},
	{
		id: 'addressing',
		title: 'Addressing & Identity',
		sections: [
			{
				type: 'narrative',
				title: 'How Data Finds Its Destination',
				text: `Every device on a network needs identifiers at multiple levels, and each serves a different purpose:

**{{mac-address|MAC addresses}}** identify hardware on a local network. Your laptop's Wi-Fi card has a unique 48-bit MAC address (like AA:BB:CC:DD:EE:FF). These only matter on the local network — they change at every router hop.

**{{ip-address|IP addresses}}** identify devices across the internet. Your router has a public IP (like 203.0.113.42) assigned by your ISP. Unlike MAC addresses, IP addresses stay constant from source to destination.

**{{port|Ports}}** identify applications on a machine. When a packet arrives at your computer, the port number tells the operating system which program should receive it — port 80 for HTTP, 443 for HTTPS, 22 for SSH.

**Hostnames** (like google.com) are human-readable names. {{dns-resolution|DNS resolution}} translates them into IP addresses before any communication begins.

Together: DNS resolves the hostname → IP routes the packet to the machine → [[arp|ARP]] resolves the IP to a MAC on the local network → the port delivers it to the right application.`
			},
			{
				type: 'diagram',
				title: 'Layers of Addressing',
				definition: `graph TD
  DNS["Hostname: google.com"] -->|"DNS resolves"| IP["IP: 142.250.80.46"]
  IP -->|"ARP resolves"| MAC["MAC: AA:BB:CC:DD:EE:FF"]
  MAC -->|"delivered to"| Port[":443 → Web Browser"]`,
				caption: 'Each identifier operates at a different layer: hostnames for humans, IP for routing, MAC for local delivery, ports for the right application.'
			}
		]
	},
	{
		id: 'packets',
		title: 'Packets & Encapsulation',
		sections: [
			{
				type: 'narrative',
				title: 'What Is a Packet?',
				text: `Data on the internet doesn't travel as continuous streams — it's broken into {{packet|packets}}. Each packet is a self-contained unit with a header (control information) and a payload (the actual data). This is called packet switching, and it's what makes the internet fundamentally different from the old telephone network.

As data moves down the network stack, each layer wraps the previous layer's output in its own header — this is {{encapsulation|encapsulation}}. Your HTTP request becomes a TCP {{segment|segment}} (adding port numbers and sequence numbers), then an IP packet (adding IP addresses and TTL), then an Ethernet {{frame|frame}} (adding MAC addresses and a checksum).

At the destination, the process reverses: each layer strips its header and passes the payload up to the next layer, until the application receives the original HTTP request.

Different layers use different names for their data units: {{frame|frames}} at Layer 2, {{packet|packets}} at Layer 3, {{segment|segments}} (TCP) or {{datagram|datagrams}} (UDP) at Layer 4. They all describe the same concept — a header plus a payload — at different levels of the stack.`
			},
			{
				type: 'diagram',
				title: 'Encapsulation — Layer by Layer',
				definition: `graph TD
  D["HTTP Data: GET /index.html"]
  S["TCP Segment: Ports + Seq# + HTTP Data"]
  P["IP Packet: IP Addrs + TCP Segment"]
  F["Ethernet Frame: MACs + IP Packet + Checksum"]
  D -->|"TCP wraps"| S
  S -->|"IP wraps"| P
  P -->|"Ethernet wraps"| F`,
				caption: 'Each layer adds its own header around the payload from above. At the destination, headers are stripped in reverse order.'
			}
		]
	},
	{
		id: 'ports-sockets',
		title: 'Ports & Sockets',
		sections: [
			{
				type: 'narrative',
				title: 'Multiplexing Applications',
				text: `A single machine can run dozens of network services simultaneously — a web server, an SSH daemon, a database. {{port|Ports}} are 16-bit numbers (0–65535) that let the OS route incoming packets to the correct application.

**Well-known ports** (0–1023) are reserved for standard services: 80 for HTTP, 443 for HTTPS, 22 for SSH, 53 for DNS. **Ephemeral ports** (typically 49152–65535) are assigned temporarily to the client side of a connection. When your browser opens a connection to a web server, it picks a random ephemeral port as its source.

A {{socket|socket}} combines an IP address, a port, and a protocol (TCP or UDP) into a single endpoint. A TCP connection is uniquely identified by four values: source IP, source port, destination IP, destination port. This is why a web server on port 443 can handle thousands of simultaneous connections — each client uses a different source port.`
			},
			{
				type: 'diagram',
				title: 'Ports Multiplex Applications',
				definition: `graph TD
  Net["Incoming Packet<br/>dst: 10.0.0.5"]
  OS["Operating System"]
  Net --> OS
  OS -->|":80"| W["Web Server"]
  OS -->|":443"| S["HTTPS Server"]
  OS -->|":22"| SSH["SSH Daemon"]
  OS -->|":5432"| DB["Database"]`,
				caption: 'The OS uses port numbers to deliver packets to the correct application. Multiple services share one IP address.'
			},
			{
				type: 'callout',
				title: 'Why Port 80 and 443?',
				text: 'Tim Berners-Lee chose port 80 for HTTP in 1991 because it was available and easy to remember. When HTTPS needed its own port, 443 was assigned. These choices were somewhat arbitrary — but now they\'re burned into firewalls, CDNs, and browser defaults worldwide.'
			}
		]
	},
	{
		id: 'reliability-speed',
		title: 'Reliability vs Speed',
		sections: [
			{
				type: 'narrative',
				title: 'The Fundamental Tradeoff',
				text: `Every network protocol makes a tradeoff between reliability and speed, and the choice ripples through every layer above. The story is forty years old and still writing itself.

**{{connection-oriented|Connection-oriented}}** protocols like [[tcp|TCP]] establish a session before sending data. They guarantee every byte arrives, in order, with no duplicates. The cost: {{handshake|handshakes}} add a round-trip up front, {{retransmission|retransmissions}} add delay when packets drop, {{flow-control|flow control}} caps throughput, and {{head-of-line-blocking|head-of-line blocking}} stalls every byte behind a lost one.

**{{connectionless|Connectionless}}** protocols like [[udp|UDP]] skip all of that. Each {{datagram|datagram}} is independent — no connection setup, no ordering guarantees, no retransmission. The benefit: an 8-byte header and zero state. The cost: your application is on its own when packets vanish or arrive out of order.

This tradeoff drives the entire protocol ecosystem. Web pages need reliability → TCP. Video calls need low latency → UDP (with RTP for framing). Modern transports like [[quic|QUIC]] try to have both — reliable delivery when needed, with minimal latency by building on UDP and adding selective retransmission per stream so one lost packet only blocks the stream it belongs to.`
			},
			{
				type: 'diagram',
				title: 'The Reliability Spectrum',
				definition: `graph LR
  UDP["<b>UDP</b><br/>No guarantees<br/>8-byte header"] ---|"+ encryption + multiplexing"| QUIC["<b>QUIC</b><br/>Per-stream reliability<br/>0/1-RTT handshake"]
  QUIC ---|"+ ordered byte stream"| TCP["<b>TCP</b><br/>Full reliability<br/>1-RTT handshake"]`,
				caption: 'Protocols sit on a spectrum from raw speed (UDP) to guaranteed delivery (TCP). QUIC sits in between by giving each multiplexed stream its own reliability — so a lost packet only blocks one stream.'
			},
			{
				type: 'narrative',
				title: 'October 1986: The First Collapse',
				text: `In October 1986 the internet broke for the first time. Throughput between Lawrence Berkeley Laboratory and UC Berkeley — three IMP hops apart, about 400 yards on the same site — collapsed from 32 kbps to 40 bps. A factor of 800. Multiple cascading collapses followed across the NSFNET backbone.

The cause was [[tcp|TCP]] itself. Early BSD TCP retransmitted aggressively when it saw loss. When the network was actually congested, every retransmission generated more loss, which generated more retransmissions. The network was eating itself.

[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent the next eighteen months on the fix. Their 1988 SIGCOMM paper, **"Congestion Avoidance and Control,"** gave the world {{slow-start|slow start}}, {{aimd|AIMD}} congestion avoidance, fast retransmit, fast recovery, and Karn's algorithm for {{rtt|round-trip-time}} estimation under retransmission ambiguity. Six algorithms in one paper. The fixes shipped in 4.3BSD-Tahoe and saved the internet.

The principle they articulated — **conservation of packets** — has held up for forty years. A sender should put one packet into the network only when an ACK confirms a previous packet has left it. Everything since is variations on that theme.`
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg',
				alt: 'Van Jacobson — co-author of the 1988 paper that saved the internet from congestion collapse and, decades later, of BBR.',
				caption:
					'Van Jacobson, co-author with Mike Karels of "Congestion Avoidance and Control" (SIGCOMM \'88) — the paper whose slow start, AIMD, and fast retransmit fixes shipped in 4.3BSD-Tahoe and stopped the 1986 cascade. Three decades later he was a co-author of the BBR paper at Google.',
				credit: 'Photo: Wikimedia Commons / public domain'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg',
				alt: 'ARPA Network logical map, September 1973 — the network whose successor would melt down in 1986.',
				caption:
					'The ARPA Network in September 1973, a few dozen IMPs and hosts. By 1986 the same architecture was carrying NSFNET traffic across the country — and the buffers between Lawrence Berkeley Lab and UC Berkeley, three hops apart, were where Jacobson watched throughput collapse from 32 kbps to 40 bps.',
				credit: 'Image: ARPA / public domain, via Wikimedia Commons'
			},
			{
				type: 'diagram',
				title: 'The Jacobson Recipe (1988)',
				definition: `graph TD
  S0["<b>Slow Start</b><br/>cwnd doubles each RTT<br/>until first loss"] -->|"loss detected"| FR["<b>Fast Retransmit</b><br/>3 duplicate ACKs →<br/>retransmit immediately"]
  S0 -->|"reach ssthresh"| CA["<b>Congestion Avoidance</b><br/>cwnd += 1 MSS / RTT<br/>(linear growth)"]
  FR --> RC["<b>Fast Recovery</b><br/>cwnd /= 2,<br/>continue, don't restart"]
  RC -->|"new ACK"| CA
  CA -->|"loss detected"| FR
  CA -->|"timeout"| S0`,
				caption: 'The four-phase loop every TCP congestion controller has used since 1988. Modern algorithms (CUBIC, BBR) replace the linear growth in Congestion Avoidance with their own curves, but the overall shape is unchanged.'
			},
			{
				type: 'narrative',
				title: 'CUBIC: A Curve That Scales',
				text: `By the mid-2000s networks had outgrown Reno's polite linear ramp. On a fat long pipe — say a 1 Gbps transcontinental link with a 100 ms RTT, a {{bdp|bandwidth-delay product}} of 12.5 MB — adding one packet per RTT was glacial. After a single loss it could take hundreds of RTTs to refill the pipe. The network's bandwidth was sitting unused while TCP slowly tiptoed back up.

In 2008, Sangtae Ha, Injong Rhee, and Lisong Xu at NC State published CUBIC: replace AIMD's linear function with a *cubic* function of time since the last loss. Far from the previous {{congestion-window|cwnd}}, CUBIC ramps fast; near it, it slows down and probes carefully; if the probe doesn't trigger loss, it accelerates past the previous max. The cubic curve is symmetric so two flows with different RTTs converge to fairness.

CUBIC shipped as the Linux default in kernel 2.6.19 (2006), before any RFC blessed it. Windows 10 1709 / Server 2019 made it Windows's default. macOS uses it. [[rfc:9438|RFC 9438]] (August 2023) finally moved CUBIC to Standards Track, replacing the 2018 Informational [[rfc:8312|RFC 8312]]. Most TCP traffic on the internet today is CUBIC.`
			},
			{
				type: 'narrative',
				title: 'BBR: Stop Treating Loss as the Signal',
				text: `Loss is a terrible primary signal because modern paths often drop packets for reasons that have nothing to do with congestion — a wireless retry budget exhausted, a lossy fibre amplifier, a buffer overflowing somewhere a thousand miles away. CUBIC backs off in all those cases too, even when the bottleneck wasn't actually full.

[[pioneer:van-jacobson|Van Jacobson]] (returning, decades later, to the same problem) and a Google team published **"BBR: Congestion-Based Congestion Control"** in 2016. Instead of treating loss as the signal, BBR continuously **models** the path: it estimates the bottleneck bandwidth and the minimum RTT, and paces packets to fill exactly the {{bdp|bandwidth-delay product}} — no more, no less. Buffers stay empty. Loss is irrelevant unless something physical actually fails.

BBRv1 hit ~4% mean throughput improvement on YouTube globally, more than 14% in some countries, and a 33% reduction in median RTT. BBRv3 has been the default for google.com and YouTube traffic since 2023. Linux supports it via \`sysctl net.ipv4.tcp_congestion_control=bbr\` paired with the FQ qdisc that BBR's pacing requires. See [[frontier:bbrv3-default|BBRv3 default for Google + YouTube]].`
			},
			{
				type: 'callout',
				title: 'Why Pacing Matters',
				text: 'Classic TCP sends packets in bursts — whatever cwnd allows, into the wire as fast as the NIC can clock them out. BBR sends every packet at exactly the estimated bottleneck rate. The bursts disappear. AQM drops disappear with them. Buffers stay nearly empty, latency stays near base RTT, and throughput stays at the bottleneck. The single change from "fire bursts and react to loss" to "pace at the actual bottleneck rate" is what made BBR possible.'
			},
			{
				type: 'narrative',
				title: 'L4S: Sub-Millisecond Queuing',
				text: `Even BBR can't fix {{bufferbloat|bufferbloat}} caused by other senders' classic TCP filling the same buffer. The buffer is in the network, not in BBR. The network needs to start helping.

L4S — Low Latency, Low Loss, Scalable throughput — is the IETF's answer ([[rfc:9330|RFC 9330]] / 9331 / 9332, January 2023). The mechanism: cooperating senders mark every packet ECN-Capable and react to {{ecn|ECN}} marks like minor losses without backing off as hard. Routers running the DualQ Coupled {{aqm|AQM}} mark instead of dropping when congestion is incipient. Classic TCP shares the same path and converges to fair throughput, but L4S traffic gets sub-millisecond queuing latency at the same time.

[[frontier:l4s-comcast-launch|Comcast launched L4S in production]] in late January 2025 in six US cities, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S in iOS 17 / macOS Sonoma and turned it on by default for [[quic|QUIC]] in newer releases. The same architecture works for cloud gaming, video calls, and AI assistant audio at the same time as a 4K download — without bufferbloat, without classic-TCP getting starved.`
			},
			{
				type: 'diagram',
				title: 'A Forty-Year Lineage',
				definition: `graph TD
  C1981["<b>1981</b><br/>RFC 793<br/>TCP basics"] --> C1986["<b>Oct 1986</b><br/>Congestion collapse<br/>32 kbps → 40 bps"]
  C1986 --> C1988["<b>1988</b><br/>Jacobson + Karels<br/>Slow start, AIMD,<br/>fast retransmit"]
  C1988 --> C1996["<b>1996</b><br/>SACK<br/>RFC 2018"]
  C1996 --> C2006["<b>2006</b><br/>CUBIC<br/>Linux default"]
  C2006 --> C2016["<b>2016</b><br/>BBR v1<br/>Model bandwidth, not loss"]
  C2016 --> C2021["<b>2021</b><br/>RACK-TLP<br/>RFC 8985"]
  C2021 --> C2023a["<b>2023</b><br/>BBRv3 default<br/>for google.com / YouTube"]
  C2021 --> C2023b["<b>Jan 2023</b><br/>L4S<br/>RFC 9330/9331/9332"]
  C2023b --> C2025["<b>Jan 2025</b><br/>Comcast L4S<br/>in production"]`,
				caption: 'Every TCP congestion controller is a chapter in the story Jacobson started. Modern transports — CUBIC, BBR, L4S, RACK-TLP — are each refinements of the same conservation-of-packets principle, adapted to different network realities.'
			},
			{
				type: 'narrative',
				title: 'QUIC: Reliability Per Stream',
				text: `[[quic|QUIC]] is the most ambitious attempt yet to have both reliability and speed at the same time. Its key insight: the unit of reliability shouldn't be the whole connection.

A QUIC connection carries multiple independent streams. Each stream has its own sequence numbers and its own retransmission queue. When a packet is lost, only the stream(s) it carried get held back — the rest keep flowing. This is the {{head-of-line-blocking|head-of-line blocking}} problem [[tcp|TCP]] could never fully solve, fixed by moving the framing layer down into transport.

QUIC also fuses transport and security ([[rfc:9000|RFC 9000]] for the transport, [[rfc:9001|RFC 9001]] for the [[tls|TLS]] integration). What used to be 1 RTT for [[tcp|TCP]] handshake + 1-2 RTT for [[tls|TLS]] is now a single 1-RTT handshake; with {{session-resumption|session resumption}} a returning client can send application data in the very first packet ({{zero-rtt|0-RTT}}). Connections survive an IP-address change ({{connection-migration|connection migration}}) — your phone can switch from Wi-Fi to cellular mid-page-load and the QUIC connection keeps going, just on a new path.`
			},
			{
				type: 'callout',
				title: 'Where the Tradeoff Goes Next',
				text: 'The next round will be in the datacenter. Inside a single GPU cluster training a frontier model, the assumptions baked into TCP and even QUIC start to creak. The Ultra Ethernet Consortium spec (June 2025) builds a new transport layer on plain Ethernet+IP for AI/HPC scale-out: connectionless, multipath with intelligent packet spray, packet-trimming, selective retransmission. The principle Jacobson articulated in 1988 — match what you put in to what the network can carry — is unchanged. The implementation gets re-derived for every new generation of hardware.'
			}
		]
	},
	{
		id: 'client-server-p2p',
		title: 'Client-Server vs Peer-to-Peer',
		sections: [
			{
				type: 'narrative',
				title: 'Two Communication Patterns',
				text: `The {{client-server|client-server model}} is the dominant pattern on the internet. A client (your browser) sends requests to a server (Google's data center), which processes them and sends responses. The server has a known address; clients connect to it. HTTP, DNS, email, databases — nearly everything follows this pattern.

The {{peer-to-peer|peer-to-peer (P2P)}} model is fundamentally different. Every participant is both client and server. Nodes connect directly to each other without a central authority. BitTorrent, blockchain, and [[webrtc|WebRTC]] video calls use P2P.

P2P is harder to build (you need to solve discovery, {{nat|NAT}} traversal, and trust) but has advantages: no single point of failure, no central server costs, and data stays between participants. [[webrtc|WebRTC]] uses STUN/TURN servers to punch through NATs, then establishes direct peer-to-peer media streams.

Many real systems are hybrids: Zoom uses a central server for group calls but P2P for one-on-one. Discord uses a server-based SFU (Selective Forwarding Unit) architecture for all voice, video, and screen sharing — routing media through servers to protect users' IP addresses and handle groups efficiently. The choice depends on scale, privacy needs, and complexity tolerance.`
			},
			{
				type: 'diagram',
				title: 'Client-Server vs Peer-to-Peer',
				definition: `graph TD
  subgraph CS["Client-Server Model"]
    C1["Client A"] & C2["Client B"] & C3["Client C"] -->|request| SRV["Server"]
  end
  subgraph P2P["Peer-to-Peer Model"]
    P1["Peer A"] <--> P2["Peer B"]
    P2 <--> P3["Peer C"]
    P3 <--> P1
  end
  CS ~~~ P2P`,
				caption: 'Client-server centralizes control through one authority. P2P connects nodes directly — more resilient but harder to coordinate.'
			}
		]
	},
	{
		id: 'encryption-basics',
		title: 'Encryption Basics',
		sections: [
			{
				type: 'narrative',
				title: 'Protecting Data in Transit',
				text: `{{encryption|Encryption}} converts readable data into unreadable ciphertext. Only someone with the correct key can decrypt it. Without encryption, anyone on the network path — your ISP, a coffee shop Wi-Fi hacker, a compromised router — can read your data.

**{{symmetric-encryption|Symmetric encryption}}** uses one key for both encrypting and decrypting. AES-256 and ChaCha20 are common examples. It's fast — modern CPUs encrypt at gigabits per second — but both sides must share the same secret key somehow.

**{{asymmetric-encryption|Asymmetric encryption}}** solves the key-sharing problem with two keys: a {{public-key|public key}} (shared openly) and a {{private-key|private key}} (kept secret). Anyone can encrypt with your public key, but only your private key can decrypt it. RSA and ECDH are common examples. It's much slower than symmetric.

[[tls|TLS]] combines both: asymmetric encryption exchanges a shared secret during the {{tls-handshake|handshake}}, then both sides switch to fast symmetric encryption for the actual data. This is why HTTPS is nearly as fast as HTTP.

**{{certificate|Certificates}}** bind a public key to an identity (like a domain name). A {{certificate-chain|chain of trust}} connects server certificates to trusted root Certificate Authorities pre-installed in your browser. This {{pki|PKI}} system is what makes the padlock icon possible.`
			},
			{
				type: 'diagram',
				title: 'TLS Hybrid Encryption',
				definition: `graph LR
  subgraph Handshake["Key Exchange — Asymmetric"]
    C["Client"] -->|"public key"| S["Server"]
    S -->|"certificate + key"| C
  end
  subgraph Data["Data Transfer — Symmetric"]
    C2["Client"] <-->|"AES/ChaCha20 encrypted"| S2["Server"]
  end
  Handshake -->|"shared secret"| Data`,
				caption: 'TLS uses slow asymmetric crypto to safely exchange a key, then switches to fast symmetric encryption for all data.'
			},
			{
				type: 'callout',
				title: 'Why Not Just Use Asymmetric for Everything?',
				text: 'Asymmetric encryption is roughly 1000x slower than symmetric. TLS uses it only for the initial key exchange (a few hundred bytes), then switches to AES or ChaCha20 for the actual data transfer. This hybrid approach gives you the best of both worlds.'
			}
		]
	},
	{
		id: 'ai-protocols',
		title: 'Protocols for AI Agents',
		sections: [
			{
				type: 'narrative',
				title: 'A New Layer of Communication',
				text: `For decades, protocols connected humans to servers ([[http1|HTTP]]), humans to humans (email, chat), and machines to machines (RPC, messaging). Starting in 2024, a new class of protocols emerged — ones designed for AI agents to use tools and collaborate with each other.

The catalyst was an integration problem. Every AI application needed custom code for every external tool — connecting an AI to a database was a different project than connecting it to GitHub, which was different from Slack. With N AI hosts and M tools, you needed N×M bespoke integrations.

Two complementary protocols solved this. [[mcp|MCP]] (Model Context Protocol) provides a universal interface between AI agents and their tools — define a tool once as an MCP server, and any AI host can use it. [[a2a|A2A]] (Agent-to-Agent Protocol) lets AI agents discover and delegate tasks to each other. MCP is vertical (agent → tools). A2A is horizontal (agent ↔ agent). Both are built on [[json-rpc|JSON-RPC]] 2.0 — the same minimal RPC format that has been quietly powering language servers, blockchain nodes, and editor tooling for years.`
			},
			{
				type: 'diagram',
				title: 'The AI Protocol Stack',
				definition: `graph TD
  U["User / AI Application"]
  U -->|"MCP"| T["Tools & Data Sources"]
  U -->|"A2A"| A["Other AI Agents"]
  A -->|"MCP"| T2["Agent's Own Tools"]
  subgraph Wire["Wire Format"]
    JR["JSON-RPC 2.0"]
  end
  subgraph Transport["Transport Layer"]
    HTTP["HTTP + SSE"]
    STDIO["stdio (local)"]
  end
  Wire -.-> Transport`,
				caption: 'AI protocols sit at the application layer, using JSON-RPC as their wire format and HTTP (or stdio) as their transport. MCP connects agents to tools; A2A connects agents to each other.'
			},
			{
				type: 'callout',
				title: 'Same Principles, New Domain',
				text: 'AI protocols follow the same design principles as their predecessors: capability discovery (like [[dns|DNS]]), request-response messaging (like [[http1|HTTP]]), stateful sessions (like [[tcp|TCP]]), and streaming (like [[sse|SSE]]). The innovation isn\'t in the transport mechanics — it\'s in defining a universal contract between AI agents and the world they interact with.'
			}
		]
	}
];

const sectionMap = new Map(foundationSections.map((s) => [s.id, s]));

export function getFoundationSection(id: string): FoundationSection | undefined {
	return sectionMap.get(id);
}
