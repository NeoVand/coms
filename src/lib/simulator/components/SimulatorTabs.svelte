<script lang="ts">
	import { getAppState } from '$lib/state/context';

	interface Props {
		color: string;
	}

	let { color }: Props = $props();
	const appState = getAppState();
</script>

<div class="relative flex border-b border-white/5">
	<button
		class="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors"
		class:text-slate-200={appState.detailViewMode === 'learn'}
		class:text-slate-500={appState.detailViewMode !== 'learn'}
		onclick={() => (appState.detailViewMode = 'learn')}
	>
		Learn
	</button>
	<button
		class="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors"
		class:text-slate-200={appState.detailViewMode === 'simulate'}
		class:text-slate-500={appState.detailViewMode !== 'simulate'}
		onclick={() => (appState.detailViewMode = 'simulate')}
	>
		Simulate
	</button>

	<!-- Animated underline -->
	<div
		class="absolute bottom-0 h-0.5 transition-all duration-200 ease-out"
		style="background-color: {color}; left: {appState.detailViewMode === 'learn' ? '0px' : '76px'}; width: 68px;"
	></div>
</div>
