<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getFrontierById } from '$lib/data/frontier';

	const appState = getAppState();

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		if (appState.selectedNode) appState.selectedNode = null;
		if (appState.activeBookChapter) appState.activeBookChapter = null;
		if (appState.activePioneer) appState.activePioneer = null;
		if (appState.activeRfc) appState.activeRfc = null;
		if (appState.activeOutage) appState.activeOutage = null;
		if (appState.activeFrontier !== id) appState.activeFrontier = id;
		appState.showDetailPanel = true;
	});

	const entry = $derived(getFrontierById(page.params.id ?? ''));
	const titleText = $derived(
		entry ? `${entry.title} · The Frontier · Protocol Lab` : 'Frontier · Protocol Lab'
	);
</script>

<svelte:head>
	<title>{titleText}</title>
</svelte:head>
