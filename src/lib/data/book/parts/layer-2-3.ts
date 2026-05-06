/**
 * Part III — Layer 2-3 Foundations.
 *
 * Frames, addresses, and routes — how a packet finds your laptop.
 * Each chapter is anchored to one protocol but pulls in pioneers,
 * RFCs, and outages so the engineering history travels with the
 * mechanism.
 */

import type { BookPart } from '../types';

export const layer23: BookPart = {
	id: 'layer-2-3',
	title: 'Layer 2–3: Foundations',
	label: 'III',
	description:
		'Frames, addresses, and routes — the Layer-2 fabric, IP, and the protocols that hold the inter-domain internet together.',
	chapters: [
		{
			id: 'ethernet',
			title: 'Ethernet',
			synopsis: 'From PARC coaxial cable to 800 GbE in AI training fabrics.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Ethernet is the longest-running standard in computing that still runs the original spec. The 1973 PARC sketch and a 2025 Ultra Ethernet switch share the same frame format.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Aloha Inheritance',
							text: `In 1971, the University of Hawaii ran a wireless packet network called **ALOHAnet** that solved the multiple-access problem with brutal honesty: anyone can transmit at any time; if two stations collide, both back off a random interval and try again. The throughput was awful — Norman Abramson's original paper showed a maximum channel utilisation of 18% — but the architecture was right.

In 1973, **[[pioneer:bob-metcalfe|Bob Metcalfe]]** at Xerox PARC adapted ALOHA to a wired medium and added **carrier sensing**: listen before you transmit, and if you detect another station already speaking, wait. Combined with **collision detection** (stop the moment you hear a clash), CSMA/CD pushed utilisation past 90%. Metcalfe and **[[pioneer:david-boggs|David Boggs]]** had a 2.94 Mbps prototype running by November 1973. They named it Ethernet, after the luminiferous aether that nineteenth-century physicists thought light travelled through.

The IEEE standardised it as **802.3** in 1983, the same year ARPANET flag-day. Speeds doubled approximately every five years: 10 Mbps (1983), 100 Mbps Fast Ethernet (1995), 1 GbE (1999), 10 GbE (2002), 100 GbE (2010), 400 GbE (2017). Each generation kept the original 1500-byte MTU and the same 14-byte frame header. AI training fabrics now demand 800 GbE and the [[frontier:ultra-ethernet-1-0|Ultra Ethernet]] consortium is finalising 1.6 TbE for 2027.`
						},
						{
							type: 'callout',
							title: 'The frame format never changed.',
							text: 'Six bytes of destination MAC, six of source, two of EtherType, then up to 1500 bytes of payload, then a 4-byte CRC. That is the same in 1980 and 2025. Everything that scaled — bandwidth, switching, VLANs, jumbo frames — slid in around it without breaking the wire format.'
						}
					]
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Ethernet_RJ45_connector_p1160054.jpg/500px-Ethernet_RJ45_connector_p1160054.jpg',
							alt: 'Close-up of an 8P8C (RJ-45) modular plug terminating a Cat-5 twisted-pair cable.',
							caption:
								'An 8P8C ("RJ-45") modular plug — the connector that brought Ethernet to every desk. Eight conductors carry four differential pairs at gigabit-plus rates over Cat-5 or Cat-6 copper.',
							credit: 'Photo: David Monniaux, CC BY-SA 3.0, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'pioneer', id: 'bob-metcalfe' },
				{ kind: 'pioneer', id: 'david-boggs' },
				{ kind: 'protocol', id: 'ethernet' },
				{ kind: 'frontier', id: 'ethernet-800g' },
				{ kind: 'frontier', id: 'ultra-ethernet-1-0' }
			]
		},
		{
			id: 'wifi',
			title: 'Wi-Fi',
			synopsis: 'CSMA/CA on the airwaves; from 1 Mbps to Wi-Fi 7 to multi-link.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Putting Ethernet on the Air',
							text: `The IEEE 802.11 working group started in 1990 with a simple goal: take the [[ethernet|Ethernet]] frame format and put it on a radio. The first standard, 802.11 (1997), shipped at 1 and 2 Mbps. The big breakthrough was 802.11b (1999) at 11 Mbps and the 802.11g (2003) at 54 Mbps — speeds that made wireless networking actually useful for the consumer market.

The fundamental problem is that radios cannot listen and transmit simultaneously, so you cannot detect collisions the way wired Ethernet does. Wi-Fi instead uses **CSMA/CA** — collision **avoidance**. Before transmitting, a station waits a random backoff window scaled by traffic congestion. Acknowledgements are explicit: every unicast frame must be ACKed within microseconds, or the sender retransmits. Half-duplex, mandatory ACKs, and shared spectrum together cap real-world Wi-Fi throughput at roughly 60% of the headline number.

Wi-Fi 6 (2019) introduced **OFDMA**, letting an access point talk to multiple stations in the same time slot by giving each one a slice of the channel. Wi-Fi 7 ([[frontier:wifi-7-ratified|802.11be, ratified 2024]]) added **multi-link operation** — a single connection can use 2.4, 5, and 6 GHz bands simultaneously, switching whichever is least congested per packet. The result is the first Wi-Fi where tail latency competes with wired Ethernet.`
						}
					]
				},
				{ kind: 'protocol', id: 'wifi' },
				{ kind: 'frontier', id: 'wifi-7-ratified' },
				{
					kind: 'simulation',
					protocolId: 'wifi'
				}
			]
		},
		{
			id: 'arp-and-ndp',
			title: 'ARP and NDP',
			synopsis: 'How a packet finds the next physical hop.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Layer Seam',
							text: `Two layers meet awkwardly inside your network adapter. The IP layer thinks in terms of 32-bit IPv4 addresses (or 128-bit IPv6). The Ethernet layer thinks in terms of 48-bit MAC addresses burned into the silicon. To send a packet to **192.0.2.5**, the kernel needs to know which **MAC address** on the local segment owns that IP — and that mapping is not given anywhere in advance.

The **Address Resolution Protocol** ([[arp|ARP]], [[rfc:826|RFC 826]], 1982) solves it with the simplest broadcast you can imagine: shout "who has 192.0.2.5?" onto the wire, and the host that owns it shouts back "I do, MAC ab:cd:..." Cache the answer for a few minutes; repeat when it expires. ARP is plain text, has no authentication, and trusts the first reply that comes back — which is why **ARP spoofing** is an entry-level network attack and why every enterprise switch has dynamic ARP inspection.

[[ipv6|IPv6]] redesigned the same idea as the **Neighbor Discovery Protocol** ([[rfc:4861|RFC 4861]]). Same shape — solicitation, advertisement — but on top of [[icmp|ICMPv6]], with optional **Secure Neighbor Discovery** (SEND, RFC 3971) using cryptographic addresses to defeat spoofing. NDP also folds in router discovery and stateless autoconfiguration ([[rfc:4862|SLAAC]]), so a fresh-booted IPv6 host can pick its own address and find the local router without DHCP.`
						},
						{
							type: 'callout',
							title: 'ARP is one of the few protocols where a 1982 RFC is still the canonical specification.',
							text: 'There is nothing to update — the broadcast-and-cache mechanism works, and replacing it would break every Ethernet switch. The IPv6 transition is what is replacing it, by routing the same problem through ICMPv6 instead.'
						}
					]
				},
				{ kind: 'protocol', id: 'arp' },
				{ kind: 'rfc', number: '826' },
				{ kind: 'rfc', number: '4861' },
				{ kind: 'rfc', number: '4862' }
			]
		},
		{
			id: 'ipv4',
			title: 'IPv4',
			synopsis: 'The 32-bit address that ran fifty years longer than planned.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Twenty-Bit Address Space, Stretched',
							text: `When [[pioneer:vint-cerf|Vint Cerf]] picked 32 bits for the IP address field in 1977, he was asked whether it would be enough. His honest answer: more than enough for an experiment that he expected to be replaced before it had a million hosts. The "experiment" became the global internet, and the 4.3-billion-address space ran out for the first time in **February 2011**, when IANA allocated the last five /8 blocks to the regional registries.

Three engineering tricks stretched IPv4 a generation past what its designers planned. **CIDR** (Classless Inter-Domain Routing, [[rfc:1519|RFC 1519]], 1993) abolished the rigid Class A/B/C boundaries and let routes be aggregated by arbitrary prefix length — collapsing the global routing table from 70k entries headed for the moon down to a manageable 20k. **NAT** (Network Address Translation, RFC 1631, 1994) let one public IP front for thousands of private hosts behind a router. And **private address ranges** ([[rfc:1918|RFC 1918]], 1996) — 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — gave organisations enormous internal address space without consuming any of the public 32-bit pool.

Together these stretched IPv4 from "exhausted in 1995" to "still 60% of internet traffic in 2026." But the cost compounds: NAT breaks end-to-end addressability, complicates every protocol that needs inbound connections (peer-to-peer, voice, gaming), and forces middleboxes that ossify the entire stack. The transition to [[ipv6|IPv6]], discussed in the next chapter, has finally crossed 50% on Google measurements — and the [[frontier:ipv6-50-percent|halfway point matters]].`
						}
					]
				},
				{ kind: 'protocol', id: 'ip' },
				{ kind: 'rfc', number: '791' },
				{ kind: 'rfc', number: '1918' }
			]
		},
		{
			id: 'ipv6',
			title: 'IPv6',
			synopsis: 'A 28-year transition that just crossed 50%.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Long Crossing',
							text: `IPv6 was specified in 1995 ([[rfc:8200|RFC 1883]], later RFC 2460, finally STD 86 / [[rfc:8200|RFC 8200]] in 2017). The address field grew from 32 bits to **128 bits** — enough that every grain of sand on Earth could have its own subnet. The header was simplified, fragmentation was pushed to the edges, multicast and link-local autoconfiguration ([[rfc:4862|SLAAC]]) became core mechanisms.

It then took **twenty-eight years** to reach 50% adoption. The reason is not technical; it is the chicken-and-egg of network effects. A site that turns on IPv6 sees no benefit unless its peers do. An ISP that rolls out IPv6 still has to support IPv4 for backward compatibility. **Dual-stack** — running both — is the cost of transition, and dual-stack means twice the operational surface.

Adoption inflected when mobile carriers started rolling IPv6 by default for their cellular subscribers. T-Mobile US went IPv6-only with [[a2a|464XLAT]] translation in 2014. Verizon, AT&T, and the Asian carriers followed. By 2026, **87% of US mobile traffic is IPv6**; Google sees [[frontier:ipv6-50-percent|over 50% of all access from IPv6]]; many large enterprises run **IPv6-mostly** networks where IPv4 is a translation gateway.

[[pioneer:steve-deering|Steve Deering]], who designed IPv6 with Bob Hinden, said in 2017 that the transition would be done when "no engineer alive remembers a network without IPv6." We are not there yet. But for the first time in a quarter-century, you can plausibly stand up a new service on IPv6 only and serve a real audience.`
						}
					]
				},
				{ kind: 'protocol', id: 'ipv6' },
				{ kind: 'pioneer', id: 'steve-deering' },
				{ kind: 'rfc', number: '8200' },
				{ kind: 'frontier', id: 'ipv6-50-percent' }
			]
		},
		{
			id: 'icmp',
			title: 'ICMP',
			synopsis: 'Ping, traceroute, and the diagnostic backplane.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Internet\'s Out-of-Band Channel',
							text: `[[icmp|ICMP]] ([[rfc:792|RFC 792]], 1981) is the protocol that lets the network tell you something is wrong without opening a connection. When a router drops your packet because the **TTL** hit zero, it sends an ICMP **Time Exceeded** back to you — the mechanism that **traceroute** exploits to map every hop along a path. When a destination is unreachable because no service is listening on the requested port, you get **Destination Unreachable**. When a router has too small an MTU for your packet and the **Don't Fragment** bit is set, it sends **Fragmentation Needed**, which is what **Path MTU Discovery** depends on.

The most famous ICMP message is **Echo Request / Echo Reply** — what **ping** sends. Mike Muuss wrote ping in 1983 in a single sitting; it has been included in every Unix and Windows since.

ICMP also has a security problem. Because it can carry arbitrary text payloads and is allowed through most firewalls, it has been weaponised as a covert channel ("ICMP tunnelling") for decades. Many enterprise networks rate-limit or block ICMP entirely — which then breaks Path MTU Discovery and creates the "MTU black hole" failure mode where TCP connections hang because the network can neither deliver the large packet nor signal that it cannot.`
						},
						{
							type: 'callout',
							title: 'When in doubt, ping it.',
							text: 'ICMP Echo Request is the lowest-overhead reachability test you can run. If it fails, every higher-level diagnosis becomes faster — you have already ruled out everything above L3.'
						}
					]
				},
				{ kind: 'protocol', id: 'icmp' },
				{ kind: 'rfc', number: '792' }
			]
		},
		{
			id: 'bgp',
			title: 'BGP',
			synopsis: 'Three napkins, every transit relationship, no built-in trust.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'BGP was sketched on three napkins at lunch in 1989 and is still the protocol that decides which packets reach which continent.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Trust System Without Trust',
							text: `In January 1989, **[[pioneer:yakov-rekhter|Yakov Rekhter]]** at IBM and Kirk Lougheed at Cisco met for lunch at an IETF meeting in Austin. The previous routing protocol (EGP) had become unmanageable; the internet was about to outgrow it. On the back of three napkins, they sketched a replacement: a path-vector protocol where every autonomous system advertises which prefixes it can reach and which other ASes its packets would traverse. Routers pick the shortest AS path that satisfies their local policy.

That sketch became [[rfc:4271|BGP-1]] (RFC 1105, June 1989), then BGP-4 (RFC 1771, 1995), then the current [[rfc:4271|RFC 4271]] (2006). The protocol has been backwards-compatible for over thirty years across more than 100,000 ASes.

The structural problem BGP can never solve on its own is that **it has no built-in authentication**. When AS A says "I can reach 8.8.8.0/24 in two hops," AS B has to choose whether to believe it. There is no cryptographic proof. A misconfiguration — or a hijack — can re-route real traffic through an unintended AS, with consequences ranging from outages ([[outage:facebook-2021|Facebook 2021]], [[outage:as-7007-1997|AS 7007 1997]]) to surveillance to censorship ([[outage:pakistan-youtube-2008|Pakistan / YouTube 2008]]).

The fix has been arriving incrementally for fifteen years. **[[frontier:rpki-rov-50-percent|RPKI]]** lets prefix-holders publish cryptographically signed Route Origin Authorisations; **ROV** (Route Origin Validation) checks them at ingress. As of 2026, more than 50% of advertised IP space is covered by RPKI. **ASPA** (AS Provider Authorisation) extends the same idea to AS-path validation, due to ship in 2026-2027.`
						}
					]
				},
				{ kind: 'pioneer', id: 'yakov-rekhter' },
				{ kind: 'protocol', id: 'bgp' },
				{ kind: 'rfc', number: '4271' },
				{ kind: 'outage', id: 'facebook-2021' },
				{ kind: 'outage', id: 'as-7007-1997' },
				{ kind: 'outage', id: 'pakistan-youtube-2008' },
				{ kind: 'frontier', id: 'rpki-rov-50-percent' }
			]
		}
	]
};
