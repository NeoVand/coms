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
	import CategoryStoryView from './category-story/CategoryStoryView.svelte';
	import { getCategoryStory } from '$lib/data/category-stories/index';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import StoryImage from './category-story/StoryImage.svelte';
	import SimulatorTabs from '$lib/simulator/components/SimulatorTabs.svelte';
	import SimulatorView from '$lib/simulator/components/SimulatorView.svelte';
	import { hasSimulation } from '$lib/simulator/simulations/index';
	import ComparisonPicker from '$lib/components/comparison/ComparisonPicker.svelte';
	import ComparisonCard from '$lib/components/comparison/ComparisonCard.svelte';
	import RelationshipCard from '$lib/components/comparison/RelationshipCard.svelte';
	import { getPair } from '$lib/data/comparison/pairs';
	import { X } from 'lucide-svelte';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	let panelWidth = $state(520);
	let isResizing = $state(false);

	// Keep appState in sync so focusOnNode uses the current panel width
	$effect(() => {
		appState.detailPanelWidth = panelWidth;
	});

	const MIN_WIDTH = 360;
	const MAX_WIDTH = 900;

	function onResizeStart(e: PointerEvent) {
		e.preventDefault();
		isResizing = true;
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
	}

	function onResizeMove(e: PointerEvent) {
		if (!isResizing) return;
		const newWidth = window.innerWidth - e.clientX;
		panelWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
	}

	function onResizeEnd() {
		isResizing = false;
	}

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

<div
	class="detail-panel absolute top-0 right-0 z-50 h-full"
	data-tour="detail-panel"
	style="width: {panelWidth}px;"
	class:panel-enter={true}
