---
id: streaming-media
type: journey
title: Streaming Video
scope: realtime-av
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [rtmp, hls, dash]
related_protocols: [rtmp, hls, dash]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: RTMP, then HLS, then DASH — with a timeline along the bottom marking 2005-era live streaming, 2009 Apple's HLS launch, and the ISO standardisation of DASH"
  - "RTMP as one persistent TCP pipe carrying interleaved chunks of audio, video, and control messages — with a small annotation reading 'latency: 1 to 3 seconds'"
  - "HLS playlist anatomy: an .m3u8 file pointing at multiple bitrate ladders (360p, 720p, 1080p, 4K), each ladder a row of 6 to 10 second segment files, with arrows showing the player jumping between rows as bandwidth changes"
  - "Side-by-side comparison of HLS and DASH: an Apple .m3u8 playlist next to a DASH XML Media Presentation Description, both pointing at the same segments on the same CDN"
  - "An OBS box on a streamer's desk pushing RTMP up to Twitch, and Twitch fanning the same stream out to viewers as HLS — one protocol in, a different protocol out"
---

# Streaming Video

## In one breath
This journey walks three approaches to getting video from a server onto
your screen. RTMP held the live-streaming crown for over a decade. HLS
broke it open by sending video as plain HTTP files. DASH is the open
standard that followed. Together they tell the story of how streaming
moved from specialised servers to the ordinary web.

## The hook (cold-open)
Open Netflix, hit play, and a 4K stream starts in under two seconds.
Switch to Twitch and a live broadcast lands on your screen 1 to 3
seconds after the streamer speaks. Two very different experiences, and
underneath them sit three protocols that fought for this job over
fifteen years. One came from Flash. One came from Apple. One came from
a standards body trying to keep the web open. In the next few minutes
we walk all three, in the order they took the stage.

## The journey

### Step 1 — RTMP: Legacy Streaming (RTMP)
RTMP, the Real-Time Messaging Protocol, was developed by Macromedia for
Flash Player and became the dominant live streaming protocol for over
a decade. It holds open a persistent TCP connection and multiplexes
audio, video, and data messages into interleaved chunks, hitting 1 to 3
seconds of latency for live broadcasts. RTMP powered early YouTube
Live, Twitch, and Facebook Live. The cost was real: it needed
specialised streaming servers like Adobe Media Server or Wowza, and it
struggled to pass through many firewalls and proxies. Flash Player
reached end of life in 2020, which ended RTMP's role on the playback
side, but the protocol survives where it still wins — as an ingest
format. Streamers point OBS at Twitch over RTMP, and Twitch transcodes
the feed and redistributes it to viewers using newer protocols. The
full mechanism is in the RTMP episode — here we just need to know that
RTMP is one persistent pipe, low latency, and tied to bespoke server
software.

RTMP's dependence on Flash and specialised servers was its downfall.
The insight that changed everything was simple: what if you broke video
into small files and served them over plain HTTP? Suddenly any web
server, any CDN, and any HTTP cache in the world could deliver video
without special software.

### Step 2 — HLS: Adaptive HTTP (HLS)
HLS, HTTP Live Streaming, was created by Apple in 2009 and broke video
streaming wide open. The encoder splits the video into small segments,
typically 6 to 10 seconds each, and encodes every segment at multiple
quality levels — 360p, 720p, 1080p, 4K. A playlist file with the .m3u8
extension lists the available segments and the available qualities. The
player downloads the playlist, starts pulling segments, and watches its
own download speed. If bandwidth drops, it switches to a lower-quality
ladder for the next segment. When bandwidth recovers, it climbs back
up. Because every byte travels as a plain HTTP file, every CDN, every
proxy, and every cache on the internet can serve it without knowing
anything about video. That is what made HLS massively scalable. Safari
and iOS support it natively, and nearly every streaming platform uses
it as their primary delivery format. The full mechanism is in the HLS
episode — here we just need the outcome: video as a folder of HTTP
files, with the player picking the right quality moment to moment.

