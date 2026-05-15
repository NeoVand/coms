---
id: sip
type: protocol
name: Session Initiation Protocol
abbreviation: SIP
etymology: "[S]ession [I]nitiation [P]rotocol"
category: realtime-av
year: 1999
rfc: RFC 3261
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - transport/udp
  - realtime-av/sip-and-sdp
related_protocols: [udp, tcp, tls, rtp, webrtc, sdp, http1, ip]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [3261, 3262, 3263, 3264, 3265, 5626, 5630, 6157, 6665, 7118, 8224, 8225, 8226, 8588, 8760, 8866, 8898, 6189]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/SIP_session_setup_example.svg/500px-SIP_session_setup_example.svg.png
    caption: A SIP session setup — INVITE starts the call, proxies route it, the callee rings on 180, answers on 200 OK, and the caller acknowledges. After the signaling, RTP media flows directly between the endpoints.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "A side-by-side of a SIP INVITE and an HTTP request — both text, both header-and-body, both human-readable. Annotation: same shape, different verbs (INVITE vs GET), different default port (5060 vs 80)."
  - "The INVITE/100 Trying/180 Ringing/200 OK/ACK/BYE flow as a sequence diagram with three lanes — Caller, Proxy, Callee. RTP arrow drawn separately, going point-to-point and bypassing the proxy entirely."
  - "A heat-map of the U.S. STIR/SHAKEN coverage in 2025: 85% of inter-Tier-1 traffic signed in green, 17.5% of small-carrier traffic in red, with the gap labelled 'where the robocalls live.'"
  - "A diagram of the SIP ALG pitfall — a consumer router rewriting the c= line in an SDP body, breaking the encrypted RTP path. Caption: 'this is why your call has one-way audio.'"
  - "An IMS architecture pyramid — P-CSCF at the edge, I-CSCF and S-CSCF in the core, HSS off to the side via Diameter, MGCF bridging to the PSTN. Every line labelled SIP except the HSS link."
  - "An Asterisk console screenshot showing a single REGISTER → 401 → REGISTER-with-Authorization → 200 OK exchange, with the Digest nonce and SHA-256 hash highlighted."
---

# SIP — Session Initiation Protocol

## In one breath

SIP is the dial-tone protocol of the internet. It does not carry your voice; it decides where your voice is going. Every VoLTE call on a 5G phone, every Microsoft Teams Direct Routing trunk, every Twilio Elastic SIP Trunk, every Asterisk-powered call centre — they all run on a 1999 IETF spec that looks like HTTP for telephony, with verbs like INVITE, ACK, BYE, and REGISTER. The canonical text, RFC 3261, was published in June 2002 and has never been replaced.

## The pitch (cold-open)

When you place a phone call in 2026, somewhere on the path is a 24-year-old text-based protocol called SIP doing the dial-tone work. It looks like HTTP. You can `cat` the messages. It won the protocol war against the ITU's binary H.323 by being human-debuggable, then went on to become the signalling backbone of every VoLTE network in 140-plus countries — and, in the last two years, the front line in the war on robocalls. That war is being fought with cryptographic attestations layered on top of a 1999 wire format. This episode is about how the whole stack actually works, where it breaks, and what is changing right now.

## How it actually works

SIP is an application-layer signalling protocol that runs over UDP, TCP, TLS-over-TCP, WebSocket, and increasingly experimental QUIC. The default port is 5060 for plaintext and 5061 for TLS. Messages are ASCII text, modelled on HTTP and SMTP — start-line, headers, blank line, optional MIME body. The body is almost always SDP, the Session Description Protocol, which carries the codec list, IP addresses, and ports for the actual media stream.

The five-step simulation in our encyclopedia is the spine. The caller sends an INVITE addressed to `sip:bob@example.com` with an SDP offer in the body — say, Opus on UDP port 5004 and H.264 on UDP port 5006. The proxy answers immediately with `100 Trying` so the caller stops retransmitting. The proxy routes the INVITE toward Bob's domain. When Bob's phone starts ringing, a `180 Ringing` flows back, and the caller plays a ringback tone. Bob picks up, his user agent returns `200 OK` with an SDP answer — the negotiated subset of codecs and ports. The caller sends `ACK` to close the three-way handshake, and from that moment RTP packets flow directly between the two endpoints. Hanging up is one `BYE` and one `200 OK`. Clean.

INVITE is the only SIP method that uses a three-way handshake. Every other method — REGISTER, OPTIONS, SUBSCRIBE, NOTIFY, MESSAGE, REFER, INFO, PRACK, UPDATE, PUBLISH — is two-way. REGISTER is the second protocol you have to understand: a phone tells the registrar "I am `alice@example.com` and you can reach me at this IP and port." That binding is what makes inbound calls possible.

