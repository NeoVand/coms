---
id: rest
type: protocol
name: Representational State Transfer
abbreviation: REST
etymology: "[R]epresentational [S]tate [T]ransfer"
category: web-api
year: 2000
rfc: null
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/client-server-p2p
  - web-api/http1
  - web-api/rest-and-graphql
  - web-api/grpc
  - async-iot/kafka
  - async-iot/coap
  - patterns-failures/patterns
related_protocols: [a2a, http1, http2, http3, json-rpc, mcp, graphql, grpc, sse, websockets, soap, oauth2]
related_pioneers: [roy-fielding]
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Client-server_model.svg/500px-Client-server_model.svg.png"
    caption: "The client-server model — the foundation of REST architecture. Clients send stateless HTTP requests to a server, which manages resources and returns representations."
    credit: "Image: Wikimedia Commons / CC BY-SA 4.0"
visual_cues:
  - "A side-by-side: a single resource URL /v1/widgets/wgt_42 with GET, PUT, PATCH, DELETE arrows labelled with their HTTP semantics, status codes lighting up next to each."
  - "Roy Fielding's 2000 dissertation cover next to a state-machine diagram of web pages-as-states with hyperlinks-as-transitions, captioned 'why he renamed it from HTTP object model to REST'."
  - "The Capital One SSRF chain: client → ModSecurity WAF → 169.254.169.254 metadata service → S3, with the leaked WAF-Role token highlighted in red."
  - "The Richardson Maturity Model staircase — Level 0 (one URI, POST everything), Level 1 (resources), Level 2 (verbs + status codes, marked 'where 95% of REST APIs live'), Level 3 (HATEOAS)."
  - "A Stripe API request line carrying both Stripe-Version: 2026-04-22.dahlia and Idempotency-Key, captioned 'fifteen years of backwards compatibility, every account pinned to a date.'"
  - "MCP and A2A on top of REST plumbing — agent-card discovery, OAuth 2.1 bearer tokens, JSON-RPC envelopes, SSE streams, all flowing through ordinary HTTPS."
---

# REST — Representational State Transfer

## In one breath

REST is not a protocol. It is an architectural style for distributed systems that Roy Fielding wrote down in his 2000 UC Irvine dissertation, and it became the dominant pattern for everything HTTP-shaped on the public internet. A REST API names things with URLs, manipulates them with the seven HTTP verbs, returns standard status codes, and keeps no per-client state on the server between requests. In 2026 that pattern runs Stripe, GitHub, Shopify, Twilio, AWS, your bank, and the agent protocols Anthropic and Google released to coordinate large language models — MCP and A2A both ride on REST plumbing instead of replacing it.

## The pitch (cold-open)

In June 2000 a UC Irvine PhD student named Roy Fielding filed a 180-page dissertation. Almost no one read it cover to cover. One chapter — Chapter 5 — described the architecture of the Web. He called it Representational State Transfer. Twenty-five years later, REST is the most successful, most misunderstood, and most misused architectural style in computing. The Capital One breach was REST. The Optus breach was REST. The agent protocols that just shipped from Anthropic and Google are REST. And by Fielding's own definition, almost nothing in the industry that calls itself a REST API actually qualifies. The chapter episode on REST and GraphQL covers the long argument about what Fielding actually meant — this episode is about how it works on the wire, where it breaks, and what changed in the four years since the IETF rewrote HTTP.

## How it actually works

REST is a set of constraints on top of HTTP, not a wire format. Fielding's Chapter 5 derives it from the null architectural style by adding six constraints, one at a time: client-server, statelessness, cacheability, uniform interface, layered system, and the optional code-on-demand. The interesting one is the uniform interface, which itself splits into four sub-constraints — identification of resources by URI, manipulation through representations, self-descriptive messages, and hypermedia as the engine of application state, pronounced HATEOAS, which rhymes roughly with Hades-os.

Most production "REST APIs" sit at Level 2 of the Richardson Maturity Model that Leonard Richardson and Sam Ruby popularised in their 2007 O'Reilly book and Martin Fowler wrote up in March 2010. Level 0 is one URI and one verb — basically SOAP and XML-RPC tunnelled over POST. Level 1 introduces distinct resource URIs. Level 2 uses the HTTP verbs and status codes properly. Level 3 adds hypermedia controls. Roughly 95% of public APIs that call themselves RESTful are at Level 2. Fielding has been frustrated about this since 2008, when he published the essay *REST APIs must be hypertext-driven* and wrote, in a sentence quoted in every API design talk for the next fifteen years, that "if the engine of application state and hence the API is not being driven by hypertext, then it cannot be RESTful and cannot be a REST API. Period."

Walk through the simulator's six steps and you have a working mental model. The client opens a TCP connection to port 443, completes a TLS 1.3 handshake — one round trip, or zero for a resumed session under RFC 8446 — and sends `GET /users HTTP/1.1` with `Host: api.example.com` and `Accept: application/json`. The server returns `200 OK` and a JSON array of users. The client then sends `POST /users` with a JSON body for a new user. The server responds `201 Created` with a `Location` header pointing at `/users/2`. The client follows that header with `GET /users/2`. The server returns `200 OK` and the single resource. List, create, read — all using standard HTTP, no custom envelopes, no special tooling.

