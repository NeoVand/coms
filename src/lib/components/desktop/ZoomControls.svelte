<script lang="ts">
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	const zoomPercent = $derived(Math.round(appState.viewport.scale * 100));
</script>

<div class="absolute right-4 bottom-4 z-40 flex items-center gap-1">
	<div
		class="flex items-center gap-0.5 rounded-xl border border-white/10 bg-bg-deep/80 p-1 shadow-lg backdrop-blur-xl"
	>
		<button
			class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
			onclick={() => appState.zoom(appState.viewport.scale * 0.8, 0, 0)}
			aria-label="Zoom out"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>

		<button
			class="min-w-[40px] px-1 text-center text-[10px] font-medium text-slate-400 transition-colors hover:text-slate-200"
			onclick={() => appState.resetViewport()}
			aria-label="Reset zoom"
		>
			{zoomPercent}%
		</button>

		<button
			class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
			onclick={() => appState.zoom(appState.viewport.scale * 1.25, 0, 0)}
			aria-label="Zoom in"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</div>