### Header at a glance

- `Via` records the path. The branch parameter — that `z9hG4bK` magic cookie — is what matches a response back to a request and what detects loops.
- `From` and `To` are the logical endpoints. Both carry tags. Together with `Call-ID` they identify a dialog.
- `Call-ID` is a globally unique identifier for the call.
- `CSeq` is sequence number plus method. It orders requests inside a dialog.
- `Contact` is the actual reachable URI of the user agent — usually a routable IP and port. Get this wrong and the far end cannot reach you.
- `Max-Forwards` is the loop counter, default 70, decrement-by-one at each proxy.
- `Content-Length` and `Content-Type` frame the body, which is `application/sdp` for almost every call.
- `Route` and `Record-Route` are how proxies stay in the path for mid-dialog requests.
- `Authorization`, `WWW-Authenticate`, `Proxy-Authenticate` carry digest or OAuth Bearer auth.
- `Identity` carries the STIR PASSporT — the JWT that proves the caller ID is legitimate.

### State machine in three sentences

There are actually four state machines in RFC 3261 §17. The INVITE client transaction goes Calling, Proceeding, Completed, Terminated; the INVITE server transaction goes Proceeding, Completed, Confirmed, Terminated; non-INVITE clients and servers each have a simpler Trying-or-Proceeding-then-Terminated flow. Above all of that, a dialog moves from Early (after a 1xx with a To-tag) to Confirmed (after the 2xx) to Terminated (after BYE). The default timer values matter for debugging — T1 is 500 ms (the RTT estimate), T2 is 4 seconds (max retransmit for non-INVITE), Timer B and Timer F are both 64×T1 = 32 seconds (transaction timeout), Timer D is at least 32 seconds for absorbing late responses on UDP.

### Reliability, security, and how SIP stays correct

SIP runs over UDP by default and supplies its own application-layer retransmission. Lose a provisional response, no problem; lose a 200, the original sender retransmits the INVITE until an ACK arrives.

Authentication is digest, challenge-response. The user agent sends REGISTER with no credentials, gets back `401 Unauthorized` with a nonce and a `WWW-Authenticate` header, computes a hash of `username:realm:password`, `method:URI`, and the nonce, then resends. RFC 8760 (March 2020) deprecated the original MD5 in favour of SHA-256 and SHA-512-256 — but PJSIP and Asterisk only added SHA-256 outbound support in 2023 and 2024, so a lot of real deployments still negotiate MD5. RFC 8898 (September 2020) added OAuth 2.0 Bearer auth, opening the door to single sign-on.

For transport-level confidentiality there is TLS, signalled by the `sips:` URI scheme on port 5061. RFC 5630 (2009) is the definitive guide — and warns explicitly that `sips:` means TLS hop-by-hop, not end-to-end like `https:`. Engineers still get burned by the padlock-icon intuition four decades in.

Media security is a separate problem entirely. SDES carries SRTP keys in SDP (RFC 4568). DTLS-SRTP performs an in-band DTLS handshake on the media port — mandatory for WebRTC. ZRTP (RFC 6189), designed by Phil Zimmermann of PGP fame, does Diffie-Hellman in the RTP stream itself and verifies it with a Short Authentication String — two humans read four digits aloud to each other and detect a man-in-the-middle by ear. MIKEY is the IMS-flavoured option.

NAT is the perpetual SIP nightmare. SIP carries IP addresses inside its text payload — in `Via`, in `Contact`, in the SDP `c=` and `m=` lines. A NAT box rewrites the IP headers but does not touch the payload, so the far end tries to send media to a private address and fails. The fixes are STUN to discover the external mapping, TURN to relay through a server when symmetric NAT defeats STUN, ICE to try every candidate and pick what works, and at the carrier edge a Session Border Controller that terminates everything and anchors RTP at a public address.

Routing inside a dialog uses loose routing, signalled by the `;lr` URI parameter — proxies that want to stay in the path insert `Record-Route` headers, which the user agents replay as `Route` headers in subsequent requests. RFC 3261 deprecated the original strict routing in favour of this scheme.

## Where it shows up in production

The biggest SIP deployment on the planet is mobile telephony. Every VoLTE call rides SIP over an IMS core — P-CSCF at the edge, I-CSCF and S-CSCF in the routing layer, HSS holding the subscriber database via Diameter. By 2025, the GSMA reported 310-plus VoLTE operators in 140-plus countries and 45-plus commercial VoNR networks. SK Telecom has reported median INVITE-to-200-OK setup times of 1.2 seconds on VoNR versus 2.8 seconds on VoLTE — though these are vendor-published figures and are best treated as illustrative.

