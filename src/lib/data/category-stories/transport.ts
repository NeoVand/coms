import type { CategoryStory } from './types';

export const transportStory: CategoryStory = {
	categoryId: 'transport',
	tagline: 'From ARPANET to the modern web \u2014 the plumbing that makes it all work',
	sections: [
		{
			type: 'narrative',
			title: 'The Need for Reliable Transport',
			text: `The year was 1973, and the ARPANET had a problem. The network worked \u2014 mostly \u2014 but its underlying protocol, the Network Control Program (NCP), was welded to the ARPANET hardware. Every node had to be an ARPANET node. There was no way to bridge to a satellite network, a packet radio network, or any future network that hadn't been invented yet.\n\nVint Cerf and Bob Kahn saw what others didn't: the real challenge wasn't building one network, it was connecting all of them. They needed a protocol that made no assumptions about the underlying network \u2014 one that could ride on top of anything. That insight became [[tcp]], and later, when guaranteed delivery proved too heavy for every use case, its lighter sibling [[udp]]. Together, they formed the transport layer that would carry every email, every web page, and every video call the world would ever make.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/ARPANET_first_router.jpg/600px-ARPANET_first_router.jpg',
			alt: 'The BBN Interface Message Processor (IMP) at UCLA, one of the first ARPANET nodes',
			caption:
				'The IMP at UCLA, 1969 — this refrigerator-sized Honeywell minicomputer processed the first ARPANET message. It arrived a month before the first successful "LO" transmission to Stanford.',
			credit: 'Photo: Steve Jurvetson / CC BY 2.0, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: 'The Founding Architects',
			people: [
				{
					name: 'Vint Cerf',
					years: '1943\u2013',
					title: 'Co-inventor of TCP/IP',
					org: 'Stanford / DARPA',
					contribution:
						'Designed the TCP/IP protocol suite alongside Bob Kahn, co-authoring the foundational 1974 paper "A Protocol for Packet Network Intercommunication" that defined how heterogeneous networks could exchange data reliably.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg'
				},
				{
					name: 'Bob Kahn',
					years: '1938\u2013',
					title: 'Co-inventor of TCP/IP',
					org: 'DARPA',
					contribution:
						'Conceived the idea of open-architecture networking while managing the ARPANET project at DARPA, then recruited Vint Cerf to collaborate on the protocol design that would become the backbone of the internet.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Bob_Kahn.jpg/330px-Bob_Kahn.jpg'
				},
				{
					name: 'Jon Postel',
					years: '1943\u20131998',
					title: 'RFC Editor & Protocol Architect',
					org: 'USC Information Sciences Institute',
					contribution:
						'Wrote the definitive RFC specifications for both TCP (RFC 793) and UDP (RFC 768), and served as the RFC Editor for nearly three decades, shaping the standards process that governs the internet.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg'
				},
				{
					name: 'Danny Cohen',
					years: '1937\u20132019',
					title: 'Network Pioneer',
					org: 'USC Information Sciences Institute',
					contribution:
						'Advocated for splitting the monolithic TCP into separate transport and network layers, enabling diverse transport protocols to coexist. Also coined the terms "big-endian" and "little-endian" for byte ordering.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/2009.DannyCohen.jpg/120px-2009.DannyCohen.jpg'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1974,
					title: 'Cerf & Kahn Publish Foundational Paper',
					description:
						'The paper that started it all, describing a protocol for packet network intercommunication.'
				},
				{
					year: 1978,
					title: 'TCP/IP Split',
					description:
						'The monolithic TCP is split into TCP (reliable transport) and IP (network routing), creating the layered architecture we use today.'
				},
				{
					year: 1980,
					title: 'UDP Published \u2014 RFC 768',
					description:
						'Jon Postel defines the minimal, connectionless transport protocol in just 3 pages. Sometimes less is more.',
					protocolId: 'udp'
				},
				{
					year: 1981,
					title: 'TCP Published \u2014 RFC 793',
					description:
						'The reliable transport protocol specification. Every byte acknowledged, every packet ordered. Later consolidated and updated as RFC 9293 (2022).',
					protocolId: 'tcp'
				},
				{
					year: 1983,
					title: 'Flag Day \u2014 ARPANET Switches to TCP/IP',
					description:
						'On January 1st, the entire ARPANET cuts over from NCP to TCP/IP. The internet as we know it begins.'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Great Split',
			text: `The original TCP was a monolith. It handled routing, reliability, and ordering all in one protocol. But Danny Cohen made a compelling case: real-time voice traffic couldn't tolerate TCP's insistence on retransmitting every lost packet. A dropped voice sample is gone \u2014 by the time a retransmission arrives, the conversation has moved on.\n\nThis argument led to one of the most consequential design decisions in computing history. TCP was split into two layers: IP for routing packets across networks, and TCP for providing reliable, ordered byte streams on top of IP. Alongside TCP came [[udp]] \u2014 a minimal transport that offered little more than port numbers and a checksum. No connections, no retransmissions, no ordering guarantees.\n\nThe separation was a stroke of genius. It meant that new transport protocols could be built on top of IP without changing a single router. [[tcp]] became the workhorse of the internet, carrying [[http1]], [[ssh]], [[ftp]], and [[smtp]]. [[udp]] became the foundation for real-time applications where speed matters more than perfection. And the door was left open for protocols yet to come.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/600px-Arpanet_logical_map%2C_march_1977.png',
			alt: 'Logical map of the ARPANET, showing the network topology in March 1977',
			caption:
				'The ARPANET logical map, March 1977 — the network that would become the internet. Within six years, this entire network would cut over from NCP to TCP/IP on Flag Day.',
			credit: 'ARPANET / Public Domain, via Wikimedia Commons'
		},
		{
			type: 'callout',
			title: "Postel's Law",
			text: "Jon Postel's robustness principle, articulated in RFC 793: 'Be conservative in what you send, be liberal in what you accept.' This philosophy shaped how the entire internet handles interoperability and became a guiding principle for protocol design."
		},
		{
			type: 'diagram',
			title: 'The Layered Architecture',
			definition: `graph TD
  subgraph Application Layer
    A1[HTTP]
    A2[SSH]
    A3[DNS]
    A4[RTP]
  end
  subgraph Transport Layer
    B1["TCP \u2014 reliable, ordered"]
    B2["UDP \u2014 fast, minimal"]
  end
  subgraph Network Layer
    C[IP \u2014 routes packets across networks]
  end
  subgraph Link Layer
    D[Ethernet / Wi-Fi / Fiber]
  end
  A1 & A2 --> B1
  A3 & A4 --> B2
  B1 & B2 --> C
  C --> D`,
			caption:
				'The layered architecture born from splitting TCP \u2014 applications choose reliable (TCP) or fast (UDP) transport, both riding on IP.'
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2000,
					title: 'SCTP Published \u2014 RFC 2960',
					description:
						'Stream Control Transmission Protocol brings multi-streaming and multi-homing to transport, originally designed for telephony signaling.',
					protocolId: 'sctp'
				},
				{
					year: 2013,
					title: 'MPTCP Published — RFC 6824',
					description:
						'Multipath TCP allows a single connection to use multiple network paths simultaneously. Apple deploys it in iOS 7 for Siri, its first major real-world adoption.',
					protocolId: 'mptcp'
				},
				{
					year: 2012,
					title: 'QUIC Development Begins at Google',
					description:
						"Jim Roskind starts designing a new transport protocol to solve TCP's head-of-line blocking and slow handshakes.",
					protocolId: 'quic'
				},
				{
					year: 2013,
					title: 'QUIC Deployed in Chrome',
					description:
						'Google begins experimenting with QUIC in Chrome, carrying Google search and YouTube traffic. A real-world proving ground.',
					protocolId: 'quic'
				},
				{
					year: 2021,
					title: 'QUIC v1 Published \u2014 RFC 9000',
					description:
						'After years of IETF standardization, QUIC becomes an official internet standard, building encryption into the transport layer itself.',
					protocolId: 'quic'
				}
			]
		},
		{
			type: 'pioneers',
			title: 'The Modern Innovators',
			people: [
				{
					name: 'Jim Roskind',
					years: '1960s\u2013',
					title: 'QUIC Architect',
					org: 'Google',
					contribution:
						"Designed QUIC to solve TCP's fundamental limitations for the modern web, introducing 0-RTT connection establishment and multiplexed streams without head-of-line blocking.",
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Jim_Roskind_2016.jpg/330px-Jim_Roskind_2016.jpg'
				},
				{
					name: 'Jana Iyengar',
					years: '',
					title: 'QUIC Standardization Lead',
					org: 'Google / Fastly',
					contribution:
						'Led the IETF standardization effort that transformed QUIC from a Google experiment into RFC 9000, navigating the complex process of building industry consensus around a new transport protocol.'
				},
				{
					name: 'Randall Stewart',
					years: '',
					title: 'SCTP Architect',
					org: 'Cisco',
					contribution:
						'Designed SCTP to provide reliable multi-stream transport, enabling telephony signaling networks to transition from legacy SS7 to IP-based infrastructure.'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Ossification Problem',
			text: `Why didn't we just improve [[tcp]]? The answer is ossification \u2014 one of the most frustrating phenomena in networked systems.\n\nOver decades, an entire ecosystem of middleboxes grew up around TCP: firewalls that inspect TCP headers, NATs that rewrite port numbers, load balancers that track connection state, and intrusion detection systems that parse TCP options. These devices learned the exact byte layout of TCP segments and made assumptions about what they'd see. Any change to TCP's wire format \u2014 even one permitted by the specification \u2014 risked being silently dropped or mangled by some middlebox along the path.\n\n[[mptcp]] tried a different approach: extending TCP itself to use multiple network paths simultaneously, improving resilience and bandwidth. Apple adopted it for Siri in 2013, but MPTCP's reliance on TCP options meant middleboxes could still interfere.\n\n[[quic]] solved the ossification problem radically. Instead of trying to change TCP, it built an entirely new transport protocol on top of [[udp]], which middleboxes pass through without inspection. Then QUIC went a step further: it encrypts nearly everything, including its own transport headers. Middleboxes can't interfere with what they can't read. It's transport evolution through camouflage \u2014 hiding innovation inside a packet format that the existing infrastructure already knows how to ignore.`
		},
		{
			type: 'diagram',
			definition: `graph TD
  subgraph Traditional["Traditional TCP"]
    T1[Application] --> T2[TCP]
    T2 --> T3{{"Middlebox"}}
    T3 -->|"inspects headers"| T4[Network]
  end
  subgraph Modern["QUIC Approach"]
    Q1[Application] --> Q2["QUIC — encrypted"]
    Q2 --> Q3[UDP]
    Q3 --> Q4{{"Middlebox"}}
    Q4 -->|"passes through"| Q5[Network]
  end
  Traditional ~~~ Modern`,
			caption:
				'Middleboxes inspect TCP headers and block changes. QUIC hides inside UDP packets they already know how to ignore.'
		},
		{
			type: 'callout',
			title: 'The Numbers',
			text: 'TCP and UDP together carry virtually 100% of internet traffic. As of 2024, QUIC (which runs over UDP) carries over 30% of global web traffic \u2014 primarily through Google services and Cloudflare. The transport layer is the most fundamental, and least visible, part of the internet.'
		}
	]
};
