<script lang="ts">
	import { SimulatorState } from '../state.svelte';
	import { getSimulation } from '../simulations/index';
	import StepTimeline from './StepTimeline.svelte';
	import PlaybackControls from './PlaybackControls.svelte';
	import SimulationInputs from './SimulationInputs.svelte';

	interface Props {
		protocolId: string;
		color: string;
	}

	let { protocolId, color }: Props = $props();

	const simState = new SimulatorState();
	const config = getSimulation(protocolId);

	// Load once at mount — parent uses {#key protocolId} to remount on change
	if (config) simState.load(config);
</script>

{#if config}
	<div class="flex flex-col gap-4">
		<!-- Title -->
		<div>
			<h3 class="text-sm font-semibold text-slate-200">{config.title}</h3>
			<p class="mt-0.5 text-xs text-slate-400">{config.description}</p>
		</div>

		<!-- User inputs -->
		{#if config.userInputs}
			<SimulationInputs inputs={config.userInputs} state={simState} {color} />
		{/if}

		<!-- Playback controls -->
		<PlaybackControls state={simState} {color} />

		<!-- Step timeline -->
		<StepTimeline {config} sim={simState} {color} />
	</div>
{:else}
	<!-- Coming soon placeholder -->
	<div class="flex flex-col items-center gap-4 py-12 text-center">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-2xl"
			style="background-color: {color}10"
		>
			<svg class="h-8 w-8" style="color: {color}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
			</svg>
		</div>
		<div>
			<p class="text-sm font-medium text-slate-300">Simulation Coming Soon</p>
			<p class="mt-1 text-xs text-slate-500">
				An interactive simulation for this protocol is being developed.
				Switch to the Learn tab to explore its documentation.
			</p>
		</div>
	</div>
{/if}
