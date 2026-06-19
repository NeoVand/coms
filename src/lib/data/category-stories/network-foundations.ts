import type { CategoryStory } from './types';

export const networkFoundationsStory: CategoryStory = {
	categoryId: 'network-foundations',
	tagline:
		'From {{xerox-parc|Xerox PARC}} to every connected device — how frames, addresses, and routes make the internet possible',
	sections: [
		{
			type: 'narrative',
			title: 'Before the Internet',
			text: `In 1973, a young engineer named [[pioneer:bob-metcalfe|Bob Metcalfe]] was working at {{xerox-parc|Xerox PARC}} in Palo Alto when he had an insight that would change computing forever. He'd studied the ALOHAnet — a radio network connecting Hawaiian islands — and realized the same principle could wire computers together in an office. He sketched a system on the back of a napkin: a shared cable with simple rules for who gets to transmit. He called it [[ethernet|Ethernet]], after the "luminiferous aether" that 19th-century physicists believed permeated space.

That sketch became [[ethernet|Ethernet]], and it solved the first problem of networking: how do machines on the same wire talk to each other? Each device got a unique 48-bit {{mac-address|MAC address}}, and frames carried data from source to destination. But [[ethernet|Ethernet]] alone wasn't enough. You also needed a way to find who's who — that's [[arp|ARP]], which translates logical [[ip|IP]] addresses to physical {{mac-address|MAC}} addresses. And you needed a way to route beyond your local wire — that's [[ip|IP]], the addressing system that makes the internet a network of networks.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Xerox_Alto_mit_Rechner.JPG/500px-Xerox_Alto_mit_Rechner.JPG',
			alt: 'The Xerox Alto computer at Xerox PARC — the machine that Ethernet was invented to network',
			caption:
				'The Xerox Alto (1973) — the workstation where [[ethernet|Ethernet]] was born. [[pioneer:bob-metcalfe|Bob Metcalfe]] invented [[ethernet|Ethernet]] at {{xerox-parc|Xerox PARC}} to network these Alto machines, connecting them over a shared coaxial cable at 2.94 Mbps using {{csma-cd|CSMA/CD}}.',
			credit: 'Photo: Joho345 / Public Domain, via Wikimedia Commons'
		},
		{
			type: 'diagram',
			title: 'The Network Stack — Where These Protocols Live',
			definition: `graph TD
  subgraph L7["Layer 7 — Application"]
    A1[{{http-method|HTTP}}]
    A2[[[dns|DNS]]]
    A3[[[ssh|SSH]]]
    A4[[[smtp|SMTP]]]
  end
  subgraph L4["Layer 4 — Transport"]
    B1["[[tcp|TCP]] — reliable streams"]
    B2["[[udp|UDP]] — fast datagrams"]
  end
  subgraph L3["Layer 3 — Network"]
    C["[[ip|IPv4]] / [[ipv6|IPv6]] — addressing & routing"]
    C2["[[arp|ARP]] / {{ndp|NDP}} — address resolution"]
    C3["[[icmp|ICMP]] — diagnostics & errors"]
    C4["[[bgp|BGP]] — inter-domain routing"]
  end
  subgraph L2["Layer 2 — Data Link"]
    D1["[[ethernet|Ethernet]] — wired frames"]
    D2["Wi-Fi ([[wifi|802.11]]) — wireless frames"]
  end
  subgraph L1["Layer 1 — Physical"]
    E1["Copper / Fiber / Radio waves"]
  end
  A1 & A2 & A3 & A4 --> B1 & B2
  B1 & B2 --> C
  C --> C2
  C --> C3
  C4 --> C
  C2 --> D1 & D2
  D1 & D2 --> E1`,
			caption:
				'Where Network Foundations protocols fit in the stack. [[ethernet|Ethernet]] and [[wifi|Wi-Fi]] frame data at Layer 2, [[ip|IPv4]]/[[ipv6|IPv6]] route at Layer 3, [[arp|ARP]]/{{ndp|NDP}} bridge addressing, [[icmp|ICMP]] provides diagnostics, and [[bgp|BGP]] handles inter-domain routing.'
		},
		{
			type: 'pioneers',
			title: 'The Architects of the Network',
			people: [
				{
					name: 'Bob Metcalfe',
					years: '1946–',
					title: 'Inventor of Ethernet',
					org: 'Xerox PARC / 3Com',
					contribution:
						'Invented [[ethernet|Ethernet]] at {{xerox-parc|Xerox PARC}} in 1973, co-authored the DIX [[ethernet|Ethernet]] standard (1980), and co-founded 3Com to commercialize it. Received the 2022 {{acm-org|ACM}} Turing Award for his contributions to networking.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/With_Bob_Metcalfe_%28cropped%29.jpg/330px-With_Bob_Metcalfe_%28cropped%29.jpg'
				},
				{
					name: 'Vint Cerf',
					years: '1943–',
					title: 'Co-inventor of TCP/IP',
					org: 'Stanford / DARPA / Google',
					contribution:
						'Co-designed the [[tcp|TCP]]/[[ip|IP]] protocol suite (including [[ip|IP]]) with [[pioneer:bob-kahn|Bob Kahn]]. Their 1974 paper defined how heterogeneous networks could {{exchange|exchange}} data — the fundamental insight that created the internet.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg'
				},
				{
					name: 'David Plummer',
					years: 'c. 1956–',
					title: 'Author of ARP',
					org: 'MIT',
					contribution:
						'Wrote [[rfc:826|RFC 826]] (1982) defining the Address Resolution Protocol — the elegantly simple {{broadcast|broadcast}} mechanism that bridges [[ip|IP]] addresses to hardware addresses on local networks.'
				},
				{
					name: 'Yakov Rekhter',
					years: 'c. 1950–',
					title: 'Co-creator of BGP',
					org: 'IBM / Juniper Networks',
					contribution:
						'Co-authored the Border Gateway Protocol ([[rfc:1105|RFC 1105]], 1989) with Kirk Lougheed. [[bgp|BGP]] became the de facto inter-domain routing protocol, handling routing decisions between every {{autonomous-system|autonomous system}} on the internet.'
				},
				{
					name: 'Steve Deering',
					years: '1951–',
					title: 'Creator of IPv6',
					org: 'Xerox PARC / Cisco',
					contribution:
						'Primary architect of [[ipv6|IPv6]], leading the design of 128-bit addressing, the simplified header, and {{multicast|multicast}}. Also invented [[ip|IP]] {{multicast|multicast}} itself, fundamentally changing how one-to-many communication works on the internet.'
				},
				{
					name: 'Paul Mockapetris',
					years: '1948–',
					title: 'Inventor of DNS',
					org: 'USC Information Sciences Institute',
					contribution:
						'Created the Domain Name System in 1983, replacing the unsustainable {{hosts-bare|HOSTS}}.{{txt-record|TXT}} file with a distributed, hierarchical naming layer. Every other protocol on the internet relies on [[dns|DNS]] to turn human-readable names into routable addresses. Inducted into the Internet Hall of Fame in 2012.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Paul_Mockapetris.JPG/330px-Paul_Mockapetris.JPG'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'Ethernet Invented at Xerox PARC',
					description:
						'[[pioneer:bob-metcalfe|Bob Metcalfe]] sketches the first [[ethernet|Ethernet]] network, connecting Alto workstations over a shared coaxial cable at 2.94 Mbps using {{csma-cd|CSMA/CD}}.',
					protocolId: 'ethernet'
				},
				{
					year: 1980,
					title: 'DIX Ethernet Standard Published',
					description:
						'Digital Equipment Corporation, {{intel|Intel}}, and Xerox {{mqtt-publish|publish}} the DIX standard ([[ethernet|Ethernet]] II), defining the frame format still used today.'
				},
				{
					year: 1981,
					title: 'IPv4 Specified — RFC 791',
					description:
						'[[pioneer:jon-postel|Jon Postel]] publishes [[rfc:791|RFC 791]], defining the Internet Protocol with 32-bit addresses, {{ttl|TTL}}, and {{fragmentation|fragmentation}} — the addressing system of the internet.',
					protocolId: 'ip'
				},
				{
					year: 1981,
					title: 'ICMP Published — RFC 792',
					description:
						'[[pioneer:jon-postel|Jon Postel]] defines the Internet Control Message Protocol. The network can now report errors and answer "are you there?" — {{ping|ping}} is born, and {{traceroute|traceroute}} follows.',
					protocolId: 'icmp'
				},
				{
					year: 1982,
					title: 'ARP Defined — RFC 826',
					description:
						'David Plummer publishes the Address Resolution Protocol, solving the [[ip|IP]]-to-{{mac-address|MAC}} resolution problem with a simple {{broadcast|broadcast}}-and-reply mechanism.',
					protocolId: 'arp'
				},
				{
					year: 1983,
					title: 'IEEE 802.3 Ratified',
					description:
						'The {{ieee-802-15-4|IEEE}} ratifies 802.3, giving [[ethernet|Ethernet]] its formal standard. {{arpanet|ARPANET}} officially switches to [[tcp|TCP]]/[[ip|IP]] on January 1, "{{flag-day-1983|Flag Day}}."',
					protocolId: 'ethernet'
				},
				{
					year: 1983,
					title: 'DNS Created — RFC 882/883',
					description:
						'[[pioneer:paul-mockapetris|Paul Mockapetris]] invents the Domain Name System, replacing the single {{hosts-bare|HOSTS}}.{{txt-record|TXT}} file with a distributed, hierarchical naming layer. Every other protocol on the internet depends on it to find its destination.',
					protocolId: 'dns'
				},
				{
					year: 1985,
					title: 'First .com Registered',
					description:
						'On March 15th, symbolics.com becomes the first registered .com domain name. [[dns|DNS]] makes human-friendly addresses possible.',
					protocolId: 'dns'
				},
				{
					year: 1989,
					title: 'BGP Introduced — RFC 1105',
					description:
						'[[pioneer:yakov-rekhter|Yakov Rekhter]] and Kirk Lougheed create the Border Gateway Protocol. Autonomous systems can now {{exchange|exchange}} routing information — the internet can scale beyond a single backbone.',
					protocolId: 'bgp'
				},
				{
					year: 1998,
					title: 'IPv6 Specified — RFC 2460',
					description:
						'[[pioneer:steve-deering|Steve Deering]] and Rob Hinden {{mqtt-publish|publish}} [[ipv6|IPv6]] with 128-bit addresses, a simplified header, and no more {{broadcast|broadcast}}. The long transition from [[ip|IPv4]] begins.',
					protocolId: 'ipv6'
				},
				{
					year: 2020,
					title: 'DNS-over-HTTPS Widely Adopted',
					description:
						'[[dns|DNS]] queries, traditionally sent in plaintext, can now be encrypted. The last major unencrypted protocol below the application layer gets a privacy upgrade.',
					protocolId: 'dns'
				},
				{
					year: 2024,
					title: '800 GbE Standardised — IEEE 802.3df-2024',
					description:
						'Approved 16 February 2024, 802.3df defines 800 GbE (and 400 GbE on 100 G lanes). The 1.6 TbE follow-up (P802.3dj, 200 G/lane) targets July 2026 — driven by {{ai|AI}} training fabrics that need lossless [[ethernet|Ethernet]] with RoCEv2 to replace InfiniBand in large {{gpu|GPU}} clusters.',
					protocolId: 'ethernet'
				},
				{
					year: 2026,
					title: 'IPv6 Crosses 50% on Google',
					description:
						"On 28 March 2026, [[ipv6|IPv6]] carried 50.1% of {{google|Google}}'s traffic for the first time — 28 years after [[rfc:2460|RFC 2460]]. {{cloudflare|Cloudflare}} and {{apnic|APNIC}} measure 40-43% from their vantage points, so the milestone is real but uneven.",
					protocolId: 'ipv6'
				}
			]
		},
		{
			type: 'diagram',
			title: 'The Journey of a Packet — Encapsulation in Action',
			definition: `graph LR
  subgraph Source["Source Host"]
    S1["Application: GET /index.html"]
    S2["[[tcp|TCP]]: src=49152 dst=80"]
    S3["{{ip-address|IP}}: src=192.168.1.100 dst=93.184.216.34"]
    S4["[[ethernet|Ethernet]]: src=AA:BB:CC dst=Router {{mac-address|MAC}}"]
    S1 --> S2 --> S3 --> S4
  end
  subgraph Router["Router"]
    R1["Strip [[ethernet|Ethernet]] header"]
    R2["Decrement {{ttl|TTL}}, route lookup"]
    R3["New [[ethernet|Ethernet]]: src=Router {{mac-address|MAC}} dst=Next-hop {{mac-address|MAC}}"]
    R1 --> R2 --> R3
  end
  subgraph Dest["Destination"]
    D1["[[ethernet|Ethernet]] → {{ip-address|IP}} → [[tcp|TCP]] → Application"]
  end
  S4 -->|"Frame on wire"| R1
  R3 -->|"New frame, same {{ip-address|IP}} packet"| D1`,
			caption:
				'Each layer wraps the {{payload|payload}} from the layer above. At every {{hop|hop}}, the [[ethernet|Ethernet]] {{frame|frame}} is stripped and rebuilt with new {{mac-address|MAC addresses}} — but the {{ip-address|IP addresses}} and [[tcp|TCP]] ports stay constant end-to-end. This is the fundamental principle of {{encapsulation|encapsulation}}.'
		},
		{
			type: 'narrative',
			title: 'From Shared Wire to Switched Networks',
			text: `The original [[ethernet|Ethernet]] was a shared coaxial cable — a "bus" — where every device heard every transmission. Collisions were inevitable, and {{csma-cd|CSMA/CD}} (Carrier Sense Multiple Access with Collision Detection) was the traffic cop: listen before transmitting, and if two devices collide, both back off for a random time and try again.

The shift from hubs to switches in the 1990s was transformative. A hub was just a repeater — it sent every frame to every port. A switch, however, learns which {{mac-address|MAC}} addresses live on which ports by watching source addresses. After learning, it forwards frames only to the correct port. Collisions disappeared. {{full-duplex|Full-duplex}} links doubled effective {{bandwidth|bandwidth}}. This simple innovation — the [[ethernet|Ethernet]] switch — is what made modern LANs possible, from small offices to hyperscale data centers running at 400 Gbps.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/500px-Internet_map_1024.jpg',
			alt: 'A partial map of the Internet by the Opte Project, showing millions of IP routes as colored lines',
			caption:
				'A partial map of the Internet by the Opte Project (2005). Each line connects two [[ip|IP]] addresses — the web of routes that [[ip|IP]] makes possible. Colors represent regional allocations: blue for North America, green for Asia-Pacific, red for Europe.',
			credit: 'Image: Barrett Lyon / The Opte Project / CC BY 2.5, via Wikimedia Commons'
		},
		{
			type: 'callout',
			title: 'Layer 2 vs Layer 3',
			text: '[[ethernet|Ethernet]] operates at Layer 2 (Data Link) — it handles framing and local delivery using {{mac-address|MAC}} addresses. [[ip|IP]] operates at Layer 3 (Network) — it handles addressing and routing across networks. [[arp|ARP]] bridges the two: it translates Layer 3 addresses ([[ip|IP]]) into Layer 2 addresses ({{mac-address|MAC}}). This separation of concerns is what makes the internet scalable — [[ip|IP]] routes between networks, while [[ethernet|Ethernet]] (and its [[wifi|Wireless]] siblings in the [[wifi|Wireless]] category) handles the "last mile" delivery on each segment.'
		},
		{
			type: 'narrative',
			title: 'Diagnostics, Routing, and the Next Generation',
			text: `With framing, addressing, and routing in place, three more protocols completed the network foundation.

In 1981, [[pioneer:jon-postel|Jon Postel]] defined [[icmp|ICMP]] — the Internet Control Message Protocol. [[icmp|ICMP]] is the network's built-in diagnostic system: it reports errors ("destination unreachable," "{{time-exceeded|time exceeded}}," "redirect") and enables the two most essential troubleshooting tools in networking. {{ping|Ping}} sends an {{echo-request|Echo Request}} and waits for an {{echo-reply|Echo Reply}}, telling you if a host is alive and how fast the path is. {{traceroute|Traceroute}} sends packets with incrementing {{ttl|TTL}} values, collecting "{{time-exceeded|Time Exceeded}}" responses from each router along the path — revealing every hop between you and a destination.

By 1989, the internet was outgrowing its routing. The original {{arpanet|ARPANET}} had a single backbone — routing was simple. But as multiple networks connected, someone had to decide how traffic flows between them. [[pioneer:yakov-rekhter|Yakov Rekhter]] and Kirk Lougheed created [[bgp|BGP]], the Border Gateway Protocol, which treats each network as an "{{autonomous-system|autonomous system}}" and exchanges route advertisements between them. Today, [[bgp|BGP]] is literally the protocol that holds the internet together — every path your data takes across network boundaries is decided by [[bgp|BGP]] route advertisements exchanged on [[tcp|TCP]] port 179.

The most ambitious chapter began in the 1990s. [[ip|IPv4]]'s 32-bit address space — 4.3 billion addresses — was running out. [[pioneer:steve-deering|Steve Deering]] led the design of [[ipv6|IPv6]], published as [[rfc:2460|RFC 2460]] in 1998 (later updated as [[rfc:8200|RFC 8200]] in 2017). [[ipv6|IPv6]] didn't just add more addresses; it rethought the protocol entirely. The header was simplified to a fixed 40 bytes — no {{checksum|checksum}}, no variable-length options. {{broadcast|Broadcast}} was eliminated in favor of {{multicast|multicast}}. [[arp|ARP]]'s {{broadcast|broadcast}}-based address resolution was replaced by {{ndp|NDP}} ({{ndp|Neighbor Discovery Protocol}}), which uses efficient solicited-node {{multicast|multicast}}. {{hosts-bare|Hosts}} can autoconfigure globally unique addresses via {{slaac|SLAAC}} without any server. On 28 March 2026, [[ipv6|IPv6]] crossed 50% of {{google|Google}}'s traffic for the first time, 28 years after the spec — a transition that was supposed to take a few years and is still ongoing, a testament to how deeply embedded [[ip|IPv4]] became.`
		},
		{
			type: 'diagram',
			title: 'IPv4 vs IPv6 — Header Comparison',
			definition: `graph TD
  subgraph V4["[[ip|IPv4]] Header (20-60 bytes, variable)"]
    V4A["Version (4b) + IHL (4b)"]
    V4B["{{dscp|DSCP}} + {{ecn|ECN}} + Total Length"]
    V4C["Identification + Flags + Fragment {{offset|Offset}}"]
    V4D["{{ttl|TTL}} + Protocol + Header {{checksum|Checksum}}"]
    V4E["Source {{ip-address|IP}} (32-bit)"]
    V4F["Destination {{ip-address|IP}} (32-bit)"]
    V4G["Options (0-40 bytes, variable)"]
    V4A --- V4B --- V4C --- V4D --- V4E --- V4F --- V4G
  end
  subgraph V6["[[ipv6|IPv6]] Header (40 bytes, fixed)"]
    V6A["Version (4b) + Traffic Class (8b) + Flow Label (20b)"]
    V6B["{{payload|Payload}} Length + Next Header + {{hop-limit|Hop Limit}}"]
    V6C["Source {{ip-address|IP}} (128-bit)"]
    V6D["Destination {{ip-address|IP}} (128-bit)"]
    V6A --- V6B --- V6C --- V6D
  end
  V4 ~~~ V6`,
			caption:
				'[[ip|IPv4]] headers are variable-length with a {{checksum|checksum}} and options; [[ipv6|IPv6]] headers are fixed at 40 bytes with no {{checksum|checksum}} (upper layers handle integrity) and extension headers for optional features. Simpler headers mean faster router processing.'
		},
		{
			type: 'narrative',
			title: 'The Naming Layer — DNS',
			text: `Frames, addresses, and routes get a packet from one machine to another. But humans do not type 142.250.80.46 — they type \`google.com\`. The translation between names and addresses is the **naming layer**, and it is just as foundational as anything below it. Without [[dns|DNS]], every other protocol in this category exists in isolation: you can route to an address, but you cannot find it.\n\nIn the early internet, every computer maintained a file called {{hosts-bare|HOSTS}}.{{txt-record|TXT}} — a simple list mapping hostnames to [[ip|IP]] addresses. The Stanford Research Institute kept the master copy; everyone {{imap-fetch|fetched}} updates periodically. This worked for a hundred hosts. By 1983, with thousands joining and entries changing daily, it was falling apart.\n\n[[pioneer:paul-mockapetris|Paul Mockapetris]] at USC ISI solved it with [[dns]], the **Domain Name System**. Instead of one file, [[dns|DNS]] distributes naming across a hierarchical tree of servers. Ask for \`google.com\` and your query cascades: root servers point at the \`.com\` servers, which point at {{google|Google}}'s authoritative servers, which return the {{ip-address|IP address}}. **Aggressive caching at every level** does almost all the work — most lookups never walk the tree. The system handles billions of queries per day and has held for forty years, scaling from a few hundred hosts to billions.`
		},
		{
			type: 'diagram',
			title: 'DNS Resolution Hierarchy',
			definition: `graph TD
  A[Your Browser] -->|"who is example.com?"| B["[[dns|DNS]] Resolver"]
  B -->|"where is .com?"| C[Root Server]
  C -.->|"ask the .com server"| B
  B -->|"where is example.com?"| D[.com {{tld|TLD}} Server]
  D -.->|"ask its {{nameserver|nameserver}}"| B
  B -->|"{{ip-address|IP}} for example.com?"| E[Authoritative Server]
  E -.->|"93.184.216.34"| B
  B -.->|"93.184.216.34"| A`,
			caption:
				'[[dns|DNS]] resolves names by cascading through a hierarchy: root servers, then {{tld|TLD}} servers, then authoritative servers. Caching at every level means most lookups never reach the root.'
		}
	]
};
