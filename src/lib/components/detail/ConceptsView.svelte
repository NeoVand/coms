<script lang="ts">
	import { foundationSections } from '$lib/data/concept-foundations';
	import { getAppState } from '$lib/state/context';
	import { buildGraphNodes } from '$lib/data/index';
	import StoryNarrative from './category-story/StoryNarrative.svelte';
	import StoryCallout from './category-story/StoryCallout.svelte';
	import StoryDiagram from './category-story/StoryDiagram.svelte';

	const appState = getAppState();
	const allNodes = buildGraphNodes();

	let expandedId: string | null = $state(null);

	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	function goToFoundations() {
		const node = allNodes.find((n) => n.id === 'network-foundations');
		if (node) appState.selectNode(node);
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Link to Network Foundations category -->
	<button
		class="flex items-start gap-2 rounded-lg border border-pink-500/10 bg-pink-500/[0.04] p-3 text-left transition-all hover:border-pink-500/20 hover:bg-pink-500/[0.06]"
		onclick={goToFoundations}
	>
		<span class="mt-0.5 text-sm text-pink-400">→</span>
		<p class="text-xs text-slate-400">
			Looking for specific protocols like Ethernet, IP, or ARP?
			<span class="font-medium text-pink-400">See Network Foundations</span>
		</p>
	</button>

	<!-- Concept sections accordion -->
	{#each foundationSections as section (section.id)}
		<div class="rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:border-white/10">
			<button
				class="flex w-full items-center gap-3 p-3.5 text-left"
				onclick={() => toggle(section.id)}
			>
				<span
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-slate-400"
				>
					{foundationSections.indexOf(section) + 1}
				</span>
				<span class="flex-1 text-sm font-medium text-slate-200">{section.title}</span>
				<span class="text-slate-500 transition-transform" class:rotate-180={expandedId === section.id}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</span>
			</button>

			{#if expandedId === section.id}
				<div class="border-t border-white/5 px-3.5 pb-4 pt-3">
					<div class="flex flex-col gap-4">
						{#each section.sections as storySection (storySection.type + (storySection.title ?? ''))}
							{#if storySection.type === 'narrative'}
								<StoryNarrative text={storySection.text} color="#60a5fa" title={storySection.title} />
							{:else if storySection.type === 'callout'}
								<StoryCallout title={storySection.title} text={storySection.text} />
							{:else if storySection.type === 'diagram'}
								<StoryDiagram
									definition={storySection.definition}
									caption={storySection.caption}
									color="#60a5fa"
									title={storySection.title}
								/>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
