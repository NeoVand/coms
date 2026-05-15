---
id: grpc
type: protocol
name: gRPC Remote Procedure Calls
abbreviation: gRPC
etymology: "[g]RPC [R]emote [P]rocedure [C]alls (the g is a different word every release — gRPC, good, gandalf, gladiator, genuine, glimmering)"
category: web-api
year: 2015
rfc: null
standards_body: cncf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/ports-sockets
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - transport/tcp
  - transport/sctp
  - web-api/http2
  - web-api/grpc
related_protocols: [a2a, http2, json-rpc, mcp, tls, rest, soap]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Google_Corkboard_Server_Rack.jpg/500px-Google_Corkboard_Server_Rack.jpg"
    caption: "Google's original 1999 corkboard server rack — the ancestor of the data centers that now run on the order of ten billion RPCs per second over Stubby and gRPC."
    credit: "Photo: Wikimedia Commons / CC BY 2.0"
visual_cues:
  - "A single HTTP/2 connection split into many parallel streams, each one a separate gRPC call, with a tiny five-byte length-prefix sitting in front of every protobuf payload."
  - "Side-by-side wire bytes: a 5-byte gRPC framing header (1-byte compressed flag + 4-byte big-endian length) wrapping the 5-byte protobuf for SayHello{name:\"abc\"} = 0a 03 61 62 63."
  - "The trailer surprise: a successful gRPC response showing :status 200, then a DATA frame with the protobuf, then a final HEADERS frame carrying grpc-status: 0 — the only mandatory trailer in the protocol."
  - "A timeline of the Rapid Reset DDoS in October 2023: 20,000 bots, a single HEADERS-then-RST_STREAM loop, peaking at 398 million requests per second against Google."
  - "The grpc-timeout gotcha: the wire string '100m' annotated as 100 milliseconds, with '100M' annotated as 100 minutes — a 60,000× difference from a single capital letter."
  - "A proxyless service mesh: gRPC channel on the left talking xDS:///service-name to a control plane on the right, with the Envoy sidecar that used to sit in the middle crossed out."
---

# gRPC — gRPC Remote Procedure Calls

## In one breath

gRPC is Google's open-source RPC framework: you describe your service in a .proto file, the compiler generates strongly-typed clients and servers in eleven languages, and the wire format is Protocol Buffers carried over HTTP/2 streams with a five-byte length prefix in front of every message. It was open-sourced in February 2015 as the externalised cousin of Stubby, the internal RPC framework that has handled every Google service-to-service call since the early 2000s. If your microservices, your Kubernetes container runtime, your CockroachDB cluster, your Triton inference server, or your Envoy sidecar talk to anything, they probably talk gRPC.

## The pitch (cold-open)

Inside Google's data centers, on the order of ten billion remote procedure calls happen every second. They have been happening for over twenty years on a system Google calls Stubby. In February 2015 the Stubby team took those lessons, sanded off the Google-specific edges, and shipped them as gRPC. Today gRPC is how Netflix's 12-plus membership microservices serve 238 million subscribers, how etcd and Kubernetes glue themselves together, how NVIDIA Triton serves AI models, and how Cloudflare's internal Kubernetes services reduced unmarshal time by a factor of 235 versus JSON. There are sharp edges — a 4-MiB default message ceiling, a single capital letter that turns 100 milliseconds into 100 minutes, an HTTP/2 trailer requirement that locked browsers out for a decade. But once you understand them, you can build things you cannot build any other way.

## How it actually works

gRPC is, mechanically, four things stacked: HTTP/2 underneath, Protocol Buffers as the message encoding, a five-byte length-prefix between them, and a small set of reserved headers and trailers. Everything else — channels, deadlines, retries, load balancing, xDS — is library glue. We cover the HTTP/2 framing and security saga in depth in the HTTP/2 episode and the chapter on HTTP/2; here we focus on what gRPC adds on top.

The simulator transcript walks the simplest case — a unary call — in five steps.

**Step 1: Request HEADERS.** The client opens an HTTP/2 stream and sends a HEADERS frame. The pseudo-headers come first: `:method` is always POST, `:path` is `/Service/Method` such as `/users.UserService/GetUser`, `:scheme` is `https`, `:authority` is `host:port`. Then the gRPC-specific headers: `content-type: application/grpc`, `te: trailers` (used to detect proxies that strip trailers), an optional `grpc-encoding` selecting compression, an optional `grpc-timeout`, and any custom metadata. Header keys ending in `-bin` carry base64-encoded binary so non-ASCII bytes survive HPACK serialisation.

**Step 2: Request DATA.** The protobuf payload travels in one or more HTTP/2 DATA frames. Every gRPC message inside those frames carries a five-byte prefix: one byte of compressed-flag (`0x00` for identity, `0x01` for whatever `grpc-encoding` declared), then four bytes of big-endian unsigned length. A `SayHello{name:"abc"}` request encodes as protobuf `0a 03 61 62 63` — five bytes of payload — wrapped as `00 00 00 00 05 0a 03 61 62 63`. DATA-frame boundaries do not align with message boundaries; the spec is explicit that implementations must make no such assumption.

**Step 3: Response HEADERS.** The server sends back HEADERS with `:status 200` and `content-type: application/grpc`. The HTTP status is always 200 for any call the server actually processed; the real outcome arrives later, in trailers.

