<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { prefersReducedMotion } from 'svelte/motion';
	import { AppState } from '$lib/state/app-state.svelte';
	import { setAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data';
	import { getJourneyById } from '$lib/data/journeys';
	import DesktopView from './desktop/DesktopView.svelte';

	const appState = new AppState();
	setAppState(appState);

	onMount(() => {
		// Dev helper: exposes window.__dev for agent/testing navigation
		if (dev) {
			const allNodes = buildGraphNodes();
			(window as any).__dev = {
				appState,
				nodes: allNodes,
				/** Navigate to a protocol or category by ID, optionally open simulate tab */
				go(id: string, view: 'learn' | 'simulate' = 'learn') {
					const node = allNodes.find((n) => n.id === id);
					if (!node) {
						console.warn(`[dev] No node with id "${id}". Available:`, allNodes.map((n) => n.id).join(', '));
						return;
					}
					appState.selectNode(node);
					appState.detailViewMode = view;
				},
				/** List all protocol/category IDs */
				ls() {
					return allNodes.map((n) => ({ id: n.id, type: n.type }));
				},
				/** Click the Step Forward button */
				step(n = 1) {
					for (let i = 0; i < n; i++) {
						setTimeout(() => {
							const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Step forward"]');
							btn?.click();
						}, i * 200);
					}
				},
				/** Click the Play button */
				play() {
					document.querySelector<HTMLButtonElement>('button[aria-label="Play"]')?.click();
				},
				/** Scroll to a section by heading text */
				scrollTo(text: string) {
					const el = Array.from(document.querySelectorAll('h3, h4')).find((h) => h.textContent?.includes(text));
					el?.scrollIntoView({ block: 'start', behavior: 'instant' });
				},
				/** Start a journey by ID */
				journey(id: string) {
					const j = getJourneyById(id);
					if (!j) {
						console.warn(`[dev] No journey with id "${id}".`);
						return;
					}
					appState.startJourney(j);
					const firstStep = j.steps[0];
					if (firstStep) {
						const node = allNodes.find((n) => n.id === firstStep.protocolId);
						if (node) appState.selectNode(node);
						appState.startJourney(j);
					}
				},
				journeyNext() { appState.advanceJourneyStep(); },
				journeyPrev() { appState.goBackJourneyStep(); },
				journeyExit() { appState.exitJourney(); }
			};
		}

		// Detect mobile
		function checkMobile() {
			appState.isMobile = window.innerWidth < 768;
		}
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Reduced motion
		appState.reducedMotion = prefersReducedMotion.current;

		// Keyboard handler
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				// If diagram modal is open, close that first (handled by DiagramModal)
				if (appState.diagramModal || appState.storyDiagramModal || appState.storyImageModal) return;
				appState.clearSelection();
			}
		}
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="h-screen w-screen overflow-hidden bg-bg-deep">
	<DesktopView />
</div>
