---
id: async-iot/coap
type: chapter
part_id: async-iot
part_label: VII
part_title: Async / IoT
title: CoAP
synopsis: REST shrunk for microcontrollers — and one of the most-deployed-at-scale uses turned out to be Chinese smartphones.
podcast_target_minutes: 12
position_in_book: chapter 49 of 75
listening_order:
  prev: async-iot/kafka
  next: realtime-av/rtp-and-rtcp
related_protocols: [coap, rest, http1, udp, tcp, ipv6, mqtt]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [7252, 9000, 8613]
images: []
visual_cues:
  - "A 4-byte CoAP fixed header sitting next to a 40-byte IPv6 header and a 20-byte UDP datagram, all fitting inside an 80-byte 802.15.4 frame — the whole budget for a sensor reading on a mesh radio."
  - "A world map dotted with 388,344 CoAP endpoints from the January 2019 NETSCOUT scan, with 81% of the dots clustered over China — and a thought-bubble revealing they are smartphones, not light bulbs."
  - "Side-by-side handshake diagrams: DTLS 1.3 ECC at ~700+ bytes versus EDHOC at ~100 bytes in three messages, with a tiny battery icon next to EDHOC showing years of extra life."
  - "A single CoAP packet labelled GET /.well-known/core (21 bytes) being reflected by an open server as a ~720-byte response — the 34x amplification factor of the 2019 DDoS wave."
  - "A tombstone for the Copper (Cu) Firefox plugin dated November 2017, with a terminal window beside it running libcoap and aiocoap — where CoAP debugging actually lives in 2026."
---

# Part VII, Chapter — CoAP

## The hook

In January 2019, NETSCOUT scanned the public internet for CoAP endpoints and found 388,344 of them. Eighty-one percent were in China. And almost none of them were what you would call IoT devices — they were Chinese smartphones running a peer-to-peer crypto stack called QLC Chain. The most-deployed-at-scale use of the protocol designed for tiny sensors turned out to be, embarrassingly, P2P crypto on phones.

## The story

### HTTP at 32 kB of RAM

CoAP — the Constrained Application Protocol — was specified by the IETF's CoRE working group, chartered in March 2010. The base spec, RFC 7252, was published in June 2014 by Zach Shelby, Klaus Hartke, and Carsten Bormann. The intellectual lineage runs through Sensinode in Oulu, Finland — which ARM acquired in 2013 — and the TZI group at the University of Bremen. The motivating question was simple: what does REST look like when your device has 32 kilobytes of RAM and your radio runs at 50 kilobits per second?

The answer is what we cover in the CoAP protocol episode. From a distance, CoAP looks like HTTP. There is GET, POST, PUT, DELETE. There are status codes. There are URIs. But the wire format is binary instead of text, and it runs over UDP instead of TCP — UDP is its own episode in the transport part of the book, and TCP gets the long treatment there too.

The numbers are the point. The fixed CoAP header is four bytes. A minimal Empty message is four bytes total. A typical GET sits between ten and twenty bytes. That budget exists because CoAP is designed to live inside IEEE 802.15.4 frames, the radio frames used by Thread and Zigbee meshes, which have to fragment IPv6 packets — and IPv6 is its own episode — into chunks of about eighty bytes each. CoAP defines four message types, called CON, NON, ACK, and RST, plus a two-byte Message ID for de-duplication and a Token of zero to eight bytes for matching responses to requests. Default UDP port is 5683. CoAPS, the secure variant over DTLS, sits on 5684.

### EDHOC — three messages, ~100 bytes

The biggest constrained-IoT crypto news of the period is a protocol called EDHOC, published in March 2024. EDHOC delivers full mutual authentication and forward secrecy in three messages totalling about a hundred bytes for static-Diffie-Hellman credentials. The comparable DTLS 1.3 ECC handshake is around seven hundred bytes or more. For a battery-powered device that wakes up to do one handshake and goes back to sleep, that difference translates directly into years of additional life. The companion is OSCORE, RFC 8613 from 2019, which wraps the CoAP payload itself in COSE_Encrypt0 with AES-CCM. OSCORE stays end-to-end secure even when a CoAP-to-HTTP proxy sits in the middle translating between worlds.

### Where CoAP Actually Runs — And the Matter Misconception

Here is the fact that almost everyone gets wrong. Matter, the smart-home standard everyone now ships, does not use CoAP for its main payloads. Matter has its own thing — the Message Reliability Protocol on UDP port 5540. CoAP only appears in Thread network management, the part Wireshark labels CoAP-TMF. If you read an older blog post saying Thread uses CoAP, that post is being imprecise.

And then there is the QLC Chain surprise. The NETSCOUT January 2019 scan found those 388,344 publicly-reachable CoAP endpoints, 81% of them in China, and once researchers fingerprinted them most turned out to be smartphones running QLC Chain — a peer-to-peer crypto stack that happened to ride CoAP on UDP. For years, the largest deployed-at-scale use of CoAP was P2P crypto on phones, not light bulbs.

The same scan period produced a wave of CoAP reflection-and-amplification DDoS attacks between January and March 2019. The measured amplification factor was thirty-four times: a twenty-one-byte `GET /.well-known/core` request returns about seven hundred and twenty bytes. You will sometimes see a 3,300-times figure quoted in press coverage from that era. That number is not CoAP — that was the memcached attack from February 2018. The CoAP number is real but smaller than the headlines suggested, and it is one of the incidents the famous outages part of the book covers in the broader UDP-amplification chapter.

