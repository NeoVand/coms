<script lang="ts">
	import GraphCanvas from './GraphCanvas.svelte';
	import NodeTooltip from './NodeTooltip.svelte';
	import AppHeader from './AppHeader.svelte';
	import LayoutPicker from './LayoutPicker.svelte';
	import DetailPanel from '$lib/components/detail/DetailPanel.svelte';
	import DiagramModal from '$lib/components/detail/DiagramModal.svelte';
	import StoryDiagramModal from '$lib/components/detail/StoryDiagramModal.svelte';
	import StoryImageModal from '$lib/components/detail/StoryImageModal.svelte';
	import ConceptTooltip from '$lib/components/detail/ConceptTooltip.svelte';
	import AccessibleGraph from '$lib/components/a11y/AccessibleGraph.svelte';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { startTour } from '$lib/tour/app-tour';
	import { navigateToHub, navigateToHubPanel } from '$lib/utils/navigation';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	function toggleGuide() {
		if (appState.showDetailPanel && appState.selectedNode) {
			// Panel is open — close it (URL → /, selection clears).
			navigateToHub();
		} else {
			// Panel is closed — open the hub welcome view at /hub.
			navigateToHubPanel();
		}
	}
</script>

<div class="relative h-full w-full overflow-hidden bg-bg-deep">
	<!-- Canvas layer -->
	<GraphCanvas />

	<!-- HTML overlay layer -->
	{#if !appState.isMobile}
		<NodeTooltip />
	{/if}
	<AppHeader
		onguide={toggleGuide}
		panelOpen={appState.showDetailPanel}
		onhelp={() => startTour(appState, allNodes)}
	/>

	<!-- Detail panel: visible when there's a graph selection OR any
	     open standalone reading surface (chapter, pioneer bio, RFC,
	     outage replay, frontier entry, registry index, book TOC).
	     All read in the same surface. -->
	{#if appState.showDetailPanel && (appState.selectedNode || appState.activeBookChapter || appState.activePioneer || appState.activeRfc || appState.activeOutage || appState.activeFrontier || appState.activeRegistryIndex || appState.activeBookPartToc)}
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

<!-- Concept tooltip -->
{#if appState.conceptTooltip}
	<ConceptTooltip
		concept={appState.conceptTooltip.concept}
		triggerRect={appState.conceptTooltip.triggerRect}
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
