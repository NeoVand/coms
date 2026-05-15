---
id: justin-uberti
type: pioneer
name: Justin Uberti
years: "1975–"
title: Architect of WebRTC and modern voice/video infrastructure
org: OpenAI, ex-Google, ex-Fixie, ex-AOL
podcast_target_minutes: 6
protocols: [webrtc, stun-turn-ice, rtp]
categories: [realtime-av]
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Justin Uberti, architect of WebRTC
  credit: null
visual_cues:
  - "Portrait composition: a software engineer in his late forties at a glass-walled Mountain View office, a Google Meet call open on one monitor and a Wireshark capture of an ICE candidate exchange on the other"
  - "A whiteboard sketch of two laptops behind home routers, dashed lines reaching out through a STUN server, a TURN relay drawn off to the side, the words 'Trickle ICE — RFC 8838' across the top"
  - "Split panel: on the left, the libwebrtc repository tree with the line '~1.21M lines of code' overlaid; on the right, a stylised silhouette of the Space Shuttle with '~400K lines' beneath it, captioned 'roughly 3×'"
  - "An OpenAI-branded laptop in November 2024, a microphone icon pulsing on screen, a ghosted ICE candidate-pair diagram behind it — 'NAT traversal, now for voice agents'"
---

# Justin Uberti

## In one sentence
Justin Uberti is the engineer who spent more than a decade at Google building WebRTC into the plumbing behind Meet, Duo and Stadia, co-authored the IETF specs that made it actually work behind home routers, and in late 2024 carried that same NAT-traversal stack into OpenAI to make real-time voice agents possible.

## The hook (cold-open)
The open-source WebRTC stack — libwebrtc, the C++ codebase that ships inside every Chromium browser and most native real-time apps — grew to roughly 1.21 million lines of code under Justin Uberti's watch at Google. That is about three times the size of the Space Shuttle flight software. For more than a decade he was the Distinguished Engineer responsible for it, the public face of WebRTC at IETF and at Google I/O, and a co-author of the RFCs that made browser-to-browser calls actually traverse home routers. On 25 November 2024 he joined OpenAI to lead Real-Time AI — the moment NAT traversal stopped being a video-call problem and became load-bearing for voice agents.

## The work

### AOL and the early real-time stack
Before Google, Uberti worked on AOL Instant Messenger and the early AIM and AOL real-time media stack. That is the era — late 1990s, early 2000s — when consumer real-time communication on the internet was a pile of proprietary protocols owned by the big portals, and when the engineering problems of presence, NAT traversal and audio codecs were being solved one walled garden at a time. It is the pre-history of everything he did next.

### Google and WebRTC
Uberti spent more than a decade at Google as a Distinguished Engineer, leading the WebRTC architecture that underpins Google Meet, Google Duo, and Stadia, and stewarding the open-source libwebrtc codebase that grew to roughly 1.21 million lines under his watch. WebRTC is the protocol family we cover in the WebRTC episode — peer-to-peer audio, video and data directly between browsers, no plugins. The mechanism story belongs there. The biographical point is that for most of the 2010s, if you used a real-time communication feature in a Google product, or in any Chromium-based browser, or in most native apps that did voice or video, you were running Uberti's team's code.

### Trickle ICE and ICE-PAC
On the standards side, Uberti is a co-author of two of the RFCs that made WebRTC's NAT-traversal layer practical. RFC 8838, published in January 2021, is the Trickle ICE specification — the optimisation that lets endpoints exchange ICE candidates incrementally as they discover them, instead of waiting for the full gathering phase to finish before signalling. It is the reason WebRTC calls connect in a second instead of five. RFC 8863 is ICE-PAC, a patient-and-aggressive nomination tweak to the ICE state machine. Both sit inside the broader STUN, TURN and ICE machinery that we cover in its own episode; defer the mechanism story to the NAT-traversal episode.

### Fixie and Ultravox
After Google, Uberti was CTO of Fixie, where the team built Ultravox — an open-weights, low-latency speech-to-speech model and the real-time voice-agent infrastructure around it. The throughline from libwebrtc to Ultravox is direct: the same NAT traversal, jitter-buffer and codec problems that mattered for browser video calls also matter, more acutely, for a voice agent that has to respond in under a second.

### OpenAI, November 2024
On 25 November 2024 Uberti joined OpenAI to lead Real-Time AI. That hire is itself a signal worth unpacking on the episode. The fact that the leading AI lab brought in the person most associated with WebRTC and ICE to run real-time means that the bottleneck for voice agents is no longer the model — it is the network underneath it. STUN, TURN and ICE — the protocols we cover in the NAT-traversal episode — are now load-bearing for voice agents the same way they have been for video calls.

### The public face
For years Uberti was the person who explained WebRTC to the rest of the industry. He spoke at Google I/O, at IETF working-group meetings, and at Kranky Geek — the long-running developer conference for the real-time communication community. The dump emphasises that visibility deliberately: a lot of what made WebRTC win as a standard rather than as just a Chromium feature was that there was a senior Google engineer in the room at IETF, year after year, willing to argue the design.

## Where they appear in the book
The dump records no book-chapter cross-references for Uberti. His protocol surface is covered in the WebRTC, RTP, and STUN, TURN and ICE episodes; the chapter-level narrative for those protocols is the place to hear the surrounding history.

## See also (other pioneer episodes)
The protocol Uberti spent his Google decade on is WebRTC — the WebRTC episode is where the peer-to-peer browser model and the libwebrtc stack get unpacked in their own right.

The NAT-traversal machinery whose IETF specs he co-authored — STUN, TURN and ICE — has its own episode; that is the place to hear the hole-punching mechanism that Trickle ICE and ICE-PAC both refine.

The transport layer that carries the actual audio and video packets is RTP — the RTP episode covers the real-time packet format that sits underneath everything Uberti shipped.

## Visual cues for image generation
- Portrait, late-forties software engineer at a glass-walled Mountain View office, Google Meet open on one monitor and a Wireshark capture of an ICE candidate exchange on the other.
- Whiteboard sketch of two laptops behind home routers, dashed lines reaching out through a STUN server, a TURN relay off to the side, "Trickle ICE — RFC 8838" written across the top.
- Split panel: on the left, the libwebrtc repository tree with the line "~1.21 million lines of code" overlaid; on the right, a stylised Space Shuttle silhouette captioned "roughly 3×".
- An OpenAI-branded laptop in November 2024, a microphone icon pulsing on screen, a ghosted ICE candidate-pair diagram behind it, with the caption "NAT traversal, now for voice agents."

## Sources

**Wikipedia**
- [Justin Uberti — Wikipedia](https://en.wikipedia.org/wiki/Justin_Uberti)

**Homepage**
- [@juberti on X](https://x.com/juberti)
