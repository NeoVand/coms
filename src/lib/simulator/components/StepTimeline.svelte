<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { SimulationConfig } from '../types';
	import { SimulatorState } from '../state.svelte';
	import ActorStage from './ActorStage.svelte';
	import PacketInspector from './PacketInspector.svelte';

	interface Props {
		config: SimulationConfig;
		sim: SimulatorState;
		color: string;
	}

	let { config, sim, color }: Props = $props();

	let stepElements: HTMLElement[] = [];

	const stepStates = $derived(
		config.steps.map((_, i) => {
			if (sim.currentStep < 0) return 'future' as const;
			if (i < sim.currentStep) return 'past' as const;
			if (i === sim.currentStep) return 'current' as const;
			return 'future' as const;
		})
	);

	function getActorLabel(id: string): string {
		return config.actors.find((a) => a.id === id)?.label ?? id;
	}

	$effect(() => {
		const idx = sim.currentStep;
		if (idx >= 0 && stepElements[idx]) {
			stepElements[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	});
</script>

<section>
	<h3 class="mb-3 text-xs font-semibold tracking-wider text-t-muted uppercase">
		Simulation Steps
	</h3>
	<div class="relative space-y-0">
		{#each config.steps as step, i (step.id)}
			{@const stepState = stepStates[i]}
			{@const isCurrent = stepState === 'current'}
			{@const isPast = stepState === 'past'}
			{@const isFuture = stepState === 'future'}

			<div class="relative flex gap-3 pb-4" bind:this={stepElements[i]}>
				<!-- Vertical connector line -->
				{#if i < config.steps.length - 1}
					<div
						class="absolute top-[24px] left-[11px] w-[2px] transition-colors duration-300"
						style="
							background-color: {isPast || isCurrent ? color + '40' : color + '10'};
							height: calc(100% - 12px);
						"
					></div>
				{/if}

				<!-- Step number circle -->
				<button
					class="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300"
					style="
						background-color: {isCurrent ? color + '30' : isPast ? color + '20' : color + '08'};
						color: {isCurrent ? color : isPast ? color + 'cc' : color + '40'};
						{isCurrent ? `box-shadow: 0 0 8px ${color}40;` : ''}
					"
					onclick={() => sim.goToStep(i)}
					aria-label="Go to step {i + 1}: {step.label}"
				>
					{#if isPast}
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						{i + 1}
					{/if}
				</button>

				<!-- Step content -->
				<div class="min-w-0 flex-1">
					<!-- Label row -->
					<button
						class="w-full text-left"
						onclick={() => sim.goToStep(i)}
					>
						<div
							class="flex items-baseline gap-2 transition-colors duration-300"
						>
							<h4
								class="text-sm font-medium"
								class:text-t-primary={isCurrent}
								class:text-t-secondary={isPast}
								class:text-t-muted={isFuture}
							>
								{step.label}
							</h4>
							<span
								class="text-[10px] text-t-muted"
							>
								{getActorLabel(step.fromActor)} → {getActorLabel(step.toActor)}
							</span>
						</div>
					</button>

					<!-- Description (past + current) -->
					{#if isCurrent || isPast}
						<p
							class="mt-1 text-xs leading-relaxed transition-colors duration-300"
							class:text-t-primary={isCurrent}
							class:text-t-muted={isPast}
							in:fly={{ y: 4, duration: 250 }}
						>
							{step.description}
						</p>
					{/if}

					<!-- Current step: full actor stage + packet inspector -->
					{#if isCurrent}
						<div class="mt-3 space-y-3">
							<div in:fly={{ y: 8, duration: 300, delay: 60 }}>
								<ActorStage
									actors={config.actors}
									currentStep={step}
									stepIndex={i}
									{color}
									compact={true}
								/>
							</div>

							{#if step.layers && step.layers.length > 0}
								<div in:fly={{ y: 8, duration: 300, delay: 140 }}>
									<PacketInspector
										layers={step.layers}
										activeLayerIndex={step.layers.length - 1}
										highlightFields={step.highlight ?? []}
									/>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Past step: compact packet summary -->
					{#if isPast && step.layers && step.layers.length > 0}
						<div class="mt-1.5">
							<PacketInspector
								layers={step.layers}
								compact={true}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
