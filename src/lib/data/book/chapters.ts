/**
 * Book — the chapter index.
 *
 * Empty for now. Will be populated as content workstreams (concept depth,
 * outages, pioneers, frontier, per-protocol enrichment) land. Each
 * chapter is a curation of existing content; see `book/types.ts` for the
 * `ChapterSlot` kinds.
 */

import type { BookPart, Chapter } from './types';
import { foundationSections } from '../concept-foundations';
import { storyOfTheInternet } from './parts/story-of-the-internet';
import { layer23 } from './parts/layer-2-3';
import { transport } from './parts/transport';
import { webApi } from './parts/web-api';
import { asyncIot } from './parts/async-iot';

/**
 * Part I — Foundations.
 *
 * Each chapter is a `concept-section` slot pointing at the matching
 * entry in `foundationSections`, which `/book/foundations/[chapter]`
 * already renders via ChapterView. The teasers here mirror the ones
 * the Home tab shows so the TOC reads consistently.
 */
const FOUNDATION_SYNOPSIS: Record<string, string> = {
	'what-is-a-protocol':
		'What a protocol is, and why every machine on the planet agrees to follow them.',
	'layer-model':
		'Seven layers, the standards war that decided their fate, and where the layers blur.',
	addressing: 'How a packet finds your laptop — hostnames, IPs, MACs, and ports.',
	packets: 'Encapsulation in pictures — frames inside packets inside segments.',
	'ports-sockets': 'How one machine runs a hundred services without confusing them.',
	'reliability-speed': 'The defining tradeoff: TCP vs UDP, and why QUIC tries to have both.',
	'client-server-p2p': 'Two communication patterns and what each makes easy or hard.',
	'encryption-basics': "What HTTPS actually protects — and what it doesn't.",
	'ai-protocols': 'MCP and A2A — the new layer of protocols designed for AI agents.'
};

const partI: BookPart = {
	id: 'foundations',
	title: 'Foundations',
	label: 'I',
	description:
		'The vocabulary every networking conversation builds on. Read it once and the rest of the book has a place to land.',
	chapters: foundationSections.map((s) => ({
		id: s.id,
		title: s.title,
		synopsis: FOUNDATION_SYNOPSIS[s.id] ?? '',
		slots: [{ kind: 'concept-section', id: s.id }]
	}))
};

/**
 * Parts II–XII — outline only for now. Empty `slots` arrays mark
 * each chapter as "coming soon"; the TOC renderer treats them
 * differently from clickable chapters. Filling them in is the next
 * sustained content workstream.
 */
function stubChapters(items: { id: string; title: string; synopsis: string }[]): Chapter[] {
	return items.map((c) => ({ id: c.id, title: c.title, synopsis: c.synopsis, slots: [] }));
}

