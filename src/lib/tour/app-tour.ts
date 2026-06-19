import type { AppState } from '$lib/state/app-state.svelte';
import type { GraphNode } from '$lib/data/types';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { layoutIconInlineHtml } from '$lib/utils/layout-icons';

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

	// Snapshot the URL too. Tours mutate `appState.selectedNode` directly;
	// if we left the user on a route like `/p/tcp`, that route's `$effect`
	// would clobber every selection change back to TCP and the book step
	// (which selects the hub) would never render. Navigating to `/` at
	// tour start unmounts every route page so the tour can drive state
	// freely without route-effect interference. We restore the path on
	// destroy so the user lands back where they started.
	const savedPath = window.location.pathname + window.location.search;
	const baseHome = `${base}/`;
	const isAtHome = window.location.pathname === baseHome || window.location.pathname === base;
	if (!isAtHome) {
		await goto(baseHome, { replaceState: false, keepFocus: true });
	}

	const tcpNode = allNodes.find((n) => n.id === 'tcp');

	/**
	 * Re-select TCP if a stray click changed the selected node.
	 * Unlike `appState.selectNode()`, this does NOT reset detailViewMode
	 * so the tour can keep its current mode across steps.
	 */
	function ensureTcp() {
		if (tcpNode && appState.selectedNode?.id !== 'tcp') {
			appState.selectedNode = tcpNode;
			appState.hoveredNode = null;
		}
	}

	/**
	 * On mobile the detail panel is a bottom sheet that covers nearly the
	 * whole screen, so it must be closed for steps that highlight things
	 * behind it (the canvas, the layout picker). Returns whether the panel
	 * visibility actually changed, so callers can refresh the popover after
	 * the slide animation settles.
	 */
	function setPanelVisible(visible: boolean): boolean {
		if (appState.showDetailPanel === visible) return false;
		appState.showDetailPanel = visible;
		return true;
	}

	const PANEL_ANIM_MS = 380;

	const tourDriver = driver({
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
						'<br><br><span class="tour-hint">Takes about 60 seconds &middot; 12 stops</span>'
				},
				onHighlighted: () => {
					appState.clearSelection();
				}
			},
			// ── Step 2: The Protocol Graph ──
			// Show the graph against the hub welcome panel — that lays the
			// foundation for step 3 (the book lives on the hub) and means we
			// won't need to "jump out and back" to the hub mid-tour.
			{
				element: 'canvas',
				popover: {
					title: 'The Protocol Graph',
					description:
						'Every circle is a protocol. <strong>Click</strong> one to dive deep, or <strong>hover</strong> for a quick summary.' +
						'<br><br>Drag to pan, scroll to zoom. When you select a node, related protocols stay highlighted so you can trace connections.',
					// Driver.js resolves the next step's `element` selector synchronously
					// the moment we advance, so the hub home tab must be in the DOM
					// before we move to step 3 (the book TOC). Intercept Next here,
					// switch state, wait for Svelte to commit, *then* advance.
					onNextClick: () => {
						const hubNode = allNodes.find((n) => n.type === 'hub');
						if (hubNode) {
							appState.selectedNode = hubNode;
							appState.detailViewMode = 'learn';
							appState.compareTargetId = null;
							appState.hoveredNode = null;
							appState.hubViewMode = 'home';
							appState.categoryViewMode = 'story';
						}
						setPanelVisible(!appState.isMobile);
						scrollPanelToTop();
						// Two rAFs: first lets Svelte commit the hub view to the DOM,
						// second guarantees layout has settled before driver.js measures.
						requestAnimationFrame(() => {
							requestAnimationFrame(() => tourDriver.moveNext());
						});
					}
				},
				disableActiveInteraction: true,
				onHighlightStarted: () => {
					// On mobile the bottom-sheet panel covers the canvas — keep it closed.
					if (appState.isMobile) setPanelVisible(false);
				},
				onHighlighted: () => {
					const hubNode = allNodes.find((n) => n.type === 'hub');
					if (hubNode) {
						appState.selectedNode = hubNode;
						appState.detailViewMode = 'learn';
						appState.compareTargetId = null;
						appState.hoveredNode = null;
						appState.hubViewMode = 'home';
						appState.categoryViewMode = 'story';
					}
					setPanelVisible(!appState.isMobile);
				}
			},
			// ── Step 3: The Book of Protocols ──
			// Highlight the book TOC list on the hub welcome panel. Step 2's
			// onNextClick guarantees the hub home tab is rendered before
			// driver.js resolves `[data-tour="book-toc"]`.
			//
			// Driver.js calls `scrollIntoView` on the highlighted element
			// right after `onHighlightStarted` — for the 1000+px part list
			// that pushes the panel down past the hub hero. Pin the scroller
			// to the top after driver finishes positioning so the user keeps
			// the same scroll context they had before the step started.
			{
				element: '[data-tour="book-toc"]',
				popover: {
					title: 'The Book of Protocols',
					description:
						'Beyond the graph, the Lab is also a <strong>book in thirteen parts</strong> — ' +
						'from foundations and the story of the internet, through every layer of the stack, ' +
						'to outages, the frontier, and where to learn more.' +
						'<br><br>Each part has its own table of contents — click any card to jump in, or read it cover to cover.',
					side: 'left' as const,
					align: 'start' as const
				},
				onHighlightStarted: () => {
					const hubNode = allNodes.find((n) => n.type === 'hub');
					if (hubNode && appState.selectedNode?.id !== 'hub') {
						appState.selectedNode = hubNode;
						appState.detailViewMode = 'learn';
						appState.compareTargetId = null;
						appState.hoveredNode = null;
						appState.hubViewMode = 'home';
					}
					setPanelVisible(true);
					scrollPanelToTop();
				},
				onHighlighted: () => {
					// Undo driver.js's auto-scroll (it tries to centre the 1000+px
					// part list and ends up burying the heading + hub hero).
					scrollPanelToTop();
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 4: Zoom & Graph Layouts ──
			// Hub stays selected so the panel still shows the book overview —
			// nothing about the layout/zoom controls requires a protocol selected.
			{
				element: '[data-tour="layout-picker"]',
				popover: {
					title: 'Zoom & Layout',
					description:
						'Use <strong>+/&minus;</strong> to zoom, or click the percentage to reset.' +
						'<br><br>Switch how the graph is arranged:' +
						`<br>${layoutIconInlineHtml('force')}<strong>Force</strong> &mdash; physics-based clustering by category, hub at the centre` +
						`<br>${layoutIconInlineHtml('mesh')}<strong>Mesh</strong> &mdash; protocols laid out by how they actually relate to one another, like a map` +
						`<br>${layoutIconInlineHtml('radial')}<strong>Radial</strong> &mdash; concentric rings grouped by category` +
						`<br>${layoutIconInlineHtml('timeline')}<strong>Timeline</strong> &mdash; protocols plotted by year, from 1969 to today`
				},
				disableActiveInteraction: true,
				onHighlightStarted: () => {
					const hubNode = allNodes.find((n) => n.type === 'hub');
					if (hubNode && appState.selectedNode?.id !== 'hub') {
						appState.selectedNode = hubNode;
						appState.detailViewMode = 'learn';
						appState.hubViewMode = 'home';
					}
					// On mobile the bottom-sheet covers the layout picker — keep it closed.
					setPanelVisible(!appState.isMobile);
				}
			},
			// ── Step 5: Detail Panel Overview ──
			// First step where TCP enters the picture — from here on, every
			// step lives inside the protocol detail panel for TCP.
			{
				element: '[data-tour="detail-panel"]',
				popover: {
					title: 'Protocol Deep-Dives',
					description:
						'Select any protocol and this panel opens with everything you need — ' +
						'an overview, sequence diagrams, step-by-step breakdowns, code examples, performance stats, and protocol comparisons.' +
						'<br><br><span class="tour-hint">Drag the left edge to resize</span>',
					side: 'left' as const,
					align: 'start' as const,
					// Going Back from here returns to the Zoom step on the hub —
					// switch the panel back to the hub view so the visuals match
					// what the user saw before they crossed into TCP territory.
					onPrevClick: () => {
						const hubNode = allNodes.find((n) => n.type === 'hub');
						if (hubNode) {
							appState.selectedNode = hubNode;
							appState.detailViewMode = 'learn';
							appState.compareTargetId = null;
							appState.hoveredNode = null;
							appState.hubViewMode = 'home';
						}
						setPanelVisible(true);
						scrollPanelToTop();
						requestAnimationFrame(() => {
							requestAnimationFrame(() => tourDriver.movePrevious());
						});
					}
				},
				onHighlightStarted: () => {
					ensureTcp();
					const wasHidden = setPanelVisible(true);
					appState.detailViewMode = 'learn';
					scrollPanelToTop();
					if (wasHidden) {
						setTimeout(() => tourDriver.refresh(), PANEL_ANIM_MS);
					}
				}
			},
			// ── Step 6: Sequence Diagram ──
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
			// ── Step 7: How It Works ──
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
			// ── Step 8: Code Examples ──
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
			// ── Step 9: Three Modes ──
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
					// Pre-switch to simulate so [data-tour="simulator-view"] exists for step 10
					appState.detailViewMode = 'simulate';
					requestAnimationFrame(() => tourDriver.refresh());
				}
			},
			// ── Step 10: Simulation View ──
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
			// ── Step 11: Compare View ──
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
			// ── Step 12: Farewell ──
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
			appState.activeTour = null;
			// Restore the URL we redirected away from at tour start.
			if (!isAtHome && window.location.pathname + window.location.search !== savedPath) {
				goto(savedPath, { replaceState: false, keepFocus: true });
			}
		}
	});

	appState.activeTour = { destroy: () => tourDriver.destroy() };

	// Expose for dev testing (tree-shaken in prod via __dev check)
	if (typeof window !== 'undefined' && window.__dev) {
		window.__tourDriver = tourDriver;
	}

	tourDriver.drive();
}
