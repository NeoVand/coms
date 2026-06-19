import type { GraphNode, GraphEdge, Viewport } from '$lib/data/types';
import {
	hexToRgba,
	themedColor,
	themedDomColor,
	shiftHsl,
	type ThemeColors
} from '$lib/utils/colors';
import { getProtocolById } from '$lib/data/index';
import { categoryMap, categories } from '$lib/data/categories';
import { subcategoryMap } from '$lib/data/subcategories';
import { TIMELINE_PARAMS, type LayoutMode } from '$lib/engine/layouts';
import type { Journey } from '$lib/data/journeys';

interface RenderOptions {
	width: number;
	height: number;
	viewport: Viewport;
	nodes: GraphNode[];
	edges: GraphEdge[];
	hoveredNode: GraphNode | null;
	selectedNode: GraphNode | null;
	compareTargetId?: string | null;
	activeJourney?: Journey | null;
	activeJourneyStepIndex?: number;
	searchHighlightIds?: Set<string> | null;
	time: number;
	dpr: number;
	layoutMode?: LayoutMode;
	theme: ThemeColors;
	/** Per-node birth fraction (0..1) used during chronological bloom. Missing = 1. */
	birthScales?: Map<string, number> | null;
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

// Cache journey protocol IDs for fast lookup
const journeyProtocolIds: Set<string> = new Set();

function updateJourneyIds(journey: Journey | null | undefined): void {
	journeyProtocolIds.clear();
	if (journey) {
		for (const step of journey.steps) journeyProtocolIds.add(step.protocolId);
	}
}

function isNodeDimmed(
	node: GraphNode,
	selectedNode: GraphNode | null,
	compareTargetId?: string | null,
	activeJourney?: Journey | null,
	searchHighlightIds?: Set<string> | null,
	hoveredNode?: GraphNode | null
): boolean {
	// Hover overrides every dimming mode — when the user hovers an inline
	// protocol link in prose, the target node must light up regardless of
	// the current selection / journey / comparison context.
	if (hoveredNode && hoveredNode.id === node.id) return false;

	// Search highlight mode: only matching protocol nodes + their categories stay bright
	if (searchHighlightIds && searchHighlightIds.size > 0) {
		if (searchHighlightIds.has(node.id)) return false;
		if (node.type === 'category') {
			for (const pid of searchHighlightIds) {
				const n = NODE_MAP.get(pid);
				if (n && n.categoryId === node.id) return false;
			}
		}
		return true;
	}
	// Journey mode: only journey protocol nodes + their categories stay bright
	if (activeJourney) {
		if (journeyProtocolIds.has(node.id)) return false;
		if (node.type === 'category') {
			// Keep category bright if it contains any journey protocol
			for (const pid of journeyProtocolIds) {
				const n = NODE_MAP.get(pid);
				if (n && n.categoryId === node.id) return false;
			}
		}
		return true;
	}
	// Comparison mode: only the two compared nodes stay bright
	if (compareTargetId && selectedNode) {
		return node.id !== selectedNode.id && node.id !== compareTargetId;
	}
	if (selectedNode && selectedNode.id !== node.id) {
		if (selectedNode.type === 'category') {
			const inCat = node.categoryId === selectedNode.id;
			if (node.type === 'protocol' && !inCat) return true;
			if (node.type === 'subcategory' && !inCat) return true;
			if (node.type === 'hub') return true;
			return false;
		}
		if (selectedNode.type === 'subcategory') {
			// Keep self, parent category, and all protocols inside this subcategory bright
			if (node.id === selectedNode.id) return false;
			if (node.id === selectedNode.categoryId) return false;
			if (node.type === 'protocol' && node.subcategoryId === selectedNode.id) return false;
			return true;
		}
		if (selectedNode.type === 'protocol') {
			// Don't dim connected/related nodes
			if (connectedIds.has(node.id)) return false;
			// Keep parent category and parent subcategory bright
			if (node.id === selectedNode.categoryId) return false;
			if (selectedNode.subcategoryId && node.id === selectedNode.subcategoryId) return false;
			return node.id !== selectedNode.id;
		}
	}
	return false;
}

// Track current theme for color remapping
let currentTheme: ThemeColors;

export function render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
	const {
		width,
		height,
		viewport,
		nodes,
		edges,
		hoveredNode,
		selectedNode,
		compareTargetId,
		activeJourney,
		activeJourneyStepIndex,
		searchHighlightIds,
		time,
		dpr,
		layoutMode,
		theme,
		birthScales
	} = options;

	const getBirth = (id: string): number => birthScales?.get(id) ?? 1;

	currentTheme = theme;

	buildNodeMap(nodes);
	updateConnectedIds(selectedNode, compareTargetId);
	updateJourneyIds(activeJourney);

