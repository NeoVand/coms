<script lang="ts">
	let { icon, size = 24 }: { icon: string; size?: number } = $props();
</script>

{#if icon === 'transport'}
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
		<path d="M7 16V4m0 0L3 8m4-4l4 4" />
		<path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
	</svg>
{:else if icon === 'web-api'}
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
		<ellipse cx="12" cy="12" rx="4" ry="10" />
		<path d="M2 12h20" />
		<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
	</svg>
{:else if icon === 'async-iot'}
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
		<path d="M12 20V10" />
		<path d="M12 10l-3 3" />
		<path d="M12 10l3 3" />
		<path d="M5.636 15.364a5 5 0 0 1 0-7.071" />
		<path d="M18.364 8.293a5 5 0 0 1 0 7.071" />
		<path d="M3.515 17.485a8 8 0 0 1 0-11.314" />
		<path d="M20.485 6.171a8 8 0 0 1 0 11.314" />
	</svg>
{:else if icon === 'realtime-av'}
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
		<polygon points="5,3 19,12 5,21" fill="currentColor" opacity="0.15" />
		<polygon points="5,3 19,12 5,21" />
	</svg>
{:else if icon === 'utilities'}
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
		<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		<circle cx="12" cy="16" r="1" fill="currentColor" />
	</svg>
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
