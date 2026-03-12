<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Label -->
	<text x="200" y="18" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Single Connection — Multiplexed Streams
	</text>

	<!-- Connection pipe -->
	<rect
		x="30"
		y="35"
		width="340"
		height="110"
		rx="12"
		fill="none"
		stroke="#334155"
		stroke-width="1.5"
	/>
	<rect x="30" y="35" width="340" height="110" rx="12" fill={color} opacity="0.03" />

	<!-- Stream 1 -->
	<rect x="50" y="50" width="0" height="14" rx="3" fill={color} opacity="0.9">
		<animate attributeName="width" values="0;180;0" dur="3s" repeatCount="indefinite" />
		<animate attributeName="x" values="50;50;330" dur="3s" repeatCount="indefinite" />
	</rect>
	<text x="42" y="60" font-size="9" fill="#94a3b8" text-anchor="end">S1</text>

	<!-- Stream 2 -->
	<rect x="80" y="74" width="0" height="14" rx="3" fill={color} opacity="0.65">
		<animate
			attributeName="width"
			values="0;140;0"
			dur="2.5s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
		<animate
			attributeName="x"
			values="80;80;330"
			dur="2.5s"
			begin="0.3s"
			repeatCount="indefinite"
		/>
	</rect>
	<text x="42" y="84" font-size="9" fill="#94a3b8" text-anchor="end">S2</text>

	<!-- Stream 3 -->
	<rect x="60" y="98" width="0" height="14" rx="3" fill={color} opacity="0.45">
		<animate
			attributeName="width"
			values="0;200;0"
			dur="3.5s"
			begin="0.7s"
			repeatCount="indefinite"
		/>
		<animate
			attributeName="x"
			values="60;60;330"
			dur="3.5s"
			begin="0.7s"
			repeatCount="indefinite"
		/>
	</rect>
	<text x="42" y="108" font-size="9" fill="#94a3b8" text-anchor="end">S3</text>

	<!-- Stream 4 -->
	<rect x="70" y="122" width="0" height="14" rx="3" fill={color} opacity="0.3">
		<animate
			attributeName="width"
			values="0;160;0"
			dur="2.8s"
			begin="1s"
			repeatCount="indefinite"
		/>
		<animate attributeName="x" values="70;70;330" dur="2.8s" begin="1s" repeatCount="indefinite" />
	</rect>
	<text x="42" y="132" font-size="9" fill="#94a3b8" text-anchor="end">S4</text>

	<!-- Arrows showing direction -->
	<polygon points="380,90 370,82 370,98" fill="#334155" />

	<!-- Labels -->
	<text
		x="16"
		y="95"
		font-size="10"
		fill="#94a3b8"
		text-anchor="middle"
		transform="rotate(-90 16 95)"
	>
		Client
	</text>
	<text
		x="392"
		y="95"
		font-size="10"
		fill="#94a3b8"
		text-anchor="middle"
		transform="rotate(90 392 95)"
	>
		Server
	</text>

	<text x="200" y="175" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		All streams share one connection — no blocking
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
