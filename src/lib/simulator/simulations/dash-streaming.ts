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
			{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'DASH uses standard HTTP GET — fully CDN-compatible' },
			{ name: 'Path', bits: 0, value: path, editable: false, description: 'Resource path — MPD manifest or media segment' }
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
			{ name: 'Content-Type', bits: 0, value: contentType, editable: false, description: 'MIME type — application/dash+xml for MPD, video/mp4 for segments' },
			{ name: 'Content', bits: 0, value: content, editable: false, description: 'MPD manifest or CMAF/fMP4 segment data' }
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
			id: 'mpd',
			label: 'GET MPD',
			description:
				'The player fetches the Media Presentation Description (MPD), an XML document that describes the entire stream structure. It lists Periods (timeline), Adaptation Sets (media types), and Representations (quality levels). The MPD is DASH\'s equivalent of HLS\'s master playlist.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 800,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				dashRequestLayer('/content/manifest.mpd'),
				dashPayloadLayer('application/dash+xml', '<MPD> Period → AdaptationSet(video) → Rep 1080p@5Mbps, 720p@2.5Mbps, 480p@1Mbps')
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
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				dashPayloadLayer('video/mp4', 'fMP4 init — moov box, H.264 codec config, 1080p, 24fps')
			]
		},
		{
			id: 'segment-1080',
			label: 'Segment (1080p)',
			description:
				'The player downloads a media segment at 1080p. DASH uses fragmented MP4 (fMP4/CMAF) which is more efficient than MPEG-TS. Each segment is a self-contained moof+mdat box pair. The player measures download speed to decide if it can sustain this quality level.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 1000,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				dashRequestLayer('/content/video/1080p/seg-1.m4s'),
				dashPayloadLayer('video/mp4', 'fMP4 segment — 4.0s, 1080p, H.264, 2.5 MB')
			]
		},
		{
			id: 'segment-720',
			label: 'Segment (720p)',
			description:
				'Bandwidth dropped, so the player adaptively switches to 720p on the next segment. This is the core of ABR (Adaptive Bitrate) — the player continuously estimates available bandwidth and selects the best representation. The switch is seamless because each segment starts with a keyframe.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 1000,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53400, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				dashRequestLayer('/content/video/720p/seg-2.m4s'),
				dashPayloadLayer('video/mp4', 'fMP4 segment — 4.0s, 720p, H.264, 1.2 MB (ABR switch)')
			]
		}
	]
};
