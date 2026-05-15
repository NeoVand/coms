---
id: web-api/rest-and-graphql
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: REST and GraphQL
synopsis: Two ways to model an API — and a 25-year argument over which one Fielding actually meant.
podcast_target_minutes: 15
position_in_book: chapter 42 of 75
listening_order:
  prev: web-api/http3
  next: web-api/grpc
related_protocols: [http1, rest, graphql, websockets, http2, sse]
related_pioneers: [roy-fielding]
related_outages: []
related_frontier: []
related_rfcs: [9110]
images: []
visual_cues:
  - "A 2000 dissertation cover page next to a state-machine diagram — pages as states, links as transitions — with the words Representational State Transfer underneath."
  - "Mobile app screen with four arrows leaving for /users/123, /users/123/posts, /posts/[ids]/comments, and /users/[ids] — each labelled 100 ms RTT, totalling 400 ms before render."
  - "A single POST /graphql endpoint with one query going in and one precisely shaped JSON tree coming back, replacing the four-arrow REST diagram."
  - "Side-by-side subscription transports — graphql-ws over WebSocket on the left, Server-Sent Events over HTTP on the right — with proxies, HTTP/2 multiplexing, and reconnection ticked or crossed under each."
  - "A single backend with two front doors: REST for resource CRUD on the left, GraphQL for a watch app, a desktop app, and a dashboard on the right, all hitting the same database."
---

# Part VI, Chapter — REST and GraphQL

## The hook

In June 2000, Roy Fielding filed his PhD dissertation at UC Irvine and named the architecture behind HTTP. He called it Representational State Transfer — REST. Twenty-five years later, almost no API anyone calls a REST API actually meets his definition. And the most popular alternative, GraphQL, was born because a Facebook mobile team in 2012 was burning 400 milliseconds of latency on four chained REST calls just to render one screen. This is the chapter about those two patterns, and the argument about which one Fielding actually meant.

## The story

### The Constraint That Made the Web

In June 2000, Roy Thomas Fielding filed his PhD dissertation at UC Irvine — Architectural Styles and the Design of Network-Based Software Architectures. Chapter 5 of that dissertation described the architectural style behind HTTP. He named it REST.

The popular myth that REST is named after a rest stop is romantic, and it is wrong. The documented etymology is the state-machine metaphor — a network of web pages as a virtual state-machine, where the user progresses through the application by selecting links as state transitions. Fielding had originally called the model the HTTP object model, but people kept confusing it with the implementation model of an actual HTTP server. He renamed it REST.

The style has six constraints. Client-server. Stateless. Cacheable. Layered. A uniform interface. And optional code-on-demand. The uniform interface is the constraint that made the web composable — every resource has a URI, every resource is acted on by a small set of HTTP verbs, and every response is a self-describing representation. How those verbs and status codes and headers actually work on the wire is the HTTP/1.1 episode.

REST-style APIs became the default for web services because they inherited HTTP's caching, status codes, and tooling for free. By 2010, REST API was the answer to how should two services on the internet talk to each other for nearly every problem domain.

There is a sharp asterisk on that, though. HATEOAS — Hypermedia as the Engine of Application State, pronounced hate-ee-oss — is Fielding's constraint that clients should drive interactions by following links and forms in server responses, not by hard-coding URI templates. The vast majority of so-called REST APIs fail HATEOAS. Fielding has been publicly frustrated about this for 25 years. His 2008 essay, REST APIs must be hypertext-driven, is required reading for the genre. Most modern APIs are pragmatic JSON-over-HTTP. REST in the original strict sense remains rare.

### The Cost That Emerged At Mobile Scale

The trouble with REST emerged at scale, and specifically on mobile.

A mobile app loading a user profile might need to call /users/123, then /users/123/posts, then /posts/[ids]/comments, then /users/[ids] — four round trips for a single screen. On a 4G connection with 100 milliseconds of round-trip time, that is 400 milliseconds of latency before the app can render anything. Each individual REST endpoint was clean. The chain of endpoints required to populate one screen was the problem.

Facebook's mobile team hit this wall in 2012 and built GraphQL to solve it. A single endpoint, where the client describes exactly what data it wants, and the server returns exactly that — in one round trip. Facebook open-sourced the spec in 2015. The current edition is GraphQL September 2025, maintained by the GraphQL Foundation under the Linux Foundation.

