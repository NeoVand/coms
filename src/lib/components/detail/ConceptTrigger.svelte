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

	function applyHoverStyle(el: HTMLElement) {
		el.style.borderBottomColor = isLight ? '#0369a1' : '#7dd3fc';
		el.style.color = isLight ? '#0369a1' : '#e0f2fe';
	}

	function clearHoverStyle(el: HTMLElement) {
		el.style.borderBottomColor = isLight ? '#0284c7' : 'rgba(56, 189, 248, 0.7)';
		el.style.color = '';
	}
</script>

<button
	bind:this={triggerEl}
	class="concept-trigger inline cursor-help border-b-[1.5px] border-dotted text-t-primary transition-all {bold
		? 'font-semibold'
		: ''}"
	style="border-bottom-color: {isLight ? '#0284c7' : 'rgba(56, 189, 248, 0.7)'};"
	onmouseenter={(e) => {
		applyHoverStyle(e.currentTarget);
		showTooltip();
	}}
	onmouseleave={(e) => {
		clearHoverStyle(e.currentTarget);
		scheduleHide();
	}}
	onfocus={(e) => {
		applyHoverStyle(e.currentTarget);
		showTooltip();
	}}
	onblur={(e) => {
		clearHoverStyle(e.currentTarget);
		scheduleHide();
	}}
	onclick={handleClick}
>
	{label}
</button>
