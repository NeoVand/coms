<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="quic-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="quic-arrow-muted" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#64748b" />
		</marker>
	</defs>

	<!-- Section labels -->
	<text x="100" y="16" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">
		TCP + TLS (3 RTT)
	</text>
	<text x="305" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		QUIC (1 RTT)
	</text>

	<!-- Divider -->
	<line x1="200" y1="8" x2="200" y2="175" stroke="#334155" stroke-width="1" stroke-dasharray="4 3" />

	<!-- === LEFT: TCP + TLS === -->
	<!-- Client / Server lifelines -->
	<text x="35" y="32" font-size="9" fill="#94a3b8" text-anchor="middle">Client</text>
	<text x="165" y="32" font-size="9" fill="#94a3b8" text-anchor="middle">Server</text>
	<line x1="35" y1="36" x2="35" y2="170" stroke="#334155" stroke-width="1" />
	<line x1="165" y1="36" x2="165" y2="170" stroke="#334155" stroke-width="1" />

	<!-- TCP SYN -->
	<line x1="35" y1="48" x2="158" y2="56" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="45" font-size="7" fill="#64748b" text-anchor="middle">SYN</text>

	<!-- TCP SYN-ACK -->
	<line x1="165" y1="62" x2="42" y2="70" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="68" font-size="7" fill="#64748b" text-anchor="middle">SYN-ACK</text>

	<!-- TCP ACK -->
	<line x1="35" y1="78" x2="158" y2="86" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="83" font-size="7" fill="#64748b" text-anchor="middle">ACK</text>

	<!-- RTT 1 label -->
	<text x="180" y="68" font-size="7" fill="#64748b" text-anchor="start">RTT 1</text>

	<!-- TLS ClientHello -->
	<line x1="35" y1="96" x2="158" y2="104" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="93" font-size="7" fill="#64748b" text-anchor="middle">ClientHello</text>

	<!-- TLS ServerHello -->
	<line x1="165" y1="110" x2="42" y2="118" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="115" font-size="7" fill="#64748b" text-anchor="middle">ServerHello</text>

	<!-- RTT 2 label -->
	<text x="180" y="108" font-size="7" fill="#64748b" text-anchor="start">RTT 2</text>

	<!-- TLS Finished -->
	<line x1="35" y1="126" x2="158" y2="134" stroke="#64748b" stroke-width="1" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="131" font-size="7" fill="#64748b" text-anchor="middle">Finished</text>

	<!-- RTT 3 label -->
	<text x="180" y="134" font-size="7" fill="#64748b" text-anchor="start">RTT 3</text>

	<!-- Data -->
	<line x1="35" y1="148" x2="158" y2="156" stroke="#64748b" stroke-width="1" stroke-dasharray="4 2" marker-end="url(#quic-arrow-muted)" />
	<text x="100" y="153" font-size="7" fill="#64748b" text-anchor="middle">Data</text>

	<!-- === RIGHT: QUIC === -->
	<text x="240" y="32" font-size="9" fill="#94a3b8" text-anchor="middle">Client</text>
	<text x="370" y="32" font-size="9" fill="#94a3b8" text-anchor="middle">Server</text>
	<line x1="240" y1="36" x2="240" y2="170" stroke="#334155" stroke-width="1" />
	<line x1="370" y1="36" x2="370" y2="170" stroke="#334155" stroke-width="1" />

	<!-- QUIC Initial (transport + TLS combined) -->
	<line x1="240" y1="48" x2="363" y2="60" stroke={color} stroke-width="1.5" marker-end="url(#quic-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
	</line>
	<text x="305" y="45" font-size="8" fill="#94a3b8" text-anchor="middle">Initial + ClientHello</text>

	<!-- QUIC Response -->
	<line x1="370" y1="68" x2="247" y2="80" stroke={color} stroke-width="1.5" marker-end="url(#quic-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
	</line>
	<text x="305" y="73" font-size="8" fill="#94a3b8" text-anchor="middle">Handshake + ServerHello</text>

	<!-- 1 RTT label -->
	<rect x="380" y="48" width="16" height="30" rx="3" fill={color} opacity="0.15" />
	<text x="388" y="67" font-size="7" fill={color} text-anchor="middle" font-weight="600">
		1 RTT
	</text>

	<!-- Data immediately -->
	<line x1="240" y1="92" x2="363" y2="100" stroke={color} stroke-width="1.5" marker-end="url(#quic-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
	</line>
	<text x="305" y="96" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Data (encrypted!)
	</text>

	<!-- 0-RTT section -->
	<line x1="220" y1="118" x2="390" y2="118" stroke="#334155" stroke-width="0.5" stroke-dasharray="3 2" />
	<text x="305" y="132" font-size="8" fill={color} text-anchor="middle" font-weight="600">
		0-RTT (returning client)
	</text>

	<!-- 0-RTT arrow with data -->
	<line x1="240" y1="142" x2="363" y2="150" stroke={color} stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#quic-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="305" y="145" font-size="8" fill="#94a3b8" text-anchor="middle">
		Data sent immediately
	</text>
	<text x="305" y="166" font-size="8" fill="#94a3b8" text-anchor="middle" font-style="italic">
		(uses cached keys)
	</text>

	<!-- Bottom label -->
	<text x="200" y="195" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Combined transport + encryption in one round trip
	</text>

	<!-- Comparison highlight -->
	<text x="100" y="195" font-size="8" fill="#ef4444" text-anchor="middle" opacity="0.7">
		Slow
	</text>
	<text x="305" y="210" font-size="8" fill={color} text-anchor="middle" opacity="0.8">
		Fast
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
