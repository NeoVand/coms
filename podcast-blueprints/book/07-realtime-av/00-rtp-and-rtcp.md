---
id: realtime-av/rtp-and-rtcp
type: chapter
part_id: realtime-av
part_label: VIII
part_title: Real-time A/V
title: RTP and RTCP
synopsis: Carrying media on top of UDP — the protocol born from MBone in 1992.
podcast_target_minutes: 15
position_in_book: chapter 50 of 75
listening_order:
  prev: async-iot/coap
  next: realtime-av/webrtc
related_protocols: [rtp, udp, webrtc, quic]
related_pioneers: [van-jacobson, steve-deering]
related_outages: []
related_frontier: [l4s-comcast-launch]
related_rfcs: [1889, 3550, 9605]
images: []
visual_cues:
  - "March 1992 photo treatment: a small group at the IETF San Diego meeting wearing headphones, with a map of the early MBone overlay showing about twenty audio-cast sites lit up across the United States and Europe."
  - "Anatomy of an RTP packet riding on UDP: a UDP header on the left, then the RTP fixed header — version field highlighted with a giant '2' and a footnote 'because version 0 was Casner's 1992 vat audio tool wire format' — sequence number, timestamp, payload type, then the codec payload."
  - "Two parallel flows side by side: an RTP stream carrying voice frames, and an RTCP stream carrying receiver reports, sender reports, and CNAME source descriptions, with arrows showing the feedback loop adapting the codec bitrate."
  - "Discord-scale infographic: 2.5 million concurrent voice users fanning out across 850-plus voice servers, in 13 regions and 30-plus data centers, with a callout that the SFU forwards RTP using libsodium xsalsa20_poly1305 instead of DTLS-SRTP."
  - "Frontier roadmap: an RTP packet on the left, an RTP-over-QUIC packet on the right with ALPN token 'roq' labelled, and a small badge marking July 2025 — Working Group Last Call for draft-ietf-avtcore-rtp-over-quic-14."
---

# Part VIII, Chapter — RTP and RTCP

## The hook

Every RTP packet on Earth has a version field of 2. Not because version 2 is the latest revision, but because version 0 was Steve Casner's 1992 vat audio tool wire format and version 1 was a transitional draft. Thirty-four years later, that historical fingerprint is still on every voice call that crosses the public internet.

## The story

### A Datagram Per Frame, A Timestamp Per Packet

RTP is the protocol that runs underneath every voice call, every video conference, and every broadcast media stream on the internet. Its origin is unusually specific. In March 1992, Steve Casner, Van Jacobson, and Steve Deering audio-cast the IETF San Diego meeting to roughly twenty sites over the new Multicast Backbone — the MBone. The work that came out of that experiment was published as RFC 1889 in January 1996 and re-issued as RFC 3550 in July 2003. Schulzrinne, Casner, Frederick, and Jacobson are the names on the header. RFC 3550 is still the canonical text in 2026.

RTP rides on top of UDP because late audio is worse than missing audio. Retransmitting a packet that arrives 200 milliseconds late delivers something the receiver cannot use. So RTP gives up reliability and gives the application three small additions on top of a UDP datagram. A sequence number, so the receiver can detect loss and reorder out-of-order packets. A timestamp, so playback can be paced correctly. And a payload type field, so the receiver knows which codec to feed the bytes into. The mechanics of UDP — the eight-byte header, the deliberate absence of guarantees — are the subject of the UDP episode earlier in the book.

### The Subtle Design Choice That Saved SRTP

There is one design decision in the original 1996 spec that turned out to matter far more than its authors expected. RTP requires both the sequence number and the timestamp to start from random initial values, not from zero. The spec authors thought it was good practice for synchronisation. Eight years later, when the working group built SRTP — secure RTP — that randomness turned out to be load-bearing for the AES-CTR nonces. Random sequence numbers are the entropy that keeps the per-packet AES counter unique across reboots and re-keys. A 1996 hygiene decision became a 2004 cryptographic primitive.

The companion protocol, RTCP — the RTP Control Protocol — flows alongside RTP on a parallel port. RTCP carries three things. Receiver reports, with loss rates and jitter measurements. Sender reports, which map wall-clock time to RTP timestamps so a participant can sync audio and video that came from different sources. And source descriptions, including CNAME — the canonical participant identifier. RTCP is the feedback channel. It is what lets a video conferencing client notice that 8 percent of audio packets are being dropped and tell the encoder to step the codec down to a lower bitrate.

In 2020, RFC 8888 finally unified per-packet RTCP feedback formats across the major congestion-control schemes — Google Congestion Control, Cisco's NADA in RFC 8698, and Ericsson's SCReAM in RFC 8298. L4S- and ECN-marked feedback is now live in libwebrtc behind the field trial flag `WebRTC-RFC8888CongestionControlFeedback/Enabled`. That is the bridge from RTP into the L4S frontier — the launch entry on the Frontier page picks up that story.

