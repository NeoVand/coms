<script lang="ts">
	import GraphCanvas from './GraphCanvas.svelte';
	import NodeTooltip from './NodeTooltip.svelte';
	import ZoomControls from './ZoomControls.svelte';
	import DetailPanel from '$lib/components/detail/DetailPanel.svelte';
	import AccessibleGraph from '$lib/components/a11y/AccessibleGraph.svelte';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();
</script>

<div class="relative h-full w-full overflow-hidden bg-bg-deep">
	<!-- Canvas layer -->
	<GraphCanvas />

	<!-- HTML overlay layer -->
	<NodeTooltip />
	<ZoomControls />

	<!-- Detail panel -->
	{#if appState.showDetailPanel && appState.selectedNode}
		<DetailPanel />
	{/if}

	<!-- Accessibility tree (visually hidden) -->
	<AccessibleGraph />
</div>
