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
	}
];

export const rfcMap = new Map(rfcs.map((r) => [r.number, r]));

export function getRfcByNumber(num: string): Rfc | undefined {
	return rfcMap.get(num);
}

export function getRfcsForProtocol(protocolId: string): Rfc[] {
	return rfcs.filter((r) => r.protocols?.includes(protocolId));
}
