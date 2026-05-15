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
			synopsis: '{{xerox-parc|Xerox PARC}}, {{arpanet|ARPANET}}, {{ncp|NCP}} — the three streams that flowed into [[tcp|TCP]]/[[ip|IP]].',
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
							text: `By 1972 there were three living networks worth talking about. {{arpanet|ARPANET}}, funded by {{darpa|DARPA}} and built by {{bbn|BBN}}, used the {{ncp|Network Control Program}} (**{{ncp|NCP}}**) — a rigidly host-to-host protocol that assumed every node spoke the same language and trusted the IMPs (Interface Message Processors) to deliver packets in order. It linked four sites at the end of 1969, and by 1972 it spanned dozens of universities and research labs.

At {{xerox-parc|Xerox PARC}}, **[[pioneer:bob-metcalfe|Bob Metcalfe]]** and **[[pioneer:david-boggs|David Boggs]]** were building [[ethernet|Ethernet]] — a local-area network on coaxial cable where every host shouted onto the same wire and used carrier sensing to back off when collisions happened. The PARC Universal Packet (PUP), running over [[ethernet|Ethernet]], anticipated almost every architectural idea the internet would later canonise: variable-length packets, a thin internetworking layer, separate transport protocols above it.

The third tradition was packet radio. ARPA's Packet Radio Network (PRNET, 1973) and the Atlantic Packet Satellite Network (SATNET, 1975) had to deal with hosts moving, links flickering, and {{bandwidth|bandwidth}} that varied by orders of magnitude. They could not assume an {{imp|IMP}}-style fabric beneath them. The question — how do you let a packet hop from [[ethernet|Ethernet]] to {{arpanet|ARPANET}} to a satellite link without any of them knowing about the others? — was the question that produced the internet.`
						},
						{
							type: 'callout',
							title: "Why three? Because the problem was three problems.",
							text: 'Local fabric ([[ethernet|Ethernet]]), wide-area research backbone ({{arpanet|ARPANET}}), and unreliable wireless (PRNET/SATNET) each forced different design pressures. The architecture that won — [[tcp|TCP]]/[[ip|IP]] — is the one that took none of them as canonical and instead specified the **gluing** layer.'
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
								'A December 1969 sketch of the {{arpanet|ARPANET}} — the four-node network that became the internet. UCLA, SRI, UCSB, and Utah; one {{imp|IMP}} per site.',
							credit: 'Image: DARPA / public domain, via Wikimedia Commons'
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg/500px-Interface_Message_Processor_%28%22IMP%22%29_%282586235502%29.jpg',
							alt: 'A BBN-built Interface Message Processor (IMP) on display at the Computer History Museum.',
							caption:
								'An original {{bbn|BBN}} {{imp|Interface Message Processor}} ({{imp|IMP}}) — the rugged minicomputer that served as {{arpanet|ARPANET}}\'s first router. The protocol that ran between IMPs is what [[tcp|TCP]]/[[ip|IP]] would later replace.',
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
			synopsis: '[[rfc:791|RFC 791]]/792/793, the {{arpanet|ARPANET}} {{flag-day-1983|flag day}}, and IEEE 802.3 ratified — three years that locked in the stack.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three Years That Decided Everything',
							text: `Between January 1980 and January 1983, the internet went from a research curiosity to a system you could rely on. The architectural decision had already been made — split the original combined Transmission Control Program into a thin internetworking layer ([[ip|IP]]) underneath and an end-to-end transport ([[tcp|TCP]]) above it — but the **specifications** needed to harden, and a critical mass of hosts had to actually convert.

In **September 1981**, [[pioneer:jon-postel|Jon Postel]] at ISI shipped three RFCs in rapid succession: [[rfc:791|RFC 791]] (Internet Protocol), [[rfc:792|RFC 792]] ([[icmp|ICMP]]), and [[rfc:9293|RFC 793]] (Transmission Control Protocol). These are the documents the modern internet still cites — [[rfc:793|RFC 793]] was the canonical [[tcp|TCP]] specification for the next 41 years, until [[rfc:9293|RFC 9293]] obsoleted it in 2022.

On **1 January 1983**, {{arpanet|ARPANET}} executed its famous "{{flag-day-1983|flag day}}": {{ncp|NCP}} was switched off, and [[tcp|TCP]]/[[ip|IP]] became the only protocol allowed on the network. Roughly 400 hosts had to convert; sites that missed the deadline simply lost connectivity. Survivors got buttons reading **I survived the [[tcp|TCP]]/[[ip|IP]] transition**. Most historians treat this date as the birthday of the modern internet.

In parallel, the IEEE 802.3 working group ratified its [[ethernet|Ethernet]] standard (originally a Xerox/DEC/Intel collaboration). LAN technology and WAN technology now had a clean interface — the [[ip|IP]] packet — and could evolve independently. That separation has held for forty-three years.`
						},
						{
							type: 'narrative',
							title: 'The Architectural Decision That Made the Rest Possible',
							text: `The split that mattered most was not legal or organisational. It was the **separation of [[tcp|TCP]] from [[ip|IP]]**, finalised in [[rfc:791|RFC 791]] and [[rfc:9293|RFC 793]] (both September 1981). For the previous decade, the experimental Transmission Control Program had bundled everything into a single reliable byte-stream: addressing, sequencing, {{flow-control|flow control}}, {{retransmission|retransmission}}. **David Reed and [[pioneer:jon-postel|Jon Postel]] argued in 1978** that some applications — packet voice, in particular — needed speed more than reliability, and that fusing the two services made it impossible for protocols like the future [[udp|UDP]] (1980), [[icmp|ICMP]] (1981), or eventually [[quic|QUIC]] (2021) to exist.

The decision to peel [[ip|IP]] off as a thin internetworking layer underneath [[tcp|TCP]] is the reason the modern internet has more than one transport protocol. Without that separation, every new transport would have had to renegotiate with every router on the planet. With it, [[udp|UDP]] could ship in 1980 over the same [[ip|IP]] fabric without changing anything below it.

This is the deepest principle of the era: **separate what changes together from what doesn't**. Transports change; addressing doesn't. Wires change; packets don't. The architecture that survived four decades was the one that made each layer free to evolve on its own clock.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jon_Postel.jpg/500px-Jon_Postel.jpg',
							alt: 'Jon Postel — editor of RFC 791, 792, and 793, and the IANA function for over a decade.',
							caption:
								'[[pioneer:jon-postel|Jon Postel]] at ISI. He edited [[rfc:791|RFC 791]] ([[ip|IP]]), [[rfc:792|RFC 792]] ([[icmp|ICMP]]), and [[rfc:9293|RFC 793]] ([[tcp|TCP]]) in a single burst in September 1981, and ran the {{iana|IANA}} function single-handedly from this office for over a decade. Few engineers have shaped a global system this much from this small a room.',
							credit: 'Photo: Irene Fertik, USC News Service / public domain, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'rfc', number: '791' },
				{ kind: 'rfc', number: '9293' },
				{ kind: 'pioneer', id: 'jon-postel' },
				{
					kind: 'pull-quote',
					text: 'The {{flag-day-1983|flag day}} was a forcing function. There was no committee that could have produced a softer transition. {{ncp|NCP}} and [[tcp|TCP]]/[[ip|IP]] had to coexist for as little time as possible because every additional month of dual-stack maintenance was a month nobody was building anything new.',
					attribution: 'Author'
				}
			]
		},
		{
			id: 'the-1986-collapse',
			title: 'The 1986 Congestion Collapse',
			synopsis: '32 kbps to 40 bps in 400 yards — and [[pioneer:van-jacobson|Van Jacobson]]\'s six-algorithm fix.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The First Collapse',
							text: `In October 1986, the internet broke for the first time. Throughput between Lawrence Berkeley Lab and UC Berkeley — three {{imp|IMP}} hops apart, less than 400 yards of physical distance — collapsed from 32 kbps to 40 bps. A 1000× degradation. The cause was [[tcp|TCP]] itself: early BSD [[tcp|TCP]] retransmitted aggressively when ACKs were late, and as the network filled up, every {{retransmission|retransmission}} only added to the congestion. The senders kept piling on; the network kept melting.

[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent six months instrumenting the wire and reading the BSD source. Their 1988 SIGCOMM paper, **"{{congestion-avoidance|Congestion Avoidance}} and Control,"** introduced six algorithms in one paper: **{{slow-start|slow start}}**, **{{aimd|AIMD}} {{congestion-avoidance|congestion avoidance}}**, **fast retransmit**, **fast recovery**, **exponential RTO backoff**, and a refined **{{rtt|RTT}} estimator**. The fixes shipped in 4.3BSD-Tahoe and saved the internet.

The deeper principle they articulated — **conservation of packets** — has held up for nearly forty years. A sender should put one packet into the network only when an {{ack|ACK}} confirms a previous packet has left it. Everything since, including [[quic|QUIC]] in 2021 and Google's {{bbr|BBR}} in 2016, is variations on that theme.`
						},
						{
							type: 'narrative',
							title: 'Why "Three Duplicate ACKs"?',
							text: `One mechanical detail from the 1988 paper deserves a paragraph because it shows up in every [[tcp|TCP]] stack today. Jacobson's **fast retransmit** triggers when the sender sees **three duplicate ACKs** — three acknowledgements all naming the same next-expected-byte. Why three?

The intuition is reordering tolerance. A single duplicate {{ack|ACK}} could mean a packet was reordered by the network and arrived out of sequence. Two duplicates is suspicious but still possibly reordering. Three duplicates means the packet is almost certainly *lost*, not just reordered — the receiver has seen three later packets without seeing the one in question. Jacobson chose three as the threshold that minimised false retransmits in the BSD measurements.

Forty years later, three duplicate ACKs is still the trigger. The number is hard-coded into [[rfc:5681|RFC 5681]] and every modern [[tcp|TCP]] implementation. **{{cubic|CUBIC}}, {{bbr|BBR}}, NewReno** all inherit it unchanged. The mechanism is so universal that it now has a name everyone knows — *fast retransmit* — and a paper-trail back to a single 1988 design choice.

The 1986 collapse is the moment [[tcp|TCP]] went from working-most-of-the-time to **a protocol you could trust at scale**. Every later congestion-control algorithm — Reno, NewReno, Vegas, {{cubic|CUBIC}}, Compound, {{bbr|BBR}}, BBRv3, [[frontier:l4s-comcast-launch|L4S]] — is a refinement of Jacobson's six. The branch point of the field is one paper.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg',
							alt: 'Van Jacobson — co-author of the 1988 paper that saved the internet from congestion collapse.',
							caption:
								'[[pioneer:van-jacobson|Van Jacobson]], who in 1988 wrote the six algorithms that ship in every operating system today.',
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
			synopsis: '"Rough consensus and running code" — why the {{ietf|IETF}} won.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Standards War Decided by Implementation',
							text: `Through the late 1980s and early 1990s, almost everyone official believed [[tcp|TCP/IP]] was a research project that would soon be replaced by the **real** networking future: the OSI suite. ISO and the ITU-T were promoting a seven-layer stack with proper transport (TP4), proper internetworking (CLNP), and proper application protocols (X.400 mail, X.500 directory). The U.S. government had a procurement mandate called GOSIP that **required** OSI for federal systems. European PTTs threw their weight behind it. Universities taught it from textbooks.

The trouble was, OSI shipped specifications. The {{ietf|IETF}} shipped code.

In July 1992, **[[pioneer:david-clark|David Clark]]** gave a talk at the 24th {{ietf|IETF}} meeting in Cambridge titled **"A Cloudy Crystal Ball — Visions of the Future."** Halfway through, he distilled the working culture of the {{ietf|IETF}} into a sentence that decided the question:`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSI_Model_v1.svg/500px-OSI_Model_v1.svg.png',
							alt: 'The seven-layer OSI Reference Model diagram.',
							caption:
								'The seven-layer **OSI Reference Model** — the architecture every textbook still teaches, every standards body in the late 1980s endorsed, and every commercial deployment quietly bypassed. The [[tcp|TCP/IP]] stack that actually won shipped four layers, not seven, and was running production traffic before OSI finished writing the spec for its session layer.',
							credit: 'Image: Wikimedia Commons / public domain'
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

By 1995, OSI was effectively dead in production networks. CLNP survived in IS-IS routing and as the trace heritage in [[ipv6|IPv6]]'s addressing model. X.500 became LDAP. X.400 lost to [[smtp|SMTP]]. The lesson was generalised across the industry: the {{ietf|IETF}}'s **running code** test became the default expectation everywhere standards were made, including the {{w3c|W3C}} and later the WHATWG.`
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

By Christmas 1990, on a NeXT workstation in his office, Berners-Lee had built the first **web server** (info.cern.ch), the first **web browser** (also a WYSIWYG editor), and the first three protocols he needed: HTTP for transport, HTML for markup, and URLs for addressing. The whole system rode on top of [[tcp|TCP]] — that was the entire architectural assumption. It did not have to invent transport, ordering, {{retransmission|retransmission}}, or addressing. The internet had already solved those.

That is the deepest lesson of the web's success. It was an **application** — an application that benefited from a layered stack underneath that worked. [[http1|HTTP/1.0]] (1996), [[http1|HTTP/1.1]] (1997), [[http2|HTTP/2]] (2015), and [[http3|HTTP/3]] (2022) have all evolved within that frame, and every one of them is still 'just' a way to ask one host to send another some bytes.`
						},
						{
							type: 'narrative',
							title: 'CERN Released It Royalty-Free',
							text: `On **30 April 1993**, CERN released the World Wide Web technology — server, browser, line-mode reader, and the protocol specifications — into the public domain. The document is one of the most consequential pieces of paper in computing history. It was a deliberate decision by CERN's management, against the institutional instinct to license the research, that the web should be free for anyone to implement.

The 1993 release is the reason there is no Microsoft web, no Apple web, no IBM web. Within twelve months, **Mosaic** (NCSA, Marc Andreessen + Eric Bina, January 1993) had become the first popular graphical browser. Andreessen co-founded Netscape later that year. Microsoft licensed the Spyglass / Mosaic codebase as the seed of Internet Explorer in 1995. By 1996, the browser wars were under way — but every combatant was building on the public-domain CERN spec.

The architectural lesson the web carried forward: an application that succeeds at internet scale must be **open enough that competitors can implement it**. HTTP succeeded for the same reason [[tcp|TCP]]/[[ip|IP]] succeeded — the spec was public, the reference implementation was free, and anyone could build a compatible peer. Every walled-garden alternative (Microsoft's MSN, AOL's keywords, Compuserve, even Apple's later eWorld) lost to the open web.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/500px-First_Web_Server.jpg',
							alt: 'Tim Berners-Lee\'s NeXTcube — the world\'s first web server, displayed at CERN with a "do not power down" note on the front.',
							caption:
								'The NeXTcube on which [[pioneer:tim-berners-lee|Berners-Lee]] ran the world\'s first web server (info.cern.ch) at CERN in 1990. The "Do not power down" sticker is original — for years this single machine was the entire web.',
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
							text: `From 2007 onward, the internet stopped being a thing you logged into from a desktop and became a thing in your pocket. The iPhone shipped in June 2007 with a [[wifi|Wi-Fi]]/EDGE radio; the App Store followed in 2008; LTE in 2010. Within a decade, mobile traffic dwarfed fixed-line traffic almost everywhere.

That changed two assumptions in [[tcp|TCP]] design. First, the **last-mile {{bandwidth|bandwidth}} varied wildly** — a hand turning the user 90° could change throughput by 10×. Second, **buffers grew enormously**. Cheap memory meant routers and home modems were shipped with multi-megabyte queues, ostensibly to absorb bursts but actually to hide congestion from the senders that needed to see it. The result was **{{bufferbloat|bufferbloat}}**: queues that grew to seconds of {{latency|latency}} under load, defeating the entire {{aimd|AIMD}} signalling mechanism Jacobson had built. Your video call stuttered because someone in the next room started a download.

The fix took fifteen years. **{{aqm|Active queue management}}** (CoDel, fq_codel, PIE — RFCs 8290, 8033) shrank queues by dropping packets early when latency rose. **Smart queue management** (SQM) appeared in router firmware. And eventually [[quic|QUIC]] gave applications fine-grained control over their own {{pacing|pacing}}, sidestepping the kernel's ossified [[tcp|TCP]] stack entirely.`
						},
						{
							type: 'callout',
							title: 'Bufferbloat is the canonical example of well-meaning engineering creating a network-wide pathology.',
							text: 'Adding more buffer seemed obviously good — bursts wouldn\'t cause loss. But [[tcp|TCP]]\'s congestion-control loop **needed** loss as its signal. The fix was to push buffers back down and add explicit signalling ({{ecn|ECN}}) instead.'
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Steve_Jobs_presents_iPhone.jpg/500px-Steve_Jobs_presents_iPhone.jpg',
							alt: 'Steve Jobs at Macworld 2007 announcing the original iPhone.',
							caption:
								'Steve Jobs unveils the original iPhone at Macworld San Francisco, **9 January 2007**. The device shipped on 29 June 2007 with [[wifi|Wi-Fi]] + EDGE; the App Store followed in July 2008; LTE in 2010. Within a decade, mobile traffic dwarfed fixed-line traffic almost everywhere — and {{bufferbloat|bufferbloat}}, the AQM revolution, and eventually [[quic|QUIC]] are all downstream of the device in this photograph.',
							credit: 'Photo: Wikimedia Commons / fair use, public-relations release'
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
			synopsis: 'Pulling reliable transport into user space and folding [[tls|TLS]] into it.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why a New Transport in 2012',
							text: `By 2012, [[tcp|TCP]] had a problem nobody could fix. Operating-system kernels shipped its implementation. Middleboxes — firewalls, {{nat|NAT}} routers, transparent proxies — inspected and modified its headers. Anything you wanted to add to [[tcp|TCP]] (TFO, [[mptcp|MPTCP]], {{sack|SACK}} Permitted) had to survive being mangled by every intermediate device on the planet. The protocol had **ossified**: even Google, with its enormous deployment leverage, could not roll out new [[tcp|TCP]] features in less than a decade.

The [[quic|QUIC]] project, started by **[[pioneer:jim-roskind|Jim Roskind]]** at Google in 2012, took a radically different bet. Instead of fighting the middleboxes, [[quic|QUIC]] would tunnel a brand-new transport inside [[udp|UDP]] datagrams that middleboxes already had to forward unchanged. Inside that tunnel: a [[tls|TLS]] 1.3 {{handshake|handshake}} that combined transport and crypto setup into a single round-trip; per-stream sequencing that eliminated {{head-of-line-blocking|head-of-line blocking}}; and the entire protocol implemented in user space, where applications could deploy improvements monthly instead of waiting for the next OS release.

[[rfc:9000|RFC 9000]] standardised [[quic|QUIC]] in May 2021. By 2025, [[quic|QUIC]] carried 35% of all websites and over 75% of Meta's internet traffic. [[http3|HTTP/3]] — HTTP over [[quic|QUIC]] — became the default transport choice for most large platforms. The same architectural move that made [[quic|QUIC]] possible (user-space transport on [[udp|UDP]]) is now what makes [[mptcp|multipath QUIC]], MoQ live streaming, and [[http3|HTTP/3]] datagrams possible. Ossification, finally, has a release valve.`
						},
						{
							type: 'narrative',
							title: 'Why UDP, Not a New Protocol Number',
							text: `The choice to tunnel inside [[udp|UDP]] rather than ship as a new [[ip|IP]] protocol number (51, 132, anything not yet assigned) was the most important deployment decision [[quic|QUIC]] made.

A new [[ip|IP]] protocol number — like [[sctp|SCTP]] got — would have been the architecturally cleaner choice. [[sctp|SCTP]] ([[rfc:4960|RFC 4960]], 2000) is the better transport on paper: multi-streaming, multi-homing, message-oriented. [[sctp|SCTP]] cannot traverse the public internet. Middleboxes drop unknown protocol numbers; [[sctp|SCTP]] packets between Internet endpoints disappear within milliseconds.

[[quic|QUIC]]'s designers had watched [[sctp|SCTP]] die in production for fifteen years. They picked [[udp|UDP]] — a protocol every {{nat|NAT}}, {{firewall|firewall}}, and middlebox already had to forward unchanged — and accepted the cost of putting a fully-encrypted reliable transport inside it. The cost was real (every byte of a [[quic|QUIC]] packet is processed in user space; the kernel sees only opaque [[udp|UDP]]) but the benefit was deployment.

This is the structural lesson of the late-2010s protocol-design era: **{{encryption|encryption}} is what keeps a protocol evolvable, and [[udp|UDP]] is what makes encryption deployable**. Anything not encrypted gets ossified by middlebox inspection within a decade. Anything not on [[udp|UDP]] cannot traverse the deployed internet. Future transports — multipath [[quic|QUIC]], [[rtp|RTP]]-over-[[quic|QUIC]], MoQ — all sit inside the same envelope for the same reasons.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Google_Data_Center%2C_The_Dalles.jpg/500px-Google_Data_Center%2C_The_Dalles.jpg',
							alt: 'Google data center in The Dalles, Oregon — where the gQUIC traffic was first deployed.',
							caption:
								'Google\'s data center in **The Dalles, Oregon**. By 2014, every connection to *chrome.com* / *youtube.com* from a Chrome client was speaking experimental gQUIC over [[udp|UDP]] to one of these buildings. The fleet of users plus the fleet of servers is what gave Google the leverage to design a new transport — and the leverage to *iterate* on it monthly instead of waiting decades for kernel rollouts.',
							credit: 'Photo: Tony Webster, CC BY 2.0, via Wikimedia Commons'
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
			synopsis: '[[mcp|MCP]], [[a2a|A2A]], and the first new application layer in fifteen years.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Protocol Layer Designed for Software That Reasons',
							text: `For fifteen years after [[websockets|WebSockets]] (2011), the application layer of the internet was settled. [[http1|HTTP]] (in three versions), [[grpc|gRPC]] for service-to-service RPC, [[graphql|GraphQL]] when you needed a flexible query model, and a long tail of older protocols ([[smtp|SMTP]], [[imap|IMAP]], [[xmpp|XMPP]], [[mqtt|MQTT]]) holding their niches. Nothing genuinely new happened at L7 between 2011 and 2024.

In November 2024, Anthropic published the **Model Context Protocol** — [[mcp|MCP]]. The premise was simple: AI coding assistants and chat agents needed a standard way to talk to tools (file systems, databases, APIs, internal systems) without each pair re-inventing the integration. Within a year, [[mcp|MCP]] had streaming HTTP transport ([[frontier:mcp-streamable-http|MCP-streamable-HTTP]]), thousands of [[mcp|MCP]] servers in the registry, and first-class support across major model providers.

In April 2025, Google followed with **Agent2Agent Protocol** — [[a2a|A2A]] — for agent-to-agent collaboration: capability discovery, task delegation, asynchronous event streams. [[a2a|A2A]] moved into the [[frontier:a2a-linux-foundation|Linux Foundation]] in mid-2025.

These protocols are recognisably **internet**. They run over [[http3|HTTP/3]]. They use [[json-rpc|JSON-RPC]] for message framing. They lean on [[oauth2|OAuth 2.1]] for authentication. They are built by treating "an autonomous program that reasons" as a first-class network participant — the way the original web treated "a document on another machine" as a first-class participant. Whether they last, or get replaced by something better in five years, is the open question of the moment.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Model_Context_Protocol_Component_diagram.svg',
							alt: 'The Model Context Protocol component diagram — Host, Client, Server, and Tools.',
							caption:
								'The **[[mcp|Model Context Protocol]]** component model. A Host runs one or more Clients; each Client connects to one Server; each Server exposes some combination of **Tools** (functions the agent can call), **Resources** (data the agent can read), and **Prompts** (templates the agent can invoke). Anthropic published the spec in November 2024; by 2026 every major AI host (Claude, ChatGPT, Cursor, Windsurf) speaks it and thousands of servers exist in the registry. The first genuinely new L7 protocol since [[websockets|WebSockets]] in 2011.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
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
