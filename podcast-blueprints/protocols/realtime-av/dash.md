---
id: dash
type: protocol
name: Dynamic Adaptive Streaming over HTTP
abbreviation: DASH
etymology: "Dynamic [A]daptive [S]treaming over [H]TTP"
category: realtime-av
year: 2012
rfc: ISO/IEC 23009-1
standards_body: iso-iec
podcast_target_minutes: 22
related_book_chapters:
  - realtime-av/hls-and-dash
  - realtime-av/moq-transport
related_protocols: [http1, http2, http3, tls, hls, rtmp, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9110, 9112, 9113, 9114, 9000, 8446]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/100_Winchester_Circle.jpg/500px-100_Winchester_Circle.jpg
    caption: Netflix headquarters at 100 Winchester Circle in Los Gatos, California. Netflix was central to the production validation of MPEG-DASH after the ISO standard landed in 2012.
    credit: Photo — Coolcaesar / CC BY-SA 4.0, via Wikimedia Commons
visual_cues:
  - "An MPD tree diagram — the root MPD box at top, branching down to one Period, then three AdaptationSets (video, audio English, captions French), each fanning out to multiple Representations labelled with bitrate and resolution, each Representation pointing to a SegmentTemplate URL pattern like '$RepresentationID$/$Number%05d$.m4s'."
  - "A side-by-side packaging diagram. On the left: an MP4 file split into init segment (ftyp+moov) and media segments (each moof+mdat). On the right: the same fMP4 segments referenced by both an MPD manifest (DASH) and an M3U8 playlist (HLS) — the CMAF unification."
  - "A timeline of bitrate adaptation: x-axis time in seconds, y-axis bitrate. The line starts at 5 Mbps (1080p), drops to 2.5 Mbps (720p) when measured throughput dips, recovers to 1080p, then briefly switches to 1.2 Mbps (480p) during a buffer dip — overlaid with the buffer occupancy curve that BOLA uses to make the decision."
  - "A latency ladder chart — five horizontal bars. Standard HLS at 20-30 seconds. LL-HLS at 3-6 seconds. LL-DASH at 2-5 seconds. WebRTC under 1 second. MoQ target under 1 second. Each bar annotated with example deployments."
  - "A wire-trace illustration of one Range request: the player issues 'GET /vod/movie.mp4 Range: bytes=2048576-4194303' carrying a CMCD header with br, cid, mtp, and sid fields; the server responds 206 Partial Content with the requested byte range."
  - "An LL-DASH chunked-encoding diagram: one CMAF segment shown as a row of small chunks (one frame each), the encoder emitting them in real time, the HTTP/1.1 chunked-transfer wire pushing each chunk to the player before the parent segment closes, target glass-to-glass latency annotated at 2.8 seconds."
---

# DASH — Dynamic Adaptive Streaming over HTTP

## In one breath

DASH is the open ISO standard that turned a video stream into a stack of MP4 fragments and an XML file pointing at them. Ratified as ISO/IEC 23009-1 in 2012, it underpins YouTube on the web and Android, Netflix on most non-Apple clients, BBC iPlayer, Disney+, DAZN, and Peacock — all of them adapting bitrate on the fly by fetching short segments over plain HTTPS through ordinary CDNs. If you stream video that is not on an iPhone, you almost certainly stream DASH.

## The pitch (cold-open)

On the night of 13 January 2024, an NFL playoff game streamed only on Peacock pulled 27.6 million viewers and consumed roughly thirty percent of all U.S. internet traffic. There was no special server, no proprietary push protocol, no broadcast satellite chain. There was an XML file, a pile of MP4 fragments, and a fleet of HTTP caches that already handled image loads. That XML format is called the Media Presentation Description, the protocol around it is DASH, and an ISO committee wrote it down twelve years earlier so anyone could implement it. This episode is about how a boring XML manifest pointing at boring MP4 files quietly ate live video.

## How it actually works

DASH is HTTP, all the way down. There is no DASH server protocol, no socket lifecycle, no session state on the wire. A DASH client speaks HTTP/1.1, HTTP/2, or HTTP/3 to whatever cache happens to hold the bytes it wants. The protocol is the layout of one XML file plus the format of the segment files that file points at.

The simulator walks four steps. First, the player issues a GET for the MPD — the Media Presentation Description. The response is `application/dash+xml` and describes the entire stream: which time periods exist, what languages and camera angles are available, what bitrates and resolutions can be played, and how to construct the URL of any segment. Second, the player picks an initial Representation — say 1080p H.264 at 5 Mbps — and fetches its initialization segment. That is just the `ftyp` and `moov` boxes of an fMP4 file: codec configuration, no media. It is fetched once per Representation and cached. Third, the player starts pulling media segments via plain GET requests, each one a self-contained `moof+mdat` pair, typically four to six seconds of video at the chosen quality. Fourth, when measured throughput drops, the player switches Representation mid-stream. The next GET goes to a 720p URL instead, and because every Representation is keyframe-aligned, the splice is seamless to the viewer.

That is the entire wire protocol. Everything else — adaptive logic, DRM, low-latency variants, ad insertion, telemetry — is layered on top of this loop.

### Header at a glance

DASH does not have a header in the TCP or RTP sense. The "header" is the MPD, an XML document rooted at `<MPD>` whose `@type` is `static` for video on demand or `dynamic` for live. The hierarchy is:

