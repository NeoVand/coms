<script lang="ts">
	import { base } from '$app/paths';
	import { getChapter, bookPartMap } from '$lib/data/book/chapters';

	interface Props {
		partId: string;
		chapterId: string;
		label: string;
		color: string;
	}

	let { partId, chapterId, label, color }: Props = $props();

	const chapter = $derived(getChapter(partId, chapterId));
	const part = $derived(bookPartMap.get(partId));
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
		style="color: {color}"
		title={tooltip}>{label}</a
	>
{:else}
	<span class="inline italic" style="color: {color}; opacity: 0.85;" title={tooltip}>{label}</span>
{/if}
