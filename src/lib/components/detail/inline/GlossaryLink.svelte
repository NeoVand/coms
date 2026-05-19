<script lang="ts">
	import { base } from '$app/paths';
	import { getConceptById } from '$lib/data/concepts';
	import { getAppState } from '$lib/state/context';

	interface Props {
		conceptId: string;
		label: string;
		color: string;
	}

	let { conceptId, label, color }: Props = $props();

	const appState = getAppState();
	const concept = $derived(getConceptById(conceptId));
	const tooltip = $derived(
		concept ? `Glossary — ${concept.term}` : `Glossary: ${conceptId} (entry coming soon)`
	);

	let anchorEl: HTMLAnchorElement | undefined = $state();

	function showTooltip() {
		if (!concept || !anchorEl) return;
		appState.showConceptTooltip(concept, anchorEl.getBoundingClientRect());
	}

	function scheduleHide() {
		appState.scheduleConceptTooltipHide();
	}
</script>

{#if concept}
	<a
		bind:this={anchorEl}
		href="{base}/glossary#{conceptId}"
		class="glossary-link inline cursor-help transition-colors hover:opacity-80"
		style="color: {color}; text-decoration: underline dotted; text-underline-offset: 3px;"
		title={tooltip}
		onmouseenter={showTooltip}
		onmouseleave={scheduleHide}
		onfocus={showTooltip}
		onblur={scheduleHide}
		onclick={(e) => e.stopPropagation()}>{label}</a
	>
{:else}
	<span
		class="inline"
		style="color: {color}; opacity: 0.85; text-decoration: underline dotted; text-underline-offset: 3px;"
		title={tooltip}>{label}</span
	>
{/if}
