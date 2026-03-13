<script lang="ts">
	import type { SimulatorState } from '../state.svelte';

	interface Props {
		state: SimulatorState;
		color: string;
	}

	let { state, color }: Props = $props();

	const speeds = [0.5, 1, 2];
</script>

<div class="flex flex-col gap-2">
	<!-- Progress bar -->
	{#if state.totalSteps > 0}
		<div class="h-1 overflow-hidden rounded-full bg-white/5">
			<div
				class="h-full rounded-full transition-all duration-300 ease-out"
				style="
					width: {state.currentStep < 0 ? 0 : ((state.currentStep + 1) / state.totalSteps) * 100}%;
					background-color: {color};
				"
			></div>
		</div>
	{/if}

	<div class="flex items-center justify-between">
		<!-- Transport controls -->
		<div class="flex items-center gap-1">
			<!-- Reset -->
			<button
				class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
				onclick={state.reset}
				disabled={state.status === 'idle' && state.currentStep < 0}
				aria-label="Reset"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 19.8A9 9 0 1 0 4 12" />
				</svg>
			</button>

			<!-- Play / Pause -->
			<button
				class="flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:bg-white/5"
				style="color: {color}"
				onclick={() => state.status === 'running' ? state.pause() : state.play()}
				aria-label={state.status === 'running' ? 'Pause' : 'Play'}
			>
				{#if state.status === 'running'}
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<rect x="6" y="4" width="4" height="16" rx="1" />
						<rect x="14" y="4" width="4" height="16" rx="1" />
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</button>

			<!-- Step forward -->
			<button
				class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
				onclick={state.step}
				disabled={state.isLastStep && state.status !== 'complete'}
				aria-label="Step forward"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 4l10 8-10 8V4z" />
					<line x1="19" y1="5" x2="19" y2="19" />
				</svg>
			</button>
		</div>

		<!-- Step indicator -->
		<span class="text-[10px] text-slate-500">
			{#if state.currentStep >= 0}
				Step {state.currentStep + 1} / {state.totalSteps}
			{:else if state.status === 'complete'}
				Complete
			{:else}
				Ready
			{/if}
		</span>

		<!-- Speed selector -->
		<div class="flex items-center gap-0.5 rounded-lg border border-white/5 bg-white/[0.02] p-0.5">
			{#each speeds as s (s)}
				<button
					class="rounded-md px-2 py-1 text-[10px] font-medium transition-all"
					class:text-slate-200={state.speed === s}
					class:text-slate-500={state.speed !== s}
					style={state.speed === s ? `background-color: ${color}15; color: ${color}` : ''}
					onclick={() => state.setSpeed(s)}
				>
					{s}x
				</button>
			{/each}
		</div>
	</div>
</div>
