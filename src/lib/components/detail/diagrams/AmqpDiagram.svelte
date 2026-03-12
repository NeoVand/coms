<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="amqp-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="amqp-arrow-s1" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Title -->
	<text x="200" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Exchange → Routing → Queue → Consumer
	</text>

	<!-- Producer box -->
	<rect x="10" y="60" width="60" height="70" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="40" y="82" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Producer
	</text>
	<text x="40" y="96" font-size="7" fill="#94a3b8" text-anchor="middle">publishes</text>
	<text x="40" y="108" font-size="7" fill="#94a3b8" text-anchor="middle">messages</text>

	<!-- Arrow: Producer → Exchange -->
	<line x1="72" y1="95" x2="118" y2="95" stroke={color} stroke-width="1.5" marker-end="url(#amqp-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
	</line>

	<!-- Exchange box (central) -->
	<rect x="120" y="50" width="80" height="90" rx="6" fill={color} opacity="0.12" stroke={color} stroke-width="1" />
	<text x="160" y="68" font-size="10" fill={color} text-anchor="middle" font-weight="700">
		Exchange
	</text>

	<!-- Routing rules inside exchange -->
	<rect x="128" y="76" width="64" height="16" rx="2" fill="#334155" />
	<text x="160" y="88" font-size="7" fill="#94a3b8" text-anchor="middle">direct</text>

	<rect x="128" y="96" width="64" height="16" rx="2" fill="#334155" />
	<text x="160" y="108" font-size="7" fill="#94a3b8" text-anchor="middle">topic</text>

	<rect x="128" y="116" width="64" height="16" rx="2" fill="#334155" />
	<text x="160" y="128" font-size="7" fill="#94a3b8" text-anchor="middle">fanout</text>

	<!-- Routing key label -->
	<text x="160" y="48" font-size="7" fill="#64748b" text-anchor="middle" font-style="italic">
		routing rules
	</text>

	<!-- Arrows: Exchange → Queues -->
	<!-- Direct route -->
	<line x1="202" y1="84" x2="248" y2="55" stroke={color} stroke-width="1" marker-end="url(#amqp-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
	</line>

	<!-- Topic route -->
	<line x1="202" y1="104" x2="248" y2="95" stroke={color} stroke-width="1" marker-end="url(#amqp-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
	</line>

	<!-- Fanout route -->
	<line x1="202" y1="124" x2="248" y2="135" stroke={color} stroke-width="1" marker-end="url(#amqp-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
	</line>

	<!-- Queue 1 -->
	<rect x="250" y="38" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="277" y="50" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Queue 1
	</text>
	<text x="277" y="62" font-size="6" fill="#64748b" text-anchor="middle">orders.*</text>

	<!-- Queue 2 -->
	<rect x="250" y="78" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="277" y="90" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Queue 2
	</text>
	<text x="277" y="102" font-size="6" fill="#64748b" text-anchor="middle">logs.#</text>

	<!-- Queue 3 -->
	<rect x="250" y="118" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="277" y="130" font-size="8" fill="#e2e8f0" text-anchor="middle" font-weight="600">
		Queue 3
	</text>
	<text x="277" y="142" font-size="6" fill="#64748b" text-anchor="middle">broadcast</text>

	<!-- Arrows: Queue → Consumer -->
	<line x1="307" y1="53" x2="335" y2="53" stroke="#94a3b8" stroke-width="1" marker-end="url(#amqp-arrow-s1)" />
	<line x1="307" y1="93" x2="335" y2="93" stroke="#94a3b8" stroke-width="1" marker-end="url(#amqp-arrow-s1)" />
	<line x1="307" y1="133" x2="335" y2="133" stroke="#94a3b8" stroke-width="1" marker-end="url(#amqp-arrow-s1)" />

	<!-- Consumer 1 -->
	<rect x="337" y="38" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="364" y="56" font-size="7" fill="#94a3b8" text-anchor="middle">Consumer 1</text>

	<!-- Consumer 2 -->
	<rect x="337" y="78" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="364" y="96" font-size="7" fill="#94a3b8" text-anchor="middle">Consumer 2</text>

	<!-- Consumer 3 -->
	<rect x="337" y="118" width="55" height="30" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="364" y="136" font-size="7" fill="#94a3b8" text-anchor="middle">Consumer 3</text>

	<!-- Flow description -->
	<text x="200" y="170" font-size="8" fill="#94a3b8" text-anchor="middle">
		Messages are routed based on binding keys and patterns
	</text>

	<!-- Key features -->
	<rect x="30" y="180" width="100" height="22" rx="3" fill={color} opacity="0.08" />
	<text x="80" y="194" font-size="7" fill={color} text-anchor="middle">Durable queues</text>

	<rect x="150" y="180" width="100" height="22" rx="3" fill={color} opacity="0.08" />
	<text x="200" y="194" font-size="7" fill={color} text-anchor="middle">Message ACKs</text>

	<rect x="270" y="180" width="100" height="22" rx="3" fill={color} opacity="0.08" />
	<text x="320" y="194" font-size="7" fill={color} text-anchor="middle">Dead-letter exchange</text>

	<!-- Bottom label -->
	<text x="200" y="224" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Exchanges route messages to queues by rules
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
