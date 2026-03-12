<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Client and Server labels -->
	<text x="60" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Client
	</text>
	<text x="340" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Server
	</text>

	<!-- HTTP Upgrade handshake -->
	<rect
		x="40"
		y="26"
		width="320"
		height="52"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="4 3"
	/>
	<text x="200" y="24" font-size="8" fill="#64748b" text-anchor="middle">
		<tspan dx="-30">HTTP Upgrade</tspan>
	</text>

	<!-- Upgrade request -->
	<line x1="60" y1="42" x2="340" y2="42" stroke="#94a3b8" stroke-width="1.5" />
	<polygon points="340,42 330,37 330,47" fill="#94a3b8" />
	<text x="200" y="38" font-size="9" fill="#94a3b8" text-anchor="middle">
		Upgrade: websocket
	</text>

	<!-- 101 Switching -->
	<line x1="340" y1="62" x2="60" y2="62" stroke="#94a3b8" stroke-width="1.5" />
	<polygon points="60,62 70,57 70,67" fill="#94a3b8" />
	<text x="200" y="58" font-size="9" fill="#94a3b8" text-anchor="middle">
		101 Switching Protocols
	</text>

	<!-- Persistent connection pipe -->
	<rect
		x="50"
		y="90"
		width="300"
		height="80"
		rx="10"
		fill={color}
		fill-opacity="0.06"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.4"
	/>
	<text x="200" y="88" font-size="9" fill={color} text-anchor="middle" opacity="0.7">
		Persistent Full-Duplex Connection
	</text>

	<!-- Bidirectional arrows going right -->
	<g>
		<line x1="60" y1="115" x2="340" y2="115" stroke={color} stroke-width="1.5" opacity="0.7" />
		<polygon points="340,115 330,110 330,120" fill={color} opacity="0.7" />
		<circle cx="0" cy="115" r="3" fill={color} opacity="0.9">
			<animate attributeName="cx" values="60;340" dur="2s" repeatCount="indefinite" />
			<animate attributeName="opacity" values="0.9;0.3" dur="2s" repeatCount="indefinite" />
		</circle>
	</g>

	<!-- Bidirectional arrows going left -->
	<g>
		<line x1="340" y1="140" x2="60" y2="140" stroke={color} stroke-width="1.5" opacity="0.5" />
		<polygon points="60,140 70,135 70,145" fill={color} opacity="0.5" />
		<circle cx="0" cy="140" r="3" fill={color} opacity="0.9">
			<animate
				attributeName="cx"
				values="340;60"
				dur="1.8s"
				begin="0.4s"
				repeatCount="indefinite"
			/>
			<animate
				attributeName="opacity"
				values="0.9;0.3"
				dur="1.8s"
				begin="0.4s"
				repeatCount="indefinite"
			/>
		</circle>
	</g>

	<!-- Message labels -->
	<text x="200" y="110" font-size="8" fill="#94a3b8" text-anchor="middle">messages</text>
	<text x="200" y="155" font-size="8" fill="#94a3b8" text-anchor="middle">messages</text>

	<text x="200" y="200" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Low-latency bidirectional communication
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
