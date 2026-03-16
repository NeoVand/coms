<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta property="og:title" content="Protocol Lab" />
	<meta property="og:description" content="An interactive atlas of 46 network protocols — from the foundational TCP handshake to modern QUIC streams." />
	<meta property="og:image" content="/og-image.png" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Protocol Lab" />
	<meta name="twitter:description" content="An interactive atlas of 46 network protocols — from the foundational TCP handshake to modern QUIC streams." />
	<meta name="twitter:image" content="/og-image.png" />
</svelte:head>
{@render children()}
