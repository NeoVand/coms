import type { GraphNode, GraphEdge, Viewport } from '$lib/data/types';
import { COLORS } from '$lib/utils/colors';
import { hexToRgba } from '$lib/utils/colors';
import { getProtocolById } from '$lib/data/index';
import { categoryMap, categories } from '$lib/data/categories';
import { TIMELINE_PARAMS, type LayoutMode } from '$lib/engine/layouts';

interface RenderOptions {
	width: number;
	height: number;
	viewport: Viewport;
	nodes: GraphNode[];
	edges: GraphEdge[];
	hoveredNode: GraphNode | null;
	selectedNode: GraphNode | null;
	time: number;
	dpr: number;
	layoutMode?: LayoutMode;
}

const NODE_MAP = new Map<string, GraphNode>();

// Smooth hover animation state per node (0 = idle, 1 = fully hovered)
const hoverAnim = new Map<string, number>();
const HOVER_EASE_IN = 0.14; // snappy grow-out
const HOVER_EASE_OUT = 0.08; // gentler fade-back

// Smooth dim animation state per node (0 = visible, 1 = fully dimmed)
const dimAnim = new Map<string, number>();
const DIM_EASE_IN = 0.1; // fade to dimmed
const DIM_EASE_OUT = 0.065; // fade back to visible (slower for cinematic reveal)

function buildNodeMap(nodes: GraphNode[]) {
	NODE_MAP.clear();
	for (const n of nodes) NODE_MAP.set(n.id, n);
}

// Cache connected node IDs for the currently selected protocol
const connectedIds: Set<string> = new Set();

function updateConnectedIds(selectedNode: GraphNode | null): void {
	connectedIds.clear();
	if (selectedNode?.type === 'protocol') {
		const proto = getProtocolById(selectedNode.id);
		if (proto) {
			for (const id of proto.connections) connectedIds.add(id);
		}
	}
}

function isNodeDimmed(node: GraphNode, selectedNode: GraphNode | null): boolean {
	if (selectedNode && selectedNode.id !== node.id) {
		if (selectedNode.type === 'category') {
			if (node.type === 'hub') return false;
			return node.type === 'protocol' && node.categoryId !== selectedNode.id;
		}
		if (selectedNode.type === 'protocol') {
			// Don't dim connected/related nodes
			if (connectedIds.has(node.id)) return false;
			return (
				node.id !== selectedNode.categoryId && node.type !== 'hub' && node.id !== selectedNode.id
			);
		}
	}
	return false;
}

