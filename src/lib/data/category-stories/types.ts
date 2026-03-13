export interface Pioneer {
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

export type StorySection =
	| { type: 'narrative'; title?: string; text: string }
	| { type: 'timeline'; entries: TimelineEntry[] }
	| { type: 'pioneers'; title?: string; people: Pioneer[] }
	| { type: 'callout'; title: string; text: string }
	| { type: 'diagram'; title?: string; definition: string; caption: string };

export interface CategoryStory {
	categoryId: string;
	tagline: string;
	sections: StorySection[];
}
