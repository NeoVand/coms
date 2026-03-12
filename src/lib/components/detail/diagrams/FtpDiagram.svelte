<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 230" class="w-full" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<marker id="ftp-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill={color} opacity="0.8" />
		</marker>
		<marker id="ftp-arrow-data" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill="#22c55e" opacity="0.8" />
		</marker>
	</defs>

	<!-- Client -->
	<rect
		x="30"
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
	<text x="70" y="35" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600"
		>Client</text
	>

	<!-- Server -->
	<rect
		x="280"
		y="15"
		width="90"
		height="32"
		rx="6"
		fill={color}
		opacity="0.12"
		stroke={color}
		stroke-opacity="0.3"
		stroke-width="1"
	/>
	<text x="325" y="35" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600"
		>FTP Server</text
	>

	<!-- Channel labels -->
	<rect x="145" y="52" width="55" height="14" rx="3" fill={color} opacity="0.15" />
	<text x="172" y="62" text-anchor="middle" fill={color} font-size="7" font-weight="600"
		>Port 21</text
	>
	<rect x="215" y="52" width="55" height="14" rx="3" fill="#22c55e" opacity="0.15" />
	<text x="242" y="62" text-anchor="middle" fill="#22c55e" font-size="7" font-weight="600"
		>Port 20+</text
	>

	<!-- Lifelines -->
	<line x1="70" y1="47" x2="70" y2="190" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
	<line
		x1="325"
		y1="47"
		x2="325"
		y2="190"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="3,3"
	/>

	<!-- Control channel: USER → -->
	<line
		x1="75"
		y1="78"
		x2="318"
		y2="78"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.6"
	/>
	<text x="200" y="73" text-anchor="middle" fill="#94a3b8" font-size="8">USER anonymous</text>

	<!-- ← 331 -->
	<line
		x1="320"
		y1="92"
		x2="77"
		y2="92"
		stroke={color}
		stroke-width="1"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.4"
		stroke-dasharray="3,2"
	/>
	<text x="200" y="88" text-anchor="middle" fill="#94a3b8" font-size="7">331 Password required</text
	>

	<!-- PASS → -->
	<line
		x1="75"
		y1="106"
		x2="318"
		y2="106"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.6"
	/>
	<text x="200" y="102" text-anchor="middle" fill="#94a3b8" font-size="8">PASS ****</text>

	<!-- ← 230 OK -->
	<line
		x1="320"
		y1="118"
		x2="77"
		y2="118"
		stroke={color}
		stroke-width="1"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.4"
		stroke-dasharray="3,2"
	/>
	<text x="200" y="114" text-anchor="middle" fill={color} font-size="7" opacity="0.7"
		>230 Login OK</text
	>

	<!-- RETR → -->
	<line
		x1="75"
		y1="136"
		x2="318"
		y2="136"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;0.8;0.4"
			dur="3s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="132" text-anchor="middle" fill={color} font-size="8" opacity="0.8"
		>RETR document.pdf</text
	>

	<!-- ← Data channel stream -->
	<line
		x1="320"
		y1="155"
		x2="77"
		y2="155"
		stroke="#22c55e"
		stroke-width="2"
		marker-end="url(#ftp-arrow-data)"
		stroke-opacity="0.7"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.7;0.3"
			dur="2s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="200" y="150" text-anchor="middle" fill="#22c55e" font-size="8" opacity="0.8"
		>File data stream</text
	>

	<!-- Data transfer indicator -->
	<rect x="80" y="160" width="235" height="12" rx="3" fill="#22c55e" opacity="0.08" />
	<rect x="80" y="160" width="140" height="12" rx="3" fill="#22c55e" opacity="0.15">
		<animate attributeName="width" values="0;235" dur="3s" repeatCount="indefinite" />
	</rect>
	<text x="200" y="169" text-anchor="middle" fill="#22c55e" font-size="7" opacity="0.6"
		>Data channel (separate connection)</text
	>

	<!-- ← 226 Transfer complete -->
	<line
		x1="320"
		y1="183"
		x2="77"
		y2="183"
		stroke={color}
		stroke-width="1"
		marker-end="url(#ftp-arrow)"
		stroke-opacity="0.4"
		stroke-dasharray="3,2"
	/>
	<text x="200" y="179" text-anchor="middle" fill="#94a3b8" font-size="7"
		>226 Transfer complete</text
	>

	<!-- Label -->
	<text x="200" y="210" text-anchor="middle" fill="#64748b" font-size="10" font-style="italic">
		Dual-channel — control commands on port 21, data transfers on separate connections
	</text>
</svg>
