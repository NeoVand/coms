<script lang="ts">
	import type { Pioneer } from '$lib/data/category-stories/types';
	import PioneerCard from './PioneerCard.svelte';

	let {
		people,
		color,
		title
	}: { people: Pioneer[]; color: string; title?: string } = $props();
</script>

<section>
	{#if title}
		<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
	{/if}
	<div class="space-y-2">
		{#each people as pioneer (pioneer.name)}
			<PioneerCard {pioneer} {color} />
		{/each}
	</div>
</section>
