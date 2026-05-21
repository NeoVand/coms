/**
 * Frontier — what's actively shipping or being standardized in 2024–2026.
 *
 * Each entry tags the protocols it touches, so a protocol page can
 * surface "Where this is heading" without reaching into a category file.
 * Pulled from §9 of the category research files.
 *
 * Examples this is built to hold: post-quantum TLS (X25519MLKEM768),
 * BBRv3, L4S, ECH (RFC 9849), RPKI/ROV/ASPA, IPv6 hitting 50% of Google
 * traffic (March 2026), Wi-Fi 7 / 8, 800 GbE / 1.6 TbE, MoQ Transport,
 * Ultra Ethernet 1.0, Streamable HTTP for MCP, A2A.
 */

import type { SourceLink } from './types';

export type FrontierStatus = 'shipped' | 'rolling-out' | 'standardizing' | 'experimental';

export type FrontierTopic =
	| 'security'
	| 'transport'
	| 'wireless'
	| 'web'
	| 'datacenter'
	| 'observability'
	| 'ai-agents'
	| 'standards'
	| 'iot'
	| 'realtime-av';

export interface FrontierMetric {
	label: string;
	value: string;
	date?: string;
	source?: SourceLink;
}

export interface FrontierEntry {
	id: string;
	title: string;
	oneLiner: string;
	topic: FrontierTopic;
	status: FrontierStatus;
	/** When this hit its current milestone — "2026-03-28", "active 2025-2026", etc. */
	date: string;
	/** Protocol IDs this affects. */
	protocols: string[];
	/** A few paragraphs of context. */
	description: string;
	/** Adoption / deployment data points. */
	metrics?: FrontierMetric[];
	sources: SourceLink[];
}

