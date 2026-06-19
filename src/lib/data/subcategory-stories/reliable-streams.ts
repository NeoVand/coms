import type { SubcategoryStory } from './types';

export const reliableStreamsStory: SubcategoryStory = {
	subcategoryId: 'reliable-streams',
	tagline:
		'Turning best-effort {{ip|IP}} into ordered, reliable streams — and the fifty-year fight against {{congestion-collapse|congestion collapse}}',
	sections: [
		{
			type: 'narrative',
			title: 'The Reliability Contract',
			text: `{{ip|IP}} promises almost nothing. Packets can be lost, reordered, duplicated, corrupted, or just dropped on the floor. That is by design — keeping the network layer dumb is what lets the Internet scale. But almost no application can use the network in that raw form. They want a *byte stream*: write bytes here, read identical bytes there, in order.\n\n**[[tcp|TCP]]** (1981) is the original reliable-stream contract. It bolted onto [[ip|IP]] everything a stream needs — sequence numbers, acknowledgments, retransmission, flow control, and (after 1986) {{congestion-control|congestion control}}. For 40+ years, almost every Internet conversation that wasn't streaming media or DNS rode on TCP.\n\n**[[sctp|SCTP]]** (2000) is the protocol you wish TCP had been: multiple independent streams in one association (no {{head-of-line-blocking|HoL blocking}}), multi-homing for free failover, message-oriented instead of byte-oriented. It is technically superior to TCP for almost every workload — and almost nobody uses it, because middleboxes don't speak it. The story of SCTP is the story of how the Internet's *deployed* base shapes what protocols can succeed, regardless of merit.\n\n**[[mptcp|MPTCP]]** (2013) is the workaround for SCTP's loss. Keep the TCP wire format that middleboxes accept, but bond multiple TCP subflows across multiple paths into one logical stream. Apple ships it for Siri. Korean carriers use it to bond LTE+Wi-Fi. The protocol is a careful exercise in *backwards-compatible innovation*.\n\nAll three share one quiet inheritance: they all use {{congestion-control|congestion control}} algorithms derived from a single 1988 paper.`
		},
		{
			type: 'pioneers',
			title: 'The Reliability Architects',
			people: [
				{
					id: 'vint-cerf',
					name: 'Vint Cerf',
					years: '1943–',
					title: 'Co-inventor of TCP',
					org: 'Stanford / {{darpa|DARPA}}',
					contribution:
						"Co-designed [[tcp|TCP]] with [[pioneer:bob-kahn|Bob Kahn]] in the 1974 paper that defined open-architecture networking. The original TCP was a single monolithic protocol; the [[ip|TCP/IP]] split (Cerf, Postel, Cohen, 1978) carved out today's transport boundary — the precise reason transport protocols can evolve while IP stays still.",
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg'
				},
				{
					id: 'van-jacobson',
					name: 'Van Jacobson',
					years: '1950–',
					title: 'Inventor of TCP Congestion Control',
					org: 'LBL / Cisco / Google',
					contribution:
						"After the {{congestion-collapse|1986 congestion collapse}} dropped throughput between LBL and UC Berkeley from 32 kbps to 40 *bits per second*, Jacobson reverse-engineered the cause and wrote the four-mechanism fix: slow start, congestion avoidance (AIMD), fast retransmit, fast recovery. The 1988 SIGCOMM paper is one of the most-cited works in networking. Every modern transport — [[tcp|TCP]], [[sctp|SCTP]], [[mptcp|MPTCP]], [[quic|QUIC]] — descends from Jacobson's framework. Later co-authored {{bbr|BBR}} (2016), the first major break from loss-based CC.",
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Van-jacobson.jpg/330px-Van-jacobson.jpg'
				},
				{
					id: 'randall-atkinson',
					name: 'Randall Atkinson',
					years: '–',
					title: 'SCTP Co-author',
					org: 'IETF SIGTRAN WG',
					contribution:
						"Helped shepherd [[sctp|SCTP]] (RFC 4960, 2007 update of the 2000 spec) out of the SIGTRAN working group, where it was designed to carry telephone signaling (SS7) over IP. Its message-oriented framing, multi-streaming, and multi-homing came directly from telecom's need for reliable, redundant control planes. The same features that made it perfect for SS7 made it 'the protocol the web should have used' — but by 2000, TCP was too entrenched."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1974,
					title: 'Cerf & Kahn Publish "A Protocol for Packet Network Intercommunication"',
					description:
						'The paper that defined open-architecture networking — and the first version of TCP as a single transport-plus-network protocol.'
				},
				{
					year: 1978,
					title: 'TCP/IP Split',
					description:
						'[[pioneer:vint-cerf|Cerf]], [[pioneer:jon-postel|Postel]], and Danny Cohen separate the network layer ([[ip|IP]]) from the transport layer ([[tcp|TCP]]). Transports can now evolve independently.'
				},
				{
					year: 1981,
					title: 'TCP RFC 793 Published',
					description:
						'The reference TCP spec. Three-way handshake, sliding window, retransmission, flow control. Congestion control is *not* yet present — that omission will nearly destroy the Internet five years later.'
				},
				{
					year: 1986,
					title: 'Congestion Collapse',
					description:
						'The path between LBL and UC Berkeley — 400 yards apart — collapses to 40 bps from a nominal 32 kbps. The cause: TCP retransmits compounding network overload until the network drowns in retries.'
				},
				{
					year: 1988,
					title: 'Jacobson Publishes Congestion Control',
					description:
						"[[pioneer:van-jacobson|Van Jacobson]]'s SIGCOMM paper introduces slow start, AIMD, fast retransmit, and fast recovery. Within months, TCP implementations everywhere adopt them. The Internet survives."
				},
				{
					year: 1999,
					title: 'TCP Reno → NewReno → SACK',
					description:
						"A decade of incremental tuning. {{sack|Selective Acknowledgments}} (RFC 2018) let receivers tell senders *which* packets were lost, fixing the original ACK's ambiguity."
				},
				{
					year: 2000,
					title: 'SCTP Standardized (RFC 2960)',
					description:
						'The IETF SIGTRAN WG ships [[sctp|SCTP]]: multi-streaming, multi-homing, message framing. Designed for telephony signaling. Linux kernel ships support; WebRTC later adopts SCTP-over-DTLS for data channels.'
				},
				{
					year: 2006,
					title: 'CUBIC Becomes Default in Linux',
					description:
						'A new congestion-control algorithm scales TCP throughput to high-bandwidth, long-fat networks. Becomes the de-facto default for most of the Internet for the next decade.'
				},
				{
					year: 2013,
					title: 'MPTCP RFC 6824',
					description:
						'[[mptcp|MPTCP]] bonds multiple TCP subflows into a single logical stream. Wire-compatible with middleboxes because each subflow *is* a normal TCP connection.'
				},
				{
					year: 2016,
					title: 'Google Ships BBR',
					description:
						"{{bbr|BBR}} (Bottleneck Bandwidth and RTT) is the first major TCP CC that doesn't use packet loss as its primary signal. Models the path's bottleneck and operates near optimum. Default on google.com, YouTube, and Spotify."
				},
				{
					year: 2023,
					title: 'BBRv3 Production',
					description:
						'BBRv3 fixes fairness issues that plagued BBRv1/v2 in mixed deployments. Default on YouTube since 2023.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'The Three Reliable Streams',
			axes: ['Streams per connection', 'Path support', 'Framing', 'Deployment'],
			rows: [
				{
					label: '[[tcp|TCP]]',
					values: [
						'1 (byte stream)',
						'Single path',
						'Byte-oriented (no message boundaries)',
						'Universal'
					]
				},
				{
					label: '[[sctp|SCTP]]',
					values: [
						'Many (independent, no HoL blocking)',
						'Multi-homing (passive failover)',
						'Message-oriented (preserves boundaries)',
						'Telecom + WebRTC; blocked by most NATs/firewalls'
					]
				},
				{
					label: '[[mptcp|MPTCP]]',
					values: [
						'1 logical (over N TCP subflows)',
						'Multi-path (active aggregation)',
						'Byte-oriented (TCP-compatible)',
						'Apple, Korea Telecom, ATSSS in 5G'
					]
				}
			],
			note: "[[sctp|SCTP]] is technically the most capable, but its lack of NAT/firewall traversal kept it off the public Internet. [[mptcp|MPTCP]] is the pragmatic answer: take TCP's deployability and bolt the missing features on top."
		},
		{
			type: 'animated-sequence',
			title: 'Slow Start vs Congestion Avoidance',
			definition: `sequenceDiagram
    participant S as Sender
    participant N as Network
    participant R as Receiver
    Note over S,R: Slow start — exponential growth, 1 MSS at a time
    S->>N: Segment 1 cwnd=1
    N->>R: Segment 1
    R-->>S: ACK 1
    S->>N: Segment 2 cwnd=2
    S->>N: Segment 3
    N->>R: Segments 2, 3
    R-->>S: ACK 2, ACK 3
    S->>N: Segments 4-7 cwnd=4 → 8
    Note over S,N: cwnd doubles every RTT until ssthresh or loss
    Note over S,R: Congestion avoidance — linear AIMD
    S->>N: cwnd MSS
    N--xS: 1 packet dropped (loss signal)
    Note over S: cwnd /= 2 multiplicative decrease
    Note over S: cwnd += 1 each RTT additive increase
    S->>N: Fast retransmit lost segment
    R-->>S: ACK resumes`,
			caption:
				"TCP's [[pioneer:van-jacobson|Jacobson]]-era control loop: probe upward fast, back off hard on loss, then climb back linearly. Every reliable transport that came after — [[sctp|SCTP]], [[mptcp|MPTCP]], [[quic|QUIC]] — uses some variant of this.",
			steps: {
				0: '**Slow start.** A new TCP connection has no idea how much the network can carry. It starts pessimistic — one MSS in flight — and doubles every round trip until it loses a packet or hits ssthresh. "Slow" is a misnomer: the *exponential ramp* is the fastest safe probe of an unknown network.',
				1: 'Sender ships **segment 1** with congestion window = 1. One packet in flight.',
				2: 'Network delivers segment 1 to the receiver.',
				3: 'Receiver acks. The ACK tells the sender "you have room for more."',
				4: 'Sender doubles to **cwnd = 2** and ships segment 2.',
				5: 'Sender ships segment 3 in the same RTT — both packets in flight at once.',
				6: 'Network delivers both segments to the receiver.',
				7: 'Receiver acks both — sender now knows it can have at least 2 in flight without loss.',
				8: 'Sender ships **segments 4 through 7**. The cwnd doubles to 4, then 8 on the next RTT. Throughput is climbing exponentially.',
				9: 'Each RTT, **cwnd doubles**. This continues until something stops it: either a packet drops (network is full) or cwnd reaches the slow-start threshold (we are close to the previous comfortable rate).',
				10: '**Congestion avoidance.** Once past ssthresh, exponential growth would overload the network. The sender switches to **AIMD** — Additive Increase, Multiplicative Decrease. Grow gently, back off hard.',
				11: 'Sender is happily sending a full cwnd of packets per RTT.',
				12: 'A packet drops — the loss signal. In Reno/CUBIC this means "the network is full." {{bbr|BBR}} would not treat loss as the primary signal here.',
				13: '**Multiplicative decrease.** cwnd is halved instantly. The sender just gave up half its bandwidth to relieve the congestion.',
				14: '**Additive increase.** Every successful RTT, cwnd grows by *one* segment. The classic AIMD sawtooth — quick drop, slow climb back.',
				15: 'Sender **fast-retransmits** the lost segment (triggered by 3 duplicate ACKs) without waiting for a full retransmission timeout.',
				16: 'Receiver acks. The control loop continues — probing upward, backing off when the network complains.'
			}
		},
		{
			type: 'callout',
			title: 'Bufferbloat — When Buffers Hurt',
			text: `For 25 years, network engineers added bigger buffers to routers. The intuition was simple: bigger buffer = fewer drops = better throughput. The intuition was wrong.\n\nLoss-based congestion control ([[tcp|TCP]] Reno, CUBIC) uses *packet loss* as the signal to slow down. If routers buffer multi-megabytes of packets before dropping any, the sender doesn't learn about congestion until *the buffer is full* — adding seconds of latency to every packet.\n\nThis is **bufferbloat**. It's why your VoIP call jitters when someone uploads a file on the same connection. The fix is two-pronged: active queue management at routers (CoDel, FQ_CoDel, PIE) to drop packets *before* the buffer fills, and {{bbr|BBR}} at endpoints that models the bottleneck instead of waiting for loss. Modern stacks combine both.`
		},
		{
			type: 'narrative',
			title: 'The Failure Mode That Defines the Family',
			text: `Every reliable-stream protocol has the same nightmare: **head-of-line blocking**.\n\nIn [[tcp|TCP]], one lost packet stalls *every subsequent byte* until that packet is retransmitted and ACKed. If you're sending a 50 KB HTTP response and packet #3 is lost, the receiver buffers packets 4–35 but won't deliver them to the application until packet #3 arrives. Three round-trips of latency added.\n\n[[sctp|SCTP]] partially solved this with multiple streams: a loss on stream A doesn't stall stream B. But SCTP wasn't deployable.\n\n[[mptcp|MPTCP]] partially solved it differently: multiple subflows over different paths means *path-level* loss doesn't stall *application-level* delivery if you can re-issue on another path. But coordinating reorder across subflows is hard.\n\n[[quic|QUIC]] solved it completely by moving streams *into* the transport — but QUIC sits in [[datagram-transport|Datagram Transport]], not here, because it gave up TCP's wire format to do it.\n\nIn this family, the head-of-line ghost is permanent rent.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **{{bbr|BBRv3}}** continues to roll out beyond Google's properties. Fairness with CUBIC under shared bottlenecks remains a live research area.\n- **Multipath TCP for 5G** (ATSSS — Access Traffic Steering, Switching, and Splitting) lets carriers bond cellular + Wi-Fi for handset traffic. Standardized in 3GPP Release 16.\n- **L4S** (Low Latency, Low Loss, Scalable throughput) adds an ECN-based signal so endpoints can react to congestion *before* loss. Requires both router and endpoint changes; deployment is slow.\n- **The slow death of TCP for new things.** Most green-field protocols (HTTP/3, WebTransport, Media-over-QUIC) skip TCP entirely. The Reliable Streams family isn't shrinking yet — but its growth has stopped.`
		}
	]
};
