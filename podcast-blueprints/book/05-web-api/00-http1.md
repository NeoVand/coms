---
id: web-api/http1
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: HTTP/1.1
synopsis: The text-based lingua franca of the web, still everywhere.
podcast_target_minutes: 15
position_in_book: chapter 39 of 75
listening_order:
  prev: wireless/spectrum-and-the-frontier
  next: web-api/http2
related_protocols: [http1, http2, http3, tcp, rest]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [2068, 2616, 9110, 9112, 9113, 9114, 1945]
images: []
visual_cues:
  - "A four-line GET request rendered as plain ASCII bytes on a netcat terminal, with the request line, Host header, and the trailing blank line called out."
  - "Browser opening six parallel TCP connections to the same origin in 2010, each carrying a serialized chain of requests, with idle time visible between exchanges."
  - "Stacked traffic share for Q1 2026 from Cloudflare: HTTP/1.1 at 28%, HTTP/2 at 51%, HTTP/3 at 21%."
  - "Timeline from RFC 1945 in 1996 through RFC 2068 in 1997, RFC 2616 in 1999, the RFC 7230 series in 2014, and the RFC 9110 to 9114 cluster on 7 June 2022."
  - "Three columns labeled APIs and CLI tools, legacy origin servers, and debuggability, each anchoring a slice of the persistent 28% HTTP/1.1 share."
---

# Part VI, Chapter — HTTP/1.1

## The hook

A complete HTTP/1.1 request is a few lines of plain ASCII you can debug with netcat. That readability is why every developer can debug an HTTP problem with curl, why every programming language has an implementation, and why every middlebox can interpret it. Thirty years in, with two binary successors shipped, HTTP/1.1 still carries about 28% of the web. This is the chapter on why the protocol you can read refuses to go away.

## The story

### The Protocol You Can Read

HTTP/1.1 is the most successful application protocol ever shipped. It was originally specified in RFC 2068 in January 1997, then revised through RFC 2616 in 1999 and the RFC 7230 to 7235 series in 2014. In June 2022 the IETF — the open, volunteer-run standards body that has shepherded internet protocols since 1986 — replaced the entire 1997-to-2014 lineage in one big bang with a five-document set: RFC 9110 for HTTP Semantics, RFC 9112 for HTTP/1.1 Messaging, RFC 9111 for Caching, plus the matching HTTP/2 update in RFC 9113 and the HTTP/3 update in RFC 9114. The Register called the 7 June 2022 cluster "the day TCP stopped being assumed."

Three things explain HTTP/1.1's longevity.

### Text on the Wire, Stateless Semantics, Persistent Connections

The first is text on the wire. A complete HTTP/1.1 request is a few lines of plain US-ASCII. RFC 9112, section 2.2, specifies the message grammar in ABNF over US-ASCII octets. A GET for /index.html is the request line, a Host header for example.com, and a blank line — that is the whole thing. That readability is the entire reason every developer can debug an HTTP problem with curl, every programming language has an implementation, and every middlebox can interpret it.

The second is stateless and idempotent semantics. Each request stands on its own; a server does not remember what came before. The verbs — GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS — and the status codes in the 100, 200, 300, 400, and 500 series form a vocabulary expressive enough for forty years of web applications without needing extension. The constraint is the strength.

The third is persistent connections. HTTP/1.0, defined in RFC 1945 in 1996, opened a fresh TCP connection per request — disastrous as web pages grew. HTTP/1.1 reused connections for multiple requests by default, dropping latency dramatically. Pipelining — sending the next request before the first response arrives — was specified but rarely deployed, because head-of-line blocking made it slower in practice than just opening more connections. Browsers settled on six parallel TCP connections per origin as the operational compromise. How TCP itself does the reliability and the congestion control underneath all of this is the TCP episode.

There is a callout in the chapter that puts the next move in context. By 2009 web pages were averaging 90 requests across 15 origins. With six connections per origin, every page paid the cost of TCP setup repeatedly, and connections were idle most of the time. Google's SPDY experiment proposed multiplexing many requests over a single connection with binary framing. SPDY became the seed of HTTP/2 — that mechanism story is the HTTP/2 episode.

### Why HTTP/1.1 Is Still 28% of Traffic in 2026

