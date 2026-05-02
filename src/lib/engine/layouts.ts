import {
	forceSimulation,
	forceLink,
	forceManyBody,
	forceCenter,
	forceCollide,
	forceX,
	forceY,
	type SimulationNodeDatum,
	type SimulationLinkDatum
} from 'd3-force';
import type { GraphNode } from '$lib/data/types';
import { allProtocols, categories } from '$lib/data/index';

export type LayoutMode = 'force' | 'radial' | 'timeline' | 'mesh';

// ─── Radial ────────────────────────────────────────────────────────────────
export function computeRadialPositions(
	nodes: GraphNode[]
): Map<string, { x: number; y: number }> {
	const pos = new Map<string, { x: number; y: number }>();

	const hub = nodes.find((n) => n.type === 'hub');
	const catNodes = nodes.filter((n) => n.type === 'category');
	const protoNodes = nodes.filter((n) => n.type === 'protocol');

	if (hub) pos.set(hub.id, { x: 0, y: 0 });

	const CAT_RADIUS = 220;
	const PROTO_RADIUS = 400;
	const SECTOR_FILL = 0.82;

	catNodes.forEach((cat, i) => {
		const catAngle = (i / catNodes.length) * Math.PI * 2 - Math.PI / 2;
		pos.set(cat.id, {
			x: Math.cos(catAngle) * CAT_RADIUS,
			y: Math.sin(catAngle) * CAT_RADIUS
		});

		const protos = protoNodes.filter((p) => p.categoryId === cat.id);
		const sectorSpan = ((2 * Math.PI) / catNodes.length) * SECTOR_FILL;

		protos.forEach((proto, j) => {
			const t = protos.length === 1 ? 0.5 : j / (protos.length - 1);
			const protoAngle = catAngle - sectorSpan / 2 + t * sectorSpan;
			pos.set(proto.id, {
				x: Math.cos(protoAngle) * PROTO_RADIUS,
				y: Math.sin(protoAngle) * PROTO_RADIUS
			});
		});
	});

	return pos;
}

// ─── Timeline constants (exported for canvas underlay) ─────────────────────
export const TIMELINE_PARAMS = {
	MIN_YEAR: 1969,
	MAX_YEAR: 2026,
	X_LEFT: -700,
	X_RIGHT: 700,
	LANE_SPACING: 170
} as const;

// ─── Timeline ──────────────────────────────────────────────────────────────
export function computeTimelinePositions(
	nodes: GraphNode[]
): Map<string, { x: number; y: number }> {
	const pos = new Map<string, { x: number; y: number }>();

	const { MIN_YEAR, MAX_YEAR, X_LEFT, X_RIGHT, LANE_SPACING } = TIMELINE_PARAMS;
	const MIN_NODE_GAP = 46;
	const VERT_SPREAD = 44;

	const yearToX = (year: number) =>
		X_LEFT + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (X_RIGHT - X_LEFT);

	const hub = nodes.find((n) => n.type === 'hub');
	if (hub) pos.set(hub.id, { x: X_LEFT - 240, y: 0 });

	const catOrder = categories.map((c) => c.id);
	const catNodes = nodes.filter((n) => n.type === 'category');
	catNodes.forEach((cat) => {
		const i = catOrder.indexOf(cat.id);
		const laneY = (i - Math.floor(catOrder.length / 2)) * LANE_SPACING;
		pos.set(cat.id, { x: X_LEFT - 120, y: laneY });
	});

	const protoNodes = nodes.filter((n) => n.type === 'protocol');

	for (const catId of catOrder) {
		const catIdx = catOrder.indexOf(catId);
		const laneY = (catIdx - Math.floor(catOrder.length / 2)) * LANE_SPACING;
		const laneProtos = protoNodes.filter((n) => n.categoryId === catId);

		const yearGroups = new Map<number, GraphNode[]>();
		for (const node of laneProtos) {
			const proto = allProtocols.find((p) => p.id === node.id);
			if (!proto) continue;
			if (!yearGroups.has(proto.year)) yearGroups.set(proto.year, []);
			yearGroups.get(proto.year)!.push(node);
		}

		const sortedGroups = [...yearGroups.entries()].sort(([a], [b]) => a - b);
		const groupXs = sortedGroups.map(([year]) => yearToX(year));

		for (let i = 1; i < groupXs.length; i++) {
			if (groupXs[i] - groupXs[i - 1] < MIN_NODE_GAP) {
				groupXs[i] = groupXs[i - 1] + MIN_NODE_GAP;
			}
		}

		sortedGroups.forEach(([, groupNodes], gi) => {
			const gx = groupXs[gi];
			groupNodes.forEach((node, i) => {
				const offset = (i - (groupNodes.length - 1) / 2) * VERT_SPREAD;
				pos.set(node.id, { x: gx, y: laneY + offset });
			});
		});
	}

	return pos;
}

