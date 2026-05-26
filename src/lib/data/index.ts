import type { GraphNode, GraphEdge, Protocol, Category, Subcategory } from './types';
import { categories, categoryMap } from './categories';
import {
	subcategories,
	subcategoryMap,
	protocolSubcategoryMap,
	getSubcategoriesForCategory
} from './subcategories';
import { allProtocols } from './protocols';
import { themedDomColor } from '../utils/colors';
import { pioneers as _pioneersRegistry, type Pioneer } from './pioneers';
import { rfcs as _rfcsRegistry, type Rfc } from './rfcs';
import { outages as _outagesRegistry, type Outage } from './outages';
import { frontierEntries as _frontierRegistry, type FrontierEntry } from './frontier';
import { listChapters as _listChapters } from './book';

export { allProtocols };

export const protocolMap = new Map(allProtocols.map((p) => [p.id, p]));

export { categories, categoryMap };
export { subcategories, subcategoryMap, protocolSubcategoryMap, getSubcategoriesForCategory };
export type { Subcategory };

// ── Deep-dive registries (populated as content workstreams land) ────
export {
	outages,
	outageMap,
	getOutageById,
	getOutagesForProtocol,
	type Outage,
	type OutageBeat,
	type OutageActor,
	type OutageCategory
} from './outages';

export {
	pioneers,
	pioneerMap,
	getPioneerById,
	getPioneersForProtocol,
	type Pioneer,
	type PioneerAward,
	type PioneerQuote
} from './pioneers';

export {
	frontierEntries,
	frontierMap,
	getFrontierById,
	getFrontierForProtocol,
	getFrontierByTopic,
	type FrontierEntry,
	type FrontierMetric,
	type FrontierStatus,
	type FrontierTopic
} from './frontier';

export {
	glossaryEntries,
	glossaryMap,
	getGlossaryEntry,
	getGlossaryFor,
	type GlossaryEntry
} from './glossary';

export { rfcs, rfcMap, getRfcByNumber, getRfcsForProtocol, type Rfc, type RfcStatus } from './rfcs';

export {
	bookParts,
	bookPartMap,
	getBookPart,
	getChapter,
	listChapters,
	type BookPart,
	type Chapter,
	type ChapterSlot,
	type ProtocolFacet
} from './book';

export function buildGraphNodes(): GraphNode[] {
	const nodes: GraphNode[] = [];

	// Hub node at center
	nodes.push({
		id: 'hub',
		type: 'hub',
		label: 'PROTOCOLS',
		color: '#FFFFFF',
		glowColor: 'rgba(255, 255, 255, 0.3)',
		radius: 40,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		fx: 0,
		fy: 0
	});

	// Category nodes
	for (const cat of categories) {
		nodes.push({
			id: cat.id,
			type: 'category',
			label: cat.name,
			color: cat.color,
			glowColor: cat.glowColor,
			radius: 28,
			categoryId: cat.id,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0
		});
	}

	// Subcategory nodes (inherit parent category color)
	for (const sub of subcategories) {
		const cat = categoryMap.get(sub.categoryId);
		nodes.push({
			id: sub.id,
			type: 'subcategory',
			label: sub.name,
			color: cat?.color ?? '#FFFFFF',
			glowColor: cat?.glowColor ?? 'rgba(255,255,255,0.3)',
			radius: 20,
			categoryId: sub.categoryId,
			subcategoryId: sub.id,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0
		});
	}

	// Protocol nodes
	for (const proto of allProtocols) {
		const cat = categoryMap.get(proto.categoryId);
		const subId = protocolSubcategoryMap.get(proto.id);
		nodes.push({
			id: proto.id,
			type: 'protocol',
			label: proto.name,
			abbreviation: proto.abbreviation,
			color: cat?.color ?? '#FFFFFF',
			glowColor: cat?.glowColor ?? 'rgba(255,255,255,0.3)',
			radius: 16,
			categoryId: proto.categoryId,
			subcategoryId: subId,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0
		});
	}

	return nodes;
}

export function buildGraphEdges(): GraphEdge[] {
	const edges: GraphEdge[] = [];

	// Hub → Category edges
	for (const cat of categories) {
		edges.push({
			source: 'hub',
			target: cat.id,
			color: cat.color
		});
	}

	// Category → Subcategory edges
	for (const sub of subcategories) {
		const cat = categoryMap.get(sub.categoryId);
		edges.push({
			source: sub.categoryId,
			target: sub.id,
			color: cat?.color ?? '#FFFFFF'
		});
	}

	// Subcategory → Protocol edges (fall back to Category → Protocol if
	// a protocol isn't yet assigned to a subcategory)
	for (const proto of allProtocols) {
		const cat = categoryMap.get(proto.categoryId);
		const subId = protocolSubcategoryMap.get(proto.id);
		edges.push({
			source: subId ?? proto.categoryId,
			target: proto.id,
			color: cat?.color ?? '#FFFFFF'
		});
	}

	return edges;
}

/**
 * Mesh edges: undirected, deduplicated protocol↔protocol edges built from
 * each protocol's `connections` field. Used by the 'mesh' layout to draw
 * the relationship graph without the hub/category scaffolding.
 *
 * Edge color is taken from the lower-id endpoint's category so that the
 * same edge always renders the same color regardless of source/target order.
 */
