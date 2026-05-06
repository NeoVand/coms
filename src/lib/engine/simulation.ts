import {
	forceSimulation,
	forceLink,
	forceManyBody,
	forceCenter,
	forceCollide,
	forceRadial,
	type Simulation,
	type SimulationNodeDatum,
	type SimulationLinkDatum
} from 'd3-force';
import type { GraphNode, GraphEdge } from '$lib/data/types';

export interface SimNode extends SimulationNodeDatum {
	id: string;
	type: 'hub' | 'category' | 'protocol';
	radius: number;
	categoryId?: string;
	/**
	 * Set false to make the node inert in the layout — no charge, no link
	 * pull, no collision. Used during the chronological bloom so unborn
	 * nodes don't perturb the live force simulation. Treat undefined as
	 * "born" so existing call sites are unchanged.
	 */
	isBorn?: boolean;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
	color: string;
}

export function createSimulation(
	nodes: GraphNode[],
	edges: GraphEdge[]
): Simulation<SimNode, SimLink> {
	const simNodes: SimNode[] = nodes.map((n) => ({
		id: n.id,
		type: n.type,
		radius: n.radius,
		categoryId: n.categoryId,
		x: n.x,
		y: n.y,
		vx: n.vx,
		vy: n.vy,
		fx: n.fx ?? undefined,
		fy: n.fy ?? undefined
	}));

	const simLinks: SimLink[] = edges.map((e) => ({
		source: e.source,
		target: e.target,
		color: e.color
	}));

	const simulation = forceSimulation<SimNode>(simNodes)
		.force('center', forceCenter(0, 0).strength(0.05))
		.force(
			'charge',
			forceManyBody<SimNode>()
				.strength((d) => {
					if (d.isBorn === false) return 0;
					if (d.type === 'hub') return -800;
					if (d.type === 'category') return -400;
					return -170;
				})
				.distanceMax(500)
		)
		.force(
			'link',
			forceLink<SimNode, SimLink>(simLinks)
				.id((d) => d.id)
				.distance((d) => {
					const src = d.source as SimNode;
					if (src.type === 'hub') return 180;
					return 100;
				})
				.strength((d) => {
					const src = d.source as SimNode;
					const tgt = d.target as SimNode;
					if (src.isBorn === false || tgt.isBorn === false) return 0;
					if (src.type === 'hub') return 0.4;
					return 0.6;
				})
		)
		.force(
			'radial-categories',
			forceRadial<SimNode>(200, 0, 0).strength((d) =>
				d.isBorn !== false && d.type === 'category' ? 0.3 : 0
			)
		)
		.force(
			'collide',
			forceCollide<SimNode>()
				.radius((d) => (d.isBorn === false ? 0 : d.radius + 12))
				.strength(0.8)
		)
		.alphaDecay(0.02)
		.velocityDecay(0.3);

	return simulation;
}

/**
 * Toggle a node's "born" state mid-simulation, optionally snapping it to
 * a starting position (typically its parent's current location).
 *
 * Setting born=false pins the node via fx/fy so it stays at `position`
 * while still appearing in the simulation's node list. Setting born=true
 * unpins and re-zeros velocity so the node is gently pushed by forces
 * from its current position rather than launching out from accumulated
 * pre-birth velocity.
 */
export function setBornState(
	simulation: Simulation<SimNode, SimLink>,
	nodeId: string,
	born: boolean,
	position?: { x: number; y: number }
): void {
	const sn = simulation.nodes().find((n) => n.id === nodeId);
	if (!sn) return;
	if (position) {
		sn.x = position.x;
		sn.y = position.y;
	}
	sn.vx = 0;
	sn.vy = 0;
	sn.isBorn = born;
	if (born) {
		sn.fx = null;
		sn.fy = null;
	} else {
		sn.fx = position?.x ?? sn.x ?? 0;
		sn.fy = position?.y ?? sn.y ?? 0;
	}
}

export function getSimNode(
	simulation: Simulation<SimNode, SimLink>,
	nodeId: string
): SimNode | undefined {
	return simulation.nodes().find((n) => n.id === nodeId);
}

export function warmUpSimulation(simulation: Simulation<SimNode, SimLink>, ticks = 300): void {
	simulation.alpha(1).stop();
	for (let i = 0; i < ticks; i++) {
		simulation.tick();
	}
}

export function syncPositions(simulation: Simulation<SimNode, SimLink>, nodes: GraphNode[]): void {
	const simNodes = simulation.nodes();
	for (let i = 0; i < simNodes.length; i++) {
		const sn = simNodes[i];
		const gn = nodes[i];
		if (gn && sn) {
			gn.x = sn.x ?? 0;
			gn.y = sn.y ?? 0;
			gn.vx = sn.vx ?? 0;
			gn.vy = sn.vy ?? 0;
		}
	}
}
