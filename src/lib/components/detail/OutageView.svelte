<script lang="ts">
	import { getOutageById, getProtocolById, getCategoryById } from '$lib/data/index';
	import { parseRichText } from '$lib/utils/text-parser';
	import {
		navigateToProtocol,
		navigateToOutage as navigateToOutageUrl
	} from '$lib/utils/navigation';
	import { ExternalLink, AlertTriangle, Clock, Users, Lightbulb } from 'lucide-svelte';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';
	import RichText from '$lib/components/detail/inline/RichText.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const appState = getAppState();
	const outage = $derived(getOutageById(id));

	/** Outages get a warm-amber accent — distinct from chapters (sky)
	 *  and pioneers (per-category). The colour says "story / incident". */
	const ACCENT = '#fb923c'; // orange-400

	const CATEGORY_LABEL: Record<string, string> = {
		configuration: 'Configuration error',
		security: 'Security incident',
		'software-bug': 'Software bug',
		hardware: 'Hardware failure',
		'protocol-design': 'Protocol design flaw',
		'human-error': 'Human error',
		capacity: 'Capacity / overload'
	};

	function renderRich(text: string) {
		return parseRichText(text);
	}
</script>

{#if outage}
	<article class="flex flex-col gap-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-2 text-[11px] text-t-muted">
			<span class="flex items-center gap-1" style="color: {ACCENT};">
				<AlertTriangle size={11} />
				Famous outages
			</span>
			<span>·</span>
			<span class="text-t-secondary">{outage.date}</span>
		</nav>

		<!-- Header -->
		<header>
			{#if outage.category}
				<div
					class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
					style="background-color: {ACCENT}20; color: {ACCENT};"
				>
					{CATEGORY_LABEL[outage.category] ?? outage.category}
				</div>
			{/if}
			<h1
				class="mt-2 text-2xl leading-tight font-bold tracking-tight"
				style="color: {ACCENT};"
			>
				{outage.title}
			</h1>
			<p class="mt-2 text-sm leading-relaxed text-t-primary italic">{outage.oneLiner}</p>
			<div class="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] text-t-muted">
				{#if outage.duration}
					<span class="inline-flex items-center gap-1">
						<Clock size={10} />
						{outage.duration}
					</span>
				{/if}
				{#if outage.scale}
					<span>·</span>
					<span class="text-t-secondary">{outage.scale}</span>
				{/if}
			</div>
		</header>

		<!-- Cast -->
		{#if outage.cast && outage.cast.length > 0}
			<section
				class="rounded-xl border border-s-border bg-s-glass p-3"
				style="border-color: {ACCENT}20;"
			>
				<h3
					class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>
					<Users size={10} /> Cast
				</h3>
				<ul class="space-y-1 text-xs">
					{#each outage.cast as actor (actor.name)}
						<li class="flex items-baseline gap-2">
							<span class="font-medium text-t-primary">{actor.name}</span>
							<span class="text-t-muted">{actor.role}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Setup -->
		<section>
			<h2 class="mb-2 text-[11px] font-semibold tracking-wider text-t-muted uppercase">Setup</h2>
			<p class="text-sm leading-relaxed text-t-primary">
				<RichText segments={renderRich(outage.setup)} color={ACCENT} />
			</p>
		</section>

		<!-- Mistake -->
		<section>
			<h2 class="mb-2 text-[11px] font-semibold tracking-wider text-t-muted uppercase">
				Mistake
			</h2>
			<p class="text-sm leading-relaxed text-t-primary">
				<RichText segments={renderRich(outage.mistake)} color={ACCENT} />
			</p>
		</section>

		<!-- Cascade timeline -->
		{#if outage.cascade && outage.cascade.length > 0}
			<section>
				<h2 class="mb-3 text-[11px] font-semibold tracking-wider text-t-muted uppercase">
					Cascade
				</h2>
				<div class="relative ml-3 border-l border-s-border pl-5">
					{#each outage.cascade as beat, i (i)}
						<div class="relative pb-4 last:pb-0">
							<div
								class="absolute top-0.5 -left-[23px] h-2 w-2 rounded-full"
								style="background-color: {ACCENT};"
							></div>
							{#if beat.time}
								<div class="text-[10px] font-bold tracking-wider uppercase" style="color: {ACCENT};">
									{beat.time}
								</div>
							{/if}
							<div class="text-sm font-medium text-t-primary">{beat.title}</div>
							<p class="mt-0.5 text-xs leading-relaxed text-t-secondary">
								<RichText segments={renderRich(beat.description)} color={ACCENT} />
							</p>
							{#if beat.protocols && beat.protocols.length > 0}
								<div class="mt-1.5 flex flex-wrap gap-1">
									{#each beat.protocols as protoId (protoId)}
										{@const proto = getProtocolById(protoId)}
										{@const cat = proto ? getCategoryById(proto.categoryId) : null}
										{@const protoColor = themedDomColor(cat?.color ?? '#94a3b8', appState.theme)}
										{#if proto}
											<button
												class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:underline"
												style="background-color: {protoColor}15; color: {protoColor};"
												onclick={() => navigateToProtocol(proto.id)}
											>
												{proto.abbreviation}
											</button>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Consequence -->
		<section>
			<h2 class="mb-2 text-[11px] font-semibold tracking-wider text-t-muted uppercase">
				Consequence
			</h2>
			<p class="text-sm leading-relaxed text-t-primary">
				<RichText segments={renderRich(outage.consequence)} color={ACCENT} />
			</p>
		</section>

		<!-- Resolution -->
		<section>
			<h2 class="mb-2 text-[11px] font-semibold tracking-wider text-t-muted uppercase">
				Resolution
			</h2>
			<p class="text-sm leading-relaxed text-t-primary">
				<RichText segments={renderRich(outage.resolution)} color={ACCENT} />
			</p>
		</section>

		<!-- Lesson — emphasized callout -->
		<section
			class="rounded-xl border-l-2 p-4"
			style="border-color: {ACCENT}; background-color: {ACCENT}10;"
		>
			<div
				class="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase"
				style="color: {ACCENT};"
			>
				<Lightbulb size={11} />
				Lesson
			</div>
			<p class="text-sm leading-relaxed text-t-primary">
				<RichText segments={renderRich(outage.lesson)} color={ACCENT} />
			</p>
		</section>

		<!-- Affected protocols -->
		{#if outage.affectedProtocols.length > 0}
			<section>
				<h3 class="mb-2 text-[10px] font-semibold tracking-wider text-t-muted uppercase">
					Affected protocols
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each outage.affectedProtocols as protoId (protoId)}
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
				{#each outage.sources as source (source.url)}
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
		<p class="text-sm text-t-secondary">Outage not found.</p>
	</div>
{/if}
