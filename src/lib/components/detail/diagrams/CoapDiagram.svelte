<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="coap-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="coap-arrow-back" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
		<marker id="coap-arrow-notify" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.7" />
		</marker>
	</defs>

	<!-- Top section: Basic CoAP Request/Response -->
	<text x="200" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		CoAP: Lightweight REST over UDP
	</text>

	<!-- Sensor device (left) -->
	<rect x="15" y="28" width="75" height="40" rx="4" fill="#334155" stroke={color} stroke-width="0.5" />
	<text x="52" y="44" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Sensor
	</text>
	<text x="52" y="56" font-size="6" fill="#64748b" text-anchor="middle">8-bit MCU, 10KB RAM</text>
	<text x="52" y="64" font-size="6" fill="#64748b" text-anchor="middle">constrained device</text>

	<!-- CoAP GET request -->
	<line x1="92" y1="42" x2="228" y2="42" stroke={color} stroke-width="1.5" marker-end="url(#coap-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
	</line>
	<text x="160" y="37" font-size="8" fill="#94a3b8" text-anchor="middle">
		GET /temperature
	</text>

	<!-- Tiny header callout -->
	<rect x="130" y="46" width="60" height="14" rx="2" fill={color} opacity="0.1" />
	<text x="160" y="56" font-size="6" fill={color} text-anchor="middle" font-weight="600">
		4-byte header!
	</text>

	<!-- Server (right) -->
	<rect x="230" y="28" width="75" height="40" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="267" y="44" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Server
	</text>
	<text x="267" y="56" font-size="6" fill="#64748b" text-anchor="middle">CoAP endpoint</text>

	<!-- Response -->
	<line x1="228" y1="62" x2="92" y2="62" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 2" marker-end="url(#coap-arrow-back)" />
	<text x="160" y="75" font-size="7" fill="#94a3b8" text-anchor="middle">
		2.05 Content: 23.5C
	</text>

	<!-- HTTP comparison -->
	<rect x="320" y="28" width="72" height="50" rx="4" fill="#334155" opacity="0.5" stroke="#64748b" stroke-width="0.5" />
	<text x="356" y="42" font-size="7" fill="#64748b" text-anchor="middle">HTTP header</text>
	<text x="356" y="52" font-size="6" fill="#64748b" text-anchor="middle">~800 bytes</text>
	<text x="356" y="62" font-size="7" fill="#64748b" text-anchor="middle">vs CoAP</text>
	<text x="356" y="72" font-size="6" fill={color} text-anchor="middle" font-weight="600">~4 bytes</text>

	<!-- Divider -->
	<line x1="10" y1="90" x2="390" y2="90" stroke="#334155" stroke-width="0.5" stroke-dasharray="4 3" />

	<!-- Bottom section: Observe Pattern -->
	<text x="200" y="106" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Observe Pattern (pub/sub for IoT)
	</text>

	<!-- Sensor device -->
	<rect x="15" y="115" width="75" height="30" rx="4" fill="#334155" stroke={color} stroke-width="0.5" />
	<text x="52" y="134" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Client
	</text>

	<!-- Server -->
	<rect x="310" y="115" width="75" height="30" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="347" y="134" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Sensor
	</text>

	<!-- Observe registration -->
	<line x1="92" y1="125" x2="303" y2="125" stroke={color} stroke-width="1.5" marker-end="url(#coap-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
	</line>
	<text x="200" y="120" font-size="8" fill={color} text-anchor="middle" font-weight="600">
		GET /temp + Observe: 0
	</text>
	<text x="200" y="136" font-size="7" fill="#64748b" text-anchor="middle" font-style="italic">
		"Subscribe to changes"
	</text>

	<!-- Notification 1 -->
	<line x1="308" y1="152" x2="92" y2="152" stroke={color} stroke-width="1" opacity="0.7" marker-end="url(#coap-arrow-notify)">
		<animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="149" font-size="7" fill="#94a3b8" text-anchor="middle">
		2.05 Content: 23.5C (seq: 1)
	</text>

	<!-- Notification 2 -->
	<line x1="308" y1="168" x2="92" y2="168" stroke={color} stroke-width="1" opacity="0.7" marker-end="url(#coap-arrow-notify)">
		<animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2s" begin="0.6s" repeatCount="indefinite" />
	</line>
	<text x="200" y="165" font-size="7" fill="#94a3b8" text-anchor="middle">
		2.05 Content: 24.1C (seq: 2)
	</text>

	<!-- Notification 3 -->
	<line x1="308" y1="184" x2="92" y2="184" stroke={color} stroke-width="1" opacity="0.7" marker-end="url(#coap-arrow-notify)">
		<animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="2s" begin="1.2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="181" font-size="7" fill="#94a3b8" text-anchor="middle">
		2.05 Content: 24.8C (seq: 3)
	</text>

	<!-- "On change" label -->
	<text x="347" y="168" font-size="7" fill={color} text-anchor="middle" font-style="italic">
		pushes on
	</text>
	<text x="347" y="178" font-size="7" fill={color} text-anchor="middle" font-style="italic">
		each change
	</text>

	<!-- No polling label -->
	<rect x="15" y="155" width="60" height="18" rx="3" fill={color} opacity="0.08" />
	<text x="45" y="167" font-size="6" fill={color} text-anchor="middle" font-weight="600">
		No polling!
	</text>

	<!-- Bottom label -->
	<text x="200" y="215" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		REST for constrained devices — observe pattern
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
