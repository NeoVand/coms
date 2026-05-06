/**
 * Part IV — Transport.
 *
 * The layer that turns IP's best-effort datagrams into something
 * applications can actually use. Five chapters, one per transport
 * protocol, each grounded in the design pressure that produced it.
 */

import type { BookPart } from '../types';

export const transport: BookPart = {
	id: 'transport',
	title: 'Transport',
	label: 'IV',
	description:
		"The layer that turns IP's best-effort datagrams into something applications can actually use.",
	chapters: [
		{
			id: 'tcp',
			title: 'TCP',
			synopsis: 'Reliable byte streams, four decades of congestion control.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Reliability as a Service',
							text: `[[tcp|TCP]] is the protocol that turns the internet's best-effort datagram fabric into something a database, a web browser, or a SSH session can actually use. It establishes a **connection** between two endpoints, **numbers every byte** so receivers can detect missing data, **acknowledges** what arrives, **retransmits** what does not, and **paces** the sender so it never floods the network. Forty-five years after [[rfc:9293|RFC 793]], it is still the workhorse — over half of all internet traffic, including Netflix, banking, email, file transfer, and most APIs.

The cost of that reliability is captured by three numbers. The **handshake** adds a round-trip before any data flows. The **head-of-line blocking** stalls every byte behind a single lost segment. The **congestion control** cuts your sending rate the moment a packet is lost, even if the loss was unrelated to congestion. For most applications, the cost is invisible — the protocol does its job and gets out of the way. For latency-sensitive ones (live video, mobile web, gaming), the cost is the entire reason [[quic|QUIC]] exists.

The single most important change in TCP's history is the **1988 congestion avoidance** work by [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels — slow start, AIMD, fast retransmit, exponential backoff — that prevented the 1986 collapse from repeating. The single most important change since is **CUBIC** ([[rfc:9438|RFC 9438]], the default in Linux, Windows, and Apple stacks since the late 2000s) and **BBR** (Google, 2016, then BBRv3 in IETF draft, used for google.com and YouTube traffic). The story of TCP is the story of congestion control — everything else is plumbing.`
						},
						{
							type: 'callout',
							title: 'TCP is the protocol you do not have to think about — until you do.',
							text: 'For 99% of applications, the kernel\'s TCP defaults are right. The 1% that need to think about it (database replication, video streaming, mobile clients) need to think about it very carefully — which is why congestion control is a research field, not a checkbox.'
						}
					]
				},
				{ kind: 'protocol', id: 'tcp' },
				{ kind: 'pioneer', id: 'van-jacobson' },
				{ kind: 'rfc', number: '9293' },
				{ kind: 'rfc', number: '5681' },
				{ kind: 'rfc', number: '9438' },
				{ kind: 'outage', id: 'sack-panic-2019' },
				{ kind: 'simulation', protocolId: 'tcp' }
			]
		},
		{
			id: 'udp',
			title: 'UDP',
			synopsis: 'Three pages of RFC, no guarantees, ubiquitous.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Unopinionated Datagram',
							text: `[[udp|UDP]] is what you get when you take [[ip|IP]] and add the bare minimum needed to reach an application: a 16-bit **source port**, a 16-bit **destination port**, a length, and a checksum. Eight bytes of header, no connection setup, no acknowledgements, no retransmission, no congestion control, no ordering. The application gets a "fire and pray" datagram service — and if it wants reliability, it implements reliability itself.

[[rfc:768|RFC 768]] is **three pages long**. It was published in August 1980 by [[pioneer:jon-postel|Jon Postel]], two months before the first version of [[rfc:9293|TCP]]. It has not been updated since. There has been nothing to update — UDP works, and the entire weight of "what does this protocol need to do?" sits with the application above it.

That minimalism is why UDP is the foundation of [[dns|DNS]] (every lookup is one datagram each way), [[ntp|NTP]] (time correction has to be precise to the microsecond, you cannot tolerate handshake delay), [[dhcp|DHCP]] (you do not have an address yet — you cannot do TCP), [[rtp|RTP]] (a dropped audio packet should be ignored, not retransmitted), and now [[quic|QUIC]] (the entire next-generation transport runs **inside** UDP datagrams to escape kernel ossification).

The single thing UDP gives you above raw IP is **ports**, which is the entire reason multiple applications can share a single host's network adapter. That is not nothing — it is most of what L4 needs to be.`
						}
					]
				},
				{ kind: 'protocol', id: 'udp' },
				{ kind: 'rfc', number: '768' },
				{ kind: 'pioneer', id: 'jon-postel' },
				{ kind: 'simulation', protocolId: 'udp' }
			]
		},
		{
			id: 'sctp',
			title: 'SCTP',
			synopsis: 'Multi-stream, multi-homed — niche but architecturally important.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Better TCP That Lost the Deployment War',
							text: `In the late 1990s, the SS7 telephony signalling protocol was being moved onto IP. The PSTN's reliability requirements (sub-second failover when a link dies) embarrassed [[tcp|TCP]] — a TCP connection bound to a single source/destination pair will hang indefinitely when its path fails, regardless of whether other paths to the same endpoint are working. Randall Stewart at Cisco, working with the IETF SIGTRAN group, designed a replacement.

[[sctp|SCTP]] (Stream Control Transmission Protocol, RFC 2960 in 2000, current RFC 9260 in 2022) was [[tcp|TCP]] redesigned with three improvements. **Multi-streaming**: a single SCTP association carries multiple independent streams that do not block each other on loss — exactly the head-of-line blocking fix [[quic|QUIC]] would later adopt. **Multi-homing**: an association can be bound to multiple IP addresses on each side, and traffic seamlessly moves to a healthy path when one fails. **Message-orientation**: data is delivered as discrete messages, not a stream of bytes that the application has to re-frame.

It is, on paper, the better protocol. It powers SS7-over-IP and Diameter (the LTE/5G signalling stack) and a few specialised use cases. But it failed to displace TCP for general use because **NAT and firewall middleboxes do not understand it**. A SCTP packet between Internet endpoints is dropped almost immediately. The protocol is technically right and operationally invisible.

The lesson SCTP teaches is the lesson [[quic|QUIC]] applied: if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]]. SCTP did not, and was confined to controlled networks. QUIC did, and is rapidly becoming the default.`
						}
					]
				},
				{ kind: 'protocol', id: 'sctp' },
				{ kind: 'simulation', protocolId: 'sctp' }
			]
		},
		{
			id: 'mptcp',
			title: 'MPTCP',
			synopsis: 'Wi-Fi + cellular at the same time, transparently.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Two Paths, One Connection',
							text: `Your phone has two radios. Wi-Fi is fast and free; cellular is everywhere. The naive approach — pick one, fall back to the other if it fails — wastes capacity and visibly stutters the moment you walk out of range of your home router. What if a single connection could use both at the same time?

That is the [[mptcp|Multipath TCP]] proposition. MPTCP (RFC 8684, 2020) presents a normal TCP socket to applications, but underneath it negotiates **subflows** over multiple paths and aggregates their throughput. Sequence numbers and ACKs are coordinated at the MPTCP layer; congestion control runs per subflow but is coupled to prevent over-allocating to the better path.

Apple shipped MPTCP in **iOS 7 (2013)** for Siri, where the half-second handoff between Wi-Fi and cellular was visibly degrading user experience. Linux merged the upstream MPTCP implementation in kernel 5.6 (2020). South Korea's Korea Telecom built a "GIGA Path" service that used MPTCP to bond LTE and Wi-Fi for 1 Gbps mobile downloads.

Adoption is real but limited. The same NAT/firewall friction that confines [[sctp|SCTP]] hits MPTCP — many middleboxes strip the MPTCP option from the SYN, falling the connection back to plain TCP. The future is multipath [[quic|QUIC]] ([[frontier:multipath-quic|currently in IETF working group]]), which inherits MPTCP's algorithmic ideas inside QUIC's much more deployable carrier.`
						}
					]
				},
				{ kind: 'protocol', id: 'mptcp' },
				{ kind: 'frontier', id: 'multipath-quic' },
				{ kind: 'simulation', protocolId: 'mptcp' }
			]
		},
		{
			id: 'quic',
			title: 'QUIC',
			synopsis: 'Reliable transport in user space, on UDP, with TLS folded in.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'QUIC is the first new transport to actually displace TCP at scale. It did so by accepting that the kernel cannot ship transport changes faster than once a decade.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Transport That Can Ship Updates',
							text: `[[quic|QUIC]] is a complete redesign of the reliable-transport layer that solves four problems at once.

**Head-of-line blocking** in [[tcp|TCP]] means a single lost segment stalls every byte behind it. QUIC carries multiple **streams** in a single connection, with independent sequence numbers per stream — a lost packet on stream 7 does not block delivery on streams 1-6.

**Connection setup** in TCP+TLS takes 2-3 round-trips. QUIC folds the [[tls|TLS 1.3]] handshake into the QUIC handshake, achieving **1-RTT setup for new connections and 0-RTT for resumptions** — important when a typical mobile request is bottlenecked by latency, not bandwidth.

**Network change** (your phone moving between Wi-Fi and cellular) breaks TCP because the connection is bound to a 4-tuple of (src IP, src port, dst IP, dst port) — change any element and the connection is gone. QUIC uses a **64-bit connection ID** that is independent of the underlying IP/UDP, so a connection survives an address change.

And the deepest improvement is **deployability**. QUIC runs over [[udp|UDP]], which middleboxes already forward unchanged. Implementations live in **user space**, so an application can ship a transport bug fix in a binary update — no kernel reboot, no waiting for an OS release. Google could deploy QUIC features for chrome.com on a weekly cadence; with TCP they would have waited five years per change.

[[rfc:9000|RFC 9000]] standardised QUIC v1 in May 2021. By 2025, QUIC carries 35% of all websites and over 75% of Meta's internet traffic. It is also the substrate for [[http3|HTTP/3]], future [[frontier:moq-transport|MoQ live streaming]], [[frontier:multipath-quic|multipath QUIC]], and the [[mcp|MCP]] streaming transport.`
						}
					]
				},
				{ kind: 'protocol', id: 'quic' },
				{ kind: 'pioneer', id: 'jim-roskind' },
				{ kind: 'pioneer', id: 'mike-belshe' },
				{ kind: 'rfc', number: '9000' },
				{ kind: 'frontier', id: 'multipath-quic' },
				{
					kind: 'comparison',
					pairIds: ['tcp', 'quic']
				},
				{ kind: 'simulation', protocolId: 'quic' }
			]
		}
	]
};
