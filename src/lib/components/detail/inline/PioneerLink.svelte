<script lang="ts">
	import { base } from '$app/paths';
	import { getPioneerById } from '$lib/data/pioneers';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		pioneerId: string;
		label: string;
		color: string;
	}

	let { pioneerId, label, color }: Props = $props();

	const appState = getAppState();
	const pioneer = $derived(getPioneerById(pioneerId));
	const displayColor = $derived(themedDomColor(color, appState.theme));
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
		style="color: {displayColor}"
		title={tooltip}
		onclick={(e) => e.stopPropagation()}>{label}</a
	>
{:else}
	<span class="inline font-medium" style="color: {displayColor}; opacity: 0.85;" title={tooltip}
		>{label}</span
	>
{/if}
