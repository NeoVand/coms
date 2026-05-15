---
id: realtime-av
type: category
name: Real-Time A/V
description: Protocols optimized for streaming audio and video in real-time. They prioritize low latency over perfect delivery — a dropped frame beats a frozen screen.
podcast_target_minutes: 30
protocols: [webrtc, rtp, sip, hls, rtmp, sdp, dash]
related_pioneers: [henning-schulzrinne, van-jacobson, jonathan-rosenberg, justin-uberti]
related_book_chapters:
  - 07-realtime-av/00-rtp-and-rtcp
  - 07-realtime-av/01-webrtc
  - 07-realtime-av/02-sip-and-sdp
  - 07-realtime-av/03-hls-and-dash
  - 07-realtime-av/04-moq-transport
related_outages: [facebook-2021]
related_frontier: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/AT%26T_Picturephone_%2812721549765%29.jpg/500px-AT%26T_Picturephone_%2812721549765%29.jpg"
    caption: "AT&T's Picturephone — decades before WebRTC, the dream of seeing the person you're talking to drove protocol innovation across analog circuits and packet networks."
    credit: "Photo: Mike Mozart / CC BY 2.0, via Wikimedia Commons"
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Polycom_VSX_7000_with_2_video_conferencing_screens.JPG/500px-Polycom_VSX_7000_with_2_video_conferencing_screens.JPG"
    caption: "A Polycom VSX 7000 conferencing rig — expensive specialised hardware that WebRTC replaced with a browser tab and a webcam."
    credit: "Photo: BrokenSphere / CC BY-SA 3.0, via Wikimedia Commons"
visual_cues:
  - "A two-axis grid of the seven protocols. Vertical axis Push versus Pull. Horizontal axis UDP-native versus TCP/HTTP-native. WebRTC, RTP and RTMP cluster on Push; HLS and DASH on Pull. SIP and SDP sit on a separate Signalling shelf above. MoQ floats in a hybrid corner."
  - "A horizontal latency ruler with four bands — sub-second, one to five seconds, five to thirty seconds, thirty to ninety seconds. WebRTC pinned at the left, LL-HLS and SRT in the middle, default HLS and DASH at five to thirty, and a Super Bowl flag at sixty seconds where the 2025 Phenix study landed."
  - "The WebRTC bundle as an exploded diagram. A JavaScript box at the top labelled getUserMedia and RTCPeerConnection. Below it five blocks side by side — SDP for negotiation, ICE/STUN/TURN for NAT traversal, DTLS for keys, SRTP for encrypted media, SCTP for data channels — all sitting on UDP."
  - "Adaptive bitrate ladder. Four pre-encoded copies of the same video on the left at 1080p/5 Mbps, 720p/2.5 Mbps, 480p/1 Mbps, 360p/500 Kbps, each chopped into two-to-ten-second segments. A manifest in the middle. A player on the right switching rungs as a wifi-strength meter wobbles."
  - "A timeline running 1973 to 2026 with seven pins. 1973 Network Voice Protocol on ARPANET. 1992 first Mbone IETF broadcast. 1996 RFC 1889 (RTP). 1999 RFC 2543 (SIP). 2002 RTMP in Flash. 2009 HLS with iPhone 3.0. 2011 WebRTC open-sourced by Google. 2021 WebRTC 1.0 W3C Recommendation. 2026 NAB MoQ interop with eleven vendors."
  - "A jitter buffer cross-section. Ragged packets arriving on the left at 18, 25, 17, 30, 16 milliseconds. A small FIFO box absorbing the variation. Smooth packets leaving on the right at exactly 20-millisecond intervals."
  - "The RTMP zombie. A tombstone marked Flash, 31 December 2020. From under it a hand reaches up labelled RTMP-as-ingest, with arrows feeding YouTube Live, Twitch, Facebook Live, AWS IVS."
---

# Real-Time A/V

## In one breath

Real-Time A/V is the family of protocols that lets a packet-switched network — built for files — carry the human voice and the human face. Seven of them sit here: RTP, SIP, SDP, RTMP, HLS, DASH, and WebRTC. They all answer the same design question in the same way. Voice and video tolerate loss surprisingly well but tolerate delay very poorly. So a dropped frame beats a frozen screen, and every protocol in this group throws away packets, redundancy, and complexity to keep latency low.

## The pitch

