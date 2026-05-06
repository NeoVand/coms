<script lang="ts">
	import { pioneers, getCategoryById } from '$lib/data/index';
	import { navigateToPioneer } from '$lib/utils/navigation';
	import { themedDomColor } from '$lib/utils/colors';
	import { getAppState } from '$lib/state/context';
	import { Users } from 'lucide-svelte';

	const appState = getAppState();

	/** Sort pioneers by birth-year so the chronology of the field
	 *  becomes the natural reading order. */
	const sorted = $derived(
		[...pioneers].sort((a, b) => parseInt(a.years) - parseInt(b.years))
	);
</script>

<div class="flex flex-col gap-6">
	<header>
		<div
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-300 uppercase"
			style="background-color: rgba(167, 139, 250, 0.2);"
		>
			<Users size={11} />
			Pioneers
		</div>
		<h1 class="mt-2 text-2xl leading-tight font-bold tracking-tight text-t-primary">
			The architects of the field
		</h1>
		<p class="mt-2 text-sm leading-relaxed text-t-secondary">
			{pioneers.length} people whose work shows up across the protocols in this lab —
			from Bob Metcalfe's 1973 Ethernet sketch to Eric Rescorla's TLS 1.3 redesign half a
			century later.
		</p>
	</header>

	<div class="space-y-2">
		{#each sorted as p (p.id)}
			{@const catId = p.categories?.[0]}
			{@const cat = catId ? getCategoryById(catId) : null}
			{@const accent = themedDomColor(cat?.color ?? '#94a3b8', appState.theme)}
			<button
				class="group flex w-full items-start gap-3 rounded-xl border border-s-border bg-s-glass p-3 text-left transition-all hover:bg-s-glass-hover"
				onclick={() => navigateToPioneer(p.id)}
			>
				{#if p.imagePath}
					<img
						src={p.imagePath}
						alt={p.name}
						class="h-10 w-10 shrink-0 rounded-full object-cover"
					/>
				{:else}
					<span
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						style="background-color: {accent}20; color: {accent};"
					>
						{p.name
							.split(' ')
							.map((s) => s[0])
							.join('')
							.slice(0, 2)}
					</span>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="flex items-baseline gap-2">
						<span class="text-sm font-medium text-t-primary" style="color: {accent};">
							{p.name}
						</span>
						<span class="text-[10px] text-t-muted tabular-nums">{p.years}</span>
					</div>
					{#if p.title}
						<p class="mt-0.5 text-xs text-t-secondary">{p.title}</p>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</div>