HLS transformed video delivery, but it is an Apple-developed
technology. The internet standards community wanted an open,
vendor-neutral alternative — same adaptive benefits, wider codec
support, no patent encumbrances around the playlist format itself.

### Step 3 — DASH: Open Standard (DASH)
DASH, Dynamic Adaptive Streaming over HTTP, is the ISO-standardised
answer to HLS. Instead of an Apple-specific playlist format, DASH uses
an XML-based Media Presentation Description, the MPD, that describes
every available representation — its codec, its resolution, its
bitrate, and the URLs of its segments. DASH is codec-agnostic, so it
runs H.264, H.265 / HEVC, VP9, AV1, and any future codec without
changing the protocol itself. It also offers more flexible segment
addressing — template-based URLs, byte-range requests, timeline-based
indexing — and it supports multi-period presentations, which is how
mid-roll ads get inserted as separate periods inside the same stream.
Content protection descriptors plug straight into DRM systems. Netflix,
YouTube, and most major streaming services use DASH for non-Apple
devices, often running DASH and HLS in parallel to cover the entire
device ecosystem. The full mechanism is in the DASH episode — here we
just need to know that DASH is the open answer to the same problem HLS
solved, with broader codec and DRM hooks bolted in by design.

## What the listener now understands
Three approaches. One protocol — RTMP — solved live streaming first by
holding open a persistent TCP pipe, and paid for it with specialised
servers and firewall pain. The other two — HLS and DASH — gave that up
and bet everything on plain HTTP files. That bet is the whole story of
modern streaming: once video became a folder of small files on a
regular web server, every CDN on the planet quietly became a video
distribution network. RTMP still wins on the ingest side, where one
streamer pushes one feed to one platform. HLS and DASH win on the
delivery side, where one feed has to fan out to millions of viewers on
every device that exists.

## Where this connects in the book
- The chapter on RTMP covers the Flash era in full — the persistent
  TCP connection, the chunk stream, and the long second life as the
  ingest protocol of choice for live platforms.
- The chapter on HLS walks through the .m3u8 playlist format, the
  bitrate ladder, and the adaptive bitrate logic that decides which
  segment to fetch next.
- The chapter on DASH unpacks the MPD, the codec-agnostic design, the
  multi-period model that makes ad insertion work, and the DRM hooks
  that the major streaming services depend on.

## See also (other journeys and protocol episodes)

- If the question on your mind is why every modern streaming service
  ships both HLS and DASH at the same time, the HLS episode and the
  DASH episode are the right pair to listen to back to back. They
  solve the same problem from different sides of the same fence.

- If you want the live-streaming side of this story rather than the
  on-demand side, the RTMP episode is where to spend more time. It is
  the protocol that refused to die because nothing else has matched it
  for low-latency ingest from a single source.

- If the CDN angle caught your attention — the idea that any plain
  HTTP cache became a video server overnight — the HLS episode is the
  cleanest entry point. That single design choice is what made web-
  scale video possible at all.

## Visual cues for image generation

- Three-node graph lighting up in sequence: RTMP, then HLS, then DASH —
  with a timeline along the bottom marking the Flash era, Apple's 2009
  HLS launch, and the ISO standardisation of DASH.
- RTMP as one persistent TCP pipe carrying interleaved chunks of
  audio, video, and control messages — with a small annotation reading
  "latency: 1 to 3 seconds".
- HLS playlist anatomy: an .m3u8 file pointing at multiple bitrate
  ladders — 360p, 720p, 1080p, 4K — each ladder a row of 6 to 10
  second segment files, with arrows showing the player jumping between
  rows as bandwidth changes.
- Side-by-side comparison of HLS and DASH: an Apple .m3u8 playlist
  next to a DASH XML Media Presentation Description, both pointing at
  the same segments on the same CDN.
- An OBS box on a streamer's desk pushing RTMP up to Twitch, and
  Twitch fanning the same stream out to viewers as HLS — one protocol
  in, a different protocol out.
