import type { SubcategoryStory } from './types';

export const routingStory: SubcategoryStory = {
	subcategoryId: 'routing',
	tagline:
		'How routers learn paths and decide where to send packets — and why the Internet runs on trust',
	sections: [
		{
			type: 'narrative',
			title: 'The Two Routing Problems',
			text: `Every router on the Internet faces the same question millions of times a second: *for this destination address, which neighbor do I forward to?* The answer comes from a routing table, and the routing table is built by a routing protocol. There are exactly two kinds of routing problem on the Internet — and exactly two families of protocols solve them.\n\n**Inside an organization** — a campus network, a data center, a single ISP's backbone — every router belongs to the same administrative domain. They trust each other completely. They share *full topology information* and run shortest-path algorithms to find optimal routes. This is the **{{igp|interior gateway protocol}}** problem, and **[[ospf|OSPF]]** is the answer most of the Internet picked.\n\n**Between organizations** — between one ISP and another, between a cloud provider and a backbone, between Comcast and Cloudflare — routers must exchange reachability information *without* trusting each other and *without* exposing internal topology. They share *policy-shaped* paths and select based on business rules, not shortest distance. This is the **{{egp|exterior gateway protocol}}** problem, and **[[bgp|BGP]]** is the only answer the Internet has ever had.\n\nThese two protocols, working together, define the entire reachability fabric of the global Internet. And [[bgp|BGP]] — the protocol that holds the whole thing together — is built on nothing more than a 30-year-old assumption that everyone will play fair.`
		},
		{
			type: 'pioneers',
			title: 'The Routing Architects',
			people: [
				{
					id: 'edsger-dijkstra',
					name: 'Edsger Dijkstra',
					years: '1930–2002',
					title: 'Inventor of Shortest-Path Algorithm',
					org: 'Eindhoven / UT Austin',
					contribution:
						"In 1956 Dijkstra invented his shortest-path algorithm in about 20 minutes \"to demonstrate the capabilities of the ARMAC computer.\" Published in 1959 (\"A Note on Two Problems in Connexion with Graphs\"). [[ospf|OSPF]] runs Dijkstra's algorithm on the link-state database every time the topology changes — every Internet router that uses OSPF runs Dijkstra's 1956 algorithm thousands of times a day.",
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Edsger_Wybe_Dijkstra.jpg/330px-Edsger_Wybe_Dijkstra.jpg'
				},
				{
					id: 'yakov-rekhter',
					name: 'Yakov Rekhter',
					years: '–',
					title: 'Co-author of BGP',
					org: 'T.J. Watson / Cisco / Juniper',
					contribution:
						"Co-authored every major version of [[bgp|BGP]] from BGP-1 (1989) through BGP-4 ([[rfc:4271|RFC 4271]], 2006). The fundamental design — path-vector routing with each AS prepending itself to the AS_PATH — is Rekhter's. He also led MPLS and the BGP/MPLS VPN architecture (RFC 4364) that powers most ISP-to-enterprise connectivity. BGP-4 has had ~20 RFC extensions added since 2006, but the core protocol Rekhter shipped is unchanged."
				},
				{
					id: 'john-moy',
					name: 'John Moy',
					years: '–',
					title: 'Author of OSPF',
					org: 'Proteon / Cascade / Sycamore',
					contribution:
						"Designed [[ospf|OSPF]] in 1989 as a replacement for RIP (the distance-vector protocol that took multi-minute convergence times in the 1980s Internet). Moy wrote OSPFv1 (RFC 1131, 1989), OSPFv2 (RFC 1247, 1991, then [[rfc:2328|RFC 2328]], 1998 — still the current spec), and the canonical book \"OSPF: Anatomy of an Internet Routing Protocol.\" OSPF's link-state design — flood the topology, run Dijkstra locally — is now standard for IGPs across vendors."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1956,
					title: 'Dijkstra Invents Shortest-Path',
					description:
						"[[pioneer:edsger-dijkstra|Dijkstra]] sketches his algorithm in a Dutch café. It will become the engine of every link-state IGP three decades later."
				},
				{
					year: 1982,
					title: 'EGP RFC 827',
					description:
						"The first inter-AS protocol — strictly tree-shaped, assumed the Internet had a single backbone core (the ARPANET). It worked only because the early Internet was small and centralized."
				},
				{
					year: 1989,
					title: 'BGP-1 (RFC 1105)',
					description:
						"Three engineers at IBM and Cisco — [[pioneer:yakov-rekhter|Rekhter]], Kirk Lougheed, and Len Bosack — sketched BGP on three napkins. The Internet was growing past the single-backbone assumption, and EGP couldn't handle mesh topology."
				},
				{
					year: 1989,
					title: 'OSPFv1 (RFC 1131)',
					description:
						"[[pioneer:john-moy|Moy]] publishes the first link-state IGP designed for the Internet. RIP's slow convergence is becoming untenable as networks grow."
				},
				{
					year: 1995,
					title: 'BGP-4 (RFC 1771)',
					description:
						"BGP-4 adds {{cidr|CIDR}} support — variable-length prefixes instead of class A/B/C boundaries. CIDR is the only thing that staved off [[ipv4|IPv4]] address exhaustion through the 1990s."
				},
				{
					year: 1998,
					title: 'OSPFv2 Final (RFC 2328)',
					description:
						"The OSPF spec that almost every router on Earth still implements unchanged. Multi-area hierarchy, MD5 authentication, type-of-service routing (rarely used)."
				},
				{
					year: 1999,
					title: 'OSPFv3 for IPv6 (RFC 2740)',
					description:
						'A clean break from OSPFv2 — runs over [[ipv6|IPv6]] directly, decoupled from the address family it carries.'
				},
				{
					year: 2006,
					title: 'BGP-4 RFC 4271',
					description:
						'The current BGP specification. Almost no semantic changes from 1995 — just a cleaner write-up. Every BGP extension since has been an add-on RFC.'
				},
				{
					year: 2008,
					title: 'YouTube Disappears for Two Hours',
					description:
						'Pakistan Telecom announces a more-specific BGP route to YouTube\'s prefix, intending to block YouTube locally. The announcement leaks to upstream PCCW Global and propagates globally. YouTube is unreachable for ~2 hours.'
				},
				{
					year: 2021,
					title: 'Facebook Goes Offline for 6 Hours',
					description:
						"A routine BGP update at Facebook withdraws all routes to Facebook's backbone. DNS servers can't reach Facebook's authoritative servers; Facebook's own engineers can't badge into the buildings to physically reach the routers. Recovery takes hours and a literal angle grinder."
				},
				{
					year: 2024,
					title: 'RPKI Coverage Crosses 50%',
					description:
						'Resource Public Key Infrastructure — cryptographically signed assertions of who owns which prefix — finally covers more than half of routed IPv4 space. The first credible defense against BGP hijacks since BGP\'s invention.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'OSPF vs BGP',
			axes: ['Scope', 'Algorithm', 'Metric', 'Trust model', 'Convergence'],
			rows: [
				{
					label: '[[ospf|OSPF]]',
					values: [
						'Within one {{as|AS}} (intra-domain)',
						'Link-state — every router knows full topology, runs [[pioneer:edsger-dijkstra|Dijkstra]] locally',
						'Path cost (bandwidth-derived integer)',
						'Full trust — all routers in the same administrative domain',
						'Seconds (sub-second with fast hellos / BFD)'
					]
				},
				{
					label: '[[bgp|BGP]]',
					values: [
						'Between {{as|ASes}} (inter-domain)',
						'Path-vector — exchange path lists, no shared topology',
						'Local policy (LOCAL_PREF, AS_PATH length, MED, ...)',
						'Zero trust — peers are competitors, customers, or random ISPs',
						'Minutes (deliberate dampening to avoid oscillation)'
					]
				}
			],
			note: "[[ospf|OSPF]] optimizes for *speed and optimality* within a domain you control. [[bgp|BGP]] optimizes for *expressing business relationships* across domains you don't."
		},
		{
			type: 'diagram',
			title: 'BGP Path Selection Across Three ASes',
			definition: `sequenceDiagram
    participant A as AS 64500 (Customer)
    participant B as AS 65001 (Transit Provider)
    participant C as AS 65002 (Direct Peer)
    Note over A,C: AS 64500 hears the same prefix from two paths
    B->>A: UPDATE: 192.0.2.0/24, AS_PATH = [65001, 13335]
    C->>A: UPDATE: 192.0.2.0/24, AS_PATH = [65002, 13335]
    Note over A: Decision process (in order):
    Note over A: 1. Highest LOCAL_PREF? (set by import policy)
    Note over A: 2. Shortest AS_PATH? Both length 2 — tie
    Note over A: 3. Lowest MED? (set by neighbor — usually ignored across ASes)
    Note over A: 4. eBGP over iBGP? — both eBGP
    Note over A: 5. Lowest IGP cost to next-hop? Direct peer wins
    Note over A: Selected: via AS 65002 (direct peer, free)
    A->>A: Install route: 192.0.2.0/24 via C
    Note over A,C: AS 64500 announces nothing back — customer doesn't transit for providers`,
			caption:
				"BGP isn't about shortest path — it's about *policy*. The rule of thumb: prefer customer routes (you get paid), then peers (free), then transit (you pay). \"Hot potato routing\" — get the packet out your network as fast as possible — is policy expressed as IGP cost in step 5."
		},
		{
			type: 'callout',
			title: 'BGP Runs on Trust That Nobody Should Have',
			text: `For 30 years, [[bgp|BGP]] had no authentication. If you peered with another network, you trusted what they announced. If they announced Google's prefix from their own AS, your router believed them, and your packets to Google went to their network instead.\n\nThis isn't theoretical. [[outage:pakistan-youtube-2008|Pakistan Telecom took YouTube offline globally in 2008]] by announcing a more-specific route to its own prefix — an attempt to censor YouTube *locally* that leaked worldwide. China Telecom rerouted 15% of global Internet traffic through China for 18 minutes in April 2010. Russia rerouted Mastercard and Visa traffic in 2017. These weren\'t exploits — they were just BGP working as designed.\n\nThe partial fix arriving now is **{{rpki|RPKI}}** — Resource Public Key Infrastructure. Address owners cryptographically sign assertions: "AS 13335 is allowed to originate 1.1.1.0/24." Routers validate incoming announcements against these signatures. By 2024, RPKI coverage finally crossed 50% of routed IPv4. The next step — **BGPsec**, which would sign the entire AS_PATH, not just the origin — has been "shipping next year" since 2017. Path-level validation is hard.`
		},
		{
			type: 'narrative',
			title: 'The Failure Mode That Defines Routing',
			text: `For [[ospf|OSPF]], the failure mode is **flapping** — a link goes up and down repeatedly (a flaky fiber, a memory leak in a router, a duplex mismatch). Each flap forces every router in the area to re-flood LSAs and re-run [[pioneer:edsger-dijkstra|Dijkstra]]. In large areas this can saturate router CPUs and propagate the instability into BGP. The defense: link-state advertisement throttling, exponential backoff, and BFD for fast detection without unnecessary churn.\n\nFor [[bgp|BGP]], the failure mode is the **route leak**. An announcement that should stay within one administrative boundary (a customer's prefix, a private route) escapes into the global routing table. [[outage:facebook-2021|Facebook withdrew its own routes by accident]] in October 2021 — a configuration audit script issued a command that, due to a bug in the audit tool, propagated globally. Facebook disappeared from the Internet for six hours. The recovery required physical access to data centers — the engineers' badges to enter the buildings depended on DNS, which depended on the routes that just got withdrawn.\n\nIn routing, the worst failures aren't crashes. They're successful operations of broken policy.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **{{rpki|RPKI}} coverage** continues to grow toward universal — the goal is a tipping point where invalid announcements are dropped by enough networks that hijacks become unprofitable. AT&T, Telia, NTT, Comcast all now drop RPKI-invalid routes.\n- **BGPsec** — full AS_PATH signing — remains stuck in the "almost deployable" zone. Hardware capable of signing each hop at line rate is finally available, but ecosystem adoption is slow.\n- **Segment Routing (SRv6)** is replacing MPLS-TE in some ISP backbones. Encodes the explicit path in the [[ipv6|IPv6]] header itself; doesn't replace [[bgp|BGP]] but changes what an IGP needs to compute.\n- **The deprecation of public looking glasses** — many ISPs are turning off the public "show me your BGP table" tools that BGP researchers relied on for decades, citing security. The visible Internet is becoming less visible.\n\nRouting protocols themselves change slowly. The change is happening in *what runs on top of them* — verification, policy automation, observability.`
		}
	]
};