### Header at a glance

REST does not define a header set; it inherits HTTP's. The headers that matter in practice:

- `Content-Type` — the media type of the body, almost always `application/json` or, for partial updates, `application/merge-patch+json`.
- `Accept` — the client's ordered list of media types it can handle. Servers do content negotiation against this.
- `Authorization` — `Bearer <token>` for JWT or opaque tokens, `Basic <base64>` for HTTP Basic, occasionally an API key.
- `ETag` — an opaque server-chosen identifier for a specific representation. Drives conditional requests and optimistic concurrency.
- `If-Match` and `If-None-Match` — the client's preconditions on those ETags. Lets you say "update only if it still looks like this version" and "give me the body only if it has changed."
- `Last-Modified` and `If-Modified-Since` — the timestamp-based cousins.
- `Cache-Control` — `max-age`, `no-cache`, `no-store`, `private`, `public`, `must-revalidate`, `stale-while-revalidate`. RFC 9111 codifies the lot.
- `Vary` — which request headers the cache key depends on. Forget `Vary: Accept` and your cache will serve JSON to clients asking for XML.
- `Location` — the URL of a newly created resource, returned with 201.
- `Allow` — which methods the resource supports. Returned with 405 Method Not Allowed.
- `Link`, defined in RFC 8288 — typed hyperlinks in headers, the lightweight HATEOAS most pragmatic APIs actually use.
- The CORS family — `Origin`, `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Max-Age`, `Access-Control-Allow-Credentials` — for browser cross-origin permission.
- And two recent IETF httpapi drafts: `RateLimit` and `RateLimit-Policy`, and `Idempotency-Key`. Both expire in 2026; both are already widely deployed.

The verbs to know are seven, with one new one. `GET` is safe and idempotent and cacheable — read. `HEAD` is `GET` without a body, used to check existence and headers. `POST` is non-idempotent, not cacheable by default — create or "process this." `PUT` is idempotent — replace the target with the supplied representation. `PATCH`, defined in RFC 5789, is non-idempotent in general — partial update. `DELETE` is idempotent. `OPTIONS` discovers capabilities and is what browsers use for CORS preflight. The newcomer is `QUERY`, a safe and idempotent method that carries a request body for complex read queries; it landed in the OpenAPI 3.2 release on 23 September 2025.

Status codes split into five families: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error. The ones you see daily are 200 OK, 201 Created, 204 No Content, 301 and 308 for permanent redirects, 304 Not Modified for conditional GETs, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 409 Conflict, 412 Precondition Failed, 415 Unsupported Media Type, 422 Unprocessable Content, 429 Too Many Requests, 500, 502, 503, 504. And 418 I'm a teapot, which has its own story later.

### State machine in three sentences

REST is, by constraint, stateless: the server keeps no per-client session between requests, so every request must carry everything the server needs to interpret it — auth tokens, content type, requested format. There is no connection state machine the way there is in TCP or TLS; the only state is the resource's own state, which the client may observe through GET and may transition through PUT, PATCH, POST, or DELETE. The "state machine" Fielding was actually evoking when he renamed his work from "HTTP object model" to REST is the abstract one: a network of resources where the client traverses application state by following hyperlinks, the same way a user moves through a website by clicking links — that traversal pattern is what HATEOAS is supposed to expose.

### Reliability, caching, security mechanics

Reliability comes from three places. First, idempotence: GET, HEAD, PUT, DELETE, and OPTIONS are idempotent by spec, so safe to retry blindly. POST and PATCH are not, which is why Stripe popularised the `Idempotency-Key` header in 2015 and the IETF httpapi working group is now standardising it as `draft-ietf-httpapi-idempotency-key-header`. Second, conditional requests: `If-Match` with an `ETag` gives you optimistic concurrency — the server returns 412 Precondition Failed if the resource has moved on since you last looked. Third, layered intermediaries: caches, proxies, gateways, CDNs all participate in the protocol, returning 304 Not Modified, serving from cache, or rewriting on the way through.

Security is bolted on, not built in. TLS for transport. Bearer tokens — opaque or JWTs (RFC 7519) — in `Authorization` for identity. OAuth 2.0 (RFC 6749, October 2012) for delegated authorization, with OAuth 2.1 closing in on RFC publication; the current draft is revision 15 from March 2026, which obsoletes RFCs 6749 and 6750, requires PKCE, removes the implicit and resource-owner-password-credentials grants, and folds in RFC 9700, the OAuth 2.0 Best Current Practice. mTLS for service-to-service in financial-grade APIs. API keys still exist everywhere but are explicitly discouraged for user authentication.

The error format that finally has IETF blessing is RFC 9457, Problem Details for HTTP APIs, published in July 2023. It obsoletes RFC 7807. The body is `application/problem+json` and carries `type`, `title`, `status`, `detail`, `instance`, plus arbitrary extension members — so a credit-shortage error returns 403 Forbidden with a structured body containing the user's actual balance, instead of 200 OK and a `{"error": "..."}` blob that defeats every cache and middlebox in the path.

## Where it shows up in production

