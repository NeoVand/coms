<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { prefersReducedMotion } from 'svelte/motion';
	import { AppState } from '$lib/state/app-state.svelte';
	import { setAppState } from '$lib/state/context';
	import { setupHistoryTracking } from '$lib/state/history.svelte';
	import { buildGraphNodes } from '$lib/data';
	import { getJourneyById } from '$lib/data/journeys';
	import { navigateToNode, navigateToJourney, navigateToHub } from '$lib/utils/navigation';
	import DesktopView from './desktop/DesktopView.svelte';

	// Track in-app history so the panel chrome can disable Back/Forward
	// when there's nowhere to go inside the app. Must run during component
	// init — `afterNavigate` requires it.
	setupHistoryTracking();

	let { children }: { children?: Snippet } = $props();

	const appState = new AppState();
	setAppState(appState);

	// Restore theme from localStorage
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('protocol-lab-theme');
		if (saved === 'light' || saved === 'dark') {
			appState.theme = saved;
		}
	}

	// Persist theme and apply class to <html>
	$effect(() => {
		const t = appState.theme;
		document.documentElement.classList.toggle('light', t === 'light');
		document.documentElement.classList.toggle('dark', t === 'dark');
		localStorage.setItem('protocol-lab-theme', t);
	});

	onMount(() => {
		// Dev helper: exposes window.__dev for agent/testing navigation.
		// Goes through the URL navigator so URL ↔ state stays in sync —
		// the same code path users hit when they click a node.
		if (dev) {
			const allNodes = buildGraphNodes();
			window.__dev = {
				appState,
				nodes: allNodes,
				/** Navigate to a protocol or category by ID, optionally open simulate tab */
				async go(id: string, view: 'learn' | 'simulate' = 'learn') {
					const node = allNodes.find((n) => n.id === id);
					if (!node) {
						console.warn(
							`[dev] No node with id "${id}". Available:`,
							allNodes.map((n) => n.id).join(', ')
						);
						return;
					}
					await navigateToNode(node);
					appState.detailViewMode = view;
				},
				/** Clear selection and return to the hub graph. */
				home() {
					return navigateToHub();
				},
				/** List all protocol/category IDs */
				ls() {
					return allNodes.map((n) => ({ id: n.id, type: n.type }));
				},
				/** Click the Step Forward button */
				step(n = 1) {
					for (let i = 0; i < n; i++) {
						setTimeout(() => {
							const btn = document.querySelector<HTMLButtonElement>(
								'button[aria-label="Step forward"]'
							);
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
					const el = Array.from(document.querySelectorAll('h3, h4')).find((h) =>
						h.textContent?.includes(text)
					);
					el?.scrollIntoView({ block: 'start', behavior: 'instant' });
				},
				/** Start a journey by ID */
				async journey(id: string) {
					const j = getJourneyById(id);
					if (!j) {
						console.warn(`[dev] No journey with id "${id}".`);
						return;
					}
					await navigateToJourney(id);
				},
				journeyNext() {
					appState.advanceJourneyStep();
				},
				journeyPrev() {
					appState.goBackJourneyStep();
				},
				journeyExit() {
					appState.exitJourney();
				}
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
				navigateToHub();
			}
		}
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="h-dvh w-screen overflow-hidden bg-bg-deep">
	<DesktopView />
	<!--
	  The route page renders here. For graph-driven routes (/p/[id], /c/[id],
	  /journey/[id]) the page renders nothing visible — it just runs an effect
	  that syncs AppState from the URL. Future content routes (/book, /glossary,
	  /pioneers, …) will render their own UI here.
	-->
	{@render children?.()}
</div>