export const frontierEntries: FrontierEntry[] = [
	{
		id: 'ipv6-50-percent',
		title: "IPv6 Crosses 50% of Google's Traffic",
		oneLiner:
			"On 28 March 2026, [[ipv6|IPv6]] carried 50.1% of {{google|Google}}'s traffic for the first time — 28 years after [[rfc:2460|RFC 2460]].",
		topic: 'standards',
		status: 'shipped',
		date: '2026-03-28',
		protocols: ['ipv6', 'ip'],
		description: `{{google|Google}}'s [[ipv6|IPv6]] statistics dashboard recorded the milestone on 28 March 2026: weekly average ~45-48%, peak 50.1%. {{cloudflare|Cloudflare}} measured 40.1% of {{http-method|HTTP}} requests; {{apnic|APNIC}} Labs measured 43.13% [[ipv6|IPv6]]-capable networks — same trend, different vantage points. Mobile carriers are the leading edge: US averages around 87%, T-Mobile ~93%, France ~86%, India >75%.

The economics that finally tipped it: {{aws|AWS}} started charging $0.005/hour per public [[ip|IPv4]] address in February 2024, making [[ipv6|IPv6]]-only architectures financially compelling at scale. Combined with {{four-six-four-xlat|464XLAT}} being a first-class citizen in modern {{android|Android}}, iOS 9+, macOS 13+, and Windows 11, [[ipv6|IPv6]]-only access networks now Just Work for [[ip|IPv4]] applications too.`,
		metrics: [
			{ label: "Google peak", value: '50.1%', date: '2026-03-28' },
			{ label: 'Cloudflare HTTP', value: '40%', date: '2026-04' },
			{ label: 'APNIC capable', value: '43.13%', date: '2026-04' },
			{ label: 'US mobile avg', value: '~87%' }
		],
		sources: [
			{ url: 'https://www.google.com/intl/en/ipv6/statistics.html', label: 'Google IPv6 statistics' },
			{ url: 'https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/', label: 'APNIC — Google hits 50% IPv6' }
		]
	},
	{
		id: 'pq-tls-x25519mlkem768',
		title: 'Post-Quantum Hybrid TLS (X25519MLKEM768)',
		oneLiner:
			'~52% of [[tls|TLS]] 1.3 connections to {{cloudflare|Cloudflare}} carry post-quantum hybrid key {{exchange|exchange}} by end of 2025; on by default in iOS 26 and macOS Tahoe.',
		topic: 'security',
		status: 'rolling-out',
		date: '2025-09 (default in Apple platforms)',
		protocols: ['tls', 'quic'],
		description: `Chrome 116 (Aug 2023) shipped X25519Kyber768 behind a flag; Chrome 124 (Apr 2024) made it default. {{nist|NIST}} published {{fips|FIPS}} 203 ({{ml-kem|ML-KEM}}, formerly Kyber) on 13 August 2024, forcing a new [[tls|TLS]] codepoint 0x11EC for {{pq-ciphersuite|X25519MLKEM768}}; Chrome 131 (Nov 2024) switched to it. Firefox 132, Edge 131, and OpenJDK (JEP 527) followed.

{{apple|Apple}} iOS 26 / macOS Tahoe 26 (September 2025) turned {{pq-ciphersuite|X25519MLKEM768}} on by default for all [[tls|TLS]] 1.3 in {{apple|Apple}}'s Network.framework — within four days iOS {{pq|PQ}} traffic share went from <2% to 11%, and to >25% by December 2025. By end of 2025, ~52% of all [[tls|TLS]] 1.3 requests to {{cloudflare|Cloudflare}} carried {{pq|PQ}} key agreement. The lattice-based {{kem|KEM}} is twice the size of {{x25519|X25519}} alone, so the {{handshake|handshake}} costs a few extra [[tcp|TCP]] packets — measurable but not user-visible.`,
		metrics: [
			{ label: 'Cloudflare TLS 1.3 with PQ', value: '~52%', date: '2025-12' },
			{ label: 'iOS PQ share (4 days post-launch)', value: '11%', date: '2025-09' },
			{ label: 'iOS PQ share', value: '>25%', date: '2025-12' }
		],
		sources: [
			{ url: 'https://blog.cloudflare.com/pq-2025/', label: 'Cloudflare — PQ 2025' },
			{ url: 'https://csrc.nist.gov/pubs/fips/203/final', label: 'NIST FIPS 203 (ML-KEM)' }
		]
	},
	{
		id: 'bbrv3-default',
		title: 'BBRv3 Default for Google + YouTube',
		oneLiner:
			"{{google|Google}}'s model-based {{congestion-control|congestion control}} replaced {{cubic|CUBIC}} for {{google|google}}.com and YouTube traffic from 2023 — and is the default on {{google|Google}} Cloud.",
		topic: 'transport',
		status: 'shipped',
		date: '2023 (default through 2024-2025)',
		protocols: ['tcp', 'quic'],
		description: `{{bbr|BBR}} (Bottleneck {{bandwidth|Bandwidth}} and Round-trip propagation time) is {{google|Google}}'s {{congestion-control|congestion control}} that abandons loss as the primary signal and instead models the path's bottleneck {{bandwidth|bandwidth}} and {{rtt|RTT}}. Cardwell, Cheng, Gunn, Yeganeh, and Jacobson published it at {{acm-org|ACM}} Queue in 2016 (CACM Feb 2017). BBRv1's gain over {{cubic|CUBIC}} was ~4% globally on YouTube, more than 14% in some countries, and a 33% reduction in median {{rtt|RTT}}.

{{bbrv3|BBRv3}} is now \`draft-ietf-ccwg-bbr\` inside the {{ietf|IETF}}'s {{congestion-control|Congestion Control}} Working Group. {{google|Google}} has been running it as the default for {{google|google}}.com and YouTube traffic since 2023. The draft (-04 / -05 in 2025-2026) refines the {{bandwidth|bandwidth}} probing, packet conservation, and convergence properties that earlier {{bbr|BBR}} versions had open issues with. Available in {{linux|Linux}} via \`sysctl net.ipv4.tcp_congestion_control=bbr\` (paired with the FQ qdisc, which {{bbr|BBR}} {{pacing|pacing}} requires).`,
		metrics: [
			{ label: 'Google YouTube throughput gain (BBRv1)', value: '+4%', date: '2017' },
			{ label: 'Google median RTT reduction', value: '−33%', date: '2017' }
		],
		sources: [
			{ url: 'https://github.com/google/bbr', label: 'google/bbr GitHub repo' },
			{ url: 'https://datatracker.ietf.org/doc/draft-ietf-ccwg-bbr/', label: 'IETF — draft-ietf-ccwg-bbr' }
		]
	},
	{
		id: 'l4s-comcast-launch',
		title: 'L4S Launches in Production at Comcast',
		oneLiner:
			'Sub-millisecond queuing {{latency|latency}} on a residential {{isp|ISP}} — {{l4s|L4S}} goes from spec to deployed reality in January 2025.',
		topic: 'transport',
		status: 'rolling-out',
		date: '2025-01-29',
		protocols: ['tcp', 'quic'],
		description: `{{l4s|L4S}} (Low {{latency|Latency}}, Low Loss, Scalable throughput) — RFCs 9330/9331/9332, January 2023 — is the architecture for sub-millisecond queuing {{latency|latency}}. Comcast launched it in production in late January 2025 in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (MD) and San Francisco, with {{apple|Apple}}, {{nvidia|NVIDIA}} GeForce NOW, {{meta|Meta}} and Valve as launch partners.

The mechanism: cooperating senders mark packets {{ecn|ECN}}-Capable; routers running the DualQ Coupled {{aqm|AQM}} mark instead of dropping when congestion is incipient; senders react to marks like minor losses without backing off as hard. The result is {{bufferbloat|bufferbloat}} avoided in real time: {{latency|latency}}-sensitive apps (cloud gaming, video calls) get the headroom they need without starving classic [[tcp|TCP]]. {{apple|Apple}} shipped {{l4s|L4S}} support in iOS 17, iPadOS 17, macOS Sonoma and tvOS 17 in 2023, on by default for [[quic|QUIC]] in newer releases.`,
		sources: [
			{ url: 'https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s', label: 'RCR Wireless — Comcast L4S launch' },
			{ url: 'https://www.nokia.com/bell-labs/research/l4s/', label: 'Nokia Bell Labs — L4S' }
		]
	},
	{
		id: 'ech-rfc-9849',
		title: 'Encrypted Client Hello Published as RFC 9849',
		oneLiner:
			'[[tls|TLS]] 1.3 {{client-hello|ClientHello}} — including the {{sni|SNI}} — is finally encrypted; {{cloudflare|Cloudflare}} deploys {{ech|ECH}} for ~70% of fronted sites.',
		topic: 'security',
		status: 'shipped',
		date: '2025',
		protocols: ['tls'],
		description: `{{ech|ECH}} ({{ech|Encrypted Client Hello}}) hides the {{sni|SNI}} and other {{client-hello|ClientHello}} fields that previously let middleboxes and ISPs see which site you were visiting. Specified through 25 {{ietf|IETF}} drafts and finally published as [[rfc:9849|RFC 9849]] in 2025.

{{cloudflare|Cloudflare}} deploys {{ech|ECH}} for ~70% of websites it fronts; Chrome and Firefox both support it. The architecture: the server publishes an ECHConfig in [[dns|DNS]] (HTTPS RR); the client encrypts the inner {{client-hello|ClientHello}} to that key and wraps it in an outer {{client-hello|ClientHello}} that uses a generic "{{cloudflare|cloudflare}}-ech.com" {{sni|SNI}}. From the network's perspective, every fronted site looks the same.`,
		sources: [
			{ url: 'https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication.html', label: 'Feisty Duck — ECH approved for publication' },
			{ url: 'https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello', label: 'CISecurity — security control changes due to ECH' }
		]
	},
	{
		id: 'rpki-rov-50-percent',
		title: 'RPKI ROV Crosses 50% of IPv4 Prefixes',
		oneLiner:
			'Origin validation finally reaches the inflection point — most [[ip|IP]] traffic is now bound for an {{rpki|RPKI}}-secured destination.',
		topic: 'security',
		status: 'rolling-out',
		date: '2024-05',
		protocols: ['bgp'],
		description: `By May 2024, more than 50% of [[ip|IPv4]] routes had ROAs (Route Origin Authorisations); roughly three-quarters of [[ip|IP]] traffic was bound for {{rpki|RPKI}}-secured destinations. MANRS surpassed 1,190 participants in 2024 and continued growing through 2025 under Global Cyber Alliance stewardship.

{{cloudflare|Cloudflare}}'s separate measurement of *enforcement* (ASes that drop invalids) puts the directly-protected user population at ~261M (~6.5%), but because almost every Tier-1 {{transit|transit}} drops invalids, *indirect* validation suppresses invalid-route propagation by a factor of two to three. {{aspa|ASPA}} (the path-hijack defence beyond {{rpki|RPKI}}'s origin defence) is in {{ietf|IETF}} SIDROPS last call as of April 2026.`,
		metrics: [
			{ label: 'IPv4 prefixes with ROAs', value: '>50%', date: '2024-05' },
			{ label: 'Traffic bound for RPKI-secured destinations', value: '~75%', date: '2024' }
		],
		sources: [
			{ url: 'https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/', label: 'MANRS — RPKI ROV milestone' },
			{ url: 'https://blog.cloudflare.com/rpki-updates-data/', label: 'Cloudflare — RPKI Updates' }
		]
	},
	{
		id: 'wifi-7-ratified',
		title: 'Wi-Fi 7 (IEEE 802.11be) Ratified',
		oneLiner:
			'320-MHz channels in 6 GHz, 4096-{{qam|QAM}}, Multi-Link Operation; [[wifi|Wi-Fi]] 7 is the link-layer that {{ai|AI}} training fabrics over wireless want.',
		topic: 'wireless',
		status: 'shipped',
		date: '2025-07-22',
		protocols: ['wifi'],
		description: `{{ieee-802-15-4|IEEE}} 802.11be was published 22 July 2025 after 5+ years of drafting. Headline features: 320-MHz channels in the 6 GHz band, 4096-{{qam|QAM}} (12 bits per symbol), Multi-Link Operation (a single device association across 2.4/5/6 GHz simultaneously), preamble puncturing (skip interfered subcarriers without losing the whole channel), restricted {{target-wake-time|Target Wake Time}}.

The [[wifi|Wi-Fi]] Alliance opened certification on 8 January 2024. As of late April 2026, the Alliance reports >500M [[wifi|Wi-Fi]] 7-certified devices shipped; IDC projects 120M [[wifi|Wi-Fi]] 7 access-point shipments by end-2026. [[wifi|Wi-Fi]] 8 (802.11bn / Ultra High Reliability) Draft 1.0 reached July 2025 — not faster, but 25% better at 95th-percentile {{latency|latency}} and 25% fewer dropped packets during roaming. Final ratification scheduled March 2028.`,
		metrics: [
			{ label: 'Peak link rate', value: '46 Gbps' },
			{ label: 'Wi-Fi 7 certified devices', value: '>500M', date: '2026-04' }
		],
		sources: [
			{ url: 'https://www.ieee802.org/11/', label: 'IEEE 802.11 working group' },
			{ url: 'https://en.wikipedia.org/wiki/Wi-Fi_7', label: 'Wikipedia — Wi-Fi 7' }
		]
	},
	{
		id: 'ethernet-800g',
		title: '800 GbE Standardised — IEEE 802.3df-2024',
		oneLiner:
			'[[ethernet|Ethernet]] at 800 Gbps shipped to standard in February 2024; 1.6 TbE coming July 2026; {{ai|AI}} training fabrics are the demand engine.',
		topic: 'datacenter',
		status: 'shipped',
		date: '2024-02-16',
		protocols: ['ethernet'],
		description: `{{ieee-802-15-4|IEEE}} 802.3df-2024 was approved 16 February 2024 and published in 2024, defining 800 GbE (and 400 GbE on 100 G lanes). {{ieee-802-15-4|IEEE}} P802.3dj — covering 200 G/lane, 1.6 TbE, and updates for 200/400/800 G — is targeting completion in July 2026, though slip risk has been publicly noted.

{{ai|AI}} training fabrics are the demand engine. "Lossless [[ethernet|Ethernet]]" with RoCEv2 — [[ethernet|Ethernet]] plus PFC + DCQCN for losslessness — is replacing InfiniBand in many large {{gpu|GPU}} clusters because the operational tooling, vendor diversity, and per-port economics are all better. The Ultra [[ethernet|Ethernet]] Consortium's {{uec|UEC}} 1.0 spec (June 2025) is the next step: a new transport for {{ai|AI}}/HPC scale-out built on plain [[ethernet|Ethernet]]+[[ip|IP]] that explicitly competes with InfiniBand and RoCEv2.`,
		sources: [
			{ url: 'https://www.ieee802.org/3/dj/index.html', label: 'IEEE P802.3dj task force' },
			{ url: 'https://en.wikipedia.org/wiki/Terabit_Ethernet', label: 'Wikipedia — Terabit Ethernet' }
		]
	},
	{
		id: 'ultra-ethernet-1-0',
		title: 'Ultra Ethernet Consortium 1.0 Spec',
		oneLiner:
			'A 562-page open spec for {{ai|AI}}/HPC scale-out — {{connectionless|connectionless}}, {{multipath|multipath}}, packet-trimming — designed to replace RoCEv2 and InfiniBand.',
		topic: 'datacenter',
		status: 'shipped',
		date: '2025-06',
		protocols: ['ethernet'],
		description: `{{uec|UEC}} 1.0, released June 2025, is the Ultra [[ethernet|Ethernet]] Consortium's transport specification — a 562-page open spec by AMD, Arista, {{broadcom|Broadcom}}, {{cisco|Cisco}}, HPE, {{intel|Intel}}, {{meta|Meta}}, {{microsoft|Microsoft}} and dozens of partners for {{ai|AI}}/HPC scale-out fabrics. {{connectionless|Connectionless}}, unordered, {{multipath|multipath}} (intelligent packet spray instead of single-path), packet-trimming, selective {{retransmission|retransmission}}.

AMD's Pensando Pollara 400 is the first shipping {{nic|NIC}}. The likely RoCEv2 successor for the next generation of {{gpu|GPU}} clusters — at the scale of 100K+ accelerators training a single model, the assumptions baked into RoCEv2 (single-path, lossless via PFC, no out-of-order) become liabilities.`,
		sources: [
			{ url: 'https://ultraethernet.org/', label: 'Ultra Ethernet Consortium' },
			{ url: 'https://arxiv.org/html/2508.08906v1', label: 'Hoefler et al. — Ultra Ethernet design principles' }
		]
	},
	{
		id: 'multipath-quic',
		title: 'Multipath QUIC',
		oneLiner:
			'[[quic|QUIC]] catches up with [[mptcp|MPTCP]] — uses [[wifi|Wi-Fi]] and cellular simultaneously without breaking the [[quic|QUIC]] connection.',
		topic: 'transport',
		status: 'standardizing',
		date: 'late 2025 / early 2026',
		protocols: ['quic'],
		description: `\`draft-ietf-quic-multipath\` is in {{ietf|IETF}} last-call as of late 2025 / early 2026. The protocol extends [[quic|QUIC]] with multiple concurrent paths between endpoints, the same way [[mptcp|MPTCP]] extended [[tcp|TCP]] — but built into [[quic|QUIC]]'s connection-{{id-identifier|ID}} architecture rather than bolted on as [[tcp|TCP]] options.

Use cases: aggregating [[wifi|Wi-Fi]] and cellular {{bandwidth|bandwidth}} on a phone ({{apple|Apple}} already does this with [[mptcp|MPTCP]] for Siri), seamless network handover when the user changes interfaces, reaching a multi-homed server through whichever path is fastest. The {{3gpp|3GPP}} ATSSS standard for 5G already specifies [[mptcp|MPTCP]] and MPQUIC for traffic steering between cellular and [[wifi|Wi-Fi]].`,
		sources: [
			{ url: 'https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath', label: 'IETF — draft-ietf-quic-multipath' }
		]
	},
	{
		id: 'moq-transport',
		title: 'Media-over-QUIC (MoQ) Transport',
		oneLiner:
			'Sub-second live streaming over [[quic|QUIC]] — the spiritual successor to [[rtmp|RTMP]] and an alternative to [[webrtc|WebRTC]] for one-to-many.',
		topic: 'realtime-av',
		status: 'standardizing',
		date: '2026-03 (draft -17)',
		protocols: ['quic', 'http3'],
		description: `\`draft-ietf-moq-transport-17\` (March 2026) is the {{ietf|IETF}}'s Media-over-[[quic|QUIC]] Transport — sub-second live streaming over [[quic|QUIC]], designed to replace the [[rtmp|RTMP]]-into-[[hls|HLS]] pipeline that streamers use today. {{cloudflare|Cloudflare}} and {{meta|Meta}} have public MoQ relay implementations; Twitch and YouTube are evaluating.

The architecture: publishers send named objects to MoQ relays; subscribers {{imap-fetch|fetch}} named objects from the nearest relay, with hop-by-hop [[quic|QUIC]]. Object naming + [[quic|QUIC]] stream {{multiplexing|multiplexing}} mean a relay can drop objects under congestion (preserve key frames over delta frames) without the publisher coordinating. [[webrtc|WebRTC]]'s lunch may finally be eaten for one-to-many use cases.`,
		sources: [
			{ url: 'https://datatracker.ietf.org/doc/draft-ietf-moq-transport/', label: 'IETF — draft-ietf-moq-transport' },
			{ url: 'https://blog.cloudflare.com/moq/', label: 'Cloudflare — MoQ' }
		]
	},
	{
		id: 'mcp-streamable-http',
		title: 'MCP Streamable HTTP Transport',
		oneLiner:
			'{{anthropic|Anthropic}} deprecates the original {{http-method|HTTP}}+[[sse|SSE]] [[mcp|MCP]] transport in favour of Streamable {{http-method|HTTP}} (March 2025).',
		topic: 'ai-agents',
		status: 'shipped',
		date: '2025-03',
		protocols: ['mcp'],
		description: `The Model Context Protocol ({{anthropic|Anthropic}}, November 2024) shipped with two transports: {{stdio|stdio}} for local subprocess servers, and {{http-method|HTTP}}+[[sse|SSE]] for remote servers (an {{http-method|HTTP}} POST per request, an [[sse|SSE]] stream for server-initiated messages). The {{http-method|HTTP}}+[[sse|SSE]] transport had operational issues — long-lived [[sse|SSE]] connections behind proxies, two-channel state to manage — and was deprecated in March 2025 in favour of Streamable {{http-method|HTTP}}.

Streamable {{http-method|HTTP}} is one HTTP endpoint that can return either a single [[json-rpc|JSON-RPC]] response or upgrade to [[sse|SSE]] for streaming. Single channel, simpler proxy story, easier to deploy on serverless. Combined with the 2025-03-26 spec adding [[oauth2|OAuth]] 2.1 with {{pkce|PKCE}} and dynamic client registration plus Resource Indicators ({{rfc-doc|RFC}} 8707) for token scoping, [[mcp|MCP]] is now a real internet protocol — not just a local {{stdio|stdio}} convention.`,
		sources: [
			{ url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/transports', label: 'MCP spec — transports' },
			{ url: 'https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/', label: 'Stack Overflow blog — MCP auth' }
		]
	},
	{
		id: 'a2a-linux-foundation',
		title: 'A2A Donated to the Linux Foundation',
		oneLiner:
			'{{google|Google}}\'s Agent2Agent protocol joins [[mcp|MCP]] under open governance — the second {{ai|AI}}-agent protocol to find a foundation home.',
		topic: 'ai-agents',
		status: 'shipped',
		date: '2025-06',
		protocols: ['a2a', 'mcp'],
		description: `{{google|Google}} unveiled Agent2Agent ([[a2a|A2A]]) on 9 April 2025 at Cloud Next with 50+ partners and donated it to the {{linux|Linux}} Foundation in June 2025. [[a2a|A2A]] is the *agent-to-agent* layer above [[mcp|MCP]]: where [[mcp|MCP]] wires an agent to its tools and data, [[a2a|A2A]] wires agents to each other so they can collaborate or delegate tasks across vendors.

In December 2025 {{anthropic|Anthropic}} donated [[mcp|MCP]] to the Agentic {{ai|AI}} Foundation (AAIF), a {{linux|Linux}} Foundation directed fund co-founded by {{anthropic|Anthropic}}, Block, and OpenAI. [[mcp|MCP]] and [[a2a|A2A]] are now under the same umbrella. Mid-2026 industry analyses report [[mcp|MCP]] at ~78% enterprise adoption vs [[a2a|A2A]] at ~23% — the boundary between "agent" and "tool" remains fuzzy and the multi-agent collaboration use cases are still emerging.`,
		sources: [
			{ url: 'https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents', label: 'Linux Foundation — A2A project' },
			{ url: 'https://en.wikipedia.org/wiki/Model_Context_Protocol', label: 'Wikipedia — MCP' }
		]
	}
];

export const frontierMap = new Map(frontierEntries.map((f) => [f.id, f]));

export function getFrontierById(id: string): FrontierEntry | undefined {
	return frontierMap.get(id);
}

export function getFrontierForProtocol(protocolId: string): FrontierEntry[] {
	return frontierEntries.filter((f) => f.protocols.includes(protocolId));
}

export function getFrontierByTopic(topic: FrontierTopic): FrontierEntry[] {
	return frontierEntries.filter((f) => f.topic === topic);
}