The defining production exemplars in 2026 are Stripe, Twilio, GitHub, Shopify, Atlassian, Slack, Salesforce, AWS, Google Cloud, and Twitter slash X. Most AWS services have a JSON-over-HTTPS REST surface even when the SDKs hide it.

Stripe is the single most-cited reference for REST API design. Its date-based versioning scheme is the trick. The current version as of writing is `2026-04-22.dahlia`. Each Stripe account is pinned to a specific date; every request can override that pin with a `Stripe-Version` header. Stripe maintains compatibility with every published version since 2011. In 2024 they shifted to monthly backwards-compatible releases plus twice-yearly major releases — Acacia in September 2024, Dahlia in 2026. They also introduced a `/v2` namespace alongside `/v1` rather than ever forcing a wholesale migration. Fifteen years of clients all still calling the same endpoints with their own pinned date.

The framework long tail is enormous. On Node: Express, Fastify, Hapi, NestJS, Koa. Python: Django REST Framework, FastAPI, Flask. Java: Spring Boot, Spring MVC, Spring WebFlux, Micronaut, Quarkus, Dropwizard. .NET: ASP.NET Core. Ruby: Rails with `ActionController::API`, Sinatra, Grape. Go: net/http, Gin, Echo, Chi, Fiber. Rust: Axum, Actix-Web, Rocket. PHP: Laravel, Symfony, Slim. Almost any language an engineer might pick up has a credible REST framework with sub-millisecond per-request overhead.

The deployment topology layers gateways and edges. API gateways: AWS API Gateway, Kong, Apigee at Google Cloud, Azure API Management, Tyk, Krakend, Mulesoft. Service mesh sidecars: Envoy, Linkerd, Consul. CDN edge runtimes: Cloudflare Workers, Fastly Compute@Edge, AWS CloudFront Functions, Akamai EdgeWorkers. Web Application Firewalls: AWS WAF, Cloudflare WAF, Akamai Kona, Imperva.

Performance numbers vary wildly with payload, but published benchmarks place a well-tuned Go, Rust, or Java REST service comfortably at tens of thousands of requests per second per core, single-digit-millisecond P50 latency for cached reads, and P99 in the tens of milliseconds within a region. CDN-fronted endpoints from Cloudflare and Fastly hit P50s under 30 milliseconds globally. The real bottleneck in production REST in 2026 is not HTTP — it is the database, the dependent service, the TLS handshake on a cold connection, and JSON serialization.

The HTTP version split is informative. The HTTP Archive 2025 Web Almanac reports HTTP/3 carrying about 29% of CDN-served HTML on mobile and almost nothing — under 5% — at origin. W3Techs measured around 38.8% of top sites *advertising* HTTP/3 support in April 2026, but actual negotiated HTTP/3 traffic is much lower because origins lag the edge by a factor of ten to fifteen. HTTP/1.1, by Cloudflare's Q1 2026 numbers, still carries about 28% of all requests — sustained by curl, scripting clients, server-to-server REST, and the long tail of older nginx, Apache, and IIS deployments.

## Things that go wrong

Almost every public REST mega-breach since 2018 maps to one of the OWASP API Security Top 10. The 2023 edition is the current authoritative version — there has been no 2024 or 2025 update. Akamai's 2024 measurement found Broken Object Level Authorization alone — API1 — accounting for around 40% of all API attacks, and overall attacks against API Top 10 categories rose 32% year-over-year.

**Capital One, July 2019.** A former AWS engineer named Paige Thompson exploited a misconfigured ModSecurity WAF running on EC2. The WAF's IAM role had over-broad S3 permissions. Thompson sent the WAF a Server-Side Request Forgery payload telling it to fetch `http://169.254.169.254/latest/meta-data/iam/security-credentials/WAF-Role` — the AWS instance metadata service. The WAF, as designed, fetched it. The metadata service, as designed, returned a JSON blob containing temporary AWS credentials. Thompson now had the WAF's S3 list-and-read permissions and used them to download credit applications, Social Security numbers, and bank account numbers for over 100 million customers in the United States and 6 million in Canada. Capital One found out from a researcher's tip on 17 July, not from internal detection.

What it taught the industry: the metadata service is a REST API, even though nobody had thought of it that way. AWS rolled out IMDSv2 — token-based, requiring an HTTP `PUT` to obtain a session token before any read — in November 2019, blocking the SSRF vector at the metadata layer. Capital One paid an $80 million civil penalty and a $190 million class settlement. SSRF was added as API7 in the OWASP API Security Top 10 2023 edition specifically because of incidents like this. Six years later, IMDSv2 is the default on new EC2 instances but a non-trivial fraction of running instances still have IMDSv1 enabled.

**Equifax, 2017.** Apache Struts CVE-2017-5638 — a remote code execution flaw in the Jakarta Multipart parser triggered by a malicious `Content-Type` header. The patch shipped 7 March 2017. Exploitation began 10 March. From 13 May to 30 July attackers moved laterally through Equifax's network and exfiltrated about 147 million records. The unpatched system was the Struts REST plugin powering an online dispute portal. (A separate RCE in the same plugin's XStream-based REST parser, CVE-2017-9805, was disclosed a few months later but was not the Equifax vector.) The lesson was about deployment hygiene: the disclosed window between patch and exploitation kept widening, and the parser surface that processes attacker-controlled `Content-Type` is the kind of thing nobody puts a SAST tool against.

