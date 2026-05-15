---
id: graphql
type: protocol
name: Graph Query Language
abbreviation: GraphQL
etymology: "[G]raph [Q]uery [L]anguage"
category: web-api
year: 2015
rfc: null
standards_body: graphql-foundation
podcast_target_minutes: 22
related_book_chapters:
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - web-api/rest-and-graphql
  - web-api/grpc
related_protocols: [http1, http2, json-rpc, websockets, rest, sse, soap, grpc]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Facebook_Headquarters_Menlo_Park.jpg/500px-Facebook_Headquarters_Menlo_Park.jpg"
    caption: "Facebook headquarters in Menlo Park, where Nick Schrock, Lee Byron, and Dan Schafer prototyped GraphQL in early 2012 to fix the iOS News Feed."
    credit: "Photo: Marcin Wichary / CC BY 2.0, via Wikimedia Commons"
visual_cues:
  - "A single /graphql endpoint surrounded by client devices — phone, watch, dashboard, TV — each pulling a differently-shaped JSON tree from the same URL."
  - "Side-by-side: REST returning four resources for one mobile screen vs GraphQL returning one nested response in one round trip."
  - "A GraphQL document anatomy: operation → selection set → fields → arguments → directives, with $variables threaded through."
  - "The 200-OK paradox: HTTP status 200 returned alongside a populated errors[] array — green dashboard, broken UI."
  - "A federated supergraph: Apollo Router on top, four subgraphs below (users, products, reviews, inventory), arrows showing query plan splits."
  - "Schrock's February 2012 internal Facebook code review labelled SuperGraph, with 2015 React.js Conf as the public reveal."
---

# GraphQL — Graph Query Language

## In one breath

GraphQL is a query language and execution engine for APIs. The client sends a single document describing exactly which fields it wants from a typed schema; the server walks that document depth-first, calls a resolver for each field, and returns a JSON tree shaped like the query — no over-fetching, no under-fetching. It was built at Facebook in 2012, open-sourced in 2015, and now sits under the GraphQL Foundation at the Linux Foundation. If your software talks to a phone, a watch, a desktop, and a TV from one backend, you have probably written or consumed it.

## The pitch (cold-open)

In February 2012, three engineers at Facebook — Nick Schrock, Lee Byron, and Dan Schafer — were assigned to rebuild the iOS News Feed API. Mobile was dying inside the company's HTML5 webview wrappers, and the existing REST endpoints needed five round trips to render one story. Schrock's prototype was internally called SuperGraph. Three years later, in January 2015, Facebook unveiled it at React.js Conf with a duller name: GraphQL. Today it powers GitHub's public API, Shopify's storefront, Netflix's content engine, and roughly half of the Fortune 500's API tier — and it is also, depending on whom you ask, the wrong abstraction, the 200-OK protocol that lies to your monitoring tools, and the only mainstream API contract that ships with its own documentation built in.

## How it actually works

GraphQL is three things at once: a query language, an execution engine, and a type system. The September 2025 spec edition is explicit that it is not tied to HTTP, JSON, or any database. The de-facto wire binding is GraphQL-over-HTTP — POST to `/graphql` with a JSON body containing `query`, `variables`, and `operationName`, and a response shaped `{ "data": ..., "errors": [...], "extensions": {...} }`.

A client sends a document. A document contains one or more operations — `query`, `mutation`, or `subscription` — and zero or more fragments. Each operation has a selection set: the fields the client wants, possibly nested, possibly aliased, possibly carrying directives like `@include`, `@skip`, `@deprecated`, and the new `@oneOf`. Variables (`$id: ID!`) parameterize the operation so the same query string can be cached and reused.

The server parses the document and validates it against the schema: every field must exist, every argument must type-check, fragments must be well-formed, and overlapping selections must be mergeable. Validation is where Schema Coordinates — added in the September 2025 edition — finally give tooling a stable way to point at a specific field.

Then the server executes. It walks the operation depth-first and calls a resolver function for every requested field. Field-level errors are caught and pushed onto the top-level `errors[]` array; the response can carry partial data alongside errors. The classic example: ask for `user.name` and `user.posts.title`, and that is precisely what comes back, in that shape, no other fields, in one HTTP round trip.

For mutations, the structure is identical to a query but signals intent to write. The client picks which fields to read back from the mutated object so it can update local state without a second fetch.

For subscriptions — long-lived event streams — there is no single transport. The original `subscriptions-transport-ws` is deprecated. The modern WebSocket sub-protocol is `graphql-transport-ws`, implemented by the `graphql-ws` library. Server-Sent Events (text/event-stream) is increasingly preferred because it survives the corporate proxies that mangle WebSocket upgrades, composes with HTTP/2, and inherits HTTP auth and auto-reconnection. Apollo Router's multipart-subscriptions and Spring for GraphQL both use SSE-style transports. There is also AppSync's MQTT-based path. Tom Houlé's 2025 GraphQLConf lightning talk was literally titled "The Federated GraphQL Subscriptions Zoo."

