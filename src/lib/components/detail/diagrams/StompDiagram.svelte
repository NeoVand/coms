<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="stomp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker
			id="stomp-arrow-back"
			markerWidth="10"
			markerHeight="8"
			refX="10"
			refY="4"
			orient="auto"
		>
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.7" />
		</marker>
	</defs>

	<!-- Client and Server labels -->
	<text x="55" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Client
	</text>
	<text x="345" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Server
	</text>

	<!-- Vertical lifelines -->
	<line x1="55" y1="25" x2="55" y2="210" stroke="#334155" stroke-width="1.5" />
	<line x1="345" y1="25" x2="345" y2="210" stroke="#334155" stroke-width="1.5" />

	<!-- CONNECT frame -->
	<line x1="55" y1="42" x2="335" y2="42" stroke={color} stroke-width="1.5" marker-end="url(#stomp-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
	</line>
	<rect x="120" y="30" width="100" height="16" rx="3" fill="#334155" />
	<text x="170" y="41" font-size="9" font-family="monospace" fill={color} text-anchor="middle">
		CONNECT\n
	</text>

	<!-- CONNECTED response -->
	<line
		x1="345"
		y1="62"
		x2="65"
		y2="62"
		stroke={color}
		stroke-width="1.5"
		opacity="0.7"
		marker-end="url(#stomp-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="4s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="120" y="51" width="100" height="16" rx="3" fill="#334155" />
	<text x="170" y="62" font-size="9" font-family="monospace" fill="#94a3b8" text-anchor="middle">
		CONNECTED
	</text>

	<!-- SUBSCRIBE frame -->
	<line
		x1="55"
		y1="88"
		x2="335"
		y2="88"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#stomp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="4s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="95" y="76" width="155" height="16" rx="3" fill="#334155" />
	<text x="172" y="87" font-size="9" font-family="monospace" fill={color} text-anchor="middle">
		SUBSCRIBE /queue/orders
	</text>

	<!-- SEND frame with body -->
	<line
		x1="55"
		y1="118"
		x2="335"
		y2="118"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#stomp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="4s"
			begin="1.5s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="100" y="104" width="145" height="28" rx="3" fill="#334155" />
	<text x="172" y="115" font-size="9" font-family="monospace" fill={color} text-anchor="middle">
		SEND /queue/orders
	</text>
	<text
		x="172"
		y="127"
		font-size="8"
		font-family="monospace"
		fill="#64748b"
		text-anchor="middle"
	>
		body: {`{"item":"widget"}`}
	</text>

	<!-- MESSAGE delivery -->
	<line
		x1="345"
		y1="150"
		x2="65"
		y2="150"
		stroke={color}
		stroke-width="1.5"
		opacity="0.8"
		marker-end="url(#stomp-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="4s"
			begin="2s"
			repeatCount="indefinite"
		/>
	</line>
	<rect x="100" y="137" width="145" height="28" rx="3" fill="#334155" />
	<text x="172" y="148" font-size="9" font-family="monospace" fill={color} text-anchor="middle">
		MESSAGE /queue/orders
	</text>
	<text
		x="172"
		y="160"
		font-size="8"
		font-family="monospace"
		fill="#64748b"
		text-anchor="middle"
	>
		body: {`{"item":"widget"}`}
	</text>

	<!-- Subscriber indicator -->
	<text x="55" y="178" font-size="8" fill="#64748b" text-anchor="middle">subscriber</text>

	<!-- Dashed separator -->
	<line
		x1="20"
		y1="190"
		x2="380"
		y2="190"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="207" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Human-readable text frames — the HTTP of messaging
	</text>

	<!-- Text protocol hint -->
	<text x="200" y="222" font-size="8" fill="#334155" text-anchor="middle">
		COMMAND\nheader:value\n\nbody^@
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