	ctx.save();
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// Clear
	ctx.fillStyle = theme.bg;
	ctx.fillRect(0, 0, width, height);

	// Subtle ambient glow + vignette
	drawAmbient(ctx, width, height, time, theme);

	// Transform to world space
	ctx.save();
	ctx.translate(width / 2 + viewport.x, height / 2 + viewport.y);
	ctx.scale(viewport.scale, viewport.scale);

	// Underlays drawn before edges/nodes
	if (layoutMode === 'timeline') {
		drawTimelineUnderlay(ctx, theme);
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

		const edgeBirth = Math.min(getBirth(source.id), getBirth(target.id));
		if (edgeBirth <= 0.001) continue;

		drawEdge(ctx, source, target, edge.color, edgeDimT, time, theme, edgeBirth);
	}

	// Draw related protocol edges (dashed) — redundant in mesh mode where
	// the same connections are already drawn as primary edges.
	if (selectedNode && selectedNode.type === 'protocol' && !activeJourney && layoutMode !== 'mesh') {
		drawRelatedEdges(ctx, selectedNode, time, compareTargetId);
	}

	// Draw journey path
	if (activeJourney) {
		drawJourneyPath(ctx, activeJourney, activeJourneyStepIndex ?? 0, time);
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
		const targetDim = isNodeDimmed(
			node,
			selectedNode,
			compareTargetId,
			activeJourney,
			searchHighlightIds,
			hoveredNode
		)
			? 1
			: 0;
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

	// Draw nodes (hub last so it's on top). In mesh mode the hub and
	// category scaffolding is hidden, but subcategories ride along as
	// cluster anchors so the mesh still reads as topical groups.
	const visibleNodes =
		layoutMode === 'mesh'
			? nodes.filter((n) => n.type === 'protocol' || n.type === 'subcategory')
			: nodes;
	const sortedNodes = [...visibleNodes].sort((a, b) => {
		const order = { protocol: 0, subcategory: 1, category: 2, hub: 3 };
		return order[a.type] - order[b.type];
	});

	for (const node of sortedNodes) {
		const hoverT = hoverAnim.get(node.id) ?? 0;
		const isSelected = selectedNode?.id === node.id;
		const dimT = dimAnim.get(node.id) ?? 0;
		const isConnected = connectedIds.has(node.id);
		const birthT = getBirth(node.id);
		if (birthT <= 0.001) continue;
		drawNode(
			ctx,
			node,
			hoverT,
			isSelected,
			dimT,
			isConnected,
			time,
			viewport.scale,
			theme,
			layoutMode,
			birthT
		);
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

	const tc = currentTheme;
	const nodeColor = themedColor(selectedNode.color, tc.showStars ? 'dark' : 'light');

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
		const isLight = !tc.showStars;
		ctx.strokeStyle = hexToRgba(
			nodeColor,
			compareTargetId ? (isLight ? 0.6 : 0.4) : isLight ? 0.5 : 0.25
		);
		ctx.lineWidth = compareTargetId ? 1.5 : isLight ? 1.4 : 1.0;
		ctx.stroke();
	}

	ctx.setLineDash([]);
	ctx.restore();
}

function drawJourneyPath(
	ctx: CanvasRenderingContext2D,
	journey: Journey,
	currentStepIndex: number,
	time: number
): void {
	const stepNodes: GraphNode[] = [];
	for (const step of journey.steps) {
		const node = NODE_MAP.get(step.protocolId);
		if (node) stepNodes.push(node);
	}

	if (stepNodes.length < 2) return;

	const tc = currentTheme;
	const jColor = themedColor(journey.color, tc.showStars ? 'dark' : 'light');

	ctx.save();

	// Draw connecting curves between sequential steps
	for (let i = 0; i < stepNodes.length - 1; i++) {
		const from = stepNodes[i];
		const to = stepNodes[i + 1];
		const isVisited = i < currentStepIndex;
		const isCurrent = i === currentStepIndex;

		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const midX = (from.x + to.x) / 2;
		const midY = (from.y + to.y) / 2;
		const cpx = midX - dy * 0.15;
		const cpy = midY + dx * 0.15;

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.quadraticCurveTo(cpx, cpy, to.x, to.y);

		if (isVisited || isCurrent) {
			ctx.strokeStyle = hexToRgba(jColor, 0.5);
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
		} else {
			ctx.strokeStyle = hexToRgba(jColor, 0.2);
			ctx.lineWidth = 1.5;
			ctx.setLineDash([6, 4]);
		}
		ctx.stroke();
	}

	ctx.setLineDash([]);

	// Draw numbered badges at each step node
	for (let i = 0; i < stepNodes.length; i++) {
		const node = stepNodes[i];
		const isCurrent = i === currentStepIndex;
		const isVisited = i < currentStepIndex;

		// Badge position: offset above-right of the node
		const badgeX = node.x + node.radius + 4;
		const badgeY = node.y - node.radius - 4;

		// Pulsing scale for current step
		const pulseScale = isCurrent ? 1 + 0.12 * Math.sin(time * 0.004) : 1;
		const badgeR = 7 * pulseScale;

		// Badge circle
		ctx.beginPath();
		ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
		if (isCurrent) {
			ctx.fillStyle = jColor;
		} else if (isVisited) {
			ctx.fillStyle = hexToRgba(jColor, 0.7);
		} else {
			ctx.fillStyle = hexToRgba(jColor, 0.25);
		}
		ctx.fill();

		// Step number
		ctx.font = `600 ${9 * pulseScale}px Inter, system-ui, sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle =
			isCurrent || isVisited ? (tc.showStars ? '#000000' : '#FFFFFF') : hexToRgba(jColor, 0.8);
		ctx.fillText(String(i + 1), badgeX, badgeY + 0.5);
	}

	ctx.restore();
}

// Landmark events shown at the top of the timeline
const TIMELINE_LANDMARKS: { year: number; label: string }[] = [
	{ year: 1969, label: 'ARPANET' },
	{ year: 1971, label: 'Email' },
	{ year: 1983, label: 'Internet Born' },
	{ year: 1991, label: 'World Wide Web' },
	{ year: 1998, label: 'Google Founded' },
	{ year: 2007, label: 'iPhone' },
	{ year: 2017, label: 'Cloud Era' },
	{ year: 2022, label: 'ChatGPT / AI Era' }
];

function tlColor(theme: ThemeColors, alpha: number): string {
	const [r, g, b] = theme.timelineLineBase;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawTimelineUnderlay(ctx: CanvasRenderingContext2D, theme: ThemeColors): void {
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
		const catColor = themedColor(cat.color, theme.showStars ? 'dark' : 'light');
		ctx.fillStyle = hexToRgba(catColor, theme.showStars ? 0.035 : 0.06);
		ctx.fillRect(X_LEFT - 180, laneY - LANE_SPACING / 2, totalWidth + 230, LANE_SPACING);
	});

	// 2. Vertical year lines
	ctx.save();
	const startYear = Math.ceil(MIN_YEAR / 5) * 5;
	for (let year = startYear; year <= MAX_YEAR; year += 5) {
		const x = yearToX(year);
		const isDecade = year % 10 === 0;

		ctx.strokeStyle = tlColor(theme, isDecade ? 0.14 : 0.055);
		ctx.lineWidth = isDecade ? 0.8 : 0.5;
		ctx.setLineDash(isDecade ? [] : [3, 5]);
		ctx.beginPath();
		ctx.moveTo(x, topY);
		ctx.lineTo(x, bottomY);
		ctx.stroke();

		if (isDecade) {
			ctx.setLineDash([]);
			ctx.font = '600 14px Inter, system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = tlColor(theme, 0.55);
			ctx.fillText(String(year), x, bottomY + 14);
		}
	}
	ctx.setLineDash([]);
	ctx.restore();

	// 3. Landmark events — dashed lines top-to-bottom with labels
	ctx.save();
	const dotY = topY - 2;
	for (const landmark of TIMELINE_LANDMARKS) {
		const x = yearToX(landmark.year);

		// Dashed vertical line spanning the full timeline
		ctx.strokeStyle = tlColor(theme, 0.13);
		ctx.lineWidth = 0.7;
		ctx.setLineDash([4, 5]);
		ctx.beginPath();
		ctx.moveTo(x, dotY);
		ctx.lineTo(x, bottomY);
		ctx.stroke();

		// Small dot at the top edge of the timeline
		ctx.setLineDash([]);
		ctx.fillStyle = tlColor(theme, 0.4);
		ctx.beginPath();
		ctx.arc(x, dotY, 2.5, 0, Math.PI * 2);
		ctx.fill();

		// Event name — right-aligned to left of dot
		ctx.font = '600 12px Inter, system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = tlColor(theme, 0.55);
		ctx.fillText(landmark.label, x - 7, dotY - 4);

		// Year — right-aligned above the name
		ctx.font = '400 10px Inter, system-ui, sans-serif';
		ctx.fillStyle = tlColor(theme, 0.35);
		ctx.fillText(String(landmark.year), x - 7, dotY - 18);
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
	time: number,
	theme: ThemeColors
): void {
	if (!theme.showStars) {
		// Light mode: soft gradient sky
		const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
		skyGrad.addColorStop(0, '#DBEAFE');
		skyGrad.addColorStop(0.5, '#E8EEF6');
		skyGrad.addColorStop(1, '#F1F5F9');
		ctx.fillStyle = skyGrad;
		ctx.fillRect(0, 0, width, height);
		ctx.globalAlpha = 1;
		return;
	}

	// Dark mode: scattered star dots — subtle static texture
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
	time: number,
	theme: ThemeColors,
	birthT: number = 1
): void {
	// Edge fade matches node alpha curve (catches up faster than scale)
	// so the stem reads as continuous with the bud at its tip.
	const edgeBirthAlpha = birthT >= 1 ? 1 : Math.min(1, birthT * 1.8);
	const baseAlpha = theme.edgeAlpha + 0.05 * Math.sin(time * 0.002);
	const alpha = (baseAlpha + (0.05 - baseAlpha) * dimT) * edgeBirthAlpha;

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

	const edgeC = color.startsWith('#') ? color : theme.edgeColor;
	ctx.strokeStyle = hexToRgba(themedColor(edgeC, theme.showStars ? 'dark' : 'light'), alpha);
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
	scale: number,
	theme: ThemeColors,
	layoutMode?: string,
	birthT: number = 1
): void {
	const { x, y, radius, type } = node;
	const baseColor = themedColor(node.color, theme.showStars ? 'dark' : 'light');
	// Tier the colour by hierarchy: leaves lighter+slightly more saturated,
	// categories slightly darker+muted, subcategories untouched. Dark-mode
	// only — in light mode the LIGHT_GRAPH_MAP already does deepening and
	// the contrast direction would flip.
	const color =
		theme.showStars && type === 'protocol'
			? shiftHsl(baseColor, 0.12, 0.04)
			: theme.showStars && type === 'category'
				? shiftHsl(baseColor, -0.1, -0.06)
				: baseColor;
	// Plant-growth birth: smoothstep S-curve, no overshoot. The bud is
	// faintly visible from the start (small minimum scale + fast alpha)
	// then fills out as the stem extends.
	let birthScale = 1;
	let birthAlpha = 1;
	if (birthT < 1) {
		const t = birthT;
		const eased = t * t * (3 - 2 * t); // smoothstep
		birthScale = 0.06 + 0.94 * eased;
		birthAlpha = Math.min(1, t * 1.8); // alpha catches up faster than scale
	}
	const alpha = (1 - 0.9 * dimT) * birthAlpha;

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
	r *= birthScale;

	// Outer glow — smoothly interpolated for hover
	const glowVisibility = isConnected ? 1 : 1 - dimT;
	const hasGlow =
		glowVisibility > 0.01 &&
		(hoverT > 0.01 || isSelected || isConnected || type === 'hub' || type === 'category');
	if (hasGlow) {
		const glowScale = 1 + 0.3 * eased; // glow grows out with hover
		const glowRadius = r * 2.2 * glowScale;
		const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
		const baseGlowAlpha = isSelected ? 0.35 : isConnected ? 0.2 : type === 'hub' ? 0.08 : 0.1;
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
		const baseBg = theme.nodeBaseBg;
		// Extract the rgb and replace alpha with (1 - dimT)
		const match = baseBg.match(/rgba?\(([^)]+)\)/);
		if (match) {
			const parts = match[1].split(',').map((s) => s.trim());
			ctx.fillStyle = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${1 - dimT})`;
		} else {
			ctx.fillStyle = baseBg;
		}
		ctx.fill();
	}