Despite HTTP/2 carrying about 51% of modern web traffic and HTTP/3 carrying about 21%, HTTP/1.1 stubbornly persists at around 28% of Cloudflare-observed requests in Q1 2026. Three reasons.

The first is APIs and CLI tools. curl, wget, scripting clients, server-to-server REST traffic, internal microservice calls — many of these still default to HTTP/1.1 because the simplicity outweighs the multiplexing benefit. A single API call does not need binary framing or stream prioritisation. The REST architectural style itself, defined by Roy Fielding's 2000 dissertation, sits on top of these same HTTP semantics and has its own episode.

The second is origin servers without HTTP/2. A long tail of nginx, Apache, IIS, and embedded HTTP servers run versions older than mainstream HTTP/2 support. Many corporate intranets, legacy admin panels, and older IoT devices speak only HTTP/1.1.

The third is debuggability. When something is wrong with an HTTP exchange, the fastest diagnostic path is reading the bytes on the wire. HTTP/1.1 is the only version where you can do that without a protocol decoder. For internal tooling and developer-facing surfaces, "I can see the request" is a feature.

## The figures

### RFC 9110 — HTTP Semantics

Published in 2022, edited by Roy Fielding, Mark Nottingham, and Julian Reschke. Internet Standard. It obsoletes RFCs 7230 through 7235 and consolidates the version-independent semantics of HTTP — methods, status codes, headers, content negotiation, idempotency. It is the document HTTP/1.1, HTTP/2, and HTTP/3 all map onto.

### RFC 9112 — HTTP/1.1

Published in 2022, edited by Roy Fielding, Mark Nottingham, and Julian Reschke. Internet Standard. It defines the HTTP/1.1 message format — the request line, the status line, headers, chunked transfer encoding, and the ABNF grammar over US-ASCII octets that makes the protocol readable.

## What you'd see in the simulator

The HTTP Request/Response Cycle simulator walks the full lifecycle of one HTTP request from the moment the browser commits to fetching a resource. First the TCP connection is set up to the origin — three packets for the handshake. Then the browser writes the request: a request line with the method and the path, a Host header, any other headers, a blank line, and the optional body. The server reads the request, looks up the resource, and writes the response: a status line with the version and status code, response headers, a blank line, and the body. The browser parses the headers, reads the body, and renders the result. If the connection is keep-alive, the same TCP connection is reused for the next request rather than being torn down. That reuse is the HTTP/1.1 contribution to the picture; the lower-level TCP setup and teardown is the TCP episode.

## What it taught the industry

HTTP/1.1 taught the industry three things that have outlasted its dominance.

First, that a text-on-the-wire format is not a performance bug — it is a debuggability feature, and one that buys decades of developer adoption. Every successor has had to argue against the readable baseline.

Second, that stateless request-response semantics are durable. The verbs and status codes from 1997 still carry today's web, the REST API style, and most internal microservice traffic. HTTP/2 and HTTP/3 changed the wire and kept the semantics — that is the point of RFC 9110 sitting above all three messaging documents.

Third, that "good enough" wins long tails. Even with six connections per origin and head-of-line blocking inside the connection, HTTP/1.1 was good enough that 28% of 2026 web traffic still uses it. The successors had to be substantially better, not just nominally better, to take the rest.

## Listening order

- **Before this chapter:** "Spectrum, regulation, and what comes next" — closes Part V on the wireless physical layer; this chapter pivots up the stack to the application protocol that runs on top of everything Part V covered.
- **After this chapter:** "HTTP/2" — picks up the binary, multiplexed redesign that Google's SPDY seeded and that fixed the six-connections-per-origin problem.

## Where to go deeper

- The HTTP/2 episode picks up the binary framing and multiplexing story — many requests over one connection, HPACK header compression, and why TCP-level head-of-line blocking still bit.
- The HTTP/3 episode goes one layer deeper and swaps TCP for QUIC — independent streams, faster handshakes, and connection migration across networks.
- The TCP episode covers the reliability, flow control, and congestion control that HTTP/1.1 has always sat on top of — sequence numbers, the three-way handshake, CUBIC, and BBR.
- The REST episode covers the architectural style Roy Fielding defined on top of HTTP semantics — resources, verbs, status codes, and the stateless contract.
