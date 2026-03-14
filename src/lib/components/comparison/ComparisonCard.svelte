<script lang="ts">
	import type { Protocol } from '$lib/data/types';
	import type { ProtocolPair } from '$lib/data/comparison/types';
	import { getAppState } from '$lib/state/context';
	import { getCategoryById } from '$lib/data/index';
	import { buildGraphNodes } from '$lib/data/index';

	interface Props {
		pair: ProtocolPair | null;
		leftProto: Protocol;
		rightProto: Protocol;
		color: string;
	}

	let { pair, leftProto, rightProto, color }: Props = $props();
	const appState = getAppState();
	const allNodes = buildGraphNodes();

	const leftCat = $derived(getCategoryById(leftProto.categoryId));
	const rightCat = $derived(getCategoryById(rightProto.categoryId));
	const leftColor = $derived(leftCat?.color ?? color);
	const rightColor = $derived(rightCat?.color ?? color);

	// For "vs" pairs, ids[0] is alphabetically first.
	// Determine which side is "left" and which is "right" in the pair data.
	const flipped = $derived(pair ? pair.ids[0] !== leftProto.id : false);
	const useLeftWhen = $derived(flipped ? pair?.useRightWhen : pair?.useLeftWhen);
	const useRightWhen = $derived(flipped ? pair?.useLeftWhen : pair?.useRightWhen);
	const diffs = $derived(
		pair?.keyDifferences?.map((d) =>
			flipped ? { aspect: d.aspect, left: d.right, right: d.left } : d
		)
	);

	function goToProtocol(proto: Protocol) {
		const node = allNodes.find((n) => n.id === proto.id);
		if (node) appState.selectNode(node);
	}
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div>
		<button
			class="mb-3 flex items-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-slate-300"
			onclick={() => (appState.compareTargetId = null)}
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back
		</button>
		<div class="flex items-center gap-3">
			<span class="text-lg font-bold" style="color: {leftColor}">{leftProto.abbreviation}</span>
			<span class="text-xs font-medium text-slate-600">vs</span>
			<span class="text-lg font-bold" style="color: {rightColor}">{rightProto.abbreviation}</span>
		</div>
	</div>

	<!-- Summary -->
	{#if pair?.summary}
		<p class="text-sm leading-relaxed text-slate-300">{pair.summary}</p>
	{/if}

	<!-- Key Differences -->
	{#if diffs && diffs.length > 0}
		<section>
			<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
				Key Differences
			</h3>
			<div class="overflow-hidden rounded-lg border border-white/5">
				{#each diffs as diff, i (diff.aspect)}
					<div class="flex text-xs {i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}">
						<div class="w-[30%] shrink-0 border-r border-white/5 px-3 py-2 font-medium text-slate-400">
							{diff.aspect}
						</div>
						<div class="w-[35%] border-r border-white/5 px-3 py-2 text-slate-300" style="border-left-color: {leftColor}30">
							{diff.left}
						</div>
						<div class="w-[35%] px-3 py-2 text-slate-300">
							{diff.right}
						</div>
					</div>
				{/each}
			</div>
			<!-- Column labels -->
			<div class="mt-1 flex text-[10px] text-slate-600">
				<div class="w-[30%]"></div>
				<div class="w-[35%] px-3" style="color: {leftColor}90">{leftProto.abbreviation}</div>
				<div class="w-[35%] px-3" style="color: {rightColor}90">{rightProto.abbreviation}</div>
			</div>
		</section>
	{/if}

	<!-- Performance Comparison -->
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
			Performance
		</h3>
		<div class="space-y-2">
			{#each [
				{ label: 'Latency', left: leftProto.performance.latency, right: rightProto.performance.latency },
				{ label: 'Throughput', left: leftProto.performance.throughput, right: rightProto.performance.throughput },
				{ label: 'Overhead', left: leftProto.performance.overhead, right: rightProto.performance.overhead }
			] as stat (stat.label)}
				<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3">
					<div class="mb-1.5 text-center text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
						{stat.label}
					</div>
					<div class="flex gap-3">
						<div class="flex-1 rounded border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
							<div class="mb-0.5 text-[10px] font-medium" style="color: {leftColor}">{leftProto.abbreviation}</div>
							<div class="text-[11px] leading-relaxed text-slate-400">{stat.left}</div>
						</div>
						<div class="flex-1 rounded border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
							<div class="mb-0.5 text-[10px] font-medium" style="color: {rightColor}">{rightProto.abbreviation}</div>
							<div class="text-[11px] leading-relaxed text-slate-400">{stat.right}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- When to Use -->
	{#if useLeftWhen && useRightWhen}
		<section>
			<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
				When to Use
			</h3>
			<div class="space-y-3">
				<div class="rounded-lg border px-3 py-2.5" style="border-color: {leftColor}20; background-color: {leftColor}08">
					<div class="mb-1.5 text-xs font-medium" style="color: {leftColor}">
						Use {leftProto.abbreviation} when:
					</div>
					<ul class="space-y-1">
						{#each useLeftWhen as bullet, i (i)}
							<li class="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
								<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full" style="background-color: {leftColor}"></span>
								{bullet}
							</li>
						{/each}
					</ul>
				</div>
				<div class="rounded-lg border px-3 py-2.5" style="border-color: {rightColor}20; background-color: {rightColor}08">
					<div class="mb-1.5 text-xs font-medium" style="color: {rightColor}">
						Use {rightProto.abbreviation} when:
					</div>
					<ul class="space-y-1">
						{#each useRightWhen as bullet, i (i)}
							<li class="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
								<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full" style="background-color: {rightColor}"></span>
								{bullet}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>
	{/if}

	<!-- View Protocol Links -->
	<div class="flex gap-2">
		<button
			class="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/10 hover:bg-white/[0.06]"
			onclick={() => goToProtocol(leftProto)}
		>
			Learn about {leftProto.abbreviation}
		</button>
		<button
			class="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/10 hover:bg-white/[0.06]"
			onclick={() => goToProtocol(rightProto)}
		>
			Learn about {rightProto.abbreviation}
		</button>
	</div>
</div>