Microsoft Teams uses proprietary cloud signalling internally, but every Direct Routing trunk between a tenant and the PSTN is pure SIP over TLS to a certified Session Border Controller. Microsoft maintains a strict RFC-conformance list and is forcing CA migrations for that mTLS handshake through 2025 and into 2026. The pattern is industry-wide: the user-facing UC product can be anything, but the carrier-facing edge is SIP.

Twilio Elastic SIP Trunking defaults to one call per second per trunk per region. Self-service raises that to 15 CPS for trunks and 30 CPS for Programmable Voice; anything above requires Sales engagement. Hit the limit and you get back HTTP 429 or SIP 503 "Trunk CPS limit exceeded." Vonage, RingCentral, Zoom Phone, 8x8, Sangoma, Lumen Voice Complete, and AT&T IP Flexible Reach all expose comparable SIP trunking interfaces.

The open-source stacks are the other huge surface area. Asterisk, the canonical open-source PBX, has tens of millions of deployments — it was created by Mark Spencer in October 1999 after he was quoted more than fifty thousand dollars for a PBX for his Linux support startup. He named it after the `*` DTMF key. FreeSWITCH was Anthony Minessale's carrier-grade fork-from-scratch in 2006, ships with the Sofia-SIP stack, and is the engine inside many CPaaS products. Kamailio is the high-throughput SIP proxy and registrar from FhG FOKUS lineage — it routinely handles ten thousand-plus registrations per second on commodity hardware. OpenSIPS is the Bogdan-Andrei Iancu fork of OpenSER. PJSIP is Benny Prijono's portable C library and lives inside Asterisk's `chan_pjsip` driver.

Session Border Controllers are the SIP-aware firewalls that sit at the edge of every carrier and large enterprise. Oracle Communications SBC, descended from Acme Packet, is the most-deployed; Ribbon (formerly Sonus) and AudioCodes are the other two big vendors. Their job is to terminate signalling and media, normalize headers, transcode codecs, anchor RTP at public IPs, and rate-limit everything.

The consumer voice market told a different story. Skype, WhatsApp, FaceTime, Zoom, Discord — none of them use SIP. They built proprietary stacks or, increasingly, WebRTC-based stacks. Microsoft Lync and Skype-for-Business spoke SIP natively, but Teams replaced that with proprietary cloud signalling and kept SIP only at the trunk edge. SIP won the enterprise and the carrier core; it lost the consumer.

## Things that go wrong

The AT&T outage of 22 February 2024 disconnected 125 million devices and blocked roughly 25,000 911 calls. The FCC's report attributes it to a single misconfigured network element during a network expansion that pushed the network into "protect mode." It was not technically a SIP bug. But every U.S. mobile call runs over IMS, and IMS speaks SIP, so the visible symptom was a wave of registration failures and unanswered INVITEs. The lesson the industry took away was the same one CenturyLink had taught five years earlier: the all-IP voice network has the same single-misconfiguration blast radius as any other large packet network, and 911 deserves the safeguards.

The CenturyLink outage of December 2018 took 911 service away from 7.4 million Washington residents for 49 hours. Around 24,000 calls failed. Washington's UTC found that CenturyLink had incorrectly configured network devices and had failed to build safeguards into its traffic-routing infrastructure, and recommended a $7.2 million penalty. The FCC settled separately for $500,000. The 2014 outage that preceded it had cost a $2.8 million penalty — same root cause family, same lesson. The case became one of the textbook arguments for the all-IP, signed, vendor-diverse emergency call architecture that NENA i3 and STIR/SHAKEN are now building toward. If you want the longer-arc story of why 911 keeps breaking on top of SIP, the chapter episode "SIP and SDP" tells it directly.

The robocall epidemic is the other defining failure mode. SIP made it cheap to spoof caller ID at scale, because the From header is just text — there is no built-in cryptographic binding to who actually originated the call. The TRACED Act of 2019 set the U.S. policy direction; STIR/SHAKEN was the technical answer; the FCC's Eighth Report and Order, adopted on 21 November 2024 and effective 18 September 2025, tightened it further by requiring obligated providers to sign with their own SPC tokens rather than a third-party signing service. The 2026 reality, per the TNS robocall report, is that 85% of inter-Tier-1 traffic is now signed (93% of those at A-level) — but only 17.5% of traffic between smaller carriers is signed, and U.S. robocall volume fell only about 1% year-over-year in 2025. The protocol-level fix works; the long tail of small carriers remains the loophole.

