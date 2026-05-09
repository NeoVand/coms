<script lang="ts">
	import { getFrontierById, getProtocolById, getCategoryById } from '$lib/data/index';
	import { navigateToProtocol } from '$lib/utils/navigation';
	import { ExternalLink, Compass, BarChart3 } from 'lucide-svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const appState = getAppState();
	const entry = $derived(getFrontierById(id));

	/** Frontier entries get a purple/indigo accent — the colour of "what's
	 *  ahead." Distinct from chapter sky, pioneer per-category, RFC
	 *  per-protocol, and outage orange. */
	const ACCENT = '#a78bfa'; // violet-400

	const STATUS_LABEL: Record<string, string> = {
		shipped: 'Shipped',
		'rolling-out': 'Rolling out',
		standardizing: 'Standardising',
		experimental: 'Experimental'
	};

	const TOPIC_LABEL: Record<string, string> = {
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
</script>

{#if entry}
	<article class="flex flex-col gap-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-2 text-[11px] text-t-muted">
			<span class="flex items-center gap-1" style="color: {ACCENT};">
				<Compass size={11} />
				The Frontier — 2024-2026
			</span>
			<span>·</span>
			<span class="text-t-secondary">{TOPIC_LABEL[entry.topic] ?? entry.topic}</span>
		</nav>

		<!-- Header -->
		<header>
			<div
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
				style="background-color: {ACCENT}20; color: {ACCENT};"
			>
				{STATUS_LABEL[entry.status] ?? entry.status}
				<span class="opacity-70">· {entry.date}</span>
			</div>
			<h1
				class="mt-2 text-xl leading-tight font-bold tracking-tight"
				style="color: {ACCENT};"
			>
				{entry.title}
			</h1>
			<p class="mt-2 text-sm leading-relaxed text-t-primary italic">
				<RichText segments={parseRichText(entry.oneLiner)} color={ACCENT} />
			</p>
		</header>

		<!-- Description (multi-paragraph) -->
		<section class="flex flex-col gap-3 text-sm leading-relaxed text-t-primary">
			{#each entry.description.split('\n\n') as para, i (i)}
				<p>{para}</p>
			{/each}
		</section>

		<!-- Metrics -->
		{#if entry.metrics && entry.metrics.length > 0}
			<section
				class="rounded-xl border p-4"
				style="border-color: {ACCENT}20; background-color: {ACCENT}08;"
			>
				<h3
					class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>
					<BarChart3 size={10} />
					By the numbers
				</h3>
				<div class="grid grid-cols-2 gap-3">
					{#each entry.metrics as metric (metric.label)}
						<div class="flex flex-col gap-0.5">
							<div class="text-base font-bold text-t-primary" style="color: {ACCENT};">
								{metric.value}
							</div>
							<div class="text-[10px] text-t-muted">{metric.label}</div>
							{#if metric.date}
								<div class="text-[10px] text-t-muted/70">{metric.date}</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Protocols affected -->
		{#if entry.protocols.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Protocols affected
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each entry.protocols as protoId (protoId)}
						{@const proto = getProtocolById(protoId)}
						{@const cat = proto ? getCategoryById(proto.categoryId) : null}
						{@const protoColor = themedDomColor(cat?.color ?? '#94a3b8', appState.theme)}
						{#if proto}
							<button
								class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:bg-s-glass-hover"
								style="border-color: {protoColor}30; color: {protoColor};"
								onclick={() => navigateToProtocol(proto.id)}
							>
								{proto.abbreviation}
							</button>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Sources -->
		<section class="border-t border-s-border pt-4">
			<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">Sources</h3>
			<ul class="space-y-1.5">
				{#each entry.sources as source (source.url)}
					<li>
						<a
							href={source.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-baseline gap-1 text-[11px] text-t-muted transition-colors hover:text-t-secondary"
						>
							<ExternalLink size={10} class="shrink-0" />
							{source.label ?? source.url}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</article>
{:else}
	<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
		<p class="text-sm text-t-secondary">Frontier entry not found.</p>
	</div>
{/if}
