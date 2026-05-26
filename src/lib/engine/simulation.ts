import {
	forceSimulation,
	forceLink,
	forceManyBody,
	forceCenter,
	forceCollide,
	forceRadial,
	forceX,
	forceY,
	type Simulation,
	type SimulationNodeDatum,
	type SimulationLinkDatum
} from 'd3-force';
import type { GraphNode, GraphEdge } from '$lib/data/types';
import { categories } from '$lib/data/categories';

export interface SimNode extends SimulationNodeDatum {
	id: string;
	type: 'hub' | 'category' | 'subcategory' | 'protocol';
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

	// Per-category angular anchors: each category claims a fixed direction
	// from the hub. Subcategories and protocols are pulled toward that
	// direction so cluster identity reads visually even after the sim settles.
	const CLUSTER_ANCHOR_RADIUS = 360;
	const catAnchors = new Map<string, { x: number; y: number }>();
	categories.forEach((cat, i) => {
		const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
		catAnchors.set(cat.id, {
			x: Math.cos(angle) * CLUSTER_ANCHOR_RADIUS,
			y: Math.sin(angle) * CLUSTER_ANCHOR_RADIUS
		});
	});

	const simulation = forceSimulation<SimNode>(simNodes)
		.force('center', forceCenter(0, 0).strength(0.05))
		.force(
			'charge',
			forceManyBody<SimNode>()
				.strength((d) => {
					if (d.isBorn === false) return 0;
					if (d.type === 'hub') return -800;
					if (d.type === 'category') return -400;
					if (d.type === 'subcategory') return -260;
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
					if (src.type === 'category') return 120;
					return 90;
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
			'radial-subcategories',
			forceRadial<SimNode>(340, 0, 0).strength((d) =>
				d.isBorn !== false && d.type === 'subcategory' ? 0.18 : 0
			)
		)
		.force(
			'radial-protocols',
			forceRadial<SimNode>(470, 0, 0).strength((d) =>
				d.isBorn !== false && d.type === 'protocol' ? 0.12 : 0
			)
		)
		.force(
			'cluster-x',
			forceX<SimNode>((d) => catAnchors.get(d.categoryId ?? '')?.x ?? 0).strength((d) => {
				if (d.isBorn === false) return 0;
				if (d.type === 'subcategory') return 0.12;
				if (d.type === 'protocol') return 0.09;
				return 0;
			})
		)
		.force(
			'cluster-y',
			forceY<SimNode>((d) => catAnchors.get(d.categoryId ?? '')?.y ?? 0).strength((d) => {
				if (d.isBorn === false) return 0;
				if (d.type === 'subcategory') return 0.12;
				if (d.type === 'protocol') return 0.09;
				return 0;
			})
		)
		.force(
			'collide',
			forceCollide<SimNode>()
				.radius((d) => (d.isBorn === false ? 0 : d.radius + 14))
				.strength(0.95)
				.iterations(2)
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

/**
 * Warm up the layout in two phases so the result is genuinely settled,
 * not just frozen at the moment the alpha hit zero.
 *
 *   Phase 1 — explore: slow alpha decay (0.006) for ~70% of the tick
 *     budget. Forces stay strong long enough that the simulation can
 *     actually find a low-energy layout instead of locking in early
 *     clumps.
 *   Phase 2 — settle: re-warm to alpha 0.25 with the original decay so
 *     collisions and link tensions can clean up small overlaps without
 *     materially moving the cluster shape.
 *
 * The original alphaDecay is restored before returning, so the live
 * force-mode simulation still cools quickly when the user is interacting.
 */
export function warmUpSimulation(simulation: Simulation<SimNode, SimLink>, ticks = 700): void {
	const origDecay = simulation.alphaDecay();
	const exploreTicks = Math.floor(ticks * 0.7);
	const settleTicks = ticks - exploreTicks;

	simulation.alpha(1).alphaDecay(0.006).stop();
	for (let i = 0; i < exploreTicks; i++) {
		simulation.tick();
	}

	simulation.alpha(0.25).alphaDecay(origDecay);
	for (let i = 0; i < settleTicks; i++) {
		simulation.tick();
	}

	simulation.alphaDecay(origDecay);
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
