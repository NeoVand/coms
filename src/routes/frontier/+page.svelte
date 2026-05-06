<script lang="ts">
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	$effect(() => {
		if (appState.selectedNode) appState.selectedNode = null;
		appState.activeBookChapter = null;
		appState.activePioneer = null;
		appState.activeRfc = null;
		appState.activeOutage = null;
		appState.activeFrontier = null;
		appState.activeRegistryIndex = 'frontier';
		appState.showDetailPanel = true;
	});
</script>

<svelte:head>
	<title>The Frontier — 2024-2026 · Protocol Lab</title>
</svelte:head>
