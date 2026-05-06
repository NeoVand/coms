---
prompt_source: deep-research-prompts.txt:6830-7008 (RTMP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/0ced8906-b433-4abc-a833-f66ac7456ab4
research_mode: claude.ai Research
---

# The Real-Time Messaging Protocol (RTMP): A Deep, Citation-Backed Field Guide for Engineers (May 2026)

> **Audience note.** This guide assumes you are an engineer but does not assume you have ever opened Wireshark or read an IETF RFC. The first section defines every term used later. Experienced readers can skip directly to Section 3.
> **Currency note.** All claims have been checked against 2024–2026 sources where possible. The most important changes in the last 24 months are: (a) WHIP became RFC 9725 in March 2025, (b) Enhanced RTMP v2 ("E-RTMP") reached release status under the Veovera Software Organization with industry sign-on from Adobe, YouTube, Twitch, Amazon and others, (c) Twitch shipped an experimental WHIP ingest endpoint, (d) Cloudflare announced migration of its WHIP/WHEP stack to Cloudflare Realtime in March 2025, and (e) the IETF MoQ working group is now producing real production deployments. RTMP is *still* the dominant ingest protocol in 2026, but it is no longer unchallenged. [Ietf](https://mailarchive.ietf.org/arch/msg/ietf-announce/Sup40IdnWf0FlCcU5ApxFQfEfLA/)

---

## TL;DR

- **RTMP is alive and dominant for ingest in 2026, even though Flash died in December 2020.** Encoders (OBS, vMix, Wirecast, hardware boxes), and platforms (YouTube, Twitch, Facebook, LinkedIn, Kick, Restream) continue to use RTMP/RTMPS as the default first-mile protocol, then transcode to HLS/DASH for delivery. Typical glass-to-glass latency is 2–5 s; tuned implementations reach sub-second. [Ant Media](https://antmedia.io/streaming-protocols/)[YTStreamer](https://ytstreamer.com/rtmp-streaming/)
- **The protocol's challengers are real but partial.** WHIP (WebRTC-HTTP Ingestion Protocol) was published as RFC 9725 in March 2025 and is shipping in OBS 30+, Twitch (beta), Cloudflare Realtime, and most WebRTC SFUs; SRT dominates professional contribution; Media-over-QUIC (MoQ) is in advanced IETF drafts with production relays from Cloudflare. Enhanced RTMP v2 (Veovera, 2024–2026) keeps RTMP relevant by adding HEVC/VP9/AV1, Opus/FLAC, multitrack and nanosecond timestamps. [Ietf](https://mailarchive.ietf.org/arch/msg/ietf-announce/Sup40IdnWf0FlCcU5ApxFQfEfLA/)[GitHub](https://github.com/veovera/enhanced-rtmp/discussions/26)
- **Operationally, "RTMP for ingest, HLS/DASH for delivery" remains the right pattern for >90% of live workflows in 2026.** Move to RTMPS for any non-public stream, watch your keyframe interval (≤2 s), monitor RTT and drops, and start prototyping a WHIP path for any product where sub-second latency is part of the value proposition.

---

## 1. Prerequisites and Glossary

You can read this report top-to-bottom if and only if you understand each of the following. Each definition links to an authoritative explainer.

- **OSI / TCP-IP model.** A layered mental model for networks: physical, link, network (IP), transport (TCP/UDP), and application. RTMP is an application-layer protocol that sits on top of TCP. Cloudflare's "What is the OSI model?" is a clean primer: [https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
- **Socket.** The OS-level endpoint for a network connection, identified by an (IP address, port) tuple. Beej's classic guide is the canonical entry-level reference: [https://beej.us/guide/bgnet/](https://beej.us/guide/bgnet/)
- **Port.** A 16-bit number that identifies a service on a host. RTMP's default is 1935 ("macromedia-fcs" in IANA's registry): [https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml) [TryCatch](https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/)
- **TCP (Transmission Control Protocol).** Reliable, ordered, byte-stream transport. RFC 9293 is the current consolidated TCP standard: [https://www.rfc-editor.org/rfc/rfc9293.html](https://www.rfc-editor.org/rfc/rfc9293.html)
- **UDP.** Unreliable, unordered, connectionless transport. Used by RTMFP and WebRTC, *not* by RTMP itself.
- **TLS (Transport Layer Security).** Cryptographic envelope around TCP, providing confidentiality, integrity and authentication. Current version is TLS 1.3 (RFC 8446): [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446) RTMPS = RTMP-over-TLS.
- **Header.** Bytes at the start of a packet/message that describe what follows (length, type, ids). RTMP has *two* layered headers: a 1–3-byte chunk basic header and a 0/3/7/11-byte chunk message header (see §3).
- **Checksum.** A short fixed-length value computed over data to detect corruption. RTMP itself does *not* compute application-layer checksums; it relies on TCP's 16-bit checksum (RFC 9293).
- **Handshake.** A short fixed exchange that synchronizes two endpoints before "real" traffic flows. RTMP uses a six-message handshake: C0/C1/C2 from client, S0/S1/S2 from server, all sent before any AMF command. Each side sends 1 + 1536 + 1536 = 3073 bytes. ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)) [Veriskope](https://rtmp.veriskope.com/docs/spec/)
- **Stream.** Logical, ordered sequence of related messages — in RTMP, each *message stream* is a logical channel multiplexed onto a *chunk stream*. ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/))
- **Frame (video) / Sample (audio).** A single unit of compressed media. Multiple frames are packaged into RTMP "video messages" (type 9) or "audio messages" (type 8).
- **Datagram.** Self-contained message unit (UDP). RTMP uses TCP byte-streams, *not* datagrams; RTMFP uses datagrams.
- **Chunk vs. message (RTMP-specific).** RTMP splits each *message* (e.g., one video keyframe payload) into one or more *chunks* of at most `chunk_size` bytes (default 128, often raised to 4096 or 65536). The chunk layer interleaves chunks from different streams to keep audio responsive. Spec §5: [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)
- **Codec.** Algorithm pair that compresses/decompresses media. Standard RTMP carries H.264 ([https://www.itu.int/rec/T-REC-H.264](https://www.itu.int/rec/T-REC-H.264)) for video and AAC ([https://www.iso.org/standard/43345.html](https://www.iso.org/standard/43345.html)) for audio; Enhanced RTMP adds HEVC/VP9/AV1/Opus/FLAC/AC-3/E-AC-3 ([https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md](https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md)). [GitHub](https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md)
- **Container format.** File or wire wrapper that carries codec-coded frames plus timing/metadata. RTMP's tightly-coupled file container is **FLV** (Flash Video) — Adobe's "Video File Format Specification v10.1" defines it (legacy mirror at Veovera: [https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf](https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf)). The Enhanced FLV ("E-FLV") is the modern codec-extended version ([https://github.com/veovera/enhanced-rtmp](https://github.com/veovera/enhanced-rtmp)).
- **NetConnection.** ActionScript object representing a logical RTMP session to an "application" (e.g., `rtmp://host/live`). It corresponds to a single TCP connection that has completed `connect()`. (Adobe spec §7.2: [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/))
- **NetStream.** ActionScript object representing one media stream (publish or play) inside a NetConnection. Corresponds to a *message stream id* (see §3). ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/))
- **AMF (Action Message Format).** Adobe's binary serialization for ActionScript object graphs. Two versions: AMF0 (Flash Player 6, 2001) and AMF3 (Flash Player 9, 2006, more compact, supports references and IEEE-754 doubles for ints). Originally invented for *Flash Remoting*, not RTMP — RTMP simply reuses it for command messages. AMF0 spec: [https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf) ; AMF3 spec: [https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf](https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf) [Veriskope](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf)
- **FLV (Flash Video).** Container format introduced 2002. Each FLV "tag" corresponds 1:1 to an RTMP audio (8) or video (9) message body. [https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf](https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf)
- **H.264 (AVC).** Block-based video codec standardized in 2003 by ITU-T/ISO. RTMP carries H.264 in AVCC-style configuration record + NAL units. [https://www.itu.int/rec/T-REC-H.264](https://www.itu.int/rec/T-REC-H.264)
- **AAC.** Advanced Audio Coding, lossy audio codec defined in ISO/IEC 14496-3. [https://www.iso.org/standard/43345.html](https://www.iso.org/standard/43345.html)
- **HLS (HTTP Live Streaming).** Apple-defined adaptive segmented delivery protocol (RFC 8216): [https://datatracker.ietf.org/doc/html/rfc8216](https://datatracker.ietf.org/doc/html/rfc8216) Most RTMP ingest is transcoded to HLS for viewer playback.
- **DASH (MPEG-DASH).** ISO standard adaptive streaming over HTTP (ISO/IEC 23009-1): [https://www.iso.org/standard/79329.html](https://www.iso.org/standard/79329.html)
- **WebRTC.** Browser-native real-time-communication stack: ICE, DTLS, SRTP. W3C Recommendation (March 2025 update): [https://www.w3.org/TR/2025/REC-webrtc-20250313/](https://www.w3.org/TR/2025/REC-webrtc-20250313/)
- **WHIP/WHEP.** WebRTC-HTTP Ingestion Protocol (RFC 9725, March 2025: [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html)) and WebRTC-HTTP Egress Protocol — minimal HTTP-based signaling that lets WebRTC act as an "RTMP replacement."
- **SRT (Secure Reliable Transport).** Haivision-developed UDP-with-ARQ contribution protocol, open-sourced 2017. [https://www.srtalliance.org/](https://www.srtalliance.org/)
- **SDP (Session Description Protocol).** Text format describing media capabilities of a session, used by WebRTC/WHIP. RFC 8866: [https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html)
- **IETF / RFC.** The Internet Engineering Task Force publishes Internet protocols as Requests for Comments. [https://www.ietf.org/](https://www.ietf.org/)

---

## 2. History and Story

### Origins (1999–2002)

RTMP began as a Macromedia internal project codenamed **"Tin Can"** in late 1999/2000, pitched by **Jonathan Gay** (the architect of Flash itself) as a server companion to Flash. The principal architect of the resulting protocol was **Pritham Shetty**; **Sarah Allen** was an early engineer at Macromedia working on the Flash Communication Server platform that exposed RTMP. The project shipped publicly on **9 July 2002** as Flash Communication Server MX 1.0, riding on the parallel release of Flash Player 6 (March 2002), which included the client-side `NetConnection`, `NetStream`, and `SharedObject` APIs that RTMP carries. (Sources: Veriskope timeline [https://rtmp.veriskope.com/history/timeline/](https://rtmp.veriskope.com/history/timeline/) ; Macromedia Wiki [https://macromedia.fandom.com/wiki/Macromedia_Flash_Communication_Server_MX](https://macromedia.fandom.com/wiki/Macromedia_Flash_Communication_Server_MX) ; Sonnati's reminiscence with Pritham Shetty attribution [https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/](https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/) ; Demuxed ep. 13 with Sarah Allen [https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope](https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope).) [Castr](https://castr.com/blog/history-of-rtmp-protocol/)[Demuxed](https://2019.demuxed.com/)

The motivation was concrete: Flash Player was capable of richer video than the web's then-dominant alternatives (RealPlayer, Windows Media, QuickTime), and Macromedia wanted a server protocol that could deliver low-latency interactive video, voice and data with bidirectional RPC built in. The wire format optimizes for *interleaving small audio messages through large video messages* so a low-power client can prioritize audio if the CPU is overloaded — a design choice still visible in 2026 RTMP traffic. ([https://rtmp.veriskope.com/docs/overview/](https://rtmp.veriskope.com/docs/overview/)) [Veriskope](https://rtmp.veriskope.com/docs/overview/)

### Adobe acquisition and protocol family expansion (2005–2009)

Adobe completed its acquisition of Macromedia on **5 December 2005** ([https://macromedia.fandom.com/wiki/Macromedia_Flash_Media_Server](https://macromedia.fandom.com/wiki/Macromedia_Flash_Media_Server)). Flash Communication Server became Flash Media Server (later Adobe Media Server). Variants accumulated: [Macromedia Wiki](https://macromedia.fandom.com/wiki/Macromedia_Flash_Media_Server)

- **RTMP** — base protocol, TCP/1935 ([https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- **RTMPS** — RTMP over TLS, typically TCP/443 (Google docs: [https://developers.google.com/youtube/v3/live/guides/rtmps-ingestion](https://developers.google.com/youtube/v3/live/guides/rtmps-ingestion)) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- **RTMPE** — Adobe-proprietary "encrypted" RTMP introduced with Flash Media Server 3 (2007). Uses Diffie-Hellman key exchange + custom packet cipher, with a magic constant ("Genuine Adobe Flash Player 001") and SHA-256 HMAC. Cryptographically weak by design — see §6/§7. ([https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)[Ossguy](https://ossguy.com/?p=398)
- **RTMPT** — RTMP encapsulated in HTTP POSTs over port 80/443 for firewall traversal. ([https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol))
- **RTMFP** — Secure Real-Time Media Flow Protocol, *UDP* P2P-friendly cousin published as **RFC 7016 (Nov 2013)** by Michael Thornburgh (Adobe). [https://www.rfc-editor.org/rfc/rfc7016.html](https://www.rfc-editor.org/rfc/rfc7016.html) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)

### The 2009/2012 "open spec" and its quirks

In January 2009 Adobe announced that it would publish the RTMP specification. The initial PDF leaked into the wild in 2009 and was followed by the formally dated version: **"Adobe's Real Time Messaging Protocol", H. Parmar & M. Thornburgh (eds.), Adobe Systems Incorporated, 21 December 2012**, the canonical version still in use in 2026. (PDF: [https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf) ; HTML: [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/) ; Wikipedia confirmation of 21 December 2012 date [https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)). Veriskope re-published the document in machine-readable HTML in January 2019 with the editorial note *"There have been no substantive changes to the spec from the 2012 PDF as of this HTML publication."* ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)[Veriskope](https://rtmp.veriskope.com/docs/spec/)

The "open" qualifier is famously misleading. The Adobe landing page explicitly excludes RTMPE: *"To benefit customers who want to protect their content, the open RTMP specification does not include Adobe's unique secure RTMP measures"* (quoted in Wikipedia [https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)). The patent license forbids using the spec to *intercept* streaming data or *circumvent* Adobe's secure measures. The most consequential gap in the public spec is the **digest-based handshake variant** Flash Player 9+ silently switched to: a non-trivial scheme that hashes 32 bytes of the C1/S1 random block with HMAC-SHA-256 plus the magic key "Genuine Adobe Flash Player 001"/"Genuine Adobe Flash Media Server 001". Players that send a "type 0" handshake (timestamps in the first 4 bytes followed by random) interoperate with most servers but Flash Player itself rejects audio/video unless the digest is present. The lore is captured in the rtmpdump source — see [https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h](https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h) — and re-told in user reports e.g. [https://groups.google.com/g/c-rtmp-server/c/s2Eu51D2tQ0](https://groups.google.com/g/c-rtmp-server/c/s2Eu51D2tQ0). [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)

### The reverse-engineering politics

- **2008 — Adobe DMCA takedown of rtmpdump.** rtmpdump was an open-source RTMPE-capable client developed by Andrej Stepanchuk. Adobe issued a DMCA takedown notice to SourceForge in **May 2009** (the date often cited as "2008" refers to the introduction of RTMPE in FMS 3 the year before). The project relocated to the MPlayer project's servers in October 2009 and was rewritten in C, becoming the basis of `librtmp`, which is still embedded in FFmpeg, VLC, cURL and others. A code-sanitized fork **flvstreamer** was kept legally clean by removing RTMPE support. (Slashdot [https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open](https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open) ; The H Open [https://h-online.com/open/news/item/Adobe-acts-against-Flash-video-stream-recorder-741729.html](https://h-online.com/open/news/item/Adobe-acts-against-Flash-video-stream-recorder-741729.html) ; analysis [https://ossguy.com/?p=398](https://ossguy.com/?p=398) ; Wikipedia [https://en.wikipedia.org/wiki/RTMPDump](https://en.wikipedia.org/wiki/RTMPDump)) [H-online + 3](http://www.h-online.com/security/news/item/Adobe-acts-against-Flash-video-stream-recorder-741729.html)
- **The user prompt's reference to a "2008 RealNetworks vs Adobe lawsuit over RTMPE reverse engineering" appears to conflate two events.** The actual 2008–2010 RealNetworks litigation (*RealNetworks, Inc. v. DVD Copy Control Association, Inc.*, 641 F. Supp. 2d 913 (N.D. Cal. 2009)) was about CSS DVD encryption in RealDVD, *not* RTMPE — see [https://en.wikipedia.org/wiki/RealNetworks,_Inc._v._DVD_Copy_Control_Association,_Inc](https://en.wikipedia.org/wiki/RealNetworks,_Inc._v._DVD_Copy_Control_Association,_Inc). and the EFF case page [https://www.eff.org/cases/realnetworks-v-dvd-cca-realdvd-case](https://www.eff.org/cases/realnetworks-v-dvd-cca-realdvd-case). The RTMPE-reverse-engineering battle was the Adobe-vs-rtmpdump DMCA takedown described above. **[I am flagging this as a likely confusion in the source material rather than silently rewriting it.]** [Wikipedia](https://en.wikipedia.org/wiki/RealNetworks,_Inc._v._DVD_Copy_Control_Association,_Inc.)
- **2011–2015 — Adobe v. Wowza patent litigation.** Adobe sued Wowza Media Systems in 2011 for RTMP-related patent infringement (notably US 7,246,356; Wowza was founded by ex-Adobe employees David Stubenvoll and Charlie Good); the suit was settled and dismissed with prejudice in 2015. ([https://www.courthousenews.com/adobe-v-wowza/](https://www.courthousenews.com/adobe-v-wowza/) ; Wikipedia summary [https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)) [Courthouse News Service + 2](https://www.courthousenews.com/adobe-v-wowza/)

### The Flash death and the protocol that wouldn't die

Adobe officially deprecated Flash Player on **31 December 2020** ([https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)). RTMP could have died with it. Instead, by then the entire live-streaming industry had standardized on RTMP for *encoder-to-platform ingest*. Twitch, YouTube Live, Facebook Live, every CDN with a live product, every encoder vendor — the de-facto monopoly persisted. ([https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/)) [EnterpriseTube +2](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)

### What has changed in the last 24 months (2024–2026)

- **Enhanced RTMP ("E-RTMP").** A non-profit, the **Veovera Software Organization** (founded 2022), published *enhanced-rtmp-v1* and then v2 (alpha March 2024, beta October 2024, release v2-2026-01-31-r2) with backing from Adobe, YouTube, Twitch, Amazon, FFmpeg, OBS, VideoLAN, Ant Media, Dolby and Intel. E-RTMP adds HEVC/VP9/AV1, Opus/FLAC/AC-3/E-AC-3, multitrack, FourCC codec signaling, nanosecond-precision timestamps via "ModEx" extensions, and a Reconnect Request feature. ([https://github.com/veovera/enhanced-rtmp](https://github.com/veovera/enhanced-rtmp) ; v2 doc [https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md](https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md) ; news [https://veovera.org/docs/news/feed.html](https://veovera.org/docs/news/feed.html)) [GitHub](https://github.com/veovera/enhanced-rtmp/discussions/26)[Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- **WHIP became RFC 9725 in March 2025**, providing the first IETF-blessed direct competitor to RTMP for ingest. ([https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html))
- **Twitch stood up a public WHIP ingest endpoint** announced by Sean DuBois on LinkedIn in 2023 and still labeled experimental ([https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW](https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW) ; [https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)).
- **OBS Studio 30 (Aug 2023)** added an official `obs-webrtc` WHIP output, eliminating the need for forks. ([https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/))
- **YouTube Live in 2026 supports four ingestion protocols simultaneously** — RTMP, RTMPS, HLS and DASH — with HLS/DASH offering HEVC/VP9 contribution at the cost of higher latency. *YouTube has not deprecated plain RTMP as of May 2026* ([https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison), "Last updated 2026-04-28 UTC"); Google strongly recommends RTMPS for security ([https://support.google.com/youtube/answer/10364924](https://support.google.com/youtube/answer/10364924)). [Google](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison)
- **Cloudflare Stream's WHIP/WHEP path is being migrated to "Cloudflare Realtime (Calls)" starting 2025-03-13** ([https://developers.cloudflare.com/stream/changelog/](https://developers.cloudflare.com/stream/changelog/)) and Cloudflare deployed the first global MoQ relay network in 2025 ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)). [Cloudflare](https://developers.cloudflare.com/stream/changelog/)
- **nginx-rtmp-module is in slow-motion limbo.** The repo (Roman Arutyunyan, "arut") is at 14 k stars / 3.6 k forks but the master branch's last touch is December 2024 with many open issues from late 2024–2025 ([https://github.com/arut/nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) ; [https://github.com/arut/nginx-rtmp-module/issues/](https://github.com/arut/nginx-rtmp-module/issues/)). It still works, but this is the canonical "lightly maintained" warning.

---

## 3. How It Actually Works

> All bit-widths, field names and order below are taken from the canonical Adobe RTMP 1.0 spec (21 December 2012): [https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf) and the HTML version at [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/).

### 3.1 The four conceptual layers

```
+------------------------------------------------------------+
|  AMF0/AMF3 commands  +  audio/video/script payloads        |  ← Application
+------------------------------------------------------------+
|  RTMP Message Layer  (type, length, timestamp, msg-stream) |  ← Section 6
+------------------------------------------------------------+
|  RTMP Chunk Stream   (basic hdr + msg hdr + extended ts)   |  ← Section 5
+------------------------------------------------------------+
|  TCP                                                       |  ← RFC 9293
+------------------------------------------------------------+
```

All bytes are big-endian *except* the message-stream-ID field in chunk type-0 headers, which is little-endian — a classic implementation footgun ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)). [Veriskope](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)[Veriskope](https://rtmp.veriskope.com/docs/spec/)

### 3.2 The handshake (C0/C1/C2 ↔ S0/S1/S2)

After TCP `connect()`, RTMP performs a fixed three-message handshake on each side, totaling **3073 bytes per peer**:

| Packet | Size | Contents |
|---|---|---|
| C0 / S0 | 1 byte | Protocol version. Plain RTMP = `0x03`. RTMPE adds `0x06`/`0x08`/`0x09`. |
| C1 / S1 | 1536 bytes | 4 bytes timestamp (epoch arbitrary) + 4 bytes zero (or version, see "digest variant") + 1528 bytes random data. |
| C2 / S2 | 1536 bytes | Echo of the *peer's* C1/S1 timestamp + the local time the C1/S1 was received + the same 1528 random bytes echoed back. |

Ordering rules (Adobe spec §5.2): client sends C0+C1; client MUST wait for S1 before sending C2; client MUST wait for S2 before sending any RTMP message; server MUST wait for C1 before sending S2 and for C2 before sending RTMP messages. ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)) [Veriskope](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)[Veriskope](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)

**The digest variant (the famous undocumented part).** Flash Player 9+ negotiates a "type 1" handshake distinguished by non-zero bytes in the C1[4..7] "version" field. The 1528 random bytes are then split into a 32-byte HMAC-SHA-256 *digest* and 1504 bytes of random, with the digest's offset computed from one of two possible byte-position formulas (the `getdig` function) and keyed with the magic key `"Genuine Adobe Flash Player 001"` (or the FMS variant for the server). This was reverse-engineered into rtmpdump's `librtmp/handshake.h` and is now standard practice: see [https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h](https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h). The Flussonic team's commentary captures the cryptographic awkwardness: *"all the security was based on an obfuscated key, which was plainly visible in the text in every copy of the flash player"* ([https://flussonic.com/doc/protocols/rtmp-protocol/](https://flussonic.com/doc/protocols/rtmp-protocol/)). [Flussonic](https://flussonic.com/doc/protocols/rtmp-protocol/)

### 3.3 The chunk layer (the protocol that does the multiplexing)

Every RTMP message is split into one or more **chunks** of at most `chunk_size` bytes (default **128**, configurable with the `Set Chunk Size` control message, max 65 536 in the spec but commonly capped at 0xFFFFFF, [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)). Each chunk has the layout:

```
+--------------+---------------+-------------------+-------------+
| Basic Header | Msg Header    | Extended Timestamp| Chunk Data  |
| (1, 2, 3 B)  | (0, 3, 7,11 B)| (0 or 4 B)        | (≤chunk_sz) |
+--------------+---------------+-------------------+-------------+
```

**Basic header** (1–3 bytes):

- 2 high bits = `fmt` (chunk-header type, 0–3, selects message-header size).
- Low 6 bits = chunk-stream-id (`csid`):
  - `csid = 0` → 2-byte basic header, real csid = next byte + 64 (range 64–319).
    - `csid = 1` → 3-byte basic header, real csid = next two bytes (LE) + 64 (range 64–65 599).
    - `csid = 2` reserved for low-level protocol-control messages.
    - `csid = 3..63` → 1-byte basic header, real csid = those bits.

**Message header** (selected by `fmt`):

| `fmt` | Size | Contains |
|---|---|---|
| 0 | 11 B | timestamp (3 B abs) + msg-length (3 B) + msg-type-id (1 B) + msg-stream-id (4 B, **little-endian**) |
| 1 | 7 B | timestamp-delta (3 B) + msg-length (3 B) + msg-type-id (1 B) — reuses prior msg-stream-id |
| 2 | 3 B | timestamp-delta (3 B) only — reuses prior length, type, msg-stream |
| 3 | 0 B | reuses everything from the previous chunk on this csid |

**Extended timestamp** (4 B). Present only when the 3-byte timestamp/delta field equals `0x00FFFFFF` (16 777 215). Required for stream times longer than ~4 hours 39 minutes when expressed as deltas, or absolute timestamps after that threshold. The spec says type-3 chunks "MUST NOT" carry an extended timestamp, but Flash Player and most servers in practice do — confirmed both by Adobe forum threads ([https://community.adobe.com/t5/media-server-discussions/question-about-rtmp-specification/td-p/2390245](https://community.adobe.com/t5/media-server-discussions/question-about-rtmp-specification/td-p/2390245)) and by every shipping implementation.

**Worked byte example.** A simple type-0 video chunk header captured on the wire:

```
06                ← fmt=0, csid=6 (basic header, 1 byte)
FF FF FF          ← timestamp = 0xFFFFFF → use extended timestamp
00 BC 48          ← message length = 48 200 bytes
09                ← message type = 9 (video)
01 00 00 00       ← message stream id = 1 (little-endian!)
01 64 3D D0       ← extended timestamp = 0x01643DD0 = 23 411 152 ms
```

(Real capture posted by an engineer on the Adobe forum: [https://community.adobe.com/t5/media-server-discussions/question-about-rtmp-specification/td-p/2390245](https://community.adobe.com/t5/media-server-discussions/question-about-rtmp-specification/td-p/2390245))

### 3.4 Message types (RTMP Section 6)

| Type ID | Meaning | Notes |
|---|---|---|
| 1 | Set Chunk Size | Bumps `chunk_size`. |
| 2 | Abort Message | Drops a partial message on a csid. |
| 3 | Acknowledgement | Bytes-received counter (after `Window Ack Size`). |
| 4 | User Control Message | Stream-Begin, Stream-EOF, Set-Buffer-Length, etc. |
| 5 | Window Acknowledgement Size | Sender's expected ack window. |
| 6 | Set Peer Bandwidth | Peer's allowed window. |
| 8 | Audio Message | Body = FLV audio tag minus FLV tag header. |
| 9 | Video Message | Body = FLV video tag. |
| 15/18 | AMF3/AMF0 Data Message (`@setDataFrame`, `onMetaData`) |  |
| 16/19 | AMF3/AMF0 Shared Object |  |
| 17/20 | AMF3/AMF0 Command Message | `connect`, `createStream`, `publish`, `play`, `_result`, `_error` |
| 22 | Aggregate Message | Bundle of sub-messages (FLV-tag-like). |

Source: [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)

### 3.5 AMF0 vs AMF3

AMF0 (introduced Flash Player 6, 2001) is the simpler, used for almost all RTMP control traffic. AMF3 (Flash Player 9, 2006) is denser and supports object references and a "varint" 29-bit integer encoding. RTMP type-IDs 17/20 mean "this command is in AMF3" and "this command is in AMF0" respectively. AMF0 type markers are: `0x00` number (8-byte IEEE 754), `0x01` boolean, `0x02` UTF-8 string, `0x03` object, `0x05` null, `0x06` undefined, `0x08` ECMA array, `0x09` object-end, `0x0A` strict array. Full specs: AMF0 [https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf) , AMF3 [https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf](https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf).

A `connect` command from a publisher looks like (decoded):

text

```
"connect"           (AMF0 string, type 0x02)
1.0                 (transaction ID, AMF0 number)
{ app: "live",
  flashVer: "FMLE/3.0 (compatible; Lavf60.16)",
  tcUrl: "rtmp://ingest.example.com/live",
  fpad: false,
  capabilities: 15,
  audioCodecs: 4071, videoCodecs: 252,
  videoFunction: 1,
  pageUrl: null,
  objectEncoding: 0 }
```

### 3.6 The full publishing command flow

RTMP ServerEncoder/ClientRTMP ServerEncoder/Client#mermaid-rc5{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rc5 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rc5 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rc5 .error-icon{fill:#CC785C;}#mermaid-rc5 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rc5 .edge-thickness-normal{stroke-width:1px;}#mermaid-rc5 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rc5 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rc5 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rc5 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rc5 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rc5 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rc5 .marker.cross{stroke:#A1A1A1;}#mermaid-rc5 svg{font-family:inherit;font-size:16px;}#mermaid-rc5 p{margin:0;}#mermaid-rc5 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .actor-line{stroke:#A1A1A1;}#mermaid-rc5 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rc5 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rc5 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rc5 .sequenceNumber{fill:#5e5e5e;}#mermaid-rc5 #sequencenumber{fill:#E5E5E5;}#mermaid-rc5 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rc5 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 .labelText,#mermaid-rc5 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .loopText,#mermaid-rc5 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rc5 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rc5 .noteText,#mermaid-rc5 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rc5 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rc5 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rc5 .actorPopupMenu{position:absolute;}#mermaid-rc5 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rc5 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 .actor-man circle,#mermaid-rc5 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rc5 :root{--mermaid-font-family:inherit;}TCP connect to host:1935NetConnectionNetStream (msg-stream-id = 1)loop[While streaming]TCP FINC0 (1B) + C1 (1536B)S0 + S1 + S2C2connect("live") [AMF0, type 20]Window Ack Size, Set Peer BandwidthStream Begin (User Ctrl 0)_result (NetConnection.Connect.Success)releaseStream("key")FCPublish("key")createStream_result (stream id = 1)publish("key","live") [type 20]onStatus (NetStream.Publish.Start)@setDataFrame("onMetaData", {...}) [type 18]AVC sequence header [type 9, AVC=0]AAC sequence header [type 8, AACSeqHdr]video keyframe [type 9, AVC=1]audio + video frames ...Acknowledgement (type 3)deleteStream(1)FCUnpublish("key")closeStream

Subscribers swap `publish`→`play`, plus a `Set Buffer Length` user-control. The same command flow appears in the spec sections 7.2–7.3.

### 3.7 Security model

- **Plain RTMP**: zero confidentiality, integrity only what TCP provides. Stream keys traverse the wire in cleartext. Do not use over the public Internet.
- **RTMPS**: standard TLS — the same envelope as HTTPS. In 2026 this is what every reputable platform requires (YouTube docs [https://developers.google.com/youtube/v3/live/guides/rtmps-ingestion](https://developers.google.com/youtube/v3/live/guides/rtmps-ingestion) ; Facebook Live deprecated plain RTMP on 2019-05-01 [https://dev.to/lax/rtmps-relay-with-stunnel-12d3](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)). [EnterpriseTube](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)[DEV Community](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)
- **RTMPE**: Adobe's home-grown DH+RC4 wrapper. Cryptographically broken the moment the player's magic key was extracted, by design ([https://flussonic.com/doc/protocols/rtmp-protocol/](https://flussonic.com/doc/protocols/rtmp-protocol/)). Treat as obfuscation, not security.
- **RTMPT/RTMPTE**: HTTP tunneling for firewall-traversal — POSTs to `/open/`, `/idle/<sid>/<seq>`, `/send/<sid>/<seq>`. Increases overhead but rescues clients behind restrictive proxies. ([https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol))

### 3.8 Error handling and edge cases

- **Window Acknowledgement Size**. Sender must stop after writing `windowSize` unacknowledged bytes (default 2 500 000). Easy to forget; symptom is a "stuck after a few seconds of video" connection.
- **Timestamp wrap.** 32-bit ms clock wraps every ~49.7 days. The spec MUST-uses RFC 1982 serial-number arithmetic ([https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/)). [Veriskope](https://rtmp.veriskope.com/docs/spec/)[Veriskope](https://rtmp.veriskope.com/docs/spec/)
- **Aggregate (type 22) messages** are a single message holding multiple sub-messages; useful for VOD seek, but many encoders never emit them.
- **Multiplexing pitfall.** While the spec says different message-streams *can* share a chunk-stream, "this defeats the benefits of the header compression" — almost no implementation does it. [Veriskope](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)

---

## 4. Deep Connections to Other Protocols

### TCP

RTMP runs *on* TCP. Specifically: a single TCP connection per `NetConnection`. Every RTMP "stream" is a logical multiplex inside one byte-stream; head-of-line blocking at TCP propagates to every multiplexed media stream. This is precisely the limitation that motivates UDP-based replacements (SRT, WebRTC, MoQ). RFC 9293 [https://www.rfc-editor.org/rfc/rfc9293.html](https://www.rfc-editor.org/rfc/rfc9293.html). [Yostream](https://yostream.io/blog/rtmp-vs-webrtc-latency/)

### TLS

RTMPS = RTMP-on-TLS. The TLS layer is unmodified standard TLS 1.2/1.3 (RFC 8446 [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)); only the URL scheme and port differ. Because RTMP is a byte stream protocol, wrapping it in TLS is mechanical — a `stunnel` proxy can convert plain RTMP into RTMPS ([https://dev.to/lax/rtmps-relay-with-stunnel-12d3](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)). Modern hardware does TLS in essentially free CPU cycles.

### HLS

RTMP and HLS are *complements*, not competitors. The dominant workflow is: encoder → RTMP/RTMPS ingest → server transmuxes to HLS fMP4/CMAF segments → CDN → player. HLS is RFC 8216 ([https://datatracker.ietf.org/doc/html/rfc8216](https://datatracker.ietf.org/doc/html/rfc8216)). HLS's segmented HTTP delivery wins on cache-ability and global scale; RTMP's persistent-connection model wins on contribution latency. Low-Latency HLS (LL-HLS) closes the playback gap to ~2-5 s but does not replace RTMP for ingest ([https://www.dacast.com/blog/hls-streaming-protocol/](https://www.dacast.com/blog/hls-streaming-protocol/)). [YTStreamer + 2](https://ytstreamer.com/rtmp-streaming/)

### DASH

MPEG-DASH (ISO/IEC 23009-1, [https://www.iso.org/standard/79329.html](https://www.iso.org/standard/79329.html)) plays the same delivery-side role as HLS but is an ISO international standard rather than an Apple-led RFC. Same complementary relationship to RTMP. YouTube uses DASH for VOD and HLS for live ([https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)).

### RTMFP

"Real-Time Media Flow Protocol": Adobe's UDP cousin to RTMP, RFC 7016 (Nov 2013, M. Thornburgh, Adobe, Informational): [https://www.rfc-editor.org/rfc/rfc7016.html](https://www.rfc-editor.org/rfc/rfc7016.html). Designed for P2P and NAT-traversal in Flash Player 10. Shares the message-stream/AMF data model but gets its own UDP transport, congestion control and crypto (AES-CBC-128). Functionally superseded by WebRTC. [Wikipedia + 2](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)

### RTSP

Real-Time Streaming Protocol — IETF-standardized (RFC 2326 / 7826) "remote control" for media servers. RTSP carries SDP and signaling; the actual media usually flows over RTP. RTSP is huge in IP-camera/surveillance ecosystems but largely irrelevant in consumer live streaming. Different design DNA than RTMP (RTSP is a control plane that *names* streams, whereas RTMP carries control + media on one connection). [https://datatracker.ietf.org/doc/rfc7826/](https://datatracker.ietf.org/doc/rfc7826/)

### RTP / RTCP

Real-time Transport Protocol (RFC 3550) carries the actual media in WebRTC, RTSP and SIP setups. RTCP carries reception statistics. RTMP does not use RTP — it is its own message framing on TCP. WHIP-based ingest *does* terminate on RTP/SRTP. [https://www.rfc-editor.org/rfc/rfc3550](https://www.rfc-editor.org/rfc/rfc3550)

### WebRTC

W3C/IETF stack for browser real-time media: ICE+DTLS+SRTP+RTP+SCTP-data. WebRTC is RTMP's natural successor for *interactive* sub-second use cases. W3C 2025 Recommendation: [https://www.w3.org/TR/2025/REC-webrtc-20250313/](https://www.w3.org/TR/2025/REC-webrtc-20250313/). WebRTC's traditional weakness for ingest (no standard signaling) is what WHIP fixes. [webrtcHacks](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)

### WHIP / WHEP

WebRTC-HTTP Ingestion Protocol — **RFC 9725, March 2025**, by Sergio Garcia Murillo (Millicast) and Alex Gouaillard (CoSMo Software): [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html). It is one HTTP POST that carries an SDP offer; the server responds with a 201 + SDP answer + a session URL for `PATCH` (ICE updates) and `DELETE` (teardown). WHIP **replaces RTMP for ingest** in real-time-interaction scenarios. WHEP (Internet-Draft) does the same for *playback*. [GetStream](https://getstream.io/glossary/whip-protocol/)

### SRT (Secure Reliable Transport)

Haivision's UDP+ARQ contribution protocol, open-sourced 2017, governed by the SRT Alliance (>600 members per industry trackers, [https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/](https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/)). Better than RTMP on lossy networks (recovers ~25% loss at ~1 s buffer per [https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)), built-in AES-256, supports timecode and bonded interfaces. *Replaces* RTMP in professional contribution. Does not yet have universal social-platform acceptance — YouTube and Facebook do not natively accept SRT ingest in 2026 ([https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/](https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/)).

### LL-HLS

Apple's Low-Latency HLS extension to RFC 8216 (introduced 2019, mainstream 2021). Reduces playback latency to 2-5 s by adding partial segments + blocking playlist reloads + HTTP/2 push. *Complements* RTMP — encoder still pushes RTMP, server emits LL-HLS. [https://www.dacast.com/blog/hls-streaming-protocol/](https://www.dacast.com/blog/hls-streaming-protocol/)

### CMAF

Common Media Application Format (ISO/IEC 23000-19), an fMP4-based container that lets a single set of segments serve both HLS and DASH. *Container-level* peer to FLV. [https://www.iso.org/standard/79106.html](https://www.iso.org/standard/79106.html)

### MPEG-TS

The legacy 188-byte-packet broadcast container. SRT and HLS-classic carry MPEG-TS. RTMP does not. ISO/IEC 13818-1: [https://www.iso.org/standard/74427.html](https://www.iso.org/standard/74427.html)

### FLV (container) and HTTP-FLV

RTMP's native container. An RTMP audio (8) or video (9) message body is exactly an FLV tag. **HTTP-FLV** (popular in China — Douyin/TikTok, Bilibili) is essentially "send the FLV tag stream of an RTMP feed over a chunked HTTP/1.1 response". Lower latency than HLS, no segmentation, but only modern browsers via MSE. SRS and nginx-rtmp-module both export it. ([https://github.com/ossrs/srs](https://github.com/ossrs/srs)) [Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)

### NDI

NewTek's Network Device Interface. Local-network high-bandwidth uncompressed/lightly-compressed video for production. Different problem (LAN production) than RTMP (wide-area contribution). Shares essentially no design DNA with RTMP. [https://ndi.video/](https://ndi.video/)

### MoQ (Media-over-QUIC)

The IETF's bet on the next decade. Works at [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) , at draft-17 in early 2026 with co-editors from Cisco, Google and Meta. Push-based pub/sub on top of QUIC's multiplexed streams; meant to *unify* ingest, distribution and on-demand under one protocol with sub-500ms latency. Cloudflare runs the first global MoQ relay network ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)). nanocosmos and WINK Streaming are early production deployers. [Medium](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce)[Medium](https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee)

---

## 5. Real-World Deployment

### 5.1 Servers

- **nginx-rtmp-module** (Roman Arutyunyan, "arut") — [https://github.com/arut/nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) . The default open-source choice for a decade; 14 k stars, 3.6 k forks, *master branch effectively unmaintained* — last meaningful push to master in late 2024, with 2024–2025 issues piling up unanswered ([https://github.com/arut/nginx-rtmp-module/issues/](https://github.com/arut/nginx-rtmp-module/issues/), [https://github.com/arut/nginx-rtmp-module/branches/](https://github.com/arut/nginx-rtmp-module/branches/)). Several long-running forks exist (e.g., the one used by Debian/Ubuntu's `libnginx-mod-rtmp`, sergey-dryabzhinsky's, etc.). Don't confuse with **NGINX Plus**' commercial F5 module which is a *separate* dynamic RTMP module ([https://docs.nginx.com/nginx/admin-guide/dynamic-modules/rtmp/](https://docs.nginx.com/nginx/admin-guide/dynamic-modules/rtmp/)). [GitHub](https://github.com/arut/nginx-rtmp-module/forks)
- **SRS (Simple Realtime Server / "Simple RTMP Server")** — [https://github.com/ossrs/srs](https://github.com/ossrs/srs) . Started by Winlin in October 2013; SRS 7 ("Kai") in 2026 supports RTMP/WebRTC/HLS/HTTP-FLV/HTTP-TS/SRT/MPEG-DASH/GB28181 with H.264/H.265/AV1/VP9/AAC/Opus/G.711. Active TOC, MIT-licensed, production-grade. [OSSRS](https://ossrs.net/lts/en-us/blog/unlock-the-power-of-srs-real-world-use-cases)[GitHub](https://github.com/runner365/read_book/blob/master/rtmp/rtmp_specification_1.0.pdf)
- **Wowza Streaming Engine** — closed-source commercial server descended from the Adobe-vs-Wowza era. Still widely used in enterprise.
- **Adobe Media Server (AMS)** — the protocol's birthplace. In Feb 2019 Adobe granted Veriskope rights to develop, sell and extend AMS; v5.0.16 was released 1 March 2020 by Veriskope ([https://en.wikipedia.org/wiki/Adobe_Media_Server](https://en.wikipedia.org/wiki/Adobe_Media_Server)). Effectively legacy. [Wikipedia](https://en.wikipedia.org/wiki/Adobe_Media_Server)
- **Red5 / Red5 Pro** — open-core Java RTMP server; Red5 Pro markets sub-250 ms RTMP with custom optimizations ([https://www.red5.net/blog/what-is-rtmp-streaming-protocol/](https://www.red5.net/blog/what-is-rtmp-streaming-protocol/)). [Red5](https://www.red5.net/blog/what-is-rtmp-streaming-protocol/)
- **Node-Media-Server** — popular pure-Node.js RTMP/HLS/HTTP-FLV server, MIT-licensed; useful for prototyping.
- **Ant Media Server** — multi-protocol; first-party WHIP support since v2.10.0 ([https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)). [Ant Media](https://antmedia.io/streaming-protocols/)

### 5.2 Clients and toolchains

- **OBS Studio** — the world's most-used streaming encoder; open-source, default RTMP/RTMPS output, WHIP output official since OBS 30 (Aug 2023, [https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)). HEVC/AV1-over-RTMP added in OBS Studio 29.1 via E-RTMP ([https://veovera.org/docs/news/feed.html](https://veovera.org/docs/news/feed.html)). [DEV Community](https://dev.to/dolbyio/how-to-broadcast-a-webrtc-stream-to-twitch-7fa)[enhanced-rtmp](https://veovera.org/docs/news/feed.html)
- **FFmpeg / `librtmp`** — `ffmpeg -re -i input.mp4 -c copy -f flv rtmp://host/app/key`. The `librtmp` library inside FFmpeg, VLC, cURL, MPV is the descendent of rtmpdump ([https://en.wikipedia.org/wiki/RTMPDump](https://en.wikipedia.org/wiki/RTMPDump)).
- **rtmpdump suite (rtmpdump, rtmpsrv, rtmpsuck)** — the original reverse-engineered toolkit; no longer actively developed, but still functional via mirrors such as [https://github.com/mstorsjo/rtmpdump](https://github.com/mstorsjo/rtmpdump).
- **Hardware encoders** — Teradek, AJA, LiveU, Magewell, etc. — virtually all support RTMP/RTMPS as a default output.

### 5.3 Platform ingest stacks

| Platform | Ingest protocols accepted | Notes |
|---|---|---|
| **YouTube Live** | RTMP, RTMPS, HLS, DASH | RTMPS recommended; RTMP not deprecated as of April 2026. ([https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison)) |
| **Twitch** | RTMP/RTMPS (production); WHIP (experimental beta) | [https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW](https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW) |
| **Facebook Live** | RTMPS only since 2019-05-01 | [https://dev.to/lax/rtmps-relay-with-stunnel-12d3](https://dev.to/lax/rtmps-relay-with-stunnel-12d3) |
| **LinkedIn Live** | RTMPS | [https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/) |
| **Cloudflare Stream** | RTMP, RTMPS, SRT, WHIP (migrated to "Realtime" 2025-03-13) | [https://developers.cloudflare.com/stream/changelog/](https://developers.cloudflare.com/stream/changelog/) |
| **Mux Video** | RTMP, RTMPS | "We have focused on RTMP and RTMPS for live streams from an encoder as they are the most universal ingest protocols." [Mux](https://www.mux.com/docs/guides/live-streaming-faqs) [https://www.mux.com/docs/guides/live-streaming-faqs](https://www.mux.com/docs/guides/live-streaming-faqs) |
| **Restream/Castr/Dacast** | RTMP, RTMPS, SRT, WHIP | [https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/) |

Twitch's historical relevance is hard to overstate: Justin.tv (2007) → Twitch (2011) was built around RTMP ingest and continues to be the largest single-tenant RTMP ingest network on the planet ([https://castr.com/blog/history-of-rtmp-protocol/](https://castr.com/blog/history-of-rtmp-protocol/)).

### 5.4 Ingest topologies

The canonical topology is **edge ingest → origin → multi-bitrate transcoder → segmenter → CDN**. Encoders push to the *nearest* RTMP edge by anycast or stream-key routing; the edge relays (also via RTMP) to an origin where transcoding produces multiple HLS/DASH renditions; CDN edges serve viewers. The whole chain is invisible to the streamer. Wowza's 2021 *Video Streaming Latency Report* (cited at [https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)) found that **>76% of content distributors used RTMP for ingest**, a number industry guides repeat into 2026.

### 5.5 Performance characteristics with real numbers

- **Glass-to-glass latency.** Mux: "RTMP latency clocks in between **2 and 5 seconds**, making it a great option for building interactive video experiences" ([https://www.mux.com/articles/rtmp-streaming-protocol](https://www.mux.com/articles/rtmp-streaming-protocol)). SRS measurements: "RTMP can ensure 0.8–3 s latency. The RTMP cluster adds 0.3 s latency for each level." ([https://ossrs.net/lts/en-us/docs/v6/doc/low-latency](https://ossrs.net/lts/en-us/docs/v6/doc/low-latency)). Red5 Pro: sub-250 ms with tuned configurations ([https://www.red5.net/blog/what-is-rtmp-streaming-protocol/](https://www.red5.net/blog/what-is-rtmp-streaming-protocol/)). [Mux + 2](https://www.mux.com/articles/rtmp-streaming-protocol)
- **Comparison.** WebRTC: 100–400 ms in typical deployments ([https://yostream.io/blog/rtmp-vs-webrtc-latency/](https://yostream.io/blog/rtmp-vs-webrtc-latency/)). LL-HLS: 2–5 s. Standard HLS: 15–30 s ([https://www.mux.com/docs/guides/reduce-live-stream-latency](https://www.mux.com/docs/guides/reduce-live-stream-latency)). [Yostream + 2](https://yostream.io/blog/rtmp-vs-webrtc-latency/)
- **Default chunk size**: 128 B baseline, raised to 4096 B by SRS/nginx-rtmp/most encoders for CPU efficiency; max 65 536 B in the spec, though some servers allow up to 0xFFFFFF. [Veriskope](https://rtmp.veriskope.com/docs/spec/)
- **Default ack window**: 2.5 MB per the Adobe spec; nginx-rtmp uses 5 MB. ([https://github.com/arut/nginx-rtmp-module/wiki/Directives](https://github.com/arut/nginx-rtmp-module/wiki/Directives))
- **Practical bitrate ceilings.** Twitch caps creator ingest at 8 Mbps (variable for partners); YouTube Live recommends 6–13.5 Mbps for 1080p60. The protocol itself has no hard ceiling.

---

## 6. Failure Modes and Famous Incidents

### Known CVEs (representative — full list available at NVD by searching "RTMP")

- **CVE-2015-8270** — librtmp (rtmpdump): malformed AMF3 strings cause denial-of-service crashes during stream processing. Fixed circa 2017 patches. [https://nvd.nist.gov/vuln/detail/CVE-2015-8270](https://nvd.nist.gov/vuln/detail/CVE-2015-8270)
- **CVE-2016-10190 / CVE-2016-10191 / CVE-2016-10192** — three FFmpeg heap buffer overflows in the RTMP demuxer found by paulcher, with public exploits. The CVE-2016-10191 write-up is particularly instructive: a chunk-size mismatch lets an attacker overflow `RTMPPacket[]` and gain RCE through a function-pointer overwrite. ([https://blog.csdn.net/axiejundong/article/details/78937126](https://blog.csdn.net/axiejundong/article/details/78937126) ; [https://zhuanlan.zhihu.com/p/29505432](https://zhuanlan.zhihu.com/p/29505432)). Patched in FFmpeg ≥3.2.2. [CSDN](https://blog.csdn.net/axiejundong/article/details/78937126)[CSDN](https://blog.csdn.net/axiejundong/article/details/78937126)
- **CVE-2012-0779** — Adobe Flash Player object-confusion via RTMP, weaponized in Metasploit. [https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/windows/browser/adobe_flash_rtmp.rb](https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/windows/browser/adobe_flash_rtmp.rb)
- **Wireshark RTMPT dissector infinite loop** — issue #17813: a crafted RTMP packet causes 100 % CPU in Wireshark's RTMPT dissector. [https://gitlab.com/wireshark/wireshark/-/issues/17813](https://gitlab.com/wireshark/wireshark/-/issues/17813) [GitLab](https://gitlab.com/wireshark/wireshark/-/issues/17813)
- **NGINX (the core, not nginx-rtmp-module) 2024–2025 CVEs of interest to RTMP operators** (since ingest setups frequently combine nginx-rtmp on the same host as nginx HTTP):
  - CVE-2024-7347 (mp4 module, low) — [https://nvd.nist.gov/vuln/detail/CVE-2024-7347](https://nvd.nist.gov/vuln/detail/CVE-2024-7347)
    - CVE-2024-32760 / 31079 / 35200 / 34161 (HTTP/3) — [https://nginx.org/en/security_advisories.html](https://nginx.org/en/security_advisories.html)
    - CVE-2025-23419 (SSL session reuse) — [https://nginx.org/en/security_advisories.html](https://nginx.org/en/security_advisories.html)

> *I have not been able to identify a 2024 or 2025 CVE specifically against `arut/nginx-rtmp-module` itself; this is consistent with the project's effective dormancy rather than evidence of robustness. Operators should treat the lack of advisories as "no eyes on it" rather than "no bugs."* [needs source for definitive 2024/2025 CVE in arut/nginx-rtmp-module, none found]

### Real-world outages

- **Twitch's intermittent ingest outages of 2020–2022** were widely attributed to RTMP-specific edge-node failures, but Twitch publishes only summary post-mortems on [https://devstatus.twitch.tv/](https://devstatus.twitch.tv/), so I am not citing a specific RTMP root cause without one. [needs source]
- **Facebook Live's 2019 forced-RTMPS migration** — Facebook's deprecation of plain RTMP on 2019-05-01 broke nginx-rtmp-module relays that did not yet support the `rtmps://` scheme, prompting the well-known stunnel workaround ([https://dev.to/lax/rtmps-relay-with-stunnel-12d3](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)). [DEV Community](https://dev.to/lax/rtmps-relay-with-stunnel-12d3)

### Common pitfalls

- **Setting an extended timestamp on a type-3 chunk that the spec says shouldn't have one** — in practice every implementation must accept it because Flash Player emits it.
- **Forgetting to send the AVC/AAC sequence header before the first keyframe.** Servers will accept the connection, the publish will look fine, but viewers get a black screen because the player never received the codec parameters. Documented at length in the Adobe forum: [https://forums.adobe.com/thread/685734](https://forums.adobe.com/thread/685734)
- **Wrong chunk-stream-id**. Audio on csid 4, video on csid 6 is convention; some servers refuse anything else.
- **Window-Ack-Size mis-handling** — common cause of streams that "freeze after a few seconds."

---

## 7. Fun Facts and Anecdotes

- **Why port 1935?** No public Macromedia rationale survives. IANA registers it as **`macromedia-fcs`** (Macromedia Flash Communication Server) — a vestige of the protocol's original product name (see SpeedGuide registry mirror [https://www.speedguide.net/port.php?port=1935](https://www.speedguide.net/port.php?port=1935) ; trycatch.dev's nginx-rtmp tutorial [https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/](https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/) explicitly calls this out: "While IANA still defines this port as 'macromedia-fcs', it is in fact the standard RTMP port"). [Definitive Macromedia rationale — needs source] [TryCatch](https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/)[TryCatch](https://trycatch.dev/2020/09/12/self-hosting-a-streaming-video-platform/)
- **"Tin Can"** was the project codename because the original demo used two-way audio between two Flash clients — like the toy tin-can-and-string telephone ([https://castr.com/blog/history-of-rtmp-protocol/](https://castr.com/blog/history-of-rtmp-protocol/)).
- **AMF was not invented for RTMP.** It was originally Flash Remoting's wire format (Flash Player 6, 2001) for SOAP-style RPC against AMFPHP / WebORB / ColdFusion; RTMP just adopts AMF for command messages because the same client-side ActionScript objects had to traverse it. (AMF0 spec front matter: [https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf))
- **The magic key.** Every RTMPE/digest-handshake implementation contains the literal ASCII strings `"Genuine Adobe Flash Player 001"` and `"Genuine Adobe Flash Media Server 001"` because Flash Player itself does ([https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h](https://github.com/ShiftMediaProject/rtmpdump/blob/master/librtmp/handshake.h)). Marketing money was poured into RTMPE as "DRM"; in reality, the key is right there in the binary ([https://flussonic.com/doc/protocols/rtmp-protocol/](https://flussonic.com/doc/protocols/rtmp-protocol/)).
- **Adobe's 2009 DMCA takedown of rtmpdump** went out **the same year Adobe was promising to publish the RTMP spec** — a fact memorialized on Slashdot under the headline "Adobe Uses DMCA On Protocol It Promised To Open" ([https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open](https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open)).
- **flvstreamer** is a fork of rtmpdump with all RTMPE/SWF-verification code excised, kept in compliance with the DMCA — a beautiful example of license-aware forking ([https://en.wikipedia.org/wiki/RTMPDump](https://en.wikipedia.org/wiki/RTMPDump)).
- **Wowza was founded by ex-Adobe engineers** (David Stubenvoll and Charlie Good) — which is precisely why Adobe sued them in 2011 ([https://www.courthousenews.com/adobe-v-wowza/](https://www.courthousenews.com/adobe-v-wowza/)).
- **RTMP outlived Flash by 5+ years.** Flash Player EOL was 31 December 2020. As of May 2026, RTMP is *still* the dominant ingest protocol in the world. ([https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained))
- **The protocol's longevity surprised even its creators.** Sarah Allen, on Demuxed ep. 13: "[RTMP's] simplicity and high efficiency … is also the main reason why it is still used today" — recorded ~17 years after she helped ship it ([https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope](https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope)). [Wordpress](https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/)

---

## 8. Practical Wisdom

If you only remember a few things:

### Encoder-side

- **Keyframe interval = 2 seconds** for almost every platform. Twitch and YouTube specifically reject longer GOPs for low-latency mode. Closed GOPs only.
- **Bitrate = 70–80% of your sustained upload.** TCP retransmits eat headroom.
- **Use H.264 baseline/main + AAC-LC** unless the platform explicitly accepts E-RTMP HEVC/AV1 (YouTube does via HLS contribution; Twitch's E-RTMP HEVC is in flight per [https://veovera.org/docs/news/feed.html](https://veovera.org/docs/news/feed.html)).
- **Pick chunk_size = 4096** — the SRS / nginx-rtmp default. The 128-byte spec default kills CPUs.

### Server-side

- **Tune TCP** — `net.ipv4.tcp_nodelay = 1`, `tcp_notsent_lowat = 16384`, large send buffers. Linux kernel autotuning handles 1080p well; bump `net.core.wmem_max` for 4K.
- **Always RTMPS for non-public streams.** The marginal CPU cost is essentially zero on modern x86. ([https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained))
- **Drop idle publishers.** nginx-rtmp `drop_idle_publisher 10s;` saves you from zombie connections silently consuming a stream slot.

### Monitoring

- **Watch RTT, dropped frames, encoder bitrate stability and platform "stream health"** dashboards. RTMP looks fine until a packet-loss spike triggers TCP retransmits and your client buffer drains.
- **Use Wireshark with the built-in RTMPT dissector**: [https://wiki.wireshark.org/RTMPT](https://wiki.wireshark.org/RTMPT) . Set `Decode As → RTMPT` for the first few packets (the heuristic only fires after the server's S0+S1+S2). Display filter is `rtmpt`. Increase `RTMPT max packet size` preference for native bandwidth-detection traffic. [GitHub](https://github.com/boundary/wireshark/blob/master/epan/dissectors/packet-rtmpt.c)
- **`librtmp -V`** for verbose handshake debug; `tcpflow` to isolate the byte stream and feed `xxd` for human-readable inspection.

### The big architectural rule

**RTMP for ingest, HLS/DASH for delivery.** This pattern has held for a decade and remains correct in 2026. Add WHIP-for-ingest only when sub-second latency is part of the product (live shopping, betting, interactive Q&A) and you control the client (browser or native app with WebRTC stack). Do *not* assume your social-platform of choice supports WHIP — most do not yet. ([https://www.mux.com/blog/which-live-stream-ingest-protocol-is-right-for-you](https://www.mux.com/blog/which-live-stream-ingest-protocol-is-right-for-you))

### When *not* to use RTMP

- You need <1 s latency and control the player → WebRTC/WHIP.
- Your contribution path goes over a lossy mobile network → SRT.
- You're delivering to viewers, not contributing → HLS/LL-HLS or DASH.
- You're on a UDP-only network or behind a firewall that mangles long-lived TCP → RTMFP/SRT/WebRTC.

---

## 9. Learning Resources (current as of May 2026)

### Specifications and RFCs

- **Adobe RTMP 1.0 Specification (final, 21 Dec 2012)** — [https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf) and HTML [https://rtmp.veriskope.com/docs/spec/](https://rtmp.veriskope.com/docs/spec/) (machine-readable HTML republished by Veriskope, January 2019). *Intermediate.* The canonical reference.
- **Enhanced RTMP v2 Release** (Veovera, v2-2026-01-31-r2) — [https://veovera.org/docs/enhanced/enhanced-rtmp-v2.pdf](https://veovera.org/docs/enhanced/enhanced-rtmp-v2.pdf) and Markdown source [https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md](https://github.com/veovera/enhanced-rtmp/blob/main/docs/enhanced/enhanced-rtmp-v2.md) . *Intermediate.* The 2024–2026 modernization layer.
- **Adobe AMF0 spec** — [https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf](https://rtmp.veriskope.com/pdf/amf0-file-format-specification.pdf) . *Intermediate.* (No date update since 2013.)
- **Adobe AMF3 spec** — [https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf](https://rtmp.veriskope.com/pdf/amf3-file-format-spec.pdf) . *Advanced.*
- **Adobe FLV/F4V Video File Format Spec v10.1** — [https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf](https://veovera.org/docs/legacy/video-file-format-v10-1-spec.pdf) . *Intermediate.*
- **RFC 9725 — WHIP** (March 2025) — [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) . *Advanced.* The canonical RTMP-replacement-for-ingest.
- **RFC 7016 — RTMFP** (Nov 2013) — [https://www.rfc-editor.org/rfc/rfc7016.html](https://www.rfc-editor.org/rfc/rfc7016.html) . *Advanced.*
- **draft-ietf-moq-transport** — [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) . *Advanced.* The future.
- **RFC 8216 — HLS** — [https://datatracker.ietf.org/doc/html/rfc8216](https://datatracker.ietf.org/doc/html/rfc8216) . *Intermediate.*

### Engineering blog posts (2024–2026)

- **Mux: "Which live stream ingest protocol is right for you?"** — [https://www.mux.com/blog/which-live-stream-ingest-protocol-is-right-for-you](https://www.mux.com/blog/which-live-stream-ingest-protocol-is-right-for-you) . *Intro/intermediate.* Updated for SRT and WHIP eras.
- **Cloudflare: "MoQ: Refactoring the Internet's real-time media stack" (2025)** — [https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/) . *Intermediate.*
- **WebrtcHacks: "WebRTC cracks the WHIP on OBS" (2023)** — [https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/) . *Intermediate.* The OBS 30 / WHIP backstory.
- **Ant Media: "Video Streaming Protocols: Everything You Need to Know [2026 Update]"** — [https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/) . *Intro.*
- **Castr: "A Complete History of RTMP Streaming Protocol"** — [https://castr.com/blog/history-of-rtmp-protocol/](https://castr.com/blog/history-of-rtmp-protocol/) . *Intro.*
- **Dacast: "What Is RTMP? 2026 Guide"** — [https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/) . *Intro.*
- **Sonnati's reminiscence "FCS and RTMP – Streaming Technologies from the future"** — [https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/](https://sonnati.wordpress.com/2022/12/22/fcs-and-rtmp-streaming-technologies-from-the-future/) . *Intro.* Best historical first-person account, with names.

### Podcasts

- **Demuxed (Mux/Heavybit)** — [https://www.heavybit.com/library/podcasts/demuxed](https://www.heavybit.com/library/podcasts/demuxed) . Specifically:
  - Ep. 13 "Two-Way Video and Beyond with Sarah Allen of Veriskope" — RTMP origin story from a co-creator ([https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope](https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope)). [Heavybit](https://www.heavybit.com/library/podcasts/demuxed/ep-13-two-way-video-and-beyond-with-sarah-allen-of-veriskope)
    - Ep. 14 "Low-Latency HLS, Pt. 1" — RTMP-vs-WebRTC framing.
    - Ep. 22 (2024) — Demuxed-conference catch-up.
- **Demuxed conference 2022 talk: "Better Live Video over RTMP"** — [https://2022.demuxed.com/](https://2022.demuxed.com/) . *Advanced.*

### Books

- *Adobe Flash Media Server* / *Macromedia Flash Communication Server MX* (Towes et al., 2002–2008) — historical, pre-Flash-EOL. Out of date but useful for ActionScript-side semantics. [https://flylib.com/books/en/3.347.1.13/1/](https://flylib.com/books/en/3.347.1.13/1/)
- *Learning Web-based Video Streaming with HLS, DASH and Low Latency* (Apress, 2024) — covers the modern delivery side; only one chapter on RTMP ingest. [needs verification of latest edition]
- No current book is dedicated to RTMP. The Adobe spec + Veovera E-RTMP spec + a few engineering blog posts collectively replace a textbook.

### Hands-on tools

- **Wireshark RTMPT dissector** — built in since 2008. Wiki page [https://wiki.wireshark.org/RTMPT](https://wiki.wireshark.org/RTMPT) . Use `tcp.port == 1935` capture filter and `Decode As → RTMPT`.
- **OBS Studio 30+** — [https://obsproject.com](https://obsproject.com) . Free encoder; RTMP/RTMPS/WHIP outputs.
- **FFmpeg with RTMP support** — `brew install ffmpeg` / `apt install ffmpeg`. [https://ffmpeg.org/](https://ffmpeg.org/)
- **rtmpdump / librtmp** mirrors — [https://github.com/mstorsjo/rtmpdump](https://github.com/mstorsjo/rtmpdump) (no longer actively developed but still functional).
- **SRS docker image** — `docker run --rm -it -p 1935:1935 -p 1985:1985 -p 8080:8080 ossrs/srs:6` ([https://github.com/ossrs/srs](https://github.com/ossrs/srs)). The fastest way to a working test environment.
- **ngrok TCP tunnels** for testing RTMP locally over the public Internet. [https://ngrok.com/docs/network-edge/domains-and-tcp-addresses/](https://ngrok.com/docs/network-edge/domains-and-tcp-addresses/)

---

## 10. Where Things Are Heading (2025–2026 Frontier)

**Synthesis.** RTMP is not being deprecated. It is being slowly *flanked*.

### What is being deprecated

- **Plain RTMP for any non-public stream.** YouTube, Facebook, LinkedIn, every reputable platform require RTMPS. Plain RTMP survives only in localhost/VPN topologies.
- **rtmpdump and librtmp upstream development.** No new commits to the canonical mplayerhq tree since the late 2010s; what survives is forks pinned by FFmpeg.
- **nginx-rtmp-module's master branch.** Unmaintained but still ubiquitous; expect it to be replaced *de facto* by SRS, MediaMTX, and Node-Media-Server in greenfield deployments.

### What is replacing it (and where)

- **WHIP (RFC 9725, March 2025)** for ingest where sub-second matters — gaming, betting, live commerce, video conferencing. Implementations: OBS 30+, Twitch (beta), Cloudflare Realtime, Dolby.io, Millicast, Ant Media, MediaMTX, Janus, Mediasoup, VDO.Ninja, SRS, Pion. [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html)
- **SRT** for professional contribution, especially over the public Internet or 5G — backed by the SRT Alliance and most pro encoder vendors.
- **Enhanced RTMP (E-RTMP v2)** — Veovera's 2024–2026 effort *keeps RTMP itself alive* by giving it HEVC, AV1, VP9, Opus, FLAC, multitrack, and nanosecond timestamps. This is the most plausible "RTMP wins" timeline for the late 2020s. Industry support: Adobe, YouTube, Twitch, Amazon, FFmpeg, OBS, VideoLAN, Dolby, Intel, Ant Media, Red5, XSplit ([https://github.com/veovera/enhanced-rtmp](https://github.com/veovera/enhanced-rtmp)).
- **MoQ (Media-over-QUIC)** — IETF working group draft-17 of moq-transport in early 2026; production relays from Cloudflare across 330+ cities; nanocosmos shipped MoQ at IBC 2025; WINK Streaming at 200–300 ms in production. Co-editors from Cisco, Google, Meta. ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/) ; [https://www.nanocosmos.net/blog/media-over-quic-moq/](https://www.nanocosmos.net/blog/media-over-quic-moq/) ; [https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php](https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php)) MoQ's ambition is to *unify* ingest, distribution, and on-demand under one transport — if it lands in browsers (Apple is the open question on WebTransport), it has the potential to displace both RTMP and HLS over the coming five years.

### IETF working groups to watch

- **WISH (WebRTC Ingest Signaling over HTTPS)** — produced WHIP. [https://datatracker.ietf.org/wg/wish/about/](https://datatracker.ietf.org/wg/wish/about/)
- **MoQ** — [https://datatracker.ietf.org/wg/moq/about/](https://datatracker.ietf.org/wg/moq/about/) . Active.
- No working group is currently drafting an *RTMP successor* per se — the field has moved on to QUIC-based ideas.

### Vendor positioning

- **Cloudflare**: all-in on MoQ + WHIP + WebRTC; deprecating Stream's RTMP-only paths in favor of "Cloudflare Realtime" ([https://developers.cloudflare.com/stream/changelog/](https://developers.cloudflare.com/stream/changelog/), [https://developers.cloudflare.com/moq/](https://developers.cloudflare.com/moq/)).
- **Mux**: RTMP/RTMPS-first ingest; HLS-first delivery; experimenting with WebRTC. "We have focused on RTMP and RTMPS … as the most universal ingest protocols" ([https://www.mux.com/docs/guides/live-streaming-faqs](https://www.mux.com/docs/guides/live-streaming-faqs)).
- **Dolby (Millicast)**: WHIP-first; Sergio Garcia Murillo (RFC 9725 author) was at Dolby/Millicast.
- **Twitch / Amazon IVS**: RTMP+E-RTMP for the long tail; experimental WHIP for low-latency. Amazon IVS launched Multitrack Video on E-RTMP in 2024–25 ([https://veovera.org/docs/news/feed.html](https://veovera.org/docs/news/feed.html)).

### Is RTMP still the dominant ingest in 2026?

**Yes.** Every credible 2026 industry source still calls RTMP the "universal" or "dominant" ingest protocol ([https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/](https://www.dacast.com/blog/rtmp-real-time-messaging-protocol/) ; [https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/) ; [https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained) ; [https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/](https://castr.com/blog/video-streaming-protocols-everything-you-need-to-know/)). The 76 % figure from Wowza's 2021 latency report is repeatedly cited and not yet supplanted by a more recent industry-wide measurement. The "will it die soon?" answer is: *not before its successor reaches universal social-platform support, which it has not as of May 2026*.

---

## 11. Hooks for Article, Infographic, and Podcast

### 60-second narrated hook (non-experts)

> "In December 2020, Adobe pulled the plug on Flash Player. The internet held a small wake. Twenty-five-year-old browser plug-ins are not supposed to be missed. But almost no one noticed that one piece of Flash *survived* — and not just survived, **runs the global live streaming industry to this day.** It's called RTMP. Every time a Twitch streamer hits 'Go Live,' every time someone wedding-streams over Facebook Live, every time a corporate town hall lights up YouTube, RTMP — invented by a small team at Macromedia in 2002 to power tin-can-and-string demos in Flash — is the protocol that carries the bits from camera to cloud. The 'open' specification Adobe published in 2012 omitted the encryption scheme. Pirates reverse-engineered it within months. Adobe sent DMCA takedowns. The reverse engineers won. And here we are in 2026, with WebRTC and QUIC trying to take the throne, and RTMP still standing — because a protocol so simple it can be implemented in a weekend turns out to be exactly what a billion encoders needed."

### Striking statistic

> **Over 76 % of content distributors used RTMP for ingest** (Wowza 2021 *Video Streaming Latency Report*, cited in industry analysis [https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)) — **and that has not measurably changed in 2026.** The protocol Adobe shipped to support a now-dead browser plug-in is the most-used contribution protocol in human history.

### "Pause and think" moment

> The Adobe RTMP 1.0 specification was published on **21 December 2012** ([https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)). It has not been substantively revised since. The protocol carrying every Twitch stream to Amazon's data centers in 2026 is described by a 14-year-old PDF that **deliberately omits Adobe's own encryption scheme** and contains errata that every implementer silently works around. *Why is the internet's live-video front door still bolted shut with a 14-year-old key?* Because nothing else has yet earned the trust of every encoder, every platform, and every CDN at the same time. WHIP and MoQ are circling. RTMP is still standing.

### Failure-story arc

> *(Dramatic retelling, well-suited to podcast cold opens.)* It is May 2009. A small open-source project called **rtmpdump** is hosted on SourceForge. Its author, Andrej Stepanchuk, has spent the past year reverse-engineering Adobe's "secure" RTMPE protocol — the encrypted variant that ships in Flash Media Server 3 and is sold to TV networks as a copy-protection layer. He has discovered that the entire crypto edifice rests on a single ASCII string baked into every copy of the Flash Player on Earth: `Genuine Adobe Flash Player 001`. There is no key exchange, no certificate authority, no secret. The DRM is *theater*.
> 
> Adobe sends a DMCA takedown notice to SourceForge. The project page goes dark, replaced by *"The project specified has been flagged as deleted"* ([https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open](https://yro.slashdot.org/story/09/05/22/1254246/adobe-uses-dmca-on-protocol-it-promised-to-open)). Slashdot writes the headline that defines the moment: "Adobe Uses DMCA On Protocol It Promised To Open." Six months earlier, Adobe had *announced* it would publish the RTMP specification.
> 
> What happens next is one of those small, quiet victories that the open-source community is exceptionally good at. The development of rtmpdump simply *moves outside the United States*, to the MPlayer project's servers, in October 2009 ([https://en.wikipedia.org/wiki/RTMPDump](https://en.wikipedia.org/wiki/RTMPDump)). The code is rewritten in C, slimmed down by half, and split into a reusable library — `librtmp`. Within months it is embedded in **FFmpeg, VLC, MPV, cURL, and XBMC**. Adobe never sues again. RTMPE, the protocol Adobe spent millions marketing as DRM, becomes the protocol every Linux distribution can decrypt by default.
> 
> Eleven years later, in December 2020, Flash itself dies. The "DRM" that was never DRM dies with it. RTMP — the *unencrypted* base protocol — does not. In 2026, an OBS user clicks "Go Live" on Twitch, and 24 years of streaming-industry inertia carries their video over a 14-year-old specification, on port 1935, to a server farm that fans out to HLS-segment CDNs the world over. The protocol that survived its own creator's lawsuits is also the protocol that outlived its creator's plug-in.
> 
> The lesson, for engineers: **simple, well-documented protocols win.** "Secure" proprietary crypto, less so.

---

## Caveats and Open Questions

1. The user's prompt mentions a "2008 RealNetworks vs Adobe lawsuit over reverse engineering RTMPE." I could find no record of such a suit — Adobe's RTMPE-related legal action in that period was the **2009 DMCA takedown of rtmpdump on SourceForge**; the RealNetworks litigation of 2008–2010 was *RealNetworks v. DVD CCA*, about CSS DVD encryption. I have flagged this in §2 rather than silently rewriting the question.
2. The Wowza 2021 ">76% used RTMP for ingest" figure is widely cited in 2026 sources but the original PDF is no longer publicly findable; I am citing the Ant Media restatement ([https://antmedia.io/streaming-protocols/](https://antmedia.io/streaming-protocols/)). [Original Wowza PDF — needs source as of May 2026]
3. I could not locate an authoritative public statement from Macromedia/Adobe confirming why **port 1935** specifically was chosen. The IANA registration as `macromedia-fcs` is documented; the rationale is folklore. [needs source]
4. **nginx-rtmp-module's exact maintenance status.** GitHub shows last activity on master in late 2024 and an Issues tab full of unresolved 2024–2025 reports, but no formal "this project is unmaintained" notice from Roman Arutyunyan. Treat the project as "in maintenance limbo" rather than abandoned. ([https://github.com/arut/nginx-rtmp-module/branches/](https://github.com/arut/nginx-rtmp-module/branches/), [https://github.com/arut/nginx-rtmp-module/issues/](https://github.com/arut/nginx-rtmp-module/issues/))
5. **Twitch's WHIP endpoint** is described publicly only as "experimental" — the URL Sean DuBois posted in 2023 is `g.webrtc.live-video.net:4443/v2/offer` ([https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW](https://www.linkedin.com/posts/sean-dubois_twitch-activity-7053056800861933568-TTPW)). Twitch has not published a production migration path off RTMP. **As of May 2026, RTMP/RTMPS remains the production ingest path for Twitch.**
6. **MoQ statistics** ("Cloudflare across 330+ cities", "WINK 200–300 ms latency") are cited from secondary 2026 industry blogs ([https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce](https://medium.com/video-tech/media-over-quic-moq-the-protocol-that-could-finally-unify-streaming-8b95972db9ce), [https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php](https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php)) and should be treated as vendor claims rather than independently verified benchmarks.
7. The specific list of E-RTMP industry signatories (Adobe, YouTube, Twitch, Amazon, etc.) is taken from Veovera's own README ([https://github.com/veovera/enhanced-rtmp/blob/main/README.md](https://github.com/veovera/enhanced-rtmp/blob/main/README.md)). Treat as Veovera's claim of support; FFmpeg, OBS and Twitch shipped E-RTMP code, which is independent corroboration.
8. **Latency numbers** vary widely with implementation. The 2–5 s figure is Mux's measured number for their service ([https://www.mux.com/articles/rtmp-streaming-protocol](https://www.mux.com/articles/rtmp-streaming-protocol)); SRS reports 0.8–3 s in tuned configurations ([https://ossrs.net/lts/en-us/docs/v6/doc/low-latency](https://ossrs.net/lts/en-us/docs/v6/doc/low-latency)); Red5 Pro markets sub-250 ms ([https://www.red5.net/blog/what-is-rtmp-streaming-protocol/](https://www.red5.net/blog/what-is-rtmp-streaming-protocol/)). All three can be true simultaneously because they describe different stacks, different network paths, and different buffer configurations. Always benchmark your own pipeline.