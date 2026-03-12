<script lang="ts">
	let { protocolId, color }: { protocolId: string; color: string } = $props();
</script>

{#if protocolId === 'tcp'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- Client and Server labels -->
			<text x="60" y="20" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
				Client
			</text>
			<text x="340" y="20" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
				Server
			</text>

			<!-- Vertical lifelines -->
			<line x1="60" y1="28" x2="60" y2="210" stroke="#334155" stroke-width="1.5" />
			<line x1="340" y1="28" x2="340" y2="210" stroke="#334155" stroke-width="1.5" />

			<!-- SYN arrow -->
			<line x1="60" y1="55" x2="340" y2="85" stroke={color} stroke-width="2">
				<animate
					attributeName="stroke-opacity"
					values="0.4;1;0.4"
					dur="3s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="340,85 326,78 328,86" fill={color}>
				<animate
					attributeName="fill-opacity"
					values="0.4;1;0.4"
					dur="3s"
					repeatCount="indefinite"
				/>
			</polygon>
			<text x="200" y="62" font-size="11" fill="#94a3b8" text-anchor="middle">SYN</text>

			<!-- SYN-ACK arrow -->
			<line x1="340" y1="95" x2="60" y2="125" stroke={color} stroke-width="2" opacity="0.8">
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.8;0.3"
					dur="3s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="60,125 74,118 72,126" fill={color} opacity="0.8">
				<animate
					attributeName="fill-opacity"
					values="0.3;0.8;0.3"
					dur="3s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</polygon>
			<text x="200" y="102" font-size="11" fill="#94a3b8" text-anchor="middle">SYN-ACK</text>

			<!-- ACK arrow -->
			<line x1="60" y1="135" x2="340" y2="165" stroke={color} stroke-width="2" opacity="0.6">
				<animate
					attributeName="stroke-opacity"
					values="0.2;0.6;0.2"
					dur="3s"
					begin="1s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="340,165 326,158 328,166" fill={color} opacity="0.6">
				<animate
					attributeName="fill-opacity"
					values="0.2;0.6;0.2"
					dur="3s"
					begin="1s"
					repeatCount="indefinite"
				/>
			</polygon>
			<text x="200" y="142" font-size="11" fill="#94a3b8" text-anchor="middle">ACK</text>

			<!-- Data transfer dashed line -->
			<line
				x1="60"
				y1="185"
				x2="340"
				y2="185"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="6 4"
				opacity="0.4"
			/>
			<text x="200" y="205" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
				Data Transfer Established
			</text>
		</svg>
	</section>
{:else if protocolId === 'http1'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- Timeline label -->
			<text x="20" y="18" font-size="10" fill="#64748b" font-style="italic"
				>Sequential / Blocking</text
			>

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
	</section>
{:else if protocolId === 'http2'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
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
				<animate
					attributeName="x"
					values="70;70;330"
					dur="2.8s"
					begin="1s"
					repeatCount="indefinite"
				/>
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
	</section>
{:else if protocolId === 'websockets'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- Client and Server labels -->
			<text x="60" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
				Client
			</text>
			<text x="340" y="18" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
				Server
			</text>

			<!-- HTTP Upgrade handshake -->
			<rect
				x="40"
				y="26"
				width="320"
				height="52"
				rx="6"
				fill="none"
				stroke="#475569"
				stroke-width="1"
				stroke-dasharray="4 3"
			/>
			<text x="200" y="24" font-size="8" fill="#64748b" text-anchor="middle">
				<tspan dx="-30">HTTP Upgrade</tspan>
			</text>

			<!-- Upgrade request -->
			<line x1="60" y1="42" x2="340" y2="42" stroke="#94a3b8" stroke-width="1.5" />
			<polygon points="340,42 330,37 330,47" fill="#94a3b8" />
			<text x="200" y="38" font-size="9" fill="#94a3b8" text-anchor="middle">
				Upgrade: websocket
			</text>

			<!-- 101 Switching -->
			<line x1="340" y1="62" x2="60" y2="62" stroke="#94a3b8" stroke-width="1.5" />
			<polygon points="60,62 70,57 70,67" fill="#94a3b8" />
			<text x="200" y="58" font-size="9" fill="#94a3b8" text-anchor="middle">
				101 Switching Protocols
			</text>

			<!-- Persistent connection pipe -->
			<rect
				x="50"
				y="90"
				width="300"
				height="80"
				rx="10"
				fill={color}
				fill-opacity="0.06"
				stroke={color}
				stroke-width="1.5"
				stroke-opacity="0.4"
			/>
			<text x="200" y="88" font-size="9" fill={color} text-anchor="middle" opacity="0.7">
				Persistent Full-Duplex Connection
			</text>

			<!-- Bidirectional arrows going right -->
			<g>
				<line x1="60" y1="115" x2="340" y2="115" stroke={color} stroke-width="1.5" opacity="0.7" />
				<polygon points="340,115 330,110 330,120" fill={color} opacity="0.7" />
				<circle cx="0" cy="115" r="3" fill={color} opacity="0.9">
					<animate attributeName="cx" values="60;340" dur="2s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.9;0.3" dur="2s" repeatCount="indefinite" />
				</circle>
			</g>

			<!-- Bidirectional arrows going left -->
			<g>
				<line x1="340" y1="140" x2="60" y2="140" stroke={color} stroke-width="1.5" opacity="0.5" />
				<polygon points="60,140 70,135 70,145" fill={color} opacity="0.5" />
				<circle cx="0" cy="140" r="3" fill={color} opacity="0.9">
					<animate
						attributeName="cx"
						values="340;60"
						dur="1.8s"
						begin="0.4s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.9;0.3"
						dur="1.8s"
						begin="0.4s"
						repeatCount="indefinite"
					/>
				</circle>
			</g>

			<!-- Message labels -->
			<text x="200" y="110" font-size="8" fill="#94a3b8" text-anchor="middle">messages</text>
			<text x="200" y="155" font-size="8" fill="#94a3b8" text-anchor="middle">messages</text>

			<text x="200" y="200" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
				Low-latency bidirectional communication
			</text>
		</svg>
	</section>
{:else if protocolId === 'tls'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- Plaintext box -->
			<rect
				x="20"
				y="55"
				width="90"
				height="80"
				rx="8"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="65" y="50" font-size="10" fill="#94a3b8" text-anchor="middle">Plaintext</text>
			<text x="65" y="85" font-size="20" text-anchor="middle" fill="#94a3b8">Aa</text>
			<text x="65" y="110" font-size="8" fill="#64748b" text-anchor="middle"> Hello World </text>
			<text x="65" y="122" font-size="8" fill="#64748b" text-anchor="middle"> readable data </text>

			<!-- Arrow: plaintext to encryption -->
			<line x1="115" y1="95" x2="148" y2="95" stroke={color} stroke-width="1.5">
				<animate
					attributeName="stroke-opacity"
					values="0.4;1;0.4"
					dur="3s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="148,95 140,90 140,100" fill={color}>
				<animate
					attributeName="fill-opacity"
					values="0.4;1;0.4"
					dur="3s"
					repeatCount="indefinite"
				/>
			</polygon>

			<!-- Encryption box -->
			<rect
				x="152"
				y="45"
				width="96"
				height="100"
				rx="10"
				fill={color}
				fill-opacity="0.08"
				stroke={color}
				stroke-width="1.5"
				stroke-opacity="0.5"
			/>
			<text x="200" y="38" font-size="10" fill={color} text-anchor="middle" font-weight="500">
				TLS Encryption
			</text>

			<!-- Lock icon -->
			<rect
				x="186"
				y="78"
				width="28"
				height="22"
				rx="4"
				fill="none"
				stroke={color}
				stroke-width="1.5"
			/>
			<path d="M192 78 V72 A8 8 0 0 1 208 72 V78" fill="none" stroke={color} stroke-width="1.5" />
			<circle cx="200" cy="90" r="2.5" fill={color} />
			<line x1="200" y1="92" x2="200" y2="96" stroke={color} stroke-width="1.5" />

			<!-- Key exchange label -->
			<text x="200" y="120" font-size="8" fill="#64748b" text-anchor="middle"> Key Exchange </text>
			<text x="200" y="132" font-size="8" fill="#64748b" text-anchor="middle">
				+ Cipher Suite
			</text>

			<!-- Arrow: encryption to ciphertext -->
			<line x1="252" y1="95" x2="285" y2="95" stroke={color} stroke-width="1.5">
				<animate
					attributeName="stroke-opacity"
					values="0.4;1;0.4"
					dur="3s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="285,95 277,90 277,100" fill={color}>
				<animate
					attributeName="fill-opacity"
					values="0.4;1;0.4"
					dur="3s"
					begin="0.5s"
					repeatCount="indefinite"
				/>
			</polygon>

			<!-- Ciphertext box -->
			<rect
				x="290"
				y="55"
				width="90"
				height="80"
				rx="8"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="335" y="50" font-size="10" fill="#94a3b8" text-anchor="middle">Ciphertext</text>
			<text
				x="335"
				y="85"
				font-size="14"
				text-anchor="middle"
				fill="#94a3b8"
				font-family="monospace"
			>
				%#@!
			</text>
			<text x="335" y="110" font-size="8" fill="#64748b" text-anchor="middle"> x9Fk2..mQ7 </text>
			<text x="335" y="122" font-size="8" fill="#64748b" text-anchor="middle">
				encrypted data
			</text>

			<!-- Bottom label -->
			<text x="200" y="175" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
				Data encrypted in transit — unreadable without the key
			</text>
		</svg>
	</section>
{:else if protocolId === 'dns'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- Browser -->
			<rect
				x="10"
				y="95"
				width="60"
				height="36"
				rx="6"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<circle cx="40" cy="104" r="8" fill="none" stroke="#94a3b8" stroke-width="1.5" />
			<ellipse cx="40" cy="104" rx="3" ry="8" fill="none" stroke="#94a3b8" stroke-width="1" />
			<line x1="32" y1="104" x2="48" y2="104" stroke="#94a3b8" stroke-width="1" />
			<text x="40" y="122" font-size="7" fill="#94a3b8" text-anchor="middle">Browser</text>

			<!-- Recursive Resolver -->
			<rect
				x="100"
				y="85"
				width="72"
				height="52"
				rx="8"
				fill={color}
				fill-opacity="0.08"
				stroke={color}
				stroke-width="1.5"
				stroke-opacity="0.5"
			/>
			<text x="136" y="108" font-size="9" fill={color} text-anchor="middle" font-weight="500">
				Recursive
			</text>
			<text x="136" y="120" font-size="9" fill={color} text-anchor="middle" font-weight="500">
				Resolver
			</text>

			<!-- Root Server -->
			<rect
				x="230"
				y="15"
				width="66"
				height="36"
				rx="6"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="263" y="31" font-size="8" fill="#94a3b8" text-anchor="middle">Root</text>
			<text x="263" y="42" font-size="8" fill="#94a3b8" text-anchor="middle">Server (.)</text>

			<!-- TLD Server -->
			<rect
				x="316"
				y="75"
				width="72"
				height="36"
				rx="6"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="352" y="91" font-size="8" fill="#94a3b8" text-anchor="middle">TLD Server</text>
			<text x="352" y="102" font-size="8" fill="#94a3b8" text-anchor="middle">(.com)</text>

			<!-- Authoritative Server -->
			<rect
				x="310"
				y="145"
				width="80"
				height="36"
				rx="6"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="350" y="159" font-size="8" fill="#94a3b8" text-anchor="middle">Authoritative</text>
			<text x="350" y="170" font-size="8" fill="#94a3b8" text-anchor="middle">Server</text>

			<!-- Query: Browser to Resolver -->
			<line x1="70" y1="108" x2="98" y2="108" stroke={color} stroke-width="1.5">
				<animate
					attributeName="stroke-opacity"
					values="0.4;1;0.4"
					dur="4s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="98,108 90,104 90,112" fill={color} />
			<text x="84" y="100" font-size="7" fill="#94a3b8" text-anchor="middle">?</text>

			<!-- Resolver to Root -->
			<line
				x1="156"
				y1="85"
				x2="228"
				y2="40"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="4 3"
				opacity="0.6"
			>
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.6;0.3"
					dur="4s"
					begin="0.3s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="228,40 219,38 222,46" fill={color} opacity="0.6" />

			<!-- Root to Resolver (response) -->
			<line
				x1="230"
				y1="48"
				x2="162"
				y2="88"
				stroke="#475569"
				stroke-width="1"
				stroke-dasharray="3 3"
				opacity="0.5"
			/>

			<!-- Resolver to TLD -->
			<line
				x1="172"
				y1="100"
				x2="314"
				y2="88"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="4 3"
				opacity="0.6"
			>
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.6;0.3"
					dur="4s"
					begin="0.6s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="314,88 306,84 306,92" fill={color} opacity="0.6" />

			<!-- TLD to Resolver (response) -->
			<line
				x1="316"
				y1="105"
				x2="172"
				y2="116"
				stroke="#475569"
				stroke-width="1"
				stroke-dasharray="3 3"
				opacity="0.5"
			/>

			<!-- Resolver to Authoritative -->
			<line
				x1="168"
				y1="130"
				x2="308"
				y2="158"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="4 3"
				opacity="0.6"
			>
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.6;0.3"
					dur="4s"
					begin="0.9s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="308,158 300,153 300,161" fill={color} opacity="0.6" />

			<!-- Authoritative to Resolver (response with IP) -->
			<line x1="310" y1="175" x2="168" y2="135" stroke={color} stroke-width="1.5" opacity="0.8">
				<animate
					attributeName="stroke-opacity"
					values="0.4;0.8;0.4"
					dur="4s"
					begin="1.2s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="168,135 176,130 176,138" fill={color} opacity="0.8" />

			<!-- Response: Resolver to Browser -->
			<line x1="100" y1="118" x2="72" y2="118" stroke={color} stroke-width="1.5" opacity="0.9">
				<animate
					attributeName="stroke-opacity"
					values="0.4;0.9;0.4"
					dur="4s"
					begin="1.5s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="72,118 80,114 80,122" fill={color} opacity="0.9" />
			<text x="84" y="130" font-size="7" fill={color} text-anchor="middle">IP</text>

			<!-- Step numbers -->
			<circle cx="84" cy="105" r="6" fill={color} opacity="0.2" />
			<text x="84" y="108" font-size="7" fill={color} text-anchor="middle" font-weight="600">1</text
			>

			<circle cx="192" cy="60" r="6" fill={color} opacity="0.2" />
			<text x="192" y="63" font-size="7" fill={color} text-anchor="middle" font-weight="600">2</text
			>

			<circle cx="244" cy="96" r="6" fill={color} opacity="0.2" />
			<text x="244" y="99" font-size="7" fill={color} text-anchor="middle" font-weight="600">3</text
			>

			<circle cx="240" cy="150" r="6" fill={color} opacity="0.2" />
			<text x="240" y="153" font-size="7" fill={color} text-anchor="middle" font-weight="600"
				>4</text
			>

			<circle cx="84" cy="125" r="6" fill={color} opacity="0.2" />
			<text x="84" y="128" font-size="7" fill={color} text-anchor="middle" font-weight="600">5</text
			>

			<!-- Bottom label -->
			<text x="200" y="215" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
				Iterative resolution: domain name → IP address
			</text>
		</svg>
	</section>
{:else if protocolId === 'mqtt'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
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
	</section>
{:else if protocolId === 'webrtc'}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">How It Works</h3>
		<svg viewBox="0 0 400 230" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
			<!-- STUN/TURN Server at top -->
			<rect
				x="145"
				y="10"
				width="110"
				height="40"
				rx="8"
				fill="none"
				stroke="#475569"
				stroke-width="1.5"
			/>
			<text x="200" y="28" font-size="9" fill="#94a3b8" text-anchor="middle">STUN / TURN</text>
			<text x="200" y="40" font-size="9" fill="#94a3b8" text-anchor="middle">Server</text>

			<!-- Signaling label -->
			<text x="200" y="68" font-size="8" fill="#64748b" text-anchor="middle" font-style="italic">
				Signaling &amp; NAT Traversal
			</text>

			<!-- Dashed arrow: Peer A to STUN -->
			<line
				x1="80"
				y1="145"
				x2="158"
				y2="52"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="5 3"
				opacity="0.5"
			>
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.5;0.3"
					dur="3s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="158,52 150,54 154,62" fill={color} opacity="0.5" />

			<!-- Dashed arrow: Peer B to STUN -->
			<line
				x1="320"
				y1="145"
				x2="242"
				y2="52"
				stroke={color}
				stroke-width="1.5"
				stroke-dasharray="5 3"
				opacity="0.5"
			>
				<animate
					attributeName="stroke-opacity"
					values="0.3;0.5;0.3"
					dur="3s"
					begin="0.3s"
					repeatCount="indefinite"
				/>
			</line>
			<polygon points="242,52 246,62 250,54" fill={color} opacity="0.5" />

			<!-- Dashed arrow: STUN to Peer A -->
			<line
				x1="152"
				y1="50"
				x2="75"
				y2="140"
				stroke="#475569"
				stroke-width="1"
				stroke-dasharray="3 3"
				opacity="0.4"
			/>
			<!-- Dashed arrow: STUN to Peer B -->
			<line
				x1="248"
				y1="50"
				x2="325"
				y2="140"
				stroke="#475569"
				stroke-width="1"
				stroke-dasharray="3 3"
				opacity="0.4"
			/>

			<!-- ICE candidates labels -->
			<text x="100" y="90" font-size="7" fill="#64748b" transform="rotate(-50 100 90)">
				ICE candidates
			</text>
			<text x="295" y="90" font-size="7" fill="#64748b" transform="rotate(50 295 90)">
				ICE candidates
			</text>

			<!-- Peer A -->
			<rect
				x="30"
				y="140"
				width="100"
				height="55"
				rx="10"
				fill={color}
				fill-opacity="0.06"
				stroke={color}
				stroke-width="1.5"
				stroke-opacity="0.5"
			/>
			<text x="80" y="162" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="600">
				Peer A
			</text>
			<text x="80" y="180" font-size="8" fill="#64748b" text-anchor="middle"> (Browser) </text>

			<!-- Peer B -->
			<rect
				x="270"
				y="140"
				width="100"
				height="55"
				rx="10"
				fill={color}
				fill-opacity="0.06"
				stroke={color}
				stroke-width="1.5"
				stroke-opacity="0.5"
			/>
			<text x="320" y="162" font-size="12" fill="#e2e8f0" text-anchor="middle" font-weight="600">
				Peer B
			</text>
			<text x="320" y="180" font-size="8" fill="#64748b" text-anchor="middle"> (Browser) </text>

			<!-- Direct P2P connection -->
			<line x1="130" y1="170" x2="270" y2="170" stroke={color} stroke-width="2.5">
				<animate
					attributeName="stroke-opacity"
					values="0.5;1;0.5"
					dur="2s"
					repeatCount="indefinite"
				/>
			</line>

			<!-- Bidirectional arrows on P2P line -->
			<polygon points="268,170 258,165 258,175" fill={color} />
			<polygon points="132,170 142,165 142,175" fill={color} />

			<!-- Data packets moving -->
			<circle cx="0" cy="170" r="3.5" fill={color}>
				<animate attributeName="cx" values="140;260" dur="1.5s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="1;0.3" dur="1.5s" repeatCount="indefinite" />
			</circle>
			<circle cx="0" cy="170" r="3.5" fill={color} opacity="0.7">
				<animate
					attributeName="cx"
					values="260;140"
					dur="1.8s"
					begin="0.3s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="opacity"
					values="0.7;0.2"
					dur="1.8s"
					begin="0.3s"
					repeatCount="indefinite"
				/>
			</circle>

			<!-- P2P label -->
			<rect x="168" y="148" width="64" height="16" rx="4" fill={color} opacity="0.15" />
			<text x="200" y="160" font-size="8" fill={color} text-anchor="middle" font-weight="600">
				Direct P2P
			</text>

			<!-- Bottom label -->
			<text x="200" y="220" font-size="10" fill="#64748b" text-anchor="middle" font-style="italic">
				Peer-to-peer media/data — server only assists connection setup
			</text>
		</svg>
	</section>
{/if}

<style>
	section {
		animation: diagramFadeIn 0.4s ease-out;
	}

	@keyframes diagramFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	svg {
		filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.05));
	}
</style>