**Step 4: Response DATA.** The protobuf reply, length-prefixed the same way.

**Step 5: Trailers.** The server closes the stream with a final HEADERS frame carrying `END_STREAM`. The single mandatory trailer is `grpc-status: 0` (decimal-encoded, no leading zeros); `grpc-message` adds an optional human-readable description; `grpc-status-details-bin` carries an optional base64-encoded `google.rpc.Status` for structured error detail. If the server has nothing to stream, it can send a Trailers-Only response — one HEADERS frame with `:status 200`, `content-type: application/grpc`, `grpc-status: …`, `END_STREAM`.

That trailer requirement is the single most consequential design choice in the protocol. Browser Fetch APIs do not expose HTTP/2 trailers. That one line — "the final status arrives in a trailer" — is the entire reason gRPC-Web exists, the entire reason Buf's Connect protocol exists, and a non-trivial part of why Buf exists as a company.

### Header at a glance

- `:method: POST` — always.
- `:scheme: https` (or `http` for plaintext h2c).
- `:path: /Service/Method` — the dotted protobuf service name, slash, the method name.
- `:authority: host:port`.
- `content-type: application/grpc`, sometimes `application/grpc+proto` or `application/grpc+json`.
- `te: trailers` — proxies that do not understand trailers strip this.
- `grpc-encoding: identity | gzip | deflate | snappy` — defaults to identity.
- `grpc-accept-encoding: identity, gzip, deflate, snappy`.
- `grpc-timeout: 100m` — but see the gotcha below.
- `grpc-message-type: package.MessageName` — optional.
- `user-agent: grpc-go/1.76 (...)`.
- Custom metadata: any lowercase `[a-z0-9_.-]+` key. Keys ending `-bin` are base64-encoded binary.

### State machine in three sentences

A gRPC call is one HTTP/2 stream and follows the HTTP/2 stream lifecycle: idle → open → half-closed (in either direction once one side has set `END_STREAM`) → closed. Cancellation at any point is `RST_STREAM`, which the receiver maps to the `CANCELLED` status. A gRPC channel — the client-side abstraction over one or more HTTP/2 connections — has its own lifecycle of name resolution, load balancing, connection backoff (`INITIAL_BACKOFF=1s`, `MULTIPLIER=1.6`, `MAX_BACKOFF=120s`, `JITTER=0.2`), and keepalive PINGs.

### Reliability, security, and streaming mechanics

**Four streaming modes.** Each call is one HTTP/2 stream; the modes differ only in how many length-prefixed messages flow in each direction. Unary: one in, one out. Server-streaming: one in, many out. Client-streaming: many in, one out. Bidirectional: many of both, interleaved freely.

**Seventeen status codes.** OK is 0. CANCELLED is 1. The retryable transient is UNAVAILABLE (14). DEADLINE_EXCEEDED (4) means the deadline ran out, but the work may have completed server-side anyway. RESOURCE_EXHAUSTED (8) is the one engineers hit by accident — usually the 4-MiB message-size cliff. UNAUTHENTICATED is 16. The full list — INVALID_ARGUMENT, NOT_FOUND, ALREADY_EXISTS, PERMISSION_DENIED, FAILED_PRECONDITION, ABORTED, OUT_OF_RANGE, UNIMPLEMENTED, INTERNAL, DATA_LOSS, UNKNOWN — is small enough to memorise.

**Deadlines and propagation.** The wire format is `TimeoutValue TimeoutUnit` where the unit is one of `H` `M` `S` `m` `u` `n` — hours, minutes, seconds, milliseconds, microseconds, nanoseconds — with the value capped at eight digits. So `100m` is 100 milliseconds; `100M` is 100 minutes. A single capital letter changes the value by a factor of 60,000. The runtime converts the deadline to a remaining-time on every hop and forwards what is left, so the whole call chain ends together regardless of clock skew.

**Flow control.** HTTP/2 has per-stream and per-connection windows, advanced by `WINDOW_UPDATE` frames; the default is 65,535 bytes. gRPC-Go layers a Bandwidth-Delay-Product estimator on top, growing the receive window dynamically based on observed throughput times RTT, to dodge the 64-KiB cliff. The default HTTP/2 DATA frame max is 16 KiB; bigger gRPC messages span multiple frames, smaller ones can share one.

**Compression.** Per-message via the one-byte compressed-flag in the framing header. `grpc-encoding` selects the algorithm; `grpc-accept-encoding` advertises what the receiver supports. Per-message granularity matters for streaming RPCs where some messages are already compressed.

**Security.** TLS 1.2 or higher when using TLS, ALPN selecting `h2`. mTLS is the standard service-mesh authentication primitive — Istio, Linkerd, and Consul Connect all inject sidecars that terminate it. Per-RPC credentials ride in the `authorization` metadata header (OAuth, JWT, Google ADC). Inside Google itself, gRPC uses ALTS instead of TLS — Google's mutual-auth replacement based on Protocol Buffers, with identities bound to workload entities rather than hostnames. ALTS is in grpc-go, grpc-c++, and grpc-java for use inside Google's network or on GKE/GCE.