export function render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
	const { width, height, viewport, nodes, edges, hoveredNode, selectedNode, time, dpr, layoutMode } =
		options;

	buildNodeMap(nodes);
	updateConnectedIds(selectedNode);

	ctx.save();
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// Clear
	ctx.fillStyle = COLORS.bg;
	ctx.fillRect(0, 0, width, height);

	// Draw subtle grid
	drawGrid(ctx, width, height, viewport, time);

	// Transform to world space
	ctx.save();
	ctx.translate(width / 2 + viewport.x, height / 2 + viewport.y);
	ctx.scale(viewport.scale, viewport.scale);

	// Underlays drawn before edges/nodes
	if (layoutMode === 'timeline') {
		drawTimelineUnderlay(ctx);
	}

	// Draw edges
	for (const edge of edges) {
		const source = NODE_MAP.get(
			typeof edge.source === 'string' ? edge.source : (edge.source as GraphNode).id
		);
		const target = NODE_MAP.get(
			typeof edge.target === 'string' ? edge.target : (edge.target as GraphNode).id
		);
		if (!source || !target) continue;

		const dimSource = dimAnim.get(source.id) ?? 0;
		const dimTarget = dimAnim.get(target.id) ?? 0;
		const edgeDimT = Math.max(dimSource, dimTarget);

		drawEdge(ctx, source, target, edge.color, edgeDimT, time);
	}

	// Draw related protocol edges (dashed)
	if (selectedNode && selectedNode.type === 'protocol') {
		drawRelatedEdges(ctx, selectedNode, time);
	}

	// Update hover animations (smooth interpolation each frame)
	for (const node of nodes) {
		const target = hoveredNode?.id === node.id ? 1 : 0;
		const current = hoverAnim.get(node.id) ?? 0;
		const speed = target > current ? HOVER_EASE_IN : HOVER_EASE_OUT;
		const next = current + (target - current) * speed;
		if (Math.abs(next - target) < 0.005) {
			if (target === 0) hoverAnim.delete(node.id);
			else hoverAnim.set(node.id, 1);
		} else {
			hoverAnim.set(node.id, next);
		}
	}

	// Update dim animations (smooth fade in/out)
	for (const node of nodes) {
		const targetDim = isNodeDimmed(node, selectedNode) ? 1 : 0;
		const current = dimAnim.get(node.id) ?? 0;
		const speed = targetDim > current ? DIM_EASE_IN : DIM_EASE_OUT;
		const next = current + (targetDim - current) * speed;
		if (Math.abs(next - targetDim) < 0.005) {
			if (targetDim === 0) dimAnim.delete(node.id);
			else dimAnim.set(node.id, 1);
		} else {
			dimAnim.set(node.id, next);
		}
	}

	// Draw nodes (hub last so it's on top)
	const sortedNodes = [...nodes].sort((a, b) => {
		const order = { protocol: 0, category: 1, hub: 2 };
		return order[a.type] - order[b.type];
	});

	for (const node of sortedNodes) {
		const hoverT = hoverAnim.get(node.id) ?? 0;
		const isSelected = selectedNode?.id === node.id;
		const dimT = dimAnim.get(node.id) ?? 0;
		const isConnected = connectedIds.has(node.id);
		drawNode(ctx, node, hoverT, isSelected, dimT, isConnected, time, viewport.scale);
	}

	ctx.restore();

	ctx.restore();
}

function drawRelatedEdges(
	ctx: CanvasRenderingContext2D,
	selectedNode: GraphNode,
	time: number
): void {
	const proto = getProtocolById(selectedNode.id);
	if (!proto || !proto.connections.length) return;

	// Use the live position from NODE_MAP so the edges animate during layout transitions
	const liveNode = NODE_MAP.get(selectedNode.id) ?? selectedNode;

	ctx.save();
	ctx.setLineDash([6, 4]);

	for (const connId of proto.connections) {
		const targetNode = NODE_MAP.get(connId);
		if (!targetNode) continue;

		const dx = targetNode.x - liveNode.x;
		const dy = targetNode.y - liveNode.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const midX = (liveNode.x + targetNode.x) / 2;
		const midY = (liveNode.y + targetNode.y) / 2;
		const offset = dist * 0.15;
		const cpx = midX - dy * 0.15 + Math.sin(time * 0.001) * offset * 0.2;
		const cpy = midY + dx * 0.15 + Math.cos(time * 0.001) * offset * 0.2;

		ctx.beginPath();
		ctx.moveTo(liveNode.x, liveNode.y);
		ctx.quadraticCurveTo(cpx, cpy, targetNode.x, targetNode.y);
		ctx.strokeStyle = hexToRgba(selectedNode.color, 0.25);
		ctx.lineWidth = 1.0;
		ctx.stroke();
	}

	ctx.setLineDash([]);
	ctx.restore();
}

