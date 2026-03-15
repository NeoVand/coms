<script lang="ts">
	import type { Protocol } from '$lib/data/types';
	import type { ProtocolPair } from '$lib/data/comparison/types';
	import { getAppState } from '$lib/state/context';
	import { getCategoryById } from '$lib/data/index';
	import LinkedText from './LinkedText.svelte';
	import { themedDomColor } from '$lib/utils/colors';

	interface Props {
		pair: ProtocolPair;
		leftProto: Protocol;
		rightProto: Protocol;
		color: string;
	}

	let { pair, leftProto, rightProto, color }: Props = $props();
	const appState = getAppState();

	const leftCat = $derived(getCategoryById(leftProto.categoryId));
	const rightCat = $derived(getCategoryById(rightProto.categoryId));
	const leftColor = $derived(themedDomColor(leftCat?.color ?? color, appState.theme));
	const rightColor = $derived(themedDomColor(rightCat?.color ?? color, appState.theme));

	// ids[0] is alphabetically first — determine which role text matches which proto
	const flipped = $derived(pair.ids[0] !== leftProto.id);
	const leftRoleText = $derived(flipped ? pair.rightRole : pair.leftRole);
	const rightRoleText = $derived(flipped ? pair.leftRole : pair.rightRole);
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div>
		<button
			class="mb-3 flex items-center gap-1 text-[11px] text-t-muted transition-colors hover:text-t-primary"
			onclick={() => (appState.compareTargetId = null)}
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back
		</button>
		<div class="flex items-center gap-3">
			<span class="text-lg font-bold" style="color: {leftColor}">{leftProto.abbreviation}</span>
			<svg class="h-4 w-4 text-t-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span class="text-lg font-bold" style="color: {rightColor}">{rightProto.abbreviation}</span>
		</div>
	</div>

	<!-- Summary -->
	{#if pair.summary}
		<p class="text-sm leading-relaxed text-t-primary"><LinkedText text={pair.summary} {color} /></p>
	{/if}

	<!-- How They Work Together -->
	{#if pair.howTheyWork}
		<section>
			<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
				How They Work Together
			</h3>
			<p class="text-xs leading-relaxed text-t-secondary"><LinkedText text={pair.howTheyWork} {color} /></p>
		</section>
	{/if}

	<!-- Role Breakdown -->
	{#if leftRoleText || rightRoleText}
		<section>
			<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
				Each Protocol's Role
			</h3>
			<div class="space-y-2">
				{#if leftRoleText}
					<div class="rounded-lg border px-3 py-2.5" style="border-color: {leftColor}20; background-color: {leftColor}08">
						<div class="mb-1 text-xs font-medium" style="color: {leftColor}">
							{leftProto.abbreviation}
						</div>
						<p class="text-xs leading-relaxed text-t-primary"><LinkedText text={leftRoleText} {color} /></p>
					</div>
				{/if}
				{#if rightRoleText}
					<div class="rounded-lg border px-3 py-2.5" style="border-color: {rightColor}20; background-color: {rightColor}08">
						<div class="mb-1 text-xs font-medium" style="color: {rightColor}">
							{rightProto.abbreviation}
						</div>
						<p class="text-xs leading-relaxed text-t-primary"><LinkedText text={rightRoleText} {color} /></p>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Performance Comparison -->
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-t-muted uppercase">
			Performance
		</h3>
		<div class="space-y-2">
			{#each [
				{ label: 'Latency', left: leftProto.performance.latency, right: rightProto.performance.latency },
				{ label: 'Throughput', left: leftProto.performance.throughput, right: rightProto.performance.throughput },
				{ label: 'Overhead', left: leftProto.performance.overhead, right: rightProto.performance.overhead }
			] as stat (stat.label)}
				<div class="rounded-lg border border-s-border bg-s-glass p-3">
					<div class="mb-1.5 text-center text-[10px] font-semibold tracking-wider text-t-muted uppercase">
						{stat.label}
					</div>
					<div class="flex gap-3">
						<div class="flex-1 rounded border border-s-border bg-s-glass px-2.5 py-1.5">
							<div class="mb-0.5 text-[10px] font-medium" style="color: {leftColor}">{leftProto.abbreviation}</div>
							<div class="text-[11px] leading-relaxed text-t-secondary">{stat.left}</div>
						</div>
						<div class="flex-1 rounded border border-s-border bg-s-glass px-2.5 py-1.5">
							<div class="mb-0.5 text-[10px] font-medium" style="color: {rightColor}">{rightProto.abbreviation}</div>
							<div class="text-[11px] leading-relaxed text-t-secondary">{stat.right}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

</div>
