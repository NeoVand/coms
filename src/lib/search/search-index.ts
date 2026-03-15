import { allProtocols, protocolMap } from '$lib/data/index';
import { concepts } from '$lib/data/concepts';
import { categories } from '$lib/data/categories';
import { getPairsForProtocol } from '$lib/data/comparison/pairs';
import { journeys } from '$lib/data/journeys';
import { getCategoryStory } from '$lib/data/category-stories/index';

export type SearchResultType =
	| 'protocol'
	| 'concept'
	| 'category'
	| 'comparison'
	| 'journey'
	| 'story';

export type SearchNav =
	| { kind: 'protocol'; protocolId: string }
	| { kind: 'concept'; conceptId: string }
	| { kind: 'category'; categoryId: string; tab?: 'story' | 'advanced' | 'journeys' }
	| { kind: 'comparison'; protocolId: string; compareTargetId: string }
	| { kind: 'journey'; journeyId: string }
	| { kind: 'hub'; tab: 'home' | 'concepts' | 'journeys' };

export interface SearchEntry {
	type: SearchResultType;
	label: string;
	description: string;
	/** Pre-lowercased searchable text */
	searchText: string;
	/** Protocol IDs for canvas highlighting */
	protocolIds: string[];
	nav: SearchNav;
	/** Category color for accent display */
	color?: string;
	/** For rich protocol label rendering */
	protocolMeta?: { abbreviation: string; name: string };
	/** For rich comparison label rendering */
	comparisonMeta?: {
		leftAbbr: string;
		leftColor: string;
		rightAbbr: string;
		rightColor: string;
		connector: string;
	};
}

// ── Build index at module level ────────────────────────────────

const entries: SearchEntry[] = [];

// 1. Protocols
for (const p of allProtocols) {
	const cat = categories.find((c) => c.id === p.categoryId);
	entries.push({
		type: 'protocol',
		label: `${p.abbreviation} \u2014 ${p.name}`,
		description: p.oneLiner,
		searchText: `${p.name} ${p.abbreviation} ${p.id} ${p.oneLiner}`.toLowerCase(),
		protocolIds: [p.id],
		nav: { kind: 'protocol', protocolId: p.id },
		color: cat?.color,
		protocolMeta: { abbreviation: p.abbreviation, name: p.name }
	});
}

// 2. Concepts
for (const c of concepts) {
	entries.push({
		type: 'concept',
		label: c.term,
		description: c.definition.length > 100 ? c.definition.slice(0, 100) + '\u2026' : c.definition,
		searchText: `${c.term} ${c.definition}`.toLowerCase(),
		protocolIds: [],
		nav: { kind: 'hub', tab: 'concepts' }
	});
}

// 3. Categories
for (const cat of categories) {
	const story = getCategoryStory(cat.id);
	const catProtos = allProtocols.filter((p) => p.categoryId === cat.id);
	const protoNames = catProtos.map((p) => `${p.name} ${p.abbreviation}`).join(' ');
	entries.push({
		type: 'category',
		label: cat.name,
		description: story?.tagline ?? cat.description,
		searchText: `${cat.name} ${cat.description} ${story?.tagline ?? ''} ${protoNames}`.toLowerCase(),
		protocolIds: catProtos.map((p) => p.id),
		nav: { kind: 'category', categoryId: cat.id },
		color: cat.color
	});
}

// 4. Comparisons (deduplicated)
const seenPairKeys = new Set<string>();
for (const p of allProtocols) {
	const { vs, relationships } = getPairsForProtocol(p.id);
	for (const pair of [...vs, ...relationships]) {
		const key = [...pair.ids].sort().join(':');
		if (seenPairKeys.has(key)) continue;
		seenPairKeys.add(key);
		const left = protocolMap.get(pair.ids[0]);
		const right = protocolMap.get(pair.ids[1]);
		if (!left || !right) continue;
		const cleanSummary = pair.summary.replace(/\[\[.*?\|(.*?)\]\]/g, '$1');
		const leftCat = categories.find((c) => c.id === left.categoryId);
		const rightCat = categories.find((c) => c.id === right.categoryId);
		entries.push({
			type: 'comparison',
			label: `${left.abbreviation} ${pair.type === 'vs' ? 'vs' : '+'} ${right.abbreviation}`,
			description:
				cleanSummary.length > 100 ? cleanSummary.slice(0, 100) + '\u2026' : cleanSummary,
			searchText:
				`${left.name} ${left.abbreviation} ${right.name} ${right.abbreviation} vs compare ${cleanSummary}`.toLowerCase(),
			protocolIds: [pair.ids[0], pair.ids[1]],
			nav: { kind: 'comparison', protocolId: pair.ids[0], compareTargetId: pair.ids[1] },
			comparisonMeta: {
				leftAbbr: left.abbreviation,
				leftColor: leftCat?.color ?? '#94a3b8',
				rightAbbr: right.abbreviation,
				rightColor: rightCat?.color ?? '#94a3b8',
				connector: pair.type === 'vs' ? 'vs' : '+'
			}
		});
	}
}

