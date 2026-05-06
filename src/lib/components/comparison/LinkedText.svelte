<script lang="ts">
	import { parseRichText } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import { navigateToProtocol } from '$lib/utils/navigation';

	let { text, color }: { text: string; color: string } = $props();

	const segments = $derived(parseRichText(text));
</script>

{#each segments as seg, j (j)}{#if seg.type === 'text'}{seg.value}{:else if seg.type === 'bold'}<strong
			class="font-semibold text-t-primary">{seg.value}</strong
		>{:else if seg.type === 'protocol-link'}<button
			class="inline font-medium transition-colors hover:underline"
			style="color: {color}"
			onclick={() => navigateToProtocol(seg.protocolId)}>{seg.label}</button
		>{:else if seg.type === 'bold-protocol-link'}<button
			class="inline font-semibold transition-colors hover:underline"
			style="color: {color}"
			onclick={() => navigateToProtocol(seg.protocolId)}>{seg.label}</button
		>{:else if seg.type === 'concept'}<ConceptTrigger
			conceptId={seg.conceptId}
			label={seg.label}
		/>{:else if seg.type === 'bold-concept'}<ConceptTrigger
			conceptId={seg.conceptId}
			label={seg.label}
			bold
		/>{/if}{/each}
