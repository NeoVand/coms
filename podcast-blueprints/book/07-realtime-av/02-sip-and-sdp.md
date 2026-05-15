---
id: realtime-av/sip-and-sdp
type: chapter
part_id: realtime-av
part_label: VIII
part_title: Real-time A/V
title: SIP and SDP
synopsis: Henning Schulzrinne wrote three protocols that carry the world's phone calls.
podcast_target_minutes: 15
position_in_book: chapter 52 of 75
listening_order:
  prev: realtime-av/webrtc
  next: realtime-av/hls-and-dash
related_protocols: [tls, sip, http1, sdp, rtp, webrtc]
related_pioneers: [henning-schulzrinne, van-jacobson]
related_outages: [att-mobility-2024]
related_frontier: []
related_rfcs: [5630, 2543, 3261, 2327, 8866]
images: []
visual_cues:
  - "A SIP INVITE rendered as plain text, side-by-side with an HTTP GET, with INVITE, ACK, BYE, and REGISTER highlighted as the verbs."
  - "An SDP body with v=0, o=, m=audio, and a=rtpmap lines called out — labelled as the offer and answer that two endpoints exchange before any RTP flows."
  - "A timeline from RFC 2327 in April 1998, RFC 2543 in March 1999, RFC 3261 in June 2002, RFC 5630 in 2009, and RFC 8866 in January 2021."
  - "Two callers reading a four-character Short Authentication String aloud over a ZRTP-secured channel, with a MITM attacker shown failing because the strings would not match."
  - "A US map with 25,000 failed 911 calls and 125 million disconnected devices, captioned 22 February 2024 — AT&T Mobility protect mode."
---

# Part VIII, Chapter — SIP and SDP

## The hook

The padlock icon trained a generation of engineers to think `sips:` is the secure version of `sip:`. It is not. RFC 5630, published in 2009, says the `sips:` URI scheme means TLS hop by hop only, never end to end like `https:`. Forty years into the VoIP era, this is still where engineers get burned. This is the chapter on the two protocols that make phone calls happen — and on the one professor who wrote nearly all of them.

## The story

### The Phone Call as an HTTP Conversation

When you place a VoIP call, two protocols work in tandem before any audio flows. SIP, the Session Initiation Protocol, is the signalling layer. It is text based. It is request and response. It is shaped like HTTP, with verbs called INVITE, ACK, BYE, and REGISTER. SIP locates the callee through registration servers and proxies that resolve a URI like `sip:alice@example.com`. It negotiates capability. It sets up the session. It tears the session down. The actual audio and video — that is the RTP episode and, on the secure side, the WebRTC episode.

SIP, SDP, and RTP above them were all authored by Henning Schulzrinne, a Columbia University professor who has authored more than 70 RFCs, served as Chief Technology Officer of the FCC three separate times, and was inducted into the Internet Hall of Fame in 2013. He gets his own pioneer episode.

The first standard for SIP was RFC 2543, published in March 1999. It was completely rewritten as RFC 3261 in June 2002 by Rosenberg, Schulzrinne, Camarillo, Johnston, Peterson, Sparks, Handley, and Schooler. Twenty four years later, RFC 3261 is still the canonical text. The HTTP-shaped design, drawn from the HTTP/1.1 episode, is a direct reason SIP beat the ITU's H.323 alternative — engineers could read the messages and debug them with the tools they already had.

### SDP — Session Description From the MBone

SDP, the Session Description Protocol, carries the actual session parameters inside SIP messages. Which codecs each side supports. Which ports they will use for RTP. Which crypto keys they propose. SDP began life inside Mark Handley and Van Jacobson's MBone work for a session-directory tool called `sdr`. Van Jacobson is the one who saved the internet from congestion collapse in 1986 — that story is its own pioneer episode.

RFC 2327, by Handley and Jacobson in April 1998, was SDP's first Proposed Standard. RFC 4566 followed in 2006. The current text is RFC 8866, published in January 2021. Twenty eight years on, the protocol-version line at the top of every SDP body is still `v=0`.

The pattern that SDP introduced — one side offers their capability, the other answers with the subset they accept — became the standard offer/answer model for media negotiation everywhere, including the WebRTC episode.

### The 911 Outages Keep Happening

There is a callout in this chapter that lands hard. The AT&T Mobility outage of 22 February 2024 disconnected 125 million devices and blocked roughly 25,000 calls to 911. The trigger was a single misconfigured network element during a network expansion. The failure surfaced as IMS and SIP registration failures across the mobility core. We cover the full incident in the Famous Outages part of the book.