**Retries.** Configured via `methodConfig.retryPolicy`: `maxAttempts`, `initialBackoff`, `maxBackoff`, `backoffMultiplier`, `retryableStatusCodes`. ±20% jitter is automatic. A token-bucket `retryThrottling` policy prevents retry storms — fail an RPC and the bucket decrements, succeed and it increments by `tokenRatio`, and the runtime pauses retries when the bucket falls below half.

## Where it shows up in production

**Google itself.** Every internal service runs Stubby or gRPC, ALTS-secured by default. The ALTS whitepaper records "a constellation of microservices that collectively issue O(10¹⁰) Remote Procedure Calls per second" — on the order of tens of billions per second across the fleet. Tim Burks, an APIs PM at Google, put it more bluntly: "inside Google data centers, ten billion API calls are made every second." The gRPC team is the Stubby team — Richard Belleville, a maintainer, has said that "if you make a micro optimization in Stubby, it can have massive implications for the entire fleet at Google."

**Netflix.** gRPC carries east-west service traffic. The InfoQ writeup of Netflix's membership platform — twelve-plus microservices serving 238 million memberships — describes them communicating "at the HTTP layer" over gRPC.

**Square (now Block).** The first major external collaborator at the 2015 announcement. grpc-java is widely deployed at Block.

**Cloudflare.** Migrated internal Kubernetes service-to-service traffic from REST and Kafka to gRPC. The DNS team reported a 235× reduction in unmarshalling time for large zones — protobuf at 96.4 nanoseconds per op versus JSON at 22,647 nanoseconds per op. Cloudflare also added customer-facing gRPC proxy support at the edge in 2020.

**CockroachDB.** Node-to-node SQL and replication traffic is gRPC.

**Cisco, Juniper, Arista, Ciena.** gNMI streaming telemetry over gRPC for network devices, part of the OpenConfig effort. Network operators stream live state from routers and switches the same way an application streams events to a backend.

**Lyft and Envoy.** Envoy's xDS APIs — LDS, RDS, CDS, EDS, ADS — are all gRPC. Envoy itself terminates and proxies gRPC traffic in countless service meshes.

**NVIDIA Triton, TensorFlow Serving, KServe v2, BentoML.** All expose the KServe v2 Open Inference Protocol over both REST and gRPC; gRPC is the recommended path for high-throughput, low-latency inference and for bidirectional streaming sequence models.

**Service meshes.** Istio's control plane (istiod) speaks xDS gRPC. Linkerd's Rust-based linkerd2-proxy speaks HTTP/2 and gRPC natively. HashiCorp Consul Connect uses the same pattern. Google's Cloud Service Mesh runs proxyless gRPC plus xDS in production preview.

**Container runtimes.** The container runtime interface (CRI), the container storage interface (CSI), the container network interface device plugins, and `containerd` itself are full gRPC over Unix domain sockets. The Kubernetes API server itself is *not* gRPC despite using HTTP/2 plus protobuf — it is "protobuf-over-HTTP/2 REST" — but everything beneath it is.

**Dropbox, Uber, Spotify, Salesforce.** All listed as users on the Wikipedia page; specific public deployment numbers vary in quality.

**A2A, August 2025.** Google's Agent2Agent protocol defaulted to JSON-RPC at launch; v0.3 added optional gRPC transport alongside. By Google Cloud Next 2026, A2A was reported in production at 150 organisations.

## Things that go wrong

The biggest single incident in gRPC's history is HTTP/2 Rapid Reset, which we cover in detail in the HTTP/2 episode. The short version: on August 25, 2023, Cloudflare's automated DDoS systems started seeing legitimate-looking HTTP/2 requests immediately followed by `RST_STREAM`. The HTTP/2 spec says cancellation frees a stream slot, but the *work* of allocating buffers, scheduling the request, and parsing HPACK was already done. A botnet of 20,000 machines generated 201 million requests per second against Cloudflare; AWS absorbed 155 million; Google peaked at **398 million requests per second** — the largest application-layer DDoS in history at the time, on October 10, 2023. Every modern HTTP/2 implementation was affected, gRPC included, because every gRPC call is one HTTP/2 stream. The fix shipped in gRPC Core 1.59.2: count cancelled streams toward a per-connection budget and `GOAWAY` with `ENHANCE_YOUR_CALM` when the budget runs out. The lesson: asymmetric work between client and server is always a DoS vector waiting to happen.

**MadeYouReset, August 13, 2025 — CVE-2025-8671, also tracked as CVE-2025-55163 for the gRPC-specific variant.** A follow-on disclosed by Tel Aviv University researchers with Imperva. The attacker sends *malformed* WINDOW_UPDATE, PRIORITY, or DATA frames that force the server to send `RST_STREAM` against its own connection, bypassing the client-reset rate limits added after Rapid Reset. `grpc-netty-shaded` versions before 1.75.0 are listed as affected; existing Rapid Reset mitigations protected most other major implementations preemptively. The chapter on HTTP/2 covers this in full.

**HPACK proxy poisoning — CVE-2024-7246, August 6, 2024.** A gRPC client talking to an HTTP/2 proxy could poison the HPACK table between the proxy and the backend such that other clients saw failed requests. It was also possible to leak other clients' header keys (not values). Fixed across grpc 1.58.3, 1.59.5, 1.60.2, 1.61.3, 1.62.3, 1.63.2, 1.64.3, and 1.65.4. The kind of bug that only happens when you put a layer between things, and exactly the reason every protocol designer worries about middlebox composition.