### Header at a glance

A request usually looks like this in essence:

- HTTP method `POST` (or `GET` for cacheable, idempotent queries with the document URL-encoded).
- Path `/graphql`.
- `Content-Type: application/json` — or, increasingly, the new `application/graphql-response+json` introduced by the GraphQL-over-HTTP working draft of July 24, 2025.
- A JSON body with three keys: `query` (the document text or a persisted-query hash), `variables` (a JSON object), and `operationName` (a string for documents containing multiple operations).
- Optional `Authorization` header — GraphQL inherits whatever auth scheme the host HTTP service uses.

Crucially, when the server replies with the new media type, a non-null `data` MUST yield HTTP 200, even if `errors[]` is populated. 4xx and 5xx are reserved for failures that prevented producing a well-formed GraphQL response at all. From January 1, 2025, servers SHOULD support the new media type by default.

### State machine in three sentences

GraphQL queries and mutations are stateless at the protocol layer — every request is its own transaction over an HTTP connection that may itself be reused. Subscriptions are the exception: they hold a long-lived stream and follow a tiny lifecycle of `connection_init` → `connection_ack` → repeated `subscribe` → `next` events → `complete`. The execution engine itself maintains no per-request state across requests; any continuity between calls comes from the server's data layer, the client's cache (Apollo Client, Relay, urql), or persisted-query hashes registered ahead of time.

### Reliability, security, and execution mechanics

Validation is the first line of defence. The spec mandates that every operation be parsed and type-checked against the schema before any resolver runs. That alone catches malformed queries.

Execution is depth-first. Field errors do not abort the operation; they are caught and surfaced in `errors[]` while the rest of the data is still resolved. This is the partial-success model.

Caching is the unhappy story. There is no built-in HTTP-level cache the way REST has — the request body changes per query, so URL-based CDN caches are useless out of the box. Two patches help. APQ — Automatic Persisted Queries — sends the SHA-256 hash of the query text; the server replies with a "PersistedQueryNotFound" if it has not seen the hash, and the client retries with the full document. APQ alone is a performance feature. Safelisted persisted queries — where the server rejects any document whose hash is not pre-registered — are the security feature: they turn a GraphQL endpoint into something with the cacheability and attack surface of a REST endpoint.

Introspection is the schema-level superpower and a real production hazard. Querying `__schema` returns the entire SDL. It powers GraphiQL, Apollo Sandbox, codegen, and every IDE feature you love. It also hands the schema to attackers. The PortSwigger guidance is to disable introspection in production for any non-public API. Apollo's "did you mean…" suggestions can leak the schema even with introspection off — tools like Clairvoyance reconstruct it from error messages.

Federation handles the multi-team case. Apollo's Federation v2 (GA 2022, currently at v2.13+) and the rival GraphQL Fusion spec (announced August 2023 by ChilliCream and The Guild) compose many small subgraphs into one supergraph, executed by a Router. The reconvened Composite Schemas Working Group (May 2024 — Apollo, ChilliCream, Google, Graphile, The Guild, Hasura, IBM) is trying to harmonize federation, Fusion, and stitching into one open standard. Apollo Router 1.60+ no longer runs Federation v1 supergraphs; the original `@apollo/federation` package was end-of-lifed September 22, 2023.

## Where it shows up in production

**GitHub** moved its public API to GraphQL ("v4") in 2016. The rate limit is 5,000 points per hour for users, up to 10,000–12,500 for Enterprise GitHub Apps. Secondary limits cap concurrency at 100 and CPU at 60 seconds per minute for GraphQL specifically. GitHub's points-cost rate limiter is itself an admission that resolver amplification at scale is a real production hazard.

**Shopify** runs both Storefront and Admin GraphQL APIs. The Admin API uses calculated query cost in points: 50 per second on standard plans with a 1,000-point bucket, up to 500/sec for Plus. The Storefront API uses time-interval limits with a 1,000-complexity ceiling for tokenless access. Shopify's engineering blog on calculating query complexity is one of the public archetypes.

**Netflix** runs the DGS framework — its Java/Kotlin Spring Boot wrapper around graphql-java — and Studio Edge, its federated supergraph in production since 2019. Netflix's consumer apps migrated off Falcor onto federated GraphQL in 2022. The supergraph composes roughly 70 subgraphs.

**Airbnb** has invested deeply in GraphQL since 2018 and was a founding member of the GraphQL Foundation. At GraphQLConf 2025, Raymie Stata open-sourced **Viaduct**, Airbnb's framework for building federated GraphQL services.

**Coinbase** rebuilt its retail React Native and React web apps on Relay+GraphQL starting around 2020 and is one of the most cited modern Relay shops. Note: the popular "Coinbase abandoned GraphQL" claim is not supported by their public engineering blog; the Coinbase Pro REST API deprecation in June 2024 is a separate event.