- **MPD** — the root, with profiles URN, total duration, minimum buffer time, and pointers to optional content steering.
- **Period** — a time span within the presentation. Multiple Periods are how DASH expresses ad breaks and content boundaries.
- **AdaptationSet** — one bundle per content type: video, audio in English, audio in French, captions, an alternate camera angle. ContentProtection descriptors for DRM live here.
- **Representation** — one (codec, bitrate, resolution) tuple. A typical ladder has six to ten Representations per video AdaptationSet.
- **SegmentTemplate**, **SegmentList**, or **SegmentBase** — how to construct segment URLs. SegmentTemplate is the workhorse; it uses `$RepresentationID$`, `$Number$`, `$Time$`, and `$Bandwidth$` placeholders that the client substitutes locally.

For live streams there are extra attributes that matter: `availabilityStartTime` (the UTC anchor for segment-number math), `minimumUpdatePeriod` (how often the client refetches the MPD), `timeShiftBufferDepth` (the DVR window), `suggestedPresentationDelay` (target glass-to-glass latency), and `<UTCTiming>` (clock sync). Mismatched clocks between encoder and packager are the single most common live failure mode in production.

### State machine in three sentences

DASH itself is stateless on the wire — every segment fetch is an independent HTTP GET. The state lives entirely in the player: a small loop that updates bandwidth and buffer estimates each tick, asks the ABR algorithm which quality to fetch next, computes the URL via the SegmentTemplate, issues an HTTP GET (sometimes with a `Range:` header for SegmentBase profiles), feeds the bytes to MSE's `SourceBuffer.appendBuffer`, and recurses on the `updateend` event. Player states reduce to INIT, MANIFEST, LOADING_INIT, BUFFERING, STEADY-STATE, REBUFFERING, and ENDED — with ABR sitting alongside STEADY-STATE deciding the next quality on every fetch.

### Reliability, flow, and security mechanics

Reliability is delegated to TCP or QUIC underneath HTTP — DASH itself just retries failed GETs. Congestion control is the transport's problem. Flow control, in the streaming sense — keeping the buffer full without wasting bandwidth — is the ABR algorithm's job, and ABR is where most of the field's research lives.

Throughput-based ABR picks the highest bitrate at or below measured HTTP throughput times a safety factor. It is brittle on chunked transfer because bytes do not arrive at line rate. BBA, the Buffer-Based Algorithm, was published by Te-Yuan Huang and colleagues at Netflix in 2014 and chooses bitrate as a function of buffer occupancy alone. BOLA — Buffer Occupancy-based Lyapunov Algorithm — was published by Kevin Spiteri, Rahul Urgaonkar, and Ramesh Sitaraman in 2016 and uses Lyapunov optimisation to bound utility loss without requiring throughput prediction. BOLA is the default ABR rule in dash.js, and the paper just won the 2026 IEEE INFOCOM Test of Time Award. MPC — Model Predictive Control, from Yin and colleagues at SIGCOMM 2015 — jointly optimises throughput prediction and buffer dynamics over a short horizon. The dash.js DYNAMIC rule, by Spiteri, Sitaraman, and Sparacio in 2018, switches between BBA and BOLA depending on context.

Security is HTTPS plus DRM. TLS 1.3 protects every MPD and segment fetch. Content protection is signalled in `<ContentProtection>` descriptors at AdaptationSet or Representation level, using ISO Common Encryption (CENC, ISO/IEC 23001-7, latest 2023 edition). Two scheme types matter: `cenc` is AES-128 in counter mode and works with Widevine and PlayReady; `cbcs` is AES-128 in CBC mode with 1:9 pattern encryption and is required for FairPlay and the modern preferred default. PSSH boxes carry per-DRM init data — Widevine UUID `edef8ba9-79d6-4ace-a3c8-27dccb7d29d4`, PlayReady `9a04f079-9840-4286-ab92-e65be0885f95`, W3C ClearKey `1077efec-c0b2-4d02-ace3-3c1e52e2fb4b`. FairPlay's UUID `94ce86fb-07ff-4f43-adb8-93d2fa968ca2` is signalled in HLS only — Apple has never shipped FairPlay over DASH, and Apple's own developer forum thread says so explicitly.

## Where it shows up in production

**YouTube** has used DASH on web and Android since 2014–2015, with HLS on iOS as the fallback. YouTube ships VP9 and increasingly AV1 to bypass HEVC patent-pool fragmentation.

**Netflix** uses a custom DASH variant on most clients and HLS on Apple devices. Netflix pioneered Per-Title and Per-Shot encoding — encoding each title or each shot at its own optimal bitrate ladder rather than using a fixed one. The BOLA algorithm in dash.js was originally validated on Netflix-style traces.

**Disney+, Hulu, and DAZN** dual-package via CMAF — one set of fMP4 segments serves both DASH manifests for Android and web and HLS manifests for Apple. Disney+ in particular runs HLS+CMAF end-to-end. CMAF is the joint Apple+Microsoft fMP4 profile (ISO/IEC 23000-19, first published 2018, fourth edition 2024) that finally let one set of segment files serve both manifest formats.

**BBC iPlayer** is DASH-heavy and drove much of the LL-DASH and 5th-edition standardisation work through DVB.

**Peacock**, NBCU's streaming service, dual-packages HLS and DASH. Peacock's exclusive AFC Wild Card game on 13 January 2024 — Chiefs vs Dolphins — reached 27.6 million total viewers, around 24.6 million concurrent, and consumed roughly 30 percent of U.S. internet traffic during the game. NBCU's own announcement called it the most-streamed live event in U.S. history. The Paris 2024 Olympics on Peacock delivered 23.5 billion streamed minutes — 40 percent more than every prior Summer and Winter Olympics combined, with up to 60 concurrent live event streams and 300 live events per day.

**Globo in Brazil** became the first major broadcaster to deploy VVC/H.266 in production via MPEG-DASH and ROUTE-DASH for SBTVD's TV 3.0 standard, demonstrated at Paris 2024.

