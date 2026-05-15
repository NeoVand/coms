---
id: webrtc
type: protocol
name: Web Real-Time Communication
abbreviation: WebRTC
etymology: "[Web] [R]eal-[T]ime [C]ommunication"
category: realtime-av
year: 2011
rfc: RFC 8825
standards_body: ietf-w3c
podcast_target_minutes: 22
related_book_chapters:
  - foundations/addressing
  - foundations/client-server-p2p
  - transport/udp
  - transport/sctp
  - realtime-av/rtp-and-rtcp
  - realtime-av/webrtc
  - realtime-av/sip-and-sdp
  - realtime-av/moq-transport
  - frontier/l4s-everywhere
  - how-to-learn-more/books
related_protocols: [udp, tls, sip, sctp, rtp, sdp, nat-traversal, websockets]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [8825, 8826, 8827, 8828, 8829, 8830, 8831, 8832, 8834, 8838, 8843, 8445, 8489, 8656, 9143, 9147, 9335, 9429, 9605, 9725, 3550, 3711, 5764, 8888]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Video_Conference_Using_Laptop.jpg/500px-Video_Conference_Using_Laptop.jpg
    caption: WebRTC made browser-native peer-to-peer video calls possible — no plugins, no downloads. Audio, video, and data channels all run directly in Chrome, Firefox, and Safari.
    credit: Photo — Visuals / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "An exploded view of the WebRTC protocol stack on a single UDP socket — STUN, DTLS, and SRTP demuxed off the same port by the first byte (RFC 7983), with SCTP riding inside DTLS for data channels. Each layer in a different colour."
  - "An ICE candidate-pair grid: peer A's candidates (host, srflx, relay) along the rows, peer B's down the columns, every cell a probe outcome — green for connected, red for failed, the chosen pair circled."
  - "A sequence diagram of the full session: signaling-server SDP exchange in dashed lines, ICE STUN binding probes in thin solid lines, DTLS handshake as a thick line, then SRTP media flowing peer-to-peer with the signaling server greyed out."
  - "A bar chart comparing latency by topology: mesh (90 ms intra-region), SFU (150 ms), MCU (350 ms), TURN-relayed (250 ms), Cloudflare anycast SFU (110 ms). Glass-to-glass total in milliseconds."
  - "An infographic of libwebrtc's blast radius — one library, six browsers (Chrome, Edge, Brave, Opera, Vivaldi, Firefox, Safari), one CVE-2023-7024 patch landing in all of them within a week."
  - "A timeline of the codec wars 2011–2026: VP8 vs H.264 stalemate (2013), RFC 7742 mandates both (2016), Cisco's OpenH264 royalty workaround, AV1 default-on for screenshare in Meet (2024), Dolby's March 2026 patent suit against Snap."
---

# WebRTC — Web Real-Time Communication

## In one breath

WebRTC is the only way for a web browser to send a UDP packet. It is the bundle of standards — RTCPeerConnection in the JavaScript runtime, ICE and STUN and TURN for NAT traversal, DTLS for key exchange, SRTP for media, SCTP-over-DTLS for data channels — that lets two browsers establish a direct, encrypted, sub-200-ms audio-video-data connection without a plugin and without any server in the media path. Every video call you have ever made on Google Meet, Discord, Facebook Messenger, ChatGPT voice mode, or your bank's telehealth widget rides on top of one open-source library called libwebrtc.

## The pitch

In May 2010 Google paid 68.2 million dollars in cash for a small Norwegian-Swedish company called Global IP Solutions. They didn't want the company. They wanted the audio engine — NetEQ, the jitter buffer that was already running quietly inside 800 million endpoints from Yahoo to AIM. Google open-sourced it the next year, called it WebRTC, and shipped a JavaScript API that turned every Chrome tab into a softphone. Fifteen years later that codebase has grown to 1.21 million lines — three times the Space Shuttle's onboard software, by Justin Uberti's own count — and it is the most successful piece of open-source plumbing the web has ever shipped. This episode is what is in there: the wire format, the production deployments at Discord and Google Meet and Cloudflare, the December 2023 zero-day that hit every browser at once, and the slow handover to WebTransport and Media-over-QUIC.

The full history of how WebRTC came to be — the codec wars, the IETF rtcweb working group, Apple's six-year delay until iOS 11 — lives in the realtime-av chapter on WebRTC. Pair this episode with that one.

## How it actually works

WebRTC is best understood as five interlocking state machines stacked on a single UDP flow. The top of the stack is JavaScript: an RTCPeerConnection object. The bottom is one UDP 5-tuple per peer-pair, with STUN and DTLS and SRTP all demultiplexed off the same port by the first byte of every datagram, per RFC 7983. The simulator on this protocol's page walks through it in seven steps; here is the same path in prose.

