<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	/**
	 * Visiting `/` shows the bird's-eye graph with no panel — the app's
	 * zero state. We have to clear every reading-surface flag, not just
	 * `selectedNode`, because the X close button and the Esc key both
	 * route here and the user expects "close the panel" to actually
	 * close it from any reading surface.
	 */
	onMount(() => {
		if (appState.selectedNode) appState.clearSelection();
		appState.activeBookChapter = null;
		appState.activePioneer = null;
		appState.activeRfc = null;
		appState.activeOutage = null;
		appState.activeFrontier = null;
		appState.activeRegistryIndex = null;
		appState.activeBookToc = false;
		appState.showDetailPanel = false;
	});
</script>
