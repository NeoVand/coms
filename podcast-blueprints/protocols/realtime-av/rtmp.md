---
id: rtmp
type: protocol
name: Real-Time Messaging Protocol
abbreviation: RTMP
etymology: "[R]eal-[T]ime [M]essaging [P]rotocol"
category: realtime-av
year: 2002
rfc: null
standards_body: adobe
podcast_target_minutes: 22
related_book_chapters:
  - realtime-av/hls-and-dash
  - realtime-av/moq-transport
related_protocols: [tcp, tls, hls, dash, http1, ip]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Macromedia_6_media.jpg/500px-Macromedia_6_media.jpg
    caption: Macromedia, later acquired by Adobe, created RTMP for Flash Player in 2002. For over a decade RTMP was the dominant live-streaming protocol on the web — and despite Flash's death in 2020, it is still the dominant ingest protocol in 2026.
    credit: Photo — Wikimedia Commons / CC BY-SA 3.0
visual_cues:
  - "An exploded view of one RTMP chunk on the wire — a one-byte basic header showing fmt=0 and chunk-stream-id=6, the eleven-byte type-0 message header (timestamp, length, type, message-stream-id in little-endian), an optional four-byte extended timestamp, and the payload. Annotations call out the little-endian outlier in a sea of big-endian fields."
  - "A side-by-side cartoon of the RTMP six-message handshake — C0 a single byte, C1 a 1536-byte block of timestamp plus random, then S0+S1+S2 from the server, then C2. Total bytes counted at the bottom — 3073 each way."
  - "A diagram of the canonical 2026 live-streaming pipeline — OBS pushing RTMPS at 1080p60 to an edge ingest box, the edge relaying to an origin, transcode produces 1080p / 720p / 480p HLS renditions, a CDN fan-out delivers to phones and TVs. Ingest path labelled 'first mile, RTMP since 2002', delivery path labelled 'last mile, HLS since 2009'."
  - "A timeline labelled 'thirty years of RTMP' — November 1999 Tin Can codename, July 2002 Flash Communication Server MX 1.0, December 2005 Adobe acquires Macromedia, May 2009 Adobe DMCAs rtmpdump, December 2012 spec PDF published, December 2020 Flash EOL, May 2019 Facebook forces RTMPS, March 2025 WHIP becomes RFC 9725, January 2026 Enhanced RTMP v2 release."
  - "A latency-ladder bar chart — WebRTC at 100-400 ms at the top, Red5 Pro tuned RTMP at sub-250 ms, SRS RTMP at 0.8-3 s, Mux RTMP at 2-5 s, LL-HLS at 2-5 s, standard HLS at 15-30 s. Each bar labelled with the source measurement."
  - "An OBS Studio screenshot mock-up — the Stream settings panel, Service set to 'Custom', Server filled with 'rtmps://live-api-s.facebook.com:443/rtmp/', Stream Key redacted. Below it, a terminal window showing the equivalent ffmpeg command with -f flv."
---

# RTMP — Real-Time Messaging Protocol

## In one breath

RTMP is the Flash-era streaming protocol that refused to die. It was born in 2002 to give Flash Player two-way audio and video; its parent platform was retired on 31 December 2020, and yet in 2026 RTMP is still the protocol every encoder on Earth uses to push a live stream into Twitch, YouTube Live, Facebook Live, LinkedIn Live, Kick, Cloudflare Stream and Mux. It runs on a single TCP connection, multiplexes audio, video and command messages as small interleaved chunks, and gets you from camera to cloud in two to five seconds.

## The pitch (cold-open)

In December 2020, Adobe pulled the plug on Flash. The internet held a small wake. Twenty-five-year-old browser plug-ins are not supposed to be missed. But almost no one noticed that one piece of Flash survived — and not just survived, runs the global live-streaming industry to this day. It is called RTMP. Every time a Twitch streamer hits "Go Live", every time someone wedding-streams over Facebook Live, every time a corporate town hall lights up YouTube, RTMP carries the bits. The "open" specification Adobe published in 2012 deliberately omitted the encryption scheme, the reverse engineers won within months, and here we are in 2026 with WebRTC and QUIC trying to take the throne while RTMP still stands.

## How it actually works

RTMP runs over a single TCP connection on port 1935 — IANA still registers that port as `macromedia-fcs`, the original product name. Once TCP is up, the two sides perform a fixed six-message RTMP handshake before any real data flows: C0 plus C1 from the client, S0 plus S1 plus S2 from the server, then C2. Each side sends exactly 3073 bytes — a one-byte version, then 1536 bytes of timestamp plus random data, then a 1536-byte echo of the peer's random. The ordering rules from spec section 5.2 are strict: the client must wait for S1 before sending C2, and must wait for S2 before sending any RTMP message at all.

