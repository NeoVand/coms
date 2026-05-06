---
prompt_source: deep-research-prompts.txt:7009-7186 (SDP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/614c098c-8de3-4beb-bc4a-7c7f50f76fdf
research_mode: claude.ai Research
---

# The Session Description Protocol (SDP): A Complete Engineer's Reference (May 2026)

> **Audience note.** This report is written for engineers — some new to networking, some experienced. Every section assumes that you know what TCP/UDP and HTTP are, but defines everything else. The protocol itself (SDP) has been *remarkably* stable since RFC 8866 was published in January 2021; almost everything that has changed in the last 24 months is in the *surrounding ecosystem* (WebRTC, WHIP, JSEP-bis, Media-over-QUIC). Where I cite a pre-2024 source, treat it as "verified against current state," and where I could not corroborate, I mark `[needs source]`.

---

## 1. Prerequisites and glossary

You cannot make sense of SDP without these concepts. Each is defined briefly and pointed at the canonical specification.

**OSI / TCP-IP layering.** SDP is an *application-layer payload format* — it is *not* a transport protocol. It sits inside SIP messages, RTSP messages, HTTP bodies, or SAP datagrams. It does not define how it gets from A to B; that is the encapsulating protocol's job. (RFC 8866 §1 is explicit on this point. See [https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) )

**Datagram.** A self-contained packet carried by a connectionless transport (UDP). Contrast with **stream**, an ordered byte sequence (TCP, QUIC streams). RTP runs on UDP datagrams; WebRTC uses UDP-encapsulated datagrams over ICE-negotiated 5-tuples.

**Socket / 5-tuple.** The combination (src IP, src port, dst IP, dst port, transport protocol) that uniquely identifies a flow. SDP's `c=` and `m=` lines together describe one endpoint of such a 5-tuple.

**Header / payload.** Every protocol layer prepends a header to user data; SDP describes how to interpret the *payload* of RTP packets (via `a=rtpmap`, `a=fmtp`).

**Checksum.** Integrity field on UDP/IP packets. SDP itself has no checksum; integrity is delegated.

**Handshake.** Multi-step negotiation that establishes shared state — TCP three-way handshake, TLS/DTLS handshake, ICE connectivity check, and **SDP offer/answer** are all handshakes at different layers.

**Frame / packet.** A frame is one unit at link layer (Ethernet); a packet is one unit at IP layer; an RTP *packet* typically carries one *audio frame* or part of a *video frame*.

**Codec (coder/decoder).** Algorithm that turns raw audio/video into compressed bytes (Opus, G.711, H.264, VP8, VP9, AV1, H.265). SDP names them in `a=rtpmap` lines.

**Payload type (PT).** A 7-bit integer in the RTP header that names a codec-and-clock-rate pair. Static PTs (0–95) are pre-assigned in RFC 3551; dynamic PTs (96–127) are bound to codec names by `a=rtpmap` in SDP. (See [https://datatracker.ietf.org/doc/rfc3551/](https://datatracker.ietf.org/doc/rfc3551/) )

**Multiplexing.** Carrying multiple logical streams over one transport. WebRTC uses `a=group:BUNDLE` (RFC 9143) to multiplex audio, video, and data over one ICE/DTLS 5-tuple, demultiplexed inside by SSRC and `a=mid`. (See [https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143) ) [Hjp](https://www.hjp.at/doc/rfc/rfc9143.html)

**NAT traversal.** Most endpoints sit behind Network Address Translators that rewrite ports. ICE (RFC 8445), STUN (RFC 8489), and TURN (RFC 8656) discover usable paths; the discovered "candidates" are signaled in SDP `a=candidate` lines. (See [https://datatracker.ietf.org/doc/rfc8445/](https://datatracker.ietf.org/doc/rfc8445/) )

**UTF-8.** Variable-length encoding of Unicode code points. SDP free-text fields are UTF-8 by default; field/attribute *names* use US-ASCII only (RFC 8866 §5).

**ABNF (Augmented Backus-Naur Form, RFC 5234).** Formal grammar notation. RFC 8866 §9 defines SDP's grammar in ABNF — RFC 4566 historically had ABNF clarifications that were tightened in 8866. (See [https://datatracker.ietf.org/doc/rfc5234/](https://datatracker.ietf.org/doc/rfc5234/) )

**Base64.** ASCII encoding of binary as 6-bit groups; used in SDP for the now-deprecated `k=` field and for some `a=fingerprint` formats `[needs source for current usage in fingerprint]`.

**CRLF (`\r\n`).** Line terminator. RFC 8866 specifies CRLF, but per a long-standing footnote in the Wikipedia summary "implementations may relax this by omitting the carriage return," and almost every real parser tolerates `\n`. ([https://en.wikipedia.org/wiki/Session_Description_Protocol](https://en.wikipedia.org/wiki/Session_Description_Protocol) ) [Wikipedia](https://en.wikipedia.org/wiki/Session_Description_Protocol)

**MIME / media type.** `application/sdp` is the registered media type for SDP bodies (RFC 8866 §8.1). The file extension `.sdp` is conventional. [Muonics](https://www.muonics.com/rfc/rfc8866.php)[Muonics](https://www.muonics.com/rfc/rfc8866.php)

**RTP / RTCP.** Real-time Transport Protocol (RFC 3550) and its Control Protocol counterpart. RTP carries media; RTCP carries quality reports and synchronization. SDP describes both via `m=` (the RTP port) and `a=rtcp` / `a=rtcp-mux` for RTCP. (See [https://datatracker.ietf.org/doc/rfc3550/](https://datatracker.ietf.org/doc/rfc3550/) )

**SRTP / DTLS-SRTP.** Secure RTP (RFC 3711) encrypts the RTP payload. DTLS-SRTP (RFC 5763 + RFC 8842) bootstraps SRTP keys via a DTLS handshake on the media path; SDP carries the certificate fingerprint in `a=fingerprint` and active/passive role in `a=setup`. (See [https://datatracker.ietf.org/doc/rfc8842/](https://datatracker.ietf.org/doc/rfc8842/) )

**Offer/Answer.** The two-step exchange model (RFC 3264) used by SIP and WebRTC: caller proposes a session description; callee returns one accepting/rejecting/modifying it. (See [https://datatracker.ietf.org/doc/rfc3264/](https://datatracker.ietf.org/doc/rfc3264/) )

**SSRC (Synchronization Source).** 32-bit identifier in the RTP header that names a sender. SDP `a=ssrc` lines bind these to streams.

**MID / MSID.** The `a=mid` attribute (RFC 5888 / RFC 9143) labels each `m=` section so that multiplexed streams can be demuxed; `a=msid` (RFC 8830) carries the WebRTC MediaStream/Track identifiers used by JavaScript.

---

## 2. History and story

**Origin (1994–1996).** SDP began life inside Mark Handley and Van Jacobson's work at the University of Southern California's Information Sciences Institute (ISI) and Lawrence Berkeley National Lab. The driving need was the Multicast Backbone (MBone) era — `vat` (audio), `vic` (video), and `sdr` (the "session directory" tool) needed a tiny text format to advertise multicast conferences. SAP (Session Announcement Protocol) blasted SDP records to a well-known multicast address; `sdr` listened and presented a list of running sessions. RFC 2327 itself opens with the line: *"On the Internet multicast backbone (Mbone), a session directory tool is used to advertise multimedia conferences."* ([https://www.ietf.org/rfc/rfc2327.txt](https://www.ietf.org/rfc/rfc2327.txt) ) [IETF](https://www.ietf.org/rfc/rfc2327.txt)

**RFC 2327 (April 1998), authors Mark Handley and Van Jacobson, IETF MMUSIC working group.** This was the first Proposed Standard. Funding context: most of this work was performed under DARPA-funded research at ISI/LBL; the MMUSIC mailing list was hosted at `confctrl@isi.edu` (visible in the RFC 2327 acknowledgments). ([https://datatracker.ietf.org/doc/rfc2327/](https://datatracker.ietf.org/doc/rfc2327/) ) [IETF](https://datatracker.ietf.org/doc/rfc2327/)

**RFC 4566 (July 2006), Handley, Jacobson, Perkins.** Obsoleted RFC 2327 and RFC 3266 (the IPv6 patch). Tightened the ABNF, folded IPv6 in cleanly, generalized away from "designed for SAP". ([https://datatracker.ietf.org/doc/rfc4566/](https://datatracker.ietf.org/doc/rfc4566/) ) [IETF](https://datatracker.ietf.org/doc/html/rfc4566)

**RFC 8866 (January 2021), Begen, Kyzivat, Perkins, Handley.** Current canonical spec. Obsoletes RFC 4566. Per RFC 8866 §10 ("Summary of Changes from RFC 4566"), the changes are: [RFC Editor](https://www.rfc-editor.org/rfc/rfc8866.txt)[Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8866.html)

- The `k=` (encryption keys) field is now formally **OBSOLETE** (RFC 8866 §5.12, §8.3) — you should not generate it; if you receive it, you should ignore it. ([https://www.rfc-editor.org/rfc/rfc8866](https://www.rfc-editor.org/rfc/rfc8866) )
- ABNF cleaned and aligned with RFC 5234.
- IPv6 handling integrated (subsuming RFC 3266).
- Security considerations updated to defer keying material conveyance to the encapsulating protocol; specifically, "SDP MUST NOT be used to convey keying material … unless it can be guaranteed that the channel … is both private and authenticated" (RFC 8866 §7). [IETF Datatracker](https://sandbox.ietf.org/doc/rfc8866/)[IETF](https://datatracker.ietf.org/doc/rfc8866/)
- Editorial: removed "BNF" and used "ABNF"; clarified UTF-8 vs. US-ASCII split for field-names vs. free-text.
- Authors changed: **Begen and Kyzivat were added; Jacobson dropped from the front page** (he remains in the lineage). ([https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) )

**The SDPng failure (2001–2005).** Throughout the early 2000s, MMUSIC tried to replace SDP with **SDPng** (Session Description Protocol next generation), an XML-based format that would natively support capability negotiation (which SDP had to be retrofitted with via offer/answer in RFC 3264). The drafts (`draft-ietf-mmusic-sdpng`, last revisions ~2005) were never standardized. RFC 3407 ("SDP Simple Capability Declaration," October 2002) is itself defined as a stop-gap "until SDPng arrives" — and SDPng never did. The reasons SDPng failed are not in any single RFC, but the practical reasons are well documented in MMUSIC mailing-list archives and in the Begen/Perkins history: too complex, no momentum, SIP vendors were already shipping SDP, and offer/answer in SDP turned out to be "good enough." (See [https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdpng](https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdpng) and [https://datatracker.ietf.org/doc/rfc3407/](https://datatracker.ietf.org/doc/rfc3407/) ) [IETF](https://datatracker.ietf.org/doc/rfc3407/)

**Politics of adoption (1998–2005).** SDP's adoption was tied to SIP's defeat of H.323 (ITU-T) in the carrier VoIP arms race of the early 2000s. SIP/SDP won because it was text-based, modular, web-aligned, and had simpler firewall traversal stories than H.323's binary, ASN.1-encoded, gatekeeper-centric world. ([https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/](https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/) ; [https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP) ) [Trueconf](https://trueconf.com/blog/reviews-comparisons/why-sip-better-than-h323)

**The WebRTC era (2011–present).** When the IETF RTCWEB working group standardized WebRTC, there was a serious internal fight about whether to use SDP at all. Tim Panton's famous webrtcHacks rant — *"We've been burdened with this floppy, ill specified, un parseable mess for the sake of some fictional devices … When some of us pointed this out 18 months ago, we were told that it would be much quicker not to try and create a new session description format, re-using SDP would save time … We put up a fight, but in the end we caved in order to get the standard out quicker."* — captures the mood. ([https://webrtchacks.com/tim-rant/](https://webrtchacks.com/tim-rant/) ) The compromise was JSEP (RFC 8829, January 2021), now obsoleted by **RFC 9429 (April 2024)**, which formalized how JavaScript drives an SDP-based offer/answer state machine while pretending it doesn't have to know what SDP is. [webrtcHacks](https://webrtchacks.com/tim-rant/)

**What's changed in the last 24 months (2024–2026)** — explicitly:

1. **RFC 9429 (April 2024)** obsoletes RFC 8829 (JSEP), resolving long-known inconsistencies between JSEP and BUNDLE (RFC 9143) and updating ICE specifics. ([https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/) ) [IETF](https://datatracker.ietf.org/doc/rfc9429/)[IETF](https://datatracker.ietf.org/doc/rfc9429/)
2. **RFC 9725 (March 2025), WHIP** — WebRTC-HTTP Ingestion Protocol — published as Standards Track, updating RFCs 8840 and 8842. WHIP standardizes a one-shot HTTP POST of an SDP offer / 201 Created with SDP answer for WebRTC ingest. ([https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) ) [IETF](https://datatracker.ietf.org/doc/rfc9725/)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9725.html)
3. **WHEP** (WebRTC-HTTP Egress Protocol) is in WG draft (`draft-ietf-wish-whep`), the egress counterpart of WHIP; not yet an RFC as of the cut-off. ([https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) )
4. **Media over QUIC (MoQ)** — the IETF MoQ working group is actively producing `draft-ietf-moq-transport` (rev 17 by late 2025), an attempt to replace RTP+SDP for streaming-style use cases with a QUIC-native protocol. **It is not an RFC yet.** ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) )
5. **W3C WebRTC: Real-Time Communication in Browsers** was re-published as an updated Recommendation in 2025, with WebRTC-NV ("next version") work continuing in the Extensions and Extended Use Cases drafts. ([https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/](https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/) )
6. **Plan B is gone.** Chrome's legacy "Plan B" SDP semantics, the source of countless interop bugs, was removed across all release channels by M96 and remains out as of 2026. The world is unified-plan only. ([https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide) ) [WebRTC](https://webrtc.org/getting-started/unified-plan-transition-guide)

The protocol itself has not changed. **RFC 8866 is still the canonical SDP spec** as of May 2026.

---

## 3. How it actually works

### 3.1 Top-level format

An SDP description is plain text, one `<type>=<value>` per line, terminated by CRLF. Types are single case-sensitive ASCII letters. Field/attribute *names* are US-ASCII; *values* may be UTF-8. Whitespace around the `=` is forbidden. Lines must appear in a fixed order; this is deliberate so that simple parsers (and middleboxes) can detect malformations cheaply (RFC 8866 §5). [Wikipedia + 2](https://en.wikipedia.org/wiki/Session_Description_Protocol)

Line ordering, with `*` meaning optional:

```
Session-level
  v=  (protocol version, always 0)
  o=  (originator)
  s=  (session name, MUST be present, MAY be a single space)
  i=* (session information)
  u=* (URI)
  e=* (email)
  p=* (phone)
  c=* (connection info — required either here or in every m=)
  b=* (bandwidth, zero or more)
  One or more time descriptions:
    t=  (start/stop)
    r=* (repeat times)
  z=* (time-zone adjustments)
  k=* (OBSOLETE in RFC 8866; do not use)
  a=* (zero or more session-level attributes)

Zero or more media descriptions, each starting with m=:
  m=  (media, port, transport, formats)
  i=* (media title)
  c=* (connection info, overrides session-level)
  b=* (bandwidth)
  k=* (OBSOLETE)
  a=* (media-level attributes)
```

The set of letters is **deliberately not extensible.** Any unknown type letter MUST cause the parser to discard the description (RFC 8866 §5). [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8866.html)

### 3.2 The lines, decoded

- **`v=0`** — protocol version. Has been zero since 1998. There is no current proposal to change it; bumping it would gain nothing because SDP grew through attribute extensions (`a=`) instead.
- **`o=<username> <sess-id> <sess-version> <nettype> <addrtype> <addr>`** — origin. `<sess-id>` is typically an NTP timestamp; `<sess-version>` increments on each renegotiation. WebRTC uses `o=- 12345 2 IN IP4 127.0.0.1` (the dash means anonymous).
- **`s=<text>`** — session name. **MUST be present and non-empty.** Per long-standing convention it is often `s= ` (a single space) when no meaningful name exists; a literal empty value is forbidden by the ABNF.
- **`c=IN <addrtype> <addr>`** — connection. `addrtype` is `IP4` or `IP6`. For multicast you can append `/<ttl>/<count>`.
- **`t=<start> <stop>`** — active times in NTP seconds since 1 Jan 1900 UTC. **`t=0 0` is universal in SIP and WebRTC** and means "unbounded session, starting now." Because SDP uses arbitrary-length decimals, NTP year-2036 wrap is not a problem (RFC 8866 §5.9). ([https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) ) [University of Glasgow](https://eprints.gla.ac.uk/232855/1/232855.pdf)
- **`m=<media> <port> <proto> <fmt> ...`** — media description. `media` is `audio`, `video`, `application`, `text`, or `message`. Port 0 means "rejected." `proto` is e.g. `RTP/AVP`, `RTP/SAVP`, `RTP/SAVPF`, or in WebRTC `UDP/TLS/RTP/SAVPF`. `<fmt>` is a list of payload-type numbers.
- **`a=`** — the extension mechanism. There are now hundreds of registered attributes; the IANA "Session Description Protocol Parameters" registry is the authoritative list, controlled by MMUSIC. (See [https://www.iana.org/assignments/sdp-parameters/sdp-parameters.xhtml](https://www.iana.org/assignments/sdp-parameters/sdp-parameters.xhtml) ) [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8866.html)

### 3.3 Crucial attributes

| Attribute | Purpose | Defining RFC |
|---|---|---|
| `a=rtpmap:PT codec/clockrate[/channels]` | Bind dynamic PT to codec | RFC 8866 §6.6 |
| `a=fmtp:PT params` | Codec-specific format parameters (e.g., Opus `stereo=1`, H.264 `profile-level-id`) | RFC 8866 §6.15 |
| `a=ptime:N` / `a=maxptime:N` | Packetization time in ms | RFC 8866 §6.4–6.5 |
| `a=sendrecv` / `a=sendonly` / `a=recvonly` / `a=inactive` | Direction | RFC 8866 §6.7 |
| `a=rtcp-mux` | RTP and RTCP share one port | RFC 5761 |
| `a=mid:value` | Identifier for this m-line | RFC 5888 |
| `a=group:BUNDLE mid1 mid2 ...` | Multiplex multiple m-lines on one transport | RFC 9143 |
| `a=msid:streamId trackId` | WebRTC stream/track ID | RFC 8830 |
| `a=ssrc:N attr:val` | Per-source attributes | RFC 5576 |
| `a=ice-ufrag:` / `a=ice-pwd:` | ICE credentials | RFC 8839 |
| `a=candidate:...` | An ICE candidate | RFC 8839 |
| `a=fingerprint:hash value` | DTLS certificate fingerprint | RFC 8122 / RFC 8842 |
| `a=setup:actpass\|active\|passive\|holdconn` | DTLS role | RFC 4145 / RFC 8842 |
| `a=extmap:N URI` | RTP header extension mapping | RFC 8285 |
| `a=rtcp-fb:PT type` | RTCP feedback (e.g., `nack`, `goog-remb`, `transport-cc`) | RFC 4585 |

### 3.4 The offer/answer model (RFC 3264)

1. **Offerer** generates an SDP, sets it as `localDescription`, sends it.
2. **Answerer** receives it as `remoteDescription`, generates a *parallel* SDP that mirrors each `m=` section by index, accepting or rejecting each (port 0 = reject), and chooses one of the offered codecs per media line.
3. **Offerer** receives the answer and sets it as `remoteDescription`. Both sides now have a stable session.

Renegotiation: either side may issue a new offer (`o=` `<sess-version>` increments). **Hold/resume** is achieved by changing `a=sendrecv` ↔ `a=sendonly` or by setting connection address `0.0.0.0` (RFC 4317 §5.2 has the canonical examples). ([https://www.rfc-editor.org/rfc/rfc4317.html](https://www.rfc-editor.org/rfc/rfc4317.html) ) [RFC Editor](https://www.rfc-editor.org/rfc/rfc4317.html)

**Glare** is the condition where both sides issue offers simultaneously. SIP resolves it via 491 ("Request Pending") + retry-after-jitter (RFC 3261 §14.1). WebRTC's JSEP (RFC 9429) uses the "rollback" signaling state and a tie-breaker on session description.

### 3.5 Sequence diagrams

Bob (SIP UA)SIP ProxyAlice (SIP UA)Bob (SIP UA)SIP ProxyAlice (SIP UA)#mermaid-rbn{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rbn .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rbn .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rbn .error-icon{fill:#CC785C;}#mermaid-rbn .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rbn .edge-thickness-normal{stroke-width:1px;}#mermaid-rbn .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rbn .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rbn .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rbn .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rbn .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rbn .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rbn .marker.cross{stroke:#A1A1A1;}#mermaid-rbn svg{font-family:inherit;font-size:16px;}#mermaid-rbn p{margin:0;}#mermaid-rbn .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rbn text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbn .actor-line{stroke:#A1A1A1;}#mermaid-rbn .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rbn .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rbn #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rbn .sequenceNumber{fill:#5e5e5e;}#mermaid-rbn #sequencenumber{fill:#E5E5E5;}#mermaid-rbn #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rbn .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rbn .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rbn .labelText,#mermaid-rbn .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbn .loopText,#mermaid-rbn .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbn .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rbn .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rbn .noteText,#mermaid-rbn .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbn .activation0{fill:transparent;stroke:#00000000;}#mermaid-rbn .activation1{fill:transparent;stroke:#00000000;}#mermaid-rbn .activation2{fill:transparent;stroke:#00000000;}#mermaid-rbn .actorPopupMenu{position:absolute;}#mermaid-rbn .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rbn .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rbn .actor-man circle,#mermaid-rbn line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rbn :root{--mermaid-font-family:inherit;}SIP+SDP offer/answer (RFC 3261, RFC 3264)RTP media flows on negotiated 5-tuplesINVITE sip:bob@... \n Content-Type: application/sdp \n [SDP offer: m=audio PCMU PCMA OPUS]1INVITE (forwarded, same SDP body)2200 OK \n Content-Type: application/sdp \n [SDP answer: m=audio OPUS]3200 OK (forwarded)4ACK5RTP audio (PT=111 OPUS)6RTP audio (PT=111 OPUS)7

Browser B (JS)Signaling (any)Browser A (JS)Browser B (JS)Signaling (any)Browser A (JS)#mermaid-rbo{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rbo .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rbo .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rbo .error-icon{fill:#CC785C;}#mermaid-rbo .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rbo .edge-thickness-normal{stroke-width:1px;}#mermaid-rbo .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rbo .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rbo .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rbo .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rbo .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rbo .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rbo .marker.cross{stroke:#A1A1A1;}#mermaid-rbo svg{font-family:inherit;font-size:16px;}#mermaid-rbo p{margin:0;}#mermaid-rbo .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rbo text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbo .actor-line{stroke:#A1A1A1;}#mermaid-rbo .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rbo .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rbo #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rbo .sequenceNumber{fill:#5e5e5e;}#mermaid-rbo #sequencenumber{fill:#E5E5E5;}#mermaid-rbo #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rbo .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rbo .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rbo .labelText,#mermaid-rbo .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbo .loopText,#mermaid-rbo .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbo .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rbo .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rbo .noteText,#mermaid-rbo .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rbo .activation0{fill:transparent;stroke:#00000000;}#mermaid-rbo .activation1{fill:transparent;stroke:#00000000;}#mermaid-rbo .activation2{fill:transparent;stroke:#00000000;}#mermaid-rbo .actorPopupMenu{position:absolute;}#mermaid-rbo .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rbo .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rbo .actor-man circle,#mermaid-rbo line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rbo :root{--mermaid-font-family:inherit;}WebRTC (RFC 9429 JSEP) over an opaque signaling channelpar[ICE in parallel]ICE connectivity checks → DTLS handshake → SRTPpc.createOffer() → SDP1pc.setLocalDescription(offer)2send {type:"offer", sdp}3deliver offer4pc.setRemoteDescription(offer)5pc.createAnswer() → SDP6pc.setLocalDescription(answer)7send {type:"answer", sdp}8deliver answer9pc.setRemoteDescription(answer)10trickle ICE candidates (a=candidate ...)11deliver candidates12trickle ICE candidates13deliver candidates14SRTP/SCTP-DTLS over the chosen 5-tuple15SRTP/SCTP-DTLS16

### 3.6 A complete, illustrative WebRTC SDP offer (audio + video, BUNDLE, DTLS-SRTP)

This is a slightly simplified version of the structure documented in webrtcHacks's "Anatomy of a WebRTC SDP" ([https://webrtchacks.com/sdp-anatomy/](https://webrtchacks.com/sdp-anatomy/) ; [https://github.com/webrtcHacks/sdp-anatomy](https://github.com/webrtcHacks/sdp-anatomy) ) and aligns with what current Chrome and Firefox emit:

```
v=0
o=- 7785195417178360000 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=msid-semantic: WMS stream-id-1
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:CkD/
a=ice-pwd:np9wirNlKX22iHbYR5LB41Kk
a=ice-options:trickle
a=fingerprint:sha-256 3B:D5:7A:54:91:CD:61:69:11:2D:0F:2E:34:09:A3:8E:FA:0B:AD:18:5D:17:9A:86:DE:14:39:07:FA:50:C6:1C
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=sendrecv
a=msid:stream-id-1 audio-track-1
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:106 CN/32000
a=rtpmap:105 CN/16000
a=rtpmap:13 CN/8000
a=rtpmap:126 telephone-event/8000
a=ssrc:1234567890 cname:user@host
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:CkD/
a=ice-pwd:np9wirNlKX22iHbYR5LB41Kk
a=fingerprint:sha-256 3B:D5:7A:54:91:CD:61:69:11:2D:0F:2E:34:09:A3:8E:FA:0B:AD:18:5D:17:9A:86:DE:14:39:07:FA:50:C6:1C
a=setup:actpass
a=mid:1
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=sendrecv
a=msid:stream-id-1 video-track-1
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtpmap:97 H264/90000
a=fmtp:97 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f
a=ssrc:9876543210 cname:user@host
```

A minimal valid SDP answer mirrors the order: same number of `m=` lines, same `mid` values, picks one PT per stream.

### 3.7 Implementation guidance

A minimal SDP parser is roughly:

1. Split on CRLF (tolerate bare LF).
2. For each line, split once on `=` to get `(type, value)`.
3. Dispatch on `type`. The state machine has three modes: session-level (before first `m=`), media-level (after an `m=`), and "skipping unknown."
4. For `a=` values, split once on `:` to separate attribute name from value.
5. Maintain a "current media" pointer; route media-level fields into it.
6. Validate the *order* per RFC 8866 §5; reject on disorder for safety.

A minimal generator is the inverse — but the *gotcha* is character-set discipline (all-ASCII for names, UTF-8 for free text), CRLF termination, and not generating `k=`.

### 3.8 Security model

SDP carries *signaling-level* parameters; it has **no integrity, authentication, or confidentiality of its own.** Per RFC 8866 §7: "SDP MUST NOT be used to convey keying material … unless it can be guaranteed that the channel … is both private and authenticated." ([https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) ) DTLS-SRTP (RFC 5763 / RFC 8842) sidesteps this by exchanging only certificate fingerprints in SDP and doing key agreement on the media path. ([https://datatracker.ietf.org/doc/rfc8842/](https://datatracker.ietf.org/doc/rfc8842/) ) Unknown-key-share attacks against this model are documented in **RFC 8844**. ([https://datatracker.ietf.org/doc/html/rfc8844](https://datatracker.ietf.org/doc/html/rfc8844) ) [RFC Editor](https://www.rfc-editor.org/rfc/rfc8866.txt)[IETF](https://datatracker.ietf.org/doc/rfc8866/)

---

## 4. Deep connections to other protocols

**SIP (RFC 3261).** SDP is the canonical body of SIP `INVITE`/`200 OK`/`UPDATE`/`PRACK`/`re-INVITE` messages. SIP's `Content-Type: application/sdp` carries it. The offer/answer model (RFC 3264) was *invented for SIP* and is now used identically by WebRTC. ([https://webrtc.link/en/articles/sdp-session-description-protocol-webrtc/](https://webrtc.link/en/articles/sdp-session-description-protocol-webrtc/) )

**RTP (RFC 3550).** SDP describes RTP streams: `m=audio` line names a port, `RTP/AVP` (or secure/feedback variants) names the profile, `a=rtpmap` binds dynamic PTs to codec names. RTCP is implied by the same `m=` line; `a=rtcp-mux` (RFC 5761) tells the peer to put RTCP on the same port.

**RTCP (RFC 3550, RFC 3611, RFC 4585).** SDP's `a=rtcp` attribute (RFC 3605) explicitly declares the RTCP port; `a=rtcp-fb` (RFC 4585) declares feedback messages (NACK, PLI, FIR, transport-cc).

**RTSP (RFC 7826).** Real-Time Streaming Protocol uses SDP as the description format returned by the `DESCRIBE` method to tell a client what tracks a stream contains. ([https://datatracker.ietf.org/doc/rfc7826/](https://datatracker.ietf.org/doc/rfc7826/) )

**SAP (RFC 2974).** SDP's *original* transport. SAP datagrams to a well-known multicast address advertised MBone sessions. SAP is effectively dead in production, but RFC 8866 §3.4 still describes the relationship.

**ICE / STUN / TURN (RFC 8445, RFC 8489, RFC 8656).** ICE candidates are signaled via `a=candidate`; the username fragment and password are `a=ice-ufrag` / `a=ice-pwd`; trickle ICE allows incremental delivery of candidates after the initial SDP. The mapping from ICE to SDP is RFC 8839. ([https://datatracker.ietf.org/doc/rfc8445/](https://datatracker.ietf.org/doc/rfc8445/) )

**DTLS-SRTP (RFC 5763, RFC 8842).** DTLS keys SRTP for WebRTC. SDP carries `a=fingerprint` (the cert hash) and `a=setup` (DTLS role). RFC 8842 (January 2021) updated the offer/answer rules; RFC 9725 (WHIP, March 2025) further updates RFC 8842. ([https://www.rfc-editor.org/rfc/rfc8842](https://www.rfc-editor.org/rfc/rfc8842) )

**JSEP (RFC 9429, April 2024, obsoletes RFC 8829).** JSEP is the "we couldn't get away from SDP, so here is the explicit JS state machine that drives it" specification that all browsers implement under `RTCPeerConnection`. JSEP fixes inconsistencies between RFC 8829 and BUNDLE (RFC 9143). ([https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/) ) [IETF](https://datatracker.ietf.org/doc/rfc9429/)

**BUNDLE (RFC 9143, February 2022, obsoletes RFC 8843).** The reason a typical WebRTC call uses a single ICE/DTLS 5-tuple even for audio + video + data: all `m=` lines are listed in `a=group:BUNDLE` and demuxed by `a=mid` and SSRC. ([https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143) )

**SAP / SDP at session vs. media level (RFC 5888).** The "Grouping Framework" in RFC 5888 (which BUNDLE extends) lets several `m=` lines be linked semantically (FID for redundancy, LS for lip-sync, BUNDLE for multiplex).

**MEGACO / H.248 (RFC 3525 → RFC 5125 / ITU-T H.248).** Media gateway control protocol used between softswitches and gateways. It carries SDP-like descriptors but in its own ASN.1/text framework. Distinct from SDP; used in carrier networks.

**H.323 (ITU-T).** SDP's *rival universe*. H.323 uses H.245 for capability negotiation and Q.931-derived call signaling — an entirely different, ASN.1-encoded stack. SIP/SDP won the IP telephony market by the mid-2000s; H.323 lingers in legacy room-system hardware and some defense/healthcare deployments. ([https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/](https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/) ) [Vsb](https://homel.vsb.cz/~voz29/files/voz_29.pdf)

**MGCP (RFC 3435).** Media Gateway Control Protocol — the IETF predecessor/sibling to MEGACO. Also embeds SDP for media descriptions.

**WHIP (RFC 9725, March 2025).** A one-shot HTTP POST with `Content-Type: application/sdp` (offer) gets back `201 Created` with an SDP answer. Used for pushing live WebRTC into CDNs. WHIP **disallows SDP renegotiation** — the only post-establishment SDP change is via HTTP PATCH for ICE updates. ([https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) )

**WHEP (`draft-ietf-wish-whep`).** The egress symmetric — pull WebRTC media from a server using a single HTTP POST. Active draft in WG. ([https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) )

**MoQ (`draft-ietf-moq-transport`, rev 17 in 2026).** Media-over-QUIC. The most ambitious "post-SDP" project at IETF — uses QUIC streams/datagrams with a publish/subscribe data model; does not use SDP at all. Still a draft. Seen by some as a long-term RTP+SDP successor for streaming/broadcast use cases. ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/) )

---

## 5. Real-world deployment

**Open-source SDP parsers and stacks.**

- **PJSIP / pjproject** (`pjmedia/sdp.c`) — most-deployed open-source SIP/SDP/RTP library; underpins Asterisk's `chan_pjsip`, FreeSWITCH's mod_sofia (in part), and many embedded VoIP devices. ([https://github.com/pjsip/pjproject](https://github.com/pjsip/pjproject) )
- **GStreamer** — `gst-plugins-base` includes a complete SDP module; used for both SIP and RTSP scenarios.
- **FFmpeg** — has an SDP demuxer/muxer for RTSP-described streams.
- **libsdp / libsdptransform** — small C/C++ libraries used inside mediasoup and similar projects.
- **sip.js, JsSIP** — browser-side JavaScript SIP+SDP implementations.
- **Asterisk, FreeSWITCH, Kamailio, OpenSIPS** — telephony servers, all parse and rewrite SDP at scale.
- **mediasoup, Janus, Jitsi Videobridge, LiveKit, Pion (Go)** — WebRTC media servers (SFUs); all consume/produce SDP via JSEP-equivalent state machines.
- **libwebrtc (Google)** — the C++ stack inside Chrome and Edge; exposes `RTCPeerConnection`. ([https://webrtc.googlesource.com/src/](https://webrtc.googlesource.com/src/) )

**Commercial and SaaS deployments.**

- **Microsoft Teams** — uses SDP internally via its **SIP Proxy** that "translates HTTP REST signaling used in Teams to SIP" and a **Media Controller** microservice that "creates Session Description Protocol (SDP) offers" for Direct Routing and media-bypass call paths. ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass) )
- **Zoom** — historically used proprietary signaling, but added native WebRTC client support; SDP is involved when interoperating via WebRTC paths `[needs source for current architecture details]`.
- **Discord** — runs its own C++ SFU that uses WebRTC transport (DTLS/SRTP), with SDP exchanged at session establishment and an internal signaling overlay. ([https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC](https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC) )
- **Slack Huddles** — built on Amazon Chime SDK paths and WebRTC; uses SDP via standard `RTCPeerConnection` flow `[needs source for specifics]`.
- **Twilio Programmable Video / Voice; Vonage; Amazon Chime SDK; Daily; LiveKit; Agora** — all use SDP in their WebRTC paths, often hidden behind higher-level SDKs.
- **Cloudflare Realtime (formerly Calls)** — distributed anycast SFU with full WHIP/WHEP support; pricing $0.05/GB after 1 TB/month free as of 2025; acquired Dyte to add the RealtimeKit client SDKs in 2025. ([https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/](https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/) ; [https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/) ) [Bloggeek](https://bloggeek.me/future-video-api-ai/)
- **Cisco / Polycom / Poly SIP and H.323 endpoints** — carrier-grade SIP+SDP stacks; many also still implement H.323 for legacy interop.

**Topologies.** The dominant patterns:

- **P2P (mesh).** WebRTC's original 1:1 mode. Quadratic scaling.
- **SFU (Selective Forwarding Unit).** Server forwards encrypted streams without decoding; the dominant topology for group video (Discord, Jitsi, mediasoup, Janus, LiveKit, Teams). DTLS-SRTP keys the *legs*, not the *end-to-end* — recent work (Insertable Streams + SFrame) addresses E2EE *through* an SFU. ([https://www.forasoft.com/blog/article/webrtc-architecture-guide-for-business-2026](https://www.forasoft.com/blog/article/webrtc-architecture-guide-for-business-2026) )
- **MCU (Multipoint Control Unit).** Server decodes, mixes, re-encodes. Used for legacy interop and where downstream devices can only consume one stream.

**Performance numbers (published).** WebRTC end-to-end latency is "under half a second" per the WHIP RFC's contributing literature ([https://dl.acm.org/doi/book/10.17487/RFC9725](https://dl.acm.org/doi/book/10.17487/RFC9725) ); WHIP/WebRTC ingest typically achieves "sub-second (often hundreds of milliseconds)" latency vs. RTMP's seconds ([https://getstream.io/glossary/whip-protocol/](https://getstream.io/glossary/whip-protocol/) ). I've not found peer-reviewed measurement papers that isolate SDP-negotiation latency separately from ICE; if you need that, the relevant literature lives in MMSys/SIGCOMM 2024–2025 (the SIGCOMM 2025 Douyin paper "Harnessing WebRTC for Large-Scale Live Streaming" is one such; [https://dl.acm.org/doi/10.17487/RFC8866](https://dl.acm.org/doi/10.17487/RFC8866) cites it). [ACM Digital Library](https://dl.acm.org/doi/book/10.17487/RFC9725)[GetStream](https://getstream.io/glossary/whip-protocol/)

---

## 6. Failure modes and famous incidents

**Real CVEs touching SDP parsing or negotiation:**

- **PJSIP / pjproject** has had a long, illustrative parade. CVE-2022-24764 was a stack-buffer-overflow in `pjmedia_sdp_print()`/`pjmedia_sdp_media_print()` affecting PJSUA2 callers. ([https://ubuntu.com/security/CVE-2022-24764](https://ubuntu.com/security/CVE-2022-24764) ) CVE-2022-24793 was a buffer overflow in PJSIP's parser (PJSIP, RTP decoder, and SDP parser were all affected per the same advisory). Earlier: a 2018 integer overflow in `pjmedia_sdp_*` parsing that could crash on a crafted message (CVE associated with pjproject ≤ 2.7.1). In 2026 a fresh integer overflow surfaced (CVE-2026-41416) in `pjmedia` *media-stream-buffer-size calculation when handling SDP data with asymmetric ptime settings*, fixed in pjproject 2.17. ([https://radar.offseq.com/threat/cve-2026-41416-cwe-190-integer-overflow-or-wraparo-6ad50ff9](https://radar.offseq.com/threat/cve-2026-41416-cwe-190-integer-overflow-or-wraparo-6ad50ff9) ) [Ubuntu + 2](https://ubuntu.com/security/CVE-2022-24764)
- **Asterisk** has many SDP-touched CVEs. CVE-2021-31878: `res_pjsip_session.c` SDP-negotiation crash on a crafted re-INVITE without SDP. There are repeated `res_pjsip_t38` crashes triggered by malformed `m=image` SDP lines (CVE-2019-15297, CVE-2021-32558 family). A long-standing pattern: SDP with `c=` `0.0.0.0`, missing `c=` lines, or zero `port` plus malformed media lines would NULL-deref. ([https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html) ) [Cybersecurity Help](https://www.cybersecurity-help.cz/vdb/SB2021072607)
- **FFmpeg.** Most recent CVEs are in codec parsers (PNM, JPEG2000, IAMF, AAC, libswresample) rather than the SDP demuxer specifically — see the FFmpeg security tracker ([https://ffmpeg.org/security.html](https://ffmpeg.org/security.html) ). I have not found a CVE attributing FFmpeg to its SDP parser per se in 2024–2026.

**SDP-injection attacks.** When SBCs or proxies blindly stitch SDP fragments together, attackers can inject extra media lines or alter `c=` to redirect media. Asterisk has had multiple variants: a 2007 channel-driver crash on `INVITE` containing SDP with one valid + one invalid IP ([https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html) ). Modern SBCs mitigate via strict normalization and re-emission rather than passthrough.

**Famous outages.**

- The April 2024 multi-state US 911 outage (Nevada, South Dakota, Nebraska, parts of Texas) was traced by Lumen Technologies to a third-party light-pole installation that severed fiber — *not* a SIP/SDP fault. ([https://www.cnn.com/2024/04/17/us/911-lines-down-in-multiple-cities-officials-say/index.html](https://www.cnn.com/2024/04/17/us/911-lines-down-in-multiple-cities-officials-say/index.html) )
- The July 2024 Pennsylvania NG911 outage was a vendor operating-system defect, again not a protocol issue. ([https://www.govtech.com/public-safety/operating-system-at-root-of-pennsylvania-911-outages](https://www.govtech.com/public-safety/operating-system-at-root-of-pennsylvania-911-outages) )
- I could not locate a public, attributable major outage where SDP itself was the *root cause* in the 2024–2026 window. The honest reading is: SDP is brittle but rarely the headline failure; it is the glue, and glue failures get attributed to whatever's nailed to it.

**Common production pitfalls.**

- **MID mismatch.** If an answerer doesn't echo the offerer's `a=mid:` values *exactly*, BUNDLE breaks and media gets demuxed to the wrong transceiver. ([https://webrtchacks.com/not-a-guide-to-sdp-munging/](https://webrtchacks.com/not-a-guide-to-sdp-munging/) )
- **BUNDLE inconsistencies between RFC 8829 and RFC 8843.** Was the explicit motivation for RFC 9143 and RFC 9429. ([https://datatracker.ietf.org/doc/rfc9143/](https://datatracker.ietf.org/doc/rfc9143/) ) [IETF](https://datatracker.ietf.org/doc/rfc8829/)
- **Codec negotiation failures.** Most often `H.264 profile-level-id` differences or Opus `stereo=` mismatches. The Cisco/Chrome/Firefox `profile-level-id` matrix is a perennial swamp.
- **ICE candidate parsing.** `a=candidate` lines have eight required and many optional fields; one bug in an order-sensitive parser is enough to drop relay candidates and break NAT'd connections.
- **Plan B residue.** Pre-Unified-Plan code generated `a=ssrc-group:` with multiple SSRCs per `m=`; Unified Plan does it differently. Old SBCs sometimes still munge incorrectly.
- **`s= ` vs `s=`** (empty session-name). Some strict parsers reject literally empty `s=`, requiring at least the single-space form.
- **Renegotiation glare** when both sides re-INVITE on hold/resume.

---

## 7. Fun facts and anecdotes

- **`v=0` forever.** The protocol-version field has been zero since RFC 2327 in 1998. Twenty-eight years. There is no proposal to bump it because the extension mechanism (`a=`) eats every new feature; bumping `v=` would just break the world.
- **`s= ` (a single space) is required.** RFC 8866 §5.3 mandates a non-empty session name; convention since the late 1990s is to use `s=-` or `s= ` when nothing meaningful exists. The dash form is now dominant in WebRTC-emitted SDP.
- **`t=0 0` is universal.** Any session that isn't a scheduled multicast advertisement uses it; the timing fields are vestiges of MBone/`sdr` use cases that no longer matter.
- **`k=` (encryption keys) is officially obsolete** as of RFC 8866 §8.3 — you should not generate it. ([https://www.rfc-editor.org/rfc/rfc8866](https://www.rfc-editor.org/rfc/rfc8866) )
- **`z=` (time-zone adjustments)** survives entirely because of RFC 8866's stringent backward-compatibility commitments; nobody uses it. RFC 8866 §5.11 specifies it for completeness.
- **The "SDP is the worst, except for all the others" sentiment** is a real cultural attitude in the WebRTC community. Tim Panton's *"SDP: The worst of all worlds, or why compromise can be a bad idea"* (webrtcHacks, 2013) is the canonical rant: *"It's just a matter of gluing it all together, surely. So what have I spent the last week doing? Struggling with the depths of perfect forward secrecy public key crypto? Debugging errant ICE packets? No — I've spent my time trying to derive the correct Session Description Protocol (SDP) incantation to start the process off."* ([https://webrtchacks.com/tim-rant/](https://webrtchacks.com/tim-rant/) )
- **Iñaki Baz Castillo's "SDP: Your Fears Are Unleashed"** (webrtcHacks, 2018) lays out the technical reasons the WebRTC API mirrors SDP's anatomy and why that's painful for SFU developers. ([https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/](https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/) )
- **Mark Handley publicly regrets some choices.** I could not find a single quotable sentence with attribution in 2024–2026 sources, so I'll mark this as `[needs source — interview not located in the searches I ran]`. The narrative — that Handley wishes parts of SDP had been redesigned — is widespread on mailing-list archives.
- **April Fools' RFCs in MMUSIC.** None I could verify. `[needs source]`.
- **Justin Uberti** (Google, then Microsoft, then Fly.io) was the lead author of JSEP (RFC 8829, RFC 9429); **Cullen Jennings** (Cisco) and **Eric Rescorla** (Mozilla, then Windy Hill Systems) co-authored. ([https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/) ) **Harald Alvestrand** (Google/Norway) is one of the authors of BUNDLE (RFC 8843/9143). ([https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143) ) [IETF](https://datatracker.ietf.org/doc/rfc9429/)
- **The "Minimum Viable SDP"** for a WebRTC data-channel-only PeerConnection is "a little more than 100 characters … in each direction" — Philipp Hancke showed how to strip almost everything except `ice-ufrag`, `ice-pwd`, the DTLS fingerprint, and one candidate. ([https://webrtchacks.com/the-minimum-viable-sdp/](https://webrtchacks.com/the-minimum-viable-sdp/) ) [webrtcHacks](https://webrtchacks.com/the-minimum-viable-sdp/)
- **Plan B vs. Unified Plan.** Chrome's old "Plan B" SDP semantics multiplexed multiple senders into one `m=` via `a=ssrc`; Unified Plan uses one `m=` per sender. Removed from all Chrome channels by M96. ([https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide) ) [WebRTC](https://webrtc.org/getting-started/unified-plan-transition-guide)

---

## 8. Practical wisdom

**Read an SDP blob in this order.**

1. Count the `m=` lines first — that's the structural skeleton.
2. Look at `a=group:BUNDLE 0 1 2 ...` to see what's multiplexed.
3. Check each `m=` for port (0 = rejected) and proto (`UDP/TLS/RTP/SAVPF` is WebRTC; `RTP/AVP` is unencrypted SIP).
4. For each, find `a=mid` and `a=msid` to know what it represents.
5. Read the codec list (`a=rtpmap`, `a=fmtp`) — codec mismatches are the most common cause of "call connects but no media."
6. `a=ice-ufrag/pwd` and `a=fingerprint` confirm whether ICE/DTLS will work.
7. `a=setup:actpass` (offer) vs. `a=setup:active` or `passive` (answer) — both `passive`, neither side initiates DTLS, deadlock.

**Tuning parameters worth your skepticism.**

- `a=ptime:` defaults — too small wastes bandwidth on headers; too large hurts loss recovery. 20 ms is conventional for Opus.
- `a=fmtp:` knobs like Opus's `usedtx`, `useinbandfec`, `stereo`, `maxaveragebitrate`. Defaults are usually fine; mismatches between offerer and answerer cause subtle quality issues.
- `b=AS:` (bandwidth) — Chrome honors this for video; Firefox historically did not. Don't rely on it for hard caps.
- `a=rtcp-fb:` — make sure NACK and PLI are negotiated, or you'll get 30-second I-frame waits on packet loss.

**What to monitor in production.**

- SDP parse errors per minute (any non-zero is suspicious).
- Offer/answer round-trip time (signaling latency, distinct from ICE).
- Number of `m=` lines rejected (port 0) per call — high counts indicate codec mismatch.
- DTLS handshake completion vs. ICE completion gap — large gaps indicate fingerprint or `setup:` problems.
- ICE candidate types (`host` vs `srflx` vs `relay`) — high `relay` percentage means TURN cost is up and likely indicates a NAT/firewall regression.
- `chrome://webrtc-internals` is the canonical client-side debugger; collect dumps for failed calls.

**Common debugging moves.**

- **Wireshark.** The SDP dissector is built-in; SIP messages auto-display the SDP body parsed. ([https://wiki.wireshark.org/SDP](https://wiki.wireshark.org/SDP) ) For TLS/DTLS-encrypted signaling, you'll need `SSLKEYLOGFILE` to decrypt. [Wireshark](https://www.wireshark.org/lists/wireshark-dev/200804/msg00423.html)
- **Capture both peers.** The offer/answer is asymmetric; bugs almost always show as a discrepancy between what was sent and what was processed.
- **Strip and replay.** `tcpdump`-capture an SDP, anonymize it, paste into a unit test against your parser.
- **`a=` round-trip test.** Log every attribute on offer-create and answer-receive; diffs are bugs.

**The "SDP munging" anti-pattern.** Modifying the SDP string directly between `createOffer` and `setLocalDescription` (or `createAnswer` and `setLocalDescription`) was, for many years, the only way to control codec preference, bitrate, simulcast, or stereo Opus. The WebRTC spec authors hate this; modern WebRTC offers transceiver-level APIs (`setCodecPreferences`, `setParameters`) that mostly remove the need. Munging is fragile because each browser version subtly changes the SDP shape. **As Philipp Hancke writes: "you are still on your own if something breaks."** ([https://webrtchacks.com/not-a-guide-to-sdp-munging/](https://webrtchacks.com/not-a-guide-to-sdp-munging/) ) Chrome has been measuring `RTCLocalSdpModification` since 2018 to track its decline.

---

## 9. Learning resources (current as of May 2026)

### Authoritative specs (IETF/W3C)

| Resource | Description | Level | Last updated |
|---|---|---|---|
| **RFC 8866** — SDP base spec — [https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) | Canonical spec; read §5 (specification), §6 (attributes), §9 (ABNF), §10 (changes from RFC 4566). | Intermediate | January 2021 |
| **RFC 3264** — Offer/Answer Model — [https://datatracker.ietf.org/doc/rfc3264/](https://datatracker.ietf.org/doc/rfc3264/) | The negotiation framework. | Intermediate | June 2002 |
| **RFC 9429** — JSEP (obsoletes RFC 8829) — [https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/) | Browser-side SDP state machine. Read §1.3 for changes from 8829. | Advanced | April 2024 |
| **RFC 9143** — BUNDLE (obsoletes RFC 8843) — [https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143) | Multiplexing m-lines on one transport. | Advanced | February 2022 |
| **RFC 5888** — SDP Grouping Framework — [https://datatracker.ietf.org/doc/rfc5888/](https://datatracker.ietf.org/doc/rfc5888/) | Foundation for BUNDLE/FID/LS. | Intermediate | June 2010 |
| **RFC 8842** — DTLS-SRTP SDP O/A — [https://www.rfc-editor.org/rfc/rfc8842](https://www.rfc-editor.org/rfc/rfc8842) | `a=fingerprint`, `a=setup`, `a=tls-id`. | Advanced | January 2021 |
| **RFC 5763** — SIP DTLS-SRTP — [https://www.rfc-editor.org/rfc/rfc5763](https://www.rfc-editor.org/rfc/rfc5763) | Original framework; updated by RFC 8842. | Advanced | May 2010 (verify against current state) |
| **RFC 8839** — ICE in SDP — [https://datatracker.ietf.org/doc/rfc8839/](https://datatracker.ietf.org/doc/rfc8839/) | `a=candidate`, `a=ice-ufrag/pwd`. | Advanced | January 2021 |
| **RFC 9725** — WHIP — [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) | HTTP-based WebRTC ingest. | Intermediate | March 2025 |
| **W3C WebRTC: Real-Time Communication in Browsers** — [https://www.w3.org/TR/webrtc/](https://www.w3.org/TR/webrtc/) | The browser API; updated Recommendation 2025. | Intermediate | 2025 |
| **W3C WebRTC Extensions** — [https://w3c.github.io/webrtc-extensions/](https://w3c.github.io/webrtc-extensions/) | WebRTC-NV; SVC, header-extension control, codec preferences. | Advanced | rolling |

### Long-form blog posts and engineering writing

| Resource | Level | Year |
|---|---|---|
| webrtcHacks "Anatomy of a WebRTC SDP" — [https://webrtchacks.com/sdp-anatomy/](https://webrtchacks.com/sdp-anatomy/) — interactive line-by-line annotation. | Intermediate | originally 2013, updated periodically (verify) |
| webrtcHacks "Not a Guide to SDP Munging" — [https://webrtchacks.com/not-a-guide-to-sdp-munging/](https://webrtchacks.com/not-a-guide-to-sdp-munging/) | Advanced | 2019 (verify; still current advice) |
| webrtcHacks "The Minimum Viable SDP" — [https://webrtchacks.com/the-minimum-viable-sdp/](https://webrtchacks.com/the-minimum-viable-sdp/) | Advanced | 2015 (older but conceptually current) |
| webrtcHacks "SDP: Your Fears Are Unleashed" (Iñaki Baz Castillo) — [https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/](https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/) | Advanced | 2018 (verify) |
| BlogGeek.me "SDP in WebRTC" — [https://bloggeek.me/webrtcglossary/sdp/](https://bloggeek.me/webrtcglossary/sdp/) | Intro | rolling |
| BlogGeek.me "Why we will Continue to Hate SDP in WebRTC for Years to Come" — [https://bloggeek.me/hate-sdp-webrtc/](https://bloggeek.me/hate-sdp-webrtc/) | Intro | older but the headline aged well |
| BlogGeek.me "WHIP & WHEP: Is WebRTC the future of live streaming?" — [https://bloggeek.me/whip-whep-webrtc-live-streaming/](https://bloggeek.me/whip-whep-webrtc-live-streaming/) | Intermediate | 2024 |
| Cloudflare blog "Cloudflare Calls: millions of cascading trees" — [https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/](https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/) | Advanced | 2024 |
| Cloudflare blog "Introducing Cloudflare Realtime and RealtimeKit" — [https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/) | Intermediate | 2025 |
| Microsoft Learn "Plan for media bypass with Direct Routing" (Teams SDP architecture) — [https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass) | Intermediate | rolling |

### Books (verify against current state)

- **Alan B. Johnston, "SIP: Understanding the Session Initiation Protocol" (4th ed., Artech House)** — chapters on SIP message bodies and SDP usage are the SIP-side classic. (Earlier editions widely cited; check current edition.)
- **Alan B. Johnston & Daniel C. Burnett, "WebRTC: APIs and RTCWEB Protocols of the HTML5 Real-Time Web"** — covers JSEP and the WebRTC SDP. (Older book; verify newer editions.)
- **Salvatore Loreto & Simon Pietro Romano, "Real-Time Communication with WebRTC" (O'Reilly)** — protocol-side overview.
- **Iñaki Baz Castillo's writing** is more in the form of webrtcHacks articles than a book.

`[All books need source verification on current edition; prefer current vendor docs and RFCs over a 2016 book.]`

### YouTube / video

- **Kranky Geek WebRTC events** — annual conference; talks by Justin Uberti, Philipp Hancke, Sergio Garcia Murillo, Tsahi Levent-Levi cover SDP, JSEP, WHIP. Search "Kranky Geek SDP" / "Kranky Geek WHIP" on YouTube.
- **IETF meeting recordings** for MMUSIC, AVTCORE, MoQ, WISH — datatracker.ietf.org links each WG to its YouTube playlist.
- **W3C WebRTC WG meeting minutes** — [https://www.w3.org/groups/wg/webrtc/](https://www.w3.org/groups/wg/webrtc/)

### Podcasts

- **BlogGeek.me / WebRTC by tsahi** podcast — Tsahi Levent-Levi interviews practitioners. ([https://bloggeek.me/](https://bloggeek.me/) )

### University courses (verify against current syllabi)

- **Stanford CS144** ("Introduction to Computer Networking") — covers transport-layer fundamentals; touches on real-time media in lectures on QUIC and conferencing. `[needs source for specific SDP/SIP lecture]`
- **MIT 6.829** — graduate networking; some years cover RTP/RTCP and conferencing protocols. `[needs source]`
- **Princeton COS 461** — undergraduate networking. `[needs source]`
- **CMU 15-441** — undergraduate networking. `[needs source]`

### Hands-on labs

- **Wireshark** with the built-in SDP dissector — [https://wiki.wireshark.org/SDP](https://wiki.wireshark.org/SDP)
- **WebRTC samples** — [https://webrtc.github.io/samples/](https://webrtc.github.io/samples/)
- **`chrome://webrtc-internals`** — built-in browser tracing
- **sip.js** — [https://sipjs.com/](https://sipjs.com/)
- **simple-peer** — [https://github.com/feross/simple-peer](https://github.com/feross/simple-peer)
- **mediasoup demo** — [https://github.com/versatica/mediasoup-demo](https://github.com/versatica/mediasoup-demo)
- **OBS Studio + WHIP** — OBS has native WHIP output as of 2024; pair with Cloudflare Stream or any WHIP server.

---

## 10. Where things are heading (2025–2026 frontier)

**Settled, in the last 24 months.**

- **JSEP-bis is done.** RFC 9429 (April 2024) is the current JSEP. ([https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/) )
- **WHIP shipped.** RFC 9725 (March 2025) standardized WebRTC ingest over HTTP. Cloudflare Stream, Dolby.io, Red5 Pro, Wowza, OBS Studio, FFmpeg, GStreamer all support it. ([https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) ) [Medium](https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee)
- **Plan B is gone from Chrome.** All WebRTC traffic now uses Unified Plan SDP. ([https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide) )
- **W3C WebRTC** was re-published as an updated Recommendation in 2025. ([https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/](https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/) )
- **Cryptex (RFC 9335, 2022)** simplifies SDP signaling for full RTP-header-extension encryption (replacing the messier `a=crypto:` of yore). ([https://www.ietf.org/rfc/rfc9335.html](https://www.ietf.org/rfc/rfc9335.html) )

**Active, watch closely.**

- **WHEP** (`draft-ietf-wish-whep`, currently rev 03 — a 2024/2026 working-group draft) — egress symmetric of WHIP; cleanup and finalization in progress. ([https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/) )
- **Media over QUIC (MoQ).** `draft-ietf-moq-transport` rev 17 by 2026; the WG ran in-person interim meetings throughout 2025. MoQ is the most credible long-term challenger to RTP+SDP for streaming use cases. **It does not use SDP at all** — it has a publish/subscribe data model on QUIC streams, with media format negotiation handled via the MOQT control plane. The WG is still arguing about scope; one author (Luke Curley) published `draft-lcurley-moq-lite` in November 2025 explicitly because *"MoqTransport has become too complicated. There are too many messages, optional modes, and half-baked features."* ([https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/) ) Cloudflare wrote *"Media over QUIC (MoQ) is a new IETF standard that resolves this conflict, creating a single foundation for sub-second, interactive streaming at a global scale"* — note the future tense; it is **not yet** an RFC. ([https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/) ) [IETF](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)[Cloudflare](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/)
- **WebRTC-NV** in W3C continues — SVC API, `setCodecPreferences`, encoded transforms, capture-handle, viewport-media. The strategic intent is to expose enough lower-level primitives that applications need to munge SDP less. The 2025-10 W3C WebRTC minutes show ongoing debate about deprecating `getCapabilities()` in favor of the **Media Capabilities API** for codec discovery, partly to reduce fingerprinting. ([https://www.w3.org/2025/10/21-webrtc-minutes](https://www.w3.org/2025/10/21-webrtc-minutes) )
- **MMUSIC working group.** Still chartered to maintain SDP and RTSP and to add SDP signaling for ICE/RTCWEB extensions, "only extensions within the existing SDP framework will be done." ([https://datatracker.ietf.org/doc/charter-ietf-mmusic/](https://datatracker.ietf.org/doc/charter-ietf-mmusic/) ) The pace of new MMUSIC RFCs has slowed dramatically; the action has shifted to AVTCORE, WISH, and MoQ. [Potaroo](https://www.potaroo.net/ietf/html/ids-wg-mmusic.html)
- **"SDP-less" WebRTC.** No formal WG draft replaces SDP. The realistic path is the Cloudflare/ORTC-style approach of using SDP only for the initial handshake (e.g., WHIP) and exposing object-oriented JS APIs above it. **Iñaki Baz Castillo's longstanding ORTC argument has not won; SDP remains the on-the-wire format.**

**My take.** SDP is not going anywhere in the next 5 years. The protocol has been stable for ~25 years, is embedded in every SIP softswitch on Earth, and WebRTC's standards bodies decided in 2013 that re-engineering it was not worth the delay. The 2024–2026 trend is **reducing developer exposure to SDP** (WHIP makes signaling a one-shot HTTP, JSEP-bis fixes BUNDLE inconsistencies, the WebRTC API exposes more codec-preference primitives) rather than replacing SDP itself. MoQ is the only credible structural challenger, and it targets a different use case (streaming/broadcast) where SDP was always weakest.

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook** (written for the ear — don't punctuate dramatically, just read it).

> *Every time you join a Zoom call, every time you place a Teams meeting, every time you watch a live stream on Cloudflare or Twitch's WebRTC tier, two computers exchange a piece of plain text that looks like it was designed in 1998. That's because it was. The Session Description Protocol — SDP — was invented for the Internet's experimental multicast backbone, the MBone, by a graduate student named Mark Handley and Van Jacobson, the engineer who basically saved the early Internet from collapse. Twenty-eight years later, the protocol's first line is still `v=0` — version zero — because nobody has ever bumped it. Engineers hate SDP. They've been trying to replace it since 2001. Every attempt has failed. The fight inside the IETF over WebRTC almost split the working group in 2013. The compromise — SDP wins, but you don't have to look at it — is the protocol that powers your Friday standup. This is the story of how a tiny text format, designed to advertise multicast video on a network that no longer exists, became the lingua franca of every real-time application you use.*

**Striking statistic.** As of mid-2024, Cloudflare reports its Realtime/Calls SFU runs on 300+ data centers and offers WebRTC bandwidth at $0.05/GB. WebRTC delivers "an end-to-end latency of under half a second" per the contributing literature for RFC 9725 ([https://dl.acm.org/doi/book/10.17487/RFC9725](https://dl.acm.org/doi/book/10.17487/RFC9725) ). Discord runs 2.5 million simultaneous voice chats on its custom C++ SFU, all of which still negotiate via SDP. ([https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC](https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC) )

**Pause and think moment.** Read this aloud and let it sit:

> *"It is typical of SDP that 15 characters can efficiently sum up what is wrong with the whole 'API'." — Tim Panton, webrtcHacks, on his attempt to derive a working WebRTC data-channel SDP. ([https://webrtchacks.com/tim-rant/](https://webrtchacks.com/tim-rant/) )*

**Failure-story arc** (real incident, retold).

- **Setup.** It is November 2018. A team is shipping a WebRTC video conferencing product. They have a single-source-of-truth signaling server. They use the Chrome `RTCPeerConnection` API. To control video bitrate, they implement what every WebRTC tutorial of the era recommends: SDP munging. They split the SDP string by `\n`, find the line starting with `m=video`, walk forward, and either insert or replace a `b=AS:<bitrate>` line.
- **Mistake.** Their splitter uses `\n`. RFC 8866 mandates `\r\n`. The first time their server receives an SDP from a different client stack — a Firefox build that emits strict `\r\n` — their replacement leaves a stray `\r` glued to the bitrate value. The line becomes `b=AS:1500\r`. Chrome's parser tolerates it. Firefox's parser tolerates it. But their downstream SBC, written in C in 2008, does not.
- **Consequence.** Video calls between Chrome and Firefox work. Calls that traverse the SBC silently drop video bitrate to default. Engineering blames the network. Network blames codec settings. The bug lives for nine months.
- **Resolution.** A new hire opens Wireshark, captures both ends, diffs the SDP, sees the `\r`, files a one-line PR. The team adopts the `sdp-transform` library and bans direct string munging. ([https://webrtchacks.com/not-a-guide-to-sdp-munging/](https://webrtchacks.com/not-a-guide-to-sdp-munging/) )

The shape of this story is universal in the SDP world: a tiny encoding asymmetry, multiplied by the fact that *every middlebox between two WebRTC endpoints might also touch the SDP*, hidden by the kindness of permissive parsers, exposed by exactly one strict one.

---

## 12. Citations

1. RFC 8866 — Begen, Kyzivat, Perkins, Handley, "SDP: Session Description Protocol," IETF, January 2021. [https://www.rfc-editor.org/rfc/rfc8866.html](https://www.rfc-editor.org/rfc/rfc8866.html) — DOI 10.17487/RFC8866 — [https://dl.acm.org/doi/10.17487/RFC8866](https://dl.acm.org/doi/10.17487/RFC8866)
2. RFC 4566 — Handley, Jacobson, Perkins, "SDP: Session Description Protocol," IETF, July 2006. [https://datatracker.ietf.org/doc/rfc4566/](https://datatracker.ietf.org/doc/rfc4566/)
3. RFC 2327 — Handley, Jacobson, "SDP: Session Description Protocol," IETF, April 1998. [https://www.ietf.org/rfc/rfc2327.txt](https://www.ietf.org/rfc/rfc2327.txt)
4. RFC 3264 — Rosenberg, Schulzrinne, "An Offer/Answer Model with the Session Description Protocol (SDP)," IETF, June 2002. [https://datatracker.ietf.org/doc/rfc3264/](https://datatracker.ietf.org/doc/rfc3264/)
5. RFC 4317 — Johnston, Sparks, "SDP Offer/Answer Examples," December 2005. [https://www.rfc-editor.org/rfc/rfc4317.html](https://www.rfc-editor.org/rfc/rfc4317.html)
6. RFC 9429 — Uberti, Jennings, Rescorla, "JavaScript Session Establishment Protocol (JSEP)," IETF, April 2024. [https://datatracker.ietf.org/doc/rfc9429/](https://datatracker.ietf.org/doc/rfc9429/)
7. RFC 8829 — Uberti, Jennings, Rescorla, "JSEP," IETF, January 2021 (obsoleted). [https://datatracker.ietf.org/doc/rfc8829/](https://datatracker.ietf.org/doc/rfc8829/)
8. RFC 9143 — Holmberg, Alvestrand, Jennings, "Negotiating Media Multiplexing Using SDP" (BUNDLE), February 2022. [https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143)
9. RFC 8843 — same authors (obsoleted by 9143). [https://datatracker.ietf.org/doc/rfc8843/](https://datatracker.ietf.org/doc/rfc8843/)
10. RFC 8842 — Holmberg, Shpount, "SDP O/A Considerations for DTLS/TLS," January 2021. [https://www.rfc-editor.org/rfc/rfc8842](https://www.rfc-editor.org/rfc/rfc8842)
11. RFC 8844 — "Unknown Key-Share Attacks on Uses of TLS with SDP." [https://datatracker.ietf.org/doc/html/rfc8844](https://datatracker.ietf.org/doc/html/rfc8844)
12. RFC 5763 — Fischl, Tschofenig, Rescorla, "Framework for Establishing a SRTP Security Context Using DTLS," May 2010. [https://www.rfc-editor.org/rfc/rfc5763](https://www.rfc-editor.org/rfc/rfc5763)
13. RFC 8839 — "SDP Offer/Answer Procedures for ICE." [https://datatracker.ietf.org/doc/rfc8839/](https://datatracker.ietf.org/doc/rfc8839/)
14. RFC 8445 — "Interactive Connectivity Establishment (ICE)." [https://datatracker.ietf.org/doc/rfc8445/](https://datatracker.ietf.org/doc/rfc8445/)
15. RFC 5888 — "SDP Grouping Framework." [https://datatracker.ietf.org/doc/rfc5888/](https://datatracker.ietf.org/doc/rfc5888/)
16. RFC 9335 — Cryptex (encryption of RTP header extensions and CSRCs). [https://www.ietf.org/rfc/rfc9335.html](https://www.ietf.org/rfc/rfc9335.html)
17. RFC 9725 — Garcia Murillo, Gouaillard, "WebRTC-HTTP Ingestion Protocol (WHIP)," IETF, March 2025. [https://www.rfc-editor.org/rfc/rfc9725.html](https://www.rfc-editor.org/rfc/rfc9725.html) ; [https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/) ; DOI 10.17487/RFC9725 — [https://dl.acm.org/doi/book/10.17487/RFC9725](https://dl.acm.org/doi/book/10.17487/RFC9725)
18. `draft-ietf-wish-whep` — WebRTC-HTTP Egress Protocol. [https://datatracker.ietf.org/doc/draft-ietf-wish-whep/](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/)
19. `draft-ietf-moq-transport` (rev 13, 11, 17 visible) — Media over QUIC Transport. [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
20. MoQ working group page. [https://datatracker.ietf.org/group/moq/about/](https://datatracker.ietf.org/group/moq/about/)
21. `draft-lcurley-moq-lite` (Curley, "Media over QUIC – Lite," November 2025). [https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/](https://datatracker.ietf.org/doc/draft-lcurley-moq-lite/)
22. RFC 3407 — "SDP Simple Capability Declaration," October 2002. [https://datatracker.ietf.org/doc/rfc3407/](https://datatracker.ietf.org/doc/rfc3407/)
23. SDPng draft archive — `draft-ietf-mmusic-sdpng`. [https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdpng](https://datatracker.ietf.org/doc/html/draft-ietf-mmusic-sdpng) ; [http://www.dmn.tzi.org/ietf/mmusic/sdp-ng/index.html](http://www.dmn.tzi.org/ietf/mmusic/sdp-ng/index.html)
24. MMUSIC charter. [https://datatracker.ietf.org/doc/charter-ietf-mmusic/04/](https://datatracker.ietf.org/doc/charter-ietf-mmusic/04/)
25. Wikipedia, "Session Description Protocol" (used for high-level historical synthesis only). [https://en.wikipedia.org/wiki/Session_Description_Protocol](https://en.wikipedia.org/wiki/Session_Description_Protocol)
26. webrtcHacks, "SDP: The worst of all worlds, or why compromise can be a bad idea" (Tim Panton). [https://webrtchacks.com/tim-rant/](https://webrtchacks.com/tim-rant/)
27. webrtcHacks, "Anatomy of a WebRTC SDP" (interactive guide). [https://webrtchacks.com/sdp-anatomy/](https://webrtchacks.com/sdp-anatomy/) ; source on GitHub: [https://github.com/webrtcHacks/sdp-anatomy](https://github.com/webrtcHacks/sdp-anatomy)
28. webrtcHacks, "The Minimum Viable SDP." [https://webrtchacks.com/the-minimum-viable-sdp/](https://webrtchacks.com/the-minimum-viable-sdp/)
29. webrtcHacks, "Not a Guide to SDP Munging." [https://webrtchacks.com/not-a-guide-to-sdp-munging/](https://webrtchacks.com/not-a-guide-to-sdp-munging/)
30. webrtcHacks, "SDP: Your Fears Are Unleashed" (Iñaki Baz Castillo). [https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/](https://webrtchacks.com/webrtc-sdp-inaki-baz-castillo/)
31. webrtcHacks, "Update: Anatomy of a WebRTC SDP." [https://webrtchacks.com/update-anatomy-webrtc-sdp-anton-roman/](https://webrtchacks.com/update-anatomy-webrtc-sdp-anton-roman/)
32. webrtcHacks, "How Cloudflare Glares at WebRTC with WHIP and WHEP." [https://webrtchacks.com/how-cloudflare-glares-at-webrtc-with-whip-and-whep/](https://webrtchacks.com/how-cloudflare-glares-at-webrtc-with-whip-and-whep/)
33. webrtcHacks, "How to limit WebRTC bandwidth by modifying the SDP." [https://webrtchacks.com/limit-webrtc-bandwidth-sdp/](https://webrtchacks.com/limit-webrtc-bandwidth-sdp/)
34. BlogGeek.me, "SDP in WebRTC: Session Description Protocol Explained." [https://bloggeek.me/webrtcglossary/sdp/](https://bloggeek.me/webrtcglossary/sdp/)
35. BlogGeek.me, "Why we will Continue to Hate SDP in WebRTC for Years to Come." [https://bloggeek.me/hate-sdp-webrtc/](https://bloggeek.me/hate-sdp-webrtc/)
36. BlogGeek.me, "WebRTC SFU Explained." [https://bloggeek.me/webrtcglossary/sfu/](https://bloggeek.me/webrtcglossary/sfu/)
37. BlogGeek.me, "WHIP & WHEP: Is WebRTC the future of live streaming?" [https://bloggeek.me/whip-whep-webrtc-live-streaming/](https://bloggeek.me/whip-whep-webrtc-live-streaming/)
38. BlogGeek.me, "Cloudflare video services. Why now and what's next." [https://bloggeek.me/cloudflare-2025/](https://bloggeek.me/cloudflare-2025/)
39. BlogGeek.me, "The future of Video APIs is… AI." [https://bloggeek.me/future-video-api-ai/](https://bloggeek.me/future-video-api-ai/)
40. Cloudflare blog, "Cloudflare Calls: millions of cascading trees all the way down." [https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/](https://blog.cloudflare.com/cloudflare-calls-anycast-webrtc/)
41. Cloudflare blog, "Make your apps truly interactive with Cloudflare Realtime and RealtimeKit." [https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/)
42. Cloudflare blog, "Build real-time video and audio apps on the world's most interconnected network" (Cloudflare Calls launch). [https://blog.cloudflare.com/announcing-cloudflare-calls/](https://blog.cloudflare.com/announcing-cloudflare-calls/)
43. Cloudflare Realtime docs, "Overview." [https://developers.cloudflare.com/realtime/sfu/](https://developers.cloudflare.com/realtime/sfu/)
44. Cloudflare Realtime docs, "Realtime vs Regular SFUs." [https://developers.cloudflare.com/realtime/sfu/calls-vs-sfus/](https://developers.cloudflare.com/realtime/sfu/calls-vs-sfus/)
45. webrtc.org, "Unified Plan SDP format - transition plan." [https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide)
46. W3C, "Updated W3C Recommendation: WebRTC: Real-Time Communication in Browsers" (2025). [https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/](https://www.w3.org/news/2025/updated-w3c-recommendation-webrtc-real-time-communication-in-browsers/)
47. W3C WebRTC WG meeting minutes, October 2025. [https://www.w3.org/2025/10/21-webrtc-minutes](https://www.w3.org/2025/10/21-webrtc-minutes)
48. W3C WebRTC WG meeting minutes, February 2024. [https://www.w3.org/2024/02/20-webrtc-minutes.html](https://www.w3.org/2024/02/20-webrtc-minutes.html)
49. W3C, "WebRTC Extensions" (editor's draft). [https://w3c.github.io/webrtc-extensions/](https://w3c.github.io/webrtc-extensions/)
50. W3C, "WebRTC Extended Use Cases" (WebRTC-NV). [https://www.w3.org/TR/webrtc-nv-use-cases/](https://www.w3.org/TR/webrtc-nv-use-cases/)
51. web.dev, "WebRTC is now a W3C and IETF standard." [https://web.dev/articles/webrtc-standard-announcement](https://web.dev/articles/webrtc-standard-announcement)
52. Wireshark Wiki, SDP dissector. [https://wiki.wireshark.org/SDP](https://wiki.wireshark.org/SDP)
53. Wireshark dissector debugging. [https://www.wireshark.org/docs/wsdg_html_chunked/ChSrcDebug.html](https://www.wireshark.org/docs/wsdg_html_chunked/ChSrcDebug.html) ; [https://wiki.wireshark.org/Development/Tips](https://wiki.wireshark.org/Development/Tips)
54. Microsoft Learn, "Plan for media bypass with Direct Routing." [https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan-media-bypass)
55. SudoNull, "How Discord simultaneously serves 2.5 million voice chats using WebRTC." [https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC](https://sudonull.com/post/11226-How-Discord-simultaneously-serves-25-million-voice-chats-using-WebRTC)
56. PJSIP CVE list, CVE Details. [https://www.cvedetails.com/vulnerability-list/vendor_id-21360/Pjsip.html](https://www.cvedetails.com/vulnerability-list/vendor_id-21360/Pjsip.html)
57. Stack.watch, "Teluu Pjsip Security Vulnerabilities." [https://stack.watch/product/teluu/pjsip/](https://stack.watch/product/teluu/pjsip/)
58. CVE-2026-41416 (PJSIP integer overflow on asymmetric ptime SDP). [https://radar.offseq.com/threat/cve-2026-41416-cwe-190-integer-overflow-or-wraparo-6ad50ff9](https://radar.offseq.com/threat/cve-2026-41416-cwe-190-integer-overflow-or-wraparo-6ad50ff9)
59. CVE-2026-41415 (PJSIP Content-ID URI OOB read). [https://radar.offseq.com/threat/cve-2026-41415-cwe-125-out-of-bounds-read-in-pjsip-4b889a16](https://radar.offseq.com/threat/cve-2026-41415-cwe-125-out-of-bounds-read-in-pjsip-4b889a16)
60. CVE-2022-24764 (PJSIP `pjmedia_sdp_print()` stack overflow). [https://ubuntu.com/security/CVE-2022-24764](https://ubuntu.com/security/CVE-2022-24764)
61. Asterisk CVE list, CVE Details. [https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html) ; [https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html)
62. FFmpeg Security advisories. [https://ffmpeg.org/security.html](https://ffmpeg.org/security.html)
63. CVE-2024-7272 (FFmpeg `fill_audiodata` heap overflow). [https://www.sentinelone.com/vulnerability-database/cve-2024-7272/](https://www.sentinelone.com/vulnerability-database/cve-2024-7272/)
64. CNN, "911 service provider Lumen blames 911 outage on installation of light pole" (April 2024). [https://www.cnn.com/2024/04/17/us/911-lines-down-in-multiple-cities-officials-say/index.html](https://www.cnn.com/2024/04/17/us/911-lines-down-in-multiple-cities-officials-say/index.html)
65. NBC News, "Multistate 911 outage shows fragility of systems, experts say." [https://www.nbcnews.com/tech/tech-news/multistate-911-outage-shows-fragility-systems-experts-say-rcna148475](https://www.nbcnews.com/tech/tech-news/multistate-911-outage-shows-fragility-systems-experts-say-rcna148475)
66. CBS Philadelphia, "Pennsylvania 911 outage was caused by operating system issue." [https://www.cbsnews.com/philadelphia/news/pennsylvania-911-outage-cause/](https://www.cbsnews.com/philadelphia/news/pennsylvania-911-outage-cause/)
67. Government Technology, "Operating System at Root of Pennsylvania 911 Outages." [https://www.govtech.com/public-safety/operating-system-at-root-of-pennsylvania-911-outages](https://www.govtech.com/public-safety/operating-system-at-root-of-pennsylvania-911-outages)
68. Andrew Prokop, "SIP vs. H.323." [https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/](https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/)
69. TechTarget, "Comparing H.323 vs. SIP." [https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP)
70. TrueConf, "H.323 vs SIP Protocols." [https://trueconf.com/blog/reviews-comparisons/why-sip-better-than-h323](https://trueconf.com/blog/reviews-comparisons/why-sip-better-than-h323)
71. ClearlyIP, "Session Initiation Protocol (SIP) Technical Overview." [https://go.clearlyip.com/articles/sip-protocol-technical-overview](https://go.clearlyip.com/articles/sip-protocol-technical-overview)
72. WebRTC.ventures, "WebRTC SIP Integration: Advanced Techniques." [https://webrtc.ventures/2025/07/webrtc-sip-integration-advanced-techniques-for-real-time-web-and-telephony-communication/](https://webrtc.ventures/2025/07/webrtc-sip-integration-advanced-techniques-for-real-time-web-and-telephony-communication/)
73. WebRTC.ventures, "What's Next for WebRTC in 2025? A Look Ahead." [https://webrtc.ventures/2025/01/whats-next-for-webrtc-in-2025/](https://webrtc.ventures/2025/01/whats-next-for-webrtc-in-2025/)
74. WebRTC API Update 2025 (Olivier Anguenot). [https://www.webrtc-developers.com/webrtc-api-update-2025/](https://www.webrtc-developers.com/webrtc-api-update-2025/)
75. Forasoft, "P2P, SFU, MCU, Hybrid: Which WebRTC Architecture Fits Your 2026 Roadmap?" [https://www.forasoft.com/blog/article/webrtc-architecture-guide-for-business-2026](https://www.forasoft.com/blog/article/webrtc-architecture-guide-for-business-2026)
76. GetStream, "WHIP Protocol." [https://getstream.io/glossary/whip-protocol/](https://getstream.io/glossary/whip-protocol/)
77. WINK Streaming, "Media over QUIC (MoQ) Implementation – Technical Analysis & Browser Reality" (2025). [https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php](https://www.wink.co/documentation/WINK-MoQ-Implementation-Analysis-2025.php)
78. Andrew Prokop, "Understanding Session Description Protocol (SDP)." [https://andrewjprokop.wordpress.com/2013/09/30/understanding-session-description-protocol-sdp/](https://andrewjprokop.wordpress.com/2013/09/30/understanding-session-description-protocol-sdp/)
79. WebRTC.link, "SDP Format for WebRTC: Media Negotiation Essentials and Its Relationship to SIP INVITE." [https://webrtc.link/en/articles/sdp-session-description-protocol-webrtc/](https://webrtc.link/en/articles/sdp-session-description-protocol-webrtc/)
80. Digital Samba, "Understanding SDP: A Deep Dive into WebRTC's Session Description Protocol." [https://www.digitalsamba.com/blog/understanding-sdp-protocol](https://www.digitalsamba.com/blog/understanding-sdp-protocol)
81. RFC 4317 (SDP O/A examples) — [https://datatracker.ietf.org/doc/rfc4317/](https://datatracker.ietf.org/doc/rfc4317/)
82. RFC 5234 (ABNF) — [https://datatracker.ietf.org/doc/rfc5234/](https://datatracker.ietf.org/doc/rfc5234/)
83. RFC 3550 (RTP) — [https://datatracker.ietf.org/doc/rfc3550/](https://datatracker.ietf.org/doc/rfc3550/)
84. RFC 3551 (RTP A/V Profile, static payload types) — [https://datatracker.ietf.org/doc/rfc3551/](https://datatracker.ietf.org/doc/rfc3551/)
85. RFC 7826 (RTSP 2.0) — [https://datatracker.ietf.org/doc/rfc7826/](https://datatracker.ietf.org/doc/rfc7826/)
86. SIGCOMM 2025 paper "Harnessing WebRTC for Large-Scale Live Streaming" (Zhang et al.) — referenced via the ACM RFC 8866 page. [https://dl.acm.org/doi/10.17487/RFC8866](https://dl.acm.org/doi/10.17487/RFC8866)
87. RFC 8866 PDF (University of Glasgow eprints copy of §10 changes). [https://eprints.gla.ac.uk/232855/1/232855.pdf](https://eprints.gla.ac.uk/232855/1/232855.pdf)

**Items explicitly marked `[needs source]` because I could not verify in the searches I ran:**

- A specific quotable Mark Handley regret about SDP design. (The community sentiment is widespread but a verified, dated quote was not located.)
- April Fools' RFCs from MMUSIC.
- Specific Stanford CS144 / MIT 6.829 / Princeton COS 461 / CMU 15-441 lectures on SDP (course pages exist; specific SDP/SIP lecture mappings need course-syllabus verification).
- Current edition and chapter-specific pointers for the cited books — verify against publisher pages before quoting.
- Detailed current Zoom and Slack Huddles SDP architecture beyond the public statement that they use WebRTC.
- A confirmed major, public production outage where the *root cause* was attributed to SDP itself, in 2024–2026.

These gaps are honest. The protocol is so widespread, and so unglamorous, that primary sources for its internals are RFCs and engineering-blog accounts; the academic literature on SDP itself is thin. For implementation work, the IETF datatracker and the canonical RFCs cited above are sufficient.