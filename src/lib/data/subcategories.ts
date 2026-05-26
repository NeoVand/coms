import type { Subcategory } from './types';

export const subcategories: Subcategory[] = [
	// ── Network Foundations ──────────────────────────────────────────
	{
		id: 'link-layer',
		name: 'Link Layer',
		categoryId: 'network-foundations',
		protocolIds: ['ethernet', 'arp'],
		description:
			'How bits cross a single physical segment — frames, MAC addresses, and the L2/L3 bridge.',
		icon: 'link-layer'
	},
	{
		id: 'internet-layer',
		name: 'Internet Layer',
		categoryId: 'network-foundations',
		protocolIds: ['ip', 'ipv6', 'icmp'],
		description:
			'Best-effort packet delivery across networks — the narrow waist of the hourglass.',
		icon: 'internet-layer'
	},
	{
		id: 'routing',
		name: 'Routing',
		categoryId: 'network-foundations',
		protocolIds: ['bgp', 'ospf'],
		description:
			'How routers learn paths and decide where to send packets — IGP vs EGP, policy vs convergence.',
		icon: 'routing'
	},
	{
		id: 'naming',
		name: 'Naming',
		categoryId: 'network-foundations',
		protocolIds: ['dns'],
		description:
			'The distributed database that lets humans find machines — hierarchy, delegation, caching.',
		icon: 'naming'
	},

	// ── Transport ────────────────────────────────────────────────────
	{
		id: 'reliable-streams',
		name: 'Reliable Streams',
		categoryId: 'transport',
		protocolIds: ['tcp', 'mptcp', 'sctp'],
		description:
			'Building reliable, ordered streams on top of best-effort IP — sequencing, retransmits, congestion control.',
		icon: 'reliable-streams'
	},
	{
		id: 'datagram-transport',
		name: 'Datagram Transport',
		categoryId: 'transport',
		protocolIds: ['udp', 'quic'],
		description:
			'When you go raw — or build something better in user space — on top of datagrams.',
		icon: 'datagram-transport'
	},

	// ── Web / API ────────────────────────────────────────────────────
	{
		id: 'http-versions',
		name: 'HTTP Versions',
		categoryId: 'web-api',
		protocolIds: ['http1', 'http2', 'http3'],
		description:
			'The single longest-running protocol evolution on the modern Internet — text → binary → user-space.',
		icon: 'http-versions'
	},
	{
		id: 'resource-query-apis',
		name: 'Resource & Query APIs',
		categoryId: 'web-api',
		protocolIds: ['rest', 'graphql'],
		description:
			'Modeling data on the web — resources and verbs (REST) vs schemas and queries (GraphQL).',
		icon: 'resource-query-apis'
	},
	{
		id: 'rpc-styles',
		name: 'RPC Styles',
		categoryId: 'web-api',
		protocolIds: ['soap', 'json-rpc', 'grpc'],
		description:
			'Calling a remote function like a local one — the RPC dream and its iterations.',
		icon: 'rpc-styles'
	},
	{
		id: 'realtime-web',
		name: 'Realtime Web',
		categoryId: 'web-api',
		protocolIds: ['sse', 'websockets'],
		description:
			'Breaking out of request/response — server push and full-duplex on the web.',
		icon: 'realtime-web'
	},
	{
		id: 'agent-protocols',
		name: 'Agent Protocols',
		categoryId: 'web-api',
		protocolIds: ['mcp', 'a2a'],
		description:
			'Protocols emerging in real time for AI agents — tool exposure (MCP) and agent-to-agent (A2A).',
		icon: 'agent-protocols'
	},

	// ── Async / IoT ──────────────────────────────────────────────────
	{
		id: 'enterprise-brokers',
		name: 'Enterprise Brokers',
		categoryId: 'async-iot',
		protocolIds: ['amqp', 'kafka', 'stomp'],
		description:
			'Decoupling producers and consumers at scale — queues, immutable logs, and the simple wire formats that talk to them.',
		icon: 'enterprise-brokers'
	},
	{
		id: 'iot-messaging',
		name: 'IoT Messaging',
		categoryId: 'async-iot',
		protocolIds: ['mqtt', 'coap'],
		description:
			'Talking to billions of constrained devices over flaky links — broker pub/sub and HTTP-like over UDP.',
		icon: 'iot-messaging'
	},
	{
		id: 'federated-messaging',
		name: 'Federated Messaging',
		categoryId: 'async-iot',
		protocolIds: ['xmpp'],
		description:
			'Federated, presence-aware messaging — the Jabber lineage that once powered Google Talk, WhatsApp, and Facebook Chat.',
		icon: 'federated-messaging'
	},

	// ── Real-Time A/V ────────────────────────────────────────────────
	{
		id: 'streaming-delivery',
		name: 'Streaming Delivery',
		categoryId: 'realtime-av',
		protocolIds: ['dash', 'hls', 'rtmp'],
		description:
			'Delivering video at Internet scale — push vs pull, segments vs streams, manifests and bitrate ladders.',
		icon: 'streaming-delivery'
	},
	{
		id: 'conferencing-calls',
		name: 'Conferencing & Calls',
		categoryId: 'realtime-av',
		protocolIds: ['webrtc', 'rtp', 'sip', 'sdp'],
		description:
			'The full call stack — signaling, session description, media transport, and NAT traversal — composing into WebRTC.',
		icon: 'conferencing-calls'
	},

	// ── Utilities / Security ─────────────────────────────────────────
	{
		id: 'secure-channels-vpn',
		name: 'Secure Channels & VPN',
		categoryId: 'utilities',
		protocolIds: ['tls', 'ssh', 'ipsec', 'wireguard'],
		description:
			'Encrypting traffic at different layers, for different threat models — transport, application, network, and the modern minimalist take.',
		icon: 'secure-channels-vpn'
	},
	{
		id: 'authentication',
		name: 'Authentication',
		categoryId: 'utilities',
		protocolIds: ['oauth2', 'kerberos'],
		description:
			'Proving who you are — tickets vs tokens, centralized realms vs federated delegation.',
		icon: 'authentication'
	},
	{
		id: 'mail-file-transfer',
		name: 'Mail & File Transfer',
		categoryId: 'utilities',
		protocolIds: ['smtp', 'imap', 'ftp'],
		description:
			'The oldest application protocols — store-and-forward, plain text, and surprisingly alive after fifty years.',
		icon: 'mail-file-transfer'
	},
	{
		id: 'network-services',
		name: 'Network Services',
		categoryId: 'utilities',
		protocolIds: ['dhcp', 'ntp', 'mdns-dns-sd', 'nat-traversal'],
		description:
			'Invisible plumbing — the protocols that make a network "just work" without anyone configuring them.',
		icon: 'network-services'
	},

	// ── Wireless ─────────────────────────────────────────────────────
	{
		id: 'wlan-wan',
		name: 'WLAN & WAN',
		categoryId: 'wireless',
		protocolIds: ['wifi', 'cellular'],
		description:
			'General-purpose wireless at different scales — unlicensed LAN spectrum vs licensed wide-area cellular.',
		icon: 'wlan-wan'
	},
	{
		id: 'pan-proximity',
		name: 'PAN & Proximity',
		categoryId: 'wireless',
		protocolIds: ['bluetooth', 'nfc', 'uwb', 'zigbee'],
		description:
			'Short-range wireless — different protocols for different proximity, power, and topology tradeoffs.',
		icon: 'pan-proximity'
	}
];

export const subcategoryMap = new Map(subcategories.map((s) => [s.id, s]));

/** Reverse lookup: protocolId → subcategoryId. */
export const protocolSubcategoryMap = new Map<string, string>();
for (const sub of subcategories) {
	for (const pid of sub.protocolIds) {
		protocolSubcategoryMap.set(pid, sub.id);
	}
}

export function getSubcategoriesForCategory(categoryId: string): Subcategory[] {
	return subcategories.filter((s) => s.categoryId === categoryId);
}
