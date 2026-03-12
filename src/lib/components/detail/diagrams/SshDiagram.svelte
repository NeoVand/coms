<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="ssh-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="ssh-arrow-back" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} opacity="0.7" />
		</marker>
	</defs>

	<!-- Client and Server labels -->
	<text x="55" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Client
	</text>
	<text x="345" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Server
	</text>

	<!-- Vertical lifelines -->
	<line x1="55" y1="22" x2="55" y2="210" stroke="#334155" stroke-width="1.5" />
	<line x1="345" y1="22" x2="345" y2="210" stroke="#334155" stroke-width="1.5" />

	<!-- Phase 1: Version Exchange (plain text) -->
	<rect x="80" y="26" width="240" height="22" rx="2" fill="#334155" opacity="0.3" />
	<line
		x1="55"
		y1="34"
		x2="335"
		y2="34"
		stroke="#94a3b8"
		stroke-width="1"
		marker-end="url(#ssh-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="5s"
			repeatCount="indefinite"
		/>
	</line>
	<line
		x1="345"
		y1="42"
		x2="65"
		y2="42"
		stroke="#94a3b8"
		stroke-width="1"
		marker-end="url(#ssh-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="5s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="30" font-size="7" font-family="monospace" fill="#64748b" text-anchor="middle">
		SSH-2.0-OpenSSH_9.0
	</text>
	<!-- Phase label -->
	<text x="395" y="38" font-size="7" fill="#64748b" text-anchor="end">plain</text>

	<!-- Phase 2: Key Exchange -->
	<rect x="80" y="54" width="240" height="32" rx="2" fill={color} opacity="0.05" />
	<line
		x1="55"
		y1="62"
		x2="335"
		y2="62"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#ssh-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="0.6s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="58" font-size="8" fill={color} text-anchor="middle">KEX_INIT (algorithms)</text>
	<line
		x1="345"
		y1="72"
		x2="65"
		y2="72"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#ssh-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="0.9s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="82" font-size="8" fill={color} text-anchor="middle">DH Key Exchange</text>
	<text x="395" y="68" font-size="7" fill={color} text-anchor="end">DH</text>

	<!-- Phase 3: Server Authentication -->
	<rect x="80" y="92" width="240" height="22" rx="2" fill={color} opacity="0.05" />
	<line
		x1="345"
		y1="104"
		x2="65"
		y2="104"
		stroke={color}
		stroke-width="1.5"
		opacity="0.8"
		marker-end="url(#ssh-arrow-back)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="5s"
			begin="1.2s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="100" font-size="8" fill="#94a3b8" text-anchor="middle">
		Host Key → verify fingerprint
	</text>
	<text x="395" y="104" font-size="7" fill="#94a3b8" text-anchor="end">verify</text>

	<!-- Lock icon representation -->
	<rect
		x="186"
		y="106"
		width="28"
		height="10"
		rx="2"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
	/>
	<text x="200" y="114" font-size="6" fill={color} text-anchor="middle">trust?</text>

	<!-- Phase 4: User Authentication -->
	<rect x="80" y="122" width="240" height="22" rx="2" fill={color} opacity="0.05" />
	<line
		x1="55"
		y1="134"
		x2="335"
		y2="134"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#ssh-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="5s"
			begin="1.5s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="130" font-size="8" fill="#94a3b8" text-anchor="middle">
		User Auth (publickey / password)
	</text>
	<text x="395" y="134" font-size="7" fill="#94a3b8" text-anchor="end">auth</text>

	<!-- Phase 5: Encrypted Tunnel -->
	<rect
		x="50"
		y="152"
		width="300"
		height="28"
		rx="6"
		fill={color}
		opacity="0.08"
		stroke={color}
		stroke-width="1"
		stroke-dasharray="6 3"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.7;0.3"
			dur="2s"
			repeatCount="indefinite"
		/>
	</rect>

	<!-- Encrypted data flowing -->
	<line
		x1="65"
		y1="166"
		x2="330"
		y2="166"
		stroke={color}
		stroke-width="2"
		stroke-dasharray="8 4"
		opacity="0.7"
	>
		<animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
	</line>
	<text x="200" y="162" font-size="8" font-weight="600" fill={color} text-anchor="middle">
		Encrypted Tunnel Established
	</text>
	<text x="200" y="186" font-size="7" fill="#64748b" text-anchor="middle">
		AES-256-CTR + HMAC-SHA2
	</text>

	<!-- Shell commands flowing through tunnel -->
	<text x="120" y="176" font-size="6" font-family="monospace" fill={color} opacity="0.5">
		$ ls -la
	</text>
	<text x="250" y="176" font-size="6" font-family="monospace" fill={color} opacity="0.5">
		drwxr-xr-x
	</text>

	<!-- Phase progression indicator -->
	<line x1="10" y1="30" x2="10" y2="180" stroke="#334155" stroke-width="2" />
	<circle cx="10" cy="38" r="2.5" fill="#64748b" />
	<circle cx="10" cy="68" r="2.5" fill={color} />
	<circle cx="10" cy="104" r="2.5" fill={color} opacity="0.8" />
	<circle cx="10" cy="134" r="2.5" fill={color} opacity="0.6" />
	<circle cx="10" cy="166" r="2.5" fill={color} />

	<!-- Separator -->
	<line
		x1="20"
		y1="200"
		x2="380"
		y2="200"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="218" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Encrypted tunnel — key exchange, auth, then secure shell
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
