<script lang="ts">
	import { parseParagraphs, type TextSegment } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import RfcRef from '$lib/components/detail/inline/RfcRef.svelte';
	import OutageLink from '$lib/components/detail/inline/OutageLink.svelte';
	import PioneerLink from '$lib/components/detail/inline/PioneerLink.svelte';
	import GlossaryLink from '$lib/components/detail/inline/GlossaryLink.svelte';
	import FrontierLink from '$lib/components/detail/inline/FrontierLink.svelte';
	import ChapterLink from '$lib/components/detail/inline/ChapterLink.svelte';
	import ProtocolLink from '$lib/components/detail/inline/ProtocolLink.svelte';

	let { title, text, color }: { title: string; text: string; color: string } = $props();

	const paragraphs = $derived(parseParagraphs(text));
</script>

<div class="rounded-xl border border-s-border bg-s-glass p-3">
	<div class="text-xs font-semibold" style="color: {color}">{title}</div>
	<div class="mt-1.5 space-y-2 text-xs leading-relaxed text-t-secondary">
		{#snippet seg(s: TextSegment)}
			{#if s.type === 'text'}{s.value}{:else if s.type === 'italic'}<em class="italic"
					>{s.value}</em
				>{:else if s.type === 'code'}<code
					class="rounded bg-s-glass px-1 py-px font-mono text-[0.92em] text-t-primary"
					>{s.value}</code
				>{:else if s.type === 'protocol-link'}<ProtocolLink
					protocolId={s.protocolId}
					label={s.label}
					{color}
				/>{:else if s.type === 'bold-protocol-link'}<ProtocolLink
					protocolId={s.protocolId}
					label={s.label}
					{color}
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
		{#each paragraphs as segments, i (i)}
			<p>
				{#each segments as s, j (j)}
					{#if s.type === 'bold'}<strong class="font-semibold text-t-primary"
							>{s.value}</strong
						>{:else if s.type === 'bold-group'}<strong class="font-semibold text-t-primary"
							>{#each s.segments as inner, k (k)}{@render seg(inner)}{/each}</strong
						>{:else}{@render seg(s)}{/if}
				{/each}
			</p>
		{/each}
	</div>
</div>
