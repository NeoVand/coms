<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getFoundationSection } from '$lib/data/concept-foundations';

	const appState = getAppState();

	/**
	 * Set the chapter as the active reading target — the side panel's
	 * ChapterView reads `activeBookChapter` and renders the matching
	 * foundation section. Clear any prior graph selection so the panel
	 * is unambiguously a reading surface.
	 */
	$effect(() => {
		const id = page.params.chapter;
		if (!id) return;
		if (appState.selectedNode) appState.selectedNode = null;
		if (appState.activeBookChapter !== id) appState.activeBookChapter = id;
		appState.showDetailPanel = true;
	});

	const section = $derived(getFoundationSection(page.params.chapter ?? ''));
	const titleText = $derived(
		section ? `${section.title} · The Book of Protocols` : 'The Book of Protocols'
	);
</script>

<svelte:head>
	<title>{titleText}</title>
</svelte:head>