	// Node body
	const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
	if (type === 'hub') {
		if (theme.showStars) {
			// Dark mode: two-color gradient (white center → gray edge)
			gradient.addColorStop(0, hexToRgba(theme.hub, alpha));
			const endMatch = theme.hubGradientEnd.match(/rgba?\(([^)]+)\)/);
			if (endMatch) {
				const parts = endMatch[1].split(',').map((s) => s.trim());
				gradient.addColorStop(1, `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha * 0.8})`);
			} else {
				gradient.addColorStop(1, hexToRgba(theme.hub, alpha * 0.8));
			}
		} else {
			// Light mode: gentle alpha-fade for smooth sphere (subtler than protocol nodes)
			gradient.addColorStop(0, hexToRgba(theme.hub, alpha));
			gradient.addColorStop(0.6, hexToRgba(theme.hub, alpha * 0.88));
			gradient.addColorStop(1, hexToRgba(theme.hub, alpha * 0.65));
		}
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
		const hubHighlight = theme.showStars ? 0.4 : 0.15; // subtler in light mode
		highlight.addColorStop(
			0,
			`rgba(255, 255, 255, ${(type === 'hub' ? hubHighlight : theme.innerHighlightAlpha) * hlAlpha})`
		);
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
			drawCategoryIcon(ctx, x, y, iconSize, cat.icon, dimT, theme);
		}
	}

	// Subcategory icon inside subcategory nodes
	if (type === 'subcategory') {
		const sub = subcategoryMap.get(node.id);
		if (sub) {
			const iconSize = r * 1.1;
			drawSubcategoryIcon(ctx, x, y, iconSize, sub.icon, dimT, theme);
		}
	}

	// Hub icon inside hub node
	if (type === 'hub') {
		const iconSize = r * 1.1;
		drawHubIcon(ctx, x, y, iconSize, dimT, theme);
	}

	// Label — show for non-dimmed nodes and connected nodes
	if (dimT < 0.95 || isConnected) {
		const fontSize =
			type === 'hub' ? 11 : type === 'category' ? 10 : type === 'subcategory' ? 9.5 : 9;
		const showLabel =
			scale > 0.5 || type === 'hub' || type === 'category' || type === 'subcategory';
		const showAbbrev = scale <= 0.5 && scale > 0.3 && type === 'protocol';

		if (showLabel || showAbbrev || isConnected) {
			const label =
				isConnected && !showLabel
					? node.abbreviation || node.label
					: showLabel
						? type === 'hub'
							? 'PROTOCOLS'
							: type === 'category' || type === 'subcategory'
								? node.label
								: node.abbreviation || node.label
						: node.abbreviation || '';

			const labelAlpha = isConnected && dimT > 0.5 ? 0.7 : alpha;
			ctx.font = `${type === 'hub' ? '600' : '500'} ${fontSize}px Inter, system-ui, sans-serif`;

			// In light mode, use muted DOM colors for labels so they're readable on the light bg
			const labelColor =
				type === 'hub' ? theme.hub : theme.showStars ? color : themedDomColor(node.color, 'light');
			ctx.fillStyle = hexToRgba(labelColor, type === 'hub' ? labelAlpha : labelAlpha * 0.9);

			// Text shadow
			ctx.shadowColor = theme.labelShadowColor;
			ctx.shadowBlur = theme.labelShadowBlur;

			// Radial layout: position labels outward from center to avoid occlusion
			if (layoutMode === 'radial' && (type === 'protocol' || type === 'subcategory')) {
				const angle = Math.atan2(y, x);
				const labelOffset = r + 8;
				const lx = x + Math.cos(angle) * labelOffset;
				const ly = y + Math.sin(angle) * labelOffset;

				// Determine text alignment based on which side of the circle the node is on
				const absCos = Math.abs(Math.cos(angle));
				if (absCos < 0.3) {
					// Top or bottom — center horizontally
					ctx.textAlign = 'center';
					ctx.textBaseline = Math.sin(angle) > 0 ? 'top' : 'bottom';
				} else {
					// Left or right side
					ctx.textAlign = Math.cos(angle) > 0 ? 'left' : 'right';
					ctx.textBaseline = 'middle';
				}
				ctx.fillText(label, lx, ly);
			} else {
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(label, x, y + r + 6);
			}

			ctx.shadowColor = 'transparent';
			ctx.shadowBlur = 0;
		}
	}
}

