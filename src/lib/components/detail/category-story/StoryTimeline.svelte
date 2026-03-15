<script lang="ts">
	import type { TimelineEntry } from '$lib/data/category-stories/types';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes, getProtocolById } from '$lib/data/index';

	let { entries, color }: { entries: TimelineEntry[]; color: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	function navigateToProtocol(protocolId: string) {
		const node = allNodes.find((n) => n.id === protocolId);
		if (node) appState.selectNode(node);
	}
</script>

<section>
	<div class="relative ml-3 border-l border-s-border pl-5">
		{#each entries as entry, i (i)}
			<div class="relative pb-5 last:pb-0">
				<!-- Dot on the line -->
				<div
					class="absolute -left-[23px] top-0.5 h-2 w-2 rounded-full"
					style="background-color: {color}"
				></div>

				<!-- Year -->
				<div class="mb-0.5 text-xs font-bold" style="color: {color}">
					{entry.year}
				</div>

				<!-- Title -->
				<div class="text-sm font-medium text-t-primary">
					{#if entry.protocolId}
						<button
							class="hover:underline"
							style="color: {color}"
							onclick={() => navigateToProtocol(entry.protocolId!)}
						>
							{entry.title}
						</button>
					{:else}
						{entry.title}
					{/if}
				</div>

				<!-- Description -->
				<p class="mt-0.5 text-xs leading-relaxed text-t-muted">
					{entry.description}
				</p>
			</div>
		{/each}
	</div>
</section>
