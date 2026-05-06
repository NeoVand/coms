<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes, getCategoryById } from '$lib/data';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		const node = allNodes.find((n) => n.id === id);
		if (node && appState.selectedNode?.id !== id) {
			appState.selectNode(node);
		}
	});

	const cat = $derived(getCategoryById(page.params.id ?? ''));
	const titleText = $derived(cat ? `${cat.name} · Protocol Lab` : 'Protocol Lab');
	const description = $derived(cat?.description ?? '');
</script>

<svelte:head>
	<title>{titleText}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
