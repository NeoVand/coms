<script lang="ts">
	import type { CategoryStory } from '$lib/data/category-stories/types';
	import type { Category } from '$lib/data/types';
	import StoryNarrative from './StoryNarrative.svelte';
	import StoryTimeline from './StoryTimeline.svelte';
	import PioneerGrid from './PioneerGrid.svelte';
	import StoryCallout from './StoryCallout.svelte';
	import StoryDiagram from './StoryDiagram.svelte';

	let { story, cat }: { story: CategoryStory; cat: Category } = $props();
</script>

<div class="flex flex-col gap-5">
	{#each story.sections as section, i (i)}
		{#if section.type === 'narrative'}
			<StoryNarrative text={section.text} color={cat.color} title={section.title} />
		{:else if section.type === 'timeline'}
			<StoryTimeline entries={section.entries} color={cat.color} />
		{:else if section.type === 'pioneers'}
			<PioneerGrid people={section.people} color={cat.color} title={section.title} />
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
