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
			<span class="font-mono text-slate-400">&lt;/&gt;</span> Protocol Universe
		</h1>
		<p class="mt-1 text-center text-xs text-slate-500">Tap a protocol to learn more</p>

		<!-- Search -->
		<div
			class="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
		>
			<svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<input
				type="text"
				placeholder="Search protocols..."
				value={appState.searchQuery}
				oninput={(e) => appState.setSearch(e.currentTarget.value)}
				class="w-full border-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
			/>
		</div>
	</header>

	<!-- Category accordions -->
	<main class="flex-1 overflow-y-auto p-4">
		<div class="space-y-3">
			{#each categories as cat (cat.id)}
				<CategoryAccordion {cat} searchQuery={appState.searchQuery} />
			{/each}
		</div>
	</main>

	<!-- Detail sheet -->
	{#if appState.showDetailPanel && appState.selectedNode}
		<MobileDetailSheet />
	{/if}
</div>
