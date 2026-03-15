<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { parseParagraphs } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';

	let { text, color, title }: { text: string; color: string; title?: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	function navigateToProtocol(protocolId: string) {
		const node = allNodes.find((n) => n.id === protocolId);
		if (node) appState.selectNode(node);
	}

	const paragraphs = $derived(parseParagraphs(text));
</script>

<section>
	{#if title}
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</h3>
	{/if}
	<div class="space-y-3 text-sm leading-relaxed text-slate-300">
		{#each paragraphs as segments, i (i)}
			<p>
				{#each segments as seg, j (j)}
					{#if seg.type === 'text'}
						{seg.value}
					{:else if seg.type === 'bold'}
						<strong class="font-semibold text-slate-200">{seg.value}</strong>
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
					{/if}
				{/each}
			</p>
		{/each}
	</div>
</section>
