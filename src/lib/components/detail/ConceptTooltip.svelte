<script lang="ts">
	import type { Concept } from '$lib/data/concepts';
	import { getAppState } from '$lib/state/context';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		concept: Concept;
		triggerRect: DOMRect;
	}

	let { concept, triggerRect }: Props = $props();
	const appState = getAppState();

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

	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function cancelHide() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
	}

	function scheduleHide() {
		hideTimer = setTimeout(() => {
			appState.hideConceptTooltip();
			hideTimer = null;
		}, 150);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="concept-tooltip-pop pointer-events-auto fixed z-[60] rounded-xl border border-white/10 bg-bg-deep/95 shadow-2xl backdrop-blur-xl"
	style="left: {left}px; top: {top}px; width: {TOOLTIP_WIDTH}px; transform-origin: {flippedY
		? 'bottom'
		: 'top'} {flippedX ? 'right' : 'left'};"
	onmouseenter={cancelHide}
	onmouseleave={scheduleHide}
>
	<div class="p-3.5">
		<!-- Term -->
		<h4 class="text-sm font-semibold text-slate-100">{concept.term}</h4>

		<!-- Definition -->
		<p class="mt-1.5 text-xs leading-relaxed text-slate-300">{concept.definition}</p>

		<!-- Analogy -->
		{#if concept.analogy}
			<div class="mt-2 rounded-lg bg-white/[0.04] px-2.5 py-2">
				<p class="text-[11px] leading-relaxed text-slate-400">
					<span class="font-medium text-slate-300">Analogy:</span>
					{concept.analogy}
				</p>
			</div>
		{/if}

		<!-- Wikipedia link -->
		{#if concept.wikiUrl}
			<a
				href={concept.wikiUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-slate-300"
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
