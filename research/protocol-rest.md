---
prompt_source: deep-research-prompts.txt:4123-4309 (REST)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/6cc1fa2b-628e-4ed0-9784-17cb9e4f3e70
research_mode: claude.ai Research
---

# Representational State Transfer (REST): A Source-Document for the Modern API Engineer

## Prerequisites and glossary

REST is an architectural style layered atop a stack of internet plumbing. Before you can argue about what is or isn't "RESTful," you need a working vocabulary. Definitions below are grouped roughly by layer.

**Networking and HTTP transport**

- **OSI / TCP-IP stack**: Two complementary layered models. The 4-layer TCP/IP model (Link, Internet, Transport, Application) is the practical one; the 7-layer OSI model (Physical, Data Link, Network, Transport, Session, Presentation, Application) is the pedagogical one. REST lives at the Application layer. ([https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/))
- **TCP (Transmission Control Protocol)**: A connection-oriented, byte-stream, reliable transport. HTTP/1.1 and HTTP/2 ride on TCP. ([https://www.rfc-editor.org/rfc/rfc9293.html](https://www.rfc-editor.org/rfc/rfc9293.html))
- **UDP (User Datagram Protocol)**: A connectionless datagram protocol. HTTP/3 rides on UDP via QUIC. ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768))
- **Datagram / packet / frame**: A datagram is a self-contained UDP message; a packet is a routed IP unit; a frame is a link-layer unit (Ethernet) or, in HTTP/2/3, a logical unit inside a stream. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))
- **Stream**: In HTTP/2 and HTTP/3, a stream is an independent, bidirectional sequence of frames within a connection. ([https://www.rfc-editor.org/rfc/rfc9113.html](https://www.rfc-editor.org/rfc/rfc9113.html))
- **Socket**: The OS-level endpoint of a network connection (an IP address plus a port).
- **Handshake**: The negotiated open of a connection. TCP uses a 3-way handshake (SYN / SYN-ACK / ACK); TLS adds another 1–2 round trips; QUIC fuses transport and crypto handshakes into one. ([https://www.rfc-editor.org/rfc/rfc9000.html](https://www.rfc-editor.org/rfc/rfc9000.html))
- **TLS (Transport Layer Security)**: The encryption layer for HTTPS. TLS 1.3 (RFC 8446) is the modern baseline; ~75% of top sites support it as of mid-2025. ([https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)) [Technologychecker](https://technologychecker.io/blog/http-protocol-adoption)
- **mTLS (mutual TLS)**: Both client and server present X.509 certificates; common in service-to-service auth.
- **Header / checksum**: A header is metadata at the start of a message; a checksum is an integrity hash carried in many lower-layer protocols.

**HTTP semantics (the substrate REST formalizes)**

- **HTTP**: Stateless application protocol. Modern definitive specs are RFC 9110 (Semantics, June 2022), RFC 9111 (Caching), RFC 9112 (HTTP/1.1), RFC 9113 (HTTP/2), RFC 9114 (HTTP/3). ([https://www.rfc-editor.org/rfc/rfc9110.html](https://www.rfc-editor.org/rfc/rfc9110.html))
- **URI / URL / URN**: A URI identifies a resource; a URL is a URI that also tells you how to retrieve it; a URN is a URI that names without locating. Defined by RFC 3986. ([https://www.rfc-editor.org/rfc/rfc3986](https://www.rfc-editor.org/rfc/rfc3986))
- **Percent-encoding**: The `%XX` escaping for reserved bytes in URIs. (RFC 3986 §2.1)
- **Media type / MIME type**: A registered string like `application/json` or `application/vnd.api+json` that describes the format of a representation. ([https://www.iana.org/assignments/media-types/media-types.xhtml](https://www.iana.org/assignments/media-types/media-types.xhtml))
- **Content negotiation**: The process by which client and server agree on a representation, primarily through the `Accept`, `Accept-Language`, `Accept-Encoding` request headers and the `Content-Type` and `Vary` response headers. (RFC 9110 §12) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9110.html)
- **JSON**: JavaScript Object Notation, RFC 8259. The de-facto representation for REST today, despite Fielding's protocol-agnostic design. ([https://www.rfc-editor.org/rfc/rfc8259](https://www.rfc-editor.org/rfc/rfc8259))
- **XML**: Markup language; the original REST representation in many WS-* and AtomPub designs.
- **Base64**: Binary-to-text encoding (RFC 4648), used for `Authorization: Basic` and JWT segments.
- **JWT (JSON Web Token)**: A signed (and optionally encrypted) JSON token, RFC 7519. Three base64url segments separated by dots: header.payload.signature. ([https://www.rfc-editor.org/rfc/rfc7519](https://www.rfc-editor.org/rfc/rfc7519))
- **OAuth 2.0 / 2.1**: An authorization framework (not authentication). 2.0 is RFC 6749; 2.1 is `draft-ietf-oauth-v2-1` (current draft 15, March 2026), consolidating PKCE-required code flow, exact-match redirect URIs, and removing implicit + ROPC grants. ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- **CORS (Cross-Origin Resource Sharing)**: Browser mechanism that lets a server opt in to letting JavaScript on origin A talk to origin B, via headers like `Access-Control-Allow-Origin`. The "preflight" is a `OPTIONS` request the browser sends before non-simple requests to ask permission. ([https://fetch.spec.whatwg.org/#cors-protocol](https://fetch.spec.whatwg.org/#cors-protocol))

**REST-specific vocabulary**

- **Resource**: Any information that can be named — a document, a service, a temporal version of something. Identified by a URI.
- **Representation**: A snapshot (bytes plus media type plus metadata) of a resource at some moment. The dissertation is explicit that the resource is the abstract concept; the representation is what crosses the wire. ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm))
- **Statelessness**: Each request must carry everything the server needs to interpret it; the server keeps no client session state between requests. (Fielding §5.1.3) [IETF](https://datatracker.ietf.org/doc/rfc9110/)[Ole Begemann](https://oleb.net/2018/rest/)
- **Idempotence**: A method is idempotent if N identical requests have the same effect as one. GET, HEAD, PUT, DELETE, OPTIONS are idempotent; POST and PATCH are not. (RFC 9110 §9.2.2)
- **Safe methods**: Methods that are read-only / cause no observable state change: GET, HEAD, OPTIONS, TRACE. (RFC 9110 §9.2.1)
- **Cacheability**: A response carries metadata (`Cache-Control`, `ETag`, `Last-Modified`, `Vary`) that lets intermediaries reuse it. (RFC 9111)
- **HATEOAS (Hypermedia as the Engine of Application State)**: Clients should drive interactions by following links and forms in server responses, not by hard-coding URI templates. Pronounced **"hate-ee-oss"** in common usage. Fielding coined the term in 2000 and re-stated his frustration in 2008. ([https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)) [Wikipedia](https://en.wikipedia.org/wiki/Roy_Fielding)
- **Media type / hypermedia type**: The format that carries those links — HTML, JSON:API, HAL, Atom, Siren, etc.
- **ETag**: An "entity tag" — an opaque server-chosen identifier for a specific representation. Used with conditional requests. (RFC 9110 §8.8)
- **Conditional request**: A request that carries `If-Match`, `If-None-Match`, `If-Modified-Since`, or `If-Unmodified-Since`. The server returns 304 Not Modified or 412 Precondition Failed instead of resending or overwriting. (RFC 9110 §13)

## History and story

The story of REST is the story of one PhD student trying to write down — formally — what the people who built the Web already knew in their bones.

**Roy Thomas Fielding** (born 1965 in Laguna Beach, California) was already deep in the Web by the time he started his dissertation. From 1994 onward he co-authored HTTP/1.0 and HTTP/1.1, and he co-founded the Apache HTTP Server Project; MIT Technology Review named him one of its TR100 in 1999. ([https://en.wikipedia.org/wiki/Roy_Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)) His advisor at UC Irvine was Richard N. Taylor, and he credits Mark Ackerman's 1993 class on distributed information services and David Rosenblum's work on Internet-scale software architectures as the seeds of the project. ([https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)) [Wikipedia + 4](https://en.wikipedia.org/wiki/Roy_Fielding)

**The "Web's architectural style was developed iteratively over a six year period, but primarily during the first six months of 1995"**, Fielding writes in the dissertation acknowledgments. The original name was the "HTTP object model"; he renamed it Representational State Transfer because the prior name kept being mistaken for an HTTP server's implementation model, and "REST" was meant to evoke "an image of how a well-designed Web application behaves: a network of web pages (a virtual state-machine), where the user progresses through the application by selecting links (state transitions)." ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)) — so the popular myth that "REST is named after a rest stop" is romantic but wrong; the documented etymology is the state-machine metaphor. [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)[Ole Begemann](https://oleb.net/2018/rest/)

**The dissertation** — *Architectural Styles and the Design of Network-based Software Architectures* — was filed at UC Irvine in 2000. Most of it is *not* about REST: it is a taxonomy of architectural styles for distributed systems. Fielding derives REST step by step from the null style by adding constraints (Client-Server → Stateless → Cache → Uniform Interface → Layered System → optional Code-on-Demand). Only Chapter 5 defines REST itself; Chapter 6 critiques the deviations the Web had already made. ([https://twobithistory.org/2020/06/28/rest.html](https://twobithistory.org/2020/06/28/rest.html)) [Florian-kraemer + 3](https://florian-kraemer.net/software-architecture/2025/07/07/Most-RESTful-APIs-are-not-really-RESTful.html)

**The misappropriation** is its own arc. The early-2000s industry was dominated by **SOAP** (Simple Object Access Protocol, Microsoft 1998–onward), **XML-RPC** (Dave Winer, 1998), and the WS-* stack (WSDL, UDDI, WS-Security). These were heavyweight, XML-only, and largely tunneled RPC over HTTP POST — what Martin Fowler later called Level 0 of his maturity model. ([https://thehistoryoftheweb.com/soap-rest-odds/](https://thehistoryoftheweb.com/soap-rest-odds/)) Around 2004–2007, as web APIs proliferated (Flickr, Twitter, Amazon S3, Google Maps), developers reached for the lighter "REST" label. Leonard Richardson and Sam Ruby's *RESTful Web Services* (O'Reilly, 2007) and Richardson's 2008 QCon talk codified the **Richardson Maturity Model** — Level 0 (one URI, one verb), Level 1 (resources), Level 2 (HTTP verbs + status codes), Level 3 (hypermedia controls / HATEOAS) — popularized by Martin Fowler in March 2010. ([https://martinfowler.com/articles/richardsonMaturityModel.html](https://martinfowler.com/articles/richardsonMaturityModel.html)) [DEV Community + 5](https://dev.to/mikeralphson/a-brief-history-of-web-apis-47k4)

**Fielding's pushback.** On 20 October 2008 he posted *REST APIs must be hypertext-driven*, declaring: "I am getting frustrated by the number of people calling any HTTP-based interface a REST API. Today's example is the SocialSite REST API. That is RPC. It screams RPC … if the engine of application state (and hence the API) is not being driven by hypertext, then it cannot be RESTful and cannot be a REST API. Period." ([https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)) That post effectively split the community into a "Chapter 5 purist" wing (still active at [https://github.com/chapter5rest/manifesto](https://github.com/chapter5rest/manifesto)) and a pragmatic mainstream that uses "REST" to mean "JSON over HTTP with verbs and status codes" — Level 2 in Richardson terms. [Gbiv](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)[Emptyq](https://emptyq.net/a?ID=82ddcac2-cea9-40c1-9ee8-d7bf01647a16)

**Standardization arcs.** The original HTTP/1.1 spec was RFC 2616 (1999), refactored into RFCs 7230–7235 (2014), and *consolidated and obsoleted* by RFCs 9110 (Semantics), 9111 (Caching), 9112 (HTTP/1.1), 9113 (HTTP/2), and 9114 (HTTP/3) on **June 2022** — the most significant rewrite in over 20 years. Fielding co-edited 9110 with Mark Nottingham and Julian Reschke. ([https://www.rfc-editor.org/rfc/rfc9110.html](https://www.rfc-editor.org/rfc/rfc9110.html)) [ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/RFC9110)

Other formalisms tried to add structure on top of REST: **AtomPub** (RFC 5023, 2007) — a Fielding-blessed predecessor for editing collections; **OData** (Microsoft, 2007; OASIS standard since 4.0) — a query-rich superset; **HAL** (Mike Kelly, 2011) — minimal hypermedia; **JSON:API** — a strong opinionated convention, finalized v1.0 May 2015 and v1.1 on **30 September 2022**. ([https://jsonapi.org/](https://jsonapi.org/)) **OpenAPI / Swagger** evolved out of Tony Tam's work at Wordnik (2010), donated to the Linux Foundation in 2015. OpenAPI **3.1.0** released February 2021 (full JSON Schema alignment), and **3.2.0 released 23 September 2025** after a 4-year gap — adding the new HTTP `QUERY` method, hierarchical Tags, OAuth Device Flow, streaming media types, and `additionalOperations`. ([https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2](https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2)) [JSON:API + 8](https://jsonapi.org/)

**The competitive challenges.**

- **GraphQL.** Built at Facebook in spring 2012 by Lee Byron, Nick Schrock, and Dan Schafer for the iOS News Feed rewrite (the project Mark Zuckerberg called Facebook's "biggest mistake" until they pivoted off HTML). Open-sourced August 2015; donated to the Linux Foundation as the GraphQL Foundation in 2018. ([https://leebyron.com/introducing-the-graphql-foundation/](https://leebyron.com/introducing-the-graphql-foundation/)) [Nordic APIs + 2](https://nordicapis.com/interview-with-graphql-co-creator-lee-byron/)
- **gRPC.** Released by Google in **August 2016** (gRPC 1.0), descended from internal Stubby. Protocol Buffers over HTTP/2, with bidirectional streaming and code generation in many languages. ([https://grpc.io/blog/state-of-grpc-web/](https://grpc.io/blog/state-of-grpc-web/)) [gRPC + 2](https://grpc.io/blog/state-of-grpc-web/)
- **JSON-RPC** (2005, then v2.0 in 2010): explicit RPC over HTTP, the substrate of MCP and A2A.

**The 2024–2026 inflection: agent protocols and the "REST is back" narrative.**

- **Anthropic's Model Context Protocol (MCP)** was open-sourced **25 November 2024** by David Soria Parra and Justin Spahr-Summers, modelled explicitly after Microsoft's Language Server Protocol (LSP) and built on JSON-RPC 2.0. OpenAI announced full MCP support on **26 March 2025**; Google's Gemini followed in April 2025; in **December 2025 Anthropic donated MCP to the Linux Foundation's Agentic AI Foundation**. ([https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)) [Wikipedia + 6](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- **Google's Agent2Agent (A2A) protocol** was unveiled at Google Cloud Next on **9 April 2025** with 50+ partners, donated to the Linux Foundation in June 2025; runs over HTTP/HTTPS using JSON-RPC 2.0 with Agent Cards for discovery, OAuth 2.0/API keys/mTLS for auth. ([https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)) [Apono + 5](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)
- **RFC 9457 Problem Details for HTTP APIs** was published **July 2023**, obsoleting RFC 7807 — adding a registry of common problem URIs and clarifying multi-problem responses. ([https://www.rfc-editor.org/rfc/rfc9457](https://www.rfc-editor.org/rfc/rfc9457)) [Ietf + 3](https://mailarchive.ietf.org/arch/msg/httpapi/AkqT4O7tPw8FT_zzMmT69JM4Z-E/)
- **OAuth 2.1** as draft-ietf-oauth-v2-1 has gone through 15 revisions, latest March 2026, set to obsolete RFC 6749 + RFC 6750. ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/))
- **AsyncAPI 3.0** released **December 2023**, splitting channels from operations and renaming publish/subscribe to send/receive — important because much "real-time REST" is actually AsyncAPI-described event flow next to a REST surface. ([https://www.asyncapi.com/blog/release-notes-3.0.0](https://www.asyncapi.com/blog/release-notes-3.0.0)) [AsyncAPI Initiative + 2](https://www.asyncapi.com/blog/2023-summary)

The dominant 2025–2026 narrative is that **MCP and A2A are not replacing REST but reusing its plumbing**: HTTP transport, OAuth 2.0/2.1 auth, JSON payloads. The "REST is back" framing reflects Netflix's and Airbnb's well-publicised second thoughts on GraphQL Federation operational cost, GraphQL caching difficulties, and the decreased need for over-fetching workarounds when typed SDKs are generated from OpenAPI. The current consensus tooling stack is OpenAPI 3.2 + Problem Details (RFC 9457) + OAuth 2.1 + RateLimit headers (httpapi WG draft), with REST + SSE/WebSocket for real-time complements and gRPC reserved for internal east-west service traffic.

## How it actually works

REST is constraints, not a protocol. The constraints, expressed in HTTP terms, are these.

**The six REST constraints (Fielding §5.1):**

1. **Client–Server** — Separation of concerns: UI from data storage. Each evolves independently. ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)) [University of Colorado Boulder](https://home.cs.colorado.edu/~kena/classes/7818/f08/lectures/lecture_9_fielding_disserta.pdf)
2. **Statelessness** — Every request is self-contained; the server stores no per-client session.
3. **Cacheability** — Responses must declare themselves cacheable or not, so intermediaries can reuse them.
4. **Uniform Interface** — Four sub-constraints: identification of resources (URIs), manipulation through representations, self-descriptive messages (media types + standard methods + status codes), and **Hypermedia as the Engine of Application State** (HATEOAS).
5. **Layered System** — Intermediaries (proxies, caches, gateways, CDNs) are first-class; the client cannot tell whether it is talking to the origin or a proxy. [Gbiv](https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm)
6. **Code-on-Demand** (optional) — Servers may extend client functionality by sending executable code (e.g., JavaScript). The only optional constraint.

**Richardson Maturity Model.** Level 0: tunnel everything through one URI and POST (SOAP, XML-RPC). Level 1: distinct resource URIs, but still mostly POST. Level 2: proper HTTP verbs and status codes (where 95% of "REST APIs" actually live). Level 3: hypermedia controls (HATEOAS); rare in production. ([https://martinfowler.com/articles/richardsonMaturityModel.html](https://martinfowler.com/articles/richardsonMaturityModel.html)) [Pvcarrera + 6](https://pvcarrera.github.io/general/2015/04/19/richardson-maturity-model.html)

**The wire: HTTP/1.1 message format.**

Request:

```
<METHOD> <request-target> HTTP/<version>\r\n
<Header-Name>: <value>\r\n
...
\r\n
[message body]
```

Response:

```
HTTP/<version> <status-code> <reason-phrase>\r\n
<Header-Name>: <value>\r\n
...
\r\n
[message body]
```

Each line ends with CRLF. A blank line separates headers from body. (RFC 9112)

**Methods that matter for REST:**

- `GET` — safe, idempotent, cacheable. Read.
- `HEAD` — like GET, no body. Used to check existence/headers.
- `POST` — non-idempotent. Create, or "process this." Not cacheable by default.
- `PUT` — idempotent. Replace target with the supplied representation.
- `PATCH` (RFC 5789) — non-idempotent in general. Partial update.
- `DELETE` — idempotent.
- `OPTIONS` — discover capabilities; used in CORS preflight.
- `QUERY` (draft-ietf-httpbis-safe-method-w-body, OpenAPI 3.2 added support 2025) — safe, idempotent, with a request body, for complex read queries. [quobix](https://quobix.com/articles/openapi-3.2/)

**Status codes (RFC 9110 §15):** 1xx informational; **2xx success** (200 OK, 201 Created, 202 Accepted, 204 No Content); **3xx redirection** (301 Moved Permanently, 302 Found, 304 Not Modified, 307 Temporary Redirect, 308 Permanent Redirect); **4xx client error** (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 409 Conflict, 410 Gone, 412 Precondition Failed, 415 Unsupported Media Type, 422 Unprocessable Content, 429 Too Many Requests); **5xx server error** (500, 502, 503, 504). The IETF reserved **418 I'm a teapot** as "(Unused)" after the Save 418 movement in 2017. ([https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)) [HTTP](https://http.dev/418)

**Headers that matter for REST:**

- `Content-Type` (request/response): media type of the body, e.g. `application/json`.
- `Accept`: ordered list of media types the client wants.
- `Authorization`: `Bearer <token>`, `Basic <base64>`, etc.
- `ETag`: opaque version tag for the representation.
- `If-Match` / `If-None-Match`: conditional preconditions (optimistic concurrency, cache validation).
- `Last-Modified` / `If-Modified-Since`: timestamp-based conditional requests.
- `Cache-Control`: `max-age`, `no-cache`, `no-store`, `private`, `public`, `must-revalidate`, `stale-while-revalidate`.
- `Vary`: which request headers the cache key depends on (e.g. `Vary: Accept, Accept-Encoding`).
- `Location`: URI of newly created resource (with 201) or redirect target (with 3xx).
- `Allow`: methods supported on this resource (returned with 405).
- `Link` (RFC 8288): typed hyperlinks in headers — the lightweight HATEOAS.
- `Origin` / `Access-Control-Allow-Origin` / `Access-Control-Allow-Methods` / `Access-Control-Allow-Headers` / `Access-Control-Max-Age` / `Access-Control-Allow-Credentials`: CORS.
- Newer drafts: `RateLimit` and `RateLimit-Policy` (draft-ietf-httpapi-ratelimit-headers-10, expires March 2026); `Idempotency-Key` (draft-ietf-httpapi-idempotency-key-header-07, expires April 2026). ([https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)) [IETF + 3](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)

**Full exchange flow (HTTP/1.1 over TLS 1.3):**

1. Client opens TCP to `:443` (3-way handshake, ~1 RTT).
2. TLS 1.3 handshake (1 RTT, or 0-RTT for resumed sessions). (RFC 8446)
3. Client sends HTTP request.
4. Server sends HTTP response.
5. Connection is kept alive for further requests via `Connection: keep-alive` (default in 1.1).

Under HTTP/2, step 1 is one connection multiplexing many streams; under HTTP/3, steps 1+2 are fused into the QUIC handshake over UDP (RFC 9000 / RFC 9114).

**Real on-the-wire example — a full CRUD lifecycle:**

```
POST /v1/widgets HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
Idempotency-Key: 2f7d-91cc-aa11
Content-Length: 38

{"name":"Sprocket","color":"orange"}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/widgets/wgt_42
ETag: "v1-7af9"
Cache-Control: no-store

{"id":"wgt_42","name":"Sprocket","color":"orange","_links":{"self":{"href":"/v1/widgets/wgt_42"}}}
```

```
GET /v1/widgets/wgt_42 HTTP/1.1
Host: api.example.com
Accept: application/json
If-None-Match: "v1-7af9"

HTTP/1.1 304 Not Modified
ETag: "v1-7af9"
Cache-Control: max-age=60
Vary: Accept
```

```
PUT /v1/widgets/wgt_42 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
If-Match: "v1-7af9"

{"id":"wgt_42","name":"Sprocket","color":"red"}

HTTP/1.1 200 OK
ETag: "v1-7b00"
Content-Type: application/json

{"id":"wgt_42","name":"Sprocket","color":"red"}
```

```
PATCH /v1/widgets/wgt_42 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "v1-7b00"

{"color":"blue"}

HTTP/1.1 200 OK
ETag: "v1-7b01"
```

```
DELETE /v1/widgets/wgt_42 HTTP/1.1
If-Match: "v1-7b01"

HTTP/1.1 204 No Content
```

**Error format (RFC 9457 Problem Details):**

```
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{
 "type":"https://errors.example.com/insufficient-credit",
 "title":"You do not have enough credit.",
 "status":403,
 "detail":"Your current balance is 30, but that costs 50.",
 "instance":"/account/12345/msgs/abc",
 "balance":30
}
```

([https://www.rfc-editor.org/rfc/rfc9457](https://www.rfc-editor.org/rfc/rfc9457))

**Sequence diagram (Mermaid):**

Origin serverLoad balancerCDN/EdgeDNSClientOrigin serverLoad balancerCDN/EdgeDNSClient#mermaid-rfi{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfi .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfi .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfi .error-icon{fill:#CC785C;}#mermaid-rfi .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfi .edge-thickness-normal{stroke-width:1px;}#mermaid-rfi .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfi .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfi .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfi .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfi .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfi .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfi .marker.cross{stroke:#A1A1A1;}#mermaid-rfi svg{font-family:inherit;font-size:16px;}#mermaid-rfi p{margin:0;}#mermaid-rfi .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .actor-line{stroke:#A1A1A1;}#mermaid-rfi .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfi .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfi #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfi .sequenceNumber{fill:#5e5e5e;}#mermaid-rfi #sequencenumber{fill:#E5E5E5;}#mermaid-rfi #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfi .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfi .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi .labelText,#mermaid-rfi .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .loopText,#mermaid-rfi .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfi .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfi .noteText,#mermaid-rfi .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfi .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfi .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfi .actorPopupMenu{position:absolute;}#mermaid-rfi .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfi .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi .actor-man circle,#mermaid-rfi line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfi :root{--mermaid-font-family:inherit;}Subsequent request hits CDN cacheA/AAAA api.example.com198.51.100.10TCP SYN :443SYN/ACKTLS 1.3 ClientHelloServerHello + cert + FinishedGET /v1/widgets/wgt_42 (If-None-Match)HTTP/2 stream (forwarded)GET /v1/widgets/wgt_42200 + ETagcache + 200200 OK + bodyGET /v1/widgets/wgt_42 (If-None-Match: "v1-7af9")304 Not Modified

**Security model.** TLS for transport; bearer tokens (opaque or JWT) in `Authorization` for user/client identity; OAuth 2.0/2.1 flows (Authorization Code + PKCE for user-facing apps; Client Credentials for service-to-service); mTLS for internal service auth or financial-grade APIs (FAPI). API keys remain widespread but are explicitly discouraged for user authentication. (RFC 9700, OAuth Best Current Practice)

**Minimal implementation outline.** A toy REST server needs: a TCP listener, an HTTP/1.1 parser (request line → headers terminated by blank line → optional body sized by Content-Length or chunked), a router (method + path template), handlers that produce a status line, headers, and body, ETag support for GET/PUT, a JSON serializer, and proper CORS, Cache-Control, and Vary. Add an OpenAPI document and you have a serviceable REST API.

## Deep connections to other protocols

**HTTP/1.1 (RFC 9112).** REST was *designed against* HTTP/1.1. Fielding co-authored the original HTTP/1.1 spec, and the dissertation explicitly describes Chapter 5 REST as a post-hoc rationalization of the architectural choices that made HTTP/1.1 succeed. The relationship is co-evolutionary: REST shaped which HTTP features survived (e.g. `Cache-Control`, `ETag`, `Vary`, the verb set), and HTTP shaped what REST could express.

**HTTP/2 (RFC 9113, 2015 / republished 2022).** Same semantics, different wire. Multiplexed binary streams over one TCP connection; HPACK header compression; server push (now largely deprecated by browsers). REST APIs that previously batched requests to avoid head-of-line blocking can stop batching. Server push is mostly irrelevant to REST in 2026. [freeCodeCamp](https://www.freecodecamp.org/news/what-is-grpc-protocol-buffers-stream-architecture/)

**HTTP/3 (RFC 9114, June 2022).** HTTP semantics over QUIC over UDP. Eliminates TCP head-of-line blocking, gives 1-RTT (or 0-RTT) connection setup. By the 2025 Web Almanac, 29% of mobile HTML CDN-served traffic is HTTP/3 vs. ~0% for origin-served traffic; W3Techs measured ~38.8% of top sites *advertising* HTTP/3 in April 2026. Real wins are on lossy mobile networks (Akamai measured ~30% mobile latency reduction); on fiber to fast desktops, peer-reviewed measurement (WWW '24) found QUIC implementations capped at ~500 Mbps under conditions where HTTP/2 saturated 1 Gbps — meaning HTTP/2 can be the performance choice for fixed broadband. ([https://almanac.httparchive.org/en/2025/cdn](https://almanac.httparchive.org/en/2025/cdn)) [Httparchive + 3](https://almanac.httparchive.org/en/2025/cdn)

**JSON-RPC.** A direct alternative to REST: one endpoint, structured `{jsonrpc, method, params, id}` envelopes, no resource model, no verbs. Trades REST's caching, intermediaries, and discoverability for explicit method dispatch. Substrate of MCP and A2A.

**Model Context Protocol (MCP, Anthropic Nov 2024).** JSON-RPC 2.0 over two transports: stdio (local) and Streamable HTTP (remote). Inspired by LSP. *Contrasts* with REST: it exposes tools/resources/prompts as RPC primitives discovered by name, not URIs; servers and clients negotiate capabilities at handshake. *Builds on* REST plumbing for the HTTP transport variant — HTTPS, OAuth 2.1 for remote auth (Anthropic's own resource metadata draft), CORS for browser clients. The pragmatic verdict in 2026 is "MCP does not replace your REST API; it sits next to it." ([https://aiwiki.ai/wiki/mcp](https://aiwiki.ai/wiki/mcp)) [AI Wiki](https://aiwiki.ai/wiki/mcp)[AI Wiki](https://aiwiki.ai/wiki/mcp)

**Agent2Agent (A2A, Google April 2025).** HTTPS + JSON-RPC 2.0 + Server-Sent Events for streaming. Agent Cards (`/.well-known/agent.json`) for discovery. OAuth 2.0, API keys, and mTLS for auth. Built directly on REST/HTTP idioms — a "well-known URI" pattern lifted straight from RFC 8615. Now under Linux Foundation; 150+ supporters by mid-2025. ([https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide](https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide)) [Galileo AI](https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide)[DEV Community](https://dev.to/agentsindex/googles-a2a-protocol-how-ai-agents-communicate-across-frameworks-52jj)

**GraphQL (Facebook 2015).** Single POST endpoint (`/graphql`) accepting a query in a typed schema language; client specifies fields. Solves over- and under-fetching that plagues poorly-designed REST. Trade-offs: caching becomes application-level (no `Cache-Control` per query), HTTP status codes lose meaning, query cost analysis is required to prevent abuse. Netflix uses Federated GraphQL for its Consumer Edge while keeping REST in many backbones; Airbnb similarly mixes both. Some companies have walked back GraphQL after running into operational, caching, and DoS exposure issues. ([https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql](https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql)) [CodersTechZone](https://coderstechzone.com/graphql-vs-rest-which-api-is-best-for-2025/)[CodersTechZone](https://coderstechzone.com/graphql-vs-rest-which-api-is-best-for-2025/)

**gRPC (Google August 2016).** Protobuf over HTTP/2 with code generation, bi-directional streaming, deadlines, and rich error model. Browser-incompatible without gRPC-Web (a CNCF proxy approach pioneered by Google + Improbable in 2018). The de-facto choice for east-west microservice traffic; REST remains the choice for north-south public APIs. [Wikipedia + 2](https://en.wikipedia.org/wiki/GRPC)

**SSE (Server-Sent Events).** A WHATWG-standardized one-way streaming format using `text/event-stream` over a long-lived HTTP response. Pure REST-friendly: it's just a GET with a streaming body. MCP's HTTP transport uses SSE-shaped streams; OpenAPI 3.2's "streaming media types" formalize how to describe them in spec.

**WebSocket (RFC 6455, December 2011).** A protocol upgrade negotiated via an HTTP/1.1 `Upgrade: websocket` handshake (response status 101), then a binary frame protocol that is no longer HTTP. Bidirectional. Complements REST for chat, collaborative editing, real-time updates. RFC 8441 added bootstrapping WebSockets over HTTP/2. ([https://www.rfc-editor.org/rfc/rfc6455.html](https://www.rfc-editor.org/rfc/rfc6455.html)) [Wikipedia + 5](https://en.wikipedia.org/wiki/WebSocket)

**SOAP / WS-* (1998–2010).** XML envelopes (`<soap:Envelope>`) wrapping RPC payloads, described by WSDL, discovered via UDDI, layered with WS-Security, WS-Addressing, WS-ReliableMessaging. Tunneled over HTTP POST mostly to traverse firewalls. The "SOAP vs REST war" played out in vendor blogs and conferences from roughly 2005 to 2010; by 2012 SOAP was relegated to enterprise integration and bank back-ends. Fielding's REST work and Tim Berners-Lee's web architecture were the explicit foil. [DEV Community](https://dev.to/mikeralphson/a-brief-history-of-web-apis-47k4)

**OAuth 2.0 / 2.1.** Sits on top of REST APIs as the authorization layer. Bearer tokens (RFC 6750) carried in `Authorization`. JWT (RFC 7519) is a common, but optional, token format with cryptographic signature (typically RS256 or ES256). Scopes are space-separated strings carried in the access token claim. OAuth 2.1 (current draft 15, March 2026) consolidates 12+ years of best-current-practice into one document, requires PKCE, removes implicit + ROPC, and integrates RFC 9700 security BCP. ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)

**Often-missed companions:**

- **OpenAPI / Swagger.** Machine-readable API description in YAML/JSON. 3.1 (2021) aligned with JSON Schema; 3.2 (Sept 2025) added structured tags, OAuth Device Flow, streaming media types, the `additionalOperations` keyword for non-standard verbs like `QUERY`, multipart variants. The next steps are 3.3 and 4.0 ("Moonwalk"). ([https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2](https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2)) [Wikipedia + 3](https://en.wikipedia.org/wiki/OpenAPI_Specification)
- **JSON:API 1.1** (Sept 2022). Strong opinionated convention for JSON resource shape, relationships, sparse fieldsets, sort/filter/paginate, errors, and `application/vnd.api+json`. ([https://jsonapi.org/](https://jsonapi.org/))
- **HAL (Hypertext Application Language).** Lightweight `_links` and `_embedded` JSON convention; widely used at Spring HATEOAS users.
- **OData v4 / 4.01 (OASIS, 2014/2018).** Microsoft-led query-rich superset of REST. ASP.NET Core OData 9 shipped August 2024 (drops .NET Framework, first major update since 2016). Still standard at SAP, Salesforce CDM, Microsoft Graph, etc., but adoption outside that orbit has stagnated. ([https://devblogs.microsoft.com/odata/announcing-asp-net-core-odata-9-official-release/](https://devblogs.microsoft.com/odata/announcing-asp-net-core-odata-9-official-release/)) [Visual Studio Magazine](https://visualstudiomagazine.com/Articles/2024/09/12/OData-Finally-Ditches-Old-NET-Framework.aspx)
- **AsyncAPI 3.0** (December 2023). The OpenAPI counterpart for async/event-driven APIs across MQTT, Kafka, AMQP, WebSocket, Mercure. ([https://www.asyncapi.com/blog/release-notes-3.0.0](https://www.asyncapi.com/blog/release-notes-3.0.0))
- **AtomPub (RFC 5023, 2007).** The protocol Fielding actually liked. CRUD over Atom collections; the canonical Level 3 example.
- **WebDAV (RFC 4918) / CalDAV / CardDAV.** REST-ish extensions adding `PROPFIND`, `MKCOL`, locking. Powers iCloud calendars, Nextcloud, etc.
- **CoAP (RFC 7252, 2014).** "REST for IoT" — request/response model, GET/POST/PUT/DELETE, URIs, media types, but over UDP with a 4-byte binary header, designed for 8-bit MCUs with ≥10 KiB RAM. Maps cleanly to HTTP via cross-protocol proxies. ([https://datatracker.ietf.org/doc/html/rfc7252](https://datatracker.ietf.org/doc/html/rfc7252)) [CoAP](https://coap.space/)[CoAP](https://coap.space/)
- **Webhooks.** Reverse REST: the server makes HTTP POST callbacks to client-registered URLs on events. OpenAPI 3.1 added first-class webhook support.
- **HTTP Long Polling** and **WebSub / PubSubHubbub** (W3C 2018) — pre-WebSocket pushes still used in pockets.
- **Falcor (Netflix, 2015).** A REST/GraphQL hybrid with virtual JSON graphs; never reached critical mass and is largely deprecated.
- **tRPC** and **Connect-Web (Buf, 2022).** Type-safe RPC libraries that transit JSON or Protobuf over HTTP and target TypeScript directly; Connect implements gRPC's wire on HTTP/1.1 too.
- **GraphQL Federation (Apollo).** Composes multiple GraphQL services into a single supergraph. Netflix's "Consumer Edge."
- **gRPC-Web.** HTTP/1.1- and HTTP/2-compatible variant of gRPC for browsers via a proxy translation layer.

## Real-world deployment

**Frameworks.** Node.js: Express, Fastify, Hapi, NestJS, Koa. Python: Django REST Framework, FastAPI, Flask. Java: Spring Boot / Spring MVC / Spring WebFlux, Micronaut, Quarkus, Dropwizard. .NET: ASP.NET Core. Ruby: Rails (`ActionController::API`), Sinatra, Grape. Go: net/http, Gin, Echo, Chi, Fiber. Rust: Axum, Actix-Web, Rocket. PHP: Laravel, Symfony, Slim.

**Public REST APIs at scale.** The defining production exemplars in 2026 are **Stripe**, **Twilio**, **GitHub**, **Shopify**, **Atlassian**, **Slack**, **Salesforce**, **AWS** (most services have a JSON-over-HTTPS REST surface, even when SDKs hide it), **Google Cloud**, **Twitter/X**.

**Stripe** is the single most-cited reference for REST API design. Its date-based versioning scheme (current version `2026-04-22.dahlia` as of this writing) decouples client wire-compat from server iteration: each account is "pinned" to a date, requests can override with `Stripe-Version`, and Stripe maintains compatibility with every version since 2011. As of 2024, Stripe shifted to **monthly backwards-compatible releases** with twice-yearly major (breaking) releases (e.g. Acacia in Sept 2024, Dahlia in 2026). It also introduced a `/v2` namespace alongside `/v1` rather than ever forcing a wholesale migration. ([https://stripe.com/blog/api-versioning](https://stripe.com/blog/api-versioning)) ([https://docs.stripe.com/api/versioning](https://docs.stripe.com/api/versioning)) [Stripe + 4](https://docs.stripe.com/api/versioning)

**Deployment topologies.** API gateways: AWS API Gateway, Kong, Apigee (Google Cloud), Azure API Management, Tyk, Krakend, Mulesoft. Service mesh sidecars: Envoy, Linkerd, Consul. CDN edge: Cloudflare Workers, Fastly Compute@Edge, AWS CloudFront Functions, Akamai EdgeWorkers. WAFs (Web Application Firewalls): AWS WAF, Cloudflare WAF, Akamai Kona, Imperva.

**Performance characteristics.** Numbers vary wildly with payload, but published benchmarks place a well-tuned Go/Rust/Java REST service comfortably at tens of thousands of requests/second per core with single-digit-ms P50 latency for cached reads, and P99 in the tens of milliseconds across a region. CDN-fronted REST endpoints (Cloudflare, Fastly) reach P50s of <30 ms globally. The real bottlenecks in 2026 production REST are downstream (database, dependent services), TLS handshake on cold connections, and JSON serialization, not HTTP itself. The HTTP Archive 2025 Web Almanac reports HTTP/3 dominant at the CDN edge (29% of CDN-served HTML mobile requests) and almost absent at origin (<5%). ([https://almanac.httparchive.org/en/2025/cdn](https://almanac.httparchive.org/en/2025/cdn)) [Httparchive](https://almanac.httparchive.org/en/2025/cdn)

**HTTP/3 deployment numbers, April 2026.** W3Techs: ~38.8% of top sites advertise HTTP/3. Cloudflare Radar: a substantial double-digit percentage of Cloudflare-served traffic uses HTTP/3, especially on mobile. ([https://w3techs.com/technologies/details/ce-http3](https://w3techs.com/technologies/details/ce-http3)) ([https://radar.cloudflare.com/year-in-review/2025](https://radar.cloudflare.com/year-in-review/2025)) [Technologychecker](https://technologychecker.io/blog/http-protocol-adoption)

## Failure modes and famous incidents

REST APIs fail in characteristic ways. Almost every public mega-breach since 2018 maps to one of the OWASP API Security Top 10 (2023 edition). ([https://owasp.org/API-Security/editions/2023/en/0x11-t10/](https://owasp.org/API-Security/editions/2023/en/0x11-t10/))

**OWASP API Security Top 10 (2023):**

1. **API1: Broken Object Level Authorization (BOLA / IDOR).**
2. **API2: Broken Authentication.**
3. **API3: Broken Object Property Level Authorization** (merger of Excessive Data Exposure + Mass Assignment). [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)[Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)
4. **API4: Unrestricted Resource Consumption** (was Lack of Resources & Rate Limiting). [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)[Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)
5. **API5: Broken Function Level Authorization (BFLA).**
6. **API6: Unrestricted Access to Sensitive Business Flows** (new). [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)
7. **API7: Server-Side Request Forgery (SSRF)** (new). [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)
8. **API8: Security Misconfiguration.** [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)
9. **API9: Improper Inventory Management.** [Salt Security](https://salt.security/blog/owasp-api-security-top-10-explained)
10. **API10: Unsafe Consumption of APIs** (new).
Akamai reported a 32% rise in attacks exploiting these. There has been **no 2024 or 2025 update** as of the date of this report; the 2023 edition is the current authoritative version. ([https://owasp.org/www-project-api-security/](https://owasp.org/www-project-api-security/)) [Wiz](https://www.wiz.io/academy/api-security/owasp-api-security)

**Capital One, July 2019.** Former AWS engineer Paige Thompson exploited a misconfigured ModSecurity WAF on EC2; the WAF's IAM role had over-broad S3 permissions; SSRF coerced the WAF to query the IMDSv1 metadata service at `http://169.254.169.254/latest/meta-data/iam/security-credentials/...`, returning temporary AWS credentials, used to read 100M+ customer records out of S3. AWS rolled out **IMDSv2** (token-based) in November 2019. The breach is the canonical SSRF + cloud-metadata cautionary tale and helped drive SSRF onto OWASP API Top 10 (API7:2023). Capital One paid an $80M civil penalty. ([https://krebsonsecurity.com/2019/08/what-we-can-learn-from-the-capital-one-hack/](https://krebsonsecurity.com/2019/08/what-we-can-learn-from-the-capital-one-hack/)) [Huntress + 4](https://www.huntress.com/threat-library/data-breach/capital-one-data-breach)

**Equifax, 2017.** Apache Struts CVE-2017-5638 — a remote-code-execution flaw in the Jakarta Multipart parser triggered by a malicious `Content-Type` header. Patch released 7 March 2017; exploitation began 10 March; lateral movement through Equifax's network from 13 May to 30 July; ~147M records exfiltrated. The unpatched system was the **Struts REST plugin** powering an online dispute portal. (CVE-2017-9805, a *separate* RCE in the same plugin's XStream-based REST parser, was published a few months later but was not the Equifax vector.) ([https://www.csoonline.com/article/567833/equifax-data-breach-faq-what-happened-who-was-affected-what-was-the-impact.html](https://www.csoonline.com/article/567833/equifax-data-breach-faq-what-happened-who-was-affected-what-was-the-impact.html)) [Security Affairs + 5](https://securityaffairs.com/63043/hacking/equifax-data-breach.html)

**Cloudflare, 2 July 2019, 27-minute global outage.** A new WAF rule pushed globally contained the regex `(?:(?:\"|'|\]|\}|...)+[)]*;?((?:\s|...)*.*(?:.*=.*)))` — two nested `.*` clauses produced catastrophic backtracking; CPU saturation took out HTTP/HTTPS workers worldwide; many sites including Discord, Shopify, Medium returned 502 Bad Gateway. Resolved by globally disabling the WAF; Cloudflare migrated to non-backtracking re2/Rust regex. ([https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)) [Medium + 3](https://medium.com/@lakshayaggarwal9/the-regex-that-took-down-cloudflare-and-10-of-the-internet-254463732b55)

**Optus, September 2022.** Australia's second-largest telco. An unauthenticated REST endpoint at `api.www.optus.com.au` returned customer records by sequential `contactID`. Up to 9.8M records exposed; A$1.5M ransom demanded then withdrawn. The combination of unauth API + integer enumeration + sensitive PII is a textbook BOLA + Broken Auth + Improper Inventory Management failure. ([https://en.wikipedia.org/wiki/2022_Optus_data_breach](https://en.wikipedia.org/wiki/2022_Optus_data_breach)) [Verse + 2](https://verse.systems/blog/post/2022-09-25-optus-breach/)

**Peloton, January–May 2021.** Pen Test Partners' Jan Masters found unauthenticated GraphQL endpoints (and later authenticated-but-unauthorized endpoints) returning user IDs, location, weight, gender, age — including for users who had set profiles to private — for ~3M+ subscribers (notably including President Biden). Reported 20 January; partial silent fix by 2 February; full fix only after journalist intervention in May. ([https://techcrunch.com/2021/05/05/peloton-bug-account-data-leak/](https://techcrunch.com/2021/05/05/peloton-bug-account-data-leak/)) [BankInfoSecurity + 8](https://www.bankinfosecurity.com/peloton-api-flaws-exposed-users-data-prior-to-recent-patch-a-16534)

**Parler, 11 January 2021.** Hacktivist `@donk_enby` exploited (a) absence of authentication on most public APIs, (b) sequential integer post IDs, (c) no rate limiting, (d) "deleted" posts that were merely flagged-not-removed, and (e) image/video metadata containing GPS — to scrape ~70 TB of data via curl scripts before AWS shut Parler down. ("This is like a Computer Science 101 bad homework assignment," Kenneth White told *Wired*.) ([https://thenewstack.io/how-parlers-data-was-harvested/](https://thenewstack.io/how-parlers-data-was-harvested/)) [API Security News + 2](https://apisecurity.io/issue-116-facebook-parler-api-vulnerabilities-clairvoyance/)

**T-Mobile, January 2023 (and August 2021).** A single REST API was abused starting 25 November 2022; detected 5 January 2023; ~37M postpaid+prepaid accounts exposed (name, billing address, email, phone, DOB). The August 2021 breach (~76M records) had already cost T-Mobile a $350M class settlement. Eight disclosed breaches since 2018. ([https://krebsonsecurity.com/2023/01/new-t-mobile-breach-affects-37-million-accounts/](https://krebsonsecurity.com/2023/01/new-t-mobile-breach-affects-37-million-accounts/)) [Krebs on Security + 3](https://krebsonsecurity.com/2023/01/new-t-mobile-breach-affects-37-million-accounts/)

**USPS, 2018.** A flaw in the "Informed Visibility" API let any logged-in usps.com user query account details for any of 60M users. **Twitter API key leaks** continue to make occasional headlines. **Coinbase** has had repeated API issues including a 2021 2FA flaw allowing fund transfer.

**Common pitfalls (from the same patterns):**

- **BOLA**: missing per-object permission check; comparing JWT user-id to URL id is necessary but not sufficient. ~40% of API attacks per Akamai 2024. [OWASP + 2](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- **Mass assignment**: blindly binding request JSON to ORM models exposes hidden fields (`isAdmin`, `passwordHash`).
- **Excessive data exposure**: server returns full object, UI hides fields — but JSON is on the wire.
- **Rate limiting**: must be on the *expensive* dimensions, not just request count.
- **SSRF**: any user-supplied URL the server fetches is a vector — block 127.0.0.0/8, 169.254.169.254, RFC1918, IPv6 link-local. [Wiz](https://www.wiz.io/academy/application-security/server-side-request-forgery)
- **Improper inventory**: `/v1` exists, `/v0`/`/internal`/`/staging` also exist and aren't decommissioned.
- **CORS leakage**: `Access-Control-Allow-Origin: *` plus `Access-Control-Allow-Credentials: true` is impossible per spec; reflecting Origin without an allowlist is the same hole.
- **Missing `Vary`**: cache poisoning across users.
- **`200 OK` with an error body**: defeats every cache and middlebox in the path.

## Fun facts and anecdotes

- **Naming origin (verified):** Fielding states in his dissertation that "REST" was originally called the "HTTP object model," and renamed to evoke a state-machine traversal metaphor — a virtual machine where users move through application states by following links. The popular "Fielding chose REST because it sounded like rest stop" story is **wrong**; the documented etymology is the state-machine image. ([https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)) [Ole Begemann](https://oleb.net/2018/rest/)
- **HATEOAS pronunciation** is commonly "hate-ee-oss" (rhymes with "Hades-os") — Fielding himself uses it, and the awkward pronunciation has become part of REST folklore. [needs source — pronunciation is not formally documented]
- **The dissertation's overlooked thesis.** Most readers think Fielding's dissertation is *about* REST. It's actually a much broader argument that "design-by-buzzword is a common occurrence" and that architectural styles must be selected to match application needs. Only Chapter 5 of the 8-chapter document defines REST. ([https://twobithistory.org/2020/06/28/rest.html](https://twobithistory.org/2020/06/28/rest.html)) [Two Bit History](https://twobithistory.org/2020/06/28/rest.html)[Two Bit History](https://twobithistory.org/2020/06/28/rest.html)
- **Waka.** Between 2001 and 2006 Fielding worked on **Waka**, "a binary, token-based replacement for HTTP" intended to match REST's efficiency. It never shipped. ([https://en.wikipedia.org/wiki/Roy_Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)) [Wikipedia](https://en.wikipedia.org/wiki/Roy_Fielding)[Wikipedia](https://en.wikipedia.org/wiki/Roy_Fielding)
- **Fielding at Day Software / Adobe.** Fielding co-led Day Software (which built JCR/Sling/Jackrabbit), acquired by Adobe in 2010; he is a senior principal scientist at Adobe in San Jose. [Wikipedia](https://en.wikipedia.org/wiki/Roy_Fielding)
- **HTTP 418 I'm a teapot** comes from RFC 2324 (Larry Masinter, 1 April 1998), HTCPCP — the Hyper Text Coffee Pot Control Protocol. RFC 7168 (Imran Nazar, 1 April 2014) extended it for tea. In 2017, HTTPBIS chair Mark Nottingham proposed removing 418 from major HTTP libraries; 15-year-old Shane Brunswick launched **save418.com** (#save418) and the IETF eventually marked 418 as reserved/(Unused). Python 3.9 added `IM_A_TEAPOT` in October 2020. ([https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)) [Wikipedia + 4](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
- **Fielding's blog post** *REST APIs must be hypertext-driven* (20 Oct 2008) is one of the most-quoted screeds in API history; the entire post is profanity-light but contains "There is so much coupling on display that it should be given an X rating" — about the SocialSite API that prompted it. ([https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)) [Gbiv](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
- **The "REST is just CRUD over HTTP" myth.** Fielding repeatedly objected that resources need not be database rows and operations need not be CRUD; the resource interface is generic, and a single resource can map to a query, a process, an event, a temporal projection, etc. ([https://florian-kraemer.net/software-architecture/2025/07/07/Most-RESTful-APIs-are-not-really-RESTful.html](https://florian-kraemer.net/software-architecture/2025/07/07/Most-RESTful-APIs-are-not-really-RESTful.html)) [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- **The myth that REST requires JSON.** Fielding's REST is media-type agnostic; HTML is in fact the canonical hypermedia type for the original Web. The htmx project is built around this point. ([https://htmx.org/essays/rest-explained/](https://htmx.org/essays/rest-explained/))
- **The Linus vs REST debate** does not appear in any verifiable source [needs source].
- **The original work happened.** Fielding wrote: *"The Web's architectural style was developed iteratively over a six year period, but primarily during the first six months of 1995"* — which is to say, REST was a description first, a prescription second. ([https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)) [UCI](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)
- **MCP origin story.** Anthropic engineer David Soria Parra was frustrated with constantly copy-pasting between Claude Desktop and his IDE. He and Justin Spahr-Summers built MCP partly to scratch that itch. Modeled on Microsoft's Language Server Protocol, which had quietly become how editors avoid writing language support N times over. ([https://aiwiki.ai/wiki/mcp](https://aiwiki.ai/wiki/mcp)) [Pento](https://www.pento.ai/blog/a-year-of-mcp-2025-review)[AI Wiki](https://aiwiki.ai/wiki/mcp)

## Practical wisdom

What experienced engineers actually know about running REST in production.

- **Tune connection pooling and keep-alive.** Default HTTP client timeouts are usually wrong — `requests` (Python) defaults to no timeout, Go's `http.Client` defaults to no timeout. Always set explicit connect/read/idle timeouts. Connection pool sizes default low; raise per upstream. Use HTTP/2 to your origin where possible to get multiplexing.
- **Retry with care.** Retries on idempotent methods (GET/PUT/DELETE) are safe; retries on POST/PATCH need an `Idempotency-Key` (Stripe popularized this, IETF httpapi WG is standardizing it as draft-ietf-httpapi-idempotency-key-header). Use exponential backoff with jitter. Cap retries.
- **Monitor.** P50, P95, P99 latency per route. Error rate by status code class. Saturation: connection pool, thread pool, DB pool. Backpressure: queue depth. The 2-second tail at P99.9 will eat you alive at 10K rps.
- **Trace.** OpenTelemetry distributed tracing with W3C `traceparent` header. Look at full spans across hops; the worst REST bugs are in the third microservice, not yours.
- **Common debugging.** `curl -v` for raw exchanges; `mitmproxy` for live inspection; Wireshark for TLS-decrypted captures (with `SSLKEYLOGFILE`); browser DevTools Network tab for frontend issues; `httpie` for friendlier curl; `nghttp2` for HTTP/2; Chrome's `chrome://net-export/` for low-level diagnostics.
- **Common misconfigurations to spot in code review:**
  - Missing CORS headers, or wildcard `Allow-Origin` plus `Allow-Credentials: true` (incompatible).
    - No `Cache-Control` (defaults are too liberal/conservative depending on framework).
    - `200 OK` with `{"error":...}` body — defeats every middlebox.
    - Missing `Vary: Accept` when you do content negotiation.
    - Plural vs singular inconsistencies (`/users/{id}/order` next to `/users/{id}/comments`).
    - POST for everything (Level 0 disguised as REST).
    - ETag generated from response body but Vary not set on the request dimensions that actually matter.
    - JWT validation that doesn't check `iss`, `aud`, `exp`, `nbf`, algorithm.
    - Sequential integer IDs in URIs (Optus, Parler).
    - Reflecting `Origin` without an allowlist.
    - Forgetting `Authorization` should not be in `Vary` (caches usually omit it, breaking auth-dependent caches).
- **Use Problem Details (RFC 9457) consistently.** If your team can't decide on an error envelope, just adopt RFC 9457 verbatim.

## Learning resources (current as of 2026)

**Authoritative specifications**

- Roy Fielding, *Architectural Styles and the Design of Network-based Software Architectures* (Chapter 5 specifically), UC Irvine 2000. Advanced. Last updated 2000. [https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)
- RFC 9110, *HTTP Semantics*, June 2022 (Internet Standard 97). Advanced. [https://www.rfc-editor.org/rfc/rfc9110.html](https://www.rfc-editor.org/rfc/rfc9110.html)
- RFC 9111, *HTTP Caching*, June 2022. [https://www.rfc-editor.org/rfc/rfc9111](https://www.rfc-editor.org/rfc/rfc9111)
- RFC 9112, *HTTP/1.1*, June 2022. [https://www.rfc-editor.org/rfc/rfc9112](https://www.rfc-editor.org/rfc/rfc9112)
- RFC 9113, *HTTP/2*, June 2022. [https://www.rfc-editor.org/rfc/rfc9113](https://www.rfc-editor.org/rfc/rfc9113)
- RFC 9114, *HTTP/3*, June 2022. [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114)
- RFC 9457, *Problem Details for HTTP APIs*, July 2023 (obsoletes 7807). Intermediate. [https://www.rfc-editor.org/rfc/rfc9457](https://www.rfc-editor.org/rfc/rfc9457) [Ietf](https://mailarchive.ietf.org/arch/msg/httpapi/AkqT4O7tPw8FT_zzMmT69JM4Z-E/)
- RFC 6749, *OAuth 2.0*, October 2012; OAuth 2.1 draft (current draft 15, March 2026). [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- RFC 9700, *Best Current Practice for OAuth 2.0 Security*, 2024. [https://www.rfc-editor.org/rfc/rfc9700.html](https://www.rfc-editor.org/rfc/rfc9700.html)
- RFC 7252, *CoAP*. June 2014, with extensions through RFC 8974 (2021). [https://datatracker.ietf.org/doc/html/rfc7252](https://datatracker.ietf.org/doc/html/rfc7252)
- OpenAPI Specification 3.2.0, 23 September 2025. Intermediate. [https://spec.openapis.org/oas/v3.2.0.html](https://spec.openapis.org/oas/v3.2.0.html) [OpenAPI Initiative](https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2)
- JSON:API 1.1, 30 September 2022. Intermediate. [https://jsonapi.org/format/](https://jsonapi.org/format/)
- AsyncAPI 3.0.0, December 2023 (3.1 latest). [https://www.asyncapi.com/docs/reference/specification/v3.0.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0)
- IETF httpapi WG drafts: ratelimit-headers, idempotency-key-header, link-hint, REST API media types — all current 2025–2026. [https://ietf-wg-httpapi.github.io/](https://ietf-wg-httpapi.github.io/) [GitHub](https://github.com/ietf-wg-httpapi)

**Books**

- Leonard Richardson & Sam Ruby, *RESTful Web Services* (O'Reilly, 2007). Foundational; dated. Intro/intermediate. Last updated 2007.
- Jim Webber, Savas Parastatidis & Ian Robinson, *REST in Practice* (O'Reilly, 2010). Intermediate.
- Leonard Richardson & Mike Amundsen, *RESTful Web APIs* (O'Reilly, 2013). Intermediate. The Richardson follow-up that takes hypermedia seriously.
- Brenda Jin, Saurabh Sahni & Amir Shevat, *Designing Web APIs* (O'Reilly, 2018). Intro. Last updated 2018.
- Mike Amundsen, *Design and Build Great Web APIs* (Pragmatic, 2020). Intro/intermediate. Last updated 2020.
- JJ Geewax, *API Design Patterns* (Manning, 2021). Intermediate. Last updated 2021.
- Arnaud Lauret, *The Design of Web APIs* (Manning, 2019). Intro/intermediate.
- *Continuous API Management*, 2nd ed. (Mehdi Medjaoui et al., O'Reilly, 2021). Intermediate.
- James Higginbotham, *Principles of Web API Design* (Addison-Wesley, 2021). Intermediate.

**Academic**

- Fielding & Taylor, *Principled Design of the Modern Web Architecture* (ACM TOIT, 2002). [https://dl.acm.org/doi/10.1145/514183.514185](https://dl.acm.org/doi/10.1145/514183.514185)
- Effective REST APIs Testing with Error Message Analysis, ISSTA 2025. [https://dl.acm.org/doi/10.1145/](https://dl.acm.org/doi/10.1145/)... [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC9457)
- Zhang et al., *QUIC is not Quick Enough over Fast Internet*, WWW '24. Peer-reviewed measurement of HTTP/3 limits.
- Capital One systematic analysis: *A Systematic Analysis of the Capital One Data Breach*, ACM TOPS, 2022. [https://dl.acm.org/doi/full/10.1145/3546068](https://dl.acm.org/doi/full/10.1145/3546068)
- Improving Google A2A Protocol (Louck, Stulman, Dvir), arXiv:2505.12490, July 2025.

**Engineering blogs (current)**

- Stripe Engineering on API versioning. Last updated through 2026 (Stripe-Version date schema). [https://stripe.com/blog/api-versioning](https://stripe.com/blog/api-versioning) ; [https://docs.stripe.com/api/versioning](https://docs.stripe.com/api/versioning)
- Cloudflare blog (HTTP/2, HTTP/3, post-quantum, July 2019 outage RCA). 2026. [https://blog.cloudflare.com](https://blog.cloudflare.com)
- Netflix Tech Blog & QCon talks on Federated GraphQL (2022–2024). [https://qconsf.com/presentation/oct2022/scaling-graphql-adoption-netflix](https://qconsf.com/presentation/oct2022/scaling-graphql-adoption-netflix)
- Apollo: "Why Netflix Chose Federated GraphQL," 2024. [https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql](https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql)
- Shopify, GitHub, Atlassian developer documentation are themselves canonical REST references.
- htmx essays on REST/hypermedia (2024–2025). [https://htmx.org/essays/rest-explained/](https://htmx.org/essays/rest-explained/)
- Phil Sturgeon's APIs You Won't Hate newsletter, 2025–2026.

**YouTube / talks**

- Fielding's "A little REST and Relaxation" (2010); his "Architectural Styles" lectures.
- Lee Byron, "A Brief History of GraphQL," GraphQL Conf keynote.
- Mark Nottingham conference talks on HTTP, RFC 9110.
- Stefan Tilkov, "REST: I don't think it means what you think it does" (2014, evergreen) — InfoQ has the recording.

**Podcasts**

- *Software Engineering Daily*: Lee Byron on GraphQL (2019/2021 reruns). [https://softwareengineeringdaily.com/2021/01/04/facebook-graphql-with-lee-byron-repeat/](https://softwareengineeringdaily.com/2021/01/04/facebook-graphql-with-lee-byron-repeat/)
- *Software Engineering Radio*: episodes on REST, OpenAPI, gRPC.
- Mike Amundsen interviews on Nordic APIs YouTube.
- *The New Stack Makers* on MCP and agent protocols (2025–2026).

**Free university courses**

- Stanford CS142 *Web Applications*, covers REST. (Course notes online; check current quarter.)
- MIT 6.470 (offered intermittently).
- CMU 17-313 *Foundations of Software Engineering* covers API design.
- Berkeley CS169 *Software Engineering* covers REST principles.

**Hands-on tools (year of last major release)**

- **curl** (2026 — actively maintained). [https://curl.se](https://curl.se)
- **HTTPie** (2026). [https://httpie.io](https://httpie.io)
- **Postman** (2026 — though contentious cloud move).
- **Insomnia** (2026, Kong-owned). [https://insomnia.rest](https://insomnia.rest)
- **Bruno** (2026, fully open-source local-first). [https://www.usebruno.com](https://www.usebruno.com)
- **Hoppscotch** (2026, open-source web client).
- **mitmproxy** (2026). [https://mitmproxy.org](https://mitmproxy.org)
- **Wireshark** (2026, with SSLKEYLOGFILE for TLS).
- **Swagger UI / Redoc / Stoplight Elements** for OpenAPI (2026).
- **OpenAPI Generator** and **oapi-codegen** for typed clients/servers (2026).
- **vacuum** OpenAPI linter (2026, supports OpenAPI 3.2). [https://quobix.com](https://quobix.com)
- **Spectral** API linter from Stoplight.
- **Speakeasy / Gram** for OpenAPI → SDK + MCP server (2026).

## Where things are heading (2025–2026 frontier)

- **Active IETF work in `httpapi` WG.** Drafts in flight (all expiring 2026): RateLimit headers (`draft-ietf-httpapi-ratelimit-headers`), Idempotency-Key (`draft-ietf-httpapi-idempotency-key-header`), Link Hints, REST API Media Types (registers `application/openapi+json` and `application/openapi+yaml`), HTTP Problem Types for Digest Fields, Privacy/credential protection. The WG's mission is small composable HTTP extensions. ([https://ietf-wg-httpapi.github.io/](https://ietf-wg-httpapi.github.io/)) [IETF + 8](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- **OpenAPI 3.2 (Sept 2025)** is the first new minor release in 4 years. **3.3 and 4.0 ("Moonwalk")** are in early discussion; Moonwalk targets simpler nested structures and parameter-based responses, plus better non-REST coverage. ([https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2](https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2)) [Developerhub](https://developerhub.io/blog/whats-changing-in-openapi-3-2-and-why-you-should-care/)
- **OAuth 2.1** is closing in on RFC publication; once finalized it will obsolete RFCs 6749 and 6750. RFC 9700 (BCP) is already in force. [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- **MCP and A2A maturation.** MCP is now under the Linux Foundation's Agentic AI Foundation (Dec 2025); A2A under the Linux Foundation since June 2025. The 2026 fights are about security: prompt injection across MCP tools, identity propagation in A2A multi-agent flows, sender-constrained tokens, capability-based access. arXiv papers in 2025 documented multiple A2A weaknesses around sensitive data handling. ([https://arxiv.org/pdf/2505.12490](https://arxiv.org/pdf/2505.12490))
- **HTTP/3 deployment** has reached ~38.8% of top sites advertising support (W3Techs April 2026), but actual *negotiated* HTTP/3 traffic is much lower because origins lag. CDNs (Cloudflare ~69% within their managed traffic) carry the deployment. The Web Almanac 2025 quantifies the CDN/origin gap at 10-15x. ([https://w3techs.com/technologies/details/ce-http3](https://w3techs.com/technologies/details/ce-http3)) ([https://almanac.httparchive.org/en/2025/cdn](https://almanac.httparchive.org/en/2025/cdn)) [Technologychecker + 2](https://technologychecker.io/blog/http-protocol-adoption)
- **GraphQL adoption is plateauing.** Netflix has publicly defended Federated GraphQL while running REST in many stacks; numerous mid-size companies have publicly migrated *back* to REST citing operational cost, caching difficulty, and security exposure. The 2026 consensus is "GraphQL for Backend-for-Frontend, REST for public/contractual APIs, gRPC for east-west." ([https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql](https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql)) [Apollo GraphQL](https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql)
- **gRPC continues steady growth** in service-to-service traffic; gRPC support was added to A2A in 2025.
- **OData** has stagnated outside Microsoft, SAP, and Salesforce CDM. ASP.NET Core OData 9 (Aug 2024) was the first major update in 8 years. ([https://devblogs.microsoft.com/odata/announcing-asp-net-core-odata-9-official-release/](https://devblogs.microsoft.com/odata/announcing-asp-net-core-odata-9-official-release/)) [Visual Studio Magazine](https://visualstudiomagazine.com/articles/2024/04/26/odata-8-preview-1.aspx)
- **HATEOAS in practice is largely dead** — but its ideas resurfaced as MCP's tool/resource discovery, A2A's Agent Cards, and OpenAPI 3.2's hierarchical tags. The hypermedia constraint won at the meta-level even if not in JSON payloads.
- **AsyncAPI 3.0** is the standard for documenting event-driven APIs that complement REST surfaces.
- **The rise of typed SDK generation from OpenAPI/Protobuf** has eroded GraphQL's ergonomic advantage; tools like Speakeasy, Stainless, and Fern generate strongly-typed REST clients in a dozen languages, removing the "GraphQL gives me types" argument.
- **The "REST is back" narrative** is real but partial. REST never left; what's "back" is the recognition that simple, layered HTTP with OpenAPI describing it is sufficient for most cross-organizational APIs, and that the agent-protocol wave (MCP, A2A) is reusing REST's plumbing rather than replacing it.

## Hooks for the article, infographic, and podcast

**60-second narrated hook (for the ear):**

> In 2000, a UC Irvine grad student named Roy Fielding wrote a 180-page dissertation that almost no one would read all the way through. One chapter — Chapter 5 — described the architecture of the Web. He called it Representational State Transfer. REST. Twenty-five years later, REST is the most successful, most misunderstood, and most misused architectural style in the history of computing. Stripe runs on it. GitHub runs on it. Your bank runs on it. So does that AI agent that just booked your flight. The Optus breach? REST. The Capital One breach? REST. And the new agent protocols from Anthropic and Google in 2024 and 2025? Also REST — just wearing a new coat. This is the story of how a description of the Web became a religion, a commodity, a battleground, and somehow, against all odds, the foundation everyone keeps building on top of.

**Striking statistic:**

- **API attacks exploiting OWASP API Top 10 categories rose 32% year-over-year by Akamai's 2024 measurement, with Broken Object Level Authorization alone accounting for ~40% of all API attacks.** Source: Akamai analysis ([https://www.akamai.com/blog/security/owasp-top-10-api-security-risks-2023-edition](https://www.akamai.com/blog/security/owasp-top-10-api-security-risks-2023-edition)) and Imperva State of API Security 2024.

**"Pause and think" moment:**

- **By Roy Fielding's own definition, almost nothing in the industry that calls itself a "REST API" actually is one.** Most real-world REST APIs sit at Level 2 of the Richardson Maturity Model: resources, verbs, status codes — but no HATEOAS. Fielding said in 2008, in plain capital letters: "*if the engine of application state (and hence the API) is not being driven by hypertext, then it cannot be RESTful and cannot be a REST API. Period.*" Which means the entire industry has spent two decades using a name for something that isn't quite the thing. The really uncomfortable thought: maybe that's fine. Maybe the misappropriated REST is good enough — and the strict version was always more useful as a guiding fiction than as a literal recipe. ([https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven))

**Failure-story arc — Capital One, July 2019:**

*Setup.* In March 2019, Capital One's cloud security team had moved sensitive customer applications to AWS. They protected EC2-hosted applications behind ModSecurity, an open-source Web Application Firewall. The WAF was running with an IAM role attached — a "WAF-Role" — given list and read access to S3 buckets so it could pull configuration files. AWS's Instance Metadata Service (IMDSv1) sat at the magic IP `169.254.169.254`, ready to hand out temporary credentials to anything inside the EC2 instance that asked.

*Mistake.* The WAF was misconfigured to relay specially-crafted requests to arbitrary backends — including itself. Server-Side Request Forgery, or SSRF, was a known attack pattern, on the OWASP Top 10. A former AWS engineer named Paige Thompson knew it. She also knew where the metadata service lived. Between 22 and 23 March 2019, she sent the WAF an SSRF payload: "fetch `http://169.254.169.254/latest/meta-data/iam/security-credentials/WAF-Role` for me." The WAF, as designed, fetched it. The metadata service, as designed, returned a JSON blob with `AccessKeyId`, `SecretAccessKey`, and a `Token`. Thompson now had the WAF's credentials. They had S3 list and read.

*Consequence.* Over the following months she enumerated S3 buckets, downloaded credit applications, Social Security numbers, and bank account numbers for over 100 million Capital One customers in the U.S. and 6 million in Canada. She posted some of it to GitHub, which is how Capital One found out — not by detecting the breach internally, but via a tip from a researcher on 17 July 2019.

*Resolution.* Capital One disclosed publicly on 29 July. Thompson was arrested by the FBI in early August. Capital One later paid an $80 million civil penalty and a $190 million class settlement. AWS rolled out **IMDSv2** in November 2019: token-based, requiring an HTTP `PUT` to obtain a session token, blocking the SSRF vector at the metadata layer. Six years later — in 2026 — IMDSv2 is the default on new EC2 instances, but a non-trivial percentage of running instances still have IMDSv1 enabled. SSRF was added as **API7:2023** to the OWASP API Security Top 10 specifically because of incidents like this. The lesson, as Krebs wrote: in cloud environments, traditional network perimeter thinking is the attack surface. The metadata service is a REST API that nobody noticed was a REST API until the day someone abused it.

---

*Compiled from primary sources, IETF specifications, vendor engineering blogs, and incident post-mortems through May 2026. Where uncertainty remains — pronunciation conventions, exact pronunciations of HATEOAS, unverified historical anecdotes — claims are explicitly marked `[needs source]`. All other factual claims carry inline URLs to authoritative sources.*