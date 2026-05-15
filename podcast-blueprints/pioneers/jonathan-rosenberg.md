---
id: jonathan-rosenberg
type: pioneer
name: Jonathan Rosenberg
years: "1968–"
title: Architect of SIP, STUN, TURN, and ICE
org: Five9, ex-Cisco, Skype, dynamicsoft
podcast_target_minutes: 8
protocols: [sip, sdp, stun, webrtc]
categories: []
related_book_chapters: []
awards:
  - { name: "Pulver VoN Pioneer Award", year: 2000, url: null }
  - { name: "MIT Technology Review TR35", year: 2002, url: null }
image:
  src: null
  alt: Portrait of Jonathan Rosenberg
  credit: null
visual_cues:
  - "Portrait composition: a protocol architect at a desk in a New Jersey lab in the late 1990s, an open binder of IETF drafts on one side and a softphone prototype on the other"
  - "A stack of RFCs on a desk — RFC 3261 on top labelled SIP, then RFC 3264 SDP offer/answer, then the three STUN revisions 3489, 5389, 8489, then the TURN pair 5766 and 8656, then the ICE pair 5245 and 8445 — the same author name visible on every spine"
  - "Diagram of two laptops behind home routers with the NAT-traversal dance laid out: STUN box learning a public address, an ICE candidate-pair table, a TURN relay drawn in dotted lines as the fallback path"
  - "A timeline across the bottom: 1993 Lucent, 2004 Cisco acquires dynamicsoft, 2009 Skype CTS, 2013 Cisco VP/CTO Collaboration, 2019 Five9 CTO and Head of AI"
  - "A WebRTC call between two browser windows with no plugin chrome, captioned with the SDP offer/answer exchange that makes the session possible"
---

# Jonathan Rosenberg

## In one sentence
Jonathan Rosenberg is the engineer whose name sits on the editor line of SIP, SDP offer/answer, and every revision of STUN, TURN, and ICE — the entire protocol stack that lets a VoIP call ring and a WebRTC session find a path between two laptops behind home routers.

## The hook (cold-open)
Public counts of his RFC output range from fifty-six to seventy-one depending on the year and the source, and they consistently put him in the IETF's all-time top ten. The interesting thing is not the number. The interesting thing is that one engineer is the principal or co-author of SIP itself — RFC 3261 — and of the offer/answer model in RFC 3264, and of every published revision of STUN, TURN, and ICE. If your phone rings over the internet, or your browser opens a peer-to-peer video call, you are almost certainly running on a stack he wrote.

## The work

### SIP and SDP offer/answer — the dialing layer for VoIP
Rosenberg is a principal author of the Session Initiation Protocol, published as RFC 3261 in 2002, and of RFC 3264 — the SDP offer/answer model that pairs with it. SIP is the protocol that establishes, modifies, and tears down a call; SDP describes what the two endpoints can actually negotiate, codecs and ports and addresses, in the body of those SIP messages. The handshake mechanics belong to the SIP and SDP episodes. What belongs in the biography is that the dialing layer for two decades of voice-over-IP — every enterprise PBX, every carrier softswitch, every consumer softphone — speaks the protocol Rosenberg edited.

### STUN, TURN, ICE — the NAT-traversal stack
The harder problem behind a VoIP or video call is that almost every endpoint sits behind a NAT, and two NATs cannot, by default, talk to each other. Rosenberg is the architect of the three-protocol stack that solves it. STUN — Session Traversal Utilities for NAT — lets an endpoint discover the public address its NAT is presenting, and shipped as RFC 3489, then was revised as RFC 5389 and RFC 8489. TURN — Traversal Using Relays around NAT — relays the media when a direct path is impossible, and shipped as RFC 5766 and then RFC 8656. ICE — Interactive Connectivity Establishment — is the algorithm that gathers candidate addresses from both ends, pairs them, probes them, and picks the best working path; it shipped as RFC 5245 and then RFC 8445. Rosenberg is on the editor line of every one of those documents. The mechanism story belongs to the STUN, TURN and ICE episode. The biographical fact is that the entire modern NAT-traversal stack came out of one person's twenty-year campaign at the IETF.

### WebRTC — the same stack, in the browser
When the web platform decided in the early 2010s that browsers should do peer-to-peer audio, video, and data without plugins, it did not invent a new transport. It picked up SDP for session description, ICE for path selection, STUN and TURN for NAT traversal, and bolted them onto a JavaScript API. The protocol layer Rosenberg had spent a decade editing for VoIP became the protocol layer of WebRTC — the work we cover in the WebRTC episode. Without that prior IETF foundation there would have been nothing for the browser vendors to standardise on.

### The career — Lucent to Five9
Rosenberg holds a BS and MS from MIT and a PhD from Columbia. He started at Lucent in 1993 and stayed until 1999. He was CTO of dynamicsoft, the SIP-focused startup that Cisco acquired in 2004, and stayed on at Cisco as a Fellow. He moved to Skype as Chief Technology Strategist from 2009 to 2013, then back to Cisco as VP and CTO of the Collaboration business from 2013 to 2018. Since January 2019 he has been CTO and Head of AI at Five9, the cloud contact-centre company.

## Awards and recognition
The Pulver VoN Pioneer Award in 2000, recognising his foundational work on SIP. MIT Technology Review's TR35 in 2002, the year that list named him as one of thirty-five innovators under thirty-five.

## See also (other pioneer episodes)
SIP did not arrive on its own — it grew out of the multimedia-signalling work Henning Schulzrinne led at Columbia, where Rosenberg did his PhD; the Schulzrinne episode is the natural prequel to this one for the SIP origin story.

The NAT-traversal stack Rosenberg edited is the same machinery the Tailscale team had to re-implement to make a modern mesh VPN work — the Avery Pennarun episode is a good companion listen for how STUN, TURN, and ICE show up outside of voice and video.

## Sources

**Wikipedia**
- [Jonathan Rosenberg (engineer) — Wikipedia](https://en.wikipedia.org/wiki/Jonathan_Rosenberg_(engineer))

**Homepage**
- [jdrosen.net](https://www.jdrosen.net/)