**The open-source player stack you actually deploy.** dash.js is the DASH-IF reference player; latest npm release as of this report is 5.1.1 from late 2025/early 2026, with v5.0 adding LCEVC, Preselection, CMCD v2, and L3D-DASH. Shaka Player from Google ships 5.1.1 as of May 2026, with v5.0 in Q1 2026 adding experimental MoQ support and removing legacy MSS. ExoPlayer, now AndroidX Media3, is at 1.10 as of March 2026, with Media3 1.6 adding HLS Interstitials VOD and decoder pre-warming, 1.8 adding SGAI, 1.9 adding a dav1d-based AV1 decoder. Bitmovin Player Web X added a MoQ playback plugin in 2025. THEOplayer covers low-latency HLS and DASH with broad Apple and Android device coverage. GPAC and MP4Box from Télécom Paris, FFmpeg's `dash` muxer, and packagers from Unified Streaming, AWS Elemental MediaPackage, Akamai, Wowza, Nimble, and Bitmovin make up the production packaging side.

**Latency targets in 2026 production:** standard HLS sits at 20-30 seconds, LL-HLS and LL-DASH at 2-6 seconds, WebRTC under 1 second, MoQ targeting under 1 second at HLS-style fanout.

## Things that go wrong

**The Peacock AFC Wild Card scaling story (13 January 2024).** This is the famous incident where nothing went wrong, and that is the story. Peacock's engineering team had six weeks to scale infrastructure for the first ever NFL playoff game streamed exclusively to a streaming service. Internal target: handle 25 million concurrent viewers without a buffering meltdown. The setup was hundreds of CMAF-packaged renditions across multiple CDNs, content steering switching viewers between Akamai, Fastly, and Comcast in real time, and DASH-IF Live Media Ingest v1.2 feeding the packagers from redundant encoders.

The mistake everyone feared was clock skew. A 100-millisecond drift between the encoder cluster and the packager would have made `availabilityStartTime` math wrong, causing every player to either miss the live edge or 404 on the next segment. The skew did not happen. The result was 27.6 million total viewers, 16.3 million concurrent devices, and the strongest argument yet that segmented HTTP streaming over CMAF and DASH-or-HLS is the correct architecture for live at internet scale. The chapter on HLS and DASH carries the full architectural arc.

**The Super Bowl LVIII latency cliff (11 February 2024).** Phenix Real-Time Solutions measured streaming lag against broadcast across major OTT services: Fubo at 86.75 seconds, Hulu Live at 70.16 seconds, Paramount+ at 42.73 seconds. Despite "low-latency" branding everywhere, OTT was still 40-80 seconds behind broadcast. The lesson is that calling something LL-DASH or LL-HLS is not the same as actually configuring it — most production deployments leave the standard 20-30 second buffer. The chapter on HLS and DASH walks through the BOLA comeback and the latency cliff in detail.

**The HEVC patent-pool fragmentation (ongoing).** Three competing pools — Access Advance, Via-LA, MPEG-LA, plus unpooled holders — and uncertain royalty exposure delayed HEVC's web rollout for years and is still rated by industry blogs as the primary reason Chrome, Firefox, and Edge refused to ship HEVC software decode for a decade. Access Advance acquired Via-LA's HEVC and VVC pools in December 2025 but did not consolidate the entire patent landscape. This is the structural reason AV1, royalty-free and AOMedia-stewarded, became Netflix's and YouTube's pragmatic codec on the open web.

**GPAC/MP4Box CVE traffic.** GPAC is by far the most CVE-prolific DASH-adjacent project. Representative entries: CVE-2023-47384 (heap memory leak in `gf_isom_add_chapter`, GPAC 2.3-DEV), CVE-2024-6061 (infinite loop in `isoffin_process` in GPAC 2.5-DEV-rev228), CVE-2024-57184 (heap buffer overflow in 0.8.0), CVE-2026-7135 (out-of-bounds read in `elng_box_read` in GPAC up to 26.03-DEV-rev105), CVE-2026-33144 (heap overflow in `gf_xml_parse_bit_sequence_bs` for crafted NHML files). Ubuntu's package CVE list shows ongoing weekly disclosures. If you run MP4Box in a packaging pipeline, pin a vetted version and rebuild on disclosure cadence. No streaming-specific CVE for dash.js, Shaka Player, or ExoPlayer/Media3 surfaced in the May 2026 review of public databases.

## Common pitfalls (for the practitioner)

- **Encoder/packager clock skew breaks live MPDs.** This is the number-one live failure. Mitigate with `<UTCTiming>` and NTP at both sides; the DASH-IF ingest spec is explicit about timing requirements.
- **Segment misalignment across Representations** breaks bitrate switching mid-segment. Every Representation in an AdaptationSet must start segments at the same wall-clock instants and at IDR keyframes.
- **`minimumUpdatePeriod` longer than `timeShiftBufferDepth`** or the segment duration causes "stuck at end" rebuffer on live streams.
- **CDN cache poisoning of MPDs.** The MPD must be cacheable for very short TTLs only. Many outages trace to a 60-second cache TTL on a 2-second-update LL stream.
- **DRM key rotation breaks playback** when CDM session lifetimes do not track key periods.
- **Codec compatibility surprises.** Firefox HEVC decode arrived in 2024 and only on systems with hardware decoders. AV1 software decode is universal but slow on older devices.
- **Infinite buffer or rebuffering loops.** BOLA and DYNAMIC can oscillate when bandwidth sits exactly at a Representation boundary. dash.js mitigates with `LimitBitrate` rules and `bufferTimeAtTopQuality`.
- **Missing CORS headers on the segment origin.** `Access-Control-Allow-Origin: *` is the minimum for cross-origin MSE feeds. Forget it and the player throws on the very first `appendBuffer`.
- **Wrong MIME type.** The MPD must be served as `application/dash+xml`; fMP4 segments as `video/mp4`. CDNs that auto-detect from extension get this wrong on the `.mpd`.
- **`minimumUpdatePeriod` too long for live** causes late discovery of new segments.
- **Segment availability windows misaligned with `availabilityStartTime`** cause 404s at the live edge.