Every time you join a video call, you are quietly running a thirty-year-old experiment. In March 1992, twenty researchers gathered around their workstations and watched each other talk over the Mbone. The audio was scratchy, the video was the size of a postage stamp — but it was the first time the internet had carried a live face from one continent to another. The protocol they invented that week, called RTP, is still inside your laptop right now, doing the same job. It runs Zoom and Google Meet, Discord voice, the FaceTime call from your kid's hospital room, the AI that answers your phone. And right now, in a quiet IETF working group, the people who built it are about to replace it.

## The arc

Real-time audio and video over IP is a thirty-five-year engineering project to retrofit the file-sharing internet into a circuit-switched-network replacement. The arc is one long pendulum swing between two philosophies. On one side, push-based UDP stacks with their own retransmit and feedback loops — the RTP family, SRT, RIST, WebRTC. On the other, pull-based HTTP segmented stacks that ride existing CDNs — HLS, DASH, and their low-latency variants. Every protocol in this category is somewhere on that pendulum.

### The Dream of Real-Time

In 1973, researchers at MIT's Lincoln Laboratory transmitted live voice over the ARPANET using the Network Voice Protocol. The audio was choppy and the latency unpredictable, but it proved the point — a packet-switched network could carry more than data. The fundamental challenge that everything in this category answers was already visible. A 200-millisecond delay makes conversation awkward; a single dropped video frame is invisible. This is the exact opposite of file transfer, where every byte matters but timing does not. We unpack this in the RTP episode, which is paired with the chapter on RTP and RTCP in the book.

### The Mbone era and the birth of RTP

Between 1990 and 1995 the foundations were laid at three labs — Xerox PARC, Lawrence Berkeley National Lab, and USC/ISI. Steve Deering had invented IP multicast in 1989 with RFC 1112. Van Jacobson at LBL, Steve Casner at ISI, and Ron Frederick at PARC built the audio and video tools that ran on top of it — vat, vic, wb, nv, sdr — over a virtual multicast overlay called the Mbone. The first significant Mbone use was the IETF meeting in San Diego on 16 to 20 March 1992, watched by twenty sites. By 1994 the Rolling Stones broadcast a concert over it. In January 1996 Schulzrinne, Casner, Frederick, and Jacobson generalised what they had each implemented into RFC 1889, the Real-time Transport Protocol. RTP was revised as RFC 3550 in July 2003, and it remains the workhorse to this day. Frederick later said he regretted RTCP's complexity.

### The VoIP standards war — SIP versus H.323

The late 1990s saw a battle between two visions for internet telephony. The ITU-T published H.323 in 1996, dragging the full weight of the telephone network onto IP — hundreds of pages, binary encoding, tight coupling. Mark Handley, Henning Schulzrinne, Eve Schooler, and Jonathan Rosenberg designed SIP in 1996 and shipped it as RFC 2543 in 1999, revised as RFC 3261 in June 2002. SIP modelled itself on HTTP. Text-based, simple headers, stateless by default. INVITE to start a call, BYE to hang up. SIP won — not because it was technically superior in every dimension, but because web developers could grasp it quickly and the loose coupling between SIP signalling, SDP description, and RTP media let each one evolve on its own clock. The full mechanism story lives in the SIP episode and the chapter on SIP and SDP.

### Flash and RTMP take the web

In July 2002 Macromedia shipped Flash Communication Server, with the Real-Time Messaging Protocol on TCP port 1935. Adobe bought Macromedia in 2005 for 3.4 billion dollars. For nearly a decade Flash plus RTMP simply was internet video — YouTube, Justin.tv into Twitch, Hulu, Vimeo, all on Flash. RTMP's technical contribution was multiplexed, persistent low-latency channels over TCP, with chunk sizes typically 64 to 128 bytes. The RTMP episode covers the wire format and the long zombie afterlife.

### The iPhone, HLS, and the pull revolution

When the iPhone shipped without Flash in 2007, the writing was on the wall. Steve Jobs published "Thoughts on Flash" in April 2010. Roger Pantos at Apple authored HTTP Live Streaming in 2009 with iPhone 3.0 and put a deliberately simple design on the table — a text M3U8 playlist pointing at numbered MPEG-TS segments, fetched by ordinary HTTP. HLS became RFC 8216 in 2017 and is still the default delivery protocol of the streaming internet. MPEG-DASH followed as the open-standard answer, ratified as ISO/IEC 23009-1 in 2012. The HLS and DASH episodes share a book chapter that walks the manifest format, the ABR ladder, and the chunked CMAF future.

