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
    Note over C,S: 3-way {{handshake|handshake}}
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
    Note over C: {{time-wait|TIME_WAIT}} (~60s)`,
		caption:
			'**[[tcp|TCP]]** = Transmission Control Protocol. A {{three-way-handshake|three-way handshake}} opens the connection, **`seq`**/**`ack`** numbers track every byte, and **FIN** closes it cleanly — the foundation of reliable delivery ([[rfc:793|RFC 793]] / [[rfc:9293|RFC 9293]]).',
		steps: {
			0: 'Before any data flows, both sides must agree they\'re talking. The next three messages — **SYN**, **SYN-ACK**, **ACK** — establish that agreement and sync their sequence counters.',
			1: '**SYN** = synchronize. The client picks a random initial sequence number (here `100`) and sends it. The *Hey, can we talk?* step.',
			2: 'Server replies with its own **SYN** (random `seq=300`) plus **ACK** of the client\'s SYN. **`ack=101`** means *next byte I expect is 101*. *Yes, I hear you — can you hear me?*',
			3: 'Client **ACK**s the server\'s SYN with `ack=301`. Both sides have now seen each other\'s starting sequence numbers — the handshake is complete.',
			4: 'The connection is **open**. Sequence-number counters are synced on both ends, so every byte from now on can be tracked, ordered, and acknowledged.',
			5: 'Client sends 50 bytes of application data starting at sequence **`101`**. The server will track these as bytes `101–150`.',
			6: 'Server replies with **`ack=151`** — *I have received through byte 150; send me byte 151 next.* ACKs always name the **next-expected** byte, not the last-received.',
			7: 'Client sends another 80 bytes starting at **`151`**. Notice it didn\'t wait for individual ACKs — TCP\'s **sliding window** lets multiple segments be in flight at once.',
			8: 'Server piggybacks an **ACK** onto its own outgoing data — `ack=231` covers everything through byte 230. Combining ACKs with data saves a round trip.',
			9: 'The sequence/ack accounting is what makes TCP **reliable**. Missing ACKs trigger retransmission, and out-of-order bytes are reassembled before they reach the application.',
			10: 'Either side can initiate close. The next three messages perform a **graceful shutdown** — each direction is flushed independently before the connection is torn down.',
			11: '**FIN** = finish. The client signals *I\'m done sending*. The server can still send any remaining data on its side.',
			12: 'Server **ACK**s the FIN and sends its own **FIN** — *I\'m done too*. These are often combined into a single segment.',
			13: 'Client **ACK**s the server\'s FIN. Both directions are now closed; no more application data can flow on this connection.',
			14: 'Client lingers in **`TIME_WAIT`** for ~60 seconds before releasing the socket. This catches late-arriving packets so they don\'t pollute a fresh connection on the same port pair.'
		}
	},

	udp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: No {{handshake|handshake}} — just send
    C->>S: Datagram 1 (42 bytes)
    C->>S: Datagram 2 (38 bytes)
    C->>S: Datagram 3 (45 bytes)
    C-xS: Datagram 4 (lost!)
    C->>S: Datagram 5 (40 bytes)
    Note over S: Received 1, 2, 3, 5 — no retransmit for #4
    Note over C,S: No ACKs, no sequence numbers, no guarantees`,
		caption:
			'**[[udp|UDP]]** = User Datagram Protocol. Fire-and-forget delivery — minimal 8-byte header, no {{handshake|handshake}}, no retransmits. The application is responsible for any reliability it needs ([[rfc:768|RFC 768]]).',
		steps: {
			0: 'No setup. The very first packet carries data — there\'s no SYN/ACK ceremony. This is what makes UDP fast for DNS lookups, voice, video, and gaming.',
			4: 'Datagram **4 is dropped** in transit. UDP doesn\'t notice and doesn\'t care — there\'s no retransmission machinery.',
			6: 'Receiver gets `1, 2, 3, 5` — *out of order possible* and one missing. UDP delivers what arrives and leaves the rest to the application.',
			7: '**No reliability features at all**: no ACKs, no sequence numbers, no flow control, no congestion control. The header is just src/dst port, length, checksum — a total of `8 bytes`.'
		}
	},

	quic: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Combined transport + [[tls|TLS]] in one {{handshake|handshake}}
    C->>S: Initial (ClientHello + crypto)
    S->>C: Initial (ServerHello + crypto)
    S->>C: Handshake ({{certificate|certificate}} + finished)
    C->>S: Handshake finished
    Note over C,S: 1 RTT — data can flow
    C->>S: Stream 1: GET /page (encrypted)
    C->>S: Stream 2: GET /style.css (encrypted)
    S-xC: Stream 1 packet lost (retransmit)
    S->>C: Stream 2 data — unaffected
    Note over C,S: {{zero-rtt|0-RTT}} available for returning clients`,
		caption:
			'**[[quic|QUIC]]** = Quick [[udp|UDP]] Internet Connections. Transport + {{encryption|encryption}} fused into one {{handshake|handshake}}. Independent **streams** mean a lost packet only blocks its own stream, not the whole connection ([[rfc:9000|RFC 9000]]).',
		steps: {
			0: 'Where TCP needs a separate TLS handshake on top, **QUIC merges them** — connection setup and encryption happen in the same exchange, halving the round trips.',
			1: 'Client\'s first flight carries the **TLS ClientHello** plus QUIC connection setup. Already includes its key share for the handshake.',
			2: 'Server replies with **ServerHello** + key share in the same Initial packet. After this exchange, both sides have shared keys.',
			3: 'Server sends its **Certificate** and a `Finished` message — already encrypted with the new keys.',
			4: 'Client confirms it received and verified everything. **One round trip total** — application data can now flow.',
			7: 'A packet on Stream 1 is lost. In TCP this would block *every* stream behind it — **head-of-line blocking** at the transport layer.',
			8: 'Stream 2\'s data delivers immediately. **QUIC streams are independent** — Stream 1\'s loss doesn\'t pause Stream 2 while waiting for retransmission.',
			9: 'Returning clients can send data in their **first packet** using cached session keys — **0-RTT**. Trades a small replay-attack risk for a faster connection.'
		}
	},

	sctp: {
		definition: `sequenceDiagram
    participant A as Host A
    participant B as Host B
    Note over A,B: 4-way {{handshake|handshake}} with {{cookie|cookie}} (anti-{{spoofing|spoofing}})
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
			'**[[sctp|SCTP]]** = Stream Control Transmission Protocol. TCP-like reliability with two superpowers: multiple **independent streams** in one association and **multi-homing** for IP-level failover ([[rfc:4960|RFC 4960]] / 9260).',
		steps: {
			0: 'Unlike TCP\'s three-way, SCTP uses **four** messages — the extra round trip lets the server hand out a cookie *before* committing any state, defeating SYN-flood attacks.',
			1: '**INIT** opens the association. Includes the client\'s address list (multi-homing) and a verification tag.',
			2: 'Server replies with **INIT-ACK** carrying a stateless **cookie** — a signed token. The server keeps no state yet.',
			3: 'Client echoes the cookie back. Only now does the server allocate resources — anyone forging an INIT couldn\'t fake the cookie.',
			4: 'Server confirms with **COOKIE-ACK**. Association established, immune to SYN-flood DoS.',
			7: 'A packet on Stream 2 is lost. SCTP retransmits it — but only **Stream 2** is affected.',
			8: 'Stream 3\'s voice traffic flows immediately, untouched by Stream 2\'s recovery. Each stream has its own ordering — same insight QUIC later adopted.',
			9: '**Multi-homing**: the same association can use multiple network paths. If one IP fails, traffic reroutes through another without breaking the connection.'
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
    C->>S: SYN + MP_JOIN (token, {{nonce|nonce}})
    S->>C: SYN-ACK + MP_JOIN ({{hmac|HMAC}})
    C->>S: ACK + MP_JOIN (HMAC)
    Note over C,S: Two paths active simultaneously
    C->>S: Data (subflow 1 — WiFi)
    C->>S: Data (subflow 2 — cellular)
    Note over C,S: WiFi drops — seamless failover
    C->>S: Data (subflow 2 only — no interruption)`,
		caption:
			'**[[mptcp|MPTCP]]** = Multipath [[tcp|TCP]]. One logical [[tcp|TCP]] connection spread across **multiple network paths** — same socket, but data flows over WiFi *and* cellular at once. Survives losing either path ([[rfc:8684|RFC 8684]]).',
		steps: {
			0: 'MPTCP starts looking exactly like a regular TCP handshake. The trick is the new **`MP_CAPABLE`** option that signals *I can do multipath*.',
			1: 'Looks like a normal **SYN**, but carries an `MP_CAPABLE` option with `key_A` — a per-host key used later to authenticate additional subflows.',
			3: 'Handshake complete. Both sides exchanged keys — the connection is now *eligible* to add more paths later.',
			5: 'Now the device adds its cellular interface as a second path to the *same* connection. Triggered by app or OS heuristics (signal, cost, latency).',
			6: '**`MP_JOIN`** opens a second subflow on the cellular interface. Carries a **token** (proves it belongs to the existing connection) and a **nonce** (replay protection).',
			7: 'Server proves it knows `key_A` by sending an **HMAC**. Cryptographic binding stops attackers from sneaking in a fake subflow.',
			8: 'Client returns its own HMAC. Subflow authenticated.',
			12: 'WiFi disconnects (e.g., walking out of a café). The MPTCP layer notices and shifts all traffic to cellular — the **app\'s TCP socket never breaks**.',
			13: 'Data continues over cellular alone. From the application\'s view it\'s the same connection — the most powerful feature of MPTCP.'
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
    Note over C,S: {{head-of-line-blocking|Head-of-line blocking}}: each request waits for previous response`,
		caption:
			'**[[http1|HTTP/1.1]]** = the text-based protocol that built the web (1997). A request line + headers + optional body, then a status line + headers + body in reply. One request at a time per connection — browsers parallelize by opening up to **6 connections per origin** ([[rfc:9112|RFC 9112]]).',
		steps: {
			0: '**`GET`** = the request method for *fetching* a resource. **Safe** (no server-side side effects) and **idempotent** (calling twice = calling once), so responses are freely cacheable. The other common methods: **`POST`** (create), **`PUT`** (replace), **`PATCH`** (partial update), **`DELETE`** (remove), **`HEAD`** (GET without body — just headers), **`OPTIONS`** (capabilities probe, used in CORS).',
			1: '**`200 OK`** = success with body. HTTP status codes are 3-digit, grouped by hundreds: **`1xx`** informational (`100 Continue`), **`2xx`** success (`201 Created`, `204 No Content`), **`3xx`** redirect (`301` permanent, `302` temporary, `304 Not Modified`), **`4xx`** client error (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`), **`5xx`** server error (`500 Internal`, `502 Bad Gateway`, `503 Unavailable`, `504 Gateway Timeout`).',
			2: 'Browser scans the HTML and finds **`<link rel="stylesheet">`** (CSS), **`<script src="...">`** (JS), and **`<img src="...">`** tags pointing to other URLs. Each becomes a fresh request — and HTML parsing **pauses for blocking scripts** until they download and execute.',
			3: 'Same TCP connection. HTTP/1.1\'s **`Connection: keep-alive`** (the default since 1999) reuses the connection for all requests to the same host, saving the **TCP + TLS handshake** on every fetch. Without keep-alive, each resource would need a brand-new connection.',
			4: 'Response carries headers like **`Content-Type: text/css`** (so the browser interprets it correctly) and **`Cache-Control: max-age=31536000, immutable`** (reuse from cache for a year, never re-validate). Caching is *the* HTTP performance superpower.',
			5: 'Third sequential request on this connection. Even though the browser knew it needed all three resources as soon as the HTML was parsed, **HTTP/1.1 can\'t send them in parallel on one connection**. To work around this, browsers open up to **6 concurrent connections per origin** — and *domain sharding* (serving assets from `static1.example.com`, `static2.example.com`...) was a common 2010s trick.',
			6: 'JS arrives. Conditional requests via **`If-None-Match`** + **`ETag`** (or **`If-Modified-Since`** + **`Last-Modified`**) let the server reply **`304 Not Modified`** with no body when nothing changed — saves bandwidth on repeat visits. **Compression** via `Content-Encoding: gzip` or `br` (Brotli) shrinks the payload further.',
			7: 'Each request must wait for the previous response — **head-of-line blocking** at the application layer. The 6-connection workaround helps but doesn\'t scale. **HTTP/2** fixed this by multiplexing all requests as numbered streams over a single TCP connection.'
		}
	},

	http2: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: [[tls|TLS]] + {{alpn|ALPN}} (h2)
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
    Note over C,S: Header compression ({{hpack|HPACK}}) + {{server-push|server push}}`,
		caption:
			'**[[http2|HTTP/2]]** = HTTP rebuilt over **multiplexed streams**. All requests share one [[tcp|TCP]] connection and interleave freely as numbered streams. Headers are compressed via {{hpack|HPACK}} ([[rfc:9113|RFC 9113]]).',
		steps: {
			0: '**ALPN** = Application-Layer Protocol Negotiation. Inside the TLS handshake, the client lists protocols it supports and the server picks one. **`h2`** = HTTP/2.',
			3: 'All three GETs go out **in parallel as separate streams** (odd-numbered streams are client-initiated). No waiting for the first response.',
			9: '**HPACK** compresses repeated headers (common ones become 1-byte indices). **Server push** lets the server send resources the client hasn\'t asked for yet — deprecated in practice.'
		}
	},

	http3: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: [[quic|QUIC]] {{handshake|handshake}} + {{alpn|ALPN}} (h3)
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
    Note over C,S: No {{head-of-line-blocking|head-of-line blocking}} across streams`,
		caption:
			'**[[http3|HTTP/3]]** = HTTP over **[[quic|QUIC]]** (which runs on [[udp|UDP]]). Same {{multiplexing|multiplexing}} as [[http2|HTTP/2]], but streams are independent at the *transport* layer too — a lost packet on one stream cannot block others ([[rfc:9114|RFC 9114]]).',
		steps: {
			0: '**`h3`** = HTTP/3 identifier negotiated via ALPN inside QUIC\'s combined TLS handshake.',
			1: 'QUIC\'s handshake setup + crypto in **one round trip**. Returning clients can do 0-RTT.',
			7: 'Stream 2 loses a packet. **HTTP/2 over TCP would block all streams here** — TCP\'s ordered-byte abstraction means stream 1 and 3 wait too.',
			8: 'But HTTP/3\'s streams are independent at the QUIC layer, so **Stream 3 delivers immediately**. Stream 2 retransmits in the background. The headline win over HTTP/2.'
		}
	},

	websockets: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: HTTP GET (Upgrade: websocket)
    S->>C: 101 Switching Protocols
    Note over C,S: {{full-duplex|Full-duplex}} connection open
    loop Bidirectional messages
        C->>S: Message (text/binary frame)
        S->>C: Message (text/binary frame)
        S->>C: Push event from server
        C->>S: Client event
    end
    C->>S: Close frame
    S->>C: Close frame`,
		caption:
			'**WebSockets** = a persistent **{{full-duplex|full-duplex}}** channel built on top of HTTP. Server can push at any time without the client asking — the foundation of live chat, multiplayer games, and collaborative editing ([[rfc:6455|RFC 6455]]).',
		steps: {
			0: 'Starts as a regular HTTP request with the **`Upgrade: websocket`** header. Lets WebSockets share port 443 with HTTPS and pass through firewalls.',
			1: '**`101 Switching Protocols`** = the only HTTP status code most people see for WebSockets. After this, the TCP connection is no longer speaking HTTP — both sides switch to the WebSocket framing protocol.'
		}
	},

	grpc: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Typed RPC over [[http2|HTTP/2]]
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
			'**[[grpc|gRPC]]** = Google\'s high-performance **RPC** framework. Methods defined in `.proto` files become typed client and server stubs in your language; messages travel as compact **Protobuf** binary over [[http2|HTTP/2]].',
		steps: {
			0: '**RPC** = Remote Procedure Call. Looks like a function call but actually crosses the network. The strong typing comes from the **`.proto`** schema both sides share.',
			1: 'Method invocation. Note this **isn\'t JSON** — Protobuf serializes the call by field-number, omitting names and types from the wire format.',
			3: 'gRPC has four call shapes: **unary** (one→one), **client streaming** (many→one), **server streaming** (one→many), and **bidirectional** (many↔many) — all on a single HTTP/2 connection.',
			8: 'Run **`protoc`** against your `.proto` file and you get type-safe client + server code in C++, Go, Java, Python, Rust, etc. The **schema is the source of truth**.'
		}
	},

	graphql: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: [[rest|REST]] approach — multiple round trips
    C->>S: GET /user/42
    S->>C: { user + unused fields }
    C->>S: GET /user/42/posts
    S->>C: { posts[] + unused fields }
    Note over C,S: [[graphql|GraphQL]] — one query, exact data
    C->>S: POST /graphql
    Note over C,S: query { user(id:42) { name, posts { title } } }
    S->>C: { "data": exact shape requested }
    Note over C,S: No over-fetching, no under-fetching`,
		caption:
			'**[[graphql|GraphQL]]** = a query language for APIs. The client describes the *shape* of data it wants; the server returns exactly that — no more, no less. Typed schema, single endpoint (graphql.org).',
		steps: {
			0: 'Top half of the diagram shows the REST way: two endpoints, two round trips, and each response includes fields you never asked for.',
			5: 'Bottom half: GraphQL. **One request**, one response, exact fields.',
			6: 'Always the **same endpoint** (`/graphql`). All differentiation lives in the query body — making CDN caching and HTTP-method semantics trickier than REST.',
			7: 'The query *is* the data shape. Field names map directly to the schema; the server resolves each field through your code.',
			8: 'Response mirrors the query structure. **No over-fetching** (no extra fields), **no under-fetching** (no second round trip needed).'
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
			'**[[sse|SSE]]** = Server-Sent Events. The browser opens an HTTP connection and the server **pushes named events** as plain text. One-way (server→client) with built-in auto-reconnect (WHATWG).',
		steps: {
			0: 'Standard HTTP request with **`Accept: text/event-stream`** — no special protocol upgrade needed. Works over HTTP/1.1, /2, /3.',
			1: 'Server returns `200` with **`Content-Type: text/event-stream`** and never closes. The body streams forever.',
			7: 'If the connection drops, the browser **auto-reconnects** and sends the **`Last-Event-ID`** header so the server can resume from where it left off. Built into the EventSource API for free.'
		}
	},

	'json-rpc': {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: {"method":"subtract","params":[42,23],"id":1}
    S->>C: {"result":19,"id":1}
    C->>S: {"method":"log","params":["hello"]}
    Note over S: {{notification|Notification}} — no response
    Note over C,S: Batch request
    C->>S: [call1, call2, notify, call3]
    S->>C: [result1, result2, result3]
    Note over C,S: Transport-agnostic: HTTP, WebSocket, stdio, [[tcp|TCP]]
    C->>S: {"method":"bad","id":2}
    S->>C: {"error":{"code":-32601},"id":2}`,
		caption:
			'**[[json-rpc|JSON-RPC]]** = a tiny RPC protocol where every message is a {{json|JSON}} object. Calls have an `id` and get a result; notifications omit `id` and get nothing back. Used by Bitcoin, Ethereum, [[mcp|MCP]], and the Language Server Protocol (jsonrpc.org 2.0).',
		steps: {
			0: 'A **call**: includes `method` name, `params` array or object, and an `id`. The id pairs the eventual response with this request.',
			1: 'Response with the matching `id` and a `result` field. Calls and responses don\'t have to arrive in order — the id is what matches them.',
			2: 'A **notification**: no `id`, so no response will come back. Used for fire-and-forget events (logging, telemetry).',
			5: 'Multiple calls can be sent as a JSON array — saves round trips. Mix of calls and notifications is fine.',
			6: 'Server returns an array of responses (skipping notifications). Order isn\'t guaranteed — match by `id`.',
			7: 'JSON-RPC is **just a message format** — it doesn\'t care how the bytes get there. Common transports: HTTP POST, WebSocket frames, stdio (used by MCP and LSP), raw TCP.',
			9: 'Errors return a structured `error` object with a numeric code (here **`-32601`** = method not found). Code ranges are reserved by the spec.'
		}
	},

	mcp: {
		definition: `sequenceDiagram
    participant H as Host (AI App)
    participant S as [[mcp|MCP]] Server
    Note over H,S: Initialization {{handshake|handshake}}
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
    Note over H,S: [[json-rpc|JSON-RPC]] 2.0 over stdio or Streamable HTTP`,
		caption:
			'**[[mcp|MCP]]** = Model Context Protocol. The standard way for AI applications (the **host**) to connect to outside **tools** and **resources** — file systems, databases, APIs. [[json-rpc|JSON-RPC]] 2.0 over stdio or HTTP (modelcontextprotocol.io).',
		steps: {
			0: 'Every MCP session starts with a **handshake** so both sides agree on protocol version and what features each supports.',
			1: 'Host opens with **`initialize`** — sends its protocol version, capabilities (e.g., supports streaming?), and basic info about itself.',
			2: 'Server replies with **its** capabilities (which categories of tools/resources it provides) and version negotiation.',
			3: '**`notifications/initialized`** confirms the host is ready. Note the `notifications/` prefix — no `id`, no response expected.',
			4: 'Now the host learns what\'s available. The server doesn\'t send everything upfront — the host queries lazily.',
			5: '**`tools/list`** asks for callable tools. Each tool has a name, description, and a JSON Schema for its inputs (so the LLM knows how to call it).',
			7: '**`resources/list`** asks for readable data sources. Resources are addressed by URI — files, database records, API endpoints — and can be subscribed to for change notifications.',
			10: '**`tools/call`** is the actual invocation. The LLM (via the host) chose to call `weather` with `{city: "NYC"}` — the server runs whatever code is behind it.',
			11: 'Result comes back as a **content array** (text, images, embedded resources). The host feeds this into the LLM\'s next turn.'
		}
	},

	a2a: {
		definition: `sequenceDiagram
    participant C as Client Agent
    participant R as Remote Agent
    Note over C,R: Discovery
    C->>R: GET /.well-known/agent.{{json|json}}
    R->>C: Agent Card {skills, capabilities}
    Note over C,R: Task lifecycle
    C->>R: message/send {text: "Find flights..."}
    R->>C: Task {state: "submitted", id: "task-42"}
    R->>C: Task {state: "working", message: "Searching..."}
    R->>C: Task {state: "completed", artifacts: [...]}
    Note over C,R: Or stream via [[sse|SSE]]
    C->>R: message/stream {text: "..."}
    R-->>C: SSE: TaskStatusUpdate
    R-->>C: SSE: TaskArtifactUpdate
    Note over C,R: [[json-rpc|JSON-RPC]] 2.0 over HTTP(S)`,
		caption:
			'**[[a2a|A2A]]** = Agent-to-Agent. The standard for one AI agent to **discover** and **delegate work** to another over HTTP. Tasks have an explicit lifecycle, and agents publish their skills in a public Agent Card (a2a-protocol.org).',
		steps: {
			1: 'Discovery is just a **well-known URL** — `/.well-known/agent.json`. Anyone can fetch it without authentication to learn what an agent does.',
			2: 'The **Agent Card** is the agent\'s public profile: name, what it can do (skills), what it accepts (input schemas), how to authenticate, and the API endpoint.',
			4: 'Client agent sends a **`message/send`** — natural-language task plus structured params. The remote agent decides how to break it down.',
			5: 'Tasks have an explicit **state machine**: `submitted` → `working` → (`input-required` or `completed` or `failed`).',
			6: 'Agent reports progress while working. The client can poll, subscribe via SSE, or simply wait.',
			7: '**`completed`** state carries **artifacts** — the actual deliverables (text, files, structured data). Tasks can produce multiple artifacts.',
			9: 'Same `message/send` semantics, but the client opens an **SSE** stream to receive real-time updates instead of polling.',
			10: '**`TaskStatusUpdate`** events stream the state transitions and intermediate messages.',
			11: '**`TaskArtifactUpdate`** events stream artifacts as they\'re produced — useful for long-running jobs.'
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
    Note over C,S: {{stateless|Stateless}} — each request carries all context
    Note over C,S: Resources as URLs, actions as HTTP verbs`,
		caption:
			'**[[rest|REST]]** = Representational State Transfer (Roy Fielding, 2000). Resources are URLs; **CRUD** maps to HTTP verbs. Each request is **{{stateless|stateless}}** — the server keeps no per-client memory between requests.',
		steps: {
			0: '**`GET`** = read. Safe (no side effects) and **idempotent** (calling it twice = calling it once). Cacheable by intermediaries.',
			2: '**`POST`** = create. Not idempotent — calling twice creates two resources. Returns **`201 Created`** with a `Location` header pointing to the new URL.',
			4: '**`PUT`** = replace. Idempotent: PUTting the same body twice has the same effect as once. Sends the *full* representation; **`PATCH`** is the partial-update cousin.',
			6: '**`DELETE`** = remove. Idempotent — once gone, repeated deletes still return success.',
			7: '**`204 No Content`** is the conventional success response when there\'s nothing meaningful to return — typical for DELETE and PUT.',
			8: 'Stateless means **every request carries everything the server needs** — auth tokens, cookies, query params. Lets any server in a load-balancer pool handle any request.'
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
			0: '**`CONNECT`** carries the client ID, optional username/password, and a **last-will** message the broker will publish if this client disconnects unexpectedly.',
			2: '**`SUBSCRIBE`** registers interest in a topic pattern. Wildcards: **`+`** matches one level (`sensor/+/temp`), **`#`** matches everything below (`sensor/#`).',
			4: 'Publisher sends to a topic — it has no idea who (if anyone) is subscribed. **Decoupling in time and space** is the whole point of pub/sub.',
			5: 'The **broker fans out** to every client whose subscription matches `sensor/temp` — could be 0, 1, or thousands.',
			9: '**QoS** trades reliability for overhead: **0** = fire-and-forget (UDP-like), **1** = at-least-once (may duplicate), **2** = exactly-once (4-step handshake per message).'
		}
	},

	amqp: {
		definition: `sequenceDiagram
    participant P as Producer
    participant B as Broker
    participant C as Consumer
    P->>B: Publish message ({{routing-key|routing key}}: "order.new")
    Note over B: {{exchange|Exchange}} routes by binding rules
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
			0: 'Publisher targets an **exchange** with a **routing key** (here `order.new`). Unlike MQTT, producers don\'t pick the queue — the exchange decides.',
			1: 'Exchange types: **direct** (exact key match), **topic** (wildcard match), **fanout** (broadcast to all bound queues), **headers** (match on header dict). Picking the right type is the design choice.',
			4: '**ACK** tells the broker *I have safely processed this; you can drop it from the queue.* Until ACK, the broker keeps the message and may redeliver.',
			7: '**NACK** = negative acknowledgement. The consumer couldn\'t process this message — broker treats it as failed.',
			8: 'Failed messages can be routed to a **dead-letter exchange** for inspection or retry. Critical pattern for production reliability.',
			9: '**Durable** queues + **persistent** messages survive a broker crash. Trades throughput for safety; usually worth it.'
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
			'**[[stomp|STOMP]]** = Simple Text Oriented Messaging Protocol. Plain-text frames you can type by hand — `COMMAND` + headers + body + `\\0`. Built into many message brokers as a friendlier alternative to [[amqp|AMQP]].',
		steps: {
			0: '**`CONNECT`** opens the session. Like an HTTP handshake but the body is a STOMP frame, and headers carry credentials.',
			2: '**`SUBSCRIBE`** registers interest in a destination (queue or topic). The `id` is the client\'s local handle for this subscription.',
			3: '**`RECEIPT`** is the optional acknowledgement of any frame the client asked the server to confirm — gives at-least-once semantics over STOMP itself.',
			5: '**`MESSAGE`** is the server delivering content to a subscriber. Subscription id matches what the client gave in SUBSCRIBE.',
			8: 'Each frame is **plaintext, line-delimited**, terminated by a `\\0` (null) byte. You can debug it with `telnet`. That readability is STOMP\'s whole pitch.'
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
			'**[[coap|CoAP]]** = Constrained Application Protocol. HTTP\'s design, shrunk for tiny IoT devices: 4-byte header, runs over **[[udp|UDP]]**, optional reliability per message. Same [[rest|REST]] verbs and status codes ([[rfc:7252|RFC 7252]]).',
		steps: {
			0: '**`CON`** = Confirmable. The request asks for an explicit ACK back. The cheap counterpart is **`NON`** (non-confirmable, fire-and-forget).',
			1: 'HTTP\'s headers can run hundreds of bytes; CoAP packs everything into **4 bytes** plus compact options. Critical for battery-powered radios.',
			2: '**`2.05 Content`** is CoAP\'s `200 OK` (codes are class.detail format, e.g. `4.04` = Not Found).',
			4: '**Observe** registers the client as interested in changes to this resource — the request stays open conceptually.',
			5: 'Server pushes a new representation **whenever the value changes**, with an incrementing observe sequence number. Detect lost notifications by gaps in the sequence.',
			8: 'Polling burns radio time and battery. Observe lets devices sleep until the server has something new to say.'
		}
	},

	xmpp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server A
    participant R as Server B
    C->>S: [[tcp|TCP]] connect + XML stream open
    S->>C: Stream features (STARTTLS, SASL)
    C->>S: STARTTLS → [[tls|TLS]] negotiation
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
			'**[[xmpp|XMPP]]** = Extensible Messaging and Presence Protocol. Originally Jabber. An open XML stream over [[tcp|TCP]] with **federated** routing — different domains relay to each other like email ([[rfc:6120|RFC 6120]]).',
		steps: {
			0: 'Client opens a TCP socket and sends `<stream:stream>` — an XML element that won\'t be closed until the session ends. The whole conversation is one continuous XML document.',
			1: 'Server replies with **`<stream:features>`** advertising what\'s available — TLS, SASL mechanisms, optional extensions.',
			2: '**`STARTTLS`** upgrades the plaintext stream to TLS. After this, the XML stream restarts inside the encrypted tunnel.',
			3: '**SASL** = Simple Authentication and Security Layer. **SCRAM** lets the server store hashed passwords (not plaintext) while still proving knowledge — modern best practice.',
			5: '**Resource binding** = the user\'s address gets a per-device suffix (`alice@example.com/phone` vs `/laptop`). Lets messages route to the right device.',
			7: '**`<presence/>`** = *I\'m online and available*. Other contacts subscribed to your presence get notified — the basis for buddy lists.',
			9: 'If `bob@serverb.com` is on a different server, this server connects to **port 5269** (server-to-server) and relays the message — same as SMTP relay between mail servers.'
		}
	},

	kafka: {
		definition: `sequenceDiagram
    participant P as Producer
    participant B as Broker (Leader)
    participant C as Consumer
    P->>B: Metadata request
    B->>P: Cluster map (brokers, topics, partitions)
    P->>B: Produce ({{topic|topic}}, {{partition|partition}}, batch)
    Note over B: Append to partition log + replicate
    B->>P: ACK ({{offset|offset}}=42)
    C->>B: Fetch (topic, partition, offset=0)
    B->>C: Records (offsets 0–42)
    C->>B: OffsetCommit (offset=42, group=analytics)
    Note over B: {{consumer-group|Consumer group}} tracks position
    C->>B: Fetch (offset=43)
    B->>C: Records (offsets 43–50)
    Note over P,C: Log is immutable — consumers replay at any offset`,
		caption:
			'**[[kafka|Kafka]]** = a distributed **append-only log**. Producers append; consumers read by **{{offset|offset}}** at their own pace. Multi-day retention means anyone can replay history. The backbone of modern event streaming (Apache [[kafka|Kafka]]).',
		steps: {
			0: 'Client first asks any broker for the **cluster map** — which broker leads which partition. Producers and consumers route directly to leaders after this.',
			2: 'Producer sends a **batch** to a specific (topic, partition) leader. Picking the partition (random, round-robin, or by key) decides ordering and parallelism.',
			3: 'The leader appends to its **log file** and replicates to follower brokers. ACK comes back only after replication — durability tier you choose: `acks=0/1/all`.',
			4: '**Offset** = position in the partition log. The producer learns where its message landed — useful for tracing and exactly-once.',
			5: 'Consumer pulls records starting at an offset. **Pull**, not push — slow consumers can fall behind without being dropped.',
			7: '**OffsetCommit** records *I, group `analytics`, have processed up to 42*. Stored in Kafka itself, in a special `__consumer_offsets` topic.',
			8: 'If a consumer crashes, another in the group resumes from the committed offset. **Consumer groups** are how you parallelize work across multiple processes.',
			11: 'The log is **immutable** — old records stay (until retention expires). Different consumer groups can read the same data independently. Replay is just *reset the offset*.'
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
    A->>S: [[sdp|SDP]] Offer (codecs, media)
    S->>B: SDP Offer (forwarded)
    B->>S: SDP Answer (accepted codecs)
    S->>A: SDP Answer (forwarded)
    Note over A,B: ICE — discover public IPs via STUN
    A->>S: ICE candidates
    B->>S: ICE candidates
    Note over A,B: Direct {{peer-to-peer|peer-to-peer}} connection
    A->>B: Audio/Video ({{srtp|SRTP}})
    B->>A: Audio/Video (SRTP)
    Note over A,B: Server only assists setup — media flows P2P`,
		caption:
			'**[[webrtc|WebRTC]]** = real-time video, audio, and data **directly between browsers**. The server only helps peers find each other ({{signaling|signaling}}) — once connected, **media flows {{peer-to-peer|peer-to-peer}}** with no hop through your servers (W3C / IETF).',
		steps: {
			0: '**SDP** = Session Description Protocol. Peer A\'s offer lists the codecs it supports, ports, encryption keys, and ICE candidates.',
			1: 'Browsers can\'t talk directly until they know each other\'s addresses. Your **signaling server** (any transport — WebSocket is typical) just forwards messages between them.',
			2: 'Peer B picks codecs both sides support and replies with its own SDP.',
			4: '**ICE** = Interactive Connectivity Establishment. Each peer asks a **STUN** server *what\'s my public IP and port?* — needed to traverse home-router NAT.',
			5: 'Each candidate is a possible address pair (host, server-reflexive, or relayed). Both peers exchange them and try every combination, picking the one that works.',
			7: 'Once a candidate pair succeeds, the connection is **direct between the browsers** — no media touches the server.',
			8: '**SRTP** = Secure RTP. Audio and video frames flow with end-to-end encryption. Whether the server is online or not no longer matters.'
		}
	},

	rtp: {
		definition: `sequenceDiagram
    participant S as Sender
    participant R as Receiver
    Note over S,R: [[rtp|RTP]] media packet stream
    S->>R: RTP (seq=100, ts=0, {{payload|payload}})
    S->>R: RTP (seq=101, ts=160, payload)
    S->>R: RTP (seq=102, ts=320, payload)
    S-xR: RTP (seq=103 — lost!)
    S->>R: RTP (seq=104, ts=640, payload)
    Note over R: Reorder buffer + {{jitter|jitter}} compensation
    Note over S,R: {{rtcp|RTCP}} feedback (separate channel)
    R->>S: Receiver Report (loss=1, jitter=5ms)
    S->>R: RTP (lower bitrate — adapting)`,
		caption:
			'**[[rtp|RTP]]** = Real-time Transport Protocol. Carries audio/video over [[udp|UDP]] with sequence numbers and timestamps for reordering. **{{rtcp|RTCP}}** is the companion control channel that reports loss back so the sender can adapt ([[rfc:3550|RFC 3550]]).',
		steps: {
			1: 'Each RTP packet carries a **sequence number** (`seq=100`) for detecting loss/reorder, and a **timestamp** (`ts=0`) in media units (here, audio sample counts) for playback timing.',
			4: 'Packet **103 is lost**. Unlike TCP, RTP does **not** retransmit — for live media, a late packet is worthless.',
			5: '104 arrives with the next timestamp. The receiver knows 103 is missing from the gap in `seq`.',
			6: 'Receiver buffers a few packets to **reorder** (UDP can deliver out-of-order) and to **smooth jitter** (variable arrival times). Concealment fills small gaps with silence or interpolation.',
			7: '**RTCP** = RTP Control Protocol. Travels on a separate port and carries quality reports — never the media itself.',
			8: '**Receiver Report** tells the sender what fraction of packets were lost and how much jitter was observed.',
			9: 'Sender uses RTCP feedback to **adapt** — drop the bitrate, switch codec, increase FEC. The basis for adaptive video calling.'
		}
	},

	sip: {
		definition: `sequenceDiagram
    participant A as Caller
    participant P as [[sip|SIP]] Proxy
    participant B as Callee
    B->>P: REGISTER sip:bob@example.com
    P->>B: 200 OK (registered)
    A->>P: INVITE ([[sdp|SDP]] offer)
    P->>B: INVITE (SDP offer)
    B->>P: 180 Ringing
    P->>A: 180 Ringing
    B->>P: 200 OK (SDP answer)
    P->>A: 200 OK (SDP answer)
    A->>B: ACK
    Note over A,B: Media flows {{peer-to-peer|peer-to-peer}} ([[rtp|RTP]])
    A->>B: BYE
    B->>A: 200 OK`,
		caption:
			'**[[sip|SIP]]** = Session Initiation Protocol. The {{signaling|signaling}} that sets up VoIP calls — sounds like HTTP, looks like email addresses (`sip:bob@example.com`). Once a call is established, the actual audio/video flows separately over **[[rtp|RTP]]** ([[rfc:3261|RFC 3261]]).',
		steps: {
			0: '**REGISTER** maps a SIP address (`bob@example.com`) to the device\'s current IP. The registrar is how the proxy knows where to ring Bob.',
			2: '**INVITE** is the call request. Body carries an **SDP offer** describing what audio/video the caller can send.',
			3: 'Proxy forwards to all of Bob\'s registered devices (*forking*) so every phone he owns can ring at once.',
			4: '**`180 Ringing`** = provisional response: I got the INVITE, the user is being alerted. May arrive multiple times.',
			6: 'Bob picks up. **`200 OK`** carries Bob\'s **SDP answer**, completing the codec/port negotiation.',
			8: '**ACK** confirms the 200 was received. SIP is request-response *except* for INVITE, which uses this 3-way pattern to be safe over UDP.',
			9: 'Now that signaling has agreed on codecs and IPs, **media bypasses the SIP proxy** and flows phone-to-phone (typically as RTP).',
			10: 'Either side sends **BYE** to hang up. Tears down the call cleanly.'
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
    Note over P: {{bandwidth|Bandwidth}} dropping...
    P->>S: GET 720p/segment_003.ts
    S->>P: Segment data (smaller)
    Note over S,P: Quality adapts to available bandwidth`,
		caption:
			'**[[hls|HLS]]** = HTTP Live Streaming (Apple). Video is pre-chopped into ~6-second `.ts` segments at multiple quality levels; the player picks a level per segment based on {{bandwidth|bandwidth}} — **adaptive bitrate** over plain HTTP ([[rfc:8216|RFC 8216]]).',
		steps: {
			0: '**Pre-encoding** is the magic. The same content is encoded ahead of time at e.g. 1080p, 720p, 360p — so any quality can be served instantly.',
			1: '**`.m3u8`** is a plain text playlist (the *master manifest*). Lists the variant playlists for each quality level.',
			2: 'Player picks a starting quality based on initial bandwidth estimate.',
			3: '**`.ts`** = MPEG-2 Transport Stream segment, ~6 seconds of video. Each is a standalone HTTP GET — cacheable by any CDN.',
			7: 'Network slows down. The player measures throughput on each segment and notices it can\'t keep up at 1080p.',
			8: 'Player **switches to 720p** for the *next* segment without breaking playback. Switches happen at segment boundaries, so no buffer disruption.'
		}
	},

	rtmp: {
		definition: `sequenceDiagram
    participant E as Encoder (OBS)
    participant S as [[rtmp|RTMP]] Server
    Note over E,S: [[tcp|TCP]] + RTMP {{handshake|handshake}}
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
			'**[[rtmp|RTMP]]** = Real-Time Messaging Protocol (Adobe, 1996). Originally Flash; now the de-facto **live-stream ingest** protocol — your encoder (OBS, Wirecast) pushes here, and the platform transcodes it for HLS/DASH viewers.',
		steps: {
			1: 'Three-stage handshake: **C0** = protocol version byte, **C1** = 1536 random bytes + timestamp.',
			2: 'Server replies with its own version (**S0**), random bytes (**S1**), and an echo of C1 (**S2**) — proves both sides can talk.',
			3: 'Client echoes **S1 back as C2**. Handshake done — protocol-level conversation can start.',
			5: '**`connect`** specifies the application path on the server (e.g., `live`). Carries optional auth parameters.',
			7: '**`createStream`** allocates a logical stream within the connection. RTMP can multiplex multiple streams; for ingest you typically use one.',
			9: '**`publish`** with the **stream key** — the secret token that authorizes pushing live audio/video to this channel.',
			13: 'Audio (AAC) and video (H.264) are sent as small **chunks** interleaved on the same TCP connection — keeps both streams flowing in lockstep.',
			14: 'Server side: receive RTMP, **transcode** into HLS or DASH segments, push to a CDN. Viewers get HLS/DASH — RTMP is now ingest-only.'
		}
	},

	sdp: {
		definition: `sequenceDiagram
    participant A as Peer A
    participant Sig as {{signaling|Signaling}}
    participant B as Peer B
    A->>A: Create [[sdp|SDP]] offer
    Note over A: v=0, m=audio/video, codecs, ICE
    A->>Sig: Send SDP offer
    Sig->>B: Forward SDP offer
    B->>B: Parse offer, select codecs
    B->>B: Create SDP answer
    Note over B: Matching codecs, own ICE candidates
    B->>Sig: Send SDP answer
    Sig->>A: Forward SDP answer
    Note over A,B: Both sides agree on parameters
    A->>B: Media streams ([[rtp|RTP]]) begin
    B->>A: Media streams (RTP) begin
    Note over A,B: SDP negotiated codecs, ports, {{encryption|encryption}}`,
		caption:
			'**[[sdp|SDP]]** = Session Description Protocol. A plain-text format that describes a media session — codecs, ports, IPs, {{encryption|encryption}} keys. Used inside [[sip|SIP]] and [[webrtc|WebRTC]] to negotiate *what\'s about to be streamed* ([[rfc:8866|RFC 8866]]).',
		steps: {
			1: 'Each line is `key=value`: **`v=0`** (protocol version), **`m=`** (media: audio or video, port, codec list), **`c=`** (connection IP), plus codec parameters and crypto.',
			3: 'SDP is **transport-agnostic** — it doesn\'t carry itself, it rides inside something else (SIP INVITE body, WebRTC signaling channel).',
			5: '**Offer/answer** pattern: B picks codecs from A\'s offer and returns **only what both support**. Negotiation is one round trip, no haggling.',
			10: 'Once SDP negotiation completes, both sides know which codecs to use and where to send the bytes — RTP packets start flowing.'
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
    Note over P: {{bandwidth|Bandwidth}} drops...
    P->>S: GET segment_003.m4s (720p)
    S->>P: Segment data (smaller)
    Note over P: Bandwidth recovers
    P->>S: GET segment_004.m4s (1080p)
    S->>P: Segment data
    Note over S,P: Adaptive bitrate — seamless quality switching`,
		caption:
			'**[[dash|DASH]]** = Dynamic Adaptive Streaming over HTTP (MPEG, ISO 23009-1). Same idea as [[hls|HLS]] — segmented video at multiple bitrates over plain HTTP — but **{{codec|codec}}-agnostic** and an open standard.',
		steps: {
			0: '**`.mpd`** = Media Presentation Description, an XML manifest describing the whole presentation hierarchy.',
			1: 'Hierarchy: **Period** (a chapter) → **AdaptationSet** (a track: video, audio, subtitle) → **Representation** (a quality variant). Cleaner abstraction than HLS\'s nested playlists.',
			3: '**`.m4s`** = fragmented MP4 segment. Standard ISOBMFF container — works with any codec (H.264, H.265, VP9, AV1).',
			7: 'Player measures bandwidth on each segment download. Decision logic varies — *throughput-based*, *buffer-based*, or hybrid (BOLA, dash.js default).',
			11: 'Bandwidth recovered → switch back up. Switches happen at segment boundaries; the buffer continues seamlessly.'
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
			'**[[dns|DNS]]** = Domain Name System. Translates human names (`example.com`) into IP addresses. Hierarchical: 13 **Root** servers know the **TLDs** (`.com`, `.org`...), TLDs know the **Authoritative** servers, those know the actual records ([[rfc:1035|RFC 1035]]).',
		steps: {
			0: 'Client asks its configured **resolver** (typically your ISP or a public one like `1.1.1.1` or `8.8.8.8`).',
			1: 'First, the resolver checks its **cache**. Roughly 80% of real-world queries are answered here without a single network packet.',
			2: '**Iterative** resolution: the resolver walks the tree itself. Each nameserver answers *go ask this other server*, not *here\'s the final answer*.',
			3: 'Root servers don\'t know `example.com` — they only know which servers run `.com`. Returns the IP of a **TLD nameserver**.',
			5: 'TLD doesn\'t know the records either, just who\'s **authoritative** for `example.com` (set by the registrar at registration time).',
			7: '**A record** = the IPv4 address. Other record types: **AAAA** (IPv6), **MX** (mail), **CNAME** (alias), **TXT** (verification, SPF), **NS** (delegation).',
			8: 'Resolver caches the answer for the record\'s **TTL** (Time To Live). Subsequent queries for `example.com` return instantly.'
		}
	},

	tls: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: [[tls|TLS]] 1.3 — one round trip
    C->>S: ClientHello (ciphers, key share)
    S->>C: ServerHello (chosen cipher, key share)
    S->>C: {{certificate|Certificate}} + CertificateVerify
    S->>C: Finished
    C->>S: Finished
    Note over C,S: Encrypted tunnel established
    C->>S: Application data (encrypted)
    S->>C: Application data (encrypted)
    Note over C,S: Returning clients: {{zero-rtt|0-RTT}} with cached keys`,
		caption:
			'**[[tls|TLS]]** = Transport Layer Security. Encrypts everything above it (HTTPS, secure [[smtp|SMTP]], etc.). [[tls|TLS]] 1.3 setup is a single round trip — {{handshake|handshake}} + first encrypted byte happen together ([[rfc:8446|RFC 8446]]).',
		steps: {
			1: '**ClientHello** lists the **cipher suites** the client supports plus a **key share** (its half of a Diffie-Hellman exchange). The keyshare bit is the TLS 1.3 trick that saves a round trip.',
			2: '**ServerHello** picks one cipher and sends its own **key share**. After this exchange, both sides can derive the shared secret — the handshake itself is now encrypted.',
			3: '**Certificate** proves the server is who it claims to be (signed by a trusted CA). **CertificateVerify** signs the handshake transcript with the cert\'s private key — proves the server actually owns it.',
			4: '**Finished** is a MAC over the entire handshake — confirms nothing in the negotiation was tampered with.',
			9: 'On reconnect, **0-RTT** lets the client send data in its first packet using a key derived from a previous session. Trades replay-attack resistance for one less round trip.'
		}
	},

	ssh: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: SSH-2.0-OpenSSH_9.0
    S->>C: SSH-2.0-OpenSSH_9.0
    Note over C,S: Key {{exchange|exchange}} (Diffie-Hellman)
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
			'**[[ssh|SSH]]** = Secure Shell. Encrypted remote shell + tunneling. Key {{exchange|exchange}} establishes a shared secret over an open network, **host key verification** stops MITM, then user auth grants access ([[rfc:4253|RFC 4253]]).',
		steps: {
			0: 'Both sides advertise their **version string** in plaintext. Used to negotiate features and as input to the handshake\'s MAC.',
			3: '**KEX_INIT** lists the algorithms each side supports for key exchange, host-key, encryption, MAC, and compression. Both sides pick the strongest mutual choice.',
			5: '**Diffie-Hellman** lets both sides derive a shared session key without ever sending it. An eavesdropper can\'t recover it even with the full transcript.',
			6: 'Server\'s **host key** identifies *this server* across reboots. The user\'s `known_hosts` file pins it — that\'s the **TOFU** (trust on first use) prompt the first time you connect.',
			8: 'Authentication is **separate** from key exchange. Common methods: `publickey` (your local SSH key), `password`, `keyboard-interactive` (2FA prompts).',
			11: '**Channels** multiplex multiple sessions inside one SSH connection — interactive shell, file transfer (SFTP), port forwarding, all on the same TCP socket.'
		}
	},

	dhcp: {
		definition: `sequenceDiagram
    participant D as Device
    participant S as [[dhcp|DHCP]] Server
    Note over D: No {{ip-address|IP address}} yet
    D->>S: DISCOVER ({{broadcast|broadcast}}: "I need an IP")
    S->>D: OFFER 192.168.1.42 ({{lease|lease}}: 24h)
    D->>S: REQUEST 192.168.1.42 ("I'll take it")
    S->>D: ACK (IP + gateway + [[dns|DNS]] + {{subnet|subnet}})
    Note over D,S: Device configured — ready to communicate
    Note over D,S: Lease renewal at 50% expiry (12h mark)`,
		caption:
			'**[[dhcp|DHCP]]** = Dynamic Host Configuration Protocol. Plug a device into a network, it gets an {{ip-address|IP address}}, gateway, [[dns|DNS]], and {{subnet|subnet}} mask without manual config. The four messages spell **DORA**: Discover, Offer, Request, Ack ([[rfc:2131|RFC 2131]]).',
		steps: {
			0: 'The device has no IP, no gateway, no DNS — it can\'t even ask a specific server for help. The only thing it can do is **broadcast**.',
			1: '**DISCOVER** is a broadcast (`255.255.255.255` from `0.0.0.0`). Every DHCP server on the LAN can hear it; usually only one responds.',
			2: 'Server **OFFER**s a specific IP from its pool, with a lease duration. Multiple servers might offer — the device picks one.',
			3: '**REQUEST** confirms which offer the device accepted (also broadcast, so other servers know to release their offers). Includes the chosen server\'s identifier.',
			4: '**ACK** confirms the lease and includes the network config: subnet mask, default gateway, DNS servers, lease time. Device is now on the network.',
			6: 'Devices try to **renew** at the halfway point (`T1`). If renewal fails, they try again at `T2` (~87.5%). If still nothing, they DISCOVER again before the lease expires.'
		}
	},

	ntp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as [[ntp|NTP]] Server
    Note over C: Clock may have drifted
    C->>S: NTP Request (T1=send time)
    Note over S: T2=receive, T3=reply time
    S->>C: NTP Response (T1, T2, T3)
    Note over C: T4=receive time
    C->>S: NTP Request (second sample)
    S->>C: NTP Response
    Note over C,S: {{offset|Offset}} = ((T2-T1)+(T3-T4))/2
    Note over C,S: Multiple samples — accuracy within 1-10ms`,
		caption:
			'**[[ntp|NTP]]** = Network Time Protocol. Keeps every device\'s clock within milliseconds of true time — the foundation of logs, certificates, and distributed systems. The trick is **four timestamps per {{exchange|exchange}}** ([[rfc:5905|RFC 5905]]).',
		steps: {
			0: 'Crystal oscillators drift — even good ones gain or lose seconds per day. Without NTP, your machine\'s clock would be hours off after a few months.',
			1: 'Client records **`T1`** when it sends the request. T1 travels in the packet.',
			2: 'Server stamps **`T2`** when the request arrives, then **`T3`** when the reply leaves.',
			3: 'Reply carries all three timestamps. Client records **`T4`** on receive.',
			7: '**Offset = ((T2−T1) + (T3−T4)) / 2**. The math cancels out one-way network latency on the assumption that send and receive paths take roughly equal time.',
			8: 'Several samples are gathered. Marzullo\'s algorithm discards outliers and picks the most accurate — typical accuracy is **1–10 ms** on a LAN.'
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
    Note over S,R: Relay via [[dns|DNS]] MX record lookup
    S->>R: EHLO + forward message
    R->>S: 250 OK — delivered to mailbox
    Note over C,R: Store-and-forward: email hops through MTAs`,
		caption:
			'**[[smtp|SMTP]]** = Simple Mail Transfer Protocol. The protocol that **sends** email between mail servers. Each server is an **MTA** (Mail Transfer Agent), and the message hops along until it reaches the recipient\'s MTA ([[rfc:5321|RFC 5321]]).',
		steps: {
			0: '**EHLO** = Extended HELLO (introduces the client). **STARTTLS** upgrades the plaintext connection to TLS — modern MTAs require it.',
			1: 'Server replies with the **capabilities** it supports (PIPELINING, AUTH methods, max message size, etc.) — discovered, not assumed.',
			2: 'Three commands send the envelope: **`MAIL FROM`** (sender), **`RCPT TO`** (recipient), **`DATA`** (the actual message body, ending with a `.` on its own line).',
			4: 'Sender\'s MTA looks up the recipient domain\'s **MX record** in DNS — the address of the receiving MTA. *That\'s how mail finds its destination.*',
			5: 'Same EHLO/MAIL/RCPT/DATA dance, just MTA-to-MTA. The message can hop through several relays before reaching the final mailbox.',
			6: '**SMTP only delivers**. To *read* the mail, the recipient uses **IMAP** or POP3 (or a webmail UI on top).',
			7: '**Store-and-forward** means each MTA accepts full responsibility for the message — if the next hop is down, it queues and retries.'
		}
	},

	ftp: {
		definition: `sequenceDiagram
    participant C as Client
    participant S as [[ftp|FTP]] Server
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
			'**[[ftp|FTP]]** = File Transfer Protocol (1971 — older than email). Unique in using **two [[tcp|TCP]] connections**: one for commands, a separate one for the actual file bytes. That dual-channel design predates NAT and causes endless {{firewall|firewall}} headaches today ([[rfc:959|RFC 959]]).',
		steps: {
			1: '**`USER`** + **`PASS`** is plaintext authentication. Modern alternatives: **FTPS** (FTP over TLS) or **SFTP** (file transfer over SSH — totally different protocol).',
			5: '**`PASV`** = passive mode. The default *active* mode has the server connecting back to the client — broken behind NAT. PASV flips it: client opens both connections.',
			6: 'Server picks a random port (here `5001`) and tells the client *connect to me here for the data*.',
			8: '**`RETR`** (retrieve) starts the file download. The actual bytes flow on the data connection, not this one.',
			10: 'File data streams over the separate data connection. Control connection stays open and can carry status updates.',
			11: '**`226`** = transfer complete on data channel. Data connection closes; control connection stays open for the next command.'
		}
	},

	imap: {
		definition: `sequenceDiagram
    participant C as Mail Client
    participant S as [[imap|IMAP]] Server
    C->>S: Connect ([[tls|TLS]] on port 993)
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
			'**[[imap|IMAP]]** = Internet Message Access Protocol. The modern way to **read** mail (vs POP3 which downloads + deletes). Mail stays on the server, multiple clients see the same state, and the server can push notifications via IDLE ([[rfc:9051|RFC 9051]]).',
		steps: {
			1: 'Untagged response (starts with **`*`**) is server-initiated info — capability greetings, mailbox state, push notifications. Tagged responses (`A001`, `A002`...) are answers to specific commands.',
			2: 'Each command starts with a **client-chosen tag** (`A001`). Lets responses come back out-of-order — the tag matches them up.',
			4: '**`SELECT`** opens a mailbox for reading. Server immediately pushes its current state — message count, recent count, flags.',
			7: '**`FETCH`** with parts in parens lets you ask for *exactly* what you need — envelope, headers, a specific MIME part — without downloading the whole message.',
			10: '**`IDLE`** parks the connection in *waiting* mode. The server can now **push** notifications when new mail arrives, no polling needed.'
		}
	},

	bgp: {
		definition: `sequenceDiagram
    participant A as Router A (AS 65001)
    participant B as Router B (AS 65002)
    Note over A,B: [[tcp|TCP]] connection on port 179
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
			'**[[bgp|BGP]]** = Border Gateway Protocol. The protocol that holds the internet together — routers in different **Autonomous Systems** (ISPs, big companies) tell each other which IP ranges they can reach ([[rfc:4271|RFC 4271]]).',
		steps: {
			0: 'Runs over **TCP port 179** between two router neighbors that have been manually configured to peer with each other. There\'s no auto-discovery on the public internet.',
			1: '**AS** = Autonomous System: one organization\'s network, identified by a number. **OPEN** carries this AS number plus a **hold timer** — how long to wait without a keepalive before declaring the peer dead.',
			3: '**KEEPALIVE** is a tiny heartbeat — proves the peer is alive even when nothing is changing.',
			6: '**UPDATE** announces a route: *I can reach `192.168.0.0/16` — send packets to me.* Includes the AS path showing every AS the announcement traveled through (loop prevention).',
			9: 'Quiet links still need keepalives every ~30s so peers know each other are alive.',
			10: '**Withdraw** removes a previously announced route — *that prefix is no longer reachable through me.* Triggers global recomputation.'
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
			'**[[icmp|ICMP]]** = Internet Control Message Protocol. The internet\'s diagnostic and error-reporting layer. **`ping`** measures {{rtt|round-trip time}}; **`traceroute`** maps the path your packets take, hop by hop ([[rfc:792|RFC 792]]).',
		steps: {
			1: '**Echo Request** = ping. **Type 8**, identifier + sequence number, optional payload (helpful to detect MTU issues if you fill it with bytes).',
			2: '**Echo Reply** = pong. **Type 0**, copies the request\'s identifier and seq back so you can pair them. The time difference is your round-trip time.',
			6: '**TTL** = Time To Live. Decrements by 1 at every router. **Setting TTL=1** guarantees the very first router will drop the packet.',
			7: 'When TTL hits 0, the dropping router sends back an **ICMP Time Exceeded** with its own IP. Now you know hop #1\'s address.',
			8: 'Increment TTL → next hop drops it → next hop\'s address revealed. Walk all the way to the destination this way.',
			9: 'Eventually TTL is high enough to reach the target — you get an Echo Reply instead of Time Exceeded. That\'s how traceroute knows it\'s done.'
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
    Note over A,B: [[arp|ARP]] resolves IP → MAC first
    A->>SW: ARP {{broadcast|Broadcast}} (who has 192.168.1.50?)
    SW->>B: ARP Broadcast (flooded to all ports)
    B->>SW: ARP Reply (I'm 00:1B:2C:3D:4E:5F)
    SW->>A: ARP Reply (forwarded, MAC learned)
    Note over SW: MAC table: Port 1→Host A, Port 3→Host B
    Note over A,B: Data frames — switch forwards by MAC
    A->>SW: [[ethernet|Ethernet]] frame (dst: 00:1B:2C:3D:4E:5F)
    SW->>B: Frame forwarded to Port 3 only
    B->>SW: Response frame (dst: 00:1A:2B:3C:4D:5E)
    SW->>A: Frame forwarded to Port 1 only
    Note over SW: No flooding — switch knows both MACs`,
		caption:
			'**[[ethernet|Ethernet]]** = the physical-and-link layer that moves frames between machines on a LAN (IEEE 802.3). A **switch** learns which **{{mac-address|MAC address}}** lives on which port by watching frame source addresses, then forwards only to the right port.',
		steps: {
			1: '**ARP** asks *who has IP `192.168.1.50`?* — sent as an Ethernet broadcast (destination MAC `FF:FF:FF:FF:FF:FF`).',
			2: 'Switch **floods** broadcasts to every port — it has no choice; the destination MAC is unknown and the request must reach everyone.',
			3: 'Host B replies with its **MAC** (`00:1B:2C:3D:4E:5F`). The reply is unicast — it has Host A\'s MAC from the request.',
			4: 'Switch sees this reply pass through and **learns**: Host B\'s MAC is on Port 3. From now on, frames to that MAC don\'t need flooding.',
			5: '**MAC table**: a per-port mapping of source MACs the switch has observed. Entries time out after a few minutes if unused.',
			7: 'Host A sends an Ethernet frame addressed to Host B\'s MAC. The IP packet is the *payload*.',
			8: 'Switch checks its MAC table → Port 3 → **forwards only to Port 3**. Other ports never see this frame. That\'s the difference between a switch and a hub.'
		}
	},

	wifi: {
		definition: `sequenceDiagram
    participant L as Laptop
    participant AP as {{access-point|Access Point}}
    participant S as Server (LAN)
    Note over L,AP: Discovery and association
    AP->>L: Beacon (SSID: "MyNetwork", channel 6)
    L->>AP: Authentication Request
    AP->>L: Authentication Response (OK)
    L->>AP: Association Request (capabilities)
    AP->>L: Association Response (AID assigned)
    Note over L,AP: WPA2 4-way {{handshake|handshake}}
    AP->>L: ANonce (AP's random value)
    L->>AP: SNonce + MIC (derive PTK)
    AP->>L: GTK + MIC (group key)
    L->>AP: ACK (keys installed)
    Note over L,S: Encrypted data flow
    L->>AP: [[wifi|802.11]] encrypted data frame
    AP->>S: Bridged to [[ethernet|Ethernet]] frame
    S->>AP: Ethernet response
    AP->>L: 802.11 encrypted response`,
		caption:
			'**WiFi** = wireless [[ethernet|Ethernet]] (IEEE [[wifi|802.11]]). After discovering the network, the device authenticates and associates, then runs the **WPA2 4-way {{handshake|handshake}}** to derive {{encryption|encryption}} keys. Wireless frames are then bridged to the wired LAN by the **AP** ({{access-point|Access Point}}).',
		steps: {
			1: '**Beacon** = the AP\'s broadcast announcement, ~10× per second. Carries the **SSID** (network name), supported rates, security mode, and capabilities.',
			2: 'Legacy step (predates WPA): used to allow shared-key auth in WEP. Today it\'s just a formality — security happens in the 4-way handshake.',
			4: '**Association** is the actual *I want to use this network* request. AP assigns the device an **AID** (Association ID, 1–2007).',
			7: '**ANonce** = the AP\'s random number. Combined with both MAC addresses + the pre-shared key (passphrase), it generates the session key.',
			8: 'Client picks its own **SNonce** and computes the session key (**PTK**). MIC (Message Integrity Code) over the message proves it knew the passphrase.',
			9: 'AP shares the **GTK** = Group Temporal Key, used for encrypting broadcast/multicast frames so all clients can decrypt them.',
			12: 'Frames between client and AP are now **encrypted with the PTK**. Anyone listening on the air sees only ciphertext.',
			13: 'AP **bridges** the wireless frame onto the wired LAN — same payload, different link-layer wrapper. Acts as a translator between 802.11 and 802.3.'
		}
	},

	arp: {
		definition: `sequenceDiagram
    participant A as Host A (192.168.1.100)
    participant B as Host B (192.168.1.50)
    Note over A: Need to send IP packet to 192.168.1.50
    Note over A: [[arp|ARP]] cache miss — MAC unknown
    A->>B: ARP Request ({{broadcast|broadcast}} FF:FF:FF:FF:FF:FF)
    Note right of A: Who has 192.168.1.50? Tell 192.168.1.100
    Note over B: That's my IP — reply with my MAC
    B->>A: ARP Reply ({{unicast|unicast}} to Host A's MAC)
    Note right of B: 192.168.1.50 is at 00:1B:2C:3D:4E:5F
    Note over A: Cache updated: 192.168.1.50 → 00:1B:2C:3D:4E:5F
    A->>B: [[ethernet|Ethernet]] frame with IP packet (now using MAC)
    B->>A: Response frame
    Note over A: Subsequent packets use cached MAC
    Note over A,B: Cache entry expires after ~60-300 seconds`,
		caption:
			'**[[arp|ARP]]** = Address Resolution Protocol ([[ip|IPv4]] only). To send an IP packet to a host on the same LAN, you need its **MAC** address. [[arp|ARP]] shouts to the whole network asking who owns an IP — only the matching host answers ([[rfc:826|RFC 826]]).',
		steps: {
			1: 'ARP cache stores recent IP→MAC mappings. A **miss** means we have to ask the network.',
			2: 'Sent as a **broadcast** — destination MAC `FF:FF:FF:FF:FF:FF`. Every device on the LAN receives and processes it.',
			5: 'Only the matching host replies, **unicast** to the asker\'s MAC. Reply carries the answer in the sender hardware/protocol fields.',
			8: 'Now Host A wraps its IP packet in an Ethernet frame addressed to Host B\'s MAC. The two hosts can finally exchange real data.',
			11: 'ARP entries **time out** in 1–5 minutes (OS-dependent) so MAC-address changes (new NIC, IP reassigned) get re-learned.'
		}
	},

	ip: {
		definition: `sequenceDiagram
    participant S as Source (192.168.1.100)
    participant R as Router (10.0.0.1)
    participant D as Destination (93.184.216.34)
    Note over S: Build IP packet: src=192.168.1.100, dst=93.184.216.34, TTL=64
    S->>R: IP packet (src MAC→router MAC, TTL=64)
    Note over R: Not for me — check {{routing-table|routing table}}
    Note over R: Decrement TTL: 64→63
    Note over R: Swap MACs: new src/dst MACs for next hop
    R->>D: IP packet (new MACs, same IPs, TTL=63)
    Note over D: TTL > 0, dst IP matches — accept packet
    D->>R: Reply packet (src/dst IPs swapped, TTL=64)
    R->>S: Reply forwarded (TTL=63)
    Note over S,D: IPs stay constant; MACs change at every hop`,
		caption:
			'**IP** = Internet Protocol. Routes packets across networks, hop by hop. The crucial insight: **IP source/destination stay the same end-to-end**, while **MAC addresses change at every router** ([[rfc:791|RFC 791]]).',
		steps: {
			1: 'Source sends to its **default gateway** (the router). Destination MAC is the router\'s MAC; destination IP is the *final* destination.',
			2: 'Router looks at the IP destination, checks its **routing table** — *which interface goes toward `93.184.216.34`?*',
			3: '**TTL** decrements by 1 at every router. Hits 0 → packet dropped, ICMP Time Exceeded sent back. Stops infinite loops.',
			5: 'Same packet leaves the router with **new MAC addresses** for the next link, but **same IP addresses** for the original endpoints.',
			6: 'Destination accepts the packet because its IP matches and TTL is still > 0. Hands the payload up to TCP/UDP.'
		}
	},

	soap: {
		definition: `sequenceDiagram
    participant C as [[soap|SOAP]] Client
    participant S as SOAP Service
    Note over C,S: {{service-discovery|Service discovery}}
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
			'**[[soap|SOAP]]** = Simple Object Access Protocol. Strict XML messaging for enterprise services. Every message is an **Envelope** with a Header and Body; the contract is described by **WSDL**. Heavy compared to [[rest|REST]], but typed and tooling-friendly (W3C [[soap|SOAP]] 1.2).',
		steps: {
			1: '**WSDL** = Web Services Description Language. Machine-readable contract — operations, parameter types, endpoint URLs. Tools generate client stubs from it.',
			4: 'Always **POST** with a **`SOAPAction`** header naming the operation. Pre-WSDL clients keyed off this header to dispatch.',
			5: 'Envelope structure is fixed: `<Envelope>` containing optional `<Header>` (auth, routing) and required `<Body>` (the actual call/response payload).',
			11: 'Errors return a structured **SOAP Fault** with HTTP 500 — separate from HTTP error codes. Lets the protocol carry rich error info regardless of transport.'
		}
	},

	ipv6: {
		definition: `sequenceDiagram
    participant S as Source (2001:db8:1::a1f2)
    participant R as Router
    participant D as Destination (2001:db8:2::80)
    Note over S: {{slaac|SLAAC}} — autoconfigure address from prefix + interface ID
    S->>R: Router Solicitation (ICMPv6 Type 133)
    R->>S: Router Advertisement (prefix: 2001:db8:1::/64)
    Note over S: NDP replaces [[arp|ARP]] — solicited-node {{multicast|multicast}}
    S->>R: Neighbor Solicitation (ff02::1:ff00:1)
    R->>S: Neighbor Advertisement (MAC: CC:DD:EE:FF:00:01)
    Note over S,D: [[ipv6|IPv6]] packet — fixed 40-byte header
    S->>R: IPv6 packet (Hop Limit=64, Next Header=[[tcp|TCP]])
    Note over R: Hop Limit: 64→63 (no {{checksum|checksum}} to recalculate)
    R->>D: Forward (new MACs, same IPs, Hop Limit=63)
    D->>R: Response (IPs swapped, Hop Limit=64)
    R->>S: Return (Hop Limit=63)
    Note over S,D: 128-bit addresses — no NAT needed`,
		caption:
			'**[[ipv6|IPv6]]** = the next-generation IP. **128-bit addresses** (so many that NAT becomes unnecessary), a fixed 40-byte header, and built-in autoconfiguration. NDP replaces [[arp|ARP]] using [[ipv6|IPv6]] {{multicast|multicast}} ([[rfc:8200|RFC 8200]]).',
		steps: {
			1: '**Router Solicitation** asks any router on the link to advertise itself. ICMPv6 type 133, sent to the all-routers multicast address (`ff02::2`).',
			2: '**Router Advertisement** carries the network\'s `/64` prefix. The host **builds its own address** by combining the prefix with its interface ID — no DHCP needed (**SLAAC**).',
			4: '**NDP** = Neighbor Discovery Protocol. Instead of ARP\'s full broadcast, NDP uses **solicited-node multicast** — only hosts whose IP ends in `::1ff00:1` listen, dramatically reducing noise.',
			6: 'IPv6\'s header is **fixed at 40 bytes** with optional extension headers. IPv4\'s variable header forced every router to do header parsing — IPv6 is faster on average.',
			7: '**`Hop Limit`** is IPv6\'s TTL (decrements per router). **`Next Header`** chains optional extensions and identifies the upper protocol. **No header checksum** — UDP/TCP/L2 already check, so no need.',
			9: 'Same IP packet, new MACs at every hop — same hop-by-hop pattern as IPv4.',
			12: '`2^128` ≈ 340 undecillion addresses. Enough that every device gets a globally unique address — **NAT** becomes a security choice, not a necessity.'
		}
	},

	oauth2: {
		definition: `sequenceDiagram
    participant A as Your App
    participant AS as Auth Server
    participant API as API Server
    Note over A: Generate {{pkce|PKCE}} code_verifier + code_challenge
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
			0: '**PKCE** = Proof Key for Code Exchange. Your app picks a random `code_verifier` and sends its `SHA256` hash (`code_challenge`). Locks the auth code to *your* app — required since 2022.',
			1: 'Browser redirects to the auth server with: client id, requested scopes, code_challenge, and a **`state`** value (CSRF token). User sees the login + consent screen.',
			3: 'After consent, auth server redirects back with a one-time **`code`** (lasts ~30 seconds) and echoes back your `state`.',
			4: '**Always verify `state` matches** what you sent — otherwise an attacker could trick the user into logging in to *their* account.',
			5: 'Server-side: exchange the code for tokens. **`code_verifier`** is sent now (PKCE proof) — auth server confirms `SHA256(verifier) == challenge` from step 1.',
			7: '**`access_token`** = the bearer credential for API calls (often a JWT). **`refresh_token`** = long-lived, used to get fresh access tokens. Store the refresh token securely (server-side only).',
			8: 'Send the access token in the **`Authorization: Bearer ...`** header on every API request.',
			10: 'Access tokens are short-lived (e.g., 1 hour). When one expires (`401 Unauthorized`), exchange the refresh token for a new one — no user interaction.'
		}
	}
};