**OpenTelemetry Collector compressed bomb — CVE-2024-36129, May 2024.** A crafted zstd-compressed payload over gRPC bypassed the receiver's size check on the OpenTelemetry Collector's `configgrpc` receiver, causing a denial-of-service. Fixed in Collector v0.102.1. The familiar "small compressed input expands enormously" pattern, this time at the observability layer.

**Docker BuildKit gRPC privilege check — CVE-2024-23653, 2024.** A missing privilege check on a BuildKit gRPC endpoint enabled container escape via a crafted `# syntax=` directive in a Dockerfile. A reminder that "internal API" and "trusted API" are not the same thing.

**HTTP/2 CONTINUATION Flood — CVE-2024-27316, April 3, 2024.** Disclosed by Bartek Nowotarski via CERT/CC. CONTINUATION frames carry headers larger than the initial HEADERS frame and are unbounded by default. Patched across Apache httpd, Tomcat, Apache Traffic Server, Envoy, Node.js, Go net/http, nghttp2, AMPHP, Tempesta FW, and gRPC's HTTP/2 stacks.

**containerd permissions — CVE-2024-25621.** Wrong filesystem permissions on `/run/containerd/io.containerd.grpc.v1.cri`, fixed in 1.7.29, 2.0.7, 2.1.5, and 2.2.0.

## Common pitfalls (for the practitioner)

- **The 4-MiB receive cliff.** Default max receive size is 4,194,304 bytes; default send size is unlimited. The error string `ResourceExhausted: grpc: received message larger than max (X vs. 4194304)` is one of the most-Googled gRPC strings on the internet. Configure `MaxRecvMsgSize` and `MaxSendMsgSize` in Go, `MaxReceiveMessageSize` in .NET, `grpc.max_receive_message_length` in Python and C++, on **both ends** — and remember the proxies between them have their own caps (Envoy's `max_request_bytes`, NGINX's `grpc_buffer_size`).

- **L4 load balancers plus long-lived HTTP/2.** gRPC's default load-balancing policy is `pick_first`, which sticks one connection to one backend. Add an L4 LB that hashes by 5-tuple and every RPC from one client lands on one backend, defeating horizontal scaling. The fix is some combination of client-side `round_robin`, an L7 proxy (Envoy with HTTP/2 upstreams), proxyless xDS, or an explicit `MAX_CONNECTION_AGE` server setting that forces clients to reconnect.

- **Missing keepalive — silent connection death.** Without keepalive PINGs or `TCP_USER_TIMEOUT`, a dead TCP connection can sit idle for around fifteen minutes before the kernel notices.

- **Aggressive keepalive — `ENHANCE_YOUR_CALM`.** The opposite failure: ping more often than the server's `MinTime` and the server sends `GOAWAY` with the `ENHANCE_YOUR_CALM` debug data. The recommended client `KEEPALIVE_TIME` is at least five minutes.

- **`grpc-timeout` unit confusion.** `100m` is 100 milliseconds. `100M` is 100 minutes. One capital letter, sixty-thousand-times difference. Read it carefully every time.

- **Forgetting to propagate context.** In Go especially, passing the inbound `ctx` to all downstream calls is the difference between a 100-millisecond client deadline and a multi-second pile-up of doomed work.

- **Forgetting `defer cancel()`.** `context.WithTimeout` returns a cancel function. Skip it and you leak a goroutine and a stream per call.

- **Not setting a deadline at all.** The default is essentially infinity. The grpc.io blog post on the topic is blunt: "TL;DR: Always set a deadline."

- **Reusing protobuf field numbers.** Don't. Never change a field's wire type either — `int32` and `sint32` are different wire types because of ZigZag. Mark removed fields `reserved` so future contributors cannot re-introduce the number. Field numbers 1 through 15 take one tag byte; 16 through 2047 take two; reserve the low numbers for your hot fields.

- **HTTP/2 head-of-line blocking inside one connection.** Streams share one TCP socket; one large slow stream can starve fast small ones at the TCP layer (not the HTTP/2 layer). HTTP/3 fixes this — but gRPC over HTTP/3 is still officially in proposal in May 2026.

- **Header list size.** ~8 KiB default for response headers plus trailers. A chunky `grpc-status-details-bin` payload or aggressive tracing baggage will trip it.

## Debugging it

- **grpcurl** (`fullstorydev/grpcurl`) — curl for gRPC; works against a server with reflection enabled.
- **grpcui** — a browser UI on top of grpcurl.
- **ghz** (`bojand/ghz`) — the canonical command-line load tester for gRPC; produces P50/P95/P99 histograms and JSON suitable for CI gating.
- **buf curl** — supports gRPC, gRPC-Web, Connect, and HTTP/3 via `--http3`.
- **gRPC channelz** (`google.golang.org/grpc/channelz`) — runtime introspection of channels, subchannels, sockets, and per-call state.
- **gRPC reflection** (`grpc.reflection.v1alpha.ServerReflection`) — lets tools discover services without proto files.
- **Wireshark with the HTTP/2 dissector** — decodes HEADERS, DATA, and RST_STREAM frames.
- **Postman gRPC support** — added 2022, now with HTTP/3.
- **Kreya** (kreya.app) — a commercial desktop client.
- **BloomRPC** — deprecated in 2022; do not adopt for new work.
- **OpenTelemetry `otelgrpc` interceptor** (Go: `go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc`) — emits standard spans tagged `rpc.system=grpc`, `rpc.method`, `rpc.grpc.status_code`. gRFC A66 standardised the per-call metric set: `grpc.client.attempt.duration`, `grpc.server.call.duration`, etc.

