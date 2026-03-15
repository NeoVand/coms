<script lang="ts">
	import { ArrowLeftRight, Orbit, Radio, Play, ShieldCheck, Network } from 'lucide-svelte';

	let { icon, size = 24, animate = false }: { icon: string; size?: number; animate?: boolean } = $props();

	const iconMap: Record<string, typeof ArrowLeftRight> = {
		'network-foundations': Network,
		transport: ArrowLeftRight,
		'web-api': Orbit,
		'async-iot': Radio,
		'realtime-av': Play,
		utilities: ShieldCheck
	};

	const Component = $derived(iconMap[icon]);

	let hovered = $state(false);
</script>

{#if Component}
	<span
		class="icon-animate inline-flex"
		class:animate={hovered || animate}
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
	>
		<Component {size} strokeWidth={1.5} />
	</span>
{:else}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
	</svg>
{/if}

<style>
	.icon-animate {
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.icon-animate.animate {
		animation: icon-pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	@keyframes icon-pulse {
		0% { transform: scale(1) rotate(0deg); }
		30% { transform: scale(1.15) rotate(-5deg); }
		60% { transform: scale(1.1) rotate(3deg); }
		100% { transform: scale(1) rotate(0deg); }
	}
</style>
