<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="udp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="udp-arrow-lost" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#64748b" />
		</marker>
	</defs>

	<!-- Client and Server labels -->
	<text x="60" y="20" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Client
	</text>
	<text x="340" y="20" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Server
	</text>

	<!-- Vertical lifelines -->
	<line x1="60" y1="28" x2="60" y2="180" stroke="#334155" stroke-width="1.5" />
	<line x1="340" y1="28" x2="340" y2="180" stroke="#334155" stroke-width="1.5" />

	<!-- "No handshake" label -->
	<text x="200" y="38" font-size="9" fill="#64748b" text-anchor="middle" font-style="italic">
		No handshake needed
	</text>

	<!-- Datagram 1 -->
	<line
		x1="60"
		y1="55"
		x2="330"
		y2="60"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#udp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;1;0.5"
			dur="2.5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="50" font-size="10" fill="#94a3b8" text-anchor="middle">Datagram 1</text>

	<!-- Datagram 2 -->
	<line
		x1="60"
		y1="80"
		x2="330"
		y2="85"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#udp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;1;0.5"
			dur="2.5s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="75" font-size="10" fill="#94a3b8" text-anchor="middle">Datagram 2</text>

	<!-- Datagram 3 — lost -->
	<line
		x1="60"
		y1="105"
		x2="220"
		y2="110"
		stroke="#64748b"
		stroke-width="1.5"
		stroke-dasharray="5 3"
		opacity="0.5"
	/>
	<text x="235" y="108" font-size="14" fill="#ef4444" font-weight="700">?</text>
	<text x="200" y="100" font-size="10" fill="#64748b" text-anchor="middle">Datagram 3</text>
	<text x="280" y="120" font-size="8" fill="#ef4444" text-anchor="middle">might be lost</text>

	<!-- Datagram 4 -->
	<line
		x1="60"
		y1="135"
		x2="330"
		y2="140"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#udp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;1;0.5"
			dur="2.5s"
			begin="0.9s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="130" font-size="10" fill="#94a3b8" text-anchor="middle">Datagram 4</text>

	<!-- No ACK label -->
	<text x="340" y="165" font-size="8" fill="#64748b" text-anchor="middle">No ACKs sent</text>

	<!-- Bracket: connectionless -->
	<line x1="30" y1="50" x2="30" y2="148" stroke="#334155" stroke-width="1" />
	<line x1="30" y1="50" x2="36" y2="50" stroke="#334155" stroke-width="1" />
	<line x1="30" y1="148" x2="36" y2="148" stroke="#334155" stroke-width="1" />
	<text
		x="18"
		y="105"
		font-size="8"
		fill="#64748b"
		text-anchor="middle"
		transform="rotate(-90 18 105)"
	>
		Connectionless
	</text>

	<!-- Bottom label -->
	<text x="200" y="198" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Fire-and-forget — no connection, no guarantees
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
