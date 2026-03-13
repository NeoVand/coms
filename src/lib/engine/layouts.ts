import type { GraphNode } from '$lib/data/types';
import { allProtocols, categories } from '$lib/data/index';

export type LayoutMode = 'force' | 'radial' | 'timeline';

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
	MAX_YEAR: 2025,
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