### The Frontier — Pub/Sub, And Tooling Decay

The IETF draft `draft-ietf-core-coap-pubsub` advanced from version -15 in October 2024 to version -19 in March 2026. A CoAP publish-subscribe broker is now stable and approaching RFC publication — the working group's belated answer to MQTT's brokers. MQTT, of course, gets its own episode in this part of the book. The fact that CoAP is still catching up to a pattern MQTT shipped in 1999 tells you how slowly the constrained-IoT ecosystem moves.

Tooling has rotted in the meantime. The Copper plugin, known as Cu, was a Firefox-based CoAP debugger that an entire generation of IoT engineers learned the protocol on. Firefox 57 killed XUL extensions in November 2017, and Copper went with them. The successor, Copper4Cr, required a Chrome App, and Google deprecated those too. So in 2026, if you are debugging CoAP, you are doing it in a terminal — libcoap, aiocoap, coap-cli. The browser-based CoAP debugger is gone.

The implementation surface is small, but the cryptographic library underneath is intricate, and that combination has the same failure pattern as every other small protocol with a serious crypto add-on. CVE-2024-0962 was a libcoap OSCORE stack overflow. CVE-2026-29013, disclosed on April 17 2026 with a CVSS of 8.8, was an out-of-bounds read in the libcoap OSCORE Appendix-B.2 CBOR unwrap path.

CoAP has not displaced MQTT in IoT, mostly because publish-subscribe is a more useful pattern for sensor networks than request-response. But where you genuinely need RESTful resource semantics on a constrained device — Matter for smart-home pieces, Thread mesh management, OMA LwM2M for mobile device management — CoAP is the answer.

## The figures

### RFC 7252 — The Constrained Application Protocol (CoAP)

Published June 2014 by Zach Shelby, Klaus Hartke, and Carsten Bormann, status proposed standard. RFC 7252 defined the four-byte fixed header, the four message types, the request and response model on UDP, and DTLS as the primary security mechanism on port 5684.

### RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport

Published 2021, edited by Jana Iyengar and Martin Thomson, status proposed standard. The chapter cites RFC 9000 as part of the surrounding family of UDP-based transports — connections, paths, and packet header formats are all worth pulling up alongside CoAP when you study how the constrained world chose UDP. The full QUIC story is the QUIC episode in the transport part of the book.

### RFC 8613 — Object Security for Constrained RESTful Environments (OSCORE)

Published 2019 by Göran Selander, John Mattsson, Francesca Palombini, and Ludwig Seitz, status proposed standard. OSCORE wraps the CoAP payload in COSE_Encrypt0 with AES-CCM so the payload stays encrypted and authenticated end-to-end across CoAP-to-HTTP proxies — a different threat model from DTLS, which only protects the link.

## Listening order

- **Before this chapter:** *"Kafka" — the durable, log-structured pub-sub at the other extreme of scale, where storage is cheap and consumers replay history.*
- **After this chapter:** *"RTP and RTCP" — the protocol family that carries voice and video frames over UDP for the same fundamental reason CoAP does: TCP is the wrong shape for the workload.*

## Where to go deeper

- The CoAP protocol episode picks up the mechanism — confirmable versus non-confirmable messages, the Observe option for server push, block-wise transfer for payloads bigger than a frame, and the proxy-translation model.
- The REST episode covers the architectural style CoAP borrows wholesale — resources as nouns, methods as verbs, status codes as outcomes, statelessness as a scaling property.
- The HTTP/1.1 episode is the foil: same verbs, same status codes, plain text on TCP instead of binary on UDP.
- The UDP episode explains why a fire-and-forget transport with an eight-byte header is the right substrate for a constrained device.
- The TCP episode is the contrast — reliability, ordering, congestion control, and the per-connection state that constrained devices cannot afford.
- The IPv6 episode covers the addressing layer CoAP assumes: 128-bit addresses, fixed forty-byte headers, and the Neighbor Discovery model that replaces ARP.
- The MQTT episode is the rival pattern — a 1999 IBM design for unreliable satellite links, two-byte fixed header, broker-mediated publish-subscribe, three QoS levels, and the de facto IoT lingua franca that CoAP has not displaced.

## Visual cues for image generation

- A 4-byte CoAP fixed header sitting next to a 40-byte IPv6 header and an 8-byte UDP header, all fitting inside an 80-byte IEEE 802.15.4 frame — the whole budget for a sensor reading on a mesh radio.
- A world map dotted with 388,344 CoAP endpoints from the January 2019 NETSCOUT scan, with 81% of the dots clustered over China — and a thought-bubble revealing they are smartphones, not light bulbs.
- Side-by-side handshake diagrams: DTLS 1.3 ECC at ~700+ bytes versus EDHOC at ~100 bytes in three messages, with a tiny battery icon next to EDHOC showing years of extra life.
- A single CoAP packet labelled GET /.well-known/core at 21 bytes being reflected by an open server as a ~720-byte response — the 34x amplification factor of the 2019 DDoS wave.
- A tombstone for the Copper (Cu) Firefox plugin dated November 2017, with a terminal window beside it running libcoap and aiocoap — where CoAP debugging actually lives in 2026.
