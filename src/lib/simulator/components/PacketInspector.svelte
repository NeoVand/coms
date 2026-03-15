<script lang="ts">
	import type { ProtocolLayer } from '../types';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';

	interface Props {
		layers: ProtocolLayer[];
		activeLayerIndex?: number;
		direction?: 'encapsulate' | 'decapsulate';
		highlightFields?: string[];
		compact?: boolean;
	}

	let { layers, activeLayerIndex = -1, direction = 'encapsulate', highlightFields = [], compact = false }: Props = $props();
	const appState = getAppState();

	/** Theme-aware layer color */
	function lc(rawColor: string): string {
		return themedDomColor(rawColor, appState.theme);
	}

	let hoveredField: { layerIdx: number; fieldIdx: number; layerColor: string; name: string; value: string; bits: number; description: string } | null = $state(null);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let tooltipEl: HTMLDivElement | undefined = $state();

	// Portal: move tooltip to document.body so it escapes overflow/transform ancestors
	$effect(() => {
		if (tooltipEl) {
			document.body.appendChild(tooltipEl);
			return () => {
				if (tooltipEl?.parentNode === document.body) {
					document.body.removeChild(tooltipEl);
				}
			};
		}
	});

	const visibleLayers = $derived.by(() => {
		if (activeLayerIndex < 0) return layers;
		if (direction === 'encapsulate') {
			return layers.slice(layers.length - 1 - activeLayerIndex);
		}
		return layers.slice(activeLayerIndex);
	});

	// Display innermost layer first (reverse: DATA → TCP → IP → ETH)
	const displayLayers = $derived([...visibleLayers].reverse());

	function isHighlighted(fieldName: string): boolean {
		return highlightFields.includes(fieldName);
	}

	function formatValue(value: string | number): string {
		return String(value);
	}

	function onFieldEnter(e: MouseEvent, li: number, fi: number, layer: ProtocolLayer, field: ProtocolLayer['headerFields'][0]) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		hoveredField = {
			layerIdx: li,
			fieldIdx: fi,
			layerColor: lc(layer.color),
			name: field.name,
			value: formatValue(field.value),
			bits: field.bits,
			description: field.description
		};
	}

	function onFieldMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function onFieldLeave() {
		hoveredField = null;
	}

	// Keep tooltip on-screen
	const TOOLTIP_W = 240;
	const TOOLTIP_OFFSET = 12;
	const tooltipLeft = $derived.by(() => {
		if (!hoveredField) return 0;
		const spaceRight = (typeof window !== 'undefined' ? window.innerWidth : 1920) - mouseX;
		if (spaceRight < TOOLTIP_W + TOOLTIP_OFFSET + 20) {
			return mouseX - TOOLTIP_W - TOOLTIP_OFFSET;
		}
		return mouseX + TOOLTIP_OFFSET;
	});
	const tooltipTop = $derived(mouseY - 8);
</script>

