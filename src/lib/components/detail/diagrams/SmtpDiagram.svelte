<script lang="ts">
	let { color }: { color: string } = $props();
</script>

<svg viewBox="0 0 400 240" class="w-full" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<marker id="smtp-arrow-right" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
			<polygon points="0,0 8,3 0,6" fill={color} opacity="0.8" />
		</marker>
		<marker id="smtp-arrow-left" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
			<polygon points="8,0 0,3 8,6" fill={color} opacity="0.8" />
		</marker>
	</defs>

	<!-- Sender -->
	<rect x="20" y="15" width="90" height="32" rx="6" fill={color} opacity="0.12" stroke={color} stroke-opacity="0.3" stroke-width="1" />
	<text x="65" y="35" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600">Mail Client</text>

	<!-- Sender's MTA -->
	<rect x="155" y="15" width="90" height="32" rx="6" fill={color} opacity="0.08" stroke={color} stroke-opacity="0.2" stroke-width="1" />
	<text x="200" y="29" text-anchor="middle" fill="#cbd5e1" font-size="9">Sender's</text>
	<text x="200" y="41" text-anchor="middle" fill="#cbd5e1" font-size="9">Mail Server</text>

	<!-- Recipient's MTA -->
	<rect x="290" y="15" width="90" height="32" rx="6" fill={color} opacity="0.08" stroke={color} stroke-opacity="0.2" stroke-width="1" />
	<text x="335" y="29" text-anchor="middle" fill="#cbd5e1" font-size="9">Recipient's</text>
	<text x="335" y="41" text-anchor="middle" fill="#cbd5e1" font-size="9">Mail Server</text>

	<!-- Lifelines -->
	<line x1="65" y1="47" x2="65" y2="195" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
	<line x1="200" y1="47" x2="200" y2="195" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
	<line x1="335" y1="47" x2="335" y2="195" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />

	<!-- EHLO -->
	<line x1="70" y1="62" x2="195" y2="62" stroke={color} stroke-width="1.2" marker-end="url(#smtp-arrow-right)" stroke-opacity="0.6" />
	<text x="132" y="57" text-anchor="middle" fill="#94a3b8" font-size="8">EHLO client.com</text>
	<line x1="195" y1="74" x2="70" y2="74" stroke={color} stroke-width="1" marker-end="url(#smtp-arrow-left)" stroke-opacity="0.4" stroke-dasharray="3,2" />
	<text x="132" y="84" text-anchor="middle" fill="#94a3b8" font-size="7">250 OK + STARTTLS</text>

	<!-- MAIL FROM -->
	<line x1="70" y1="98" x2="195" y2="98" stroke={color} stroke-width="1.2" marker-end="url(#smtp-arrow-right)" stroke-opacity="0.7">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
	</line>
	<text x="132" y="94" text-anchor="middle" fill={color} font-size="8" opacity="0.8">MAIL FROM:&lt;alice@a.com&gt;</text>

	<!-- RCPT TO -->
	<line x1="70" y1="118" x2="195" y2="118" stroke={color} stroke-width="1.2" marker-end="url(#smtp-arrow-right)" stroke-opacity="0.7">
		<animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="4s" begin="0.5s" repeatCount="indefinite" />
	</line>
	<text x="132" y="114" text-anchor="middle" fill={color} font-size="8" opacity="0.8">RCPT TO:&lt;bob@b.com&gt;</text>

	<!-- DATA -->
	<line x1="70" y1="138" x2="195" y2="138" stroke={color} stroke-width="1.5" marker-end="url(#smtp-arrow-right)" stroke-opacity="0.8">
		<animate attributeName="stroke-opacity" values="0.5;0.9;0.5" dur="4s" begin="1s" repeatCount="indefinite" />
	</line>
	<text x="132" y="134" text-anchor="middle" fill={color} font-size="8" opacity="0.9">DATA (message body)</text>

	<!-- 250 OK -->
	<line x1="195" y1="152" x2="70" y2="152" stroke={color} stroke-width="1" marker-end="url(#smtp-arrow-left)" stroke-opacity="0.5" stroke-dasharray="3,2" />
	<text x="132" y="162" text-anchor="middle" fill="#94a3b8" font-size="7">250 OK — queued</text>

	<!-- Relay to recipient server -->
	<line x1="205" y1="175" x2="330" y2="175" stroke={color} stroke-width="1.5" marker-end="url(#smtp-arrow-right)" stroke-opacity="0.6" stroke-dasharray="6,3">
		<animate attributeName="stroke-dashoffset" values="0;-18" dur="2s" repeatCount="indefinite" />
	</line>
	<text x="267" y="170" text-anchor="middle" fill="#94a3b8" font-size="8">Relay (MX lookup)</text>

	<!-- DNS lookup indicator -->
	<text x="267" y="190" text-anchor="middle" fill="#64748b" font-size="7">via DNS MX record</text>

	<!-- Label -->
	<text x="200" y="220" text-anchor="middle" fill="#64748b" font-size="10" font-style="italic">
		Store and forward — email hops through mail servers to reach the recipient
	</text>
</svg>
