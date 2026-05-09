<script lang="ts" module>
	import { buildGraphNodes } from '$lib/data/index';
	import type { GraphNode } from '$lib/data/types';

	const nodeMap: Map<string, GraphNode> = new Map(
		buildGraphNodes().map((n) => [n.id, n])
	);
</script>

<script lang="ts">
	import { navigateToProtocol } from '$lib/utils/navigation';
	import { getAppState } from '$lib/state/context';

	interface Props {
		protocolId: string;
		label: string;
		color: string;
		bold?: boolean;
	}

	let { protocolId, label, color, bold = false }: Props = $props();

	const appState = getAppState();
	const node = $derived(nodeMap.get(protocolId));

	let btn: HTMLButtonElement | undefined = $state();

	function show() {
		if (!node || !btn) return;
		appState.hoveredAnchor = btn.getBoundingClientRect();
		appState.hoveredNode = node;
	}

	function hide() {
		if (appState.hoveredNode?.id === protocolId) {
			appState.hoveredNode = null;
			appState.hoveredAnchor = null;
		}
	}

	$effect(() => {
		return hide;
	});
</script>

<button
	bind:this={btn}
	class="inline transition-colors hover:underline {bold ? 'font-semibold' : 'font-medium'}"
	style="color: {color}"
	onclick={() => navigateToProtocol(protocolId)}
	onmouseenter={show}
	onmouseleave={hide}
	onfocus={show}
	onblur={hide}>{label}</button
>
