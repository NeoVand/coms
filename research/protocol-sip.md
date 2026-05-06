---
prompt_source: deep-research-prompts.txt:6469-6649 (SIP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/5af55929-7a14-494a-91ce-4fe21d90b0c5
research_mode: claude.ai Research
---

# The Session Initiation Protocol (SIP): A Deep, Citation-Backed Field Guide (May 2026)

## TL;DR

- **SIP is the open, text-based "dial tone of the IP world"**: it sets up, modifies, and tears down real-time multimedia sessions (voice, video, messaging) but does *not* carry the media itself; that job belongs to RTP/SRTP, with SDP doing the negotiation. The canonical specification remains RFC 3261 (June 2002), updated by dozens of later RFCs but never replaced. ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261)) [Google Translate](https://translate.google.com/translate?u=https%3A%2F%2Fdatatracker.ietf.org%2Fdoc%2Fhtml%2Frfc3261&hl=es&sl=en&tl=es&client=srp)
- **SIP "won" enterprise and carrier voice but lost the consumer**: It is the signaling backbone of every VoLTE/VoNR mobile call (310+ operators in 140+ countries for VoLTE; 45+ for VoNR as of 2025) and of virtually all SIP-trunk and Microsoft-Teams Direct-Routing deployments — yet WhatsApp, FaceTime, Zoom, and Teams-internal media use proprietary or WebRTC-based stacks instead. ([https://www.5g6gacademy.com/learn/sip-volte-vonr](https://www.5g6gacademy.com/learn/sip-volte-vonr)) ([https://www.3gpp.org/technologies/volte-vonr](https://www.3gpp.org/technologies/volte-vonr)) [5g6gacademy](https://www.5g6gacademy.com/learn/sip-volte-vonr)
- **The 2024–2026 frontier is authentication, not transport**: STIR/SHAKEN became mandatory for U.S. providers using their *own* certificates by 18 September 2025 (FCC Eighth Report & Order), 85 % of Tier-1 inter-carrier traffic is now signed, robocalls fell only ~1 % YoY in 2025, and active IETF work is on SIP-over-QUIC (expired draft-hurst-sip-quic-00), short-lived STIR certs (draft-ietf-stir-certificates-shortlived-05), and post-quantum TLS for SIPS. ([https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf)) ([https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)) ([https://datatracker.ietf.org/doc/draft-hurst-sip-quic/](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)) [CFCA](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)[GetVoIP](https://getvoip.com/blog/state-of-robocalls/)

---

## Prerequisites and Glossary

Before SIP makes sense you need a working mental model of the layers and primitives it sits on top of. Definitions below are tight; each anchors the rest of the report.

**OSI / TCP-IP layers.** SIP is an *application-layer* signaling protocol (OSI L7). It runs over **transport-layer** protocols — UDP, TCP, TLS-over-TCP, SCTP, and (newly) WebSocket and QUIC. ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261))

- **Datagram** — a self-contained packet that is delivered (or lost) as a unit, with no guarantee of order or delivery; UDP carries datagrams.
- **Stream** — an ordered, reliable sequence of bytes between two endpoints; TCP and TLS provide streams.
- **Frame** — in WebSocket/QUIC, a delimited message unit inside a stream; SIP-over-WebSocket places one SIP message per WebSocket frame. ([https://datatracker.ietf.org/doc/html/rfc7118](https://datatracker.ietf.org/doc/html/rfc7118)) [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/71/rfc7118.xml)
- **Socket** — the OS-level (IP, port) endpoint a program binds to receive datagrams or accept streams.
- **Header / body** — SIP messages are *text-based*, modeled on HTTP/SMTP: a start-line, a block of `Name: value` headers, a blank line, then an optional MIME body (often SDP). ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261))
- **Checksum** — a small integrity-check field; UDP and TCP each carry a 16-bit checksum; SIP itself has none, relying on the transport. [Wikipedia](https://en.wikipedia.org/wiki/QUIC)
- **Handshake** — the initial exchange that establishes a connection or session: TCP's 3-way SYN/SYN-ACK/ACK, TLS's certificate/key exchange, the SIP INVITE/200/ACK 3-way, the WebSocket HTTP-Upgrade. ([https://datatracker.ietf.org/doc/html/rfc7118](https://datatracker.ietf.org/doc/html/rfc7118))

**Encoding.**

- **ASCII text-based protocol** — like HTTP, SIP messages are human-readable UTF-8/ASCII, not binary. This is the deliberate choice that earned the H.323-vs-SIP "protocol war" for SIP. ([https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP)) [SANS](https://isc.sans.edu/diary/7405)[TechTarget](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP)
- **MIME (Multipurpose Internet Mail Extensions)** — the framing for typed message bodies; SIP carries SDP as `Content-Type: application/sdp`, and can carry multipart bodies, ISUP encapsulations (SIP-T/SIP-I), etc. [SANS](https://isc.sans.edu/diary/7405)

**Cryptographic primitives.**

- **TLS (Transport Layer Security)** — provides confidentiality, integrity, and server authentication for SIP over TCP, addressed by the `sips:` URI scheme on default port 5061. ([https://www.rfc-editor.org/rfc/rfc5630.html](https://www.rfc-editor.org/rfc/rfc5630.html))
- **S/MIME** — message-level signing/encryption of SIP bodies; defined but rarely deployed.
- **Digest authentication** — challenge/response using a hash; originally MD5, now SHA-256 / SHA-512-256 per RFC 8760 (2020). ([https://datatracker.ietf.org/doc/html/rfc8760](https://datatracker.ietf.org/doc/html/rfc8760)) [RFC Editor](https://www.rfc-editor.org/info/rfc8760)
- **SRTP / DTLS-SRTP / ZRTP / MIKEY / SDES** — competing ways to derive keys for encrypting the *media*, not the signaling.

**SIP subfield vocabulary** (each used heavily below):

- **User Agent (UA)** — any SIP endpoint; further split into **UAC** (client, sends requests) and **UAS** (server, responds). A single softphone is normally both. [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC3261)
- **Proxy** — stateless or stateful router of SIP requests; does not terminate dialogs.
- **Registrar** — accepts REGISTER requests and records the binding `AOR → contact URI`.
- **Redirect Server** — replies 3xx with new location instead of forwarding.
- **B2BUA (Back-to-Back User Agent)** — splits a session into two half-calls; SBCs and Asterisk operate as B2BUAs. ([https://www.oracle.com/a/ocom/docs/industries/communications/communications-session-border-controller-ds.pdf](https://www.oracle.com/a/ocom/docs/industries/communications/communications-session-border-controller-ds.pdf)) [Teufelnet](https://www.teufelnet.ch/uploads/pdf/oracle/acme_oracle_sbc.pdf)
- **Dialog** — long-lived peer-to-peer relationship identified by `Call-ID + From-tag + To-tag`.
- **Transaction** — one request and all its responses (matched by branch parameter).
- **SDP offer/answer** (RFC 3264, updated by RFC 8866 in 2021) — the way two endpoints negotiate codecs, IP addresses, and ports for media. ([https://datatracker.ietf.org/doc/rfc8866/](https://datatracker.ietf.org/doc/rfc8866/))
- **Codec** — encoder/decoder for media (G.711, Opus, AMR-WB, EVS, H.264, VP8…).
- **Jitter buffer** — small playout buffer that absorbs packet-arrival timing variance in RTP.
- **NAT traversal** — SIP carries IP addresses *inside* its text payload; private IPs that survive NAT translation cause one-way audio. STUN/TURN/ICE and SBCs solve this.
- **SBC (Session Border Controller)** — a B2BUA at the network edge that secures, normalizes, transcodes, and meters SIP/RTP traffic; major vendors are Oracle (Acme Packet), Ribbon (Sonus), AudioCodes. ([https://www.oracle.com/communications/signaling-security/session-border-controller/](https://www.oracle.com/communications/signaling-security/session-border-controller/))

---

## History and Story

**Origins (1996–1999).** SIP was designed by Mark Handley (then UCL/ICIR), Henning Schulzrinne (Columbia), Eve Schooler, and Jonathan Rosenberg starting in 1996 inside the IETF MMUSIC (Multiparty Multimedia Session Control) working group, with the goal of an Internet-native call-setup protocol. Schulzrinne also co-designed RTP and RTSP, making him author of three of the IETF's flagship multimedia protocols. ([https://en.wikipedia.org/wiki/Henning_Schulzrinne](https://en.wikipedia.org/wiki/Henning_Schulzrinne)) ([https://magazine.engineering.columbia.edu/faculty/henning-schulzrinne](https://magazine.engineering.columbia.edu/faculty/henning-schulzrinne))

The first standard, **RFC 2543**, appeared in March 1999. It was completely rewritten as **RFC 3261** in June 2002 (Rosenberg, Schulzrinne, Camarillo, Johnston, Peterson, Sparks, Handley, Schooler) — still the canonical text. ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261)) [Tech Invite](https://www.tech-invite.com/y30/tinv-ietf-rfc-3261.html)[Google Translate](https://translate.google.com/translate?u=https%3A%2F%2Fdatatracker.ietf.org%2Fdoc%2Fhtml%2Frfc3261&hl=es&sl=en&tl=es&client=srp)

**Major extensions (chronological highlights).**

- RFC 3262 (PRACK, reliability of provisional responses), RFC 3263 (locating SIP servers via DNS NAPTR/SRV), RFC 3264 (offer/answer model), RFC 3265 (event package framework — SUBSCRIBE/NOTIFY).
- RFC 6665 (2012) obsoleted 3265 to fix multi-year implementation experience. ([https://datatracker.ietf.org/doc/html/rfc6665](https://datatracker.ietf.org/doc/html/rfc6665)) [ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/RFC6665)
- RFC 5626 (2009) "Outbound" — persistent client-initiated TCP/TLS flows for NAT/firewall traversal. ([https://datatracker.ietf.org/doc/html/rfc5626](https://datatracker.ietf.org/doc/html/rfc5626)) [Ietf](https://mailarchive.ietf.org/arch/msg/sip/pH4ERNSWLZk-6HX_LBFoCmmqz9o/)[Mobius-software](https://www.mobius-software.com/documentation/Mobius+SIP/Core+SIP+Protocol)
- RFC 5630 (2009) — clarifies the SIPS URI scheme and deprecates the "last-hop exception". ([https://www.rfc-editor.org/rfc/rfc5630.html](https://www.rfc-editor.org/rfc/rfc5630.html)) [Hjp + 2](https://www.hjp.at/doc/rfc/rfc5630.html)
- RFC 6157 (2011) — IPv4↔IPv6 transition for SIP. ([https://datatracker.ietf.org/doc/html/rfc6157](https://datatracker.ietf.org/doc/html/rfc6157)) [RFC Editor](https://www.rfc-editor.org/info/rfc6157)
- RFC 7118 (2014) — WebSocket transport; introduces `ws` and `wss` Via transports, the basis for browser-side SIP via SIP.js / JsSIP. ([https://datatracker.ietf.org/doc/html/rfc7118](https://datatracker.ietf.org/doc/html/rfc7118)) [IETF](https://datatracker.ietf.org/doc/html/rfc7118)
- RFC 8224, 8225, 8226, 8588 (2018–2019) — STIR/SHAKEN identity (PASSporT JWT, Identity header). ([https://datatracker.ietf.org/doc/html/rfc8224](https://datatracker.ietf.org/doc/html/rfc8224)) [IETF](https://www.ietf.org/rfc/rfc8224.html)
- **RFC 8760 (March 2020)** — replaces the obsolete MD5 default in SIP digest with SHA-256 / SHA-512-256. ([https://datatracker.ietf.org/doc/html/rfc8760](https://datatracker.ietf.org/doc/html/rfc8760)) [Mobius-software](https://www.mobius-software.com/documentation/Mobius+SIP/Core+SIP+Protocol)[RFC Editor](https://www.rfc-editor.org/info/rfc8760)
- **RFC 8866 (Jan 2021)** — re-issues SDP, obsoleting RFC 4566. ([https://datatracker.ietf.org/doc/rfc8866/](https://datatracker.ietf.org/doc/rfc8866/)) [IETF](https://datatracker.ietf.org/doc/rfc8866/)
- **RFC 8898 (Sep 2020)** — adds OAuth 2.0 / OpenID Connect "Bearer" auth to SIP, opening the door to single-sign-on. ([https://datatracker.ietf.org/doc/rfc8898/](https://datatracker.ietf.org/doc/rfc8898/)) [Hjp](https://www.hjp.at/doc/rfc/rfc8898.html)

**The H.323 vs. SIP "protocol war."** Both protocols were drafted in 1996 — H.323 by ITU-T (binary, ASN.1 PER, descended from H.320 ISDN videoconferencing) and SIP by IETF (text, HTTP/SMTP-style). H.323 dominated early carrier-to-carrier VoIP and video and is *still* deployed in legacy fleets, but SIP's flexibility, simpler firewall story (especially with later Outbound and ICE), and IETF extensibility ecosystem won the long war: by the mid-2000s Cisco, Microsoft, and Avaya were all SIP-first, and 3GPP picked SIP as the IMS signaling protocol. ([https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP)) [Wordpress](https://andrewjprokop.wordpress.com/2013/08/14/sip-vs-h-323/)[TechTarget](https://www.techtarget.com/searchunifiedcommunications/answer/Differences-between-H323-and-SIP)

**But SIP lost the consumer.** Skype (2003), WhatsApp, FaceTime, Zoom, and Discord all use proprietary or WebRTC-based protocols. Microsoft Lync/Skype-for-Business spoke SIP but Teams replaced that with proprietary cloud signaling — keeping SIP only on the *trunk* (Direct Routing) edge. ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols-sip](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols-sip))

**Adoption arcs.** Enterprise IP-PBX wave 2003–2010 (Asterisk, Cisco CallManager, Avaya Aura). 3GPP IMS standardization mid-2000s. VoLTE general rollout from ~2014; by 2025 GSMA reported 310+ VoLTE operators in 140+ countries and 45+ commercial VoNR networks. ([https://www.5g6gacademy.com/learn/sip-volte-vonr](https://www.5g6gacademy.com/learn/sip-volte-vonr)) ([https://www.3gpp.org/technologies/volte-vonr](https://www.3gpp.org/technologies/volte-vonr))

**Last 24 months (May 2024 → May 2026): what's actually new.**

- **STIR/SHAKEN tightening (US):** FCC Eighth Report & Order adopted 21 Nov 2024 took effect 18 Sep 2025, requiring obligated providers to sign with *their own* SPC tokens/certificates, even when using third-party signing services. ([https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf)) [Lerman Senter](https://www.lermansenter.com/stir-shaken-requirements-effective-september-18/)[FCC](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf)
- **Bureau enforcement:** The FCC Wireline Competition Bureau notified 2,400+ providers of RMD deficiencies in December 2024, and removed two batches of non-compliant providers in August 2025. ([https://www.mintz.com/insights-center/viewpoints/2776/2025-08-28-telephone-and-texting-compliance-news-regulatory-update](https://www.mintz.com/insights-center/viewpoints/2776/2025-08-28-telephone-and-texting-compliance-news-regulatory-update))
- **Signing breadth and depth:** TNS's 2026 report finds 85 % of inter-Tier-1 traffic now STIR/SHAKEN-signed (93 % at A-level), but only 17.5 % of traffic between smaller carriers; up to 13 % of "invalid" numbers were still signed with A attestation in 2025 — STIR/SHAKEN reduces but does not eliminate spoofing. ([https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/))
- **Robocall reality check:** Robocalls dropped only ~1 % from 2024 to 2025 in the U.S.; AI-generated robocalls were ruled illegal absent prior consent. ([https://getvoip.com/blog/state-of-robocalls/](https://getvoip.com/blog/state-of-robocalls/))
- **Closing the non-IP gap:** FCC published a Fact Sheet (April 2025) proposing a definition for an "effective" non-IP caller-ID authentication framework. ([https://docs.fcc.gov/public/attachments/DOC-410645A1.pdf](https://docs.fcc.gov/public/attachments/DOC-410645A1.pdf)) [FCC](https://docs.fcc.gov/public/attachments/DOC-410645A1.pdf)
- **STIR working group output (2025–2026):** Out-of-Band STIR for service providers (draft-ietf-stir-servprovider-oob-08), short-lived STIR certificates (draft-ietf-stir-certificates-shortlived-05, April 2026), OCSP usage for STIR certs (draft-ietf-stir-certificates-ocsp-12, Nov 2025). ([https://datatracker.ietf.org/doc/draft-ietf-stir-servprovider-oob/](https://datatracker.ietf.org/doc/draft-ietf-stir-servprovider-oob/)) ([https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-shortlived/](https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-shortlived/)) ([https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-ocsp/](https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-ocsp/)) [IETF + 2](https://datatracker.ietf.org/doc/draft-ietf-stir-servprovider-oob/)
- **SIP-over-QUIC:** the individual draft `draft-hurst-sip-quic-00` proposes mapping SIP to QUIC streams with header compression; it has expired, indicating early-stage rather than imminent deployment. ([https://datatracker.ietf.org/doc/draft-hurst-sip-quic/](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)) [IETF](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)
- **Active SIPCORE work:** `draft-ietf-sipcore-rfc7976bis-03` (P-Header updates for IMS, July 2025), `draft-ietf-sipcore-siprec-fix-mediatype-06` (May 2025), and a notable individual draft `draft-howe-sipcore-mcp-extension-00` (Sep 2025) attempting to carry the Model Context Protocol (MCP, the AI-agent context standard) over SIP. ([https://datatracker.ietf.org/doc/draft-ietf-sipcore-rfc7976bis/](https://datatracker.ietf.org/doc/draft-ietf-sipcore-rfc7976bis/)) ([https://datatracker.ietf.org/doc/html/draft-howe-sipcore-mcp-extension-00](https://datatracker.ietf.org/doc/html/draft-howe-sipcore-mcp-extension-00)) [IETF](https://datatracker.ietf.org/doc/draft-ietf-sipcore-rfc7976bis/)[IETF](https://datatracker.ietf.org/doc/draft-ietf-sipcore-siprec-fix-mediatype/)
- **Kamailio CVEs (April 2026):** CVE-2026-39863 (TCP data processing, high) and CVE-2026-39864 (auth identity-check, moderate). ([https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/)) [Kamailio](https://kamailio.org/mailman3/hyperkitty/list/sr-users@lists.kamailio.org/thread/UJIXKISO7LTSRAN34Q3ISDGYWHLDZOBW/)
- **Microsoft Teams Direct Routing CA changes:** mandatory mTLS cert-authority migration through 2025 and into 2026 affecting every SBC connecting Teams to PSTN. ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new))

---

## How It Actually Works

### Message format

SIP messages are text. A request is:

```
INVITE sip:bob@biloxi.example.com SIP/2.0
Via: SIP/2.0/UDP pc33.atlanta.example.com;branch=z9hG4bK776asdhds
Max-Forwards: 70
To: Bob <sip:bob@biloxi.example.com>
From: Alice <sip:alice@atlanta.example.com>;tag=1928301774
Call-ID: a84b4c76e66710@pc33.atlanta.example.com
CSeq: 314159 INVITE
Contact: <sip:alice@pc33.atlanta.example.com>
Content-Type: application/sdp
Content-Length: 142

v=0
o=alice 53655765 2353687637 IN IP4 pc33.atlanta.example.com
s=-
c=IN IP4 pc33.atlanta.example.com
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000
```

(adapted from the canonical example in RFC 3261 §24, [https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261))

A response replaces the request line with a *Status-Line* (`SIP/2.0 200 OK`) but keeps the same header structure.

### Methods

- **INVITE** — start a session; **ACK** — confirm final response to INVITE; **BYE** — terminate; **CANCEL** — abort a pending INVITE; **REGISTER** — bind AOR to contact URI; **OPTIONS** — capability/keep-alive query; **MESSAGE** — page-mode IM (RFC 3428); **INFO** — mid-dialog application info (RFC 6086); **REFER** — request transfer (RFC 3515); **SUBSCRIBE / NOTIFY** — events (RFC 6665); **UPDATE** — modify session before final answer (RFC 3311); **PRACK** — provisional ACK (RFC 3262); **PUBLISH** — event-state publication (RFC 3903). ([https://datatracker.ietf.org/doc/html/rfc6665](https://datatracker.ietf.org/doc/html/rfc6665)) [Tech Invite](https://www.tech-invite.com/y65/tinv-ietf-rfc-6665-4.html)

### Response classes

- **1xx provisional** (100 Trying, 180 Ringing, 183 Session Progress)
- **2xx success** (200 OK, 202 Accepted)
- **3xx redirect** (301, 302, 305)
- **4xx client error** (401, 403, 404, 407, 408, 480, 486 Busy Here, 487 Request Terminated)
- **5xx server error** (500, 503 Service Unavailable)
- **6xx global failure** (600, 603, 604, 606)

Bit-widths are not applicable: SIP is text. What each header *does*:

| Header | Purpose |
|---|---|
| `Via` | Records the path; carries the **branch** parameter (z9hG4bK… magic cookie) used to match transactions and detect loops. |
| `From` / `To` | Logical originator and target; both carry **tags** that combine with `Call-ID` to identify a dialog. |
| `Call-ID` | Globally unique identifier for the call. |
| `CSeq` | Sequence number + method, ensures request ordering. |
| `Contact` | The actual reachable URI of the UA (typically with the routable IP/port). |
| `Max-Forwards` | TTL-like loop-prevention counter (default 70). |
| `Content-Length` / `Content-Type` | Body framing and MIME type (usually `application/sdp`). |
| `Route` / `Record-Route` | Forces requests inside a dialog through specific proxies (loose routing). |
| `Authorization` / `WWW-Authenticate` / `Proxy-Authenticate` | Digest or Bearer auth challenge/response. |
| `Allow` / `Supported` / `Require` / `Unsupported` | Capability negotiation (option-tags). |
| `Expires` | Registration or subscription lifetime. |
| `Identity` | STIR PASSporT carrier (RFC 8224). |

### Transactions, dialogs, sessions

- A **transaction** is a request + its responses; matched by the *top* `Via` `branch`.
- A **dialog** spans many transactions and is identified by `Call-ID` + From-tag + To-tag.
- A **session** is the *media* relationship described by SDP — orthogonal to dialog state.

### State machines (RFC 3261 §17)

- **INVITE client transaction:** Calling → Proceeding → Completed → Terminated.
- **INVITE server transaction:** Proceeding → Completed → Confirmed → Terminated.
- **Non-INVITE client transaction:** Trying → Proceeding → Completed → Terminated.
- **Dialog state:** Early (after 1xx-with-tag) → Confirmed (after 2xx) → Terminated.

Default timer values: **T1 = 500 ms** (RTT estimate), **T2 = 4 s** (max retransmit interval for non-INVITE), **T4 = 5 s**, **Timer B = 64*T1 = 32 s** (INVITE timeout), **Timer F = 64*T1** (non-INVITE timeout). ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261))

### Routing

RFC 3261 deprecated *strict routing* (rewriting Request-URI) in favor of **loose routing**: proxies that want to stay in the path insert `Record-Route` headers, which the UAs replay as `Route` headers in subsequent requests. Loose-routing proxies are identified by the `;lr` URI parameter. ([https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261))

### Security

- **Digest auth** — challenge-response per RFC 3261 §22, modernized by RFC 8760 to default to SHA-256 / SHA-512-256. MD5 is still ubiquitous because both ends must agree, and PJSIP/Asterisk only added SHA-256 support in 2023–2024 — meaning many real deployments are still MD5. ([https://www.asterisk.org/opensipit01-rfc-8760-interoperability/](https://www.asterisk.org/opensipit01-rfc-8760-interoperability/)) [Asterisk](https://www.asterisk.org/opensipit01-rfc-8760-interoperability/)
- **TLS / SIPS URI** — RFC 5630 specifies that a `sips:` Request-URI requires TLS on every hop until the destination domain. Default port 5061 TCP. ([https://www.rfc-editor.org/rfc/rfc5630.html](https://www.rfc-editor.org/rfc/rfc5630.html)) [IETF](https://datatracker.ietf.org/doc/html/rfc5630)[Mobius-software](https://www.mobius-software.com/documentation/Mobius+SIP/Core+SIP+Protocol)
- **Media security** — separate from signaling; SDES (RFC 4568) carries SRTP keys in SDP, DTLS-SRTP performs in-band DTLS handshake on the media port (mandatory for WebRTC), ZRTP (RFC 6189) does Diffie-Hellman in the RTP stream itself, MIKEY (RFC 3830) is mostly used in IMS. ([https://datatracker.ietf.org/doc/rfc6189/](https://datatracker.ietf.org/doc/rfc6189/)) [Wikipedia](https://en.wikipedia.org/wiki/ZRTP)

### NAT traversal

Because SIP carries IP/port literals inside `Via`, `Contact`, and SDP `c=`/`m=` lines, NAT silently breaks media: signaling reaches the proxy, but RTP can't return to the rewritten public address. Standard fixes:

- **STUN** (Session Traversal Utilities for NAT) — discover external mapping.
- **TURN** — relay media through a server when symmetric NAT defeats STUN.
- **ICE** — try every candidate; pick what works.
- **SBCs** — terminate signaling and media, normalize headers, anchor RTP at a public address.

### A real INVITE/200/ACK/BYE flow with proxy

Bob (UAS)Proxy (atlanta.example.com)Alice (UAC)Bob (UAS)Proxy (atlanta.example.com)Alice (UAC)#mermaid-rc5{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rc5 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rc5 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rc5 .error-icon{fill:#CC785C;}#mermaid-rc5 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rc5 .edge-thickness-normal{stroke-width:1px;}#mermaid-rc5 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rc5 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rc5 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rc5 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rc5 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rc5 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rc5 .marker.cross{stroke:#A1A1A1;}#mermaid-rc5 svg{font-family:inherit;font-size:16px;}#mermaid-rc5 p{margin:0;}#mermaid-rc5 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .actor-line{stroke:#A1A1A1;}#mermaid-rc5 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rc5 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rc5 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rc5 .sequenceNumber{fill:#5e5e5e;}#mermaid-rc5 #sequencenumber{fill:#E5E5E5;}#mermaid-rc5 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rc5 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 .labelText,#mermaid-rc5 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .loopText,#mermaid-rc5 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rc5 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rc5 .noteText,#mermaid-rc5 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rc5 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rc5 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rc5 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rc5 .actorPopupMenu{position:absolute;}#mermaid-rc5 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rc5 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rc5 .actor-man circle,#mermaid-rc5 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rc5 :root{--mermaid-font-family:inherit;}RTP media flows directly (or via SBC)INVITE sip:bob@biloxi (SDP offer)100 TryingINVITE (Record-Route added)180 Ringing180 Ringing200 OK (SDP answer)200 OKACKACKBYEBYE200 OK200 OK

### The 3-step REGISTER flow (digest)

1. UA sends `REGISTER` with no credentials.
2. Registrar replies `401 Unauthorized` with `WWW-Authenticate: Digest realm="…", nonce="…", algorithm=SHA-256, qop=auth`.
3. UA recomputes hash of `username:realm:password`, `method:URI`, and nonce; resends REGISTER with `Authorization` header → `200 OK` with bound `Contact`. ([https://datatracker.ietf.org/doc/html/rfc8760](https://datatracker.ietf.org/doc/html/rfc8760))

---

## Deep Connections to Other Protocols

**UDP (RFC 768)** — historical default transport on port 5060; packets up to ~1300 bytes (RFC 3261's threshold) to avoid IP fragmentation. Loss of provisional responses is tolerated; loss of 200/ACK is recovered by retransmissions.

**TCP** — used when message size > MTU-derived threshold; RFC 3261 mandates TCP support. Connection state allows persistent flows for large-scale presence/IM.

**TLS / SIPS** — TCP-based, port 5061; RFC 5630 is the definitive guidance on the URI scheme. Modern deployments increasingly *require* TLS (Microsoft Teams Direct Routing mandates mTLS to certified SBCs). ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new))

**WebSocket (RFC 6455) — RFC 7118 SIP subprotocol** — SIP messages transported as WebSocket text/binary frames over TCP/443 (or TLS/443) with HTTP Upgrade handshake; via transports `WS`/`WSS`. Foundation for browser SIP libraries (SIP.js, JsSIP, sipML5). Because WebSocket preserves message boundaries, `Content-Length` is logically redundant. ([https://datatracker.ietf.org/doc/html/rfc7118](https://datatracker.ietf.org/doc/html/rfc7118)) [IETF](https://datatracker.ietf.org/doc/html/rfc7118)[Liu](https://pike.lysator.liu.se/docs/ietf/rfc/71/rfc7118.xml)

**QUIC (RFC 9000)** — `draft-hurst-sip-quic-00` defines `sips/quic` ALPN, allowing multiple SIP transactions over one QUIC connection with field compression. Status: expired individual draft as of 2025 — interesting, not yet standard. ([https://datatracker.ietf.org/doc/draft-hurst-sip-quic/](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)) [IETF](https://www.ietf.org/archive/id/draft-hurst-sip-quic-00.html)

**RTP (RFC 3550)** and **RTCP** — carry the actual media negotiated by SDP. RTP uses dynamic UDP ports (or DTLS frames in WebRTC); RTCP carries sender/receiver reports for QoS. RTP and SIP travel in entirely separate paths.

**SDP (RFC 8866, 2021)** — describes media (codecs, addresses, ports, attributes); RFC 3264 defines the SIP offer/answer model. SDP is *also* used by WebRTC and RTSP. ([https://datatracker.ietf.org/doc/rfc8866/](https://datatracker.ietf.org/doc/rfc8866/)) [IETF](https://datatracker.ietf.org/doc/rfc8866/)

**WebRTC** — uses SDP and ICE/STUN/TURN/DTLS-SRTP exactly like SIP-with-ICE, but its signaling layer is *not* defined; SIP-over-WebSocket is the most common bridge. WebRTC always uses DTLS-SRTP for keying; classic SIP usually uses SDES (in-SDP keys) — a key compatibility mismatch.

**H.323** — ITU rival; binary ASN.1; H.225/H.245 split; still carries billions of inter-carrier minutes monthly though declining. ([https://www.dailypayload.com/content/3111](https://www.dailypayload.com/content/3111))

**MGCP / Megaco / H.248** — *gateway control* protocols; complementary to SIP, used between a softswitch and media gateways (TDM↔IP). H.248 is jointly ITU/IETF.

**SIMPLE** — SIP for Instant Messaging and Presence (SUBSCRIBE/NOTIFY/MESSAGE/PUBLISH event packages).

**SIP-T (RFC 3372) and SIP-I (ITU-T Q.1912.5)** — encapsulate ISUP messages inside SIP for PSTN interworking.

**STUN / TURN / ICE** — RFC 5389 / 8656 / 8445; used *with* SIP for media path setup behind NAT.

**SRTP (RFC 3711)**, **DTLS-SRTP (RFC 5763/5764)**, **ZRTP (RFC 6189)**, **MIKEY (RFC 3830)** — alternative ways to key SRTP. ZRTP, designed by Phil Zimmermann (PGP creator) with help from Alan Johnston and Jon Callas, performs Diffie-Hellman *in the media stream* and verifies it via a Short Authentication String. ([https://en.wikipedia.org/wiki/ZRTP](https://en.wikipedia.org/wiki/ZRTP)) [Wikipedia](https://en.wikipedia.org/wiki/ZRTP)

**MSRP (RFC 4975)** — Message Session Relay Protocol; carries large/IM/file content over a SDP-negotiated TCP session, complementing SIP's small-message MESSAGE method.

**RTSP (RFC 7826)** — sibling protocol designed by Schulzrinne for streaming-media VCR-style control.

**XMPP / Jingle** — alternative IM/voice signaling; XMPP Jingle (XEP-0166) negotiates RTP sessions in a way analogous to SIP+SDP.

**DIAMETER (RFC 6733)** — AAA protocol used inside IMS for authentication (Cx, Sh, Rx interfaces) — complementary to, not a substitute for, SIP.

**ENUM (RFC 6116)** — DNS-based mapping of E.164 numbers to SIP URIs (`+12025550100` → `0.0.1.0.5.5.5.2.0.2.1.e164.arpa NAPTR ...sip:...`). Used for inter-carrier number lookup.

**SS7 / SIGTRAN** — legacy PSTN signaling; SIGTRAN (M3UA, SCTP) carries SS7 messages over IP, bridged to SIP via Media Gateway Controllers (MGCF in IMS).

**IMS (3GPP TS 23.228)** — architectural framework using SIP as core. Components: P-CSCF (proxy), I-CSCF (interrogating), S-CSCF (serving), HSS (subscriber DB via Diameter), MMTel AS (telephony app server), MGCF / IMS-MGW for PSTN breakout, IBCF/TrGW for inter-network. ([https://www.3gpp.org/technologies/volte-vonr](https://www.3gpp.org/technologies/volte-vonr))

**STIR/SHAKEN** — STIR (RFC 8224) inserts a JWT-format PASSporT in a SIP `Identity` header, signed by an authorized originating-service-provider certificate; SHAKEN (ATIS-1000074) frames how telcos do this in practice. Now FCC-mandated in the U.S. ([https://datatracker.ietf.org/doc/html/rfc8224](https://datatracker.ietf.org/doc/html/rfc8224)) [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-stir-passport-shaken)

---

## Real-World Deployment

### Open-source stacks

- **Asterisk** — created Oct 1999 by Mark Spencer at Auburn after he was quoted >$50,000 for a PBX; founded Linux Support Services (later Digium). Acquired by Sangoma in 2018. Ten million-plus deployments; LTS branches 18 / 20 / 22 active in 2025. ([https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/](https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/)) ([https://en.wikipedia.org/wiki/Asterisk_(PBX)](https://en.wikipedia.org/wiki/Asterisk_(PBX))) [Grokipedia](https://grokipedia.com/page/Asterisk_(PBX))[Wikipedia](https://en.wikipedia.org/wiki/Asterisk_(PBX))
- **FreeSWITCH** — Anthony Minessale fork-from-scratch of the carrier-grade ideas after his Asterisk experience, first public release 2006. Ships with **Sofia-SIP** as its SIP stack.
- **Kamailio** (formerly OpenSER, before that SER) — high-throughput SIP proxy/router from FhG FOKUS lineage; Jiri Kuthan. Stays at the proxy/registrar layer and is famous for handling 10k+ registrations/s on commodity HW. April 2026 advisories CVE-2026-39863 and -39864. ([https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/)) [Kamailio](https://kamailio.org/mailman3/hyperkitty/list/sr-users@lists.kamailio.org/thread/UJIXKISO7LTSRAN34Q3ISDGYWHLDZOBW/)
- **OpenSIPS** — fork of OpenSER led by Bogdan-Andrei Iancu.
- **PJSIP / pjproject** — Benny Prijono's portable SIP/SDP/ICE C library; embedded in Asterisk's `chan_pjsip`.
- **Sofia-SIP** — Nokia origin, used by FreeSWITCH and Drachtio.

### Proprietary platforms

- **Cisco Unified Communications Manager (CUCM, ex-CallManager)** — recurring SIP-parsing CVEs, including the 2024 CVE-2024-20375 DoS in SIP message parsing and CVE-2024-20253 (RCE prior to v15). ([https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-dos-kkHq43We](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-dos-kkHq43We)) [Cisco](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-cucm-dos-kkHq43We.html)
- **Microsoft Lync / Skype-for-Business** spoke SIP natively; **Teams** uses proprietary cloud signaling internally but exposes **Direct Routing** — a fully SIP-over-TLS interface to certified SBCs. Microsoft maintains a strict RFC-conformance list and is forcing CA changes through 2025–2026. ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols)) ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new))
- **Polycom (Poly) / Yealink / Cisco / Avaya / Mitel** — IP phones implementing SIP UA roles.

### Cloud SIP providers

- **Twilio Elastic SIP Trunking** — defaults to **1 call-per-second** per trunk per region; self-service up to 15 CPS for trunks and 30 CPS for Programmable Voice; higher requires Sales engagement. CPS limits are a hard rate-limit signal (HTTP 429 / SIP 503 "Trunk CPS limit exceeded"). ([https://www.twilio.com/docs/sip-trunking/cps-trunk-termination](https://www.twilio.com/docs/sip-trunking/cps-trunk-termination)) ([https://www.twilio.com/en-us/blog/high-volume-voice-considerations](https://www.twilio.com/en-us/blog/high-volume-voice-considerations)) [Twilio + 3](https://www.twilio.com/docs/sip-trunking/cps-trunk-termination)
- **Vonage, RingCentral, Zoom Phone, 8x8, Sangoma, Lumen Voice Complete, AT&T IP Flexible Reach** — all expose SIP trunk or Direct-Routing interfaces.

### Telco infrastructure

- **IMS at every Tier-1** powering VoLTE/VoNR/VoWiFi. SK Telecom reported (2025) **median 1.2 s VoNR INVITE→200 OK setup vs. 2.8 s for VoLTE**. Reliance Jio reported 72 % of 5G voice in 2024 used EPS-Fallback to LTE for VoLTE. ([https://www.5g6gacademy.com/learn/sip-volte-vonr](https://www.5g6gacademy.com/learn/sip-volte-vonr)) — *note: numbers are vendor-/ academy-published and should be treated as illustrative.*

### Session Border Controllers

Oracle Communications SBC (Acme Packet lineage) is the most-deployed; published datasheet capacities for the Enterprise SBC vary by hardware but reach into the thousands of CPS and hundreds of thousands of concurrent sessions. Ribbon (Sonus) and AudioCodes are the other major vendors. Microsoft maintains a strict list of *Certified for Teams Direct Routing* SBCs. ([https://www.oracle.com/a/ocom/docs/industries/communications/communications-session-border-controller-ds.pdf](https://www.oracle.com/a/ocom/docs/industries/communications/communications-session-border-controller-ds.pdf)) ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan))

### Deployment topologies

1. **SIP trunking** (PBX → carrier) — single trust boundary at the SBC.
2. **Peer-to-peer / federated SIP** between domains — rarer; usually hub-and-spoke through SBCs.
3. **IMS core** — P-CSCF (border), I-CSCF (routing), S-CSCF (services), HSS, with PCRF/PCF for QoS. ([https://www.3gpp.org/technologies/volte-vonr](https://www.3gpp.org/technologies/volte-vonr))
4. **WebRTC gateway** — Janus, FreeSWITCH `mod_verto`/SIP-over-WebSocket, Asterisk's WebRTC support.

---

## Failure Modes and Famous Incidents

**AT&T February 22, 2024 outage.** A misconfigured network element caused 125 million devices to disconnect and blocked ~25,000 911 calls. The FCC's report attributes it to a single equipment-configuration error during a network expansion; the event triggered the network's "protect mode," not specifically an IMS or SIP bug — *though all U.S. mobile voice runs over IMS/SIP, so the ultimate visible failure mode was inability to register or place SIP calls.* ([https://bbcmag.com/massive-att-outage-caused-by-misconfigured-network-element-fcc-says/](https://bbcmag.com/massive-att-outage-caused-by-misconfigured-network-element-fcc-says/)) [Bbcmag + 2](https://bbcmag.com/massive-att-outage-caused-by-misconfigured-network-element-fcc-says/)

**CenturyLink December 2018 911 outage.** ~7.4 million Washington residents lost 911 for 49 hours; 24,000 calls failed. Washington's UTC found CenturyLink had **incorrectly configured network devices and failed to build safeguards into its traffic-routing infrastructure**, recommending a $7.2 M penalty. The 2014 outage that preceded it cost a $2.8 M penalty. ([https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)) [UTC + 2](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)

**Robocall epidemic.** Spurred TRACED Act (2019), STIR/SHAKEN mandates 2021–2025, and the FCC's 2024 Eighth Report & Order. ([https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf))

**Recent CVEs (illustrative, not exhaustive).**

| CVE | Product | Year | Severity | What it was |
|---|---|---|---|---|
| CVE-2024-20375 | Cisco CUCM / CUCM-SME | 2024 | CVSS 8.6 | SIP-parsing OOB write → unauth DoS reload [Cisco](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-cucm-dos-kkHq43We.html)[Cybersecurity Help](https://www.cybersecurity-help.cz/vdb/SB20240821117) ([https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-dos-kkHq43We](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-dos-kkHq43We)) |
| CVE-2024-20253 | Cisco UC suite | 2024 | High | Unauthenticated RCE via crafted message to listening port [Cisco Security](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-rce-bWNzQcUm) ([https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-rce-bWNzQcUm](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-rce-bWNzQcUm)) |
| CVE-2024-42365 | Asterisk | 2024 | High | AMI `write=originate` allows RCE/SSRF [CVE Details](https://www.cvedetails.com/cve/CVE-2024-42365/) ([https://www.cvedetails.com/cve/CVE-2024-42365/](https://www.cvedetails.com/cve/CVE-2024-42365/)) |
| CVE-2024-42491 | Asterisk | 2024 | 5.7 | Malformed Contact/Record-Route URI crashes Asterisk via `res_resolver_unbound` [OSV](https://osv.dev/vulnerability/CVE-2024-42491) ([https://osv.dev/vulnerability/CVE-2024-42491](https://osv.dev/vulnerability/CVE-2024-42491)) |
| CVE-2025-57819 | FreePBX | 2025 | High | Pre-auth SQLi → RCE; exploited in the wild [SANS](https://isc.sans.edu/diary/32350) ([https://isc.sans.edu/diary/32350](https://isc.sans.edu/diary/32350)) |
| CVE-2026-39863 | Kamailio core | 2026 | High | Crafted TCP packet crashes process [Kamailio](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/) ([https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/)) |
| CVE-2026-39864 | Kamailio auth | 2026 | Moderate | Identity-check bypass in auth module [Kamailio](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/) |

**Toll-fraud and scanners.** **SIPVicious** (svmap, svwar, svcrack, svreport, svcrash) is the canonical SIP audit toolkit; widely abused for INVITE-flood/registration cracking. A 4-digit PIN can be cracked in ~142 seconds at typical attack rates; weak SIP passwords routinely lead to international toll fraud. ([https://assertion.cloud/blog/understanding-sip-viscous/](https://assertion.cloud/blog/understanding-sip-viscous/)) [Assertion + 2](https://assertion.cloud/blog/understanding-sip-viscous/)

**The famous SIP ALG pitfall.** Consumer/SMB routers ship with SIP Application-Layer Gateway *enabled by default*. SIP ALG rewrites SIP/SDP IPs and ports trying to "help" NAT but breaks modern TLS-signaled, SRTP-encrypted, ICE-using flows: result is one-way audio, registration drops at 30–60 s NAT timeouts, and complete inbound failures. Cisco Meraki has *removed* ALG entirely; SonicWall, Fortinet, TP-Link, and Asus all document the disable procedure. *3CX's 2025 Firewall & VoIP Reliability Report attributes ~40 % of initial call-setup failures and 25 % of one-way-audio incidents to SIP ALG.* ([https://viirtue.com/how-to-solve-sip-alg-problems-in-2026-a-practical-voip-guide-for-smbs-and-msps/](https://viirtue.com/how-to-solve-sip-alg-problems-in-2026-a-practical-voip-guide-for-smbs-and-msps/)) ([https://www.nextiva.com/blog/disable-sip-alg.html](https://www.nextiva.com/blog/disable-sip-alg.html)) [PortSIP](https://support.portsip.com/portsip-communications-solution/faq/what-is-sip-alg-and-why-you-need-to-disable-it)[VOS3000](https://www.vos3000.info/sip-alg-problems-voip-nat-troubleshooting/)

**INVITE of Death.** Originally documented in OpenSBC, February 2009: a single 74-byte SIP INVITE with malformed `Via` colons crashes the server. Researchers later showed *minimized* attack inputs that bypass the original patch — a classic example of weak SIP parsers and a justification for fuzz-testing. ([https://en.wikipedia.org/wiki/INVITE_of_Death](https://en.wikipedia.org/wiki/INVITE_of_Death)) [M. Zubair Rafique + 2](https://zubairrafique.wordpress.com/2014/09/30/invite-of-death-and-network-dialog-minimization-new-vulnerability-in-voip-server/)

**OPTIONS-reflection / amplification DDoS** — small `OPTIONS` request triggers larger responses; mitigations are in RFC 5393 (forking-amplification) and in SBC rate-limits. [Mobius-software](https://www.mobius-software.com/documentation/Mobius+SIP/Core+SIP+Protocol)

**TCP MSS / UDP fragmentation issues** — INVITEs over ~1300 bytes (especially with thick SDP from ICE candidate lists) get fragmented at the IP layer; some firewalls drop fragmented UDP. RFC 3261 mandates fall-back to TCP when message > path MTU.

---

## Fun Facts and Anecdotes

- **The name.** SIP began life as Schulzrinne's "Multiparty Multimedia Session Invitation Protocol" but the WG dropped "Invitation" → "Initiation" to broaden scope. ([https://en.wikipedia.org/wiki/Henning_Schulzrinne](https://en.wikipedia.org/wiki/Henning_Schulzrinne))
- **Schulzrinne's hat trick:** principal author of RTP, RTSP, and SIP — and later FCC Chief Technologist 2010-2011 (and 2012-2013, 2017), then a Technology Fellow for Senator Wyden 2019-2020. ([https://www.engineering.columbia.edu/faculty/henning-schulzrinne](https://www.engineering.columbia.edu/faculty/henning-schulzrinne)) [Columbia Engineering](https://www.engineering.columbia.edu/faculty/henning-schulzrinne)
- **Why port 5060?** IANA assigned 5060/5061 for SIP and SIPS respectively; the choice was administrative, not symbolic. There is no historically meaningful reason for "5060" — it is simply the user-port range slot that was free at registration time. `[needs source for the precise historical justification]` ([https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers)) [AEANET](https://www.aeanet.org/what-is-port-5060/)
- **Mark Spencer's $50K trigger.** Spencer was quoted >$50,000 for a PBX in 1999 for his Linux-support startup (LSS, later Digium). Rather than borrow, he wrote Asterisk in a few months. He named it after the `*` DTMF key. ([https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/](https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/)) [Asterisk Documentation](https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/)[Wikipedia](https://en.wikipedia.org/wiki/Asterisk_(PBX))
- **HTTP-shaped SIP.** RFC 3261 was deliberately patterned on HTTP/SMTP — Schulzrinne and Handley wanted text-debuggable wire format; it is one reason `curl`-style tooling and HTTP-aware proxies adapted easily.
- **April Fools RFCs.** The IETF tradition (since 1989) includes RFC 5513 "IANA Considerations for Three Letter Acronyms" — a satire that namechecks SIP's alphabet-soup ecosystem; **RFC 4824 ("The Transmission of IP Datagrams over the Semaphore Flag Signaling System")** is unrelated to SIP despite "SOAP for SIP" rumors — the latter is a non-standard idea explored only in patents, not an April-Fools RFC. ([https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)) [Wikipedia](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)[Wikipedia](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)
- **SIPit.** The IETF-aligned SIP interoperability event series (SIPit 1 in 2001 through SIPit 30+); responsible for finding most "INVITE of Death"-class bugs in real implementations during multi-vendor matrix-test events.
- **"SIPS" naming confusion.** `sips:` is a URI scheme indicating TLS hop-by-hop; many engineers wrongly assume it implies end-to-end like `https:`. RFC 5630 explicitly warns against that "padlock-icon" intuition. ([https://www.rfc-editor.org/rfc/rfc5630.html](https://www.rfc-editor.org/rfc/rfc5630.html)) [Hjp](https://www.hjp.at/doc/rfc/rfc5630.html)
- **ZRTP is "Z" for Zimmermann.** Phil Zimmermann (PGP) co-designed ZRTP with Alan Johnston and Jon Callas; the protocol embeds a **Short Authentication String (SAS)** that two humans read aloud to each other to detect MITMs — pure "verbal cryptography." ([https://en.wikipedia.org/wiki/ZRTP](https://en.wikipedia.org/wiki/ZRTP)) [Wikipedia](https://en.wikipedia.org/wiki/ZRTP)

---

## Practical Wisdom

### Tuning and timers (defaults from RFC 3261)

- **T1 = 500 ms** (RTT estimate; basis of every retransmit interval)
- **T2 = 4 s** (max retransmit for non-INVITE)
- **T4 = 5 s** (max duration message stays in network)
- **Timer B/F = 64*T1 = 32 s** (transaction timeout)
- **Timer D ≥ 32 s** (UDP) for absorbing delayed responses
- **Min-SE** (RFC 4028) — minimum session-timer interval; default 90 s, often raised to 1800 s in carrier networks to avoid mid-call refresh storms.
- **Registration `Expires`** — typical 3600 s; SBCs often shorten to 60-300 s for faster failover.
- **TCP keep-alive** / **CRLF keep-alive** (RFC 5626) every 95 s default to keep NAT bindings alive.

### Defaults to be skeptical of

- **SIP ALG on every router** — *turn it off*. ([https://www.nextiva.com/blog/disable-sip-alg.html](https://www.nextiva.com/blog/disable-sip-alg.html))
- **Default Asterisk passwords** — `admin`/blank historically; weak digest credentials are the #1 toll-fraud vector.
- **UDP transport at scale** — TCP/TLS with Outbound (RFC 5626) is more reliable for NAT and message-size-resistant.
- **MD5 digest** — RFC 8760 deprecated it in 2020, but PJSIP/Asterisk only added SHA-256 outbound support in 2023–2024; many networks still default to MD5. Audit with care. ([https://www.asterisk.org/opensipit01-rfc-8760-interoperability/](https://www.asterisk.org/opensipit01-rfc-8760-interoperability/))

### Monitoring KPIs

- **ASR (Answer Seizure Ratio)** = answered / seizure attempts.
- **NER (Network Effectiveness Ratio)** = (answered + user-busy + user-no-answer) / attempts (filters out network failures).
- **MOS (Mean Opinion Score)** for media quality (1-5 scale).
- **Distribution of SIP response codes** — sudden 4xx spike often = auth/credential issue; 5xx spike = backend; 6xx spike = global user availability problem.
- **Registration churn** (re-registers / minute) — spikes precede TCP exhaustion.

### Debugging tools

- **sngrep** — text-UI SIP-flow viewer; can also capture and forward HEP to HOMER. ([https://github.com/sipcapture/homer/wiki/Examples:-sngrep](https://github.com/sipcapture/homer/wiki/Examples:-sngrep)) [GitHub](https://github.com/sipcapture/homer/wiki/Examples:-sngrep)
- **Wireshark** filters: `sip`, `sdp`, `sip.Method == "INVITE"`, `rtp`.
- **HOMER / SIPCAPTURE** — carrier-grade open-source SIP capture and analytics with HEP (Homer Encapsulation Protocol). ([https://sipcapture.org/](https://sipcapture.org/))
- **SIPp** — Cisco-/IETF-rooted load tester; canonical for stress-testing SBCs and proxies.
- **ngrep / sipgrep** — quick CLI grep.
- **SIP.js, JsSIP, sipML5** — browser libraries.
- **Linphone, MicroSIP, Zoiper, pjsua** — softphone test tools.

### Common misconfigurations and their tells

- **Missing `Record-Route`** → mid-dialog requests bypass critical proxy, breaking auth or routing.
- **`Contact: sip:user@10.x.x.x`** leaks private IP — far end can't reach you. Use `rewrite_contact`/SBC.
- **Codec mismatch** (e.g. one side Opus, the other G.711) → 488 Not Acceptable Here.
- **SDP `c=` line with private IP** → one-way audio. ICE or SBC fixes.
- **TCP MSS / large INVITE** → fragments dropped at firewall; force TCP transport or strip SDP attributes.

---

## Learning Resources (current as of 2026)

| Resource | URL | Description | Level | Last touched |
|---|---|---|---|---|
| **RFC 3261** | [https://www.rfc-editor.org/rfc/rfc3261](https://www.rfc-editor.org/rfc/rfc3261) | Canonical SIP spec — read §17 (state machines), §24 (examples), §13 (INVITE), §10 (REGISTER). | Advanced | 2002 (live) |
| **RFC 6665** | [https://datatracker.ietf.org/doc/html/rfc6665](https://datatracker.ietf.org/doc/html/rfc6665) | Modern SIP events (replaces 3265). | Advanced | 2012 |
| **RFC 8866** | [https://datatracker.ietf.org/doc/rfc8866/](https://datatracker.ietf.org/doc/rfc8866/) | Current SDP. | Intermediate | 2021 |
| **RFC 8224 / 8225 / 8226 / 8588** | [https://datatracker.ietf.org/doc/html/rfc8224](https://datatracker.ietf.org/doc/html/rfc8224) | STIR/SHAKEN identity. | Advanced | 2018-2019 |
| **RFC 8760** | [https://datatracker.ietf.org/doc/html/rfc8760](https://datatracker.ietf.org/doc/html/rfc8760) | Modern SIP digest auth (SHA-256). | Intermediate | 2020 |
| **RFC 8898** | [https://datatracker.ietf.org/doc/rfc8898/](https://datatracker.ietf.org/doc/rfc8898/) | OAuth Bearer auth in SIP. | Intermediate | 2020 |
| **RFC 5626** | [https://datatracker.ietf.org/doc/html/rfc5626](https://datatracker.ietf.org/doc/html/rfc5626) | Outbound; persistent client-side NAT-traversal flows. [Alianza](https://docs.rhino.alianza.com/ocdoc/books/sip/2.5.0/sip-resource-adaptor-guide/features/rfc-5626-outbound-connections.html) | Intermediate | 2009 |
| **RFC 5630** | [https://www.rfc-editor.org/rfc/rfc5630.html](https://www.rfc-editor.org/rfc/rfc5630.html) | The truth about `sips:`. | Intermediate | 2009 |
| **RFC 7118** | [https://datatracker.ietf.org/doc/html/rfc7118](https://datatracker.ietf.org/doc/html/rfc7118) | SIP over WebSocket. | Intermediate | 2014 |
| **Johnston, *SIP: Understanding the Session Initiation Protocol*, 4th ed., Artech House** | [https://us.artechhouse.com/SIPUnderstanding-the-Session-Initiation-Protocol-Fourth-Edition-P1764.aspx](https://us.artechhouse.com/SIPUnderstanding-the-Session-Initiation-Protocol-Fourth-Edition-P1764.aspx) | Reference textbook by an RFC 3261 co-author. [Google Books](https://books.google.com/books?id=GkOPCwAAQBAJ&printsec=copyright) | Intermediate | 2015 (4e) |
| **Sinnreich & Johnston, *Internet Communications Using SIP*, 2e, Wiley** | (publisher: Wiley, 2006) | Practitioner guide; older but still cited. | Intermediate | 2006 |
| **Asterisk Documentation** | [https://docs.asterisk.org](https://docs.asterisk.org) | Live; explicit version-by-version notes incl. PJSIP / SHA-256 status. | Intro→Adv | 2026 |
| **Kamailio Wiki / Docs** | [https://www.kamailio.org/wikidocs/](https://www.kamailio.org/wikidocs/) | Best resource for high-throughput proxy/registrar design. | Advanced | 2026 |
| **HOMER / SIPCAPTURE** | [https://sipcapture.org/](https://sipcapture.org/) | Carrier-grade capture. | Advanced | 2026 |
| **TransNexus Blog** | [https://transnexus.com/blog/](https://transnexus.com/blog/) | Monthly STIR/SHAKEN statistics. | Intermediate | 2026 |
| **TNS Robocall Reports** | [https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/) | Industry benchmark. | Intro | 2026 |
| **Henning Schulzrinne's Columbia page** | [https://www.engineering.columbia.edu/faculty/henning-schulzrinne](https://www.engineering.columbia.edu/faculty/henning-schulzrinne) | Source-of-truth for SIP/RTP history. | Intro | live |
| **3GPP TS 23.228 (IMS), TS 24.229 (SIP for IMS)** | [https://www.3gpp.org/technologies/volte-vonr](https://www.3gpp.org/technologies/volte-vonr) | Authoritative IMS / VoLTE / VoNR specs. | Advanced | 2025 |
| **Microsoft Direct Routing docs** | [https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols) | Best canonical example of "what RFCs you must implement for a modern SBC." | Intermediate | 2026 |
| **Twilio scale docs** | [https://www.twilio.com/docs/sip-trunking/scale-and-limits](https://www.twilio.com/docs/sip-trunking/scale-and-limits) | Real published numbers. | Intermediate | 2026 |
| **SIPp** | (project home, on GitHub) | Load tester. | Intermediate | 2025 |
| **sngrep** | [https://github.com/irontec/sngrep](https://github.com/irontec/sngrep) | Live SIP-flow capture. | Intermediate | 2026 |

Conferences/podcasts: **AstriCon** (Asterisk), **ClueCon** (FreeSWITCH), **Kamailio World** annually; **VUC (VoIP Users Conference)** podcast archives; IETF SIPCORE/STIR session videos on YouTube.

University courses: Schulzrinne's Columbia *Advanced Internet Services* (CS E6181 / CS 4119) historically covered SIP; lecture slides are often available on his Columbia page. Stanford CS144 and MIT 6.829 cover the surrounding networking. `[exact current course numbers — needs verification each term]`

---

## Where Things Are Heading (2025–2026 frontier)

1. **STIR/SHAKEN expansion.** Effective Sep 18, 2025, every U.S. obligated provider must sign with its own SPC token. Canada's CRTC mandated equivalent rules in 2021; EU directives are still maturing. Out-of-band STIR for legacy non-IP segments and short-lived STIR certs (drafts in IESG queue 2025-2026) are the next frontier. ([https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf)) ([https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-shortlived/](https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-shortlived/)) [Wiley Rein LLP](https://www.wileyconnect.com/fccs-looming-stir-shaken-requirements-may-raise-usf-obligations-and-exposure-for-certain-providers)
2. **VoNR replacing VoLTE.** Still SIP-IMS, faster setup, lower latency. By 2025: 45+ commercial VoNR networks vs. 310+ VoLTE. ([https://www.5g6gacademy.com/learn/sip-volte-vonr](https://www.5g6gacademy.com/learn/sip-volte-vonr)) [5g6gacademy](https://www.5g6gacademy.com/learn/sip-volte-vonr)
3. **Consumer voice continues to leak away from SIP** to WebRTC-based and proprietary stacks. SIP remains *the* protocol for enterprise voice and the telco core.
4. **WebRTC-SIP convergence.** RFC 7118 SIP-over-WebSocket plus DTLS-SRTP gateways (Janus, Asterisk, FreeSWITCH WebRTC) are increasingly the default for browser-side voice in CPaaS.
5. **SIP over QUIC.** Individual draft-hurst-sip-quic; not yet a SIPCORE WG document. Header compression and connection-multiplexing benefits are real, but adoption is constrained by middlebox (SBC) realities. *Speculative — track via IETF Datatracker.* ([https://datatracker.ietf.org/doc/draft-hurst-sip-quic/](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)) [IETF](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)
6. **Post-quantum SIPS/TLS.** No SIP-specific RFC yet; the same hybrid-KEM TLS profiles (e.g., X25519+Kyber) being baked for HTTPS will apply to port 5061 once libraries broadly support them. *No SIP-specific PQ RFC published as of May 2026.* `[needs source if a PQ-SIP draft has been published]`
7. **AI-driven robocall mitigation.** TNS, Hiya, and carriers are layering ML reputation scoring on top of attestation; the FCC clarified in 2024-25 that AI-generated robocalls without prior consent are illegal. ([https://getvoip.com/blog/state-of-robocalls/](https://getvoip.com/blog/state-of-robocalls/)) [GetVoIP](https://getvoip.com/blog/state-of-robocalls/)
8. **Active IETF working groups.** **SIPCORE** (still the maintenance home — actively progressing rfc7976bis, SIPREC fixes, MCP-extension drafts), **STIR** (very active 2024-2026), **MMUSIC** (still active for SDP/ICE), **SIPBRANDY** is largely concluded. ([https://datatracker.ietf.org/group/sipcore/about/](https://datatracker.ietf.org/group/sipcore/about/))
9. **Microsoft Teams Direct Routing as the dominant enterprise SIP edge.** With Operator Connect and Direct Routing, Microsoft has effectively turned SIP-trunk procurement into a commodity flow — the SBC and SIP trunk between carrier and tenant remain pure SIP, while the user interface above is proprietary. ([https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan))

---

## Hooks for the Article, Infographic, and Podcast

**60-second narrated hook (ear-friendly):**

> *Every time your phone rings — whether it's a 5G smartphone, a hotel-room hardphone, an Asterisk-powered call center, or a Microsoft Teams Direct Routing tenant — there is, somewhere on the path, a 24-year-old IETF spec called SIP doing the dial-tone work. SIP doesn't carry your voice. It just decides where your voice is going. And in the last 24 months, SIP has quietly become the front line of the war on robocalls.*

**One striking statistic:** As of 2025, **85 % of voice traffic between U.S. Tier-1 carriers is signed with STIR/SHAKEN**, with 93 % of those signings at the highest "A-level" attestation — yet robocalls fell only ~1 % year-over-year, because between *smaller* carriers only **17.5 %** of traffic is signed. ([https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)) [CFCA](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)[CFCA](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)

**"Pause and think" moment:**

> *The SIP message that sets up your call is text — you can `cat` it. A protocol invented when the world's biggest VoIP question was "can we replace ISDN?" now negotiates 1.2-second voice setups on 5G New Radio at carriers handling billions of minutes a month. Sometimes simple, debuggable formats really do scale further than anyone expected.*

**Failure-story arc — December 2018 CenturyLink 911 outage.**

- *Setup.* CenturyLink ran the SIP-based 911 routing for Washington and a dozen states.
- *Mistake.* A misconfigured network device flooded the network with malformed packets; **safeguards weren't built into the routing infrastructure**. [UTC](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)
- *Consequence.* 49 hours of disruption, ~24,000 unanswered 911 calls in Washington alone. [UTC](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)
- *Resolution.* Washington UTC fined CenturyLink $7.2 M; FCC settled separately for $500 K; the case became one of the textbook arguments for the "all-IP, signed, vendor-diverse" emergency-call architecture that NENA i3 and STIR/SHAKEN are now building toward. ([https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)) [UTC](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)

---

## Caveats

- **Vendor numbers cited (Twilio CPS, Oracle SBC capacities, SK Telecom VoNR setup time, GSMA VoLTE/VoNR counts, TNS attestation percentages):** these are vendor- or trade-association-published figures. Independent academic verification is limited. Treat them as illustrative of order-of-magnitude reality, not laboratory-rigorous benchmarks.
- **AT&T February 2024 outage attribution:** the FCC report attributes the cause to a misconfigured network element in protect-mode; widely-circulated framings calling it "an IMS bug" or "a SIP bug" are not supported by the report. The visible *symptoms* were SIP/IMS registration failures, but the *cause* was a configuration error. [Benton Institute for Broadband & Society](https://www.benton.org/headlines/february-22-2024-att-mobility-network-outage-report-and-findings)
- **Some 2026 Kamailio CVEs (CVE-2026-39863/39864)** were published April 7, 2026; details are still surfacing — patch immediately rather than wait for full public exploit analysis. ([https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/))
- **SIP-over-QUIC and post-quantum SIPS** remain *frontier* topics — work in progress, not deployed standards. Coverage above flags this explicitly; do not treat as production-ready.
- **Port-5060 historical justification** — I could not find a primary IETF source explaining *why* 5060 (vs. any other free user port) was chosen; treat any narrative as speculation. `[needs source]`
- **"April Fools' RFC for SIP"** — there is no famous SIP-specific April-Fools RFC. RFC 4824 is about IP-over-Semaphore, *not* SIP-over-SOAP. The "SIP for stoves" anecdote is folklore — `[needs source]`.
- **STIR/SHAKEN attestation numbers** vary slightly month-to-month per TransNexus's monthly bulletins; the multi-vendor TNS 2026 report and TransNexus diverge on absolute coverage but agree on the trend (rising signing, slow but real robocall-volume decline). Cross-reference both before publishing a single number.
- **Several legacy claims** in this report (e.g., "Mark Spencer was quoted >$50K") are well-attested in primary Asterisk documentation but ultimately rely on Spencer's recollections; they are best treated as *origin myth* of the project even though they are clearly historically accurate in spirit.