Once the handshake clears, the client sends an AMF0-encoded `connect` command naming the application — usually `live` — with a `tcUrl` like `rtmp://ingest.example.com/live`. The server validates the stream key and replies with `_result` plus `Window Acknowledgement Size` and `Set Peer Bandwidth` control messages. The client then issues `createStream`, gets back a stream id of 1, and sends `publish("stream-key-abc", "live")`. The server answers `onStatus(NetStream.Publish.Start)`. From that moment forward, the encoder pushes interleaved audio (RTMP message type 8) and video (type 9) chunks. Subscribers swap `publish` for `play` and add a `Set Buffer Length` user-control. Teardown is `deleteStream` followed by closing TCP.

The payloads are FLV tag bodies. The container is exactly Adobe's old Flash Video file format — an RTMP type-9 message body is one FLV video tag, minus the FLV tag header. H.264 video and AAC audio are the canonical codecs since 2003.

### Header at a glance

RTMP is layered. The application sees AMF0 or AMF3 commands plus audio, video and script payloads. The message layer wraps each of those as a typed message with a length and a timestamp. Underneath that, the chunk layer chops every message into pieces of at most `chunk_size` bytes — default 128, almost always raised to 4096 — and interleaves chunks from different streams over the single TCP byte stream. The whole point of the chunking is so a small audio packet does not get stuck behind a large video keyframe.

Each chunk has three fields plus payload:

- **Basic header (1 to 3 bytes).** Two high bits are `fmt`, the chunk-header type, value 0 to 3. The low six bits are the chunk-stream id. Six-bit ids 3 through 63 fit in one byte; id 0 escapes to a two-byte form, id 1 to a three-byte form. By convention, audio rides chunk-stream 4 and video rides chunk-stream 6.
- **Message header (0, 3, 7 or 11 bytes).** Selected by `fmt`. Type 0 is the full eleven-byte header — three-byte absolute timestamp, three-byte message length, one-byte message type, four-byte message-stream id. Type 1 drops the message-stream id. Type 2 keeps only a three-byte timestamp delta. Type 3 is zero bytes and reuses everything from the previous chunk on the same chunk-stream.
- **Extended timestamp (0 or 4 bytes).** Present only when the three-byte timestamp field maxes out at 0xFFFFFF — about 16.7 million milliseconds, or four hours and thirty-nine minutes.

The famous footgun: every numeric field in RTMP is big-endian, except the four-byte message-stream id in a type-0 chunk header, which is little-endian. Misread that and your decoder will produce nonsense stream ids forever.

Message types worth knowing: type 1 is `Set Chunk Size`, type 5 is `Window Acknowledgement Size`, type 6 is `Set Peer Bandwidth`, type 8 is audio, type 9 is video, type 18 is an AMF0 data message used for `onMetaData`, type 20 is an AMF0 command, type 22 is an aggregate.

### State machine in three sentences

RTMP's connection state lives in two ActionScript-derived objects: the NetConnection, which is one TCP socket that has completed the `connect` command, and the NetStream, which is one logical media stream — publish or play — multiplexed inside that NetConnection by message-stream id. Inside the chunk layer, each chunk-stream id keeps its own remembered timestamp, length, type and message-stream so that type-1, type-2 and type-3 chunks can compress their headers by reusing prior values. The whole protocol assumes TCP is keeping the byte stream in order — RTMP itself has no retransmission and no recovery from gaps.

### Reliability, flow and security mechanics

Reliability is entirely delegated to TCP. RTMP has no application-layer checksum and no recovery — if a chunk is lost, the byte stream stalls until TCP retransmits. That makes head-of-line blocking the protocol's defining weakness on lossy networks, which is exactly why SRT, WebRTC and MoQ all live on UDP.

Flow control is `Window Acknowledgement Size` plus `Acknowledgement` messages. The sender must stop after writing `windowSize` bytes — Adobe's default is 2.5 megabytes; nginx-rtmp uses 5 — and resume only when the peer sends an Acknowledgement. Forgetting to handle that handshake is the single most common cause of "stream freezes after a few seconds" bugs in the wild.

Security has three flavours. Plain RTMP gives you nothing — stream keys traverse the wire in cleartext, and you should not run it over the public internet. RTMPS is RTMP wrapped in standard TLS on port 443; it is what every reputable platform in 2026 either prefers or mandates. RTMPE is Adobe's home-grown DH-plus-RC4 wrapper from Flash Media Server 3 in 2007 — its entire crypto edifice rests on a literal ASCII string, `Genuine Adobe Flash Player 001`, baked into every copy of the player; treat it as obfuscation, not security. RTMPT and RTMPTE tunnel RTMP inside HTTP POSTs for clients stuck behind restrictive proxies.

## Where it shows up in production

**Twitch.** Justin.tv launched in 2007 around RTMP ingest. Twitch grew out of it in 2011, and in 2026 Twitch still runs the largest single-tenant RTMP ingest network on the planet. Twitch caps creator ingest at 8 megabits per second, with higher allowances for partners. Twitch shipped an experimental WHIP endpoint at `g.webrtc.live-video.net:4443/v2/offer` after Sean DuBois announced it on LinkedIn in 2023, but the production ingest path is still RTMPS.

