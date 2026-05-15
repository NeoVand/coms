---
id: moq-transport
type: chapter
part_id: realtime-av
part_label: VIII
part_title: Real-time A/V
title: MoQ Transport
synopsis: Sub-second live streaming over QUIC — the first IETF media transport that intentionally is not RTP.
podcast_target_minutes: 15
position_in_book: 54 of 75
listening_order:
  prev: realtime-av/hls-and-dash
  next: utilities-security/dns
related_protocols: [hls, dash, rtmp, webrtc, quic, rtp, udp]
related_pioneers: []
related_outages: []
related_frontier: [moq-transport]
related_rfcs: []
images:
  - src: ""
    caption: "draft-ietf-moq-transport-17, published March 2026, with co-editors Suhas Nandakumar (Cisco), Victor Vasiliev (Google), Ian Swett (Google), and Alan Frindell (Meta) — the first IETF media transport that intentionally is not RTP."
    credit: "IETF"
visual_cues:
  - "A four-tier latency ladder: standard HLS/DASH at 6-30 seconds on top, LL-HLS/LL-DASH at 2-5 seconds, MoQ target under 1 second, and WebRTC SFU at 50-200 milliseconds at the bottom — with the MoQ rung highlighted as the new arrival."
  - "A MoQ data-model diagram: track > group > subgroup > object, with named objects flowing from a publisher through a chain of QUIC relay caches to many subscribers, and one relay dropping a delta-frame object under congestion while keeping the key frame."
  - "A world map of Cloudflare's 330+ city edge with MoQ relay icons at every PoP, date-stamped 2025 — captioned the first global MoQ relay network, beta managed service."
  - "A split-screen showing two IETF drafts side by side: draft-ietf-moq-transport-17 (March 2026, institutional weight) and draft-lcurley-moq-lite-02 (November 2025, by Luke Curley, with the pull-quote about too many messages and half-baked features)."
  - "A NAB 2026 trade-show floor with eleven vendor logos under one OpenMOQ Software Consortium banner — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — date-stamped 28 April 2026."
---

# Part VIII, Chapter — MoQ Transport

## The hook

"MoqTransport has become too complicated. There are too many messages, optional modes, and half-baked features." That is Luke Curley, in November 2025, in a working-group draft called moq-lite — and Luke Curley is one of the working group's own authors. The IETF's flagship live-streaming transport is being forked from inside its own committee, six months before it was supposed to settle. This is the chapter on the protocol that wants to replace HLS for live, was never meant to compete with WebRTC, and as of May 2026 has zero consumer-scale deployment.

## The story

### The Sub-Second Frontier

The previous chapter ended with HLS and DASH winning the streaming war by trading latency for compatibility with the web. For movies and series and re-runs, that trade was free money. For sports, for gaming streams, for auctions, for interactive broadcasting, that 40-to-80-second end-to-end delay is intolerable. Viewers see the goal scored on Twitter before they see it on their TV.

The decade-old workarounds each solved a slice. RTMP — the Flash-era protocol from 2002 that refused to die — handles ingest from the camera to the first server. Low-latency HLS shaves the player-side delay to 2 to 5 seconds. Custom WebRTC stacks deliver browser real-time at 50 to 200 milliseconds, but only at SFU scale, not at CDN scale. Nothing in production gives you sub-second one-to-many at the size of an HLS audience. RTMP, low-latency HLS, and WebRTC each get their own episode.

Media over QUIC — MoQ — is the first IETF media transport that intentionally is not RTP. Draft-ietf-moq-transport-17 was published in March 2026. The co-editors are Suhas Nandakumar at Cisco, Victor Vasiliev and Ian Swett at Google, and Alan Frindell at Meta. The data model is publish/subscribe with relay caches: media flows as track, then group, then subgroup, then object, and those objects ride either over QUIC streams or over unreliable QUIC datagrams. The whole thing runs over either raw QUIC or WebTransport, so it's reachable from a browser. The mechanism story for QUIC itself — one-RTT handshakes, no head-of-line blocking, connection migration — that's the QUIC episode.