The famous parser-level failure is the **INVITE of Death**, originally documented in OpenSBC in February 2009: a single 74-byte SIP INVITE with malformed `Via` colons crashes the server. Researchers later showed minimized attack inputs that bypassed the original patch — a textbook argument for fuzz-testing every SIP parser and the founding case study of the SIPit interoperability events.

Recent vulnerabilities have stayed in the same family. CVE-2024-20375 was a SIP-parsing out-of-bounds write in Cisco CUCM (CVSS 8.6) — unauthenticated denial of service via reload. CVE-2024-20253 was an unauthenticated remote code execution in the Cisco UC suite via crafted message to the listening port. CVE-2024-42365 in Asterisk allowed AMI-based RCE; CVE-2024-42491 crashed Asterisk via a malformed Contact or Record-Route URI. CVE-2025-57819 in FreePBX was a pre-auth SQL injection chained to RCE, exploited in the wild. April 2026 brought Kamailio CVE-2026-39863 (a crafted TCP packet that crashes the process, high severity) and CVE-2026-39864 (an identity-check bypass in the auth module, moderate). Patch fast. SIP parsers are an attractive target, and they have a long history of falling over.

Toll fraud is the other constant. SIPVicious — `svmap`, `svwar`, `svcrack`, `svreport`, `svcrash` — is the canonical SIP audit toolkit and the canonical SIP attack toolkit. A four-digit PIN can be cracked in roughly 142 seconds at typical attack rates. Weak SIP passwords routinely lead to international toll fraud at scale. Default Asterisk credentials remain the number-one vector.

OPTIONS-reflection amplification DDoS — small request, larger response, forking proxies multiplying the load — is mitigated by the rules in RFC 5393 and by SBC rate limits. Fragmentation is the quiet UDP killer: any INVITE bigger than about 1300 bytes gets fragmented at the IP layer, and many firewalls drop fragmented UDP. RFC 3261 mandates fall-back to TCP when a message exceeds the path MTU.

## Common pitfalls (for the practitioner)

**SIP ALG is on by default in your router. Turn it off.** Consumer and SMB routers ship with SIP Application-Layer Gateway enabled. The ALG tries to "help" by rewriting SIP and SDP IPs and ports — but it breaks modern TLS-signalled, SRTP-encrypted, ICE-using flows. The result is one-way audio, registration drops at the 30-to-60-second NAT timeout, and total inbound failures. Cisco Meraki has removed ALG entirely. SonicWall, Fortinet, TP-Link, and Asus all document the disable procedure. 3CX's 2025 Firewall and VoIP Reliability Report attributes about 40% of initial call-setup failures and 25% of one-way-audio incidents to SIP ALG.

**Missing `Record-Route`** means mid-dialog requests bypass the proxy that did the original auth or routing — calls succeed at setup and then break on the first re-INVITE.

**`Contact: sip:user@10.x.x.x`** leaks a private IP straight to the far end. Use `rewrite_contact` on the registrar or terminate at an SBC.

**Codec mismatch** — one side offers Opus, the other only does G.711 — produces `488 Not Acceptable Here`. Read the SDP and the Allow header.

**SDP `c=` line with a private IP** produces one-way audio; ICE candidates or an SBC anchor fix it.

**Large INVITEs over UDP** get fragmented and dropped. Force TCP transport, or strip optional SDP attributes.

**MD5 digest at scale.** RFC 8760 deprecated MD5 in 2020, but most deployed equipment still defaults to it. Audit before you assume your registrations are SHA-256.

**Default passwords on the PBX.** Asterisk shipped with `admin`/blank historically. Weak digest credentials are the number-one vector for international toll fraud.

**UDP at scale.** TCP and TLS with the persistent flows defined in RFC 5626 ("Outbound") are more reliable for NAT traversal and resilient to large-message fragmentation. The default port-5060-over-UDP world is fine for a small PBX and dangerous at carrier scale.

## Debugging it

**sngrep** is the text-UI SIP-flow viewer that every operator learns to love. It can also capture and forward HEP packets to HOMER.

**Wireshark** filters: `sip` for everything, `sdp` for the bodies, `sip.Method == "INVITE"` for call setups, `rtp` for media. The dissector is mature and shows you the dialog structure cleanly.

**HOMER and SIPCAPTURE** are the carrier-grade open-source SIP capture and analytics stacks, built around HEP — Homer Encapsulation Protocol — which lets you stream SIP and RTP-control metadata from every node into a central database.

