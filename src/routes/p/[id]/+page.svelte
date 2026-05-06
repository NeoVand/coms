<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes, getProtocolById } from '$lib/data';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	/** Sync the panel selection from the URL whenever the route param changes. */
	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		const node = allNodes.find((n) => n.id === id);
		if (node && appState.selectedNode?.id !== id) {
			appState.selectNode(node);
		}
	});

	const proto = $derived(getProtocolById(page.params.id ?? ''));
	const titleText = $derived(() => {
		if (!proto) return 'Protocol Lab';
		// Skip the "abbreviation — name" pattern when the two are identical
		// (e.g. QUIC, gRPC, MCP) so we don't render "QUIC — QUIC · Protocol Lab".
		const head =
			proto.abbreviation === proto.name ? proto.name : `${proto.abbreviation} — ${proto.name}`;
		return `${head} · Protocol Lab`;
	});
	const description = $derived(proto?.oneLiner ?? '');
</script>

<svelte:head>
	<title>{titleText()}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
