<script lang="ts">
	import type { Category } from '$lib/data/types';
	import { getProtocolsForCategory } from '$lib/data/index';
	import ProtocolCard from './ProtocolCard.svelte';

	let { cat, searchQuery }: { cat: Category; searchQuery: string } = $props();

	let expanded = $state(false);

	const protocols = $derived.by(() => {
		const all = getProtocolsForCategory(cat.id);
		if (!searchQuery) return all;
		const q = searchQuery.toLowerCase();
		return all.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.abbreviation.toLowerCase().includes(q) ||
				p.oneLiner.toLowerCase().includes(q)
		);
	});

	const hasResults = $derived(protocols.length > 0);
</script>

{#if hasResults || !searchQuery}
	<div
		class="overflow-hidden rounded-xl border transition-colors"
		style="border-color: {expanded
			? cat.color + '40'
			: 'rgba(255,255,255,0.05)'}; border-left: 3px solid {cat.color}{expanded ? '' : '60'}"
	>
		<button
			class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
			onclick={() => (expanded = !expanded)}
		>
			<span class="text-lg">{cat.icon}</span>
			<div class="flex-1">
				<div class="text-sm font-semibold" style="color: {cat.color}">{cat.name}</div>
				<div class="text-xs text-slate-500">{protocols.length} protocols</div>
			</div>
			<svg
				class="h-4 w-4 text-slate-400 transition-transform"
				class:rotate-180={expanded}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if expanded}
			<div class="space-y-2 border-t border-white/5 p-3">
				{#each protocols as proto (proto.id)}
					<ProtocolCard {proto} color={cat.color} />
				{/each}
			</div>
		{/if}
	</div>
{/if}