**SIPp** is the Cisco- and IETF-rooted load tester. It is the canonical tool for stress-testing SBCs and proxies — write an XML scenario, point it at a target, and ramp the call rate.

**ngrep** and **sipgrep** are the quick-CLI options for grepping live traffic.

**SIP.js**, **JsSIP**, and **sipML5** are the browser libraries. **Linphone**, **MicroSIP**, **Zoiper**, and **pjsua** are the softphones you use to test from a real endpoint.

For the proxies and softphones themselves: turn on the SIP trace at info level, capture for the duration of one bad call, and read it linearly — the headers tell you where the request went, where it stopped, and which 4xx or 5xx came back. Distribution of SIP response codes is the most valuable monitoring signal: a sudden 4xx spike usually means an auth or credential problem, a 5xx spike means a backend, a 6xx spike means a global user-availability issue.

The KPIs that matter at scale are ASR (Answer Seizure Ratio — answered over attempts), NER (Network Effectiveness Ratio — answered plus busy plus no-answer over attempts, which filters out network failures), MOS (Mean Opinion Score for media, 1 to 5), and registration churn (re-registers per minute), where a spike often precedes TCP exhaustion.

Timer defaults to remember when you tune: T1 = 500 ms, T2 = 4 s, T4 = 5 s, Timer B and Timer F = 32 s, Min-SE for session timers (RFC 4028) is 90 s by default and is often raised to 1800 s in carrier networks to avoid mid-call refresh storms. Registration `Expires` is typically 3600 s, and SBCs often shorten that to 60-300 s for faster failover. TCP keep-alive (or the CRLF keep-alive of RFC 5626) goes every 95 s by default to keep NAT bindings open.

## What's changing in 2026

**April 2026 — Kamailio CVE-2026-39863 and CVE-2026-39864.** A high-severity TCP-data-processing crash and a moderate identity-check bypass in the auth module. Patch immediately; details are still surfacing.

**April 2026 — draft-ietf-stir-certificates-shortlived-05.** The STIR working group's short-lived certificate work is approaching IESG. The goal is to reduce the dependence on long-lived signing certificates and on out-of-band revocation.

**Late 2025 to 2026 — Microsoft Teams Direct Routing CA migration.** Mandatory mTLS certificate-authority changes are rolling through every SBC connecting Teams to the PSTN. If you operate one of those SBCs, you have already had this date in your calendar.

**November 2025 — draft-ietf-stir-certificates-ocsp-12.** OCSP usage for STIR certificates, also in the IESG-bound queue.

**18 September 2025 — FCC Eighth Report and Order takes effect.** Every U.S. obligated provider must now sign STIR/SHAKEN with its own SPC token, even when using a third-party signing service. The FCC Wireline Competition Bureau notified more than 2,400 providers of RMD deficiencies in December 2024 and removed two batches of non-compliant providers in August 2025.

**September 2025 — draft-howe-sipcore-mcp-extension-00.** An individual draft attempting to carry the Model Context Protocol — yes, the AI-agent context standard — over SIP. Early stage, but a marker for where the SIPCORE working group's agenda is drifting.

**July 2025 — draft-ietf-sipcore-rfc7976bis-03.** Updates to the P-Header set used in IMS deployments. Active SIPCORE work.

**May 2025 — draft-ietf-sipcore-siprec-fix-mediatype-06.** Fixes for SIPREC media-type negotiation in lawful-recording deployments.

**April 2025 — FCC Fact Sheet on non-IP caller-ID authentication.** Proposes a definition for an "effective" framework to close the non-IP gap that STIR/SHAKEN cannot reach.

**21 November 2024 — FCC Eighth Report and Order adopted.** The trigger for the September 2025 enforcement deadline above.

**SIP-over-QUIC.** The individual draft `draft-hurst-sip-quic-00` proposes mapping SIP to QUIC streams with header compression. It has expired without becoming a working-group document — interesting, not yet imminent, and constrained by middlebox (SBC) realities.

**Post-quantum SIPS.** No SIP-specific RFC yet. The same hybrid-KEM TLS profiles being baked for HTTPS — X25519+Kyber and friends — will apply to port 5061 once libraries broadly support them.

**AI-driven robocall mitigation.** TNS, Hiya, and the carriers are layering ML reputation scoring on top of STIR/SHAKEN attestation. The FCC clarified in 2024 and 2025 that AI-generated robocalls without prior consent are illegal under the existing TCPA framework.

## Fun facts (host material)

