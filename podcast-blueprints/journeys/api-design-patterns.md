---
id: api-design-patterns
type: journey
title: API Design Patterns
scope: web-api
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [rest, graphql, grpc]
related_protocols: [rest, graphql, grpc, http2, websockets]
related_book_chapters: []
visual_cues:
  - "Three-panel diagram: REST endpoints as a list of URLs, GraphQL as a single query with a tree-shaped response, gRPC as a .proto file generating client and server stubs."
  - "Side-by-side request shapes for the same data — three REST round trips, one GraphQL query, one gRPC unary call."
  - "Wire-format comparison: a JSON document next to the same payload as protobuf binary, with a 3–10x size and parse-speed annotation."
---

# API Design Patterns

## In one breath
This journey compares the three dominant ways teams build APIs today —
resource-oriented REST, query-shaped GraphQL, and binary-fast gRPC. Each
one solves the previous one's pain, and each one comes with its own
trade-off that pushes some teams to the next.

## The hook (cold-open)
Every backend you have ever shipped picked an API style, and that pick
shaped everything downstream — how the mobile team fetches data, how
your services talk to each other, how you cache, how you debug. There
are basically three answers in production today: REST, GraphQL, and
gRPC. They are not really competitors. They are three different answers
to three different questions, and in this episode we walk through them
in the order the industry actually adopted them.

## The journey

### Step 1 — REST: Resources and URLs (REST)
REST models every piece of data as a resource with a unique URL.
Clients interact using standard HTTP methods — GET to read, POST to
create, PUT to replace, DELETE to remove. REST APIs are stateless:
every request carries everything the server needs to process it, which
makes them easy to cache and easy to scale horizontally. The trade-off
is rigidity. Clients get fixed data structures, so they end up
over-fetching fields they do not need, or under-fetching and firing
multiple requests to assemble a single screen. REST dominates the web
because of its simplicity, but complex UIs with deeply nested data
often outgrow it. The full mechanism — verbs, status codes, statelessness
as an architectural rule — is in the REST episode. Here we just need to
know what shape the contract takes: one URL per resource, one verb per
intent.

REST works well for simple CRUD, but mobile and single-page apps often
need data from many related resources in a single screen. What if the
client could specify exactly the data it needs in one request?

### Step 2 — GraphQL: Ask for Exactly What You Need (GraphQL)
GraphQL flips the contract. Instead of the server defining a fixed
resource at each URL, the client sends a query describing exactly the
shape of the data it wants, and the server returns only that — no more,
no less. A single query can traverse relationships — user to posts to
comments — that would have required three or four REST endpoints. The
schema is typed and introspectable, so the API is self-documenting:
tools can read it and generate clients automatically. Mutations handle
writes, and subscriptions push real-time updates over WebSockets — and
WebSockets has its own episode if you want the persistent-connection
story. The trade-off comes from that flexibility. The server has to
resolve arbitrary query shapes, which makes URL-based caching impossible,
makes rate limiting harder because a single query can be arbitrarily
expensive, and makes N+1 database problems common unless you reach for
something like DataLoader. The full GraphQL episode walks through the
schema, resolvers, and the cost model — here the point is that the
shape of the request now belongs to the client.

GraphQL gives clients flexibility, but its text-based JSON format adds
overhead. For internal microservice communication, where both sides of
the wire are owned by the same team, is there an even more efficient
option?

### Step 3 — gRPC: Binary Speed for Services (gRPC)
gRPC answers that question by giving up human-readable wire format in
exchange for speed. It uses Protocol Buffers — protobuf — for compact
binary serialization, and it rides on HTTP/2 for multiplexed transport.
The result is three-to-ten times faster to parse than JSON. Services
are defined in .proto files, and a code generator turns those into
strongly-typed client and server stubs in eleven languages. gRPC
supports four communication patterns: unary request-response, server
streaming, client streaming, and bidirectional streaming. That makes it
ideal for microservice meshes where low latency and type safety matter
more than human readability — the kind of east-west traffic that never
touches a browser. And that is the trade-off: browsers cannot call gRPC
directly. They need a proxy like gRPC-Web or Envoy. And debugging
requires special tooling, because you cannot just open a request in the
network panel and read it — the payload is binary. The full mechanism
of streaming, codegen, and HTTP/2 framing lives in the gRPC episode and
the HTTP/2 episode. Here we just need to see where it fits: the
high-performance choice for service-to-service traffic inside your own
walls.

## What the listener now understands
These three styles are not really fighting each other. REST is the
default contract for the public web, where simplicity and cacheability
win. GraphQL is the answer when the client is rich and the data is
relational and you are tired of shipping a new endpoint every time the
mobile team changes a screen. gRPC is the answer when the caller is
another one of your own services and you want type safety and speed
more than you want a human-readable payload. Most production systems
end up using two or three of them in different layers — gRPC between
services, GraphQL or REST at the edge — and the reason is right here in
the trade-offs.

## Where this connects in the book
- The chapter on the web API layer frames why HTTP became the universal
  substrate that all three of these styles ride on.
- The chapter on microservices and service meshes is where gRPC's
  streaming patterns and codegen story actually pay off in production.

## See also (other journeys and protocol episodes)
- The REST episode goes deeper on resources, verbs, status codes, and
  why statelessness is the property that lets REST scale.
- The GraphQL episode covers schemas, resolvers, the N+1 problem, and
  how subscriptions ride on WebSockets for live updates.
- The gRPC episode walks through Protocol Buffers, the four streaming
  patterns, and why HTTP/2 multiplexing is what makes gRPC fast.
- The HTTP/2 episode explains the multiplexed transport that gRPC
  depends on, and the WebSockets episode covers the persistent
  connection that GraphQL subscriptions ride on.

## Visual cues for image generation
- Three-panel diagram: REST as a list of URL+verb pairs, GraphQL as one
  nested query and matching response tree, gRPC as a .proto file with
  arrows out to generated client and server stubs.
- One screen, three round-trip timelines: REST firing three sequential
  requests, GraphQL firing one query, gRPC firing one unary call.
- Wire-format comparison: a JSON document on the left, the same data
  serialized as protobuf bytes on the right, annotated with the 3–10x
  parse-speed gap.
- gRPC's four streaming patterns as four small arrow diagrams: unary,
  server streaming, client streaming, bidirectional.
- A layered map: browsers and public clients on top talking REST or
  GraphQL, an edge gateway in the middle, a mesh of services underneath
  talking gRPC.
