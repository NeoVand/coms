import {
	forceSimulation,
	forceLink,
	forceManyBody,
	forceCollide,
	forceRadial,
	forceX,
	forceY,
	type Simulation,
	type SimulationNodeDatum,
	type SimulationLinkDatum
} from 'd3-force';
import type { GraphNode, GraphEdge } from '$lib/data/types';

export interface SimNode extends SimulationNodeDatum {
	id: string;
	type: 'hub' | 'category' | 'subcategory' | 'protocol';
	radius: number;
	categoryId?: string;
	subcategoryId?: string;
	/** Hierarchical angular anchor (x/y) and its ring radius — each subcategory
	 *  gets its own slice of its category's wedge so branches fan out cleanly
	 *  instead of collapsing into a single spoke. */
	ax: number;
	ay: number;
	ar: number;
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

/** Deterministic [0,1) hash of a string, so seed jitter is stable per reload. */
function det(seed: string): number {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0) / 4294967296;
}

interface Anchor {
	x: number;
	y: number;
	r: number;
}

/**
 * Compute a hierarchical angular anchor for every node: subcategories fan
 * across their category's wedge (weighted by protocol count) and protocols
 * across their subcategory's slice. This is the skeleton that keeps each
 * category blooming into a fan of distinct branches instead of collapsing
 * into one spoke. Mirrors the radial layout's angular maths.
 */
function hierarchicalAnchors(
	nodes: GraphNode[],
	R: { cat: number; sub: number; proto: number }
): Map<string, Anchor> {
	const anchors = new Map<string, Anchor>();
	const hub = nodes.find((n) => n.type === 'hub');
	const catNodes = nodes.filter((n) => n.type === 'category');
	const subNodes = nodes.filter((n) => n.type === 'subcategory');
	const protoNodes = nodes.filter((n) => n.type === 'protocol');

	if (hub) anchors.set(hub.id, { x: 0, y: 0, r: 0 });

	const CAT_FILL = 0.84;
	const SUB_FILL = 0.9;
	const MIN_SUB_WEIGHT = 0.6;
	const place = (id: string, angle: number, r: number) =>
		anchors.set(id, { x: Math.cos(angle) * r, y: Math.sin(angle) * r, r });

	catNodes.forEach((cat, i) => {
		const catAngle = (i / catNodes.length) * Math.PI * 2 - Math.PI / 2;
		place(cat.id, catAngle, R.cat);

		const cSubs = subNodes.filter((s) => s.categoryId === cat.id);
		const catSpan = ((2 * Math.PI) / catNodes.length) * CAT_FILL;
		const weights = cSubs.map((sub) =>
			Math.max(protoNodes.filter((p) => p.subcategoryId === sub.id).length, MIN_SUB_WEIGHT)
		);
		const total = weights.reduce((a, b) => a + b, 0) || 1;

		let offset = 0;
		cSubs.forEach((sub, j) => {
			const subWidth = catSpan * (weights[j] / total);
			const subAngle = catAngle - catSpan / 2 + offset + subWidth / 2;
			offset += subWidth;
			place(sub.id, subAngle, R.sub);

			const sProtos = protoNodes.filter((p) => p.subcategoryId === sub.id);
			const subSpan = subWidth * SUB_FILL;
			sProtos.forEach((proto, k) =>
				place(proto.id, subAngle - subSpan / 2 + ((k + 0.5) / sProtos.length) * subSpan, R.proto)
			);
		});

		const orphans = protoNodes.filter((p) => p.categoryId === cat.id && !p.subcategoryId);
		orphans.forEach((proto, j) =>
			place(proto.id, catAngle - catSpan / 2 + ((j + 0.5) / orphans.length) * catSpan, R.proto)
		);
	});

	return anchors;
}

/**
 * The graph's force layout. Each node is anchored to its hierarchical slice
 * (see {@link hierarchicalAnchors}) and seeded near that anchor, then relaxed
 * with local charge, tree links, and collision — organic spacing, but compact
 * and with every branch clearly fanned out. Tuned so the settled graph stays
 * about as dense as a tidy radial layout (max node radius ~510px).
 */
