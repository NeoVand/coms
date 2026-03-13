import type { SimulationConfig, ProtocolLayer } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function createSDPLayer(type: string, fields: string, media: string): ProtocolLayer {
	return {
		name: 'SDP Description',
		abbreviation: 'SDP',
		osiLayer: 7,
		color: '#A855F7',
		headerFields: [
			{ name: 'Type', bits: 0, value: type, editable: false, description: 'SDP role — Offer (initial proposal) or Answer (accepted subset)' },
			{ name: 'Session Fields', bits: 0, value: fields, editable: false, description: 'Session-level fields — v= (version), o= (origin), s= (session name), t= (timing)' },
			{ name: 'Media', bits: 0, value: media, editable: false, description: 'Media descriptions — m= lines with port, protocol, and format list' },
		]
	};
}

function signalingLayer(action: string): ProtocolLayer {
	return {
		name: 'Signaling',
		abbreviation: 'SIG',
		osiLayer: 7,
		color: '#6366F1',
		headerFields: [
			{ name: 'Action', bits: 0, value: action, editable: false, description: 'Signaling action — carried over WebSocket, HTTP, or SIP' },
			{ name: 'Content-Type', bits: 0, value: 'application/sdp', editable: false, description: 'The payload is an SDP description' }
		]
	};
}

export const sdpNegotiation: SimulationConfig = {
	protocolId: 'sdp',
	title: 'SDP — Session Description & Negotiation',
	description:
		'See how two peers exchange SDP to agree on media parameters. SDP is a text format (not a transport protocol) — it describes codecs, ports, and capabilities. The offer/answer model lets peers negotiate the intersection of their supported media.',
	tier: 'client',
	actors: [
		{ id: 'offerer', label: 'Offerer', icon: 'client', position: 'left' },
		{ id: 'answerer', label: 'Answerer', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'offer',
			label: 'SDP Offer',
			description:
				'The offerer creates an SDP offer listing all its media capabilities. Each m= line describes a media type (audio, video), a port, the transport (RTP/SAVPF), and a list of supported codecs by payload type. The a= lines add details like codec parameters, SSRC, and ICE candidates.',
			fromActor: 'offerer',
			toActor: 'answerer',
			duration: 1000,
			highlight: ['Type', 'Media'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53300, dstPort: 443, flags: 'PSH,ACK' }),
				signalingLayer('setRemoteDescription(offer)'),
				createSDPLayer(
					'Offer',
					'v=0, o=alice 28908 1 IN IP4 192.168.1.100, s=Call',
					'm=audio 5004 RTP/SAVPF 111 0 (Opus, PCMU), m=video 5006 RTP/SAVPF 96 97 (H.264, VP8)'
				)
			]
		},
		{
			id: 'answer',
			label: 'SDP Answer',
			description:
				'The answerer creates an SDP answer selecting from the offered codecs. It includes only the codecs it supports and wants to use — this is the negotiated intersection. If the answerer does not support video, it sets the video port to 0 (rejected). The answer locks in the agreed media session.',
			fromActor: 'answerer',
			toActor: 'offerer',
			duration: 1000,
			highlight: ['Type', 'Media'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53300, flags: 'PSH,ACK' }),
				signalingLayer('setLocalDescription(answer)'),
				createSDPLayer(
					'Answer',
					'v=0, o=bob 55234 1 IN IP4 93.184.216.34, s=Call',
					'm=audio 6000 RTP/SAVPF 111 (Opus only), m=video 6002 RTP/SAVPF 96 (H.264 only)'
				)
			]
		},
		{
			id: 'established',
			label: 'Media Ready',
			description:
				'Both peers have exchanged SDP and agreed on parameters: Opus audio on ports 5004↔6000 and H.264 video on ports 5006↔6002. The SDP negotiation is complete — RTP media can now flow directly between the peers using the agreed codecs, ports, and encryption parameters.',
			fromActor: 'offerer',
			toActor: 'answerer',
			duration: 800,
			highlight: ['Action'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53300, dstPort: 443, flags: 'PSH,ACK' }),
				signalingLayer('negotiationComplete'),
				createSDPLayer(
					'Negotiated',
					'Session established',
					'Audio: Opus 48kHz stereo (port 5004↔6000), Video: H.264 720p (port 5006↔6002)'
				)
			]
		}
	]
};
