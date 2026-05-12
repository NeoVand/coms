<script lang="ts">
	import type { Pioneer } from '$lib/data/category-stories/types';
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from '$lib/components/detail/inline/RichText.svelte';
	import { pioneers as pioneerRegistry } from '$lib/data/pioneers';
	import { navigateToPioneer } from '$lib/utils/navigation';
	import { ArrowRight } from 'lucide-svelte';

	let { pioneer, color }: { pioneer: Pioneer; color: string } = $props();

	const initials = $derived(
		pioneer.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
	);

	/** Resolve the pioneer-registry id either from the inline `id` field
	 *  or by matching `name` against the registry. When neither resolves,
	 *  the card stays static (no dead-button affordance). */
	const targetId = $derived(
		pioneer.id ?? pioneerRegistry.find((p) => p.name === pioneer.name)?.id
	);

	let imgFailed = $state(false);
</script>

{#if targetId}
	<button
		type="button"
		class="group flex w-full gap-3 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
		style="border-color: {color}20;"
		onclick={() => navigateToPioneer(targetId)}
	>
		<!-- Photo / Initials fallback -->
		<div class="shrink-0">
			{#if pioneer.imagePath && !imgFailed}
				<img
					src={pioneer.imagePath}
					alt={pioneer.name}
					class="h-11 w-11 rounded-full object-cover"
					onerror={() => (imgFailed = true)}
				/>
			{:else}
				<div
					class="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold"
					style="background-color: {color}15; color: {color}"
				>
					{initials}
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2">
				<span class="text-sm font-medium text-t-primary">{pioneer.name}</span>
				{#if pioneer.years}
					<span class="text-[10px] text-t-muted">{pioneer.years}</span>
				{/if}
			</div>
			<div class="text-xs text-t-secondary">{pioneer.title}</div>
			<div class="mt-0.5 text-[10px] text-t-muted">{pioneer.org}</div>
			<p class="mt-1.5 text-xs leading-relaxed text-t-muted">
				<RichText segments={parseRichText(pioneer.contribution)} {color} />
			</p>
		</div>

		<ArrowRight
			size={14}
			class="mt-1 shrink-0 text-t-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
		/>
	</button>
{:else}
	<div class="flex gap-3 rounded-xl border border-s-border bg-s-glass p-3">
		<div class="shrink-0">
			{#if pioneer.imagePath && !imgFailed}
				<img
					src={pioneer.imagePath}
					alt={pioneer.name}
					class="h-11 w-11 rounded-full object-cover"
					onerror={() => (imgFailed = true)}
				/>
			{:else}
				<div
					class="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold"
					style="background-color: {color}15; color: {color}"
				>
					{initials}
				</div>
			{/if}
		</div>
		<div class="min-w-0">
			<div class="flex items-baseline gap-2">
				<span class="text-sm font-medium text-t-primary">{pioneer.name}</span>
				{#if pioneer.years}
					<span class="text-[10px] text-t-muted">{pioneer.years}</span>
				{/if}
			</div>
			<div class="text-xs text-t-secondary">{pioneer.title}</div>
			<div class="mt-0.5 text-[10px] text-t-muted">{pioneer.org}</div>
			<p class="mt-1.5 text-xs leading-relaxed text-t-muted">
				<RichText segments={parseRichText(pioneer.contribution)} {color} />
			</p>
		</div>
	</div>
{/if}
