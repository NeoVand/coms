import type { SubcategoryStory } from './types';

export const linkLayerStory: SubcategoryStory = {
	subcategoryId: 'link-layer',
	tagline:
		"How bits cross a single physical segment — frames, MAC addresses, and the L2/L3 bridge that holds them together",
	sections: [
		{
			type: 'narrative',
			title: 'The Layer Underneath Everything',
			text: `Every packet on the Internet is wrapped, at the moment it crosses any wire or wireless link, in a **frame**. The frame carries the packet plus the addresses of the two physical endpoints involved in *this hop*. The packet might be making a 14-hop journey across the planet; each hop happens at the link layer, with a fresh frame and a fresh pair of physical addresses.\n\nThe link-layer family in this app has two members because they answer two complementary questions:\n\n- **[[ethernet|Ethernet]]** (IEEE 802.3, 1983) answers *how a frame physically gets across a single segment*. The 48-bit MAC address. The 1500-byte MTU (mostly). The CSMA/CD collision-detection mechanism (now historical, replaced by full-duplex switched links). The Ethernet header is what every IP packet wears when it's in transit on a wire — even when the underlying technology is Wi-Fi, fiber, or 5G, the protocols above the link mostly assume Ethernet-shaped framing.\n- **[[arp|ARP]]** ([[rfc:826|RFC 826]], 1982) answers *how a sender on a local segment finds the MAC address for the next-hop IP*. It's the protocol that lives in the crack between Layer 2 (Ethernet) and Layer 3 (IP). You have a packet destined for 192.168.1.50; you know it's on your local subnet; you don't know its MAC. ARP broadcasts "who has 192.168.1.50?" on the segment; the host with that IP replies; you cache the mapping for a few minutes.\n\nEthernet and ARP together are how packets actually move across the wire under all the higher-layer protocols. They're also a perfect example of a *layering crime* that nobody minds: ARP can't be neatly placed in either Layer 2 or Layer 3 because it bridges them. The TCP/IP textbook treatment usually calls it "Layer 2.5" and moves on.\n\nThis layer is, ironically, the place where Internet protocols are *most* shaped by physical reality. Frame sizes match Ethernet history. Addresses are 48 bits because that's what fit in a Xerox PARC chip in 1980. The number of devices on a segment was constrained by collision dynamics. Forty-five years later, the Layer 2 of a Cloudflare data center is still recognizably the Layer 2 of a 1983 office LAN.`
		},
		{
			type: 'pioneers',
			title: 'The Link-Layer Architects',
			people: [
				{
					id: 'bob-metcalfe',
					name: 'Bob Metcalfe',
					years: '1946–',
					title: 'Inventor of Ethernet',
					org: 'Xerox PARC / 3Com / Univ. of Texas',
					contribution:
						"Designed [[ethernet|Ethernet]] at Xerox PARC in 1973 with [[pioneer:david-boggs|David Boggs]] — originally for connecting Alto workstations to a single coaxial cable. The 1973 prototype ran at 2.94 Mbps. Co-founded 3Com in 1979 to commercialize Ethernet. Won the Turing Award in 2022, ~50 years after the design. Metcalfe\\'s Law (the value of a network grows with the square of its users) is the rule-of-thumb for network economics that came from his cable-shop years."
				},
				{
					id: 'david-boggs',
					name: 'David Boggs',
					years: '1950–2022',
					title: 'Co-Inventor of Ethernet',
					org: 'Xerox PARC / DEC',
					contribution:
						"Co-designed [[ethernet|Ethernet]] at Xerox PARC with [[pioneer:bob-metcalfe|Metcalfe]]. Boggs did much of the deep electrical engineering — the original Ethernet transceiver was Boggs\\'s, as was much of the prototyping. The legendary collision-detection circuit (the analog electronics that let multiple senders detect when they\\'d transmitted simultaneously, before digital circuits could process the timing) was largely his work. Boggs later worked on DEC\\'s gigabit Ethernet design and remained an Ethernet advocate his whole career."
				},
				{
					id: 'radia-perlman',
					name: 'Radia Perlman',
					years: '1951–',
					title: '"Mother of the Internet" / Spanning Tree Protocol',
					org: 'DEC / Sun / EMC / Dell',
					contribution:
						"Invented the Spanning Tree Protocol (STP, 1985) — the algorithm that lets a multi-bridge Ethernet network avoid loops without manual configuration. Without STP, two Ethernet switches connected together would form a broadcast loop that would melt the network in milliseconds. Perlman\\'s algorithm — elect a root bridge, compute least-cost path, block redundant ports — made Ethernet scale beyond a single segment. Also wrote IS-IS (an IGP routing protocol) and the canonical textbook *Interconnections*."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'Ethernet at Xerox PARC',
					description:
						"[[pioneer:bob-metcalfe|Metcalfe]] and [[pioneer:david-boggs|Boggs]] design Ethernet for connecting Alto workstations. Initial design memo dated May 22, 1973. Runs at 2.94 Mbps on a single coaxial cable."
				},
				{
					year: 1980,
					title: 'DIX Ethernet Specification',
					description:
						'DEC, Intel, and Xerox publish the "Ethernet Blue Book" — the 10 Mbps Ethernet that the world adopts. Coax (10BASE-5, "thicknet") is the original; later 10BASE-2 ("thinnet") and 10BASE-T (twisted pair) follow.'
				},
				{
					year: 1982,
					title: 'ARP RFC 826',
					description:
						"[[arp|ARP]] standardized. The protocol that bridges IP addressing and Ethernet MAC addressing — sit-at-Layer-2.5 forever."
				},
				{
					year: 1983,
					title: 'IEEE 802.3 Standardized',
					description:
						"The IEEE's formal Ethernet standard. Initial differences with DIX (frame format, mostly) caused some incompatibility; the two converged over the next few years."
				},
				{
					year: 1985,
					title: 'Spanning Tree Protocol',
					description:
						"[[pioneer:radia-perlman|Perlman]]'s STP lets multiple bridges interconnect without creating loops. The protocol's correctness is famously elegant; her poem \"Algorhyme\" describes it: \"I think that I shall never see / a graph more lovely than a tree.\""
				},
				{
					year: 1990,
					title: '10BASE-T — Twisted Pair Ethernet',
					description:
						"Star-topology Ethernet over twisted-pair cables and hubs. Eliminates the failure mode of \"one cable break takes down the whole segment.\" Begins Ethernet's dominance over Token Ring."
				},
				{
					year: 1995,
					title: 'Fast Ethernet — 100 Mbps',
					description:
						"100BASE-TX — 100 Mbps over Cat 5 twisted pair. The version that makes Ethernet boringly fast for the next decade. Full-duplex via switches eliminates collisions."
				},
				{
					year: 1998,
					title: 'Gigabit Ethernet — 1 Gbps',
					description:
						"1000BASE-T. The era when Ethernet stopped being \"the office LAN\" and started being the data-center backbone."
				},
				{
					year: 2003,
					title: 'Power over Ethernet (802.3af)',
					description:
						"PoE lets Ethernet cables carry power as well as data. Powers VoIP phones, IP cameras, wireless APs without separate power adapters. 802.3at (PoE+, 2009) and 802.3bt (PoE++, 2018) keep raising the power ceiling."
				},
				{
					year: 2010,
					title: '40G and 100G Ethernet (802.3ba)',
					description:
						"Ethernet hits data-center scale. 40 Gbps and 100 Gbps over fiber. Subsequent generations: 200/400G (802.3bs, 2017), 800G (802.3df, 2024)."
				},
				{
					year: 2018,
					title: 'Multi-Gigabit Ethernet (NBASE-T)',
					description:
						"2.5GBASE-T and 5GBASE-T over existing Cat 5e/6 cables. Designed for Wi-Fi 6/6E APs that need >1 Gbps backhaul without recabling the building."
				},
				{
					year: 2024,
					title: 'Ethernet Everywhere',
					description:
						"Ethernet variants now span 100 Mbps (still in some IoT) to 800 Gbps (data center spines), automotive (10BASE-T1S, single-pair), and TSN (Time-Sensitive Networking) for industrial real-time. The frame format has barely changed since 1980."
				}
			]
		},
		{
			type: 'comparison',
			title: 'Ethernet and ARP',
			axes: ['Layer', 'Address space', 'Scope', 'How it learns'],
			rows: [
				{
					label: '[[ethernet|Ethernet]]',
					values: [
						'Layer 2 (data link)',
						"48-bit MAC addresses (2⁴⁸ ≈ 281 trillion)",
						"One physical segment (or VLAN)",
						"Switches learn MACs from source addresses of received frames"
					]
				},
				{
					label: '[[arp|ARP]]',
					values: [
						'Layer 2.5 (between L2 and L3)',
						'Maps IPv4 addresses → MAC addresses',
						'One physical segment (or VLAN)',
						"Broadcast \"who has X?\" → unicast reply; cache the binding"
					]
				}
			],
			note: "ARP is IPv4-only. IPv6 replaces it with Neighbor Discovery (ND), which uses ICMPv6 — same job, different protocol family. The need for the layer-bridging function never went away."
		},
		{
			type: 'animated-sequence',
			title: 'ARP Resolution and Switched Forwarding',
			definition: `sequenceDiagram
    participant A as Host A
    participant SW as L2 Switch
    participant B as Host B
    Note over A,B: A wants to send to 10.0.0.7 but does not know B MAC
    Note over A: ARP cache lookup — miss
    A->>SW: ARP REQUEST broadcast, src MAC aa:aa
    SW->>SW: flood to all ports except source
    SW->>B: ARP REQUEST
    Note over B: that is me — 10.0.0.7
    B->>SW: ARP REPLY unicast to A, src MAC bb:bb
    SW->>SW: learn that bb:bb lives on B port
    SW->>A: ARP REPLY
    Note over A: cache 10.0.0.7 maps to bb:bb
    Note over A,B: Now A can send the actual packet
    A->>SW: Ethernet frame dst=bb:bb, IP packet payload
    SW->>B: forward to B port only
    Note over A,B: Subsequent packets bypass ARP — cache hit
    Note over A: cache entry expires after 2-20 minutes, ARP re-runs`,
			caption:
				"This is the classic Ethernet+ARP exchange. The first message to a new IP triggers an ARP request (broadcast across the segment); subsequent messages use the cached MAC. The switch learns MAC-to-port mappings from source addresses, so once both hosts have sent something, the switch forwards directly without flooding.",
			steps: {
				0: '**The problem.** Host A wants to send to IP `10.0.0.7`. The IP layer knows where to send (the destination IP); the Ethernet layer needs a *MAC address* to put in the frame header. ARP bridges these two layers.',
				1: '**ARP cache miss.** A checks its local ARP cache first. Nothing there for 10.0.0.7 — this is the first time A has talked to B.',
				2: 'A sends an **ARP REQUEST** as a Layer 2 *broadcast* (destination MAC `ff:ff:ff:ff:ff:ff`). The request asks "who has 10.0.0.7? Tell me your MAC."',
				3: 'The switch **floods** the broadcast to every port except the one it came in on. This is what "broadcast domain" means.',
				4: 'The broadcast reaches B (and every other host on the segment, but they ignore it).',
				5: 'B recognizes its own IP in the request. The other hosts silently drop the frame.',
				6: 'B sends an **ARP REPLY** *unicast* back to A. The reply carries B\'s MAC address (`bb:bb`). Only A needs to hear this.',
				7: 'The switch **learns** that MAC `bb:bb` is reachable through B\'s port. This is the source-MAC learning that makes switches more efficient than hubs.',
				8: 'The switch forwards the reply to A — *only* to A\'s port, because the switch knows where A is too.',
				9: 'A **caches** the mapping `10.0.0.7 → bb:bb`. Future packets to 10.0.0.7 skip the ARP step entirely.',
				10: '**Now A can send the real packet.** ARP was just to learn B\'s MAC; the actual data transfer begins here.',
				11: 'A sends an **Ethernet frame** with destination MAC `bb:bb` and the IP packet as the payload.',
				12: 'The switch already knows where `bb:bb` lives. It **forwards to B\'s port only** — no flooding.',
				13: '**Subsequent packets bypass ARP entirely.** Both sides have cached MACs; the switch has learned port assignments. A 10-Gbps file transfer is just billions of frames following this same path.',
				14: '**Cache entries expire** after 2–20 minutes (varies by OS). When they expire, ARP runs again — which is why a long-idle connection sometimes has a tiny stutter on its first packet after a pause.'
			}
		},
		{
			type: 'callout',
			title: 'Why Ethernet Won',
			text: `In the late 1970s and early 1980s, the LAN wars had three contenders: **[[ethernet|Ethernet]]** (Xerox/DEC/Intel), **Token Ring** (IBM), and **Token Bus** (later FDDI). For ten years it was unclear which would win. By 1995, Ethernet had won everywhere except inside IBM shops. Why?\n\n**Ethernet was cheap.** Coaxial cable + a tap was cheaper than the complex MAU (Multi-station Attachment Unit) for Token Ring. The economics scaled badly for Ethernet at very high station counts (collisions dominated), but most LANs were small enough that the cost difference mattered more than the performance penalty.\n\n**Ethernet was permissive.** You could mix vendors. Add a new station without configuring the network. Plug things in and they worked. Token Ring required careful ring management; FDDI required ring monitors and station ID coordination. The "just plug it in" property of Ethernet was the same property that would later define Wi-Fi.\n\n**Ethernet evolved.** When 10 Mbps over coax (10BASE-5, 10BASE-2) became limiting, 10BASE-T over twisted pair appeared. When that became limiting, 100BASE-TX. Then 1000BASE-T. Then 10GBASE-T. Each generation reused the cabling investment (mostly) and stayed backward-compatible at the frame format. Token Ring couldn't evolve as smoothly; it stayed at 16 Mbps long after Ethernet had gone to 100 and beyond.\n\n**Ethernet abandoned collision detection.** The most distinctive thing about original Ethernet — CSMA/CD, where stations sensed the carrier before transmitting and detected collisions during transmission — is gone. Modern Ethernet is full-duplex switched. Every station has its own dedicated link to the switch; there are no collisions. The thing that made Ethernet *Ethernet* in the textbook diagram of 1985 doesn't exist in any modern deployment. The frame format and addressing survived; the medium-access protocol got replaced wholesale. Few protocols have undergone that level of internal change while keeping the same name.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[ethernet|Ethernet]]'s historical failure mode was the **broadcast storm** — connect two switches in a loop, both forward broadcasts to each other, the loop multiplies the traffic exponentially until the network melts in seconds. [[pioneer:radia-perlman|Perlman]]'s Spanning Tree Protocol (STP, 1985) and its descendants (RSTP, MSTP) elect a topology tree and block redundant ports. Without STP, every multi-switch Ethernet would routinely die from operator error. The modern alternative — TRILL, SPB, or just careful manual configuration — solves the same problem differently.\n\n[[arp|ARP]]'s failure mode is **ARP spoofing**. ARP has no authentication. Anyone on the segment can send unsolicited "I'm 10.0.0.1, MAC = my-MAC" replies; victim hosts cache the lie; their traffic to 10.0.0.1 goes to the attacker. This is the basis of man-in-the-middle attacks on LANs and is trivial to execute (any \`ettercap\` script can do it). Mitigations exist (Dynamic ARP Inspection in enterprise switches, static ARP entries for critical hosts) but require deployment. Most office LANs are still vulnerable.\n\nA third shared failure mode: **MAC flooding**. Switches have finite-size MAC tables. Flooding them with random MAC addresses causes most switches to fall back to "hub mode" (flood everything to every port), letting an attacker passively sniff the segment. Defense: port security with a per-port MAC limit, sticky MAC learning. Again, requires configuration that's often skipped.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **800 Gbps Ethernet** (802.3df, 2024) ships in hyperscaler data centers. 1.6 Tbps is the next target.\n- **Single-pair Ethernet (10BASE-T1S, 100BASE-T1, 1000BASE-T1)** for automotive and industrial. One pair of wires instead of four; multi-drop topology. Replacing CAN bus in cars over the next decade.\n- **TSN — Time-Sensitive Networking** brings deterministic latency to Ethernet for industrial control and audio/video. Time-aware shaping, frame preemption, IEEE 802.1AS time sync. The "Ethernet for real-time" story finally credible.\n- **MACsec (802.1AE)** for link-layer encryption. Encrypts frames between switches, separately from IPsec/TLS at higher layers. Standard for hyperscaler east-west traffic.\n- **IPv6 + ND replacing IPv4 + ARP** continues slowly. IPv6 Neighbor Discovery (ND) does ARP's job over ICMPv6, with additional features for stateless address autoconfiguration. The transition is ~30% complete by traffic volume, ~5% by deployed device count.\n- **The truth about Ethernet**: the frame format from 1980 is still the frame format. The bandwidth has grown 80,000× (10 Mbps → 800 Gbps). The collision-detection medium-access protocol is gone. The protocol that runs the planet is the protocol that's changed everywhere except where its name is.`
		}
	]
};
