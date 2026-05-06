<script lang="ts">
	import { bookParts } from '$lib/data/book/chapters';
	import { navigateToBookChapter } from '$lib/utils/navigation';
	import { BookOpen } from 'lucide-svelte';

	const ACCENT = '#60a5fa'; // sky-400 — same as ChapterView so the
	// TOC reads as part of the same surface

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
</script>

<article class="flex flex-col gap-8">
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
			{bookParts.length} parts, {stats.total} chapters planned, {stats.ready} live so far.
			Everything is meant to be readable end-to-end; jump in anywhere.
		</p>
	</header>

	{#each bookParts as part (part.id)}
		<section>
			<div class="mb-2 flex items-baseline gap-3 border-b border-s-border pb-2">
				<span
					class="font-mono text-xs font-bold tracking-wider"
					style="color: {ACCENT};">PART {part.label ?? ''}</span
				>
				<h2 class="text-lg font-bold text-t-primary">{part.title}</h2>
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
							onclick={() => navigateToBookChapter(chapter.id)}
						>
							<span
								class="shrink-0 font-mono text-[10px] tabular-nums"
								style="color: {ACCENT};"
								>{(i + 1).toString().padStart(2, '0')}</span
							>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium text-t-primary">{chapter.title}</div>
								{#if chapter.synopsis}
									<div class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
										{chapter.synopsis}
									</div>
								{/if}
							</div>
							<span
								class="shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5 group-hover:text-t-secondary"
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
							<div class="flex-1 min-w-0 opacity-70">
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