### WebRTC — the browser revolution

In May 2010 Google paid 68.2 million dollars for Global IP Solutions, a Swedish company whose audio and video codecs powered Skype and dozens of VoIP applications. Then they did something remarkable. They open-sourced everything and shipped it inside Chrome. The result, announced in May 2011 and called WebRTC, did not invent new protocols. It bundled existing ones. RTP and SRTP for media, ICE and STUN and TURN for NAT traversal, SDP for negotiation, DTLS for keys, SCTP-over-DTLS for data channels. The genius was packaging all of this into a browser API that any web developer could use — no plugins, no installs, no special servers. Justin Uberti led engineering and Harald Alvestrand led standardisation across both the W3C and the IETF. The first cross-browser call was in February 2013. Safari added WebRTC support in 2017. WebRTC 1.0 became a W3C Recommendation in January 2021. The WebRTC episode and its book chapter walk the bundle layer by layer.

### The pandemic, low-latency HLS, and WHIP

COVID drove Zoom, Teams and Meet to billions of monthly users almost overnight. In June 2020 the Zoom encryption controversy forced the whole industry to take end-to-end encryption seriously inside SFUs — Insertable Streams shipped in Chrome the same year. Apple introduced Low-Latency HLS at WWDC 2019, demonstrated by Roger Pantos with a Sydney to Cupertino call clocking under two seconds glass-to-glass. The community converged on the Common Media Application Format so HLS and DASH could share fMP4 segments. WHIP, the WebRTC-HTTP Ingestion Protocol, became RFC 9725 in March 2025, a single HTTP POST that carries an SDP offer to a server that returns an SDP answer — designed by Sergio Garcia Murillo and the late Alex Gouaillard to replace RTMP for first-mile WebRTC ingest. OBS Studio shipped WHIP in 2024.

### The QUIC era — RoQ and Media over QUIC

With QUIC ratified as RFC 9000 in 2021 and HTTP/3 as RFC 9114 in 2022, two new threads opened. RTP over QUIC, in the AVTCORE working group, keeps the entire RTP ecosystem and just swaps UDP for QUIC — draft fourteen entered Working Group Last Call in August 2025. Media over QUIC, championed by Meta, Cisco, Google, and Cloudflare, is a new pub/sub media transport built from scratch — draft seventeen landed in March 2026. On 28 April 2026 at NAB, eleven vendors — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — demoed first MoQ implementations. Cloudflare opened a beta MoQ relay service in early 2026. MoQ is the first serious attempt at a single protocol that does both push and pull. Whether it actually replaces WebRTC and HLS is the central open question of the decade. The MoQ Transport chapter in the book covers the data model — track, group, subgroup, object — in detail.

## The people

### Henning Schulzrinne

The most central figure in internet real-time communication. Co-created RTP at LBL/Columbia and SIP at Columbia, and later served as Chief Technology Officer of the Federal Communications Commission. His work is upstream of essentially every voice and video call that crosses the public internet. There's a separate Schulzrinne episode.

### Van Jacobson

Co-created RTP at Lawrence Berkeley National Lab alongside Schulzrinne, Casner, and Frederick. He also designed the TCP congestion control algorithms that prevented the internet from collapsing in 1986 — the chapter on the 1986 collapse covers that work. Van Jacobson has his own episode.

### Mark Handley

Brought internet architecture thinking to multimedia signalling at University College London. Co-created SIP and SDP, the protocol pair that handles call setup across the internet.

### Eve Schooler

Co-creator of SIP at Caltech, ISI, and Intel. Her research on multicast conferences laid the groundwork for modern video calling and helped shape the offer/answer model that SIP, RTSP, and WebRTC all use.

### Jonathan Rosenberg

Designed the SIP infrastructure that made it actually work in the real world — STUN, TURN, and ICE for NAT traversal, plus SRTP for encrypting media. He has worked at dynamicsoft, Cisco, and Five9. There is a separate Rosenberg episode.

### Justin Uberti

Led the technical development of WebRTC at Google after the 2010 GIPS acquisition. He drove the integration of real-time communication directly into Chrome and then into every other browser. Uberti left Clubhouse to join OpenAI as Head of Realtime AI in November 2024 — the same RTP-derived stack now carries the AI agent voice. There is a separate Uberti episode.

### Harald Alvestrand

