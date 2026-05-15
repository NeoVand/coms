---
id: realtime-av/hls-and-dash
type: chapter
part_id: realtime-av
part_label: VIII
part_title: Real-time A/V
title: HLS and DASH
synopsis: Adaptive bitrate over plain HTTP — and the M3U playlist Winamp left behind.
podcast_target_minutes: 15
position_in_book: chapter 53 of 75
listening_order:
  prev: realtime-av/sip-and-sdp
  next: realtime-av/moq-transport
related_protocols: [rtmp, hls, http1, dash, http2]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A 1997 Winamp window opening an .m3u file, an arrow pointing forward to a 2026 .m3u8 master playlist starting with `#EXTM3U` — same first line, twenty-nine years apart."
  - "Side-by-side manifests — left: a small M3U8 listing 240p, 480p, 1080p, 4K variants; right: an XML MPD with Periods, Adaptation Sets, Representations, Segments — captioned 'same idea, different paperwork.'"
  - "A WWDC 2019 stage with a sub-2-second Sydney to Cupertino latency banner, then a 30 April 2020 calendar marker for `EXT-X-PRELOAD-HINT` replacing the HTTP/2 push requirement."
  - "Super Bowl LVIII scoreboard of streaming lag — Fubo 86.75s, Hulu Live 70.16s, Paramount+ 42.73s — versus broadcast at 0s."
  - "Two pipelines into one CDN — RTMP from OBS on the contribution side, HLS and DASH segments going out to viewers — captioned 'first mile vs last mile.'"
---

# Part VIII, Chapter — HLS and DASH

## The hook

The world's most-deployed video protocol still starts every playlist with `#EXTM3U`. That format was created by Fraunhofer IIS in 1995 for a player called WinPlay3, and Nullsoft popularised it in Winamp on 21 April 1997. Three decades later, every live sports stream, every Apple TV broadcast, every Netflix episode that touches an Apple device opens the same way. The internet runs on inheritance.

## The story

### Streaming Without Streaming Servers

Until 2008, live video on the web meant specialised streaming servers and specialised protocols. RTMP from Adobe, MMS from Microsoft, RTSP from the IETF — each one a separate stack from the HTTP servers that delivered everything else.

Apple changed that with HLS, HTTP Live Streaming. It shipped on 17 June 2009 with iPhone OS 3.0 and the iPhone 3GS. The authors at Apple were Roger Pantos and William May Jr. The 2007 and 2008 iPhones had no Flash, and Apple needed something that survived NAT and firewalls on 3G. Reusing HTTP on port 443 was a deliberate firewall-traversal play.

The trick was breaking the stream into 2 to 10 second segments. Each segment is a regular file — originally MPEG-TS, later MP4 or CMAF — accessible via plain HTTP. A small playlist file with the `.m3u8` extension lists the segments in order. The client downloads the playlist, fetches segments, and plays them. To support multiple bitrates, the server publishes parallel playlists for 240p, 480p, 1080p, 4K, and a master playlist on top. The client switches bitrates between segments based on the bandwidth it observes. The full mechanism — the manifest grammar, the segment formats, the encryption modes, the player state machine — is the HLS episode.

The playlist format itself is M3U, the one Fraunhofer IIS created in 1995 for WinPlay3 and Nullsoft popularised in Winamp on 21 April 1997. The world's most-deployed video protocol carries every live sports event, every Netflix stream, every Apple TV broadcast — and still opens with `#EXTM3U`.

### DASH — The IETF/MPEG Alternative

MPEG-DASH, formally ISO/IEC 23009-1, was first published in 2012 as the standardised version of the same idea. The differences from HLS are codec restrictions, manifest format — XML MPD instead of M3U8 — and licensing. The 5th edition, 23009-1:2022, is freely available via ISO ITTF. The 6th edition, FDIS 23009-1, reached stage 50.00 by April 2025 and adds L3D-DASH and SSR for sub-second join times. The full mechanism — Periods, Adaptation Sets, Representations, Segments, MPD updates — is the DASH episode.

The detail everyone gets wrong: Apple devices have never natively played DASH. FairPlay still does not work with DASH — Apple's own developer thread confirms it. Every iOS app must use HLS through AVPlayer. DASH on iOS is a custom-decoder situation. That is the structural reason HLS won the format war. Apple wouldn't switch.

CMAF, the Common Media Application Format published as ISO/IEC 23000-19, is what finally lets one set of fragmented MP4 segments serve both HLS and DASH. It started as a joint Apple and Microsoft proposal at MPEG meeting 114 in San Diego in February 2016, was first published in 2018, and reached its 4th edition in 2024. Disney+ runs 100% HLS plus CMAF end-to-end.

There was one more piece of housekeeping. DASH-IF, the industry forum that shepherded DASH for over a decade, merged into the Streaming Video Technology Alliance on 23 July 2024. It no longer exists as an independent standards organisation.

### Low-Latency, And The "Apple Took It Away" Drama

Apple announced Low-Latency HLS at WWDC 2019, session 502, with a Sydney to Cupertino live demo by Roger Pantos at sub-2-second latency. The original spec required HTTP/2 push — a hard dependency on a feature most CDNs supported poorly.

