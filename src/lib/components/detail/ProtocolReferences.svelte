<script lang="ts">
	import { getPioneersForProtocol } from '$lib/data/pioneers';
	import { getRfcsForProtocol } from '$lib/data/rfcs';
	import { getOutagesForProtocol } from '$lib/data/outages';
	import { getFrontierForProtocol } from '$lib/data/frontier';
	import {
		navigateToPioneer,
		navigateToRfc,
		navigateToOutage,
		navigateToFrontier
	} from '$lib/utils/navigation';
	import { Users, FileText, AlertTriangle, Compass } from 'lucide-svelte';

	interface Props {
		protocolId: string;
		/** Protocol category accent — used to tint the section dividers. */
		color: string;
	}

	let { protocolId, color }: Props = $props();

	const pioneers = $derived(getPioneersForProtocol(protocolId));
	const rfcs = $derived(getRfcsForProtocol(protocolId));
	const outages = $derived(getOutagesForProtocol(protocolId));
	const frontier = $derived(getFrontierForProtocol(protocolId));

	const hasAnything = $derived(
		pioneers.length > 0 || rfcs.length > 0 || outages.length > 0 || frontier.length > 0
	);
</script>

{#if hasAnything}
	<div class="flex flex-col gap-5">
		{#if pioneers.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Users size={11} style="color: {color};" />
					Pioneers
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each pioneers as p (p.id)}
						<button
							class="group flex items-center gap-2 rounded-lg border border-s-border bg-s-glass px-2.5 py-1.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToPioneer(p.id)}
							title={p.title ?? p.name}
						>
							{#if p.imagePath}
								<img
									src={p.imagePath}
									alt={p.name}
									class="h-7 w-7 shrink-0 rounded-full object-cover"
								/>
							{:else}
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
									style="background-color: {color}20; color: {color};"
								>
									{p.name
										.split(' ')
										.map((s) => s[0])
										.join('')
										.slice(0, 2)}
								</span>
							{/if}
							<span class="text-xs font-medium text-t-primary">{p.name}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if rfcs.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<FileText size={11} style="color: {color};" />
					RFCs
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each rfcs as r (r.number)}
						<button
							class="flex items-baseline gap-3 rounded-lg border border-s-border bg-s-glass px-3 py-1.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToRfc(r.number)}
						>
							<code
								class="shrink-0 rounded font-mono text-[11px] font-bold"
								style="color: {color};">RFC {r.number}</code
							>
							<span class="flex-1 text-xs text-t-primary">{r.title}</span>
							<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{r.year}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if outages.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<AlertTriangle size={11} class="text-orange-400" />
					Famous incidents
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each outages as o (o.id)}
						<button
							class="rounded-lg border border-s-border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToOutage(o.id)}
						>
							<div class="flex items-baseline justify-between gap-2">
								<span class="text-xs font-medium text-t-primary">{o.title}</span>
								<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{o.date}</span>
							</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary italic">
								{o.oneLiner}
							</p>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if frontier.length > 0}
			<section>
				<h3
					class="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-t-muted uppercase"
				>
					<Compass size={11} class="text-violet-400" />
					Frontier (2024-2026)
				</h3>
				<div class="flex flex-col gap-1.5">
					{#each frontier as f (f.id)}
						<button
							class="rounded-lg border border-s-border bg-s-glass p-2.5 text-left transition-all hover:bg-s-glass-hover"
							onclick={() => navigateToFrontier(f.id)}
						>
							<div class="flex items-baseline justify-between gap-2">
								<span class="text-xs font-medium text-t-primary">{f.title}</span>
								<span class="shrink-0 text-[10px] text-t-muted tabular-nums">{f.date}</span>
							</div>
							<p class="mt-0.5 text-[11px] leading-relaxed text-t-secondary italic">
								{f.oneLiner}
							</p>
						</button>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