Led WebRTC standardisation across both the W3C and the IETF, and previously chaired the IETF itself. The reason the bundle of RTP, SRTP, ICE, STUN, TURN, DTLS, SDP, and SCTP added up to a single coherent W3C Recommendation rather than a pile of incompatible drafts.

### Roger Pantos

Designed HTTP Live Streaming at Apple in 2009. The insight was simple — chop a video into small HTTP-downloadable segments at multiple quality levels, and let an ordinary web cache serve them. He continued the work into Low-Latency HLS at WWDC 2019, where he demonstrated under-two-second glass-to-glass with a Sydney to Cupertino call.

## The protocols (a guided tour)

### WebRTC — Web Real-Time Communication

WebRTC is not one protocol but a bundle. The W3C side is three browser APIs — getUserMedia for the camera and microphone, RTCPeerConnection for the call, RTCDataChannel for arbitrary data. The IETF side is RTP, RTCP, SRTP, DTLS, SCTP-over-DTLS, ICE, STUN, and TURN, all of them mandated to interoperate. Released by Google in May 2011 and reaching W3C Recommendation status in January 2021, WebRTC is the default answer when you need a browser-to-browser conversation under five hundred milliseconds. Reach for it for video calling, voice calls, screen sharing, peer-to-peer file transfer, low-latency game streaming, and the new AI realtime APIs. The WebRTC episode walks the bundle and the SFU-versus-MCU choice.

### RTP — Real-time Transport Protocol

The wire format. Almost every UDP-based real-time A/V packet on the internet is, almost certainly, an RTP packet or a thin variant. Twelve-byte header carrying version, padding, marker, payload type, sixteen-bit sequence number, thirty-two-bit timestamp, and a thirty-two-bit Synchronisation Source identifier. RFC 1889 in January 1996, revised as RFC 3550 in July 2003. RTCP travels alongside on the next odd port carrying Sender Reports — which pair an NTP wallclock with the RTP timestamp for cross-stream sync — Receiver Reports with loss, jitter, last-SR, and delay-since-last-SR, and Source Description with the CNAME. You reach for raw RTP when you need the lowest possible latency and you are willing to engineer your own loss and jitter handling. The RTP episode covers the header, the timestamp, the SSRC, and the relationship with RTCP.

### SIP — Session Initiation Protocol

The dialling protocol of the VoIP era. SIP answers the question — how do two endpoints find each other, agree on a session, and tear it down? It is text-based, modelled on HTTP, and so simple you can debug it by reading the packets. INVITE to start, BYE to hang up. RFC 2543 in 1999, the current standard RFC 3261 from June 2002. SIP is the dominant signalling protocol for cloud telephony, enterprise PBXes, and IMS in cellular networks. Reach for SIP when you are integrating with phone networks. The SIP episode walks the request methods, the proxy and registrar architecture, and the SDP offer-answer dance.

### HLS — HTTP Live Streaming

Apple's adaptive streaming protocol, designed by Roger Pantos in 2009 and shipped with iPhone 3.0. The architecture is deliberately boring. An M3U8 text playlist points at numbered video segments. The client fetches them by ordinary HTTP through any cache or CDN. Multiple quality renditions let the player switch up and down as bandwidth changes. RFC 8216 in 2017, with Pantos drafts continuing through Low-Latency HLS in 2019, Interstitials, and version twelve in 2024 and 2025. HLS is the default delivery protocol of the streaming internet — native on iOS, Safari, Apple TV, supported by every player on every device. The HLS episode walks the playlist format, the segment ladder, and the LL-HLS partial-segment trick.

### RTMP — Real-Time Messaging Protocol

The Flash-era protocol that refused to die. Macromedia shipped it in July 2002 over TCP port 1935, with multiplexed persistent low-latency channels and 64-to-128-byte chunks. For nearly a decade RTMP was internet video. Adobe declared Flash end-of-life on 31 December 2020, which killed RTMP for playback. But RTMP is stubbornly alive as the dominant ingest protocol — every encoder vendor, every OBS install, YouTube Live, Twitch, Facebook Live still take an RTMP push. WHIP is the planned successor for first-mile WebRTC ingest, and it is shipping fast, but RTMP still runs the long tail. The RTMP episode covers the chunk stream and the zombie afterlife.

### SDP — Session Description Protocol

A text format for describing what a media session contains — which codecs, which IPs and ports, which crypto, which extensions. SDP is the matchmaker behind every WebRTC and VoIP call. Used by SIP in offer-answer, by RTSP, by WebRTC, and by WHIP and WHEP. RFC 8866 in 2021 is the current spec. SDP is famously verbose and crufty — "munging the SDP" is a load-bearing pattern in real-world WebRTC apps. The SDP episode walks the format, the offer-answer model from RFC 3264, and the WebRTC-specific lines like fingerprints and bundles.