{#if compact}
	<div class="flex flex-wrap items-center gap-1">
		{#each layers as layer (layer.abbreviation)}
			<span
				class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
				style="background-color: {lc(layer.color)}15; color: {lc(layer.color)}; border: 1px solid {lc(layer.color)}30;"
			>
				<span
					class="h-1.5 w-1.5 rounded-full"
					style="background-color: {lc(layer.color)};"
				></span>
				{layer.abbreviation}
			</span>
		{/each}
	</div>
{:else}
<div class="flex flex-col gap-1">
	<h4 class="text-xs font-semibold tracking-wider text-t-muted uppercase">
		Encapsulation
	</h4>

	<div class="relative rounded-lg border border-s-border bg-s-glass p-3">
		{#each displayLayers as layer, li (layer.abbreviation)}
			<!-- Encapsulation connector between layers -->
			{#if li > 0}
				<div class="flex items-center gap-2 py-2 pl-3">
					<svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
						<path
							d="M8 2v8m0 0l-3-3m3 3l3-3"
							stroke={lc(layer.color)}
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							opacity="0.6"
						/>
						<rect x="2" y="12" width="12" height="3" rx="1" stroke={lc(layer.color)} stroke-width="1" opacity="0.4" fill="{lc(layer.color)}10" />
					</svg>
					<span class="text-[10px] text-t-muted">wrapped in <span style="color: {lc(layer.color)}" class="font-semibold">{layer.abbreviation}</span></span>
				</div>
			{/if}

			<!-- Layer card -->
			<div
				class="overflow-hidden rounded-lg transition-all duration-300"
				style="
					border: 1px solid {lc(layer.color)}25;
					background-color: {lc(layer.color)}05;
				"
			>
				<!-- Layer header -->
				<div
					class="flex items-center gap-2 px-3 py-1.5"
					style="background-color: {lc(layer.color)}0a; border-bottom: 1px solid {lc(layer.color)}15;"
				>
					<div
						class="h-2 w-2 rounded-full shrink-0"
						style="background-color: {lc(layer.color)}; box-shadow: 0 0 6px {lc(layer.color)}60;"
					></div>
					<span class="text-[11px] font-bold tracking-wider uppercase" style="color: {lc(layer.color)}">
						{layer.abbreviation}
					</span>
					<span class="text-[10px] text-t-muted">
						Layer {layer.osiLayer} — {layer.name}
					</span>
				</div>

				<!-- Header fields -->
				<div class="grid gap-1 p-2" style="grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));">
					{#each layer.headerFields as field, fi (field.name)}
						{@const highlighted = isHighlighted(field.name)}
						{@const isFullRow = field.bits === 0}
						<div
							class="flex min-w-0 flex-col overflow-hidden rounded-md px-2 py-1 transition-all cursor-help"
							style="
								background-color: {highlighted ? lc(layer.color) + '18' : 'var(--theme-glass-bg)'};
								border: 1px solid {highlighted ? lc(layer.color) + '40' : 'var(--theme-glass-border)'};
								grid-column: {isFullRow ? '1 / -1' : 'span 1'};
							"
							onmouseenter={(e) => onFieldEnter(e, li, fi, layer, field)}
							onmousemove={onFieldMove}
							onmouseleave={onFieldLeave}
							role="presentation"
						>
							<span class="text-[8px] leading-tight text-t-muted">{field.name}</span>
							<span
								class="truncate text-[11px] font-mono font-medium"
								style="color: {highlighted ? lc(layer.color) : 'var(--theme-text-primary)'}"
								title={formatValue(field.value)}
							>
								{formatValue(field.value)}
							</span>
							{#if field.bits > 0}
								<span class="text-[7px] text-t-muted">{field.bits}b</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}

		{#if displayLayers.length === 0}
			<div class="py-6 text-center text-xs text-t-muted">
				Press Play to begin encapsulation
			</div>
		{/if}
	</div>
</div>
{/if}

<!-- Tooltip portaled to document.body via $effect -->
<div
	bind:this={tooltipEl}
	class="pointer-events-none fixed z-[9999] rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl"
	class:tooltip-pop={!!hoveredField}
	style="
		left: {tooltipLeft}px;
		top: {tooltipTop}px;
		border-color: {hoveredField?.layerColor ?? 'transparent'}40;
		background-color: var(--theme-tooltip-bg);
		max-width: {TOOLTIP_W}px;
		display: {hoveredField ? 'block' : 'none'};
	"
>
	{#if hoveredField}
		<div class="flex items-center gap-2">
			<span class="text-xs font-semibold" style="color: {hoveredField.layerColor}">{hoveredField.name}</span>
			{#if hoveredField.bits > 0}
				<span class="rounded bg-s-glass px-1.5 py-0.5 text-[10px] text-t-secondary">{hoveredField.bits} bits</span>
			{/if}
		</div>
		<p class="mt-1 text-xs leading-relaxed text-t-primary">{hoveredField.description}</p>
		<p class="mt-1 text-[10px] text-t-muted">
			Value: <span class="font-mono" style="color: {hoveredField.layerColor}">{hoveredField.value}</span>
		</p>
	{/if}
</div>

<style>
	@keyframes tooltip-pop {
		from {
			opacity: 0;
			transform: scale(0.85) translateY(4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.tooltip-pop {
		animation: tooltip-pop 0.2s cubic-bezier(0.34, 1.4, 0.64, 1) both;
	}
</style>
