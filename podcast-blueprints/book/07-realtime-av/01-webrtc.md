---
id: realtime-av/webrtc
type: chapter
part_id: realtime-av
part_label: VIII
part_title: Real-time A/V
title: WebRTC
synopsis: Peer-to-peer in the browser, ICE/STUN/TURN, DTLS, SRTP — and the only way for a browser to send a UDP packet.
podcast_target_minutes: 15
position_in_book: chapter 51 of 75
listening_order:
  prev: realtime-av/rtp-and-rtcp
  next: realtime-av/sip-and-sdp
related_protocols: [webrtc, udp, websockets, tcp, quic, ip, rtp, tls, sdp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9000, 9605]
images: []
visual_cues:
  - "Two browsers on opposite sides of a NAT cloud, with ICE candidate-pair lines probing each path until one lights up green."
  - "A timeline from May 2010 (Google buys GIPS for $68.2M) through 2011 (libwebrtc open-sourced) to 2026 (1.21M lines, every browser ships it)."
  - "Layer cake of the WebRTC stack: ICE on the bottom, then DTLS, then SRTP for media and SCTP for data, with the JavaScript API as the icing."
  - "A heatmap of a Discord voice outage: media plane staying green while the signaling plane glows red."
  - "The codec wars scoreboard: VP8 and H.264 both required by RFC 7742, with AV1 climbing in 2024 and a Dolby lawsuit landing in March 2026."
---

# Part VIII, Chapter — WebRTC

## The hook
WebRTC is the only way for a web browser to send a UDP packet. Every WebSocket, every fetch, every HTTP/2 stream, even every WebTransport datagram before March 2026 was either TCP or QUIC under browser control with no peer-to-peer mode. That line, from a Cloudflare engineering blog, is the entire reason this chapter exists. If you want two browsers to talk directly to each other, this is the stack.

## The story

### The $68 Million Acquisition That Made WebRTC
WebRTC is a peer-to-peer media stack the W3C standardised between 2011 and 2021. The premise was audacious: a sandboxed browser tab grabs audio and video from the user's microphone and camera and streams them directly to another browser, with no plugin, no server in the media path, and sub-200-millisecond latency.

The audio engine was bought, not built. In May 2010 Google paid 68.2 million US dollars for Global IP Solutions, a Swedish company called GIPS. The reason was one piece of code: the NetEQ jitter buffer, already running on 800 million endpoints. Google open-sourced the result in 2011 as `libwebrtc`. By the end of 2018, libwebrtc had reached 1.21 million lines of code — three times the size of the Space Shuttle's onboard software, per Justin Uberti's 2019 figure.

### NAT Traversal — The Hard Part
Two browsers behind home routers cannot just open a connection to each other. Their public-facing addresses are different from their private ones, and the routers in between were designed for clients reaching out to servers, not peers reaching out to peers.

WebRTC solves this with ICE — Interactive Connectivity Establishment, specified in RFC 8445. Each peer gathers candidate addresses from STUN servers, defined in RFC 8489, sends those candidates to the other peer over a signalling channel of the developer's choosing — often a WebSocket — and then probes every candidate pair until one works. When direct UDP fails, which happens in roughly ten to fifteen percent of cases, TURN relays the media through a third party, per RFC 8656. The full wire format and history of STUN, TURN, and ICE belongs in those protocol episodes.

The media itself is RTP wrapped in SRTP, Secure RTP, RFC 3711. Keys are established through DTLS — Datagram TLS — over the same connection. The TLS episode covers the parent protocol; the RTP episode covers the media envelope. WebRTC also offers a DataChannel for arbitrary application data over the same connection, which is how a multiplayer game ships in-game state alongside its voice chat.

The codec wars ended in a draw. RFC 7742, from March 2016, mandates both VP8 and H.264 Constrained Baseline as the must-implement video codecs. Cisco neutralised the H.264 patent problem by open-sourcing OpenH264 and paying MPEG-LA royalties on everyone else's behalf. Without that move, WebRTC in Safari would have been impossible.

### AV1 came from screen-share
AV1 went default-on for screen-share in Google Meet in 2024. AV1 hardware encode shipped in Chrome M120 in December 2023. Firefox 125 added AV1 plus encrypted media extensions in April 2024. But the royalty-free claim picked up an asterisk: on 23 March 2026, Dolby filed AV1 and HEVC patent suits against Snap, re-opening the question of whether AV1 is actually patent-clean. The codec wars never end.

### CVE-2023-7024 and the libwebrtc Blast Radius
In December 2023, CVE-2023-7024 hit. A heap buffer overflow in libwebrtc's `WebRtcAudioSink::OnSetFormat` was exploited in the wild as Chrome's eighth zero-day of the year. It was fixed in 120.0.6099.129. CISA added it to the Known Exploited Vulnerabilities catalog in January 2024.

The blast radius is the point. The same vulnerable libwebrtc code shipped in Edge, Brave, Firefox, and Safari. One bug, one library, every browser. This is the structural cost of consolidation: libwebrtc is to real-time media what OpenSSL is to TLS, with the same risk profile.

