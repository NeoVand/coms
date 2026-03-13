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
	<!-- Background layer: masked so blur + bg fade seamlessly into canvas -->
	<div class="panel-bg pointer-events-none absolute inset-0 shadow-2xl backdrop-blur-xl"></div>
	<!-- Content layer: unmasked so text stays fully opaque -->
	<div
		class="relative custom-scrollbar flex h-full w-full flex-col overflow-y-auto"
	>
		{#if selectedData?.type === 'hub'}
			<div class="flex flex-col gap-6 p-6">
				<!-- Welcome header -->
				<div>
					<h2 class="text-lg font-bold text-slate-100">The Protocol Universe</h2>
					<p class="mt-1 text-xs text-slate-400">An interactive guide to network protocols</p>
				</div>

				<p class="text-sm leading-relaxed text-slate-300">
					Welcome to an interactive exploration of the protocols that power the internet. From the
					TCP handshake that starts every web connection to the real-time streams that carry your
					video calls — every protocol here plays a role in modern networking.
				</p>

				<!-- How to use -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
						How to Navigate
					</h3>
					<div class="space-y-3 text-sm text-slate-300">
						<div class="flex items-start gap-3">
							<span
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400"
								>1</span
							>
							<p>
								<span class="font-medium text-slate-200">Click any node</span> to explore a protocol or
								category in detail — its purpose, how it works, code examples, and performance characteristics.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400"
								>2</span
							>
							<p>
								<span class="font-medium text-slate-200">Hover over nodes</span> for a quick summary.
								When a protocol is selected, related protocols stay highlighted so you can see the connections.
							</p>
						</div>
						<div class="flex items-start gap-3">
							<span
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400"
								>3</span
							>
							<p>
								<span class="font-medium text-slate-200">Scroll to zoom</span> and drag to pan around
								the network graph. Click empty space to deselect.
							</p>
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
					Each protocol includes animated diagrams, code examples in multiple languages, performance
					stats, and links to official specifications. Click any colored node on the graph to begin.
				</p>

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

			<div class="flex flex-col gap-6 p-6">
				<ProtocolHeader {proto} {cat} />

				<!-- Overview -->
				<section>
					<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
						Overview
					</h3>
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
					<CodeExample example={proto.codeExample} color={cat?.color ?? '#FFFFFF'} />
				{/if}

				<PerformanceStats performance={proto.performance} color={cat?.color ?? '#FFFFFF'} />

				<RelatedProtocols connections={proto.connections} />
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
		background: linear-gradient(to right, rgb(15 23 42 / 0.75), rgb(15 23 42 / 0.92) 30%, rgb(15 23 42 / 0.97));
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
</style>
