<script lang="ts">
	import { concepts, conceptMap, type Concept, type ConceptCategory } from '$lib/data/concepts';
	import { Search, X, ExternalLink } from 'lucide-svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import { navigateToProtocol } from '$lib/utils/navigation';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';

	let query = $state('');
	let expandedId: string | null = $state(null);

	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	/**
	 * Walks up to the nearest scrolling ancestor. `Element.scrollIntoView`
	 * misbehaves inside the DetailPanel's nested scroll container — the
	 * smooth-scroll silently no-ops — so we set `scrollTop` directly.
	 */
	function scrollableParent(el: Element): Element | null {
		let cur: Element | null = el.parentElement;
		while (cur) {
			const cs = getComputedStyle(cur);
			const scrolls = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
			if (scrolls && cur.scrollHeight > cur.clientHeight) return cur;
			cur = cur.parentElement;
		}
		return null;
	}

	/**
	 * Opens the term referenced by the URL hash (e.g.
	 * `/glossary#congestion-window`) and scrolls it into view.
	 */
	async function openFromHash() {
		if (!browser) return;
		const id = window.location.hash.slice(1);
		if (!id || !conceptMap.has(id)) return;
		expandedId = id;
		await tick(); // let the {#if isExpanded} branch render
		const target = document.getElementById(`glossary-${id}`);
		if (!target) return;
		const scroller = scrollableParent(target);
		if (!scroller) return;
		const tRect = target.getBoundingClientRect();
		const sRect = scroller.getBoundingClientRect();
		// `behavior: 'smooth'` is silently no-op'd on this scroll container
		// (the panel inherits a CSS rule that disables it), so we use the
		// default `'auto'` — instant jump, but reliable.
		scroller.scrollTo({ top: scroller.scrollTop + (tRect.top - sRect.top) - 16 });
	}

	onMount(() => {
		openFromHash();
		const handler = () => openFromHash();
		window.addEventListener('hashchange', handler);
		return () => window.removeEventListener('hashchange', handler);
	});

	const CATEGORY_LABELS: Record<ConceptCategory, string> = {
		'networking-basics': 'Networking basics',
		'protocol-mechanics': 'Protocol mechanics',
		security: 'Security',
		web: 'Web & APIs',
		messaging: 'Messaging',
		infrastructure: 'Infrastructure'
	};

	const ORDER: ConceptCategory[] = [
		'networking-basics',
		'protocol-mechanics',
		'security',
		'web',
		'messaging',
		'infrastructure'
	];

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return concepts;
		return concepts.filter(
			(c) =>
				c.term.toLowerCase().includes(q) ||
				c.definition.toLowerCase().includes(q) ||
				(c.analogy?.toLowerCase().includes(q) ?? false)
		);
	});

	/** Group filtered concepts by category, preserving the canonical order. */
	const grouped = $derived.by(() => {
		const buckets = new Map<ConceptCategory, Concept[]>();
		for (const c of filtered) {
			const arr = buckets.get(c.category);
			if (arr) arr.push(c);
			else buckets.set(c.category, [c]);
		}
		const out: { category: ConceptCategory; entries: Concept[] }[] = [];
		for (const cat of ORDER) {
			const entries = buckets.get(cat);
			if (entries && entries.length > 0) out.push({ category: cat, entries });
		}
		return out;
	});

	const totalCount = concepts.length;
	const matchCount = $derived(filtered.length);
</script>

