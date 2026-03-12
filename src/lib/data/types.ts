export type MicroInteractionType =
	| 'handshake'
	| 'scatter'
	| 'tube'
	| 'blocking'
	| 'shield'
	| 'multiplex'
	| 'query-response'
	| 'publish-subscribe'
	| 'streaming'
	| 'peer-to-peer'
	| 'default';

export interface HowItWorksStep {
	title: string;
	description: string;
}

export interface CodeExample {
	language: string;
	code: string;
	caption: string;
	alternatives?: { language: string; code: string }[];
}

export interface PerformanceInfo {
	latency: string;
	throughput: string;
	overhead: string;
}

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
	microInteraction: MicroInteractionType;
	connections: string[];
	links?: {
		wikipedia?: string;
		rfc?: string;
		official?: string;
	};
}

export interface Category {
	id: string;
	name: string;
	color: string;
	glowColor: string;
	description: string;
	icon: string;
}

export type GraphNodeType = 'hub' | 'category' | 'protocol';

export interface GraphNode {
	id: string;
	type: GraphNodeType;
	label: string;
	abbreviation?: string;
	color: string;
	glowColor: string;
	radius: number;
	categoryId?: string;
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
