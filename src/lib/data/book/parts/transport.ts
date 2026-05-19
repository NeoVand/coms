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
		"The layer that turns [[ip|IP]]'s best-effort datagrams into something applications can actually use.",
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'tcp',
			title: 'TCP',
			synopsis: '[[tcp|Reliable byte streams]], four decades of {{congestion-control|congestion control}}.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[rfc:793|RFC 793]] was the canonical [[tcp|TCP]] specification for 41 years — almost certainly the longest unmodified {{ietf|IETF}} spec ever. [[rfc:9293|RFC 9293]] finally consolidated 13 errata documents in August 2022.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Reliability as a Service',
							text: `[[tcp|TCP]] is the protocol that turns the internet's best-effort datagram fabric into something a database, a web browser, or an [[ssh|SSH]] session can actually use. It establishes a **connection** between two endpoints, **numbers every byte** so receivers can detect missing data, **acknowledges** what arrives, **retransmits** what does not, and **paces** the sender so it never floods the network.

Forty-five years after [[rfc:9293|RFC 793]] (September 1981), [[tcp|TCP]] is still the workhorse — over half of all internet traffic, including most banking, file transfer, email, database protocols, and the ~51% of HTTP that still runs over [[http1|HTTP/1.1]] or [[http2|HTTP/2]]. The stability of the wire format is one of the great quiet achievements of computing: a [[tcp|TCP]] segment captured in 1985 and a [[tcp|TCP]] segment captured today differ only in the values of the optional fields.`
						},
						{
							type: 'narrative',
							title: 'Three Costs You Pay for Reliability',
							text: `The cost of [[tcp|TCP]]'s reliability is captured by three numbers.

**The {{handshake|handshake}}** adds a round-trip before any data flows. SYN → SYN-{{ack|ACK}} → {{ack|ACK}} is one full {{rtt|RTT}} of delay between client and server before the first byte of {{payload|payload}} is allowed to move. On a transcontinental link with 100 ms {{rtt|RTT}}, that is 100 ms of {{latency|latency}} built into every new connection. [[tls|TLS]] 1.2 added another 1-2 RTTs for crypto setup; [[tls|TLS]] 1.3 cut it to one. The accumulated round-trips are the entire reason [[quic|QUIC]] folded crypto setup into the transport {{handshake|handshake}}.

**{{head-of-line-blocking|Head-of-line blocking}}** stalls every byte behind a single lost segment. Multiplexed application protocols ([[http2|HTTP/2]], [[grpc|gRPC]] over [[http2|HTTP/2]]) feel this most acutely — one dropped [[tcp|TCP]] packet stalls all streams on the connection until {{retransmission|retransmission}}. Unmultiplexed protocols ([[http1|HTTP/1.1]], [[ssh|SSH]] terminal sessions) feel it less because there is only one logical stream to stall.

**{{congestion-control|Congestion control}}** cuts your sending rate the moment a packet is lost, even if the loss was unrelated to congestion. On wireless networks where packets drop from radio interference rather than queue overflow, classic [[tcp|TCP]] overreacts — which is why **{{bbr|BBR}}** ({{google|Google}}, 2016) modelled the network instead of inferring from loss, and why **{{l4s|L4S}}** ([[frontier:l4s-comcast-launch|RFC 9330/31/32]], 2023) replaced loss with explicit {{ecn|ECN}} signalling for cooperating flows.`
						},
						{
							type: 'callout',
							title: 'Three pre-existing security incidents from the 1990s',
							text: '**[[tcp|TCP]] sequence-prediction (Mitnick 1994)** exploited predictable initial {{sequence-number|sequence numbers}} from BSD\'s linear ISN counter. [[rfc:1948|RFC 1948]] (1996) replaced it with a cryptographically-hashed function of the four-tuple. **SYN floods (mid-1990s)** exhausted server connection tables before {{syn-cookies|SYN cookies}} (Bernstein, [[rfc:4987|RFC 4987]]) made them {{stateless|stateless}}. **Smurf attacks (1997)** abused [[ip|IP]] {{broadcast|broadcast}} to amplify {{tcp-rst|TCP RST}} floods. Modern stacks defeat all three; the design lessons are baked into [[rfc:9293|RFC 9293]]\'s security considerations.'
						},
						{
							type: 'narrative',
							title: 'Congestion Control: Tahoe Through BBR Through L4S',
							text: `The single most important change in [[tcp|TCP]]'s history is the **1988 {{congestion-avoidance|congestion avoidance}}** work by [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels — {{slow-start|slow start}}, {{aimd|AIMD}}, fast retransmit, {{exponential-backoff|exponential backoff}} — that prevented the [[outage:nsfnet-1986-collapse|1986 collapse]] from repeating. The single most important change since is **{{cubic|CUBIC}}** ([[rfc:9438|RFC 9438]], default in {{linux|Linux}}/Windows/{{apple|Apple}} stacks since the late 2000s) and **{{bbr|BBR}}** ({{google|Google}}, 2016, [[frontier:bbrv3-default|now BBRv3]] for {{google|google}}.com and YouTube traffic).

The story of [[tcp|TCP]], more than any other transport, is the story of {{congestion-control|congestion control}}. Everything else — {{flow-control|flow control}}, error recovery, connection state — settled by 1988. The active research has moved through Reno, NewReno, Vegas, {{cubic|CUBIC}}, Compound, {{bbr|BBR}} v1/v2/v3, and now [[frontier:l4s-comcast-launch|L4S]] with [[tcp|TCP]] Prague. Each generation refined the inference about network state from increasingly sparse signals.

The most recent paradigm shift: {{l4s|L4S}} replaces loss-as-signal with **explicit {{ecn|ECN}} marking**. Cooperating senders mark packets ECT(1); routers put them in a separate isolated queue and mark Congestion Experienced *early*, before the queue grows. The result is sub-millisecond queuing {{latency|latency}} at full link utilisation. **Comcast launched {{l4s|L4S}} in production January 2025**; {{apple|Apple}} iOS 17 / macOS Sonoma defaulted {{l4s|L4S}} support for [[quic|QUIC]].`
						},
						{
							type: 'narrative',
							title: 'What Shipped in 2024-2026',
							text: `**{{linux|Linux}} 6.7 (January 2024)** merged native **[[tcp|TCP]]-AO ([[rfc:9000|RFC 5925]])** — five thousand lines of new networking code finally giving {{linux|Linux}} a modern replacement for the deprecated [[tcp|TCP]]-MD5 used by [[bgp|BGP]] and LDP. The same release added microsecond-resolution [[tcp|TCP]] timestamps.

**AccECN** (\`draft-{{ietf|ietf}}-tcpm-accurate-ecn-34\`, March 2025) is on the Standards Track path. It reallocates the old {{ecn|ECN}}-{{nonce|Nonce}} bit to deliver more than one congestion signal per {{rtt|RTT}} — the precondition {{l4s|L4S}} over [[tcp|TCP]] needs for fine-grained congestion response.

**{{linux|Linux}} 6.15 (mid-2025)** landed **io_uring zero-copy receive** (\`io_uring zcrx\`) integrated with the kernel [[tcp|TCP]] stack. Single-flow throughput jumped from ~74 Gb/s (epoll) to **~106 Gb/s (io_uring zcrx)** — a ~40% throughput improvement for high-{{bandwidth|bandwidth}} servers without any application changes.

The vulnerability surface keeps producing CVEs. **CVE-2019-11477 ({{sack|SACK}} Panic)** was the canonical case — a single [[tcp|TCP]] packet, no authentication, would crash any vulnerable {{linux|Linux}} host across kernels 2.6.29 through 5.1, ten years of unpatched code in the heart of every {{linux|Linux}} server. Modern kernel networking is now fuzzed continuously by **syzkaller**; most [[tcp|TCP]] CVEs since 2020 have been found by fuzzing rather than by humans.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tcp_state_diagram.svg/500px-Tcp_state_diagram.svg.png',
							alt: 'The TCP connection state machine showing all 11 states and their transitions.',
							caption:
								'The **[[tcp|TCP]] state machine** — eleven states, every arc labelled with the segment that triggers the transition and the segment sent in response. Memorise it once and every connection establishment, graceful close, simultaneous close, half-closed read, and {{time-wait|TIME_WAIT}} timer in production [[tcp|TCP]] traffic snaps into place. The diagram in [[rfc:9293|RFC 9293]] §3.3.2 has not changed since 1981.',
							credit: 'Image: Wikimedia Commons / public domain'
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
			synopsis: '[[udp|Three pages of RFC]], no guarantees, ubiquitous — and the substrate beneath [[quic|QUIC]].',
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
							text: `[[udp|UDP]] is what you get when you take [[ip|IP]] and add the bare minimum needed to reach an application: a 16-bit **source port**, a 16-bit **destination port**, a length, and a {{checksum|checksum}}. **Eight bytes of header**, no connection setup, no acknowledgements, no {{retransmission|retransmission}}, no {{congestion-control|congestion control}}, no ordering. The application gets a "fire and pray" datagram service — and if it wants reliability, it implements reliability itself.

[[rfc:768|RFC 768]] is **three pages long**. It was published in August 1980 by [[pioneer:jon-postel|Jon Postel]], two months before the first version of [[tcp|TCP]] ([[rfc:793|RFC 793]], September 1981). It has not been updated since. There has been nothing to update — [[udp|UDP]] works, and the entire weight of "what does this protocol need to do?" sits with the application above it.`
						},
						{
							type: 'narrative',
							title: 'Why Half the Internet Runs On It',
							text: `That minimalism is why [[udp|UDP]] is the foundation of:

- **[[dns|DNS]]** — every lookup is one datagram each way. ~14 trillion queries per day on {{google|Google}} Public [[dns|DNS]] alone. The persistent connection model [[tcp|TCP]] gives you is overhead a {{recursive-resolver|recursive resolver}} does not need; the connection per query model [[udp|UDP]] gives you scales to root-server volumes.
- **[[ntp|NTP]]** — time correction has to be precise to the microsecond. You cannot tolerate {{handshake|handshake}} delay; you cannot tolerate {{retransmission|retransmission}} timing variance. [[udp|UDP]] delivers a packet in a few milliseconds and lets the protocol math figure out clock {{offset|offset}} from {{rtt|RTT}}.
- **[[dhcp|DHCP]]** — you do not have an {{ip-address|IP address}} yet. You cannot do [[tcp|TCP]]. [[udp|UDP]] {{broadcast|broadcast}} is the only way a host without an address can ask the network for one.
- **[[rtp|RTP]]** — a dropped audio packet should be ignored, not retransmitted. Late audio is worse than missing audio.
- **[[quic|QUIC]]** — the entire next-generation transport runs *inside* [[udp|UDP]] datagrams to escape kernel ossification. By 2026, [[quic|QUIC]] carries ~21% of {{cloudflare|Cloudflare}}-observed web traffic and >75% of {{meta|Meta}}'s internet bytes. [[udp|UDP]]'s role as the [[quic|QUIC]] substrate has made it the fastest-growing protocol on the internet by relative volume.

The single thing [[udp|UDP]] gives you above raw [[ip|IP]] is **ports** — the 16-bit demux that picks which application receives the packet on a given host. That is the entire reason multiple applications can share a host's network adapter. It is most of what L4 needs to be.`
						},
						{
							type: 'callout',
							title: 'NAT pinholes are a UDP-specific concern',
							text: 'A {{nat|NAT}} router opens a "pinhole" for outbound [[udp|UDP]] keyed by (src [[ip|IP]], src port). The pinhole closes after a few minutes of silence. For long-lived [[udp|UDP]] applications — {{voip|VoIP}}, IoT keepalives, [[quic|QUIC]] connections that have gone {{imap-idle|idle}} — you must send a keepalive every 30-60 seconds to keep the pinhole open, or the next inbound packet will be dropped at the {{nat|NAT}}. This is one of the reasons [[webrtc|WebRTC]] and [[sip|SIP]] both have explicit keepalive timers despite their underlying transports having no need for them.'
						},
						{
							type: 'narrative',
							title: 'The QUIC Renaissance',
							text: `Almost all internet [[udp|UDP]] traffic growth in the last five years has been [[quic|QUIC]]. Where [[udp|UDP]] used to be a niche transport ([[dns|DNS]], [[ntp|NTP]], [[rtp|RTP]]), it now carries the majority of [[http3|HTTP/3]] traffic plus the entire next generation of media transports — [[frontier:moq-transport|MoQ Transport]] over [[quic|QUIC]], [[rtp|RTP]]-over-[[quic|QUIC]] (\`draft-{{ietf|ietf}}-avtcore-rtp-over-quic-14\` in WG Last Call July 2025), [[http3|HTTP/3]] datagrams (RFC 9297), {{masque|MASQUE}} (RFCs 9298/9484).

**{{linux|Linux}} 6.13 (early 2025)** landed **io_uring zero-copy send/receive paths for [[udp|UDP]]**, dramatically improving [[quic|QUIC]] server performance. The kernel-vs-userspace performance gap — the basis of the 2024 ACM paper showing 45% throughput regressions for [[quic|QUIC]] over fast networks — is being closed.

The longer arc: **in-kernel [[quic|QUIC]]** (Xin Long's 9,000-line patch series, July 2025) puts [[quic|QUIC]] into the kernel as \`IPPROTO_QUIC\`, mirroring \`IPPROTO_MPTCP\`. Mainline merge expected 2026. When that ships, [[quic|QUIC]] will run alongside [[tcp|TCP]] at kernel speeds — and [[udp|UDP]] will become an even larger share of the internet's transport mix.

The protocol itself has not changed. The role it plays has been reshaped by what was built on top of it.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/UDP_encapsulation.svg/500px-UDP_encapsulation.svg.png',
							alt: 'UDP encapsulation diagram showing an IP packet containing a UDP datagram containing application data.',
							caption:
								'**[[udp|UDP]] {{encapsulation|encapsulation}}** — 8 bytes of header (source port, destination port, length, {{checksum|checksum}}) wrapping an application {{payload|payload}}, inside an [[ip|IP]] packet, inside an [[ethernet|Ethernet]] frame. The smallest viable transport on the internet. [[rfc:768|RFC 768]] (1980) is **three pages long** and has not been updated since — there has been nothing to update.',
							credit: 'Image: Wikimedia Commons / public domain'
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
			synopsis: '[[sctp|Multi-stream, multi-homed]] — niche but architecturally important.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[sctp|SCTP]] is the better [[tcp|TCP]] that lost the deployment war. The lesson it teaches is the lesson [[quic|QUIC]] applied: if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]].',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Protocol Born From Telephony',
							text: `In the late 1990s, the **SS7 telephony signalling protocol** was being moved onto [[ip|IP]]. The PSTN's reliability requirements — sub-second {{failover|failover}} when a link dies — embarrassed [[tcp|TCP]]. A [[tcp|TCP]] connection bound to a single source/destination pair will hang indefinitely when its path fails, regardless of whether other paths to the same endpoint are working. **Randall Stewart at {{cisco|Cisco}}**, working with the {{ietf|IETF}} SIGTRAN group, designed a replacement.

[[sctp|SCTP]] (Stream Control Transmission Protocol, [[rfc:2960|RFC 2960]] in October 2000, current [[rfc:9260|RFC 9260]] in June 2022) was [[tcp|TCP]] redesigned with three improvements:

**Multi-streaming** — a single [[sctp|SCTP]] association carries multiple independent streams that do not block each other on loss. This is the head-of-line-blocking fix [[quic|QUIC]] would later adopt.

**{{multi-homing|Multi-homing}}** — an association can be bound to multiple [[ip|IP]] addresses on each side, and traffic seamlessly moves to a healthy path when one fails. [[mptcp|MPTCP]] would later approximate this for [[tcp|TCP]].

**Message-orientation** — data is delivered as discrete messages, not a stream of bytes that the application has to re-frame. The application's send is the application's recv on the other side.`
						},
						{
							type: 'narrative',
							title: 'Why It Failed Deployment',
							text: `[[sctp|SCTP]] is, on paper, the better protocol. It powers SS7-over-[[ip|IP]] and **{{diameter|Diameter}}** (the LTE/5G signalling stack) and a few specialised use cases. But it failed to displace [[tcp|TCP]] for general use because **{{nat|NAT}} and {{firewall|firewall}} middleboxes do not understand it**.

A [[sctp|SCTP]] packet between Internet endpoints is dropped almost immediately. Home routers, corporate firewalls, mobile carriers, and most cloud load balancers either silently discard [[sctp|SCTP]] or have explicit rules treating non-[[tcp|TCP]]/[[udp|UDP]] traffic as suspicious. The protocol is technically right and operationally invisible.

The deeper lesson [[sctp|SCTP]] teaches is the lesson [[quic|QUIC]] applied: **if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]]**. [[sctp|SCTP]] did not, and was confined to controlled networks. [[quic|QUIC]] did, and is rapidly becoming the default. {{multipath|Multipath}} [[quic|QUIC]] ([[frontier:multipath-quic|IETF Last Call December 2025]]) brings [[sctp|SCTP]]-style {{multi-homing|multi-homing}} into a transport that actually traverses middleboxes.`
						},
						{
							type: 'callout',
							title: 'WebRTC Data Channels are SCTP under the hood',
							text: 'There is one place [[sctp|SCTP]] runs successfully on the open internet: **[[webrtc|WebRTC]] Data Channels**. [[rfc:8831|RFC 8831]] defines the data channel as **[[sctp|SCTP]] over {{dtls|DTLS}} over [[udp|UDP]]** — the [[sctp|SCTP]]-over-something-else trick [[quic|QUIC]] would later generalise. The browser implementations (libwebrtc, Firefox\'s networking stack) carry an [[sctp|SCTP]] stack in user space. [[webrtc|WebRTC]] is the largest production [[sctp|SCTP]] deployment by message count, even though almost nobody knows it.'
						},
						{
							type: 'narrative',
							title: 'What Survived',
							text: `Most of [[sctp|SCTP]]'s good ideas survived through descendants. Multi-streaming and {{connection-migration|connection migration}} are core to [[quic|QUIC]]. {{multi-homing|Multi-homing}} is what [[mptcp|MPTCP]] approximates for [[tcp|TCP]] and what [[frontier:multipath-quic|multipath QUIC]] is generalising. Message-orientation is the default in modern application protocols ([[http2|HTTP/2]] and [[http3|HTTP/3]] frame the bytes; [[grpc|gRPC]] adds length prefixes; [[websockets|WebSocket]] has explicit message boundaries).

