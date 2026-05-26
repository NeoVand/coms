<script lang="ts">
	import { getChapter, listChapters, bookPartMap } from '$lib/data/book/chapters';
	import { getFoundationSection } from '$lib/data/concept-foundations';
	import { getProtocolById, getProtocolColor } from '$lib/data';
	import { getPioneerById } from '$lib/data/pioneers';
	import { getOutageById } from '$lib/data/outages';
	import { getFrontierById } from '$lib/data/frontier';
	import { getRfcByNumber } from '$lib/data/rfcs';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import RichText from './inline/RichText.svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import StoryCallout from './category-story/StoryCallout.svelte';
	import StoryDiagram from './category-story/StoryDiagram.svelte';
	import StoryImage from './category-story/StoryImage.svelte';
	import StoryTimeline from './category-story/StoryTimeline.svelte';
	import PioneerGrid from './category-story/PioneerGrid.svelte';
	import {
		ChevronLeft,
		ChevronRight,
		BookOpen,
		ArrowRight,
		PlayCircle,
		Users,
		AlertTriangle,
		Compass,
		FileText,
		ArrowLeftRight
	} from 'lucide-svelte';
	import {
		navigateToBookChapter,
		navigateToBookPart,
		navigateToHubPanel,
		navigateToProtocol,
		navigateToPioneer,
		navigateToOutage,
		navigateToFrontier,
		navigateToRfc
	} from '$lib/utils/navigation';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		partId: string;
		chapterId: string;
	}

	let { partId, chapterId }: Props = $props();

	const appState = getAppState();

	const chapter = $derived(getChapter(partId, chapterId));
	const part = $derived(bookPartMap.get(partId));

	/** Flat chapter list across the whole book — used for prev/next nav. */
	const allChapters = $derived(listChapters());
	const currentIndex = $derived(
		allChapters.findIndex((c) => c.part.id === partId && c.chapter.id === chapterId)
	);
	const prev = $derived(currentIndex > 0 ? allChapters[currentIndex - 1] : null);
	const next = $derived(
		currentIndex >= 0 && currentIndex < allChapters.length - 1
			? allChapters[currentIndex + 1]
			: null
	);

	/**
	 * Each part has its own accent color. Foundations stays sky (calm
	 * reading); other parts pick up tones tuned to the topic.
	 */
	const PART_ACCENTS: Record<string, string> = {
		foundations: '#60a5fa', // sky-400 — calm
		'story-of-the-internet': '#fbbf24', // amber — historical
		'layer-2-3': '#22d3ee', // cyan — fabric
		transport: '#34d399', // emerald — reliability
		'web-api': '#a78bfa', // violet — application
		'async-iot': '#f472b6', // pink — async
		'realtime-av': '#fb7185', // rose — live
		'utilities-security': '#facc15', // yellow — keys & infra
		'patterns-failures': '#f97316', // orange — sharp edges
		'famous-outages': '#fb923c', // orange-light — incidents
		frontier: '#a78bfa', // violet — future
		'how-to-learn-more': '#94a3b8' // slate — index
	};
	// Raw accent stays the dark-mode neon hex (used downstream by inline
	// link components that already theme themselves). ACCENT is the
	// themed colour used directly in inline `style="color: ..."` slots
	// throughout this view so the chapter is readable in light mode.
	const ACCENT_RAW = $derived(PART_ACCENTS[partId] ?? '#60a5fa');
	const ACCENT = $derived(themedDomColor(ACCENT_RAW, appState.theme));

	function partLabel(id: string): string {
		const p = bookPartMap.get(id);
		return p?.label ? `Part ${p.label}` : (p?.title ?? '');
	}
</script>

