<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 220" class="w-full" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<marker id="sse-arrow-right" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill={color} opacity="0.8" />
		</marker>
		<marker id="sse-arrow-left" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
			<polygon points="8,0 0,3 8,6" fill={color} opacity="0.6" />
		</marker>
	</defs>

	<!-- Client -->
	<rect x="30" y="20" width="90" height="36" rx="6" fill={color} opacity="0.12" stroke={color} stroke-opacity="0.3" stroke-width="1" />
	<text x="75" y="42" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">Browser</text>

	<!-- Server -->
	<rect x="280" y="20" width="90" height="36" rx="6" fill={color} opacity="0.12" stroke={color} stroke-opacity="0.3" stroke-width="1" />
	<text x="325" y="42" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">Server</text>

	<!-- Vertical lifelines -->
	<line x1="75" y1="56" x2="75" y2="185" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
	<line x1="325" y1="56" x2="325" y2="185" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />

	<!-- HTTP GET request -->
	<line x1="80" y1="72" x2="320" y2="72" stroke={color} stroke-width="1.5" marker-end="url(#sse-arrow-right)" stroke-opacity="0.7" />
	<text x="200" y="66" text-anchor="middle" fill="#94a3b8" font-size="9">GET /events (Accept: text/event-stream)</text>

	<!-- Response: keep connection open -->
	<line x1="320" y1="90" x2="80" y2="90" stroke={color} stroke-width="1" marker-end="url(#sse-arrow-left)" stroke-opacity="0.5" stroke-dasharray="4,2" />
	<text x="200" y="86" text-anchor="middle" fill="#94a3b8" font-size="9">200 OK (Content-Type: text/event-stream)</text>

	<!-- Event 1 -->
	<line x1="320" y1="112" x2="80" y2="112" stroke={color} stroke-width="1.5" marker-end="url(#sse-arrow-left)" stroke-opacity="0.8">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
	</line>
	<text x="200" y="107" text-anchor="middle" fill={color} font-size="9" opacity="0.9">data: {`{"type":"update","id":1}`}</text>

	<!-- Event 2 -->
	<line x1="320" y1="135" x2="80" y2="135" stroke={color} stroke-width="1.5" marker-end="url(#sse-arrow-left)" stroke-opacity="0.8">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" begin="1s" repeatCount="indefinite" />
	</line>
	<text x="200" y="130" text-anchor="middle" fill={color} font-size="9" opacity="0.9">data: {`{"type":"update","id":2}`}</text>

	<!-- Event 3 -->
	<line x1="320" y1="158" x2="80" y2="158" stroke={color} stroke-width="1.5" marker-end="url(#sse-arrow-left)" stroke-opacity="0.8">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" begin="2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="153" text-anchor="middle" fill={color} font-size="9" opacity="0.9">data: {`{"type":"update","id":3}`}</text>

	<!-- Connection arrow (persistent) -->
	<line x1="75" y1="170" x2="75" y2="185" stroke={color} stroke-width="2" stroke-opacity="0.3">
		<animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
	</line>

	<!-- Label -->
	<text x="200" y="200" text-anchor="middle" fill="#64748b" font-size="10" font-style="italic">
		Unidirectional — server pushes events over a persistent HTTP connection
	</text>

	<!-- Connection indicator -->
	<rect x="55" y="170" width="40" height="14" rx="3" fill={color} opacity="0.1" />
	<text x="75" y="180" text-anchor="middle" fill={color} font-size="7" opacity="0.7">OPEN</text>
</svg>
