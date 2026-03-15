<script lang="ts">
	import { getAppState } from '$lib/state/context';

	let {
		src,
		alt,
		caption,
		credit,
		color,
		title
	}: {
		src: string;
		alt: string;
		caption?: string;
		credit?: string;
		color: string;
		title?: string;
	} = $props();

	const appState = getAppState();
	let imgLoaded = $state(false);
	let imgFailed = $state(false);
</script>

<section>
	<div class="mb-2 flex items-center justify-between">
		{#if title}
			<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</h3>
		{:else}
			<span></span>
		{/if}
		{#if !imgFailed}
			<button
				class="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
				onclick={() => appState.openStoryImageModal(src, alt, color, caption, credit, title)}
				aria-label="Expand image"
				title="View larger"
			>
				<svg
					class="h-3.5 w-3.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
					/>
				</svg>
			</button>
		{/if}
	</div>
	<div class="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
		{#if imgFailed}
			<div class="flex h-24 items-center justify-center">
				<span class="text-xs text-slate-600">Image unavailable</span>
			</div>
		{:else}
			<div class="bg-white">
				{#if !imgLoaded}
					<div class="flex h-32 items-center justify-center bg-slate-100">
						<span class="text-xs text-slate-400">Loading image...</span>
					</div>
				{/if}
				<img
					{src}
					{alt}
					class="w-full"
					class:hidden={!imgLoaded}
					onload={() => (imgLoaded = true)}
					onerror={() => (imgFailed = true)}
				/>
			</div>
		{/if}
		{#if (caption || credit) && !imgFailed}
			<div class="border-t border-white/5 px-4 py-2.5 text-center">
				{#if caption}
					<p class="text-[11px] text-slate-500 italic">{caption}</p>
				{/if}
				{#if credit}
					<p class="mt-0.5 text-[10px] text-slate-600">{credit}</p>
				{/if}
			</div>
		{/if}
	</div>
</section>
