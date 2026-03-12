<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import {
		getProtocolById,
		getCategoryById,
		getProtocolsForCategory,
		allProtocols
	} from '$lib/data/index';
	import { categories } from '$lib/data/categories';
	import { buildGraphNodes } from '$lib/data/index';
	import ProtocolHeader from './ProtocolHeader.svelte';
	import ProtocolDiagram from './ProtocolDiagram.svelte';
	import HowItWorksSteps from './HowItWorksSteps.svelte';
	import CodeExample from './CodeExample.svelte';
	import PerformanceStats from './PerformanceStats.svelte';
	import RelatedProtocols from './RelatedProtocols.svelte';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	const selectedData = $derived.by(() => {
		const node = appState.selectedNode;
		if (!node) return null;

		if (node.type === 'hub') {
			return { type: 'hub' as const };
		}

		if (node.type === 'category') {
			const cat = getCategoryById(node.id);
			if (!cat) return null;
			const protocols = getProtocolsForCategory(node.id);
			return { type: 'category' as const, category: cat, protocols };
		}

		const proto = getProtocolById(node.id);
		if (!proto) return null;
		const cat = getCategoryById(proto.categoryId);
		return { type: 'protocol' as const, protocol: proto, category: cat };
	});
</script>

<div class="detail-panel absolute top-0 right-0 z-50 h-full w-full max-w-xl sm:w-130">
	<!-- Close button -->
	<button
		class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => appState.clearSelection()}
		aria-label="Close panel"
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
<div
	class="custom-scrollbar flex h-full w-full flex-col overflow-y-auto bg-bg-deep/95 shadow-2xl backdrop-blur-xl"