**Pinterest, PayPal, Coursera, Wayfair, Yelp, Walmart, Twitch, Atlassian, Intuit, KLM, Credit Karma, NBC News Digital** — all confirmed users at the time of the 2019 Honeypot documentary, with continued public talks since. Mark Larah from Yelp gave a 2025 talk on a federation query-planner edge case.

The server library landscape is broad. **graphql-js** is the reference implementation and the substrate for everything in Node. **Apollo Server** is the most-deployed JS server. **GraphQL Yoga** (The Guild) is the opinionated batteries-included alternative; **Mercurius** (Fastify) targets high throughput. **Hot Chocolate 14** (ChilliCream, .NET) shipped August 2024 with paged DataLoaders and Fusion support. **graphql-java + DGS** is Netflix's stack. **gqlgen** (Go) is code-generation-first. **Strawberry** and **Graphene** split the Python world between code-first and schema-first. **Async-graphql** (Rust) powers Cosmo subgraphs. **Hasura** auto-generates a GraphQL API from PostgreSQL, MS SQL, or BigQuery; **PostGraphile** does the same from PostgreSQL. **Grafbase** is a Rust-based federation gateway shipping at the edge.

On the gateway side, **Apollo Router** (Rust, GA 2022) is the dominant supergraph runtime. Apollo's own benchmarks claim roughly 9× the throughput of six Apollo Gateway (Node) instances on an 8-vCPU node and 1–2 ms added latency, with 10× higher throughput, 10× lower latency, and 12× less variance versus the Node Gateway. Treat those as vendor numbers — Grafbase and The Guild publish independent benchmarks with different conclusions. **Cosmo Router** (WunderGraph, Go, Apache-2.0) is the open-source alternative, with Federation v1/v2 and now Composite Schemas support. **Hive Gateway** and **Hive Router** (The Guild) — the latter Rust-based, launched at GraphQLConf 2025 — round out the field. **Mesh** (The Guild) federates GraphQL alongside REST and gRPC.

## Things that go wrong

**The Hasura update_many bypass — November 2022.** Hasura v2.10 shipped a new update_many API for Postgres backends. A bug in the row-level authorization code meant the permission check silently slipped: any authenticated user could update any column they had update permission on, on any row of the target table — and read back any selectable column from the affected rows. It went unnoticed for over a year. Researchers Morten Hillbom and Issaaf Kattan from Nhost's customer Celsia.io discovered it on November 16, 2022, and emailed `security@hasura.io`. The mailbox was misconfigured. The email vanished.

They had to track down a Hasura employee through a personal contact at Nhost just to report the vulnerability. Hasura patched 2.10.2 through 2.15.2 within days of being told, pulled vulnerable Docker images, redesigned authorization to enforce coverage in CI, and replaced the security@ mailbox with a real human-monitored alias. The post-mortem is unusual for being open about both failures: the code failure and the process failure that hid it. A separate, older information-disclosure issue (Exploit-DB 50803, Hasura 2.2.0) leaked arbitrary root environment variables via `add_remote_schema` URL coercion.

**CVE-2023-26144 — graphql-js DoS via overlapping fragments.** Versions 16.3.0 to <16.8.1 of `graphql` had insufficient checks in the `OverlappingFieldsCanBeMergedRule`. Deeply-nested or reused fragments triggered exponential validation work. The graphql-php variant of the same bug class measured roughly 117 seconds of CPU per request on a 364 KB query at 200/100 nesting depth. The fix landed in graphql-js 16.8.1.

**CVE-2025-31496 — Apollo Compiler.** Versions <1.27.0 process named fragments once per fragment spread on some paths, leading to exponential resource use under deeply nested reused fragments. CVSS 7.5, network attack vector, no auth required.

**CVE-2025-32032 — Apollo Router DoS via recursive named fragments.** The native query planner mishandled deeply-nested named fragments; recursive fragments expanded indefinitely during planning, before any subgraph fetch — monopolizing the multi-threaded planner pool. Affected Router <1.61.2 and <2.1.1. Federation's `query-planner-js` advisory `GHSA-fmj9-77q8-g6c4` covers the same class. A separate prototype-pollution fix landed as `GHSA-pfjj-6f4p-rvmh`.

**Apollo Server XSS via GraphQL Playground (`GHSA-qm7x-rc44-rrqw`).** A graphql-playground XSS exploitable via crafted link, with cookie and session theft impact for any Apollo Server still serving Playground. Playground itself has been deprecated and end-of-life since December 31, 2022 — use GraphiQL or Apollo Sandbox.

**`GHSA-47qc-hrx3-r993` — September 25, 2025 — CSRF in Apollo Embedded Sandbox / Explorer** via `window.postMessage` origin-validation bypass.