First, **signaling**. WebRTC deliberately specifies no signaling protocol — RFC 8825 leaves it to the application. Peer A creates a session description (an SDP blob listing codecs, ICE credentials, and a DTLS certificate fingerprint) and ships it through any out-of-band channel — usually a TLS-secured WebSocket — to Peer B. Peer B answers with its own SDP. Both sides apply the negotiated parameters. JSEP, formalised in RFC 9429 in April 2024 (which obsoletes the original RFC 8829), defines exactly this offer-answer state machine.

Second, **ICE candidate gathering**, per RFC 8445. Each peer collects four kinds of candidates: host (a local interface, today usually masked behind an mDNS `*.local` name to stop ad networks fingerprinting users by their local IP), srflx (server-reflexive — your public address as a STUN server sees you), prflx (peer-reflexive — discovered mid-probe), and relay (a TURN-allocated address, guaranteed to work but adds a hop). Candidates are exchanged via the signaling channel — Trickle ICE per RFC 8838 ships them as they appear rather than batching — and paired across peers.

Third, **STUN binding probes**. Every STUN message is a 20-byte header plus TLV attributes, magic cookie `0x2112A442`. The XOR-MAPPED-ADDRESS attribute returns your public IP and port. Connectivity checks are STUN Binding requests carrying USE-CANDIDATE, ICE-CONTROLLING or ICE-CONTROLLED, and PRIORITY. The top two bits of every STUN message are zero — that is what lets the receiver demux STUN from DTLS and SRTP on the shared UDP port.

Fourth, **DTLS handshake**, RFC 9147 since April 2022. Once ICE picks a winning candidate pair, the side that signaled `a=setup:active` opens DTLS as the client. The handshake is essentially TLS 1.3 over UDP, with explicit sequence numbers and a stateless cookie exchange (HelloRetryRequest in 1.3, replacing the old HelloVerifyRequest). The certificate is self-signed; trust comes from the SDP `a=fingerprint` line that the signaling server delivered, and from the assumption that the signaling server is itself authenticated.

Fifth, **SRTP key extraction**. The DTLS master key is exported via the TLS exporter with label `EXTRACTOR-dtls_srtp` per RFC 5764. SRTP then encrypts every RTP packet with AES-128-GCM today. RFC 9335 Cryptex, from January 2023, extended the encryption to cover RTP header extensions and CSRCs.

After that, media flows. Audio at 20-millisecond intervals as Opus frames, video at 30 frames per second as VP8 or VP9 or AV1 packets, all wrapped in SRTP. RTCP feedback shares the same port (`rtcp-mux`) and carries NACKs, PLIs, and TWCC reports. Data channels, if you opened any, run as SCTP messages encapsulated inside the same DTLS connection per RFC 8261 and RFC 8831 — the largest production SCTP deployment by message count anywhere on the public internet.

### Header at a glance

WebRTC has no single header — it has a stack. The numbers worth memorising:

- **STUN message**: 20-byte fixed header. Two leading zero bits, then a 14-bit type, 16-bit length, 32-bit magic cookie `0x2112A442`, 96-bit transaction ID. Attributes follow as TLVs. MESSAGE-INTEGRITY uses HMAC-SHA1 keyed on the ICE password; RFC 8489 added MESSAGE-INTEGRITY-SHA256, and SHA-1 is on the slow path to removal.
- **DTLS record**: TLS 1.3 record format with explicit 48-bit sequence number per record (versus TCP's implicit), so reordering and loss are tolerated.
- **SRTP packet**: a 12-byte RTP header — version (always 2), padding, extension, CSRC count, marker, 7-bit payload type, 16-bit sequence number, 32-bit timestamp at the codec's clock rate (90 kHz for video, 48 kHz for Opus), 32-bit SSRC — followed by ciphertext and a default 80-bit authentication tag.
- **TURN ChannelData**: a 4-byte channel header plus payload, channel numbers `0x4000`–`0x7FFF`. The efficient relay format once a channel is bound; the alternative `Send`/`Data` indications carry per-packet overhead.
- **SCTP-over-DTLS user message**: PPID 51 for UTF-8, 53 for binary, 50 for the DCEP control protocol that opens channels. Even-stream IDs go to the DTLS client, odd to the server.

### State machine

WebRTC exposes four enum-typed state machines on every RTCPeerConnection: `signalingState` walks `stable` to `have-local-offer` or `have-remote-offer` and back; `iceGatheringState` is `new` to `gathering` to `complete`; `iceConnectionState` walks `new`, `checking`, `connected`, `completed`, `disconnected`, `failed`, `closed`; and `connectionState` aggregates the others. The Mozilla "perfect negotiation" pattern from 2020 handles the common race — both sides sending an offer at the same time — by designating one peer `polite` and rolling back its own offer when the impolite peer's arrives.

### Reliability, security, and congestion mechanics

There are three independent loops running once media flows.

**SRTP** gives every packet authenticated AES encryption. SFrame, standardised in RFC 9605 in August 2024, adds end-to-end frame-level encryption that survives forwarding through an SFU — the SFU sees opaque frames and routes them without decrypting. Justin Uberti and Emad Omara sketched the original SFrame idea on a whiteboard in 2018; six years later it is deployed in Webex, Google Meet, Jitsi, and Cloudflare Realtime.

**RTCP feedback** carries the loss and timing signal back to the sender every few hundred milliseconds: NACK for selective retransmission, PLI for "please send a fresh keyframe", TWCC for transport-wide per-packet arrival times. RFC 8888 from 2020 unified these formats and is the substrate for the new generation of congestion controllers.

**Bandwidth estimation** is Google Congestion Control by default — Carlucci, De Cicco, Holmer, and Mascolo's 2016 ACM MMSys design, a Kalman filter on one-way delay variation plus AIMD-style rate adaptation on the sender. Behind the field-trial flag `WebRTC-RFC8888CongestionControlFeedback/Enabled`, libwebrtc now also speaks RFC 8888 plus ScreamV2 for L4S — ECN-marked packets giving sub-1-millisecond queuing-delay signals on a Comcast or Apple-class path. The L4S launch entry on the Frontier page has the broader story.

## Where it shows up in production

**Google Meet** is the largest WebRTC deployment, around 300 million monthly active users, and it drives the Chrome libwebrtc roadmap. Meet uses VP9 K-SVC by default and has had AV1 default-on for screen-share since 2024 — the screen-share content is text-heavy and AV1's intra-prediction wins big on it.

**Discord** publishes the most detailed numbers. Their 2018 engineering post documents 2.6 million concurrent voice users, 220 Gbps of egress, and 120 million packets per second. Their voice infrastructure is a custom C++ SFU coordinated by 20-plus Elixir services running on roughly 1000 nodes. By 2026 the fleet has grown to over 850 voice servers in 13 regions across more than 30 data centers, serving 2.5 million concurrent voice users — though the public per-second packet number has not been refreshed. Discord deliberately swapped DTLS-SRTP for libsodium's xsalsa20_poly1305 in their custom libwebrtc fork to save CPU at that scale, then in March 2026 deployed their DAVE protocol layering MLS keys plus SFrame for end-to-end-encrypted voice. The standard, as Discord engineers say, is the floor and not the ceiling.

**Microsoft Teams** runs a Skype-derived native stack with the Satin neural codec; the web client uses WebRTC as the fallback path. **Zoom**'s web client has used WebRTC data channels plus WebCodecs and WebAssembly since 2020 — an early bellwether of the unbundled-WebRTC pattern. **WhatsApp web, Facebook Messenger, Snapchat,** and **Twitter Spaces** all sit on WebRTC at the call layer.

**Cloudflare Realtime** (formerly Cloudflare Calls) is anycast WebRTC. They run an SFU at every Cloudflare edge — by their own numbers, 300-plus locations with up to a thousand servers in some metros — stitched into a global mesh, with TURN service priced at five cents per gigabyte at launch.

**LiveKit** is the cloud-native SFU that powers ChatGPT's voice mode in the OpenAI client; their engineering blog post *Going Beyond a Single-Core* is the canonical read on why an SFU bottlenecks at roughly 50 microseconds per downtrack write and how they parallelise around it. **Janus, mediasoup, Jitsi Videobridge, Galene, Ant Media, and Amazon Chime SDK** round out the open-source and managed-SFU landscape. **Pion** in Go and **aiortc** in Python are the two server-side SDKs that show up most in research and gateway work; OpenAI's Realtime API is built on Pion.

**Twilio Programmable Video and Voice** were the canonical CPaaS layer; Twilio is sunsetting Programmable Video in 2026, leaving Daily.co, Vonage, and Agora as the main commercial alternatives.

A typical SFU session: glass-to-glass latency under 200 ms intra-region, 250–400 ms inter-continent, Opus audio at 32 kbps, three simulcast video layers at 180p, 360p, and 720p totalling roughly 3 Mbps upstream per publisher.

## Things that go wrong

**CVE-2023-7024**, December 21, 2023. A heap buffer overflow in `WebRtcAudioSink::OnSetFormat` — the function that hands decoded PCM to the speaker pipeline — that didn't bounds-check its channel count. Clément Lecigne and Vlad Stolyarov of Google's Threat Analysis Group caught the exploit in the wild as Chrome's eighth zero-day of 2023. A crafted HTML page from any malicious site got renderer-process arbitrary code execution; combined with a sandbox escape, full machine compromise. Chrome 120.0.6099.129 shipped within 48 hours. CISA added it to the Known Exploited Vulnerabilities catalog on January 2, 2024.

The blast radius is the structural lesson. The same vulnerable libwebrtc code shipped in Edge, Brave, Opera, Vivaldi, Firefox, and Safari — every Chromium-based browser plus the two non-Chromium browsers that embed libwebrtc. One library, one bug, every browser. libwebrtc is to real-time media what OpenSSL is to TLS, with the same risk profile.

**The Discord 3/25/26 voice outage**. On March 25, 2026, Discord lost voice for hours. The post-mortem the next week is required reading. A routine Kubernetes scale-down of the Elixir voice-syncer pods caused a wave of HTTPS reconnections; Erlang's `gun` HTTP client supervisor tree ran selective receives over message mailboxes that grew to roughly a million entries each, which added about a millisecond per spawn at 100 spawns per second, and the system never caught up without manual intervention. The fix was a validating admission webhook to enforce graceful drain plus rate-limiting on outbound connections.

The lesson, repeated across the field: the WebRTC media plane is robust. Once a connection is established, RTP keeps flowing through almost anything. The signaling plane is where outages happen. Almost every operational disaster in production WebRTC traces to the path that establishes and re-establishes connections, not to the path that carries packets.

**The Asterisk RTP Bleed disclosures of 2017** (AST-2017-008 and AST-2017-012) showed that Asterisk's `strictrtp` port-latching had no authentication, so flooding the UDP port range at 28-to-168 megabytes per second could re-train the media flow to an attacker. The first patch missed RTCP and a race condition, requiring a second advisory. The deeper RTP version of this story lives in the realtime-av chapter on RTP and RTCP.

**STUN amplification** is a long-running concern: badly configured STUN servers respond with packets larger than they receive, giving small reflective-DDoS amplification factors. RFC 8489 tightened response sizing and required authentication; the issue gets rediscovered every few years.

## Common pitfalls (for the practitioner)

**TURN cost blowups.** In real corporate networks, 30 to 50 percent of WebRTC sessions end up relayed through TURN because direct paths fail. TURN bandwidth is real money — at Cloudflare's five-cents-per-gigabyte starting price, a few thousand 1080p video calls a month adds up fast. The cure is to keep `iceTransportPolicy: 'all'` in the public path, instrument the candidate-pair selection in your monitoring, and identify which user populations are getting forced to relay.

**Symmetric NATs.** STUN cannot punch through a symmetric NAT — the NAT picks a different external port for each destination, so the address Peer A learned from the STUN server is useless to Peer B. Only TURN works. Mobile carriers are the canonical offender. If your fail rate is mysteriously bad on cellular, this is usually why.

**SDP munging.** Code that string-edits the SDP to force a particular codec or bitrate breaks every time the spec changes. Use `setCodecPreferences()` and `RTCRtpSender.setParameters()` instead. The munged-SDP graveyard is full of apps that worked great until M89 deprecated Plan B.

**Simulcast layer pinning.** Under fluctuating bandwidth an SFU can occasionally pin a viewer to the wrong simulcast layer and refuse to switch back up. Watch the SFU's selected-layer logs and the client's `frameWidth` over time — if a session sits on 180p forever despite plenty of headroom, you have hit it.

**mDNS in development.** Chrome publishes ephemeral `*.local` hostnames instead of leaking the user's local IP. If your SFU runs outside the local network, the `*.local` name will not resolve there, and every dev session breaks until you provide a way to disable mDNS for testing.

**TURN credential rotation.** Cache TURN credentials in JavaScript and forget to rotate them, and you eventually leak long-lived credentials to anyone who saved a page. Use short-lived REST credentials per RFC 7635 and refresh every few minutes.

**Forgetting the `failed` transition.** Many apps handle `iceConnectionState === 'disconnected'` and miss `'failed'`. Pion v4 changed this behaviour and broke a lot of code; the takeaway is to treat both as terminal and trigger ICE restart.

## Debugging it

`chrome://webrtc-internals/` is the single most valuable WebRTC debugging surface. Every PeerConnection's full API trace, every getStats sample, ICE candidate pair tables, the inbound and outbound RTP graphs over time. Right-click "Create Dump" produces a JSON file you can replay in fippo's webrtc-dump-importer for after-the-fact analysis. `about:webrtc` in Firefox is the equivalent surface plus AEC dumps for audio debugging.

The `getStats()` keys to graph from every production client: from inbound-rtp, `packetsLost`, `packetsReceived`, `jitter`, `framesDropped`, `framesDecoded`, `freezeCount`, `totalFreezesDuration`. From outbound-rtp, `framesPerSecond`, `framesEncoded`, `qualityLimitationReason` (which takes values `cpu`, `bandwidth`, `other`, or `none` and tells you exactly which lever the encoder is pulling). From candidate-pair, `currentRoundTripTime` and `availableOutgoingBitrate`. From transport, `dtlsState`, `iceState`, `selectedCandidatePairId`. The de-facto open-source basis of every commercial monitoring tool — testRTC, watchRTC, the legacy callstats.io — is Philipp Hancke's `rtcstats` library, which wraps RTCPeerConnection and ships periodic getStats samples to your server.

For wire-level capture: `tcpdump -i any udp portrange 49152-65535 -w webrtc.pcap` will catch a typical session's media. `turnutils_uclient` from the coturn distribution is the canonical TURN tester. The Trickle ICE tester at `webrtc.github.io/samples/src/content/peerconnection/trickle-ice/` is the fastest way to confirm a STUN or TURN server actually responds.

Inside an SFU, `pion/interceptor` gives you per-packet hooks; LiveKit and mediasoup expose stats endpoints; Janus has its admin API. Pair them with the client-side rtcstats stream and you have an end-to-end view of any one call.

## What's changing in 2026

**WebTransport reached cross-browser Baseline status with Safari 26.4 in March 2026.** That is the single most important shift on the realtime-media landscape this year. Safari 18.4 first shipped early WebTransport in March-April 2025; the Baseline classification a year later means JavaScript can finally write non-RTP media transports natively — WebCodecs encodes, WebTransport streams or datagrams carry, WebAssembly does congestion control. This is the "unbundled WebRTC" path the realtime-av chapter on MoQ Transport describes in detail.

**MoQ Transport `draft-ietf-moq-transport-17`** landed at the IETF in March 2026, with NAB 2026 (April 28, 2026) demonstrating interop across eleven vendors — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — under a new OpenMOQ Software Consortium. Cloudflare deployed an MoQ relay at every edge across 330-plus cities in 2025. MoQ is not a WebRTC competitor in the conversational case — it is positioned to displace HLS for one-to-many low-latency streaming. The realtime-av chapter on MoQ Transport has the full picture, including Luke Curley's MoQ-Lite fork from inside the working group.

**The AV1 Dolby patent suit**, March 23, 2026. Dolby filed AV1-and-HEVC patent claims against Snap, casting doubt on AV1's royalty-free status. AV1 is otherwise the new default for screenshare in Google Meet (since 2024) with hardware encode in Chrome M120 (December 2023) and Firefox 125 (April 2024). Treat the suit as developing news rather than a verdict; the codec wars never end.

**WHIP became RFC 9725 in March 2025**, by Sergio Garcia Murillo and Alex Gouaillard. One HTTP POST plus an SDP offer-answer handles WebRTC ingestion — clean, simple, replacing a generation of ad-hoc WebSocket signaling. WHEP, the egress equivalent, is in `draft-ietf-wish-whep` and is expected on Standards Track in 2026.

**RFC 9605 SFrame** standardised end-to-end frame encryption in August 2024. It is the substrate for Discord's DAVE, Google Meet's E2EE rooms, Webex's E2EE meetings, and Jitsi's encrypted multi-party calls.

**RFC 9429 JSEP-bis** (April 2024) cleaned up the BUNDLE inconsistencies in the original RFC 8829 and is now the current normative spec for the offer-answer state machine.

**RFC 9335 SRTP Cryptex** (January 2023) extended SRTP encryption to RTP header extensions and CSRCs — important for E2EE composability and for stopping SFUs from accidentally leaking metadata.

**RFC 9143 BUNDLE** (February 2022) obsoleted RFC 8843. **RFC 9147 DTLS 1.3** (April 2022) is now the default DTLS version libwebrtc uses, with X25519 over P-256 in modern stacks.

**Plan B SDP is fully gone** from Chromium since M96 in early 2022; the last `sdpSemantics` flag handling was removed in 2024. Unified Plan is the only remaining SDP semantics across all browsers.

**L4S in WebRTC** is live in Chromium behind two field trials, `WebRTC-RFC8888CongestionControlFeedback/Enabled` and `WebRTC-Bwe-ScreamV2/Enabled`. Combined with Apple's L4S support in iOS 17 and macOS Sonoma (June 2023) and Comcast's January 2025 production launch, the path from camera through a residential gateway to the public internet now has end-to-end ECN-based sub-1-millisecond queuing-delay control on cooperating links. The full L4S story lives in the frontier chapter on L4S Everywhere.

**HEVC for WebRTC**, `draft-ietf-avtcore-hevc-webrtc-08`, was active in March 2026. **VP9 RTP payload format** finally hit Standards Track as RFC 9628 in 2024.

The net assessment: WebRTC is not being replaced. It is being bracketed. The unbundled stack — WebCodecs plus WebTransport plus WebAssembly, with MoQ for distribution — is taking over one-to-many streaming. WebRTC keeps interactive 1-to-1 and small-group conferencing because no other stack ships built-in echo cancellation, noise suppression, GCC-class congestion control, an Opus jitter buffer, simulcast, and SFrame all in one place.

## Fun facts (host material)

**Google paid 142 percent over the closing share price for GIPS.** Sixty-eight million dollars in 2010 dollars for a Norwegian-Swedish startup — specifically because GIPS's NetEQ jitter buffer was already running on 800 million endpoints (Yahoo, AOL Instant Messenger, the rest of the early-2000s VoIP world), and Google didn't want to rebuild that audio engine from scratch. The acquisition was the seed of every Google Meet, Hangouts, Duo, and Stadia voice path for the next fifteen years.

**libwebrtc is three Space Shuttles.** Justin Uberti tweeted in January 2019 that Google's WebRTC implementation had reached 1.21 million lines of code — three times the Space Shuttle's onboard software. The line count has only grown since.

**WebRTC was almost called RTCWEB.** The IETF working group was named RTCWEB; Google's internal team called it WebRTC. The W3C took the public-facing name; the IETF kept "RTCWEB" until the working group closed in 2018. Two acronyms describing the same thing for seven years.

**Discord swapped out DTLS-SRTP for Salsa20.** To save CPU at multi-million-concurrent-voice-user scale, Discord's custom libwebrtc fork uses libsodium's xsalsa20_poly1305 instead of standard DTLS-SRTP on the native client. The browser path always uses standard DTLS-SRTP because that is what the browser API offers. The standard is the floor, not the ceiling.

**SFrame started on a whiteboard.** "SFrame, a mechanism for end-to-end encryption in group video calls, which Emad Omara and I first scribbled on a whiteboard in 2018, and is now widely deployed." — Justin Uberti, on the publication of RFC 9605 in August 2024. Six years from whiteboard to RFC, deployed in Webex and Google Meet and Jitsi and Cloudflare in between.

**Lyra v2 hits Opus quality at one-sixth the bitrate.** Google's neural speech codec scores the same on the MUSHRA listening test at 9.2 kbps as Opus does at 14 kbps, and encodes a 20-millisecond frame in 0.57 milliseconds on a Pixel 6 Pro — 35 times faster than real-time. It is not in libwebrtc's mandatory-to-implement list. Use it via custom builds or WebAssembly.

**Justin Uberti's career arc.** AOL Instant Messenger chief architect from 1997 to 2006, then Google for Hangouts, WebRTC, Duo, and Stadia, then Clubhouse, then Fixie, then OpenAI's Realtime AI lead from November 2024. The same low-latency obsession across 25 years and four companies.

## Where this connects in the book

- **Addressing & Identity** (Part Foundations) — how a packet finds your laptop. WebRTC is the protocol where addressing gets hardest, because the local IP, the public IP, the TURN-relayed address, and the mDNS pseudonym are all different.
- **Client-Server vs Peer-to-Peer** (Part Foundations) — the two communication patterns and what each makes easy or hard. WebRTC is the peer-to-peer answer in the browser, with all of the NAT-traversal mess that implies.
- **UDP** (Part Transport) — three pages of RFC, no guarantees. WebRTC depends on UDP's lack of reliability — head-of-line blocking is exactly what real-time media cannot tolerate. The chapter has the full UDP story including why WebRTC is the only way for a browser to send a UDP packet at all.
- **SCTP** (Part Transport) — the better TCP that lost the deployment war. WebRTC data channels are the largest production SCTP deployment on the public internet, encapsulated in DTLS-over-UDP because raw SCTP is unreachable.
- **RTP and RTCP** (Part Real-time A/V) — the protocol born in 1992 from the MBone audio-cast of the IETF San Diego meeting. WebRTC's media is RTP wrapped in SRTP. The chapter has the codec story, the SFrame retrofit, and the Discord and Zoom RTP-encryption disclosures.
- **WebRTC** (Part Real-time A/V) — the chapter version of this episode. Has the full historical arc: GIPS, the codec wars, Apple's six-year delay, the 2021 RFC bundle, CVE-2023-7024, the Discord 3/25/26 outage. Pair with this episode.
- **SIP and SDP** (Part Real-time A/V) — Henning Schulzrinne's three protocols that carry the world's phone calls. WebRTC consumed SDP wholesale and rejected SIP itself. The chapter covers VoLTE outages, STIR/SHAKEN, ZRTP, and Asterisk.
- **MoQ Transport** (Part Real-time A/V) — sub-second live streaming over QUIC, the first IETF media transport that intentionally is not RTP. The complement to WebRTC for one-to-many distribution.
- **L4S Everywhere** (Part The Modern Frontier) — Comcast's January 2025 launch in six metros, the WebRTC Chromium field trials, ECN-based sub-millisecond queuing delay. The frontier chapter for the congestion-control story this episode references.
- **Books** (Part How to Learn More) — Tanenbaum, Stevens, Kurose & Ross, Grigorik. Sean DuBois's "WebRTC for the Curious" and Grigorik's "High Performance Browser Networking" are the two to read for WebRTC specifically.

## See also (other protocol episodes)

**WebRTC versus SIP.** SIP is the traditional telephony signaling protocol — text-based, request-response shaped like HTTP, the protocol of every VoIP PBX and PSTN trunk on Earth. WebRTC was designed deliberately not to be SIP. Where SIP needs a softphone, an INVITE flow, a registrar, and a proxy, WebRTC needs a JavaScript object and an application-defined signaling channel. Where SIP's offer-answer used SDP because Schulzrinne wrote both, WebRTC kept SDP and threw out SIP. Bridges between the two exist — sipML5, Janus, Kamailio plus rtpengine — but they are gateways, not first-class citizens. Use SIP when you are bridging to the carrier; use WebRTC when the user is in a browser. The SIP episode is the natural pair.

**WebRTC plus UDP.** WebRTC's media plane is UDP. Not "uses UDP the way HTTP uses TCP" — depends on UDP's *lack* of reliability. Late audio is worse than missing audio; a retransmitted packet that arrives 200 milliseconds late delivers something the receiver cannot use. The UDP episode is the substrate. WebRTC is also, until WebTransport reached Baseline in March 2026, the only way for a browser to send a UDP packet at all. That single sentence from the Cloudflare engineering blog is the most-quoted line about WebRTC for a reason.

**WebRTC plus TLS.** WebRTC cannot use TLS directly — TLS requires a reliable, ordered transport, which is exactly what WebRTC is trying to avoid. DTLS, RFC 9147 since April 2022, is structurally TLS 1.3 with explicit sequence numbers, reordering tolerance, fragmentation, and a stateless cookie exchange. WebRTC uses DTLS for two things: deriving the SRTP master key via the TLS exporter, and as the carrier for SCTP data channels. The TLS episode covers the parent protocol.

**WebRTC plus RTP.** Every audio and video packet in a WebRTC session is an SRTP packet — RTP with AES-128-GCM encryption and an authentication tag. WebRTC mandates SRTP, never plain RTP. The RTP episode covers the protocol itself, born in 1992 on the MBone, still the canonical text in 2026.

**WebRTC plus SCTP.** WebRTC data channels are SCTP messages encapsulated in DTLS-over-UDP per RFC 8261 and RFC 8831. One SCTP association per PeerConnection, up to 65535 streams, configurable per-channel reliability. WebRTC is SCTP's largest public-internet deployment by message count — even though almost no one knows SCTP is what they're using. The SCTP episode covers the protocol's failed bid to displace TCP and what survived through QUIC and WebRTC.

**WebRTC plus SDP.** WebRTC inherits SDP's syntax — the m-lines, the rtpmap, the fmtp — but uses it differently. SDP in WebRTC describes the local state of an RTCPeerConnection rather than a session description to send to a phone. JSEP, RFC 9429, is the formalisation of "SDP as state-machine string." The SDP episode covers the protocol's MBone origins and Schulzrinne's role.

**WebRTC versus NAT-traversal (ICE/STUN/TURN).** The NAT-traversal trio (RFC 8445 ICE, RFC 8489 STUN, RFC 8656 TURN) is the load-bearing infrastructure under WebRTC. ICE is the orchestration that picks a candidate pair; STUN is the address-discovery primitive; TURN is the relay fallback when direct paths fail. The NAT-traversal episode walks the wire format and the deployment economics; this episode is about the protocol that finally made browsers reach for it.

**WebRTC plus WebSockets.** The default signaling channel for almost every WebRTC application is a TLS-secured WebSocket — bidirectional, framed, kept open for the life of the call. The WebSockets episode covers the protocol; this episode covers what people do with it once they have one.

## Visual cues for image generation

- An exploded view of the WebRTC protocol stack on a single UDP socket, with STUN, DTLS, and SRTP demuxed off the same port by the first byte of every datagram per RFC 7983, and SCTP riding inside DTLS for data channels. Each layer in a different colour with the demux byte highlighted.
- An ICE candidate-pair grid: peer A's candidates (host, srflx, relay) along the rows, peer B's down the columns, every cell a probe outcome — green for connected, red for failed, the chosen pair circled with its priority value labelled.
- A sequence diagram of a full WebRTC session: signaling-server SDP exchange in dashed lines, ICE STUN binding probes in thin solid lines, DTLS handshake as a thick line, then SRTP media flowing peer-to-peer with the signaling server greyed out to show it is no longer in the path.
- A bar chart of glass-to-glass latency by topology: mesh ~90 ms intra-region, SFU ~150 ms, MCU ~350 ms, TURN-relayed ~250 ms, Cloudflare anycast SFU ~110 ms. Total elapsed time in milliseconds.
- An infographic of libwebrtc's blast radius for CVE-2023-7024: one library at the centre, six browsers (Chrome, Edge, Brave, Opera, Vivaldi, Firefox, Safari) ringing it, one patch landing in all of them within a week of December 21, 2023.
- A timeline of the codec wars from 2011 to 2026: the VP8-vs-H.264 stalemate at IETF 88 (November 2013), Cisco's OpenH264 royalty workaround, RFC 7742 mandating both (March 2016), AV1 default-on for screenshare in Google Meet (2024), AV1 hardware encode in Chrome M120 (December 2023), Dolby's March 23 2026 patent suit against Snap.

## Sources

**RFCs**

- [RFC 8825 — Overview: Real-Time Protocols for Browser-Based Applications](https://datatracker.ietf.org/doc/html/rfc8825)
- [RFC 9429 — JSEP (April 2024, obsoletes 8829)](https://datatracker.ietf.org/doc/rfc9429/)
- [RFC 8826 — Security Considerations for WebRTC](https://datatracker.ietf.org/doc/rfc8826/)
- [RFC 8827 — Security Architecture for WebRTC](https://datatracker.ietf.org/doc/rfc8827/)
- [RFC 8445 — Interactive Connectivity Establishment (ICE)](https://datatracker.ietf.org/doc/html/rfc8445)
- [RFC 8489 — Session Traversal Utilities for NAT (STUN)](https://datatracker.ietf.org/doc/html/rfc8489)
- [RFC 8656 — Traversal Using Relays around NAT (TURN)](https://datatracker.ietf.org/doc/rfc8656/)
- [RFC 9147 — DTLS 1.3 (April 2022)](https://datatracker.ietf.org/doc/rfc9147/)
- [RFC 3711 — Secure Real-time Transport Protocol (SRTP)](https://datatracker.ietf.org/doc/html/rfc3711)
- [RFC 5764 — DTLS-SRTP Key Derivation](https://datatracker.ietf.org/doc/html/rfc5764)
- [RFC 8831 — WebRTC Data Channels](https://www.rfc-editor.org/rfc/rfc8831.html)
- [RFC 9143 — Negotiating Media Multiplexing Using SDP (BUNDLE)](https://www.rfc-editor.org/rfc/rfc9143.txt)
- [RFC 9335 — SRTP Cryptex (Jan 2023)](https://datatracker.ietf.org/doc/rfc9335/)
- [RFC 9605 — SFrame End-to-End Encryption (Aug 2024)](https://datatracker.ietf.org/doc/rfc9605/)
- [RFC 9725 — WHIP (March 2025)](https://datatracker.ietf.org/doc/rfc9725/)
- [W3C WebRTC 1.0 Recommendation](https://www.w3.org/TR/webrtc/)
- [W3C WebTransport](https://www.w3.org/TR/webtransport/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [draft-lcurley-moq-lite](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)

**Papers**

- [Carlucci, De Cicco, Holmer, Mascolo — Google Congestion Control for WebRTC (ACM MMSys 2016)](https://dl.acm.org/doi/10.1145/2910017.2910605)
- [Performance Evaluation of L4S in XR Scenarios (IFIP Networking 2025)](https://networking.ifip.org/2025/images/Net25_papers/1571141457.pdf)

**Vendor and engineering blogs**

- [Discord — How Discord Handles 2.5 Million Concurrent Voice Users with WebRTC](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- [Discord — Behind the Scenes of the 3/25/26 Voice Outage](https://discord.com/blog/behind-the-scenes-of-the-3-25-26-voice-outage)
- [Cloudflare — Cloudflare Calls Anycast WebRTC](https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/)
- [LiveKit — Going Beyond a Single-Core](https://livekit.com/blog/going-beyond-a-single-core)
- [webrtcHacks — The Hidden AV1 Gift in Google Meet](https://webrtchacks.com/the-hidden-av1-gift-in-google-meet/)
- [Google — Lyra v2: A Better, Faster Speech Codec](https://opensource.googleblog.com/2022/09/lyra-v2-a-better-faster-and-more-versatile-speech-codec.html)
- [WebRTC.ventures — WebTransport is Now Baseline](https://webrtc.ventures/2026/04/webtransport-is-now-baseline-what-it-means-for-real-time-media/)
- [WebRTC.ventures — Should You Still Consider AV1 in WebRTC?](https://webrtc.ventures/2026/04/should-you-still-consider-av1-codec-in-your-webrtc-architecture/)
- [Mozilla — WebRTC codecs in MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/WebRTC_codecs)
- [WebRTC for the Curious — Sean DuBois et al.](https://webrtcforthecurious.com)
- [Elixir at Discord — Real-Time Communication at Scale](https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/)

**News**

- [TechCrunch — Google's $68.2M Cash Offer for Global IP Solutions](https://techcrunch.com/2010/05/18/google-makes-68-2-million-cash-offer-for-global-ip-solutions/)
- [Silicon Republic — Google Acquires GIPS for $68.2M](https://www.siliconrepublic.com/business/google-acquires-global-ip-solutions-for-us68-2m)
- [The Hacker News — Urgent New Chrome Zero-Day (CVE-2023-7024)](https://thehackernews.com/2023/12/urgent-new-chrome-zero-day.html)
- [CVE-2023-7024 details](https://www.cvedetails.com/cve/CVE-2023-7024/)
- [Apple Announces WebRTC Support in Safari 11](https://apple.slashdot.org/story/17/06/07/1958242/apple-announces-support-for-webrtc-in-safari-11)
- [9to5Google — Justin Uberti to Clubhouse](https://9to5google.com/2021/05/26/justin-uberti-google-clubhouse/)

**Wikipedia**

- [Wikipedia — WebRTC](https://en.wikipedia.org/wiki/WebRTC)
