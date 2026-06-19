<script lang="ts">
	import {
		ArrowLeftRight,
		Orbit,
		Radio,
		Play,
		ShieldCheck,
		Network,
		Antenna,
		// Subcategory icons
		Link2,
		Globe,
		Route,
		Tag,
		GitCommitVertical,
		Package,
		Layers,
		Database,
		Terminal,
		Zap,
		Bot,
		Inbox,
		Cpu,
		Share2,
		MonitorPlay,
		Phone,
		Lock,
		KeyRound,
		Mail,
		Cog,
		Wifi,
		Bluetooth
	} from 'lucide-svelte';

	let {
		icon,
		size = 24,
		animate = false
	}: { icon: string; size?: number; animate?: boolean } = $props();

	const iconMap: Record<string, typeof ArrowLeftRight> = {
		// Categories
		'network-foundations': Network,
		transport: ArrowLeftRight,
		'web-api': Orbit,
		'async-iot': Radio,
		'realtime-av': Play,
		utilities: ShieldCheck,
		wireless: Antenna,
		// Subcategories
		'link-layer': Link2,
		'internet-layer': Globe,
		routing: Route,
		naming: Tag,
		'reliable-streams': GitCommitVertical,
		'datagram-transport': Package,
		'http-versions': Layers,
		'resource-query-apis': Database,
		'rpc-styles': Terminal,
		'realtime-web': Zap,
		'agent-protocols': Bot,
		'enterprise-brokers': Inbox,
		'iot-messaging': Cpu,
		'federated-messaging': Share2,
		'streaming-delivery': MonitorPlay,
		'conferencing-calls': Phone,
		'secure-channels-vpn': Lock,
		authentication: KeyRound,
		'mail-file-transfer': Mail,
		'network-services': Cog,
		'wlan-wan': Wifi,
		'pan-proximity': Bluetooth
	};

	const Component = $derived(iconMap[icon]);
</script>

{#if Component}
	<span class="icon-animate inline-flex" class:animate>
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
	.icon-animate.animate,
	.icon-animate:hover {
		animation: icon-pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	@keyframes icon-pulse {
		0% {
			transform: scale(1) rotate(0deg);
		}
		30% {
			transform: scale(1.15) rotate(-5deg);
		}
		60% {
			transform: scale(1.1) rotate(3deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.icon-animate.animate,
		.icon-animate:hover {
			animation: none;
		}
	}
</style>
