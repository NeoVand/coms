<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById, buildGraphNodes } from '$lib/data/index';
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

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
		const node = allNodes.find((n) => n.id === step.protocolId);
		if (node) appState.selectNode(node);
	}
</script>

{#if journey}
	<div
		class="relative overflow-hidden rounded-xl border border-white/[0.08]"
		style="background: linear-gradient(135deg, {journey.color}08, {journey.color}04);"
	>
		<!-- Color accent line -->
		<div
			class="absolute top-0 left-0 h-full w-1 rounded-l-xl"
			style="background-color: {journey.color};"
		></div>

		<div class="flex flex-col gap-2 py-3 pr-3 pl-4">
			<!-- Top row: title + nav + exit -->
			<div class="flex items-center gap-2">
				<div class="min-w-0 flex-1">
					<div class="flex items-baseline gap-2">
						<h4 class="truncate text-xs font-semibold text-slate-200">{journey.title}</h4>
						<span class="shrink-0 text-[10px] tabular-nums text-slate-500">
							{stepIndex + 1}/{journey.steps.length}
						</span>
					</div>
				</div>

				<!-- Prev/Next -->
				<div class="flex shrink-0 items-center gap-0.5">
					<button
						class="flex h-6 w-6 items-center justify-center rounded-md transition-all hover:bg-white/5 disabled:opacity-20"
						style="color: {journey.color};"
						disabled={isFirst}
						onclick={() => navigateToStep(stepIndex - 1)}
						aria-label="Previous step"
					>
						<ChevronLeft size={14} />
					</button>
					<button
						class="flex h-6 w-6 items-center justify-center rounded-md transition-all hover:bg-white/5 disabled:opacity-20"
						style="color: {journey.color};"
						disabled={isLast}
						onclick={() => navigateToStep(stepIndex + 1)}
						aria-label="Next step"
					>
						<ChevronRight size={14} />
					</button>
				</div>

				<!-- Exit -->
				<button
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
					onclick={() => appState.exitJourney()}
					aria-label="Exit journey"
				>
					<X size={13} />
				</button>
			</div>

			<!-- Step dots -->
			<div class="flex items-center gap-1.5">
				{#each journey.steps as step, i (i)}
					{@const proto = getProtocolById(step.protocolId)}
					{@const cat = proto ? getCategoryById(proto.categoryId) : null}
					{@const dotColor = cat?.color ?? journey.color}
					{@const isCurrent = i === stepIndex}
					{@const isVisited = i < stepIndex}
					<button
						class="group relative flex items-center justify-center"
						onclick={() => navigateToStep(i)}
						aria-label="Go to step {i + 1}: {step.title}"
					>
						<span
							class="block h-2 w-2 rounded-full transition-all"
							class:scale-125={isCurrent}
							style={isCurrent
								? `background-color: ${dotColor}; box-shadow: 0 0 8px ${dotColor}60;`
								: isVisited
									? `background-color: ${dotColor}90;`
									: `background-color: ${dotColor}25; border: 1px solid ${dotColor}40;`}
						></span>
						<!-- Tooltip on hover -->
						<span
							class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9px] text-slate-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
						>
							{proto?.abbreviation ?? step.protocolId}
						</span>
					</button>
				{/each}
			</div>

			<!-- Current step info -->
			{#if currentStep}
				<div class="flex items-baseline gap-2">
					<span class="text-[11px] font-medium" style="color: {currentCat?.color ?? journey.color};">
						{currentProto?.abbreviation ?? currentStep.protocolId}
					</span>
					<span class="text-[11px] text-slate-400">{currentStep.title}</span>
				</div>

				{#if currentStep.transition && !isLast}
					<p
						class="border-l pl-2 text-[10px] leading-relaxed italic"
						style="border-color: {journey.color}25; color: {journey.color}70;"
					>
						{currentStep.transition}
					</p>
				{/if}
			{/if}
		</div>
	</div>
{/if}
