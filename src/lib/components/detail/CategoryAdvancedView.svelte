<script lang="ts">
	import { getCategoryDeepDive } from '$lib/data/category-deep-dives';
	import type { Category } from '$lib/data/types';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import StoryCallout from './category-story/StoryCallout.svelte';
	import StoryDiagram from './category-story/StoryDiagram.svelte';

	let { cat }: { cat: Category } = $props();

	const deepDive = $derived(getCategoryDeepDive(cat.id));
</script>

{#if deepDive}
	<div class="flex flex-col gap-5">
		{#each deepDive.sections as section, i (i)}
			{#if section.type === 'narrative'}
				<StoryNarrative text={section.text} color={cat.color} title={section.title} />
			{:else if section.type === 'callout'}
				<StoryCallout title={section.title} text={section.text} color={cat.color} />
			{:else if section.type === 'diagram'}
				<StoryDiagram
					definition={section.definition}
					caption={section.caption}
					color={cat.color}
					title={section.title}
				/>
			{/if}
		{/each}
	</div>
{:else}
	<div class="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
		<p class="text-sm text-slate-500">Advanced content coming soon...</p>
	</div>
{/if}
