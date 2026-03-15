import type { GraphNode, GraphEdge, Protocol, Category } from './types';
import { categories, categoryMap } from './categories';
import { transportProtocols } from './protocols/transport';
import { webApiProtocols } from './protocols/web-api';
import { asyncIotProtocols } from './protocols/async-iot';
import { realtimeAvProtocols } from './protocols/realtime-av';
import { utilitiesProtocols } from './protocols/utilities-security';
import { networkFoundationsProtocols } from './protocols/network-foundations';

export const allProtocols: Protocol[] = [
	...networkFoundationsProtocols,
	...transportProtocols,
	...webApiProtocols,
	...asyncIotProtocols,
	...realtimeAvProtocols,
	...utilitiesProtocols
];

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

export function getProtocolById(id: string): Protocol | undefined {
	return protocolMap.get(id);
}

export function getCategoryById(id: string): Category | undefined {
	return categoryMap.get(id);
}

export function getProtocolsForCategory(categoryId: string): Protocol[] {
	return allProtocols.filter((p) => p.categoryId === categoryId);
}
