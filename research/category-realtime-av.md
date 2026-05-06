---
prompt_source: deep-research-prompts.txt:695-862 (REAL-TIME A/V)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/f06d020d-a437-40ba-9b49-2f316b35b96b
research_mode: claude.ai Research
---

# Real-Time A/V Protocols: A Field Guide for Engineers (2026 Edition)

> *"A dropped frame beats a frozen screen."* That single design principle is the through-line of every protocol below. They are how the internet — a packet-switched, lossy, asynchronous network designed for files — was bent into a real-time medium for the human voice and the human eye.

This report is intended to support long-form articles, an infographic series, and a podcast. It runs long deliberately. The current date is **5 May 2026**; sources from 2024–2026 are preferred and called out where they materially change earlier understanding.

---

## Prerequisites and glossary

You cannot understand the protocol family without these primitives. Each is the answer to a specific physical or networking constraint that every member of the group has to confront.

- **Latency vs throughput.** Throughput is bytes/second. Latency is the time between a real-world event and a viewer's eyes seeing it. Real-time A/V optimizes the latter, often at the expense of the former. "Glass-to-glass" or "wall-clock" latency is the canonical end-to-end measure (Mux: [https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away](https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away)).
- **Packet loss.** UDP packets are not retransmitted by the network. Loss happens — over Wi-Fi, LTE, congested last-miles, on the public internet at typically 0.1–2% under load. RTP, SRT, RIST, RoQ, MoQ all assume loss is normal and design around it.
- **Jitter.** Variation in inter-packet arrival time. A 20-ms-spaced audio stream that arrives at 18, 25, 17, 30, 16 ms is jittery. Jitter is the enemy of real-time playback because audio/video frames must be presented at fixed intervals.
- **Jitter buffer / playout buffer.** A short FIFO at the receiver that absorbs jitter by intentionally delaying playback. Bigger buffer = smoother playback but more latency. WebRTC tunes this dynamically (NetEQ for audio).
- **FEC (Forward Error Correction).** Send redundant data alongside the stream so loss can be reconstructed without retransmission. SRT, RIST, WebRTC (FlexFEC, ULPFEC), and RoQ all use it. The tradeoff: bandwidth overhead vs. retransmit latency (Haivision: [https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/](https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/)).
- **NACK / ARQ.** Negative acknowledgement / automatic repeat request. The receiver explicitly asks the sender to resend missing sequence numbers. SRT, RIST and WebRTC all rely on NACK. ARQ is faster than TCP retransmits because the receiver triggers immediately on detection ([https://en.wikipedia.org/wiki/Secure_Reliable_Transport](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)).
- **Codec / container.** A *codec* (H.264, H.265, VP8, VP9, AV1, Opus, AAC) compresses a/v signals into bitstreams. A *container* (MP4/ISO BMFF, MPEG-TS, WebM, fMP4/CMAF) wraps the bitstream with timing/metadata. Most real-time protocols are codec-agnostic but care deeply about the container's frame boundaries.
- **Bitrate / ABR (Adaptive Bitrate).** ABR ladders pre-encode multiple quality levels (e.g., 240p/500 kbps … 1080p/5 Mbps). Players switch between them based on observed throughput. HLS and DASH are the canonical ABR protocols.
- **GOP / I-frame / P-frame / B-frame.** A Group of Pictures starts with an I-frame (self-contained, expensive), followed by P-frames (predicted from previous) and optionally B-frames (predicted from both directions). Stream switching, seeking, and recovery from loss only happen cleanly at I-frames. GOP length is a fundamental latency knob.
- **RTT (Round Trip Time).** Time for a packet to go and an ack to come back. Bounds congestion control loops. WebRTC GCC and BBR both estimate RTT continuously ([https://research.google/pubs/bbr-congestion-based-congestion-control-2/](https://research.google/pubs/bbr-congestion-based-congestion-control-2/)).
- **NAT, ICE, STUN, TURN.** NAT (Network Address Translation) is why peer-to-peer is hard: most endpoints don't have routable public IPs. **STUN** (RFC 8489) lets a host learn its public-mapped address. **TURN** (RFC 8656) relays traffic when peer-to-peer fails (symmetric NAT, restrictive firewalls). **ICE** (RFC 8445) is the framework that gathers candidates from STUN/TURN/host and picks the best path.
- **DTLS / SRTP.** SRTP (RFC 3711, 2004) encrypts RTP payloads with AES-CM and HMAC-SHA1, providing confidentiality, integrity, and replay protection. WebRTC mandates SRTP and uses **DTLS-SRTP** (RFC 5764) to derive SRTP keys from a DTLS handshake ([https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711), [https://webrtc.googlesource.com/src/+/refs/heads/lkgr/pc/g3doc/srtp.md](https://webrtc.googlesource.com/src/+/refs/heads/lkgr/pc/g3doc/srtp.md)). [IETF](https://datatracker.ietf.org/doc/html/rfc3711)[Googlesource](https://webrtc.googlesource.com/src/+/refs/heads/lkgr/pc/g3doc/srtp.md)
- **SSRC.** A 32-bit Synchronization Source identifier in every RTP packet (RFC 3550). It identifies a single timing/sequence space; mixers introduce CSRCs (Contributing Sources) ([https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550)).
- **MTU / MSS.** Maximum Transmission Unit on a path (typically 1500 bytes Ethernet, less over tunnels). MSS is the TCP segment size. RTP packets that exceed MTU get IP-fragmented, which is fragile across the internet, so encoders fragment large frames at the application layer.
- **Head-of-line (HoL) blocking.** When ordered transports (TCP, HTTP/2 over a single connection) hold up later packets because an earlier one is missing. The fundamental reason real-time media prefers UDP/QUIC. QUIC's per-stream ordering eliminates connection-wide HoL blocking.
- **Congestion control.** TCP's CUBIC interprets loss as congestion; **BBR** (Cardwell, Cheng, Gunn, Hassas Yeganeh, Jacobson, 2016) instead models bottleneck bandwidth and minimum RTT, dramatically improving throughput on lossy paths ([https://research.google/pubs/bbr-congestion-based-congestion-control-2/](https://research.google/pubs/bbr-congestion-based-congestion-control-2/)). For real-time media specifically, the IETF RMCAT WG produced three algorithms: **GCC** (Google Congestion Control, used in libwebrtc), **NADA** (Cisco, RFC 8698, ECN-aware), **SCReAM** (Ericsson, RFC 8298, designed for LTE) ([https://datatracker.ietf.org/doc/html/draft-ietf-rmcat-scream-cc-13](https://datatracker.ietf.org/doc/html/draft-ietf-rmcat-scream-cc-13), [https://datatracker.ietf.org/doc/html/draft-ietf-rmcat-nada](https://datatracker.ietf.org/doc/html/draft-ietf-rmcat-nada)). [IETF](https://www.ietf.org/archive/id/draft-cardwell-iccrg-bbr-congestion-control-01.html)[Eudl](https://eudl.eu/pdf/10.1007/978-3-030-32216-8_4)
- **Simulcast vs SVC.** Simulcast = sender encodes the same content at N independent qualities; the SFU forwards whichever the receiver can handle. **SVC (Scalable Video Coding)** = a single stream encoded as a base layer plus enhancement layers; the SFU drops layers as needed. VP9 and AV1 support SVC well; AV1's SVC is part of why Google Meet, Webex, and Millicast adopted it.
- **SFU vs MCU.** **MCU (Multipoint Control Unit)** decodes, mixes, and re-encodes; expensive but compatible with simple endpoints. **SFU (Selective Forwarding Unit)** just forwards selected RTP streams; cheap and scalable. WebRTC group calls almost universally use SFUs (Janus, Jitsi, mediasoup, LiveKit, Cloudflare Calls). [Fsjs](https://fsjs.dev/comparing-webcodecs-and-webrtc-which-should-you-choose/)
- **QoE (Quality of Experience).** The user-facing metric — perceived smoothness, sharpness, time-to-first-frame, rebuffer ratio. Distinct from QoS, which is the network-side metric.

---

## The arc of the group

Real-time A/V over IP is a 35-year engineering project to retrofit the file-sharing internet into a circuit-switched-replacement.

**1990–1995: PARC, LBL, USC/ISI and the Mbone.** Steve Deering at Stanford/Xerox PARC invented IP multicast (RFC 1112, 1989). Van Jacobson at LBL, Steve Casner at USC/ISI, and Ron Frederick at Xerox PARC built audio/video tools — `vat` (Visual Audio Tool), `vic` (Video Conferencing), `wb` (whiteboard), `nv` (Network Video), `sdr` (Session Directory) — over a virtual multicast overlay called the **Mbone**. The first significant Mbone use was the 16–20 March 1992 IETF meeting in San Diego, watched by 20 sites. By 1994 the Rolling Stones broadcast a concert over it ([https://en.wikipedia.org/wiki/Mbone](https://en.wikipedia.org/wiki/Mbone), [https://history.lbl.gov/Publications/Research-Review/Highlights/1994/MBone.html](https://history.lbl.gov/Publications/Research-Review/Highlights/1994/MBone.html)). [Lawrence Berkeley National Laboratory](https://www2.lbl.gov/Science-Articles/Archive/MBONE-van-jacobson.html)[Wikipedia](https://en.wikipedia.org/wiki/Mbone)

**January 1996: RTP is born.** Schulzrinne, Casner, Frederick and Jacobson published **RFC 1889 (RTP)**, a generalization of the framing they had each implemented separately in vat/vic/nv. Ron Frederick later said he regretted RTCP's complexity, which he believes slowed RTP adoption versus TCP-based streaming ([https://webrtcforthecurious.com/docs/10-history-of-webrtc/](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)). RTP was revised in **RFC 3550** (July 2003) and remains the workhorse to this day. [Webrtcforthecurious](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)[Webrtcforthecurious](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)

**1996–1999: SIP vs H.323.** ITU-T H.323 (1996) brought ISDN-style telephony to IP. Mark Handley, Henning Schulzrinne, Eve Schooler and Jonathan Rosenberg designed **SIP** in 1996, originally to set up Mbone multicast sessions; it was standardized as **RFC 2543 (1999)** and revised as **RFC 3261 (2002)** ([https://en.wikipedia.org/wiki/Session_Initiation_Protocol](https://en.wikipedia.org/wiki/Session_Initiation_Protocol), [https://datatracker.ietf.org/doc/rfc3261/](https://datatracker.ietf.org/doc/rfc3261/)). The "SIP vs H.323 wars" of 1999–2003 ended with SIP winning the internet/IT side and H.323 surviving in legacy enterprise videoconferencing. **SDP** (RFC 2327 → RFC 4566 → **RFC 8866**, 2021) emerged as the offer/answer description language used by SIP, RTSP, and later WebRTC. **RTSP 1.0** (RFC 2326, 1998), co-developed by RealNetworks, Netscape and Columbia, gave us "VCR-style" remote control of media servers; **RTSP 2.0** is RFC 7826 (2016) ([https://datatracker.ietf.org/doc/rfc7826/](https://datatracker.ietf.org/doc/rfc7826/)). [Wikipedia + 2](https://en.wikipedia.org/wiki/Session_Initiation_Protocol)

**Early 2000s: Flash / RTMP dominate web video.** Macromedia's "Tin Can" project, led by Jonathan Gay, became Flash Communication Server in July 2002, with **RTMP** as its wire protocol over TCP/1935. After Adobe bought Macromedia in 2005 ($3.4B), Flash + RTMP basically *was* internet video for nearly a decade — YouTube, JustinTV/Twitch, Hulu, Vimeo, all Flash ([https://castr.com/blog/history-of-rtmp-protocol/](https://castr.com/blog/history-of-rtmp-protocol/)). RTMP's technical contribution was multiplexed, persistent low-latency channels over TCP, with chunk sizes typically 64–128 bytes. [Castr + 2](https://castr.com/blog/history-of-rtmp-protocol/)

**2007–2010: Mobile kills Flash, HLS rises.** When the iPhone shipped without Flash in 2007, and Steve Jobs published "Thoughts on Flash" in April 2010, the writing was on the wall. Roger Pantos at Apple authored **HTTP Live Streaming (HLS)** in 2009 — a deliberately simple design: an `.m3u8` text playlist pointing at numbered MPEG-TS segments, fetched by ordinary HTTP (RFC 8216, 2017). HLS is "pull-based, plays through any web cache, requires no special server" — exactly the opposite of RTMP ([https://developer.apple.com/streaming/HLS-draft-pantos.pdf](https://developer.apple.com/streaming/HLS-draft-pantos.pdf), [https://developer.apple.com/videos/play/wwdc2019/502/](https://developer.apple.com/videos/play/wwdc2019/502/)). [The Hustle](https://thehustle.co/010520221-adobe-flash)[Apple Developer](https://developer.apple.com/videos/play/wwdc2019/502/)

**2010–2012: Standards consolidation.** Google bought Global IP Solutions (GIPS) in May 2010 for its codecs and echo-cancellation, then in May 2011 open-sourced the result as **WebRTC** ([https://en.wikipedia.org/wiki/WebRTC](https://en.wikipedia.org/wiki/WebRTC)). Justin Uberti led engineering; Serge Lachapelle led product ([https://webrtcforthecurious.com/docs/10-history-of-webrtc/](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)). The IETF RTCWEB and W3C WebRTC working groups produced a stack of inter-locking specs over the next decade. **MPEG-DASH** (ISO/IEC 23009-1) was ratified in 2012 as the open-standard answer to HLS ([https://www.iso.org/standard/57623.html](https://www.iso.org/standard/57623.html)). **Opus** (RFC 6716, September 2012, by Jean-Marc Valin, Koen Vos, Tim Terriberry) merged Skype's SILK and Xiph's CELT into a single royalty-free codec spanning 6–510 kbps and frame sizes 2.5–60 ms ([https://datatracker.ietf.org/doc/html/rfc6716](https://datatracker.ietf.org/doc/html/rfc6716)). [Wikipedia + 5](https://en.wikipedia.org/wiki/WebRTC)

**2013–2019: WebRTC industrialization.** Cross-browser video calls (February 2013), DataChannel (February 2014), 1.0 W3C Recommendation (January 2021). The whole NAT-traversal stack (ICE/STUN/TURN/DTLS-SRTP) became table-stakes. Haivision quietly developed **SRT** starting in 2012, demoed it at IBC 2013, and open-sourced it at NAB 2017 ([https://en.wikipedia.org/wiki/Secure_Reliable_Transport](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)). Broadcasters who wanted reliable low-latency contribution but didn't trust a single vendor formed the Video Services Forum's **RIST** Activity Group in 2017 ([https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport](https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport)). Apple killed RTMP playback in browsers; the industry settled on RTMP-for-ingest, HLS/DASH-for-egress. [Wikipedia](https://en.wikipedia.org/wiki/WebRTC)[Wikipedia](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)

**2019–2022: Pandemic, CMAF, LL-HLS, WHIP.** COVID drove Zoom/Teams/Meet to billions of MAUs. Apple introduced **Low-Latency HLS** at WWDC 2019, demonstrated by Roger Pantos with a Sydney→Cupertino call clocking under 2 seconds glass-to-glass ([https://developer.apple.com/videos/play/wwdc2019/502/](https://developer.apple.com/videos/play/wwdc2019/502/)). The community simultaneously converged on **CMAF** (Common Media Application Format, ISO/IEC 23000-19, 2017–2018) so HLS and DASH could share fMP4 segments. **WHIP** standardization began in the IETF WISH WG and became RFC 9725 in **March 2025** ([https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/)). [Apple Developer + 2](https://developer.apple.com/videos/play/wwdc2019/502/)

**2023–2026: The QUIC revolution.** With QUIC (RFC 9000, 2021) and HTTP/3 (RFC 9114, 2022) deployed everywhere, two new threads emerged: **RTP over QUIC (RoQ)** in the AVTCORE WG (draft-ietf-avtcore-rtp-over-quic, currently rev 14, in WGLC as of August 2025: [https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)), and **Media over QUIC (MoQ)**, a new pub/sub media transport designed to replace WebRTC and HLS (draft-ietf-moq-transport, currently rev 17 in March 2026, championed by Meta, Cisco, Google, Cloudflare: [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)). On 28 April 2026 NAB, eleven vendors — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — demoed first MoQ implementations ([https://www.red5.net/blog/what-is-moq-media-over-quic/](https://www.red5.net/blog/what-is-moq-media-over-quic/)). Cloudflare launched a beta MoQ relay service in early 2026 ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/), [https://developers.cloudflare.com/moq/](https://developers.cloudflare.com/moq/)). [The Mail Archive + 4](https://www.mail-archive.com/quic@ietf.org/msg03711.html)

The arc is one long pendulum swing between two philosophies: **(a) push UDP-based real-time stacks** with their own retransmit/ECN/feedback loops (RTP family, SRT, RIST, RoQ, WebRTC) and **(b) pull HTTP-based segmented stacks** that ride existing CDNs (HLS, DASH, LL-HLS, LL-DASH). MoQ is the first serious attempt to give the industry a single protocol that does both.

---

## Members and their roles

This list is the user's seed list, **verified, plus additions**. Member status (✓ verified, + added).

### Core IETF/W3C real-time stack

- **RTP — Real-time Transport Protocol (RFC 1889/1996, RFC 3550/2003) ✓.** The wire format. Every UDP-based real-time A/V packet on the internet is, almost certainly, an RTP packet (or a thin variant). 12-byte header carries version, padding, marker, payload type, sequence number, 32-bit timestamp, 32-bit SSRC. You reach for RTP when you need the lowest possible latency and are willing to engineer your own loss/jitter handling ([https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550)).
- **RTCP — RTP Control Protocol (RFC 3550) +.** Travels alongside RTP, typically on the next odd port. Carries Sender Reports (NTP wallclock + RTP timestamp pairing for cross-stream sync), Receiver Reports (loss, jitter, last SR, delay since last SR), Source Description (CNAME). The cost of RTCP is implementation complexity; the value is everything from A/V sync to congestion feedback.
- **SDP — Session Description Protocol (RFC 8866, 2021) ✓.** A text format for describing what the session contains: which codecs, which IPs/ports, which crypto, which extensions. Used by SIP (offer/answer), RTSP, WebRTC, WHIP/WHEP. Famous for being verbose and crufty; "munging the SDP" is a load-bearing pattern in real-world WebRTC apps.
- **SRTP — Secure RTP (RFC 3711, 2004) +.** Profile of RTP that adds AES-CM encryption, HMAC-SHA1 auth, and replay protection. Mandated by WebRTC ([https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711)). [Ant Media](https://antmedia.io/webrtc-security/)[Googlesource](https://webrtc.googlesource.com/src/+/refs/heads/lkgr/pc/g3doc/srtp.md)
- **ZRTP (RFC 6189) +.** Phil Zimmermann's keying protocol for SRTP, with in-band key negotiation and short authentication strings (SAS) read aloud by users. Used by Signal-derived voice, Silent Phone, some SIP softphones. Largely superseded in browser contexts by DTLS-SRTP.
- **SIP — Session Initiation Protocol (RFC 3261, 2002) ✓.** Signaling: how do two endpoints find each other, agree on a session, tear it down? The dominant signaling protocol of the VoIP era and IMS in cellular networks. Reach for SIP when you're integrating with phone networks, enterprise PBXs, or IMS.
- **WebRTC — Web Real-Time Communication (released by Google, May 2011) ✓.** Not a single protocol but a *bundle*: getUserMedia + RTCPeerConnection + RTCDataChannel APIs in W3C, layered on RTP/RTCP/SRTP/DTLS/SCTP/ICE/STUN/TURN at the IETF. The W3C 1.0 became a Recommendation in **January 2021** ([https://en.wikipedia.org/wiki/WebRTC](https://en.wikipedia.org/wiki/WebRTC)). [Wikipedia](https://en.wikipedia.org/wiki/WebRTC)[Wikipedia](https://en.wikipedia.org/wiki/WebRTC)

### Live broadcast / streaming push protocols

- **RTMP — Real-Time Messaging Protocol (Macromedia, July 2002) ✓.** TCP-based, originally for Flash. Killed for playback by Flash EOL on 31 December 2020, but stubbornly alive as the dominant **ingest** protocol for YouTube Live, Twitch, Facebook Live, every encoder vendor ([https://www.kaspersky.com/blog/life-and-death-of-adobe-flash/45906/](https://www.kaspersky.com/blog/life-and-death-of-adobe-flash/45906/), [https://getstream.io/blog/real-time-messaging-protocol/](https://getstream.io/blog/real-time-messaging-protocol/)). Reach for RTMP when you need to push a live feed into a platform from OBS or hardware encoders. [Flussonic](https://flussonic.com/blog/news/best-video-streaming-protocols)[EnterpriseTube](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)
- **SRT — Secure Reliable Transport (Haivision, 2013; open-sourced 2017, MPL-2.0) +.** UDP-based, derived from UDT. Configurable latency target (default 120 ms), AES-128/256, ARQ retransmits, optional FEC, connection bonding (SMPTE-2022-7 style). Used by ESPN, Microsoft, Al Jazeera, AWS, Cloudflare, Google Cloud, Sony, YouTube; SRT Alliance has 600+ members. Internet-Draft: draft-sharabayko-srt ([https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/](https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/), [https://en.wikipedia.org/wiki/Secure_Reliable_Transport](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)). The default contribution protocol for first-mile broadcast since ~2020. [Wikipedia + 2](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)
- **RIST — Reliable Internet Stream Transport (VSF, 2017) +.** Open *specification* (not a single implementation), built on RTP/RTCP for interoperability. Profiles: Simple (TR-06-1, 2018), Main (TR-06-2, 2020, updated 2024), Advanced (TR-06-3, 2021–2023). RIST distinguishes itself with multi-ISP hitless switching (SMPTE-2022-7 over the public internet) ([https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=142998](https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=142998), [https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport](https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport)). Reach for RIST when you need vendor-independent, broadcast-grade contribution. [Grokipedia](https://grokipedia.com/page/Reliable_Internet_Stream_Transport)[Streaming Media](https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=142998)
- **NDI — Network Device Interface (NewTek, 2015) +.** LAN-focused IP video for production. NDI 1.0 was pure TCP; NDI 4 (2019) added Multi-TCP; NDI 5 (July 2021) added reliable-UDP, NDI Bridge, NDI Remote. ~125–250 Mbps for HD/UHD streams over GigE. Used everywhere in live production and esports ([https://en.wikipedia.org/wiki/Network_Device_Interface](https://en.wikipedia.org/wiki/Network_Device_Interface)). [Wikipedia](https://en.wikipedia.org/wiki/Network_Device_Interface)
- **Zixi +.** Proprietary, RTP-based, with NACK and FEC. Direct competitor to SRT/RIST in broadcast contribution; coexists with RIST in some Broadcaster deployments ([https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport](https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport)).
- **H.323 (ITU-T, 1996) +.** ISDN-derived multimedia stack. Survives in enterprise hardware video conferencing (Cisco/Polycom legacy fleets) and in some carrier interconnects. Largely irrelevant to anything green-field after ~2010.

### HTTP-based pull streaming

- **HLS — HTTP Live Streaming (Apple, 2009) ✓.** RFC 8216 (2017), with later draft revisions by Roger Pantos extending to LL-HLS (2019), Interstitials (2021–), and v12+ in 2024–2025 ([https://developer.apple.com/streaming/HLS-draft-pantos.pdf](https://developer.apple.com/streaming/HLS-draft-pantos.pdf)). Native on iOS/Safari/Apple TV, supported by every player on every device. The default delivery protocol of the streaming internet.
- **DASH — Dynamic Adaptive Streaming over HTTP (ISO/IEC 23009-1) ✓.** First edition 2012, fifth edition published 2022 (5th edition: [https://www.iso.org/standard/83314.html](https://www.iso.org/standard/83314.html), [https://standards.iso.org/iso-iec/23009/-1/ed-5/en/](https://standards.iso.org/iso-iec/23009/-1/ed-5/en/)). Codec-agnostic, XML manifest (`MPD`). Dominant in non-Apple OTT (Netflix, Amazon Prime Video, etc.). [ISO](https://www.iso.org/standard/57623.html)
- **LL-HLS / LL-DASH +.** Low-latency variants. **LL-HLS** uses HTTP/2 push, "parts" of 250–500 ms, blocking playlist requests, delta playlists. Demonstrated under 2 s glass-to-glass at WWDC 2019 ([https://developer.apple.com/videos/play/wwdc2019/502/](https://developer.apple.com/videos/play/wwdc2019/502/)). **LL-DASH** uses chunked transfer encoding (CMAF-CTE) with chunks of ~0.5–2 s, achieving ~2 s glass-to-glass in production at vendors like Gcore ([https://gcore.com/blog/ll-hls-and-ll-dash-single-pipeline](https://gcore.com/blog/ll-hls-and-ll-dash-single-pipeline)). [Thebroadcastknowledge](https://thebroadcastknowledge.com/tag/roger-pantos/)[Gcore](https://gcore.com/blog/ll-hls-and-ll-dash-single-pipeline)
- **CMAF — Common Media Application Format (ISO/IEC 23000-19, 2018) +.** Apple+Microsoft's joint fMP4 packaging format, finally letting HLS and DASH share segments. Fifth edition of DASH (23009-1:2022) explicitly profiles CMAF ([https://dashif.org/news/5th-edition/](https://dashif.org/news/5th-edition/)). CMAF itself is a container, *not* a low-latency protocol; chunked CMAF + chunked transfer encoding is what enables LL-HLS / LL-DASH ([https://optiview.dolby.com/resources/blog/streaming/low-latency-chunked-cmaf/](https://optiview.dolby.com/resources/blog/streaming/low-latency-chunked-cmaf/)).

### WebRTC ingestion / egress

- **WHIP — WebRTC-HTTP Ingestion Protocol (RFC 9725, March 2025) +.** A simple HTTP POST that carries an SDP offer; the server returns 201 with an SDP answer. Designed to replace RTMP for first-mile WebRTC ingest, by Sergio Garcia Murillo (Millicast) and the late Alex Gouaillard (CoSMo Software) ([https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/), [https://www.rfc-editor.org/rfc/rfc9725.pdf](https://www.rfc-editor.org/rfc/rfc9725.pdf)). OBS shipped WHIP support in 2024; AWS IVS, Cloudflare Stream, and most CDNs now support it. [DEV Community](https://dev.to/deepak_mishra_35863517037/the-road-ahead-whip-whep-and-the-rise-of-ai-native-media-servers-4lo4)[IETF](https://datatracker.ietf.org/doc/rfc9725/)
- **WHEP — WebRTC-HTTP Egress Protocol +.** The mirror image of WHIP for stream playout, still an Internet-Draft (`draft-ietf-wish-whep`, [https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/)). [Telecom R & D](https://telecom.altanai.com/2026/03/17/obs-studio-webrtc-building-and-testing-ultra-low-latency-streaming/)

### QUIC-era newcomers

- **WebTransport (W3C / IETF) +.** A browser API for bidirectional client-server messaging over HTTP/3 with reliable streams *and* unreliable datagrams. Reached cross-browser **Baseline** in April 2026 with Safari support arriving in 18.4 (March 2025) ([https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/](https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/), [https://developers.cloudflare.com/moq/](https://developers.cloudflare.com/moq/)). [WebRTC.ventures](https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/)[Cloudflare](https://developers.cloudflare.com/moq/)
- **WebCodecs +.** Browser API for raw encode/decode access (H.264, VP9, AV1, Opus). The "missing piece" between MediaStream and the wire — letting apps build their own RTC stack on WebTransport.
- **RoQ — RTP over QUIC +.** AVTCORE WG draft, currently rev 14 in WGLC (Aug 2025) ([https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)). Maps RTP+RTCP to QUIC streams and DATAGRAMs, multiplexing multiple RTP sessions via flow IDs. The pragmatic path: keeps the entire RTP ecosystem but swaps UDP for QUIC, getting NAT-friendliness, encrypted transport, and pluggable congestion control "for free." [IETF](https://www.ietf.org/archive/id/draft-ietf-avtcore-rtp-over-quic-14.html)[IETF](https://datatracker.ietf.org/doc/html/draft-ietf-avtcore-rtp-over-quic)
- **MoQ / MoQT — Media over QUIC Transport +.** A *new* media transport designed from scratch as a publish/subscribe protocol over QUIC and WebTransport, with relays. Object-based data model: *track > group > subgroup > object*. draft-ietf-moq-transport-17 (March 2026), authors Nandakumar, Vasiliev, Swett, Frindell (Meta/Cisco/Google) ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)). Use cases span sub-second video conferencing to live broadcast at CDN scale. [Moq-wg](https://moq-wg.github.io/moq-transport/draft-ietf-moq-transport.html)[IETF](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)

### Codecs (not technically protocols but inseparable from this group)

- **Opus — RFC 6716 (2012) +.** SILK + CELT, 2.5–60 ms frames, 6–510 kbps. The mandatory-to-implement audio codec for WebRTC; powers Discord, WhatsApp, and PlayStation 4 voice ([https://en.wikipedia.org/wiki/Opus_(audio_format)](https://en.wikipedia.org/wiki/Opus_(audio_format))). [Opus Codec + 2](https://opus-codec.org/)
- **H.264 / AVC, H.265 / HEVC, VP8, VP9, AV1 +.** Video codecs. **AV1** (Alliance for Open Media, 2018) cuts bitrate ~30% vs HEVC and ~50% vs H.264 at equivalent quality, royalty-free in design. Real-time AV1 in WebRTC has been shipping in Chrome since v90 (2021); Google Meet uses it during pre-call bandwidth probing; Cisco Webex, Millicast/Dolby and Meta Messenger all ship AV1 RTC ([https://medium.com/millicast/its-time-for-real-time-av1-video-encoding-withwebrtc-75a6aa64777c](https://medium.com/millicast/its-time-for-real-time-av1-video-encoding-withwebrtc-75a6aa64777c), [https://webrtchacks.com/the-hidden-av1-gift-in-google-meet/](https://webrtchacks.com/the-hidden-av1-gift-in-google-meet/)). On 23 March 2026 Dolby Laboratories filed patent suits against Snap covering HEVC and AV1 in Snapchat — re-opening AV1's royalty-free claim ([https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/](https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/)). [Wikipedia + 2](https://en.wikipedia.org/wiki/AV1)

### Niche / supporting

- **MSRP — Message Session Relay Protocol (RFC 4975) +.** Real-time text/IM channel typically negotiated by SIP/SDP. Used in IMS and RCS deployments.
- **BFCP — Binary Floor Control Protocol (RFC 8855) +.** Conference floor control (who has the speaking token) in SIP-based videoconferencing.
- **SCTP-over-DTLS / data channels (RFC 8831/8832) +.** Underlies WebRTC's `RTCDataChannel`.
- **RTSP — Real-Time Streaming Protocol (RFC 2326/1998, RFC 7826/2016) +.** Application-layer "remote control" for media servers (PLAY/PAUSE/TEARDOWN). Marginal as an internet streaming protocol, but **the de facto standard for IP cameras and CCTV** ([https://datatracker.ietf.org/doc/rfc7826/](https://datatracker.ietf.org/doc/rfc7826/)). Reach for RTSP when ONVIF cameras are involved. [Ant Media](https://antmedia.io/rtsp-explained-what-is-rtsp-how-it-works/)[eyeson GmbH](https://blog.eyeson.com/what-is-rtsp-real-time-streaming-protocol)

### Key omissions

- **MQTT/AMQP** are *not* members. They do telemetry/IoT messaging and overlap negligibly with media transport.
- **HTTP/2/3 server push, WebSockets** are mostly transports underneath the protocols above.

---

## Internal taxonomy — how to mentally cluster the members

The group is best understood as a 2D space.

### Axis 1: Push (sender-driven) vs Pull (receiver-driven)

| Push (real-time, conversational) | Pull (segmented, scaled) |
|---|---|
| RTP, RTCP, SRTP, WebRTC | HLS, DASH, LL-HLS, LL-DASH |
| RTMP (ingest), SRT, RIST, NDI, Zixi |  |
| RoQ, MoQ (hybrid) |  |

### Axis 2: UDP-native vs TCP/HTTP-native

| UDP-native | TCP/HTTP-native | QUIC-native (UDP-but-not-RTP) |
|---|---|---|
| RTP, RTCP, SRT, RIST, WebRTC media, NDI (5+) | RTMP, RTSP control, HLS, DASH, NDI 1–4 | RoQ, MoQ, WebTransport |

### Axis 3: Function

| Signaling | Description | Media transport | Ingest signaling |
|---|---|---|---|
| SIP, H.323, custom WebSocket signaling | SDP, HLS m3u8 manifest, DASH MPD | RTP/SRTP, RTMP, SRT, RIST, HLS/DASH segments, MoQ | WHIP, WHEP, RTMP-as-ingest |

### Axis 4: Latency tier (typical glass-to-glass)

| Tier | Range | Members |
|---|---|---|
| Sub-second (conversational) | 100–500 ms | WebRTC, MoQ (target), RoQ, NDI on LAN |
| Few seconds (low-latency live) | 1–5 s | LL-HLS, LL-DASH, SRT/RIST in fast-mode, WHIP/WHEP, MoQ broadcast |
| Standard live | 5–30 s | HLS (default), DASH (default), RTMP→HLS pipelines |
| 30–90 s (current Super Bowl reality) | — | OTT live sports as commonly deployed ([https://www.tvtechnology.com/news/study-super-bowl-streaming-delays-top-60-seconds-on-many-streaming-platforms](https://www.tvtechnology.com/news/study-super-bowl-streaming-delays-top-60-seconds-on-many-streaming-platforms)) |

### Axis 5: Browser-native vs requires plugin / native

- Browser-native today: WebRTC (full), HLS (Safari, Chromium recently), DASH (via MSE+dash.js), WebTransport+WebCodecs (Baseline as of April 2026). HLS has launched as a native chromium player — see Joey Parrish's Demuxed 2025 talk ([https://2025.demuxed.com/](https://2025.demuxed.com/)). [Demuxed](https://2025.demuxed.com/)
- Requires native client / encoder: RTMP, SRT, RIST, NDI, Zixi, RTSP, MoQ (in 2026; browser path is via WebTransport+WebCodecs).

### Axis 6: Standardized vs vendor-controlled

- **IETF/W3C/ISO**: RTP, RTCP, SIP, SDP, SRTP, ICE/STUN/TURN, WebRTC, HLS, DASH, WHIP, WHEP, RoQ, MoQ, Opus, AV1.
- **Vendor-led but open spec**: SRT (Haivision/SRT Alliance), RIST (VSF), CMAF (Apple+Microsoft via MPEG).
- **Vendor-controlled**: RTMP (Adobe published spec 2012 but Adobe-owned), NDI (NewTek/Vizrt), Zixi.

### Axis 7: Reliable vs unreliable transport

- Unreliable underneath, app-level recovery: RTP/RTCP, SRT (ARQ+FEC), RIST, RoQ datagrams, WebRTC media, MoQ datagrams.
- Reliable underneath: RTMP (TCP), HLS/DASH (HTTP), WebRTC DataChannel ordered mode, MoQ streams.

### Decision tree

```
What problem are you solving?
├── Browser-to-browser conversation (≤500 ms)
│     → WebRTC. (Maybe MoQ in 2027 once browsers and servers ship.)
├── Encoder → platform first-mile contribution
│   ├── Public internet, high resilience needed → SRT or RIST
│   ├── Cloud-native ingest with WebRTC features (BWE, simulcast) → WHIP
│   └── Compatibility with everything that exists → RTMP(S) (still the default in 2026)
├── One-to-many live to web/mobile (≥1k viewers)
│   ├── Latency 10–30 s acceptable → HLS / DASH on commodity CDN
│   ├── Latency 2–5 s required → LL-HLS or LL-DASH (CMAF), or WebRTC SFU egress
│   └── Latency <1 s and large scale → MoQ (early adopter), or WebRTC fan-out (Phenix/Millicast/Cloudflare Calls)
├── IP camera / surveillance → RTSP/RTP, transcoded to HLS at edge
├── Studio LAN production → NDI (or SMPTE 2110 if you have 25 GbE+)
└── Legacy enterprise videoconferencing → SIP + RTP, or H.323 if forced
```

---

## How this group interacts with other protocol groups

```
Application                  WebRTC, SIP, RTSP, RTMP, MoQ apps, HLS players
Session/signaling            SIP, SDP, ICE, WHIP, WHEP, MoQ ANNOUNCE/SUBSCRIBE
Media framing                RTP / RTCP / SRTP / SRTCP, MPEG-TS, fMP4/CMAF, MoQ objects
Security                     DTLS-SRTP, TLS, certificates, JWT room tokens, MLS-for-media (proposed)
Web/API transport            HTTP/1.1, HTTP/2, HTTP/3, WebSockets, WebTransport, fetch
Transport                    UDP, TCP, QUIC, SCTP-over-DTLS (data channel)
Network                      IPv4, IPv6, IP multicast (Mbone-style, mostly intranet)
Link                         Ethernet, Wi-Fi, LTE, 5G, satellite (Starlink LEO)
```

**Depends on**: NAT traversal (STUN/TURN), TLS PKI, time sync (NTP for RTCP SR), CDN edges (HLS/DASH/MoQ), DNS, BGP. When BGP fails (Facebook 2021, Cloudflare 2022), real-time A/V is the most visible casualty because it's the most latency-sensitive.

**Depended on by**: cloud telephony (Twilio, Vonage, Telnyx), conferencing (Zoom, Teams, Meet, Webex), live streaming/OTT (Netflix, YouTube, Twitch, Disney+), interactive games (Discord voice, Stadia/GeForce Now/Luna), telehealth (Doximity, Teladoc), IoT/security cameras (Ring, Wyze, ONVIF ecosystem), spatial computing (Vision Pro, Quest).

The boundary with **MQTT/AMQP/Kafka** is sharp: those are message-bus protocols; they share zero wire-format DNA with this group. The only meaningful overlap is at the *application* layer where IoT devices send both telemetry (MQTT) and a/v (RTP/RTSP/WebRTC).

---

## Common patterns and failure modes

### Recurring design patterns

1. **Sequence numbers + timestamps.** Universal. Sequence numbers detect loss/reordering; timestamps drive playout. RTP's 16-bit seq + 32-bit timestamp + 32-bit SSRC is the canonical example (RFC 3550 §5.1).
2. **Jitter buffer with adaptive playout.** Receivers buffer ~30–200 ms (audio) or 1–6 frames (video), recomputing target depth from observed jitter histogram. WebRTC's NetEQ for audio adapts under loss with packet-loss concealment (PLC), time-scaling, and comfort noise generation.
3. **RTCP-style sender/receiver reports.** Periodic feedback loops: SR carries NTP↔RTP timestamp pairs for sync; RR carries fraction lost, cumulative lost, jitter, last-SR, delay-since-last-SR ([https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)). [Webex Blog](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)
4. **ICE candidate gathering + hole-punching + TURN fallback.** Gather host, server-reflexive (STUN), and relay (TURN) candidates, pair them, run STUN connectivity checks across the matrix, pick the lowest-priority path that works. TURN-relay fallback can spike costs catastrophically at enterprise scale.
5. **ABR ladders + manifest-driven switching.** HLS/DASH players maintain a 30-s history of segment download throughput, factor in buffer level, and switch ladder rungs. Bad ABR algorithms produce "ladder thrashing" — flipping every segment.
6. **Heartbeats / keepalives for NAT bindings.** Most NATs drop UDP mappings after 30–90 s of silence. RTCP, STUN consent freshness, or app-level keepalive is required.
7. **Out-of-band signaling vs in-band media.** Standard since SIP/SDP/RTP separation in the 90s. WebRTC made it dogma — JS apps free to use any signaling channel.
8. **SDP offer/answer.** RFC 3264 — symmetric exchange, with the offerer proposing capabilities and the answerer narrowing. Adopted by SIP, WebRTC, WHIP.
9. **Simulcast and SVC layer selection by SFUs.** SFU receives N quality layers, decides per-receiver which to forward based on bandwidth estimates. AV1 SVC is now the gold standard.
10. **FEC + retransmission tradeoffs.** FEC adds constant overhead (typically 10–25%) but recovers without RTT; ARQ is bandwidth-efficient on clean links but expensive on long RTTs. SRT 1.4+ exposes a packet-filter API to combine both ([https://github.com/Haivision/srt](https://github.com/Haivision/srt)). [GitHub](https://github.com/Haivision/srt)
11. **Pacing + congestion-control feedback.** Modern RTC paces packets at the encoder-rate (not bursty), uses RTCP TWCC (Transport-Wide Congestion Control) feedback, and runs GCC/NADA/SCReAM at the sender.

### Group-wide failure modes

- **NAT/firewall failure → TURN cost explosion.** Symmetric NATs / mobile carrier-grade NATs force TURN relay; relay traffic costs egress bandwidth at every TURN region. Twilio/Cloudflare/AWS all charge for it.
- **Asymmetric loss → cascade of retransmissions.** If forward path is fine but feedback path drops, NACK loops can amplify load.
- **Codec mismatch / negotiation failure.** "Black participant" — Safari sees no compatible codec from a Chrome H.264-only sender; SDP munging happened wrong; AV1 enabled but receiver doesn't have hardware decode.
- **Clock drift.** Senders and receivers run at slightly different sample rates. Without resampling, a 90 kHz video and 48 kHz audio drift apart over an hour. RTCP SR pairs are how you compensate.
- **ABR ladder thrashing.** Switching every segment makes the user perceive constant quality flicker; quality engineers tune hysteresis bands.
- **Head-of-line blocking on TCP/HTTP/2.** A single dropped TCP segment stalls *all* video, audio, and data streams sharing the connection. The whole reason QUIC exists for this group.
- **TURN server overload during a spike.** Common during big events; mitigated with global anycast TURN (Cloudflare, Twilio, Xirsys).
- **Cascading SFU failures.** A noisy participant or bug can cause SFU CPU saturation; without graceful shedding it cascades across rooms hosted on the same node. Mediasoup, Janus, and Jitsi all have well-documented patterns and antipatterns here. [Webflow](https://uploads-ssl.webflow.com/5c6853c495409838d874a0d2/5cbed66cae2b88609106befa_IPTComm_2018_LoadTesting-12%5B23229%5D.pdf)
- **CDN origin overload during big live events.** "Hollywood problem." Even with multi-CDN, manifest requests pile on the origin.

---

## Industry timeline

**1990s.** Mbone (1992) → RTP RFC 1889 (1996) → H.323 (1996) → RTSP (1998) → SIP RFC 2543 (1999). Tools: vat, vic, nv, sdr, wb. Architects: Jacobson, Casner, Frederick, Schulzrinne, Deering, Handley, Schooler, Rosenberg.

**Early 2000s.** RTMP debuts in Flash Communication Server 1.0 (July 2002). RFC 3261 (SIP, June 2002). Skype's P2P heyday begins. RFC 3550 (RTP, July 2003). Adobe acquires Macromedia (2005, $3.4B). YouTube launches (2005) on Flash/RTMP. SRTP standardized (RFC 3711, March 2004). [Castr + 3](https://castr.com/blog/history-of-rtmp-protocol/)

**Late 2000s.** iPhone ships without Flash (2007). HLS introduced with iPhone 3.0 (2009). Apple's first HLS draft published 2009. WebSockets RFC drafts (2008–2011). Justin.tv→Twitch rises on RTMP. [The Hustle](https://thehustle.co/010520221-adobe-flash)

**2010–2014.** Steve Jobs' "Thoughts on Flash" (April 2010). Google buys GIPS (May 2010). WebRTC open-sourced (May 2011). MPEG-DASH ratified (ISO/IEC 23009-1, 2012). Opus standardized (RFC 6716, September 2012). First cross-browser WebRTC video call (February 2013). HLS becomes RFC 8216 (2017), the first IETF Informational status. SRT first demoed at IBC 2013. [Wikipedia + 3](https://en.wikipedia.org/wiki/WebRTC)

**2015–2019.** SRT open-sourced at NAB 2017. RIST simple profile (TR-06-1, October 2018). HLS Pantos drafts continue. CMAF (ISO/IEC 23000-19, 2018). AV1 specification (March 2018). WebRTC deployed at scale by Discord, Houseparty, Whereby. LL-HLS announced at WWDC 2019.

**2020–2022.** Pandemic. Zoom 300M+ DAUs (April 2020). Zoom encryption controversy (March–June 2020): Zoom marketed "end-to-end encryption" but used TLS to its servers, settled with FTC in November 2020 ([https://theintercept.com/2020/03/31/zoom-meeting-encryption/](https://theintercept.com/2020/03/31/zoom-meeting-encryption/), [https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement](https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement)). WebRTC 1.0 W3C Recommendation (January 2021). Flash EOL (December 31, 2020). WHIP first IETF draft (2021). MoQ BoF and MOQ WG charter (2022). RFC 9000 (QUIC, May 2021), RFC 9114 (HTTP/3, June 2022). NDI 5 (July 2021). Insertable Streams ships in Chrome (2020) — enabling true E2EE behind SFUs ([https://webrtchacks.com/true-end-to-end-encryption-with-webrtc-insertable-streams/](https://webrtchacks.com/true-end-to-end-encryption-with-webrtc-insertable-streams/)). [The Intercept + 2](https://theintercept.com/2020/03/31/zoom-meeting-encryption/)

**2023–2026.**

- **2023**: First MoQ interop demos. Twitch deploys AV1 for top creators. Discord migrates fully to Opus + Pion-derived stack. RoQ draft progresses. [Wikipedia](https://en.wikipedia.org/wiki/AV1)
- **2024**: WHIP becomes broadly adopted by AWS IVS, Cloudflare, Twitch ([https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/](https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/)). OBS ships native WHIP. RTMP HEVC/HDR ingest deprecated by YouTube in favor of HLS ingest for premium content ([https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison](https://developers.google.com/youtube/v3/live/guides/ingestion-protocol-comparison)). Demuxed 2024 dominated by AV1, MoQ, SGAI, low-latency.
- **March 2025**: **WHIP becomes RFC 9725** ([https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/)). [IETF](https://datatracker.ietf.org/doc/rfc9725/)[The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg25392.html)
- **April 2025**: Safari 18.4 ships early WebTransport ([https://developers.cloudflare.com/moq/](https://developers.cloudflare.com/moq/)).
- **August 2025**: RoQ draft 14 enters WGLC ([https://www.mail-archive.com/quic@ietf.org/msg03711.html](https://www.mail-archive.com/quic@ietf.org/msg03711.html)). [The Mail Archive](https://www.mail-archive.com/quic@ietf.org/msg03711.html)
- **2025**: Cloudflare publishes "MoQ: Refactoring the Internet's real-time media stack" ([https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/)). Cloudflare acquires Dyte for client SDK; launches managed TURN, Calls, Realtime, MoQ relay beta ([https://bloggeek.me/cloudflare-2025/](https://bloggeek.me/cloudflare-2025/)). Justin Uberti leaves Clubhouse, joins OpenAI as Head of Realtime AI (November 2024). [Bloggeek](https://bloggeek.me/cloudflare-2025/)[X](https://x.com/juberti?lang=en)
- **March 2026**: MoQT draft 17. WebTransport reaches Baseline. AOMedia sees first patent litigation (Dolby v. Snap on AV1, 23 March 2026).
- **April 2026**: NAB Show — eleven vendors demo MoQ interop ([https://www.red5.net/blog/what-is-moq-media-over-quic/](https://www.red5.net/blog/what-is-moq-media-over-quic/)). [Red5](https://www.red5.net/blog/what-is-moq-media-over-quic/)

**Who is pushing development right now**:

- **Big tech**: Meta (MoQT lead authors, AV1 in Messenger, RSYS), Google (libwebrtc, AV1, Stadia heritage, TWCC, GCC), Apple (HLS, LL-HLS, FairPlay, WebTransport in Safari), Microsoft (Teams, AV1, WebTransport co-chair Bernard Aboba), Cisco (Webex, AV1, MoQ co-author), Netflix (DASH, AV1, per-title encoding), Twitch/Amazon (RTMP/WebRTC ingest, IVS, AV1), Cloudflare (Stream, Calls, MoQ relay, MASQUE), NVIDIA (codec ASICs).
- **Standards**: IETF AVTCORE, MMUSIC, MOQ WG, WISH (now done), RMCAT, MASQUE-adjacent; W3C WebRTC WG, Media WG; MPEG; DVB; SMPTE.
- **Open source**: libwebrtc (Google), Pion (Sean DuBois), webrtc-rs, mediasoup, Janus (Meetecho), Jitsi (8x8), GStreamer, FFmpeg, OBS Studio, LiveKit, Daily.

---

## Recommended learning paths (current as of May 2026)

A reasonable order: **(1) the IP / TCP-UDP/HTTP basics** (Kurose-Ross, Stanford CS144) → **(2) RTP family fundamentals** (RFC 3550, *WebRTC for the Curious*) → **(3) WebRTC end-to-end** (Loreto/Romano book, WebRTC for the Curious, MDN, Pion examples) → **(4) HLS/DASH and ABR** (Apple HLS docs, Mux blog, Demuxed talks) → **(5) the QUIC/MoQ frontier** (Cloudflare MoQ docs, MoQ drafts).

### Authoritative specifications

| Spec | URL | Year |
|---|---|---|
| RFC 3550 (RTP) | [https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550) | 2003 |
| RFC 3551 (RTP A/V profile) | [https://www.rfc-editor.org/rfc/rfc3551](https://www.rfc-editor.org/rfc/rfc3551) | 2003 |
| RFC 3711 (SRTP) | [https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711) | 2004 |
| RFC 3261 (SIP) | [https://datatracker.ietf.org/info/rfc3261](https://datatracker.ietf.org/info/rfc3261) | 2002 |
| RFC 8866 (SDP) | [https://www.rfc-editor.org/rfc/rfc8866](https://www.rfc-editor.org/rfc/rfc8866) | 2021 |
| RFC 8825 (WebRTC overview) | [https://www.rfc-editor.org/rfc/rfc8825](https://www.rfc-editor.org/rfc/rfc8825) | 2021 |
| RFC 8445 (ICE) | [https://www.rfc-editor.org/rfc/rfc8445](https://www.rfc-editor.org/rfc/rfc8445) | 2018 |
| RFC 8489 (STUN) | [https://www.rfc-editor.org/rfc/rfc8489](https://www.rfc-editor.org/rfc/rfc8489) | 2020 |
| RFC 8656 (TURN) | [https://www.rfc-editor.org/rfc/rfc8656](https://www.rfc-editor.org/rfc/rfc8656) | 2020 |
| RFC 9147 (DTLS 1.3) | [https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147) | 2022 |
| RFC 8216 (HLS) + Pantos drafts | [https://datatracker.ietf.org/doc/rfc8216/](https://datatracker.ietf.org/doc/rfc8216/), [https://developer.apple.com/streaming/HLS-draft-pantos.pdf](https://developer.apple.com/streaming/HLS-draft-pantos.pdf) | 2017–2025 |
| ISO/IEC 23009-1 (DASH 5th ed, free) | [https://standards.iso.org/iso-iec/23009/-1/ed-5/en/](https://standards.iso.org/iso-iec/23009/-1/ed-5/en/) | 2022 |
| RFC 9000 (QUIC) | [https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000) | 2021 |
| RFC 9114 (HTTP/3) | [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114) | 2022 |
| RFC 9725 (WHIP) | [https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/) | March 2025 |
| draft-ietf-wish-whep | [https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) | active |
| draft-ietf-avtcore-rtp-over-quic-14 (RoQ) | [https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/) | WGLC Aug 2025 |
| draft-ietf-moq-transport-17 (MoQT) | [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) | March 2026 |
| RFC 6716 (Opus) | [https://datatracker.ietf.org/doc/html/rfc6716](https://datatracker.ietf.org/doc/html/rfc6716) | 2012 |
| RFC 8298 (SCReAM) | [https://www.rfc-editor.org/rfc/rfc8298](https://www.rfc-editor.org/rfc/rfc8298) | 2017 |
| RFC 8698 (NADA) | [https://www.rfc-editor.org/rfc/rfc8698](https://www.rfc-editor.org/rfc/rfc8698) | 2020 |

### Books

- **Kurose & Ross, "Computer Networking: A Top-Down Approach", Chapter 9** — the canonical undergraduate intro. *Last updated: 8th ed. 2021* (Pearson).
- **Ilya Grigorik, "High Performance Browser Networking" (free online)** — Chapters 17–18 on WebRTC and DataChannel are still the best on-ramp. [https://hpbn.co/](https://hpbn.co/) — *last edition 2013, but specific chapters maintained on the public site through 2024*.
- **Loreto & Romano, "Real-Time Communication with WebRTC"** (O'Reilly, 2014) — historic but still useful for protocol layering.
- **Sinnreich & Johnston, "Internet Communications Using SIP"** — 2nd ed. 2006; aged but the only book-length authoritative SIP source.
- **Sergio Garcia Murillo, Lorenzo Miniero, Sean DuBois et al., "WebRTC for the Curious" (free, open-source, community-maintained)** — [https://webrtcforthecurious.com/](https://webrtcforthecurious.com/) — *book is updated continuously on GitHub; major chapter additions through 2024–2025*. The single best free deep-dive on WebRTC protocols.
- **MDN WebRTC API guides** — [https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) — *living documentation, updated 2025*.
- **MDN WebTransport guides** — [https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API) — *updated through 2026*.

### Academic papers (with stable links)

- Schulzrinne, Casner, Frederick, Jacobson, **"RTP: A Transport Protocol for Real-Time Applications"** (RFC 1889, January 1996) — [https://www.rfc-editor.org/rfc/rfc1889](https://www.rfc-editor.org/rfc/rfc1889)
- McCanne & Jacobson, **"vic: A Flexible Framework for Packet Video"** (ACM Multimedia 1995) — [https://dl.acm.org/doi/10.1145/217279.215315](https://dl.acm.org/doi/10.1145/217279.215315)
- Cardwell, Cheng, Gunn, Hassas Yeganeh, Jacobson, **"BBR: Congestion-Based Congestion Control"** (ACM Queue 14, 2016; CACM 60(2), 2017, DOI 10.1145/3009824) — [https://research.google/pubs/bbr-congestion-based-congestion-control-2/](https://research.google/pubs/bbr-congestion-based-congestion-control-2/) [ACM Digital Library](https://dl.acm.org/doi/10.1145/3009824)[ACM](https://cacm.acm.org/practice/bbr-congestion-based-congestion-control/)
- Carlucci, De Cicco, Holmer, Mascolo, **"Analysis and Design of the Google Congestion Control for Web Real-time Communication"** (MMSys 2016, DOI 10.1145/2910017.2910605) — [https://dl.acm.org/doi/10.1145/2910017.2910605](https://dl.acm.org/doi/10.1145/2910017.2910605)
- Karimi, Fouladi, Sivaraman, Alizadeh, **"Vidaptive: Efficient and Responsive Rate Control for Real-Time Video on Variable Networks"** (NSDI 2024 / arXiv 2309.16869) — [https://arxiv.org/abs/2309.16869](https://arxiv.org/abs/2309.16869)
- Valin, Vos, Terriberry, **"The Opus Codec"** (RFC 6716; expanded analysis arXiv:1602.04845) — [https://arxiv.org/pdf/1602.04845](https://arxiv.org/pdf/1602.04845)
- Zhu, Pan, Ramalho, Mena et al., **"NADA: A Unified Congestion Control Scheme for Real-Time Media"** (RFC 8698 / draft-ietf-rmcat-nada) — [https://www.rfc-editor.org/rfc/rfc8698](https://www.rfc-editor.org/rfc/rfc8698)
- Johansson & Sarker, **"SCReAM"** (RFC 8298) — [https://www.rfc-editor.org/rfc/rfc8298](https://www.rfc-editor.org/rfc/rfc8298)
- Engelbart, Ott, Dawkins, **"RTP over QUIC"** (Internet-Draft, 2023–2025) — [https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)

### Engineering blog series (current and worth subscribing)

- **Cloudflare blog** — Stream/Calls/MoQ posts, June 2022 outage post-mortem, MoQ launches. [https://blog.cloudflare.com/moq/](https://blog.cloudflare.com/moq/) (2025), [https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/](https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/) (2022). *Updated continuously.*
- **webrtcHacks** by Tsahi Levent-Levi, Philipp "Fippo" Hancke, Chad Hart — [https://webrtchacks.com/](https://webrtchacks.com/). Standout pieces: "True End-to-End Encryption with WebRTC Insertable Streams" (2020), "The Hidden AV1 Gift in Google Meet" (2023), "Is everyone switching to MoQ?" (2025), "WebCodecs, WebTransport, and the Future of WebRTC" (2024). *Updated through 2026.*
- **BlogGeek.me** by Tsahi Levent-Levi — [https://bloggeek.me/](https://bloggeek.me/). "Cloudflare 2025 video services" (2025) and ongoing WebRTC industry reports.
- **WebRTC.ventures** — [https://webrtc.ventures/](https://webrtc.ventures/). *2026 posts on AV1, MoQ predictions, WebTransport baseline.*
- **Mux blog** — [https://www.mux.com/blog](https://www.mux.com/blog). Standout: "The community gave us low-latency live streaming. Then Apple took it away." (2019, but still the best LL-HLS context).
- **Wowza, Haivision, Dolby OptiView (THEOplayer), Bitmovin, Akamai, Fastly, Gcore** — all maintain broadly useful protocol education content.
- **Discord engineering** — Elixir/Rust voice infrastructure posts. [https://discord.com/category/engineering](https://discord.com/category/engineering)
- **Netflix Tech Blog** — adaptive streaming, encoding, per-title, Open Connect. [https://netflixtechblog.com/](https://netflixtechblog.com/)
- **Meta engineering** — RSYS, Workplace live, AV1 in Messenger.
- **Twitch engineering** — LL-HLS, ingest, AV1.
- **Daily.co blog** — [https://www.daily.co/blog](https://www.daily.co/blog) (mediasoup-based SFU practice).
- **100ms / Vonage / Stream blogs** — practitioner content on SFUs, scaling.
- **FOX Tech**, "Overview of FOX's Resilient, Low Latency Streaming Video Architecture for Super Bowl LIV" (2020) — [https://medium.com/fox-tech/overview-of-foxs-resilient-low-latency-streaming-video-architecture-for-super-bowl-liv-e51c2e41063c](https://medium.com/fox-tech/overview-of-foxs-resilient-low-latency-streaming-video-architecture-for-super-bowl-liv-e51c2e41063c) — instructive in describing real CDN-decisioning.

### Conference talks and channels

- **Demuxed** — [https://www.demuxed.com/](https://www.demuxed.com/) — annual since 2015, the video engineering conference. 2024 was the 10th edition; 2025's program included MoQ talks ("MoQ me, don't WebRTC me") and HLS-in-Chromium native player. [https://2024.demuxed.com/](https://2024.demuxed.com/), [https://2025.demuxed.com/](https://2025.demuxed.com/). [YouTube](https://www.youtube.com/@Demuxed)[Content + Technology](https://content-technology.com/events/demuxed-2024-the-conference-for-video-engineers/)
- **Kranky Geek** — annual WebRTC summit; archives on YouTube.
- **RealTimeConf** — newer cross-disciplinary conference on real-time tech.
- **Mile High Video, Streaming Media West/East, IBC, NAB, TPAC, IETF AVTCORE/MOQ/MMUSIC** — for working-group sessions and industry talks.
- **Apple WWDC sessions** by Roger Pantos: "Introducing Low-Latency HLS" (WWDC 2019, [https://developer.apple.com/videos/play/wwdc2019/502/](https://developer.apple.com/videos/play/wwdc2019/502/)), "Creating Advanced Media Experiences with HLS" (Streaming Media West 2018), Interstitials 2021–2024.
- **YouTube channels**: Demuxed ([https://www.youtube.com/@Demuxed](https://www.youtube.com/@Demuxed)), WebRTC.ventures *WebRTC Live*, Kranky Geek, Akamai, Bitmovin, Mux. Specific recommendations: Sean DuBois "WebRTC: The Secret Power You Didn't Know Go Has" (Conf42 GoLang 2021), Anurag Dhingra (Cisco) "AV1 in Webex" demo.

### Podcasts

- **Demuxed (the podcast)** — [https://podcasts.apple.com/us/podcast/demuxed/id1156304199](https://podcasts.apple.com/us/podcast/demuxed/id1156304199) — episodes #15 on LL-HLS, #16 on real-time tiers (Kwindla Hultman Kramer), #20 / #21 conference previews. [YouTube](https://www.youtube.com/watch?v=IB_xpnGvfCs)[Apple Podcasts](https://podcasts.apple.com/us/podcast/demuxed/id1156304199)
- **Software Engineering Daily** — periodic episodes on streaming and WebRTC.
- **Stack Overflow Podcast** — occasional video-tech episodes.

### University courses (2024–2026 syllabi)

- **Stanford CS144** "Introduction to Computer Networking" — [https://cs144.github.io/](https://cs144.github.io/) — implements TCP from scratch; foundational. *Updated through 2024–2025.*
- **MIT 6.829 / 6.5660** "Computer Networks" — research seminar style with current papers. *Hany Balakrishnan and Mohammad Alizadeh teaching as of 2024–2025.*
- **CMU 15-441 / 15-641** "Computer Networks" — [https://www.cs.cmu.edu/~prs/15-441-F24/](https://www.cs.cmu.edu/~prs/15-441-F24/) — *Fall 2024 / 2025 offerings.*
- **Princeton COS 461** "Computer Networks" — *Jen Rexford, current syllabus 2024–2025.*
- **UC Berkeley CS 168** "Introduction to the Internet" — *Sylvia Ratnasamy / Scott Shenker; Spring 2025 offered.*

### Hands-on tools

- **Wireshark** with built-in RTP/RTCP analysis, RTP stream graph, RTP Player. [https://wiki.wireshark.org/RTP](https://wiki.wireshark.org/RTP) — *current.*
- **Chrome's `chrome://webrtc-internals`** — every getStats() metric, every ICE candidate, GCC bandwidth probes. The single most important debugging tool in WebRTC.
- **GStreamer** — pipeline-based; first-class RIST, WHIP, WHEP, RTP, SRT, NDI elements. [https://gstreamer.freedesktop.org/](https://gstreamer.freedesktop.org/).
- **FFmpeg** — `ffmpeg -re -i input.mp4 -c copy -f rtp rtp://...` for RTP, plus RTMP, SRT, RIST, WHIP outputs (whip muxer in 7.1+). [https://ffmpeg.org/](https://ffmpeg.org/).
- **OBS Studio** with **WHIP** output (since 30.x, 2024). [https://obsproject.com/](https://obsproject.com/).
- **Pion** (Go) — [https://github.com/pion/webrtc](https://github.com/pion/webrtc). Maintained by Sean DuBois (LiveKit Field CTO as of 2024). Includes example apps for SIP↔WebRTC bridging, broadcasting, recording. [Conf42](https://www.conf42.com/Golang_2021_Sean_Dubois_WebRTC_secret_power)[LinkedIn](https://lv.linkedin.com/posts/sean-dubois_github-pionwebrtc-pure-go-implementation-activity-6956254392949825536-bdac)
- **mediasoup** — [https://mediasoup.org/](https://mediasoup.org/). C++ + Node.js SFU.
- **Janus Gateway** (Meetecho) — [https://github.com/meetecho/janus-gateway](https://github.com/meetecho/janus-gateway). Plugin-based. [Digital Samba](https://www.digitalsamba.com/blog/why-janus-is-digital-sambas-favorite-sfu)
- **Jitsi Meet / Videobridge** — [https://jitsi.org/](https://jitsi.org/). End-to-end SFU stack with full UI. [Meetrix](https://meetrix.io/blog/webrtc/introduction.html)
- **LiveKit** — [https://livekit.io/](https://livekit.io/). Built on Pion; SFU + cloud + agents framework.
- **Cloudflare Calls / Realtime** — [https://developers.cloudflare.com/realtime/](https://developers.cloudflare.com/realtime/). Managed SFU + TURN + MoQ.
- **AWS Chime SDK demos** — [https://github.com/aws/amazon-chime-sdk-js](https://github.com/aws/amazon-chime-sdk-js).
- **AWS IVS** — [https://aws.amazon.com/ivs/](https://aws.amazon.com/ivs/) — supports both RTMP and WHIP ingest.
- **MoQ implementations to play with**: kixelated/moq-rs (Luke Curley), Cisco/Meta interop demos, Cloudflare MoQ Beta ([https://developers.cloudflare.com/moq/](https://developers.cloudflare.com/moq/)).

---

## Where things are heading (2025–2026 frontier)

**Active drafts, prioritized.**

1. **MoQ Transport (MoQT)** — draft-ietf-moq-transport-17 (March 2026). Pub/sub data model with relays; objects organized into subgroups, groups, tracks, namespaces. Champions: Meta (Suhas Nandakumar, Alan Frindell), Cisco (Cullen Jennings), Google (Ian Swett), Cloudflare. Also note the **Luke Curley "moq-lite" fork** (draft-lcurley-moq-lite-04, November 2025), which argues MoQT became too committee-driven and proposes a stripped-down variant — a sign that even the inner circle disagrees on scope. ([https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)) [IETF](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
2. **RTP over QUIC (RoQ)** — draft-ietf-avtcore-rtp-over-quic-14, in WGLC since August 2025; expected to become an RFC in 2026. The conservative path: keep RTP, swap UDP for QUIC.
3. **WebRTC-NV / WebTransport+WebCodecs** — Bernard Aboba (Microsoft, W3C WebRTC WG co-chair) and others have been pushing components like Encoded Transform / Insertable Streams, Breakout Box (mediacapture-transform), and pairing with WebTransport. WebTransport reaching Baseline (April 2026) is the inflection point.
4. **WHEP** — close to final. Industry has effectively shipped it ahead of standardization, including in OBS, Cloudflare, AWS IVS.
5. **AV1 / VVC / LCEVC adoption.** AV1 is now baseline-deployed: Chrome, Firefox, Safari (with hardware decode on Apple Silicon and recent iPhones), Android; libaom-RT and SVT-AV1 (4.0.0 January 2026) are mature; Visionular Aurora1, NVIDIA NVENC AV1, Intel Arc, AMD AV1 hardware encode all shipping. Twitch deployed AV1 to top creators (2022–2023). Tsahi Levent-Levi predicts AV1 dominance arrives ~2028, not 2026 ([https://webrtc.ventures/2025/12/five-webrtc-predictions-for-2026-tsahi-levent-levi-on-av1-moq-and-what-might-break-next/](https://webrtc.ventures/2025/12/five-webrtc-predictions-for-2026-tsahi-levent-levi-on-av1-moq-and-what-might-break-next/)). **Dolby's March 2026 patent suit against Snap targeting AV1+HEVC** is a serious shock to the AV1 royalty-free narrative — watch this through 2026 ([https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/](https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/)). [Wikipedia](https://en.wikipedia.org/wiki/AV1)[WebRTC.ventures](https://webrtc.ventures/2025/12/five-webrtc-predictions-for-2026-tsahi-levent-levi-on-av1-moq-and-what-might-break-next/)
6. **End-to-end encryption for SFUs.** Insertable Streams + an external key-distribution mechanism (Google's "MLS for media" / SFrame, draft-omara-sframe). Production today in Jitsi (E2EE via Insertable Streams), Cloudflare Realtime (beta), Meet (limited), Zoom (post-2020 redesign). Standardization is incomplete but adoption is strong.
7. **Spatial audio / metaverse.** RTP payload formats for IVAS (3GPP, 2024) and AOM's IAMF (Immersive Audio Model and Formats). 6-DoF audio over WebRTC is being prototyped at Apple and Meta.
8. **The fate of HLS/DASH as MoQ matures.** **Apple has not endorsed MoQ.** They continue to invest in LL-HLS Interstitials, partial segments, rendition reports. The MoQ camp (Meta/Cisco/Google/Cloudflare) is openly positioning MoQ as a *replacement* for both WebRTC and HLS/DASH. Cloudflare's January 2025 MoQ blog drew direct rebuttals from webrtcHacks ("Is everyone switching to MoQ?", [https://webrtchacks.com/is-everyone-switching-to-moq/](https://webrtchacks.com/is-everyone-switching-to-moq/)) noting that "We're joining Meta, Google, Cisco" overstates corporate consensus.
9. **AI-driven encoding.** Per-title and per-shot encoding (Netflix-style), neural enhancement (super-resolution upsampling at decode time, e.g., Twitch's research). AI agent voice (OpenAI Realtime API) is the breakout RTC use case of 2024–2026; Justin Uberti now leads it.
10. **CDN-edge transcoding economics.** Rapidly making LL-HLS at scale viable; same trend pulls real-time AI inference to the edge.

**What will be obsolete by 2030?**

- Pure RTMP-for-everything (already there; 2030 is just the long tail).
- H.323 outside legacy enterprise refresh cycles.
- RTSP/RTP for anything except IP cameras.
- DASH may consolidate into HLS-shaped delivery via CMAF, or both into MoQ — uncertain.
- Single-vendor proprietary contribution protocols (Zixi, others) under pressure from RIST/SRT.
- Standalone TURN as a billable service may shrink as MoQ/WebTransport reduce P2P demands.

**Where the money is going.** Cloudflare (Realtime, MoQ, Dyte acquisition), Meta (MoQ, AV1, RSYS), Microsoft (Teams, WebTransport co-chair), Google (libwebrtc, AV1, BBRv3, GCC-NG), Apple (LL-HLS interstitials, SVE, hardware decode), AWS (IVS, Chime SDK, MediaLive), NVIDIA (codec ASICs). On the open-source side: LiveKit, mediasoup, Pion, Janus, Jitsi.

---

## Hooks for the article, infographic, and podcast

### 60-second narrated hook (written for the ear)

> Every time you join a video call, you are quietly running a 30-year-old experiment. In March of 1992, twenty researchers gathered around their workstations and watched each other talk. The audio was scratchy. The video was the size of a postage stamp. But it was the first time the internet had ever carried a live face from one continent to another — and the protocol they invented that week, called RTP, is still inside your laptop right now, doing the same job.
> 
> Today that protocol moves billions of minutes a day. It runs Zoom and Google Meet, Discord voice, the FaceTime call from your kid's hospital room, the AI that answers your phone. And right now, in a quiet IETF working group, the people who built it are about to replace it. The successor — Media over QUIC — wants to deliver a Super Bowl with the speed of a phone call, on a network that wasn't built for either. Whether they pull it off will decide what "live" means for the next decade.

### Striking statistic

In Phenix's 2025 Super Bowl latency study across seven major streaming services, the **best** stream (Tubi) lagged the field of play by **41 seconds**; the worst (Fubo) by **78 seconds**. Cable averaged **50 seconds**; over-the-air **22 seconds**. Real-time streaming has *not* caught up to the broadcast it was supposed to replace. ([https://www.tvtechnology.com/news/study-super-bowl-streaming-delays-top-60-seconds-on-many-streaming-platforms](https://www.tvtechnology.com/news/study-super-bowl-streaming-delays-top-60-seconds-on-many-streaming-platforms))

### "Pause and think" moment

The single dominant audio codec on the open internet — Opus — was **born from a corporate merger**. Skype's secret SILK codec for narrow-band speech was donated by Microsoft. Xiph's CELT codec for music was developed by hobbyists at Mozilla and Octasic. The IETF locked them in a room and made them produce one codec, RFC 6716, in September 2012. That single artifact — a hybrid of voice IP and free-software music — is now the audio inside Discord, WhatsApp, FaceTime audio, PlayStation 4 voice chat, every WebRTC application, and the OpenAI Realtime API. ([https://datatracker.ietf.org/doc/html/rfc6716](https://datatracker.ietf.org/doc/html/rfc6716), [https://en.wikipedia.org/wiki/Opus_(audio_format)](https://en.wikipedia.org/wiki/Opus_(audio_format)))

### Failure-story arc (clean dramatic sequence)

**Title: 31 minutes that aged a decade — Cloudflare, 21 June 2022.**

- **Setup.** Cloudflare carries roughly a fifth of the World Wide Web. They are 18 months into a project to retrofit their busiest 19 data centers — Amsterdam, London, Frankfurt, Tokyo, Newark, Ashburn — with a more resilient "spine" architecture. The change tonight is small: standardize a few BGP communities. Multiple engineers peer-review the diff. The change is broken into stepped rollouts. It looks safe.
- **Mistake.** In the diff format, the *terms of one BGP prefix list got reordered*. The reorder turned a permit into the wrong scope. At 06:27 UTC on a Tuesday, the prefix advertisements that tell the rest of the internet "we are Cloudflare; route here" *vanished* from those 19 cities.
- **Consequence.** Although only 4% of Cloudflare's network was affected, those 19 cities handle 50% of Cloudflare's daily request volume. Discord's voice rooms went silent mid-sentence. Fitbit dashboards froze. Shopify's checkout returned 502s. Even Downdetector, which depends on Cloudflare, went dark — the internet's "is it just me?" oracle silenced. Network engineers who logged in to fix the data centers found *they could not reach them*, because they too went through the broken edge. As they began rolling back, "engineers walked over each other's changes, reverting the previous reverts," reintroducing the bug sporadically. ([https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/](https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/))
- **Resolution.** A coordinated, single-channel rollback is finally executed. By 07:42 UTC — 75 minutes after impact, 31 minutes after first data-center recovery — every site is back. Cloudflare publishes a post-mortem the same day promising more granular rollouts, better diff formats, and a global kill switch for BGP changes. The lasting lesson is that the internet's real-time fabric — the part that carries voices and faces — is unforgivingly intolerant to even *internal* outages of its delivery substrate. Real-time A/V failures are no longer separate from "internet outages." They are the *most visible* internet outages.

Adjacent dramatic candidates the producer can pick from:

- **Fastly, 8 June 2021** — a single customer's valid configuration change triggered a latent bug, returning errors for 85% of Fastly's network for ~49 minutes; The New York Times, Reddit, Twitch, Hulu, the UK gov.uk site went dark globally ([https://www.fastly.com/blog/summary-of-june-8-outage](https://www.fastly.com/blog/summary-of-june-8-outage)).
- **Facebook BGP outage, 4 October 2021** — a maintenance command pulled WhatsApp/Instagram/Messenger off the internet for 6+ hours; voice and video calls of 3.5B users died simultaneously; Facebook engineers locked out of buildings because the badge readers ran on the same DNS ([https://blog.cloudflare.com/october-2021-facebook-outage/](https://blog.cloudflare.com/october-2021-facebook-outage/), [https://en.wikipedia.org/wiki/2021_Facebook_outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)).
- **Twitch source-code leak, October 2021** — a server config change exposed 125 GB of source, internal tools, and creator payouts to a 4chan post; revealed that the service's RTMP-based ingest stack was pivoting to WebRTC/Pion (Sean DuBois had recently joined Twitch) ([https://blog.twitch.tv/en/2021/10/15/updates-on-the-twitch-security-incident/](https://blog.twitch.tv/en/2021/10/15/updates-on-the-twitch-security-incident/), [https://techcrunch.com/2021/10/06/hacker-leaks-twitch-source-code-and-creator-payout-data/](https://techcrunch.com/2021/10/06/hacker-leaks-twitch-source-code-and-creator-payout-data/)).
- **Zoom encryption controversy, March–November 2020** — Zoom's marketed "end-to-end encryption" was actually transport encryption to Zoom servers; The Intercept reported it 31 March 2020; FTC settlement 9 November 2020; full E2EE shipped (optionally) October 2020 — a forcing function for the entire industry to adopt **Insertable Streams** for true SFU-friendly E2EE ([https://theintercept.com/2020/03/31/zoom-meeting-encryption/](https://theintercept.com/2020/03/31/zoom-meeting-encryption/), [https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement](https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement)).
- **The Flash funeral, 31 December 2020** — Macromedia/Adobe Flash hits end-of-life after 25 years. The first generation of internet video — Newgrounds, YouTube, Hulu, Twitch — built on RTMP and Flash, suddenly has to migrate playback to HLS overnight. The protocol survives as ingest-only, a zombie that still runs 90%+ of live streams in 2026 ([https://www.kaspersky.com/blog/life-and-death-of-adobe-flash/45906/](https://www.kaspersky.com/blog/life-and-death-of-adobe-flash/45906/), [https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained](https://enterprisetube.com/blog/what-is-rtmp-real-time-messaging-protocol-explained)).

---

## Caveats

- **Sourcing freshness.** The IETF drafts cited (MoQT-17, RoQ-14, MoQ-Lite-02/04) are *active and changing*. Anything stated about MoQ's exact data model could be different by the next IETF meeting; verify against datatracker before publishing technical content.
- **Forward-looking quotes vs facts.** Predictions about MoQ replacing WebRTC and HLS — including in the Cloudflare 2025 blog and various industry posts — are contested. The webrtcHacks rebuttal flags this directly. Where this report says "MoQ aims to ..." it reflects working-group ambition, not deployment reality. As of May 2026, MoQ has interop demos but no consumer-scale deployment.
- **Patents.** AV1's "royalty-free" status is now under legal challenge (Dolby v. Snap, March 2026). HEVC has long had a similar overhang. Codec choices made today carry legal risk that did not exist in earlier reports of this group.
- **Latency numbers.** Stated latency tiers (sub-second, few seconds, 10–30 s) are *typical* values under reasonable conditions, not guarantees. Real-world deployments routinely fall outside them; the Phenix Super Bowl studies show 60+ seconds of OTT latency in production despite vendors marketing "low-latency" stacks.
- **Vendor sources.** Many sources cited (Wowza, Haivision, Cloudflare, Mux, Bitmovin, Dolby, Castr, Antmedia) are vendors with skin in the game. Their technical content is generally accurate but their narrative framing favors their products. Cross-reference with IETF drafts, RFCs, ISO standards, and academic papers wherever possible.
- **AI-generated and aggregator content.** Some links found during research (e.g., Grokipedia, certain Medium posts dated 2026) are partly AI-generated. Where their factual claims aligned with primary sources (RFCs, vendor docs) the content is included; otherwise omitted.
- **`[needs source]` items.** A few claims would benefit from a primary source I did not locate in this pass: (a) exact Discord MAU/DAU figures and codec migration timeline `[needs source]`; (b) Justin Uberti's pre-WebRTC AOL/AIM tenure dates beyond 1997–2006 `[needs source]`; (c) precise SVT-AV1 and dav1d performance vs hardware encoders for *real-time* (not VOD) workloads in 2026 `[needs source]`.
- **Currency of WebTransport "Baseline".** The April 2026 statement that WebTransport has reached cross-browser Baseline is sourced from WebRTC.ventures and Cloudflare; treat as accurate but verify against caniuse.com and the Web Platform Dashboard at publication time, since browser status can shift week to week.