<script lang="ts">
	import type { PerformanceInfo } from '$lib/data/types';

	let { performance, color }: { performance: PerformanceInfo; color: string } = $props();

	const stats = $derived([
		{ label: 'Latency', value: performance.latency, icon: '⚡' },
		{ label: 'Throughput', value: performance.throughput, icon: '📊' },
		{ label: 'Overhead', value: performance.overhead, icon: '📦' }
	]);
</script>

<section>
	<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
		Performance Characteristics
	</h3>
	<div class="space-y-2">
		{#each stats as stat (stat.label)}
			<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3">
				<div class="flex items-center gap-1.5">
					<span class="text-xs">{stat.icon}</span>
					<span class="text-[10px] font-semibold tracking-wider uppercase" style="color: {color}">
						{stat.label}
					</span>
				</div>
				<p class="mt-1 text-xs leading-relaxed text-slate-400">{stat.value}</p>
			</div>
		{/each}
	</div>
</section>