## Debugging it

The DASH-IF Conformance Validator at `conformance.dashif.org` validates schema, segment timing (`sidx`, `tfdt`), SAP types, alignment, and CMAF, DVB, and HbbTV brand profiles. The staging build at `staging.conformance.dashif.org` runs the development branch. Eyevinn's `dash-validator-js` is the CI-friendly equivalent for manifest checks.

For box-level inspection, `MP4Box -info` from GPAC and `mp4dump` from Bento4 are the standard tools. Wireshark's HTTP dissector plus the DevTools Network waterfall give you per-segment timing.

In the browser, dash.js debug logging is one line: `MediaPlayer().getDebug().setLogToBrowserConsole(true)` plus `setLogLevel(LOG_LEVEL_DEBUG)`. Watch the `MediaSource` and `SourceBuffer` events in the DevTools console. Shaka Player exposes its stats via `player.getStats()`.

CMCD — Common Media Client Data, CTA-5004 — is the telemetry channel. The player attaches structured key/value pairs to each request as a header `CMCD: ...` or query `?CMCD=...`. The fields you actually want to monitor: `bs` (buffer starvation), `mtp` (measured throughput), `nor` (next-object request), `ot` (object type), `su` (startup), `pr` (playback rate), `br` (bitrate), `cid` (content ID), `sid` (session ID). CMCD v2, CTA-5004-A, was published in February 2026 and adds QoE and QoS extension fields. Both ExoPlayer/Media3 (since 1.6) and dash.js (since 4.4) support CMCD natively; AVPlayer added native CMCD support in iOS 18 at WWDC 2024.

The dash.js tuning knobs to know: `streaming.delay.liveDelay` and `liveDelayFragmentCount` for target latency-to-live-edge; `streaming.buffer.stableBufferTime` (default 12 seconds — drop to 6-8 for live); `streaming.buffer.bufferTimeAtTopQuality` for extra buffer at max bitrate; `streaming.abr.activeRules.bolaRule.active` to toggle BOLA; `streaming.cmcd.enabled` and `streaming.cmcd.mode` for CMCD as header or query; `streaming.liveCatchup.maxDrift` and `playbackRate.min/max` for LL-DASH speed-correction. Defaults to be skeptical of: `streaming.abr.useDefaultABRRules = true` is fine for VOD but often poor for live (consider DYNAMIC or L2A); `streaming.retryAttempts.MPD = 3` is too few for flaky live origins; `lowLatencyEnabled = false` must be explicitly turned on.

What to monitor in production: rebuffer ratio (target ≤ 0.5%), startup time or time-to-first-frame (target < 2 s VOD, < 4 s live), average and P95 bitrate, bitrate switches per minute (target ≤ 1), and latency-to-live-edge distribution. The Envivio test stream `https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd` has been the "hello-world" DASH stream for over a decade.

## What's changing in 2026

**ISO/IEC FDIS 23009-1 6th edition** reached stage 50.00 (FDIS approved) in April 2025, with close of voting on 20 July 2024. As of May 2026 it is not yet at "60.60 published" status — treat the 6th edition as imminent rather than published. The 6th edition introduces L3D-DASH (Low-Latency, Low-Delay DASH) with Segment Sequence Representations for sub-second join times without requiring continuous chunked transfer; the Fraunhofer paper at MHV 2025 covers the design.

**ISO/IEC 23009-9:2025 (REaP — Redundant Encoding and Packaging for segmented live media)** was published on 9 May 2025. **ISO/IEC 23009-8:2025 (Session-based DASH operations)** also landed in 2025.

**DASH-IF merged into the Streaming Video Technology Alliance (SVTA) on 23 July 2024**, ending its independent existence as a standards organisation. All task forces continue under the SVTA umbrella. Akamai joined SVTA as a Principal Member in September 2024.

**CMCD v2 / CTA-5004-A was released in February 2026**, adding QoE and QoS extension fields. dash.js 5.x and ExoPlayer/Media3 1.1+ ship CMCD v2 natively; Shaka Player 4.16 added it; DVB-DASH adopted CMCD in 2024.

**DASH-IF Content Steering** was published as ETSI TS 103 998 v1.1.1 in January 2024. It defines a `<ContentSteering>` element pointing at a steering server that returns JSON with `VERSION`, `TTL`, `RELOAD-URI`, and `PATHWAY-PRIORITY`. It is compatible with HLS Content Steering (RFC 8216bis), so a single steering service can drive both. dash.js 4.5+ and Shaka Player 4.x implement it; Brightcove's Reznik et al. paper at IBC 2024 reports multi-CDN deployment results.

**DASH-IF Live Media Ingest v1.2** landed on 28 February 2024, the spec that fed Peacock's redundant encoder pipeline for the AFC Wild Card.

**ISO/IEC 23000-19:2024 (CMAF, 4th edition)** published in 2024.

**L3D-DASH integrated into dash.js v5.x** via PR #4839. IBC 2025 Accelerator demonstrated SGAI plus L3D-DASH plus CMCD v2 for ultra-low-latency live.

