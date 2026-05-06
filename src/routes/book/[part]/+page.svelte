<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getBookPart } from '$lib/data/book/chapters';

	const appState = getAppState();

	/**
	 * Set the active part-TOC reading target. The side panel's
	 * BookPartView reads `activeBookPartToc` and renders the matching
	 * detailed table of contents for that part. Clear all other
	 * reading-surface flags so the panel is unambiguous.
	 */
	$effect(() => {
		const partId = page.params.part;
		if (!partId) return;
		if (appState.selectedNode) appState.selectedNode = null;
		appState.activeBookChapter = null;
		appState.activeBookPart = null;
		appState.activePioneer = null;
		appState.activeRfc = null;
		appState.activeOutage = null;
		appState.activeFrontier = null;
		appState.activeRegistryIndex = null;
		if (appState.activeBookPartToc !== partId) appState.activeBookPartToc = partId;
		appState.showDetailPanel = true;
	});

	const part = $derived(getBookPart(page.params.part ?? ''));
	const titleText = $derived(
		part ? `Part ${part.label} — ${part.title} · The Book of Protocols` : 'The Book of Protocols'
	);
</script>

<svelte:head>
	<title>{titleText}</title>
</svelte:head>
