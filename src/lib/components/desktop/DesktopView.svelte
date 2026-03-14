<script lang="ts">
	import GraphCanvas from './GraphCanvas.svelte';
	import NodeTooltip from './NodeTooltip.svelte';
	import AppHeader from './AppHeader.svelte';
	import LayoutPicker from './LayoutPicker.svelte';
	import DetailPanel from '$lib/components/detail/DetailPanel.svelte';
	import DiagramModal from '$lib/components/detail/DiagramModal.svelte';
	import StoryDiagramModal from '$lib/components/detail/StoryDiagramModal.svelte';
	import StoryImageModal from '$lib/components/detail/StoryImageModal.svelte';
	import AccessibleGraph from '$lib/components/a11y/AccessibleGraph.svelte';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { startTour } from '$lib/tour/app-tour';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	function toggleGuide() {
		if (appState.showDetailPanel && appState.selectedNode) {
			// Panel is open — close it
			appState.clearSelection();
		} else {
			// Panel is closed — open it (select hub if nothing selected)
			const hub = allNodes.find((n) => n.type === 'hub');
			if (hub) appState.selectNode(hub);
		}
	}
</script>

<div class="relative h-full w-full overflow-hidden bg-bg-deep">
	<!-- Canvas layer -->
	<GraphCanvas />

	<!-- HTML overlay layer -->
	<NodeTooltip />
	<AppHeader
		onguide={toggleGuide}
		panelOpen={appState.showDetailPanel}
		onhelp={() => startTour(appState, allNodes)}
	/>

	<!-- Detail panel -->
	{#if appState.showDetailPanel && appState.selectedNode}
		<DetailPanel />
	{/if}

	<!-- Layout picker (bottom-center) -->
	<LayoutPicker />

	<!-- Accessibility tree (visually hidden) -->
	<AccessibleGraph />
</div>

<!-- Diagram modal (rendered outside panel to escape stacking contexts) -->
{#if appState.diagramModal}
	<DiagramModal
		open={true}
		protocolId={appState.diagramModal.protocolId}
		color={appState.diagramModal.color}
		onclose={() => appState.closeDiagramModal()}
	/>
{/if}

<!-- Story diagram modal -->
{#if appState.storyDiagramModal}
	<StoryDiagramModal
		open={true}
		definition={appState.storyDiagramModal.definition}
		caption={appState.storyDiagramModal.caption}
		color={appState.storyDiagramModal.color}
		title={appState.storyDiagramModal.title}
		onclose={() => appState.closeStoryDiagramModal()}
	/>
{/if}

<!-- Story image modal -->
{#if appState.storyImageModal}
	<StoryImageModal
		open={true}
		src={appState.storyImageModal.src}
		alt={appState.storyImageModal.alt}
		caption={appState.storyImageModal.caption}
		credit={appState.storyImageModal.credit}
		color={appState.storyImageModal.color}
		title={appState.storyImageModal.title}
		onclose={() => appState.closeStoryImageModal()}
	/>
{/if}
