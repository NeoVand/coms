<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import {
		getProtocolById,
		getCategoryById,
		getProtocolsForCategory,
		allProtocols
	} from '$lib/data/index';
	import { categories } from '$lib/data/categories';
	import {
		navigateToProtocol,
		navigateToCategory,
		navigateToHub,
		navigateToBookChapter
	} from '$lib/utils/navigation';
	import { foundationSections } from '$lib/data/concept-foundations';
	import GlossaryView from './GlossaryView.svelte';
	import ChapterView from './ChapterView.svelte';
	import PioneerView from './PioneerView.svelte';
	import RfcView from './RfcView.svelte';
	import OutageView from './OutageView.svelte';
	import FrontierView from './FrontierView.svelte';

	/**
	 * Hand-written teasers for the Foundation chapter cards on the Home
	 * tab. Each gives the reader a one-line reason to click in. Order
	 * matches `foundationSections` so we can zip them together.
	 */
	const FOUNDATION_TEASERS: Record<string, string> = {
		'what-is-a-protocol':
			'What a protocol is, and why every machine on the planet agrees to follow them.',
		'layer-model':
			'Seven layers, the standards war that decided their fate, and where the layers blur.',
		addressing: 'How a packet finds your laptop — hostnames, IPs, MACs, and ports.',
		packets: 'Encapsulation in pictures — frames inside packets inside segments.',
		'ports-sockets': 'How one machine runs a hundred services without confusing them.',
		'reliability-speed': 'The defining tradeoff: TCP vs UDP, and why QUIC tries to have both.',
		'client-server-p2p': 'Two communication patterns and what each makes easy or hard.',
		'encryption-basics': "What HTTPS actually protects — and what it doesn't.",
		'ai-protocols': 'MCP and A2A — the new layer of protocols designed for AI agents.'
	};
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
	// Concepts/foundation accordion is gone; the Glossary tab now uses
	// GlossaryView (searchable atomic-term reference). Foundation
	// chapters live behind /book/foundations/[id] and render via
	// ChapterView when activeBookChapter is set.
	import CategoryAdvancedView from './CategoryAdvancedView.svelte';
	import JourneyListView from './JourneyListView.svelte';
	import JourneyBar from './JourneyBar.svelte';
	import { themedDomColor } from '$lib/utils/colors';

	const appState = getAppState();

	/** Remap a category color for DOM readability in the current theme */
	function dc(c: string): string {
		return themedDomColor(c, appState.theme);
	}

	const isMobile = $derived(appState.isMobile);

	let panelWidth = $state(520);
	let isResizing = $state(false);
	let scrollerEl: HTMLDivElement | undefined = $state();

	// Keep appState in sync so focusOnNode uses the current panel width
	// On mobile (bottom sheet), panel doesn't consume horizontal space
	$effect(() => {
		appState.detailPanelWidth = isMobile ? 0 : panelWidth;
	});

	// Reset scroll to top whenever the selection or the active tab changes,
	// so opening a new node never inherits a stale scroll position from
	// the previous one.
	$effect(() => {
		// track these so the effect re-runs on change
		const _id = appState.selectedNode?.id;
		const _view = appState.detailViewMode;
		const _chapter = appState.activeBookChapter;
		const _pioneer = appState.activePioneer;
		const _rfc = appState.activeRfc;
		const _outage = appState.activeOutage;
		const _frontier = appState.activeFrontier;
		void _id;
		void _view;
		void _chapter;
		void _pioneer;
		void _rfc;
		void _outage;
		void _frontier;
		if (scrollerEl) scrollerEl.scrollTop = 0;
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
		onclick={() => navigateToHub()}
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
			<div
				class="absolute top-1/2 left-0.5 h-8 w-1 -translate-y-1/2 rounded-full bg-slate-600 opacity-0 transition-opacity"
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
		onclick={() => navigateToHub()}
		aria-label="Close panel"
	>
		<X size={16} />
	</button>
	<!-- Background layer -->
	<div class="panel-bg pointer-events-none absolute inset-0 shadow-2xl backdrop-blur-xl"></div>
	<!-- Content layer -->
	<div
		class="custom-scrollbar relative flex h-full w-full flex-col overflow-y-auto"
		bind:this={scrollerEl}
	>
		{#if appState.activeJourney}
			<div class="px-6 pt-4 pb-0">
				<JourneyBar />
			</div>
		{/if}

		{#if appState.activeBookChapter}
			<div class="p-6">
				<ChapterView chapterId={appState.activeBookChapter} />
			</div>
		{:else if appState.activePioneer}
			<div class="p-6">
				<PioneerView pioneerId={appState.activePioneer} />
			</div>
		{:else if appState.activeRfc}
			<div class="p-6">
				<RfcView number={appState.activeRfc} />
			</div>
		{:else if appState.activeOutage}
			<div class="p-6">
				<OutageView id={appState.activeOutage} />
			</div>
		{:else if appState.activeFrontier}
			<div class="p-6">
				<FrontierView id={appState.activeFrontier} />
			</div>
		{:else if selectedData?.type === 'hub'}
			{@const simCount = allProtocols.filter((p) => hasSimulation(p.id)).length}
			<!-- Hub hero (always visible) -->
			<div class="p-6 pb-3">
				<h2 class="text-2xl font-bold tracking-tight text-t-primary">The Book of Protocols</h2>
				<p class="mt-2 text-sm leading-relaxed text-t-primary">
					An interactive atlas of <span class="font-semibold text-t-primary"
						>{allProtocols.length} network protocols</span
					>
					— from Bob Metcalfe's 1973 napkin sketch of Ethernet to the post-quantum TLS handshakes of 2026.
					Read it as a book, click around as a graph, or run any protocol as a live simulation.
				</p>
			</div>

			<!-- Hub tabs -->
			<div class="px-6">
				<ViewTabs
					tabs={[
						{ id: 'home', label: 'Home', icon: Home },
						{ id: 'glossary', label: 'Glossary', icon: Lightbulb },
						{ id: 'journeys', label: 'Journeys', icon: Compass }
					]}
					activeId={appState.hubViewMode}
					color="#FFFFFF"
					onchange={(id) => (appState.hubViewMode = id as 'home' | 'glossary' | 'journeys')}
				/>
			</div>

			{#if appState.hubViewMode === 'home'}
				<div class="flex flex-col gap-6 p-6">
					<!-- Begin reading — Foundations -->
					<section>
						<div class="mb-3 flex items-baseline justify-between gap-3">
							<h3 class="text-xs font-semibold tracking-wider text-t-muted uppercase">
								Begin reading — Part I
							</h3>
							<span class="text-[10px] text-t-muted">{foundationSections.length} chapters</span>
						</div>
						<p class="mb-3 text-xs leading-relaxed text-t-secondary">
							The foundations every networking conversation builds on. Each chapter is a
							self-contained read with diagrams, history, and the protocols that bring it to life.
						</p>
						<div class="space-y-2">
							{#each foundationSections as section, i (section.id)}
								<button
									class="group flex w-full items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
									onclick={() => navigateToBookChapter(section.id)}
								>
									<span
										class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-s-glass text-[11px] font-bold text-t-secondary transition-colors group-hover:text-t-primary"
									>
										{i + 1}
									</span>
									<div class="min-w-0 flex-1">
										<div class="text-sm font-medium text-t-primary">{section.title}</div>
										<p class="mt-0.5 text-xs leading-relaxed text-t-secondary">
											{FOUNDATION_TEASERS[section.id] ?? ''}
										</p>
									</div>
									<span
										class="mt-1 text-t-muted transition-transform group-hover:translate-x-0.5 group-hover:text-t-secondary"
										aria-hidden="true">→</span
									>
								</button>
							{/each}
						</div>
					</section>

					<!-- Categories -->
					<section>
						<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">
							Browse by category
						</h3>
						<p class="mb-3 text-xs leading-relaxed text-t-secondary">
							Each category is its own slice of the stack — the foundations underneath, the pioneers
							behind it, and the protocols that compete for the same job.
						</p>
						<div class="space-y-2">
							{#each categories as cat (cat.id)}
								{@const count = allProtocols.filter((p) => p.categoryId === cat.id).length}
								<button
									class="flex w-full items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
									onclick={() => navigateToCategory(cat.id)}
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

					<!-- Compact stats footer -->
					<section
						class="flex items-center justify-between rounded-lg border border-s-border bg-s-glass px-4 py-2.5"
					>
						<div class="flex items-baseline gap-1.5">
							<span class="text-sm font-bold text-t-primary">{allProtocols.length}</span>
							<span class="text-[10px] text-t-muted">protocols</span>
						</div>
						<div class="h-3 w-px bg-s-border"></div>
						<div class="flex items-baseline gap-1.5">
							<span class="text-sm font-bold text-t-primary">{simCount}</span>
							<span class="text-[10px] text-t-muted">simulations</span>
						</div>
						<div class="h-3 w-px bg-s-border"></div>
						<div class="flex items-baseline gap-1.5">
							<span class="text-sm font-bold text-t-primary">50+</span>
							<span class="text-[10px] text-t-muted">years of history</span>
						</div>
					</section>
				</div>
			{:else if appState.hubViewMode === 'glossary'}
				<div class="p-6">
					<GlossaryView />
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
									onclick={() => navigateToProtocol(proto.id)}
								>
									<div class="flex items-baseline gap-2">
										<span class="text-sm font-medium" style="color: {color}"
											>{proto.abbreviation}</span
										>
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

	/* Mobile: bottom sheet anchored just below the header */
	.detail-panel--mobile {
		position: fixed;
		inset-inline: 0;
		top: calc(env(safe-area-inset-top) + 3.5rem);
		bottom: 0;
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
