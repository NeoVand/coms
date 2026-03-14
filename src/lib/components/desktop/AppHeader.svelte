<script lang="ts">
	import { BookMarked, BookOpen, CircleHelp } from 'lucide-svelte';

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
		class="icon-btn flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => onguide?.()}
		aria-label={panelOpen ? 'Close guide' : 'Open guide'}
		data-tour="guide-button"
	>
		{#if panelOpen}
			<BookOpen size={16} strokeWidth={1.8} />
		{:else}
			<BookMarked size={16} strokeWidth={1.8} />
		{/if}
	</button>

	<button
		class="icon-btn flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200"
		onclick={() => onhelp?.()}
		aria-label="Help"
		data-tour="help-button"
	>
		<CircleHelp size={16} />
	</button>
</div>

<style>
	.icon-btn :global(svg) {
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.icon-btn:hover :global(svg) {
		transform: scale(1.15) rotate(-5deg);
	}
</style>
