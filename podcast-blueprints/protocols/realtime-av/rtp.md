---
id: rtp
type: protocol
name: Real-time Transport Protocol
abbreviation: RTP
etymology: "[R]eal-time [T]ransport [P]rotocol"
category: realtime-av
year: 1996
rfc: RFC 3550
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/reliability-speed
  - story-of-the-internet/the-quic-redesign
  - transport/udp
  - transport/quic
  - realtime-av/rtp-and-rtcp
  - realtime-av/webrtc
  - realtime-av/sip-and-sdp
  - realtime-av/moq-transport
  - frontier/l4s-everywhere
related_protocols: [udp, webrtc, sip, sdp, nat-traversal]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [3550, 3551, 3711, 4585, 5104, 5761, 5764, 7587, 7714, 8285, 8108, 8834, 8888, 9605, 9628, 9725]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg/500px-SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg
    caption: Henning Schulzrinne — co-author of RTP (RFC 3550) and SIP, later FCC CTO — speaking at SIPNOC 2012.
    credit: Photo — SIPNOC / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "An illustrated 12-byte RTP header — four 32-bit rows. Row one shows the V/P/X/CC nibble, the M bit, the 7-bit payload type, and the 16-bit sequence number. Row two is the 32-bit timestamp. Row three is the 32-bit SSRC. Row four shows optional CSRCs trailing off into a dotted line."
  - "A side-by-side: a single RTP packet on the left (12-byte header, 160-byte Opus payload, total 200 bytes including IP and UDP). On the right, the same packet wrapped as SRTP — same header in clear, payload encrypted with AES-CM, an HMAC-SHA1 tag appended."
  - "A sequence diagram of a WebRTC call from cold start: ICE candidate gathering, STUN binding requests, DTLS handshake over the chosen pair, then SRTP audio (PT=111 Opus) and SRTP video (PT=96 H.264) flowing in both directions, with periodic SRTCP receiver reports going back."
  - "An SFU topology — one publisher in the centre, six subscribers around the edge, with the SFU box in between forwarding selected RTP streams. Arrows from the SFU show the RTP packets passing through unchanged; a small lock icon over each arrow shows SFrame end-to-end frame encryption."
  - "A timeline labelled 'thirty years of RTP': March 1992 MBone audiocast, January 1996 RFC 1889, July 2003 RFC 3550, 2004 SRTP, January 2021 RFC 8834 (RTP in WebRTC), August 2024 RFC 9605 SFrame, March 2025 RFC 9725 WHIP, July 2025 RoQ Working Group Last Call."
  - "A jitter-buffer diagram: packets arriving at irregular intervals on the left (some bunched, one missing, one out of order), pooling into a 40-200 ms buffer in the middle, leaving as a smooth metronome on the right at the codec's playout clock."
---

# RTP — Real-time Transport Protocol

## In one breath

RTP is the twelve-byte envelope that carries every voice call, every video conference, and every live broadcast on the internet. It runs on UDP because retransmitting a 200-millisecond-late audio packet is worse than dropping it; instead, it gives the receiver enough metadata — sequence number, timestamp, payload type, source identifier — to detect loss, reorder packets, synchronise streams, and adapt the codec on the fly. RFC 3550 has been an Internet Standard since 2003, and in 2026 it still carries Zoom, Teams, Meet, Webex, FaceTime, WhatsApp, Discord, and every VoIP phone in service.

## The pitch (cold-open)

In March 1992, a few hundred network researchers at the IETF San Diego meeting turned on their workstations and heard each other's voices come over the public internet. The audiocast went out to about twenty sites worldwide on a hand-rolled overlay called the MBone, built by Steve Casner, Van Jacobson, and Steve Deering. Four years later, four authors published RFC 1889. They called it the Real-time Transport Protocol. Twelve bytes of header, no retransmission, no delivery guarantee. Today, every Zoom call you make and every 911 call routed over IP rides on top of those twelve bytes — and in 2026 we are finally moving them onto QUIC without changing a single field.

## How it actually works

RTP has no session setup of its own. A signaling protocol — SIP, JSEP for WebRTC, RTSP, or WHIP — negotiates ports, codecs, and keys first. Then the sender packetises a media frame (one Opus block, one H.264 NAL unit), prefixes a 12-byte RTP header, and sends it as a UDP datagram. The receiver uses the sequence number to detect loss and reorder, the timestamp to drive the playout clock, and the SSRC to demultiplex multiple streams on the same socket. A jitter buffer of 40-200 milliseconds smooths out arrival variance before playback. Meanwhile, the companion protocol RTCP runs on the same path — usually multiplexed on the same port via RFC 5761 — and periodically carries Sender Reports, Receiver Reports, and per-packet feedback. The sender uses that feedback to drop the bitrate, switch codecs, request a keyframe, or back off pacing.

### Header at a glance

The fixed RTP header is exactly 12 bytes — there is no negotiated length, no options, no version skew. The fields, byte by byte:

