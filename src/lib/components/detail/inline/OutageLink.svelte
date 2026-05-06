<script lang="ts">
	import { base } from '$app/paths';
	import { getOutageById } from '$lib/data/outages';

	interface Props {
		outageId: string;
		label: string;
		color: string;
	}

	let { outageId, label, color }: Props = $props();

	const outage = $derived(getOutageById(outageId));
	const tooltip = $derived(
		outage
			? `${outage.title} (${outage.date})${outage.scale ? ' — ' + outage.scale : ''}`
			: `Famous incident: ${outageId} (details coming soon)`
	);
</script>

{#if outage}
	<a
		href="{base}/outage/{outage.id}"
		class="inline font-medium italic transition-colors hover:underline"
		style="color: {color}"
		title={tooltip}>{label}</a
	>
{:else}
	<!-- Registry not yet populated for this id — render as styled text so the
	     reading flow isn't broken and authors can link in later without
	     touching prose. -->
	<span class="inline italic" style="color: {color}; opacity: 0.85;" title={tooltip}>{label}</span>
{/if}
