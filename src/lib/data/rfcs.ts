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
	/**
	 * 1–3 paragraphs of plain-English explanation: what the RFC defines,
	 * why it exists, and what it changed. Rich-text-parsed (supports
	 * `[[rfc:…]]`, `[[pioneer:…]]`, `{{concept-id|label}}`, **bold**,
	 * `*italic*`, `` `code` ``). Shown prominently on the RFC page so
	 * the reader has context before deciding whether to read the spec.
	 */
	abstract?: string;
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
		abstract: `The defining specification of [[ip|IPv4]] — the connectionless, best-effort packet protocol that interconnects every network on the internet. Defines the 32-bit address space, the 20-byte minimum header (source/destination, TTL, protocol, header checksum, fragmentation fields), and the rules for routers to decrement TTL, fragment when needed, and drop packets that can't be delivered.

Edited by [[pioneer:jon-postel|Jon Postel]] at ISI in September 1981 alongside [[rfc:792|RFC 792]] (ICMP) and [[rfc:9293|RFC 793]] (TCP). Stayed the canonical IPv4 spec for 41 years until [[rfc:9293|RFC 9293]] consolidated TCP errata in 2022; IPv4 itself is still defined here.`
	},
	{
		number: '792',
		title: 'Internet Control Message Protocol',
		year: 1981,
		authors: 'Jon Postel',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc792',
		protocols: ['icmp'],
		abstract: `Defines [[icmp|ICMP]] — the control-plane protocol IP hosts and routers use to report errors and probe reachability. The most familiar messages are *Echo Request / Echo Reply* (the basis of \`ping\`) and *Time Exceeded* (sent when a router decrements TTL to zero, the trick \`traceroute\` uses to discover each {{hop|hop}}). Other messages cover *Destination Unreachable*, *Redirect*, *Source Quench*, and *Parameter Problem*.

[[rfc:1122|RFC 1122]] §3.2.2 declares ICMP "an integral part of IP" — every IP host MUST implement it. Dropping ICMP at firewalls is a frequent root cause of {{mtu-black-hole|MTU black holes}} and silently broken Path MTU Discovery. IPv6 has its own equivalent in [[rfc:4443|RFC 4443]] (ICMPv6).`
	},
	{
		number: '826',
		title: 'An Ethernet Address Resolution Protocol',
		year: 1982,
		authors: 'David C. Plummer',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc826',
		protocols: ['arp'],
		abstract: `Defines [[arp|ARP]] — the elegantly simple {{broadcast|broadcast}} protocol that maps a 32-bit IPv4 address to the 48-bit Ethernet [[mac-address|MAC address]] needed to actually deliver a frame on a local link. A host that wants to send to \`192.0.2.5\` broadcasts "who has 192.0.2.5?"; the owner replies with its MAC; the result is cached for a few minutes.

David Plummer wrote it at MIT-AI in November 1982. **STD 37 has not been obsoleted in over 40 years** — the wire format outlived Token Ring, FDDI, ATM, and Frame Relay because HLEN/PLEN are variable on purpose. ARP has no checksum and no authentication, which is why ARP {{spoofing|spoofing}} remains a textbook layer-2 attack and why every enterprise switch ships *Dynamic ARP Inspection*.`
	},
	{
		number: '1918',
		title: 'Address Allocation for Private Internets',
		year: 1996,
		authors: 'Y. Rekhter et al.',
		status: 'best-current-practice',
		url: 'https://datatracker.ietf.org/doc/html/rfc1918',
		protocols: ['ip'],
		abstract: `Reserves three IPv4 address ranges — \`10.0.0.0/8\`, \`172.16.0.0/12\`, and \`192.168.0.0/16\` — for use within private networks that don't need globally routable addresses. Routers on the public internet MUST NOT forward packets with these source or destination addresses; that's what makes them safe to reuse inside every home and office on earth.

Combined with [[rfc:3022|NAT]], private addressing extended IPv4's lifespan by roughly two decades past the point at which the original 4.3-billion-address space would otherwise have run out. The same allocation also reserves \`169.254.0.0/16\` for link-local autoconfiguration. IPv6 obsoletes the *need* for this scheme but the addresses are still ubiquitous.`
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
		abstract: `The current specification of [[bgp|BGP-4]] — the path-vector protocol every transit and peering relationship on the public internet uses to exchange reachability information between {{autonomous-system|autonomous systems}}. Defines the OPEN/UPDATE/KEEPALIVE/NOTIFICATION messages, the NLRI encoding for prefixes, the path attributes (AS_PATH, NEXT_HOP, MULTI_EXIT_DISC, LOCAL_PREF, COMMUNITIES, …), and the *decision process* a router uses to pick the best route from competing announcements.

Edited by [[pioneer:yakov-rekhter|Yakov Rekhter]] et al., consolidating two decades of incremental extensions on top of the original 1989 [[rfc:1105|RFC 1105]] sketch. As of 2026 BGP carries roughly 1M IPv4 and 225k IPv6 prefixes globally. The protocol's open-trust model is also the root cause of every major {{bgp-hijack|BGP hijack}} incident; [[rfc:8205|RFC 8205]] (BGPsec) and RPKI-ROV are the slow-rolling cryptographic answers.`
	},
	{
		number: '4861',
		title: 'Neighbor Discovery for IP Version 6 (IPv6)',
		year: 2007,
		authors: 'T. Narten et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4861',
		protocols: ['ipv6'],
		abstract: `Defines the IPv6 *Neighbor Discovery Protocol* (NDP) — the IPv6 equivalent of [[arp|ARP]] plus ICMP Router Discovery plus Redirect, all consolidated into one protocol on top of [[icmp|ICMPv6]]. Hosts use NDP to discover routers (Router Solicitation / Router Advertisement), resolve link-layer addresses (Neighbor Solicitation / Neighbor Advertisement via solicited-node {{multicast|multicast}}), and detect when a neighbour has gone away.

Operates entirely over ICMPv6, with no [[arp|ARP]]-style {{broadcast|broadcast}} (IPv6 has no broadcast). The cryptographic counterpart is *SEND* ([[rfc:3971|RFC 3971]]) using cryptographically generated addresses to defeat NDP {{spoofing|spoofing}}; deployment has been minimal.`
	},
	{
		number: '4862',
		title: 'IPv6 Stateless Address Autoconfiguration',
		year: 2007,
		authors: 'S. Thomson, T. Narten, T. Jinmei',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4862',
		protocols: ['ipv6'],
		abstract: `Specifies *SLAAC* — the mechanism by which an IPv6 host generates its own globally-routable address by combining a network prefix learned from a Router Advertisement with an interface identifier (originally derived from the {{mac-address|MAC}} via EUI-64, now usually random). No [[dhcp|DHCP]] server required: plug in, pick up an address, go.

The original EUI-64 form embedded the MAC into the IPv6 address — a privacy leak that lets a device be tracked across networks. [[rfc:8981|RFC 8981]] (Privacy Extensions) replaces it with randomised, periodically-rotating identifiers and is now the default in every major OS.`
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
		abstract: `The current Internet Standard defining [[ipv6|IPv6]]: 128-bit addresses (3.4 × 10³⁸), a fixed 40-byte header (no options, no header {{checksum|checksum}}, no in-network {{fragmentation|fragmentation}}), and a chained "extension header" mechanism for everything that used to live in IPv4 options. The minimum link MTU is **1280 bytes**, and routers may not fragment — senders MUST do {{path-mtu-discovery|Path MTU Discovery}}.

[[pioneer:steve-deering|Steve Deering]] and Bob Hinden are the primary architects, building on three decades of IPv6 work: [[rfc:1883|RFC 1883]] (1995), [[rfc:2460|RFC 2460]] (1998), and now this Internet Standard 86 (2017). On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time — 28 years after the protocol was first specified.`
	},

	// ── Transport ─────────────────────────────────────────────────────
	{
		number: '768',
		title: 'User Datagram Protocol',
		year: 1980,
		authors: 'Jon Postel',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc768',
		protocols: ['udp'],
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s three-page specification of [[udp|UDP]] — the minimal {{connectionless|connectionless}} transport. An 8-byte header (source port, destination port, length, {{checksum|checksum}}) on top of [[ip|IP]], no setup, no acknowledgements, no flow control, no {{retransmission|retransmission}}. The application owns reliability if it needs any.

Published August 1980, two months before the first version of TCP. **It has not been updated since.** Three pages were enough; everything UDP doesn't do is the point. UDP is what makes [[dns|DNS]], [[ntp|NTP]], [[quic|QUIC]], [[webrtc|WebRTC]], and almost every real-time protocol possible.`
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
		abstract: `The current Internet Standard for [[tcp|TCP]] — the reliable, ordered, byte-stream transport that powers most of the application internet. Defines the {{three-way-handshake|three-way handshake}}, {{sequence-number|sequence numbers}}, the {{sliding-window|sliding window}} flow control, the FIN-based teardown, and the {{time-wait|TIME_WAIT}} state. The actual congestion-control behaviour lives in companion RFCs ([[rfc:5681|RFC 5681]], [[rfc:9438|RFC 9438]], …).

Edited by Wesley Eddy in August 2022, this RFC consolidated **41 years of errata** against [[rfc:793|RFC 793]] (1981) — the longest-lived unmodified core IETF spec ever — plus six more obsoleted RFCs. Almost certainly the highest-leverage cleanup commit in IETF history. The wire protocol is unchanged; the spec just finally matches what implementations actually do.`,
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
		protocols: ['tcp'],
		abstract: `Codifies the four canonical TCP {{congestion-control|congestion control}} algorithms — *Slow Start*, *Congestion Avoidance*, *Fast Retransmit*, and *Fast Recovery* — that emerged from [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels's response to the [[outage:nsfnet-1986-collapse|1986 NSFNET congestion collapse]]. The {{slow-start|slow start}} window grows exponentially after handshake until loss is observed, then {{congestion-avoidance|congestion avoidance}} switches to additive increase. Fast retransmit triggers on three duplicate ACKs.

This is the *behaviour* spec; modern algorithms ([[rfc:9438|CUBIC]], BBR, Prague-over-L4S) replace the curves but keep the four-phase loop. Effectively every TCP stack on earth implements this.`
	},
	{
		number: '6298',
		title: "Computing TCP's Retransmission Timer",
		year: 2011,
		authors: 'V. Paxson, M. Allman, J. Chu, M. Sargent',
		status: 'standards-track',
		obsoletes: ['2988'],
		url: 'https://www.rfc-editor.org/rfc/rfc6298',
		protocols: ['tcp'],
		abstract: `Specifies how a TCP sender computes its *Retransmission Timeout* (RTO) — when to give up waiting for an ACK and resend. Maintains an exponentially-weighted moving average of the round-trip time (SRTT) and its variance (RTTVAR), with RTO = SRTT + max(G, 4·RTTVAR), clamped to a minimum of 1 second. Karn's algorithm prevents poisoning the estimator from retransmitted segments.

The math originated in [[pioneer:van-jacobson|Van Jacobson]] and Karels's 1988 SIGCOMM paper; this RFC pins down the precise formulas every kernel uses. The 1-second floor is one of the most-debated defaults in networking — too aggressive for datacentres, conservative for the open internet.`
	},
	{
		number: '7323',
		title: 'TCP Extensions for High Performance',
		year: 2014,
		authors: 'D. Borman, B. Braden, V. Jacobson, R. Scheffenegger (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc7323',
		protocols: ['tcp'],
		abstract: `Defines the two TCP options that make modern long-fat-pipe networking tractable: *{{window-scale|Window Scale}}* and *Timestamps + PAWS*. Window Scale shifts the 16-bit receive window by up to 14 bits, raising the maximum advertised window from 64 KB to ~1 GB — without it, a 100 ms transcontinental link caps at ~5 Mbit/s regardless of available bandwidth. Timestamps enable accurate RTT measurement on retransmitted segments, and PAWS (*Protection Against Wrapped Sequence numbers*) prevents an old segment from re-entering a fast connection where {{sequence-number|sequence numbers}} cycle in seconds.

Originally published as RFC 1323 in 1992 by [[pioneer:van-jacobson|Van Jacobson]] et al.; refined and republished here. Both options are negotiated in the SYN — they're either there from the start or never.`,
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
		protocols: ['tcp'],
		abstract: `Replaces TCP's classic dup-ACK-based fast retransmit with two complementary mechanisms: *RACK* (Recent ACKnowledgment) infers loss from the time elapsed since the most recent acknowledged packet, and *TLP* (Tail Loss Probe) sends a probe at the end of a flight to recover quickly when no further ACKs would otherwise arrive.

Authored at Google by Yuchung Cheng, Neal Cardwell, et al. RACK detects losses much faster than three-dup-ACK in modern bursty / reordered traffic, and TLP eliminates the painful RTO-driven recovery for the very common "lost the last segment" case. Default in Linux since 4.10 (2017).`
	},
	{
		number: '9438',
		title: 'CUBIC for Fast and Long-Distance Networks',
		year: 2023,
		authors: 'L. Xu, S. Ha, I. Rhee, V. Goel, L. Eggert (ed.)',
		status: 'standards-track',
		obsoletes: ['8312'],
		url: 'https://www.rfc-editor.org/rfc/rfc9438.html',
		protocols: ['tcp'],
		abstract: `The standards-track specification of {{cubic|CUBIC}} — the TCP congestion-control algorithm that has been the Linux default since kernel 2.6.19 (2006) and the de-facto default for most of the public internet for two decades. Replaces {{aimd|AIMD}}'s linear window growth with a cubic function of time-since-loss: aggressive recovery early, then a polite probe near the previous ceiling.

Designed by Sangtae Ha, Injong Rhee, and Lisong Xu; obsoletes the 2018 informational [[rfc:8312|RFC 8312]] and finally pins down the exact constants. CUBIC scales gracefully from a few-Mbps phone link to 100+ Gbps datacentre flows where Reno's "+1 packet per RTT" growth would take hours to refill the pipe.`
	},
	{
		number: '9000',
		title: 'QUIC: A UDP-Based Multiplexed and Secure Transport',
		year: 2021,
		authors: 'J. Iyengar, M. Thomson (eds.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9000',
		protocols: ['quic'],
		abstract: `The IETF specification of [[quic|QUIC]] — a reliable, multiplexed, encrypted transport that runs on top of [[udp|UDP]] in user space. Conceived at Google by [[pioneer:jim-roskind|Jim Roskind]] (gQUIC, 2012); standardised across a dozen IETF drafts and shipped as RFC 9000 in May 2021. The premise: UDP traverses every middlebox, so layer reliability + multiplexing + crypto on top of it and iterate by browser update instead of kernel upgrade.

Defines connection setup (single-RTT {{handshake|handshake}}, 0-RTT for resumption), independent {{stream|streams}} (a lost packet only blocks its own stream — no [[tcp|TCP]] {{head-of-line-blocking|head-of-line blocking}}), {{connection-migration|connection migration}} via Connection IDs (Wi-Fi-to-cellular without breaking the connection), and an integrated [[tls|TLS]] 1.3 binding. By 2026 Meta moves >75% of its traffic over QUIC; ~35% of top-10M sites support [[http3|HTTP/3]] over it.`,
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
		protocols: ['quic'],
		abstract: `Adds a *DATAGRAM* frame to [[quic|QUIC]] for unreliable, unordered messages that share the connection's {{handshake|handshake}}, {{encryption|encryption}}, and {{congestion-control|congestion control}} but skip the reliability machinery — essentially "{{udp|UDP}} payloads inside an authenticated QUIC connection." Used by {{webtransport|WebTransport}}, MASQUE proxies (CONNECT-UDP), and IETF media transport drafts that need UDP semantics over a connection that already exists.`
	},
	{
		number: '9330',
		title: 'Low Latency, Low Loss, and Scalable Throughput (L4S) — Architecture',
		year: 2023,
		authors: 'B. Briscoe (ed.) et al.',
		status: 'informational',
		url: 'https://datatracker.ietf.org/doc/rfc9330/',
		protocols: ['tcp', 'quic'],
		abstract: `Describes the *L4S* architecture — a new internet service that aims for **sub-millisecond queuing latency** for participating senders by replacing loss-based congestion signalling with an explicit, fine-grained ECN mark (ECT(1)). Senders that opt in (Prague over TCP, BBRv3, L4S-aware QUIC) react instantly and gently; the AQM in the network gives them a separate queue. Cooperating flows get datacentre-scale latency on the open internet without starving anyone.

The architectural document; the algorithmic specs are RFC 9331 (DualPI2 AQM) and RFC 9332 (ECN protocol). First production deployment was Comcast's January 2025 launch in six US metros with Apple, NVIDIA GeForce NOW, and Valve as partners.`
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