- **V (2 bits)** — always `2` for RTPv2. Value 1 was the early draft. Value 0 was Steve Casner's 1992 `vat` audio tool wire format. Thirty-four years later, every voice call still encodes the existence of `vat`.
- **P (1 bit)** — padding flag. If set, the last byte of the packet is a count of trailing pad bytes to ignore. Used for AES block alignment in SRTP.
- **X (1 bit)** — extension flag. If set, the fixed header is followed by a single profile-defined extension block. RFC 8285 lets WebRTC stuff multiple typed extensions in there: speaker level, BUNDLE `mid`, `abs-send-time`, `transport-wide-cc`.
- **CC (4 bits)** — the count of contributing source IDs that follow when an RTP mixer combined multiple streams.
- **M (1 bit)** — marker. Profile-specific. For audio, end of a talkspurt. For video, last packet of a frame.
- **PT (7 bits)** — payload type. Static 0-34 are reserved (0 = PCMU, 8 = PCMA). Dynamic 96-127 are negotiated in SDP via `a=rtpmap`.
- **Sequence number (16 bits)** — random initial value, increments by 1 per packet, wraps modulo 65,536 every roughly 65k packets.
- **Timestamp (32 bits)** — sampling instant of the first byte of payload, random initial value, ticks at the codec's clock rate. Eight kilohertz for narrowband audio. Forty-eight kilohertz for Opus. Ninety kilohertz for video.
- **SSRC (32 bits)** — the synchronization source, a random unique identifier for this stream within the session.
- **CSRC list (0-15 × 32 bits)** — only present when a mixer combined sources, listing each contributor's SSRC.

A worked example: a 20-millisecond G.711 µ-law audio frame is 160 samples, exactly 160 bytes. With IP (20) + UDP (8) + RTP (12) + payload (160), the wire packet is 200 bytes. PT is 0. The marker bit is clear. The timestamp advances by 160 each packet. That packet shape has not changed since January 1996.

### State machine in three sentences

