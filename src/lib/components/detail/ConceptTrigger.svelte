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
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function showTooltip() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		const concept = getConceptById(conceptId);
		if (!concept || !triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		appState.showConceptTooltip(concept, rect);
	}

	function scheduleHide() {
		hideTimer = setTimeout(() => {
			appState.hideConceptTooltip();
			hideTimer = null;
		}, 200);
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
	class="concept-trigger inline border-b border-dashed border-slate-500/50 text-slate-200 transition-colors hover:border-slate-300 hover:text-white {bold ? 'font-semibold' : ''}"
	onmouseenter={showTooltip}
	onmouseleave={scheduleHide}
	onclick={handleClick}
>
	{label}
</button>
