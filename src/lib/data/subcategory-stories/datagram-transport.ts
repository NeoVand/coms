import type { SubcategoryStory } from './types';

export const datagramTransportStory: SubcategoryStory = {
	subcategoryId: 'datagram-transport',
	tagline:
		"Going raw — or building something better in user space — on top of {{ip|IP}}'s native datagrams",
	sections: [
		{
			type: 'narrative',
			title: 'Two Protocols, Same Substrate',
			text: `When [[tcp|TCP]] and [[ip|IP]] split in 1978, the {{ietf|IETF}} did something easy to overlook: it kept a second protocol on the [[ip|IP]] layer that did *almost nothing*. **[[udp|UDP]]** (1980, [[rfc:768|RFC 768]]) is a 12-line specification — port numbers, length, checksum, payload. No connection. No retransmission. No flow control. No congestion control.\n\nFor 30 years, that minimalism made UDP the workhorse of the Internet's *other* half: [[dns|DNS]] queries, [[ntp|NTP]] clock sync, [[rtp|RTP]] voice and video, multicast, online games. Anywhere the application could tolerate loss but couldn't tolerate the latency of a [[tcp|TCP]] handshake, UDP showed up.\n\nThen in 2012, Google did something audacious: they built a *full reliable transport* on top of UDP. **[[quic|QUIC]]** — ostensibly "Quick UDP Internet Connections" — provided everything [[tcp|TCP]] gave you (ordered streams, retransmission, congestion control) plus things TCP couldn't (encryption integrated, multiple independent streams, connection migration, 0-RTT). It ran on UDP not because UDP was *right* for it, but because UDP was the only thing the Internet's middleboxes would still let through unmolested.\n\nThat decision — *user-space transport over UDP* — was a workaround for one of the deepest pathologies of the modern Internet: **{{ossification|protocol ossification}}**.`
		},
		{
			type: 'pioneers',
			title: 'The Datagram Family',
			people: [
				{
					id: 'jon-postel',
					name: 'Jon Postel',
					years: '1943–1998',
					title: 'Author of UDP',
					org: 'USC ISI / IANA',
					contribution:
						'Wrote [[rfc:768|RFC 768]] (1980), the entire UDP specification — three pages, four header fields, zero state. The shortest standards-track transport spec ever published. Postel also wrote RFC 793 (TCP) one year later, simultaneously defining both sides of the reliable/unreliable divide. His "robustness principle" — "be conservative in what you send, liberal in what you accept" — shaped how every UDP application handles malformed input.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg'
				},
				{
					id: 'jim-roskind',
					name: 'Jim Roskind',
					years: '–',
					title: 'Designer of QUIC',
					org: 'Google',
					contribution:
						'Started [[quic|QUIC]] at Google in 2012 to fix [[tcp|TCP]]\'s deployment problems: kernel ossification, [[head-of-line-blocking|HoL blocking]], and the slow rollout of TLS 1.3. Roskind\'s key bet was that the transport layer could be *re-implemented in user space* — ship updates with the browser, escape the kernel\'s deployment cycle. By 2017, Google reported ~7% of all Internet traffic was already QUIC. The {{ietf|IETF}} chartered the QUIC WG in 2016; [[rfc:9000|RFC 9000]] published in 2021.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Jim_Roskind_2016.jpg/330px-Jim_Roskind_2016.jpg'
				},
				{
					id: 'eric-rescorla',
					name: 'Eric Rescorla',
					years: '–',
					title: 'TLS 1.3 / QUIC Cryptography',
					org: 'Mozilla / RTFM, Inc.',
					contribution:
						"Lead author of TLS 1.3 ([[rfc:8446|RFC 8446]]) and architect of QUIC's integration with it. QUIC's encryption isn't \"TLS over QUIC\" — it's TLS 1.3's key schedule with QUIC's wire format. Rescorla's insight: encrypting the transport headers themselves (not just the payload) is what defeats {{ossification|ossification}} and lets future QUIC versions evolve. Every QUIC packet beyond the initial handshake is encrypted — middleboxes can see UDP/443 and that's it."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1980,
					title: 'UDP Standardized (RFC 768)',
					description:
						'[[pioneer:jon-postel|Postel]]\'s 3-page spec defines the simplest possible transport: 8-byte header, no state, no guarantees.'
				},
				{
					year: 1983,
					title: 'DNS Adopts UDP',
					description:
						'[[dns|DNS]] queries fit in a single UDP packet — the trade was obvious: avoid the {{tcp-handshake|TCP handshake}} latency for a query that could be re-issued on loss.'
				},
				{
					year: 1996,
					title: 'RTP over UDP (RFC 1889)',
					description:
						'[[rtp|RTP]] becomes the standard for real-time audio and video. Builds sequence numbers and timestamps *on top of UDP* — the application, not the transport, decides what to do about loss.'
				},
				{
					year: 2008,
					title: 'NAT Traversal via UDP Hole Punching',
					description:
						'{{ice|ICE}} (RFC 5245) and {{stun|STUN}}/{{turn|TURN}} establish that peer-to-peer connectivity requires UDP. [[webrtc|WebRTC]], P2P games, and (later) BitTorrent all rely on UDP\'s lighter NAT footprint.'
				},
				{
					year: 2012,
					title: 'Google QUIC Begins',
					description:
						'[[pioneer:jim-roskind|Roskind]] starts the project at Google. The goals are simple: reduce connection latency, eliminate TCP HoL blocking, encrypt everything, and ship via Chrome updates instead of kernel updates.'
				},
				{
					year: 2016,
					title: 'IETF QUIC Working Group Chartered',
					description:
						'Google donates QUIC to the IETF. The wire format is redesigned around TLS 1.3 from scratch. Standardization takes five years and 34 drafts — one of the longest IETF efforts since [[tcp|TCP]] itself.'
				},
				{
					year: 2021,
					title: 'QUIC v1 Published (RFC 9000)',
					description:
						'Connection migration, 0-RTT, per-stream loss recovery, mandatory encryption, version negotiation. The new transport that escaped the kernel.'
				},
				{
					year: 2022,
					title: 'HTTP/3 Published (RFC 9114)',
					description:
						'[[http3|HTTP/3]] runs over QUIC. By 2024, ~30% of all web traffic uses QUIC.'
				},
				{
					year: 2024,
					title: 'MASQUE Published',
					description:
						'Tunneling arbitrary traffic inside QUIC — used by iCloud Private Relay, Apple Private Cloud Compute, and Cloudflare\'s Privacy Gateway.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'UDP vs QUIC',
			axes: ['Connection state', 'Encryption', 'Streams', 'Loss recovery', 'Use cases'],
			rows: [
				{
					label: '[[udp|UDP]]',
					values: [
						'None — fire and forget',
						'None (application\'s problem — e.g. DTLS)',
						'None — opaque datagrams',
						"Application's problem",
						'[[dns|DNS]], [[ntp|NTP]], [[rtp|RTP]], multicast, games'
					]
				},
				{
					label: '[[quic|QUIC]]',
					values: [
						'Per-connection (with ID for migration)',
						'Mandatory TLS 1.3 — header + payload',
						'Many independent streams',
						"Per-stream — one stream's loss doesn't stall others",
						'[[http3|HTTP/3]], MASQUE, WebTransport, Media-over-QUIC'
					]
				}
			],
			note: 'QUIC isn\'t "fancier UDP" — it\'s a full reliable transport that happens to use UDP as its substrate. UDP remains the minimal-state datagram service it was in 1980.'
		},
		{
			type: 'diagram',
			title: 'UDP Fire-and-Forget vs QUIC 1-RTT Handshake',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: UDP — zero handshake, app handles everything
    C->>S: UDP datagram (data)
    Note over C: No ACK expected
    Note over C: No retransmit
    S-->>C: UDP datagram (reply, if any)
    Note over C,S: QUIC 1-RTT — encryption + transport in one round trip
    C->>S: Initial: ClientHello + QUIC params
    S-->>C: Initial: ServerHello + Handshake (encrypted)
    S-->>C: 1-RTT: application data (encrypted)
    C->>S: Handshake ACK + 1-RTT: application data
    Note over C,S: Subsequent: 0-RTT possible on resumption
    C->>S: 0-RTT: application data using cached keys
    S-->>C: 1-RTT: response`,
			caption:
				'UDP makes the application do everything. QUIC bundles handshake + encryption + transport into a single RTT — and zero RTT on resumption. The cost: every QUIC implementation re-implements reliable transport in user space.'
		},
		{
			type: 'callout',
			title: 'Protocol Ossification — Why QUIC Runs on UDP',
			text: `Here\'s the dirty secret of the modern Internet: **[[tcp|TCP]] cannot evolve**. Try to add a new TCP option, and a measurable fraction of the Internet silently drops your packets. Try to enable a new TCP feature (Multipath TCP, fast open, ECN), and middleboxes — firewalls, NATs, load balancers, deep-packet-inspection appliances — will reject or strip it.\n\nMiddleboxes do this because they read TCP headers and reject anything that doesn\'t look like what they remember from 2003. Once enough middleboxes do this, the protocol *fossilizes* — even though the wire format is supposed to be extensible, in practice it isn\'t.\n\n[[quic|QUIC]]\'s defense is total: encrypt the transport headers. Middleboxes see a UDP packet to port 443 and nothing else. They cannot inspect QUIC framing, cannot strip new fields they don\'t recognize, cannot reject features they don\'t understand. The cost of that defense is a re-implementation of reliable transport in user space — but the reward is **a transport protocol that can change**.`
		},
		{
			type: 'narrative',
			title: 'The Failure Mode',
			text: `[[udp|UDP]]\'s failure mode is *the application got it wrong*. Without congestion control, a UDP application that retries too aggressively can melt a network. [[dns|DNS]] amplification attacks weaponize UDP\'s lack of state: spoof a victim\'s address as the source of a 64-byte DNS query, and the open resolver replies with a 4 KB response *to the victim*. The amplification ratio enables 600 Gbps DDoS attacks from modest botnets.\n\n[[quic|QUIC]]\'s failure mode is **CPU**. Each QUIC connection does its own encryption, congestion control, and packet processing in user space. A kernel TCP stack benefits from decades of optimization (TSO, GRO, zero-copy); QUIC implementations are still catching up. Cloudflare measured QUIC at ~3.5× the CPU cost of TLS-over-TCP at equivalent throughput in 2024. Hardware offload for QUIC is the active frontier — Intel and AMD shipped first-pass QUIC NIC offloads in 2024.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **Multipath QUIC** — bonding multiple network paths into one QUIC connection, like [[mptcp|MPTCP]] but easier because QUIC isn\'t bound to TCP\'s wire format. Draft in WG, deployment underway at Apple and Cloudflare.\n- **MASQUE** — running arbitrary protocols (TCP, UDP, IP) inside QUIC for tunneling. Powers iCloud Private Relay and similar privacy infrastructure.\n- **WebTransport** — exposes QUIC streams to browsers, a likely successor to {{websockets|WebSockets}} for low-latency bidirectional traffic.\n- **Media-over-QUIC** — a new family of standards for live and on-demand media that bypasses RTP/RTMP/HLS entirely.\n- **QUIC offload silicon** — first-generation NIC support landing in 2024–2026, closing the CPU-cost gap with TCP.\n\nUDP itself isn\'t evolving — that\'s the point. It is the stable substrate. The action is one layer up.`
		}
	]
};
