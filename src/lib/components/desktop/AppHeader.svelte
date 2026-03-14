<script lang="ts">
	import { BookMarked, BookOpen, CircleHelp } from 'lucide-svelte';

	let { onhelp, onguide, panelOpen = false }: { onhelp?: () => void; onguide?: () => void; panelOpen?: boolean } = $props();
</script>

<div class="absolute left-3 top-3 z-40 flex items-center gap-1 md:left-4 md:top-4 md:gap-1.5">
	<!-- App branding -->
	<div class="flex items-center gap-2.5 px-1">
		<!-- Network constellation icon -->
		<svg viewBox="0 0 20 20" class="h-5 w-5 shrink-0" fill="none">
			<!-- Connecting lines (behind nodes) -->
			<line x1="10" y1="8.5" x2="10" y2="5" stroke="#6ee7b7" stroke-width="1.2" opacity="0.5" />
			<line x1="8.8" y1="10.8" x2="5.6" y2="12.3" stroke="#c4b5fd" stroke-width="1.2" opacity="0.5" />
			<line x1="11.2" y1="10.8" x2="14.4" y2="12.3" stroke="#7dd3fc" stroke-width="1.2" opacity="0.5" />
			<!-- Outer nodes — equilateral triangle -->
			<circle cx="10" cy="3" r="2" fill="#6ee7b7" />
			<circle cx="4" cy="13.5" r="2" fill="#c4b5fd" />
			<circle cx="16" cy="13.5" r="2" fill="#7dd3fc" />
			<!-- Center hub -->
			<circle cx="10" cy="10" r="1.5" fill="#e2e8f0" />
		</svg>
		<span class="text-sm font-semibold tracking-wide text-slate-200">Protocol Lab</span>
	</div>

	<button
		class="icon-btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200 md:h-9 md:w-9"
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
		class="icon-btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200 md:h-9 md:w-9"
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
