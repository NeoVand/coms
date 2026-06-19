import { describe, it, expect } from 'vitest';
import type { Simulation } from 'd3-force';
import { syncPositions, type SimNode } from './simulation';
import type { GraphNode } from '$lib/data/types';

/** Minimal GraphNode for position-sync tests (only id/x/y/vx/vy are touched). */
function gnode(id: string): GraphNode {
	return { id, x: 0, y: 0, vx: 0, vy: 0 } as GraphNode;
}

function snode(id: string, x: number, y: number): SimNode {
	return { id, type: 'protocol', radius: 10, ax: 0, ay: 0, ar: 0, x, y, vx: 1, vy: 2 };
}

/** Stub d3 simulation exposing only the .nodes() syncPositions reads. */
function fakeSim(simNodes: SimNode[]): Simulation<SimNode, never> {
	return { nodes: () => simNodes } as unknown as Simulation<SimNode, never>;
}

describe('syncPositions', () => {
	it('copies positions onto the matching graph node by id, regardless of order', () => {
		const simNodes = [snode('a', 10, 11), snode('b', 20, 21), snode('c', 30, 31)];
		// Graph nodes in a DIFFERENT order than the sim's internal array.
		const graphNodes = [gnode('c'), gnode('a'), gnode('b')];

		syncPositions(fakeSim(simNodes), graphNodes);

		const byId = new Map(graphNodes.map((n) => [n.id, n]));
		expect(byId.get('a')).toMatchObject({ x: 10, y: 11 });
		expect(byId.get('b')).toMatchObject({ x: 20, y: 21 });
		expect(byId.get('c')).toMatchObject({ x: 30, y: 31 });
	});

	it('leaves a graph node untouched when the sim has no node with its id', () => {
		const simNodes = [snode('a', 5, 6)];
		const graphNodes = [gnode('a'), gnode('orphan')];

		syncPositions(fakeSim(simNodes), graphNodes);

		expect(graphNodes[0]).toMatchObject({ x: 5, y: 6 });
		// orphan keeps its defaults — no stray sim node bleeds into it.
		expect(graphNodes[1]).toMatchObject({ x: 0, y: 0 });
	});
});
