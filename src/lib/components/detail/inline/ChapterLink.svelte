<script lang="ts">
	import { base } from '$app/paths';
	import { getChapter, bookPartMap } from '$lib/data/book/chapters';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		partId: string;
		chapterId: string;
		label: string;
		color: string;
	}

	let { partId, chapterId, label, color }: Props = $props();

	const appState = getAppState();
	const chapter = $derived(getChapter(partId, chapterId));
	const part = $derived(bookPartMap.get(partId));
	const displayColor = $derived(themedDomColor(color, appState.theme));
	const tooltip = $derived(
		chapter && part
			? `${part.label ? `Part ${part.label}` : part.title} — ${chapter.title}`
			: `Chapter: ${partId}/${chapterId} (details coming soon)`
	);
</script>

{#if chapter}
	<a
		href="{base}/book/{partId}/{chapterId}"
		class="inline font-medium transition-colors hover:underline"
		style="color: {displayColor}"
		title={tooltip}
		onclick={(e) => e.stopPropagation()}>{label}</a
	>
{:else}
	<span class="inline italic" style="color: {displayColor}; opacity: 0.85;" title={tooltip}
		>{label}</span
	>
{/if}
