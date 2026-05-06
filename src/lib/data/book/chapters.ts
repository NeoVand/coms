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
import { realtimeAv } from './parts/realtime-av';
import { utilitiesSecurity } from './parts/utilities-security';
import { patternsFailures } from './parts/patterns-failures';
import { famousOutages } from './parts/famous-outages';
import { frontier } from './parts/frontier';
import { howToLearnMore } from './parts/how-to-learn-more';

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
	realtimeAv,
	utilitiesSecurity,
	patternsFailures,
	famousOutages,
	frontier,
	howToLearnMore
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