**YouTube Live.** Accepts RTMP, RTMPS, HLS and DASH for ingestion in 2026. The `developers.google.com` ingestion-protocol-comparison page, last updated 28 April 2026, has not deprecated plain RTMP, but Google strongly recommends RTMPS. YouTube recommends 6 to 13.5 megabits per second for 1080p60.

**Facebook Live and LinkedIn Live.** Facebook deprecated plain RTMP on 1 May 2019, requiring RTMPS for all ingest. LinkedIn Live has always required RTMPS. The 2019 cutover broke a generation of nginx-rtmp-module relays that did not yet speak `rtmps://`; the well-known workaround was a `stunnel` proxy converting plain RTMP to TLS on the fly.

**Mux.** "We have focused on RTMP and RTMPS for live streams from an encoder as they are the most universal ingest protocols." Mux measures end-to-end glass-to-glass latency on its own pipeline at two to five seconds.

**Cloudflare Stream.** Accepts RTMP, RTMPS, SRT and WHIP. Starting 13 March 2025, Cloudflare began migrating its WHIP and WHEP path to a separate product called Cloudflare Realtime — and has deployed an MoQ relay at every Cloudflare edge across more than 330 cities.

**The hardware encoder world.** Teradek, AJA, LiveU, Magewell and every comparable box ships RTMP and RTMPS as a default output. OBS Studio is the world's most-used software encoder; it has had an official `obs-webrtc` WHIP output since OBS 30 in August 2023, and HEVC and AV1 over RTMP since OBS 29.1 via Enhanced RTMP.

**The server world.** SRS, the open-source "Simple Realtime Server", started by Winlin in October 2013, supports RTMP, WebRTC, HLS, HTTP-FLV, HTTP-TS, SRT, MPEG-DASH and the Chinese surveillance protocol GB28181 in its 2026 release; SRS measures RTMP latency at 0.8 to 3 seconds in tuned configurations. Wowza Streaming Engine — founded by ex-Adobe engineers David Stubenvoll and Charlie Good, which is precisely why Adobe sued them in 2011 — is still widely used in enterprise. Adobe Media Server is functionally legacy: in February 2019 Adobe granted Veriskope rights to develop and sell it, and v5.0.16 was the last release. Red5 Pro markets sub-250 ms RTMP. Node-Media-Server is the popular Node.js choice for prototyping. Ant Media added first-party WHIP in v2.10.

The canonical industry topology has not changed in a decade: encoder pushes RTMP or RTMPS to the nearest edge, the edge relays to an origin, the origin transcodes to multiple HLS or DASH renditions, and a CDN fans out to viewers. Wowza's 2021 Video Streaming Latency Report measured more than 76 percent of content distributors using RTMP for ingest, and that figure is still the one industry guides repeat in 2026.

## Things that go wrong

**The 2009 rtmpdump DMCA takedown.** A small open-source project called rtmpdump, written by Andrej Stepanchuk, had spent a year reverse-engineering Adobe's "secure" RTMPE variant. Stepanchuk found the entire crypto edifice resting on one ASCII string — `Genuine Adobe Flash Player 001` — visible inside every copy of the Flash Player on Earth. There was no key exchange, no certificate authority, no actual secret. The DRM was theatre. In May 2009 Adobe issued a DMCA takedown notice to SourceForge and the project page went dark.

The rtmpdump developers moved to MPlayer's servers in October 2009, rewrote the code in C, slimmed it down by half, and split out a reusable library called `librtmp`. Within months it was embedded in FFmpeg, VLC, MPV, cURL and XBMC. Adobe never sued again. The lesson the industry took away: a "secure" proprietary scheme that hides its key in the binary is not secure, and the open-source ecosystem will route around it. A code-sanitised fork called flvstreamer was kept legally clean by removing all RTMPE support — a beautiful example of license-aware forking.

**The 2011 Adobe v. Wowza patent suit.** Adobe sued Wowza in 2011 for RTMP-related patent infringement, notably US 7,246,356. The suit was settled and dismissed with prejudice in 2015. The episode mostly served to remind every server vendor that the "open" RTMP specification still came with a patent license whose terms forbade circumventing Adobe's secure measures.

**The 2019 Facebook forced-RTMPS migration.** When Facebook deprecated plain RTMP on 1 May 2019, every relay built on a nginx-rtmp-module that did not yet speak `rtmps://` broke at midnight. The community workaround — a stunnel TCP-to-TLS proxy in front of the relay — became a documented pattern that is still in use in 2026.

**The FFmpeg RTMP demuxer overflows of 2016.** Three CVEs — CVE-2016-10190, 10191 and 10192 — found by paulcher exploited a chunk-size mismatch in FFmpeg's RTMP demuxer to overflow `RTMPPacket[]` and gain remote code execution through a function-pointer overwrite. Public exploits followed. Patched in FFmpeg 3.2.2 and later. The lesson was that an under-specified protocol with thirteen years of organic implementations grows attack surface in places nobody is auditing.