export const bookParts: BookPart[] = [
	partI,
	storyOfTheInternet,
	layer23,
	transport,
	webApi,
	asyncIot,
	{
		id: 'realtime-av',
		title: 'Real-time A/V',
		label: 'VII',
		description: 'Protocols that prioritise low latency over perfect delivery — voice, video, and live media.',
		chapters: stubChapters([
			{ id: 'rtp-and-rtcp', title: 'RTP and RTCP', synopsis: 'Carrying media on top of UDP.' },
			{ id: 'webrtc', title: 'WebRTC', synopsis: 'Peer-to-peer in the browser, ICE/STUN/TURN, DTLS, SRTP.' },
			{ id: 'sip-and-sdp', title: 'SIP and SDP', synopsis: 'Negotiating who speaks what codec on which IP.' },
			{ id: 'hls-and-dash', title: 'HLS and DASH', synopsis: 'Adaptive bitrate over plain HTTP.' },
			{ id: 'moq-transport', title: 'MoQ Transport', synopsis: 'Sub-second live streaming over QUIC.' }
		])
	},
	{
		id: 'utilities-security',
		title: 'Utilities & Security',
		label: 'VIII',
		description: 'The invisible plumbing — DNS, TLS, SSH, NTP, the email stack, and authentication.',
		chapters: stubChapters([
			{ id: 'dns', title: 'DNS', synopsis: "The internet's distributed phone book." },
			{ id: 'tls', title: 'TLS', synopsis: 'From SSL 1.0 (never released) to post-quantum hybrid.' },
			{ id: 'ssh', title: 'SSH', synopsis: 'Encrypted shells, port forwards, and SCP.' },
			{ id: 'ntp', title: 'NTP', synopsis: "Why your timestamp is correct to within milliseconds." },
			{ id: 'oauth-and-jwt', title: 'OAuth 2.1 and JWT', synopsis: 'How modern apps delegate access.' },
			{ id: 'email-stack', title: 'The Email Stack', synopsis: 'SMTP, IMAP, DMARC/SPF/DKIM.' }
		])
	},
	{
		id: 'patterns-failures',
		title: 'How Networks Actually Behave',
		label: 'IX',
		description: 'Recurring patterns and the failure modes they cause — handshakes, sliding windows, ossification, MTU black holes.',
		chapters: stubChapters([
			{ id: 'patterns', title: 'Recurring Patterns', synopsis: 'Handshakes, sliding windows, keepalives, ECN, hashing.' },
			{ id: 'failure-modes', title: 'Failure Modes', synopsis: 'Bufferbloat, ossification, head-of-line, microloops, MTU black holes.' },
			{ id: 'congestion-history', title: 'A History of Congestion Control', synopsis: 'Tahoe → Reno → CUBIC → BBR → L4S.' }
		])
	},
	{
		id: 'famous-outages',
		title: 'Famous Outages',
		label: 'X',
		description: 'Ten incidents told as stories — what broke, what cascaded, and what the industry learned.',
		chapters: stubChapters([
			{ id: 'arpanet-1980', title: 'ARPANET 1980', synopsis: 'The first major network crash; RFC 789.' },
			{ id: 'as-7007-1997', title: 'AS 7007 1997', synopsis: 'A Florida ISP de-aggregates the entire BGP table.' },
			{ id: 'mitnick-1994', title: 'Mitnick vs Shimomura 1994', synopsis: 'TCP sequence-prediction attack on Christmas Day.' },
			{ id: 'pakistan-youtube-2008', title: 'Pakistan/YouTube 2008', synopsis: 'A domestic block leaks globally.' },
			{ id: 'china-telecom-2010', title: 'China Telecom 2010', synopsis: '15% of the internet routed through a single AS for 18 minutes.' },
			{ id: 'sack-panic-2019', title: 'SACK Panic 2019', synopsis: 'A single TCP packet panics the Linux kernel.' },
			{ id: 'centurylink-2020', title: 'CenturyLink Flowspec 2020', synopsis: 'A BGP rule kills the BGP session that delivered it.' },
			{ id: 'facebook-2021', title: 'Facebook 2021', synopsis: 'BGP, DNS, badge readers — the cascade.' },
			{ id: 'rogers-2022', title: 'Rogers 2022', synopsis: 'A country disconnected for fifteen hours.' },
			{ id: 'att-mobility-2024', title: 'AT&T Mobility 2024', synopsis: '125 million devices, 25,000 failed 911 calls.' }
		])
	},
	{
		id: 'frontier',
		title: 'The Modern Frontier (2024–2026)',
		label: 'XI',
		description: 'What is actively shipping or being standardised right now — the things that will date this book in five years.',
		chapters: stubChapters([
			{ id: 'post-quantum', title: 'Post-Quantum TLS', synopsis: 'X25519MLKEM768 default in iOS 26.' },
			{ id: 'l4s-everywhere', title: 'L4S Everywhere', synopsis: 'Sub-millisecond queuing latency for cooperating flows.' },
			{ id: 'ipv6-mostly', title: 'IPv6-Mostly', synopsis: '50% on Google, 87% on US mobile.' },
			{ id: 'rpki-aspa', title: 'RPKI + ASPA', synopsis: 'Cryptographic BGP, finally arriving.' },
			{ id: 'ultra-ethernet', title: 'Ultra Ethernet', synopsis: 'Replacing RoCEv2 in AI training fabrics.' },
			{ id: 'wifi-7-and-8', title: 'Wi-Fi 7 and 8', synopsis: '320 MHz channels, then 25% better tail latency.' }
		])
	},
	{
		id: 'how-to-learn-more',
		title: 'How to Learn More',
		label: 'XII',
		description: 'Curated reading lists per area — the RFCs, books, courses, blogs, and tools worth investing time in.',
		chapters: stubChapters([
			{ id: 'rfcs-to-read', title: 'RFCs Worth Reading', synopsis: 'A guided tour with section pointers.' },
			{ id: 'books', title: 'Books', synopsis: 'Tanenbaum, Stevens, Kurose & Ross, Grigorik, the systems-approach textbook.' },
			{ id: 'courses', title: 'Courses', synopsis: 'Stanford CS144 (build a TCP stack), MIT 6.829, Berkeley CS168.' },
			{ id: 'blogs', title: 'Blogs', synopsis: 'Cloudflare, Meta Engineering, APNIC Labs, ipSpace.net.' },
			{ id: 'tools', title: 'Tools', synopsis: 'Wireshark, scapy, FRRouting, Containerlab, RIPE Atlas.' }
		])
	}
];

export const bookPartMap = new Map(bookParts.map((p) => [p.id, p]));

export function getBookPart(id: string): BookPart | undefined {
	return bookPartMap.get(id);
}

export function getChapter(partId: string, chapterId: string): Chapter | undefined {
	return bookPartMap.get(partId)?.chapters.find((c) => c.id === chapterId);
}

/** Flat list of all chapters in book order, with their part for breadcrumb use. */
export function listChapters(): { part: BookPart; chapter: Chapter; index: number }[] {
	const out: { part: BookPart; chapter: Chapter; index: number }[] = [];
	let i = 0;
	for (const part of bookParts) {
		for (const chapter of part.chapters) {
			out.push({ part, chapter, index: i++ });
		}
	}
	return out;
}
