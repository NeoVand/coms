---
id: web-api/http2
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: HTTP/2
synopsis: Binary framing, streams, HPACK — and the security saga that has not stopped.
podcast_target_minutes: 15
position_in_book: chapter 40 of 75
listening_order:
  prev: web-api/http1
  next: web-api/http3
related_protocols: [http2, tcp, http1, http3, quic, grpc]
related_pioneers: [mike-belshe]
related_outages: []
related_frontier: []
related_rfcs: [9113, 7540]
images: []
visual_cues:
  - "A web page in 2009 fanning out 90 requests across 15 origins, with browsers throttled to six TCP connections per origin and a queue piling up behind the cap."
  - "The HTTP/2 nine-byte frame header laid out as labeled fields: Length 24-bit, Type 8-bit, Flags 8-bit, Reserved 1-bit, Stream ID 31-bit, payload trailing off the right edge."
  - "A single HTTP/2 connection with multiple streams interleaved as colored frames, while one dropped TCP segment freezes every stream simultaneously — the head-of-line blocking trade."
  - "Timeline ribbon of the HTTP/2 CVE story: October 2023 Rapid Reset at 398 million requests per second, April 2024 CONTINUATION Flood, August 2025 MadeYouReset."
  - "Cloudflare-observed traffic share in 2026: HTTP/2 holding the majority slice at about 51% with HTTP/1.x and HTTP/3 alongside it."
---

# Part VI, Chapter — HTTP/2

## The hook

HTTP/2 still carries the majority of the web in 2026 — 51% of Cloudflare-observed traffic. The very feature that made it succeed, multiplexing many streams over one connection, also turned it into a DDoS amplifier. The CVE story is not over. This is the chapter where HTTP goes binary, page loads drop by a third, and then attackers spend the next three years finding new ways to make servers fight themselves.

## The story

### A binary layer under the same semantics

By 2009, web pages averaged 90 requests across 15 origins. The browser cap of 6 connections per origin meant every page paid TCP setup overhead repeatedly, and head-of-line blocking at the application layer was capping throughput. Google's SPDY experiment — Mike Belshe and Roberto Peon, 2009 — proposed multiplexing many requests over a single connection, with binary framing and per-frame priority.

SPDY became the basis for HTTP/2 under HTTPbis working group chair Mark Nottingham. RFC 9113, originally RFC 7540 in May 2015, ships HTTP/2 as a binary-framed multiplexed protocol. The semantics — verbs, headers, status codes — are unchanged from HTTP/1.1, which is the previous chapter. Only the wire format moves from text to nine-byte frame headers — Length 24-bit, Type 8-bit, Flags 8-bit, Reserved 1-bit, Stream ID 31-bit — plus payload. A single HTTP/2 connection carries any number of streams, each a logically independent request-response pair. Client streams use odd IDs; server-push streams, now extinct, used even ones.

HPACK, defined in RFC 7541, compresses repeated headers like cookies and user-agent by reference instead of resending them. It uses a 61-entry static table of common header fields, a per-connection dynamic table, and Huffman-coded literals. HPACK was designed in direct response to CRIME and BREACH-style attacks on gzip-compressed headers — the static table prevents the attacker from inferring secrets from compression ratios.

How any of this actually works on the wire — the framing layer in detail, the stream state machine, flow control windows — is the second half of the HTTP/2 protocol episode. We are telling the chapter story here.

### The deployment win, then the long tail

Real-world page loads dropped 30 to 40% with HTTP/2 enabled. CDNs adopted it within a year. By 2018, over 35% of all websites supported HTTP/2. By 2026, it carries about 51% of Cloudflare-observed web requests — still the dominant version of HTTP on the internet, even as HTTP/3 grows.

The unsolvable structural flaw is that HTTP/2 still runs over TCP, and TCP retransmission stalls all streams on a connection when even one packet is lost. The very feature HTTP/2 added — multiplexing — turned a single dropped packet into a whole-connection stall. The fix had to wait for QUIC and HTTP/3, which is the next chapter.

There is one other piece of HTTP/2 that did not survive contact with the web: server push. It was supposed to let servers preemptively send resources the client would need next. Chrome 106 in October 2022 disabled it by default; only about 1.25% of HTTP/2 sites had ever used it. Firefox 132 on 29 October 2024 removed support entirely. No major browser implements HTTP/2 server push as of 2026. The replacement pattern is the 103 Early Hints informational status combined with a Link header carrying rel=preload.

### The security saga

The most consequential changes in HTTP/2 over the last 24 months have been security disclosures.

CVE-2023-44487, "Rapid Reset," dropped on 10 October 2023. An attacker opens streams and immediately sends RST_STREAM on each one, using the ratio of cheap RST frames to expensive server processing to amplify a DDoS. Google absorbed an attack peaking at 398 million requests per second — the largest layer-7 DDoS ever recorded at that point. Cloudflare absorbed 201 million requests per second. AWS absorbed 155 million. Mitigations are now baked into every major HTTP/2 implementation.

CVE-2024-27316, the "HTTP/2 CONTINUATION Flood," was disclosed by Bartek Nowotarski via CERT/CC on 3 April 2024. The attack exploits CONTINUATION frames — used for headers larger than the initial HEADERS frame — that are unbounded by default, exhausting server memory. Patched across Apache httpd, Tomcat as CVE-2024-24549, Apache Traffic Server, Envoy, Node.js, Go's net/http, nghttp2, AMPHP, and Tempesta FW.

