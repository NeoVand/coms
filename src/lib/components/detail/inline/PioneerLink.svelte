<script lang="ts">
	import { base } from '$app/paths';
	import { getPioneerById } from '$lib/data/pioneers';

	interface Props {
		pioneerId: string;
		label: string;
		color: string;
	}

	let { pioneerId, label, color }: Props = $props();

	const pioneer = $derived(getPioneerById(pioneerId));
	const tooltip = $derived(
		pioneer
			? `${pioneer.name}${pioneer.title ? ' — ' + pioneer.title : ''}`
			: `Pioneer: ${pioneerId} (bio coming soon)`
	);
</script>

{#if pioneer}
	<a
		href="{base}/pioneer/{pioneer.id}"
		class="inline font-medium transition-colors hover:underline"
		style="color: {color}"
		title={tooltip}>{label}</a
	>
{:else}
	<span class="inline font-medium" style="color: {color}; opacity: 0.85;" title={tooltip}
		>{label}</span
	>
{/if}