**CVE-2022-24434 / dicer.** Transitive vulnerability through `apollo-server-core`'s `graphql-upload-8-fork` → `busboy` → `dicer`, hitting many Apollo Server 2 deployments via the community multipart-upload spec.

**Batching attacks and alias overloading.** A single HTTP request can carry thousands of aliased subqueries — each a separate logical operation — bypassing per-request rate limits, brute-forcing OTP and 2FA endpoints, and triggering N+1 amplification at the database layer. The pattern is documented in detail by Escape, Checkmarx, Imperva, and PortSwigger.

**N+1 in production.** This is *the* recurring class. A query that walks a list of users and their posts naïvely fires one database query per user — turn 100 users into 10,000 queries. The textbook fix is the DataLoader pattern, originally `@schrockn`'s Loader at Facebook circa 2010, now standard in graphql-js, async-graphql, and most server libraries. WunderGraph's "DataLoader 3.0" breadth-first algorithm in Cosmo Router is a 2023+ refinement.

## Common pitfalls (for the practitioner)

- **Treating APQ as security.** APQ alone is a performance feature. Without safelisting (the client must use a registered hash and full strings are rejected), it does nothing for security.
- **Leaving introspection on in production.** Even disabled, Apollo's "did you mean" hints can be brute-forced into a schema dump by tools like Clairvoyance. Turn off both.
- **Default 200 OK on every error.** The new `application/graphql-response+json` media type fixes the spec ambiguity, but if your server still replies with `application/json`, your APM dashboards will show green while users see error toasts.
- **No depth or complexity limit.** Without a `maxDepth` cap (10–15 is the common range) or a cost calculator (GitHub points, Shopify cost, Federation `@cost`/`@listSize`), recursive-fragment DoS is an open door.
- **No alias-batching cap.** A single request with thousands of aliased subqueries trivially defeats per-request rate limits.
- **Mutations that don't return enough.** A mutation should return the fields the client needs to update local state, or you have just turned one round trip into two.
- **Versioning the API.** Don't. Use `@deprecated(reason: "...")` and add fields. Schema evolution is the path; URL versioning is the anti-pattern.
- **Subscription-transport sprawl.** Picking the deprecated `subscriptions-transport-ws` instead of `graphql-ws`, or running both in parallel, will bite. SSE is the safer modern default.
- **Nullable-by-default surprises.** Every field is nullable unless marked `!`. The spec authors chose this so resolvers could degrade gracefully; in practice, real teams add a linter rule that requires a justification comment for any non-null field crossing a service boundary.

## Debugging it

- **GraphiQL** — the reference IDE, actively maintained. Embed it on a non-production endpoint and you have a live schema explorer.
- **Apollo Sandbox / Explorer** — embedded in Apollo Server's default landing page outside production.
- **Altair GraphQL Client** — desktop and web; supports incremental delivery testing.
- **Nitro** (ChilliCream, formerly Banana Cake Pop) — Monaco-based IDE.
- **Hasura console** — bundled with Hasura.
- **GraphQL Playground** — deprecated and end-of-life since December 31, 2022. Do not use in new projects.
- **OpenTelemetry GraphQL semantic conventions** — `graphql.document`, `graphql.operation.name`, `graphql.operation.type` are the standard span attributes. Apollo specifically warns against making `graphql.document` a default attribute due to high cardinality and PII risk in query strings.
- **Apollo trace format** — the historical per-resolver tracing standard, increasingly being subsumed by the OTel work at the GraphQL Foundation's OpenTelemetry Working Group.
- **The 200-OK trap.** When debugging "why does my dashboard look fine while users complain," remember: a populated `errors[]` array on a 200 response is the canonical GraphQL failure mode. Wire your monitoring to alert on `errors[]`, not on HTTP status.
- **Disable introspection in prod.** And run a tool like Clairvoyance against your own endpoint to confirm "did you mean" suggestions aren't leaking the schema anyway.

## What's changing in 2026

