<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	// Visiting `/` shows the bird's-eye graph: clear any prior selection.
	// AppShell + DesktopView render the graph from the layout; this page
	// is intentionally empty.
	onMount(() => {
		if (appState.selectedNode) appState.clearSelection();
	});
</script>
