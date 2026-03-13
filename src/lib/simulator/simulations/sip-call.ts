import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSIPLayer } from '../layers/sip';

export const sipCall: SimulationConfig = {
	protocolId: 'sip',
	title: 'SIP — VoIP Call Setup',
	description:
		'Follow a SIP call from INVITE to answer. SIP is the signaling protocol that establishes, modifies, and terminates voice and video calls. It works like HTTP — text-based request/response with headers — but for real-time communication.',
	tier: 'client',
	actors: [
		{ id: 'caller', label: 'Caller', icon: 'client', position: 'left' },
		{ id: 'server', label: 'SIP Proxy', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'invite',
			label: 'INVITE',
			description:
				'The caller sends an INVITE to initiate a call. The request includes an SDP body describing the media capabilities — supported codecs, ports, and transport. The SIP proxy routes this based on the To URI, potentially through multiple hops to reach the callee.',
			fromActor: 'caller',
			toActor: 'server',
			duration: 1000,
			highlight: ['Method', 'To', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 5060, dstPort: 5060 }),
				createSIPLayer({
					method: 'INVITE',
					status: '',
					from: 'sip:alice@example.com',
					to: 'sip:bob@example.com',
					callId: 'a1b2c3@192.168.1.100',
					body: 'SDP: m=audio 5004 RTP/AVP 111 (Opus), m=video 5006 RTP/AVP 96 (H.264)'
				})
			]
		},
		{
			id: 'trying',
			label: '100 Trying',
			description:
				'The proxy immediately responds with 100 Trying to stop retransmissions. This provisional response means the proxy has received the INVITE and is working on routing it. The caller should not retransmit until a timeout — this prevents flooding the network with duplicate requests.',
			fromActor: 'server',
			toActor: 'caller',
			duration: 600,
			highlight: ['Status'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5060, dstPort: 5060 }),
				createSIPLayer({
					method: '',
					status: '100 Trying',
					from: 'sip:alice@example.com',
					to: 'sip:bob@example.com',
					callId: 'a1b2c3@192.168.1.100',
					body: ''
				})
			]
		},
		{
			id: 'ringing',
			label: '180 Ringing',
			description:
				'The callee\'s phone is ringing. The 180 Ringing response is forwarded back through the proxy chain. The caller can now play a ringback tone. This provisional response can optionally include early media (ringback from the callee\'s network) via SDP.',
			fromActor: 'server',
			toActor: 'caller',
			duration: 800,
			highlight: ['Status', 'To'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5060, dstPort: 5060 }),
				createSIPLayer({
					method: '',
					status: '180 Ringing',
					from: 'sip:alice@example.com',
					to: 'sip:bob@example.com;tag=xyz',
					callId: 'a1b2c3@192.168.1.100',
					body: ''
				})
			]
		},
		{
			id: 'ok',
			label: '200 OK',
			description:
				'Bob answers the call. The 200 OK includes an SDP answer with the negotiated media parameters — both sides agree on codecs and ports. The To header now has a tag, creating a confirmed dialog. RTP media can begin flowing directly between the two endpoints.',
			fromActor: 'server',
			toActor: 'caller',
			duration: 800,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5060, dstPort: 5060 }),
				createSIPLayer({
					method: '',
					status: '200 OK',
					from: 'sip:alice@example.com',
					to: 'sip:bob@example.com;tag=xyz',
					callId: 'a1b2c3@192.168.1.100',
					body: 'SDP: m=audio 6000 RTP/AVP 111 (Opus)'
				})
			]
		},
		{
			id: 'ack',
			label: 'ACK',
			description:
				'The caller sends ACK to confirm receipt of the 200 OK, completing the three-way handshake. INVITE is the only SIP method that uses this three-way exchange — it ensures both sides are ready before media flows. The call is now established and RTP packets begin flowing.',
			fromActor: 'caller',
			toActor: 'server',
			duration: 600,
			highlight: ['Method', 'Call-ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 5060, dstPort: 5060 }),
				createSIPLayer({
					method: 'ACK',
					status: '',
					from: 'sip:alice@example.com',
					to: 'sip:bob@example.com;tag=xyz',
					callId: 'a1b2c3@192.168.1.100',
					body: ''
				})
			]
		}
	]
};