- **April 2026 — Hot Chocolate Fusion 14 GA.** ChilliCream's federation runtime reaches general availability, intensifying the multi-vendor federation race.
- **October 2025 — Apollo joins the GraphQL Foundation AI Working Group.** Co-founded with Apollo to push agent-to-agent open standards; positions GraphQL as a first-class citizen of the agentic-AI stack.
- **September–October 2025 — GraphQL turns 10.** GraphQLConf 2025 in Amsterdam (September 8–10, over 250 attendees) was the 10-year celebration, with Lee Byron's opening keynote announcing the September 2025 spec edition.
- **September 2025 — the new spec edition.** First full edition since October 2021. Adds Schema Coordinates (a stable way to reference a field), OneOf input objects (input unions via `@oneOf`), descriptions on executable documents, full Unicode grammar, and clarifications on deprecation and execution semantics.
- **September 2025 — Meta's `@async` directive.** Unveiled by Matt Mahoney at GraphQLConf 2025 as a successor to `@defer`. Clients explicitly request data only when needed, trimming the hidden costs that `@defer` leaves on the server. Airbnb's Viaduct framework was open-sourced in the same week.
- **September 2025 — Hive Router launched.** The Guild's Rust-based federation router, debuted at GraphQLConf.
- **July 2025 — GraphQL-over-HTTP working draft.** Dated July 24, 2025. Introduces the `application/graphql-response+json` media type; recommends `/graphql`; sets the 200-on-non-null-data rule. Compliance deadline of January 1, 2025 has already passed.
- **2024–2025 — multipart-subscriptions in GraphOS.** Apollo's HTTP-based multipart/mixed subscription transport is GA, claiming 9,000 subscription events per second per Router with microsecond-scale added latency (vendor figures). Matteo Collina (Platformatic) showed stateless subscriptions at GraphQLConf 2025.
- **May 2024 — Composite Schemas Working Group reconvened.** Formal subcommittee with Apollo, ChilliCream, Google, Graphile, The Guild, Hasura, and IBM. The work-in-progress spec adds Entity Resolvers and the `@is` directive — entities become regular resolvers with semantic-equivalence annotations, dropping the `_entities` magic.
- **2024 — Apollo Federation v2.9+.** Adds `@cost` and `@listSize`, progressive `@override`, `@authenticated`, `@requiresScopes`, `@policy`, and Connect spec preview features. Apollo Router 1.60+ dropped Federation v1 supergraph compatibility.
- **`@defer` and `@stream` status.** Stage 2 proposal, still draft, *not yet* in the September 2025 spec edition. graphql-js v17 alpha implements them; Apollo Server 5, Yoga, gqlgen, Hot Chocolate, and Shopify Storefront ship them. Cosmo deliberately does *not* support them — WunderGraph publicly argues they are "overkill."
- **The "fall of GraphQL" narrative.** WunderGraph's Jens Neuse wrote in 2024 that "monolithic GraphQL APIs are dead" and that Federation is solving an organizational problem, not a technical one. Adam Jay published "GraphQL was not the future" in August 2024. Independent sources note operational costs running 2–3× REST equivalents, and HackerRank shows declining test invites for some GraphQL skills in 2025. Net read: adoption is normalizing, not collapsing — the trough of disillusionment for greenfield projects, with continued depth at the scale-out leaders.

## Fun facts (host material)

- **The internal name was SuperGraph.** Schrock posted the prototype to Facebook's internal code review tool in February 2012; the team picked the public name later. Lee Byron's tribute tweet calling it "the prototype that really resembled GraphQL" is the canonical citation. GraphQL 1.0 shipped to production with Facebook for iOS 5.0 in summer 2012; by the end of 2014, every component of Facebook's iOS app was served by GraphQL.

- **The misspelling that won't die.** Many derivative blogs credit the third co-creator as "Dan Schmidt." The correct spelling is Dan Schafer. Schafer is still at Meta; Schrock founded Elementl (the Dagster company); Lee Byron is now Executive Director of the GraphQL Foundation, and previously led engineering at Robinhood and Watershed.

- **GraphQL is *not* a graph-database query language.** This is the most persistent misunderstanding in the entire ecosystem — the assumption that GraphQL is for Cypher- or Gremlin-style graph databases. The "graph" is your object graph; the spec is explicit that it is not tied to any database.

- **The license fight.** Facebook initially shipped GraphQL under its controversial BSD + Patents license. The Apache Software Foundation banned it from Apache projects in July 2017, and GitLab froze its GraphQL effort. On September 26, 2017 — not 2018 — Facebook relicensed the spec under the Open Web Foundation Agreement v1.0 and graphql-js and Relay under MIT.

- **The 200-OK paradox is in the spec.** GraphQL returns HTTP 200 even when your query failed, and the GraphQL-over-HTTP spec actually requires it: if `data` is non-null, the server MUST use a 200 status code. Your APM dashboard shows green while users see error toasts. The fix only kicks in if you opt into `application/graphql-response+json` — the recommended default since January 1, 2025.

- **Subscription is the hardest part.** A running joke in the GraphQL Working Group, validated by the existence of at least five subscription transports in widespread use today: graphql-ws, the deprecated subscriptions-transport-ws, SSE-graphql, AppSync MQTT, and Apollo's multipart-subscriptions. Tom Houlé's 2025 GraphQLConf lightning talk title — "The Federated GraphQL Subscriptions Zoo" — wrote itself.

- **Trailing commas are legal.** GraphQL is one of the few hand-written wire formats that allows trailing commas in argument and field lists, partly to be friendly to codegen.

- **Nullable-by-default.** Every field is nullable unless marked `!`. The spec authors chose this deliberately so that resolvers could degrade gracefully when a downstream service is down. It remains the most-debated single design decision in the community.

- **Relay was open-sourced alongside GraphQL** at React.js Conf 2015, in the same Schafer/Chen joint talk that unveiled both — and React Native.

