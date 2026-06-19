<script lang="ts">
	import { getPioneerById, getProtocolById, getCategoryById, categories } from '$lib/data/index';
	import { ExternalLink, Award, Quote } from 'lucide-svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';
	import { navigateToProtocol, navigateToCategory } from '$lib/utils/navigation';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';
	import ProtocolLink from '$lib/components/detail/inline/ProtocolLink.svelte';

	interface Props {
		pioneerId: string;
	}

	let { pioneerId }: Props = $props();

	const appState = getAppState();
	const pioneer = $derived(getPioneerById(pioneerId));

	/** Pull the primary category accent so the bio echoes the area the
	 *  pioneer shaped — Cerf reads in transport-green, Berners-Lee in
	 *  web-cyan, and so on. Falls back to a neutral sky if no category. */
	const accent = $derived.by(() => {
		const catId = pioneer?.categories?.[0];
		if (!catId) return '#60a5fa';
		const cat = categories.find((c) => c.id === catId);
		return themedDomColor(cat?.color ?? '#60a5fa', appState.theme);
	});

	/** Split the multi-paragraph contribution by blank lines for proper
	 *  rendering — same rule the StoryNarrative uses. */
	const contributionParagraphs = $derived(pioneer?.contribution.split('\n\n') ?? []);
</script>

{#if pioneer}
	<article class="flex flex-col gap-6">
		<!-- Header card: photo + name + title + org + years -->
		<header class="flex items-start gap-4">
			{#if pioneer.imagePath}
				<img
					src={pioneer.imagePath}
					alt={pioneer.name}
					class="h-20 w-20 shrink-0 rounded-full object-cover ring-2"
					style="--tw-ring-color: {accent}33;"
				/>
			{:else}
				<div
					class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
					style="background-color: {accent}20; color: {accent};"
				>
					{pioneer.name
						.split(' ')
						.map((s) => s[0])
						.join('')
						.slice(0, 2)}
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<div class="text-[10px] font-semibold tracking-wider text-t-muted uppercase">Pioneer</div>
				<h1 class="text-xl leading-tight font-bold text-t-primary" style="color: {accent};">
					{pioneer.name}
				</h1>
				{#if pioneer.title}
					<p class="mt-0.5 text-sm font-medium text-t-secondary">{pioneer.title}</p>
				{/if}
				<div class="mt-1 flex items-baseline gap-2 text-[11px] text-t-muted">
					<span>{pioneer.years}</span>
					{#if pioneer.org}
						<span>·</span>
						<span>{pioneer.org}</span>
					{/if}
				</div>
			</div>
		</header>

		<!-- Contribution narrative -->
		<section>
			<div class="flex flex-col gap-3 text-sm leading-relaxed text-t-primary">
				{#each contributionParagraphs as paragraph, i (i)}
					{@const segments = parseRichText(paragraph)}
					<p>
						{#each segments as seg, j (j)}
							{#if seg.type === 'text'}
								{seg.value}
							{:else if seg.type === 'bold'}
								<strong class="font-semibold text-t-primary">{seg.value}</strong>
							{:else if seg.type === 'protocol-link' || seg.type === 'bold-protocol-link'}
								<ProtocolLink protocolId={seg.protocolId} label={seg.label} color={accent} />
							{:else if seg.type === 'concept' || seg.type === 'bold-concept'}
								<span class="font-medium text-t-primary">{seg.label}</span>
							{/if}
						{/each}
					</p>
				{/each}
			</div>
		</section>

		<!-- Quotes -->
		{#if pioneer.quotes && pioneer.quotes.length > 0}
			<section class="space-y-3">
				{#each pioneer.quotes as q (q.text)}
					<blockquote
						class="rounded-xl border-l-2 bg-s-glass p-4"
						style="border-color: {accent}; background-color: {accent}08;"
					>
						<div class="flex items-start gap-2">
							<Quote size={14} class="mt-1 shrink-0" style="color: {accent};" />
							<div class="flex-1">
								<p class="text-sm leading-relaxed text-t-primary italic">
									"<RichText segments={parseRichText(q.text)} color={accent} />"
								</p>
								{#if q.source}
									<a
										href={q.source.url}
										target="_blank"
										rel="noopener noreferrer"
										class="mt-2 inline-flex items-center gap-1 text-[11px] text-t-muted transition-colors hover:text-t-secondary"
									>
										<ExternalLink size={10} />
										{q.source.label ?? 'Source'}
									</a>
								{/if}
							</div>
						</div>
					</blockquote>
				{/each}
			</section>
		{/if}

		<!-- Awards -->
		{#if pioneer.awards && pioneer.awards.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Awards & honours
				</h3>
				<ul class="space-y-1.5">
					{#each pioneer.awards as award (award.name)}
						<li class="flex items-baseline gap-2 text-xs text-t-secondary">
							<Award size={11} class="shrink-0" style="color: {accent};" />
							<span class="text-t-primary">{award.name}</span>
							{#if award.year}
								<span class="text-t-muted">{award.year}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Protocols shaped -->
		{#if pioneer.protocols && pioneer.protocols.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Protocols shaped
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each pioneer.protocols as protoId (protoId)}
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

		<!-- Category links -->
		{#if pioneer.categories && pioneer.categories.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">Areas</h3>
				<div class="flex flex-wrap gap-2">
					{#each pioneer.categories as catId (catId)}
						{@const cat = getCategoryById(catId)}
						{@const catColor = themedDomColor(cat?.color ?? '#94a3b8', appState.theme)}
						{#if cat}
							<button
								class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:bg-s-glass-hover"
								style="border-color: {catColor}30; color: {catColor};"
								onclick={() => navigateToCategory(cat.id)}
							>
								{cat.name}
							</button>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- External links -->
		{#if pioneer.links && (pioneer.links.wikipedia || pioneer.links.homepage || pioneer.links.awards)}
			<section
				class="flex flex-wrap items-center gap-3 border-t border-s-border pt-4 text-[11px] text-t-muted"
			>
				{#if pioneer.links.wikipedia}
					<a
						href={pioneer.links.wikipedia}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 transition-colors hover:text-t-secondary"
					>
						<ExternalLink size={10} /> Wikipedia
					</a>
				{/if}
				{#if pioneer.links.homepage}
					<a
						href={pioneer.links.homepage}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 transition-colors hover:text-t-secondary"
					>
						<ExternalLink size={10} /> Homepage
					</a>
				{/if}
				{#if pioneer.links.awards}
					<a
						href={pioneer.links.awards}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 transition-colors hover:text-t-secondary"
					>
						<ExternalLink size={10} /> Awards citation
					</a>
				{/if}
			</section>
		{/if}
	</article>
{:else}
	<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
		<p class="text-sm text-t-secondary">Pioneer not found.</p>
	</div>
{/if}
