<script lang="ts">
	import { ArrowLeft, ArrowRight, X } from 'lucide-svelte';
	import { navHistory } from '$lib/state/history.svelte';
	import { navigateToHub } from '$lib/utils/navigation';

	const canBack = $derived(navHistory.canBack);
	const canForward = $derived(navHistory.canForward);
</script>

<div class="panel-chrome">
	<div class="flex items-center gap-1">
		<button
			type="button"
			class="chrome-btn back"
			disabled={!canBack}
			onclick={() => navHistory.back()}
			aria-label="Back"
			title="Back"
		>
			<ArrowLeft size={15} strokeWidth={2} />
		</button>
		<button
			type="button"
			class="chrome-btn forward"
			disabled={!canForward}
			onclick={() => navHistory.forward()}
			aria-label="Forward"
			title="Forward"
		>
			<ArrowRight size={15} strokeWidth={2} />
		</button>
	</div>

	<button
		type="button"
		class="chrome-btn close"
		onclick={() => navigateToHub()}
		aria-label="Close panel"
		title="Close"
	>
		<X size={15} strokeWidth={2} />
	</button>
</div>

<style>
	.panel-chrome {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		height: 2.5rem;
		flex-shrink: 0;
		background: var(--theme-bg);
		border-bottom: 1px solid var(--theme-glass-border);
	}

	.chrome-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 1.75rem;
		width: 1.75rem;
		border-radius: 0.5rem;
		color: var(--theme-text-muted);
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			opacity 0.15s ease;
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	.chrome-btn:hover:not(:disabled) {
		background: var(--theme-glass-bg-hover);
		color: var(--theme-text-primary);
	}

	.chrome-btn:focus-visible {
		outline: 2px solid var(--theme-text-secondary);
		outline-offset: 1px;
	}

	.chrome-btn:disabled {
		opacity: 0.32;
		cursor: not-allowed;
	}

	/* Subtle hover personality — chevrons nudge, X rotates. */
	.chrome-btn :global(svg) {
		transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.chrome-btn.back:hover:not(:disabled) :global(svg) {
		transform: translateX(-2px);
	}
	.chrome-btn.forward:hover:not(:disabled) :global(svg) {
		transform: translateX(2px);
	}
	.chrome-btn.close:hover :global(svg) {
		transform: rotate(90deg);
	}
</style>
