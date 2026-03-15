<script lang="ts">
	import type { Protocol, Category } from '$lib/data/types';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
	import { getHighlightedName } from '$lib/data/name-highlights';

	let { proto, cat, color = cat?.color ?? '#fff' }: { proto: Protocol; cat: Category | undefined; color?: string } = $props();

	const nameSegments = $derived(getHighlightedName(proto.id, proto.name));
</script>

<div>
	<div class="flex items-start justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-bold text-t-primary">{proto.abbreviation}</h2>
				{#if proto.port}
					<span
						class="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
						style="background-color: {color}15; color: {color}"
					>
						Port {proto.port}
					</span>
				{/if}
			</div>
			<p class="mt-0.5 text-xs text-t-secondary">
				{#each nameSegments as seg}{#if seg.highlight}<span class="font-bold" style="color: {color}">{seg.text}</span>{:else}{seg.text}{/if}{/each}
			</p>
		</div>
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		{#if proto.year}
			<span class="rounded-md bg-s-glass px-2 py-0.5 text-[10px] text-t-secondary">
				Est. {proto.year}
			</span>
		{/if}
		{#if proto.rfc}
			<span class="rounded-md bg-s-glass px-2 py-0.5 text-[10px] text-t-secondary">
				{proto.rfc}
			</span>
		{/if}
		{#if cat}
			<span
				class="rounded-md px-2 py-0.5 text-[10px] font-medium"
				style="background-color: {color}15; color: {color}"
			>
				<span class="inline-flex items-center gap-1">
					<CategoryIcon icon={cat.icon} size={12} />
					{cat.name}
				</span>
			</span>
		{/if}
	</div>

	{#if proto.links && (proto.links.wikipedia || proto.links.rfc || proto.links.official)}
		<div class="mt-2 flex flex-wrap gap-2">
			{#if proto.links.wikipedia}
				<a
					href={proto.links.wikipedia}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex items-center gap-1 rounded-md bg-s-glass px-2 py-0.5 text-[10px] text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
				>
					Wikipedia
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</a>
			{/if}
			{#if proto.links.rfc}
				<a
					href={proto.links.rfc}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex items-center gap-1 rounded-md bg-s-glass px-2 py-0.5 text-[10px] text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
				>
					RFC
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</a>
			{/if}
			{#if proto.links.official}
				<a
					href={proto.links.official}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex items-center gap-1 rounded-md bg-s-glass px-2 py-0.5 text-[10px] text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
				>
					Official Site
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</a>
			{/if}
		</div>
	{/if}

	<p
		class="mt-3 rounded-lg border py-2 px-3 text-sm leading-relaxed text-t-primary"
		style="border-color: {color}30; background-color: {color}08"
	>
		{proto.oneLiner}
	</p>
</div>