GraphQL deliberately does not mandate a transport. The de-facto binding is GraphQL-over-HTTP — typically POST to /graphql for mutations and queries, though GET is allowed for cacheable, idempotent queries. JSON is the default body format. The mechanism — schemas, types, resolvers, the query language itself — is the GraphQL episode.

### Subscriptions, and the Two Patterns

GraphQL has three operation types. Queries read data. Mutations write data. And subscriptions — the server pushing events to the client over time, which needs a long-lived connection. Two transports compete for subscriptions.

The first is graphql-ws over WebSocket. It is the original — a bidirectional WebSocket connection carrying JSON-RPC-shaped messages. It works everywhere. It does not compose well with HTTP/2 multiplexing or with HTTP caches. The mechanics of the upgrade and the framing are the WebSockets episode.

The second is Server-Sent Events — text/event-stream over HTTP — and it is increasingly preferred. SSE survives proxies that mangle WebSocket upgrades. It composes with HTTP/2. It inherits HTTP authentication. It supports auto-reconnection out of the box via the browser's EventSource API. Tools like gqlgen and graphql-yoga default to SSE for new projects. The streaming format itself is the SSE episode.

The choice between REST and GraphQL is not strictly either-or. Most modern systems use both — REST for resource CRUD where caching matters, GraphQL where clients have wildly different data needs, like a watch app, a desktop app, and a dashboard hitting the same backend. The popular line that GraphQL replaces REST undersells how often the two coexist.

## The figures

### Roy Fielding

Born 1965. Co-authored the HTTP/1.1 specification — RFC 2068 and then RFC 2616 — the protocol that ran the web for two decades. Defined REST in his 2000 doctoral dissertation at UC Irvine, with its six constraints — client-server, stateless, cacheable, layered, uniform interface, and optional code-on-demand — that came to define the dominant style of public APIs. He also co-founded the Apache HTTP Server Project and chaired the Apache Software Foundation. The fact that the vast majority of so-called REST APIs fail his HATEOAS constraint has been a quiet source of his frustration for 25 years. He gets his own pioneer episode.

### RFC 9110 — HTTP Semantics

Published in 2022. Edited by Roy Fielding, Mark Nottingham, and Julian Reschke. Internet Standard. It obsoletes RFCs 7230 through 7235 and consolidates the version-independent semantics of HTTP — methods, status codes, headers, content negotiation, idempotency. Section 9.2.2 is the canonical statement that PUT, DELETE, and GET are idempotent. Section 12 is the canonical statement on content negotiation. It is the document that the modern REST world maps onto.

## What it taught the industry

It taught the industry three things.

First, that an architectural style can outlive — and outshape — the protocol it was extracted from. REST was a description of why HTTP worked. It became the prescription for everything else.

Second, that the strict version of an idea and the popular version of an idea can drift apart for 25 years and the popular version still wins. HATEOAS is the constraint that defines REST in Fielding's sense. Almost no production API enforces it. The industry settled for JSON-over-HTTP and called it REST anyway.

Third, that one new pattern does not retire the previous one. GraphQL did not replace REST. It joined it. The 2026 backend has a REST surface for the cacheable resource model and a GraphQL surface for clients with bespoke data needs, and the two live in the same repository.

## Listening order

- **Before this chapter:** "HTTP/3" — sets up the modern transport story underneath the API style debate, with the same HTTP semantics from RFC 9110 that REST still leans on.
- **After this chapter:** "gRPC" — picks up the third major API style, the one that swaps JSON-over-HTTP for Protocol Buffers over HTTP/2.

## Where to go deeper

- The HTTP/1.1 episode is the substrate REST was extracted from — the verbs, the status codes, the headers, the persistent connections.
- The REST episode picks up the architectural style itself — the six constraints, what HATEOAS actually means in practice, and where strict REST shows up versus pragmatic JSON-over-HTTP.
- The GraphQL episode covers the query language, the schema and type system, queries and mutations and subscriptions, and the GraphQL-over-HTTP binding.
- The WebSockets episode covers the upgrade dance and the full-duplex framing that graphql-ws rides on.
- The Server-Sent Events episode covers the text/event-stream format and the EventSource API that makes SSE the increasingly preferred subscription transport.
- The HTTP/2 episode covers the multiplexing model that SSE composes with and that WebSocket does not.

## Sources

- [GraphQL Specification — September 2025 edition](https://spec.graphql.org/September2025/)
- [GraphQL-over-HTTP draft](https://graphql.github.io/graphql-over-http/draft/)
- [graphql-ws on GitHub](https://github.com/enisdenjo/graphql-ws)
