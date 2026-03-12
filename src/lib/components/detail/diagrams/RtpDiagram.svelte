<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 230" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="rtp-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<path d="M0,0 L8,3 L0,6 Z" fill={color} />
		</marker>
		<marker id="rtp-arrow-muted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Sender -->
	<rect x="10" y="25" width="60" height="35" rx="4" fill="#334155" />
	<text x="40" y="40" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Sender</text
	>
	<text x="40" y="52" font-size="8" fill="#64748b" text-anchor="middle">camera</text>

	<!-- Receiver -->
	<rect x="330" y="25" width="60" height="35" rx="4" fill="#334155" />
	<text x="360" y="40" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Receiver</text
	>
	<text x="360" y="52" font-size="8" fill="#64748b" text-anchor="middle">player</text>

	<!-- RTP label -->
	<text x="200" y="18" font-size="10" font-weight="600" fill={color} text-anchor="middle">
		RTP Packet Stream
	</text>

	<!-- Arrow: Sender → first packet -->
	<line
		x1="70"
		y1="42"
		x2="88"
		y2="42"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#rtp-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
	</line>

	<!-- RTP packet stream -->
	{#each [0, 1, 2, 3, 4] as i (i)}
		<g>
			<rect
				x={96 + i * 44}
				y="30"
				width="36"
				height="26"
				rx="3"
				fill="#334155"
				stroke={color}
				stroke-width="1"
			>
				<animate
					attributeName="opacity"
					values="0.3;1;0.3"
					dur="2.5s"
					begin="{i * 0.3}s"
					repeatCount="indefinite"
				/>
			</rect>
			<text
				x={114 + i * 44}
				y="41"
				font-size="7"
				font-family="monospace"
				fill={color}
				text-anchor="middle"
			>
				seq:{100 + i}
			</text>
			<text
				x={114 + i * 44}
				y="51"
				font-size="7"
				font-family="monospace"
				fill="#64748b"
				text-anchor="middle"
			>
				ts:{i * 160}
			</text>
		</g>
	{/each}

	<!-- Arrow: last packet → Receiver -->
	<line
		x1="316"
		y1="42"
		x2="328"
		y2="42"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#rtp-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
	</line>

	<!-- Packet structure detail -->
	<rect
		x="100"
		y="72"
		width="200"
		height="24"
		rx="3"
		fill="#334155"
		stroke="#64748b"
		stroke-width="0.5"
	/>
	<line x1="155" y1="72" x2="155" y2="96" stroke="#64748b" stroke-width="0.5" />
	<line x1="210" y1="72" x2="210" y2="96" stroke="#64748b" stroke-width="0.5" />
	<line x1="260" y1="72" x2="260" y2="96" stroke="#64748b" stroke-width="0.5" />
	<text x="127" y="87" font-size="7" fill="#94a3b8" text-anchor="middle">V|P|CC</text>
	<text x="182" y="87" font-size="7" fill="#94a3b8" text-anchor="middle">Seq Num</text>
	<text x="235" y="87" font-size="7" fill="#94a3b8" text-anchor="middle">Timestamp</text>
	<text x="280" y="87" font-size="7" fill="#94a3b8" text-anchor="middle">Payload</text>
	<text x="200" y="107" font-size="8" fill="#64748b" text-anchor="middle">RTP Header Structure</text
	>

	<!-- Divider -->
	<line
		x1="20"
		y1="118"
		x2="380"
		y2="118"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- RTCP label -->
	<text x="200" y="133" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">
		RTCP Feedback
	</text>

	<!-- RTCP arrow going right to left -->
	<line
		x1="330"
		y1="148"
		x2="80"
		y2="148"
		stroke="#94a3b8"
		stroke-width="1.5"
		stroke-dasharray="6 3"
		marker-end="url(#rtp-arrow-muted)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="3s"
			repeatCount="indefinite"
		/>
	</line>

	<!-- RTCP metrics -->
	<rect x="110" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="147" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">loss: 2.1%</text>

	<rect x="195" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="232" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">jitter: 12ms</text>

	<rect x="280" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="317" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">RTT: 45ms</text>

	<!-- Adaptation arrow: feedback drives sender adjustment -->
	<line
		x1="200"
		y1="180"
		x2="60"
		y2="62"
		stroke={color}
		stroke-width="1"
		stroke-dasharray="3 2"
		marker-end="url(#rtp-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="2.5s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</line>
	<text x="108" y="130" font-size="7" fill={color} text-anchor="middle">adapts bitrate</text>

	<!-- Separator -->
	<line
		x1="20"
		y1="203"
		x2="380"
		y2="203"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="220" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Media packets + feedback loop for adaptive quality
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
