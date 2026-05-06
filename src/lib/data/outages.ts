/**
 * Outages — famous incidents that taught the industry something.
 *
 * Each entry is a self-contained story: setup → mistake → cascade →
 * consequence → resolution → lesson. Cascade beats can name the
 * specific protocols that failed at each step, so the UI can light up
 * the affected nodes on the graph during a "replay" view.
 *
 * Pulled from §10 of the category research files (e.g., Facebook 2021,
 * AS 7007 1997, Pakistan/YouTube 2008, China Telecom 2010, CenturyLink
 * Flowspec 2020, Rogers 2022, AT&T Mobility 2024, SACK Panic 2019).
 *
 * Every factual claim must cite an authoritative source.
 */

import type { SourceLink } from './types';

export interface OutageActor {
	name: string;
	role: string;
}

export interface OutageBeat {
	/** Wall-clock or relative time, e.g., "15:39 UTC", "T+3 min". */
	time?: string;
	title: string;
	description: string;
	/** Protocols whose failure mode is illustrated by this beat. */
	protocols?: string[];
	color?: string;
}

export type OutageCategory =
	| 'configuration'
	| 'security'
	| 'software-bug'
	| 'hardware'
	| 'protocol-design'
	| 'human-error'
	| 'capacity';

export interface Outage {
	id: string;
	title: string;
	/** ISO date — `YYYY-MM-DD`. */
	date: string;
	/** Human-readable duration, e.g., "~6 hours". */
	duration?: string;
	/** Scope of impact, e.g., "Global", "1 ISP, 12M customers". */
	scale?: string;
	oneLiner: string;
	category?: OutageCategory;
	/** Protocol IDs that this outage exercised, broke, or hinged on. */
	affectedProtocols: string[];
	cast?: OutageActor[];
	/** How the system was supposed to work. */
	setup: string;
	/** What went wrong. */
	mistake: string;
	/** Step-by-step replay — used by the timeline/replay UI. */
	cascade?: OutageBeat[];
	consequence: string;
	resolution: string;
	/** The takeaway — what an engineer should learn from this. */
	lesson: string;
	sources: SourceLink[];
	image?: { src: string; alt: string; caption?: string; credit?: string };
}

export const outages: Outage[] = [];

export const outageMap = new Map(outages.map((o) => [o.id, o]));

export function getOutageById(id: string): Outage | undefined {
	return outageMap.get(id);
}

export function getOutagesForProtocol(protocolId: string): Outage[] {
	return outages.filter((o) => o.affectedProtocols.includes(protocolId));
}
