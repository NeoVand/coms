<script lang="ts">
	let { open = false, onclose }: { open?: boolean; onclose?: () => void } = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--theme-overlay)] backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div class="relative mx-4 max-w-md rounded-2xl border border-s-border bg-bg-deep/95 p-6 shadow-2xl backdrop-blur-xl">
			<button
				class="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
				onclick={onclose}
				aria-label="Close"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<h2 class="text-lg font-bold text-t-primary">Keyboard Shortcuts</h2>
			<div class="mt-4 space-y-2 text-sm text-t-primary">
				<div class="flex justify-between"><span>Zoom in/out</span><kbd class="rounded bg-s-glass px-1.5 py-0.5 text-xs text-t-secondary">Scroll</kbd></div>
				<div class="flex justify-between"><span>Pan</span><kbd class="rounded bg-s-glass px-1.5 py-0.5 text-xs text-t-secondary">Drag</kbd></div>
				<div class="flex justify-between"><span>Select node</span><kbd class="rounded bg-s-glass px-1.5 py-0.5 text-xs text-t-secondary">Click</kbd></div>
				<div class="flex justify-between"><span>Deselect</span><kbd class="rounded bg-s-glass px-1.5 py-0.5 text-xs text-t-secondary">Click empty</kbd></div>
			</div>
		</div>
	</div>
{/if}