// ─── Mesh (protocol relationships) ─────────────────────────────────────────
//
// Drops the hub/category scaffolding and lays out only the protocols, with
// edges drawn directly from each protocol's `connections` field. We run a
// one-shot force sim with custom tunings, then return the settled positions
// so the existing layout-transition lerp can animate to them.

interface MeshNode extends SimulationNodeDatum {
	id: string;
	categoryId: string;
}
interface MeshLink extends SimulationLinkDatum<MeshNode> {}

export function computeMeshPositions(
	nodes: GraphNode[]
): Map<string, { x: number; y: number }> {
	const pos = new Map<string, { x: number; y: number }>();
	const protoNodes = nodes.filter((n) => n.type === 'protocol');

	// Build undirected, deduplicated edges from `connections`
	const protoIds = new Set(protoNodes.map((n) => n.id));
	const edgePairs = new Set<string>();
	const links: MeshLink[] = [];
	for (const proto of allProtocols) {
		if (!protoIds.has(proto.id)) continue;
		for (const otherId of proto.connections) {
			if (!protoIds.has(otherId)) continue;
			if (proto.id === otherId) continue;
			const pair = proto.id < otherId ? `${proto.id}|${otherId}` : `${otherId}|${proto.id}`;
			if (edgePairs.has(pair)) continue;
			edgePairs.add(pair);
			links.push({ source: proto.id, target: otherId });
		}
	}

	// Seed sim nodes from current positions so the layout feels continuous
	// when entering mesh mode from another layout.
	const meshNodes: MeshNode[] = protoNodes.map((n) => ({
		id: n.id,
		categoryId: n.categoryId ?? '',
		x: n.x,
		y: n.y,
		vx: 0,
		vy: 0
	}));

	// Gentle category clustering: pull each protocol toward a soft anchor for
	// its category so the mesh inherits some of the topical grouping without
	// becoming a strict hub-and-spoke. Anchors are placed evenly around the
	// origin at ~radius 320.
	const ANCHOR_RADIUS = 320;
	const catAnchors = new Map<string, { x: number; y: number }>();
	categories.forEach((cat, i) => {
		const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
		catAnchors.set(cat.id, {
			x: Math.cos(angle) * ANCHOR_RADIUS,
			y: Math.sin(angle) * ANCHOR_RADIUS
		});
	});

	const sim = forceSimulation<MeshNode>(meshNodes)
		.force('center', forceCenter(0, 0).strength(0.04))
		.force(
			'charge',
			forceManyBody<MeshNode>().strength(-260).distanceMax(640)
		)
		.force(
			'link',
			forceLink<MeshNode, MeshLink>(links)
				.id((d) => d.id)
				.distance(95)
				.strength(0.55)
		)
		.force(
			'cluster-x',
			forceX<MeshNode>((d) => catAnchors.get(d.categoryId)?.x ?? 0).strength(0.06)
		)
		.force(
			'cluster-y',
			forceY<MeshNode>((d) => catAnchors.get(d.categoryId)?.y ?? 0).strength(0.06)
		)
		.force(
			'collide',
			forceCollide<MeshNode>().radius(28).strength(0.85)
		)
		.alpha(1)
		.alphaDecay(0.03)
		.stop();

	// Run to convergence
	for (let i = 0; i < 400; i++) sim.tick();

	for (const mn of meshNodes) {
		pos.set(mn.id, { x: mn.x ?? 0, y: mn.y ?? 0 });
	}

	// Hide hub & categories during mesh mode by parking them at origin —
	// the renderer will skip drawing them, and lerping back to other modes
	// remains smooth.
	for (const n of nodes) {
		if (n.type === 'hub' || n.type === 'category') {
			pos.set(n.id, { x: 0, y: 0 });
		}
	}

	return pos;
}
