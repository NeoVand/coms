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
		appState.activeRegistryIndex = null;
		appState.activeBookToc = true;
		appState.showDetailPanel = true;
	});
</script>

<svelte:head>
	<title>The Book of Protocols · Protocol Lab</title>
	<meta
		name="description"
		content="A twelve-part book teaching network engineering through protocols, stories, pioneers, and famous outages."
	/>
</svelte:head>
