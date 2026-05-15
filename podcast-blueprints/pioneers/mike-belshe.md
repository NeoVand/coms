---
id: mike-belshe
type: pioneer
name: Mike Belshe
years: "c. 1970–"
title: Co-creator of SPDY (the prototype that became HTTP/2)
org: Google, BitGo
podcast_target_minutes: 6
protocols: [http2]
categories: []
related_book_chapters: [transport/quic, web-api/http2]
awards: []
image:
  src: null
  alt: Portrait of Mike Belshe
  credit: null
visual_cues:
  - "Portrait composition: software engineer at a Google Mountain View desk circa 2009, two monitors showing Chrome's network panel and a packet trace of a multiplexed stream"
  - "Whiteboard sketch of HTTP/1.1 on the left — six parallel TCP connections each carrying one request — and SPDY on the right — one connection carrying many interleaved streams"
  - "Timeline strip: 2009 SPDY at Google, 2010 SPDY in Chrome, 2012 IETF httpbis adopts SPDY/2 as the HTTP/2 base, May 2015 RFC 7540 published, 2016 SPDY deprecated in Chrome"
---

# Mike Belshe

## In one sentence
Mike Belshe is the Google engineer who, with Roberto Peon in 2009, built the experimental transport called SPDY that proved HTTP could be multiplexed and binary, and then handed it to the IETF where it became HTTP/2.

## The hook (cold-open)
For about fifteen years the web ran on HTTP/1.1, which forced browsers to open six parallel TCP connections to one server because a single connection could only carry one request at a time. In 2009, two engineers at Google — Mike Belshe and Roberto Peon — shipped an experimental replacement called SPDY: binary, multiplexed, with header compression, many requests flying over one connection at once. Within a year it was running in Chrome. Within three years the IETF had adopted SPDY/2 as the starting point for HTTP/2. And once the standard was published, Google did the unusual and disciplined thing — they retired their own version.

## The work

### SPDY at Google, 2009
Belshe and Peon co-created SPDY at Google in 2009. The thing it set out to fix was the head-of-line blocking and the one-request-per-connection model of HTTP/1.1 — we cover the mechanism in the HTTP/1.1 episode. SPDY's three structural ideas were: a binary framing layer instead of ASCII text, multiplexed streams over one TCP connection so many requests could be in flight at once, and compression of the repetitive header blocks that HTTP traffic is dominated by. SPDY shipped in Chrome in 2010, which gave Google a real-world deployment at browser scale and the data to argue from.

### Handing SPDY to the IETF, 2012–2015
In 2012 the IETF httpbis working group started work on HTTP/2, and they took SPDY/2 as the base specification rather than starting from a blank page. Three years of standardisation later, HTTP/2 was published as RFC 7540 in May 2015. The protocol that came out the other end is the one we cover in the HTTP/2 episode — it kept the binary framing, the multiplexing and the header compression, with the compression scheme refined into HPACK.

### Retiring SPDY
Once HTTP/2 was on track in browsers and servers, Google deprecated SPDY in Chrome. It is a textbook example of how a vendor-driven prototype is supposed to end: ship a thing, prove it works at scale, hand the design to the standards body, then retire your version once the standard ships. The same arc would later replay with Google's QUIC becoming IETF QUIC — that story belongs to the QUIC episode.

### BitGo
Belshe is now CEO of BitGo, a cryptocurrency custody company — a second act outside the protocol-design world.

## Where they appear in the book
- Part Web / API, the HTTP/2 chapter — SPDY is the direct ancestor of HTTP/2 and the reason the standard exists in the shape it does.
- Part Transport, the QUIC chapter — SPDY-to-HTTP/2 is the precedent the book uses to frame the later Google-QUIC-to-IETF-QUIC handoff.

## See also (other pioneer episodes)
The HTTP/2 design Belshe handed to the IETF is the same design space Daniel Stenberg has spent two decades implementing in curl — the Stenberg episode is the place to hear what HTTP/2 looks like from the client-library side.

For the precedent of a Google-built experimental transport getting standardised at the IETF and then retired in favour of the standard, the QUIC episode covers the same arc one protocol layer down.

## Visual cues for image generation
- Portrait composition: software engineer at a Google Mountain View desk circa 2009, two monitors showing Chrome's network panel and a packet trace of a multiplexed stream.
- Whiteboard sketch of HTTP/1.1 on the left with six parallel TCP connections each carrying one request, and SPDY on the right with one connection carrying many interleaved streams.
- Timeline strip: 2009 SPDY at Google, 2010 SPDY in Chrome, 2012 IETF httpbis adopts SPDY/2, May 2015 RFC 7540 published, 2016 SPDY deprecated in Chrome.

## Sources

**Wikipedia**
- [Mike Belshe — Wikipedia](https://en.wikipedia.org/wiki/Mike_Belshe)
