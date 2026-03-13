import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createRTMPLayer } from '../layers/rtmp';

export const rtmpPublish: SimulationConfig = {
	protocolId: 'rtmp',
	title: 'RTMP — Live Stream Publishing',
	description:
		'Follow a live streamer connecting to an RTMP server, performing the handshake, and publishing audio/video. RTMP chunks large messages into small packets for low-latency interleaving of audio and video data.',
	tier: 'client',
	actors: [
		{ id: 'streamer', label: 'Streamer', icon: 'device', position: 'left' },
		{ id: 'server', label: 'RTMP Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'handshake',
			label: 'C0+C1 Handshake',
			description:
				'The streamer initiates the RTMP handshake by sending C0 (version byte) and C1 (1536 bytes with timestamp and random data). The server responds with S0+S1+S2. This handshake verifies both sides can communicate and establishes the connection epoch for timestamps.',
			fromActor: 'streamer',
			toActor: 'server',
			duration: 800,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53200, dstPort: 1935, flags: 'PSH,ACK' }),
				createRTMPLayer({
					chunkType: 'N/A (handshake)',
					chunkStreamId: 'N/A',
					messageType: 'Handshake',
					streamId: 0,
					timestamp: 0,
					payload: 'C0: version=3, C1: 1536 bytes (timestamp + random)'
				})
			]
		},
		{
			id: 'connect',
			label: 'connect()',
			description:
				'After handshake, the streamer sends an AMF0-encoded "connect" command specifying the application name and URL. The server validates the stream key and responds with _result. AMF (Action Message Format) is a binary format for encoding structured data — similar to JSON but more compact.',
			fromActor: 'streamer',
			toActor: 'server',
			duration: 800,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53200, dstPort: 1935, flags: 'PSH,ACK' }),
				createRTMPLayer({
					chunkType: 'Type 0 (full)',
					chunkStreamId: 3,
					messageType: 'Command AMF0 (20)',
					streamId: 0,
					timestamp: 0,
					payload: 'connect("live", tcUrl:"rtmp://ingest.example.com/live")'
				})
			]
		},
		{
			id: 'create-stream',
			label: 'createStream()',
			description:
				'The streamer requests a new stream by sending createStream. The server allocates a stream ID (typically 1) and returns it in _result. This stream ID is used for all subsequent publish, audio, and video messages. RTMP multiplexes multiple streams over one TCP connection.',
			fromActor: 'streamer',
			toActor: 'server',
			duration: 600,
			highlight: ['Message Type', 'Stream ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53200, dstPort: 1935, flags: 'PSH,ACK' }),
				createRTMPLayer({
					chunkType: 'Type 0 (full)',
					chunkStreamId: 3,
					messageType: 'Command AMF0 (20)',
					streamId: 0,
					timestamp: 0,
					payload: 'createStream() → _result(1)'
				})
			]
		},
		{
			id: 'publish',
			label: 'publish()',
			description:
				'The streamer announces it will publish to a stream key (e.g. "stream-key-abc"). The "live" flag means real-time broadcasting. The server responds with onStatus(NetStream.Publish.Start). From this point, audio and video data can flow.',
			fromActor: 'streamer',
			toActor: 'server',
			duration: 800,
			highlight: ['Message Type', 'Payload', 'Stream ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53200, dstPort: 1935, flags: 'PSH,ACK' }),
				createRTMPLayer({
					chunkType: 'Type 0 (full)',
					chunkStreamId: 4,
					messageType: 'Command AMF0 (20)',
					streamId: 1,
					timestamp: 0,
					payload: 'publish("stream-key-abc", "live")'
				})
			]
		},
		{
			id: 'media-data',
			label: 'Audio + Video',
			description:
				'The streamer sends interleaved audio and video chunks. RTMP splits large video frames into smaller chunks (default 128 bytes) so audio packets are not delayed behind large keyframes. Audio uses chunk stream 4, video uses chunk stream 6 — each with independent chunking.',
			fromActor: 'streamer',
			toActor: 'server',
			duration: 1000,
			highlight: ['Message Type', 'Timestamp', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53200, dstPort: 1935, flags: 'PSH,ACK' }),
				createRTMPLayer({
					chunkType: 'Type 1 (delta)',
					chunkStreamId: 6,
					messageType: 'Video (9)',
					streamId: 1,
					timestamp: 33,
					payload: 'H.264 keyframe, 1920x1080, 4.5 Mbps + AAC audio, 128 kbps'
				})
			]
		}
	]
};
