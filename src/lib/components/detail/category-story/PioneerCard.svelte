<script lang="ts">
	import type { Pioneer } from '$lib/data/category-stories/types';

	let { pioneer, color }: { pioneer: Pioneer; color: string } = $props();

	const initials = $derived(
		pioneer.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
	);

	let imgFailed = $state(false);
</script>

<div class="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
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
	<div class="min-w-0">
		<div class="flex items-baseline gap-2">
			<span class="text-sm font-medium text-slate-200">{pioneer.name}</span>
			{#if pioneer.years}
				<span class="text-[10px] text-slate-600">{pioneer.years}</span>
			{/if}
		</div>
		<div class="text-xs text-slate-400">{pioneer.title}</div>
		<div class="mt-0.5 text-[10px] text-slate-500">{pioneer.org}</div>
		<p class="mt-1.5 text-xs leading-relaxed text-slate-500">{pioneer.contribution}</p>
	</div>
</div>
