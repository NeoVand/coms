<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="h3-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="h3-arrow-blocked" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#ef4444" />
		</marker>
	</defs>

	<!-- Section headers -->
	<text x="105" y="16" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">
		HTTP/2 (TCP)
	</text>
	<text x="305" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		HTTP/3 (QUIC)
	</text>

	<!-- Divider -->
	<line x1="200" y1="8" x2="200" y2="195" stroke="#334155" stroke-width="1" stroke-dasharray="4 3" />

	<!-- === LEFT: HTTP/2 — shared TCP connection === -->
	<!-- Single TCP pipe -->
	<rect x="20" y="28" width="170" height="120" rx="4" fill="#334155" opacity="0.3" stroke="#334155" stroke-width="1" />
	<text x="105" y="42" font-size="8" fill="#94a3b8" text-anchor="middle">Single TCP Connection</text>

	<!-- Stream 1 -->
	<rect x="30" y="50" width="150" height="14" rx="2" fill={color} opacity="0.15" />
	<text x="40" y="60" font-size="8" fill="#94a3b8">Stream 1</text>
	<line x1="90" y1="57" x2="170" y2="57" stroke={color} stroke-width="1.5" marker-end="url(#h3-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- Stream 2 — packet loss, blocks everything -->
	<rect x="30" y="70" width="150" height="14" rx="2" fill="#ef4444" opacity="0.1" />
	<text x="40" y="80" font-size="8" fill="#94a3b8">Stream 2</text>
	<line x1="90" y1="77" x2="120" y2="77" stroke="#ef4444" stroke-width="1.5" />
	<text x="128" y="80" font-size="12" fill="#ef4444" font-weight="700">X</text>
	<text x="155" y="80" font-size="7" fill="#ef4444">LOST</text>

	<!-- Stream 3 -->
	<rect x="30" y="90" width="150" height="14" rx="2" fill={color} opacity="0.15" />
	<text x="40" y="100" font-size="8" fill="#94a3b8">Stream 3</text>

	<!-- Blocked indicators -->
	<text x="105" y="118" font-size="9" fill="#ef4444" text-anchor="middle" font-weight="600">
		ALL STREAMS BLOCKED
	</text>
	<line x1="30" y1="122" x2="180" y2="122" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.6" />

	<!-- Waiting arrows -->
	<text x="60" y="138" font-size="7" fill="#ef4444" opacity="0.7">⏸ Waiting...</text>
	<text x="120" y="138" font-size="7" fill="#ef4444" opacity="0.7">⏸ Waiting...</text>

	<!-- === RIGHT: HTTP/3 — independent QUIC streams === -->
	<!-- Stream 1 -->
	<rect x="215" y="28" width="170" height="30" rx="4" fill={color} opacity="0.08" stroke={color} stroke-width="0.5" />
	<text x="225" y="42" font-size="8" fill="#94a3b8">Stream 1</text>
	<line x1="280" y1="42" x2="370" y2="42" stroke={color} stroke-width="1.5" marker-end="url(#h3-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="375" y="45" font-size="7" fill={color}>OK</text>

	<!-- Stream 2 — packet loss, only this stream affected -->
	<rect x="215" y="64" width="170" height="30" rx="4" fill="#ef4444" opacity="0.08" stroke="#ef4444" stroke-width="0.5" />
	<text x="225" y="78" font-size="8" fill="#94a3b8">Stream 2</text>
	<line x1="280" y1="78" x2="330" y2="78" stroke="#ef4444" stroke-width="1.5" />
	<text x="338" y="82" font-size="12" fill="#ef4444" font-weight="700">X</text>
	<text x="360" y="80" font-size="7" fill="#ef4444">retransmit</text>

	<!-- Stream 3 — unaffected -->
	<rect x="215" y="100" width="170" height="30" rx="4" fill={color} opacity="0.08" stroke={color} stroke-width="0.5" />
	<text x="225" y="114" font-size="8" fill="#94a3b8">Stream 3</text>
	<line x1="280" y1="114" x2="370" y2="114" stroke={color} stroke-width="1.5" marker-end="url(#h3-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
	</line>
	<text x="375" y="117" font-size="7" fill={color}>OK</text>

	<!-- Right side label -->
	<text x="300" y="148" font-size="9" fill={color} text-anchor="middle" font-weight="600">
		Only Stream 2 affected
	</text>

	<!-- Independent streams note -->
	<rect x="220" y="155" width="160" height="18" rx="3" fill={color} opacity="0.08" />
	<text x="300" y="167" font-size="8" fill="#94a3b8" text-anchor="middle">
		Each stream = independent QUIC path
	</text>

	<!-- Bottom label -->
	<text x="200" y="210" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		No head-of-line blocking — streams are independent
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
