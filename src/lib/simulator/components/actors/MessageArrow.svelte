<script lang="ts">
	interface Props {
		fromX: number;
		toX: number;
		y: number;
		color: string;
		label?: string;
		active?: boolean;
		lost?: boolean;
	}

	let { fromX, toX, y, color, label = '', active = false, lost = false }: Props = $props();

	const direction = $derived(toX > fromX ? 1 : -1);
	const arrowSize = 7;
	const midX = $derived((fromX + toX) / 2);
	const lineColor = $derived(lost ? '#ef4444' : color);
</script>

<g class="message-arrow" opacity={active ? 1 : 0.3}>
	<!-- Line -->
	<line
		x1={fromX}
		y1={y}
		x2={toX - direction * arrowSize}
		y2={y}
		stroke={lineColor}
		stroke-width="1.5"
		stroke-dasharray={active ? '5 3' : 'none'}
		class:animate-dash={active}
	/>

	<!-- Arrowhead -->
	<polygon
		points="{toX},{y} {toX - direction * arrowSize},{y - 3.5} {toX - direction * arrowSize},{y + 3.5}"
		fill={lineColor}
	/>

	<!-- Label -->
	{#if label}
		{@const labelW = Math.max(label.length * 5.5 + 12, 40)}
		<rect
			x={midX - labelW / 2}
			y={y - 19}
			width={labelW}
			height={16}
			rx="4"
			fill="rgba(15, 23, 42, 0.95)"
			stroke={lineColor}
			stroke-width="0.75"
		/>
		<text
			x={midX}
			y={y - 8.5}
			text-anchor="middle"
			fill={lineColor}
			font-size="8.5"
			font-family="ui-monospace, monospace"
			font-weight="600"
		>
			{label}
		</text>
	{/if}

	<!-- Lost indicator (X) -->
	{#if lost}
		<g transform="translate({midX}, {y})">
			<line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" stroke-width="2.5" />
			<line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" stroke-width="2.5" />
		</g>
	{/if}
</g>

<style>
	.animate-dash {
		animation: dashMove 0.8s linear infinite;
	}

	@keyframes dashMove {
		to {
			stroke-dashoffset: -16;
		}
	}
</style>
