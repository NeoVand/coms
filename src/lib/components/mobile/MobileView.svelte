<script lang="ts">
	import { categories } from '$lib/data/categories';
	import CategoryAccordion from './CategoryAccordion.svelte';
	import MobileDetailSheet from './MobileDetailSheet.svelte';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();
</script>

<div class="flex min-h-screen flex-col bg-bg-deep">
	<!-- Header -->
	<header class="border-b border-white/10 bg-bg-deep/90 px-4 py-4 backdrop-blur-xl">
		<h1 class="text-center text-lg font-bold text-slate-100">
			<span class="font-mono text-slate-400">&lt;/&gt;</span> Protocol Lab
		</h1>
		<p class="mt-1 text-center text-xs text-slate-500">Tap a protocol to learn more</p>
	</header>

	<!-- Category accordions -->
	<main class="flex-1 overflow-y-auto p-4">
		<div class="space-y-3">
			{#each categories as cat (cat.id)}
				<CategoryAccordion {cat} />
			{/each}
		</div>
	</main>

	<!-- Detail sheet -->
	{#if appState.showDetailPanel && appState.selectedNode}
		<MobileDetailSheet />
	{/if}
</div>
