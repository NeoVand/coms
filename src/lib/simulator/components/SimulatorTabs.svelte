<script lang="ts">
	import { getAppState } from '$lib/state/context';

	interface Props {
		color: string;
	}

	let { color }: Props = $props();
	const appState = getAppState();

	const tabs = [
		{ id: 'learn' as const, label: 'Learn' },
		{ id: 'simulate' as const, label: 'Simulate' },
		{ id: 'compare' as const, label: 'Compare' }
	];

	let tabEls: HTMLButtonElement[] = $state([]);

	const activeIndex = $derived(tabs.findIndex((t) => t.id === appState.detailViewMode));

	let underlineLeft = $state(0);
	let underlineWidth = $state(0);

	$effect(() => {
		const el = tabEls[activeIndex];
		if (el) {
			underlineLeft = el.offsetLeft;
			underlineWidth = el.offsetWidth;
		}
	});
</script>

<div class="relative flex border-b border-white/5" data-tour="simulator-tabs">
	{#each tabs as tab, i (tab.id)}
		<button
			bind:this={tabEls[i]}
			class="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors"
			class:text-slate-200={appState.detailViewMode === tab.id}
			class:text-slate-500={appState.detailViewMode !== tab.id}
			onclick={() => (appState.detailViewMode = tab.id)}
		>
			{tab.label}
		</button>
	{/each}

	<!-- Animated underline -->
	<div
		class="absolute bottom-0 h-0.5 transition-all duration-200 ease-out"
		style="background-color: {color}; left: {underlineLeft}px; width: {underlineWidth}px;"
	></div>
</div>