## What's changing in 2026

- **Native gRPC-Rust, mid-2025.** The gRPC team announced a full-featured Rust implementation in collaboration with Lucio Franco, building atop tonic. First-class support from the gRPC team itself, not a community project.
- **gRPC v1.76 "genuine" shipped October 20, 2025.** Subsequent release-line backronyms include 1.74 *gee*, 1.75 *gemini*, 1.78 *gutsy*, 1.80 *glimmering*. Most engineers still assume the g stands for Google; it has stood for something different in every release since 1.0.
- **Proxyless service mesh via xDS went mainstream — KubeCon EU 2025.** Megan Yahya, Google PM, gave the talk: "With the newest edition of the gRPC protocol, microservices-based systems will no longer need separate stand-alone service mesh sidecars." The gRPC channel itself speaks `xds:///service-name` to an Envoy-compatible control plane; the sidecar disappears, the service-mesh capabilities (load balancing, locality routing, mTLS via SPIFFE, retry policies, circuit breaking) stay.
- **A2A v0.3 added gRPC transport, August 2025.** Google's Agent2Agent protocol shipped optional gRPC alongside its primary JSON-RPC over HTTPS. By Google Cloud Next 2026, A2A was running in production at 150 organisations.
- **Connect joined CNCF, 2024.** Buf donated Connect-RPC, explicitly citing "frustration with the growing complexity and instability they've endured with Google's gRPC projects." The Connect protocol itself runs on plain HTTP/1.1 or HTTP/2 *without trailers*, which is what makes it a viable browser-native alternative.
- **gRPC-over-HTTP/3 is finally usable, but uneven.** The G2 gRFC at `grpc/proposal#256` is still a draft. `grpc-dotnet` has had HTTP/3 in preview since .NET 6 and default-enabled since .NET 8. Tonic (Rust) and ConnectRPC (Go) work via quic-go's late-2024 trailer support. Cronet — Chrome's network stack — supports gRPC over QUIC for mobile. `grpc-go` is the laggard with open issue #5186; `grpc-c++`, `grpc-python`, and `grpc-java` have no HTTP/3.
- **HTTP/2 spec consistency — issue #39267, April 2025.** gRPC's `PROTOCOL-HTTP2.md` still references the old RFC 7540 numbering in places; the issue tracks the inconsistency with RFC 9113's mandatory pseudo-header ordering.
- **CVE backlog continues.** MadeYouReset (CVE-2025-55163 for gRPC, August 2025) was the latest reminder that any HTTP/2 vulnerability ripples through every gRPC implementation. Expect more.
- **gRPConf 2024 in Sunnyvale and gRPConf 2025 under CNCF and the Linux Foundation.** Attendees from Netflix, Apple, Microsoft, Cisco, Coinbase, LinkedIn, Datadog, and Mercari. The 10-year retrospective video — search "Ten Years of gRPC" — is the canonical lookback.
- **Buf Schema Registry.** Now generates SDKs in Go, npm, Maven, Gradle, Swift Package Manager, and Cargo. Acts as a Confluent-compatible schema registry for Kafka via Bufstream. The "make `buf.build/acme/foo` work like `npm install`" problem is mostly solved.
- **AI/ML serving solidly gRPC.** Triton, TF Serving, KServe v2, BentoML — REST stays for browser-debuggable demos; gRPC is the high-throughput path. KServe v2's Open Inference Protocol is gRPC-first and is the de-facto standard for predictive inference workloads.
- **MCP and A2A still default JSON-RPC.** Despite A2A picking up optional gRPC, both AI-agent protocols launched JSON-RPC-first and remain that way. The reasoning is consistent: AI tooling lives in IDEs and CLIs where stdio plus JSON wins, human-readable bytes are a feature, and a JSON-RPC server is dead simple to implement in any language without a code-gen toolchain. The chapter on Protocols for AI Agents and the Story-of-the-Internet chapter on the AI Agent Layer cover this in full.

## Fun facts (host material)

- **The g changes every release.** The file `g_stands_for.md` in the `grpc/grpc` repo lists every expansion. Highlights: 1.0 *gRPC* (the recursive backronym start), 1.1 *good*, 1.4 *gregarious*, 1.20 *godric*, 1.21 *gandalf*, 1.28 *galactic*, 1.29 *gringotts*, 1.45 *gravity*, 1.51 *galaxy*, 1.58 *goku*, 1.62 *guardian*, 1.65 *gnarly*, 1.66 *gladiator*, 1.68 *groovy*, 1.74 *gee*, 1.75 *gemini*, 1.76 *genuine*, 1.78 *gutsy*, 1.80 *glimmering*. Most engineers still assume "Google."

