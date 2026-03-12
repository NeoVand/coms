<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Browser -->
	<rect
		x="10"
		y="95"
		width="60"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<circle cx="40" cy="104" r="8" fill="none" stroke="#94a3b8" stroke-width="1.5" />
	<ellipse cx="40" cy="104" rx="3" ry="8" fill="none" stroke="#94a3b8" stroke-width="1" />
	<line x1="32" y1="104" x2="48" y2="104" stroke="#94a3b8" stroke-width="1" />
	<text x="40" y="122" font-size="7" fill="#94a3b8" text-anchor="middle">Browser</text>

	<!-- Recursive Resolver -->
	<rect
		x="100"
		y="85"
		width="72"
		height="52"
		rx="8"
		fill={color}
		fill-opacity="0.08"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.5"
	/>
	<text x="136" y="108" font-size="9" fill={color} text-anchor="middle" font-weight="500">
		Recursive
	</text>
	<text x="136" y="120" font-size="9" fill={color} text-anchor="middle" font-weight="500">
		Resolver
	</text>

	<!-- Root Server -->
	<rect
		x="230"
		y="15"
		width="66"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="263" y="31" font-size="8" fill="#94a3b8" text-anchor="middle">Root</text>
	<text x="263" y="42" font-size="8" fill="#94a3b8" text-anchor="middle">Server (.)</text>

	<!-- TLD Server -->
	<rect
		x="316"
		y="75"
		width="72"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="352" y="91" font-size="8" fill="#94a3b8" text-anchor="middle">TLD Server</text>
	<text x="352" y="102" font-size="8" fill="#94a3b8" text-anchor="middle">(.com)</text>

	<!-- Authoritative Server -->
	<rect
		x="310"
		y="145"
		width="80"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="350" y="159" font-size="8" fill="#94a3b8" text-anchor="middle">Authoritative</text>
	<text x="350" y="170" font-size="8" fill="#94a3b8" text-anchor="middle">Server</text>

	<!-- Query: Browser to Resolver -->
	<line x1="70" y1="108" x2="98" y2="108" stroke={color} stroke-width="1.5">
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="4s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="98,108 90,104 90,112" fill={color} />
	<text x="84" y="100" font-size="7" fill="#94a3b8" text-anchor="middle">?</text>

	<!-- Resolver to Root -->
	<line
		x1="156"
		y1="85"
		x2="228"
		y2="40"
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="4 3"
		opacity="0.6"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.6;0.3"
			dur="4s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="228,40 219,38 222,46" fill={color} opacity="0.6" />

	<!-- Root to Resolver (response) -->
	<line
		x1="230"
		y1="48"
		x2="162"
		y2="88"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3 3"
		opacity="0.5"
	/>

	<!-- Resolver to TLD -->
	<line
		x1="172"
		y1="100"
		x2="314"
		y2="88"
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="4 3"
		opacity="0.6"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.6;0.3"
			dur="4s"
			begin="0.6s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="314,88 306,84 306,92" fill={color} opacity="0.6" />

	<!-- TLD to Resolver (response) -->
	<line
		x1="316"
		y1="105"
		x2="172"
		y2="116"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3 3"
		opacity="0.5"
	/>

	<!-- Resolver to Authoritative -->
	<line
		x1="168"
		y1="130"
		x2="308"
		y2="158"
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="4 3"
		opacity="0.6"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.6;0.3"
			dur="4s"
			begin="0.9s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="308,158 300,153 300,161" fill={color} opacity="0.6" />

	<!-- Authoritative to Resolver (response with IP) -->
	<line x1="310" y1="175" x2="168" y2="135" stroke={color} stroke-width="1.5" opacity="0.8">
		<animate
			attributeName="stroke-opacity"
			values="0.4;0.8;0.4"
			dur="4s"
			begin="1.2s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="168,135 176,130 176,138" fill={color} opacity="0.8" />

	<!-- Response: Resolver to Browser -->
	<line x1="100" y1="118" x2="72" y2="118" stroke={color} stroke-width="1.5" opacity="0.9">
		<animate
			attributeName="stroke-opacity"
			values="0.4;0.9;0.4"
			dur="4s"
			begin="1.5s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="72,118 80,114 80,122" fill={color} opacity="0.9" />
	<text x="84" y="130" font-size="7" fill={color} text-anchor="middle">IP</text>

	<!-- Step numbers -->
	<circle cx="84" cy="105" r="6" fill={color} opacity="0.2" />
	<text x="84" y="108" font-size="7" fill={color} text-anchor="middle" font-weight="600">1</text>

	<circle cx="192" cy="60" r="6" fill={color} opacity="0.2" />
	<text x="192" y="63" font-size="7" fill={color} text-anchor="middle" font-weight="600">2</text>

	<circle cx="244" cy="96" r="6" fill={color} opacity="0.2" />
	<text x="244" y="99" font-size="7" fill={color} text-anchor="middle" font-weight="600">3</text>

	<circle cx="240" cy="150" r="6" fill={color} opacity="0.2" />
	<text x="240" y="153" font-size="7" fill={color} text-anchor="middle" font-weight="600">4</text>

	<circle cx="84" cy="125" r="6" fill={color} opacity="0.2" />
	<text x="84" y="128" font-size="7" fill={color} text-anchor="middle" font-weight="600">5</text>

	<!-- Bottom label -->
	<text x="200" y="215" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Iterative resolution: domain name → IP address
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
