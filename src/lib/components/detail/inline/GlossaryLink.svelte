<script lang="ts">
	import { base } from '$app/paths';
	import { getConceptById } from '$lib/data/concepts';

	interface Props {
		conceptId: string;
		label: string;
		color: string;
	}

	let { conceptId, label, color }: Props = $props();

	const concept = $derived(getConceptById(conceptId));
	const tooltip = $derived(
		concept ? `Glossary — ${concept.term}` : `Glossary: ${conceptId} (entry coming soon)`
	);
</script>

{#if concept}
	<a
		href="{base}/glossary#{conceptId}"
		class="glossary-link inline transition-colors hover:opacity-80"
		style="color: {color}; text-decoration: underline dotted; text-underline-offset: 3px;"
		title={tooltip}>{label}</a
	>
{:else}
	<span
		class="inline"
		style="color: {color}; opacity: 0.85; text-decoration: underline dotted; text-underline-offset: 3px;"
		title={tooltip}>{label}</span
	>
{/if}