- **Stubby's scale.** "Production systems at Google… collectively issue O(10¹⁰) Remote Procedure Calls per second" — that is on the order of tens of billions per second across the fleet. Tim Burks at Google: "ten billion API calls are made every second" inside their data centers. Every micro-optimisation that lands in Stubby, lands at that scale.

- **The gRPC team is the Stubby team.** Richard Belleville on the Kubernetes Podcast: "If you make a micro optimization in Stubby, it can have massive implications for the entire fleet at Google. So the gRPC team is actually the Stubby team. We needed things to be sufficiently pluggable that we wouldn't cause any downtime by migrating services from Stubby to gRPC. We have really good systems in there that allow us to serve Stubby and gRPC from the same process."

- **One tiny choice locks browsers out.** In 2015, an engineer chose to put the gRPC status code in an HTTP/2 trailer. Browser Fetch APIs do not surface trailers. *That single design choice* is the entire reason gRPC-Web exists, the entire reason Buf's Connect protocol exists, and a non-trivial chunk of the reason Buf exists as a company. As the gRPC blog itself says: "It is currently impossible to implement the HTTP/2 gRPC spec in the browser."

- **"Frame" is overloaded.** The "frame" in HTTP/2 framing — a 9-byte header plus payload at Layer 7 — is unrelated to Ethernet "frames" at Layer 2. Same English word, different OSI layers. Beginners trip on this constantly.

- **Cloudflare's 235× number.** When Cloudflare's DNS team migrated zone parsing from JSON to protobuf, unmarshal time went from 22,647 nanoseconds per op to 96.4 nanoseconds per op. A two-orders-of-magnitude speedup, free, for changing the wire format and nothing else.

- **gRPC has been "Incubating" at CNCF since February 16, 2017.** Ten years and counting. It powers production systems at most of the largest engineering organisations on Earth and has not graduated.

## Where this connects in the book

- **Part Foundations — Chapter "The Layer Model"** — the seven layers and where they blur; gRPC straddles the application and presentation slots and uses HTTP/2 as its session-and-transport substrate.
- **Part Foundations — Chapter "Ports & Sockets"** — the basic addressing model that gRPC inherits from HTTP/2 and TCP.
- **Part Foundations — Chapter "Client-Server vs Peer-to-Peer"** — gRPC is the modern poster child for the controlled-both-sides client-server pattern.
- **Part Foundations — Chapter "Protocols for AI Agents"** — the introduction to MCP and A2A, the new agent layer where JSON-RPC won the default and gRPC is the optional fast path.
- **Part Story of the Internet — Chapter "The AI Agent Layer (2024–)"** — the longer arc: HTTP, gRPC, and GraphQL held the application layer for fifteen years until MCP and A2A arrived in late 2024 and early 2025.
- **Part Transport — Chapter "TCP"** — the reliable byte-stream that everything in gRPC sits on top of, and the source of the head-of-line blocking that gRPC over HTTP/3 will eventually fix.
- **Part Transport — Chapter "SCTP"** — multi-stream, multi-homed; the protocol that lost the deployment war and taught QUIC the lesson SCTP could not apply to itself.
- **Part Web/API — Chapter "HTTP/2"** — the binary, multiplexed substrate gRPC depends on, and the host of the security saga (Rapid Reset, CONTINUATION Flood, MadeYouReset) that gRPC inherits.
- **Part Web/API — Chapter "gRPC"** — the dedicated chapter on why gRPC dominates inside the data center and barely exists in browsers, and what HTTP/2 trailers cost the protocol.

## See also (other protocol episodes)

If you've heard the **HTTP/2 episode**, gRPC is the most demanding tenant on top of HTTP/2 in production. gRPC depends on three HTTP/2 features — streams, HPACK header compression, and trailers — and inherits every HTTP/2 vulnerability. The Rapid Reset, CONTINUATION Flood, and MadeYouReset stories are HTTP/2 stories; gRPC just happened to be sitting on the same bus.

If you've heard the **REST episode**, the contrast is "controlled both sides versus not." REST is an architectural style for the open web with HTTP verbs, resource URIs, and human-debuggable text payloads. gRPC is a service-RPC contract carried on HTTP/2 binary frames, schema-first, binary, HTTP/2-only. gRPC-Gateway gives you REST/JSON-over-HTTP/1.1 façades for gRPC backends when you need to expose internal APIs to browsers.

If you've heard the **SOAP episode**, both are strict-schema RPC styles — but SOAP failed because of WS-* tooling complexity, XML verbosity, and stateful transport. gRPC learned: keep the wire format binary and small, keep the IDL compact, lean on a battle-tested transport (HTTP/2) instead of inventing one. SOAP's grandchildren wear different clothes.

If you've heard the **JSON-RPC episode**, the philosophical sibling is obvious — single endpoint, message-based, structured envelope. The contrast is that gRPC ships a type system, a schema language, and a code-gen toolchain, while JSON-RPC defines only the envelope. JSON-RPC has no schema, no introspection, no field selection. gRPC is JSON-RPC with a type system and a binary wire format and HTTP/2 stapled on.

If you've heard the **MCP episode**, the question "why didn't MCP use gRPC?" is the interesting one. MCP launched in November 2024 with JSON-RPC 2.0 over stdio or Streamable HTTP. The reasoning: AI tools live in IDEs and desktop hosts where stdio is simpler and avoids ports and firewalls; conversational JSON is human-debuggable; JSON-RPC is implementable in any language without a code-gen toolchain. The protocol was created by David Soria Parra and Justin Spahr-Summers at Anthropic.

