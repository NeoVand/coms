<script lang="ts">
	import { onMount } from 'svelte';
	import { diagramDefinitions } from '$lib/data/diagram-definitions';
	import { buildThemedDefinition, styleCrossArrows } from '$lib/utils/mermaid-helpers';
	import { getAppState } from '$lib/state/context';

	let {
		protocolId,
		color,
		expanded = false,
		hideCaption = false
	}: { protocolId: string; color: string; expanded?: boolean; hideCaption?: boolean } = $props();

	const appState = getAppState();
	let containerEl: HTMLDivElement;
	let mermaidApi: typeof import('mermaid').default | null = $state(null);
	let renderCounter = 0;

	onMount(async () => {
		const mod = await import('mermaid');
		mod.default.initialize({
			startOnLoad: false,
			theme: 'dark',
			securityLevel: 'loose',
			fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
			sequence: {
				actorMargin: 50,
				messageMargin: 25,
				mirrorActors: false,
				bottomMarginAdj: 10,
				useMaxWidth: true,
				actorFontSize: 13,
				messageFontSize: 12,
				noteFontSize: 12,
				boxMargin: 4,
				width: 90,
				height: 36,
				noteMargin: 6
			},
			flowchart: {
				htmlLabels: true,
				curve: 'basis',
				useMaxWidth: true,
				padding: 12
			}
		});
		mermaidApi = mod.default;
	});

	const definition = $derived(diagramDefinitions[protocolId]);

	$effect(() => {
		if (!mermaidApi || !definition || !containerEl) return;

		const theme = appState.theme;
		const fullDef = buildThemedDefinition(definition.definition, color, expanded, theme);
		const id = `mmd-${protocolId}-${expanded ? 'exp' : 'inl'}-${++renderCounter}`;

		mermaidApi
			.render(id, fullDef)
			.then(({ svg }) => {
				containerEl.innerHTML = svg;
				styleCrossArrows(containerEl);
			})
			.catch((err) => {
				console.error(`Mermaid render error [${protocolId}]:`, err);
				containerEl.innerHTML =
					'<p class="text-xs text-t-muted py-4">Diagram unavailable</p>';
			});
	});
</script>

<div class="mermaid-wrap">
	<div
		bind:this={containerEl}
		class="mermaid-container w-full overflow-x-auto"
		role="img"
		aria-label="Protocol diagram for {protocolId}"
	>
		<div class="flex h-40 items-center justify-center">
			<span class="text-xs text-t-muted">Loading diagram...</span>
		</div>
	</div>
	{#if definition?.caption && !hideCaption}
		<p class="mt-3 text-center text-[11px] italic text-t-muted">{definition.caption}</p>
	{/if}
</div>

<style>
	.mermaid-container :global(svg) {
		width: 100%;
		height: auto;
		background-color: transparent !important;
	}

	.mermaid-container :global(.messageText) {
		font-size: 12px !important;
		fill: var(--theme-text-secondary) !important;
	}

	.mermaid-container :global(.actor) {
		rx: 6;
	}

	.mermaid-container :global(.note) {
		rx: 3;
		fill-opacity: 0.6;
		stroke-opacity: 0.3;
		stroke-width: 1;
	}

	.mermaid-container :global(.noteText) {
		font-size: 12px !important;
	}

	.mermaid-container :global(.loopText tspan) {
		fill: var(--theme-text-secondary) !important;
		font-size: 11px !important;
	}

	.mermaid-container :global(.cross-arrow) {
		stroke: #ef4444 !important;
		opacity: 0.8;
	}
</style>
