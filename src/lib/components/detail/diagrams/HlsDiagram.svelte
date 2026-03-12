<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="hls-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker
			id="hls-arrow-muted"
			markerWidth="10"
			markerHeight="8"
			refX="10"
			refY="4"
			orient="auto"
		>
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Pipeline title -->
	<text x="200" y="14" font-size="9" fill="#64748b" text-anchor="middle">
		Server-Side Pipeline
	</text>

	<!-- Video Source -->
	<rect x="8" y="22" width="52" height="32" rx="4" fill="#334155" />
	<text x="34" y="36" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Video
	</text>
	<text x="34" y="47" font-size="7" fill="#64748b" text-anchor="middle">source</text>

	<!-- Arrow to Encoder -->
	<line x1="62" y1="38" x2="78" y2="38" stroke={color} stroke-width="1" marker-end="url(#hls-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- Encoder -->
	<rect x="82" y="22" width="58" height="32" rx="4" fill="#334155" />
	<text x="111" y="36" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Encoder
	</text>
	<text x="111" y="47" font-size="7" fill="#64748b" text-anchor="middle">H.264/HEVC</text>

	<!-- Quality level outputs -->
	<line x1="140" y1="30" x2="165" y2="68" stroke={color} stroke-width="1" opacity="0.6" />
	<line x1="140" y1="38" x2="165" y2="82" stroke={color} stroke-width="1" opacity="0.8" />
	<line x1="140" y1="46" x2="165" y2="96" stroke={color} stroke-width="1" />

	<!-- Quality levels -->
	<rect x="165" y="60" width="50" height="14" rx="2" fill="#334155" stroke={color} stroke-width="0.5" />
	<text x="190" y="70" font-size="7" font-family="monospace" fill={color} text-anchor="middle">
		1080p
	</text>

	<rect x="165" y="76" width="50" height="14" rx="2" fill="#334155" stroke={color} stroke-width="0.5" opacity="0.8" />
	<text x="190" y="86" font-size="7" font-family="monospace" fill="#94a3b8" text-anchor="middle">
		720p
	</text>

	<rect x="165" y="92" width="50" height="14" rx="2" fill="#334155" stroke={color} stroke-width="0.5" opacity="0.6" />
	<text x="190" y="102" font-size="7" font-family="monospace" fill="#64748b" text-anchor="middle">
		360p
	</text>

	<!-- Segmenter -->
	<line x1="215" y1="82" x2="232" y2="82" stroke={color} stroke-width="1" marker-end="url(#hls-arrow)" />
	<rect x="236" y="62" width="54" height="42" rx="4" fill="#334155" />
	<text x="263" y="78" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Segment
	</text>
	<text x="263" y="90" font-size="7" fill="#64748b" text-anchor="middle">.ts chunks</text>

	<!-- Segments visual -->
	{#each [0, 1, 2, 3] as i (i)}
		<rect
			x={298 + i * 12}
			y="68"
			width="10"
			height="10"
			rx="1"
			fill={color}
			opacity={0.3 + i * 0.2}
		>
			<animate
				attributeName="opacity"
				values="{0.2 + i * 0.15};{0.5 + i * 0.15};{0.2 + i * 0.15}"
				dur="2s"
				begin="{i * 0.3}s"
				repeatCount="indefinite"
			/>
		</rect>
	{/each}

	<!-- CDN -->
	<rect x="298" y="84" width="52" height="24" rx="4" fill="#334155" />
	<text x="324" y="99" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		CDN
	</text>

	<!-- Arrow from Segmenter to CDN -->
	<line x1="290" y1="96" x2="296" y2="96" stroke={color} stroke-width="1" marker-end="url(#hls-arrow)" />

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

	<!-- Player side title -->
	<text x="200" y="132" font-size="9" fill="#64748b" text-anchor="middle">
		Client-Side Playback
	</text>

	<!-- Player -->
	<rect x="15" y="140" width="55" height="30" rx="4" fill="#334155" />
	<text x="42" y="154" font-size="8" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Player
	</text>
	<text x="42" y="165" font-size="7" fill="#64748b" text-anchor="middle">HLS.js</text>

	<!-- Step 1: Download manifest -->
	<line x1="70" y1="148" x2="140" y2="148" stroke={color} stroke-width="1.5" marker-end="url(#hls-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- Manifest file -->
	<rect x="144" y="138" width="80" height="22" rx="3" fill="#334155" stroke={color} stroke-width="0.5" />
	<text
		x="184"
		y="152"
		font-size="8"
		font-family="monospace"
		fill={color}
		text-anchor="middle"
	>
		master.m3u8
	</text>

	<!-- Step 2: Choose quality and download segments -->
	<line x1="224" y1="149" x2="258" y2="149" stroke={color} stroke-width="1" marker-end="url(#hls-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
	</line>

	<!-- Segment downloads -->
	{#each [0, 1, 2, 3] as i (i)}
		<rect
			x={262 + i * 28}
			y="140"
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
			x={274 + i * 28}
			y="152"
			font-size="6"
			font-family="monospace"
			fill="#94a3b8"
			text-anchor="middle"
		>
			seg{i}
		</text>
	{/each}

	<!-- Adaptive quality switching -->
	<path
		d="M200,170 C200,185 160,185 160,180 C160,175 280,175 280,185 C280,195 240,195 240,190"
		stroke={color}
		stroke-width="1"
		stroke-dasharray="4 2"
		fill="none"
		marker-end="url(#hls-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.7;0.3"
			dur="3s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</path>
	<text x="200" y="196" font-size="8" fill={color} text-anchor="middle">
		↕ quality switches with bandwidth
	</text>

	<!-- Separator -->
	<line
		x1="20"
		y1="208"
		x2="380"
		y2="208"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Label -->
	<text x="200" y="225" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Adaptive streaming — quality adapts to bandwidth
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
