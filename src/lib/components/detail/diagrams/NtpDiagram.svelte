<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="ntp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker
			id="ntp-arrow-back"
			markerWidth="10"
			markerHeight="8"
			refX="10"
			refY="4"
			orient="auto"
		>
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

	<!-- Clock icons -->
	<circle cx="55" cy="28" r="8" fill="none" stroke="#334155" stroke-width="1.5" />
	<line x1="55" y1="28" x2="55" y2="23" stroke="#64748b" stroke-width="1" />
	<line x1="55" y1="28" x2="59" y2="28" stroke="#64748b" stroke-width="1" />
	<text x="55" y="44" font-size="7" fill="#64748b" text-anchor="middle">10:00:00.000</text>

	<circle cx="345" cy="28" r="8" fill="none" stroke={color} stroke-width="1.5" />
	<line x1="345" y1="28" x2="345" y2="23" stroke={color} stroke-width="1" />
	<line x1="345" y1="28" x2="349" y2="28" stroke={color} stroke-width="1" />
	<text x="345" y="44" font-size="7" fill={color} text-anchor="middle">10:00:00.000</text>
	<text x="345" y="52" font-size="6" fill="#64748b" text-anchor="middle">(authoritative)</text>

	<!-- Vertical lifelines -->
	<line x1="55" y1="56" x2="55" y2="150" stroke="#334155" stroke-width="1.5" />
	<line x1="345" y1="56" x2="345" y2="150" stroke="#334155" stroke-width="1.5" />

	<!-- T1: Client sends request -->
	<circle cx="55" cy="68" r="3" fill={color}>
		<animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
	</circle>
	<text x="25" y="72" font-size="8" font-weight="600" fill={color} text-anchor="end">T1</text>
	<text x="25" y="82" font-size="6" fill="#64748b" text-anchor="end">send</text>
	<line x1="58" y1="68" x2="335" y2="88" stroke={color} stroke-width="1.5" marker-end="url(#ntp-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
	</line>
	<text x="200" y="72" font-size="8" fill="#94a3b8" text-anchor="middle">NTP Request</text>

	<!-- T2: Server receives -->
	<circle cx="345" cy="90" r="3" fill={color} opacity="0.8">
		<animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" begin="0.5s" repeatCount="indefinite" />
	</circle>
	<text x="375" y="93" font-size="8" font-weight="600" fill={color} text-anchor="start">T2</text>
	<text x="375" y="103" font-size="6" fill="#64748b" text-anchor="start">recv</text>

	<!-- Server processing time indicator -->
	<line x1="348" y1="93" x2="348" y2="107" stroke="#64748b" stroke-width="0.5" stroke-dasharray="2 1" />
	<text x="360" y="102" font-size="5" fill="#334155">process</text>

	<!-- T3: Server sends response -->
	<circle cx="345" cy="110" r="3" fill={color} opacity="0.7">
		<animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
	</circle>
	<text x="375" y="113" font-size="8" font-weight="600" fill={color} text-anchor="start">T3</text>
	<text x="375" y="123" font-size="6" fill="#64748b" text-anchor="start">send</text>
	<line x1="342" y1="110" x2="65" y2="130" stroke={color} stroke-width="1.5" opacity="0.7" marker-end="url(#ntp-arrow-back)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
	</line>
	<text x="200" y="116" font-size="8" fill="#94a3b8" text-anchor="middle">NTP Response</text>

	<!-- T4: Client receives -->
	<circle cx="55" cy="132" r="3" fill={color} opacity="0.6">
		<animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" begin="1.5s" repeatCount="indefinite" />
	</circle>
	<text x="25" y="135" font-size="8" font-weight="600" fill={color} text-anchor="end">T4</text>
	<text x="25" y="145" font-size="6" fill="#64748b" text-anchor="end">recv</text>

	<!-- Divider -->
	<line
		x1="20"
		y1="156"
		x2="380"
		y2="156"
		stroke="#334155"
		stroke-width="0.5"
		stroke-dasharray="4 3"
	/>

	<!-- Offset calculation -->
	<text x="200" y="170" font-size="9" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Clock Offset Calculation
	</text>

	<!-- Formula box -->
	<rect x="60" y="176" width="280" height="26" rx="4" fill="#334155" />
	<text
		x="200"
		y="192"
		font-size="10"
		font-family="monospace"
		fill={color}
		text-anchor="middle"
	>
		offset = ((T2−T1) + (T3−T4)) / 2
	</text>

	<!-- Explanation -->
	<text x="100" y="212" font-size="7" fill="#94a3b8" text-anchor="middle">
		network delay →
	</text>
	<text x="200" y="212" font-size="7" fill="#94a3b8" text-anchor="middle">
		cancels out
	</text>
	<text x="300" y="212" font-size="7" fill="#94a3b8" text-anchor="middle">
		← server offset
	</text>

	<!-- Clock adjustment visual -->
	<circle cx="55" cy="210" r="5" fill="none" stroke={color} stroke-width="1">
		<animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
		<animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
	</circle>
	<text x="55" y="224" font-size="6" fill={color} text-anchor="middle">adjusted</text>

	<!-- Label -->
	<text x="200" y="236" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Four timestamps to synchronize clocks across the network
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