On 30 April 2020, after Mux's "the community gave us low-latency live streaming, then Apple took it away" backlash, Apple replaced the HTTP/2 push requirement with `EXT-X-PRELOAD-HINT` — a simpler, CDN-friendly hint that did not need server push. The community had been pushing back for almost a year by that point. The protocol design evolves. The politics of who designs it evolves more slowly. The HTTP/2 episode covers what server push actually was, and why it ended up deprecated almost everywhere.

The next cryptographic milestone landed in May 2026. The bis draft `draft-pantos-hls-rfc8216bis-22` added AES-256-GCM as a permissible HLS encryption method — the most consequential cryptographic change in nearly a decade. The same draft also renamed the "master playlist" to "Multivariant Playlist."

### The Latency Cliff and the BOLA Comeback

Super Bowl LVIII, on 11 February 2024, was instrumented by Phenix. The numbers: Fubo 86.75 seconds behind real time. Hulu Live 70.16 seconds. Paramount+ 42.73 seconds. That is proof that despite all the "low-latency" branding, OTT streaming is still 40 to 80 seconds behind broadcast in production.

Scale, on the other hand, is no longer in question. Peacock's AFC Wild Card game, Chiefs against Dolphins on 13 January 2024, reached 27.6 million total viewers and roughly 24.6 million concurrent — the most-streamed live event in U.S. history, consuming about 30% of U.S. internet traffic. The Paris 2024 Olympics on Peacock delivered 23.5 billion streamed minutes, 40% more than all prior Olympics combined.

On the algorithm side, BOLA — the Lyapunov-optimization adaptive bitrate algorithm by Spiteri, Urgaonkar, and Sitaraman — just won the 2026 IEEE INFOCOM Test of Time Award. It has been the dash.js default for years and is described as near-optimal without requiring throughput prediction.

CMCD and CMSD, formally CTA-5004, became universal in 2024. Native CMCD support shipped in AVPlayer with iOS 18 at WWDC 2024. CMCDv2, CTA-5004-A, was published in February 2026. The point of CMCD is straightforward — let servers see what their clients are actually doing, without the player having to roll a custom telemetry pipeline.

The post-Flash reality settled the protocol map for live. Adobe Flash Player retired on 31 December 2020, killing RTMP for delivery to viewers. RTMP survives only as the dominant contribution and ingest protocol — the path from OBS or Wirecast to the first server. Haivision's 2025 broadcast survey found SRT adoption among professionals reached 77% in 2025, up from 68% in 2024, surpassing RTMP's 58%. The full RTMP story — the chunk stream, the handshake, the AMF data path, why Twitch and YouTube Live still accept it — is the RTMP episode.

## The figures

The chapter has no embedded pioneers, outages, frontier entries, or RFC slots. The protocol records are covered as their own episodes — HLS, DASH, RTMP, HTTP/1.1, and HTTP/2.

## What it taught the industry

HLS and DASH together rewrote the rule that live video needs special infrastructure. Once segments became plain HTTP files and playlists became plain text, the entire CDN industry — already optimised for caching HTTP objects — could carry video at internet scale without any new gear. That is why Disney+ goes 100% HLS plus CMAF end-to-end, and why every major sports broadcast in 2024 and 2025 shipped over the same plumbing as a software download.

The second lesson is about who controls a format. DASH is the open ISO standard, vendor-neutral, with a richer manifest model. HLS is Apple's proprietary protocol. HLS won, because Apple devices have never natively played DASH and FairPlay does not encrypt DASH. A standard you can read does not beat a platform that owns the playback path.

The third lesson is the latency cliff. Even with low-latency HLS and low-latency DASH, the Super Bowl LVIII numbers show OTT is still 40 to 80 seconds behind broadcast. That is the gap MoQ Transport is being designed to close — picked up in the next chapter.

## Listening order

- **Before this chapter:** "SIP and SDP" — sets up the signalling and session-description world that adaptive HTTP streaming deliberately walked away from.
- **After this chapter:** "MoQ Transport" — picks up the sub-second-latency story that LL-HLS and L3D-DASH only partly solved, by moving the substrate to QUIC.

## Where to go deeper

- The HLS episode picks up the manifest grammar, the segment formats, encryption modes including the new AES-256-GCM, low-latency partial segments, and the 8216bis renaming of "master playlist" to "Multivariant Playlist."
- The DASH episode covers the MPD hierarchy — Periods, Adaptation Sets, Representations, Segments — plus L3D-DASH and SSR in the 6th edition, and how dash.js uses BOLA for adaptation.
- The RTMP episode covers the contribution-and-ingest story — why Twitch, YouTube Live, and Facebook Live still accept it years after Flash died, plus the RTMPS variant Meta has required since 2019.
- The HTTP/1.1 episode is the substrate both formats were designed for — persistent connections, chunked transfer, and why a CDN cache full of segment files is such a natural fit.
- The HTTP/2 episode covers multiplexing and the now-deprecated server push that LL-HLS originally required and then dropped on 30 April 2020.