### DASH — Dynamic Adaptive Streaming over HTTP

The open-standard answer to HLS, ratified as ISO/IEC 23009-1 in 2012, with the fifth edition published in 2022. Codec-agnostic, with an XML manifest called the MPD instead of HLS's M3U8 text playlist. Dominant in non-Apple OTT — Netflix, Amazon Prime Video, and most of the rest. DASH and HLS converged on shared fMP4 packaging via CMAF in 2018, so the same segments can serve both. The DASH episode walks the MPD, the representation set, and the DASH-IF interop guidelines.

## Advanced topics (from the deep-dive)

### Jitter buffers

Network jitter — the variation in packet arrival times — is the enemy of smooth playback. Even when average latency is low, irregular arrival causes gaps and glitches. Jitter buffers smooth this out by introducing a small intentional delay. Incoming packets sit in a FIFO and get released at regular intervals, absorbing timing variation at the cost of latency. Static buffers use a fixed delay around sixty milliseconds and are simple but suboptimal — too small and you get dropouts, too large and the latency is noticeable. Adaptive buffers grow during high jitter and shrink when the network is stable. WebRTC's NetEQ is the canonical adaptive jitter buffer for audio. It also handles packet-loss concealment with time-scaling and comfort-noise generation, all under the hood.

### Forward Error Correction

When UDP packets are lost the data is gone, and there is no retransmission mechanism — for real-time media, waiting for a retransmit is worse than skipping the lost data. FEC adds redundant data so the receiver can reconstruct losses without a round trip. XOR-based FEC sends N data packets plus one parity packet (XOR of all N), recovering single losses with one-over-N-plus-one overhead. Reed-Solomon codes are heavier on CPU but recover from multiple simultaneous losses and run in professional broadcast systems. The Opus audio codec includes its own FEC — each packet contains a low-bitrate encoding of the previous packet's audio, so an isolated loss is reconstructed for nearly zero extra overhead. WebRTC also ships FlexFEC and ULPFEC; SRT and RIST combine FEC with NACK-based ARQ.

### Adaptive bitrate streaming

Adaptive bitrate, or ABR, dynamically adjusts video quality to network conditions. HLS and DASH encode each video at multiple quality levels — for example 1080p at 5 Mbps, 720p at 2.5 Mbps, 480p at 1 Mbps, 360p at 500 Kbps — each chopped into segments two to ten seconds long. The ABR algorithm runs on the client. It monitors download speed, buffer level, and sometimes round-trip time, and decides which quality to request next. Buffer-based algorithms like BBA pick by buffer depth — simple, stable, slow to react. Throughput-based ones measure recent download speed and pick the highest fitting quality — fast to adapt but prone to oscillation. Hybrid algorithms like BOLA and Netflix's MPC combine both with mathematical optimisation, looking multiple segments ahead to minimise rebuffering while maximising quality. Bad ABR algorithms produce ladder thrashing — flipping quality every segment — which the user perceives as constant flicker.

### NAT traversal — ICE, STUN, TURN

Most endpoints do not have routable public IPs, which is why peer-to-peer is hard. The standardised answer comes in three pieces. STUN, in RFC 8489, lets a host learn its public-mapped address by asking a public server. TURN, in RFC 8656, relays traffic when peer-to-peer fails — symmetric NATs, restrictive firewalls, mobile carrier-grade NAT. ICE, in RFC 8445, is the framework that gathers host, server-reflexive, and relay candidates, pairs them, runs STUN connectivity checks across the matrix, and picks the best path. TURN-relay fallback can spike costs catastrophically at enterprise scale because every byte rides through a relay region — Twilio, Cloudflare and AWS all charge for it.

### Simulcast, SVC, and SFUs

WebRTC group calls almost universally use Selective Forwarding Units rather than the older Multipoint Control Units. An MCU decodes, mixes, and re-encodes — expensive but compatible with simple endpoints. An SFU just forwards selected RTP streams — cheap and scalable. The SFU then needs a way to pick which quality to forward to each receiver. Simulcast has the sender encode the same content at N independent qualities; the SFU forwards whichever the receiver can handle. Scalable Video Coding encodes a single stream as a base layer plus enhancement layers; the SFU drops layers as bandwidth shrinks. AV1's SVC is part of why Google Meet, Cisco Webex, Millicast, and Meta Messenger all adopted it. The open-source SFU landscape is rich — Janus, Jitsi, mediasoup, LiveKit, Cloudflare Calls.

