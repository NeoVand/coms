import type { GraphNode, Viewport } from '$lib/data/types';

export class AppState {
	selectedNode: GraphNode | null = $state(null);
	hoveredNode: GraphNode | null = $state(null);
	isMobile: boolean = $state(false);
	reducedMotion: boolean = $state(false);
	showDetailPanel: boolean = $state(false);

	viewport: Viewport = $state({ x: 0, y: 0, scale: 1 });

	selectNode = (node: GraphNode | null) => {
		if (node?.type === 'hub') return;
		this.selectedNode = node;
		this.showDetailPanel = node !== null;
	};

	hoverNode = (node: GraphNode | null) => {
		this.hoveredNode = node;
	};

	clearSelection = () => {
		this.selectedNode = null;
		this.showDetailPanel = false;
	};

	pan = (dx: number, dy: number) => {
		this.viewport = {
			...this.viewport,
			x: this.viewport.x + dx,
			y: this.viewport.y + dy
		};
	};

	zoom = (scale: number, centerX: number, centerY: number) => {
		const newScale = Math.min(Math.max(scale, 0.3), 3);
		const ratio = newScale / this.viewport.scale;
		this.viewport = {
			x: centerX - (centerX - this.viewport.x) * ratio,
			y: centerY - (centerY - this.viewport.y) * ratio,
			scale: newScale
		};
	};

	resetViewport = () => {
		this.viewport = { x: 0, y: 0, scale: 1 };
	};
}