If you've heard the **A2A episode**, the picture is more nuanced. A2A launched in April 2025 with HTTPS plus JSON-RPC 2.0 plus Server-Sent Events, donated to the Linux Foundation in June 2025, and added optional gRPC transport in v0.3 in August 2025. So both new agent protocols defaulted to JSON-RPC; only A2A has crossed over to also speak gRPC.

If you've heard the **TLS episode**, gRPC mandates TLS 1.2 or higher when using TLS, with ALPN selecting `h2`. Inside Google itself, gRPC uses ALTS — the in-house mutual-auth and transport-encryption protocol that binds identities to workload entities rather than hostnames, designed for containerised, rescheduled microservices.

## Visual cues for image generation

- "A single HTTP/2 connection split into many parallel streams, each one a separate gRPC call, with a tiny five-byte length-prefix sitting in front of every protobuf payload."
- "Side-by-side wire bytes: a 5-byte gRPC framing header (1-byte compressed flag + 4-byte big-endian length) wrapping the 5-byte protobuf for SayHello{name:\"abc\"} = 0a 03 61 62 63."
- "The trailer surprise: a successful gRPC response showing :status 200, then a DATA frame with the protobuf, then a final HEADERS frame carrying grpc-status: 0 — the only mandatory trailer in the protocol."
- "A timeline of the Rapid Reset DDoS in October 2023: 20,000 bots, a single HEADERS-then-RST_STREAM loop, peaking at 398 million requests per second against Google."
- "The grpc-timeout gotcha: the wire string '100m' annotated as 100 milliseconds, with '100M' annotated as 100 minutes — a 60,000× difference from a single capital letter."
- "A proxyless service mesh: gRPC channel on the left talking xDS:///service-name to a control plane on the right, with the Envoy sidecar that used to sit in the middle crossed out."

## Sources