>
	{#if selectedData?.type === 'hub'}
		<div class="flex flex-col gap-6 p-6">
			<!-- Welcome header -->
			<div>
				<h2 class="text-lg font-bold text-slate-100">The Protocol Universe</h2>
				<p class="mt-1 text-xs text-slate-400">An interactive guide to network protocols</p>
			</div>

			<p class="text-sm leading-relaxed text-slate-300">
				Welcome to an interactive exploration of the protocols that power the internet. From the TCP handshake that starts every web connection to the real-time streams that carry your video calls — every protocol here plays a role in modern networking.
			</p>

			<!-- How to use -->
			<section>
				<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					How to Navigate
				</h3>
				<div class="space-y-3 text-sm text-slate-300">
					<div class="flex items-start gap-3">
						<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400">1</span>
						<p><span class="font-medium text-slate-200">Click any node</span> to explore a protocol or category in detail — its purpose, how it works, code examples, and performance characteristics.</p>
					</div>
					<div class="flex items-start gap-3">
						<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400">2</span>
						<p><span class="font-medium text-slate-200">Hover over nodes</span> for a quick summary. When a protocol is selected, related protocols stay highlighted so you can see the connections.</p>
					</div>
					<div class="flex items-start gap-3">
						<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400">3</span>
						<p><span class="font-medium text-slate-200">Scroll to zoom</span> and drag to pan around the network graph. Click empty space to deselect.</p>
					</div>
				</div>
			</section>

			<!-- Categories -->
			<section>
				<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					Explore by Category
				</h3>
				<div class="space-y-2">
					{#each categories as cat (cat.id)}
						{@const count = allProtocols.filter((p) => p.categoryId === cat.id).length}
						<button
							class="flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.05]"
							onclick={() => {
								const node = allNodes.find((n) => n.id === cat.id);
								if (node) appState.selectNode(node);
							}}
						>
							<span
								class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
								style="background-color: {cat.color}20; color: {cat.color}"
							>
								<CategoryIcon icon={cat.icon} size={18} />
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">
									{cat.name}
									<span class="ml-1 text-[10px] text-slate-500">{count} protocols</span>
								</div>
								<div class="mt-0.5 text-xs text-slate-400">{cat.description}</div>
							</div>
						</button>
					{/each}
				</div>
			</section>

			<!-- Stats -->
			<section>
				<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					At a Glance
				</h3>
				<div class="grid grid-cols-3 gap-3">
					<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
						<div class="text-lg font-bold text-slate-100">{allProtocols.length}</div>
						<div class="text-[10px] text-slate-500">Protocols</div>
					</div>
					<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
						<div class="text-lg font-bold text-slate-100">{categories.length}</div>
						<div class="text-[10px] text-slate-500">Categories</div>
					</div>
					<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
						<div class="text-lg font-bold text-slate-100">50+</div>
						<div class="text-[10px] text-slate-500">Years of History</div>
					</div>
				</div>
			</section>

			<p class="text-[10px] leading-relaxed text-slate-500">
				Each protocol includes animated diagrams, code examples in multiple languages, performance stats, and links to official specifications. Click any colored node on the graph to begin.
			</p>
		</div>
	{:else if selectedData?.type === 'protocol' && selectedData.protocol}
		{@const proto = selectedData.protocol}
		{@const cat = selectedData.category}

		<div class="flex flex-col gap-6 p-6">
			<ProtocolHeader {proto} {cat} />

			<!-- Overview -->
			<section>
				<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Overview</h3>
				<div class="space-y-3 text-sm leading-relaxed text-slate-300">
					{#each proto.overview.split('\n\n') as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</div>
			</section>

			<ProtocolDiagram protocolId={proto.id} color={cat?.color ?? '#FFFFFF'} />

			<HowItWorksSteps steps={proto.howItWorks} color={cat?.color ?? '#FFFFFF'} />

			<!-- Use cases -->
			<section>
				<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					Use Cases
				</h3>
				<ul class="space-y-1.5">
					{#each proto.useCases as useCase, i (i)}
						<li class="flex items-start gap-2 text-sm text-slate-300">
							<span
								class="mt-1.5 h-1 w-1 shrink-0 rounded-full"
								style="background-color: {cat?.color ?? '#FFFFFF'}"
							></span>
							{useCase}
						</li>
					{/each}
				</ul>
			</section>

			{#if proto.codeExample}
				<CodeExample example={proto.codeExample} />
			{/if}

			<PerformanceStats performance={proto.performance} color={cat?.color ?? '#FFFFFF'} />

			<RelatedProtocols connections={proto.connections} />
		</div>
	{:else if selectedData?.type === 'category' && selectedData.category}
		{@const cat = selectedData.category}
		{@const protocols = selectedData.protocols}

		<div class="flex flex-col gap-6 p-6">
			<!-- Category header -->
			<div>
				<div class="flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center" style="color: {cat.color}">
						<CategoryIcon icon={cat.icon} size={28} />
					</span>
					<div>
						<h2 class="text-lg font-bold" style="color: {cat.color}">{cat.name}</h2>
					</div>
				</div>
				<p class="mt-3 text-sm leading-relaxed text-slate-300">{cat.description}</p>
			</div>

			<!-- Protocols in category -->
			<section>
				<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
					Protocols ({protocols.length})
				</h3>
				<div class="space-y-2">
					{#each protocols as proto (proto.id)}
						<button
							class="flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.05]"
							onclick={() => {
								const node = {
									id: proto.id,
									type: 'protocol' as const,
									label: proto.name,
									abbreviation: proto.abbreviation,
									color: cat.color,
									glowColor: cat.glowColor,
									radius: 16,
									categoryId: cat.id,
									x: 0,
									y: 0,
									vx: 0,
									vy: 0
								};
								appState.selectNode(node);
							}}
						>
							<div
								class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
								style="background-color: {cat.color}20; color: {cat.color}"
							>
								{proto.abbreviation.slice(0, 3)}
							</div>
							<div>
								<div class="text-sm font-medium text-slate-200">{proto.abbreviation}</div>
								<div class="mt-0.5 text-xs text-slate-400">{proto.oneLiner}</div>
							</div>
						</button>
					{/each}
				</div>
			</section>
		</div>
	{/if}
</div>
</div>

<style>
	.detail-panel {
		position: relative;
	}

	.detail-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: -60px;
		width: 60px;
		height: 100%;
		background: linear-gradient(to right, transparent, rgb(15 23 42 / 0.97));
		pointer-events: none;
		z-index: 1;
	}
</style>