**nginx-rtmp-module's slow-motion limbo.** Roman Arutyunyan's repository sits at fourteen thousand stars and 3.6 thousand forks, and is the default open-source RTMP server for a generation of streaming startups. Its master branch's last meaningful push was December 2024, and the issue tracker has unanswered reports from late 2024 and 2025. There is no formal abandonment notice. Operators should treat the absence of any 2024 or 2025 CVE against the module as "no eyes on it" rather than "no bugs". Greenfield deployments in 2026 mostly choose SRS, MediaMTX or Node-Media-Server instead.

For the deeper Flash-era story arc — the protocol's origins at Macromedia, Sarah Allen and Pritham Shetty's design choices, the Adobe acquisition, the 2012 spec drop, the protocol-that-outlived-its-platform reversal — see the chapter episode on HLS and DASH, which traces how the live-streaming stack split into RTMP for ingest and HLS for delivery.

## Common pitfalls (for the practitioner)

**Forgetting the AVC and AAC sequence headers before the first keyframe.** The connection succeeds, the publish looks fine, and viewers get a black screen forever — because the player never received the codec parameters it needs to initialise the decoder. Documented at length on the Adobe forum since the late 2000s.

**Mishandling Window Acknowledgement Size.** The sender must stop after writing the configured window of unacknowledged bytes — default 2.5 megabytes per the spec, 5 megabytes on nginx-rtmp. Forget to track the window or to honour incoming Acknowledgement messages and your stream "freezes after a few seconds of video". Almost every junior RTMP implementation hits this.

**Wrong chunk-stream ids.** Audio on chunk-stream 4 and video on chunk-stream 6 is convention, not spec. Some servers refuse anything else. If your custom encoder picks 7 and 8, expect undefined behaviour.

**Type-3 chunks with extended timestamps.** The spec says type-3 chunks "must not" carry an extended timestamp. In practice every Flash Player and most servers do, and so every implementation must accept them. Reject them and you cannot interoperate with anything from the Adobe lineage.

**Keyframe interval too long.** Twitch, YouTube and most platforms reject GOPs longer than two seconds for low-latency mode. Always closed GOPs. Always.

**Bitrate set to your full upload speed.** TCP retransmits eat headroom. Cap encoder bitrate at 70 to 80 percent of sustained upload, never higher.

**Plain RTMP over the public internet.** Stream keys traverse the wire in cleartext. Always RTMPS for any non-public stream. The marginal CPU cost on modern x86 is essentially zero.

**The 32-bit millisecond timestamp wraps every 49.7 days.** RFC 1982 serial-number arithmetic is mandated by the spec; long-running streams that ignore it get into trouble.

## Debugging it

**Wireshark.** The built-in RTMPT dissector has shipped since 2008. Capture with `tcp.port == 1935`, then `Decode As → RTMPT` for the first few packets — the heuristic only fires after S0 plus S1 plus S2. Display filter is `rtmpt`. For native bandwidth-detection traffic, raise the `RTMPT max packet size` preference. There is one known dissector pothole — Wireshark issue 17813, where a crafted RTMP packet pegs the dissector at 100 percent CPU in an infinite loop.

**`librtmp -V`.** Verbose handshake debug from the rtmpdump-derived library that lives inside FFmpeg, VLC, cURL and MPV. The first thing to look at when handshake negotiation fails.

**`tcpflow`.** Isolate the byte stream and feed it to `xxd` for human-readable inspection of the chunk headers — the type-0 message-stream id in little-endian is the field that catches most byte-by-byte readers off guard.

**Sysctls.** `net.ipv4.tcp_nodelay = 1`, `net.ipv4.tcp_notsent_lowat = 16384`, large send buffers, and bump `net.core.wmem_max` for 4K. Linux kernel autotuning handles 1080p well out of the box.

**Server-side.** On nginx-rtmp, `drop_idle_publisher 10s;` saves you from zombie connections silently consuming a stream slot. On SRS, the LTS docs at `ossrs.net` cover the low-latency tuning recipe — chunk size 4096, GOP cache off for sub-second.

**The fastest test environment.** `docker run --rm -it -p 1935:1935 -p 1985:1985 -p 8080:8080 ossrs/srs:6` and then `ffmpeg -re -i input.mp4 -c copy -f flv rtmp://localhost:1935/live/stream-key`. ngrok TCP tunnels expose your local server over the public internet for end-to-end testing.

## What's changing in 2026

**Enhanced RTMP v2 reached release status as v2-2026-01-31-r2.** The non-profit Veovera Software Organization, founded 2022, published v1 then v2 of "E-RTMP" — alpha in March 2024, beta in October 2024, the release on the last day of January 2026. Industry sign-on includes Adobe, YouTube, Twitch, Amazon, FFmpeg, OBS, VideoLAN, Ant Media, Dolby and Intel. E-RTMP adds HEVC, VP9 and AV1 video; Opus, FLAC, AC-3 and E-AC-3 audio; multitrack via the new ModEx extensions; nanosecond-precision timestamps; and a Reconnect Request feature. This is the most plausible "RTMP wins the next decade" timeline. Amazon IVS launched Multitrack Video on E-RTMP through 2024 and 2025.

