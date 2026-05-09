<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { allProtocols, buildGraphNodes } from '$lib/data';

	const appState = getAppState();
	const allNodes = buildGraphNodes();
	const description = `Browse ${allProtocols.length} network protocols organized by category, with stories, simulations, and journeys.`;

	/**
	 * The /hub route opens the welcome side panel — the same view you
	 * get by clicking the central node on the graph or the book icon
	 * in the header. Distinct from / (bare graph, no selection) so the
	 * two states are independently shareable.
	 */
	$effect(() => {
		const hub = allNodes.find((n) => n.type === 'hub');
		if (hub && appState.selectedNode?.id !== 'hub') {
			appState.selectNode(hub);
		}
	});
</script>

<svelte:head>
	<title>Protocol Lab — Atlas of Network Protocols</title>
	<meta name="description" content={description} />
</svelte:head>
