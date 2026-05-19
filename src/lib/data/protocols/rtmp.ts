import type { Protocol } from '../types';

export const rtmp: Protocol = {
	id: 'rtmp',
	name: 'Real-Time Messaging Protocol',
	abbreviation: 'RTMP',
	categoryId: 'realtime-av',
	port: 1935,
	year: 2002,
	oneLiner:
		'The Flash-era streaming protocol that refused to die — still the king of live stream ingest.',
	overview: `[[rtmp|RTMP]] was born in 2002 when Macromedia released Flash Communication Server 1.0, giving the web its first real taste of live streaming. Adobe later acquired Macromedia and eventually released an incomplete specification of the protocol. Despite Flash Player's demise in 2020, [[rtmp|RTMP]] survived — because nothing else matched its simplicity for getting a live video feed from a camera to a server.

The protocol works by {{multiplexing|multiplexing}} audio, video, and data streams over a single [[tcp|TCP]] connection, chunking large messages into smaller fragments for interleaved delivery. It maintains persistent {{keep-alive|connections}} with low-overhead {{handshake|handshakes}}, making it ideal for the "ingest" side of live streaming — the path from encoder (OBS, Wirecast) to the first server.

Today, [[rtmp|RTMP]] is the de facto standard for live stream ingest. Twitch, YouTube Live, Facebook Live, and virtually every streaming platform accept [[rtmp|RTMP]] input. The stream typically gets transcoded on the server side and delivered to viewers via [[hls|HLS]] or [[dash|DASH]]. [[rtmp|RTMP]] handles the first mile; [[http1|HTTP]] streaming handles the last mile. For security, the RTMPS variant wraps [[rtmp|RTMP]] in a [[tls|TLS]] connection — Facebook/{{meta|Meta}} has required RTMPS for all live streaming ingest since 2019, and most major platforms now prefer or mandate it.`,
	howItWorks: [
		{
			title: 'TCP handshake + RTMP handshake',
			description:
				'Client establishes a [[tcp|TCP]] connection on port 1935, then performs a 3-phase [[rtmp|RTMP]] {{handshake|handshake}} (C0/S0, C1/S1, C2/S2) exchanging timestamps and random bytes to verify connectivity.'
		},
		{
			title: 'Connect and create stream',
			description:
				'Client sends a "connect" command to the application (e.g., /live). Server responds with connection acknowledgment. Client then sends "createStream" to get a stream ID.'
		},
		{
			title: 'Chunk and multiplex',
			description:
				'Audio, video, and data are split into chunks (default 128 bytes, negotiable). Chunks from different streams are interleaved over the single [[tcp|TCP]] connection.'
		},
		{
			title: 'Publish or play',
			description:
				'For ingest, the encoder sends "publish" and begins streaming audio/video chunks. For playback, the client sends "play" and receives chunks.'
		},
		{
			title: 'Teardown',
			description:
				'Either side sends "deleteStream" followed by closing the [[tcp|TCP]] connection. The server can also disconnect idle clients or reject unauthorized publishers.'
		}
	],
	useCases: [
		'Live stream ingest to platforms (Twitch, YouTube Live, Facebook Live)',
		'OBS Studio and encoder-to-server transmission',
		'Low-latency live broadcasts and gaming streams',
		'Surveillance and [[ip|IP]] camera feeds',
		'Interactive live events with real-time chat integration'
	],
	codeExample: {
		language: 'python',
		code: `import subprocess

# Ingest: stream from webcam to RTMP server
subprocess.run([
    'ffmpeg', '-f', 'avfoundation',
    '-i', '0:0',             # webcam + mic
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-f', 'flv',
    'rtmp://localhost:1935/live/stream-key'
])

# ffmpeg is the standard tool for RTMP ingest
# For RTMPS (TLS-wrapped RTMP, required by Meta since 2019):
# rtmps://live-api-s.facebook.com:443/rtmp/stream-key`,
		caption: '[[rtmp|RTMP]] is the standard first hop for live streaming — from encoder to server',
		alternatives: [
			{
				language: 'javascript',
				code: `const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: { port: 8000, allow_origin: '*' }
};

const nms = new NodeMediaServer(config);
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[Publish]', id, StreamPath);
});
nms.run();
// OBS -> rtmp://localhost:1935/live/stream-key`
			},
			{
				language: 'cli',
				code: `# Stream a file to an RTMP server
ffmpeg -re -i input.mp4 \\
  -c:v libx264 -preset veryfast \\
  -c:a aac \\
  -f flv rtmp://localhost:1935/live/stream-key

# Stream webcam to Twitch/YouTube
ffmpeg -f avfoundation -i "0:0" \\
  -c:v libx264 -preset fast \\
  -c:a aac -b:a 128k \\
  -f flv rtmp://live.twitch.tv/app/YOUR_KEY

# Play an RTMP stream
ffplay rtmp://localhost:1935/live/stream-key

# Receive RTMP and convert to HLS
ffmpeg -i rtmp://localhost:1935/live/stream-key \\
  -c copy -f hls output.m3u8`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'C0/C1 Handshake',
						code: `Client → Server (C0 + C1):
  C0: Version = 3
  C1 (1536 bytes):
    Timestamp: 0x00000000
    Zero: 0x00000000
    Random Data: [1528 bytes]

Server → Client (S0 + S1 + S2):
  S0: Version = 3
  S1 (1536 bytes):
    Timestamp: 0x004D2AE8
    Zero: 0x00000000
    Random Data: [1528 bytes]
  S2 (echo of C1):
    [1536 bytes]

Client → Server (C2):
  C2 (echo of S1):
    [1536 bytes]`
					},
					{
						title: 'Audio Chunk',
						code: `RTMP Chunk:
  Basic Header:
    Fmt: 0 (full header)
    Chunk Stream ID: 4

  Message Header:
    Timestamp: 40ms
    Message Length: 4096
    Type ID: 8 (Audio)
    Stream ID: 1

  Extended Timestamp: (none)

  Chunk Data:
    Audio Tag:
      Sound Format: AAC (10)
      Sound Rate: 44kHz
      Sound Size: 16-bit
      Sound Type: Stereo
      AAC Packet Type: Raw
    Payload: [4082 bytes AAC data]`
					}
				]
			}
		]
	},
	performance: {
		latency: '1-3 seconds end-to-end for live streaming. Sub-second possible with tuned settings.',
		throughput:
			'Single TCP connection handles up to 10+ Mbps easily. Chunking keeps interleaving smooth.',
		overhead:
			'Chunk headers are 1-12 bytes depending on type. Handshake is 1+1536+1536 bytes per side.'
	},
	connections: ['tcp', 'tls', 'hls', 'dash'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol',
		official: 'https://rtmp.veriskope.com/docs/spec/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Macromedia_6_media.jpg/500px-Macromedia_6_media.jpg',
		alt: 'Macromedia product packaging including Flash MX and other multimedia tools',
		caption:
			'Macromedia (later acquired by Adobe) created [[rtmp|RTMP]] for Flash Player in 2002. For over a decade, [[rtmp|RTMP]] was the dominant protocol for live streaming on the web, powering everything from YouTube to Twitch.',
		credit: 'Photo: Wikimedia Commons / CC BY-SA 3.0'
	}
};
