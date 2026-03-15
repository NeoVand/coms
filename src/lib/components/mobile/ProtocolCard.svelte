<script lang="ts">
	import type { Protocol } from '$lib/data/types';
	import { buildGraphNodes } from '$lib/data/index';
	import { getAppState } from '$lib/state/context';

	let { proto, color }: { proto: Protocol; color: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();
</script>

<button
	class="flex w-full items-start gap-3 rounded-lg border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
	onclick={() => {
		const node = allNodes.find((n) => n.id === proto.id);
		if (node) appState.selectNode(node);
	}}
>
	<div
		class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
		style="background-color: {color}15; color: {color}"
	>
		{proto.abbreviation.slice(0, 4)}
	</div>
	<div class="min-w-0 flex-1">
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-t-primary">{proto.abbreviation}</span>
			{#if proto.port}
				<span class="text-[10px] text-t-muted">:{proto.port}</span>
			{/if}
		</div>
		<p class="mt-0.5 text-xs leading-relaxed text-t-secondary">{proto.oneLiner}</p>
	</div>
</button>
