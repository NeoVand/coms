<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import HowItWorksSteps from '$lib/components/detail/HowItWorksSteps.svelte';
	import ProtocolDiagram from '$lib/components/detail/ProtocolDiagram.svelte';
	import CodeExample from '$lib/components/detail/CodeExample.svelte';
	import PerformanceStats from '$lib/components/detail/PerformanceStats.svelte';
	import SimulatorTabs from '$lib/simulator/components/SimulatorTabs.svelte';
	import SimulatorView from '$lib/simulator/components/SimulatorView.svelte';
	import { getHighlightedName } from '$lib/data/name-highlights';

	const appState = getAppState();

	const proto = $derived(appState.selectedNode ? getProtocolById(appState.selectedNode.id) : null);
	const cat = $derived(proto ? getCategoryById(proto.categoryId) : null);
</script>

{#if proto && cat}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-40 bg-black/60"
		onclick={() => appState.clearSelection()}
		aria-label="Close detail sheet"
	></button>

	<!-- Sheet -->
	<div
		class="custom-scrollbar fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-bg-deep shadow-2xl"
	>
		<!-- Handle -->
		<div class="flex justify-center py-3">
			<div class="h-1 w-8 rounded-full bg-white/20"></div>
		</div>

		<!-- Close -->
		<button
			class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400"
			onclick={() => appState.clearSelection()}
			aria-label="Close"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>

		<div class="flex flex-col gap-5 px-5 pb-8">
			<!-- Header -->
			<div>
				<div class="flex items-center gap-2">
					<h2 class="text-lg font-bold text-slate-100">{proto.abbreviation}</h2>
					{#if proto.port}
						<span
							class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
							style="background-color: {cat.color}15; color: {cat.color}"
						>
							Port {proto.port}
						</span>
					{/if}
				</div>
				<p class="text-xs text-slate-400">
					{#each getHighlightedName(proto.id, proto.name) as seg}{#if seg.highlight}<span class="font-bold" style="color: {cat.color}">{seg.text}</span>{:else}{seg.text}{/if}{/each}
				</p>
				<p
					class="mt-2 rounded-lg border-l-2 py-2 pl-3 text-sm text-slate-300"
					style="border-color: {cat.color}; background-color: {cat.color}08"
				>
					{proto.oneLiner}
				</p>
			</div>

			<SimulatorTabs color={cat.color} />

			{#if appState.detailViewMode === 'learn'}
				<!-- Overview -->
				<div class="space-y-2 text-sm leading-relaxed text-slate-300">
					{#each proto.overview.split('\n\n') as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</div>

				<ProtocolDiagram protocolId={proto.id} color={cat.color} />

				<HowItWorksSteps steps={proto.howItWorks} color={cat.color} />

				<!-- Use cases -->
				<section>
					<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
						Use Cases
					</h3>
					<ul class="space-y-1">
						{#each proto.useCases as useCase, i (i)}
							<li class="flex items-start gap-2 text-xs text-slate-300">
								<span
									class="mt-1.5 h-1 w-1 shrink-0 rounded-full"
									style="background-color: {cat.color}"
								></span>
								{useCase}
							</li>
						{/each}
					</ul>
				</section>

				{#if proto.codeExample}
					<CodeExample example={proto.codeExample} />
				{/if}

				<PerformanceStats performance={proto.performance} color={cat.color} />
			{:else}
				{#key proto.id}
					<SimulatorView protocolId={proto.id} color={cat.color} />
				{/key}
			{/if}
		</div>
	</div>
{/if}
