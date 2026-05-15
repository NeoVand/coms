---
id: http-timeline
type: journey
title: The HTTP Timeline
scope: web-api
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [http1, http2, http3]
related_protocols: [http1, http2, http3, tcp, quic, tls, wifi]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence — HTTP/1.1, then HTTP/2, then HTTP/3 — with the year stamped under each: 1997, 2015, 2022"
  - "Stacked layer diagram for each era: HTTP/1.1 over TCP, HTTP/2 over TCP with multiplexed streams, HTTP/3 over QUIC with independent streams and TLS 1.3 baked in"
  - "Side-by-side wire view: a plaintext HTTP/1.1 request you could type into telnet, next to an HTTP/2 binary frame, next to an HTTP/3 QUIC stream frame"
  - "A single dropped packet on the wire, with three timelines underneath showing how HTTP/1.1, HTTP/2, and HTTP/3 each react"
  - "A phone in motion, switching from WiFi to cellular mid-page-load, with the QUIC Connection ID following the user across networks"
---

# The HTTP Timeline

## In one breath
Three decades of HTTP in one episode. We start in 1997 with a text
protocol you can type by hand, move to 2015 with a binary, multiplexed
redesign, and land in 2022 with HTTP riding on QUIC instead of TCP.
Same semantics the whole way through — same GETs, same status codes —
but a completely different wire underneath each time.

## The hook (cold-open)
By 2015, an average web page was pulling in over a hundred resources —
scripts, stylesheets, images, fonts. The protocol that was supposed to
deliver them was a text format from 1997, designed when a page meant
one document and maybe an image. The story of HTTP is the story of
that gap closing, in three big jumps. In the next few minutes we walk
all three.

## The journey

### Step 1 — HTTP/1.1: The Foundation (HTTP/1.1)
HTTP/1.1 shipped in 1997 and established the web as we know it. It is
entirely text-based. You can literally open a telnet session, type
"GET / HTTP/1.1", and get a web page back — the protocol is that
human-readable. The keep-alive header lets a single TCP connection
serve multiple sequential requests, so you don't pay for a new
handshake on every resource. But within that connection, requests are
strictly serialised: the client sends one request, waits for the
response, then sends the next. Browsers worked around this by opening
six to eight parallel TCP connections per domain, and developers
invented domain sharding, CSS sprites, and resource inlining to cut
the request count down. Those tricks were hacks born from a protocol
limitation, and the web was crying out for something better. The full
mechanism — methods, status codes, headers, the original spec — is in
the HTTP/1.1 episode. Here we just need to feel the shape of it: text
on the wire, one request at a time, per connection.

By 2015, an average web page needed over a hundred resources. Opening
six connections per domain and serialising requests inside each one
was an enormous waste of bandwidth and latency. The web needed a
protocol that could handle many requests at once over a single
connection.

### Step 2 — HTTP/2: Multiplexed Binary (HTTP/2)
HTTP/2 arrived in 2015 as a ground-up redesign of how HTTP frames are
encoded and put on the wire — while keeping the familiar semantics
above it untouched. Same GET, same POST, same headers, same status
codes. What changed is everything underneath. The wire format flipped
from text to a compact binary framing layer. A single TCP connection
now multiplexes an unlimited number of concurrent streams. Headers
get compressed with HPACK, which uses a shared dynamic table on both
ends so identical headers like cookies and user-agent strings stop
getting re-sent on every request. Server push lets the server
proactively hand the client resources it knows are coming, like the
CSS for a page it just served. All those HTTP/1.1 performance hacks —
sharding, spriting, inlining — became unnecessary, and in some cases
actively counterproductive. The full mechanism is in the HTTP/2
episode; here we just need the headline: one connection, many streams,
binary frames.

HTTP/2 killed head-of-line blocking at the HTTP layer, but it exposed
a deeper problem one floor down. All those multiplexed streams still
shared a single TCP connection. When one TCP packet got lost, TCP's
ordered delivery guarantee stalled every stream until the
retransmission arrived — even streams that had nothing to do with the
lost packet. The protocol needed a new transport that wouldn't punish
unrelated streams for one stream's bad luck.

### Step 3 — HTTP/3: QUIC-Powered (HTTP/3)
HTTP/3 shipped in 2022, and the headline change is that it does not
run on TCP at all. It runs on QUIC, and that single swap finally
eliminates head-of-line blocking at every layer of the stack. Each
HTTP stream maps to an independent QUIC stream, with its own loss
recovery — a dropped packet on one stream cannot block any other.
Header compression moves from HPACK to QPACK, redesigned for QUIC's
potentially out-of-order stream delivery. The TLS 1.3 handshake is
folded into the connection setup itself, so a fresh connection is
ready in one round trip, and 0-RTT resumption lets a returning visitor
fire its first HTTP request instantly. Connection migration, via
QUIC's Connection ID, means a phone walking from WiFi to cellular
keeps the same connection — the page load doesn't drop. The full
mechanism behind all of this is in the QUIC episode and the HTTP/3
episode. Three decades of HTTP evolution culminate here: a fast,
encrypted, multiplexed protocol that holds up even on lossy mobile
networks.

## What the listener now understands
HTTP changed wire formats twice in twenty-five years, but the
semantics on top — what a request is, what a response is, what a
status code means — barely moved. That is the trick. The web kept its
contract with the application above it stable, while the layers below
were free to be torn up and rebuilt as the network underneath
changed. Plaintext over TCP, binary multiplexed over TCP, then binary
multiplexed over QUIC. Same web from the developer's seat, three very
different webs on the wire.

## Where this connects in the book
- The chapter on HTTP/1.1 covers the original request-response model,
  the text wire format, and the moment its serialised-per-connection
  design started to bite once pages needed hundreds of resources.
- The chapter on HTTP/2 unpacks binary framing, multiplexed streams,
  HPACK header compression, and why the old performance hacks became
  counterproductive overnight.
- The chapter on HTTP/3 tells the QUIC story from the HTTP side —
  independent streams, QPACK, the integrated TLS 1.3 handshake, and
  connection migration across networks.
- The chapter on TCP is worth pairing with this one to feel exactly
  what ordered delivery costs when one packet goes missing — the
  pain HTTP/3 is built to escape.

## See also (other journeys and protocol episodes)

- If the head-of-line blocking story in step 2 was the part that
  clicked, the TCP episode is the right next listen. It's where the
  ordered-delivery guarantee comes from, and it explains exactly why
  one lost packet can stall an entire connection's worth of streams.

- The QUIC episode picks up where step 3 leaves off. HTTP/3 is the
  most visible thing built on QUIC, but QUIC itself is the bigger
  story — a new transport designed from the ground up to solve the
  problems TCP can't.

- For the encryption layer that HTTP/3 swallows whole, the TLS episode
  is the place to go. TLS 1.3's one-round-trip handshake and 0-RTT
  resumption are what make HTTP/3's connection setup feel instant.