The 2021–2026 spec refresh shipped a generation of follow-ons. RFC 9143 from February 2022 covered BUNDLE. RFC 9147 from April 2022 was DTLS 1.3. RFC 9335 from January 2023 was SRTP Cryptex. RFC 9429 from April 2024 was JSEP-bis. RFC 9605 from August 2024 was SFrame. RFC 9725 from March 2025 was WHIP, replacing a generation of ad-hoc WebSocket signalling for ingest.

### The Discord Voice Outage Post-Mortem
On 25 March 2026, Discord had a major voice outage. The post-mortem published the next week is required reading.

A Kubernetes scale-down of Elixir voice-syncer pods triggered massive HTTPS reconnection storms. Erlang `gun` selective-receive over roughly one-million-message mailboxes added about one millisecond per spawn at 100 spawns per second. The system never recovered without manual intervention.

The lesson, repeated across the field, is that the media plane in WebRTC is robust; the signaling plane is where outages happen. RTP keeps flowing once a connection is established. Getting connections established and re-established is where every production WebRTC deployment burns most of its operational complexity.

Plan B SDP is fully gone now. Deprecation-warned in Chrome M89 in February 2021, removed in M93 in August 2021 with a Reverse Origin Trial through M96 in January 2022. All `sdpSemantics` flag handling was finally removed from Chromium in 2024. Unified Plan is the only remaining SDP semantics. The SDP episode picks up the format itself.

## The figures

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport
The 2021 Proposed Standard, edited by Jana Iyengar and Martin Thomson, is the canonical reference for QUIC. Section 5 covers connections — connection IDs, paths, and migration. Section 13 covers loss recovery and congestion control. Section 17 specifies the long and short packet header formats. WebRTC does not use QUIC for media today, but the chapter cites it as the other big UDP-based transport the browser knows how to speak.

### RFC 9605 — SFrame
Cited in the chapter as part of the 2021–2026 WebRTC spec refresh. Published August 2024. SFrame defines an end-to-end frame-level encryption layer for media, sitting above SRTP so that selective forwarding units can route encrypted media without ever holding the keys.

## What you'd see in the simulator
Press play in the WebRTC peer connection simulator and you see two browsers on opposite sides of the screen. The first thing they do is talk to a signaling server — not to send media, but to swap SDP offers and answers describing what each side can do. Once those descriptions are exchanged, ICE kicks in. Each peer gathers candidate addresses from STUN, sends them across the signaling channel, and starts probing every candidate pair in parallel. When one pair lights up as reachable, the simulator picks it. DTLS then runs its handshake over that path, agrees on keys, and from that moment the green media stream flows directly between the two browsers — the signaling server is no longer in the loop.

## What it taught the industry
The chapter's running argument is the lesson. The media plane is not where WebRTC fails in production — RTP just keeps flowing. The signaling plane is where outages happen, and the Discord post-mortem from March 2026 is the canonical example. The second lesson is consolidation risk: when one library, libwebrtc, ships inside every browser, one heap overflow becomes everyone's heap overflow. The third is that "royalty-free" is a moving target — VP8 and H.264 fought to a mandated draw in 2016, and AV1's clean reputation took its first real hit in March 2026 when Dolby sued Snap.

## Listening order

- **Before this chapter:** "RTP and RTCP" — sets up the media envelope and feedback channel that WebRTC inherits and wraps in SRTP.
- **After this chapter:** "SIP and SDP" — picks up the session-description format WebRTC uses for offer/answer and the older signaling world it grew out of.

## Where to go deeper
- The WebRTC episode picks up the protocol record itself — the bundle of ICE, DTLS, SRTP, and SCTP, and the JavaScript API that hides them.
- The UDP episode is the foundation — fire-and-forget delivery with an 8-byte header, the only transport WebRTC can use end-to-end.
- The RTP episode covers the media envelope: sequence numbers, timestamps, payload type identification, and the RTCP feedback loop.
- The TLS episode covers the parent of DTLS — the handshake, the 1-RTT story in TLS 1.3, and the certificate model.
- The SDP episode covers the offer/answer text format every WebRTC call exchanges before any media flows.
- The QUIC episode covers the other UDP-based transport the browser speaks, and the one cited as RFC 9000 in this chapter.
- The WebSocket episode covers the most common signaling channel WebRTC pairs with in practice.
- The TCP episode is the contrast — the reliable, ordered transport that WebRTC explicitly does not use for media.
- The IP episode is the layer underneath everything, the one ICE is fighting against when it tries to find a working path through NAT.

## Visual cues for image generation
- Two browser windows separated by a NAT cloud, with multiple ICE candidate-pair probe lines, and the winning pair highlighted in green.
- A timeline of WebRTC milestones: May 2010 GIPS acquisition for $68.2M, 2011 libwebrtc open-sourced, March 2016 RFC 7742 mandates VP8 and H.264, December 2023 CVE-2023-7024, March 2026 Discord outage and Dolby vs Snap.
- A stack diagram of the WebRTC protocol bundle — ICE for connectivity, DTLS for keys, SRTP for media, SCTP for data — with the browser JavaScript API on top.
- A side-by-side of a healthy WebRTC call and the Discord outage: media plane green and flowing in both, signaling plane green on the left and red on the right.
- A "blast radius" diagram showing one libwebrtc bug propagating into Chrome, Edge, Brave, Firefox, and Safari simultaneously.