**Cloudflare, 2 July 2019, 27-minute global outage.** A new Web Application Firewall rule pushed globally contained a regex with two nested `.*` clauses. Catastrophic backtracking saturated CPU on the HTTP/HTTPS workers worldwide. Discord, Shopify, Medium and many others returned 502 Bad Gateway. Cloudflare resolved it by globally disabling the WAF and later migrated to non-backtracking re2 / Rust regex engines. Not a REST design failure as such, but a reminder that the layered intermediaries REST depends on are themselves software and themselves failure-prone.

**Optus, September 2022.** Australia's second-largest telco. An unauthenticated REST endpoint at `api.www.optus.com.au` returned customer records by sequential `contactID` integer. Up to 9.8 million records exposed. A ransom of 1.5 million Australian dollars was demanded then withdrawn. The combination of unauthenticated endpoint plus integer enumeration plus sensitive PII is a textbook stack of API1 BOLA, API2 Broken Authentication, and API9 Improper Inventory Management.

**Peloton, January through May 2021.** Pen Test Partners' Jan Masters found unauthenticated GraphQL endpoints, and later authenticated-but-unauthorized endpoints, returning user IDs, location, weight, gender, and age — for around three million subscribers, including users who had set their profiles to private, including President Biden. Reported on 20 January, partial silent fix by 2 February, full fix only after journalist intervention in May.

**Parler, 11 January 2021.** The hacktivist `@donk_enby` exploited five things at once: most public APIs had no authentication, post IDs were sequential integers, there was no rate limiting, "deleted" posts were merely flagged not removed, and image and video metadata still contained GPS coordinates. Around 70 terabytes scraped via curl scripts before AWS pulled Parler's hosting. As Kenneth White told *Wired*, "this is like a Computer Science 101 bad homework assignment."

**T-Mobile, January 2023, after a similar incident in August 2021.** A single REST API was abused starting 25 November 2022; detection on 5 January 2023; about 37 million postpaid and prepaid accounts exposed — name, billing address, email, phone, date of birth. The August 2021 breach (about 76 million records) had already cost T-Mobile a $350 million class settlement. Eight disclosed breaches since 2018.

**USPS, 2018.** A flaw in the Informed Visibility API let any logged-in usps.com user query account details for any of 60 million users.

The Capital One story has its own arc — the chapter episodes on REST and GraphQL and on Recurring Patterns both touch the lessons. The pattern across all of them is the same: the protocol did not fail. The application did, by failing to use the protocol's vocabulary fully — no auth on a public endpoint, no per-object permission check, no rate limit on the expensive dimension, sequential IDs in URIs.

## Common pitfalls (for the practitioner)

- **BOLA, API1.** Missing per-object permission check. Comparing the JWT user-id to the URL id is necessary but not sufficient. Fix: a deny-by-default authorisation layer that asks "may this principal touch this object?" for every request, not just "is this principal authenticated?".
- **Mass assignment.** Blindly binding request JSON to ORM models exposes hidden fields like `isAdmin` or `passwordHash`. Fix: explicit DTOs and allowlists.
- **Excessive data exposure.** Server returns the full object, the UI hides fields — but the JSON is on the wire. Fix: shape responses on the server, not the client.
- **Rate limiting on the wrong dimension.** Per-request rate limits do not stop someone enumerating 9.8 million records over a week. Fix: rate-limit on the expensive thing — bytes, computed cost, distinct objects accessed.
- **SSRF.** Any user-supplied URL the server fetches is a vector. Block 127.0.0.0/8, 169.254.169.254, RFC 1918 ranges, and IPv6 link-local. Use IMDSv2 in AWS.
- **Improper inventory.** `/v1` is documented; `/v0`, `/internal`, and `/staging` are still live and not decommissioned. Fix: a real API inventory, including the ones the gateway forgot.
- **CORS leakage.** `Access-Control-Allow-Origin: *` plus `Access-Control-Allow-Credentials: true` is impossible per spec. Reflecting `Origin` without an allowlist is the same hole. Fix: explicit allowlist, never reflection.
- **Missing `Vary: Accept`.** When you do content negotiation and forget `Vary`, caches will serve the wrong representation across users. Cache poisoning by accident.
- **`200 OK` with an error body.** Defeats every cache and middlebox between client and server. Fix: use real status codes; use RFC 9457 Problem Details for the body.
- **JWT validation that doesn't check `iss`, `aud`, `exp`, `nbf`, and the algorithm.** Algorithm confusion attacks are still real. Fix: validate every claim; pin the algorithm.
- **Sequential integer IDs in URIs.** Optus, Parler. Use opaque identifiers — UUIDs or KSUIDs.
- **Reflecting the `Origin` header without an allowlist.** Same hole as the CORS one above; worth listing twice because it keeps shipping.
- **`Authorization` in `Vary`.** Caches usually omit `Authorization` from the cache key, breaking auth-dependent caches. Most of the time the right answer is `Cache-Control: private` and let the client cache hold the auth-bound copy.