**AV1 and VVC rollout.** AV1 is the universal browser and Android codec for the open web. VVC reached its first hardware-decoder milestone with Intel Lunar Lake (Core Ultra Series 2) in September 2024. Brazil's TV 3.0 (Globo, 2025) is the first national broadcast standard built on VVC plus LCEVC plus MPEG-H Audio over MPEG-DASH and ROUTE-DASH.

**Apple's MSE-on-iPhone shift.** Apple's `ManagedMediaSource` API in Safari 17+ loosens MSE restrictions on iPhone, making DASH-via-Shaka or dash.js viable on iPhones for the first time. The platform position has not moved — AVPlayer still does not play DASH natively, FairPlay still does not encrypt DASH content — but the workaround path has finally opened.

**Media over QUIC (MoQ)** is the credible long-term successor for distribution-side workloads. `draft-ietf-moq-transport-17` was published 29 April 2026. Cloudflare runs an open-source MoQ relay (`moq-rs`) network across 330+ cities; Bitmovin shipped MoQ playback in Player Web X; Meta and Google co-implement for interop. NAB 2026 demoed MoQ interop across eleven vendors under a new "OpenMOQ Software Consortium." MoQ is positioned to replace HLS and DASH for live delivery, not to replace WebRTC for two-way calls. The MoQ Transport chapter carries the full story including the working-group fork between MoqTransport and Luke Curley's `draft-lcurley-moq-lite-02`.

**LL-DASH and LL-HLS convergence.** Will Law's RFC 8673 byte-range pattern lets a single CMAF segment stream serve both LL-DASH chunked-transfer clients and LL-HLS partial-segment clients. This was practically realised in 2024-2025 via DASH-IF Live Media Ingest v1.2.

**ML-based ABR.** The Pensieve line from MIT plus 2024 reinforcement-learning variants (Bentaleb et al., IEEE TMC 2024) and the ATHENA lab's "DeepStream" (IEEE TCSVT, April 2025). Not yet shipped as a default in dash.js but increasingly common in commercial players.

**DASH-IF/MPEG sunsets.** SAND (23009-5) is effectively superseded by CMCD/CMSD in production. XLink-based ad insertion is being replaced by Media Presentation Insertion (MPI) in the 6th edition.

## Fun facts (host material)

**Why XML and not JSON?** DASH was specified inside MPEG (ISO/IEC) in 2010-2012, when XML Schema was the SC29 standard for normative documents and XSD validation tooling was assumed. JSON would arguably be cleaner today; CMCD reactively uses both query and JSON forms. Iraj Sodagar's MPEG-DASH tutorial book lists the four parts and motivates the XML choice.

**The structural reason HLS won mobile.** Apple devices have never natively played DASH, and FairPlay still does not work with DASH — Apple's own developer forum thread confirms it. Every iOS app must use HLS through AVPlayer. DASH on iOS is a custom-decoder situation via MSE. This is the structural reason HLS won the format war: Apple wouldn't switch.

**The CMAF olive branch.** The Apple-Microsoft holdout was unwound when both companies jointly brought CMAF to MPEG meeting #114 in San Diego, February 2016. It was ratified as ISO/IEC 23000-19:2018. Roger Pantos as HLS technical lead and David Singer as the long-standing MPEG editor of ISO BMFF were pivotal.

**BOLA's INFOCOM Test of Time.** Kevin Spiteri and Ramesh Sitaraman at UMass published BOLA at INFOCOM 2016. In 2026 the paper won the IEEE INFOCOM Test of Time Award. BOLA has been the dash.js default for years and is "near-optimal" without requiring throughput prediction — the proof uses Lyapunov optimisation to bound utility loss as O(1/V).

**Will Law's "Chunky Monkey".** The Demuxed 2018 talk where Will Law of Akamai crystallised chunked-encoded chunked-transferred CMAF as the path to LL-DASH. The reference Akamai/dash.js demo — AVC 720p at 2 Mbps, 6-second segments, 1-frame chunks at 29.97 fps, target latency 2.8 seconds — proved end-to-end glass-to-glass of around 3 seconds was achievable on commodity CDN.

**The Envivio Easter egg.** The public reference test stream `https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd` has been the "hello-world" DASH stream for over a decade. Every dash.js demo, every conference talk, every "does my player work" check in the field has hit it at some point.

## Where this connects in the book

- **Part Real-time A/V — "HLS and DASH"** — the full origin story from Apple's June 2009 HLS launch through the M3U-from-Winamp inheritance, the DASH-IF politics, the Apple low-latency drama and the EXT-X-PRELOAD-HINT capitulation in April 2020, the Super Bowl LVIII latency-cliff measurements, and the Peacock AFC Wild Card scaling story.
- **Part Real-time A/V — "MoQ Transport"** — the first IETF media transport that intentionally is not RTP, the Twitch Warp prototype that seeded the working group, the inside-the-WG fork between MoqTransport and MoQ-Lite, Cloudflare's 330-city relay deployment, and what happens to DASH if MoQ actually ships at HLS-style scale.

## See also (other protocol episodes)

**The HLS episode.** HLS shipped on 17 June 2009 with iPhone OS 3.0 — a 2007/2008 firewall-traversal play that turned out to define a generation of streaming. HLS uses M3U8 playlists (text, simpler, opinionated defaults) where DASH uses MPD (XML, more flexible, codec-agnostic). HLS is native in Safari, iOS, and Apple TV; DASH requires MSE plus a JavaScript player like dash.js or Shaka. The "HLS won mobile, DASH won everything else" framing holds: every iOS/iPadOS app uses HLS through AVPlayer, while YouTube, Netflix, Disney+, BBC iPlayer, DAZN, and most Android and web stacks ship DASH (often dual-encapsulated via CMAF). If you have heard the HLS episode, the DASH episode is the same idea with a different manifest format and a different patent and licensing trajectory.