### Codecs — Opus and AV1

Codecs are not technically protocols but they are inseparable from this group. Opus, RFC 6716 from September 2012, was the result of locking Skype's SILK codec for narrow-band speech and Xiph's CELT codec for music in a room together until they produced one royalty-free codec spanning 6 to 510 kbps and frame sizes 2.5 to 60 milliseconds. Opus is the mandatory-to-implement audio codec for WebRTC and runs Discord, WhatsApp, FaceTime audio, and PlayStation 4 voice chat. On video, the Alliance for Open Media shipped AV1 in 2018, cutting bitrate roughly thirty percent versus HEVC and fifty percent versus H.264 at equivalent quality. Real-time AV1 has been in Chrome since version 90 in 2021, and Twitch deployed it to top creators in 2022 and 2023. The royalty-free claim is now under legal challenge — Dolby filed patent suits against Snap on 23 March 2026 covering both HEVC and AV1 in Snapchat.

## Recurring themes

The first theme is **a dropped frame beats a frozen screen**. Every protocol in this group makes the opposite trade-off from TCP. UDP is the substrate. Packet loss is normal and is handled at the application layer with FEC, NACK, jitter buffers, packet-loss concealment, and forward-error redundancy in codecs. The wrong way to engineer for real-time media is to retransmit until everything arrives — the right way is to design playback so that missing data is invisible.

The second theme is **separate signalling from media**. Standard since the SIP, SDP, and RTP separation in the 1990s. SIP carries call setup, SDP describes what the session contains, RTP carries the bits — and each one evolves on its own clock. WebRTC made the separation dogma. The browser ships RTCPeerConnection, but the JavaScript app is free to use any signalling channel — WebSockets, HTTP, server-sent events, anything. WHIP and WHEP are the modern minimalist signalling layer. The pattern shows up everywhere — every protocol family in this category eventually ends up with a thin out-of-band negotiation step and a fat in-band media path.

The third theme is **the long pendulum between push and pull**. RTP, SRT, RIST, RTMP, and WebRTC are all push protocols — the sender drives, packets fly out at media rate, and the receiver catches what it can. HLS and DASH are pull protocols — the receiver drives, fetching segments from a CDN at its own pace, with seconds of buffering as the price for global scale. Each side has won and lost in turn. Flash and RTMP dominated the 2000s, then HLS and DASH ate playback after the iPhone, then WebRTC came back for conversational latency, and now MoQ is the first serious attempt to get both at once over QUIC.

The fourth theme is **transitions take a decade, not a year**. RTP went from RFC 1889 in 1996 to W3C-blessed inside the WebRTC bundle in 2021 — twenty-five years. The Flash and RTMP eviction took from 2007, when the iPhone shipped without Flash, to 31 December 2020 — and RTMP is still alive as ingest in 2026. WebRTC went from announcement in May 2011 to 1.0 Recommendation in January 2021. MoQ has interop demos in April 2026 but no consumer-scale deployment yet. The chapter on the 1986 congestion collapse shows the same pattern in transport — protocols move at the speed of operator deployment, not at the speed of standards.

## Where this connects in the book

- **The chapter on RTP and RTCP** — the long-form pair to the RTP episode, with the sender-and-receiver-report mechanism and the SSRC story.
- **The chapter on WebRTC** — the bundle layer by layer, the GIPS acquisition, the Uberti and Alvestrand standardisation arc, and the pandemic-era explosion.
- **The chapter on SIP and SDP** — the SIP-versus-H.323 standards war, the offer-answer model, and the IMS deployment that still moves billions of voice minutes a day.
- **The chapter on HLS and DASH** — the iPhone-without-Flash inflection point, the M3U8 versus MPD format split, the CMAF convergence, and the LL-HLS partial-segment design.
- **The chapter on MoQ Transport** — the publish-subscribe data model with relays, the track-group-subgroup-object hierarchy, and the open argument about whether MoQ replaces WebRTC and HLS or just augments them.

## See also (other category episodes)

