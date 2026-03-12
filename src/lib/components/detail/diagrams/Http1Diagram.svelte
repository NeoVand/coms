<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<!-- Timeline label -->
	<text x="20" y="18" font-size="10" fill="#64748b" font-style="italic">Sequential / Blocking</text>

	<!-- Timeline axis -->
	<line x1="50" y1="30" x2="50" y2="210" stroke="#334155" stroke-width="1" />
	<text x="46" y="215" font-size="9" fill="#475569" text-anchor="end">time</text>
	<polygon points="50,210 46,200 54,200" fill="#334155" />

	<!-- Request/Response pair 1 -->
	<rect x="80" y="32" width="120" height="18" rx="3" fill={color} opacity="0.85">
		<animate attributeName="opacity" values="0.6;0.85;0.6" dur="4s" repeatCount="indefinite" />
	</rect>
	<text x="140" y="45" font-size="9" fill="white" text-anchor="middle" font-weight="500">
		Request 1
	</text>
	<rect x="220" y="32" width="100" height="18" rx="3" fill="#334155" opacity="0.8" />
	<text x="270" y="45" font-size="9" fill="#94a3b8" text-anchor="middle">Response 1</text>

	<!-- Blocking indicator -->
	<line
		x1="70"
		y1="56"
		x2="70"
		y2="72"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="2 2"
	/>
	<text x="75" y="67" font-size="8" fill="#ef4444" opacity="0.7">blocked</text>

	<!-- Request/Response pair 2 -->
	<rect x="80" y="75" width="120" height="18" rx="3" fill={color} opacity="0.65">
		<animate
			attributeName="opacity"
			values="0.45;0.65;0.45"
			dur="4s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</rect>
	<text x="140" y="88" font-size="9" fill="white" text-anchor="middle" font-weight="500">
		Request 2
	</text>
	<rect x="220" y="75" width="100" height="18" rx="3" fill="#334155" opacity="0.8" />
	<text x="270" y="88" font-size="9" fill="#94a3b8" text-anchor="middle">Response 2</text>

	<!-- Blocking indicator -->
	<line
		x1="70"
		y1="99"
		x2="70"
		y2="115"
		stroke="#475569"
		stroke-width="1"
		stroke-dasharray="2 2"
	/>
	<text x="75" y="110" font-size="8" fill="#ef4444" opacity="0.7">blocked</text>

	<!-- Request/Response pair 3 -->
	<rect x="80" y="118" width="120" height="18" rx="3" fill={color} opacity="0.45">
		<animate
			attributeName="opacity"
			values="0.3;0.45;0.3"
			dur="4s"
			begin="1s"
			repeatCount="indefinite"
		/>
	</rect>
	<text x="140" y="131" font-size="9" fill="white" text-anchor="middle" font-weight="500">
		Request 3
	</text>
	<rect x="220" y="118" width="100" height="18" rx="3" fill="#334155" opacity="0.8" />
	<text x="270" y="131" font-size="9" fill="#94a3b8" text-anchor="middle">Response 3</text>

	<!-- Legend -->
	<rect x="80" y="160" width="12" height="12" rx="2" fill={color} opacity="0.7" />
	<text x="98" y="170" font-size="9" fill="#94a3b8">Request</text>
	<rect x="160" y="160" width="12" height="12" rx="2" fill="#334155" />
	<text x="178" y="170" font-size="9" fill="#94a3b8">Response</text>

	<text x="200" y="200" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Head-of-line blocking: each request waits for the previous
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
