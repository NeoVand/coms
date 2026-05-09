<script lang="ts">
	import { parseRichText } from '$lib/utils/text-parser';
	import RichText from './inline/RichText.svelte';

	let {
		caption,
		color,
		size = 'sm',
		align = 'center'
	}: {
		caption: string;
		color: string;
		size?: 'sm' | 'md' | 'lg';
		align?: 'center' | 'left';
	} = $props();

	const segments = $derived(parseRichText(caption));
</script>

<p
	class="diagram-caption leading-relaxed text-t-secondary"
	class:text-xs={size === 'sm'}
	class:text-sm={size === 'md'}
	class:cap-lg={size === 'lg'}
	class:text-center={align === 'center'}
	class:text-left={align === 'left'}
	style="--bold-color: {color};"
>
	<RichText {segments} {color} />
</p>

<style>
	.diagram-caption {
		max-width: 60ch;
		margin-left: auto;
		margin-right: auto;
	}

	/* Bold inside diagram captions used to inherit `color` so the
	 * highlights matched the protocol accent. Preserve that behaviour
	 * by overriding the shared RichText `<strong>` color in this scope. */
	.diagram-caption :global(strong) {
		color: var(--bold-color);
	}

	/* Larger caption for the expanded modal — readable from a distance. */
	.diagram-caption.cap-lg {
		font-size: 1.0625rem; /* 17px */
		line-height: 1.55;
		max-width: 78ch;
	}

	@media (max-width: 640px) {
		.diagram-caption.cap-lg {
			font-size: 0.9375rem; /* 15px on phones */
			line-height: 1.5;
		}
	}
</style>
