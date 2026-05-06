<script lang="ts">
	import { bookParts } from '$lib/data/book/chapters';
	import { navigateToBookChapter } from '$lib/utils/navigation';
	import { BookOpen } from 'lucide-svelte';

	const ACCENT = '#60a5fa'; // sky-400 — same as ChapterView header so the
	// TOC reads as part of the same surface

	/**
	 * Per-part accent colors — must mirror the PART_ACCENTS map in
	 * ChapterView.svelte. Keep them in sync so a part's chapter chip in
	 * the TOC and its chapter title page use the same hue.
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

	function isReady(slots: { kind: string }[]): boolean {
		return slots.length > 0;
	}

	const stats = $derived.by(() => {
		let total = 0;
		let ready = 0;
		for (const part of bookParts) {
			for (const c of part.chapters) {
				total++;
				if (isReady(c.slots)) ready++;
			}
		}
		return { total, ready };
	});

	function partAccent(id: string): string {
		return PART_ACCENTS[id] ?? ACCENT;
	}
</script>

<article class="flex flex-col gap-6">
	<header>
		<div
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
			style="background-color: {ACCENT}20; color: {ACCENT};"
		>
			<BookOpen size={11} />
			The Book of Protocols
		</div>
		<h1
			class="mt-2 text-2xl leading-tight font-bold tracking-tight"
			style="color: {ACCENT};"
		>
			Table of contents
		</h1>
		<p class="mt-2 text-sm leading-relaxed text-t-secondary">
			{bookParts.length} parts, {stats.total} chapters, {stats.ready} live.
			Everything is meant to be readable end-to-end; jump in anywhere.
		</p>
	</header>

	{#each bookParts as part (part.id)}
		{@const accent = partAccent(part.id)}
		<section id="part-{part.id}" class="scroll-mt-4">
			<div class="mb-2 flex items-baseline gap-3 border-b pb-2"
				style="border-color: {accent}40;"
			>
				<span
					class="font-mono text-xs font-bold tracking-wider"
					style="color: {accent};">PART {part.label ?? ''}</span
				>
				<h2 class="text-lg font-bold text-t-primary">{part.title}</h2>
				<span class="ml-auto text-[10px] tabular-nums text-t-muted"
					>{part.chapters.length} ch</span
				>
			</div>
			{#if part.description}
				<p class="mb-3 text-xs leading-relaxed text-t-secondary">{part.description}</p>
			{/if}
			<div class="space-y-1.5">
				{#each part.chapters as chapter, i (chapter.id)}
					{@const ready = isReady(chapter.slots)}
					{#if ready}
						<button
							class="group flex w-full items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-2 text-left transition-all hover:bg-s-glass-hover"
							style="border-color: {accent}30;"
							onclick={() => navigateToBookChapter(part.id, chapter.id)}
						>
							<span
								class="shrink-0 font-mono text-[10px] tabular-nums"
								style="color: {accent};"
								>{(i + 1).toString().padStart(2, '0')}</span
							>
							<div class="min-w-0 flex-1">
								<div class="text-sm font-medium text-t-primary">{chapter.title}</div>
								{#if chapter.synopsis}
									<div class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
										{chapter.synopsis}
									</div>
								{/if}
							</div>
							<span
								class="shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
								style="color: {accent};"
								aria-hidden="true">→</span
							>
						</button>
					{:else}
						<div
							class="flex items-baseline gap-3 rounded-lg border border-dashed border-s-border/60 px-3 py-2"
						>
							<span class="shrink-0 font-mono text-[10px] tabular-nums text-t-muted/60"
								>{(i + 1).toString().padStart(2, '0')}</span
							>
							<div class="min-w-0 flex-1 opacity-70">
								<div class="text-sm text-t-secondary">{chapter.title}</div>
								{#if chapter.synopsis}
									<div class="mt-0.5 text-[11px] leading-relaxed text-t-muted">
										{chapter.synopsis}
									</div>
								{/if}
							</div>
							<span
								class="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-t-muted/70 uppercase"
								style="background-color: rgba(148, 163, 184, 0.1);"
								>Coming soon</span
							>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/each}
</article>
