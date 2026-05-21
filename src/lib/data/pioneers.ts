/**
 * Pioneers — the people who shaped the protocols.
 *
 * Today the same names live (often duplicated) inside individual
 * category-stories/*.ts files. This is the canonical registry — each
 * pioneer entry can be referenced from many stories, protocols, and
 * outages. A `PioneerLink` component will render compact cards that
 * link to a `/pioneer/[id]` page where the full bio is available.
 *
 * Pulled from §2 of the category research files (the architects of the
 * field, beyond individual protocol authors).
 */

import type { SourceLink } from './types';

export interface PioneerAward {
	name: string;
	year?: number;
	url?: string;
}

export interface PioneerQuote {
	text: string;
	source?: SourceLink;
}

export interface Pioneer {
	id: string;
	name: string;
	/** Birth–death years, e.g., "1943–" or "1943–2024". */
	years: string;
	/** Primary title, e.g., "Co-inventor of TCP/IP". */
	title?: string;
	/** Primary affiliation. */
	org?: string;
	/** 1–2 paragraphs on contributions. */
	contribution: string;
	imagePath?: string;
	/** Protocol IDs this person shaped. */
	protocols?: string[];
	/** Category IDs this person shaped. */
	categories?: string[];
	awards?: PioneerAward[];
	links?: { wikipedia?: string; homepage?: string; awards?: string };
	quotes?: PioneerQuote[];
}

