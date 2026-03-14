<script lang="ts">
	let { onhelp, onguide, panelOpen = false }: { onhelp?: () => void; onguide?: () => void; panelOpen?: boolean } = $props();
</script>

<div class="absolute left-4 top-4 z-40 flex items-center gap-1.5">
	<!-- App branding -->
	<div class="flex items-center gap-2.5 px-1">
		<!-- Network constellation icon -->
		<svg viewBox="0 0 20 20" class="h-5 w-5 shrink-0" fill="none">
			<circle cx="4" cy="5" r="2" fill="#6ee7b7" />
			<circle cx="16" cy="5" r="2" fill="#7dd3fc" />
			<circle cx="10" cy="16" r="2" fill="#c4b5fd" />
			<line x1="5.7" y1="6.2" x2="8.8" y2="14.5" stroke="#6ee7b780" stroke-width="1.2" />
			<line x1="14.3" y1="6.2" x2="11.2" y2="14.5" stroke="#7dd3fc80" stroke-width="1.2" />
			<line x1="6" y1="5" x2="14" y2="5" stroke="#a5b4fc60" stroke-width="1.2" />
		</svg>
		<span class="text-sm font-semibold tracking-wide text-slate-200">Protocol Lab</span>
	</div>

	<button
		class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => onguide?.()}
		aria-label={panelOpen ? 'Close guide' : 'Open guide'}
		data-tour="guide-button"
	>
		{#if panelOpen}
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
				<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
			</svg>
		{:else}
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
