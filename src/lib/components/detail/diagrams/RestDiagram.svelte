<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" class="w-full" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<marker id="rest-arrow-get" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill="#22c55e" opacity="0.8" />
		</marker>
		<marker id="rest-arrow-post" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill="#3b82f6" opacity="0.8" />
		</marker>
		<marker id="rest-arrow-put" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill="#f59e0b" opacity="0.8" />
		</marker>
		<marker id="rest-arrow-del" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill="#ef4444" opacity="0.8" />
		</marker>
	</defs>

	<!-- Client -->
	<rect
		x="20"
		y="15"
		width="80"
		height="32"
		rx="6"
		fill={color}
		opacity="0.12"
		stroke={color}
		stroke-opacity="0.3"
		stroke-width="1"
	/>
	<text x="60" y="35" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600"
		>Client</text
	>

	<!-- Server -->
	<rect
		x="300"
		y="15"
		width="80"
		height="32"
		rx="6"
		fill={color}
		opacity="0.12"
		stroke={color}
		stroke-opacity="0.3"
		stroke-width="1"
	/>
	<text x="340" y="35" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600"
		>Server</text
	>

	<!-- Resource URL -->
	<rect x="150" y="8" width="100" height="20" rx="4" fill="rgba(255,255,255,0.05)" />
	<text x="200" y="22" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace"
		>/api/users/42</text
	>

	<!-- Lifelines -->
	<line x1="60" y1="47" x2="60" y2="205" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
	<line
		x1="340"
		y1="47"
		x2="340"
		y2="205"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3,3"
	/>

	<!-- GET -->
	<rect x="10" y="60" width="40" height="16" rx="3" fill="#22c55e" opacity="0.2" />
	<text x="30" y="72" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="700">GET</text>
	<line
		x1="65"
		y1="68"
		x2="335"
		y2="68"
		stroke="#22c55e"
		stroke-width="1.5"
		marker-end="url(#rest-arrow-get)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;0.8;0.5"
			dur="4s"
			repeatCount="indefinite"
		/>
	</line>
	<line
		x1="335"
		y1="82"
		x2="65"
		y2="82"
		stroke="#22c55e"
		stroke-width="1"
		marker-end="url(#rest-arrow-get)"
		stroke-opacity="0.5"
		stroke-dasharray="4,2"
	/>
	<text x="340" y="79" text-anchor="start" fill="#22c55e" font-size="8" dx="5" opacity="0.7"
		>200</text
	>

	<!-- POST -->
	<rect x="10" y="100" width="40" height="16" rx="3" fill="#3b82f6" opacity="0.2" />
	<text x="30" y="112" text-anchor="middle" fill="#3b82f6" font-size="8" font-weight="700"
		>POST</text
	>
	<line
		x1="65"
		y1="108"
		x2="335"
		y2="108"
		stroke="#3b82f6"
		stroke-width="1.5"
		marker-end="url(#rest-arrow-post)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;0.8;0.5"
			dur="4s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<line
		x1="335"
		y1="122"
		x2="65"
		y2="122"
		stroke="#3b82f6"
		stroke-width="1"
		marker-end="url(#rest-arrow-post)"
		stroke-opacity="0.5"
		stroke-dasharray="4,2"
	/>
	<text x="340" y="119" text-anchor="start" fill="#3b82f6" font-size="8" dx="5" opacity="0.7"
		>201</text
	>

	<!-- PUT -->
	<rect x="10" y="140" width="40" height="16" rx="3" fill="#f59e0b" opacity="0.2" />
	<text x="30" y="152" text-anchor="middle" fill="#f59e0b" font-size="8" font-weight="700">PUT</text
	>
	<line
		x1="65"
		y1="148"
		x2="335"
		y2="148"
		stroke="#f59e0b"
		stroke-width="1.5"
		marker-end="url(#rest-arrow-put)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;0.8;0.5"
			dur="4s"
			begin="2s"
			repeatCount="indefinite"
		/>
	</line>
	<line
		x1="335"
		y1="162"
		x2="65"
		y2="162"
		stroke="#f59e0b"
		stroke-width="1"
		marker-end="url(#rest-arrow-put)"
		stroke-opacity="0.5"
		stroke-dasharray="4,2"
	/>
	<text x="340" y="159" text-anchor="start" fill="#f59e0b" font-size="8" dx="5" opacity="0.7"
		>200</text
	>

	<!-- DELETE -->
	<rect x="10" y="180" width="40" height="16" rx="3" fill="#ef4444" opacity="0.2" />
	<text x="30" y="192" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="700">DEL</text
	>
	<line
		x1="65"
		y1="188"
		x2="335"
		y2="188"
		stroke="#ef4444"
		stroke-width="1.5"
		marker-end="url(#rest-arrow-del)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.5;0.8;0.5"
			dur="4s"
			begin="3s"
			repeatCount="indefinite"
		/>
	</line>
	<line
		x1="335"
		y1="202"
		x2="65"
		y2="202"
		stroke="#ef4444"
		stroke-width="1"
		marker-end="url(#rest-arrow-del)"
		stroke-opacity="0.5"
		stroke-dasharray="4,2"
	/>
	<text x="340" y="199" text-anchor="start" fill="#ef4444" font-size="8" dx="5" opacity="0.7"
		>204</text
	>

	<!-- Label -->
	<text x="200" y="225" text-anchor="middle" fill="#64748b" font-size="10" font-style="italic">
		Stateless CRUD — resources identified by URL, operated on with HTTP methods
	</text>
</svg>
