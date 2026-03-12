<script lang="ts">
	import type { PerformanceInfo } from '$lib/data/types';

	let { performance, color }: { performance: PerformanceInfo; color: string } = $props();

	const stats = $derived([
		{ label: 'Latency', value: performance.latency, iconType: 'bolt' as const },
		{ label: 'Throughput', value: performance.throughput, iconType: 'chart' as const },
		{ label: 'Overhead', value: performance.overhead, iconType: 'box' as const }
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
					<span style="color: {color}">
						{#if stat.iconType === 'bolt'}
							<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
								<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
							</svg>
						{:else if stat.iconType === 'chart'}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M3 20h18" />
								<path d="M7 16V8" />
								<path d="M12 16V4" />
								<path d="M17 16v-5" />
							</svg>
						{:else}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
								/>
								<path d="m3.3 7 8.7 5 8.7-5" />
								<path d="M12 22V12" />
							</svg>
						{/if}
					</span>
					<span class="text-[10px] font-semibold tracking-wider uppercase" style="color: {color}">
						{stat.label}
					</span>
				</div>
				<p class="mt-1 text-xs leading-relaxed text-slate-400">{stat.value}</p>
			</div>
		{/each}
	</div>
</section>
