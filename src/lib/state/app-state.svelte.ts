import type { GraphNode, Viewport } from '$lib/data/types';
import type { LayoutMode } from '$lib/engine/layouts';
import type { Concept } from '$lib/data/concepts';
import type { Journey } from '$lib/data/journeys';

export class AppState {
	selectedNode: GraphNode | null = $state(null);
	layoutMode: LayoutMode = $state('force');
	hoveredNode: GraphNode | null = $state(null);
	isMobile: boolean = $state(false);
	reducedMotion: boolean = $state(false);
	showDetailPanel: boolean = $state(false);
	detailPanelWidth: number = $state(520);
	detailViewMode: 'learn' | 'simulate' | 'compare' = $state('learn');
	compareTargetId: string | null = $state(null);

	// Hub and category tab modes
	hubViewMode: 'home' | 'concepts' | 'journeys' = $state('home');
	categoryViewMode: 'story' | 'advanced' | 'journeys' = $state('story');

	// Diagram modal state (rendered at root level to escape stacking contexts)
	diagramModal: { protocolId: string; color: string } | null = $state(null);

	openDiagramModal = (protocolId: string, color: string) => {
		this.diagramModal = { protocolId, color };
	};

	closeDiagramModal = () => {
		this.diagramModal = null;
	};

	// Story diagram modal state
	storyDiagramModal: {
		definition: string;
		caption: string;
		color: string;
		title?: string;
	} | null = $state(null);

	openStoryDiagramModal = (definition: string, caption: string, color: string, title?: string) => {
		this.storyDiagramModal = { definition, caption, color, title };
	};

	closeStoryDiagramModal = () => {
		this.storyDiagramModal = null;
	};

	// Story image modal state
	storyImageModal: {
		src: string;
		alt: string;
		caption?: string;
		credit?: string;
		color: string;
		title?: string;
	} | null = $state(null);

	openStoryImageModal = (
		src: string,
		alt: string,
		color: string,
		caption?: string,
		credit?: string,
		title?: string
	) => {
		this.storyImageModal = { src, alt, caption, credit, color, title };
	};

	closeStoryImageModal = () => {
		this.storyImageModal = null;
	};

	// Concept tooltip state
	conceptTooltip: { concept: Concept; triggerRect: DOMRect } | null = $state(null);

	showConceptTooltip = (concept: Concept, triggerRect: DOMRect) => {
		this.conceptTooltip = { concept, triggerRect };
	};

	hideConceptTooltip = () => {
		this.conceptTooltip = null;
	};

	// Journey state
	activeJourney: Journey | null = $state(null);
	activeJourneyStepIndex: number = $state(0);

	startJourney = (journey: Journey) => {
		this.activeJourney = journey;
		this.activeJourneyStepIndex = 0;
	};

	advanceJourneyStep = () => {
		if (!this.activeJourney) return;
		if (this.activeJourneyStepIndex < this.activeJourney.steps.length - 1) {
			this.activeJourneyStepIndex++;
		}
	};

	goBackJourneyStep = () => {
		if (this.activeJourneyStepIndex > 0) {
			this.activeJourneyStepIndex--;
		}
	};

	goToJourneyStep = (index: number) => {
		if (!this.activeJourney) return;
		if (index >= 0 && index < this.activeJourney.steps.length) {
			this.activeJourneyStepIndex = index;
		}
	};

	exitJourney = () => {
		this.activeJourney = null;
		this.activeJourneyStepIndex = 0;
	};

	viewport: Viewport = $state({ x: 0, y: 0, scale: 1 });

	// Smooth viewport animation (not reactive — only read by tickViewport)
	private _viewportTarget: Viewport | null = null;

	selectNode = (node: GraphNode | null) => {
		this.selectedNode = node;
		this.showDetailPanel = node !== null;
		this.detailViewMode = 'learn';
		this.compareTargetId = null;
		this.hoveredNode = null;
		this.hubViewMode = 'home';
		this.categoryViewMode = 'story';
	};

	hoverNode = (node: GraphNode | null) => {
		this.hoveredNode = node;
	};

	clearSelection = () => {
		this.selectedNode = null;
		this.showDetailPanel = false;
		this.hoveredNode = null;
		this._viewportTarget = null;
		this.exitJourney();
	};

	pan = (dx: number, dy: number) => {
		this._viewportTarget = null;
		this.viewport = {
			...this.viewport,
			x: this.viewport.x + dx,
			y: this.viewport.y + dy
		};
	};

	zoom = (scale: number, centerX: number, centerY: number) => {
		this._viewportTarget = null;
		const newScale = Math.min(Math.max(scale, 0.3), 3);
		const ratio = newScale / this.viewport.scale;
		this.viewport = {
			x: centerX - (centerX - this.viewport.x) * ratio,
			y: centerY - (centerY - this.viewport.y) * ratio,
			scale: newScale
		};
	};

	resetViewport = () => {
		this._viewportTarget = null;
		this.viewport = { x: 0, y: 0, scale: 1 };
	};

	/**
	 * Smoothly animate the viewport to fit a subgraph of highlighted nodes
	 * in the visible area (left of the detail panel).
	 */
	focusOnSubgraph = (
		subgraphNodes: GraphNode[],
		canvasWidth: number,
		canvasHeight: number,
		panelWidth?: number
	) => {
		if (subgraphNodes.length === 0) return;

		const panelW = panelWidth ?? this.detailPanelWidth;
		const visibleW = canvasWidth - panelW;
		const visibleH = canvasHeight;

		// Bounding box of the subgraph in world space
		let minX = Infinity,
			maxX = -Infinity,
			minY = Infinity,
			maxY = -Infinity;
		for (const n of subgraphNodes) {
			const r = n.radius + 30; // pad around each node for labels
			if (n.x - r < minX) minX = n.x - r;
			if (n.x + r > maxX) maxX = n.x + r;
			if (n.y - r < minY) minY = n.y - r;
			if (n.y + r > maxY) maxY = n.y + r;
		}

		const bboxW = maxX - minX;
		const bboxH = maxY - minY;
		const cx = (minX + maxX) / 2;
		const cy = (minY + maxY) / 2;

		// Scale to fit with 15% padding on each side
		const padding = 1.3;
		const fitScale = Math.min(visibleW / (bboxW * padding), visibleH / (bboxH * padding));
		// Clamp: don't zoom in too much or out too far
		const newScale = Math.max(0.45, Math.min(fitScale, 1.4));

		// Visible-area center relative to canvas center
		const offsetX = (canvasWidth - panelW) / 2 - canvasWidth / 2;

		this._viewportTarget = {
			x: offsetX - cx * newScale,
			y: -cy * newScale,
			scale: newScale
		};
	};

	/** Call each frame to smoothly interpolate viewport toward the target. */
	tickViewport = () => {
		const target = this._viewportTarget;
		if (!target) return;

		const t = 0.09;
		const dx = target.x - this.viewport.x;
		const dy = target.y - this.viewport.y;
		const ds = target.scale - this.viewport.scale;

		if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(ds) < 0.002) {
			this.viewport = { ...target };
			this._viewportTarget = null;
			return;
		}

		this.viewport = {
			x: this.viewport.x + dx * t,
			y: this.viewport.y + dy * t,
			scale: this.viewport.scale + ds * t
		};
	};
}
