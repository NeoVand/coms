<script lang="ts">
	import {
		getPioneersForCategory,
		getRfcsForCategory,
		getOutagesForCategory,
		getFrontierForCategory,
		getChaptersForCategory
	} from '$lib/data/index';
	import {
		navigateToPioneer,
		navigateToRfc,
		navigateToOutage,
		navigateToFrontier,
		navigateToBookChapter
	} from '$lib/utils/navigation';
	import { Users, FileText, AlertTriangle, Compass, BookOpen } from 'lucide-svelte';
	import RichText from './inline/RichText.svelte';
	import { parseRichText } from '$lib/utils/text-parser';

	interface Props {
		categoryId: string;
		/** Category accent — used to tint section headers, RFC codes,
		 *  in-the-book chapter chips, etc. */
		color: string;
	}

	let { categoryId, color }: Props = $props();

	const pioneers = $derived(getPioneersForCategory(categoryId));
	const rfcs = $derived(getRfcsForCategory(categoryId));
	const outages = $derived(getOutagesForCategory(categoryId));
	const frontier = $derived(getFrontierForCategory(categoryId));
	const chapters = $derived(getChaptersForCategory(categoryId));

	const hasAnything = $derived(
		pioneers.length > 0 ||
			rfcs.length > 0 ||
			outages.length > 0 ||
			frontier.length > 0 ||
			chapters.length > 0
	);
</script>

{#if hasAnything}
	<div class="flex flex-col gap-5">
		{#if chapters.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<BookOpen size={11} style="color: {color};" />
					In the Book
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each chapters as c (`${c.partId}-${c.chapterId}`)}
						<button
							class="group flex items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-2 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToBookChapter(c.partId, c.chapterId)}
						>
							<span class="shrink-0 font-mono text-[10px] tabular-nums" style="color: {color};"
								>PART {c.partLabel}</span
							>
							<div class="min-w-0 flex-1">
								<div class="text-xs font-medium text-t-primary">{c.chapterTitle}</div>
								{#if c.synopsis}
									<div class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
										<RichText segments={parseRichText(c.synopsis)} {color} />
									</div>
								{/if}
							</div>
							<span
								class="shrink-0 text-t-muted transition-transform group-hover:translate-x-0.5"
								aria-hidden="true">→</span
							>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if pioneers.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Users size={11} style="color: {color};" />
					Pioneers
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each pioneers as p (p.id)}
						<button
							class="group flex items-center gap-2 rounded-lg border border-s-border bg-s-glass px-2.5 py-1.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToPioneer(p.id)}
							title={p.title ?? p.name}
						>
							{#if p.imagePath}
								<img
									src={p.imagePath}
									alt={p.name}
									class="h-7 w-7 shrink-0 rounded-full object-cover"
								/>
							{:else}
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
									style="background-color: {color}20; color: {color};"
								>
									{p.name
										.split(' ')
										.map((s) => s[0])
										.join('')
										.slice(0, 2)}
								</span>
							{/if}
							<span class="text-xs font-medium text-t-primary">{p.name}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if rfcs.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<FileText size={11} style="color: {color};" />
					RFCs
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each rfcs as r (r.number)}
						<button
							class="flex items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-1.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToRfc(r.number)}
						>
							<code class="shrink-0 rounded font-mono text-[11px] font-bold" style="color: {color};"
								>RFC {r.number}</code
							>
							<span class="flex-1 text-xs text-t-primary">{r.title}</span>
							<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{r.year}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if outages.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<AlertTriangle size={11} class="text-orange-400" />
					Famous incidents
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each outages as o (o.id)}
						<button
							class="rounded-lg border border-s-border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToOutage(o.id)}
						>
							<div class="flex items-baseline justify-between gap-2">
								<span class="text-xs font-medium text-t-primary">{o.title}</span>
								<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{o.date}</span>
							</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary italic">
								<RichText segments={parseRichText(o.oneLiner)} {color} />
							</p>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if frontier.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Compass size={11} class="text-violet-400" />
					Frontier (2024-2026)
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each frontier as f (f.id)}
						<button
							class="rounded-lg border border-s-border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToFrontier(f.id)}
						>
							<div class="flex items-baseline justify-between gap-2">
								<span class="text-xs font-medium text-t-primary">{f.title}</span>
								<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{f.date}</span>
							</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary italic">
								<RichText segments={parseRichText(f.oneLiner)} {color} />
							</p>
						</button>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