## Debugging it

The toolkit has not changed much in fifteen years, and that is part of the point of REST.

- `curl -v` for raw exchanges. Add `--http3` or `--http2` to negotiate a specific version.
- `httpie` for friendlier curl with JSON-aware formatting.
- `mitmproxy` for live inspection between a client and a server.
- Wireshark with `SSLKEYLOGFILE` set in the client process for TLS-decrypted captures.
- Browser DevTools Network tab for frontend issues.
- `nghttp2` for HTTP/2-specific debugging.
- Chrome's `chrome://net-export/` for low-level network event diagnostics.
- For OpenAPI specs: `vacuum`, the linter that supports OpenAPI 3.2; Stoplight's `Spectral`; Swagger UI, Redoc, and Stoplight Elements for rendering.
- For code generation: OpenAPI Generator, oapi-codegen for Go, Speakeasy, Stainless, Fern.

For day-two operations: P50, P95, P99 latency per route. Error rate by status-code class. Saturation on the connection pool, the thread pool, the database pool. Backpressure as queue depth. The 2-second tail at P99.9 will eat you alive at 10K requests per second. OpenTelemetry distributed tracing with the W3C `traceparent` header. Look at full spans across hops — the worst REST bugs are in the third microservice down the chain, not the one you wrote.

## What's changing in 2026

Ordered most-recent first.

- **KIP-style work in the IETF httpapi working group.** Drafts in flight, all expiring during 2026: `RateLimit` headers (`draft-ietf-httpapi-ratelimit-headers-10`), `Idempotency-Key` (`draft-ietf-httpapi-idempotency-key-header-07`), Link Hints, REST API Media Types (which would register `application/openapi+json` and `application/openapi+yaml`), HTTP Problem Types for Digest Fields, and Privacy / credential protection. The working group's mission is small composable HTTP extensions.
- **OpenAPI 3.2.0**, released 23 September 2025 — the first new minor release in four years. Adds the `QUERY` HTTP method, hierarchical Tags, OAuth Device Flow, streaming media types, and `additionalOperations` for non-standard verbs. 3.3 and 4.0 ("Moonwalk") are in early discussion; Moonwalk is targeting simpler nested structures and parameter-based responses, plus better non-REST coverage.
- **OAuth 2.1**, current draft 15 from March 2026, is closing in on RFC publication. Once finalised it will obsolete RFC 6749 and RFC 6750. RFC 9700, the OAuth 2.0 Best Current Practice, is already in force.
- **MCP under the Linux Foundation.** Anthropic open-sourced the Model Context Protocol on 25 November 2024. OpenAI announced full MCP support on 26 March 2025. Google's Gemini followed in April 2025. In December 2025 Anthropic donated MCP to the Linux Foundation's Agentic AI Foundation. MCP runs JSON-RPC 2.0 over two transports — stdio for local subprocesses, Streamable HTTP for remote — with OAuth 2.1 for remote auth. The pragmatic verdict in 2026 is that MCP does not replace your REST API; it sits next to it.
- **Google's Agent2Agent (A2A) protocol** unveiled at Google Cloud Next on 9 April 2025 with 50-plus partners, donated to the Linux Foundation in June 2025. HTTPS plus JSON-RPC 2.0 plus Server-Sent Events for streaming. Discovery via Agent Cards at `/.well-known/agent.json` — a well-known URI pattern lifted straight from RFC 8615. OAuth 2.0, API keys, or mTLS for auth. By mid-2025 the A2A spec had 150-plus supporters.
- **RFC 9457 Problem Details for HTTP APIs**, published July 2023, obsoleting RFC 7807. Adds a registry of common problem URIs and clarifies multi-problem responses.
- **AsyncAPI 3.0**, released December 2023. Splits channels from operations and renames publish/subscribe to send/receive. Important because much "real-time REST" is actually AsyncAPI-described event flow next to a REST surface.
- **HTTP/3 deployment.** About 38.8% of top sites advertising support per W3Techs in April 2026, but actual negotiated HTTP/3 traffic is much lower because origins lag. Cloudflare-managed traffic is dominated by HTTP/3 — about 69% within their network, double-digit percentage of all CDN-served traffic, especially on mobile.
- **GraphQL is plateauing.** Netflix has publicly defended Federated GraphQL while running REST in many of its stacks. Numerous mid-size companies have publicly migrated back to REST citing operational cost, caching difficulty, and security exposure. The 2026 consensus is "GraphQL for backend-for-frontend, REST for public and contractual APIs, gRPC for east-west service traffic."
- **Typed SDK generation from OpenAPI and Protobuf** has eroded GraphQL's ergonomic advantage. Speakeasy, Stainless, and Fern generate strongly-typed REST clients in a dozen languages, removing the "GraphQL gives me types" argument.
- **HATEOAS in practice is largely dead.** But its ideas resurfaced as MCP's tool/resource discovery, A2A's Agent Cards, and OpenAPI 3.2's hierarchical tags. The hypermedia constraint won at the meta-level even if not in JSON payloads.

## Fun facts (host material)

