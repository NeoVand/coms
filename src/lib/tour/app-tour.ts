import type { AppState } from '$lib/state/app-state.svelte';
import type { GraphNode } from '$lib/data/types';

/** Instantly scroll an element inside the detail-panel scroller into view. */
function scrollInPanel(selector: string) {
	const el = document.querySelector(selector);
	if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
}

function scrollPanelToTop() {
	const panel = document.querySelector('[data-tour="detail-panel"] .custom-scrollbar');
	if (panel) panel.scrollTop = 0;
}

export async function startTour(appState: AppState, allNodes: GraphNode[]): Promise<void> {
	const { driver } = await import('driver.js');

	// Snapshot current state for restoration after tour
	const savedSelectedNode = appState.selectedNode;
	const savedShowDetailPanel = appState.showDetailPanel;
	const savedViewMode = appState.detailViewMode;
	const savedCompareTarget = appState.compareTargetId;

	const tcpNode = allNodes.find((n) => n.id === 'tcp');

	/**
	 * Re-select TCP if a stray click changed the selected node.
	 * Unlike `appState.selectNode()`, this does NOT reset detailViewMode
	 * so the tour can keep its current mode across steps.
	 */
	function ensureTcp() {
		if (tcpNode && appState.selectedNode?.id !== 'tcp') {
			appState.selectedNode = tcpNode;
			appState.showDetailPanel = true;
			appState.hoveredNode = null;
		}
	}

	let tourDriver: ReturnType<typeof driver>;

	tourDriver = driver({
		showProgress: true,
		animate: true,
		overlayColor: '#0f172a',
		overlayOpacity: 0.75,
		stagePadding: 8,
		stageRadius: 12,
		popoverClass: 'protocol-tour-popover',
		allowClose: true,
		smoothScroll: false,
		progressText: '{{current}} / {{total}}',
		nextBtnText: 'Next',
		prevBtnText: 'Back',
		doneBtnText: 'Done',
		steps: [
			// ── Step 1: Welcome ──
			{
				popover: {
					title: 'Welcome to Protocol Lab',
					description:
						'An interactive explorer for the protocols that power the internet. ' +
						'Learn how they work, read real code, <strong>run step-by-step simulations</strong>, and compare protocols side by side.' +
						'<br><br><span class="tour-hint">Takes about 60 seconds &middot; 11 stops</span>'
				},
				onHighlighted: () => {
					appState.clearSelection();
				}
			},
			// ── Step 2: The Protocol Graph ──
			{
				element: 'canvas',
				popover: {
					title: 'The Protocol Graph',
					description:
						'Every circle is a protocol. <strong>Click</strong> one to dive deep, or <strong>hover</strong> for a quick summary.' +
						'<br><br>Drag to pan, scroll to zoom. When you select a node, related protocols stay highlighted so you can trace connections.'
				},
				disableActiveInteraction: true,
				onHighlighted: () => {
					if (tcpNode) appState.selectNode(tcpNode);
				}
			},
			// ── Step 3: Zoom & Graph Layouts ──
			{
				element: '[data-tour="layout-picker"]',
				popover: {
					title: 'Zoom & Layout',
					description:
						'Use <strong>+/&minus;</strong> to zoom, or click the percentage to reset.' +
						'<br><br>Switch how the graph is arranged:' +
						'<br><strong>Force</strong> &mdash; physics-based clustering by connections' +
						'<br><strong>Radial</strong> &mdash; concentric rings grouped by category' +
						'<br><strong>Timeline</strong> &mdash; protocols plotted by year, from 1969 to today'
				},
				disableActiveInteraction: true,
				onHighlightStarted: () => {
					ensureTcp();
				}
			},
			// ── Step 4: Detail Panel Overview ──
			{
				element: '[data-tour="detail-panel"]',
				popover: {
					title: 'Protocol Deep-Dives',
					description:
						'Select any protocol and this panel opens with everything you need — ' +
						'an overview, sequence diagrams, step-by-step breakdowns, code examples, performance stats, and protocol comparisons.' +
						'<br><br><span class="tour-hint">Drag the left edge to resize</span>',
					side: 'left' as const,
					align: 'start' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					appState.detailViewMode = 'learn';
					scrollPanelToTop();
				}
			},
			// ── Step 5: Sequence Diagram ──
			{
				element: '[data-tour="protocol-diagram"]',
				popover: {
					title: 'Sequence Diagrams',
					description:
						'See exactly how protocols communicate. ' +
						'Solid arrows show requests, dashed arrows show responses.' +
						'<br><br>Click the <strong>expand icon</strong> to view the diagram full-screen.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					appState.detailViewMode = 'learn';
					scrollInPanel('[data-tour="protocol-diagram"]');
				},
				onHighlighted: () => {
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 6: How It Works ──
			{
				element: '[data-tour="how-it-works"]',
				popover: {
					title: 'How It Works',
					description:
						'Every protocol is broken into numbered steps so you can follow the process from start to finish — ' +
						'like tracing a packet through a TCP handshake, one step at a time.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					scrollInPanel('[data-tour="how-it-works"]');
				},
				onHighlighted: () => {
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 7: Code Examples ──
			{
				element: '[data-tour="code-example"]',
				popover: {
					title: 'Code Examples',
					description:
						'Real, copyable code snippets in multiple languages. ' +
						'Switch between <strong>JavaScript, Python, Bash</strong>, and more — ' +
						'then hit the copy button to grab the code instantly.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					appState.detailViewMode = 'learn';
					scrollInPanel('[data-tour="code-example"]');
				},
				onHighlighted: () => {
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 8: Three Modes ──
			{
				element: '[data-tour="simulator-tabs"]',
				popover: {
					title: 'Learn, Simulate & Compare',
					description:
						'Every protocol has three modes. ' +
						'<strong>Learn</strong> gives you documentation, diagrams, and code. ' +
						'<strong>Simulate</strong> runs an interactive step-by-step walkthrough. ' +
						'<strong>Compare</strong> shows side-by-side differences with related protocols.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					scrollPanelToTop();
				},
				onHighlighted: () => {
					// Pre-switch to simulate so [data-tour="simulator-view"] exists for step 9
					appState.detailViewMode = 'simulate';
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 9: Simulation View ──
			{
				element: '[data-tour="simulator-view"]',
				popover: {
					title: 'Interactive Simulations',
					description:
						'Watch protocols come to life. ' +
						'Use <strong>Play</strong> to animate the full exchange, or <strong>Step</strong> to advance one message at a time.' +
						'<br><br>Adjust the speed, inspect packet headers, and see every field explained as data flows between actors.',
					side: 'left' as const,
					align: 'start' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					appState.detailViewMode = 'simulate';
					scrollPanelToTop();
				},
				onHighlighted: () => {
					// Stay in simulate mode — do NOT switch away while this step is visible
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 10: Compare View ──
			// Target the whole panel because we switch to compare mode here;
			// the compare-view element doesn't exist until the mode changes.
			{
				element: '[data-tour="detail-panel"]',
				popover: {
					title: 'Protocol Comparisons',
					description:
						'See how protocols stack up. Pick a pair to compare key differences, ' +
						'learn when to use each, or explore how two protocols work together — like TCP and TLS.',
					side: 'left' as const,
					align: 'start' as const
				},
				onHighlightStarted: () => {
					ensureTcp();
					appState.detailViewMode = 'compare';
					appState.compareTargetId = null;
					scrollPanelToTop();
				},
				onHighlighted: () => {
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 11: Farewell ──
			{
				popover: {
					title: "You're Ready to Explore!",
					description:
						'Start with a classic like ' +
						'<strong style="color: #39ff14">TCP</strong>, ' +
						'peek at modern protocols like ' +
						'<strong style="color: #00d4ff">HTTP/3</strong>, or ' +
						'see pub/sub in action with ' +
						'<strong style="color: #c084fc">MQTT</strong>.' +
						'<br><br>Try different <strong>graph layouts</strong>, <strong>run the simulations</strong>, ' +
						'and <strong>compare protocols</strong> to see how they differ!' +
						'<br><br><span class="tour-hint">Hit <strong>?</strong> anytime to replay this tour</span>'
				},
				onHighlighted: () => {
					appState.detailViewMode = 'learn';
				}
			}
		],
		onDestroyed: () => {
			appState.detailViewMode = savedViewMode;
			appState.compareTargetId = savedCompareTarget;
			if (savedSelectedNode && savedShowDetailPanel) {
				appState.selectNode(savedSelectedNode);
			} else {
				appState.clearSelection();
			}
		}
	});

	// Expose for dev testing (tree-shaken in prod via __dev check)
	if (typeof window !== 'undefined' && (window as any).__dev) {
		(window as any).__tourDriver = tourDriver;
	}

	tourDriver.drive();
}
