import type { SimulationConfig, ProtocolLayer } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';

function dashRequestLayer(path: string): ProtocolLayer {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Method',
				bits: 0,
				value: 'GET',
				editable: false,
				description: 'DASH uses standard HTTP GET — fully CDN-compatible'
			},
			{
				name: 'Path',
				bits: 0,
				value: path,
				editable: false,
				description: 'Resource path — MPD manifest or media segment'
			}
		]
	};
}

function dashPayloadLayer(contentType: string, content: string): ProtocolLayer {
	return {
		name: 'DASH Payload',
		abbreviation: 'DASH',
		osiLayer: 7,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Content-Type',
				bits: 0,
				value: contentType,
				editable: false,
				description: 'MIME type — application/dash+xml for MPD, video/mp4 for segments'
			},
			{
				name: 'Content',
				bits: 0,
				value: content,
				editable: false,
				description: 'MPD manifest or CMAF/fMP4 segment data'
			}
		]
	};
}

export const dashStreaming: SimulationConfig = {
	protocolId: 'dash',
	title: 'DASH — Adaptive Bitrate Streaming',
	description:
		'Watch how MPEG-DASH delivers video with adaptive bitrate switching. The player fetches an XML manifest (MPD) describing available representations, then downloads segments using standard HTTP. Unlike HLS, DASH is codec-agnostic and an international standard (ISO 23009-1).',
	tier: 'client',
	actors: [
		{ id: 'player', label: 'Video Player', icon: 'browser', position: 'left' },
		{ id: 'cdn', label: 'CDN Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'mpd-request',
			label: 'GET MPD',
			description:
				"The player requests the Media Presentation Description (MPD) — an XML document describing the whole stream: Periods (timeline), Adaptation Sets (media types), and Representations (quality levels). The MPD is DASH's equivalent of HLS's master playlist.",
			fromActor: 'player',
			toActor: 'cdn',
			duration: 700,
			highlight: ['Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashRequestLayer('/content/manifest.mpd')
			]
		},
		{
			id: 'mpd-response',
			label: 'MPD (manifest)',
			description:
				'The CDN returns the manifest. The player parses it to learn which representations exist and where their segments live.',
			fromActor: 'cdn',
			toActor: 'player',
			duration: 800,
			highlight: ['Content-Type', 'Content'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashPayloadLayer(
					'application/dash+xml',
					'<MPD> Period → AdaptationSet(video) → Rep 1080p@5Mbps, 720p@2.5Mbps, 480p@1Mbps'
				)
			]
		},
		{
			id: 'init-segment',
			label: 'Init Segment',
			description:
				'The player downloads the initialization segment for its chosen representation. This contains codec configuration (SPS/PPS for H.264, moov box for fMP4) but no media data. It only needs to be fetched once per representation — all subsequent media segments reference it.',
			fromActor: 'cdn',
			toActor: 'player',
			duration: 800,
			highlight: ['Content-Type', 'Content'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashPayloadLayer('video/mp4', 'fMP4 init — moov box, H.264 codec config, 1080p, 24fps')
			]
		},
		{
			id: 'segment-1080-request',
			label: 'GET Segment (1080p)',
			description:
				'The player requests a 1080p media segment. DASH uses fragmented MP4 (fMP4/CMAF); each segment is a self-contained moof+mdat box pair.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 700,
			highlight: ['Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashRequestLayer('/content/video/1080p/seg-1.m4s')
			]
		},
		{
			id: 'segment-1080-response',
			label: 'Segment bytes (1080p)',
			description:
				'The CDN streams the segment back. The player measures the download speed to decide whether it can sustain this quality level.',
			fromActor: 'cdn',
			toActor: 'player',
			duration: 1000,
			highlight: ['Content-Type', 'Content'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashPayloadLayer('video/mp4', 'fMP4 segment — 4.0s, 1080p, H.264, 2.5 MB')
			]
		},
		{
			id: 'segment-720-request',
			label: 'GET Segment (720p)',
			description:
				'Bandwidth dropped, so the player adaptively requests the next segment at 720p instead. This is the core of ABR (Adaptive Bitrate): the player continuously estimates available bandwidth and picks the best representation.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 700,
			highlight: ['Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashRequestLayer('/content/video/720p/seg-2.m4s')
			]
		},
		{
			id: 'segment-720-response',
			label: 'Segment bytes (720p)',
			description:
				'The CDN returns the lower-bitrate segment. The switch is seamless because each segment starts with a keyframe.',
			fromActor: 'cdn',
			toActor: 'player',
			duration: 1000,
			highlight: ['Content-Type', 'Content'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53400, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				dashPayloadLayer('video/mp4', 'fMP4 segment — 4.0s, 720p, H.264, 1.2 MB (ABR switch)')
			]
		}
	]
};