<article class="flex flex-col gap-6">
	<!-- Breadcrumb / back to book index -->
	<nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-t-muted">
		<button
			class="flex items-center gap-1 transition-colors hover:text-t-primary"
			onclick={() => navigateToHubPanel()}
		>
			<BookOpen size={11} />
			The Book
		</button>
		<span>·</span>
		<button
			class="transition-colors hover:text-t-primary"
			style="color: {ACCENT};"
			onclick={() => navigateToBookPart(partId)}
		>
			{partLabel(partId)}{#if part} — {part.title}{/if}
		</button>
		{#if currentIndex >= 0}
			<span>·</span>
			<span class="text-t-secondary">Chapter {currentIndex + 1} of {allChapters.length}</span>
		{/if}
	</nav>

	{#if chapter}
		<!-- Chapter title -->
		<header>
			<div class="text-[11px] font-semibold tracking-wider text-t-muted uppercase">
				{partLabel(partId)} — {part?.title ?? ''}
			</div>
			<h1
				class="mt-1 text-2xl leading-tight font-bold tracking-tight text-t-primary"
				style="color: {ACCENT};"
			>
				{chapter.title}
			</h1>
			{#if chapter.synopsis}
				<p class="mt-2 text-sm leading-relaxed text-t-secondary">
					<RichText segments={parseRichText(chapter.synopsis)} color={ACCENT} />
				</p>
			{/if}
		</header>

		<!-- Slots — every chapter is a list of slots; each kind has a renderer. -->
		<div class="flex flex-col gap-5">
			{#each chapter.slots as slot, i (`${chapterId}-${i}`)}
				{#if slot.kind === 'concept-section'}
					{@const section = getFoundationSection(slot.id)}
					{#if section}
						{#each section.sections as storySection, j (`${slot.id}-${j}`)}
							{#if storySection.type === 'narrative'}
								<StoryNarrative
									text={storySection.text}
									color={ACCENT}
									title={storySection.title}
								/>
							{:else if storySection.type === 'callout'}
								<StoryCallout
									title={storySection.title}
									text={storySection.text}
									color={ACCENT}
								/>
							{:else if storySection.type === 'diagram'}
								<StoryDiagram
									definition={storySection.definition}
									caption={storySection.caption}
									color={ACCENT}
									title={storySection.title}
								/>
							{:else if storySection.type === 'image'}
								<StoryImage
									src={storySection.src}
									alt={storySection.alt}
									caption={storySection.caption}
									credit={storySection.credit}
									color={ACCENT}
									title={storySection.title}
								/>
							{:else if storySection.type === 'timeline'}
								<StoryTimeline entries={storySection.entries} color={ACCENT} />
							{:else if storySection.type === 'pioneers'}
								<PioneerGrid
									people={storySection.people}
									color={ACCENT}
									title={storySection.title}
								/>
							{/if}
						{/each}
					{/if}
				{:else if slot.kind === 'prose'}
					{#each slot.sections as storySection, j (`prose-${i}-${j}`)}
						{#if storySection.type === 'narrative'}
							<StoryNarrative
								text={storySection.text}
								color={ACCENT}
								title={storySection.title}
							/>
						{:else if storySection.type === 'callout'}
							<StoryCallout
								title={storySection.title}
								text={storySection.text}
								color={ACCENT}
							/>
						{:else if storySection.type === 'diagram'}
							<StoryDiagram
								definition={storySection.definition}
								caption={storySection.caption}
								color={ACCENT}
								title={storySection.title}
							/>
						{:else if storySection.type === 'image'}
							<StoryImage
								src={storySection.src}
								alt={storySection.alt}
								caption={storySection.caption}
								credit={storySection.credit}
								color={ACCENT}
								title={storySection.title}
							/>
						{:else if storySection.type === 'timeline'}
							<StoryTimeline entries={storySection.entries} color={ACCENT} />
						{:else if storySection.type === 'pioneers'}
							<PioneerGrid
								people={storySection.people}
								color={ACCENT}
								title={storySection.title}
							/>
						{/if}
					{/each}
				{:else if slot.kind === 'pull-quote'}
					<aside
						class="my-2 border-l-2 pl-4"
						style="border-color: {ACCENT};"
					>
						<blockquote
							class="text-base leading-relaxed font-medium text-t-primary italic"
							style="color: {ACCENT};"
						>
							"<RichText segments={parseRichText(slot.text)} color={ACCENT} />"
						</blockquote>
						{#if slot.attribution}
							<div class="mt-1 text-[11px] tracking-wide text-t-muted">
								— {slot.attribution}
							</div>
						{/if}
					</aside>
				{:else if slot.kind === 'protocol'}
					{@const proto = getProtocolById(slot.id)}
					{#if proto}
						{@const pc = getProtocolColor(proto.id, appState.theme, ACCENT)}
						<button
							class="group flex items-start gap-3 rounded-xl border bg-s-glass p-3.5 text-left transition-all hover:bg-s-glass-hover"
							style="border-color: {pc}40;"
							onclick={() => navigateToProtocol(proto.id)}
						>
							<span
								class="shrink-0 rounded-lg px-2 py-1 font-mono text-[11px] font-bold"
								style="background-color: {pc}1f; color: {pc};"
							>
								{proto.abbreviation ?? proto.id.toUpperCase()}
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex items-baseline gap-2">
									<div class="text-sm font-semibold text-t-primary">{proto.name}</div>
									<div class="text-[10px] tracking-wider text-t-muted uppercase">
										open protocol
									</div>
								</div>
								<div
									class="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-t-secondary"
								>
									<RichText segments={parseRichText(proto.oneLiner)} color={ACCENT} />
								</div>
							</div>
							<ArrowRight
								size={14}
								class="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
								style="color: {pc};"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'simulation'}
					{@const proto = getProtocolById(slot.protocolId)}
					{#if proto}
						{@const pc = getProtocolColor(proto.id, appState.theme, ACCENT)}
						<button
							class="group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:bg-s-glass-hover"
							style="border-color: {pc}66; background-color: {pc}10;"
							onclick={() => {
								appState.detailViewMode = 'simulate';
								navigateToProtocol(proto.id);
							}}
						>
							<PlayCircle size={28} style="color: {pc};" />
							<div class="min-w-0 flex-1">
								<div class="text-[10px] font-semibold tracking-wider uppercase" style="color: {pc};">
									Try the simulation
								</div>
								<div class="text-sm font-semibold text-t-primary">
									Run the {proto.abbreviation ?? proto.name} sequence
								</div>
								<div class="mt-0.5 text-[12px] leading-relaxed text-t-secondary">
									Step through the wire-level exchange packet by packet.
								</div>
							</div>
							<ArrowRight
								size={14}
								class="shrink-0 transition-transform group-hover:translate-x-0.5"
								style="color: {pc};"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'outage'}
					{@const outage = getOutageById(slot.id)}
					{#if outage}
						<button
							class="group flex items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToOutage(outage.id)}
						>
							<AlertTriangle size={20} class="mt-0.5 shrink-0" style="color: #fb923c;" />
							<div class="min-w-0 flex-1">
								<div class="flex items-baseline gap-2">
									<div class="text-[10px] font-semibold tracking-wider uppercase" style="color: #fb923c;">
										Famous outage · {outage.date ?? ''}
									</div>
								</div>
								<div class="text-sm font-semibold text-t-primary">{outage.title}</div>
								<div class="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-t-secondary">
									<RichText segments={parseRichText(outage.oneLiner)} color={ACCENT} />
								</div>
							</div>
							<ArrowRight
								size={14}
								class="mt-1 shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'pioneer'}
					{@const pioneer = getPioneerById(slot.id)}
					{#if pioneer}
						<button
							class="group flex items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToPioneer(pioneer.id)}
						>
							{#if pioneer.imagePath}
								<img
									src={pioneer.imagePath}
									alt={pioneer.name}
									class="h-12 w-12 shrink-0 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
									style="background-color: {ACCENT}20; color: {ACCENT};"
								>
									{pioneer.name
										.split(' ')
										.map((n) => n[0])
										.join('')}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<div class="text-[10px] font-semibold tracking-wider text-t-muted uppercase">
									<Users size={10} class="inline" />
									Pioneer · {pioneer.years}
								</div>
								<div class="text-sm font-semibold text-t-primary">{pioneer.name}</div>
								<div class="mt-0.5 text-[12px] leading-relaxed text-t-secondary">
									{pioneer.title}
								</div>
							</div>
							<ArrowRight
								size={14}
								class="mt-1 shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'frontier'}
					{@const fe = getFrontierById(slot.id)}
					{#if fe}
						<button
							class="group flex items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToFrontier(fe.id)}
						>
							<Compass size={20} class="mt-0.5 shrink-0" style="color: #a78bfa;" />
							<div class="min-w-0 flex-1">
								<div class="text-[10px] font-semibold tracking-wider uppercase" style="color: #a78bfa;">
									Frontier · {fe.status}
								</div>
								<div class="text-sm font-semibold text-t-primary">{fe.title}</div>
								<div class="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-t-secondary">
									<RichText segments={parseRichText(fe.oneLiner)} color={ACCENT} />
								</div>
							</div>
							<ArrowRight
								size={14}
								class="mt-1 shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'rfc'}
					{@const rfc = getRfcByNumber(slot.number)}
					{#if rfc}
						<button
							class="group flex items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToRfc(rfc.number)}
						>
							<FileText size={20} class="mt-0.5 shrink-0" style="color: {ACCENT};" />
							<div class="min-w-0 flex-1">
								<div class="text-[10px] font-semibold tracking-wider uppercase" style="color: {ACCENT};">
									RFC {rfc.number} · {rfc.year}
								</div>
								<div class="text-sm font-semibold text-t-primary">{rfc.title}</div>
								<div class="mt-0.5 text-[11px] tracking-wide text-t-muted">
									{rfc.status}{#if rfc.authors}
										 · {rfc.authors}{/if}
								</div>
							</div>
							<ArrowRight
								size={14}
								class="mt-1 shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
							/>
						</button>
					{/if}
				{:else if slot.kind === 'comparison'}
					{@const a = getProtocolById(slot.pairIds[0])}
					{@const b = getProtocolById(slot.pairIds[1])}
					{#if a && b}
						{@const ac = getProtocolColor(a.id, appState.theme, ACCENT)}
						{@const bc = getProtocolColor(b.id, appState.theme, ACCENT)}
						<div
							class="rounded-xl border p-3.5"
							style="border-color: {ACCENT}66; background-color: {ACCENT}08;"
						>
							<div class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase" style="color: {ACCENT};">
								<ArrowLeftRight size={11} />
								Compare
							</div>
							<div class="grid grid-cols-2 gap-2">
								<button
									class="rounded-lg border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
									style="border-color: {ac}40;"
									onclick={() => navigateToProtocol(a.id)}
								>
									<div class="font-mono text-[10px] font-bold" style="color: {ac};">
										{a.abbreviation ?? a.id.toUpperCase()}
									</div>
									<div class="text-xs font-semibold text-t-primary">{a.name}</div>
								</button>
								<button
									class="rounded-lg border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
									style="border-color: {bc}40;"
									onclick={() => navigateToProtocol(b.id)}
								>
									<div class="font-mono text-[10px] font-bold" style="color: {bc};">
										{b.abbreviation ?? b.id.toUpperCase()}
									</div>
									<div class="text-xs font-semibold text-t-primary">{b.name}</div>
								</button>
							</div>
						</div>
					{/if}
				{/if}
			{/each}

			{#if chapter.slots.length === 0}
				<div class="rounded-xl border border-dashed border-s-border bg-s-glass/50 p-6 text-center">
					<p class="text-sm text-t-secondary">This chapter is still being written.</p>
					<button
						class="mt-2 text-xs hover:underline"
						style="color: {ACCENT};"
						onclick={() => navigateToHubPanel()}
					>
						← Back to The Book
					</button>
				</div>
			{/if}
		</div>

		<!-- Prev / next chapter navigation across the whole book -->
		<nav class="mt-2 grid grid-cols-2 gap-3 border-t border-s-border pt-4">
			{#if prev}
				<button
					class="group flex flex-col items-start gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
					onclick={() => navigateToBookChapter(prev.part.id, prev.chapter.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						<ChevronLeft size={10} />
						Previous · {prev.part.label ? `Part ${prev.part.label}` : ''}
					</span>
					<span class="text-sm font-medium text-t-primary group-hover:text-t-primary"
						>{prev.chapter.title}</span
					>
				</button>
			{:else}
				<div></div>
			{/if}
			{#if next}
				<button
					class="group flex flex-col items-end gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-right transition-all hover:border-s-border hover:bg-s-glass-hover"
					onclick={() => navigateToBookChapter(next.part.id, next.chapter.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						Next · {next.part.label ? `Part ${next.part.label}` : ''}
						<ChevronRight size={10} />
					</span>
					<span class="text-sm font-medium text-t-primary">{next.chapter.title}</span>
				</button>
			{:else}
				<div></div>
			{/if}
		</nav>
	{:else}
		<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
			<p class="text-sm text-t-secondary">Chapter not found.</p>
			<button class="mt-2 text-xs text-sky-400 hover:underline" onclick={() => navigateToHubPanel()}
				>← Back to The Book</button
			>
		</div>
	{/if}
</article>
