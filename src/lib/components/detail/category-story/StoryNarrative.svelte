<script lang="ts">
	import { parseRichText, type TextSegment } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import RfcRef from '$lib/components/detail/inline/RfcRef.svelte';
	import OutageLink from '$lib/components/detail/inline/OutageLink.svelte';
	import PioneerLink from '$lib/components/detail/inline/PioneerLink.svelte';
	import GlossaryLink from '$lib/components/detail/inline/GlossaryLink.svelte';
	import FrontierLink from '$lib/components/detail/inline/FrontierLink.svelte';
	import ChapterLink from '$lib/components/detail/inline/ChapterLink.svelte';
	import ProtocolLink from '$lib/components/detail/inline/ProtocolLink.svelte';
	import { getProtocolColor } from '$lib/data';
	import { getAppState } from '$lib/state/context';

	let { text, color, title }: { text: string; color: string; title?: string } = $props();

	const appState = getAppState();

	type Block = { kind: 'p'; segments: TextSegment[] } | { kind: 'ul'; items: TextSegment[][] };

	/** Split into paragraphs, detecting blocks of `- ` / `* ` lines as lists. */
	function parseBlocks(raw: string): Block[] {
		return raw.split('\n\n').map((p): Block => {
			const lines = p
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean);
			if (lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l))) {
				return {
					kind: 'ul',
					items: lines.map((l) => parseRichText(l.replace(/^[-*]\s+/, '')))
				};
			}
			return { kind: 'p', segments: parseRichText(p) };
		});
	}

	const blocks = $derived(parseBlocks(text));

	/**
	 * Inline protocol mentions render in their **target** protocol's
	 * category color, not the surrounding surface accent. So [[tcp]]
	 * is always green, [[mqtt]] is always pink, regardless of which
	 * chapter or protocol page hosts the link.
	 */
	function protoColor(id: string): string {
		return getProtocolColor(id, appState.theme, color);
	}
</script>

<section>
	{#if title}
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
	{/if}
	<div class="space-y-3 text-sm leading-relaxed text-t-primary">
		{#snippet seg(s: TextSegment)}
			{#if s.type === 'text'}{s.value}{:else if s.type === 'italic'}<em class="italic">{s.value}</em
				>{:else if s.type === 'code'}<code
					class="rounded bg-s-glass px-1 py-px font-mono text-[0.92em] text-t-primary"
					>{s.value}</code
				>{:else if s.type === 'protocol-link'}<ProtocolLink
					protocolId={s.protocolId}
					label={s.label}
					color={protoColor(s.protocolId)}
				/>{:else if s.type === 'bold-protocol-link'}<ProtocolLink
					protocolId={s.protocolId}
					label={s.label}
					color={protoColor(s.protocolId)}
					bold
				/>{:else if s.type === 'concept'}<ConceptTrigger
					conceptId={s.conceptId}
					label={s.label}
				/>{:else if s.type === 'bold-concept'}<ConceptTrigger
					conceptId={s.conceptId}
					label={s.label}
					bold
				/>{:else if s.type === 'rfc-ref'}<RfcRef
					number={s.number}
					label={s.label}
					{color}
				/>{:else if s.type === 'outage-link'}<OutageLink
					outageId={s.outageId}
					label={s.label}
					{color}
				/>{:else if s.type === 'pioneer-link'}<PioneerLink
					pioneerId={s.pioneerId}
					label={s.label}
					{color}
				/>{:else if s.type === 'glossary-link'}<GlossaryLink
					conceptId={s.conceptId}
					label={s.label}
					{color}
				/>{:else if s.type === 'frontier-link'}<FrontierLink
					frontierId={s.frontierId}
					label={s.label}
					{color}
				/>{:else if s.type === 'chapter-link'}<ChapterLink
					partId={s.partId}
					chapterId={s.chapterId}
					label={s.label}
					{color}
				/>{/if}
		{/snippet}

		{#snippet inline(segments: TextSegment[])}
			{#each segments as s, j (j)}
				{#if s.type === 'bold'}<strong class="font-semibold text-t-primary">{s.value}</strong
					>{:else if s.type === 'bold-group'}<strong class="font-semibold text-t-primary"
						>{#each s.segments as inner, k (k)}{@render seg(inner)}{/each}</strong
					>{:else}{@render seg(s)}{/if}
			{/each}
		{/snippet}

		{#each blocks as block, i (i)}
			{#if block.kind === 'p'}
				<p>{@render inline(block.segments)}</p>
			{:else}
				<ul class="ml-4 list-disc space-y-1.5 marker:text-t-muted">
					{#each block.items as item, k (k)}
						<li>{@render inline(item)}</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</div>
</section>
