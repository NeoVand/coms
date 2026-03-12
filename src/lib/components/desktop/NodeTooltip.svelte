<script lang="ts">
	import { getAppState } from '$lib/state/context';
	import { getProtocolById, getCategoryById } from '$lib/data/index';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';

	const appState = getAppState();

	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1920);

	$effect(() => {
		if (!appState.hoveredNode) return;

		function onMouseMove(e: MouseEvent) {
			tooltipX = e.clientX;
			tooltipY = e.clientY;
		}

		function onResize() {
			windowWidth = window.innerWidth;
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('resize', onResize);
		};
	});

	const tooltipLeft = $derived.by(() => {
		const TOOLTIP_WIDTH = 280;
		const PANEL_WIDTH = 520;
		const OFFSET = 16;

		if (appState.showDetailPanel && tooltipX + OFFSET + TOOLTIP_WIDTH > windowWidth - PANEL_WIDTH) {
			return tooltipX - TOOLTIP_WIDTH - OFFSET;
		}
		return tooltipX + OFFSET;
	});

	const hoveredInfo = $derived.by(() => {
		const node = appState.hoveredNode;
		if (!node || node.type === 'hub') return null;

		if (node.type === 'category') {
			const cat = getCategoryById(node.id);
			return cat
				? { name: cat.name, description: cat.description, color: cat.color, icon: cat.icon }
				: null;
		}

		const proto = getProtocolById(node.id);
		return proto
			? {
					name: proto.abbreviation,
					description: proto.oneLiner,
					color: node.color,
					icon: undefined,
					port: proto.port,
					year: proto.year
				}
			: null;
	});
</script>

{#if hoveredInfo && appState.hoveredNode}
	<div
		class="pointer-events-none fixed z-50 max-w-xs rounded-xl border border-white/10 bg-bg-deep/90 px-4 py-3 shadow-2xl backdrop-blur-xl"
		style="left: {tooltipLeft}px; top: {tooltipY -
			8}px; border-left: 3px solid {hoveredInfo.color};"
	>
		<div class="flex items-center gap-2">
			{#if hoveredInfo.icon}
				<span style="color: {hoveredInfo.color}">
					<CategoryIcon icon={hoveredInfo.icon} size={16} />
				</span>
			{/if}
			<span class="text-sm font-semibold" style="color: {hoveredInfo.color}">
				{hoveredInfo.name}
			</span>
			{#if hoveredInfo.port}
				<span class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
					Port {hoveredInfo.port}
				</span>
			{/if}
		</div>
		<p class="mt-1 text-xs leading-relaxed text-slate-300">{hoveredInfo.description}</p>
		{#if hoveredInfo.year}
			<p class="mt-1 text-[10px] text-slate-500">Since {hoveredInfo.year}</p>
		{/if}
	</div>
{/if}
