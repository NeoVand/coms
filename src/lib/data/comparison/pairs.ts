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
			'[[tcp|TCP]] guarantees every byte arrives in order at the cost of latency; [[udp|UDP]] prioritizes speed by skipping reliability guarantees entirely.',
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
			'Each packet is self-contained and independent ([[dns|DNS]] queries, [[ntp|NTP]])',
			'Your application handles its own reliability at a higher layer ([[quic|QUIC]], [[webrtc|WebRTC]])'
		]
	},
	{
		ids: ['mptcp', 'tcp'],
		type: 'vs',
		summary:
			'Standard [[tcp|TCP]] uses a single network path; [[mptcp|MPTCP]] spreads traffic across multiple paths (e.g. Wi-Fi + cellular) for better throughput and seamless failover.',
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
			'Your infrastructure does not support [[mptcp|MPTCP]] (older kernels, firewalls)',
			'Simplicity and debuggability outweigh multi-path benefits'
		]
	},
	{
		ids: ['sctp', 'tcp'],
		type: 'vs',
		summary:
			'[[tcp|TCP]] delivers a single ordered byte stream; [[sctp|SCTP]] delivers multiple independent message streams over one association with built-in multi-homing.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Message-oriented (preserves boundaries)', right: 'Byte-stream (no message boundaries)' },
			{ aspect: 'Multiplexing', left: 'Multiple independent streams', right: 'Single stream (head-of-line blocking)' },
			{ aspect: 'Redundancy', left: 'Built-in multi-homing (multiple IPs)', right: 'Single IP per connection' },
			{ aspect: 'Connection model', left: '4-way handshake with cookie (DoS-resistant)', right: '3-way handshake' },
			{ aspect: 'Ecosystem', left: 'Limited (telecom, [[webrtc|WebRTC]] data channels)', right: 'Universal support' }
		],
		useLeftWhen: [
			'You need multiple independent streams without head-of-line blocking',
			'Message boundaries must be preserved by the transport layer',
			'Multi-homing for failover between network interfaces is required',
			'You are building telecom signaling (SS7/SIGTRAN) or [[webrtc|WebRTC]] data channels'
		],
		useRightWhen: [
			'Broad compatibility is essential ([[sctp|SCTP]] is blocked by many NATs/firewalls)',
			'Your application only needs a single ordered stream',
			'You are building for the public internet rather than controlled networks',
			'Existing libraries and tooling matter more than protocol features'
		]
	},
	{
		ids: ['quic', 'udp'],
		type: 'vs',
		summary:
			'Raw [[udp|UDP]] is a minimal, unreliable datagram service; [[quic|QUIC]] builds reliability, multiplexing, and encryption on top of [[udp|UDP]] to replace [[tcp|TCP]]+[[tls|TLS]].',
		keyDifferences: [
			{ aspect: 'Reliability', left: 'Reliable delivery with retransmission', right: 'Best-effort, no guarantees' },
			{ aspect: 'Encryption', left: 'Built-in [[tls|TLS]] 1.3 (always encrypted)', right: 'None (plaintext datagrams)' },
			{ aspect: 'Multiplexing', left: 'Multiple independent streams', right: 'Single datagram, no streams' },
			{ aspect: 'Connection model', left: '0-RTT/1-RTT handshake', right: 'No connection setup' },
			{ aspect: 'Complexity', left: 'Full transport protocol (congestion, flow control)', right: 'Minimal 8-byte header' }
		],
		useLeftWhen: [
			'You need reliable delivery but want to avoid [[tcp|TCP]] head-of-line blocking',
			'Encryption is mandatory and you want it integrated into the transport',
			'Fast connection establishment (0-RTT) matters for your use case',
			'You are building [[http3|HTTP/3]] or modern real-time applications'
		],
		useRightWhen: [
			'Your protocol handles its own reliability ([[dns|DNS]], [[ntp|NTP]], custom game protocols)',
			'Absolute minimum overhead per packet is critical',
			'You are sending single-shot messages that do not need stream semantics',
			'Simplicity and universality outweigh [[quic|QUIC]]\'s features'
		]
	},

	// ── Web / API ───────────────────────────────────────────────

	{
		ids: ['http1', 'http2'],
		type: 'vs',
		summary:
			'[[http1|[[http1|HTTP/1]].1]] sends requests sequentially over separate connections; [[http2|HTTP/2]] multiplexes many requests over a single connection with header compression and server push.',
		keyDifferences: [
			{ aspect: 'Multiplexing', left: 'One request per connection at a time', right: 'Many concurrent streams on one connection' },
			{ aspect: 'Data format', left: 'Text-based headers', right: 'Binary framing with HPACK compression' },
			{ aspect: 'Header size', left: 'Repetitive, uncompressed headers', right: 'Compressed via HPACK (up to 90% smaller)' },
			{ aspect: 'Direction', left: 'Client-initiated only', right: 'Server push (proactive resource delivery)' },
			{ aspect: 'Connection model', left: 'Multiple [[tcp|TCP]] connections (6 per domain)', right: 'Single [[tcp|TCP]] connection per origin' }
		],
		useLeftWhen: [
			'You are supporting very old clients or constrained devices that lack [[http2|HTTP/2]]',
			'Your responses are simple and few (e.g. single-resource APIs)',
			'Debugging with plaintext is more important than performance',
			'Your infrastructure (proxies, load balancers) does not support [[http2|HTTP/2]]'
		],
		useRightWhen: [
			'Pages load many resources (images, scripts, styles) that benefit from multiplexing',
			'Header overhead is significant (APIs with cookies, auth tokens, many headers)',
			'You want to push critical resources before the client requests them',
			'Reducing [[tcp|TCP]] connections improves server scalability'
		]
	},
	{
		ids: ['http2', 'http3'],
		type: 'vs',
		summary:
			'[[http2|HTTP/2]] runs over [[tcp|TCP]] and suffers from [[tcp|TCP]]-level head-of-line blocking; [[http3|HTTP/3]] runs over [[quic|QUIC]] ([[udp|UDP]]-based) eliminating this and adding faster connection setup.',
		keyDifferences: [
			{ aspect: 'Transport', left: '[[tcp|TCP]] + [[tls|TLS]] 1.2/1.3 (separate layers)', right: '[[quic|QUIC]] ([[udp|UDP]]-based, [[tls|TLS]] 1.3 built-in)' },
			{ aspect: 'Multiplexing', left: 'Streams share [[tcp|TCP]] (head-of-line blocking)', right: 'Streams independent (no cross-stream blocking)' },
			{ aspect: 'Connection model', left: '1-RTT [[tcp|TCP]] + 1-RTT [[tls|TLS]] = 2+ RTT', right: '1-RTT or 0-RTT (combined transport+crypto)' },
			{ aspect: 'Header size', left: 'HPACK compression', right: 'QPACK compression (designed for [[quic|QUIC]])' },
			{ aspect: 'Ecosystem', left: 'Mature, universal support', right: 'Growing rapidly, most modern browsers support it' }
		],
		useLeftWhen: [
			'Maximum compatibility with existing infrastructure is required',
			'Your network reliably delivers packets with minimal loss',
			'Firewalls or corporate networks block [[udp|UDP]] traffic',
			'Your tooling (proxies, CDN, debugging) is [[tcp|TCP]]-oriented'
		],
		useRightWhen: [
			'Users are on lossy or mobile networks where [[tcp|TCP]] head-of-line blocking hurts',
			'Fast connection establishment (0-RTT) significantly improves user experience',
			'Connection migration matters (users switching Wi-Fi to cellular)',
			'You are building latency-sensitive applications (live streaming, gaming APIs)'
		]
	},
	{
		ids: ['grpc', 'rest'],
		type: 'vs',
		summary:
			'[[rest|REST]] uses human-readable JSON over HTTP for broad compatibility; [[grpc|gRPC]] uses binary Protobuf over [[http2|HTTP/2]] for high-performance, strongly-typed service communication.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Binary (Protocol Buffers)', right: 'Text (JSON, XML)' },
			{ aspect: 'Transport', left: '[[http2|HTTP/2]] only (multiplexed streams)', right: 'Any HTTP version' },
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
			'[[rest|REST]] exposes fixed endpoints that return predetermined data shapes; [[graphql|GraphQL]] exposes a single endpoint where clients query exactly the fields they need.',
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
			'[[websockets|WebSocket]] provides full-duplex bidirectional communication; [[sse|SSE]] provides server-to-client streaming over plain HTTP with automatic reconnection.',
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
			'Simplicity is preferred — no [[websockets|WebSocket]] upgrade negotiation needed'
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
			'[[graphql|GraphQL]] lets clients flexibly query for exactly the data they need over HTTP; [[grpc|gRPC]] provides high-performance, schema-strict RPC with bidirectional streaming.',
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
			'[[http1|[[http1|HTTP/1]].1]] is the text-based, universally supported baseline; [[http3|HTTP/3]] is the latest evolution running over [[quic|QUIC]] with multiplexing, 0-RTT, and built-in encryption.',
		keyDifferences: [
			{ aspect: 'Transport', left: '[[tcp|TCP]] (1+ RTT handshake)', right: '[[quic|QUIC]] over [[udp|UDP]] (0-RTT possible)' },
			{ aspect: 'Multiplexing', left: 'No multiplexing (one request per connection)', right: 'Full stream multiplexing (no head-of-line blocking)' },
			{ aspect: 'Header size', left: 'Uncompressed text headers', right: 'QPACK compressed binary headers' },
			{ aspect: 'Encryption', left: 'Optional (HTTP or HTTPS)', right: 'Always encrypted ([[tls|TLS]] 1.3 built into [[quic|QUIC]])' },
			{ aspect: 'Ecosystem', left: 'Universal — every device and proxy supports it', right: 'Modern browsers and CDNs; some firewalls block [[udp|UDP]]' }
		],
		useLeftWhen: [
			'Maximum backward compatibility is the top priority',
			'Your clients include legacy devices or very old browsers',
			'Plaintext HTTP (no [[tls|TLS]]) is acceptable for your use case',
			'Your infrastructure cannot handle [[udp|UDP]]-based traffic'
		],
		useRightWhen: [
			'Performance on lossy or mobile networks is critical',
			'You are building a new service with modern client requirements',
			'Fast connection establishment directly improves user experience',
			'Your deployment targets CDNs and cloud providers that support [[quic|QUIC]]'
		]
	},
	{
		ids: ['http2', 'websockets'],
		type: 'vs',
		summary:
			'[[http2|HTTP/2]] provides multiplexed request-response with server push over a single connection; [[websockets|WebSocket]] provides a persistent, full-duplex message channel.',
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
			'[[rest|REST]] follows a stateless request-response model ideal for CRUD operations; [[websockets|WebSocket]] maintains a persistent connection for real-time bidirectional communication.',
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
			'[[graphql|GraphQL]] lets clients query exactly the data they need via flexible queries; [[sse|SSE]] provides a simple server-push stream for real-time updates over HTTP.',
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
			'[[rest|REST]] is an architectural style defining how to structure APIs; [[http2|HTTP/2]] is a transport protocol that improves how HTTP requests are delivered — they operate at different levels and are not direct alternatives. They are complementary: REST APIs can (and commonly do) run over HTTP/2, gaining multiplexing, header compression, and server push without any changes to API design.',
		keyDifferences: [
			{ aspect: 'Multiplexing', left: 'Multiple concurrent streams natively', right: 'One request per connection (uses multiple connections)' },
			{ aspect: 'Direction', left: 'Server push for proactive delivery', right: 'Client-initiated requests only' },
			{ aspect: 'Header size', left: 'HPACK compressed (binary)', right: 'Full text headers repeated per request' },
			{ aspect: 'Data format', left: 'Binary framing layer', right: 'Text-based HTTP semantics' },
			{ aspect: 'Complexity', left: 'Requires [[tls|TLS]] in practice, binary debugging', right: 'Simple, human-readable, curl-friendly' }
		],
		useLeftWhen: [
			'Many resources are loaded concurrently (web pages with dozens of assets)',
			'Header overhead per request is significant (auth tokens, cookies)',
			'Server push can preemptively deliver critical resources',
			'You are optimizing an existing [[rest|REST]] API without changing its design'
		],
		useRightWhen: [
			'Simplicity, readability, and universal tooling support matter most',
			'Your API serves few, large responses rather than many small ones',
			'Clients include legacy systems that do not support [[http2|HTTP/2]]',
			'Debugging ease is more important than transport-level optimization'
		]
	},

	// ── Async / IoT ─────────────────────────────────────────────

	{
		ids: ['amqp', 'mqtt'],
		type: 'vs',
		summary:
			'[[mqtt|MQTT]] is ultra-lightweight pub/sub designed for constrained IoT devices; [[amqp|AMQP]] is a feature-rich message broker protocol for enterprise messaging with routing, transactions, and delivery guarantees.',
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
			'[[amqp|AMQP]] is a binary, feature-complete message broker protocol; [[stomp|STOMP]] is a text-based, deliberately simple messaging protocol designed for easy client implementation.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Binary with rich type system', right: 'Text-based (like HTTP, human-readable)' },
			{ aspect: 'Complexity', left: 'Exchanges, queues, bindings, routing', right: 'Simple SEND/SUBSCRIBE/UNSUBSCRIBE' },
			{ aspect: 'Reliability', left: 'Transactions, publisher confirms, dead-lettering', right: 'Basic acknowledgments only' },
			{ aspect: 'Browser support', left: 'Requires [[amqp|AMQP]] client library', right: 'Easy over [[websockets|WebSocket]] (text protocol)' },
			{ aspect: 'Ecosystem', left: 'RabbitMQ, Qpid, Azure Service Bus', right: 'ActiveMQ, RabbitMQ ([[stomp|STOMP]] plugin)' }
		],
		useLeftWhen: [
			'You need advanced routing, transactions, and delivery guarantees',
			'High throughput and binary efficiency matter',
			'Your messaging topology is complex (multiple exchanges, routing patterns)',
			'You are building enterprise integration middleware'
		],
		useRightWhen: [
			'You want the simplest possible messaging client (few lines of code)',
			'Browser clients need to connect via [[websockets|WebSocket]] without heavy libraries',
			'Interoperability across many languages is more important than features',
			'Your messaging needs are simple subscribe-and-receive patterns'
		]
	},
	{
		ids: ['coap', 'mqtt'],
		type: 'vs',
		summary:
			'[[mqtt|MQTT]] is a pub/sub protocol connecting many devices through a central broker; [[coap|CoAP]] is a request-response protocol for direct device-to-device communication modeled after HTTP.',
		keyDifferences: [
			{ aspect: 'Connection model', left: 'Request-response (like HTTP)', right: 'Publish-subscribe via broker' },
			{ aspect: 'Transport', left: '[[udp|UDP]] (connectionless)', right: '[[tcp|TCP]] (persistent connection to broker)' },
			{ aspect: 'Direction', left: 'Client-server (device to device)', right: 'Many-to-many via central broker' },
			{ aspect: 'Overhead', left: '4-byte header, compact binary', right: '2-byte minimum header' },
			{ aspect: 'Complexity', left: '[[rest|REST]]-like (GET, PUT, POST, DELETE)', right: 'Pub/sub (CONNECT, PUBLISH, SUBSCRIBE)' }
		],
		useLeftWhen: [
			'Devices communicate directly without a central broker',
			'You need [[rest|REST]]-like semantics (resource URIs, methods) in constrained networks',
			'[[udp|UDP]] is preferred for low-power, lossy networks (6LoWPAN, NB-IoT)',
			'Your IoT devices act as both clients and servers'
		],
		useRightWhen: [
			'Many devices publish to and subscribe from a central message broker',
			'You need topic-based fan-out to multiple subscribers',
			'Reliable [[tcp|TCP]] connections to a broker are feasible',
			'Retained messages and last-will features are needed'
		]
	},
	{
		ids: ['stomp', 'xmpp'],
		type: 'vs',
		summary:
			'[[stomp|STOMP]] is a minimal text-based messaging protocol for queue/topic messaging; [[xmpp|XMPP]] is a rich XML-based protocol for presence-aware, federated real-time communication.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Simple text frames (like HTTP)', right: 'XML stanzas (verbose but extensible)' },
			{ aspect: 'Complexity', left: 'Minimal (SEND, SUBSCRIBE, ACK)', right: 'Rich (presence, roster, multi-user chat, extensions)' },
			{ aspect: 'Direction', left: 'Queue/topic messaging via broker', right: 'Peer-to-peer with optional server federation' },
			{ aspect: 'Ecosystem', left: 'ActiveMQ, RabbitMQ [[stomp|STOMP]] plugin', right: 'ejabberd, Prosody, Openfire' },
			{ aspect: 'Standardization', left: 'Simple spec, few extensions', right: 'Hundreds of XEPs (extension protocols)' }
		],
		useLeftWhen: [
			'You need simple, lightweight queue or topic messaging',
			'Browser clients connect via [[websockets|WebSocket]] to a message broker',
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
			'[[amqp|AMQP]] brokers (like RabbitMQ) route individual messages with rich delivery semantics; [[kafka|Kafka]] is a distributed log that persists ordered event streams for replay and high-throughput processing.',
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
			'[[hls|HLS]] is Apple\'s HTTP-based adaptive streaming protocol with near-universal player support; [[dash|DASH]] is the open, codec-agnostic MPEG standard for adaptive streaming.',
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
			'Live streaming with low-latency [[hls|HLS]] extensions is your use case',
			'Maximum player compatibility out of the box is the priority'
		]
	},
	{
		ids: ['rtmp', 'rtp'],
		type: 'vs',
		summary:
			'[[rtp|RTP]] delivers real-time audio/video over [[udp|UDP]] for interactive communication; [[rtmp|RTMP]] delivers live streams over [[tcp|TCP]] for broadcasting to media servers.',
		keyDifferences: [
			{ aspect: 'Transport', left: '[[udp|UDP]] (low latency, tolerates loss)', right: '[[tcp|TCP]] (reliable, higher latency)' },
			{ aspect: 'Direction', left: 'Peer-to-peer or multicast', right: 'Client-to-server (ingest)' },
			{ aspect: 'Overhead', left: 'Minimal [[rtp|RTP]] header (12 bytes)', right: 'Chunked message format with handshake' },
			{ aspect: 'Complexity', left: 'Paired with RTCP for feedback', right: 'Self-contained streaming protocol' },
			{ aspect: 'Ecosystem', left: '[[webrtc|WebRTC]], VoIP, video conferencing', right: 'OBS, Twitch ingest, Facebook Live' }
		],
		useLeftWhen: [
			'You are building interactive audio/video (calls, conferences)',
			'Sub-second latency is essential and packet loss is tolerable',
			'Peer-to-peer or multicast delivery is required',
			'Your system uses [[webrtc|WebRTC]] or [[sip|SIP]] for media transport'
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
			'[[sip|SIP]] is the traditional telephony signaling protocol for VoIP and video calls; [[webrtc|WebRTC]] provides browser-native peer-to-peer real-time communication without plugins.',
		keyDifferences: [
			{ aspect: 'Browser support', left: 'Requires [[sip|SIP]] client/softphone', right: 'Native in all modern browsers' },
			{ aspect: 'Connection model', left: 'Client-server via [[sip|SIP]] proxy/registrar', right: 'Peer-to-peer with STUN/TURN fallback' },
			{ aspect: 'Complexity', left: 'Mature telecom stack ([[sip|SIP]]/[[sdp|SDP]]/[[rtp|RTP]])', right: 'Integrated (ICE, DTLS-SRTP, [[sctp|SCTP]])' },
			{ aspect: 'Ecosystem', left: 'Asterisk, FreeSWITCH, telecom carriers', right: 'Browsers, Twilio, Daily, Jitsi' },
			{ aspect: 'Standardization', left: 'IETF RFC 3261 (telecom-oriented)', right: 'W3C + IETF (web-oriented)' }
		],
		useLeftWhen: [
			'You are integrating with existing telephony infrastructure (PBX, PSTN)',
			'Enterprise VoIP or contact center systems are your target',
			'Interoperability with telecom carriers and [[sip|SIP]] trunks is needed',
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
			'[[rtmp|RTMP]] is used for live stream ingest from encoders to servers; [[hls|HLS]] is used for delivery from servers to viewers via HTTP-based adaptive streaming.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'HTTP (segment-based delivery)', right: '[[tcp|TCP]] (persistent chunked stream)' },
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
			'Your streaming software (OBS, Wirecast) uses [[rtmp|RTMP]] natively',
			'You need a persistent connection for live content contribution'
		]
	},
	{
		ids: ['dash', 'rtmp'],
		type: 'vs',
		summary:
			'[[rtmp|RTMP]] is a persistent [[tcp|TCP]]-based protocol for live stream ingest; [[dash|DASH]] is an HTTP-based adaptive streaming protocol for scalable video delivery to viewers.',
		keyDifferences: [
			{ aspect: 'Transport', left: 'HTTP (segment downloads)', right: '[[tcp|TCP]] (persistent connection)' },
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
			'Your media server accepts [[rtmp|RTMP]] as the contribution format',
			'You need real-time stream publishing with minimal buffering'
		]
	},

	// ── Utilities / Security ────────────────────────────────────

	{
		ids: ['ssh', 'tls'],
		type: 'vs',
		summary:
			'[[tls|TLS]] secures arbitrary application protocols transparently (HTTPS, SMTPS); [[ssh|SSH]] provides an encrypted channel specifically for remote shell access, file transfer, and port forwarding.',
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
			'You are securing a web protocol (HTTP, [[smtp|SMTP]], [[ftp|FTP]], [[mqtt|MQTT]])',
			'Browser clients must connect securely without special software',
			'Your application needs transparent encryption without changing its protocol',
			'Certificate-based trust via public CAs (Let\'s Encrypt) is preferred'
		]
	},

	// ── Email: send vs receive ──────────────────────────────────

	{
		ids: ['imap', 'smtp'],
		type: 'vs',
		summary:
			'[[smtp|SMTP]] sends email from sender to destination servers; [[imap|IMAP]] retrieves and manages email that has already been delivered. Together they form the complete email system.',
		keyDifferences: [
			{
				aspect: 'Direction',
				left: 'Retrieves mail from server to client',
				right: 'Sends mail from client to server/relay'
			},
			{
				aspect: 'Connection model',
				left: 'Persistent stateful session (SELECT, FETCH, IDLE)',
				right: 'Transactional (MAIL FROM, DATA, QUIT)'
			},
			{
				aspect: 'Mail storage',
				left: 'Mail stays on server, synced across all devices',
				right: 'Mail handed off — sender retains no role after delivery'
			},
			{
				aspect: 'Command format',
				left: 'Tagged commands (A001 SELECT INBOX) — enables pipelining',
				right: 'Sequential commands (EHLO → MAIL FROM → DATA)'
			},
			{
				aspect: 'Default port',
				left: '993 (IMAPS with TLS)',
				right: '587 (submission with STARTTLS)'
			}
		],
		useLeftWhen: [
			'You need to read, search, or organize email on the server',
			'Multiple devices must see the same mailbox state (read/unread, folders)',
			'Server-side search and filtering is important for your workflow',
			'You want push notifications for new email via IDLE'
		],
		useRightWhen: [
			'You need to send or relay email to recipients',
			'Your application generates transactional emails (receipts, alerts, notifications)',
			'You are building an email relay or forwarding service',
			'You need store-and-forward delivery across mail servers via MX records'
		]
	},

	// ── Network Foundations ──────────────────────────────────────

	{
		ids: ['ethernet', 'wifi'],
		type: 'vs',
		summary:
			'[[ethernet|Ethernet]] uses cables for reliable, high-speed LAN connectivity; [[wifi|Wi-Fi]] uses radio waves for wireless flexibility at the cost of shared airtime and lower throughput.',
		keyDifferences: [
			{ aspect: 'Medium', left: 'Copper/fiber cables (dedicated per link)', right: 'Radio waves (shared airtime)' },
			{ aspect: 'Access control', left: 'Full duplex on switched links (no collisions)', right: 'CSMA/CA — collision avoidance on shared medium' },
			{ aspect: 'Speed (typical)', left: '1-100 Gbps', right: '100 Mbps–9.6 Gbps (Wi-Fi 6E/7)' },
			{ aspect: 'Security', left: 'Physical access required (inherently private)', right: 'Encryption mandatory (WPA2/WPA3)' },
			{ aspect: 'Addressing', left: '2 MAC addresses per frame (src, dst)', right: '3-4 MAC addresses per frame (RA, TA, DA, SA)' }
		],
		useLeftWhen: [
			'Maximum speed and minimum latency are required (data centers, server rooms)',
			'Devices are stationary and can be physically cabled',
			'You need guaranteed bandwidth without contention (financial trading, AV production)',
			'Physical security of the network medium is important'
		],
		useRightWhen: [
			'Devices need mobility (laptops, phones, tablets, IoT sensors)',
			'Running cables is impractical or impossible (historic buildings, temporary setups)',
			'Convenience and coverage matter more than raw performance',
			'You need to connect many consumer devices in a home or office'
		]
	},

	{
		ids: ['ip', 'ipv6'],
		type: 'vs',
		summary:
			'[[ip|IPv4]] uses 32-bit addresses (4.3 billion) and has served since 1981; [[ipv6|IPv6]] uses 128-bit addresses (340 undecillion) with a simplified header and no NAT needed.',
		keyDifferences: [
			{ aspect: 'Address size', left: '32-bit (192.168.1.1) — 4.3 billion addresses', right: '128-bit (2001:db8::1) — 340 undecillion addresses' },
			{ aspect: 'Header', left: 'Variable 20-60 bytes, header checksum, options', right: 'Fixed 40 bytes, no checksum, extension header chain' },
			{ aspect: 'Fragmentation', left: 'Routers and hosts can fragment', right: 'Only source host fragments (Path MTU Discovery)' },
			{ aspect: 'Address resolution', left: 'ARP broadcasts (FF:FF:FF:FF:FF:FF)', right: 'NDP solicited-node multicast (far more efficient)' },
			{ aspect: 'Auto-configuration', left: 'Requires DHCP server', right: 'SLAAC — hosts self-configure from router prefix' }
		],
		useLeftWhen: [
			'You are operating in legacy environments where IPv6 is not yet supported',
			'All devices and infrastructure only support IPv4',
			'NAT provides sufficient address space for your needs',
			'Your network tooling and monitoring only handles IPv4'
		],
		useRightWhen: [
			'You need globally unique addresses for every device (IoT, mobile, cloud)',
			'You want to eliminate NAT complexity and enable true end-to-end connectivity',
			'You are deploying on modern mobile or cloud networks that prefer IPv6',
			'You need efficient multicast and solicited-node address resolution'
		]
	},

	// ── Web & API ───────────────────────────────────────────────

	{
		ids: ['soap', 'rest'],
		type: 'vs',
		summary:
			'[[soap|SOAP]] provides formal XML contracts and enterprise features (transactions, security); [[rest|REST]] favors simplicity with JSON over HTTP and standard methods.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'XML only (strict schema)', right: 'JSON, XML, or any format (flexible)' },
			{ aspect: 'Contract', left: 'WSDL — formal, machine-readable service definition', right: 'OpenAPI/Swagger — optional, documentation-oriented' },
			{ aspect: 'Transport', left: 'HTTP POST only (protocol-agnostic in theory)', right: 'Full HTTP semantics (GET, POST, PUT, DELETE)' },
			{ aspect: 'Error handling', left: 'SOAP Fault — structured XML error envelopes', right: 'HTTP status codes (404, 500, etc.)' },
			{ aspect: 'Ecosystem', left: 'WS-Security, WS-ReliableMessaging, WS-AtomicTransaction', right: 'Lightweight — use TLS, retries, saga pattern separately' }
		],
		useLeftWhen: [
			'You need formal service contracts with strict schema validation (banking, insurance)',
			'Built-in security standards are required (WS-Security with XML signatures)',
			'Distributed transactions across services must be atomic (WS-AtomicTransaction)',
			'You are integrating with legacy enterprise systems that already speak SOAP'
		],
		useRightWhen: [
			'You want simplicity and human-readable JSON payloads',
			'Your API is public-facing and needs broad developer adoption',
			'You want to leverage HTTP caching, content negotiation, and standard methods',
			'Performance matters — JSON is 2-10x smaller than equivalent XML'
		]
	},
	{
		ids: ['soap', 'grpc'],
		type: 'vs',
		summary:
			'Both use strict contracts and code generation, but [[soap|SOAP]] wraps calls in verbose XML envelopes while [[grpc|gRPC]] uses compact binary Protobuf over HTTP/2.',
		keyDifferences: [
			{ aspect: 'Serialization', left: 'XML (text-based, verbose)', right: 'Protocol Buffers (binary, compact)' },
			{ aspect: 'Contract', left: 'WSDL (XML Schema)', right: '.proto files (Protocol Buffers IDL)' },
			{ aspect: 'Transport', left: 'HTTP/1.1 POST', right: 'HTTP/2 with multiplexing and streaming' },
			{ aspect: 'Streaming', left: 'Not supported natively', right: 'Bidirectional streaming built-in' },
			{ aspect: 'Ecosystem', left: 'Mature enterprise (Java, .NET)', right: 'Modern polyglot (Go, Rust, Python, Java, JS)' }
		],
		useLeftWhen: [
			'You are in a regulated industry requiring WSDL-based formal contracts',
			'Existing infrastructure is built around SOAP/WS-* standards',
			'You need WS-Security features like XML digital signatures',
			'Human-readable XML messages aid debugging and compliance auditing'
		],
		useRightWhen: [
			'Performance is critical — binary serialization is 5-10x faster than XML',
			'You need streaming (server push, bidirectional communication)',
			'You are building modern microservices that need efficient inter-service calls',
			'Your team prefers code generation from .proto files over WSDL tooling'
		]
	},
	{
		ids: ['soap', 'graphql'],
		type: 'vs',
		summary:
			'[[soap|SOAP]] defines rigid operations via WSDL; [[graphql|GraphQL]] lets clients specify exactly the data they need in a single flexible query.',
		keyDifferences: [
			{ aspect: 'Query model', left: 'Fixed operations defined in WSDL', right: 'Client specifies exact fields and relationships' },
			{ aspect: 'Data format', left: 'XML envelopes with XML Schema', right: 'JSON responses with typed schema' },
			{ aspect: 'Over/under-fetching', left: 'Returns entire operation result (over-fetching)', right: 'Returns exactly requested fields (precise)' },
			{ aspect: 'Versioning', left: 'WSDL versioning (breaking changes)', right: 'Schema evolution (additive, non-breaking)' },
			{ aspect: 'Introspection', left: 'WSDL document download', right: 'Built-in schema introspection queries' }
		],
		useLeftWhen: [
			'You need formal, validated contracts for enterprise integration',
			'The API surface is well-defined with fixed operations',
			'Regulatory requirements mandate WSDL-based service descriptions',
			'WS-* enterprise features (transactions, reliable messaging) are needed'
		],
		useRightWhen: [
			'Clients have varying data needs (mobile gets less, desktop gets more)',
			'You want to reduce round trips by fetching related data in a single query',
			'Your API evolves frequently and you want to avoid breaking changes',
			'Developer experience and self-documenting schemas are priorities'
		]
	},

	// ── Utilities / Security ────────────────────────────────────

	{
		ids: ['oauth2', 'tls'],
		type: 'vs',
		summary:
			'[[oauth2|OAuth 2.0]] handles authorization (who can access what); [[tls|TLS]] handles encryption (protecting data in transit). Different problems, complementary solutions — OAuth requires TLS.',
		keyDifferences: [
			{ aspect: 'Problem solved', left: 'Authorization — delegated access to resources', right: 'Encryption — confidentiality and integrity of data in transit' },
			{ aspect: 'OSI layer', left: 'Application layer (HTTP redirects, tokens)', right: 'Session/transport layer (encrypts byte streams)' },
			{ aspect: 'Scope', left: 'Per-resource access control (scopes, tokens)', right: 'Per-connection encryption (entire data stream)' },
			{ aspect: 'User involvement', left: 'User consents to grant access', right: 'Transparent to the user (lock icon in browser)' },
			{ aspect: 'Dependency', left: 'Requires TLS for security (tokens in cleartext = disaster)', right: 'Independent — works without OAuth' }
		],
		useLeftWhen: [
			'Third-party apps need access to user resources without passwords',
			'You need scoped, revocable access tokens for API authorization',
			'Your system requires delegated consent (user approves access)',
			'You are building a platform with third-party integrations'
		],
		useRightWhen: [
			'You need to encrypt data between client and server (HTTPS)',
			'Server identity verification via certificates is required',
			'You want to protect any protocol from eavesdropping (not just HTTP)',
			'Compliance requires encryption of data in transit'
		]
	},

	// ── JSON-RPC ────────────────────────────────────────────────

	{
		ids: ['json-rpc', 'rest'],
		type: 'vs',
		summary:
			'[[rest|REST]] maps operations to HTTP verbs and multiple resource URLs; [[json-rpc|JSON-RPC]] sends method names to a single endpoint. REST is resource-oriented, JSON-RPC is action-oriented.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Method name + params in JSON body', right: 'HTTP verbs + resource URLs' },
			{ aspect: 'Caching', left: 'Not cacheable (all POSTs)', right: 'HTTP-level caching (GET is cacheable)' },
			{ aspect: 'Complexity', left: 'Minimal spec, single endpoint', right: 'Convention-heavy, multiple endpoints' },
			{ aspect: 'Ecosystem', left: 'Growing (blockchain, AI agents)', right: 'Dominant (most public APIs)' },
			{ aspect: 'Overhead', left: 'Batch requests reduce round trips', right: 'One HTTP request per operation' }
		],
		useLeftWhen: [
			'Your API is action-oriented rather than resource-oriented (execute, calculate, query)',
			'You need batch requests to reduce round trips for multiple calls',
			'You are building infrastructure APIs (blockchain nodes, AI agents, editor backends)',
			'Simplicity and minimal spec surface matter more than HTTP conventions'
		],
		useRightWhen: [
			'Your API models resources with standard CRUD operations',
			'HTTP caching, content negotiation, and status codes are important',
			'You need broad third-party developer adoption (REST is universally understood)',
			'Your API will be consumed by web browsers directly'
		]
	},
	{
		ids: ['grpc', 'json-rpc'],
		type: 'vs',
		summary:
			'[[grpc|gRPC]] uses binary Protocol Buffers and HTTP/2 for maximum performance with code generation; [[json-rpc|JSON-RPC]] uses human-readable JSON over any transport for maximum simplicity.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Binary (Protocol Buffers)', right: 'Text (JSON)' },
			{ aspect: 'Transport', left: 'HTTP/2 only', right: 'Any (HTTP, WebSocket, stdio, TCP)' },
			{ aspect: 'Direction', left: 'Unary + bidirectional streaming', right: 'Request-response + notifications' },
			{ aspect: 'Complexity', left: '.proto files + code generation', right: 'No schema, no build step' },
			{ aspect: 'Ecosystem', left: 'Mature (Google-backed, 11 languages)', right: 'Lightweight (blockchain, AI, editors)' }
		],
		useLeftWhen: [
			'You need maximum throughput between internal microservices',
			'Strong typing and compile-time contract validation are essential',
			'You need streaming (server-push, client-push, or bidirectional)',
			'Your team can afford the .proto build step and code generation'
		],
		useRightWhen: [
			'Human-readable messages matter (debugging, logging, curl testing)',
			'You need transport flexibility (stdio for local processes, HTTP for remote)',
			'The overhead of code generation and Protobuf compilation is not worth it',
			'You are integrating with systems that already speak JSON-RPC (Ethereum, LSP, MCP)'
		]
	},
	{
		ids: ['graphql', 'json-rpc'],
		type: 'vs',
		summary:
			'[[graphql|GraphQL]] lets clients select exactly which fields they need via a query language; [[json-rpc|JSON-RPC]] calls methods by name and returns whatever the method returns — no field selection.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'Query language with field selection', right: 'Method name + params, fixed response' },
			{ aspect: 'Complexity', left: 'Schema, resolvers, query parsing', right: 'No schema, direct method dispatch' },
			{ aspect: 'Overhead', left: 'Query parsing + validation per request', right: 'Minimal — JSON parse + method lookup' },
			{ aspect: 'Direction', left: 'Request-response + subscriptions', right: 'Request-response + notifications' },
			{ aspect: 'Ecosystem', left: 'Web frontends, mobile apps', right: 'Infrastructure, blockchain, AI agents' }
		],
		useLeftWhen: [
			'Clients have varied data needs and over-fetching is a problem',
			'Your data model has deep relationships that benefit from traversal queries',
			'You want introspection — clients can discover the schema automatically',
			'Frontend teams need to iterate on data requirements without backend changes'
		],
		useRightWhen: [
			'Your API is action-oriented (execute, compute, control) rather than data-oriented',
			'Maximum simplicity and minimal overhead are priorities',
			'You are building infrastructure (blockchain nodes, AI tool servers, editor backends)',
			'Batch requests for multiple independent calls matter more than flexible field selection'
		]
	},
	{
		ids: ['json-rpc', 'soap'],
		type: 'vs',
		summary:
			'[[soap|SOAP]] wraps RPC calls in verbose XML envelopes with formal WSDL contracts and WS-* extensions; [[json-rpc|JSON-RPC]] does the same thing in a few lines of JSON with no ceremony.',
		keyDifferences: [
			{ aspect: 'Data format', left: 'JSON (lightweight text)', right: 'XML (verbose, structured envelopes)' },
			{ aspect: 'Complexity', left: 'One-page spec, no schema required', right: 'WSDL, XSD, WS-* extensions' },
			{ aspect: 'Overhead', left: '~60 bytes for a simple call', right: '500+ bytes for the same call in XML' },
			{ aspect: 'Standardization', left: 'Community spec (jsonrpc.org)', right: 'W3C standard with enterprise extensions' },
			{ aspect: 'Ecosystem', left: 'Modern infrastructure and AI', right: 'Enterprise banking, healthcare, government' }
		],
		useLeftWhen: [
			'You want RPC without the overhead of XML and WSDL',
			'Your system uses JSON natively (JavaScript, Python, modern languages)',
			'You are building new systems where simplicity outweighs enterprise features',
			'Human-readability and debugging ease are priorities'
		],
		useRightWhen: [
			'Formal WSDL contracts and compile-time validation are required',
			'You need WS-Security, WS-ReliableMessaging, or WS-AtomicTransaction',
			'You are integrating with existing enterprise SOAP services',
			'Regulatory compliance requires the formality and audit trail of SOAP'
		]
	},

	// ── MCP / A2A ───────────────────────────────────────────────

	{
		ids: ['a2a', 'mcp'],
		type: 'vs',
		summary:
			'[[mcp|MCP]] connects an AI agent to tools and data sources; [[a2a|A2A]] connects AI agents to each other for multi-agent collaboration. They are complementary, not competing.',
		keyDifferences: [
			{ aspect: 'Purpose', left: 'Agent-to-agent collaboration', right: 'Agent-to-tool integration' },
			{ aspect: 'Discovery', left: 'Agent Cards at /.well-known/agent.json', right: 'Capabilities handshake (initialize)' },
			{ aspect: 'Transparency', left: 'Opaque (skills only, no internals)', right: 'Transparent (tool schemas, resource URIs)' },
			{ aspect: 'Unit of work', left: 'Task with lifecycle (stateful)', right: 'Tool call (stateless request-response)' },
			{ aspect: 'Transport', left: 'HTTP, SSE, webhooks, gRPC', right: 'stdio, Streamable HTTP' }
		],
		useLeftWhen: [
			'You need multiple AI agents to collaborate on complex tasks',
			'Agents are opaque systems from different vendors or frameworks',
			'Tasks are long-running and need lifecycle management (status, cancellation)',
			'Cross-organization agent communication requires formal discovery'
		],
		useRightWhen: [
			'An AI application needs to access external tools and data sources',
			'You want the LLM to discover and invoke functions dynamically',
			'Local tool integration via subprocess (stdio) is sufficient',
			'Tool schemas and data resources should be fully transparent to the host'
		]
	},
	{
		ids: ['a2a', 'rest'],
		type: 'vs',
		summary:
			'[[rest|REST]] is a general-purpose API style for any client; [[a2a|A2A]] is specifically designed for AI agent communication with discovery, task lifecycle, and streaming built in.',
		keyDifferences: [
			{ aspect: 'Purpose', left: 'AI agent-to-agent collaboration', right: 'General-purpose API access' },
			{ aspect: 'Discovery', left: 'Agent Cards with skills and auth', right: 'OpenAPI/Swagger documentation' },
			{ aspect: 'Statefulness', left: 'Stateful tasks with lifecycle', right: 'Stateless request-response' },
			{ aspect: 'Direction', left: 'Bidirectional (SSE, webhooks)', right: 'Client-initiated only' },
			{ aspect: 'Data format', left: 'JSON-RPC methods + Parts/Artifacts', right: 'HTTP verbs + resource URLs' }
		],
		useLeftWhen: [
			'You are building multi-agent AI systems that need to delegate and coordinate',
			'Task lifecycle management (submitted, working, completed, failed) is needed',
			'Agent discovery and capability negotiation must be standardized',
			'Streaming progress updates and push notifications are important'
		],
		useRightWhen: [
			'You are building a general-purpose API for human developers',
			'Simple CRUD operations on resources are sufficient',
			'Broad third-party adoption and tooling maturity are essential',
			'HTTP caching, content negotiation, and status codes provide enough semantics'
		]
	},
	{
		ids: ['mcp', 'rest'],
		type: 'vs',
		summary:
			'[[rest|REST]] exposes resources via HTTP for any client; [[mcp|MCP]] exposes tools, resources, and prompts specifically for AI applications with LLM-native semantics like sampling and tool schemas.',
		keyDifferences: [
			{ aspect: 'Purpose', left: 'AI-native tool and data access', right: 'General-purpose API access' },
			{ aspect: 'Discovery', left: 'Dynamic capability negotiation', right: 'Static OpenAPI documentation' },
			{ aspect: 'Data format', left: 'JSON-RPC methods (tools/call)', right: 'HTTP verbs + resource URLs' },
			{ aspect: 'Transport', left: 'stdio + Streamable HTTP', right: 'HTTP only' },
			{ aspect: 'Ecosystem', left: 'AI apps (Claude, ChatGPT, Cursor)', right: 'Universal (any HTTP client)' }
		],
		useLeftWhen: [
			'You are building tools for AI applications to consume (not human developers)',
			'Dynamic tool discovery and JSON Schema input validation are needed',
			'Local subprocess communication (stdio) is the primary use case',
			'The server needs to request LLM completions from the host (sampling)'
		],
		useRightWhen: [
			'Your API serves both human developers and automated systems',
			'HTTP semantics (caching, status codes, content negotiation) are valuable',
			'Maximum compatibility across all languages and platforms is essential',
			'You do not need LLM-specific features like tool schemas or sampling'
		]
	},
	{
		ids: ['a2a', 'grpc'],
		type: 'vs',
		summary:
			'[[grpc|gRPC]] is a general-purpose RPC framework for microservices; [[a2a|A2A]] is specifically designed for AI agent communication with agent discovery, task lifecycle, and opaque collaboration.',
		keyDifferences: [
			{ aspect: 'Purpose', left: 'AI agent collaboration', right: 'General-purpose microservice RPC' },
			{ aspect: 'Discovery', left: 'Agent Cards with skills', right: 'Protobuf service reflection' },
			{ aspect: 'Data format', left: 'JSON-RPC 2.0 (text)', right: 'Protocol Buffers (binary)' },
			{ aspect: 'Statefulness', left: 'Stateful tasks with lifecycle', right: 'Stateless unary or streaming calls' },
			{ aspect: 'Ecosystem', left: 'AI agents (Google, Salesforce, SAP)', right: 'Microservices (Kubernetes, service mesh)' }
		],
		useLeftWhen: [
			'You are orchestrating opaque AI agents that need to discover and delegate tasks',
			'Task lifecycle management and push notifications are essential',
			'Human-readable JSON messages are important for debugging and logging',
			'Agents from different vendors and frameworks need to interoperate'
		],
		useRightWhen: [
			'You need maximum throughput between internal microservices',
			'Strong typing with .proto files and compile-time validation is required',
			'Bidirectional streaming between services is the primary pattern',
			'Binary serialization efficiency matters more than human readability'
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
			'[[tls|TLS]] encrypts the byte stream that [[tcp|TCP]] reliably delivers, together forming the secure transport foundation for HTTPS and most encrypted internet traffic.',
		howTheyWork:
			'[[tcp|TCP]] first establishes a reliable connection via its 3-way handshake. Then [[tls|TLS]] performs its own handshake on top of that [[tcp|TCP]] connection, negotiating cipher suites and exchanging keys. Once both handshakes complete, all application data flows through [[tls|TLS]] encryption over the [[tcp|TCP]] stream.',
		leftRole: '[[tcp|TCP]] provides reliable, ordered byte-stream delivery between endpoints.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for the data [[tcp|TCP]] carries.'
	},
	{
		ids: ['amqp', 'tcp'],
		type: 'relationship',
		summary:
			'[[amqp|AMQP]] runs over [[tcp|TCP]], relying on its reliable byte stream to guarantee that messages, acknowledgments, and routing commands between clients and brokers are never lost or reordered.',
		howTheyWork:
			'An [[amqp|AMQP]] client opens a [[tcp|TCP]] connection to the broker (typically port 5672) and performs the [[amqp|AMQP]] protocol handshake to negotiate capabilities. [[amqp|AMQP]] then multiplexes multiple logical channels over this single [[tcp|TCP]] connection, using [[tcp|TCP]]\'s reliability to ensure every published message, acknowledgment, and broker command arrives intact and in order.',
		leftRole: '[[amqp|AMQP]] provides message routing, queuing, acknowledgment, and delivery guarantee semantics.',
		rightRole: '[[tcp|TCP]] provides the reliable, ordered byte-stream transport that [[amqp|AMQP]] frames are carried over.'
	},
	{
		ids: ['dns', 'tcp'],
		type: 'relationship',
		summary:
			'[[dns|DNS]] falls back to [[tcp|TCP]] when responses exceed the 512-byte [[udp|UDP]] limit or when zone transfers require reliable delivery of complete [[dns|DNS]] records.',
		howTheyWork:
			'When a [[dns|DNS]] response is too large for a single [[udp|UDP]] datagram (common with DNSSEC or many records), the server signals truncation and the client retries over [[tcp|TCP]] port 53. Zone transfers (AXFR/IXFR) between authoritative servers always use [[tcp|TCP]] to ensure the complete zone dataset is delivered reliably without loss or reordering.',
		leftRole: '[[dns|DNS]] defines the query/response protocol for name resolution and zone transfer operations.',
		rightRole: '[[tcp|TCP]] provides reliable delivery for large [[dns|DNS]] responses and complete zone transfers that exceed [[udp|UDP]]\'s practical limits.'
	},
	{
		ids: ['ftp', 'tcp'],
		type: 'relationship',
		summary:
			'[[ftp|FTP]] uses [[tcp|TCP]] for both its control channel (commands and responses) and its separate data channel (file transfers), relying on reliable delivery to ensure files arrive intact.',
		howTheyWork:
			'[[ftp|FTP]] establishes a [[tcp|TCP]] control connection on port 21 for exchanging commands (LIST, RETR, STOR) and status replies. For each file transfer, a separate [[tcp|TCP]] data connection is opened — either from server to client (active mode) or client to server (passive mode). [[tcp|TCP]]\'s reliability guarantees that transferred files are complete and uncorrupted.',
		leftRole: '[[ftp|FTP]] provides the command protocol for file listing, upload, download, and directory navigation.',
		rightRole: '[[tcp|TCP]] provides reliable, ordered delivery for both the [[ftp|FTP]] control channel and file data transfers.'
	},
	{
		ids: ['http1', 'tcp'],
		type: 'relationship',
		summary:
			'[[http1|[[http1|HTTP/1]].1]] sends requests and responses as plaintext over [[tcp|TCP]] connections, relying on [[tcp|TCP]]\'s reliable delivery to ensure every header and body byte arrives in order.',
		howTheyWork:
			'The client opens a [[tcp|TCP]] connection (typically port 80 or 443 with [[tls|TLS]]) and sends an HTTP request as a text stream. The server responds over the same connection, which can be reused for subsequent requests via keep-alive. Each request-response pair is serialized on the connection, meaning [[http1|[[http1|HTTP/1]].1]] inherits [[tcp|TCP]]\'s head-of-line blocking.',
		leftRole: '[[http1|[[http1|HTTP/1]].1]] provides the request-response semantics, headers, methods, and status codes for web communication.',
		rightRole: '[[tcp|TCP]] provides the reliable, ordered byte stream that [[http1|[[http1|HTTP/1]].1]] messages are transmitted over.'
	},
	{
		ids: ['http2', 'tcp'],
		type: 'relationship',
		summary:
			'[[http2|HTTP/2]] multiplexes many request-response streams over a single [[tcp|TCP]] connection, gaining efficiency but inheriting [[tcp|TCP]]-level head-of-line blocking when packets are lost.',
		howTheyWork:
			'[[http2|HTTP/2]] opens one [[tcp|TCP]] connection per origin and sends all requests as interleaved binary frames across independent logical streams. [[tcp|TCP]] sees this as a single byte stream and guarantees ordered delivery. If any [[tcp|TCP]] segment is lost, all [[http2|HTTP/2]] streams stall until retransmission completes — this [[tcp|TCP]]-level head-of-line blocking is what [[http3|HTTP/3]] ([[quic|QUIC]]) was designed to solve.',
		leftRole: '[[http2|HTTP/2]] provides binary framing, multiplexed streams, header compression, and server push.',
		rightRole: '[[tcp|TCP]] provides the single reliable byte stream over which all [[http2|HTTP/2]] frames are delivered.'
	},
	{
		ids: ['kafka', 'tcp'],
		type: 'relationship',
		summary:
			'[[kafka|Kafka]] uses persistent [[tcp|TCP]] connections between producers, consumers, and brokers to reliably stream high-throughput event data with ordering guarantees.',
		howTheyWork:
			'[[kafka|Kafka]] clients open long-lived [[tcp|TCP]] connections to brokers (default port 9092) and use [[kafka|Kafka]]\'s binary protocol to produce and consume messages in batches. [[tcp|TCP]]\'s reliable delivery ensures that large batches of events, offset commits, and metadata requests are never lost or reordered. Clients maintain connections to multiple brokers for partition-aware routing.',
		leftRole: '[[kafka|Kafka]] provides distributed log storage, partitioned topic streaming, and consumer group coordination.',
		rightRole: '[[tcp|TCP]] provides the reliable, persistent connections needed for high-throughput event delivery between [[kafka|Kafka]] clients and brokers.'
	},
	{
		ids: ['mqtt', 'tcp'],
		type: 'relationship',
		summary:
			'[[mqtt|MQTT]] uses [[tcp|TCP]] as its default transport, relying on [[tcp|TCP]]\'s reliable delivery to carry lightweight pub/sub messages between IoT devices and brokers.',
		howTheyWork:
			'An [[mqtt|MQTT]] client opens a [[tcp|TCP]] connection to the broker (typically port 1883, or 8883 with [[tls|TLS]]) and sends a CONNECT packet to establish the session. [[tcp|TCP]]\'s reliability ensures that PUBLISH, SUBSCRIBE, and acknowledgment packets arrive intact, which [[mqtt|MQTT]] layers its own QoS levels on top of. The persistent [[tcp|TCP]] connection also enables the broker to push messages to clients at any time.',
		leftRole: '[[mqtt|MQTT]] provides lightweight publish-subscribe messaging with QoS levels, retained messages, and last-will semantics.',
		rightRole: '[[tcp|TCP]] provides the reliable, persistent connection that [[mqtt|MQTT]] uses to deliver messages between clients and the broker.'
	},
	{
		ids: ['rtmp', 'tcp'],
		type: 'relationship',
		summary:
			'[[rtmp|RTMP]] runs over persistent [[tcp|TCP]] connections to reliably deliver live audio, video, and data streams from encoders to media servers.',
		howTheyWork:
			'[[rtmp|RTMP]] establishes a [[tcp|TCP]] connection (default port 1935) and performs its own handshake to negotiate the session. It then multiplexes audio, video, and command messages as interleaved chunks over this single [[tcp|TCP]] connection. [[tcp|TCP]]\'s reliable delivery ensures no media chunks are lost, which is critical since [[rtmp|RTMP]]\'s chunk-based protocol cannot recover from gaps.',
		leftRole: '[[rtmp|RTMP]] provides the media chunking, multiplexing, and stream control protocol for live streaming.',
		rightRole: '[[tcp|TCP]] provides the reliable, persistent connection that ensures every media chunk is delivered in order.'
	},
	{
		ids: ['sip', 'tcp'],
		type: 'relationship',
		summary:
			'[[sip|SIP]] can use [[tcp|TCP]] for signaling when messages are too large for [[udp|UDP]] datagrams or when reliable delivery of call setup and teardown is required.',
		howTheyWork:
			'[[sip|SIP]] operates over [[tcp|TCP]] (port 5060, or 5061 with [[tls|TLS]]) when message sizes exceed the MTU or when the deployment requires guaranteed delivery of INVITE, BYE, and REGISTER transactions. [[tcp|TCP]] ensures that large [[sip|SIP]] messages with [[sdp|SDP]] bodies, authentication headers, or multiple Via hops are delivered complete and in order.',
		leftRole: '[[sip|SIP]] provides the signaling protocol for initiating, modifying, and terminating multimedia sessions.',
		rightRole: '[[tcp|TCP]] provides reliable delivery for [[sip|SIP]] messages that are too large for [[udp|UDP]] or require guaranteed transport.'
	},
	{
		ids: ['smtp', 'tcp'],
		type: 'relationship',
		summary:
			'[[smtp|SMTP]] uses [[tcp|TCP]] to reliably deliver email messages and commands between mail clients and servers, ensuring no message data is lost in transit.',
		howTheyWork:
			'An [[smtp|SMTP]] client opens a [[tcp|TCP]] connection to the mail server on port 25 (or 587 for submission) and exchanges text commands (EHLO, MAIL FROM, RCPT TO, DATA) in a synchronous dialogue. [[tcp|TCP]]\'s reliable delivery guarantees that every command, response code, and email body byte arrives in order, which is essential since [[smtp|SMTP]] has no mechanism to recover from lost data at the application layer.',
		leftRole: '[[smtp|SMTP]] provides the command protocol for routing and delivering email messages between servers.',
		rightRole: '[[tcp|TCP]] provides the reliable, ordered connection that [[smtp|SMTP]]\'s synchronous command-response dialogue requires.'
	},
	{
		ids: ['ssh', 'tcp'],
		type: 'relationship',
		summary:
			'[[ssh|SSH]] runs over [[tcp|TCP]] to provide encrypted remote shell access, file transfer, and port forwarding over a reliable transport.',
		howTheyWork:
			'[[ssh|SSH]] opens a [[tcp|TCP]] connection (default port 22) and immediately begins its own key exchange and authentication handshake. Once the encrypted tunnel is established, [[ssh|SSH]] multiplexes multiple channels (shell sessions, port forwards, file transfers) over the single [[tcp|TCP]] connection. [[tcp|TCP]]\'s reliability is essential because [[ssh|SSH]]\'s encrypted stream cannot tolerate missing or reordered bytes.',
		leftRole: '[[ssh|SSH]] provides encrypted channels for remote shell access, file transfer, and port forwarding.',
		rightRole: '[[tcp|TCP]] provides the reliable, ordered byte stream that [[ssh|SSH]]\'s encrypted tunnel requires to function correctly.'
	},
	{
		ids: ['stomp', 'tcp'],
		type: 'relationship',
		summary:
			'[[stomp|STOMP]] sends its text-based messaging frames over [[tcp|TCP]] connections, relying on [[tcp|TCP]]\'s reliability to ensure message commands and acknowledgments are delivered intact.',
		howTheyWork:
			'A [[stomp|STOMP]] client opens a [[tcp|TCP]] connection to the broker and sends a CONNECT frame to initiate the session. All subsequent SEND, SUBSCRIBE, and ACK frames are transmitted as text over this [[tcp|TCP]] connection. [[tcp|TCP]] guarantees that these frames arrive complete and in order, which [[stomp|STOMP]] depends on since its simple text framing has no built-in retransmission or reordering logic.',
		leftRole: '[[stomp|STOMP]] provides a simple, text-based messaging protocol with SEND, SUBSCRIBE, and ACK commands.',
		rightRole: '[[tcp|TCP]] provides the reliable transport that ensures [[stomp|STOMP]]\'s text frames are delivered without loss or reordering.'
	},
	{
		ids: ['tcp', 'websockets'],
		type: 'relationship',
		summary:
			'[[websockets|WebSocket]] runs over [[tcp|TCP]], using an HTTP upgrade handshake to establish a persistent, full-duplex message channel over a reliable transport.',
		howTheyWork:
			'The client sends an [[http1|[[http1|HTTP/1]].1]] Upgrade request over an existing [[tcp|TCP]] connection, and the server responds with 101 Switching Protocols. From that point, the [[tcp|TCP]] connection carries [[websockets|WebSocket]] frames instead of HTTP. [[tcp|TCP]]\'s reliable, ordered delivery ensures that [[websockets|WebSocket]] messages — which can be fragmented across multiple frames — are reassembled correctly on both sides.',
		leftRole: '[[tcp|TCP]] provides the reliable, persistent connection that [[websockets|WebSocket]] frames are transmitted over.',
		rightRole: '[[websockets|WebSocket]] provides full-duplex, message-oriented communication with lightweight framing over the [[tcp|TCP]] connection.'
	},
	{
		ids: ['tcp', 'xmpp'],
		type: 'relationship',
		summary:
			'[[xmpp|XMPP]] maintains long-lived [[tcp|TCP]] connections to stream XML stanzas between clients and servers, relying on [[tcp|TCP]] for reliable delivery of presence, messages, and IQ queries.',
		howTheyWork:
			'An [[xmpp|XMPP]] client opens a persistent [[tcp|TCP]] connection (default port 5222, with STARTTLS upgrade) and begins an XML stream. All communication — presence updates, chat messages, and IQ stanzas — flows as XML fragments over this single [[tcp|TCP]] connection. [[tcp|TCP]]\'s reliability ensures that XML stanzas are never lost or reordered, which is critical since [[xmpp|XMPP]]\'s XML parser requires a well-formed, sequential byte stream.',
		leftRole: '[[tcp|TCP]] provides the persistent, reliable connection that carries [[xmpp|XMPP]]\'s continuous XML stream.',
		rightRole: '[[xmpp|XMPP]] provides real-time messaging, presence, and extensible communication semantics via XML stanzas over the [[tcp|TCP]] stream.'
	},

	// ── UDP as transport ─────────────────────────────────────────

	{
		ids: ['dns', 'udp'],
		type: 'relationship',
		summary:
			'[[dns|DNS]] uses [[udp|UDP]] as its primary transport for fast, single-packet query-response lookups, keeping name resolution lightweight and low-latency.',
		howTheyWork:
			'A [[dns|DNS]] client sends a query as a single [[udp|UDP]] datagram (typically under 512 bytes) to a resolver on port 53. The resolver responds with another [[udp|UDP]] datagram containing the answer. No connection setup is needed, making lookups fast. For responses exceeding 512 bytes or requiring reliability, [[dns|DNS]] falls back to [[tcp|TCP]].',
		leftRole: '[[dns|DNS]] defines the query/response format for translating domain names to IP addresses.',
		rightRole: '[[udp|UDP]] provides the fast, connectionless transport that makes single-packet [[dns|DNS]] lookups efficient.'
	},
	{
		ids: ['coap', 'udp'],
		type: 'relationship',
		summary:
			'[[coap|CoAP]] runs over [[udp|UDP]] to provide a lightweight [[rest|REST]]-like request-response model for constrained IoT devices that cannot afford [[tcp|TCP]]\'s overhead.',
		howTheyWork:
			'[[coap|CoAP]] sends compact binary messages as [[udp|UDP]] datagrams, using a 4-byte fixed header and message IDs for optional reliability via confirmable messages. The client sends a [[coap|CoAP]] request (GET, PUT, POST, DELETE) in a single [[udp|UDP]] packet to the server, which replies with a response in another datagram. [[coap|CoAP]] adds its own simple retransmission over [[udp|UDP]] rather than requiring [[tcp|TCP]]\'s full connection management.',
		leftRole: '[[coap|CoAP]] provides RESTful resource semantics (methods, URIs, content negotiation) optimized for constrained networks.',
		rightRole: '[[udp|UDP]] provides the minimal, connectionless transport that keeps [[coap|CoAP]] lightweight enough for battery-powered sensors.'
	},
	{
		ids: ['dhcp', 'udp'],
		type: 'relationship',
		summary:
			'[[dhcp|DHCP]] uses [[udp|UDP]] for automatic IP address assignment, since clients cannot establish [[tcp|TCP]] connections before they have an IP address.',
		howTheyWork:
			'A [[dhcp|DHCP]] client broadcasts a DISCOVER message from port 68 as a [[udp|UDP]] datagram because it has no IP address yet and cannot perform [[tcp|TCP]]\'s handshake. The [[dhcp|DHCP]] server listens on port 67 and responds with an OFFER, also via [[udp|UDP]] broadcast or unicast. This bootstrap problem makes [[udp|UDP]] the only viable transport — [[tcp|TCP]] requires an established IP address on both sides before communication can begin.',
		leftRole: '[[dhcp|DHCP]] provides the protocol logic for discovering servers, requesting leases, and assigning IP configuration.',
		rightRole: '[[udp|UDP]] provides the connectionless transport necessary for communication before a client has an IP address.'
	},
	{
		ids: ['http3', 'udp'],
		type: 'relationship',
		summary:
			'[[http3|HTTP/3]] runs over [[quic|QUIC]], which itself runs over [[udp|UDP]], giving [[http3|HTTP/3]] multiplexed streams without [[tcp|TCP]]\'s head-of-line blocking while remaining deployable on existing networks.',
		howTheyWork:
			'[[udp|UDP]] carries [[quic|QUIC]] packets, which in turn carry [[http3|HTTP/3]] frames. [[quic|QUIC]] builds reliable, encrypted, multiplexed streams on top of [[udp|UDP]] datagrams, and [[http3|HTTP/3]] maps its request-response semantics onto those [[quic|QUIC]] streams. [[udp|UDP]]\'s universal NAT and firewall traversal makes [[quic|QUIC]] deployable without changes to network infrastructure.',
		leftRole: '[[http3|HTTP/3]] provides the application-layer request-response semantics, header compression (QPACK), and server push.',
		rightRole: '[[udp|UDP]] provides the underlying datagram delivery that allows [[quic|QUIC]] and [[http3|HTTP/3]] to bypass [[tcp|TCP]]\'s head-of-line blocking.'
	},
	{
		ids: ['ntp', 'udp'],
		type: 'relationship',
		summary:
			'[[ntp|NTP]] uses [[udp|UDP]] for clock synchronization because accurate timekeeping requires minimal, predictable latency that [[tcp|TCP]]\'s handshake and retransmissions would distort.',
		howTheyWork:
			'An [[ntp|NTP]] client sends a small [[udp|UDP]] datagram (48 bytes) to a time server on port 123, recording its send timestamp. The server stamps the packet with its receive and transmit times, then replies via [[udp|UDP]]. The client uses all four timestamps to calculate network delay and clock offset. [[tcp|TCP]]\'s variable latency from connection setup and retransmission would corrupt these precise timing measurements.',
		leftRole: '[[ntp|NTP]] provides the timestamping protocol and algorithms for calculating clock offset and drift.',
		rightRole: '[[udp|UDP]] provides the lightweight, fixed-overhead transport that preserves the timing accuracy [[ntp|NTP]] requires.'
	},
	{
		ids: ['rtp', 'udp'],
		type: 'relationship',
		summary:
			'[[rtp|RTP]] carries real-time audio and video over [[udp|UDP]], accepting occasional packet loss in exchange for the low latency that interactive media demands.',
		howTheyWork:
			'[[rtp|RTP]] adds a 12-byte header to each media packet with sequence numbers, timestamps, and payload type identifiers, then sends them as [[udp|UDP]] datagrams. The receiver uses sequence numbers to detect loss and reorder packets, and timestamps to synchronize playback. [[udp|UDP]]\'s lack of retransmission is a feature here — retransmitting a dropped video frame would arrive too late to be useful.',
		leftRole: '[[rtp|RTP]] provides media framing, sequencing, timestamping, and payload identification for audio/video streams.',
		rightRole: '[[udp|UDP]] provides the low-latency, no-retransmission transport that real-time media playback requires.'
	},
	{
		ids: ['sctp', 'udp'],
		type: 'relationship',
		summary:
			'[[sctp|SCTP]] can be encapsulated inside [[udp|UDP]] datagrams to traverse NATs and firewalls that would otherwise block native [[sctp|SCTP]] packets.',
		howTheyWork:
			'Since most NAT devices and firewalls only understand [[tcp|TCP]] and [[udp|UDP]], [[sctp|SCTP]] packets are wrapped inside [[udp|UDP]] datagrams (RFC 6951) to pass through unmodified network infrastructure. The [[udp|UDP]] header provides the NAT-traversal capability while [[sctp|SCTP]] inside provides multi-streaming, message boundaries, and multi-homing. This encapsulation is how [[webrtc|WebRTC]] data channels deliver [[sctp|SCTP]] over the public internet.',
		leftRole: '[[sctp|SCTP]] provides multi-stream, message-oriented reliable delivery with built-in multi-homing.',
		rightRole: '[[udp|UDP]] provides the NAT-traversable envelope that lets [[sctp|SCTP]] packets cross firewalls and middleboxes on the public internet.'
	},
	{
		ids: ['sip', 'udp'],
		type: 'relationship',
		summary:
			'[[sip|SIP]] commonly uses [[udp|UDP]] for VoIP call signaling because its short, independent messages benefit from [[udp|UDP]]\'s low overhead and fast delivery.',
		howTheyWork:
			'[[sip|SIP]] sends signaling messages (INVITE, ACK, BYE) as [[udp|UDP]] datagrams, typically on port 5060. Each [[sip|SIP]] message is self-contained and fits within a single datagram, making [[tcp|TCP]]\'s connection overhead unnecessary for most call setups. [[sip|SIP]] includes its own application-layer retransmission timers for reliability, re-sending requests if no response arrives within the timeout period.',
		leftRole: '[[sip|SIP]] provides the signaling protocol for initiating, modifying, and terminating multimedia sessions.',
		rightRole: '[[udp|UDP]] provides the fast, connectionless transport that keeps call setup latency low for VoIP signaling.'
	},
	{
		ids: ['udp', 'webrtc'],
		type: 'relationship',
		summary:
			'[[webrtc|WebRTC]] uses [[udp|UDP]] as its primary transport for peer-to-peer audio, video, and data channels, prioritizing low latency over guaranteed delivery.',
		howTheyWork:
			'[[webrtc|WebRTC]]\'s media stack sends SRTP-encrypted audio/video packets as [[udp|UDP]] datagrams between peers, using ICE for NAT traversal via STUN/TURN. Data channels use [[sctp|SCTP]] encapsulated in DTLS over [[udp|UDP]]. The entire [[webrtc|WebRTC]] transport is built on [[udp|UDP]] because interactive communication requires packets to arrive quickly or not at all — [[tcp|TCP]]\'s retransmission would add unacceptable delay.',
		leftRole: '[[udp|UDP]] provides the low-latency datagram transport that all [[webrtc|WebRTC]] media and data channels are built upon.',
		rightRole: '[[webrtc|WebRTC]] provides the peer-to-peer media framework, encryption (DTLS/SRTP), NAT traversal (ICE), and data channels on top.'
	},

	// ── TLS encryption ───────────────────────────────────────────

	{
		ids: ['amqp', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] wraps [[amqp|AMQP]] connections to create AMQPS, encrypting all message broker communication between clients and servers.',
		howTheyWork:
			'An [[amqp|AMQP]] client connects to port 5671 (AMQPS) and performs a [[tls|TLS]] handshake before any [[amqp|AMQP]] protocol negotiation begins. Once [[tls|TLS]] is established, the standard [[amqp|AMQP]] handshake and all subsequent message publishing, consuming, and acknowledgments flow through the encrypted channel. Without [[tls|TLS]], credentials and message payloads travel in plaintext on the default port 5672.',
		leftRole: '[[amqp|AMQP]] provides the message broker semantics — exchanges, queues, bindings, and delivery guarantees.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for all [[amqp|AMQP]] traffic.'
	},
	{
		ids: ['dash', 'tls'],
		type: 'relationship',
		summary:
			'[[dash|DASH]] delivers adaptive streaming segments over HTTPS, relying on [[tls|TLS]] to protect video content and DRM license exchanges in transit.',
		howTheyWork:
			'A [[dash|DASH]] player fetches the MPD manifest and all media segments via HTTPS requests, each secured by [[tls|TLS]]. The [[tls|TLS]] layer encrypts segment downloads and prevents tampering, which is especially critical when DRM license acquisition URLs are embedded in the manifest.',
		leftRole: '[[dash|DASH]] defines the adaptive bitrate streaming logic, manifest format, and segment request pattern.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity for manifest and segment downloads over HTTPS.'
	},
	{
		ids: ['dns', 'tls'],
		type: 'relationship',
		summary:
			'[[dns|DNS]] over [[tls|TLS]] (DoT) encrypts [[dns|DNS]] queries by wrapping them in a [[tls|TLS]] connection on port 853, preventing eavesdropping and manipulation of name resolution.',
		howTheyWork:
			'A [[dns|DNS]] client establishes a [[tls|TLS]] connection to a resolver on port 853 (RFC 7858) before sending any [[dns|DNS]] queries. Each query and response travels through the encrypted [[tls|TLS]] channel, preventing network observers from seeing which domains are being resolved. Without DoT, standard [[dns|DNS]] queries on port 53 are sent in plaintext and are trivially observable or spoofable.',
		leftRole: '[[dns|DNS]] provides the query/response protocol for translating domain names to IP addresses.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity, preventing eavesdropping and tampering of [[dns|DNS]] lookups.'
	},
	{
		ids: ['ftp', 'tls'],
		type: 'relationship',
		summary:
			'FTPS adds [[tls|TLS]] encryption to [[ftp|FTP]], securing both the control channel (commands and credentials) and data channel (file transfers).',
		howTheyWork:
			'In explicit FTPS, the client connects to port 21 and issues an AUTH [[tls|TLS]] command to upgrade the control connection to [[tls|TLS]] before sending credentials. In implicit FTPS, the client connects directly to port 990 where [[tls|TLS]] is required from the start. Both modes can also encrypt the data channel, ensuring file contents are protected in transit.',
		leftRole: '[[ftp|FTP]] provides the file transfer commands, directory listing, and data channel negotiation.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for [[ftp|FTP]] control and data channels.'
	},
	{
		ids: ['grpc', 'tls'],
		type: 'relationship',
		summary:
			'[[grpc|gRPC]] strongly recommends [[tls|TLS]] for all connections, and most deployments require it to authenticate services and encrypt Protobuf payloads in transit.',
		howTheyWork:
			'[[grpc|gRPC]] runs over [[http2|HTTP/2]], which in practice requires [[tls|TLS]]. The [[tls|TLS]] handshake authenticates the server (and optionally the client via mutual [[tls|TLS]]) before any RPC calls are made. [[grpc|gRPC]] channel credentials are configured with [[tls|TLS]] certificates, and the framework rejects insecure connections by default in production configurations.',
		leftRole: '[[grpc|gRPC]] provides the RPC framework, Protobuf serialization, and service definition layer.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and mutual authentication for [[grpc|gRPC]] channels.'
	},
	{
		ids: ['hls', 'tls'],
		type: 'relationship',
		summary:
			'[[hls|HLS]] delivers adaptive streaming playlists and media segments over HTTPS, relying on [[tls|TLS]] to protect content and encryption keys in transit.',
		howTheyWork:
			'An [[hls|HLS]] player fetches M3U8 playlists and .ts/.fmp4 segments via HTTPS, with [[tls|TLS]] encrypting every request. This is critical because [[hls|HLS]] playlists often reference AES-128 key URIs for content protection — without [[tls|TLS]], these decryption keys could be intercepted. Apple requires HTTPS for all [[hls|HLS]] content in App Transport Security.',
		leftRole: '[[hls|HLS]] defines the playlist format, segment structure, and adaptive bitrate switching logic.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity for playlist, segment, and encryption key downloads.'
	},
	{
		ids: ['http1', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] encrypts [[http1|[[http1|HTTP/1]].1]] connections to create HTTPS, the foundational secure web protocol serving the majority of internet traffic on port 443.',
		howTheyWork:
			'A client connects to port 443 and completes a [[tls|TLS]] handshake, authenticating the server via its certificate and negotiating encryption keys. Once the [[tls|TLS]] channel is established, standard [[http1|[[http1|HTTP/1]].1]] requests and responses flow through it with full encryption. Without [[tls|TLS]], [[http1|[[http1|HTTP/1]].1]] on port 80 transmits headers, cookies, and body content in plaintext.',
		leftRole: '[[http1|[[http1|HTTP/1]].1]] provides the request-response semantics, methods, headers, and content negotiation.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and server authentication for all HTTP traffic.'
	},
	{
		ids: ['http2', 'tls'],
		type: 'relationship',
		summary:
			'[[http2|HTTP/2]] effectively requires [[tls|TLS]] in practice, using the ALPN extension during the [[tls|TLS]] handshake to negotiate the h2 protocol without an extra round trip.',
		howTheyWork:
			'Although [[http2|HTTP/2]] technically allows cleartext (h2c), all major browsers only support [[http2|HTTP/2]] over [[tls|TLS]]. During the [[tls|TLS]] handshake, the client advertises "h2" via ALPN (Application-Layer Protocol Negotiation), and the server selects it. This eliminates the need for an HTTP Upgrade dance and ensures the multiplexed binary connection is always encrypted.',
		leftRole: '[[http2|HTTP/2]] provides multiplexed streams, header compression, and server push over a single connection.',
		rightRole: '[[tls|TLS]] provides encryption and enables h2 protocol negotiation via the ALPN extension.'
	},
	{
		ids: ['http3', 'tls'],
		type: 'relationship',
		summary:
			'[[http3|HTTP/3]] integrates [[tls|TLS]] 1.3 directly into the [[quic|QUIC]] transport layer, making encryption mandatory and reducing connection setup to a single round trip.',
		howTheyWork:
			'Unlike [[http1|[[http1|HTTP/1]].1]] and [[http2|HTTP/2]] where [[tls|TLS]] is a separate layer on top of [[tcp|TCP]], [[quic|QUIC]] embeds the [[tls|TLS]] 1.3 handshake into its own transport handshake. Cryptographic key negotiation happens simultaneously with connection establishment, achieving 1-RTT setup (or 0-RTT for resumed connections). Every [[quic|QUIC]] packet is authenticated and encrypted — there is no unencrypted [[http3|HTTP/3]].',
		leftRole: '[[http3|HTTP/3]] provides multiplexed request-response streams over [[quic|QUIC]] without head-of-line blocking.',
		rightRole: '[[tls|TLS]] 1.3 provides the cryptographic handshake and encryption integrated directly into [[quic|QUIC]].'
	},
	{
		ids: ['kafka', 'tls'],
		type: 'relationship',
		summary:
			'[[kafka|Kafka]] supports [[tls|TLS]] to encrypt all communication between producers, consumers, and brokers, as well as inter-broker replication traffic.',
		howTheyWork:
			'[[kafka|Kafka]] listeners can be configured with SSL/[[tls|TLS]] security, requiring clients to perform a [[tls|TLS]] handshake when connecting to brokers. [[tls|TLS]] encrypts produce requests, fetch responses, and metadata exchanges. Combined with SASL authentication, [[tls|TLS]] also enables mutual authentication between clients and brokers and secures inter-broker replication across data centers.',
		leftRole: '[[kafka|Kafka]] provides the distributed log, topic partitioning, consumer groups, and replication.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and optional mutual authentication for [[kafka|Kafka]] connections.'
	},
	{
		ids: ['mptcp', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] encrypts [[mptcp|MPTCP]] connections just as it does standard [[tcp|TCP]], securing data flowing across multiple network paths simultaneously.',
		howTheyWork:
			'[[mptcp|MPTCP]] establishes multiple [[tcp|TCP]] subflows across different network interfaces (e.g., Wi-Fi and cellular). [[tls|TLS]] operates on the [[mptcp|MPTCP]] connection as a whole, performing its handshake once over the initial subflow. The encrypted [[tls|TLS]] session then transparently spans all subflows, so data remains protected regardless of which network path carries it.',
		leftRole: '[[mptcp|MPTCP]] provides multi-path transport, aggregating bandwidth and enabling seamless failover.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication across all [[mptcp|MPTCP]] subflows.'
	},
	{
		ids: ['mqtt', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] wraps [[mqtt|MQTT]] connections to create MQTTS, encrypting all pub/sub messaging between IoT devices and the broker on port 8883.',
		howTheyWork:
			'An [[mqtt|MQTT]] client connects to the broker on port 8883 (MQTTS) and completes a [[tls|TLS]] handshake before sending the [[mqtt|MQTT]] CONNECT packet. All subsequent PUBLISH, SUBSCRIBE, and acknowledgment packets are encrypted. This is critical for IoT deployments where sensor data and device credentials traverse untrusted networks.',
		leftRole: '[[mqtt|MQTT]] provides lightweight pub/sub messaging with topic hierarchies and QoS levels.',
		rightRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for all [[mqtt|MQTT]] broker communication.'
	},
	{
		ids: ['quic', 'tls'],
		type: 'relationship',
		summary:
			'[[quic|QUIC]] deeply integrates [[tls|TLS]] 1.3 into its transport handshake, making encryption inseparable from connection establishment rather than an optional add-on layer.',
		howTheyWork:
			'[[quic|QUIC]] embeds the [[tls|TLS]] 1.3 handshake within its own transport handshake messages, combining cryptographic negotiation with connection setup in a single round trip. [[tls|TLS]] provides the key exchange and cipher negotiation, while [[quic|QUIC]] uses the derived keys to encrypt every packet including most header fields. Unlike [[tcp|TCP]]+[[tls|TLS]], there is no unencrypted [[quic|QUIC]] — the protocols are fused by design.',
		leftRole: '[[quic|QUIC]] provides multiplexed streams, congestion control, and connection migration over [[udp|UDP]].',
		rightRole: '[[tls|TLS]] 1.3 provides the cryptographic handshake, key derivation, and cipher suite negotiation within [[quic|QUIC]].'
	},
	{
		ids: ['rtmp', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] wraps [[rtmp|RTMP]] connections to create RTMPS, encrypting live stream ingest traffic between encoders and media servers on port 443.',
		howTheyWork:
			'An encoder (e.g., OBS) connects to the media server on port 443 and performs a [[tls|TLS]] handshake before beginning the [[rtmp|RTMP]] handshake. All subsequent [[rtmp|RTMP]] chunks — including the stream key, audio, and video data — flow through the encrypted channel. RTMPS is now required by major platforms like Facebook Live and YouTube Live for stream ingest.',
		leftRole: '[[rtmp|RTMP]] provides the live streaming protocol for publishing audio/video chunks to media servers.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity, protecting stream keys and media content in transit.'
	},
	{
		ids: ['sip', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] secures [[sip|SIP]] signaling to create SIPS, encrypting call setup, authentication, and routing between VoIP endpoints and proxies.',
		howTheyWork:
			'A [[sip|SIP]] client connects to a proxy or registrar over [[tls|TLS]] (typically port 5061), encrypting all signaling messages including REGISTER, INVITE, and BYE requests. The SIPS URI scheme (sips:) mandates [[tls|TLS]] hop-by-hop across the signaling path. Without [[tls|TLS]], [[sip|SIP]] headers expose caller identity, credentials, and call routing in plaintext.',
		leftRole: '[[sip|SIP]] provides the signaling protocol for establishing, modifying, and terminating voice/video sessions.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity for [[sip|SIP]] signaling, protecting credentials and call metadata.'
	},
	{
		ids: ['smtp', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] secures [[smtp|SMTP]] email delivery via STARTTLS (opportunistic upgrade on port 587) or SMTPS (implicit [[tls|TLS]] on port 465), encrypting messages between mail servers.',
		howTheyWork:
			'An [[smtp|SMTP]] client connects to a mail server and issues the STARTTLS command to upgrade the plaintext connection to [[tls|TLS]] before sending credentials or message content. Alternatively, implicit [[tls|TLS]] on port 465 establishes encryption immediately. MTA-STS and DANE policies can enforce [[tls|TLS]] to prevent downgrade attacks between mail servers.',
		leftRole: '[[smtp|SMTP]] provides the email delivery protocol for routing messages between mail transfer agents.',
		rightRole: '[[tls|TLS]] provides confidentiality and integrity for email content and authentication credentials in transit.'
	},
	{
		ids: ['tls', 'websockets'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] secures [[websockets|WebSocket]] connections to create WSS (wss://), encrypting the full-duplex message channel between browsers and servers.',
		howTheyWork:
			'A client connects to port 443, completes a [[tls|TLS]] handshake, and then performs the [[websockets|WebSocket]] HTTP Upgrade over the encrypted connection. Once upgraded, all [[websockets|WebSocket]] frames — both text and binary — flow through the [[tls|TLS]] channel. WSS is effectively required in production because most browsers block mixed content and many proxies interfere with unencrypted [[websockets|WebSocket]] connections.',
		leftRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for the [[websockets|WebSocket]] connection.',
		rightRole: '[[websockets|WebSocket]] provides persistent, full-duplex, message-oriented communication over the secure channel.'
	},
	{
		ids: ['tls', 'webrtc'],
		type: 'relationship',
		summary:
			'[[webrtc|WebRTC]] uses DTLS (Datagram [[tls|TLS]]) to perform key exchange over [[udp|UDP]], establishing the encryption keys used by SRTP to protect real-time media streams.',
		howTheyWork:
			'After ICE connectivity checks establish a [[udp|UDP]] path between peers, a DTLS handshake occurs over that path to authenticate both endpoints and derive shared encryption keys. These keys are then used by SRTP to encrypt audio/video media and by [[sctp|SCTP]] (tunneled over DTLS) to encrypt data channel messages. Without DTLS, [[webrtc|WebRTC]] peers could not establish trust or derive encryption keys over connectionless [[udp|UDP]].',
		leftRole: '[[tls|TLS]] (as DTLS) provides the key exchange, peer authentication, and key derivation over [[udp|UDP]].',
		rightRole: '[[webrtc|WebRTC]] uses DTLS-derived keys for SRTP media encryption and [[sctp|SCTP]] data channel security.'
	},
	{
		ids: ['tls', 'xmpp'],
		type: 'relationship',
		summary:
			'[[xmpp|XMPP]] uses STARTTLS to upgrade client-to-server and server-to-server connections to [[tls|TLS]], encrypting all messaging, presence, and roster data.',
		howTheyWork:
			'After opening an XML stream, an [[xmpp|XMPP]] client or server sends a STARTTLS request to upgrade the connection. Once the [[tls|TLS]] handshake completes, a new XML stream is opened over the encrypted channel. Modern [[xmpp|XMPP]] deployments mandate [[tls|TLS]], and XEP-0368 defines direct [[tls|TLS]] connections on port 5223 as an alternative to the STARTTLS upgrade mechanism.',
		leftRole: '[[tls|TLS]] provides confidentiality, integrity, and authentication for all [[xmpp|XMPP]] communication.',
		rightRole: '[[xmpp|XMPP]] provides the messaging, presence, and roster protocol operating over the encrypted channel.'
	},

	// ── HTTP as transport ────────────────────────────────────────

	{
		ids: ['http2', 'grpc'],
		type: 'relationship',
		summary:
			'[[grpc|gRPC]] uses [[http2|HTTP/2]] as its transport layer, leveraging its multiplexed streams and binary framing to deliver high-performance remote procedure calls.',
		howTheyWork:
			'[[grpc|gRPC]] maps each RPC call to an [[http2|HTTP/2]] stream, using [[http2|HTTP/2]] headers for metadata (method, status, content-type) and DATA frames for serialized Protocol Buffer payloads. [[http2|HTTP/2]]\'s multiplexing allows many concurrent RPCs over a single [[tcp|TCP]] connection without head-of-line blocking at the HTTP level.',
		leftRole: '[[http2|HTTP/2]] provides multiplexed binary framing, flow control, and header compression as the transport.',
		rightRole: '[[grpc|gRPC]] provides the RPC semantics, Protobuf serialization, and service definition framework on top.'
	},
	{
		ids: ['dash', 'http1'],
		type: 'relationship',
		summary:
			'[[dash|DASH]] delivers adaptive video by requesting media segments over [[http1|[[http1|HTTP/1]].1]], using standard web infrastructure for scalable streaming delivery.',
		howTheyWork:
			'The [[dash|DASH]] client fetches an MPD manifest over [[http1|[[http1|HTTP/1]].1]], then requests individual media segments as standard HTTP GET requests. Each segment is a separate [[http1|[[http1|HTTP/1]].1]] request-response cycle, which means multiple [[tcp|TCP]] connections are used in parallel to fetch video and audio segments at the appropriate bitrate.',
		leftRole: '[[dash|DASH]] defines the manifest format, segment addressing, and adaptive bitrate switching logic.',
		rightRole: '[[http1|[[http1|HTTP/1]].1]] provides the request-response transport for fetching manifests and media segments.'
	},
	{
		ids: ['dash', 'http2'],
		type: 'relationship',
		summary:
			'[[dash|DASH]] delivers adaptive video over [[http2|HTTP/2]], benefiting from multiplexed streams to fetch manifests and media segments more efficiently on a single connection.',
		howTheyWork:
			'The [[dash|DASH]] client fetches the MPD manifest and subsequent media segments as [[http2|HTTP/2]] requests multiplexed over a single [[tcp|TCP]] connection. [[http2|HTTP/2]]\'s stream multiplexing eliminates the need for multiple parallel connections, and header compression reduces the overhead of repeated segment requests to the same origin.',
		leftRole: '[[dash|DASH]] defines the manifest format, segment addressing, and adaptive bitrate switching logic.',
		rightRole: '[[http2|HTTP/2]] provides multiplexed, header-compressed transport for efficient parallel segment delivery.'
	},
	{
		ids: ['graphql', 'http1'],
		type: 'relationship',
		summary:
			'[[graphql|GraphQL]] sends queries and mutations as [[http1|[[http1|HTTP/1]].1]] POST requests to a single endpoint, using standard HTTP as its most common transport.',
		howTheyWork:
			'The client sends a [[graphql|GraphQL]] query as a JSON payload in an [[http1|[[http1|HTTP/1]].1]] POST request to a single endpoint (typically /graphql). The server parses the query, resolves the requested fields, and returns a JSON response. Each query-response cycle is an independent [[http1|[[http1|HTTP/1]].1]] request, making it compatible with existing HTTP infrastructure.',
		leftRole: '[[graphql|GraphQL]] defines the query language, schema, and resolver execution model.',
		rightRole: '[[http1|[[http1|HTTP/1]].1]] provides the request-response transport for sending queries and receiving results.'
	},
	{
		ids: ['graphql', 'http2'],
		type: 'relationship',
		summary:
			'[[graphql|GraphQL]] queries are sent over [[http2|HTTP/2]], benefiting from multiplexed streams when clients issue multiple queries or when responses are large with compressed headers.',
		howTheyWork:
			'[[graphql|GraphQL]] queries are sent as [[http2|HTTP/2]] POST requests to a single endpoint, just as with [[http1|[[http1|HTTP/1]].1]], but [[http2|HTTP/2]] multiplexes concurrent queries over a single connection. This is especially beneficial when a client fires multiple [[graphql|GraphQL]] queries in parallel, as they share one connection with compressed headers instead of requiring separate [[tcp|TCP]] connections.',
		leftRole: '[[graphql|GraphQL]] defines the query language, schema, and resolver execution model.',
		rightRole: '[[http2|HTTP/2]] provides multiplexed, header-compressed transport for concurrent query delivery.'
	},
	{
		ids: ['graphql', 'websockets'],
		type: 'relationship',
		summary:
			'[[graphql|GraphQL]] subscriptions use [[websockets|WebSocket]] as a persistent transport to push real-time data updates from the server to subscribed clients.',
		howTheyWork:
			'The client establishes a [[websockets|WebSocket]] connection to the [[graphql|GraphQL]] server and sends subscription queries using a sub-protocol like graphql-ws. The server keeps the connection open and pushes data whenever the subscribed fields change. This complements the HTTP-based query/mutation model by adding server-initiated real-time updates.',
		leftRole: '[[graphql|GraphQL]] defines the subscription query syntax and the data pushed when subscribed fields change.',
		rightRole: '[[websockets|WebSocket]] provides the persistent, bidirectional channel needed for real-time subscription delivery.'
	},
	{
		ids: ['hls', 'http1'],
		type: 'relationship',
		summary:
			'[[hls|HLS]] delivers adaptive video by serving M3U8 playlists and media segments as standard [[http1|[[http1|HTTP/1]].1]] file downloads, leveraging existing web infrastructure and CDNs.',
		howTheyWork:
			'The [[hls|HLS]] client fetches an M3U8 playlist over [[http1|[[http1|HTTP/1]].1]] to discover available bitrates and segment URLs. It then requests individual media segments as standard HTTP GET requests. Each segment is a self-contained file served like any static asset, making [[hls|HLS]] fully compatible with HTTP caches, CDNs, and standard web servers.',
		leftRole: '[[hls|HLS]] defines the playlist format, segment structure, and adaptive bitrate selection algorithm.',
		rightRole: '[[http1|[[http1|HTTP/1]].1]] provides the file-serving transport for delivering playlist and segment files.'
	},
	{
		ids: ['hls', 'http2'],
		type: 'relationship',
		summary:
			'[[hls|HLS]] delivers adaptive video over [[http2|HTTP/2]], where multiplexed streams allow playlist refreshes and segment fetches to share a single connection efficiently.',
		howTheyWork:
			'The [[hls|HLS]] client fetches M3U8 playlists and media segments over [[http2|HTTP/2]], multiplexing requests on a single connection instead of opening multiple parallel [[tcp|TCP]] connections. For live streams, this is especially beneficial since frequent playlist refreshes and segment requests can interleave without head-of-line blocking at the HTTP layer.',
		leftRole: '[[hls|HLS]] defines the playlist format, segment structure, and adaptive bitrate selection algorithm.',
		rightRole: '[[http2|HTTP/2]] provides multiplexed transport for efficient parallel delivery of playlists and segments.'
	},
	{
		ids: ['http1', 'rest'],
		type: 'relationship',
		summary:
			'[[rest|REST]] APIs are most commonly served over [[http1|[[http1|HTTP/1]].1]], using its methods (GET, POST, PUT, DELETE), status codes, and headers to implement resource-oriented APIs.',
		howTheyWork:
			'[[rest|REST]] maps CRUD operations to [[http1|[[http1|HTTP/1]].1]] methods: GET for reading, POST for creating, PUT/PATCH for updating, and DELETE for removing resources. [[http1|[[http1|HTTP/1]].1]] status codes communicate outcomes, headers handle content negotiation and caching, and URLs identify resources. [[http1|[[http1|HTTP/1]].1]] provides all the semantics [[rest|REST]] relies on as an architectural style.',
		leftRole: '[[http1|[[http1|HTTP/1]].1]] provides the methods, status codes, headers, and URL structure that [[rest|REST]] builds upon.',
		rightRole: '[[rest|REST]] defines the architectural conventions for mapping resource operations onto HTTP semantics.'
	},
	{
		ids: ['http1', 'websockets'],
		type: 'relationship',
		summary:
			'[[websockets|WebSocket]] connections begin with an [[http1|[[http1|HTTP/1]].1]] Upgrade handshake, then switch to a persistent, bidirectional binary framing protocol.',
		howTheyWork:
			'The client sends an [[http1|[[http1|HTTP/1]].1]] GET request with Upgrade: websocket and Connection: Upgrade headers, plus a Sec-[[websockets|WebSocket]]-Key. If the server accepts, it responds with 101 Switching Protocols and the connection transitions from HTTP to [[websockets|WebSocket]] framing. After the upgrade, the [[tcp|TCP]] connection carries [[websockets|WebSocket]] frames instead of HTTP messages.',
		leftRole: '[[http1|[[http1|HTTP/1]].1]] provides the initial handshake and Upgrade mechanism to establish the connection.',
		rightRole: '[[websockets|WebSocket]] provides the persistent, full-duplex message framing protocol after the upgrade completes.'
	},
	{
		ids: ['http2', 'sse'],
		type: 'relationship',
		summary:
			'[[sse|SSE]] streams server-pushed events over [[http2|HTTP/2]], where multiplexing allows multiple [[sse|SSE]] streams to share a single connection without blocking other requests.',
		howTheyWork:
			'The client opens an [[sse|SSE]] connection by sending a GET request with Accept: text/event-stream. Over [[http2|HTTP/2]], this [[sse|SSE]] stream becomes one of many multiplexed streams on a single connection, so other API requests proceed in parallel without being blocked. This eliminates the browser connection limit problem that restricts [[sse|SSE]] to six concurrent streams per origin on [[http1|[[http1|HTTP/1]].1]].',
		leftRole: '[[http2|HTTP/2]] provides multiplexed streams that let [[sse|SSE]] connections coexist with other requests on one connection.',
		rightRole: '[[sse|SSE]] provides the text/event-stream format and EventSource API for server-to-client push.'
	},
	{
		ids: ['http3', 'rest'],
		type: 'relationship',
		summary:
			'[[rest|REST]] APIs can be served over [[http3|HTTP/3]], gaining faster connection setup, independent stream multiplexing, and built-in encryption from the [[quic|QUIC]] transport.',
		howTheyWork:
			'[[rest|REST]] semantics (methods, status codes, headers, URLs) work identically over [[http3|HTTP/3]] as they do over [[http1|[[http1|HTTP/1]].1]] or [[http2|HTTP/2]] — only the transport changes. [[http3|HTTP/3]] runs over [[quic|QUIC]], providing 0-RTT connection establishment, stream-level independence (no head-of-line blocking), and mandatory [[tls|TLS]] 1.3. [[rest|REST]] APIs benefit automatically without any changes to API design.',
		leftRole: '[[http3|HTTP/3]] provides the [[quic|QUIC]]-based transport with 0-RTT setup and independent stream multiplexing.',
		rightRole: '[[rest|REST]] defines the resource-oriented API architecture that rides on [[http3|HTTP/3]] semantics.'
	},

	// ── WebSocket as transport ───────────────────────────────────

	{
		ids: ['amqp', 'websockets'],
		type: 'relationship',
		summary:
			'[[amqp|AMQP]] can be tunneled over [[websockets|WebSocket]] to allow browser-based clients to connect to message brokers without direct [[tcp|TCP]] access.',
		howTheyWork:
			'The browser establishes a [[websockets|WebSocket]] connection to the message broker (or a gateway), then speaks the [[amqp|AMQP]] protocol over that [[websockets|WebSocket]] channel. The [[websockets|WebSocket]] connection wraps [[amqp|AMQP]] frames so they can traverse HTTP proxies and firewalls that would otherwise block raw [[tcp|TCP]] [[amqp|AMQP]] connections on port 5672.',
		leftRole: '[[amqp|AMQP]] provides the messaging semantics — exchanges, queues, bindings, and delivery guarantees.',
		rightRole: '[[websockets|WebSocket]] provides the browser-compatible transport tunnel that carries [[amqp|AMQP]] frames over HTTP.'
	},
	{
		ids: ['mqtt', 'websockets'],
		type: 'relationship',
		summary:
			'[[mqtt|MQTT]] over [[websockets|WebSocket]] enables browser-based IoT dashboards and web apps to subscribe to [[mqtt|MQTT]] topics directly from the browser.',
		howTheyWork:
			'The browser opens a [[websockets|WebSocket]] connection to the [[mqtt|MQTT]] broker (typically on port 8083/8084). [[mqtt|MQTT]] packets are sent as [[websockets|WebSocket]] binary frames, allowing the browser to publish, subscribe, and receive messages using standard [[mqtt|MQTT]] semantics. This avoids the need for a custom [[rest|REST]] bridge between the browser and the [[mqtt|MQTT]] broker.',
		leftRole: '[[mqtt|MQTT]] provides the lightweight pub/sub messaging protocol with topic hierarchy and QoS levels.',
		rightRole: '[[websockets|WebSocket]] provides the browser-accessible transport that carries [[mqtt|MQTT]] packets over HTTP.'
	},
	{
		ids: ['stomp', 'websockets'],
		type: 'relationship',
		summary:
			'[[stomp|STOMP]] over [[websockets|WebSocket]] allows browser clients to connect to message brokers using [[stomp|STOMP]]\'s simple text-based messaging commands.',
		howTheyWork:
			'The browser establishes a [[websockets|WebSocket]] connection to the message broker (e.g., RabbitMQ with [[stomp|STOMP]] plugin, or Spring\'s [[stomp|STOMP]] broker). [[stomp|STOMP]] text frames (CONNECT, SEND, SUBSCRIBE, MESSAGE) are sent as [[websockets|WebSocket]] text messages. [[stomp|STOMP]]\'s HTTP-like text format makes it especially natural to carry over [[websockets|WebSocket]], requiring minimal client-side code.',
		leftRole: '[[stomp|STOMP]] provides the text-based messaging commands for sending, subscribing, and acknowledging messages.',
		rightRole: '[[websockets|WebSocket]] provides the browser-compatible bidirectional channel that carries [[stomp|STOMP]] frames.'
	},
	{
		ids: ['websockets', 'xmpp'],
		type: 'relationship',
		summary:
			'[[xmpp|XMPP]] over [[websockets|WebSocket]] enables browser-based chat clients to participate in the [[xmpp|XMPP]] network without long-polling hacks like BOSH.',
		howTheyWork:
			'The browser opens a [[websockets|WebSocket]] connection to the [[xmpp|XMPP]] server using the [[xmpp|XMPP]] sub-protocol (RFC 7395). [[xmpp|XMPP]] stanzas (message, presence, iq) are sent as [[websockets|WebSocket]] text frames, providing the same real-time XML stream as a native [[tcp|TCP]] [[xmpp|XMPP]] connection. This replaces the older BOSH (Bidirectional-streams Over Synchronous HTTP) approach with a cleaner, lower-latency transport.',
		leftRole: '[[websockets|WebSocket]] provides the persistent, low-latency bidirectional transport between browser and [[xmpp|XMPP]] server.',
		rightRole: '[[xmpp|XMPP]] provides the messaging semantics — presence, roster, stanzas, and federation.'
	},

	// ── Real-time A/V ────────────────────────────────────────────

	{
		ids: ['rtp', 'sdp'],
		type: 'relationship',
		summary:
			'[[sdp|SDP]] describes the parameters of an [[rtp|RTP]] session — codecs, payload types, ports, and addresses — so both endpoints agree on how to send and receive media.',
		howTheyWork:
			'Before [[rtp|RTP]] media can flow, endpoints exchange [[sdp|SDP]] descriptions (via [[sip|SIP]], [[webrtc|WebRTC]] signaling, or other means) that specify the IP addresses, port numbers, codecs, and payload type mappings for each media stream. [[rtp|RTP]] then uses these negotiated parameters to deliver audio and video packets between the endpoints.',
		leftRole: '[[rtp|RTP]] carries the actual audio and video media packets using parameters negotiated by [[sdp|SDP]].',
		rightRole: '[[sdp|SDP]] describes the session parameters (codecs, ports, addresses) that configure the [[rtp|RTP]] streams.'
	},
	{
		ids: ['rtp', 'sip'],
		type: 'relationship',
		summary:
			'[[sip|SIP]] establishes and manages call sessions (ringing, answering, hanging up), while [[rtp|RTP]] carries the actual audio and video media during the call.',
		howTheyWork:
			'[[sip|SIP]] handles call signaling — INVITE to initiate, 200 OK to accept, BYE to terminate — and carries [[sdp|SDP]] in its message bodies to negotiate media parameters. Once the [[sip|SIP]] signaling establishes a session, [[rtp|RTP]] streams flow directly between the media endpoints on the ports and codecs specified by [[sdp|SDP]]. [[sip|SIP]] manages the call lifecycle; [[rtp|RTP]] handles the media.',
		leftRole: '[[rtp|RTP]] carries the real-time audio and video streams between endpoints during the call.',
		rightRole: '[[sip|SIP]] provides the signaling to establish, modify, and tear down the call session.'
	},
	{
		ids: ['rtp', 'webrtc'],
		type: 'relationship',
		summary:
			'[[webrtc|WebRTC]] uses SRTP (Secure [[rtp|RTP]]) as its media transport, encrypting all audio and video packets with DTLS-derived keys for secure peer-to-peer communication.',
		howTheyWork:
			'[[webrtc|WebRTC]] establishes a peer connection using ICE for NAT traversal and DTLS for key exchange. Once the secure channel is established, audio and video are transmitted as SRTP packets — [[rtp|RTP]] with AES encryption. [[webrtc|WebRTC]] mandates SRTP (not plain [[rtp|RTP]]) to ensure all media is encrypted end-to-end by default.',
		leftRole: '[[rtp|RTP]] (as SRTP) carries the encrypted audio and video packets between [[webrtc|WebRTC]] peers.',
		rightRole: '[[webrtc|WebRTC]] provides the peer connection framework, ICE negotiation, and DTLS key exchange around SRTP.'
	},
	{
		ids: ['sctp', 'webrtc'],
		type: 'relationship',
		summary:
			'[[webrtc|WebRTC]] data channels use [[sctp|SCTP]] tunneled over DTLS to provide reliable, ordered, and configurable message delivery between peers.',
		howTheyWork:
			'[[webrtc|WebRTC]] establishes a DTLS connection over the ICE-negotiated path, then runs [[sctp|SCTP]] on top of that DTLS tunnel. Each data channel maps to an [[sctp|SCTP]] stream, and [[sctp|SCTP]]\'s multi-stream support allows independent channels without head-of-line blocking. Channels can be configured as reliable/ordered or unreliable/unordered per-channel.',
		leftRole: '[[sctp|SCTP]] provides the multi-stream, message-oriented transport with configurable reliability for each data channel.',
		rightRole: '[[webrtc|WebRTC]] provides the peer connection, DTLS encryption, and ICE traversal that [[sctp|SCTP]] runs over.'
	},
	{
		ids: ['sdp', 'sip'],
		type: 'relationship',
		summary:
			'[[sip|SIP]] carries [[sdp|SDP]] payloads in its INVITE and response messages to negotiate the media parameters (codecs, ports, addresses) for a call session.',
		howTheyWork:
			'When a [[sip|SIP]] client sends an INVITE, it includes an [[sdp|SDP]] offer in the message body describing its supported codecs, IP address, and port. The callee responds with a [[sip|SIP]] 200 OK containing an [[sdp|SDP]] answer with its own media capabilities. This offer/answer exchange within [[sip|SIP]] messages establishes the agreed-upon parameters for the subsequent [[rtp|RTP]] media streams.',
		leftRole: '[[sdp|SDP]] provides the session description format that specifies codecs, ports, and media parameters.',
		rightRole: '[[sip|SIP]] provides the signaling protocol that carries [[sdp|SDP]] offers and answers in its messages.'
	},
	{
		ids: ['sdp', 'webrtc'],
		type: 'relationship',
		summary:
			'[[webrtc|WebRTC]] uses [[sdp|SDP]] in its offer/answer model to negotiate media capabilities, ICE candidates, and DTLS fingerprints between peers.',
		howTheyWork:
			'When a [[webrtc|WebRTC]] peer connection is created, the browser generates an [[sdp|SDP]] offer describing supported codecs, ICE candidates, DTLS fingerprints, and media directions. This [[sdp|SDP]] is sent to the remote peer via an application-defined signaling channel. The remote peer generates an [[sdp|SDP]] answer, and both sides apply the negotiated parameters to configure their media and data channels.',
		leftRole: '[[sdp|SDP]] describes the session parameters — codecs, ICE candidates, and DTLS fingerprints — for [[webrtc|WebRTC]] negotiation.',
		rightRole: '[[webrtc|WebRTC]] provides the peer connection API that generates, exchanges, and applies [[sdp|SDP]] descriptions.'
	},

	// ── Utility / Other ──────────────────────────────────────────

	{
		ids: ['dhcp', 'dns'],
		type: 'relationship',
		summary:
			'[[dhcp|DHCP]] provides [[dns|DNS]] server addresses to clients as part of network configuration, telling devices where to send their [[dns|DNS]] queries.',
		howTheyWork:
			'When a device joins a network, [[dhcp|DHCP]] assigns it an IP address along with other configuration including the [[dns|DNS]] server addresses (option 6 in DHCPv4). The client then uses these [[dns|DNS]] server addresses for all subsequent name resolution. Without [[dhcp|DHCP]] providing this information, clients would need manually configured [[dns|DNS]] servers.',
		leftRole: '[[dhcp|DHCP]] provides network configuration including the [[dns|DNS]] server addresses clients should use.',
		rightRole: '[[dns|DNS]] provides name resolution services at the server addresses distributed by [[dhcp|DHCP]].'
	},
	{
		ids: ['dns', 'smtp'],
		type: 'relationship',
		summary:
			'[[smtp|SMTP]] relies on [[dns|DNS]] MX (Mail Exchanger) records to determine which mail server should receive email for a given domain.',
		howTheyWork:
			'When an [[smtp|SMTP]] server needs to deliver mail to user@example.com, it queries [[dns|DNS]] for the MX records of example.com. [[dns|DNS]] returns one or more mail server hostnames with priority values. The [[smtp|SMTP]] server then resolves those hostnames to IP addresses (A/AAAA records) and connects to the highest-priority server to deliver the message.',
		leftRole: '[[dns|DNS]] provides the MX record lookups that map email domains to their mail server hostnames.',
		rightRole: '[[smtp|SMTP]] uses MX records from [[dns|DNS]] to route and deliver email to the correct destination mail server.'
	},
	{
		ids: ['ftp', 'ssh'],
		type: 'relationship',
		summary:
			'SFTP ([[ssh|SSH]] File Transfer Protocol) runs entirely within an [[ssh|SSH]] channel, providing encrypted file transfer with strong authentication as a secure replacement for [[ftp|FTP]].',
		howTheyWork:
			'SFTP is a subsystem of [[ssh|SSH]], not a variant of [[ftp|FTP]] — it uses a completely different binary protocol. The client establishes an [[ssh|SSH]] connection with key-based or password authentication, then opens an SFTP subsystem channel. All file operations (list, upload, download, rename, delete) are sent as binary SFTP packets within the encrypted [[ssh|SSH]] tunnel on a single port (22).',
		leftRole: '[[ftp|FTP]]-style file operations (list, get, put, delete) are provided by the SFTP subsystem within [[ssh|SSH]].',
		rightRole: '[[ssh|SSH]] provides the encrypted tunnel, authentication, and channel multiplexing that SFTP runs inside.'
	},
	{
		ids: ['http3', 'quic'],
		type: 'relationship',
		summary:
			'[[http3|HTTP/3]] is the first major protocol built specifically for [[quic|QUIC]], mapping HTTP semantics onto [[quic|QUIC]]\'s multiplexed, encrypted streams for head-of-line-blocking-free web delivery.',
		howTheyWork:
			'[[http3|HTTP/3]] maps each request-response exchange to an independent [[quic|QUIC]] stream. [[quic|QUIC]] provides reliable, ordered delivery per-stream with [[tls|TLS]] 1.3 encryption, connection migration, and 0-RTT resumption. Unlike [[http2|HTTP/2]] over [[tcp|TCP]], losing a packet on one stream does not block others — each [[quic|QUIC]] stream is independently reliable.',
		leftRole: '[[http3|HTTP/3]] provides the HTTP semantics (methods, headers, status codes) and QPACK header compression.',
		rightRole: '[[quic|QUIC]] provides the multiplexed, encrypted transport with per-stream reliability and fast connection setup.'
	},
	{
		ids: ['quic', 'tcp'],
		type: 'relationship',
		summary:
			'[[quic|QUIC]] is designed as a modern replacement for the [[tcp|TCP]]+[[tls|TLS]] stack, providing reliable, multiplexed, encrypted transport over [[udp|UDP]] with faster connection setup.',
		howTheyWork:
			'[[quic|QUIC]] implements the reliability, ordering, and congestion control features of [[tcp|TCP]] but runs over [[udp|UDP]] datagrams to avoid kernel-level [[tcp|TCP]] limitations and middlebox interference. It integrates [[tls|TLS]] 1.3 directly into its handshake (achieving 1-RTT or 0-RTT setup) and provides independent stream multiplexing that eliminates [[tcp|TCP]]\'s head-of-line blocking problem.',
		leftRole: '[[quic|QUIC]] provides the modern multiplexed, encrypted transport that aims to supersede [[tcp|TCP]]+[[tls|TLS]].',
		rightRole: '[[tcp|TCP]] provides the traditional reliable transport that [[quic|QUIC]] was designed to replace and improve upon.'
	},
	{
		ids: ['rest', 'sse'],
		type: 'relationship',
		summary:
			'[[sse|SSE]] is commonly used within [[rest|REST]] APIs to add a server-push capability, streaming real-time updates to clients over a standard HTTP connection.',
		howTheyWork:
			'A [[rest|REST]] API exposes an [[sse|SSE]] endpoint (e.g., GET /events) that returns a text/event-stream response. The client connects using the EventSource API and receives server-pushed events as they occur, while continuing to use regular [[rest|REST]] endpoints for queries and mutations. [[sse|SSE]] complements [[rest|REST]]\'s request-response model by adding unidirectional real-time updates.',
		leftRole: '[[rest|REST]] provides the request-response API structure that [[sse|SSE]] endpoints are integrated into.',
		rightRole: '[[sse|SSE]] provides the server-push streaming mechanism that extends [[rest|REST]] with real-time event delivery.'
	},

	// ── BGP relationships ───────────────────────────────────────

	{
		ids: ['bgp', 'tcp'],
		type: 'relationship',
		summary:
			'[[bgp|BGP]] runs over [[tcp|TCP]] port 179, relying on [[tcp|TCP]]\'s reliable delivery to guarantee that routing updates are never lost, duplicated, or reordered between autonomous systems.',
		howTheyWork:
			'[[bgp|BGP]] peers establish a [[tcp|TCP]] connection on port 179 before exchanging OPEN messages. All subsequent UPDATE, KEEPALIVE, and NOTIFICATION messages flow over this persistent [[tcp|TCP]] connection. [[tcp|TCP]]\'s reliability is critical because a lost route announcement could create routing loops or black holes in the internet.',
		leftRole:
			'[[bgp|BGP]] provides the routing logic — path selection, AS path attributes, and network reachability advertisements between autonomous systems.',
		rightRole:
			'[[tcp|TCP]] provides the reliable, ordered transport that ensures routing information is delivered without loss or corruption.'
	},
	{
		ids: ['bgp', 'dns'],
		type: 'relationship',
		summary:
			'[[bgp|BGP]] determines how IP packets are routed between networks, while [[dns|DNS]] translates domain names to the IP addresses that [[bgp|BGP]] routes. Together they form the internet\'s addressing and reachability system.',
		howTheyWork:
			'[[dns|DNS]] resolves domain names to IP addresses, and [[bgp|BGP]] determines how to reach those IP addresses across autonomous system boundaries. When a DNS query returns an IP, the packets follow BGP-established routes to reach it. DNS anycast relies on [[bgp|BGP]] to advertise the same IP prefix from multiple geographic locations.',
		leftRole:
			'[[bgp|BGP]] provides the routing fabric that determines how packets reach their destination IP addresses across autonomous systems.',
		rightRole:
			'[[dns|DNS]] provides the name-to-IP translation that gives human-readable meaning to the addresses [[bgp|BGP]] routes.'
	},

	// ── ICMP relationships ──────────────────────────────────────

	{
		ids: ['dns', 'icmp'],
		type: 'relationship',
		summary:
			'[[icmp|ICMP]] and [[dns|DNS]] are both fundamental diagnostic tools: [[dns|DNS]] answers "what is this name?" while [[icmp|ICMP]] answers "can I reach it?" Network troubleshooting typically starts with DNS then verifies with ping.',
		howTheyWork:
			'When diagnosing connectivity, administrators first use [[dns|DNS]] to resolve a hostname to an IP address, then [[icmp|ICMP]] ping to test reachability. If [[dns|DNS]] succeeds but [[icmp|ICMP]] fails, the problem is routing or firewall-related. If [[dns|DNS]] fails, the issue is name resolution. [[icmp|ICMP]] Destination Unreachable messages can also indicate a [[dns|DNS]] server is unreachable.',
		leftRole:
			'[[dns|DNS]] provides name-to-address resolution — the first step in any network diagnostic workflow.',
		rightRole:
			'[[icmp|ICMP]] provides reachability testing and error reporting — verifying that resolved addresses are actually reachable.'
	},
	{
		ids: ['icmp', 'tcp'],
		type: 'relationship',
		summary:
			'[[icmp|ICMP]] reports network-level errors for [[tcp|TCP]] connections — when a [[tcp|TCP]] segment cannot be delivered, an [[icmp|ICMP]] Destination Unreachable message tells the sender why.',
		howTheyWork:
			'When a [[tcp|TCP]] SYN reaches a host with no listening service, the host sends back [[icmp|ICMP]] Port Unreachable (Type 3, Code 3). When a router can\'t forward a [[tcp|TCP]] packet, it sends [[icmp|ICMP]] Network Unreachable. [[tcp|TCP]] Path MTU Discovery relies on [[icmp|ICMP]] Packet Too Big messages to determine the maximum segment size without fragmentation.',
		leftRole:
			'[[icmp|ICMP]] provides error reporting and diagnostics — notifying [[tcp|TCP]] of unreachable destinations, TTL expiry, and MTU constraints.',
		rightRole:
			'[[tcp|TCP]] provides the reliable transport connections whose delivery failures [[icmp|ICMP]] reports back to senders.'
	},

	// ── IMAP relationships ──────────────────────────────────────

	{
		ids: ['imap', 'tcp'],
		type: 'relationship',
		summary:
			'[[imap|IMAP]] uses [[tcp|TCP]] for reliable delivery of email commands, message data, and mailbox state synchronization between clients and servers.',
		howTheyWork:
			'An [[imap|IMAP]] client opens a [[tcp|TCP]] connection to the mail server on port 993 (with [[tls|TLS]]) or 143 (plaintext). The tagged command-response protocol requires [[tcp|TCP]]\'s reliable, ordered delivery to ensure command tags match responses correctly. IMAP\'s IDLE mode keeps the [[tcp|TCP]] connection open for real-time server-push notifications.',
		leftRole:
			'[[imap|IMAP]] provides the email retrieval protocol — mailbox selection, message fetching, searching, and flag management.',
		rightRole:
			'[[tcp|TCP]] provides the reliable, persistent connection that [[imap|IMAP]]\'s stateful, tagged command-response dialogue requires.'
	},
	{
		ids: ['imap', 'tls'],
		type: 'relationship',
		summary:
			'[[tls|TLS]] encrypts [[imap|IMAP]] connections (IMAPS on port 993), protecting email credentials and message content from eavesdropping.',
		howTheyWork:
			'[[imap|IMAP]] connects to port 993 where [[tls|TLS]] is required from the start (implicit TLS), or connects to port 143 and upgrades via STARTTLS. Once [[tls|TLS]] is established, all [[imap|IMAP]] commands — including LOGIN credentials, FETCH message bodies, and SEARCH queries — flow through the encrypted channel.',
		leftRole:
			'[[imap|IMAP]] provides the email retrieval and management protocol that carries sensitive credentials and message content.',
		rightRole:
			'[[tls|TLS]] provides confidentiality, integrity, and authentication for all [[imap|IMAP]] traffic, protecting credentials and email content in transit.'
	},

	// ── Network Foundations relationships ────────────────────────

	{
		ids: ['arp', 'ethernet'],
		type: 'relationship',
		summary:
			'[[arp|ARP]] resolves [[ip|IP]] addresses to MAC addresses so that [[ethernet|Ethernet]] frames can be addressed correctly on the local network.',
		howTheyWork:
			'When a host needs to send an IP packet to a local destination, it first checks its [[arp|ARP]] cache for the destination\'s MAC address. On a cache miss, it broadcasts an [[arp|ARP]] Request (EtherType 0x0806) to all devices on the [[ethernet|Ethernet]] segment. The target host replies with its MAC address, which is cached for future [[ethernet|Ethernet]] frame construction.',
		leftRole:
			'[[arp|ARP]] provides the IP-to-MAC resolution mechanism that makes [[ethernet|Ethernet]] delivery possible for IP traffic.',
		rightRole:
			'[[ethernet|Ethernet]] provides the Layer 2 framing and MAC-based delivery that [[arp|ARP]] messages themselves travel over.'
	},
	{
		ids: ['arp', 'ip'],
		type: 'relationship',
		summary:
			'[[arp|ARP]] bridges the gap between [[ip|IP]] addresses (Layer 3) and MAC addresses (Layer 2), enabling IP packets to be delivered on local networks.',
		howTheyWork:
			'[[ip|IP]] provides logical addressing for routing packets across networks, but the last hop to the destination requires a physical MAC address. [[arp|ARP]] translates the destination [[ip|IP]] address to the corresponding MAC address on the local segment. Without [[arp|ARP]], [[ip|IP]] packets could be routed to the correct network but never delivered to the correct host.',
		leftRole:
			'[[arp|ARP]] resolves [[ip|IP]]\'s logical addresses to the hardware addresses needed for local delivery.',
		rightRole:
			'[[ip|IP]] provides the logical addressing that [[arp|ARP]] resolves — every [[arp|ARP]] request asks "who has this IP address?"'
	},
	{
		ids: ['ip', 'ethernet'],
		type: 'relationship',
		summary:
			'[[ip|IP]] packets are encapsulated inside [[ethernet|Ethernet]] frames for delivery on local networks — Ethernet is IP\'s Layer 2 carrier on wired LANs.',
		howTheyWork:
			'When an [[ip|IP]] packet needs to traverse a local [[ethernet|Ethernet]] segment, it is placed inside an [[ethernet|Ethernet]] frame (EtherType 0x0800 for IPv4). The [[ethernet|Ethernet]] frame\'s destination MAC is either the final host (if local) or the default gateway router. At each router hop, the [[ip|IP]] header stays the same but the [[ethernet|Ethernet]] frame is stripped and rebuilt with new MAC addresses.',
		leftRole:
			'[[ip|IP]] provides logical addressing, routing decisions, and TTL management for end-to-end packet delivery.',
		rightRole:
			'[[ethernet|Ethernet]] provides the physical framing and MAC-based delivery for each hop of the [[ip|IP]] packet\'s journey.'
	},
	{
		ids: ['ip', 'wifi'],
		type: 'relationship',
		summary:
			'[[ip|IP]] packets are carried over [[wifi|Wi-Fi]] 802.11 frames for wireless delivery, just as they are carried over [[ethernet|Ethernet]] on wired networks.',
		howTheyWork:
			'On wireless networks, [[ip|IP]] packets are encapsulated in 802.11 frames instead of [[ethernet|Ethernet]] frames. The [[wifi|Wi-Fi]] access point bridges between the two: it receives 802.11 frames from wireless clients, extracts the [[ip|IP]] packet, and re-encapsulates it in an [[ethernet|Ethernet]] frame for the wired network (and vice versa).',
		leftRole:
			'[[ip|IP]] provides the network-layer addressing that stays constant whether the packet travels over wired or wireless links.',
		rightRole:
			'[[wifi|Wi-Fi]] provides the wireless Layer 2 transport for [[ip|IP]] packets, with encryption and airtime management.'
	},
	{
		ids: ['ip', 'tcp'],
		type: 'relationship',
		summary:
			'[[tcp|TCP]] provides reliable, ordered streams on top of [[ip|IP]]\'s best-effort packet delivery — together they form TCP/IP, the foundation of the internet.',
		howTheyWork:
			'[[ip|IP]] handles addressing and routing packets between hosts, but provides no guarantees about delivery, ordering, or duplication. [[tcp|TCP]] adds reliability on top: sequence numbers track byte order, acknowledgments confirm delivery, and retransmission recovers lost packets. Every [[tcp|TCP]] segment is encapsulated in an [[ip|IP]] packet (protocol number 6).',
		leftRole:
			'[[ip|IP]] provides the addressing and hop-by-hop routing that delivers packets across networks.',
		rightRole:
			'[[tcp|TCP]] provides reliable, ordered, connection-oriented byte streams over [[ip|IP]]\'s unreliable datagram service.'
	},
	{
		ids: ['ip', 'udp'],
		type: 'relationship',
		summary:
			'[[udp|UDP]] adds port-based multiplexing to [[ip|IP]] with minimal overhead — the simplest way to send datagrams between applications.',
		howTheyWork:
			'[[ip|IP]] delivers packets between hosts but has no concept of applications or ports. [[udp|UDP]] adds source and destination port numbers (plus a checksum) in just 8 bytes of header, allowing multiple applications to share a single [[ip|IP]] address. Every [[udp|UDP]] datagram is encapsulated in an [[ip|IP]] packet (protocol number 17).',
		leftRole:
			'[[ip|IP]] provides the addressing and routing that delivers packets to the correct host.',
		rightRole:
			'[[udp|UDP]] provides port-based demultiplexing so multiple applications can use [[ip|IP]] simultaneously.'
	},
	{
		ids: ['ip', 'icmp'],
		type: 'relationship',
		summary:
			'[[icmp|ICMP]] is [[ip|IP]]\'s diagnostic companion — it reports routing errors, measures reachability, and discovers path MTU, all encapsulated directly in [[ip|IP]] packets.',
		howTheyWork:
			'[[icmp|ICMP]] messages are encapsulated in [[ip|IP]] packets with protocol number 1 (not TCP or UDP). When a router can\'t deliver an [[ip|IP]] packet (TTL expired, destination unreachable, fragmentation needed), it sends an [[icmp|ICMP]] message back to the sender. Ping (Echo Request/Reply) and traceroute (TTL-based hop discovery) are the most common [[icmp|ICMP]] operations.',
		leftRole:
			'[[ip|IP]] provides the packet delivery that [[icmp|ICMP]] both rides on and diagnoses problems within.',
		rightRole:
			'[[icmp|ICMP]] provides error reporting and diagnostics for [[ip|IP]]\'s routing infrastructure.'
	},

	// ── JSON-RPC relationships ──────────────────────────────────

	{
		ids: ['http1', 'json-rpc'],
		type: 'relationship',
		summary:
			'[[json-rpc|JSON-RPC]] commonly rides over [[http1|HTTP]] POST — the HTTP layer handles transport while JSON-RPC defines the structured method-call semantics inside the body.',
		howTheyWork:
			'The client sends a JSON-RPC request as the body of an [[http1|HTTP]] POST to a single endpoint (e.g., /rpc). The Content-Type is application/json. The server processes the JSON-RPC call and returns the result in the HTTP response body. Unlike [[rest|REST]], the HTTP method is always POST and the URL is always the same — all routing happens via the method field inside the JSON.',
		leftRole: '[[http1|HTTP]] provides the request-response transport, connection management, and TLS encryption for JSON-RPC calls.',
		rightRole: '[[json-rpc|JSON-RPC]] provides the method dispatch, parameter passing, error handling, and batch semantics inside the HTTP body.'
	},
	{
		ids: ['json-rpc', 'websockets'],
		type: 'relationship',
		summary:
			'[[json-rpc|JSON-RPC]] over [[websockets|WebSockets]] enables bidirectional RPC — both client and server can initiate method calls and send notifications over the persistent connection.',
		howTheyWork:
			'After the [[websockets|WebSocket]] handshake upgrades the HTTP connection, both sides can send JSON-RPC messages at any time. The client sends requests; the server responds. But the server can also send notifications (no id) or even its own requests to the client — something impossible over plain HTTP. This is how Language Server Protocol (LSP) sends diagnostics and how MCP servers push progress updates.',
		leftRole: '[[json-rpc|JSON-RPC]] provides the structured call semantics — method names, parameters, results, errors, and notifications.',
		rightRole: '[[websockets|WebSockets]] provides the persistent, full-duplex transport that enables server-initiated JSON-RPC messages.'
	},
	{
		ids: ['json-rpc', 'sse'],
		type: 'relationship',
		summary:
			'[[json-rpc|JSON-RPC]] can use [[sse|SSE]] for streaming server responses — the client sends requests via HTTP POST and receives streamed results as server-sent events, as used by MCP\'s Streamable HTTP transport.',
		howTheyWork:
			'In MCP\'s Streamable HTTP transport, a client sends a JSON-RPC request as an HTTP POST. The server can respond with a normal JSON response or upgrade to an SSE stream (Content-Type: text/event-stream), sending incremental results and notifications as events. This gives JSON-RPC streaming capabilities without requiring a full WebSocket connection.',
		leftRole: '[[json-rpc|JSON-RPC]] provides the method-call structure and request/response correlation via the id field.',
		rightRole: '[[sse|SSE]] provides the server-push streaming mechanism for delivering incremental JSON-RPC results and notifications.'
	},

	// ── MCP relationships ──────────────────────────────────────

	{
		ids: ['json-rpc', 'mcp'],
		type: 'relationship',
		summary:
			'[[mcp|MCP]] uses [[json-rpc|JSON-RPC]] 2.0 as its wire format — every MCP message (initialize, tools/call, notifications) is a JSON-RPC request, response, or notification.',
		howTheyWork:
			'[[mcp|MCP]] defines the method names (initialize, tools/list, tools/call, resources/read) and their parameter schemas, while [[json-rpc|JSON-RPC]] provides the framing — the id field for request-response correlation, the error object format, and the notification pattern (no id = no response). MCP\'s three-step handshake is three JSON-RPC messages: a request, a response, and a notification.',
		leftRole: '[[json-rpc|JSON-RPC]] provides the wire format — request/response correlation, error codes, notifications, and transport-agnostic framing.',
		rightRole: '[[mcp|MCP]] defines the semantic methods (tools, resources, prompts, sampling) and their parameter schemas on top of JSON-RPC.'
	},
	{
		ids: ['http1', 'mcp'],
		type: 'relationship',
		summary:
			'[[mcp|MCP]]\'s Streamable HTTP transport uses [[http1|HTTP]] POST for sending JSON-RPC messages, with optional SSE upgrade for streaming responses.',
		howTheyWork:
			'In Streamable HTTP mode, the MCP client sends JSON-RPC requests as [[http1|HTTP]] POST bodies to a single endpoint (e.g., /mcp). The server can respond with a plain JSON response or upgrade to an SSE stream for incremental results. The server assigns a session ID via the Mcp-Session-Id header for stateful session management.',
		leftRole: '[[http1|HTTP]] provides the request-response transport and connection management for remote MCP servers.',
		rightRole: '[[mcp|MCP]] defines the JSON-RPC methods and session semantics carried inside HTTP requests.'
	},
	{
		ids: ['mcp', 'sse'],
		type: 'relationship',
		summary:
			'[[mcp|MCP]]\'s Streamable HTTP transport uses [[sse|SSE]] to stream incremental tool results and server notifications back to the client.',
		howTheyWork:
			'When an MCP server needs to stream results (e.g., a long-running tool or progress updates), it responds to the client\'s HTTP POST with Content-Type: text/event-stream instead of application/json. The server then sends JSON-RPC responses and notifications as SSE events. This gives MCP streaming capabilities without requiring a persistent WebSocket connection.',
		leftRole: '[[mcp|MCP]] defines the JSON-RPC messages (progress notifications, partial results) that are streamed as events.',
		rightRole: '[[sse|SSE]] provides the HTTP-based streaming mechanism that delivers incremental MCP results to the client.'
	},

	// ── A2A relationships ──────────────────────────────────────

	{
		ids: ['a2a', 'json-rpc'],
		type: 'relationship',
		summary:
			'[[a2a|A2A]] uses [[json-rpc|JSON-RPC]] 2.0 as its wire format — agent messages (message/send, message/stream) are JSON-RPC requests, and task results are JSON-RPC responses.',
		howTheyWork:
			'[[a2a|A2A]] defines the method names (message/send, message/stream) and their parameter schemas, while [[json-rpc|JSON-RPC]] provides the wire framing. The A2A client sends a JSON-RPC request with a user message, and the server responds with a Task object containing status and artifacts. JSON-RPC\'s id field correlates multi-turn conversations.',
		leftRole: '[[a2a|A2A]] defines the agent communication semantics — messages, tasks, parts, artifacts, and the task lifecycle state machine.',
		rightRole: '[[json-rpc|JSON-RPC]] provides the request/response framing, error handling, and notification support for A2A messages.'
	},
	{
		ids: ['a2a', 'http1'],
		type: 'relationship',
		summary:
			'[[a2a|A2A]] runs entirely over [[http1|HTTP]] — agent discovery (GET /.well-known/agent.json), task communication (POST), and push notifications (webhooks) all use standard HTTP.',
		howTheyWork:
			'Agent Cards are served as static JSON at the well-known HTTP URL. Task messages are sent as JSON-RPC payloads in HTTP POST requests. For streaming, the server responds with Content-Type: text/event-stream (SSE). Push notifications use HTTP POST to a client-provided webhook URL. All communication is standard HTTP that works through proxies, load balancers, and CDNs.',
		leftRole: '[[a2a|A2A]] defines the agent discovery, task management, and collaboration semantics layered on HTTP.',
		rightRole: '[[http1|HTTP]] provides the universal transport — GET for discovery, POST for messages, SSE for streaming, webhooks for push.'
	},
	{
		ids: ['a2a', 'sse'],
		type: 'relationship',
		summary:
			'[[a2a|A2A]] uses [[sse|SSE]] to stream task status updates and artifact delivery in real-time via the message/stream method.',
		howTheyWork:
			'When a client calls message/stream instead of message/send, the A2A server responds with a text/event-stream. As the agent works, it pushes TaskStatusUpdateEvent (state changes like "working" → "completed") and TaskArtifactUpdateEvent (incremental results) as SSE events. This allows clients to show real-time progress without polling.',
		leftRole: '[[a2a|A2A]] defines the event types (TaskStatusUpdate, TaskArtifactUpdate) that are streamed to the client.',
		rightRole: '[[sse|SSE]] provides the HTTP-based streaming transport for delivering real-time A2A task updates.'
	},
	{
		ids: ['a2a', 'mcp'],
		type: 'relationship',
		summary:
			'[[mcp|MCP]] equips individual agents with tool access; [[a2a|A2A]] enables those equipped agents to collaborate. Together they form the two-protocol foundation of agentic AI.',
		howTheyWork:
			'In a multi-agent system, [[a2a|A2A]] handles high-level coordination — Agent A uses message/send to delegate a sub-task to Agent B. Agent B then uses [[mcp|MCP]] internally to call database tools, read file resources, or invoke APIs to fulfill the task. Agent B returns results to Agent A via A2A artifacts. MCP is vertical (agent-to-tools), A2A is horizontal (agent-to-agent).',
		leftRole: '[[a2a|A2A]] provides the inter-agent communication layer — discovery, delegation, task lifecycle, and result delivery.',
		rightRole: '[[mcp|MCP]] provides the tool integration layer — each agent uses MCP to access the tools and data it needs to fulfill tasks.'
	},

	// ── SOAP relationships ──────────────────────────────────────

	{
		ids: ['soap', 'http1'],
		type: 'relationship',
		summary:
			'[[soap|SOAP]] uses [[http1|HTTP]] POST as its transport, wrapping XML envelopes inside HTTP request/response pairs with the SOAPAction header identifying the operation.',
		howTheyWork:
			'A [[soap|SOAP]] client sends an XML envelope via [[http1|HTTP]] POST to the service endpoint. The Content-Type header is text/xml (SOAP 1.1) or application/soap+xml (SOAP 1.2), and the SOAPAction header names the operation. The server processes the envelope and returns a SOAP response (200 OK) or fault (500) in another [[http1|HTTP]] response.',
		leftRole:
			'[[soap|SOAP]] provides the XML envelope structure, operation definitions (via WSDL), and fault handling for web service calls.',
		rightRole:
			'[[http1|HTTP]] provides the request-response transport that carries [[soap|SOAP]] envelopes between client and service.'
	},

	// ── OAuth relationships ─────────────────────────────────────

	{
		ids: ['oauth2', 'rest'],
		type: 'relationship',
		summary:
			'[[oauth2|OAuth 2.0]] is the standard way to protect [[rest|REST]] APIs — clients present Bearer tokens in the Authorization header, and the API validates scopes before returning resources.',
		howTheyWork:
			'After completing the OAuth flow, the client includes the access token in every [[rest|REST]] API request: `Authorization: Bearer eyJhbG...`. The [[rest|REST]] API validates the token (checking signature, expiry, and scopes) before processing the request. Different scopes can limit access to specific resources or operations.',
		leftRole:
			'[[oauth2|OAuth 2.0]] provides the authorization mechanism — issuing, validating, and scoping access tokens for API access.',
		rightRole:
			'[[rest|REST]] provides the API interface that [[oauth2|OAuth 2.0]] tokens authorize access to — resources, methods, and status codes.'
	},

	// ── Additional cross-category relationships ─────────────────

	{
		ids: ['arp', 'wifi'],
		type: 'relationship',
		summary:
			'[[arp|ARP]] broadcasts work over [[wifi|Wi-Fi]] just as they do over [[ethernet|Ethernet]] — the access point bridges ARP requests between wireless clients and the wired LAN.',
		howTheyWork:
			'When a wireless client needs to resolve an IP address, it sends an [[arp|ARP]] broadcast as an 802.11 frame. The access point receives it, bridges it to the wired [[ethernet|Ethernet]] segment as a standard Ethernet broadcast, and relays the unicast reply back over [[wifi|Wi-Fi]]. The process is transparent — wireless and wired hosts appear on the same Layer 2 segment.',
		leftRole:
			'[[arp|ARP]] provides the IP-to-MAC resolution mechanism, using broadcast requests and unicast replies to map addresses.',
		rightRole:
			'[[wifi|Wi-Fi]] carries the [[arp|ARP]] frames wirelessly and relies on the access point to bridge them to the wired network.'
	},
	{
		ids: ['arp', 'dhcp'],
		type: 'relationship',
		summary:
			'[[dhcp|DHCP]] assigns IP addresses; [[arp|ARP]] resolves those addresses to MACs. Together they bootstrap a device onto the network — first an address, then local reachability.',
		howTheyWork:
			'A new device uses [[dhcp|DHCP]] (over UDP broadcast) to obtain an IP address, subnet mask, and default gateway. Once it has an IP, it uses [[arp|ARP]] to discover the MAC addresses of its gateway and local peers. Many [[dhcp|DHCP]] servers also send a Gratuitous [[arp|ARP]] after assignment to detect address conflicts.',
		leftRole:
			'[[arp|ARP]] resolves the IP addresses that [[dhcp|DHCP]] assigned — turning logical addresses into hardware addresses for frame delivery.',
		rightRole:
			'[[dhcp|DHCP]] provides the IP configuration that makes [[arp|ARP]] necessary — without assigned addresses, there is nothing to resolve.'
	},
	{
		ids: ['dns', 'ip'],
		type: 'relationship',
		summary:
			'[[dns|DNS]] is the phone book for [[ip|IP]]\'s address space — it translates human-readable names into the 32-bit or 128-bit addresses that [[ip|IP]] needs to route packets.',
		howTheyWork:
			'When an application needs to connect to a hostname, it queries [[dns|DNS]], which returns one or more [[ip|IP]] addresses. The operating system then uses [[ip|IP]] to construct packets with the resolved destination address. Without [[dns|DNS]], users would need to memorize numerical addresses; without [[ip|IP]], the resolved addresses would have nowhere to route to.',
		leftRole:
			'[[dns|DNS]] resolves domain names into [[ip|IP]] addresses, providing the naming layer that makes the internet usable by humans.',
		rightRole:
			'[[ip|IP]] provides the addressing and routing system whose addresses [[dns|DNS]] resolves — every A record points to an IPv4 address, every AAAA record to an IPv6 address.'
	},
	{
		ids: ['http1', 'oauth2'],
		type: 'relationship',
		summary:
			'[[oauth2|OAuth 2.0]] is built entirely on [[http1|HTTP]] — authorization endpoints, token exchanges, and bearer tokens all use HTTP redirects, POST requests, and headers.',
		howTheyWork:
			'The OAuth authorization code flow starts with an [[http1|HTTP]] redirect to the authorization server. After user consent, the server redirects back with an authorization code in the URL. The client then makes an [[http1|HTTP]] POST to the token endpoint to exchange the code for access and refresh tokens. Every API call includes the token in the [[http1|HTTP]] Authorization header as `Bearer <token>`.',
		leftRole:
			'[[http1|HTTP]] provides the transport mechanism — redirects for the authorization flow, POST for token exchange, and headers for bearer token presentation.',
		rightRole:
			'[[oauth2|OAuth 2.0]] defines the authorization semantics layered on top of [[http1|HTTP]] — what the redirects mean, what the token endpoint returns, and how tokens grant access.'
	},
	{
		ids: ['soap', 'tls'],
		type: 'relationship',
		summary:
			'Production [[soap|SOAP]] services run over HTTPS, with [[tls|TLS]] encrypting the XML envelopes in transit. [[soap|SOAP]] also has its own WS-Security layer for message-level encryption and signing.',
		howTheyWork:
			'[[tls|TLS]] provides transport-level encryption for [[soap|SOAP]] messages sent over HTTPS — protecting the entire HTTP request including the XML envelope. For end-to-end security through intermediaries, [[soap|SOAP]]\'s WS-Security standard adds message-level encryption and digital signatures within the SOAP Header, allowing parts of the message to remain encrypted even when TLS terminates at a load balancer.',
		leftRole:
			'[[soap|SOAP]] defines the XML message format and can add message-level security via WS-Security headers for end-to-end protection.',
		rightRole:
			'[[tls|TLS]] encrypts the transport channel, protecting [[soap|SOAP]] envelopes from eavesdropping between client and server.'
	},
	{
		ids: ['soap', 'tcp'],
		type: 'relationship',
		summary:
			'[[soap|SOAP]] messages are delivered over [[tcp|TCP]] via [[http1|HTTP]] — TCP provides the reliable byte stream that ensures XML envelopes arrive complete and in order.',
		howTheyWork:
			'A [[soap|SOAP]] client sends an XML envelope as the body of an [[http1|HTTP]] POST request. [[http1|HTTP]] relies on [[tcp|TCP]] for reliable delivery — the three-way handshake establishes the connection, TCP segments carry the HTTP request containing the SOAP envelope, and TCP acknowledgments guarantee nothing is lost. For high-throughput enterprise services, persistent TCP connections (HTTP keep-alive) amortize handshake costs across many SOAP calls.',
		leftRole:
			'[[soap|SOAP]] defines the XML envelope format and RPC semantics carried inside the HTTP body over the TCP connection.',
		rightRole:
			'[[tcp|TCP]] provides reliable, ordered delivery for the [[http1|HTTP]] requests that transport [[soap|SOAP]] messages.'
	},
	{
		ids: ['oauth2', 'tcp'],
		type: 'relationship',
		summary:
			'[[oauth2|OAuth 2.0]] flows run over [[tcp|TCP]] via [[http1|HTTP]] and [[tls|TLS]] — TCP ensures the authorization redirects, token exchanges, and API calls are delivered reliably.',
		howTheyWork:
			'Every [[oauth2|OAuth 2.0]] interaction — the initial redirect to the authorization server, the token endpoint POST, and each API call with a Bearer token — travels over an [[http1|HTTP]] connection built on [[tcp|TCP]]. The [[tls|TLS]] handshake that encrypts these exchanges also relies on TCP for reliable segment delivery. If a token exchange packet were lost, TCP retransmission ensures it arrives.',
		leftRole:
			'[[oauth2|OAuth 2.0]] defines the authorization flows and token semantics carried over HTTP on top of TCP connections.',
		rightRole:
			'[[tcp|TCP]] provides the reliable transport that ensures authorization codes, tokens, and API responses are delivered without loss.'
	},
	{
		ids: ['bgp', 'ip'],
		type: 'relationship',
		summary:
			'[[bgp|BGP]] is the routing protocol of the internet — it determines how [[ip|IP]] packets traverse autonomous system boundaries by exchanging reachability information for IP prefixes.',
		howTheyWork:
			'[[bgp|BGP]] routers advertise which [[ip|IP]] prefixes they can reach, along with AS path attributes. When a router receives a packet destined for an [[ip|IP]] address, it consults the routing table built from [[bgp|BGP]] advertisements to determine the next hop. [[bgp|BGP]] operates at the inter-domain level — within a network, IGP protocols handle routing, but between networks (ISPs, cloud providers, enterprises), [[bgp|BGP]] is the sole routing protocol.',
		leftRole:
			'[[bgp|BGP]] builds and maintains the routing tables that determine how [[ip|IP]] packets are forwarded between autonomous systems.',
		rightRole:
			'[[ip|IP]] provides the addressing system whose prefixes [[bgp|BGP]] advertises and routes — every BGP UPDATE message references IP prefixes.'
	},

	// ── IPv6 relationships ──────────────────────────────────────

	{
		ids: ['ipv6', 'tcp'],
		type: 'relationship',
		summary:
			'[[tcp|TCP]] runs identically over [[ipv6|IPv6]] as over [[ip|IPv4]] — the same reliable byte-stream delivery, but IPv6 mandates that TCP perform checksum computation (IPv6 has no header checksum).',
		howTheyWork:
			'[[tcp|TCP]] segments are encapsulated in [[ipv6|IPv6]] packets with Next Header value 6. The key difference from IPv4: since [[ipv6|IPv6]] has no header checksum, the TCP checksum is mandatory (not optional). TCP\'s pseudo-header for checksum computation uses 128-bit addresses instead of 32-bit ones. Otherwise the connection setup, flow control, and congestion algorithms are identical.',
		leftRole:
			'[[ipv6|IPv6]] provides 128-bit addressing and routing, carrying [[tcp|TCP]] segments in its payload with Next Header=6.',
		rightRole:
			'[[tcp|TCP]] provides reliable, ordered byte-stream delivery over [[ipv6|IPv6]] with mandatory checksum coverage.'
	},
	{
		ids: ['ipv6', 'udp'],
		type: 'relationship',
		summary:
			'[[udp|UDP]] datagrams ride over [[ipv6|IPv6]] just as over [[ip|IPv4]], but with one key difference: the UDP checksum is mandatory in IPv6 (it was optional in IPv4).',
		howTheyWork:
			'[[udp|UDP]] datagrams are carried in [[ipv6|IPv6]] packets with Next Header value 17. Because [[ipv6|IPv6]] eliminated the IP-layer header checksum, [[udp|UDP]]\'s checksum became mandatory to ensure minimum integrity coverage. The checksum pseudo-header uses the full 128-bit source and destination addresses. Applications like [[dns|DNS]], [[dhcp|DHCPv6]], and real-time media use UDP over IPv6.',
		leftRole:
			'[[ipv6|IPv6]] routes [[udp|UDP]] datagrams across networks using 128-bit addresses and Next Header=17.',
		rightRole:
			'[[udp|UDP]] provides lightweight, connectionless datagram delivery with mandatory checksums over [[ipv6|IPv6]].'
	},
	{
		ids: ['ethernet', 'ipv6'],
		type: 'relationship',
		summary:
			'[[ipv6|IPv6]] packets are carried inside [[ethernet|Ethernet]] frames using EtherType 0x86DD — the same framing model as IPv4 but with a different type identifier.',
		howTheyWork:
			'When sending an [[ipv6|IPv6]] packet on a LAN, the host wraps it in an [[ethernet|Ethernet]] frame with EtherType 0x86DD (vs 0x0800 for IPv4). The destination MAC is resolved using NDP (Neighbor Discovery Protocol) instead of [[arp|ARP]]. NDP sends Neighbor Solicitation messages to solicited-node multicast addresses (33:33:FF:xx:xx:xx) rather than broadcasting — dramatically reducing overhead on large networks.',
		leftRole:
			'[[ethernet|Ethernet]] provides the Layer 2 framing that carries [[ipv6|IPv6]] packets on wired networks, identified by EtherType 0x86DD.',
		rightRole:
			'[[ipv6|IPv6]] provides the Layer 3 addressing and routing carried inside [[ethernet|Ethernet]] frames, using NDP for address resolution.'
	},
	{
		ids: ['ipv6', 'wifi'],
		type: 'relationship',
		summary:
			'[[ipv6|IPv6]] packets are carried over [[wifi|Wi-Fi]] 802.11 frames, with NDP replacing ARP for address resolution on wireless networks.',
		howTheyWork:
			'[[ipv6|IPv6]] packets are encapsulated in 802.11 frames for wireless transmission. The access point bridges between [[wifi|Wi-Fi]] and [[ethernet|Ethernet]], re-encapsulating [[ipv6|IPv6]] packets between frame types. NDP Neighbor Solicitation multicast (ff02::1:ff..) works over Wi-Fi, though access points may convert multicast to unicast for sleeping clients. Router Advertisements over Wi-Fi enable SLAAC for wireless devices.',
		leftRole:
			'[[ipv6|IPv6]] provides addressing and routing for wireless clients, using NDP for neighbor discovery over the wireless medium.',
		rightRole:
			'[[wifi|Wi-Fi]] provides the wireless Layer 2 transport for [[ipv6|IPv6]] packets, bridging to wired Ethernet at the access point.'
	},
	{
		ids: ['dns', 'ipv6'],
		type: 'relationship',
		summary:
			'[[dns|DNS]] AAAA records map domain names to [[ipv6|IPv6]] addresses — the same naming system, extended for 128-bit addresses.',
		howTheyWork:
			'When a client queries [[dns|DNS]] for a hostname, it can request AAAA records (for [[ipv6|IPv6]]) alongside A records (for IPv4). Modern resolvers use Happy Eyeballs (RFC 8305) to race IPv4 and IPv6 connections simultaneously, preferring whichever responds first. Dual-stack [[dns|DNS]] servers return both record types, and clients choose based on connectivity. DNS itself can run over either IPv4 or IPv6 transport.',
		leftRole:
			'[[dns|DNS]] translates domain names into [[ipv6|IPv6]] addresses via AAAA records, extending the naming system for 128-bit addresses.',
		rightRole:
			'[[ipv6|IPv6]] provides the 128-bit addresses that [[dns|DNS]] AAAA records resolve to, and can also serve as the transport for DNS queries themselves.'
	},
	{
		ids: ['icmp', 'ipv6'],
		type: 'relationship',
		summary:
			'ICMPv6 is an integral part of [[ipv6|IPv6]] — it handles neighbor discovery, address resolution, and router discovery, not just error reporting like [[icmp|ICMPv4]].',
		howTheyWork:
			'In IPv4, [[icmp|ICMP]] primarily handles error messages and ping. In [[ipv6|IPv6]], ICMPv6 takes on a vastly expanded role: Neighbor Discovery Protocol (NDP) replaces ARP, Router Solicitation/Advertisement replaces DHCP for basic configuration (SLAAC), and Path MTU Discovery replaces router fragmentation. [[ipv6|IPv6]] literally cannot function without ICMPv6 — firewalls that block it break networking.',
		leftRole:
			'[[icmp|ICMPv6]] provides essential [[ipv6|IPv6]] functions: neighbor discovery (replacing ARP), router discovery (enabling SLAAC), and error reporting.',
		rightRole:
			'[[ipv6|IPv6]] depends on ICMPv6 for core operations — address resolution, router discovery, and path MTU discovery are all ICMPv6-based.'
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
