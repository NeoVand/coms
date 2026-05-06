---
prompt_source: deep-research-prompts.txt:7187-7366 (PROTOCOL · DASH)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/17e2ab7b-c6a0-4f6d-a829-28bc82a8239c
research_mode: claude.ai Research
---

# MPEG-DASH (ISO/IEC 23009-1): A 2026 Engineer's Deep Dive

> **Today's date for this report:** 5 May 2026. The user requested 2024–2026 sources be preferred and older claims verified. Where I could not find a 2024–2026 primary source for a long-standing claim (e.g., the 2009-era proposal call) I cite the most authoritative source available and flag it. Where a fact had no defensible source it is marked `[needs source]`.

## Prerequisites and glossary

A minimal DASH implementation requires comfort with everything in this section.

**Networking primitives**

- **OSI / TCP-IP layers** — DASH is an *application-layer* protocol that runs on HTTP (application) over TLS (presentation/session) over TCP or QUIC (transport) over IP (network). Cloudflare's overview is a good primer: [https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/).
- **Socket** — the (IP, port, protocol) endpoint that an OS exposes to a process; HTTP requests are sent through a TCP or QUIC socket.
- **Header** — typed key/value metadata at the start of a protocol message (e.g., `Range: bytes=0-1023`).
- **Checksum / CRC** — integrity field; QUIC and TLS use AEAD authentication tags rather than simple CRCs (RFC 9000 §5.4).
- **Handshake** — the exchange that establishes a session: TCP three-way SYN/SYN-ACK/ACK, plus TLS 1.3 in 1-RTT or 0-RTT (RFC 8446 §1.2 [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)).
- **Stream / frame / datagram** — *Stream*: an ordered byte sequence (HTTP/2 stream, QUIC stream). *Frame*: a typed unit inside a stream (HTTP/2 DATA/HEADERS frames; in video, also a coded picture). *Datagram*: an unreliable bounded message (UDP, QUIC DATAGRAM extension).
- **HTTP/1.1 (RFC 9112), HTTP semantics (RFC 9110), Range requests (RFC 9110 §14)** — DASH segment fetches are HTTP GETs, often with `Range: bytes=…` for SegmentBase profiles. [https://www.rfc-editor.org/rfc/rfc9110](https://www.rfc-editor.org/rfc/rfc9110), [https://www.rfc-editor.org/rfc/rfc9112](https://www.rfc-editor.org/rfc/rfc9112).
- **HTTP/2 (RFC 9113)** — stream multiplexing over one TCP connection with HPACK header compression. [https://www.rfc-editor.org/rfc/rfc9113](https://www.rfc-editor.org/rfc/rfc9113).
- **HTTP/3 (RFC 9114) over QUIC (RFC 9000)** — same semantics as HTTP/2 but over QUIC, eliminating TCP head-of-line blocking. [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114), [https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000).
- **TLS handshake** — TLS 1.2 = 2-RTT, TLS 1.3 = 1-RTT (or 0-RTT for resumed sessions). 0-RTT is replay-vulnerable so DASH segments (idempotent GETs) are usually safe but license requests are not.

**Video & audio coding**

- **H.264/AVC (ISO/IEC 14496-10)**, **H.265/HEVC (ITU-T H.265 / ISO/IEC 23008-2)**, **AV1 (AOMedia, RFC 9577 bitstream)**, **VP9 (RFC 8521 / WebM)**, **H.266/VVC (ITU-T H.266 / ISO/IEC 23090-3)** — block-based hybrid video codecs. VVC delivers ~50% bitrate savings over HEVC at the cost of ~10× encode complexity (Wikipedia summary backed by JVET test results: [https://en.wikipedia.org/wiki/Versatile_Video_Coding](https://en.wikipedia.org/wiki/Versatile_Video_Coding); Wowza overview [https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained](https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained)). [Wowza](https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained)
- **GOP (Group of Pictures)** — a sequence beginning with a key frame; in HEVC/AVC the IDR (Instantaneous Decoder Refresh) frame is what allows random access.
- **IDR frame** — keyframe that flushes the decoder buffer; DASH segment boundaries normally start at IDRs.

**Container formats**

- **ISO BMFF / MP4 (ISO/IEC 14496-12)** — the box-based container DASH uses by default. Key boxes: `ftyp`, `moov` (movie metadata), `moof` (movie fragment), `mdat` (media data), `sidx` (segment index), `tfdt` (track-fragment decode time), `pssh` (DRM init data), `styp` (segment type).
- **fMP4 (fragmented MP4)** — MP4 broken into independent `moof+mdat` fragments suitable for streaming.
- **WebM** — Matroska-based container used historically with VP8/VP9 over DASH.
- **MPEG-TS (ISO/IEC 13818-1)** — 188-byte packet stream used by HLS.ts and broadcast; supported as an alternative DASH segment format.
- **CMAF (ISO/IEC 23000-19)** — fMP4 profile that *both* DASH and HLS can ingest. Latest edition: 23000-19:2024 ([https://www.iso.org/standard/85623.html](https://www.iso.org/standard/85623.html)). Originated as an Apple+Microsoft proposal at MPEG #114 (San Diego, Feb 2016) and was first published in 2018 ([https://www.iso.org/standard/71975.html](https://www.iso.org/standard/71975.html); W3C/CTA WAVE deck [https://www.w3.org/2011/webtv/wiki/images/c/c6/WAVE-CMAF_-_Draft_A.pdf](https://www.w3.org/2011/webtv/wiki/images/c/c6/WAVE-CMAF_-_Draft_A.pdf)). [W3C](https://www.w3.org/2011/webtv/wiki/images/c/c6/WAVE-CMAF_-_Draft_A.pdf)[Telefónica Servicios Audiovisuales](https://www.telefonicaserviciosaudiovisuales.com/en/audiovisual-divulging-articles/what-is-cmaf-and-why-does-it-matter/)
- **Codec vs container** — codec = how samples are compressed (AVC, HEVC); container = how compressed samples are wrapped with timing/index metadata (ISO BMFF, MPEG-TS).

**Browser media APIs**

- **Media Source Extensions (MSE, W3C)** — JS API that lets a player feed segment bytes into a `<video>` element via `SourceBuffer`. [https://www.w3.org/TR/media-source-2/](https://www.w3.org/TR/media-source-2/). [GitHub](https://github.com/shaka-project/shaka-player)
- **Encrypted Media Extensions (EME, W3C)** — DRM bridge between JS and the platform's Content Decryption Module (CDM). [https://www.w3.org/TR/encrypted-media/](https://www.w3.org/TR/encrypted-media/).

**DRM systems**

- **Widevine** (Google, UUID `edef8ba9-79d6-4ace-a3c8-27dccb7d29d4`), **PlayReady** (Microsoft, `9a04f079-9840-4286-ab92-e65be0885f95`), **FairPlay Streaming** (Apple — only with HLS, never DASH on Apple devices natively; Apple's own developer thread confirms this — [https://developer.apple.com/forums/thread/105727](https://developer.apple.com/forums/thread/105727)).

**DASH-specific terms**

- **MPD (Media Presentation Description)** — XML manifest at `application/dash+xml`.
- **Period / AdaptationSet / Representation / SegmentTemplate / SegmentTimeline / SegmentList / SegmentBase / BaseURL** — see "How it actually works" below.
- **Bitrate ladder** — discrete (resolution, bitrate, codec) tuples encoded for ABR; e.g., 270p@400 kbps … 2160p@15 Mbps.
- **ABR (Adaptive Bitrate)** — algorithm choosing which Representation to fetch next.
- **Manifest, segment, chunk, init segment, sidx, byte-range request** — manifest = MPD; segment = one fetchable media unit (1–10 s typical); chunk = sub-segment unit used for low-latency (CMAF chunks of 1 frame to ~500 ms); init segment = `moov`-only header; `sidx` = segment-index box used for byte-range addressing.

## History and story

**Origins.** MPEG Systems opened HTTP streaming work in **2009** following the proliferation of proprietary chunked-HTTP solutions: Move Networks (2007), **Microsoft Smooth Streaming** (2008), **Apple HLS** (2009 IETF draft by Roger Pantos), and **Adobe HDS** (2010). 3GPP's PSS adaptive streaming work (TS 26.247) fed into the MPEG project. MPEG #138 retrospectively confirms the timeline ([https://www.mpeg.org/meetings/mpeg-138/](https://www.mpeg.org/meetings/mpeg-138/)). DASH chair **Iraj Sodagar** (then Microsoft, now Dolby Laboratories — [https://www.linkedin.com/in/iraj-sodagar/](https://www.linkedin.com/in/iraj-sodagar/)) led the subgroup; Sodagar's 2011 IEEE *MultiMedia* article is the canonical English-language explainer ([https://dl.acm.org/doi/10.1109/MMUL.2011.71](https://dl.acm.org/doi/10.1109/MMUL.2011.71)). [Content + Technology + 2](https://content-technology.com/technical-standards/mpeg-systems-receives-two-emmy-awards/)

**Standardization timeline (verified against the ISO catalog).**

- 1st edition: **ISO/IEC 23009-1:2012** — [https://www.iso.org/standard/57623.html](https://www.iso.org/standard/57623.html)
- 2nd: 2014 — superseded
- 3rd: **23009-1:2019** — [https://www.iso.org/standard/75485.html](https://www.iso.org/standard/75485.html)
- 5th: **23009-1:2022** — published 5th edition, freely available via ISO ITTF ([https://dashif.org/news/5th-edition/](https://dashif.org/news/5th-edition/))
- **6th edition: ISO/IEC FDIS 23009-1** — *as of May 2026 in stage 50.00 (FDIS approved); close of voting 2024-07-20, last status update 2025-04-10. Will replace 23009-1:2022* ([https://www.iso.org/standard/89027.html](https://www.iso.org/standard/89027.html)). The 6th edition is the one that introduces L3D-DASH/SSR features (Fraunhofer paper at MHV 2025: [https://publica.fraunhofer.de/entities/publication/0f55588f-ed8a-4115-8958-d1e7ddabc595](https://publica.fraunhofer.de/entities/publication/0f55588f-ed8a-4115-8958-d1e7ddabc595)). [ISO + 2](https://www.iso.org/standard/89027.html)

**DASH Industry Forum.** Founded **2013** ("DASH Promoters Group" reorganized) by Akamai, Ericsson, Microsoft, Netflix, Qualcomm, Samsung, plus ~60 other companies that joined within a year ([https://www.businesswire.com/news/home/20130619005336/en/](https://www.businesswire.com/news/home/20130619005336/en/)). The IOP guidelines (Implementation/Interoperability Points) became the de-facto profile most real deployments target. **DASH-IF merged into the Streaming Video Technology Alliance (SVTA) on 23 July 2024** as a working group, with all task forces continuing under the SVTA umbrella ([https://dashif.org/news/svta/](https://dashif.org/news/svta/), [https://www.svta.org/2024/07/23/dash-if-becomes-part-of-the-svta/](https://www.svta.org/2024/07/23/dash-if-becomes-part-of-the-svta/)). Akamai joined SVTA as a Principal Member in September 2024 ([https://www.akamai.com/newsroom/press-release/akamai-joins-the-streaming-video-technology-alliance](https://www.akamai.com/newsroom/press-release/akamai-joins-the-streaming-video-technology-alliance)). [Broadband TV News + 2](https://www.broadbandtvnews.com/2024/07/24/dash-industry-forum-dash-if-merges-into-svta/)

**The people.**

- **Iraj Sodagar** — DASH-IF founding President, MPEG-DASH subgroup chair; today Senior Member of Technical Staff at Dolby (LinkedIn).
- **Thomas Stockhammer** — Director of Technical Standards, Qualcomm; co-editor of nearly every DASH-IF guideline ([https://dvb.org/news/common-media-client-data-does-it-matter-for-dvb/](https://dvb.org/news/common-media-client-data-does-it-matter-for-dvb/)).
- **Will Law** — Chief Architect, Cloud Technology Group, Akamai; co-chair of the W3C WebTransport WG and of the CTA Common Media Server Data WG; past DASH-IF President; now focused on MoQ, CMCD, CMSD, CAT, low-latency (Akamai bio in [https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)). [Akamai](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)
- **Christian Timmerer** — Full Professor at Alpen-Adria-Universität Klagenfurt, Director of the **Christian Doppler Lab "ATHENA"** (2021–2026), co-founder/CIO of Bitmovin; two-time Technology & Engineering Emmy® recipient ([https://athena.itec.aau.at/](https://athena.itec.aau.at/), [https://www.aau.at/team/timmerer-christian/](https://www.aau.at/team/timmerer-christian/)). [Blogger + 2](https://multimediacommunication.blogspot.com/p/about.html)
- **Roger Pantos** (Apple) — HLS technical lead; gave the WWDC LL-HLS keynote and is the co-author/editor of the HLS draft and CMAF advocate ([https://developer.apple.com/streaming/HLS-draft-pantos.pdf](https://developer.apple.com/streaming/HLS-draft-pantos.pdf)).
- **David Singer** (Apple) — long-standing MPEG editor of ISO BMFF (14496-12), critical to CMAF.
- **Kevin Spiteri & Ramesh K. Sitaraman** (UMass) — authors of BOLA. Their 2016 INFOCOM paper *just won the 2026 IEEE INFOCOM Test of Time Award* ([https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award](https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award)). [UMass Amherst](https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award)

**Politics.** Apple held HLS as a separate spec until CMAF (joint Microsoft–Apple proposal, MPEG #114, Feb 2016; published as ISO/IEC 23000-19:2018) finally let one set of fMP4 segments serve both HLS and DASH manifests ([https://www.wowza.com/blog/what-is-cmaf](https://www.wowza.com/blog/what-is-cmaf); [https://www.wowza.com/blog/apple-low-latency-hls](https://www.wowza.com/blog/apple-low-latency-hls)). Apple devices still do not natively play DASH; FairPlay still does not work with DASH ([https://developer.apple.com/forums/thread/105727](https://developer.apple.com/forums/thread/105727); Mux's HLS-vs-DASH explainer [https://www.mux.com/articles/hls-vs-dash-what-s-the-difference-between-the-video-streaming-protocols](https://www.mux.com/articles/hls-vs-dash-what-s-the-difference-between-the-video-streaming-protocols)). Patent-pool concerns (MPEG-LA AVC pool, then HEVC's three-pool fragmentation, plus 2024–2025 acquisitions of Via Licensing's HEVC/VVC pools by Access Advance) are the reason AV1 — royalty-free, AOMedia-stewarded — became Netflix's and YouTube's pragmatic codec on the open web ([https://en.wikipedia.org/wiki/Versatile_Video_Coding](https://en.wikipedia.org/wiki/Versatile_Video_Coding)). [Wowza + 2](https://www.wowza.com/blog/low-latency-cmaf-chunked-transfer-encoding)

**Last 24 months (2024-05 → 2026-05) — the changed bits, flagged.**

- DASH-IF merged into SVTA (July 2024) — see above.
- ISO/IEC FDIS 23009-1 6th edition reached stage 50.00 / "FDIS registered for formal approval" by April 2025; not yet "60.60 published" as of May 2026.
- ISO/IEC 23009-9:2025 (REaP — Redundant Encoding and Packaging for segmented live media) published 2025-05-09 ([https://www.iso.org/standard/85639.html](https://www.iso.org/standard/85639.html)). [ISO](https://www.iso.org/standard/85639.html)[ISO](https://www.iso.org/standard/85639.html)
- ISO/IEC 23009-8:2025 (Session-based DASH operations) published — [https://www.iso.org/standard/85455.html](https://www.iso.org/standard/85455.html).
- DASH-IF Live Media Ingest v1.2 (Feb 28 2024) — [https://dashif.org/news/ingest-v1-2/](https://dashif.org/news/ingest-v1-2/).
- ISO/IEC 23000-19:2024 (CMAF, 4th edition) published 2024 — [https://www.iso.org/standard/85623.html](https://www.iso.org/standard/85623.html).
- ETSI TS 103 998 (DASH-IF Content Steering) v1.1.1 published Jan 2024 — [https://www.etsi.org/deliver/etsi_ts/103900_103999/103998/01.01.01_60/ts_103998v010101p.pdf](https://www.etsi.org/deliver/etsi_ts/103900_103999/103998/01.01.01_60/ts_103998v010101p.pdf).
- **CMCD v2 / CTA-5004-A** released — [https://einbliq.io/cmcd-v2-is-officially-released/](https://einbliq.io/cmcd-v2-is-officially-released/).
- L3D-DASH (Low-Latency, Low-Delay DASH) integrated into dash.js v5.x (PR #4839) — [https://github.com/Dash-Industry-Forum/dash.js/issues/4510](https://github.com/Dash-Industry-Forum/dash.js/issues/4510).
- IBC 2025 Accelerator demonstrated SGAI + L3D-DASH + CMCD v2 for ultra-low latency live ([https://show.ibc.org/accelerator-project-ultra-low-latency-live-streaming-scale](https://show.ibc.org/accelerator-project-ultra-low-latency-live-streaming-scale)).

## How it actually works

### The MPD (Media Presentation Description)

The MPD is XML rooted at `<MPD>` whose `@type` is `static` (VOD) or `dynamic` (live). Hierarchy:

```
MPD
├── ProgramInformation, BaseURL, Location, ContentSteering*, ServiceDescription
├── Period (one or more — supports ad insertion, content boundaries)
│    ├── BaseURL
│    ├── AdaptationSet (per content type/language: video, audio-en, captions-fr…)
│    │    ├── ContentProtection (DRM signaling — see below)
│    │    ├── Role, Accessibility, EssentialProperty, SupplementalProperty
│    │    ├── Representation (one per (codec, bitrate, resolution) tuple)
│    │    │    ├── BaseURL
│    │    │    └── SegmentTemplate / SegmentList / SegmentBase
│    │    └── … more Representations
│    └── … more AdaptationSets
└── … more Periods
```

`SegmentTemplate` is the workhorse for live and most VOD. URL-template variables (resolved client-side):

- `$RepresentationID$` — `Representation@id`
- `$Number$` — segment number, optionally `%05d`-style padding (e.g. `$Number%05d$`)
- `$Time$` — timeline-derived `t` value
- `$Bandwidth$` — `Representation@bandwidth`
- `$$` — literal `$`

`SegmentTimeline` enumerates `<S t="…" d="…" r="…"/>` runs for non-uniform durations; `SegmentTemplate@duration` is for uniform-duration grids. `SegmentBase` with `<SegmentBase indexRange="…">` is the byte-range mode: client first fetches the `sidx` and then `Range:`-fetches each subsegment.

**Live-specific attributes.**

- `availabilityStartTime` (UTC anchor for NumberNumber
Number/TimeTime
Time math)
- `minimumUpdatePeriod` (how often clients re-fetch the MPD)
- `timeShiftBufferDepth` (DVR window)
- `suggestedPresentationDelay` (target glass-to-glass latency)
- `minBufferTime` (client buffer floor before play)
- `publishTime` (server wall-clock when MPD was emitted)
- `<ServiceDescription>` (LL-DASH latency target, scope, playback rate range — added in 5th edition)
- `<UTCTiming>` (HTTP-XSDATE / DIRECT / NTP — clock sync; mismatched clocks are *the* leading live failure mode).

### Profiles

Profiles are URN strings on `MPD@profiles`:

- **Full** profile — `urn:mpeg:dash:profile:full:2011`
- **ISO Base Main / On-Demand / Live** — `urn:mpeg:dash:profile:isoff-main|on-demand|live:2011`
- **MPEG-2 TS Main / Simple** — `urn:mpeg:dash:profile:mp2t-main|simple:2011`
- **CMAF** profiles — `urn:mpeg:dash:profile:cmaf:2019` and the various IOP CMAF brands.

DASH-IF IOP v5 (multi-part since 2022, current Audio Part 8 v5.1 published 12 Mar 2024) further constrains these for real-world interop: [https://dashif.org/guidelines/iop-v5/](https://dashif.org/guidelines/iop-v5/).

### Segment formats

CMAF tracks (fMP4) are now the dominant format. A live segment contains:

```
[styp]                  ← optional, segment type
[prft]                  ← optional, ProducerReferenceTime (LL-DASH)
[emsg]…                 ← inband event messages (SCTE-35, ID3, etc.)
[moof]                  ← movie fragment header (tfhd, tfdt, trun)
[mdat]                  ← compressed media samples
```

The init segment is `[ftyp][moov]`. MPEG-TS variant remains supported but is rare outside ATSC 3.0 / broadcast hybrids.

### ABR algorithms (where the magic — and most pain — lives)

- **Throughput-based** — pick the highest bitrate ≤ measured TCP/HTTP throughput × safety factor. Brittle on chunked transfer (Will Law's perennial point — bandwidth estimation breaks because bytes don't arrive at line rate; [https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)). [Thebroadcastknowledge](https://thebroadcastknowledge.com/tag/llhls/)
- **BBA (Buffer-Based Algorithm)** — Te-Yuan Huang et al. (Netflix), 2014: choose bitrate as a function of buffer occupancy alone ([https://arxiv.org/pdf/1401.2209](https://arxiv.org/pdf/1401.2209)).
- **BOLA** (Buffer Occupancy-based Lyapunov Algorithm) — Spiteri/Urgaonkar/Sitaraman, 2016, *INFOCOM Test of Time 2026*. Uses Lyapunov optimization to bound utility loss as O(1/V) without requiring throughput prediction ([https://arxiv.org/abs/1601.06748](https://arxiv.org/abs/1601.06748); UMass announcement [https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award](https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award)). BOLA is the default ABR in dash.js. [arXiv](https://arxiv.org/abs/1601.06748)[UMass Amherst](https://www.cics.umass.edu/news/2026-ieee-infocom-test-time-award)
- **MPC (Model Predictive Control)** — Yin/Jindal/Sekar/Sinopoli, ACM SIGCOMM 2015: jointly optimizes throughput prediction and buffer dynamics over a short horizon.
- **Hybrid (DYNAMIC)** — Spiteri/Sitaraman/Sparacio 2018 — switches between BBA and BOLA depending on context; this is what dash.js exposes as `streaming.abr.activeRules`.

### Player state machine (minimal re-implementer's view)

```
   ┌────────┐        ┌────────────┐        ┌──────────────┐
   │ INIT   │ ─MPD─► │ MANIFEST   │ ─init─►│ LOADING_INIT │
   └────────┘        └────────────┘        └──────┬───────┘
                                                  ▼
   ┌──────────┐                            ┌──────────────┐
   │ ENDED    │ ◄───static end─┐           │ BUFFERING    │
   └──────────┘                │           └──────┬───────┘
        ▲                      │                  ▼
        │                      │           ┌──────────────┐ ABR
        │                      └─────────  │ STEADY-STATE │◄────┐
        │                                  └──┬───────────┘     │
        │                                     │ buffer<low      │
        │                                     ▼                 │
        │                              ┌─────────────┐  fetched │
        │                              │ REBUFFERING │──────────┘
        └──────────────────────────────┴─────────────┘
```

Per tick: (1) update bandwidth/buffer estimates, (2) ask ABR for next quality, (3) compute next segment URL via template, (4) issue HTTP GET (range or whole), (5) feed bytes to MSE `SourceBuffer.appendBuffer`, (6) on `updateend` recurse.

### Low-Latency DASH

LL-DASH layers four mechanisms:

1. **CMAF chunked encoding** — encoder emits `moof+mdat` tuples ("chunks") of one to a few frames each ([https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html](https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html)). [Akamai](https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html)[GetStream](https://getstream.io/glossary/common-media-application-framework/)
2. **HTTP/1.1 chunked transfer encoding** — origin streams those chunks as soon as the encoder produces them, before the parent segment finishes.
3. **Resync elements + ProducerReferenceTime ('prft')** — gives clients sub-segment random-access points and absolute wall-clock anchors.
4. **`ServiceDescription` latency targets** — `<Latency target="3000" min="1500" max="6000"/>` plus `<PlaybackRate min="0.96" max="1.04"/>` so the player can speed/slow toward the target.

Akamai/dash.js public reference: AVC 720p@2 Mbps, 6 s segments, 1-frame chunks @29.97 fps, target latency 2.8 s — proves end-to-end "glass-to-glass" of ~3 s is achievable on commodity CDN ([https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html](https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html)). Typical target latency ranges in 2024–2026 production: HLS standard 20–30 s, LL-HLS 3–6 s, LL-DASH 2–5 s, WebRTC < 1 s ([https://www.dacast.com/blog/best-low-latency-video-streaming-solution/](https://www.dacast.com/blog/best-low-latency-video-streaming-solution/), [https://www.mux.com/articles/a-guide-to-http-live-streaming-hls-overview-definition-and-considerations](https://www.mux.com/articles/a-guide-to-http-live-streaming-hls-overview-definition-and-considerations)). [Akamai](https://blogs.akamai.com/2018/10/best-practices-for-ultra-low-latency-streaming-using-chunked-encoded-and-chunk-transferred-cmaf.html)[Mux](https://www.mux.com/articles/a-guide-to-http-live-streaming-hls-overview-definition-and-considerations)

The 6th edition adds **L3D-DASH** with **Segment Sequence Representations (SSR)** for sub-second join times without requiring continuous chunked transfer — Fraunhofer/dash.js paper: [https://github.com/Dash-Industry-Forum/dash.js/issues/4510](https://github.com/Dash-Industry-Forum/dash.js/issues/4510), MHV 2025 paper [https://publica.fraunhofer.de/entities/publication/0f55588f-ed8a-4115-8958-d1e7ddabc595](https://publica.fraunhofer.de/entities/publication/0f55588f-ed8a-4115-8958-d1e7ddabc595).

### DRM integration

`ContentProtection` descriptors at AdaptationSet (or Representation) level. Two patterns:

1. **Common Encryption (CENC, ISO/IEC 23001-7)** — the universal protection layer. Latest is **23001-7:2023** ([https://www.iso.org/standard/84637.html](https://www.iso.org/standard/84637.html)). Schemes:
  - `cenc` — AES-128 CTR mode, full-sample subsample encryption (works on Widevine/PlayReady).
    - `cbcs` — AES-128 CBC mode with 1:9 pattern encryption — *required* for Apple FairPlay; preferred modern default. [Gumlet](https://www.gumlet.com/learn/fairplay-drm/)
    - `cbc1`, `cens` — older variants, rarely deployed.
2. **PSSH (Protection System Specific Header) boxes** carry per-DRM init data:
  - Widevine UUID `edef8ba9-79d6-4ace-a3c8-27dccb7d29d4`
    - PlayReady UUID `9a04f079-9840-4286-ab92-e65be0885f95`
    - W3C clearkey `1077efec-c0b2-4d02-ace3-3c1e52e2fb4b`
FairPlay (`94ce86fb-07ff-4f43-adb8-93d2fa968ca2`) is signaled in HLS only — Apple has never shipped FairPlay/DASH ([https://developer.apple.com/forums/thread/105727](https://developer.apple.com/forums/thread/105727)). [Bitmovin](https://developer.bitmovin.com/encoding/docs/how-to-create-fairplay-drm-protected-content)

W3C's EME spec normatively wires `pssh` box discovery into the `encrypted` event ([https://www.w3.org/TR/eme-stream-mp4/](https://www.w3.org/TR/eme-stream-mp4/)).

### Subtitles

- **WebVTT** (W3C TextTrack) — most common, optionally wrapped in fMP4 (`wvtt`).
- **IMSC1 / TTML** (W3C / SMPTE) — required for broadcast-grade captions in DASH-IF, ATSC 3.0, DVB-DASH.

### Multi-period & ad insertion

`<Period>` boundaries are the natural ad-break points. **SCTE-35** markers ride in `<EventStream schemeIdUri="urn:scte:scte35:2013:bin">` or as `emsg` boxes inband. The DASH-IF Ad Insertion guideline (IOP v5 Part 5) treats this with CMAF ([https://dashif.org/guidelines/iop-v5/](https://dashif.org/guidelines/iop-v5/)). 6th edition adds **Media Presentation Insertion (MPI)** for asynchronous, return-to-network ad spawns superseding XLink (Demuxed 2024 talk: [https://2024.demuxed.com/](https://2024.demuxed.com/)). [Demuxed](https://2024.demuxed.com/)

### Mermaid sequence diagram

DRM license serverCDN edgeDASH client (dash.js)DRM license serverCDN edgeDASH client (dash.js)#mermaid-rfh{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfh .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfh .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfh .error-icon{fill:#CC785C;}#mermaid-rfh .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfh .edge-thickness-normal{stroke-width:1px;}#mermaid-rfh .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfh .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfh .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfh .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfh .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfh .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfh .marker.cross{stroke:#A1A1A1;}#mermaid-rfh svg{font-family:inherit;font-size:16px;}#mermaid-rfh p{margin:0;}#mermaid-rfh .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .actor-line{stroke:#A1A1A1;}#mermaid-rfh .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfh .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfh #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfh .sequenceNumber{fill:#5e5e5e;}#mermaid-rfh #sequencenumber{fill:#E5E5E5;}#mermaid-rfh #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfh .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfh .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh .labelText,#mermaid-rfh .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .loopText,#mermaid-rfh .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfh .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfh .noteText,#mermaid-rfh .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfh .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfh .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfh .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfh .actorPopupMenu{position:absolute;}#mermaid-rfh .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfh .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfh .actor-man circle,#mermaid-rfh line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfh :root{--mermaid-font-family:inherit;}encrypted? PSSH found → fire 'encrypted' eventABR decides up-switchloop[steady state]GET /manifest.mpd1200 OK (application/dash+xml)2parse MPD, choose initial Representation3GET /init/v0.m4s4200 OK (ftyp+moov)5POST license request (challenge)6license blob7GET /seg/v0/000001.m4s   (Range optional)8200/206 (moof+mdat)9GET /seg/v0/000002.m4s10chunked transfer (LL-DASH)11GET /seg/v1/000003.m4s12200 OK (higher bitrate)13GET next segment14media bytes15

### A minimal MPD on the wire

xml

```
<?xml version="1.0" encoding="UTF-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"
     profiles="urn:mpeg:dash:profile:isoff-live:2011,urn:mpeg:dash:profile:cmaf:2019"
     type="static"
     mediaPresentationDuration="PT2M0S"
     minBufferTime="PT2S">
  <Period id="0" start="PT0S">
    <AdaptationSet id="1" mimeType="video/mp4" codecs="avc1.640028"
                   segmentAlignment="true" startWithSAP="1">
      <SegmentTemplate timescale="1000" duration="4000"
                       initialization="$RepresentationID$/init.m4s"
                       media="$RepresentationID$/$Number%05d$.m4s"
                       startNumber="1"/>
      <Representation id="v720" bandwidth="2500000" width="1280" height="720"/>
      <Representation id="v1080" bandwidth="5000000" width="1920" height="1080"/>
    </AdaptationSet>
    <AdaptationSet id="2" mimeType="audio/mp4" codecs="mp4a.40.2" lang="en">
      <SegmentTemplate timescale="48000" duration="192000"
                       initialization="$RepresentationID$/init.m4s"
                       media="$RepresentationID$/$Number%05d$.m4s"
                       startNumber="1"/>
      <Representation id="a-en" bandwidth="128000" audioSamplingRate="48000"/>
    </AdaptationSet>
  </Period>
</MPD>
```

Sample HTTP fetch for a SegmentBase byte range:

```
GET /vod/movie.mp4 HTTP/1.1
Host: cdn.example.com
Range: bytes=2048576-4194303
Accept: */*
User-Agent: dash.js/5.1.1
CMCD: br=5000,cid="movie-42",d=4000,mtp=22000,ot=v,sf=d,sid="abcd-1234",tb=8000

HTTP/1.1 206 Partial Content
Content-Range: bytes 2048576-4194303/734003200
Content-Type: video/mp4
Content-Length: 2145728
```

Note the inline **CMCD** query/header — see the connections section.

## Deep connections to other protocols

- **HTTP/1.1 (RFC 9112) + HTTP semantics (RFC 9110)** — DASH leverages standard `Range` requests for SegmentBase and `Transfer-Encoding: chunked` for LL-DASH; CDNs cache MPDs and segments as ordinary objects.
- **HTTP/2 (RFC 9113)** — multiplexing helps when a player issues many small chunk requests (LL-DASH's pull-style sub-segment fetches), but per-connection HoL blocking on TCP can hurt under loss; HTTP/2 server push has been **deprecated by the Chromium team and removed from Apple's LL-HLS spec** in favor of `EXT-X-PRELOAD-HINT` / DASH `Resync` ([https://www.streamingmedia.com/Articles/Editorial/Featured-Articles/Low-Latency-HLS-Spec-Nears-Finalization-142921.aspx](https://www.streamingmedia.com/Articles/Editorial/Featured-Articles/Low-Latency-HLS-Spec-Nears-Finalization-142921.aspx)).
- **HTTP/3 (RFC 9114) over QUIC (RFC 9000)** — eliminates TCP HoL blocking, allows 0-RTT resumption, gives streams independent loss recovery. Empirical results are mixed: a 2024–2025 academic study (CNRG/UNH) found HTTP/3+QUIC can outperform HTTP/2+TCP in lossy scenarios for low-latency ABR ([https://www.cs.unh.edu/cnrg/publications/quic-ants-2022.pdf](https://www.cs.unh.edu/cnrg/publications/quic-ants-2022.pdf)), while a UMich/arXiv study found *userspace QUIC* is up to ~45% slower than HTTP/2 above ~500 Mbps due to receive-side processing overhead ([https://arxiv.org/pdf/2310.09423](https://arxiv.org/pdf/2310.09423)). Bitmovin/Cloudflare are actively running MoQ-over-QUIC fan-out experiments ([https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)). [Unh](https://www.cs.unh.edu/cnrg/publications/quic-ants-2022.pdf)[arxiv](https://arxiv.org/pdf/2310.09423)
- **TLS 1.2 / 1.3 (RFC 8446)** — all major OTT services require HTTPS; TLS 1.3 enables 1-RTT and (for DASH GETs only — never license calls) 0-RTT.
- **HLS (RFC 8216 + Pantos draft -bis)** — head-to-head:
  - Manifest: `M3U8` text vs `MPD` XML. M3U8 is simpler; MPD is more flexible (multi-period, multi-codec preselection, byte-range SegmentBase, sophisticated timing).
    - Segment: HLS originally `.ts`, now both support fMP4/CMAF.
    - Low-latency: LL-HLS originally required HTTP/2 push; it has since converged on chunked-transfer-equivalent partial segments (`EXT-X-PART`), narrowing the gap ([https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away](https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away)).
    - HLS Interstitials (2023–2025) are Apple's answer to dynamic ad insertion and now coexist with DASH MPI.
    - The popular framing **"HLS won mobile, DASH won everything else"** holds: every iOS/iPadOS app uses HLS through AVPlayer (no native DASH), while YouTube, Netflix, Disney+, BBC iPlayer, DAZN, and most Android/web stacks ship DASH (often dual-encapsulated via CMAF). [Wowza](https://www.wowza.com/blog/hls-vs-dash)[VdoCipher](https://www.vdocipher.com/blog/mpeg-dash/)
- **RTMP (Adobe, 2002)** — the classic *ingest* protocol from encoder to origin. Flash player end-of-life was **31 December 2020** (Adobe). RTMP-as-ingest is being replaced by **SRT** (Haivision, IETF draft, reliable UDP), **RIST** (VSF TR-06-1/2/3/4), and increasingly **WHIP** (RFC 9725 / `draft-ietf-wish-whip`), with **WHEP** for egress ([https://datatracker.ietf.org/doc/html/draft-ietf-wish-whep-01](https://datatracker.ietf.org/doc/html/draft-ietf-wish-whep-01)).
- **CMAF (ISO/IEC 23000-19)** — the unification layer described above; without CMAF, DASH and HLS would still mean double encoding/storage.
- **MSE (W3C)** and **EME (W3C)** — the only reason DASH plays at all in browsers (Safari excepted, where Apple's HLS native path is preferred). Note Apple's **ManagedMediaSource** API (Safari 17+) loosens MSE restrictions on iPhone.
- **WebRTC** — sub-second latency but designed for symmetric many-to-many; complex to scale to millions, hence MoQ.
- **WHIP / WHEP** — IETF WISH WG; WHIP = WebRTC-HTTP Ingest, WHEP = WebRTC-HTTP Egress; OBS Studio 30 added native WHIP support ([https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)). [webrtcHacks](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)
- **SRT (Secure Reliable Transport)** — Haivision/SVT, contribution-class reliable UDP with ARQ + AES; widely adopted for studio-to-cloud feeds.
- **RIST** — Reliable Internet Stream Transport, VSF; competes with SRT in pro-broadcast.
- **MPEG-TS** — DASH supports it as a legacy segment format; still used in ATSC 3.0 / DVB-DASH hybrids.
- **MPEG-DASH SAND (ISO/IEC 23009-5)** — Server And Network assisted DASH; never reached broad deployment but informed the design of CMCD/CMSD.
- **CTA-5004 CMCD** (Common Media Client Data) and **CTA-5006 CMSD** (Common Media Server Data) — telemetry standards. Player attaches structured key/value pairs to each request (header `CMCD-*` or query `?CMCD=…`) so CDNs can correlate sessions, content-IDs, buffer state, throughput, and request type. **CMCD v2 / CTA-5004-A was released in 2025–2026**, adding QoE/QoS extension fields ([https://einbliq.io/cmcd-v2-is-officially-released/](https://einbliq.io/cmcd-v2-is-officially-released/)); both ExoPlayer/Media3 (1.1+) and dash.js (4.4+) support it natively. [DVB](https://dvb.org/?standard=commercial-requirements-for-the-use-of-common-media-client-data-in-dvb-i)
- **DASH-IF Content Steering** — published as **ETSI TS 103 998 v1.1.1 (2024-01)**, defines a DASH `<ContentSteering>` element pointing at a steering server that returns a JSON with `VERSION`, `TTL`, `RELOAD-URI`, `PATHWAY-PRIORITY`. Compatible with HLS Content Steering (RFC 8216bis) so a single steering service can drive both. Deployments referenced in MHV 2024–2025 papers ([https://dl.acm.org/doi/10.1145/3638036.3640293](https://dl.acm.org/doi/10.1145/3638036.3640293)). [npm](https://www.npmjs.com/package/shaka-player)[IBC365](https://www.ibc.org/accelerating-innovation/reports/ibc2024-tech-papers-content-steering-a-standard-for-multi-cdn-streaming/21401)
- **Media over QUIC (MoQ)** — IETF working group active since 2022; **draft-ietf-moq-transport-17 dated March 2026** ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)). MoQT is publish/subscribe, runs over native QUIC or WebTransport, and offers end-to-end secure objects (`draft-ietf-moq-secure-objects-00`, March 2026). Cloudflare has deployed MoQ relays in 330+ cities; Bitmovin has shipped a MoQ plugin for Player Web X ([https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)); nanocosmos commercialized at IBC 2025. Browser support gap: WebTransport is in Safari 18.4 only experimentally (per Medium summary [https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce) — note: secondary source, but the underlying drafts and Cloudflare statements corroborate). The IETF blog provides a primer: [https://www.ietf.org/blog/moq-overview/](https://www.ietf.org/blog/moq-overview/). [IETF + 2](https://www.ietf.org/blog/moq-overview/)

## Real-world deployment

**Open-source and commercial players (versions verified May 2026 where possible).**

- **dash.js** — DASH-IF reference player. Latest npm publish **5.1.1, ~December 2025–January 2026** ([https://www.npmjs.com/package/dashjs](https://www.npmjs.com/package/dashjs)). v5.0 (2025) added LCEVC, Preselection, Cue Interval Tree, CMCD v2 fields, L3D-DASH (PR #4839). Repository: [https://github.com/Dash-Industry-Forum/dash.js](https://github.com/Dash-Industry-Forum/dash.js).
- **Shaka Player (Google)** — npm latest **5.1.1 published May 2026** ([https://www.npmjs.com/package/shaka-player](https://www.npmjs.com/package/shaka-player)). Roadmap: v5.0 Q1 2026 added MoQ + CMSF/MSF experimental support, automatic subtitles with translation, removed MSS support; v4.16 (Q3 2025) added CMCDv2, HDR detection on Tizen/WebOS ([https://github.com/shaka-project/shaka-player/blob/main/roadmap.md](https://github.com/shaka-project/shaka-player/blob/main/roadmap.md)).
- **ExoPlayer / AndroidX Media3 (Google)** — Media3 **1.9.0 released 19 December 2025** ([https://android-developers.googleblog.com/2025/12/media3-190-whats-new.html](https://android-developers.googleblog.com/2025/12/media3-190-whats-new.html)); **1.10.0** is current at the time of this report (per the Android developer DASH guide page [https://developer.android.com/media/media3/exoplayer/dash](https://developer.android.com/media/media3/exoplayer/dash) — last updated 2026-03-30). Media3 1.6 (March 2025) added HLS Interstitials VOD and decoder pre-warming; 1.8 added SGAI; 1.9 added a rewritten AV1 (dav1d-based) decoder and `media3-cast`. Legacy `com.google.android.exoplayer2` artifacts are deprecated.
- **AVPlayer (iOS)** — HLS native, no DASH support.
- **Bitmovin Player** (commercial, "Player Web X" / PWX) — added MoQ playback plugin in 2025 ([https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)).
- **THEOplayer** (commercial) — major LL-HLS/LL-DASH and Apple/Android device coverage.
- **Video.js** with `videojs-http-streaming` plugin — community DASH/HLS support.
- **GPAC / MP4Box** — French open-source multimedia framework originating at **Télécom Paris** (formerly Télécom ParisTech). Widely used for packaging, DASH muxing, and DRM. [GitHub](https://github.com/gpac/gpac/wiki/Common-Encryption)
- **FFmpeg** `dash` muxer — production-grade, used in countless pipelines; FFlabs added DASH-IF CMAF Ingest in 2024 ([https://docs.unified-streaming.com/faqs/cmaf/index.html](https://docs.unified-streaming.com/faqs/cmaf/index.html)). [Unified Streaming](https://docs.unified-streaming.com/faqs/cmaf/index.html)
- **Packagers/origins**: **Unified Streaming**, **AWS Elemental MediaPackage**, **Akamai Adaptive Media Delivery**, **Wowza Streaming Engine**, **Nimble Streamer**, **Bitmovin Encoder**.

**Production users at scale.**

- **YouTube** — DASH on web/desktop and Android (since 2014–2015), HLS on iOS via fallback; uses VP9 and AV1 to bypass HEVC pools.
- **Netflix** — uses DASH (custom variant) on most clients, HLS on Apple devices; pioneered Per-Title and Per-Shot encoding; Spiteri/Sitaraman BOLA in dash.js was originally validated on Netflix-style traces.
- **BBC iPlayer** — DASH-heavy, drove much of the LL-DASH/MPEG-DASH 5th-edition standardization through DVB.
- **Disney+, Hulu, DAZN** — DASH+HLS dual-packaged via CMAF.
- **Twitch** — LL-HLS with 2 s segments and prefetch, ~2 s wall-clock latency in low-latency mode ([https://streamlink.github.io/cli/plugins/twitch.html](https://streamlink.github.io/cli/plugins/twitch.html)).
- **Peacock** — both HLS and DASH. Peacock's exclusive AFC Wild Card game (Chiefs–Dolphins, 13 Jan 2024) reached 27.6 M total viewers and a 23.0 M average audience — *the most-streamed live event in U.S. history* — and consumed ~30% of U.S. internet traffic during the game window ([https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage](https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage); [https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html](https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html)). [Yahoo Finance + 3](https://finance.yahoo.com/news/peacock-exclusive-afc-wild-card-040600187.html)
- **Paris 2024 Olympics on Peacock**: 23.5 billion streamed minutes (40% more than all prior Olympics combined), up to 60 concurrent live event streams and 300 live events/day ([https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms](https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms)). [NBCUNIVERSAL MEDIA](https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms)
- **Globo (Brazil)** — first major broadcaster to deploy VVC/H.266 in production via MPEG-DASH and ROUTE-DASH for SBTVD's TV 3.0 standard, demonstrated at Paris 2024 ([https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024](https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024)). [MainConcept](https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024)

**Latency targets in 2026 production:** HLS standard ~30 s, LL-HLS / LL-DASH 2–6 s, WebRTC < 1 s, MoQ targeting < 1 s at HLS scale.

## Failure modes and famous incidents

**Specific named CVEs (verified in NVD/MITRE; note that "Plotly Dash" is a different unrelated product — `CVE-2024-21485` is *that* product, not the streaming player; included only to clarify the disambiguation):**

- **GPAC / MP4Box** is by far the most CVE-prolific DASH-adjacent project; representative entries:
  - **CVE-2023-47384** — heap memory leak in `gf_isom_add_chapter`, GPAC 2.3-DEV ([https://www.cvedetails.com/cve/CVE-2023-47384/](https://www.cvedetails.com/cve/CVE-2023-47384/)).
    - **CVE-2024-6061** — infinite loop in `isoffin_process` in GPAC 2.5-DEV-rev228 ([https://cvefeed.io/vuln/detail/CVE-2024-6061](https://cvefeed.io/vuln/detail/CVE-2024-6061)).
    - **CVE-2024-57184** — heap-based buffer overflow in GPAC 0.8.0 ([https://vulert.com/vuln-db/debian-11-gpac-163358](https://vulert.com/vuln-db/debian-11-gpac-163358) for description).
    - **CVE-2026-7135** — out-of-bounds read in `elng_box_read` in GPAC up to 26.03-DEV-rev105 ([https://radar.offseq.com/threat/cve-2026-7135-out-of-bounds-read-in-gpac-a1c73700](https://radar.offseq.com/threat/cve-2026-7135-out-of-bounds-read-in-gpac-a1c73700)).
    - **CVE-2026-33144** — heap overflow in `gf_xml_parse_bit_sequence_bs` for crafted NHML files ([https://vulert.com/vuln-db/gpac-is-an-open-source-multimedia-framework--prior-to-commit-86b0e36--a-heap-based-buffer-overflow-----](https://vulert.com/vuln-db/gpac-is-an-open-source-multimedia-framework--prior-to-commit-86b0e36--a-heap-based-buffer-overflow-----)).
  Ubuntu's package CVE list shows ongoing weekly disclosures ([https://ubuntu.com/security/cves?package=gpac](https://ubuntu.com/security/cves?package=gpac)).
- **dash.js** — I did not find any open NVD entry for `Dash-Industry-Forum/dash.js` matching streaming functionality during 2024–2026 review (only Plotly's unrelated `dash`). Mark as `[needs source]` for "*streaming-specific* dash.js CVE in 2024–2026"; if you need them for a security audit, the canonical place to check is [https://github.com/Dash-Industry-Forum/dash.js/security/advisories](https://github.com/Dash-Industry-Forum/dash.js/security/advisories).
- **Shaka Player / ExoPlayer / Media3** — likewise no public 2024–2026 CVE that surfaced in my search; report any future ones via GitHub Advisories under `shaka-project/shaka-player` and `androidx/media`. `[needs source]` for any specific entry.

**Famous outages (named, dated, with root cause where public).**

- **Super Bowl LI (Feb 2017), Fox Sports streaming** — widespread buffering and 401 errors during overtime; root cause publicly described as overloaded ad-decisioning and CDN partitions. (Older event, included for context — *verify against contemporaneous trade press if used*.)
- **Peacock AFC Wild Card 13 Jan 2024 (Chiefs–Dolphins)** — *did not* fail; instead set the U.S. live-streaming record (above). Cited as the proof-point that DASH/HLS/CMAF over CDN can scale to a single-event peak of **~24.6 M concurrent viewers** without melting ([https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage](https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage)). [NBCUNIVERSAL MEDIA](https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage)
- **Paris 2024 Olympics on Peacock** — 16.3 M concurrent devices on opening Saturday; no major outage reported. [CNN](https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html)
- **HEVC patent litigation** — three competing pools (Access Advance, Via-LA, MPEG-LA, plus unpooled holders) and uncertain royalty exposure delayed HEVC's web rollout for years and is still rated by Wowza as the primary reason browsers (Chrome, Firefox, Edge) refused to ship HEVC software decode for a decade ([https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained](https://www.wowza.com/blog/h266-codec-versatile-video-coding-vvc-explained)). Access Advance acquired Via-LA's HEVC and VVC pools in **December 2025** but did not consolidate the entire patent landscape ([https://en.wikipedia.org/wiki/Versatile_Video_Coding](https://en.wikipedia.org/wiki/Versatile_Video_Coding)). [Wikipedia](https://en.wikipedia.org/wiki/Versatile_Video_Coding)

**Common pitfalls (what actually breaks in production).**

- **Encoder/player clock skew** breaking live MPDs — almost always the #1 live failure. Mitigate with `<UTCTiming>` and NTP at both sides.
- **Segment misalignment** across Representations — breaks bitrate switching mid-segment.
- **Manifest update period mismatch** — `minimumUpdatePeriod` longer than `timeShiftBufferDepth`/segment duration causes "stuck at end" rebuffer.
- **CDN cache poisoning of MPDs** — the MPD must be cacheable for very short TTLs only; many outages traced to a 60 s cache on a 2 s-update LL stream.
- **DRM key rotation** breaking playback when CDM session lifetimes don't track key periods.
- **Codec compatibility:** Firefox HEVC decode arrived in 2024 (only on systems with hardware decoders); AV1 software decode universal but slow on older devices.
- **Infinite buffer / rebuffering loop** — the BOLA/DYNAMIC algorithms can oscillate when bandwidth ≈ a representation boundary; dash.js mitigates with the `LimitBitrate` rules and `bufferTimeAtTopQuality`.

## Fun facts and anecdotes

- **Why XML and not JSON?** DASH was specified inside MPEG (ISO/IEC) in 2010–2012, when XML Schema was the SC29 standard for normative documents and XSD validation tooling was assumed. Iraj Sodagar's MPEG-DASH tutorial book ([https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ](https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ)) lists the four parts and motivates the XML choice. JSON would arguably be cleaner today; CMCD reactionarily uses both query and JSON forms. [Google Books](https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ)
- **The "DASH" name** — picked specifically to be vendor-neutral and to deflect from "MPEG-3GPP-Streaming". Whatever was rejected is undocumented in the public record I could find; `[needs source]` for the specific other names.
- **Apple/HLS holdout & the CMAF olive branch** — unwound by Microsoft and Apple jointly bringing CMAF to MPEG #114, San Diego, Feb 2016; ratified ISO/IEC 23000-19:2018. Roger Pantos's role was pivotal as HLS technical lead ([https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=128552](https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=128552)).
- **"MPEG-DASH" vs "DASH"** — both are correct. ISO and DASH-IF officially use **DASH**; "MPEG-DASH" is the colloquial/marketing form Wikipedia and Bitmovin push.
- **Will Law's "Chunky Monkey" Demuxed 2018 talk** — the demo that crystallized chunked-encoded chunked-transferred CMAF as the path to LL-DASH ([https://thebroadcastknowledge.com/2018/10/26/video-chunky-monkey-using-chunked-encoded-chunked-transferred-cmaf-to-bring-low-latency-live-to-very-large-scale-audiences/](https://thebroadcastknowledge.com/2018/10/26/video-chunky-monkey-using-chunked-encoded-chunked-transferred-cmaf-to-bring-low-latency-live-to-very-large-scale-audiences/)). [Thebroadcastknowledge](https://thebroadcastknowledge.com/2018/10/26/video-chunky-monkey-using-chunked-encoded-chunked-transferred-cmaf-to-bring-low-latency-live-to-very-large-scale-audiences/)
- **dash.js Easter egg** — the public reference Envivio test stream `https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd` has been the "hello-world" DASH stream for over a decade.
- **Demuxed 2024** podcast episode 20 features Joey Parrish (Shaka Player lead) reflecting on Shaka's migration out of Widevine into a community-led project ([https://www.heavybit.com/library/podcasts/demuxed/ep-20-exploring-shaka-player-with-joey-parrish](https://www.heavybit.com/library/podcasts/demuxed/ep-20-exploring-shaka-player-with-joey-parrish)). [Heavybit](https://www.heavybit.com/library/podcasts/demuxed/ep-20-exploring-shaka-player-with-joey-parrish)
- **Netflix's BOLA paper** ("Using the Buffer to Avoid Rebuffers", 2014) is the most-cited DASH ABR paper of all time and explicitly thanks Netflix engineering for the production traces ([https://arxiv.org/pdf/1401.2209](https://arxiv.org/pdf/1401.2209)).
- **DASH-IF Reference Architecture** — DASH-IF IOP v5 Part 1 (2022) is the architectural diagram every DASH talk redraws ([https://dashif.org/guidelines/iop-v5/](https://dashif.org/guidelines/iop-v5/)).

## Practical wisdom

**Tuning knobs (dash.js v5.x).**

- `streaming.delay.liveDelay` / `liveDelayFragmentCount` — target latency-to-live-edge.
- `streaming.buffer.stableBufferTime` — steady-state buffer floor (default 12 s; for live drop to 6–8).
- `streaming.buffer.bufferTimeAtTopQuality` — extra buffer when at max bitrate.
- `streaming.abr.activeRules.bolaRule.active` — turn BOLA on/off.
- `streaming.cmcd.enabled` / `streaming.cmcd.mode` — turn CMCD on as `header` or `query`.
- `streaming.liveCatchup.maxDrift`, `playbackRate.min/max` — speed-correction window for LL-DASH.

**Defaults to be skeptical of.**

- `streaming.abr.useDefaultABRRules = true` — fine for VOD, often poor for live; consider DYNAMIC/L2A.
- `streaming.retryAttempts.MPD = 3` — too few for flaky live origins.
- Default `lowLatencyEnabled = false` — must be explicitly enabled.

**What to monitor.**

- **Rebuffer ratio** = rebuffer time / play time (target ≤ 0.5%).
- **Startup time / time-to-first-frame** (target < 2 s VOD, < 4 s live).
- **Average and P95 bitrate** — and *bitrate switches per minute* (target ≤ 1).
- **Latency-to-live-edge** distribution.
- **CMCD telemetry**: `bs` (buffer starvation), `mtp` (measured throughput), `nor` (next-object request), `ot` (object type), `su` (startup), `pr` (playback rate).

**Common debug moves.**

- DASH-IF Conformance Validator: [https://conformance.dashif.org/](https://conformance.dashif.org/) (and `https://staging.conformance.dashif.org/` for the development build) — validates schema, segment timing (`sidx`, `tfdt`), SAP types, alignment, CMAF/DVB/HbbTV brands. [Dashif](https://dashif.org/tools/validators/)
- Eyevinn `dash-validator-js` for CI-style manifest checks: [https://github.com/Eyevinn/dash-validator-js](https://github.com/Eyevinn/dash-validator-js).
- `MP4Box -info` / `mp4dump` (Bento4) for box dumps.
- DevTools waterfall + the `MediaSource` / `SourceBuffer` console events.
- dash.js debug log levels (`MediaPlayer().getDebug().setLogToBrowserConsole(true)` + `setLogLevel(LOG_LEVEL_DEBUG)`).

**Common misconfigurations.**

- Missing CORS headers on segment origin (`Access-Control-Allow-Origin: *` is the minimum for cross-origin MSE feeds).
- Wrong MIME type — must be `application/dash+xml` for the MPD; `video/mp4` for fMP4 segments.
- `minimumUpdatePeriod` too long for live → late segment discovery.
- Segment availability windows misaligned with `availabilityStartTime` → 404s on the live edge.

## Learning resources (current as of May 2026)

| Resource | URL | Level | Last updated |
|---|---|---|---|
| **ISO/IEC 23009-1** (5th ed., free PDF + schemas) | [https://standards.iso.org/iso-iec/23009/-1/ed-5/en/](https://standards.iso.org/iso-iec/23009/-1/ed-5/en/) | Reference | 2022 (6th ed. FDIS pending, 2025–2026) |
| **ISO/IEC FDIS 23009-1** project page | [https://www.iso.org/standard/89027.html](https://www.iso.org/standard/89027.html) | Reference | Stage 50.00, Apr 2025 |
| **DASH-IF guidelines hub** | [https://dashif.org/guidelines/](https://dashif.org/guidelines/) | Intermediate | Continually updated |
| **DASH-IF IOP v5 multipart** | [https://dashif.org/guidelines/iop-v5/](https://dashif.org/guidelines/iop-v5/) | Advanced | Audio Part 8 v5.1, Mar 2024 |
| **DASH-IF Live Media Ingest v1.2** | [https://dashif.org/news/ingest-v1-2/](https://dashif.org/news/ingest-v1-2/) | Advanced | Feb 2024 |
| **ETSI TS 103 998 (Content Steering)** | [https://www.etsi.org/deliver/etsi_ts/103900_103999/103998/01.01.01_60/ts_103998v010101p.pdf](https://www.etsi.org/deliver/etsi_ts/103900_103999/103998/01.01.01_60/ts_103998v010101p.pdf) | Advanced | Jan 2024 |
| **CTA-5004 CMCD v1** | [https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf](https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf) | Intermediate | 2020 |
| **CTA-5004-A CMCD v2 announcement** | [https://einbliq.io/cmcd-v2-is-officially-released/](https://einbliq.io/cmcd-v2-is-officially-released/) | Intermediate | 2025–2026 |
| **W3C MSE** | [https://www.w3.org/TR/media-source-2/](https://www.w3.org/TR/media-source-2/) | Intro→Advanced | 2024 update |
| **W3C EME** | [https://www.w3.org/TR/encrypted-media/](https://www.w3.org/TR/encrypted-media/) | Intermediate | 2017 (still current) |
| **dash.js GitHub + samples** | [https://github.com/Dash-Industry-Forum/dash.js](https://github.com/Dash-Industry-Forum/dash.js) | Intermediate | v5.1.1, Jan 2026 |
| **dash.js docs** | [https://dashif.org/dash.js/](https://dashif.org/dash.js/) | Intro | Continuous |
| **Shaka Player** | [https://github.com/shaka-project/shaka-player](https://github.com/shaka-project/shaka-player) | Intermediate | v5.1.1, May 2026 |
| **Shaka Player codelabs** | [https://shaka-player-demo.appspot.com/docs/api/tutorial-welcome.html](https://shaka-player-demo.appspot.com/docs/api/tutorial-welcome.html) | Intro | v5.x |
| **AndroidX Media3 docs** | [https://developer.android.com/jetpack/androidx/releases/media3](https://developer.android.com/jetpack/androidx/releases/media3) | Intermediate | 1.10.0, Mar 2026 |
| **GPAC / MP4Box wiki** | [https://github.com/gpac/gpac/wiki](https://github.com/gpac/gpac/wiki) | Advanced | Active |
| **DASH-IF Conformance Tool** | [https://conformance.dashif.org/](https://conformance.dashif.org/) | Intro | 3.x branch |
| **Christian Timmerer's ATHENA Lab publications** | [https://athena.itec.aau.at/](https://athena.itec.aau.at/) | Advanced | Continual; *ACM TOMM* "HTTP Adaptive Streaming: Review on Current Advances and Future Challenges" (2025) |
| **MoQ working group** | [https://datatracker.ietf.org/group/moq/about/](https://datatracker.ietf.org/group/moq/about/) | Frontier | draft-17, March 2026 |
| **draft-ietf-moq-transport-17** | [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) | Frontier | March 2026 |
| **IETF MoQ primer** | [https://www.ietf.org/blog/moq-overview/](https://www.ietf.org/blog/moq-overview/) | Intro | 2026 |
| **Demuxed conference talks** | [https://2024.demuxed.com/](https://2024.demuxed.com/), [https://2025.demuxed.com/](https://2025.demuxed.com/) | Intermediate→Advanced | Annual |
| **Bitmovin engineering blog** | [https://bitmovin.com/blog/](https://bitmovin.com/blog/) | Intermediate | Active |
| **Mux engineering blog** | [https://www.mux.com/blog](https://www.mux.com/blog) | Intermediate | Active |
| **Akamai blog (Will Law et al.)** | [https://www.akamai.com/blog](https://www.akamai.com/blog) | Advanced | Active |
| **BBC R&D blog** | [https://www.bbc.co.uk/rd/blog](https://www.bbc.co.uk/rd/blog) | Intermediate | Active |
| **Streaming Media magazine** | [https://www.streamingmedia.com/](https://www.streamingmedia.com/) | Intermediate | Active |
| **The Broadcast Knowledge** | [https://thebroadcastknowledge.com/](https://thebroadcastknowledge.com/) | Intermediate | Active |
| **Books**: *Video Encoding by the Numbers* — Jan Ozer | publisher page | Intro→Intermediate | 2017 (still cited; verify currency for 2024+ codecs) `[needs newer source]` |
| **Sodagar, *MPEG-DASH: a Tutorial*** | [https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ](https://books.google.com/books/about/MPEG_DASH_a_Tutorial.html?id=JBzRoQEACAAJ) | Intro→Reference | Pre-CMAF; older but still useful |

## Where things are heading (2025–2026 frontier)

- **Media over QUIC (MoQ)** — `draft-ietf-moq-transport-17` was published 29 April 2026 with editors from Cisco, Google, and Meta. Cloudflare runs an open-source MoQ relay (`moq-rs`) network across 330+ cities; Bitmovin has shipped MoQ playback in Player Web X ([https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)); Meta and Google are co-implementing for interop. Adjacent drafts: `draft-ietf-moq-secure-objects-00` (E2E encryption), `draft-englishm-moq-relay-dos-00` (relay DoS), `draft-lcurley-moq-lite-02` (Discord's simpler "moq-lite" reaction to spec complexity). Expected RFC: not before late 2026; watch for "moq-transport-18+" to slow. [Bitmovin](https://bitmovin.com/blog/media-over-quic-bitmovin-cloudflare/)
- **LL-DASH and LL-HLS convergence** — Will Law's RFC 8673 byte-range pattern lets a single CMAF segment stream serve both LL-DASH chunked-transfer clients and LL-HLS partial-segment clients ([https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)). Practically realized in 2024–2025 via DASH-IF Live Media Ingest v1.2. [Akamai](https://www.akamai.com/blog/performance/-using-ll-hls-with-byte-range-addressing-to-achieve-interoperabi)
- **CMCD v2 and CMSD adoption** — both ExoPlayer/Media3 (since 1.6) and dash.js (5.x) ship CMCD v2; Shaka Player 4.16 added CMCDv2; DVB-DASH adopted CMCD in 2024 ([https://dvb.org/news/common-media-client-data-does-it-matter-for-dvb/](https://dvb.org/news/common-media-client-data-does-it-matter-for-dvb/)).
- **Content Steering deployments** — ETSI-published (TS 103 998), implemented in dash.js 4.5+ and Shaka Player 4.x; Brightcove's Reznik et al. paper at IBC 2024 reports multi-CDN deployment results ([https://www.ibc.org/accelerating-innovation/reports/ibc2024-tech-papers-content-steering-a-standard-for-multi-cdn-streaming/21401](https://www.ibc.org/accelerating-innovation/reports/ibc2024-tech-papers-content-steering-a-standard-for-multi-cdn-streaming/21401)).
- **AV1 and VVC rollout** — AV1 is the universal browser/Android codec for the open web; VVC reached its first hardware-decoder milestone with **Intel Lunar Lake (Core Ultra Series 2)** in September 2024 ([https://www.flatpanelshd.com/news.php?subaction=showfull&id=1725428953](https://www.flatpanelshd.com/news.php?subaction=showfull&id=1725428953)); Brazil's TV 3.0 (Globo, 2025) is the first national broadcast standard built on VVC + LCEVC + MPEG-H Audio over MPEG-DASH/ROUTE-DASH ([https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024](https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024)). [FlatpanelsHD](https://www.flatpanelshd.com/news.php?subaction=showfull&id=1725428953)[MainConcept](https://blog.mainconcept.com/mainconcept-powers-the-paris-olympics-2024)
- **Per-Title and Per-Scene encoding** — Netflix-pioneered (Aaron, Manohara, et al.); standard practice across Netflix, Bitmovin, Mux. Recent extensions include energy-aware encoding (Timmerer/Afzal, 2024).
- **ML-based ABR** — the Pensieve line (MIT) plus 2024 reinforcement-learning variants (Bentaleb et al., *IEEE TMC* 2024) and the ATHENA lab's "DeepStream" (IEEE TCSVT, April 2025). Not yet shipped in dash.js as default but increasingly common in commercial players.
- **Watermarking** — DASH-IF Watermarking API candidate specification under community review since 2024 ([https://dashif.org/guidelines/specifications/](https://dashif.org/guidelines/specifications/)).
- **WebCodecs / WebTransport custom players** — Chrome and Firefox shipping WebCodecs; Discord/kixelated's `moq-lite` proves you can build a real player without DASH or HLS by going directly from QUIC streams → WebCodecs decoders.
- **DASH-IF/MPEG sunsets** — SAND (23009-5) is effectively superseded by CMCD/CMSD in production; XLink-based ad insertion is being replaced by Media Presentation Insertion (MPI) in the 6th edition.

## Hooks for the article, infographic, and podcast

**60-second narrated hook.** "On 13 January 2024, an NFL playoff game streamed only on Peacock pulled 23 million average viewers and consumed 30% of all U.S. internet traffic that night. Behind the scenes, two technologies — DASH and CMAF, ratified by an ISO committee a decade earlier — quietly carried that load on a router-by-router HTTP cache mesh that already handles your image downloads. DASH won by being the most boring possible thing: an XML manifest pointing at MP4 files. Twelve years on, the spec is in its sixth edition, the industry forum that built it merged into a bigger alliance in mid-2024, and the engineers who designed it are now in the IETF defining its successor — Media over QUIC. This is the story of how an XML file ate live video."

**Striking statistic.** *Peacock streamed 23.5 billion minutes of Paris 2024 Olympic coverage — 40% more than every prior Summer + Winter Olympics combined.* Source: NBCUniversal, 13 Aug 2024 ([https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms](https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms)). [NBCUNIVERSAL MEDIA](https://www.nbcuniversal.com/article/nbcuniversals-presentation-spectacular-paris-olympics-dominates-media-landscape-across-all-platforms)

**"Pause and think" moment.** When you click play on YouTube on a Mac, the browser is downloading XML, parsing it, computing segment URLs from a `$Number%05d$` template, fetching MP4 fragments via HTTP `Range` requests, decrypting them through Widevine via the W3C EME bridge, decoding them via VP9 hardware on your GPU, and pushing them into MSE — all so you can spend 30 seconds learning that you actually wanted a different video. Source: this entire report; the layered HTTP-DRM-MSE-codec choreography is described in [https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP) with primary citations above.

**Failure-story arc.** *January 13, 2024. Peacock's engineering team has 6 weeks to scale infrastructure for the first ever NFL-playoff game streamed exclusively on a streaming service. Internal target: handle 25 million concurrent viewers without a SuperBowl-style buffering meltdown. The setup: hundreds of CMAF-packaged renditions across multiple CDNs, content steering switching viewers between Akamai, Fastly, and Comcast's own network in real time, and DASH-IF Live Media Ingest v1.2 feeding the packagers from redundant encoders.* The mistake everyone feared: clock skew. A 100-ms drift between the encoder cluster and the packager would have made `availabilityStartTime` math wrong, causing every player to either miss the live edge or 404 on the next segment. *The consequence (averted): there was no large-scale outage. The result: 27.6 million total viewers, 16.3 million concurrent devices, the largest single-day U.S. internet traffic event ever recorded — and the strongest argument yet that segmented HTTP streaming, packaged in CMAF and described in DASH and HLS manifests, is the correct architecture for "the internet as broadcast"* ([https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage](https://www.nbcuniversal.com/article/peacock-exclusive-afc-wild-card-game-biggest-live-streamed-event-us-history-drives-internet-usage); [https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html](https://www.cnn.com/2024/01/15/media/peacock-nfl-ratings-chiefs-dolphins/index.html)).

## Caveats

1. The 6th edition of ISO/IEC 23009-1 had reached **stage 50.00 (FDIS approved)** as of April 2025 per ISO's project page ([https://www.iso.org/standard/89027.html](https://www.iso.org/standard/89027.html)), but I did not find evidence of a "60.60 published" status as of May 2026; treat the 6th edition as imminent rather than published.
2. The "*streaming-specific* dash.js / Shaka / ExoPlayer CVE in 2024–2026" question came back empty in public CVE databases. CVE-2024-21485 ("dash") refers to **Plotly's `dash` Python package**, not the streaming player. If you're doing security work, query the GitHub Advisories on each project directly.
3. Some figures (e.g., "25–30 s standard HLS latency", "2–5 s LL-DASH", "< 1 s WebRTC") are *typical-deployment* ranges from vendor blogs (Mux, Wowza, Dacast) — they are not formal measurements and vary widely by encoder/CDN tuning.
4. The "DASH name origin" anecdote and several Demuxed Easter-egg claims (e.g., specific in-jokes inside dash.js) are folkloric; primary documentation is thin and these are flagged `[needs source]`.
5. MoQ deployment claims (Cloudflare in 330+ cities, nanocosmos at IBC 2025, Red5 OpenMOQ) are sourced from a Medium article ([https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce)) that aggregates the underlying Cloudflare/Bitmovin/IETF blog posts. The Bitmovin and IETF blog primary sources corroborate the architecture and Cloudflare relay deployment, but the exact city count is the Medium author's number; use cautiously.
6. The Peacock AFC Wild Card numbers are NBCU's own; while Nielsen-attested for the average audience, "30% of internet traffic" is NBCU's claim and was not independently audited in any source I found. Reasonable to cite, but flag the source.
7. Apple's relationship with DASH/CMAF in 2024–2026 is unchanged at the platform level: **AVPlayer still does not play DASH natively, FairPlay still does not encrypt DASH content, but iOS Safari's MSE-on-iPhone improvements (ManagedMediaSource) make DASH-via-Shaka/dash.js viable on iPhones for the first time as of iOS 17/18.** This is a meaningful 2024-era shift even though the underlying *position* didn't move.