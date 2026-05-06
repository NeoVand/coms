<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getPioneerById } from '$lib/data/pioneers';

	const appState = getAppState();

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		if (appState.selectedNode) appState.selectedNode = null;
		if (appState.activeBookChapter) appState.activeBookChapter = null;
		if (appState.activeBookPart) appState.activeBookPart = null;
		appState.activeBookPartToc = null;
		if (appState.activePioneer !== id) appState.activePioneer = id;
		appState.showDetailPanel = true;
	});

	const pioneer = $derived(getPioneerById(page.params.id ?? ''));
	const titleText = $derived(
		pioneer ? `${pioneer.name} · Pioneer · Protocol Lab` : 'Pioneer · Protocol Lab'
	);
	const description = $derived(pioneer?.title ?? '');
</script>

<svelte:head>
	<title>{titleText}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
