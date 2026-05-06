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
		contribution: `Designed the TCP/IP protocol suite alongside Bob Kahn, co-authoring the foundational 1974 paper "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications. The paper coined the word "internet" for "internetworking of networks" and described a single Transmission Control Program — what would later split into TCP and IP — for connecting heterogeneous packet-switched networks.

Edited or co-edited many of the early TCP RFCs at Stanford with Yogen Dalal and Carl Sunshine, including RFC 675 (December 1974, the first detailed TCP specification). Continues to evangelise the internet as Google's Chief Internet Evangelist.`,
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
		contribution: `Conceived the idea of open-architecture networking while managing the ARPANET project at DARPA, then in late 1972 started sketching how to interconnect packet-switched networks that did not look like the ARPANET — radio nets, satellite nets, eventually Ethernets. Recruited Vint Cerf to collaborate on what became TCP/IP.

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
		contribution: `Edited the foundational TCP/IP RFCs — RFC 791 (IPv4, September 1981), RFC 792 (ICMP), RFC 793 (TCP), RFC 768 (UDP, August 1980 — three pages, the most spartan and durable spec in networking) — and served as the RFC Editor for nearly three decades, shaping the standards process that governs the internet to this day.

Argued (with David Reed) for splitting the original monolithic TCP into IP plus a separate transport layer in 1978, the architectural decision that made UDP and decades later QUIC possible. The first IANA's first steward. The "Robustness Principle" — be conservative in what you send, be liberal in what you accept — appeared in his RFC 760 introduction and entered the cultural canon.`,
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
		contribution: `Built the first 2.94 Mbps Ethernet in 1973 at Xerox PARC with David Boggs to connect Alto workstations to laser printers. Co-authored the seminal "Ethernet: Distributed Packet Switching for Local Computer Networks" in *Communications of the ACM*, July 1976. Co-authored the DIX (Digital/Intel/Xerox) Ethernet specification in 1980, which IEEE 802.3 ratified in 1983.

Founded 3Com in 1979 to commercialize Ethernet. Today, four decades later, every wired network on the planet from your home router to a 800 Gbps AI training cluster runs Ethernet at the link layer.`,
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
		contribution: `Co-invented Ethernet at Xerox PARC with Bob Metcalfe in 1973, building the original 2.94 Mbps coaxial-cable system that connected Alto workstations. Designed and built much of the original PARC Ethernet hardware. Co-authored the 1976 CACM paper that introduced Ethernet to the world. Later developed the PARC Universal Packet (PUP) architecture and worked at DEC on early routing systems.`,
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
		contribution: `Invented the Spanning Tree Protocol (IEEE 802.1D, 1985), which made redundant Ethernet topologies possible by automatically discovering and disabling loops without operator intervention. Without STP, every backbone Ethernet network in the world would broadcast-storm itself to death. Later designed TRILL (Transparent Interconnection of Lots of Links) and contributed to the IS-IS routing protocol.

Holds over 100 patents. Often called the "Mother of the Internet" for the loop-prevention work that made every multi-switch Ethernet network possible. Wrote the textbook *Interconnections: Bridges, Routers, Switches and Internetworking Protocols*, the gold standard on bridging vs routing.`,
		protocols: ['ethernet'],
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
		contribution: `Designed the Domain Name System in 1983 (RFC 882/883, later RFC 1034/1035, 1987) to replace the single HOSTS.TXT file that had been the entire internet's name lookup table since the ARPANET days. The hierarchical, distributed, cacheable DNS architecture scaled the internet from a few hundred hosts to billions.

Without DNS, every device would still be looking up addresses in a single text file someone updated by hand. Continues to advise on naming, anti-abuse, and DNS security through ThreatSTOP and the IETF.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Paul_Mockapetris.JPG/330px-Paul_Mockapetris.JPG',
		protocols: ['dns'],
		categories: ['utilities'],
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

Founded the World Wide Web Consortium (W3C) in 1994 and continues to direct it from MIT. The 60-second narrated hook of internet history is "Vint Cerf made the network of networks; Tim Berners-Lee made the application that turned it into something every human uses."`,
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
		contribution: `Co-authored the HTTP/1.1 specification (RFC 2068 / RFC 2616), the protocol that ran the web for two decades. Defined REST in his 2000 doctoral dissertation *Architectural Styles and the Design of Network-Based Software Architectures* — six constraints (client-server, stateless, cacheable, layered, uniform interface, optional code-on-demand) that came to define the dominant style of public APIs.

Co-founded the Apache HTTP Server Project and chaired the Apache Software Foundation. The vast majority of "REST APIs" are not RESTful in Fielding's strict sense (they fail his "hypermedia as the engine of application state" — HATEOAS — constraint), which has been a quiet source of his frustration for 25 years.`,
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
		contribution: `Co-created the Border Gateway Protocol with Kirk Lougheed at the 12th IETF meeting in Austin, Texas in January 1989 — sketched on three sheets of paper at lunch (the famous "two-napkin protocol"). Published as RFC 1105 in June 1989; the current standard is RFC 4271 (2006), still authored by Rekhter et al.

BGP runs every transit and peering relationship on the public internet today, carrying ~975K IPv4 and ~225K IPv6 prefixes globally as of January 2026. Rekhter has shaped or co-authored most of the BGP extensions in use, including BGP-MPLS VPNs (RFC 4364) and many EVPN drafts. The internet runs on a protocol he sketched on three napkins.`,
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
		contribution: `Invented IP multicast in his 1991 Stanford PhD thesis (Internet Group Management Protocol, IGMP), enabling efficient one-to-many communication that powers IPTV, financial market data feeds, and intra-DC pub/sub today.

Primary architect of IPv6 with Bob Hinden — RFC 1883 (1995), RFC 2460 (1998), and the current RFC 8200 (2017, Internet Standard 86). Designed the simplified 40-byte header, the extension-header chain, the link-local addressing, and the no-in-network-fragmentation rule. On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time — 28 years after his spec.`,
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
		contribution: `Saved the internet from congestion collapse. After the October 1986 collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley dropped from 32 kbps to 40 bps — Jacobson and Mike Karels published "Congestion Avoidance and Control" (SIGCOMM '88), introducing slow start, AIMD congestion avoidance, fast retransmit, and exponential RTO backoff. Six algorithms in one paper; arguably the highest-leverage networking paper ever written. Their fixes shipped in 4.3BSD-Tahoe and saved the internet.

Also wrote traceroute, tcpdump's BPF (Berkeley Packet Filter), and co-authored RFC 1144 (Compressing TCP/IP Headers for Low-Speed Serial Links). Co-author of the 2016 BBR paper at Google — congestion control for a second internet generation, replacing CUBIC for google.com and YouTube traffic.`,
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
		contribution: `Designed the Network Time Protocol (NTP, RFC 958/1119/1305/5905) in 1981 and refined it for over four decades. NTP synchronises computers across the public internet to within milliseconds despite arbitrary network jitter — the Marzullo's algorithm + clock-discipline pair he chose has held up since the 1980s.

Also built the early NSFNET "Fuzzball" routers and gateway algorithms that ran the original NSFNET backbone. His clock-discipline mathematics underpins every other clock-sync protocol since (PTP, GPSDOs, etc.). Without NTP — and Mills's 40 years of careful stewardship — every TLS certificate validation, every Kerberos ticket, every distributed log timestamp would be unreliable.`,
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
		contribution: `Co-created SPDY at Google in 2009 with Roberto Peon — the experimental binary, multiplexed, header-compressed transport that proved HTTP/1.1's head-of-line blocking and one-request-per-connection model could be replaced. Within a year SPDY shipped in Chrome (2010); the IETF httpbis WG started HTTP/2 in 2012 using SPDY/2 as the base; HTTP/2 published as RFC 7540 in May 2015.

Once HTTP/2 was on track, Google deprecated SPDY in Chrome — a textbook example of "ship a thing, prove it works, hand it to the standards body, retire your version." Now CEO of BitGo (cryptocurrency custody).`,
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
		contribution: `Designed and championed QUIC at Google starting around 2012 (originally "Quick UDP Internet Connections"). The premise: UDP passes through every middlebox; layer reliability + multiplexing + crypto on top of it in user space; iterate as a browser update instead of a kernel upgrade.

Google deployed gQUIC in production from 2013 onwards. The IETF QUIC working group chartered in 2016 and shipped RFC 9000 in May 2021 — substantially redesigned from gQUIC but recognisable as the same architecture. HTTP/3 (RFC 9114, June 2022) made QUIC the default modern transport for the web. By 2025, ~35% of the top 10M sites support HTTP/3 and Meta reports >75% of its traffic on QUIC.`,
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
		contribution: `Edited TLS 1.3 (RFC 8446, August 2018) — a five-year, 28-draft redesign that dropped insecure cipher suites, fused the handshake to one round-trip, and made AEAD mandatory. Designed the middlebox-compatibility hacks (legacy_version field, fake ChangeCipherSpec) that let TLS 1.3 deploy on the open internet despite ~3% of middleboxes parsing the version field.

Author of *SSL and TLS: Designing and Building Secure Systems* (2000), the standard practitioner's text. Continues to chair IETF working groups on TLS, OAuth, and encrypted DNS. The reason your browser's HTTPS handshake takes one round-trip in 2026 instead of two.`,
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

