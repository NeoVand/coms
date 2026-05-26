<script lang="ts">
	import { base } from '$app/paths';
	import { getOutageById } from '$lib/data/outages';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		outageId: string;
		label: string;
		color: string;
	}

	let { outageId, label, color }: Props = $props();

	const appState = getAppState();
	const outage = $derived(getOutageById(outageId));
	const displayColor = $derived(themedDomColor(color, appState.theme));
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
		style="color: {displayColor}"
		title={tooltip}
		onclick={(e) => e.stopPropagation()}>{label}</a
	>
{:else}
	<!-- Registry not yet populated for this id — render as styled text so the
	     reading flow isn't broken and authors can link in later without
	     touching prose. -->
	<span class="inline italic" style="color: {displayColor}; opacity: 0.85;" title={tooltip}>{label}</span>
{/if}
