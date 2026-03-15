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
	const isLight = $derived(appState.theme === 'light');

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
	class="concept-trigger inline cursor-help border-b-[1.5px] border-dotted text-t-primary transition-all {bold ? 'font-semibold' : ''}"
	style="border-bottom-color: {isLight ? '#0284c7' : 'rgba(56, 189, 248, 0.7)'};"
	onmouseover={(e) => { e.currentTarget.style.borderBottomColor = isLight ? '#0369a1' : '#7dd3fc'; e.currentTarget.style.color = isLight ? '#0369a1' : '#e0f2fe'; }}
	onmouseout={(e) => { e.currentTarget.style.borderBottomColor = isLight ? '#0284c7' : 'rgba(56, 189, 248, 0.7)'; e.currentTarget.style.color = ''; }}
	onmouseenter={showTooltip}
	onmouseleave={scheduleHide}
	onclick={handleClick}
>
	{label}
</button>
