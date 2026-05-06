<script lang="ts">
	import { outages } from '$lib/data/outages';
	import { navigateToOutage } from '$lib/utils/navigation';
	import { AlertTriangle } from 'lucide-svelte';

	const ACCENT = '#fb923c';

	/** Most recent first — recent outages have richer data and are more
	 *  immediately relevant to readers. */
	const sorted = $derived([...outages].sort((a, b) => b.date.localeCompare(a.date)));
</script>

<div class="flex flex-col gap-6">
	<header>
		<div
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
			style="background-color: {ACCENT}20; color: {ACCENT};"
		>
			<AlertTriangle size={11} />
			Famous outages
		</div>
		<h1 class="mt-2 text-2xl leading-tight font-bold tracking-tight text-t-primary">
			What broke and what we learned
		</h1>
		<p class="mt-2 text-sm leading-relaxed text-t-secondary">
			{outages.length} incidents told as stories — setup, mistake, cascade, consequence,
			lesson. The post-mortems engineers point to when they argue for redundancy, filtering,
			or a less risky deployment.
		</p>
	</header>

	<div class="space-y-2">
		{#each sorted as o (o.id)}
			<button
				class="group flex w-full flex-col gap-1.5 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
				onclick={() => navigateToOutage(o.id)}
			>
				<div class="flex items-baseline justify-between gap-2">
					<span class="text-sm font-medium text-t-primary" style="color: {ACCENT};"
						>{o.title}</span
					>
					<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{o.date}</span>
				</div>
				<p class="text-xs leading-relaxed text-t-secondary italic">{o.oneLiner}</p>
				{#if o.duration || o.scale}
					<p class="text-[10px] text-t-muted">
						{#if o.duration}<span>{o.duration}</span>{/if}
						{#if o.duration && o.scale}<span> · </span>{/if}
						{#if o.scale}<span>{o.scale}</span>{/if}
					</p>
				{/if}
			</button>
		{/each}
	</div>
</div>