The Transport episode is the layer immediately below this one. Every push protocol in Real-Time A/V rides UDP, and every pull protocol rides TCP through HTTP — and the QUIC newcomers ride QUIC, which itself runs over UDP. The reason real-time media prefers UDP is the head-of-line blocking problem TCP creates. A single dropped TCP segment stalls all video, audio, and data streams sharing the connection — the whole reason QUIC exists for this group, and the central topic of the QUIC episode in Transport.

The Web/API episode is the cousin of this one in pull-protocol design. HLS and DASH are HTTP applications that look more like REST than like RTP. The same CDN that caches an image caches a video segment. Adaptive bitrate is a client-side algorithm running over plain GETs. When you watch Netflix, you are running a Web/API protocol pattern that just happens to be carrying video.

The Network Foundations episode is the layer below Transport and below everything in Real-Time A/V. When BGP fails — Facebook 4 October 2021, Cloudflare 21 June 2022 — the most visible casualty is real-time A/V, because it is the most latency-sensitive thing on the network. The Facebook outage chapter covers it in detail; for thirty-one minutes that day, Discord voice rooms went silent mid-sentence.

## Sources

### RFCs

- [RFC 1889 — RTP (Schulzrinne, Casner, Frederick, Jacobson, 1996)](https://www.rfc-editor.org/rfc/rfc1889)
- [RFC 3550 — RTP (revised, 2003)](https://datatracker.ietf.org/doc/html/rfc3550)
- [RFC 3551 — RTP A/V profile](https://www.rfc-editor.org/rfc/rfc3551)
- [RFC 3711 — Secure RTP (SRTP)](https://datatracker.ietf.org/doc/html/rfc3711)
- [RFC 3261 — Session Initiation Protocol (SIP)](https://datatracker.ietf.org/doc/rfc3261/)
- [RFC 8866 — Session Description Protocol (SDP)](https://www.rfc-editor.org/rfc/rfc8866)
- [RFC 8825 — WebRTC overview](https://www.rfc-editor.org/rfc/rfc8825)
- [RFC 8445 — ICE](https://www.rfc-editor.org/rfc/rfc8445)
- [RFC 8489 — STUN](https://www.rfc-editor.org/rfc/rfc8489)
- [RFC 8656 — TURN](https://www.rfc-editor.org/rfc/rfc8656)
- [RFC 9147 — DTLS 1.3](https://www.rfc-editor.org/rfc/rfc9147)
- [RFC 8216 — HTTP Live Streaming (HLS)](https://datatracker.ietf.org/doc/rfc8216/)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9725 — WHIP (March 2025)](https://datatracker.ietf.org/doc/rfc9725/)
- [RFC 6716 — Opus](https://datatracker.ietf.org/doc/html/rfc6716)
- [RFC 8298 — SCReAM](https://www.rfc-editor.org/rfc/rfc8298)
- [RFC 8698 — NADA](https://www.rfc-editor.org/rfc/rfc8698)
- [RFC 7826 — RTSP 2.0](https://datatracker.ietf.org/doc/rfc7826/)
- [draft-ietf-wish-whep](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/)
- [draft-ietf-avtcore-rtp-over-quic](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [draft-lcurley-moq-lite](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)

### Papers

- [BBR: Congestion-Based Congestion Control (Cardwell et al., ACM Queue 2016)](https://research.google/pubs/bbr-congestion-based-congestion-control-2/)
- [Analysis and Design of the Google Congestion Control for Web Real-time Communication (Carlucci et al., MMSys 2016)](https://dl.acm.org/doi/10.1145/2910017.2910605)
- [vic: A Flexible Framework for Packet Video (McCanne & Jacobson, ACM Multimedia 1995)](https://dl.acm.org/doi/10.1145/217279.215315)
- [Vidaptive: Efficient and Responsive Rate Control for Real-Time Video on Variable Networks (Karimi et al., NSDI 2024)](https://arxiv.org/abs/2309.16869)
- [The Opus Codec (Valin, Vos, Terriberry)](https://arxiv.org/pdf/1602.04845)

### Vendor / engineering blogs

- [Cloudflare — MoQ: Refactoring the Internet's real-time media stack](https://blog.cloudflare.com/moq/)
- [Cloudflare developer docs — MoQ](https://developers.cloudflare.com/moq/)
- [Cloudflare — June 21, 2022 outage post-mortem](https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/)
- [Mux — The community gave us low-latency live streaming. Then Apple took it away.](https://www.mux.com/blog/the-community-gave-us-low-latency-live-streaming-then-apple-took-it-away)
- [Haivision — SRT: Everything you need to know](https://www.haivision.com/blog/all/srt-everything-you-need-to-know-about-the-secure-reliable-transport-protocol/)
- [Apple Developer — Introducing Low-Latency HLS (WWDC 2019)](https://developer.apple.com/videos/play/wwdc2019/502/)
- [Apple — HLS draft Pantos](https://developer.apple.com/streaming/HLS-draft-pantos.pdf)
- [WebRTC for the Curious — History of WebRTC](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)
- [webrtcHacks — Is everyone switching to MoQ?](https://webrtchacks.com/is-everyone-switching-to-moq/)
- [webrtcHacks — The Hidden AV1 Gift in Google Meet](https://webrtchacks.com/the-hidden-av1-gift-in-google-meet/)
- [webrtcHacks — True end-to-end encryption with WebRTC Insertable Streams](https://webrtchacks.com/true-end-to-end-encryption-with-webrtc-insertable-streams/)
- [WebRTC.ventures — WebTransport is now Baseline](https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/)
- [WebRTC.ventures — Should you still consider AV1 in WebRTC?](https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/)
- [BlogGeek.me — Cloudflare 2025](https://bloggeek.me/cloudflare-2025/)
- [Webex — Introducing RTCP, the RTP Control Protocol](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)
- [Castr — History of RTMP](https://castr.com/blog/history-of-rtmp-protocol/)
- [Gcore — LL-HLS and LL-DASH single pipeline](https://gcore.com/blog/ll-hls-and-ll-dash-single-pipeline)
- [Dolby OptiView — Low-latency chunked CMAF](https://optiview.dolby.com/resources/blog/streaming/low-latency-chunked-cmaf/)
- [Red5 — What is MoQ (Media over QUIC)?](https://www.red5.net/blog/what-is-moq-media-over-quic/)
- [DASH-IF — 5th edition of MPEG-DASH](https://dashif.org/news/5th-edition/)
- [LBL — MBone (Van Jacobson)](https://www2.lbl.gov/Science-Articles/Archive/MBONE-van-jacobson.html)
- [Streaming Media — RIST overview](https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=142998)
- [Kaspersky — Life and death of Adobe Flash](https://www.kaspersky.com/blog/life-and-death-of-adobe-flash/45906/)
- [FOX Tech — Super Bowl LIV streaming architecture](https://medium.com/fox-tech/overview-of-foxs-resilient-low-latency-streaming-video-architecture-for-super-bowl-liv-e51c2e41063c)
- [Millicast — Real-time AV1 video encoding with WebRTC](https://medium.com/millicast/its-time-for-real-time-av1-video-encoding-withwebrtc-75a6aa64777c)

### News

- [TVTechnology — Super Bowl streaming delays top 60 seconds](https://www.tvtechnology.com/news/study-super-bowl-streaming-delays-top-60-seconds-on-many-streaming-platforms)
- [The Intercept — Zoom encryption (March 2020)](https://theintercept.com/2020/03/31/zoom-meeting-encryption/)
- [FTC — Zoom settlement (November 2020)](https://www.ftc.gov/business-guidance/blog/2020/11/zooming-zooms-unfair-deceptive-security-practices-more-about-ftc-settlement)
- [Twitch — Updates on the security incident (October 2021)](https://blog.twitch.tv/en/2021/10/15/updates-on-the-twitch-security-incident/)
- [TechCrunch — Hacker leaks Twitch source code](https://techcrunch.com/2021/10/06/hacker-leaks-twitch-source-code-and-creator-payout-data/)
- [Cloudflare — October 2021 Facebook outage](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Fastly — June 8 2021 outage summary](https://www.fastly.com/blog/summary-of-june-8-outage)

### Wikipedia

- [WebRTC](https://en.wikipedia.org/wiki/WebRTC)
- [Session Initiation Protocol](https://en.wikipedia.org/wiki/Session_Initiation_Protocol)
- [Mbone](https://en.wikipedia.org/wiki/Mbone)
- [Secure Reliable Transport](https://en.wikipedia.org/wiki/Secure_Reliable_Transport)
- [Reliable Internet Stream Transport](https://en.wikipedia.org/wiki/Reliable_Internet_Stream_Transport)
- [Network Device Interface](https://en.wikipedia.org/wiki/Network_Device_Interface)
- [Opus (audio format)](https://en.wikipedia.org/wiki/Opus_(audio_format))
- [AV1](https://en.wikipedia.org/wiki/AV1)
- [2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
