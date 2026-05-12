<script lang="ts">
	import { categories } from '$lib/data/categories';
	import { getProtocolsForCategory } from '$lib/data/index';
	import { navigateToCategory, navigateToProtocol } from '$lib/utils/navigation';
	import { stripRichTextMarkup } from '$lib/utils/text-parser';
</script>

<!-- Screen-reader accessible tree structure (visually hidden) -->
<div
	class="sr-only"
	role="tree"
	aria-label="Protocol Lab — Interactive communication protocols visualization"
>
	{#each categories as cat (cat.id)}
		{@const protocols = getProtocolsForCategory(cat.id)}
		{@const plainCatDescription = stripRichTextMarkup(cat.description)}
		<div
			role="treeitem"
			aria-label="{cat.name} — {plainCatDescription}"
			aria-expanded="true"
			aria-selected="false"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Enter') navigateToCategory(cat.id);
			}}
		>
			<span>{cat.name}: {plainCatDescription}</span>
			<div role="group">
				{#each protocols as proto (proto.id)}
					{@const plainOneLiner = stripRichTextMarkup(proto.oneLiner)}
					<div
						role="treeitem"
						aria-label="{proto.abbreviation} — {proto.name}. {plainOneLiner}"
						aria-selected="false"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter') navigateToProtocol(proto.id);
						}}
					>
						{proto.abbreviation}: {plainOneLiner}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
