<!--
	StoryAnimatedSequence — animated step-by-step sequence diagram for stories.

	Wraps the existing SequencePlayer (originally built for protocol-detail
	pages) so subcategory and category guides can ship animated, captioned
	diagrams without putting their data in the protocol-keyed registry.
-->
<script lang="ts">
	import SequencePlayer from '$lib/components/detail/SequencePlayer.svelte';
	import { getAppState } from '$lib/state/context';

	let {
		title,
		definition,
		caption,
		steps,
		color
	}: {
		title?: string;
		definition: string;
		caption: string;
		steps: Record<number, string>;
		color: string;
	} = $props();

	const appState = getAppState();
</script>

<section>
	<div class="mb-2 flex items-center justify-between">
		{#if title}
			<h3 class="text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
		{:else}
			<span></span>
		{/if}
		<button
			class="flex h-6 w-6 items-center justify-center rounded-md text-t-muted transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={() => appState.openStoryDiagramModal(definition, caption, color, title)}
			aria-label="Expand diagram"
			title="View larger"
		>
			<svg
				class="h-3.5 w-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
				/>
			</svg>
		</button>
	</div>
	<div class="overflow-hidden rounded-xl border border-s-border bg-s-glass p-3">
		<SequencePlayer inline={{ definition, caption, steps }} {color} />
	</div>
</section>
