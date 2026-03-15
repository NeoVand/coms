<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getConceptById } from '$lib/data/concepts';

	interface Props {
		conceptId: string;
		label: string;
		bold?: boolean;
	}

	let { conceptId, label, bold = false }: Props = $props();
	const appState = getAppState();

	let triggerEl: HTMLButtonElement;

	function showTooltip() {
		const concept = getConceptById(conceptId);
		if (!concept || !triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		appState.showConceptTooltip(concept, rect);
	}

	function scheduleHide() {
		appState.scheduleConceptTooltipHide();
	}

	function handleClick() {
		// Mobile: toggle tooltip
		if (appState.conceptTooltip?.concept.id === conceptId) {
			appState.hideConceptTooltip();
		} else {
			showTooltip();
		}
	}
</script>

<button
	bind:this={triggerEl}
	class="concept-trigger inline cursor-help border-b-[1.5px] border-dotted border-sky-400/70 text-slate-200 transition-all hover:border-sky-300 hover:text-sky-100 {bold ? 'font-semibold' : ''}"
	onmouseenter={showTooltip}
	onmouseleave={scheduleHide}
	onclick={handleClick}
>
	{label}
</button>