>
	<!-- Resize handle -->
	<div
		class="resize-handle absolute top-0 left-0 z-20 h-full w-2 cursor-col-resize"
		onpointerdown={onResizeStart}
		onpointermove={onResizeMove}
		onpointerup={onResizeEnd}
		onpointercancel={onResizeEnd}
		role="separator"
		aria-orientation="vertical"
		aria-label="Resize panel"
	>
		<div class="absolute top-1/2 left-0.5 h-8 w-1 -translate-y-1/2 rounded-full bg-slate-600 opacity-0 transition-opacity"
			class:opacity-100={isResizing}
		></div>
	</div>
	<!-- Close button -->
	<button
		class="close-btn absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => appState.clearSelection()}
		aria-label="Close panel"
	>
		<X size={16} />
	</button>
	<!-- Background layer: masked so blur + bg fade seamlessly into canvas -->
	<div class="panel-bg pointer-events-none absolute inset-0 shadow-2xl backdrop-blur-xl"></div>
	<!-- Content layer: unmasked so text stays fully opaque -->
	<div
		class="relative custom-scrollbar flex h-full w-full flex-col overflow-y-auto"
	>
		{#if selectedData?.type === 'hub'}
			{@const simCount = allProtocols.filter((p) => hasSimulation(p.id)).length}
			<div class="flex flex-col gap-6 p-6">
				<!-- Hero -->
				<div>
					<h2 class="text-2xl font-bold tracking-tight text-slate-100">Protocol Lab</h2>
					<p class="mt-2 text-sm leading-relaxed text-slate-300">
						An interactive atlas of <span class="font-semibold text-slate-100">{allProtocols.length} network protocols</span>
						— from the foundational TCP handshake to modern QUIC streams. Watch them come alive through
						step-by-step simulations, trace their packets on the wire, and explore five decades of networking history.
					</p>
				</div>

				<!-- Feature showcase -->
				<section class="space-y-2">
					<div class="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] p-3">
						<div class="flex items-start gap-3">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">{simCount} Interactive Simulations</div>
								<p class="mt-0.5 text-xs text-slate-400">Step through real protocol exchanges — watch TCP three-way handshakes, DNS resolution, TLS negotiations, and more unfold message by message with play, pause, and step controls.</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-purple-500/10 bg-purple-500/[0.04] p-3">
						<div class="flex items-start gap-3">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-400/10 text-purple-400">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
								</svg>
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">Diagrams, Code & Wire Formats</div>
								<p class="mt-0.5 text-xs text-slate-400">Every protocol comes with sequence diagrams, working code in multiple languages, and "On the Wire" views showing actual packet structure and byte layouts.</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
						<div class="flex items-start gap-3">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<circle cx="12" cy="5" r="2" stroke-width="2"/><circle cx="5" cy="19" r="2" stroke-width="2"/><circle cx="19" cy="19" r="2" stroke-width="2"/>
									<path stroke-width="2" d="M12 7v4M10 13l-3 4M14 13l3 4"/>
								</svg>
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">Three Graph Views</div>
								<p class="mt-0.5 text-xs text-slate-400">Switch between Force (physics-based clustering), Radial (concentric rings), and Timeline (chronological from 1969 to today) using the layout picker at the bottom left.</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-3">
						<div class="flex items-start gap-3">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
								</svg>
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">Stories Behind the Protocols</div>
								<p class="mt-0.5 text-xs text-slate-400">Each category tells the full history — the pioneers who invented TCP/IP, the design battles between reliability and speed, timelines, portraits, and conceptual diagrams.</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-rose-500/10 bg-rose-500/[0.04] p-3">
						<div class="flex items-start gap-3">
							<span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-400/10 text-rose-400">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
								</svg>
							</span>
							<div>
								<div class="text-sm font-medium text-slate-200">Protocol Comparisons</div>
								<p class="mt-0.5 text-xs text-slate-400">Compare protocols side by side — see key differences, when to use each, and how they relate. Switch to the Compare tab on any protocol to explore.</p>
							</div>
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

				<!-- Quick start -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
						Quick Start
					</h3>
					<div class="space-y-2 text-xs text-slate-400">
						<div class="flex items-start gap-2">
							<span class="mt-px text-slate-600">&rsaquo;</span>
							<p><span class="text-slate-300">Click any node</span> to open its deep-dive — overview, sequence diagram, how-it-works steps, code examples, and performance data.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-slate-600">&rsaquo;</span>
							<p><span class="text-slate-300">Switch to Simulate</span> on any protocol to watch its exchange play out step by step.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-slate-600">&rsaquo;</span>
							<p><span class="text-slate-300">Use Compare</span> to see side-by-side differences between protocols — like TCP vs UDP, or how TLS works with HTTP.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-slate-600">&rsaquo;</span>
							<p><span class="text-slate-300">Click a category</span> to read its history, meet the pioneers, and explore conceptual diagrams.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-slate-600">&rsaquo;</span>
							<p><span class="text-slate-300">Scroll to zoom</span>, drag to pan, and hover for quick summaries. Related protocols stay highlighted.</p>
						</div>
					</div>
				</section>

				<!-- Stats -->
				<section>
					<div class="grid grid-cols-3 gap-3">
						<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
							<div class="text-lg font-bold text-slate-100">{allProtocols.length}</div>
							<div class="text-[10px] text-slate-500">Protocols</div>
						</div>
						<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
							<div class="text-lg font-bold text-slate-100">{simCount}</div>
							<div class="text-[10px] text-slate-500">Simulations</div>
						</div>
						<div class="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
							<div class="text-lg font-bold text-slate-100">50+</div>
							<div class="text-[10px] text-slate-500">Years of History</div>
						</div>
					</div>
				</section>

				<!-- Attribution -->
				<div class="border-t border-white/[0.06] pt-4">
					<a
						href="https://github.com/NeoVand/coms"
						target="_blank"
						rel="external noopener noreferrer"
						class="flex items-center justify-center gap-2 text-[11px] text-slate-600 transition-colors hover:text-slate-400"
					>
						<svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
						</svg>
						<span>Developed by Neo Mohsenvand</span>
					</a>
				</div>
			</div>
		{:else if selectedData?.type === 'protocol' && selectedData.protocol}
			{@const proto = selectedData.protocol}
			{@const cat = selectedData.category}

			<div class="flex flex-col gap-0">
				<div class="p-6 pb-3">
					<ProtocolHeader {proto} {cat} />
				</div>

				<div class="px-6">
					<SimulatorTabs color={cat?.color ?? '#FFFFFF'} />
				</div>

				{#if appState.detailViewMode === 'learn'}
					<div class="flex flex-col gap-6 p-6">
						<!-- Overview -->
						<StoryNarrative text={proto.overview} color={cat?.color ?? '#FFFFFF'} title="Overview" />

						{#if proto.image}
							<StoryImage
								src={proto.image.src}
								alt={proto.image.alt}
								caption={proto.image.caption}
								credit={proto.image.credit}
								color={cat?.color ?? '#FFFFFF'}
							/>
						{/if}

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
							<CodeExample example={proto.codeExample} color={cat?.color ?? '#FFFFFF'} />
						{/if}

						<PerformanceStats performance={proto.performance} color={cat?.color ?? '#FFFFFF'} />

						<RelatedProtocols connections={proto.connections} />
					</div>
				{:else if appState.detailViewMode === 'simulate'}
					<div class="p-6">
						{#key proto.id}
							<SimulatorView protocolId={proto.id} color={cat?.color ?? '#FFFFFF'} />
						{/key}
					</div>
				{:else if appState.detailViewMode === 'compare'}
					<div class="p-6" data-tour="compare-view">
						{#if appState.compareTargetId}
							{@const targetProto = getProtocolById(appState.compareTargetId)}
							{@const pair = getPair(proto.id, appState.compareTargetId)}
							{#if targetProto}
								{#if pair?.type === 'relationship'}
									<RelationshipCard {pair} leftProto={proto} rightProto={targetProto} color={cat?.color ?? '#FFFFFF'} />
								{:else}
									<ComparisonCard {pair} leftProto={proto} rightProto={targetProto} color={cat?.color ?? '#FFFFFF'} />
								{/if}
							{/if}
						{:else}
							<ComparisonPicker protocolId={proto.id} color={cat?.color ?? '#FFFFFF'} />
						{/if}
					</div>
				{/if}
			</div>
		{:else if selectedData?.type === 'category' && selectedData.category}
			{@const cat = selectedData.category}
			{@const protocols = selectedData.protocols}
			{@const story = getCategoryStory(cat.id)}

			<div class="flex flex-col gap-6 p-6">
				<!-- Category header -->
				<div>
					<div class="flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center" style="color: {cat.color}">
							<CategoryIcon icon={cat.icon} size={28} />
						</span>
						<div>
							<h2 class="text-lg font-bold" style="color: {cat.color}">{cat.name}</h2>
							{#if story}
								<p class="mt-0.5 text-xs text-slate-400">{story.tagline}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Story content -->
				{#if story}
					<CategoryStoryView {story} {cat} />
				{/if}

				<!-- Protocols in category -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
						Protocols ({protocols.length})
					</h3>
					<div class="space-y-2">
						{#each protocols.toSorted((a, b) => a.year - b.year) as proto (proto.id)}
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
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline gap-2">
										<span class="text-sm font-medium text-slate-200">{proto.abbreviation}</span>
										<span class="text-[10px] text-slate-600">{proto.year}</span>
									</div>
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
		max-width: 90vw;
		min-width: 360px;
	}

	.panel-bg {
		background: linear-gradient(to right, rgb(9 14 26 / 0.6), rgb(9 14 26 / 0.88) 25%, rgb(7 10 20 / 0.98) 70%, rgb(5 8 16 / 1));
		-webkit-mask-image: linear-gradient(to right, transparent, black 80px);
		mask-image: linear-gradient(to right, transparent, black 80px);
	}

	.resize-handle:hover > div {
		opacity: 1 !important;
	}

	.panel-enter {
		animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes slideIn {
		from {
			transform: translateX(60px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.close-btn :global(svg) {
		transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.close-btn:hover :global(svg) {
		transform: rotate(90deg);
	}
</style>
