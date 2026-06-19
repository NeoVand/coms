<script lang="ts">
	import type { StoryContent } from '$lib/data/category-stories/types';
	import type { Category } from '$lib/data/types';
	import StoryNarrative from './StoryNarrative.svelte';
	import StoryTimeline from './StoryTimeline.svelte';
	import PioneerGrid from './PioneerGrid.svelte';
	import StoryCallout from './StoryCallout.svelte';
	import StoryDiagram from './StoryDiagram.svelte';
	import StoryImage from './StoryImage.svelte';
	import StoryComparison from './StoryComparison.svelte';
	import StoryAnimatedSequence from './StoryAnimatedSequence.svelte';

	let {
		story,
		cat,
		color = cat.color
	}: { story: StoryContent; cat: Category; color?: string } = $props();
</script>

<div class="flex flex-col gap-5">
	{#each story.sections as section, i (i)}
		{#if section.type === 'narrative'}
			<StoryNarrative text={section.text} {color} title={section.title} />
		{:else if section.type === 'timeline'}
			<StoryTimeline entries={section.entries} {color} />
		{:else if section.type === 'pioneers'}
			<PioneerGrid people={section.people} {color} title={section.title} />
		{:else if section.type === 'callout'}
			<StoryCallout title={section.title} text={section.text} {color} />
		{:else if section.type === 'diagram'}
			<StoryDiagram
				definition={section.definition}
				caption={section.caption}
				{color}
				title={section.title}
			/>
		{:else if section.type === 'image'}
			<StoryImage
				src={section.src}
				alt={section.alt}
				caption={section.caption}
				credit={section.credit}
				{color}
				title={section.title}
			/>
		{:else if section.type === 'comparison'}
			<StoryComparison
				title={section.title}
				axes={section.axes}
				rows={section.rows}
				note={section.note}
				{color}
			/>
		{:else if section.type === 'animated-sequence'}
			<StoryAnimatedSequence
				title={section.title}
				definition={section.definition}
				caption={section.caption}
				steps={section.steps}
				{color}
			/>
		{/if}
	{/each}
</div>
