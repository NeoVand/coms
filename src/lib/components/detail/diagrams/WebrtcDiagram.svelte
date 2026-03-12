<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 230" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- STUN/TURN Server at top -->
	<rect
		x="145"
		y="10"
		width="110"
		height="40"
		rx="8"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="200" y="28" font-size="9" fill="#94a3b8" text-anchor="middle">STUN / TURN</text>
	<text x="200" y="40" font-size="9" fill="#94a3b8" text-anchor="middle">Server</text>

	<!-- Signaling label -->
	<text x="200" y="68" font-size="8" fill="#64748b" text-anchor="middle" font-style="italic">
		Signaling &amp; NAT Traversal
	</text>

	<!-- Dashed arrow: Peer A to STUN -->
	<line
		x1="80"
		y1="145"
		x2="158"
		y2="52"
		stroke={color}
		stroke-width="2"
		stroke-dasharray="5 3"
		opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;0.7;0.4"
			dur="3s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="158,52 150,54 154,62" fill={color} opacity="0.7" />

	<!-- Dashed arrow: Peer B to STUN -->
	<line
		x1="320"
		y1="145"
		x2="242"
		y2="52"
		stroke={color}
		stroke-width="2"
		stroke-dasharray="5 3"
		opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;0.7;0.4"
			dur="3s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="242,52 246,62 250,54" fill={color} opacity="0.7" />

	<!-- Dashed arrow: STUN to Peer A -->
	<line
		x1="152"
		y1="50"
		x2="75"
		y2="140"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3 3"
		opacity="0.4"
	/>
	<!-- Dashed arrow: STUN to Peer B -->
	<line
		x1="248"
		y1="50"
		x2="325"
		y2="140"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3 3"
		opacity="0.4"
	/>

	<!-- ICE candidates labels (horizontal, no rotation) -->
	<text x="100" y="95" font-size="7" fill="#64748b" text-anchor="middle">ICE candidates</text>
	<text x="300" y="95" font-size="7" fill="#64748b" text-anchor="middle">ICE candidates</text>

	<!-- Peer A -->
	<rect
		x="30"
		y="140"
		width="100"
		height="55"
		rx="10"
		fill={color}
		fill-opacity="0.06"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.5"
	/>
	<text x="80" y="162" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Peer A
	</text>
	<text x="80" y="180" font-size="8" fill="#64748b" text-anchor="middle"> (Browser) </text>

	<!-- Peer B -->
	<rect
		x="270"
		y="140"
		width="100"
		height="55"
		rx="10"
		fill={color}
		fill-opacity="0.06"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.5"
	/>
	<text x="320" y="162" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Peer B
	</text>
	<text x="320" y="180" font-size="8" fill="#64748b" text-anchor="middle"> (Browser) </text>

	<!-- Direct P2P connection -->
	<line x1="130" y1="170" x2="270" y2="170" stroke={color} stroke-width="2.5">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
	</line>

	<!-- Bidirectional arrows on P2P line -->
	<polygon points="268,170 258,165 258,175" fill={color} />
	<polygon points="132,170 142,165 142,175" fill={color} />

	<!-- Data packets moving -->
	<circle cx="0" cy="170" r="3.5" fill={color}>
		<animate attributeName="cx" values="140;260" dur="1.5s" repeatCount="indefinite" />
		<animate attributeName="opacity" values="1;0.3" dur="1.5s" repeatCount="indefinite" />
	</circle>
	<circle cx="0" cy="170" r="3.5" fill={color} opacity="0.7">
		<animate attributeName="cx" values="260;140" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
		<animate
			attributeName="opacity"
			values="0.7;0.2"
			dur="1.8s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</circle>

	<!-- P2P label -->
	<rect x="168" y="148" width="64" height="16" rx="4" fill={color} opacity="0.15" />
	<text x="200" y="160" font-size="8" fill={color} text-anchor="middle" font-weight="600">
		Direct P2P
	</text>

	<!-- Bottom label -->
	<text x="200" y="220" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Peer-to-peer media/data — server only assists connection setup
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
