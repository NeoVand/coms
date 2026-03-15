<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import HowItWorksSteps from '$lib/components/detail/HowItWorksSteps.svelte';
	import ProtocolDiagram from '$lib/components/detail/ProtocolDiagram.svelte';
	import CodeExample from '$lib/components/detail/CodeExample.svelte';
	import PerformanceStats from '$lib/components/detail/PerformanceStats.svelte';
	import SimulatorTabs from '$lib/simulator/components/SimulatorTabs.svelte';
	import SimulatorView from '$lib/simulator/components/SimulatorView.svelte';
	import ComparisonPicker from '$lib/components/comparison/ComparisonPicker.svelte';
	import ComparisonCard from '$lib/components/comparison/ComparisonCard.svelte';
	import RelationshipCard from '$lib/components/comparison/RelationshipCard.svelte';
	import { getPair } from '$lib/data/comparison/pairs';
	import { getHighlightedName } from '$lib/data/name-highlights';
	import { themedDomColor } from '$lib/utils/colors';

	const appState = getAppState();

	const proto = $derived(appState.selectedNode ? getProtocolById(appState.selectedNode.id) : null);
	const cat = $derived(proto ? getCategoryById(proto.categoryId) : null);
	const color = $derived(themedDomColor(cat?.color ?? '#fff', appState.theme));
</script>

{#if proto && cat}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-40 bg-[var(--theme-overlay)]"
		onclick={() => appState.clearSelection()}
		aria-label="Close detail sheet"
	></button>

	<!-- Sheet -->
	<div
		class="custom-scrollbar fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-s-border bg-bg-deep shadow-2xl"
	>
		<!-- Handle -->
		<div class="flex justify-center py-3">
			<div class="h-1 w-8 rounded-full bg-s-border"></div>
		</div>

		<!-- Close -->
		<button
			class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-s-glass text-t-secondary"
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
					<h2 class="text-lg font-bold text-t-primary">{proto.abbreviation}</h2>
					{#if proto.port}
						<span
							class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
							style="background-color: {color}15; color: {color}"
						>
							Port {proto.port}
						</span>
					{/if}
				</div>
				<p class="text-xs text-t-secondary">
					{#each getHighlightedName(proto.id, proto.name) as seg}{#if seg.highlight}<span class="font-bold" style="color: {color}">{seg.text}</span>{:else}{seg.text}{/if}{/each}
				</p>
				<p
					class="mt-2 rounded-lg border-l-2 py-2 pl-3 text-sm text-t-primary"
					style="border-color: {color}; background-color: {color}08"
				>
					{proto.oneLiner}
				</p>
			</div>

			<SimulatorTabs color={color} />

			{#if appState.detailViewMode === 'learn'}
				<!-- Overview -->
				<div class="space-y-2 text-sm leading-relaxed text-t-primary">
					{#each proto.overview.split('\n\n') as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</div>

				<ProtocolDiagram protocolId={proto.id} color={color} />

				<HowItWorksSteps steps={proto.howItWorks} color={color} />

				<!-- Use cases -->
				<section>
					<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
						Use Cases
					</h3>
					<ul class="space-y-1">
						{#each proto.useCases as useCase, i (i)}
							<li class="flex items-start gap-2 text-xs text-t-primary">
								<span
									class="mt-1.5 h-1 w-1 shrink-0 rounded-full"
									style="background-color: {color}"
								></span>
								{useCase}
							</li>
						{/each}
					</ul>
				</section>

				{#if proto.codeExample}
					<CodeExample example={proto.codeExample} />
				{/if}

				<PerformanceStats performance={proto.performance} color={color} />
			{:else if appState.detailViewMode === 'simulate'}
				{#key proto.id}
					<SimulatorView protocolId={proto.id} color={color} />
				{/key}
			{:else if appState.detailViewMode === 'compare'}
				{#if appState.compareTargetId}
					{@const targetProto = getProtocolById(appState.compareTargetId)}
					{@const pair = getPair(proto.id, appState.compareTargetId)}
					{#if targetProto}
						{#if pair?.type === 'relationship'}
							<RelationshipCard {pair} leftProto={proto} rightProto={targetProto} color={color} />
						{:else}
							<ComparisonCard {pair} leftProto={proto} rightProto={targetProto} color={color} />
						{/if}
					{/if}
				{:else}
					<ComparisonPicker protocolId={proto.id} color={color} />
				{/if}
			{/if}
		</div>
	</div>
{/if}