One thing to be clear about up front: MoQ is not a WebRTC competitor in the conversational case. It is optimised for one-to-many publish/subscribe at CDN scale. When Cloudflare framed MoQ in January 2025 with the line "We're joining Meta, Google, Cisco" — webrtcHacks pushed back hard in a piece called "Is everyone switching to MoQ?", and the rebuttal stuck. MoQ is positioned to replace HLS for live delivery. It is not positioned to replace WebRTC for two-way calls. Different shapes, different jobs.

### The Spec Forking Inside the Working Group

This is the part where it gets unusual. The MoQ specification is being forked from inside the working group. Luke Curley's draft-lcurley-moq-lite-02 went out in November 2025 and was on revision 04 by 2026. The opening rationale, in Curley's own words: MoqTransport has become too complicated. Too many messages. Too many optional modes. Half-baked features.

A working-group co-author publishing a competing draft inside the same working group is a tell. The design is not converging. As of the March 2026 IETF meeting, MoQ-Lite has support from a small group of implementers. The main draft has the institutional weight — Cisco, Google, Meta in the co-editor seats. Whether the two merge, whether one wins, or whether both ship and the market chooses the survivor — that is open as this episode is being recorded.

And yet the spec has attracted serious implementation effort. NAB 2026, on 28 April 2026, demoed MoQ interop across eleven vendors under a brand-new "OpenMOQ Software Consortium" banner — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, and Red5. Cloudflare deployed an MoQ relay at every Cloudflare edge across 330-plus cities through 2025 as a beta managed service — the first global MoQ relay network. The spec is contested. The infrastructure is being built anyway.

### Browsers, Apple, and the Adjacent Path

The browser story matured very fast. WebTransport reached cross-browser Baseline status in March and April 2026, when Safari 26.4 shipped support. Combined with WebCodecs — the JavaScript API for raw audio and video frames — this is the first time JavaScript can implement non-RTP media transports natively in the browser. Safari's first early WebTransport ship was 18.4, in March and April 2025. A year from early support to cross-browser baseline. That is fast for a media-tier API.

Twitch's heritage matters here. Twitch's internal project — code-named Warp, a QUIC-based replacement for HLS — was presented at Demuxed 2021 and became the seed of the MoQ Working Group's WARP draft. The thread runs straight from one engineering team's HLS-replacement experiment to a four-vendor IETF spec.

End-to-end secure MoQ objects are also being built into the spec from day one. Draft-ietf-moq-secure-objects-00, March 2026, brings application-layer encryption into MoQ's foundation, mirroring what SFrame retrofitted onto RTP after the fact. The lesson the working group is taking from RTP's E2EE retrofit pain — design encryption in at the start, not bolt it on at the end.

The honest 2025 latency landscape, end to end, looks like this. Standard HLS and DASH: roughly 6 to 30 seconds. Low-latency HLS and DASH: 2 to 5 seconds. WebRTC SFU: about 50 to 200 milliseconds. MoQ's target: under 1 second at HLS-style fanout. That is the rung MoQ is reaching for.

But a measurement Phenix did for the 2025 Super Bowl makes the engineering ambition concrete. The best OTT stream — Tubi — was 41 seconds behind the play. The worst — Fubo — was 78 seconds behind. Cable was 50 seconds behind. Over-the-air broadcast was 22. That is the gap MoQ is being designed to collapse. And the honest status: MoQ has no consumer-scale deployment as of May 2026. Cloudflare, Bitmovin, and nanocosmos have shipped early production paths. Apple has not endorsed MoQ.

The conservative alternative path is RTP-over-QUIC, called RoQ. Draft-ietf-avtcore-rtp-over-quic-14 entered Working Group Last Call in July 2025. RoQ keeps the entire RTP and RTCP ecosystem intact and just swaps UDP for QUIC underneath. Same envelope, new wheels. MoQ throws the envelope out and starts over. The fork in the road is real, and as of May 2026 nobody knows which path the industry walks.

## The figures

### Media-over-QUIC (MoQ) Transport

This is the frontier entry the chapter is built around. Draft-ietf-moq-transport-17 — March 2026 — is the IETF's Media-over-QUIC Transport: sub-second live streaming over QUIC, designed to replace the RTMP-into-HLS pipeline that streamers use today. The architecture is publishers sending named objects to MoQ relays, and subscribers fetching named objects from the nearest relay, hop by hop over QUIC. Object naming plus QUIC stream multiplexing means a relay can drop objects under congestion — preserving key frames over delta frames — without the publisher coordinating. Cloudflare and Meta have public MoQ relay implementations. Twitch and YouTube are evaluating. WebRTC's lunch may finally be eaten for one-to-many use cases.