- **REST is not named after a rest stop.** Fielding states in the dissertation that the original name was "the HTTP object model"; he renamed it to evoke a state-machine traversal — a virtual machine where users move through application states by following links. The romantic etymology is wrong.
- **The dissertation's overlooked thesis.** Most readers think Fielding's dissertation is about REST. It is actually a much broader argument that "design-by-buzzword is a common occurrence" and that architectural styles must be selected to match application needs. Only Chapter 5 of the 8-chapter document defines REST.
- **Waka.** Between 2001 and 2006 Fielding worked on Waka, a binary token-based replacement for HTTP intended to match REST's efficiency. It never shipped. Fielding now works at Adobe, and co-led Day Software (which built JCR/Sling/Jackrabbit) before Adobe acquired it in 2010.
- **HTTP 418 I'm a teapot.** From RFC 2324 by Larry Masinter, dated 1 April 1998 — the Hyper Text Coffee Pot Control Protocol. RFC 7168 (Imran Nazar, 1 April 2014) extended it for tea. In 2017, HTTPBIS chair Mark Nottingham proposed removing 418 from major HTTP libraries. A 15-year-old named Shane Brunswick launched save418.com and the hashtag `#save418`. The IETF eventually marked 418 as reserved-slash-unused. Python 3.9 added `IM_A_TEAPOT` in October 2020.
- **The 2008 essay.** Fielding's blog post *REST APIs must be hypertext-driven* contains the line, about the SocialSite REST API that had prompted it: "There is so much coupling on display that it should be given an X rating." It is the most-quoted screed in API history.
- **The "REST is just CRUD over HTTP" myth.** Fielding has repeatedly objected that resources need not be database rows, and operations need not be CRUD. The resource interface is generic; a single resource can map to a query, a process, an event, or a temporal projection.
- **MCP origin story.** Anthropic engineer David Soria Parra was frustrated with constantly copy-pasting between Claude Desktop and his IDE. He and Justin Spahr-Summers built MCP partly to scratch that itch. They modelled it on Microsoft's Language Server Protocol, which had quietly become how editors avoid writing language support N times over.

## Where this connects in the book

- *Foundations* — chapter "Client-Server vs Peer-to-Peer." The communication pattern REST inherits and the trade-offs that come with it.
- *Web / API* — chapter "HTTP/1.1." The lingua franca REST was designed against. Why it is still 28% of Cloudflare-observed traffic in Q1 2026, and why 7 June 2022 was the day the IETF replaced the entire 1997-2014 HTTP spec lineage in one big bang.
- *Web / API* — chapter "REST and GraphQL." The 25-year argument over what Fielding actually meant, the HATEOAS constraint, the cost that emerged at mobile scale, and how Facebook hit the wall in 2012 that produced GraphQL.
- *Web / API* — chapter "gRPC." Why gRPC dominates inside the datacenter and barely exists in browsers. The HTTP/2 trailer dependence. The CONTINUATION Flood and MadeYouReset CVE wave that ripples through everything HTTP/2-shaped.
- *Async / IoT* — chapter "Kafka." Where the Kafka Connect REST API became the Log4Shell moment for messaging in 2023, and how the message-bus pattern complements REST for asynchronous fan-out.
- *Async / IoT* — chapter "CoAP." REST shrunk for microcontrollers — the same verbs and status codes, but a 4-byte binary header over UDP and the EDHOC/OSCORE crypto stack.
- *How Networks Actually Behave* — chapter "Recurring Patterns." Idempotency keys, handshakes, sliding windows, keepalives. Stripe's idempotency-key pattern is now in every REST API, every Kafka producer, every system that wants at-least-once without duplicate side effects.

## See also (other protocol episodes)

- **REST and gRPC.** If you have heard the gRPC episode, the contrast is the whole story. REST is text JSON over any HTTP version, browser-native, schema-optional, ad-hoc, designed for the open web where you cannot assume anything about the client. gRPC is binary Protocol Buffers over HTTP/2 only, browser-incompatible without the gRPC-Web proxy, schema-first with code generation, designed for the closed case where you control both sides. Use REST when your API is consumed by browsers, mobile apps, or third-party developers. Use gRPC for east-west service traffic where binary is 5 to 10 times smaller than JSON.

- **REST and GraphQL.** The contrast of fixed endpoints versus client-specified queries. REST exposes resource shapes the server defines; GraphQL exposes a single endpoint where the client picks the fields. REST gets HTTP caching per URL for free; GraphQL caching is application-level and complex. REST over- and under-fetches; GraphQL doesn't, but pays a query-parsing and DoS-exposure cost. The 2026 consensus is to use both: REST for simple resource CRUD and public APIs, GraphQL for backend-for-frontend with wildly different client needs.

- **REST and WebSockets.** Stateless request-response versus a persistent bidirectional channel. REST has full HTTP headers per request; WebSockets have 2-to-14-byte framing after the handshake. REST gets HTTP caching; WebSockets do not — they are real-time streams. Use REST for CRUD and broad-client public APIs; use WebSockets for chat, trading, gaming, and anything inherently event-driven.

- **REST and HTTP/2.** Not alternatives — REST is an architectural style, HTTP/2 is a transport. They compose: REST APIs run unchanged over HTTP/2 and gain multiplexing, HPACK header compression, and server push without any API design changes. The interesting tension is that REST APIs that previously batched requests to avoid head-of-line blocking can stop batching once they are on HTTP/2.