## Where this connects in the book

- **Part Foundations — Chapter "Client-Server vs Peer-to-Peer"** — the two communication patterns and what each makes easy or hard; GraphQL is the modern client-server poster child.
- **Part Foundations — Chapter "Protocols for AI Agents"** — sets up MCP and A2A, the new agent layer where GraphQL is being repositioned (see Apollo's October 2025 GraphQL Foundation AI Working Group).
- **Part Story of the Internet — Chapter "The AI Agent Layer (2024–)"** — the longer arc: HTTP, gRPC, and GraphQL held the application layer for fifteen years until MCP and A2A arrived.
- **Part Web/API — Chapter "REST and GraphQL"** — the canonical pairing, the 25-year argument over what Roy Fielding actually meant by REST, and the mobile-scale crisis that produced GraphQL.
- **Part Web/API — Chapter "gRPC"** — the contrasting case: typed RPC over HTTP/2 for the controlled-both-sides datacenter problem, where GraphQL's HTTP+JSON shape is too heavy.

## See also (other protocol episodes)

If you've heard the **REST episode**, the contrast is everything. REST exposes fixed endpoints with server-defined shapes; GraphQL exposes one endpoint where the client picks the shape. REST gets HTTP caching and CDN tooling for free; GraphQL pays for that with persisted queries. REST shines for simple CRUD and predictable public URLs; GraphQL shines for clients with wildly different data needs from the same backend — mobile vs desktop vs watch.

If you've heard the **gRPC episode**, the framing is "controlled both sides vs not." gRPC assumes shared schema, binary Protocol Buffers, HTTP/2 trailers — none of which the public web supports cleanly. It dominates inside the datacenter. GraphQL targets the heterogeneous front end: browsers, mobile apps, AppSync mobile clients. Many companies use gRPC east-west between services and GraphQL north-south at the edge.

If you've heard the **JSON-RPC episode**, the philosophical sibling is obvious: single endpoint, message-based, structured envelope. The contrast is that GraphQL ships a type system and selection language, while JSON-RPC defines only the envelope. JSON-RPC has no schema, no introspection, no field selection. GraphQL is JSON-RPC with a type system and a query language stapled on.

If you've heard the **WebSocket episode**, that is where most subscription traffic still lives — the `graphql-transport-ws` sub-protocol via the `graphql-ws` library. The deprecated `graphql-ws` (the old Apollo `subscriptions-transport-ws` protocol — yes, same name, different protocol, genuinely confusing) is the legacy path.

If you've heard the **SSE episode**, this is the modern subscription transport for new GraphQL projects. Server-Sent Events survives proxies that mangle WebSocket upgrades, composes with HTTP/2, and inherits HTTP auth and auto-reconnect. The GraphQL-over-HTTP working group is moving toward SSE as the recommended path for incremental delivery.

If you've heard the **SOAP episode**, the parallel is surprising. SOAP was the original "RPC over HTTP with a strong schema (WSDL/XSD)." GraphQL is in some sense SOAP's grandchild — minus the XML, plus a query language and field selection. Both decouple operation discovery (introspection vs WSDL) from operation execution.

If you've heard the **HTTP/1.1, HTTP/2, and HTTP/3 episodes**, GraphQL inherits all of them as transport. HTTP/2 multiplexing helps when a client fires many concurrent operations on one connection but does not change the GraphQL execution model. HTTP/3 and QUIC's per-stream loss recovery give modest benefit because GraphQL clients tend to send fewer, larger requests; APQ with GET turns persisted queries into CDN-cacheable URLs even on /3.

## Visual cues for image generation

- "A single /graphql endpoint surrounded by client devices — phone, watch, dashboard, TV — each pulling a differently-shaped JSON tree from the same URL."
- "Side-by-side: REST returning four resources for one mobile screen vs GraphQL returning one nested response in one round trip."
- "A GraphQL document anatomy: operation → selection set → fields → arguments → directives, with $variables threaded through."
- "The 200-OK paradox: HTTP status 200 returned alongside a populated errors[] array — green dashboard, broken UI."
- "A federated supergraph: Apollo Router on top, four subgraphs below (users, products, reviews, inventory), arrows showing query plan splits."
- "Schrock's February 2012 internal Facebook code review labelled SuperGraph, with 2015 React.js Conf as the public reveal."

## Sources

**Specs**
- [GraphQL Specification (September 2025)](https://spec.graphql.org/September2025/)
- [GraphQL-over-HTTP working draft](https://graphql.github.io/graphql-over-http/draft/)
- [GraphQL-over-HTTP spec on GitHub](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md)
- [Composite Schemas spec](https://github.com/graphql/composite-schemas-spec)
- [Composite Schemas Working Group](https://github.com/graphql/composite-schemas-wg)
- [Incremental Delivery RFC](https://github.com/graphql/graphql-over-http/blob/main/rfcs/IncrementalDelivery.md)
- [graphql-spec PR 1110 — defer/stream](https://github.com/graphql/graphql-spec/pull/1110)
- [Relay Cursor Connections](https://relay.dev/graphql/connections.htm)
- [OpenTelemetry GraphQL semantic conventions](https://opentelemetry.io/docs/specs/semconv/graphql/)
- [OTel WG for GraphQL](https://github.com/graphql/otel-wg)

**Vendor / engineering blogs**
- [Facebook Engineering — GraphQL: A Data Query Language (2015)](https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/)
- [Lee Byron — Relicensing the GraphQL Specification](https://leebyron.com/relicensing-the-graphql-specification/)
- [Lee Byron — Introducing the GraphQL Foundation](https://medium.com/@leeb/introducing-the-graphql-foundation-3235d8186d6d)
- [Apollo — Federation 2 GA](https://www.apollographql.com/blog/apollo-federation-2-is-now-generally-available)
- [Apollo — Router GA](https://www.apollographql.com/blog/apollo-router-is-now-generally-available)
- [Apollo — Router in Rust](https://www.apollographql.com/blog/apollo-router-our-graphql-federation-runtime-in-rust)
- [Apollo — Router open preview benchmarks](https://www.apollographql.com/blog/apollo-router-our-new-high-performance-federation-runtime-is-now-available-in-open-preview)
- [Apollo — Federated subscriptions in GraphOS](https://www.apollographql.com/blog/federated-subscriptions-in-graphos-real-time-data-at-scale)
- [Apollo — 10 Years of GraphQL at GraphQLConf 2025](https://www.apollographql.com/blog/10-years-of-graphql-celebrated-at-graphqlconf-2025)
- [Apollo — Federation versions](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/reference/versions)
- [Apollo — APQ docs](https://www.apollographql.com/docs/apollo-server/performance/apq)
- [Apollo — Persisted queries (GraphOS)](https://www.apollographql.com/docs/graphos/operations/persisted-queries)
- [Apollo — Router OTel attributes](https://www.apollographql.com/docs/graphos/routing/observability/router-telemetry-otel/enabling-telemetry/standard-attributes)
- [Apollo — Netflix federated supergraph](https://www.apollographql.com/blog/an-unexpected-journey-how-netflix-transitioned-to-a-federated-supergraph)
- [Apollo — joins Agentic AI Foundation](https://www.apollographql.com/newsroom/press-releases/apollo-graphql-joins-agentic-ai-foundation-to-advance-open-standards-for-agent-to)
- [graphql-ws (enisdenjo)](https://github.com/enisdenjo/graphql-ws)
- [DataLoader](https://github.com/graphql/dataloader)
- [The Guild — Yoga defer/stream](https://the-guild.dev/graphql/yoga-server/docs/features/defer-stream)
- [The Guild — APQ in Yoga](https://the-guild.dev/graphql/yoga-server/docs/features/automatic-persisted-queries)
- [The Guild — GraphQLConf 2025 recap](https://the-guild.dev/graphql/hive/blog/graphql-conf-2025-recap)
- [WunderGraph — six-year GraphQL recap](https://wundergraph.com/blog/six-year-graphql-recap)
- [WunderGraph — defer/stream are overkill](https://wundergraph.com/blog/graphql_defer_and_stream_are_overkill)
- [WunderGraph — DataLoader 3.0 breadth-first](https://wundergraph.com/blog/dataloader_3_0_breadth_first_data_loading)
- [WunderGraph — state of distributed GraphQL 2024](https://wundergraph.com/blog/the_state_of_distributed_graphql_2024)
- [WunderGraph — quirks of subscriptions](https://wundergraph.com/blog/quirks_of_graphql_subscriptions_sse_websockets_hasura_apollo_federation_supergraph)
- [Cosmo Router (WunderGraph)](https://github.com/wundergraph/cosmo)
- [ChilliCream — GraphQL Fusion](https://chillicream.com/blog/2023/08/15/graphql-fusion/)
- [ChilliCream — Hot Chocolate 14](https://chillicream.com/blog/2024/08/30/hot-chocolate-14/)
- [Netflix DGS Framework](https://github.com/Netflix/dgs-framework)
- [Netflix DGS subscriptions](https://netflix.github.io/dgs/advanced/subscriptions/)
- [gqlgen subscriptions](https://gqlgen.com/recipes/subscriptions/)
- [Hasura — critical update_many vulnerability](https://hasura.io/blog/critical-vulnerability-in-hasuras-graphql-engine-v2-10-0)
- [Shopify Engineering — Calculating query complexity](https://shopify.engineering/rate-limiting-graphql-apis-calculating-query-complexity)
- [Shopify API limits](https://shopify.dev/docs/api/usage/limits)
- [Shopify Storefront defer](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/defer)
- [GitHub — GraphQL rate limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [Coinbase — Rearchitecting apps for scale](https://www.coinbase.com/blog/rearchitecting-apps-for-scale)
- [Grafbase — federation gateway benchmarks](https://grafbase.com/blog/benchmarking-grafbase-vs-apollo-vs-cosmo-vs-mesh)
- [GraphQL Foundation — Composite Schemas announcement](https://graphql.org/blog/2024-05-16-composite-schemas-announcement/)
- [GraphQL.org — GraphQLConf 2025 article 1](https://graphql.org/blog/2025-10-20-graphql-conf-2025-article-1/)

**News and analysis**
- [Postman blog — What is GraphQL: The Facebook Years](https://blog.postman.com/what-is-graphql-part-one-the-facebook-years/)
- [Nordic APIs — interview with Lee Byron](https://nordicapis.com/interview-with-graphql-co-creator-lee-byron/)
- [Nordic APIs — patent release](https://nordicapis.com/what-the-graphql-patent-release-means-for-the-api-industry/)
- [The Register — Facebook frees React from unloved license](https://www.theregister.com/2017/09/22/facebook_will_free_react_other_code_from_unloved_license/)
- [The Register — Facebook license surgery on React](https://www.theregister.com/2017/09/26/facebook_license_surgery_on_react/)
- [WP Tavern — lessons from the GraphQL documentary](https://wptavern.com/lessons-from-the-graphql-documentary-never-underestimate-the-power-of-open-source-communities)
- [Linux Foundation — intent to form GraphQL Foundation](https://www.linuxfoundation.org/press/press-release/intent_to_form_graphql)
- [Progosling — September 2025 spec digest](https://progosling.com/en/dev-digest/graphql-spec-september-2025)
- [Progosling — GraphQL-over-HTTP working draft 2025](https://progosling.com/en/dev-digest/graphql-over-http-working-draft-2025)
- [Adam Jay — GraphQL was not the future](https://acjay.com/2024/08/14/graphql-was-not-the-future/)
- [Mehdi Bafdil — The GraphQL honeymoon is over](https://medium.com/@mehdibafdil/the-graphql-honeymoon-is-over-and-the-bills-are-here-1dd01706e25d)
- [HackerRank — Skills in retreat 2025](https://www.hackerrank.com/blog/skills-in-retreat-developer-skills-on-the-decline-in-2025/)
- [IBM — Seven key insights on GraphQL trends](https://www.ibm.com/think/insights/seven-key-insights-on-graphql-trends)
- [PortSwigger Web Security Academy — GraphQL](https://portswigger.net/web-security/graphql)
- [Escape — GraphQL batch attacks cause DoS](https://escape.tech/blog/graphql-batch-attacks-cause-dos/)
- [Checkmarx — GraphQL batching attack](https://checkmarx.com/blog/didnt-notice-your-rate-limiting-graphql-batching-attack/)
- [Imperva — GraphQL vulnerabilities](https://www.imperva.com/blog/graphql-vulnerabilities-common-attacks/)
- [Ameeba — CVE-2025-31496](https://www.ameeba.com/blog/cve-2025-31496-graphql-query-vulnerability-in-apollo-compiler-leading-to-possible-denial-of-service/)
- [UndercodeNews — CVE-2025-32032 Apollo Router](https://undercodenews.com/cve-critical-flaw-in-apollo-router-leaves-federated-graphql-systems-vulnerable/)
- [DailyCVE — graphql-php DoS](https://dailycve.com/graphql-php-algorithmic-complexity-dos-cve-2023-26144-critical/)
- [GHSA-9pv7-vfvm-6vr7 (CVE-2023-26144)](https://github.com/advisories/GHSA-9pv7-vfvm-6vr7)
- [NVD — CVE-2023-26144](https://nvd.nist.gov/vuln/detail/CVE-2023-26144)
- [Apollo Server advisory — Playground XSS (GHSA-qm7x-rc44-rrqw)](https://github.com/apollographql/apollo-server/security/advisories/GHSA-qm7x-rc44-rrqw)
- [Apollo Server advisories index](https://github.com/apollographql/apollo-server/security/advisories)
- [Apollo Federation query-planner-js changelog](https://github.com/apollographql/federation/blob/main/query-planner-js/CHANGELOG.md)
- [ChainCatcher — Coinbase Pro REST deprecation](https://www.chaincatcher.com/en/article/2127142)

**Wikipedia and reference**
- [Wikipedia — GraphQL](https://en.wikipedia.org/wiki/GraphQL)
- [GraphQL.org — Learn](https://graphql.org/learn/)
- [GraphQL.org — Serving over HTTP](https://graphql.org/learn/serving-over-http/)
- [GraphQL.org — Response](https://graphql.org/learn/response/)
- [GraphQL.org — Pagination](https://graphql.org/learn/pagination/)
- [GraphQL: The Documentary (Honeypot, 2019)](https://www.youtube.com/watch?v=783ccP__No8)
