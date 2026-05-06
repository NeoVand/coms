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
		appState.activeRegistryIndex = 'pioneers';
		appState.showDetailPanel = true;
	});
</script>

<svelte:head>
	<title>Pioneers — The Architects of the Field · Protocol Lab</title>
</svelte:head>
