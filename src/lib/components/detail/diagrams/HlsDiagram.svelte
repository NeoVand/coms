<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="hls-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<path d="M0,0 L8,3 L0,6 Z" fill={color} />
		</marker>
		<marker id="hls-arrow-muted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Server Pipeline title -->
	<text x="200" y="14" font-size="9" fill="#64748b" text-anchor="middle">Server-Side Pipeline</text>

	<!-- Video Source -->
	<rect x="10" y="24" width="56" height="30" rx="4" fill="#334155" />
	<text x="38" y="37" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Video</text
	>
	<text x="38" y="47" font-size="7" fill="#64748b" text-anchor="middle">source</text>

	<!-- Arrow: Source → Encoder -->
	<line
		x1="66"
		y1="39"
		x2="88"
		y2="39"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#hls-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- Encoder -->
	<rect x="96" y="24" width="60" height="30" rx="4" fill="#334155" />
	<text x="126" y="37" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Encoder</text
	>
	<text x="126" y="47" font-size="7" fill="#64748b" text-anchor="middle">H.264/HEVC</text>

	<!-- Fan-out lines: Encoder → Quality levels -->
	<line
		x1="156"
		y1="32"
		x2="178"
		y2="32"
		stroke={color}
		stroke-width="1"
		opacity="0.6"
		marker-end="url(#hls-arrow)"
	/>
	<line
		x1="156"
		y1="39"
		x2="178"
		y2="46"
		stroke={color}
		stroke-width="1"
		opacity="0.8"
		marker-end="url(#hls-arrow)"
	/>
	<line
		x1="156"
		y1="46"
		x2="178"
		y2="60"
		stroke={color}
		stroke-width="1"
		marker-end="url(#hls-arrow)"
	/>

	<!-- Quality levels -->
	<rect
		x="186"
		y="24"
		width="48"
		height="15"
		rx="2"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
	/>
	<text x="210" y="34" font-size="7" font-family="monospace" fill={color} text-anchor="middle"
		>1080p</text
	>

	<rect
		x="186"
		y="41"
		width="48"
		height="15"
		rx="2"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
		opacity="0.8"
	/>
	<text x="210" y="51" font-size="7" font-family="monospace" fill="#94a3b8" text-anchor="middle"
		>720p</text
	>

	<rect
		x="186"
		y="58"
		width="48"
		height="15"
		rx="2"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
		opacity="0.6"
	/>
	<text x="210" y="68" font-size="7" font-family="monospace" fill="#64748b" text-anchor="middle"
		>360p</text
	>

	<!-- Arrow: Quality → Segmenter -->
	<line
		x1="234"
		y1="48"
		x2="256"
		y2="48"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#hls-arrow)"
	/>

	<!-- Segmenter -->
	<rect x="264" y="28" width="56" height="40" rx="4" fill="#334155" />
	<text x="292" y="45" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Segment</text
	>
	<text x="292" y="56" font-size="7" fill="#64748b" text-anchor="middle">.ts chunks</text>

	<!-- Arrow: Segmenter → CDN -->
	<line
		x1="320"
		y1="48"
		x2="342"
		y2="48"
		stroke={color}
		stroke-width="1.2"
		marker-end="url(#hls-arrow)"
	/>

	<!-- CDN -->
	<rect x="350" y="30" width="42" height="36" rx="4" fill="#334155" />
	<text x="371" y="48" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">CDN</text
	>
	<text x="371" y="58" font-size="6" fill="#64748b" text-anchor="middle">origin</text>

	<!-- Divider -->
	<line
		x1="20"
		y1="86"
		x2="380"
		y2="86"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>
	<text x="200" y="100" font-size="9" fill="#64748b" text-anchor="middle">Client-Side Playback</text
	>

	<!-- Player -->
	<rect x="15" y="110" width="55" height="30" rx="4" fill="#334155" />
	<text x="42" y="123" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle"
		>Player</text
	>
	<text x="42" y="134" font-size="7" fill="#64748b" text-anchor="middle">HLS.js</text>

	<!-- Step 1: Fetch manifest -->
	<text x="118" y="108" font-size="7" fill="#64748b" text-anchor="middle">1. fetch manifest</text>
	<line
		x1="70"
		y1="118"
		x2="145"
		y2="118"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#hls-arrow)"
	>
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- Manifest -->
	<rect
		x="153"
		y="108"
		width="82"
		height="22"
		rx="3"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
	/>
	<text x="194" y="122" font-size="8" font-family="monospace" fill={color} text-anchor="middle"
		>master.m3u8</text
	>

	<!-- Step 2: Choose quality & download -->
	<text x="290" y="108" font-size="7" fill="#64748b" text-anchor="middle">2. request segments</text>
	<line
		x1="235"
		y1="119"
		x2="257"
		y2="119"
		stroke={color}
		stroke-width="1"
		marker-end="url(#hls-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="3s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>

	<!-- Segments -->
	{#each [0, 1, 2, 3] as i (i)}
		<rect
			x={265 + i * 28}
			y="110"
			width="24"
			height="18"
			rx="2"
			fill="#334155"
			stroke={color}
			stroke-width="0.5"
		>
			<animate
				attributeName="stroke-opacity"
				values="0.3;1;0.3"
				dur="2s"
				begin="{i * 0.4}s"
				repeatCount="indefinite"
			/>
		</rect>
		<text
			x={277 + i * 28}
			y="122"
			font-size="6"
			font-family="monospace"
			fill="#94a3b8"
			text-anchor="middle"
		>
			seg{i}
		</text>
	{/each}

	<!-- Adaptive bitrate section -->
	<rect
		x="50"
		y="148"
		width="300"
		height="52"
		rx="6"
		fill={color}
		opacity="0.04"
		stroke={color}
		stroke-width="0.5"
		stroke-opacity="0.15"
	/>
	<text
		x="200"
		y="161"
		font-size="8"
		font-weight="600"
		fill={color}
		text-anchor="middle"
		opacity="0.9">Adaptive Bitrate Switching</text
	>

	<!-- Bandwidth graph line -->
	<polyline
		points="70,185 110,175 150,180 190,170 230,188 270,172 310,178 330,185"
		stroke={color}
		stroke-width="1.5"
		fill="none"
		opacity="0.6"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.7;0.3"
			dur="4s"
			repeatCount="indefinite"
		/>
	</polyline>

	<!-- Quality level indicators along the line -->
	<text x="110" y="172" font-size="6" fill={color} text-anchor="middle" opacity="0.8">1080p</text>
	<text x="190" y="167" font-size="6" fill={color} text-anchor="middle" opacity="0.8">1080p</text>
	<text x="235" y="194" font-size="6" fill="#94a3b8" text-anchor="middle">720p</text>
	<text x="310" y="175" font-size="6" fill={color} text-anchor="middle" opacity="0.7">1080p</text>

	<text x="80" y="194" font-size="6" fill="#64748b" text-anchor="middle">bandwidth</text>
	<line x1="105" y1="192" x2="335" y2="192" stroke="#475569" stroke-width="0.5" />

	<!-- Separator -->
	<line
		x1="20"
		y1="210"
		x2="380"
		y2="210"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="228" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Adaptive streaming — quality adapts to available bandwidth
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