// 5. Journeys
for (const j of journeys) {
	const stepProtoNames = j.steps
		.map((s) => {
			const p = protocolMap.get(s.protocolId);
			return p ? `${p.name} ${p.abbreviation}` : '';
		})
		.join(' ');
	entries.push({
		type: 'journey',
		label: j.title,
		description: j.description,
		searchText: `${j.title} ${j.description} journey ${stepProtoNames}`.toLowerCase(),
		protocolIds: j.steps.map((s) => s.protocolId),
		nav: { kind: 'journey', journeyId: j.id },
		color: j.color
	});
}

// 6. Category stories
for (const cat of categories) {
	const story = getCategoryStory(cat.id);
	if (!story) continue;
	const catProtos = allProtocols.filter((p) => p.categoryId === cat.id);
	const protoNames = catProtos.map((p) => `${p.name} ${p.abbreviation}`).join(' ');
	entries.push({
		type: 'story',
		label: `${cat.name} Story`,
		description: story.tagline,
		searchText: `${cat.name} story history ${story.tagline} ${protoNames}`.toLowerCase(),
		protocolIds: catProtos.map((p) => p.id),
		nav: { kind: 'category', categoryId: cat.id, tab: 'story' },
		color: cat.color
	});
}

// ── Search function ────────────────────────────────────────────

const TYPE_PRIORITY: Record<SearchResultType, number> = {
	protocol: 6,
	category: 5,
	comparison: 4,
	concept: 3,
	journey: 2,
	story: 1
};

export function search(query: string, limit = 12): SearchEntry[] {
	const trimmed = query.trim();
	if (!trimmed) return [];
	const terms = trimmed.toLowerCase().split(/\s+/);

	const scored: { entry: SearchEntry; score: number }[] = [];

	for (const entry of entries) {
		let totalScore = 0;
		let allMatch = true;

		for (const term of terms) {
			const idx = entry.searchText.indexOf(term);
			if (idx === -1) {
				allMatch = false;
				break;
			}
			// Bonus for word-boundary match
			const atBoundary = idx === 0 || entry.searchText[idx - 1] === ' ';
			totalScore += atBoundary ? 3 : 1;
		}

		if (!allMatch) continue;

		// Exact label match bonus
		if (entry.label.toLowerCase().includes(trimmed.toLowerCase())) {
			totalScore += 5;
		}

		totalScore += TYPE_PRIORITY[entry.type];
		scored.push({ entry, score: totalScore });
	}

	// Ensure diversity: pick best results per type, then fill remaining slots
	scored.sort((a, b) => b.score - a.score);
	const byType = new Map<SearchResultType, { entry: SearchEntry; score: number }[]>();
	for (const s of scored) {
		if (!byType.has(s.entry.type)) byType.set(s.entry.type, []);
		byType.get(s.entry.type)!.push(s);
	}

	const picked = new Set<SearchEntry>();
	const result: SearchEntry[] = [];

	// First pass: guarantee top 2 from each matching type
	for (const [, items] of byType) {
		for (const s of items.slice(0, 2)) {
			if (result.length >= limit) break;
			picked.add(s.entry);
			result.push(s.entry);
		}
	}

	// Second pass: fill remaining slots by overall score
	for (const s of scored) {
		if (result.length >= limit) break;
		if (!picked.has(s.entry)) {
			result.push(s.entry);
		}
	}

	// Re-sort by type grouping order then score within type
	const TYPE_ORDER: Record<SearchResultType, number> = {
		protocol: 0,
		category: 1,
		comparison: 2,
		concept: 3,
		journey: 4,
		story: 5
	};
	result.sort((a, b) => {
		const typeOrd = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
		if (typeOrd !== 0) return typeOrd;
		const aScore = scored.find((s) => s.entry === a)?.score ?? 0;
		const bScore = scored.find((s) => s.entry === b)?.score ?? 0;
		return bScore - aScore;
	});

	return result;
}

/** Collect all protocol IDs from search results for canvas highlighting. */
export function collectProtocolIds(results: SearchEntry[]): Set<string> {
	const ids = new Set<string>();
	for (const r of results) {
		for (const id of r.protocolIds) ids.add(id);
	}
	return ids;
}
