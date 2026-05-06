<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getChapter } from '$lib/data/book/chapters';

	const appState = getAppState();

	/**
	 * Set the (part, chapter) pair as the active reading target — the side
	 * panel's ChapterView reads `activeBookPart` + `activeBookChapter` and
	 * renders the matching chapter. Clear any prior graph selection so the
	 * panel is unambiguously a reading surface.
	 */
	$effect(() => {
		const partId = page.params.part;
		const chapterId = page.params.chapter;
		if (!partId || !chapterId) return;
		if (appState.selectedNode) appState.selectedNode = null;
		appState.activePioneer = null;
		appState.activeRfc = null;
		appState.activeOutage = null;
		appState.activeFrontier = null;
		appState.activeRegistryIndex = null;
		appState.activeBookPartToc = null;
		if (appState.activeBookPart !== partId) appState.activeBookPart = partId;
		if (appState.activeBookChapter !== chapterId) appState.activeBookChapter = chapterId;
		appState.showDetailPanel = true;
	});

	const chapter = $derived(getChapter(page.params.part ?? '', page.params.chapter ?? ''));
	const titleText = $derived(
		chapter ? `${chapter.title} · The Book of Protocols` : 'The Book of Protocols'
	);
</script>

<svelte:head>
	<title>{titleText}</title>
</svelte:head>