**Specs and proposals**
- [gRPC PROTOCOL-HTTP2.md](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md)
- [gRPC PROTOCOL-WEB.md](https://github.com/grpc/grpc.io/blob/main/content/en/blog/state-of-grpc-web.md)
- [gRPC status codes spec](https://github.com/grpc/grpc/blob/master/doc/statuscodes.md)
- [G2 gRFC — gRPC over HTTP/3](https://github.com/grpc/proposal/blob/master/G2-http3-protocol.md)
- [gRPC connection backoff](https://grpc.github.io/grpc/core/md_doc_connection-backoff.html)
- [g_stands_for.md](https://grpc.github.io/grpc/core/md_doc_g_stands_for.html)
- [PROTOCOL-HTTP2 vs RFC 9113 — issue #39267](https://github.com/grpc/grpc/issues/39267)
- [Connect protocol reference](https://connectrpc.com/docs/protocol/)
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)
- [Protocol Buffers encoding guide](https://protobuf.dev/programming-guides/encoding/)
- [Protocol Buffers proto3 guide](https://protobuf.dev/programming-guides/proto3/)
- [Protocol Buffers editions](https://protobuf.dev/programming-guides/editions/)

**Vendor and engineering blogs**
- [grpc.io — Motivation and Design Principles](https://grpc.io/blog/principles/)
- [grpc.io — gRPC 1.0 GA announcement](https://grpc.io/blog/ga-announcement/)
- [grpc.io — gRPC on HTTP/2](https://github.com/grpc/grpc.io/blob/main/content/en/blog/grpc-on-http2.md)
- [grpc.io — Deadlines](https://grpc.io/docs/guides/deadlines/)
- [grpc.io — Retry guide](https://grpc.io/docs/guides/retry/)
- [grpc.io — Status codes](https://developers.google.com/actions-center/reference/grpc-api/status_codes)
- [grpc.io — Benchmarking](https://grpc.io/docs/guides/benchmarking/)
- [grpc.io — about](https://grpc.io/about/)
- [grpc.io — blog](https://grpc.io/blog/)
- [Google Cloud — gRPC 1.0 announcement](https://cloud.google.com/blog/products/gcp/grpc-a-true-internet-scale-rpc-framework-is-now-1-and-ready-for-production-deployments)
- [Google Cloud — ALTS whitepaper](https://cloud.google.com/docs/security/encryption-in-transit/application-layer-transport-security)
- [Google Cloud — A2A v0.3 adds gRPC](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [Cloudflare — HTTP/2 Rapid Reset technical breakdown](https://blog.cloudflare.com/technical-breakdown-http2-rapid-reset-ddos-attack/)
- [Cloudflare — MadeYouReset](https://blog.cloudflare.com/madeyoureset-an-http-2-vulnerability-thwarted-by-rapid-reset-mitigations/)
- [Cloudflare — Moving Kubernetes to gRPC](https://blog.cloudflare.com/moving-k8s-communication-to-grpc/)
- [Cloudflare — Announcing gRPC](https://blog.cloudflare.com/announcing-grpc/)
- [Buf — Connect, a better gRPC](https://buf.build/blog/connect-a-better-grpc)
- [Buf — Connect joins CNCF](https://buf.build/blog/connect-rpc-joins-cncf)
- [Microsoft — HTTP/3 in .NET 6](https://devblogs.microsoft.com/dotnet/http-3-support-in-dotnet-6/)
- [Microsoft Learn — gRPC troubleshooting](https://learn.microsoft.com/en-us/aspnet/core/grpc/troubleshoot)
- [Microsoft Learn — gRPC security](https://learn.microsoft.com/en-us/aspnet/core/grpc/security)
- [tonic on GitHub](https://github.com/hyperium/tonic)
- [kmcd.dev — gRPC over HTTP/3](https://kmcd.dev/posts/grpc-over-http3/)
- [kmcd.dev — gRPC over HTTP/3 follow-up](https://kmcd.dev/posts/grpc-over-http3-followup/)
- [evanjones.ca — TCP connection timeouts](https://www.evanjones.ca/tcp-connection-timeouts.html)
- [Nexthink — Comparing gRPC performance](https://nexthink.com/blog/comparing-grpc-performance)
- [Tailcall — What is gRPC](https://tailcall.run/blog/what-is-grpc/)
- [Mattermost — Introduction to gRPC](https://mattermost.com/blog/an-introduction-to-grpc/)
- [BairesDev — What is gRPC](https://www.bairesdev.com/blog/what-is-grpc/)
- [Capital One — gRPC for microservices](https://www.capitalone.com/tech/software-engineering/grpc-framework-for-microservices-communication/)
- [Twitch — Twirp announcement](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/)
- [Kreya — Demystifying the protobuf wire format](https://kreya.app/blog/protocolbuffers-wire-format/)
- [DeepWiki — Binary wire format](https://deepwiki.com/protocolbuffers/protocolbuffers.github.io/4.1-binary-wire-format)
- [Google Groups — gRPC-Rust announcement](https://groups.google.com/g/grpc-io/c/ExbWWLaGHjI)
- [The New Stack — Proxyless service mesh](https://thenewstack.io/grpc-delivers-on-the-promise-of-a-proxyless-service-mesh/)
- [Cloud Service Mesh — proxyless overview](https://docs.cloud.google.com/service-mesh/docs/service-routing/proxyless-overview)
- [Ably — gRPC topic](https://ably.com/topic/grpc)
- [Anil BT — gRPC explained](https://anilbt.medium.com/grpc-explained-the-framework-thats-quietly-replacing-rest-838d3366ef6c)
- [tonic timeout source](https://docs.rs/tonic/latest/i686-unknown-linux-gnu/src/tonic/transport/service/grpc_timeout.rs.html)
- [grpclib overview](https://grpclib.readthedocs.io/en/latest/overview.html)
- [Go gRPC codes package](https://pkg.go.dev/google.golang.org/grpc/codes)
- [Hex docs — GRPC.Status](https://hexdocs.pm/grpc/GRPC.Status.html)

**News and security advisories**
- [CISA — HTTP/2 Rapid Reset alert](https://www.cvedetails.com/vulnerability-list/vendor_id-16352/Grpc.html)
- [Qualys — Rapid Reset technical note](https://blog.qualys.com/vulnerabilities-threat-research/2023/10/10/cve-2023-44487-http-2-rapid-reset-attack)
- [CVE Details — gRPC vendor list](https://www.cvedetails.com/vulnerability-list/vendor_id-16352/Grpc.html)
- [grpc-java issue 12416 — MadeYouReset](https://github.com/grpc/grpc-java/issues/12416)
- [OpenTelemetry — CVE-2024-36129](https://opentelemetry.io/blog/2024/cve-2024-36129/)
- [Snyk — CVE-2024-23653 BuildKit](https://labs.snyk.io/resources/cve-2024-23653-buildkit-grpc-securitymode-privilege-check/)
- [SUSE — CVE-2024-25621 containerd](https://www.suse.com/security/cve/CVE-2024-25621.html)
- [Next Web — Google Cloud Next AI agentic era](https://thenextweb.com/news/google-cloud-next-ai-agents-agentic-era)
- [IBM — Agent2Agent protocol](https://www.ibm.com/think/topics/agent2agent-protocol)
- [InfoQ — Managing memberships at Netflix](https://www.infoq.com/articles/managing-memberships-netflix/)
- [DEV Community — Load testing gRPC](https://dev.to/hiisi13/easy-ways-to-load-test-a-grpc-service-1dm3)
- [StackShare — Apache Thrift vs gRPC](https://stackshare.io/stackups/apache-thrift-vs-grpc)
- [Kubernetes Podcast Ep. 94 — gRPC with Richard Belleville](https://kubernetespodcast.com/episode/094-grpc/)
- [Tim Burks — golden ticket Medium post](https://medium.com/apis-and-digital-transformation/i-got-a-golden-ticket-what-i-learned-about-apis-in-my-first-year-at-google-556e1f02f9ab)
- [MCP transports overview](https://modelcontextprotocol.info/docs/concepts/transports/)
- [WorldOfBooks — gRPC: Up and Running](https://www.worldofbooks.com/products/grpc-up-and-running-book-kasun-indrasiri-9781492058335)
- [Translated ALTS whitepaper](https://cloud-google-com.translate.goog/docs/security/encryption-in-transit/application-layer-transport-security?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=tc)

**Wikipedia**
- [Wikipedia — gRPC](https://en.wikipedia.org/wiki/GRPC)
