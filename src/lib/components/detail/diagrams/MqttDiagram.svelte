<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Publisher -->
	<rect
		x="15"
		y="72"
		width="70"
		height="50"
		rx="8"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="50" y="92" font-size="10" fill="#e2e8f0" text-anchor="middle" font-weight="500">
		Publisher
	</text>
	<text x="50" y="108" font-size="8" fill="#64748b" text-anchor="middle"> (Sensor) </text>

	<!-- Publish arrow -->
	<line x1="85" y1="97" x2="148" y2="97" stroke={color} stroke-width="2">
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="2.5s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="148,97 140,92 140,102" fill={color}>
		<animate
			attributeName="fill-opacity"
			values="0.4;1;0.4"
			dur="2.5s"
			repeatCount="indefinite"
		/>
	</polygon>

	<!-- Topic label on publish arrow -->
	<rect x="95" y="78" width="48" height="14" rx="3" fill={color} opacity="0.15" />
	<text x="119" y="88" font-size="7" fill={color} text-anchor="middle" font-weight="500">
		sensor/temp
	</text>

	<!-- Broker (central circle) -->
	<circle
		cx="200"
		cy="97"
		r="42"
		fill={color}
		fill-opacity="0.06"
		stroke={color}
		stroke-width="1.5"
		stroke-opacity="0.5"
	/>
	<text x="200" y="93" font-size="11" fill={color} text-anchor="middle" font-weight="600">
		Broker
	</text>
	<text x="200" y="106" font-size="8" fill="#64748b" text-anchor="middle"> (MQTT) </text>

	<!-- Fan-out arrows and subscribers -->
	<!-- Subscriber 1 -->
	<line x1="242" y1="80" x2="300" y2="40" stroke={color} stroke-width="1.5" opacity="0.8">
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.8;0.3"
			dur="2.5s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="300,40 292,38 294,46" fill={color} opacity="0.8" />
	<rect
		x="305"
		y="22"
		width="75"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="342" y="38" font-size="9" fill="#e2e8f0" text-anchor="middle">Subscriber 1</text>
	<text x="342" y="50" font-size="7" fill="#64748b" text-anchor="middle">Dashboard</text>

	<!-- Subscriber 2 -->
	<line x1="242" y1="97" x2="300" y2="97" stroke={color} stroke-width="1.5" opacity="0.6">
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.6;0.3"
			dur="2.5s"
			begin="0.7s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="300,97 292,92 292,102" fill={color} opacity="0.6" />
	<rect
		x="305"
		y="79"
		width="75"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="342" y="95" font-size="9" fill="#e2e8f0" text-anchor="middle">Subscriber 2</text>
	<text x="342" y="107" font-size="7" fill="#64748b" text-anchor="middle">Logger</text>

	<!-- Subscriber 3 -->
	<line x1="242" y1="114" x2="300" y2="154" stroke={color} stroke-width="1.5" opacity="0.4">
		<animate
			attributeName="stroke-opacity"
			values="0.2;0.4;0.2"
			dur="2.5s"
			begin="0.9s"
			repeatCount="indefinite"
		/>
	</line>
	<polygon points="300,154 292,150 294,158" fill={color} opacity="0.4" />
	<rect
		x="305"
		y="136"
		width="75"
		height="36"
		rx="6"
		fill="none"
		stroke="#475569"
		stroke-width="1.5"
	/>
	<text x="342" y="152" font-size="9" fill="#e2e8f0" text-anchor="middle">Subscriber 3</text>
	<text x="342" y="164" font-size="7" fill="#64748b" text-anchor="middle">Alert Svc</text>

	<!-- Bottom label -->
	<text x="200" y="200" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Publish/Subscribe: decoupled message fan-out via topics
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
