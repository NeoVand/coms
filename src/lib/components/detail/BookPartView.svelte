<script lang="ts">
	import { bookParts, bookPartMap } from '$lib/data/book/chapters';
	import {
		navigateToBookChapter,
		navigateToHubPanel,
		navigateToBookPart
	} from '$lib/utils/navigation';
	import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-svelte';
	import RichText from './inline/RichText.svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		partId: string;
	}

	let { partId }: Props = $props();

	const appState = getAppState();

	/**
	 * Per-part accent colors — must mirror the maps in BookTocView and
	 * ChapterView so the visual identity is consistent everywhere.
	 */
	const PART_ACCENTS: Record<string, string> = {
		foundations: '#60a5fa',
		'story-of-the-internet': '#fbbf24',
		'layer-2-3': '#22d3ee',
		transport: '#34d399',
		'web-api': '#a78bfa',
		'async-iot': '#f472b6',
		'realtime-av': '#fb7185',
		'utilities-security': '#facc15',
		'patterns-failures': '#f97316',
		'famous-outages': '#fb923c',
		frontier: '#a78bfa',
		'how-to-learn-more': '#94a3b8'
	};

	const part = $derived(bookPartMap.get(partId));
	const accentRaw = $derived(PART_ACCENTS[partId] ?? '#60a5fa');
	const accent = $derived(themedDomColor(accentRaw, appState.theme));

	const partIndex = $derived(bookParts.findIndex((p) => p.id === partId));
	const prevPart = $derived(partIndex > 0 ? bookParts[partIndex - 1] : null);
	const nextPart = $derived(
		partIndex >= 0 && partIndex < bookParts.length - 1 ? bookParts[partIndex + 1] : null
	);

	function isReady(slots: { kind: string }[]): boolean {
		return slots.length > 0;
	}
</script>

<article class="flex flex-col gap-6">
	<!-- Breadcrumb back to the home view -->
	<nav class="flex items-center gap-2 text-[11px] text-t-muted">
		<button
			class="flex items-center gap-1 transition-colors hover:text-t-primary"
			onclick={() => navigateToHubPanel()}
		>
			<BookOpen size={11} />
			The Book
		</button>
		<span>·</span>
		<span style="color: {accent};">Part {part?.label ?? '?'}</span>
	</nav>

	{#if part}
		<!-- Part header -->
		<header>
			<div
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
				style="background-color: {accent}20; color: {accent};"
			>
				Part {part.label ?? ''}
			</div>
			<h1 class="mt-2 text-2xl leading-tight font-bold tracking-tight" style="color: {accent};">
				{part.title}
			</h1>
			{#if part.description}
				<p class="mt-2 text-sm leading-relaxed text-t-secondary">
					<RichText segments={parseRichText(part.description)} color={accent} />
				</p>
			{/if}
		</header>

		<!-- Chapter list -->
		<div class="space-y-1.5">
			{#each part.chapters as chapter, i (chapter.id)}
				{@const ready = isReady(chapter.slots)}
				{#if ready}
					<button
						class="group flex w-full items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-2.5 text-left transition-all hover:bg-s-glass-hover"
						style="border-color: {accent}30;"
						onclick={() => navigateToBookChapter(part.id, chapter.id)}
					>
						<span class="shrink-0 font-mono text-[10px] tabular-nums" style="color: {accent};"
							>{(i + 1).toString().padStart(2, '0')}</span
						>
						<div class="min-w-0 flex-1">
							<div class="text-sm font-medium text-t-primary">{chapter.title}</div>
							{#if chapter.synopsis}
								<div class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
									<RichText segments={parseRichText(chapter.synopsis)} color={accent} />
								</div>
							{/if}
						</div>
						<span
							class="shrink-0 transition-transform group-hover:translate-x-0.5"
							style="color: {accent};"
							aria-hidden="true">→</span
						>
					</button>
				{:else}
					<div
						class="flex items-baseline gap-3 rounded-lg border border-dashed border-s-border/60 px-3 py-2.5"
					>
						<span class="shrink-0 font-mono text-[10px] text-t-muted/60 tabular-nums"
							>{(i + 1).toString().padStart(2, '0')}</span
						>
						<div class="min-w-0 flex-1 opacity-70">
							<div class="text-sm text-t-secondary">{chapter.title}</div>
							{#if chapter.synopsis}
								<div class="mt-0.5 text-[11px] leading-relaxed text-t-muted">
									<RichText segments={parseRichText(chapter.synopsis)} color={accent} />
								</div>
							{/if}
						</div>
						<span
							class="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-t-muted/70 uppercase"
							style="background-color: rgba(148, 163, 184, 0.1);">Coming soon</span
						>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Prev / next part -->
		<nav class="mt-2 grid grid-cols-2 gap-3 border-t border-s-border pt-4">
			{#if prevPart}
				<button
					class="group flex flex-col items-start gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
					onclick={() => navigateToBookPart(prevPart.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						<ChevronLeft size={10} />
						Previous · Part {prevPart.label ?? ''}
					</span>
					<span class="text-sm font-medium text-t-primary">{prevPart.title}</span>
				</button>
			{:else}
				<div></div>
			{/if}
			{#if nextPart}
				<button
					class="group flex flex-col items-end gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-right transition-all hover:bg-s-glass-hover"
					onclick={() => navigateToBookPart(nextPart.id)}
				>
					<span class="flex items-center gap-1 text-[10px] tracking-wider text-t-muted uppercase">
						Next · Part {nextPart.label ?? ''}
						<ChevronRight size={10} />
					</span>
					<span class="text-sm font-medium text-t-primary">{nextPart.title}</span>
				</button>
			{:else}
				<div></div>
			{/if}
		</nav>
	{:else}
		<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
			<p class="text-sm text-t-secondary">Part not found.</p>
			<button class="mt-2 text-xs text-sky-400 hover:underline" onclick={() => navigateToHubPanel()}
				>← Back home</button
			>
		</div>
	{/if}
</article>
