<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="sip-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="sip-arrow-muted" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
		<marker id="sip-arrow-media" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.5" />
		</marker>
	</defs>

	<!-- Entity labels -->
	<text x="45" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Caller
	</text>
	<text x="200" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		SIP Proxy
	</text>
	<text x="355" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Callee
	</text>

	<!-- Entity icons -->
	<circle cx="45" cy="28" r="5" fill="#334155" />
	<rect x="200" y="22" width="0.5" height="1" fill="#334155" />
	<circle cx="355" cy="28" r="5" fill="#334155" />

	<!-- Vertical lifelines -->
	<line x1="45" y1="36" x2="45" y2="220" stroke="#334155" stroke-width="1.5" />
	<line x1="200" y1="36" x2="200" y2="220" stroke="#334155" stroke-width="1.5" />
	<line x1="355" y1="36" x2="355" y2="220" stroke="#334155" stroke-width="1.5" />

	<!-- REGISTER (Callee → Proxy) -->
	<line
		x1="355"
		y1="46"
		x2="210"
		y2="46"
		stroke="#94a3b8"
		stroke-width="1"
		stroke-dasharray="4 2"
		marker-end="url(#sip-arrow-muted)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.7;0.3"
			dur="5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="282" y="42" font-size="8" fill="#64748b" text-anchor="middle">REGISTER</text>

	<!-- INVITE (Caller → Proxy) -->
	<line
		x1="45"
		y1="64"
		x2="190"
		y2="64"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="5s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="118" y="60" font-size="9" fill={color} text-anchor="middle">INVITE</text>

	<!-- INVITE (Proxy → Callee) -->
	<line
		x1="200"
		y1="74"
		x2="345"
		y2="74"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="0.6s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="272" y="70" font-size="9" fill={color} text-anchor="middle">INVITE</text>

	<!-- 100 Trying (Proxy → Caller) -->
	<line
		x1="200"
		y1="86"
		x2="55"
		y2="86"
		stroke="#94a3b8"
		stroke-width="1"
		stroke-dasharray="4 2"
		marker-end="url(#sip-arrow-muted)"
	/>
	<text x="128" y="82" font-size="7" fill="#64748b" text-anchor="middle">100 Trying</text>

	<!-- 180 Ringing (Callee → Proxy → Caller) -->
	<line
		x1="355"
		y1="100"
		x2="210"
		y2="100"
		stroke={color}
		stroke-width="1.5"
		opacity="0.7"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="5s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="282" y="96" font-size="8" fill="#94a3b8" text-anchor="middle">180 Ringing</text>

	<line
		x1="200"
		y1="110"
		x2="55"
		y2="110"
		stroke={color}
		stroke-width="1.5"
		opacity="0.7"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="5s"
			begin="1.2s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="128" y="106" font-size="8" fill="#94a3b8" text-anchor="middle">180 Ringing</text>

	<!-- 200 OK (Callee → Proxy → Caller) -->
	<line
		x1="355"
		y1="126"
		x2="210"
		y2="126"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="1.5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="282" y="122" font-size="9" fill={color} text-anchor="middle">200 OK</text>

	<line
		x1="200"
		y1="136"
		x2="55"
		y2="136"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="1.7s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="128" y="132" font-size="9" fill={color} text-anchor="middle">200 OK</text>

	<!-- ACK (Caller → Callee direct) -->
	<line
		x1="45"
		y1="152"
		x2="345"
		y2="152"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#sip-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="2s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="148" font-size="9" fill={color} text-anchor="middle">ACK</text>

	<!-- RTP Media flow (bidirectional, direct peer-to-peer) -->
	<rect x="80" y="162" width="240" height="20" rx="4" fill={color} opacity="0.1" />
	<line
		x1="85"
		y1="170"
		x2="310"
		y2="170"
		stroke={color}
		stroke-width="2"
		stroke-dasharray="8 4"
		opacity="0.6"
	>
		<animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
	</line>
	<line
		x1="315"
		y1="174"
		x2="90"
		y2="174"
		stroke={color}
		stroke-width="2"
		stroke-dasharray="8 4"
		opacity="0.6"
	>
		<animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
	</line>
	<text x="200" y="194" font-size="8" fill={color} text-anchor="middle">
		RTP Media (peer-to-peer)
	</text>

	<!-- BYE -->
	<line
		x1="45"
		y1="205"
		x2="345"
		y2="205"
		stroke="#94a3b8"
		stroke-width="1"
		marker-end="url(#sip-arrow-muted)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.6;0.3"
			dur="5s"
			begin="3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="201" font-size="9" fill="#64748b" text-anchor="middle">BYE</text>

	<!-- Label -->
	<text x="200" y="232" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Call signaling — INVITE, ring, answer, media, hang up
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
