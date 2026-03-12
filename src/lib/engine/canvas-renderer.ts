import type { GraphNode, GraphEdge, Viewport } from '$lib/data/types';
import { COLORS } from '$lib/utils/colors';
import { hexToRgba } from '$lib/utils/colors';
import { getProtocolById } from '$lib/data/index';

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
}

const NODE_MAP = new Map<string, GraphNode>();

function buildNodeMap(nodes: GraphNode[]) {
	NODE_MAP.clear();
	for (const n of nodes) NODE_MAP.set(n.id, n);
}

function isNodeDimmed(node: GraphNode, selectedNode: GraphNode | null): boolean {
	if (selectedNode && selectedNode.id !== node.id) {
		if (selectedNode.type === 'category') {
			if (node.type === 'hub') return false;
			return node.type === 'protocol' && node.categoryId !== selectedNode.id;
		}
		if (selectedNode.type === 'protocol') {
			return (
				node.id !== selectedNode.categoryId && node.type !== 'hub' && node.id !== selectedNode.id
			);
		}
	}
	return false;
}

export function render(ctx: CanvasRenderingContext2D, options: RenderOptions): void {
	const { width, height, viewport, nodes, edges, hoveredNode, selectedNode, time, dpr } = options;

	buildNodeMap(nodes);

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

	// Draw edges
	for (const edge of edges) {
		const source = NODE_MAP.get(
			typeof edge.source === 'string' ? edge.source : (edge.source as GraphNode).id
		);
		const target = NODE_MAP.get(
			typeof edge.target === 'string' ? edge.target : (edge.target as GraphNode).id
		);
		if (!source || !target) continue;

		const dimSource = isNodeDimmed(source, selectedNode);
		const dimTarget = isNodeDimmed(target, selectedNode);
		const dimmed = dimSource || dimTarget;

		drawEdge(ctx, source, target, edge.color, dimmed, time);
	}

	// Draw related protocol edges (dashed)
	if (selectedNode && selectedNode.type === 'protocol') {
		drawRelatedEdges(ctx, selectedNode, time);
	}

	// Draw nodes (hub last so it's on top)
	const sortedNodes = [...nodes].sort((a, b) => {
		const order = { protocol: 0, category: 1, hub: 2 };
		return order[a.type] - order[b.type];
	});

	for (const node of sortedNodes) {
		const isHovered = hoveredNode?.id === node.id;
		const isSelected = selectedNode?.id === node.id;
		const dimmed = isNodeDimmed(node, selectedNode);
		drawNode(ctx, node, isHovered, isSelected, dimmed, time, viewport.scale);
	}

	ctx.restore();

	// Draw status bar
	drawStatusBar(ctx, width, height);

	ctx.restore();
}

function drawRelatedEdges(
	ctx: CanvasRenderingContext2D,
	selectedNode: GraphNode,
	time: number
): void {
	const proto = getProtocolById(selectedNode.id);
	if (!proto || !proto.connections.length) return;

	ctx.save();
	ctx.setLineDash([6, 4]);

	for (const connId of proto.connections) {
		const targetNode = NODE_MAP.get(connId);
		if (!targetNode) continue;

		const dx = targetNode.x - selectedNode.x;
		const dy = targetNode.y - selectedNode.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const midX = (selectedNode.x + targetNode.x) / 2;
		const midY = (selectedNode.y + targetNode.y) / 2;
		const offset = dist * 0.15;
		const cpx = midX - dy * 0.15 + Math.sin(time * 0.001) * offset * 0.2;
		const cpy = midY + dx * 0.15 + Math.cos(time * 0.001) * offset * 0.2;

		ctx.beginPath();
		ctx.moveTo(selectedNode.x, selectedNode.y);
		ctx.quadraticCurveTo(cpx, cpy, targetNode.x, targetNode.y);
		ctx.strokeStyle = hexToRgba(selectedNode.color, 0.4);
		ctx.lineWidth = 1.5;
		ctx.stroke();
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
	dimmed: boolean,
	time: number
): void {
	const alpha = dimmed ? 0.05 : 0.2 + 0.05 * Math.sin(time * 0.002);

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
	ctx.lineWidth = dimmed ? 0.5 : 1.2;
	ctx.stroke();
}

function drawNode(
	ctx: CanvasRenderingContext2D,
	node: GraphNode,
	isHovered: boolean,
	isSelected: boolean,
	dimmed: boolean,
	time: number,
	scale: number
): void {
	const { x, y, radius, color, type } = node;
	const alpha = dimmed ? 0.1 : 1;

	// Animated radius
	let r = radius;
	if (type === 'hub') {
		r += Math.sin(time * 0.003) * 2;
	}
	if (isHovered) {
		r *= 1.15;
	}
	if (isSelected) {
		r *= 1.1;
	}

	// Outer glow
	if (!dimmed && (isHovered || isSelected || type === 'hub' || type === 'category')) {
		const glowRadius = r * (type === 'hub' ? 3 : 2.2);
		const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
		const glowAlpha = isHovered || isSelected ? 0.35 : type === 'hub' ? 0.15 : 0.1;
		glow.addColorStop(0, hexToRgba(color, glowAlpha));
		glow.addColorStop(1, hexToRgba(color, 0));
		ctx.beginPath();
		ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
		ctx.fillStyle = glow;
		ctx.fill();
	}

	// Ring for selected
	if (isSelected && !dimmed) {
		ctx.beginPath();
		ctx.arc(x, y, r + 4, 0, Math.PI * 2);
		ctx.strokeStyle = hexToRgba(color, 0.6);
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	// Node body
	const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
	if (type === 'hub') {
		gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		gradient.addColorStop(1, `rgba(200, 210, 230, ${alpha * 0.8})`);
	} else {
		gradient.addColorStop(0, hexToRgba(color, alpha * 0.9));
		gradient.addColorStop(0.7, hexToRgba(color, alpha * 0.6));
		gradient.addColorStop(1, hexToRgba(color, alpha * 0.3));
	}

	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = gradient;
	ctx.fill();

	// Inner highlight
	if (!dimmed) {
		const highlight = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x, y, r);
		highlight.addColorStop(0, `rgba(255, 255, 255, ${type === 'hub' ? 0.4 : 0.25})`);
		highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
		highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = highlight;
		ctx.fill();
	}

	// Label
	if (!dimmed) {
		const fontSize = type === 'hub' ? 11 : type === 'category' ? 10 : 9;
		const showLabel = scale > 0.5 || type === 'hub' || type === 'category';
		const showAbbrev = scale <= 0.5 && scale > 0.3 && type === 'protocol';

		if (showLabel || showAbbrev) {
			const label = showLabel
				? type === 'hub'
					? '< / > PROTOCOLS'
					: type === 'category'
						? node.label
						: node.abbreviation || node.label
				: node.abbreviation || '';

			ctx.font = `${type === 'hub' ? '600' : '500'} ${fontSize}px Inter, system-ui, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle =
				type === 'hub' ? `rgba(255, 255, 255, ${alpha})` : hexToRgba(color, alpha * 0.9);

			// Text shadow
			ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
			ctx.shadowBlur = 4;
			ctx.fillText(label, x, y + r + 6);
			ctx.shadowColor = 'transparent';
			ctx.shadowBlur = 0;
		}
	}
}

function drawStatusBar(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.font = '11px Inter, system-ui, sans-serif';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';
	ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
	ctx.fillText('Canvas 2D | 60 FPS Target', 16, height - 12);
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
