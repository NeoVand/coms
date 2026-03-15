export interface DiagramDefinition {
	definition: string;
	caption: string;
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
		caption: 'Reliable, ordered delivery with sequence numbers and acknowledgments (RFC 793 / RFC 9293)'
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
		caption: 'Fire-and-forget datagrams — minimal 8-byte header, no guarantees (RFC 768)'
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
		caption: 'Transport + encryption in one round trip, independent streams (RFC 9000)'
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
		caption: 'Multi-streaming with independent delivery + IP failover (RFC 4960 / RFC 9260)'
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
		caption: 'TCP over multiple paths — seamless failover between WiFi and cellular (RFC 8684)'
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
		caption: 'Sequential request/response — one at a time per connection (RFC 2616 / RFC 9112)'
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
		caption: 'Multiplexed streams over a single TCP connection (RFC 7540 / RFC 9113)'
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
		caption: 'HTTP over QUIC — packet loss on one stream cannot block others (RFC 9114)'
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
		caption: 'Persistent full-duplex channel — low-latency bidirectional messaging (RFC 6455)'
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
		caption: 'Strongly-typed RPC with Protobuf serialization over HTTP/2'
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
		caption: 'Ask for exactly what you need in a single query (graphql.org)'
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
		caption: 'Server pushes events over persistent HTTP — unidirectional (WHATWG Living Standard)'
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
		caption: 'Stateless CRUD — resources identified by URL, operated on with HTTP methods (Fielding 2000)'
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
		caption: 'Publish/subscribe with topic-based routing via a central broker (OASIS MQTT)'
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
		caption: 'Exchanges route messages to queues by binding rules (AMQP 0-9-1)'
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
		caption: 'Human-readable text frames — simple messaging over WebSocket or TCP (STOMP 1.2)'
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
		caption: 'REST-like protocol for constrained IoT devices over UDP (RFC 7252)'
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
		caption: 'XML stream with federated server-to-server routing (RFC 6120)'
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
		caption: 'Append-only log with consumer group offset tracking (Apache Kafka Protocol)'
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
		caption: 'Peer-to-peer audio/video — server only needed for signaling (W3C / IETF)'
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
		caption: 'Real-time media delivery with RTCP feedback for adaptive quality (RFC 3550)'
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
		caption: 'Call signaling — INVITE, ring, answer, media, hang up (RFC 3261)'
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
		caption: 'Adaptive bitrate streaming — quality switches seamlessly with bandwidth (RFC 8216)'
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
		caption: 'Live stream ingest — encoder to server via chunked multiplexing (RTMP spec)'
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
		caption: 'Offer/answer exchange — negotiate media parameters before streaming (RFC 8866)'
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
		caption: 'MPEG-DASH adaptive streaming — codec-agnostic alternative to HLS (ISO 23009-1)'
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
		caption: 'Hierarchical resolution — domain name to IP via Root, TLD, Authoritative (RFC 1035)'
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
		caption: 'Encrypts data in transit — one-RTT handshake, zero-RTT resumption (RFC 8446)'
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
		caption: 'Encrypted tunnel — key exchange, authentication, then secure shell access (RFC 4253)'
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
		caption: 'DORA process — plug in and get an IP address automatically (RFC 2131)'
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
		caption: 'Four timestamps per exchange to synchronize clocks across the network (RFC 5905)'
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
		caption: 'Store-and-forward email delivery through mail transfer agents (RFC 5321)'
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
		caption: 'Dual-channel architecture — control commands + separate data connections (RFC 959)'
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
			'Tagged command-response protocol — each command gets a unique tag (A001, A002...) matched in the response (RFC 9051)'
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
			'Route exchange between autonomous systems — OPEN, UPDATE, KEEPALIVE over TCP port 179 (RFC 4271)'
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
			'Network diagnostics — ping measures round-trip time, traceroute reveals each hop via TTL expiry (RFC 792)'
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
			'MAC address learning and frame forwarding — switches build their table from source MACs (IEEE 802.3)'
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
			'Beacon discovery, association, WPA2 key exchange, and wireless-to-wired bridging (IEEE 802.11)'
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
			'Broadcast request, unicast reply — resolving IP addresses to MAC addresses on the local network (RFC 826)'
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
			'Hop-by-hop routing — IP addresses stay constant while MAC addresses change at each router (RFC 791)'
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
			'WSDL discovery, XML envelope exchange, and structured fault handling — enterprise web services (W3C SOAP 1.2)'
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
			'Authorization Code flow with PKCE — delegated access without sharing passwords (RFC 6749)'
	}
};
