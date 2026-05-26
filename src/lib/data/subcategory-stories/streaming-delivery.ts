import type { SubcategoryStory } from './types';

export const streamingDeliveryStory: SubcategoryStory = {
	subcategoryId: 'streaming-delivery',
	tagline:
		"Delivering video at Internet scale — from Flash push to adaptive HTTP, and the protocol that refused to die",
	sections: [
		{
			type: 'narrative',
			title: 'How the Web Learned to Stream',
			text: `In 2005, YouTube put up its first videos. They were Flash. By 2007 every video on the open web was Flash — \`<object\` tags pointing to .flv files served over **[[rtmp|RTMP]]**, Adobe\'s proprietary real-time streaming protocol. RTMP was *push-based*: the server streamed frames to the player over a long-lived TCP connection, and the player buffered and rendered them. For a decade, this was how video worked.\n\nThen mobile happened. Apple shipped the iPhone in 2007, refused to support Flash, and within five years had killed RTMP playback on the open web. The replacements — **[[hls|HLS]]** from Apple and **[[dash|DASH]]** from the ISO/IEC MPEG group — share an audacious idea: *use plain HTTP, like everything else on the web*. Instead of one long stream, the video is chopped into many small segments (typically 2–10 seconds each), each fetched as a separate [[http1|HTTP]] GET. A manifest file (\`.m3u8\` for HLS, \`.mpd\` for DASH) lists the segments and the available bitrates.\n\nThis is **adaptive bitrate streaming**. The player constantly measures its bandwidth and switches to the appropriate quality between segments. Network drops to 1 Mbps? Next segment fetched at 720p instead of 1080p. Recovered? Back to 1080p. The whole apparatus runs over the same HTTP infrastructure that serves images and JavaScript — caches at the CDN, served from disk, no special protocol stack.\n\n[[rtmp|RTMP]] didn\'t die. Player-facing RTMP is gone, but RTMP is still the dominant *ingest* protocol: when a streamer pushes video to Twitch, YouTube Live, or Facebook Live, they\'re almost certainly using RTMP from OBS or a hardware encoder. The "broadcast in" leg uses RTMP; the "broadcast out" leg uses HLS or DASH. Fifteen years after Adobe stopped pushing it, RTMP is still the default for live video ingest because nobody has bothered to replace it.`
		},
		{
			type: 'pioneers',
			title: 'The Streaming Architects',
			people: [
				{
					name: 'Roger Pantos',
					years: '–',
					title: 'HLS Lead Designer',
					org: 'Apple',
					contribution:
						"Designed [[hls|HTTP Live Streaming]] at Apple in 2008–2009. The original use case was iPhone video — Apple needed a way to stream live and on-demand video over standard HTTP from CDNs, with no plugin. The design — segment-based, manifest-driven, plain HTTP — was so well-suited to the web that it became the dominant streaming format outside Adobe\\'s shrinking Flash empire. Pantos has stewarded the HLS spec through ten major revisions; the spec text on developer.apple.com is one of the most-implemented in the streaming industry."
				},
				{
					name: 'Iraj Sodagar',
					years: '–',
					title: 'DASH Chair',
					org: 'MPEG / Microsoft',
					contribution:
						"Chaired the MPEG working group that standardized [[dash|MPEG-DASH]] (ISO/IEC 23009-1) in 2012. Where [[hls|HLS]] was a single-vendor spec, DASH was the standards-body answer — designed to be codec-agnostic, container-agnostic, and royalty-free. Sodagar and the DASH-IF (DASH Industry Forum) drove interop testing across hundreds of player and encoder implementations."
				},
				{
					name: 'Will Law',
					years: '–',
					title: 'CMAF / Low-Latency Streaming Architect',
					org: 'Akamai',
					contribution:
						"Co-led the Common Media Application Format (CMAF, 2016) effort to unify the segment formats used by HLS and DASH — for years both used MPEG-2 Transport Streams for HLS and fragmented MP4 for DASH, requiring CDNs to cache two copies of the same content. Law also helped shape Low-Latency HLS (LL-HLS) and the Akamai Low-Latency CMAF pattern, which together pushed end-to-end live streaming latency from 30+ seconds down to 2–4 seconds."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1995,
					title: 'RealAudio Ships',
					description:
						"RealNetworks ships RealAudio with the first widely-deployed Internet streaming protocol. Proprietary, complex, hugely successful for music streaming in the late 1990s."
				},
				{
					year: 2002,
					title: 'Adobe Buys Macromedia\'s Flash',
					description:
						"Adobe inherits Flash Media Server and the RTMP protocol. Flash becomes the default video stack on the web for the next decade."
				},
				{
					year: 2005,
					title: 'YouTube Launches on Flash',
					description:
						"YouTube ships using Adobe Flash + [[rtmp|RTMP]]/HTTP progressive download. Becomes the largest video site on the Internet."
				},
				{
					year: 2007,
					title: 'iPhone Ships Without Flash',
					description:
						"Apple\'s iPhone launches without Flash. The clock starts on web video\'s migration away from Flash."
				},
				{
					year: 2009,
					title: 'HLS Spec Drafts at IETF',
					description:
						"Apple publishes the first [[hls|HLS]] internet-drafts. The original spec is short: an .m3u8 manifest pointing to .ts segment files served from any HTTP origin."
				},
				{
					year: 2010,
					title: 'Steve Jobs Publishes \"Thoughts on Flash\"',
					description:
						"Jobs\' April 2010 open letter explicitly states the iPad will never support Flash. Within 18 months, every major video site is shipping an HTML5 + HLS or DASH path alongside Flash."
				},
				{
					year: 2012,
					title: 'MPEG-DASH Standardized',
					description:
						'ISO/IEC 23009-1 publishes [[dash|MPEG-DASH]]. Codec-agnostic, royalty-free, designed by committee — the standards-body answer to Apple\'s vendor-controlled HLS.'
				},
				{
					year: 2015,
					title: 'YouTube Defaults to DASH',
					description:
						"YouTube migrates its primary player from Flash + RTMP to HTML5 + DASH. Netflix, Hulu, BBC iPlayer follow with DASH (or HLS) shortly after."
				},
				{
					year: 2016,
					title: 'CMAF — Unified Segment Format',
					description:
						'CMAF (Common Media Application Format) lets HLS and DASH share the same underlying fragmented MP4 segments, halving CDN storage and cache cost for dual-format delivery.'
				},
				{
					year: 2017,
					title: 'Flash Officially Discontinued',
					description:
						"Adobe announces Flash end-of-life by 2020. The last consumer browser version is removed from Chrome in late 2020."
				},
				{
					year: 2019,
					title: 'Low-Latency HLS (LL-HLS) and CMAF-LL',
					description:
						"Apple publishes Low-Latency HLS; CMAF Low-Latency follows. Achieve 2–4 second end-to-end live latency, competitive with the WebRTC alternatives — without giving up the CDN cacheability that makes streaming economical."
				},
				{
					year: 2023,
					title: 'Media over QUIC (MoQ) Working Group',
					description:
						"IETF charters the MoQ WG to define the post-HLS/DASH future: streaming directly over [[quic|QUIC]] without segment files. Twitch and Meta are the largest sponsors."
				}
			]
		},
		{
			type: 'comparison',
			title: 'RTMP vs HLS vs DASH',
			axes: ['Direction', 'Transport', 'Format', 'Latency', 'Use case in 2025'],
			rows: [
				{
					label: '[[rtmp|RTMP]]',
					values: [
						'Push (server pushes to player); also push (ingest)',
						'TCP (long-lived)',
						"FLV container, AAC/H.264",
						'1–5 seconds (low for the era)',
						"Live ingest from streamer → service (Twitch, YouTube Live, Facebook Live)"
					]
				},
				{
					label: '[[hls|HLS]]',
					values: [
						'Pull (client fetches segments)',
						'HTTP — fits behind any CDN',
						".m3u8 manifest + .ts or fMP4 segments",
						'Standard: 15–30s; LL-HLS: 2–4s',
						"All Apple platforms; default for mobile and Smart TVs; CDN-cached delivery"
					]
				},
				{
					label: '[[dash|DASH]]',
					values: [
						'Pull (client fetches segments)',
						'HTTP — fits behind any CDN',
						".mpd manifest + fMP4 (or webm) segments",
						'Standard: 6–30s; CMAF-LL: 2–4s',
						"YouTube, Netflix, most non-Apple platforms; codec-agnostic so it survives codec churn"
					]
				}
			],
			note: "Modern live streams typically use [[rtmp|RTMP]] for ingest and [[hls|HLS]] or [[dash|DASH]] for delivery. The CMAF unification means a single set of fMP4 segments can serve both HLS and DASH players."
		},
		{
			type: 'animated-sequence',
			title: 'Adaptive Bitrate Ladder',
			definition: `sequenceDiagram
    participant P as Player
    participant CDN as CDN
    participant O as Origin
    Note over P,O: Player loads manifest and sees available qualities
    P->>CDN: GET /stream.m3u8
    CDN->>O: GET /stream.m3u8 — cache miss
    O-->>CDN: manifest listing 240p through 4K
    CDN-->>P: manifest
    Note over P,O: Player starts at conservative bitrate, measures bandwidth
    P->>CDN: GET 720p segment 001
    CDN-->>P: segment, 15 Mbps measured bandwidth
    P->>CDN: GET 1080p segment 002
    CDN-->>P: segment, still 15 Mbps so stay at 1080p
    Note over P: bandwidth drops to 3 Mbps — tunnel or bad WiFi
    P->>CDN: GET 480p segment 003
    CDN-->>P: smaller segment, fits new bandwidth
    P->>CDN: GET 480p segment 004
    CDN-->>P: segment
    Note over P: bandwidth recovers
    P->>CDN: GET 1080p segment 005
    CDN-->>P: segment, back to high quality
    Note over CDN: All segments cached at CDN edge — most requests never hit origin`,
			caption:
				"The adaptive bitrate ladder is the magic of HTTP-based streaming. Each segment is a separate HTTP request, the player picks the bitrate per segment, and the CDN caches every variant. A 4K stream with 5 bitrates costs 5× the storage but ~1× the origin bandwidth — almost all traffic is served from cache.",
			steps: {
				0: '**The setup.** The player will fetch many small segments (typically 2–10 seconds each) over HTTP from a CDN. Before it can do anything, it needs the *manifest* — the list of available bitrates and segment URLs.',
				1: 'Player requests the **manifest** (.m3u8 for HLS, .mpd for DASH).',
				2: '**CDN cache miss** — it doesn\'t have the manifest yet, so it fetches from origin.',
				3: 'Origin returns the manifest listing five bitrates: **240p, 480p, 720p, 1080p, 4K**.',
				4: 'CDN forwards the manifest to the player and caches it. Future viewers get the manifest from cache.',
				5: '**The player chooses a starting bitrate** — typically conservative (low) — and starts measuring how fast segments are arriving to inform its quality decisions.',
				6: 'Player requests **segment 001 at 720p**. Conservative start while it learns the network.',
				7: 'Segment arrives. Player measures **15 Mbps** of available bandwidth — way more than 720p needs. Time to step up.',
				8: 'Player requests **segment 002 at 1080p**.',
				9: 'Still 15 Mbps available. Player **stays at 1080p**. (Could try 4K next, but the ABR algorithm is usually cautious about jumping multiple steps.)',
				10: '**Bandwidth drops.** User entered a tunnel, or the WiFi degraded, or a coworker started a download. Available bandwidth crashes to 3 Mbps.',
				11: 'Player requests **segment 003 at 480p** — adapting downward to fit the new bandwidth. The viewer sees a quality drop but no buffering.',
				12: 'Segment arrives quickly thanks to the smaller size. Playback continues smoothly.',
				13: 'Player requests segment 004, still at 480p, while it monitors whether bandwidth recovers.',
				14: 'Segment arrives. Bandwidth is climbing again.',
				15: '**Bandwidth recovers.** Player steps back up to 1080p.',
				16: 'Player requests **segment 005 at 1080p** — back to high quality. The viewer never knew there was a problem.',
				17: '**The CDN is the secret.** Almost every segment request is served from a CDN edge cache. The origin sees one request per (segment, bitrate) for the entire viewership of a stream. This is what makes streaming economically viable at YouTube/Netflix scale.'
			}
		},
		{
			type: 'callout',
			title: 'Why RTMP Refused to Die',
			text: `[[rtmp|RTMP]] should have been dead by 2015. Browsers stopped supporting Flash. Mobile never supported it. Adobe stopped investing. Every major streaming platform migrated *playback* to HLS or DASH. And yet, in 2025, if you open OBS Studio and start a stream to Twitch, YouTube Live, Facebook Live, Kick, or essentially any live streaming platform, the protocol going from your encoder to the service is **RTMP**.\n\nWhy?\n\n- **Encoder support is universal.** Every camera, every hardware encoder (TriCaster, AJA, Blackmagic), every streaming software (OBS, vMix, Wirecast, Streamlabs) supports RTMP. No replacement has matched that.\n- **It just works.** RTMP\'s push-over-TCP model is simple. A streamer types in a server URL and a stream key; the encoder connects and starts sending. No handshake complexity, no segmentation logic, no manifest publishing.\n- **The replacements are worse for this leg.** WebRTC requires complex signaling. SRT (Secure Reliable Transport) is gaining adoption but isn\'t in every encoder. Newer protocols (RIST, Zixi, WHIP) exist but the ecosystem is fragmented.\n- **It\'s ingest, not delivery.** The economic pressure to replace it is low — only the streamer-to-service hop uses RTMP. Everything past the ingest server is HLS/DASH/CMAF.\n\nThe migration *will* happen — WHIP (WebRTC-HTTP Ingestion Protocol) is the leading candidate, with YouTube and others adding support — but it has been "next year" for several years. RTMP is the cockroach of streaming protocols, and it\'s genuinely fine.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[hls|HLS]] and [[dash|DASH]]\'s failure mode is **latency**. Standard HLS/DASH live streaming has 15–30 seconds of end-to-end delay — segments must be encoded, written, fetched, buffered before playback. For VOD and most casual live streaming, this is fine. For interactive use cases (live auctions, sports betting, sports broadcasts where social media spoils the result), it\'s a dealbreaker. LL-HLS and CMAF-LL cut this to 2–4 seconds, but require CDN support, careful tuning, and HTTP/2 chunked transfer encoding. Many CDNs handle low-latency poorly.\n\n[[rtmp|RTMP]]\'s failure mode is **firewall traversal**. RTMP runs on TCP port 1935 by default; many corporate firewalls block it. RTMPS (TLS-wrapped on port 443) helps but isn\'t universally supported by streaming services. Streamers in restrictive networks often have to manually configure RTMPT (tunneled over HTTP), which adds latency and isn\'t supported everywhere.\n\nAll three share a deeper failure mode: **codec churn**. The container formats (TS, fMP4) are stable, but codecs (H.264 → H.265 → AV1 → VVC) keep evolving. Each generation cuts bandwidth ~30%, which is huge at YouTube\'s scale. But device support lags by years — H.265 still isn\'t supported in Chrome on Android, AV1 hardware decode is still spotty, VVC isn\'t deployed yet. Streamers must transcode to multiple codecs and serve the right one to each device.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **Media over QUIC (MoQ)** — IETF working group developing the post-HLS/DASH future. Direct streaming over QUIC streams instead of segment files. Sub-second latency potential, but the segment-based + CDN-cacheable model is hard to beat economically.\n- **WHIP / WHEP for WebRTC ingest** — WebRTC HTTP Ingestion Protocol (WHIP, RFC 9725) and Egress Protocol (WHEP) are the WebRTC-based path to replace RTMP ingest. Twitch, OBS, YouTube all have partial support.\n- **AV1 rollout** — YouTube and Netflix are pushing AV1 hard. ~30% bandwidth savings vs H.264 at equivalent quality. Hardware decode support is catching up (Apple A17, Snapdragon 8 Gen 3, Intel Arc).\n- **Low-latency CMAF and LL-HLS** are converging in practice — Apple\'s LL-HLS uses CMAF segments, the format wars are over.\n- **Live commerce and live auctions** are the new "must be <2 seconds" use cases driving low-latency investment. WebRTC is winning the under-1-second tier; LL-HLS/CMAF-LL the 2–4 second tier; standard HLS/DASH the 15–30 second tier (which is fine for most actual viewing).\n- **The boring truth**: 95% of streaming in 2025 is still standard HLS or DASH segments served from a CDN. The architectural breakthroughs (RTMP, segment-based adaptive, CMAF) are mostly already in production. The frontier is the long tail — latency, codec efficiency, ingest modernization.`
		}
	]
};
