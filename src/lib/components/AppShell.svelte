<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { AppState } from '$lib/state/app-state.svelte';
	import { setAppState } from '$lib/state/context';
	import DesktopView from './desktop/DesktopView.svelte';
	import MobileView from './mobile/MobileView.svelte';

	const appState = new AppState();
	setAppState(appState);

	onMount(() => {
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
	{#if appState.isMobile}
		<MobileView />
	{:else}
		<DesktopView />
	{/if}
</div>
