<script lang="ts">
	import { categories } from '$lib/data/categories';
	import { getProtocolsForCategory } from '$lib/data/index';
	import { buildGraphNodes } from '$lib/data/index';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();
	const allNodes = buildGraphNodes();
</script>

<!-- Screen-reader accessible tree structure (visually hidden) -->
<div
	class="sr-only"
	role="tree"
	aria-label="Protocol Lab — Interactive communication protocols visualization"
>
	{#each categories as cat (cat.id)}
		{@const protocols = getProtocolsForCategory(cat.id)}
		<div
			role="treeitem"
			aria-label="{cat.name} — {cat.description}"
			aria-expanded="true"
			aria-selected="false"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					const node = allNodes.find((n) => n.id === cat.id);
					if (node) appState.selectNode(node);
				}
			}}
		>
			<span>{cat.name}: {cat.description}</span>
			<div role="group">
				{#each protocols as proto (proto.id)}
					<div
						role="treeitem"
						aria-label="{proto.abbreviation} — {proto.name}. {proto.oneLiner}"
						aria-selected="false"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								const node = allNodes.find((n) => n.id === proto.id);
								if (node) appState.selectNode(node);
							}
						}}
					>
						{proto.abbreviation}: {proto.oneLiner}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