RTP itself is essentially stateless — the sender just emits packets and the receiver just consumes them. The state lives in three other places: the signaling protocol that set up the session (SIP transactions, JSEP offer-answer, WHIP HTTP exchange), the security layer (the DTLS handshake that derives SRTP keys, plus SRTP's per-stream replay window), and the receiver's own jitter buffer and reception statistics. RFC 3550 only specifies one piece of stateful logic worth knowing: the SSRC collision algorithm in section 8.2 — when two participants pick the same 32-bit identifier, both rerandomise and emit an RTCP BYE for the old one.

### Reliability, flow, and security mechanics

RTP has no retransmission, no acknowledgements, and no congestion control of its own. The reliability story is delegated. Application-level retransmissions can be requested via RTCP NACK (RFC 4585) and answered on a separate RTX SSRC with a different payload type. Forward error correction and redundant audio frames are alternatives when feedback round-trips are too slow. The receiver's jitter buffer is the real workhorse — adaptive between 40 and 200 milliseconds for audio is sane; static 20 milliseconds on the open internet is a misconfiguration.

Flow control is RTCP's job. AVPF (RFC 4585) added immediate feedback packets — PLI for picture loss, NACK for sequence-number gaps, FIR for full intra request, TMMBR for temporary maximum bitrate. RFC 8888 (2020) finally unified per-packet feedback for the three competing congestion-control algorithms — Google Congestion Control, Cisco's NADA (RFC 8698), and Ericsson's SCReAM (RFC 8298). RFC 3550 caps RTCP at 5 percent of session bandwidth, with 25 percent of that for senders.

Security is layered on top. SRTP (RFC 3711, 2004) wraps the RTP payload in AES counter mode — AES-CM by default, AES-GCM via RFC 7714 — and adds an HMAC-SHA1-80 tag plus a sliding replay window. SRTCP authentication is mandatory; SRTP encryption is optional but standard. DTLS-SRTP (RFC 5764) keys the session by running a TLS 1.3 handshake over UDP and exporting the master key. WebRTC mandates DTLS-SRTP and the RTP/SAVPF profile. SDES keying (keys in cleartext SDP) is deprecated. ZRTP (RFC 6189) — Phil Zimmermann's in-band Diffie-Hellman with Short Authentication Strings, where the two callers read four characters aloud — is the residual alternative.

The subtle design choice that aged well: RFC 3550 specifies that both the sequence number and the timestamp **must** start from random values, not zero. The 1996 authors thought it was good cryptographic hygiene. Eight years later, SRTP's AES counter mode used those very fields as part of its per-packet nonce. Predictable starts would have meant predictable nonces, which would have meant key reuse, which would have broken AES-CTR. The protocol was layered onto a wire format that already preserved the entropy it needed.

## Where it shows up in production

**Discord** runs the largest publicly documented RTP fleet on the planet. Their custom C++ SFU forwards RTP for around 2.5 million concurrent voice users across more than 850 voice servers in 13 regions and over 30 data centers. To save CPU at that scale, they swapped DTLS-SRTP for libsodium's `xsalsa20_poly1305` in their libwebrtc fork — illustrating the field axiom that the IETF standard is the floor, not the ceiling. Discord's DAVE protocol, deployed by 1 March 2026 with all non-E2EE voice deprecated on that date, layers MLS group keys plus SFrame-style frame encryption on top of the SRTP transport.

**Zoom** is an instructive counter-example. Citizen Lab's April 2020 reverse engineering showed Zoom wraps RTP inside a custom transport over UDP port 8801 and originally encrypted the payloads with AES-128 in ECB mode — a pattern-leaking choice that preserved visible structure across encrypted video frames. Industry pressure forced a switch to AES-GCM and ultimately a published E2EE design. Zoom Phone, the carrier-style product, uses standard SIP/TLS plus SRTP with AES-256.

**Google Meet, Microsoft Teams, Webex** — all are RTP/SRTP at the wire level with WebRTC-style profiles, enriched with proprietary extensions and proprietary congestion control. Meet shipped AV1 default-on for screen-share in 2024.

**Cloudflare Realtime** (formerly Cloudflare Calls) anycast-routes a TURN and SFU service across a self-reported 330 global locations. Standalone TURN is priced at five cents per gigabyte outbound. Amazon Chime SDK, Twitch IVS, Daily.co, and LiveKit Cloud all sit on the same SFU-plus-RTP foundation.

**The carrier voice fleet** — VoLTE and VoNR — is the single largest deployment of SIP-plus-SDP-plus-RTP on Earth. The GSMA reported over 310 VoLTE operators in 140-plus countries and more than 45 commercial VoNR networks by 2025. Every IMS voice call in your pocket is an RTP stream.

**WhatsApp, Facebook Messenger, FaceTime** all use RTP for the media path with proprietary E2EE schemes layered above.

**The open-source stack you actually deploy:** libwebrtc (the Chromium reference implementation, also embedded in Edge, Brave, and Electron); Pion (pure Go, MIT-licensed, congestion-control work funded by NLnet); mediasoup (C++/Node SFU, around 500 consumers per CPU subprocess per its own docs); LiveKit (Go SFU, with `lk load-test` for capacity planning); Janus (Meetecho's general-purpose WebRTC server); Jitsi Videobridge (powers Jitsi Meet and 8x8); GStreamer's `webrtcbin`; FFmpeg's RTP demuxer/muxer; PJSIP and Asterisk and FreeSWITCH and Kamailio and OpenSIPS for the carrier-grade RTP engines; libsrtp from Cisco, used by virtually all of the above. Discord's blog, mediasoup's docs, and webrtcHacks's load-testing series are the most-cited public benchmarks.

## Things that go wrong

**The Asterisk RTP Bleed (2017).** Asterisk is the world's most-deployed open-source PBX, and its `strictrtp` port-latching had no authentication. The first real RTP packet to arrive at a port "won" — Asterisk locked the media flow to that source. Klaus Petter Darilion realized this could be weaponised: an attacker anywhere on the internet could spray RTP packets at the UDP port range — for default ports and codecs, between 28 and 168 megabytes per second of traffic — and once any matched a live call, Asterisk would re-train and start delivering the real call's audio to the attacker. Voicemails, conference calls, and customer-support recordings could be silently siphoned.

The first patch (AST-2017-008) was incomplete. The Asterisk team later admitted that "while RTP packets would no longer re-train to a malicious attacker's source address, RTCP packets could still be stolen using the same packet flooding approach." A second advisory (AST-2017-012) followed weeks later, fixing the RTCP path and a race condition that let attackers preempt latching by sending the very first packet faster than the legitimate peer. Asterisk published an unusually candid retrospective. The deeper lesson is the one repeated through this section: latency-friendly does not mean trust-friendly. The chapter on RTP and RTCP carries more of this story.

**Zoom's "rolled their own crypto" disclosure (April 2020).** Citizen Lab's Bill Marczak and John Scott-Railton showed Zoom used AES-128 in ECB mode on RTP payloads, with one shared key per meeting. ECB preserves patterns: identical plaintext blocks produce identical ciphertext blocks, so structure in encrypted video frames was visible to anyone watching the wire. The industry response forced Zoom onto AES-GCM in counter mode and pushed the company toward a published E2EE design. The takeaway, again: SRTP's AES-CM and GCM modes exist precisely to preserve real-time properties without ECB's pattern leak.

**Asterisk RTCP RCE family (CVE-2017-14098).** A specially crafted RTCP packet caused out-of-bounds memory access in `res_rtp_asterisk.c`, leading to crash or arbitrary code execution depending on context.

**Asterisk SRTP replay (2021).** Incorrect access controls in `res_srtp.c` let a remote unauthenticated attacker prematurely terminate secure calls by replaying SRTP packets — affecting Asterisk 13.38.1, 16.16.0, 17.9.1, and 18.2.0.

**libsrtp historical CVEs.** CVE-2015-6360 was a DoS via integer underflow in CSRC count and extension header length handling, fixed in libSRTP 1.5.3. CVE-2013-2139 was a buffer overflow in crypto-profile application, fixed in the same line. As of May 2026, no new high-severity libsrtp-specific CVE has surfaced in 2024-2026; the active CVE traffic in this ecosystem has been on PJSIP and Asterisk SIP/SDP layers rather than RTP/SRTP itself.

**PJSIP STUN integer underflow (CVE-2022-31031 family).** A malicious actor on the victim's network could forge a STUN message that remotely executed arbitrary code. Important because PJSIP's STUN is the gateway to its RTP and ICE engines.

**The Discord 25 March 2026 voice outage.** A Kubernetes scale-down of Elixir voice-syncer pods caused HTTPS reconnection storms; Erlang `gun` selective-receive over million-message mailboxes added about a millisecond per spawn at 100 spawns per second; the system never recovered without manual intervention. The published lesson — and the one any operator running an SFU should internalise — is that the media plane in WebRTC is robust; the signaling plane is where outages happen. RTP keeps flowing once a connection is established; getting connections established is where production deployments burn most of their operational complexity. The chapter on WebRTC carries the full post-mortem.

## Common pitfalls (for the practitioner)

- **NAT timeout drops audio at 30-120 seconds.** UDP NAT mappings expire silently. Without a keepalive — STUN binding requests, RFC 7675 consent freshness — the pinhole closes and the next inbound RTP packet is dropped at the NAT.
- **Clock-rate mismatch produces chipmunked or sped-up audio.** Sender encodes at 48 kHz Opus, signals 48000 in `a=rtpmap`, and a buggy gateway transcodes to 8 kHz µ-law without rewriting timestamps. The receiver plays at the wrong rate.
- **SSRC collisions pollute reception reports.** Two endpoints generating the same 32-bit SSRC corrupt RTCP. RFC 3550 section 8.2 specifies the collision algorithm. Modern stacks just seed from `/dev/urandom` and trust the birthday math.
- **Payload type clashes break re-INVITE.** Static PT 0 = PCMU is fine forever. Dynamic PT 100 means whatever this SDP says — re-using 100 for two different codecs in a re-INVITE is a classic source of "no audio" tickets. Pin PTs in your `a=rtpmap` and audit them.
- **Jitter buffer too small.** A 20-millisecond buffer "for low latency" on a Wi-Fi link with 50 milliseconds of jitter underflows on every burst.
- **MTU and fragmentation.** Sending 1450-byte H.264 packets through a 1400-byte tunnel produces IP fragmentation, then loss, then useless retransmission storms. Packetisers must size below the path MTU — assume 1200 bytes after VPN and tunnel overhead.
- **`c=` line in SDP is `0.0.0.0`.** The box behind NAT didn't apply ICE candidates.
- **Mismatched RTCP CNAMEs across `m=audio` and `m=video`.** Lip-sync breaks because the receiver cannot bind the two SSRCs to the same participant.
- **`rtcp-mux` mismatch.** One side multiplexes RTP and RTCP on a single port; the other expects RTCP on port+1; everything stalls.
- **Duplicate `a=fmtp:` profile-level-id strings.** Codec negotiation falls back to a degraded baseline mode.
- **BUNDLE not implemented at the gateway.** The extra ports get blocked at the corporate firewall.

## Debugging it

Wireshark's RTP/RTCP/SRTP dissectors are the spine of the workflow. Capture on the egress interface with `udp portrange 10000-60000`. From the menu, *Telephony → RTP → RTP Streams* lists every SSRC on the wire with packet count, loss, and jitter. Right-click *Analyze* gives you per-stream jitter histograms, lost packets, max delta, and sequence anomalies. *Telephony → VoIP Calls* correlates the SDP/SIP signaling to the media flow.

For SRTP decryption, dump DTLS keys via the `SSLKEYLOGFILE` environment variable — Chromium honours it via `--ssl-key-log-file`. Wireshark decrypts SRTP given the keys.

In the browser, `chrome://webrtc-internals` (Chromium) or `about:webrtc` (Firefox) is always the first stop. You get per-PeerConnection stats, RTCP RR timelines, ICE candidate pairs, and downloadable dumps for offline analysis.

Per-stream metrics worth alerting on: packet loss above 2 percent, jitter above 30 milliseconds, RTT above 200 milliseconds (computed from RTCP `LSR` and `DLSR`), late or duplicate packets, and divergence between sender octet rate and receiver octet rate. SSRC churn is a useful signal too — once every few minutes is simulcast and RTX as designed; once every few seconds is a bug or a rebinding NAT.

For load testing: SIPp for SIP/RTP, LiveKit's `lk load-test` for WebRTC, and webrtcHacks's published methodology for SFU benchmarks.

## What's changing in 2026

**WHIP became RFC 9725 in March 2025.** Standardised HTTP-based ingest signaling for WebRTC, replacing a generation of ad-hoc WebSocket signaling. WHIP is winning the ingest battle that RTMP held for 25 years. OBS Studio shipped WHIP support in v30. Cloudflare, Dolby.io, Wowza, Red5 Pro, and Janus all support it. The latency reality: WebRTC plus WHIP delivers sub-second end-to-end where RTMP sat at 2-5 seconds.

**SFrame standardised as RFC 9605 in August 2024.** End-to-end frame-level authenticated encryption that rides through SFUs without decryption. Justin Uberti and Emad Omara whiteboarded the original idea in 2018; Richard Barnes drove it to publication. Discord's DAVE protocol — deployed on 1 March 2026 with all non-E2EE voice deprecated — is the highest-profile production deployment, combining MLS group key agreement with SFrame-style frame encryption above the SFU.

**RTP-over-QUIC (RoQ) entered Working Group Last Call in July 2025.** The draft is `draft-ietf-avtcore-rtp-over-quic-14`. ALPN token `roq`. RoQ keeps RTP semantics intact and uses QUIC as the secure transport — encrypted by default, multipath-friendly, multiplexes multiple RTP sessions per QUIC connection via a flow identifier prefix, runs over either QUIC streams or unreliable QUIC DATAGRAMs (RFC 9221). The reference Go implementation is `github.com/mengelbart/rtp-over-quic-draft`. Status as of May 2026: post-WGLC, awaiting publication.

**Media over QUIC (MoQ) — `draft-ietf-moq-transport-17`, March 2026.** A genuinely new transport, explicitly not RTP. Co-edited by Suhas Nandakumar (Cisco), Victor Vasiliev (Google), Ian Swett (Google), and Alan Frindell (Meta). Publish-subscribe with relay caches, mapped onto QUIC streams or datagrams, runs over WebTransport so it is browser-reachable. Cloudflare deployed an MoQ relay at every edge across more than 330 cities in 2025 as a beta managed service. NAB 2026 demoed interop across eleven vendors under a new "OpenMOQ Software Consortium" — treat that consortium framing as vendor-promoted; the IETF draft is the authoritative source. The MoQ Transport chapter carries the full story, including the working-group fork (Luke Curley's `draft-lcurley-moq-lite-02`).

**RFC 9605 (SFrame, August 2024)** and **RFC 9725 (WHIP, March 2025)** and **RFC 9628 (VP9 RTP payload format, 2024)** were the three IETF milestones for the RTP ecosystem in the past 24 months.

**AV1 default-on for screen-share in Google Meet (2024).** AV1 hardware encode shipped in Chrome M120 (December 2023). Firefox 125 added AV1 plus EME in April 2024. The AV1 RTP payload format lives in the Alliance for Open Media spec rather than as an IETF RFC. The codec wars never end: on 23 March 2026, Dolby filed AV1 and HEVC patent suits against Snap, re-opening the question of whether AV1 is genuinely patent-clean.

**HEVC for WebRTC.** `draft-ietf-avtcore-hevc-webrtc-08` (March 2026) is in late draft.

**AVTCORE remains highly active.** Drafts in flight cover haptics (`draft-ietf-avtcore-rtp-haptics-14`, January 2026), V3C volumetric video (-12, October 2025), JPEG XS 3rd edition (2025), and Samsung's Advanced Professional Video (APV, 2026).

**L4S meets WebRTC.** The Chromium field trial flag `WebRTC-RFC8888CongestionControlFeedback/Enabled` is the bridge from RTP into the L4S frontier. Combined with L4S-aware AQM at the bottleneck, RFC 8888 feedback delivers sub-1-millisecond queuing delay for cooperating real-time flows. Comcast launched L4S in production in late January 2025 across six US metros — Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville MD, San Francisco — with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The chapter on L4S Everywhere covers the architecture in depth.

**The honest assessment.** RTP at 30 years old is doing better than most predictions of its demise. RoQ keeps it relevant on QUIC. SFrame fixes its biggest gap (E2EE through SFU topologies). WHIP rescued live-streaming ingest. MoQ is the credible long-term successor for distribution-side workloads, but it is currently optimised for one-to-many publish-subscribe, not the bidirectional conversational case where RTP, SRTP, and WebRTC remain best-in-class. Expect RTP to dominate interactive A/V — Meet, Teams, Zoom, Discord, Webex, FaceTime, WhatsApp — through at least 2030 and probably much longer.

## Fun facts (host material)

**The version field is a fossil.** RFC 3550 section 5.1 says explicitly: "The value 1 is used by the first draft version of RTP and the value 0 is used by the protocol initially implemented in the `vat` audio tool." Every voice call in 2026 still starts with the bits `10` because Steve Casner's 1992 audio tool used `00`. That is a 34-year fingerprint encoded in the first two bits of every RTP packet on Earth.

**The Rolling Stones MBone audiocast.** On 18 November 1994, the Rolling Stones streamed twenty minutes of their Voodoo Lounge tour over the MBone. By then more than 10,000 people in 30 countries routinely used the M-Bone for collaborative work, per Lawrence Berkeley Lab's contemporaneous report. The first real broadcast over MBone, though, was the 23 May 1993 experimental film *Wax, or the Discovery of Television Among the Bees*. Van Jacobson on early MBone usage: "Somebody actually sent out to the universe live pictures of their pet iguana climbing a tree." A fundamental internet truth — someone always tries the silliest possible thing first.

**The R&D 100 Award and the Berkeley Packet Filter.** In 1995, LBL won an R&D 100 Award for the Jacobson and McCanne MBone tool pack — `vat`, `vic`, `wb`, `sdr`. Steven McCanne's name lives on in every Linux kernel: he co-invented BPF, the Berkeley Packet Filter, with Van Jacobson. Modern eBPF descends from the same work that powered the first internet audio.

**Schulzrinne's RFC count.** Henning Schulzrinne — co-author of RTP, SIP, and RTSP — has authored more than 70 IETF RFCs. His Google Scholar h-index was 95 with over 65,000 citations as of March 2024. He also served as CTO of the FCC from 2012 to 2014. The same person who defined how your video call's packets are timestamped also shaped US robocall policy.

**STD 64 and STD 65 are the only inseparable pair.** When the IETF promoted RFC 3550 to Internet Standard in 2003, it also promoted RFC 3551 (the RTP/AVP profile) at the same time. They are the only pair of "Internet Standard" documents where one is utterly useless without the other.

**"BYE should be the last packet."** RFC 3550 section 6.1 has a polite SHOULD: "BYE SHOULD be the last packet sent with a given SSRC/CSRC." It is genuinely treated as protocol etiquette in implementations — leaving without saying goodbye is bad form on the wire too.

## Where this connects in the book

- **Part Foundations — "Reliability vs Speed"** — the defining tradeoff between TCP and UDP, and why real-time media chose the lossy path on purpose.
- **Part Story of the Internet — "The QUIC Redesign"** — why the next transport tunnels inside UDP, and the deployment lesson that RoQ and MoQ both build on.
- **Part Transport — "UDP"** — the three-page RFC that gave RTP its substrate, and why the QUIC renaissance is largely a UDP renaissance.
- **Part Transport — "QUIC"** — the four problems QUIC solves, the in-kernel push, and why every future transport (multipath, MoQ, RoQ) sits inside the same envelope.
- **Part Real-time A/V — "RTP and RTCP"** — the full origin story from the March 1992 MBone audiocast through Schulzrinne, Casner, Frederick, and Jacobson to RFC 1889 and the present.
- **Part Real-time A/V — "WebRTC"** — the $68 million Google acquisition of GIPS, the libwebrtc million-line codebase, the CVE-2023-7024 blast radius, and the Discord 25 March 2026 outage post-mortem.
- **Part Real-time A/V — "SIP and SDP"** — Schulzrinne's other two protocols, the AT&T 22 February 2024 outage that blocked 25,000 911 calls, and the STIR/SHAKEN cold war against robocalls.
- **Part Real-time A/V — "MoQ Transport"** — the first IETF media transport that intentionally is not RTP, and the inside-the-WG fork between MoqTransport and MoQ-Lite.
- **Part Frontier — "L4S Everywhere"** — bufferbloat, ECT(1), Dual-Queue Coupled AQM, and the Comcast January 2025 production launch that brought sub-millisecond queuing to the access network.

## See also (other protocol episodes)

**The UDP episode.** RTP rides on UDP because the substrate is intentionally lossy and stateless. UDP gives you ports, a length field, a checksum, and nothing else — which is exactly the right amount of mechanism for a protocol that wants to handle loss in the application. RTP's twelve bytes are what UDP's eight bytes leave to the application: sequence numbers, timestamps, payload type identification.

**The WebRTC episode.** WebRTC is the browser's RTP stack. RFC 8834 (January 2021) makes it normative: "The Real-time Transport Protocol (RTP) is REQUIRED to be implemented as the media transport protocol for WebRTC." Browsers profile RTP as RTP/SAVPF with `rtcp-mux`, BUNDLE (RFC 9143), and a required set of header extensions. SRTP keys come from the DTLS handshake. Listen to the WebRTC episode for the ICE/STUN/TURN dance that gets the UDP socket open in the first place.

**The SIP episode.** SIP signals; RTP delivers. SIP locates the callee, negotiates capabilities via SDP, sets up and tears down the session. Once SIP signaling has produced an agreed `m=` line and codec mapping, RTP streams flow directly between the endpoints. SIP/SDP/RTP is the architecture of every IMS, VoLTE, and VoNR voice call on the planet.

**The SDP episode.** SDP describes the parameters of an RTP session in plain text — codecs, payload types, ports, addresses, fingerprints, header extensions. The lines that matter for RTP: `m=` (media plus protocol stack), `a=rtpmap` (PT to codec mapping), `a=fmtp` (codec parameters), `a=rtcp-mux`, `a=extmap`, `a=ssrc`, `a=fingerprint` (DTLS), `a=ice-ufrag` and `a=ice-pwd`. The SDP "offer/answer" pattern that RTP relies on became the standard for media negotiation everywhere, including WebRTC's JSEP.

**The NAT-traversal episode.** Two browsers behind home routers cannot just open a UDP socket to each other. ICE (RFC 8445) gathers candidate addresses; STUN (RFC 8489) discovers the public reflexive mapping; TURN (RFC 8656) relays when direct paths fail; consent freshness (RFC 7675) keeps the pinhole open. Without NAT traversal, RTP would not work outside a single LAN.

**Cross-promo with the RTMP comparison.** RTP carries interactive bidirectional media at 50-200 millisecond latency on UDP. RTMP carries one-to-server live ingest at 2-5 second latency on TCP. RTMP is dying for ingest as WHIP plus WebRTC pulls sub-second latency into the live-streaming workflow. If you have heard the RTMP episode, the contrast is everything.

## Visual cues for image generation

- An illustrated 12-byte RTP header — four 32-bit rows. Row one shows the V/P/X/CC nibble, the M bit, the 7-bit payload type, and the 16-bit sequence number. Row two is the 32-bit timestamp. Row three is the 32-bit SSRC. Row four shows optional CSRCs trailing off into a dotted line.
- A side-by-side: a single RTP packet on the left (12-byte header, 160-byte Opus payload, total 200 bytes including IP and UDP). On the right, the same packet wrapped as SRTP — same header in clear, payload encrypted with AES-CM, an HMAC-SHA1 tag appended.
- A sequence diagram of a WebRTC call from cold start: ICE candidate gathering, STUN binding requests, DTLS handshake over the chosen pair, then SRTP audio (PT=111 Opus) and SRTP video (PT=96 H.264) flowing in both directions, with periodic SRTCP receiver reports going back.
- An SFU topology — one publisher in the centre, six subscribers around the edge, with the SFU box in between forwarding selected RTP streams. Arrows from the SFU show the RTP packets passing through unchanged; a small lock icon over each arrow shows SFrame end-to-end frame encryption.
- A timeline labelled "thirty years of RTP": March 1992 MBone audiocast, January 1996 RFC 1889, July 2003 RFC 3550, 2004 SRTP, January 2021 RFC 8834 (RTP in WebRTC), August 2024 RFC 9605 SFrame, March 2025 RFC 9725 WHIP, July 2025 RoQ Working Group Last Call.
- A jitter-buffer diagram: packets arriving at irregular intervals on the left (some bunched, one missing, one out of order), pooling into a 40-200 ms buffer in the middle, leaving as a smooth metronome on the right at the codec's playout clock.

## Sources

### RFCs

- [RFC 3550 — RTP: A Transport Protocol for Real-Time Applications](https://datatracker.ietf.org/doc/html/rfc3550)
- [RFC 3551 — RTP Profile for Audio and Video Conferences](https://www.rfc-editor.org/rfc/rfc3551)
- [RFC 3711 — The Secure Real-time Transport Protocol (SRTP)](https://datatracker.ietf.org/doc/html/rfc3711)
- [RFC 4585 — Extended RTP Profile for RTCP-Based Feedback (RTP/AVPF)](https://datatracker.ietf.org/doc/html/rfc4585)
- [RFC 5104 — Codec Control Messages in the RTP Audio-Visual Profile with Feedback](https://datatracker.ietf.org/doc/html/rfc5104)
- [RFC 5761 — Multiplexing RTP Data and Control Packets on a Single Port](https://www.rfc-editor.org/rfc/rfc5761)
- [RFC 5764 — DTLS Extension to Establish Keys for SRTP](https://www.rfc-editor.org/rfc/rfc5764)
- [RFC 7587 — RTP Payload Format for the Opus Speech and Audio Codec](https://datatracker.ietf.org/doc/html/rfc7587)
- [RFC 7656 — A Taxonomy of Semantics and Mechanisms for Real-Time Transport Protocol (RTP) Sources](https://www.rfc-editor.org/rfc/rfc7656)
- [RFC 7667 — RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667)
- [RFC 7714 — AES-GCM Authenticated Encryption in SRTP](https://www.rfc-editor.org/rfc/rfc7714)
- [RFC 8108 — Sending Multiple RTP Streams in a Single RTP Session](https://www.rfc-editor.org/rfc/rfc8108)
- [RFC 8285 — A General Mechanism for RTP Header Extensions](https://datatracker.ietf.org/doc/rfc8285/)
- [RFC 8445 — Interactive Connectivity Establishment (ICE)](https://www.rfc-editor.org/rfc/rfc8445)
- [RFC 8489 — Session Traversal Utilities for NAT (STUN)](https://www.rfc-editor.org/rfc/rfc8489)
- [RFC 8656 — Traversal Using Relays around NAT (TURN)](https://www.rfc-editor.org/rfc/rfc8656)
- [RFC 8834 — Media Transport and Use of RTP in WebRTC](https://datatracker.ietf.org/doc/rfc8834/)
- [RFC 8888 — RTP Control Protocol Extended Reports for Per-Packet Feedback](https://www.rfc-editor.org/rfc/rfc8888)
- [RFC 9143 — Negotiating Media Multiplexing Using SDP (BUNDLE)](https://www.rfc-editor.org/rfc/rfc9143)
- [RFC 9147 — DTLS 1.3](https://www.rfc-editor.org/rfc/rfc9147)
- [RFC 9605 — Secure Frame (SFrame)](https://datatracker.ietf.org/doc/rfc9605/)
- [RFC 9725 — WebRTC-HTTP Ingestion Protocol (WHIP)](https://datatracker.ietf.org/doc/rfc9725/)
- [RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [draft-ietf-avtcore-rtp-over-quic](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)

### Papers

- [Casner & Deering — First IETF Internet Audiocast (ACM SIGCOMM CCR, July 1992)](https://dl.acm.org/doi/10.1145/142267.142338)
- [McCanne & Jacobson — vic: A Flexible Framework for Packet Video (ACM Multimedia '95)](https://ee.lbl.gov/vic/)
- [Sander, Kunze, Wehrle, Rüth — Video Conferencing and Flow-Rate Fairness (PAM 2021)](https://arxiv.org/pdf/2107.00904)
- [Congestion Control for RTP Media: A Comparison on Simulated Environment (EAI INISCOM 2018)](https://eudl.eu/pdf/10.1007/978-3-030-32216-8_4)

### Vendor and engineering blogs

- [Webex Engineering — Introducing RTP: The Packet Format](https://blog.webex.com/engineering/introducing-rtp-the-packet-format/)
- [Webex Engineering — Introducing RTCP](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)
- [Discord — How Discord Handles 2.5M Concurrent Voice Users with WebRTC](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- [Discord DAVE protocol whitepaper](https://daveprotocol.com/)
- [Discord DAVE protocol on GitHub](https://github.com/discord/dave-protocol/blob/main/protocol.md)
- [Cloudflare Realtime documentation](https://developers.cloudflare.com/realtime/)
- [Cloudflare Realtime TURN pricing](https://developers.cloudflare.com/realtime/turn/)
- [Cloudflare Realtime product page](https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/)
- [webrtcHacks — SFU Load Testing](https://webrtchacks.com/sfu-load-testing/)
- [mediasoup project](https://mediasoup.org/)
- [LiveKit benchmarking docs](https://docs.livekit.io/transport/self-hosting/benchmark/)
- [OpenVidu performance docs (mediasoup numbers)](https://openvidu.io/3.1.0/docs/self-hosting/production-ready/performance/)
- [Pion WebRTC](https://github.com/pion/webrtc)
- [libsrtp on GitHub](https://github.com/cisco/libsrtp)
- [Asterisk RTP Security Vulnerabilities retrospective](https://www.asterisk.org/rtp-security-vulnerabilities/)
- [WebRTC for the Curious — Media Communication chapter](https://webrtcforthecurious.com/docs/06-media-communication/)
- [WebRTC for the Curious — History of WebRTC](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)
- [Zoom Phone bluepaper](https://library.zoom.com/zoom-workplace/zoom-phone/zoom-phone-bluepaper/overview)
- [nanocosmos — Media over QUIC](https://www.nanocosmos.net/blog/media-over-quic-moq/)
- [Red5 — What is MoQ](https://www.red5.net/blog/what-is-moq-media-over-quic/)

### News

- [The Register — Asterisk RTP bug allows intercepted calls (September 2017)](https://www.theregister.com/2017/09/03/asterisk_rtp_bug_allows_intercepted_calls/)
- [Citizen Lab — Move Fast and Roll Your Own Crypto (Zoom, April 2020)](https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/)
- [Cisco security advisory — libsrtp CVE-2015-6360](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20160420-libsrtp.html)
- [Red Hat advisory — libsrtp CVE-2013-2139](https://access.redhat.com/errata/RHSA-2020:3873)
- [Juniper threat detail — Asterisk RTCP RCE](https://www.juniper.net/us/en/threatlabs/ips-signatures/detail.VOIP:SIP:ASTERISK-RTCP-RCE.html)
- [Information Sciences Institute — 2020 IEEE Internet Award (Casner & Schooler)](https://www.isi.edu/news/40167/2020-ieee-award-behind-the-screens-with-scientists-stephen-casner-and-eve-schooler/)
- [Internet Hall of Fame — Henning Schulzrinne](https://www.internethalloffame.org/inductee/henning-schulzrinne/)
- [LBL — Stu Loken on the MBone](https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html)
- [Justin Uberti on the SFrame whiteboard moment](https://x.com/juberti/status/1829481538175590905)

### Wikipedia

- [Real-time Transport Protocol](https://en.wikipedia.org/wiki/Real-time_Transport_Protocol)
- [RTP Control Protocol](https://en.wikipedia.org/wiki/RTP_Control_Protocol)
- [RTP payload formats](https://en.wikipedia.org/wiki/RTP_payload_formats)
- [Mbone](https://en.wikipedia.org/wiki/Mbone)
- [Van Jacobson](https://en.wikipedia.org/wiki/Van_Jacobson)
- [Henning Schulzrinne](https://en.wikipedia.org/wiki/Henning_Schulzrinne)
- [Real-Time Streaming Protocol](https://en.wikipedia.org/wiki/Real-Time_Streaming_Protocol)
- [Stephen L. Casner (Engineering & Technology History Wiki)](https://ethw.org/Stephen_L._Casner)
