<script lang="ts" module>
	let globalRenderCounter = 0;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { buildThemedDefinition } from '$lib/utils/mermaid-helpers';
	import { getAppState } from '$lib/state/context';

	let {
		definition,
		caption,
		color,
		title
	}: {
		definition: string;
		caption: string;
		color: string;
		title?: string;
	} = $props();

	const appState = getAppState();
	const instanceId = ++globalRenderCounter;
	let containerEl: HTMLDivElement;
	let mermaidApi: typeof import('mermaid').default | null = $state(null);
	let localCounter = 0;

	onMount(async () => {
		const mod = await import('mermaid');
		mod.default.initialize({
			startOnLoad: false,
			theme: 'dark',
			securityLevel: 'loose',
			fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
			flowchart: {
				htmlLabels: true,
				curve: 'basis',
				useMaxWidth: true,
				padding: 12
			}
		});
		mermaidApi = mod.default;
	});

	$effect(() => {
		if (!mermaidApi || !definition || !containerEl) return;

		const theme = appState.theme;
		const fullDef = buildThemedDefinition(definition, color, false, theme);
		const id = `mmd-story-${instanceId}-${++localCounter}`;

		mermaidApi
			.render(id, fullDef)
			.then(({ svg }) => {
				containerEl.innerHTML = svg;
			})
			.catch((err) => {
				console.error('Story diagram render error:', err);
				containerEl.innerHTML =
					'<p class="text-xs text-t-muted py-4 text-center">Diagram unavailable</p>';
			});
	});
</script>

<section>
	<div class="mb-2 flex items-center justify-between">
		{#if title}
			<h3 class="text-xs font-semibold tracking-wider text-t-muted uppercase">{title}</h3>
		{:else}
			<span></span>
		{/if}
		<button
			class="flex h-6 w-6 items-center justify-center rounded-md text-t-muted transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={() => appState.openStoryDiagramModal(definition, caption, color, title)}
			aria-label="Expand diagram"
			title="View larger"
		>
			<svg
				class="h-3.5 w-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
				/>
			</svg>
		</button>
	</div>
	<div class="overflow-hidden rounded-xl border border-s-border bg-s-glass">
		<div
			bind:this={containerEl}
			class="mermaid-container w-full overflow-x-auto px-4 py-4"
			role="img"
			aria-label={caption}
		>
			<div class="flex h-24 items-center justify-center">
				<span class="text-xs text-t-muted">Loading diagram...</span>
			</div>
		</div>
		<p class="border-t border-s-border px-4 py-2.5 text-center text-[11px] text-t-muted italic">
			{caption}
		</p>
	</div>
</section>

<style>
	.mermaid-container :global(svg) {
		width: 100%;
		height: auto;
		background-color: transparent !important;
	}

	.mermaid-container :global(.nodeLabel) {
		font-size: 12px !important;
	}

	.mermaid-container :global(.edgeLabel) {
		font-size: 11px !important;
	}

	.mermaid-container :global(.cluster-label) {
		font-size: 11px !important;
	}
</style>
