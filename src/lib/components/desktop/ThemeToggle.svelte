<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();
</script>

<button
	class="flex h-7 w-7 items-center justify-center rounded-full border border-s-border bg-bg-deep/80 text-t-secondary shadow-lg backdrop-blur-xl transition-colors hover:bg-s-glass-hover hover:text-t-primary"
	onclick={() => appState.toggleTheme()}
	aria-label={appState.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if appState.theme === 'dark'}
		<Sun size={13} strokeWidth={1.8} />
	{:else}
		<Moon size={13} strokeWidth={1.8} />
	{/if}
</button>
