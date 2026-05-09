import type { StorySection } from './category-stories/types';

export interface FoundationSection {
	id: string;
	title: string;
	sections: StorySection[];
}

export const foundationSections: FoundationSection[] = [
	{
		id: 'what-is-a-protocol',
		title: 'What Is a Protocol?',
		sections: [
			{
				type: 'narrative',
				title: 'Rules Two Machines Agree On',
				text: `A {{protocol|protocol}} is a set of rules that two systems agree to follow so they can {{exchange|exchange}} information. The dictionary definition would tell you it is a sequence of moves; the engineering one is sharper. A protocol is a **shared specification** — a document that any third party can read and implement, such that two implementations written by people who have never met can interoperate on the first try.

When you load a web page, dozens of protocols cooperate without you noticing. [[ethernet|Ethernet]] carries the bits across your office network. [[ip|IP]] gets the packets to the right city. [[tcp|TCP]] makes sure none are lost. [[tls|TLS]] encrypts the contents. [[dns|DNS]] turned the URL into an address. [[http1|HTTP]] is the request the server actually answers. Each one minds its own job; each one trusts the others to do theirs.

The deeper trick is that protocols are **public**. They are described in plain text in documents called RFCs (Requests for Comments), published openly by the IETF. Anyone can read [[rfc:9293|RFC 9293]] and write a [[tcp|TCP]] stack. No single company owns the rules. This is the fact that made the internet possible — there is no Microsoft Internet, no Apple Internet, no Google Internet. There is the internet, defined in documents, implemented by everyone who needs to.`
			},
			{
				type: 'diagram',
				title: 'A Protocol Defines a Sequence',
				definition: `graph LR
  A["Client"] -->|"1. SYN"| B["Server"]
  B -->|"2. SYN-ACK"| A
  A -->|"3. ACK"| B
  A -->|"4. Request"| B
  B -->|"5. Response"| A`,
				caption: '[[tcp|TCP]] requires a {{three-way-handshake|three-way handshake}} before any data can flow. The order matters — both sides have to confirm the connection in writing before either can speak its mind.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/TCP_Three-Way_Handshake.svg/500px-TCP_Three-Way_Handshake.svg.png',
				alt: '[[tcp|TCP]] three-way handshake sequence diagram — client SYN, server SYN-ACK, client ACK.',
				caption:
					'The same [[tcp|TCP]] {{handshake|handshake}} drawn as a sequence diagram with the wall-clock arrows. SYN proposes a connection; SYN-ACK accepts and proposes back; ACK seals it. After this 1.5 round-trip {{exchange|exchange}}, both sides have synchronised sequence numbers and can begin sending real data.',
				credit: 'Image: Wikimedia Commons / public domain'
			},
			{
				type: 'narrative',
				title: 'Three Things Every Protocol Specifies',
				text: `Read enough protocol specifications and the same three concerns repeat.

**Format.** What does a message on the wire look like? [[tcp|TCP]] says: 16 bits source port, 16 bits destination port, 32 bits {{sequence-number|sequence number}}, 32 bits acknowledgement number, then 4 bits header length, then six flag bits in a fixed order, then a 16-bit window. HTTP says: a verb, a space, a URI, a space, a version string, then a CRLF, then headers, then a blank line, then the body. The format defines what is legal.

**Sequence.** What order are messages exchanged in? [[tcp|TCP]]'s {{three-way-handshake|three-way handshake}} is a sequence — SYN before SYN-ACK before ACK, and a server that receives an ACK without a preceding SYN simply drops it. [[tls|TLS]] has a similar choreography (ClientHello → ServerHello → {{certificate|Certificate}} → KeyExchange → Finished). The sequence defines what is meaningful at any point in the conversation.

**Failure handling.** What happens when a message is lost, corrupted, duplicated, or arrives out of order? [[tcp|TCP]] retransmits after a timeout. HTTP returns a 5xx status. [[tls|TLS]] aborts the connection on a bad MAC. The failure handling is what separates a working protocol from one that hangs the first time the network hiccups — and historically it is where most of the engineering work has gone.`
			},
			{
				type: 'callout',
				title: "Postel's Law",
				text: '**Be conservative in what you send, be liberal in what you accept.** This single sentence, from [[pioneer:jon-postel|Jon Postel]]\'s [[rfc:760|RFC 760]] (1980) and repeated in [[rfc:1122|RFC 1122]] (1989), guided decades of protocol design. Modern thinking has reversed it for security-sensitive protocols — being "liberal" in what you accept means accepting attack inputs — but for the foundational era it was the principle that let two slightly-different implementations interoperate at all.'
			},
			{
				type: 'narrative',
				title: 'Where Protocols Come From',
				text: `Protocols are not born in committees. They are usually written by one or two engineers solving a specific problem, deployed for a few years, then standardised once the design has survived production.

[[tcp|TCP]] was designed by [[pioneer:vint-cerf|Vint Cerf]] and [[pioneer:bob-kahn|Bob Kahn]] in 1974 to connect three networks that did not share a fabric. [[ethernet|Ethernet]] was sketched by [[pioneer:bob-metcalfe|Bob Metcalfe]] and [[pioneer:david-boggs|David Boggs]] at Xerox PARC in 1973 to connect Alto workstations on a coaxial cable. The Web was a memo by [[pioneer:tim-berners-lee|Tim Berners-Lee]] at CERN in 1989. [[ssh|SSH]] was Tatu Ylönen's response to a password-sniffing attack at Helsinki University. [[mcp|MCP]] was Anthropic's response to N×M tool integrations in 2024.

The IETF's job is not to invent these protocols. It is to **document them**, **review them**, and (often years later) **anoint them as standards**. The motto is **rough consensus and running code** — a phrase from [[pioneer:david-clark|David Clark]] at IETF 24 in 1992. The "running code" half is doing most of the work. A protocol nobody has implemented is not a real protocol.`
			},
			{
				type: 'pioneers',
				title: 'The Architects',
				people: [
					{
						name: 'Vint Cerf',
						years: '1943 –',
						title: 'Co-author of [[tcp|TCP]]/[[ip|IP]]',
						org: 'Stanford → DARPA → Google',
						contribution:
							"With [[pioneer:bob-kahn|Bob Kahn]], the 1974 paper that coined the word \"internet\" and described a single protocol they would later split into [[tcp|TCP]] + [[ip|IP]]. Stewards of the protocol's growth across the next four decades.",
						imagePath:
							'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg'
					},
					{
						name: 'Jon Postel',
						years: '1943 – 1998',
						title: 'RFC editor, IANA steward',
						org: 'ISI',
						contribution:
							'Edited or co-edited every foundational [[tcp|TCP]]/[[ip|IP]] RFC. Coined the Robustness Principle. Ran the IANA single-handedly from his office at ISI for over a decade.',
						imagePath:
							'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg'
					}
				]
			}
		]
	},
	{
		id: 'layer-model',
		title: 'The Layer Model',
		sections: [
			{
				type: 'narrative',
				title: 'The Problem Layers Solve',
				text: `In late 1972, Bob Kahn at DARPA was sketching a problem nobody had solved: how do you let a computer on the ARPANET talk to one on a packet-radio network, or a satellite link, when those networks know nothing about each other? He brought in [[pioneer:vint-cerf|Vint Cerf]] at Stanford, and in May 1974 they published "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications — the paper that coined the word "internet" and described a single, monolithic protocol they called [[tcp|TCP]] that did everything: routing hints, sequencing, {{flow-control|flow control}}, reliability.

By 1978, repeated implementation work at Stanford, BBN, and University College London revealed the flaw. Some applications — packet voice, in particular — needed **speed** more than **reliability**. Forcing every application through the same reliable byte-stream was wrong. [[pioneer:jon-postel|Jon Postel]] and David Reed argued for splitting the monolith: a thin internetworking layer ([[ip|IP]]) underneath, and an end-to-end transport layer above it. That single architectural decision is the reason [[udp|UDP]], [[icmp|ICMP]], and decades later [[quic|QUIC]] could exist without renegotiating with every router on the planet.

The deeper principle is older than networking: separate what changes together from what doesn't. The wire (copper, fibre, radio) changes every decade. The routing algorithm changes every few years. The web changes every Tuesday. Layered protocols let each move on its own clock — and let an engineer reason about one layer without holding the other six in their head.`
			},
			{
				type: 'diagram',
				title: 'What Each Layer Adds — A Single Web Request',
				definition: `graph TD
  APP["<b>L7 Application</b><br/>HTTP — GET /index.html"]
  [[tls|TLS]]["<b>L5-7 Security</b><br/>TLS — wraps + encrypts"]
  [[tcp|TCP]]["<b>L4 Transport</b><br/>TCP — adds ports, seq #, ACKs"]
  IP["<b>L3 Internet</b><br/>IP — adds src/dst addresses, TTL"]
  ETH["<b>L2 Data Link</b><br/>[[ethernet|Ethernet]] — adds src/dst MAC, FCS"]
  PHY["<b>L1 Physical</b><br/>Bits on copper / fibre / radio"]

  APP -->|"each layer wraps the one above"| TLS
  TLS --> TCP
  TCP --> IP
  IP --> ETH
  ETH --> PHY`,
				caption:
					'Going down the stack, each layer wraps the previous {{payload|payload}} with its own header — {{encapsulation|encapsulation}}. Going up, each layer strips its header and hands the rest to the next. This is why the same HTTP request rides unchanged across [[wifi|Wi-Fi]] at home, [[ethernet|Ethernet]] in the office, and a satellite link to a server in Iowa.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSI_Model_v1.svg/500px-OSI_Model_v1.svg.png',
				alt: 'The OSI 7-layer reference model — Physical, Data Link, Network, Transport, Session, Presentation, Application.',
				caption:
					'The OSI 7-layer reference model, ratified by ISO in 1984. Forty years later it still shapes how every networking textbook teaches the stack — even though the internet itself runs the simpler 4-layer {{tcp-ip-model|TCP/IP model}}.',
				credit: 'Diagram: Wikimedia Commons / public domain'
			},
			{
				type: 'narrative',
				title: 'The Seven Layers, Honestly',
				text: `**L1 — Physical.** Volts on a wire, photons in a fibre, modulated radio. Specified by IEEE 802.3 ([[ethernet|Ethernet]] PHYs), [[wifi|802.11]] ([[wifi|Wi-Fi]]), DOCSIS, fibre-optic standards, and the radio rules from the ITU. If your problem is "the cable is unplugged," it's L1.

**L2 — Data Link.** Frames addressed by 48-bit {{mac-address|MAC addresses}}. Reaches one hop on a single segment. [[ethernet|Ethernet]] (RFC-less; IEEE 802.3) and [[wifi|Wi-Fi]] ([[wifi|802.11]]) live here, alongside [[arp|ARP]], the spanning tree protocol, and {{vlan|VLAN}} tags. Switches operate at L2.

**L3 — Network.** [[ip|IP]] addresses, hop-by-hop forwarding, longest-prefix-match routing. [[ipv6|IPv6]], [[icmp|ICMP]], [[bgp|BGP]] for inter-domain routing. Routers operate at L3 — they decrement TTL and forward across networks.

**L4 — Transport.** End-to-end semantics. [[tcp|TCP]] (reliable, ordered byte stream), [[udp|UDP]] (fire-and-forget datagrams), [[sctp|SCTP]] (multi-streamed), [[mptcp|MPTCP]] (multi-path), and now [[quic|QUIC]] which folds in {{encryption|encryption}}. The first layer with a **port** — the demux that picks which application gets the bytes.

**L5–7 — Session, Presentation, Application.** OSI's three top layers. In practice the line between them is a fiction: [[http1|HTTP]] does session, presentation, and application at once. [[tls|TLS]] is "kind of L5/6" but on [[quic|QUIC]] it's fused into L4. [[smtp|SMTP]], [[dns|DNS]], [[ssh|SSH]], [[websockets|WebSockets]], [[grpc|gRPC]], [[mcp|MCP]] — everything an engineer touches sits up here.

The IETF stack pragmatically collapses 5–7 into one Application layer. That's the four-layer [[tcp|TCP]]/[[ip|IP]] model: Link, Internet, Transport, Application. It maps to OSI but doesn't pretend the upper three are usefully distinct.`
			},
			{
				type: 'diagram',
				title: 'OSI vs [[tcp|TCP]]/[[ip|IP]] — Side by Side',
				definition: `graph TD
  subgraph OSI["OSI — 7 layers (1984, ISO 7498)"]
    direction TB
    O7["L7 Application"] --- O6["L6 Presentation"]
    O6 --- O5["L5 Session"]
    O5 --- O4["L4 Transport"]
    O4 --- O3["L3 Network"]
    O3 --- O2["L2 Data Link"]
    O2 --- O1["L1 Physical"]
  end
  subgraph TCPIP["TCP/IP — 4 layers (RFC 1122, 1989)"]
    direction TB
    T4["Application — HTTP, [[dns|DNS]], [[ssh|SSH]], [[tls|TLS]]"] --- T3["Transport — [[tcp|TCP]], [[udp|UDP]], [[quic|QUIC]]"]
    T3 --- T2["Internet — IP, [[icmp|ICMP]], [[bgp|BGP]]"]
    T2 --- T1["Link — [[ethernet|Ethernet]], Wi-Fi, [[arp|ARP]]"]
  end
  O7 -.->|maps| T4
  O6 -.->|maps| T4
  O5 -.->|maps| T4
  O4 -.->|maps| T3
  O3 -.->|maps| T2
  O2 -.->|maps| T1
  O1 -.->|maps| T1`,
				caption:
					'OSI is a teaching tool with seven crisp boxes. [[tcp|TCP]]/[[ip|IP]] is what the internet actually runs and collapses the three top boxes into one practical "Application" layer. Both end at the wire — only the bookkeeping above differs.'
			},
			{
				type: 'narrative',
				title: 'How [[tcp|TCP]]/[[ip|IP]] Won the Standards War',
				text: `Through the 1980s the official future of networking was OSI. ISO and the ITU promoted the seven-layer suite — TP4 transport, CLNP networking — with full institutional backing: European PTTs, the U.S. government's GOSIP mandate, the prestige of a global standards body. [[tcp|TCP]]/[[ip|IP]] was, in those rooms, considered a research project that would be replaced.

It was not. By July 1992, when [[pioneer:david-clark|David D. Clark]] gave his "A Cloudy Crystal Ball" plenary at the 24th IETF meeting in Cambridge, MA, he could distill the IETF's working culture into the sentence that decided the question: **"We reject: kings, presidents and voting. We believe in: rough consensus and running code."** OSI shipped specifications. The IETF shipped code. Code won.

The win was never about elegance — OSI's seven layers are arguably cleaner. It was about deployment economics. By 1992, [[tcp|TCP]]/[[ip|IP]] was already running on every Unix box in every university, every BSD-derived workstation, every router on the NSFNET backbone. Switching to OSI would have required a coordinated global flag day. The internet had quietly become too big to migrate.`
			},
			{
				type: 'callout',
				title: 'Rough Consensus and Running Code',
				text: 'David Clark\'s 1992 IETF quote is the closest thing the internet community has to a national anthem. It says: standards are documents about behavior we have already shipped, not theories we hope someone will adopt. It is the reason new protocols appear as Internet Drafts with reference implementations, not as ISO documents. And it is why — even in 2026 — every protocol in this lab traces back to a draft someone could install and run.'
			},
			{
				type: 'narrative',
				title: 'Where the Layers Blur',
				text: `Real protocols don't always respect the model:

- [[quic|QUIC]] runs on [[udp|UDP]] (L4) but implements its own reliability + {{congestion-control|congestion control}} + {{multiplexing|multiplexing}} in user space, and folds [[tls|TLS]] 1.3 directly into the {{handshake|handshake}}. Is [[quic|QUIC]] L4 or L4+L5+L6? Both, honestly.
- MPLS sits between L2 and L3 — a 4-byte shim header that drives label-swap forwarding underneath [[ip|IP]]. The community calls it "Layer 2.5" because no other label fits.
- [[icmp|ICMP]] is "Layer 3" but it doesn't carry application data; it carries control messages **about** L3.
- Network Address Translation (NAT) rewrites L3 source addresses **and** L4 source ports together — breaking the strict layer separation in {{exchange|exchange}} for [[ip|IPv4]] address conservation.
- Encrypted Client Hello (RFC 9849) hides the L7 SNI inside an L5/6 [[tls|TLS]] extension so middleboxes can't see the destination domain.

The model is a **map**, not the territory. The map is invaluable: it lets you reason about responsibilities, predict failures, and design new protocols. But every model has its edge cases, and every edge case is where the most interesting engineering happens.`
			},
			{
				type: 'callout',
				title: 'A Layer Is Defined by What It Replaces',
				text: 'When you read "X is a Layer 4 protocol," what that really means is: X provides services to whatever is above it (Layer 5+) and consumes services from whatever is below it (Layer 3). Swap out the layer underneath — [[ip|IP]] for [[ipv6|IPv6]], [[ethernet|Ethernet]] for [[wifi|Wi-Fi]], fibre for radio — and X keeps working. That replaceability **is** the layer. Anything tightly coupled to its substrate isn\'t really layered.'
			}
		]
	},
	{
		id: 'addressing',
		title: 'Addressing & Identity',
		sections: [
			{
				type: 'narrative',
				title: 'Four Layers of Identity, At Once',
				text: `When your browser loads google.com, four different identifiers cooperate. Each one identifies the destination at a different level of abstraction; each one is essential, and none can do the others' job.

**Hostnames** (\`google.com\`) are for humans. They are stable, memorable, and meaningless to the network. Before any traffic flows, [[dns|DNS]] translates the hostname into a network address.

**{{ip-address|IP addresses}}** (\`142.250.80.46\` or the [[ipv6|IPv6]] \`2607:f8b0:4004:c1b::64\`) identify endpoints across the internet. They are what routers use to choose a path. They stay constant from source to destination.

**{{mac-address|MAC addresses}}** (\`f4:5c:89:9c:1a:30\`) identify hardware on a single local network — the wire your laptop is on, or the [[wifi|Wi-Fi]] {{access-point|access point}} you are associated with. Crucially, the {{mac-address|MAC address}} in a packet **changes at every router hop**. The [[ip|IP]] destination stays the same; the next-hop MAC is rewritten as the packet moves from segment to segment.

**{{port|Ports}}** (\`443\`) identify the application on a host. The OS uses the port number to deliver an arriving packet to the right process — port 443 to your browser, port 22 to your [[ssh|SSH]] daemon, port 5432 to PostgreSQL.

Together: [[dns|DNS]] resolves the hostname → [[ip|IP]] routes the packet to the host → [[arp|ARP]] (or [[ipv6|IPv6 NDP]]) resolves the next-hop [[ip|IP]] to a MAC → the port delivers the payload to the right application.`
			},
			{
				type: 'diagram',
				title: 'The Address Stack — Top to Bottom',
				definition: `graph TD
  [[dns|DNS]]["Hostname<br/><b>google.com</b><br/>for humans"]
  IP["{{ip-address|IP address}}<br/><b>142.250.80.46</b><br/>routes across the internet"]
  MAC["{{mac-address|MAC address}}<br/><b>f4:5c:89:9c:1a:30</b><br/>delivers on the local segment"]
  Port["Port<br/><b>:443</b><br/>delivers to the right process"]
  DNS -->|"DNS resolves"| IP
  IP -->|"[[arp|ARP]] / NDP resolves"| MAC
  MAC -->|"OS demuxes"| Port`,
				caption: 'Each address layer answers a different question. [[dns|DNS]]: who. [[ip|IP]]: where. MAC: which port on this switch. Port: which program.'
			},
			{
				type: 'narrative',
				title: 'How an Address Survives the Trip',
				text: `Watch a single packet travel from your laptop to a Google server, focusing only on the addresses.

At your laptop: the packet has a destination [[ip|IP]] of 142.250.80.46 and a destination MAC of your home router's WAN-side address. Your router strips the [[ethernet|Ethernet]] frame, rewrites the source [[ip|IP]] via {{nat|NAT}} to its own public address, picks a new next-hop MAC (its ISP's gateway), and forwards.

At every router along the path — typically 10-20 hops — the same thing happens. The [[ip|IP]] destination is left untouched; the source [[ip|IP]] is left untouched; the **MAC pair is rewritten at every single hop**. The router is doing all the work of finding the next hop via [[bgp|BGP]] or its internal {{routing-table|routing table}}; the [[ip|IP]] packet never knows about any of it.

When the packet finally reaches the Google server, its TTL has decremented from 64 (Linux's default) to perhaps 50, the source MAC is the last router's MAC, and the destination MAC is the server's network interface. The OS strips the [[ethernet|Ethernet]] header, validates the [[ip|IP]] destination matches its own, looks up the destination port (443) in its socket table, and hands the {{payload|payload}} to the nginx process.

This division of labour — [[ip|IP]] for end-to-end identity, MAC for hop-to-hop delivery — is the architectural choice that lets you build a network from heterogeneous links. The wire format on the [[ethernet|Ethernet]] between you and your router can be different from the wire format on the fibre between continents, because at every router the L2 envelope is thrown away and re-written for the next link.`
			},
			{
				type: 'callout',
				title: 'Address scope is what matters most',
				text: 'A {{mac-address|MAC}} is only meaningful inside one {{broadcast|broadcast}} domain. An {{ip-address|IP}} is globally unique (or unique within a private space behind {{nat|NAT}}). A port is meaningful only on one host. A hostname is meaningful to the entire [[dns|DNS]] namespace. **The scope of an address determines what infrastructure has to keep state about it** — which is why the internet can scale to billions of hosts without any single device knowing all of them.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/MAC-48_Address.svg/500px-MAC-48_Address.svg.png',
				alt: 'Bit-field structure of a 48-bit MAC address — 24-bit OUI + 24-bit NIC, with multicast and locally-administered flag bits.',
				caption:
					'A 48-bit {{mac-address|MAC address}} is structured: the first 24 bits are the OUI (Organisationally Unique Identifier — Apple = ac:de:48, Cisco = 00:1b:54, etc.), the last 24 bits are assigned by the manufacturer per device. Two flag bits in the first octet mark {{multicast|multicast}} and locally-administered addresses.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 2.5'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/DNS_schema.svg/500px-DNS_schema.svg.png',
				alt: 'The hierarchical [[dns|DNS]] namespace tree, rooted at "." with TLDs branching beneath.',
				caption:
					'The [[dns|DNS]] namespace is a global tree rooted at "." (the root). Top-level domains (.com, .org, country codes) sit beneath the root; second-level domains (example.com, wikipedia.org) sit beneath those. Resolution walks the tree from root to leaf — usually answered by a cache on the way.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 2.5'
			},
			{
				type: 'narrative',
				title: 'NAT Changed Everything',
				text: `In 1993, the IETF realised [[ip|IPv4]]'s 4.3 billion addresses would not last. Three responses landed nearly simultaneously: **{{cidr|CIDR}}** (RFC 1519, 1993) abolished the rigid Class A/B/C boundaries; **private address ranges** ([[rfc:1918|RFC 1918]], 1996) gave every organisation 10.0.0.0/8 to use internally; and **Network Address Translation** (RFC 1631, 1994) let one public [[ip|IP]] front for thousands of private hosts.

NAT is the reason your home network's printer is at 192.168.1.10 and Google's nginx is at 142.250.80.46 even though no router on the public internet has any idea where 192.168.1.10 lives. Your home router rewrites the source [[ip|IP]] and source port of every outbound packet, keeps a table of (private [[ip|IP]], private port) → (public [[ip|IP]], public port) mappings, and reverses the rewrite on the response. From outside, every device in your home shares a single public [[ip|IP]].

NAT bought [[ip|IPv4]] thirty extra years. It also broke a foundational property of the internet: **end-to-end addressability**. Two hosts behind separate NATs can no longer simply open a [[tcp|TCP]] connection to each other; they need a third-party relay (STUN/TURN), elaborate hole-punching ([[webrtc|WebRTC]]), or a long-lived outbound connection (which is why everything is now polled or webhooks instead of pushed). The [[ipv6|IPv6]] transition ([[frontier:ipv6-50-percent|crossed 50% on Google in 2026]]) is what eventually fixes this.`
			},
			{
				type: 'callout',
				title: 'Why an [[ip|IP]] looks like four numbers',
				text: '[[ip|IPv4]] addresses are 32 bits, conventionally written as four decimal numbers separated by dots: \`192.0.2.5\` is just \`11000000.00000010.00000000.00000101\` in dotted-decimal. The notation is for humans. The router only sees the bits. When you write a {{cidr|CIDR}} prefix like \`192.0.2.0/24\`, the \`/24\` says "the first 24 bits are the network; the last 8 are the host" — a {{routing-table|routing table}} lookup compares those leading bits against its prefix entries to pick the next {{hop|hop}}.'
			}
		]
	},
	{
		id: 'packets',
		title: 'Packets & Encapsulation',
		sections: [
			{
				type: 'narrative',
				title: 'Why Packet Switching Won',
				text: `Until the late 1960s, every long-distance computer communication used **circuit switching** — the model the telephone network ran on. To send data from A to B, the network reserved a continuous channel between them for the duration of the call. The capacity was guaranteed but locked. Two hosts that exchanged a burst of data once a minute would tie up a circuit the other 59 seconds.

Paul Baran at RAND (1962-1964) and Donald Davies at NPL (1965-1967) independently proposed a different idea: chop the data into small **packets**, label each one with its destination, and let intermediate nodes forward each packet independently along whichever path is least busy. No reservation, no per-call setup, no wasted capacity. The 1969 ARPANET implemented this and never looked back.

A {{packet|packet}} is a **self-contained unit** with a **header** (control information — addresses, length, {{checksum|checksum}}) and a **{{payload|payload}}** (the bytes the application actually sent). Routers along the path read only the header; they never need to look at the payload, and they certainly never need to remember anything about previous packets in the same conversation. That statelessness is what lets the internet route trillions of packets per second through equipment that costs less than a car.`
			},
			{
				type: 'diagram',
				title: 'Encapsulation — Layer by Layer',
				definition: `graph TD
  D["<b>HTTP Data</b><br/>GET /index.html"]
  S["<b>[[tcp|TCP]] Segment</b><br/>+ src/dst port, seq#"]
  P["<b>IP Packet</b><br/>+ src/dst IP, TTL"]
  F["<b>[[ethernet|Ethernet]] Frame</b><br/>+ src/dst MAC, CRC"]
  D -->|"TCP wraps"| S
  S -->|"IP wraps"| P
  P -->|"Ethernet wraps"| F`,
				caption: 'Each layer adds its own header around the {{payload|payload}} from above. At the destination, headers are stripped in reverse order, and the original HTTP request is delivered to the application.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/UDP_encapsulation.svg/500px-UDP_encapsulation.svg.png',
				alt: 'Encapsulation: application data wrapped in a [[udp|UDP]] datagram, then an [[ip|IP]] packet, then an [[ethernet|Ethernet]] frame.',
				caption:
					'A second look at the same idea — this one shows a [[udp|UDP]] datagram (it works the same for [[tcp|TCP]]). Each header is a fixed shape; only the {{payload|payload}} region grows or shrinks. The same byte of application data is, simultaneously, part of a [[udp|UDP]] datagram, an [[ip|IP]] packet, and an [[ethernet|Ethernet]] frame.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 3.0'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/IPv4_Header.svg/500px-IPv4_Header.svg.png',
				alt: 'Bit-field layout of the 20-byte [[ip|IPv4]] header.',
				caption:
					'The [[ip|IPv4]] header (20 bytes minimum). Each row is 32 bits. Source and destination addresses each take a full row; the smaller fields above pack version, header length, ToS/{{dscp|DSCP}}, {{fragmentation|fragmentation}}, TTL, transport protocol, and a {{checksum|checksum}} into the first three rows. Options (rare) extend it.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 3.0'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Ethernet_Type_II_Frame_format.svg/500px-Ethernet_Type_II_Frame_format.svg.png',
				alt: '[[ethernet|Ethernet]] II frame structure: 6-byte destination MAC, 6-byte source MAC, 2-byte EtherType, payload, 4-byte FCS.',
				caption:
					'The [[ethernet|Ethernet]] II frame format that has not changed since 1980. 14 bytes of header (destination MAC, source MAC, EtherType), then up to 1500 bytes of {{payload|payload}}, then a 4-byte CRC frame check sequence. Everything else — {{vlan|VLAN}} tags, jumbo frames, 800 GbE — slid in around it.',
				credit: 'Diagram: Wikimedia Commons / public domain'
			},
			{
				type: 'narrative',
				title: 'Why Layers Have Different Names For The Same Thing',
				text: `**{{frame|Frames}}** at Layer 2 ([[ethernet|Ethernet]], [[wifi|Wi-Fi]]). **{{packet|Packets}}** at Layer 3 ([[ip|IP]]). **{{segment|Segments}}** ([[tcp|TCP]]) or **{{datagram|datagrams}}** ([[udp|UDP]]) at Layer 4. **Messages** at Layer 7 (HTTP).

The names look like jargon for jargon's sake, but they encode something useful: the **scope** of the unit. A frame only matters between two devices on the same wire. A packet only matters end-to-end across the internet. A segment only matters to the two [[tcp|TCP]] endpoints. A message only matters to the application. When a packet is dropped at L3, the L2 frame that carried it is irrelevant; when a segment is retransmitted, the L7 message it was part of has to be reassembled. Naming each unit makes it possible to talk about loss, {{latency|latency}}, and corruption at the right level.

The same data is all of these things at once, of course. Right now, on this page load, the byte that says "G" in your "GET /index.html" is part of an HTTP message, inside a [[tcp|TCP]] segment numbered 42017, inside an [[ip|IP]] packet with TTL 60, inside an [[ethernet|Ethernet]] frame with a 32-bit CRC. The byte does not change; the wrappers around it change at every layer boundary.`
			},
			{
				type: 'callout',
				title: 'MTU and the 1500-byte ceiling',
				text: 'The largest packet most internet links will carry without fragmenting is **1500 bytes** — the [[ethernet|Ethernet]] {{mtu|MTU}}, set by [[pioneer:bob-metcalfe|Bob Metcalfe]] in 1980 and never changed. Subtract 20 bytes of [[ip|IP]] header and 20 bytes of [[tcp|TCP]] header, and the maximum {{payload|payload}} per packet is **1460 bytes**. Sending a 1 MB file means roughly 685 packets. {{path-mtu-discovery|Path MTU Discovery}} probes the path to find the largest size that survives end-to-end; when it fails (the dreaded {{mtu-black-hole|"MTU black hole"}}), connections hang because both sides keep sending packets that get dropped silently.'
			},
			{
				type: 'narrative',
				title: 'The Conservation of Bytes',
				text: `Headers cost something. A 1500-byte [[ethernet|Ethernet]] frame might carry only 1448 bytes of useful [[tcp|TCP]] {{payload|payload}} (40 bytes of [[tcp|TCP]] options, 20 of [[ip|IP]], plus the 14-byte [[ethernet|Ethernet]] header and 4-byte CRC). On a satellite link priced per byte, those overheads are real money — which is why [[mqtt|MQTT]] designed a 2-byte minimum header and [[coap|CoAP]] designed a 4-byte one for IoT.

Headers also cost time. Every byte added to a packet is a byte that has to be sent, propagated, received, and parsed. For [[quic|QUIC]] and [[http3|HTTP/3]] running over [[tls|TLS 1.3]], the per-packet header is around 25-30 bytes — small enough to fit roughly 50 packets in a single MTU, large enough to encode a connection ID, packet number, and authenticated {{encryption|encryption}} tag.

The eternal trade-off is **expressiveness vs overhead**. A header that names the source [[ip|IP]], destination [[ip|IP]], source port, destination port, {{sequence-number|sequence number}}, ACK number, window size, options, {{checksum|checksum}}, and [[tls|TLS]] metadata gives the receiver enough information to do reliability, {{congestion-control|congestion control}}, and security correctly. A header that says only "this is a 1500-byte chunk, somewhere" is faster to transmit but useless for anything beyond raw throughput. Forty years of protocol design is the search for the right balance at each layer of the stack.`
			}
		]
	},
	{
		id: 'ports-sockets',
		title: 'Ports & Sockets',
		sections: [
			{
				type: 'narrative',
				title: 'A Hundred Services On One Wire',
				text: `Your laptop has one [[wifi|Wi-Fi]] card, one [[ip|IP]] address from your router, one [[ethernet|Ethernet]] cable to your switch — yet it runs a web browser, an [[ssh|SSH]] client, a Slack daemon, a Spotify player, half a dozen background updaters, and a Postgres server, all talking to the network at the same time. Something has to demultiplex the incoming packets to the right process.

That something is the **port**. A {{port|port}} is a 16-bit unsigned integer (0-65535) that lives in the [[tcp|TCP]] or [[udp|UDP]] header, alongside a similar field naming the source. When a packet arrives at the host, the OS looks up the (protocol, destination port) pair in its socket table and hands the {{payload|payload}} to the matching process. Different processes own different ports; ports are the OS's way of carving one network identity into many independent endpoints.

Three conventional ranges. **Well-known ports** (0–1023) are reserved for standard protocols and require root/admin privileges to bind on Unix: 22 for [[ssh|SSH]], 53 for [[dns|DNS]], 80 for [[http1|HTTP]], 443 for HTTPS, 25 for [[smtp|SMTP]]. **Registered ports** (1024–49151) are conventionally assigned to specific applications by IANA: 5432 for PostgreSQL, 6379 for Redis, 8080 for HTTP-alt. **Ephemeral ports** (49152–65535, on most OSes) are assigned temporarily to the client side of a connection — your browser picks a random one when it dials out.`
			},
			{
				type: 'diagram',
				title: 'Ports Multiplex Applications',
				definition: `graph TD
  Net["Incoming Packet<br/>dst: 10.0.0.5"]
  OS["Operating System"]
  Net --> OS
  OS -->|":80"| W["Web Server"]
  OS -->|":443"| S["HTTPS Server"]
  OS -->|":22"| [[ssh|SSH]]["SSH Daemon"]
  OS -->|":5432"| DB["Database"]`,
				caption: 'The OS uses the destination port to deliver each packet to the right process. Multiple services share one [[ip|IP]] address; the port disambiguates.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/TCP_Header.svg/500px-TCP_Header.svg.png',
				alt: 'Bit-field layout of the [[tcp|TCP]] segment header — source/destination ports, sequence/ACK numbers, flags, window, checksum.',
				caption:
					'The [[tcp|TCP]] segment header. The first row is the two 16-bit port fields — these are what the OS uses to demultiplex an arriving segment to a process. Below them: 32-bit {{sequence-number|sequence number}}, 32-bit ACK number, header length, control flags, window size, {{checksum|checksum}}, urgent pointer, and optional fields.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 3.0'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/InternetSocketBasicDiagram_zhtw.png/500px-InternetSocketBasicDiagram_zhtw.png',
				alt: 'Berkeley sockets API flow: server calls socket/bind/listen/accept, client calls socket/connect, then both send/recv.',
				caption:
					'The Berkeley sockets API has been the universal Unix interface for network I/O since 1983. Server calls socket() → bind(port) → listen() → accept() and blocks until a client arrives. Client calls socket() → connect(server, port). Once the four-tuple is bound, both sides read and write bytes like a file.',
				credit: 'Diagram: Wikimedia Commons / public domain'
			},
			{
				type: 'narrative',
				title: 'Sockets, and the Magic Four-Tuple',
				text: `A **{{socket|socket}}** is the OS abstraction that ties a network endpoint to a file descriptor. On Linux, you create one with the \`socket()\` system call, configure the protocol ([[tcp|TCP]] or [[udp|UDP]]) and address family ([[ip|IPv4]] or [[ipv6|IPv6]]), \`bind()\` it to a local address and port, and then either \`listen()\` for incoming connections (server side) or \`connect()\` to a remote endpoint (client side). Once established, you read and write bytes from the socket like a file.

A [[tcp|TCP]] connection is uniquely identified by a **four-tuple**: \`(source [[ip|IP]], source port, destination [[ip|IP]], destination port)\`. This is the deepest insight in the [[tcp|TCP]] design. A web server bound to port 443 can serve thousands of clients simultaneously, because each client connection has a different source [[ip|IP]] or source port — all of them legitimately distinguishable as separate connections to the same listening socket.

Run \`ss -t\` (or \`netstat -t\`) on a busy server and you can see the table. Hundreds of ESTABLISHED rows, all sharing the local \`*:443\` endpoint, each pointing at a different remote ([[ip|IP]], port). The kernel maintains a hash table indexed on the four-tuple; every arriving segment is dispatched in O(1) to its connection.`
			},
			{
				type: 'callout',
				title: 'Why TIME_WAIT lives for 60 seconds',
				text: 'After a [[tcp|TCP]] connection closes, the local OS holds the four-tuple in **{{time-wait|TIME_WAIT}}** state for ~60 seconds (2× the maximum segment lifetime). The reason is paranoia about stragglers — a packet from the old connection that was delayed in the network for 30 seconds could otherwise re-enter a freshly-opened connection on the same four-tuple and be misinterpreted as legitimate data. On servers with thousands of short-lived connections per second this can exhaust the {{ephemeral-port|ephemeral port}} range; the cure is connection reuse (HTTP {{keep-alive|keep-alive}}, [[http2|HTTP/2]] {{multiplexing|multiplexing}}, [[grpc|gRPC]] connection pooling).'
			},
			{
				type: 'narrative',
				title: 'Why Port 80, Port 443, Port 22',
				text: `The well-known ports look arbitrary, and many of them are. **Port 80** for HTTP was picked by [[pioneer:tim-berners-lee|Tim Berners-Lee]] in 1991 — the comment in his early code reads "80 because that was available and we needed a number." **Port 22** for [[ssh|SSH]] was picked by Tatu Ylönen in 1995 because it sat between Telnet (23) and [[ftp|FTP]] (21). **Port 443** for HTTPS was assigned by IANA in 1994 when Netscape introduced SSL.

Once chosen, well-known ports are **impossible to change**. Every {{firewall|firewall}} in the world has a rule allowing outbound 443. Every CDN, every load balancer, every browser bookmark, every \`<a href>\` written without an explicit port assumes 443 for HTTPS. A protocol that wanted to switch ports today would have to coordinate the rewrite across the entire deployed internet — which is why nobody seriously tries.

This is also why [[quic|QUIC]] runs over [[udp|UDP]] port 443 ([[http3|HTTP/3]]) — by squatting on the same {{well-known-port|well-known port}} that HTTPS already uses, it inherits the firewall traversal HTTPS earned. **The choice of port number is itself a deployment decision.**`
			},
			{
				type: 'callout',
				title: 'How a load balancer works at the port level',
				text: 'A load balancer like nginx or HAProxy binds to port 443, accepts the inbound [[tcp|TCP]]/[[tls|TLS]] connection, then opens a **separate** outbound connection to one of N backend servers. From the client\'s perspective there is one connection; from the backends\' perspective there are many. The two connections are stitched together in user space. This is why the source [[ip|IP]] at the backend is the load balancer\'s, not the original client\'s, unless you explicitly forward it via the **PROXY protocol** or an {{header|HTTP header}} like \`X-Forwarded-For\`.'
			}
		]
	},
	{
		id: 'reliability-speed',
		title: 'Reliability vs Speed',
		sections: [
			{
				type: 'narrative',
				title: 'The Fundamental Tradeoff',
				text: `Every network protocol makes a tradeoff between reliability and speed, and the choice ripples through every layer above. The story is forty years old and still writing itself.

**{{connection-oriented|Connection-oriented}}** protocols like [[tcp|TCP]] establish a session before sending data. They guarantee every byte arrives, in order, with no duplicates. The cost: {{handshake|handshakes}} add a round-trip up front, {{retransmission|retransmissions}} add delay when packets drop, {{flow-control|flow control}} caps throughput, and {{head-of-line-blocking|head-of-line blocking}} stalls every byte behind a lost one.

**{{connectionless|Connectionless}}** protocols like [[udp|UDP]] skip all of that. Each {{datagram|datagram}} is independent — no connection setup, no ordering guarantees, no {{retransmission|retransmission}}. The benefit: an 8-byte header and zero state. The cost: your application is on its own when packets vanish or arrive out of order.

This tradeoff drives the entire protocol ecosystem. Web pages need reliability → [[tcp|TCP]]. Video calls need low {{latency|latency}} → [[udp|UDP]] (with [[rtp|RTP]] for framing). Modern transports like [[quic|QUIC]] try to have both — reliable delivery when needed, with minimal latency by building on [[udp|UDP]] and adding selective retransmission per stream so one lost packet only blocks the stream it belongs to.`
			},
			{
				type: 'diagram',
				title: 'The Reliability Spectrum',
				definition: `graph LR
  [[udp|UDP]]["<b>UDP</b><br/>No guarantees<br/>8-byte header"] ---|"+ {{encryption|encryption}} + {{multiplexing|multiplexing}}"| [[quic|QUIC]]["<b>QUIC</b><br/>Per-stream reliability<br/>0/{{one-rtt|1-RTT}} {{handshake|handshake}}"]
  QUIC ---|"+ ordered byte stream"| [[tcp|TCP]]["<b>TCP</b><br/>Full reliability<br/>1-RTT handshake"]`,
				caption: 'Protocols sit on a spectrum from raw speed ([[udp|UDP]]) to guaranteed delivery ([[tcp|TCP]]). [[quic|QUIC]] sits in between by giving each multiplexed stream its own reliability — so a lost packet only blocks one stream.'
			},
			{
				type: 'narrative',
				title: 'October 1986: The First Collapse',
				text: `In October 1986 the internet broke for the first time. Throughput between Lawrence Berkeley Laboratory and UC Berkeley — three IMP hops apart, about 400 yards on the same site — collapsed from 32 kbps to 40 bps. A factor of 800. Multiple cascading collapses followed across the NSFNET backbone.

The cause was [[tcp|TCP]] itself. Early BSD [[tcp|TCP]] retransmitted aggressively when it saw loss. When the network was actually congested, every {{retransmission|retransmission}} generated more loss, which generated more retransmissions. The network was eating itself.

[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent the next eighteen months on the fix. Their 1988 SIGCOMM paper, **"{{congestion-avoidance|Congestion Avoidance}} and Control,"** gave the world {{slow-start|slow start}}, {{aimd|AIMD}} congestion avoidance, fast retransmit, fast recovery, and Karn's algorithm for {{rtt|round-trip-time}} estimation under retransmission ambiguity. Six algorithms in one paper. The fixes shipped in 4.3BSD-Tahoe and saved the internet.

The principle they articulated — **conservation of packets** — has held up for forty years. A sender should put one packet into the network only when an ACK confirms a previous packet has left it. Everything since is variations on that theme.`
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg',
				alt: 'Van Jacobson — co-author of the 1988 paper that saved the internet from congestion collapse and, decades later, of BBR.',
				caption:
					'[[pioneer:van-jacobson|Van Jacobson]], co-author with Mike Karels of "{{congestion-avoidance|Congestion Avoidance}} and Control" (SIGCOMM \'88) — the paper whose {{slow-start|slow start}}, {{aimd|AIMD}}, and fast retransmit fixes shipped in 4.3BSD-Tahoe and stopped the 1986 cascade. Three decades later he was a co-author of the BBR paper at Google.',
				credit: 'Photo: Wikimedia Commons / public domain'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg',
				alt: 'ARPA Network logical map, September 1973 — the network whose successor would melt down in 1986.',
				caption:
					'The ARPA Network in September 1973, a few dozen IMPs and hosts. By 1986 the same architecture was carrying NSFNET traffic across the country — and the buffers between Lawrence Berkeley Lab and UC Berkeley, three hops apart, were where Jacobson watched throughput collapse from 32 kbps to 40 bps.',
				credit: 'Image: ARPA / public domain, via Wikimedia Commons'
			},
			{
				type: 'diagram',
				title: 'The Jacobson Recipe (1988)',
				definition: `graph TD
  S0["<b>{{slow-start|Slow Start}}</b><br/>cwnd doubles each RTT<br/>until first loss"] -->|"loss detected"| FR["<b>Fast Retransmit</b><br/>3 duplicate ACKs →<br/>retransmit immediately"]
  S0 -->|"reach ssthresh"| CA["<b>{{congestion-avoidance|Congestion Avoidance}}</b><br/>cwnd += 1 MSS / RTT<br/>(linear growth)"]
  FR --> RC["<b>Fast Recovery</b><br/>cwnd /= 2,<br/>continue, don't restart"]
  RC -->|"new ACK"| CA
  CA -->|"loss detected"| FR
  CA -->|"timeout"| S0`,
				caption: 'The four-phase loop every [[tcp|TCP]] {{congestion-control|congestion controller}} has used since 1988. Modern algorithms ({{cubic|CUBIC}}, {{bbr|BBR}}) replace the linear growth in {{congestion-avoidance|Congestion Avoidance}} with their own curves, but the overall shape is unchanged.'
			},
			{
				type: 'narrative',
				title: 'CUBIC: A Curve That Scales',
				text: `By the mid-2000s networks had outgrown Reno's polite linear ramp. On a fat long pipe — say a 1 Gbps transcontinental link with a 100 ms RTT, a {{bdp|bandwidth-delay product}} of 12.5 MB — adding one packet per RTT was glacial. After a single loss it could take hundreds of RTTs to refill the pipe. The network's {{bandwidth|bandwidth}} was sitting unused while [[tcp|TCP]] slowly tiptoed back up.

In 2008, Sangtae Ha, Injong Rhee, and Lisong Xu at NC State published {{cubic|CUBIC}}: replace {{aimd|AIMD}}'s linear function with a **cubic** function of time since the last loss. Far from the previous {{congestion-window|cwnd}}, CUBIC ramps fast; near it, it slows down and probes carefully; if the probe doesn't trigger loss, it accelerates past the previous max. The cubic curve is symmetric so two flows with different RTTs converge to fairness.

CUBIC shipped as the Linux default in kernel 2.6.19 (2006), before any RFC blessed it. Windows 10 1709 / Server 2019 made it Windows's default. macOS uses it. [[rfc:9438|RFC 9438]] (August 2023) finally moved CUBIC to Standards Track, replacing the 2018 Informational [[rfc:8312|RFC 8312]]. Most [[tcp|TCP]] traffic on the internet today is CUBIC.`
			},
			{
				type: 'narrative',
				title: 'BBR: Stop Treating Loss as the Signal',
				text: `Loss is a terrible primary signal because modern paths often drop packets for reasons that have nothing to do with congestion — a wireless retry budget exhausted, a lossy fibre amplifier, a buffer overflowing somewhere a thousand miles away. {{cubic|CUBIC}} backs off in all those cases too, even when the bottleneck wasn't actually full.

[[pioneer:van-jacobson|Van Jacobson]] (returning, decades later, to the same problem) and a Google team published **"BBR: Congestion-Based {{congestion-control|Congestion Control}}"** in 2016. Instead of treating loss as the signal, BBR continuously **models** the path: it estimates the bottleneck {{bandwidth|bandwidth}} and the minimum RTT, and paces packets to fill exactly the {{bdp|bandwidth-delay product}} — no more, no less. Buffers stay empty. Loss is irrelevant unless something physical actually fails.

BBRv1 hit ~4% mean throughput improvement on YouTube globally, more than 14% in some countries, and a 33% reduction in median RTT. BBRv3 has been the default for google.com and YouTube traffic since 2023. Linux supports it via \`sysctl net.ipv4.tcp_congestion_control=bbr\` paired with the FQ qdisc that BBR's {{pacing|pacing}} requires. See [[frontier:bbrv3-default|BBRv3 default for Google + YouTube]].`
			},
			{
				type: 'callout',
				title: 'Why Pacing Matters',
				text: 'Classic [[tcp|TCP]] sends packets in bursts — whatever cwnd allows, into the wire as fast as the NIC can clock them out. BBR sends every packet at exactly the estimated bottleneck rate. The bursts disappear. AQM drops disappear with them. Buffers stay nearly empty, {{latency|latency}} stays near base RTT, and throughput stays at the bottleneck. The single change from "fire bursts and react to loss" to "pace at the actual bottleneck rate" is what made BBR possible.'
			},
			{
				type: 'narrative',
				title: 'L4S: Sub-Millisecond Queuing',
				text: `Even BBR can't fix {{bufferbloat|bufferbloat}} caused by other senders' classic [[tcp|TCP]] filling the same buffer. The buffer is in the network, not in BBR. The network needs to start helping.

L4S — Low {{latency|Latency}}, Low Loss, Scalable throughput — is the IETF's answer ([[rfc:9330|RFC 9330]] / 9331 / 9332, January 2023). The mechanism: cooperating senders mark every packet ECN-Capable and react to {{ecn|ECN}} marks like minor losses without backing off as hard. Routers running the DualQ Coupled {{aqm|AQM}} mark instead of dropping when congestion is incipient. Classic [[tcp|TCP]] shares the same path and converges to fair throughput, but L4S traffic gets sub-millisecond queuing latency at the same time.

[[frontier:l4s-comcast-launch|Comcast launched L4S in production]] in late January 2025 in six US cities, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. Apple shipped L4S in iOS 17 / macOS Sonoma and turned it on by default for [[quic|QUIC]] in newer releases. The same architecture works for cloud gaming, video calls, and AI assistant audio at the same time as a 4K download — without {{bufferbloat|bufferbloat}}, without classic-[[tcp|TCP]] getting starved.`
			},
			{
				type: 'diagram',
				title: 'A Forty-Year Lineage',
				definition: `graph TD
  C1981["<b>1981</b><br/>RFC 793<br/>[[tcp|TCP]] basics"] --> C1986["<b>Oct 1986</b><br/>Congestion collapse<br/>32 kbps → 40 bps"]
  C1986 --> C1988["<b>1988</b><br/>Jacobson + Karels<br/>{{slow-start|Slow start}}, {{aimd|AIMD}},<br/>fast retransmit"]
  C1988 --> C1996["<b>1996</b><br/>{{sack|SACK}}<br/>RFC 2018"]
  C1996 --> C2006["<b>2006</b><br/>{{cubic|CUBIC}}<br/>Linux default"]
  C2006 --> C2016["<b>2016</b><br/>BBR v1<br/>Model {{bandwidth|bandwidth}}, not loss"]
  C2016 --> C2021["<b>2021</b><br/>RACK-TLP<br/>RFC 8985"]
  C2021 --> C2023a["<b>2023</b><br/>BBRv3 default<br/>for google.com / YouTube"]
  C2021 --> C2023b["<b>Jan 2023</b><br/>L4S<br/>RFC 9330/9331/9332"]
  C2023b --> C2025["<b>Jan 2025</b><br/>Comcast L4S<br/>in production"]`,
				caption: 'Every [[tcp|TCP]] congestion controller is a chapter in the story Jacobson started. Modern transports — {{cubic|CUBIC}}, BBR, L4S, RACK-TLP — are each refinements of the same conservation-of-packets principle, adapted to different network realities.'
			},
			{
				type: 'narrative',
				title: '[[quic|QUIC]]: Reliability Per Stream',
				text: `[[quic|QUIC]] is the most ambitious attempt yet to have both reliability and speed at the same time. Its key insight: the unit of reliability shouldn't be the whole connection.

A [[quic|QUIC]] connection carries multiple independent streams. Each stream has its own sequence numbers and its own {{retransmission|retransmission}} queue. When a packet is lost, only the stream(s) it carried get held back — the rest keep flowing. This is the {{head-of-line-blocking|head-of-line blocking}} problem [[tcp|TCP]] could never fully solve, fixed by moving the framing layer down into transport.

[[quic|QUIC]] also fuses transport and security ([[rfc:9000|RFC 9000]] for the transport, [[rfc:9001|RFC 9001]] for the [[tls|TLS]] integration). What used to be 1 RTT for [[tcp|TCP]] {{handshake|handshake}} + 1-2 RTT for [[tls|TLS]] is now a single {{one-rtt|1-RTT}} handshake; with {{session-resumption|session resumption}} a returning client can send application data in the very first packet ({{zero-rtt|0-RTT}}). Connections survive an [[ip|IP]]-address change ({{connection-migration|connection migration}}) — your phone can switch from [[wifi|Wi-Fi]] to cellular mid-page-load and the [[quic|QUIC]] connection keeps going, just on a new path.`
			},
			{
				type: 'callout',
				title: 'Where the Tradeoff Goes Next',
				text: 'The next round will be in the datacenter. Inside a single GPU cluster training a frontier model, the assumptions baked into [[tcp|TCP]] and even [[quic|QUIC]] start to creak. The Ultra [[ethernet|Ethernet]] Consortium spec (June 2025) builds a new transport layer on plain [[ethernet|Ethernet]]+[[ip|IP]] for AI/HPC scale-out: {{connectionless|connectionless}}, multipath with intelligent packet spray, packet-trimming, selective {{retransmission|retransmission}}. The principle Jacobson articulated in 1988 — match what you put in to what the network can carry — is unchanged. The implementation gets re-derived for every new generation of hardware.'
			}
		]
	},
	{
		id: 'client-server-p2p',
		title: 'Client-Server vs Peer-to-Peer',
		sections: [
			{
				type: 'narrative',
				title: 'The Pattern Most of the Internet Runs On',
				text: `The {{client-server|client-server model}} is the dominant communication pattern on the internet, and has been since the web shipped. A **client** (your browser, your phone app, your terminal) initiates a request to a **server** (a process on a known host at a known address) which processes it and sends a response. The server has a stable identity (a hostname, an [[ip|IP]], a port); the client's identity is ephemeral (a transient [[tcp|TCP]] connection from a random {{ephemeral-port|ephemeral port}}).

[[http1|HTTP]], [[dns|DNS]], [[smtp|SMTP]], [[ssh|SSH]], every database protocol, every [[rest|REST]] API, [[grpc|gRPC]], [[graphql|GraphQL]] — all client-server. The model wins for two structural reasons.

First, **discovery is trivial**. The client has the server's hostname; the server has a static [[ip|IP]]; that is the entire discovery story. No coordination required.

Second, **trust is concentrated**. The server can be hardened, audited, monitored, scaled, and upgraded as one unit. Clients can be lighter, dumber, more numerous. This is why your browser is a few hundred MB and Google's web infrastructure is many warehouses of servers — the asymmetry of trust and capability is built into the model.`
			},
			{
				type: 'diagram',
				title: 'Client-Server vs Peer-to-Peer',
				definition: `graph TD
  subgraph CS["Client-Server"]
    C1["Client A"] & C2["Client B"] & C3["Client C"] -->|request| SRV["Server"]
  end
  subgraph P2P["{{peer-to-peer|Peer-to-Peer}}"]
    P1["Peer A"] <--> P2["Peer B"]
    P2 <--> P3["Peer C"]
    P3 <--> P1
  end
  CS ~~~ P2P`,
				caption: 'Client-server centralises control through one authority. P2P connects nodes directly — more resilient but harder to coordinate.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Client-Server_Model-en.svg/500px-Client-Server_Model-en.svg.png',
				alt: 'Client-server topology: many client computers connected through a network to one central server.',
				caption:
					'Client-server topology. The asymmetry is the point — one well-known address that everyone connects to. Easy to discover, easy to harden, easy to scale by replicating the server.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 4.0'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/P2P-network.svg/500px-P2P-network.svg.png',
				alt: 'Peer-to-peer mesh: every node connected to every other node, no central server.',
				caption:
					'{{peer-to-peer|Peer-to-peer}} topology. Every node is both client and server. No single point of failure — and no single point of authority. The discovery problem (how peers find each other) is what makes building real P2P systems hard.',
				credit: 'Diagram: Wikimedia Commons / public domain'
			},
			{
				type: 'narrative',
				title: 'When Peer-to-Peer Is The Right Answer',
				text: `The {{peer-to-peer|peer-to-peer model}} is fundamentally different. Every participant is **simultaneously client and server**. Nodes connect directly to each other; there is no central authority that knows the full membership of the network. BitTorrent, [[webrtc|WebRTC]], blockchain consensus, IPFS, the original Napster's data plane (though not its discovery), and Gnutella all use P2P.

P2P wins when one of three conditions holds. **No central server can scale to the load** — BitTorrent for large files turns every downloader into an uploader, so popularity becomes capacity. **End-to-end privacy is required** — a [[webrtc|WebRTC]] call between two phones in the same room ideally never touches a relay; the audio is between the two endpoints only. **No party can be trusted to mediate** — blockchain protocols specifically refuse the existence of a central authority and replace it with consensus.

P2P is harder to build than client-server in three specific ways. **Discovery**: how do peers find each other when there is no directory? Tracker servers, DHTs (distributed hash tables), gossip protocols. **NAT traversal**: how do two peers behind home routers initiate a connection when neither has a public address? STUN, TURN, ICE, hole-punching. **Trust**: how do you verify peers are who they claim to be without a central CA? Public-key crypto, web-of-trust, blockchain identity, content-addressing.`
			},
			{
				type: 'callout',
				title: 'Most "P2P" systems are actually hybrid',
				text: 'Zoom uses a central server for group calls but P2P for one-on-one. Discord uses a server-based SFU (Selective Forwarding Unit) for all voice/video — they route through servers to handle groups efficiently and to hide users\' IPs from each other. BitTorrent uses centralised trackers (or a DHT, which is a decentralised tracker) to bootstrap peer discovery. The pure P2P systems are the exception; **most "decentralised" architectures retain a small centralised piece for discovery or trust**, with the {{bandwidth|bandwidth}}-heavy data plane being {{peer-to-peer|peer-to-peer}}.'
			},
			{
				type: 'narrative',
				title: 'Hybrid Patterns',
				text: `Real systems pick the part of each model that fits their constraints.

**Pub/sub messaging** ([[mqtt|MQTT]], [[amqp|AMQP]], [[kafka|Kafka]]) is client-server in form (everyone connects to a broker) but its purpose is to **decouple** publishers from subscribers — neither party knows the others' identities. The broker is just a routing intermediary. The benefits look more like P2P (any number of producers, any number of consumers, no point-to-point connections).

**CDNs** are client-server in shape but **distributed** across hundreds of edge points-of-presence. Your request to nytimes.com hits an Akamai cache 5 ms away, not the origin in New York 50 ms away. The architecture is a hierarchy of caches.

**Federated systems** (Mastodon, ActivityPub, [[smtp|SMTP]] email) are client-server within each instance but **{{peer-to-peer|peer-to-peer}} at the server level** — your Mastodon server federates with thousands of others to expose a global social graph without a central operator.

**Edge compute** (Cloudflare Workers, AWS Lambda@Edge) pushes server logic out to the same edge points the CDN uses. The "server" is not in one place; it is a function that runs wherever the user happens to be.

The choice — pure client-server, pure P2P, or one of these hybrids — depends on the scale you need, the trust you can assume, and the privacy you are willing to sacrifice. Twenty years ago, "is this app client-server or P2P" was a coherent question. Today the answer is almost always "yes, both, in different ratios at different layers."`
			}
		]
	},
	{
		id: 'encryption-basics',
		title: 'Encryption Basics',
		sections: [
			{
				type: 'narrative',
				title: 'What HTTPS Actually Protects',
				text: `Without {{encryption|encryption}}, every byte you send across the internet is readable by anyone on the path: your ISP, the coffee shop's [[wifi|Wi-Fi]] router, every backbone carrier in between. The padlock icon in your browser bar means a single thing: the bytes between your browser and the server are unreadable to anyone else.

What it does **not** mean is anything about the server you connected to. The padlock confirms that traffic is encrypted to **some** server that proved it owned the {{certificate|certificate}} for the hostname. It says nothing about whether that server is honest, whether your data is secure once it arrives, or whether the operator might be a phishing site that obtained a valid certificate. **Encryption is a property of the channel, not of either endpoint.**

[[tls|TLS]] (the protocol behind HTTPS) provides three things, all of them precisely defined: **confidentiality** — nobody on the path can read your bytes; **integrity** — nobody can modify your bytes without you noticing; **authenticity** — you can verify the server is who its certificate claims it is. It does not provide non-repudiation, end-to-end encryption beyond the channel, or any guarantee about how the server stores or processes your data after decryption. Knowing exactly what [[tls|TLS]] gives you is the first step in not over-trusting it.`
			},
			{
				type: 'narrative',
				title: 'Symmetric vs Asymmetric — The Core Distinction',
				text: `Two families of {{encryption|encryption}} exist, with opposite trade-offs.

**{{symmetric-encryption|Symmetric encryption}}** uses **one key** for both encrypting and decrypting. AES-256 and ChaCha20-Poly1305 are the modern standards. Both are extraordinarily fast — a current x86 CPU with AES-NI hardware acceleration encrypts at over 10 Gbps per core. The catch is **key distribution**: both endpoints have to know the same secret key without an attacker learning it. If two parties have never met, they cannot just send the key over the network — anyone watching would steal it.

**{{asymmetric-encryption|Asymmetric encryption}}** uses **two keys** that are mathematically paired: a {{public-key|public key}} you give out freely, and a {{private-key|private key}} you keep on your server. Anything encrypted with the {{public-key|public key}} can only be decrypted with the {{private-key|private key}}, and vice versa. RSA-2048, X25519 (elliptic curve), and (post-quantum) {{ml-kem|ML-KEM}}-768 are the modern examples. The strength of asymmetric crypto is that **two strangers can establish trust** — I send you my public key over an open channel; you encrypt your secret with it; only I can read what you sent. The cost: {{asymmetric-encryption|asymmetric encryption}} is roughly **1000× slower** than symmetric for the same security level.

The combination is what makes the modern web tractable. You use slow asymmetric crypto **once** at the start of the connection to safely agree on a fast symmetric key, then use the symmetric key for all the bulk data. The slow operation is amortised across the whole conversation.`
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Asymmetric_Cryptography.svg/500px-Asymmetric_Cryptography.svg.png',
				alt: 'Public-key cryptography: sender encrypts with the recipient\'s public key; recipient decrypts with their matching private key.',
				caption:
					'{{public-key|Public-key}} cryptography. Anyone can {{encryption|encrypt}} a message using the recipient\'s {{public-key|public key}} (which is shared openly). Only the recipient — the holder of the matching {{private-key|private key}} — can decrypt it. This solves the key-distribution problem that defeated symmetric ciphers for centuries.',
				credit: 'Diagram: Wikimedia Commons / public domain'
			},
			{
				type: 'diagram',
				title: '[[tls|TLS]] Hybrid Encryption',
				definition: `graph LR
  subgraph {{handshake|Handshake}}["Key {{exchange|Exchange}} — Asymmetric"]
    C["Client"] -->|"{{public-key|public key}}"| S["Server"]
    S -->|"{{certificate|certificate}} + key"| C
  end
  subgraph Data["Data Transfer — Symmetric"]
    C2["Client"] <-->|"AES / ChaCha20 encrypted"| S2["Server"]
  end
  Handshake -->|"shared secret"| Data`,
				caption: '[[tls|TLS]] uses slow {{asymmetric-encryption|asymmetric crypto}} to safely {{exchange|exchange}} a session key, then switches to fast {{symmetric-encryption|symmetric encryption}} for all data. The {{handshake|handshake}} is a few hundred bytes; the data can be gigabytes.'
			},
			{
				type: 'image',
				src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Digital_certificates_chain_of_trust.png/500px-Digital_certificates_chain_of_trust.png',
				alt: 'X.509 chain of trust: root CA signs intermediate CA, which signs the leaf certificate.',
				caption:
					'The X.509 {{certificate-chain|certificate chain of trust}}. Your browser ships with the public keys of around 100 root {{certificate-authority|CAs}}. The site you connect to presents a leaf {{certificate|certificate}} signed by an intermediate CA, which is itself signed by a trusted root. Each link is a digital signature your browser verifies.',
				credit: 'Diagram: Wikimedia Commons / CC BY-SA 4.0'
			},
			{
				type: 'narrative',
				title: 'Certificates and the Trust Chain',
				text: `{{asymmetric-encryption|Asymmetric encryption}} alone is not enough. If a server hands you "here is my {{public-key|public key}}, encrypt to me," nothing prevents an attacker from intercepting the connection and handing you their own public key — a classic **{{man-in-the-middle|man-in-the-middle attack}}**. You would encrypt to the attacker, who would decrypt, re-encrypt to the real server, and read everything in {{transit|transit}}.

The fix is **{{certificate|certificates}}**. A {{certificate|certificate}} is a public key plus identity information (the hostname \`example.com\`, an expiration date, etc.) signed by a **{{certificate-authority|Certificate Authority}}** (CA) using the CA's {{private-key|private key}}. Your browser ships with the public keys of around 100 trusted root CAs. When example.com hands you a certificate, your browser verifies the signature using the CA's public key — if the signature is valid, you know the certificate genuinely binds the public key to the hostname.

The {{certificate-chain|certificate chain}} is usually two or three deep: \`example.com → DigiCert [[tls|TLS]] Hybrid ECC SHA384 → DigiCert Global Root G3\`. Only the bottom (root) CA's certificate is shipped pre-installed; the intermediate is in the chain the server sends; the leaf is the actual hostname certificate. Each link signs the next. The {{pki|PKI}} (Public Key Infrastructure) is the entire global apparatus that makes this work — root CAs, audit requirements, browser inclusion programs, {{certificate-transparency|certificate transparency}} logs.

When the system breaks (and it has, repeatedly: DigiNotar 2011, Symantec 2017, multiple smaller incidents), the consequences are network-wide. A compromised CA can issue a valid-looking certificate for any domain. This is why **Certificate Transparency** logs (RFC 6962) now require every issued certificate to be publicly logged — making rogue issuance discoverable, even if not preventable.`
			},
			{
				type: 'callout',
				title: 'Why [[tls|TLS]] 1.3 banned everything weak',
				text: '[[tls|TLS 1.3]] ([[rfc:8446|RFC 8446]], 2018) was the first version to break wire compatibility with its predecessors. It removed RC4, 3DES, MD5, SHA-1, RSA key {{exchange|exchange}}, and every CBC-mode cipher — keeping only ChaCha20-Poly1305 and AES-GCM, with X25519 / ECDH for key exchange. The cleanup was overdue: every weak cipher [[tls|TLS]] still allowed had been weaponised in a published attack (BEAST, CRIME, BREACH, Lucky 13, FREAK, Logjam, ROBOT, …). [[tls|TLS]] 1.3 also reduced the {{handshake|handshake}} to **1 round-trip for new connections, 0 for resumptions** — substantially faster than 1.2.'
			},
			{
				type: 'narrative',
				title: 'The Post-Quantum Frontier',
				text: `The cryptography securing every [[tls|TLS]] connection today (X25519 ECDH for key {{exchange|exchange}}, EdDSA / RSA for signatures) is **vulnerable to quantum computers** that can run Shor's algorithm at scale. No such machine exists yet — current devices are at a few thousand noisy qubits; you need millions of error-corrected qubits to break X25519. But the threat is not future tense.

An adversary recording your encrypted traffic **today** can store it indefinitely and decrypt it whenever a working quantum computer arrives — a strategy known as **harvest now, decrypt later**. For data that needs to stay secret for decades (state secrets, medical records, long-lived contracts), the threat is real now.

The fix is rolling out fast. NIST finalised post-quantum standards in August 2024 ({{ml-kem|ML-KEM}}, ML-DSA, SLH-DSA). The deployed solution is **hybrid** — combine the existing X25519 with the new ML-KEM-768 such that an attacker has to break **both** to recover the key. The named cipher [[frontier:pq-tls-x25519mlkem768|X25519MLKEM768]] is now the default in Chrome 124+, Cloudflare's [[tls|TLS]] termination, and iOS 26. By the end of 2026, most [[tls|TLS]] handshakes on the internet will be post-quantum-secure. The deployment lesson: the cryptography community shipped useful primitives years before the hardware threat materialised, and the deployment ecosystem rolled them out in months.`
			}
		]
	},
	{
		id: 'ai-protocols',
		title: 'Protocols for AI Agents',
		sections: [
			{
				type: 'narrative',
				title: 'The First New Application Layer in Fifteen Years',
				text: `For fifteen years after [[websockets|WebSockets]] in 2011, the application layer of the internet was settled. [[http1|HTTP]] in three versions, [[grpc|gRPC]] for service-to-service, [[graphql|GraphQL]] for flexible queries, [[sse|SSE]] for streaming — these and a few older protocols ([[smtp|SMTP]], [[imap|IMAP]], [[xmpp|XMPP]], [[mqtt|MQTT]]) covered every meaningful application. Nothing genuinely new appeared in this window.

In November 2024, Anthropic published the **Model Context Protocol** — [[mcp|MCP]]. The premise was simple: AI coding assistants and chat agents needed a standard way to talk to tools (file systems, databases, APIs, internal systems) without each pair re-inventing the integration. With N AI hosts and M tools, the industry was building N×M bespoke connectors. [[mcp|MCP]] collapsed it to N+M.

In April 2025, Google published **Agent-to-Agent Protocol** — [[a2a|A2A]] — for collaboration **between** agents: capability discovery, task delegation, asynchronous event streams. Six months later both protocols moved into the [[frontier:a2a-linux-foundation|Linux Foundation]] alongside open governance. As of 2026, [[mcp|MCP]] servers number in the thousands, [[a2a|A2A]] is supported by every major agent framework, and both protocols are recognisably the new layer that earlier decades never had.`
			},
			{
				type: 'diagram',
				title: 'The AI Protocol Stack',
				definition: `graph TD
  U["User / AI Application"]
  U -->|"[[mcp|MCP]]"| T["Tools & Data Sources"]
  U -->|"[[a2a|A2A]]"| A["Other AI Agents"]
  A -->|"MCP"| T2["Agent's Own Tools"]
  subgraph Wire["Wire Format"]
    JR["[[json-rpc|JSON-RPC]] 2.0"]
  end
  subgraph Transport["Transport Layer"]
    HTTP["HTTP + [[sse|SSE]]"]
    STDIO["stdio (local)"]
  end
  Wire -.-> Transport`,
				caption: 'AI protocols sit at the application layer, using [[json-rpc|JSON-RPC]] 2.0 as their wire format and HTTP (or stdio) as their transport. [[mcp|MCP]] connects agents to tools; [[a2a|A2A]] connects agents to each other.'
			},
			{
				type: 'narrative',
				title: 'Why [[json-rpc|JSON-RPC]] 2.0',
				text: `Both [[mcp|MCP]] and [[a2a|A2A]] picked **[[json-rpc|JSON-RPC 2.0]]** as their wire format. The choice is deliberate, and worth pausing over.

[[json-rpc|JSON-RPC]] 2.0 is, by application-protocol standards, **boring**. It is a 6-page specification (compared to [[grpc|gRPC]]'s 50+ pages, [[graphql|GraphQL]]'s 200+, [[mqtt|MQTT]] 5's 130+). A request is a {{json|JSON}} object with a method name, parameters, and an id. A response is a JSON object with the same id and either a result or an error. That is the entire protocol.

The boringness is the point. The Language Server Protocol uses [[json-rpc|JSON-RPC]]. Ethereum's node [[json-rpc|JSON-RPC]] uses it. The Chrome DevTools Protocol uses it. Every editor tooling system from VS Code to JetBrains to Neovim speaks it. It is the **lowest-overhead, highest-interoperability RPC format** that supports both request/response and notifications, encodes neatly for human reading, and works without a code generator.

For a brand-new protocol layer where adoption is the existential risk, picking the format that already works in every language and every developer's mental model is the right move. [[mcp|MCP]] and [[a2a|A2A]] could have invented a binary protocol with schemas; instead they let the message shape be a transport-level concern and put their innovation in **what** the messages mean.`
			},
			{
				type: 'callout',
				title: 'Same engineering principles, new domain',
				text: 'AI protocols follow patterns that look very familiar. **Capability discovery** like [[dns|DNS]]: a server lists what it can do; the client queries the list. **Request/response messaging** like [[http1|HTTP]]: each call has a method, parameters, a result. **{{stateful|Stateful}} sessions** like [[tcp|TCP]]: a connection has an initialisation {{handshake|handshake}}; subsequent calls share that context. **Streaming** like [[sse|SSE]]: long-running operations stream progress events. The engineering vocabulary is the same; the **{{payload|payload}} domain** — describing tools, agents, capabilities, prompts, resources — is what is new.'
			},
			{
				type: 'narrative',
				title: 'What An [[mcp|MCP]] Server Actually Looks Like',
				text: `A minimal [[mcp|MCP]] server is a single executable, often under 100 lines of code, that speaks [[json-rpc|JSON-RPC]] over stdin/stdout (for local servers) or HTTP+[[sse|SSE]] (for remote ones, via the [[frontier:mcp-streamable-http|streamable HTTP]] transport finalised in 2025).

When the agent starts, it spawns the server and exchanges an \`initialize\` request — the server responds with its capabilities (which tools, prompts, and resources it offers). The agent calls \`tools/list\` to learn the names and schemas; later it calls \`tools/call\` with a tool name and arguments to actually invoke. The server runs the work, returns the result, and the agent decides what to do next.

This shape is intentionally small. A filesystem [[mcp|MCP]] server has tools like \`read_file\`, \`write_file\`, \`list_directory\`. A GitHub [[mcp|MCP]] server has \`list_issues\`, \`create_pr\`, \`merge_pr\`. A Postgres [[mcp|MCP]] server has \`query\`, \`execute\`, \`describe_table\`. None of them know anything about Anthropic, Cursor, or any specific agent — they just expose a contract. Any [[mcp|MCP]]-aware client can use any [[mcp|MCP]]-aware server.

The architecture's resemblance to the original [[http1|HTTP]] story is not accidental. Berners-Lee invented HTTP as a small, composable contract that any client could speak to any server. [[mcp|MCP]] is the same shape, applied to agents and tools instead of browsers and documents — and like HTTP, the most interesting question is what gets built on top of it.`
			},
			{
				type: 'pioneers',
				title: 'The Frontier',
				people: [
					{
						name: 'Anthropic team',
						years: '2024 –',
						title: '[[mcp|MCP]] architects',
						org: 'Anthropic',
						contribution:
							'Published the Model Context Protocol in November 2024 with a deliberate decision to make it open and vendor-neutral. Within a year, [[mcp|MCP]] had thousands of public servers and native support across every major agent framework.'
					},
					{
						name: 'Google [[a2a|A2A]] team',
						years: '2025 –',
						title: '[[a2a|A2A]] architects',
						org: 'Google',
						contribution:
							'Published Agent-to-Agent Protocol in April 2025 to handle the collaboration-between-agents case [[mcp|MCP]] did not address. Moved both protocols into the Linux Foundation in mid-2025 to prevent any single company from controlling the agent layer.'
					}
				]
			}
		]
	}
];

const sectionMap = new Map(foundationSections.map((s) => [s.id, s]));

export function getFoundationSection(id: string): FoundationSection | undefined {
	return sectionMap.get(id);
}
