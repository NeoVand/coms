<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
	<defs>
		<marker id="grpc-arrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill={color} />
		</marker>
		<marker id="grpc-arrow-muted" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
			<path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
		</marker>
	</defs>

	<!-- Title row -->
	<text x="200" y="16" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Code Generation Pipeline
	</text>

	<!-- .proto file box -->
	<rect x="10" y="30" width="80" height="55" rx="4" fill="#334155" stroke={color} stroke-width="1" />
	<text x="50" y="48" font-size="9" fill={color} text-anchor="middle" font-weight="600">.proto</text>
	<text x="50" y="60" font-size="7" fill="#94a3b8" text-anchor="middle">service Greeter &lbrace;</text>
	<text x="50" y="70" font-size="7" fill="#94a3b8" text-anchor="middle">rpc SayHello()</text>
	<text x="50" y="80" font-size="7" fill="#94a3b8" text-anchor="middle">&rbrace;</text>

	<!-- Arrow: proto → protoc -->
	<line x1="92" y1="57" x2="138" y2="57" stroke={color} stroke-width="1.5" marker-end="url(#grpc-arrow)">
		<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
	</line>

	<!-- protoc compiler box -->
	<rect x="140" y="36" width="70" height="42" rx="4" fill={color} opacity="0.15" stroke={color} stroke-width="1" />
	<text x="175" y="54" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600">protoc</text>
	<text x="175" y="66" font-size="7" fill="#94a3b8" text-anchor="middle">compiler</text>

	<!-- Arrows: protoc → generated code -->
	<line x1="212" y1="48" x2="260" y2="32" stroke={color} stroke-width="1.5" marker-end="url(#grpc-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
	</line>
	<line x1="212" y1="57" x2="260" y2="57" stroke={color} stroke-width="1.5" marker-end="url(#grpc-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="3s" begin="0.7s" repeatCount="indefinite" />
	</line>
	<line x1="212" y1="66" x2="260" y2="82" stroke={color} stroke-width="1.5" marker-end="url(#grpc-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="3s" begin="0.9s" repeatCount="indefinite" />
	</line>

	<!-- Generated code boxes -->
	<!-- Go -->
	<rect x="262" y="22" width="65" height="20" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="294" y="36" font-size="8" fill="#94a3b8" text-anchor="middle">Go stub</text>

	<!-- Python -->
	<rect x="262" y="47" width="65" height="20" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="294" y="61" font-size="8" fill="#94a3b8" text-anchor="middle">Python stub</text>

	<!-- TypeScript -->
	<rect x="262" y="72" width="65" height="20" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="294" y="86" font-size="8" fill="#94a3b8" text-anchor="middle">TS stub</text>

	<!-- "Type-safe" badge -->
	<rect x="335" y="47" width="55" height="20" rx="3" fill={color} opacity="0.15" />
	<text x="362" y="60" font-size="7" fill={color} text-anchor="middle" font-weight="600">Type-safe</text>

	<!-- Divider -->
	<line x1="10" y1="105" x2="390" y2="105" stroke="#334155" stroke-width="0.5" stroke-dasharray="4 3" />

	<!-- RPC call flow -->
	<text x="200" y="120" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle">
		Typed RPC Call
	</text>

	<!-- Client stub box -->
	<rect x="20" y="130" width="100" height="40" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="70" y="148" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600">Client Stub</text>
	<text x="70" y="162" font-size="7" fill="#94a3b8" text-anchor="middle">greeter.SayHello()</text>

	<!-- Arrow: serialize -->
	<line x1="122" y1="145" x2="148" y2="145" stroke={color} stroke-width="1" marker-end="url(#grpc-arrow)" />
	<text x="135" y="140" font-size="6" fill="#64748b" text-anchor="middle">serialize</text>

	<!-- HTTP/2 transport -->
	<rect x="150" y="133" width="100" height="28" rx="4" fill={color} opacity="0.1" stroke={color} stroke-width="0.5" />
	<text x="200" y="148" font-size="8" fill="#94a3b8" text-anchor="middle">HTTP/2 + Protobuf</text>
	<text x="200" y="158" font-size="7" fill="#64748b" text-anchor="middle">binary, compact</text>

	<!-- Arrow: deserialize -->
	<line x1="252" y1="145" x2="278" y2="145" stroke={color} stroke-width="1" marker-end="url(#grpc-arrow)" />
	<text x="265" y="140" font-size="6" fill="#64748b" text-anchor="middle">deserialize</text>

	<!-- Server box -->
	<rect x="280" y="130" width="100" height="40" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="0.5" />
	<text x="330" y="148" font-size="9" fill="#e2e8f0" text-anchor="middle" font-weight="600">Server Impl</text>
	<text x="330" y="162" font-size="7" fill="#94a3b8" text-anchor="middle">SayHello(request)</text>

	<!-- Response arrow -->
	<line x1="280" y1="175" x2="122" y2="175" stroke={color} stroke-width="1" stroke-dasharray="5 3" marker-end="url(#grpc-arrow)">
		<animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="200" y="188" font-size="8" fill="#94a3b8" text-anchor="middle">HelloReply &lbrace; message: "Hello!" &rbrace;</text>

	<!-- Bottom label -->
	<text x="200" y="220" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
		Define once, generate everywhere — typed RPC
	</text>
</svg>

<style>
	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
