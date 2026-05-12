<script lang="ts">
	import type { TimelineEntry } from '$lib/data/category-stories/types';
	import { navigateToProtocol } from '$lib/utils/navigation';
	import RichText from '$lib/components/detail/inline/RichText.svelte';
	import { parseRichText } from '$lib/utils/text-parser';

	let { entries, color }: { entries: TimelineEntry[]; color: string } = $props();
</script>

<section>
	<div class="relative ml-3 border-l border-s-border pl-5">
		{#each entries as entry, i (i)}
			<div class="relative pb-5 last:pb-0">
				<!-- Dot on the line -->
				<div
					class="absolute top-0.5 -left-[23px] h-2 w-2 rounded-full"
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
					<RichText segments={parseRichText(entry.description)} {color} />
				</p>
			</div>
		{/each}
	</div>
</section>
