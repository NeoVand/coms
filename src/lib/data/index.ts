import type { GraphNode, GraphEdge, Protocol, Category } from './types';
import { categories, categoryMap } from './categories';
import { allProtocols } from './protocols';

export { allProtocols };

export const protocolMap = new Map(allProtocols.map((p) => [p.id, p]));

export { categories, categoryMap };

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

	// Protocol nodes
	for (const proto of allProtocols) {
		const cat = categoryMap.get(proto.categoryId);
		nodes.push({
			id: proto.id,
			type: 'protocol',
			label: proto.name,
			abbreviation: proto.abbreviation,
			color: cat?.color ?? '#FFFFFF',
			glowColor: cat?.glowColor ?? 'rgba(255,255,255,0.3)',
			radius: 16,
			categoryId: proto.categoryId,
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

	// Category → Protocol edges
	for (const proto of allProtocols) {
		const cat = categoryMap.get(proto.categoryId);
		edges.push({
			source: proto.categoryId,
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
