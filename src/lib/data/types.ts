import type { StorySection } from './category-stories/types';

export interface HowItWorksStep {
	title: string;
	description: string;
}

export interface CodeExample {
	language: string;
	code: string;
	caption: string;
	alternatives?: { language: string; code: string; sections?: { title: string; code: string }[] }[];
}

export interface PerformanceInfo {
	latency: string;
	throughput: string;
	overhead: string;
}

// ─────────────────────────────────────────────────────────────────────
// Deep-dive types
//
// All optional. Backfilled per protocol from the deep-research reports
// in /research as we expand the app from a reference into a book.
// Adding a new field here is non-breaking — UIs render only what's set.
// ─────────────────────────────────────────────────────────────────────

/** A pointer to an external authoritative source. */
export interface SourceLink {
	url: string;
	label?: string;
}

/** Conceptual prerequisites for understanding a protocol. */
export interface PrerequisiteRefs {
	/** Concept IDs (see `src/lib/data/concepts.ts`). */
	concepts?: string[];
	/** Protocol IDs the reader should be familiar with first. */
	protocols?: string[];
}

/** A single field in a header-layout diagram. */
export interface HeaderField {
	name: string;
	bits: number;
	description?: string;
	color?: string;
	optional?: boolean;
	/** Short footnote, e.g., "scaled by Window Scale option". */
	note?: string;
}

/** A bit-by-bit visualization of a protocol's wire-format header. */
export interface HeaderLayout {
	title?: string;
	/** Bits per row in the diagram (default 32). */
	rowBits?: number;
	fields: HeaderField[];
	/** Free-form notes shown beneath the diagram. */
	notes?: string[];
}

/** A protocol's connection state machine. */
export interface StateMachine {
	title?: string;
	/** Optional Mermaid `stateDiagram-v2` source. */
	mermaid?: string;
	states: {
		id: string;
		name: string;
		description: string;
		transitions?: { event: string; target: string }[];
	}[];
}

/** A dated entry on a protocol's recent-changes or evolution timeline. */
export interface DatedTimelineEntry {
	/** Calendar date — `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. */
	date: string;
	title: string;
	description: string;
	source?: SourceLink;
	/** Other protocol IDs touched by this change. */
	protocols?: string[];
}

/** A pointer from a protocol page to an outage in `outages.ts`. */
export interface IncidentRef {
	outageId: string;
	/** Brief description of this protocol's role in the incident. */
	role?: string;
}

/** A real-world deployment data point. */
export interface RealWorldDeployment {
	org: string;
	scale?: string;
	description: string;
	date?: string;
	source?: SourceLink;
}

export interface FunFact {
	title: string;
	text: string;
	source?: SourceLink;
}

export interface PracticalWisdom {
	sysctls?: {
		key: string;
		defaultValue?: string;
		recommendation?: string;
		description: string;
	}[];
	pitfalls?: { title: string; text: string }[];
	tools?: { name: string; url?: string; description: string }[];
	notes?: { title: string; text: string }[];
}

export interface WiresharkHint {
	filter: string;
	description: string;
	exampleOutput?: string;
}

export interface LearnMoreLists {
	rfcs?: { number: string; title?: string; sections?: string[] }[];
	books?: {
		title: string;
		authors?: string;
		edition?: string;
		year?: number;
		chapters?: string[];
		url?: string;
	}[];
	papers?: {
		title: string;
		authors?: string;
		venue?: string;
		year?: number;
		url?: string;
		doi?: string;
	}[];
	posts?: { title: string; author?: string; site?: string; year?: number; url: string }[];
	videos?: { title: string; speaker?: string; venue?: string; year?: number; url: string }[];
	courses?: { title: string; institution?: string; code?: string; year?: number; url: string }[];
	podcasts?: { title: string; show?: string; year?: number; url: string }[];
	tools?: { name: string; description?: string; url: string }[];
}

export interface MediaRefs {
	videos?: { title: string; url: string; duration?: string; thumb?: string }[];
	podcasts?: { title: string; url: string; episode?: string }[];
	playgrounds?: { name: string; url: string; description?: string }[];
}

/** Standards body that owns the protocol — useful for grouping in the book. */
export type StandardsBody =
	| 'ietf'
	| 'ieee'
	| 'w3c'
	| 'iso'
	| 'itu'
	| 'industry-consortium'
	| 'de-facto';

export interface Protocol {
	id: string;
	name: string;
	abbreviation: string;
	categoryId: string;
	port?: number;
	year: number;
	rfc?: string;
	oneLiner: string;
	overview: string;
	howItWorks: HowItWorksStep[];
	useCases: string[];
	codeExample?: CodeExample;
	performance: PerformanceInfo;
	connections: string[];
	links?: {
		wikipedia?: string;
		rfc?: string;
		official?: string;
	};
	image?: {
		src: string;
		alt: string;
		caption?: string;
		credit?: string;
	};

	// ── Deep-dive (optional, backfilled from /research) ─────────────
	prerequisites?: PrerequisiteRefs;
	headerLayout?: HeaderLayout;
	stateMachine?: StateMachine;
	recentChanges?: DatedTimelineEntry[];
	famousIncidents?: IncidentRef[];
	realWorldDeployments?: RealWorldDeployment[];
	funFacts?: FunFact[];
	practicalWisdom?: PracticalWisdom;
	wireshark?: WiresharkHint[];
	learnMore?: LearnMoreLists;
	/** Long-form story sections beyond `overview`. Reuses StorySection. */
	historyArc?: StorySection[];
	/** IDs of frontier-development entries that touch this protocol. */
	frontier?: string[];
	/** IDs of pioneers (in `pioneers.ts`) who shaped this protocol. */
	pioneers?: string[];
	/** Embedded media references — videos, podcasts, playgrounds. */
	media?: MediaRefs;
	/** Standards body that owns this protocol. */
	standardsBody?: StandardsBody;
}

export interface Category {
	id: string;
	name: string;
	color: string;
	glowColor: string;
	description: string;
	icon: string;
}

export interface Subcategory {
	id: string;
	name: string;
	categoryId: string;
	protocolIds: string[];
	description: string;
	icon: string;
}

export type GraphNodeType = 'hub' | 'category' | 'subcategory' | 'protocol';

export interface GraphNode {
	id: string;
	type: GraphNodeType;
	label: string;
	abbreviation?: string;
	color: string;
	glowColor: string;
	radius: number;
	categoryId?: string;
	subcategoryId?: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	fx?: number | null;
	fy?: number | null;
}

export interface GraphEdge {
	source: string;
	target: string;
	color: string;
}

export interface Viewport {
	x: number;
	y: number;
	scale: number;
}
