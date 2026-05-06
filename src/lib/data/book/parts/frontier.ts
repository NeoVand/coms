/**
 * Part XI — The Modern Frontier (2024–2026).
 *
 * What is actively shipping or being standardised right now — the
 * things that will date this book in five years.
 */

import type { BookPart } from '../types';

export const frontier: BookPart = {
	id: 'frontier',
	title: 'The Modern Frontier (2024–2026)',
	label: 'XI',
	description:
		'What is actively shipping or being standardised right now — the things that will date this book in five years.',
	chapters: [
		{
			id: 'post-quantum',
			title: 'Post-Quantum TLS',
			synopsis: 'X25519MLKEM768 default in iOS 26 and Chrome.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Hybrid Crypto Is Already Default',
							text: `A working quantum computer of useful size — perhaps 4096 logical qubits — could break the elliptic-curve key agreement that secures essentially all modern [[tls|TLS]]. Estimates of when such a machine arrives range from "ten years" to "never." But the threat is not future: an adversary recording encrypted traffic **now** could decrypt it later when the machine arrives. **Harvest now, decrypt later.**

The fix has been moving fast. In August 2024, NIST finalised three post-quantum standards: **ML-KEM** (Module-Lattice Key Encapsulation, formerly Kyber, FIPS 203), **ML-DSA** (Dilithium, FIPS 204), and **SLH-DSA** (SPHINCS+, FIPS 205). Of these, ML-KEM-768 is the one TLS uses for key exchange.

The deployment trick is **hybrid**: combine the existing X25519 key exchange with ML-KEM-768 in such a way that an attacker has to break both. The named cipher is **[[frontier:pq-tls-x25519mlkem768|X25519MLKEM768]]**, code 0x11ec. As of 2026, it is default in Chrome 124+, Cloudflare's TLS termination, and iOS 26. CDNs report that over **70% of TLS 1.3 handshakes** now negotiate it.

The cost: the handshake message is about 1.2 KB larger than X25519 alone. On most networks invisible; on extremely constrained links (sub-1 kbps satellite, embedded radios) measurable. The protocol-design lesson: the cryptography community shipped useful post-quantum primitives years before the hardware arrived, and the deployment ecosystem rolled them out in months instead of decades.`
						}
					]
				},
				{ kind: 'frontier', id: 'pq-tls-x25519mlkem768' },
				{ kind: 'protocol', id: 'tls' }
			]
		},
		{
			id: 'l4s-everywhere',
			title: 'L4S Everywhere',
			synopsis: 'Sub-millisecond queuing latency for cooperating flows.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A New Kind of Congestion Signalling',
							text: `For 35 years, congestion control on the internet has been **loss-based**: when a packet is dropped, the sender slows down. The mechanism works, but the cost is queueing delay — by the time the packet is dropped, the queue is already full and every packet behind it has been delayed.

**L4S** (Low Latency, Low Loss, Scalable Throughput, [[rfc:9330|RFC 9330]]/9331/9332, 2023) inverts the model. Cooperating senders mark their packets ECT(1). Routers with L4S support put those packets in a **separate, isolated queue** and use **explicit congestion notification** (ECN) to signal earlier — before the queue grows. Senders react to the signal by paced-back-off rather than half-the-window slash.

The result: **sub-millisecond queuing delay** even at 100% link utilisation, for flows that participate. Non-L4S flows in the classic queue see no degradation. It is the first congestion-control change that delivers an order-of-magnitude latency improvement without coordination across all senders.

**Comcast launched L4S in production** in late January 2025, in six US metros, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S support in iOS 17/macOS Sonoma (2023), default for [[quic|QUIC]] in newer releases. Linux 6.0+ has it. The deployment curve over the next 2–3 years will determine whether L4S becomes the new default or a niche feature for gaming and live media.`
						}
					]
				},
				{ kind: 'frontier', id: 'l4s-comcast-launch' },
				{ kind: 'rfc', number: '9330' },
				{ kind: 'frontier', id: 'bbrv3-default' }
			]
		},
		{
			id: 'ipv6-mostly',
			title: 'IPv6-Mostly',
			synopsis: '50% on Google, 87% on US mobile.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Tipping Point Reached',
							text: `[[ipv6|IPv6]] was specified in 1995. For most of the next twenty-eight years, deployment was painful — early adopters had to maintain dual stacks, the operational cost was double, and the upside was mostly future-proofing.

Adoption inflected when carriers went **IPv6-mostly** for their cellular subscribers. T-Mobile US led in 2014 with 464XLAT translation, Verizon and AT&T followed, and by 2023 all the major US mobile networks were predominantly IPv6 with IPv4 as an edge translation. As of March 2026, [[frontier:ipv6-50-percent|Google measures over 50% of access from IPv6]], **87% of US mobile traffic** is IPv6, Cloudflare reports 40% of HTTP requests use IPv6.

The remaining hurdle is enterprise. Most large companies still run IPv4-only internal networks. The transition will continue not by a deliberate migration but by attrition — new infrastructure is built v6-first, old IPv4 islands age out. By the early 2030s, IPv4 will likely be the minority protocol everywhere except in legacy industrial systems.

[[pioneer:steve-deering|Steve Deering]], who designed IPv6 with Bob Hinden, said in 2017 the transition would be done when "no engineer alive remembers a network without IPv6." 2026 is not that year. But for the first time, you can stand up a service on IPv6 only and serve a real audience.`
						}
					]
				},
				{ kind: 'frontier', id: 'ipv6-50-percent' },
				{ kind: 'protocol', id: 'ipv6' }
			]
		},
		{
			id: 'rpki-aspa',
			title: 'RPKI + ASPA',
			synopsis: 'Cryptographic BGP, finally arriving.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Decade of Slow Wins',
							text: `[[bgp|BGP]] without origin authentication is the architectural reason every BGP hijack of the last 25 years was possible: [[outage:as-7007-1997|AS 7007]], [[outage:pakistan-youtube-2008|Pakistan/YouTube]], [[outage:facebook-2021|Facebook 2021]] all worked because no router could verify whether an AS was entitled to announce a prefix.

**RPKI** (Resource Public Key Infrastructure) lets prefix-holders publish cryptographically signed Route Origin Authorisations declaring "AS X is authorised to originate prefix Y." **ROV** (Route Origin Validation) is the BGP router check that drops or de-preferences advertisements that fail RPKI validation.

Deployment has been slow but steady. In 2018, less than 5% of advertised IPv4 space was covered. By 2023, 30%. As of 2026, [[frontier:rpki-rov-50-percent|over 50% of advertised space is covered]] by RPKI, and most tier-1 transit providers enforce ROV on incoming announcements. The remaining gap is largely smaller ISPs and developing-region networks.

**ASPA** (Autonomous System Provider Authorisation, in late-stage IETF draft) extends the same idea to **AS-path** validation — letting a prefix-holder declare which upstream providers may carry their announcements. ASPA closes the route-leak hole that RPKI alone cannot fix (where an AS does originate the prefix but its upstream then leaks it through an unintended path). Standards finalisation is expected 2026-2027; deployment will follow the RPKI curve, hopefully faster.`
						}
					]
				},
				{ kind: 'frontier', id: 'rpki-rov-50-percent' },
				{ kind: 'protocol', id: 'bgp' }
			]
		},
		{
			id: 'ultra-ethernet',
			title: 'Ultra Ethernet',
			synopsis: 'Replacing RoCEv2 in AI training fabrics.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A New Transport for Datacenter AI',
							text: `Training a large language model requires hundreds of thousands of GPUs talking to each other at terabits per second with **microsecond tail latency**. The dominant transport — RoCEv2 (RDMA over Converged Ethernet) — was designed for HPC clusters of a few thousand nodes and shows its age at GPT-scale: head-of-line blocking, congestion-control issues, and operational complexity.

The **Ultra Ethernet Consortium**, formed July 2023 by AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta, and Microsoft, is designing a new transport explicitly for AI fabrics. **Ultra Ethernet 1.0** ([[frontier:ultra-ethernet-1-0|specification published 2024]]) introduces packet-level multipathing with reordering at the receiver, in-network congestion notification, and selective retransmission tuned for collective operations.

The target is **800 Gbps per port**, with [[frontier:ethernet-800g|800 GbE switches]] already shipping. **1.6 TbE** is in standards work and expected production deployment by 2027.

The architectural significance is that AI training is now important enough to drive a new datacenter transport — the same kind of pressure that produced [[ethernet|Ethernet]] in 1973 for office networking, [[tcp|TCP/IP]] in 1981 for inter-network research, and [[quic|QUIC]] in 2012 for the modern web.`
						}
					]
				},
				{ kind: 'frontier', id: 'ultra-ethernet-1-0' },
				{ kind: 'frontier', id: 'ethernet-800g' },
				{ kind: 'protocol', id: 'ethernet' }
			]
		},
		{
			id: 'wifi-7-and-8',
			title: 'Wi-Fi 7 and 8',
			synopsis: '320 MHz channels, then a 25% better tail latency target.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Last Mile Catches Up',
							text: `**[[frontier:wifi-7-ratified|Wi-Fi 7]] (802.11be, ratified 2024)** brought three changes that together lifted real-world wireless performance dramatically. **320 MHz channels** in the 6 GHz band doubled the maximum throughput per stream. **4096-QAM modulation** packed more bits per symbol on clean channels. And **Multi-Link Operation (MLO)** let a single connection use 2.4, 5, and 6 GHz bands simultaneously, switching whichever was least congested per packet.

The MLO feature is the one that matters most for ordinary users. Tail latency on a busy Wi-Fi network — the 99th-percentile delay that made video calls stutter and games lag — used to spike into hundreds of milliseconds when many devices contended. With MLO, a frame can be sent on whichever band is free; the median and tail both improve.

**Wi-Fi 8** (802.11bn, drafts active, expected ratification 2028) targets a different metric: **25% reduction in worst-case latency** at the same throughput. The mechanism work involves coordinated multi-AP transmission (so adjacent APs do not interfere) and finer-grained channel sensing.

The pattern: Wi-Fi went from "throughput, throughput, throughput" through the 802.11n/ac/ax era to "latency and reliability" in 7/8. The reason is that the throughput ceiling has caught up with what most homes need; the new bottleneck is consistent low-latency delivery.`
						}
					]
				},
				{ kind: 'frontier', id: 'wifi-7-ratified' },
				{ kind: 'protocol', id: 'wifi' }
			]
		}
	]
};
