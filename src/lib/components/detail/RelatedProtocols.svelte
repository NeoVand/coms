<script lang="ts">
	import { getProtocolById, getProtocolColor } from '$lib/data/index';
	import { navigateToProtocol } from '$lib/utils/navigation';
	import { getAppState } from '$lib/state/context';

	let { connections }: { connections: string[] } = $props();

	const appState = getAppState();

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
					{@const c = getProtocolColor(proto.id, appState.theme)}
					<button
						class="rounded-lg border bg-s-glass px-3 py-1.5 text-xs font-semibold transition-all hover:bg-s-glass-hover"
						style="color: {c}; border-color: {c}40;"
						onclick={() => navigateToProtocol(proto.id)}
					>
						{proto.abbreviation}
					</button>
				{/if}
			{/each}
		</div>
	</section>
{/if}
