import type { SubcategoryStory } from './types';

export const internetLayerStory: SubcategoryStory = {
	subcategoryId: 'internet-layer',
	tagline:
		"Best-effort packet delivery across networks — the narrow waist of the hourglass that lets the rest of the Internet exist",
	sections: [
		{
			type: 'narrative',
			title: 'The Layer That Everything Else Trusts',
			text: `Networking diagrams traditionally draw the Internet protocol stack as an **hourglass**. Many physical link layers at the bottom (Ethernet, Wi-Fi, fiber, cellular). Many transport and application layers at the top ([[tcp|TCP]], [[udp|UDP]], [[http3|HTTP]], [[dns|DNS]]). One protocol in the middle.\n\nThat middle protocol is **[[ip|IP]]**. Every packet on the Internet, regardless of what physical medium it crosses or what application generated it, wears an IP header. The narrowness of the waist is what makes the whole thing work: any application can run over any link as long as both speak IP. Wi-Fi got added without changing TCP. HTTP/3 got added without changing Ethernet. The hourglass shape is the architectural reason the Internet was able to evolve at all.\n\nThe Internet Layer family has three members:\n\n- **[[ip|IPv4]]** ([[rfc:791|RFC 791]], 1981) is the original. 32-bit addresses, 20-byte header, decades of operational hardening. The address space (~4.3 billion) ran out years ago; [[nat-traversal|NAT]] is how we\'ve been pretending otherwise.\n- **[[ipv6|IPv6]]** ([[rfc:8200|RFC 8200]], 1998 / 2017) is the successor. 128-bit addresses (enough to give every grain of sand on Earth its own /64). Cleaned-up header (40 bytes, fewer fields, better fragmentation rules). Mandatory IPsec was once part of the pitch; deployed reality is more complicated.\n- **[[icmp|ICMP]]** ([[rfc:792|RFC 792]] for v4, [[rfc:4443|RFC 4443]] for v6) is the diagnostic shadow. Echo (the basis of \`ping\`), TTL-exceeded (the basis of \`traceroute\`), destination-unreachable, redirect. Not really a transport — more of a control plane for IP itself.\n\nThe **best-effort** promise is what makes IP scale. The protocol guarantees nothing — packets may arrive in any order, may be duplicated, may be silently dropped, may have bits corrupted. All reliability is the responsibility of higher layers ([[tcp|TCP]], [[quic|QUIC]], the application). Routers don\'t need to remember any state about flows; they just look at the destination address, consult the routing table, forward. This statelessness is what lets the Internet survive at scale — failures are routed around without anyone needing to coordinate.`
		},
		{
			type: 'pioneers',
			title: 'The Internet Layer Architects',
			people: [
				{
					id: 'vint-cerf',
					name: 'Vint Cerf',
					years: '1943–',
					title: 'Co-inventor of TCP/IP',
					org: 'Stanford / DARPA / Google',
					contribution:
						"Co-designed [[ip|IP]] with [[pioneer:bob-kahn|Bob Kahn]] starting from their 1974 paper. The 1978 split of the monolithic TCP into [[tcp|TCP]] (transport) and [[ip|IP]] (network) — done in collaboration with [[pioneer:jon-postel|Postel]] and Danny Cohen — gave the Internet its hourglass. Cerf later chaired ICANN, founded the Internet Society, and spent decades as Google\\'s Chief Internet Evangelist. He still answers email."
				},
				{
					id: 'bob-kahn',
					name: 'Bob Kahn',
					years: '1938–',
					title: 'Co-inventor of TCP/IP',
					org: 'DARPA / Corporation for National Research Initiatives',
					contribution:
						"Conceived the open-architecture networking idea at DARPA in 1972 and recruited [[pioneer:vint-cerf|Cerf]] to collaborate on the protocols that would become TCP/IP. The crucial decision was that the internet protocol — the spanning layer that connected disparate networks — should make no assumptions about the underlying network technology. That decision lets [[ip|IP]] run on Ethernet, Wi-Fi, satellites, dark fiber, smoke signals, and IP-over-Avian-Carriers ([[rfc:1149|RFC 1149]] — yes, really)."
				},
				{
					id: 'steve-deering',
					name: 'Steve Deering',
					years: '1951–',
					title: 'Father of IPv6 and IP Multicast',
					org: 'Stanford / Xerox PARC / Cisco',
					contribution:
						"Designed IP multicast (RFC 1112, 1989) — the model for one-to-many delivery that underlies multicast routing, IGMP, and (eventually) every IPTV deployment. Also co-designed [[ipv6|IPv6]] (RFC 1883, 1995; later RFC 2460, then [[rfc:8200|RFC 8200]] in 2017) at Xerox PARC and Cisco. Deering\\'s judgment that \"variable-length addresses are operationally too hard\" — leading to IPv6\\'s fixed 128-bit width — is one of the bets that defines the next 50 years of Internet addressing."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1974,
					title: 'Cerf & Kahn Publish TCP/IP Concept',
					description:
						'\"A Protocol for Packet Network Intercommunication\" defines open-architecture networking. The protocol is monolithic at first.'
				},
				{
					year: 1978,
					title: 'TCP/IP Split',
					description:
						'[[pioneer:vint-cerf|Cerf]], [[pioneer:jon-postel|Postel]], and Danny Cohen separate [[tcp|TCP]] from [[ip|IP]]. The hourglass shape of the Internet begins.'
				},
				{
					year: 1981,
					title: 'IP RFC 791',
					description:
						'The current [[ip|IPv4]] specification. 32-bit addresses, 20-byte header, classful addressing (A/B/C). The version that would carry the Internet for the next 30+ years.'
				},
				{
					year: 1981,
					title: 'ICMP RFC 792',
					description:
						'[[icmp|ICMP]] standardized — the diagnostic protocol that gave us \`ping\` (1983) and later \`traceroute\` (1988).'
				},
				{
					year: 1983,
					title: 'ARPANET Flag Day',
					description:
						"January 1, 1983 — the ARPANET transitions from NCP to [[tcp|TCP]]/[[ip|IP]]. Most networking textbooks date \"the Internet\" from this day."
				},
				{
					year: 1993,
					title: 'CIDR Replaces Classful Addressing (RFC 1519)',
					description:
						"Classless Inter-Domain Routing — variable-length subnet masks. Saves [[ip|IPv4]] from premature exhaustion through the late 1990s."
				},
				{
					year: 1995,
					title: 'IPv6 First Spec (RFC 1883)',
					description:
						"[[pioneer:steve-deering|Deering]]\'s [[ipv6|IPv6]] specification publishes. 128-bit addresses, simpler header, no fragmentation by routers (only by hosts)."
				},
				{
					year: 1998,
					title: 'IPv6 RFC 2460',
					description:
						'The IPv6 spec that essentially everyone implemented for the next two decades.'
				},
				{
					year: 2011,
					title: 'IPv4 Address Exhaustion',
					description:
						"IANA allocates the last /8 of IPv4 to a regional registry on February 3, 2011. Regional registries run out over the next decade. The address space the original architects thought would last forever is gone."
				},
				{
					year: 2012,
					title: 'World IPv6 Launch Day',
					description:
						"Google, Facebook, Yahoo, Akamai, and others permanently enable [[ipv6|IPv6]] on their main websites. Real-world IPv6 traffic share starts rising from <1%."
				},
				{
					year: 2017,
					title: 'IPv6 RFC 8200',
					description:
						"The current IPv6 specification. Mostly clarifications; a few changes to fragmentation handling. Officially raises IPv6 to Internet Standard."
				},
				{
					year: 2021,
					title: 'IPv6 Adoption ~40%',
					description:
						"Google measures ~40% of users reaching it via IPv6. Apple-mandated IPv6-only support in App Store apps (2016) drove much of the adoption — every major mobile app must work over IPv6-only networks."
				},
				{
					year: 2024,
					title: 'IPv4 Address Trading',
					description:
						"IPv4 /24 blocks trade for $40-50 each on the secondary market. AWS, Cloudflare, Microsoft are major buyers. The last vestiges of IPv4 allocation become a commodity market."
				}
			]
		},
		{
			type: 'comparison',
			title: 'IPv4 vs IPv6 vs ICMP',
			axes: ['Header size', 'Address size', 'Address space', 'Key features', 'Fragmentation'],
			rows: [
				{
					label: '[[ip|IPv4]]',
					values: [
						'20 bytes minimum (40 with options)',
						'32 bits',
						"4.3 billion addresses (long exhausted; [[nat-traversal|NAT]] stretches it)",
						'Wide deployment, mature tooling, simple operation',
						"Routers can fragment in transit"
					]
				},
				{
					label: '[[ipv6|IPv6]]',
					values: [
						'40 bytes fixed (extension headers for options)',
						'128 bits',
						"3.4 × 10³⁸ addresses (effectively unlimited)",
						'No NAT needed, simpler header, native autoconfiguration (SLAAC)',
						"Only end-hosts fragment; routers send ICMPv6 Packet Too Big"
					]
				},
				{
					label: '[[icmp|ICMP]]',
					values: [
						'Variable (depends on type)',
						"N/A — uses IP addresses",
						"N/A",
						'Diagnostic + error reporting (echo, TTL exceeded, destination unreachable)',
						"N/A"
					]
				}
			],
			note: "ICMP isn\'t a transport — it\'s a control protocol for IP itself. ICMPv4 and ICMPv6 are different protocols with overlapping purposes; ICMPv6 absorbed ARP\'s functionality via Neighbor Discovery."
		},
		{
			type: 'animated-sequence',
			title: "A Packet's Journey and Traceroute",
			definition: `sequenceDiagram
    participant A as Source
    participant R1 as Router 1
    participant R2 as Router 2
    participant R3 as Router 3
    participant B as Destination
    Note over A,B: Normal packet — TTL=64 hops toward B
    A->>R1: IP packet, dst=B, TTL=64
    R1->>R2: IP packet, dst=B, TTL=63
    R2->>R3: IP packet, dst=B, TTL=62
    R3->>B: IP packet, dst=B, TTL=61
    Note over A,B: traceroute trick — send packets with increasing TTL
    A->>R1: probe with TTL=1
    R1-->>A: ICMP Time Exceeded from R1
    A->>R2: probe with TTL=2
    R2-->>A: ICMP Time Exceeded from R2
    A->>R3: probe with TTL=3
    R3-->>A: ICMP Time Exceeded from R3
    A->>B: probe with TTL=4
    B-->>A: ICMP Destination Unreachable or response
    Note over A: traceroute now knows the full path — R1, R2, R3, B`,
			caption:
				"This is how `traceroute` actually works — it abuses the TTL field. Every IP router decrements TTL; when TTL reaches 0, the router drops the packet and sends an ICMP Time Exceeded back to the source. By sending probes with TTL=1, 2, 3, ..., a source can map the path packet-by-packet. The control plane was never designed for this; it just falls out of the rules.",
			steps: {
				0: '**Normal IP forwarding.** Every router along the path decrements the TTL (Time To Live) field in the IP header by 1. The TTL exists to prevent packets from looping forever in case of routing loops.',
				1: 'Source sends a packet destined for B with **TTL=64** (the typical default).',
				2: '**Router 1 decrements TTL to 63** and forwards. The packet is still alive.',
				3: '**Router 2 decrements TTL to 62** and forwards.',
				4: '**Router 3 decrements TTL to 61** and forwards to B. The packet arrived in 4 hops and burned 4 TTL units.',
				5: '**Traceroute exploits TTL.** Instead of sending packets with normal TTLs, traceroute sends probes with TTL=1, then 2, then 3... Each probe expires N hops in, and the router that expires it sends an ICMP error back.',
				6: 'Source sends a probe with **TTL=1**. R1 will decrement to 0 and drop it.',
				7: 'R1 returns an **ICMP Time Exceeded** message. The source now knows R1\'s IP address — first hop identified.',
				8: 'Source sends a probe with **TTL=2**. R1 decrements to 1 and forwards; R2 decrements to 0 and drops.',
				9: 'R2 returns **ICMP Time Exceeded** — second hop identified.',
				10: 'Source sends a probe with **TTL=3**. Reaches R3, which decrements to 0 and drops.',
				11: 'R3 returns **ICMP Time Exceeded** — third hop identified.',
				12: 'Source sends a probe with **TTL=4**. This time it reaches B. B is the destination, not a router; it responds with ICMP Destination Unreachable (if the probe was UDP to a closed port, traceroute\'s usual trick) or a regular response.',
				13: 'B\'s reply ends the trace. Traceroute now knows the full path: **A → R1 → R2 → R3 → B**, plus the round-trip latency to each hop. The TTL mechanism — designed only to prevent loops — gave us the most-used network-diagnostic tool ever built.'
			}
		},
		{
			type: 'callout',
			title: 'Why IPv6 Took 30 Years',
			text: `[[ipv6|IPv6]] was published in 1995. By 2010, IPv4 was running out of addresses; the migration should have been urgent. As of 2025, IPv6 carries ~40% of Google traffic — better than people expected by 2020, but still far from the "IPv4 is gone" world the original transition plans envisioned.\n\nWhy the slow march?\n\n- **There\'s no flag day.** Unlike the 1983 ARPANET TCP/IP cutover (which had ~400 hosts on one network), the modern Internet has billions of devices on countless networks. No central authority can flip a switch. Every operator transitions independently.\n- **NAT bought time.** [[nat-traversal|NAT]] — designed as a temporary hack — let one IPv4 address serve hundreds of devices behind a home router. The address-exhaustion pressure was real but never *acute*. People could keep using IPv4 indefinitely (uncomfortably, but indefinitely).\n- **IPv6 isn\'t a superset of IPv4.** A pure IPv6 host can\'t reach IPv4-only hosts without translation (NAT64, CLAT, 464XLAT). A network running only IPv6 has to maintain IPv4 reachability anyway for legacy services. Dual-stack — running both — is operationally complex.\n- **No business benefit (until now).** From an individual operator\'s perspective, IPv6 cost money to deploy and brought no new functionality. The address-exhaustion cost was diffused across the industry; the cost of deployment was localized.\n- **Apple changed the calculus in 2016.** Apple\'s App Store policy requiring all apps to work on IPv6-only networks meant every iOS developer had to test and fix their apps. T-Mobile USA going IPv6-only on their cellular network made that real. The pressure flipped from \"why bother\" to \"my service breaks if I don\'t.\"\n\nThe deeper lesson: replacing the protocol at the bottom of the hourglass is the hardest possible thing to do in network engineering. Everything depends on it. Backward compatibility constraints multiply. Replacement might still complete; it might never complete. Either outcome is consistent with the data so far.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[ip|IPv4]]\'s failure mode is **address exhaustion**. There aren\'t enough 32-bit addresses for the world\'s devices, and there haven\'t been for years. [[nat-traversal|NAT]] hides the shortage at the cost of breaking the original peer-to-peer Internet model. Carrier-Grade NAT (where a cellular carrier runs NAT in their core) gives an entire customer base a single IPv4 address — when that IP gets DDoSed or blacklisted, *every* customer is affected. The economic pressure shows up as IPv4 address blocks trading for $40-50 per IP on the secondary market.\n\n[[ipv6|IPv6]]\'s failure modes are subtler. The protocol design replaced some IPv4 problems with new ones:\n\n- **No fragmentation in routers.** Sounds good — fragmentation was a performance disaster. But path-MTU discovery requires ICMPv6 \"Packet Too Big\" messages to reach the source, and many networks block ICMP. Black-hole MTU problems (connection establishes, large packets silently dropped) are an IPv6 operational headache.\n- **128-bit addresses are hard to type.** \`2001:db8:85a3::8a2e:370:7334\` instead of \`192.168.1.50\`. SLAAC-derived addresses are even more abstract. Diagnostic UX is worse than IPv4.\n- **Privacy extensions complicate logging.** SLAAC addresses change over time for privacy; correlating logs across time intervals is harder.\n\n[[icmp|ICMP]]\'s failure mode is **operators blocking it**. ICMP is essential for network operation (path-MTU discovery, error reporting) but is commonly blocked by misconfigured firewalls because "ICMP is dangerous." Blocking *all* ICMP breaks many things subtly — IPv6 connectivity in particular relies on ICMPv6 for Neighbor Discovery. The "block ICMP echo only" advice from RFC 4890 is correct but rarely followed.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **IPv6-only networks** continue to spread. Most major mobile carriers (T-Mobile USA, Reliance Jio, France\'s mobile networks) are IPv6-only with NAT64/DNS64 for legacy IPv4 access. Apple-mandated dual-stack support means iOS apps just work on these networks. The transition is happening, slowly.\n- **Segment Routing (SRv6)** is rolling out in ISP backbones. Encodes the explicit packet path inside the IPv6 header itself; doesn\'t replace [[bgp|BGP]] but changes how engineers express traffic engineering. Largely an enterprise/ISP technology, invisible to end users.\n- **IPv6 Extension Headers** — a generality of IPv6 originally meant for innovation — remain underutilized. Many networks drop packets containing extension headers (which they shouldn\'t but do); deploying anything beyond plain IPv6 is operationally hard.\n- **QUIC over IP** — [[quic|QUIC]] is layered above IP via UDP, but the design point — encrypt transport headers, escape middlebox ossification — is essentially "evolve transport behavior without changing IP." It\'s a workaround for the fact that IPv6 mass deployment didn\'t happen on schedule.\n- **IPv4 secondary market** continues. AWS now owns >100 million IPv4 addresses; Cloudflare, Microsoft, Akamai are major holders. IPv4 prefixes are quietly becoming a financial asset class.\n- **The boring truth**: IPv4 will be running real production traffic in 2050. The hourglass is wide enough to hold both versions of the waist for a very long time.`
		}
	]
};
