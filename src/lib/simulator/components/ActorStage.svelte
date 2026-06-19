<script lang="ts">
	import type { SimulationActor, SimulationStep } from '../types';
	import ActorIcon from './actors/ActorIcon.svelte';
	import { getAppState } from '$lib/state/context';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		actors: SimulationActor[];
		currentStep: SimulationStep | null;
		color: string;
		compact?: boolean;
	}

	let { actors, currentStep, color, compact = false }: Props = $props();
	const appState = getAppState();
	const isLight = $derived(appState.theme === 'light');
	const themedColor = $derived(themedDomColor(color, appState.theme));

	const fromIdx = $derived(
		currentStep ? actors.findIndex((a) => a.id === currentStep.fromActor) : -1
	);
	const toIdx = $derived(currentStep ? actors.findIndex((a) => a.id === currentStep.toActor) : -1);

	function isActiveActor(idx: number): boolean {
		return idx === fromIdx || idx === toIdx;
	}
</script>

<div class="actor-stage rounded-xl border border-s-border bg-s-glass" class:compact>
	<!-- Topology + arrow layer (absolutely positioned at the icon row) -->
	<div class="topology" aria-hidden="true">
		<!-- Faint baseline connecting all actors -->
		<div
			class="baseline"
			style="
				left: {100 / (actors.length * 2)}%;
				right: {100 / (actors.length * 2)}%;
			"
		></div>

		{#if currentStep && fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx}
			{@const left = (Math.min(fromIdx, toIdx) + 0.5) * (100 / actors.length)}
			{@const right = (Math.max(fromIdx, toIdx) + 0.5) * (100 / actors.length)}
			{@const reversed = toIdx < fromIdx}

			<!-- Active flowing dashed line -->
			<div
				class="active-line"
				class:reversed
				style="
					left: {left}%;
					width: {right - left}%;
					--flow-color: {themedColor};
				"
			></div>

			<!-- Arrowhead at the destination actor -->
			<div
				class="arrowhead"
				class:reversed
				style="
					left: {reversed ? left : right}%;
					color: {themedColor};
				"
			></div>
		{/if}
	</div>

	<!-- Actor row -->
	<div class="actor-row" style="grid-template-columns: repeat({actors.length}, minmax(0, 1fr));">
		{#each actors as actor, idx (actor.id)}
			{@const active = isActiveActor(idx)}
			<div class="actor" class:active>
				<span class="actor-label" class:text-t-primary={active} class:text-t-muted={!active}>
					{actor.label}
				</span>
				<div
					class="actor-icon-wrap"
					style={active
						? `border-color: ${themedColor}66; box-shadow: 0 0 0 4px ${themedColor}1a;`
						: ''}
				>
					<ActorIcon
						icon={actor.icon}
						color={active ? themedColor : isLight ? '#475569' : '#64748b'}
						size={compact ? 18 : 22}
					/>
				</div>
			</div>
		{/each}
	</div>

	{#if !compact && !currentStep}
		<p class="idle-msg">Press Play to start the simulation</p>
	{/if}
</div>

<style>
	.actor-stage {
		position: relative;
		overflow: hidden;
		padding: 14px 12px 12px;
	}
	.actor-stage.compact {
		padding: 10px 10px 10px;
	}

	/* Topology layer aligned with the icon row */
	.topology {
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 12px;
		height: 26px;
		pointer-events: none;
	}
	.actor-stage.compact .topology {
		left: 10px;
		right: 10px;
		bottom: 10px;
		height: 22px;
	}

	/* Faint baseline connecting all actors */
	.baseline {
		position: absolute;
		top: 50%;
		height: 0;
		border-top: 1px dashed var(--theme-glass-border);
		opacity: 0.7;
	}

	/* Active flowing line — bold animated dashes that move source → destination */
	.active-line {
		position: absolute;
		top: 50%;
		height: 2px;
		transform: translateY(-50%);
		background-image: repeating-linear-gradient(
			to right,
			var(--flow-color) 0,
			var(--flow-color) 6px,
			transparent 6px,
			transparent 12px
		);
		background-size: 12px 100%;
		animation: flow 0.6s linear infinite;
	}
	.active-line.reversed {
		animation-direction: reverse;
	}
	@keyframes flow {
		from {
			background-position-x: 0;
		}
		to {
			background-position-x: 12px;
		}
	}

	/* Triangular arrowhead at the destination */
	.arrowhead {
		position: absolute;
		top: 50%;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 6px 0 6px 9px;
		border-color: transparent transparent transparent currentColor;
		transform: translate(-100%, -50%);
		pointer-events: none;
		filter: drop-shadow(0 0 4px currentColor);
	}
	.arrowhead.reversed {
		border-width: 6px 9px 6px 0;
		border-color: transparent currentColor transparent transparent;
		transform: translate(0, -50%);
	}

	.actor-row {
		position: relative;
		display: grid;
		gap: 4px;
		z-index: 1;
	}

	.actor {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}

	.actor-label {
		font-size: 11px;
		font-weight: 500;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.2;
		text-align: center;
		transition: color 0.2s ease;
	}
	.actor-stage.compact .actor-label {
		font-size: 10px;
	}

	.actor-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 1px solid var(--theme-glass-border);
		background: var(--theme-tooltip-bg);
		transition:
			border-color 0.25s ease,
			box-shadow 0.25s ease;
		flex-shrink: 0;
	}
	.actor-stage.compact .actor-icon-wrap {
		width: 22px;
		height: 22px;
	}

	.idle-msg {
		margin-top: 8px;
		text-align: center;
		font-size: 10px;
		color: var(--theme-text-muted);
	}
</style>
