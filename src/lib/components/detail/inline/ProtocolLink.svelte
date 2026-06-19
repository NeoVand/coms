<script lang="ts" module>
	import { buildGraphNodes } from '$lib/data/index';
	import type { GraphNode } from '$lib/data/types';

	const nodeMap: Map<string, GraphNode> = new Map(buildGraphNodes().map((n) => [n.id, n]));
</script>

<script lang="ts">
	import { navigateToProtocol } from '$lib/utils/navigation';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		protocolId: string;
		label: string;
		color: string;
		bold?: boolean;
	}

	let { protocolId, label, color, bold = false }: Props = $props();

	const appState = getAppState();
	const node = $derived(nodeMap.get(protocolId));
	// Theme-aware colour — dark-mode neon hex would be unreadable on the
	// light-mode panel background, so remap to the deeper variant in light mode.
	const displayColor = $derived(themedDomColor(color, appState.theme));

	let btn: HTMLButtonElement | undefined = $state();

	function show() {
		if (!node || !btn) return;
		appState.hoveredAnchor = btn.getBoundingClientRect();
		appState.hoveredNode = node;
		// Pan the graph to bring this node into the visible area (and
		// un-dim it via the canvas renderer's hover override). We prefer
		// the *live* node so we read the simulation's current x/y, not
		// the stale static (0,0) from the static lookup map.
		if (!appState.isMobile) {
			const live = appState.findLiveNode(protocolId) ?? node;
			appState.focusOnHover(live, window.innerWidth, window.innerHeight);
		}
	}

	function hide() {
		if (appState.hoveredNode?.id === protocolId) {
			appState.hoveredNode = null;
			appState.hoveredAnchor = null;
			appState.endHoverFocus();
		}
	}

	$effect(() => {
		return hide;
	});
</script>

<button
	bind:this={btn}
	class="inline transition-colors hover:underline {bold ? 'font-semibold' : 'font-medium'}"
	style="color: {displayColor}"
	onclick={(e) => {
		e.stopPropagation();
		navigateToProtocol(protocolId);
	}}
	onmouseenter={show}
	onmouseleave={hide}
	onfocus={show}
	onblur={hide}>{label}</button
>
