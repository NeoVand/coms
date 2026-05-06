/**
 * Part IX — How Networks Actually Behave.
 *
 * Patterns and failure modes that recur across protocols. The most
 * useful chapters in the book for someone debugging a real problem
 * who already knows the protocol they are looking at.
 */

import type { BookPart } from '../types';

export const patternsFailures: BookPart = {
	id: 'patterns-failures',
	title: 'How Networks Actually Behave',
	label: 'IX',
	description:
		'Recurring patterns and the failure modes they cause — handshakes, sliding windows, ossification, MTU black holes.',
	chapters: [
		{
			id: 'patterns',
			title: 'Recurring Patterns',
			synopsis: 'Handshakes, sliding windows, keepalives, ECN, hashing — the Lego pieces every protocol uses.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Engineering Vocabulary',
							text: `Once you have read about ten protocols you start to see the same handful of patterns repeat. Knowing them means a new protocol takes minutes to read, not days.

**Handshakes** establish state on both sides. SYN/SYN-ACK/ACK in [[tcp|TCP]]; ClientHello/ServerHello/Finished in [[tls|TLS]]; CONNECT/CONNACK in [[mqtt|MQTT]]. The shape is always: party A proposes, party B confirms with its own proposal, party A acknowledges. The number of round-trips defines connection setup latency, and shrinking it (TLS 1.3 down to 1-RTT, [[quic|QUIC]] down to 0-RTT) is one of the recurring optimisations.

**Sliding windows** decouple sending rate from acknowledgement rate. The sender may have N bytes in flight; as ACKs arrive, the window slides forward. TCP, QUIC, and most reliable transports use them. The window's **size** is governed by either flow control (don't overflow the receiver) or congestion control (don't overflow the network).

**Keepalives** detect a dead peer when no data is flowing. SSH sends a 1-byte ping every 30 seconds. WebSocket has explicit Ping/Pong frames. HTTP/2 has PING frames. Without keepalives, a stateful firewall might silently drop the connection state and you'd notice only when you tried to send.

**ECN** (Explicit Congestion Notification) lets routers signal congestion without dropping packets. Mark a bit, the receiver echoes it, the sender slows down. The future of low-latency networking ([[frontier:l4s-comcast-launch|L4S]]) depends on ECN being widely supported.

**Consistent hashing** distributes load across a fleet so that adding or removing a node only re-routes a fraction of traffic. Used in [[dns|DNS]] anycast, in CDN cache placement, in distributed databases.

**Idempotency keys** make retries safe — a request with the same key, sent twice, has the effect of being processed once. Stripe pioneered this for payments; it's now standard in REST APIs.`
						},
						{
							type: 'callout',
							title: 'Patterns are why protocol literacy compounds.',
							text: 'Knowing the handshake pattern means you understand 80% of TLS, SSH, MQTT, and SCTP setup before reading their specs. The remaining 20% is the part worth investing time in.'
						}
					]
				}
			]
		},
		{
			id: 'failure-modes',
			title: 'Failure Modes',
			synopsis: 'Bufferbloat, ossification, head-of-line, microloops, MTU black holes — the bestiary.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Bestiary',
							text: `Some failures are obvious: a cable is cut, a server is down. The interesting failures are the ones where everything is "working" but nothing is **good**.

**Bufferbloat** — too much buffering in routers and modems destroys [[tcp|TCP]]'s congestion-control feedback loop. Your video call stutters because someone in the next room started a download. The fix (active queue management like CoDel/PIE) took fifteen years to deploy.

**Protocol ossification** — middleboxes inspect protocol headers and break anything that doesn't match what they expect. SCTP cannot traverse the public internet. New TCP options get stripped. This is the entire reason [[quic|QUIC]] tunnels inside UDP.

**Head-of-line blocking** — a single lost packet stalls all subsequent in-order data. Severe in [[tcp|TCP]]; the entire reason [[http3|HTTP/3]] moved off TCP onto QUIC.

**Microloops** — a routing convergence event temporarily creates a loop where two routers think the path goes through each other. Packets bounce until TTL hits zero. Lasts seconds; usually invisible unless you're tcpdumping.

**MTU black holes** — a path drops large packets but does not return the [[icmp|ICMP]] needed to signal Path MTU. The connection hangs because retransmits also fail. Cure: enable PMTUD or use packetisation-layer MTU discovery (PLPMTUD).

**Slowloris-style attacks** — hold connections open with minimal data, exhausting the server's connection table without burning attacker bandwidth. Defended by per-IP connection limits and timeouts.

**Cache poisoning** — inject malicious answers into a [[dns|DNS]] resolver's cache so subsequent lookups go to the attacker's site. Largely cured by source-port randomisation and DNSSEC.

**BGP hijacks** — an AS announces a prefix it does not own. ([[outage:as-7007-1997|AS 7007 1997]], [[outage:pakistan-youtube-2008|Pakistan / YouTube 2008]].) The fix in flight: [[frontier:rpki-rov-50-percent|RPKI/ROV]].

**Cascading failures** — one failure increases load on healthy components, which then fail too. ([[outage:facebook-2021|Facebook 2021]], [[outage:rogers-2022|Rogers 2022]].) Cure: rate-limiting and circuit-breakers at every layer.`
						}
					]
				},
				{ kind: 'outage', id: 'sack-panic-2019' },
				{ kind: 'outage', id: 'centurylink-flowspec-2020' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' }
			]
		},
		{
			id: 'congestion-history',
			title: 'A History of Congestion Control',
			synopsis: 'Tahoe → Reno → CUBIC → BBR → L4S, in one sitting.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Forty Years of Senders Trying Not to Melt the Network',
							text: `**Tahoe (1988)**, by [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels — the original. Slow start, AIMD congestion avoidance, fast retransmit on three duplicate ACKs, exponential RTO backoff. Saved the internet from the 1986 collapse.

**Reno (1990)** — added fast recovery: when fast retransmit fires, halve the congestion window instead of dropping it to 1 MSS. Less brutal on the sender; faster to recover.

**NewReno (1996, [[rfc:5681|RFC 5681]])** — handles the case where multiple packets are lost from the same window without falling out of fast recovery prematurely. Default in Linux until 2006.

**Vegas (1995)** — proactive instead of reactive: monitor RTT directly, slow down when RTT starts climbing (signalling congestion before loss). Brilliant in a homogeneous network, terrible mixed with Reno (it always loses to a more aggressive flow). Never widely deployed.

**[[rfc:9438|CUBIC]] (2008, deployed Linux 2.6, now [[rfc:9438|RFC 9438]])** — replaces linear additive-increase with a cubic function of time since the last loss. Recovers throughput much faster on long fat pipes (gigabit transcontinental, etc.). Default in Linux, Windows, and macOS for over a decade.

**Compound (Microsoft, 2007)** — combined loss-based and delay-based components. Used in Windows. Withdrawn in newer versions.

**BBR (Google, 2016)** — fundamentally different: model the bottleneck bandwidth and minimum RTT directly, then send at a paced rate just below the model. Robust to the random-loss problem (where CUBIC over-reacts). Defaults for google.com and YouTube. **BBRv3** ([[frontier:bbrv3-default|currently shipping default in production]]) addresses fairness issues with v1.

**[[frontier:l4s-comcast-launch|L4S]] (2024)** — the next paradigm: use ECN as a per-packet signal so senders can ramp up smoothly without ever needing to lose a packet. Sub-millisecond queuing latency for cooperating flows. Comcast launched in production in 2025; Apple has it on by default in iOS 26.

The arc has been from "react to loss" → "react to delay" → "model the network" → "use explicit signalling." Each generation reduced the cost of being a good citizen on the internet.`
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
