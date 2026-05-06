/**
 * Glossary — extended definitions that go beyond the inline tooltip.
 *
 * `concepts.ts` holds short, tooltip-friendly definitions used inline in
 * narrative text via `{{concept-id|label}}`. The glossary augments those
 * with longer text, see-also links, related protocols/RFCs, and worked
 * examples — material that belongs on a dedicated `/glossary[#term]`
 * page rather than crammed into a hover card.
 *
 * Pulled from §1 (Prerequisites & glossary) of the category research
 * files. A `GlossaryEntry.conceptId` always matches a `Concept.id`.
 */

import type { Concept } from './concepts';
import { concepts } from './concepts';
import type { SourceLink } from './types';

export interface GlossaryEntry {
	/** Matches a `Concept.id` from `concepts.ts`. */
	conceptId: string;
	/** 1–4 paragraphs expanding on the concept. May contain `{{}}`/`[[]]`. */
	longDefinition?: string;
	/** Other concept IDs the reader should know. */
	seeAlso?: string[];
	/** Protocol IDs that exemplify or implement this concept. */
	relatedProtocols?: string[];
	/** RFC numbers that define or rely on this concept. */
	relatedRfcs?: string[];
	/** Authoritative external explainers. */
	links?: SourceLink[];
	/** Worked examples — short paragraphs. */
	examples?: string[];
}

export const glossaryEntries: GlossaryEntry[] = [];

export const glossaryMap = new Map(glossaryEntries.map((g) => [g.conceptId, g]));

export function getGlossaryEntry(conceptId: string): GlossaryEntry | undefined {
	return glossaryMap.get(conceptId);
}

/**
 * Combined view: the short Concept (always present) merged with the
 * GlossaryEntry (optional). Use this for the glossary page renderer.
 */
export function getGlossaryFor(conceptId: string): (Concept & GlossaryEntry) | undefined {
	const concept = concepts.find((c) => c.id === conceptId);
	if (!concept) return undefined;
	const entry = glossaryMap.get(conceptId);
	return { ...concept, ...(entry ?? { conceptId }) };
}
