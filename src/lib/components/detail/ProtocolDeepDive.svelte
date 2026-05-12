<script lang="ts">
	import type { Protocol } from '$lib/data/types';
	import { Calendar, Sparkles, Building2, Lightbulb } from 'lucide-svelte';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import RichText from './inline/RichText.svelte';
	import { parseRichText } from '$lib/utils/text-parser';

	interface Props {
		proto: Protocol;
		color: string;
	}

	let { proto, color }: Props = $props();

	const hasAnything = $derived(
		(proto.recentChanges?.length ?? 0) > 0 ||
			(proto.realWorldDeployments?.length ?? 0) > 0 ||
			(proto.funFacts?.length ?? 0) > 0 ||
			(proto.practicalWisdom?.notes?.length ?? 0) > 0 ||
			(proto.practicalWisdom?.pitfalls?.length ?? 0) > 0
	);
</script>

{#if hasAnything}
	<div class="flex flex-col gap-5">
		{#if proto.recentChanges && proto.recentChanges.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Calendar size={11} style="color: {color};" />
					Recent Changes
				</h3>
				<ol class="flex flex-col gap-2 border-l pl-3" style="border-color: {color}40;">
					{#each proto.recentChanges as ev (ev.title + ev.date)}
						<li class="text-sm">
							<div class="flex items-baseline gap-2">
								<span class="font-mono text-[10px] tabular-nums" style="color: {color};"
									>{ev.date}</span
								>
								<span class="font-semibold text-t-primary">{ev.title}</span>
							</div>
							<p class="mt-0.5 text-[12px] leading-relaxed text-t-secondary">
								<RichText segments={parseRichText(ev.description)} {color} />
							</p>
							{#if ev.source}
								<a
									href={ev.source.url}
									target="_blank"
									rel="noopener noreferrer"
									class="mt-0.5 inline-block text-[11px] hover:underline"
									style="color: {color};"
								>
									{ev.source.label ?? 'source'} ↗
								</a>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if proto.realWorldDeployments && proto.realWorldDeployments.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Building2 size={11} style="color: {color};" />
					Real-World Deployments
				</h3>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each proto.realWorldDeployments as d (d.org + (d.date ?? ''))}
						<div class="rounded-lg border border-s-border bg-s-glass p-2.5">
							<div class="flex items-baseline justify-between gap-2">
								<span class="text-xs font-semibold text-t-primary">{d.org}</span>
								{#if d.scale}
									<span class="font-mono text-[10px] text-t-muted tabular-nums">{d.scale}</span>
								{/if}
							</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
								<RichText segments={parseRichText(d.description)} {color} />
							</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if proto.funFacts && proto.funFacts.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Sparkles size={11} style="color: {color};" />
					Fun Facts
				</h3>
				<div class="flex flex-col gap-2">
					{#each proto.funFacts as f (f.title)}
						<div
							class="rounded-lg border p-2.5"
							style="border-color: {color}40; background-color: {color}08;"
						>
							<div class="text-xs font-semibold" style="color: {color};">{f.title}</div>
							<div class="mt-0.5">
								<StoryNarrative text={f.text} {color} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if proto.practicalWisdom?.pitfalls && proto.practicalWisdom.pitfalls.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Lightbulb size={11} style="color: {color};" />
					Pitfalls
				</h3>
				<div class="flex flex-col gap-2">
					{#each proto.practicalWisdom.pitfalls as p (p.title)}
						<div class="rounded-lg border border-s-border bg-s-glass p-2.5">
							<div class="text-xs font-semibold text-t-primary">{p.title}</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary">
								<RichText segments={parseRichText(p.text)} {color} />
							</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
