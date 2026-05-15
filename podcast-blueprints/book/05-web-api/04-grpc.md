---
id: web-api/grpc
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: gRPC
synopsis: Typed RPC over HTTP/2 — the microservices default for the controlled-both-sides case.
podcast_target_minutes: 12
position_in_book: chapter 43 of 75
listening_order:
  prev: web-api/rest-and-graphql
  next: web-api/websockets-and-sse
related_protocols: [grpc, http2, rest, graphql, http3, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "Split diagram: a public REST endpoint with a curl command on the left, a private gRPC service mesh inside a datacenter on the right — same company, two protocols, two audiences."
  - "A .proto file in the middle, with arrows fanning out to generated client and server stubs in eleven languages — Go, Java, C++, Python, Node, Ruby, C#, Dart, Kotlin, Swift, PHP."
  - "Anatomy of a gRPC unary call on one HTTP/2 stream — initial headers, length-prefixed protobuf request frame, length-prefixed protobuf response frame, then a trailers frame carrying grpc-status: 0."
  - "Four side-by-side panels showing the four streaming flavours: unary, server-streaming, client-streaming, bidirectional — with arrows on each panel making the message direction obvious."
  - "Timeline of two CVEs hitting every gRPC binding at once: April 2024 CONTINUATION Flood, August 2025 MadeYouReset — coordinated patches landing in grpc-go, grpc-java, grpc-c++, grpc-node on the same day."
---

# Part VI, Chapter — gRPC

## The hook

gRPC is what you build when you control both sides. It assumes a shared schema, a binary encoding, and HTTP/2 trailers — none of which the public web supports cleanly. That is why it dominates inside the datacenter and barely exists in browsers.

## The story

### When You Control Both Sides

REST and GraphQL are designed for the open web, where you cannot assume anything about the client. Anyone can show up with curl and a JSON parser, and the API has to work. gRPC is designed for the closed case — your own services talking to each other inside a datacenter, where you control both sides and can assume a shared schema.

Google open-sourced gRPC in August 2015. It evolved from Stubby, the internal RPC framework that had been running in Google's production fleet since the late 2000s. The wire format is Protocol Buffers — protobuf — a compact binary encoding generated from a schema file with a .proto extension. The transport is HTTP/2, which is the subject of its own episode earlier in this part of the book. Pulling HTTP/2 in for free gives gRPC multiplexed streams, header compression, and per-stream cancellation without having to reinvent any of it.

### How It Maps to HTTP/2

A gRPC call is a single HTTP/2 request and response on one stream. The request body is a sequence of length-prefixed protobuf messages. The response body is the same. The control metadata that traditional RPC frameworks would carry in headers — error codes, status messages, deadlines — is split across two places. The initial metadata rides in HTTP/2 headers at the top of the stream. The final status — `grpc-status` and `grpc-message` — rides in HTTP/2 trailers at the end.

That dependence on trailers is exactly why gRPC does not run cleanly in browsers. Browser HTTP/2 implementations expose responses as chunked bodies, but they do not surface trailers to JavaScript. The workaround is gRPC-Web, a slightly different wire format that encodes the trailers as a final framing block in the body itself. gRPC-Web is awkward, requires a server-side translator, and never feels native to a browser application. The mechanics of how HTTP/2 trailers actually get framed on the wire is a topic for the HTTP/2 episode.

The model lets you describe a service as Go-like methods — `rpc GetUser(UserRequest) returns (User);` — and compile clients and servers in any of a dozen languages from the same .proto file. Streaming methods come in four flavours. Unary is one request, one response. Server-streaming is one request, many responses. Client-streaming is many requests, one response. Bidirectional is many of both, interleaved on a single stream. Every binding is type-checked at compile time. If the schema changes and you forget to regenerate, the build breaks before the deploy does.

### gRPC versus the alternatives

This is the question every architect has to answer, and the framing in this chapter is deliberate. The choice is not "gRPC versus REST" in the abstract. The choice is about who is on the other end of the wire.

Since roughly 2019, gRPC has dominated service-to-service traffic inside the datacenter at almost every large engineering organisation. That is the case it was designed for and the case where it wins. Where it does not fit: browsers, where gRPC-Web exists but is awkward; mobile clients with constrained bandwidth, where the protobuf runtime is heavy compared to JSON over HTTP; and public APIs, where REST's discoverability and curl-debuggability still win. The compact rule the chapter offers: controlled both sides and performance-critical, reach for gRPC; everything else, reach for HTTP and JSON. The REST and GraphQL episode covers the everything-else side of that rule in detail.

### The CONTINUATION Flood Cleanup

gRPC was one of the implementations affected by CVE-2024-27316, the HTTP/2 CONTINUATION Flood vulnerability disclosed in April 2024, and again by CVE-2025-8671, MadeYouReset, in August 2025. Because gRPC builds on HTTP/2, every HTTP/2 vulnerability ripples through every gRPC implementation. The mechanism details — how an attacker abuses CONTINUATION frames, how the reset attack works — belong in the HTTP/2 episode, where they get the airtime they deserve.

The fixes shipped in coordinated disclosures across grpc-go, grpc-java, grpc-c++, grpc-node, and the language bindings that depend on them. The lesson, the same lesson HTTP/2 keeps teaching, is that protocol surface area determines attack surface. gRPC inherits all of HTTP/2's surface and then adds its own protobuf parsing on top. A bug in either layer becomes a bug in every gRPC service in the world.

Active work in the gRPC working group through 2024, 2025, and into 2026 includes three threads. Native HTTP/3 support is currently experimental, gated on widespread server-side QUIC deployment — the QUIC and HTTP/3 episodes pick up that story. There is a clearer story being written for cancellation propagation across streaming methods, particularly for long-running bidirectional streams. And there is improved interop with OpenTelemetry traces, so a gRPC call across a service mesh shows up as one span graph rather than as a dozen disconnected logs.

## What you'd see in the simulator

The simulator runs a single gRPC unary call over HTTP/2. You press play and the client opens an HTTP/2 stream to the server. The first frame carries initial metadata — the method name, the content type `application/grpc`, a deadline. The next frame is the request body: a length prefix followed by a protobuf-encoded message. The server processes the call. Then it sends the response body the same way — a length prefix followed by a protobuf-encoded reply. The final frame is an HTTP/2 trailers frame carrying `grpc-status: 0`, which is the gRPC equivalent of "OK." The whole exchange is one stream, one round trip, strongly typed at both ends. It is a remote function call, but with the wire format you would have wanted in 2002 and did not get until 2015.

## Listening order

- **Before this chapter:** *"REST and GraphQL"* — sets up the open-web side of the API design space, so the contrast with gRPC's controlled-both-sides world lands cleanly.
- **After this chapter:** *"WebSockets and SSE"* — moves from request-response RPC to long-lived push channels for the browser.

## Where to go deeper

- The gRPC episode picks up the protocol mechanism in detail — the four streaming flavours, deadline propagation, status codes, the protobuf wire format.
- The HTTP/2 episode covers the transport gRPC depends on, including the trailers frame and the CONTINUATION and reset attack families.
- The REST episode and the GraphQL episode together cover the "everything else" side of the gRPC-versus-the-rest decision.
- The HTTP/3 episode and the QUIC episode set up where gRPC is heading next, once experimental HTTP/3 support graduates.

## Visual cues for image generation

- Split diagram: a public REST endpoint with a curl command on the left, a private gRPC service mesh inside a datacenter on the right — same company, two protocols, two audiences.
- A .proto file in the middle, with arrows fanning out to generated client and server stubs in eleven languages — Go, Java, C++, Python, Node, Ruby, C#, Dart, Kotlin, Swift, PHP.
- Anatomy of a gRPC unary call on one HTTP/2 stream — initial headers, length-prefixed protobuf request frame, length-prefixed protobuf response frame, then a trailers frame carrying `grpc-status: 0`.
- Four side-by-side panels showing the four streaming flavours: unary, server-streaming, client-streaming, bidirectional — with arrows on each panel making the message direction obvious.
- Timeline of two CVEs hitting every gRPC binding at once: April 2024 CONTINUATION Flood, August 2025 MadeYouReset — coordinated patches landing in grpc-go, grpc-java, grpc-c++, grpc-node on the same day.
