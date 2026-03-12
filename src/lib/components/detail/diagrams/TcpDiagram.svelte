<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="tcp-arrow-full" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="tcp-arrow-med" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.8" />
		</marker>
		<marker id="tcp-arrow-low" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.6" />
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
	<line x1="60" y1="28" x2="60" y2="210" stroke="#334155" stroke-width="1.5" />
	<line x1="340" y1="28" x2="340" y2="210" stroke="#334155" stroke-width="1.5" />

	<!-- SYN arrow -->
	<line
		x1="60"
		y1="55"
		x2="330"
		y2="85"
		stroke={color}
		stroke-width="2"
		marker-end="url(#tcp-arrow-full)"
	>
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>
	<text x="200" y="62" font-size="11" fill="#94a3b8" text-anchor="middle">SYN</text>

	<!-- SYN-ACK arrow -->
	<line
		x1="340"
		y1="95"
		x2="70"
		y2="125"
		stroke={color}
		stroke-width="2"
		opacity="0.8"
		marker-end="url(#tcp-arrow-med)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="3s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="102" font-size="11" fill="#94a3b8" text-anchor="middle">SYN-ACK</text>

	<!-- ACK arrow -->
	<line
		x1="60"
		y1="135"
		x2="330"
		y2="165"
		stroke={color}
		stroke-width="2"
		opacity="0.6"
		marker-end="url(#tcp-arrow-low)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.2;0.6;0.2"
			dur="3s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="142" font-size="11" fill="#94a3b8" text-anchor="middle">ACK</text>

	<!-- Data transfer dashed line -->
	<line
		x1="60"
		y1="185"
		x2="340"
		y2="185"
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="6 4"
		opacity="0.4"
	/>
	<text x="200" y="205" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Data Transfer Established
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