**Schulzrinne's hat trick.** Henning Schulzrinne, the Columbia University professor, is the principal author of three of the IETF's flagship multimedia protocols: RTP, RTSP, and SIP. He has authored more than 70 RFCs, served as FCC Chief Technologist three times (2010-2011, 2012-2013, and 2017), and was a Technology Fellow for Senator Wyden in 2019-2020. There is a separate pioneer page on him in the encyclopedia, and the chapter episode "SIP and SDP" tells the longer biography.

**The name almost had an extra word.** SIP began life as "Multiparty Multimedia Session Invitation Protocol." The working group dropped "Invitation" and broadened "Initiation" to cover modify and terminate as well, and the modern acronym fell out.

**Mark Spencer's $50,000 trigger.** The founder of Asterisk was quoted more than $50,000 for a PBX in 1999 for his small Linux-support company. Rather than borrow, he wrote one. He named it after the `*` DTMF key. Asterisk is now the dominant open-source PBX, with tens of millions of deployments.

**ZRTP is the Z for Zimmermann.** Phil Zimmermann — yes, the PGP guy — co-designed ZRTP with Alan Johnston and Jon Callas. It performs Diffie-Hellman in the media stream itself and verifies the result through a Short Authentication String that two humans read aloud to each other. It is one of the few cryptographic protocols whose adversary model includes the human ear.

**HTTP-shaped on purpose.** RFC 3261 was deliberately patterned on HTTP and SMTP. Schulzrinne and Mark Handley wanted a text-debuggable wire format. It is one reason `curl`-style tooling, HTTP-aware proxies, and an entire generation of web engineers could pick up SIP without having to learn a new mental model. The H.323 alternative was binary ASN.1, descended from H.320 ISDN videoconferencing — beautifully specified, hard to debug at three in the morning.

**SIPit.** The IETF-aligned SIP interoperability event series — SIPit 1 was in 2001, the series has run thirty-plus times since — is responsible for finding most "INVITE of Death"-class bugs in real implementations during multi-vendor matrix testing. If you build SIP software, you go to SIPit.

## Where this connects in the book

- *Part Real-time A/V, chapter "SIP and SDP"* — the long-form story: Henning Schulzrinne's three-protocol career, the SIP-vs-H.323 protocol war, the SDP "offer/answer" model, the AT&T 2024 and CenturyLink 2018 outages, the STIR/SHAKEN cold war on robocalls, the Asterisk and ZRTP folklore. The historical narrative for SIP lives there.
- *Part Transport, chapter "UDP"* — why SIP defaults to UDP on port 5060 in the first place, why NAT pinholes need SIP keepalives, and why the entire RTP-over-UDP design choice still pays off four decades later.

## See also (other protocol episodes)

**SIP versus WebRTC.** Two solutions to the same problem from opposite directions. SIP is the telephony stack — proxy and registrar, PBX and PSTN, RFC 3261 from the IETF. WebRTC is the browser stack — peer-to-peer with STUN/TURN/ICE fallback, integrated DTLS-SRTP, no plugins. SIP needs a softphone or an app; WebRTC is native to every modern browser. Pick SIP when you are integrating with existing telephony infrastructure or selling into telecom carriers. Pick WebRTC when users join calls directly from the browser and you want NAT-friendly peer-to-peer. The two converge through SIP-over-WebSocket gateways like Janus, FreeSWITCH `mod_verto`, and Asterisk's WebRTC support — that is how most of CPaaS browser voice actually works today. If you have heard the WebRTC episode, you already know the media half of SIP — they share SDP, ICE, STUN, TURN, and the RTP/SRTP family.

**SIP and SDP.** SIP carries SDP in its message bodies. SDP describes the media — codecs, ports, addresses, crypto keys. The offer/answer pattern (RFC 3264, updated by RFC 8866 in January 2021) was invented for SIP and went on to become the universal media-negotiation primitive — including for WebRTC. Whenever you see `Content-Type: application/sdp` in a SIP message, that is SDP doing its job. The SDP episode in the encyclopedia covers the protocol itself.

**SIP and RTP.** SIP is the dialling; RTP is the talking. SIP signalling and RTP media travel in entirely separate paths — the proxy that routes your INVITE never sees a single audio packet. RTP runs on dynamic UDP ports negotiated through the SDP offer/answer in the SIP messages. The RTP episode walks through the media side end-to-end.

**SIP over UDP.** SIP commonly uses UDP for signalling — short messages, low overhead, fast. SIP supplies its own application-layer retransmission timers (T1, T2, Timer B, Timer F) because UDP gives no guarantees. The UDP episode and the chapter on UDP in the book both cover why this is the right design choice for short, independent messages — and why fragmentation is the quiet killer when SDP bodies grow.

