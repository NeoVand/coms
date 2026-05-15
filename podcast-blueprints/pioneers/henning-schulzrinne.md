---
id: henning-schulzrinne
type: pioneer
name: Henning Schulzrinne
years: "1959–"
title: Author of RTP, RTCP, RTSP, SIP, SDP
org: Columbia University, FCC
podcast_target_minutes: 8
protocols: [rtp, sip, sdp, webrtc]
categories: []
related_book_chapters:
  - realtime-av/sip-and-sdp
awards:
  - { name: "Internet Hall of Fame", year: 2013, url: null }
  - { name: "IEEE Internet Award", year: 2016, url: null }
  - { name: "ACM SIGCOMM Award", year: 2020, url: null }
image:
  src: null
  alt: Portrait of Henning Schulzrinne
  credit: null
visual_cues:
  - "Portrait composition: professor at a Columbia University office desk, whiteboard behind him diagrammed with a SIP INVITE flow and an SDP body, late-1990s CRT monitor showing an early VoIP softphone"
  - "Stack of artifacts on a desk — a printed copy of RFC 1889, a printed copy of RFC 3261, an FCC business card, a Columbia engineering badge"
  - "Split-screen: on the left a 1996 audio packet diagram with an RTP header drawn out byte by byte; on the right a 2020s WebRTC browser-to-browser call still riding the same SDP offer/answer"
  - "Wide shot: the FCC headquarters in Washington with a small inset portrait, captioned with the three CTO terms — 2012 to 2014, 2017, and 2024"
---

# Henning Schulzrinne

## In one sentence
Henning Schulzrinne is the Columbia professor who authored the four protocols that carry essentially every real-time voice and video session on the internet — RTP, RTSP, SIP, and SDP — and then served three separate terms as the FCC's Chief Technology Officer.

## The hook (cold-open)
If you have ever made a VoIP call, joined a video conference, or watched a WebRTC stream in a browser, you have used Henning Schulzrinne's work — usually three or four of his protocols stacked on top of each other in the same session. RTP carries the audio packets. RTCP reports back on jitter and loss. SIP set up the call. SDP described the codec the two ends agreed on. He has authored or co-authored more than seventy RFCs across two decades, which puts him among the most prolific contributors in the entire history of the IETF. And in between writing those standards, he commuted to Washington three times to run technology policy at the FCC.

## The work

### RTP and RTCP, 1996
Schulzrinne co-authored the original RTP specification — RFC 1889 — in 1996, with the revised standard arriving as RFC 3550 in 2003. RTP is the way audio and video packets actually move across the internet in real time, and RTCP is the companion control channel that reports back on what the receiver is hearing — packet loss, jitter, round-trip time. We won't unpack the framing on the wire here; the RTP episode walks through the header layout and the timestamp logic. What matters for the biography is that this pair of protocols is the transport layer underneath essentially every interactive audio and video product shipped since the late 1990s, including modern browser WebRTC.

### RTSP, 1998
RTSP — the Real-Time Streaming Protocol, RFC 2326 in 1998, updated as RFC 7826 in 2016 — is the control plane that goes with RTP. It is the protocol a client uses to say "play," "pause," "seek." It was the streaming-media remote control of the late-1990s and early-2000s media-server era, before HTTP-based streaming took over.

### SIP, 2002
SIP — the Session Initiation Protocol, RFC 3261 in 2002 — is the signalling protocol that the entire VoIP industry runs on. It is what an IP phone, a softphone, or a carrier switch uses to set up, modify, and tear down a call. Every enterprise PBX, every SIP trunk a telco sells to a business, every traditional VoIP product on the market speaks SIP. The mechanism — the INVITE, the 200 OK, the ACK, the registrar, the proxy — is the subject of the SIP and SDP chapter episode; defer the protocol walkthrough there. The biographical fact to hold onto is that Schulzrinne is the named author on the document that an entire industry is built around.

### SDP, 2006
SDP — the Session Description Protocol, RFC 4566 in 2006 — is the small text format two endpoints use to describe what media they want to exchange. Which codecs. Which IP addresses and ports. Which encryption parameters. SIP carries SDP bodies to negotiate calls. WebRTC — the protocol we cover in the WebRTC episode — also uses SDP, in its offer/answer exchange between browsers. So the same little syntax Schulzrinne co-authored in the mid-2000s ended up underneath both the carrier voice industry and the browser-based real-time web.

### Columbia, and seventy-plus RFCs
Schulzrinne has been a professor at Columbia University since 1996, and the volume of his standards work over those two decades is unusual. More than seventy RFCs with his name on them, across real-time media, signalling, emergency calling, presence, and Internet of Things telemetry. That sustained throughput inside the IETF is itself a contribution — most authors ship one important RFC and stop.

### The FCC, three times
He served as the Chief Technology Officer of the Federal Communications Commission three separate times — from 2012 to 2014, again in 2017, and again in 2024. The FCC is the United States telecom regulator; the CTO role is the in-house technical conscience for the agency's spectrum, broadband, and emergency-services policy. Going back three times is unusual; it is the second act of his career running in parallel with the first.

## Awards and recognition
Schulzrinne was inducted into the Internet Hall of Fame in 2013, received the IEEE Internet Award in 2016, and received the ACM SIGCOMM Award in 2020 — the discipline's three high-prestige recognitions, all for the body of real-time-media and signalling work.

## Where they appear in the book
- Part "Real-time A/V," chapter "SIP and SDP" — the centrepiece chapter for Schulzrinne; the mechanism walkthrough of the two protocols he is most associated with.

## See also (other pioneer episodes)
The protocols Schulzrinne authored sit underneath WebRTC, and WebRTC has its own founding cast — see the Justin Uberti episode for the engineer who shipped the browser side of that story at Google.

The signalling stack he started with SIP and SDP was extended by Jonathan Rosenberg, his Columbia doctoral student, into a long list of follow-on RFCs covering NAT traversal and conferencing — the Rosenberg episode is the natural next listen after this one.

For the broader real-time-media research lineage, Van Jacobson's name appears in the same chapter; the Jacobson episode covers the congestion-control work that real-time transports had to coexist with.

## Sources

**Wikipedia**
- [Henning Schulzrinne — Wikipedia](https://en.wikipedia.org/wiki/Henning_Schulzrinne)

**Homepage**
- [Henning Schulzrinne at Columbia](https://www.cs.columbia.edu/~hgs/)
