<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data';
	import { getJourneyById } from '$lib/data/journeys';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		const journey = getJourneyById(id);
		if (!journey) return;
		// Avoid re-starting the journey on no-op effect runs.
		if (appState.activeJourney?.id !== id) {
			appState.startJourney(journey);
		}
		// Land on the journey's first protocol so the panel has context.
		const firstStep = journey.steps[0];
		if (firstStep) {
			const node = allNodes.find((n) => n.id === firstStep.protocolId);
			if (node && appState.selectedNode?.id !== firstStep.protocolId) {
				appState.selectNode(node);
			}
		}
	});

	const journey = $derived(getJourneyById(page.params.id ?? ''));
	const titleText = $derived(journey ? `${journey.title} · Protocol Lab` : 'Protocol Lab');
	const description = $derived(journey?.description ?? '');
</script>

<svelte:head>
	<title>{titleText}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>
