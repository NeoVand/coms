<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import AppShell from '$lib/components/AppShell.svelte';
	import { allProtocols } from '$lib/data';

	let { children } = $props();

	// Live protocol count for og/twitter description so we never ship a
	// stale number after adding a new protocol page.
	const protocolCount = allProtocols.length;
	const description = `An interactive atlas of ${protocolCount} network protocols — from the foundational TCP handshake to modern QUIC streams.`;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Protocol Lab — Interactive Communication Protocols Explorer</title>
	<meta
		name="description"
		content="Explore and learn about communication protocols through an interactive visualization. TCP, UDP, HTTP, WebSockets, gRPC, and more."
	/>
	<meta property="og:title" content="Protocol Lab" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{base}/og-image.png" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Protocol Lab" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{base}/og-image.png" />
</svelte:head>

<!--
  AppShell owns the persistent canvas + side panel. Pages mounted under
  this layout reach AppState through context (set by AppShell on init)
  and use it to drive selection from the URL.
-->
<AppShell>
	{@render children()}
</AppShell>
