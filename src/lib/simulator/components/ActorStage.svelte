<script lang="ts">
	import type { SimulationActor, SimulationStep } from '../types';
	import ActorIcon from './actors/ActorIcon.svelte';
	import MessageArrow from './actors/MessageArrow.svelte';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		actors: SimulationActor[];
		currentStep: SimulationStep | null;
		stepIndex: number;
		color: string;
		compact?: boolean;
	}

	let { actors, currentStep, stepIndex, color, compact = false }: Props = $props();
	const appState = getAppState();
	const isLight = $derived(appState.theme === 'light');
	const themedColor = $derived(themedDomColor(color, appState.theme));

	const WIDTH = 400;
	const HEIGHT = compact ? 70 : 110;
	const PADDING = 50;
	const ICON_SIZE = 20;
	const ICON_HALF = ICON_SIZE / 2;
	const ICON_GAP = ICON_HALF + 6; // gap from center to arrow start

	function getActorX(actor: SimulationActor): number {
		if (actor.position === 'left') return PADDING;
		if (actor.position === 'right') return WIDTH - PADDING;
		if (actor.position === 'center') return WIDTH / 2;

		const idx = actors.indexOf(actor);
		return PADDING + (idx / (actors.length - 1)) * (WIDTH - 2 * PADDING);
	}

	const LABEL_Y = 14;
	const ICON_Y = 36;
	const ARROW_Y = ICON_Y + 1;
</script>

<div class="rounded-lg border border-s-border bg-s-glass p-1.5">
	<svg viewBox="0 0 {WIDTH} {HEIGHT}" class="w-full">
		<!-- Arrow (drawn first, behind actors) -->
		{#if currentStep}
			{@const fromActor = actors.find((a) => a.id === currentStep.fromActor)}
			{@const toActor = actors.find((a) => a.id === currentStep.toActor)}
			{#if fromActor && toActor}
				{@const fromCx = getActorX(fromActor)}
				{@const toCx = getActorX(toActor)}
				{@const dir = toCx > fromCx ? 1 : -1}
				<MessageArrow
					fromX={fromCx + dir * ICON_GAP}
					toX={toCx - dir * ICON_GAP}
					y={ARROW_Y}
					color={themedColor}
					label={currentStep.label}
					active={true}
				/>
			{/if}
		{/if}

		<!-- Actors -->
		{#each actors as actor (actor.id)}
			{@const x = getActorX(actor)}
			{@const isActive = currentStep?.fromActor === actor.id || currentStep?.toActor === actor.id}

			<!-- Label -->
			<text
				x={x}
				y={LABEL_Y}
				text-anchor="middle"
				fill={isActive ? (isLight ? '#1e293b' : '#e2e8f0') : (isLight ? '#64748b' : '#64748b')}
				font-size="10"
				font-weight="600"
			>
				{actor.label}
			</text>

			<g transform="translate({x}, {ICON_Y})">
				<!-- Glow ring -->
				{#if isActive}
					<circle
						r={ICON_HALF + 6}
						fill="none"
						stroke={themedColor}
						stroke-width="1"
						opacity="0.25"
						class="animate-pulse-glow"
					/>
				{/if}

				<!-- Background circle -->
				<circle
					r={ICON_HALF + 3}
					fill="var(--theme-tooltip-bg)"
					stroke={isActive ? themedColor + '40' : 'var(--theme-glass-border)'}
					stroke-width="1"
				/>

				<!-- Icon -->
				<g transform="translate({-ICON_HALF}, {-ICON_HALF})">
					<ActorIcon
						icon={actor.icon}
						color={isActive ? themedColor : (isLight ? '#475569' : '#64748b')}
						size={ICON_SIZE}
					/>
				</g>
			</g>
		{/each}

		<!-- Idle message -->
		{#if !compact && !currentStep}
			<text
				x={WIDTH / 2}
				y={HEIGHT - 10}
				text-anchor="middle"
				fill={isLight ? '#94a3b8' : '#475569'}
				font-size="10"
			>
				Press Play to start the simulation
			</text>
		{/if}
	</svg>
</div>

<style>
	.animate-pulse-glow {
		animation: pulseGlow 1.5s ease-in-out infinite;
	}

	@keyframes pulseGlow {
		0%, 100% { opacity: 0.15; }
		50% { opacity: 0.35; }
	}
</style>
