import type { ProtocolPair } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// "VS" PAIRS — Genuine alternatives (choose one or the other)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const vsPairs: ProtocolPair[] = [
	// ── Transport ───────────────────────────────────────────────

	{
		ids: ['tcp', 'udp'],
		type: 'vs',
		summary:
			'TCP guarantees every byte arrives in order at the cost of latency; UDP prioritizes speed by skipping reliability guarantees entirely.',
		keyDifferences: [
			{ aspect: 'Connection model', left: 'Connection-oriented (3-way handshake)', right: 'Connectionless (fire-and-forget)' },
			{ aspect: 'Reliability', left: 'Guaranteed delivery with retransmission', right: 'Best-effort, no retransmission' },
			{ aspect: 'Ordering', left: 'Strict in-order delivery', right: 'No ordering guarantees' },
			{ aspect: 'Header size', left: '20-60 bytes', right: '8 bytes' },
			{ aspect: 'Overhead', left: 'Higher (ACKs, flow control, congestion)', right: 'Minimal (just send and hope)' }
		],
		useLeftWhen: [
			'You need guaranteed delivery (file transfer, web pages, email)',
			'Data must arrive in exact order (database replication, sequential streams)',
			'You can tolerate the latency of connection setup and retransmissions',
			'Your application cannot handle or recover from missing data'
		],
		useRightWhen: [
			'Low latency is critical and occasional loss is acceptable (gaming, live video)',
			'You are broadcasting or multicasting to many recipients simultaneously',
			'Each packet is self-contained and independent (DNS queries, NTP)',
			'Your application handles its own reliability at a higher layer (QUIC, WebRTC)'
		]
	},
	{
		ids: ['mptcp', 'tcp'],
		type: 'vs',
		summary:
			'Standard TCP uses a single network path; MPTCP spreads traffic across multiple paths (e.g. Wi-Fi + cellular) for better throughput and seamless failover.',
		keyDifferences: [
			{ aspect: 'Connection model', left: 'Multiple subflows across interfaces', right: 'Single path, single interface' },
			{ aspect: 'Redundancy', left: 'Seamless failover between paths', right: 'Connection drops if path fails' },
			{ aspect: 'Throughput', left: 'Aggregate bandwidth of all paths', right: 'Limited to single path bandwidth' },
			{ aspect: 'Complexity', left: 'Complex path management and scheduling', right: 'Simple, well-understood behavior' },
			{ aspect: 'Ecosystem', left: 'Growing support (Apple, Linux 5.6+)', right: 'Universal support everywhere' }
		],
		useLeftWhen: [
			'Devices have multiple network interfaces (mobile with Wi-Fi + cellular)',
			'Connection continuity matters during network transitions (handoffs)',
			'You need aggregated bandwidth from multiple paths',
			'Failover resilience is more important than simplicity'
		],
		useRightWhen: [
			'A single, stable network path is sufficient',
			'Maximum compatibility across all devices and middleboxes is needed',
			'Your infrastructure does not support MPTCP (older kernels, firewalls)',
			'Simplicity and debuggability outweigh multi-path benefits'
		]
	},
	{
		ids: ['sctp', 'tcp'],
		type: 'vs',
		summary:
			'TCP delivers a single ordered byte stream; SCTP delivers multiple independent message streams over one association with built-in multi-homing.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Message-oriented (preserves boundaries)', right: 'Byte-stream (no message boundaries)' },
			{ aspect: 'Multiplexing', left: 'Multiple independent streams', right: 'Single stream (head-of-line blocking)' },
			{ aspect: 'Redundancy', left: 'Built-in multi-homing (multiple IPs)', right: 'Single IP per connection' },
			{ aspect: 'Connection model', left: '4-way handshake with cookie (DoS-resistant)', right: '3-way handshake' },
			{ aspect: 'Ecosystem', left: 'Limited (telecom, WebRTC data channels)', right: 'Universal support' }
		],
		useLeftWhen: [
			'You need multiple independent streams without head-of-line blocking',
			'Message boundaries must be preserved by the transport layer',
			'Multi-homing for failover between network interfaces is required',
			'You are building telecom signaling (SS7/SIGTRAN) or WebRTC data channels'
		],
		useRightWhen: [
			'Broad compatibility is essential (SCTP is blocked by many NATs/firewalls)',
			'Your application only needs a single ordered stream',
			'You are building for the public internet rather than controlled networks',
			'Existing libraries and tooling matter more than protocol features'
		]
	},
	{
		ids: ['quic', 'udp'],
		type: 'vs',
		summary:
			'Raw UDP is a minimal, unreliable datagram service; QUIC builds reliability, multiplexing, and encryption on top of UDP to replace TCP+TLS.',
		keyDifferences: [
			{ aspect: 'Reliability', left: 'Reliable delivery with retransmission', right: 'Best-effort, no guarantees' },
			{ aspect: 'Encryption', left: 'Built-in TLS 1.3 (always encrypted)', right: 'None (plaintext datagrams)' },
			{ aspect: 'Multiplexing', left: 'Multiple independent streams', right: 'Single datagram, no streams' },
			{ aspect: 'Connection model', left: '0-RTT/1-RTT handshake', right: 'No connection setup' },
			{ aspect: 'Complexity', left: 'Full transport protocol (congestion, flow control)', right: 'Minimal 8-byte header' }
		],
		useLeftWhen: [
			'You need reliable delivery but want to avoid TCP head-of-line blocking',
			'Encryption is mandatory and you want it integrated into the transport',
			'Fast connection establishment (0-RTT) matters for your use case',
			'You are building HTTP/3 or modern real-time applications'
		],
		useRightWhen: [
			'Your protocol handles its own reliability (DNS, NTP, custom game protocols)',
			'Absolute minimum overhead per packet is critical',
			'You are sending single-shot messages that do not need stream semantics',
			'Simplicity and universality outweigh QUIC\'s features'
		]
	},

	// ── Web / API ───────────────────────────────────────────────

	{
		ids: ['http1', 'http2'],
		type: 'vs',
		summary:
			'HTTP/1.1 sends requests sequentially over separate connections; HTTP/2 multiplexes many requests over a single connection with header compression and server push.',
		keyDifferences: [
			{ aspect: 'Multiplexing', left: 'One request per connection at a time', right: 'Many concurrent streams on one connection' },
			{ aspect: 'Data format', left: 'Text-based headers', right: 'Binary framing with HPACK compression' },
			{ aspect: 'Header size', left: 'Repetitive, uncompressed headers', right: 'Compressed via HPACK (up to 90% smaller)' },
			{ aspect: 'Direction', left: 'Client-initiated only', right: 'Server push (proactive resource delivery)' },
			{ aspect: 'Connection model', left: 'Multiple TCP connections (6 per domain)', right: 'Single TCP connection per origin' }
		],
		useLeftWhen: [
			'You are supporting very old clients or constrained devices that lack HTTP/2',
			'Your responses are simple and few (e.g. single-resource APIs)',
			'Debugging with plaintext is more important than performance',
			'Your infrastructure (proxies, load balancers) does not support HTTP/2'
		],
		useRightWhen: [
			'Pages load many resources (images, scripts, styles) that benefit from multiplexing',
			'Header overhead is significant (APIs with cookies, auth tokens, many headers)',
			'You want to push critical resources before the client requests them',
			'Reducing TCP connections improves server scalability'
		]
	},
	{
		ids: ['http2', 'http3'],
		type: 'vs',
		summary:
			'HTTP/2 runs over TCP and suffers from TCP-level head-of-line blocking; HTTP/3 runs over QUIC (UDP-based) eliminating this and adding faster connection setup.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'TCP + TLS 1.2/1.3 (separate layers)', right: 'QUIC (UDP-based, TLS 1.3 built-in)' },
			{ aspect: 'Multiplexing', left: 'Streams share TCP (head-of-line blocking)', right: 'Streams independent (no cross-stream blocking)' },
			{ aspect: 'Connection model', left: '1-RTT TCP + 1-RTT TLS = 2+ RTT', right: '1-RTT or 0-RTT (combined transport+crypto)' },
			{ aspect: 'Header size', left: 'HPACK compression', right: 'QPACK compression (designed for QUIC)' },
			{ aspect: 'Ecosystem', left: 'Mature, universal support', right: 'Growing rapidly, most modern browsers support it' }
		],
		useLeftWhen: [
			'Maximum compatibility with existing infrastructure is required',
			'Your network reliably delivers packets with minimal loss',
			'Firewalls or corporate networks block UDP traffic',
			'Your tooling (proxies, CDN, debugging) is TCP-oriented'
		],
		useRightWhen: [
			'Users are on lossy or mobile networks where TCP head-of-line blocking hurts',
			'Fast connection establishment (0-RTT) significantly improves user experience',
			'Connection migration matters (users switching Wi-Fi to cellular)',
			'You are building latency-sensitive applications (live streaming, gaming APIs)'
		]
	},
	{
		ids: ['grpc', 'rest'],
		type: 'vs',
		summary:
			'REST uses human-readable JSON over HTTP for broad compatibility; gRPC uses binary Protobuf over HTTP/2 for high-performance, strongly-typed service communication.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Binary (Protocol Buffers)', right: 'Text (JSON, XML)' },
			{ aspect: 'Transport', left: 'HTTP/2 only (multiplexed streams)', right: 'Any HTTP version' },
			{ aspect: 'Direction', left: 'Bidirectional streaming natively', right: 'Request-response only (streaming via workarounds)' },
			{ aspect: 'Browser support', left: 'Requires grpc-web proxy', right: 'Native in all browsers' },
			{ aspect: 'Complexity', left: 'Schema-first (.proto files, codegen)', right: 'Schema-optional, ad-hoc design common' }
		],
		useLeftWhen: [
			'Services communicate internally (microservice-to-microservice)',
			'Low latency and high throughput matter (binary is 5-10x smaller than JSON)',
			'You need bidirectional streaming (real-time feeds, long-lived channels)',
			'Strongly-typed contracts with code generation improve developer velocity'
		],
		useRightWhen: [
			'Your API is consumed by browsers, mobile apps, or third-party developers',
			'Human readability and easy debugging are priorities',
			'Your team values simplicity and convention over strict contracts',
			'Broad ecosystem support (caching, CDNs, API gateways) matters'
		]
	},
	{
		ids: ['graphql', 'rest'],
		type: 'vs',
		summary:
			'REST exposes fixed endpoints that return predetermined data shapes; GraphQL exposes a single endpoint where clients query exactly the fields they need.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Client-specified query shapes', right: 'Server-defined resource shapes' },
			{ aspect: 'Caching', left: 'Complex (query-level, requires tooling)', right: 'Simple (HTTP caching per URL)' },
			{ aspect: 'Overhead', left: 'No over-fetching, but query parsing cost', right: 'Often over-fetches or under-fetches data' },
			{ aspect: 'Direction', left: 'Queries + mutations + subscriptions', right: 'CRUD mapped to HTTP methods' },
			{ aspect: 'Complexity', left: 'Schema required, resolver architecture', right: 'Simpler, convention-based' }
		],
		useLeftWhen: [
			'Clients need different slices of data (mobile vs desktop vs watch)',
			'You want to reduce round trips by fetching nested resources in one query',
			'Your data model is deeply interconnected (social graph, CMS, e-commerce catalog)',
			'Frontend teams need to iterate independently from backend teams'
		],
		useRightWhen: [
			'Your resources are simple and well-defined (CRUD operations)',
			'HTTP caching at the CDN or proxy layer is important for performance',
			'Your team is small and wants the simplest possible API surface',
			'You are building a public API where predictable URLs matter'
		]
	},
	{
		ids: ['sse', 'websockets'],
		type: 'vs',
		summary:
			'WebSocket provides full-duplex bidirectional communication; SSE provides server-to-client streaming over plain HTTP with automatic reconnection.',
		keyDifferences: [
			{ aspect: 'Direction', left: 'Server-to-client only', right: 'Full-duplex bidirectional' },
			{ aspect: 'Transport', left: 'Standard HTTP (works with proxies, CDNs)', right: 'Upgraded connection (custom framing)' },
			{ aspect: 'Complexity', left: 'Simple (EventSource API, text-based)', right: 'More complex (handshake, binary frames)' },
			{ aspect: 'Reliability', left: 'Built-in auto-reconnection and last-event-ID', right: 'Manual reconnection logic needed' },
			{ aspect: 'Data format', left: 'Text only (UTF-8)', right: 'Text and binary frames' }
		],
		useLeftWhen: [
			'You only need server-to-client push (notifications, live feeds, dashboards)',
			'HTTP infrastructure (CDN, load balancers, proxies) must work unmodified',
			'Automatic reconnection with last-event-ID resumption is valuable',
			'Simplicity is preferred — no WebSocket upgrade negotiation needed'
		],
		useRightWhen: [
			'The client needs to send data frequently (chat, collaborative editing, gaming)',
			'Binary data transfer is required (file chunks, audio/video)',
			'You need very low latency in both directions',
			'Your use case requires a persistent bidirectional channel'
		]
	},
	{
		ids: ['graphql', 'grpc'],
		type: 'vs',
		summary:
			'GraphQL lets clients flexibly query for exactly the data they need over HTTP; gRPC provides high-performance, schema-strict RPC with bidirectional streaming.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'JSON response, query language', right: 'Binary Protocol Buffers' },
			{ aspect: 'Direction', left: 'Request-response + subscriptions', right: 'Unary, server/client/bidirectional streaming' },
			{ aspect: 'Browser support', left: 'Native (standard HTTP POST)', right: 'Requires grpc-web proxy' },
			{ aspect: 'Complexity', left: 'Schema + resolvers, flexible queries', right: 'Schema + codegen, strict contracts' },
			{ aspect: 'Overhead', left: 'JSON text (human-readable)', right: 'Binary (compact, ~5-10x smaller)' }
		],
		useLeftWhen: [
			'Clients need flexible, ad-hoc queries over complex data graphs',
			'Your API serves browsers and mobile apps directly',
			'Different clients need different data shapes from the same backend',
			'Developer experience and API exploration (GraphiQL) are priorities'
		],
		useRightWhen: [
			'Maximum throughput matters (inter-service communication in data centers)',
			'You need bidirectional streaming for real-time data exchange',
			'Strict, versioned contracts with generated client/server stubs are preferred',
			'Your services are backend-to-backend without browser involvement'
		]
	},
	{
		ids: ['http1', 'http3'],
		type: 'vs',
		summary:
			'HTTP/1.1 is the text-based, universally supported baseline; HTTP/3 is the latest evolution running over QUIC with multiplexing, 0-RTT, and built-in encryption.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'TCP (1+ RTT handshake)', right: 'QUIC over UDP (0-RTT possible)' },
			{ aspect: 'Multiplexing', left: 'No multiplexing (one request per connection)', right: 'Full stream multiplexing (no head-of-line blocking)' },
			{ aspect: 'Header size', left: 'Uncompressed text headers', right: 'QPACK compressed binary headers' },
			{ aspect: 'Encryption', left: 'Optional (HTTP or HTTPS)', right: 'Always encrypted (TLS 1.3 built into QUIC)' },
			{ aspect: 'Ecosystem', left: 'Universal — every device and proxy supports it', right: 'Modern browsers and CDNs; some firewalls block UDP' }
		],
		useLeftWhen: [
			'Maximum backward compatibility is the top priority',
			'Your clients include legacy devices or very old browsers',
			'Plaintext HTTP (no TLS) is acceptable for your use case',
			'Your infrastructure cannot handle UDP-based traffic'
		],
		useRightWhen: [
			'Performance on lossy or mobile networks is critical',
			'You are building a new service with modern client requirements',
			'Fast connection establishment directly improves user experience',
			'Your deployment targets CDNs and cloud providers that support QUIC'
		]
	},
	{
		ids: ['http2', 'websockets'],
		type: 'vs',
		summary:
			'HTTP/2 provides multiplexed request-response with server push over a single connection; WebSocket provides a persistent, full-duplex message channel.',
		keyDifferences: [
			{ aspect: 'Direction', left: 'Request-response + server push', right: 'Full-duplex persistent channel' },
			{ aspect: 'Data format', left: 'HTTP semantics (headers, status codes)', right: 'Raw frames (text or binary)' },
			{ aspect: 'Multiplexing', left: 'Many concurrent request/response streams', right: 'Single bidirectional channel' },
			{ aspect: 'Caching', left: 'Standard HTTP caching works', right: 'No HTTP caching (custom protocol)' },
			{ aspect: 'Complexity', left: 'Standard HTTP (works with existing tooling)', right: 'Requires upgrade handshake, custom framing' }
		],
		useLeftWhen: [
			'Your communication follows request-response patterns (APIs, page loads)',
			'You need HTTP caching, status codes, and standard middleware',
			'Server push is sufficient for proactive data delivery',
			'You want multiplexed streams without leaving the HTTP ecosystem'
		],
		useRightWhen: [
			'Both sides send data at any time without request-response structure',
			'You are building chat, collaborative editing, or real-time dashboards',
			'Sub-second bidirectional latency is critical',
			'You need a long-lived channel for event-driven communication'
		]
	},
	{
		ids: ['rest', 'websockets'],
		type: 'vs',
		summary:
			'REST follows a stateless request-response model ideal for CRUD operations; WebSocket maintains a persistent connection for real-time bidirectional communication.',
		keyDifferences: [
			{ aspect: 'Statefulness', left: 'Stateless (each request is independent)', right: 'Stateful (persistent connection)' },
			{ aspect: 'Direction', left: 'Client-initiated requests only', right: 'Full-duplex (either side can send anytime)' },
			{ aspect: 'Caching', left: 'Built-in HTTP caching', right: 'No caching (real-time stream)' },
			{ aspect: 'Overhead', left: 'Full HTTP headers per request', right: 'Minimal framing after handshake (2-14 bytes)' },
			{ aspect: 'Complexity', left: 'Simple, well-understood conventions', right: 'Requires connection management and reconnection logic' }
		],
		useLeftWhen: [
			'Your operations are CRUD-style (create, read, update, delete)',
			'Requests are independent and benefit from HTTP caching',
			'You are building a public API consumed by many different clients',
			'Statelessness simplifies horizontal scaling and load balancing'
		],
		useRightWhen: [
			'You need instant push updates from server to client',
			'Both client and server send messages frequently and unpredictably',
			'Per-message overhead must be minimized (high-frequency updates)',
			'Your application is inherently event-driven (chat, trading, gaming)'
		]
	},
	{
		ids: ['graphql', 'sse'],
		type: 'vs',
		summary:
			'GraphQL lets clients query exactly the data they need via flexible queries; SSE provides a simple server-push stream for real-time updates over HTTP.',
		keyDifferences: [
			{ aspect: 'Direction', left: 'Request-response + subscriptions', right: 'Server-to-client push only' },
			{ aspect: 'Data format', left: 'Client-defined query shapes (JSON)', right: 'Server-defined event stream (text)' },
			{ aspect: 'Complexity', left: 'Schema, resolvers, query parsing', right: 'Simple EventSource API' },
			{ aspect: 'Caching', left: 'Complex (query-level)', right: 'HTTP-level caching possible' },
			{ aspect: 'Browser support', left: 'Requires fetch/library', right: 'Native EventSource API' }
		],
		useLeftWhen: [
			'Clients need to specify exactly which fields and relations to fetch',
			'You need both queries and real-time subscriptions in one system',
			'Your data model is deeply nested and varies by client type',
			'You want a single flexible endpoint rather than many fixed event streams'
		],
		useRightWhen: [
			'You only need server-to-client push (notifications, live scores)',
			'Simplicity and minimal infrastructure are priorities',
			'Your events have a fixed, well-known structure',
			'Auto-reconnection and event ID resumption are important'
		]
	},
	{
		ids: ['http2', 'rest'],
		type: 'vs',
		summary:
			'REST is an architectural style defining how to structure APIs; HTTP/2 is a transport protocol that improves how HTTP requests are delivered — they operate at different levels but their features overlap in practice.',
		keyDifferences: [
			{ aspect: 'Multiplexing', left: 'Multiple concurrent streams natively', right: 'One request per connection (uses multiple connections)' },
			{ aspect: 'Direction', left: 'Server push for proactive delivery', right: 'Client-initiated requests only' },
			{ aspect: 'Header size', left: 'HPACK compressed (binary)', right: 'Full text headers repeated per request' },
			{ aspect: 'Data format', left: 'Binary framing layer', right: 'Text-based HTTP semantics' },
			{ aspect: 'Complexity', left: 'Requires TLS in practice, binary debugging', right: 'Simple, human-readable, curl-friendly' }
		],
		useLeftWhen: [
			'Many resources are loaded concurrently (web pages with dozens of assets)',
			'Header overhead per request is significant (auth tokens, cookies)',
			'Server push can preemptively deliver critical resources',
			'You are optimizing an existing REST API without changing its design'
		],
		useRightWhen: [
			'Simplicity, readability, and universal tooling support matter most',
			'Your API serves few, large responses rather than many small ones',
			'Clients include legacy systems that do not support HTTP/2',
			'Debugging ease is more important than transport-level optimization'
		]
	},

	// ── Async / IoT ─────────────────────────────────────────────

	{
		ids: ['amqp', 'mqtt'],
		type: 'vs',
		summary:
			'MQTT is ultra-lightweight pub/sub designed for constrained IoT devices; AMQP is a feature-rich message broker protocol for enterprise messaging with routing, transactions, and delivery guarantees.',
		keyDifferences: [
			{ aspect: 'Overhead', left: 'Feature-rich (higher overhead)', right: 'Minimal (2-byte header possible)' },
			{ aspect: 'Data format', left: 'Binary with rich semantics', right: 'Binary with simple topic-based pub/sub' },
			{ aspect: 'Reliability', left: 'Transactions, dead-lettering, acknowledgments', right: 'QoS 0/1/2 (fire-forget to exactly-once)' },
			{ aspect: 'Complexity', left: 'Exchanges, queues, bindings, routing keys', right: 'Simple topic hierarchy with wildcards' },
			{ aspect: 'Ecosystem', left: 'RabbitMQ, enterprise integration', right: 'Mosquitto, AWS IoT, Azure IoT Hub' }
		],
		useLeftWhen: [
			'You need complex routing (topic, direct, fanout, headers exchange)',
			'Transactional messaging and dead-letter queues are required',
			'Your system is enterprise middleware (order processing, ERP integration)',
			'Messages need rich metadata and fine-grained delivery control'
		],
		useRightWhen: [
			'Devices are constrained (low bandwidth, battery-powered sensors)',
			'Simple topic-based pub/sub is sufficient for your use case',
			'You need retained messages and last-will-and-testament features',
			'Minimal bandwidth overhead is critical (satellite, cellular IoT)'
		]
	},
	{
		ids: ['amqp', 'stomp'],
		type: 'vs',
		summary:
			'AMQP is a binary, feature-complete message broker protocol; STOMP is a text-based, deliberately simple messaging protocol designed for easy client implementation.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Binary with rich type system', right: 'Text-based (like HTTP, human-readable)' },
			{ aspect: 'Complexity', left: 'Exchanges, queues, bindings, routing', right: 'Simple SEND/SUBSCRIBE/UNSUBSCRIBE' },
			{ aspect: 'Reliability', left: 'Transactions, publisher confirms, dead-lettering', right: 'Basic acknowledgments only' },
			{ aspect: 'Browser support', left: 'Requires AMQP client library', right: 'Easy over WebSocket (text protocol)' },
			{ aspect: 'Ecosystem', left: 'RabbitMQ, Qpid, Azure Service Bus', right: 'ActiveMQ, RabbitMQ (STOMP plugin)' }
		],
		useLeftWhen: [
			'You need advanced routing, transactions, and delivery guarantees',
			'High throughput and binary efficiency matter',
			'Your messaging topology is complex (multiple exchanges, routing patterns)',
			'You are building enterprise integration middleware'
		],
		useRightWhen: [
			'You want the simplest possible messaging client (few lines of code)',
			'Browser clients need to connect via WebSocket without heavy libraries',
			'Interoperability across many languages is more important than features',
			'Your messaging needs are simple subscribe-and-receive patterns'
		]
	},
	{
		ids: ['coap', 'mqtt'],
		type: 'vs',
		summary:
			'MQTT is a pub/sub protocol connecting many devices through a central broker; CoAP is a request-response protocol for direct device-to-device communication modeled after HTTP.',
		keyDifferences: [
			{ aspect: 'Connection model', left: 'Request-response (like HTTP)', right: 'Publish-subscribe via broker' },
			{ aspect: 'Transport', left: 'UDP (connectionless)', right: 'TCP (persistent connection to broker)' },
			{ aspect: 'Direction', left: 'Client-server (device to device)', right: 'Many-to-many via central broker' },
			{ aspect: 'Overhead', left: '4-byte header, compact binary', right: '2-byte minimum header' },
			{ aspect: 'Complexity', left: 'REST-like (GET, PUT, POST, DELETE)', right: 'Pub/sub (CONNECT, PUBLISH, SUBSCRIBE)' }
		],
		useLeftWhen: [
			'Devices communicate directly without a central broker',
			'You need REST-like semantics (resource URIs, methods) in constrained networks',
			'UDP is preferred for low-power, lossy networks (6LoWPAN, NB-IoT)',
			'Your IoT devices act as both clients and servers'
		],
		useRightWhen: [
			'Many devices publish to and subscribe from a central message broker',
			'You need topic-based fan-out to multiple subscribers',
			'Reliable TCP connections to a broker are feasible',
			'Retained messages and last-will features are needed'
		]
	},
	{
		ids: ['stomp', 'xmpp'],
		type: 'vs',
		summary:
			'STOMP is a minimal text-based messaging protocol for queue/topic messaging; XMPP is a rich XML-based protocol for presence-aware, federated real-time communication.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Simple text frames (like HTTP)', right: 'XML stanzas (verbose but extensible)' },
			{ aspect: 'Complexity', left: 'Minimal (SEND, SUBSCRIBE, ACK)', right: 'Rich (presence, roster, multi-user chat, extensions)' },
			{ aspect: 'Direction', left: 'Queue/topic messaging via broker', right: 'Peer-to-peer with optional server federation' },
			{ aspect: 'Ecosystem', left: 'ActiveMQ, RabbitMQ STOMP plugin', right: 'ejabberd, Prosody, Openfire' },
			{ aspect: 'Standardization', left: 'Simple spec, few extensions', right: 'Hundreds of XEPs (extension protocols)' }
		],
		useLeftWhen: [
			'You need simple, lightweight queue or topic messaging',
			'Browser clients connect via WebSocket to a message broker',
			'Minimal protocol overhead and client complexity are priorities',
			'Your messaging is point-to-point or basic pub/sub'
		],
		useRightWhen: [
			'You need presence awareness (online/offline/away status)',
			'Federated communication across domains is required (like email)',
			'Rich messaging features are needed (group chat, file transfer, typing indicators)',
			'Your system needs extensibility through the XEP ecosystem'
		]
	},
	{
		ids: ['amqp', 'kafka'],
		type: 'vs',
		summary:
			'AMQP brokers (like RabbitMQ) route individual messages with rich delivery semantics; Kafka is a distributed log that persists ordered event streams for replay and high-throughput processing.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Message broker (consume = delete)', right: 'Append-only log (consume = read offset)' },
			{ aspect: 'Ordering', left: 'Per-queue ordering', right: 'Per-partition ordering (scalable)' },
			{ aspect: 'Reliability', left: 'Per-message acknowledgments', right: 'Offset-based consumer tracking' },
			{ aspect: 'Complexity', left: 'Rich routing (exchanges, bindings)', right: 'Simple topic/partition model' },
			{ aspect: 'Throughput', left: 'Lower (routing overhead per message)', right: 'Very high (sequential I/O, batching)' }
		],
		useLeftWhen: [
			'You need complex message routing (fanout, topic, header-based)',
			'Messages should be consumed once and removed from the queue',
			'Per-message acknowledgment and dead-letter handling are required',
			'Your workload is task distribution (job queues, RPC patterns)'
		],
		useRightWhen: [
			'You need to replay or reprocess historical events (event sourcing)',
			'Throughput requirements are very high (millions of events/second)',
			'Multiple independent consumers need to read the same stream',
			'You are building event-driven architectures or stream processing pipelines'
		]
	},

	// ── Real-Time A/V ───────────────────────────────────────────

	{
		ids: ['dash', 'hls'],
		type: 'vs',
		summary:
			'HLS is Apple\'s HTTP-based adaptive streaming protocol with near-universal player support; DASH is the open, codec-agnostic MPEG standard for adaptive streaming.',
		keyDifferences: [
			{ aspect: 'Standardization', left: 'Open MPEG standard (ISO/IEC 23009)', right: 'Apple proprietary (widely adopted)' },
			{ aspect: 'Data format', left: 'MPD manifest (XML)', right: 'M3U8 playlist (text)' },
			{ aspect: 'Complexity', left: 'Codec-agnostic, more flexible', right: 'Simpler, opinionated defaults' },
			{ aspect: 'Browser support', left: 'Requires MSE/JavaScript player', right: 'Native in Safari/iOS, MSE elsewhere' },
			{ aspect: 'Ecosystem', left: 'YouTube, Netflix, Disney+', right: 'Apple TV+, Twitch, most live streams' }
		],
		useLeftWhen: [
			'You need codec flexibility (AV1, VP9) beyond H.264/H.265',
			'DRM interoperability across platforms is critical (Widevine, PlayReady)',
			'Your platform is primarily Android, smart TVs, or web-based',
			'You want to follow the open MPEG standard'
		],
		useRightWhen: [
			'Apple ecosystem support (iOS, Safari, Apple TV) is mandatory',
			'You need the simplest possible adaptive streaming setup',
			'Live streaming with low-latency HLS extensions is your use case',
			'Maximum player compatibility out of the box is the priority'
		]
	},
	{
		ids: ['rtmp', 'rtp'],
		type: 'vs',
		summary:
			'RTP delivers real-time audio/video over UDP for interactive communication; RTMP delivers live streams over TCP for broadcasting to media servers.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'UDP (low latency, tolerates loss)', right: 'TCP (reliable, higher latency)' },
			{ aspect: 'Direction', left: 'Peer-to-peer or multicast', right: 'Client-to-server (ingest)' },
			{ aspect: 'Overhead', left: 'Minimal RTP header (12 bytes)', right: 'Chunked message format with handshake' },
			{ aspect: 'Complexity', left: 'Paired with RTCP for feedback', right: 'Self-contained streaming protocol' },
			{ aspect: 'Ecosystem', left: 'WebRTC, VoIP, video conferencing', right: 'OBS, Twitch ingest, Facebook Live' }
		],
		useLeftWhen: [
			'You are building interactive audio/video (calls, conferences)',
			'Sub-second latency is essential and packet loss is tolerable',
			'Peer-to-peer or multicast delivery is required',
			'Your system uses WebRTC or SIP for media transport'
		],
		useRightWhen: [
			'You are ingesting live streams to a media server (OBS to Twitch)',
			'Reliable delivery matters more than absolute lowest latency',
			'Your workflow is one-to-many broadcasting, not interactive calls',
			'You need a proven protocol for live stream publishing'
		]
	},
	{
		ids: ['sip', 'webrtc'],
		type: 'vs',
		summary:
			'SIP is the traditional telephony signaling protocol for VoIP and video calls; WebRTC provides browser-native peer-to-peer real-time communication without plugins.',
		keyDifferences: [
			{ aspect: 'Browser support', left: 'Requires SIP client/softphone', right: 'Native in all modern browsers' },
			{ aspect: 'Connection model', left: 'Client-server via SIP proxy/registrar', right: 'Peer-to-peer with STUN/TURN fallback' },
			{ aspect: 'Complexity', left: 'Mature telecom stack (SIP/SDP/RTP)', right: 'Integrated (ICE, DTLS-SRTP, SCTP)' },
			{ aspect: 'Ecosystem', left: 'Asterisk, FreeSWITCH, telecom carriers', right: 'Browsers, Twilio, Daily, Jitsi' },
			{ aspect: 'Standardization', left: 'IETF RFC 3261 (telecom-oriented)', right: 'W3C + IETF (web-oriented)' }
		],
		useLeftWhen: [
			'You are integrating with existing telephony infrastructure (PBX, PSTN)',
			'Enterprise VoIP or contact center systems are your target',
			'Interoperability with telecom carriers and SIP trunks is needed',
			'You need call routing, transfer, and PBX features'
		],
		useRightWhen: [
			'Users join calls directly from a web browser without installing software',
			'Peer-to-peer connections reduce server infrastructure costs',
			'You are building modern video apps (telemedicine, education, social)',
			'NAT traversal and firewall friendliness are critical'
		]
	},
	{
		ids: ['hls', 'rtmp'],
		type: 'vs',
		summary:
			'RTMP is used for live stream ingest from encoders to servers; HLS is used for delivery from servers to viewers via HTTP-based adaptive streaming.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'HTTP (segment-based delivery)', right: 'TCP (persistent chunked stream)' },
			{ aspect: 'Direction', left: 'Server-to-viewer (playback)', right: 'Encoder-to-server (ingest/publish)' },
			{ aspect: 'Overhead', left: 'Segment-based (~2-6s chunks)', right: 'Low-latency continuous stream' },
			{ aspect: 'Browser support', left: 'Native in Safari, MSE elsewhere', right: 'No browser support (Flash deprecated)' },
			{ aspect: 'Ecosystem', left: 'Viewers: all devices and CDNs', right: 'Ingest: OBS, Wirecast, FFmpeg' }
		],
		useLeftWhen: [
			'You are delivering video to end viewers (playback side)',
			'Adaptive bitrate streaming across varying network conditions is needed',
			'CDN distribution and HTTP caching are part of your architecture',
			'You need broad device compatibility for playback'
		],
		useRightWhen: [
			'You are publishing a live stream from an encoder to a media server',
			'Low-latency ingest from the source is the priority',
			'Your streaming software (OBS, Wirecast) uses RTMP natively',
			'You need a persistent connection for live content contribution'
		]
	},
	{
		ids: ['dash', 'rtmp'],
		type: 'vs',
		summary:
			'RTMP is a persistent TCP-based protocol for live stream ingest; DASH is an HTTP-based adaptive streaming protocol for scalable video delivery to viewers.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'HTTP (segment downloads)', right: 'TCP (persistent connection)' },
			{ aspect: 'Direction', left: 'Server-to-viewer (delivery)', right: 'Encoder-to-server (ingest)' },
			{ aspect: 'Standardization', left: 'Open MPEG standard', right: 'Originally Adobe (now open)' },
			{ aspect: 'Complexity', left: 'Adaptive bitrate with MPD manifests', right: 'Simple publish/play model' },
			{ aspect: 'Browser support', left: 'Via MSE/JavaScript player', right: 'No browser support (Flash deprecated)' }
		],
		useLeftWhen: [
			'You are building the viewer-facing delivery pipeline',
			'Codec flexibility (AV1, VP9, H.265) is required',
			'DRM protection (Widevine, PlayReady) is needed',
			'Adaptive bitrate streaming across heterogeneous networks is critical'
		],
		useRightWhen: [
			'You are ingesting live streams from encoders (OBS, FFmpeg)',
			'A persistent, low-latency publishing connection is needed',
			'Your media server accepts RTMP as the contribution format',
			'You need real-time stream publishing with minimal buffering'
		]
	},

	// ── Utilities / Security ────────────────────────────────────

	{
		ids: ['ssh', 'tls'],
		type: 'vs',
		summary:
			'TLS secures arbitrary application protocols transparently (HTTPS, SMTPS); SSH provides an encrypted channel specifically for remote shell access, file transfer, and port forwarding.',
		keyDifferences: [
			{ aspect: 'Connection model', left: 'Interactive shell + channels (multiplex)', right: 'Transparent wrapper around any protocol' },
			{ aspect: 'Complexity', left: 'Built-in auth, shell, file transfer, tunneling', right: 'Pure encryption/auth layer (no application features)' },
			{ aspect: 'Data format', left: 'Channel-based (shell, SCP, SFTP, port forward)', right: 'Stream encryption (application handles framing)' },
			{ aspect: 'Ecosystem', left: 'OpenSSH, PuTTY, remote administration', right: 'Web browsers, email servers, API gateways' },
			{ aspect: 'Browser support', left: 'No browser support (terminal clients)', right: 'Native in all browsers (HTTPS)' }
		],
		useLeftWhen: [
			'You need remote shell access or command execution on servers',
			'Secure file transfer (SCP/SFTP) is required',
			'You want encrypted tunnels or port forwarding through firewalls',
			'Key-based authentication for server administration is the use case'
		],
		useRightWhen: [
			'You are securing a web protocol (HTTP, SMTP, FTP, MQTT)',
			'Browser clients must connect securely without special software',
			'Your application needs transparent encryption without changing its protocol',
			'Certificate-based trust via public CAs (Let\'s Encrypt) is preferred'
		]
	}
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// "RELATIONSHIP" PAIRS — Dependency / composition (work together)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const relationshipPairs: ProtocolPair[] = [
	// ── TCP as transport ─────────────────────────────────────────

	{
		ids: ['tcp', 'tls'],
		type: 'relationship',
		summary:
			'TLS encrypts the byte stream that TCP reliably delivers, together forming the secure transport foundation for HTTPS and most encrypted internet traffic.',
		howTheyWork:
			'TCP first establishes a reliable connection via its 3-way handshake. Then TLS performs its own handshake on top of that TCP connection, negotiating cipher suites and exchanging keys. Once both handshakes complete, all application data flows through TLS encryption over the TCP stream.',
		leftRole: 'TCP provides reliable, ordered byte-stream delivery between endpoints.',
		rightRole: 'TLS provides confidentiality, integrity, and authentication for the data TCP carries.'
	},
	{
		ids: ['amqp', 'tcp'],
		type: 'relationship',
		summary:
			'AMQP runs over TCP, relying on its reliable byte stream to guarantee that messages, acknowledgments, and routing commands between clients and brokers are never lost or reordered.',
		howTheyWork:
			'An AMQP client opens a TCP connection to the broker (typically port 5672) and performs the AMQP protocol handshake to negotiate capabilities. AMQP then multiplexes multiple logical channels over this single TCP connection, using TCP\'s reliability to ensure every published message, acknowledgment, and broker command arrives intact and in order.',
		leftRole: 'AMQP provides message routing, queuing, acknowledgment, and delivery guarantee semantics.',
		rightRole: 'TCP provides the reliable, ordered byte-stream transport that AMQP frames are carried over.'
	},
	{
		ids: ['dns', 'tcp'],
		type: 'relationship',
		summary:
			'DNS falls back to TCP when responses exceed the 512-byte UDP limit or when zone transfers require reliable delivery of complete DNS records.',
		howTheyWork:
			'When a DNS response is too large for a single UDP datagram (common with DNSSEC or many records), the server signals truncation and the client retries over TCP port 53. Zone transfers (AXFR/IXFR) between authoritative servers always use TCP to ensure the complete zone dataset is delivered reliably without loss or reordering.',
		leftRole: 'DNS defines the query/response protocol for name resolution and zone transfer operations.',
		rightRole: 'TCP provides reliable delivery for large DNS responses and complete zone transfers that exceed UDP\'s practical limits.'
	},
	{
		ids: ['ftp', 'tcp'],
		type: 'relationship',
		summary:
			'FTP uses TCP for both its control channel (commands and responses) and its separate data channel (file transfers), relying on reliable delivery to ensure files arrive intact.',
		howTheyWork:
			'FTP establishes a TCP control connection on port 21 for exchanging commands (LIST, RETR, STOR) and status replies. For each file transfer, a separate TCP data connection is opened — either from server to client (active mode) or client to server (passive mode). TCP\'s reliability guarantees that transferred files are complete and uncorrupted.',
		leftRole: 'FTP provides the command protocol for file listing, upload, download, and directory navigation.',
		rightRole: 'TCP provides reliable, ordered delivery for both the FTP control channel and file data transfers.'
	},
	{
		ids: ['http1', 'tcp'],
		type: 'relationship',
		summary:
			'HTTP/1.1 sends requests and responses as plaintext over TCP connections, relying on TCP\'s reliable delivery to ensure every header and body byte arrives in order.',
		howTheyWork:
			'The client opens a TCP connection (typically port 80 or 443 with TLS) and sends an HTTP request as a text stream. The server responds over the same connection, which can be reused for subsequent requests via keep-alive. Each request-response pair is serialized on the connection, meaning HTTP/1.1 inherits TCP\'s head-of-line blocking.',
		leftRole: 'HTTP/1.1 provides the request-response semantics, headers, methods, and status codes for web communication.',
		rightRole: 'TCP provides the reliable, ordered byte stream that HTTP/1.1 messages are transmitted over.'
	},
	{
		ids: ['http2', 'tcp'],
		type: 'relationship',
		summary:
			'HTTP/2 multiplexes many request-response streams over a single TCP connection, gaining efficiency but inheriting TCP-level head-of-line blocking when packets are lost.',
		howTheyWork:
			'HTTP/2 opens one TCP connection per origin and sends all requests as interleaved binary frames across independent logical streams. TCP sees this as a single byte stream and guarantees ordered delivery. If any TCP segment is lost, all HTTP/2 streams stall until retransmission completes — this TCP-level head-of-line blocking is what HTTP/3 (QUIC) was designed to solve.',
		leftRole: 'HTTP/2 provides binary framing, multiplexed streams, header compression, and server push.',
		rightRole: 'TCP provides the single reliable byte stream over which all HTTP/2 frames are delivered.'
	},
	{
		ids: ['kafka', 'tcp'],
		type: 'relationship',
		summary:
			'Kafka uses persistent TCP connections between producers, consumers, and brokers to reliably stream high-throughput event data with ordering guarantees.',
		howTheyWork:
			'Kafka clients open long-lived TCP connections to brokers (default port 9092) and use Kafka\'s binary protocol to produce and consume messages in batches. TCP\'s reliable delivery ensures that large batches of events, offset commits, and metadata requests are never lost or reordered. Clients maintain connections to multiple brokers for partition-aware routing.',
		leftRole: 'Kafka provides distributed log storage, partitioned topic streaming, and consumer group coordination.',
		rightRole: 'TCP provides the reliable, persistent connections needed for high-throughput event delivery between Kafka clients and brokers.'
	},
	{
		ids: ['mqtt', 'tcp'],
		type: 'relationship',
		summary:
			'MQTT uses TCP as its default transport, relying on TCP\'s reliable delivery to carry lightweight pub/sub messages between IoT devices and brokers.',
		howTheyWork:
			'An MQTT client opens a TCP connection to the broker (typically port 1883, or 8883 with TLS) and sends a CONNECT packet to establish the session. TCP\'s reliability ensures that PUBLISH, SUBSCRIBE, and acknowledgment packets arrive intact, which MQTT layers its own QoS levels on top of. The persistent TCP connection also enables the broker to push messages to clients at any time.',
		leftRole: 'MQTT provides lightweight publish-subscribe messaging with QoS levels, retained messages, and last-will semantics.',
		rightRole: 'TCP provides the reliable, persistent connection that MQTT uses to deliver messages between clients and the broker.'
	},
	{
		ids: ['rtmp', 'tcp'],
		type: 'relationship',
		summary:
			'RTMP runs over persistent TCP connections to reliably deliver live audio, video, and data streams from encoders to media servers.',
		howTheyWork:
			'RTMP establishes a TCP connection (default port 1935) and performs its own handshake to negotiate the session. It then multiplexes audio, video, and command messages as interleaved chunks over this single TCP connection. TCP\'s reliable delivery ensures no media chunks are lost, which is critical since RTMP\'s chunk-based protocol cannot recover from gaps.',
		leftRole: 'RTMP provides the media chunking, multiplexing, and stream control protocol for live streaming.',
		rightRole: 'TCP provides the reliable, persistent connection that ensures every media chunk is delivered in order.'
	},
	{
		ids: ['sip', 'tcp'],
		type: 'relationship',
		summary:
			'SIP can use TCP for signaling when messages are too large for UDP datagrams or when reliable delivery of call setup and teardown is required.',
		howTheyWork:
			'SIP operates over TCP (port 5060, or 5061 with TLS) when message sizes exceed the MTU or when the deployment requires guaranteed delivery of INVITE, BYE, and REGISTER transactions. TCP ensures that large SIP messages with SDP bodies, authentication headers, or multiple Via hops are delivered complete and in order.',
		leftRole: 'SIP provides the signaling protocol for initiating, modifying, and terminating multimedia sessions.',
		rightRole: 'TCP provides reliable delivery for SIP messages that are too large for UDP or require guaranteed transport.'
	},
	{
		ids: ['smtp', 'tcp'],
		type: 'relationship',
		summary:
			'SMTP uses TCP to reliably deliver email messages and commands between mail clients and servers, ensuring no message data is lost in transit.',
		howTheyWork:
			'An SMTP client opens a TCP connection to the mail server on port 25 (or 587 for submission) and exchanges text commands (EHLO, MAIL FROM, RCPT TO, DATA) in a synchronous dialogue. TCP\'s reliable delivery guarantees that every command, response code, and email body byte arrives in order, which is essential since SMTP has no mechanism to recover from lost data at the application layer.',
		leftRole: 'SMTP provides the command protocol for routing and delivering email messages between servers.',
		rightRole: 'TCP provides the reliable, ordered connection that SMTP\'s synchronous command-response dialogue requires.'
	},
	{
		ids: ['ssh', 'tcp'],
		type: 'relationship',
		summary:
			'SSH runs over TCP to provide encrypted remote shell access, file transfer, and port forwarding over a reliable transport.',
		howTheyWork:
			'SSH opens a TCP connection (default port 22) and immediately begins its own key exchange and authentication handshake. Once the encrypted tunnel is established, SSH multiplexes multiple channels (shell sessions, port forwards, file transfers) over the single TCP connection. TCP\'s reliability is essential because SSH\'s encrypted stream cannot tolerate missing or reordered bytes.',
		leftRole: 'SSH provides encrypted channels for remote shell access, file transfer, and port forwarding.',
		rightRole: 'TCP provides the reliable, ordered byte stream that SSH\'s encrypted tunnel requires to function correctly.'
	},
	{
		ids: ['stomp', 'tcp'],
		type: 'relationship',
		summary:
			'STOMP sends its text-based messaging frames over TCP connections, relying on TCP\'s reliability to ensure message commands and acknowledgments are delivered intact.',
		howTheyWork:
			'A STOMP client opens a TCP connection to the broker and sends a CONNECT frame to initiate the session. All subsequent SEND, SUBSCRIBE, and ACK frames are transmitted as text over this TCP connection. TCP guarantees that these frames arrive complete and in order, which STOMP depends on since its simple text framing has no built-in retransmission or reordering logic.',
		leftRole: 'STOMP provides a simple, text-based messaging protocol with SEND, SUBSCRIBE, and ACK commands.',
		rightRole: 'TCP provides the reliable transport that ensures STOMP\'s text frames are delivered without loss or reordering.'
	},
	{
		ids: ['tcp', 'websockets'],
		type: 'relationship',
		summary:
			'WebSocket runs over TCP, using an HTTP upgrade handshake to establish a persistent, full-duplex message channel over a reliable transport.',
		howTheyWork:
			'The client sends an HTTP/1.1 Upgrade request over an existing TCP connection, and the server responds with 101 Switching Protocols. From that point, the TCP connection carries WebSocket frames instead of HTTP. TCP\'s reliable, ordered delivery ensures that WebSocket messages — which can be fragmented across multiple frames — are reassembled correctly on both sides.',
		leftRole: 'TCP provides the reliable, persistent connection that WebSocket frames are transmitted over.',
		rightRole: 'WebSocket provides full-duplex, message-oriented communication with lightweight framing over the TCP connection.'
	},
	{
		ids: ['tcp', 'xmpp'],
		type: 'relationship',
		summary:
			'XMPP maintains long-lived TCP connections to stream XML stanzas between clients and servers, relying on TCP for reliable delivery of presence, messages, and IQ queries.',
		howTheyWork:
			'An XMPP client opens a persistent TCP connection (default port 5222, with STARTTLS upgrade) and begins an XML stream. All communication — presence updates, chat messages, and IQ stanzas — flows as XML fragments over this single TCP connection. TCP\'s reliability ensures that XML stanzas are never lost or reordered, which is critical since XMPP\'s XML parser requires a well-formed, sequential byte stream.',
		leftRole: 'TCP provides the persistent, reliable connection that carries XMPP\'s continuous XML stream.',
		rightRole: 'XMPP provides real-time messaging, presence, and extensible communication semantics via XML stanzas over the TCP stream.'
	},

	// ── UDP as transport ─────────────────────────────────────────

	{
		ids: ['dns', 'udp'],
		type: 'relationship',
		summary:
			'DNS uses UDP as its primary transport for fast, single-packet query-response lookups, keeping name resolution lightweight and low-latency.',
		howTheyWork:
			'A DNS client sends a query as a single UDP datagram (typically under 512 bytes) to a resolver on port 53. The resolver responds with another UDP datagram containing the answer. No connection setup is needed, making lookups fast. For responses exceeding 512 bytes or requiring reliability, DNS falls back to TCP.',
		leftRole: 'DNS defines the query/response format for translating domain names to IP addresses.',
		rightRole: 'UDP provides the fast, connectionless transport that makes single-packet DNS lookups efficient.'
	},
	{
		ids: ['coap', 'udp'],
		type: 'relationship',
		summary:
			'CoAP runs over UDP to provide a lightweight REST-like request-response model for constrained IoT devices that cannot afford TCP\'s overhead.',
		howTheyWork:
			'CoAP sends compact binary messages as UDP datagrams, using a 4-byte fixed header and message IDs for optional reliability via confirmable messages. The client sends a CoAP request (GET, PUT, POST, DELETE) in a single UDP packet to the server, which replies with a response in another datagram. CoAP adds its own simple retransmission over UDP rather than requiring TCP\'s full connection management.',
		leftRole: 'CoAP provides RESTful resource semantics (methods, URIs, content negotiation) optimized for constrained networks.',
		rightRole: 'UDP provides the minimal, connectionless transport that keeps CoAP lightweight enough for battery-powered sensors.'
	},
	{
		ids: ['dhcp', 'udp'],
		type: 'relationship',
		summary:
			'DHCP uses UDP for automatic IP address assignment, since clients cannot establish TCP connections before they have an IP address.',
		howTheyWork:
			'A DHCP client broadcasts a DISCOVER message from port 68 as a UDP datagram because it has no IP address yet and cannot perform TCP\'s handshake. The DHCP server listens on port 67 and responds with an OFFER, also via UDP broadcast or unicast. This bootstrap problem makes UDP the only viable transport — TCP requires an established IP address on both sides before communication can begin.',
		leftRole: 'DHCP provides the protocol logic for discovering servers, requesting leases, and assigning IP configuration.',
		rightRole: 'UDP provides the connectionless transport necessary for communication before a client has an IP address.'
	},
	{
		ids: ['http3', 'udp'],
		type: 'relationship',
		summary:
			'HTTP/3 runs over QUIC, which itself runs over UDP, giving HTTP/3 multiplexed streams without TCP\'s head-of-line blocking while remaining deployable on existing networks.',
		howTheyWork:
			'UDP carries QUIC packets, which in turn carry HTTP/3 frames. QUIC builds reliable, encrypted, multiplexed streams on top of UDP datagrams, and HTTP/3 maps its request-response semantics onto those QUIC streams. UDP\'s universal NAT and firewall traversal makes QUIC deployable without changes to network infrastructure.',
		leftRole: 'HTTP/3 provides the application-layer request-response semantics, header compression (QPACK), and server push.',
		rightRole: 'UDP provides the underlying datagram delivery that allows QUIC and HTTP/3 to bypass TCP\'s head-of-line blocking.'
	},
	{
		ids: ['ntp', 'udp'],
		type: 'relationship',
		summary:
			'NTP uses UDP for clock synchronization because accurate timekeeping requires minimal, predictable latency that TCP\'s handshake and retransmissions would distort.',
		howTheyWork:
			'An NTP client sends a small UDP datagram (48 bytes) to a time server on port 123, recording its send timestamp. The server stamps the packet with its receive and transmit times, then replies via UDP. The client uses all four timestamps to calculate network delay and clock offset. TCP\'s variable latency from connection setup and retransmission would corrupt these precise timing measurements.',
		leftRole: 'NTP provides the timestamping protocol and algorithms for calculating clock offset and drift.',
		rightRole: 'UDP provides the lightweight, fixed-overhead transport that preserves the timing accuracy NTP requires.'
	},
	{
		ids: ['rtp', 'udp'],
		type: 'relationship',
		summary:
			'RTP carries real-time audio and video over UDP, accepting occasional packet loss in exchange for the low latency that interactive media demands.',
		howTheyWork:
			'RTP adds a 12-byte header to each media packet with sequence numbers, timestamps, and payload type identifiers, then sends them as UDP datagrams. The receiver uses sequence numbers to detect loss and reorder packets, and timestamps to synchronize playback. UDP\'s lack of retransmission is a feature here — retransmitting a dropped video frame would arrive too late to be useful.',
		leftRole: 'RTP provides media framing, sequencing, timestamping, and payload identification for audio/video streams.',
		rightRole: 'UDP provides the low-latency, no-retransmission transport that real-time media playback requires.'
	},
	{
		ids: ['sctp', 'udp'],
		type: 'relationship',
		summary:
			'SCTP can be encapsulated inside UDP datagrams to traverse NATs and firewalls that would otherwise block native SCTP packets.',
		howTheyWork:
			'Since most NAT devices and firewalls only understand TCP and UDP, SCTP packets are wrapped inside UDP datagrams (RFC 6951) to pass through unmodified network infrastructure. The UDP header provides the NAT-traversal capability while SCTP inside provides multi-streaming, message boundaries, and multi-homing. This encapsulation is how WebRTC data channels deliver SCTP over the public internet.',
		leftRole: 'SCTP provides multi-stream, message-oriented reliable delivery with built-in multi-homing.',
		rightRole: 'UDP provides the NAT-traversable envelope that lets SCTP packets cross firewalls and middleboxes on the public internet.'
	},
	{
		ids: ['sip', 'udp'],
		type: 'relationship',
		summary:
			'SIP commonly uses UDP for VoIP call signaling because its short, independent messages benefit from UDP\'s low overhead and fast delivery.',
		howTheyWork:
			'SIP sends signaling messages (INVITE, ACK, BYE) as UDP datagrams, typically on port 5060. Each SIP message is self-contained and fits within a single datagram, making TCP\'s connection overhead unnecessary for most call setups. SIP includes its own application-layer retransmission timers for reliability, re-sending requests if no response arrives within the timeout period.',
		leftRole: 'SIP provides the signaling protocol for initiating, modifying, and terminating multimedia sessions.',
		rightRole: 'UDP provides the fast, connectionless transport that keeps call setup latency low for VoIP signaling.'
	},
	{
		ids: ['udp', 'webrtc'],
		type: 'relationship',
		summary:
			'WebRTC uses UDP as its primary transport for peer-to-peer audio, video, and data channels, prioritizing low latency over guaranteed delivery.',
		howTheyWork:
			'WebRTC\'s media stack sends SRTP-encrypted audio/video packets as UDP datagrams between peers, using ICE for NAT traversal via STUN/TURN. Data channels use SCTP encapsulated in DTLS over UDP. The entire WebRTC transport is built on UDP because interactive communication requires packets to arrive quickly or not at all — TCP\'s retransmission would add unacceptable delay.',
		leftRole: 'UDP provides the low-latency datagram transport that all WebRTC media and data channels are built upon.',
		rightRole: 'WebRTC provides the peer-to-peer media framework, encryption (DTLS/SRTP), NAT traversal (ICE), and data channels on top.'
	},

	// ── TLS encryption ───────────────────────────────────────────

	{
		ids: ['amqp', 'tls'],
		type: 'relationship',
		summary:
			'TLS wraps AMQP connections to create AMQPS, encrypting all message broker communication between clients and servers.',
		howTheyWork:
			'An AMQP client connects to port 5671 (AMQPS) and performs a TLS handshake before any AMQP protocol negotiation begins. Once TLS is established, the standard AMQP handshake and all subsequent message publishing, consuming, and acknowledgments flow through the encrypted channel. Without TLS, credentials and message payloads travel in plaintext on the default port 5672.',
		leftRole: 'AMQP provides the message broker semantics — exchanges, queues, bindings, and delivery guarantees.',
		rightRole: 'TLS provides confidentiality, integrity, and authentication for all AMQP traffic.'
	},
	{
		ids: ['dash', 'tls'],
		type: 'relationship',
		summary:
			'DASH delivers adaptive streaming segments over HTTPS, relying on TLS to protect video content and DRM license exchanges in transit.',
		howTheyWork:
			'A DASH player fetches the MPD manifest and all media segments via HTTPS requests, each secured by TLS. The TLS layer encrypts segment downloads and prevents tampering, which is especially critical when DRM license acquisition URLs are embedded in the manifest.',
		leftRole: 'DASH defines the adaptive bitrate streaming logic, manifest format, and segment request pattern.',
		rightRole: 'TLS provides confidentiality and integrity for manifest and segment downloads over HTTPS.'
	},
	{
		ids: ['dns', 'tls'],
		type: 'relationship',
		summary:
			'DNS over TLS (DoT) encrypts DNS queries by wrapping them in a TLS connection on port 853, preventing eavesdropping and manipulation of name resolution.',
		howTheyWork:
			'A DNS client establishes a TLS connection to a resolver on port 853 (RFC 7858) before sending any DNS queries. Each query and response travels through the encrypted TLS channel, preventing network observers from seeing which domains are being resolved. Without DoT, standard DNS queries on port 53 are sent in plaintext and are trivially observable or spoofable.',
		leftRole: 'DNS provides the query/response protocol for translating domain names to IP addresses.',
		rightRole: 'TLS provides confidentiality and integrity, preventing eavesdropping and tampering of DNS lookups.'
	},
	{
		ids: ['ftp', 'tls'],
		type: 'relationship',
		summary:
			'FTPS adds TLS encryption to FTP, securing both the control channel (commands and credentials) and data channel (file transfers).',
		howTheyWork:
			'In explicit FTPS, the client connects to port 21 and issues an AUTH TLS command to upgrade the control connection to TLS before sending credentials. In implicit FTPS, the client connects directly to port 990 where TLS is required from the start. Both modes can also encrypt the data channel, ensuring file contents are protected in transit.',
		leftRole: 'FTP provides the file transfer commands, directory listing, and data channel negotiation.',
		rightRole: 'TLS provides confidentiality, integrity, and authentication for FTP control and data channels.'
	},
	{
		ids: ['grpc', 'tls'],
		type: 'relationship',
		summary:
			'gRPC strongly recommends TLS for all connections, and most deployments require it to authenticate services and encrypt Protobuf payloads in transit.',
		howTheyWork:
			'gRPC runs over HTTP/2, which in practice requires TLS. The TLS handshake authenticates the server (and optionally the client via mutual TLS) before any RPC calls are made. gRPC channel credentials are configured with TLS certificates, and the framework rejects insecure connections by default in production configurations.',
		leftRole: 'gRPC provides the RPC framework, Protobuf serialization, and service definition layer.',
		rightRole: 'TLS provides confidentiality, integrity, and mutual authentication for gRPC channels.'
	},
	{
		ids: ['hls', 'tls'],
		type: 'relationship',
		summary:
			'HLS delivers adaptive streaming playlists and media segments over HTTPS, relying on TLS to protect content and encryption keys in transit.',
		howTheyWork:
			'An HLS player fetches M3U8 playlists and .ts/.fmp4 segments via HTTPS, with TLS encrypting every request. This is critical because HLS playlists often reference AES-128 key URIs for content protection — without TLS, these decryption keys could be intercepted. Apple requires HTTPS for all HLS content in App Transport Security.',
		leftRole: 'HLS defines the playlist format, segment structure, and adaptive bitrate switching logic.',
		rightRole: 'TLS provides confidentiality and integrity for playlist, segment, and encryption key downloads.'
	},
	{
		ids: ['http1', 'tls'],
		type: 'relationship',
		summary:
			'TLS encrypts HTTP/1.1 connections to create HTTPS, the foundational secure web protocol serving the majority of internet traffic on port 443.',
		howTheyWork:
			'A client connects to port 443 and completes a TLS handshake, authenticating the server via its certificate and negotiating encryption keys. Once the TLS channel is established, standard HTTP/1.1 requests and responses flow through it with full encryption. Without TLS, HTTP/1.1 on port 80 transmits headers, cookies, and body content in plaintext.',
		leftRole: 'HTTP/1.1 provides the request-response semantics, methods, headers, and content negotiation.',
		rightRole: 'TLS provides confidentiality, integrity, and server authentication for all HTTP traffic.'
	},
	{
		ids: ['http2', 'tls'],
		type: 'relationship',
		summary:
			'HTTP/2 effectively requires TLS in practice, using the ALPN extension during the TLS handshake to negotiate the h2 protocol without an extra round trip.',
		howTheyWork:
			'Although HTTP/2 technically allows cleartext (h2c), all major browsers only support HTTP/2 over TLS. During the TLS handshake, the client advertises "h2" via ALPN (Application-Layer Protocol Negotiation), and the server selects it. This eliminates the need for an HTTP Upgrade dance and ensures the multiplexed binary connection is always encrypted.',
		leftRole: 'HTTP/2 provides multiplexed streams, header compression, and server push over a single connection.',
		rightRole: 'TLS provides encryption and enables h2 protocol negotiation via the ALPN extension.'
	},
	{
		ids: ['http3', 'tls'],
		type: 'relationship',
		summary:
			'HTTP/3 integrates TLS 1.3 directly into the QUIC transport layer, making encryption mandatory and reducing connection setup to a single round trip.',
		howTheyWork:
			'Unlike HTTP/1.1 and HTTP/2 where TLS is a separate layer on top of TCP, QUIC embeds the TLS 1.3 handshake into its own transport handshake. Cryptographic key negotiation happens simultaneously with connection establishment, achieving 1-RTT setup (or 0-RTT for resumed connections). Every QUIC packet is authenticated and encrypted — there is no unencrypted HTTP/3.',
		leftRole: 'HTTP/3 provides multiplexed request-response streams over QUIC without head-of-line blocking.',
		rightRole: 'TLS 1.3 provides the cryptographic handshake and encryption integrated directly into QUIC.'
	},
	{
		ids: ['kafka', 'tls'],
		type: 'relationship',
		summary:
			'Kafka supports TLS to encrypt all communication between producers, consumers, and brokers, as well as inter-broker replication traffic.',
		howTheyWork:
			'Kafka listeners can be configured with SSL/TLS security, requiring clients to perform a TLS handshake when connecting to brokers. TLS encrypts produce requests, fetch responses, and metadata exchanges. Combined with SASL authentication, TLS also enables mutual authentication between clients and brokers and secures inter-broker replication across data centers.',
		leftRole: 'Kafka provides the distributed log, topic partitioning, consumer groups, and replication.',
		rightRole: 'TLS provides confidentiality, integrity, and optional mutual authentication for Kafka connections.'
	},
	{
		ids: ['mptcp', 'tls'],
		type: 'relationship',
		summary:
			'TLS encrypts MPTCP connections just as it does standard TCP, securing data flowing across multiple network paths simultaneously.',
		howTheyWork:
			'MPTCP establishes multiple TCP subflows across different network interfaces (e.g., Wi-Fi and cellular). TLS operates on the MPTCP connection as a whole, performing its handshake once over the initial subflow. The encrypted TLS session then transparently spans all subflows, so data remains protected regardless of which network path carries it.',
		leftRole: 'MPTCP provides multi-path transport, aggregating bandwidth and enabling seamless failover.',
		rightRole: 'TLS provides confidentiality, integrity, and authentication across all MPTCP subflows.'
	},
	{
		ids: ['mqtt', 'tls'],
		type: 'relationship',
		summary:
			'TLS wraps MQTT connections to create MQTTS, encrypting all pub/sub messaging between IoT devices and the broker on port 8883.',
		howTheyWork:
			'An MQTT client connects to the broker on port 8883 (MQTTS) and completes a TLS handshake before sending the MQTT CONNECT packet. All subsequent PUBLISH, SUBSCRIBE, and acknowledgment packets are encrypted. This is critical for IoT deployments where sensor data and device credentials traverse untrusted networks.',
		leftRole: 'MQTT provides lightweight pub/sub messaging with topic hierarchies and QoS levels.',
		rightRole: 'TLS provides confidentiality, integrity, and authentication for all MQTT broker communication.'
	},
	{
		ids: ['quic', 'tls'],
		type: 'relationship',
		summary:
			'QUIC deeply integrates TLS 1.3 into its transport handshake, making encryption inseparable from connection establishment rather than an optional add-on layer.',
		howTheyWork:
			'QUIC embeds the TLS 1.3 handshake within its own transport handshake messages, combining cryptographic negotiation with connection setup in a single round trip. TLS provides the key exchange and cipher negotiation, while QUIC uses the derived keys to encrypt every packet including most header fields. Unlike TCP+TLS, there is no unencrypted QUIC — the protocols are fused by design.',
		leftRole: 'QUIC provides multiplexed streams, congestion control, and connection migration over UDP.',
		rightRole: 'TLS 1.3 provides the cryptographic handshake, key derivation, and cipher suite negotiation within QUIC.'
	},
	{
		ids: ['rtmp', 'tls'],
		type: 'relationship',
		summary:
			'TLS wraps RTMP connections to create RTMPS, encrypting live stream ingest traffic between encoders and media servers on port 443.',
		howTheyWork:
			'An encoder (e.g., OBS) connects to the media server on port 443 and performs a TLS handshake before beginning the RTMP handshake. All subsequent RTMP chunks — including the stream key, audio, and video data — flow through the encrypted channel. RTMPS is now required by major platforms like Facebook Live and YouTube Live for stream ingest.',
		leftRole: 'RTMP provides the live streaming protocol for publishing audio/video chunks to media servers.',
		rightRole: 'TLS provides confidentiality and integrity, protecting stream keys and media content in transit.'
	},
	{
		ids: ['sip', 'tls'],
		type: 'relationship',
		summary:
			'TLS secures SIP signaling to create SIPS, encrypting call setup, authentication, and routing between VoIP endpoints and proxies.',
		howTheyWork:
			'A SIP client connects to a proxy or registrar over TLS (typically port 5061), encrypting all signaling messages including REGISTER, INVITE, and BYE requests. The SIPS URI scheme (sips:) mandates TLS hop-by-hop across the signaling path. Without TLS, SIP headers expose caller identity, credentials, and call routing in plaintext.',
		leftRole: 'SIP provides the signaling protocol for establishing, modifying, and terminating voice/video sessions.',
		rightRole: 'TLS provides confidentiality and integrity for SIP signaling, protecting credentials and call metadata.'
	},
	{
		ids: ['smtp', 'tls'],
		type: 'relationship',
		summary:
			'TLS secures SMTP email delivery via STARTTLS (opportunistic upgrade on port 587) or SMTPS (implicit TLS on port 465), encrypting messages between mail servers.',
		howTheyWork:
			'An SMTP client connects to a mail server and issues the STARTTLS command to upgrade the plaintext connection to TLS before sending credentials or message content. Alternatively, implicit TLS on port 465 establishes encryption immediately. MTA-STS and DANE policies can enforce TLS to prevent downgrade attacks between mail servers.',
		leftRole: 'SMTP provides the email delivery protocol for routing messages between mail transfer agents.',
		rightRole: 'TLS provides confidentiality and integrity for email content and authentication credentials in transit.'
	},
	{
		ids: ['tls', 'websockets'],
		type: 'relationship',
		summary:
			'TLS secures WebSocket connections to create WSS (wss://), encrypting the full-duplex message channel between browsers and servers.',
		howTheyWork:
			'A client connects to port 443, completes a TLS handshake, and then performs the WebSocket HTTP Upgrade over the encrypted connection. Once upgraded, all WebSocket frames — both text and binary — flow through the TLS channel. WSS is effectively required in production because most browsers block mixed content and many proxies interfere with unencrypted WebSocket connections.',
		leftRole: 'TLS provides confidentiality, integrity, and authentication for the WebSocket connection.',
		rightRole: 'WebSocket provides persistent, full-duplex, message-oriented communication over the secure channel.'
	},
	{
		ids: ['tls', 'webrtc'],
		type: 'relationship',
		summary:
			'WebRTC uses DTLS (Datagram TLS) to perform key exchange over UDP, establishing the encryption keys used by SRTP to protect real-time media streams.',
		howTheyWork:
			'After ICE connectivity checks establish a UDP path between peers, a DTLS handshake occurs over that path to authenticate both endpoints and derive shared encryption keys. These keys are then used by SRTP to encrypt audio/video media and by SCTP (tunneled over DTLS) to encrypt data channel messages. Without DTLS, WebRTC peers could not establish trust or derive encryption keys over connectionless UDP.',
		leftRole: 'TLS (as DTLS) provides the key exchange, peer authentication, and key derivation over UDP.',
		rightRole: 'WebRTC uses DTLS-derived keys for SRTP media encryption and SCTP data channel security.'
	},
	{
		ids: ['tls', 'xmpp'],
		type: 'relationship',
		summary:
			'XMPP uses STARTTLS to upgrade client-to-server and server-to-server connections to TLS, encrypting all messaging, presence, and roster data.',
		howTheyWork:
			'After opening an XML stream, an XMPP client or server sends a STARTTLS request to upgrade the connection. Once the TLS handshake completes, a new XML stream is opened over the encrypted channel. Modern XMPP deployments mandate TLS, and XEP-0368 defines direct TLS connections on port 5223 as an alternative to the STARTTLS upgrade mechanism.',
		leftRole: 'TLS provides confidentiality, integrity, and authentication for all XMPP communication.',
		rightRole: 'XMPP provides the messaging, presence, and roster protocol operating over the encrypted channel.'
	},

	// ── HTTP as transport ────────────────────────────────────────

	{
		ids: ['http2', 'grpc'],
		type: 'relationship',
		summary:
			'gRPC uses HTTP/2 as its transport layer, leveraging its multiplexed streams and binary framing to deliver high-performance remote procedure calls.',
		howTheyWork:
			'gRPC maps each RPC call to an HTTP/2 stream, using HTTP/2 headers for metadata (method, status, content-type) and DATA frames for serialized Protocol Buffer payloads. HTTP/2\'s multiplexing allows many concurrent RPCs over a single TCP connection without head-of-line blocking at the HTTP level.',
		leftRole: 'HTTP/2 provides multiplexed binary framing, flow control, and header compression as the transport.',
		rightRole: 'gRPC provides the RPC semantics, Protobuf serialization, and service definition framework on top.'
	},
	{
		ids: ['dash', 'http1'],
		type: 'relationship',
		summary:
			'DASH delivers adaptive video by requesting media segments over HTTP/1.1, using standard web infrastructure for scalable streaming delivery.',
		howTheyWork:
			'The DASH client fetches an MPD manifest over HTTP/1.1, then requests individual media segments as standard HTTP GET requests. Each segment is a separate HTTP/1.1 request-response cycle, which means multiple TCP connections are used in parallel to fetch video and audio segments at the appropriate bitrate.',
		leftRole: 'DASH defines the manifest format, segment addressing, and adaptive bitrate switching logic.',
		rightRole: 'HTTP/1.1 provides the request-response transport for fetching manifests and media segments.'
	},
	{
		ids: ['dash', 'http2'],
		type: 'relationship',
		summary:
			'DASH delivers adaptive video over HTTP/2, benefiting from multiplexed streams to fetch manifests and media segments more efficiently on a single connection.',
		howTheyWork:
			'The DASH client fetches the MPD manifest and subsequent media segments as HTTP/2 requests multiplexed over a single TCP connection. HTTP/2\'s stream multiplexing eliminates the need for multiple parallel connections, and header compression reduces the overhead of repeated segment requests to the same origin.',
		leftRole: 'DASH defines the manifest format, segment addressing, and adaptive bitrate switching logic.',
		rightRole: 'HTTP/2 provides multiplexed, header-compressed transport for efficient parallel segment delivery.'
	},
	{
		ids: ['graphql', 'http1'],
		type: 'relationship',
		summary:
			'GraphQL sends queries and mutations as HTTP/1.1 POST requests to a single endpoint, using standard HTTP as its most common transport.',
		howTheyWork:
			'The client sends a GraphQL query as a JSON payload in an HTTP/1.1 POST request to a single endpoint (typically /graphql). The server parses the query, resolves the requested fields, and returns a JSON response. Each query-response cycle is an independent HTTP/1.1 request, making it compatible with existing HTTP infrastructure.',
		leftRole: 'GraphQL defines the query language, schema, and resolver execution model.',
		rightRole: 'HTTP/1.1 provides the request-response transport for sending queries and receiving results.'
	},
	{
		ids: ['graphql', 'http2'],
		type: 'relationship',
		summary:
			'GraphQL queries are sent over HTTP/2, benefiting from multiplexed streams when clients issue multiple queries or when responses are large with compressed headers.',
		howTheyWork:
			'GraphQL queries are sent as HTTP/2 POST requests to a single endpoint, just as with HTTP/1.1, but HTTP/2 multiplexes concurrent queries over a single connection. This is especially beneficial when a client fires multiple GraphQL queries in parallel, as they share one connection with compressed headers instead of requiring separate TCP connections.',
		leftRole: 'GraphQL defines the query language, schema, and resolver execution model.',
		rightRole: 'HTTP/2 provides multiplexed, header-compressed transport for concurrent query delivery.'
	},
	{
		ids: ['graphql', 'websockets'],
		type: 'relationship',
		summary:
			'GraphQL subscriptions use WebSocket as a persistent transport to push real-time data updates from the server to subscribed clients.',
		howTheyWork:
			'The client establishes a WebSocket connection to the GraphQL server and sends subscription queries using a sub-protocol like graphql-ws. The server keeps the connection open and pushes data whenever the subscribed fields change. This complements the HTTP-based query/mutation model by adding server-initiated real-time updates.',
		leftRole: 'GraphQL defines the subscription query syntax and the data pushed when subscribed fields change.',
		rightRole: 'WebSocket provides the persistent, bidirectional channel needed for real-time subscription delivery.'
	},
	{
		ids: ['hls', 'http1'],
		type: 'relationship',
		summary:
			'HLS delivers adaptive video by serving M3U8 playlists and media segments as standard HTTP/1.1 file downloads, leveraging existing web infrastructure and CDNs.',
		howTheyWork:
			'The HLS client fetches an M3U8 playlist over HTTP/1.1 to discover available bitrates and segment URLs. It then requests individual media segments as standard HTTP GET requests. Each segment is a self-contained file served like any static asset, making HLS fully compatible with HTTP caches, CDNs, and standard web servers.',
		leftRole: 'HLS defines the playlist format, segment structure, and adaptive bitrate selection algorithm.',
		rightRole: 'HTTP/1.1 provides the file-serving transport for delivering playlist and segment files.'
	},
	{
		ids: ['hls', 'http2'],
		type: 'relationship',
		summary:
			'HLS delivers adaptive video over HTTP/2, where multiplexed streams allow playlist refreshes and segment fetches to share a single connection efficiently.',
		howTheyWork:
			'The HLS client fetches M3U8 playlists and media segments over HTTP/2, multiplexing requests on a single connection instead of opening multiple parallel TCP connections. For live streams, this is especially beneficial since frequent playlist refreshes and segment requests can interleave without head-of-line blocking at the HTTP layer.',
		leftRole: 'HLS defines the playlist format, segment structure, and adaptive bitrate selection algorithm.',
		rightRole: 'HTTP/2 provides multiplexed transport for efficient parallel delivery of playlists and segments.'
	},
	{
		ids: ['http1', 'rest'],
		type: 'relationship',
		summary:
			'REST APIs are most commonly served over HTTP/1.1, using its methods (GET, POST, PUT, DELETE), status codes, and headers to implement resource-oriented APIs.',
		howTheyWork:
			'REST maps CRUD operations to HTTP/1.1 methods: GET for reading, POST for creating, PUT/PATCH for updating, and DELETE for removing resources. HTTP/1.1 status codes communicate outcomes, headers handle content negotiation and caching, and URLs identify resources. HTTP/1.1 provides all the semantics REST relies on as an architectural style.',
		leftRole: 'HTTP/1.1 provides the methods, status codes, headers, and URL structure that REST builds upon.',
		rightRole: 'REST defines the architectural conventions for mapping resource operations onto HTTP semantics.'
	},
	{
		ids: ['http1', 'websockets'],
		type: 'relationship',
		summary:
			'WebSocket connections begin with an HTTP/1.1 Upgrade handshake, then switch to a persistent, bidirectional binary framing protocol.',
		howTheyWork:
			'The client sends an HTTP/1.1 GET request with Upgrade: websocket and Connection: Upgrade headers, plus a Sec-WebSocket-Key. If the server accepts, it responds with 101 Switching Protocols and the connection transitions from HTTP to WebSocket framing. After the upgrade, the TCP connection carries WebSocket frames instead of HTTP messages.',
		leftRole: 'HTTP/1.1 provides the initial handshake and Upgrade mechanism to establish the connection.',
		rightRole: 'WebSocket provides the persistent, full-duplex message framing protocol after the upgrade completes.'
	},
	{
		ids: ['http2', 'sse'],
		type: 'relationship',
		summary:
			'SSE streams server-pushed events over HTTP/2, where multiplexing allows multiple SSE streams to share a single connection without blocking other requests.',
		howTheyWork:
			'The client opens an SSE connection by sending a GET request with Accept: text/event-stream. Over HTTP/2, this SSE stream becomes one of many multiplexed streams on a single connection, so other API requests proceed in parallel without being blocked. This eliminates the browser connection limit problem that restricts SSE to six concurrent streams per origin on HTTP/1.1.',
		leftRole: 'HTTP/2 provides multiplexed streams that let SSE connections coexist with other requests on one connection.',
		rightRole: 'SSE provides the text/event-stream format and EventSource API for server-to-client push.'
	},
	{
		ids: ['http3', 'rest'],
		type: 'relationship',
		summary:
			'REST APIs can be served over HTTP/3, gaining faster connection setup, independent stream multiplexing, and built-in encryption from the QUIC transport.',
		howTheyWork:
			'REST semantics (methods, status codes, headers, URLs) work identically over HTTP/3 as they do over HTTP/1.1 or HTTP/2 — only the transport changes. HTTP/3 runs over QUIC, providing 0-RTT connection establishment, stream-level independence (no head-of-line blocking), and mandatory TLS 1.3. REST APIs benefit automatically without any changes to API design.',
		leftRole: 'HTTP/3 provides the QUIC-based transport with 0-RTT setup and independent stream multiplexing.',
		rightRole: 'REST defines the resource-oriented API architecture that rides on HTTP/3 semantics.'
	},

	// ── WebSocket as transport ───────────────────────────────────

	{
		ids: ['amqp', 'websockets'],
		type: 'relationship',
		summary:
			'AMQP can be tunneled over WebSocket to allow browser-based clients to connect to message brokers without direct TCP access.',
		howTheyWork:
			'The browser establishes a WebSocket connection to the message broker (or a gateway), then speaks the AMQP protocol over that WebSocket channel. The WebSocket connection wraps AMQP frames so they can traverse HTTP proxies and firewalls that would otherwise block raw TCP AMQP connections on port 5672.',
		leftRole: 'AMQP provides the messaging semantics — exchanges, queues, bindings, and delivery guarantees.',
		rightRole: 'WebSocket provides the browser-compatible transport tunnel that carries AMQP frames over HTTP.'
	},
	{
		ids: ['mqtt', 'websockets'],
		type: 'relationship',
		summary:
			'MQTT over WebSocket enables browser-based IoT dashboards and web apps to subscribe to MQTT topics directly from the browser.',
		howTheyWork:
			'The browser opens a WebSocket connection to the MQTT broker (typically on port 8083/8084). MQTT packets are sent as WebSocket binary frames, allowing the browser to publish, subscribe, and receive messages using standard MQTT semantics. This avoids the need for a custom REST bridge between the browser and the MQTT broker.',
		leftRole: 'MQTT provides the lightweight pub/sub messaging protocol with topic hierarchy and QoS levels.',
		rightRole: 'WebSocket provides the browser-accessible transport that carries MQTT packets over HTTP.'
	},
	{
		ids: ['stomp', 'websockets'],
		type: 'relationship',
		summary:
			'STOMP over WebSocket allows browser clients to connect to message brokers using STOMP\'s simple text-based messaging commands.',
		howTheyWork:
			'The browser establishes a WebSocket connection to the message broker (e.g., RabbitMQ with STOMP plugin, or Spring\'s STOMP broker). STOMP text frames (CONNECT, SEND, SUBSCRIBE, MESSAGE) are sent as WebSocket text messages. STOMP\'s HTTP-like text format makes it especially natural to carry over WebSocket, requiring minimal client-side code.',
		leftRole: 'STOMP provides the text-based messaging commands for sending, subscribing, and acknowledging messages.',
		rightRole: 'WebSocket provides the browser-compatible bidirectional channel that carries STOMP frames.'
	},
	{
		ids: ['websockets', 'xmpp'],
		type: 'relationship',
		summary:
			'XMPP over WebSocket enables browser-based chat clients to participate in the XMPP network without long-polling hacks like BOSH.',
		howTheyWork:
			'The browser opens a WebSocket connection to the XMPP server using the XMPP sub-protocol (RFC 7395). XMPP stanzas (message, presence, iq) are sent as WebSocket text frames, providing the same real-time XML stream as a native TCP XMPP connection. This replaces the older BOSH (Bidirectional-streams Over Synchronous HTTP) approach with a cleaner, lower-latency transport.',
		leftRole: 'WebSocket provides the persistent, low-latency bidirectional transport between browser and XMPP server.',
		rightRole: 'XMPP provides the messaging semantics — presence, roster, stanzas, and federation.'
	},

	// ── Real-time A/V ────────────────────────────────────────────

	{
		ids: ['rtp', 'sdp'],
		type: 'relationship',
		summary:
			'SDP describes the parameters of an RTP session — codecs, payload types, ports, and addresses — so both endpoints agree on how to send and receive media.',
		howTheyWork:
			'Before RTP media can flow, endpoints exchange SDP descriptions (via SIP, WebRTC signaling, or other means) that specify the IP addresses, port numbers, codecs, and payload type mappings for each media stream. RTP then uses these negotiated parameters to deliver audio and video packets between the endpoints.',
		leftRole: 'RTP carries the actual audio and video media packets using parameters negotiated by SDP.',
		rightRole: 'SDP describes the session parameters (codecs, ports, addresses) that configure the RTP streams.'
	},
	{
		ids: ['rtp', 'sip'],
		type: 'relationship',
		summary:
			'SIP establishes and manages call sessions (ringing, answering, hanging up), while RTP carries the actual audio and video media during the call.',
		howTheyWork:
			'SIP handles call signaling — INVITE to initiate, 200 OK to accept, BYE to terminate — and carries SDP in its message bodies to negotiate media parameters. Once the SIP signaling establishes a session, RTP streams flow directly between the media endpoints on the ports and codecs specified by SDP. SIP manages the call lifecycle; RTP handles the media.',
		leftRole: 'RTP carries the real-time audio and video streams between endpoints during the call.',
		rightRole: 'SIP provides the signaling to establish, modify, and tear down the call session.'
	},
	{
		ids: ['rtp', 'webrtc'],
		type: 'relationship',
		summary:
			'WebRTC uses SRTP (Secure RTP) as its media transport, encrypting all audio and video packets with DTLS-derived keys for secure peer-to-peer communication.',
		howTheyWork:
			'WebRTC establishes a peer connection using ICE for NAT traversal and DTLS for key exchange. Once the secure channel is established, audio and video are transmitted as SRTP packets — RTP with AES encryption. WebRTC mandates SRTP (not plain RTP) to ensure all media is encrypted end-to-end by default.',
		leftRole: 'RTP (as SRTP) carries the encrypted audio and video packets between WebRTC peers.',
		rightRole: 'WebRTC provides the peer connection framework, ICE negotiation, and DTLS key exchange around SRTP.'
	},
	{
		ids: ['sctp', 'webrtc'],
		type: 'relationship',
		summary:
			'WebRTC data channels use SCTP tunneled over DTLS to provide reliable, ordered, and configurable message delivery between peers.',
		howTheyWork:
			'WebRTC establishes a DTLS connection over the ICE-negotiated path, then runs SCTP on top of that DTLS tunnel. Each data channel maps to an SCTP stream, and SCTP\'s multi-stream support allows independent channels without head-of-line blocking. Channels can be configured as reliable/ordered or unreliable/unordered per-channel.',
		leftRole: 'SCTP provides the multi-stream, message-oriented transport with configurable reliability for each data channel.',
		rightRole: 'WebRTC provides the peer connection, DTLS encryption, and ICE traversal that SCTP runs over.'
	},
	{
		ids: ['sdp', 'sip'],
		type: 'relationship',
		summary:
			'SIP carries SDP payloads in its INVITE and response messages to negotiate the media parameters (codecs, ports, addresses) for a call session.',
		howTheyWork:
			'When a SIP client sends an INVITE, it includes an SDP offer in the message body describing its supported codecs, IP address, and port. The callee responds with a SIP 200 OK containing an SDP answer with its own media capabilities. This offer/answer exchange within SIP messages establishes the agreed-upon parameters for the subsequent RTP media streams.',
		leftRole: 'SDP provides the session description format that specifies codecs, ports, and media parameters.',
		rightRole: 'SIP provides the signaling protocol that carries SDP offers and answers in its messages.'
	},
	{
		ids: ['sdp', 'webrtc'],
		type: 'relationship',
		summary:
			'WebRTC uses SDP in its offer/answer model to negotiate media capabilities, ICE candidates, and DTLS fingerprints between peers.',
		howTheyWork:
			'When a WebRTC peer connection is created, the browser generates an SDP offer describing supported codecs, ICE candidates, DTLS fingerprints, and media directions. This SDP is sent to the remote peer via an application-defined signaling channel. The remote peer generates an SDP answer, and both sides apply the negotiated parameters to configure their media and data channels.',
		leftRole: 'SDP describes the session parameters — codecs, ICE candidates, and DTLS fingerprints — for WebRTC negotiation.',
		rightRole: 'WebRTC provides the peer connection API that generates, exchanges, and applies SDP descriptions.'
	},

	// ── Utility / Other ──────────────────────────────────────────

	{
		ids: ['dhcp', 'dns'],
		type: 'relationship',
		summary:
			'DHCP provides DNS server addresses to clients as part of network configuration, telling devices where to send their DNS queries.',
		howTheyWork:
			'When a device joins a network, DHCP assigns it an IP address along with other configuration including the DNS server addresses (option 6 in DHCPv4). The client then uses these DNS server addresses for all subsequent name resolution. Without DHCP providing this information, clients would need manually configured DNS servers.',
		leftRole: 'DHCP provides network configuration including the DNS server addresses clients should use.',
		rightRole: 'DNS provides name resolution services at the server addresses distributed by DHCP.'
	},
	{
		ids: ['dns', 'smtp'],
		type: 'relationship',
		summary:
			'SMTP relies on DNS MX (Mail Exchanger) records to determine which mail server should receive email for a given domain.',
		howTheyWork:
			'When an SMTP server needs to deliver mail to user@example.com, it queries DNS for the MX records of example.com. DNS returns one or more mail server hostnames with priority values. The SMTP server then resolves those hostnames to IP addresses (A/AAAA records) and connects to the highest-priority server to deliver the message.',
		leftRole: 'DNS provides the MX record lookups that map email domains to their mail server hostnames.',
		rightRole: 'SMTP uses MX records from DNS to route and deliver email to the correct destination mail server.'
	},
	{
		ids: ['ftp', 'ssh'],
		type: 'relationship',
		summary:
			'SFTP (SSH File Transfer Protocol) runs entirely within an SSH channel, providing encrypted file transfer with strong authentication as a secure replacement for FTP.',
		howTheyWork:
			'SFTP is a subsystem of SSH, not a variant of FTP — it uses a completely different binary protocol. The client establishes an SSH connection with key-based or password authentication, then opens an SFTP subsystem channel. All file operations (list, upload, download, rename, delete) are sent as binary SFTP packets within the encrypted SSH tunnel on a single port (22).',
		leftRole: 'FTP-style file operations (list, get, put, delete) are provided by the SFTP subsystem within SSH.',
		rightRole: 'SSH provides the encrypted tunnel, authentication, and channel multiplexing that SFTP runs inside.'
	},
	{
		ids: ['http3', 'quic'],
		type: 'relationship',
		summary:
			'HTTP/3 is the first major protocol built specifically for QUIC, mapping HTTP semantics onto QUIC\'s multiplexed, encrypted streams for head-of-line-blocking-free web delivery.',
		howTheyWork:
			'HTTP/3 maps each request-response exchange to an independent QUIC stream. QUIC provides reliable, ordered delivery per-stream with TLS 1.3 encryption, connection migration, and 0-RTT resumption. Unlike HTTP/2 over TCP, losing a packet on one stream does not block others — each QUIC stream is independently reliable.',
		leftRole: 'HTTP/3 provides the HTTP semantics (methods, headers, status codes) and QPACK header compression.',
		rightRole: 'QUIC provides the multiplexed, encrypted transport with per-stream reliability and fast connection setup.'
	},
	{
		ids: ['quic', 'tcp'],
		type: 'relationship',
		summary:
			'QUIC is designed as a modern replacement for the TCP+TLS stack, providing reliable, multiplexed, encrypted transport over UDP with faster connection setup.',
		howTheyWork:
			'QUIC implements the reliability, ordering, and congestion control features of TCP but runs over UDP datagrams to avoid kernel-level TCP limitations and middlebox interference. It integrates TLS 1.3 directly into its handshake (achieving 1-RTT or 0-RTT setup) and provides independent stream multiplexing that eliminates TCP\'s head-of-line blocking problem.',
		leftRole: 'QUIC provides the modern multiplexed, encrypted transport that aims to supersede TCP+TLS.',
		rightRole: 'TCP provides the traditional reliable transport that QUIC was designed to replace and improve upon.'
	},
	{
		ids: ['rest', 'sse'],
		type: 'relationship',
		summary:
			'SSE is commonly used within REST APIs to add a server-push capability, streaming real-time updates to clients over a standard HTTP connection.',
		howTheyWork:
			'A REST API exposes an SSE endpoint (e.g., GET /events) that returns a text/event-stream response. The client connects using the EventSource API and receives server-pushed events as they occur, while continuing to use regular REST endpoints for queries and mutations. SSE complements REST\'s request-response model by adding unidirectional real-time updates.',
		leftRole: 'REST provides the request-response API structure that SSE endpoints are integrated into.',
		rightRole: 'SSE provides the server-push streaming mechanism that extends REST with real-time event delivery.'
	}
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOOKUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const allPairs: ProtocolPair[] = [...vsPairs, ...relationshipPairs];

