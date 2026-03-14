<script lang="ts">
	let {
		open = false,
		src,
		alt,
		caption,
		credit,
		color,
		title,
		onclose
	}: {
		open?: boolean;
		src: string;
		alt: string;
		caption?: string;
		credit?: string;
		color: string;
		title?: string;
		onclose?: () => void;
	} = $props();

	let imgLoaded = $state(false);
	let imgFailed = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.stopImmediatePropagation();
			onclose?.();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose?.();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-8"
		role="dialog"
		aria-modal="true"
		aria-label="Expanded story image"
		tabindex="-1"
		onclick={handleBackdropClick}
	>
		<!-- Backdrop -->
		<div class="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-md"></div>

		<!-- Modal card -->
		<div
			class="modal-card relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-deep shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/5 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="h-2 w-2 rounded-full" style="background-color: {color}"></div>
					<h3 class="text-sm font-semibold text-slate-200">
						{title ?? 'Image'}
					</h3>
				</div>
				<button
					class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
					onclick={onclose}
					aria-label="Close"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Image content -->
			<div
				class="custom-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-6"
			>
				{#if imgFailed}
					<div class="flex h-24 items-center justify-center">
						<span class="text-xs text-slate-500">Image unavailable</span>
					</div>
				{:else}
					{#if !imgLoaded}
						<div class="flex h-24 items-center justify-center">
							<span class="text-xs text-slate-600">Loading image...</span>
						</div>
					{/if}
					<img
						{src}
						{alt}
						class="max-h-[75vh] max-w-full rounded-lg object-contain"
						class:hidden={!imgLoaded}
						onload={() => (imgLoaded = true)}
						onerror={() => (imgFailed = true)}
					/>
				{/if}
			</div>

			<!-- Footer with caption -->
			{#if caption || credit}
				<div class="border-t border-white/5 px-6 py-3 text-center">
					{#if caption}
						<p class="text-xs text-slate-500">{caption}</p>
					{/if}
					{#if credit}
						<p class="mt-0.5 text-[10px] text-slate-600">{credit}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-card {
		animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: scale(0.92) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
