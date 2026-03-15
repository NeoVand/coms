<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import { getPairsForProtocol, getOtherProtocol } from '$lib/data/comparison/pairs';
	import LinkedText from './LinkedText.svelte';

	interface Props {
		protocolId: string;
		color: string;
	}

	let { protocolId, color }: Props = $props();
	const appState = getAppState();

	const pairs = $derived(getPairsForProtocol(protocolId));

	const allPairs = $derived(
		[...pairs.vs, ...pairs.relationships].map((pair) => {
			const otherId = getOtherProtocol(pair, protocolId);
			const proto = getProtocolById(otherId);
			const cat = proto ? getCategoryById(proto.categoryId) : null;
			return { pair, proto, cat };
		}).filter((e) => e.proto)
		// Deduplicate by proto ID — prefer VS pairs (listed first) over relationship duplicates
		.filter((e, i, arr) => arr.findIndex((x) => x.proto!.id === e.proto!.id) === i)
	);
</script>

<div class="flex flex-col gap-2">
	{#each allPairs as { pair, proto, cat } (proto?.id)}
		{#if proto}
			<button
				class="flex w-full flex-col gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.05]"
				onclick={() => (appState.compareTargetId = proto.id)}
			>
				<div class="flex items-baseline gap-2">
					<span class="text-sm font-medium" style="color: {cat?.color ?? '#FFFFFF'}">{proto.abbreviation}</span>
					<span class="text-[10px] text-slate-600">{proto.year}</span>
					<span class="rounded-full px-1.5 py-0.5 text-[9px] font-medium" style="background-color: {pair.type === 'vs' ? color + '15' : 'rgb(255 255 255 / 0.04)'}; color: {pair.type === 'vs' ? color : 'rgb(148 163 184)'}">
						{pair.type === 'vs' ? 'vs' : 'works with'}
					</span>
				</div>
				<p class="text-xs leading-relaxed text-slate-400">
					<LinkedText text={pair.summary} color={cat?.color ?? color} />
				</p>
			</button>
		{/if}
	{/each}

	{#if allPairs.length === 0}
		<p class="text-center text-sm text-slate-500">No comparisons available for this protocol.</p>
	{/if}
</div>
