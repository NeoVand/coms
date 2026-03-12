<script lang="ts">
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();
	let inputEl: HTMLInputElement;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === '/' && document.activeElement !== inputEl) {
			e.preventDefault();
			inputEl.focus();
		}
		if (e.key === 'Escape' && document.activeElement === inputEl) {
			appState.setSearch('');
			inputEl.blur();
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="absolute top-4 left-4 z-40">
	<div
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-deep/80 px-3 py-2 shadow-lg backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-bg-deep/90"
	>
		<svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
		<input
			bind:this={inputEl}
			type="text"
			placeholder="Search protocols..."
			value={appState.searchQuery}
			oninput={(e) => appState.setSearch(e.currentTarget.value)}
			class="w-48 border-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
		/>
		{#if !appState.searchQuery}
			<kbd class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">/</kbd>
		{:else}
			<button
				class="text-slate-400 transition-colors hover:text-slate-200"
				onclick={() => appState.setSearch('')}
				aria-label="Clear search"
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>
</div>
