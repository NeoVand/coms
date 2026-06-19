<!--
	StoryComparison — render a comparison table for a story section.

	Used primarily by subcategory guides to lay out the family members side
	by side on a fixed set of axes. Values are parsed for inline rich text
	(protocol links, pioneer refs, glossary, code spans, bold).
-->
<script lang="ts">
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';
	import type { ComparisonRow } from '$lib/data/category-stories/types';

	let {
		title,
		axes,
		rows,
		note,
		color
	}: {
		title?: string;
		axes: string[];
		rows: ComparisonRow[];
		note?: string;
		color: string;
	} = $props();
</script>

<section>
	{#if title}
		<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
	{/if}
	<div
		class="overflow-x-auto rounded-xl border border-s-border bg-s-glass"
		style="--accent: {color};"
	>
		<table class="w-full border-collapse text-xs">
			<thead>
				<tr class="border-b border-s-border">
					<th class="px-3 py-2 text-left font-semibold text-t-muted">&nbsp;</th>
					{#each axes as axis (axis)}
						<th class="px-3 py-2 text-left font-semibold text-t-muted">{axis}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row, i (i)}
					<tr class:border-t={i > 0} class="border-s-border align-top">
						<th class="px-3 py-2 text-left font-semibold whitespace-nowrap" style="color: {color}">
							<RichText segments={parseRichText(row.label)} {color} />
						</th>
						{#each row.values as val, k (k)}
							<td class="px-3 py-2 leading-relaxed text-t-secondary">
								<RichText segments={parseRichText(val)} {color} />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if note}
		<p class="mt-2 text-[11px] leading-relaxed text-t-muted">
			<RichText segments={parseRichText(note)} {color} />
		</p>
	{/if}
</section>

<style>
	tbody tr:not(:first-child) {
		border-top: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
	}
</style>
