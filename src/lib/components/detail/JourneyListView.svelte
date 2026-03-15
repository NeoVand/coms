<script lang="ts">
	import { getJourneysByScope } from '$lib/data/journeys';
	import { getProtocolById, getCategoryById, buildGraphNodes } from '$lib/data/index';
	import { getAppState } from '$lib/state/context';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { scope, color = '#FFFFFF' }: { scope: string; color?: string } = $props();

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	const journeys = $derived(getJourneysByScope(scope));
	const journey = $derived(appState.activeJourney);
	const stepIndex = $derived(appState.activeJourneyStepIndex);
	const isFirst = $derived(stepIndex === 0);
	const isLast = $derived(journey ? stepIndex === journey.steps.length - 1 : true);

	function startJourney(j: (typeof journeys)[number]) {
		appState.startJourney(j);
	}

	function goToStep(index: number) {
		if (!journey) return;
		appState.goToJourneyStep(index);
	}
</script>

{#if journey}
	<div class="flex flex-col gap-0">
		<!-- Header: back + title + nav -->
		<div class="mb-4">
			<button
				class="mb-3 flex items-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-slate-300"
				onclick={() => appState.exitJourney()}
			>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back
			</button>

			<div class="flex items-start justify-between gap-3">
				<div class="flex-1 min-w-0">
					<h3 class="text-sm font-bold text-slate-100">{journey.title}</h3>
					<p class="mt-0.5 text-[11px] leading-relaxed text-slate-500">
						{journey.description}
					</p>
				</div>
				<!-- Compact nav -->
				<div class="flex shrink-0 items-center gap-1">
					<button
						class="flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-20"
						style="color: {journey.color};"
						disabled={isFirst}
						onclick={() => goToStep(stepIndex - 1)}
						aria-label="Previous step"
					>
						<ChevronLeft size={16} />
					</button>
					<span class="min-w-[3ch] text-center text-[11px] tabular-nums text-slate-500">
						{stepIndex + 1}/{journey.steps.length}
					</span>
					<button
						class="flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-20"
						style="color: {journey.color};"
						disabled={isLast}
						onclick={() => goToStep(stepIndex + 1)}
						aria-label="Next step"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		</div>

		<!-- Vertical timeline -->
		<div class="relative">
			{#each journey.steps as step, i (i)}
				{@const proto = getProtocolById(step.protocolId)}
				{@const cat = proto ? getCategoryById(proto.categoryId) : null}
				{@const catColor = cat?.color ?? journey.color}
				{@const isActive = i === stepIndex}
				{@const isPast = i < stepIndex}
				{@const isFuture = i > stepIndex}
				{@const isLast = i === journey.steps.length - 1}

				<!-- Step row -->
				<button
					class="group relative flex w-full gap-3 text-left"
					onclick={() => goToStep(i)}
				>
					<!-- Timeline track -->
					<div class="flex w-5 shrink-0 flex-col items-center">
						<!-- Dot -->
						<div
							class="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all"
							style={isActive
								? `background-color: ${catColor}; color: rgb(2, 6, 15); box-shadow: 0 0 12px ${catColor}50;`
								: isPast
									? `background-color: ${catColor}50; color: ${catColor};`
									: `background-color: transparent; border: 1.5px solid ${catColor}30; color: ${catColor}40;`}
						>
							{i + 1}
						</div>
						<!-- Connector line -->
						{#if !isLast}
							<div
								class="w-px flex-1"
								style="background-color: {isPast ? journey.color + '40' : journey.color + '15'};"
							></div>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0 {isLast ? 'pb-0' : 'pb-4'}">
						<div class="flex items-baseline gap-2">
							<span
								class="text-[13px] font-semibold transition-colors"
								style={isActive || isPast ? `color: ${catColor};` : ''}
								class:text-slate-600={isFuture}
							>
								{proto?.abbreviation ?? step.protocolId}
							</span>
							<span
								class="text-[11px] transition-colors"
								class:text-slate-300={isActive}
								class:text-slate-500={isPast}
								class:text-slate-600={isFuture}
							>
								{step.title}
							</span>
						</div>

						{#if isActive}
							<p class="mt-1.5 text-xs leading-relaxed text-slate-300">
								{step.description}
							</p>
							{#if step.transition && i < journey.steps.length - 1}
								<p
									class="mt-2 border-l-2 pl-2.5 text-[11px] leading-relaxed italic"
									style="border-color: {journey.color}30; color: {journey.color}80;"
								>
									{step.transition}
								</p>
							{/if}
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
{:else if journeys.length === 0}
	<div class="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
		<p class="text-sm text-slate-500">No journeys available yet.</p>
	</div>
{:else}
	<div class="flex flex-col gap-3">
		{#each journeys as j (j.id)}
			<button
				class="w-full rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
				onclick={() => startJourney(j)}
			>
				<h4 class="text-sm font-semibold text-slate-200">{j.title}</h4>
				<p class="mt-1 text-xs leading-relaxed text-slate-400">{j.description}</p>
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each j.steps as step, i (i)}
						{@const proto = getProtocolById(step.protocolId)}
						{#if proto}
							<span
								class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
								style="background-color: {j.color}15; color: {j.color};"
							>
								{proto.abbreviation}
							</span>
						{/if}
					{/each}
				</div>
			</button>
		{/each}
	</div>
{/if}