**SIP over TCP.** When a SIP message exceeds the path MTU — typically when SDP balloons with ICE candidates or many codecs — RFC 3261 mandates fall-back to TCP. TCP is also preferred for persistent NAT-traversal flows under RFC 5626 "Outbound." The TCP episode covers the underlying stream semantics.

**SIP over TLS.** TLS-protected SIP, called SIPS, runs on port 5061 and is mandatory in modern enterprise deployments — Microsoft Teams Direct Routing requires mTLS to certified SBCs. RFC 5630 is the definitive guide to the `sips:` URI scheme and the surprisingly subtle hop-by-hop semantics. The TLS episode covers the cryptography.

## Visual cues for image generation

- A side-by-side of a SIP INVITE and an HTTP request — both text, both header-and-body, both human-readable. Annotation: same shape, different verbs (INVITE vs GET), different default port (5060 vs 80).
- The INVITE / 100 Trying / 180 Ringing / 200 OK / ACK / BYE flow as a sequence diagram with three lanes — Caller, Proxy, Callee — and an RTP arrow drawn separately, going point-to-point and bypassing the proxy entirely.
- A heat-map of U.S. STIR/SHAKEN coverage in 2025: 85% of inter-Tier-1 traffic signed in green, 17.5% of small-carrier traffic in red, the gap labelled "where the robocalls live."
- A diagram of the SIP ALG pitfall — a consumer router rewriting the `c=` line in an SDP body, breaking the encrypted RTP path. Caption: "this is why your call has one-way audio."
- An IMS architecture pyramid — P-CSCF at the edge, I-CSCF and S-CSCF in the core, HSS off to the side via Diameter, MGCF bridging to the PSTN. Every line labelled SIP except the HSS link.
- An Asterisk console screenshot showing a single REGISTER → 401 → REGISTER-with-Authorization → 200 OK exchange, with the digest nonce and SHA-256 hash highlighted.

## Sources

### RFCs

