<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import { SimulatorState } from '../state.svelte';
	import { getSimulation } from '../simulations/index';
	import {
		hasLiveDriver,
		liveDriverFor,
		liveKind,
		liveNoteFor,
		WebRTCSession
	} from '../live/index';
	import StepTimeline from './StepTimeline.svelte';
	import PlaybackControls from './PlaybackControls.svelte';
	import SimulationInputs from './SimulationInputs.svelte';
	import WebRTCLive from './WebRTCLive.svelte';
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';

	interface Props {
		protocolId: string;
		color: string;
	}

	let { protocolId, color }: Props = $props();

	const simState = new SimulatorState();

	// Resolve and load the simulation exactly once at mount. The parent wraps
	// this component in {#key protocolId} so a protocol change fully remounts it
	// — so reading protocolId once here is intentional. `untrack` documents that
	// (and avoids loading sim state inside an effect, which Svelte flags as an
	// unsafe mutation).
	const config = untrack(() => getSimulation(protocolId));
	if (config) simState.load(config);

	// Only protocols the browser can genuinely exercise get a live toggle.
	// protocolId is read once (the parent remounts this view on protocol change).
	const canGoLive = untrack(() => hasLiveDriver(protocolId));
	const kind = untrack(() => liveKind(protocolId));
	const liveNote = untrack(() => liveNoteFor(protocolId));

	let runController: AbortController | null = null;
	// The stateful WebRTC session lives only while in live mode for a session
	// protocol; each Demo⇄Live switch tears the connection down cleanly.
	let webrtc: WebRTCSession | null = $state(null);

	function setMode(mode: 'scripted' | 'live') {
		runController?.abort();
		runController = null;
		simState.setMode(mode);
		if (kind === 'session') {
			webrtc?.reset();
			webrtc =
				mode === 'live'
					? new WebRTCSession({ append: simState.appendStep, clear: simState.clearLive })
					: null;
		}
	}

	async function runLive() {
		const driver = liveDriverFor(protocolId);
		if (!driver) return;
		runController?.abort();
		runController = new AbortController();
		simState.liveSteps = [];
		simState.liveError = null;
		simState.currentStep = -1;
		simState.status = 'running';
		try {
			await driver.run({
				userValues: simState.userValues,
				append: simState.appendStep,
				signal: runController.signal
			});
			simState.status = simState.totalSteps > 0 ? 'complete' : 'idle';
		} catch (err) {
			simState.liveError = (err as Error).message;
			simState.status = 'idle';
		}
	}

	onDestroy(() => {
		runController?.abort();
		webrtc?.reset();
	});

	const liveSession = $derived(simState.mode === 'live' && kind === 'session');
</script>

{#if config}
	<div class="flex flex-col gap-4" data-tour="simulator-view">
		<!-- Title + Demo/Live toggle -->
		<div>
			<div class="flex items-start justify-between gap-3">
				<h3 class="text-sm font-semibold text-t-primary">{config.title}</h3>
				{#if canGoLive}
					<div
						class="flex shrink-0 items-center rounded-md border border-s-border p-0.5 text-[10px] font-semibold"
						role="tablist"
						aria-label="Simulation mode"
					>
						{#each [['scripted', 'Demo'], ['live', 'Live']] as [mode, label] (mode)}
							{@const active = simState.mode === mode}
							<button
								role="tab"
								aria-selected={active}
								class="rounded px-2 py-0.5 transition-colors"
								style={active
									? `background-color: ${color}22; color: ${color};`
									: 'color: var(--theme-text-muted);'}
								onclick={() => setMode(mode as 'scripted' | 'live')}
							>
								{label}
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<p class="mt-0.5 text-xs text-t-secondary">
				{#if simState.mode === 'live' && liveNote}
					{liveNote}
				{:else}
					<RichText segments={parseRichText(config.description)} {color} />
				{/if}
			</p>
		</div>

		<!-- User inputs (hidden in a live WebRTC session — its own panel drives it) -->
		{#if config.userInputs && !liveSession}
			<SimulationInputs inputs={config.userInputs} state={simState} {color} />
		{/if}

		{#if liveSession && webrtc}
			<!-- Interactive two-device session (WebRTC data channel) -->
			<WebRTCLive session={webrtc} {color} />
		{:else}
			<!-- Playback controls (scripted demo, or one-shot live request like DNS) -->
			<PlaybackControls state={simState} {color} onRun={runLive} />

			<!-- Live error -->
			{#if simState.mode === 'live' && simState.liveError}
				<p class="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
					{simState.liveError}
				</p>
			{/if}

			<!-- Empty live state: prompt to run -->
			{#if simState.mode === 'live' && simState.totalSteps === 0 && !simState.liveError && simState.status !== 'running'}
				<p class="text-xs text-t-muted">
					Press <span class="font-semibold" style="color: {color}">Run</span> to perform a real query
					and watch the actual exchange appear below.
				</p>
			{/if}
		{/if}

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
			<svg
				class="h-8 w-8"
				style="color: {color}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="1.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
				/>
			</svg>
		</div>
		<div>
			<p class="text-sm font-medium text-t-primary">Simulation Coming Soon</p>
			<p class="mt-1 text-xs text-t-muted">
				An interactive simulation for this protocol is being developed. Switch to the Learn tab to
				explore its documentation.
			</p>
		</div>
	</div>
{/if}
