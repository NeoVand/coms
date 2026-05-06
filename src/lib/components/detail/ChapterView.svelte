<script lang="ts">
	import { foundationSections, getFoundationSection } from '$lib/data/concept-foundations';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import StoryCallout from './category-story/StoryCallout.svelte';
	import StoryDiagram from './category-story/StoryDiagram.svelte';
	import StoryImage from './category-story/StoryImage.svelte';
	import StoryTimeline from './category-story/StoryTimeline.svelte';
	import PioneerGrid from './category-story/PioneerGrid.svelte';
	import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-svelte';
	import { navigateToBookChapter, navigateToHubPanel } from '$lib/utils/navigation';

	interface Props {
		chapterId: string;
	}

	let { chapterId }: Props = $props();

	const section = $derived(getFoundationSection(chapterId));

	/** All chapters in book order — used for prev/next navigation. */
	const order = foundationSections;
	const currentIndex = $derived(order.findIndex((s) => s.id === chapterId));
	const prev = $derived(currentIndex > 0 ? order[currentIndex - 1] : null);
	const next = $derived(
		currentIndex >= 0 && currentIndex < order.length - 1 ? order[currentIndex + 1] : null
	);

	/**
	 * Foundation chapters use a single calm chapter accent so the reading
	 * surface stays consistent regardless of which chapter you're in.
	 * Per-category color comes back into play once we surface protocol
	 * chapters and category-specific reading from book/chapters.ts.
	 */
	const CHAPTER_ACCENT = '#60a5fa'; // sky-400
</script>

<article class="flex flex-col gap-6">
	<!-- Breadcrumb / back to book index -->
	<nav class="flex items-center gap-2 text-[11px] text-t-muted">
		<button
			class="flex items-center gap-1 transition-colors hover:text-t-primary"
			onclick={() => navigateToHubPanel()}
		>
			<BookOpen size={11} />
			The Book
		</button>
		<span>·</span>
		<span>Part I — Foundations</span>
		<span>·</span>
		<span class="text-t-secondary">Chapter {currentIndex + 1} of {order.length}</span>
	</nav>

	{#if section}
		<!-- Chapter title -->
		<header>
			<div class="text-[11px] font-semibold tracking-wider text-t-muted uppercase">
				Chapter {currentIndex + 1}
			</div>
			<h1
				class="mt-1 text-2xl leading-tight font-bold tracking-tight text-t-primary"
				style="color: {CHAPTER_ACCENT};"
			>
				{section.title}
			</h1>
		</header>

		<!-- Chapter body — render every story section in document order. -->
		<div class="flex flex-col gap-5">
			{#each section.sections as storySection, i (`${section.id}-${i}`)}
				{#if storySection.type === 'narrative'}
					<StoryNarrative
						text={storySection.text}
						color={CHAPTER_ACCENT}
						title={storySection.title}
					/>
				{:else if storySection.type === 'callout'}
					<StoryCallout
						title={storySection.title}
						text={storySection.text}
						color={CHAPTER_ACCENT}
					/>
				{:else if storySection.type === 'diagram'}
					<StoryDiagram
						definition={storySection.definition}
						caption={storySection.caption}
						color={CHAPTER_ACCENT}
						title={storySection.title}
					/>
				{:else if storySection.type === 'image'}
					<StoryImage
						src={storySection.src}
						alt={storySection.alt}
						caption={storySection.caption}
						credit={storySection.credit}
						color={CHAPTER_ACCENT}
						title={storySection.title}
					/>
				{:else if storySection.type === 'timeline'}
					<StoryTimeline entries={storySection.entries} color={CHAPTER_ACCENT} />
				{:else if storySection.type === 'pioneers'}
					<PioneerGrid
						people={storySection.people}
						color={CHAPTER_ACCENT}
						title={storySection.title}
					/>
				{/if}
			{/each}
		</div>

		<!-- Prev / next chapter navigation -->
		<nav class="mt-2 grid grid-cols-2 gap-3 border-t border-s-border pt-4">
			{#if prev}
				<button
					class="group flex flex-col items-start gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:border-s-border hover:bg-s-glass-hover"
					onclick={() => navigateToBookChapter(prev.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						<ChevronLeft size={10} />
						Previous
					</span>
					<span class="text-sm font-medium text-t-primary group-hover:text-t-primary"
						>{prev.title}</span
					>
				</button>
			{:else}
				<div></div>
			{/if}
			{#if next}
				<button
					class="group flex flex-col items-end gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-right transition-all hover:border-s-border hover:bg-s-glass-hover"
					onclick={() => navigateToBookChapter(next.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						Next
						<ChevronRight size={10} />
					</span>
					<span class="text-sm font-medium text-t-primary">{next.title}</span>
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