function drawTimelineUnderlay(ctx: CanvasRenderingContext2D): void {
	const { MIN_YEAR, MAX_YEAR, X_LEFT, X_RIGHT, LANE_SPACING } = TIMELINE_PARAMS;
	const catOrder = categories.map((c) => c.id);
	const numCats = catOrder.length;
	const laneYs = catOrder.map((_, i) => (i - Math.floor(numCats / 2)) * LANE_SPACING);
	const topY = laneYs[0] - LANE_SPACING / 2;
	const bottomY = laneYs[numCats - 1] + LANE_SPACING / 2;
	const totalWidth = X_RIGHT - X_LEFT;

	const yearToX = (year: number) =>
		X_LEFT + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * totalWidth;

	// 1. Lane bands: subtle colored horizontal stripes per category
	catOrder.forEach((catId, i) => {
		const cat = categoryMap.get(catId);
		if (!cat) return;
		const laneY = laneYs[i];
		ctx.fillStyle = hexToRgba(cat.color, 0.035);
		ctx.fillRect(X_LEFT - 180, laneY - LANE_SPACING / 2, totalWidth + 230, LANE_SPACING);
	});

	// 2. Vertical year lines
	ctx.save();
	const startYear = Math.ceil(MIN_YEAR / 5) * 5;
	for (let year = startYear; year <= MAX_YEAR; year += 5) {
		const x = yearToX(year);
		const isDecade = year % 10 === 0;

		ctx.strokeStyle = `rgba(148, 163, 184, ${isDecade ? 0.14 : 0.055})`;
		ctx.lineWidth = isDecade ? 0.8 : 0.5;
		ctx.setLineDash(isDecade ? [] : [3, 5]);
		ctx.beginPath();
		ctx.moveTo(x, topY);
		ctx.lineTo(x, bottomY);
		ctx.stroke();

		if (isDecade) {
			ctx.setLineDash([]);
			ctx.font = '500 10px Inter, system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
			ctx.fillText(String(year), x, bottomY + 10);
		}
	}
	ctx.setLineDash([]);
	ctx.restore();
}


