<script lang="ts">
	import { parseParagraphs } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import RfcRef from '$lib/components/detail/inline/RfcRef.svelte';
	import OutageLink from '$lib/components/detail/inline/OutageLink.svelte';
	import PioneerLink from '$lib/components/detail/inline/PioneerLink.svelte';
	import GlossaryLink from '$lib/components/detail/inline/GlossaryLink.svelte';
	import ProtocolLink from '$lib/components/detail/inline/ProtocolLink.svelte';

	let { title, text, color }: { title: string; text: string; color: string } = $props();

	const paragraphs = $derived(parseParagraphs(text));
</script>

<div class="rounded-xl border border-s-border bg-s-glass p-3">
	<div class="text-xs font-semibold" style="color: {color}">{title}</div>
	<div class="mt-1.5 space-y-2 text-xs leading-relaxed text-t-secondary">
		{#each paragraphs as segments, i (i)}
			<p>
				{#each segments as seg, j (j)}
					{#if seg.type === 'text'}
						{seg.value}
					{:else if seg.type === 'bold'}
						<strong class="font-semibold text-t-primary">{seg.value}</strong>
					{:else if seg.type === 'protocol-link'}
						<ProtocolLink protocolId={seg.protocolId} label={seg.label} {color} />
					{:else if seg.type === 'bold-protocol-link'}
						<ProtocolLink protocolId={seg.protocolId} label={seg.label} {color} bold />
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
					{/if}
				{/each}
			</p>
		{/each}
	</div>
</div>
