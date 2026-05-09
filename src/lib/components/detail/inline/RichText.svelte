<!--
	RichText — render a `parseRichText()` segment array into inline DOM,
	handling every segment type the parser can produce.

	Many surfaces (OutageView, HowItWorksSteps, GlossaryView, the various
	story renderers) used to inline their own {#each segments} … {/each}
	chains and each handled a different subset of segment types. The
	missing branches silently dropped wrapped content — `[[pioneer:…]]`
	and `[[rfc:…]]` segments inside `outage.setup` rendered as nothing
	at all. This component centralises the rendering so every surface
	gets every link type for free.

	Usage:
		<script lang="ts">
			import { parseRichText } from '$lib/utils/text-parser';
			import RichText from '.../inline/RichText.svelte';
		</script>
		{#each parseParagraphs(prose) as segs}
			<p><RichText segments={segs} color={ACCENT} /></p>
		{/each}

	The optional `color` is used by inline link components that style
	themselves with the surrounding section's accent (protocol-link,
	pioneer-link, rfc-ref, etc.).
-->
<script lang="ts">
	import type { TextSegment } from '$lib/utils/text-parser';
	import ProtocolLink from './ProtocolLink.svelte';
	import PioneerLink from './PioneerLink.svelte';
	import RfcRef from './RfcRef.svelte';
	import OutageLink from './OutageLink.svelte';
	import FrontierLink from './FrontierLink.svelte';
	import GlossaryLink from './GlossaryLink.svelte';
	import ChapterLink from './ChapterLink.svelte';

	interface Props {
		segments: TextSegment[];
		/** Accent color for inline links. Defaults to a neutral sky tone. */
		color?: string;
	}

	let { segments, color = '#38bdf8' }: Props = $props();
</script>

{#each segments as seg, i (i)}
	{#if seg.type === 'text'}{seg.value}{:else if seg.type === 'bold'}<strong
			class="font-semibold text-t-primary">{seg.value}</strong
		>{:else if seg.type === 'italic'}<em class="italic">{seg.value}</em
		>{:else if seg.type === 'code'}<code
			class="rounded bg-s-glass px-1 py-px font-mono text-[0.92em] text-t-primary">{seg.value}</code
		>{:else if seg.type === 'protocol-link'}<ProtocolLink
			protocolId={seg.protocolId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'bold-protocol-link'}<ProtocolLink
			protocolId={seg.protocolId}
			label={seg.label}
			{color}
			bold
		/>{:else if seg.type === 'concept'}<GlossaryLink
			conceptId={seg.conceptId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'bold-concept'}<strong class="font-semibold"
			><GlossaryLink conceptId={seg.conceptId} label={seg.label} {color} /></strong
		>{:else if seg.type === 'rfc-ref'}<RfcRef
			number={seg.number}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'pioneer-link'}<PioneerLink
			pioneerId={seg.pioneerId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'outage-link'}<OutageLink
			outageId={seg.outageId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'glossary-link'}<GlossaryLink
			conceptId={seg.conceptId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'frontier-link'}<FrontierLink
			frontierId={seg.frontierId}
			label={seg.label}
			{color}
		/>{:else if seg.type === 'chapter-link'}<ChapterLink
			partId={seg.partId}
			chapterId={seg.chapterId}
			label={seg.label}
			{color}
		/>{/if}{/each}
