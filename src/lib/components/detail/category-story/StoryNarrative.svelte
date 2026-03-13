<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes, getProtocolById } from '$lib/data/index';

	let { text, color, title }: { text: string; color: string; title?: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	// Parse [[protocolId]] and [[protocolId|Label]] into segments
	type Segment = { type: 'text'; value: string } | { type: 'link'; protocolId: string; label: string };

	function parseText(raw: string): Segment[] {
		const segments: Segment[] = [];
		const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(raw)) !== null) {
			if (match.index > lastIndex) {
				segments.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
			}
			const protocolId = match[1];
			const proto = getProtocolById(protocolId);
			const label = match[2] || proto?.abbreviation || protocolId.toUpperCase();
			segments.push({ type: 'link', protocolId, label });
			lastIndex = regex.lastIndex;
		}

		if (lastIndex < raw.length) {
			segments.push({ type: 'text', value: raw.slice(lastIndex) });
		}

		return segments;
	}

	function navigateToProtocol(protocolId: string) {
		const node = allNodes.find((n) => n.id === protocolId);
		if (node) appState.selectNode(node);
	}

	const paragraphs = $derived(text.split('\n\n').map((p) => parseText(p)));
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
					{:else}
						<button
							class="inline font-medium transition-colors hover:underline"
							style="color: {color}"
							onclick={() => navigateToProtocol(seg.protocolId)}
						>
							{seg.label}
						</button>
					{/if}
				{/each}
			</p>
		{/each}
	</div>
</section>
