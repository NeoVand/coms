<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="dhcp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="dhcp-arrow-back" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.7" />
		</marker>
	</defs>

	<!-- Device (no IP) -->
	<rect x="20" y="15" width="60" height="38" rx="5" fill="#334155" />
	<text x="50" y="30" font-size="9" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Device
	</text>
	<text x="50" y="42" font-size="7" fill="#64748b" text-anchor="middle">IP: ???</text>
	<text x="50" y="50" font-size="6" fill="#64748b" text-anchor="middle">(new)</text>

	<!-- DHCP Server -->
	<rect x="310" y="15" width="70" height="38" rx="5" fill="#334155" />
	<text x="345" y="30" font-size="9" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		DHCP
	</text>
	<text x="345" y="42" font-size="7" fill="#64748b" text-anchor="middle">Server</text>
	<text x="345" y="50" font-size="6" fill="#64748b" text-anchor="middle">192.168.1.1</text>

	<!-- Network cloud in the middle -->
	<ellipse cx="200" y="35" rx="40" ry="15" fill="#334155" opacity="0.3" />
	<text x="200" y="38" font-size="7" fill="#64748b" text-anchor="middle">LAN</text>

	<!-- DORA labels on the left -->
	<text x="12" y="76" font-size="10" font-weight="700" fill={color} text-anchor="start">D</text>
	<text
		x="12"
		y="108"
		font-size="10"
		font-weight="700"
		fill={color}
		opacity="0.85"
		text-anchor="start">O</text
	>
	<text
		x="12"
		y="140"
		font-size="10"
		font-weight="700"
		fill={color}
		opacity="0.7"
		text-anchor="start">R</text
	>
	<text
		x="12"
		y="172"
		font-size="10"
		font-weight="700"
		fill={color}
		opacity="0.55"
		text-anchor="start">A</text
	>

	<!-- Step 1: DISCOVER (broadcast) -->
	<!-- Broadcast fan-out lines -->
	<line x1="80" y1="72" x2="170" y2="65" stroke={color} stroke-width="1" opacity="0.3" />
	<line x1="80" y1="72" x2="170" y2="72" stroke={color} stroke-width="1.5" opacity="0.5" />
	<line x1="80" y1="72" x2="170" y2="79" stroke={color} stroke-width="1" opacity="0.3" />
	<!-- Main arrow -->
	<line
		x1="170"
		y1="72"
		x2="305"
		y2="72"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#dhcp-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
	</line>
	<rect x="120" y="60" width="90" height="14" rx="2" fill="#334155" />
	<text x="165" y="70" font-size="8" font-family="monospace" fill={color} text-anchor="middle">
		DHCPDISCOVER
	</text>
	<!-- Broadcast badge -->
	<rect x="240" y="60" width="50" height="12" rx="2" fill={color} opacity="0.15" />
	<text x="265" y="69" font-size="6" fill={color} text-anchor="middle">broadcast</text>

	<!-- Step 2: OFFER (unicast back) -->
	<line
		x1="310"
		y1="104"
		x2="85"
		y2="104"
		stroke={color}
		stroke-width="1.5"
		opacity="0.85"
		marker-end="url(#dhcp-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="4s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="130" y="92" width="140" height="14" rx="2" fill="#334155" />
	<text x="200" y="102" font-size="8" font-family="monospace" fill="#94a3b8" text-anchor="middle">
		DHCPOFFER 192.168.1.42
	</text>
	<!-- Offer details -->
	<text x="345" y="96" font-size="6" fill="#64748b" text-anchor="middle"> lease: 24h </text>

	<!-- Step 3: REQUEST (broadcast) -->
	<line x1="80" y1="136" x2="170" y2="129" stroke={color} stroke-width="1" opacity="0.2" />
	<line x1="80" y1="136" x2="170" y2="136" stroke={color} stroke-width="1.5" opacity="0.4" />
	<line x1="80" y1="136" x2="170" y2="143" stroke={color} stroke-width="1" opacity="0.2" />
	<line
		x1="170"
		y1="136"
		x2="305"
		y2="136"
		stroke={color}
		stroke-width="1.5"
		opacity="0.7"
		marker-end="url(#dhcp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="4s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="118" y="124" width="140" height="14" rx="2" fill="#334155" />
	<text x="188" y="134" font-size="8" font-family="monospace" fill={color} text-anchor="middle">
		DHCPREQUEST 192.168.1.42
	</text>
	<rect x="274" y="124" width="50" height="12" rx="2" fill={color} opacity="0.1" />
	<text x="299" y="133" font-size="6" fill={color} text-anchor="middle">broadcast</text>

	<!-- Step 4: ACK -->
	<line
		x1="310"
		y1="168"
		x2="85"
		y2="168"
		stroke={color}
		stroke-width="1.5"
		opacity="0.7"
		marker-end="url(#dhcp-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="4s"
			begin="1.5s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="155" y="156" width="90" height="14" rx="2" fill="#334155" />
	<text x="200" y="166" font-size="8" font-family="monospace" fill="#94a3b8" text-anchor="middle">
		DHCPACK ✓
	</text>

	<!-- Result: Device now has IP -->
	<rect x="28" y="182" width="85" height="28" rx="5" fill="#334155" stroke={color} stroke-width="1">
		<animate
			attributeName="stroke-opacity"
			values="0.3;1;0.3"
			dur="2s"
			begin="2s"
			repeatCount="indefinite"
		/>
	</rect>
	<text x="70" y="194" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Device
	</text>
	<text x="70" y="205" font-size="7" font-family="monospace" fill={color} text-anchor="middle">
		192.168.1.42
	</text>

	<!-- Config details -->
	<text x="160" y="190" font-size="7" fill="#64748b" text-anchor="start">
		gateway: 192.168.1.1
	</text>
	<text x="160" y="200" font-size="7" fill="#64748b" text-anchor="start">dns: 8.8.8.8</text>
	<text x="160" y="210" font-size="7" fill="#64748b" text-anchor="start">
		mask: 255.255.255.0
	</text>

	<!-- Separator -->
	<line
		x1="20"
		y1="218"
		x2="380"
		y2="218"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="235" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		DORA — plug in and get an IP address automatically
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
