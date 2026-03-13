import type { SimulationConfig, ProtocolLayer } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createRTPLayer } from '../layers/rtp';

function createRTCPLayer(reportType: string, ssrc: string, payload: string): ProtocolLayer {
	return {
		name: 'RTCP Report',
		abbreviation: 'RTCP',
		osiLayer: 7,
		color: '#BE185D',
		headerFields: [
			{ name: 'Version', bits: 2, value: 2, editable: false, description: 'RTCP version — always 2' },
			{ name: 'Report Type', bits: 8, value: reportType, editable: false, description: 'RTCP packet type — SR (200), RR (201), SDES (202), BYE (203)' },
			{ name: 'SSRC', bits: 32, value: ssrc, editable: false, description: 'SSRC of the report sender' },
			{ name: 'Report Data', bits: 0, value: payload, editable: false, description: 'Statistics — NTP timestamp, packet count, jitter, loss fraction' }
		]
	};
}

export const rtpMedia: SimulationConfig = {
	protocolId: 'rtp',
	title: 'RTP — Real-Time Media Streaming',
	description:
		'Watch how RTP delivers audio and video over UDP. Each packet carries a sequence number for reordering, a timestamp for synchronization, and a payload type identifying the codec. RTCP runs alongside to report quality statistics.',
	tier: 'client',
	actors: [
		{ id: 'sender', label: 'Media Sender', icon: 'device', position: 'left' },
		{ id: 'receiver', label: 'Receiver', icon: 'device', position: 'right' }
	],
	steps: [
		{
			id: 'audio-1',
			label: 'Audio Packet',
			description:
				'The sender transmits an RTP packet containing an Opus audio frame. The payload type (111) identifies the codec so the receiver knows how to decode it. The sequence number increments with each packet, letting the receiver detect losses and reorder late arrivals.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 600,
			highlight: ['M/PT', 'Sequence #', 'Timestamp'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 5004, dstPort: 5004 }),
				createRTPLayer({
					flags: '0x80 (V=2)',
					payloadType: '111 (Opus)',
					seq: 1,
					timestamp: 960,
					ssrc: '0x12345678',
					payload: 'Opus audio frame — 20ms, 48kHz, stereo'
				})
			]
		},
		{
			id: 'video-1',
			label: 'Video Packet',
			description:
				'A video frame is sent on a separate RTP stream (different SSRC and port). The marker bit is set on the last packet of a video frame, signaling the receiver that the frame is complete and can be decoded. Large video frames are fragmented across multiple RTP packets.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 600,
			highlight: ['M/PT', 'SSRC', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 5006, dstPort: 5006 }),
				createRTPLayer({
					flags: '0x80 (V=2, M=1)',
					payloadType: '96 (H.264)',
					seq: 1,
					timestamp: 3000,
					ssrc: '0x87654321',
					payload: 'H.264 NAL unit — IDR keyframe, 1280x720'
				})
			]
		},
		{
			id: 'sr',
			label: 'Sender Report',
			description:
				'The sender periodically sends an RTCP Sender Report with statistics: how many packets and bytes it has sent, and an NTP timestamp that lets the receiver correlate RTP timestamps to wall-clock time. This is essential for lip-sync between audio and video streams.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 800,
			highlight: ['Report Type', 'Report Data'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 5005, dstPort: 5005 }),
				createRTCPLayer('SR (200)', '0x12345678', 'NTP: 2026-03-13 14:30:00, Packets: 1500, Bytes: 240000')
			]
		},
		{
			id: 'rr',
			label: 'Receiver Report',
			description:
				'The receiver sends back an RTCP Receiver Report with quality metrics: fraction of packets lost, cumulative loss count, interarrival jitter, and round-trip delay. The sender uses this feedback to adapt — it may lower the bitrate, switch codecs, or request a keyframe if loss is high.',
			fromActor: 'receiver',
			toActor: 'sender',
			duration: 800,
			highlight: ['Report Type', 'Report Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5005, dstPort: 5005 }),
				createRTCPLayer('RR (201)', '0x87654321', 'Loss: 0.5%, Jitter: 12ms, Last SR: 14:30:00, Delay: 45ms')
			]
		}
	]
};
