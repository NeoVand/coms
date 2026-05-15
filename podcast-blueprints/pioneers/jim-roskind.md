---
id: jim-roskind
type: pioneer
name: Jim Roskind
years: "c. 1950–"
title: Architect of QUIC
org: Google
podcast_target_minutes: 6
protocols: [quic, http3]
categories: []
related_book_chapters:
  - 01-story-of-the-internet/06-the-quic-redesign
  - 03-transport/04-quic
awards: []
image:
  src: null
  alt: Portrait of Jim Roskind, the Google engineer who designed QUIC
  credit: null
visual_cues:
  - "Portrait composition: a Google engineer at a Mountain View desk around 2012, a Chrome browser open on one monitor, a packet-trace of UDP datagrams scrolling on the other"
  - "Whiteboard diagram of the QUIC stack: UDP at the bottom, then a single user-space layer combining reliability, multiplexing and TLS, with HTTP/3 sitting on top"
  - "Split panel: on the left, a 2012 kernel-TCP stack with a slow OS-vendor upgrade cycle; on the right, a Chrome browser auto-updating a user-space transport overnight"
---

# Jim Roskind

## In one sentence
Jim Roskind is the Google engineer who, around 2012, decided the way to replace TCP was not to fight the kernel but to build a new transport in user space on top of UDP, ship it as a Chrome update, and let the browser carry it to the world.

## The hook (cold-open)
For thirty years the internet's transport layer meant TCP, and TCP meant the operating-system kernel — which meant any change took a decade to deploy. Around 2012, an engineer at Google named Jim Roskind made a different bet. UDP, he noticed, passes through every middlebox on earth. Stack reliability, multiplexing and crypto on top of it in user space, and you can iterate the transport layer at the speed of a browser update instead of a kernel upgrade. He called it Quick UDP Internet Connections — QUIC. Thirteen years later, by 2025, Meta was running more than three quarters of its traffic over it, and roughly thirty-five percent of the top ten million sites on the web supported HTTP/3.

## The work

### QUIC at Google, 2012 onwards
Roskind designed and championed QUIC inside Google starting around 2012. The original expansion was Quick UDP Internet Connections, and the architectural premise is the thing to remember from this episode. UDP, unlike anything new at the transport layer, already passes cleanly through every NAT and middlebox on the internet. Put a reliability layer, a multiplexing layer and a mandatory crypto layer on top of UDP, run the whole thing in user space inside the browser, and you sidestep the two reasons transport innovation had been frozen for a generation: kernel deployment cycles, and middlebox ossification. The mechanism — the handshake, the streams, the loss recovery, the connection IDs — is the subject of the QUIC episode; this is the biography. Google deployed the first version, gQUIC, in production from 2013 onwards, served from its own front-ends to its own Chrome clients.

### From gQUIC to RFC 9000
The IETF chartered a QUIC working group in 2016 to take Google's running code and turn it into an open standard. The working group spent five years redesigning it — substantially — and shipped RFC 9000 in May 2021. The IETF version is recognisably the same architecture Roskind set out at Google, but it is not the same wire format. A year later, in June 2022, RFC 9114 defined HTTP/3 — HTTP carried over QUIC — and made Roskind's user-space transport the default modern transport for the web. The story of how Google's experiment became the IETF's standard is the subject of the chapter on the QUIC redesign.

### What it amounts to
By 2025, around thirty-five percent of the top ten million sites supported HTTP/3, and Meta was reporting more than seventy-five percent of its traffic running on QUIC. The biographical fact worth holding onto is that one engineer's bet on UDP, made inside a single browser vendor, became the way the web's transport layer evolves now.

## Where they appear in the book
- Part "The Story of the Internet," chapter "The QUIC Redesign" — the inflection where Google's gQUIC experiment became the IETF's RFC 9000, with Roskind's original 2012 design as the starting point.
- Part "Transport," chapter "QUIC" — the protocol chapter where the user-space transport on UDP gets unpacked in full.

## See also (other pioneer episodes)
QUIC is the modern answer to the same problem Van Jacobson confronted in 1988 — how to keep the internet's transport layer from melting under load — only this time the fix shipped as a browser update instead of a kernel patch. The Van Jacobson episode covers the original congestion-control story that QUIC inherits.

The protocols Roskind's work most directly displaces are TCP and TLS — both of which trace back to the founding generation. The Vint Cerf and Bob Kahn episodes cover the TCP/IP architecture QUIC is now competing with at the wire level.

## Sources

**Wikipedia**
- [Jim Roskind — Wikipedia](https://en.wikipedia.org/wiki/Jim_Roskind)
