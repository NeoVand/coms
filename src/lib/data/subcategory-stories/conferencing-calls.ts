import type { SubcategoryStory } from './types';

export const conferencingCallsStory: SubcategoryStory = {
	subcategoryId: 'conferencing-calls',
	tagline:
		"The full call stack — signaling, session description, media transport, and NAT traversal — composing into a browser-native call",
	sections: [
		{
			type: 'narrative',
			title: 'The Anatomy of a Phone Call (Over IP)',
			text: `Most protocols in this app do one thing. The conferencing family does four things, in concert. To make a video call between two browsers, four protocols have to cooperate:\n\n- **[[sip|SIP]]** is the **signaling**: setup, ring, accept, hang up. The phone-call equivalents of "your friend is calling," "they picked up," "they hung up." SIP doesn't carry voice or video — it only negotiates the session.\n- **[[sdp|SDP]]** is the **session description**: what codecs are available, what IP addresses to send media to, what encryption keys to use. SDP is the data; SIP is the envelope.\n- **[[rtp|RTP]]** is the **media transport**: the actual audio and video packets, with sequence numbers and timestamps for reconstruction.\n- **[[webrtc|WebRTC]]** is *all of the above*, packaged for the browser. Behind the WebRTC API, the browser does SDP offer/answer, ICE for NAT traversal, DTLS handshake for keys, SRTP for encrypted media. WebRTC didn't invent any of these protocols — it bundled them into something you can drive from JavaScript.\n\nThis layering is not accidental. It comes from a deep architectural decision the IETF made in the late 1990s: **separate signaling from media**. The phone networks tied them together (the same circuit carried both your "I want to call" and your voice). IP-based calling separated them so signaling could go through one path (often a server) while media could go peer-to-peer. The savings in core-network bandwidth at scale are enormous. The cost is that NAT traversal becomes everyone's problem — which is why the [[ice|ICE]] / [[stun|STUN]] / [[turn|TURN]] machinery exists.\n\nThe modern call from Zoom, Google Meet, Discord, Slack, WhatsApp video, FaceTime, Microsoft Teams — all of them use this stack. The branding differs; the bones are the same.`
		},
		{
			type: 'pioneers',
			title: 'The Call-Stack Architects',
			people: [
				{
					id: 'henning-schulzrinne',
					name: 'Henning Schulzrinne',
					years: '–',
					title: 'Co-author of RTP, RTSP, SIP',
					org: 'Columbia University / FCC',
					contribution:
						"Co-authored [[rtp|RTP]] ([[rfc:3550|RFC 3550]], originally 1996), [[sip|SIP]] (RFC 3261), and RTSP. Three foundational call-stack protocols, one career. Schulzrinne\\'s research at Columbia in the 1990s built the working group consensus that Internet calling needed media transport (RTP), session description (SDP), and signaling (SIP) as separate layers. Also served as CTO of the FCC (2012–2014)."
				},
				{
					id: 'jonathan-rosenberg',
					name: 'Jonathan Rosenberg',
					years: '–',
					title: 'SIP Architect',
					org: 'Cisco / Five9 / Jabber',
					contribution:
						"Co-authored [[sip|SIP]] ([[rfc:3261|RFC 3261]], 2002) and chaired the IETF SIPPING working group through SIP\\'s growth years. Rosenberg also designed key SIP extensions — REFER, PUBLISH, third-party call control — that made SIP usable for enterprise telephony. Later led WebRTC standardization at Cisco; the W3C/IETF coordination that made WebRTC work across browsers was largely Rosenberg\\'s coordination."
				},
				{
					id: 'justin-uberti',
					name: 'Justin Uberti',
					years: '–',
					title: 'WebRTC Co-creator',
					org: 'Google / Clubhouse',
					contribution:
						"Led WebRTC at Google starting in 2010 — the project that turned the existing IETF call-stack protocols into a browser API. Uberti previously worked on Google Talk\\'s voice and video; WebRTC was in some sense his second-generation answer. Co-authored the WebRTC 1.0 spec at W3C and the IETF RTCWEB working group. After Google, joined Clubhouse to build their audio infrastructure, and now works on real-time AI voice."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1996,
					title: 'RTP RFC 1889',
					description:
						"[[pioneer:henning-schulzrinne|Schulzrinne]] and team publish [[rtp|RTP]] — Real-time Transport Protocol. Sequence numbers, timestamps, SSRC identifiers. Designed to ride on UDP for media."
				},
				{
					year: 1996,
					title: 'H.323 Standardized',
					description:
						"The ITU\\'s answer to IP telephony — H.323 — ships first. Complex, ASN.1-encoded, telco-style. Becomes the protocol of early Microsoft NetMeeting and early Cisco call managers."
				},
				{
					year: 1999,
					title: 'SIP Becomes IETF Standard (RFC 2543)',
					description:
						"The IETF response to H.323: [[sip|SIP]] — text-based, HTTP-inspired, much simpler. RFC 2543 published. The \"SIP vs H.323 wars\" begin and last about five years."
				},
				{
					year: 2002,
					title: 'SIP RFC 3261',
					description:
						"The revision that finalized SIP's shape. Within a few years, almost every IP-PBX (Asterisk, Cisco, Avaya), every soft-phone, and most enterprise VoIP runs SIP. H.323 fades."
				},
				{
					year: 2003,
					title: 'Skype Launches',
					description:
						"Skype ships using a fully proprietary peer-to-peer protocol — *not* SIP. The first widely-deployed consumer Internet calling, with its own ideas about NAT traversal and codecs. The lesson: a closed protocol with a great UX can crush an open one for years."
				},
				{
					year: 2005,
					title: 'STUN RFC 3489',
					description:
						"[[stun|STUN]] — Session Traversal Utilities for NAT — lets a peer discover its public-facing IP address through a NAT. The first piece of NAT-traversal infrastructure for media protocols."
				},
				{
					year: 2010,
					title: 'WHATWG / W3C Start WebRTC',
					description:
						"Google publishes the initial [[webrtc|WebRTC]] proposal at the W3C. The IETF charters the RTCWEB working group. The goal: browser-to-browser audio, video, and data without plugins."
				},
				{
					year: 2013,
					title: 'WebRTC 1.0 Ships in Chrome and Firefox',
					description:
						"Chrome and Firefox implement WebRTC for real-time media. The first cross-browser video calls without Flash or plugins. Hangouts moves from a custom plugin to WebRTC."
				},
				{
					year: 2017,
					title: 'WebRTC 1.0 Becomes W3C Candidate Recommendation',
					description:
						"After seven years of standardization, WebRTC 1.0 finalizes. Apple Safari ships WebRTC support, making it truly cross-browser. WebRTC becomes the default for video calling on the web."
				},
				{
					year: 2020,
					title: 'WebRTC Saves the Pandemic',
					description:
						"COVID lockdowns push every video-calling product to record load. Zoom, Google Meet, Microsoft Teams, Jitsi all scale on infrastructure that's WebRTC at the edge (or close to it). The protocols designed for a few thousand simultaneous calls now carry hundreds of millions."
				},
				{
					year: 2024,
					title: 'WebRTC over QUIC Experiments',
					description:
						"WebTransport (QUIC streams in the browser) opens experiments with non-RTP media. WebCodecs API lets JavaScript directly encode and decode video frames. \"Custom WebRTC\" — using QUIC + WebCodecs instead of the built-in stack — appears in production at Google Stadia's successor projects and some streaming startups."
				}
			]
		},
		{
			type: 'comparison',
			title: 'The Four Layers',
			axes: ['Role', 'Wire format', 'Carries...', 'Equivalent in PSTN'],
			rows: [
				{
					label: '[[sip|SIP]]',
					values: [
						'Signaling — call setup, teardown, control',
						'Text (HTTP-like), runs over UDP/TCP/TLS/WebSocket',
						'INVITE / 200 OK / ACK / BYE messages',
						"SS7 setup messages (the telco signaling network)"
					]
				},
				{
					label: '[[sdp|SDP]]',
					values: [
						'Session description — "what codecs, what addresses, what keys"',
						'Text — `v=`, `m=`, `c=`, `a=` lines',
						'Capability negotiation, embedded in SIP messages',
						'(No PSTN equivalent — circuits had fixed capabilities)'
					]
				},
				{
					label: '[[rtp|RTP]]',
					values: [
						'Media transport — actual audio/video packets',
						'Binary over UDP (or DTLS in WebRTC)',
						'Encoded media frames with sequence + timestamp',
						'The voice channel of the phone call'
					]
				},
				{
					label: '[[webrtc|WebRTC]]',
					values: [
						'Browser-native packaging of all of the above',
						'JavaScript API + the protocols underneath',
						'Audio, video, and data channels',
						"(Browser API, not a PSTN equivalent)"
					]
				}
			],
			note: "[[webrtc|WebRTC]] *contains* the other three. When you use `RTCPeerConnection`, the browser does SDP offer/answer, ICE/STUN/TURN for NAT, DTLS handshake, then sends SRTP-encrypted [[rtp|RTP]]. The signaling channel (how the two browsers exchange SDP) is *not* part of WebRTC — you bring your own, usually a WebSocket or a SIP-over-WebSocket gateway."
		},
		{
			type: 'animated-sequence',
			title: 'WebRTC Call Setup',
			definition: `sequenceDiagram
    participant A as Browser A
    participant SIG as Signaling
    participant STUN as STUN
    participant TURN as TURN
    participant B as Browser B
    Note over A,B: Phase 1 — Signaling, app-chosen protocol
    A->>SIG: connect
    B->>SIG: connect
    Note over A,B: Phase 2 — Offer / Answer via signaling
    A->>A: createOffer produces SDP
    A->>SIG: offer
    SIG->>B: offer
    B->>B: setRemoteDescription, createAnswer
    B->>SIG: answer
    SIG->>A: answer
    Note over A,B: Phase 3 — ICE candidate gathering
    A->>STUN: Binding request
    STUN-->>A: public IP and port server-reflexive candidate
    A->>TURN: Allocate as fallback
    TURN-->>A: relayed candidate
    A->>SIG: ICE candidates
    SIG->>B: ICE candidates
    B->>SIG: ICE candidates
    SIG->>A: ICE candidates
    Note over A,B: Phase 4 — Connectivity checks
    A->>B: STUN binding try direct
    B-->>A: STUN binding response
    Note over A,B: Direct path works — TURN not needed
    Note over A,B: Phase 5 — DTLS and SRTP media
    A->>B: DTLS handshake for keys
    A->>B: SRTP audio and video frames
    B-->>A: SRTP audio and video frames`,
			caption:
				"The call setup is a five-phase dance. Signaling negotiates *what* (codecs, capabilities). ICE figures out *how* (which network path actually works). DTLS sets up *keys*. Only then does media (SRTP) start flowing. All of this happens behind a one-line JavaScript API.",
			steps: {
				0: '**Phase 1 — Signaling.** Before the two peers can talk to each other, they need a way to *exchange* setup info. WebRTC deliberately does not specify this — you bring your own (typically a WebSocket to a server you run).',
				1: 'Browser A connects to the signaling server. Could be your chat backend, a Firebase channel, a custom WebSocket service.',
				2: 'Browser B connects to the same signaling server.',
				3: '**Phase 2 — Offer / Answer.** SDP is the data format that describes a session: "I support these codecs, here\'s the cipher I propose, here\'s where I\'ll send media."',
				4: 'Browser A calls `pc.createOffer()`. The browser produces an SDP describing its capabilities.',
				5: 'A sends the offer to the signaling server — to be relayed to B.',
				6: 'Signaling forwards the offer to B. (Signaling is just a pipe here; it does not understand SDP.)',
				7: 'B calls `setRemoteDescription(offer)` then `createAnswer()` to produce its own SDP.',
				8: 'B sends the answer back through signaling.',
				9: 'Signaling relays the answer to A. Both peers now have matching SDPs.',
				10: '**Phase 3 — ICE candidate gathering.** Each peer now needs to discover what IP addresses and ports the *other* peer can actually reach it on. NAT makes this non-trivial.',
				11: 'A asks STUN: **"what does my public address look like from outside the NAT?"**',
				12: 'STUN responds with A\'s server-reflexive candidate — its public IP and port.',
				13: 'A also asks TURN to **allocate a relay**, in case direct connectivity fails. TURN sits on a public address and forwards traffic.',
				14: 'TURN gives A a **relayed candidate** — an address that, if B sends to it, will forward to A.',
				15: 'A sends its candidates to B via signaling. (B does the same — abbreviated here.)',
				16: 'Signaling relays A\'s candidates to B.',
				17: 'B sends its candidates back.',
				18: 'Signaling relays B\'s candidates to A. Both peers now know every possible address to try.',
				19: '**Phase 4 — Connectivity checks.** Each peer pings every candidate pair with STUN binding requests to find which path actually works.',
				20: 'A sends a STUN binding to B\'s direct address. (If A and B can\'t reach each other directly, this fails and ICE falls back to a TURN-relayed pair.)',
				21: 'B responds. **A direct path works** — the most expensive path (TURN relay) won\'t be needed for this call.',
				22: '**TURN not needed.** ~75% of WebRTC calls find a direct path; the rest fall back to TURN at the cost of double bandwidth.',
				23: '**Phase 5 — Media flows.** Before audio/video can be sent, the two peers exchange DTLS handshakes to derive SRTP keys. *No* keys are sent in cleartext.',
				24: 'A initiates the **DTLS handshake** directly with B (no third party). The result is a pair of SRTP keys.',
				25: '**SRTP frames** flow from A to B — encrypted audio and video packets, each with sequence numbers and timestamps.',
				26: 'SRTP frames flow back from B to A. The call is on.'
			}
		},
		{
			type: 'callout',
			title: 'NAT Traversal Is the Hard Part',
			text: `Most of the engineering complexity in modern video calling isn't the codecs or the protocols. It's **NAT traversal**.\n\nMost browsers running video calls are behind home routers, corporate firewalls, or carrier-grade NATs. None of them have a public IP. None of them can be directly contacted from the outside Internet. So how do two peers behind NATs send packets directly to each other? The answer is the {{ice|ICE}} framework, composed of:\n\n- **{{stun|STUN}}** — a tiny protocol where a peer asks a public server "what does my public IP and port look like to you?" The server replies with the address as seen from outside the NAT. The peer now knows its server-reflexive candidate.\n- **{{turn|TURN}}** — when direct connectivity is impossible (symmetric NAT, restrictive firewall), TURN relays the media through a public server. Both peers send media to TURN; TURN forwards to the other peer. Works but doubles the bandwidth cost and adds latency.\n- **ICE** — the framework that gathers all possible candidates (host, server-reflexive, relayed), exchanges them via signaling, and probes pairwise connectivity to pick the best working path.\n\nIn production, ICE finds a direct path for ~75% of WebRTC calls (host-to-host or via STUN). The remaining ~25% require TURN relay. TURN servers are expensive (they pay for the relay bandwidth) and are why running a self-hosted Jitsi or Asterisk involves more than spinning up one box.\n\nNAT traversal is also why peer-to-peer messaging at scale (BitTorrent, blockchain peer discovery, IPFS) ends up looking suspiciously similar to WebRTC underneath. The problem is the same: how to find a direct path through hostile middleboxes.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[sip|SIP]]'s failure mode is **dialogs through middleboxes**. SIP messages reference IP addresses and ports in their body (in SDP and in headers like Contact, Via, Record-Route). Every NAT, firewall, or SIP-aware proxy in the path may need to rewrite these. SIP-ALG (Application Layer Gateway) implementations in consumer routers are notoriously buggy — they break calls more often than they help. The standard advice in the VoIP industry is "disable SIP-ALG on your router."\n\n[[rtp|RTP]]'s failure mode is **jitter and loss**. Real-time media can't wait for retransmission — by the time TCP would have re-sent a lost frame, the user has heard the gap. Solutions include forward error correction (RTP FEC), packet-loss concealment (the codec guesses what the missing frame sounded like), and adaptive jitter buffers. WebRTC's built-in stack handles a lot of this automatically, which is part of why "use WebRTC" is the right answer instead of "use RTP directly" for most teams.\n\n[[webrtc|WebRTC]]'s failure mode is **complexity**. WebRTC is "easy" in the sense that the browser API is small. It is brutally hard once you go beyond simple peer-to-peer: scaling to many participants (you need an SFU — Selective Forwarding Unit, like Jitsi, mediasoup, LiveKit), recording, simulcast/SVC for bandwidth adaptation, network resilience for cellular. Most products that "use WebRTC" actually use WebRTC at the browser and a complex media server (often based on libwebrtc) behind the scenes. The "peer-to-peer" promise is true for 1:1 calls and rare for group calls.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **WebRTC + WebCodecs + WebTransport** — the "custom WebRTC" pattern where apps bypass the built-in stack and assemble their own from lower-level browser primitives. Better control over codecs, latency, and bandwidth — at the cost of reimplementing what WebRTC gave you for free.\n- **AV1 in WebRTC** — Chrome and Firefox now negotiate AV1 by default for screen sharing; software encoders are catching up for video. ~30% bandwidth savings at the same quality.\n- **AI noise suppression and background blur** moved to client-side TensorFlow.js or native models. Krisp, NVIDIA Maxine, and built-in Zoom/Teams/Meet features all happen *before* the codec sees the frame — turning bad audio into clean audio invisibly.\n- **Spatial audio** in conferencing (Zoom, Teams) places each participant in 3D space. Reduces fatigue at the cost of more processing per stream.\n- **Real-time AI voice** (OpenAI Realtime API, Google Gemini Live, ElevenLabs streaming) is the new "what does the call stack do?" question. The answer: probably WebRTC, plus WebSocket or QUIC for the AI side. The stack designed for human-to-human is now carrying human-to-AI calls at growing scale.\n- **WHIP / WHEP** (WebRTC ingest and egress over HTTP) — the same simplification that's replacing RTMP for ingestion may eventually displace SIP for one-way broadcasting too.`
		}
	]
};
