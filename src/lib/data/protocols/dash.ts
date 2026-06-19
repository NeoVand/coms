import type { Protocol } from '../types';

export const dash: Protocol = {
	id: 'dash',
	name: 'Dynamic Adaptive Streaming over HTTP',
	abbreviation: 'DASH',
	categoryId: 'realtime-av',
	port: 443,
	year: 2012,
	rfc: 'ISO 23009-1',
	oneLiner:
		'The open standard for adaptive video streaming — {{mpeg-org|MPEG}}-[[dash|DASH]] powers Netflix, YouTube, and the open web.',
	overview: `{{mpeg-org|MPEG}}-[[dash|DASH]] is the vendor-neutral answer to {{apple|Apple}}'s proprietary [[hls|HLS]]. Ratified as an {{iso|ISO}} standard in 2012, [[dash|DASH]] uses the same fundamental approach — chop video into segments, serve them over plain [[http1|HTTP]], and let the client adapt quality based on {{bandwidth|bandwidth}} — but with an open, extensible {{xml|XML}} {{manifest|manifest}} format called the Media Presentation Description ({{mpd|MPD}}).

Where [[hls|HLS]] uses {{apple|Apple}}'s M3U8 playlists, [[dash|DASH]] uses {{mpd|MPD}} files with a rich hierarchy: Periods (time spans), Adaptation Sets (different languages or camera angles), Representations (quality levels), and Segments (the actual media chunks). This gives [[dash|DASH]] more flexibility for complex use cases like ad insertion, multiple audio tracks, and subtitle streams.

Netflix, YouTube, Disney+, and most major streaming services use [[dash|DASH]] (often alongside [[hls|HLS]] for {{apple|Apple}} compatibility). The protocol supports both on-demand and live {{stream|streaming}}, and works with any {{codec|codec}}.`,
	howItWorks: [
		{
			title: 'Encode and segment',
			description:
				'Video is encoded at multiple quality levels and split into small segments (2-10 seconds). Each quality level has its own set of segment files in fMP4 or WebM format.'
		},
		{
			title: 'MPD manifest generation',
			description:
				'An {{xml|XML}} {{manifest|manifest}} ({{mpd|MPD}}) describes the content hierarchy: Periods, Adaptation Sets, Representations (bitrates/resolutions), and segment URLs or templates.'
		},
		{
			title: 'Client fetches MPD',
			description:
				'The [[dash|DASH]] player downloads the {{mpd|MPD}}, parses the available options, and selects an initial quality level based on estimated {{bandwidth|bandwidth}}.'
		},
		{
			title: 'Adaptive segment fetching',
			description:
				'The player downloads segments via {{http-method|HTTP}} GET. After each download, it measures throughput and may switch quality for the next segment — seamless adaptation.'
		},
		{
			title: 'Live streaming with MPD updates',
			description:
				'For live content, the {{mpd|MPD}} includes a minimumUpdatePeriod. The player periodically re-fetches the {{mpd|MPD}} to discover new segments.'
		}
	],
	useCases: [
		'Video on demand (Netflix, Disney+, Amazon Prime Video)',
		'YouTube adaptive video playback',
		'Live streaming with adaptive bitrate',
		'DRM-protected content delivery (Widevine, PlayReady)',
		'Multi-language and multi-angle video experiences'
	],
	codeExample: {
		language: 'python',
		code: `from mpegdash.parser import MPEGDASHParser
import requests

# Parse a DASH MPD manifest (using mpegdash library)
mpd_url = 'https://cdn.example.com/video/manifest.mpd'
mpd = MPEGDASHParser.parse(requests.get(mpd_url).text)

# List available quality levels
for period in mpd.periods:
    for adapt_set in period.adaptation_sets:
        print(f"Type: {adapt_set.content_type}")
        for rep in adapt_set.representations:
            print(f"  {rep.width}x{rep.height} "
                  f"@ {rep.bandwidth // 1000}kbps")
            # Download segments via HTTP GET
            # for seg_url in rep.base_urls:
            #     data = requests.get(seg_url.base_url_value).content`,
		caption: 'dash.js plays {{mpeg-org|MPEG}}-[[dash|DASH]] content with automatic adaptive bitrate',
		alternatives: [
			{
				language: 'javascript',
				code: `import dashjs from 'dashjs';

// Initialize DASH player
const video = document.querySelector('video');
const player = dashjs.MediaPlayer().create();
player.initialize(video,
  'https://cdn.example.com/video/manifest.mpd', true);

// Monitor quality switches
player.on('qualityChangeRendered', (e) => {
  console.log('Quality:', e.mediaType, '-> level', e.newQuality);
});

// Configure adaptive bitrate settings
player.updateSettings({
  streaming: {
    abr: {
      autoSwitchBitrate: { video: true, audio: true },
      maxBitrate: { video: 8000 },  // kbps cap
    },
    buffer: { stableBufferTime: 12, bufferTimeAtTopQuality: 30 }
  }
});`
			},
			{
				language: 'cli',
				code: `# Create DASH segments with ffmpeg
ffmpeg -i input.mp4 \\
  -map 0:v -map 0:a -map 0:v -map 0:a \\
  -c:v libx264 -c:a aac \\
  -b:v:0 1500k -s:v:0 1280x720 \\
  -b:v:1 500k -s:v:1 640x360 \\
  -adaptation_sets "id=0,streams=v id=1,streams=a" \\
  -f dash manifest.mpd

# Create DASH with MP4Box (GPAC)
MP4Box -dash 4000 -profile dashavc264:live \\
  -out manifest.mpd input.mp4

# Download a DASH stream
ffmpeg -i https://cdn.example.com/manifest.mpd \\
  -c copy output.mp4`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'MPD Manifest',
						code: `<?xml version="1.0" encoding="UTF-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"
     type="static"
     mediaPresentationDuration="PT1H23M45S"
     minBufferTime="PT2S">

  <Period id="1" duration="PT1H23M45S">
    <AdaptationSet mimeType="video/mp4" segmentAlignment="true">
      <Representation id="720p" bandwidth="2400000"
                      width="1280" height="720" codecs="avc1.4d401f">
        <SegmentTemplate media="seg_$Number$.m4s"
                         initialization="init.m4s"
                         duration="6000" timescale="1000"
                         startNumber="1"/>
      </Representation>
      <Representation id="480p" bandwidth="1200000"
                      width="854" height="480" codecs="avc1.4d401e">
        <SegmentTemplate media="seg_$Number$.m4s"
                         initialization="init.m4s"
                         duration="6000" timescale="1000"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>`
					},
					{
						title: 'Segment Request',
						code: `GET /video/720p/init.m4s HTTP/1.1
Host: cdn.example.com
Range: bytes=0-

HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 867

[ftyp box][moov box (track metadata)]

---

GET /video/720p/seg_42.m4s HTTP/1.1
Host: cdn.example.com

HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 1802400

[moof box (fragment metadata)]
[mdat box (encoded video frames)]`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Standard: 10-30 seconds. Low-Latency DASH: 2-5 seconds with chunked transfer encoding.',
		throughput: 'Adaptive: typically 1-20 Mbps for video. CDN-backed for unlimited viewer scale.',
		overhead: 'HTTP headers per segment. MPD manifest is XML (typically 5-50 KB).'
	},
	connections: ['http1', 'http2', 'tls', 'hls', 'rtmp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP',
		official: 'https://dashif.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/100_Winchester_Circle.jpg/500px-100_Winchester_Circle.jpg',
		alt: 'Netflix headquarters building at 100 Winchester Circle in Los Gatos, California',
		caption:
			'Netflix headquarters in Los Gatos, California. Netflix was instrumental in driving the adoption of {{mpeg-org|MPEG}}-[[dash|DASH]] (2012), the open-standard {{adaptive-bitrate|adaptive bitrate streaming}} protocol that dynamically adjusts video quality based on network conditions.',
		credit: 'Photo: Coolcaesar / CC BY-SA 4.0, via Wikimedia Commons'
	}
};
