<script lang="ts">
	import { onMount } from 'svelte';
	import { buildThemedDefinition } from '$lib/utils/mermaid-helpers';
	import { getAppState } from '$lib/state/context';

	let {
		open = false,
		definition,
		caption,
		color,
		title,
		onclose
	}: {
		open?: boolean;
		definition: string;
		caption: string;
		color: string;
		title?: string;
		onclose?: () => void;
	} = $props();

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
			flowchart: {
				htmlLabels: true,
				curve: 'basis',
				useMaxWidth: true,
				padding: 16
			}
		});
		mermaidApi = mod.default;
	});

	$effect(() => {
		if (!open || !mermaidApi || !definition || !containerEl) return;

		const theme = appState.theme;
		const fullDef = buildThemedDefinition(definition, color, true, theme);
		const id = `mmd-story-modal-${++renderCounter}`;

		mermaidApi
			.render(id, fullDef)
			.then(({ svg }) => {
				containerEl.innerHTML = svg;
			})
			.catch((err) => {
				console.error('Story diagram modal render error:', err);
				containerEl.innerHTML =
					'<p class="text-xs text-t-muted py-4 text-center">Diagram unavailable</p>';
			});
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.stopImmediatePropagation();
			onclose?.();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose?.();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-8"
		role="dialog"
		aria-modal="true"
		aria-label="Expanded story diagram"
		tabindex="-1"
		onclick={handleBackdropClick}
	>
		<!-- Backdrop -->
		<div class="pointer-events-none absolute inset-0 bg-[var(--theme-overlay)] backdrop-blur-md"></div>

		<!-- Modal card -->
		<div
			class="modal-card relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-s-border bg-bg-deep shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-s-border px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="h-2 w-2 rounded-full" style="background-color: {color}"></div>
					<h3 class="text-sm font-semibold text-t-primary">
						{title ?? 'Diagram'}
					</h3>
				</div>
				<button
					class="flex h-7 w-7 items-center justify-center rounded-lg text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
					onclick={onclose}
					aria-label="Close"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Diagram content -->
			<div
				class="custom-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-6"
			>
				<div class="diagram-container w-full" bind:this={containerEl}>
					<div class="flex h-24 items-center justify-center">
						<span class="text-xs text-t-muted">Loading diagram...</span>
					</div>
				</div>
			</div>

			<!-- Footer with caption -->
			<div class="border-t border-s-border px-6 py-3">
				<p class="text-center text-xs text-t-muted">{caption}</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-card {
		animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: scale(0.92) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Override the default 100% width SVG so diagram centers naturally */
	.diagram-container :global(svg) {
		width: auto !important;
		max-width: 100%;
		height: auto;
		margin: 0 auto;
		display: block;
		background-color: transparent !important;
	}

	.diagram-container :global(.nodeLabel) {
		font-size: 14px !important;
	}

	.diagram-container :global(.edgeLabel) {
		font-size: 13px !important;
	}

	.diagram-container :global(.cluster-label) {
		font-size: 13px !important;
	}
</style>
