/**
 * Pioneers — the people who shaped the protocols.
 *
 * Today the same names live (often duplicated) inside individual
 * category-stories/*.ts files. This is the canonical registry — each
 * pioneer entry can be referenced from many stories, protocols, and
 * outages. A `PioneerLink` component will render compact cards that
 * link to a `/pioneer/[id]` page where the full bio is available.
 *
 * Pulled from §2 of the category research files (the architects of the
 * field, beyond individual protocol authors).
 */

import type { SourceLink } from './types';

export interface PioneerAward {
	name: string;
	year?: number;
	url?: string;
}

export interface PioneerQuote {
	text: string;
	source?: SourceLink;
}

export interface Pioneer {
	id: string;
	name: string;
	/** Birth–death years, e.g., "1943–" or "1943–2024". */
	years: string;
	/** Primary title, e.g., "Co-inventor of TCP/IP". */
	title?: string;
	/** Primary affiliation. */
	org?: string;
	/** 1–2 paragraphs on contributions. */
	contribution: string;
	imagePath?: string;
	/** Protocol IDs this person shaped. */
	protocols?: string[];
	/** Category IDs this person shaped. */
	categories?: string[];
	awards?: PioneerAward[];
	links?: { wikipedia?: string; homepage?: string; awards?: string };
	quotes?: PioneerQuote[];
}

export const pioneers: Pioneer[] = [];

export const pioneerMap = new Map(pioneers.map((p) => [p.id, p]));

export function getPioneerById(id: string): Pioneer | undefined {
	return pioneerMap.get(id);
}

export function getPioneersForProtocol(protocolId: string): Pioneer[] {
	return pioneers.filter((p) => p.protocols?.includes(protocolId));
}
