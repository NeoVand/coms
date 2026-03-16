<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import type { LayoutMode } from '$lib/engine/layouts';
	import { Minus, Plus, ChevronUp } from 'lucide-svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const appState = getAppState();

	const zoomPercent = $derived(Math.round(appState.viewport.scale * 100));

	let open = $state(false);

	const layouts: { id: LayoutMode; label: string }[] = [
		{ id: 'force', label: 'Force' },
		{ id: 'radial', label: 'Radial' },
		{ id: 'timeline', label: 'Timeline' }
	];

	function select(mode: LayoutMode) {
		appState.layoutMode = mode;
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Click-outside -->
{#if open}
	<button
		class="fixed inset-0 z-30"
		onclick={() => (open = false)}
		aria-label="Close layout menu"
		tabindex="-1"
	></button>
{/if}

<div class="absolute bottom-3 left-3 z-40 flex items-center gap-1.5 md:bottom-4 md:left-4 md:gap-2" data-tour="layout-picker">
	<!-- Compact zoom controls -->
	<div
		class="flex items-center gap-0.5 rounded-full border border-s-border bg-bg-deep/80 p-0.5 shadow-lg backdrop-blur-xl"
	>
		<button
			class="flex h-6 w-6 items-center justify-center rounded-full text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={() => appState.zoom(appState.viewport.scale * 0.8, 0, 0)}
			aria-label="Zoom out"
		>
			<Minus size={12} strokeWidth={2} />
		</button>

		<button
			class="min-w-[34px] px-0.5 text-center text-[10px] font-medium text-t-secondary transition-colors hover:text-t-primary"
			onclick={() => appState.resetViewport()}
			aria-label="Reset zoom"
		>
			{zoomPercent}%
		</button>

		<button
			class="flex h-6 w-6 items-center justify-center rounded-full text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={() => appState.zoom(appState.viewport.scale * 1.25, 0, 0)}
			aria-label="Zoom in"
		>
			<Plus size={12} strokeWidth={2} />
		</button>
	</div>

	<!-- Layout selector wrapper (relative for dropdown positioning) -->
	<div class="relative">
	<!-- Floating menu — opens upward -->
	{#if open}
		<div
			class="absolute bottom-full left-0 mb-2 overflow-hidden rounded-xl border border-s-border bg-bg-deep/95 shadow-2xl backdrop-blur-xl"
			role="menu"
		>
			{#each layouts as layout (layout.id)}
				{@const isActive = appState.layoutMode === layout.id}
				<button
					class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors {isActive
						? 'bg-s-glass text-t-primary'
						: 'text-t-secondary hover:bg-s-glass-hover hover:text-t-primary'}"
					onclick={() => select(layout.id)}
					role="menuitem"
				>
					<!-- Icon -->
					<span class="flex h-5 w-5 shrink-0 items-center justify-center opacity-70">
						{#if layout.id === 'force'}
							<svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.5">
								<circle cx="10" cy="4" r="2" fill="currentColor" stroke="none"/>
								<circle cx="4" cy="15" r="2" fill="currentColor" stroke="none"/>
								<circle cx="16" cy="15" r="2" fill="currentColor" stroke="none"/>
								<line x1="10" y1="6" x2="5.5" y2="13.3"/>
								<line x1="10" y1="6" x2="14.5" y2="13.3"/>
								<line x1="6" y1="15" x2="14" y2="15"/>
							</svg>
						{:else if layout.id === 'radial'}
							<svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.5">
								<circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>
								<circle cx="10" cy="10" r="5" />
								<circle cx="10" cy="10" r="8.5" />
							</svg>
						{:else if layout.id === 'timeline'}
							<svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.5">
								<line x1="1" y1="5.5" x2="19" y2="5.5"/>
								<line x1="1" y1="10" x2="19" y2="10"/>
								<line x1="1" y1="14.5" x2="19" y2="14.5"/>
								<circle cx="5" cy="5.5" r="2" fill="currentColor" stroke="none"/>
								<circle cx="12" cy="10" r="2" fill="currentColor" stroke="none"/>
								<circle cx="8" cy="14.5" r="2" fill="currentColor" stroke="none"/>
								<circle cx="16" cy="5.5" r="2" fill="currentColor" stroke="none"/>
							</svg>
						{/if}
					</span>
					<span class="w-16 font-medium tracking-wide">{layout.label}</span>
					{#if isActive}
						<svg viewBox="0 0 16 16" class="ml-auto h-3 w-3 shrink-0 text-t-primary" fill="currentColor">
							<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Trigger pill -->
	<button
		class="flex items-center gap-2 rounded-full border border-s-border bg-bg-deep/80 px-3.5 py-1.5 text-xs font-medium text-t-primary shadow-lg backdrop-blur-xl transition-colors hover:border-s-border hover:text-t-primary"
		onclick={() => (open = !open)}
		aria-haspopup="true"
		aria-expanded={open}
	>
		<!-- Layout icon (small) -->
		<svg viewBox="0 0 16 16" class="h-3 w-3 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="1.5">
			<circle cx="8" cy="8" r="3"/>
			<circle cx="8" cy="8" r="7"/>
		</svg>
		<span>{layouts.find((l) => l.id === appState.layoutMode)?.label ?? 'Layout'}</span>
		<span class="opacity-50 transition-transform" class:rotate-180={open}>
			<ChevronUp size={12} strokeWidth={2} />
		</span>
	</button>
	</div>

	<!-- Theme toggle -->
	<ThemeToggle />

	<!-- GitHub link -->
	<a
		href="https://github.com/NeoVand/coms"
		target="_blank"
		rel="noopener noreferrer"
		class="flex h-7 w-7 items-center justify-center rounded-full border border-s-border bg-bg-deep/80 text-t-secondary shadow-lg backdrop-blur-xl transition-colors hover:text-t-primary"
		aria-label="View on GitHub"
	>
		<svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor">
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
		</svg>
	</a>
</div>
