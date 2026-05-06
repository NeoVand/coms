<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getOutageById } from '$lib/data/outages';

	const appState = getAppState();

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		if (appState.selectedNode) appState.selectedNode = null;
		if (appState.activeBookChapter) appState.activeBookChapter = null;
		if (appState.activeBookPart) appState.activeBookPart = null;
		if (appState.activePioneer) appState.activePioneer = null;
		if (appState.activeRfc) appState.activeRfc = null;
		if (appState.activeOutage !== id) appState.activeOutage = id;
		appState.showDetailPanel = true;
	});

	const outage = $derived(getOutageById(page.params.id ?? ''));
	const titleText = $derived(
		outage ? `${outage.title} · Famous Outages · Protocol Lab` : 'Outage · Protocol Lab'
	);
	const description = $derived(outage?.oneLiner ?? '');
</script>

<svelte:head>
	<title>{titleText}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