- **REST and SOAP.** The 2005-to-2010 vendor-blog war that REST won. SOAP is XML envelopes over HTTP POST with WSDL contracts and the WS-* security stack. REST is verbs, status codes, and any media type, with OpenAPI as optional documentation. By 2012 SOAP was relegated to enterprise integration and bank back-ends. REST won on simplicity, JSON's 2-to-10x size advantage over equivalent XML, and the broader developer adoption that came with both.

- **REST and JSON-RPC.** Resource-oriented versus action-oriented. REST maps operations to HTTP verbs and many resource URLs; JSON-RPC sends method names to a single endpoint. REST is cacheable; JSON-RPC, all POSTs, is not. Use REST when your API models resources with standard CRUD. Use JSON-RPC when your API is action-oriented — execute, calculate, query — and especially for blockchain nodes, AI agents, and editor backends.

- **REST and A2A.** Google's Agent-to-Agent protocol from April 2025. A2A is REST-flavoured: HTTPS plus JSON-RPC 2.0 plus Server-Sent Events. Stateful tasks with lifecycle (submitted, working, completed, failed) instead of REST's stateless request-response. Agent Cards at well-known URIs for discovery, replacing OpenAPI documentation. Use REST for general-purpose APIs for human developers; use A2A when you need multi-agent task delegation and capability negotiation.

- **REST and MCP.** Anthropic's Model Context Protocol from November 2024. MCP exposes tools, resources, and prompts to AI applications via JSON-RPC. Two transports: stdio for local, Streamable HTTP for remote. The HTTP variant rides on REST plumbing — HTTPS, OAuth 2.1 for remote auth, CORS for browser clients. The pragmatic verdict: MCP doesn't replace your REST API; it sits next to it as the AI-native surface.

- **REST and SSE.** Server-Sent Events is just a long-lived GET that returns `text/event-stream`. REST-friendly, browser-native via the EventSource API, complements REST's request-response model with unidirectional push. MCP's HTTP transport uses SSE-shaped streams. OpenAPI 3.2's streaming media types formalise how to describe them.

- **REST and OAuth 2.0.** The standard way to protect REST APIs in 2026. After the OAuth flow, the client puts the access token in `Authorization: Bearer eyJhbG...` on every REST request. The API validates signature, expiry, and scopes. OAuth 2.1 — current draft 15, March 2026 — consolidates fifteen years of best-current-practice into one document.

## Visual cues for image generation

- "A side-by-side: a single resource URL `/v1/widgets/wgt_42` with GET, PUT, PATCH, DELETE arrows labelled with their HTTP semantics, status codes lighting up next to each."
- "Roy Fielding's 2000 dissertation cover next to a state-machine diagram of web pages-as-states with hyperlinks-as-transitions, captioned 'why he renamed it from HTTP object model to REST'."
- "The Capital One SSRF chain: client to ModSecurity WAF to 169.254.169.254 metadata service to S3, with the leaked WAF-Role token highlighted in red."
- "The Richardson Maturity Model staircase — Level 0 (one URI, POST everything), Level 1 (resources), Level 2 (verbs + status codes, marked 'where 95% of REST APIs live'), Level 3 (HATEOAS)."
- "A Stripe API request line carrying both `Stripe-Version: 2026-04-22.dahlia` and `Idempotency-Key`, captioned 'fifteen years of backwards compatibility, every account pinned to a date.'"
- "MCP and A2A on top of REST plumbing — agent-card discovery, OAuth 2.1 bearer tokens, JSON-RPC envelopes, SSE streams, all flowing through ordinary HTTPS."

## Sources

**RFCs and specifications**

