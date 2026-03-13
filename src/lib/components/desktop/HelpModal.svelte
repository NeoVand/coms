<script lang="ts">
	let { open = false, onclose }: { open?: boolean; onclose?: () => void } = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div class="relative mx-4 max-w-md rounded-2xl border border-white/10 bg-bg-deep/95 p-6 shadow-2xl backdrop-blur-xl">
			<button
				class="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
				onclick={onclose}
				aria-label="Close"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<h2 class="text-lg font-bold text-slate-100">Keyboard Shortcuts</h2>
			<div class="mt-4 space-y-2 text-sm text-slate-300">
				<div class="flex justify-between"><span>Zoom in/out</span><kbd class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-400">Scroll</kbd></div>
				<div class="flex justify-between"><span>Pan</span><kbd class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-400">Drag</kbd></div>
				<div class="flex justify-between"><span>Select node</span><kbd class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-400">Click</kbd></div>
				<div class="flex justify-between"><span>Deselect</span><kbd class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-400">Click empty</kbd></div>
			</div>
		</div>
	</div>
{/if}
