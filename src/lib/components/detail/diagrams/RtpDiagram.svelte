<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 230" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="rtp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker
			id="rtp-arrow-rtcp"
			markerWidth="10"
			markerHeight="8"
			refX="10"
			refY="4"
			orient="auto"
		>
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Sender -->
	<rect x="10" y="25" width="60" height="35" rx="4" fill="#334155" />
	<text x="40" y="40" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Sender
	</text>
	<text x="40" y="52" font-size="8" fill="#64748b" text-anchor="middle">camera</text>

	<!-- Receiver -->
	<rect x="330" y="25" width="60" height="35" rx="4" fill="#334155" />
	<text x="360" y="40" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Receiver
	</text>
	<text x="360" y="52" font-size="8" fill="#64748b" text-anchor="middle">player</text>

	<!-- RTP label -->
	<text x="200" y="18" font-size="10" font-weight="600" fill={color} text-anchor="middle">
		RTP Packets →
	</text>

	<!-- RTP packet stream -->
	{#each [0, 1, 2, 3, 4] as i (i)}
		<g>
			<rect
				x={95 + i * 45}
				y="30"
				width="38"
				height="28"
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
				x={114 + i * 45}
				y="42"
				font-size="7"
				font-family="monospace"
				fill={color}
				text-anchor="middle"
			>
				seq:{100 + i}
			</text>
			<text
				x={114 + i * 45}
				y="52"
				font-size="7"
				font-family="monospace"
				fill="#64748b"
				text-anchor="middle"
			>
				ts:{i * 160}
			</text>
		</g>
	{/each}

	<!-- RTP flow arrow -->
	<line x1="75" y1="43" x2="85" y2="43" stroke={color} stroke-width="1.5" marker-end="url(#rtp-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
	</line>
	<line x1="320" y1="43" x2="325" y2="43" stroke={color} stroke-width="1.5" marker-end="url(#rtp-arrow)">
		<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
	</line>

	<!-- Packet structure detail -->
	<rect x="100" y="72" width="200" height="24" rx="3" fill="#334155" stroke="#64748b" stroke-width="0.5" />
	<line x1="155" y1="72" x2="155" y2="96" stroke="#64748b" stroke-width="0.5" />
	<line x1="210" y1="72" x2="210" y2="96" stroke="#64748b" stroke-width="0.5" />
	<line x1="260" y1="72" x2="260" y2="96" stroke="#64748b" stroke-width="0.5" />
	<text x="127" y="86" font-size="7" fill="#94a3b8" text-anchor="middle">V|P|CC</text>
	<text x="182" y="86" font-size="7" fill="#94a3b8" text-anchor="middle">Seq Num</text>
	<text x="235" y="86" font-size="7" fill="#94a3b8" text-anchor="middle">Timestamp</text>
	<text x="280" y="86" font-size="7" fill="#94a3b8" text-anchor="middle">Payload</text>
	<text x="200" y="107" font-size="8" fill="#64748b" text-anchor="middle">
		RTP Header Structure
	</text>

	<!-- Divider -->
	<line x1="20" y1="118" x2="380" y2="118" stroke="#334155" stroke-width="0.5" stroke-dasharray="4 3" />

	<!-- RTCP label -->
	<text x="200" y="133" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">
		← RTCP Feedback
	</text>

	<!-- RTCP arrows going right to left -->
	<line x1="330" y1="148" x2="80" y2="148" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#rtp-arrow-rtcp)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- RTCP metrics -->
	<rect x="110" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="147" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">loss: 2.1%</text>

	<rect x="195" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="232" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">jitter: 12ms</text>

	<rect x="280" y="155" width="75" height="20" rx="3" fill="#334155" />
	<text x="317" y="168" font-size="7" fill="#94a3b8" text-anchor="middle">RTT: 45ms</text>

	<!-- Quality adaptation arrow -->
	<path d="M200,182 Q200,192 185,192 L130,192" stroke={color} stroke-width="1" stroke-dasharray="3 2" marker-end="url(#rtp-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2.5s" begin="1s" repeatCount="indefinite" />
	</path>
	<text x="240" y="193" font-size="7" fill={color} text-anchor="middle">adapts bitrate</text>

	<!-- Separator -->
	<line x1="20" y1="203" x2="380" y2="203" stroke="#334155" stroke-width="0.5" stroke-dasharray="4 3" />

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
