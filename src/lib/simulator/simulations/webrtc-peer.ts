import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createUDPLayer } from '../layers/udp';
import { createSTUNLayer } from '../layers/stun';

function createSDPLayer(type: 'Offer' | 'Answer') {
	return {
		name: 'SDP Message',
		abbreviation: 'SDP',
		osiLayer: 7,
		color: '#818CF8',
		headerFields: [
			{
				name: 'Type',
				bits: 0,
				value: type,
				editable: false,
				description: `SDP ${type} — describes media capabilities, codecs, and ICE candidates`
			},
			{
				name: 'Media',
				bits: 0,
				value: 'audio 9 UDP/TLS/RTP/SAVPF 111',
				editable: false,
				description: 'Media line — specifies media type, port, transport, and codec payload types'
			},
			{
				name: 'ICE ufrag',
				bits: 0,
				value: 'a1b2',
				editable: false,
				description: 'ICE username fragment — used to correlate STUN checks with this session'
			},
			{
				name: 'Fingerprint',
				bits: 0,
				value: 'sha-256 AB:CD:...',
				editable: false,
				description: 'DTLS certificate fingerprint — verified during DTLS handshake for authentication'
			}
		]
	};
}

function createSRTPLayer(payload: string) {
	return {
		name: 'SRTP Packet',
		abbreviation: 'SRTP',
		osiLayer: 7,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Version',
				bits: 2,
				value: 2,
				editable: false,
				description: 'RTP version — always 2'
			},
			{
				name: 'Payload Type',
				bits: 7,
				value: '111 (Opus)',
				editable: false,
				description: 'Codec identifier — 111 = Opus audio, 96 = VP8 video'
			},
			{
				name: 'Sequence',
				bits: 16,
				value: 1,
				editable: false,
				description: 'Sequence number — increments per packet for ordering and loss detection'
			},
			{
				name: 'Timestamp',
				bits: 32,
				value: 960,
				editable: false,
				description: 'RTP timestamp — 48kHz clock for Opus (960 samples = 20ms frame)'
			},
			{
				name: 'SSRC',
				bits: 32,
				value: '0x12345678',
				editable: false,
				description: 'Synchronization source — uniquely identifies this media stream'
			},
			{
				name: 'Payload',
				bits: 0,
				value: payload,
				editable: false,
				description: 'Encrypted media data — only endpoints with SRTP keys can decrypt'
			}
		]
	};
}

export const webrtcPeer: SimulationConfig = {
	protocolId: 'webrtc',
	title: 'WebRTC — Peer Connection',
	description:
		'Watch how two browsers establish a direct peer-to-peer connection. Signaling exchanges SDP offers through a server, then ICE finds the best path and DTLS secures the media channel.',
	tier: 'client',
	actors: [
		{ id: 'peerA', label: 'Peer A', icon: 'device', position: 'left' },
		{ id: 'signal', label: 'Signaling', icon: 'server', position: 'center' },
		{ id: 'peerB', label: 'Peer B', icon: 'device', position: 'right' }
	],
	userInputs: [
		{
			id: 'mediaType',
			label: 'Media Type',
			type: 'select',
			defaultValue: 'Audio',
			options: ['Audio', 'Video', 'Screen share']
		}
	],
	steps: [
		{
			id: 'sdp-offer-send',
			label: 'SDP Offer',
			description:
				'Peer A creates an SDP offer describing its media capabilities (codecs, formats, ICE candidates) and sends it to the signaling server. The signaling channel can be WebSocket, HTTP, or any transport.',
			fromActor: 'peerA',
			toActor: 'signal',
			duration: 800,
			highlight: ['Type', 'Media'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52800, dstPort: 443, flags: 'PSH,ACK' }),
				createSDPLayer('Offer')
			]
		},
		{
			id: 'sdp-offer-relay',
			label: 'SDP Offer (relay)',
			description:
				'Signaling server relays the SDP offer to Peer B. The server never sees media data — it only passes session descriptions between peers so they can negotiate a direct connection.',
			fromActor: 'signal',
			toActor: 'peerB',
			duration: 600,
			highlight: ['Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '10.0.0.50', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 48900, flags: 'PSH,ACK' }),
				createSDPLayer('Offer')
			]
		},
		{
			id: 'sdp-answer-send',
			label: 'SDP Answer',
			description:
				'Peer B creates an SDP answer with its own capabilities and selected codecs. The answer confirms which media formats both sides support — they negotiate the intersection of their capabilities.',
			fromActor: 'peerB',
			toActor: 'signal',
			duration: 800,
			highlight: ['Type', 'Media'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66', dstMac: 'AA:BB:CC:DD:EE:FF' }),
				createIPv4Layer({ srcIp: '10.0.0.50', dstIp: '93.184.216.34', protocol: 6 }),
				createTCPLayer({ srcPort: 48900, dstPort: 443, flags: 'PSH,ACK' }),
				createSDPLayer('Answer')
			]
		},
		{
			id: 'sdp-answer-relay',
			label: 'SDP Answer (relay)',
			description:
				'Signaling server relays the answer to Peer A. Both peers now know each other\'s capabilities. Next, ICE connectivity checks will find the best direct path between them.',
			fromActor: 'signal',
			toActor: 'peerA',
			duration: 600,
			highlight: ['Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52800, flags: 'PSH,ACK' }),
				createSDPLayer('Answer')
			]
		},
		{
			id: 'ice-stun',
			label: 'ICE / STUN',
			description:
				'Peers exchange STUN Binding Requests directly to test connectivity. ICE tries multiple candidate paths (host, server-reflexive, relay) and picks the best one. STUN reveals each peer\'s public IP.',
			fromActor: 'peerA',
			toActor: 'peerB',
			duration: 1000,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 52801, dstPort: 48901 }),
				createSTUNLayer({
					type: 'Binding Request',
					length: 24,
					attribute: 'USERNAME: a1b2:c3d4, PRIORITY: 2130706431'
				})
			]
		},
		{
			id: 'dtls-handshake',
			label: 'DTLS Handshake',
			description:
				'After ICE succeeds, peers perform a DTLS handshake directly over UDP. This establishes encryption keys for SRTP media. The certificate fingerprint is verified against the one in the SDP.',
			fromActor: 'peerB',
			toActor: 'peerA',
			duration: 800,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '10.0.0.50', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 48901, dstPort: 52801 }),
				createSTUNLayer({
					type: 'DTLS ClientHello',
					length: 256,
					attribute: 'DTLS 1.2, cipher: TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256'
				})
			]
		},
		{
			id: 'media-flow',
			label: 'Media (SRTP)',
			description:
				'Encrypted media flows directly between peers using SRTP (Secure RTP). Audio packets are sent every 20ms. The signaling server is no longer involved — this is true peer-to-peer communication.',
			fromActor: 'peerA',
			toActor: 'peerB',
			duration: 1000,
			highlight: ['Payload Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 52801, dstPort: 48901 }),
				createSRTPLayer('Opus audio frame (20ms, encrypted)')
			]
		}
	]
};
