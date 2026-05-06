<script lang="ts">
	import { frontierEntries, type FrontierTopic } from '$lib/data/frontier';
	import { navigateToFrontier } from '$lib/utils/navigation';
	import { Compass } from 'lucide-svelte';

	const ACCENT = '#a78bfa';

	const TOPIC_LABEL: Record<FrontierTopic, string> = {
		security: 'Security',
		transport: 'Transport',
		wireless: 'Wireless',
		web: 'Web',
		datacenter: 'Datacenter',
		observability: 'Observability',
		'ai-agents': 'AI agents',
		standards: 'Standards',
		iot: 'IoT',
		'realtime-av': 'Real-time A/V'
	};

	const STATUS_LABEL: Record<string, string> = {
		shipped: 'Shipped',
		'rolling-out': 'Rolling out',
		standardizing: 'Standardising',
		experimental: 'Experimental'
	};

	/** Group by topic for easy scanning. */
	const grouped = $derived.by(() => {
		const buckets = new Map<FrontierTopic, typeof frontierEntries>();
		for (const f of frontierEntries) {
			const arr = buckets.get(f.topic);
			if (arr) arr.push(f);
			else buckets.set(f.topic, [f]);
		}
		return Array.from(buckets.entries()).map(([topic, entries]) => ({ topic, entries }));
	});
</script>

<div class="flex flex-col gap-6">
	<header>
		<div
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
			style="background-color: {ACCENT}20; color: {ACCENT};"
		>
			<Compass size={11} />
			The Frontier — 2024-2026
		</div>
		<h1 class="mt-2 text-2xl leading-tight font-bold tracking-tight text-t-primary">
			What's actively shipping
		</h1>
		<p class="mt-2 text-sm leading-relaxed text-t-secondary">
			{frontierEntries.length} developments that have shipped, are rolling out, or are
			standardising right now. The 2024-2026 frontier of the protocol stack — anything older
			lives in the chapters, anything younger lives in IETF drafts.
		</p>
	</header>

	{#each grouped as group (group.topic)}
		<section>
			<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
				{TOPIC_LABEL[group.topic] ?? group.topic}
			</h3>
			<div class="space-y-2">
				{#each group.entries as f (f.id)}
					<button
						class="group flex w-full flex-col gap-1 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
						onclick={() => navigateToFrontier(f.id)}
					>
						<div class="flex items-baseline justify-between gap-2">
							<span class="text-sm font-medium text-t-primary" style="color: {ACCENT};"
								>{f.title}</span
							>
							<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{f.date}</span>
						</div>
						<p class="text-xs leading-relaxed text-t-secondary italic">{f.oneLiner}</p>
						<div class="mt-0.5 text-[10px] text-t-muted">{STATUS_LABEL[f.status] ?? f.status}</div>
					</button>
				{/each}
			</div>
		</section>
	{/each}
</div>