**WHIP became RFC 9725 in March 2025.** Sergio Garcia Murillo of Millicast and Alex Gouaillard of CoSMo Software wrote the WebRTC-HTTP Ingestion Protocol — a single HTTP POST that carries an SDP offer; the server returns a 201 with an SDP answer and a session URL for ICE updates via PATCH and teardown via DELETE. WHIP is the first IETF-blessed direct competitor to RTMP for ingest. Implementations now include OBS 30 and later, Twitch's experimental beta, Cloudflare Realtime, Dolby.io, Millicast, Ant Media, MediaMTX, Janus, Mediasoup, VDO.Ninja, SRS and Pion.

**Cloudflare migrated its WHIP and WHEP stack to Cloudflare Realtime starting 13 March 2025**, and deployed a global MoQ relay network across more than 330 cities — the first of its kind.

**The IETF MoQ Working Group is producing real production deployments.** `draft-ietf-moq-transport-17` was published in March 2026 with co-editors Suhas Nandakumar from Cisco, Victor Vasiliev and Ian Swett from Google, and Alan Frindell from Meta. nanocosmos shipped MoQ at IBC 2025; WINK Streaming reports 200 to 300 millisecond production latency. NAB 2026 on 28 April demoed MoQ interop across eleven vendors under a new "OpenMOQ Software Consortium" — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia and Red5. For the deeper story on what MoQ is and why the IETF is betting on it, see the chapter episode on MoQ Transport.

**SRT adoption among professionals reached 77 percent in 2025**, up from 68 percent in 2024, surpassing RTMP's 58 percent in Haivision's 2025 broadcast survey. SRT recovers about 25 percent packet loss with a one-second buffer and ships built-in AES-256 — but YouTube and Facebook still do not natively accept SRT ingest in 2026.

**rtmpdump and librtmp upstream development is dormant**, surviving as forks pinned by FFmpeg. nginx-rtmp-module's master branch is in slow-motion limbo. The protocol itself is not being deprecated. It is being slowly flanked.

## Fun facts (host material)

**Why port 1935?** No public Macromedia rationale survives. IANA still registers it as `macromedia-fcs` — Macromedia Flash Communication Server, the protocol's original product name. Twenty-four years of streaming-industry inertia have kept that vestige alive.

**"Tin Can"** was the project codename inside Macromedia in late 1999, because the original demo was two-way audio between two Flash clients — like the toy tin-can-and-string telephone. The architect of Flash itself, Jonathan Gay, pitched it. The principal architect of the protocol was Pritham Shetty. Sarah Allen was an early engineer on the Flash Communication Server platform. The whole thing shipped publicly as Flash Communication Server MX 1.0 on 9 July 2002.

**AMF was not invented for RTMP.** Adobe's Action Message Format was originally Flash Remoting's wire format from Flash Player 6 in 2001 — a SOAP-style RPC binary used against AMFPHP, WebORB and ColdFusion. RTMP just adopted AMF for its command messages because the same client-side ActionScript objects had to traverse it.

**The magic key is in the binary.** Every RTMPE and digest-handshake implementation contains the literal ASCII string `Genuine Adobe Flash Player 001` and its server cousin `Genuine Adobe Flash Media Server 001`, because Flash Player itself does. Marketing money was poured into RTMPE as DRM. In reality the key is right there.

**Adobe DMCA'd rtmpdump the same year it promised to publish the spec.** Slashdot's headline on 22 May 2009 — "Adobe Uses DMCA On Protocol It Promised To Open" — captured the moment. Eleven years later Flash itself died. The protocol Adobe spent millions defending lives on as the universal ingest standard.

**RTMP outlived Flash by more than five years.** Sarah Allen, on Demuxed episode 13: "RTMP's simplicity and high efficiency is also the main reason why it is still used today" — recorded roughly seventeen years after she helped ship it. The protocol that survived its own creator's lawsuits is also the protocol that outlived its creator's plug-in.

## Where this connects in the book

- **Part Real-Time A/V, chapter "HLS and DASH"** — how Apple split the live-streaming stack on 17 June 2009 with the iPhone 3GS, why segmented HTTP delivery beat persistent streaming for the last mile, and why RTMP was left holding the first mile. Also the post-Flash reality where Haivision's 2025 survey put SRT at 77 percent of professional adoption versus RTMP at 58 percent.

- **Part Real-Time A/V, chapter "MoQ Transport"** — the IETF's bet on the next decade of live media, why the MoQ working group intentionally is not building on RTP, why MoQ targets sub-one-second latency at HLS-style fan-out, and the spec-forking-from-inside-the-working-group drama with Luke Curley's `draft-lcurley-moq-lite-02`. RTMP shows up there as the incumbent ingest protocol that MoQ is, eventually, designed to replace.

