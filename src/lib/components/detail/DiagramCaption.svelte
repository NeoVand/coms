<script lang="ts">
	let {
		caption,
		color,
		size = 'sm',
		align = 'center'
	}: {
		caption: string;
		color: string;
		size?: 'sm' | 'md';
		align?: 'center' | 'left';
	} = $props();

	type Segment = { type: 'text' | 'bold' | 'italic' | 'code'; text: string };

	const segments = $derived.by<Segment[]>(() => {
		// Order matters: longer delimiters first so **bold** doesn't get split as *italic*.
		const parts = caption.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
		return parts
			.filter((p) => p.length > 0)
			.map((p) => {
				if (p.startsWith('**') && p.endsWith('**')) {
					return { type: 'bold', text: p.slice(2, -2) };
				}
				if (p.startsWith('`') && p.endsWith('`')) {
					return { type: 'code', text: p.slice(1, -1) };
				}
				if (p.startsWith('*') && p.endsWith('*')) {
					return { type: 'italic', text: p.slice(1, -1) };
				}
				return { type: 'text', text: p };
			});
	});
</script>

<p
	class="diagram-caption mt-3 leading-relaxed text-t-secondary"
	class:text-xs={size === 'sm'}
	class:text-sm={size === 'md'}
	class:text-center={align === 'center'}
	class:text-left={align === 'left'}
>
	{#each segments as seg}
		{#if seg.type === 'bold'}
			<strong class="font-semibold" style="color: {color};">{seg.text}</strong>
		{:else if seg.type === 'italic'}
			<em class="italic">{seg.text}</em>
		{:else if seg.type === 'code'}
			<code class="rounded bg-s-glass px-1 py-px font-mono text-[0.92em] text-t-primary"
				>{seg.text}</code
			>
		{:else}
			{seg.text}
		{/if}
	{/each}
</p>

<style>
	.diagram-caption {
		max-width: 60ch;
		margin-left: auto;
		margin-right: auto;
	}
</style>
