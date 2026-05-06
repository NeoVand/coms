<script lang="ts">
	import type { HowItWorksStep } from '$lib/data/types';
	import { parseRichText } from '$lib/utils/text-parser';
	import ConceptTrigger from '$lib/components/detail/ConceptTrigger.svelte';
	import RfcRef from '$lib/components/detail/inline/RfcRef.svelte';
	import OutageLink from '$lib/components/detail/inline/OutageLink.svelte';
	import PioneerLink from '$lib/components/detail/inline/PioneerLink.svelte';
	import GlossaryLink from '$lib/components/detail/inline/GlossaryLink.svelte';
	import { navigateToProtocol } from '$lib/utils/navigation';

	let { steps, color }: { steps: HowItWorksStep[]; color: string } = $props();
</script>

<section data-tour="how-it-works">
	<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">How It Works</h3>
	<div class="relative space-y-0">
		{#each steps as step, i (i)}
			{@const segments = parseRichText(step.description)}
			<div class="relative flex gap-3 pb-4">
				<!-- Vertical connector line -->
				{#if i < steps.length - 1}
					<div
						class="absolute top-[24px] left-[11px] w-[2px]"
						style="background-color: {color}20; height: calc(100% - 12px)"
					></div>
				{/if}

				<!-- Step number circle -->
				<div
					class="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
					style="background-color: {color}20; color: {color}"
				>
					{i + 1}
				</div>

				<div>
					<h4 class="text-sm font-medium text-t-primary">{step.title}</h4>
					<p class="mt-0.5 text-xs leading-relaxed text-t-secondary">
						{#each segments as seg, j (j)}
							{#if seg.type === 'text'}
								{seg.value}
							{:else if seg.type === 'bold'}
								<strong class="font-semibold text-t-primary">{seg.value}</strong>
							{:else if seg.type === 'protocol-link'}
								<button
									class="inline font-medium transition-colors hover:underline"
									style="color: {color}"
									onclick={() => navigateToProtocol(seg.protocolId)}
								>
									{seg.label}
								</button>
							{:else if seg.type === 'bold-protocol-link'}
								<button
									class="inline font-semibold transition-colors hover:underline"
									style="color: {color}"
									onclick={() => navigateToProtocol(seg.protocolId)}
								>
									{seg.label}
								</button>
							{:else if seg.type === 'concept'}
								<ConceptTrigger conceptId={seg.conceptId} label={seg.label} />
							{:else if seg.type === 'bold-concept'}
								<ConceptTrigger conceptId={seg.conceptId} label={seg.label} bold />
							{:else if seg.type === 'rfc-ref'}
								<RfcRef number={seg.number} label={seg.label} {color} />
							{:else if seg.type === 'outage-link'}
								<OutageLink outageId={seg.outageId} label={seg.label} {color} />
							{:else if seg.type === 'pioneer-link'}
								<PioneerLink pioneerId={seg.pioneerId} label={seg.label} {color} />
							{:else if seg.type === 'glossary-link'}
								<GlossaryLink conceptId={seg.conceptId} label={seg.label} {color} />
							{/if}
						{/each}
					</p>
				</div>
			</div>
		{/each}
	</div>
</section>