## What it taught the industry

The early lesson of MoQ is about how a spec gets built when the previous generation's wins were also its limits. RTP solved the wire-format problem for real-time media in 1996 and has run nearly every voice and video call on the internet for thirty years. But its E2EE story had to be retrofitted with SFrame. Its transport — UDP — has no congestion control of its own. Its multiplexing model maps awkwardly onto modern CDN topologies. MoQ is the first serious attempt at a clean-sheet media transport that takes those thirty years of operating experience as input.

The fork inside the working group is the second lesson. Engineering by committee converges when the use case is narrow. Live media is not narrow — Twitch's needs, Meta's Reels needs, Cloudflare's relay-as-a-service needs, and Cisco's enterprise-call needs do not naturally collapse into one wire format. A two-track outcome — MoQ for the institutional path, MoQ-Lite for the small-and-fast path — would not be a failure. It would be an honest reflection of which problems each constituency is actually trying to solve.

The third lesson is the WebTransport-and-WebCodecs convergence. For the entire history of the web, real-time media in the browser meant Flash, then plugins, then WebRTC. WebTransport plus WebCodecs is the first time a JavaScript developer can implement a media transport from scratch without a plugin and without being trapped inside the WebRTC stack. The next decade of browser media experiments will be built on that foundation, regardless of whether MoQ itself wins.

## Listening order

- **Before this chapter:** "HLS and DASH" — the chapter that explains why HTTP-segment delivery won the streaming war and why its 6-to-30-second latency is the wall MoQ is trying to break through.
- **After this chapter:** "DNS" — Part VIII closes on the live-media frontier, and the next chapter pivots to the utilities-and-security part of the book with the protocol that turns names into addresses for everything you've heard about so far.

## Where to go deeper

- The QUIC episode covers the one-RTT handshake, head-of-line-blocking-free streams, and connection migration that MoQ inherits for free.
- The HLS episode picks up the segment-and-manifest mechanics, low-latency HLS, and the CMAF convergence that MoQ is positioning to replace for live.
- The DASH episode covers the MPD manifest, Periods and Adaptation Sets, and the codec-agnostic ISO standard that runs alongside HLS today.
- The RTMP episode covers the 2002 Macromedia origin, the chunking mechanism, and why RTMP still owns the ingest path from camera to first server even after Flash died in 2020.
- The WebRTC episode explains why MoQ is not its competitor — peer-to-peer signalling, ICE, DTLS, SRTP, and the SFU pattern that owns the conversational tier.
- The RTP episode covers the sequence numbers, timestamps, payload-type identification, and the RTCP feedback channel that MoQ is the first IETF media transport to walk away from.
- The UDP episode explains the 8-byte header and the fire-and-forget model that QUIC builds on and that MoQ ultimately rides.

## Visual cues for image generation

- A four-tier latency ladder: standard HLS and DASH at 6-30 seconds on top, low-latency HLS and DASH at 2-5 seconds, MoQ target under 1 second, and WebRTC SFU at 50-200 milliseconds at the bottom — with the MoQ rung highlighted as the new arrival.
- A MoQ data-model diagram: track, then group, then subgroup, then object, with named objects flowing from a publisher through a chain of QUIC relay caches out to many subscribers, and one relay dropping a delta-frame object under congestion while keeping the key frame.
- A world map of Cloudflare's 330-plus city edge with MoQ relay icons at every PoP, date-stamped 2025 — captioned as the first global MoQ relay network, beta managed service.
- A split-screen showing two IETF drafts side by side: draft-ietf-moq-transport-17 from March 2026 with the four co-editor names and institutional logos on the left, and draft-lcurley-moq-lite-02 from November 2025 by Luke Curley on the right, with the pull-quote about too many messages and half-baked features.
- A NAB 2026 trade-show floor with eleven vendor logos under one OpenMOQ Software Consortium banner — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5 — date-stamped 28 April 2026.

## Sources

- [IETF — draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [Cloudflare — MoQ](https://blog.cloudflare.com/moq/)
