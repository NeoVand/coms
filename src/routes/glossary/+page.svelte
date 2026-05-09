<script lang="ts">
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	$effect(() => {
		if (appState.selectedNode) appState.selectedNode = null;
		appState.activeBookChapter = null;
		appState.activeBookPart = null;
		appState.activeBookPartToc = null;
		appState.activePioneer = null;
		appState.activeRfc = null;
		appState.activeOutage = null;
		appState.activeFrontier = null;
		appState.activeRegistryIndex = 'glossary';
		appState.showDetailPanel = true;
	});
</script>

<svelte:head>
	<title>Glossary — Networking Terms · Protocol Lab</title>
</svelte:head>
