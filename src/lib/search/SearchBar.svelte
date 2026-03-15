<script lang="ts">
	import {
		Search,
		X,
		CircuitBoard,
		Layers,
		Scale,
		Lightbulb,
		Compass,
		BookOpen
	} from 'lucide-svelte';
	import {
		search,
		collectProtocolIds,
		type SearchEntry,
		type SearchResultType
	} from './search-index';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import { journeys } from '$lib/data/journeys';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	let query = $state('');
	let open = $state(false);
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();
	let scrollEl: HTMLDivElement | undefined = $state();
	let canScrollDown = $state(false);

	const results = $derived(search(query));

	// Group results by type for sectioned display
	const grouped = $derived.by(() => {
		const groups: { type: SearchResultType; entries: SearchEntry[] }[] = [];
		const map = new Map<SearchResultType, SearchEntry[]>();
		for (const r of results) {
			if (!map.has(r.type)) {
				const arr: SearchEntry[] = [];
				map.set(r.type, arr);
				groups.push({ type: r.type, entries: arr });
			}
			map.get(r.type)!.push(r);
		}
		return groups;
	});

	// Push highlighting to canvas
	$effect(() => {
		if (open && query.trim()) {
			appState.searchHighlightIds = collectProtocolIds(results);
		} else {
			appState.searchHighlightIds = null;
		}
	});

	// Reset selected index when results change and check scroll overflow
	$effect(() => {
		void results;
		selectedIndex = 0;
		requestAnimationFrame(() => {
			if (scrollEl) {
				canScrollDown = scrollEl.scrollHeight > scrollEl.clientHeight;
			}
		});
	});

	const groupMeta: Record<SearchResultType, { label: string; icon: typeof Search }> = {
		protocol: { label: 'Protocols', icon: CircuitBoard },
		category: { label: 'Categories', icon: Layers },
		comparison: { label: 'Comparisons', icon: Scale },
		concept: { label: 'Concepts', icon: Lightbulb },
		journey: { label: 'Journeys', icon: Compass },
		story: { label: 'Stories', icon: BookOpen }
	};

	function openSearch() {
		open = true;
		requestAnimationFrame(() => inputEl?.focus());
	}

	function close() {
		open = false;
		query = '';
		selectedIndex = 0;
		appState.searchHighlightIds = null;
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (open) close();
			else openSearch();
			return;
		}
		if (e.key === '/' && !open) {
			const tag = (document.activeElement as HTMLElement)?.tagName;
			if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
				e.preventDefault();
				openSearch();
			}
		}
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		}
		if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			navigate(results[selectedIndex]);
		}
	}

	function navigate(entry: SearchEntry) {
		const nav = entry.nav;
		switch (nav.kind) {
			case 'protocol': {
				const node = allNodes.find((n) => n.id === nav.protocolId);
				if (node) appState.selectNode(node);
				break;
			}
			case 'category': {
				const node = allNodes.find((n) => n.id === nav.categoryId);
				if (node) {
					appState.selectNode(node);
					if (nav.tab) appState.categoryViewMode = nav.tab;
				}
				break;
			}
			case 'comparison': {
				const node = allNodes.find((n) => n.id === nav.protocolId);
				if (node) {
					appState.selectNode(node);
					// Must set after selectNode since it resets these
					appState.detailViewMode = 'compare';
					appState.compareTargetId = nav.compareTargetId;
				}
				break;
			}
			case 'journey': {
				const journey = journeys.find((j) => j.id === nav.journeyId);
				if (journey) {
					appState.startJourney(journey);
					const firstStep = journey.steps[0];
					if (firstStep) {
						const node = allNodes.find((n) => n.id === firstStep.protocolId);
						if (node) appState.selectNode(node);
					}
				}
				break;
			}
			case 'hub': {
				const hub = allNodes.find((n) => n.type === 'hub');
				if (hub) {
					appState.selectNode(hub);
					appState.hubViewMode = nav.tab;
				}
				break;
			}
		}
		close();
	}

	/** Get the flat index of a result within the grouped display */
	function getFlatIndex(entry: SearchEntry): number {
		return results.indexOf(entry);
	}

	let containerEl: HTMLDivElement | undefined = $state();

	function handleGlobalPointerdown(e: PointerEvent) {
		if (!open || !containerEl) return;
		if (!containerEl.contains(e.target as Node)) {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} onpointerdown={handleGlobalPointerdown} />

<div class="relative" bind:this={containerEl}>
	{#if !open}
		<!-- Collapsed: search icon button -->
		<button
			class="icon-btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200 md:h-9 md:w-9"
			onclick={openSearch}
			aria-label="Search"
		>
			<Search size={15} strokeWidth={1.8} />
		</button>
	{:else}
		<!-- Expanded: input field -->
		<div class="relative flex items-center gap-2">
			<div
				class="flex h-8 w-52 items-center gap-2 rounded-xl border border-white/15 bg-bg-deep/90 px-3 shadow-lg backdrop-blur-xl md:h-9 md:w-56"
			>
				<Search size={14} class="shrink-0 text-slate-500" />
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handleInputKeydown}
					class="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
					placeholder="Search protocols..."
					spellcheck="false"
					autocomplete="off"
				/>
				{#if query}
					<button
						class="shrink-0 text-slate-500 transition-colors hover:text-slate-300"
						onclick={() => {
							query = '';
							inputEl?.focus();
						}}
						aria-label="Clear search"
					>
						<X size={14} />
					</button>
				{/if}
			</div>
			<button
				class="icon-btn flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-bg-deep/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/5 hover:text-slate-200 md:h-9 md:w-9"
				onclick={close}
				aria-label="Close search"
			>
				<X size={15} strokeWidth={1.8} />
			</button>
		</div>

		<!-- Dropdown -->
		{#if results.length > 0}
			<div
				class="absolute left-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-bg-deep/95 shadow-2xl backdrop-blur-xl"
			>
				<div class="relative">
			<div
				bind:this={scrollEl}
				onscroll={() => {
					if (scrollEl) {
						canScrollDown = scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - 4;
					}
				}}
				class="search-results max-h-80 overflow-y-auto">
					{#each grouped as group (group.type)}
						{@const meta = groupMeta[group.type]}
						{@const GroupIcon = meta.icon}
						<!-- Section header -->
						<div
							class="sticky top-0 z-10 flex items-center gap-2 border-b border-white/5 bg-bg-deep/95 px-3 py-1.5 backdrop-blur-xl"
						>
							<GroupIcon size={12} class="text-slate-500" />
							<span class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
								{meta.label}
							</span>
						</div>

						<!-- Results -->
						{#each group.entries as entry (entry.label + entry.type)}
							{@const flatIdx = getFlatIndex(entry)}
							{@const EntryIcon = meta.icon}
							<button
								class="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors {flatIdx === selectedIndex ? 'bg-white/5' : 'hover:bg-white/5'}"
								onclick={() => navigate(entry)}
								onmouseenter={() => (selectedIndex = flatIdx)}
								role="option"
								aria-selected={flatIdx === selectedIndex}
							>
								<!-- Type icon -->
								<span class="mt-0.5 shrink-0" style:color={entry.color ?? '#94a3b8'}>
									<EntryIcon size={14} strokeWidth={1.5} />
								</span>
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium text-slate-200">
										{#if entry.protocolMeta}
											<span class="font-semibold" style:color={entry.color}>{entry.protocolMeta.abbreviation}</span>
											<span class="text-slate-500"> — </span>
											<span>{entry.protocolMeta.name}</span>
										{:else if entry.comparisonMeta}
											<span class="font-semibold" style:color={entry.comparisonMeta.leftColor}>{entry.comparisonMeta.leftAbbr}</span>
											<span class="text-slate-500"> {entry.comparisonMeta.connector} </span>
											<span class="font-semibold" style:color={entry.comparisonMeta.rightColor}>{entry.comparisonMeta.rightAbbr}</span>
										{:else}
											{entry.label}
										{/if}
									</div>
									<div class="truncate text-[11px] text-slate-500">
										{entry.description}
									</div>
								</div>
							</button>
						{/each}
					{/each}
				</div>
				<!-- Scroll fade indicator -->
				{#if canScrollDown}
					<div class="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-deep/95 to-transparent"></div>
				{/if}
			</div>

				<!-- Footer hint -->
				<div
					class="flex items-center justify-between border-t border-white/5 px-3 py-1.5"
				>
					<span class="text-[10px] text-slate-600">
						<kbd class="rounded bg-white/10 px-1 py-0.5 text-[9px] text-slate-500"
							>&uarr;&darr;</kbd
						>
						navigate
						<kbd class="ml-1 rounded bg-white/10 px-1 py-0.5 text-[9px] text-slate-500"
							>&crarr;</kbd
						>
						select
					</span>
					<span class="text-[10px] text-slate-600">
						<kbd class="rounded bg-white/10 px-1 py-0.5 text-[9px] text-slate-500">esc</kbd>
						close
					</span>
				</div>
			</div>
		{:else if query.trim()}
			<div
				class="absolute left-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-bg-deep/95 p-6 text-center shadow-2xl backdrop-blur-xl"
			>
				<p class="text-sm text-slate-500">No results for "{query}"</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.icon-btn :global(svg) {
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.icon-btn:hover :global(svg) {
		transform: scale(1.15) rotate(-5deg);
	}
	.search-results {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
	}
	.search-results::-webkit-scrollbar {
		width: 4px;
	}
	.search-results::-webkit-scrollbar-track {
		background: transparent;
	}
	.search-results::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
	}
	.search-results::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.25);
	}
</style>
