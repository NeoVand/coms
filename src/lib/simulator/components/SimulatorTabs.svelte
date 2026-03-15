<script lang="ts">
	import ViewTabs from '$lib/components/detail/ViewTabs.svelte';
	import { getAppState } from '$lib/state/context';
	import { BookOpen, Play, Scale } from 'lucide-svelte';

	interface Props {
		color: string;
	}

	let { color }: Props = $props();
	const appState = getAppState();

	const tabs = [
		{ id: 'learn', label: 'Learn', icon: BookOpen },
		{ id: 'simulate', label: 'Simulate', icon: Play },
		{ id: 'compare', label: 'Compare', icon: Scale }
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
