<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import type { LayoutMode } from '$lib/engine/layouts';

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

<div class="absolute bottom-4 left-4 z-40 flex items-center gap-2" data-tour="layout-picker">
	<!-- Compact zoom controls -->
	<div
		class="flex items-center gap-0.5 rounded-full border border-white/10 bg-slate-900/80 p-0.5 shadow-lg backdrop-blur-md"
	>
		<button
			class="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
			onclick={() => appState.zoom(appState.viewport.scale * 0.8, 0, 0)}
			aria-label="Zoom out"
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>

		<button
			class="min-w-[34px] px-0.5 text-center text-[10px] font-medium text-slate-400 transition-colors hover:text-slate-200"
			onclick={() => appState.resetViewport()}
			aria-label="Reset zoom"
		>
			{zoomPercent}%
		</button>

		<button
			class="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
			onclick={() => appState.zoom(appState.viewport.scale * 1.25, 0, 0)}
			aria-label="Zoom in"
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	<!-- Floating menu — opens upward -->
	{#if open}
		<div
			class="absolute bottom-full left-0 mb-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-md"
			role="menu"
		>
			{#each layouts as layout (layout.id)}
				{@const isActive = appState.layoutMode === layout.id}
				<button
					class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors {isActive
						? 'bg-white/5 text-slate-100'
						: 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-300'}"
					onclick={() => select(layout.id)}
					role="menuitem"
				>
					<!-- Icon -->
					<span class="flex h-5 w-5 shrink-0 items-center justify-center opacity-70">
						{#if layout.id === 'force'}
							<!-- Three dots with edges -->
							<svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.5">
								<circle cx="10" cy="4" r="2" fill="currentColor" stroke="none"/>
								<circle cx="4" cy="15" r="2" fill="currentColor" stroke="none"/>
								<circle cx="16" cy="15" r="2" fill="currentColor" stroke="none"/>
								<line x1="10" y1="6" x2="5.5" y2="13.3"/>
								<line x1="10" y1="6" x2="14.5" y2="13.3"/>
								<line x1="6" y1="15" x2="14" y2="15"/>
							</svg>
						{:else if layout.id === 'radial'}
							<!-- Concentric rings -->
							<svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.5">
								<circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>
								<circle cx="10" cy="10" r="5" />
								<circle cx="10" cy="10" r="8.5" />
							</svg>
						{:else if layout.id === 'timeline'}
							<!-- Horizontal lines with dots (timeline) -->
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
						<svg viewBox="0 0 16 16" class="ml-auto h-3 w-3 shrink-0 text-slate-300" fill="currentColor">
							<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Trigger pill -->
	<button
		class="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-md transition-colors hover:border-white/20 hover:text-slate-100"
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
		<svg
			viewBox="0 0 16 16"
			class="h-3 w-3 shrink-0 opacity-50 transition-transform"
			class:rotate-180={open}
			fill="currentColor"
		>
			<path d="M8 3.293L1.146 10.146a.5.5 0 0 0 .708.708L8 4.707l6.146 6.147a.5.5 0 0 0 .708-.708L8 3.293z"/>
		</svg>
	</button>
</div>
