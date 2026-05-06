<script lang="ts">
	import { parseParagraphs } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import RfcRef from '$lib/components/detail/inline/RfcRef.svelte';
	import OutageLink from '$lib/components/detail/inline/OutageLink.svelte';
	import PioneerLink from '$lib/components/detail/inline/PioneerLink.svelte';
	import GlossaryLink from '$lib/components/detail/inline/GlossaryLink.svelte';
	import FrontierLink from '$lib/components/detail/inline/FrontierLink.svelte';
	import ChapterLink from '$lib/components/detail/inline/ChapterLink.svelte';
	import { navigateToProtocol } from '$lib/utils/navigation';

	let { text, color, title }: { text: string; color: string; title?: string } = $props();

	const paragraphs = $derived(parseParagraphs(text));
</script>

<section>
	{#if title}
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
	{/if}
	<div class="space-y-3 text-sm leading-relaxed text-t-primary">
		{#each paragraphs as segments, i (i)}
			<p>
				{#each segments as seg, j (j)}
					{#if seg.type === 'text'}
						{seg.value}
					{:else if seg.type === 'bold'}
						<strong class="font-semibold text-t-primary">{seg.value}</strong>
					{:else if seg.type === 'protocol-link'}
						<button
							class="inline font-medium transition-colors hover:underline"
							style="color: {color}"
							onclick={() => navigateToProtocol(seg.protocolId)}
						>
							{seg.label}
						</button>
					{:else if seg.type === 'bold-protocol-link'}
						<button
							class="inline font-semibold transition-colors hover:underline"
							style="color: {color}"
							onclick={() => navigateToProtocol(seg.protocolId)}
						>
							{seg.label}
						</button>
					{:else if seg.type === 'concept'}
						<ConceptTrigger conceptId={seg.conceptId} label={seg.label} />
					{:else if seg.type === 'bold-concept'}
						<ConceptTrigger conceptId={seg.conceptId} label={seg.label} bold />
					{:else if seg.type === 'rfc-ref'}
						<RfcRef number={seg.number} label={seg.label} {color} />
					{:else if seg.type === 'outage-link'}
						<OutageLink outageId={seg.outageId} label={seg.label} {color} />
					{:else if seg.type === 'pioneer-link'}
						<PioneerLink pioneerId={seg.pioneerId} label={seg.label} {color} />
					{:else if seg.type === 'glossary-link'}
						<GlossaryLink conceptId={seg.conceptId} label={seg.label} {color} />
					{:else if seg.type === 'frontier-link'}
						<FrontierLink frontierId={seg.frontierId} label={seg.label} {color} />
					{:else if seg.type === 'chapter-link'}
						<ChapterLink
							partId={seg.partId}
							chapterId={seg.chapterId}
							label={seg.label}
							{color}
						/>
					{/if}
				{/each}
			</p>
		{/each}
	</div>
</section>
