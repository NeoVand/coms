/**
 * RFCs — citations that appear repeatedly throughout the app.
 *
 * Centralized so an `<RfcRef number="9293" />` component can render the
 * canonical title + link without scattering URLs through prose. Keep
 * entries minimal — only RFCs we cite by name (not every RFC ever).
 */

export type RfcStatus =
	| 'internet-standard'
	| 'standards-track'
	| 'proposed-standard'
	| 'best-current-practice'
	| 'informational'
	| 'experimental'
	| 'historic'
	| 'draft';

export interface RfcSection {
	/** Section reference, e.g., "3.1", "§4.2". */
	ref: string;
	description: string;
}

export interface Rfc {
	/** RFC number as a string (e.g., "9293") or canonical id ("STD 7"). */
	number: string;
	title: string;
	year: number;
	authors?: string;
	status?: RfcStatus;
	obsoletes?: string[];
	obsoletedBy?: string[];
	url: string;
	/** Sections worth pointing at directly. */
	notableSections?: RfcSection[];
	/** Protocol IDs this RFC defines or extends. */
	protocols?: string[];
}

export const rfcs: Rfc[] = [
	// ── Foundational L3/L2 ────────────────────────────────────────────
	{
		number: '791',
		title: 'Internet Protocol',
		year: 1981,
		authors: 'Jon Postel (ed.)',
		status: 'internet-standard',
		obsoletedBy: ['9293'],
		url: 'https://www.rfc-editor.org/rfc/rfc791',
		protocols: ['ip'],
		notableSections: [
			{ ref: '§3.1', description: 'IPv4 header format' },
			{ ref: '§3.2', description: 'Fragmentation' }
		]
	},
	{
		number: '792',
		title: 'Internet Control Message Protocol',
		year: 1981,
		authors: 'Jon Postel',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc792',
		protocols: ['icmp'],
		notableSections: [
			{ ref: 'Echo', description: 'Echo Request / Echo Reply (the engine of ping)' },
			{ ref: 'Time Exceeded', description: 'TTL-decrement messages (the engine of traceroute)' }
		]
	},
	{
		number: '826',
		title: 'An Ethernet Address Resolution Protocol',
		year: 1982,
		authors: 'David C. Plummer',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc826',
		protocols: ['arp']
	},
	{
		number: '1918',
		title: 'Address Allocation for Private Internets',
		year: 1996,
		authors: 'Y. Rekhter et al.',
		status: 'best-current-practice',
		url: 'https://datatracker.ietf.org/doc/html/rfc1918',
		protocols: ['ip']
	},
	{
		number: '4271',
		title: 'A Border Gateway Protocol 4 (BGP-4)',
		year: 2006,
		authors: 'Y. Rekhter, T. Li, S. Hares (eds.)',
		status: 'standards-track',
		obsoletes: ['1771'],
		url: 'https://www.rfc-editor.org/rfc/rfc4271',
		protocols: ['bgp'],
		notableSections: [
			{ ref: '§5', description: 'Path attributes' },
			{ ref: '§9', description: 'UPDATE handling and decision process' }
		]
	},
	{
		number: '4861',
		title: 'Neighbor Discovery for IP Version 6 (IPv6)',
		year: 2007,
		authors: 'T. Narten et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4861',
		protocols: ['ipv6']
	},
	{
		number: '4862',
		title: 'IPv6 Stateless Address Autoconfiguration',
		year: 2007,
		authors: 'S. Thomson, T. Narten, T. Jinmei',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4862',
		protocols: ['ipv6']
	},
	{
		number: '8200',
		title: 'Internet Protocol, Version 6 (IPv6) Specification',
		year: 2017,
		authors: 'S. Deering, R. Hinden',
		status: 'internet-standard',
		obsoletes: ['2460'],
		url: 'https://datatracker.ietf.org/doc/html/rfc8200',
		protocols: ['ipv6'],
		notableSections: [
			{ ref: '§3', description: 'Header format' },
			{ ref: '§4', description: 'Extension headers' },
			{ ref: '§5', description: 'Packet size + minimum link MTU (1280 bytes)' }
		]
	},

	// ── Transport ─────────────────────────────────────────────────────
	{
		number: '768',
		title: 'User Datagram Protocol',
		year: 1980,
		authors: 'Jon Postel',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc768',
		protocols: ['udp']
	},
	{
		number: '9293',
		title: 'Transmission Control Protocol (TCP)',
		year: 2022,
		authors: 'W. Eddy (ed.), MTI Systems',
		status: 'internet-standard',
		obsoletes: ['793', '879', '2873', '6093', '6429', '6528', '6691'],
		url: 'https://datatracker.ietf.org/doc/html/rfc9293',
		protocols: ['tcp'],
		notableSections: [
			{ ref: '§3.1', description: 'TCP header format' },
			{ ref: '§3.4', description: 'Sequence numbers' },
			{ ref: '§3.5', description: 'Three-way handshake' },
			{ ref: '§3.8', description: 'Sliding window flow control' }
		]
	},
	{
		number: '5681',
		title: 'TCP Congestion Control',
		year: 2009,
		authors: 'M. Allman, V. Paxson, E. Blanton',
		status: 'standards-track',
		obsoletes: ['2581'],
		url: 'https://www.rfc-editor.org/rfc/rfc5681',
		protocols: ['tcp']
	},
	{
		number: '6298',
		title: "Computing TCP's Retransmission Timer",
		year: 2011,
		authors: 'V. Paxson, M. Allman, J. Chu, M. Sargent',
		status: 'standards-track',
		obsoletes: ['2988'],
		url: 'https://www.rfc-editor.org/rfc/rfc6298',
		protocols: ['tcp']
	},
	{
		number: '7323',
		title: 'TCP Extensions for High Performance',
		year: 2014,
		authors: 'D. Borman, B. Braden, V. Jacobson, R. Scheffenegger (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc7323',
		protocols: ['tcp'],
		notableSections: [
			{ ref: 'Window Scale', description: 'Lets the 16-bit receive window represent up to 2³⁰ bytes' },
			{ ref: 'Timestamps + PAWS', description: 'Protection Against Wrapped Sequence numbers' }
		]
	},
	{
		number: '8985',
		title: 'The RACK-TLP Loss Detection Algorithm for TCP',
		year: 2021,
		authors: 'Y. Cheng, N. Cardwell, N. Dukkipati, P. Jha',
		status: 'standards-track',
		url: 'https://datatracker.ietf.org/doc/rfc8985/',
		protocols: ['tcp']
	},
	{
		number: '9438',
		title: 'CUBIC for Fast and Long-Distance Networks',
		year: 2023,
		authors: 'L. Xu, S. Ha, I. Rhee, V. Goel, L. Eggert (ed.)',
		status: 'standards-track',
		obsoletes: ['8312'],
		url: 'https://www.rfc-editor.org/rfc/rfc9438.html',
		protocols: ['tcp']
	},
	{
		number: '9000',
		title: 'QUIC: A UDP-Based Multiplexed and Secure Transport',
		year: 2021,
		authors: 'J. Iyengar, M. Thomson (eds.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9000',
		protocols: ['quic'],
		notableSections: [
			{ ref: '§5', description: 'Connections (Connection IDs, paths, migration)' },
			{ ref: '§13', description: 'Loss recovery and congestion control' },
			{ ref: '§17', description: 'Packet header formats (long / short)' }
		]
	},
	{
		number: '9221',
		title: 'An Unreliable Datagram Extension to QUIC',
		year: 2022,
		authors: 'T. Pauly, E. Kinnear, D. Schinazi',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/rfc9221/',
		protocols: ['quic']
	},
	{
		number: '9330',
		title: 'Low Latency, Low Loss, and Scalable Throughput (L4S) — Architecture',
		year: 2023,
		authors: 'B. Briscoe (ed.) et al.',
		status: 'informational',
		url: 'https://datatracker.ietf.org/doc/rfc9330/',
		protocols: ['tcp', 'quic']
	},

	// ── Web / API ─────────────────────────────────────────────────────
	{
		number: '9110',
		title: 'HTTP Semantics',
		year: 2022,
		authors: 'R. Fielding, M. Nottingham, J. Reschke (eds.)',
		status: 'internet-standard',
		obsoletes: ['7230', '7231', '7232', '7233', '7234', '7235'],
		url: 'https://datatracker.ietf.org/doc/rfc9110/',
		protocols: ['http1', 'http2', 'http3'],
		notableSections: [
			{ ref: '§9.2.2', description: 'Idempotent methods (PUT, DELETE, GET)' },
			{ ref: '§12', description: 'Content negotiation' }
		]
	},
	{
		number: '9112',
		title: 'HTTP/1.1',
		year: 2022,
		authors: 'R. Fielding, M. Nottingham, J. Reschke (eds.)',
		status: 'internet-standard',
		url: 'https://datatracker.ietf.org/doc/rfc9112/',
		protocols: ['http1']
	},
	{
		number: '9113',
		title: 'HTTP/2',
		year: 2022,
		authors: 'M. Thomson, C. Benfield (eds.)',
		status: 'proposed-standard',
		obsoletes: ['7540'],
		url: 'https://www.rfc-editor.org/rfc/rfc9113.html',
		protocols: ['http2']
	},
	{
		number: '9114',
		title: 'HTTP/3',
		year: 2022,
		authors: 'M. Bishop (ed.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9114',
		protocols: ['http3']
	},
	{
		number: '6455',
		title: 'The WebSocket Protocol',
		year: 2011,
		authors: 'I. Fette, A. Melnikov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6455',
		protocols: ['websockets']
	},

	// ── Utilities / Security ──────────────────────────────────────────
	{
		number: '1035',
		title: 'Domain Names — Implementation and Specification',
		year: 1987,
		authors: 'P. Mockapetris',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc1035',
		protocols: ['dns']
	},
	{
		number: '8446',
		title: 'The Transport Layer Security (TLS) Protocol Version 1.3',
		year: 2018,
		authors: 'E. Rescorla',
		status: 'proposed-standard',
		obsoletes: ['5077', '5246', '6961'],
		url: 'https://datatracker.ietf.org/doc/html/rfc8446',
		protocols: ['tls'],
		notableSections: [
			{ ref: '§5', description: 'Record Protocol' },
			{ ref: '§7.1', description: 'Key schedule (HKDF-Extract / HKDF-Expand-Label)' },
			{ ref: '§D.4', description: "Middlebox-compatibility hacks (\"looks like TLS 1.2\")" }
		]
	},
	{
		number: '5905',
		title: 'Network Time Protocol Version 4: Protocol and Algorithms Specification',
		year: 2010,
		authors: 'D. Mills, J. Martin, J. Burbank, W. Kasch',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc5905',
		protocols: ['ntp']
	},
	{
		number: '1122',
		title: 'Requirements for Internet Hosts — Communication Layers',
		year: 1989,
		authors: 'R. Braden (ed.)',
		status: 'internet-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc1122',
		protocols: ['tcp', 'udp', 'ip', 'icmp']
	},

	// ── Audit-added stubs ────────────────────────────────────────────────
	// Surfaced by `npx tsx scripts/audit-terms.ts` — RFCs that prose
	// already references but that lacked a registry entry. Stubs let the
	// `[[rfc:NNNN]]` link wrapper resolve to a real title + URL even
	// before someone writes the long-form notable-sections detail.

	// Historic IP / TCP / UDP foundations
	{
		number: '760',
		title: 'DoD Standard Internet Protocol',
		year: 1980,
		authors: 'J. Postel',
		status: 'historic',
		obsoletedBy: ['791'],
		url: 'https://www.rfc-editor.org/rfc/rfc760',
		protocols: ['ip']
	},
	{
		number: '793',
		title: 'Transmission Control Protocol',
		year: 1981,
		authors: 'J. Postel',
		status: 'historic',
		obsoletedBy: ['9293'],
		url: 'https://www.rfc-editor.org/rfc/rfc793',
		protocols: ['tcp']
	},
	{
		number: '2018',
		title: 'TCP Selective Acknowledgment Options',
		year: 1996,
		authors: 'M. Mathis, J. Mahdavi, S. Floyd, A. Romanow',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc2018',
		protocols: ['tcp']
	},
	{
		number: '1948',
		title: 'Defending Against Sequence Number Attacks',
		year: 1996,
		authors: 'S. Bellovin',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc1948',
		protocols: ['tcp']
	},
	{
		number: '4821',
		title: 'Packetization Layer Path MTU Discovery',
		year: 2007,
		authors: 'M. Mathis, J. Heffner',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc4821',
		protocols: ['tcp']
	},
	{
		number: '4987',
		title: 'TCP SYN Flooding Attacks and Common Mitigations',
		year: 2007,
		authors: 'W. Eddy',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc4987',
		protocols: ['tcp']
	},
	{
		number: '5925',
		title: 'The TCP Authentication Option',
		year: 2010,
		authors: 'J. Touch, A. Mankin, R. Bonica',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc5925',
		protocols: ['tcp']
	},
	{
		number: '6824',
		title: 'TCP Extensions for Multipath Operation with Multiple Addresses',
		year: 2013,
		authors: 'A. Ford, C. Raiciu, M. Handley, O. Bonaventure',
		status: 'experimental',
		obsoletedBy: ['8684'],
		url: 'https://www.rfc-editor.org/rfc/rfc6824',
		protocols: ['mptcp']
	},
	{
		number: '8684',
		title: 'TCP Extensions for Multipath Operation with Multiple Addresses (v1)',
		year: 2020,
		authors: 'A. Ford, C. Raiciu, M. Handley, O. Bonaventure, C. Paasch',
		status: 'standards-track',
		obsoletes: ['6824'],
		url: 'https://www.rfc-editor.org/rfc/rfc8684',
		protocols: ['mptcp']
	},

	// MPTCP / SCTP family
	{
		number: '2960',
		title: 'Stream Control Transmission Protocol',
		year: 2000,
		authors: 'R. Stewart et al.',
		status: 'historic',
		obsoletedBy: ['9260'],
		url: 'https://www.rfc-editor.org/rfc/rfc2960',
		protocols: ['sctp']
	},
	{
		number: '4960',
		title: 'Stream Control Transmission Protocol',
		year: 2007,
		authors: 'R. Stewart (ed.)',
		status: 'historic',
		obsoletes: ['2960'],
		obsoletedBy: ['9260'],
		url: 'https://www.rfc-editor.org/rfc/rfc4960',
		protocols: ['sctp']
	},
	{
		number: '9260',
		title: 'Stream Control Transmission Protocol',
		year: 2022,
		authors: 'R. Stewart, M. Tüxen, K. Nielsen',
		status: 'proposed-standard',
		obsoletes: ['4960'],
		url: 'https://www.rfc-editor.org/rfc/rfc9260',
		protocols: ['sctp']
	},
	{
		number: '6951',
		title: 'UDP Encapsulation of SCTP Packets for End-Host to End-Host Communication',
		year: 2013,
		authors: 'M. Tüxen, R. Stewart',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6951',
		protocols: ['sctp']
	},

	// Original IPv6 / IP utilities
	{
		number: '2460',
		title: 'Internet Protocol, Version 6 (IPv6) Specification',
		year: 1998,
		authors: 'S. Deering, R. Hinden',
		status: 'historic',
		obsoletedBy: ['8200'],
		url: 'https://www.rfc-editor.org/rfc/rfc2460',
		protocols: ['ipv6']
	},
	{
		number: '6434',
		title: 'IPv6 Node Requirements',
		year: 2011,
		authors: 'E. Jankiewicz, J. Loughney, T. Narten',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc6434',
		protocols: ['ipv6']
	},
	{
		number: '6864',
		title: 'Updated Specification of the IPv4 ID Field',
		year: 2013,
		authors: 'J. Touch',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6864',
		protocols: ['ip']
	},
	{
		number: '6877',
		title: '464XLAT: Combination of Stateful and Stateless Translation',
		year: 2013,
		authors: 'M. Mawatari, M. Kawashima, C. Byrne',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc6877',
		protocols: ['ipv6']
	},
	{
		number: '8305',
		title: 'Happy Eyeballs Version 2: Better Connectivity Using Concurrency',
		year: 2017,
		authors: 'D. Schinazi, T. Pauly',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8305',
		protocols: ['ipv6']
	},
	{
		number: '8781',
		title: 'Discovering PREF64 in Router Advertisements',
		year: 2020,
		authors: 'L. Colitti, J. Linkova',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8781',
		protocols: ['ipv6']
	},
	{
		number: '8925',
		title: 'IPv6-Only Preferred Option for DHCPv4',
		year: 2020,
		authors: 'L. Colitti, J. Linkova, M. Richardson, T. Mrugalski',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8925',
		protocols: ['ipv6', 'dhcp']
	},
	{
		number: '8981',
		title: 'Temporary Address Extensions for Stateless Address Autoconfiguration in IPv6',
		year: 2021,
		authors: 'F. Gont, S. Krishnan, T. Narten, R. Draves',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc8981',
		protocols: ['ipv6']
	},
	{
		number: '2468',
		title: 'I REMEMBER IANA',
		year: 1998,
		authors: 'V. Cerf',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc2468'
	},

	// BGP family
	{
		number: '1105',
		title: 'A Border Gateway Protocol (BGP)',
		year: 1989,
		authors: 'K. Lougheed, Y. Rekhter',
		status: 'historic',
		obsoletedBy: ['4271'],
		url: 'https://www.rfc-editor.org/rfc/rfc1105',
		protocols: ['bgp']
	},
	{
		number: '2918',
		title: 'Route Refresh Capability for BGP-4',
		year: 2000,
		authors: 'E. Chen',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc2918',
		protocols: ['bgp']
	},
	{
		number: '5082',
		title: 'The Generalized TTL Security Mechanism (GTSM)',
		year: 2007,
		authors: 'V. Gill, J. Heasley, D. Meyer, P. Savola (ed.), C. Pignataro',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5082',
		protocols: ['bgp']
	},
	{
		number: '5575',
		title: 'Dissemination of Flow Specification Rules',
		year: 2009,
		authors: 'P. Marques et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5575',
		protocols: ['bgp']
	},
	{
		number: '8205',
		title: 'BGPsec Protocol Specification',
		year: 2017,
		authors: 'M. Lepinski (ed.), K. Sriram (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc8205',
		protocols: ['bgp']
	},
	{
		number: '9234',
		title: 'Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages',
		year: 2022,
		authors: 'A. Azimov, E. Bogomazov, R. Bush, K. Patel, K. Sriram',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9234',
		protocols: ['bgp']
	},

	// HTTP family (older + 7540)
	{
		number: '1945',
		title: 'Hypertext Transfer Protocol — HTTP/1.0',
		year: 1996,
		authors: 'T. Berners-Lee, R. Fielding, H. Frystyk',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc1945',
		protocols: ['http1']
	},
	{
		number: '2068',
		title: 'Hypertext Transfer Protocol — HTTP/1.1',
		year: 1997,
		authors: 'R. Fielding, J. Gettys, J. Mogul, H. Frystyk, T. Berners-Lee',
		status: 'historic',
		obsoletedBy: ['2616'],
		url: 'https://www.rfc-editor.org/rfc/rfc2068',
		protocols: ['http1']
	},
	{
		number: '2616',
		title: 'Hypertext Transfer Protocol — HTTP/1.1',
		year: 1999,
		authors: 'R. Fielding, J. Gettys, J. Mogul, H. Frystyk, L. Masinter, P. Leach, T. Berners-Lee',
		status: 'historic',
		obsoletes: ['2068'],
		obsoletedBy: ['7230', '7231', '7232', '7233', '7234', '7235'],
		url: 'https://www.rfc-editor.org/rfc/rfc2616',
		protocols: ['http1']
	},
	{
		number: '7540',
		title: 'Hypertext Transfer Protocol Version 2 (HTTP/2)',
		year: 2015,
		authors: 'M. Belshe, R. Peon, M. Thomson (ed.)',
		status: 'historic',
		obsoletedBy: ['9113'],
		url: 'https://www.rfc-editor.org/rfc/rfc7540',
		protocols: ['http2']
	},

	// DNS family
	{
		number: '882',
		title: 'Domain Names — Concepts and Facilities',
		year: 1983,
		authors: 'P. Mockapetris',
		status: 'historic',
		obsoletedBy: ['1034'],
		url: 'https://www.rfc-editor.org/rfc/rfc882',
		protocols: ['dns']
	},
	{
		number: '1034',
		title: 'Domain Names — Concepts and Facilities',
		year: 1987,
		authors: 'P. Mockapetris',
		status: 'internet-standard',
		obsoletes: ['882'],
		url: 'https://www.rfc-editor.org/rfc/rfc1034',
		protocols: ['dns']
	},
	{
		number: '7686',
		title: 'The ".onion" Special-Use Domain Name',
		year: 2015,
		authors: 'J. Appelbaum, A. Muffett',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7686',
		protocols: ['dns']
	},
	{
		number: '7858',
		title: 'Specification for DNS over Transport Layer Security (TLS)',
		year: 2016,
		authors: 'Z. Hu, L. Zhu, J. Heidemann, A. Mankin, D. Wessels, P. Hoffman',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7858',
		protocols: ['dns']
	},
	{
		number: '8484',
		title: 'DNS Queries over HTTPS (DoH)',
		year: 2018,
		authors: 'P. Hoffman, P. McManus',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8484',
		protocols: ['dns']
	},
	{
		number: '9460',
		title: 'Service Binding and Parameter Specification via the DNS (SVCB and HTTPS Resource Records)',
		year: 2023,
		authors: 'B. Schwartz, M. Bishop, E. Nygren',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9460',
		protocols: ['dns']
	},
	{
		number: '9499',
		title: 'DNS Terminology',
		year: 2024,
		authors: 'P. Hoffman, A. Sullivan, K. Fujiwara',
		status: 'best-current-practice',
		url: 'https://www.rfc-editor.org/rfc/rfc9499',
		protocols: ['dns']
	},

	// Email
	{
		number: '821',
		title: 'Simple Mail Transfer Protocol',
		year: 1982,
		authors: 'J. Postel',
		status: 'historic',
		obsoletedBy: ['2821', '5321'],
		url: 'https://www.rfc-editor.org/rfc/rfc821',
		protocols: ['smtp']
	},
	{
		number: '822',
		title: 'Standard for the Format of ARPA Internet Text Messages',
		year: 1982,
		authors: 'D. Crocker',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc822',
		protocols: ['smtp']
	},
	{
		number: '5321',
		title: 'Simple Mail Transfer Protocol',
		year: 2008,
		authors: 'J. Klensin',
		status: 'standards-track',
		obsoletes: ['821', '2821'],
		url: 'https://www.rfc-editor.org/rfc/rfc5321',
		protocols: ['smtp']
	},
	{
		number: '6409',
		title: 'Message Submission for Mail',
		year: 2011,
		authors: 'R. Gellens, J. Klensin',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6409',
		protocols: ['smtp']
	},
	{
		number: '8314',
		title: 'Cleartext Considered Obsolete: Use of Transport Layer Security (TLS) for Email Submission and Access',
		year: 2018,
		authors: 'K. Moore, C. Newman',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8314',
		protocols: ['smtp', 'imap']
	},
	{
		number: '1064',
		title: 'Interactive Mail Access Protocol — Version 2',
		year: 1988,
		authors: 'M. Crispin',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc1064',
		protocols: ['imap']
	},
	{
		number: '9051',
		title: 'Internet Message Access Protocol (IMAP) — Version 4rev2',
		year: 2021,
		authors: 'A. Melnikov, B. Leiba (eds.)',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9051',
		protocols: ['imap']
	},

	// File transfer
	{
		number: '114',
		title: 'A File Transfer Protocol',
		year: 1971,
		authors: 'A. Bhushan',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc114',
		protocols: ['ftp']
	},
	{
		number: '959',
		title: 'File Transfer Protocol (FTP)',
		year: 1985,
		authors: 'J. Postel, J. Reynolds',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc959',
		protocols: ['ftp']
	},

	// SSH
	{
		number: '4251',
		title: 'The Secure Shell (SSH) Protocol Architecture',
		year: 2006,
		authors: 'T. Ylonen, C. Lonvick (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4251',
		protocols: ['ssh']
	},
	{
		number: '4253',
		title: 'The Secure Shell (SSH) Transport Layer Protocol',
		year: 2006,
		authors: 'T. Ylonen, C. Lonvick (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4253',
		protocols: ['ssh']
	},

	// TLS predecessors
	{
		number: '2246',
		title: 'The TLS Protocol Version 1.0',
		year: 1999,
		authors: 'T. Dierks, C. Allen',
		status: 'historic',
		obsoletedBy: ['4346'],
		url: 'https://www.rfc-editor.org/rfc/rfc2246',
		protocols: ['tls']
	},
	{
		number: '5630',
		title: 'The Use of the SIPS URI Scheme in the Session Initiation Protocol (SIP)',
		year: 2009,
		authors: 'F. Audet',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5630',
		protocols: ['sip', 'tls']
	},
	{
		number: '9849',
		title: 'TLS Encrypted Client Hello (ECH) — registration entries',
		year: 2025,
		authors: 'IETF (TLS WG)',
		status: 'draft',
		url: 'https://www.rfc-editor.org/rfc/rfc9849',
		protocols: ['tls']
	},

	// DHCP
	{
		number: '1531',
		title: 'Dynamic Host Configuration Protocol',
		year: 1993,
		authors: 'R. Droms',
		status: 'historic',
		obsoletedBy: ['2131'],
		url: 'https://www.rfc-editor.org/rfc/rfc1531',
		protocols: ['dhcp']
	},
	{
		number: '2131',
		title: 'Dynamic Host Configuration Protocol',
		year: 1997,
		authors: 'R. Droms',
		status: 'standards-track',
		obsoletes: ['1531'],
		url: 'https://www.rfc-editor.org/rfc/rfc2131',
		protocols: ['dhcp']
	},

	// NTP older
	{
		number: '958',
		title: 'Network Time Protocol (NTP)',
		year: 1985,
		authors: 'D. Mills',
		status: 'historic',
		obsoletedBy: ['1059', '1119', '1305', '5905'],
		url: 'https://www.rfc-editor.org/rfc/rfc958',
		protocols: ['ntp']
	},

	// SIP / RTP / SDP / RTSP / SRTP / streaming
	{
		number: '3261',
		title: 'SIP: Session Initiation Protocol',
		year: 2002,
		authors: 'J. Rosenberg et al.',
		status: 'proposed-standard',
		obsoletes: ['2543'],
		url: 'https://www.rfc-editor.org/rfc/rfc3261',
		protocols: ['sip']
	},
	{
		number: '2543',
		title: 'SIP: Session Initiation Protocol',
		year: 1999,
		authors: 'M. Handley, H. Schulzrinne, E. Schooler, J. Rosenberg',
		status: 'historic',
		obsoletedBy: ['3261'],
		url: 'https://www.rfc-editor.org/rfc/rfc2543',
		protocols: ['sip']
	},
	{
		number: '1889',
		title: 'RTP: A Transport Protocol for Real-Time Applications',
		year: 1996,
		authors: 'H. Schulzrinne, S. Casner, R. Frederick, V. Jacobson',
		status: 'historic',
		obsoletedBy: ['3550'],
		url: 'https://www.rfc-editor.org/rfc/rfc1889',
		protocols: ['rtp']
	},
	{
		number: '3550',
		title: 'RTP: A Transport Protocol for Real-Time Applications',
		year: 2003,
		authors: 'H. Schulzrinne, S. Casner, R. Frederick, V. Jacobson',
		status: 'internet-standard',
		obsoletes: ['1889'],
		url: 'https://www.rfc-editor.org/rfc/rfc3550',
		protocols: ['rtp']
	},
	{
		number: '2327',
		title: 'SDP: Session Description Protocol',
		year: 1998,
		authors: 'M. Handley, V. Jacobson',
		status: 'historic',
		obsoletedBy: ['4566'],
		url: 'https://www.rfc-editor.org/rfc/rfc2327',
		protocols: ['sdp']
	},
	{
		number: '8216',
		title: 'HTTP Live Streaming',
		year: 2017,
		authors: 'R. Pantos (ed.), W. May',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc8216',
		protocols: ['hls']
	},
	{
		number: '8866',
		title: 'SDP: Session Description Protocol',
		year: 2021,
		authors: 'A. Begen, P. Kyzivat, C. Perkins, M. Handley',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8866',
		protocols: ['sdp']
	},

	// WebRTC + data channels
	{
		number: '8825',
		title: 'Overview: Real-Time Protocols for Browser-Based Applications',
		year: 2021,
		authors: 'H. Alvestrand',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8825',
		protocols: ['webrtc']
	},
	{
		number: '8831',
		title: 'WebRTC Data Channels',
		year: 2021,
		authors: 'R. Jesup, S. Loreto, M. Tüxen',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8831',
		protocols: ['webrtc']
	},

	// XMPP
	{
		number: '6120',
		title: 'Extensible Messaging and Presence Protocol (XMPP): Core',
		year: 2011,
		authors: 'P. Saint-Andre',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6120',
		protocols: ['xmpp']
	},
	{
		number: '7395',
		title: 'An Extensible Messaging and Presence Protocol (XMPP) Subprotocol for WebSocket',
		year: 2014,
		authors: 'L. Stout (ed.), J. Moffitt, E. Cestari',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7395',
		protocols: ['xmpp', 'websockets']
	},

	// CoAP / IoT
	{
		number: '7252',
		title: 'The Constrained Application Protocol (CoAP)',
		year: 2014,
		authors: 'Z. Shelby, K. Hartke, C. Bormann',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7252',
		protocols: ['coap']
	},
	{
		number: '8613',
		title: 'Object Security for Constrained RESTful Environments (OSCORE)',
		year: 2019,
		authors: 'G. Selander, J. Mattsson, F. Palombini, L. Seitz',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8613',
		protocols: ['coap']
	},

	// OAuth
	{
		number: '6749',
		title: 'The OAuth 2.0 Authorization Framework',
		year: 2012,
		authors: 'D. Hardt (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc6749',
		protocols: ['oauth2']
	},
	{
		number: '7636',
		title: 'Proof Key for Code Exchange by OAuth Public Clients',
		year: 2015,
		authors: 'N. Sakimura (ed.), J. Bradley, N. Agarwal',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc7636',
		protocols: ['oauth2']
	}
];

export const rfcMap = new Map(rfcs.map((r) => [r.number, r]));

export function getRfcByNumber(num: string): Rfc | undefined {
	return rfcMap.get(num);
}

export function getRfcsForProtocol(protocolId: string): Rfc[] {
	return rfcs.filter((r) => r.protocols?.includes(protocolId));
}
