export interface DiagramDefinition {
	definition: string;
	/**
	 * Overall legend shown at intro state (cursor === -1) and as the diagram-level
	 * description. Markdown-style: **bold** highlights tokens in the protocol's
	 * color, `code` for inline literals.
	 */
	caption: string;
	/**
	 * Optional per-step explanations, indexed by the position the step appears
	 * in source order (0-based, counting only `note` and `message` steps —
	 * block markers like `par`/`loop` are ignored). When provided, these
	 * override the auto-derived caption for that step. Same markdown format
	 * as `caption`.
	 */
	steps?: Record<number, string>;
}

export const diagramDefinitions: Record<string, DiagramDefinition> = {
	// ═══════════════════════════════════════════════════
	// TRANSPORT
	// ═══════════════════════════════════════════════════

	tcp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: 3-way handshake
    C->>S: SYN (seq=100)
    S->>C: SYN-ACK (seq=300, ack=101)
    C->>S: ACK (ack=301)
    Note over C,S: Connection established
    C->>S: Data (seq=101, 50 bytes)
    S->>C: ACK (ack=151)
    C->>S: Data (seq=151, 80 bytes)
    S->>C: ACK (ack=231) + Data
    Note over C,S: Every byte is tracked by sequence numbers
    Note over C,S: Connection teardown
    C->>S: FIN (seq=231)
    S->>C: ACK + FIN (ack=232)
    C->>S: ACK (ack=302)
    Note over C: TIME_WAIT (~60s)`,
		caption:
			'**[[tcp|TCP]]** = Transmission Control Protocol. A {{three-way-handshake|three-way handshake}} opens the connection, **`seq`**/**`ack`** numbers track every byte, and **{{fin|FIN}}** closes it cleanly — the foundation of reliable delivery ([[rfc:793|RFC 793]] / [[rfc:9293|RFC 9293]]).',
		steps: {
			0: "Before any data flows, both sides must agree they're talking. The next three messages — {{syn|SYN}}, {{syn-ack|SYN-ACK}}, **{{ack|ACK}}** — establish that agreement and sync their {{sequence-number|sequence number}} counters.",
			1: '{{syn|SYN}} = synchronize. The client picks a random {{initial-sequence-number|initial sequence number}} (here `100`) and sends it. The *Hey, can we talk?* step.',
			2: "Server replies with its own {{syn|SYN}} (random `seq=300`) plus **{{ack|ACK}}** of the client's {{syn|SYN}}. **`ack=101`** means *next byte I expect is 101*. *Yes, I hear you — can you hear me?*",
			3: "Client **{{ack|ACK}}**s the server's {{syn|SYN}} with `ack=301`. Both sides have now seen each other's starting {{sequence-number|sequence numbers}} — the {{handshake|handshake}} is complete.",
			4: 'The connection is open. {{sequence-number|Sequence-number}} counters are synced on both ends, so every byte from now on can be tracked, ordered, and {{ack|acknowledged}}.',
			5: 'Client sends 50 bytes of application data starting at {{sequence-number|sequence}} **`101`**. The server will track these as bytes `101–150`.',
			6: 'Server replies with **`ack=151`** — *I have received through byte 150; send me byte 151 next.* {{ack|ACKs}} always name the next-expected byte, not the last-received.',
			7: "Client sends another 80 bytes starting at **`151`. Notice it didn't wait for individual {{ack|ACKs}} — [[tcp|TCP]]'s {{sliding-window|sliding window}}** lets multiple {{segment|segments}} be in flight at once.",
			8: 'Server {{piggyback-ack|piggybacks}} an **{{ack|ACK}}** onto its own outgoing data — `ack=231` covers everything through byte 230. Combining {{ack|ACKs}} with data saves a {{rtt|round trip}}.',
			9: 'The sequence/ack accounting is what makes [[tcp|TCP]] reliable. Missing {{ack|ACKs}} trigger {{retransmission|retransmission}}, and out-of-order bytes are reassembled before they reach the application.',
			10: 'Either side can initiate close. The next three messages perform a graceful shutdown — each direction is flushed independently before the connection is torn down.',
			11: "{{tcp-fin|FIN}} = finish. The client signals *I'm done sending*. The server can still send any remaining data on its side.",
			12: "Server **{{ack|ACK}}**s the {{tcp-fin|FIN}} and sends its own {{tcp-fin|FIN}} — *I'm done too*. These are often combined into a single {{segment|segment}}.",
			13: "Client **{{ack|ACK}}**s the server's {{tcp-fin|FIN}}. Both directions are now closed; no more application data can flow on this connection.",
			14: "Client lingers in **{{time-wait|`TIME_WAIT`}}** for ~60 seconds before releasing the {{socket|socket}}. This catches late-arriving {{packet|packets}} so they don't pollute a fresh connection on the same {{port|port}} pair."
		}
	},

	udp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: No handshake — just send
    C->>S: Datagram 1 (42 bytes)
    C->>S: Datagram 2 (38 bytes)
    C->>S: Datagram 3 (45 bytes)
    C-xS: Datagram 4 (lost!)
    C->>S: Datagram 5 (40 bytes)
    Note over S: Received 1, 2, 3, 5 — no retransmit for #4
    Note over C,S: No ACKs, no sequence numbers, no guarantees`,
		caption:
			'**[[udp|UDP]]** = User Datagram Protocol. {{fire-and-forget|Fire-and-forget}} delivery — minimal 8-byte header, no {{handshake|handshake}}, no retransmits. The application is responsible for any reliability it needs ([[rfc:768|RFC 768]]).',
		steps: {
			0: "No setup. The very first {{packet|packet}} carries data — there's no {{syn|SYN}}/{{ack|ACK}} ceremony. This is what makes [[udp|UDP]] fast for [[dns|DNS]] lookups, voice, video, and gaming.",
			4: "{{datagram|Datagram}} 4 is dropped in transit. [[udp|UDP]] doesn't notice and doesn't care — there's no {{retransmission|retransmission}} machinery.",
			6: 'Receiver gets `1, 2, 3, 5` — *out of order possible* and one missing. [[udp|UDP]] delivers what arrives and leaves the rest to the application.',
			7: 'No reliability features at all: no {{ack|ACKs}}, no {{sequence-number|sequence numbers}}, no {{flow-control|flow control}}, no {{congestion-control|congestion control}}. The {{header|header}} is just src/dst {{port|port}}, length, {{checksum|checksum}} — a total of `8 bytes`.'
		}
	},

	quic: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Combined transport + TLS in one handshake
    C->>S: Initial (ClientHello + crypto)
    S->>C: Initial (ServerHello + crypto)
    S->>C: Handshake (certificate + finished)
    C->>S: Handshake finished
    Note over C,S: 1 RTT — data can flow
    C->>S: Stream 1: GET /page (encrypted)
    C->>S: Stream 2: GET /style.css (encrypted)
    S-xC: Stream 1 packet lost (retransmit)
    S->>C: Stream 2 data — unaffected
    Note over C,S: 0-RTT available for returning clients`,
		caption:
			'**[[quic|QUIC]]** = Quick [[udp|UDP]] Internet Connections. Transport + {{encryption|encryption}} fused into one {{handshake|handshake}}. Independent **streams** mean a lost packet only blocks its own stream, not the whole connection ([[rfc:9000|RFC 9000]]).',
		steps: {
			0: 'Where [[tcp|TCP]] needs a separate {{tls-handshake|TLS handshake}} on top, [[quic|QUIC]] merges them — connection setup and {{encryption|encryption}} happen in the same exchange, halving the {{rtt|round trips}}.',
			1: "Client's first flight carries the [[tls|TLS]] {{client-hello|ClientHello}} plus [[quic|QUIC]] connection setup. Already includes its {{key-share|key share}} for the {{handshake|handshake}}.",
			2: 'Server replies with **{{server-hello|ServerHello}}** + {{key-share|key share}} in the same {{initial-packet|Initial packet}}. After this exchange, both sides have shared keys.',
			3: 'Server sends its **{{certificate|Certificate}}** and a {{tls-finished|`Finished`}} message — already {{encryption|encrypted}} with the new keys.',
			4: 'Client confirms it received and verified everything. {{one-rtt|One round trip}} total — application data can now flow.',
			7: 'A {{packet|packet}} on {{stream|Stream}} 1 is lost. In [[tcp|TCP]] this would block *every* stream behind it — **{{head-of-line-blocking|head-of-line blocking}}** at the transport layer.',
			8: "{{stream|Stream}} 2's data delivers immediately. [[quic|QUIC]] {{stream-independence|streams are independent}} — Stream 1's loss doesn't pause Stream 2 while waiting for {{retransmission|retransmission}}.",
			9: 'Returning clients can send data in their first {{packet|packet}} using cached {{session-resumption|session keys}} — **{{zero-rtt|0-RTT}}**. Trades a small {{replay-attack|replay-attack}} risk for a faster connection.'
		}
	},

	sctp: {
		definition: `sequenceDiagram
    participant A as Host A
    participant B as Host B
    Note over A,B: 4-way handshake with cookie (anti-spoofing)
    A->>B: INIT
    B->>A: INIT-ACK (cookie)
    A->>B: COOKIE-ECHO
    B->>A: COOKIE-ACK
    Note over A,B: Multiple independent streams
    A->>B: Stream 1 — control data
    A->>B: Stream 2 — file chunk
    A-xB: Stream 2 — packet lost
    A->>B: Stream 3 — voice (unaffected!)
    Note over A,B: Streams independent + multi-homing for failover`,
		caption:
			'**[[sctp|SCTP]]** = Stream Control Transmission Protocol. [[tcp|TCP]]-like reliability with two superpowers: multiple **independent streams** in one association (no {{head-of-line-blocking|head-of-line blocking}}) and **{{multi-homing|multi-homing}}** for [[ip|IP]]-level {{failover|failover}}. Used as the transport under telecom {{signaling|signaling}} (SIGTRAN) and [[webrtc|WebRTC]] data channels ([[rfc:4960|RFC 4960]] / 9260).',
		steps: {
			0: "Unlike [[tcp|TCP]]'s {{three-way-handshake|three-way}}, [[sctp|SCTP]] uses {{four-way-handshake|four messages}} — the extra {{rtt|round trip}} lets the server hand out a {{cookie|cookie}} *before* committing any state, defeating {{syn-flood|SYN-flood}} attacks.",
			1: "{{init-chunk|INIT}} opens the {{sctp-association|association}}. Includes the client's address list ({{multi-homing|multi-homing}}) and a {{verification-tag|verification tag}}.",
			2: 'Server replies with {{init-ack-chunk|INIT-ACK}} carrying a {{stateless|stateless}} **{{cookie|cookie}}** — a signed token. The server keeps no state yet.',
			3: "Client echoes the {{cookie|cookie}} back ({{cookie-echo|COOKIE-ECHO}}). Only now does the server allocate resources — anyone forging an {{init-chunk|INIT}} couldn't fake the {{cookie|cookie}}.",
			4: 'Server confirms with {{cookie-ack|COOKIE-ACK}}. {{sctp-association|Association}} established, immune to {{syn-flood|SYN-flood}} DoS.',
			7: 'A {{packet|packet}} on {{stream|Stream}} 2 is lost. [[sctp|SCTP]] {{retransmission|retransmits}} it — but only Stream 2 is affected.',
			8: "{{stream|Stream}} 3's voice traffic flows immediately, untouched by Stream 2's recovery. Each {{stream|stream}} has its own ordering — same insight [[quic|QUIC]] later adopted.",
			9: '**{{multi-homing|Multi-homing}}**: the same {{sctp-association|association}} can use multiple network paths. If one [[ip|IP]] fails, traffic reroutes through another without breaking the connection.'
		}
	},

	mptcp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Initial subflow (WiFi)
    C->>S: SYN + MP_CAPABLE (key_A)
    S->>C: SYN-ACK + MP_CAPABLE (key_B)
    C->>S: ACK + MP_CAPABLE
    Note over C,S: Connection established on path 1
    C->>S: Data (subflow 1 — WiFi)
    Note over C,S: Add second subflow (cellular)
    C->>S: SYN + MP_JOIN (token, nonce)
    S->>C: SYN-ACK + MP_JOIN (HMAC)
    C->>S: ACK + MP_JOIN (HMAC)
    Note over C,S: Two paths active simultaneously
    C->>S: Data (subflow 1 — WiFi)
    C->>S: Data (subflow 2 — cellular)
    Note over C,S: WiFi drops — seamless failover
    C->>S: Data (subflow 2 only — no interruption)`,
		caption:
			'**[[mptcp|MPTCP]]** = {{multipath|Multipath}} [[tcp|TCP]]. One logical [[tcp|TCP]] connection spread across **multiple network paths** — same socket, but data flows over WiFi *and* cellular at once. Survives losing either path ([[rfc:8684|RFC 8684]]).',
		steps: {
			0: '[[mptcp|MPTCP]] starts looking exactly like a regular [[tcp|TCP]] {{handshake|handshake}}. The trick is the new **{{mp-capable|`MP_CAPABLE`}}** option that signals *I can do {{multipath|multipath}}*.',
			1: 'Looks like a normal {{syn|SYN}}, but carries an {{mp-capable|`MP_CAPABLE`}} option with `key_A` — a per-host key used later to authenticate additional {{subflow|subflows}}.',
			3: '{{handshake|Handshake}} complete. Both sides exchanged keys — the connection is now *eligible* to add more paths later.',
			5: 'Now the device adds its cellular interface as a second path to the *same* connection. Triggered by app or OS heuristics (signal, cost, {{latency|latency}}).',
			6: '**{{mp-join|`MP_JOIN`}} opens a second {{subflow|subflow}} on the cellular interface. Carries a token (proves it belongs to the existing connection) and a {{nonce|nonce}}** ({{replay-attack|replay protection}}).',
			7: 'Server proves it knows `key_A` by sending an **{{hmac|HMAC}}**. Cryptographic binding stops attackers from sneaking in a fake {{subflow|subflow}}.',
			8: 'Client returns its own {{hmac|HMAC}}. {{subflow|Subflow}} authenticated.',
			12: "WiFi disconnects (e.g., walking out of a café). The [[mptcp|MPTCP]] layer notices and {{failover|shifts all traffic to cellular}} — the app's [[tcp|TCP]] {{socket|socket}} never breaks.",
			13: "Data continues over cellular alone. From the application's view it's the same connection — the most powerful feature of [[mptcp|MPTCP]]."
		}
	},

	// ═══════════════════════════════════════════════════
	// WEB / API
	// ═══════════════════════════════════════════════════

	http1: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: GET /index.html
    S->>C: 200 OK (HTML)
    Note over C: Parse HTML — need more resources
    C->>S: GET /style.css
    S->>C: 200 OK (CSS)
    C->>S: GET /app.js
    S->>C: 200 OK (JS)
    Note over C,S: Head-of-line blocking: each request waits for previous response`,
		caption:
			'**[[http1|HTTP/1.1]]** = the text-based protocol that built the web (1997). A request line + headers + optional body, then a status line + headers + body in reply. {{stateless|Stateless}} {{request-response|request-response}} over [[tcp|TCP]] — one request at a time per connection, so browsers parallelize by opening up to **6 connections per origin**. {{keep-alive|Keep-alive}} re-uses a connection for many requests; {{pipelining|pipelining}} sends them back-to-back but proved fragile in practice ([[rfc:9112|RFC 9112]]).',
		steps: {
			0: '**`GET`** = the request {{http-method|method}} for *fetching* a resource. Safe (no server-side side effects) and **{{idempotent|idempotent}}** (calling twice = calling once), so responses are freely cacheable. The other common methods: **`POST` (create), `PUT` (replace), `PATCH` (partial update), `DELETE` (remove), `HEAD` (GET without body — just headers), `OPTIONS`** (capabilities probe, used in {{cors|CORS}}).',
			1: '**`200 OK` = success with body. [[http1|HTTP]] {{status-code|status codes}} are 3-digit, grouped by hundreds: `1xx`** informational (`100 Continue`), **`2xx`** success (`201 Created`, `204 No Content`), **`3xx`** redirect (`301` permanent, `302` temporary, `304 Not Modified`), **`4xx`** client error (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`), **`5xx`** server error (`500 Internal`, `502 Bad Gateway`, `503 Unavailable`, `504 Gateway Timeout`).',
			2: 'Browser scans the HTML and finds **`<link rel="stylesheet">` (CSS), `<script src="...">` (JS), and `<img src="...">` tags pointing to other URLs. Each becomes a fresh request — and HTML parsing pauses for blocking scripts** until they download and execute.',
			3: "Same [[tcp|TCP]] connection. [[http1|HTTP/1.1]]'s **`Connection: {{keep-alive|keep-alive}}` (the default since 1999) reuses the connection for all requests to the same host, saving the [[tcp|TCP]] + {{tls-handshake|TLS handshake}}** on every fetch. Without keep-alive, each resource would need a brand-new connection.",
			4: 'Response carries {{header|headers}} like **`{{content-type|Content-Type}}: text/css` (so the browser interprets it correctly) and `{{cache-control|Cache-Control}}: max-age=31536000, immutable`** (reuse from cache for a year, never re-validate). Caching is *the* [[http1|HTTP]] performance superpower.',
			5: "Third sequential request on this connection. Even though the browser knew it needed all three resources as soon as the HTML was parsed, [[http1|HTTP/1.1]] can't send them in parallel on one connection. To work around this, browsers open up to 6 concurrent connections per origin — and *{{domain-sharding|domain sharding}}* (serving assets from `static1.example.com`, `static2.example.com`...) was a common 2010s trick.",
			6: 'JS arrives. Conditional requests via **`If-None-Match` + `{{etag|ETag}}` (or `If-Modified-Since` + `Last-Modified`) let the server reply `304 Not Modified` with no body when nothing changed — saves bandwidth on repeat visits. {{content-encoding|Compression}}** via `Content-Encoding: gzip` or `br` (Brotli) shrinks the payload further.',
			7: "Each request must wait for the previous response — **{{head-of-line-blocking|head-of-line blocking}}** at the application layer. The 6-connection workaround helps but doesn't scale. **[[http2|HTTP/2]]** fixed this by {{multiplexing|multiplexing}} all requests as numbered streams over a single [[tcp|TCP]] connection."
		}
	},

	http2: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: TLS + ALPN (h2)
    S->>C: Connection established
    Note over C,S: Single connection — multiplexed streams
    par Stream 1
        C->>S: GET /index.html (stream 1)
    and Stream 2
        C->>S: GET /style.css (stream 2)
    and Stream 3
        C->>S: GET /app.js (stream 3)
    end
    S->>C: HEADERS + DATA (stream 1)
    S->>C: HEADERS + DATA (stream 2)
    S->>C: HEADERS + DATA (stream 3)
    Note over C,S: Header compression (HPACK) + server push`,
		caption:
			'**[[http2|HTTP/2]]** = {{http-method|HTTP}} rebuilt over **multiplexed streams**. All requests share one [[tcp|TCP]] connection and interleave freely as numbered streams. Headers are compressed via {{hpack|HPACK}} ([[rfc:9113|RFC 9113]]).',
		steps: {
			0: '**{{alpn|ALPN}}** = Application-Layer Protocol Negotiation. Inside the {{tls-handshake|TLS handshake}}, the client lists protocols it supports and the server picks one. **`h2`** = [[http2|HTTP/2]].',
			3: 'All three {{http-method|GETs}} go out in parallel as separate {{http2-stream|streams}} (odd-numbered streams are client-initiated). No waiting for the first response. Each [[http2|HTTP/2]] message is carried in {{http2-frame|frames}} like **`HEADERS`** (request/response {{header|headers}}) and **`DATA`** (body).',
			9: "**{{hpack|HPACK}}** compresses repeated {{header|headers}} (common ones become 1-byte indices). **{{server-push|Server push}}** lets the server send resources the client hasn't asked for yet — deprecated in practice."
		}
	},

	http3: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: QUIC handshake + ALPN (h3)
    S->>C: Handshake complete (1 RTT)
    Note over C,S: Independent QUIC streams
    par Stream 1
        C->>S: GET /page (stream 1)
    and Stream 2
        C->>S: GET /css (stream 2)
    and Stream 3
        C->>S: GET /js (stream 3)
    end
    S->>C: DATA (stream 1)
    S-xC: Stream 2 — packet lost (retransmit)
    S->>C: DATA (stream 3) — unaffected!
    Note over C,S: No head-of-line blocking across streams`,
		caption:
			'**[[http3|HTTP/3]]** = {{http-method|HTTP}} over **[[quic|QUIC]]** (which runs on [[udp|UDP]]). Same {{multiplexing|multiplexing}} as [[http2|HTTP/2]], but streams are independent at the *transport* layer too — a lost packet on one stream cannot block others ([[rfc:9114|RFC 9114]]).',
		steps: {
			0: "**`h3`** = [[http3|HTTP/3]] identifier negotiated via {{alpn|ALPN}} inside [[quic|QUIC]]'s combined {{tls-handshake|TLS handshake}}. [[http3|HTTP/3]] uses {{qpack|QPACK}} instead of {{hpack|HPACK}} for {{header|header}} compression — redesigned so streams arriving out of order don't stall decoding.",
			1: "[[quic|QUIC]]'s {{handshake|handshake}} setup + crypto in one {{rtt|round trip}}. Returning clients can do **{{zero-rtt|0-RTT}}**.",
			7: "{{stream|Stream}} 2 loses a {{packet|packet}}. [[http2|HTTP/2]] over [[tcp|TCP]] would block all streams here — [[tcp|TCP]]'s ordered-byte abstraction means stream 1 and 3 wait too.",
			8: "But [[http3|HTTP/3]]'s streams are independent at the [[quic|QUIC]] layer, so {{stream|Stream}} 3 delivers immediately. {{stream|Stream}} 2 {{retransmission|retransmits}} in the background. The headline win over [[http2|HTTP/2]]."
		}
	},

	websockets: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: HTTP GET (Upgrade: websocket)
    S->>C: 101 Switching Protocols
    Note over C,S: Full-duplex connection open
    loop Bidirectional messages
        C->>S: Message (text/binary frame)
        S->>C: Message (text/binary frame)
        S->>C: Push event from server
        C->>S: Client event
    end
    C->>S: Close frame
    S->>C: Close frame`,
		caption:
			'**[[websockets|WebSockets]]** = a persistent **{{full-duplex|full-duplex}}** channel built on top of [[http1|HTTP]]. Begins with an {{http-method|HTTP}} **`101 Switching Protocols`** {{handshake|handshake}}, then both sides {{exchange|exchange}} binary or text **frames** over the same [[tcp|TCP]] connection. Server can push at any time without the client asking — the foundation of live chat, multiplayer games, and collaborative editing ([[rfc:6455|RFC 6455]]).',
		steps: {
			0: 'Starts as a regular [[http1|HTTP]] request with the **`Upgrade: websocket`** {{header|header}} — the {{protocol-upgrade|protocol upgrade}} mechanism. Lets [[websockets|WebSockets]] share {{port|port}} 443 with HTTPS and pass through {{firewall|firewalls}}.',
			1: '**`101 Switching Protocols`** = the only [[http1|HTTP]] {{status-code|status code}} most people see for [[websockets|WebSockets]]. After this, the [[tcp|TCP]] connection is no longer speaking [[http1|HTTP]] — both sides switch to the {{websocket-frame|WebSocket framing}} protocol.'
		}
	},

	grpc: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Typed RPC over HTTP/2
    C->>S: SayHello(name: "Alice")
    Note over C,S: Serialized as Protobuf (compact binary)
    S->>C: HelloReply(message: "Hi Alice!")
    Note over C,S: Streaming variants
    C->>S: Client stream (many requests)
    S->>C: Server stream (many responses)
    C->>S: Bidirectional stream
    S->>C: Bidirectional stream
    Note over C,S: Code generated from .proto service definitions`,
		caption:
			"**[[grpc|gRPC]]** = {{google|Google}}'s high-performance **{{rpc|RPC}}** framework (2015). Methods defined in `.proto` files become typed client and server stubs in 11+ languages; messages travel as compact **Protobuf** {{binary-framing|binary}} over [[http2|HTTP/2]] with {{hpack|HPACK}}-compressed headers and [[tls|TLS]] by default. Four call patterns: unary {{request-response|request-response}}, server-stream, client-stream, bidirectional-stream.",
		steps: {
			0: '**{{rpc|RPC}}** = Remote Procedure Call. Looks like a function call but actually crosses the network. The strong typing comes from the **`.proto`** schema both sides share.',
			1: "Method invocation. Note this isn't {{json|JSON}} — **{{protocol-buffers|Protobuf}}** {{serialization|serializes}} the call by field-number, omitting names and types from the wire format.",
			3: '[[grpc|gRPC]] has four call shapes: unary (one→one), client streaming (many→one), server streaming (one→many), and bidirectional (many↔many) — all on a single [[http2|HTTP/2]] connection.',
			8: 'Run **{{protoc|`protoc`}}** against your `.proto` file and you get type-safe client + server code in C++, Go, Java, Python, Rust, etc. The schema is the source of truth.'
		}
	},

	graphql: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: REST approach — multiple round trips
    C->>S: GET /user/42
    S->>C: { user + unused fields }
    C->>S: GET /user/42/posts
    S->>C: { posts[] + unused fields }
    Note over C,S: GraphQL — one query, exact data
    C->>S: POST /graphql
    Note over C,S: query { user(id:42) { name, posts { title } } }
    S->>C: { "data": exact shape requested }
    Note over C,S: No over-fetching, no under-fetching`,
		caption:
			'**[[graphql|GraphQL]]** = a query language for APIs (Facebook, 2015). The client describes the *shape* of data it wants; the server returns exactly that — no {{over-fetching|over-fetching}}, no under-fetching, no N+1 round trips. Single [[http1|HTTP]] endpoint, typed schema with **queries**, **mutations**, and **subscriptions** (long-lived push, often over [[websockets|WebSockets]]). The [[rest|REST]] alternative when you need flexible shape and a single contract (graphql.org).',
		steps: {
			0: 'Top half of the diagram shows the [[rest|REST]] way: two endpoints, two {{rtt|round trips}}, and each response includes fields you never asked for — classic **{{over-fetching|over-fetching}}** plus the **{{n-plus-one|N+1}}** pattern.',
			5: 'Bottom half: [[graphql|GraphQL]]. One request, one response, exact fields.',
			6: 'Always the same endpoint (`/graphql`). All differentiation lives in the {{graphql-query|query}} body — making {{cdn|CDN}} caching and {{http-method|HTTP-method}} semantics trickier than [[rest|REST]].',
			7: 'The {{graphql-query|query}} *is* the data shape. Field names map directly to the {{graphql-schema|schema}}; the server {{graphql-resolver|resolves}} each field through your code.',
			8: 'Response mirrors the {{graphql-query|query}} structure. No **{{over-fetching|over-fetching}}** (no extra fields), no under-fetching (no second {{rtt|round trip}} needed).'
		}
	},

	sse: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: GET /events (Accept: text/event-stream)
    S->>C: 200 OK (text/event-stream)
    Note over C,S: Connection stays open
    loop Server pushes events
        S->>C: event: update (data: {"id":1})
        S->>C: event: update (data: {"id":2})
        S->>C: event: heartbeat
        S->>C: event: update (data: {"id":3})
    end
    Note over C,S: Auto-reconnects on disconnect (Last-Event-ID)`,
		caption:
			'**[[sse|SSE]]** = Server-Sent Events. The browser opens a long-lived [[http1|HTTP]] connection with `Accept: text/event-stream` and the server **pushes named events** as plain text. One-way (server→client) with built-in auto-reconnect and a `{{last-event-id|Last-Event-ID}}` resume mechanism. Lighter than [[websockets|WebSockets]] when you only need {{server-push|server push}} (WHATWG).',
		steps: {
			0: 'Standard [[http1|HTTP]] request with **`Accept: text/event-stream`** — no special {{protocol-upgrade|protocol upgrade}} needed. Works over [[http1|HTTP/1.1]], [[http2|/2]], [[http3|/3]].',
			1: 'Server returns `200` with **`{{content-type|Content-Type}}: text/event-stream`** and never closes. The body streams forever.',
			7: 'If the connection drops, the browser auto-reconnects and sends the **{{last-event-id|`Last-Event-ID`}}** {{header|header}} so the server can resume from where it left off. Built into the {{eventsource|EventSource API}} for free.'
		}
	},

	'json-rpc': {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: {"method":"subtract","params":[42,23],"id":1}
    S->>C: {"result":19,"id":1}
    C->>S: {"method":"log","params":["hello"]}
    Note over S: Notification — no response
    Note over C,S: Batch request
    C->>S: [call1, call2, notify, call3]
    S->>C: [result1, result2, result3]
    Note over C,S: Transport-agnostic: HTTP, WebSocket, stdio, TCP
    C->>S: {"method":"bad","id":2}
    S->>C: {"error":{"code":-32601},"id":2}`,
		caption:
			'**[[json-rpc|JSON-RPC]]** = a tiny {{rpc|RPC}} protocol where every message is a {{json|JSON}} object. Calls have an `id` and get a result; notifications omit `id` and get nothing back. Used by Bitcoin, Ethereum, [[mcp|MCP]], and the {{lsp|Language Server Protocol}} (jsonrpc.org 2.0).',
		steps: {
			0: 'A call: includes `method` name, `params` array or object, and an `id`. The id pairs the eventual response with this request.',
			1: "Response with the matching `id` and a `result` field. Calls and responses don't have to arrive in order — the id is what matches them.",
			2: 'A **{{notification|notification}}**: no `id`, so no response will come back. Used for fire-and-forget events (logging, telemetry).',
			5: 'Multiple calls can be sent as a {{json|JSON}} array — saves {{rtt|round trips}}. Mix of calls and {{notification|notifications}} is fine.',
			6: "Server returns an array of responses (skipping {{notification|notifications}}). Order isn't guaranteed — match by `id`.",
			7: "[[json-rpc|JSON-RPC]] is just a message format — it doesn't care how the bytes get there. Common transports: [[http1|HTTP]] `POST`, {{websocket-frame|WebSocket frames}}, {{stdio|stdio}} (used by [[mcp|MCP]] and {{lsp|LSP}}), raw [[tcp|TCP]].",
			9: 'Errors return a structured `error` object with a numeric code (here **`-32601`** = method not found). Code ranges are reserved by the spec.'
		}
	},

	mcp: {
		definition: `sequenceDiagram
    participant H as Host (AI App)
    participant S as MCP Server
    Note over H,S: Initialization handshake
    H->>S: initialize (capabilities, clientInfo)
    S->>H: result (capabilities, serverInfo)
    H->>S: notifications/initialized
    Note over H,S: Discovery
    H->>S: tools/list
    S->>H: [{name: "weather", inputSchema: {...}}]
    H->>S: resources/list
    S->>H: [{uri: "file:///data.csv", name: "..."}]
    Note over H,S: Tool invocation
    H->>S: tools/call {name: "weather", args: {city: "NYC"}}
    S->>H: {content: [{type: "text", text: "72°F, sunny"}]}
    Note over H,S: JSON-RPC 2.0 over stdio or Streamable HTTP`,
		caption:
			'**[[mcp|MCP]]** = Model Context Protocol ({{anthropic|Anthropic}}, 2024). The standard way for {{ai|AI}} applications (the **host**) to {{mqtt-connect|connect}} to outside **tools** and **resources** — file systems, databases, APIs. [[json-rpc|JSON-RPC]] 2.0 over **{{stdio|stdio}}** (local subprocess) or [[http1|HTTP]] / [[sse|SSE]] (remote). Capabilities are negotiated up front so the host knows what each server can do (modelcontextprotocol.io).',
		steps: {
			0: 'Every [[mcp|MCP]] session starts with a **{{handshake|handshake}}** so both sides agree on protocol version and what features each supports.',
			1: '{{mcp-host|Host}} opens with **`initialize`** — sends its protocol version, capabilities (e.g., supports streaming?), and basic info about itself.',
			2: 'Server replies with its capabilities (which categories of {{mcp-tool|tools}}/{{mcp-resource|resources}} it provides) and version {{handshake|negotiation}}.',
			3: '**`{{notification|notifications}}/initialized`** confirms the {{mcp-host|host}} is ready. Note the `notifications/` prefix — no `id`, no response expected.',
			4: "Now the {{mcp-host|host}} learns what's available. The server doesn't send everything upfront — the host queries lazily.",
			5: '**`tools/list`** asks for callable {{mcp-tool|tools}}. Each tool has a name, description, and a {{json-schema|JSON Schema}} for its inputs (so the LLM knows how to call it).',
			7: '**`resources/list`** asks for readable data sources. {{mcp-resource|Resources}} are addressed by URI — files, database records, API endpoints — and can be subscribed to for change {{notification|notifications}}.',
			10: '**`tools/call`** is the actual invocation. The LLM (via the {{mcp-host|host}}) chose to call `weather` with `{city: "NYC"}` — the server runs whatever code is behind it.',
			11: "Result comes back as a content array (text, images, embedded {{mcp-resource|resources}}). The {{mcp-host|host}} feeds this into the LLM's next turn."
		}
	},

	a2a: {
		definition: `sequenceDiagram
    participant C as Client Agent
    participant R as Remote Agent
    Note over C,R: Discovery
    C->>R: GET /.well-known/agent.json
    R->>C: Agent Card {skills, capabilities}
    Note over C,R: Task lifecycle
    C->>R: message/send {text: "Find flights..."}
    R->>C: Task {state: "submitted", id: "task-42"}
    R->>C: Task {state: "working", message: "Searching..."}
    R->>C: Task {state: "completed", artifacts: [...]}
    Note over C,R: Or stream via SSE
    C->>R: message/stream {text: "..."}
    R-->>C: SSE: TaskStatusUpdate
    R-->>C: SSE: TaskArtifactUpdate
    Note over C,R: JSON-RPC 2.0 over HTTP(S)`,
		caption:
			'**[[a2a|A2A]]** = Agent-to-Agent. The standard for one {{ai|AI}} agent to **discover** and **delegate work** to another over [[http1|HTTP]]. Built on [[json-rpc|JSON-RPC]] 2.0 with optional [[sse|Server-Sent Events]] streams. Tasks have an explicit lifecycle (`submitted` → `working` → `completed`/`failed`), and agents {{mqtt-publish|publish}} their skills in a public {{agent-card|Agent Card}} at `/.well-known/agent.{{json|json}}` (a2a-protocol.org).',
		steps: {
			1: 'Discovery is just a **{{well-known-uri|well-known URL}}** — `/.well-known/agent.json`. Anyone can fetch it without authentication to learn what an agent does.',
			2: "The **{{agent-card|Agent Card}}** is the agent's public profile: name, what it can do (skills), what it accepts (input schemas, often {{json-schema|JSON Schema}}), how to authenticate, and the API endpoint.",
			4: 'Client agent sends a **`message/send`** — natural-language task plus structured params. The remote agent decides how to break it down.',
			5: '**{{task-lifecycle-a2a|Tasks}}** have an explicit state machine: `submitted` → `working` → (`input-required` or `completed` or `failed`).',
			6: 'Agent reports progress while working. The client can poll, subscribe via [[sse|SSE]], or simply wait.',
			7: '**`completed` state carries artifacts** — the actual deliverables (text, files, structured data). Tasks can produce multiple artifacts.',
			9: 'Same `message/send` semantics, but the client opens an **[[sse|SSE]]** stream to receive real-time updates instead of polling.',
			10: '**`TaskStatusUpdate`** events stream the {{task-lifecycle-a2a|state transitions}} and intermediate messages.',
			11: "**`TaskArtifactUpdate`** events stream artifacts as they're produced — useful for long-running jobs."
		}
	},

	rest: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: GET /users/42 (read)
    S->>C: 200 OK { user data }
    C->>S: POST /users (create)
    S->>C: 201 Created { new resource }
    C->>S: PUT /users/42 (replace)
    S->>C: 200 OK { updated }
    C->>S: DELETE /users/42 (remove)
    S->>C: 204 No Content
    Note over C,S: Stateless — each request carries all context
    Note over C,S: Resources as URLs, actions as HTTP verbs`,
		caption:
			'**[[rest|REST]]** = Representational State Transfer ([[pioneer:roy-fielding|Roy Fielding]], 2000). Resources are URLs; **{{crud|CRUD}}** maps to [[http1|HTTP]] verbs (GET, POST, PUT, DELETE). Each request is **{{stateless|stateless}}** — the server keeps no per-client memory between requests. **{{idempotent|Idempotent}}** verbs can be safely retried; success is reported via {{http-method|HTTP}} {{status-code|status codes}}.',
		steps: {
			0: '**`GET` = read. Safe (no side effects) and {{idempotent|idempotent}}** (calling it twice = calling it once). Cacheable by intermediaries (browsers, {{cdn|CDNs}}, {{proxy|proxies}}).',
			2: '**`POST` = create. Not {{idempotent|idempotent}} — calling twice creates two resources. Returns `201 Created`** with a `Location` {{header|header}} pointing to the new URL.',
			4: '**`PUT`** = replace. {{idempotent|Idempotent}}: PUTting the same body twice has the same effect as once. Sends the *full* representation; **`PATCH`** is the partial-update cousin.',
			6: '**`DELETE`** = remove. {{idempotent|Idempotent}} — once gone, repeated deletes still return success.',
			7: "**`204 No Content`** is the conventional success {{status-code|status code}} when there's nothing meaningful to return — typical for `DELETE` and `PUT`.",
			8: '**{{stateless|Stateless}}** means every request carries everything the server needs — auth tokens, {{cookie|cookies}}, query params. Lets any server in a {{load-balancing|load-balancer}} pool handle any request.'
		}
	},

	// ═══════════════════════════════════════════════════
	// ASYNC / IoT
	// ═══════════════════════════════════════════════════

	mqtt: {
		definition: `sequenceDiagram
    participant P as Publisher
    participant B as Broker
    participant S as Subscriber
    P->>B: CONNECT
    B->>P: CONNACK
    S->>B: SUBSCRIBE "sensor/temp"
    B->>S: SUBACK
    P->>B: PUBLISH "sensor/temp" = 23.5C
    Note over B: Fan-out to all matching subscribers
    B->>S: PUBLISH "sensor/temp" = 23.5C
    P->>B: PUBLISH "sensor/temp" = 24.1C
    B->>S: PUBLISH "sensor/temp" = 24.1C
    Note over P,S: QoS 0 (fire-and-forget), 1 (at-least-once), 2 (exactly-once)`,
		caption:
			'**[[mqtt|MQTT]]** = Message Queuing Telemetry Transport. Tiny **{{pub-sub|publish/subscribe}}** protocol designed for unreliable IoT links. A central **broker** routes messages by **{{topic|topic}}** — publishers and subscribers never talk directly (OASIS [[mqtt|MQTT]]).',
		steps: {
			0: '**`CONNECT`** ({{mqtt-connect|MQTT CONNECT}}) carries the client ID, optional username/password, and a **{{last-will|last-will}}** message the {{broker|broker}} will publish if this client disconnects unexpectedly.',
			2: '**`SUBSCRIBE`** ({{mqtt-subscribe|MQTT SUBSCRIBE}}) registers interest in a {{topic|topic}} pattern. {{topic-wildcard|Wildcards}}: **`+`** matches one level (`sensor/+/temp`), **`#`** matches everything below (`sensor/#`).',
			4: 'Publisher sends a **{{mqtt-publish|PUBLISH}}** to a {{topic|topic}} — it has no idea who (if anyone) is subscribed. Decoupling in time and space is the whole point of {{pub-sub|pub/sub}}.',
			5: 'The {{broker|broker}} fans out to every client whose subscription matches `sensor/temp` — could be 0, 1, or thousands.',
			9: '{{qos|QoS}} trades reliability for overhead: 0 = fire-and-forget ({{at-most-once-delivery|at-most-once}}, [[udp|UDP]]-like), 1 = {{at-least-once-delivery|at-least-once}} (may duplicate), 2 = {{exactly-once-delivery|exactly-once}} (4-step {{handshake|handshake}} per message).'
		}
	},

	amqp: {
		definition: `sequenceDiagram
    participant P as Producer
    participant B as Broker
    participant C as Consumer
    P->>B: Publish message (routing key: "order.new")
    Note over B: Exchange routes by binding rules
    B->>B: Route to matching queue(s)
    B->>C: Deliver message
    C->>B: ACK (processed successfully)
    P->>B: Publish message (routing key: "order.cancel")
    B->>C: Deliver message
    C-xB: NACK (processing failed)
    Note over B: Route to dead-letter exchange
    Note over P,C: Durable queues survive broker restarts`,
		caption:
			'**[[amqp|AMQP]]** = Advanced Message Queuing Protocol. Producers send to an **{{exchange|exchange}}**, which uses **binding rules** to route into named **queues**. Consumers acknowledge each message — failures can be redirected to a {{dead-letter-queue|dead-letter queue}} ([[amqp|AMQP]] 0-9-1).',
		steps: {
			0: "Publisher targets an **{{exchange|exchange}}** with a **{{routing-key|routing key}}** (here `order.new`). Unlike [[mqtt|MQTT]], producers don't pick the queue — the {{exchange|exchange}} decides.",
			1: '{{exchange|Exchange}} types: {{direct-exchange|direct}} (exact key match), **{{topic-exchange|topic}}** (wildcard match), {{fanout-exchange|fanout}} ({{broadcast|broadcast}} to all bound queues), {{headers-exchange|headers}} (match on header dict). Picking the right type is the design choice.',
			4: '**{{ack|ACK}}** tells the {{broker|broker}} *I have safely processed this; you can drop it from the queue.* Until {{ack|ACK}}, the {{broker|broker}} keeps the message and may {{retransmission|redeliver}}.',
			7: "**{{nack|NACK}}** = negative acknowledgement. The consumer couldn't process this message — {{broker|broker}} treats it as failed.",
			8: 'Failed messages can be routed to a {{dead-letter-queue|dead-letter exchange}} for inspection or retry. Critical pattern for production reliability.',
			9: '{{durable-queue|Durable queues}} + persistent messages survive a {{broker|broker}} crash. Trades throughput for safety; usually worth it.'
		}
	},

	stomp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: CONNECT (login, passcode)
    S->>C: CONNECTED (version, server)
    C->>S: SUBSCRIBE /queue/orders (id=0)
    S->>C: RECEIPT (receipt-id)
    C->>S: SEND /queue/orders (body)
    S->>C: MESSAGE (subscription=0, body)
    C->>S: DISCONNECT
    S->>C: RECEIPT
    Note over C,S: Text-based frames: COMMAND + headers + body + null byte`,
		caption:
			'**[[stomp|STOMP]]** = Simple Text Oriented Messaging Protocol. Plain-text frames you can type by hand — `COMMAND` + headers + body + `\\0` — modeled on [[http1|HTTP]]. Built into many message {{broker|brokers}} (RabbitMQ, ActiveMQ) as a friendlier alternative to [[amqp|AMQP]] and a wire format for browser-side messaging libraries via [[websockets|WebSockets]].',
		steps: {
			0: '**`CONNECT`** opens the session. Like an [[http1|HTTP]] {{handshake|handshake}} but the body is a {{stomp-frame|STOMP frame}}, and headers carry credentials.',
			2: "**`SUBSCRIBE`** registers interest in a destination (queue or {{topic|topic}}). The `id` is the client's local handle for this subscription.",
			3: '**`RECEIPT`** is the optional {{ack|acknowledgement}} of any {{stomp-frame|frame}} the client asked the server to confirm — gives {{at-least-once-delivery|at-least-once}} semantics over [[stomp|STOMP]] itself.',
			5: '**`MESSAGE`** is the server delivering content to a subscriber. Subscription id matches what the client gave in `SUBSCRIBE`.',
			8: "Each {{stomp-frame|frame}} is {{plaintext|plaintext}}, line-delimited, terminated by a `\\0` (null) byte. You can debug it with `telnet`. That readability is [[stomp|STOMP]]'s whole pitch."
		}
	},

	coap: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: CON GET /temperature
    Note over C,S: 4-byte header (vs HTTP's ~800 bytes)
    S->>C: ACK 2.05 Content: 23.5C
    Note over C,S: Observe pattern — server pushes on change
    C->>S: GET /temperature (Observe: register)
    S->>C: 2.05 Content: 23.5C (observe seq 1)
    S->>C: 2.05 Content: 24.1C (observe seq 2)
    S->>C: 2.05 Content: 24.8C (observe seq 3)
    Note over C,S: No polling — server notifies on change`,
		caption:
			"**[[coap|CoAP]]** = Constrained Application Protocol. {{http-method|HTTP}}'s design, shrunk for tiny IoT devices: 4-byte header, runs over **[[udp|UDP]]**, optional reliability per message. Same [[rest|REST]] verbs and status codes ([[rfc:7252|RFC 7252]]).",
		steps: {
			0: '**`CON` = {{coap-confirmable|Confirmable}}.** The request asks for an explicit **{{ack|ACK}}** back. The cheap counterpart is **{{coap-confirmable|`NON`}}** (non-confirmable, fire-and-forget).',
			1: "[[http1|HTTP]]'s {{header|headers}} can run hundreds of bytes; [[coap|CoAP]] packs everything into 4 bytes plus compact options. Critical for battery-powered radios.",
			2: "**`2.05 Content`** is [[coap|CoAP]]'s `200 OK` ({{status-code|codes}} are class.detail format, e.g. `4.04` = Not Found).",
			4: '**{{coap-observe|Observe}}** registers the client as interested in changes to this resource — the request stays open conceptually.',
			5: 'Server pushes a new representation whenever the value changes, with an incrementing {{coap-observe|observe}} {{sequence-number|sequence number}}. Detect lost {{notification|notifications}} by gaps in the sequence.',
			8: 'Polling burns radio time and battery. **{{coap-observe|Observe}}** lets devices sleep until the server has something new to say.'
		}
	},

	xmpp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server A
    participant R as Server B
    C->>S: TCP connect + XML stream open
    S->>C: Stream features (STARTTLS, SASL)
    C->>S: STARTTLS → TLS negotiation
    C->>S: SASL auth (SCRAM-SHA-1)
    S->>C: Auth success
    C->>S: Bind resource (alice/phone)
    Note over C,S: Authenticated session ready
    C->>S: <presence/> (I'm online)
    C->>S: <message to="bob@serverb.com">Hi!</message>
    Note over S,R: Server-to-server federation (port 5269)
    S->>R: Route message to Server B
    R->>R: Deliver to bob's connected client
    Note over C,R: Federated messaging — like email routing`,
		caption:
			'**[[xmpp|XMPP]]** = Extensible Messaging and Presence Protocol. Originally **Jabber** (1999). An open {{xmpp-stream|XML stream}} over [[tcp|TCP]] with **federated** routing — different domains relay to each other like email. Hardened over the decades into the substrate of {{google|Google}} Talk, the original WhatsApp, and Nintendo Switch push notifications (its IoT profile lives in XEP-0323/0347). Core protocol is [[rfc:6120|RFC 6120]]; encrypted via {{starttls|STARTTLS}}, with modern {{encryption|end-to-end}} via {{omemo|OMEMO}} (XEP-0384).',
		steps: {
			0: "Client opens a [[tcp|TCP]] {{socket|socket}} and sends `<stream:stream>` — an {{xml|XML}} element that won't be closed until the session ends. The whole conversation is one continuous {{xmpp-stream|XML stream}}.",
			1: "Server replies with **`<stream:features>`** advertising what's available — [[tls|TLS]], {{sasl|SASL}} mechanisms, optional extensions.",
			2: '**{{starttls|`STARTTLS`}}** upgrades the {{plaintext|plaintext}} stream to [[tls|TLS]]. After this, the {{xmpp-stream|XML stream}} restarts inside the encrypted {{tunnel|tunnel}}.',
			3: '**{{sasl|SASL}}** = Simple Authentication and Security Layer. **{{scram|SCRAM}}** lets the server store hashed passwords (not {{plaintext|plaintext}}) while still proving knowledge — modern best practice.',
			5: "**{{xmpp-resource|Resource binding}}** = the user's address gets a per-device suffix (`alice@example.com/phone` vs `/laptop`). Lets messages route to the right device.",
			7: "**{{xmpp-presence|`<presence/>`}}** = *I'm online and available*. Other contacts subscribed to your {{xmpp-presence|presence}} get {{notification|notified}} — the basis for buddy lists.",
			9: 'If `bob@serverb.com` is on a different server, this server connects to {{port|port}} 5269 ({{federation|server-to-server}}) and relays the message — same as [[smtp|SMTP]] relay between {{mta|mail servers}}.'
		}
	},

	kafka: {
		definition: `sequenceDiagram
    participant P as Producer
    participant B as Broker (Leader)
    participant C as Consumer
    P->>B: Metadata request
    B->>P: Cluster map (brokers, topics, partitions)
    P->>B: Produce (topic, partition, batch)
    Note over B: Append to partition log + replicate
    B->>P: ACK (offset=42)
    C->>B: Fetch (topic, partition, offset=0)
    B->>C: Records (offsets 0–42)
    C->>B: OffsetCommit (offset=42, group=analytics)
    Note over B: Consumer group tracks position
    C->>B: Fetch (offset=43)
    B->>C: Records (offsets 43–50)
    Note over P,C: Log is immutable — consumers replay at any offset`,
		caption:
			'**[[kafka|Kafka]]** = a distributed **append-only log** ({{linkedin|LinkedIn}}, 2011). Producers append to a {{topic|topic}} {{partition|partition}}; consumers read by **{{offset|offset}}** at their own pace. Multi-day retention means anyone can replay history — the foundation of {{stream-processing|stream processing}}, event sourcing, and CQRS. **{{exactly-once-delivery|Exactly-once}}** semantics via transactional producer + {{idempotent-consumer|idempotent consumer}} {{offset|offset}} commits.',
		steps: {
			0: 'Client first asks any {{broker|broker}} for the cluster map — which {{broker|broker}} {{kafka-partition-leader|leads}} which {{partition|partition}}. Producers and consumers route directly to {{kafka-partition-leader|leaders}} after this.',
			2: 'Producer sends a batch to a specific ({{topic|topic}}, {{partition|partition}}) {{kafka-partition-leader|leader}}. Picking the {{partition|partition}} (random, round-robin, or by key) decides ordering and parallelism.',
			3: 'The {{kafka-partition-leader|leader}} appends to its log file and replicates to follower {{broker|brokers}}. **{{ack|ACK}}** comes back only after replication — durability tier you choose: **{{kafka-acks|`acks=0/1/all`}}**.',
			4: '**{{offset|Offset}}** = position in the {{partition|partition}} log. The producer learns where its message landed — useful for tracing and {{exactly-once-delivery|exactly-once}}.',
			5: 'Consumer pulls records starting at an {{offset|offset}}. Pull, not push — slow consumers can fall behind without being dropped.',
			7: '**{{kafka-offset-commit|OffsetCommit}}** records *I, group `analytics`, have processed up to 42*. Stored in [[kafka|Kafka]] itself, in a special `__consumer_offsets` {{topic|topic}}.',
			8: 'If a consumer crashes, another in the group resumes from the committed {{offset|offset}} ({{consumer-rebalance|rebalance}}). **{{consumer-group|Consumer groups}}** are how you parallelize work across multiple processes.',
			11: 'The log is immutable — old records stay (until retention expires). Different {{consumer-group|consumer groups}} can read the same data independently. **{{log-replay|Replay}}** is just *reset the {{offset|offset}}*.'
		}
	},

	// ═══════════════════════════════════════════════════
	// REAL-TIME A/V
	// ═══════════════════════════════════════════════════

	webrtc: {
		definition: `sequenceDiagram
    participant A as Peer A
    participant S as Server
    participant B as Peer B
    A->>S: SDP Offer (codecs, media)
    S->>B: SDP Offer (forwarded)
    B->>S: SDP Answer (accepted codecs)
    S->>A: SDP Answer (forwarded)
    Note over A,B: ICE — discover public IPs via STUN
    A->>S: ICE candidates
    B->>S: ICE candidates
    Note over A,B: Direct peer-to-peer connection
    A->>B: Audio/Video (SRTP)
    B->>A: Audio/Video (SRTP)
    Note over A,B: Server only assists setup — media flows P2P`,
		caption:
			'**[[webrtc|WebRTC]]** = real-time video, audio, and data **directly between browsers**. The server only helps peers find each other ({{signaling|signaling}}) — once connected, **media flows {{peer-to-peer|peer-to-peer}}** with no hop through your servers ({{w3c|W3C}} / {{ietf|IETF}}).',
		steps: {
			0: "**[[sdp|SDP]]** = Session Description Protocol. Peer A's offer lists the {{codec|codecs}} it supports, {{port|ports}}, {{encryption|encryption}} keys, and {{ice-candidate|ICE candidates}}.",
			1: "Browsers can't talk directly until they know each other's addresses. Your {{signaling|signaling}} server (any transport — [[websockets|WebSocket]] is typical) just forwards messages between them.",
			2: 'Peer B picks {{codec|codecs}} both sides support and replies with its own [[sdp|SDP]].',
			4: "**{{ice|ICE}}** = Interactive Connectivity Establishment. Each peer asks a **{{stun|STUN}}** server *what's my {{public-ip-address|public IP}} and {{port|port}}?* — needed to traverse home-router {{nat|NAT}}.",
			5: 'Each {{ice-candidate|candidate}} is a possible address pair (host, server-reflexive, or {{turn|relayed}}). Both peers exchange them and try every combination, picking the one that works.',
			7: 'Once a {{ice-candidate|candidate}} pair succeeds, the connection is direct between the browsers — no media touches the server.',
			8: '**{{srtp|SRTP}}** = Secure [[rtp|RTP]]. Audio and video frames flow with {{encryption|end-to-end encryption}}. Whether the server is online or not no longer matters.'
		}
	},

	rtp: {
		definition: `sequenceDiagram
    participant S as Sender
    participant R as Receiver
    Note over S,R: RTP media packet stream
    S->>R: RTP (seq=100, ts=0, payload)
    S->>R: RTP (seq=101, ts=160, payload)
    S->>R: RTP (seq=102, ts=320, payload)
    S-xR: RTP (seq=103 — lost!)
    S->>R: RTP (seq=104, ts=640, payload)
    Note over R: Reorder buffer + jitter compensation
    Note over S,R: RTCP feedback (separate channel)
    R->>S: Receiver Report (loss=1, jitter=5ms)
    S->>R: RTP (lower bitrate — adapting)`,
		caption:
			'**[[rtp|RTP]]** = Real-time Transport Protocol. Carries audio/video over [[udp|UDP]] with sequence numbers and timestamps for reordering. **{{rtcp|RTCP}}** is the companion control channel that reports loss back so the sender can adapt ([[rfc:3550|RFC 3550]]).',
		steps: {
			1: 'Each [[rtp|RTP]] packet carries a **{{sequence-number|sequence number}}** (`seq=100`) for detecting loss/reorder, and a timestamp (`ts=0`) in media units (here, audio sample counts) for playback timing.',
			4: 'Packet 103 is lost. Unlike [[tcp|TCP]], [[rtp|RTP]] does not {{retransmission|retransmit}} — for live media, a late {{packet|packet}} is worthless.',
			5: '104 arrives with the next timestamp. The receiver knows 103 is missing from the gap in `seq`.',
			6: 'Receiver buffers a few packets to reorder ([[udp|UDP]] can deliver out-of-order) and to smooth {{jitter|jitter}} (variable arrival times). Concealment fills small gaps with silence or interpolation — see {{jitter-buffer|jitter buffer}}.',
			7: '**{{rtcp|RTCP}}** = [[rtp|RTP]] Control Protocol. Travels on a separate {{port|port}} and carries quality reports — never the media itself.',
			8: 'Receiver Report tells the sender what fraction of {{packet|packets}} were lost and how much {{jitter|jitter}} was observed.',
			9: 'Sender uses {{rtcp|RTCP}} feedback to adapt — drop the {{bandwidth|bitrate}}, switch {{codec|codec}}, increase {{forward-error-correction|FEC}}. The basis for adaptive video calling.'
		}
	},

	sip: {
		definition: `sequenceDiagram
    participant A as Caller
    participant P as SIP Proxy
    participant B as Callee
    B->>P: REGISTER sip:bob@example.com
    P->>B: 200 OK (registered)
    A->>P: INVITE (SDP offer)
    P->>B: INVITE (SDP offer)
    B->>P: 180 Ringing
    P->>A: 180 Ringing
    B->>P: 200 OK (SDP answer)
    P->>A: 200 OK (SDP answer)
    A->>B: ACK
    Note over A,B: Media flows peer-to-peer (RTP)
    A->>B: BYE
    B->>A: 200 OK`,
		caption:
			'**[[sip|SIP]]** = Session Initiation Protocol. The {{signaling|signaling}} that sets up {{voip|VoIP}} calls — sounds like {{http-method|HTTP}}, looks like email addresses (`sip:bob@example.com`). Once a call is established, the actual audio/video flows separately over **[[rtp|RTP]]** ([[rfc:3261|RFC 3261]]).',
		steps: {
			0: "{{sip-register|REGISTER}} maps a [[sip|SIP]] address (`bob@example.com`) to the device's current {{ip-address|IP}}. The {{sip-registrar|registrar}} is how the {{sip-proxy|proxy}} knows where to ring Bob.",
			2: '{{sip-invite|INVITE}} is the call request. Body carries an [[sdp|SDP]] offer describing what audio/video the caller can send.',
			3: "{{sip-proxy|Proxy}} forwards to all of Bob's registered devices ({{sip-forking|*forking*}}) so every phone he owns can ring at once.",
			4: '**{{sip-180-ringing|`180 Ringing`}}** = {{sip-provisional-response|provisional response}}: I got the {{sip-invite|INVITE}}, the user is being alerted. May arrive multiple times.',
			6: "Bob picks up. **{{sip-200-ok|`200 OK`}} carries Bob's [[sdp|SDP]] answer**, completing the {{codec|codec}}/{{port|port}} negotiation.",
			8: '**{{sip-ack|ACK}}** confirms the {{sip-200-ok|200}} was received. [[sip|SIP]] is {{request-response|request-response}} *except* for {{sip-invite|INVITE}}, which uses this {{three-way-handshake|3-way pattern}} to be safe over [[udp|UDP]].',
			9: 'Now that {{signaling|signaling}} has agreed on {{codec|codecs}} and {{ip-address|IPs}}, media bypasses the {{sip-proxy|SIP proxy}} and flows phone-to-phone (typically as [[rtp|RTP]]).',
			10: 'Either side sends {{sip-bye|BYE}} to hang up. Tears down the call cleanly.'
		}
	},

	hls: {
		definition: `sequenceDiagram
    participant S as Server (CDN)
    participant P as Player
    Note over S: Pre-encoded: 1080p, 720p, 360p segments
    P->>S: GET master.m3u8 (manifest)
    S->>P: Playlist with quality variants
    P->>S: GET 1080p/segment_001.ts
    S->>P: Segment data
    P->>S: GET 1080p/segment_002.ts
    S->>P: Segment data
    Note over P: Bandwidth dropping...
    P->>S: GET 720p/segment_003.ts
    S->>P: Segment data (smaller)
    Note over S,P: Quality adapts to available bandwidth`,
		caption:
			'**[[hls|HLS]]** = {{http-method|HTTP}} Live Streaming ({{apple|Apple}}). Video is pre-chopped into ~6-second `.ts` segments at multiple quality levels; the player picks a level per segment based on {{bandwidth|bandwidth}} — **adaptive bitrate** over plain {{http-method|HTTP}} ([[rfc:8216|RFC 8216]]).',
		steps: {
			0: 'Pre-{{codec|encoding}} is the magic. The same content is encoded ahead of time at e.g. 1080p, 720p, 360p — so any quality can be served instantly.',
			1: '**`.m3u8`** is a plain text playlist (the *master {{manifest|manifest}}*). Lists the variant playlists for each quality level.',
			2: 'Player picks a starting quality based on initial {{bandwidth|bandwidth}} estimate.',
			3: '**`.ts`** = {{mpeg-ts|MPEG-2 Transport Stream}} segment, ~6 seconds of video. Each is a standalone {{http-method|HTTP GET}} — cacheable by any {{cdn|CDN}}.',
			7: "Network slows down. The player measures throughput on each segment and notices it can't keep up at 1080p.",
			8: 'Player switches to 720p for the *next* segment without breaking playback. Switches happen at {{abr-segment-switch|segment boundaries}}, so no buffer disruption.'
		}
	},

	rtmp: {
		definition: `sequenceDiagram
    participant E as Encoder (OBS)
    participant S as RTMP Server
    Note over E,S: TCP + RTMP handshake
    E->>S: C0/C1 (version + timestamp)
    S->>E: S0/S1/S2 (version + timestamp)
    E->>S: C2 (echo)
    Note over E,S: Connection established
    E->>S: connect("live")
    S->>E: _result (connected)
    E->>S: createStream
    S->>E: _result (stream ID=1)
    E->>S: publish("stream-key")
    Note over E,S: Live stream begins
    E->>S: Audio chunks (AAC)
    E->>S: Video chunks (H.264)
    E->>S: Audio + Video interleaved
    Note over E,S: Server transcodes → HLS/DASH for viewers`,
		caption:
			'**[[rtmp|RTMP]]** = Real-Time Messaging Protocol (Macromedia, 2002; later Adobe). Originally Flash; now the de-facto **{{live-stream-ingest|live-stream ingest}}** protocol — your encoder (OBS, Wirecast) pushes a long-lived [[tcp|TCP]] connection to the {{cdn|CDN}} edge, which transcodes the {{codec|codec}} into [[hls|HLS]] / [[dash|DASH]] {{manifest|manifests}} for viewers. Encrypted variant **RTMPS** runs over [[tls|TLS]].',
		steps: {
			1: 'Three-stage {{handshake|handshake}}: {{rtmp-c0-c1-c2|C0}} = {{protocol|protocol}} version byte, {{rtmp-c0-c1-c2|C1}} = 1536 random bytes + timestamp.',
			2: 'Server replies with its own version ({{rtmp-s0-s1-s2|S0}}), random bytes ({{rtmp-s0-s1-s2|S1}}), and an echo of {{rtmp-c0-c1-c2|C1}} ({{rtmp-s0-s1-s2|S2}}) — proves both sides can talk.',
			3: 'Client echoes {{rtmp-s0-s1-s2|S1}} back as {{rtmp-c0-c1-c2|C2}}. {{handshake|Handshake}} done — {{protocol|protocol}}-level conversation can start.',
			5: '**{{rtmp-connect|`connect`}}** specifies the application path on the server (e.g., `live`). Carries optional auth parameters.',
			7: '**{{rtmp-create-stream|`createStream`}}** allocates a logical stream within the connection. [[rtmp|RTMP]] can {{multiplexing|multiplex}} multiple streams; for {{live-stream-ingest|ingest}} you typically use one.',
			9: '**{{rtmp-publish|`publish`}} with the {{rtmp-stream-key|stream key}}** — the secret token that authorizes pushing live audio/video to this channel.',
			13: 'Audio ({{aac|AAC}}) and video ({{h264|H.264}}) are sent as small chunks interleaved on the same [[tcp|TCP]] connection — keeps both streams flowing in lockstep.',
			14: 'Server side: receive [[rtmp|RTMP]], {{transcoding|transcode}} into [[hls|HLS]] or [[dash|DASH]] segments, push to a {{cdn|CDN}}. Viewers get [[hls|HLS]]/[[dash|DASH]] — [[rtmp|RTMP]] is now {{live-stream-ingest|ingest}}-only.'
		}
	},

	sdp: {
		definition: `sequenceDiagram
    participant A as Peer A
    participant Sig as Signaling
    participant B as Peer B
    A->>A: Create SDP offer
    Note over A: v=0, m=audio/video, codecs, ICE
    A->>Sig: Send SDP offer
    Sig->>B: Forward SDP offer
    B->>B: Parse offer, select codecs
    B->>B: Create SDP answer
    Note over B: Matching codecs, own ICE candidates
    B->>Sig: Send SDP answer
    Sig->>A: Forward SDP answer
    Note over A,B: Both sides agree on parameters
    A->>B: Media streams (RTP) begin
    B->>A: Media streams (RTP) begin
    Note over A,B: SDP negotiated codecs, ports, encryption`,
		caption:
			"**[[sdp|SDP]]** = Session Description Protocol. A plain-text format that describes a media session — codecs, ports, IPs, {{encryption|encryption}} keys. Used inside [[sip|SIP]] and [[webrtc|WebRTC]] to negotiate *what's about to be streamed* ([[rfc:8866|RFC 8866]]).",
		steps: {
			1: 'Each line is `key=value`: **`v=0` ({{protocol|protocol}} version), `m=` (media: audio or video, {{port|port}}, {{codec|codec}} list), `c=`** (connection {{ip-address|IP}}), plus {{codec|codec}} parameters and {{encryption|crypto}}.',
			3: "[[sdp|SDP]] is transport-agnostic — it doesn't carry itself, it rides inside something else ([[sip|SIP]] {{sip-invite|INVITE}} body, [[webrtc|WebRTC]] {{signaling|signaling}} channel).",
			5: "{{sdp-offer-answer|Offer/answer pattern}}: B picks {{codec|codecs}} from A's offer and returns only what both support. Negotiation is one {{rtt|round trip}}, no haggling.",
			10: 'Once [[sdp|SDP]] negotiation completes, both sides know which {{codec|codecs}} to use and where to send the bytes — [[rtp|RTP]] {{packet|packets}} start flowing.'
		}
	},

	dash: {
		definition: `sequenceDiagram
    participant S as Server (CDN)
    participant P as Player
    P->>S: GET manifest.mpd
    S->>P: MPD (XML: periods, adaptations, representations)
    Note over P: Parse quality levels (1080p, 720p, 360p)
    P->>S: GET segment_001.m4s (1080p)
    S->>P: Segment data (fMP4)
    P->>S: GET segment_002.m4s (1080p)
    S->>P: Segment data
    Note over P: Bandwidth drops...
    P->>S: GET segment_003.m4s (720p)
    S->>P: Segment data (smaller)
    Note over P: Bandwidth recovers
    P->>S: GET segment_004.m4s (1080p)
    S->>P: Segment data
    Note over S,P: Adaptive bitrate — seamless quality switching`,
		caption:
			'**[[dash|DASH]]** = Dynamic Adaptive Streaming over {{http-method|HTTP}} ({{mpeg-org|MPEG}}, {{iso|ISO}} 23009-1). Same idea as [[hls|HLS]] — segmented video at multiple bitrates over plain {{http-method|HTTP}} — but **{{codec|codec}}-agnostic** and an open standard.',
		steps: {
			0: '**`.mpd`** = {{mpd|Media Presentation Description}}, an [[xml|XML]] {{manifest|manifest}} describing the whole presentation hierarchy.',
			1: "Hierarchy: {{dash-period|Period}} (a chapter) → {{dash-adaptation-set|AdaptationSet}} (a track: video, audio, subtitle) → {{dash-representation|Representation}} (a quality variant). Cleaner abstraction than [[hls|HLS]]'s nested playlists.",
			3: '**`.m4s`** = {{fragmented-mp4|fragmented MP4}} segment. Standard {{isobmff|ISOBMFF}} container — works with any {{codec|codec}} ({{h264|H.264}}, {{h265|H.265}}, {{vp9|VP9}}, {{av1|AV1}}).',
			7: 'Player measures {{bandwidth|bandwidth}} on each segment download. Decision logic varies — *throughput-based*, *buffer-based*, or hybrid ({{abr-bola|BOLA}}, dash.js default).',
			11: '{{bandwidth|Bandwidth}} recovered → switch back up. Switches happen at {{abr-segment-switch|segment boundaries}}; the buffer continues seamlessly.'
		}
	},

	// ═══════════════════════════════════════════════════
	// UTILITIES / SECURITY
	// ═══════════════════════════════════════════════════

	dns: {
		definition: `sequenceDiagram
    participant C as Client
    participant R as Resolver
    participant N as Nameservers
    C->>R: Who is example.com?
    Note over R: Check cache — miss
    R->>N: Ask Root: where is .com?
    N->>R: Try TLD server at x.x.x.x
    R->>N: Ask TLD: where is example.com?
    N->>R: Try auth server at y.y.y.y
    R->>N: Ask Auth: what is example.com?
    N->>R: A record: 93.184.216.34
    R->>C: 93.184.216.34 (cached for TTL)
    Note over C,R: Iterative resolution: Root, TLD, Authoritative`,
		caption:
			'**[[dns|DNS]]** = Domain Name System ([[pioneer:paul-mockapetris|Paul Mockapetris]], 1983). Translates human names (`example.com`) into {{ip-address|IP addresses}}. Hierarchical: 13 **Root** servers know the **TLDs** (`.com`, `.org`...), TLDs know the **Authoritative** servers, those know the actual {{dns-record-types|records}} (A, {{aaaa-record|AAAA}}, {{mx-record|MX}}, {{txt-record|TXT}}, …). Recursive resolvers cache aggressively to amortise lookup cost; modern variants DoH / DoT encrypt the query path ([[rfc:1035|RFC 1035]]).',
		steps: {
			0: 'Client asks its configured {{recursive-resolver|resolver}} (typically your ISP or a public one like `1.1.1.1` or `8.8.8.8`).',
			1: 'First, the {{recursive-resolver|resolver}} checks its cache. Roughly 80% of real-world queries are answered here without a single network packet.',
			2: "{{iterative-resolution|Iterative resolution}}: the {{recursive-resolver|resolver}} walks the tree itself. Each {{nameserver|nameserver}} answers *go ask this other server*, not *here's the final answer*.",
			3: "{{root-server|Root servers}} don't know `example.com` — they only know which servers run `.com`. Returns the {{ip-address|IP}} of a {{tld|TLD}} {{nameserver|nameserver}}.",
			5: "{{tld|TLD}} doesn't know the records either, just who's {{authoritative-nameserver|authoritative}} for `example.com` (set by the registrar at registration time).",
			7: '{{a-record|A record}} = the IPv4 address. Other {{dns-record-types|record types}}: {{aaaa-record|AAAA}} ([[ipv6|IPv6]]), {{mx-record|MX}} (mail), {{cname-record|CNAME}} (alias), {{txt-record|TXT}} (verification, SPF), {{ns-record|NS}} (delegation).',
			8: "{{recursive-resolver|Resolver}} caches the answer for the record's **{{ttl|TTL}}** (Time To Live). Subsequent queries for `example.com` return instantly."
		}
	},

	tls: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: TLS 1.3 — one round trip
    C->>S: ClientHello (ciphers, key share)
    S->>C: ServerHello (chosen cipher, key share)
    S->>C: Certificate + CertificateVerify
    S->>C: Finished
    C->>S: Finished
    Note over C,S: Encrypted tunnel established
    C->>S: Application data (encrypted)
    S->>C: Application data (encrypted)
    Note over C,S: Returning clients: 0-RTT with cached keys`,
		caption:
			'**[[tls|TLS]]** = Transport Layer Security. Encrypts everything above it (HTTPS, secure [[smtp|SMTP]], etc.). [[tls|TLS]] 1.3 setup is a single round trip — {{handshake|handshake}} + first encrypted byte happen together ([[rfc:8446|RFC 8446]]).',
		steps: {
			1: '**{{client-hello|ClientHello}}** lists the {{cipher-suite|cipher suites}} the client supports plus a key share (its half of a {{diffie-hellman|Diffie-Hellman}} exchange). The keyshare bit is the [[tls|TLS]] 1.3 trick that saves a {{rtt|round trip}}.',
			2: '**{{server-hello|ServerHello}}** picks one {{cipher-suite|cipher}} and sends its own key share. After this exchange, both sides can derive the shared secret — the {{tls-handshake|handshake}} itself is now {{encryption|encrypted}}.',
			3: "**{{certificate|Certificate}}** proves the server is who it claims to be (signed by a trusted {{certificate-authority|CA}}). {{tls-certificate-verify|CertificateVerify}} signs the {{tls-handshake|handshake transcript}} with the cert's {{private-key|private key}} — proves the server actually owns it.",
			4: '{{tls-finished|Finished}} is a {{hmac|MAC}} over the entire {{tls-handshake|handshake}} — confirms nothing in the negotiation was tampered with.',
			9: 'On reconnect, **{{zero-rtt|0-RTT}}** lets the client send data in its first {{packet|packet}} using a key derived from a previous {{session-resumption|session}}. Trades {{replay-attack|replay-attack}} resistance for one less {{rtt|round trip}}.'
		}
	},

	ssh: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: SSH-2.0-OpenSSH_9.0
    S->>C: SSH-2.0-OpenSSH_9.0
    Note over C,S: Key exchange (Diffie-Hellman)
    C->>S: KEX_INIT (algorithms list)
    S->>C: KEX_INIT (algorithms list)
    C->>S: DH key exchange
    S->>C: DH reply + host key
    Note over C: Verify server fingerprint
    C->>S: Auth request (publickey)
    S->>C: Auth success
    Note over C,S: Encrypted session ready
    C->>S: Channel open (shell)
    S->>C: Channel confirm`,
		caption:
			'**[[ssh|SSH]]** = Secure Shell. Encrypted remote shell, file transfer, and tunneling (Tatu Ylönen, 1995). **Diffie-Hellman key {{exchange|exchange}}** establishes a shared secret over an open network, **host key verification** stops {{man-in-the-middle|MITM}}, then user auth (public-key or password) grants access. Modern {{aead|AEAD}} ciphers ({{chacha20-poly1305|ChaCha20-Poly1305}}, {{aes-gcm|AES-GCM}}) protect every byte ([[rfc:4253|RFC 4253]]).',
		steps: {
			0: "Both sides advertise their version string in {{plaintext|plaintext}}. Used to negotiate features and as input to the {{handshake|handshake}}'s {{hmac|MAC}}.",
			3: '{{ssh-kex-init|KEX_INIT}} lists the algorithms each side supports for {{ssh-key-exchange|key exchange}}, {{ssh-host-key|host-key}}, {{encryption|encryption}}, {{hmac|MAC}}, and compression. Both sides pick the strongest mutual choice.',
			5: "{{diffie-hellman|Diffie-Hellman}} lets both sides derive a shared session key without ever sending it. An eavesdropper can't recover it even with the full transcript.",
			6: "Server's {{ssh-host-key|host key}} identifies *this server* across reboots. The user's `known_hosts` file pins it — that's the {{ssh-tofu|TOFU}} (trust on first use) prompt the first time you connect.",
			8: 'Authentication is separate from {{ssh-key-exchange|key exchange}}. Common methods: {{ssh-publickey-auth|`publickey`}} (your local [[ssh|SSH]] key), `password`, {{ssh-keyboard-interactive|`keyboard-interactive`}} (2FA prompts).',
			11: '{{ssh-channels|Channels}} {{multiplexing|multiplex}} multiple sessions inside one [[ssh|SSH]] connection — interactive shell, file transfer ({{sftp|SFTP}}), {{port-forwarding|port forwarding}}, all on the same [[tcp|TCP]] {{socket|socket}}.'
		}
	},

	dhcp: {
		definition: `sequenceDiagram
    participant D as Device
    participant S as DHCP Server
    Note over D: No IP address yet
    D->>S: DISCOVER (broadcast: "I need an IP")
    S->>D: OFFER 192.168.1.42 (lease: 24h)
    D->>S: REQUEST 192.168.1.42 ("I'll take it")
    S->>D: ACK (IP + gateway + DNS + subnet)
    Note over D,S: Device configured — ready to communicate
    Note over D,S: Lease renewal at 50% expiry (12h mark)`,
		caption:
			'**[[dhcp|DHCP]]** = Dynamic Host Configuration Protocol. Plug a device into a network, it gets an {{ip-address|IP address}}, gateway, [[dns|DNS]], and {{subnet|subnet}} mask without manual config. The four messages spell **{{dora|DORA}}**: Discover, Offer, Request, Ack ([[rfc:2131|RFC 2131]]).',
		steps: {
			0: "The device has no {{ip-address|IP}}, no gateway, no [[dns|DNS]] — it can't even ask a specific server for help. The only thing it can do is **{{broadcast|broadcast}}**.",
			1: '{{dhcp-discover|DISCOVER}} is a {{broadcast|broadcast}} (`255.255.255.255` from `0.0.0.0`). Every [[dhcp|DHCP]] server on the {{lan|LAN}} can hear it; usually only one responds.',
			2: 'Server {{dhcp-offer|OFFERs}} a specific {{ip-address|IP}} from its pool, with a {{dhcp-lease|lease}} duration. Multiple servers might offer — the device picks one.',
			3: "{{dhcp-request|REQUEST}} confirms which {{dhcp-offer|offer}} the device accepted (also {{broadcast|broadcast}}, so other servers know to release their offers). Includes the chosen server's identifier.",
			4: '**{{dhcp-ack|ACK}}** confirms the {{dhcp-lease|lease}} and includes the network config: {{subnet|subnet}} mask, {{default-gateway|default gateway}}, [[dns|DNS]] servers, lease time. Device is now on the network.',
			6: 'Devices try to renew at the halfway point (`T1`). If renewal fails, they try again at `T2` (~87.5%). If still nothing, they {{dhcp-discover|DISCOVER}} again before the {{dhcp-lease|lease}} expires.'
		}
	},

	ntp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as NTP Server
    Note over C: Clock may have drifted
    C->>S: NTP Request (T1=send time)
    Note over S: T2=receive, T3=reply time
    S->>C: NTP Response (T1, T2, T3)
    Note over C: T4=receive time
    C->>S: NTP Request (second sample)
    S->>C: NTP Response
    Note over C,S: Offset = ((T2-T1)+(T3-T4))/2
    Note over C,S: Multiple samples — accuracy within 1-10ms`,
		caption:
			"**[[ntp|NTP]]** = Network Time Protocol ([[pioneer:david-mills|David L. Mills]], 1985). Keeps every device's clock within milliseconds of true time — the foundation of logs, [[tls|TLS]] {{certificate|certificates}}, and distributed systems. The trick is **four timestamps per {{exchange|exchange}}** (T1/T2/T3/T4) which cancel out network {{latency|latency}} and recover the one-way {{offset|offset}}. Runs over [[udp|UDP]]/123; modern hardening via **{{nts|NTS}}** (Network Time Security, [[rfc:8915|RFC 8915]]).",
		steps: {
			0: "Crystal oscillators {{clock-drift|drift}} — even good ones gain or lose seconds per day. Without [[ntp|NTP]], your machine's clock would be hours off after a few months.",
			1: 'Client records **`T1`** when it sends the request. T1 travels in the packet.',
			2: 'Server stamps **`T2` when the request arrives, then `T3`** when the reply leaves.',
			3: 'Reply carries all three timestamps. Client records **`T4`** on receive.',
			7: '{{offset|Offset}} = ((T2−T1) + (T3−T4)) / 2. The math cancels out one-way network {{latency|latency}} on the assumption that send and receive paths take roughly equal time.',
			8: "Several samples are gathered. {{marzullos-algorithm|Marzullo's algorithm}} discards outliers and picks the most accurate — typical accuracy is 1–10 ms on a {{lan|LAN}}."
		}
	},

	smtp: {
		definition: `sequenceDiagram
    participant C as Mail Client
    participant S as Sender MTA
    participant R as Recipient MTA
    C->>S: EHLO + STARTTLS
    S->>C: 250 OK (capabilities)
    C->>S: MAIL FROM + RCPT TO + DATA
    S->>C: 250 OK — queued for delivery
    Note over S,R: Relay via DNS MX record lookup
    S->>R: EHLO + forward message
    R->>S: 250 OK — delivered to mailbox
    Note over C,R: Store-and-forward: email hops through MTAs`,
		caption:
			'**[[smtp|SMTP]]** = Simple Mail Transfer Protocol. The protocol that **sends** email between mail servers, designed by [[pioneer:jon-postel|Jon Postel]] in 1982 ([[rfc:5321|RFC 5321]]). Each server is an **{{mta|MTA}}** (Mail Transfer Agent); the message hops along — {{ehlo|EHLO}} → {{smtp-mail-from|MAIL FROM}} → {{smtp-rcpt-to|RCPT TO}} → {{smtp-data|DATA}} — until it reaches the recipient. Modern hops are encrypted via {{starttls|STARTTLS}} and authenticated by {{spf|SPF}} / {{dkim|DKIM}} / {{dmarc|DMARC}}.',
		steps: {
			0: '**{{ehlo|EHLO}}** = Extended HELLO (introduces the client). **{{starttls|STARTTLS}}** upgrades the {{plaintext|plaintext}} connection to [[tls|TLS]] — modern {{mta|MTAs}} require it.',
			1: 'Server replies with the capabilities it supports ({{pipelining|PIPELINING}}, AUTH methods, max message size, etc.) — discovered, not assumed.',
			2: 'Three commands send the {{smtp-envelope|envelope}}: **`MAIL FROM` (sender), `RCPT TO` (recipient), `DATA`** (the actual message body, ending with a `.` on its own line).',
			4: "Sender's {{mta|MTA}} looks up the recipient domain's **{{mx-record|MX record}}** in [[dns|DNS]] — the address of the receiving {{mta|MTA}}. *That's how mail finds its destination.*",
			5: 'Same {{ehlo|EHLO}}/MAIL/RCPT/DATA dance, just {{mta|MTA}}-to-{{mta|MTA}}. The message can {{hop|hop}} through several relays before reaching the final mailbox.',
			6: '[[smtp|SMTP]] only delivers. To *read* the mail, the recipient uses **[[imap|IMAP]]** or **{{pop3|POP3}}** (or a webmail UI on top).',
			7: '**{{store-and-forward|Store-and-forward}}** means each {{mta|MTA}} accepts full responsibility for the message — if the next {{hop|hop}} is down, it queues and retries.'
		}
	},

	ftp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as FTP Server
    Note over C,S: Control channel (port 21)
    C->>S: USER anonymous
    S->>C: 331 Password required
    C->>S: PASS ****
    S->>C: 230 Login OK
    C->>S: PASV (request passive mode)
    S->>C: 227 Entering passive (port 5001)
    Note over C,S: Data channel (port 5001)
    C->>S: RETR document.pdf
    S->>C: 150 Opening data connection
    S->>C: [file data stream]
    S->>C: 226 Transfer complete
    Note over C,S: Dual-channel: commands on 21, data on separate port`,
		caption:
			'**[[ftp|FTP]]** = File Transfer Protocol (1971 — older than email). Unique in using **two [[tcp|TCP]] connections**: one for commands, a separate one for the actual file bytes. That dual-channel design predates {{nat|NAT}} and causes endless {{firewall|firewall}} headaches today ([[rfc:959|RFC 959]]).',
		steps: {
			1: '**`USER` + `PASS`** is {{plaintext|plaintext}} authentication. Modern alternatives: **{{ftps|FTPS}}** ([[ftp|FTP]] over [[tls|TLS]]) or **{{sftp|SFTP}}** (file transfer over [[ssh|SSH]] — totally different protocol).',
			5: '**`PASV`** = {{ftp-active-passive|passive mode}}. The default *{{ftp-active-passive|active}}* mode has the server connecting back to the client — broken behind {{nat|NAT}}. `PASV` flips it: client opens both connections.',
			6: 'Server picks a random {{port|port}} (here `5001`) and tells the client *connect to me here for the data*.',
			8: '**`RETR`** (retrieve) starts the file download. The actual bytes flow on the data connection, not this one.',
			10: 'File data streams over the separate data connection. Control connection stays open and can carry status updates.',
			11: '**`226`** = transfer complete on data channel. Data connection closes; control connection stays open for the next command.'
		}
	},

	imap: {
		definition: `sequenceDiagram
    participant C as Mail Client
    participant S as IMAP Server
    C->>S: Connect (TLS on port 993)
    S->>C: * OK IMAP4rev2 ready
    C->>S: A001 LOGIN user@example.com ****
    S->>C: A001 OK LOGIN completed
    C->>S: A002 SELECT INBOX
    S->>C: * 47 EXISTS, * 2 RECENT
    S->>C: A002 OK [READ-WRITE] SELECT done
    C->>S: A003 FETCH 47 (ENVELOPE BODY[TEXT])
    S->>C: * 47 FETCH (subject, from, body...)
    S->>C: A003 OK FETCH completed
    C->>S: A004 IDLE
    S->>C: + idling
    Note over S,C: Server pushes * 48 EXISTS on new mail`,
		caption:
			'**[[imap|IMAP]]** = Internet Message Access Protocol. The modern way to **read** mail (vs {{pop3|POP3}} which downloads + deletes). Mail stays on the server, multiple clients see the same state via *server-side* folders and flags, and the server can push new-message notifications via the **{{imap-idle|IDLE}}** command — a long-lived [[tcp|TCP]] connection that the server breaks to signal change. Encrypted via {{starttls|STARTTLS}} or **{{imaps|IMAPS}}** ([[tls|TLS]] on port 993) ([[rfc:9051|RFC 9051]]).',
		steps: {
			1: 'Untagged response (starts with **`*`**) is server-initiated info — capability greetings, mailbox state, push {{notification|notifications}}. Tagged responses ({{imap-tag|`A001`, `A002`}}...) are answers to specific commands.',
			2: 'Each command starts with a client-chosen **{{imap-tag|tag}}** (`A001`). Lets responses come back out-of-order — the {{imap-tag|tag}} matches them up.',
			4: '**{{imap-select|`SELECT`}}** opens a mailbox for reading. Server immediately pushes its current state — message count, recent count, flags.',
			7: '**{{imap-fetch|`FETCH`}}** with parts in parens lets you ask for *exactly* what you need — envelope, headers, a specific **{{mime|MIME}}** part — without downloading the whole message.',
			10: '**{{imap-idle|`IDLE`}}** parks the connection in *waiting* mode. The server can now push {{notification|notifications}} when new mail arrives, no polling needed.'
		}
	},

	bgp: {
		definition: `sequenceDiagram
    participant A as Router A (AS 65001)
    participant B as Router B (AS 65002)
    Note over A,B: TCP connection on port 179
    A->>B: OPEN (AS 65001, Hold=90)
    B->>A: OPEN (AS 65002, Hold=90)
    A->>B: KEEPALIVE
    B->>A: KEEPALIVE
    Note over A,B: Session Established
    A->>B: UPDATE (announce 192.168.0.0/16)
    B->>A: UPDATE (announce 172.16.0.0/12)
    Note over A,B: Routing tables updated
    A->>B: KEEPALIVE (every ~30s)
    A->>B: UPDATE (withdraw 192.168.100.0/24)
    Note over A,B: Route removed from B's table`,
		caption:
			'**[[bgp|BGP]]** = Border Gateway Protocol ([[pioneer:yakov-rekhter|Yakov Rekhter]] et al., 1989). The protocol that holds the internet together — routers in different **{{autonomous-system|Autonomous Systems}}** (ISPs, big companies) tell each other which {{ip-address|IP}} ranges they can reach. Path-vector design: every advertisement carries the {{as-path|AS_PATH}} for loop detection and policy. Origin-secured by {{rpki|RPKI}} since ~2012 ([[rfc:6480|RFC 6480]]); [[rfc:4271|RFC 4271]] defines BGP-4 itself.',
		steps: {
			0: "Runs over [[tcp|TCP]] port 179 between two router neighbors that have been manually configured to {{peering|peer}} with each other. There's no auto-discovery on the public internet.",
			1: "{{autonomous-system|AS = Autonomous System}}: one organization's network, identified by a number ({{asn|ASN}}). {{bgp-open|OPEN}} carries this AS number plus a {{hold-timer|hold timer}} — how long to wait without a {{bgp-keepalive|keepalive}} before declaring the peer dead.",
			3: '{{bgp-keepalive|KEEPALIVE}} is a tiny heartbeat — proves the peer is alive even when nothing is changing.',
			6: '{{bgp-update|UPDATE}} announces a route: *I can reach `192.168.0.0/16` — send packets to me.* Includes the {{as-path|AS_PATH}} showing every {{autonomous-system|AS}} the announcement traveled through (loop prevention).',
			9: 'Quiet links still need {{bgp-keepalive|keepalives}} every ~30s so peers know each other are alive.',
			10: '{{bgp-update|Withdraw}} removes a previously announced route — *that prefix is no longer reachable through me.* Triggers global recomputation.'
		}
	},

	icmp: {
		definition: `sequenceDiagram
    participant S as Source
    participant R as Router (hop 1)
    participant T as Target
    Note over S,T: Ping — Echo Request/Reply
    S->>T: Echo Request (Type 8, seq=1)
    T->>S: Echo Reply (Type 0, seq=1) — 12ms
    S->>T: Echo Request (Type 8, seq=2)
    T->>S: Echo Reply (Type 0, seq=2) — 11ms
    Note over S,T: Traceroute — incrementing TTL
    S->>R: Echo Request (TTL=1)
    R->>S: Time Exceeded (Type 11, TTL expired)
    S->>T: Echo Request (TTL=2)
    T->>S: Echo Reply — destination reached
    Note over S,T: Each hop revealed by TTL expiry`,
		caption:
			"**[[icmp|ICMP]]** = Internet Control Message Protocol ([[pioneer:jon-postel|Jon Postel]], 1981). The internet's diagnostic and error-reporting layer, riding directly on [[ip|IP]] (protocol 1). **`{{ping|ping}}`** measures {{rtt|round-trip time}} via {{echo-request|Echo Request}} / {{echo-reply|Echo Reply}}; **`{{traceroute|traceroute}}`** maps the path by sending packets with increasing **{{ttl|TTL}}** and reading the Time-Exceeded replies from each {{hop|hop}}. {{path-mtu-discovery|PMTUD}} uses {{fragmentation|Fragmentation}}-Needed [[icmp|ICMP]] to negotiate the path {{mtu|MTU}} ([[rfc:792|RFC 792]]).",
		steps: {
			1: '{{echo-request|Echo Request}} = {{ping|ping}}. Type 8, identifier + {{sequence-number|sequence number}}, optional payload (helpful to detect {{mtu|MTU}} issues if you fill it with bytes).',
			2: "{{echo-reply|Echo Reply}} = pong. Type 0, copies the request's identifier and seq back so you can pair them. The time difference is your {{rtt|round-trip time}}.",
			6: '**{{ttl|TTL}}** = Time To Live. Decrements by 1 at every router. Setting TTL=1 guarantees the very first router will drop the packet.',
			7: "When {{ttl|TTL}} hits 0, the dropping router sends back an [[icmp|ICMP]] {{time-exceeded|Time Exceeded}} with its own {{ip-address|IP}}. Now you know {{hop|hop}} #1's address.",
			8: "Increment {{ttl|TTL}} → next {{hop|hop}} drops it → next hop's address revealed. Walk all the way to the destination this way.",
			9: "Eventually {{ttl|TTL}} is high enough to reach the target — you get an {{echo-reply|Echo Reply}} instead of {{time-exceeded|Time Exceeded}}. That's how {{traceroute|traceroute}} knows it's done."
		}
	},

	// ═══════════════════════════════════════════════════
	// NETWORK FOUNDATIONS
	// ═══════════════════════════════════════════════════

	ethernet: {
		definition: `sequenceDiagram
    participant A as Host A
    participant SW as Switch
    participant B as Host B
    Note over A,B: ARP resolves IP → MAC first
    A->>SW: ARP Broadcast (who has 192.168.1.50?)
    SW->>B: ARP Broadcast (flooded to all ports)
    B->>SW: ARP Reply (I'm 00:1B:2C:3D:4E:5F)
    SW->>A: ARP Reply (forwarded, MAC learned)
    Note over SW: MAC table: Port 1→Host A, Port 3→Host B
    Note over A,B: Data frames — switch forwards by MAC
    A->>SW: Ethernet frame (dst: 00:1B:2C:3D:4E:5F)
    SW->>B: Frame forwarded to Port 3 only
    B->>SW: Response frame (dst: 00:1A:2B:3C:4D:5E)
    SW->>A: Frame forwarded to Port 1 only
    Note over SW: No flooding — switch knows both MACs`,
		caption:
			'**[[ethernet|Ethernet]]** = the physical-and-link layer that moves **frames** between machines on a {{lan|LAN}} ({{ieee-802-15-4|IEEE}} 802.3, invented by [[pioneer:bob-metcalfe|Bob Metcalfe]] and [[pioneer:david-boggs|David Boggs]] at {{xerox-parc|Xerox PARC}}, 1973). A **switch** learns which **{{mac-address|MAC address}}** lives on which port by watching frame source addresses, then forwards only to the right port. {{full-duplex|Full-duplex}} switched [[ethernet|Ethernet]] replaced the original {{csma-cd|CSMA/CD}} shared-bus design.',
		steps: {
			1: '**[[arp|ARP]]** asks *who has {{ip-address|IP}} `192.168.1.50`?* — sent as an [[ethernet|Ethernet]] {{broadcast|broadcast}} (destination {{mac-address|MAC}} `FF:FF:FF:FF:FF:FF`).',
			2: 'Switch floods {{broadcast|broadcasts}} to every port — it has no choice; the destination {{mac-address|MAC}} is unknown and the request must reach everyone.',
			3: "Host B replies with its {{mac-address|MAC}} (`00:1B:2C:3D:4E:5F`). The reply is {{unicast|unicast}} — it has Host A's {{mac-address|MAC}} from the request.",
			4: "Switch sees this reply pass through and learns: Host B's {{mac-address|MAC}} is on Port 3. From now on, {{frame|frames}} to that {{mac-address|MAC}} don't need flooding.",
			5: '{{mac-table|MAC table}}: a per-port mapping of source {{mac-address|MACs}} the switch has observed. Entries time out after a few minutes if unused.',
			7: "Host A sends an [[ethernet|Ethernet]] {{frame|frame}} addressed to Host B's {{mac-address|MAC}}. The {{ip-address|IP}} packet is the *{{payload|payload}}*.",
			8: "Switch checks its {{mac-table|MAC table}} → Port 3 → forwards only to Port 3. Other ports never see this {{frame|frame}}. That's the difference between a switch and a hub."
		}
	},

	wifi: {
		definition: `sequenceDiagram
    participant L as Laptop
    participant AP as Access Point
    participant S as Server (LAN)
    Note over L,AP: Discovery and association
    AP->>L: Beacon (SSID: "MyNetwork", channel 6)
    L->>AP: Authentication Request
    AP->>L: Authentication Response (OK)
    L->>AP: Association Request (capabilities)
    AP->>L: Association Response (AID assigned)
    Note over L,AP: WPA2 4-way handshake
    AP->>L: ANonce (AP's random value)
    L->>AP: SNonce + MIC (derive PTK)
    AP->>L: GTK + MIC (group key)
    L->>AP: ACK (keys installed)
    Note over L,S: Encrypted data flow
    L->>AP: 802.11 encrypted data frame
    AP->>S: Bridged to Ethernet frame
    S->>AP: Ethernet response
    AP->>L: 802.11 encrypted response`,
		caption:
			'**WiFi** = wireless [[ethernet|Ethernet]] ({{ieee-802-15-4|IEEE}} [[wifi|802.11]]). After discovering the network, the device authenticates and associates, then runs the **{{wpa2|WPA2}} 4-way {{handshake|handshake}}** to derive {{encryption|encryption}} keys. Wireless frames are then bridged to the wired {{lan|LAN}} by the **{{ap-access-point|AP}}** ({{access-point|Access Point}}).',
		steps: {
			1: "{{beacon|Beacon}} = the {{access-point|AP}}'s {{broadcast|broadcast}} announcement, ~10× per second. Carries the {{ssid|SSID}} (network name), supported rates, security mode, and capabilities.",
			2: "{{authentication-frame|Legacy step}} (predates {{wpa2|WPA}}): used to allow shared-key auth in WEP. Today it's just a formality — security happens in the {{wpa2-handshake|4-way handshake}}.",
			4: '{{association-request|Association}} is the actual *I want to use this network* request. {{access-point|AP}} assigns the device an **{{aid|AID}}** (Association ID, 1–2007).',
			7: "{{anonce|ANonce}} = the {{access-point|AP}}'s random {{nonce|number}}. Combined with both {{mac-address|MAC addresses}} + the pre-shared key (passphrase, {{pmk|PMK}}), it generates the session key.",
			8: 'Client picks its own {{snonce|SNonce}} and computes the session key (**{{ptk|PTK}}**). {{mic|MIC}} (Message Integrity Code) over the message proves it knew the passphrase.',
			9: '{{access-point|AP}} shares the **{{gtk|GTK}}** = Group Temporal Key, used for encrypting {{broadcast|broadcast}}/{{multicast|multicast}} {{frame|frames}} so all clients can decrypt them.',
			12: '{{frame|Frames}} between client and {{access-point|AP}} are now {{encryption|encrypted}} with the {{ptk|PTK}}. Anyone listening on the air sees only ciphertext.',
			13: '{{access-point|AP}} bridges the wireless {{frame|frame}} onto the wired {{lan|LAN}} — same {{payload|payload}}, different link-layer wrapper. Acts as a translator between [[wifi|802.11]] and [[ethernet|802.3]].'
		}
	},

	arp: {
		definition: `sequenceDiagram
    participant A as Host A (192.168.1.100)
    participant B as Host B (192.168.1.50)
    Note over A: Need to send IP packet to 192.168.1.50
    Note over A: ARP cache miss — MAC unknown
    A->>B: ARP Request (broadcast FF:FF:FF:FF:FF:FF)
    Note right of A: Who has 192.168.1.50? Tell 192.168.1.100
    Note over B: That's my IP — reply with my MAC
    B->>A: ARP Reply (unicast to Host A's MAC)
    Note right of B: 192.168.1.50 is at 00:1B:2C:3D:4E:5F
    Note over A: Cache updated: 192.168.1.50 → 00:1B:2C:3D:4E:5F
    A->>B: Ethernet frame with IP packet (now using MAC)
    B->>A: Response frame
    Note over A: Subsequent packets use cached MAC
    Note over A,B: Cache entry expires after ~60-300 seconds`,
		caption:
			'**[[arp|ARP]]** = Address Resolution Protocol ([[ip|IPv4]] only). To send an {{ip-address|IP}} packet to a host on the same {{lan|LAN}}, you need its **{{mac-address|MAC}}** address. [[arp|ARP]] shouts to the whole network asking who owns an {{ip-address|IP}} — only the matching host answers ([[rfc:826|RFC 826]]).',
		steps: {
			1: '{{arp-cache|ARP cache}} stores recent {{ip-address|IP}}→{{mac-address|MAC}} mappings. A miss means we have to ask the network.',
			2: 'Sent as a **{{broadcast|broadcast}}** — destination {{mac-address|MAC}} `FF:FF:FF:FF:FF:FF`. Every device on the {{lan|LAN}} receives and processes it.',
			5: "Only the matching host replies, **{{unicast|unicast}}** to the asker's {{mac-address|MAC}}. {{arp-reply|Reply}} carries the answer in the sender hardware/protocol fields.",
			8: "Now Host A wraps its {{ip-address|IP}} packet in an [[ethernet|Ethernet]] {{frame|frame}} addressed to Host B's {{mac-address|MAC}}. The two hosts can finally exchange real data.",
			11: '{{arp-cache|ARP entries}} time out in 1–5 minutes (OS-dependent) so {{mac-address|MAC-address}} changes (new NIC, {{ip-address|IP}} reassigned) get re-learned.'
		}
	},

	ip: {
		definition: `sequenceDiagram
    participant S as Source (192.168.1.100)
    participant R as Router (10.0.0.1)
    participant D as Destination (93.184.216.34)
    Note over S: Build IP packet: src=192.168.1.100, dst=93.184.216.34, TTL=64
    S->>R: IP packet (src MAC→router MAC, TTL=64)
    Note over R: Not for me — check routing table
    Note over R: Decrement TTL: 64→63
    Note over R: Swap MACs: new src/dst MACs for next hop
    R->>D: IP packet (new MACs, same IPs, TTL=63)
    Note over D: TTL > 0, dst IP matches — accept packet
    D->>R: Reply packet (src/dst IPs swapped, TTL=64)
    R->>S: Reply forwarded (TTL=63)
    Note over S,D: IPs stay constant; MACs change at every hop`,
		caption:
			'**[[ip|IP]]** = Internet Protocol ([[pioneer:vint-cerf|Vint Cerf]] + [[pioneer:bob-kahn|Bob Kahn]], 1974; [[pioneer:jon-postel|Jon Postel]] editor). Routes packets across networks, {{hop|hop}} by {{hop|hop}}, with a 32-bit address space and best-effort delivery — every higher-layer reliability ([[tcp|TCP]], [[quic|QUIC]], [[sctp|SCTP]]) is built on top. The crucial insight: **{{ip-address|IP source/destination}} stay the same end-to-end**, while **{{mac-address|MAC addresses}} change at every router** ([[rfc:791|RFC 791]]).',
		steps: {
			1: "Source sends to its **{{default-gateway|default gateway}}** (the router). Destination {{mac-address|MAC}} is the router's MAC; destination {{ip-address|IP}} is the *final* destination.",
			2: 'Router looks at the {{ip-address|IP}} destination, checks its **{{routing-table|routing table}}** — *which interface goes toward `93.184.216.34`?*',
			3: '**{{ttl|TTL}}** decrements by 1 at every router. Hits 0 → packet dropped, [[icmp|ICMP]] {{time-exceeded|Time Exceeded}} sent back. Stops infinite loops.',
			5: 'Same packet leaves the router with new {{mac-address|MAC addresses}} for the next link, but same {{ip-address|IP addresses}} for the original endpoints.',
			6: 'Destination accepts the packet because its {{ip-address|IP}} matches and {{ttl|TTL}} is still > 0. Hands the {{payload|payload}} up to [[tcp|TCP]]/[[udp|UDP]].'
		}
	},

	soap: {
		definition: `sequenceDiagram
    participant C as SOAP Client
    participant S as SOAP Service
    Note over C,S: Service discovery
    C->>S: GET /UserService?wsdl
    S->>C: WSDL document (operations, schemas, endpoint)
    Note over C,S: SOAP request/response
    C->>S: POST /UserService (SOAPAction: GetUser)
    Note right of C: Envelope → Header + Body(GetUser id=42)
    S->>C: 200 OK — SOAP Response Envelope
    Note right of S: Body(GetUserResponse: name="Alice")
    Note over C,S: SOAP fault handling
    C->>S: POST /UserService (SOAPAction: GetUser)
    Note right of C: Body(GetUser id=-1) — invalid
    S->>C: 500 — SOAP Fault Envelope
    Note right of S: faultcode=Client, faultstring="Invalid ID"`,
		caption:
			'**[[soap|SOAP]]** = Simple Object Access Protocol. Strict {{xml|XML}} messaging for enterprise services. Every message is an **Envelope** with a Header and Body; the contract is described by **{{wsdl|WSDL}}**. Heavy compared to [[rest|REST]], but typed and tooling-friendly ({{w3c|W3C}} [[soap|SOAP]] 1.2).',
		steps: {
			1: '**{{wsdl|WSDL}}** = Web Services Description Language. Machine-readable {{xml|XML}} contract — operations, parameter types, endpoint URLs. Tools generate client stubs from it.',
			4: 'Always `POST` with a **{{soapaction|`SOAPAction`}}** {{header|header}} naming the operation. Pre-{{wsdl|WSDL}} clients keyed off this header to dispatch.',
			5: '**{{soap-envelope|Envelope}}** structure is fixed: `<Envelope>` containing optional `<Header>` (auth, routing) and required `<Body>` (the actual call/response payload).',
			11: 'Errors return a structured **{{soap-fault|SOAP Fault}}** with [[http1|HTTP]] `500` — separate from [[http1|HTTP]] error codes. Lets the protocol carry rich error info regardless of transport.'
		}
	},

	ipv6: {
		definition: `sequenceDiagram
    participant S as Source (2001:db8:1::a1f2)
    participant R as Router
    participant D as Destination (2001:db8:2::80)
    Note over S: SLAAC — autoconfigure address from prefix + interface ID
    S->>R: Router Solicitation (ICMPv6 Type 133)
    R->>S: Router Advertisement (prefix: 2001:db8:1::/64)
    Note over S: NDP replaces ARP — solicited-node multicast
    S->>R: Neighbor Solicitation (ff02::1:ff00:1)
    R->>S: Neighbor Advertisement (MAC: CC:DD:EE:FF:00:01)
    Note over S,D: IPv6 packet — fixed 40-byte header
    S->>R: IPv6 packet (Hop Limit=64, Next Header=TCP)
    Note over R: Hop Limit: 64→63 (no checksum to recalculate)
    R->>D: Forward (new MACs, same IPs, Hop Limit=63)
    D->>R: Response (IPs swapped, Hop Limit=64)
    R->>S: Return (Hop Limit=63)
    Note over S,D: 128-bit addresses — no NAT needed`,
		caption:
			'**[[ipv6|IPv6]]** = the next-generation {{ip-address|IP}}. **128-bit addresses** (so many that {{nat|NAT}} becomes unnecessary), a fixed 40-byte header, and built-in autoconfiguration. {{ndp|NDP}} replaces [[arp|ARP]] using [[ipv6|IPv6]] {{multicast|multicast}} ([[rfc:8200|RFC 8200]]).',
		steps: {
			1: '{{router-solicitation|Router Solicitation}} asks any router on the link to advertise itself. {{icmpv6|ICMPv6}} type 133, sent to the all-routers {{multicast|multicast}} address (`ff02::2`).',
			2: "{{router-advertisement|Router Advertisement}} carries the network's `/64` prefix. The host builds its own address by combining the prefix with its {{interface-id|interface ID}} — no [[dhcp|DHCP]] needed (**{{slaac|SLAAC}}**).",
			4: "**{{ndp|NDP}}** = Neighbor Discovery Protocol. Instead of [[arp|ARP]]'s full {{broadcast|broadcast}}, {{ndp|NDP}} uses {{solicited-node-multicast|solicited-node multicast}} — only hosts whose {{ip-address|IP}} ends in `::1ff00:1` listen, dramatically reducing noise.",
			6: "[[ipv6|IPv6]]'s header is fixed at 40 bytes with optional extension headers. [[ip|IPv4]]'s variable header forced every router to do header parsing — [[ipv6|IPv6]] is faster on average.",
			7: "**`{{hop-limit|Hop Limit}}` is [[ipv6|IPv6]]'s {{ttl|TTL}} (decrements per router). `Next Header` chains optional extensions and identifies the upper protocol. No header {{checksum|checksum}}** — [[udp|UDP]]/[[tcp|TCP]]/L2 already check, so no need.",
			9: 'Same {{ip-address|IP}} packet, new {{mac-address|MACs}} at every {{hop|hop}} — same hop-by-hop pattern as [[ip|IPv4]].',
			12: '`2^128` ≈ 340 undecillion addresses. Enough that every device gets a globally unique {{ip-address|address}} — **{{nat|NAT}}** becomes a security choice, not a necessity.'
		}
	},

	oauth2: {
		definition: `sequenceDiagram
    participant A as Your App
    participant AS as Auth Server
    participant API as API Server
    Note over A: Generate PKCE code_verifier + code_challenge
    A->>AS: /authorize?client_id=app&scope=read:user&code_challenge=...
    Note over AS: User logs in and consents
    AS->>A: Redirect: /callback?code=SplxlOBez&state=xYz123
    Note over A: Verify state matches (CSRF protection)
    A->>AS: POST /token (code + code_verifier)
    Note over AS: Verify PKCE: SHA256(verifier) == challenge
    AS->>A: {access_token: "eyJhbG...", refresh_token: "tGzv3J..."}
    A->>API: GET /api/user (Authorization: Bearer eyJhbG...)
    API->>A: {id: 42, name: "Alice", email: "alice@..."}
    Note over A: Token expired — use refresh token
    A->>AS: POST /token (grant_type=refresh_token)
    AS->>A: {access_token: "new_token...", expires_in: 3600}`,
		caption:
			'**[[oauth2|OAuth]] 2.0** = delegated authorization. Lets your app act on behalf of a user **without ever seeing their password**. Authorization Code flow with **{{pkce|PKCE}}** is the modern recommendation for any client ([[rfc:6749|RFC 6749]] + [[rfc:7636|RFC 7636]]).',
		steps: {
			0: '**{{pkce|PKCE}}** = Proof Key for Code Exchange. Your app picks a random `code_verifier` and sends its {{cryptographic-hash|SHA256}} hash (`code_challenge`). Locks the {{oauth-auth-code|auth code}} to *your* app — required by OAuth 2.1 / the OAuth Security BCP (RFC 9700) and recommended for all clients.',
			1: 'Browser redirects to the auth server with: {{oauth-client-id|client id}}, requested {{oauth-scope|scopes}}, code_challenge, and a **{{oauth-state|`state`}}** value ({{csrf|CSRF}} token). User sees the login + {{oauth-consent|consent}} screen.',
			3: 'After {{oauth-consent|consent}}, auth server redirects back with a one-time **{{oauth-auth-code|`code`}}** (lasts ~30 seconds) and echoes back your {{oauth-state|`state`}}.',
			4: '**Always verify {{oauth-state|`state`}} matches** what you sent — otherwise an attacker could trick the user into logging in to *their* account ({{csrf|CSRF}} attack).',
			5: 'Server-side: exchange the {{oauth-auth-code|code}} for tokens. **`code_verifier`** is sent now ({{pkce|PKCE}} proof) — auth server confirms `SHA256(verifier) == challenge` from step 1.',
			7: '**{{access-token|`access_token`}} = the {{bearer-token|bearer credential}} for API calls (often a {{jwt|JWT}}). {{oauth-refresh-token|`refresh_token`}}** = long-lived, used to get fresh {{access-token|access tokens}}. Store the refresh token securely (server-side only).',
			8: 'Send the {{access-token|access token}} in the **`Authorization: Bearer ...`** {{header|HTTP header}} ({{bearer-token|bearer token}}) on every API request.',
			10: '{{access-token|Access tokens}} are short-lived (e.g., 1 hour). When one expires ({{status-code|`401 Unauthorized`}}), exchange the {{oauth-refresh-token|refresh token}} for a new one — no user interaction.'
		}
	},

	kerberos: {
		definition: `sequenceDiagram
    participant C as Client (Alice)
    participant AS as AS (Auth Service)
    participant TGS as TGS (Ticket Granting)
    participant S as Service (web1)
    Note over C,AS: 1. Login — get a TGT
    C->>AS: AS-REQ (alice, PA-ENC-TIMESTAMP)
    AS->>C: AS-REP (TGT enc[krbtgt], K_session enc[alice])
    Note over C: Alice decrypts K_session with her password-derived key
    Note over C,TGS: 2. Request a service ticket (per service)
    C->>TGS: TGS-REQ (TGT, sname=HTTP/web1, authenticator)
    TGS->>C: TGS-REP (service ticket enc[web1], K_svc enc[K_session])
    Note over C,S: 3. Connect to the service
    C->>S: AP-REQ (service ticket, authenticator)
    Note over S: web1 decrypts ticket with its keytab key,<br/>extracts K_svc, decrypts authenticator,<br/>checks ctime within ±5 min
    S->>C: AP-REP (mutual auth: encrypted server timestamp)
    Note over C,S: Authenticated. Optionally use K_svc to wrap KRB-PRIV / KRB-SAFE`,
		caption:
			'**[[kerberos|Kerberos]]** = three-headed dog: Client, **{{kerberos-kdc|KDC}}** (Key Distribution Center, split into AS + TGS), and Service. Two {{encryption|encrypted}} blobs per ticket, **zero passwords on the wire**. Time-bounded **{{kerberos-tgt|TGT}}** (Ticket Granting Ticket) gates further service tickets so the password is only used once per session. Designed at {{mit|MIT}} Project Athena (1983–1991), [[rfc:4120|RFC 4120]] (2005). Powers every {{microsoft|Active Directory}} domain on Earth.',
		steps: {
			0: "Alice wants to log in. She sends an {{kerberos-as-req|AS-REQ}} to the {{kerberos-kdc|Key Distribution Center}}'s Authentication Service with her {{kerberos-principal|principal}} name and a {{kerberos-pa-enc-timestamp|PA-ENC-TIMESTAMP}} — a fresh timestamp {{encryption|encrypted}} under her long-term key — proving she knows the password before the {{kerberos-kdc|KDC}} bothers responding.",
			1: "{{kerberos-as-rep|AS-REP}} carries two things: a {{kerberos-tgt|Ticket Granting Ticket}} {{encryption|encrypted}} under the {{kerberos-krbtgt|krbtgt}} {{kerberos-principal|principal}}'s key (only the {{kerberos-kdc|KDC}} can decrypt it later), and the session key encrypted under Alice's long-term key (only Alice can decrypt). Alice never sends her password.",
			3: "For each service Alice wants to use, she sends a {{kerberos-tgs-req|TGS-REQ}} to the {{kerberos-kdc|KDC}}'s {{kerberos-tgs|Ticket Granting Service}}: her {{kerberos-tgt|TGT}} (proves who she is) + a fresh {{kerberos-authenticator|authenticator}} {{encryption|encrypted}} under her {{kerberos-tgt|TGT}}'s session key (proves she just got it).",
			4: "{{kerberos-tgs-rep|TGS-REP}} returns a {{kerberos-service-ticket|service ticket}} {{encryption|encrypted}} under web1's long-term key (so only web1 can decrypt it), plus the new client↔service session key encrypted under the {{kerberos-tgt|TGT}}'s session key (so only Alice can decrypt it).",
			6: "{{kerberos-ap-req|AP-REQ}} — Alice connects to web1 and presents the {{kerberos-service-ticket|service ticket}} plus a fresh {{kerberos-authenticator|authenticator}}. The service ticket carries Alice's identity inside the {{encryption|encrypted}} blob; web1 doesn't need to talk to the {{kerberos-kdc|KDC}} to verify.",
			7: "web1 decrypts the ticket with its {{kerberos-keytab|keytab}} key, extracts K_svc, decrypts the {{kerberos-authenticator|authenticator}}. If `ctime` is within ±5 minutes of web1's clock and the authenticator hasn't been seen before, Alice is authenticated.",
			8: '{{kerberos-ap-rep|AP-REP}} — web1 returns an {{encryption|encrypted}} timestamp proving it also knows K_svc. This is {{mtls|mutual authentication}}: Alice now knows web1 is real (not an impostor with a stolen {{kerberos-tgt|TGT}}).'
		}
	},

	cellular: {
		definition: `sequenceDiagram
    participant U as UE (phone)
    participant G as gNB (base station)
    participant A as AMF (mobility)
    participant S as SMF (sessions)
    participant P as UPF (user-plane)
    Note over U,G: 1. RRC Setup — PRACH random access
    U->>G: Msg1 PRACH preamble
    G->>U: Msg2 RAR (timing advance, C-RNTI)
    U->>G: Msg3 RRCSetupRequest
    G->>U: Msg4 RRCSetup
    Note over U,A: 2. Registration Request (NAS)
    U->>G: NAS Registration Request (SUCI, requested NSSAI)
    G->>A: NGAP Initial UE Message
    Note over U,A: 3. 5G-AKA Authentication
    A->>U: Authentication Request (RAND, AUTN)
    U->>A: Authentication Response (RES*)
    Note over U,A: 4. NAS Security Mode (128-NEA2 / 128-NIA2)
    A->>U: Security Mode Command
    U->>A: Security Mode Complete (ciphered + integrity)
    A->>U: Registration Accept (5G-GUTI, allowed NSSAI)
    Note over U,P: 5. PDU Session Establishment
    U->>A: PDU Session Est Req (DNN=internet, IPv4v6)
    A->>S: Nsmf_PDUSession_CreateSMContext
    S->>P: PFCP Session Est Req (PDR/FAR/QER/URR)
    P->>S: PFCP Session Est Resp
    S->>A: SM Context (UE IP, DNS)
    A->>G: NGAP N2 (DRB setup, QFI→DRB mapping)
    G->>U: RRCReconfiguration (DRB up)
    Note over U,P: N3 GTP-U tunnel live — first user packet flows`,
		caption:
			'**[[cellular|Cellular 5G SA]]** initial registration + {{pdu-session|PDU session}} establishment. The eight beats every phone walks every time it leaves airplane mode. Every {{ngap|NGAP}} hop and every {{gtp-u|GTP-U}} packet between gNB and {{upf|UPF}} is wrapped in [[ipsec|IPsec ESP]] per {{3gpp|3GPP}} {{ts-3gpp|TS}} 33.501.',
		steps: {
			0: 'Random Access — {{ue|UE}} chose a cell from {{ssb|SSB}} measurements, sent a {{prach|PRACH}} preamble (Msg1). {{gnb|Base station}} replied with a Random Access Response (Msg2) carrying timing advance and a temporary identifier ({{c-rnti|C-RNTI}}).',
			2: '{{ue|UE}} sends RRCSetupRequest with an establishment cause. {{gnb|Base station}} responds with RRCSetup. UE now has SRB1 (signalling radio bearer) but no security yet — {{rrc|RRC}} signalling is established but unprotected.',
			4: "Registration Request carries the {{suci|SUCI}} — the concealed form of every cell phone's permanent subscriber identity ({{supi|SUPI}}, the IMSI-equivalent), encrypted with the home network's public key (ECIES Profile A on Curve25519 — never sent in clear).",
			6: "{{5g-aka|5G-AKA}} — {{amf|AMF}} asks {{ausf|AUSF}}, AUSF asks {{udm|UDM}}. The UDM's SIDF decrypts {{suci|SUCI}} → {{supi|SUPI}}, generates an authentication vector. RAND/AUTN traverse all the way down to the {{ue|UE}}. The {{sim-usim|USIM}} checks AUTN.MAC against `f1(K, SQN, RAND)` and returns RES; the phone derives RES*. The SEAF compares HRES* to HXRES*, then the AUSF compares RES* to XRES*. Mutual authentication achieved.",
			8: '{{nas|NAS}} Security Mode — {{amf|AMF}} picks ciphering (typically 128-NEA2 = AES-CTR) and integrity (128-NIA2 = AES-CMAC). From here every NAS message is integrity-protected and ciphered with K_NASint / K_NASenc.',
			10: 'Registration Accept carries the assigned {{guti|5G-GUTI}} (the temporary identity the {{ue|UE}} will use until next rekey) and the allowed {{nssai|NSSAI}} (network slices).',
			12: '{{ue|UE}} requests a {{pdu-session|PDU Session}} — what the rest of the world would call "give me an [[ip|IP]] address." {{dnn|DNN}} ("internet"), session type (IPv4v6), requested {{nssai|S-NSSAI}}.',
			14: '{{pfcp|PFCP}} (Packet Forwarding Control Protocol — UDP/8805) lets {{smf|SMF}} program the {{upf|UPF}}: PDR (Packet Detection Rule), FAR (Forwarding Action Rule), QER ({{qos|QoS}} Enforcement Rule), URR (Usage Reporting Rule). The split between SMF (control) and UPF (data) is the {{cups|CUPS}} architecture.',
			16: '{{smf|SMF}} returns the {{ue|UE}} [[ipv6|IP]] address (and [[dns|DNS]] servers, {{gateway|gateway}}, etc.) plus the N2 info {{gnb|gNB}} needs to set up the {{drb|radio bearer}}.',
			17: 'RRCReconfiguration maps the {{qos|QoS}} flow → {{drb|Data Radio Bearer}}. N3 {{gtp-u|GTP-U}} {{tunnel|tunnel}} is live. First user-plane packet flows.'
		}
	},

	'mdns-dns-sd': {
		definition: `sequenceDiagram
    participant N as New host (printer)
    participant L as Link (224.0.0.251)
    participant C as Client (laptop)
    Note over N: Boot — pick candidate name "office-printer.local"
    N->>L: Probe Query #1 (250 ms)
    N->>L: Probe Query #2 (250 ms)
    N->>L: Probe Query #3 (250 ms)
    Note over N: No conflict — name is mine
    N->>L: Announce (PTR + SRV + TXT + A, cache-flush bit set)
    N->>L: Announce #2 (1 s later)
    Note over C: User taps "Find printer"
    C->>L: PTR Query _ipp._tcp.local (unicast-response bit)
    N-->>C: PTR Response → Office Printer._ipp._tcp.local
    C->>L: SRV + TXT + A query for that instance
    N-->>C: host=office-printer.local:631, rp=ipp/print, A=192.168.1.42
    Note over C: Printer found — start IPP job
    Note over N: At shutdown
    N->>L: Goodbye (PTR with TTL=0)`,
		caption:
			'**[[mdns-dns-sd|mDNS]] + [[mdns-dns-sd|DNS-SD]]** = the [[dns|DNS]] you already know, sent to a link-local {{multicast|multicast}} group on UDP/5353, with a probe/announce/respond/goodbye lifecycle. [[rfc:6762|RFC 6762]] + [[rfc:6763|RFC 6763]] (2013) — but shipped by [[pioneer:stuart-cheshire|Apple as Bonjour]] in macOS 10.2 (2002).',
		steps: {
			0: 'A new printer wants to join the link. It picks a candidate name (`office-printer.local`) and is about to claim it — but first it has to check nobody else already owns it.',
			1: '**{{mdns-probe|Probe}}** — three Query messages 250 ms apart. *"Is anyone already using `office-printer.local`?"* If any host responds with a matching record, the prober picks `office-printer-2.local` and starts over.',
			4: 'Three probes succeeded with no conflict. The host now owns the name.',
			5: '**{{mdns-announce|Announce}}** — two Response messages 1 second apart with the **{{cache-flush-bit|cache-flush bit}}** set on every A/AAAA/{{srv-record|SRV}}/{{txt-record|TXT}} record. Every receiver replaces any stale cache entries; the host is live on the link.',
			8: '**{{ptr-record|PTR}}** Query for `_ipp._tcp.local` — the [[mdns-dns-sd|DNS-SD]] way to ask *"what **{{ipp|IPP}}** printers exist on this link?"* The {{unicast|unicast}}-response bit asks responders to reply directly to save {{multicast|multicast}} {{bandwidth|bandwidth}}.',
			10: '**{{srv-record|SRV}}** + **{{txt-record|TXT}}** + A completes the {{service-discovery|discovery}}. The client now knows the printer is at `office-printer.local:631`, the resource path is `ipp/print`, and the {{ip-address|IP}} is `192.168.1.42`.',
			12: '**{{mdns-goodbye|Goodbye}}** — at graceful shutdown, the host sends one Response with **{{ttl|`TTL=0`}}** for every record it owns. Receivers immediately flush the cache. Crash-exits leave records to age out at their normal {{ttl|TTL}} (120 s for hostnames, 4500 s for service records).'
		}
	},

	wireguard: {
		definition: `sequenceDiagram
    participant I as Initiator (peer A)
    participant R as Responder (peer B)
    Note over I,R: Handshake — Noise_IKpsk2, one round trip
    I->>R: Handshake Initiation (148 B)
    Note right of I: type=1, ephemeral pub,<br/>encrypted static, TAI64N,<br/>MAC1 + MAC2
    R->>I: Handshake Response (92 B)
    Note left of R: type=2, ephemeral pub,<br/>encrypted empty, MAC1 + MAC2
    Note over I,R: Both sides derive ChaCha20-Poly1305 keys;<br/>ephemeral state wiped
    I-->>R: Transport Data (type=4, encrypted IP packet)
    R-->>I: Transport Data (type=4, encrypted IP packet)
    Note over I,R: Every 120 s — REKEY_AFTER_TIME
    I->>R: Handshake Initiation (new ephemeral)
    R->>I: Handshake Response
    Note over I,R: Fresh keys; old session wiped at REJECT_AFTER_TIME (180 s)`,
		caption:
			'**[[wireguard|WireGuard]]** = one round-trip Noise_IKpsk2 {{handshake|handshake}} → encrypted [[ip|IP]] packets over [[udp|UDP]]. Exactly four message types, exactly one ciphersuite (`Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). Designed by [[pioneer:jason-donenfeld|Jason Donenfeld]] (2015–2016), mainlined in {{linux|Linux}} 5.6 (29 March 2020).',
		steps: {
			0: "Before any traffic flows, each {{peer|peer}} already knows the other's 32-byte {{curve25519|Curve25519}} {{public-key|public key}}. There is no {{certificate|certificate}} exchange, no {{pki|PKI}}, no negotiation. The {{public-key|public key}} *is* the identity.",
			1: "{{wg-handshake-initiation|Handshake Initiation}} (type=1) — 148 bytes. Carries the initiator's {{wg-ephemeral-key|ephemeral pubkey}}, an {{aead|AEAD}}-{{encryption|encrypted}} copy of its static {{public-key|pubkey}} (hides sender identity from passive observers), and a {{wg-tai64n|TAI64N}} timestamp. {{wg-mac1|`MAC1`}} proves the initiator knows the responder's {{public-key|pubkey}} (anti-amplification). {{wg-mac2|`MAC2`}} is a cookie under DoS load.",
			3: "{{wg-handshake-response|Handshake Response}} (type=2) — 92 bytes. The responder's {{wg-ephemeral-key|ephemeral pubkey}}, an {{aead|AEAD}}-{{encryption|encrypted}} empty payload (proves key agreement), and the same {{wg-mac1|MAC1}}/{{wg-mac2|MAC2}} pair. Completes the four-{{diffie-hellman|DH}} {{noise-ik|Noise_IK}} pattern (plus optional {{psk|PSK}} mix).",
			4: 'Both sides now hold matching **{{chacha20-poly1305|ChaCha20-Poly1305}}** sending and receiving keys, derived from a chaining key via {{kdf|HKDF}}. The chaining key is wiped from memory — there is no "session state" beyond the {{symmetric-encryption|symmetric keys}}.',
			5: '{{wg-transport-data|Transport Data}} (type=4) — every inner [[ip|IP]] {{packet|packet}} is wrapped in a 16-byte [[wireguard|WireGuard]] {{header|header}} (type, receiver-index, 64-bit counter) plus the {{aead|AEAD}} ciphertext + 16-byte {{poly1305|Poly1305}} tag. The counter doubles as the {{aead|AEAD}} {{nonce|nonce}} *and* the {{anti-replay|anti-replay}} {{sequence-number|sequence number}}.',
			7: '**`REKEY_AFTER_TIME` = 120 s forces a fresh {{handshake|handshake}}. Old keys are wiped. Per-message {{forward-secrecy|forward secrecy}} within a session, per-handshake {{forward-secrecy|forward secrecy}}** across sessions. Silent {{peer|peers}} are torn down at `REJECT_AFTER_TIME = 180 s`.',
			9: 'The new session installs new {{symmetric-encryption|symmetric keys}}. Inner [[ip|IP]] traffic continues seamlessly — there is no "reconnection" visible to the application.'
		}
	},

	ipsec: {
		definition: `sequenceDiagram
    participant I as Initiator (HQ Gateway)
    participant R as Responder (Branch Gateway)
    Note over I,R: IKE_SA_INIT — establish IKE SA
    I->>R: HDR, SAi1 (proposals), KEi (ML-KEM + ECDH), Ni, NAT_DETECTION_*
    R->>I: HDR, SAr1 (chosen), KEr, Nr, NAT_DETECTION_*, CERT_REQ
    Note over I,R: IKE_INTERMEDIATE — transfer large PQ keys (RFC 9242)
    I->>R: HDR(IKE-encrypted), KE_ADDITIONAL (FrodoKEM, optional)
    R->>I: HDR(IKE-encrypted), KE_ADDITIONAL response
    Note over I,R: IKE_AUTH — identity + first Child SA
    I->>R: HDR(IKE-encrypted), IDi, CERT, AUTH, SAi2, TSi, TSr, CP(req)
    R->>I: HDR(IKE-encrypted), IDr, CERT, AUTH, SAr2, TSi, TSr, CP(reply)
    Note over I,R: Child SA up — ESP starts flowing
    I-->>R: ESP (SPI=0xC0FFEE, seq=1, AES-GCM payload)
    R-->>I: ESP (SPI=0xDEADBEEF, seq=1, AES-GCM payload)
    Note over I,R: CREATE_CHILD_SA — rekey before lifetime
    I->>R: HDR(IKE-encrypted), N(REKEY_SA), SA, Nonces, KE (PFS)
    R->>I: HDR(IKE-encrypted), SA (new), Nonces, KE`,
		caption:
			'**[[ipsec|IPsec]]** = network-layer cryptographic envelope. **{{ikev2|IKEv2}}** negotiates keys ([[rfc:7296|RFC 7296]]); **{{esp|ESP}}** carries encrypted/authenticated [[ip|IP]] packets ([[rfc:4303|RFC 4303]]). Two round trips bring a tunnel up; **{{ipsec-create-child-sa|CREATE_CHILD_SA}}** rekeys before the lifetime expires.',
		steps: {
			0: "{{ipsec-ike-sa-init|IKE_SA_INIT}} is the first exchange — no {{encryption|encryption}} yet because keys don't exist. The initiator proposes a {{cipher-suite|cipher suite}}, sends its {{diffie-hellman|Diffie-Hellman}} / {{ecdh|ECDH}} / {{ml-kem|ML-KEM}} {{public-key|public key}}, a random {{nonce|Nonce}}, and {{ipsec-nat-detection|NAT_DETECTION}} hashes that detect whether either {{peer|peer}} is behind {{nat|NAT}}.",
			1: 'Responder picks one proposal from `SAi1`, replies with its own KE / {{nonce|Nonce}}, and optionally requests a {{certificate|certificate}} (`CERT_REQ`). After this exchange both sides derive {{ipsec-skeyseed|SKEYSEED}} and the {{ike-sa|IKE SA}} key material — every subsequent exchange is {{ike|IKE}}-{{encryption|encrypted}}.',
			3: '{{ipsec-ike-intermediate|IKE_INTERMEDIATE}} ([[rfc:9242|RFC 9242]]) was added because {{post-quantum|post-quantum}} {{public-key|public keys}} ({{ml-kem|ML-KEM-1024}} = 1,568 bytes) overflow common [[udp|UDP]] {{mtu|MTUs}} if shipped in {{ipsec-ike-sa-init|IKE_SA_INIT}}. It runs *inside* the {{ike-sa|IKE SA}}, before identity is revealed, and can chain additional {{kem|KEMs}} per [[rfc:9370|RFC 9370]].',
			5: '{{ipsec-ike-auth|IKE_AUTH}} carries the identity (`IDi`, `IDr`) and authenticates the {{ipsec-ike-sa-init|IKE_SA_INIT}} exchange — usually with an {{rsa|RSA}} / {{ecdsa|ECDSA}} {{certificate|certificate}} (`CERT` + `AUTH`), sometimes with a {{psk|PSK}} or {{eap|EAP}} method. The first **{{child-sa|Child SA}}** (an {{esp|ESP}} one-direction key) is negotiated in the same exchange via `SAi2` / `TSi` / `TSr`.',
			7: 'Once the {{child-sa|Child SA}} exists, every {{packet|packet}} matching the policy gets an **{{esp|ESP}}** {{header|header}} (32-bit {{spi|SPI}} + 32-bit {{sequence-number|sequence number}}), is {{aead|AEAD}}-{{encryption|encrypted}} (typically {{aes-gcm|AES-GCM-256}} or {{chacha20-poly1305|ChaCha20-Poly1305}}), and forwarded. The receiver looks up the {{security-association|SA}} by {{spi|SPI}} and decrypts.',
			9: '{{anti-replay|Anti-replay}} uses the {{sequence-number|sequence number}}. The receiver maintains a {{sliding-window|sliding window}} of recently-seen sequence numbers (default 32 — the famous foot-gun on 10 Gbps+ links). Anything older than the window or duplicate within it is dropped.',
			10: '{{ipsec-create-child-sa|CREATE_CHILD_SA}} with the `REKEY_SA` notify rekeys an existing {{child-sa|Child SA}} before its time/byte lifetime expires (default ~8 h / ~100 GB). Optional fresh {{diffie-hellman|DH}}/{{kem|KEM}} gives {{pfs|Perfect Forward Secrecy}}. The old {{security-association|SA}} is deleted via {{ipsec-informational|INFORMATIONAL}}(DELETE) after one MaxRetransmit cycle.'
		}
	},

	bluetooth: {
		definition: `sequenceDiagram
    participant C as Central (Phone)
    participant P as Peripheral (Sensor)
    Note over P: Idle — wakes periodically
    P->>C: ADV_IND on ch 37/38/39
    C->>P: CONNECT_IND (Access Address, hop pattern)
    Note over C,P: Connected on data ch 0-36
    C->>P: ATT MTU Request (target = 247)
    P->>C: ATT MTU Response (negotiated MTU)
    C->>P: SMP Pairing Request (LE Secure Conn)
    P->>C: SMP Pairing Response
    Note over C,P: ECDH key exchange (Curve P-256)
    C->>P: LL_ENC_REQ → link encrypted (AES-CCM)
    C->>P: ATT Read by Type Request (HRM characteristic)
    P->>C: ATT Read Response (value)
    C->>P: ATT Write (CCCD = notify enable)
    P-->>C: ATT Notify (HR=72 bpm)
    P-->>C: ATT Notify (HR=73 bpm) every 1s`,
		caption:
			'**[[bluetooth|BLE]]** = Bluetooth Low Energy. Advertising → connection → pairing → {{gatt|GATT}} — the same flow for every fitness tracker, AirTag, hearing aid, and {{matter|Matter}} device commissioning over [[bluetooth|Bluetooth]] (Bluetooth Core Spec 6.0).',
		steps: {
			0: 'The peripheral spends most of its life off. Every advertising interval (20 ms to 10.24 s, configurable) it wakes, transmits {{adv-ind|ADV_IND}} on each of channels 37/38/39, then goes back to sleep — sub-microamp average current.',
			1: '{{adv-ind|ADV_IND}} is the most common advertising PDU. The 31-byte {{payload|payload}} carries Flags (general-discoverable, BR/EDR-not-supported), a list of 16-bit Service UUIDs (e.g. 0x180D = Heart Rate), and the device local name.',
			2: '{{connect-ind|CONNECT_IND}} carries everything needed for the data channel to work: a 32-bit Access Address per connection, the CRC seed, the {{hop|hop}} pattern (channel-map + hopIncrement), and the initial connection-interval / slave-latency / supervision-timeout.',
			4: 'Default {{att-mtu|ATT MTU}} = 23 is a trap — only 20 bytes of {{payload|payload}} per {{att-notify|Notify}}. The exchange to 247 (one LL PDU with Data Length Extension) or 517 happens here and is the single most important thing to do on every new connection.',
			6: '{{smp-pairing|LE Secure Connections}} ([[bluetooth|Bluetooth]] 4.2+) uses ECDH on Curve P-256 to derive a Long-Term Key. The pair compares numeric values on screen — defeating most relay attacks that bit the old Just-Works pairing.',
			9: 'Once paired, the link layer encrypts every PDU with AES-CCM ({{ll-enc-req|LL_ENC_REQ}}). {{replay-attack|Replay protection}} comes from a 39-bit packet counter; integrity from a 4-byte {{mic|MIC}} appended after the {{payload|payload}}.',
			10: '{{att-read|ATT Read by Type}} is how characteristics are read by UUID rather than handle — the most efficient lookup before the client has discovered all characteristic handles.',
			12: '{{att-write|Writing 0x0001}} to the {{cccd|Client Characteristic Configuration Descriptor (CCCD, UUID 0x2902)}} tells the peripheral: *push me updates*. From here on the central only receives — no polling required.',
			13: '{{att-notify|ATT Handle Value Notification}} carries the new sensor value. No {{ack|ACK}} at the {{gatt|ATT}} layer; reliability comes from the LL ARQ (NESN/SN bits). For confirmed delivery, use *Indication* instead — adds an ATT-level {{ack|ACK}} at the cost of a round trip.'
		}
	},

	ospf: {
		definition: `sequenceDiagram
    participant R1 as Router R1
    participant R2 as Router R2
    Note over R1,R2: Hello — discover each other
    R1->>R2: Hello (RID=1.1.1.1, Nbrs=[])
    R2->>R1: Hello (RID=2.2.2.2, Nbrs=[])
    R1->>R2: Hello (Nbrs=[2.2.2.2])
    R2->>R1: Hello (Nbrs=[1.1.1.1])
    Note over R1,R2: ExStart — elect Master/Slave
    R2->>R1: DBD (I=1, M=1, MS=1, Seq=X)
    R1->>R2: DBD (I=1, M=1, MS=0, Seq=X)
    Note over R1,R2: Exchange — swap LSA headers
    R2->>R1: DBD (I=0, M=1, MS=1, hdrs)
    R1->>R2: DBD (I=0, M=1, MS=0, hdrs)
    Note over R1,R2: Loading — fetch missing LSAs
    R1->>R2: LSR [LSAs needed]
    R2->>R1: LSU [LSAs]
    R1->>R2: LSAck
    Note over R1,R2: Full — run Dijkstra, install routes`,
		caption:
			'**[[ospf|OSPF]]** = Open Shortest Path First. Two routers walk the eight-state {{adjacency|adjacency}} machine — **Down → Init → 2-Way → ExStart → {{exchange|Exchange}} → Loading → Full** — synchronise an identical link-state database, then independently run [[pioneer:edsger-dijkstra|Dijkstra]] ([[rfc:2328|RFC 2328]] / STD 54).',
		steps: {
			0: '{{ospf-hello|Hello}} packets are {{multicast|multicast}} to `224.0.0.5` ([[ipv6|IPv6]]: `FF02::5`) every 10 s on point-to-point links. They carry the {{router-id|router ID}}, the neighbours it currently sees, and the HelloInterval / DeadInterval that the other side must match exactly.',
			1: "R1 sees the {{ospf-hello|Hello}} but R2 isn't listed in its neighbours field yet — {{adjacency|adjacency}} is one-way. State: `Init`.",
			3: "Once both {{ospf-hello|Hellos}} list each other (`Nbrs=[2.2.2.2]` ↔ `Nbrs=[1.1.1.1]`), the {{adjacency|adjacency}} goes **`2-Way`** — both sides agree they're talking.",
			5: '{{dbd|DBD = Database Description}}. The `MS` bit elects master/slave (higher {{router-id|RID}} wins); `I` is the init bit; `M` says more {{dbd|DBDs}} follow. Master controls the {{sequence-number|sequence number}}.',
			7: 'Subsequent {{dbd|DBDs}} carry {{lsa|LSA}} headers — just sequence/age/{{checksum|checksum}}, not the full {{lsa|LSA}}. Each side learns which {{lsa|LSAs}} the *other* has.',
			9: "{{lsr|LSR = Link State Request}}. R1 asks for the {{lsa|LSAs}} it doesn't have or whose copies are older.",
			10: '{{lsu|LSU = Link State Update}}. R2 sends the actual {{lsa|LSAs}}. Every {{lsa|LSA}} is {{checksum|checksummed}}, age-stamped, and sequence-numbered.',
			11: '{{lsack|LSAck}} is mandatory — [[ospf|OSPF]] implements reliable delivery on top of raw [[ip|IP]] (protocol 89), without [[tcp|TCP]]. Unacked {{lsa|LSAs}} are {{retransmission|retransmitted}} every RxmtInterval (5 s default).',
			12: 'State **`Full`. Both routers have identical {{lsdb|LSDBs}}. Each independently runs [[pioneer:edsger-dijkstra|Dijkstra]]** on the topology graph, installs the resulting tree into its {{fib|FIB}}, and starts forwarding.'
		}
	},

	'nat-traversal': {
		definition: `sequenceDiagram
    participant A as Alice (browser)
    participant SS as STUN server
    participant TS as TURN server
    participant SG as Signalling
    participant B as Bob (browser)
    Note over A,B: ICE gather — find every possible address
    A->>SS: STUN Binding Request (host socket)
    SS->>A: XOR-MAPPED-ADDRESS = server-reflexive
    A->>TS: Allocate (long-term credentials)
    TS->>A: XOR-RELAYED-ADDRESS = 203.0.113.5:62000
    A->>SG: SDP offer + candidates (trickle)
    SG->>B: Forward to Bob
    Note over A,B: ICE checks — probe every candidate pair
    A->>B: STUN Binding (short-term creds, PRIORITY)
    B->>A: STUN Binding Response
    A->>B: USE-CANDIDATE on winning pair
    Note over A,B: Media flows on the chosen pair
    A-->>B: SRTP media (every ~15s: consent-freshness ping)`,
		caption:
			'**[[nat-traversal|NAT traversal]]** = the three-protocol stack that lets two browsers behind home routers find each other. **{{stun|STUN}}** learns your public address; **{{turn|TURN}}** relays when nothing direct works; **{{ice|ICE}}** picks the path ([[rfc:8489|RFC 8489]] / [[rfc:8656|RFC 8656]] / [[rfc:8445|RFC 8445]]).',
		steps: {
			0: 'Before any check fires, each peer enumerates every address it might be reachable on: local {{lan|LAN}} interfaces (host), the {{public-ip-address|public address}} it reaches the world through (server-reflexive via {{stun|STUN}}), and a {{turn|TURN}}-allocated public relay (relayed).',
			1: '{{binding-request|STUN Binding Request}} — 20-byte header, magic cookie `0x2112A442`, random 96-bit transaction ID, zero attributes. The smallest useful packet on the modern internet.',
			2: "The {{stun|STUN}} server replies with **`{{xor-mapped-address|XOR-MAPPED-ADDRESS}}`** — the source `ip:port` it observed, XORed against the magic cookie so middleboxes can't rewrite it. That's your *server-reflexive {{ice-candidate|candidate}}*.",
			3: '**{{turn|TURN}} `Allocate`** request reserves a public `ip:port` on the relay. The client authenticates with long-term creds (username/realm/{{nonce|nonce}}/{{hmac|HMAC-SHA256}}). Default lifetime: 600 s.',
			4: 'The relay returns **`{{xor-relayed-address|XOR-RELAYED-ADDRESS}}`** — a public {{socket|socket}} Bob can hit. This is the fallback path when nothing direct works.',
			5: 'Trickle {{ice|ICE}} ([[rfc:8838|RFC 8838]]): {{ice-candidate|candidates}} are signalled as they appear, not after all gathering finishes. Cuts call-setup time by hundreds of milliseconds.',
			7: 'Each side pairs every local {{ice-candidate|candidate}} with every remote {{ice-candidate|candidate}} and prioritises: host (126) > peer-reflexive (110) > server-reflexive (100) > relay (0).',
			8: '{{stun|STUN}} connectivity check — {{binding-request|Binding Request}} with short-term credentials (`ufrag`/`pwd` from the [[sdp|SDP]]), `PRIORITY`, `ICE-CONTROLLING`/`CONTROLLED` tiebreaker, and `MESSAGE-INTEGRITY`.',
			10: 'The controlling agent sends **`{{use-candidate|USE-CANDIDATE}}`** on the highest-priority working pair. That pair is *nominated*; media starts flowing on it.',
			11: 'Consent freshness ([[rfc:7675|RFC 7675]]): every ~15s, a {{binding-request|Binding}} Indication keeps the {{nat|NAT}} binding alive and confirms the peer still wants to receive. Silence for ~30s = {{ice|ICE}} restart.'
		}
	},

	zigbee: {
		definition: `sequenceDiagram
    participant B as New Bulb (Joiner)
    participant R as Router
    participant C as Coordinator + Trust Center
    Note over B: Power on — no parent yet
    B->>R: Beacon Request (MAC Cmd 0x07, broadcast)
    C->>B: Beacon — PAN=0x1A62, Permit-Join=1
    B->>C: Association Request (Capability=0x8E)
    C->>B: Association Response — short=0x3F4E
    Note over C,B: APS Transport-Key (encrypted under pre-conf link key)
    C->>B: Network Key delivered
    B->>R: NWK Device Announce broadcast — "I am 0x3F4E"
    Note over R,C: Routers add 0x3F4E to routing tables
    C->>B: ZCL OnOff.Toggle (cluster=0x0006, cmd=0x02)
    Note over B: Bulb turns on`,
		caption:
			"**[[zigbee|Zigbee]] join** = the beacon → Association → Transport-Key → Device-Announce flow every Hue bulb, Trådfri light, and Aqara sensor runs the first time it pairs. The critical step is the **{{aps-layer|APS}} Transport-Key**: the {{network-key|network key}} is delivered encrypted under the joiner's pre-configured link key — either an **{{install-code|install code}}** (secure) or the default *ZigBeeAlliance09* (sniffable at join).",
		steps: {
			0: 'The new bulb has no parent. It {{broadcast|broadcasts}} a {{beacon-frame|Beacon Request}} (MAC Cmd 0x07) on the chosen channel. Pick 15, 20, 25, or 26 to avoid [[wifi|Wi-Fi]] channels 1/6/11.',
			1: 'Every {{zigbee-router|router}} and the {{zigbee-coordinator|Coordinator}} that permits joining replies with a {{beacon-frame|Beacon}} advertising the {{pan-id|PAN ID}}, the Coordinator {{short-address|short address}} (0x0000), Stack Profile (Zigbee PRO), and the Permit-Joining flag. The {{zigbee-joiner|joiner}} picks by {{rssi|RSSI}} + LQI + capability.',
			2: 'Association Request — the {{zigbee-joiner|joiner}} asks for a {{short-address|short address}}. Capability byte 0x8E = {{ffd|FFD}}, mains-powered, security-capable, allocate-short.',
			3: "The {{zigbee-coordinator|Coordinator}} allocates a 16-bit {{short-address|short}} (here 0x3F4E) — much cheaper than the 8-byte {{eui-64|EUI-64}} on every {{frame|frame}} for the rest of the device's life on this network.",
			5: '{{aps-layer|APS}} Transport-Key (cmd 0x05) delivers the {{network-key|network key}}, encrypted under the pre-configured link key. With an {{install-code|install code}}, an eavesdropper at join cannot decrypt this; with default *ZigBeeAlliance09*, they can — the canonical [[zigbee|Zigbee]] sniffer-at-join attack.',
			6: 'Device Announce ({{zigbee-zdo|ZDO}} cluster 0x0013) — the {{zigbee-joiner|joiner}} {{broadcast|broadcasts}} its arrival so every {{zigbee-router|router}} can add it to {{routing-table|routing}} and binding tables. From here it is on the {{mesh-network|mesh}}.',
			7: '{{zcl|ZCL}} OnOff Toggle (cluster 0x0006, command 0x02) — the canonical first command. The whole on-the-wire payload, including all {{ieee-802-15-4|802.15.4}} + {{zigbee-nwk|NWK}} + {{aps-layer|APS}} + {{zcl|ZCL}} headers, fits in ~40 bytes.'
		}
	},

	uwb: {
		definition: `sequenceDiagram
    participant P as Phone (Initiator)
    participant A as Anchor (Responder)
    Note over P,A: BLE bootstrap
    A->>P: BLE ADV_NONCONN_IND (service UUID)
    P->>A: BLE GATT pairing + PAKE auth
    P->>A: BLE: STS_KEY transport + ranging schedule
    Note over P,A: UWB DS-TWR — Ch 9, 7987.2 MHz, BPRF, 6.81 Mbps
    P->>A: UWB Poll — RFRAME with STS (t1)
    A->>P: UWB Response — STS (t2, t3)
    P->>A: UWB Final — STS (t1, t4, t5)
    Note over A: Compute ToF via DS-TWR cross-product<br/>distance ≈ 1.41 m
    A->>P: BLE: distance + bearing → Unlock`,
		caption:
			'**[[uwb|UWB]] {{ds-twr|DS-TWR}}** = the secure ranging flow under AirTag Precision Finding, BMW Digital Key, and {{aliro|Aliro}} hands-free unlock. [[bluetooth|BLE]] does the bootstrap (auth + STS_KEY transport); [[uwb|UWB]] does the three-message ranging {{exchange|exchange}}; the cross-product cancels {{clock-drift|clock drift}}; **{{sts|STS}}** is the {{aes|AES}}-CTR-generated pulse pattern that makes the distance measurement unforgeable.',
		steps: {
			0: 'Every consumer [[uwb|UWB]] session starts on [[bluetooth|BLE]]. The anchor advertises its service UUID; the phone discovers it. UWB is not yet powered — saves battery.',
			1: "[[bluetooth|BLE]] {{gatt|GATT}} pairing + application-specific authentication. SPAKE2+/{{pake|PAKE}} for {{ccc-digital-key|CCC Digital Key}}; {{apple|Apple}}'s proprietary {{handshake|handshake}} for Find My; ECDSA {{mtls|mutual auth}} for {{aliro|Aliro 1.0}}.",
			2: 'The STS_KEY (128-bit {{aes-gcm|AES}} key) and ranging schedule are transferred over the [[bluetooth|BLE]] {{encryption|encrypted}} channel. Without this key, the [[uwb|UWB]] ranging frames look like noise to any other receiver.',
			3: 'Poll — Phone fires [[uwb|UWB]] on Channel 9 (7987.2 MHz, 499.2 MHz BW). The 32-chip {{sts|STS}} segment is the AES-CTR-generated pulse pattern that defeats the distance-decrease attack. The phone records `t1 = TX timestamp` at the {{sfd|SFD}} (~15 ps resolution).',
			4: 'Response — Anchor RX-timestamps the Poll at t2, deliberately delays by T_reply1 (~200 µs), then transmits Response carrying t2, t3. Phone records `t4 = RX timestamp`.',
			5: 'Final — Phone delays by T_reply2 and transmits Final carrying t1, t4, t5. Anchor records `t6 = RX`. All six timestamps now exist.',
			6: 'The {{ds-twr|DS-TWR}} cross-product cancels relative clock drift to first order. {{tof-ranging|ToF}} resolved to ~1 ns ≈ 30 cm; with multipath and {{sts|STS}} valid, real-world DS-TWR achieves 10–30 cm distance accuracy and ~5 cm standard deviation.',
			8: "Distance + bearing returned over [[bluetooth|BLE]]. {{apple|Apple}}'s {{nearby-interaction|Nearby Interaction}} framework refreshes at ~10 Hz; the haptic + display guide the user. For {{ccc-digital-key|Digital Key}}, distance ≤ threshold + valid credential → Unlock."
		}
	},

	nfc: {
		definition: `sequenceDiagram
    participant T as Terminal (PCD)
    participant P as Phone eSE (PICC)
    Note over T: RF field on at 13.56 MHz
    T->>P: REQA 0x26
    P->>T: ATQA 0x04 0x00
    T->>P: SEL/NVB → UID → SAK 0x28
    Note over T,P: ISO 14443-4 negotiated
    T->>P: RATS 0xE0 0x80
    P->>T: ATS (FSCI=5, FWI=3)
    T->>P: SELECT PPSE 2PAY.SYS.DDF01
    P->>T: FCI (Mastercard AID A0000000041010)
    T->>P: SELECT AID A0000000041010
    P->>T: FCI + PDOL
    T->>P: GET PROCESSING OPTIONS (amount, currency, UN)
    P->>T: AIP + AFL
    T->>P: READ RECORD × N (DPAN, expiry, cert chain)
    P->>T: records + 9000
    T->>P: GENERATE AC (CDOL1 data)
    P->>T: ARQC + ATC + IAD
    Note over T,P: Terminal → acquirer → issuer → ARPC: APPROVED`,
		caption:
			'**[[nfc|NFC]]** = Near Field Communication. The same nine beats — {{anti-collision|anti-collision}} → {{rats|RATS}}/{{ats-nfc|ATS}} → {{imap-select|SELECT}} {{ppse|PPSE}} → {{select-aid|SELECT AID}} → {{gpo|GPO}} → {{read-record|READ RECORD}} → {{generate-ac|GENERATE AC}} — that every {{apple|Apple}} Pay, {{google|Google}} Wallet, {{transit|transit}} gate, and plastic contactless card runs through in under half a second ({{iso-iec|ISO/IEC}} 14443 + {{iso-iec|ISO/IEC}} 7816-4 + EMVCo Contactless Book C-2).',
		steps: {
			0: 'The terminal energises the 13.56 MHz magnetic carrier continuously. When the phone is within ~4 cm, the {{ese|eSE}} harvests power inductively and wakes — no battery contribution needed.',
			1: '{{reqa|REQA}} = `0x26`, a 7-bit short {{frame|frame}}. Any IDLE Type A {{picc|PICC}} in the field transitions to READY.',
			2: '{{atqa|ATQA}} = `0x04 0x00` — declares a 4-byte UID and standard bit-frame {{anti-collision|anti-collision}}.',
			3: 'Bit-frame {{anti-collision|anti-collision}} loop with SEL=0x93 / NVB=0x20 → UID → NVB=0x70 → SAK. `SAK = 0x28` has bit 6 set → ISO 14443-4 supported.',
			5: '{{rats|RATS}} = `0xE0 0x80` asks for Answer-To-Select. {{rats|ATS}} declares Frame Size for Card (FSCI=5 = 64 byte max) and Frame Waiting Time.',
			6: '{{select-aid|SELECT}} {{ppse|PPSE}} with {{aid|AID}} `2PAY.SYS.DDF01` — the Proximity Payment System Environment. The card returns an FCI Template listing every payment {{aid|AID}} it supports in priority order.',
			8: 'Terminal {{select-aid|SELECTs}} the chosen {{aid|AID}} (Mastercard `A0000000041010`). The card returns its FCI with the {{pdol|PDOL}} — the list of EMV tags it needs filled in to compute the cryptogram.',
			10: '{{gpo|GET PROCESSING OPTIONS}} carries the {{pdol|PDOL}}-filled data: amount, currency, country, TVR, Unpredictable Number. The card returns AIP (authentication modes supported — CDA, RRP) and {{afl|AFL}} (which files to {{read-record|READ}} next).',
			12: '{{read-record|READ RECORD}} × N — one per {{afl|AFL}} entry. Pulls the {{dpan|DPAN}} (not the real PAN — that lives at the issuer), expiry, CDOL1, and the {{certificate-chain|certificate chain}} for offline CDA verification.',
			14: '{{generate-ac|GENERATE AC}} with CDOL1 data — the card runs the inputs through AES-MAC under the per-{{dpan|DPAN}} key and returns the {{arqc|ARQC}} (Authorisation Request Cryptogram). The {{atc|ATC}} has already incremented.',
			16: 'Terminal sends the {{arqc|ARQC}} online via acquirer → payment network → issuer HSM. ARPC = APPROVED comes back; terminal beeps green; phone vibrates. Total time including network round-trip: 300–800 ms.'
		}
	}
};
