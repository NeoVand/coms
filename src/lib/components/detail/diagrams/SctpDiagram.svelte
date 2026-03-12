<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="sctp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="sctp-arrow-ok" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#22c55e" />
		</marker>
	</defs>

	<!-- Top half: Multi-streaming -->
	<text x="200" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Multi-streaming
	</text>

	<!-- Endpoint A -->
	<rect
		x="15"
		y="26"
		width="60"
		height="80"
		rx="4"
		fill="#334155"
		stroke="#94a3b8"
		stroke-width="0.5"
	/>
	<text x="45" y="42" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600"
		>Host A</text
	>

	<!-- Endpoint B -->
	<rect
		x="325"
		y="26"
		width="60"
		height="80"
		rx="4"
		fill="#334155"
		stroke="#94a3b8"
		stroke-width="0.5"
	/>
	<text x="355" y="42" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600"
		>Host B</text
	>

	<!-- Stream 1 — flowing -->
	<line
		x1="77"
		y1="45"
		x2="318"
		y2="45"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sctp-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="41" font-size="8" fill="#94a3b8" text-anchor="middle">Stream 1 (control)</text>

	<!-- Stream 2 — blocked -->
	<line x1="77" y1="68" x2="180" y2="68" stroke="#ef4444" stroke-width="1.5" />
	<text x="192" y="72" font-size="11" fill="#ef4444" font-weight="700">X</text>
	<text x="200" y="64" font-size="8" fill="#94a3b8" text-anchor="middle">Stream 2 (data)</text>
	<text x="230" y="74" font-size="7" fill="#ef4444">blocked</text>

	<!-- Stream 3 — still flowing -->
	<line
		x1="77"
		y1="91"
		x2="318"
		y2="91"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sctp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="2s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="87" font-size="8" fill="#94a3b8" text-anchor="middle">Stream 3 (voice)</text>

	<!-- "Not affected" labels -->
	<text x="280" y="50" font-size="7" fill={color}>unaffected</text>
	<text x="280" y="96" font-size="7" fill={color}>unaffected</text>

	<!-- Divider -->
	<line
		x1="10"
		y1="118"
		x2="390"
		y2="118"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Bottom half: Multi-homing -->
	<text x="200" y="134" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Multi-homing
	</text>

	<!-- Host with 2 IPs -->
	<rect
		x="15"
		y="142"
		width="80"
		height="55"
		rx="4"
		fill="#334155"
		stroke="#94a3b8"
		stroke-width="0.5"
	/>
	<text x="55" y="158" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600"
		>Host A</text
	>
	<text x="55" y="172" font-size="7" fill="#94a3b8" text-anchor="middle">IP: 10.0.0.1</text>
	<text x="55" y="184" font-size="7" fill="#94a3b8" text-anchor="middle">IP: 10.0.0.2</text>

	<!-- Remote host -->
	<rect
		x="305"
		y="142"
		width="80"
		height="55"
		rx="4"
		fill="#334155"
		stroke="#94a3b8"
		stroke-width="0.5"
	/>
	<text x="345" y="158" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600"
		>Host B</text
	>
	<text x="345" y="172" font-size="7" fill="#94a3b8" text-anchor="middle">IP: 10.1.0.1</text>
	<text x="345" y="184" font-size="7" fill="#94a3b8" text-anchor="middle">IP: 10.1.0.2</text>

	<!-- Primary path -->
	<line
		x1="97"
		y1="163"
		x2="298"
		y2="163"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sctp-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="158" font-size="8" fill={color} text-anchor="middle" font-weight="600">
		Primary Path
	</text>

	<!-- Primary path fails -->
	<text x="200" y="172" font-size="9" fill="#ef4444" text-anchor="middle" font-weight="700">
		X — link fails
	</text>

	<!-- Failover path -->
	<line
		x1="97"
		y1="185"
		x2="298"
		y2="185"
		stroke="#22c55e"
		stroke-width="1.5"
		stroke-dasharray="5 3"
		marker-end="url(#sctp-arrow-ok)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="2s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="195" font-size="8" fill="#22c55e" text-anchor="middle" font-weight="600">
		Failover Path (automatic)
	</text>

	<!-- Bottom label -->
	<text x="200" y="225" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Multi-streaming + multi-homing — built-in redundancy
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
