<script lang="ts">
	import type { Protocol, Category } from '$lib/data/types';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';

	let { proto, cat }: { proto: Protocol; cat: Category | undefined } = $props();
</script>

<div>
	<div class="flex items-start justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-bold text-slate-100">{proto.abbreviation}</h2>
				{#if proto.port}
					<span
						class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
						style="background-color: {cat?.color ?? '#fff'}15; color: {cat?.color ?? '#fff'}"
					>
						Port {proto.port}
					</span>
				{/if}
			</div>
			<p class="mt-0.5 text-xs text-slate-400">{proto.name}</p>
		</div>
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		{#if proto.year}
			<span class="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
				Est. {proto.year}
			</span>
		{/if}
		{#if proto.rfc}
			<span class="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
				{proto.rfc}
			</span>
		{/if}
		{#if cat}
			<span
				class="rounded-md px-2 py-0.5 text-[10px] font-medium"
				style="background-color: {cat.color}15; color: {cat.color}"
			>
				<span class="inline-flex items-center gap-1">
					<CategoryIcon icon={cat.icon} size={12} />
					{cat.name}
				</span>
			</span>
		{/if}
	</div>

	<p
		class="mt-3 rounded-lg border-l-2 py-2 pl-3 text-sm leading-relaxed text-slate-200"
		style="border-color: {cat?.color ?? '#fff'}; background-color: {cat?.color ?? '#fff'}08"
	>
		{proto.oneLiner}
	</p>
</div>