export function buildMeshEdges(): GraphEdge[] {
	const edges: GraphEdge[] = [];
	const seen = new Set<string>();

	for (const proto of allProtocols) {
		for (const otherId of proto.connections) {
			if (proto.id === otherId) continue;
			if (!protocolMap.has(otherId)) continue;
			const [a, b] = proto.id < otherId ? [proto.id, otherId] : [otherId, proto.id];
			const key = `${a}|${b}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const aProto = protocolMap.get(a)!;
			const aCat = categoryMap.get(aProto.categoryId);
			edges.push({
				source: a,
				target: b,
				color: aCat?.color ?? '#FFFFFF'
			});
		}
	}

	// Sub→protocol tree edges so subcategories read as cluster anchors in
	// the mesh alongside the cross-cluster connection strands. Coloured
	// from the subcategory's parent category (protocols share that hue).
	for (const sub of subcategories) {
		const cat = categoryMap.get(sub.categoryId);
		const color = cat?.color ?? '#FFFFFF';
		for (const protoId of sub.protocolIds) {
			if (!protocolMap.has(protoId)) continue;
			edges.push({
				source: sub.id,
				target: protoId,
				color
			});
		}
	}

	return edges;
}

export function getProtocolById(id: string): Protocol | undefined {
	return protocolMap.get(id);
}

export function getCategoryById(id: string): Category | undefined {
	return categoryMap.get(id);
}

export function getProtocolsForCategory(categoryId: string): Protocol[] {
	return allProtocols.filter((p) => p.categoryId === categoryId);
}

// ─────────────────────────────────────────────────────────────────────
// Category-aware roll-ups. These give CategoryReferences.svelte the
// same "in-the-book + pioneers + RFCs + outages + frontier" rollup
// that ProtocolReferences already shows for a single protocol.
//
// RFCs, outages, and frontier entries don't carry a `categories` field
// directly — their `protocols: string[]` is the source of truth — so
// we resolve them transitively: take the category's protocols, then
// union the records that touch any of them.
// ─────────────────────────────────────────────────────────────────────

export function getPioneersForCategory(categoryId: string): Pioneer[] {
	return _pioneersRegistry.filter((p) => p.categories?.includes(categoryId));
}

export function getRfcsForCategory(categoryId: string): Rfc[] {
	const protoIds = new Set(getProtocolsForCategory(categoryId).map((p) => p.id));
	return _rfcsRegistry.filter((r) => r.protocols?.some((id) => protoIds.has(id)));
}

export function getOutagesForCategory(categoryId: string): Outage[] {
	const protoIds = new Set(getProtocolsForCategory(categoryId).map((p) => p.id));
	return _outagesRegistry.filter((o) => o.affectedProtocols.some((id) => protoIds.has(id)));
}

export function getFrontierForCategory(categoryId: string): FrontierEntry[] {
	const protoIds = new Set(getProtocolsForCategory(categoryId).map((p) => p.id));
	return _frontierRegistry.filter((f) => f.protocols.some((id) => protoIds.has(id)));
}

/**
 * Chapters that reference this category — either via a `category-story`
 * slot pinned to the category id, or via any slot that names a protocol
 * inside the category. Returns the same shape ProtocolReferences uses
 * for its "In the Book" section.
 */
export function getChaptersForCategory(categoryId: string): {
	partId: string;
	partTitle: string;
	partLabel: string;
	chapterId: string;
	chapterTitle: string;
	synopsis?: string;
}[] {
	const protoIds = new Set(getProtocolsForCategory(categoryId).map((p) => p.id));
	const out: {
		partId: string;
		partTitle: string;
		partLabel: string;
		chapterId: string;
		chapterTitle: string;
		synopsis?: string;
	}[] = [];
	const seen = new Set<string>();

	for (const { part, chapter } of _listChapters()) {
		const key = `${part.id}/${chapter.id}`;
		if (seen.has(key)) continue;

		const matches = chapter.slots.some((slot) => {
			if (slot.kind === 'category-story' && slot.categoryId === categoryId) return true;
			if (slot.kind === 'protocol' && protoIds.has(slot.id)) return true;
			if (slot.kind === 'simulation' && protoIds.has(slot.protocolId)) return true;
			return false;
		});

		if (matches) {
			seen.add(key);
			out.push({
				partId: part.id,
				partTitle: part.title,
				partLabel: part.label ?? '',
				chapterId: chapter.id,
				chapterTitle: chapter.title,
				synopsis: chapter.synopsis
			});
		}
	}
	return out;
}

/**
 * Resolve a protocol id to its category color. Used by inline link
 * renderers and pills so a protocol mention always renders in its own
 * category color rather than inheriting the parent surface's accent.
 *
 * Falls back to the supplied default when the id is unknown (typo or
 * not-yet-registered protocol). Theme-aware via `themedDomColor`.
 */
export function getProtocolColor(
	protocolId: string,
	theme: 'dark' | 'light',
	fallback = '#94a3b8'
): string {
	const proto = protocolMap.get(protocolId);
	if (!proto) return fallback;
	const cat = categoryMap.get(proto.categoryId);
	if (!cat) return fallback;
	return themedDomColor(cat.color, theme);
}