**The HTTP/1.1 episode.** DASH is HTTP requests all the way down. The MPD comes over a single GET; segments come over GETs; SegmentBase profiles use `Range: bytes=...` for byte-range subsegment fetches via RFC 9110 §14. CDNs cache MPDs and segments as ordinary objects, which is the entire reason DASH scales — the existing image-and-page CDN mesh just works for video.

**The HTTP/2 episode.** Multiplexing helps when a player issues many small chunk requests (LL-DASH's pull-style sub-segment fetches), but per-connection head-of-line blocking on TCP can hurt under loss. HTTP/2 server push has been deprecated by Chromium and removed from Apple's LL-HLS spec in favor of `EXT-X-PRELOAD-HINT` and DASH `Resync`.

**The HTTP/3 episode.** HTTP/3 over QUIC eliminates TCP head-of-line blocking, allows 0-RTT resumption, and gives streams independent loss recovery. Empirical results are mixed: a 2024-2025 academic study (CNRG/UNH) found HTTP/3+QUIC can outperform HTTP/2+TCP in lossy scenarios for low-latency ABR, while a UMich study found userspace QUIC can be up to 45% slower than HTTP/2 above 500 Mbps due to receive-side processing overhead. Bitmovin and Cloudflare are actively running MoQ-over-QUIC fan-out experiments.

**The TLS episode.** All major OTT services require HTTPS; TLS 1.3 enables 1-RTT and (for DASH GETs only — never license calls) 0-RTT. Segment fetches are idempotent and replay-safe; license requests are not, which is why TLS 1.3 0-RTT is enabled selectively.

**The RTMP episode.** RTMP was Adobe's persistent TCP protocol for live ingest from encoder to origin. Flash player end-of-life was 31 December 2020, killing RTMP for delivery. RTMP survives only as the dominant ingest contribution protocol, while Haivision's 2025 broadcast survey found SRT adoption among professionals reached 77% in 2025 (up from 68% in 2024), surpassing RTMP's 58%. WHIP (RFC 9725, March 2025) is the modern WebRTC-based ingest replacement. DASH lives on the delivery side; RTMP and now WHIP on the ingest side.

**The QUIC episode.** QUIC is the substrate that HTTP/3 runs on, and the substrate that MoQ will run on. The four problems QUIC solves (handshake latency, head-of-line blocking, ossification, mobility) are the four reasons DASH-on-HTTP/3 and MoQ-on-QUIC are credible paths forward.

## Visual cues for image generation

- An MPD tree diagram — the root MPD box at top, branching down to one Period, then three AdaptationSets (video, audio English, captions French), each fanning out to multiple Representations labelled with bitrate and resolution, each Representation pointing to a SegmentTemplate URL pattern like `$RepresentationID$/$Number%05d$.m4s`.
- A side-by-side packaging diagram. On the left: an MP4 file split into init segment (`ftyp+moov`) and media segments (each `moof+mdat`). On the right: the same fMP4 segments referenced by both an MPD manifest (DASH) and an M3U8 playlist (HLS) — the CMAF unification.
- A timeline of bitrate adaptation: x-axis time in seconds, y-axis bitrate. The line starts at 5 Mbps (1080p), drops to 2.5 Mbps (720p) when measured throughput dips, recovers to 1080p, then briefly switches to 1.2 Mbps (480p) during a buffer dip — overlaid with the buffer occupancy curve that BOLA uses to make the decision.
- A latency ladder chart — five horizontal bars. Standard HLS at 20-30 seconds. LL-HLS at 3-6 seconds. LL-DASH at 2-5 seconds. WebRTC under 1 second. MoQ target under 1 second. Each bar annotated with example deployments.
- A wire-trace illustration of one Range request: the player issues `GET /vod/movie.mp4 Range: bytes=2048576-4194303` carrying a CMCD header with `br`, `cid`, `mtp`, and `sid` fields; the server responds 206 Partial Content with the requested byte range.
- An LL-DASH chunked-encoding diagram: one CMAF segment shown as a row of small chunks (one frame each), the encoder emitting them in real time, the HTTP/1.1 chunked-transfer wire pushing each chunk to the player before the parent segment closes, target glass-to-glass latency annotated at 2.8 seconds.

## Sources

### RFCs and standards

- [ISO/IEC 23009-1 (5th ed., free PDF + schemas)](https://standards.iso.org/iso-iec/23009/-1/ed-5/en/)
- [ISO/IEC FDIS 23009-1 (6th edition project page)](https://www.iso.org/standard/89027.html)
- [ISO/IEC 23009-1:2012 — first edition](https://www.iso.org/standard/57623.html)
- [ISO/IEC 23009-1:2019 — third edition](https://www.iso.org/standard/75485.html)
- [ISO/IEC 23009-8:2025 — Session-based DASH operations](https://www.iso.org/standard/85455.html)
- [ISO/IEC 23009-9:2025 — REaP](https://www.iso.org/standard/85639.html)
- [ISO/IEC 23000-19:2024 — CMAF, 4th edition](https://www.iso.org/standard/85623.html)
- [ISO/IEC 23001-7:2023 — Common Encryption (CENC)](https://www.iso.org/standard/84637.html)
- [ISO/IEC 23000-19:2018 — CMAF, 1st edition](https://www.iso.org/standard/71975.html)
- [ETSI TS 103 998 — DASH-IF Content Steering](https://www.etsi.org/deliver/etsi_ts/103900_103999/103998/01.01.01_60/ts_103998v010101p.pdf)
- [CTA-5004 — CMCD v1](https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [W3C Media Source Extensions (MSE)](https://www.w3.org/TR/media-source-2/)
- [W3C Encrypted Media Extensions (EME)](https://www.w3.org/TR/encrypted-media/)
- [W3C EME Stream Format MP4](https://www.w3.org/TR/eme-stream-mp4/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [draft-ietf-wish-whep-01](https://datatracker.ietf.org/doc/html/draft-ietf-wish-whep-01)

### Papers

- [Spiteri, Urgaonkar, Sitaraman — BOLA (arXiv 2016)](https://arxiv.org/abs/1601.06748)
- [Huang et al. — Buffer-Based Approach (arXiv 2014)](https://arxiv.org/pdf/1401.2209)
- [Sodagar — MPEG-DASH (IEEE MultiMedia 2011)](https://dl.acm.org/doi/10.1109/MMUL.2011.71)
- [QUIC and Adaptive Streaming (UNH CNRG)](https://www.cs.unh.edu/cnrg/publications/quic-ants-2022.pdf)
- [QUIC at high bandwidth (UMich, arXiv)](https://arxiv.org/pdf/2310.09423)
- [Brightcove — Content Steering at IBC 2024](https://dl.acm.org/doi/10.1145/3638036.3640293)
- [Fraunhofer — L3D-DASH at MHV 2025](https://publica.fraunhofer.de/entities/publication/0f55588f-ed8a-4115-8958-d1e7ddabc595)
- [UMass — BOLA wins INFOCOM Test of Time 2026](https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award)

### Vendor and engineering blogs

- [DASH-IF homepage](https://dashif.org/)
- [DASH-IF guidelines hub](https://dashif.org/guidelines/)
- [DASH-IF IOP v5](https://dashif.org/guidelines/iop-v5/)
- [DASH-IF Live Media Ingest v1.2](https://dashif.org/news/ingest-v1-2/)
- [DASH-IF 5th edition announcement](https://dashif.org/news/5th-edition/)
- [DASH-IF joins SVTA](https://dashif.org/news/svta/)
- [DASH-IF Conformance Validator](https://conformance.dashif.org/)
- [DASH-IF validators page](https://dashif.org/tools/validators/)
- [dash.js GitHub](https://github.com/Dash-Industry-Forum/dash.js)
- [dash.js docs](https://dashif.org/dash.js/)
- [dash.js L3D-DASH issue #4510](https://github.com/Dash-Industry-Forum/dash.js/issues/4510)
- [dash.js npm package](https://www.npmjs.com/package/dashjs)
- [Shaka Player GitHub](https://github.com/shaka-project/shaka-player)
- [Shaka Player roadmap](https://github.com/shaka-project/shaka-player/blob/main/roadmap.md)
- [Shaka Player npm](https://www.npmjs.com/package/shaka-player)
- [Shaka Player codelabs](https://shaka-player-demo.appspot.com/docs/api/tutorial-welcome.html)
- [AndroidX Media3 release notes](https://developer.android.com/jetpack/androidx/releases/media3)
- [Android DASH developer guide](https://developer.android.com/media/media3/exoplayer/dash)
- [Media3 1.9.0 release announcement](https://android-developers.googleblog.com/2025/12/media3-190-whats-new.html)
- [Eyevinn dash-validator-js](https://github.com/Eyevinn/dash-validator-js)
- [GPAC wiki](https://github.com/gpac/gpac/wiki)
- [GPAC Common Encryption guide](https://github.com/gpac/gpac/wiki/Common-Encryption)
- [Akamai blog](https://www.akamai.com/blog)
- [Akamai — Will Law on byte-range LL-HLS interop](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)
- [Akamai — Best practices for ultra-low-latency CMAF](https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html)
- [Akamai joins SVTA](https://www.akamai.com/newsroom/press-release/akamai-joins-the-streaming-video-technology-alliance)
- [Bitmovin blog](https://bitmovin.com/blog/)
- [Bitmovin × Cloudflare on Media over QUIC](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)
- [Bitmovin FairPlay DRM how-to](https://developer.bitmovin.com/encoding/docs/how-to-create-fairplay-drm-protected-content)
- [Mux blog](https://www.mux.com/blog)
- [Mux — HLS overview](https://www.mux.com/articles/a-guide-to-http-live-streaming-hls-overview-definition-and-considerations)
- [Mux — HLS vs DASH](https://www.mux.com/articles/hls-vs-dash-what-s-the-difference-between-the-video-streaming-protocols)
- [Mux — "The community gave us low-latency live streaming, then Apple took it away"](https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away)
- [Wowza — What is CMAF](https://www.wowza.com/blog/what-is-cmaf)
- [Wowza — Apple Low-Latency HLS](https://www.wowza.com/blog/apple-low-latency-hls)
- [Wowza — Low-latency CMAF chunked transfer encoding](https://www.wowza.com/blog/low-latency-cmaf-chunked-transfer-encoding)
- [Wowza — HLS vs DASH](https://www.wowza.com/blog/hls-vs-dash)
- [Wowza — VVC explained](https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained)
- [BBC R&D blog](https://www.bbc.co.uk/rd/blog)
- [The Broadcast Knowledge — Chunky Monkey writeup](https://thebroadcastknowledge.com/2018/10/26/video-chunky-monkey-using-chunked-encoded-chunked-transferred-cmaf-to-bring-low-latency-live-to-very-large-scale-audiences/)
- [The Broadcast Knowledge — LL-HLS tag](https://thebroadcastknowledge.com/tag/llhls/)
- [Streaming Media magazine](https://www.streamingmedia.com/)
- [Streaming Media — LL-HLS spec finalisation](https://www.streamingmedia.com/Articles/Editorial/Featured-Articles/Low-Latency-HLS-Spec-Nears-Finalization-142921.aspx)
- [Streaming Media — CMAF history](https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=128552)
- [Telefónica — What is CMAF](https://www.telefonicaserviciosaudiovisuales.com/en/audiovisual-divulging-articles/what-is-cmaf-and-why-does-it-matter/)
- [GetStream — CMAF glossary entry](https://getstream.io/glossary/common-media-application-framework/)
- [Gumlet — FairPlay DRM](https://www.gumlet.com/learn/fairplay-drm/)
- [Unified Streaming — CMAF FAQ](https://docs.unified-streaming.com/faqs/cmaf/index.html)
- [VdoCipher — MPEG-DASH explainer](https://www.vdocipher.com/blog/mpeg-dash/)
- [DVB — CMCD for DVB-I](https://dvb.org/?standard=commercial-requirements-for-the-use-of-common-media-client-data-in-dvb-i)
- [DVB — CMCD adoption](https://dvb.org/news/common-media-client-data-does-it-matter-for-dvb/)
- [Einbliq — CMCD v2 release](https://einbliq.io/cmcd-v2-is-officially-released/)
- [Cloudflare — OSI primer](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
- [Apple Developer Forums — FairPlay and DASH](https://developer.apple.com/forums/thread/105727)
- [Apple — HLS Pantos draft](https://developer.apple.com/streaming/HLS-draft-pantos.pdf)
- [W3C — CMAF draft archive](https://www.w3.org/2011/webtv/wiki/images/c/c6/WAVE-CMAF_-_Draft_A.pdf)
- [Heavybit Demuxed podcast — Joey Parrish on Shaka](https://www.heavybit.com/library/podcasts/demuxed/ep-20-exploring-shaka-player-with-joey-parrish)
- [WebRTCHacks — WHIP and OBS](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)
- [MainConcept — Paris Olympics 2024](https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024)
- [FlatpanelsHD — Intel Lunar Lake VVC support](https://www.flatpanelshd.com/news.php?subaction=showfull&id=1725428953)
- [Streamlink — Twitch low-latency notes](https://streamlink.github.io/cli/plugins/twitch.html)
- [Dacast — low-latency video streaming guide](https://www.dacast.com/blog/best-low-latency-video-streaming-solution/)
- [Demuxed 2024 conference](https://2024.demuxed.com/)
- [Demuxed 2025 conference](https://2025.demuxed.com/)
- [IBC — Content Steering 2024 paper](https://www.ibc.org/accelerating-innovation/reports/ibc2024-tech-papers-content-steering-a-standard-for-multi-cdn-streaming/21401)
- [IBC 2025 Accelerator — Ultra-low-latency live](https://show.ibc.org/accelerator-project-ultra-low-latency-live-streaming-scale)
- [ATHENA Lab — Christian Timmerer](https://athena.itec.aau.at/)
- [Christian Timmerer — AAU profile](https://www.aau.at/team/timmerer-christian/)
- [Multimediacommunication — Christian Timmerer blog](https://multimediacommunication.blogspot.com/p/about.html)
- [Iraj Sodagar — LinkedIn](https://www.linkedin.com/in/iraj-sodagar/)
- [MPEG meeting #138](https://www.mpeg.org/meetings/mpeg-138/)
- [IETF Blog — MoQ overview](https://www.ietf.org/blog/moq-overview/)
- [IETF — MoQ Working Group](https://datatracker.ietf.org/group/moq/about/)
- [Medium — Media over QUIC primer](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce)
- [Sodagar — MPEG-DASH: a Tutorial (book)](https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ)

### News

- [NBCUniversal — Peacock AFC Wild Card record](https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage)
- [NBCUniversal — Paris 2024 dominance](https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms)
- [CNN — Peacock NFL ratings](https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html)
- [Yahoo Finance — Peacock AFC viewership](https://finance.yahoo.com/news/peacock-exclusive-afc-wild-card-040600187.html)
- [Broadband TV News — DASH-IF merges into SVTA](https://www.broadbandtvnews.com/2024/07/24/dash-industry-forum-dash-if-merges-into-svta/)
- [SVTA — DASH-IF becomes part of SVTA](https://www.svta.org/2024/07/23/dash-if-becomes-part-of-the-svta/)
- [BusinessWire — DASH-IF 2013 founding](https://www.businesswire.com/news/home/20130619005336/en/)
- [Content+Technology — MPEG Systems Emmy](https://content-technology.com/technical-standards/mpeg-systems-receives-two-emmy-awards/)

### CVE references

- [CVE-2023-47384 — GPAC heap leak](https://www.cvedetails.com/cve/CVE-2023-47384/)
- [CVE-2024-6061 — GPAC infinite loop](https://cvefeed.io/vuln/detail/CVE-2024-6061)
- [GPAC heap overflow advisory](https://vulert.com/vuln-db/debian-11-gpac-163358)
- [CVE-2026-7135 — GPAC out-of-bounds read](https://radar.offseq.com/threat/cve-2026-7135-out-of-bounds-read-in-gpac-a1c73700)
- [GPAC NHML heap overflow advisory](https://vulert.com/vuln-db/gpac-is-an-open-source-multimedia-framework--prior-to-commit-86b0e36--a-heap-based-buffer-overflow-----)
- [Ubuntu — GPAC CVE list](https://ubuntu.com/security/cves?package=gpac)
- [dash.js security advisories](https://github.com/Dash-Industry-Forum/dash.js/security/advisories)

### Wikipedia

- [Dynamic Adaptive Streaming over HTTP — Wikipedia](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP)
- [Versatile Video Coding — Wikipedia](https://en.wikipedia.org/wiki/Versatile_Video_Coding)
