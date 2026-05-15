---
id: video-call
type: journey
title: Building a Video Call
scope: realtime-av
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [sdp, rtp, webrtc]
related_protocols: [sdp, rtp, webrtc]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: SDP, then RTP, then WebRTC — with a small inset showing two browsers exchanging an offer and answer before any media flows"
  - "Side-by-side offer/answer cards: codecs (VP8, H.264, Opus), transport addresses, media types, bandwidth — with arrows from one peer to the other through a signaling server"
  - "Anatomy of a single RTP packet: timestamp, sequence number, payload type, synchronization source identifier — riding on top of a UDP datagram"
  - "ICE candidate gathering: a browser fanning out to its local address, a STUN server, and a TURN relay, then picking the best path between two peers behind NATs"
  - "Stacked WebRTC layer diagram: getUserMedia at the top, then RTCPeerConnection and RTCDataChannel, then DTLS and SRTP, then ICE, with raw UDP packets at the bottom"
---

# Building a Video Call

## In one breath
This is the journey behind every browser-to-browser video call: from
two strangers' devices that have never met to live audio and video
flowing peer-to-peer in real time. Three protocols cooperate — SDP to
agree on what to send, RTP to actually carry the media, and WebRTC to
glue the whole thing together inside a browser tab.

## The hook (cold-open)
You click "join call" and a few seconds later you're looking at someone
on the other side of the world, in real time, in a web page, with no
plugin installed. No app. No download. Just a browser tab. Behind that
tab, three protocols have already done their work, in a strict order,
and handed off to each other. In the next few minutes we're going to
walk that handoff, one protocol at a time, and watch a video call
actually get built.

## The journey

### Step 1 — Session Description (SDP)
Before a single frame of video can flow, both peers need to agree on
the ground rules. Which codecs do they support — VP8, H.264, Opus?
What transport addresses will they use? Which media types are on the
table — audio, video, or both? What bandwidth can each side handle?
SDP, the Session Description Protocol, is a structured text format
that encodes all of that into an "offer" from one peer and an "answer"
from the other. The offer and the answer travel through a signaling
server, which can be anything — a WebSocket connection, an HTTP
endpoint, even text pasted between two humans. Without this
negotiation, the two devices have no way to make sense of each other's
media. The full mechanism — the line-by-line shape of an offer, the
attributes, the way capabilities get narrowed down — is in the SDP
episode. Here we just need the outcome: both peers know exactly what
the other can decode, and on which addresses to expect it.

Both peers have agreed on codecs, formats, and transport parameters.
The signaling is done. But knowing what to send is not the same as
sending it. The actual audio and video data now needs a way to travel
between the two devices in real time, with timestamps so playback
stays in sync, and sequence numbers so loss can be detected.

### Step 2 — Media Transport (RTP)
RTP, the Real-time Transport Protocol, is the workhorse that carries
the actual audio and video. Every RTP packet wears a small header with
four things on it: a timestamp, so the receiver can play frames at the
right moment even when packets arrive out of order; a sequence number,
so the receiver can spot losses; a payload type identifier, so the
receiver knows which codec to feed each packet into; and a
synchronization source identifier, so multiple streams from the same
peer can be told apart. RTP runs over UDP, and that choice is
deliberate. Real-time media cannot afford TCP's retransmission delays
— a 200-millisecond-old video frame is useless, so it is better to
skip it and show the next one. RTP's companion, RTCP, runs alongside
and feeds back receiver reports on packet loss and jitter, so the
sender can adapt its bitrate on the fly. The full mechanism — header
fields, profiles, RTCP report types — is in the RTP episode. Here we
just need to know that this is the protocol on which every frame and
every audio sample physically rides.

RTP handles media transport beautifully on a clean network between two
public IPs. But a real video call in a real browser involves more than
just sending packets. The two peers are almost always behind NATs and
firewalls. Every packet has to be encrypted. The browser needs a
JavaScript API to actually grab the camera and microphone. Something
has to tie all of that together.

### Step 3 — The Full Stack (WebRTC)
WebRTC is the browser-native framework that makes peer-to-peer video
calls possible without plugins. It orchestrates an entire stack at
once. ICE — Interactive Connectivity Establishment — punches through
NATs by gathering candidate addresses for each peer: the local
address, a server-reflexive address discovered through STUN, and a
relay address through TURN if direct paths fail. The peers then probe
those candidates against each other and pick the best path that
actually works. DTLS — TLS over datagrams — encrypts the control
channel. SRTP — Secure RTP — encrypts the media itself, so the audio
and video that step 2 just learned to carry never travel in the clear.
On top of all that sit the browser APIs the application code actually
touches: getUserMedia, which prompts for the camera and microphone;
RTCPeerConnection, which manages the connection lifecycle; and
RTCDataChannel, which provides a reliable or unreliable side channel
for arbitrary data — file transfers, game state, text chat — running
alongside the media. And the headline property of the whole thing:
the video data flows directly between browsers, peer-to-peer, without
passing through a server. Latency drops. Server costs drop. The full
mechanism — ICE in detail, DTLS-SRTP key derivation, the full browser
API surface — is in the WebRTC episode.

## What the listener now understands
A video call in a browser is not one protocol. It is three, layered on
top of UDP, each minding its own concern. SDP's job is to make two
strangers mutually intelligible. RTP's job is to carry the bytes with
just enough metadata that the receiver can play them in order and on
time. WebRTC's job is everything else a real call needs — NAT
traversal, encryption, the camera and microphone, a side channel for
data. None of them tries to do the others' work. That separation is
why the same three protocols can power a one-on-one video call, a
group meeting, a screen share, and a peer-to-peer file transfer
without being redesigned each time.

## Where this connects in the book
- The chapter on SDP goes deep on offer/answer — how capabilities get
  narrowed down line by line, and why the same format ended up
  describing both VoIP calls and browser video.
- The chapter on RTP unpacks the packet header field by field and
  explains why media transport sits on UDP instead of TCP, with RTCP
  feedback closing the loop.
- The chapter on WebRTC walks through ICE candidate gathering, the
  STUN and TURN servers behind NAT traversal, the DTLS-SRTP encryption
  story, and the browser APIs that make all of this reachable from
  JavaScript.

## See also (other journeys and protocol episodes)

- If you want to hear the same three protocols stripped down to their
  essentials, the SDP episode and the RTP episode are the two to start
  with. SDP is the matchmaker behind every WebRTC and VoIP call. RTP
  is the standard way to deliver audio and video packets in real time
  over UDP.

- The WebRTC episode is the right next listen if the NAT traversal and
  encryption parts felt like the most magical step. It is also the
  episode that most often surprises engineers, because how much the
  browser is actually doing for you only becomes obvious when you try
  to build any of it yourself.

## Visual cues for image generation

- Three-node graph lighting up in sequence: SDP, then RTP, then WebRTC
  — with a small inset showing two browsers exchanging an offer and
  answer through a signaling server before any media flows.
- Side-by-side offer/answer cards listing codecs (VP8, H.264, Opus),
  transport addresses, media types, and bandwidth, with arrows from
  one peer to the other.
- Anatomy of a single RTP packet: timestamp, sequence number, payload
  type, and synchronization source identifier — riding on top of a UDP
  datagram.
- ICE candidate gathering: a browser fanning out to its local address,
  a STUN server, and a TURN relay, then picking the best working path
  between two peers behind NATs.
- Stacked WebRTC layer diagram: getUserMedia at the top, then
  RTCPeerConnection and RTCDataChannel, then DTLS and SRTP, then ICE,
  with raw UDP packets at the bottom.