Distilled the IETF's working culture into the sentence that decided the OSI vs TCP/IP standards war at IETF 24 in Cambridge, MA in July 1992: "We reject: kings, presidents and voting. We believe in: rough consensus and running code." That single quote is the closest thing the IETF has to a national anthem.`,
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
		contribution: `Designed SSL (Secure Sockets Layer) at Netscape in 1994-1996 — the protocol that made encrypted commerce on the open web possible and seeded what later became TLS. SSL 3.0 (1996) was the version that POODLE eventually killed; the IETF took it over as TLS 1.0 in RFC 2246 (January 1999) after a Microsoft/Netscape standards horsetrade.

Also invented the Elgamal encryption algorithm (1985), one of the earliest practical public-key schemes, which underpins Diffie-Hellman key exchange and DSA signatures. Often called the "Father of SSL."`,
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
		id: 'ian-hickson',
		name: 'Ian Hickson',
		years: 'c. 1980–',
		title: 'Editor of HTML5 & WebSocket',
		org: 'Opera / Google / WHATWG',
		contribution: `Edited the HTML5 specification at the WHATWG from 2004, single-handedly turning the failed XHTML 2 path into a living standard the entire web platform now depends on. Also edited Server-Sent Events (first shipped in Opera in September 2006 as part of "Web Applications 1.0") and coined "WebSocket" in #whatwg IRC. WebSocket finalised as RFC 6455 in December 2011 under Ian Fette.

The amount of detailed specification work shipped under his name across two decades is exceptional even by IETF/W3C standards.`,
		imagePath:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/120px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg',
		protocols: ['websockets', 'sse'],
		categories: ['web-api'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Ian_Hickson',
			homepage: 'https://hixie.ch/'
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