- [RFC 3261 — SIP](https://www.rfc-editor.org/rfc/rfc3261)
- [RFC 5626 — SIP Outbound](https://datatracker.ietf.org/doc/html/rfc5626)
- [RFC 5630 — The Use of the SIPS URI Scheme](https://www.rfc-editor.org/rfc/rfc5630.html)
- [RFC 6157 — IPv4-to-IPv6 transition for SIP](https://datatracker.ietf.org/doc/html/rfc6157)
- [RFC 6189 — ZRTP](https://datatracker.ietf.org/doc/rfc6189/)
- [RFC 6665 — SIP-Specific Event Notification (replaces 3265)](https://datatracker.ietf.org/doc/html/rfc6665)
- [RFC 7118 — SIP over WebSocket](https://datatracker.ietf.org/doc/html/rfc7118)
- [RFC 8224 — STIR Authenticated Identity](https://datatracker.ietf.org/doc/html/rfc8224)
- [RFC 8760 — Modern SIP digest auth (SHA-256)](https://datatracker.ietf.org/doc/html/rfc8760)
- [RFC 8866 — SDP](https://datatracker.ietf.org/doc/rfc8866/)
- [RFC 8898 — OAuth Bearer auth in SIP](https://datatracker.ietf.org/doc/rfc8898/)
- [draft-hurst-sip-quic-00 — SIP over QUIC](https://datatracker.ietf.org/doc/draft-hurst-sip-quic/)
- [draft-ietf-stir-certificates-shortlived](https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-shortlived/)
- [draft-ietf-stir-certificates-ocsp](https://datatracker.ietf.org/doc/draft-ietf-stir-certificates-ocsp/)
- [draft-ietf-stir-servprovider-oob](https://datatracker.ietf.org/doc/draft-ietf-stir-servprovider-oob/)
- [draft-ietf-sipcore-rfc7976bis](https://datatracker.ietf.org/doc/draft-ietf-sipcore-rfc7976bis/)
- [draft-ietf-sipcore-siprec-fix-mediatype](https://datatracker.ietf.org/doc/draft-ietf-sipcore-siprec-fix-mediatype/)
- [draft-howe-sipcore-mcp-extension-00](https://datatracker.ietf.org/doc/html/draft-howe-sipcore-mcp-extension-00)
- [SIPCORE Working Group](https://datatracker.ietf.org/group/sipcore/about/)

### Vendor and engineering blogs

- [Asterisk: A Brief History of the Project](https://docs.asterisk.org/About-the-Project/A-Brief-History-of-the-Asterisk-Project/)
- [Asterisk: RFC 8760 interoperability notes](https://www.asterisk.org/opensipit01-rfc-8760-interoperability/)
- [Kamailio: April 2026 security advisories](https://www.kamailio.org/w/2026/04/security-advisories-core-and-auth-module-april-7-2026/)
- [Kamailio Wiki / Docs](https://www.kamailio.org/wikidocs/)
- [HOMER / SIPCAPTURE](https://sipcapture.org/)
- [sngrep on GitHub](https://github.com/irontec/sngrep)
- [Cisco Security Advisory: CUCM SIP DoS (CVE-2024-20375)](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-dos-kkHq43We)
- [Cisco Security Advisory: CUCM RCE (CVE-2024-20253)](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-cucm-rce-bWNzQcUm)
- [Microsoft: Teams Direct Routing protocols](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-protocols)
- [Microsoft: Direct Routing what's new](https://learn.microsoft.com/en-us/microsoftteams/direct-routing-whats-new)
- [Twilio: SIP trunking CPS limits](https://www.twilio.com/docs/sip-trunking/cps-trunk-termination)
- [Twilio: high-volume voice considerations](https://www.twilio.com/en-us/blog/high-volume-voice-considerations)
- [Oracle Communications SBC datasheet](https://www.oracle.com/a/ocom/docs/industries/communications/communications-session-border-controller-ds.pdf)
- [3GPP: VoLTE and VoNR](https://www.3gpp.org/technologies/volte-vonr)
- [5G6G Academy: SIP, VoLTE, VoNR](https://www.5g6gacademy.com/learn/sip-volte-vonr)
- [TransNexus blog](https://transnexus.com/blog/)
- [TNS 2026 Robocall Report](https://cfca.org/tns-2026-robocall-report-whats-next-going-further-than-stir-shaken/)
- [Nextiva: disable SIP ALG](https://www.nextiva.com/blog/disable-sip-alg.html)
- [Viirtue: SIP ALG troubleshooting in 2026](https://viirtue.com/how-to-solve-sip-alg-problems-in-2026-a-practical-voip-guide-for-smbs-and-msps/)
- [Assertion: Understanding SIPVicious](https://assertion.cloud/blog/understanding-sip-viscous/)
- [SANS ISC: FreePBX CVE-2025-57819 in the wild](https://isc.sans.edu/diary/32350)

### News and regulatory

- [FCC Eighth Report and Order (DA-25-730A1)](https://docs.fcc.gov/public/attachments/DA-25-730A1.pdf)
- [FCC Fact Sheet — non-IP caller-ID authentication](https://docs.fcc.gov/public/attachments/DOC-410645A1.pdf)
- [Lerman Senter: STIR/SHAKEN requirements effective September 18](https://www.lermansenter.com/stir-shaken-requirements-effective-september-18/)
- [Mintz: 2025-08-28 telephone and texting compliance update](https://www.mintz.com/insights-center/viewpoints/2776/2025-08-28-telephone-and-texting-compliance-news-regulatory-update)
- [GetVoIP: state of robocalls 2025](https://getvoip.com/blog/state-of-robocalls/)
- [Washington UTC: CenturyLink 2018 911 outage penalty](https://www.utc.wa.gov/news/2020/centurylink-faces-72-million-penalty-2018-911-outage)
- [BBC Magazine: AT&T outage caused by misconfigured network element, FCC says](https://bbcmag.com/massive-att-outage-caused-by-misconfigured-network-element-fcc-says/)
- [Benton Institute: AT&T February 2024 outage report](https://www.benton.org/headlines/february-22-2024-att-mobility-network-outage-report-and-findings)

### Papers and books

- [Johnston, *SIP: Understanding the Session Initiation Protocol*, 4e (Artech House)](https://us.artechhouse.com/SIPUnderstanding-the-Session-Initiation-Protocol-Fourth-Edition-P1764.aspx)
- [Henning Schulzrinne — Columbia faculty page](https://www.engineering.columbia.edu/faculty/henning-schulzrinne)

### Wikipedia

- [Session Initiation Protocol](https://en.wikipedia.org/wiki/Session_Initiation_Protocol)
- [Henning Schulzrinne](https://en.wikipedia.org/wiki/Henning_Schulzrinne)
- [INVITE of Death](https://en.wikipedia.org/wiki/INVITE_of_Death)
- [ZRTP](https://en.wikipedia.org/wiki/ZRTP)
- [Asterisk (PBX)](https://en.wikipedia.org/wiki/Asterisk_(PBX))
- [List of TCP and UDP port numbers](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers)