CVE-2025-8671, "MadeYouReset," landed on 13 August 2025. Disclosed by Tel Aviv University researchers with Imperva. The attacker uses malformed WINDOW_UPDATE, PRIORITY, or DATA frames to make the server send RST_STREAM against itself, bypassing the client-reset rate limits added after Rapid Reset. It affected Apache Tomcat, Netty, Varnish, F5, Fastly, AMPHP, Eclipse, and gRPC. Cloudflare and Akamai were not exposed.

The pattern holds. Each CVE breaks an assumption that earlier mitigations had baked in. The HTTP/2 protocol surface is large, the implementations are intricate, and the DDoS economics make HTTP/2 servers high-value targets. New CVEs in this space should be expected for years to come.

## The figures

### Mike Belshe

Mike Belshe co-created SPDY at Google in 2009 with Roberto Peon — the experimental binary, multiplexed, header-compressed transport that proved HTTP/1.1's head-of-line blocking and one-request-per-connection model could be replaced. Within a year SPDY shipped in Chrome, in 2010. The IETF httpbis working group started HTTP/2 in 2012 using SPDY/2 as the base. HTTP/2 was published as RFC 7540 in May 2015. Once HTTP/2 was on track, Google deprecated SPDY in Chrome — a textbook example of "ship a thing, prove it works, hand it to the standards body, retire your version." Belshe is now CEO of BitGo, a cryptocurrency custody firm.

### RFC 9113 — HTTP/2

Published in 2022, edited by Martin Thomson and Cory Benfield. Proposed standard. It obsoletes RFC 7540 from 2015 and is the current HTTP/2 specification — the binary framing layer, the streams model, HPACK header compression by reference, and the mandatory implementation rules for handling malformed frames that earlier text had left ambiguous. Several of the post-Rapid-Reset mitigations trace back to clarifications in 9113.

### RFC 7540 — Hypertext Transfer Protocol Version 2

Published in May 2015 by Mike Belshe, Roberto Peon, and Martin Thomson as editor. Now historic, obsoleted by RFC 9113. This is the original HTTP/2 — the document that turned SPDY into a standards-track protocol and unlocked the deployment wave that took HTTP/2 from zero to a third of all websites in three years.

## What you'd see in the simulator

The HTTP/2 simulator opens a single TCP connection between client and server and then sends multiple requests at once over it. You watch frames from different streams interleave on the wire instead of queuing one behind the other. Stream 1 starts a HEADERS frame for a request to /index.html. Before stream 1 finishes, stream 3 begins a HEADERS frame for /style.css. Then stream 5 begins for /app.js. The server responds with frames tagged by their stream IDs, and the simulator shows them arriving interleaved. The headline is that no stream waits on another at the application layer — that is the multiplexing win. If you let it run long enough you also see HPACK in action, because the second request reuses the dynamic-table indices that the first request created.

## What it taught the industry

It taught the industry three things.

First, that you can replace the wire format under HTTP without touching application code. Same verbs, same status codes, same headers, a different framing layer. That insight is what made HTTP/3 possible — which the next chapter picks up — and is now load-bearing for every transport experiment that followed.

Second, that multiplexing has a cost the headline numbers hide. The 30-to-40% page-load improvement was real. So is the fact that one lost TCP packet now stalls every stream on the connection. HTTP/2 traded application-layer head-of-line blocking for transport-layer head-of-line blocking, and the bill came due in QUIC.

Third, that protocol surface area times deployment scale equals an open hunting ground. Rapid Reset, CONTINUATION Flood, and MadeYouReset each took a primitive that looked safe in isolation and turned it into a denial-of-service amplifier. Every major HTTP/2 implementation has shipped emergency patches three times in three years, and the assumption inside the working group is that a fourth is coming.

## Listening order

- **Before this chapter:** "HTTP/1.1" — sets up the serialized, text-based, six-connections-per-origin world that HTTP/2 was designed to break out of.
- **After this chapter:** "HTTP/3" — picks up the story when the industry decides TCP itself is the bottleneck and moves HTTP onto QUIC.

## Where to go deeper

- The HTTP/2 protocol episode picks up the mechanism — the nine-byte frame header, the stream state machine, HPACK encoding details, flow control windows, and the post-Rapid-Reset mitigations.
- The TCP episode is the substrate that HTTP/2 still rides on — and the source of the head-of-line blocking that multiplexing could not solve at the application layer.
- The HTTP/1.1 episode is the protocol HTTP/2 inherited its semantics from — same verbs, same status codes, same headers, different wire.
- The QUIC episode is what happens when you decide TCP is the wrong substrate and rebuild the transport on UDP.
- The HTTP/3 episode is the result — HTTP semantics on QUIC, with the head-of-line blocking finally fixed.
- The gRPC episode is the biggest non-browser consumer of HTTP/2 — and one of the implementations affected by MadeYouReset in 2025.

## Visual cues for image generation

- A web page in 2009 fanning out 90 requests across 15 origins, with browsers throttled to six TCP connections per origin and a queue piling up behind the cap.
- The HTTP/2 nine-byte frame header laid out as labeled fields: Length 24-bit, Type 8-bit, Flags 8-bit, Reserved 1-bit, Stream ID 31-bit, with payload trailing off the right edge.
- A single HTTP/2 connection with multiple streams interleaved as colored frames, while one dropped TCP segment freezes every stream simultaneously — the head-of-line blocking trade.
- Timeline ribbon of the HTTP/2 CVE story: October 2023 Rapid Reset at 398 million requests per second, April 2024 CONTINUATION Flood, August 2025 MadeYouReset.
- Cloudflare-observed traffic share in 2026: HTTP/2 holding the majority slice at about 51%, with HTTP/1.x and HTTP/3 alongside it.
