<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data';
	import { subcategoryMap } from '$lib/data/subcategories';

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

	const sub = $derived(subcategoryMap.get(page.params.id ?? ''));
	const titleText = $derived(sub ? `${sub.name} · Protocol Lab` : 'Protocol Lab');
	const description = $derived(sub?.description ?? '');
</script>

<svelte:head>
	<title>{titleText}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
