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
	compareTargetId?: string | null;
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

function updateConnectedIds(selectedNode: GraphNode | null, compareTargetId?: string | null): void {
	connectedIds.clear();
	if (selectedNode?.type === 'protocol') {
		if (compareTargetId) {
			// Comparison mode: only the compare target is "connected"
			connectedIds.add(compareTargetId);
		} else {
			const proto = getProtocolById(selectedNode.id);
			if (proto) {
				for (const id of proto.connections) connectedIds.add(id);
			}
		}
	}
}

function isNodeDimmed(node: GraphNode, selectedNode: GraphNode | null, compareTargetId?: string | null): boolean {
	// Comparison mode: only the two compared nodes stay bright
	if (compareTargetId && selectedNode) {
		return node.id !== selectedNode.id && node.id !== compareTargetId;
	}
	if (selectedNode && selectedNode.id !== node.id) {
		if (selectedNode.type === 'category') {
			return (node.type === 'protocol' && node.categoryId !== selectedNode.id) || node.type === 'hub';
		}
		if (selectedNode.type === 'protocol') {
			// Don't dim connected/related nodes
			if (connectedIds.has(node.id)) return false;
			return (
				node.id !== selectedNode.categoryId && node.id !== selectedNode.id
			);
		}
	}
	return false;
}

export function render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
	const { width, height, viewport, nodes, edges, hoveredNode, selectedNode, compareTargetId, time, dpr, layoutMode } =
		options;

	buildNodeMap(nodes);
	updateConnectedIds(selectedNode, compareTargetId);

	ctx.save();
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// Clear
	ctx.fillStyle = COLORS.bg;
	ctx.fillRect(0, 0, width, height);

	// Subtle ambient glow + vignette
	drawAmbient(ctx, width, height, time);

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
		drawRelatedEdges(ctx, selectedNode, time, compareTargetId);
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
		const targetDim = isNodeDimmed(node, selectedNode, compareTargetId) ? 1 : 0;
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
	time: number,
	compareTargetId?: string | null
): void {
	// Use the live position from NODE_MAP so the edges animate during layout transitions
	const liveNode = NODE_MAP.get(selectedNode.id) ?? selectedNode;

	// In comparison mode, only show edge to comparison target
	// In normal mode, show all connected protocol edges
	const connectionIds = compareTargetId
		? [compareTargetId]
		: (getProtocolById(selectedNode.id)?.connections ?? []);

	if (connectionIds.length === 0) return;

	ctx.save();
	ctx.setLineDash([6, 4]);

	for (const connId of connectionIds) {
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
		ctx.strokeStyle = hexToRgba(selectedNode.color, compareTargetId ? 0.4 : 0.25);
		ctx.lineWidth = compareTargetId ? 1.5 : 1.0;
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


// Seeded star field — generated once, reused every frame
let starCache: { x: number; y: number; r: number; a: number }[] | null = null;
let starCacheKey = '';

function ensureStars(width: number, height: number): typeof starCache {
	const key = `${width}x${height}`;
	if (starCache && starCacheKey === key) return starCache;

	// Simple seeded PRNG for deterministic placement
	let seed = 42;
	const rand = () => {
		seed = (seed * 16807 + 0) % 2147483647;
		return (seed - 1) / 2147483646;
	};

	const count = Math.floor((width * height) / 3500);
	starCache = [];
	for (let i = 0; i < count; i++) {
		starCache.push({
			x: rand() * width,
			y: rand() * height,
			r: 0.3 + rand() * 0.7,
			a: 0.1 + rand() * 0.25
		});
	}
	starCacheKey = key;
	return starCache;
}

// Shooting star system — rare streaks across the sky
interface ShootingStar {
	x: number;
	y: number;
	vx: number;
	vy: number;
	born: number;
	duration: number;
	length: number;
	opacity: number;
}

const shootingStars: ShootingStar[] = [];
let nextShootingStarTime = 0;

function spawnShootingStar(width: number, height: number, time: number): void {
	const startX = width * 0.2 + Math.random() * width * 0.6;
	const startY = Math.random() * height * 0.35;
	const angle = Math.PI * (0.55 + Math.random() * 0.35);
	const speed = 4 + Math.random() * 3;

	shootingStars.push({
		x: startX,
		y: startY,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		born: time,
		duration: 800 + Math.random() * 600,
		length: 50 + Math.random() * 40,
		opacity: 0.35 + Math.random() * 0.25
	});
}

function drawShootingStars(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	time: number
): void {
	// Spawn rarely — every 8–18 seconds
	if (time > nextShootingStarTime && shootingStars.length < 2) {
		spawnShootingStar(width, height, time);
		nextShootingStarTime = time + 8000 + Math.random() * 10000;
	}

	for (let i = shootingStars.length - 1; i >= 0; i--) {
		const s = shootingStars[i];
		const elapsed = time - s.born;
		const t = elapsed / s.duration;

		if (t >= 1) {
			shootingStars.splice(i, 1);
			continue;
		}

		// Move
		s.x += s.vx;
		s.y += s.vy;

		// Fade in quickly, fade out slowly
		const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
		const alpha = s.opacity * fade;

		// Tail direction (opposite of velocity)
		const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
		const tx = -s.vx / mag;
		const ty = -s.vy / mag;

		// Draw streak with gradient tail
		const tailX = s.x + tx * s.length;
		const tailY = s.y + ty * s.length;

		const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
		grad.addColorStop(0, `rgba(220, 230, 255, ${alpha})`);
		grad.addColorStop(0.3, `rgba(180, 200, 240, ${alpha * 0.4})`);
		grad.addColorStop(1, 'rgba(180, 200, 240, 0)');

		ctx.beginPath();
		ctx.moveTo(s.x, s.y);
		ctx.lineTo(tailX, tailY);
		ctx.strokeStyle = grad;
		ctx.lineWidth = 1.2;
		ctx.lineCap = 'round';
		ctx.globalAlpha = 1;
		ctx.stroke();

		// Bright head dot
		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#e8eeff';
		ctx.beginPath();
		ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
		ctx.fill();
	}
}

function drawAmbient(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	time: number
): void {
	const cx = width / 2;
	const cy = height / 2;

	// Scattered star dots — subtle static texture
	const stars = ensureStars(width, height)!;
	for (const s of stars) {
		// Gentle twinkle per star
		const twinkle = s.a * (0.7 + 0.3 * Math.sin(time * 0.001 + s.x * 0.1 + s.y * 0.1));
		ctx.globalAlpha = twinkle;
		ctx.fillStyle = '#94a3b8';
		ctx.beginPath();
		ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
		ctx.fill();
	}

	// Rare shooting stars
	drawShootingStars(ctx, width, height, time);

	ctx.globalAlpha = 1;
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
		r += Math.sin(time * 0.003) * 0.5;
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
		const glowRadius = r * (type === 'hub' ? 2.2 : 2.2) * glowScale;
		const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
		const baseGlowAlpha =
			isSelected ? 0.35 : isConnected ? 0.2 : type === 'hub' ? 0.08 : 0.1;
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

	// Hub icon inside hub node
	if (type === 'hub') {
		const iconSize = r * 1.1;
		drawHubIcon(ctx, x, y, iconSize, dimT);
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
							? 'PROTOCOLS'
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

// Exact Lucide SVG paths rendered via Path2D for pixel-perfect icons
function drawTransportIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M8 3 4 7l4 4'));
	ctx.stroke(new Path2D('M4 7h16'));
	ctx.stroke(new Path2D('M16 21l4-4-4-4'));
	ctx.stroke(new Path2D('M20 17H4'));
}

function drawWebApiIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M20.341 6.484A10 10 0 0 1 10.266 21.85'));
	ctx.stroke(new Path2D('M3.659 17.516A10 10 0 0 1 13.74 2.152'));
	const center = new Path2D();
	center.arc(12, 12, 3, 0, Math.PI * 2);
	ctx.stroke(center);
	const sat1 = new Path2D();
	sat1.arc(19, 5, 2, 0, Math.PI * 2);
	ctx.stroke(sat1);
	const sat2 = new Path2D();
	sat2.arc(5, 19, 2, 0, Math.PI * 2);
	ctx.stroke(sat2);
}

function drawAsyncIotIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M16.247 7.761a6 6 0 0 1 0 8.478'));
	ctx.stroke(new Path2D('M19.075 4.933a10 10 0 0 1 0 14.134'));
	ctx.stroke(new Path2D('M4.925 19.067a10 10 0 0 1 0-14.134'));
	ctx.stroke(new Path2D('M7.753 16.239a6 6 0 0 1 0-8.478'));
	const dot = new Path2D();
	dot.arc(12, 12, 2, 0, Math.PI * 2);
	ctx.stroke(dot);
}

function drawRealtimeAvIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z'));
}

function drawUtilitiesIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'));
	ctx.stroke(new Path2D('M9 12l2 2 4-4'));
}

function drawHubIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	dimT: number
): void {
	ctx.save();
	ctx.translate(x, y);
	const s = size / 24;
	ctx.scale(s, s);
	ctx.translate(-12, -12);

	const alpha = 1 - 0.85 * dimT;
	ctx.globalAlpha = alpha;
	ctx.lineCap = 'round';

	// Network constellation — matches app header icon
	// Positions mapped from 20x20 viewBox to 24x24 coordinate space (×1.2)
	const top = { x: 12, y: 3.6 };
	const bl = { x: 4.8, y: 16.2 };
	const br = { x: 19.2, y: 16.2 };
	const center = { x: 12, y: 12 };

	// Drop shadow behind all icon elements for contrast on white node
	ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
	ctx.shadowBlur = 3;

	// Connecting lines from center to outer nodes
	ctx.lineWidth = 1.4;
	ctx.strokeStyle = `rgba(110, 231, 183, ${0.6 * alpha})`;
	ctx.beginPath();
	ctx.moveTo(center.x, 10.2);
	ctx.lineTo(top.x, 6);
	ctx.stroke();
	ctx.strokeStyle = `rgba(196, 181, 253, ${0.6 * alpha})`;
	ctx.beginPath();
	ctx.moveTo(10.6, 13);
	ctx.lineTo(6.7, 14.8);
	ctx.stroke();
	ctx.strokeStyle = `rgba(125, 211, 252, ${0.6 * alpha})`;
	ctx.beginPath();
	ctx.moveTo(13.4, 13);
	ctx.lineTo(17.3, 14.8);
	ctx.stroke();

	// Outer nodes
	ctx.globalAlpha = alpha;
	const n1 = new Path2D();
	n1.arc(top.x, top.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = '#6ee7b7';
	ctx.fill(n1);
	const n2 = new Path2D();
	n2.arc(bl.x, bl.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = '#c4b5fd';
	ctx.fill(n2);
	const n3 = new Path2D();
	n3.arc(br.x, br.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = '#7dd3fc';
	ctx.fill(n3);

	// Center hub
	const ch = new Path2D();
	ch.arc(center.x, center.y, 1.8, 0, Math.PI * 2);
	ctx.fillStyle = '#e2e8f0';
	ctx.fill(ch);

	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;

	ctx.restore();
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
