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
		<h1 class="flex items-center justify-center gap-2 text-lg font-bold text-slate-100">
			<svg viewBox="0 0 20 20" class="h-5 w-5 shrink-0" fill="none">
				<line x1="10" y1="8.5" x2="10" y2="5" stroke="#6ee7b7" stroke-width="1.2" opacity="0.5" />
				<line x1="8.8" y1="10.8" x2="5.6" y2="12.3" stroke="#c4b5fd" stroke-width="1.2" opacity="0.5" />
				<line x1="11.2" y1="10.8" x2="14.4" y2="12.3" stroke="#7dd3fc" stroke-width="1.2" opacity="0.5" />
				<circle cx="10" cy="3" r="2" fill="#6ee7b7" />
				<circle cx="4" cy="13.5" r="2" fill="#c4b5fd" />
				<circle cx="16" cy="13.5" r="2" fill="#7dd3fc" />
				<circle cx="10" cy="10" r="1.5" fill="#e2e8f0" />
			</svg>
			Protocol Lab
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
