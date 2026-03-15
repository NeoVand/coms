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
	import { X, Home, Lightbulb, Compass, BookOpen, Microscope } from 'lucide-svelte';
	import ViewTabs from './ViewTabs.svelte';
	import ConceptsView from './ConceptsView.svelte';
	import CategoryAdvancedView from './CategoryAdvancedView.svelte';
	import JourneyListView from './JourneyListView.svelte';
	import JourneyBar from './JourneyBar.svelte';
	import { themedDomColor } from '$lib/utils/colors';

	const appState = getAppState();

	/** Remap a category color for DOM readability in the current theme */
	function dc(c: string): string {
		return themedDomColor(c, appState.theme);
	}
	const allNodes = buildGraphNodes();

	const isMobile = $derived(appState.isMobile);

	let panelWidth = $state(520);
	let isResizing = $state(false);

	// Keep appState in sync so focusOnNode uses the current panel width
	// On mobile (bottom sheet), panel doesn't consume horizontal space
	$effect(() => {
		appState.detailPanelWidth = isMobile ? 0 : panelWidth;
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

{#if isMobile}
	<!-- Mobile backdrop -->
	<button
		class="fixed inset-0 z-40 bg-[var(--theme-overlay)]"
		onclick={() => appState.clearSelection()}
		aria-label="Close panel"
	></button>
{/if}

<div
	class="detail-panel z-50"
	class:detail-panel--desktop={!isMobile}
	class:detail-panel--mobile={isMobile}
	data-tour="detail-panel"
	style={isMobile ? '' : `width: ${panelWidth}px;`}
>
	{#if !isMobile}
		<!-- Resize handle (desktop only) -->
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
	{/if}

	{#if isMobile}
		<!-- Drag handle (mobile only) -->
		<div class="flex justify-center pt-3">
			<div class="h-1 w-8 rounded-full bg-s-border"></div>
		</div>
	{/if}

	<!-- Close button -->
	<button
		class="close-btn absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
		onclick={() => appState.clearSelection()}
		aria-label="Close panel"
	>
		<X size={16} />
	</button>
	<!-- Background layer -->
	<div class="panel-bg pointer-events-none absolute inset-0 shadow-2xl backdrop-blur-xl"></div>
	<!-- Content layer -->
	<div
		class="relative custom-scrollbar flex h-full w-full flex-col overflow-y-auto"
	>
		{#if appState.activeJourney}
			<div class="px-6 pt-4 pb-0">
				<JourneyBar />
			</div>
		{/if}

		{#if selectedData?.type === 'hub'}
			{@const simCount = allProtocols.filter((p) => hasSimulation(p.id)).length}
			<!-- Hub hero (always visible) -->
			<div class="p-6 pb-3">
				<h2 class="text-2xl font-bold tracking-tight text-t-primary">Protocol Lab</h2>
				<p class="mt-2 text-sm leading-relaxed text-t-primary">
					An interactive atlas of <span class="font-semibold text-t-primary">{allProtocols.length} network protocols</span>
					— from the foundational TCP handshake to modern QUIC streams.
				</p>
			</div>

			<!-- Hub tabs -->
			<div class="px-6">
				<ViewTabs
					tabs={[
						{ id: 'home', label: 'Home', icon: Home },
						{ id: 'concepts', label: 'Concepts', icon: Lightbulb },
						{ id: 'journeys', label: 'Journeys', icon: Compass }
					]}
					activeId={appState.hubViewMode}
					color="#FFFFFF"
					onchange={(id) => (appState.hubViewMode = id as 'home' | 'concepts' | 'journeys')}
				/>
			</div>

			{#if appState.hubViewMode === 'home'}
			{@const isLight = appState.theme === 'light'}
			{@const featureCards = [
				{ title: `${simCount} Interactive Simulations`, desc: 'Step through real protocol exchanges — watch TCP three-way handshakes, DNS resolution, TLS negotiations, and more unfold message by message with play, pause, and step controls.', fill: true, d: 'M8 5v14l11-7z', color: isLight ? '#0e7490' : '#22d3ee' },
				{ title: 'Diagrams, Code & Wire Formats', desc: 'Every protocol comes with sequence diagrams, working code in multiple languages, and "On the Wire" views showing actual packet structure and byte layouts.', fill: false, d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: isLight ? '#7c3aed' : '#c084fc' },
				{ title: 'Three Graph Views', desc: 'Switch between Force (physics-based clustering), Radial (concentric rings), and Timeline (chronological from 1969 to today) using the layout picker at the bottom left.', fill: false, d: '', color: isLight ? '#047857' : '#34d399' },
				{ title: 'Stories Behind the Protocols', desc: 'Each category tells the full history — the pioneers who invented TCP/IP, the design battles between reliability and speed, timelines, portraits, and conceptual diagrams.', fill: false, d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: isLight ? '#b45309' : '#fbbf24' },
				{ title: 'Protocol Comparisons', desc: 'Compare protocols side by side — see key differences, when to use each, and how they relate. Switch to the Compare tab on any protocol to explore.', fill: false, d: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: isLight ? '#be185d' : '#fb7185' }
			]}
			<div class="flex flex-col gap-6 p-6">
				<!-- Feature showcase -->
				<section class="space-y-2">
					{#each featureCards as card, ci (ci)}
					<div
						class="rounded-xl border p-3"
						style="border-color: {card.color}15; background-color: {card.color}08;"
					>
						<div class="flex items-start gap-3">
							<span
								class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
								style="background-color: {card.color}15; color: {card.color};"
							>
								{#if ci === 0}
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
								{:else if ci === 2}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<circle cx="12" cy="5" r="2" stroke-width="2"/><circle cx="5" cy="19" r="2" stroke-width="2"/><circle cx="19" cy="19" r="2" stroke-width="2"/>
										<path stroke-width="2" d="M12 7v4M10 13l-3 4M14 13l3 4"/>
									</svg>
								{:else}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={card.d}/>
									</svg>
								{/if}
							</span>
							<div>
								<div class="text-sm font-medium text-t-primary">{card.title}</div>
								<p class="mt-0.5 text-xs text-t-secondary">{card.desc}</p>
							</div>
						</div>
					</div>
					{/each}
				</section>

				<!-- Categories -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">
						Explore by Category
					</h3>
					<div class="space-y-2">
						{#each categories as cat (cat.id)}
							{@const count = allProtocols.filter((p) => p.categoryId === cat.id).length}
							<button
								class="flex w-full items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
								onclick={() => {
									const node = allNodes.find((n) => n.id === cat.id);
									if (node) appState.selectNode(node);
								}}
							>
								<span
									class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
									style="background-color: {dc(cat.color)}20; color: {dc(cat.color)}"
								>
									<CategoryIcon icon={cat.icon} size={18} />
								</span>
								<div>
									<div class="text-sm font-medium text-t-primary">
										{cat.name}
										<span class="ml-1 text-[10px] text-t-muted">{count} protocols</span>
									</div>
									<div class="mt-0.5 text-xs text-t-secondary">{cat.description}</div>
								</div>
							</button>
						{/each}
					</div>
				</section>

				<!-- Quick start -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">
						Quick Start
					</h3>
					<div class="space-y-2 text-xs text-t-secondary">
						<div class="flex items-start gap-2">
							<span class="mt-px text-t-muted">&rsaquo;</span>
							<p><span class="text-t-primary">Click any node</span> to open its deep-dive — overview, sequence diagram, how-it-works steps, code examples, and performance data.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-t-muted">&rsaquo;</span>
							<p><span class="text-t-primary">Switch to Simulate</span> on any protocol to watch its exchange play out step by step.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-t-muted">&rsaquo;</span>
							<p><span class="text-t-primary">Use Compare</span> to see side-by-side differences between protocols — like TCP vs UDP, or how TLS works with HTTP.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-t-muted">&rsaquo;</span>
							<p><span class="text-t-primary">Click a category</span> to read its history, meet the pioneers, and explore conceptual diagrams.</p>
						</div>
						<div class="flex items-start gap-2">
							<span class="mt-px text-t-muted">&rsaquo;</span>
							<p><span class="text-t-primary">Scroll to zoom</span>, drag to pan, and hover for quick summaries. Related protocols stay highlighted.</p>
						</div>
					</div>
				</section>

				<!-- Stats -->
				<section>
					<div class="grid grid-cols-3 gap-3">
						<div class="rounded-lg border border-s-border bg-s-glass p-3 text-center">
							<div class="text-lg font-bold text-t-primary">{allProtocols.length}</div>
							<div class="text-[10px] text-t-muted">Protocols</div>
						</div>
						<div class="rounded-lg border border-s-border bg-s-glass p-3 text-center">
							<div class="text-lg font-bold text-t-primary">{simCount}</div>
							<div class="text-[10px] text-t-muted">Simulations</div>
						</div>
						<div class="rounded-lg border border-s-border bg-s-glass p-3 text-center">
							<div class="text-lg font-bold text-t-primary">50+</div>
							<div class="text-[10px] text-t-muted">Years of History</div>
						</div>
					</div>
				</section>

				<!-- Attribution -->
				<div class="border-t border-s-border pt-4">
					<a
						href="https://github.com/NeoVand/coms"
						target="_blank"
						rel="external noopener noreferrer"
						class="flex items-center justify-center gap-2 text-[11px] text-t-muted transition-colors hover:text-t-secondary"
					>
						<svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
						</svg>
						<span>Developed by Neo Mohsenvand</span>
					</a>
				</div>
			</div>
			{:else if appState.hubViewMode === 'concepts'}
				<div class="p-6">
					<ConceptsView />
				</div>
			{:else if appState.hubViewMode === 'journeys'}
				<div class="p-6">
					<JourneyListView scope="global" />
				</div>
			{/if}
		{:else if selectedData?.type === 'protocol' && selectedData.protocol}
			{@const proto = selectedData.protocol}
			{@const cat = selectedData.category}
			{@const color = dc(cat?.color ?? '#FFFFFF')}

			<div class="flex flex-col gap-0">
				<div class="p-6 pb-3">
					<ProtocolHeader {proto} {cat} {color} />
				</div>

				<div class="px-6">
					<SimulatorTabs {color} />
				</div>

				{#if appState.detailViewMode === 'learn'}
					<div class="flex flex-col gap-6 p-6">
						<!-- Overview -->
						<StoryNarrative text={proto.overview} {color} title="Overview" />

						{#if proto.image}
							<StoryImage
								src={proto.image.src}
								alt={proto.image.alt}
								caption={proto.image.caption}
								credit={proto.image.credit}
								{color}
							/>
						{/if}

						<ProtocolDiagram protocolId={proto.id} {color} />

						<HowItWorksSteps steps={proto.howItWorks} {color} />

						<!-- Use cases -->
						<section>
							<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
								Use Cases
							</h3>
							<ul class="space-y-1.5">
								{#each proto.useCases as useCase, i (i)}
									<li class="flex items-start gap-2 text-sm text-t-primary">
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
							<CodeExample example={proto.codeExample} {color} />
						{/if}

						<PerformanceStats performance={proto.performance} {color} />

						<RelatedProtocols connections={proto.connections} />
					</div>
				{:else if appState.detailViewMode === 'simulate'}
					<div class="p-6">
						{#key proto.id}
							<SimulatorView protocolId={proto.id} {color} />
						{/key}
					</div>
				{:else if appState.detailViewMode === 'compare'}
					<div class="p-6" data-tour="compare-view">
						{#if appState.compareTargetId}
							{@const targetProto = getProtocolById(appState.compareTargetId)}
							{@const pair = getPair(proto.id, appState.compareTargetId)}
							{#if targetProto}
								{#if pair?.type === 'relationship'}
									<RelationshipCard {pair} leftProto={proto} rightProto={targetProto} {color} />
								{:else}
									<ComparisonCard {pair} leftProto={proto} rightProto={targetProto} {color} />
								{/if}
							{/if}
						{:else}
							<ComparisonPicker protocolId={proto.id} {color} />
						{/if}
					</div>
				{/if}
			</div>
		{:else if selectedData?.type === 'category' && selectedData.category}
			{@const cat = selectedData.category}
			{@const protocols = selectedData.protocols}
			{@const story = getCategoryStory(cat.id)}
			{@const color = dc(cat.color)}

			<!-- Category header (always visible) -->
			<div class="p-6 pb-3">
				<div class="flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center" style="color: {color}">
						<CategoryIcon icon={cat.icon} size={28} />
					</span>
					<div>
						<h2 class="text-lg font-bold" style="color: {color}">{cat.name}</h2>
						{#if story}
							<p class="mt-0.5 text-xs text-t-secondary">{story.tagline}</p>

						{/if}
					</div>
				</div>
			</div>

			<!-- Category tabs -->
			<div class="px-6">
				<ViewTabs
					tabs={[
						{ id: 'story', label: 'Story', icon: BookOpen },
						{ id: 'advanced', label: 'Advanced', icon: Microscope },
						{ id: 'journeys', label: 'Journeys', icon: Compass }
					]}
					activeId={appState.categoryViewMode}
					{color}
					onchange={(id) => (appState.categoryViewMode = id as 'story' | 'advanced' | 'journeys')}
				/>
			</div>

			{#if appState.categoryViewMode === 'story'}
				<div class="flex flex-col gap-6 p-6">
					<!-- Story content -->
					{#if story}
						<CategoryStoryView {story} {cat} {color} />
					{/if}

					<!-- Protocols in category -->
					<section>
						<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">
							Protocols ({protocols.length})
						</h3>
						<div class="space-y-2">
							{#each protocols.toSorted((a, b) => a.year - b.year) as proto (proto.id)}
								<button
									class="flex w-full flex-col gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
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
									<div class="flex items-baseline gap-2">
										<span class="text-sm font-medium" style="color: {color}">{proto.abbreviation}</span>
										<span class="text-[10px] text-t-muted">{proto.year}</span>
									</div>
									<div class="text-xs text-t-secondary">{proto.oneLiner}</div>
								</button>
							{/each}
						</div>
					</section>
				</div>
			{:else if appState.categoryViewMode === 'advanced'}
				<div class="p-6">
					<CategoryAdvancedView {cat} {color} />
				</div>
			{:else if appState.categoryViewMode === 'journeys'}
				<div class="p-6">
					<JourneyListView scope={cat.id} {color} />
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* Desktop: right sidebar */
	.detail-panel--desktop {
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		max-width: 90vw;
		min-width: 360px;
		animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	/* Mobile: bottom sheet */
	.detail-panel--mobile {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		max-height: 85vh;
		border-radius: 1rem 1rem 0 0;
		border-top: 1px solid var(--theme-glass-border);
		animation: slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Let the scrollable content area fill remaining space in the mobile flex container */
	.detail-panel--mobile :global(.custom-scrollbar) {
		flex: 1;
		min-height: 0;
		height: auto;
	}

	.detail-panel--desktop .panel-bg {
		background: var(--theme-panel-desktop);
		-webkit-mask-image: linear-gradient(to right, transparent, black 80px);
		mask-image: linear-gradient(to right, transparent, black 80px);
	}

	.detail-panel--mobile .panel-bg {
		background: var(--theme-panel-mobile);
	}

	.resize-handle:hover > div {
		opacity: 1 !important;
	}

	@keyframes slideInRight {
		from {
			transform: translateX(60px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideInUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.close-btn :global(svg) {
		transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.close-btn:hover :global(svg) {
		transform: rotate(90deg);
	}
</style>
