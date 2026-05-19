<script lang="ts">
	import { base } from '$app/paths';
	import { getRfcByNumber } from '$lib/data/rfcs';

	interface Props {
		number: string;
		label: string;
		/** Inherited inline color (from the surrounding narrative). */
		color: string;
	}

	let { number, label, color }: Props = $props();

	const rfc = $derived(getRfcByNumber(number));
	/** Prefer the internal `/rfc/[number]` page once the registry is populated;
	 *  fall back to the IETF datatracker URL so the link always works. */
	const href = $derived(
		rfc ? `${base}/rfc/${rfc.number}` : `https://datatracker.ietf.org/doc/html/rfc${number}`
	);
	const isExternal = $derived(!rfc);
	const tooltip = $derived(rfc ? `${rfc.title} (${rfc.year})` : `Request for Comments ${number}`);
</script>

<a
	{href}
	target={isExternal ? '_blank' : undefined}
	rel={isExternal ? 'noopener noreferrer' : undefined}
	class="inline font-mono text-[0.92em] tracking-tight transition-colors hover:underline"
	style="color: {color}"
	title={tooltip}
	onclick={(e) => e.stopPropagation()}>{label}</a
>
