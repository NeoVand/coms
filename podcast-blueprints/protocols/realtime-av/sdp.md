---
id: sdp
type: protocol
name: Session Description Protocol
abbreviation: SDP
etymology: "[S]ession [D]escription [P]rotocol"
category: realtime-av
year: 1998
rfc: RFC 8866
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - realtime-av/webrtc
  - realtime-av/sip-and-sdp
related_protocols: [webrtc, sip, rtp, ip, tls, sctp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [2327, 4566, 8866, 3264, 3550, 3551, 5234, 5763, 5888, 8122, 8285, 8445, 8489, 8656, 8829, 8839, 8842, 8843, 8844, 9143, 9335, 9429, 9725]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Early_CTS-3000_Prototype.jpg/500px-Early_CTS-3000_Prototype.jpg
    caption: An early Cisco TelePresence CTS-3000 prototype — the kind of immersive video conferencing endpoint that has to negotiate codecs, addresses, and crypto with anything else on the call. Every one of those negotiations is an SDP offer/answer exchange.
    credit: Photo — Cisco Systems / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "A line-by-line annotation of a real WebRTC SDP offer — v=, o=, s=, t=, then a=group:BUNDLE 0 1, then two m= sections (audio Opus, video VP8+H264). Each line labelled with what it does and which RFC defines it."
  - "A timeline 1996 → 2026 with five red dots: RFC 2327 (1998), RFC 4566 (2006), RFC 8866 (Jan 2021), RFC 9429 JSEP-bis (Apr 2024), RFC 9725 WHIP (Mar 2025). Caption: the protocol itself barely moves; everything around it does."
  - "A WebRTC offer/answer sequence diagram — Browser A, signaling channel (any), Browser B. createOffer, setLocalDescription, send via signaling, setRemoteDescription, createAnswer, send back. ICE candidates trickle in parallel."
  - "A failure-mode infographic: Chrome and Firefox happily talking, but a 2008-vintage SBC in the middle silently drops video bitrate because someone split SDP on \\n instead of \\r\\n."
  - "A side-by-side: SDP offer with audio + video as two m= lines (BUNDLE) versus the same call as it would be expressed in MoQ — a publish/subscribe tree on QUIC streams. Caption: 'the post-SDP world, drafting at IETF.'"
  - "A bar chart: $0.05/GB Cloudflare Realtime, 300+ data centers, 2.5 million simultaneous Discord voice chats, all using SDP under the hood."
---

# SDP — Session Description Protocol

## In one breath

SDP is the plain-text format two endpoints use to describe a multimedia session before any audio or video flows. It is not a transport. It rides inside SIP INVITE bodies, WebRTC signaling channels, RTSP DESCRIBE responses, and HTTP POSTs to WHIP servers. Every Zoom call, every Microsoft Teams meeting, every Discord voice chat, every WebRTC live stream on Cloudflare negotiates what codecs to use, what ports to open, and what DTLS fingerprints to trust by exchanging an SDP offer and an SDP answer first. The current canonical spec is RFC 8866, January 2021.

## The pitch (cold-open)

Every time you join a video call in 2026, two computers exchange a piece of plain text whose first line is `v=0` — version zero. It has been zero since April 1998. The Session Description Protocol was invented by Mark Handley and Van Jacobson for the Multicast Backbone, the experimental MBone that no longer exists. Twenty-eight years later it is the lingua franca of every real-time application you use, and engineers hate it. They have been trying to replace it since 2001. Every attempt has failed. This episode is about how SDP actually works on the wire, where it breaks in production, and the post-SDP world that is being drafted at the IETF right now.

## How it actually works

SDP is plain UTF-8 text, one `<type>=<value>` line per line, each terminated by CRLF. Field names are single ASCII letters, case-sensitive, with no whitespace around the equals sign. The lines must appear in a fixed order so that simple parsers and middleboxes can detect malformations cheaply — that ordering is mandated by RFC 8866 section 5.

A description splits into a session-level block and one or more media-level blocks. The session block carries protocol version (`v=0`), origin (`o=`), session name (`s=`, mandatory and non-empty — convention is the dash `s=-`), timing (`t=0 0` for any unbounded session, which means every SIP and WebRTC call), and any session-wide attributes. Then comes one `m=` line per media stream, each followed by its own attributes. Anything the parser does not recognise as a known type letter must cause the whole description to be discarded.

The simulator on the SDP page shows the three-step shape of a real exchange. Step one: the offerer creates an SDP listing every media capability it has — `m=audio 5004 RTP/SAVPF 111 0` for Opus and PCMU on UDP port 5004, `m=video 5006 RTP/SAVPF 96 97` for VP8 and H.264 on UDP port 5006. Step two: the answerer mirrors that SDP, one `m=` line per index, picking exactly one codec per line and rejecting anything it cannot do by setting the port to zero. So an audio-only answerer would return `m=audio 6000 RTP/SAVPF 111` and `m=video 0 RTP/SAVPF 96` — the second port is zero, the line is rejected. Step three: both sides have a stable description, RTP starts flowing on the negotiated five-tuples, and the SDP itself never appears on the wire again until renegotiation.

### Header at a glance

There is no binary header — but there is a fixed set of letters. Read them in order:

- `v=0` — protocol version. Has been zero since 1998. Bumping it would gain nothing because every new feature lands as an `a=` attribute.
- `o=<user> <sess-id> <sess-version> IN IP4 <addr>` — origin. The session-version increments on each renegotiation; that is how the other side knows you have changed something.
- `s=<text>` — session name, must be non-empty. WebRTC always uses `s=-`.
- `t=<start> <stop>` — active times in NTP seconds since 1 January 1900. `t=0 0` means unbounded, starting now. Universal in SIP and WebRTC; the timing fields are vestigial MBone machinery.
- `c=IN IP4 <addr>` — connection. Either at session level or in every `m=` block. WebRTC sets it to `0.0.0.0` because the real address comes from ICE candidates.
- `m=<media> <port> <proto> <fmt list>` — the media line. `media` is `audio`, `video`, `application`, `text`, or `message`. `proto` is `RTP/AVP` for unencrypted SIP, `RTP/SAVP` for plain SRTP, `RTP/SAVPF` for SRTP with feedback, `UDP/TLS/RTP/SAVPF` for WebRTC. The `<fmt list>` is a list of payload-type numbers — static ones from RFC 3551, dynamic ones (96–127) bound to codec names by `a=rtpmap` lines below.
- `a=...` — the extension mechanism. Hundreds of registered attributes live in IANA's SDP Parameters registry. The IANA registry is the authoritative list, controlled by the MMUSIC working group.
- `k=` — encryption keys. Officially OBSOLETE in RFC 8866 section 8.3. Do not generate it; ignore it if you receive it.

The attributes a working WebRTC engineer touches every day are `a=rtpmap` (binds a payload type to a codec name and clock rate), `a=fmtp` (codec-specific knobs like Opus `useinbandfec=1` or H.264 `profile-level-id`), `a=mid` (labels each m-line so demuxing works), `a=group:BUNDLE 0 1` (multiplex audio, video, and data over one ICE/DTLS transport, defined in RFC 9143), `a=ice-ufrag` and `a=ice-pwd` (ICE credentials), `a=candidate` (one ICE candidate per line), `a=fingerprint:sha-256 ...` (the DTLS certificate hash), `a=setup:actpass|active|passive` (the DTLS role), `a=rtcp-mux` (put RTP and RTCP on one port), and `a=rtcp-fb:96 nack pli` (RTCP feedback). That is most of what a typical Chrome or Firefox SDP actually contains.

### State machine in three sentences

There is none on the wire. The state machine lives in the encapsulating protocol — SIP's three-way INVITE/200 OK/ACK, or WebRTC's `RTCPeerConnection` driven by RFC 9429 JSEP — and SDP is the body it carries. Renegotiation is achieved by sending a fresh offer with an incremented `o=` session-version; hold-and-resume is `a=sendrecv` flipping to `a=sendonly` and back, or setting the connection address to `0.0.0.0`.

### Reliability, security, and the offer/answer model

SDP itself has no integrity, no authentication, and no confidentiality. RFC 8866 section 7 is explicit: "SDP MUST NOT be used to convey keying material … unless it can be guaranteed that the channel … is both private and authenticated." That is why the old `k=` field was retired. Modern security is delegated. WebRTC carries only a DTLS certificate fingerprint in `a=fingerprint`, then the actual key agreement happens on the media path via DTLS-SRTP (RFC 5763 and RFC 8842). Unknown-key-share attacks against that model are documented in RFC 8844 — SBCs and conferencing servers have to guard against them.

The negotiation framework is RFC 3264, the offer/answer model. Invented for SIP in 2002, reused unchanged by WebRTC. The offerer proposes, the answerer mirrors and trims, both sides have a stable session. Glare — both sides issuing offers simultaneously — is resolved in SIP by `491 Request Pending` plus randomized retry, and in WebRTC by JSEP's rollback signaling state and a session-description tie-breaker.

## Where it shows up in production

**Microsoft Teams.** Direct Routing and media-bypass paths run through a SIP Proxy that, per Microsoft's own Learn documentation, "translates HTTP REST signaling used in Teams to SIP," and a Media Controller microservice that "creates Session Description Protocol (SDP) offers" for the call. SDP is the lingua franca where Teams meets the carrier-side SIP world.

**Discord.** Runs its own C++ SFU on top of WebRTC transport — DTLS for keying, SRTP for the media. SDP is exchanged at session establishment and an internal signaling overlay does the rest. Public reporting puts Discord at 2.5 million simultaneous voice chats on this stack.

**Cloudflare Realtime.** The renamed Cloudflare Calls product is an anycast SFU running in 300-plus data centers, with full WHIP and WHEP support. As of 2025 the pricing is $0.05 per gigabyte after a one-terabyte-per-month free tier. In 2025 Cloudflare also acquired Dyte to bring in the RealtimeKit client SDKs. Every ingest is an HTTP POST whose body is an SDP offer.

**Zoom, Slack Huddles, Twilio, Vonage, Amazon Chime SDK, Daily, LiveKit, Agora.** Every modern conferencing or programmable-voice product touches SDP somewhere in its WebRTC path, usually hidden behind a higher-level SDK. SDP is the boundary protocol between the application's nice JavaScript API and the network's brutal codec-and-port reality.

**The open-source backbone.** PJSIP underpins Asterisk's `chan_pjsip` and a great deal of the embedded VoIP world. GStreamer ships a complete SDP module. FFmpeg has an SDP demuxer. mediasoup, Janus, Jitsi Videobridge, LiveKit, and Pion are the WebRTC SFUs every conferencing vendor benchmarks against. `libwebrtc` from Google is the C++ stack inside Chrome and Edge that exposes `RTCPeerConnection`. All of them parse, generate, and rewrite SDP at scale.

**Telco endpoints.** Cisco and Poly room systems ship carrier-grade SIP-plus-SDP stacks. Many still implement H.323 alongside, for legacy interop with rooms procured before 2010.

The numbers people quote: WebRTC end-to-end latency under half a second per the literature feeding RFC 9725, WHIP ingest typically in the hundreds of milliseconds against RTMP's seconds. SDP itself adds nothing to that latency budget — it is exchanged once during signaling, before any media flows. The text is a kilobyte or two. The work is in everything it points at.

## Things that go wrong

**The PJSIP CVE parade.** PJSIP — the most-deployed open-source SIP/SDP stack — has had a long, illustrative run of parsing bugs. CVE-2022-24764 was a stack-buffer overflow in `pjmedia_sdp_print()` and `pjmedia_sdp_media_print()` that hit PJSUA2 callers. CVE-2022-24793 was a buffer overflow in PJSIP's parser. In 2026 a fresh integer overflow surfaced as CVE-2026-41416, in `pjmedia` media-stream-buffer-size calculation when handling SDP with asymmetric `ptime` settings; fixed in pjproject 2.17. The lesson the field keeps re-learning: a permissive text parser written in C is a vulnerability factory, and SDP is one of the most parsed text formats in real-time communications.

**Asterisk's SDP edge cases.** A long-running pattern in Asterisk CVEs: SDP with `c=0.0.0.0`, missing `c=` lines, or malformed `m=image` lines for T.38 fax used to NULL-deref the call thread. CVE-2021-31878 was a `res_pjsip_session.c` SDP-negotiation crash on a crafted re-INVITE that arrived without an SDP body at all. CVE-2019-15297 and the CVE-2021-32558 family are in the same `m=image` neighbourhood. SBCs in front of softswitches now strictly normalize and re-emit SDP rather than passthrough, precisely because of bugs like these.

**SDP-injection at proxies.** When SBCs or proxies blindly stitch SDP fragments together, attackers can inject extra media lines or alter the `c=` line to redirect media to a host they control. Asterisk had a 2007 channel-driver crash on an INVITE containing one valid and one invalid IP. Modern SBCs mitigate by canonicalizing the SDP entirely on the way through.

**The Discord voice outage of 25 March 2026.** Covered in detail in our chapter episode on WebRTC. The short version: a Kubernetes scale-down of Elixir voice-syncer pods triggered massive HTTPS reconnection storms, Erlang `gun` selective-receive over million-message mailboxes added about a millisecond per spawn at 100 spawns per second, and the system never recovered without manual intervention. The point for this episode is the post-mortem's conclusion: the media plane in WebRTC is robust; the signaling plane is where outages happen. RTP keeps flowing once a connection is established. Getting connections established and re-established is where every production WebRTC deployment burns most of its operational complexity — and SDP is the format that signaling has to get right every time.

**The 911 outages of 2024 were not SDP.** The April 2024 multi-state US 911 outage that hit Nevada, South Dakota, Nebraska, and parts of Texas was traced by Lumen Technologies to a third-party light-pole installation that severed fiber. The July 2024 Pennsylvania NG911 outage was a vendor operating-system defect. SDP carries the call descriptions all of these systems use, but no public, attributable major outage in the 2024–2026 window has SDP itself as the root cause. SDP is the glue, and glue failures get attributed to whatever is nailed to it.

## Common pitfalls (for the practitioner)

- **MID mismatch.** If the answerer does not echo the offerer's `a=mid:` values exactly, BUNDLE breaks and media gets demuxed to the wrong transceiver. Symptom: video showing up where audio was expected, or silent failure of one stream. Cure: log every MID on offer-create and answer-receive and diff.
- **BUNDLE inconsistencies.** RFC 8829 (the original JSEP) and RFC 8843 (the original BUNDLE) had subtle disagreements about how renegotiation affects the bundle group. RFC 9143 in February 2022 and RFC 9429 in April 2024 explicitly fix those. If you maintain a JSEP-based stack older than mid-2024, audit it.
- **Codec parameter mismatches.** Most of these are H.264 `profile-level-id` differences between Cisco, Chrome, and Firefox, or Opus `stereo=1` mismatches. Symptom: call connects, no video, or one-way audio. Cure: lock down a small set of supported `fmtp` values per peer class and test each combination.
- **ICE candidate parsing.** `a=candidate` lines have eight required and many optional fields. One bug in an order-sensitive parser drops relay candidates and breaks every NAT'd connection. Cure: use a library, do not split on whitespace by hand.
- **Plan B residue.** Pre-Unified-Plan code generated `a=ssrc-group:` with multiple SSRCs per `m=`. Plan B is gone from Chrome since M96 in January 2022, but old SBCs sometimes still munge incorrectly. Symptom: simulcast layers vanishing.
- **Empty session names.** `s=` (literally empty) is forbidden by the ABNF. Some strict parsers will reject the whole description. Cure: emit `s=-` always.
- **Renegotiation glare.** Both sides re-INVITE on hold/resume at the same instant. SIP fixes it with `491 Request Pending` plus randomized retry-after; WebRTC's JSEP fixes it with rollback. If your stack handles neither, expect intermittent call-drop on hold.
- **CRLF discipline.** RFC 8866 mandates `\r\n`. Many parsers tolerate bare `\n`. Exactly one strict parser anywhere in your call path is enough to corrupt every multi-vendor flow. See "Things that go wrong" for the canonical war story.

The over-arching anti-pattern is **SDP munging**: editing the SDP string between `createOffer` and `setLocalDescription` to control bitrate, codec preference, simulcast, or stereo Opus. Philipp Hancke's webrtcHacks article "Not a Guide to SDP Munging" is the canonical warning. Modern WebRTC offers transceiver-level APIs — `setCodecPreferences`, `setParameters` — that mostly remove the need. Munging is fragile because each browser version subtly changes the SDP shape. As Hancke writes: "you are still on your own if something breaks." Chrome has been measuring the `RTCLocalSdpModification` use counter since 2018 to track its slow decline.

## Debugging it

**Wireshark.** The SDP dissector is built in. Any captured SIP message will display its SDP body as a parsed tree, attribute by attribute. The `sdp` display filter selects all SDP-bearing packets; `sip and sdp.media_attr.field == "rtpmap"` narrows to a specific attribute. For TLS or DTLS-encrypted signaling you need `SSLKEYLOGFILE` to decrypt — without that, all you see is opaque TLS records.

**`tshark` for offline triage.** `tshark -r capture.pcap -Y "sdp" -T fields -e sdp.media` prints the `m=` lines from a pcap, which is enough to spot a codec mismatch in seconds.

**`chrome://webrtc-internals`.** The canonical client-side debugger. Every active `RTCPeerConnection` shows its local and remote SDP in full, plus stats over time. The "Create Dump" button gives you a JSON file you can attach to a ticket. For failed calls, this is the first place to look.

**Capture both peers.** The offer/answer is asymmetric. SDP bugs almost always show up as a discrepancy between what was sent and what was processed. One-side captures will mislead you. Discord, mediasoup, Janus, and LiveKit deployments all have this rule baked into their on-call runbooks.

**Strip and replay.** `tcpdump`-capture an SDP, anonymize the addresses and fingerprints, paste it into a unit test against your parser. Most SDP regressions are caught by a corpus of real-world SDPs from the wild, not by spec-driven test cases.

**The `a=` round-trip test.** Log every attribute on offer-create and answer-receive in production. Diffs are bugs.

**What to monitor.** SDP parse errors per minute (any non-zero is suspicious). Offer/answer round-trip time, distinct from ICE completion time. Number of `m=` lines rejected with port 0 per call — high counts mean codec mismatch. The gap between DTLS handshake completion and ICE completion — large gaps mean fingerprint or `setup:` problems. ICE candidate mix — host versus srflx versus relay — because a sudden jump in relay percentage means TURN cost is up and a NAT or firewall just regressed.

## What's changing in 2026

Most of the action in the last 24 months is in the surrounding ecosystem, not in SDP itself. RFC 8866 has been the canonical spec since January 2021 and is still canonical in May 2026.

- **November 2025 — `draft-lcurley-moq-lite`.** Luke Curley, an MoQ author, published a stripped-down draft because, in his words, "MoqTransport has become too complicated. There are too many messages, optional modes, and half-baked features." Whether the working group converges on lite or on the full transport is the open question for the next year.
- **March 2025 — RFC 9725, WHIP.** WebRTC-HTTP Ingestion Protocol shipped as Standards Track. WHIP standardizes a one-shot HTTP POST of an SDP offer with `Content-Type: application/sdp`, returning `201 Created` with an SDP answer. WHIP explicitly disallows SDP renegotiation — the only post-establishment SDP change is via HTTP PATCH for ICE updates. Cloudflare Stream, Dolby.io, Red5 Pro, Wowza, OBS Studio, FFmpeg, and GStreamer all support it.
- **2025 — W3C WebRTC re-published as updated Recommendation.** The browser API is now a stable W3C Rec again; WebRTC-NV ("next version") work continues in the Extensions and Extended Use Cases drafts.
- **April 2024 — RFC 9429, JSEP-bis.** Obsoletes RFC 8829. Resolves long-known inconsistencies between JSEP and BUNDLE (RFC 9143) and tightens the ICE specifics. Authors are Justin Uberti, Cullen Jennings, and Eric Rescorla — the same trio who wrote the original.
- **2024 — Plan B finally erased from Chromium.** Plan B SDP semantics had been removed from all release channels by M96 in January 2022, but the `sdpSemantics` flag handling lingered in the codebase. In 2024 it was finally gone. The world is unified-plan only.
- **`draft-ietf-wish-whep`.** WHEP, the WebRTC-HTTP egress symmetric of WHIP, is in working-group draft. The cleanup and finalization is in progress; not yet an RFC at the cut-off.
- **`draft-ietf-moq-transport`, rev 17.** Media-over-QUIC is the most credible long-term challenger to RTP-plus-SDP for streaming and broadcast use cases. It does not use SDP at all — it has a publish/subscribe data model on QUIC streams, with media format negotiation handled by the MOQT control plane. The IETF MoQ working group ran in-person interim meetings throughout 2025. Not yet an RFC.

The honest read: SDP is not going anywhere in the next five years. The 2024–2026 trend is **reducing developer exposure to SDP** — WHIP makes signaling a one-shot HTTP, JSEP-bis fixes BUNDLE inconsistencies, the WebRTC API exposes more codec-preference primitives — rather than replacing SDP itself. MoQ is the only credible structural challenger, and it targets streaming, where SDP was always weakest.

## Fun facts (host material)

- **`v=0` forever.** The protocol-version field has been zero since RFC 2327 in April 1998. Twenty-eight years. There is no proposal to bump it because the extension mechanism (`a=`) has eaten every new feature; bumping `v=` would just break the world.
- **`s= ` is required.** RFC 8866 section 5.3 mandates a non-empty session name. Convention since the late 1990s is `s=-` or `s= ` (a single space) when nothing meaningful exists. The dash form is now dominant in WebRTC-emitted SDP. Empty-string `s=` is forbidden by the ABNF.
- **`t=0 0` is universal.** Every SIP and WebRTC session uses it. The timing fields are vestiges of MBone and `sdr`-era multicast advertisements that no longer matter.
- **The minimum viable SDP is about 100 characters.** Philipp Hancke's webrtcHacks experiment showed how to strip a WebRTC data-channel-only PeerConnection's SDP down to "a little more than 100 characters … in each direction" — basically `ice-ufrag`, `ice-pwd`, the DTLS fingerprint, and one candidate. Everything else is convention and habit.
- **Tim Panton's rant.** The line everyone in WebRTC quotes is: "It is typical of SDP that 15 characters can efficiently sum up what is wrong with the whole 'API'." That is from his 2013 webrtcHacks essay on trying to derive a working WebRTC data-channel SDP. The compromise that came out of the WebRTC standards fight — SDP wins, but you do not have to look at it — was driven in part by exactly that frustration. RFC 9429 is, in effect, the spec that hides SDP behind JavaScript without quite removing it.
- **Justin Uberti's bibliography.** Lead author of JSEP (RFC 8829, then RFC 9429), Google then Microsoft then Fly.io. Cullen Jennings (Cisco) and Eric Rescorla (Mozilla, then Windy Hill Systems) are the co-authors. Harald Alvestrand of Google and Norway is one of the authors of BUNDLE — RFC 8843 then RFC 9143. The names recur because the people who wrote the WebRTC SDP plumbing in 2010 are still maintaining it in 2026.
- **SDPng never shipped.** Throughout the early 2000s the IETF MMUSIC working group tried to replace SDP with SDPng — an XML-based format with first-class capability negotiation. The drafts ran from roughly 2001 to 2005 and were never standardized. RFC 3407 from October 2002, "SDP Simple Capability Declaration," was framed as a stop-gap "until SDPng arrives." SDPng never arrived. SDP plus offer/answer turned out to be good enough.

## Where this connects in the book

- **Part Real-time A/V — chapter "WebRTC."** The story of how a peer-to-peer media stack got into the browser, why ICE-STUN-TURN exists, what the codec wars looked like, and the 25 March 2026 Discord voice outage post-mortem. SDP is the negotiation format every WebRTC PeerConnection uses; the chapter has the operational story.
- **Part Real-time A/V — chapter "SIP and SDP."** Henning Schulzrinne's career, the SIP versus H.323 battle of the early 2000s, STIR/SHAKEN and the robocall war, and the Asterisk and ZRTP folklore. This chapter is where the historical narrative of SDP — the MBone origin, the 1998 RFC, the SDPng failure, the road to RFC 8866 — properly belongs.

## See also (other protocol episodes)

If you have heard the WebRTC episode, this is the negotiation format that powers everything that episode describes. WebRTC's `RTCPeerConnection` is, on the inside, an SDP offer/answer state machine driven by JavaScript per RFC 9429 JSEP. WebRTC describes the session parameters — codecs, ICE candidates, DTLS fingerprints — in SDP, then runs ICE-DTLS-SRTP on whatever five-tuple the negotiation lands on.

If you have heard the SIP episode, SDP is the body of every INVITE and 200 OK that establishes a call. SIP is the signaling layer; SDP is the negotiation format SIP carries. The offer/answer model in RFC 3264 was invented for SIP in 2002 and reused unchanged by WebRTC almost a decade later.

If you have heard the RTP episode, that is the protocol SDP exists to configure. The `m=audio 5004 RTP/SAVPF 111` line names a port, a profile, and a codec for the RTP stream that follows. `a=rtpmap` binds dynamic payload types to codec names. `a=rtcp-mux` collapses RTP and RTCP onto one port. RTP is the cargo; SDP is the manifest.

## Visual cues for image generation

- A line-by-line annotation of a real WebRTC SDP offer: `v=`, `o=`, `s=`, `t=`, `a=group:BUNDLE 0 1`, then two `m=` sections for audio (Opus) and video (VP8 plus H.264). Each line labelled with what it does and which RFC defines it.
- A timeline 1996 to 2026 with five red dots: RFC 2327 (April 1998), RFC 4566 (July 2006), RFC 8866 (January 2021), RFC 9429 JSEP-bis (April 2024), RFC 9725 WHIP (March 2025). Caption underneath: the protocol itself barely moves; everything around it does.
- A WebRTC offer/answer sequence diagram with three lanes — Browser A, signaling channel (any), Browser B — showing `createOffer`, `setLocalDescription`, send via signaling, `setRemoteDescription`, `createAnswer`, send back, with ICE candidates trickling in parallel.
- A failure-mode infographic: Chrome and Firefox happily talking, but a 2008-vintage SBC in the middle silently dropping video bitrate because someone split SDP on `\n` instead of `\r\n`. The stray `\r` glued to a `b=AS:1500` value, highlighted in red.
- A side-by-side: an SDP offer with audio plus video as two `m=` lines under a BUNDLE group, versus the same call as it would be expressed in MoQ — a publish/subscribe tree on QUIC streams. Caption: "the post-SDP world, drafting at IETF."
- A bar chart of production scale: Cloudflare Realtime at $0.05 per gigabyte across 300-plus data centers, Discord at 2.5 million simultaneous voice chats, Microsoft Teams Direct Routing — all running SDP under the hood.

## Sources

### RFCs

- [RFC 8866 — SDP base spec, January 2021](https://www.rfc-editor.org/rfc/rfc8866.html)
- [RFC 4566 — SDP, July 2006 (obsoleted by 8866)](https://datatracker.ietf.org/doc/rfc4566/)
- [RFC 2327 — SDP, April 1998 (original)](https://www.ietf.org/rfc/rfc2327.txt)
- [RFC 3264 — Offer/Answer Model with SDP](https://datatracker.ietf.org/doc/rfc3264/)
- [RFC 4317 — SDP Offer/Answer Examples](https://www.rfc-editor.org/rfc/rfc4317.html)
- [RFC 9429 — JSEP, April 2024 (obsoletes RFC 8829)](https://datatracker.ietf.org/doc/rfc9429/)
- [RFC 8829 — JSEP, January 2021 (obsoleted)](https://datatracker.ietf.org/doc/rfc8829/)
- [RFC 9143 — Negotiating Media Multiplexing Using SDP (BUNDLE), February 2022](https://www.rfc-editor.org/rfc/rfc9143)
- [RFC 8843 — BUNDLE (obsoleted by 9143)](https://datatracker.ietf.org/doc/rfc8843/)
- [RFC 8842 — SDP O/A Considerations for DTLS/TLS, January 2021](https://www.rfc-editor.org/rfc/rfc8842)
- [RFC 8844 — Unknown Key-Share Attacks on Uses of TLS with SDP](https://datatracker.ietf.org/doc/html/rfc8844)
- [RFC 5763 — Framework for Establishing a SRTP Security Context Using DTLS](https://www.rfc-editor.org/rfc/rfc5763)
- [RFC 8839 — SDP Offer/Answer Procedures for ICE](https://datatracker.ietf.org/doc/rfc8839/)
- [RFC 8445 — Interactive Connectivity Establishment (ICE)](https://datatracker.ietf.org/doc/rfc8445/)
- [RFC 5888 — SDP Grouping Framework](https://datatracker.ietf.org/doc/rfc5888/)
- [RFC 9335 — Cryptex (RTP header extension and CSRC encryption)](https://www.ietf.org/rfc/rfc9335.html)
- [RFC 9725 — WebRTC-HTTP Ingestion Protocol (WHIP), March 2025](https://www.rfc-editor.org/rfc/rfc9725.html)
- [RFC 3407 — SDP Simple Capability Declaration](https://datatracker.ietf.org/doc/rfc3407/)
- [RFC 3550 — RTP](https://datatracker.ietf.org/doc/rfc3550/)
- [RFC 3551 — RTP Audio/Video Profile (static payload types)](https://datatracker.ietf.org/doc/rfc3551/)
- [RFC 7826 — RTSP 2.0](https://datatracker.ietf.org/doc/rfc7826/)
- [RFC 5234 — ABNF](https://datatracker.ietf.org/doc/rfc5234/)
- [draft-ietf-wish-whep — WebRTC-HTTP Egress Protocol](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/)
- [draft-ietf-moq-transport — Media over QUIC Transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [draft-lcurley-moq-lite — Media over QUIC Lite, November 2025](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)
- [draft-ietf-mmusic-sdpng — SDPng (historical)](https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdpng)
- [MMUSIC working group charter](https://datatracker.ietf.org/doc/charter-ietf-mmusic/)
- [IANA SDP Parameters registry](https://www.iana.org/assignments/sdp-parameters/sdp-parameters.xhtml)

### Papers and W3C

- [W3C WebRTC: Real-Time Communication in Browsers](https://www.w3.org/TR/webrtc/)
- [W3C WebRTC Extensions (editor's draft)](https://w3c.github.io/webrtc-extensions/)
- [W3C WebRTC Extended Use Cases](https://www.w3.org/TR/webrtc-nv-use-cases/)
- [W3C — Updated WebRTC Recommendation, 2025](https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/)
- [W3C WebRTC WG meeting minutes, October 2025](https://www.w3.org/2025/10/21-webrtc-minutes)
- [SIGCOMM 2025 — Harnessing WebRTC for Large-Scale Live Streaming (via ACM RFC 8866 page)](https://dl.acm.org/doi/10.17487/RFC8866)
- [University of Glasgow eprint of RFC 8866 §10 changes](https://eprints.gla.ac.uk/232855/1/232855.pdf)

### Vendor and engineering blogs

- [webrtcHacks — Anatomy of a WebRTC SDP](https://webrtchacks.com/sdp-anatomy/)
- [webrtcHacks — Not a Guide to SDP Munging](https://webrtchacks.com/not-a-guide-to-sdp-munging/)
- [webrtcHacks — The Minimum Viable SDP](https://webrtchacks.com/the-minimum-viable-sdp/)
- [webrtcHacks — SDP: Your Fears Are Unleashed (Iñaki Baz Castillo)](https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/)
- [webrtcHacks — Tim Panton, "SDP: The worst of all worlds"](https://webrtchacks.com/tim-rant/)
- [webrtcHacks — Update: Anatomy of a WebRTC SDP](https://webrtchacks.com/update-anatomy-webrtc-sdp-anton-roman/)
- [webrtcHacks — How Cloudflare Glares at WebRTC with WHIP and WHEP](https://webrtchacks.com/how-cloudflare-glares-at-webrtc-with-whip-and-whep/)
- [webrtcHacks — Limit WebRTC bandwidth by modifying the SDP](https://webrtchacks.com/limit-webrtc-bandwidth-sdp/)
- [BlogGeek.me — SDP in WebRTC](https://bloggeek.me/webrtcglossary/sdp/)
- [BlogGeek.me — Why we will Continue to Hate SDP in WebRTC](https://bloggeek.me/hate-sdp-webrtc/)
- [BlogGeek.me — WHIP & WHEP: Is WebRTC the future of live streaming?](https://bloggeek.me/whip-whep-webrtc-live-streaming/)
- [Cloudflare blog — Cloudflare Calls anycast WebRTC](https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/)
- [Cloudflare blog — Introducing Cloudflare Realtime and RealtimeKit](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/)
- [Cloudflare blog — Announcing Cloudflare Calls](https://blog.cloudflare.com/announcing-cloudflare-calls/)
- [Cloudflare Realtime SFU docs](https://developers.cloudflare.com/realtime/sfu/)
- [Microsoft Learn — Plan for media bypass with Direct Routing (Teams SDP)](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass)
- [PJSIP / pjproject](https://github.com/pjsip/pjproject)
- [libwebrtc source](https://webrtc.googlesource.com/src/)
- [WebRTC samples](https://webrtc.github.io/samples/)
- [mediasoup demo](https://github.com/versatica/mediasoup-demo)
- [simple-peer](https://github.com/feross/simple-peer)
- [sip.js](https://sipjs.com/)
- [Wireshark Wiki — SDP dissector](https://wiki.wireshark.org/SDP)
- [Unified Plan SDP transition guide (webrtc.org)](https://webrtc.org/getting-started/unified-plan-transition-guide)
- [Forasoft — WebRTC architecture guide for business 2026](https://www.forasoft.com/blog/article/webrtc-architecture-guide-for-business-2026)
- [GetStream — WHIP Protocol](https://getstream.io/glossary/whip-protocol/)
- [WINK Streaming — Media over QUIC implementation analysis 2025](https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php)
- [WebRTC.ventures — WebRTC SIP integration techniques 2025](https://webrtc.ventures/2025/07/webrtc-sip-integration-advanced-techniques-for-real-time-web-and-telephony-communication/)
- [Olivier Anguenot — WebRTC API Update 2025](https://www.webrtc-developers.com/webrtc-api-update-2025/)
- [Andrew Prokop — Understanding SDP](https://andrewjprokop.wordpress.com/2013/09/30/understanding-session-description-protocol-sdp/)
- [Andrew Prokop — SIP vs. H.323](https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/)
- [WebRTC.link — SDP Format for WebRTC](https://webrtc.link/en/articles/sdp-session-description-protocol-webrtc/)
- [Digital Samba — Understanding SDP](https://www.digitalsamba.com/blog/understanding-sdp-protocol)
- [Ubuntu security — CVE-2022-24764 (PJSIP SDP print stack overflow)](https://ubuntu.com/security/CVE-2022-24764)
- [PJSIP CVE list (CVE Details)](https://www.cvedetails.com/vulnerability-list/vendor_id-21360/Pjsip.html)
- [Asterisk CVE list (CVE Details)](https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html)
- [Digium Asterisk CVE list](https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html)
- [CVE-2026-41416 — PJSIP integer overflow on asymmetric ptime SDP](https://radar.offseq.com/threat/cve-2026-41416-cwe-190-integer-overflow-or-wraparo-6ad50ff9)
- [FFmpeg security advisories](https://ffmpeg.org/security.html)

### News

- [CNN — 911 service provider Lumen blames outage on light-pole installation, April 2024](https://www.cnn.com/2024/04/17/us/911-lines-down-in-multiple-cities-officials-say/index.html)
- [NBC News — Multistate 911 outage shows fragility of systems](https://www.nbcnews.com/tech/tech-news/multistate-911-outage-shows-fragility-systems-experts-say-rcna148475)
- [GovTech — Operating System at Root of Pennsylvania 911 Outages](https://www.govtech.com/public-safety/operating-system-at-root-of-pennsylvania-911-outages)
- [SudoNull — How Discord serves 2.5 million voice chats using WebRTC](https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC)

### Wikipedia

- [Wikipedia — Session Description Protocol](https://en.wikipedia.org/wiki/Session_Description_Protocol)