export function createSimulation(
	nodes: GraphNode[],
	edges: GraphEdge[]
): Simulation<SimNode, SimLink> {
	const anchors = hierarchicalAnchors(nodes, { cat: 185, sub: 320, proto: 450 });
	const SEED_JITTER = 28;

	const simNodes: SimNode[] = nodes.map((n) => {
		const a = anchors.get(n.id) ?? { x: 0, y: 0, r: 0 };
		const pinned = n.type === 'hub';
		return {
			id: n.id,
			type: n.type,
			radius: n.radius,
			categoryId: n.categoryId,
			subcategoryId: n.subcategoryId,
			ax: a.x,
			ay: a.y,
			ar: a.r,
			// Seed near the hierarchical anchor (not all at 0,0) so the warm-up
			// unfolds from a sensible fan rather than a degenerate point.
			x: pinned ? 0 : a.x + (det(n.id + 'x') - 0.5) * 2 * SEED_JITTER,
			y: pinned ? 0 : a.y + (det(n.id + 'y') - 0.5) * 2 * SEED_JITTER,
			vx: 0,
			vy: 0,
			fx: pinned ? 0 : (n.fx ?? undefined),
			fy: pinned ? 0 : (n.fy ?? undefined)
		};
	});

	const simLinks: SimLink[] = edges.map((e) => ({
		source: e.source,
		target: e.target,
		color: e.color
	}));

	const born = (d: SimNode) => d.isBorn !== false;

	const simulation = forceSimulation<SimNode>(simNodes)
		.force(
			'charge',
			forceManyBody<SimNode>()
				.strength((d) => {
					if (!born(d)) return 0;
					if (d.type === 'category') return -520;
					if (d.type === 'subcategory') return -320;
					return -185; // hub (pinned) + protocols
				})
				// Local repulsion only — keeps the graph from ballooning outward.
				.distanceMax(460)
		)
		.force(
			'link',
			forceLink<SimNode, SimLink>(simLinks)
				.id((d) => d.id)
				.distance((d) => {
					const s = (d.source as SimNode).type;
					const t = (d.target as SimNode).type;
					if (s === 'hub' || t === 'hub') return 180;
					if (s === 'category' || t === 'category') return 130;
					return 88;
				})
				.strength((d) => {
					const s = d.source as SimNode;
					const t = d.target as SimNode;
					if (!born(s) || !born(t)) return 0;
					if (s.type === 'hub' || t.type === 'hub') return 0.2;
					if (s.type === 'category' || t.type === 'category') return 0.4;
					return 0.55;
				})
		)
		// Pull each node toward its hierarchical anchor — light enough to stay
		// organic, firm enough that branches keep their own angular slice.
		.force(
			'anchor-x',
			forceX<SimNode>((d) => d.ax).strength((d) =>
				!born(d) ? 0 : d.type === 'subcategory' ? 0.1 : 0.08
			)
		)
		.force(
			'anchor-y',
			forceY<SimNode>((d) => d.ay).strength((d) =>
				!born(d) ? 0 : d.type === 'subcategory' ? 0.1 : 0.08
			)
		)
		.force(
			'radial',
			forceRadial<SimNode>((d) => d.ar, 0, 0).strength((d) =>
				!born(d) ? 0 : d.type === 'category' ? 0.06 : d.type === 'subcategory' ? 0.05 : 0.04
			)
		)
		.force(
			'collide',
			forceCollide<SimNode>()
				.radius((d) => (born(d) ? d.radius + 15 : 0))
				.strength(0.9)
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
	// Match by id, not array index. d3-force keeps its node array in creation
	// order so index alignment usually holds, but it breaks silently the moment
	// a caller passes a reordered or resized `nodes` array — desyncing every
	// position. Keying on id is robust and barely more expensive.
	const byId = new Map<string, SimNode>();
	for (const sn of simulation.nodes()) byId.set(sn.id, sn);

	for (const gn of nodes) {
		const sn = byId.get(gn.id);
		if (!sn) continue;
		gn.x = sn.x ?? 0;
		gn.y = sn.y ?? 0;
		gn.vx = sn.vx ?? 0;
		gn.vy = sn.vy ?? 0;
	}
}
