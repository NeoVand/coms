/**
 * Part XII — How to Learn More.
 *
 * Curated reading lists per area — the RFCs, books, courses, blogs,
 * and tools worth investing time in. The closing reference part of
 * the book.
 */

import type { BookPart } from '../types';

export const howToLearnMore: BookPart = {
	id: 'how-to-learn-more',
	title: 'How to Learn More',
	label: 'XIII',
	description:
		'Curated reading lists per area — the RFCs, books, courses, blogs, and tools worth investing time in.',
	chapters: [
		{
			id: 'rfcs-to-read',
			title: 'RFCs Worth Reading',
			synopsis: 'A guided tour with section pointers — the documents that pay back the time investment.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Reading List, In Order',
							text: `If you read three RFCs in your career, read these. They are the documents that taught the rest of the field how to write protocols.

**[[rfc:9293|RFC 9293]] — [[tcp|TCP]] (2022 update of [[rfc:793|RFC 793]])**. The single most-implemented protocol on the internet. Read sections 3.4 (sequence numbers and reliability), 3.6 (connection close and {{time-wait|TIME_WAIT}}), and 3.8 ({{flow-control|flow control}}). The state machine in 3.3.2 is worth memorising.

**[[rfc:8446|RFC 8446]] — [[tls|TLS]] 1.3**. Modern crypto-engineering at its best. [[pioneer:eric-rescorla|Eric Rescorla]]'s prose is the model for how to write a security spec. Read the entire {{handshake|handshake}} section; the formal-methods analysis appendices are optional.

**[[rfc:9000|RFC 9000]] — [[quic|QUIC]]**. The first transport designed in user space, and the place to see how the lessons of [[tcp|TCP]]'s 40 years got applied. Sections on streams (2.1), {{connection-migration|connection migration}} (9), and {{zero-rtt|0-RTT}} are essential.

**[[rfc:1035|RFC 1035]] — [[dns|DNS]]**. Forty years old, still the canonical reference. Read it with [[rfc:1034|RFC 1034]] (concepts) for the architecture; together they are 100 pages and they explain a system that has scaled to a billion hostnames.

**[[rfc:4271|RFC 4271]] — [[bgp|BGP]]-4**. The protocol that decides how packets reach which continent. Section 5 (path attributes) is where most of the engineering interest lives.

**[[rfc:5681|RFC 5681]] — [[tcp|TCP]] {{congestion-control|Congestion Control}}**. Codifies {{slow-start|slow start}}, {{congestion-avoidance|congestion avoidance}}, fast retransmit, and fast recovery — the four algorithms [[pioneer:van-jacobson|Van Jacobson]] introduced in 1988, formalised over decades.

**RFC 1958 — Architectural Principles of the Internet**. Brian Carpenter's 7-page summary of **why** the internet is the way it is. End-to-end principle, layering, robustness — all in one short document.

**[[rfc:9110|RFC 9110]] — HTTP Semantics**. The clean separation of "what HTTP means" (verbs, headers, status codes, {{content-negotiation|content negotiation}}) from "how it's encoded on the wire." Reading this once makes [[http1|HTTP/1.1]], [[http2|HTTP/2]], and [[http3|HTTP/3]] all click.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Arpanet_1974.svg/500px-Arpanet_1974.svg.png',
							alt: 'ARPANET in 1974 — the network the first RFCs documented.',
							caption:
								'The {{arpanet|ARPANET}} in 1974 — the small research network the first few hundred **RFCs** documented. By 2026 the {{ietf|IETF}} RFC series exceeds **9,800 documents**. The seven RFCs in the reading list above are the ones that most pay back the time investment for an engineer trying to be conversant with the modern stack.',
							credit: 'Image: Wikimedia Commons / public domain'
						}
					]
				},
				{ kind: 'rfc', number: '9293' },
				{ kind: 'rfc', number: '8446' },
				{ kind: 'rfc', number: '9000' },
				{ kind: 'rfc', number: '1035' },
				{ kind: 'rfc', number: '4271' },
				{ kind: 'rfc', number: '5681' },
				{ kind: 'rfc', number: '9110' }
			]
		},
		{
			id: 'books',
			title: 'Books',
			synopsis: 'Tanenbaum, Stevens, Kurose & Ross, Grigorik, the systems-approach textbook.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Five Books, In Recommended Reading Order',
							text: `**Andrew Tanenbaum, "Computer Networks" (6th ed., 2021).** The textbook most networking courses use. Bottom-up — physical layer first, application layer last. Strong on history and intuition; weaker on operational practice.

**W. Richard Stevens, "[[tcp|TCP]]/[[ip|IP]] Illustrated, Volume 1" (Fall, Wright, 2nd ed., 2011).** The book to read after a textbook to actually understand what is on the wire. Each chapter pairs a protocol description with a packet trace from real network capture. Volume 2 (the BSD source) is a deep-dive for systems engineers.

**Kurose & Ross, "Computer Networking: A Top-Down Approach" (8th ed., 2021).** The other major textbook. Top-down — application protocols first. More accessible than Tanenbaum for non-CS readers. The companion problem sets and lab assignments are excellent.

**Larry Peterson & Bruce Davie, "Computer Networks: A Systems Approach" (6th ed., 2022).** The systems-approach book — explains networking as a system rather than a sequence of protocols. Best for engineers who want to understand the design pressures behind the protocols. Free online edition is updated more often than the print.

**Ilya Grigorik, "High Performance Browser Networking" (O'Reilly, 2013).** The book on what actually matters for web performance. [[tcp|TCP]], [[tls|TLS]], [[http1|HTTP/1.1]], [[http2|HTTP/2]] (no [[http3|HTTP/3]] — it predates the spec), [[webrtc|WebRTC]], browser networking APIs. The single most useful book for full-stack web developers who want to debug {{latency|latency}}.

For specialised areas: **Olivier Bonaventure, "Computer Networking: Principles, Protocols and Practice"** (free online) — a lighter alternative to Tanenbaum. **[[pioneer:radia-perlman|Radia Perlman]], "Interconnections" (2nd ed., 2000)** — the routing/switching deep-dive by the inventor of spanning tree. **Marc Greis, "RFC 1180: A [[tcp|TCP]]/[[ip|IP]] Tutorial" (1991)** — 28 pages, free, 35 years old, still the cleanest introduction to the basics.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Library_book_stacks.jpg/500px-Library_book_stacks.jpg',
							alt: 'Library book stacks — long aisles of shelves.',
							caption:
								'A library stack. The five books in the list above plus the four follow-ups are enough to make any engineer genuinely fluent in this field — a few months of evenings spent on **Stevens** and **CS144** is the highest-leverage networking education you can give yourself.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'pioneer', id: 'radia-perlman' }
			]
		},
		{
			id: 'courses',
			title: 'Courses',
			synopsis: 'Stanford CS144 (build a [[tcp|TCP]] stack), MIT 6.829, Berkeley CS168.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Where to Learn by Doing',
							text: `**Stanford CS144 — Introduction to Computer Networking**. The single most useful course on this {{topic|topic}}. The labs walk you through implementing a working [[tcp|TCP]]/[[ip|IP]] stack from scratch — your code goes from sending raw [[ip|IP]] datagrams to running a full reliable transport with {{congestion-control|congestion control}}. Materials are public; the labs run on Linux and produce a stack that interoperates with the real internet.

**MIT 6.829 — Computer Networks**. Graduate-level, with a focus on the research-paper canon — Jacobson 1988, Cardwell {{bbr|BBR}} 2016, Cerf & Kahn 1974. Strong on routing and {{congestion-control|congestion control}}. Materials and lecture videos public.

**Berkeley CS168 — Introduction to the Internet**. Newer than CS144 and more focused on operational reality ([[bgp|BGP]], {{cdn|CDN}} architecture, [[dns|DNS]], real-world security incidents). Materials online; the projects involve building a small [[bgp|BGP]] simulator and a {{cdn|CDN}}.

**Coursera / Stanford "Networking in Google Cloud" specialisation**. If you want production-grade datacenter and cloud networking content rather than the academic treatment, this is the one to take. Practical, hands-on, well-paced.

**Princeton COS 461 — Computer Networks**. Jennifer Rexford's course; particularly strong on SDN, [[bgp|BGP]], and inter-domain routing. The instructor is a major contributor to those areas of research.

For a self-paced path: read **RFC 1180** (28 pages), then take **CS144**, then read **Stevens [[tcp|TCP]]/[[ip|IP]] Illustrated Vol 1**. Three months of evenings will make you genuinely fluent in the field.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/View_of_Stanford_University_campus.JPG/500px-View_of_Stanford_University_campus.JPG',
							alt: 'View of Stanford University campus.',
							caption:
								'**Stanford University** — home of **CS144**, the single most useful networking course on this topic. The labs walk you through implementing a working [[tcp|TCP]]/[[ip|IP]] stack from scratch — your code goes from sending raw [[ip|IP]] datagrams to running a full reliable transport with {{congestion-control|congestion control}}. Materials are public; the labs run on Linux and produce a stack that interoperates with the real internet.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
						}
					]
				}
			]
		},
		{
			id: 'blogs',
			title: 'Blogs',
			synopsis: 'Cloudflare, Meta Engineering, APNIC Labs, ipSpace.net.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Where the Field Talks to Itself',
							text: `**Cloudflare blog** (blog.cloudflare.com) — the most consistently good source of operationally-grounded networking content on the internet. They run a global {{anycast|anycast}} network, see real production traffic, and write about both the engineering and the security incidents in detail. If you read one networking blog, read this one.

**Meta Engineering blog** (engineering.fb.com) — periodic deep-dives on the protocols and infrastructure powering Facebook/Instagram/WhatsApp. Strong on [[quic|QUIC]] deployment, [[bgp|BGP]] operations, datacenter networking.

**APNIC Labs** (blog.apnic.net) — Geoff Huston's writing, in particular, is the best long-form analysis of internet measurement and policy out there. Long, dense, worth the time.

**ipSpace.net** — Ivan Pepelnjak's blog on enterprise networking, SDN, and the practical realities of operating real networks. Pragmatic and opinionated.

**Daniel Stenberg's blog** (daniel.haxx.se) — the maintainer of curl. If you want to understand HTTP at the level where bugs actually live, read his [[quic|QUIC]] and [[http3|HTTP/3]] deployment posts.

**Julia Evans' zines** (wizardzines.com) — short, illustrated explainers on networking primitives, debugging tools, kernel concepts. The ideal "I need to learn what tcpdump options I'm using" reference.

**Hacker News networking tag** — for breaking news. Set up a saved search. The discussions are usually more useful than the articles.

**The {{ietf|IETF}} mailing lists themselves** — datatracker.ietf.org. If you want to see protocols being designed in real time, subscribe to a working group whose work interests you. Be ready for high traffic.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cloudflare_Logo.svg/500px-Cloudflare_Logo.svg.png',
							alt: 'The Cloudflare logo — a stylised orange cloud.',
							caption:
								'The **Cloudflare** logo. Their engineering blog (blog.cloudflare.com) is the most consistently good operationally-grounded networking content on the internet — they run a global {{anycast|anycast}} network, see real production traffic, and write about both the engineering and the security incidents in detail. If you read one networking blog, read this one.',
							credit: 'Image: Cloudflare Inc. trademark, via Wikimedia Commons'
						}
					]
				}
			]
		},
		{
			id: 'tools',
			title: 'Tools',
			synopsis: 'Wireshark, scapy, FRRouting, Containerlab, RIPE Atlas.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Operating Toolkit',
							text: `**Wireshark** (wireshark.org) — the canonical packet analyser. If you do not know Wireshark, learning it is the highest-leverage hour you will ever spend in this field. Captures from any interface, dissects 3000+ protocols, lets you trace any flow byte by byte. Use it the next time something is wrong; you will never debug networking the same way again.

**curl** (curl.se) — the command-line HTTP client and Swiss-army knife of the protocol world. \`curl -v\` shows you the entire request and response with headers; \`--http3\` forces [[quic|QUIC]]; \`--resolve\` overrides [[dns|DNS]] for one request; \`-w\` formats timing information.

**dig** (BIND tools) — the standard [[dns|DNS]] debugging tool. \`dig +trace +recurse example.com\` walks the entire delegation chain from root to authoritative.

**scapy** (Python) — when you need to craft a packet that no normal tool will produce. The standard for protocol research, fuzzing, and unusual diagnostics. Steep learning curve, deep payoff.

**FRRouting** (frrouting.org) — open-source routing stack ([[bgp|BGP]], OSPF, IS-IS, RIP, etc.) that runs on Linux. Used in containerlab simulations and in some production small-scale ISPs.

**Containerlab** (containerlab.dev) — orchestrates network labs of containerised network operating systems. Spin up a 50-router [[bgp|BGP]] topology in under a minute on your laptop. The standard for hands-on routing learning today.

**RIPE Atlas** (atlas.ripe.net) — a global mesh of probes you can use to measure reachability, {{latency|latency}}, and routing from arbitrary vantage points. Free for non-commercial research.

**bgp.tools** — the modern [[bgp|BGP]] looking glass. Type any {{autonomous-system|AS}} or prefix; see the global {{routing-table|routing table}} from multiple vantage points. The successor to the older route-views.org infrastructure.

**iperf3** — {{bandwidth|bandwidth}} measurement between two endpoints. The standard for "how fast can these two hosts actually talk to each other."

**ngrep** — like grep for live packet captures. \`ngrep -d any "GET /api"\` shows every HTTP GET on the wire matching the pattern.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Wireshark_screenshot.png/500px-Wireshark_screenshot.png',
							alt: 'Wireshark — packet capture with protocol dissector pane.',
							caption:
								'**Wireshark** — the single highest-leverage tool in this entire list. Captures from any interface, dissects 3,000+ protocols, lets you trace any flow byte by byte. Learning Wireshark is the most useful hour any networking engineer ever spends. Use it the next time something is wrong; you will never debug networking the same way again.',
							credit: 'Image: Wireshark Foundation / Wikimedia Commons, GPL'
						}
					]
				}
			]
		}
	]
};
