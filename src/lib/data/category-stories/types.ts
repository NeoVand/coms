export interface Pioneer {
	/** Optional pioneer-registry id. When set (or when a registry entry's
	 *  `name` matches the inline `name`), the card becomes clickable and
	 *  links to /pioneer/[id]. */
	id?: string;
	name: string;
	years: string;
	title: string;
	org: string;
	contribution: string;
	imagePath?: string;
}

export interface TimelineEntry {
	year: number;
	title: string;
	description: string;
	protocolId?: string;
}

export interface ComparisonRow {
	/** Display label for the row — typically a protocol abbreviation. May use
	 *  inline link syntax like `[[tcp|TCP]]`. */
	label: string;
	/** One value per axis, in the same order as `axes`. May use inline syntax. */
	values: string[];
}

export type StorySection =
	| { type: 'narrative'; title?: string; text: string }
	| { type: 'timeline'; entries: TimelineEntry[] }
	| { type: 'pioneers'; title?: string; people: Pioneer[] }
	| { type: 'callout'; title: string; text: string }
	| { type: 'diagram'; title?: string; definition: string; caption: string }
	| { type: 'image'; src: string; alt: string; caption?: string; credit?: string; title?: string }
	| { type: 'comparison'; title?: string; axes: string[]; rows: ComparisonRow[]; note?: string };

export interface CategoryStory {
	categoryId: string;
	tagline: string;
	sections: StorySection[];
}
