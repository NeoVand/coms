<script lang="ts">
	import { getProtocolById } from '$lib/data/index';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';

	let { connections }: { connections: string[] } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	const related = $derived(
		connections
			.map((id) => {
				const proto = getProtocolById(id);
				if (!proto) return null;
				return proto;
			})
			.filter(Boolean)
	);
</script>

{#if related.length > 0}
	<section data-tour="related-protocols">
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
			Related Protocols
		</h3>
		<div class="flex flex-wrap gap-2">
			{#each related as proto (proto?.id)}
				{#if proto}
					<button
						class="rounded-lg border border-s-border bg-s-glass px-3 py-1.5 text-xs font-medium text-t-primary transition-all hover:border-s-border hover:bg-s-glass-hover"
						onclick={() => {
							const node = allNodes.find((n) => n.id === proto.id);
							if (node) appState.selectNode(node);
						}}
					>
						{proto.abbreviation}
					</button>
				{/if}
			{/each}
		</div>
	</section>
{/if}