The protocol itself remains specialised. It is the canonical example of a technically-superior transport that lost on deployment economics — and the canonical justification for [[quic|QUIC]]'s choice to tunnel inside [[udp|UDP]]. Knowing why [[sctp|SCTP]] failed makes every modern transport-design decision clearer.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/SCTP-Multihoming.png/500px-SCTP-Multihoming.png',
							alt: 'SCTP multi-homing diagram showing one association bound to multiple IP addresses on each endpoint.',
							caption:
								'[[sctp|SCTP]] **{{multi-homing|multi-homing}}**: a single association is bound to multiple [[ip|IP]] addresses on each side, and traffic seamlessly moves to a healthy path when one fails. The architectural idea was a generation ahead of [[mptcp|MPTCP]] — [[sctp|SCTP]] just could not traverse middleboxes to make it useful on the public internet. The lesson sits underneath every later transport: *if you want a new transport on the deployed internet, you must tunnel inside [[udp|UDP]]*.',
							credit: 'Image: Wikimedia Commons / CC BY-SA'
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
			synopsis: '[[wifi|Wi-Fi]] + cellular at the same time, transparently.',
			slots: [
				{
					kind: 'pull-quote',
					text: '{{apple|Apple}} shipped [[mptcp|MPTCP]] in iOS 7 (2013) for Siri because the half-second handoff between [[wifi|Wi-Fi]] and cellular was visibly degrading user experience. Twelve years later, the same {{multipath|multipath}} idea is moving to [[quic|QUIC]].',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Two Paths, One Connection',
							text: `Your phone has two radios. **[[wifi|Wi-Fi]]** is fast and free; **cellular** is everywhere. The naive approach — pick one, fall back to the other if it fails — wastes capacity and visibly stutters the moment you walk out of range of your home router. What if a single connection could use both at the same time?

That is the [[mptcp|Multipath TCP]] proposition. **[[mptcp|MPTCP]]** ([[rfc:6824|RFC 6824]] in January 2013, current [[rfc:8684|RFC 8684]] in March 2020) presents a normal [[tcp|TCP]] socket to applications, but underneath it negotiates **subflows** over multiple paths and aggregates their throughput. Sequence numbers and ACKs are coordinated at the [[mptcp|MPTCP]] layer; {{congestion-control|congestion control}} runs per {{subflow|subflow}} but is coupled (RFC 6356, "LIA" — Linked Increases Algorithm) to prevent over-allocating capacity to the better path.

The application has no idea any of this is happening. The socket interface is identical to a regular [[tcp|TCP]] socket. The kernel does the {{multipath|multipath}} bookkeeping; the wire format uses [[tcp|TCP]] options that legacy middleboxes mostly forward unchanged.`
						},
						{
							type: 'narrative',
							title: 'The Apple iOS 7 Deployment',
							text: `**{{apple|Apple}} shipped [[mptcp|MPTCP]] in iOS 7 (September 2013)** for **Siri**. The choice was forced by user experience: Siri's voice recognition did a round-trip to {{apple|Apple}}'s servers, and the half-second handoff between [[wifi|Wi-Fi]] and cellular was producing visible "Sorry, I didn't catch that" failures during normal walking-out-of-the-house transitions. [[mptcp|MPTCP]] let Siri's connection keep working through the handoff.

{{apple|Apple}} expanded [[mptcp|MPTCP]] in iOS 11 (2017) to a public API for any app, and in iOS 12+ to additional system services ({{apple|Apple}} Maps, {{apple|Apple}} Music). By 2026 every {{apple|Apple}} device with both [[wifi|Wi-Fi]] and cellular uses [[mptcp|MPTCP]] for the OS-managed services. Notably, {{apple|Apple}} did **not** open up [[mptcp|MPTCP]] for third-party app traffic by default — most app developers do not know they could use it.

**{{linux|Linux}} merged the upstream [[mptcp|MPTCP]] implementation in kernel 5.6 (March 2020)** after years of out-of-tree patches. **South Korea's Korea Telecom built a "GIGA Path" service** that used [[mptcp|MPTCP]] to bond LTE and [[wifi|Wi-Fi]] for 1 Gbps mobile downloads — the first commercial network operator to position [[mptcp|MPTCP]] as a consumer feature.`
						},
						{
							type: 'callout',
							title: 'Adoption is real but limited',
							text: 'The same {{nat|NAT}}/{{firewall|firewall}} friction that confines [[sctp|SCTP]] hits [[mptcp|MPTCP]]. Many middleboxes strip the [[mptcp|MPTCP]] option from the SYN, falling the connection back to plain [[tcp|TCP]]. Where [[mptcp|MPTCP]] works ({{apple|Apple}} OS services, Korea Telecom GIGA Path, some specialised enterprise WANs) it works well. Where it does not work (the long tail of public-internet middleboxes), it falls back transparently. The deployment story is "successful in controlled paths, invisible everywhere else."'
						},
						{
							type: 'narrative',
							title: 'The Multipath QUIC Succession',
							text: `The future of {{multipath|multipath}} transport is {{multipath|multipath}} [[quic|QUIC]] (\`draft-{{ietf|ietf}}-quic-{{multipath|multipath}}\`, [[frontier:multipath-quic|currently in IETF Last Call December 2025]]). Latest draft -21 dated 17 March 2026.

{{multipath|Multipath}} [[quic|QUIC]] inherits [[mptcp|MPTCP]]'s algorithmic ideas — subflows, coupled {{congestion-control|congestion control}}, packet scheduling across paths — but operates inside [[quic|QUIC]]'s much more deployable carrier ([[udp|UDP]]). Where [[mptcp|MPTCP]] had to fight middleboxes that didn't understand [[tcp|TCP]] options, {{multipath|multipath}} [[quic|QUIC]] encrypts everything except a handful of public bits inside the [[udp|UDP]] envelope. Middleboxes see [[udp|UDP]]; the {{multipath|multipath}} logic is invisible.

**{{apple|Apple}}, Alibaba, and Tessares have already deployed predecessors** (gQUIC {{multipath|multipath}} at {{google|Google}}, {{apple|Apple}}'s iCloud sync, Alibaba's mobile e-commerce). Once {{multipath|multipath}} [[quic|QUIC]] ships in mainline implementations (quiche, mvfst, quinn, msquic), it becomes the natural {{multipath|multipath}} transport for [[http3|HTTP/3]].

[[mptcp|MPTCP]] itself will remain in production for the use cases it currently serves. But the architectural arc — same idea, ported to a more deployable transport — is the same arc [[quic|QUIC]] followed for everything else.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/DifferenceTCP_MPTCP-en.png/500px-DifferenceTCP_MPTCP-en.png',
							alt: 'Side-by-side diagram of plain TCP versus Multipath TCP — TCP uses one path, MPTCP uses multiple subflows.',
							caption:
								'**Plain [[tcp|TCP]] vs [[mptcp|Multipath TCP]]** — same socket interface on the application side, dramatically different reality on the wire. [[mptcp|MPTCP]] negotiates *subflows* over multiple paths (your phone\'s [[wifi|Wi-Fi]] + cellular) and aggregates their throughput. {{apple|Apple}} shipped this in iOS 7 (2013) for Siri to fix the visible "Sorry, I didn\'t catch that" failures during Wi-Fi-to-cellular handoff.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
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
			synopsis: 'Reliable transport in user space, on [[udp|UDP]], with [[tls|TLS]] folded in.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[quic|QUIC]] is the first new transport to actually displace [[tcp|TCP]] at scale. It did so by accepting that the kernel cannot ship transport changes faster than once a decade — and by tunnelling inside [[udp|UDP]].',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Transport That Can Ship Updates',
							text: `[[quic|QUIC]] began as **gQUIC** at {{google|Google}} in 2012, written by [[pioneer:jim-roskind|Jim Roskind]] to address a specific frustration: every [[tcp|TCP]] improvement {{google|Google}} wanted to deploy had to wait years for kernel rollout across the heterogeneous internet, and many were stripped or blocked by middleboxes that had ossified on the existing wire format.

The {{ietf|IETF}} [[quic|QUIC]] Working Group, formed in 2016, took {{google|Google}}'s experiment and modularised it. **[[rfc:9000|RFC 9000]]** standardised [[quic|QUIC]] v1 in May 2021. **[[rfc:9114|RFC 9114]]** defined [[http3|HTTP/3]] as HTTP semantics on top of [[quic|QUIC]], published one year later. **[[quic|QUIC]] v2 (RFC 9369, May 2023)** is now a Standards-Track template for new [[quic|QUIC]] versions; its wire-image version number is **0x6b3343cf** — the first 4 bytes of \`sha256("QUICv2 version number")\` — chosen specifically to exercise version negotiation and break middleboxes that ossified on v1's Initial-packet {{salt|salt}}.

[[quic|QUIC]] solves four problems at once.`
						},
						{
							type: 'narrative',
							title: 'Four Problems Solved',
							text: `**{{head-of-line-blocking|Head-of-line blocking}}** in [[tcp|TCP]] means a single lost segment stalls every byte behind it. [[quic|QUIC]] carries multiple **streams** in a single connection, with independent sequence numbers per stream — a lost packet on stream 7 does not block delivery on streams 1-6. The fix that [[http2|HTTP/2]] could not provide because [[http2|HTTP/2]] inherited [[tcp|TCP]]'s stream model.

**Connection setup** in [[tcp|TCP]]+[[tls|TLS]] takes 2-3 round-trips. [[quic|QUIC]] folds the [[tls|TLS 1.3]] {{handshake|handshake}} into the [[quic|QUIC]] {{handshake|handshake}}, achieving **{{one-rtt|1-RTT}} setup for new connections and {{zero-rtt|0-RTT}} for resumptions**. Critical when a typical mobile request is bottlenecked by {{latency|latency}}, not {{bandwidth|bandwidth}} — every round-trip eliminated is real user-visible improvement.

**Network change** (your phone moving between [[wifi|Wi-Fi]] and cellular) breaks [[tcp|TCP]] because the connection is bound to a 4-tuple of (src [[ip|IP]], src port, dst [[ip|IP]], dst port) — change any element and the connection is gone. [[quic|QUIC]] uses a **64-bit connection ID** that is independent of the underlying [[ip|IP]]/[[udp|UDP]]. The receiver matches arriving packets by connection ID; an address change is invisible to the application.

**Deployability** is the deepest improvement. [[quic|QUIC]] runs over [[udp|UDP]], which middleboxes already forward unchanged. Implementations live in **user space**, so an application can ship a transport bug fix in a binary update — no kernel reboot, no waiting for an OS release. {{google|Google}} could deploy [[quic|QUIC]] features for chrome.com on a weekly cadence; with [[tcp|TCP]] they would have waited five years per change.`
						},
						{
							type: 'callout',
							title: 'The 21% plateau and the in-kernel push',
							text: 'As of Q1 2026, [[quic|QUIC]] carries roughly **21% of {{cloudflare|Cloudflare}}-observed web requests** — flat or slightly declining for several months. The plateau correlates with the **2024 ACM Web Conference paper "[[quic|QUIC]] is not Quick Enough over Fast Internet"** (Zhang et al., doi:10.1145/3589334.3645323) showing **up-to-45.2% throughput regressions** vs [[http2|HTTP/2]] above ~500 Mbps, due to receiver-side userspace {{ack|ACK}} and copy overhead. The fix in flight is **in-kernel [[quic|QUIC]]** — Xin Long\'s ~9,000-line patch series for {{linux|Linux}} landed July 2025; mainline merge expected 2026. When in-kernel [[quic|QUIC]] ships, the throughput gap with kernel [[tcp|TCP]] closes.'
						},
						{
							type: 'narrative',
							title: 'What\'s On the Frontier',
							text: `The next ten years of transport innovation are all riding on [[quic|QUIC]].

**[[frontier:multipath-quic|Multipath QUIC]]** (\`draft-{{ietf|ietf}}-quic-{{multipath|multipath}}\`) entered IESG Last Call in December 2025. Inherits [[mptcp|MPTCP]]'s algorithmic ideas inside a transport that actually traverses middleboxes.

**HTTP Datagrams and Capsules** ([[rfc:9000|RFC 9297]], August 2022) standardised unreliable datagrams over [[http3|HTTP/3]], enabling {{masque|MASQUE}} and {{webtransport|WebTransport}}.

**{{masque|MASQUE}} WG** (RFC 9298 — Proxying [[udp|UDP]] in HTTP, August 2022; RFC 9484 — Proxying [[ip|IP]] in HTTP, October 2023) ships CONNECT-[[udp|UDP]] and CONNECT-[[ip|IP]]. {{apple|Apple}} Private Relay and {{cloudflare|Cloudflare}}'s WARP-related proxy services use these.

**[[frontier:moq-transport|MoQ Transport]]** (\`draft-{{ietf|ietf}}-moq-transport-17\`, March 2026) is the first {{ietf|IETF}} media transport that intentionally is not [[rtp|RTP]] — sub-second live streaming with one-to-many {{pub-sub|publish/subscribe}} at {{cdn|CDN}} scale.

**[[rtp|RTP]]-over-[[quic|QUIC]] (RoQ)** (\`draft-{{ietf|ietf}}-avtcore-rtp-over-quic-14\`) entered Working Group Last Call in July 2025 — preserves the entire [[rtp|RTP]] ecosystem while gaining [[quic|QUIC]]'s {{encryption|encryption}}, {{nat|NAT}}-friendliness, and {{zero-rtt|0-RTT}}.

By 2026, **{{meta|Meta}} reports >75% of internet-facing traffic on [[quic|QUIC]]**; **{{cloudflare|Cloudflare}}** serves [[quic|QUIC]] universally; **{{apple|Apple}} Network.framework** offers native [[quic|QUIC]] since iOS 18; **Safari 18** enables [[http3|HTTP/3]] by default. The transport reshaped its deployment ecosystem in five years.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Google_Corkboard_Server_Rack.jpg/500px-Google_Corkboard_Server_Rack.jpg',
							alt: 'Early Google "corkboard" server rack — bare motherboards mounted on cork backing, displayed at the Computer History Museum.',
							caption:
								'An early **{{google|Google}} corkboard server** — the company that designed [[quic|QUIC]] in 2012 because it could no longer ship [[tcp|TCP]] improvements through kernel rollouts fast enough for its fleet. [[pioneer:jim-roskind|Jim Roskind]]\'s answer was to put a brand-new transport in *user space* on top of [[udp|UDP]], where it could iterate monthly and middleboxes would forward it unchanged.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
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
