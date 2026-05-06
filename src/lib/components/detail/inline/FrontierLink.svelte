<script lang="ts">
	import { base } from '$app/paths';
	import { getFrontierById } from '$lib/data/frontier';

	interface Props {
		frontierId: string;
		label: string;
		color: string;
	}

	let { frontierId, label, color }: Props = $props();

	const fe = $derived(getFrontierById(frontierId));
	const tooltip = $derived(
		fe
			? `${fe.title} (${fe.status}, ${fe.date})`
			: `Frontier entry: ${frontierId} (details coming soon)`
	);
</script>

{#if fe}
	<a
		href="{base}/frontier/{fe.id}"
		class="inline font-medium transition-colors hover:underline"
		style="color: {color}"
		title={tooltip}>{label}</a
	>
{:else}
	<!-- Registry not yet populated for this id — render as styled text so the
	     reading flow isn't broken and authors can link in later without
	     touching prose. -->
	<span class="inline italic" style="color: {color}; opacity: 0.85;" title={tooltip}>{label}</span>
{/if}