## See also (other protocol episodes)

**RTP — the alternative for ingest.** If you have heard the RTP episode, the contrast is everything. RTP carries every voice call and video conference on UDP, with twelve-byte headers, no retransmission, and an explicit jitter buffer. RTMP carries every live-streaming ingest on TCP, with chunk-and-message framing, full reliability, and head-of-line blocking. RTP is for conversations; RTMP is for broadcast contribution. Different transport, different direction, different failure modes.

**HLS — the complement, not the competitor.** The HLS episode is the other half of the same pipeline. Encoder pushes RTMP or RTMPS in; the server transmuxes to HLS fMP4 or CMAF segments out. HLS wins on cache-ability and global CDN scale. RTMP wins on contribution latency. Low-Latency HLS in 2026 closes the playback gap to two to five seconds but does not replace RTMP for ingest. The pattern "RTMP for ingest, HLS for delivery" has held for a decade and remains correct.

**DASH — the ISO-standard delivery alternative.** Same complementary relationship to RTMP as HLS. MPEG-DASH was first published in 2012 as an ISO international standard rather than an Apple-led RFC. YouTube uses DASH for video-on-demand and HLS for live; Disney+ runs 100 percent HLS plus CMAF end-to-end.

**TCP — the foundation.** Every RTMP NetConnection is one TCP socket. Every RTMP stream is a logical multiplex inside one byte stream. Head-of-line blocking at TCP propagates to every multiplexed media stream — which is precisely the limitation that motivates UDP-based replacements like SRT, WebRTC and MoQ. The TCP episode covers the reliable byte-stream guarantee that RTMP completely depends on and never tries to replicate.

**TLS — the security envelope.** RTMPS is RTMP wrapped in standard TLS, on port 443, with no protocol changes. Modern hardware does TLS in essentially free CPU cycles. Facebook required RTMPS on 1 May 2019; YouTube strongly recommends it; LinkedIn mandates it. The TLS episode covers the handshake and the cipher suites that wrap every legitimate RTMP ingest in 2026.

## Visual cues for image generation

- An exploded view of one RTMP chunk on the wire — a one-byte basic header showing fmt=0 and chunk-stream-id=6, the eleven-byte type-0 message header (timestamp, length, type, message-stream-id in little-endian), an optional four-byte extended timestamp, and the payload. Annotations call out the little-endian outlier in a sea of big-endian fields.
- A side-by-side cartoon of the RTMP six-message handshake — C0 a single byte, C1 a 1536-byte block of timestamp plus random, then S0 plus S1 plus S2 from the server, then C2. Total bytes counted at the bottom — 3073 each way.
- A diagram of the canonical 2026 live-streaming pipeline — OBS pushing RTMPS at 1080p60 to an edge ingest box, the edge relaying to an origin, transcode produces 1080p / 720p / 480p HLS renditions, a CDN fan-out delivers to phones and TVs. Ingest path labelled "first mile, RTMP since 2002", delivery path labelled "last mile, HLS since 2009".
- A timeline labelled "thirty years of RTMP" — November 1999 Tin Can codename, July 2002 Flash Communication Server MX 1.0, December 2005 Adobe acquires Macromedia, May 2009 Adobe DMCAs rtmpdump, December 2012 spec PDF published, December 2020 Flash EOL, May 2019 Facebook forces RTMPS, March 2025 WHIP becomes RFC 9725, January 2026 Enhanced RTMP v2 release.
- A latency-ladder bar chart — WebRTC at 100 to 400 ms at the top, Red5 Pro tuned RTMP at sub-250 ms, SRS RTMP at 0.8 to 3 s, Mux RTMP at 2 to 5 s, LL-HLS at 2 to 5 s, standard HLS at 15 to 30 s. Each bar labelled with the source measurement.
- An OBS Studio screenshot mock-up — the Stream settings panel, Service set to "Custom", Server filled with `rtmps://live-api-s.facebook.com:443/rtmp/`, Stream Key redacted. Below it, a terminal window showing the equivalent ffmpeg command with `-f flv`.

## Sources

### Specifications and RFCs