function drawGrid(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	viewport: Viewport,
	time: number
): void {
	const gridSize = 80 * viewport.scale;
	const offsetX = (viewport.x + width / 2) % gridSize;
	const offsetY = (viewport.y + height / 2) % gridSize;

	ctx.strokeStyle = `rgba(148, 163, 184, ${0.03 + 0.005 * Math.sin(time * 0.001)})`;
	ctx.lineWidth = 0.5;

	for (let x = offsetX; x < width; x += gridSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}
	for (let y = offsetY; y < height; y += gridSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

function drawEdge(
	ctx: CanvasRenderingContext2D,
	source: GraphNode,
	target: GraphNode,
	color: string,
	dimT: number,
	time: number
): void {
	const baseAlpha = 0.2 + 0.05 * Math.sin(time * 0.002);
	const alpha = baseAlpha + (0.05 - baseAlpha) * dimT;

	ctx.beginPath();

	// Bezier curve for organic feel
	const midX = (source.x + target.x) / 2;
	const midY = (source.y + target.y) / 2;
	const dx = target.x - source.x;
	const dy = target.y - source.y;
	const offset = Math.sqrt(dx * dx + dy * dy) * 0.15;
	const cpx = midX - dy * 0.1 + Math.sin(time * 0.0008 + source.x * 0.01) * offset * 0.3;
	const cpy = midY + dx * 0.1 + Math.cos(time * 0.0008 + source.y * 0.01) * offset * 0.3;

	ctx.moveTo(source.x, source.y);
	ctx.quadraticCurveTo(cpx, cpy, target.x, target.y);

	ctx.strokeStyle = hexToRgba(color.startsWith('#') ? color : '#FFFFFF', alpha);
	ctx.lineWidth = 1.8 - 1.3 * dimT;
	ctx.stroke();
}

function drawNode(
	ctx: CanvasRenderingContext2D,
	node: GraphNode,
	hoverT: number,
	isSelected: boolean,
	dimT: number,
	isConnected: boolean,
	time: number,
	scale: number
): void {
	const { x, y, radius, color, type } = node;
	const alpha = 1 - 0.9 * dimT;

	// Ease-out curve for organic "grow out" feel
	const eased = 1 - (1 - hoverT) * (1 - hoverT);

	// Animated radius — smooth hover scale
	let r = radius;
	if (type === 'hub') {
		r += Math.sin(time * 0.003) * 2;
	}
	r *= 1 + 0.15 * eased;
	if (isSelected) {
		r *= 1.1;
	}

	// Outer glow — smoothly interpolated for hover
	const glowVisibility = isConnected ? 1 : 1 - dimT;
	const hasGlow =
		glowVisibility > 0.01 &&
		(hoverT > 0.01 || isSelected || isConnected || type === 'hub' || type === 'category');
	if (hasGlow) {
		const glowScale = 1 + 0.3 * eased; // glow grows out with hover
		const glowRadius = r * (type === 'hub' ? 3 : 2.2) * glowScale;
		const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
		const baseGlowAlpha =
			isSelected ? 0.35 : isConnected ? 0.2 : type === 'hub' ? 0.15 : 0.1;
		const glowAlpha = (baseGlowAlpha + 0.25 * eased) * glowVisibility;
		glow.addColorStop(0, hexToRgba(color, glowAlpha));
		glow.addColorStop(1, hexToRgba(color, 0));
		ctx.beginPath();
		ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
		ctx.fillStyle = glow;
		ctx.fill();
	}

	// Ring for selected
	if (isSelected && dimT < 0.5) {
		ctx.beginPath();
		ctx.arc(x, y, r + 4, 0, Math.PI * 2);
		ctx.strokeStyle = hexToRgba(color, 0.6 * (1 - dimT));
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	// Opaque base to prevent edge bleed-through
	if (dimT < 0.99) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(15, 23, 42, ${1 - dimT})`;
		ctx.fill();
	}

	// Node body
	const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
	if (type === 'hub') {
		gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		gradient.addColorStop(1, `rgba(200, 210, 230, ${alpha * 0.8})`);
	} else {
		gradient.addColorStop(0, hexToRgba(color, alpha * (1 - 0.1 * dimT)));
		gradient.addColorStop(0.7, hexToRgba(color, alpha * (0.7 - 0.1 * dimT)));
		gradient.addColorStop(1, hexToRgba(color, alpha * (0.4 - 0.1 * dimT)));
	}

	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = gradient;
	ctx.fill();

	// Inner highlight
	if (dimT < 0.99) {
		const highlight = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x, y, r);
		const hlAlpha = 1 - dimT;
		highlight.addColorStop(0, `rgba(255, 255, 255, ${(type === 'hub' ? 0.4 : 0.25) * hlAlpha})`);
		highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
		highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = highlight;
		ctx.fill();
	}

	// Category icon inside category nodes only
	if (type === 'category') {
		const cat = categoryMap.get(node.id);
		if (cat) {
			const iconSize = r * 1.1;
			drawCategoryIcon(ctx, x, y, iconSize, cat.icon, dimT);
		}
	}

	// Label — show for non-dimmed nodes and connected nodes
	if (dimT < 0.95 || isConnected) {
		const fontSize = type === 'hub' ? 11 : type === 'category' ? 10 : 9;
		const showLabel = scale > 0.5 || type === 'hub' || type === 'category';
		const showAbbrev = scale <= 0.5 && scale > 0.3 && type === 'protocol';

		if (showLabel || showAbbrev || isConnected) {
			const label =
				isConnected && !showLabel
					? node.abbreviation || node.label
					: showLabel
						? type === 'hub'
							? '< / > PROTOCOLS'
							: type === 'category'
								? node.label
								: node.abbreviation || node.label
						: node.abbreviation || '';

			const labelAlpha = isConnected && dimT > 0.5 ? 0.7 : alpha;
			ctx.font = `${type === 'hub' ? '600' : '500'} ${fontSize}px Inter, system-ui, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle =
				type === 'hub' ? `rgba(255, 255, 255, ${labelAlpha})` : hexToRgba(color, labelAlpha * 0.9);

			// Text shadow
			ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
			ctx.shadowBlur = 4;
			ctx.fillText(label, x, y + r + 6);
			ctx.shadowColor = 'transparent';
			ctx.shadowBlur = 0;
		}
	}
}

// --- Category icon drawing functions (all in 24×24 coordinate space) ---

function drawTransportIcon(ctx: CanvasRenderingContext2D): void {
	// Up arrow (left side)
	ctx.beginPath();
	ctx.moveTo(7, 16);
	ctx.lineTo(7, 5);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(3, 9);
	ctx.lineTo(7, 5);
	ctx.lineTo(11, 9);
	ctx.stroke();

	// Down arrow (right side)
	ctx.beginPath();
	ctx.moveTo(17, 8);
	ctx.lineTo(17, 19);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(13, 15);
	ctx.lineTo(17, 19);
	ctx.lineTo(21, 15);
	ctx.stroke();
}

function drawWebApiIcon(ctx: CanvasRenderingContext2D): void {
	// Outer circle (globe)
	ctx.beginPath();
	ctx.arc(12, 12, 9, 0, Math.PI * 2);
	ctx.stroke();

	// Vertical ellipse (meridian)
	ctx.beginPath();
	ctx.ellipse(12, 12, 3.5, 9, 0, 0, Math.PI * 2);
	ctx.stroke();

	// Horizontal line (equator)
	ctx.beginPath();
	ctx.moveTo(3, 12);
	ctx.lineTo(21, 12);
	ctx.stroke();
}

function drawAsyncIotIcon(ctx: CanvasRenderingContext2D): void {
	// Antenna stem
	ctx.beginPath();
	ctx.moveTo(12, 19);
	ctx.lineTo(12, 11);
	ctx.stroke();

	// Arrow tip
	ctx.beginPath();
	ctx.moveTo(9, 14);
	ctx.lineTo(12, 11);
	ctx.lineTo(15, 14);
	ctx.stroke();

	// Inner signal arcs
	ctx.beginPath();
	ctx.arc(12, 12, 5, Math.PI * 0.75, Math.PI * 1.25);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(12, 12, 5, -Math.PI * 0.25, Math.PI * 0.25);
	ctx.stroke();

	// Outer signal arcs
	ctx.beginPath();
	ctx.arc(12, 12, 8, Math.PI * 0.72, Math.PI * 1.28);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(12, 12, 8, -Math.PI * 0.28, Math.PI * 0.28);
	ctx.stroke();
}

function drawRealtimeAvIcon(ctx: CanvasRenderingContext2D): void {
	// Play triangle
	ctx.beginPath();
	ctx.moveTo(7, 4);
	ctx.lineTo(19, 12);
	ctx.lineTo(7, 20);
	ctx.closePath();
	const prevFill = ctx.fillStyle;
	ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
	ctx.fill();
	ctx.fillStyle = prevFill;
	ctx.stroke();
}

function drawUtilitiesIcon(ctx: CanvasRenderingContext2D): void {
	// Lock body
	ctx.beginPath();
	ctx.rect(4, 12, 16, 9);
	ctx.stroke();

	// Shackle
	ctx.beginPath();
	ctx.moveTo(8, 12);
	ctx.lineTo(8, 8);
	ctx.arc(12, 8, 4, Math.PI, 0, false);
	ctx.lineTo(16, 12);
	ctx.stroke();

	// Keyhole
	ctx.beginPath();
	ctx.arc(12, 16.5, 1.5, 0, Math.PI * 2);
	ctx.fill();
}

function drawCategoryIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	icon: string,
	dimT: number
): void {
	ctx.save();
	ctx.translate(x, y);
	const s = size / 24;
	ctx.scale(s, s);
	ctx.translate(-12, -12);

	ctx.globalAlpha = 1 - 0.85 * dimT;
	ctx.strokeStyle = '#ffffff';
	ctx.fillStyle = '#ffffff';
	ctx.lineWidth = 1.2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	switch (icon) {
		case 'transport':
			drawTransportIcon(ctx);
			break;
		case 'web-api':
			drawWebApiIcon(ctx);
			break;
		case 'async-iot':
			drawAsyncIotIcon(ctx);
			break;
		case 'realtime-av':
			drawRealtimeAvIcon(ctx);
			break;
		case 'utilities':
			drawUtilitiesIcon(ctx);
			break;
	}

	ctx.restore();
}

export function findNodeAtPosition(
	nodes: GraphNode[],
	worldX: number,
	worldY: number,
	scale: number
): GraphNode | null {
	// Search in reverse so visually-on-top nodes (hub, categories) are found first
	for (let i = nodes.length - 1; i >= 0; i--) {
		const node = nodes[i];
		const hitRadius = (node.radius + 8) / Math.max(scale, 0.5);
		const dx = worldX - node.x;
		const dy = worldY - node.y;
		if (dx * dx + dy * dy <= hitRadius * hitRadius) {
			return node;
		}
	}
	return null;
}
