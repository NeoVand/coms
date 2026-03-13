<script lang="ts">
	import MermaidDiagram from './MermaidDiagram.svelte';
	import { diagramDefinitions } from '$lib/data/diagram-definitions';
	import { getAppState } from '$lib/state/context';

	let { protocolId, color }: { protocolId: string; color: string } = $props();

	const appState = getAppState();
	const hasDiagram = $derived(protocolId in diagramDefinitions);
</script>

{#if hasDiagram}
	<section data-tour="protocol-diagram">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Sequence Diagram</h3>
			<button
				class="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
				onclick={() => appState.openDiagramModal(protocolId, color)}
				aria-label="Expand diagram"
				title="View larger"
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
				</svg>
			</button>
		</div>
		<MermaidDiagram {protocolId} {color} />
	</section>
{/if}

<style>
	section {
		animation: diagramFadeIn 0.4s ease-out;
	}
	@keyframes diagramFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
