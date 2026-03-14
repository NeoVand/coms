<script lang="ts">
	import type { SimulatorState } from '../state.svelte';
	import { RotateCcw, Play } from 'lucide-svelte';

	interface Props {
		state: SimulatorState;
		color: string;
	}

	let { state, color }: Props = $props();
</script>

<div class="flex items-center gap-3">
	<!-- Transport controls -->
	<div class="flex items-center gap-0.5">
		<!-- Reset -->
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
			onclick={state.reset}
			disabled={state.status === 'idle' && state.currentStep < 0}
			aria-label="Reset"
		>
			<RotateCcw size={14} />
		</button>

		<!-- Play / Pause -->
		<button
			class="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/5"
			style="color: {color}"
			onclick={() => (state.status === 'running' ? state.pause() : state.play())}
			aria-label={state.status === 'running' ? 'Pause' : 'Play'}
		>
			{#if state.status === 'running'}
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1" />
					<rect x="14" y="4" width="4" height="16" rx="1" />
				</svg>
			{:else}
				<Play size={18} />
			{/if}
		</button>

		<!-- Step forward -->
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
			onclick={state.step}
			disabled={state.isLastStep && state.status !== 'complete'}
			aria-label="Step forward"
		>
			<svg
				class="h-3.5 w-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 4l10 8-10 8V4z" />
				<line x1="19" y1="5" x2="19" y2="19" />
			</svg>
		</button>
	</div>

	<!-- Segmented progress bar -->
	{#if state.totalSteps > 0}
		<div class="flex flex-1 items-center gap-[3px]">
			{#each Array(state.totalSteps) as _, i (i)}
				{@const filled = state.currentStep >= 0 && i <= state.currentStep}
				{@const isCurrent = state.currentStep >= 0 && i === state.currentStep}
				<button
					class="flex-1 py-1"
					onclick={() => state.goToStep(i)}
					aria-label="Go to step {i + 1}"
				>
					<div
						class="h-1 rounded-full transition-all duration-300"
						style="background-color: {filled ? color : color + '15'};
							{isCurrent ? `box-shadow: 0 0 6px ${color}60;` : ''}"
					></div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Step indicator -->
	<span class="shrink-0 text-[10px] tabular-nums text-slate-500">
		{#if state.currentStep >= 0}
			{state.currentStep + 1}/{state.totalSteps}
		{:else if state.status === 'complete'}
			Done
		{:else}
			Ready
		{/if}
	</span>
</div>
