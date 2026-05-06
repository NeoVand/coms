---
prompt_source: deep-research-prompts.txt:6290-6468 (PROTOCOL · RTP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/6568bb35-a670-4838-8710-9a5b7a1005f8
research_mode: claude.ai Research
---

# Real-time Transport Protocol (RTP): A Complete Engineering Reference

*Compiled May 5, 2026. Sources prioritized 2024–2026; older sources used only when canonical (e.g., the protocol's own RFCs). All draft-stage work is explicitly labeled.*

---

## Prerequisites and glossary

Before RTP makes sense, the following must be solid. Each entry is a short definition plus a current authoritative pointer.

- **OSI / TCP-IP layers.** RTP is an *application-layer* protocol that behaves like a transport-layer protocol; it is most commonly carried inside UDP datagrams at the transport layer, which sit inside IP packets at the network layer. (RFC 3550 §11; [https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550))
- **Datagram.** A self-contained, unreliable packet of bytes whose delivery, ordering, and integrity are not guaranteed by the network. UDP is the canonical datagram service. (RFC 768; [https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768))
- **UDP (User Datagram Protocol).** Minimal connectionless transport: source port, destination port, length, checksum, payload. The standard substrate for RTP because it never retransmits, which preserves real-time semantics. ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768))
- **TCP.** Reliable, ordered byte stream — the wrong tool for real-time media because retransmission and head-of-line blocking add unbounded latency. ([https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293))
- **Socket.** OS-level endpoint of communication, usually identified by `(IP, port, protocol)`. RTP sessions are typically built on UDP sockets.
- **Port.** 16-bit number multiplexing flows on a host. RTP traditionally uses an even port; its companion RTCP uses port+1 (RFC 3550 §11). Modern WebRTC stacks usually multiplex RTP and RTCP on a single port (`rtcp-mux`, RFC 5761; [https://www.rfc-editor.org/rfc/rfc5761](https://www.rfc-editor.org/rfc/rfc5761)).
- **Header.** Fixed metadata prefix on every packet. RTP's fixed header is exactly 12 bytes (RFC 3550 §5.1).
- **Checksum.** Error-detection code. UDP carries a 16-bit checksum; RTP itself has none and relies on UDP/SRTP integrity.
- **Handshake.** A negotiation of session parameters before data flow. RTP's "handshake" lives in *separate* signaling protocols (SDP offer/answer over SIP, JSEP/WebRTC, RTSP, WHIP). DTLS-SRTP performs a TLS-style handshake to derive media keys (RFC 5764; [https://www.rfc-editor.org/rfc/rfc5764](https://www.rfc-editor.org/rfc/rfc5764)).
- **Stream / RTP stream.** An ordered sequence of RTP packets sharing a single SSRC, sequence-number space, and timestamp clock. (RFC 7656; [https://www.rfc-editor.org/rfc/rfc7656](https://www.rfc-editor.org/rfc/rfc7656))
- **Frame.** A unit of media (one video picture, one audio block). A frame may be split across multiple RTP packets sharing one timestamp; the marker bit (M) typically indicates the last packet of the frame for video.
- **Payload.** The bytes after the RTP header — codec-specific bitstream (H.264 NAL units, Opus packets, PCMU samples, etc.).
- **Codec.** Encoder/decoder pair that compresses raw media. Each codec has an RTP "payload format" RFC defining how its bitstream maps to RTP packets (e.g., RFC 6184 for H.264, RFC 7587 for Opus).
- **Multiplexing.** Carrying multiple logical streams on one transport. RTP supports SSRC-multiplexing within one session and BUNDLE (RFC 9143; [https://www.rfc-editor.org/rfc/rfc9143](https://www.rfc-editor.org/rfc/rfc9143)) collapses multiple media types onto one 5-tuple.
- **Multicast / unicast.** Multicast delivers one packet to many receivers via the network; unicast is one-to-one. RTP was *born* multicast (the MBone era) but today is overwhelmingly unicast through SFUs/MCUs (RFC 7667 RTP Topologies; [https://www.rfc-editor.org/rfc/rfc7667](https://www.rfc-editor.org/rfc/rfc7667)).
- **Jitter.** Statistical variance of inter-arrival time. RTP's RTCP reports include an interarrival jitter estimator (RFC 3550 §6.4.1, eq. for `J`). Receivers run a *jitter buffer* to smooth playout.
- **MTU (Maximum Transmission Unit).** Largest IP packet that traverses a path without fragmentation; usually ~1500 bytes on Ethernet, often ~1200 in the wild after VPN/tunneling overhead. RTP packetizers must fragment codec payloads so the final IP+UDP+RTP+payload stays under MTU.
- **NAT (Network Address Translation).** Edge device rewriting addresses; complicates UDP because peers don't know their public mapping. Solved with STUN/TURN/ICE.
- **STUN, TURN, ICE.** STUN (RFC 8489; [https://www.rfc-editor.org/rfc/rfc8489](https://www.rfc-editor.org/rfc/rfc8489)) lets an endpoint discover its public reflexive address. TURN (RFC 8656; [https://www.rfc-editor.org/rfc/rfc8656](https://www.rfc-editor.org/rfc/rfc8656)) relays media when direct paths fail. ICE (RFC 8445; [https://www.rfc-editor.org/rfc/rfc8445](https://www.rfc-editor.org/rfc/rfc8445)) is the algorithm that gathers candidates and picks the best path.
- **DTLS.** TLS for datagrams (RFC 9147; [https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)). Used in WebRTC to authenticate peers and key SRTP.
- **SRTP.** Secure RTP — confidentiality, authentication, replay protection on RTP packets (RFC 3711; [https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711)).
- **AES (Advanced Encryption Standard).** Block cipher used by SRTP in counter mode (AES-CM) and GCM mode (RFC 7714; [https://www.rfc-editor.org/rfc/rfc7714](https://www.rfc-editor.org/rfc/rfc7714)).
- **HMAC-SHA1 / AEAD.** Message authentication primitives. SRTP's default is HMAC-SHA1-80; AEAD AES-GCM is now standard for WebRTC.
- **NTP timestamp.** 64-bit Network Time Protocol absolute time used in RTCP Sender Reports to align RTP's local clock to wall-clock for lip-sync (RFC 3550 §6.4.1).
- **Sampling clock rate.** RTP timestamps tick at a media-specific rate: 8 kHz for narrowband audio (PCMU/PCMA), 48 kHz for Opus, 90 kHz for video. Mismatch produces playout glitches.
- **CSRC vs. SSRC.** SSRC = synchronization source (the stream's identity); CSRC list = contributing sources, populated by an RTP mixer to identify who is speaking in a mixed stream (RFC 3550 §5.1). [Webex Blog](https://blog.webex.com/engineering/introducing-rtp-the-packet-format/)
- **Profile.** A document defining how the variable RTP fields are interpreted for a class of media; e.g., RTP/AVP (RFC 3551), RTP/AVPF (RFC 4585), RTP/SAVP (RFC 3711), RTP/SAVPF (RFC 5124).
- **Payload type (PT).** 7-bit number selecting the payload format. Static PTs 0–34 are reserved (e.g., 0=PCMU, 8=PCMA); dynamic PTs 96–127 are negotiated via SDP `a=rtpmap`. [Wikipedia](https://en.wikipedia.org/wiki/RTP_payload_formats)

---

## History and story

**1980s — DARPA prehistory.** Stephen Casner at USC/ISI worked on the Network Voice Protocol (NVP) under DARPA funding from the late 1970s; this was the first packet voice on ARPANET and the seed of every subsequent IETF audio/video protocol. Casner's "Stephen L. Casner" entry on the Engineering & Technology History Wiki notes he "contributed to the first specification and implementation of packet voice on the Internet (the Network Voice Protocol). He later led the Audio/Video Transport (AVT) Working Group of the Internet Engineering Task Force (IETF) and co-authored the Real-time Transport Protocol (RTP)" ([https://ethw.org/Stephen_L._Casner](https://ethw.org/Stephen_L._Casner)). [Engineering and Technology History Wiki](https://ethw.org/Stephen_L._Casner)

**1992 — MBone is born.** Van Jacobson (Lawrence Berkeley Laboratory), Steve Deering (Xerox PARC), and Stephen Casner (USC/ISI), acting on a suggestion from Allison Mankin, set up the multicast backbone (MBone) and audio-cast the March 1992 IETF San Diego meeting to ~20 sites — the first significant MBone use ([https://en.wikipedia.org/wiki/Mbone](https://en.wikipedia.org/wiki/Mbone)). LBL describes the trio explicitly: "LBL's Van Jacobson is one of the three principal creators of MBone. The others are Steve Deering, of Xerox Corp.'s Palo Alto Research Center, and Steve Casner of the University of Southern California" ([https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html](https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html)). [HandWiki](https://handwiki.org/wiki/Mbone)

**1992–1995 — vat, vic, wb, sdr.** Jacobson and Steven McCanne wrote `vat` (Visual Audio Tool) and `vic` (Video Conferencing); Mark Handley at UCL wrote `sdr`. Ron Frederick (then at Xerox PARC) wrote `nv` (Network Video), the precursor whose framework became the basis for video conferencing in PARC's Jupiter MOO and ultimately PlaceWare (acquired by Microsoft) ([https://webrtcforthecurious.com/docs/10-history-of-webrtc/](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)). Frederick himself recounts: "Van Jacobson and Steve Casner were two of the four authors on the initial RTP RFCs, along with Henning Schulzrinne and myself. We all had MBONE tools that we were working on … and trying to come up with a common base protocol all these tools could use was what led to RTP" (same source). [Webrtcforthecurious](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)

**1995.** LBL won an R&D 100 Award for the Jacobson/McCanne MBone tool pack ([https://en.wikipedia.org/wiki/Van_Jacobson](https://en.wikipedia.org/wiki/Van_Jacobson)). [HandWiki](https://handwiki.org/wiki/Biography:Van_Jacobson)

**January 1996 — RFC 1889.** Schulzrinne (then at GMD-Fokus Berlin / shortly after at Columbia), Casner, Frederick, Jacobson published *RTP: A Transport Protocol for Real-Time Applications* as RFC 1889 (Proposed Standard) along with sibling RFC 1890 (RTP/AVP profile) ([https://datatracker.ietf.org/doc/html/rfc1889](https://datatracker.ietf.org/doc/html/rfc1889)). Henning Schulzrinne's PhD was from UMass Amherst (1992) under James Kurose; he was on the AT&T Bell Labs technical staff in Murray Hill before Berlin and Columbia ([https://www.engineering.columbia.edu/faculty/henning-schulzrinne](https://www.engineering.columbia.edu/faculty/henning-schulzrinne)). [UCSB + 6](https://sites.cs.ucsb.edu/~almeroth/classes/W98.290I/mbone.html)

**July 2003 — RFC 3550 / RFC 3551.** RFC 3550 obsoleted 1889; RFC 3551 obsoleted 1890. The IETF promoted both to *Internet Standard* status: STD 64 and STD 65. Most of the text was unchanged; the principal substantive changes were tightening the SSRC-collision algorithm, RTCP scheduling/reverse-reconsideration timing, MIB removal, and clarifications around mixers/translators ([https://www.rfc-editor.org/info/rfc3550](https://www.rfc-editor.org/info/rfc3550)).

**2004 — SRTP (RFC 3711)** by Baugher, McGrew (Cisco) and Naslund, Carrara, Norrman (Ericsson Research), specifying AES-CM, HMAC-SHA1 authentication, and replay lists ([https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc3711)

**Mid-2000s onward — the extension layer.** AVPF feedback (RFC 4585, 2006), Codec Control Messages (RFC 5104, 2008), header extensions framework (RFC 5285→8285), DTLS-SRTP keying (RFC 5763/5764, 2010), `rtcp-mux` (RFC 5761), AV/VP-codec payload formats — H.264 (RFC 6184), VP8 (RFC 7741), VP9 (RFC 9628), HEVC (RFC 7798), Opus (RFC 7587). RFC 8834 (January 2021) by Perkins, Westerlund and Ott normatively binds RTP to WebRTC. [Wikipedia + 2](https://en.wikipedia.org/wiki/RTP_payload_formats)

**2020 — IEEE Internet Award.** Casner and Eve M. Schooler are co-recipients "for their distinguished leadership in standards and formative contributions to Internet multimedia protocols" ([https://www.isi.edu/news/40167/2020-ieee-award-behind-the-screens-with-scientists-stephen-casner-and-eve-schooler/](https://www.isi.edu/news/40167/2020-ieee-award-behind-the-screens-with-scientists-stephen-casner-and-eve-schooler/)). Schulzrinne was inducted into the Internet Hall of Fame in 2013 ([https://www.internethalloffame.org/inductee/henning-schulzrinne/](https://www.internethalloffame.org/inductee/henning-schulzrinne/)). [Information Sciences Institute](https://www.isi.edu/news/40167/2020-ieee-award-behind-the-screens-with-scientists-stephen-casner-and-eve-schooler/)[Internet Hall of Fame](https://www.internethalloffame.org/2015/08/14/henning-schulzrinne-insists-bureaucracy-can-breed-innovation/)

**Politics and design alternatives that lost.** RTP beat ITU-T H.323's gatekeeper-centric stack on the open Internet (although H.323 carries its media over RTP, ironically). The DCCP and SCTP transports proposed for media never displaced UDP+RTP. Within IETF the AVT WG became so overloaded it was split (AVTCORE for the core protocol, AVTEXT for extensions, PAYLOAD for codec packetizations) — that split is still visible in working group names today ([https://datatracker.ietf.org/wg/avtcore/about/](https://datatracker.ietf.org/wg/avtcore/about/)).

**What has changed in the last 24 months (2024–2026), explicitly.**

- **RFC 9605 (August 2024) — SFrame.** End-to-end frame-level authenticated encryption that decouples E2EE from RTP/SRTP and works with non-RTP transports, designed to coexist with SFUs ([https://datatracker.ietf.org/doc/rfc9605/](https://datatracker.ietf.org/doc/rfc9605/)). Justin Uberti and Emad Omara whiteboarded the original idea in 2018; Richard Barnes drove it to completion ([https://x.com/juberti/status/1829481538175590905](https://x.com/juberti/status/1829481538175590905)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc9605)[X](https://x.com/juberti/status/1829481538175590905)
- **RFC 9725 (March 2025) — WHIP.** Standardized HTTP-based ingest signaling for WebRTC, updating RFCs 8840 and 8842; replaces a generation of ad-hoc WebSocket signaling for ingest ([https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/)). [IETF](https://datatracker.ietf.org/doc/rfc9725/)
- **RFC 9628 (2024) — VP9 RTP payload format** finally received Standards Track status ([https://en.wikipedia.org/wiki/RTP_payload_formats](https://en.wikipedia.org/wiki/RTP_payload_formats)).
- **draft-ietf-avtcore-rtp-over-quic (RoQ).** Working Group Last Call held July 2025 on -14; not yet an RFC as of May 2026 but stable and implemented ([https://www.mail-archive.com/quic@ietf.org/msg03711.html](https://www.mail-archive.com/quic@ietf.org/msg03711.html), [https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)). [The Mail Archive](https://www.mail-archive.com/quic@ietf.org/msg03711.html)
- **Media over QUIC (MoQ) WG.** `draft-ietf-moq-transport-17` published 2 March 2026; expected RFC after September 2026 — the *first* IETF media transport that intentionally is **not** RTP ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)). [IETF](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- **AVTCORE remains highly active** with drafts for haptics (draft-ietf-avtcore-rtp-haptics-14, January 2026), V3C volumetric video (-12, October 2025), JPEG XS 3rd edition (2025), Advanced Professional Video / APV (2026), and an HEVC/H.265 WebRTC profile (-08, March 2026) ([https://datatracker.ietf.org/doc/active/](https://datatracker.ietf.org/doc/active/)).
- **AVTCORE in memoriam.** The February 2025 AVTCORE interim opened with an "in memoriam" for Bernard Aboba, a long-time Microsoft RTP/WebRTC contributor ([https://datatracker.ietf.org/meeting/interim-2025-avtcore-01/materials/minutes-interim-2025-avtcore-01-202502111600-00](https://datatracker.ietf.org/meeting/interim-2025-avtcore-01/materials/minutes-interim-2025-avtcore-01-202502111600-00)). [IETF Datatracker](https://datatracker.ietf.org/meeting/interim-2025-avtcore-01/materials/minutes-interim-2025-avtcore-01-202502111600-00)
- **SFrame RTP payload (draft-ietf-avtcore-rtp-sframe).** Status uncertain as of February 2025; the WG is debating whether to continue or park it (same minutes). [IETF Datatracker](https://datatracker.ietf.org/meeting/interim-2025-avtcore-01/materials/minutes-interim-2025-avtcore-01-202502111600-00)
- **Discord DAVE (2024–2026).** Discord deprecated all non-E2EE voice on 1 March 2026; DAVE rides on top of RTP/SRTP using MLS keying and SFrame-style frame encryption ([https://daveprotocol.com/](https://daveprotocol.com/), [https://github.com/discord/dave-protocol/blob/main/protocol.md](https://github.com/discord/dave-protocol/blob/main/protocol.md)).

---

## How it actually works

### The fixed RTP header (12 bytes, exactly)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|X|  CC   |M|     PT      |       sequence number         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           timestamp                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                synchronization source (SSRC)                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|             contributing source (CSRC) [0..15] ...            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Field semantics, verbatim from RFC 3550 §5.1 ([https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550)):

| Field | Bits | Meaning |
|---|---|---|
| **V** (Version) | 2 | Always `2` for RTPv2 (value 1 was the draft; 0 was the original `vat` audio tool wire format). [RFC Editor](https://www.rfc-editor.org/rfc/rfc3550) |
| **P** (Padding) | 1 | If set, last byte of packet is a count of padding bytes to ignore. [Wikipedia](https://en.wikipedia.org/wiki/RTP_Control_Protocol) Used for AES block alignment, [Networksorcery](http://www.networksorcery.com/enp/protocol/rtp.htm) etc. |
| **X** (Extension) | 1 | If set, fixed header is followed by exactly one header extension. [Networksorcery](http://www.networksorcery.com/enp/protocol/rtp.htm) |
| **CC** | 4 | Number of CSRC identifiers [Networksorcery](http://www.networksorcery.com/enp/protocol/rtp.htm) (0–15) that follow the fixed header. [FreeSoft](https://www.freesoft.org/CIE/RFC/1889/9.htm) |
| **M** (Marker) | 1 | Profile-specific significance. [Networksorcery](http://www.networksorcery.com/enp/protocol/rtp.htm) For audio: end of talkspurt. For video: last packet of a frame. |
| **PT** (Payload Type) | 7 | Format of the payload (RFC 3551 static + dynamic). Sender emits one PT at a time. [Erlangen NTP Service](https://www4.cs.fau.de/Projects/JRTP/pmt/node80.html) |
| **Sequence number** | 16 | Increments by 1 per packet, **random initial value**, wraps modulo 2^16. |
| **Timestamp** | 32 | Sampling instant of the first octet of payload, **random initial value**, monotonic at codec clock rate. |
| **SSRC** | 32 | Random unique identifier of the synchronization source within an RTP session. [FreeSoft](https://www.freesoft.org/CIE/RFC/1889/9.htm) |
| **CSRC list** | 0–15 × 32 | SSRCs of contributing sources when a mixer combines streams. |

**Header extensions** — RFC 3550's extension is a single block, prefixed by a 16-bit profile-defined ID and 16-bit length in 32-bit words. RFC 8285 (October 2017, obsoleting RFC 5285) defines the *general mechanism* for **multiple** typed extensions per packet, in one-byte and two-byte forms, negotiated via SDP `a=extmap`. RFC 8285 also adds the `extmap-allow-mixed` attribute that lets one-byte and two-byte extensions appear in the same RTP stream — but never in the same packet ([https://datatracker.ietf.org/doc/rfc8285/](https://datatracker.ietf.org/doc/rfc8285/)). Common extensions in WebRTC: [Liu + 2](https://pike.lysator.liu.se/docs/ietf/rfc/82/rfc8285.xml)

- `urn:ietf:params:rtp-hdrext:ssrc-audio-level` (RFC 6464) — speaker level for who-is-talking UI.
- `urn:ietf:params:rtp-hdrext:sdes:mid` / `:rtp-stream-id` / `:repaired-rtp-stream-id` (RFC 9143 BUNDLE).
- `http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time` and the new `abs-capture-time` (draft-ietf-avtcore-abs-capture-time).
- `transport-wide-cc` (Google Congestion Control).

### RTCP — the back channel

Same UDP path (or `rtcp-mux` on the same port). Five base packet types defined by RFC 3550 §6.1 ([https://www.rfc-editor.org/rfc/rfc3550](https://www.rfc-editor.org/rfc/rfc3550)): [RFC Editor](https://www.rfc-editor.org/rfc/rfc3550)

- **SR (200) Sender Report** — `NTP timestamp | RTP timestamp | sender's packet count | sender's octet count`, then a list of *Reception Report blocks* (per SSRC: fraction lost, cumulative lost, extended highest seqno, jitter, last SR timestamp, delay-since-last-SR — these last two enable round-trip-time estimation). [Webex Blog](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)
- **RR (201) Receiver Report** — same Reception Report blocks but no sender info. [Webex Blog](https://blog.webex.com/engineering/introducing-rtcp-the-rtp-control-protocol/)
- **SDES (202) Source Description** — items keyed by SSRC: CNAME (mandatory canonical name, used to bind multiple SSRCs to the same participant for lip-sync), NAME, EMAIL, PHONE, LOC, TOOL, NOTE, PRIV.
- **BYE (203)** — leaving the session.
- **APP (204)** — application-defined.

RFC 4585 added the **AVPF profile** with the feedback packet types **RTPFB (205)** and **PSFB (206)** carrying NACK (generic transport-layer NACK), PLI (Picture Loss Indication), SLI (Slice Loss), RPSI (Reference Picture Selection), and AFB (Application Feedback) ([https://datatracker.ietf.org/doc/html/rfc4585](https://datatracker.ietf.org/doc/html/rfc4585)). RFC 5104 added FIR (Full Intra Request), TSTR/TSTN (Temporal-Spatial Trade-off), TMMBR/TMMBN (Temporary Maximum Media Stream Bit Rate Request/Notification) and VBCM ([https://datatracker.ietf.org/doc/html/rfc5104](https://datatracker.ietf.org/doc/html/rfc5104)). RFC 8888 (2020) defines the unified per-packet feedback format used by NADA, SCReAM, GCC and Shared Bottleneck Detection ([https://www.rfc-editor.org/rfc/rfc8888](https://www.rfc-editor.org/rfc/rfc8888)). [Hjp + 3](https://www.hjp.at/doc/rfc/rfc4585.html)

The **first packet in every compound RTCP must be SR or RR**, and an **SDES with CNAME must always be included**, even if a BYE follows (RFC 3550 §6.1). [IETF + 2](https://www.ietf.org/rfc/rfc1889.txt)

### Session setup (signaling)

RFC 3550 deliberately doesn't describe session establishment. Real systems use:

- **SDP** (RFC 8866, January 2021) carried by **SIP** (RFC 3261), or by **RTSP** (RFC 7826), or **JSEP** (RFC 9429, April 2024) for WebRTC, or **WHIP** (RFC 9725, March 2025) for ingest.
- The SDP `m=` line declares the protocol stack: `RTP/AVP`, `RTP/AVPF`, `RTP/SAVP`, `RTP/SAVPF`, `UDP/TLS/RTP/SAVPF` (the WebRTC default).

### A typical WebRTC RTP/RTCP setup (mermaid sequence)

STUN/TURNPeer B (callee)Signaling serverPeer A (caller)STUN/TURNPeer B (callee)Signaling serverPeer A (caller)#mermaid-rjh{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rjh .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rjh .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rjh .error-icon{fill:#CC785C;}#mermaid-rjh .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rjh .edge-thickness-normal{stroke-width:1px;}#mermaid-rjh .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rjh .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rjh .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rjh .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rjh .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rjh .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rjh .marker.cross{stroke:#A1A1A1;}#mermaid-rjh svg{font-family:inherit;font-size:16px;}#mermaid-rjh p{margin:0;}#mermaid-rjh .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rjh text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjh .actor-line{stroke:#A1A1A1;}#mermaid-rjh .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rjh .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rjh #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rjh .sequenceNumber{fill:#5e5e5e;}#mermaid-rjh #sequencenumber{fill:#E5E5E5;}#mermaid-rjh #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rjh .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rjh .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rjh .labelText,#mermaid-rjh .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjh .loopText,#mermaid-rjh .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjh .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rjh .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rjh .noteText,#mermaid-rjh .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rjh .activation0{fill:transparent;stroke:#00000000;}#mermaid-rjh .activation1{fill:transparent;stroke:#00000000;}#mermaid-rjh .activation2{fill:transparent;stroke:#00000000;}#mermaid-rjh .actorPopupMenu{position:absolute;}#mermaid-rjh .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rjh .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rjh .actor-man circle,#mermaid-rjh line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rjh :root{--mermaid-font-family:inherit;}par[ICE gathering]Best pair selectedMaster keys derived → SRTP/SRTCP keying (RFC 5764)opt[Loss]loop[Media flow]Offer (SDP) — DTLS fingerprint, ICE ufrag/pwd, m=audio/video, payload types, header extensionsForward OfferAnswer (SDP) — its fingerprint, ufrag/pwd, agreed PTs/extensionsForward AnswerSTUN Binding requestsReflexive candidatesSTUN Binding requestsReflexive candidatesICE connectivity checks (STUN to all candidate pairs)DTLS handshake (over selected ICE pair)SRTP packet (PT=111 Opus, M, seq, ts@48000, SSRC=...)SRTP packet (PT=96 H264, ts@90000, SSRC=...)SRTCP RR + Transport-CC feedbackSRTCP SR + SDES(CNAME)PSFB PLI / RTPFB NACK seq=...SRTP retransmission via RTX (PT=97) or new keyframeSRTCP BYE

### On-the-wire example (G.711 µ-law)

A 20 ms µ-law frame at 8 kHz contains 160 samples = 160 bytes. The full packet:

```
IP (20) + UDP (8) + RTP header (12) + payload (160) = 200 bytes
First RTP byte: 0x80          (V=2, P=0, X=0, CC=0)
Second byte:    0x00          (M=0, PT=0 = PCMU)
Bytes 2–3:      seq            (e.g. 0x1c89 — random init then ++ each packet)
Bytes 4–7:      timestamp      (random init then += 160 each 20ms packet)
Bytes 8–11:     SSRC           (e.g. 0xdeadbeef)
Bytes 12–171:   160 µ-law samples
```

(Walkthrough validated against RFC 3550 §5.1 and the worked example at [https://blog.webex.com/engineering/introducing-rtp-the-packet-format/](https://blog.webex.com/engineering/introducing-rtp-the-packet-format/).)

### Edge cases and arithmetic to know

- **Sequence-number wrap.** Every ~65 536 packets at default audio rates the seqno wraps. Receivers track an extended 32-bit "rollover counter | seqno" — this is exactly what SRTP uses as part of its IV.
- **Timestamp wrap.** A 90 kHz video clock wraps every 13.25 hours; an Opus 48 kHz clock wraps every ~24.85 hours. RTCP SR timestamps and CNAME bind multiple SSRCs to wall-clock NTP for lip-sync.
- **SSRC collision.** RFC 3550 §8.2 specifies the famous SSRC collision algorithm: pick a fresh SSRC on collision and send an RTCP BYE for the old one. In practice, libraries seed from a CSPRNG.
- **Clock-rate switching.** RFC 7160 governs sender behavior when switching between PTs with different clock rates (e.g., wideband ↔ narrowband audio). [IETF](https://tools.ietf.org/tools/rfcmarkup/rfcmarkup.cgi?rfc=8834)
- **NTP timestamp in SR.** 64-bit NTP format = 32 seconds since 1 January 1900 + 32-bit fraction. Receivers use the (NTP, RTP-timestamp) pair to convert local stream-time into wall-clock.

### Security model

- **SRTP/SRTCP (RFC 3711).** Encryption (AES-CM default, AES-GCM via RFC 7714), authentication (HMAC-SHA1-80 default), replay protection (sliding window). SRTCP authentication is **mandatory**; SRTP encryption is optional but standard practice. [IETF](https://datatracker.ietf.org/doc/html/rfc3711)[IETF](https://datatracker.ietf.org/doc/html/rfc3711)
- **DTLS-SRTP keying (RFC 5764).** Peers run a DTLS handshake; the SRTP master key is exported via the DTLS exporter. WebRTC mandates this.
- **SDES keying** (RFC 4568) — keys in SDP, deprecated for unauthenticated SDP transport.
- **ZRTP** (RFC 6189, Informational) — Phil Zimmermann's Diffie-Hellman in-band keying with Short Authentication Strings; used by Signal-era apps and Silent Circle.
- **End-to-end (SFRame, RFC 9605, August 2024)** — encrypts media frames *above* the SFU so relays cannot decrypt content but can still forward by header.

---

## Deep connections to other protocols

**UDP.** The default substrate. RTP carries no retransmission, so it inherits UDP's drop-tolerance. RFC 3550 §11 explicitly says RTP "may be used with other suitable underlying network or transport protocols," foreshadowing TCP fallback (RFC 4571), DCCP, SCTP, DTLS, and now QUIC. [IETF](https://www.ietf.org/rfc/rfc3550.txt)

**WebRTC.** Browsers run RTP everywhere. RFC 8834 (Perkins/Westerlund/Ott, January 2021) is the canonical mandate: "The Real-time Transport Protocol (RTP) [RFC3550] is REQUIRED to be implemented as the media transport protocol for WebRTC … RTCP is a fundamental and integral part of RTP and MUST be implemented and used in all WebRTC endpoints" ([https://datatracker.ietf.org/doc/rfc8834/](https://datatracker.ietf.org/doc/rfc8834/)). WebRTC profiles RTP as RTP/SAVPF with rtcp-mux, BUNDLE, and a *required* set of header extensions including CVO (RFC 7742) and `mid`. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8834.html)[IETF](https://datatracker.ietf.org/doc/rfc8834/)

**SIP.** SIP (RFC 3261, Schulzrinne et al.) is signaling; RTP is media. SIP carries SDP describing RTP parameters (codecs, ports, fingerprints). SIP/SDP/RTP is the architecture of every IMS/VoLTE/VoNR voice call (3GPP).

**SDP (RFC 8866, January 2021).** Plain-text session description. RTP-relevant lines: `m=` (media + protocol), `a=rtpmap:` (PT to codec mapping), `a=fmtp:` (codec parameters), `a=rtcp-mux`, `a=extmap`, `a=ssrc`, `a=fingerprint` (DTLS), `a=ice-ufrag/pwd`.

**RTCP.** Not really a separate protocol — it is half of RFC 3550. Provides reception statistics, sender info for sync, CNAME for cross-SSRC binding, and the entire feedback sub-system (AVPF).

**SRTP / DTLS-SRTP.** A *profile* of RTP (RTP/SAVP, RTP/SAVPF). Same wire format with cryptographic transforms applied to payload (and optionally header extensions per RFC 6904).

**RTSP (RFC 7826).** Application-layer "VCR remote control" for stored or live streams. RTSP signals; RTP delivers. RTSP 2.0 (Schulzrinne, Rao, Lanphier, Westerlund, Stiemerling — December 2016) modernized the protocol but is *not backwards-compatible* with RTSP 1.0 (RFC 2326) and remains a Proposed Standard with limited deployment outside IP cameras ([https://datatracker.ietf.org/doc/html/rfc7826](https://datatracker.ietf.org/doc/html/rfc7826)). [Hjp](https://www.hjp.at/doc/rfc/rfc7826.html)[Wikipedia](https://en.wikipedia.org/wiki/Real-Time_Streaming_Protocol)

**ICE / STUN / TURN.** Not RTP, but they make UDP RTP work across NATs. ICE picks the path; STUN keeps it alive (consent freshness, RFC 7675); TURN relays when the path doesn't exist.

**RTP Topologies (RFC 7667).** Names mesh (each pair has its own RTP session), MCU (Multipoint Control Unit — decodes and re-encodes a mixed stream, expensive on CPU but cheap on bandwidth), and SFU (Selective Forwarding Unit — forwards selected RTP packets without transcoding). SFU dominates modern WebRTC because it's cheap, scales, and preserves end-to-end encoding properties.

**RTP-over-QUIC (RoQ).** `draft-ietf-avtcore-rtp-over-quic-14` (October 2024, WGLC July 2025) maps RTP and RTCP onto QUIC streams or QUIC DATAGRAMs. ALPN token `roq`. Multiplexes RTP sessions via a flow identifier prefix. Retains RTP semantics; QUIC just provides a secure, encrypted, NAT-friendly substrate that uses one port per peer ([https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)). [IETF + 5](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)

**Media over QUIC Transport (MoQT).** A *new* media transport, **not RTP**. `draft-ietf-moq-transport-17` (March 2026) defines a publish-subscribe model over QUIC/WebTransport with fanout via relay caches — explicitly designed for live streaming, gaming, and conferencing at scale. Authors include Suhas Nandakumar (Cisco), Victor Vasiliev (Google), Ian Swett (Google), Alan Frindell (Meta) ([https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)). Industry interest is real — Cloudflare, AWS, Akamai, Synamedia and others demoed at NAB 2026 per Red5 ([https://www.red5.net/blog/what-is-moq-media-over-quic/](https://www.red5.net/blog/what-is-moq-media-over-quic/)), though that vendor blog should be read as marketing; the IETF draft is the authoritative source. [IETF](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)[Red5](https://www.red5.net/blog/what-is-moq-media-over-quic/)

**WebTransport.** A WHATWG/W3C browser API on top of HTTP/3 (or HTTP/2 fallback). Provides reliable streams *and* unreliable datagrams. MoQT is designed to run on WebTransport to be browser-reachable; RoQ is not, by design.

**RTMP (Real-Time Messaging Protocol).** Adobe's TCP-based 1990s ingest protocol still everywhere because Twitch, YouTube Live and friends accept it. It is dying for ingest: WHIP/WebRTC offers sub-second latency where RTMP is 2–5 seconds ([https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee](https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee) — vendor-adjacent commentary, but consistent with Cloudflare/Mux blogs). [Medium](https://medium.com/@contact_45426/the-latency-wars-why-whip-and-moq-are-dethroning-rtmp-srt-for-real-time-streaming-7e5bea4032ee)

**HLS / DASH.** HTTP-based segmented streaming with typical 6–30 s latency, or 2–5 s with LL-HLS/LL-DASH. Philosophically opposite to RTP: optimize for cacheability and CDN scale, not interactivity. They coexist — RTP for the conversation, HLS/DASH for the broadcast viewer.

**MPEG-TS.** Transport stream format from broadcast TV, sometimes carried over RTP (RFC 2250, RFC 4588) for IPTV and for SRT-style contribution feeds. RTP is just packetization here.

**SCTP.** Stream Control Transmission Protocol. In WebRTC, SCTP runs *inside* DTLS to provide DataChannels (RFC 8831). It is the data-plane sibling of RTP in a WebRTC session, not an alternative to it.

**Codec payload formats.** Each codec has its own RFC: H.264 (RFC 6184), H.265/HEVC (RFC 7798), VP8 (RFC 7741), VP9 (RFC 9628), AV1 (Alliance for Open Media spec at [https://aomediacodec.github.io/av1-rtp-spec/v1.0.0.html](https://aomediacodec.github.io/av1-rtp-spec/v1.0.0.html), IETF status: AV1 has IANA media-type registration; the AOM document is referenced by WebRTC implementations but is not itself an IETF RFC), Opus (RFC 7587).

**ZRTP (RFC 6189).** In-band Diffie-Hellman key agreement for SRTP using Short Authentication Strings — peers read four characters to each other to confirm no MITM. Used by Signal's predecessors and Phil Zimmermann's Silent Circle.

---

## Real-world deployment

**Open-source implementations (verified active in 2024–2026 unless noted):**

| Project | Language | Role | Notes |
|---|---|---|---|
| **libwebrtc / Chromium** | C++ | Reference WebRTC stack | Drives Chrome, Edge, Brave, Electron apps. |
| **Pion** | Go | WebRTC library | Pure Go, [Webrtc](https://webrtc.link/en/articles/pion-webrtc-go-library/) MIT license, v4 active in 2026; "Work on Pion's congestion control and bandwidth estimation was funded through the User-Operated Internet fund [NLnet]" ([https://github.com/pion/webrtc](https://github.com/pion/webrtc)). |
| **mediasoup** | C++/Node | SFU | Used internally by LiveKit since Open Vidu/Trembit comparisons; "mediasoup C++ subprocess can typically handle over ~500 consumers in total" [GitHub](https://github.com/livekit/livekit/issues/726) per its own docs ([https://openvidu.io/3.1.0/docs/self-hosting/production-ready/performance/](https://openvidu.io/3.1.0/docs/self-hosting/production-ready/performance/)). |
| **LiveKit** | Go (formerly Pion-based) | SFU + cloud | Active 2026; load-test tooling `lk load-test` ([https://docs.livekit.io/transport/self-hosting/benchmark/](https://docs.livekit.io/transport/self-hosting/benchmark/)). |
| **Janus** | C | General-purpose WebRTC server | Meetecho. Active. |
| **Jitsi Videobridge** | Java | SFU | Used by 8x8 / Jitsi Meet. |
| **GStreamer** | C | Multimedia framework | `webrtcbin` is production-grade. |
| **FFmpeg** | C | Multimedia | RTP demuxer/muxer; APV decoder/encoder added 2025 per draft-ietf-avtcore-rtp-apv references. |
| **PJSIP / libpjproject** | C | SIP+RTP+ICE | Foundation of many softphones; CVE history is extensive. |
| **aiortc** | Python | WebRTC | Pure-Python, popular for ML+RTC bridging. |
| **Asterisk / FreeSWITCH / Kamailio / OpenSIPS** | C | PBX / proxies | The carrier-grade RTP engines. |
| **libsrtp** | C | SRTP library | Cisco-originated, used in Chromium, Asterisk, FreeSWITCH ([https://github.com/cisco/libsrtp](https://github.com/cisco/libsrtp)). |

**Production systems.**

- **Zoom.** Citizen Lab's 2020 reverse-engineering established that Zoom uses a custom variant of RTP wrapped by its own transport protocol over UDP/8801, with AES-128-ECB encryption (notoriously) — "Zoom had apparently designed their own transport protocol, which wraps the well-known RTP protocol for transferring audio and video" ([https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/](https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/)). For *Zoom Phone* they use SIP/TLS + standard SRTP with AES-256 ([https://library.zoom.com/zoom-workplace/zoom-phone/zoom-phone-bluepaper/overview](https://library.zoom.com/zoom-workplace/zoom-phone/zoom-phone-bluepaper/overview)). Zoom's main meetings client still uses a non-standard congestion-control path (Sander, Kunze, Wehrle, Rüth, *Video Conferencing and Flow-Rate Fairness*, [https://arxiv.org/pdf/2107.00904](https://arxiv.org/pdf/2107.00904)). [The Citizen Lab](https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/)[arxiv](https://arxiv.org/pdf/2107.00904)
- **Discord.** Custom C++ SFU; Opus 48 kHz stereo over RTP with libsodium `xsalsa20_poly1305` (older modes deprecated 18 November 2024). DAVE protocol switched all media to E2EE on 1 March 2026 using MLS group keys + frame-level encryption layered on top of RTP/SRTP transport. "We are running more than 850 voice servers in 13 regions (hosted in more than 30 data centers) all over the world" per Discord engineering ([https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)). [Discord + 3](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- **Google Meet / Microsoft Teams / Webex.** All are RTP/SRTP at the wire level with WebRTC-style profiles, enriched with proprietary extensions. Microsoft Teams suffered a notable messaging incident TM1200517 on 19 December 2025 — *messaging* delays, not media ([https://windowsforum.com/threads/microsoft-teams-outage-december-19-2025-tm1200517-messaging-delays.394512/](https://windowsforum.com/threads/microsoft-teams-outage-december-19-2025-tm1200517-messaging-delays.394512/)); Microsoft 365 also had a routing-related global outage in mid-2025 reported to affect Teams calls ([https://www.webasha.com/blog/why-did-microsoft-365-teams-and-exchange-go-down-in-2025-full-analysis-of-the-global-service-disruption](https://www.webasha.com/blog/why-did-microsoft-365-teams-and-exchange-go-down-in-2025-full-analysis-of-the-global-service-disruption) — quality of source: tech-news rather than postmortem; Microsoft's official postmortems were not in the public RCA at time of writing). [Cyber Press](https://cyberpress.org/worldwide-microsoft-teams-outage-leads-to-message-delivery-delays/)[WebAsha Technologies](https://www.webasha.com/blog/why-did-microsoft-365-teams-and-exchange-go-down-in-2025-full-analysis-of-the-global-service-disruption)
- **Cloudflare Realtime** (formerly Cloudflare Calls). SFU + TURN deployed across "330 global locations" per Cloudflare marketing ([https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/](https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/)). Anycast-routed; pricing is $0.05/GB outbound for TURN when used standalone ([https://developers.cloudflare.com/realtime/turn/](https://developers.cloudflare.com/realtime/turn/)). Note this is a Cloudflare-published page so the deployment-scale claim is self-reported. [Cloudflare](https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/)[Cloudflare](https://developers.cloudflare.com/realtime/turn/)
- **Amazon Chime SDK, Twitch IVS, Daily.co, LiveKit Cloud.** All SFU-based, all RTP at wire level.
- **WhatsApp / Facebook Messenger / FaceTime.** Use RTP for media (with proprietary E2EE schemes on top).

**Topology decisions, with the canonical reference.** RFC 7667 ([https://www.rfc-editor.org/rfc/rfc7667](https://www.rfc-editor.org/rfc/rfc7667)) names the topologies and is what every senior engineer should cite in design docs.

- **Mesh.** N(N-1)/2 PeerConnections. Quality is great; bandwidth at the publisher explodes past ~4 participants.
- **MCU.** Server transcodes everything into one mixed stream per receiver. Very expensive CPU. Used historically by hardware video conferencing.
- **SFU.** Server forwards selected RTP streams. Cheap (no transcoding), scales horizontally, the modern default.

**Performance numbers (with sources, treated carefully):**

- mediasoup self-quoted: ~500 consumers/CPU subprocess ([https://openvidu.io/3.1.0/docs/self-hosting/production-ready/performance/](https://openvidu.io/3.1.0/docs/self-hosting/production-ready/performance/)) — vendor figure.
- LiveKit "Going beyond a single core" implies ~100 video downtracks/core, so ~1600 across 16 cores in the configured benchmark per a community discussion ([https://github.com/livekit/livekit/issues/726](https://github.com/livekit/livekit/issues/726)) — community estimate. [GitHub](https://github.com/livekit/livekit/issues/726)
- Alex Gouaillard's *Breaking Point* SFU load tests at IIT-RTC ([https://webrtchacks.com/sfu-load-testing/](https://webrtchacks.com/sfu-load-testing/)) showed Jitsi failing at ~240 participants in a single conference, with Janus and mediasoup outperforming Medooze and Kurento — these are old-tested but the methodology is the most comprehensive public benchmark. [webrtcHacks](https://webrtchacks.com/sfu-load-testing/)
- Discord's blog ([https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)) reports 2.5 M concurrent voice users handled by their SFU fleet; this is self-reported but consistent.
- Cloudflare Realtime deployment scale: 330 locations ([https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/](https://www.cloudflare.com/developer-platform/products/cloudflare-realtime/)), self-reported.

**End-to-end latency ranges (typical, not worst-case):**

- WebRTC SFU same continent: 50–150 ms mouth-to-ear is realistic. [ACM Digital Library](https://dl.acm.org/doi/book/10.17487/RFC9725)
- WhatsApp/FaceTime cellular: 150–300 ms.
- Low-latency HLS / LL-DASH: 2–5 s.
- Standard HLS/DASH: 6–30 s.
- RTMP ingest → HLS playout: 5–10 s typical.

---

## Failure modes and famous incidents

**Asterisk RTP "Bleed" — 2017 (CVE-2017-14099 and AST-2017-008/-012).** Asterisk's strict-RTP port latching could be hijacked: an attacker bombarding the RTP port range with packets faster than the legitimate peer could persuade Asterisk to "re-train" the media flow to the attacker's source — effectively redirecting RTP into the attacker's lap. The first patch missed RTCP and a race condition: "While RTP packets would no longer re-train to a malicious attacker's source address, RTCP packets could still be stolen using the same packet flooding approach" ([https://www.asterisk.org/rtp-security-vulnerabilities/](https://www.asterisk.org/rtp-security-vulnerabilities/)). The Register reported the practical effect: an attacker outside the call can decode the audio ([https://www.theregister.com/2017/09/03/asterisk_rtp_bug_allows_intercepted_calls/](https://www.theregister.com/2017/09/03/asterisk_rtp_bug_allows_intercepted_calls/)). The retrospective from Asterisk is the canonical public postmortem. [Asterisk](https://www.asterisk.org/rtp-security-vulnerabilities/)

**libsrtp historical CVEs.**

- **CVE-2015-6360.** Improper handling of CSRC count and extension header length in the RTP header — DoS via integer underflow, fixed in libSRTP 1.5.3 ([https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20160420-libsrtp.html](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20160420-libsrtp.html)). [Cisco](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20160420-libsrtp.html)
- **CVE-2013-2139.** Buffer overflow in application of crypto profiles, fixed in 1.5.x line (referenced by Red Hat advisory [https://access.redhat.com/errata/RHSA-2020:3873](https://access.redhat.com/errata/RHSA-2020:3873)). [Red Hat](https://access.redhat.com/errata/RHSA-2020:3873)

**Asterisk RTCP RCE (CVE-2017-14098 family).** A specially crafted RTCP packet caused out-of-bounds memory access in `res_rtp_asterisk.c`, leading to crash or arbitrary code execution depending on context ([https://www.juniper.net/us/en/threatlabs/ips-signatures/detail.VOIP:SIP:ASTERISK-RTCP-RCE.html](https://www.juniper.net/us/en/threatlabs/ips-signatures/detail.VOIP:SIP:ASTERISK-RTCP-RCE.html)).

**Asterisk SRTP replay (2021).** "Incorrect access controls in res_srtp.c in Sangoma Asterisk 13.38.1, 16.16.0, 17.9.1, and 18.2.0 … allow a remote unauthenticated attacker to prematurely terminate secure calls by replaying SRTP packets" ([https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-1802/product_id-3085/Digium-Asterisk.html)).

**PJSIP STUN integer underflow (CVE-2022-31031 family).** "A malicious actor located within the victim's network may forge and send a specially crafted UDP (STUN) message that could remotely execute arbitrary code on the victim's machine" — affects all PJSIP users that use STUN ([https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html](https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html)). Important because PJSIP's STUN is gateway to its RTP/ICE engine. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-6284/Asterisk.html)

**Asterisk SIP-trunk hijacking (2024 — CVE-2024-35190).** "asterisk: wrongly matches ALL unauthorized SIP requests" — the Red Hat tracker ([https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2024-35190](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2024-35190)). Not RTP-specific, but it's the kind of authentication-bypass that lets an attacker into the RTP path.

**2024–2026 RTP/SRTP CVEs explicitly:** A search of NVD and CVE Details did not surface a new high-severity *libsrtp* CVE published in 2024–2026 as of May 2026. The most active 2024+ CVE traffic in this ecosystem has been around PJSIP and Asterisk SIP/SDP layers rather than RTP/SRTP itself. (Search results across [https://www.cvedetails.com/product/26868/Cisco-Libsrtp.html](https://www.cvedetails.com/product/26868/Cisco-Libsrtp.html) and NVD; absence-of-evidence noted explicitly per task instructions.) `[needs source for any 2024–2026 libsrtp-specific CVE]`.

**Zoom's "rolled their own crypto" (April 2020).** Citizen Lab (Marczak & Scott-Railton) showed Zoom used AES-128-ECB on RTP payloads and shared one key per meeting — meaning patterns in encrypted video frames were preserved. Industry reaction forced Zoom to switch to AES-GCM and ultimately publish an E2EE design ([https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/](https://citizenlab.ca/2020/04/move-fast-roll-your-own-crypto-a-quick-look-at-the-confidentiality-of-zoom-meetings/)). The lesson: SRTP exists for a reason; AES-CM/GCM in counter mode preserves real-time properties without ECB's pattern leak.

**Production pitfalls engineers actually hit:**

- **NAT timeout dropping RTP.** UDP NAT mappings expire silently; missing keepalive (STUN binding requests, RFC 7675 consent freshness) means audio cuts at 30–120 s.
- **Clock-rate mismatch.** Sender encodes at 48 kHz Opus, signals 48 000 in `a=rtpmap`, but a buggy gateway transcodes to 8 kHz µ-law without rewriting timestamps — receivers play sped-up or chipmunked audio.
- **SSRC collisions.** Two endpoints generating the same SSRC pollute reception reports; RFC 3550 §8.2's collision algorithm exists for a reason.
- **Payload type clashes.** Static PT 0 = PCMU is fine; dynamic PT 100 means *whatever the SDP says*, and re-using 100 for two different codecs in a re-INVITE is a classic source of "no audio" tickets.
- **Jitter buffer too small.** Anti-pattern: using a 20 ms buffer "for latency" on a Wi-Fi link with 50 ms jitter — every burst is underflow.
- **MTU/fragmentation.** Sending 1450-byte H.264 packets through a 1400-byte tunnel produces IP fragmentation, then loss, then useless retransmission storms.

---

## Fun facts and anecdotes

- **The version field's hidden history.** RFC 3550 §5.1 explicitly says: *"The value 1 is used by the first draft version of RTP and the value 0 is used by the protocol initially implemented in the 'vat' audio tool"* ([https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550)). So bytes on the wire still encode the existence of `vat`. [FreeSoft](https://www.freesoft.org/CIE/RFC/1889/9.htm)
- **The SSRC collision algorithm.** Algorithm A.6 in RFC 3550 Appendix is implemented as a hash of MAC addresses, time, and PID — but virtually every modern stack just uses 4 bytes from `/dev/urandom`. The Algorithm A.6 reference implementation famously calls `MD5_Init` to mix entropy in 1996.
- **Wax, or the Discovery of Television Among the Bees.** On 23 May 1993, this experimental film became the first such broadcast over the MBone ([https://en.wikipedia.org/wiki/Mbone](https://en.wikipedia.org/wiki/Mbone)). The 1994 Rolling Stones MBone audiocast came two years later — by then "more than 10,000 people in 30 countries routinely used the M-Bone for collaborative work" per LBL ([https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html](https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html)). [Lawrence Berkeley National Laboratory](https://www2.lbl.gov/Science-Articles/Archive/MBONE-van-jacobson.html)
- **The pet iguana.** Van Jacobson on early MBone usage: *"Somebody actually sent out to the universe live pictures of their pet iguana climbing a tree"* ([https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html](https://www2.lbl.gov/Science-Articles/Archive/Stu-Loken-MBONE.html)). A fundamental Internet truth: someone always tries the silliest possible thing first. [Lawrence Berkeley National Laboratory](https://www2.lbl.gov/Science-Articles/Archive/MBONE-van-jacobson.html)
- **The R&D 100 Award.** Jacobson and Steven McCanne won the 1995 R&D 100 Award for the MBone tool pack ([https://en.wikipedia.org/wiki/Van_Jacobson](https://en.wikipedia.org/wiki/Van_Jacobson)). McCanne's name lives on every Linux kernel: he co-invented BPF (the Berkeley Packet Filter, with Jacobson), now eBPF. [Wikipedia](https://en.wikipedia.org/wiki/Van_Jacobson)
- **Frederick's `nv` lineage.** Ron Frederick's `nv` morphed into Xerox PARC's Jupiter MOO video, became PlaceWare, was acquired by Microsoft, and shaped what became Live Meeting and indirectly Skype/Teams ([https://webrtcforthecurious.com/docs/10-history-of-webrtc/](https://webrtcforthecurious.com/docs/10-history-of-webrtc/)).
- **STD 64 and STD 65 are buddies.** RTP and its base profile are the only "Internet Standard" pair where one is utterly useless without the other.
- **Schulzrinne's RFC count.** Henning Schulzrinne has authored "more than 70 Internet RFCs" per Columbia ([https://datascience.columbia.edu/people/henning-schulzrinne/](https://datascience.columbia.edu/people/henning-schulzrinne/)), and his Google Scholar h-index was 95 with >65 000 citations as of March 2024 ([https://en.wikipedia.org/wiki/Henning_Schulzrinne](https://en.wikipedia.org/wiki/Henning_Schulzrinne)). RTP, RTSP, and SIP are the famous three. [Columbia + 2](https://industry.datascience.columbia.edu/profile/henning-g-schulzrinne)
- **Schulzrinne at the FCC.** He served as FCC CTO 2012–2014 ([https://www.engineering.columbia.edu/faculty/henning-schulzrinne](https://www.engineering.columbia.edu/faculty/henning-schulzrinne)); the same person who defined how your video call's packets are timestamped also shaped US robocall policy. [Wikipedia](https://en.wikipedia.org/wiki/Henning_Schulzrinne)
- **"BYE should be the last packet."** RFC 3550 §6.1's polite SHOULD: *"BYE SHOULD be the last packet sent with a given SSRC/CSRC."* It is genuinely treated as good etiquette. [RFC Editor](https://www.rfc-editor.org/rfc/rfc3550)

---

## Practical wisdom

**Tune these. The defaults will betray you.**

- **Jitter buffer.** Adaptive between 40–200 ms for audio is sane. Static 20 ms is a misconfiguration on the open Internet.
- **RTCP transmission interval.** RFC 3550 default is 5 s minimum; RTP/AVPF (RFC 4585) gives you Early Mode for sub-second feedback. WebRTC stacks set the *reduced minimum interval* `trr-int` to match their NACK/PLI cadence.
- **RTCP bandwidth.** RFC 3550 caps RTCP at 5% of session bandwidth, with 25% of that for senders. For 1 Mbps video this is 50 kbps — plenty for transport-CC feedback at 100 Hz.
- **Payload types.** Avoid 96–98 collisions in re-INVITE-heavy SIP networks. Pin specific PTs in your `a=rtpmap` and audit them.
- **SSRC churn.** A monitoring metric. SSRCs changing once every few minutes = simulcast/RTX as designed. SSRCs churning every few seconds = a bug in your endpoint or a NAT rebinding.
- **Per-stream metrics to alert on:** packet loss > 2 %, jitter > 30 ms, RTT > 200 ms (from RTCP `LSR/DLSR`), late/duplicate packets, sender→receiver octet rate divergence.

**Wireshark workflow.**

1. Capture on the egress interface; `udp portrange 10000-60000`.
2. *Telephony → RTP → RTP Streams* lists SSRCs with stats.
3. Right-click → *Analyze* shows jitter, lost, max delta, sequence anomalies.
4. *Telephony → VoIP Calls* gives you the SDP/SIP signaling correlated to media.
5. For SRTP: dump DTLS keys via `SSLKEYLOGFILE` (Chromium honors it via `--ssl-key-log-file`); Wireshark decrypts SRTP given the keys.

**Common misconfigurations the senior engineer always checks.**

- `c=` line in SDP is `0.0.0.0` because the box behind NAT didn't apply ICE candidates.
- `m=audio` and `m=video` use *different* RTCP CNAMEs, breaking lip-sync.
- `rtcp-mux` mismatch: one side multiplexes, the other expects port+1.
- Duplicate `a=fmtp:` profile-level-id strings causing codec negotiation to a degraded mode.
- BUNDLE not implemented at the gateway — extra ports blocked at corporate firewalls.

**`webrtc-internals`.** `chrome://webrtc-internals` (or `about:webrtc` in Firefox) gives you per-PeerConnection stats, RTCP RR timelines, and download dumps for offline analysis. Always the first stop.

---

## Learning resources (current as of 2026)

**RFCs (authoritative; section pointers given for the dense ones).**

- **RFC 3550 — RTP** (Schulzrinne/Casner/Frederick/Jacobson, July 2003). §5.1 fixed header, §6 RTCP, §8.2 SSRC collision, Appendix A.6 random ID generator. Intermediate–Advanced. [https://datatracker.ietf.org/doc/html/rfc3550](https://datatracker.ietf.org/doc/html/rfc3550)
- **RFC 3551 — RTP/AVP profile.** Static PTs, audio/video defaults. Intro–Intermediate. [https://www.rfc-editor.org/rfc/rfc3551](https://www.rfc-editor.org/rfc/rfc3551)
- **RFC 3711 — SRTP.** §3 packet format, §4 transforms, §9 security. Advanced. [https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711)
- **RFC 4585 — RTP/AVPF (feedback).** §6 PLI/SLI/NACK. Advanced. [https://datatracker.ietf.org/doc/html/rfc4585](https://datatracker.ietf.org/doc/html/rfc4585)
- **RFC 5104 — Codec Control Messages.** FIR, TMMBR, TSTR. Advanced. [https://datatracker.ietf.org/doc/html/rfc5104](https://datatracker.ietf.org/doc/html/rfc5104) [IETF](https://datatracker.ietf.org/doc/html/rfc5104)
- **RFC 5761 — RTP/RTCP multiplexing on a single port.** Intermediate. [https://www.rfc-editor.org/rfc/rfc5761](https://www.rfc-editor.org/rfc/rfc5761)
- **RFC 5764 — DTLS-SRTP keying.** Advanced. [https://www.rfc-editor.org/rfc/rfc5764](https://www.rfc-editor.org/rfc/rfc5764)
- **RFC 7587 — RTP Payload for Opus** (Spittka/Vos/Valin, June 2015). [https://datatracker.ietf.org/doc/html/rfc7587](https://datatracker.ietf.org/doc/html/rfc7587) [Hjp](https://hjp.at/doc/rfc/rfc7587.html)
- **RFC 7714 — AES-GCM for SRTP.** [https://www.rfc-editor.org/rfc/rfc7714](https://www.rfc-editor.org/rfc/rfc7714)
- **RFC 8285 — Header extension general mechanism** (Singer/Desineni/Even, October 2017). [https://datatracker.ietf.org/doc/rfc8285/](https://datatracker.ietf.org/doc/rfc8285/)
- **RFC 8108 — multiple media sources per RTP session.** [https://www.rfc-editor.org/rfc/rfc8108](https://www.rfc-editor.org/rfc/rfc8108)
- **RFC 8834 — RTP usage in WebRTC** (Perkins/Westerlund/Ott, January 2021). [https://datatracker.ietf.org/doc/rfc8834/](https://datatracker.ietf.org/doc/rfc8834/)
- **RFC 8888 — Unified RTCP feedback for congestion control.** [https://www.rfc-editor.org/rfc/rfc8888](https://www.rfc-editor.org/rfc/rfc8888)
- **RFC 9605 — SFrame** (Omara/Uberti/Garcia Murillo/Thatcher/Fablet/Barnes, August 2024). The 2024 milestone for E2EE conferencing. [https://datatracker.ietf.org/doc/rfc9605/](https://datatracker.ietf.org/doc/rfc9605/)
- **RFC 9628 — VP9 RTP payload format** (2024). [https://en.wikipedia.org/wiki/RTP_payload_formats](https://en.wikipedia.org/wiki/RTP_payload_formats)
- **RFC 9725 — WHIP** (Garcia Murillo/Gouaillard, March 2025). [https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/)
- **draft-ietf-avtcore-rtp-over-quic-14** (October 2024 / WGLC July 2025). [https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/)
- **draft-ietf-moq-transport-17** (March 2026). [https://datatracker.ietf.org/doc/draft-ietf-moq-transport/](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- **draft-ietf-avtcore-hevc-webrtc-08** (March 2026). [https://datatracker.ietf.org/doc/active/](https://datatracker.ietf.org/doc/active/)

**Books.**

- **Colin Perkins, *RTP: Audio and Video for the Internet* (Addison-Wesley, 2003).** The canonical RTP textbook by the AVT WG co-chair. Chapters 4–6 cover packet format, RTCP, and timing in detail; chapters 9–11 cover security and reliability. Still cited in 2025 IETF drafts. Advanced. ([https://www.eyrolles.com/Informatique/Livre/rtp-audio-and-video-for-the-internet-9780672322495/](https://www.eyrolles.com/Informatique/Livre/rtp-audio-and-video-for-the-internet-9780672322495/))
- **Alan B. Johnston, *SIP: Understanding the Session Initiation Protocol* (4th ed., Artech House, 2015).** SIP-side companion. Intermediate.
- **Olivier Bonaventure, *Computer Networking: Principles, Protocols and Practice* (open).** Free, current 2024 revisions; transport-layer chapters set up RTP context. Intro. [https://www.computer-networking.info/](https://www.computer-networking.info/)
- ***WebRTC for the Curious* (open-source).** Implementer-written, vendor-agnostic, deeply practical chapter on RTP/RTCP at [https://webrtcforthecurious.com/docs/06-media-communication/](https://webrtcforthecurious.com/docs/06-media-communication/). Actively maintained; download PDF at [https://webrtcforthecurious.com/docs/webrtc-for-the-curious.pdf](https://webrtcforthecurious.com/docs/webrtc-for-the-curious.pdf). Intro–Advanced. [Webrtcforthecurious](https://webrtcforthecurious.com/)

**Engineering blogs (2024–2026 currency).**

- **Webex Engineering — "Introducing RTP: The Packet Format"** by Jamie Roberts. Excellent field-by-field walkthrough. [https://blog.webex.com/engineering/introducing-rtp-the-packet-format/](https://blog.webex.com/engineering/introducing-rtp-the-packet-format/)
- **Cloudflare Realtime docs** ([https://developers.cloudflare.com/realtime/](https://developers.cloudflare.com/realtime/)) and the deep-dive technical series. 2025–2026 currency.
- **Discord engineering — "How Discord Handles 2.5M Concurrent Voice Users with WebRTC."** [https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- **Discord DAVE protocol whitepaper** (2024–2026). [https://daveprotocol.com/](https://daveprotocol.com/)
- **webrtcHacks SFU load testing series.** [https://webrtchacks.com/sfu-load-testing/](https://webrtchacks.com/sfu-load-testing/)
- **mediasoup blog** at [https://mediasoup.org/](https://mediasoup.org/).
- **LiveKit benchmarking docs.** [https://docs.livekit.io/transport/self-hosting/benchmark/](https://docs.livekit.io/transport/self-hosting/benchmark/)
- **Asterisk RTP Security Retrospective.** [https://www.asterisk.org/rtp-security-vulnerabilities/](https://www.asterisk.org/rtp-security-vulnerabilities/)

**Academic / IETF papers.**

- Casner & Deering, *First IETF Internet Audiocast*, ACM SIGCOMM CCR 22(3), July 1992. DOI: 10.1145/142267.142338. [https://dl.acm.org/doi/10.1145/142267.142338](https://dl.acm.org/doi/10.1145/142267.142338)
- McCanne & Jacobson, *vic: A Flexible Framework for Packet Video*, ACM Multimedia '95. [https://ee.lbl.gov/vic/](https://ee.lbl.gov/vic/)
- *Congestion Control for RTP Media: A Comparison on Simulated Environment*, EAI INISCOM 2018. [https://eudl.eu/pdf/10.1007/978-3-030-32216-8_4](https://eudl.eu/pdf/10.1007/978-3-030-32216-8_4)
- Sander, Kunze, Wehrle, Rüth, *Video Conferencing and Flow-Rate Fairness: A First Look at Zoom and the Impact of Flow-Queuing AQM*, PAM 2021. [https://arxiv.org/pdf/2107.00904](https://arxiv.org/pdf/2107.00904)

**Conference talks.**

- **Demuxed** annual: [https://www.demuxed.com/](https://www.demuxed.com/). 2025 (London) included Media-over-QUIC, Mediabunny/WebCodecs, and DASH SGAI talks. [https://2025.demuxed.com/](https://2025.demuxed.com/) [Nimblea](https://nimblea.pe/blog/demuxed-london-2025)
- **Kranky Geek WebRTC** annual conference series — historical talks by Justin Uberti, Philipp Hancke, Lorenzo Miniero. YouTube: [https://www.youtube.com/@krankygeek](https://www.youtube.com/@krankygeek)
- **IETF AVTCORE meeting recordings** at [https://datatracker.ietf.org/wg/avtcore/meetings/](https://datatracker.ietf.org/wg/avtcore/meetings/).
- **Internet Hall of Fame: Henning Schulzrinne 2013 induction video.** [https://www.youtube.com/watch?v=H7jquAWdI9c](https://www.youtube.com/watch?v=H7jquAWdI9c)

**Free university material.**

- **MIT 6.829 Computer Networks** lecture notes including transport layer. [https://ocw.mit.edu/search/?q=6.829](https://ocw.mit.edu/search/?q=6.829)
- **CMU 15-441 Networking** projects — practical RTP labs. [https://www.cs.cmu.edu/~prs/15-441/](https://www.cs.cmu.edu/~prs/15-441/)
- **Stanford CS144 Introduction to Computer Networking.** [https://cs144.github.io/](https://cs144.github.io/)

**Hands-on tools.**

- `chrome://webrtc-internals` (Chromium), `about:webrtc` (Firefox).
- Wireshark with the built-in RTP/RTCP/SRTP dissectors. [https://www.wireshark.org/](https://www.wireshark.org/)
- OBS Studio with built-in WHIP output (since v30). [https://obsproject.com/](https://obsproject.com/)
- GStreamer `webrtcbin` + `rtpbin` pipelines.
- Pion examples — a Go-readable replica of the WebRTC RFC stack. [https://github.com/pion/webrtc/tree/master/examples](https://github.com/pion/webrtc/tree/master/examples)
- SIPp for SIP/RTP load testing.
- LiveKit `lk load-test`. [https://docs.livekit.io/transport/self-hosting/benchmark/](https://docs.livekit.io/transport/self-hosting/benchmark/)

---

## Where things are heading (2025–2026 frontier)

**1. RTP-over-QUIC (RoQ).** AVTCORE held final WGLC in July 2025 on draft -14 ([https://www.mail-archive.com/quic@ietf.org/msg03711.html](https://www.mail-archive.com/quic@ietf.org/msg03711.html)). RoQ keeps RTP semantics intact and uses QUIC as the secure transport: encrypted by default, multipath-friendly, multiplexes multiple RTP sessions per QUIC connection via a flow identifier prefix, runs over either QUIC streams or unreliable QUIC DATAGRAMs (RFC 9221). ALPN token `roq`. **Why it matters:** preserves the RTP ecosystem (codecs, payload formats, RTCP feedback) while gaining QUIC's connection migration, single-port operation, and 0-RTT. **Status as of May 2026:** post-WGLC, awaiting publication; the draft is implemented in the reference Go library at [https://github.com/mengelbart/rtp-over-quic-draft](https://github.com/mengelbart/rtp-over-quic-draft). [IETF + 2](https://datatracker.ietf.org/doc/draft-ietf-avtcore-rtp-over-quic/00/)

**2. Media over QUIC (MoQ).** A genuinely new transport, **explicitly not** RTP. The MoQ WG charter says "Media will be mapped onto underlying QUIC mechanisms (QUIC streams and/or QUIC datagrams) and can be used over raw QUIC or WebTransport" ([https://datatracker.ietf.org/group/moq/about/](https://datatracker.ietf.org/group/moq/about/)). `draft-ietf-moq-transport-17` (March 2026) is at version 17 with co-editors from Cisco, Google, and Meta. The "moq-lite" variant by Luke Curley (`draft-lcurley-moq-lite-02`, November 2025) trims the spec to the live fanout core ([https://www.ietf.org/archive/id/draft-lcurley-moq-lite-02.html](https://www.ietf.org/archive/id/draft-lcurley-moq-lite-02.html)). Industry: the OpenMOQ Software Consortium formed in late 2025 with eleven vendors (Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, Cloudflare, Nomad Media, Oracle, Norsk, Synamedia, Red5) demoing first interoperable implementations at NAB 2026 — **note that source is a vendor blog (Red5)** so treat the consortium narrative as industry-promoted rather than independently verified ([https://www.red5.net/blog/what-is-moq-media-over-quic/](https://www.red5.net/blog/what-is-moq-media-over-quic/)). nanocosmos claims a production launch at IBC 2025 — also vendor-self-reported ([https://www.nanocosmos.net/blog/media-over-quic-moq/](https://www.nanocosmos.net/blog/media-over-quic-moq/)). [IETF Datatracker](https://datatracker.ietf.org/group/moq/about/)

**3. WHIP/WHEP.** WHIP became RFC 9725 in March 2025 ([https://datatracker.ietf.org/doc/rfc9725/](https://datatracker.ietf.org/doc/rfc9725/)). WHEP (egress) is in late draft. Pragmatically, WHIP is winning the *ingest* battle that RTMP held for 25 years. OBS Studio shipped WHIP support in v30. Cloudflare, Dolby.io, Wowza, Red5 Pro, Janus all support it. WebRTC + WHIP is pulling **sub-second** latency into the live-streaming workflow.

**4. End-to-end encryption: SFrame + MLS.** RFC 9605 (SFrame, August 2024) finally standardized E2EE for conferencing. Discord's DAVE (deployed by 1 March 2026 deadline; [https://daveprotocol.com/](https://daveprotocol.com/)) is the highest-profile production deployment, using MLS group key agreement to give every sender a ratcheted symmetric key and SFrame-style frame encryption above the SFU. Expect every consumer messenger to follow.

**5. Congestion control convergence.** Three competing algorithms — Google Congestion Control (GCC, draft-ietf-rmcat-gcc), NADA (RFC 8698, Cisco), and SCReAM (RFC 8298, Ericsson) — finally have a unified RTCP feedback format in **RFC 8888** ([https://www.rfc-editor.org/rfc/rfc8888](https://www.rfc-editor.org/rfc/rfc8888)). Pion's congestion-control work (NLnet-funded, [https://github.com/pion/webrtc](https://github.com/pion/webrtc)) is actively closing the gap with libwebrtc's GCC.

**6. AV1 RTP payload format.** Defined by AOMedia at [https://aomediacodec.github.io/av1-rtp-spec/v1.0.0.html](https://aomediacodec.github.io/av1-rtp-spec/v1.0.0.html) with Dependency Descriptor support enabling efficient SVC/simulcast. Cloudflare Realtime, Meta, Google Meet ship AV1 in 2025–2026 for screenshare, with VP9 still default for camera due to encoder cost. AV1 RTP is **not yet an IETF RFC**; this is an Alliance for Open Media spec referenced by IETF documents.

**7. WebCodecs + WebTransport as RTP alternative.** The W3C WebCodecs API gives JavaScript direct access to H.264/H.265/AV1/Opus encoders/decoders; combined with WebTransport (HTTP/3 datagrams + streams), apps can implement *non-RTP* media transports in pure JS. This is the technical foundation for MoQ-in-the-browser. RTP isn't replaced in browsers — WebRTC's RTP path is required by RFC 8834 — but it gains a sibling.

**8. AVTCORE active workstreams (verified May 2026).** The IETF AVTCORE GitHub org ([https://github.com/ietf-wg-avtcore](https://github.com/ietf-wg-avtcore)) lists active drafts for V3C volumetric video, JPEG XS 3rd edition, APV (Samsung), haptics (MPEG-I), HEVC WebRTC profile, "abs-capture-time" header extension, and the green-metadata RTCP feedback for energy-aware encoding. This is *not* a dying ecosystem.

**9. Honest assessment.** RTP at 30 years old is doing better than most predictions of its demise. RoQ keeps it relevant on QUIC; SFrame fixes its biggest gap (E2EE in SFU topologies); WHIP rescues live-streaming ingest. MoQ is the credible *long-term* successor for distribution-side workloads but is currently optimized for one-to-many publish/subscribe, not the bidirectional conversational case where RTP/SRTP/WebRTC remains best-in-class. Expect RTP to dominate interactive A/V (Meet, Teams, Zoom, Discord, Webex, FaceTime, WhatsApp) through at least 2030 and probably much longer.

---

## Hooks for the article, infographic, and podcast

### 60-second narrated hook

> Thirty years ago, in March 1992, a few hundred network researchers in San Diego turned on their workstations and heard each other's voices come out of the speakers — over the public Internet. The IETF meeting was being multicast to twenty sites worldwide using a hand-rolled overlay called the MBone. Van Jacobson, Steve Casner, Steve Deering — and a tool called `vat`. Four years later, four authors — Henning Schulzrinne, Stephen Casner, Ron Frederick, Van Jacobson — published RFC 1889. They called it the Real-time Transport Protocol. It is twelve bytes of header. It does not retransmit. It does not even guarantee delivery. And today, every Zoom call you make, every WhatsApp video, every Microsoft Teams meeting, every Discord voice channel, every FaceTime, every 911 call routed over IP — every single one — runs on top of those twelve bytes. In 2026 we're finally putting it on QUIC. But we are not replacing it. Some protocols just get it right.

### A striking statistic with source

> Discord's homegrown C++ SFU, written specifically to forward RTP between clients, handles **2.5 million concurrent voice users** across **850+ voice servers in 13 regions and over 30 data centers worldwide** — and the underlying packet format hasn't changed since RFC 1889 was published in January 1996. (Source: Discord engineering blog, [https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc).)

### A "pause and think" moment

> RFC 3550 §5.1 specifies that the **initial value of the RTP sequence number must be random**, not zero. *Pause.* Why would a protocol intentionally start counting from a random number? Answer: SRTP came eight years later. The same field that lets a receiver detect packet loss also forms part of SRTP's encryption nonce. Predictable starting values would have meant predictable nonces, which would have meant key reuse, which would have broken AES counter-mode. The RTP authors in 1996 didn't *know* about SRTP — but they preserved enough cryptographic hygiene that, when SRTP arrived in 2004, it could be layered on without breaking the wire format. That's what good protocol design looks like. (Source: RFC 3550 §5.1 + RFC 3711 §3.2.1, [https://datatracker.ietf.org/doc/html/rfc3711](https://datatracker.ietf.org/doc/html/rfc3711).)

### A failure-story arc: the Asterisk RTP Bleed (2017)

**Setup.** Asterisk is the world's most-deployed open-source PBX. To handle NAT, its RTP engine "latches" — once a real RTP packet arrives at a port, Asterisk locks media flow to that source IP. The default config is `nat=yes`, `strictrtp=yes`. Most installs use defaults.

**The mistake.** The latching had no authentication. The first RTP packet to arrive *won*. Klaus Petter Darilion (kapejod) realized this could be weaponized: an attacker, anywhere on the Internet, could spray RTP packets at Asterisk's UDP port range — for default ports and codecs, **between 28 MB/s and 168 MB/s** of traffic — and the moment any matched a live call, Asterisk would re-train and start delivering the *real* call's audio to the attacker ([https://www.theregister.com/2017/09/03/asterisk_rtp_bug_allows_intercepted_calls/](https://www.theregister.com/2017/09/03/asterisk_rtp_bug_allows_intercepted_calls/)).

**The consequence.** Voicemails, conference calls, customer-support recordings — anything traversing a vulnerable Asterisk box — could be silently siphoned. Worse, the RTCP path remained vulnerable after the *first* patch: "While RTP packets would no longer re-train to a malicious attacker's source address, RTCP packets could still be stolen using the same packet flooding approach" ([https://www.asterisk.org/rtp-security-vulnerabilities/](https://www.asterisk.org/rtp-security-vulnerabilities/)). RTCP carries SSRCs and sender reports — enough to rebuild key call metadata.

**The resolution.** AST-2017-008 was followed by AST-2017-012 a few weeks later, fixing both the RTCP path and a race condition where attackers could pre-empt latching by sending the very first packet faster than the legitimate peer. The Asterisk team published an unusually candid retrospective ([https://www.asterisk.org/rtp-security-vulnerabilities/](https://www.asterisk.org/rtp-security-vulnerabilities/)) walking through how the incomplete first fix happened and what they changed in their security release process. The deeper lesson — repeated in podcast tone: *Don't do `nat=yes` without `srtp`. Authentication isn't optional once your protocol talks to the open Internet.* The same principle drove Zoom from AES-ECB to AES-GCM in 2020, and SFrame to publication as RFC 9605 in 2024. Every generation of real-time media has to relearn that latency-friendly does not mean trust-friendly.

---

*End of report. Draft and RFC numbers are current as of May 5, 2026; the RTP-over-QUIC and Media-over-QUIC documents are still drafts and may be assigned final RFC numbers shortly thereafter. Speculative claims about post-RFC adoption (especially the OpenMOQ consortium and vendor "production" MoQ deployments) come from vendor-published sources and should be treated as marketing-adjacent until corroborated by post-deployment engineering write-ups.*