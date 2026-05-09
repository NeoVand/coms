/**
 * Part IV — Transport.
 *
 * The layer that turns IP's best-effort datagrams into something
 * applications can actually use. Five chapters, each with multiple
 * narrative sections covering history, mechanics, and 2024-2026
 * deployment from the per-protocol research files in /research.
 */

import type { BookPart } from '../types';

export const transport: BookPart = {
	id: 'transport',
	title: 'Transport',
	label: 'IV',
	description:
		"The layer that turns IP's best-effort datagrams into something applications can actually use.",
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'tcp',
			title: 'TCP',
			synopsis: 'Reliable byte streams, four decades of congestion control.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[rfc:793|RFC 793]] was the canonical [[tcp|TCP]] specification for 41 years — almost certainly the longest unmodified IETF spec ever. [[rfc:9293|RFC 9293]] finally consolidated 13 errata documents in August 2022.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Reliability as a Service',
							text: `[[tcp|TCP]] is the protocol that turns the internet's best-effort datagram fabric into something a database, a web browser, or an SSH session can actually use. It establishes a **connection** between two endpoints, **numbers every byte** so receivers can detect missing data, **acknowledges** what arrives, **retransmits** what does not, and **paces** the sender so it never floods the network.

Forty-five years after [[rfc:9293|RFC 793]] (September 1981), TCP is still the workhorse — over half of all internet traffic, including most banking, file transfer, email, database protocols, and the ~51% of HTTP that still runs over HTTP/1.1 or HTTP/2. The stability of the wire format is one of the great quiet achievements of computing: a TCP segment captured in 1985 and a TCP segment captured today differ only in the values of the optional fields.`
						},
						{
							type: 'narrative',
							title: 'Three Costs You Pay for Reliability',
							text: `The cost of TCP's reliability is captured by three numbers.

**The handshake** adds a round-trip before any data flows. SYN → SYN-ACK → ACK is one full RTT of delay between client and server before the first byte of payload is allowed to move. On a transcontinental link with 100 ms RTT, that is 100 ms of latency built into every new connection. TLS 1.2 added another 1-2 RTTs for crypto setup; TLS 1.3 cut it to one. The accumulated round-trips are the entire reason [[quic|QUIC]] folded crypto setup into the transport handshake.

**Head-of-line blocking** stalls every byte behind a single lost segment. Multiplexed application protocols ([[http2|HTTP/2]], gRPC over HTTP/2) feel this most acutely — one dropped TCP packet stalls all streams on the connection until retransmission. Unmultiplexed protocols (HTTP/1.1, SSH terminal sessions) feel it less because there is only one logical stream to stall.

**Congestion control** cuts your sending rate the moment a packet is lost, even if the loss was unrelated to congestion. On wireless networks where packets drop from radio interference rather than queue overflow, classic TCP overreacts — which is why **BBR** (Google, 2016) modelled the network instead of inferring from loss, and why **L4S** ([[frontier:l4s-comcast-launch|RFC 9330/31/32]], 2023) replaced loss with explicit ECN signalling for cooperating flows.`
						},
						{
							type: 'callout',
							title: 'Three pre-existing security incidents from the 1990s',
							text: '**[[tcp|TCP]] sequence-prediction (Mitnick 1994)** exploited predictable initial {{sequence-number|sequence numbers}} from BSD\'s linear ISN counter. [[rfc:1948|RFC 1948]] (1996) replaced it with a cryptographically-hashed function of the four-tuple. **SYN floods (mid-1990s)** exhausted server connection tables before {{syn-cookies|SYN cookies}} (Bernstein, [[rfc:4987|RFC 4987]]) made them {{stateless|stateless}}. **Smurf attacks (1997)** abused IP {{broadcast|broadcast}} to amplify {{tcp-rst|TCP RST}} floods. Modern stacks defeat all three; the design lessons are baked into [[rfc:9293|RFC 9293]]\'s security considerations.'
						},
						{
							type: 'narrative',
							title: 'Congestion Control: Tahoe Through BBR Through L4S',
							text: `The single most important change in TCP's history is the **1988 congestion avoidance** work by [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels — slow start, AIMD, fast retransmit, exponential backoff — that prevented the [[outage:nsfnet-1986-collapse|1986 collapse]] from repeating. The single most important change since is **CUBIC** ([[rfc:9438|RFC 9438]], default in Linux/Windows/Apple stacks since the late 2000s) and **BBR** (Google, 2016, [[frontier:bbrv3-default|now BBRv3]] for google.com and YouTube traffic).

The story of TCP, more than any other transport, is the story of congestion control. Everything else — flow control, error recovery, connection state — settled by 1988. The active research has moved through Reno, NewReno, Vegas, CUBIC, Compound, BBR v1/v2/v3, and now [[frontier:l4s-comcast-launch|L4S]] with TCP Prague. Each generation refined the inference about network state from increasingly sparse signals.

The most recent paradigm shift: L4S replaces loss-as-signal with **explicit ECN marking**. Cooperating senders mark packets ECT(1); routers put them in a separate isolated queue and mark Congestion Experienced *early*, before the queue grows. The result is sub-millisecond queuing latency at full link utilisation. **Comcast launched L4S in production January 2025**; Apple iOS 17 / macOS Sonoma defaulted L4S support for QUIC.`
						},
						{
							type: 'narrative',
							title: 'What Shipped in 2024-2026',
							text: `**Linux 6.7 (January 2024)** merged native **TCP-AO ([[rfc:9000|RFC 5925]])** — five thousand lines of new networking code finally giving Linux a modern replacement for the deprecated TCP-MD5 used by [[bgp|BGP]] and LDP. The same release added microsecond-resolution TCP timestamps.

**AccECN** (\`draft-ietf-tcpm-accurate-ecn-34\`, March 2025) is on the Standards Track path. It reallocates the old ECN-Nonce bit to deliver more than one congestion signal per RTT — the precondition L4S over TCP needs for fine-grained congestion response.

**Linux 6.15 (mid-2025)** landed **io_uring zero-copy receive** (\`io_uring zcrx\`) integrated with the kernel TCP stack. Single-flow throughput jumped from ~74 Gb/s (epoll) to **~106 Gb/s (io_uring zcrx)** — a ~40% throughput improvement for high-bandwidth servers without any application changes.

The vulnerability surface keeps producing CVEs. **CVE-2019-11477 (SACK Panic)** was the canonical case — a single TCP packet, no authentication, would crash any vulnerable Linux host across kernels 2.6.29 through 5.1, ten years of unpatched code in the heart of every Linux server. Modern kernel networking is now fuzzed continuously by **syzkaller**; most TCP CVEs since 2020 have been found by fuzzing rather than by humans.`
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

		// ────────────────────────────────────────────────────────────
		{
			id: 'udp',
			title: 'UDP',
			synopsis: 'Three pages of RFC, no guarantees, ubiquitous.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[rfc:768|RFC 768]] is three pages long. [[pioneer:jon-postel|Jon Postel]] wrote it in August 1980, two months before the first version of [[tcp|TCP]]. It has not been updated since. There has been nothing to update.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Unopinionated Datagram',
							text: `[[udp|UDP]] is what you get when you take [[ip|IP]] and add the bare minimum needed to reach an application: a 16-bit **source port**, a 16-bit **destination port**, a length, and a checksum. **Eight bytes of header**, no connection setup, no acknowledgements, no retransmission, no congestion control, no ordering. The application gets a "fire and pray" datagram service — and if it wants reliability, it implements reliability itself.

[[rfc:768|RFC 768]] is **three pages long**. It was published in August 1980 by [[pioneer:jon-postel|Jon Postel]], two months before the first version of [[tcp|TCP]] (RFC 793, September 1981). It has not been updated since. There has been nothing to update — UDP works, and the entire weight of "what does this protocol need to do?" sits with the application above it.`
						},
						{
							type: 'narrative',
							title: 'Why Half the Internet Runs On It',
							text: `That minimalism is why UDP is the foundation of:

- **[[dns|DNS]]** — every lookup is one datagram each way. ~14 trillion queries per day on Google Public DNS alone. The persistent connection model TCP gives you is overhead a recursive resolver does not need; the connection per query model UDP gives you scales to root-server volumes.
- **[[ntp|NTP]]** — time correction has to be precise to the microsecond. You cannot tolerate handshake delay; you cannot tolerate retransmission timing variance. UDP delivers a packet in a few milliseconds and lets the protocol math figure out clock offset from RTT.
- **[[dhcp|DHCP]]** — you do not have an IP address yet. You cannot do TCP. UDP broadcast is the only way a host without an address can ask the network for one.
- **[[rtp|RTP]]** — a dropped audio packet should be ignored, not retransmitted. Late audio is worse than missing audio.
- **[[quic|QUIC]]** — the entire next-generation transport runs *inside* UDP datagrams to escape kernel ossification. By 2026, QUIC carries ~21% of Cloudflare-observed web traffic and >75% of Meta's internet bytes. UDP's role as the QUIC substrate has made it the fastest-growing protocol on the internet by relative volume.

The single thing UDP gives you above raw IP is **ports** — the 16-bit demux that picks which application receives the packet on a given host. That is the entire reason multiple applications can share a host's network adapter. It is most of what L4 needs to be.`
						},
						{
							type: 'callout',
							title: 'NAT pinholes are a UDP-specific concern',
							text: 'A NAT router opens a "pinhole" for outbound [[udp|UDP]] keyed by (src IP, src port). The pinhole closes after a few minutes of silence. For long-lived [[udp|UDP]] applications — VoIP, IoT keepalives, [[quic|QUIC]] connections that have gone idle — you must send a keepalive every 30-60 seconds to keep the pinhole open, or the next inbound packet will be dropped at the NAT. This is one of the reasons [[webrtc|WebRTC]] and [[sip|SIP]] both have explicit keepalive timers despite their underlying transports having no need for them.'
						},
						{
							type: 'narrative',
							title: 'The QUIC Renaissance',
							text: `Almost all internet UDP traffic growth in the last five years has been [[quic|QUIC]]. Where UDP used to be a niche transport (DNS, NTP, RTP), it now carries the majority of HTTP/3 traffic plus the entire next generation of media transports — [[frontier:moq-transport|MoQ Transport]] over QUIC, RTP-over-QUIC (\`draft-ietf-avtcore-rtp-over-quic-14\` in WG Last Call July 2025), HTTP/3 datagrams (RFC 9297), MASQUE (RFCs 9298/9484).

**Linux 6.13 (early 2025)** landed **io_uring zero-copy send/receive paths for UDP**, dramatically improving QUIC server performance. The kernel-vs-userspace performance gap — the basis of the 2024 ACM paper showing 45% throughput regressions for QUIC over fast networks — is being closed.

The longer arc: **in-kernel QUIC** (Xin Long's 9,000-line patch series, July 2025) puts QUIC into the kernel as \`IPPROTO_QUIC\`, mirroring \`IPPROTO_MPTCP\`. Mainline merge expected 2026. When that ships, QUIC will run alongside TCP at kernel speeds — and UDP will become an even larger share of the internet's transport mix.

The protocol itself has not changed. The role it plays has been reshaped by what was built on top of it.`
						}
					]
				},
				{ kind: 'protocol', id: 'udp' },
				{ kind: 'rfc', number: '768' },
				{ kind: 'pioneer', id: 'jon-postel' },
				{ kind: 'simulation', protocolId: 'udp' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'sctp',
			title: 'SCTP',
			synopsis: 'Multi-stream, multi-homed — niche but architecturally important.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[sctp|SCTP]] is the better TCP that lost the deployment war. The lesson it teaches is the lesson [[quic|QUIC]] applied: if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]].',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Protocol Born From Telephony',
							text: `In the late 1990s, the **SS7 telephony signalling protocol** was being moved onto IP. The PSTN's reliability requirements — sub-second failover when a link dies — embarrassed [[tcp|TCP]]. A TCP connection bound to a single source/destination pair will hang indefinitely when its path fails, regardless of whether other paths to the same endpoint are working. **Randall Stewart at Cisco**, working with the IETF SIGTRAN group, designed a replacement.

[[sctp|SCTP]] (Stream Control Transmission Protocol, RFC 2960 in October 2000, current RFC 9260 in June 2022) was [[tcp|TCP]] redesigned with three improvements:

**Multi-streaming** — a single SCTP association carries multiple independent streams that do not block each other on loss. This is the head-of-line-blocking fix [[quic|QUIC]] would later adopt.

**Multi-homing** — an association can be bound to multiple IP addresses on each side, and traffic seamlessly moves to a healthy path when one fails. [[mptcp|MPTCP]] would later approximate this for TCP.

**Message-orientation** — data is delivered as discrete messages, not a stream of bytes that the application has to re-frame. The application's send is the application's recv on the other side.`
						},
						{
							type: 'narrative',
							title: 'Why It Failed Deployment',
							text: `SCTP is, on paper, the better protocol. It powers SS7-over-IP and **Diameter** (the LTE/5G signalling stack) and a few specialised use cases. But it failed to displace [[tcp|TCP]] for general use because **NAT and firewall middleboxes do not understand it**.

A SCTP packet between Internet endpoints is dropped almost immediately. Home routers, corporate firewalls, mobile carriers, and most cloud load balancers either silently discard SCTP or have explicit rules treating non-TCP/UDP traffic as suspicious. The protocol is technically right and operationally invisible.

The deeper lesson SCTP teaches is the lesson [[quic|QUIC]] applied: **if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]]**. SCTP did not, and was confined to controlled networks. QUIC did, and is rapidly becoming the default. Multipath QUIC ([[frontier:multipath-quic|IETF Last Call December 2025]]) brings SCTP-style multi-homing into a transport that actually traverses middleboxes.`
						},
						{
							type: 'callout',
							title: 'WebRTC Data Channels are SCTP under the hood',
							text: 'There is one place [[sctp|SCTP]] runs successfully on the open internet: **[[webrtc|WebRTC]] Data Channels**. [[rfc:8831|RFC 8831]] defines the data channel as **[[sctp|SCTP]] over DTLS over UDP** — the SCTP-over-something-else trick [[quic|QUIC]] would later generalise. The browser implementations (libwebrtc, Firefox\'s networking stack) carry an SCTP stack in user space. [[webrtc|WebRTC]] is the largest production SCTP deployment by message count, even though almost nobody knows it.'
						},
						{
							type: 'narrative',
							title: 'What Survived',
							text: `Most of SCTP's good ideas survived through descendants. Multi-streaming and connection migration are core to [[quic|QUIC]]. Multi-homing is what [[mptcp|MPTCP]] approximates for TCP and what [[frontier:multipath-quic|multipath QUIC]] is generalising. Message-orientation is the default in modern application protocols (HTTP/2 and HTTP/3 frame the bytes; gRPC adds length prefixes; WebSocket has explicit message boundaries).

The protocol itself remains specialised. It is the canonical example of a technically-superior transport that lost on deployment economics — and the canonical justification for QUIC's choice to tunnel inside UDP. Knowing why SCTP failed makes every modern transport-design decision clearer.`
						}
					]
				},
				{ kind: 'protocol', id: 'sctp' },
				{ kind: 'simulation', protocolId: 'sctp' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'mptcp',
			title: 'MPTCP',
			synopsis: 'Wi-Fi + cellular at the same time, transparently.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Apple shipped [[mptcp|MPTCP]] in iOS 7 (2013) for Siri because the half-second handoff between Wi-Fi and cellular was visibly degrading user experience. Twelve years later, the same multipath idea is moving to [[quic|QUIC]].',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Two Paths, One Connection',
							text: `Your phone has two radios. **Wi-Fi** is fast and free; **cellular** is everywhere. The naive approach — pick one, fall back to the other if it fails — wastes capacity and visibly stutters the moment you walk out of range of your home router. What if a single connection could use both at the same time?

That is the [[mptcp|Multipath TCP]] proposition. **MPTCP** (RFC 6824 in January 2013, current RFC 8684 in March 2020) presents a normal [[tcp|TCP]] socket to applications, but underneath it negotiates **subflows** over multiple paths and aggregates their throughput. Sequence numbers and ACKs are coordinated at the MPTCP layer; congestion control runs per subflow but is coupled (RFC 6356, "LIA" — Linked Increases Algorithm) to prevent over-allocating capacity to the better path.

The application has no idea any of this is happening. The socket interface is identical to a regular TCP socket. The kernel does the multipath bookkeeping; the wire format uses TCP options that legacy middleboxes mostly forward unchanged.`
						},
						{
							type: 'narrative',
							title: 'The Apple iOS 7 Deployment',
							text: `**Apple shipped MPTCP in iOS 7 (September 2013)** for **Siri**. The choice was forced by user experience: Siri's voice recognition did a round-trip to Apple's servers, and the half-second handoff between Wi-Fi and cellular was producing visible "Sorry, I didn't catch that" failures during normal walking-out-of-the-house transitions. MPTCP let Siri's connection keep working through the handoff.

Apple expanded MPTCP in iOS 11 (2017) to a public API for any app, and in iOS 12+ to additional system services (Apple Maps, Apple Music). By 2026 every Apple device with both Wi-Fi and cellular uses MPTCP for the OS-managed services. Notably, Apple did **not** open up MPTCP for third-party app traffic by default — most app developers do not know they could use it.

**Linux merged the upstream MPTCP implementation in kernel 5.6 (March 2020)** after years of out-of-tree patches. **South Korea's Korea Telecom built a "GIGA Path" service** that used MPTCP to bond LTE and Wi-Fi for 1 Gbps mobile downloads — the first commercial network operator to position MPTCP as a consumer feature.`
						},
						{
							type: 'callout',
							title: 'Adoption is real but limited',
							text: 'The same {{nat|NAT}}/{{firewall|firewall}} friction that confines [[sctp|SCTP]] hits [[mptcp|MPTCP]]. Many middleboxes strip the [[mptcp|MPTCP]] option from the SYN, falling the connection back to plain TCP. Where MPTCP works (Apple OS services, Korea Telecom GIGA Path, some specialised enterprise WANs) it works well. Where it does not work (the long tail of public-internet middleboxes), it falls back transparently. The deployment story is "successful in controlled paths, invisible everywhere else."'
						},
						{
							type: 'narrative',
							title: 'The Multipath QUIC Succession',
							text: `The future of multipath transport is multipath [[quic|QUIC]] (\`draft-ietf-quic-multipath\`, [[frontier:multipath-quic|currently in IETF Last Call December 2025]]). Latest draft -21 dated 17 March 2026.

Multipath QUIC inherits MPTCP's algorithmic ideas — subflows, coupled congestion control, packet scheduling across paths — but operates inside QUIC's much more deployable carrier (UDP). Where MPTCP had to fight middleboxes that didn't understand TCP options, multipath QUIC encrypts everything except a handful of public bits inside the UDP envelope. Middleboxes see UDP; the multipath logic is invisible.

**Apple, Alibaba, and Tessares have already deployed predecessors** (gQUIC multipath at Google, Apple's iCloud sync, Alibaba's mobile e-commerce). Once multipath QUIC ships in mainline implementations (quiche, mvfst, quinn, msquic), it becomes the natural multipath transport for HTTP/3.

MPTCP itself will remain in production for the use cases it currently serves. But the architectural arc — same idea, ported to a more deployable transport — is the same arc QUIC followed for everything else.`
						}
					]
				},
				{ kind: 'protocol', id: 'mptcp' },
				{ kind: 'frontier', id: 'multipath-quic' },
				{ kind: 'simulation', protocolId: 'mptcp' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'quic',
			title: 'QUIC',
			synopsis: 'Reliable transport in user space, on UDP, with [[tls|TLS]] folded in.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'QUIC is the first new transport to actually displace TCP at scale. It did so by accepting that the kernel cannot ship transport changes faster than once a decade — and by tunnelling inside UDP.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Transport That Can Ship Updates',
							text: `[[quic|QUIC]] began as **gQUIC** at Google in 2012, written by [[pioneer:jim-roskind|Jim Roskind]] to address a specific frustration: every TCP improvement Google wanted to deploy had to wait years for kernel rollout across the heterogeneous internet, and many were stripped or blocked by middleboxes that had ossified on the existing wire format.

The IETF QUIC Working Group, formed in 2016, took Google's experiment and modularised it. **[[rfc:9000|RFC 9000]]** standardised QUIC v1 in May 2021. **[[rfc:9114|RFC 9114]]** defined HTTP/3 as HTTP semantics on top of QUIC, published one year later. **QUIC v2 (RFC 9369, May 2023)** is now a Standards-Track template for new QUIC versions; its wire-image version number is **0x6b3343cf** — the first 4 bytes of \`sha256("QUICv2 version number")\` — chosen specifically to exercise version negotiation and break middleboxes that ossified on v1's Initial-packet salt.

QUIC solves four problems at once.`
						},
						{
							type: 'narrative',
							title: 'Four Problems Solved',
							text: `**Head-of-line blocking** in [[tcp|TCP]] means a single lost segment stalls every byte behind it. QUIC carries multiple **streams** in a single connection, with independent sequence numbers per stream — a lost packet on stream 7 does not block delivery on streams 1-6. The fix that [[http2|HTTP/2]] could not provide because HTTP/2 inherited TCP's stream model.

**Connection setup** in TCP+TLS takes 2-3 round-trips. QUIC folds the [[tls|TLS 1.3]] handshake into the QUIC handshake, achieving **1-RTT setup for new connections and 0-RTT for resumptions**. Critical when a typical mobile request is bottlenecked by latency, not bandwidth — every round-trip eliminated is real user-visible improvement.

**Network change** (your phone moving between Wi-Fi and cellular) breaks TCP because the connection is bound to a 4-tuple of (src IP, src port, dst IP, dst port) — change any element and the connection is gone. QUIC uses a **64-bit connection ID** that is independent of the underlying IP/UDP. The receiver matches arriving packets by connection ID; an address change is invisible to the application.

**Deployability** is the deepest improvement. QUIC runs over [[udp|UDP]], which middleboxes already forward unchanged. Implementations live in **user space**, so an application can ship a transport bug fix in a binary update — no kernel reboot, no waiting for an OS release. Google could deploy QUIC features for chrome.com on a weekly cadence; with TCP they would have waited five years per change.`
						},
						{
							type: 'callout',
							title: 'The 21% plateau and the in-kernel push',
							text: 'As of Q1 2026, QUIC carries roughly **21% of Cloudflare-observed web requests** — flat or slightly declining for several months. The plateau correlates with the **2024 ACM Web Conference paper "QUIC is not Quick Enough over Fast Internet"** (Zhang et al., doi:10.1145/3589334.3645323) showing **up-to-45.2% throughput regressions** vs [[http2|HTTP/2]] above ~500 Mbps, due to receiver-side userspace ACK and copy overhead. The fix in flight is **in-kernel QUIC** — Xin Long\'s ~9,000-line patch series for Linux landed July 2025; mainline merge expected 2026. When in-kernel QUIC ships, the throughput gap with kernel TCP closes.'
						},
						{
							type: 'narrative',
							title: 'What\'s On the Frontier',
							text: `The next ten years of transport innovation are all riding on QUIC.

**[[frontier:multipath-quic|Multipath QUIC]]** (\`draft-ietf-quic-multipath\`) entered IESG Last Call in December 2025. Inherits MPTCP's algorithmic ideas inside a transport that actually traverses middleboxes.

**HTTP Datagrams and Capsules** ([[rfc:9000|RFC 9297]], August 2022) standardised unreliable datagrams over HTTP/3, enabling MASQUE and WebTransport.

**MASQUE WG** (RFC 9298 — Proxying UDP in HTTP, August 2022; RFC 9484 — Proxying IP in HTTP, October 2023) ships CONNECT-UDP and CONNECT-IP. Apple Private Relay and Cloudflare's WARP-related proxy services use these.

**[[frontier:moq-transport|MoQ Transport]]** (\`draft-ietf-moq-transport-17\`, March 2026) is the first IETF media transport that intentionally is not RTP — sub-second live streaming with one-to-many publish/subscribe at CDN scale.

**RTP-over-QUIC (RoQ)** (\`draft-ietf-avtcore-rtp-over-quic-14\`) entered Working Group Last Call in July 2025 — preserves the entire RTP ecosystem while gaining QUIC's encryption, NAT-friendliness, and 0-RTT.

By 2026, **Meta reports >75% of internet-facing traffic on QUIC**; **Cloudflare** serves QUIC universally; **Apple Network.framework** offers native QUIC since iOS 18; **Safari 18** enables HTTP/3 by default. The transport reshaped its deployment ecosystem in five years.`
						}
					]
				},
				{ kind: 'protocol', id: 'quic' },
				{ kind: 'pioneer', id: 'jim-roskind' },
				{ kind: 'pioneer', id: 'mike-belshe' },
				{ kind: 'rfc', number: '9000' },
				{ kind: 'frontier', id: 'multipath-quic' },
				{ kind: 'comparison', pairIds: ['tcp', 'quic'] },
				{ kind: 'simulation', protocolId: 'quic' }
			]
		}
	]
};