In August 2024, RFC 9605 finally standardized SFrame — end-to-end frame-level encryption that travels through SFUs without those SFUs ever decrypting the media. Justin Uberti and Emad Omara, by their own account, scribbled the original idea on a whiteboard in 2018. Discord's DAVE protocol, deployed on 1 March 2026, layers MLS keys plus SFrame on top of RTP and SRTP for end-to-end encrypted voice across 2.5 million concurrent users.

### Discord, Zoom, and the SFU Reality

Discord runs the largest publicly documented RTP fleet on the internet. A homegrown C++ SFU forwards RTP for 2.5 million concurrent voice users across more than 850 voice servers, in 13 regions and more than 30 data centers. To save CPU at that scale, Discord swapped DTLS-SRTP for libsodium's xsalsa20_poly1305 inside their custom libwebrtc fork. That choice illustrates an old field axiom — the standard is the floor, not the ceiling. The standard tells you what interoperates. The largest deployments routinely strip parts of it out when CPU budgets force the issue.

The 2020 Citizen Lab Zoom disclosure was the cautionary tale on the other side of that axiom. Zoom wrapped RTP in a custom transport over UDP port 8801 and encrypted it with AES-128-ECB. ECB mode leaks patterns — identical input blocks produce identical output blocks, which means encrypted video frames showed visible patterns of motion through the ciphertext. Industry pressure forced a switch to AES-GCM and ultimately to end-to-end encryption.

Asterisk had its own RTP security incident in 2017 — the advisories were AST-2017-008 and AST-2017-012, known as Asterisk RTP Bleed. Asterisk's `strictrtp` port-latching mechanism had no authentication. An attacker flooding the UDP port range at between 28 and 168 megabytes per second could re-train the media flow to themselves. The first patch missed RTCP and missed a race condition, which required a second advisory. RTP's design assumes the network will deliver the packets to the right port. When the port is the only thing identifying the flow, the port becomes the attack surface.

### RTP-over-QUIC — The Frontier

The active frontier as of 2026 is RTP-over-QUIC, known as RoQ. The draft is `draft-ietf-avtcore-rtp-over-quic-14` and it entered Working Group Last Call in July 2025. The ALPN token is `roq`. RoQ multiplexes RTP sessions over a single QUIC connection. It preserves the entire RTP ecosystem — every codec, every payload format, every receiver report — and gains QUIC's encryption, NAT-friendliness, and 0-RTT resumption. The mechanics of QUIC's single-handshake encryption and the meaning of 0-RTT are the QUIC episode.

The IETF AVTCORE working group has had a busy 2025 and 2026. In 2024, RFC 9628 finally promoted the VP9 RTP payload format to Standards Track. Drafts in flight cover haptic-feedback payloads, V3C volumetric video, the third edition of JPEG XS, the APV codec, and a HEVC and H.265 WebRTC profile — `draft-ietf-avtcore-hevc-webrtc-08`, March 2026. RTP keeps acquiring new payload formats forty years after Casner first audio-cast the IETF San Diego meeting.

## The figures

### Van Jacobson

Father of TCP congestion control, born 1950, at Lawrence Berkeley Lab, then Cisco, then PARC, then Google. After the October 1986 collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley dropped from 32 kilobits per second to 40 bits per second — Jacobson and Mike Karels published "Congestion Avoidance and Control" at SIGCOMM 1988. That one paper introduced slow start, AIMD congestion avoidance, fast retransmit, and exponential RTO backoff — six algorithms in a single paper, arguably the highest-leverage networking paper ever written. The fixes shipped in 4.3BSD-Tahoe and saved the internet. He also wrote traceroute, wrote the BPF — Berkeley Packet Filter — that powers tcpdump, and co-authored RFC 1144 on compressing TCP/IP headers for low-speed serial links. He co-authored the 2016 BBR paper at Google. He won the ACM SIGCOMM Award in 2001 and the IEEE Internet Award in 2003. He has his own episode in the Pioneers part of the book — and his name is on the original RTP RFC because he was one of the people doing the audio-casting on the MBone in March 1992.

### Steve Deering

Architect of IPv6 and IP multicast, born 1951, at Xerox PARC and then Cisco. He invented IP multicast in his 1991 Stanford PhD thesis — the work that became the Internet Group Management Protocol, IGMP — enabling the efficient one-to-many communication that powers IPTV, financial market data feeds, and intra-data-center pub/sub today. He was the primary architect of IPv6 alongside Bob Hinden, on RFC 1883 in 1995, RFC 2460 in 1998, and the current RFC 8200 in 2017, which is now Internet Standard 86. He designed the simplified 40-byte header, the extension-header chain, the link-local addressing, and the no-in-network-fragmentation rule. On 28 March 2026, IPv6 carried 50.1 percent of Google's traffic for the first time, 28 years after his spec. He won the IEEE Internet Award in 2010. He belongs in this chapter because the MBone — the network on which RTP was first proven — was IP multicast, and IP multicast was Deering's invention. He has his own episode.

### L4S Launches in Production at Comcast

