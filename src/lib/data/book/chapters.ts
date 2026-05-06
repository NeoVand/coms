/**
 * Book — the chapter index.
 *
 * Empty for now. Will be populated as content workstreams (concept depth,
 * outages, pioneers, frontier, per-protocol enrichment) land. Each
 * chapter is a curation of existing content; see `book/types.ts` for the
 * `ChapterSlot` kinds.
 */

import type { BookPart, Chapter } from './types';

export const bookParts: BookPart[] = [];

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
