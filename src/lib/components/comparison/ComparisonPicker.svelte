<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import { getPairsForProtocol, getOtherProtocol } from '$lib/data/comparison/pairs';

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
	);
</script>

<div class="flex flex-col gap-2">
	{#each allPairs as { pair, proto, cat } (proto?.id)}
		{#if proto}
			<button
				class="flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.05]"
				onclick={() => (appState.compareTargetId = proto.id)}
			>
				<div
					class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
					style="background-color: {cat?.color ?? '#FFFFFF'}20; color: {cat?.color ?? '#FFFFFF'}"
				>
					{proto.abbreviation.slice(0, 3)}
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-baseline gap-2">
						<span class="text-sm font-medium text-slate-200">{proto.abbreviation}</span>
						<span class="text-[10px] text-slate-600">{proto.year}</span>
						<span class="rounded-full px-1.5 py-0.5 text-[9px] font-medium" style="background-color: {pair.type === 'vs' ? color + '15' : 'rgb(255 255 255 / 0.04)'}; color: {pair.type === 'vs' ? color : 'rgb(148 163 184)'}">
							{pair.type === 'vs' ? 'vs' : 'works with'}
						</span>
					</div>
					<p class="mt-0.5 text-xs leading-relaxed text-slate-400">
						{pair.summary}
					</p>
				</div>
			</button>
		{/if}
	{/each}

	{#if allPairs.length === 0}
		<p class="text-center text-sm text-slate-500">No comparisons available for this protocol.</p>
	{/if}
</div>
