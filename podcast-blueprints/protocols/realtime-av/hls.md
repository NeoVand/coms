---
id: hls
type: protocol
name: HTTP Live Streaming
abbreviation: HLS
etymology: "[H]TTP [L]ive [S]treaming"
category: realtime-av
year: 2009
rfc: RFC 8216
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - realtime-av/hls-and-dash
  - realtime-av/moq-transport
related_protocols: [http1, http2, tls, dash, rtmp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [8216]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Zpracovani_videa_HTTP_Live_Streaming.png/500px-Zpracovani_videa_HTTP_Live_Streaming.png
    caption: The HLS streaming pipeline. Video is encoded at multiple bitrates, segmented into small chunks, and served over standard HTTP. The player switches between quality levels based on observed bandwidth.
    credit: Image — Wikimedia Commons / CC0
visual_cues:
  - "An annotated multivariant playlist on screen — six lines of text starting with #EXTM3U, then three #EXT-X-STREAM-INF entries for 360p at 600 kbps, 720p at 2.4 Mbps, and 1080p at 6 Mbps. Arrows point from each line to a stack of segment files in a CDN edge cache."
  - "A timeline showing glass-to-glass latency by stack — WebRTC at about 200 ms on the left, MoQ target at under 1 second, LL-HLS at 2-5 seconds, standard HLS at 6-30 seconds, and at the far right Fubo's measured 86.75-second lag during Super Bowl LVIII on 11 February 2024."
  - "A side-by-side of a 6-second segment versus four 1.5-second LL-HLS Partial Segments. The full segment is one fat block. The Partial Segments are four thin slivers with #EXT-X-PRELOAD-HINT pointing at the next one before it exists."
  - "A diagram of a multi-CDN setup steered by a Content Steering server. One player at the bottom, three CDNs across the top — Akamai, Cloudflare, Fastly — and a small steering box that issues pathway IDs. An arrow shows the player switching from Akamai to Cloudflare mid-session."
  - "An iPhone 3GS in 2009 and an iPhone 15 Pro in 2026, both playing the same playlist file. The 2009 phone is downloading MPEG-TS segments over HTTP/1.1 on 3G. The 2026 phone is decoding AV1 fragmented MP4 over HTTP/3 with AES-256-GCM encryption."
  - "A single playlist file zoomed in on the first three characters — #EXTM3U — with a dotted line tracing back to a 1995 Fraunhofer M3U file and a Winamp 1.0 splash screen from April 1997."
---

# HLS — HTTP Live Streaming

## In one breath

HLS is Apple's adaptive streaming protocol — video chopped into small files and served as plain HTTP downloads. A text playlist called a `.m3u8` lists the segments and the available quality levels; the player picks a level, downloads segments one at a time, and switches up or down between segments as bandwidth changes. RFC 8216 codified version 7 in August 2017, and in 2026 HLS still carries Disney+ end to end, every Twitch stream, all Apple TV+, and the iOS fallback for Netflix and YouTube.

## The pitch (cold-open)

In June 2009, Apple shipped iPhone OS 3.0 alongside the iPhone 3GS. The phone had no Flash, the cellular network was 3G, and corporate firewalls blocked everything except port 443. Roger Pantos and William May Jr. had a fix: chop the video into two-to-ten-second files, list them in a text playlist, and serve the whole thing as HTTPS. Eighteen years later, that hack carries the most-watched live event in U.S. history — Peacock's AFC Wild Card game on 13 January 2024, 27.6 million viewers, 30 percent of all U.S. internet traffic. And the playlist format still starts with `#EXTM3U`, the file magic Nullsoft's Winamp popularised in April 1997.

## How it actually works

Everything between the encoder and the eyeball is plain HTTP on port 443. The encoder produces video at four to eight quality levels — say 360p at 800 kbps, 720p at 2 Mbps, 1080p at 6 Mbps, plus an I-frame-only rendition for trick play. A packager chops each level into segments and writes two kinds of playlist file. The multivariant playlist (Apple renamed it from "master playlist" in the bis draft) lists every quality level. The media playlist for each level lists the actual segment URLs. The player downloads the multivariant playlist first, picks a level, downloads that level's media playlist, then fetches segments one by one over HTTP GET. CDNs cache segments and playlists like any other file. There is no streaming server in the loop — just web servers, edge caches, and the player's own buffer.

The simulator transcript captures the four moves end to end. First, the player issues `GET /live/stream.m3u8` over TLS 1.3 on port 443. The CDN returns the multivariant playlist with `Content-Type: application/vnd.apple.mpegurl`. Second, the player picks a quality variant — say 720p — and fetches that level's media playlist, which lists segment URLs and durations. The `#EXT-X-TARGETDURATION:6` line tells the client to expect roughly six-second segments and to poll for new ones at that rate. Third, the player downloads `seg001.ts`, a self-contained 6-second MPEG-TS chunk of H.264 video and AAC audio, about 1.2 megabytes. Fourth, it fetches `seg002.ts` while playing the first. If observed throughput drops between segments, the next request goes to the lower-bitrate playlist instead. The switch happens at a segment boundary, with no rebuffering — the IDR frame at the start of every segment makes that possible.

### Header at a glance

HLS does not have a binary header in the TCP-or-UDP sense. The wire format is text — UTF-8 lines beginning with `#EXT` tags. A practitioner needs to recognise about a dozen of them.

- `#EXTM3U` — file magic, must be the first line of every playlist.
- `#EXT-X-VERSION` — protocol version. Currently 12 in `bis-17`, 13 in `bis-22`.
- `#EXT-X-TARGETDURATION` — upper bound on segment duration. Clients pace their playlist polling against it. Six seconds is Apple's classic default; two to four seconds is normal for modern HLS.
- `#EXTINF` — the duration of the next segment in decimal seconds, e.g. `#EXTINF:6.006`.
- `#EXT-X-MEDIA-SEQUENCE` — the index of the first segment in the current playlist window.
- `#EXT-X-PLAYLIST-TYPE` — `EVENT` or `VOD`. Live streams omit it.
- `#EXT-X-ENDLIST` — terminates a VOD playlist or a finished live event.
- `#EXT-X-STREAM-INF` — variant entry in the multivariant playlist, with `BANDWIDTH`, `RESOLUTION`, `CODECS`, and optional `SCORE`.
- `#EXT-X-MEDIA` — alternate audio, video, or subtitle rendition.
- `#EXT-X-KEY` — encryption method, key URI, IV, key format. AES-128, SAMPLE-AES, or — as of `bis-22` in May 2026 — AES-256-GCM.
- `#EXT-X-MAP` — initialization section, e.g. the fMP4 `moov` box.
- `#EXT-X-BYTERANGE` — sub-file segment addressed by HTTP byte range, the trick that made fragmented MP4 work in HLS at WWDC 2016.
- `#EXT-X-DISCONTINUITY` — tells the decoder to reset its PTS clock and codec state at this segment.
- `#EXT-X-PROGRAM-DATE-TIME` — wall-clock anchor. Critical for SCTE-35 ad insertion.

LL-HLS adds a few more. `#EXT-X-PART` marks a partial segment, typically 200 to 400 milliseconds long. `#EXT-X-PRELOAD-HINT` tells the client what URI to fetch next so the request can be in flight before the part is even published. `#EXT-X-RENDITION-REPORT` carries cross-rendition state for fast variant switches. `#EXT-X-SERVER-CONTROL` advertises the blocking and skip behaviour the origin supports — `CAN-BLOCK-RELOAD`, `PART-HOLD-BACK`, `CAN-SKIP-UNTIL`.

### State machine in three sentences

HLS is mostly stateless on the wire — every request is an ordinary HTTP GET, and the protocol itself does not track sessions. The state lives in the player: `Idle → ManifestRequested → ManifestParsed → SelectedVariant → Buffering → Playing` with edges to `Rebuffering`, `Seeking`, and `Ended`. Recovery is by `EXT-X-DISCONTINUITY` for a PTS reset, `EXT-X-GAP` to skip a missing segment, or jumping to a `RENDITION-REPORT` offset on a different variant.

### Reliability, flow, and security mechanics

HLS rides on TCP via HTTP/1.1, HTTP/2, or HTTP/3 — Apple does not pin one. Reliability comes from TCP's retransmissions and from the player's segment buffer, typically three to six segments deep on a live stream. The player monitors download time per segment and runs an adaptive bitrate algorithm to choose the next variant. The classic algorithms are buffer-based BOLA (Spiteri, Urgaonkar, and Sitaraman, IEEE/ACM ToN 2020), throughput-based estimators, hybrid model-predictive control by Yin et al. at SIGCOMM 2015, and reinforcement-learning-trained Pensieve from Mao, Netravali, and Alizadeh at SIGCOMM 2017. BOLA won the 2026 IEEE INFOCOM Test of Time Award and is the dash.js default.

Encryption has four flavours. AES-128 encrypts whole segments with AES-128-CBC and PKCS7 padding; the IV is either the `IV` attribute on `#EXT-X-KEY` or the media sequence number. SAMPLE-AES encrypts only sample data inside a TS or fMP4 container using the `cbcs` scheme of Common Encryption ISO/IEC 23001-7 — that is what FairPlay requires. SAMPLE-AES-CTR uses the `cenc` scheme and lets Widevine and PlayReady decrypt the same fMP4 segments. AES-256-GCM was added in `draft-pantos-hls-rfc8216bis-22` on 1 May 2026 — the most consequential cryptographic change to HLS in nearly a decade. FairPlay key delivery uses a `URI` of the form `skd://...` and a Server Playback Context to Content Key Context round-trip with the key server.

LL-HLS sits on top of this. The player issues a *blocking* request — `GET /v1080p/main.m3u8?_HLS_msn=1804&_HLS_part=2` — and the CDN edge holds the response open until that part exists. CDNs must exclude `_HLS_*` and `CMCD-*` query parameters from cache keys, otherwise every distinct in-flight request becomes a unique cache miss.

## Where it shows up in production

**Disney+ runs 100% HLS plus CMAF end to end**, leveraging the BAMTech tech stack Disney bought a controlling stake in for $1.58 billion in 2017. Hulu is moving to all-CMAF (HLS plus DASH) on the same plumbing. The advantage is one set of fragmented MP4 segments serving every player.

**Netflix uses both HLS and DASH** — HLS for Apple devices and DASH almost everywhere else — and encodes about 120 streams per title across the bitrate ladder. Netflix's CDN is its own: Open Connect, custom Open Connect Appliances with hundreds of terabytes of SSD and HDD, embedded directly in ISP networks. The ABR work happens at the player, but the bytes come from a Netflix-owned box one router hop from the eyeball.

**Twitch is HLS-dominant** and has been since it replaced its FFmpeg-based RTMP-to-HLS pipeline with an in-house TwitchTranscoder. Twitch ships roughly two-second segments by default. Its internal QUIC-based "Warp" replacement for HLS, presented at Demuxed 2021, became the seed of the IETF MoQ Working Group's WARP draft. The 2024 Paris Summer Olympics drew 153.44 million hours of livestream watching with a peak of 3.78 million concurrent viewers on 6 August 2024. Ibai's *La Velada del Año 5* hit roughly 9.1 million concurrent viewers on Twitch on 26 July 2025.

**Peacock's AFC Wild Card game** — Chiefs versus Dolphins on 13 January 2024 — reached 27.6 million total viewers and roughly 24.6 million concurrent, the most-streamed live event in U.S. history. It consumed about 30 percent of all U.S. internet traffic. The Paris 2024 Olympics on Peacock delivered 23.5 billion streamed minutes, 40 percent more than every prior Olympics combined.

**HBO Max** used HLS for the *House of the Dragon* premiere on 21 August 2022. It worked everywhere except on Amazon Fire TV, where an app-specific HLS bug crashed playback for thousands of users. We come back to that one in a moment.

The topology under all of these is the same. Camera produces SRT or RTMP into an encoder. The encoder hands fragmented MP4 in CMAF format to a packager. The packager pushes to an origin (AWS Elemental MediaPackage, MediaStore, MediaTailor, Wowza, Nimble Streamer, OvenMediaEngine). A multi-CDN fan-out — Akamai, Cloudflare, Fastly, AWS CloudFront — handles the egress, optionally steered by a Content Steering server that reroutes clients across CDNs by pathway ID. The player at the eyeball can be AVPlayer (Apple), ExoPlayer / Media3 (Google), hls.js in any browser via Media Source Extensions, Shaka Player, video.js, JW Player, THEOplayer, or Bitmovin Player.

The published latency numbers are unflattering. Standard HLS glass-to-glass is six to thirty seconds. LL-HLS with parts of 200 to 400 milliseconds gets you to roughly two to five seconds. WebRTC, by contrast, is under 500 milliseconds, often closer to 200 in good conditions. During Super Bowl LVIII on 11 February 2024, Phenix measured streaming lag against the cable broadcast: Fubo at 86.75 seconds, Hulu Live at 70.16 seconds, ViX at 63.46 seconds, NFL+ at 61.45 seconds, DIRECTV Stream at 60.62 seconds, YouTube TV at 55.54 seconds, Paramount+ at 42.73 seconds. Streaming viewers heard about touchdowns from neighbours before they saw them.

## Things that go wrong

The history of HLS in production is mostly the history of HLS *adjacent* things going wrong.

**Disney+ launch, 12 November 2019.** Disney spent $2.58 billion buying BAMTech and 18 months packaging Marvel, Star Wars, and Pixar into a single subscription service. The HLS-plus-CMAF stack was modern, codec-flexible, and DRM-clean, with Akamai handling delivery. When 10 million subscribers hit the auth endpoint at 6:00 a.m. Eastern, the bottleneck collapsed. Downdetector logged 8,441 reported incidents at 9:00 a.m. People could buy the service but not log in. *Lady and the Tramp* mysteriously played for some users while *The Mandalorian* refused to load. A week later, Disney's chairman of DTC Kevin Mayer told Recode's Code Conference: *"It had to do with a way we architected a piece of the app… It was a coding issue, and we are going to recode it."* The lesson: HLS is only as reliable as the shortest pole in the streaming tent, and the shortest pole is almost never the protocol. The chapter "HLS and DASH" tells this story in full.

**HBO Max and *House of the Dragon*, 21 August 2022.** Three thousand-plus Downdetector reports during the premiere. Amazon and HBO confirmed a Fire TV-specific HLS app bug. HBO pushed a fix the same week, but the social media damage was done. The takeaway is the same as Disney+: the protocol shipped fine, the integration around it didn't.

**Super Bowl LVIII and LIX, February 2024 and February 2025.** Multiple platforms experienced stream glitches. DIRECTV Stream had a 4K-specific outage. Fubo's 86.75 seconds of glass-to-glass lag became the public benchmark for how far behind broadcast OTT can fall.

**FFmpeg's HLS demuxer has had its own CVE pile.** CVE-2023-6601 let crafted base64-encoded data URIs with fake file extensions trigger arbitrary demuxers and exfiltration. CVE-2023-6602 was a null-pointer dereference in the HLS playlist parser, fixed for denial of service. CVE-2023-6603 was the same null-deref class re-emerging — Ubuntu shipped USN-7830-1. CVE-2025-6605 was a missing format-enforcement check that enabled SSRF via crafted media. CVE-2025-10256 was the null-deref class returning yet again in 2025. CVE-2025-27325 was a stored XSS in the WordPress *Video.js HLS Player* plugin (versions ≤ 1.0.2), disclosed 24 February 2025. The pattern is the same one CVE-2017-9993 set: HLS demuxer code that does not properly restrict what file extensions and demuxer names a playlist can pull in.

## Common pitfalls (for the practitioner)

**Manifest cache poisoning under LL-HLS.** Forgetting to make `_HLS_msn` and `_HLS_part` cache-key-relevant lets one client's stale playlist pin everyone else's. Conversely, treating `CMCD-*` query parameters as cache-key-relevant turns every distinct client session into a cache miss. Both ends are wrong.

**Encoding ladder misconfig.** Missing `BANDWIDTH`, wrong `RESOLUTION`, codec strings iOS cannot parse — the symptom is variants silently dropping out of the player's selection set with no error.

**PROGRAM-DATE-TIME drift.** Divergence between the encoder's wall clock and the SCTE-35 ad markers makes interstitials fire late. The ad lands after the touchdown.

**DRM key rotation.** Rotating a FairPlay key without preserving SPC-to-CKC continuity bricks playback for in-flight sessions. Symptom: "media playback failure" with no useful error code.

**CORS on segment hosts.** Missing `Access-Control-Allow-Origin` on the segment URLs is the number-one hls.js failure mode. Symptom: clean playlist parse, then nothing plays.

**`maxBufferLength` and `liveBackBufferLength` defaulting to Infinity.** This caused multi-year hls.js memory growth issues — see hls.js issues #939, #1110, #1262, #6683. Symptom: tab using 4 GB after an hour of uptime.

**`Cache-Control` mismatch.** Too long on the playlist kills LL-HLS responsiveness. Too short on the segments kills CDN economics. Both at once kills both.

**Segment-duration drift from `TARGETDURATION`** because IDR placement is not aligned to the segment boundary. The first frame after a discontinuity is then mid-GOP and undecodable.

## Debugging it

**Apple's `mediastreamvalidator`** plus `hlsreport` are mandatory for App Store and Apple TV submissions. They are also the fastest way to find out *why* iOS dropped your variant.

**`ffprobe -show_streams -show_format -show_packets file.m3u8`** for codec, bitrate, and keyframe sanity at the segment level.

**The hls.js demo page at `https://hlsjs.video-dev.org/demo/`** is the universal black-box reproduction site. If your stream breaks there, it's the stream.

**`mp4dump` from Bento4** for fragmented MP4 box inspection. **`tsduck`** or **`tsanalyze` from libtstools** for MPEG-TS analysis.

**Browser dev tools waterfall**, filtered to `m3u8|ts|m4s`. Look for 4xx responses, missing CORS headers, content-type that isn't `application/vnd.apple.mpegurl` or `audio/mpegurl`.

**AVPlayer's `AVMetricEvent` and AVMetrics surfaces** in iOS 18 and later expose variant-switch reasons, segment download durations, and key-load failures directly from the OS.

**CMCD telemetry.** The `CMCD-Session`, `CMCD-Request`, `CMCD-Object`, and `CMCD-Status` headers (CTA-5004) carry buffer length, deadline, requested rate, throughput, and stall events from the player up to the CDN. CMCDv2 (CTA-5004-A) shipped February 2026 and is now native in AVPlayer iOS 18, ExoPlayer, dash.js, and hls.js.

## What's changing in 2026

**`draft-pantos-hls-rfc8216bis-22`, 1 May 2026 — AES-256-GCM.** The single biggest cryptographic addition to HLS in nearly a decade. The bis draft is at version 13. Earlier revisions cycled through 16 (November 2024), 17 (February 2025), 18 (August 2025), 19 (January 2026), and 22 (May 2026).

**The "master playlist" is now the "Multivariant Playlist."** Renamed in the bis draft to retire master/slave terminology.

**HLS Interstitials matured.** WWDC 2024 added `X-CONTENT-MAY-VARY`, `X-TIMELINE-OCCUPIES`, and the Integrated Timeline AVFoundation API. WWDC 2025 added the `com.apple.hls.preload` DATERANGE class for preloading interstitial assets, plus skip-button parameters. AWS MediaTailor added HLS Interstitials support in 2025.

**Content Steering** was pulled out of the HLS bis draft into its own `draft-pantos-content-steering`, currently revision 02 (February 2026), and is now host-protocol-agnostic. Supported in iOS 16 and later, hls.js, dash.js, video.js, and Shaka Player.

**CMCD became universal.** Native in AVPlayer iOS 18 (WWDC 2024). CTA-5004-A — CMCD v2 — was published February 2026.

**AV1 in HLS** is now production-real. iPhone 15 Pro added hardware AV1 decode in 2023; the M3 Macs and M4 iPads followed; Firefox 125 closed the last big browser hole by adding AV1 plus EME in April 2024.

**`AVAssetResourceLoader` is being deprecated** for key loading, in favour of `AVContentKeySession`. Migration is not optional if you want to ship FairPlay on modern iOS.

**MoQ — Media over QUIC.** The IETF MoQ Working Group's core spec is `draft-ietf-moq-transport-17` (March 2026). Cloudflare deployed an MoQ relay at every edge across 330-plus cities in 2025 — the first global MoQ relay network. NAB 2026 on 28 April 2026 demoed MoQ interop across eleven vendors — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — under a new "OpenMOQ Software Consortium." YouTube, Akamai, Cisco, Synamedia, and CDN77 are also in the consortium. Standardisation is expected to reach RFC in 2026.

**Apple Podcasts moved video podcast delivery to HLS in iOS 26.4 (March 2026)** — a protocol invented for iPhone video is now also how audio podcasts are delivered.

## Fun facts (host material)

**M3U is a Winamp inheritance.** The M3U format was created in 1995 by Fraunhofer IIS for WinPlay3 and popularised by Nullsoft's Winamp on 21 April 1997. The "8" in M3U8 is "UTF-8." When Apple needed a playlist format in 2009, they extended the de-facto Winamp text format rather than invent one. The world's most-deployed video protocol still starts every playlist with `#EXTM3U`.

**HLS shipped because of the iPhone.** It debuted on 17 June 2009 with iPhone OS 3.0 alongside the iPhone 3GS. Apple needed something better than progressive MP4 over flaky 3G — HSDPA capped at 7.2 Mbit/s downlink — and something that worked through every corporate firewall. Reusing HTTP on port 443 was a deliberate firewall-traversal play.

**The 2019 Sydney demo.** Pantos at WWDC 2019 session 502: *"You know, we were like, 'Yeah, we could do a live demo, or we could do a Live Stream from Cupertino.' But wouldn't it be more demonstrative to do a live demo from somewhere a little bit further away? Maybe somewhere 7,000 miles away…"* — then he live-streamed his colleague Matt in Sydney with sub-two-second latency.

**"The community gave us low-latency live streaming. Then Apple took it away."** Phil Cluff at Mux titled his now-famous 2019 essay that way. The LHLS community had shipped chunked-transfer-encoded LL-HLS *before* Apple did, and Apple's first version of LL-HLS required HTTP/2 push that almost no CDN supported. On 30 April 2020, Apple capitulated and replaced HTTP/2 push with `EXT-X-PRELOAD-HINT`.

**Pantos announced AV1 support over an IETF mailing list.** The iPhone 15 Pro added hardware AV1 decode and Roger Pantos broke the news not at WWDC but as a quick note to the IETF `hls-interest` list on 12 September 2023: *"There is no new signaling necessary for HLS, just the regular content-specific values for the CODECS and VIDEO-RANGE attributes…"*

**The Disney+ outage was not the CDN.** Industry sources told Variety the issue "appeared rooted in Disney Plus' authentication systems." The BAMTech engineering org Disney bought for $1.58 billion was technically blameless on the streaming side — the HLS pipeline did its job, the auth layer did not.

## Where this connects in the book

- **Part Real-time A/V, chapter "HLS and DASH"** — the full origin story, the M3U-from-Winamp lineage, the Apple-versus-MPEG-DASH format war, the LL-HLS "Apple took it away" drama, the BOLA comeback, and the post-Flash reality where RTMP survives only as a contribution protocol.
- **Part Real-time A/V, chapter "MoQ Transport"** — the protocol the IETF is building to subsume HLS for live, the Cloudflare relay rollout in 330-plus cities in 2025, and the Luke Curley MoQ-Lite fork that signals the spec is not yet converging.

## See also (other protocol episodes)

If you have heard the **DASH episode**, the contrast is the point of both. HLS and DASH solve the same problem — adaptive bitrate over HTTP, segment plus manifest — but DASH's manifest is XML, codec selection is open, and Apple has never natively played it. FairPlay still does not work with DASH. Every iOS app that wants DRM uses HLS through AVPlayer. Co-deployment via CMAF means one set of fMP4 segments serves both stacks; Disney+ ships HLS plus CMAF end to end while Netflix and YouTube ship both formats.

If you have heard the **RTMP episode**, the relationship is now strictly upstream. RTMP was Adobe's TCP protocol on port 1935 for live ingest from encoders into media servers. Adobe officially retired Flash Player on 31 December 2020, killing RTMP for delivery. RTMP survives in 2026 only as a contribution protocol — encoder to cloud — and even there it's losing ground to SRT, which Haivision's 2025 broadcast survey found at 77 percent professional adoption versus RTMP's 58 percent.

If you have heard the **HTTP/1.1 and HTTP/2 episodes**, you already know the substrate. HLS is just files served over web servers; HTTP/2's multiplexing makes frequent playlist polling and segment fetching share a single connection efficiently. LL-HLS originally required HTTP/2 push but Apple relaxed that in April 2020 in favour of `PRELOAD-HINT`. HLS works fine over HTTP/3, with no spec changes — modern CDNs serve HLS over QUIC for first-byte gains.

If you have heard the **TLS episode**, you already know the cryptography. Every HLS playlist, segment, and FairPlay key is delivered over TLS 1.2 or 1.3 on port 443. Apple's App Transport Security mandates HTTPS for all HLS content shipped from iOS apps.

If you have heard the **WebRTC episode**, the comparison is what defines both. WebRTC is sub-500-millisecond, two-way, UDP-and-RTP-based. HLS is one-way, six-to-thirty-second, HTTP-and-TCP-based. Complementary, not competitive: WebRTC for interaction, HLS for one-to-many scale at CDN economics. Hybrid stacks like THEOplayer H5Live, Mux LL-HLS, and Cloudflare Stream are the bridge architecture until MoQ matures.

## Visual cues for image generation

- An annotated multivariant playlist on screen — six lines of text starting with `#EXTM3U`, then three `#EXT-X-STREAM-INF` entries for 360p at 600 kbps, 720p at 2.4 Mbps, and 1080p at 6 Mbps, with arrows pointing from each line to a stack of segment files in a CDN edge cache.
- A horizontal timeline of glass-to-glass latency by stack: WebRTC at about 200 ms on the left, MoQ target at under 1 second, LL-HLS at 2-5 seconds, standard HLS at 6-30 seconds, and at the far right Fubo's measured 86.75-second lag during Super Bowl LVIII on 11 February 2024.
- A side-by-side of one 6-second segment versus four 1.5-second LL-HLS Partial Segments. The full segment is one fat block. The Partial Segments are four thin slivers with `#EXT-X-PRELOAD-HINT` pointing at the next one before it exists.
- A multi-CDN setup steered by a Content Steering server. One player at the bottom, three CDNs across the top — Akamai, Cloudflare, Fastly — and a small steering box that issues pathway IDs. An arrow shows the player switching from Akamai to Cloudflare mid-session.
- An iPhone 3GS in 2009 next to an iPhone 15 Pro in 2026, both playing the same playlist file. The 2009 phone is downloading MPEG-TS segments over HTTP/1.1 on 3G. The 2026 phone is decoding AV1 fragmented MP4 over HTTP/3 with AES-256-GCM encryption.
- A single playlist file zoomed in on the first three characters — `#EXTM3U` — with a dotted line tracing back to a 1995 Fraunhofer M3U file and a Winamp 1.0 splash screen from April 1997.

## Sources

**RFCs and drafts**

- [RFC 8216 — HTTP Live Streaming](https://datatracker.ietf.org/doc/html/rfc8216)
- [draft-pantos-hls-rfc8216bis (latest, May 2026, AES-256-GCM)](https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis)
- [draft-pantos-content-steering-02 (Feb 2026)](https://datatracker.ietf.org/doc/draft-pantos-content-steering/)
- [draft-ietf-moq-transport-17 (Mar 2026)](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [ISO/IEC 23000-19 — CMAF](https://www.iso.org/standard/79106.html)
- [ISO/IEC 23009-1 — DASH](https://www.iso.org/standard/79329.html)
- [CTA-5004 / CMCD](https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf)

**Papers**

- [BOLA — Spiteri, Urgaonkar, Sitaraman, IEEE/ACM ToN 2020](https://www.akamai.com/site/en/documents/research-paper/bola-near-optimal-bitrate-adaptation-for-online-videos.pdf)
- [Improving Bitrate Adaptation in dash.js — Akamai research](https://www.akamai.com/site/en/documents/research-paper/improving-bitrate-adaptation-in-the-dash-reference-player.pdf)
- [Pensieve — Mao, Netravali, Alizadeh, SIGCOMM 2017](https://web.mit.edu/pensieve/content/pensieve-tech-report.pdf)
- [Oboe — Akhtar et al., SIGCOMM 2018](https://dl.acm.org/doi/10.1145/3230543.3230558)
- [Common Media Client Data — Bentaleb et al., NOSSDAV 2021](https://dl.acm.org/doi/10.1145/3458306.3461444)

**Vendor and engineering blogs**

- [Apple Developer — HLS hub](https://developer.apple.com/streaming/)
- [Apple — What's New in HLS, WWDC 2025 PDF](https://developer.apple.com/streaming/Whats-new-HLS.pdf)
- [Apple — HLS Authoring Specification](https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices)
- [Apple WWDC 2019 session 502 — Introducing Low-Latency HLS](https://developer.apple.com/videos/play/wwdc2019/502/)
- [Apple WWDC 2024 session 10114 — HLS Interstitials](https://developer.apple.com/videos/play/wwdc2024/10114/)
- [Mux — The community gave us low-latency live streaming, then Apple took it away](https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away)
- [Mux — A guide to HLS](https://www.mux.com/articles/a-guide-to-http-live-streaming-hls-overview-definition-and-considerations)
- [Bitmovin — WWDC 2024 HLS Updates](https://bitmovin.com/blog/hls-updates-wwdc-2024/)
- [Bitmovin — State of AV1 Playback Support](https://bitmovin.com/blog/av1-playback-support/)
- [AWS — Leverage CMCD on AWS](https://aws.amazon.com/blogs/media/leverage-common-media-client-data-cmcd-data-on-aws/)
- [AWS — HLS Interstitials in MediaTailor](https://aws.amazon.com/blogs/media/support-for-hls-interstitials-in-aws-elemental-mediatailor/)
- [AWS — Lower latency with MediaStore chunked object transfer](https://aws.amazon.com/blogs/media/lower-latency-with-aws-elemental-mediastore-chunked-object-transfer/)
- [Cloudflare — MoQ: Refactoring the Internet's real-time media stack](https://blog.cloudflare.com/moq/)
- [Twitch — Low Latency, High Reach](https://blog.twitch.tv/en/2021/10/25/low-latency-high-reach-creating-an-unparalleled-live-video-streaming-network-at-twitch/)
- [Netflix Tech Blog — HTML5 and Video Streaming](https://netflixtechblog.com/html5-and-video-streaming-a3563b19eb02)
- [Wowza — Apple Low-Latency HLS](https://www.wowza.com/blog/apple-low-latency-hls)
- [Wowza — What is CMAF](https://www.wowza.com/blog/what-is-cmaf)
- [VideoSDK — HLS Specification 2025](https://www.videosdk.live/developer-hub/hls/hls-specification)
- [VideoSDK — HLS Low Latency 2025 Guide](https://www.videosdk.live/developer-hub/hls/hls-low-latency)
- [Dyte — LL-HLS in depth](https://dyte.io/blog/ll-hls-in-depth/)
- [DoveRunner — How FairPlay DRM Works](https://doverunner.com/blogs/what-is-fairplay-drm-how-does-it-work/)
- [VdoCipher — Apple FairPlay DRM 2026](https://www.vdocipher.com/blog/fairplay-drm-ios-safari-html5/)
- [Castlabs — FairPlay Streaming DRM](https://castlabs.com/partners/fairplay-streaming/)
- [Dolby OptiView — Multi-key HLS](https://optiview.dolby.com/docs/theoplayer/how-to-guides/drm/multikey-hls/)
- [Dacast — RTMP vs HLS vs WebRTC 2026](https://www.dacast.com/blog/rtmp-vs-hls-vs-webrtc/)
- [Cloudinary — LL-HLS, CMAF, and WebRTC](https://cloudinary.com/guides/live-streaming-video/low-latency-hls-ll-hls-cmaf-and-webrtc-which-is-best)
- [Pantos — AV1 playback on iPhone 15 Pro, hls-interest list](https://mailarchive.ietf.org/arch/msg/hls-interest/PQX4rr1qQcPP1IIo6hH52JG9lIg/)
- [hls.js GitHub releases](https://github.com/video-dev/hls.js/releases)
- [hls.js demo](https://hlsjs.video-dev.org/demo/)
- [ExoPlayer CMCD docs (Android)](https://developer.android.com/media/media3/exoplayer/cmcd)
- [WINK Streaming — Ultra Low Latency HLS Experiments 2025](https://www.wink.co/documentation/Ultra-Low-Latency-HLS-Experiments-2025)
- [Broadcast Knowledge — BAMTech / Disney+ CMAF](https://thebroadcastknowledge.com/tag/bamtech/)

**News**

- [Variety — Disney+ launch errors](https://variety.com/2019/digital/news/disney-plus-launch-errors-what-went-wrong-1203402270/)
- [CNBC — Disney exec explains Disney+ crash](https://www.cnbc.com/2019/11/20/disney-exec-explains-why-disney-plus-crashed-on-its-first-day.html)
- [NBC News — Disney+ launch failure](https://www.nbcnews.com/business/business-news/did-overly-aggressive-marketing-turn-disney-plus-disney-minus-n1080831)
- [Axios — HBO Max crash on House of the Dragon](https://www.axios.com/2022/08/22/hbo-max-crash-house-of-the-dragon-streaming)
- [Washington Post — HBO Max crash](https://www.washingtonpost.com/business/2022/08/22/hbo-max-crash/)
- [The TV Answer Man — Super Bowl 2024 streaming glitches (Phenix data)](https://tvanswerman.com/2024/02/12/super-bowl-2024-marred-by-streaming-glitches-outages/)
- [Streams Charts — Paris 2024 Olympics streaming](https://streamscharts.com/news/2024-paris-summer-olympics-livestreaming-viewership-results)
- [CBC Kids News — Ibai shatters Twitch record](https://www.cbc.ca/kidsnews/post/9.3-million-viewers-ibai-shatters-twitch-stream-record)
- [Ubuntu USN-7830-1 — FFmpeg HLS CVEs](https://ubuntu.com/security/notices/USN-7830-1)
- [Patchstack — CVE-2025-27325 Video.js HLS Player WordPress plugin](https://patchstack.com/database/wordpress/plugin/videojs-hls-player/vulnerability/wordpress-video-js-hls-player-plugin-1-0-2-cross-site-scripting-xss-vulnerability)

**Wikipedia**

- [HTTP Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming)
- [M3U](https://en.wikipedia.org/wiki/M3U)
- [Dynamic Adaptive Streaming over HTTP](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP)
- [Adobe Flash Player](https://en.wikipedia.org/wiki/Adobe_Flash_Player)
- [Disney Streaming](https://en.wikipedia.org/wiki/Disney_Streaming)
- [iPhone (1st generation)](https://en.wikipedia.org/wiki/IPhone_(1st_generation))