- [Adobe RTMP 1.0 Specification (final, 21 December 2012)](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)
- [Adobe RTMP 1.0 Specification — HTML republication (Veriskope, January 2019)](https://rtmp.veriskope.com/docs/spec/)
- [Enhanced RTMP v2 Release (Veovera, v2-2026-01-31-r2) — PDF](https://veovera.org/docs/enhanced/enhanced-rtmp-v2.pdf)
- [Enhanced RTMP v2 — Markdown source on GitHub](https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md)
- [Adobe AMF0 file format specification](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf)
- [Adobe AMF3 file format specification](https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf)
- [Adobe FLV / F4V Video File Format Specification v10.1](https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf)
- [RFC 9725 — WebRTC-HTTP Ingestion Protocol (WHIP), March 2025](https://www.rfc-editor.org/rfc/rfc9725.html)
- [RFC 7016 — RTMFP, November 2013](https://www.rfc-editor.org/rfc/rfc7016.html)
- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 8216 — HTTP Live Streaming](https://datatracker.ietf.org/doc/html/rfc8216)
- [RFC 3550 — Real-time Transport Protocol](https://www.rfc-editor.org/rfc/rfc3550)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [WISH Working Group (produced WHIP)](https://datatracker.ietf.org/wg/wish/about/)
- [MoQ Working Group](https://datatracker.ietf.org/wg/moq/about/)

### Papers and standards organisations

- [IANA service-names-port-numbers registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)
- [ITU-T H.264 (AVC)](https://www.itu.int/rec/T-REC-H.264)
- [ISO/IEC 14496-3 (AAC)](https://www.iso.org/standard/43345.html)
- [ISO/IEC 23009-1 (MPEG-DASH)](https://www.iso.org/standard/79329.html)
- [ISO/IEC 23000-19 (CMAF)](https://www.iso.org/standard/79106.html)
- [W3C WebRTC Recommendation, March 2025](https://www.w3.org/TR/2025/REC-webrtc-20250313/)

### Vendor and engineering blogs

- [Mux — "Which live stream ingest protocol is right for you?"](https://www.mux.com/blog/which-live-stream-ingest-protocol-is-right-for-you)
- [Mux — RTMP streaming protocol guide](https://www.mux.com/articles/rtmp-streaming-protocol)
- [Mux — Live streaming FAQs](https://www.mux.com/docs/guides/live-streaming-faqs)
- [Mux — Reduce live stream latency](https://www.mux.com/docs/guides/reduce-live-stream-latency)
- [Cloudflare — MoQ: refactoring the internet's real-time media stack](https://blog.cloudflare.com/moq/)
- [Cloudflare Stream changelog](https://developers.cloudflare.com/stream/changelog/)
- [Cloudflare Realtime developer docs](https://developers.cloudflare.com/moq/)
- [WebRTCHacks — WebRTC cracks the WHIP on OBS](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)
- [Ant Media — Video Streaming Protocols, 2026 update](https://antmedia.io/streaming-protocols/)
- [Castr — A complete history of RTMP](https://castr.com/blog/history-of-rtmp-protocol/)
- [Castr — Video streaming protocols you need to know](https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/)
- [Dacast — What is RTMP? 2026 guide](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/)
- [Dacast — HLS streaming protocol](https://www.dacast.com/blog/hls-streaming-protocol/)
- [EnterpriseTube — What is RTMP, explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)
- [Flussonic — RTMP protocol commentary](https://flussonic.com/doc/protocols/rtmp-protocol/)
- [Sonnati — FCS and RTMP, streaming technologies from the future](https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/)
- [SRS LTS — low-latency tuning docs](https://ossrs.net/lts/en-us/docs/v6/doc/low-latency)
- [SRS LTS — real-world use cases](https://ossrs.net/lts/en-us/blog/unlock-the-power-of-srs-real-world-use-cases)
- [Red5 — What is the RTMP streaming protocol?](https://www.red5.net/blog/what-is-rtmp-streaming-protocol/)
- [Veovera Software Organization news feed](https://veovera.org/docs/news/feed.html)
- [Veovera Enhanced RTMP repo](https://github.com/veovera/enhanced-rtmp)
- [Veriskope — RTMP overview](https://rtmp.veriskope.com/docs/overview/)
- [Veriskope — RTMP timeline](https://rtmp.veriskope.com/history/timeline/)
- [Trycatch.dev — Self-hosting a streaming video platform](https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/)
- [DEV Community — RTMPS relay with stunnel](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)
- [DEV Community — How to broadcast a WebRTC stream to Twitch](https://dev.to/dolbyio/how-to-broadcast-a-webrtc-stream-to-twitch-7fa)
- [GetStream — WHIP protocol glossary](https://getstream.io/glossary/whip-protocol/)
- [Yostream — RTMP vs WebRTC latency](https://yostream.io/blog/rtmp-vs-webrtc-latency/)
- [YTStreamer — RTMP streaming](https://ytstreamer.com/rtmp-streaming/)
- [Google — YouTube Live ingestion-protocol comparison](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison)
- [Google — YouTube Live RTMPS ingestion](https://developers.google.com/youtube/v3/live/guides/rtmps-ingestion)
- [Google Support — YouTube RTMPS recommendation](https://support.google.com/youtube/answer/10364924)
- [nanocosmos — Media over QUIC](https://www.nanocosmos.net/blog/media-over-quic-moq/)
- [WINK MoQ implementation analysis 2025](https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php)
- [Medium — MoQ, the protocol that could finally unify streaming](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce)
- [Medium — The latency wars: WHIP and MoQ vs RTMP/SRT](https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee)
- [Mux — Live streaming FAQs (Mux's "RTMP/RTMPS first" position)](https://www.mux.com/docs/guides/live-streaming-faqs)
- [SRT Alliance](https://www.srtalliance.org/)
- [NDI](https://ndi.video/)
- [OBS Studio](https://obsproject.com)
- [FFmpeg](https://ffmpeg.org/)
- [SRS on GitHub](https://github.com/ossrs/srs)
- [nginx-rtmp-module on GitHub](https://github.com/arut/nginx-rtmp-module)
- [nginx-rtmp-module directives wiki](https://github.com/arut/nginx-rtmp-module/wiki/Directives)
- [NGINX Plus dynamic RTMP module](https://docs.nginx.com/nginx/admin-guide/dynamic-modules/rtmp/)
- [rtmpdump mirror (mstorsjo)](https://github.com/mstorsjo/rtmpdump)
- [rtmpdump handshake.h on ShiftMediaProject](https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h)
- [Wireshark RTMPT wiki](https://wiki.wireshark.org/RTMPT)
- [Wireshark RTMPT dissector source](https://github.com/boundary/wireshark/blob/master/epan/dissectors/packet-rtmpt.c)
- [Wireshark issue 17813 — RTMPT dissector infinite loop](https://gitlab.com/wireshark/wireshark/-/issues/17813)
- [ngrok — TCP tunnels](https://ngrok.com/docs/network-edge/domains-and-tcp-addresses/)
- [Beej's guide to network programming](https://beej.us/guide/bgnet/)
- [Cloudflare — What is the OSI model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)

### News, legal and historical

- [Slashdot — Adobe Uses DMCA On Protocol It Promised To Open, May 2009](https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open)
- [The H Open — Adobe acts against Flash video stream recorder](http://www.h-online.com/security/news/item/Adobe-acts-against-Flash-video-stream-recorder-741729.html)
- [ossguy — analysis of the Adobe DMCA action](https://ossguy.com/?p=398)
- [Courthouse News — Adobe v. Wowza](https://www.courthousenews.com/adobe-v-wowza/)
- [EFF — RealNetworks v. DVD CCA (RealDVD case)](https://www.eff.org/cases/realnetworks-v-dvd-cca-realdvd-case)
- [Adobe forum — extended timestamp on type-3 chunk thread](https://community.adobe.com/t5/media-server-discussions/question-about-rtmp-specification/td-p/2390245)
- [Adobe forum — AVC/AAC sequence header thread 685734](https://forums.adobe.com/thread/685734)
- [c-rtmp-server group — digest handshake report](https://groups.google.com/g/c-rtmp-server/c/s2Eu51D2tQ0)
- [Sean DuBois on Twitch's experimental WHIP endpoint, LinkedIn](https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW)
- [SpeedGuide — port 1935 entry](https://www.speedguide.net/port.php?port=1935)
- [Twitch dev status](https://devstatus.twitch.tv/)
- [Demuxed podcast](https://www.heavybit.com/library/podcasts/demuxed)
- [Demuxed Episode 13 — Sarah Allen of Veriskope](https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope)
- [Demuxed 2019 conference](https://2019.demuxed.com/)
- [Demuxed 2022 conference](https://2022.demuxed.com/)
- [Flylib — Macromedia Flash Communication Server MX book mirror](https://flylib.com/books/en/3.347.1.13/1/)
- [IETF announcement of RFC 9725](https://mailarchive.ietf.org/arch/msg/ietf-announce/Sup40IdnWf0FlCcU5ApxFQfEfLA/)
- [Veovera Enhanced RTMP discussion 26](https://github.com/veovera/enhanced-rtmp/discussions/26)

### CVEs

- [CVE-2015-8270 — librtmp AMF3 DoS](https://nvd.nist.gov/vuln/detail/CVE-2015-8270)
- [CVE-2024-7347 — NGINX mp4 module](https://nvd.nist.gov/vuln/detail/CVE-2024-7347)
- [NGINX security advisories](https://nginx.org/en/security_advisories.html)
- [CSDN write-up of CVE-2016-10191 RTMP demuxer overflow](https://blog.csdn.net/axiejundong/article/details/78937126)
- [Zhihu deep-dive on FFmpeg RTMP RCE](https://zhuanlan.zhihu.com/p/29505432)
- [Metasploit module — adobe_flash_rtmp (CVE-2012-0779)](https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/windows/browser/adobe_flash_rtmp.rb)

### Wikipedia

- [Real-Time Messaging Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- [RTMPDump](https://en.wikipedia.org/wiki/RTMPDump)
- [Adobe Media Server](https://en.wikipedia.org/wiki/Adobe_Media_Server)
- [RealNetworks v. DVD CCA](https://en.wikipedia.org/wiki/RealNetworks,_Inc._v._DVD_Copy_Control_Association,_Inc)
- [Macromedia Flash Communication Server MX wiki](https://macromedia.fandom.com/wiki/Macromedia_Flash_Communication_Server_MX)
- [Macromedia Flash Media Server wiki](https://macromedia.fandom.com/wiki/Macromedia_Flash_Media_Server)
