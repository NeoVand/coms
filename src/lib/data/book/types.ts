/**
 * Book types — chapters compose the existing content, they do not duplicate it.
 *
 * The book is a curation layer over content that already lives in the
 * graph: a chapter is an ordered list of `ChapterSlot`s, each pointing
 * at a concept section, a category-story slice, a protocol, an outage,
 * a frontier entry, a comparison pair, an embedded simulation — or
 * holding free-form prose.
 *
 * As we add new content kinds (videos, code labs, quizzes), extend the
 * `ChapterSlot` discriminated union here.
 */

import type { StorySection } from '../category-stories/types';
import type { SourceLink } from '../types';

/** Which detail tabs to surface inline when embedding a protocol in a chapter. */
export type ProtocolFacet = 'overview' | 'history' | 'header' | 'state-machine' | 'incidents';

export type ChapterSlot =
	| { kind: 'concept-section'; id: string }
	| { kind: 'category-story'; categoryId: string; sectionIndex?: number }
	| { kind: 'protocol'; id: string; facets?: ProtocolFacet[] }
	| { kind: 'simulation'; protocolId: string; autoPlay?: boolean }
	| { kind: 'outage'; id: string }
	| { kind: 'pioneer'; id: string }
	| { kind: 'frontier'; id: string }
	| { kind: 'rfc'; number: string }
	| { kind: 'comparison'; pairIds: [string, string] }
	| { kind: 'prose'; sections: StorySection[] }
	| { kind: 'pull-quote'; text: string; attribution?: string; source?: SourceLink };

export interface Chapter {
	id: string;
	title: string;
	/** One-line synopsis shown in the table of contents. */
	synopsis?: string;
	/** Estimated read time in minutes. */
	estimatedMinutes?: number;
	slots: ChapterSlot[];
}

export interface BookPart {
	id: string;
	title: string;
	/** Roman-numeral or letter label for display, e.g., "I", "II". */
	label?: string;
	description?: string;
	chapters: Chapter[];
}