It was not the first. The CenturyLink outage of December 2018 lost 911 service for 7.4 million Washington residents for 49 hours. 24,000 calls failed. Washington's Utilities and Transportation Commission fined the company 7.2 million dollars.

These keep happening because VoLTE and VoNR — voice over LTE and voice over 5G New Radio — are now the world's largest SIP deployment. The GSMA reports more than 310 VoLTE operators across more than 140 countries, plus more than 45 commercial VoNR networks by 2025. When SIP registration fails in the mobility core, emergency calling fails with it.

### STIR/SHAKEN — The Robocall Cold War

STIR/SHAKEN is the protocol family that lets carriers cryptographically attest that a caller ID is real. It is the long-running attempt to fix robocalls. It is not new. STIR was published as RFC 8224 in 2018. SHAKEN was framework-level guidance from the SIP Forum and ATIS in 2017.

The 2024-to-2026 milestone is the FCC Eighth Report and Order, adopted on 21 November 2024 and taking effect on 18 September 2025. U.S. obligated providers must now sign with their own SPC certificates rather than borrow a third party's.

The reality check from TNS's 2026 report is mixed. About 85% of inter-Tier-1 traffic is now STIR/SHAKEN signed, with 93% at the strongest A-level attestation. But only 17.5% of traffic between smaller carriers is signed. U.S. robocalls dropped only about 1% year over year in 2025. STIR/SHAKEN is a partial solve. The long tail of small carriers is still the loophole.

### The Asterisk and ZRTP Footnotes

Two pieces of SIP folklore worth keeping.

The first is Asterisk. In 1999, Mark Spencer was quoted more than 50,000 dollars for a PBX for his Linux-support startup. Instead of paying, he wrote one himself in a few months and named it after the asterisk key on a phone keypad. Asterisk is now deployed more than ten million times worldwide and is the dominant open-source PBX.

The second is ZRTP, specified in RFC 6189. It is the only protocol named for its inventor — Phil "Z" Zimmermann, the same Phil Zimmermann who wrote PGP. The clever piece is the Short Authentication Strings. Two callers read the same four-digit hash aloud to each other. If the hashes match, the channel is authenticated against a man-in-the-middle. ZRTP is still the standard against which other end-to-end voice security schemes are measured.

The cryptography around SIP is slowly tightening. RFC 8760, published in March 2020, finally deprecated MD5 in SIP digest authentication in favour of SHA-256 and SHA-512-256. But PJSIP and Asterisk only added SHA-256 outbound support in 2023 and 2024. So most real deployments still negotiate MD5 in the clear. The protocol is modern. The deployed installed base is two decades behind it.

## The figures

### Henning Schulzrinne

Born in 1959. A Columbia University professor since 1996. Author or co-author of essentially every protocol that carries real-time interactive media on the internet — RTP and RTCP in RFC 3550 in 2003, with the original RFC 1889 in 1996; RTSP in RFC 2326 in 1998 and the updated RFC 7826 in 2016; SIP in RFC 3261 in 2002; SDP in RFC 4566 in 2006. More than 70 RFCs across two decades. Three turns as Chief Technology Officer of the FCC, in 2012-2014, 2017, and 2024. Internet Hall of Fame in 2013. IEEE Internet Award in 2016. ACM SIGCOMM Award in 2020. He gets his own episode.

### Van Jacobson

Born in 1950. Co-author of RFC 2327, the first SDP spec, with Mark Handley. He shows up in this chapter because of the MBone session-directory work that gave SDP its original use case. He is more famous, of course, for saving the internet from congestion collapse — when throughput between Lawrence Berkeley Lab and UC Berkeley fell from 32 kbps to 40 bps in October 1986, he and Mike Karels published "Congestion Avoidance and Control" at SIGCOMM 88, introducing slow start, AIMD, fast retransmit, and exponential RTO backoff in a single paper. He also wrote traceroute, the BPF inside tcpdump, and co-authored the 2016 BBR paper at Google. The full story is his own episode.

### AT&T Mobility — Nationwide Wireless Down, 22 February 2024

At 02:42 Central time, AT&T pushed a network change with an equipment configuration error. One minute later the mobility core hit its self-protection threshold and entered "protect mode," disconnecting every wireless device. 125 million devices lost service. 92 million voice calls were blocked. 25,000 calls to 911 failed. Recovery took about 12 hours. The full account is in the Famous Outages part of the book.

### RFC 5630 — The Use of the SIPS URI Scheme in SIP

