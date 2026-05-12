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
		abstract: `The defining specification of [[ip|IPv4]] — the connectionless, best-effort packet protocol that interconnects every network on the internet. Defines the 32-bit address space, the 20-byte minimum header (source/destination, {{ttl|TTL}}, protocol, header checksum, fragmentation fields), and the rules for routers to decrement {{ttl|TTL}}, fragment when needed, and drop packets that can't be delivered.

Edited by [[pioneer:jon-postel|Jon Postel]] at ISI in September 1981 alongside [[rfc:792|RFC 792]] ([[icmp|ICMP]]) and [[rfc:9293|RFC 793]] ([[tcp|TCP]]). Stayed the canonical [[ip|IPv4]] spec for 41 years until [[rfc:9293|RFC 9293]] consolidated [[tcp|TCP]] errata in 2022; [[ip|IPv4]] itself is still defined here.`
	},
	{
		number: '792',
		title: 'Internet Control Message Protocol',
		year: 1981,
		authors: 'Jon Postel',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc792',
		protocols: ['icmp'],
		abstract: `Defines [[icmp|ICMP]] — the control-plane protocol [[ip|IP]] hosts and routers use to report errors and probe reachability. The most familiar messages are *Echo Request / Echo Reply* (the basis of \`ping\`) and *Time Exceeded* (sent when a router decrements {{ttl|TTL}} to zero, the trick \`traceroute\` uses to discover each {{hop|hop}}). Other messages cover *Destination Unreachable*, *Redirect*, *Source Quench*, and *Parameter Problem*.

[[rfc:1122|RFC 1122]] §3.2.2 declares [[icmp|ICMP]] "an integral part of [[ip|IP]]" — every [[ip|IP]] host MUST implement it. Dropping [[icmp|ICMP]] at firewalls is a frequent root cause of {{mtu-black-hole|MTU black holes}} and silently broken {{path-mtu-discovery|Path MTU Discovery}}. [[ipv6|IPv6]] has its own equivalent in [[rfc:4443|RFC 4443]] (ICMPv6).`
	},
	{
		number: '826',
		title: 'An Ethernet Address Resolution Protocol',
		year: 1982,
		authors: 'David C. Plummer',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc826',
		protocols: ['arp'],
		abstract: `Defines [[arp|ARP]] — the elegantly simple {{broadcast|broadcast}} protocol that maps a 32-bit [[ip|IPv4]] address to the 48-bit [[ethernet|Ethernet]] [[mac-address|MAC address]] needed to actually deliver a frame on a local link. A host that wants to send to \`192.0.2.5\` broadcasts "who has 192.0.2.5?"; the owner replies with its MAC; the result is cached for a few minutes.

David Plummer wrote it at MIT-AI in November 1982. **STD 37 has not been obsoleted in over 40 years** — the wire format outlived Token Ring, FDDI, ATM, and Frame Relay because HLEN/PLEN are variable on purpose. [[arp|ARP]] has no checksum and no authentication, which is why [[arp|ARP]] {{spoofing|spoofing}} remains a textbook layer-2 attack and why every enterprise switch ships *Dynamic [[arp|ARP]] Inspection*.`
	},
	{
		number: '1918',
		title: 'Address Allocation for Private Internets',
		year: 1996,
		authors: 'Y. Rekhter et al.',
		status: 'best-current-practice',
		url: 'https://datatracker.ietf.org/doc/html/rfc1918',
		protocols: ['ip'],
		abstract: `Reserves three [[ip|IPv4]] address ranges — \`10.0.0.0/8\`, \`172.16.0.0/12\`, and \`192.168.0.0/16\` — for use within private networks that don't need globally routable addresses. Routers on the public internet MUST NOT forward packets with these source or destination addresses; that's what makes them safe to reuse inside every home and office on earth.

Combined with [[rfc:3022|NAT]], private addressing extended [[ip|IPv4]]'s lifespan by roughly two decades past the point at which the original 4.3-billion-address space would otherwise have run out. The same allocation also reserves \`169.254.0.0/16\` for link-local autoconfiguration. [[ipv6|IPv6]] obsoletes the *need* for this scheme but the addresses are still ubiquitous.`
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

Edited by [[pioneer:yakov-rekhter|Yakov Rekhter]] et al., consolidating two decades of incremental extensions on top of the original 1989 [[rfc:1105|RFC 1105]] sketch. As of 2026 [[bgp|BGP]] carries roughly 1M [[ip|IPv4]] and 225k [[ipv6|IPv6]] prefixes globally. The protocol's open-trust model is also the root cause of every major {{bgp-hijack|BGP hijack}} incident; [[rfc:8205|RFC 8205]] (BGPsec) and {{rpki|RPKI}}-{{rov|ROV}} are the slow-rolling cryptographic answers.`
	},
	{
		number: '4861',
		title: 'Neighbor Discovery for IP Version 6 (IPv6)',
		year: 2007,
		authors: 'T. Narten et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4861',
		protocols: ['ipv6'],
		abstract: `Defines the [[ipv6|IPv6]] *{{ndp|Neighbor Discovery Protocol}}* ({{ndp|NDP}}) — the [[ipv6|IPv6]] equivalent of [[arp|ARP]] plus [[icmp|ICMP]] Router Discovery plus Redirect, all consolidated into one protocol on top of [[icmp|ICMPv6]]. Hosts use {{ndp|NDP}} to discover routers (Router Solicitation / Router Advertisement), resolve link-layer addresses (Neighbor Solicitation / Neighbor Advertisement via solicited-node {{multicast|multicast}}), and detect when a neighbour has gone away.

Operates entirely over ICMPv6, with no [[arp|ARP]]-style {{broadcast|broadcast}} ([[ipv6|IPv6]] has no broadcast). The cryptographic counterpart is *SEND* ([[rfc:3971|RFC 3971]]) using cryptographically generated addresses to defeat {{ndp|NDP}} {{spoofing|spoofing}}; deployment has been minimal.`
	},
	{
		number: '4862',
		title: 'IPv6 Stateless Address Autoconfiguration',
		year: 2007,
		authors: 'S. Thomson, T. Narten, T. Jinmei',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4862',
		protocols: ['ipv6'],
		abstract: `Specifies *{{slaac|SLAAC}}* — the mechanism by which an [[ipv6|IPv6]] host generates its own globally-routable address by combining a network prefix learned from a Router Advertisement with an interface identifier (originally derived from the {{mac-address|MAC}} via EUI-64, now usually random). No [[dhcp|DHCP]] server required: plug in, pick up an address, go.

The original EUI-64 form embedded the MAC into the [[ipv6|IPv6]] address — a privacy leak that lets a device be tracked across networks. [[rfc:8981|RFC 8981]] (Privacy Extensions) replaces it with randomised, periodically-rotating identifiers and is now the default in every major OS.`
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
		abstract: `The current Internet Standard defining [[ipv6|IPv6]]: 128-bit addresses (3.4 × 10³⁸), a fixed 40-byte header (no options, no header {{checksum|checksum}}, no in-network {{fragmentation|fragmentation}}), and a chained "extension header" mechanism for everything that used to live in [[ip|IPv4]] options. The minimum link {{mtu|MTU}} is **1280 bytes**, and routers may not fragment — senders MUST do {{path-mtu-discovery|Path MTU Discovery}}.

[[pioneer:steve-deering|Steve Deering]] and Bob Hinden are the primary architects, building on three decades of [[ipv6|IPv6]] work: [[rfc:1883|RFC 1883]] (1995), [[rfc:2460|RFC 2460]] (1998), and now this Internet Standard 86 (2017). On 28 March 2026, [[ipv6|IPv6]] carried 50.1% of Google's traffic for the first time — 28 years after the protocol was first specified.`
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
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s three-page specification of [[udp|UDP]] — the minimal {{connectionless|connectionless}} transport. An 8-byte header (source port, destination port, length, {{checksum|checksum}}) on top of [[ip|IP]], no setup, no acknowledgements, no {{flow-control|flow control}}, no {{retransmission|retransmission}}. The application owns reliability if it needs any.

Published August 1980, two months before the first version of [[tcp|TCP]]. **It has not been updated since.** Three pages were enough; everything [[udp|UDP]] doesn't do is the point. [[udp|UDP]] is what makes [[dns|DNS]], [[ntp|NTP]], [[quic|QUIC]], [[webrtc|WebRTC]], and almost every real-time protocol possible.`
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
		abstract: `The current Internet Standard for [[tcp|TCP]] — the reliable, ordered, byte-stream transport that powers most of the application internet. Defines the {{three-way-handshake|three-way handshake}}, {{sequence-number|sequence numbers}}, the {{sliding-window|sliding window}} {{flow-control|flow control}}, the FIN-based teardown, and the {{time-wait|TIME_WAIT}} state. The actual congestion-control behaviour lives in companion RFCs ([[rfc:5681|RFC 5681]], [[rfc:9438|RFC 9438]], …).

Edited by Wesley Eddy in August 2022, this RFC consolidated **41 years of errata** against [[rfc:793|RFC 793]] (1981) — the longest-lived unmodified core {{ietf|IETF}} spec ever — plus six more obsoleted RFCs. Almost certainly the highest-leverage cleanup commit in {{ietf|IETF}} history. The wire protocol is unchanged; the spec just finally matches what implementations actually do.`,
		notableSections: [
			{ ref: '§3.1', description: '[[tcp|TCP]] header format' },
			{ ref: '§3.4', description: 'Sequence numbers' },
			{ ref: '§3.5', description: '{{three-way-handshake|Three-way handshake}}' },
			{ ref: '§3.8', description: '{{sliding-window|Sliding window}} {{flow-control|flow control}}' }
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
		abstract: `Codifies the four canonical [[tcp|TCP]] {{congestion-control|congestion control}} algorithms — *{{slow-start|Slow Start}}*, *{{congestion-avoidance|Congestion Avoidance}}*, *Fast Retransmit*, and *Fast Recovery* — that emerged from [[pioneer:van-jacobson|Van Jacobson]] and Mike Karels's response to the [[outage:nsfnet-1986-collapse|1986 NSFNET congestion collapse]]. The {{slow-start|slow start}} window grows exponentially after handshake until loss is observed, then {{congestion-avoidance|congestion avoidance}} switches to additive increase. Fast retransmit triggers on three duplicate ACKs.

This is the *behaviour* spec; modern algorithms ([[rfc:9438|CUBIC]], {{bbr|BBR}}, Prague-over-{{l4s|L4S}}) replace the curves but keep the four-phase loop. Effectively every [[tcp|TCP]] stack on earth implements this.`
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
		abstract: `Specifies how a [[tcp|TCP]] sender computes its *{{retransmission|Retransmission}} Timeout* (RTO) — when to give up waiting for an {{ack|ACK}} and resend. Maintains an exponentially-weighted moving average of the {{rtt|round-trip time}} (SRTT) and its variance (RTTVAR), with RTO = SRTT + max(G, 4·RTTVAR), clamped to a minimum of 1 second. Karn's algorithm prevents poisoning the estimator from retransmitted segments.

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
		abstract: `Defines the two [[tcp|TCP]] options that make modern long-fat-pipe networking tractable: *{{window-scale|Window Scale}}* and *Timestamps + PAWS*. {{window-scale|Window Scale}} shifts the 16-bit receive window by up to 14 bits, raising the maximum advertised window from 64 KB to ~1 GB — without it, a 100 ms transcontinental link caps at ~5 Mbit/s regardless of available bandwidth. Timestamps enable accurate {{rtt|RTT}} measurement on retransmitted segments, and PAWS (*Protection Against Wrapped Sequence numbers*) prevents an old segment from re-entering a fast connection where {{sequence-number|sequence numbers}} cycle in seconds.

Originally published as RFC 1323 in 1992 by [[pioneer:van-jacobson|Van Jacobson]] et al.; refined and republished here. Both options are negotiated in the SYN — they're either there from the start or never.`,
		notableSections: [
			{ ref: '{{window-scale|Window Scale}}', description: 'Lets the 16-bit receive window represent up to 2³⁰ bytes' },
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
		abstract: `Replaces [[tcp|TCP]]'s classic dup-{{ack|ACK}}-based fast retransmit with two complementary mechanisms: *RACK* (Recent ACKnowledgment) infers loss from the time elapsed since the most recent acknowledged packet, and *TLP* (Tail Loss Probe) sends a probe at the end of a flight to recover quickly when no further ACKs would otherwise arrive.

Authored at Google by Yuchung Cheng, Neal Cardwell, et al. RACK detects losses much faster than three-dup-{{ack|ACK}} in modern bursty / reordered traffic, and TLP eliminates the painful RTO-driven recovery for the very common "lost the last segment" case. Default in Linux since 4.10 (2017).`
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
		abstract: `The standards-track specification of {{cubic|CUBIC}} — the [[tcp|TCP]] congestion-control algorithm that has been the Linux default since kernel 2.6.19 (2006) and the de-facto default for most of the public internet for two decades. Replaces {{aimd|AIMD}}'s linear window growth with a cubic function of time-since-loss: aggressive recovery early, then a polite probe near the previous ceiling.

Designed by Sangtae Ha, Injong Rhee, and Lisong Xu; obsoletes the 2018 informational [[rfc:8312|RFC 8312]] and finally pins down the exact constants. {{cubic|CUBIC}} scales gracefully from a few-Mbps phone link to 100+ Gbps datacentre flows where Reno's "+1 packet per {{rtt|RTT}}" growth would take hours to refill the pipe.`
	},
	{
		number: '9000',
		title: 'QUIC: A UDP-Based Multiplexed and Secure Transport',
		year: 2021,
		authors: 'J. Iyengar, M. Thomson (eds.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9000',
		protocols: ['quic'],
		abstract: `The {{ietf|IETF}} specification of [[quic|QUIC]] — a reliable, multiplexed, encrypted transport that runs on top of [[udp|UDP]] in user space. Conceived at Google by [[pioneer:jim-roskind|Jim Roskind]] (gQUIC, 2012); standardised across a dozen {{ietf|IETF}} drafts and shipped as RFC 9000 in May 2021. The premise: [[udp|UDP]] traverses every middlebox, so layer reliability + multiplexing + crypto on top of it and iterate by browser update instead of kernel upgrade.

Defines connection setup (single-{{rtt|RTT}} {{handshake|handshake}}, {{zero-rtt|0-RTT}} for resumption), independent {{stream|streams}} (a lost packet only blocks its own stream — no [[tcp|TCP]] {{head-of-line-blocking|head-of-line blocking}}), {{connection-migration|connection migration}} via Connection IDs ([[wifi|Wi-Fi]]-to-cellular without breaking the connection), and an integrated [[tls|TLS]] 1.3 binding. By 2026 Meta moves >75% of its traffic over [[quic|QUIC]]; ~35% of top-10M sites support [[http3|HTTP/3]] over it.`,
		notableSections: [
			{ ref: '§5', description: 'Connections (Connection IDs, paths, migration)' },
			{ ref: '§13', description: 'Loss recovery and {{congestion-control|congestion control}}' },
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
		abstract: `Adds a *DATAGRAM* frame to [[quic|QUIC]] for unreliable, unordered messages that share the connection's {{handshake|handshake}}, {{encryption|encryption}}, and {{congestion-control|congestion control}} but skip the reliability machinery — essentially "{{udp|UDP}} payloads inside an authenticated [[quic|QUIC]] connection." Used by {{webtransport|WebTransport}}, {{masque|MASQUE}} proxies (CONNECT-[[udp|UDP]]), and {{ietf|IETF}} media transport drafts that need [[udp|UDP]] semantics over a connection that already exists.`
	},
	{
		number: '9330',
		title: 'Low Latency, Low Loss, and Scalable Throughput (L4S) — Architecture',
		year: 2023,
		authors: 'B. Briscoe (ed.) et al.',
		status: 'informational',
		url: 'https://datatracker.ietf.org/doc/rfc9330/',
		protocols: ['tcp', 'quic'],
		abstract: `Describes the *{{l4s|L4S}}* architecture — a new internet service that aims for **sub-millisecond queuing latency** for participating senders by replacing loss-based congestion signalling with an explicit, fine-grained {{ecn|ECN}} mark (ECT(1)). Senders that opt in (Prague over [[tcp|TCP]], BBRv3, {{l4s|L4S}}-aware [[quic|QUIC]]) react instantly and gently; the {{aqm|AQM}} in the network gives them a separate queue. Cooperating flows get datacentre-scale latency on the open internet without starving anyone.

The architectural document; the algorithmic specs are RFC 9331 (DualPI2 {{aqm|AQM}}) and RFC 9332 ({{ecn|ECN}} protocol). First production deployment was Comcast's January 2025 launch in six US metros with Apple, NVIDIA GeForce NOW, and Valve as partners.`
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
		abstract: `Defines the **version-independent semantics** of HTTP — methods (GET, POST, PUT, DELETE, PATCH), status codes (2xx success, 4xx client error, 5xx server error), {{header|headers}}, {{idempotent|idempotency}}, {{content-negotiation|content negotiation}}, conditional requests, range requests, and authentication. The wire encoding is *not* here — this RFC is what [[http1|HTTP/1.1]], [[http2|HTTP/2]], and [[http3|HTTP/3]] all share.

Co-edited by [[pioneer:roy-fielding|Roy Fielding]] (the original [[http1|HTTP/1.1]] architect), Mark Nottingham, and Julian Reschke. Consolidates **six previous RFCs** (7230–7235) into a single semantics document, with the message-format pieces split off into version-specific siblings ([[rfc:9112|RFC 9112]], [[rfc:9113|9113]], [[rfc:9114|9114]]). Reading [[rfc:9110|RFC 9110]] explains every HTTP version at once.`,
		notableSections: [
			{ ref: '§9.2.2', description: '{{idempotent|Idempotent}} methods (PUT, DELETE, GET)' },
			{ ref: '§12', description: '{{content-negotiation|Content negotiation}}' }
		]
	},
	{
		number: '9112',
		title: 'HTTP/1.1',
		year: 2022,
		authors: 'R. Fielding, M. Nottingham, J. Reschke (eds.)',
		status: 'internet-standard',
		url: 'https://datatracker.ietf.org/doc/rfc9112/',
		protocols: ['http1'],
		abstract: `The current Internet Standard for the [[http1|HTTP/1.1]] **wire format** — the text-based message framing, the request line / status line / headers / body structure, persistent connections ({{keep-alive|keep-alive}}), pipelining, and chunked transfer encoding. Semantics live in the companion [[rfc:9110|RFC 9110]].

Together with [[rfc:9110|RFC 9110]] this obsoletes the venerable [[rfc:2616|RFC 2616]] (1999) and the 7230-series split (2014). The protocol on the wire is unchanged; the spec just gets cleaner.`
	},
	{
		number: '9113',
		title: 'HTTP/2',
		year: 2022,
		authors: 'M. Thomson, C. Benfield (eds.)',
		status: 'proposed-standard',
		obsoletes: ['7540'],
		url: 'https://www.rfc-editor.org/rfc/rfc9113.html',
		protocols: ['http2'],
		abstract: `The current spec for [[http2|HTTP/2]] — the binary, multiplexed framing layer that runs the same [[rfc:9110|HTTP semantics]] over a single [[tcp|TCP]] connection with many concurrent {{stream|streams}}. Each request/response pair is a stream; {{binary-framing|binary frames}} (HEADERS, DATA, SETTINGS, …) are interleaved on the wire, and {{hpack|HPACK}} compresses the headers.

Obsoletes the original [[rfc:7540|RFC 7540]] (2015), partly to incorporate the response to the *Rapid Reset* CVE-2023-44487 DDoS attack (October 2023) — RFC 9113 mandates server-side limits on concurrent stream creation/cancellation. Despite [[http3|HTTP/3]]'s growth, [[http2|HTTP/2]] still serves the majority of HTTPS bytes.`
	},
	{
		number: '9114',
		title: 'HTTP/3',
		year: 2022,
		authors: 'M. Bishop (ed.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9114',
		protocols: ['http3'],
		abstract: `Specifies how [[rfc:9110|HTTP semantics]] map onto [[quic|QUIC]] streams — i.e. [[http3|HTTP/3]]. Each request/response pair is a bidirectional [[quic|QUIC]] stream; HEADERS frames carry compressed headers via *QPACK* (the [[quic|QUIC]]-friendly successor to {{hpack|HPACK}}); DATA frames carry the body. Because [[quic|QUIC]] streams are independent at the *transport* layer, a lost packet only blocks its own stream — finally fixing the [[http2|HTTP/2]] {{head-of-line-blocking|head-of-line blocking}} that motivated the whole exercise.

Adoption is brisk: by 2025 ~35% of top-10M sites support [[http3|HTTP/3]]; Cloudflare, Google, Meta, and Akamai all serve it by default. Discovered via the \`Alt-Svc\` header (or, more recently, the {{dns-resolution|DNS}} HTTPS RR — [[rfc:9460|RFC 9460]]) so the browser can switch on the second request.`
	},
	{
		number: '6455',
		title: 'The WebSocket Protocol',
		year: 2011,
		authors: 'I. Fette, A. Melnikov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6455',
		protocols: ['websockets'],
		abstract: `Defines [[websockets|WebSockets]] — a {{full-duplex|full-duplex}}, persistent message-based channel between a browser and a server, bootstrapped over a regular [[http1|HTTP]] request. The handshake is an HTTP \`Upgrade: websocket\` exchange that, on success, leaves the underlying [[tcp|TCP]] connection in [[websockets|WebSocket]] framing mode forever after.

Edited by Ian Fette (Google) and Alexey Melnikov; the design was driven by [[pioneer:ian-hickson|Ian Hickson]] in the WHATWG. Solved the early-2000s "comet / long-poll" hacks that web apps used for {{server-push|server push}}. Frame format is small (2–14 byte overhead), supports binary or text, and is the foundation of every browser-side real-time app — chat, multiplayer games, collaborative editing, live tickers — that doesn't go through {{webrtc|WebRTC}}.`
	},

	// ── Utilities / Security ──────────────────────────────────────────
	{
		number: '1035',
		title: 'Domain Names — Implementation and Specification',
		year: 1987,
		authors: 'P. Mockapetris',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc1035',
		protocols: ['dns'],
		abstract: `[[pioneer:paul-mockapetris|Paul Mockapetris]]'s implementation specification for [[dns|DNS]] — the wire format, message structure (Header / Question / Answer / Authority / Additional sections), record types (A, NS, CNAME, MX, TXT, …), the binary-label name encoding with pointer compression, and the resolver algorithms. Companion to [[rfc:1034|RFC 1034]], which covers concepts and facilities.

Together these obsoleted the earlier RFC 882/883 (1983) and have stayed canonical for nearly four decades. Almost every [[dns|DNS]] extension since ({{dnssec|DNSSEC}}, EDNS0, DoH, DoT, SVCB/HTTPS RR) layers on top without changing the core message format.`
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
		abstract: `The current [[tls|TLS]] specification — a five-year, 28-draft redesign edited by [[pioneer:eric-rescorla|Eric Rescorla]]. Cuts every weak primitive (RC4, 3DES, MD5, SHA-1, RSA key exchange, static-DH), reduces the {{handshake|handshake}} to **one round trip** (or zero for resumption), and mandates *{{aead|AEAD}}* as the only legal cipher mode. {{forward-secrecy|Forward secrecy}} is the default, not an option.

Internally cleaner than 1.0–1.2; externally indistinguishable on the wire from [[tls|TLS]] 1.2 thanks to deliberate middlebox-compatibility hacks (\`legacy_version = 0x0303\`, fake ChangeCipherSpec record, real version in \`supported_versions\` extension) — without these the spec couldn't have deployed because ~3% of middleboxes parsed the version field and broke. The reason your browser's HTTPS handshake takes one round trip in 2026 instead of two.`,
		notableSections: [
			{ ref: '§5', description: 'Record Protocol' },
			{ ref: '§7.1', description: 'Key schedule (HKDF-Extract / HKDF-Expand-Label)' },
			{ ref: '§D.4', description: "Middlebox-compatibility hacks (\"looks like [[tls|TLS]] 1.2\")" }
		]
	},
	{
		number: '5905',
		title: 'Network Time Protocol Version 4: Protocol and Algorithms Specification',
		year: 2010,
		authors: 'D. Mills, J. Martin, J. Burbank, W. Kasch',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc5905',
		protocols: ['ntp'],
		abstract: `[[pioneer:david-mills|David L. Mills]]'s definitive specification of [[ntp|NTPv4]] — the protocol that synchronises every clock on the public internet to within milliseconds despite arbitrary network jitter. Defines the on-wire packet format, the *clock filter* algorithm, *Marzullo's algorithm* for selecting trustworthy peers from a candidate set, and the *clock discipline* loop that nudges the local oscillator without causing the kind of step-changes that would break [[tls|TLS]] certificate validation, Kerberos tickets, or distributed log timestamps.

Mills refined [[ntp|NTP]] across four decades (RFC 958/1119/1305/5905). Without his careful stewardship there would not be a working internet — every cryptographic protocol assumes monotonic, roughly-correct time. The 2024 successor work (NTS, [[rfc:8915|RFC 8915]]) adds the authentication [[ntp|NTP]] itself never had.`
	},
	{
		number: '1122',
		title: 'Requirements for Internet Hosts — Communication Layers',
		year: 1989,
		authors: 'R. Braden (ed.)',
		status: 'internet-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc1122',
		protocols: ['tcp', 'udp', 'ip', 'icmp'],
		abstract: `The defining "host requirements" document — pulls together every MUST/SHOULD/MAY constraint a compliant [[tcp|TCP]]/[[ip|IP]] host has to honour at the link, internet, and transport layers. Edited by Bob Braden, IAB; the application-layer counterpart is [[rfc:1123|RFC 1123]]. Forty-plus years later this is still the spec people cite when arguing that [[icmp|ICMP]] is "an integral part of [[ip|IP]]" (§3.2.2) or that a host MUST send an *[[icmp|ICMP]] Destination Unreachable* in particular cases.

Reading [[rfc:1122|RFC 1122]] is a fast way to learn what a "correct" [[tcp|TCP]]/[[ip|IP]] stack actually has to do. Most operating-system kernels still implement a recognisable superset of these rules.`
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
		protocols: ['ip'],
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s January 1980 specification of the Internet Protocol — the first version published as a U.S. DoD standard, before the {{ietf|IETF}} process existed. Defines essentially the same datagram service as the better-known [[rfc:791|RFC 791]] (September 1981), which obsoleted it. Notable as the document where the *Robustness Principle* — *"be conservative in what you do, be liberal in what you accept from others"* — first appeared, in the introduction.`
	},
	{
		number: '793',
		title: 'Transmission Control Protocol',
		year: 1981,
		authors: 'J. Postel',
		status: 'historic',
		obsoletedBy: ['9293'],
		url: 'https://www.rfc-editor.org/rfc/rfc793',
		protocols: ['tcp'],
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s September 1981 specification of [[tcp|TCP]] — the canonical [[tcp|TCP]] RFC for **41 years**, almost certainly the longest-lived unmodified core {{ietf|IETF}} spec ever. Defines the {{three-way-handshake|three-way handshake}}, {{sequence-number|sequence numbers}}, the {{sliding-window|sliding window}}, FIN-based teardown, and {{time-wait|TIME_WAIT}} — every concept your kernel still implements.

Finally obsoleted by [[rfc:9293|RFC 9293]] in August 2022, which consolidated 41 years of accumulated errata. The wire format hasn't changed; the spec just finally matches what implementations actually do.`
	},
	{
		number: '2018',
		title: 'TCP Selective Acknowledgment Options',
		year: 1996,
		authors: 'M. Mathis, J. Mahdavi, S. Floyd, A. Romanow',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc2018',
		protocols: ['tcp'],
		abstract: `Adds *{{sack|SACK}}* — the **{{sack|Selective Acknowledgment}}** option — to [[tcp|TCP]]. With cumulative ACKs alone, a single lost segment forces the sender to either wait for a timeout or naively re-send everything after the gap. {{sack|SACK}} lets the receiver advertise which non-contiguous blocks it has actually received, so the sender can retransmit only the missing pieces.

Negotiated at handshake via {{sack|SACK}}-Permitted; carried in subsequent ACKs as a [[tcp|TCP]] option. Almost universally implemented for two decades — without {{sack|SACK}}, modern [[tcp|TCP]] behaviour over lossy links would be substantially worse.`
	},
	{
		number: '1948',
		title: 'Defending Against Sequence Number Attacks',
		year: 1996,
		authors: 'S. Bellovin',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc1948',
		protocols: ['tcp'],
		abstract: `Steve Bellovin's response to the 1994 Mitnick attack on Tsutomu Shimomura's machines. The original BSD [[tcp|TCP]] stack used a linear *Initial {{sequence-number|Sequence Number}}* counter — predictable enough that an attacker who could guess it could spoof a [[tcp|TCP]] {{three-way-handshake|three-way handshake}} without ever seeing the SYN-{{ack|ACK}}. Bellovin proposes deriving the ISN from a {{cryptographic-hash|cryptographic hash}} of the four-tuple plus a secret, so it's unpredictable to anyone who doesn't see the connection.

The technique is now standard in every [[tcp|TCP]] stack on earth; the underlying lesson — *don't assume anything you put on the wire predictably is "secret"* — recurs across decades of protocol design.`
	},
	{
		number: '4821',
		title: 'Packetization Layer Path MTU Discovery',
		year: 2007,
		authors: 'M. Mathis, J. Heffner',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc4821',
		protocols: ['tcp'],
		abstract: `*PLPMTUD* — a robust replacement for classic [[icmp|ICMP]]-based {{path-mtu-discovery|Path MTU Discovery}} that doesn't rely on receiving *{{fragmentation|Fragmentation}} Needed* messages. Instead the transport ([[tcp|TCP]] or another) probes the path with progressively-larger packets and infers the {{mtu|MTU}} from which probes get through and which don't.

Critical because so many networks drop or rate-limit [[icmp|ICMP]], creating the {{mtu-black-hole|MTU black hole}} failure mode where [[tcp|TCP]] connections silently hang. Linux enables PLPMTUD by default since ~2007. The same technique applies to [[quic|QUIC]].`
	},
	{
		number: '4987',
		title: 'TCP SYN Flooding Attacks and Common Mitigations',
		year: 2007,
		authors: 'W. Eddy',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc4987',
		protocols: ['tcp'],
		abstract: `Wesley Eddy's survey of how SYN-flood DoS attacks work and what mitigations exist. The classic problem: a SYN forces the server to allocate state for a *half-open* connection while it waits for the third {{ack|ACK}}; flooding SYNs from spoofed sources fills the backlog and starves legitimate clients.

Catalogues the three main defences — connection-table tuning, *{{syn-cookies|SYN cookies}}* ([[pioneer:dan-bernstein|Bernstein]], 1996, makes the SYN-{{ack|ACK}} statelessly verifiable so no server-side state is needed before the third {{ack|ACK}}), and various rate-limiters. Reading order: this RFC, then Bernstein's original cr.yp.to write-up.`
	},
	{
		number: '5925',
		title: 'The TCP Authentication Option',
		year: 2010,
		authors: 'J. Touch, A. Mankin, R. Bonica',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc5925',
		protocols: ['tcp'],
		abstract: `*[[tcp|TCP]]-AO* — a modern replacement for the deprecated [[tcp|TCP]]-MD5 option (RFC 2385) used to authenticate long-lived [[bgp|BGP]] sessions. Provides per-segment {{hmac|HMAC}} authentication with multiple Master Key Tuples and graceful key rotation, fixing [[tcp|TCP]]-MD5's lack of algorithm agility and its vulnerability to MD5 collisions.

Cisco IOS-XR and Junos shipped [[tcp|TCP]]-AO years ago; **Linux didn't ship it until kernel 6.7 in January 2024**. Almost exclusively used for [[bgp|BGP]] today; the long-pole has been kernel support outside vendor silicon.`
	},
	{
		number: '6824',
		title: 'TCP Extensions for Multipath Operation with Multiple Addresses',
		year: 2013,
		authors: 'A. Ford, C. Raiciu, M. Handley, O. Bonaventure',
		status: 'experimental',
		obsoletedBy: ['8684'],
		url: 'https://www.rfc-editor.org/rfc/rfc6824',
		protocols: ['mptcp'],
		abstract: `The original experimental specification of *[[mptcp|Multipath TCP]]* ([[mptcp|MPTCP]] v0) — a [[tcp|TCP]] extension that lets a single logical connection use multiple network paths simultaneously, bonding e.g. [[wifi|Wi-Fi]] and cellular for a phone. Apple deployed v0 in iOS 7 (2013) for Siri, the first major real-world [[mptcp|MPTCP]] use. The whole protocol falls back transparently to plain [[tcp|TCP]] when middleboxes strip the option, which is most of the time.

Obsoleted by [[rfc:8684|RFC 8684]] ([[mptcp|MPTCP]] v1, 2020), which carries the lessons learned from production deployment.`
	},
	{
		number: '8684',
		title: 'TCP Extensions for Multipath Operation with Multiple Addresses (v1)',
		year: 2020,
		authors: 'A. Ford, C. Raiciu, M. Handley, O. Bonaventure, C. Paasch',
		status: 'standards-track',
		obsoletes: ['6824'],
		url: 'https://www.rfc-editor.org/rfc/rfc8684',
		protocols: ['mptcp'],
		abstract: `*[[mptcp|MPTCP]] v1* — the standards-track replacement for the experimental [[rfc:6824|v0]], shipped after seven years of production experience. Cleaner option format, better fallback semantics for middleboxes that strip the [[mptcp|MPTCP]] option from the SYN, and improved subflow management. Linux merged the upstream [[mptcp|MPTCP]] implementation in kernel 5.6 (March 2020) after years of out-of-tree patches; Apple shipped v1 in iOS 14.

Where [[mptcp|MPTCP]] works (Apple OS services, Korea Telecom GIGA Path, some specialised enterprise WANs) it works well; everywhere else it transparently falls back. The successor work is multipath [[quic|QUIC]] (\`draft-ietf-quic-multipath\`), which avoids the middlebox problem entirely by being inside an encrypted [[udp|UDP]] payload.`
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
		protocols: ['sctp'],
		abstract: `The original specification of [[sctp|SCTP]] — a transport protocol with [[tcp|TCP]]-like reliability plus two superpowers: **multiple independent {{stream|streams}}** in one association (no [[tcp|TCP]] {{head-of-line-blocking|head-of-line blocking}}) and **multi-homing** for [[ip|IP]]-level failover when a path fails. Originally designed by Randall Stewart and others to carry telephony {{signaling|SS7 signaling}} over [[ip|IP]] networks.

Obsoleted by [[rfc:4960|RFC 4960]] (2007) and then [[rfc:9260|RFC 9260]] (2022). [[sctp|SCTP]] rarely runs on the open internet because middleboxes don't pass it; it survives mostly inside telco networks, in [[webrtc|WebRTC]] Data Channels (over [[udp|UDP]]/{{dtls|DTLS}}), and in datacentre niches.`
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
		protocols: ['sctp'],
		abstract: `The 2007 revision of [[sctp|SCTP]] — consolidated errata against the original [[rfc:2960|RFC 2960]] and clarified ambiguities found in early production deployments. The wire protocol is unchanged; this is the spec most [[sctp|SCTP]] implementations are written against. Itself obsoleted by [[rfc:9260|RFC 9260]] (2022).`
	},
	{
		number: '9260',
		title: 'Stream Control Transmission Protocol',
		year: 2022,
		authors: 'R. Stewart, M. Tüxen, K. Nielsen',
		status: 'proposed-standard',
		obsoletes: ['4960'],
		url: 'https://www.rfc-editor.org/rfc/rfc9260',
		protocols: ['sctp'],
		abstract: `The current [[sctp|SCTP]] specification — consolidates 15+ years of errata against [[rfc:4960|RFC 4960]] and aligns with all the [[sctp|SCTP]] extensions (PR-[[sctp|SCTP]], [[sctp|SCTP]]-AUTH, NDATA, …) that shipped in the meantime. Edited by Randall Stewart, Michael Tüxen, and Karen Nielsen.

Same wire protocol; cleaner spec. [[sctp|SCTP]]'s largest production deployment by message count is **[[webrtc|WebRTC]] Data Channels**, which run [[sctp|SCTP]] over {{dtls|DTLS}} over [[udp|UDP]] — the only widely-deployed [[sctp|SCTP]] on the open internet.`
	},
	{
		number: '6951',
		title: 'UDP Encapsulation of SCTP Packets for End-Host to End-Host Communication',
		year: 2013,
		authors: 'M. Tüxen, R. Stewart',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6951',
		protocols: ['sctp'],
		abstract: `Defines how to wrap [[sctp|SCTP]] packets inside [[udp|UDP]] {{datagram|datagrams}} so [[sctp|SCTP]] can traverse the {{nat|NAT}}s and {{firewall|firewalls}} that don't pass [[ip|IP]] protocol 132. Without this, [[sctp|SCTP]] is essentially undeployable on the open internet — it works inside telco networks but dies at every consumer router.

The same trick that {{quic|QUIC}} would later generalise: ride on top of [[udp|UDP]] because [[udp|UDP]] is the lowest common denominator everything passes. Used by [[webrtc|WebRTC]] Data Channels and a handful of telco-over-internet deployments.`
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
		protocols: ['ipv6'],
		abstract: `[[pioneer:steve-deering|Steve Deering]] and Bob Hinden's 1998 specification of [[ipv6|IPv6]] — the version most production [[ipv6|IPv6]] stacks were written against for 19 years. Defines the 128-bit address space, the 40-byte fixed header, extension headers, and the no-in-network-fragmentation rule.

Obsoleted by [[rfc:8200|RFC 8200]] (2017), which raised the spec to *Internet Standard 86* and clarified some details (e.g. the "{{hop|Hop}}-by-{{hop|Hop}} Options" extension is no longer required to be processed by every router along the path). Wire format unchanged.`
	},
	{
		number: '6434',
		title: 'IPv6 Node Requirements',
		year: 2011,
		authors: 'E. Jankiewicz, J. Loughney, T. Narten',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc6434',
		protocols: ['ipv6'],
		abstract: `The "host requirements" companion document for [[ipv6|IPv6]] — the [[ipv6|IPv6]] equivalent of [[rfc:1122|RFC 1122]], pulling together every MUST/SHOULD a compliant [[ipv6|IPv6]] node has to honour. Notable for **demoting IPsec from mandatory-to-implement to optional**, which became one of the most-cited corrections to the persistent myth that "[[ipv6|IPv6]] has built-in encryption." It does not — [[tls|TLS]] is still where transport-layer encryption happens.

Updated by RFC 8504 (2019) for further clarifications.`
	},
	{
		number: '6864',
		title: 'Updated Specification of the IPv4 ID Field',
		year: 2013,
		authors: 'J. Touch',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6864',
		protocols: ['ip'],
		abstract: `Joe Touch's clarification of how the 16-bit [[ip|IPv4]] *Identification* field is supposed to be used. The original [[rfc:791|RFC 791]] required a unique ID per source/destination/protocol combination, which on a 1 Gbps link cycles in milliseconds — a constraint many implementations had been ignoring for decades. RFC 6864 retroactively legalises the common practice: ID only matters when fragmentation is actually possible (DF=0); when DF=1, set it to anything.

Resolves a long-standing gap between spec and reality. Mostly invisible operationally; matters for anyone writing a packet filter or implementing a stack.`
	},
	{
		number: '6877',
		title: '464XLAT: Combination of Stateful and Stateless Translation',
		year: 2013,
		authors: 'M. Mawatari, M. Kawashima, C. Byrne',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc6877',
		protocols: ['ipv6'],
		abstract: `*{{four-six-four-xlat|464XLAT}}* — a deployment pattern where an [[ipv6|IPv6]]-only client runs a *CLAT* (Customer-side Translator) that synthesises [[ip|IPv4]] onto [[ipv6|IPv6]] (XLAT464) so legacy [[ip|IPv4]]-only applications keep working, while the network operator runs a stateful *PLAT* (Provider-side Translator, {{nat64|NAT64}}) that maps the synthesised addresses to real public [[ip|IPv4]]. End result: phones and laptops on a pure [[ipv6|IPv6]] network can still reach the [[ip|IPv4]] internet without dual-stack everywhere.

The standard recipe for "[[ipv6|IPv6]]-Mostly" mobile and enterprise networks. Fedora/NetworkManager auto-enables CLAT for [[ipv6|IPv6]]-mostly networks (2024); Windows 11 ships {{four-six-four-xlat|464XLAT}} CLAT. Combined with [[rfc:8925|RFC 8925]] (DHCPv4 Option 108) and [[rfc:8781|RFC 8781]] (PREF64 in RA) it's how T-Mobile, Sky Broadband, and a growing number of enterprise networks actually run [[ipv6|IPv6]]-only today.`
	},
	{
		number: '8305',
		title: 'Happy Eyeballs Version 2: Better Connectivity Using Concurrency',
		year: 2017,
		authors: 'D. Schinazi, T. Pauly',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8305',
		protocols: ['ipv6'],
		abstract: `*Happy Eyeballs v2* — the algorithm a dual-stack client uses to race [[ip|IPv4]] and [[ipv6|IPv6]] connection attempts in parallel and pick whichever wins, instead of trying [[ipv6|IPv6]] first and waiting for a long timeout when it fails. Originally [[rfc:6555|RFC 6555]] (2012, v1); v2 adds [[dns|DNS]] resolution races, parallel address-family attempts with small staggers (typically 250 ms), and explicit support for {{tls|TLS}} where the OS doesn't manage that.

Without Happy Eyeballs the [[ipv6|IPv6]] transition would have been visibly painful for end users on networks with broken [[ipv6|IPv6]] connectivity — every page load would hang. Now standard in every major browser and OS.`
	},
	{
		number: '8781',
		title: 'Discovering PREF64 in Router Advertisements',
		year: 2020,
		authors: 'L. Colitti, J. Linkova',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8781',
		protocols: ['ipv6'],
		abstract: `Adds a *PREF64* option to [[ipv6|IPv6]] Router Advertisements that tells hosts the {{nat64|NAT64}} prefix in use on the local network. Hosts that know the PREF64 can synthesise [[ip|IPv4]] addresses into [[ipv6|IPv6]] themselves (CLAT, see [[rfc:6877|464XLAT]]) without needing DNS64 to do it for them — sidestepping a long list of DNS64 problems including {{dnssec|DNSSEC}} validation failures.

One of the small, high-leverage [[ipv6|IPv6]]-Mostly deployment pieces. Native support landed in Linux's kernel and NetworkManager, Android, and Apple OSes between 2021 and 2023.`
	},
	{
		number: '8925',
		title: 'IPv6-Only Preferred Option for DHCPv4',
		year: 2020,
		authors: 'L. Colitti, J. Linkova, M. Richardson, T. Mrugalski',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8925',
		protocols: ['ipv6', 'dhcp'],
		abstract: `*DHCPv4 Option 108* — a one-bit signal a DHCPv4 server sends to capable clients meaning "this network prefers [[ipv6|IPv6]]; please skip [[ip|IPv4]] entirely." Clients that understand Option 108 don't even claim a DHCPv4 lease; they configure [[ipv6|IPv6]] via {{slaac|SLAAC}} + DHCPv6 and rely on {{nat64|NAT64}} for legacy [[ip|IPv4]] destinations.

Together with [[rfc:6877|464XLAT]] this is what makes "[[ipv6|IPv6]]-Mostly" networks usable: dual-stack capable clients keep using [[ip|IPv4]] directly when the operator wants them to, [[ipv6|IPv6]]-Mostly clients drop the [[ip|IPv4]] stack entirely. Apple iOS 14, Android 12, Windows 11, and modern Linux all honour it.`
	},
	{
		number: '8981',
		title: 'Temporary Address Extensions for Stateless Address Autoconfiguration in IPv6',
		year: 2021,
		authors: 'F. Gont, S. Krishnan, T. Narten, R. Draves',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc8981',
		protocols: ['ipv6'],
		abstract: `*[[ipv6|IPv6]] Privacy Extensions* — replaces the original [[rfc:4862|SLAAC]] EUI-64 interface identifier (which embedded the {{mac-address|MAC address}} in the [[ipv6|IPv6]] address and let networks track a device across visits) with **randomised, periodically-rotating** identifiers. Every modern OS turns this on by default.

Originally RFC 3041 (2001), then RFC 4941 (2007); this is the current revision. Without it, [[ipv6|IPv6]] would be a privacy disaster — your laptop's MAC, hashed into your global [[ip|IP]], visible to every server you ever connect to.`
	},
	{
		number: '2468',
		title: 'I REMEMBER IANA',
		year: 1998,
		authors: 'V. Cerf',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc2468',
		abstract: `[[pioneer:vint-cerf|Vint Cerf]]'s memorial RFC for [[pioneer:jon-postel|Jon Postel]], who died on 16 October 1998 at age 55. Postel had run the {{iana|IANA}} single-handedly from his ISI office for nearly three decades, edited essentially every foundational [[tcp|TCP]]/[[ip|IP]] RFC, and authored the *Robustness Principle*. The RFC is a personal eulogy from one of his closest collaborators.

One of a small handful of non-technical RFCs in the registry. Reading it is the most concentrated way to understand who Postel was and why so much of the early internet hung on one person's quiet, scrupulous work.`
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
		protocols: ['bgp'],
		abstract: `The original [[bgp|BGP]] specification — Kirk Lougheed (Cisco) and [[pioneer:yakov-rekhter|Yakov Rekhter]] (IBM) sketched it on **three napkins** at lunch during the 12th {{ietf|IETF}} meeting in Austin, January 1989; published as RFC 1105 six months later. Replaced *EGP*, which had been showing its age as the inter-domain routing protocol for the early internet.

The wire format and decision algorithm have evolved through [[bgp|BGP]]-2 (RFC 1163), [[bgp|BGP]]-3 (RFC 1267), and [[bgp|BGP]]-4 ([[rfc:4271|RFC 4271]]) — but the core idea (path-vector announcements with arbitrary local policy) is unchanged 36 years later.`
	},
	{
		number: '2918',
		title: 'Route Refresh Capability for BGP-4',
		year: 2000,
		authors: 'E. Chen',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc2918',
		protocols: ['bgp'],
		abstract: `Adds the *Route Refresh* capability — a way to ask a [[bgp|BGP]] peer to re-send its full RIB without resetting the session. Before this, applying a new inbound filter required either a "hard reset" (drop the session and re-learn everything, visible to the entire internet) or stored "Adj-RIBs-In" (memory-expensive). Route Refresh lets you reapply policy in seconds without the disruption.

Negotiated as a capability in OPEN; once both sides advertise it, either can issue a *ROUTE-REFRESH* message at any time. Universally implemented; standard operational hygiene.`
	},
	{
		number: '5082',
		title: 'The Generalized TTL Security Mechanism (GTSM)',
		year: 2007,
		authors: 'V. Gill, J. Heasley, D. Meyer, P. Savola (ed.), C. Pignataro',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5082',
		protocols: ['bgp'],
		abstract: `*GTSM* — a deceptively simple defence-in-depth trick for [[bgp|BGP]] (and any other {{peer-to-peer|peer-to-peer}} protocol over [[ip|IP]]). Two [[bgp|BGP]] routers that are directly connected set the outgoing {{ttl|TTL}} to 255 and require incoming packets to also have {{ttl|TTL}} ≥ 254. A remote attacker on the public internet can't forge a packet with {{ttl|TTL}} > 1 hop's worth, so spoofed [[bgp|BGP]] injections from off-path simply don't reach the [[bgp|BGP]] daemon.

Free, deployable today, no crypto required. Often paired with [[rfc:5925|TCP-AO]] or [[tcp|TCP]]-MD5 for cryptographic peer authentication.`
	},
	{
		number: '5575',
		title: 'Dissemination of Flow Specification Rules',
		year: 2009,
		authors: 'P. Marques et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5575',
		protocols: ['bgp'],
		abstract: `*[[bgp|BGP]] Flowspec* — extends [[bgp|BGP]] to distribute packet-filter / traffic-engineering rules (match fields like source/destination prefix, port, protocol; action like drop, rate-limit, redirect). The original use case was anti-DDoS: when a network operator detects an attack, they distribute Flowspec rules across the network in seconds to drop the attack traffic at the edge.

Famously implicated in the **2020 CenturyLink/Level 3 outage** — a malformed Flowspec rule cascaded into a six-hour global routing meltdown. Updated by [[rfc:8955|RFC 8955]] (2020) which fixes some of the underspecified validation behaviour exposed by that incident.`
	},
	{
		number: '8205',
		title: 'BGPsec Protocol Specification',
		year: 2017,
		authors: 'M. Lepinski (ed.), K. Sriram (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc8205',
		protocols: ['bgp'],
		abstract: `*BGPsec* — extends [[bgp|BGP]] with cryptographic signatures over the AS_PATH so that a downstream router can verify each {{autonomous-system|AS}} in the path actually authorised the route. Designed to defeat path-mangling {{bgp-hijack|BGP hijacks}} that {{rpki|RPKI}} Origin Validation alone can't catch.

In practice **deployment has been negligible** — every signature requires a verified {{rpki|RPKI}} cert chain, signature volumes balloon, hardware support is missing, and the operational model is unfamiliar. The **{{aspa|ASPA}} + Roles** approach of [[rfc:9234|RFC 9234]] (2022) ate BGPsec's lunch as the next-generation answer because it doesn't require per-update signatures.`
	},
	{
		number: '9234',
		title: 'Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages',
		year: 2022,
		authors: 'A. Azimov, E. Bogomazov, R. Bush, K. Patel, K. Sriram',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9234',
		protocols: ['bgp'],
		abstract: `Adds *Roles* to [[bgp|BGP]] — peers explicitly negotiate their relationship (provider, customer, peer, …) at OPEN, and a new *OTC* (Only-To-Customer) attribute carries the role through the AS_PATH. A {{route-leak|route leak}} — a customer accidentally re-announcing transit-learned routes upstream as if it were a provider — becomes detectable at every router along the way and can be filtered automatically.

Together with {{rpki|RPKI}}-{{rov|ROV}} and {{aspa|ASPA}}, this is the modern operational answer to [[bgp|BGP]] route-leak incidents that the more ambitious [[rfc:8205|BGPsec]] couldn't deliver. Steadily growing deployment: by 2026 every major {{ixp|IXP}} route server supports it.`
	},

	// HTTP family (older + 7540)
	{
		number: '1945',
		title: 'Hypertext Transfer Protocol — HTTP/1.0',
		year: 1996,
		authors: 'T. Berners-Lee, R. Fielding, H. Frystyk',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc1945',
		protocols: ['http1'],
		abstract: `The first formal HTTP specification — co-authored by [[pioneer:tim-berners-lee|Tim Berners-Lee]] (CERN), [[pioneer:roy-fielding|Roy Fielding]] (UC Irvine), and Henrik Frystyk ({{w3c|W3C}}). Documents the request/response cycle, headers, status codes, MIME-typed bodies, and the GET/HEAD/POST methods that web servers in 1996 actually understood.

[[http1|HTTP/1.0]] opened a new [[tcp|TCP]] connection for every request — there was no {{keep-alive|keep-alive}} yet. *Informational* status because by the time it published, work on [[rfc:2068|HTTP/1.1]] (which fixed connection reuse) was already well advanced.`
	},
	{
		number: '2068',
		title: 'Hypertext Transfer Protocol — HTTP/1.1',
		year: 1997,
		authors: 'R. Fielding, J. Gettys, J. Mogul, H. Frystyk, T. Berners-Lee',
		status: 'historic',
		obsoletedBy: ['2616'],
		url: 'https://www.rfc-editor.org/rfc/rfc2068',
		protocols: ['http1'],
		abstract: `The first specification of [[http1|HTTP/1.1]] — added persistent connections ({{keep-alive|keep-alive}} by default), pipelining, chunked transfer encoding, {{content-negotiation|content negotiation}}, byte ranges, conditional requests (If-Modified-Since, {{etag|ETag}}), proper caching semantics, and the OPTIONS / PUT / DELETE / TRACE methods. Most of what people still mean by "HTTP" was nailed down here.

Co-edited by [[pioneer:roy-fielding|Roy Fielding]] et al. Quickly obsoleted by [[rfc:2616|RFC 2616]] (1999), which fixed errata and clarified ambiguities discovered in the rapid late-1990s deployment.`
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
		protocols: ['http1'],
		abstract: `The 1999 revision of [[http1|HTTP/1.1]] — for fifteen years, **the** spec every web developer, server, browser, library, and proxy was written against. [[pioneer:roy-fielding|Roy Fielding]]'s doctoral dissertation ([[rest|REST]]) was being defended in the same period, and many of the architectural constraints that came to define "[[rest|REST]] APIs" trace back to choices made here.

Eventually obsoleted by the **6-RFC split** (7230–7235, 2014), which separated message syntax from semantics from caching from authentication. Then [[rfc:9110|RFC 9110]] / [[rfc:9112|9112]] re-consolidated those in 2022. Despite all this churn, the wire format you see when you \`telnet example.com 80\` and type \`GET / [[http1|HTTP/1.1]]\` has not changed since 1999.`
	},
	{
		number: '7540',
		title: 'Hypertext Transfer Protocol Version 2 (HTTP/2)',
		year: 2015,
		authors: 'M. Belshe, R. Peon, M. Thomson (ed.)',
		status: 'historic',
		obsoletedBy: ['9113'],
		url: 'https://www.rfc-editor.org/rfc/rfc7540',
		protocols: ['http2'],
		abstract: `The original [[http2|HTTP/2]] specification — direct descendant of Google's *SPDY* experiment ([[pioneer:mike-belshe|Mike Belshe]] and Roberto Peon, 2009). Replaces [[http1|HTTP/1.1]]'s text-based one-request-per-connection model with a {{binary-framing|binary frame}} format and stream {{multiplexing|multiplexing}} over a single [[tcp|TCP]] connection. {{hpack|HPACK}} compresses repeated headers.

Obsoleted by [[rfc:9113|RFC 9113]] in 2022, partly because of the *Rapid Reset* CVE-2023-44487 DDoS attack which forced new server-side limits on stream creation/cancellation rates. The wire format is essentially unchanged.`
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
		protocols: ['dns'],
		abstract: `The original 1983 [[dns|DNS]] design — [[pioneer:paul-mockapetris|Paul Mockapetris]]'s response to the question "how do we replace the single \`HOSTS.TXT\` file that has been the entire internet's name lookup table?" Defines the hierarchical, distributed, cacheable namespace concepts: zones, delegations, authoritative servers, recursive resolvers.

Companion to RFC 883 (the implementation spec). Both obsoleted in 1987 by [[rfc:1034|RFC 1034]] and [[rfc:1035|RFC 1035]] which finalised the architecture we still use four decades later.`
	},
	{
		number: '1034',
		title: 'Domain Names — Concepts and Facilities',
		year: 1987,
		authors: 'P. Mockapetris',
		status: 'internet-standard',
		obsoletes: ['882'],
		url: 'https://www.rfc-editor.org/rfc/rfc1034',
		protocols: ['dns'],
		abstract: `The architectural overview of [[dns|DNS]] — [[pioneer:paul-mockapetris|Paul Mockapetris]]'s 1987 revision of [[rfc:882|RFC 882]]. Covers concepts (domains, zones, resource records), the authority/recursion model, caching, and how delegations work. The wire format and resolver implementation live in companion [[rfc:1035|RFC 1035]].

Forty years later still the canonical text for "how does [[dns|DNS]] actually work". Almost every [[dns|DNS]] extension since ({{dnssec|DNSSEC}}, EDNS0, [[rfc:8484|DoH]], [[rfc:7858|DoT]], [[rfc:9460|SVCB/HTTPS]]) layers on top without changing the core architecture.`
	},
	{
		number: '7686',
		title: 'The ".onion" Special-Use Domain Name',
		year: 2015,
		authors: 'J. Appelbaum, A. Muffett',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7686',
		protocols: ['dns'],
		abstract: `Reserves \`.onion\` as a *Special-Use Domain Name* — a rare carve-out outside {{icann|ICANN}}'s namespace, granted because the Tor protocol uses .onion as an internal addressing scheme rather than a public name hierarchy. Public {{dns-resolution|DNS}} resolvers MUST NOT look up .onion names, MUST NOT cache them, and MUST NOT forward them. The reservation prevents accidental [[dns|DNS]] leakage of Tor traffic to the open internet.

Authored by Jacob Appelbaum and Alec Muffett. The {{iana|IANA}} *Special-Use Domain Names* registry now has a small but growing list of similar reservations (.alt, .home.arpa, etc.).`
	},
	{
		number: '7858',
		title: 'Specification for DNS over Transport Layer Security (TLS)',
		year: 2016,
		authors: 'Z. Hu, L. Zhu, J. Heidemann, A. Mankin, D. Wessels, P. Hoffman',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7858',
		protocols: ['dns'],
		abstract: `*DoT* — runs the regular [[dns|DNS]] wire protocol inside a [[tls|TLS]] connection on **[[tcp|TCP]] port 853**. Encrypts [[dns|DNS]] queries between stub resolver and recursive resolver so the on-path observers (your ISP, the coffee-shop [[wifi|Wi-Fi]], etc.) can't see what you're looking up.

Together with [[rfc:8484|DoH]] ([[dns|DNS]] over HTTPS) this is the modern answer to the long-standing privacy gap that [[dns|DNS]] was designed in 1983 with no transport encryption. Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9, NextDNS all support DoT; Android has had system-wide DoT (\`Private [[dns|DNS]]\`) since Android 9 (2018).`
	},
	{
		number: '8484',
		title: 'DNS Queries over HTTPS (DoH)',
		year: 2018,
		authors: 'P. Hoffman, P. McManus',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8484',
		protocols: ['dns'],
		abstract: `*DoH* — sends [[dns|DNS]] queries as the body of an [[http2|HTTP/2]] (or [[http3|HTTP/3]]) POST/GET to \`/dns-query\`, and gets the response back the same way. Indistinguishable from any other HTTPS traffic to a network observer; bypasses [[dns|DNS]]-blocking middleboxes that operate purely on [[udp|UDP]]/53.

Co-authored by Paul Hoffman and Patrick McManus (then Mozilla). DoH is now ubiquitous — every major browser supports it, often defaulting on. The deployment generated genuine controversy: it shifts [[dns|DNS]] visibility from the user's local network to a small set of large public resolvers, a centralisation tradeoff against the privacy gain.`
	},
	{
		number: '9460',
		title: 'Service Binding and Parameter Specification via the DNS (SVCB and HTTPS Resource Records)',
		year: 2023,
		authors: 'B. Schwartz, M. Bishop, E. Nygren',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9460',
		protocols: ['dns'],
		abstract: `Adds two new [[dns|DNS]] resource record types: *SVCB* (general service binding) and *HTTPS* (a specialisation for web). They let a single record advertise a service's preferred protocol stack — *"this name speaks [[http3|HTTP/3]] on port 443, supports {{ech|ECH}} with this {{public-key|public key}}, and the canonical hostname is X."*

Solves the long-standing apex-CNAME problem (\`example.com\` can now alias to \`example.cdn.com\` without violating [[rfc:1034|RFC 1034]]) and lets browsers learn about [[http3|HTTP/3]] and {{ech|ECH}} support **before** the first connection, instead of paying a round-trip-penalty to discover them. Cloudflare and Apple are the most aggressive deployers.`
	},
	{
		number: '9499',
		title: 'DNS Terminology',
		year: 2024,
		authors: 'P. Hoffman, A. Sullivan, K. Fujiwara',
		status: 'best-current-practice',
		url: 'https://www.rfc-editor.org/rfc/rfc9499',
		protocols: ['dns'],
		abstract: `The canonical glossary for [[dns|DNS]] — the document that fixes the meaning of *zone*, *delegation*, *NXDOMAIN*, *bailiwick*, *negative cache*, *split-horizon*, and roughly two hundred other terms that [[dns|DNS]] practitioners had been using inconsistently for forty years. Best Current Practice; replaces RFC 8499 (2019) and RFC 7719 (2015).

Edited by Paul Hoffman, Andrew Sullivan, and Kazunori Fujiwara. If you're writing a paper, a spec, or a code comment about [[dns|DNS]], this is the glossary to cite.`
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
		protocols: ['smtp'],
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s original 1982 specification of [[smtp|SMTP]] — the store-and-forward mail transfer protocol that built every email system since. Defines the verb-based command vocabulary (\`HELO\`, \`MAIL FROM\`, \`RCPT TO\`, \`DATA\`, \`QUIT\`) and the numeric reply codes (250 OK, 550 No such user) that you can still type into a \`telnet mail.example.com 25\` session today.

Obsoleted by RFC 2821 (2001, Klensin) and the current [[rfc:5321|RFC 5321]] (2008). The wire protocol has barely changed in 40 years; what's accreted around it is the security layer (STARTTLS, SPF, DKIM, DMARC) the original spec never imagined.`
	},
	{
		number: '822',
		title: 'Standard for the Format of ARPA Internet Text Messages',
		year: 1982,
		authors: 'D. Crocker',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc822',
		protocols: ['smtp'],
		abstract: `Dave Crocker's 1982 specification of the *email message format* — the \`From:\`, \`To:\`, \`Subject:\`, \`Date:\`, \`Message-ID:\` header fields above an empty line above the body. Companion to [[rfc:821|RFC 821]] (which is the *transport*; this is what gets transported).

Obsoleted by RFC 2822 (2001) and RFC 5322 (2008). Every modern email message format is recognisably descended from this 50-page document. The phrase "RFC 822 message format" is still a common shorthand for the basic envelope.`
	},
	{
		number: '5321',
		title: 'Simple Mail Transfer Protocol',
		year: 2008,
		authors: 'J. Klensin',
		status: 'standards-track',
		obsoletes: ['821', '2821'],
		url: 'https://www.rfc-editor.org/rfc/rfc5321',
		protocols: ['smtp'],
		abstract: `John Klensin's 2008 revision of [[smtp|SMTP]] — the spec every modern mail server is written against. Adds the *Extended [[smtp|SMTP]]* mechanism (EHLO with capability negotiation), specifies STARTTLS as the standard upgrade path, and codifies the practical [[smtp|SMTP]] behaviour two decades of deployment had developed.

The wire vocabulary is unchanged from [[rfc:821|RFC 821]] (1982) — what's new is everything around the edges (extensions, modern reply codes, internationalised email handling, message-size declarations). Pair with [[rfc:5322|RFC 5322]] (message format) for the complete current email picture.`
	},
	{
		number: '6409',
		title: 'Message Submission for Mail',
		year: 2011,
		authors: 'R. Gellens, J. Klensin',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6409',
		protocols: ['smtp'],
		abstract: `Splits the *submission* of mail (mail user agent → mail submission agent) from the *relay* of mail (MSA → other MTA) onto separate ports — submission on **587**, relay on 25. The two roles need different policies: submission requires authentication, applies content rewriting (Message-ID assignment, address canonicalisation), and shouldn't be open to the whole internet. Port 25 is for inter-MTA traffic and is widely blocked by ISPs to limit spam emission.

If your mail client is configured to send via your provider, it's almost certainly talking to port 587 with STARTTLS, by virtue of this RFC. The complementary *Submissions* port 465 (SMTPS, implicit [[tls|TLS]]) was retroactively standardised by [[rfc:8314|RFC 8314]].`
	},
	{
		number: '8314',
		title: 'Cleartext Considered Obsolete: Use of Transport Layer Security (TLS) for Email Submission and Access',
		year: 2018,
		authors: 'K. Moore, C. Newman',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8314',
		protocols: ['smtp', 'imap'],
		abstract: `Declares cleartext email submission and access **obsolete** in favour of always-on [[tls|TLS]]. Deprecates plain ports for [[smtp|SMTP]] submission, [[imap|IMAP]], and POP3, recommending Implicit-[[tls|TLS]] ports — *Submissions* (465), IMAPS (993), POP3S (995) — and treating STARTTLS as a transition path, not a final destination.

Best Current Practice for any new email deployment in the late 2010s and beyond. Major mail providers (Gmail, Outlook, Apple Mail) had already shifted defaults; this RFC writes that shift into the standard.`
	},
	{
		number: '1064',
		title: 'Interactive Mail Access Protocol — Version 2',
		year: 1988,
		authors: 'M. Crispin',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc1064',
		protocols: ['imap'],
		abstract: `Mark Crispin's 1988 specification of [[imap|IMAP2]] — an early version of the Interactive Mail Access Protocol that lets a client browse messages stored on a server (vs. POP3 which downloads them locally). The mailbox-as-server-side-state model is what makes modern multi-device email tractable: read on your phone, the desktop client sees the message as read.

Long since superseded by IMAP4rev1 (RFC 3501, 2003) and the current [[rfc:9051|RFC 9051]] (IMAP4rev2, 2021). Crispin spent decades stewarding [[imap|IMAP]] through revisions until his death in 2012.`
	},
	{
		number: '9051',
		title: 'Internet Message Access Protocol (IMAP) — Version 4rev2',
		year: 2021,
		authors: 'A. Melnikov, B. Leiba (eds.)',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9051',
		protocols: ['imap'],
		abstract: `*IMAP4rev2* — the current revision of [[imap|IMAP]], replacing the long-running RFC 3501 (IMAP4rev1, 2003). Folds in 18 years of accumulated extensions: SASL-IR, ENABLE, IDLE ({{server-push|server push}} for new mail without polling), CONDSTORE/QRESYNC (efficient resync after disconnection), MOVE, internationalised mailbox names, UTF-8 message parts.

Edited by Alexey Melnikov and Barry Leiba. Most modern mail servers (Dovecot, Cyrus, Microsoft Exchange) had implemented these as IMAP4rev1 extensions; rev2 is the cleanup that makes them the baseline.`
	},

	// File transfer
	{
		number: '114',
		title: 'A File Transfer Protocol',
		year: 1971,
		authors: 'A. Bhushan',
		status: 'historic',
		url: 'https://www.rfc-editor.org/rfc/rfc114',
		protocols: ['ftp'],
		abstract: `Abhay Bhushan's 1971 specification of *[[ftp|FTP]]* — the original file transfer protocol for the early {{arpanet|ARPANET}}. Predates [[ip|IP]] itself (which arrived in 1981); the spec is written against the older {{ncp|NCP}} transport. Establishes the basic verb vocabulary (\`USER\`, \`PASS\`, \`STOR\`, \`RETR\`) that has survived for **55 years** of revisions through to [[rfc:959|RFC 959]] (1985) and beyond.

One of the earliest application-layer protocols on what would become the internet. Reading it is a useful lesson in how application protocols looked before the [[tcp|TCP]]/[[ip|IP]] era forced everything to be byte-stream-oriented.`
	},
	{
		number: '959',
		title: 'File Transfer Protocol (FTP)',
		year: 1985,
		authors: 'J. Postel, J. Reynolds',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc959',
		protocols: ['ftp'],
		abstract: `[[pioneer:jon-postel|Jon Postel]] and Joyce Reynolds's 1985 revision of [[ftp|FTP]] — the version every [[ftp|FTP]] client and server is still essentially written against, **40 years** later. Defines the two-channel architecture (control on port 21, data on a separately-negotiated port), the verb vocabulary, the active-vs-passive mode distinction, ASCII vs binary transfer types.

The two-channel design is responsible for [[ftp|FTP]]'s well-known {{nat|NAT}}/{{firewall|firewall}} pain — the data port has to be opened separately, and middleboxes have to *understand* [[ftp|FTP]] to rewrite the embedded port numbers. Modern systems use SFTP (over [[ssh|SSH]]) or HTTPS instead; classic [[ftp|FTP]] survives in a dwindling set of legacy contexts.`
	},

	// SSH
	{
		number: '4251',
		title: 'The Secure Shell (SSH) Protocol Architecture',
		year: 2006,
		authors: 'T. Ylonen, C. Lonvick (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4251',
		protocols: ['ssh'],
		abstract: `The architectural overview of [[ssh|SSH-2]] — the design Tatu Ylönen wrote in 1995 (after his Helsinki University machine was passively sniffed for credentials), formalised by the {{ietf|IETF}} as RFC 4251–4254 in 2006. Three layers: a {{tls|TLS}}-style transport for confidentiality and integrity, a user-authentication layer (password, {{public-key|public key}}, GSSAPI), and a connection layer that multiplexes channels (interactive shell, X11 forwarding, SCP/SFTP, {{port-forwarding|port forwarding}}).

The reason the modern world has *only* [[ssh|SSH]] and not Telnet+rsh+rlogin is this RFC suite plus OpenSSH's nearly-universal adoption.`
	},
	{
		number: '4253',
		title: 'The Secure Shell (SSH) Transport Layer Protocol',
		year: 2006,
		authors: 'T. Ylonen, C. Lonvick (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc4253',
		protocols: ['ssh'],
		abstract: `The wire-protocol layer of [[ssh|SSH-2]] — packet format, key exchange (Diffie-Hellman variants), {{cipher-suite|cipher suite}} negotiation, integrity protection. Companion to [[rfc:4251|RFC 4251]] (architecture), RFC 4252 (user authentication), and RFC 4254 (connection multiplexing).

The host key fingerprint that [[ssh|SSH]] clients warn about on first connection is defined here. Algorithm agility built in from the start has let [[ssh|SSH]]-2 keep pace with cryptographic advances (Curve25519, Ed25519, ChaCha20-Poly1305, post-quantum candidates) without breaking the wire format.`
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
		protocols: ['tls'],
		abstract: `The first {{ietf|IETF}} [[tls|TLS]] specification — Tim Dierks and Christopher Allen's January 1999 publication, after the {{ietf|IETF}} took ownership of Netscape's SSL 3.0 ([[pioneer:taher-elgamal|Taher Elgamal]] et al.) and renamed it. Tim Dierks's own description: "[[tls|TLS]] 1.0 was, in practice, really SSL 3.1." The rename was a face-saving compromise so it didn't look like the {{ietf|IETF}} was rubber-stamping Netscape.

Long since obsolete: [[tls|TLS]] 1.1 (RFC 4346, 2006), [[tls|TLS]] 1.2 (RFC 5246, 2008), and the current [[rfc:8446|TLS 1.3]] (2018). Modern browsers and servers have actively *disabled* [[tls|TLS]] 1.0/1.1 since ~2020.`
	},
	{
		number: '5630',
		title: 'The Use of the SIPS URI Scheme in the Session Initiation Protocol (SIP)',
		year: 2009,
		authors: 'F. Audet',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5630',
		protocols: ['sip', 'tls'],
		abstract: `Clarifies the meaning of the \`sips:\` URI scheme in [[sip|SIP]] — and crucially **warns** that \`sips:\` does **not** guarantee end-to-end encryption the way \`https:\` does. SIPS only guarantees [[tls|TLS]] **hop-by-hop** along the [[sip|SIP]] signalling path; once a request crosses an interconnect into another carrier's domain, it may travel in cleartext.

This subtlety is the source of countless misconfigurations in the [[sip|SIP]] world. If you genuinely need end-to-end media security, use [[rtp|SRTP]] with separately-negotiated keys, not SIPS.`
	},
	{
		number: '9849',
		title: 'TLS Encrypted Client Hello (ECH) — registration entries',
		year: 2025,
		authors: '{{ietf|IETF}} ([[tls|TLS]] WG)',
		status: 'draft',
		url: 'https://www.rfc-editor.org/rfc/rfc9849',
		protocols: ['tls'],
		abstract: `Companion registration document for the {{ech|TLS Encrypted Client Hello}} mechanism — encrypts the {{sni|SNI}} ({{sni|Server Name Indication}}) hostname in the [[tls|TLS]] ClientHello so an on-path observer can no longer learn which site you're connecting to from the handshake. Closes a long-standing [[tls|TLS]] metadata leak; the only previous workaround was wildcard certificates plus aggressive name padding, neither great.

{{ech|ECH}} key material is published via the {{dns-resolution|DNS}} HTTPS RR ([[rfc:9460|RFC 9460]]). Cloudflare turned {{ech|ECH}} on by default in 2023; Firefox 119 enabled {{ech|ECH}} by default. As a *draft*-status entry the underlying {{ech|ECH}} spec is still settling; this is the {{iana|IANA}}-registration-list piece.`
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
		protocols: ['dhcp'],
		abstract: `Ralph Droms's 1993 original specification of [[dhcp|DHCP]] — the protocol that automates the assignment of [[ip|IP]] addresses, gateways, [[dns|DNS]] servers, and dozens of other configuration options to clients on a network. Replaced the earlier static-mapped *BOOTP* by adding leases, dynamic allocation, and a much richer option set.

Obsoleted by [[rfc:2131|RFC 2131]] in 1997, which fixed errata and added relay-agent semantics. The DISCOVER → OFFER → REQUEST → {{ack|ACK}} four-step dance is unchanged.`
	},
	{
		number: '2131',
		title: 'Dynamic Host Configuration Protocol',
		year: 1997,
		authors: 'R. Droms',
		status: 'standards-track',
		obsoletes: ['1531'],
		url: 'https://www.rfc-editor.org/rfc/rfc2131',
		protocols: ['dhcp'],
		abstract: `The current [[dhcp|DHCPv4]] specification — Ralph Droms's 1997 revision of [[rfc:1531|RFC 1531]]. Defines the DISCOVER → OFFER → REQUEST → {{ack|ACK}} message exchange, the lease-renewal lifecycle, the relay-agent architecture, and the format of the variable-length options field that everything from \`[[dns|DNS]] Servers\` to \`Domain Name\` to {{nat64|PREF64}}-via-RA-Option to *[[ipv6|IPv6]]-Only Preferred* ([[rfc:8925|RFC 8925]]) rides on top of.

DHCPv6 (RFC 8415) is a distinct protocol with a different message flow but the same job. Almost every router and OS implements both today.`
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
		protocols: ['ntp'],
		abstract: `[[pioneer:david-mills|David L. Mills]]'s original 1985 specification of [[ntp|NTPv0]] — the first version of the protocol that synchronises every clock on the internet. Mills then iterated through RFC 1059 (NTPv1, 1988), RFC 1119 (NTPv2, 1989), RFC 1305 (NTPv3, 1992), and finally [[rfc:5905|RFC 5905]] (NTPv4, 2010), refining the *clock filter*, *Marzullo's algorithm*, and *clock discipline* loop across four decades of careful work.

NTPv0 is purely historical; if you're running [[ntp|NTP]] today you're running NTPv4. Mills himself ran it from his University of Delaware lab until his death in January 2024 — the longest single-person stewardship of any internet protocol.`
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
		protocols: ['sip'],
		abstract: `The current [[sip|SIP]] specification — the {{signaling|signaling}} protocol that sets up, modifies, and tears down voice/video calls between endpoints over [[ip|IP]]. Edited by Jonathan Rosenberg, Henning Schulzrinne, et al. as the 2002 revision of the original [[rfc:2543|RFC 2543]] (1999). Text-based, [[http1|HTTP]]-inspired (\`INVITE\`, \`200 OK\`, \`{{ack|ACK}}\`), pluggable through registrations and proxies.

[[sip|SIP]] carries essentially every business VoIP call on earth — virtually all enterprise PBXs, ITSPs, and 4G/5G voice services (VoLTE/VoNR) are [[sip|SIP]] under the hood. Pair with [[rfc:8866|SDP]] (call parameters) and [[rtp|RTP]] (the actual media).`
	},
	{
		number: '2543',
		title: 'SIP: Session Initiation Protocol',
		year: 1999,
		authors: 'M. Handley, H. Schulzrinne, E. Schooler, J. Rosenberg',
		status: 'historic',
		obsoletedBy: ['3261'],
		url: 'https://www.rfc-editor.org/rfc/rfc2543',
		protocols: ['sip'],
		abstract: `The original 1999 [[sip|SIP]] specification — Mark Handley, [[pioneer:henning-schulzrinne|Henning Schulzrinne]], Eve Schooler, and Jonathan Rosenberg's first published version. Established [[sip|SIP]] as the {{ietf|IETF}}'s text-based alternative to ITU's binary H.323 for VoIP signalling. Won that standards war decisively over the following decade.

Obsoleted by [[rfc:3261|RFC 3261]] in 2002 with substantial revisions (cleaner state machines, better proxy semantics, INVITE-handling fixes from production deployment).`
	},
	{
		number: '1889',
		title: 'RTP: A Transport Protocol for Real-Time Applications',
		year: 1996,
		authors: 'H. Schulzrinne, S. Casner, R. Frederick, V. Jacobson',
		status: 'historic',
		obsoletedBy: ['3550'],
		url: 'https://www.rfc-editor.org/rfc/rfc1889',
		protocols: ['rtp'],
		abstract: `The original 1996 specification of [[rtp|RTP]] — the *Real-time Transport Protocol* that carries audio and video over [[ip|IP]] networks. Co-authored by [[pioneer:henning-schulzrinne|Henning Schulzrinne]] (Columbia), Steve Casner, Ron Frederick, and [[pioneer:van-jacobson|Van Jacobson]]. Fixed-size header with {{sequence-number|sequence number}}, timestamp, and synchronisation-source identifier on top of [[udp|UDP]].

Obsoleted by [[rfc:3550|RFC 3550]] in 2003 (Internet Standard 64), which folded in the {{rtcp|RTCP}} control protocol and seven years of production fixes.`
	},
	{
		number: '3550',
		title: 'RTP: A Transport Protocol for Real-Time Applications',
		year: 2003,
		authors: 'H. Schulzrinne, S. Casner, R. Frederick, V. Jacobson',
		status: 'internet-standard',
		obsoletes: ['1889'],
		url: 'https://www.rfc-editor.org/rfc/rfc3550',
		protocols: ['rtp'],
		abstract: `The current [[rtp|RTP]] specification — Internet Standard 64. Combines the data-plane [[rtp|RTP]] packets with the control-plane {{rtcp|RTCP}} feedback (sender reports, receiver reports, source description, BYE) into one document. Every modern voice/video application — Zoom, FaceTime, [[webrtc|WebRTC]], VoLTE, IPTV head-ends — uses [[rtp|RTP]]/{{rtcp|RTCP}} under the hood.

The author lineup is a who's-who of internet real-time work: [[pioneer:henning-schulzrinne|Schulzrinne]], Casner, Frederick, [[pioneer:van-jacobson|Jacobson]]. The protocol is a model of careful design — small, composable, layered cleanly with codec, transport, and security as separate concerns.`
	},
	{
		number: '2327',
		title: 'SDP: Session Description Protocol',
		year: 1998,
		authors: 'M. Handley, V. Jacobson',
		status: 'historic',
		obsoletedBy: ['4566'],
		url: 'https://www.rfc-editor.org/rfc/rfc2327',
		protocols: ['sdp'],
		abstract: `The original 1998 specification of [[sdp|SDP]] — Mark Handley and [[pioneer:van-jacobson|Van Jacobson]]'s text-based format that describes media sessions: codecs, [[ip|IP]] addresses, ports, encryption keys, bandwidth budgets. Originally for *SAP* (multicast session announcements); later adopted by [[sip|SIP]] (offer/answer) and [[webrtc|WebRTC]] (the [[sdp|SDP]] blob in every \`createOffer\` / \`createAnswer\`).

Obsoleted by RFC 4566 (2006) and the current [[rfc:8866|RFC 8866]] (2021), but the wire format every [[webrtc|WebRTC]] engineer has had to learn to debug is recognisably the same.`
	},
	{
		number: '8216',
		title: 'HTTP Live Streaming',
		year: 2017,
		authors: 'R. Pantos (ed.), W. May',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc8216',
		protocols: ['hls'],
		abstract: `Apple's [[hls|HLS]] specification — adaptive bitrate video streaming over plain [[http1|HTTP]]. The server publishes a *master playlist* (\`.m3u8\`) listing several variant streams at different bitrates; each variant playlist points to a sequence of small \`.ts\` (or now \`.mp4\`) media segments. The client measures throughput, switches between variants on the fly, and keeps a small buffer.

Designed by Roger Pantos at Apple, originally for the iPhone (2009). Carries every Apple TV stream, every iOS-played live sports event, and a huge fraction of all web video. Companion to [[dash|DASH]] (the open MPEG version of the same idea).`
	},
	{
		number: '8866',
		title: 'SDP: Session Description Protocol',
		year: 2021,
		authors: 'A. Begen, P. Kyzivat, C. Perkins, M. Handley',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8866',
		protocols: ['sdp'],
		abstract: `The current [[sdp|SDP]] specification — replaces RFC 4566 (2006) and the original [[rfc:2327|RFC 2327]] (1998). Same fundamentally text-based attribute-line format ("v=", "o=", "m=", "a=") that describes the media a session offers or accepts. Carries codec lists, [[rtp|RTP]] payload types, [[ip|IP]] addresses, encryption parameters, and trickle-ICE candidates for [[webrtc|WebRTC]].

Edited by Ali Begen, Paul Kyzivat, Colin Perkins, and Mark Handley. The 2021 revision tightens spec language and folds in 15 years of accumulated extensions; the wire format is unchanged.`
	},

	// WebRTC + data channels
	{
		number: '8825',
		title: 'Overview: Real-Time Protocols for Browser-Based Applications',
		year: 2021,
		authors: 'H. Alvestrand',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8825',
		protocols: ['webrtc'],
		abstract: `The architectural overview of [[webrtc|WebRTC]] — the only path by which a web browser can send a [[udp|UDP]] packet to a peer. Surveys the dozen-plus {{ietf|IETF}} documents that together define the system: [[rtp|RTP]]/{{srtp|SRTP}} for media, ICE for {{nat|NAT}} traversal, STUN/TURN for path discovery, [[sdp|SDP]] for offer/answer, {{dtls|DTLS}} for key agreement, [[rfc:8831|SCTP-over-DTLS]] for data channels.

Authored by Harald Alvestrand at Google. Reading it is the fastest way to understand how all the [[webrtc|WebRTC]] pieces fit together; each piece has its own RFC.`
	},
	{
		number: '8831',
		title: 'WebRTC Data Channels',
		year: 2021,
		authors: 'R. Jesup, S. Loreto, M. Tüxen',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8831',
		protocols: ['webrtc'],
		abstract: `Defines [[webrtc|WebRTC]] *Data Channels* — the API for sending arbitrary application data {{peer-to-peer|peer-to-peer}} between browsers, alongside the audio and video. Uses [[sctp|SCTP]] over {{dtls|DTLS}} over [[udp|UDP]]: [[sctp|SCTP]] gives you ordered or unordered, reliable or unreliable streams; {{dtls|DTLS}} encrypts; [[udp|UDP]] is what browsers can actually send.

The largest production [[sctp|SCTP]] deployment by message count today, even though almost nobody knows their browser carries an [[sctp|SCTP]] stack. Used by collaborative tools (Figma, Google Docs cursors), in-browser games, and BitTorrent-in-the-browser projects.`
	},

	// XMPP
	{
		number: '6120',
		title: 'Extensible Messaging and Presence Protocol (XMPP): Core',
		year: 2011,
		authors: 'P. Saint-Andre',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6120',
		protocols: ['xmpp'],
		abstract: `Peter Saint-Andre's specification of [[xmpp|XMPP]] core — an {{xml|XML}}-based, federated, {{peer-to-peer|peer-to-peer}} messaging protocol originally born from Jabber (1999). [[xmpp|XMPP]] servers federate the way [[smtp|SMTP]] does: anyone can run one, and they relay messages to each other based on the JID (\`user@server.example\`).

Carried Google Talk, Facebook Chat (early years), and WhatsApp's early backend. Most of those have since moved to proprietary protocols; [[xmpp|XMPP]] survives in a long tail of federated chat (Conversations, Snikket, ProcessOne) and as an interop layer in some IoT and gaming deployments. RFC 6121 covers the IM/presence semantics built on top of this core.`
	},
	{
		number: '7395',
		title: 'An Extensible Messaging and Presence Protocol (XMPP) Subprotocol for WebSocket',
		year: 2014,
		authors: 'L. Stout (ed.), J. Moffitt, E. Cestari',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7395',
		protocols: ['xmpp', 'websockets'],
		abstract: `Defines how to carry [[xmpp|XMPP]] over [[websockets|WebSockets]] (\`xmpp\` subprotocol) — letting a browser-based [[xmpp|XMPP]] client speak directly to an [[xmpp|XMPP]] server over the same port-443 path as any other web traffic, instead of needing the older long-poll BOSH transport. Each [[websockets|WebSocket]] message carries one [[xmpp|XMPP]] stanza.

What makes Conversations.im, Snikket, and other modern [[xmpp|XMPP]] web clients work without server-side polling proxies.`
	},

	// CoAP / IoT
	{
		number: '7252',
		title: 'The Constrained Application Protocol (CoAP)',
		year: 2014,
		authors: 'Z. Shelby, K. Hartke, C. Bormann',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc7252',
		protocols: ['coap'],
		abstract: `[[coap|CoAP]] — the {{ietf|IETF}}'s *constrained-device* counterpart to [[http1|HTTP]]. Same [[rest|REST]] verbs (GET/POST/PUT/DELETE), same status code semantics, but a 4-byte binary header on top of [[udp|UDP]] instead of HTTP's text-based framing on [[tcp|TCP]]. Designed for sensors and actuators with kilobytes of RAM and intermittent radio links.

Co-authored by Zach Shelby, Klaus Hartke, and Carsten Bormann. Used in *Thread* network management (Matter does NOT use [[coap|CoAP]] for its main payloads, despite the common misconception), industrial IoT, and constrained sensor networks. Companion {{encryption|encryption}} layers are {{dtls|DTLS}} or [[rfc:8613|OSCORE]].`
	},
	{
		number: '8613',
		title: 'Object Security for Constrained RESTful Environments (OSCORE)',
		year: 2019,
		authors: 'G. Selander, J. Mattsson, F. Palombini, L. Seitz',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8613',
		protocols: ['coap'],
		abstract: `*OSCORE* — wraps the [[coap|CoAP]] message payload in *COSE_Encrypt0* (CBOR Object Signing and {{encryption|Encryption}}) using AES-CCM, providing **end-to-end** confidentiality and integrity even when the message traverses [[coap|CoAP]]↔HTTP proxies. Unlike {{dtls|DTLS}}, OSCORE protects the application object itself, not the transport — so proxies can route without seeing the contents and without having to terminate {{tls|DTLS}}.

The constrained-device counterpart to fitting [[tls|TLS]] into a battery-powered sensor — much smaller footprint, no per-message asymmetric crypto. Pair with [[rfc:9528|EDHOC]] for the full mutual-authentication + forward-secrecy story.`
	},

	// OAuth
	{
		number: '6749',
		title: 'The OAuth 2.0 Authorization Framework',
		year: 2012,
		authors: 'D. Hardt (ed.)',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc6749',
		protocols: ['oauth2'],
		abstract: `The framework specification for [[oauth2|OAuth 2.0]] — *not a protocol but a framework*: defines four grant types (authorization code, implicit, resource owner password, client credentials), the access-token / refresh-token model, and the abstract roles (resource owner, client, resource server, authorization server). The exact wire details are spread across companion RFCs.

Edited by Dick Hardt. The framework's own abstract famously warns *"this specification is likely to produce a wide range of non-interoperable implementations"* — which has aged exactly as well as you'd expect. Modern best practice ({{pkce|PKCE}} for all clients, no implicit flow, {{mtls|mTLS}} or DPoP for sender constraint) is largely defined in the **[[oauth2|OAuth]] 2.1 BCP** drafts the WG has been refining since 2020.`
	},
	{
		number: '7636',
		title: 'Proof Key for Code Exchange by OAuth Public Clients',
		year: 2015,
		authors: 'N. Sakimura (ed.), J. Bradley, N. Agarwal',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc7636',
		protocols: ['oauth2'],
		abstract: `*{{pkce|PKCE}}* (pronounced "pixie") — closes a fundamental [[oauth2|OAuth 2.0]] security gap for public clients (mobile apps, single-page apps) that can't keep a client secret. The client generates a high-entropy *code_verifier*, sends its hash (*code_challenge*) on the authorization request, and presents the original verifier on the token-exchange request. An attacker who intercepts the authorization code can't redeem it without the verifier.

Originally defined for native mobile apps; **[[oauth2|OAuth]] 2.1 mandates {{pkce|PKCE}} for every authorization-code flow**, public or confidential. If you're building any new [[oauth2|OAuth]] integration in 2026, you're using {{pkce|PKCE}}.`
	},

	// ── NAT traversal (STUN / TURN / ICE) ──────────────────────────────
	{
		number: '8489',
		title: 'Session Traversal Utilities for NAT (STUN)',
		year: 2020,
		authors: 'Petit-Huguenin, Salgueiro, Rosenberg, Wing, Mahy, Matthews',
		status: 'proposed-standard',
		obsoletes: ['5389'],
		url: 'https://www.rfc-editor.org/rfc/rfc8489',
		protocols: ['nat-traversal', 'webrtc'],
		abstract: `The modern revision of [[pioneer:jonathan-rosenberg|Jonathan Rosenberg]]'s 2003 [[rfc:8489|RFC 3489]] — the wire format and reflexive-address probe at the heart of [[nat-traversal|NAT traversal]]. Defines the 20-byte STUN header with the famous \`0x2112A442\` magic cookie, the 96-bit transaction ID, TLV attribute encoding, and the Binding method that lets a client learn its public \`ip:port\` (encoded XORed into \`XOR-MAPPED-ADDRESS\`).

This revision (Feb 2020) added \`MESSAGE-INTEGRITY-SHA256\`, the \`USERHASH\` attribute that anonymises usernames, negotiated \`PASSWORD-ALGORITHMS\`, and a 13-byte "nonce cookie" prefix (\`obMatJos2…\`) that defends against bid-down attacks. STUN is also the substrate every other piece of [[nat-traversal|NAT traversal]] is built on: [[rfc:8656|TURN]] messages (except \`ChannelData\`) are STUN-formatted, and [[rfc:8445|ICE]] connectivity checks are STUN Binding requests with short-term credentials.`,
		notableSections: [
			{ ref: '§5', description: 'STUN Message Structure (20-byte header)' },
			{ ref: '§14', description: 'Attribute encoding and the catalogue' },
			{ ref: '§9', description: 'Short-term and long-term authentication' },
			{ ref: '§11', description: 'RFC 3489 backward compatibility' }
		]
	},
	{
		number: '8656',
		title: 'Traversal Using Relays around NAT (TURN)',
		year: 2020,
		authors: 'Reddy, Johnston (ed.), Matthews, Rosenberg',
		status: 'proposed-standard',
		obsoletes: ['5766', '6156'],
		url: 'https://www.rfc-editor.org/rfc/rfc8656',
		protocols: ['nat-traversal', 'webrtc'],
		abstract: `Extends [[rfc:8489|STUN]] with the *relayed* transport address — a public \`ip:port\` on a TURN server that two peers can target when no direct path works. A client \`Allocate\`s a relay (default 600 s lifetime), \`CreatePermission\` on each peer it wants to talk to, and then either sends via \`Send\`/\`Data\` indications or — more efficiently — binds 4-byte \`ChannelData\` headers via \`ChannelBind\`.

The 2020 revision merged the original 5766 with the IPv6 extensions of 6156 and added dual-stack allocations (\`ADDITIONAL-ADDRESS-FAMILY\`, \`ADDRESS-ERROR-CODE\`). TURN is what makes calls work behind cloud-default NATs (AWS, GCP, Azure are all symmetric), CGNAT carriers, and aggressive enterprise firewalls. The trade-off: an extra hop of latency and a per-GB bill.`,
		notableSections: [
			{ ref: '§3', description: 'Overview and TURN message types' },
			{ ref: '§6–8', description: 'Allocate, Refresh, CreatePermission, ChannelBind' },
			{ ref: '§18', description: 'TURN-specific attributes' },
			{ ref: '§21', description: 'Security considerations (open-proxy risks)' }
		]
	},
	{
		number: '8445',
		title: 'Interactive Connectivity Establishment (ICE)',
		year: 2018,
		authors: 'Keränen, Holmberg, Rosenberg',
		status: 'proposed-standard',
		obsoletes: ['5245'],
		url: 'https://www.rfc-editor.org/rfc/rfc8445',
		protocols: ['nat-traversal', 'webrtc', 'sip'],
		abstract: `The algorithm that turns [[rfc:8489|STUN]] probes and [[rfc:8656|TURN]] allocations into a working call. Each ICE agent gathers candidates (host, server-reflexive, peer-reflexive, relayed), pairs them with the peer's, prioritises (host > prflx > srflx > relay), and runs STUN connectivity checks across every pair using short-term credentials.

The *controlling* agent breaks ties and nominates the winning pair with \`USE-CANDIDATE\`. The 2018 revision unified the algorithm across SIP and WebRTC use cases, simplified the lite/full distinction, and tightened the formula for pair priority: \`2^32 * min(G,D) + 2 * max(G,D) + (G>D?1:0)\`. Companion documents add Trickle ICE ([[rfc:8838|RFC 8838]]), ICE-PAC ([[rfc:8863|RFC 8863]]), and consent freshness ([[rfc:7675|RFC 7675]]).`,
		notableSections: [
			{ ref: '§5', description: 'Candidate gathering' },
			{ ref: '§6', description: 'Connectivity checks' },
			{ ref: '§7', description: 'Concluding ICE' },
			{ ref: '§8.1.1', description: 'Regular vs aggressive nomination' }
		]
	},

	// ── OSPF (Open Shortest Path First) ────────────────────────────────
	{
		number: '2328',
		title: 'OSPF Version 2',
		year: 1998,
		authors: 'John Moy',
		status: 'internet-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc2328',
		protocols: ['ospf'],
		abstract: `**STD 54** — the canonical [[ospf|OSPF]] specification, 244 pages, edited by [[pioneer:john-moy|John Moy]] at Ascend Communications. Defines the [[ip|IPv4]] link-state Interior Gateway Protocol that drives most enterprise core networks, MPLS PE-CE links, and mid-tier carrier IGPs. The protocol runs directly on [[ip|IP]] (protocol 89), uses link-local multicast \`224.0.0.5\`/\`224.0.0.6\` for adjacency, and synchronises a topology database across every router in an area before each independently runs [[pioneer:edsger-dijkstra|Dijkstra]]'s shortest-path-first algorithm.

The packet format, eight-state neighbour state machine (Down → Init → 2-Way → ExStart → Exchange → Loading → Full), LSA flooding rules, area and DR election, and SPF computation are all defined here — and unchanged in 28 years. Everything modern ([[rfc:8665|Segment Routing]], [[rfc:9350|Flex-Algo]], SRv6, BFD Strict-Mode) is layered on through Opaque LSAs and Router Information TLVs, not by rewriting the protocol.`,
		notableSections: [
			{ ref: '§A.3', description: 'Packet formats for Hello, DBD, LSR, LSU, LSAck' },
			{ ref: '§10', description: 'The neighbour state machine' },
			{ ref: '§16', description: 'Calculation of the routing table (SPF)' },
			{ ref: 'Annex D', description: 'Cryptographic authentication' }
		]
	},
	{
		number: '5340',
		title: 'OSPF for IPv6 (OSPFv3)',
		year: 2008,
		authors: 'Coltun, Ferguson, Moy, Lindem',
		status: 'proposed-standard',
		obsoletes: ['2740'],
		url: 'https://www.rfc-editor.org/rfc/rfc5340',
		protocols: ['ospf', 'ipv6'],
		abstract: `[[ospf|OSPFv3]] — the [[ipv6|IPv6]] revision of [[rfc:2328|OSPF]]. Same algorithm, same state machine, same LSA flooding model, but with a 16-byte header (no authentication field — auth moves to the [[rfc:7166|Authentication Trailer]]), per-link rather than per-IP-subnet operation, and a clean LSA extensibility design via RFC 8362.

Via RFC 5838, OSPFv3 also carries [[ip|IPv4]] as a separate address family — making it the natural choice for dual-stack networks that want a single IGP control plane.`,
		notableSections: [
			{ ref: '§A.3', description: 'OSPFv3 packet format (16-byte header)' },
			{ ref: '§A.4', description: 'LSA formats' },
			{ ref: '§2.4', description: 'Instance ID for multi-instance support' }
		]
	},
	{
		number: '9350',
		title: 'IGP Flexible Algorithm',
		year: 2023,
		authors: 'Psenak, Hegde, Filsfils, Talaulikar, Gulko',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9350',
		protocols: ['ospf'],
		abstract: `Lets operators compute **multiple parallel SPF planes** per [[ospf|OSPF]]/IS-IS area, each with its own metric and constraints. The Flexible Algorithm Definition (FAD) TLV — area-scoped, carried in the Router Information LSA — defines:

- A **metric type** (IGP cost, min-delay, TE cost)
- A set of **include/exclude admin-groups**
- A set of **excluded SRLGs**
- A **calc-type** (usually plain Dijkstra)

The result: a single physical topology can carry a "low-latency plane", a "redundant plane", and a "minimum-cost plane" simultaneously, each computed independently on every router. The substrate for modern Segment Routing traffic engineering — and the most-cited recent [[ospf|OSPF]] feature outside the base spec.`,
		notableSections: [
			{ ref: '§5', description: 'FAD TLV format' },
			{ ref: '§6', description: 'Path computation rules' }
		]
	},

	// ── IPsec (Internet Protocol Security) ─────────────────────────────
	{
		number: '4301',
		title: 'Security Architecture for the Internet Protocol',
		year: 2005,
		authors: 'Kent, Seo',
		status: 'proposed-standard',
		obsoletes: ['2401'],
		url: 'https://www.rfc-editor.org/rfc/rfc4301',
		protocols: ['ipsec'],
		abstract: `The architectural foundation of [[ipsec|IPsec]] — defines the **Security Association Database (SAD)**, **Security Policy Database (SPD)**, **Security Parameters Index (SPI)**, the *transport vs tunnel* mode distinction, and the rules for selecting which outbound packets are encrypted, bypassed, or discarded. The second-generation architecture (obsoleted RFC 2401) that decoupled policy from key management cleanly enough for IKEv2 ([[rfc:7296|RFC 7296]]) to land on top.

This document and its companions ([[rfc:4302|RFC 4302]] AH, [[rfc:4303|RFC 4303]] ESP) are the *data-plane* definition. IKEv2 negotiates the keys; this RFC defines what the kernel does with each packet that matches an SA.`,
		notableSections: [
			{ ref: '§4', description: 'Security Associations — SAD, SPD, SPI semantics' },
			{ ref: '§5', description: 'IP traffic processing (outbound + inbound)' },
			{ ref: '§7', description: 'Auditing and logging' }
		]
	},
	{
		number: '4302',
		title: 'IP Authentication Header (AH)',
		year: 2005,
		authors: 'Kent',
		status: 'proposed-standard',
		obsoletes: ['2402'],
		url: 'https://www.rfc-editor.org/rfc/rfc4302',
		protocols: ['ipsec'],
		abstract: `Defines the **Authentication Header (AH)** — [[ipsec|IPsec]]'s integrity-only protocol. AH authenticates the entire [[ip|IP]] header (except mutable fields like {{ttl|TTL}}) **and** the payload using HMAC-SHA-2 or AES-GMAC. No encryption. Designed for environments where confidentiality was banned by export controls in the 1990s.

Almost no production deployment uses AH alone in 2026; **[[rfc:4303|ESP]]** with AEAD ciphers does both encryption and authentication in one pass and has won the architecture debate. AH is still allowed for transport-mode authentication of [[ipv6|IPv6]] extension headers, and a handful of high-assurance government deployments specify it.`,
		notableSections: [
			{ ref: '§2', description: 'Authentication Header format' },
			{ ref: '§3.3', description: 'Integrity Check Value (ICV) computation' }
		]
	},
	{
		number: '4303',
		title: 'IP Encapsulating Security Payload (ESP)',
		year: 2005,
		authors: 'Kent',
		status: 'proposed-standard',
		obsoletes: ['2406'],
		url: 'https://www.rfc-editor.org/rfc/rfc4303',
		protocols: ['ipsec'],
		abstract: `The **Encapsulating Security Payload (ESP)** — the part of [[ipsec|IPsec]] everyone actually deploys. Encrypts and authenticates [[ip|IP]] payloads (and, in tunnel mode, the full original packet) with AEAD ciphers like **AES-GCM** ([[rfc:4106|RFC 4106]]) or **ChaCha20-Poly1305** ([[rfc:7634|RFC 7634]]). 8-byte ESP header (SPI + 32-bit sequence number), 8-byte AEAD nonce, encrypted payload, 16-byte authentication tag.

The 32-bit sequence number drives **anti-replay** protection (§3.4.3): receivers maintain a sliding window of recently-seen sequences (default 32 entries — a documented foot-gun on 10 Gbps+ links). [[rfc:4304|RFC 4304]] / RFC 4309 extend this to 64-bit (ESN) for very high-rate flows.`,
		notableSections: [
			{ ref: '§2', description: 'ESP packet format (SPI, seq, IV, ciphertext, ICV)' },
			{ ref: '§3.3', description: 'Outbound processing — encryption + integrity in one AEAD pass' },
			{ ref: '§3.4.3', description: 'Anti-replay window (the famous default-32 pitfall)' },
			{ ref: '§A', description: 'Extended sequence number (ESN) appendix' }
		]
	},
	{
		number: '7296',
		title: 'Internet Key Exchange Protocol Version 2 (IKEv2)',
		year: 2014,
		authors: 'Kaufman, Hoffman, Nir, Eronen, Kivinen',
		status: 'internet-standard',
		obsoletes: ['5996'],
		url: 'https://www.rfc-editor.org/rfc/rfc7296',
		protocols: ['ipsec'],
		abstract: `**STD 79** — the canonical Internet Standard for **IKEv2**, the modern key-management protocol that negotiates [[ipsec|IPsec]] Security Associations. Two exchanges open the tunnel: **IKE_SA_INIT** (Diffie-Hellman + nonces + NAT detection, 2 messages) and **IKE_AUTH** (identity + first Child SA, 2 messages). Subsequent **CREATE_CHILD_SA** exchanges rekey or open new SAs; **INFORMATIONAL** carries delete and dead-peer-detection messages.

Edited across decades by [[pioneer:charlie-kaufman|Charlie Kaufman]] (Microsoft) and [[pioneer:tero-kivinen|Tero Kivinen]] (the ~20-year IKEv2 editor), with [[pioneer:paul-wouters|Paul Wouters]] now leading the IPSECME WG. The 2014 revision (Internet Standard) consolidated the 2005 first edition ([[rfc:4306|RFC 4306]]) and 2010 clarifications ([[rfc:5996|RFC 5996]]). Companion documents add fragmentation ([[rfc:7383|RFC 7383]]), signature auth ([[rfc:7427|RFC 7427]]), TCP encapsulation ([[rfc:8229|RFC 8229]]), and the post-quantum extensions [[rfc:8784|RFC 8784]] / [[rfc:9242|RFC 9242]] / [[rfc:9370|RFC 9370]].`,
		notableSections: [
			{ ref: '§1.2', description: 'IKE_SA_INIT and IKE_AUTH exchanges' },
			{ ref: '§1.3', description: 'CREATE_CHILD_SA — rekeying and new SAs' },
			{ ref: '§2.23', description: 'NAT traversal (UDP/4500 encapsulation)' },
			{ ref: '§3', description: 'Header and payload formats' }
		]
	},
	{
		number: '8784',
		title: 'Mixing Preshared Keys in the IKEv2 Internet Key Exchange',
		year: 2020,
		authors: 'Fluhrer, McGrew, Kampanakis, Smyslov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8784',
		protocols: ['ipsec'],
		abstract: `The first deployable **post-quantum** extension to [[ipsec|IPsec]]. Adds a **Post-quantum Preshared Key (PPK)** to the IKEv2 key derivation so that even if classical Diffie-Hellman is broken later by a quantum adversary, recorded traffic remains unrecoverable (the "harvest-now-decrypt-later" defence).

Compatible with the IKEv2 state machine; only the KDF inputs change. Co-authored by Cisco (Scott Fluhrer, David McGrew), AWS (Panos Kampanakis), and ELVIS-PLUS (Valery Smyslov) — illustrating that [[ipsec|IPsec]] is always a multi-vendor, multi-government project. Superseded for new deployments by [[rfc:9242|RFC 9242]] + [[rfc:9370|RFC 9370]] + the draft-ietf-ipsecme-ikev2-mlkem draft, but still the only PQ option for legacy stacks that can't be upgraded.`,
		notableSections: [
			{ ref: '§3', description: 'PPK_IDENTITY notify and KDF mixing' }
		]
	},
	{
		number: '9242',
		title: 'Intermediate Exchange in the IKEv2 Protocol',
		year: 2022,
		authors: 'Smyslov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9242',
		protocols: ['ipsec'],
		abstract: `Adds a new **IKE_INTERMEDIATE** exchange between IKE_SA_INIT and IKE_AUTH so that large post-quantum public keys (ML-KEM-768 is 1,184 bytes; ML-KEM-1024 is 1,568 bytes) can be transferred *after* the IKE SA is protected but *before* the identity is revealed. Without this, the IKE_SA_INIT message would exceed common UDP MTU limits and force fragmentation that NATs and firewalls regularly mangle.`,
		notableSections: [
			{ ref: '§3', description: 'IKE_INTERMEDIATE message format and rules' }
		]
	},
	{
		number: '9370',
		title: 'Multiple Key Exchanges in the IKEv2 Protocol',
		year: 2023,
		authors: 'Tjhai, Tomlinson, Bartlett, Fluhrer, Van Geest, Garcia-Morchon, Smyslov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9370',
		protocols: ['ipsec'],
		abstract: `Lets IKEv2 chain **multiple key-exchange methods** in a single SA negotiation — classical ecp384 *and* ML-KEM-768 *and* (optionally) a third KEM. The session key is derived from all of them combined, so an adversary must break *every* algorithm to recover it. The architectural answer to "we don't know yet which post-quantum KEM will hold up — so use several."`,
		notableSections: [
			{ ref: '§2', description: 'KE_ADDITIONAL_KEY_EXCHANGE_n notify' },
			{ ref: '§3', description: 'IKE_INTERMEDIATE chaining with multiple KEMs' }
		]
	},

	// ── mDNS / DNS-SD (Multicast DNS + Service Discovery) ──────────────
	{
		number: '6762',
		title: 'Multicast DNS',
		year: 2013,
		authors: 'Cheshire, Krochmal',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6762',
		protocols: ['mdns-dns-sd'],
		abstract: `Defines **[[mdns-dns-sd|Multicast DNS]]** — the [[dns|DNS]] wire format you already know, sent to a link-local multicast group (\`224.0.0.251\` / \`FF02::FB\`) on UDP/5353. Repurposes two flag bits: the high bit of QCLASS becomes the **unicast-response** bit; the high bit of RRCLASS becomes the **cache-flush** bit. Adds a probe/announce/respond/defend/goodbye lifecycle that turns DNS into a self-organising, conflict-resolving name registry for the local link.

[[pioneer:stuart-cheshire|Cheshire]] and Krochmal shipped this as Apple's **Rendezvous** (renamed **Bonjour** in 2005) starting in macOS 10.2 (2002) — eleven years before the [[rfc:6762|RFC]] was published. The standard codifies what had been running on millions of Macs for over a decade.`,
		notableSections: [
			{ ref: '§5', description: 'One-shot queries vs continuous queries' },
			{ ref: '§7', description: 'Known-answer suppression' },
			{ ref: '§8', description: 'Probing and announcing on startup' },
			{ ref: '§9', description: 'Conflict resolution' },
			{ ref: '§18', description: 'Reuse of QCLASS/RRCLASS top bits' }
		]
	},
	{
		number: '6763',
		title: 'DNS-Based Service Discovery',
		year: 2013,
		authors: 'Cheshire, Krochmal',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6763',
		protocols: ['mdns-dns-sd'],
		abstract: `Defines **[[mdns-dns-sd|DNS-SD]]** — the naming convention layered on top of [[dns|DNS]] (or [[mdns-dns-sd|mDNS]]) for service discovery. A service instance is named \`<Instance>._<service>._<proto>.<domain>\` — e.g., \`Office Printer._ipp._tcp.local\`. A **PTR** record enumerates instances of a service type; an **SRV** record gives \`host:port\`; **TXT** carries key-value metadata; **A/AAAA** resolves the hostname.

Independent of the transport. Works equally well over multicast DNS on the link or over unicast DNS for wide-area discovery (the latter now formalised by SRP, RFC 9665, 2025). The wire-protocol substrate for every AirPlay receiver, AirPrint printer, Chromecast, Sonos speaker, and Matter device on the planet.`,
		notableSections: [
			{ ref: '§4', description: 'Service Instance Names (the `Instance._service._proto.domain` pattern)' },
			{ ref: '§7', description: 'Service Names registered with IANA' },
			{ ref: '§6', description: 'Data syntax for DNS-SD TXT records' }
		]
	}
];

export const rfcMap = new Map(rfcs.map((r) => [r.number, r]));

export function getRfcByNumber(num: string): Rfc | undefined {
	return rfcMap.get(num);
}

export function getRfcsForProtocol(protocolId: string): Rfc[] {
	return rfcs.filter((r) => r.protocols?.includes(protocolId));
}
