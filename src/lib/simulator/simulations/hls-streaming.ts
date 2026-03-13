import type { SimulationConfig, ProtocolLayer } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';

function hlsRequestLayer(path: string, accept: string): ProtocolLayer {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{ name: 'Method', bits: 0, value: 'GET', editable: false, description: 'HLS uses standard HTTP GET — works through any CDN and proxy' },
			{ name: 'Path', bits: 0, value: path, editable: false, description: 'Resource path — playlist manifest or media segment' },
			{ name: 'Accept', bits: 0, value: accept, editable: false, description: 'Expected content type for the response' }
		]
	};
}

function hlsResponseLayer(contentType: string, body: string): ProtocolLayer {
	return {
		name: 'HLS Payload',
		abbreviation: 'HLS',
		osiLayer: 7,
		color: '#3B82F6',
		headerFields: [
			{ name: 'Content-Type', bits: 0, value: contentType, editable: false, description: 'MIME type — application/vnd.apple.mpegurl for playlists, video/MP2T for segments' },
			{ name: 'Content', bits: 0, value: body, editable: false, description: 'Playlist directives or media segment data' }
		]
	};
}

export const hlsStreaming: SimulationConfig = {
	protocolId: 'hls',
	title: 'HLS — HTTP Live Streaming',
	description:
		'Watch how HLS delivers video using plain HTTP. The player fetches a master playlist listing quality levels, then a media playlist listing segments, then downloads segments one by one. This simplicity is why HLS works everywhere — through CDNs, proxies, and firewalls.',
	tier: 'client',
	actors: [
		{ id: 'player', label: 'Video Player', icon: 'browser', position: 'left' },
		{ id: 'cdn', label: 'CDN Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'master-playlist',
			label: 'Master Playlist',
			description:
				'The player fetches the master playlist (.m3u8) which lists all available quality variants. Each variant has a bandwidth and resolution, letting the player choose the best quality for the current network conditions. This is the entry point for all HLS streams.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 800,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53100, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				hlsRequestLayer('/live/stream.m3u8', 'application/vnd.apple.mpegurl')
			]
		},
		{
			id: 'media-playlist',
			label: 'Media Playlist',
			description:
				'The player selects a quality variant and fetches its media playlist. This lists the actual .ts segment URLs with durations. For live streams, this playlist is polled periodically as new segments are added. The #EXT-X-TARGETDURATION sets the segment length (typically 6 seconds).',
			fromActor: 'cdn',
			toActor: 'player',
			duration: 800,
			highlight: ['Content-Type', 'Content'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 53100, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				hlsResponseLayer('application/vnd.apple.mpegurl', '#EXTM3U, #EXT-X-TARGETDURATION:6, #EXTINF:6.0, seg001.ts, seg002.ts, seg003.ts')
			]
		},
		{
			id: 'segment-1',
			label: 'Segment 1',
			description:
				'The player downloads the first MPEG-TS segment. Each segment is a self-contained chunk of video — typically 2-10 seconds long. MPEG-TS (Transport Stream) was chosen because it can be split at any point without re-muxing, making it ideal for chunked delivery.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 1000,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53100, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				hlsRequestLayer('/live/720p/seg001.ts', 'video/MP2T'),
				hlsResponseLayer('video/MP2T', 'MPEG-TS segment — 6.0s, 720p, H.264+AAC, 1.2 MB')
			]
		},
		{
			id: 'segment-2',
			label: 'Segment 2',
			description:
				'The player fetches the next segment while playing the first. HLS players maintain a buffer of several segments ahead. If bandwidth drops, the player can switch to a lower-quality variant on the next segment boundary — this adaptive bitrate switching happens seamlessly without rebuffering.',
			fromActor: 'player',
			toActor: 'cdn',
			duration: 1000,
			highlight: ['Path', 'Content'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53100, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({ contentType: 'Application Data (23)', handshakeType: 'N/A (encrypted)' }),
				hlsRequestLayer('/live/720p/seg002.ts', 'video/MP2T'),
				hlsResponseLayer('video/MP2T', 'MPEG-TS segment — 6.0s, 720p, H.264+AAC, 1.1 MB')
			]
		}
	]
};
