<script lang="ts">
	import { page } from '$app/state';
	import { getAppState } from '$lib/state/context';
	import { getRfcByNumber } from '$lib/data/rfcs';

	const appState = getAppState();

	$effect(() => {
		const num = page.params.number;
		if (!num) return;
		if (appState.selectedNode) appState.selectedNode = null;
		if (appState.activeBookChapter) appState.activeBookChapter = null;
		if (appState.activePioneer) appState.activePioneer = null;
		if (appState.activeRfc !== num) appState.activeRfc = num;
		appState.showDetailPanel = true;
	});

	const rfc = $derived(getRfcByNumber(page.params.number ?? ''));
	const titleText = $derived(
		rfc ? `RFC ${rfc.number} — ${rfc.title} · Protocol Lab` : 'RFC · Protocol Lab'
	);
</script>

<svelte:head>
	<title>{titleText}</title>
</svelte:head>
