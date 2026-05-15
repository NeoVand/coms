---
id: rest-to-realtime
type: journey
title: REST to Real-Time
scope: web-api
podcast_target_minutes: 12
step_count: 4
protocols_in_order: [rest, sse, websockets, grpc]
related_protocols: [rest, sse, websockets, grpc, http2]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: REST, then SSE, then WebSockets, then gRPC — with arrows above each node showing the direction of data flow (request-response, server-push, bidirectional, bidirectional-typed)"
  - "Side-by-side timeline of polling vs push: REST client firing repeated GETs every two seconds returning 'nothing new', vs SSE keeping one connection open and emitting events only when something happens"
  - "Stack diagram showing what each step adds on top of HTTP: REST adds resources and verbs, SSE adds a one-way event stream, WebSockets adds full-duplex framing, gRPC adds typed schemas and HTTP/2 streaming"
  - "Cartoon of a WebSocket frame: the tiny 2-byte header next to a much larger HTTP request header for comparison"
  - "Protocol Buffers .proto file on the left generating client code in Go, Python, Java, TypeScript on the right — one schema, many languages"
---

# REST to Real-Time

## In one breath
This journey walks the spectrum of web API styles, from the classic
request-response pattern that runs most of the web, to the persistent,
bidirectional, typed channels that power chat, multiplayer games, and
modern microservices. Four protocols, each one solving a limitation
the previous one couldn't.

## The hook (cold-open)
Most web APIs work the same way: the client asks, the server answers,
the connection closes. That model built the web. But try using it for
a live chat, a multiplayer game, or a stock ticker, and it falls apart
fast — the client ends up hammering the server every two seconds just
to check if anything happened. In the next few minutes we're going to
walk four protocols in order, and watch the request-response model get
gradually replaced by something that can actually push.

## The journey

### Step 1 — REST: Request-Response (REST)
REST models your API as a collection of resources, each one identified
by a URL, each one manipulated through a small set of standard HTTP
methods: GET to read, POST to create, PUT to replace, DELETE to remove.
Its stateless design is the key trick — every request carries all the
context the server needs, so there's no session state to manage, the
response is trivial to cache, and the whole thing scales horizontally
behind any load balancer you point at it. That simplicity is exactly
why REST dominates web APIs. The full mechanism is in the REST episode.
What we need to know here is the limitation: the client always has to
ask. If you want real-time stock prices or live chat messages, you're
stuck polling — hammering the server with repeated requests, most of
which come back saying "nothing new", wasting bandwidth and battery
life on both ends.

Polling is like repeatedly calling someone to ask "any news?" — wasteful
for both parties. What if the server could simply call you back whenever
something interesting happened? The web platform introduced a lightweight
mechanism for exactly this kind of one-way push.

### Step 2 — SSE: Server-Sent Events (SSE)
Server-Sent Events flip the REST model on its head. Instead of the
client polling, the server holds the connection open and pushes events
down it whenever they occur. The protocol runs over plain HTTP, which
means it passes through proxies, load balancers, and CDNs without any
special treatment. The wire format is dead simple — text-based, just
"data:" lines separated by blank lines — and the browser's built-in
EventSource API handles the hard parts for you, automatically
reconnecting when the connection drops and resuming from the last
event ID it received. The full mechanism is in the SSE episode. What
matters here is the shape of it: SSE is perfect for live dashboards,
notification feeds, log tailing, and AI streaming responses — the
token-by-token output you see from ChatGPT is SSE under the hood. The
catch is that it's strictly one-directional. Only the server can push.
If the client also needs to send messages, it has to fall back to
separate HTTP requests on the side.

SSE handles server-to-client streaming elegantly, but a lot of
applications need truly bidirectional communication — chat apps where
both users type at once, multiplayer games with constant input and
output, collaborative editors where every keystroke has to be
broadcast. These need a connection where either side can send at any
moment.

### Step 3 — WebSockets: Full Duplex (WS)
WebSockets upgrade an HTTP connection into a persistent, full-duplex
channel where both client and server can send messages independently,
at any time, with no request-response pairing required. The session
starts as a normal HTTP request with an upgrade header, and once the
handshake completes, the protocol switches to a lightweight binary
framing format with minimal overhead — as little as two bytes per
frame, compared to the hundreds of bytes of headers a full HTTP
request would carry. The full mechanism is in the WebSockets episode.
What we need to know here is the use case: this is the protocol behind
chat applications like Slack and Discord, behind multiplayer games
sending real-time position updates, behind the live cursors in Google
Docs, behind financial trading feeds with live order books. The
tradeoff is that WebSockets are raw pipes. They give you a message
channel and impose no structure on what flows through it. You design
your own message formats, your own error handling, your own connection
management.

WebSockets give you bidirectional messaging in its rawest form, but
for microservice architectures and complex distributed systems,
developers want more structure on top: typed message schemas,
automatic code generation across many languages, streaming in both
directions, and efficient binary serialization. Enterprise systems
need a proper RPC framework.

### Step 4 — gRPC: Typed Streaming RPC (gRPC)
gRPC brings the rigor of typed interfaces to network communication.
You define your service and its message schemas in Protocol Buffers,
in .proto files, and the gRPC toolchain generates client and server
code in dozens of languages — Go, Java, Python, Rust, C++, TypeScript,
and on. Messages get serialized to a compact binary format, five to
ten times smaller than the equivalent JSON, and the whole thing rides
on HTTP/2 — which we cover in the HTTP/2 episode — with full support
for four streaming patterns: unary, server streaming, client streaming,
and bidirectional streaming. Built-in features include deadlines,
cancellation, metadata propagation, and pluggable authentication. The
full mechanism is in the gRPC episode. What's worth holding on to here
is the scale of adoption: gRPC is the backbone of microservice
communication at Google, at Netflix, and at most of the major cloud
providers.

## What the listener now understands
This is the spectrum of web API styles, laid out end to end. REST is
the simplest possible shape — ask, get an answer, hang up — and it
runs most of the web for exactly that reason. SSE is the smallest
possible step away from REST, just enough to let the server push when
it has something to say. WebSockets remove the last constraint and
give you a raw bidirectional channel, at the cost of having to design
the message protocol yourself. gRPC adds the scaffolding back on top
— types, schemas, code generation, streaming — for the kind of
service-to-service communication that holds modern infrastructure
together. Four protocols, one progression: from pulling, to pushing,
to talking freely, to talking freely with a contract.

## Where this connects in the book
- The chapter on REST goes deep on resources, verbs, statelessness,
  and the HATEOAS ideal that the rest of the industry quietly walked
  away from.
- The chapter on SSE walks through the EventSource API, the auto-reconnect
  semantics, and why this format works so well for AI token streaming.
- The chapter on WebSockets unpacks the upgrade handshake, the binary
  framing layout, and the design choices you have to make when building
  on top of a raw message channel.
- The chapter on gRPC covers Protocol Buffers, code generation, the
  four streaming patterns, and the operational story of running gRPC
  in production.

## See also (other journeys and protocol episodes)

- If you want to hear the same four protocols pulled apart on their
  own terms, the REST episode and the SSE episode are the two to start
  with — they're the smallest jump from how the web already works.

- The WebSockets episode is the right next listen if the move from
  one-way push to full bidirectional made you curious how the framing
  layer actually works underneath.

- For where this leads in real production systems, the gRPC episode
  picks up the typed-RPC story end to end, and the HTTP/2 episode
  explains the transport that makes gRPC's streaming patterns possible
  in the first place.
