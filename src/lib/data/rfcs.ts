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
		abstract: `Defines the **version-independent semantics** of HTTP — methods (GET, POST, PUT, DELETE, PATCH), status codes (2xx success, 4xx client error, 5xx server error), {{header|headers}}, {{idempotent|idempotency}}, {{content-negotiation|content negotiation}}, conditional requests, range requests, and authentication. The wire encoding is *not* here — this RFC is what [[http1|HTTP/1.1]], [[http2|HTTP/2]], and [[http3|HTTP/3]] all share.

Co-edited by [[pioneer:roy-fielding|Roy Fielding]] (the original HTTP/1.1 architect), Mark Nottingham, and Julian Reschke. Consolidates **six previous RFCs** (7230–7235) into a single semantics document, with the message-format pieces split off into version-specific siblings ([[rfc:9112|RFC 9112]], [[rfc:9113|9113]], [[rfc:9114|9114]]). Reading [[rfc:9110|RFC 9110]] explains every HTTP version at once.`,
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

Obsoletes the original [[rfc:7540|RFC 7540]] (2015), partly to incorporate the response to the *Rapid Reset* CVE-2023-44487 DDoS attack (October 2023) — RFC 9113 mandates server-side limits on concurrent stream creation/cancellation. Despite [[http3|HTTP/3]]'s growth, HTTP/2 still serves the majority of HTTPS bytes.`
	},
	{
		number: '9114',
		title: 'HTTP/3',
		year: 2022,
		authors: 'M. Bishop (ed.)',
		status: 'proposed-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc9114',
		protocols: ['http3'],
		abstract: `Specifies how [[rfc:9110|HTTP semantics]] map onto [[quic|QUIC]] streams — i.e. [[http3|HTTP/3]]. Each request/response pair is a bidirectional QUIC stream; HEADERS frames carry compressed headers via *QPACK* (the QUIC-friendly successor to {{hpack|HPACK}}); DATA frames carry the body. Because QUIC streams are independent at the *transport* layer, a lost packet only blocks its own stream — finally fixing the [[http2|HTTP/2]] {{head-of-line-blocking|head-of-line blocking}} that motivated the whole exercise.

Adoption is brisk: by 2025 ~35% of top-10M sites support HTTP/3; Cloudflare, Google, Meta, and Akamai all serve it by default. Discovered via the \`Alt-Svc\` header (or, more recently, the {{dns-resolution|DNS}} HTTPS RR — [[rfc:9460|RFC 9460]]) so the browser can switch on the second request.`
	},
	{
		number: '6455',
		title: 'The WebSocket Protocol',
		year: 2011,
		authors: 'I. Fette, A. Melnikov',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6455',
		protocols: ['websockets'],
		abstract: `Defines [[websockets|WebSockets]] — a {{full-duplex|full-duplex}}, persistent message-based channel between a browser and a server, bootstrapped over a regular [[http1|HTTP]] request. The handshake is an HTTP \`Upgrade: websocket\` exchange that, on success, leaves the underlying TCP connection in WebSocket framing mode forever after.

Edited by Ian Fette (Google) and Alexey Melnikov; the design was driven by [[pioneer:ian-hickson|Ian Hickson]] in the WHATWG. Solved the early-2000s "comet / long-poll" hacks that web apps used for server push. Frame format is small (2–14 byte overhead), supports binary or text, and is the foundation of every browser-side real-time app — chat, multiplayer games, collaborative editing, live tickers — that doesn't go through {{webrtc|WebRTC}}.`
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

Together these obsoleted the earlier RFC 882/883 (1983) and have stayed canonical for nearly four decades. Almost every DNS extension since (DNSSEC, EDNS0, DoH, DoT, SVCB/HTTPS RR) layers on top without changing the core message format.`
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
		abstract: `The current [[tls|TLS]] specification — a five-year, 28-draft redesign edited by [[pioneer:eric-rescorla|Eric Rescorla]]. Cuts every weak primitive (RC4, 3DES, MD5, SHA-1, RSA key exchange, static-DH), reduces the {{handshake|handshake}} to **one round trip** (or zero for resumption), and mandates *AEAD* as the only legal cipher mode. Forward secrecy is the default, not an option.

Internally cleaner than 1.0–1.2; externally indistinguishable on the wire from TLS 1.2 thanks to deliberate middlebox-compatibility hacks (\`legacy_version = 0x0303\`, fake ChangeCipherSpec record, real version in \`supported_versions\` extension) — without these the spec couldn't have deployed because ~3% of middleboxes parsed the version field and broke. The reason your browser's HTTPS handshake takes one round trip in 2026 instead of two.`,
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
		protocols: ['ntp'],
		abstract: `[[pioneer:david-mills|David L. Mills]]'s definitive specification of [[ntp|NTPv4]] — the protocol that synchronises every clock on the public internet to within milliseconds despite arbitrary network jitter. Defines the on-wire packet format, the *clock filter* algorithm, *Marzullo's algorithm* for selecting trustworthy peers from a candidate set, and the *clock discipline* loop that nudges the local oscillator without causing the kind of step-changes that would break [[tls|TLS]] certificate validation, Kerberos tickets, or distributed log timestamps.

Mills refined NTP across four decades (RFC 958/1119/1305/5905). Without his careful stewardship there would not be a working internet — every cryptographic protocol assumes monotonic, roughly-correct time. The 2024 successor work (NTS, [[rfc:8915|RFC 8915]]) adds the authentication NTP itself never had.`
	},
	{
		number: '1122',
		title: 'Requirements for Internet Hosts — Communication Layers',
		year: 1989,
		authors: 'R. Braden (ed.)',
		status: 'internet-standard',
		url: 'https://datatracker.ietf.org/doc/html/rfc1122',
		protocols: ['tcp', 'udp', 'ip', 'icmp'],
		abstract: `The defining "host requirements" document — pulls together every MUST/SHOULD/MAY constraint a compliant TCP/IP host has to honour at the link, internet, and transport layers. Edited by Bob Braden, IAB; the application-layer counterpart is [[rfc:1123|RFC 1123]]. Forty-plus years later this is still the spec people cite when arguing that ICMP is "an integral part of IP" (§3.2.2) or that a host MUST send an *ICMP Destination Unreachable* in particular cases.

Reading [[rfc:1122|RFC 1122]] is a fast way to learn what a "correct" TCP/IP stack actually has to do. Most operating-system kernels still implement a recognisable superset of these rules.`
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
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s January 1980 specification of the Internet Protocol — the first version published as a U.S. DoD standard, before the IETF process existed. Defines essentially the same datagram service as the better-known [[rfc:791|RFC 791]] (September 1981), which obsoleted it. Notable as the document where the *Robustness Principle* — *"be conservative in what you do, be liberal in what you accept from others"* — first appeared, in the introduction.`
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
		abstract: `[[pioneer:jon-postel|Jon Postel]]'s September 1981 specification of [[tcp|TCP]] — the canonical TCP RFC for **41 years**, almost certainly the longest-lived unmodified core IETF spec ever. Defines the {{three-way-handshake|three-way handshake}}, {{sequence-number|sequence numbers}}, the {{sliding-window|sliding window}}, FIN-based teardown, and {{time-wait|TIME_WAIT}} — every concept your kernel still implements.

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
		abstract: `Adds *SACK* — the **Selective Acknowledgment** option — to TCP. With cumulative ACKs alone, a single lost segment forces the sender to either wait for a timeout or naively re-send everything after the gap. SACK lets the receiver advertise which non-contiguous blocks it has actually received, so the sender can retransmit only the missing pieces.

Negotiated at handshake via SACK-Permitted; carried in subsequent ACKs as a TCP option. Almost universally implemented for two decades — without SACK, modern TCP behaviour over lossy links would be substantially worse.`
	},
	{
		number: '1948',
		title: 'Defending Against Sequence Number Attacks',
		year: 1996,
		authors: 'S. Bellovin',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc1948',
		protocols: ['tcp'],
		abstract: `Steve Bellovin's response to the 1994 Mitnick attack on Tsutomu Shimomura's machines. The original BSD TCP stack used a linear *Initial Sequence Number* counter — predictable enough that an attacker who could guess it could spoof a TCP three-way handshake without ever seeing the SYN-ACK. Bellovin proposes deriving the ISN from a cryptographic hash of the four-tuple plus a secret, so it's unpredictable to anyone who doesn't see the connection.

The technique is now standard in every TCP stack on earth; the underlying lesson — *don't assume anything you put on the wire predictably is "secret"* — recurs across decades of protocol design.`
	},
	{
		number: '4821',
		title: 'Packetization Layer Path MTU Discovery',
		year: 2007,
		authors: 'M. Mathis, J. Heffner',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc4821',
		protocols: ['tcp'],
		abstract: `*PLPMTUD* — a robust replacement for classic [[icmp|ICMP]]-based {{path-mtu-discovery|Path MTU Discovery}} that doesn't rely on receiving *Fragmentation Needed* messages. Instead the transport (TCP or another) probes the path with progressively-larger packets and infers the MTU from which probes get through and which don't.

Critical because so many networks drop or rate-limit ICMP, creating the {{mtu-black-hole|MTU black hole}} failure mode where TCP connections silently hang. Linux enables PLPMTUD by default since ~2007. The same technique applies to QUIC.`
	},
	{
		number: '4987',
		title: 'TCP SYN Flooding Attacks and Common Mitigations',
		year: 2007,
		authors: 'W. Eddy',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc4987',
		protocols: ['tcp'],
		abstract: `Wesley Eddy's survey of how SYN-flood DoS attacks work and what mitigations exist. The classic problem: a SYN forces the server to allocate state for a *half-open* connection while it waits for the third ACK; flooding SYNs from spoofed sources fills the backlog and starves legitimate clients.

Catalogues the three main defences — connection-table tuning, *SYN cookies* ([[pioneer:dan-bernstein|Bernstein]], 1996, makes the SYN-ACK statelessly verifiable so no server-side state is needed before the third ACK), and various rate-limiters. Reading order: this RFC, then Bernstein's original cr.yp.to write-up.`
	},
	{
		number: '5925',
		title: 'The TCP Authentication Option',
		year: 2010,
		authors: 'J. Touch, A. Mankin, R. Bonica',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc5925',
		protocols: ['tcp'],
		abstract: `*TCP-AO* — a modern replacement for the deprecated TCP-MD5 option (RFC 2385) used to authenticate long-lived [[bgp|BGP]] sessions. Provides per-segment HMAC authentication with multiple Master Key Tuples and graceful key rotation, fixing TCP-MD5's lack of algorithm agility and its vulnerability to MD5 collisions.

Cisco IOS-XR and Junos shipped TCP-AO years ago; **Linux didn't ship it until kernel 6.7 in January 2024**. Almost exclusively used for BGP today; the long-pole has been kernel support outside vendor silicon.`
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
		abstract: `The original experimental specification of *Multipath TCP* (MPTCP v0) — a TCP extension that lets a single logical connection use multiple network paths simultaneously, bonding e.g. Wi-Fi and cellular for a phone. Apple deployed v0 in iOS 7 (2013) for Siri, the first major real-world MPTCP use. The whole protocol falls back transparently to plain TCP when middleboxes strip the option, which is most of the time.

Obsoleted by [[rfc:8684|RFC 8684]] (MPTCP v1, 2020), which carries the lessons learned from production deployment.`
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
		abstract: `*MPTCP v1* — the standards-track replacement for the experimental [[rfc:6824|v0]], shipped after seven years of production experience. Cleaner option format, better fallback semantics for middleboxes that strip the MPTCP option from the SYN, and improved subflow management. Linux merged the upstream MPTCP implementation in kernel 5.6 (March 2020) after years of out-of-tree patches; Apple shipped v1 in iOS 14.

Where MPTCP works (Apple OS services, Korea Telecom GIGA Path, some specialised enterprise WANs) it works well; everywhere else it transparently falls back. The successor work is multipath [[quic|QUIC]] (\`draft-ietf-quic-multipath\`), which avoids the middlebox problem entirely by being inside an encrypted UDP payload.`
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
		abstract: `The original specification of [[sctp|SCTP]] — a transport protocol with TCP-like reliability plus two superpowers: **multiple independent {{stream|streams}}** in one association (no [[tcp|TCP]] {{head-of-line-blocking|head-of-line blocking}}) and **multi-homing** for IP-level failover when a path fails. Originally designed by Randall Stewart and others to carry telephony {{signaling|SS7 signaling}} over IP networks.

Obsoleted by [[rfc:4960|RFC 4960]] (2007) and then [[rfc:9260|RFC 9260]] (2022). SCTP rarely runs on the open internet because middleboxes don't pass it; it survives mostly inside telco networks, in WebRTC Data Channels (over UDP/DTLS), and in datacentre niches.`
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
		abstract: `The 2007 revision of [[sctp|SCTP]] — consolidated errata against the original [[rfc:2960|RFC 2960]] and clarified ambiguities found in early production deployments. The wire protocol is unchanged; this is the spec most SCTP implementations are written against. Itself obsoleted by [[rfc:9260|RFC 9260]] (2022).`
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
		abstract: `The current [[sctp|SCTP]] specification — consolidates 15+ years of errata against [[rfc:4960|RFC 4960]] and aligns with all the SCTP extensions (PR-SCTP, SCTP-AUTH, NDATA, …) that shipped in the meantime. Edited by Randall Stewart, Michael Tüxen, and Karen Nielsen.

Same wire protocol; cleaner spec. SCTP's largest production deployment by message count is **WebRTC Data Channels**, which run SCTP over DTLS over UDP — the only widely-deployed SCTP on the open internet.`
	},
	{
		number: '6951',
		title: 'UDP Encapsulation of SCTP Packets for End-Host to End-Host Communication',
		year: 2013,
		authors: 'M. Tüxen, R. Stewart',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc6951',
		protocols: ['sctp'],
		abstract: `Defines how to wrap [[sctp|SCTP]] packets inside [[udp|UDP]] {{datagram|datagrams}} so SCTP can traverse the {{nat|NAT}}s and {{firewall|firewalls}} that don't pass IP protocol 132. Without this, SCTP is essentially undeployable on the open internet — it works inside telco networks but dies at every consumer router.

The same trick that {{quic|QUIC}} would later generalise: ride on top of UDP because UDP is the lowest common denominator everything passes. Used by WebRTC Data Channels and a handful of telco-over-internet deployments.`
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
		abstract: `[[pioneer:steve-deering|Steve Deering]] and Bob Hinden's 1998 specification of [[ipv6|IPv6]] — the version most production IPv6 stacks were written against for 19 years. Defines the 128-bit address space, the 40-byte fixed header, extension headers, and the no-in-network-fragmentation rule.

Obsoleted by [[rfc:8200|RFC 8200]] (2017), which raised the spec to *Internet Standard 86* and clarified some details (e.g. the "Hop-by-Hop Options" extension is no longer required to be processed by every router along the path). Wire format unchanged.`
	},
	{
		number: '6434',
		title: 'IPv6 Node Requirements',
		year: 2011,
		authors: 'E. Jankiewicz, J. Loughney, T. Narten',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc6434',
		protocols: ['ipv6'],
		abstract: `The "host requirements" companion document for [[ipv6|IPv6]] — the IPv6 equivalent of [[rfc:1122|RFC 1122]], pulling together every MUST/SHOULD a compliant IPv6 node has to honour. Notable for **demoting IPsec from mandatory-to-implement to optional**, which became one of the most-cited corrections to the persistent myth that "IPv6 has built-in encryption." It does not — TLS is still where transport-layer encryption happens.

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
		abstract: `Joe Touch's clarification of how the 16-bit IPv4 *Identification* field is supposed to be used. The original [[rfc:791|RFC 791]] required a unique ID per source/destination/protocol combination, which on a 1 Gbps link cycles in milliseconds — a constraint many implementations had been ignoring for decades. RFC 6864 retroactively legalises the common practice: ID only matters when fragmentation is actually possible (DF=0); when DF=1, set it to anything.

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
		abstract: `*464XLAT* — a deployment pattern where an IPv6-only client runs a *CLAT* (Customer-side Translator) that synthesises IPv4 onto IPv6 (XLAT464) so legacy IPv4-only applications keep working, while the network operator runs a stateful *PLAT* (Provider-side Translator, NAT64) that maps the synthesised addresses to real public IPv4. End result: phones and laptops on a pure IPv6 network can still reach the IPv4 internet without dual-stack everywhere.

The standard recipe for "IPv6-Mostly" mobile and enterprise networks. Fedora/NetworkManager auto-enables CLAT for IPv6-mostly networks (2024); Windows 11 ships 464XLAT CLAT. Combined with [[rfc:8925|RFC 8925]] (DHCPv4 Option 108) and [[rfc:8781|RFC 8781]] (PREF64 in RA) it's how T-Mobile, Sky Broadband, and a growing number of enterprise networks actually run IPv6-only today.`
	},
	{
		number: '8305',
		title: 'Happy Eyeballs Version 2: Better Connectivity Using Concurrency',
		year: 2017,
		authors: 'D. Schinazi, T. Pauly',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8305',
		protocols: ['ipv6'],
		abstract: `*Happy Eyeballs v2* — the algorithm a dual-stack client uses to race IPv4 and IPv6 connection attempts in parallel and pick whichever wins, instead of trying IPv6 first and waiting for a long timeout when it fails. Originally [[rfc:6555|RFC 6555]] (2012, v1); v2 adds DNS resolution races, parallel address-family attempts with small staggers (typically 250 ms), and explicit support for {{tls|TLS}} where the OS doesn't manage that.

Without Happy Eyeballs the IPv6 transition would have been visibly painful for end users on networks with broken IPv6 connectivity — every page load would hang. Now standard in every major browser and OS.`
	},
	{
		number: '8781',
		title: 'Discovering PREF64 in Router Advertisements',
		year: 2020,
		authors: 'L. Colitti, J. Linkova',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8781',
		protocols: ['ipv6'],
		abstract: `Adds a *PREF64* option to IPv6 Router Advertisements that tells hosts the {{nat64|NAT64}} prefix in use on the local network. Hosts that know the PREF64 can synthesise IPv4 addresses into IPv6 themselves (CLAT, see [[rfc:6877|464XLAT]]) without needing DNS64 to do it for them — sidestepping a long list of DNS64 problems including {{dnssec|DNSSEC}} validation failures.

One of the small, high-leverage IPv6-Mostly deployment pieces. Native support landed in Linux's kernel and NetworkManager, Android, and Apple OSes between 2021 and 2023.`
	},
	{
		number: '8925',
		title: 'IPv6-Only Preferred Option for DHCPv4',
		year: 2020,
		authors: 'L. Colitti, J. Linkova, M. Richardson, T. Mrugalski',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc8925',
		protocols: ['ipv6', 'dhcp'],
		abstract: `*DHCPv4 Option 108* — a one-bit signal a DHCPv4 server sends to capable clients meaning "this network prefers IPv6; please skip IPv4 entirely." Clients that understand Option 108 don't even claim a DHCPv4 lease; they configure IPv6 via SLAAC + DHCPv6 and rely on {{nat64|NAT64}} for legacy IPv4 destinations.

Together with [[rfc:6877|464XLAT]] this is what makes "IPv6-Mostly" networks usable: dual-stack capable clients keep using IPv4 directly when the operator wants them to, IPv6-Mostly clients drop the IPv4 stack entirely. Apple iOS 14, Android 12, Windows 11, and modern Linux all honour it.`
	},
	{
		number: '8981',
		title: 'Temporary Address Extensions for Stateless Address Autoconfiguration in IPv6',
		year: 2021,
		authors: 'F. Gont, S. Krishnan, T. Narten, R. Draves',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc8981',
		protocols: ['ipv6'],
		abstract: `*IPv6 Privacy Extensions* — replaces the original [[rfc:4862|SLAAC]] EUI-64 interface identifier (which embedded the {{mac-address|MAC address}} in the IPv6 address and let networks track a device across visits) with **randomised, periodically-rotating** identifiers. Every modern OS turns this on by default.

Originally RFC 3041 (2001), then RFC 4941 (2007); this is the current revision. Without it, IPv6 would be a privacy disaster — your laptop's MAC, hashed into your global IP, visible to every server you ever connect to.`
	},
	{
		number: '2468',
		title: 'I REMEMBER IANA',
		year: 1998,
		authors: 'V. Cerf',
		status: 'informational',
		url: 'https://www.rfc-editor.org/rfc/rfc2468',
		abstract: `[[pioneer:vint-cerf|Vint Cerf]]'s memorial RFC for [[pioneer:jon-postel|Jon Postel]], who died on 16 October 1998 at age 55. Postel had run the IANA single-handedly from his ISI office for nearly three decades, edited essentially every foundational TCP/IP RFC, and authored the *Robustness Principle*. The RFC is a personal eulogy from one of his closest collaborators.

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
		abstract: `The original [[bgp|BGP]] specification — Kirk Lougheed (Cisco) and [[pioneer:yakov-rekhter|Yakov Rekhter]] (IBM) sketched it on **three napkins** at lunch during the 12th IETF meeting in Austin, January 1989; published as RFC 1105 six months later. Replaced *EGP*, which had been showing its age as the inter-domain routing protocol for the early internet.

The wire format and decision algorithm have evolved through BGP-2 (RFC 1163), BGP-3 (RFC 1267), and BGP-4 ([[rfc:4271|RFC 4271]]) — but the core idea (path-vector announcements with arbitrary local policy) is unchanged 36 years later.`
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
		abstract: `*GTSM* — a deceptively simple defence-in-depth trick for [[bgp|BGP]] (and any other peer-to-peer protocol over [[ip|IP]]). Two BGP routers that are directly connected set the outgoing {{ttl|TTL}} to 255 and require incoming packets to also have TTL ≥ 254. A remote attacker on the public internet can't forge a packet with TTL > 1 hop's worth, so spoofed BGP injections from off-path simply don't reach the BGP daemon.

Free, deployable today, no crypto required. Often paired with [[rfc:5925|TCP-AO]] or TCP-MD5 for cryptographic peer authentication.`
	},
	{
		number: '5575',
		title: 'Dissemination of Flow Specification Rules',
		year: 2009,
		authors: 'P. Marques et al.',
		status: 'standards-track',
		url: 'https://www.rfc-editor.org/rfc/rfc5575',
		protocols: ['bgp'],
		abstract: `*BGP Flowspec* — extends [[bgp|BGP]] to distribute packet-filter / traffic-engineering rules (match fields like source/destination prefix, port, protocol; action like drop, rate-limit, redirect). The original use case was anti-DDoS: when a network operator detects an attack, they distribute Flowspec rules across the network in seconds to drop the attack traffic at the edge.

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
		abstract: `*BGPsec* — extends [[bgp|BGP]] with cryptographic signatures over the AS_PATH so that a downstream router can verify each AS in the path actually authorised the route. Designed to defeat path-mangling {{bgp-hijack|BGP hijacks}} that RPKI Origin Validation alone can't catch.

In practice **deployment has been negligible** — every signature requires a verified RPKI cert chain, signature volumes balloon, hardware support is missing, and the operational model is unfamiliar. The **ASPA + Roles** approach of [[rfc:9234|RFC 9234]] (2022) ate BGPsec's lunch as the next-generation answer because it doesn't require per-update signatures.`
	},
	{
		number: '9234',
		title: 'Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages',
		year: 2022,
		authors: 'A. Azimov, E. Bogomazov, R. Bush, K. Patel, K. Sriram',
		status: 'proposed-standard',
		url: 'https://www.rfc-editor.org/rfc/rfc9234',
		protocols: ['bgp'],
		abstract: `Adds *Roles* to [[bgp|BGP]] — peers explicitly negotiate their relationship (provider, customer, peer, …) at OPEN, and a new *OTC* (Only-To-Customer) attribute carries the role through the AS_PATH. A route leak — a customer accidentally re-announcing transit-learned routes upstream as if it were a provider — becomes detectable at every router along the way and can be filtered automatically.

Together with RPKI-ROV and ASPA, this is the modern operational answer to BGP route-leak incidents that the more ambitious [[rfc:8205|BGPsec]] couldn't deliver. Steadily growing deployment: by 2026 every major IXP route server supports it.`
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
		abstract: `The first formal HTTP specification — co-authored by [[pioneer:tim-berners-lee|Tim Berners-Lee]] (CERN), [[pioneer:roy-fielding|Roy Fielding]] (UC Irvine), and Henrik Frystyk (W3C). Documents the request/response cycle, headers, status codes, MIME-typed bodies, and the GET/HEAD/POST methods that web servers in 1996 actually understood.

HTTP/1.0 opened a new TCP connection for every request — there was no {{keep-alive|keep-alive}} yet. *Informational* status because by the time it published, work on [[rfc:2068|HTTP/1.1]] (which fixed connection reuse) was already well advanced.`
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
		abstract: `The first specification of [[http1|HTTP/1.1]] — added persistent connections (keep-alive by default), pipelining, chunked transfer encoding, content negotiation, byte ranges, conditional requests (If-Modified-Since, ETag), proper caching semantics, and the OPTIONS / PUT / DELETE / TRACE methods. Most of what people still mean by "HTTP" was nailed down here.

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
		abstract: `The 1999 revision of [[http1|HTTP/1.1]] — for fifteen years, **the** spec every web developer, server, browser, library, and proxy was written against. [[pioneer:roy-fielding|Roy Fielding]]'s doctoral dissertation (REST) was being defended in the same period, and many of the architectural constraints that came to define "REST APIs" trace back to choices made here.

Eventually obsoleted by the **6-RFC split** (7230–7235, 2014), which separated message syntax from semantics from caching from authentication. Then [[rfc:9110|RFC 9110]] / [[rfc:9112|9112]] re-consolidated those in 2022. Despite all this churn, the wire format you see when you \`telnet example.com 80\` and type \`GET / HTTP/1.1\` has not changed since 1999.`
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
		abstract: `The original [[http2|HTTP/2]] specification — direct descendant of Google's *SPDY* experiment ([[pioneer:mike-belshe|Mike Belshe]] and Roberto Peon, 2009). Replaces HTTP/1.1's text-based one-request-per-connection model with a {{binary-framing|binary frame}} format and stream {{multiplexing|multiplexing}} over a single TCP connection. {{hpack|HPACK}} compresses repeated headers.

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

Forty years later still the canonical text for "how does DNS actually work". Almost every DNS extension since (DNSSEC, EDNS0, [[rfc:8484|DoH]], [[rfc:7858|DoT]], [[rfc:9460|SVCB/HTTPS]]) layers on top without changing the core architecture.`
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
