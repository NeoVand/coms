<script lang="ts">
	import { getRfcByNumber, getProtocolById, getCategoryById } from '$lib/data/index';
	import { navigateToProtocol, navigateToRfc } from '$lib/utils/navigation';
	import { ExternalLink, FileText } from 'lucide-svelte';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';
	import { parseParagraphs, parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';

	interface Props {
		number: string;
	}

	let { number }: Props = $props();

	const appState = getAppState();
	const rfc = $derived(getRfcByNumber(number));

	/** Use the first protocol's category color so an RFC about TCP reads
	 *  in transport green, an RFC about TLS in utilities teal, etc. */
	const accent = $derived.by(() => {
		const protoId = rfc?.protocols?.[0];
		if (!protoId) return '#60a5fa';
		const proto = getProtocolById(protoId);
		const cat = proto ? getCategoryById(proto.categoryId) : null;
		return themedDomColor(cat?.color ?? '#60a5fa', appState.theme);
	});

	const STATUS_LABEL: Record<string, string> = {
		'internet-standard': 'Internet Standard',
		'standards-track': 'Standards Track',
		'proposed-standard': 'Proposed Standard',
		'best-current-practice': 'Best Current Practice',
		informational: 'Informational',
		experimental: 'Experimental',
		historic: 'Historic',
		draft: 'Internet-Draft'
	};
</script>

{#if rfc}
	<article class="flex flex-col gap-6">
		<!-- Header -->
		<header>
			<div
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase"
				style="background-color: {accent}20; color: {accent};"
			>
				<FileText size={11} />
				RFC {rfc.number}
			</div>
			<h1
				class="mt-2 text-xl leading-tight font-bold tracking-tight text-t-primary"
				style="color: {accent};"
			>
				{rfc.title}
			</h1>
			<div class="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] text-t-muted">
				<span>{rfc.year}</span>
				{#if rfc.authors}
					<span>·</span>
					<span class="text-t-secondary">{rfc.authors}</span>
				{/if}
				{#if rfc.status}
					<span>·</span>
					<span>{STATUS_LABEL[rfc.status] ?? rfc.status}</span>
				{/if}
			</div>
		</header>

		<!-- Abstract — plain-English summary -->
		{#if rfc.abstract}
			<section class="-mt-1 space-y-3">
				{#each parseParagraphs(rfc.abstract) as paraSegments, i (i)}
					<p class="text-sm leading-relaxed text-t-primary">
						<RichText segments={paraSegments} color={accent} />
					</p>
				{/each}
			</section>
		{/if}

		<!-- Primary CTA: read the actual spec -->
		<a
			href={rfc.url}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 self-start rounded-lg border px-3.5 py-2 text-sm font-medium transition-all hover:bg-s-glass-hover"
			style="border-color: {accent}40; color: {accent}; background-color: {accent}10;"
		>
			<ExternalLink size={14} />
			Read RFC {rfc.number} on rfc-editor.org
		</a>

		<!-- Notable sections -->
		{#if rfc.notableSections && rfc.notableSections.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Worth pointing at
				</h3>
				<ul class="space-y-1.5">
					{#each rfc.notableSections as s (s.ref)}
						<li class="flex items-baseline gap-2 text-xs">
							<code
								class="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]"
								style="background-color: {accent}15; color: {accent};">{s.ref}</code
							>
							<span class="text-t-secondary"
								><RichText segments={parseRichText(s.description)} color={accent} /></span
							>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Obsolescence chain -->
		{#if (rfc.obsoletes && rfc.obsoletes.length > 0) || (rfc.obsoletedBy && rfc.obsoletedBy.length > 0)}
			<section class="space-y-2 text-xs text-t-secondary">
				{#if rfc.obsoletes && rfc.obsoletes.length > 0}
					<div class="flex items-baseline gap-2">
						<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
							>Obsoletes</span
						>
						<div class="flex flex-wrap gap-1.5">
							{#each rfc.obsoletes as old (old)}
								{@const oldRfc = getRfcByNumber(old)}
								{#if oldRfc}
									<button
										class="rounded font-mono text-[11px] transition-colors hover:underline"
										style="color: {accent};"
										onclick={() => navigateToRfc(old)}>RFC {old}</button
									>
								{:else}
									<a
										href="https://datatracker.ietf.org/doc/html/rfc{old}"
										target="_blank"
										rel="noopener noreferrer"
										class="rounded font-mono text-[11px] transition-colors hover:underline"
										style="color: {accent};">RFC {old}</a
									>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
				{#if rfc.obsoletedBy && rfc.obsoletedBy.length > 0}
					<div class="flex items-baseline gap-2">
						<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
							>Obsoleted by</span
						>
						<div class="flex flex-wrap gap-1.5">
							{#each rfc.obsoletedBy as ny (ny)}
								<button
									class="rounded font-mono text-[11px] transition-colors hover:underline"
									style="color: {accent};"
									onclick={() => navigateToRfc(ny)}>RFC {ny}</button
								>
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}

		<!-- Protocols this RFC defines or extends -->
		{#if rfc.protocols && rfc.protocols.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Protocols
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each rfc.protocols as protoId (protoId)}
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

	</article>
{:else}
	<div class="rounded-xl border border-s-border bg-s-glass p-6 text-center">
		<p class="text-sm text-t-secondary">RFC {number} is not in our registry yet.</p>
		<a
			href="https://datatracker.ietf.org/doc/html/rfc{number}"
			target="_blank"
			rel="noopener noreferrer"
			class="mt-2 inline-block text-xs text-sky-400 hover:underline">Open on datatracker.ietf.org →</a
		>
	</div>
{/if}
