<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { navigateToProtocol } from '$lib/utils/navigation';

	const appState = getAppState();

	const journey = $derived(appState.activeJourney);
	const stepIndex = $derived(appState.activeJourneyStepIndex);
	const currentStep = $derived(journey?.steps[stepIndex]);
	const isFirst = $derived(stepIndex === 0);
	const isLast = $derived(journey ? stepIndex === journey.steps.length - 1 : true);
	const currentProto = $derived(currentStep ? getProtocolById(currentStep.protocolId) : null);
	const currentCat = $derived(currentProto ? getCategoryById(currentProto.categoryId) : null);

	function navigateToStep(index: number) {
		if (!journey) return;
		if (index < 0 || index >= journey.steps.length) return;
		appState.goToJourneyStep(index);
		const step = journey.steps[index];
		navigateToProtocol(step.protocolId);
	}
</script>

{#if journey}
	<div class="rounded-xl border border-s-border bg-s-glass">
		<div class="flex flex-col gap-3 p-4">
			<!-- Top row: title + counter + end tour link -->
			<div class="flex items-center gap-3">
				<div class="min-w-0 flex-1">
					<div class="flex items-baseline gap-2">
						<h4 class="truncate text-base font-semibold text-t-primary">{journey.title}</h4>
						<span class="shrink-0 text-xs text-t-muted tabular-nums">
							{stepIndex + 1} / {journey.steps.length}
						</span>
					</div>
				</div>

				<button
					class="shrink-0 text-xs font-medium text-t-muted underline-offset-4 transition-colors hover:text-t-primary hover:underline"
					onclick={() => appState.exitJourney()}
					aria-label="End tour"
				>
					End tour
				</button>
			</div>

			<!-- Step dots + nav -->
			<div class="flex items-center justify-between gap-2">
				<button
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-t-secondary transition-all hover:bg-s-glass-hover hover:text-t-primary disabled:opacity-25 disabled:hover:bg-transparent"
					disabled={isFirst}
					onclick={() => navigateToStep(stepIndex - 1)}
					aria-label="Previous step"
				>
					<ChevronLeft size={16} />
				</button>

				<div class="flex flex-1 items-center justify-center gap-1.5">
					{#each journey.steps as step, i (i)}
						{@const proto = getProtocolById(step.protocolId)}
						{@const cat = proto ? getCategoryById(proto.categoryId) : null}
						{@const dotColor = cat?.color ?? journey.color}
						{@const isCurrent = i === stepIndex}
						{@const isVisited = i < stepIndex}
						<button
							class="group relative flex items-center justify-center p-1"
							onclick={() => navigateToStep(i)}
							aria-label="Go to step {i + 1}: {step.title}"
						>
							<span
								class="block h-2 w-2 rounded-full transition-all"
								class:scale-150={isCurrent}
								style={isCurrent
									? `background-color: ${dotColor}; box-shadow: 0 0 8px ${dotColor}80;`
									: isVisited
										? `background-color: ${dotColor};`
										: `background-color: ${dotColor}30; border: 1px solid ${dotColor}50;`}
							></span>
							<span
								class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
							>
								{proto?.abbreviation ?? step.protocolId}
							</span>
						</button>
					{/each}
				</div>

				<button
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-t-secondary transition-all hover:bg-s-glass-hover hover:text-t-primary disabled:opacity-25 disabled:hover:bg-transparent"
					disabled={isLast}
					onclick={() => navigateToStep(stepIndex + 1)}
					aria-label="Next step"
				>
					<ChevronRight size={16} />
				</button>
			</div>

			<!-- Current step info -->
			{#if currentStep}
				<div class="flex items-baseline gap-2">
					<span
						class="rounded px-1.5 py-0.5 text-xs font-semibold"
						style="background-color: {currentCat?.color ??
							journey.color}20; color: {currentCat?.color ?? journey.color};"
					>
						{currentProto?.abbreviation ?? currentStep.protocolId}
					</span>
					<span class="text-base font-medium text-t-primary">{currentStep.title}</span>
				</div>

				{#if currentStep.transition && !isLast}
					<p class="text-sm leading-relaxed text-t-secondary">
						{currentStep.transition}
					</p>
				{/if}
			{/if}
		</div>
	</div>
{/if}
