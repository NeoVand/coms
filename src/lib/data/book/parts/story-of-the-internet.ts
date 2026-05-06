/**
 * Part II — The Story of the Internet.
 *
 * The narrative arc from packet switching as research idea to the
 * commons that AI agents now talk through. Eight chapters that
 * collectively read as one long-form article; each one composes
 * existing protocols, pioneers, RFCs, outages, and frontier entries
 * into the storyline rather than restating their facts.
 */

import type { BookPart } from '../types';

export const storyOfTheInternet: BookPart = {
	id: 'story-of-the-internet',
	title: 'The Story of the Internet',
	label: 'II',
	description:
		'The narrative arc from packet switching as research idea to a global commons that AI agents now talk through.',
	chapters: [
		{
			id: 'before-the-internet',
			title: 'Before the Internet',
			synopsis: 'Xerox PARC, ARPANET, NCP — the three streams that flowed into TCP/IP.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'There was no single moment when the internet was invented. Three traditions ran in parallel, each solving a piece, and only in retrospect do they look like one project.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three Traditions, One Architecture',
							text: `By 1972 there were three living networks worth talking about. ARPANET, funded by DARPA and built by BBN, used the Network Control Program (**NCP**) — a rigidly host-to-host protocol that assumed every node spoke the same language and trusted the IMPs (Interface Message Processors) to deliver packets in order. It linked four sites at the end of 1969, and by 1972 it spanned dozens of universities and research labs.

At Xerox PARC, **[[pioneer:bob-metcalfe|Bob Metcalfe]]** and **[[pioneer:david-boggs|David Boggs]]** were building [[ethernet|Ethernet]] — a local-area network on coaxial cable where every host shouted onto the same wire and used carrier sensing to back off when collisions happened. The PARC Universal Packet (PUP), running over Ethernet, anticipated almost every architectural idea the internet would later canonise: variable-length packets, a thin internetworking layer, separate transport protocols above it.

The third tradition was packet radio. ARPA's Packet Radio Network (PRNET, 1973) and the Atlantic Packet Satellite Network (SATNET, 1975) had to deal with hosts moving, links flickering, and bandwidth that varied by orders of magnitude. They could not assume an IMP-style fabric beneath them. The question — how do you let a packet hop from Ethernet to ARPANET to a satellite link without any of them knowing about the others? — was the question that produced the internet.`
						},
						{
							type: 'callout',
							title: "Why three? Because the problem was three problems.",
							text: 'Local fabric (Ethernet), wide-area research backbone (ARPANET), and unreliable wireless (PRNET/SATNET) each forced different design pressures. The architecture that won — TCP/IP — is the one that took none of them as canonical and instead specified the **gluing** layer.'
						}
					]
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/A_sketch_of_the_ARPANET_in_December_1969.png/500px-A_sketch_of_the_ARPANET_in_December_1969.png',
							alt: 'Hand-drawn sketch of ARPANET, December 1969 — the original four nodes UCLA, SRI, UCSB, and Utah.',
							caption:
								'A December 1969 sketch of the ARPANET — the four-node network that became the internet. UCLA, SRI, UCSB, and Utah; one IMP per site.',
							credit: 'Image: DARPA / public domain, via Wikimedia Commons'
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg/500px-Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg',
							alt: 'A BBN-built Interface Message Processor (IMP) on display at the Computer History Museum.',
							caption:
								'An original BBN Interface Message Processor (IMP) — the rugged minicomputer that served as ARPANET\'s first router. The protocol that ran between IMPs is what TCP/IP would later replace.',
							credit: 'Photo: Erik Pitti, CC BY 2.0, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'pioneer', id: 'bob-metcalfe' },
				{ kind: 'pioneer', id: 'vint-cerf' },
				{ kind: 'protocol', id: 'ethernet' }
			]
		},
		{
			id: 'the-1981-burst',
			title: 'The 1981–83 Standardisation Burst',
			synopsis: 'RFC 791/792/793, the ARPANET flag day, and IEEE 802.3 ratified — three years that locked in the stack.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three Years That Decided Everything',
							text: `Between January 1980 and January 1983, the internet went from a research curiosity to a system you could rely on. The architectural decision had already been made — split the original combined Transmission Control Program into a thin internetworking layer ([[ip|IP]]) underneath and an end-to-end transport ([[tcp|TCP]]) above it — but the **specifications** needed to harden, and a critical mass of hosts had to actually convert.

In **September 1981**, [[pioneer:jon-postel|Jon Postel]] at ISI shipped three RFCs in rapid succession: [[rfc:791|RFC 791]] (Internet Protocol), [[rfc:792|RFC 792]] (ICMP), and [[rfc:9293|RFC 793]] (Transmission Control Protocol). These are the documents the modern internet still cites — RFC 793 was the canonical TCP specification for the next 41 years, until [[rfc:9293|RFC 9293]] obsoleted it in 2022.

On **1 January 1983**, ARPANET executed its famous "flag day": NCP was switched off, and TCP/IP became the only protocol allowed on the network. Roughly 400 hosts had to convert; sites that missed the deadline simply lost connectivity. Survivors got buttons reading **I survived the TCP/IP transition**. Most historians treat this date as the birthday of the modern internet.

In parallel, the IEEE 802.3 working group ratified its [[ethernet|Ethernet]] standard (originally a Xerox/DEC/Intel collaboration). LAN technology and WAN technology now had a clean interface — the IP packet — and could evolve independently. That separation has held for forty-three years.`
						}
					]
				},
				{ kind: 'rfc', number: '791' },
				{ kind: 'rfc', number: '9293' },
				{ kind: 'pioneer', id: 'jon-postel' },
				{
					kind: 'pull-quote',
					text: 'The flag day was a forcing function. There was no committee that could have produced a softer transition. NCP and TCP/IP had to coexist for as little time as possible because every additional month of dual-stack maintenance was a month nobody was building anything new.',
					attribution: 'Author'
				}
			]
		},
		{
			id: 'the-1986-collapse',
			title: 'The 1986 Congestion Collapse',
			synopsis: '32 kbps to 40 bps in 400 yards — and Van Jacobson\'s six-algorithm fix.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The First Collapse',
							text: `In October 1986, the internet broke for the first time. Throughput between Lawrence Berkeley Lab and UC Berkeley — three IMP hops apart, less than 400 yards of physical distance — collapsed from 32 kbps to 40 bps. A 1000× degradation. The cause was [[tcp|TCP]] itself: early BSD TCP retransmitted aggressively when ACKs were late, and as the network filled up, every retransmission only added to the congestion. The senders kept piling on; the network kept melting.

[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent six months instrumenting the wire and reading the BSD source. Their 1988 SIGCOMM paper, **"Congestion Avoidance and Control,"** introduced six algorithms in one paper: **slow start**, **AIMD congestion avoidance**, **fast retransmit**, **fast recovery**, **exponential RTO backoff**, and a refined **RTT estimator**. The fixes shipped in 4.3BSD-Tahoe and saved the internet.

The deeper principle they articulated — **conservation of packets** — has held up for nearly forty years. A sender should put one packet into the network only when an ACK confirms a previous packet has left it. Everything since, including [[quic|QUIC]] in 2021 and Google's BBR in 2016, is variations on that theme.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg',
							alt: 'Van Jacobson — co-author of the 1988 paper that saved the internet from congestion collapse.',
							caption:
								'Van Jacobson, who in 1988 wrote the six algorithms that ship in every operating system today.',
							credit: 'Photo: Wikimedia Commons / public domain'
						}
					]
				},
				{ kind: 'pioneer', id: 'van-jacobson' },
				{ kind: 'rfc', number: '5681' },
				{
					kind: 'simulation',
					protocolId: 'tcp'
				}
			]
		},
		{
			id: 'osi-vs-tcp-ip',
			title: 'The OSI vs TCP/IP War',
			synopsis: '"Rough consensus and running code" — why the IETF won.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Standards War Decided by Implementation',
							text: `Through the late 1980s and early 1990s, almost everyone official believed [[tcp|TCP/IP]] was a research project that would soon be replaced by the **real** networking future: the OSI suite. ISO and the ITU-T were promoting a seven-layer stack with proper transport (TP4), proper internetworking (CLNP), and proper application protocols (X.400 mail, X.500 directory). The U.S. government had a procurement mandate called GOSIP that **required** OSI for federal systems. European PTTs threw their weight behind it. Universities taught it from textbooks.

The trouble was, OSI shipped specifications. The IETF shipped code.

In July 1992, **[[pioneer:david-clark|David Clark]]** gave a talk at the 24th IETF meeting in Cambridge titled **"A Cloudy Crystal Ball — Visions of the Future."** Halfway through, he distilled the working culture of the IETF into a sentence that decided the question:`
						}
					]
				},
				{
					kind: 'pull-quote',
					text: 'We reject: kings, presidents and voting. We believe in: rough consensus and running code.',
					attribution: 'David Clark, IETF 24, July 1992'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							text: `That line travels well because it is precise. **Rough** consensus, not unanimous — small minorities cannot block. **Running** code, not just specifications — your idea must be implementable and demonstrable. Together they describe a process that ships things, accepts that some of them are wrong, and iterates. OSI's process did the opposite: write the perfect specification, ratify it through votes, deploy it once.

By 1995, OSI was effectively dead in production networks. CLNP survived in IS-IS routing and as the trace heritage in [[ipv6|IPv6]]'s addressing model. X.500 became LDAP. X.400 lost to [[smtp|SMTP]]. The lesson was generalised across the industry: the IETF's **running code** test became the default expectation everywhere standards were made, including the W3C and later the WHATWG.`
						}
					]
				},
				{ kind: 'pioneer', id: 'david-clark' }
			]
		},
		{
			id: 'the-web-arrives',
			title: 'The Web Is Built On Top',
			synopsis: 'CERN, hypertext, and a NeXT cube in the corner.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Manager\'s Side Project',
							text: `In March 1989, **[[pioneer:tim-berners-lee|Tim Berners-Lee]]** circulated a memo at CERN titled **"Information Management: A Proposal."** His manager, Mike Sendall, scribbled "vague but exciting" on the cover. The proposal described a system where documents on different machines could link to each other through hypertext, retrieved by a uniform addressing scheme.

By Christmas 1990, on a NeXT workstation in his office, Berners-Lee had built the first **web server** (info.cern.ch), the first **web browser** (also a WYSIWYG editor), and the first three protocols he needed: HTTP for transport, HTML for markup, and URLs for addressing. The whole system rode on top of [[tcp|TCP]] — that was the entire architectural assumption. It did not have to invent transport, ordering, retransmission, or addressing. The internet had already solved those.

That is the deepest lesson of the web's success. It was an **application** — an application that benefited from a layered stack underneath that worked. [[http1|HTTP/1.0]] (1996), [[http1|HTTP/1.1]] (1997), [[http2|HTTP/2]] (2015), and [[http3|HTTP/3]] (2022) have all evolved within that frame, and every one of them is still 'just' a way to ask one host to send another some bytes.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/500px-First_Web_Server.jpg',
							alt: 'Tim Berners-Lee\'s NeXTcube — the world\'s first web server, displayed at CERN with a "do not power down" note on the front.',
							caption:
								'The NeXTcube on which Berners-Lee ran the world\'s first web server (info.cern.ch) at CERN in 1990. The "Do not power down" sticker is original — for years this single machine was the entire web.',
							credit: 'Photo: Coolcaesar, CC BY-SA 3.0, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'pioneer', id: 'tim-berners-lee' },
				{ kind: 'protocol', id: 'http1' },
				{
					kind: 'pull-quote',
					text: 'Vague but exciting.',
					attribution: 'Mike Sendall, on the cover of Berners-Lee\'s 1989 memo'
				}
			]
		},
		{
			id: 'mobile-and-bufferbloat',
			title: 'The Mobile and Bufferbloat Decade',
			synopsis: '3G, 4G, the iPhone, and why your home internet is laggy under load.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When the Network Got Personal',
							text: `From 2007 onward, the internet stopped being a thing you logged into from a desktop and became a thing in your pocket. The iPhone shipped in June 2007 with a Wi-Fi/EDGE radio; the App Store followed in 2008; LTE in 2010. Within a decade, mobile traffic dwarfed fixed-line traffic almost everywhere.

That changed two assumptions in [[tcp|TCP]] design. First, the **last-mile bandwidth varied wildly** — a hand turning the user 90° could change throughput by 10×. Second, **buffers grew enormously**. Cheap memory meant routers and home modems were shipped with multi-megabyte queues, ostensibly to absorb bursts but actually to hide congestion from the senders that needed to see it. The result was **bufferbloat**: queues that grew to seconds of latency under load, defeating the entire AIMD signalling mechanism Jacobson had built. Your video call stuttered because someone in the next room started a download.

The fix took fifteen years. **Active queue management** (CoDel, fq_codel, PIE — RFCs 8290, 8033) shrank queues by dropping packets early when latency rose. **Smart queue management** (SQM) appeared in router firmware. And eventually [[quic|QUIC]] gave applications fine-grained control over their own pacing, sidestepping the kernel's ossified TCP stack entirely.`
						},
						{
							type: 'callout',
							title: 'Bufferbloat is the canonical example of well-meaning engineering creating a network-wide pathology.',
							text: 'Adding more buffer seemed obviously good — bursts wouldn\'t cause loss. But TCP\'s congestion-control loop **needed** loss as its signal. The fix was to push buffers back down and add explicit signalling (ECN) instead.'
						}
					]
				},
				{ kind: 'protocol', id: 'tcp' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' }
			]
		},
		{
			id: 'the-quic-redesign',
			title: 'The QUIC Redesign',
			synopsis: 'Pulling reliable transport into user space and folding TLS into it.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why a New Transport in 2012',
							text: `By 2012, [[tcp|TCP]] had a problem nobody could fix. Operating-system kernels shipped its implementation. Middleboxes — firewalls, NAT routers, transparent proxies — inspected and modified its headers. Anything you wanted to add to TCP (TFO, MPTCP, SACK Permitted) had to survive being mangled by every intermediate device on the planet. The protocol had **ossified**: even Google, with its enormous deployment leverage, could not roll out new TCP features in less than a decade.

The QUIC project, started by **[[pioneer:jim-roskind|Jim Roskind]]** at Google in 2012, took a radically different bet. Instead of fighting the middleboxes, QUIC would tunnel a brand-new transport inside [[udp|UDP]] datagrams that middleboxes already had to forward unchanged. Inside that tunnel: a TLS 1.3 handshake that combined transport and crypto setup into a single round-trip; per-stream sequencing that eliminated head-of-line blocking; and the entire protocol implemented in user space, where applications could deploy improvements monthly instead of waiting for the next OS release.

[[rfc:9000|RFC 9000]] standardised QUIC in May 2021. By 2025, QUIC carried 35% of all websites and over 75% of Meta's internet traffic. [[http3|HTTP/3]] — HTTP over QUIC — became the default transport choice for most large platforms. The same architectural move that made QUIC possible (user-space transport on UDP) is now what makes [[mptcp|multipath QUIC]], MoQ live streaming, and HTTP/3 datagrams possible. Ossification, finally, has a release valve.`
						}
					]
				},
				{ kind: 'protocol', id: 'quic' },
				{ kind: 'pioneer', id: 'jim-roskind' },
				{
					kind: 'simulation',
					protocolId: 'quic'
				}
			]
		},
		{
			id: 'the-ai-agent-layer',
			title: 'The AI Agent Layer (2024–)',
			synopsis: 'MCP, A2A, and the first new application layer in fifteen years.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Protocol Layer Designed for Software That Reasons',
							text: `For fifteen years after [[websockets|WebSockets]] (2011), the application layer of the internet was settled. [[http1|HTTP]] (in three versions), [[grpc|gRPC]] for service-to-service RPC, [[graphql|GraphQL]] when you needed a flexible query model, and a long tail of older protocols ([[smtp|SMTP]], [[imap|IMAP]], [[xmpp|XMPP]], [[mqtt|MQTT]]) holding their niches. Nothing genuinely new happened at L7 between 2011 and 2024.

In November 2024, Anthropic published the **Model Context Protocol** — [[mcp|MCP]]. The premise was simple: AI coding assistants and chat agents needed a standard way to talk to tools (file systems, databases, APIs, internal systems) without each pair re-inventing the integration. Within a year, MCP had streaming HTTP transport ([[frontier:mcp-streamable-http|MCP-streamable-HTTP]]), thousands of MCP servers in the registry, and first-class support across major model providers.

In April 2025, Google followed with **Agent2Agent Protocol** — [[a2a|A2A]] — for agent-to-agent collaboration: capability discovery, task delegation, asynchronous event streams. A2A moved into the [[frontier:a2a-linux-foundation|Linux Foundation]] in mid-2025.

These protocols are recognisably **internet**. They run over [[http3|HTTP/3]]. They use JSON-RPC for message framing. They lean on [[oauth2|OAuth 2.1]] for authentication. They are built by treating "an autonomous program that reasons" as a first-class network participant — the way the original web treated "a document on another machine" as a first-class participant. Whether they last, or get replaced by something better in five years, is the open question of the moment.`
						}
					]
				},
				{ kind: 'protocol', id: 'mcp' },
				{ kind: 'protocol', id: 'a2a' },
				{ kind: 'frontier', id: 'mcp-streamable-http' },
				{ kind: 'frontier', id: 'a2a-linux-foundation' },
				{
					kind: 'pull-quote',
					text: 'The protocols of the AI age are not separate from the internet. They are the internet, applied to a new kind of client.',
					attribution: 'Author'
				}
			]
		}
	]
};
