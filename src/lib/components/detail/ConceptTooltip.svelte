<script lang="ts">
	import type { Concept } from '$lib/data/concepts';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { parseRichText } from '$lib/utils/text-parser';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		concept: Concept;
		triggerRect: DOMRect;
	}

	let { concept, triggerRect }: Props = $props();
	const appState = getAppState();
	const allNodes = buildGraphNodes();

	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1920);
	let windowHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 1080);

	$effect(() => {
		function onResize() {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
		}
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	const TOOLTIP_WIDTH = 300;
	const GAP = 8;
	const APPROX_HEIGHT = 200;

	// Flip horizontally if too close to right edge
	const flippedX = $derived(triggerRect.left + TOOLTIP_WIDTH > windowWidth - 20);
	const left = $derived(flippedX ? Math.max(8, triggerRect.right - TOOLTIP_WIDTH) : triggerRect.left);

	// Flip vertically if too close to bottom
	const flippedY = $derived(triggerRect.bottom + GAP + APPROX_HEIGHT > windowHeight);
	const top = $derived(flippedY ? triggerRect.top - GAP - APPROX_HEIGHT : triggerRect.bottom + GAP);

	// Parse definition and analogy for protocol links
	const definitionSegments = $derived(parseRichText(concept.definition));
	const analogySegments = $derived(concept.analogy ? parseRichText(concept.analogy) : []);

	function navigateToProtocol(protocolId: string) {
		appState.hideConceptTooltip();
		const node = allNodes.find((n) => n.id === protocolId);
		if (node) appState.selectNode(node);
	}

	function handleMouseEnter() {
		appState.cancelConceptTooltipHide();
	}

	function handleMouseLeave() {
		appState.scheduleConceptTooltipHide();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="concept-tooltip-pop pointer-events-auto fixed z-[60] rounded-xl border border-s-border bg-bg-deep/95 shadow-2xl backdrop-blur-xl"
	style="left: {left}px; top: {top}px; width: {TOOLTIP_WIDTH}px; transform-origin: {flippedY
		? 'bottom'
		: 'top'} {flippedX ? 'right' : 'left'};"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="p-3.5">
		<!-- Term -->
		<h4 class="text-sm font-semibold text-t-primary">{concept.term}</h4>

		<!-- Definition with rich text -->
		<p class="mt-1.5 text-xs leading-relaxed text-t-primary">
			{#each definitionSegments as seg, j (j)}
				{#if seg.type === 'text'}
					{seg.value}
				{:else if seg.type === 'bold'}
					<strong class="font-semibold text-t-primary">{seg.value}</strong>
				{:else if seg.type === 'protocol-link' || seg.type === 'bold-protocol-link'}
					<button
						class="inline font-medium text-sky-400 transition-colors hover:text-sky-300 hover:underline"
						onclick={() => navigateToProtocol(seg.protocolId)}
					>
						{seg.label}
					</button>
				{:else if seg.type === 'concept' || seg.type === 'bold-concept'}
					<span class="font-medium text-t-primary">{seg.label}</span>
				{/if}
			{/each}
		</p>

		<!-- Analogy with rich text -->
		{#if concept.analogy}
			<div class="mt-2 rounded-lg bg-s-glass px-2.5 py-2">
				<p class="text-[11px] leading-relaxed text-t-secondary">
					<span class="font-medium text-t-primary">Analogy:</span>
					{#each analogySegments as seg, j (j)}
						{#if seg.type === 'text'}
							{seg.value}
						{:else if seg.type === 'bold'}
							<strong class="font-semibold text-t-primary">{seg.value}</strong>
						{:else if seg.type === 'protocol-link' || seg.type === 'bold-protocol-link'}
							<button
								class="inline font-medium text-sky-400 transition-colors hover:text-sky-300 hover:underline"
								onclick={() => navigateToProtocol(seg.protocolId)}
							>
								{seg.label}
							</button>
						{:else if seg.type === 'concept' || seg.type === 'bold-concept'}
							<span class="font-medium text-t-primary">{seg.label}</span>
						{/if}
					{/each}
				</p>
			</div>
		{/if}

		<!-- Wikipedia link -->
		{#if concept.wikiUrl}
			<a
				href={concept.wikiUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-2 inline-flex items-center gap-1 text-[11px] text-t-muted transition-colors hover:text-t-primary"
			>
				<ExternalLink size={10} />
				Wikipedia
			</a>
		{/if}
	</div>
</div>

<style>
	@keyframes concept-tooltip-pop {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.concept-tooltip-pop {
		animation: concept-tooltip-pop 0.18s cubic-bezier(0.34, 1.4, 0.64, 1) both;
	}
</style>
