<script lang="ts">
	import { getAppState } from '$lib/state/context';

	let { onhelp, onguide, panelOpen = false }: { onhelp?: () => void; onguide?: () => void; panelOpen?: boolean } = $props();

	const appState = getAppState();

	const zoomPercent = $derived(Math.round(appState.viewport.scale * 100));
</script>

<div class="absolute left-4 top-4 z-40 flex items-center gap-1" data-tour="zoom-controls">
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

	<button
		class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => onguide?.()}
		aria-label={panelOpen ? 'Close guide' : 'Open guide'}
		data-tour="guide-button"
	>
		{#if panelOpen}
			<!-- Open book icon -->
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
				<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
			</svg>
		{:else}
			<!-- Closed book icon -->
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
			</svg>
		{/if}
	</button>

	<button
		class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => onhelp?.()}
		aria-label="Help"
		data-tour="help-button"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	</button>
</div>