- [Roy Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, UC Irvine 2000](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf)
- [Fielding, REST chapter (Chapter 5) — html](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [RFC 9110 — HTTP Semantics (June 2022)](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9457 — Problem Details for HTTP APIs (July 2023)](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 9700 — OAuth 2.0 Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 8259 — JSON](https://www.rfc-editor.org/rfc/rfc8259)
- [RFC 7519 — JWT](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 3986 — URI](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000.html)
- [RFC 6455 — WebSocket](https://www.rfc-editor.org/rfc/rfc6455.html)
- [RFC 7252 — CoAP](https://datatracker.ietf.org/doc/html/rfc7252)
- [draft-ietf-oauth-v2-1 — OAuth 2.1 (current draft 15, March 2026)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- [IETF httpapi working group GitHub](https://github.com/ietf-wg-httpapi)
- [OpenAPI 3.2.0 announcement (23 September 2025)](https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2)
- [OpenAPI 3.2.0 spec](https://spec.openapis.org/oas/v3.2.0.html)
- [JSON:API 1.1](https://jsonapi.org/format/)
- [AsyncAPI 3.0.0 release notes (December 2023)](https://www.asyncapi.com/blog/release-notes-3.0.0)
- [WHATWG Fetch — CORS protocol](https://fetch.spec.whatwg.org/#cors-protocol)
- [IANA media types registry](https://www.iana.org/assignments/media-types/media-types.xhtml)

**Papers**

- [Fielding & Taylor, *Principled Design of the Modern Web Architecture*, ACM TOIT, 2002](https://dl.acm.org/doi/10.1145/514183.514185)
- [*A Systematic Analysis of the Capital One Data Breach*, ACM TOPS, 2022](https://dl.acm.org/doi/full/10.1145/3546068)
- [Improving Google A2A Protocol — arXiv:2505.12490, July 2025](https://arxiv.org/pdf/2505.12490)

**Vendor and engineering blogs**

- [Stripe — API versioning blog](https://stripe.com/blog/api-versioning)
- [Stripe — versioning docs](https://docs.stripe.com/api/versioning)
- [Cloudflare — 2 July 2019 outage RCA](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)
- [Cloudflare Radar — Year in Review 2025](https://radar.cloudflare.com/year-in-review/2025)
- [HTTP Archive — 2025 Web Almanac, CDN chapter](https://almanac.httparchive.org/en/2025/cdn)
- [Apollo — Why Netflix Chose Federated GraphQL](https://www.apollographql.com/blog/redefining-api-strategy-why-netflix-platform-engineering-chose-federated-graphql)
- [Akamai — OWASP API Top 10 2023 analysis](https://www.akamai.com/blog/security/owasp-top-10-api-security-risks-2023-edition)
- [Anthropic — Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [Google Cloud — Agent2Agent Protocol announcement](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [htmx essays — REST explained](https://htmx.org/essays/rest-explained/)
- [Microsoft — ASP.NET Core OData 9 release](https://devblogs.microsoft.com/odata/announcing-asp-net-core-odata-9-official-release/)
- [Wiz — OWASP API Security overview](https://www.wiz.io/academy/api-security/owasp-api-security)
- [Wiz — SSRF explainer](https://www.wiz.io/academy/application-security/server-side-request-forgery)
- [W3Techs — HTTP/3 usage](https://w3techs.com/technologies/details/ce-http3)
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [OWASP — API1: BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [OpenAPI 3.2 changes — Quobix](https://quobix.com/articles/openapi-3.2/)
- [What's changing in OpenAPI 3.2 — Developerhub](https://developerhub.io/blog/whats-changing-in-openapi-3-2-and-why-you-should-care/)
- [Galileo AI — Google Agent2Agent guide](https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide)
- [Apono — A2A protocol explainer](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)

**News and post-mortems**

- [Krebs on Security — Capital One hack analysis](https://krebsonsecurity.com/2019/08/what-we-can-learn-from-the-capital-one-hack/)
- [Huntress — Capital One data breach summary](https://www.huntress.com/threat-library/data-breach/capital-one-data-breach)
- [CSOonline — Equifax data breach FAQ](https://www.csoonline.com/article/567833/equifax-data-breach-faq-what-happened-who-was-affected-what-was-the-impact.html)
- [Security Affairs — Equifax](https://securityaffairs.com/63043/hacking/equifax-data-breach.html)
- [Verse Systems — Optus breach analysis](https://verse.systems/blog/post/2022-09-25-optus-breach/)
- [TechCrunch — Peloton bug exposes account data](https://techcrunch.com/2021/05/05/peloton-bug-account-data-leak/)
- [BankInfoSecurity — Peloton API flaws](https://www.bankinfosecurity.com/peloton-api-flaws-exposed-users-data-prior-to-recent-patch-a-16534)
- [The New Stack — How Parler's data was harvested](https://thenewstack.io/how-parlers-data-was-harvested/)
- [API Security News — Parler vulnerabilities](https://apisecurity.io/issue-116-facebook-parler-api-vulnerabilities-clairvoyance/)
- [Krebs — T-Mobile January 2023 breach](https://krebsonsecurity.com/2023/01/new-t-mobile-breach-affects-37-million-accounts/)
- [Medium — The regex that took down Cloudflare](https://medium.com/@lakshayaggarwal9/the-regex-that-took-down-cloudflare-and-10-of-the-internet-254463732b55)
- [Two Bit History — REST](https://twobithistory.org/2020/06/28/rest.html)
- [The History of the Web — SOAP, REST, odds and ends](https://thehistoryoftheweb.com/soap-rest-odds/)
- [Florian Krämer — Most RESTful APIs are not really RESTful](https://florian-kraemer.net/software-architecture/2025/07/07/Most-RESTful-APIs-are-not-really-RESTful.html)
- [Roy Fielding — REST APIs must be hypertext-driven (2008)](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
- [Martin Fowler — Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [Ole Begemann — REST etymology](https://oleb.net/2018/rest/)
- [Lee Byron — Introducing the GraphQL Foundation](https://leebyron.com/introducing-the-graphql-foundation/)

**Wikipedia**

- [Roy Fielding](https://en.wikipedia.org/wiki/Roy_Fielding)
- [WebSocket](https://en.wikipedia.org/wiki/WebSocket)
- [gRPC](https://en.wikipedia.org/wiki/GRPC)
- [Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [OpenAPI Specification](https://en.wikipedia.org/wiki/OpenAPI_Specification)
- [2022 Optus data breach](https://en.wikipedia.org/wiki/2022_Optus_data_breach)
- [Hyper Text Coffee Pot Control Protocol](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)
