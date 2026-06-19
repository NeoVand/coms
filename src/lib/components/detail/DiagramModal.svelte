<script lang="ts">
	import SequencePlayer from './SequencePlayer.svelte';
	import { getProtocolById } from '$lib/data/index';
	import { diagramDefinitions } from '$lib/data/diagram-definitions';

	let {
		open = false,
		protocolId,
		color,
		onclose
	}: {
		open?: boolean;
		protocolId: string;
		color: string;
		onclose?: () => void;
	} = $props();

	const protocol = $derived(getProtocolById(protocolId));
	const hasDiagram = $derived(protocolId in diagramDefinitions);

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
		class="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6"
		role="dialog"
		aria-modal="true"
		aria-label="Expanded protocol diagram"
		tabindex="-1"
		onclick={handleBackdropClick}
	>
		<!-- Backdrop -->
		<div
			class="pointer-events-none absolute inset-0 bg-[var(--theme-overlay)] backdrop-blur-md"
		></div>

		<!-- Modal card -->
		<div
			class="modal-card relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-s-border bg-bg-deep shadow-2xl sm:max-h-[92vh]"
		>
			<!-- Header -->
			<div
				class="flex shrink-0 items-center justify-between border-b border-s-border px-4 py-3 sm:px-6 sm:py-4"
			>
				<div class="flex items-center gap-2 sm:gap-3">
					<div class="h-2 w-2 rounded-full" style="background-color: {color}"></div>
					<h3 class="text-sm font-semibold text-t-primary sm:text-base">
						{protocol?.abbreviation ?? protocolId.toUpperCase()}
					</h3>
					<span class="hidden text-xs text-t-muted sm:inline">Sequence Diagram</span>
				</div>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-lg text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
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

			<!-- Player content (scrollable if it overflows) -->
			<div class="custom-scrollbar flex flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
				{#if hasDiagram}
					<SequencePlayer {protocolId} {color} expanded={true} />
				{:else}
					<p class="py-12 text-center text-sm text-t-muted">No diagram available.</p>
				{/if}
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
</style>
