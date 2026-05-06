<script lang="ts">
	import type { Component, ComponentType, SvelteComponent } from 'svelte';

	/**
	 * Icon component slot — accepts both Svelte 5 `Component<…>` instances
	 * and the legacy class-based `SvelteComponentTyped<…>` exports that
	 * lucide-svelte still ships (until it migrates to runes). Both render
	 * the same way at runtime; this union keeps the type-checker quiet.
	 */
	type TabIcon =
		| Component<{ size?: number | string; strokeWidth?: number | string }>
		| ComponentType<SvelteComponent<{ size?: number | string; strokeWidth?: number | string }>>;

	interface Tab {
		id: string;
		label: string;
		icon?: TabIcon;
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

<div class="relative flex border-b border-s-border">
	{#each tabs as tab, i (tab.id)}
		<button
			bind:this={tabEls[i]}
			class="relative z-10 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors"
			class:text-t-primary={activeId === tab.id}
			class:text-t-muted={activeId !== tab.id}
			onclick={() => onchange(tab.id)}
		>
			{#if tab.icon}
				{@const Icon = tab.icon}
				<Icon size={14} strokeWidth={1.8} />
			{/if}
			{tab.label}
		</button>
	{/each}

	<!-- Animated underline -->
	<div
		class="absolute bottom-0 h-0.5 transition-all duration-200 ease-out"
		style="background-color: {color}; left: {underlineLeft}px; width: {underlineWidth}px;"
	></div>
</div>
