<script lang="ts">
	import type { HowItWorksStep } from '$lib/data/types';

	let { steps, color }: { steps: HowItWorksStep[]; color: string } = $props();
</script>

<section>
	<h3 class="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
	<div class="relative space-y-0">
		{#each steps as step, i (i)}
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
					<h4 class="text-sm font-medium text-slate-200">{step.title}</h4>
					<p class="mt-0.5 text-xs leading-relaxed text-slate-400">{step.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>
