/**
 * Part VII — Real-time A/V.
 *
 * Protocols that prioritise low latency over perfect delivery —
 * voice, video, and live media. Multi-section chapters drawn from
 * the research files in /research, with citation-backed dates and
 * deployment numbers.
 */

import type { BookPart } from '../types';

export const realtimeAv: BookPart = {
	id: 'realtime-av',
	title: 'Real-time A/V',
	label: 'VIII',
	description:
		'Protocols that prioritise low {{latency|latency}} over perfect delivery — [[sip|voice]], [[webrtc|video]], and [[hls|live media]].',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'rtp-and-rtcp',
			title: 'RTP and RTCP',
			synopsis: '[[rtp|Carrying media on top of UDP]] — the protocol born from MBone in 1992.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Every [[rtp|RTP]] packet on Earth has a version field of "2" because version 0 was Steve Casner\'s 1992 vat audio tool wire format. Thirty-four years later, the historical fingerprint is still on every voice call.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Datagram Per Frame, A Timestamp Per Packet',
							text: `[[rtp|RTP]] (Real-time Transport Protocol) is the protocol that runs underneath every voice call, video conference, and {{broadcast|broadcast}} media stream on the internet.

Its origin is unusually specific: in **March 1992**, Steve Casner, [[pioneer:van-jacobson|Van Jacobson]], and [[pioneer:steve-deering|Steve Deering]] audio-cast the {{ietf|IETF}} San Diego meeting to ~20 sites over the new {{multicast|Multicast}} Backbone (the "MBone"). The protocol that came out of that work was published as **[[rfc:1889|RFC 1889]] in January 1996** and re-issued as **[[rfc:3550|RFC 3550]] in July 2003** (Schulzrinne, Casner, Frederick, Jacobson) — still the canonical text in 2026.

[[rtp|RTP]] rides on top of [[udp|UDP]] because **late audio is worse than missing audio** — retransmitting a packet that arrives 200 ms late delivers something the receiver cannot use. [[rtp|RTP]] adds three things to a [[udp|UDP]] datagram: a **{{sequence-number|sequence number}}** so the receiver can detect loss and reorder packets, a **timestamp** so playback can be paced correctly, and a **{{payload|payload}} type** field that names the {{codec|codec}}.`
						},
						{
							type: 'narrative',
							title: 'The Subtle Design Choice That Saved SRTP',
							text: `[[rtp|RTP]] requires both the {{sequence-number|sequence number}} and the timestamp to **start from random initial values**, not zero. This was a 1996 design decision — the spec authors thought it was good practice for synchronisation. It turned out to be **load-bearing for {{srtp|SRTP}}'s AES-CTR nonces eight years later**: random sequence numbers are the entropy that keeps the per-packet AES counter unique across reboots and re-keys.

The companion **{{rtcp|RTCP}}** ([[rtp|RTP]] Control Protocol) flows alongside, carrying receiver reports (loss rates, {{jitter|jitter}}), sender reports (mapping wall-clock time to [[rtp|RTP]] timestamps for cross-stream sync), and source descriptions (CNAME, the canonical participant identifier). {{rtcp|RTCP}} is what lets a video conferencing client detect that 8% of audio packets are being dropped and adapt the {{codec|codec}} down.

**RFC 8888 (2020)** finally unified per-packet {{rtcp|RTCP}} feedback formats for {{google|Google}} {{congestion-control|Congestion Control}} (GCC), {{cisco|Cisco}} NADA (RFC 8698), and Ericsson SCReAM (RFC 8298). **{{l4s|L4S}}/{{ecn|ECN}}-marked feedback** is now live in libwebrtc behind the field trial \`[[webrtc|WebRTC]]-RFC8888CongestionControlFeedback/Enabled\` — the bridge from [[rtp|RTP]] into the [[frontier:l4s-comcast-launch|L4S frontier]].`
						},
						{
							type: 'callout',
							title: 'SFrame finally standardized in August 2024',
							text: '**[[rfc:9605|RFC 9605]] (August 2024)** finally standardized **SFrame** — end-to-end frame-level {{encryption|encryption}} that travels through SFUs without decryption. [[pioneer:justin-uberti|Justin Uberti]] and Emad Omara "scribbled the original idea on a whiteboard in 2018." Discord\'s **DAVE protocol** (deployed 1 March 2026) layers MLS keys + SFrame on top of [[rtp|RTP]]/{{srtp|SRTP}} for E2EE voice across **2.5 million concurrent users**.'
						},
						{
							type: 'narrative',
							title: 'Discord, Zoom, and the SFU Reality',
							text: `Discord's homegrown C++ SFU forwards [[rtp|RTP]] for **2.5 million concurrent voice users across 850+ voice servers in 13 regions and 30+ data centers**. That is the largest publicly documented [[rtp|RTP]] fleet on the internet. To save CPU at that scale, Discord **swapped {{dtls|DTLS}}-{{srtp|SRTP}} for libsodium's xsalsa20_poly1305** in their custom libwebrtc fork — illustrating the field axiom that **the standard is the floor, not the ceiling**.

The 2020 Citizen Lab **Zoom disclosure** revealed Zoom wrapped [[rtp|RTP]] in a custom transport over [[udp|UDP]]/8801 and encrypted it with **AES-128-ECB** — leaking patterns in encrypted video frames. Industry pressure forced a switch to {{aes-gcm|AES-GCM}} and ultimately E2EE.

Asterisk had its own [[rtp|RTP]] security incident in 2017: **AST-2017-008/-012 ("Asterisk [[rtp|RTP]] Bleed")** showed that Asterisk's \`strictrtp\` port-latching had no authentication, so flooding the [[udp|UDP]] port range at 28-168 MB/s could "re-train" the media flow to an attacker. The first patch missed {{rtcp|RTCP}} and a race condition, requiring a second advisory.`
						},
						{
							type: 'narrative',
							title: 'RTP-over-QUIC — The Frontier',
							text: `**[[rtp|RTP]]-over-[[quic|QUIC]] (RoQ)** — \`draft-{{ietf|ietf}}-avtcore-rtp-over-quic-14\` — entered Working Group Last Call in **July 2025**. {{alpn|ALPN}} token \`roq\`. Multiplexes [[rtp|RTP]] sessions over one [[quic|QUIC]] connection; preserves the entire [[rtp|RTP]] ecosystem while gaining [[quic|QUIC]]'s {{encryption|encryption}}, {{nat|NAT}}-friendliness, and {{zero-rtt|0-RTT}}.

Active 2025-2026 work in the {{ietf|IETF}} AVTCORE WG: **RFC 9628 (2024)** finally promoted the VP9 [[rtp|RTP]] {{payload|payload}} format to Standards Track. Drafts in flight cover haptics, V3C volumetric video, JPEG XS 3rd edition, APV {{codec|codec}}, and an HEVC/H.265 [[webrtc|WebRTC]] profile (\`draft-{{ietf|ietf}}-avtcore-hevc-webrtc-08\`, March 2026). [[rtp|RTP]] keeps acquiring new {{payload|payload}} formats forty years after Casner first audio-cast {{ietf|IETF}} San Diego.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Polycom_VSX_7000_with_2_video_conferencing_screens.JPG/500px-Polycom_VSX_7000_with_2_video_conferencing_screens.JPG',
							alt: 'A Polycom VSX 7000 video-conferencing system with two screens.',
							caption:
								'A **Polycom VSX 7000** video-conferencing system — the early-2000s enterprise hardware whose audio and video both rode [[rtp|RTP]] under the hood. From the 1992 MBone audio-cast that produced [[rtp|RTP]]\'s wire format to today\'s ~2.5M-concurrent Discord voice fleet, the same {{sequence-number|Sequence Number}} + Timestamp + {{payload|Payload}} Type fields have carried voice and video across every generation of conferencing hardware.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'protocol', id: 'rtp' },
				{ kind: 'pioneer', id: 'van-jacobson' },
				{ kind: 'frontier', id: 'l4s-comcast-launch' },
				{ kind: 'simulation', protocolId: 'rtp' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'webrtc',
			title: 'WebRTC',
			synopsis: '{{peer-to-peer|Peer-to-peer}} in the browser, ICE/{{stun|STUN}}/{{turn|TURN}}, {{dtls|DTLS}}, {{srtp|SRTP}} — and the only way for a browser to send a [[udp|UDP]] packet.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[webrtc|WebRTC]] is the only way for a web browser to send a [[udp|UDP]] packet. Every [[websockets|WebSocket]], fetch, {{http2-stream|HTTP/2 stream}}, and even {{webtransport|WebTransport}} datagram before March 2026 was either [[tcp|TCP]] or [[quic|QUIC]] under browser control with no {{peer-to-peer|peer-to-peer}} mode.',
					attribution: 'Cloudflare engineering blog'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The $68 Million Acquisition That Made WebRTC',
							text: `[[webrtc|WebRTC]] is a {{peer-to-peer|peer-to-peer}} media stack the {{w3c|W3C}} standardised between 2011 and 2021. The premise was audacious: enable a web page, in a sandboxed browser tab, to capture audio and video from a user's microphone and camera and stream them directly to another browser — without a plugin, without a server in the media path, with sub-200 ms {{latency|latency}}.

The audio engine was bought, not built: in **May 2010 {{google|Google}} paid USD 68.2 million for Global [[ip|IP]] Solutions (GIPS)** specifically because GIPS's NetEQ {{jitter|jitter}} buffer was already running on **800 million endpoints**. {{google|Google}} open-sourced it in 2011 as \`libwebrtc\`. By end-2018, libwebrtc reached **1.21 million lines of code** — three times the size of the Space Shuttle's onboard software (per Justin Uberti's 2019 figure).`
						},
						{
							type: 'narrative',
							title: 'NAT Traversal — The Hard Part',
							text: `Two browsers behind home routers cannot just open a connection to each other; their public-facing addresses are different from their private ones. [[webrtc|WebRTC]] uses **ICE** (Interactive Connectivity Establishment, [[rfc:8445|RFC 8445]]) — a coordinated dance where each {{peer|peer}} gathers candidate addresses from {{stun|STUN}} servers ([[rfc:8489|RFC 8489]]), sends them to the other {{peer|peer}} via a signalling channel (the developer's choice — often [[websockets|WebSocket]]), and probes connectivity over each candidate pair. When direct [[udp|UDP]] fails, **{{turn|TURN}}** ([[rfc:8656|RFC 8656]]) relays through a third party.

The media itself is [[rtp|RTP]] wrapped in **{{srtp|SRTP}}** (Secure [[rtp|RTP]], RFC 3711), with keys established through **{{dtls|DTLS}}** (Datagram [[tls|TLS]]) over the same connection. [[webrtc|WebRTC]] also offers **DataChannel** for arbitrary application data over the same connection — useful for in-game state sync alongside voice chat.

**The {{codec|codec}} wars ended in a draw**: [[rfc:9000|RFC 7742]] (March 2016) mandates *both* VP8 and H.264 Constrained Baseline as MTI video codecs. {{cisco|Cisco}} neutralized H.264 patents by open-sourcing OpenH264 and paying MPEG-LA royalties on its behalf — without that, [[webrtc|WebRTC]]-in-Safari would have been impossible.`
						},
						{
							type: 'callout',
							title: 'AV1 came from screen-share',
							text: '**AV1 went default-on for screen-share in {{google|Google}} Meet in 2024.** AV1 hardware encode shipped in Chrome M120 (Dec 2023). Firefox 125 added AV1+EME in April 2024. But the royalty-free claim has a new asterisk: on **23 March 2026 Dolby filed AV1+HEVC patent suits against Snap**, re-opening the question of whether AV1 is actually patent-clean. The {{codec|codec}} wars never end.'
						},
						{
							type: 'narrative',
							title: 'CVE-2023-7024 and the libwebrtc Blast Radius',
							text: `**CVE-2023-7024 (December 2023)** — a heap buffer overflow in libwebrtc's \`WebRtcAudioSink::OnSetFormat\` was exploited in the wild as Chrome's 8th zero-day of 2023. Fixed in 120.0.6099.129. CISA added it to the Known Exploited Vulnerabilities catalog January 2024.

The blast radius mattered: the **same vulnerable libwebrtc code shipped in Edge, Brave, Firefox, and Safari**. One bug, one library, every browser. This is the structural cost of consolidation — \`libwebrtc\` is to real-time media what OpenSSL is to [[tls|TLS]], with the same risk profile.

The 2021–2026 spec refresh shipped a generation of follow-ons: **RFC 9143 (Feb 2022) BUNDLE**, **RFC 9147 (April 2022) {{dtls|DTLS}} 1.3**, **RFC 9335 (Jan 2023) {{srtp|SRTP}} Cryptex**, **RFC 9429 (April 2024) JSEP-bis**, **[[rfc:9605|RFC 9605]] (Aug 2024) SFrame**, **RFC 9725 (March 2025) WHIP** (replacing a generation of ad-hoc [[websockets|WebSocket]] signalling for ingest).`
						},
						{
							type: 'narrative',
							title: 'The Discord Voice Outage Post-Mortem',
							text: `On **25 March 2026**, Discord had a major voice outage. The post-mortem published the next week is required reading.

A Kubernetes scale-down of Elixir voice-syncer pods caused massive HTTPS reconnection storms. Erlang \`gun\` selective-receive over ~1M-message mailboxes added ~1 ms per spawn at 100 spawns/sec. The system never recovered without manual intervention.

The lesson — repeated across the field — is that **the media plane in [[webrtc|WebRTC]] is robust; the {{signaling|signaling}} plane is where outages happen**. [[rtp|RTP]] keeps flowing once a connection is established; getting connections established and re-established is where every production [[webrtc|WebRTC]] deployment burns most of its operational complexity.

Plan B [[sdp|SDP]] is fully gone now: deprecation-warned in Chrome M89 (Feb 2021), removed in M93 (Aug 2021) with a Reverse Origin Trial through M96 (Jan 2022). All \`sdpSemantics\` flag handling was finally removed from Chromium in 2024. Unified Plan is the only remaining [[sdp|SDP]] semantics.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Video_Conference_Using_Laptop.jpg/500px-Video_Conference_Using_Laptop.jpg',
							alt: 'A laptop with a video conferencing application showing multiple participants.',
							caption:
								'A laptop video call — what the [[webrtc|WebRTC]] stack actually produces in the user\'s seat. Underneath: a {{ble|BLE}}-discovered camera, {{ice-candidate|ICE candidate}} gathering, a {{dtls|DTLS}}-keyed {{srtp|SRTP}} flow over [[udp|UDP]], NetEQ in the audio path, libwebrtc compiled into the browser. **1.21 million lines of code** in libwebrtc — three times the size of the Space Shuttle\'s onboard software, and it boots in under a second.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'protocol', id: 'webrtc' },
				{ kind: 'simulation', protocolId: 'webrtc' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'sip-and-sdp',
			title: 'SIP and SDP',
			synopsis: '[[pioneer:henning-schulzrinne|Henning Schulzrinne]] wrote three protocols ([[sip|SIP]], [[sdp|SDP]], [[rtp|RTP]]) that carry the world\'s phone calls.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The `sips:` URI scheme means [[tls|TLS]] hop-by-hop only, NOT end-to-end like `https:`. [[rfc:5630|RFC 5630]] (2009) explicitly warns against the padlock-icon intuition. Forty years in, this is still where engineers get burned.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Phone Call as an HTTP Conversation',
							text: `When you place a {{voip|VoIP}} call, two protocols work in tandem before any audio flows. **[[sip|SIP]]** (Session Initiation Protocol) is the signalling layer — text-based, request/response shaped like [[http1|HTTP]], with verbs like INVITE, {{ack|ACK}}, BYE, REGISTER. [[sip|SIP]] locates the callee (through registration servers and proxies that resolve \`sip:alice@example.com\`), negotiates capability, and sets up or tears down the session.

Both [[sip|SIP]] and [[sdp|SDP]] — and [[rtp|RTP]] above them — were authored by **[[pioneer:henning-schulzrinne|Henning Schulzrinne]]**, a Columbia University professor who has authored more than 70 RFCs, served as FCC CTO three times, and was inducted into the Internet Hall of Fame in 2013.

**[[sip|SIP]]'s first standard [[rfc:2543|RFC 2543]] (March 1999)** was completely rewritten as **[[rfc:3261|RFC 3261]] in June 2002** by Rosenberg, Schulzrinne, Camarillo, Johnston, Peterson, Sparks, Handley, Schooler — still the canonical text 24 years later.`
						},
						{
							type: 'narrative',
							title: 'SDP — Session Description From the MBone',
							text: `**[[sdp|SDP]]** (Session Description Protocol) carries the actual session parameters inside [[sip|SIP]] messages: which codecs each side supports, what ports they will use for [[rtp|RTP]], what crypto keys they propose. [[sdp|SDP]] began life inside Mark Handley and [[pioneer:van-jacobson|Van Jacobson]]'s MBone work for the \`sdr\` session-directory tool. **[[rfc:2327|RFC 2327]] (April 1998)** by Handley & Jacobson was the first Proposed Standard. After RFC 4566 (2006) the current spec is **[[rfc:8866|RFC 8866]] (January 2021)**.

Twenty-eight years in, the protocol-version line is still \`v=0\`. The [[sdp|SDP]] "offer/answer" {{exchange|exchange}} — one side offers their capability, the other answers with the subset they accept — became the standard pattern for media negotiation everywhere, including [[webrtc|WebRTC]].`
						},
						{
							type: 'callout',
							title: 'The 911 outages keep happening',
							text: 'The **AT&T 22 February 2024 outage** disconnected 125 million devices and blocked ~25,000 911 calls — caused by a single misconfigured network element during expansion, surfacing as IMS/[[sip|SIP]] registration failures. The **CenturyLink December 2018 911 outage** lost 911 service for 7.4 million Washington residents for 49 hours; 24,000 calls failed; Washington UTC fined them $7.2 M. **VoLTE/VoNR is the world\'s largest [[sip|SIP]] deployment** — {{gsma|GSMA}} reports 310+ VoLTE operators in 140+ countries and 45+ commercial VoNR networks by 2025 — and the failure modes ripple straight into emergency services.'
						},
						{
							type: 'narrative',
							title: 'STIR/SHAKEN — The Robocall Cold War',
							text: `STIR/SHAKEN is the protocol family that lets carriers cryptographically attest "yes, this caller ID is real" — the long-running attempt to fix robocalls. It is not new: STIR (RFC 8224) was published in 2018; SHAKEN was framework-level guidance from the [[sip|SIP]] Forum / ATIS in 2017.

The 2024-2026 milestone: **FCC Eighth Report & Order (adopted 21 Nov 2024) tightened STIR/SHAKEN compliance, taking effect 18 September 2025**. U.S. obligated providers must now sign with their *own* SPC certificates rather than a third party.

But the 2026 reality check is mixed: TNS's 2026 report finds **85% of inter-Tier-1 traffic is now STIR/SHAKEN-signed (93% at A-level)**, but only **17.5% of traffic between smaller carriers is signed**. U.S. robocalls dropped only ~1% year-over-year in 2025. STIR/SHAKEN is a partial solve; the long tail of small carriers remains the loophole.`
						},
						{
							type: 'narrative',
							title: 'The Asterisk and ZRTP Footnotes',
							text: `Two pieces of [[sip|SIP]] folklore worth keeping.

**Asterisk's $50K trigger story**: Mark Spencer was quoted >$50,000 for a PBX in 1999 for his {{linux|Linux}}-support startup. He wrote Asterisk himself in a few months and named it after the \`*\` DTMF key. Now ten-million-plus deployments worldwide, the dominant open-source PBX.

**ZRTP (RFC 6189)** is the only protocol named for its inventor — **Phil "Z" Zimmermann** (PGP). Its **Short Authentication Strings** are read aloud between humans to detect MITMs: the two callers speak the same 4-digit hash; if they match, the channel is authenticated. ZRTP remains the standard against which other end-to-end voice security schemes are measured.

The cryptography is slowly tightening: **RFC 8760 (March 2020)** finally deprecated MD5 in [[sip|SIP]] digest auth in favor of SHA-256 / SHA-512-256. But PJSIP/Asterisk only added SHA-256 outbound support in 2023-2024, so most real deployments still negotiate MD5. The protocol is modern; the deployed installed base is two decades behind.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/SIP_session_setup_example.svg/500px-SIP_session_setup_example.svg.png',
							alt: 'SIP session setup example — INVITE, 100 Trying, 180 Ringing, 200 OK, ACK, media, BYE.',
							caption:
								'A canonical **[[sip|SIP]]** session: INVITE → 100 Trying → 180 Ringing → 200 OK → ACK → media flows → BYE. The same shape as an HTTP {{request-response|request/response}}, with a few extra status codes for telephony semantics. By 2025 {{gsma|GSMA}} reported **310+ commercial VoLTE operators** in 140+ countries — the largest [[sip|SIP]] deployment on Earth runs inside [[cellular|cellular]] {{ims|IMS}} cores.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
						}
					]
				},
				{ kind: 'protocol', id: 'sip' },
				{ kind: 'protocol', id: 'sdp' },
				{ kind: 'outage', id: 'att-mobility-2024' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'hls-and-dash',
			title: 'HLS and DASH',
			synopsis: '[[hls|HLS]] and [[dash|DASH]] — adaptive bitrate over plain HTTP, and the M3U playlist Winamp left behind.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The world\'s most-deployed video protocol still starts every playlist with `#EXTM3U` — the format Fraunhofer created in 1995 for WinPlay3 and Nullsoft popularised in Winamp on 21 April 1997.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Streaming Without Streaming Servers',
							text: `Until 2008, live video streaming required specialised streaming servers and protocols ([[rtmp|RTMP]], MMS, RTSP) — separate infrastructure from the web servers that delivered everything else.

{{apple|Apple}} changed that with **[[hls|HLS]]** (HTTP Live Streaming), which **shipped on 17 June 2009 with iPhone OS 3.0 / iPhone 3GS** — created at {{apple|Apple}} by Roger Pantos and William May Jr. The 2007/2008 iPhone had no Flash, and {{apple|Apple}} needed something that survived {{nat|NAT}}/firewalls on 3G. Reusing HTTP/443 was a deliberate {{firewall|firewall}}-traversal play.

The trick was breaking the stream into **2-10 second segments**, each a regular .ts (or later .mp4/CMAF) file accessible via plain [[http1|HTTP]]. A small **playlist** file (.m3u8) lists the segments in order. The client downloads the playlist, fetches segments, and plays them. To support multiple bitrates, the server publishes parallel playlists (240p, 480p, 1080p, 4K) and a master playlist; the client switches bitrates between segments based on observed {{bandwidth|bandwidth}}.`
						},
						{
							type: 'callout',
							title: 'M3U is a Winamp inheritance',
							text: '[[hls|HLS]]\'s playlist format is **M3U**, which was created in 1995 by Fraunhofer IIS for **WinPlay3** and popularised by **Nullsoft\'s Winamp on 21 April 1997**. The world\'s most-deployed video protocol — the one carrying every live sports event, every Netflix stream, every {{apple|Apple}} TV {{broadcast|broadcast}} — still starts every playlist with `#EXTM3U`. The internet runs on inheritance.'
						},
						{
							type: 'narrative',
							title: 'DASH — The IETF/MPEG Alternative',
							text: `**MPEG-[[dash|DASH]] (ISO/IEC 23009-1)** was first published in **2012** as the standardised version of the same idea. The differences from [[hls|HLS]] are {{codec|codec}} restrictions, {{manifest|manifest}} format ({{xml|XML}} MPD vs M3U8), and licensing. The **5th edition (23009-1:2022)** is freely available via ISO ITTF; the **6th edition (FDIS 23009-1)** reached stage 50.00 by April 2025 and adds **L3D-[[dash|DASH]]/SSR** for sub-second join times.

The "everyone gets this wrong" detail: **{{apple|Apple}} devices have never natively played [[dash|DASH]]**, and **FairPlay still does not work with [[dash|DASH]]** ({{apple|Apple}}'s own developer {{thread|thread}} confirms it). Every iOS app must use [[hls|HLS]] through AVPlayer — [[dash|DASH]] on iOS is a custom-decoder situation. This is the structural reason [[hls|HLS]] won the format war: {{apple|Apple}} wouldn't switch.

**CMAF (ISO/IEC 23000-19)** — the joint {{apple|Apple}}+{{microsoft|Microsoft}} fMP4 proposal at MPEG #114 (San Diego, Feb 2016), first published 2018, 4th edition published 2024 — is what finally lets one set of fMP4 segments serve both [[hls|HLS]] and [[dash|DASH]]. **Disney+ runs 100% [[hls|HLS]]+CMAF end-to-end**.

**[[dash|DASH]]-IF merged into the Streaming Video Technology Alliance (SVTA) on 23 July 2024**, ending its independent existence as a standards organisation.`
						},
						{
							type: 'narrative',
							title: 'Low-Latency, And The "Apple Took It Away" Drama',
							text: `**{{apple|Apple}} announced Low-{{latency|Latency}} [[hls|HLS]] at WWDC 2019 session 502** with a Sydney→Cupertino live demo by Roger Pantos at sub-2-second {{latency|latency}}. The original spec required **[[http2|HTTP/2]] push** — a hard dependency on a feature most CDNs supported poorly.

On **30 April 2020**, after Mux's "the community gave us low-{{latency|latency}} live streaming, then {{apple|Apple}} took it away" backlash, {{apple|Apple}} replaced the [[http2|HTTP/2]] push requirement with **\`EXT-X-PRELOAD-HINT\`** — a simpler, {{cdn|CDN}}-friendly hint that didn't require {{server-push|server push}}. The community had been pushing back for almost a year by that point. The protocol design evolves; the politics of who designs it evolves more slowly.

The 2026 cryptographic milestone: **\`draft-pantos-hls-rfc8216bis-22\` (May 2026) added AES-256-GCM as a permissible [[hls|HLS]] {{encryption|encryption}} method** — the most consequential cryptographic change in nearly a decade, and the bis draft also renamed the "master playlist" to "**Multivariant Playlist**."`
						},
						{
							type: 'narrative',
							title: 'The Latency Cliff and the BOLA Comeback',
							text: `**Super Bowl LVIII (11 February 2024)** measured streaming lag by Phenix: **Fubo 86.75 s, Hulu Live 70.16 s, Paramount+ 42.73 s** — proof that despite "low-{{latency|latency}}" branding, OTT is still 40-80 seconds behind {{broadcast|broadcast}}.

**Peacock's AFC Wild Card game (Chiefs-Dolphins, 13 January 2024)** reached 27.6 million total viewers (~24.6 M concurrent), the most-streamed live event in U.S. history, consuming ~30% of U.S. internet traffic. The **Paris 2024 Olympics on Peacock** delivered 23.5 billion streamed minutes — 40% more than all prior Olympics combined.

**BOLA** (Spiteri/Urgaonkar/Sitaraman) just won the **2026 IEEE INFOCOM Test of Time Award**. The Lyapunov-optimization ABR algorithm has been the dash.js default for years and is "near-optimal" without requiring throughput prediction. **CMCD/CMSD (CTA-5004) became universal** in 2024: native CMCD support shipped in AVPlayer with iOS 18 (WWDC 2024), and **CMCDv2 (CTA-5004-A) was published in February 2026** — letting servers see what their clients are actually doing without the player having to roll a custom telemetry pipeline.

The post-Flash reality: **Adobe Flash Player retired on 31 December 2020**, killing [[rtmp|RTMP]] for delivery. [[rtmp|RTMP]] survives only as the dominant *contribution/ingest* protocol, while Haivision's 2025 {{broadcast|broadcast}} survey found **SRT adoption among professionals reached 77% in 2025** (up from 68% in 2024), surpassing [[rtmp|RTMP]]'s 58%.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Zpracovani_videa_HTTP_Live_Streaming.png/500px-Zpracovani_videa_HTTP_Live_Streaming.png',
							alt: 'HLS architecture diagram — encoder produces multi-bitrate segments, CDN serves them, player adapts bitrate.',
							caption:
								'**[[hls|HLS]]** architecture: an encoder produces parallel multi-bitrate ladders of small .ts (or now .mp4 / CMAF) segments; a CDN serves them over plain HTTP; the client adapts bitrate between segments. Shipped 17 June 2009 with iPhone OS 3.0 / iPhone 3GS — {{apple|Apple}}\'s play to dodge Flash and survive the 2008 3G {{firewall|firewall}} reality by reusing HTTP/443.',
							credit: 'Image: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'protocol', id: 'hls' },
				{ kind: 'protocol', id: 'dash' },
				{ kind: 'comparison', pairIds: ['hls', 'dash'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'moq-transport',
			title: 'MoQ Transport',
			synopsis: 'Sub-second live streaming over [[quic|QUIC]] — the first {{ietf|IETF}} media transport that intentionally is not [[rtp|RTP]].',
			slots: [
				{
					kind: 'pull-quote',
					text: 'MoqTransport has become too complicated. There are too many messages, optional modes, and half-baked features.',
					attribution: 'Luke Curley, draft-lcurley-moq-lite-02 (November 2025)'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Sub-Second Frontier',
							text: `[[hls|HLS]] and [[dash|DASH]] traded {{latency|latency}} for compatibility with the web. For sports, gaming streams, auctions, and interactive broadcasting, that 40-80 second end-to-end delay is intolerable — viewers see the goal scored on Twitter before they see it on their TV. Decade-old solutions ([[rtmp|RTMP]] for ingest, low-{{latency|latency}} [[hls|HLS]], custom [[webrtc|WebRTC]]-based stacks) each solved part of the problem.

**Media over [[quic|QUIC]] (MoQ)** is the first {{ietf|IETF}} media transport that intentionally **is not [[rtp|RTP]]**. \`draft-{{ietf|ietf}}-moq-transport-17\` was published **March 2026**, with co-editors Suhas Nandakumar ({{cisco|Cisco}}), Victor Vasiliev ({{google|Google}}), Ian Swett ({{google|Google}}), and Alan Frindell ({{meta|Meta}}).

MoQT's data model is **{{pub-sub|publish/subscribe}} with relay caches**: media flows as **track > group > subgroup > object**, mapped onto [[quic|QUIC]] streams or unreliable [[quic|QUIC]] datagrams, and runs over either raw [[quic|QUIC]] or {{webtransport|WebTransport}} so it's reachable from browsers.`
						},
						{
							type: 'callout',
							title: 'MoQ is not a WebRTC competitor',
							text: '**MoQ is not a [[webrtc|WebRTC]] competitor in the conversational case.** It\'s optimised for one-to-many {{pub-sub|publish/subscribe}} at {{cdn|CDN}} scale. webrtcHacks\'s "Is everyone switching to MoQ?" rebutted {{cloudflare|Cloudflare}}\'s January 2025 framing, noting that "We\'re joining {{meta|Meta}}, {{google|Google}}, {{cisco|Cisco}}" overstates corporate consensus. MoQ is positioned to replace [[hls|HLS]] for *live* delivery, not replace [[webrtc|WebRTC]] for two-way calls.'
						},
						{
							type: 'narrative',
							title: 'The Spec Forking Inside the Working Group',
							text: `The MoQ spec is being forked from inside the working group. **Luke Curley's \`draft-lcurley-moq-lite-02\`** (November 2025, rev 04 by 2026) explicitly claims *"MoqTransport has become too complicated. There are too many messages, optional modes, and half-baked features."*

This is unusual: a working group co-author publishing a competing draft inside the same WG. The fork suggests the design is not converging. As of the March 2026 {{ietf|IETF}} meeting, MoQ-Lite has support from a small group of implementers; the main draft has the institutional weight. Whether they merge, one wins, or both ship and the market chooses — open question.

The spec has nonetheless attracted serious implementation effort. **NAB 2026 (28 April 2026)** demoed MoQ interop across **eleven vendors** — Ant Media, AWS, Bitmovin, Broadpeak, CacheFly, {{cloudflare|Cloudflare}}, Nomad Media, Oracle, Norsk, Synamedia, Red5 — under a new "OpenMOQ Software Consortium." **{{cloudflare|Cloudflare}} deployed an MoQ relay at every {{cloudflare|Cloudflare}} edge across 330+ cities in 2025** as a beta managed service — the first global MoQ relay network.`
						},
						{
							type: 'narrative',
							title: 'Browsers, Apple, and the Adjacent Path',
							text: `The browser story matured fast: **{{webtransport|WebTransport}} reached cross-browser Baseline status in March/April 2026** (Safari 26.4). Combined with WebCodecs, this is the first time JavaScript can implement non-[[rtp|RTP]] media transports natively. Safari first shipped early {{webtransport|WebTransport}} in **18.4 (March/April 2025)**.

Twitch's MoQ heritage matters: Twitch's internal **"Warp"** [[quic|QUIC]]-based replacement for [[hls|HLS]] (presented at Demuxed 2021) became the seed of the MoQ Working Group's WARP draft.

**End-to-end secure MoQ objects**: \`draft-{{ietf|ietf}}-moq-secure-objects-00\` (March 2026) brings application-layer {{encryption|encryption}} into the spec from day one, mirroring what SFrame retrofitted onto [[rtp|RTP]]. MoQ is being designed to learn from [[rtp|RTP]]'s E2EE retrofit pain.

The honest 2025 {{latency|latency}} landscape:
- Standard [[hls|HLS]]/[[dash|DASH]]: ~6-30 s
- LL-[[hls|HLS]] / LL-[[dash|DASH]]: 2-5 s
- [[webrtc|WebRTC]] SFU: ~50-200 ms
- MoQ target: <1 s at [[hls|HLS]]-style fanout

But Phenix's 2025 Super Bowl study shows the *best* OTT stream (Tubi) was 41 s behind play and the worst (Fubo) was 78 s, vs cable's 50 s and over-the-air's 22 s. **MoQ has no consumer-scale deployment as of May 2026**; {{cloudflare|Cloudflare}}, Bitmovin, and nanocosmos have shipped early production paths but {{apple|Apple}} has notably not endorsed MoQ.

The conservative alternative: **[[rtp|RTP]]-over-[[quic|QUIC]] (RoQ)**. \`draft-{{ietf|ietf}}-avtcore-rtp-over-quic-14\` entered Working Group Last Call July 2025, keeping the entire [[rtp|RTP]]/{{rtcp|RTCP}} ecosystem intact while swapping [[udp|UDP]] for [[quic|QUIC]]. The fork in the road is real.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/AT%26T_Picturephone_%2812721549765%29.jpg/500px-AT%26T_Picturephone_%2812721549765%29.jpg',
							alt: 'The 1964 AT&T Picturephone — an early commercial video-call device.',
							caption:
								'The **AT&T Picturephone**, demonstrated at the 1964 World\'s Fair — the first commercial live video over a telecommunications network. Sixty years and four wholesale rewrites later (analog → ISDN → [[rtp|RTP]]/H.323 → [[webrtc|WebRTC]]), **MoQ over [[quic|QUIC]]** is the latest answer to the question the Picturephone asked: *how do you carry one-to-many live video at scale, in real time, over a network you do not own?* The current draft is `draft-{{ietf|ietf}}-moq-transport-17`; {{cloudflare|Cloudflare}} deployed MoQ relays across 330+ cities through 2025.',
							credit: 'Photo: AT&T Archives / Wikimedia Commons, public domain'
						}
					]
				},
				{ kind: 'frontier', id: 'moq-transport' },
				{ kind: 'protocol', id: 'quic' }
			]
		}
	]
};