L4S — Low Latency, Low Loss, Scalable throughput — is the IETF architecture for sub-millisecond queuing latency, specified in RFCs 9330, 9331, and 9332 in January 2023. Comcast launched it in production in late January 2025 in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville Maryland, and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The mechanism — cooperating senders mark packets ECN-Capable, routers running the DualQ Coupled AQM mark instead of dropping when congestion is incipient, and senders react to marks like minor losses without backing off as hard — is described in detail in the L4S launch entry on the Frontier page. The reason L4S matters in this chapter is that it is the path forward for real-time RTP traffic on residential ISPs. RFC 8888's per-packet feedback is what carries the marks back to the sender so the codec can adapt without bufferbloat.

### RFC 1889 — RTP: A Transport Protocol for Real-Time Applications

Published January 1996, status historic. Authored by Schulzrinne, Casner, Frederick, and Jacobson. The first standardized RTP specification. Obsoleted by RFC 3550.

### RFC 3550 — RTP: A Transport Protocol for Real-Time Applications

Published July 2003, status Internet Standard. Same four authors. The current canonical text. Defines the fixed header, the requirement for random initial sequence numbers and timestamps, and the RTCP feedback model. Still the spec every RTP implementation reads from in 2026.

### RFC 9605 — SFrame

Published August 2024. Standardizes SFrame — Secure Frame — for end-to-end frame-level media encryption that traverses SFUs without per-hop decryption. The basis for Discord's DAVE protocol and an ingredient in WebRTC's emerging end-to-end encrypted media path.

## What you'd see in the simulator

The simulator runs an RTP stream alongside an RTCP feedback channel. You press play and the sender starts emitting RTP packets on a UDP port. Each packet carries a sequence number that increments by one, a timestamp that advances by the codec's frame interval, and a payload type that names the codec — Opus, say, or H.264. The receiver reorders any packets that arrive out of sequence by their sequence number and uses the timestamp to pace playback so the audio plays at its original rate. On a parallel port, RTCP sends receiver reports back at intervals — packet loss percentage, jitter, the highest sequence number seen — and the sender uses that feedback to decide whether to keep the codec at its current bitrate or step it down. If you crank the simulated loss up, you can watch the codec adapt in real time.

## What it taught the industry

Three things settled into real-time media practice because of RTP.

First, *give up reliability where it doesn't help*. RTP could have been built on TCP. It was built on UDP because the right policy for late audio is to discard it, not to retransmit it. Every real-time media protocol since — including WebRTC, including the RTP-over-QUIC frontier — has inherited that decision. The mechanism is the next chapter, the WebRTC episode.

Second, *put the feedback in a sibling protocol, not in the data path*. RTCP runs alongside RTP on a parallel port precisely so the data path stays narrow and the feedback can carry rich, structured reports — loss rates, jitter, sender-receiver clock mappings — without bloating every media packet. RFC 8888 is the modern continuation of that idea: per-packet feedback carrying L4S marks so codecs can adapt at the same timescale the network reacts at.

Third, *the standard is the floor, not the ceiling*. Discord swapped DTLS-SRTP for libsodium and runs 2.5 million concurrent voice users on a custom SFU. Zoom wrote a custom transport over UDP 8801 — and got it wrong with AES-128-ECB. The standard tells you what interoperates with everything else. The largest deployments routinely strip the standard down to its load-bearing parts and replace the rest. That works until it doesn't.

## Listening order

- **Before this chapter:** *CoAP* — closed out the async and IoT part of the book with constrained-device messaging over UDP, which sets up the general theme this chapter inherits: when you build on UDP, you take responsibility for everything UDP does not give you.
- **After this chapter:** *WebRTC* — picks up the protocol bundle that wraps RTP for the browser — ICE for connectivity, DTLS for key exchange, SRTP for the media itself.

## Where to go deeper

- The UDP episode covers the eight-byte header and the deliberate absence of guarantees that made UDP the right substrate for media in the first place.
- The WebRTC episode picks up the bundle of protocols around RTP — STUN, TURN, ICE, DTLS, SRTP, and SCTP data channels — that turned browser-to-browser media into something a JavaScript developer could ship.
- The QUIC episode sets up the substrate that RTP-over-QUIC is moving toward — the single-handshake encryption, 0-RTT resumption, and connection migration that RoQ inherits.
- The L4S launch entry on the Frontier page covers the DualQ Coupled AQM and ECN-marked feedback that RFC 8888 carries back to RTP senders.
- The Van Jacobson episode in the Pioneers part of the book covers the 1986 congestion collapse, the SIGCOMM 1988 paper, and the long arc from slow start to BBR — context for why one of RTP's authors was already the most consequential transport engineer alive in 1992.
- The Steve Deering episode covers the IP multicast work that built the MBone — the network on which RTP was first proven.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [RFC 1889](https://www.rfc-editor.org/rfc/rfc1889)
- [RFC 3550](https://www.rfc-editor.org/rfc/rfc3550)
