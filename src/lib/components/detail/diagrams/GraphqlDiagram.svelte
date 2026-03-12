<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="gql-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="gql-arrow-muted" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#64748b" />
		</marker>
		<marker id="gql-arrow-back" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Section headers -->
	<text x="95" y="16" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">
		REST (3 requests)
	</text>
	<text x="305" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		GraphQL (1 query)
	</text>

	<!-- Divider -->
	<line
		x1="198"
		y1="8"
		x2="198"
		y2="195"
		stroke="#334155"
		stroke-width="1"
		stroke-dasharray="4 3"
	/>

	<!-- === LEFT: REST === -->
	<text x="25" y="34" font-size="9" fill="#94a3b8">Client</text>
	<text x="140" y="34" font-size="9" fill="#94a3b8">Server</text>

	<!-- Request 1 -->
	<line
		x1="40"
		y1="46"
		x2="135"
		y2="46"
		stroke="#64748b"
		stroke-width="1"
		marker-end="url(#gql-arrow-muted)"
	/>
	<text x="88" y="42" font-size="7" fill="#64748b" text-anchor="middle">GET /user</text>
	<line
		x1="155"
		y1="54"
		x2="60"
		y2="54"
		stroke="#94a3b8"
		stroke-width="1"
		stroke-dasharray="3 2"
		marker-end="url(#gql-arrow-back)"
	/>
	<rect
		x="140"
		y="40"
		width="48"
		height="20"
		rx="3"
		fill="#334155"
		stroke="#334155"
		stroke-width="0.5"
	/>
	<text x="164" y="53" font-size="7" fill="#94a3b8" text-anchor="middle">user{'{}'}</text>

	<!-- Request 2 -->
	<line
		x1="40"
		y1="76"
		x2="135"
		y2="76"
		stroke="#64748b"
		stroke-width="1"
		marker-end="url(#gql-arrow-muted)"
	/>
	<text x="88" y="72" font-size="7" fill="#64748b" text-anchor="middle">GET /posts</text>
	<line
		x1="155"
		y1="84"
		x2="60"
		y2="84"
		stroke="#94a3b8"
		stroke-width="1"
		stroke-dasharray="3 2"
		marker-end="url(#gql-arrow-back)"
	/>
	<rect
		x="140"
		y="70"
		width="48"
		height="20"
		rx="3"
		fill="#334155"
		stroke="#334155"
		stroke-width="0.5"
	/>
	<text x="164" y="83" font-size="7" fill="#94a3b8" text-anchor="middle">posts[]</text>

	<!-- Request 3 -->
	<line
		x1="40"
		y1="106"
		x2="135"
		y2="106"
		stroke="#64748b"
		stroke-width="1"
		marker-end="url(#gql-arrow-muted)"
	/>
	<text x="88" y="102" font-size="7" fill="#64748b" text-anchor="middle">GET /comments</text>
	<line
		x1="155"
		y1="114"
		x2="60"
		y2="114"
		stroke="#94a3b8"
		stroke-width="1"
		stroke-dasharray="3 2"
		marker-end="url(#gql-arrow-back)"
	/>
	<rect
		x="140"
		y="100"
		width="48"
		height="20"
		rx="3"
		fill="#334155"
		stroke="#334155"
		stroke-width="0.5"
	/>
	<text x="164" y="113" font-size="7" fill="#94a3b8" text-anchor="middle">cmts[]</text>

	<!-- Over-fetching warning -->
	<text x="95" y="138" font-size="8" fill="#ef4444" text-anchor="middle" font-weight="600">
		3 round trips
	</text>
	<text x="95" y="150" font-size="7" fill="#ef4444" text-anchor="middle" opacity="0.7">
		+ unused fields returned
	</text>

	<!-- REST bracket for 3 reqs -->
	<line x1="15" y1="42" x2="15" y2="118" stroke="#64748b" stroke-width="1" />
	<line x1="15" y1="42" x2="20" y2="42" stroke="#64748b" stroke-width="1" />
	<line x1="15" y1="118" x2="20" y2="118" stroke="#64748b" stroke-width="1" />

	<!-- === RIGHT: GraphQL === -->
	<text x="225" y="34" font-size="9" fill="#94a3b8">Client</text>
	<text x="370" y="34" font-size="9" fill="#94a3b8">Server</text>

	<!-- Single query box -->
	<rect
		x="222"
		y="42"
		width="90"
		height="66"
		rx="4"
		fill={color}
		opacity="0.08"
		stroke={color}
		stroke-width="0.5"
	/>
	<text x="232" y="55" font-size="7" fill={color} font-weight="600">query &lbrace;</text>
	<text x="240" y="66" font-size="7" fill="#94a3b8">user &lbrace; name &rbrace;</text>
	<text x="240" y="77" font-size="7" fill="#94a3b8">posts &lbrace; title &rbrace;</text>
	<text x="240" y="88" font-size="7" fill="#94a3b8">comments &lbrace; body &rbrace;</text>
	<text x="232" y="103" font-size="7" fill={color} font-weight="600">&rbrace;</text>

	<!-- Single arrow out -->
	<line
		x1="314"
		y1="72"
		x2="352"
		y2="72"
		stroke={color}
		stroke-width="1.5"
		marker-end="url(#gql-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.4;1;0.4"
			dur="2.5s"
			repeatCount="indefinite"
		/>
	</line>

	<!-- Server resolves -->
	<rect
		x="354"
		y="46"
		width="38"
		height="58"
		rx="4"
		fill="#334155"
		stroke={color}
		stroke-width="0.5"
	/>
	<text
		x="373"
		y="78"
		font-size="7"
		fill="#94a3b8"
		text-anchor="middle"
		transform="rotate(-90 373 78)"
	>
		Resolver
	</text>

	<!-- Single response -->
	<line
		x1="353"
		y1="115"
		x2="260"
		y2="115"
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="5 3"
		marker-end="url(#gql-arrow)"
	>
		<animate
			attributeName="stroke-opacity"
			values="0.3;0.9;0.3"
			dur="2.5s"
			begin="0.5s"
			repeatCount="indefinite"
		/>
	</line>

	<!-- Response data box -->
	<rect
		x="222"
		y="122"
		width="130"
		height="40"
		rx="4"
		fill={color}
		opacity="0.08"
		stroke={color}
		stroke-width="0.5"
	/>
	<text x="232" y="135" font-size="7" fill={color} font-weight="600">&lbrace; data:</text>
	<text x="240" y="146" font-size="7" fill="#94a3b8">user, posts, comments</text>
	<text x="232" y="157" font-size="7" fill={color} font-weight="600">&rbrace;</text>

	<!-- 1 request badge -->
	<rect x="360" y="118" width="32" height="16" rx="3" fill={color} opacity="0.15" />
	<text x="376" y="129" font-size="7" fill={color} text-anchor="middle" font-weight="600">
		1 req
	</text>

	<!-- Exact data label -->
	<text x="305" y="180" font-size="8" fill={color} text-anchor="middle" font-weight="600">
		Only requested fields
	</text>

	<!-- Bottom label -->
	<text x="200" y="210" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		One query, exact data — no over-fetching
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