Published in 2009 by F. Audet on the standards track. The document explicitly warns engineers not to read `sips:` as the SIP equivalent of `https:`. The `sips:` scheme means TLS is required hop by hop along the proxy chain, not end to end between the two callers. The padlock-icon intuition from web browsers does not transfer.

### RFC 2543 — SIP: Session Initiation Protocol

Published in March 1999 by Mark Handley, Henning Schulzrinne, Eve Schooler, and Jonathan Rosenberg. The first SIP standard. Now classified as historic, obsoleted by RFC 3261.

### RFC 3261 — SIP: Session Initiation Protocol

Published in June 2002 by Rosenberg and seven co-authors as a proposed standard. A complete rewrite of RFC 2543. Still the canonical SIP text 24 years on.

### RFC 2327 — SDP: Session Description Protocol

Published in April 1998 by Mark Handley and Van Jacobson. SDP's first Proposed Standard, written for the MBone session directory. Now classified as historic, obsoleted by RFC 4566.

### RFC 8866 — SDP: Session Description Protocol

Published in January 2021 by Begen, Kyzivat, Perkins, and Handley as a proposed standard. The current SDP spec. The protocol-version line is still `v=0`.

## What it taught the industry

SIP's HTTP-shaped design is the reason a generation of telecom engineers can debug call signalling with the same toolkit web developers use. SDP's offer/answer model became the default pattern for media negotiation across the industry, and it is what WebRTC reuses inside the browser. And the long tail of unsigned small-carrier traffic, the deployed MD5 base, and the recurring 911 outages together teach the harder lesson — when a protocol is the substrate of emergency calling for hundreds of millions of people, the deployed installed base, not the latest RFC, is what determines whether the next call connects.

## Listening order

- **Before this chapter:** "WebRTC" — the browser's bundle of ICE, DTLS, SRTP, and SCTP that uses SDP offer/answer to set up peer-to-peer media.
- **After this chapter:** "HLS and DASH" — the HTTP-based streaming side of real-time A/V, where the rules change because it is no longer a two-way call.

## Where to go deeper

- The SIP episode picks up the mechanism story — the INVITE/ACK/BYE state machine, proxies and registrars, and the dialog model.
- The SDP episode covers the offer/answer wire format end to end — `v=`, `o=`, `m=`, and the modern attribute extensions for ICE, DTLS fingerprints, simulcast, and codec parameters.
- The RTP episode explains how the actual media flows — sequence numbers, timestamps, payload types, and RTCP feedback.
- The WebRTC episode shows how SIP's signalling cousin and SDP's offer/answer model both end up running inside the browser.
- The TLS episode explains what the `sips:` scheme is actually buying you — and what it is not.
- The HTTP/1.1 episode shows the protocol shape SIP borrowed and why text-on-the-wire was a deliberate design choice.

## Visual cues for image generation

- A SIP INVITE rendered as plain text, side-by-side with an HTTP GET, with INVITE, ACK, BYE, and REGISTER highlighted as the verbs.
- An SDP body with v=0, o=, m=audio, and a=rtpmap lines called out — labelled as the offer and answer that two endpoints exchange before any RTP flows.
- A timeline from RFC 2327 in April 1998, RFC 2543 in March 1999, RFC 3261 in June 2002, RFC 5630 in 2009, and RFC 8866 in January 2021.
- Two callers reading a four-character Short Authentication String aloud over a ZRTP-secured channel, with a MITM attacker shown failing because the strings would not match.
- A US map with 25,000 failed 911 calls and 125 million disconnected devices, captioned 22 February 2024 — AT&T Mobility protect mode.

## Sources

- [FCC — February 22, 2024 AT&T Mobility Network Outage Report](https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf)
- [AT&T — Network Update](https://about.att.com/pages/network-update)
- [RFC 5630 — The Use of the SIPS URI Scheme in SIP](https://www.rfc-editor.org/rfc/rfc5630)
- [RFC 2543 — SIP: Session Initiation Protocol](https://www.rfc-editor.org/rfc/rfc2543)
- [RFC 3261 — SIP: Session Initiation Protocol](https://www.rfc-editor.org/rfc/rfc3261)
- [RFC 2327 — SDP: Session Description Protocol](https://www.rfc-editor.org/rfc/rfc2327)
- [RFC 8866 — SDP: Session Description Protocol](https://www.rfc-editor.org/rfc/rfc8866)
- [Henning Schulzrinne — Wikipedia](https://en.wikipedia.org/wiki/Henning_Schulzrinne)
- [Van Jacobson — Wikipedia](https://en.wikipedia.org/wiki/Van_Jacobson)
