<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeId: string;
		color: string;
		onchange: (id: string) => void;
	}

	let { tabs, activeId, color, onchange }: Props = $props();

	let tabEls: HTMLButtonElement[] = $state([]);

	const activeIndex = $derived(tabs.findIndex((t) => t.id === activeId));

	let underlineLeft = $state(0);
	let underlineWidth = $state(0);

	$effect(() => {
		const el = tabEls[activeIndex];
		if (el) {
			underlineLeft = el.offsetLeft;
			underlineWidth = el.offsetWidth;
		}
	});
</script>

<div class="relative flex border-b border-white/5">
	{#each tabs as tab, i (tab.id)}
		<button
			bind:this={tabEls[i]}
			class="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors"
			class:text-slate-200={activeId === tab.id}
			class:text-slate-500={activeId !== tab.id}
			onclick={() => onchange(tab.id)}
		>
			{tab.label}
		</button>
	{/each}

	<!-- Animated underline -->
	<div
		class="absolute bottom-0 h-0.5 transition-all duration-200 ease-out"
		style="background-color: {color}; left: {underlineLeft}px; width: {underlineWidth}px;"
	></div>
</div>