export const pioneers: Pioneer[] = [
	{
		id: 'vint-cerf',
		name: 'Vint Cerf',
		years: '1943–',
		title: 'Co-inventor of TCP/IP',
		org: 'Stanford / DARPA / Google',
		contribution: `Designed the [[tcp|TCP]]/[[ip|IP]] protocol suite alongside Bob Kahn, co-authoring the foundational 1974 paper "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications. The paper coined the word "internet" for "internetworking of networks" and described a single Transmission Control Program — what would later split into [[tcp|TCP]] and [[ip|IP]] — for connecting heterogeneous packet-switched networks.

Edited or co-edited many of the early [[tcp|TCP]] RFCs at Stanford with Yogen Dalal and Carl Sunshine, including RFC 675 (December 1974, the first detailed [[tcp|TCP]] specification). Continues to evangelise the internet as Google's Chief Internet Evangelist.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg/330px-Dr_Vint_Cerf_ForMemRS_%28cropped%29.jpg',
		protocols: ['tcp', 'udp', 'ip', 'ipv6', 'icmp'],
		categories: ['transport', 'network-foundations'],
		awards: [
			{ name: 'ACM Turing Award', year: 2004 },
			{ name: 'Presidential Medal of Freedom', year: 2005 },
			{ name: 'IEEE Alexander Graham Bell Medal' }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Vint_Cerf'
		}
	},
	{
		id: 'bob-kahn',
		name: 'Bob Kahn',
		years: '1938–',
		title: 'Co-inventor of TCP/IP',
		org: 'DARPA / BBN',
		contribution: `Conceived the idea of open-architecture networking while managing the {{arpanet|ARPANET}} project at {{darpa|DARPA}}, then in late 1972 started sketching how to interconnect packet-switched networks that did not look like the {{arpanet|ARPANET}} — radio nets, satellite nets, eventually Ethernets. Recruited Vint Cerf to collaborate on what became [[tcp|TCP]]/[[ip|IP]].

Designed the protocols at the gateways (now called routers), the original architecture of the Internet — including the principles of best-effort delivery, end-to-end reliability at the hosts, and gateways that hide L2 differences from the endpoints. Founded the Corporation for National Research Initiatives in 1986.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Bob_Kahn.jpg/330px-Bob_Kahn.jpg',
		protocols: ['tcp', 'ip', 'ipv6'],
		categories: ['transport', 'network-foundations'],
		awards: [
			{ name: 'ACM Turing Award', year: 2004 },
			{ name: 'Presidential Medal of Freedom', year: 2005 },
			{ name: 'National Medal of Technology', year: 1997 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Bob_Kahn'
		}
	},
	{
		id: 'jon-postel',
		name: 'Jon Postel',
		years: '1943–1998',
		title: 'RFC Editor & Protocol Architect',
		org: 'USC Information Sciences Institute',
		contribution: `Edited the foundational [[tcp|TCP]]/[[ip|IP]] RFCs — RFC 791 ([[ip|IPv4]], September 1981), RFC 792 ([[icmp|ICMP]]), RFC 793 ([[tcp|TCP]]), RFC 768 ([[udp|UDP]], August 1980 — three pages, the most spartan and durable spec in networking) — and served as the RFC Editor for nearly three decades, shaping the standards process that governs the internet to this day.

Argued (with David Reed) for splitting the original monolithic [[tcp|TCP]] into [[ip|IP]] plus a separate transport layer in 1978, the architectural decision that made [[udp|UDP]] and decades later [[quic|QUIC]] possible. The first {{iana|IANA}}'s first steward. The "Robustness Principle" — be conservative in what you send, be liberal in what you accept — appeared in his RFC 760 introduction and entered the cultural canon.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg',
		protocols: ['tcp', 'udp', 'ip', 'icmp', 'dns', 'smtp'],
		categories: ['transport', 'network-foundations', 'utilities'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2012 },
			{ name: 'IEEE Internet Award', year: 1999 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jon_Postel'
		},
		quotes: [
			{
				text: 'Be conservative in what you send, be liberal in what you accept.',
				source: { url: 'https://en.wikipedia.org/wiki/Robustness_principle', label: "Postel's Law" }
			}
		]
	},
	{
		id: 'bob-metcalfe',
		name: 'Bob Metcalfe',
		years: '1946–',
		title: 'Inventor of Ethernet',
		org: 'Xerox PARC / 3Com',
		contribution: `Built the first 2.94 Mbps [[ethernet|Ethernet]] in 1973 at {{xerox-parc|Xerox PARC}} with David Boggs to connect Alto workstations to laser printers. Co-authored the seminal "[[ethernet|Ethernet]]: Distributed Packet Switching for Local Computer Networks" in *Communications of the ACM*, July 1976. Co-authored the DIX (Digital/Intel/Xerox) [[ethernet|Ethernet]] specification in 1980, which IEEE 802.3 ratified in 1983.

Founded 3Com in 1979 to commercialize [[ethernet|Ethernet]]. Today, four decades later, every wired network on the planet from your home router to a 800 Gbps AI training cluster runs [[ethernet|Ethernet]] at the link layer.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/With_Bob_Metcalfe_%28cropped%29.jpg/330px-With_Bob_Metcalfe_%28cropped%29.jpg',
		protocols: ['ethernet'],
		categories: ['network-foundations'],
		awards: [
			{ name: 'ACM Turing Award', year: 2022 },
			{ name: 'IEEE Medal of Honor', year: 1996 },
			{ name: 'National Medal of Technology', year: 2003 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Robert_Metcalfe',
			awards: 'https://awards.acm.org/award-recipients/metcalfe_3968158'
		}
	},
	{
		id: 'david-boggs',
		name: 'David Boggs',
		years: '1950–2022',
		title: 'Co-inventor of Ethernet',
		org: 'Xerox PARC / DEC',
		contribution: `Co-invented [[ethernet|Ethernet]] at {{xerox-parc|Xerox PARC}} with Bob Metcalfe in 1973, building the original 2.94 Mbps coaxial-cable system that connected Alto workstations. Designed and built much of the original PARC [[ethernet|Ethernet]] hardware. Co-authored the 1976 CACM paper that introduced [[ethernet|Ethernet]] to the world. Later developed the PARC Universal Packet (PUP) architecture and worked at DEC on early routing systems.`,
		protocols: ['ethernet'],
		categories: ['network-foundations'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/David_Boggs'
		}
	},
	{
		id: 'radia-perlman',
		name: 'Radia Perlman',
		years: '1951–',
		title: 'Inventor of Spanning Tree Protocol',
		org: 'Digital Equipment Corporation / Sun / Intel',
		contribution: `Invented the Spanning Tree Protocol (IEEE 802.1D, 1985), which made redundant [[ethernet|Ethernet]] topologies possible by automatically discovering and disabling loops without operator intervention. Without STP, every backbone [[ethernet|Ethernet]] network in the world would broadcast-storm itself to death. Later designed TRILL (Transparent Interconnection of Lots of Links) and contributed to the IS-IS routing protocol.

Holds over 100 patents. Often called the "Mother of the Internet" for the loop-prevention work that made every multi-switch [[ethernet|Ethernet]] network possible. Wrote the textbook *Interconnections: Bridges, Routers, Switches and Internetworking Protocols*, the gold standard on bridging vs routing.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Radia_Perlman_2009.jpg/330px-Radia_Perlman_2009.jpg',
		protocols: ['ethernet', 'ospf'],
		categories: ['network-foundations'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2014 },
			{ name: 'SIGCOMM Award', year: 2010 },
			{ name: 'USENIX Lifetime Achievement Award', year: 2007 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Radia_Perlman'
		},
		quotes: [
			{
				text: 'I think that I shall never see / A graph more lovely than a tree.',
				source: {
					url: 'https://courses.cs.washington.edu/courses/cse461/14sp/lectures/spanningtreepoem.txt',
					label: '"Algorhyme" — included in the Spanning Tree Protocol patent'
				}
			}
		]
	},
	{
		id: 'paul-mockapetris',
		name: 'Paul Mockapetris',
		years: '1948–',
		title: 'Inventor of DNS',
		org: 'USC Information Sciences Institute',
		contribution: `Designed the Domain Name System in 1983 (RFC 882/883, later RFC 1034/1035, 1987) to replace the single HOSTS.TXT file that had been the entire internet's name lookup table since the {{arpanet|ARPANET}} days. The hierarchical, distributed, cacheable [[dns|DNS]] architecture scaled the internet from a few hundred hosts to billions.

Without [[dns|DNS]], every device would still be looking up addresses in a single text file someone updated by hand. Continues to advise on naming, anti-abuse, and [[dns|DNS]] security through ThreatSTOP and the {{ietf|IETF}}.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Paul_Mockapetris.JPG/330px-Paul_Mockapetris.JPG',
		protocols: ['dns'],
		categories: ['network-foundations'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2012 },
			{ name: 'IEEE Internet Award', year: 2003 },
			{ name: 'ACM SIGCOMM Award', year: 2005 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Paul_Mockapetris'
		}
	},
	{
		id: 'tim-berners-lee',
		name: 'Tim Berners-Lee',
		years: '1955–',
		title: 'Inventor of the World Wide Web',
		org: 'CERN / W3C / MIT',
		contribution: `Created HTTP, HTML, and URLs at CERN in 1989-1991 — the three pillars of the web. Built the first web browser and editor (WorldWideWeb) and the first web server (CERN httpd) on a NeXT cube; the first website went live by Christmas 1990. CERN released the technology royalty-free on 30 April 1993.

Founded the {{w3c|World Wide Web Consortium}} ({{w3c|W3C}}) in 1994 and continues to direct it from MIT. The 60-second narrated hook of internet history is "Vint Cerf made the network of networks; Tim Berners-Lee made the application that turned it into something every human uses."`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LS3_4919_%28cropped%29.jpg/330px-LS3_4919_%28cropped%29.jpg',
		protocols: ['http1', 'http2', 'http3'],
		categories: ['web-api'],
		awards: [
			{ name: 'ACM Turing Award', year: 2016 },
			{ name: 'Order of Merit', year: 2007 },
			{ name: 'Knight Commander', year: 2004 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Tim_Berners-Lee'
		}
	},
	{
		id: 'roy-fielding',
		name: 'Roy Fielding',
		years: '1965–',
		title: 'Architect of HTTP/1.1 & REST',
		org: 'UC Irvine / Apache Software Foundation',
		contribution: `Co-authored the [[http1|HTTP/1.1]] specification (RFC 2068 / RFC 2616), the protocol that ran the web for two decades. Defined [[rest|REST]] in his 2000 doctoral dissertation *Architectural Styles and the Design of Network-Based Software Architectures* — six constraints (client-server, stateless, cacheable, layered, uniform interface, optional code-on-demand) that came to define the dominant style of public APIs.

Co-founded the Apache HTTP Server Project and chaired the Apache Software Foundation. The vast majority of "[[rest|REST]] APIs" are not RESTful in Fielding's strict sense (they fail his "hypermedia as the engine of application state" — HATEOAS — constraint), which has been a quiet source of his frustration for 25 years.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Roy_Fielding_%28cropped%29.jpg/330px-Roy_Fielding_%28cropped%29.jpg',
		protocols: ['http1', 'rest'],
		categories: ['web-api'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Roy_Fielding',
			homepage: 'https://roy.gbiv.com/'
		}
	},
	{
		id: 'yakov-rekhter',
		name: 'Yakov Rekhter',
		years: 'c. 1950–',
		title: 'Co-creator of BGP',
		org: 'IBM / Cisco / Juniper Networks',
		contribution: `Co-created the Border Gateway Protocol with Kirk Lougheed at the 12th {{ietf|IETF}} meeting in Austin, Texas in January 1989 — sketched on three sheets of paper at lunch (the famous "two-napkin protocol"). Published as RFC 1105 in June 1989; the current standard is RFC 4271 (2006), still authored by Rekhter et al.

[[bgp|BGP]] runs every transit and peering relationship on the public internet today, carrying ~975K [[ip|IPv4]] and ~225K [[ipv6|IPv6]] prefixes globally as of January 2026. Rekhter has shaped or co-authored most of the [[bgp|BGP]] extensions in use, including [[bgp|BGP]]-MPLS VPNs (RFC 4364) and many EVPN drafts. The internet runs on a protocol he sketched on three napkins.`,
		protocols: ['bgp'],
		categories: ['network-foundations'],
		awards: [{ name: 'IEEE Internet Award', year: 2014 }],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Yakov_Rekhter'
		}
	},
	{
		id: 'steve-deering',
		name: 'Steve Deering',
		years: '1951–',
		title: 'Architect of IPv6 & IP Multicast',
		org: 'Xerox PARC / Cisco',
		contribution: `Invented [[ip|IP]] multicast in his 1991 Stanford PhD thesis (Internet Group Management Protocol, IGMP), enabling efficient one-to-many communication that powers IPTV, financial market data feeds, and intra-DC pub/sub today.

Primary architect of [[ipv6|IPv6]] with Bob Hinden — RFC 1883 (1995), RFC 2460 (1998), and the current RFC 8200 (2017, Internet Standard 86). Designed the simplified 40-byte header, the extension-header chain, the link-local addressing, and the no-in-network-fragmentation rule. On 28 March 2026, [[ipv6|IPv6]] carried 50.1% of Google's traffic for the first time — 28 years after his spec.`,
		protocols: ['ipv6'],
		categories: ['network-foundations'],
		awards: [{ name: 'IEEE Internet Award', year: 2010 }],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Steve_Deering'
		}
	},
	{
		id: 'van-jacobson',
		name: 'Van Jacobson',
		years: '1950–',
		title: 'Father of TCP Congestion Control',
		org: 'Lawrence Berkeley Lab / Cisco / PARC / Google',
		contribution: `Saved the internet from congestion collapse. After the October 1986 collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley dropped from 32 kbps to 40 bps — Jacobson and Mike Karels published "{{congestion-avoidance|Congestion Avoidance}} and Control" (SIGCOMM '88), introducing {{slow-start|slow start}}, {{aimd|AIMD}} {{congestion-avoidance|congestion avoidance}}, fast retransmit, and exponential RTO backoff. Six algorithms in one paper; arguably the highest-leverage networking paper ever written. Their fixes shipped in 4.3BSD-Tahoe and saved the internet.

Also wrote traceroute, tcpdump's BPF (Berkeley Packet Filter), and co-authored RFC 1144 (Compressing [[tcp|TCP]]/[[ip|IP]] Headers for Low-Speed Serial Links). Co-author of the 2016 {{bbr|BBR}} paper at Google — {{congestion-control|congestion control}} for a second internet generation, replacing {{cubic|CUBIC}} for google.com and YouTube traffic.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg',
		protocols: ['tcp'],
		categories: ['transport'],
		awards: [
			{ name: 'IEEE Internet Award', year: 2003 },
			{ name: 'ACM SIGCOMM Award', year: 2001 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Van_Jacobson'
		}
	},
	{
		id: 'david-mills',
		name: 'David L. Mills',
		years: '1938–2024',
		title: 'Inventor of NTP',
		org: 'University of Delaware / COMSAT Labs',
		contribution: `Designed the Network Time Protocol ([[ntp|NTP]], RFC 958/1119/1305/5905) in 1981 and refined it for over four decades. [[ntp|NTP]] synchronises computers across the public internet to within milliseconds despite arbitrary network jitter — the Marzullo's algorithm + clock-discipline pair he chose has held up since the 1980s.

Also built the early NSFNET "Fuzzball" routers and gateway algorithms that ran the original NSFNET backbone. His clock-discipline mathematics underpins every other clock-sync protocol since (PTP, GPSDOs, etc.). Without [[ntp|NTP]] — and Mills's 40 years of careful stewardship — every [[tls|TLS]] certificate validation, every Kerberos ticket, every distributed log timestamp would be unreliable.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/DL_Mills-2_%28cropped%29.jpg/330px-DL_Mills-2_%28cropped%29.jpg',
		protocols: ['ntp'],
		categories: ['utilities'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2013 },
			{ name: 'IEEE Internet Award', year: 2013 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/David_L._Mills'
		}
	},
	{
		id: 'mike-belshe',
		name: 'Mike Belshe',
		years: 'c. 1970–',
		title: 'Co-creator of SPDY (→ HTTP/2)',
		org: 'Google / BitGo',
		contribution: `Co-created SPDY at Google in 2009 with Roberto Peon — the experimental binary, multiplexed, header-compressed transport that proved [[http1|HTTP/1.1]]'s {{head-of-line-blocking|head-of-line blocking}} and one-request-per-connection model could be replaced. Within a year SPDY shipped in Chrome (2010); the {{ietf|IETF}} httpbis WG started [[http2|HTTP/2]] in 2012 using SPDY/2 as the base; [[http2|HTTP/2]] published as RFC 7540 in May 2015.

Once [[http2|HTTP/2]] was on track, Google deprecated SPDY in Chrome — a textbook example of "ship a thing, prove it works, hand it to the standards body, retire your version." Now CEO of BitGo (cryptocurrency custody).`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mike_Belshe_SALT_Conference.jpg/330px-Mike_Belshe_SALT_Conference.jpg',
		protocols: ['http2'],
		categories: ['web-api'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Mike_Belshe'
		}
	},
	{
		id: 'jim-roskind',
		name: 'Jim Roskind',
		years: 'c. 1950–',
		title: 'Architect of QUIC',
		org: 'Google',
		contribution: `Designed and championed [[quic|QUIC]] at Google starting around 2012 (originally "Quick [[udp|UDP]] Internet Connections"). The premise: [[udp|UDP]] passes through every middlebox; layer reliability + multiplexing + crypto on top of it in user space; iterate as a browser update instead of a kernel upgrade.

Google deployed gQUIC in production from 2013 onwards. The {{ietf|IETF}} [[quic|QUIC]] working group chartered in 2016 and shipped RFC 9000 in May 2021 — substantially redesigned from gQUIC but recognisable as the same architecture. [[http3|HTTP/3]] (RFC 9114, June 2022) made [[quic|QUIC]] the default modern transport for the web. By 2025, ~35% of the top 10M sites support [[http3|HTTP/3]] and Meta reports >75% of its traffic on [[quic|QUIC]].`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Jim_Roskind_2016.jpg/330px-Jim_Roskind_2016.jpg',
		protocols: ['quic', 'http3'],
		categories: ['transport', 'web-api'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jim_Roskind'
		}
	},
	{
		id: 'eric-rescorla',
		name: 'Eric Rescorla',
		years: 'c. 1968–',
		title: 'Editor of TLS 1.3',
		org: 'Mozilla / Windy Hill Systems',
		contribution: `Edited [[tls|TLS]] 1.3 (RFC 8446, August 2018) — a five-year, 28-draft redesign that dropped insecure cipher suites, fused the handshake to one round-trip, and made {{aead|AEAD}} mandatory. Designed the middlebox-compatibility hacks (legacy_version field, fake ChangeCipherSpec) that let [[tls|TLS]] 1.3 deploy on the open internet despite ~3% of middleboxes parsing the version field.

Author of *SSL and [[tls|TLS]]: Designing and Building Secure Systems* (2000), the standard practitioner's text. Continues to chair {{ietf|IETF}} working groups on [[tls|TLS]], [[oauth2|OAuth]], and encrypted [[dns|DNS]]. The reason your browser's HTTPS handshake takes one round-trip in 2026 instead of two.`,
		protocols: ['tls'],
		categories: ['utilities'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Eric_Rescorla'
		}
	},
	{
		id: 'david-clark',
		name: 'David D. Clark',
		years: '1944–',
		title: 'Architect of the Internet & IETF Philosopher',
		org: 'MIT CSAIL',
		contribution: `Chief Protocol Architect of the Internet from 1981 to 1989, when most of the architectural decisions that shape the internet today were made: the end-to-end principle, the four-layer model, the separation of mechanism from policy. Continues at MIT CSAIL.

Distilled the {{ietf|IETF}}'s working culture into the sentence that decided the OSI vs [[tcp|TCP]]/[[ip|IP]] standards war at {{ietf|IETF}} 24 in Cambridge, MA in July 1992: "We reject: kings, presidents and voting. We believe in: rough consensus and running code." That single quote is the closest thing the {{ietf|IETF}} has to a national anthem.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/David_D_Clark_in_office_%28cropped%29.jpg/330px-David_D_Clark_in_office_%28cropped%29.jpg',
		protocols: ['tcp', 'ip'],
		categories: ['transport', 'network-foundations'],
		awards: [{ name: 'IEEE Internet Award', year: 1990 }],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/David_D._Clark'
		},
		quotes: [
			{
				text: 'We reject: kings, presidents and voting. We believe in: rough consensus and running code.',
				source: {
					url: 'https://groups.csail.mit.edu/ana/People/DDC/future_ietf_92.pdf',
					label: '"A Cloudy Crystal Ball" — IETF 24, July 1992'
				}
			}
		]
	},
	{
		id: 'taher-elgamal',
		name: 'Taher Elgamal',
		years: '1955–',
		title: 'Designer of SSL',
		org: 'Netscape / Salesforce / Axway',
		contribution: `Designed SSL (Secure Sockets Layer) at Netscape in 1994-1996 — the protocol that made encrypted commerce on the open web possible and seeded what later became [[tls|TLS]]. SSL 3.0 (1996) was the version that POODLE eventually killed; the {{ietf|IETF}} took it over as [[tls|TLS]] 1.0 in RFC 2246 (January 1999) after a Microsoft/Netscape standards horsetrade.

Also invented the Elgamal encryption algorithm (1985), one of the earliest practical public-key schemes, which underpins {{diffie-hellman|Diffie-Hellman key exchange}} and DSA signatures. Often called the "Father of SSL."`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Taher_Elgamal_it-sa_2010.jpg/330px-Taher_Elgamal_it-sa_2010.jpg',
		protocols: ['tls'],
		categories: ['utilities'],
		awards: [
			{ name: 'RSA Lifetime Achievement Award', year: 2009 },
			{ name: 'Internet Hall of Fame', year: 2024 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Taher_Elgamal'
		}
	},
	{
		id: 'henning-schulzrinne',
		name: 'Henning Schulzrinne',
		years: '1959–',
		title: 'Author of RTP, RTCP, RTSP, SIP, SDP',
		org: 'Columbia University / FCC',
		contribution: `Authored or co-authored the protocols that carry essentially all real-time interactive media on the internet. **[[rtp|RTP]]** and **RTCP** ([[rfc:3550|RFC 3550]], 2003 — original RFC 1889 in 1996) are the transport for streaming audio and video; **RTSP** (RFC 2326, 1998; updated as RFC 7826, 2016) is the control plane; **[[sip|SIP]]** ([[rfc:3261|RFC 3261]], 2002) is the signalling protocol that the entire {{voip|VoIP}} industry runs on; **[[sdp|SDP]]** (RFC 4566, 2006) is the session-description format [[sip|SIP]] and [[webrtc|WebRTC]] both use to negotiate {{codec|codecs}} and media endpoints.

A Columbia University professor since 1996, Schulzrinne has authored more than 70 RFCs across two decades — one of the most prolific contributors in the {{ietf|IETF}}'s history. Served as the {{fcc|FCC}}'s Chief Technology Officer three separate times (2012–2014, 2017, 2024). Inducted into the Internet Hall of Fame in 2013.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg/330px-SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg',
		protocols: ['rtp', 'sip', 'sdp', 'webrtc'],
		categories: ['realtime-av'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2013 },
			{ name: 'IEEE Internet Award', year: 2016 },
			{ name: 'ACM SIGCOMM Award', year: 2020 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Henning_Schulzrinne',
			homepage: 'https://www.cs.columbia.edu/~hgs/'
		}
	},
	{
		id: 'ian-hickson',
		name: 'Ian Hickson',
		years: 'c. 1980–',
		title: 'Editor of HTML5 & WebSocket',
		org: 'Opera / Google / WHATWG',
		contribution: `Edited the HTML5 specification at the WHATWG from 2004, single-handedly turning the failed XHTML 2 path into a living standard the entire web platform now depends on. Also edited [[sse|Server-Sent Events]] (first shipped in Opera in September 2006 as part of "Web Applications 1.0") and coined "[[websockets|WebSocket]]" in #whatwg IRC. [[websockets|WebSocket]] finalised as RFC 6455 in December 2011 under Ian Fette.

The amount of detailed specification work shipped under his name across two decades is exceptional even by {{ietf|IETF}}/{{w3c|W3C}} standards.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/120px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg',
		protocols: ['websockets', 'sse'],
		categories: ['web-api'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Ian_Hickson',
			homepage: 'https://hixie.ch/'
		}
	},
	{
		id: 'jonathan-rosenberg',
		name: 'Jonathan Rosenberg',
		years: '1968–',
		title: 'Architect of SIP, STUN, TURN, and ICE',
		org: 'Five9 (CTO / Head of AI), formerly Cisco, Skype, dynamicsoft',
		contribution: `One of the most prolific RFC authors in the IETF's history — public counts range from 56 to 71 RFCs depending on year and source, consistently in the top 10. As principal or co-author of [[sip|SIP]] itself ([[rfc:8445|RFC 3261]]), SDP offer/answer (RFC 3264), and **every** revision of [[rfc:8489|STUN]] (3489 / 5389 / 8489), [[rfc:8656|TURN]] (5766 / 8656), and [[rfc:8445|ICE]] (5245 / 8445), [[pioneer:jonathan-rosenberg|Rosenberg]] is the architect of the entire modern [[nat-traversal|NAT-traversal]] stack.

MIT BS/MS, Columbia PhD; Lucent (1993–99), CTO of dynamicsoft until Cisco acquired it (2004), Cisco Fellow, Chief Technology Strategist at Skype (2009–13), VP/CTO Collaboration at Cisco (2013–18), and since January 2019 CTO and Head of AI at Five9. Pulver VoN Pioneer Award (2000); MIT TR35 (2002).`,
		protocols: ['nat-traversal', 'sip', 'sdp', 'webrtc'],
		categories: ['utilities', 'realtime-av'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jonathan_Rosenberg_(engineer)',
			homepage: 'https://www.jdrosen.net/'
		}
	},
	{
		id: 'bryan-ford',
		name: 'Bryan Ford',
		years: '1973–',
		title: 'NAT-traversal academic anchor; P2P researcher',
		org: 'EPFL DEDIS Lab (faculty); previously Yale',
		contribution: `MIT PhD; faculty at Yale, now at EPFL. His 2005 USENIX ATC paper with Pyda Srisuresh and Dan Kegel — *"Peer-to-Peer Communication Across Network Address Translators"* — is *the* canonical academic [[nat-traversal|NAT-traversal]] reference, with the famous **82% UDP / 64% TCP hole-punching** success numbers that destroyed the four-flavours NAT model. His follow-up STUNT toolkit extended hole-punching to [[tcp|TCP]]. Co-author with [[pioneer:saikat-guha|Saikat Guha]] of RFC 5128 (*State of P2P Communication across NATs*, 2008) and RFC 5382 (TCP NAT behavioural requirements).

Now leads DEDIS (Decentralized/Distributed Systems lab) at EPFL, working on scalable byzantine-fault-tolerant systems and privacy-preserving protocols.`,
		protocols: ['nat-traversal'],
		categories: ['utilities'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Bryan_Ford_(computer_scientist)',
			homepage: 'https://bford.info/'
		}
	},
	{
		id: 'saikat-guha',
		name: 'Saikat Guha',
		years: '1979–',
		title: 'NAT measurement pioneer',
		org: 'Microsoft Research India',
		contribution: `Cornell PhD (advisor Paul Francis). His 2005 IMC paper with Francis — *"Characterization and Measurement of TCP Traversal Through NATs and Firewalls"* — and the follow-up NUTSS papers established what NATs *actually do* on the wire, not what the RFCs assumed. Co-author of RFC 5382 (NAT Behavioural Requirements for TCP, 2008) with [[pioneer:bryan-ford|Bryan Ford]] and Pyda Srisuresh.

Subsequent work spans enterprise network measurement (IMC 2008), online advertising privacy, and ISP traffic differentiation (NSDI 2010's *Glasnost* tool). Now at Microsoft Research, leading work on responsible AI and large-scale system measurement.`,
		protocols: ['nat-traversal'],
		categories: ['utilities'],
		links: {
			homepage: 'https://www.microsoft.com/en-us/research/people/saikat/'
		}
	},
	{
		id: 'justin-uberti',
		name: 'Justin Uberti',
		years: '1975–',
		title: 'Architect of WebRTC and modern voice/video infrastructure',
		org: 'OpenAI (Head of Real-Time AI, from Nov 2024); formerly Google, Fixie',
		contribution: `Distinguished Engineer at Google for over a decade, leading the WebRTC architecture behind Google Meet, Duo, Stadia, and the open-source libwebrtc (which grew to ~1.21M lines of code under his watch, roughly 3× the Space Shuttle flight software). Co-author of [[rfc:8445|RFC 8838]] (Trickle ICE) and RFC 8863 (ICE-PAC), and the public face of WebRTC at IETF, Google I/O, and Kranky Geek for years.

Before Google: AOL Instant Messenger and the early AIM/AOL real-time media stack. After Google: CTO of Fixie / Ultravox, building real-time voice agents. Joined OpenAI on **25 November 2024** to lead Real-Time AI — the move that signalled [[nat-traversal|NAT traversal]] is now load-bearing for low-latency voice agents, not just video calls.`,
		protocols: ['nat-traversal', 'webrtc', 'rtp'],
		categories: ['utilities', 'realtime-av'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Justin_Uberti',
			homepage: 'https://x.com/juberti'
		}
	},
	{
		id: 'john-moy',
		name: 'John T. Moy',
		years: '1955–',
		title: 'Principal architect of OSPF',
		org: 'Proteon → Cascade → Ascend → Lucent → Sycamore Networks (Corporate Fellow)',
		contribution: `Principal architect of [[ospf|OSPF]]. B.S. in mathematics from the University of Minnesota; M.A. in mathematics from Princeton. Began designing router software at Bolt Beranek and Newman (BBN). At Proteon Inc. in Westborough, MA (1987–89) he wrote both the [[ospf|OSPF]] specification (RFC 1131, 1989) and one of the first [[ospf|OSPF]] implementations. Chaired the IETF [[ospf|OSPF]] Working Group and the MOSPF Working Group through the late 1980s and 1990s.

After Proteon: Cascade Communications, then Ascend Communications (where he was Senior Consulting Engineer when [[rfc:2328|RFC 2328]] — STD 54, the canonical [[ospf|OSPFv2]] spec — was published in April 1998), then to Lucent Technologies via Lucent's 1999 acquisition of Ascend, then to Sycamore Networks as a Corporate Fellow.

Author of two definitive books: *[[ospf|OSPF]]: Anatomy of an Internet Routing Protocol* (Addison-Wesley, 1998) and *[[ospf|OSPF]] Complete Implementation* (Addison-Wesley, 2000) — the latter publishes a working C++ [[ospf|OSPF]] speaker as part of the book.`,
		protocols: ['ospf'],
		categories: ['network-foundations'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/John_Moy'
		}
	},
	{
		id: 'edsger-dijkstra',
		name: 'Edsger W. Dijkstra',
		years: '1930–2002',
		title: 'Inventor of the shortest-path-first algorithm',
		org: 'Mathematisch Centrum (Amsterdam) → Eindhoven University → Burroughs → UT Austin',
		contribution: `Dutch computer scientist whose **shortest-path-first algorithm**, designed in 1956 at a café table in Amsterdam, is the computational core every [[ospf|OSPF]] router runs every time the topology changes. Published in 1959 as "A note on two problems in connexion with graphs," *Numerische Mathematik* 1:269–271 — a three-page paper that didn't even name the algorithm.

Awarded the **ACM Turing Award in 1972** "for fundamental contributions to programming as a high, intellectual challenge; for eloquent insistence and practical demonstration that programs should be composed correctly, not just debugged into correctness." Also authored the celebrated "GOTO Considered Harmful" letter (CACM 11(3), 1968), the THE operating system, semaphores, guarded commands, structured programming. At UT Austin from 1984 until his death on 6 August 2002.

His work is the substrate of *every* link-state routing protocol: [[ospf|OSPF]], IS-IS, PNNI, even modern Flex-Algo planes still run Dijkstra under the hood.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Edsger_Wybe_Dijkstra.jpg/330px-Edsger_Wybe_Dijkstra.jpg',
		protocols: ['ospf'],
		categories: ['network-foundations'],
		awards: [
			{ name: 'ACM Turing Award', year: 1972 },
			{ name: 'ACM PODC Influential-Paper Award (Dijkstra Prize, 2002–, named for him)' }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Edsger_W._Dijkstra'
		},
		quotes: [
			{
				text: 'Computer science is no more about computers than astronomy is about telescopes.',
				source: {
					url: 'https://en.wikiquote.org/wiki/Edsger_W._Dijkstra',
					label: 'Widely attributed; cf. EWD 1036 and related notes'
				}
			}
		]
	},
	{
		id: 'jaap-haartsen',
		name: 'Jaap Haartsen',
		years: '1963–',
		title: 'Inventor of Bluetooth',
		org: 'Ericsson (Lund) → Plantronics → Sony Mobile (retired)',
		contribution: `Dutch electrical engineer who invented the [[bluetooth|Bluetooth]] radio. Joined Ericsson Mobile Communications in Lund, Sweden in 1991; tasked with replacing the RS-232 cable to a mobile-phone headset. With Sven Mattisson he produced the original frequency-hopping 2.4 GHz radio design between 1994 and 1997 — the foundation of every [[bluetooth|Bluetooth]] chip ever made.

Authored the core technical work that defined the Bluetooth Baseband: piconets, the 1,600-hops-per-second frequency hopping pattern, the master/slave (now Central/Peripheral) topology, BD_ADDR-derived clock alignment, the SCO/eSCO voice links, and ACL data links. Co-architected the SIG founding in May 1998.

European Inventor Award 2015 finalist (Lifetime Achievement) — the EPO citation says he "made wireless communication ubiquitous."`,
		protocols: ['bluetooth'],
		categories: ['wireless'],
		awards: [
			{ name: 'European Inventor Award (Lifetime Achievement finalist)', year: 2015 },
			{ name: 'Eduard Rhein Foundation Technology Award', year: 2009 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jaap_Haartsen'
		},
		quotes: [
			{
				text: 'We were not trying to invent a new wireless standard. We were trying to get rid of a cable.',
				source: {
					url: 'https://www.epo.org/learning/materials/inventors/files/2015-finalists-haartsen.pdf',
					label: 'EPO 2015 Inventor Award finalist profile'
				}
			}
		]
	},
	{
		id: 'sven-mattisson',
		name: 'Sven Mattisson',
		years: '1956–',
		title: 'Co-inventor of Bluetooth',
		org: 'Ericsson Research → Sony Mobile (retired)',
		contribution: `Swedish electrical engineer; collaborator with [[pioneer:jaap-haartsen|Jaap Haartsen]] on the original [[bluetooth|Bluetooth]] radio at Ericsson Lund. Where Haartsen owned the digital baseband design, Mattisson owned the analog RF and CMOS implementation work — the IC-level decisions that made [[bluetooth|Bluetooth]] manufacturable at consumer price points.

Adjunct Professor at Lund University; long-running editor of *IEEE Journal of Solid-State Circuits* contributions on low-power radio design. The 2015 European Inventor Award shortlisting recognised the Haartsen/Mattisson pair as the joint architects.`,
		protocols: ['bluetooth'],
		categories: ['wireless'],
		awards: [{ name: 'European Inventor Award (Lifetime Achievement finalist)', year: 2015 }]
	},
	{
		id: 'jim-kardach',
		name: 'Jim Kardach',
		years: '1958–',
		title: 'Named Bluetooth; SIG founding architect',
		org: 'Intel (retired)',
		contribution: `Intel engineer who proposed the name **Bluetooth** at a 1997 SIG planning meeting — after Harald "Blåtand" Gormsson, the 10th-century Danish king who united Denmark and Norway. Kardach was reading Frans G. Bengtsson's novel *The Long Ships* on a flight and made the analogy: just as Harald united warring tribes, the SIG was trying to unite Ericsson, IBM, Intel, Nokia, and Toshiba behind one wireless standard. The name was supposed to be a placeholder. It stuck.

Beyond the name, Kardach drove much of Intel's early [[bluetooth|Bluetooth]] silicon strategy and was instrumental in landing the May 1998 SIG founding charter. The logo — a bind-rune of Hagall (ᚼ) and Bjarkan (ᛒ) in Younger Futhark — also came out of the original branding work.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Jim_Kardach_Mr_Bluetooh.png/330px-Jim_Kardach_Mr_Bluetooh.png',
		protocols: ['bluetooth'],
		categories: ['wireless'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jim_Kardach'
		},
		quotes: [
			{
				text: 'Bluetooth was originally intended as a placeholder name, until marketing could come up with something better. They never did.',
				source: {
					url: 'https://www.eetimes.com/the-naming-of-a-technology/',
					label: '"The Naming of a Technology" — Kardach in EETimes'
				}
			}
		]
	},
	{
		id: 'phil-karn',
		name: 'Phil Karn',
		years: '1956–',
		title: 'IPsec contributor; "code is speech" plaintiff',
		org: 'Qualcomm (1991–retirement); ARDC President Emeritus',
		contribution: `Engineer at Qualcomm for two decades; contributor to [[ipsec|IPsec]] (acknowledged in RFC 1827, the original ESP spec) and author of the KA9Q [[tcp|TCP]]/[[ip|IP]] stack — one of the first public-domain implementations of the protocol suite. Karn's Algorithm (the TCP RTT estimator that ignores retransmitted segments) is in every TCP stack on Earth.

Plaintiff in *Karn v. U.S. State Department* (1994–1999) — the case where the State Department classified the **printed book** of Bruce Schneier's *Applied Cryptography* as First Amendment-protected speech, but the **floppy disk** with the same code as a regulated munition under ITAR. The case is one of the founding "code is speech" precedents in U.S. law and helped force the 1996 liberalisation of crypto export controls — without which [[ipsec|IPsec]] could not have shipped commercially.`,
		protocols: ['ipsec', 'tcp'],
		categories: ['utilities', 'transport'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Phil_Karn'
		}
	},
	{
		id: 'randall-atkinson',
		name: 'Randall Atkinson',
		years: 'c. 1965–',
		title: 'Original IPsec architect',
		org: 'U.S. Naval Research Laboratory, Information Technology Division',
		contribution: `Lead author of the **first-generation [[ipsec|IPsec]] architecture**: RFC 1825 (Security Architecture for the Internet Protocol), RFC 1826 (AH), and RFC 1827 (ESP), all published in August 1995 from the U.S. Naval Research Lab. Built one of the first interoperable [[ipsec|IPsec]] implementations and shepherded the working-group consensus through the early IETF Security Area.

The 2005 second-generation rewrite ([[rfc:4301|RFC 4301]] / [[rfc:4302|4302]] / [[rfc:4303|4303]]) restructured the architecture but preserved every wire-format decision Atkinson made. His work is the substrate every modern [[ipsec|IPsec]] implementation builds on.`,
		protocols: ['ipsec'],
		categories: ['utilities'],
		links: {
			homepage: 'https://datatracker.ietf.org/doc/rfc1825/'
		}
	},
	{
		id: 'charlie-kaufman',
		name: 'Charlie Kaufman',
		years: 'c. 1955–',
		title: 'Editor of IKEv2',
		org: 'Microsoft (also Lotus, IBM, DEC, Iris Associates)',
		contribution: `Lead editor of **IKEv2** across its full 20-year lifecycle: [[rfc:4306|RFC 4306]] (2005, the original), [[rfc:5996|RFC 5996]] (2010, clarifications), and **[[rfc:7296|RFC 7296]] (2014) — the Internet Standard (STD 79)** that anchors every modern [[ipsec|IPsec]] deployment. Co-author of *Network Security: Private Communication in a Public World* (Prentice Hall, multiple editions) — the textbook that taught a generation how to think about cryptographic protocols.

Career across DEC, Lotus, Iris Associates (Lotus Notes security architecture), IBM, and Microsoft. Pragmatic voice in IETF security debates; the kind of editor whose name on a draft means it actually works in production.`,
		protocols: ['ipsec'],
		categories: ['utilities']
	},
	{
		id: 'tero-kivinen',
		name: 'Tero Kivinen',
		years: 'c. 1970–',
		title: 'IKEv2 long-running editor',
		org: 'SSH Communications Security → AuthenTec → INSIDE Secure (Helsinki)',
		contribution: `The ~20-year IKEv2 editor — co-author of [[rfc:7296|RFC 7296]], [[rfc:7427|RFC 7427]] (signature auth), RFC 7670 (raw public keys), RFC 6467 (secure-password framework), RFC 7815 (minimal IKEv2 initiator). At SSH Communications Security in Helsinki when the original IKEv1 was being designed; stayed with [[ipsec|IPsec]] through every architectural revision.

Kivinen is the engineer who has written down what an [[ipsec|IPsec]] implementation actually does, in normative IETF prose, more times than anyone else alive.`,
		protocols: ['ipsec'],
		categories: ['utilities'],
		links: {
			homepage: 'https://datatracker.ietf.org/person/kivinen@iki.fi'
		}
	},
	{
		id: 'paul-wouters',
		name: 'Paul Wouters',
		years: 'c. 1971–',
		title: 'Libreswan maintainer; IETF Security Area Director',
		org: 'Aiven Senior Security Architect (previously Red Hat)',
		contribution: `Maintainer of **Libreswan**, the descendant of FreeS/WAN → Openswan, shipped in Red Hat Enterprise Linux as the default [[ipsec|IPsec]] stack. Two-term IETF **Security Area Director**, deeply involved in the IPSECME working group, and author of NIST SP 800-77 Rev. 1 (Guide to [[ipsec|IPsec]] VPNs).

If you've used [[ipsec|IPsec]] on Linux in the last decade, you've probably depended on a binary Wouters maintains, an RFC he co-authored, or a NIST guidance document he wrote.`,
		protocols: ['ipsec'],
		categories: ['utilities'],
		links: {
			homepage: 'https://nohats.ca/wordpress/'
		}
	},
	{
		id: 'jason-donenfeld',
		name: 'Jason A. Donenfeld',
		years: 'c. 1989–',
		title: 'Creator of WireGuard',
		org: 'Edge Security (zx2c4.com); Linux kernel developer; Linux RNG maintainer (random.c) since 2022',
		contribution: `Created **[[wireguard|WireGuard]]** as a side project in 2015, frustrated with the architectural sprawl of [[ipsec|IPsec]] and OpenVPN. First public code snapshot 30 June 2016; whitepaper presented at NDSS 2017. The whole Linux kernel module weighs ~4,000 lines of code — versus 100,000+ for OpenVPN's core and the six-figure footprint of strongSwan + Linux XFRM. **Linus Torvalds called it "a work of art" on the LKML in August 2018**; mainlined in Linux 5.6 on 29 March 2020.

Also wrote **Wintun** (Windows TUN driver), **wireguard-nt** (native Windows kernel module), **wireguard-go** (cross-platform userspace reference), and as of 2022 maintains **\`random.c\`** — the Linux kernel's RNG. Funding for the WireGuard work comes from the Open Technology Fund, NLnet, Mullvad, Tailscale, Jump Trading, Fly.io, and Germany's Sovereign Tech Fund (€209,000+ in 2023).

Famously refuses to take [[wireguard|WireGuard]] through the IETF: *"I have a very low opinion of internet standards… [[wireguard|WireGuard]] is one of the first times in my career I've seen something get this much adoption without having to get through the filter of the IETF."*`,
		protocols: ['wireguard'],
		categories: ['utilities'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Jason_A._Donenfeld',
			homepage: 'https://www.zx2c4.com/'
		},
		quotes: [
			{
				text: 'WireGuard can be simply implemented for Linux in less than 4,000 lines of code, making it easily audited and verified.',
				source: {
					url: 'https://www.wireguard.com/papers/wireguard.pdf',
					label: 'WireGuard whitepaper, NDSS 2017'
				}
			}
		]
	},
	{
		id: 'trevor-perrin',
		name: 'Trevor Perrin',
		years: 'c. 1977–',
		title: 'Designer of the Noise Protocol Framework and the Signal Protocol',
		org: 'Independent cryptographer',
		contribution: `Designed the **Noise Protocol Framework** (noiseprotocol.org, 2016) — a construction toolkit for building secure handshakes from a small set of patterns and DH/AEAD/hash primitives. [[wireguard|WireGuard]]'s handshake is an instantiation of the Noise \`IKpsk2\` pattern (\`Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s\`).

Before Noise: co-designed Signal's **X3DH** key-agreement protocol and the **Axolotl** ratchet (later renamed the Double Ratchet) with Moxie Marlinspike, both foundational to Signal, WhatsApp, Facebook Messenger E2E, and Google Messages RCS. Quietly one of the most consequential applied cryptographers of the last 15 years; rarely seen at conferences but his patterns are everywhere.`,
		protocols: ['wireguard'],
		categories: ['utilities'],
		links: {
			homepage: 'https://noiseprotocol.org/'
		}
	},
	{
		id: 'clifford-neuman',
		name: 'Clifford Neuman',
		years: 'c. 1962–',
		title: 'Co-designer of Kerberos V5',
		org: 'USC Information Sciences Institute (Senior Research Scientist)',
		contribution: `One of the principal architects of **[[kerberos|Kerberos]] V5** ([[rfc:4120|RFC 4120]]). PhD from the University of Washington (1992) on naming and security in distributed systems. Joined MIT Project Athena in the late 1980s during the Kerberos design phase; co-authored the canonical 1994 paper *"Kerberos: An Authentication Service for Computer Networks"* (IEEE Communications Magazine) with Theodore Ts'o — the article that taught a generation of engineers how the protocol actually works.

Has been at **USC Information Sciences Institute** for three decades, where he led the GOST (Gigabit Operating System Technologies) project and continues to publish on distributed-systems security. Co-author of textbook *Network Security: Private Communication in a Public World* with [[pioneer:charlie-kaufman|Charlie Kaufman]] and Radia Perlman — the book that connects [[kerberos|Kerberos]], [[ipsec|IPsec]], [[tls|TLS]], and PKI into a coherent pedagogy.`,
		protocols: ['kerberos'],
		categories: ['utilities'],
		links: {
			homepage: 'https://www.isi.edu/~bcn/'
		}
	},
	{
		id: 'greg-hudson',
		name: 'Greg Hudson',
		years: 'c. 1976–',
		title: 'MIT Kerberos lead maintainer',
		org: 'MIT Kerberos Consortium',
		contribution: `Long-running lead maintainer of **MIT [[kerberos|Kerberos]]** (\`krb5\`) — the canonical C codebase used by every Linux distribution, FreeIPA, Hadoop, NFSv4, and the Heimdal-incompatible parts of the macOS Kerberos stack. At MIT since the late 1990s; took over the lead-maintainer role from Sam Hartman in the mid-2010s.

Steward of MIT krb5 releases through the entire 1.18 → 1.22 era (2020–2025), shipping PKINIT ECDH support (1.22, August 2025), Unix-domain socket transport, IAKerb realm discovery, paChecksum2, and the response to CVE-2024-37370 / CVE-2024-37371 in 1.21.3. The kind of maintainer whose patch commits are the ground truth on how [[kerberos|Kerberos]] actually behaves in 2026.`,
		protocols: ['kerberos'],
		categories: ['utilities'],
		links: {
			homepage: 'https://web.mit.edu/kerberos/'
		}
	},
	{
		id: 'marty-cooper',
		name: 'Marty Cooper',
		years: '1928–',
		title: 'Inventor of the handheld cellular phone',
		org: 'Motorola (1954–1983); Dyna LLC',
		contribution: `Motorola engineer who led the **DynaTAC** team and placed the **first public handheld cellular call** on 3 April 1973, from Sixth Avenue in Manhattan to Joel Engel at AT&T Bell Labs — his direct rival. *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC weighed 2.5 lb and gave 35 minutes of talk after 10 hours of charging. As Cooper later put it: *"The battery lifetime wasn't really a problem because you couldn't hold that phone up for that long!"*

Patent "radio telephone system" filed 17 October 1973. **2013 Charles Stark Draper Prize**; **2015 IEEE Masaru Ibuka Consumer Electronics Award**. Considered the *father of the handheld cell phone*. Now 96 and still active in spectrum-policy advocacy.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Martin_Cooper%2C_Two_Antennas%2C_October_2010.jpg/330px-Martin_Cooper%2C_Two_Antennas%2C_October_2010.jpg',
		protocols: ['cellular'],
		categories: ['wireless'],
		awards: [
			{ name: 'Charles Stark Draper Prize', year: 2013 },
			{ name: 'IEEE Masaru Ibuka Consumer Electronics Award', year: 2015 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Martin_Cooper_(inventor)'
		},
		quotes: [
			{
				text: "Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone.",
				source: {
					url: 'https://en.wikipedia.org/wiki/Martin_Cooper_(inventor)',
					label: 'First public cellular call, 3 April 1973'
				}
			}
		]
	},
	{
		id: 'andrew-viterbi',
		name: 'Andrew Viterbi',
		years: '1935–',
		title: 'Inventor of the Viterbi algorithm; Qualcomm co-founder',
		org: 'Qualcomm (co-founded 1985); previously Linkabit (1968)',
		contribution: `Italian-born American electrical engineer. **Invented the Viterbi algorithm (1967)** for decoding convolutional codes — used in essentially every digital communications system on Earth: every cellular phone, every disk-drive read channel, every GPS receiver, every speech recognizer. *On advice of a lawyer, Viterbi did not patent the algorithm.* It made nothing for him directly; it made Qualcomm everything.

Co-founded **Linkabit** (1968) with [[pioneer:irwin-jacobs|Irwin Jacobs]] and Leonard Kleinrock, then **Qualcomm** on 1 July 1985 — the company that turned CDMA from a research curiosity into a global cellular standard. **National Medal of Science 2007**; **IEEE Medal of Honor 2010**. The USC Viterbi School of Engineering is named for him after a $52M gift in 2004.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/10-08ViterbiBIG.jpg/330px-10-08ViterbiBIG.jpg',
		protocols: ['cellular'],
		categories: ['wireless'],
		awards: [
			{ name: 'National Medal of Science', year: 2007 },
			{ name: 'IEEE Medal of Honor', year: 2010 },
			{ name: 'Marconi Prize', year: 1990 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Andrew_Viterbi'
		}
	},
	{
		id: 'irwin-jacobs',
		name: 'Irwin Jacobs',
		years: '1933–',
		title: 'Co-founder of Qualcomm; CDMA champion',
		org: 'Qualcomm (co-founded 1985; CEO 1985–2005)',
		contribution: `MIT-trained engineer who co-founded **Linkabit** with [[pioneer:andrew-viterbi|Andrew Viterbi]] (1968) and then **Qualcomm** (1985). Led the commercial fight for **CDMA** against the TDMA establishment after the CTIA's January 1989 vote *against* CDMA — *"no one found a hole in the technical presentation"* but the political fight took a decade. Hong Kong (1995), Korea, then the US were the first to ship cdmaOne. CDMA's mathematical foundation eventually became the basis of **WCDMA in UMTS** — the GSM camp ended up adopting it, closing the fork.

**National Medal of Technology 1994**; **IEEE Alexander Graham Bell Medal 1995**. Co-author with John Wozencraft of *Principles of Communication Engineering* (1965) — still in print sixty years later.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Irwin_Jacobs.jpg/330px-Irwin_Jacobs.jpg',
		protocols: ['cellular'],
		categories: ['wireless'],
		awards: [
			{ name: 'National Medal of Technology', year: 1994 },
			{ name: 'IEEE Alexander Graham Bell Medal', year: 1995 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Irwin_M._Jacobs'
		}
	},
	{
		id: 'erik-dahlman',
		name: 'Erik Dahlman',
		years: 'c. 1962–',
		title: 'LTE and 5G NR systems architect',
		org: 'Ericsson Research (Senior Expert, Radio Access Technologies)',
		contribution: `Long-running Senior Expert at Ericsson Research and personal contributor to **LTE Release 8 PHY** design and **5G NR numerology**. Co-author with Stefan Parkvall and Johan Sköld of the two canonical reference texts — *4G LTE/LTE-Advanced for Mobile Broadband* (Academic Press, multiple editions through 2014) and *5G NR: The Next Generation Wireless Access Technology* (Academic Press, 2018; 2nd ed 2020) — used by every cellular engineer of the 2010s and 2020s.

Active in 3GPP TSG-RAN through every release since LTE. The kind of contributor whose name on a study item means the study is real.`,
		protocols: ['cellular'],
		categories: ['wireless'],
		links: {
			homepage: 'https://www.ericsson.com/en/research-and-development'
		}
	},
	{
		id: 'stuart-cheshire',
		name: 'Stuart Cheshire',
		years: 'c. 1968–',
		title: 'Designer of Multicast DNS and DNS-SD',
		org: 'Apple (Distinguished Engineer/Scientist/Technologist)',
		contribution: `Designed **[[mdns-dns-sd|mDNS]]** and **[[mdns-dns-sd|DNS-SD]]** at Apple, where he has been since January 1998. Educated at Sidney Sussex College, Cambridge (BA + MA Computer Science, 1989 + 1992) and Stanford (MSc + PhD Computer Networking, 1996 + 1998). His PhD dissertation invented **Consistent Overhead Byte Stuffing (COBS)** — the framing algorithm widely used in embedded protocols.

Lead or co-author of an astonishing RFC catalogue: RFC 3927 (IPv4 link-local), RFC 6335 (IANA port-number procedures), RFC 6760 / RFC 6761 / [[rfc:6762|RFC 6762]] / [[rfc:6763|RFC 6763]] (the Zeroconf quartet), RFC 6886 (NAT-PMP), RFC 6887 (PCP, co-author), RFC 7558 (DNS-SD scalability requirements), RFC 8765 (DNS Push), RFC 8766 (Discovery Proxy), RFC 9664 (DNS Update Lease), and **RFC 9665 (SRP, 2025)**.

Co-author of *Zero Configuration Networking: The Definitive Guide* (O'Reilly, 2005, with Daniel H. Steinberg). Also the author of **Bolo** (BBC Micro 1987, Mac port 1990s) — a 16-player networked tank game some old-timers at Apple will still name-drop. His IETF presentations are famous for animated polemics, most notably his recurring "why mDNS instead of LLMNR" critique of the Microsoft alternative.`,
		protocols: ['mdns-dns-sd'],
		categories: ['utilities'],
		links: {
			homepage: 'https://stuartcheshire.org/'
		}
	},
	{
		id: 'lennart-poettering',
		name: 'Lennart Poettering',
		years: '1980–',
		title: 'Co-author of Avahi; author of PulseAudio and systemd',
		org: 'Microsoft (since 2022); previously Red Hat (2008–2022)',
		contribution: `Born 15 October 1980 in Guatemala City; raised in Rio de Janeiro and Hamburg. Initial author or co-author of more than 40 free-software projects, including **PulseAudio** (2004 — the dominant Linux sound server), **[[mdns-dns-sd|Avahi]]** (2004–2005, with Trent Lloyd — the dominant Linux/BSD mDNS implementation), and **systemd** (2010 — the dominant Linux init system).

At Red Hat from at least 2008 until joining Microsoft in 2022. Known in the Linux community for sharp opinions on init systems and Linux distribution architecture; the systemd debates were occasionally vitriolic and Poettering himself has spoken publicly about the difficulty of working in open-source under sustained personal attack. Avahi was his contribution to the [[mdns-dns-sd|mDNS]] world before he moved on to PulseAudio and systemd full-time.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lennart_Poettering.jpg/330px-Lennart_Poettering.jpg',
		protocols: ['mdns-dns-sd'],
		categories: ['utilities'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Lennart_Poettering',
			homepage: 'https://0pointer.net/'
		}
	},
	{
		id: 'ted-lemon',
		name: 'Ted Lemon',
		years: 'c. 1962–',
		title: 'DHCP / DNS-SD elder; lead author of SRP (RFC 9665)',
		org: 'Apple (Senior Software Engineer); previously Fastly, Nominum',
		contribution: `Long-time IETF contributor; co-author of *The DHCP Handbook* (with Ralph Droms, Macmillan, 2002) — the canonical text on dynamic host configuration. Co-author of RFC 8375 (Special-Use Domain \`home.arpa.\`) and RFC 8415 (DHCPv6 modernisation).

**Lead author of RFC 9665 (SRP — Service Registration Protocol, June 2025) with [[pioneer:stuart-cheshire|Stuart Cheshire]] as co-author.** SRP extends [[mdns-dns-sd|DNS-SD]] from link-local to wide-area via Thread Border Routers and Matter ecosystems — the protocol that will glue link-local discovery to wide-area DNS as Matter and Thread roll out across the smart home. Currently working on \`draft-tlmk-infra-dnssd\` (July 2025) and \`draft-ietf-dnssd-advertising-proxy\` (current March 2024).`,
		protocols: ['mdns-dns-sd', 'dhcp'],
		categories: ['utilities'],
		links: {
			homepage: 'https://datatracker.ietf.org/person/mellon@fugue.com'
		}
	},
	{
		id: 'avery-pennarun',
		name: 'Avery Pennarun',
		years: 'c. 1975–',
		title: 'Co-founder & CEO of Tailscale',
		org: 'Tailscale (CEO since 2019); previously Google',
		contribution: `Co-founded **Tailscale** in 2019 with David Crawshaw, David Carney, and (Jan 2020) Brad Fitzpatrick. Tailscale wraps [[wireguard|WireGuard]] with a control plane that handles key exchange, NAT-traversal coordination (STUN-style hole-punching with the proprietary DERP relay as a TURN-analogue), and ACL-style "tailnet" policy. The single biggest reason engineering teams encounter [[wireguard|WireGuard]] in 2026 is via Tailscale, not via raw \`wg-quick\`.

Toronto-based. Ex-Google staff engineer. Public spokesperson for the "BeyondCorp + [[wireguard|WireGuard]]" thesis: that mesh networking + zero-trust auth obsoletes the corporate VPN. Tailscale crossed 10,000 paying customers and raised its Series C in 2025.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/BarCamp_Montr%C3%A9al_2_-_Avery_Pennarun_%28501987168%29.jpg/330px-BarCamp_Montr%C3%A9al_2_-_Avery_Pennarun_%28501987168%29.jpg',
		protocols: ['wireguard', 'nat-traversal'],
		categories: ['utilities'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Tailscale',
			homepage: 'https://apenwarr.ca/'
		}
	},
	{
		id: 'andreas-steffen',
		name: 'Andreas Steffen',
		years: 'c. 1955–',
		title: 'Founder and lead of strongSwan',
		org: 'OST Eastern Switzerland University of Applied Sciences (formerly HSR Rapperswil); strongSwan project lead',
		contribution: `Founded and led the **strongSwan** project — the most-deployed open-source [[ipsec|IPsec]] / IKEv2 stack on Linux. strongSwan ships in every cloud-hyperscaler VPN gateway image, every BSI SINA high-security solution (secunet acquired strongSwan in June 2022), every Yocto-derived IoT gateway. Long-running contributor to IETF security work, including Trusted Network Connect (TNC) / PT-EAP.

Professor at HSR / OST in Rapperswil, Switzerland — strongSwan started as an academic project there and is one of the longest-running successful open-source security projects of European origin.`,
		protocols: ['ipsec'],
		categories: ['utilities'],
		links: {
			homepage: 'https://strongswan.org'
		}
	},
	{
		id: 'charles-walton',
		name: 'Charles Walton',
		years: '1921–2011',
		title: 'Holder of the foundational RFID patent — the ancestor of NFC',
		org: 'IBM (1960–1970) → Proximity Devices (founded 1970, Sunnyvale)',
		contribution: `US engineer; Cornell BSEE 1943; MS Stevens Institute of Technology; US Army Signal Corps; ten years at IBM working primarily on disk-drive R&D. **Founded Proximity Devices in Sunnyvale in 1970** and spent the next two decades inventing the radio-identification primitives that would later become the [[nfc|NFC]] family. Holder of 50+ patents in radio identification.

The canonical "ancestor" patent is **US 4,384,288 — *Portable Radio Frequency Emitting Identifier*** (issued **15 May 1983**) — the first patent to use the acronym "RFID". His earliest passive transponder patent is US 3,752,960 (August 1973). He licensed his card-and-reader door-lock to **Schlage**, earning millions in royalties — but the bulk of his patents expired in the mid-1990s, just before Walmart's 2003 RFID mandate and the wider boom.

Died in Los Gatos on **6 November 2011** — three months after Google launched **Google Wallet 1.0** on the Nexus S 4G — at age 89. The Lemelson-MIT program recognised him; the **VentureBeat** and **Engadget** obituaries the following month are the canonical citations.`,
		protocols: ['nfc'],
		categories: ['wireless'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Charles_Walton_(inventor)'
		}
	},
	{
		id: 'franz-amtmann',
		name: 'Franz Amtmann',
		years: '1963–',
		title: 'Co-inventor of NFC; RFID Lead Architect at NXP',
		org: 'Philips Semiconductors → NXP (Gratkorn, Austria)',
		contribution: `Austrian electrical engineer who led the physical-layer and IC architecture work behind [[nfc|NFC]] at Philips Semiconductors (later **NXP**, spun out in 2006). ~50 patents. Instrumental in the **MIFARE** family architecture and the NFC physical-layer specification — the side of the standard that turned a paper draft into manufacturable silicon.

Co-recipient with [[pioneer:philippe-maugars|Philippe Maugars]] of the **European Patent Office's European Inventor Award 2015** in the *Industry* category, for jointly inventing NFC. NXP's NW-ENGINEERS-EUROPEAN-INVENTOR-AWARD press release describes 25+ years at the company. In a 2015 interview with M2M Now, Amtmann and Maugars credited the success to "a cooperation between teams having complementary expertise across RFID, applications, and IC design."`,
		protocols: ['nfc'],
		categories: ['wireless'],
		awards: [{ name: 'European Inventor Award (Industry)', year: 2015 }]
	},
	{
		id: 'philippe-maugars',
		name: 'Philippe Maugars',
		years: 'c. 1960–',
		title: 'Co-inventor of NFC',
		org: 'Philips → NXP (Caen, France)',
		contribution: `French electrical engineer; 30+ years at Philips / NXP. Career arc across smart-card readers, power management, and LED-based smart lighting; ~25 patents. **Co-inventor of [[nfc|NFC]] with [[pioneer:franz-amtmann|Franz Amtmann]]**, and joint recipient of the **European Patent Office European Inventor Award 2015** in the Industry category.

Where Amtmann owned the physical-layer and IC architecture in Gratkorn, Maugars owned the reader-side and protocol work in Caen — the contactless reader chips that ship in every payment terminal, transit gate, and access reader using NXP silicon today are direct descendants of his designs.`,
		protocols: ['nfc'],
		categories: ['wireless'],
		awards: [{ name: 'European Inventor Award (Industry)', year: 2015 }]
	},
	{
		id: 'karsten-nohl',
		name: 'Karsten Nohl',
		years: 'c. 1981–',
		title: 'Cryptographer who broke MIFARE Classic Crypto1',
		org: 'University of Virginia PhD → Security Research Labs (SRLabs), Berlin',
		contribution: `German cryptographer and security researcher who ended *security-by-obscurity* in NFC contactless. With [[pioneer:henryk-plotz|Henryk Plötz]] and "Starbug" at the Chaos Computer Club, presented ***MIFARE — little security despite obscurity*** at **24C3 in Berlin on 28 December 2007**, dismantling the Crypto1 stream cipher used in roughly 1 billion MIFARE Classic cards worldwide — Dutch OV-chipkaart, London Oyster, Boston Charlie Card, and innumerable hotel-key, office-badge, and university-canteen systems.

They had **decapped the chip, photographed ~10 000 gates with an optical microscope**, recognised that only ~70 unique gates were used, and isolated the ~10 % of gates dedicated to Crypto1. They also noticed the weak 16-bit PRNG seeded from a free-running power-up counter. The follow-on academic paper *Reverse-Engineering a Cryptographic RFID Tag* (USENIX Security 2008) is the canonical citation.

Founded **SRLabs in Berlin**; later work covered SIM-card cloning, SS7 attacks, and contactless banking-app analyses. The Crypto1 story is now textbook material for "why open peer review is not optional."`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Karsten_Nohl.jpg/330px-Karsten_Nohl.jpg',
		protocols: ['nfc'],
		categories: ['wireless'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Karsten_Nohl',
			homepage: 'https://srlabs.de/'
		}
	},
	{
		id: 'henryk-plotz',
		name: 'Henryk Plötz',
		years: 'c. 1980–',
		title: 'Chaos Computer Club hardware security researcher; co-author of the MIFARE break',
		org: 'Chaos Computer Club / Humboldt University of Berlin',
		contribution: `German computer scientist; CCC member; co-author with [[pioneer:karsten-nohl|Karsten Nohl]] and "Starbug" of the **24C3 (28 December 2007)** dismantlement of MIFARE Classic's Crypto1 — the first time a deployed mass-market contactless cipher was reverse-engineered from silicon and broken in public.

Subsequent academic work at HU Berlin on RFID/NFC security and on lattice/side-channel attacks. The 24C3 talk's recording remains one of the most-viewed Chaos Computer Club lectures and is the canonical "this is how security-by-obscurity dies" video.`,
		protocols: ['nfc'],
		categories: ['wireless']
	},
	{
		id: 'preeti-ohri-khemani',
		name: 'Preeti Ohri Khemani',
		years: '—',
		title: 'Current Chair, NFC Forum',
		org: 'NFC Forum (board) / Infineon Technologies',
		contribution: `Public **Chair of the NFC Forum** as of the 2025 Release 15 announcement, succeeding prior chairs (Koichi Tagawa, then Mike McCamon as Executive Director). The public spokesperson for the **20 mm operating volume** rollout — what she described as the technically hardest standardisation effort to date while maintaining ISO 14443 compatibility.

Under her tenure the Forum:

- Quadrupled the certified operating volume from 5 mm to 20 mm (Release 15, June 2025).
- Promoted **NFC Wireless Charging (WLC 2.0)** through adoption as an IEC standard (March 2026).
- Published the **NDPP** candidate spec for digital product passports (March 2025).
- Drove **NDEF** to formal IEC standardisation (March 2026).
- Committed the Forum's 2026 Technology Roadmap to **Multi-Purpose Tap (MPT)** as a strategic direction.`,
		protocols: ['nfc'],
		categories: ['wireless']
	},
	{
		id: 'martin-herfurt',
		name: 'Martin Herfurt',
		years: '—',
		title: 'Founder of Trifinite; Bluetooth and NFC security researcher',
		org: 'Trifinite Group (Austria)',
		contribution: `Austrian security researcher; founder of **Trifinite**; long-running specialist in [[bluetooth|Bluetooth]] and [[nfc|NFC]] security. Authored the **2022 Tesla NFC keycard 130-second authorisation-window attack** — *Gone in under 130 seconds* — demonstrating that Tesla's post-unlock "convenience window" also accepted *new key enrolment* without re-authentication or owner notification. Within the legitimate driver's 130 s shift-into-gear window, an attacker could enrol an attacker-controlled phone over BLE and drive the car away.

Maintains the **TeslaKee** defensive app for Android/iOS. His public disclosures (private to Tesla months prior) directly motivated the **anti-relay-resistance requirements** in CCC Digital Key 3.0 / 4.0 and the USPTO filings on NFC anti-relay timing bounds.`,
		protocols: ['nfc', 'bluetooth'],
		categories: ['wireless'],
		links: {
			homepage: 'https://trifinite.org/'
		}
	},
	{
		id: 'bob-heile',
		name: 'Bob Heile',
		years: '1945–2020',
		title: 'Founding Chair of the Zigbee Alliance; founding member of IEEE 802.11',
		org: 'BBN → Zigbee Alliance / IEEE 802.15 → Wi-SUN Alliance',
		contribution: `**Robert F. Heile** is the institutional father of low-power 802.15.4-based wireless. Physics doctorate at Johns Hopkins; started his data-communications career in 1980 at Codex Corp.; joined **BBN in 1997** to commercialise wireless technology, then transitioned full-time into standards.

A **founding member of IEEE 802.11 (Wi-Fi) in 1990** — and an active contributor through the rest of his life. In **August 2002** he co-founded the **Zigbee Alliance** and chaired it through 2013, taking the organisation from concept to over 400 member companies. He concurrently chaired **IEEE 802.15** (the WG on Wireless Specialty Networks) for almost two decades and **IEEE 2030.5** (Smart Energy Profile 2.0). From 2015 he served as **Director of Standards at the Wi-SUN Alliance** while still chairing 802.15.

Almost every low-power 802.15.4-based protocol you can name — [[zigbee|Zigbee]], Thread, WirelessHART, Wi-SUN — traces directly back through Bob. He died of prostate cancer in North Attleboro, Massachusetts on **24 September 2020**; the IEEE 802.15 chair role he held continuously for almost two decades was passed days before his death.`,
		protocols: ['zigbee'],
		categories: ['wireless'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Bob_Heile'
		}
	},
	{
		id: 'tobin-richardson',
		name: 'Tobin Richardson',
		years: 'c. 1968–',
		title: 'President & CEO, Connectivity Standards Alliance (formerly Zigbee Alliance)',
		org: 'Connectivity Standards Alliance',
		contribution: `UC Davis undergraduate; master's at Georgetown. Entered the IoT world in 2008 helping establish **Zigbee Smart Energy** as the utility-industry connectivity standard. Joined the Zigbee Alliance leadership in 2014; became President & CEO.

Under his leadership the Alliance launched **Project CHIP (now Matter)** in December 2019 with Amazon, Apple, and Google as co-founders; **rebranded from Zigbee Alliance to Connectivity Standards Alliance** on 11 May 2021; and grew membership past **850 companies in 45 countries**. The CSA he runs now stewards Zigbee, Matter, RF4CE, and Aliro under one umbrella.

Sits on the World Economic Forum's Council on the Connected World as chair of the WEF initiative on cross-stakeholder IoT collaboration. The political bridge that kept Zigbee semantically alive across the Matter transition — bridge code in Hue, Aqara, and SmartThings hubs is the direct outcome.`,
		protocols: ['zigbee'],
		categories: ['wireless']
	},
	{
		id: 'skip-ashton',
		name: 'Skip Ashton',
		years: 'c. 1957–',
		title: 'VP Engineering, Ember → Silicon Labs → Infineon; long-time Zigbee technical lead',
		org: 'Ember Corporation → Silicon Labs → Infineon',
		contribution: `Joined **Ember Corporation** (Cambridge, MA — founded 2001 by Andrew Wheeler and Robert Poor) as VP of Engineering and Technology, leading the **EmberZNet PRO** stack — the reference [[zigbee|Zigbee]] stack against which every other implementation is still measured.

When **Silicon Labs acquired Ember in May 2012**, Skip became VP of Software at Silicon Labs covering 8- and 32-bit MCU drivers, EmberZNet, and short-range sub-GHz. Involved with Zigbee since 2004; served as a Zigbee Alliance board member, **Chair of the Zigbee Technical Committee**, **Chair of the Zigbee Test and Certification Committee**, and on the NIST Smart Grid Architecture Committee. Later moved to Infineon as a Distinguished Engineer and has served on the **Thread Group board** as well — the rare individual who has technical authority over both 802.15.4 mesh stacks.`,
		protocols: ['zigbee'],
		categories: ['wireless']
	},
	{
		id: 'robert-scholtz',
		name: 'Robert A. Scholtz',
		years: '1936–',
		title: 'Theoretical founder of time-hopping impulse radio',
		org: 'University of Southern California — Communication Sciences Institute',
		contribution: `Foundational impulse-radio papers from the early 1990s. The canonical citation is **R. A. Scholtz, *"Multiple-Access with Time-Hopping Impulse Modulation,"*** *Proc. IEEE MILCOM '93*, Boston, MA, 11–14 October 1993 — the paper that defined the **time-hopping spread-spectrum framework** that lets many users share a UWB band.

With his student [[pioneer:moe-win|Moe Z. Win]], co-authored *"Ultra-Wide Bandwidth Time-Hopping Spread-Spectrum Impulse Radio for Wireless Multiple-Access Communications"* (IEEE Trans. Commun., April 2000) — the most-cited UWB physical-layer paper in the field, recognised in his Engineering and Technology History Wiki bio and explicitly cited in FiRa Consortium's own *Introduction to Impulse Radio UWB* white paper as foundational to the technology.

The theoretical grandfather of every modern [[uwb|UWB]] system, from the AirTag's U1 chip to BMW Digital Key Plus.`,
		protocols: ['uwb'],
		categories: ['wireless']
	},
	{
		id: 'moe-win',
		name: 'Moe Z. Win',
		years: 'c. 1962–',
		title: 'Robert R. Taylor Professor at MIT; founding director of MIT WINS Lab',
		org: 'MIT Laboratory for Information and Decision Systems',
		contribution: `**Robert R. Taylor Professor at MIT**, founding director of MIT's **Wireless Information and Network Sciences Laboratory (WINS Lab)** in LIDS. Before MIT, AT&T Research Laboratories (5 years) and NASA Jet Propulsion Laboratory (7 years). Bachelor's from Texas A&M; master's in applied math and PhD in EE from USC under [[pioneer:robert-scholtz|Robert Scholtz]].

IEEE Fellow; recipient of the **IEEE Eric E. Sumner Award (2006)** "for pioneering contributions to ultra-wide band communications science and technology," and the IEEE Kiyo Tomiyasu Award.

Co-authored the foundational **Dardari, Conti, Ferner, Giorgetti, Win — *"Ranging With Ultrawide Bandwidth Signals in Multipath Environments"*** (Proceedings of the IEEE, vol. 97, no. 2, Feb 2009) — the canonical reference for [[uwb|UWB]] time-of-arrival-based ranging theory in multipath. Every modern DS-TWR implementation owes its multipath bias model to this paper.`,
		protocols: ['uwb'],
		categories: ['wireless'],
		awards: [
			{ name: 'IEEE Eric E. Sumner Award', year: 2006 },
			{ name: 'IEEE Kiyo Tomiyasu Award' }
		]
	},
	{
		id: 'larry-fullerton',
		name: 'Larry W. Fullerton',
		years: 'c. 1942–',
		title: '1990s UWB commercialiser; founder of Time Domain Corporation',
		org: 'Time Domain Corporation (Huntsville, AL) — later Humatics',
		contribution: `Founded **Time Domain Corporation** in Huntsville, Alabama in 1987. Holder of foundational US patents on **impulse-radio modulation, time-hopping codes, and pulse-position encoding** from the late 1980s and 1990s. Co-author with [[pioneer:moe-win|Win]] and [[pioneer:robert-scholtz|Scholtz]] on early-1990s impulse-radio papers (e.g. *"Time-hopping SSMA techniques for impulse radio with an analog modulated data subcarrier,"* IEEE Spread Spectrum Tech. Symp., 1996).

Time Domain was the canonical 1990s [[uwb|UWB]] start-up: patent-heavy from the start, technically influential well beyond the size of its products. The company pivoted through the 2000s toward military / intelligence-grade radar and metrology, eventually becoming **Humatics**. Fullerton's patents underpinned much of the early-2000s UWB licensing landscape and the early FCC proceedings that opened the 3.1–10.6 GHz band.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Larry_Fullerton_in_his_lab.jpg/330px-Larry_Fullerton_in_his_lab.jpg',
		protocols: ['uwb'],
		categories: ['wireless']
	},
	{
		id: 'srdjan-capkun',
		name: 'Srdjan Čapkun',
		years: 'c. 1972–',
		title: 'ETH Zurich professor; lead of the modern UWB ranging-security research',
		org: 'ETH Zurich — System Security Group',
		contribution: `Professor at ETH Zurich; head of the System Security Group; the most influential single academic voice in modern [[uwb|UWB]] ranging security. With students and collaborators (**Mridula Singh**, **Patrick Leu**, **Giovanni Camurati**, **Marc Roeschlin**, **Claudio Anliker**, **Alexander Heinrich** at TU Darmstadt), produced the foundational body of work that defined what FiRa, CCC, and IEEE 802.15.4ab had to fix:

- *UWB-ED: Distance Enlargement Attack Detection in Ultra-Wideband* — USENIX Security 2019.
- *UWB with Pulse Reordering: Securing Ranging against Relay and Physical-Layer Attacks* — NDSS 2019.
- *Security analysis of IEEE 802.15.4z/HRP UWB time-of-flight distance measurement* — WiSec 2021 (Cicada++).
- ***Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging*** — USENIX Security 2022. The practical attack on deployed Apple U1, NXP, and Qorvo HRP-STS ranging. Reduces 12 m to 0 m at up to ~4 % success with a $65 device.
- *Time for Change: How Clocks Break UWB Secure Ranging* — USENIX Security 2023.

Apple's published reference STS receiver (Luo, Kalkanli, Zhou, Zhan, Cohen — arXiv:2312.03964, Dec 2023) is a direct response to this body of work. The 802.15.4ab amendment's tighter cipher-suite specification grew from the same conversation.`,
		protocols: ['uwb'],
		categories: ['wireless'],
		links: {
			homepage: 'https://syssec.ethz.ch/'
		}
	},
	{
		id: 'ray-tomlinson',
		name: 'Ray Tomlinson',
		years: '1941–2016',
		title: 'Inventor of network email',
		org: 'BBN',
		contribution: `Wrote the first email program that crossed machine boundaries on {{arpanet|ARPANET}} at {{bbn|BBN}} in late 1971 — combining BBN's local **SNDMSG** and **CPYNET** experimental file-copy program — and chose the **\`@\`** character to separate the user from the host name. The decision was utilitarian: \`@\` was a printable ASCII symbol that did not appear in any username, so parsing was unambiguous. Half a century later, every email address on earth still uses the same syntax.

He also worked on TENEX, contributed to early {{arpanet|ARPANET}} mail conventions that became RFC 561 (1973) and eventually [[smtp|SMTP]] (RFC 821, 1982), and stayed at {{bbn|BBN}} for the rest of his career.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ray_Tomlinson.jpg/330px-Ray_Tomlinson.jpg',
		protocols: ['smtp'],
		categories: ['utilities'],
		awards: [
			{ name: 'Internet Hall of Fame', year: 2012 },
			{ name: 'IEEE Internet Award', year: 2004 }
		],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Ray_Tomlinson'
		},
		quotes: [
			{
				text: "Don't tell anyone! This isn't what we're supposed to be working on.",
				source: {
					url: 'https://www.bbc.com/news/technology-35723203',
					label: 'On showing his colleague the first email between two computers'
				}
			}
		]
	},
	{
		id: 'dan-bernstein',
		name: 'Daniel J. Bernstein (djb)',
		years: '1971–',
		title: 'Cryptographer & protocol designer',
		org: 'University of Illinois at Chicago / Ruhr-Universität Bochum',
		contribution: `Designed **SYN cookies** in September 1996 — a stateless way for [[tcp|TCP]] servers to verify a returning {{ack|ACK}} without storing per-connection state until the third handshake step, defusing {{syn-flood|SYN flood}} denial-of-service attacks. The technique is now standard in every major OS kernel.

Designed **Curve25519** (2005), an elliptic curve that became the default key-exchange primitive in [[tls|TLS]] 1.3, [[ssh|SSH]], Signal, [[wireguard|WireGuard]], and post-quantum hybrids. Co-designed **Ed25519** signatures, the **ChaCha20** stream cipher and **Poly1305** MAC ([[rfc:7539|RFC 7539]] / [[rfc:8439|RFC 8439]]) — the AEAD construction that protects most modern [[tls|TLS]] and [[quic|QUIC]] traffic.

Authored **qmail** and **djbdns** in the late 1990s — uncompromising secure alternatives to sendmail and BIND that pioneered privilege-separation patterns now standard in mail and DNS daemons. A long-running NIST post-quantum cryptography contributor (SPHINCS+/SLH-DSA, McEliece).`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Daniel_J._Bernstein.jpg/330px-Daniel_J._Bernstein.jpg',
		protocols: ['tcp', 'tls', 'ssh'],
		categories: ['security', 'transport'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Daniel_J._Bernstein',
			homepage: 'https://cr.yp.to/'
		}
	}
];

export const pioneerMap = new Map(pioneers.map((p) => [p.id, p]));

export function getPioneerById(id: string): Pioneer | undefined {
	return pioneerMap.get(id);
}

export function getPioneersForProtocol(protocolId: string): Pioneer[] {
	return pioneers.filter((p) => p.protocols?.includes(protocolId));
}
