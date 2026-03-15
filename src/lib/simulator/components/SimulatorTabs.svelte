<script lang="ts">
	import ViewTabs from '$lib/components/detail/ViewTabs.svelte';
	import { getAppState } from '$lib/state/context';

	interface Props {
		color: string;
	}

	let { color }: Props = $props();
	const appState = getAppState();

	const tabs = [
		{ id: 'learn', label: 'Learn' },
		{ id: 'simulate', label: 'Simulate' },
		{ id: 'compare', label: 'Compare' }
	];
</script>

<div data-tour="simulator-tabs">
	<ViewTabs
		{tabs}
		activeId={appState.detailViewMode}
		{color}
		onchange={(id) => (appState.detailViewMode = id as 'learn' | 'simulate' | 'compare')}
	/>
</div>
