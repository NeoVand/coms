<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { parseParagraphs } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';

	let { title, text, color }: { title: string; text: string; color: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	function navigateToProtocol(protocolId: string) {
		const node = allNodes.find((n) => n.id === protocolId);
		if (node) appState.selectNode(node);
	}

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
</div>
