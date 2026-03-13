<script lang="ts">
	import type { ActorIcon } from '../../types';

	interface Props {
		icon: ActorIcon;
		color?: string;
		size?: number;
	}

	let { icon, color = '#94a3b8', size = 32 }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
	{#if icon === 'client' || icon === 'browser'}
		<!-- Laptop -->
		<path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
		<rect x="2" y="16" width="20" height="4" rx="1" />
		<path d="M10 16v-2h4v2" />
	{:else if icon === 'server'}
		<!-- Server rack -->
		<rect x="4" y="2" width="16" height="6" rx="1" />
		<rect x="4" y="10" width="16" height="6" rx="1" />
		<circle cx="8" cy="5" r="1" fill={color} />
		<circle cx="8" cy="13" r="1" fill={color} />
		<path d="M12 5h4" />
		<path d="M12 13h4" />
		<path d="M6 18v2" />
		<path d="M18 18v2" />
	{:else if icon === 'router'}
		<!-- Router/network -->
		<circle cx="12" cy="12" r="3" />
		<path d="M12 2v7" />
		<path d="M12 15v7" />
		<path d="M2 12h7" />
		<path d="M15 12h7" />
		<circle cx="12" cy="2" r="1" fill={color} />
		<circle cx="12" cy="22" r="1" fill={color} />
		<circle cx="2" cy="12" r="1" fill={color} />
		<circle cx="22" cy="12" r="1" fill={color} />
	{:else if icon === 'dns'}
		<!-- DNS/directory -->
		<path d="M4 4h16v16H4z" />
		<path d="M4 9h16" />
		<path d="M9 4v16" />
		<text x="6" y="7.5" fill={color} stroke="none" font-size="4" font-weight="bold">A</text>
		<text x="11" y="7.5" fill={color} stroke="none" font-size="3.5">→ IP</text>
	{:else}
		<!-- Generic device -->
		<rect x="5" y="2" width="14" height="16" rx="2" />
		<path d="M12 20v2" />
		<circle cx="12" cy="14" r="1" fill={color} />
	{/if}
</svg>
