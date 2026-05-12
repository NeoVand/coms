/**
 * Part IX — How Networks Actually Behave.
 *
 * Patterns and failure modes that recur across protocols. The most
 * useful chapters in the book for someone debugging a real problem
 * who already knows the protocol they are looking at. Three chapters,
 * each enriched with multi-section reading and embedded slot cards.
 */

import type { BookPart } from '../types';

export const patternsFailures: BookPart = {
	id: 'patterns-failures',
	title: 'How Networks Actually Behave',
	label: 'X',
	description:
		'Recurring patterns and the failure modes they cause — handshakes, sliding windows, ossification, {{mtu|MTU}} black holes.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'patterns',
			title: 'Recurring Patterns',
			synopsis:
				'Handshakes, sliding windows, keepalives, {{ecn|ECN}}, hashing — the Lego pieces every protocol uses.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Knowing the {{handshake|handshake}} pattern means you understand 80% of [[tls|TLS]], [[ssh|SSH]], [[mqtt|MQTT]], and [[sctp|SCTP]] setup before reading their specs. The remaining 20% is the part worth investing time in.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Engineering Vocabulary',
							text: `Once you have read about ten protocols, you start to see the same handful of patterns repeat. Knowing them means a new protocol takes minutes to read, not days — most of the spec turns out to be a particular instantiation of a pattern you already understand.

The point of this chapter is to enumerate those patterns, name them, and note where each one appears. Engineering literacy compounds.`
						},
						{
							type: 'narrative',
							title: 'Handshakes — Establishing Mutual State',
							text: `**Handshakes** establish state on both sides. SYN/SYN-{{ack|ACK}}/{{ack|ACK}} in [[tcp|TCP]]; ClientHello/ServerHello/Finished in [[tls|TLS]] 1.2 (RFC 5246) and the streamlined {{one-rtt|1-RTT}} {{handshake|handshake}} in [[tls|TLS]] 1.3 ([[rfc:8446|RFC 8446]], 2018); CONNECT/CONNACK in [[mqtt|MQTT]] 5; the [[sctp|SCTP]] four-way handshake (INIT, INIT-{{ack|ACK}}, {{cookie|COOKIE}}-ECHO, COOKIE-{{ack|ACK}}).

The shape is always the same: party A proposes, party B confirms with its own proposal, party A acknowledges. The number of round-trips defines the connection setup {{latency|latency}}, and shrinking it is one of the recurring optimisations in protocol design. [[tls|TLS]] 1.3 went from two round-trips ([[tls|TLS]] 1.2) to one. [[quic|QUIC]] went from three round-trips for [[tcp|TCP]]+[[tls|TLS]] down to one — and to **zero** for resumption (sending application data in the very first packet, encrypted under a previously-established key).

The cost of zero round-trip data is **replayability** — an attacker who captures the first packet of a {{zero-rtt|0-RTT}} {{exchange|exchange}} can replay it later. [[rfc:8446|RFC 8446]] §8 spells out the security implications and limits {{zero-rtt|0-RTT}} to {{idempotent|idempotent}} requests. Browsers restrict it to GET; servers should refuse it for any state-mutating operation.`
						},
						{
							type: 'narrative',
							title: 'Sliding Windows — Decoupling Send From ACK',
							text: `**Sliding windows** decouple sending rate from acknowledgement rate. The sender may have N bytes in flight; as ACKs arrive, the window slides forward. Without this, a sender would have to wait for an {{ack|ACK}} after every byte — disaster on a satellite link where round-trip times are hundreds of milliseconds.

[[tcp|TCP]] has had sliding windows since 1981. The window's *size* is governed by either {{flow-control|flow control}} (don't overflow the receiver — the rwnd field in the [[tcp|TCP]] header) or {{congestion-control|congestion control}} (don't overflow the network — the cwnd state variable that lives only in the sender's memory). The actual sending limit is min(rwnd, cwnd).

Modern protocols inherit the same idea. [[quic|QUIC]] has per-stream and per-connection {{flow-control|flow control}}. [[http2|HTTP/2]] has its own application-layer {{flow-control|flow control}} on top of [[tcp|TCP]]'s transport {{flow-control|flow control}} (a cause of considerable confusion when both windows close simultaneously). The pattern is universal across reliable transports.`
						},
						{
							type: 'narrative',
							title: 'Keepalives, ECN, Consistent Hashing',
							text: `**Keepalives** detect a dead peer when no data is flowing. [[ssh|SSH]] sends a 1-byte ping every 30 seconds. [[websockets|WebSocket]] has explicit Ping/Pong frames. [[http2|HTTP/2]] has PING frames. [[bgp|BGP]] sessions {{exchange|exchange}} KEEPALIVEs every 60 seconds; if no message arrives within 180 seconds (HoldTime), the session resets and routes are withdrawn — which is what cascaded into [[outage:centurylink-flowspec-2020|CenturyLink 2020]]. Without keepalives, a {{stateful|stateful}} {{firewall|firewall}} might silently drop the connection state and you'd notice only when you tried to send.

**{{ecn|ECN}}** (Explicit Congestion {{notification|Notification}}, RFC 3168) lets routers signal congestion **without dropping packets**. Mark a 2-bit field in the [[ip|IP]] header, the receiver echoes it, the sender slows down. The future of low-{{latency|latency}} networking ([[frontier:l4s-comcast-launch|L4S]], RFCs 9330/9331/9332) depends entirely on {{ecn|ECN}} being widely supported. Comcast launched {{l4s|L4S}} in production in January 2025 across six US metros.

**Consistent hashing** distributes load across a fleet so that adding or removing a node only re-routes a fraction of traffic. Used in [[dns|DNS]] {{anycast|anycast}}, in {{cdn|CDN}} cache placement, in distributed databases like Cassandra and DynamoDB. The MIT 1997 paper by Karger et al. invented it; nearly every internet-scale system uses it now.

**Idempotency keys** make retries safe — a request with the same key, sent twice, has the effect of being processed once. Stripe pioneered this for payments in 2015; it is now standard in [[rest|REST]] APIs, [[kafka|Kafka]] producers, and any system that needs at-least-once semantics without duplicate side effects.`
						},
						{
							type: 'callout',
							title: 'Patterns are why protocol literacy compounds',
							text: 'Knowing the {{handshake|handshake}} pattern means you understand 80% of [[tls|TLS]], [[ssh|SSH]], [[mqtt|MQTT]], and [[sctp|SCTP]] setup before reading their specs. The remaining 20% is the part worth investing time in. Read the patterns first; protocol-specific details slot in around them.'
						}
					]
				},
				{ kind: 'protocol', id: 'tcp' },
				{ kind: 'protocol', id: 'tls' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'failure-modes',
			title: 'Failure Modes',
			synopsis:
				'{{bufferbloat|Bufferbloat}}, ossification, head-of-line, microloops, {{mtu|MTU}} black holes — the bestiary every operator learns by being burned.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The interesting failures are the ones where everything is "working" but nothing is good. The cable is plugged in. The server is up. The packets are flowing. And yet.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Bestiary',
							text: `Some failures are obvious: a cable is cut, a server is down, a process crashed. Those are easy to diagnose because they trip every monitoring alarm at once.

The interesting failures are the ones where everything is "working" but nothing is good. The cable is plugged in. The server is up. The packets are flowing. And yet — your video call stutters, the database query takes thirty seconds, the page load fails 5% of the time. These are the failures worth naming, because each one has a distinctive signature and a known fix once you recognise it.`
						},
						{
							type: 'narrative',
							title: 'Bufferbloat — Latency Without Loss',
							text: `**{{bufferbloat|Bufferbloat}}** is what happens when there is too much buffering in routers and modems. A naive engineer thinks "more buffer is better" — bursts won't cause loss. But [[tcp|TCP]]'s congestion-control loop *needs* loss as its signal to slow down. With huge buffers, packets pile up in router queues for **seconds** before they are dropped. The sender keeps pushing because no loss is reported.

The result: your video call stutters because someone in the next room started a download. The download is happily filling a 200 ms buffer with bursts; your video, sharing the same buffer, sits behind 200 ms of someone else's traffic.

Jim Gettys named the problem in 2010 and spent the next decade getting it fixed. The cure was **{{aqm|active queue management}}** — CoDel (RFC 8289), PIE (RFC 8033), fq_codel (the Linux default since kernel 4.x). These shrink queues by dropping packets early when {{latency|latency}} rises, signalling congestion to senders before the queue grows. The deeper fix is [[frontier:l4s-comcast-launch|L4S]], which uses {{ecn|ECN}} signalling to keep queues sub-millisecond even at full link utilisation.

{{bufferbloat|Bufferbloat}} took fifteen years to deploy at scale because every cheap home router on the planet had to be replaced or firmware-updated. We are mostly there now.`
						},
						{
							type: 'narrative',
							title: 'Protocol Ossification — Why You Cannot Change TCP',
							text: `**Protocol ossification** is the phenomenon where middleboxes — firewalls, {{nat|NAT}} routers, transparent proxies, "next-gen" deep-packet-inspection appliances — inspect protocol headers and break anything that doesn't match what they expect.

The classic example: [[tcp|TCP]]. By 2015, you could not deploy a new [[tcp|TCP]] option globally because some non-trivial fraction of middleboxes would strip it, or worse, drop the connection. [[sctp|SCTP]] cannot traverse the public internet for the same reason: middleboxes drop unknown protocol numbers. [[mptcp|Multipath TCP]] gets stripped to plain [[tcp|TCP]] by many middleboxes.

The fix is the only fix — tunnel inside something the middleboxes already accept. [[quic|QUIC]] runs over [[udp|UDP]] specifically because [[udp|UDP]] traversal is well-understood by middleboxes. Inside the [[udp|UDP]] envelope, [[quic|QUIC]] encrypts almost everything, so middleboxes can't inspect — and therefore can't ossify — the inner protocol. This is the architectural lesson of the 2010s: **{{encryption|encryption}} is what keeps a protocol evolvable**.`
						},
						{
							type: 'narrative',
							title: 'The Subtler Failures',
							text: `**{{head-of-line-blocking|Head-of-line blocking}}** — a single lost packet stalls all subsequent in-order data. Severe in [[tcp|TCP]]; the entire reason [[http3|HTTP/3]] moved off [[tcp|TCP]] onto [[quic|QUIC]]. Visible as {{latency|latency}} spikes during loss events.

**Microloops** — a routing convergence event temporarily creates a loop where two routers think the path goes through each other. Packets bounce until {{ttl|TTL}} hits zero. Lasts a few seconds; usually invisible unless you're tcpdumping.

**{{mtu|MTU}} black holes** — a path drops large packets but does not return the [[icmp|ICMP]] "{{fragmentation|Fragmentation}} Needed" needed to signal Path {{mtu|MTU}}. The connection hangs because retransmits also fail. Cure: enable PLPMTUD (Packetisation Layer {{path-mtu-discovery|Path MTU Discovery}}, [[rfc:4821|RFC 4821]]) which probes packet sizes at the application layer; or set [[tcp|TCP]] {{mss|MSS}} clamping at network edges.

**Slowloris-style attacks** — hold connections open with minimal data, exhausting the server's connection table without burning attacker {{bandwidth|bandwidth}}. Defended by per-[[ip|IP]] connection limits, idle timeouts, and reverse proxies that buffer slow clients.

**Cache poisoning** — inject malicious answers into a [[dns|DNS]] resolver's cache so subsequent lookups go to the attacker's site. Largely cured by source-port randomisation (Dan Kaminsky's 2008 fix) and {{dnssec|DNSSEC}}.

**[[bgp|BGP]] hijacks** — an {{autonomous-system|AS}} announces a prefix it does not own. Examples: [[outage:as-7007-1997|AS 7007 1997]], [[outage:pakistan-youtube-2008|Pakistan / YouTube 2008]], [[outage:china-telecom-2010|China Telecom 2010]]. The fix in flight: [[frontier:rpki-rov-50-percent|RPKI/ROV]].

**Cascading failures** — one failure increases load on healthy components, which then fail too. Examples: [[outage:facebook-2021|Facebook 2021]], [[outage:rogers-2022|Rogers 2022]]. Cure: rate-limiting and circuit-breakers at every layer; the SRE pattern is "fail fast, fail isolated."`
						},
						{
							type: 'callout',
							title: 'Reading a stack trace vs. reading a network',
							text: 'When code crashes, the stack trace tells you where. When a network misbehaves, there is no stack trace — just a histogram of {{latency|latencies}}, a packet capture, and the question "which of the patterns in the bestiary is this?" Naming the failure modes is most of the diagnosis. Once you can say "this is {{bufferbloat|bufferbloat}}" or "this is {{mtu-black-hole|MTU black hole}}," the fix is mechanical.'
						}
					]
				},
				{ kind: 'outage', id: '{{sack|sack}}-panic-2019' },
				{ kind: 'outage', id: 'centurylink-flowspec-2020' },
				{ kind: 'outage', id: 'facebook-2021' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'congestion-history',
			title: 'A History of Congestion Control',
			synopsis: 'Tahoe → Reno → {{cubic|CUBIC}} → {{bbr|BBR}} → {{l4s|L4S}}, in one sitting.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The arc of {{congestion-control|congestion control}}: react to loss → react to delay → model the network → use explicit signalling. Each generation reduced the cost of being a good citizen on the internet.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Pre-1988 Era — No Congestion Control At All',
							text: `Before 1988, [[tcp|TCP]] had no {{congestion-control|congestion control}}. The original [[rfc:9293|RFC 793]] (1981) specified {{flow-control|flow control}} — don't overflow the receiver — but said nothing about not overflowing the network.

This worked when the internet was small. By 1986, with the NSFNET backbone scaling, it stopped working. In October 1986, throughput between Lawrence Berkeley Lab and UC Berkeley — three {{imp|IMP}} hops apart — collapsed from 32 kbps to 40 bps. A 1000× degradation. Senders kept retransmitting; the network melted.

[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent six months instrumenting and reading the BSD source. Their 1988 SIGCOMM paper, *"{{congestion-avoidance|Congestion Avoidance}} and Control,"* was the inflection point. Six algorithms in one paper. Saved the internet.`
						},
						{
							type: 'narrative',
							title: 'Loss-Based Algorithms — The Long Lineage',
							text: `**Tahoe (1988)**, by [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels — the original. {{slow-start|Slow start}} (double cwnd every {{rtt|RTT}}), {{aimd|AIMD}} {{congestion-avoidance|congestion avoidance}} ({{aimd|additive increase, multiplicative decrease}}), fast retransmit on three duplicate ACKs, exponential RTO backoff. Shipped in 4.3BSD-Tahoe.

**Reno (1990)** — added fast recovery: when fast retransmit fires, halve the {{congestion-window|congestion window}} instead of dropping it to 1 {{mss|MSS}}. Less brutal on the sender; faster to recover.

**NewReno (1996, [[rfc:5681|RFC 5681]])** — handles the case where multiple packets are lost from the same window without falling out of fast recovery prematurely. Default in Linux until 2006.

**Vegas (1995)** — proactive instead of reactive: monitor {{rtt|RTT}} directly, slow down when {{rtt|RTT}} starts climbing (signalling congestion before loss). Brilliant in a homogeneous network, terrible mixed with Reno (it always loses to a more aggressive flow). Never widely deployed.

**[[rfc:9438|CUBIC]] (2008, deployed in Linux 2.6, Standards Track in [[rfc:9438|RFC 9438]] in August 2023)** — replaces linear additive-increase with a {{cubic|cubic}} function of time since the last loss. Recovers throughput much faster on long fat pipes (gigabit transcontinental, etc.). Default in Linux, Windows, and macOS for over a decade.

**Compound (Microsoft, 2007)** — combined loss-based and delay-based components. Used in Windows. Withdrawn in newer versions.`
						},
						{
							type: 'narrative',
							title: 'Model-Based and Signal-Based — The New Paradigm',
							text: `**{{bbr|BBR}} (Google, 2016)** — fundamentally different from everything before. Model the bottleneck {{bandwidth|bandwidth}} and minimum {{rtt|RTT}} directly, then send at a paced rate just below the model. Robust to the random-loss problem (where {{cubic|CUBIC}} over-reacts). Deployed by default for google.com and YouTube outbound traffic from 2016. **BBRv3** ([[frontier:bbrv3-default|currently shipping default in production]] from 2024) addresses fairness issues v1 had with non-{{bbr|BBR}} flows on shared bottlenecks.

**[[frontier:l4s-comcast-launch|L4S]] (RFCs 9330/9331/9332, January 2023)** — the next paradigm. Instead of inferring congestion from loss or {{rtt|RTT}}, use **{{ecn|ECN}} as a per-packet explicit signal**. Cooperating senders mark packets ECT(1); routers with {{l4s|L4S}} support put those packets in a separate, isolated queue and mark CE (congestion experienced) early — before the queue grows. Senders react with paced back-off rather than half-the-window slash.

The result: **sub-millisecond queuing {{latency|latency}}** even at 100% link utilisation, for flows that participate. Comcast launched {{l4s|L4S}} in production in January 2025 across six US metros, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped {{l4s|L4S}} support in iOS 17 / macOS Sonoma in 2023, default for [[quic|QUIC]] in newer releases.

The arc: react to loss → react to delay → model the network → use explicit signalling. Each generation reduced the cost of being a good citizen on the internet.`
						},
						{
							type: 'callout',
							title: 'The unsolved problem: heterogeneous fairness',
							text: 'Every congestion-control algorithm is fair to itself. Mix {{bbr|BBR}} with {{cubic|CUBIC}} on a shared bottleneck and {{bbr|BBR}} takes the lion\'s share. Mix {{l4s|L4S}} with classic flows in the wrong queue and {{l4s|L4S}} starves. Each new algorithm has had to fight not just for performance but for **coexistence** with the deployed base — a constraint that consumes most of the engineering effort. BBRv3 spent two years on coexistence work before it was production-ready.'
						}
					]
				},
				{ kind: 'pioneer', id: 'van-jacobson' },
				{ kind: 'rfc', number: '5681' },
				{ kind: 'rfc', number: '9438' },
				{ kind: 'frontier', id: 'bbrv3-default' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' }
			]
		}
	]
};
