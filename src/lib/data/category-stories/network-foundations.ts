import type { CategoryStory } from './types';

export const networkFoundationsStory: CategoryStory = {
	categoryId: 'network-foundations',
	tagline: 'From Xerox PARC to every connected device — how frames, addresses, and routes make the internet possible',
	sections: [
		{
			type: 'narrative',
			title: 'Before the Internet',
			text: `In 1973, a young engineer named Bob Metcalfe was working at Xerox PARC in Palo Alto when he had an insight that would change computing forever. He'd studied the ALOHAnet — a radio network connecting Hawaiian islands — and realized the same principle could wire computers together in an office. He sketched a system on the back of a napkin: a shared cable with simple rules for who gets to transmit. He called it Ethernet, after the "luminiferous aether" that 19th-century physicists believed permeated space.

That sketch became [[ethernet|Ethernet]], and it solved the first problem of networking: how do machines on the same wire talk to each other? Each device got a unique 48-bit MAC address, and frames carried data from source to destination. But Ethernet alone wasn't enough. You also needed a way to find who's who — that's [[arp|ARP]], which translates logical [[ip|IP]] addresses to physical MAC addresses. And you needed a way to route beyond your local wire — that's [[ip|IP]], the addressing system that makes the internet a network of networks.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Xerox_Alto_mit_Rechner.JPG/600px-Xerox_Alto_mit_Rechner.JPG',
			alt: 'The Xerox Alto computer at Xerox PARC — the machine that Ethernet was invented to network',
			caption:
				'The Xerox Alto (1973) — the workstation where Ethernet was born. Bob Metcalfe invented Ethernet at Xerox PARC to network these Alto machines, connecting them over a shared coaxial cable at 2.94 Mbps using CSMA/CD.',
			credit: 'Photo: Joho345 / Public Domain, via Wikimedia Commons'
		},
		{
			type: 'diagram',
			title: 'The Network Stack — Where These Protocols Live',
			definition: `graph TD
  subgraph L7["Layer 7 — Application"]
    A1[HTTP]
    A2[DNS]
    A3[SSH]
    A4[SMTP]
  end
  subgraph L4["Layer 4 — Transport"]
    B1["TCP — reliable streams"]
    B2["UDP — fast datagrams"]
  end
  subgraph L3["Layer 3 — Network"]
    C["IP — addressing & routing"]
    C2["ARP — IP → MAC resolution"]
  end
  subgraph L2["Layer 2 — Data Link"]
    D1["Ethernet — wired frames"]
    D2["Wi-Fi (802.11) — wireless frames"]
  end
  subgraph L1["Layer 1 — Physical"]
    E1["Copper / Fiber / Radio waves"]
  end
  A1 & A2 & A3 & A4 --> B1 & B2
  B1 & B2 --> C
  C --> C2
  C2 --> D1 & D2
  D1 & D2 --> E1`,
			caption:
				'Where Network Foundations protocols fit in the stack. Ethernet and Wi-Fi frame data at Layer 2, IP routes it at Layer 3, and ARP bridges between them — translating IP addresses to MAC addresses so frames reach the right device.'
		},
		{
			type: 'pioneers',
			title: 'The Architects of Layer 2 and Layer 3',
			people: [
				{
					name: 'Bob Metcalfe',
					years: '1946–',
					title: 'Inventor of Ethernet',
					org: 'Xerox PARC / 3Com',
					contribution:
						'Invented Ethernet at Xerox PARC in 1973, co-authored the DIX Ethernet standard (1980), and co-founded 3Com to commercialize it. Received the 2022 ACM Turing Award for his contributions to networking.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Bob_Metcalfe_2009.jpg/330px-Bob_Metcalfe_2009.jpg'
				},
				{
					name: 'Vint Cerf',
					years: '1943–',
					title: 'Co-inventor of TCP/IP',
					org: 'Stanford / DARPA / Google',
					contribution:
						'Co-designed the TCP/IP protocol suite (including IP) with Bob Kahn. Their 1974 paper defined how heterogeneous networks could exchange data — the fundamental insight that created the internet.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg'
				},
				{
					name: 'David Plummer',
					years: '1956–',
					title: 'Author of ARP',
					org: 'MIT',
					contribution:
						'Wrote RFC 826 (1982) defining the Address Resolution Protocol — the elegantly simple broadcast mechanism that bridges IP addresses to hardware addresses on local networks.'
				},
				{
					name: 'Vic Hayes',
					years: '1941–',
					title: 'Father of Wi-Fi',
					org: 'NCR / Agere Systems',
					contribution:
						'Chaired the IEEE 802.11 working group from 1990 to 2002, shepherding the wireless LAN standard from concept to global adoption. Known as the "Father of Wi-Fi" for his persistence in driving consensus.'
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
						'Bob Metcalfe sketches the first Ethernet network, connecting Alto workstations over a shared coaxial cable at 2.94 Mbps using CSMA/CD.',
					protocolId: 'ethernet'
				},
				{
					year: 1980,
					title: 'DIX Ethernet Standard Published',
					description:
						'Digital Equipment Corporation, Intel, and Xerox publish the DIX standard (Ethernet II), defining the frame format still used today.'
				},
				{
					year: 1981,
					title: 'IPv4 Specified — RFC 791',
					description:
						'Jon Postel publishes RFC 791, defining the Internet Protocol with 32-bit addresses, TTL, and fragmentation — the addressing system of the internet.',
					protocolId: 'ip'
				},
				{
					year: 1982,
					title: 'ARP Defined — RFC 826',
					description:
						'David Plummer publishes the Address Resolution Protocol, solving the IP-to-MAC resolution problem with a simple broadcast-and-reply mechanism.',
					protocolId: 'arp'
				},
				{
					year: 1983,
					title: 'IEEE 802.3 Ratified',
					description:
						'The IEEE ratifies 802.3, giving Ethernet its formal standard. ARPANET officially switches to TCP/IP on January 1, "Flag Day."',
					protocolId: 'ethernet'
				},
				{
					year: 1997,
					title: 'IEEE 802.11 — First Wi-Fi Standard',
					description:
						'The original 802.11 standard is published, supporting 2 Mbps wireless LAN. Slow and expensive, but it proves wireless networking is viable.',
					protocolId: 'wifi'
				},
				{
					year: 1999,
					title: 'Wi-Fi Alliance Formed',
					description:
						'The Wi-Fi Alliance is created to certify interoperability. 802.11b brings 11 Mbps, making wireless affordable for consumers.'
				},
				{
					year: 2009,
					title: 'Wi-Fi 4 (802.11n) — MIMO',
					description:
						'802.11n introduces multiple-input multiple-output (MIMO) antennas, reaching 600 Mbps and making Wi-Fi competitive with wired connections for most uses.',
					protocolId: 'wifi'
				},
				{
					year: 2020,
					title: 'Wi-Fi 6 (802.11ax) — Efficiency Era',
					description:
						'Wi-Fi 6 focuses on efficiency in dense environments: OFDMA, BSS Coloring, and Target Wake Time improve performance when hundreds of devices share the airwaves.',
					protocolId: 'wifi'
				}
			]
		},
		{
			type: 'diagram',
			title: 'The Journey of a Packet — Encapsulation in Action',
			definition: `graph LR
  subgraph Source["Source Host"]
    S1["Application: GET /index.html"]
    S2["TCP: src=49152 dst=80"]
    S3["IP: src=192.168.1.100 dst=93.184.216.34"]
    S4["Ethernet: src=AA:BB:CC dst=Router MAC"]
    S1 --> S2 --> S3 --> S4
  end
  subgraph Router["Router"]
    R1["Strip Ethernet header"]
    R2["Decrement TTL, route lookup"]
    R3["New Ethernet: src=Router MAC dst=Next-hop MAC"]
    R1 --> R2 --> R3
  end
  subgraph Dest["Destination"]
    D1["Ethernet → IP → TCP → Application"]
  end
  S4 -->|"Frame on wire"| R1
  R3 -->|"New frame, same IP packet"| D1`,
			caption:
				'Each layer wraps the payload from the layer above. At every hop, the Ethernet frame is stripped and rebuilt with new MAC addresses — but the IP addresses and TCP ports stay constant end-to-end. This is the fundamental principle of encapsulation.'
		},
		{
			type: 'narrative',
			title: 'From Shared Wire to Switched Networks',
			text: `The original Ethernet was a shared coaxial cable — a "bus" — where every device heard every transmission. Collisions were inevitable, and CSMA/CD (Carrier Sense Multiple Access with Collision Detection) was the traffic cop: listen before transmitting, and if two devices collide, both back off for a random time and try again.

The shift from hubs to switches in the 1990s was transformative. A hub was just a repeater — it sent every frame to every port. A switch, however, learns which MAC addresses live on which ports by watching source addresses. After learning, it forwards frames only to the correct port. Collisions disappeared. Full-duplex links doubled effective bandwidth. This simple innovation — the Ethernet switch — is what made modern LANs possible, from small offices to hyperscale data centers running at 400 Gbps.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/600px-Internet_map_1024.jpg',
			alt: 'A partial map of the Internet by the Opte Project, showing millions of IP routes as colored lines',
			caption:
				'A partial map of the Internet by the Opte Project (2005). Each line connects two IP addresses — the web of routes that IP makes possible. Colors represent regional allocations: blue for North America, green for Asia-Pacific, red for Europe.',
			credit: 'Image: Barrett Lyon / The Opte Project / CC BY 2.5, via Wikimedia Commons'
		},
		{
			type: 'narrative',
			title: 'Cutting the Cord',
			text: `[[wifi|Wi-Fi]] brought Ethernet's model to the airwaves, but radio introduced challenges that cables never had. The wireless medium is shared — you can't run a dedicated cable to each device — so Wi-Fi uses CSMA/CA (Collision Avoidance) instead of CSMA/CD: devices announce their intent to transmit and wait for clear airtime rather than detecting collisions after the fact.

An 802.11 frame carries three or four MAC addresses (receiver, transmitter, destination, and sometimes source) compared to Ethernet's two. The access point bridges between worlds: it receives encrypted [[wifi|Wi-Fi]] frames from wireless clients, decrypts and strips the 802.11 header, then wraps the payload in a standard [[ethernet|Ethernet]] frame for the wired network. This seamless bridging is why your laptop doesn't care whether it's plugged in or on Wi-Fi — [[ip|IP]] works the same either way.`
		},
		{
			type: 'diagram',
			title: 'Wired vs Wireless — Ethernet and Wi-Fi Frame Comparison',
			definition: `graph TD
  subgraph EthFrame["Ethernet Frame (Layer 2 — Wired)"]
    E1["Dst MAC — 6 bytes"]
    E2["Src MAC — 6 bytes"]
    E3["EtherType — 2 bytes"]
    E4["Payload — 46-1500 bytes"]
    E5["FCS — 4 bytes"]
    E1 --- E2 --- E3 --- E4 --- E5
  end
  subgraph WiFiFrame["802.11 Frame (Layer 2 — Wireless)"]
    W1["Frame Control — 2 bytes"]
    W2["Duration — 2 bytes"]
    W3["Addr 1: Receiver — 6 bytes"]
    W4["Addr 2: Transmitter — 6 bytes"]
    W5["Addr 3: Destination — 6 bytes"]
    W6["Seq Control — 2 bytes"]
    W7["Encrypted Payload"]
    W8["FCS — 4 bytes"]
    W1 --- W2 --- W3 --- W4 --- W5 --- W6 --- W7 --- W8
  end
  EthFrame ~~~ WiFiFrame`,
			caption:
				'Ethernet frames use two MAC addresses (source, destination) and are sent in the clear. Wi-Fi frames need three or four addresses (receiver, transmitter, destination, and optionally source) and encrypt the payload — reflecting the complexity of shared airwaves vs dedicated cables.'
		},
		{
			type: 'callout',
			title: 'Layer 2 vs Layer 3',
			text: 'Ethernet and Wi-Fi operate at Layer 2 (Data Link) — they handle framing and local delivery using MAC addresses. IP operates at Layer 3 (Network) — it handles addressing and routing across networks. ARP bridges the two: it translates Layer 3 addresses (IP) into Layer 2 addresses (MAC). This separation of concerns is what makes the internet scalable — IP routes between networks, while Ethernet/Wi-Fi handles the "last mile" delivery on each segment.'
		}
	]
};
