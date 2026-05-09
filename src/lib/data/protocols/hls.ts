import type { Protocol } from '../types';

export const hls: Protocol = {
	id: 'hls',
	name: 'HTTP Live Streaming',
	abbreviation: 'HLS',
	categoryId: 'realtime-av',
	port: 443,
	year: 2009,
	rfc: 'RFC 8216',
	oneLiner: "Apple's adaptive streaming protocol — video delivered as small HTTP file downloads.",
	overview: `HLS takes a clever approach to streaming: instead of a continuous real-time stream, it chops video into small files (typically 2-10 second segments) and serves them as ordinary [[http1|HTTP]] downloads. A manifest file (.m3u8) lists the available segments and quality levels.

This design is brilliant for several reasons: it works through any {{firewall|firewall}} (it's just [[http1|HTTP]]), it scales trivially with {{cdn|CDNs}} (segments are cacheable files), and it enables {{adaptive-bitrate|adaptive bitrate}} — the player switches between quality levels based on {{bandwidth|bandwidth}}, providing smooth playback even on unstable connections. Increasingly, HLS and [[dash|DASH]] are converging on CMAF (Common Media Application Format), which defines a unified segment format (fragmented MP4) so content providers can encode once and serve both HLS and [[dash|DASH]] from the same segments.

The tradeoff is {{latency|latency}}: buffering several segments means HLS typically has 6-30 seconds of delay. Low-{{latency|Latency}} HLS (LL-HLS) reduces this to 2-4 seconds by using partial segments and preload hints (\`EXT-X-PRELOAD-HINT\`). HLS is widely used across the streaming landscape — Disney+ relies on it as a primary format, while services like Netflix and YouTube primarily use [[dash|DASH]] but fall back to HLS for Apple device compatibility.`,
	howItWorks: [
		{
			title: 'Encode and segment',
			description:
				'The server encodes video at multiple quality levels (360p, 720p, 1080p, 4K) and splits each into small segments (2-10 seconds). Each segment is a standalone file.'
		},
		{
			title: 'Manifest playlist',
			description:
				'A master .m3u8 playlist lists available quality levels. Each level has its own playlist listing segment URLs. Player picks the right level for current {{bandwidth|bandwidth}}.'
		},
		{
			title: 'Segment download',
			description:
				'Player downloads segments sequentially via HTTP GET. Segments are cached by CDNs worldwide. The player maintains a buffer of upcoming segments.'
		},
		{
			title: 'Adaptive bitrate',
			description:
				'Player monitors download speed. If {{bandwidth|bandwidth}} drops, it switches to a lower quality. If it improves, it switches up. No buffering, no interruption.'
		}
	],
	useCases: [
		'Video on demand (Disney+, Apple TV+, and as fallback on Netflix/YouTube)',
		'Live event streaming (sports, concerts)',
		'News and social media video',
		'E-learning platforms',
		'Security camera recording playback'
	],
	codeExample: {
		language: 'python',
		code: `import m3u8
import requests

# Parse an HLS manifest
playlist = m3u8.load('https://cdn.example.com/master.m3u8')

# List available quality levels
for p in playlist.playlists:
    stream = p.stream_info
    print(f"{stream.resolution} @ {stream.bandwidth // 1000}kbps")
    print(f"  URL: {p.uri}")

# Download segments from a specific quality
media = m3u8.load(playlist.playlists[0].uri)
for segment in media.segments:
    print(f"Segment: {segment.uri} ({segment.duration}s)")
    # data = requests.get(segment.uri).content`,
		caption: 'ffmpeg creates HLS segments and playlists — CDNs serve these as ordinary HTTP files',
		alternatives: [
			{
				language: 'javascript',
				code: `import Hls from 'hls.js';

// HLS.js — play HLS in any browser
const video = document.querySelector('video');

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource('https://cdn.example.com/master.m3u8');
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    // Adaptive bitrate is automatic
    console.log('Quality levels:', hls.levels.length);
    video.play();
  });

  hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
    console.log('Switched to quality:', data.level);
  });
}`
			},
			{
				language: 'cli',
				code: `# Create HLS segments from a video file
ffmpeg -i input.mp4 \\
  -c:v libx264 -preset fast -crf 22 \\
  -c:a aac -b:a 128k \\
  -hls_time 6 -hls_list_size 0 \\
  -hls_segment_filename 'segment_%03d.ts' \\
  -f hls playlist.m3u8

# Create multi-bitrate HLS for adaptive streaming
ffmpeg -i input.mp4 \\
  -map 0:v -map 0:a -map 0:v -map 0:a \\
  -c:v libx264 -c:a aac \\
  -b:v:0 1500k -s:v:0 1280x720 \\
  -b:v:1 500k -s:v:1 640x360 \\
  -var_stream_map "v:0,a:0 v:1,a:1" \\
  -hls_time 6 -master_pl_name master.m3u8 \\
  -f hls stream_%v/playlist.m3u8`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Master Playlist',
						code: `#EXTM3U
#EXT-X-VERSION:4

#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
stream_720p/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480,CODECS="avc1.4d401e,mp4a.40.2"
stream_480p/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=600000,RESOLUTION=640x360,CODECS="avc1.42c01e,mp4a.40.2"
stream_360p/playlist.m3u8

#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",URI="subs_en.m3u8"`
					},
					{
						title: 'Media Playlist',
						code: `#EXTM3U
#EXT-X-VERSION:4
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:2680

#EXTINF:6.006,
https://cdn.example.com/stream_720p/seg_2680.ts
#EXTINF:6.006,
https://cdn.example.com/stream_720p/seg_2681.ts
#EXTINF:5.372,
https://cdn.example.com/stream_720p/seg_2682.ts
#EXTINF:6.006,
https://cdn.example.com/stream_720p/seg_2683.ts

#EXT-X-ENDLIST`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Standard: 10-30 seconds. Low-Latency HLS: 2-4 seconds. Not suitable for real-time interaction.',
		throughput:
			'Adaptive: typically 1-15 Mbps for video. CDN-backed = essentially unlimited scale.',
		overhead: 'HTTP headers per segment. Manifest polling adds small periodic requests.'
	},
	connections: ['http1', 'http2', 'tls', 'dash', 'rtmp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/HTTP_Live_Streaming',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8216',
		official: 'https://developer.apple.com/streaming/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Zpracovani_videa_HTTP_Live_Streaming.png/500px-Zpracovani_videa_HTTP_Live_Streaming.png',
		alt: 'Diagram of the HLS streaming architecture showing video encoding into multiple bitrate segments served via HTTP to adaptive players',
		caption:
			'The HLS streaming pipeline — video is encoded at multiple bitrates, segmented into small chunks, and served over standard HTTP. The player dynamically switches between quality levels based on network conditions, ensuring smooth playback.',
		credit: 'Image: Wikimedia Commons / CC0'
	}
};
