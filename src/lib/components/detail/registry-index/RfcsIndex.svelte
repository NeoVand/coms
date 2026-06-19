<script lang="ts">
	import { rfcs } from '$lib/data/rfcs';
	import { navigateToRfc } from '$lib/utils/navigation';
	import { FileText } from 'lucide-svelte';

	/** Newest first — most-cited recent RFCs surface at the top. */
	const sorted = $derived([...rfcs].sort((a, b) => b.year - a.year));

	const STATUS_LABEL: Record<string, string> = {
		'internet-standard': 'Internet Standard',
		'standards-track': 'Standards Track',
		'proposed-standard': 'Proposed Standard',
		'best-current-practice': 'BCP',
		informational: 'Informational',
		experimental: 'Experimental',
		historic: 'Historic',
		draft: 'Draft'
	};
</script>

<div class="flex flex-col gap-6">
	<header>
		<div
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky-300 uppercase"
			style="background-color: rgba(96, 165, 250, 0.2);"
		>
			<FileText size={11} />
			RFCs
		</div>
		<h1 class="mt-2 text-2xl leading-tight font-bold tracking-tight text-t-primary">
			The documents
		</h1>
		<p class="mt-2 text-sm leading-relaxed text-t-secondary">
			{rfcs.length} RFCs the chapters and protocol pages cite by name. Newest first; click any to read
			the spec inline with notable section pointers.
		</p>
	</header>

	<div class="space-y-1.5">
		{#each sorted as r (r.number)}
			<button
				class="flex w-full items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-2 text-left transition-all hover:bg-s-glass-hover"
				onclick={() => navigateToRfc(r.number)}
			>
				<code
					class="shrink-0 rounded font-mono text-[11px] font-bold text-sky-400"
					style="min-width: 4.5rem;">RFC {r.number}</code
				>
				<span class="flex-1 text-xs text-t-primary">{r.title}</span>
				{#if r.status}
					<span class="hidden shrink-0 text-[10px] text-t-muted sm:inline">
						{STATUS_LABEL[r.status] ?? r.status}
					</span>
				{/if}
				<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{r.year}</span>
			</button>
		{/each}
	</div>
</div>
