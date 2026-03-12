<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Plaintext box -->
	<rect
		x="20"
		y="55"
		width="90"
		height="80"
		rx="8"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="65" y="50" font-size="10" fill="#94a3b8" text-anchor="middle">Plaintext</text>
	<text x="65" y="85" font-size="20" text-anchor="middle" fill="#94a3b8">Aa</text>
	<text x="65" y="110" font-size="8" fill="#64748b" text-anchor="middle"> Hello World </text>
	<text x="65" y="122" font-size="8" fill="#64748b" text-anchor="middle"> readable data </text>

	<!-- Arrow: plaintext to encryption -->
	<line x1="115" y1="95" x2="148" y2="95" stroke={color} stroke-width="1.5">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>
	<polygon points="148,95 140,90 140,100" fill={color}>
		<animate attributeName="fill-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</polygon>

	<!-- Encryption box -->
	<rect
		x="152"
		y="45"
		width="96"
		height="100"
		rx="10"
		fill={color}
		fill-opacity="0.08"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.5"
	/>
	<text x="200" y="38" font-size="10" fill={color} text-anchor="middle" font-weight="500">
		TLS Encryption
	</text>

	<!-- Lock icon -->
	<rect
		x="186"
		y="78"
		width="28"
		height="22"
		rx="4"
		fill="none"
		stroke={color}
		stroke-width="1.5"
	/>
	<path d="M192 78 V72 A8 8 0 0 1 208 72 V78" fill="none" stroke={color} stroke-width="1.5" />
	<circle cx="200" cy="90" r="2.5" fill={color} />
	<line x1="200" y1="92" x2="200" y2="96" stroke={color} stroke-width="1.5" />

	<!-- Key exchange label -->
	<text x="200" y="120" font-size="8" fill="#64748b" text-anchor="middle"> Key Exchange </text>
	<text x="200" y="132" font-size="8" fill="#64748b" text-anchor="middle"> + Cipher Suite </text>

	<!-- Arrow: encryption to ciphertext -->
	<line x1="252" y1="95" x2="285" y2="95" stroke={color} stroke-width="1.5">
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="3s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="285,95 277,90 277,100" fill={color}>
		<animate
			attributeName="fill-opacity"
			values="0.4;1;0.4"
			dur="3s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</polygon>

	<!-- Ciphertext box -->
	<rect
		x="290"
		y="55"
		width="90"
		height="80"
		rx="8"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="335" y="50" font-size="10" fill="#94a3b8" text-anchor="middle">Ciphertext</text>
	<text x="335" y="85" font-size="14" text-anchor="middle" fill="#94a3b8" font-family="monospace">
		%#@!
	</text>
	<text x="335" y="110" font-size="8" fill="#64748b" text-anchor="middle"> x9Fk2..mQ7 </text>
	<text x="335" y="122" font-size="8" fill="#64748b" text-anchor="middle"> encrypted data </text>

	<!-- Bottom label -->
	<text x="200" y="175" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Data encrypted in transit — unreadable without the key
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