<div class="flex flex-col gap-4">
	<!-- Search bar -->
	<div class="flex items-center gap-2 rounded-xl border border-s-border bg-s-glass px-3 py-2.5">
		<Search size={14} class="shrink-0 text-t-muted" />
		<input
			bind:value={query}
			type="text"
			placeholder="Search the glossary…"
			spellcheck="false"
			autocomplete="off"
			class="w-full bg-transparent text-sm text-t-primary placeholder:text-t-muted focus:outline-none"
		/>
		{#if query}
			<button
				class="shrink-0 text-t-muted transition-colors hover:text-t-primary"
				onclick={() => (query = '')}
				aria-label="Clear search"
			>
				<X size={14} />
			</button>
		{/if}
	</div>

	<!-- Result count -->
	<div class="flex items-center justify-between text-[11px] text-t-muted">
		<span>
			{#if query.trim()}
				{matchCount} {matchCount === 1 ? 'match' : 'matches'} of {totalCount} terms
			{:else}
				{totalCount} terms across {ORDER.length} categories
			{/if}
		</span>
		<span class="text-t-muted/70">Click any term to expand</span>
	</div>

	<!-- Empty state -->
	{#if grouped.length === 0}
		<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
			<p class="text-sm text-t-secondary">No glossary entries match "{query}".</p>
			<p class="mt-1 text-xs text-t-muted">
				Try a different word — or this term may not be in the glossary yet.
			</p>
		</div>
	{/if}

	<!-- Grouped term list -->
	{#each grouped as group (group.category)}
		<section>
			<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
				{CATEGORY_LABELS[group.category]}
				<span class="ml-1 text-t-muted/70">{group.entries.length}</span>
			</h3>
			<div class="space-y-1.5">
				{#each group.entries as concept (concept.id)}
					{@const isExpanded = expandedId === concept.id}
					{@const definitionSegments = isExpanded ? parseRichText(concept.definition) : []}
					{@const analogySegments =
						isExpanded && concept.analogy ? parseRichText(concept.analogy) : []}
					<div
						id="glossary-{concept.id}"
						class="scroll-mt-6 rounded-lg border border-s-border bg-s-glass transition-colors hover:border-s-border"
					>
						<button
							class="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left"
							onclick={() => toggle(concept.id)}
						>
							<span class="text-sm font-medium text-t-primary">{concept.term}</span>
							<span
								class="shrink-0 text-t-muted transition-transform"
								class:rotate-180={isExpanded}
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</span>
						</button>

						{#if isExpanded}
							<div class="border-t border-s-border px-3 pt-2.5 pb-3">
								<p class="text-xs leading-relaxed text-t-primary">
									{#each definitionSegments as seg, j (j)}
										{#if seg.type === 'text'}
											{seg.value}
										{:else if seg.type === 'bold'}
											<strong class="font-semibold text-t-primary">{seg.value}</strong>
										{:else if seg.type === 'protocol-link' || seg.type === 'bold-protocol-link'}
											<button
												class="inline font-medium text-sky-400 transition-colors hover:text-sky-300 hover:underline"
												onclick={(e) => {
													e.stopPropagation();
													navigateToProtocol(seg.protocolId);
												}}>{seg.label}</button
											>
										{:else if seg.type === 'concept' || seg.type === 'bold-concept'}
											<span class="font-medium text-t-primary">{seg.label}</span>
										{/if}
									{/each}
								</p>

								{#if concept.analogy}
									<div class="mt-2 rounded-md bg-s-glass px-2.5 py-2">
										<p class="text-[11px] leading-relaxed text-t-secondary">
											<span class="font-medium text-t-primary">Analogy:</span>
											{#each analogySegments as seg, j (j)}
												{#if seg.type === 'text'}
													{seg.value}
												{:else if seg.type === 'bold'}
													<strong class="font-semibold text-t-primary">{seg.value}</strong>
												{:else if seg.type === 'protocol-link' || seg.type === 'bold-protocol-link'}
													<button
														class="inline font-medium text-sky-400 transition-colors hover:text-sky-300 hover:underline"
														onclick={(e) => {
															e.stopPropagation();
															navigateToProtocol(seg.protocolId);
														}}>{seg.label}</button
													>
												{:else if seg.type === 'concept' || seg.type === 'bold-concept'}
													<span class="font-medium text-t-primary">{seg.label}</span>
												{/if}
											{/each}
										</p>
									</div>
								{/if}

								{#if concept.wikiUrl}
									<a
										href={concept.wikiUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="mt-2 inline-flex items-center gap-1 text-[11px] text-t-muted transition-colors hover:text-t-primary"
										onclick={(e) => e.stopPropagation()}
									>
										<ExternalLink size={10} />
										Wikipedia
									</a>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
