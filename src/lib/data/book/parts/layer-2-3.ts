/**
 * Part III — Layer 2-3 Foundations.
 *
 * Frames, addresses, and routes — how a packet finds your laptop.
 * Multi-section chapters drawn from the per-protocol research files
 * with citation-backed dates and 2024-2026 deployment numbers.
 */

import type { BookPart } from '../types';

export const layer23: BookPart = {
	id: 'layer-2-3',
	title: 'Layer 2–3: Foundations',
	label: 'III',
	description:
		'Frames, addresses, and routes — the Layer-2 fabric, [[ip|IP]], and the protocols that hold the inter-domain internet together.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'ethernet',
			title: 'Ethernet',
			synopsis: 'From PARC coaxial cable to 800 GbE in AI training fabrics.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[ethernet|Ethernet]] is the longest-running standard in computing that still runs the original spec. The 1973 PARC sketch and a 2025 Ultra [[ethernet|Ethernet]] switch share the same frame format.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Aloha Inheritance',
							text: `In 1971, the University of Hawaii ran a wireless packet network called **ALOHAnet** that solved the multiple-access problem with brutal honesty: anyone can transmit at any time; if two stations collide, both back off a random interval and try again. The throughput was awful — Norman Abramson's original paper showed a maximum channel utilisation of 18% — but the architecture was right.

On **22 May 1973**, **[[pioneer:bob-metcalfe|Bob Metcalfe]]** at Xerox PARC circulated the *"Alto [[ethernet|Ethernet]]"* memo with hand-drawn diagrams. He named it after the discredited *"luminiferous ether"* so the medium could be coax, twisted pair, fiber, or radio. Combined with **carrier sensing** (listen before you transmit) and **collision detection** (stop the moment you hear a clash), CSMA/CD pushed wired-medium utilisation past 90%. Metcalfe and **[[pioneer:david-boggs|David Boggs]]** had a **2.94 Mbps prototype running by 11 November 1973** — the original speed was chosen because it matched the Alto's clock divided down.

The IEEE standardised it as **802.3** in 1983, the same year as ARPANET flag-day. Speeds doubled approximately every five years: 10 Mbps (1983), 100 Mbps Fast [[ethernet|Ethernet]] (1995), 1 GbE (1999), 10 GbE (2002), 100 GbE (2010), 400 GbE (2017). **Bob Metcalfe won the 2022 ACM A.M. Turing Award** (announced March 2023) "for the invention, standardization, and commercialization of [[ethernet|Ethernet]]."`
						},
						{
							type: 'callout',
							title: 'Why the 64-byte minimum frame size still exists in 800 GbE',
							text: 'The minimum [[ethernet|Ethernet]] frame is **64 bytes** because the original 10 Mbps coaxial [[ethernet|Ethernet]] had to detect collisions before completing a frame transmission — {{rtt|round-trip time}} across the maximum 2.5 km / 4-repeater diameter is 51.2 µs = 64 bytes at 10 Mbps. Modern switched {{full-duplex|full-duplex}} [[ethernet|Ethernet]] has no collisions, but the minimum stays for backwards compatibility. Forty-five years later, every 800 GbE frame still respects the slot-time math from a 10 Mbps shared coax in 1980.'
						},
						{
							type: 'narrative',
							title: 'The Frame Format That Never Changed',
							text: `Six bytes of destination MAC, six of source, two of EtherType, then up to 1500 bytes of {{payload|payload}}, then a 4-byte CRC. That is the [[ethernet|Ethernet]] II frame in 1980 and in 2025. Everything that scaled — {{bandwidth|bandwidth}}, switching, VLANs (802.1Q), jumbo frames — slid in around it without breaking the wire format.

**Jumbo frames (9000 bytes)** popularised by Alteon in 1998 are still technically non-standard 28 years later. The **1500-byte MTU** from the 1980 DIX (DEC/Intel/Xerox) choice still rules in production internet links. Routers MUST support 1500; jumbo frames MAY be supported per {{peering|peering}} agreement. The conservative default has held because changing it requires every device on a path to agree, and one device that does not is a black hole.

The naming history is its own joke: **802.3 letter suffixes ran out at "z"** (1000BASE-X), forcing 802.3aa, ab, …, eventually **df (800 GbE) and dj (1.6 TbE)**. The standards process kept producing letters faster than the alphabet could supply them.`
						},
						{
							type: 'narrative',
							title: 'AI Training Fabrics — The Current Gold Rush',
							text: `**IEEE 802.3df-2024 (800 GbE)** was approved 16 February 2024 and published March 2024. **IEEE P802.3dj (1.6 TbE at 200 Gb/s/lane PAM-4)** passed its 3rd Working Group recirculation ballot **16 December 2025 with 87% approval** — expected ratification mid-2026.

**2025 milestone**: **Broadcom Tomahawk 6** — world's first **102.4 Tbps single-chip switch** — shipped 3 June 2025; **Tomahawk 6-Davisson with co-packaged optics** shipped October 2025. A single chip can drive 64×1.6T, 128×800G, 256×400G, or 512×200G ports.

The **[[frontier:ultra-ethernet-1-0|Ultra Ethernet Consortium]] Specification 1.0** was published 11 June 2025 (~560 pages) — the first ground-up rethink of how [[ethernet|Ethernet]] carries RDMA traffic for AI/HPC workloads. Defines **Ultra [[ethernet|Ethernet]] Transport (UET)**: packet spraying with multipath, selective {{retransmission|retransmission}}, in-network telemetry-driven {{congestion-control|congestion control}}, ephemeral/{{connectionless|connectionless}} transport state for millions of endpoints.

**650 Group estimates 91% of AI workloads will run on [[ethernet|Ethernet]] by 2029**; NVIDIA Spectrum-X delivers ~95% effective throughput vs ~60% on best-effort [[ethernet|Ethernet]] for AI workloads. The architectural significance is that AI training is now important enough to drive a new datacenter transport — the same kind of pressure that produced [[ethernet|Ethernet]] in 1973 for office networking, [[tcp|TCP/IP]] in 1981 for inter-network research, and [[quic|QUIC]] in 2012 for the modern web.`
						}
					]
				},
				{ kind: 'pioneer', id: 'bob-metcalfe' },
				{ kind: 'pioneer', id: 'david-boggs' },
				{ kind: 'protocol', id: 'ethernet' },
				{ kind: 'frontier', id: 'ethernet-800g' },
				{ kind: 'frontier', id: 'ultra-ethernet-1-0' },
				{ kind: 'outage', id: 'facebook-2021' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'wifi',
			title: 'Wi-Fi',
			synopsis: 'CSMA/CA on the airwaves; from FCC Docket 81-413 to [[wifi|Wi-Fi]] 8.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Mathy Vanhoef has broken [[wifi|Wi-Fi]] every two years on stage: KRACK (2017), Dragonblood (2019), FragAttacks (2021), Framing Frames (2023), SSID Confusion (2024). The cadence is so reliable that the field plans security audits around his summer talks.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Regulatory Big Bang',
							text: `[[wifi|Wi-Fi]] exists because of **FCC Docket 81-413 (9 May 1985)**, championed by **Michael Marcus**, which opened the **902 MHz / 2.4 GHz / 5.8 GHz ISM bands** for unlicensed spread-spectrum use. Without that regulatory action, no consumer wireless networking could have existed. The IEEE [[wifi|802.11]] working group started in 1990; **the first standard, [[wifi|802.11]] (1997)**, shipped at 1 and 2 Mbps. The big consumer breakthroughs were 802.11b (1999) at 11 Mbps and 802.11g (2003) at 54 Mbps.

The fundamental problem: radios cannot listen and transmit simultaneously, so you cannot detect collisions the way wired [[ethernet|Ethernet]] does. [[wifi|Wi-Fi]] instead uses **CSMA/CA** — collision **avoidance**. Before transmitting, a station waits a random backoff window scaled by traffic congestion. Acknowledgements are explicit: every {{unicast|unicast}} frame must be ACKed within microseconds, or the sender retransmits. Half-duplex, mandatory ACKs, and shared spectrum together cap real-world [[wifi|Wi-Fi]] throughput at roughly 60% of the headline number.

**"[[wifi|Wi-Fi]]" is not an acronym.** Phil Belanger of the [[wifi|Wi-Fi]] Alliance confirmed in 2005 that **Interbrand chose the name from 10 candidates**. *"Wireless Fidelity"* was a tagline retrofitted briefly by the WECA board and dropped. The yin-yang logo is also Interbrand's work.`
						},
						{
							type: 'narrative',
							title: 'Wi-Fi 7 Is Here, Wi-Fi 8 Is Different',
							text: `**[[wifi|Wi-Fi]] 7 launched 8 January 2024** ([[wifi|Wi-Fi]] Alliance certification); **IEEE 802.11be amendment approved 26 September 2024**, published 22 July 2025. Headline features: **320 MHz channels, 4096-QAM, Multi-Link Operation, preamble puncturing**. Theoretical peak ~46 Gb/s; ~30 Gb/s required by the PAR.

**The "everyone gets it wrong" technical fact on Multi-Link Operation**: MLO in shipping silicon is mostly **eMLSR** (Enhanced Multi-Link Single Radio), not true STR. **Throughput does NOT add across bands** — eMLSR uses one radio time-sliced across multiple bands. **{{latency|Latency}} consistency is the actual win**, not raw aggregate throughput.

**[[wifi|Wi-Fi]] 8 / 802.11bn** is **NOT a peak-speed upgrade**. Same bands as [[wifi|Wi-Fi]] 7, same 320 MHz max, same ~46 Gb/s PHY peak. PAR objectives: **+25% throughput at given SINR, −25% 95th-percentile latency, −25% MPDU loss across BSS transitions**. Headline features: Multi-AP Coordination, Seamless Roaming Domain, Distributed Resource Units. Targeted for ratification September 2028.

**2025 deployment**: **583 million [[wifi|Wi-Fi]] 7 devices shipped in 2025**; 3.9 billion [[wifi|Wi-Fi]] devices shipped that year for cumulative 48.8 billion lifetime; $4.9 trillion annual global economic value.`
						},
						{
							type: 'callout',
							title: 'Vanhoef every two years',
							text: '**Mathy Vanhoef and the KU Leuven team have broken [[wifi|Wi-Fi]] on stage every ~2 years**: **KRACK** (October 2017, key reinstallation), **Dragonblood** (April 2019, WPA3 SAE side channels), **FragAttacks** (May 2021, {{fragmentation|fragmentation}}/aggregation), **Framing Frames** (March 2023), **SSID Confusion / CVE-2023-52424** (May 2024 — the [[wifi|802.11]] standard does NOT require the SSID to enter PMK or session-key derivation in many config paths). The cadence is so reliable that the field plans security audits around his summer talks.'
						},
						{
							type: 'narrative',
							title: 'The 6 GHz Politics, And the TJX Story That Changed Everything',
							text: `**The US FCC freed 1,200 MHz of 6 GHz spectrum on 23 April 2020**; on **23 February 2024** the FCC OET approved **seven AFC system operators** (Qualcomm, Federated Wireless, Sony, Comsearch, [[wifi|Wi-Fi]] Alliance Services, WBA, Broadcom) for commercial **Standard Power AFC** operation. **First AFC-certified [[wifi|Wi-Fi]] 7 AP (RUCKUS R770) was certified 16 April 2024.**

But on **12 November 2025**, the EU Radio Spectrum Policy Group recommended assigning the **upper 6 GHz band (6585-7125 MHz) to mobile/5G**, holding 6425-6585 MHz pending WRC-27 — **effectively closing the upper band to [[wifi|Wi-Fi]] in the EU for the medium term**. The [[wifi|Wi-Fi]] Alliance "strongly disagrees."

The breach that changed everything: **TJX (disclosed 17 January 2007)** — attackers war-drove a poorly-secured **WEP-protected** [[wifi|Wi-Fi]] at a Marshalls store in Miami starting July 2005; **~94 million customer card records exfiltrated**. TJX settled with 41 state AGs for $9.75M. Drove WPA2 mandates and effectively ended WEP deployment in retail.

**[[wifi|Wi-Fi]] sensing standardised**: 802.11bf-2025 published 26 September 2025, allows CSI-based presence/motion/breathing detection across 1-7.125 GHz and >45 GHz — radio waves as occupancy sensors.`
						}
					]
				},
				{ kind: 'protocol', id: 'wifi' },
				{ kind: 'frontier', id: 'wifi-7-ratified' },
				{ kind: 'simulation', protocolId: 'wifi' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'arp-and-ndp',
			title: 'ARP and NDP',
			synopsis: 'How a packet finds the next physical hop — STD 37 has not been obsoleted in 44 years.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Layer Seam',
							text: `Two layers meet awkwardly inside your network adapter. The [[ip|IP]] layer thinks in terms of 32-bit [[ip|IPv4]] addresses (or 128-bit [[ipv6|IPv6]]). The [[ethernet|Ethernet]] layer thinks in terms of 48-bit MAC addresses burned into the silicon. To send a packet to **192.0.2.5**, the kernel needs to know which **{{mac-address|MAC address}}** on the local segment owns that [[ip|IP]] — and that mapping is not given anywhere in advance.

The **Address Resolution Protocol** ([[arp|ARP]], **[[rfc:826|RFC 826]]**, November 1982) solves it with the simplest {{broadcast|broadcast}} you can imagine: shout "who has 192.0.2.5?" onto the wire, and the host that owns it shouts back "I do, MAC ab:cd:..." Cache the answer for a few minutes; repeat when it expires.

David C. Plummer at Symbolics/MIT-AI wrote RFC 826 from address \`DCP@MIT-MC\` in November 1982. **STD 37 has never been obsoleted in 44 years** — only updated by RFC 5227. The 28-byte [[arp|ARP]] packet (padded to 60 by [[ethernet|Ethernet]]) is one of the smallest standard PDUs on the Internet; HLEN/PLEN are variable on purpose so the same wire format outlived Token Ring, FDDI, ATM, and Frame Relay.`
						},
						{
							type: 'callout',
							title: 'ARP has no checksum and no authentication',
							text: '[[arp|ARP]] relies entirely on the L2 {{checksum|frame check sequence}} — no application-layer integrity. It also trusts the first reply that comes back. Which is why **[[arp|ARP]] {{spoofing|spoofing}} is an entry-level network attack**, why every enterprise switch has Dynamic [[arp|ARP]] Inspection, and why **dsniff (Dug Song, 1999), Ettercap (Ornaghi/Valleri, 2001), and Firesheep (Eric Butler, October 2010)** all became famous tools by exploiting it. Firesheep on coffee-shop [[wifi|Wi-Fi]] was the proximate cause of the industry-wide HTTPS-everywhere push.'
						},
						{
							type: 'narrative',
							title: 'The IPv6 Successor — and Its CVE Year',
							text: `[[ipv6|IPv6]] redesigned the same idea as the **Neighbor Discovery Protocol** ([[rfc:4861|RFC 4861]]). Same shape — solicitation, advertisement — but on top of [[icmp|ICMPv6]], with optional **Secure Neighbor Discovery** (SEND, RFC 3971) using cryptographic addresses to defeat {{spoofing|spoofing}}.

NDP also folds in router discovery and {{stateless|stateless}} autoconfiguration ([[rfc:4862|SLAAC]]), so a fresh-booted [[ipv6|IPv6]] host can pick its own address and find the local router without [[dhcp|DHCP]]. **VRRPv3 reissued as RFC 9568 (April 2024)** updated gratuitous-[[arp|ARP]] behavior on master transition.

Two NDP CVEs deserve naming.

**CVE-2024-38063 (Microsoft, August 2024)** — \`tcpip.sys\` integer underflow in [[ipv6|IPv6]] fragment reassembly. CVSS 9.8, "exploitable from anywhere on the link." Patched 13 August 2024.

**CVE-2020-16898 "Bad Neighbor" (13 October 2020)** — Windows \`tcpip.sys\` mishandled an ICMPv6 RA with even-length RDNSS option. CVSS 8.8; remote-code-execution claimed wormable. The [[ipv6|IPv6]] stack was supposed to be cleaner than [[ip|IPv4]]'s; the CVE history shows the implementations are no less intricate.

**SEND (RFC 3971) remains stillborn**: NIST SP 800-119 §5.4.3 acknowledged in 2010 that cryptographic NDP isn't deployed; nothing has changed in 2024-2026.`
						},
						{
							type: 'narrative',
							title: 'Three Operational Footguns to Know',
							text: `**AWS does not run [[arp|ARP]].** Per AWS *Logical Separation* whitepaper, *"[[arp|ARP]] packets never hit the network as they are not needed for discovery of the virtual network topology"* — every [[arp|ARP]] request inside a VPC is intercepted and answered by the hypervisor from an authenticated central database. If you have ever wondered why \`arp -a\` looks weird in EC2, that is why.

**Linux \`gc_thresh3=1024\` default silently drops traffic on cloud hosts with >700 neighbors.** Symptom: \`dmesg\` floods with \`neighbour: arp_cache: neighbor table overflow!\` Documented as Ubuntu/OpenStack bug 1780348 (still relevant in 2026). Cure: bump \`net.ipv4.neigh.default.gc_thresh3\` and friends.

**iOS 18 / macOS Sequoia (September 2024) introduced "Rotate [[wifi|Wi-Fi]] Address" mode** that changes MAC every 14 days on weak/open networks, breaking captive portals, MAC-based [[dhcp|DHCP]] reservations, and [[arp|ARP]]-cache freshness assumptions. Many enterprise [[wifi|Wi-Fi]] deployments needed reconfiguration.

**Frontier — [[ipv6|IPv6]]-mostly is going mainstream**: RFC 8925 + RFC 8781 + {{four-six-four-xlat|464XLAT}} lets a single SSID/{{vlan|VLAN}} serve dual-stack laptops AND [[ipv6|IPv6]]-only-capable phones simultaneously, with the [[ipv6|IPv6]]-only-capable hosts **never running [[arp|ARP]]**. Apple iOS/macOS, Android, and recent macOS request [[dhcp|DHCP]] option 108 by default; Windows is lagging. The day [[arp|ARP]] becomes vestigial is approaching.`
						}
					]
				},
				{ kind: 'protocol', id: 'arp' },
				{ kind: 'rfc', number: '826' },
				{ kind: 'rfc', number: '4861' },
				{ kind: 'rfc', number: '4862' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'ipv4',
			title: 'IPv4',
			synopsis: 'The 32-bit address that ran fifty years longer than planned.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'I am a little embarrassed about that because I was the guy who decided that 32-bit was enough for the Internet experiment. My only defense is that that choice was made in 1977, and I thought it was an experiment.',
					attribution: 'Vint Cerf, Linux.conf.au 2011'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The 32-Bit Experiment That Became the Internet',
							text: `When [[pioneer:vint-cerf|Vint Cerf]] picked 32 bits for the {{ip-address|IP address}} field in 1977, he was asked whether it would be enough. His honest answer: more than enough for an experiment that he expected to be replaced before it had a million hosts. The "experiment" became the global internet.

**[[rfc:791|RFC 791]] (September 1981, Postel)** is the canonical text — still cited 45 years later. **Flag day 1 January 1983**: ARPANET cut over from NCP to [[tcp|TCP]]/[[ip|IP]]. The 4.3-billion-address space ran out for the first time in **February 2011**, when IANA allocated the last five /8 blocks to the regional registries.

The exhaustion timeline: **IANA Feb 3 2011; APNIC Apr 15 2011; RIPE Sep 14 2012; LACNIC Jun 10 2014; ARIN Sep 24 2015; AFRINIC Apr 21 2017**. Each region went depleted on its own schedule; the regional asymmetry is part of why [[ip|IPv4]] prices and policy still vary by RIR.`
						},
						{
							type: 'callout',
							title: 'Every TCP connection >6.4 Mbps technically violated RFC 791 until 2013',
							text: 'Read literally, the original [[ip|IPv4]] spec limited any pair of hosts to ~6.4 Mbps for 1500-byte packets — because the 16-bit Identification field would have to repeat within the maximum segment lifetime. **Every [[tcp|TCP]] connection above 6.4 Mbps you have made since 1995 has technically violated [[rfc:791|RFC 791]].** **[[rfc:6864|RFC 6864]] (February 2013) retroactively legalised what every implementation was already doing**: relax the uniqueness requirement when "Don\'t Fragment" is set. Sometimes the spec catches up to reality.'
						},
						{
							type: 'narrative',
							title: 'NAT Changed Everything',
							text: `Three engineering tricks stretched [[ip|IPv4]] a generation past what its designers planned.

**{{cidr|CIDR}}** (Classless Inter-Domain Routing, RFC 1519, 1993) abolished the rigid Class A/B/C boundaries and let routes be aggregated by arbitrary prefix length — collapsing the global {{routing-table|routing table}} from 70k entries headed for the moon down to a manageable 20k.

**NAT** (Network Address Translation, RFC 1631, 1994) let one public [[ip|IP]] front for thousands of private hosts behind a router.

**Private address ranges** ([[rfc:1918|RFC 1918]], 1996) — 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — gave organisations enormous internal address space without consuming any public IPs.

Together these stretched [[ip|IPv4]] from "exhausted in 1995" to "still ~50% of internet traffic in 2026." But the cost compounds: NAT breaks end-to-end addressability, complicates every protocol that needs inbound connections ({{peer-to-peer|peer-to-peer}}, voice, gaming), and forces middleboxes that ossify the entire stack. The transition to [[ipv6|IPv6]] ([[frontier:ipv6-50-percent|crossed 50% on Google in March 2026]]) is what eventually fixes this.`
						},
						{
							type: 'narrative',
							title: 'The 2024 AWS Forcing Function and the IPv4 Market',
							text: `**AWS began charging $0.005/[[ip|IP]]/hour for every public [[ip|IPv4]] address on 1 February 2024** — $43.80/year per address. AWS owns ~1.7% of the entire [[ip|IPv4]] space (~100M addresses). Cloudflare estimated this as a ~$2B "tax on the Internet." Within months, AWS workloads at scale began migrating to [[ipv6|IPv6]]-only architectures with {{nat64|NAT64}} gateways for legacy [[ip|IPv4]] destinations. The economic forcing function did more for [[ipv6|IPv6]] deployment in 2024 than two decades of advocacy.

**The [[ip|IPv4]] secondary market**: mid-2024 averages were $32-36/[[ip|IP]]; in **June 2025 /16 prices fell below $20/[[ip|IP]] for the first time since 2019**; January 2026 mean: $22/[[ip|IP]], with a /14 block transferred at $9/[[ip|IP]]. The market has inverted from "exhaustion-driven scarcity premium" to "post-exhaustion oversupply" as [[ipv6|IPv6]]-mostly deployment frees v4 blocks.

**End-2025 routing scale**: Global [[bgp|BGP]] DFZ surpassed **1,000,000 [[ip|IPv4]] prefixes in September 2025** (~1,040,000-1,050,000 by year-end), advertised by ~46,800 ASNs.

**[[outage:pakistan-youtube-2008|Pakistan Telecom's YouTube hijack (24 February 2008)]]** — PTCL announced 208.65.153.0/24 (more-specific of YouTube's /22), PCCW Global propagated, YouTube went dark globally for ~2 hours. Drove {{rpki|RPKI}} / BGPsec / MANRS work that finally accelerated in 2024-2025.

**Linux 6.3 (April 2023, deployed in 2024)** shipped **BIG [[tcp|TCP]] for [[ip|IPv4]]** — TSO/GRO superpackets above 64 KB on 100/200 Gb NICs. **Cloudflare blocked 47.1 million DDoS attacks in 2025**; peaked at **31.4 Tbps for one 35-second burst** (Aisuru-Kimwolf Android-TV botnet, December 2025).`
						}
					]
				},
				{ kind: 'protocol', id: 'ip' },
				{ kind: 'rfc', number: '791' },
				{ kind: 'rfc', number: '1918' },
				{ kind: 'outage', id: 'pakistan-youtube-2008' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'ipv6',
			title: 'IPv6',
			synopsis: 'A 28-year transition that just crossed 50% on 28 March 2026.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Geoff Huston projected linear extrapolation puts [[ipv6|IPv6]] transition completion around late 2045 — and warned that v4/v6 coexistence may be a steady state, not a transition.',
					attribution: 'APNIC Labs, October 2024'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why "v6"? Because v5 Was Already Taken',
							text: `Why "v6"? **Version 5 was already claimed by the experimental ST/ST-II Stream Protocol** (real-time transport). SIPP took 6, and won. The IPng selection happened at the **"BigTen" retreat near Chicago, 19-20 May 1994**, where the IPng Directorate met with WG chairs. SIPP-128 was selected at the Toronto IETF on 25 July 1994 ([[pioneer:steve-deering|Steve Deering]] / Robert Hinden lineage).

[[ipv6|IPv6]] was specified in 1995 (RFC 1883), revised as RFC 2460 in 1998, and finally became **STD 86 / [[rfc:8200|RFC 8200]] in July 2017** — 19 years after RFC 2460, 22 years after the original. The address field grew from 32 bits to **128 bits** — enough that every grain of sand on Earth could have its own {{subnet|subnet}}. The header was simplified, {{fragmentation|fragmentation}} was pushed to the edges, {{multicast|multicast}} and link-local autoconfiguration ([[rfc:4862|SLAAC]]) became core mechanisms.

It then took **twenty-eight years** to reach 50% adoption. The reason is not technical; it is the chicken-and-egg of network effects.`
						},
						{
							type: 'callout',
							title: 'IPv6 is NOT encrypted by default',
							text: 'IPsec was originally mandatory-to-implement in [[ipv6|IPv6]], but **demoted to optional by [[rfc:6434|RFC 6434]] (2011)**. A frequent source of myth that [[ipv6|IPv6]] has built-in security. It does not. The {{encryption|encryption}} story for [[ipv6|IPv6]] is the same as for [[ip|IPv4]]: [[tls|TLS]] at the application layer.'
						},
						{
							type: 'narrative',
							title: 'The 50.1% Crossing — And Why It Inflected',
							text: `**On 28 March 2026, Google\'s [[ipv6|IPv6]] dashboard recorded 50.1% for the first time** — [[ipv6|IPv6]] briefly surpassed [[ip|IPv4]] in Google's measured user base. APNIC Labs and Cloudflare Radar still place global [[ipv6|IPv6]] capability in the **40-43%** range; the 50% number is a Google-specific snapshot. But it is a milestone the community has been waiting for since 1995.

Adoption inflected when **mobile carriers** went [[ipv6|IPv6]]-mostly for cellular subscribers. **T-Mobile US** moved its mobile core to [[ipv6|IPv6]]-only with {{four-six-four-xlat|464XLAT}} (Cameron Byrne, NANOG 61, 2014) — the production case study that defined the pattern. **Reliance Jio (India)** launched [[ipv6|IPv6]]-first in 2016 — >237M [[ipv6|IPv6]] users by 2017 — single biggest reason India's [[ipv6|IPv6]] share now runs 67-80%. **Meta** runs >99% of internal datacenter traffic over [[ipv6|IPv6]]; entire new clusters are [[ipv6|IPv6]]-only. Meta says **internal [[ipv6|IPv6]] is 10-15% faster than [[ip|IPv4]]** (and on one carrier mobile measurement, 40% faster).

By 2026: **US mobile [[ipv6|IPv6]] averages ~87%**; **France 86%** (Google, Feb 2026); **Germany 68%**; **China 865M [[ipv6|IPv6]] users (77% of users); 34% of traffic** (Sept 2025).`
						},
						{
							type: 'narrative',
							title: 'The KAME Turtle, And the 2024 RFC Backlog',
							text: `**The KAME Project (1998-March 2006)** — joint Fujitsu / Hitachi / IIJ / NEC / Toshiba / Yokogawa / Keio U. / U.Tokyo — produced the free reference [[ipv6|IPv6]]/IPsec stack underlying **FreeBSD, macOS, and iOS**. The dancing turtle still appears at kame.net for [[ipv6|IPv6]]-reachable visitors. If you ever wondered where Apple's [[ipv6|IPv6]] stack came from, the answer is "a Japanese collaboration from 1998 named after a turtle." (Most modern Apple [[ipv6|IPv6]] work has long since moved past KAME, but the lineage is real.)

The 2024 IETF backlog tells the story of where [[ipv6|IPv6]] work is happening:
- **RFC 9637 (August 2024)** added \`3fff::/20\` as a second [[ipv6|IPv6]] documentation prefix on top of \`2001:db8::/32\`, large enough to model multi-AS networks.
- **RFC 9673 (October 2024)** finally relaxed Hop-by-Hop Options handling so HBH options are deployable on real router silicon.
- **RFC 9602 (2024)** reserved \`5f00::/16\` for SRv6 SIDs.
- **\`face:b00c\` was removed from Linux kernel traces in 2024** because the example prefix from RFC 5514 was being mistaken for a real prefix in copy-pasted configs.

**Frontier**: SoftBank (Dec 2025) announced the world's first commercial 5G deployment using **SRv6 MUP**; Microsoft Azure Fairwater (OCP 2025) uses **SRv6 as fabric** for what Microsoft calls the largest AI back-end network in the world.

**Apple iCloud Private Relay** (Oct 2021+) prefers [[ipv6|IPv6]] egress when AAAA exists; pure [[ip|IPv4]]-only enterprise networks frequently break Private Relay — its own forcing function for [[ipv6|IPv6]] deployment in enterprises that want Apple-device compatibility.`
						}
					]
				},
				{ kind: 'protocol', id: 'ipv6' },
				{ kind: 'pioneer', id: 'steve-deering' },
				{ kind: 'rfc', number: '8200' },
				{ kind: 'frontier', id: 'ipv6-50-percent' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'icmp',
			title: 'ICMP',
			synopsis: 'Ping, traceroute, and the diagnostic backplane.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'I named it after the sound that sonar makes, inspired by the whole principle of echo-location.',
					attribution: 'Mike Muuss, on writing ping in December 1983'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Mike Muuss\'s One-Night Tool',
							text: `[[icmp|ICMP]] ([[rfc:792|RFC 792]], September 1981) is the protocol that lets the network tell you something is wrong without opening a connection. When a router drops your packet because the **TTL** hit zero, it sends an [[icmp|ICMP]] **Time Exceeded** back to you — the mechanism that **traceroute** exploits to map every hop along a path. When a destination is unreachable, you get **Destination Unreachable**. When a router has too small an MTU for your packet and the **Don't Fragment** bit is set, it sends **{{fragmentation|Fragmentation}} Needed**, which is what **{{path-mtu-discovery|Path MTU Discovery}}** depends on.

The most famous [[icmp|ICMP]] message is **Echo Request / Echo Reply** — what **ping** sends. **Mike Muuss** wrote ping at BRL Aberdeen **in December 1983 in a single night** after hearing Dave Mills describe Fuzzball {{latency|latency}}-timing experiments. He had to write the kernel raw-[[icmp|ICMP]] socket support too because it didn't exist. *"Had everything working well before sunrise."*

**"Ping" is named after sonar**, not an acronym. Mike Muuss explicitly debunked the "Packet INternet Groper" backronym himself: *"I named it after the sound that sonar makes, inspired by the whole principle of echo-location."* He also coined "default route" / "{{gateway|default gateway}}." **Mike Muuss died on 20 November 2000** in an automobile collision on Interstate 95, age 42.`
						},
						{
							type: 'callout',
							title: 'Dropping ICMP at the firewall is partially refusing to implement IP',
							text: 'Read literally, **[[rfc:1122|RFC 1122]] §3.2.2 says "[[icmp|ICMP]] is a control protocol that is considered to be an integral part of [[ip|IP]]."** Every [[ip|IP]] host MUST answer Echo Requests by spec. Dropping [[icmp|ICMP]] at your border {{firewall|firewall}} is, in standards terms, partially refusing to implement [[ip|IP]]. It also breaks {{path-mtu-discovery|Path MTU Discovery}} and creates the {{mtu-black-hole|"MTU black hole"}} failure mode where [[tcp|TCP]] connections hang because the network can neither deliver the large packet nor signal that it cannot.'
						},
						{
							type: 'narrative',
							title: 'Two Famous Attacks That Renamed the Field',
							text: `**Smurf attack (1997-1998)**: Tool \`smurf.c\` written by Dan Moschuk (alias TFreak); [[icmp|ICMP]] Echo Requests with spoofed source to a network's directed {{broadcast|broadcast}} address; first high-profile incident University of Minnesota, 1998. **RFC 2644 (August 1999)** changed router default from "forward directed broadcasts" to "drop." Every modern router has the fix; Smurf is now a museum piece, but it is the reason directed-broadcast forwarding is off by default everywhere.

**Ping of Death (1996-1997)**: Oversized fragmented [[icmp|ICMP]] packets, when reassembled, exceeded 65,535 bytes and crashed Windows 95/NT, early Linux/BSD, Cisco IOS, and classic Mac. **CERT advisory CA-1996-26 (16 December 1996)**. Modern stacks check for total length overflow before reassembly; the bug is closed but the lesson — that fragment reassembly is one of the most critical security paths in any [[ip|IP]] stack — survives in the **CVE-2024-38063** Windows [[ipv6|IPv6]] fragment integer underflow disclosed 13 August 2024 (CVSS 9.8, "exploitable from anywhere on the link").

**Cloudflare 2014 PMTUD black-hole**: Cloudflare's blog *"{{path-mtu-discovery|Path MTU Discovery}} in Practice"* documented [[icmp|ICMP]] Type 3/Code 4 messages getting filtered before reaching servers — [[tcp|TCP]] handshakes complete, then HTTP responses hang forever. Drove industry rollout of **RFC 4821 PLPMTUD** (Packetisation-Layer PMTUD) which probes path MTU at the application layer instead of relying on routers to send [[icmp|ICMP]] back.`
						},
						{
							type: 'narrative',
							title: 'The 2024 CVE Wave and the Frontier',
							text: `**2024 scale**: Cloudflare mitigated **21.3 million DDoS attacks in 2024** (53% YoY), single biggest 5.6 Tbps Mirai-variant flood. [[icmp|ICMP]] reflection still ranked among network-layer DDoS vectors, though the protocol's role has shrunk as [[dns|DNS]]/[[ntp|NTP]]/[[udp|UDP]]-amplification attacks dominate the headlines.

**Linux became its own CVE Numbering Authority on 13 February 2024** — **3,108-3,529 kernel CVEs in 2024** (NIST/CIQ) — a 79% YoY increase, mostly from process change not real bug rate. [[icmp|ICMP]]-tagged kernel CVEs include CVE-2024-47678 (icmp rate limit ordering) and CVE-2024-56647 ([[icmp|ICMP]] host re-lookup triggering ip_rt_bug).

**2020 Internet-wide measurement (SMap study)**: **69.8% of ASes still don't filter spoofed packets at ingress** — substrate that makes [[icmp|ICMP]] reflection still feasible.

**Frontier**: Tsinghua's \`draft-xu-intarea-challenge-icmpv4-02\` (February 2025) proposes a challenge-confirm scheme using [[ip|IP]] options so receivers can verify a router actually saw the original packet — the most concrete proposal in years to fix [[icmp|ICMP]]'s "anyone-can-spoof-any-error" weakness. \`draft-ietf-6man-icmpv6-reflection-19\` (December 2025) defines a {{stateless|stateless}} probe-and-reflect ICMPv6 utility, currently active.

**GGP (RFC 823, September 1982)** is [[icmp|ICMP]]'s parent — the Gateway-to-Gateway Protocol on BBN's LSI-11 gateways, predecessor of EGP (1984) and grand-uncle of [[bgp|BGP]]. The diagnostic mechanism predates the routing protocol.`
						}
					]
				},
				{ kind: 'protocol', id: 'icmp' },
				{ kind: 'rfc', number: '792' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'bgp',
			title: 'BGP',
			synopsis: 'Three napkins, every {{transit|transit}} relationship, no built-in trust.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[bgp|BGP]] doesn\'t have a real authentication story for 30+ years. The 16-byte all-ones Marker field at the start of every [[bgp|BGP]] message was originally a placeholder for an authentication digest — now vestigial.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Two-Napkin Protocol',
							text: `**The "Two-Napkin Protocol" was sketched at IETF 12, Austin, Texas, January 1989**: **[[pioneer:yakov-rekhter|Yakov Rekhter]]** (IBM Watson) and **Kirk Lougheed** (Cisco) over cafeteria napkins. The previous routing protocol (EGP) had become unmanageable; the internet was about to outgrow it. The originals went in the trash; **Cisco's archivist preserved photocopies that hang in Milpitas**. Expanded to three handwritten sheets — hence "Three-Napkin Protocol."

That sketch became [[rfc:4271|BGP-1]] (RFC 1105, June 1989), then [[bgp|BGP]]-4 (RFC 1771, 1995), then the current [[rfc:4271|RFC 4271]] (2006). The protocol has been backwards-compatible for over thirty years across more than 100,000 ASes.

**The 16-byte all-ones Marker field at the start of every [[bgp|BGP]] message** was originally a placeholder for an authentication digest — now vestigial. Modern auth is below [[bgp|BGP]] ([[tcp|TCP]]-MD5/[[tcp|TCP]]-AO) or above ({{rpki|RPKI}}/BGPsec/{{aspa|ASPA}}). Source of the running joke "[[bgp|BGP]] doesn't have a real authentication story for 30+ years."`
						},
						{
							type: 'callout',
							title: 'MED is meaningful only between paths from the same neighbour AS',
							text: 'The "everyone gets it wrong" technical fact: **Multi-Exit Discriminator (MED) is meaningful only between paths from the same neighbour AS.** Comparing MEDs cross-AS is meaningless and frequently misconfigured. Every [[bgp|BGP]] operator burns a few hours on this at some point. The standard does not enforce same-AS comparison; you have to know.'
						},
						{
							type: 'narrative',
							title: 'A Catalogue of Famous Failures',
							text: `**[[outage:as-7007-1997|AS 7007 (25 April 1997, 11:30 EST)]]**: MAI Network Services leaked a deaggregated copy of much of the global {{routing-table|routing table}} as /24s; /24s win longest-prefix match, so Internet traffic funnelled toward AS7007's tiny edge routers. Several hours of partial Internet meltdown — the canonical inspiration for max-prefix limits and prefix filtering.

**KlaySwap (3 February 2022)**: First known live attack that leveraged [[bgp|BGP]] to break the WebPKI. Attackers [[bgp|BGP]]-hijacked Kakao's prefix to obtain a valid [[tls|TLS]] cert for \`developers.kakao.com\` via DCV; replaced JS to authorise user wallets to attacker contracts. **Loss ~$1.9M.** A new failure class — *DCV-via-[[bgp|BGP]]-hijack* — that argues for ACME's "multi-perspective" issuance now used by Let's Encrypt.

**Verizon × DQE × Allegheny Technologies (24 June 2019)**: A steel mill rerouted 20,000 prefixes for ~2,400 networks via Noction [[bgp|BGP]] optimizer leak. **Cloudflare lost 15% of global traffic at peak.** Cloudflare's blog became canonical reading.

**[[outage:rogers-2022|Rogers Communications outage (8 July 2022, 26 hours, 12M Canadians)]]**: Removal of an ACL filter from a distribution router redistributed the full [[bgp|BGP]] table into OSPF, overloading core router CPU/RAM. Shared wireline+wireless [[ip|IP]] core meant **everything (including 911) fell**. Staff couldn't communicate because internal management network depended on the same data plane.

**The 512K Day (12 August 2014)**: When [[ip|IPv4]] DFZ crossed 512,000 prefixes, older Cisco line cards with default 512K-route TCAMs failed silently; eBay, LastPass, Microsoft Azure had visible outages. Hardware capacity is part of routing-table economics.

**JunOS/Arista session-reset incident (20 May 2025)**: A malformed [[bgp|BGP]] UPDATE with all-zero RFC 8669 Prefix-SID attribute (40), originated by AS9304 Hutchison or AS135338 Starcloud, leaked to public DFZ. **JunOS and Arista EOS crashed sessions.** IOS-XR, Nokia SR OS, BIRD correctly applied RFC 7606 "treat-as-withdraw." Implementation diversity matters.`
						},
						{
							type: 'narrative',
							title: 'The 2024-2026 Cleanup Wave',
							text: `Several long-pending RFCs landed in the past two years.

**[[rfc:4271|RFC 9582 (May 2024)]]** replaced RFC 6482 as the current ROA profile (Snijders, Maddison, Lepinski, Kong, Kent — clarifies X.509 extensions, fixes errata, mandates canonicalisation).

**RFC 9687 (November 2024)** added the **\`SendHoldTimer\`** to the [[bgp|BGP]] FSM — closing the **"[[bgp|BGP]] zombie" failure mode** where a [[tcp|TCP]] socket stops draining and withdrawn routes linger forever.

**RFC 9774 (May 2025)** formally **deprecates \`AS_SET\` and \`AS_CONFED_SET\`** with a normative MUST NOT — speakers must "treat-as-withdraw" any UPDATE containing them.

**{{aspa|ASPA}} (AS Provider Authorization)** is *still* an Internet-Draft as of May 2026 — \`draft-ietf-sidrops-aspa-verification-25\` (October 2025) and \`draft-ietf-sidrops-aspa-profile-26\` (April 2026). Cisco ran an **Early Field Trial of ASPA on IOS-XR in 2025**. SIDROPS chair Job Snijders has signalled the WG is "close to last call."

**The June 2024 FCC NPRM** is the first-ever U.S. federal proposal to compel the nine largest BIAS providers (AT&T, Altice, Charter, Comcast, Cox, Lumen, T-Mobile, TDS/US Cellular, Verizon) to file [[bgp|BGP]] Routing Security Risk Management Plans and quarterly {{rpki|RPKI}} deployment reports. As of March 2024, only **~22% of US-originated routes had ROAs**.

**2026 RPKI scale**: ~54% of [[ip|IPv4]] prefixes and ~54% of [[ipv6|IPv6]] prefixes are ROA-covered; **~74% of [[ip|IP]] traffic** is destined to ROA-covered networks (Kentik). [[frontier:rpki-rov-50-percent|IPv4 first crossed 50% ROA coverage in May 2024.]] **BIRD 3.0 (January 2025)** was the first stable multithreaded [[bgp|BGP]] implementation, scaling to 5,000+ peers. The protocol is finally being given the security guardrails it should have had thirty years ago.`
						}
					]
				},
				{ kind: 'pioneer', id: 'yakov-rekhter' },
				{ kind: 'protocol', id: 'bgp' },
				{ kind: 'rfc', number: '4271' },
				{ kind: 'outage', id: 'facebook-2021' },
				{ kind: 'outage', id: 'as-7007-1997' },
				{ kind: 'outage', id: 'pakistan-youtube-2008' },
				{ kind: 'frontier', id: '{{rpki|rpki}}-rov-50-percent' }
			]
		}
	]
};
