<script lang="ts">
	import type { Category } from '$lib/data/types';
	import { getProtocolsForCategory } from '$lib/data/index';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
	import ProtocolCard from './ProtocolCard.svelte';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';

	let { cat }: { cat: Category } = $props();
	const appState = getAppState();
	const color = $derived(themedDomColor(cat.color, appState.theme));

	let expanded = $state(false);

	const protocols = $derived(getProtocolsForCategory(cat.id));
</script>

<div
	class="overflow-hidden rounded-xl border transition-colors"
	style="border-color: {expanded
		? cat.color + '40'
		: 'rgba(255,255,255,0.05)'}; border-left: 3px solid {color}{expanded ? '' : '60'}"
>
	<button
		class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-s-glass-hover"
		onclick={() => (expanded = !expanded)}
	>
		<span class="flex h-7 w-7 items-center justify-center" style="color: {color}">
			<CategoryIcon icon={cat.icon} size={20} />
		</span>
		<div class="flex-1">
			<div class="text-sm font-semibold" style="color: {color}">{cat.name}</div>
			<div class="text-xs text-t-muted">{protocols.length} protocols</div>
		</div>
		<svg
			class="h-4 w-4 text-t-secondary transition-transform"
			class:rotate-180={expanded}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if expanded}
		<div class="space-y-2 border-t border-s-border p-3">
			{#each protocols as proto (proto.id)}
				<ProtocolCard {proto} color={color} />
			{/each}
		</div>
	{/if}
</div>
