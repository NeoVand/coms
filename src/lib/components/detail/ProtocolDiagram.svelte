<script lang="ts">
	import TcpDiagram from './diagrams/TcpDiagram.svelte';
	import Http1Diagram from './diagrams/Http1Diagram.svelte';
	import Http2Diagram from './diagrams/Http2Diagram.svelte';
	import UdpDiagram from './diagrams/UdpDiagram.svelte';
	import WebsocketsDiagram from './diagrams/WebsocketsDiagram.svelte';
	import TlsDiagram from './diagrams/TlsDiagram.svelte';
	import DnsDiagram from './diagrams/DnsDiagram.svelte';
	import MqttDiagram from './diagrams/MqttDiagram.svelte';
	import WebrtcDiagram from './diagrams/WebrtcDiagram.svelte';
	import QuicDiagram from './diagrams/QuicDiagram.svelte';
	import Http3Diagram from './diagrams/Http3Diagram.svelte';
	import GrpcDiagram from './diagrams/GrpcDiagram.svelte';
	import GraphqlDiagram from './diagrams/GraphqlDiagram.svelte';
	import SctpDiagram from './diagrams/SctpDiagram.svelte';
	import AmqpDiagram from './diagrams/AmqpDiagram.svelte';
	import StompDiagram from './diagrams/StompDiagram.svelte';
	import RtpDiagram from './diagrams/RtpDiagram.svelte';
	import SipDiagram from './diagrams/SipDiagram.svelte';
	import HlsDiagram from './diagrams/HlsDiagram.svelte';
	import SshDiagram from './diagrams/SshDiagram.svelte';
	import SseDiagram from './diagrams/SseDiagram.svelte';
	import RestDiagram from './diagrams/RestDiagram.svelte';
	import SmtpDiagram from './diagrams/SmtpDiagram.svelte';
	import FtpDiagram from './diagrams/FtpDiagram.svelte';
	import CoapDiagram from './diagrams/CoapDiagram.svelte';
	import DhcpDiagram from './diagrams/DhcpDiagram.svelte';
	import NtpDiagram from './diagrams/NtpDiagram.svelte';
	import type { Component } from 'svelte';

	let { protocolId, color }: { protocolId: string; color: string } = $props();

	const diagrams: Record<string, Component<{ color: string }>> = {
		tcp: TcpDiagram,
		udp: UdpDiagram,
		quic: QuicDiagram,
		sctp: SctpDiagram,
		http1: Http1Diagram,
		http2: Http2Diagram,
		http3: Http3Diagram,
		websockets: WebsocketsDiagram,
		grpc: GrpcDiagram,
		graphql: GraphqlDiagram,
		sse: SseDiagram,
		rest: RestDiagram,
		mqtt: MqttDiagram,
		amqp: AmqpDiagram,
		stomp: StompDiagram,
		webrtc: WebrtcDiagram,
		rtp: RtpDiagram,
		sip: SipDiagram,
		hls: HlsDiagram,
		tls: TlsDiagram,
		ssh: SshDiagram,
		dns: DnsDiagram,
		dhcp: DhcpDiagram,
		ntp: NtpDiagram,
		smtp: SmtpDiagram,
		ftp: FtpDiagram,
		coap: CoapDiagram
	};

	const DiagramComponent = $derived(diagrams[protocolId]);
</script>

{#if DiagramComponent}
	<section>
		<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
			How It Works
		</h3>
		<DiagramComponent {color} />
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
</style>