/** Map for O(1) lookup by canonical key "idA:idB" (alphabetically sorted). */
const pairMap = new Map<string, ProtocolPair>();
for (const pair of allPairs) {
	const key = pair.ids[0] < pair.ids[1] ? `${pair.ids[0]}:${pair.ids[1]}` : `${pair.ids[1]}:${pair.ids[0]}`;
	pairMap.set(key, pair);
}

/** Look up the pair entry for two protocol IDs (order-independent). */
export function getPair(idA: string, idB: string): ProtocolPair | null {
	const key = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
	return pairMap.get(key) ?? null;
}

/** Get all pairs involving a given protocol, separated by type. */
export function getPairsForProtocol(id: string): { vs: ProtocolPair[]; relationships: ProtocolPair[] } {
	const vs: ProtocolPair[] = [];
	const relationships: ProtocolPair[] = [];
	for (const pair of allPairs) {
		if (pair.ids[0] === id || pair.ids[1] === id) {
			if (pair.type === 'vs') vs.push(pair);
			else relationships.push(pair);
		}
	}
	return { vs, relationships };
}

/** Get the "other" protocol ID from a pair, given one of them. */
export function getOtherProtocol(pair: ProtocolPair, myId: string): string {
	return pair.ids[0] === myId ? pair.ids[1] : pair.ids[0];
}

/** Total counts for display. */
export const pairCounts = {
	total: allPairs.length,
	vs: vsPairs.length,
	relationships: relationshipPairs.length
};