// --- Category icon drawing functions (all in 24×24 coordinate space) ---

// Exact Lucide SVG paths rendered via Path2D for pixel-perfect icons
function drawNetworkFoundationsIcon(ctx: CanvasRenderingContext2D): void {
	// Three rounded rectangles (network nodes) connected by a branching path
	// Top-center node
	const rx = 1;
	ctx.beginPath();
	ctx.roundRect(9, 2, 6, 6, rx);
	ctx.stroke();
	// Bottom-left node
	ctx.beginPath();
	ctx.roundRect(2, 16, 6, 6, rx);
	ctx.stroke();
	// Bottom-right node
	ctx.beginPath();
	ctx.roundRect(16, 16, 6, 6, rx);
	ctx.stroke();
	// Vertical stem from top node down to junction
	ctx.stroke(new Path2D('M12 8v4'));
	// Horizontal bar with rounded corners branching to bottom nodes
	ctx.stroke(new Path2D('M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3'));
}

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
	ctx.stroke(
		new Path2D('M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z')
	);
}

function drawUtilitiesIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(
		new Path2D(
			'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'
		)
	);
	ctx.stroke(new Path2D('M9 12l2 2 4-4'));
}

function drawWirelessIcon(ctx: CanvasRenderingContext2D): void {
	ctx.stroke(new Path2D('M2 12 7 2'));
	ctx.stroke(new Path2D('M7 12 12 2'));
	ctx.stroke(new Path2D('M12 12 17 2'));
	ctx.stroke(new Path2D('M17 12 22 2'));
	ctx.stroke(new Path2D('M4.5 7h15'));
	ctx.stroke(new Path2D('M12 16v6'));
}

function drawHubIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	dimT: number,
	theme: ThemeColors
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

	// Drop shadow behind all icon elements for contrast
	ctx.shadowColor = theme.hubIconShadow;
	ctx.shadowBlur = 3;

	// Connecting lines from center to outer nodes
	ctx.lineWidth = 1.4;
	ctx.strokeStyle = hexToRgba(theme.hubIconGreen, 0.6 * alpha);
	ctx.beginPath();
	ctx.moveTo(center.x, 10.2);
	ctx.lineTo(top.x, 6);
	ctx.stroke();
	ctx.strokeStyle = hexToRgba(theme.hubIconPurple, 0.6 * alpha);
	ctx.beginPath();
	ctx.moveTo(10.6, 13);
	ctx.lineTo(6.7, 14.8);
	ctx.stroke();
	ctx.strokeStyle = hexToRgba(theme.hubIconBlue, 0.6 * alpha);
	ctx.beginPath();
	ctx.moveTo(13.4, 13);
	ctx.lineTo(17.3, 14.8);
	ctx.stroke();

	// Outer nodes
	ctx.globalAlpha = alpha;
	const n1 = new Path2D();
	n1.arc(top.x, top.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = theme.hubIconGreen;
	ctx.fill(n1);
	const n2 = new Path2D();
	n2.arc(bl.x, bl.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = theme.hubIconPurple;
	ctx.fill(n2);
	const n3 = new Path2D();
	n3.arc(br.x, br.y, 2.4, 0, Math.PI * 2);
	ctx.fillStyle = theme.hubIconBlue;
	ctx.fill(n3);

	// Center hub
	const ch = new Path2D();
	ch.arc(center.x, center.y, 1.8, 0, Math.PI * 2);
	ctx.fillStyle = theme.hubIconCenter;
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
	dimT: number,
	theme: ThemeColors
): void {
	ctx.save();
	ctx.translate(x, y);
	const s = size / 24;
	ctx.scale(s, s);
	ctx.translate(-12, -12);

	ctx.globalAlpha = 1 - 0.85 * dimT;
	ctx.strokeStyle = theme.categoryIconColor;
	ctx.fillStyle = theme.categoryIconColor;
	ctx.lineWidth = 1.2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	switch (icon) {
		case 'network-foundations':
			drawNetworkFoundationsIcon(ctx);
			break;
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
		case 'wireless':
			drawWirelessIcon(ctx);
			break;
	}

	ctx.restore();
}

// --- Subcategory icon drawing functions (all in 24×24 coordinate space) ---
// All paths are Lucide SVG path data, rendered via Path2D for parity with
// the DOM tooltip icons (which use lucide-svelte at the same path source).

function drawLinkLayerIcon(ctx: CanvasRenderingContext2D): void {
	// link-2 — two interlocked link halves with a bar between them
	ctx.stroke(new Path2D('M9 17H7A5 5 0 0 1 7 7h2'));
	ctx.stroke(new Path2D('M15 7h2a5 5 0 1 1 0 10h-2'));
	ctx.stroke(new Path2D('M8 12h8'));
}

function drawInternetLayerIcon(ctx: CanvasRenderingContext2D): void {
	// globe — circle with meridian and equator
	const c = new Path2D();
	c.arc(12, 12, 10, 0, Math.PI * 2);
	ctx.stroke(c);
	ctx.stroke(new Path2D('M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'));
	ctx.stroke(new Path2D('M2 12h20'));
}

function drawRoutingIcon(ctx: CanvasRenderingContext2D): void {
	// route — two circles connected by a winding path
	const c1 = new Path2D();
	c1.arc(6, 19, 3, 0, Math.PI * 2);
	ctx.stroke(c1);
	const c2 = new Path2D();
	c2.arc(18, 5, 3, 0, Math.PI * 2);
	ctx.stroke(c2);
	ctx.stroke(new Path2D('M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'));
}

function drawNamingIcon(ctx: CanvasRenderingContext2D): void {
	// tag — angled price-tag silhouette with a hole
	ctx.stroke(
		new Path2D(
			'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z'
		)
	);
	const dot = new Path2D();
	dot.arc(7.5, 7.5, 1.1, 0, Math.PI * 2);
	ctx.fill(dot);
}

function drawReliableStreamsIcon(ctx: CanvasRenderingContext2D): void {
	// git-commit-vertical — vertical line with a circle in the middle
	ctx.stroke(new Path2D('M12 3v6'));
	ctx.stroke(new Path2D('M12 15v6'));
	const c = new Path2D();
	c.arc(12, 12, 3, 0, Math.PI * 2);
	ctx.stroke(c);
}

function drawDatagramTransportIcon(ctx: CanvasRenderingContext2D): void {
	// package — hex-prism box with seam lines
	ctx.stroke(
		new Path2D(
			'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z'
		)
	);
	ctx.stroke(new Path2D('M12 22V12'));
	ctx.stroke(new Path2D('M3.29 7L12 12l8.71-5'));
	ctx.stroke(new Path2D('m7.5 4.27 9 5.15'));
}

function drawHttpVersionsIcon(ctx: CanvasRenderingContext2D): void {
	// layers — three stacked sheets
	ctx.stroke(
		new Path2D(
			'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z'
		)
	);
	ctx.stroke(new Path2D('m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65'));
	ctx.stroke(new Path2D('m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'));
}

function drawResourceQueryApisIcon(ctx: CanvasRenderingContext2D): void {
	// database — barrel
	const top = new Path2D();
	top.ellipse(12, 5, 9, 3, 0, 0, Math.PI * 2);
	ctx.stroke(top);
	ctx.stroke(new Path2D('M3 5v14a9 3 0 0 0 18 0V5'));
	ctx.stroke(new Path2D('M3 12a9 3 0 0 0 18 0'));
}

function drawRpcStylesIcon(ctx: CanvasRenderingContext2D): void {
	// terminal — chevron prompt with a horizontal cursor
	ctx.stroke(new Path2D('M4 17 10 11 4 5'));
	ctx.stroke(new Path2D('M12 19 H20'));
}

function drawRealtimeWebIcon(ctx: CanvasRenderingContext2D): void {
	// zap — lightning bolt
	ctx.stroke(
		new Path2D(
			'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'
		)
	);
}

function drawAgentProtocolsIcon(ctx: CanvasRenderingContext2D): void {
	// bot — robot head with antenna
	ctx.stroke(new Path2D('M12 8V4H8'));
	const body = new Path2D();
	body.roundRect(4, 8, 16, 12, 2);
	ctx.stroke(body);
	ctx.stroke(new Path2D('M2 14h2'));
	ctx.stroke(new Path2D('M20 14h2'));
	ctx.stroke(new Path2D('M15 13v2'));
	ctx.stroke(new Path2D('M9 13v2'));
}

function drawEnterpriseBrokersIcon(ctx: CanvasRenderingContext2D): void {
	// inbox — tray with a notch
	ctx.stroke(new Path2D('M22 12H16L14 15H10L8 12H2'));
	ctx.stroke(
		new Path2D(
			'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'
		)
	);
}

function drawIotMessagingIcon(ctx: CanvasRenderingContext2D): void {
	// cpu — chip with pins on every side
	const body = new Path2D();
	body.roundRect(4, 4, 16, 16, 2);
	ctx.stroke(body);
	const core = new Path2D();
	core.rect(9, 9, 6, 6);
	ctx.stroke(core);
	ctx.stroke(new Path2D('M9 2v2'));
	ctx.stroke(new Path2D('M15 2v2'));
	ctx.stroke(new Path2D('M9 20v2'));
	ctx.stroke(new Path2D('M15 20v2'));
	ctx.stroke(new Path2D('M2 9h2'));
	ctx.stroke(new Path2D('M2 15h2'));
	ctx.stroke(new Path2D('M20 9h2'));
	ctx.stroke(new Path2D('M20 15h2'));
}

function drawFederatedMessagingIcon(ctx: CanvasRenderingContext2D): void {
	// share-2 — three nodes connected by edges
	const n1 = new Path2D();
	n1.arc(18, 5, 3, 0, Math.PI * 2);
	ctx.stroke(n1);
	const n2 = new Path2D();
	n2.arc(6, 12, 3, 0, Math.PI * 2);
	ctx.stroke(n2);
	const n3 = new Path2D();
	n3.arc(18, 19, 3, 0, Math.PI * 2);
	ctx.stroke(n3);
	ctx.stroke(new Path2D('M8.59 13.51 15.42 17.49'));
	ctx.stroke(new Path2D('M15.41 6.51 8.59 10.49'));
}

function drawStreamingDeliveryIcon(ctx: CanvasRenderingContext2D): void {
	// monitor-play — screen with a play triangle and a stand
	const screen = new Path2D();
	screen.roundRect(2, 3, 20, 14, 2);
	ctx.stroke(screen);
	ctx.stroke(
		new Path2D(
			'M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.249a.75.75 0 0 1-1.142-.638z'
		)
	);
	ctx.stroke(new Path2D('M12 17v4'));
	ctx.stroke(new Path2D('M8 21h8'));
}

function drawConferencingCallsIcon(ctx: CanvasRenderingContext2D): void {
	// phone — handset
	ctx.stroke(
		new Path2D(
			'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
		)
	);
}

function drawSecureChannelsVpnIcon(ctx: CanvasRenderingContext2D): void {
	// lock — padlock body with shackle
	const body = new Path2D();
	body.roundRect(3, 11, 18, 11, 2);
	ctx.stroke(body);
	ctx.stroke(new Path2D('M7 11V7a5 5 0 0 1 10 0v4'));
}

function drawAuthenticationIcon(ctx: CanvasRenderingContext2D): void {
	// key-round — keyhead and bit
	ctx.stroke(
		new Path2D(
			'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'
		)
	);
	const dot = new Path2D();
	dot.arc(16.5, 7.5, 1.1, 0, Math.PI * 2);
	ctx.fill(dot);
}

function drawMailFileTransferIcon(ctx: CanvasRenderingContext2D): void {
	// mail — envelope with flap
	const env = new Path2D();
	env.roundRect(2, 4, 20, 16, 2);
	ctx.stroke(env);
	ctx.stroke(new Path2D('m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'));
}

function drawNetworkServicesIcon(ctx: CanvasRenderingContext2D): void {
	// settings/cog — gear with center circle
	ctx.stroke(
		new Path2D(
			'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'
		)
	);
	const c = new Path2D();
	c.arc(12, 12, 3, 0, Math.PI * 2);
	ctx.stroke(c);
}

function drawWlanWanIcon(ctx: CanvasRenderingContext2D): void {
	// wifi — three concentric arcs facing up with a dot
	ctx.stroke(new Path2D('M2 8.82a15 15 0 0 1 20 0'));
	ctx.stroke(new Path2D('M5 12.86a10 10 0 0 1 14 0'));
	ctx.stroke(new Path2D('M8.5 16.43a5 5 0 0 1 7 0'));
	const dot = new Path2D();
	dot.arc(12, 20, 1, 0, Math.PI * 2);
	ctx.fill(dot);
}

function drawPanProximityIcon(ctx: CanvasRenderingContext2D): void {
	// bluetooth — single continuous zig-zag
	ctx.stroke(new Path2D('m7 7 10 10-5 5V2l5 5L7 17'));
}

function drawSubcategoryIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	icon: string,
	dimT: number,
	theme: ThemeColors
): void {
	ctx.save();
	ctx.translate(x, y);
	const s = size / 24;
	ctx.scale(s, s);
	ctx.translate(-12, -12);

	ctx.globalAlpha = 1 - 0.85 * dimT;
	ctx.strokeStyle = theme.categoryIconColor;
	ctx.fillStyle = theme.categoryIconColor;
	ctx.lineWidth = 1.4; // a touch thicker than 1.2 so detail reads at the smaller sub radius
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	switch (icon) {
		case 'link-layer':
			drawLinkLayerIcon(ctx);
			break;
		case 'internet-layer':
			drawInternetLayerIcon(ctx);
			break;
		case 'routing':
			drawRoutingIcon(ctx);
			break;
		case 'naming':
			drawNamingIcon(ctx);
			break;
		case 'reliable-streams':
			drawReliableStreamsIcon(ctx);
			break;
		case 'datagram-transport':
			drawDatagramTransportIcon(ctx);
			break;
		case 'http-versions':
			drawHttpVersionsIcon(ctx);
			break;
		case 'resource-query-apis':
			drawResourceQueryApisIcon(ctx);
			break;
		case 'rpc-styles':
			drawRpcStylesIcon(ctx);
			break;
		case 'realtime-web':
			drawRealtimeWebIcon(ctx);
			break;
		case 'agent-protocols':
			drawAgentProtocolsIcon(ctx);
			break;
		case 'enterprise-brokers':
			drawEnterpriseBrokersIcon(ctx);
			break;
		case 'iot-messaging':
			drawIotMessagingIcon(ctx);
			break;
		case 'federated-messaging':
			drawFederatedMessagingIcon(ctx);
			break;
		case 'streaming-delivery':
			drawStreamingDeliveryIcon(ctx);
			break;
		case 'conferencing-calls':
			drawConferencingCallsIcon(ctx);
			break;
		case 'secure-channels-vpn':
			drawSecureChannelsVpnIcon(ctx);
			break;
		case 'authentication':
			drawAuthenticationIcon(ctx);
			break;
		case 'mail-file-transfer':
			drawMailFileTransferIcon(ctx);
			break;
		case 'network-services':
			drawNetworkServicesIcon(ctx);
			break;
		case 'wlan-wan':
			drawWlanWanIcon(ctx);
			break;
		case 'pan-proximity':
			drawPanProximityIcon(ctx);
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
