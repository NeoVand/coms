export type ConceptCategory =
	| 'networking-basics'
	| 'protocol-mechanics'
	| 'security'
	| 'web'
	| 'messaging'
	| 'infrastructure';

export interface Concept {
	id: string;
	term: string;
	definition: string;
	analogy?: string;
	wikiUrl?: string;
	category: ConceptCategory;
}

export const concepts: Concept[] = [
	// ── Networking Basics ──────────────────────────────────────────────
	{
		id: 'ip-address',
		term: 'IP Address',
		definition:
			'A unique numerical label assigned to every device on a network, used to route data to the correct destination. IPv4 uses 32 bits (e.g., 192.168.1.1); IPv6 uses 128 bits.',
		analogy:
			'Like a postal address for your computer — it tells the network exactly where to deliver your data.',
		wikiUrl: 'https://en.wikipedia.org/wiki/IP_address',
		category: 'networking-basics'
	},
	{
		id: 'mac-address',
		term: 'MAC Address',
		definition:
			'A hardware identifier burned into every network interface card (NIC). Used at Layer 2 to deliver frames within a local network. 48 bits, written as six hex pairs (e.g., AA:BB:CC:DD:EE:FF).',
		analogy:
			'Like a serial number stamped on your network card at the factory — it uniquely identifies the hardware, though modern systems can randomize it for privacy.',
		wikiUrl: 'https://en.wikipedia.org/wiki/MAC_address',
		category: 'networking-basics'
	},
	{
		id: 'osi-model',
		term: 'OSI Model',
		definition:
			'A conceptual framework that divides network communication into 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer has a specific responsibility.',
		analogy:
			'Like an assembly line where each worker handles one step — Layer 1 moves raw bits, Layer 4 ensures reliable delivery, Layer 7 is the app you see.',
		wikiUrl: 'https://en.wikipedia.org/wiki/OSI_model',
		category: 'networking-basics'
	},
	{
		id: 'tcp-ip-model',
		term: 'TCP/IP Model',
		definition:
			'The practical 4-layer model the internet actually uses: Link, Internet, Transport, and Application. Simpler than OSI, it maps directly to real protocols like Ethernet, IP, TCP, and HTTP.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_protocol_suite',
		category: 'networking-basics'
	},
	{
		id: 'port',
		term: 'Port',
		definition:
			'A 16-bit number (0–65535) that identifies a specific process or service on a machine. Combined with an IP address, it lets multiple applications share one network connection.',
		analogy:
			'If the IP address is the building address, the port is the apartment number — it gets data to the right application inside the machine.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Port_(computer_networking)',
		category: 'networking-basics'
	},
	{
		id: 'socket',
		term: 'Socket',
		definition:
			'An endpoint for network communication, defined by the combination of an IP address, a port number, and a protocol (TCP or UDP). A connection is identified by a pair of sockets.',
		analogy:
			'Like a phone plug — it combines the phone number (IP), extension (port), and line type (TCP/UDP) into one connection point.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Network_socket',
		category: 'networking-basics'
	},
	{
		id: 'packet',
		term: 'Packet',
		definition:
			'A unit of data transmitted over a network. Each packet contains a header (addressing and control info) and a payload (the actual data). Large messages are split into many packets.',
		analogy:
			'Like a page in a letter — if your message is too long for one envelope, you split it across numbered pages so the receiver can reassemble them.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Network_packet',
		category: 'networking-basics'
	},
	{
		id: 'datagram',
		term: 'Datagram',
		definition:
			'A self-contained, independently-routed packet with no guarantee of delivery, ordering, or duplication prevention. UDP sends datagrams; TCP sends segments over a connection.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Datagram',
		category: 'networking-basics'
	},
	{
		id: 'segment',
		term: 'Segment',
		definition:
			'The unit of data at the Transport layer (Layer 4). A TCP segment contains a header with sequence numbers, flags, and checksums, plus the application data payload.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure',
		category: 'networking-basics'
	},
	{
		id: 'frame',
		term: 'Frame',
		definition:
			'The unit of data at the Data Link layer (Layer 2). An Ethernet frame wraps an IP packet with source/destination MAC addresses and a checksum (FCS).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Ethernet_frame',
		category: 'networking-basics'
	},
	{
		id: 'client-server',
		term: 'Client-Server Model',
		definition:
			'A communication pattern where a client initiates a request and a server responds. The server listens on a known address; clients connect to it. Most of the web works this way.',
		analogy:
			'Like a restaurant — you (client) place an order, and the kitchen (server) prepares and delivers it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Client%E2%80%93server_model',
		category: 'networking-basics'
	},
	{
		id: 'peer-to-peer',
		term: 'Peer-to-Peer (P2P)',
		definition:
			'A communication pattern where every participant is both client and server. Nodes connect directly to each other without a central server. Used in BitTorrent, WebRTC, and blockchain.',
		analogy:
			'Like a potluck dinner — everyone brings food and serves each other, with no single chef or waiter.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Peer-to-peer',
		category: 'networking-basics'
	},
	{
		id: 'bandwidth',
		term: 'Bandwidth',
		definition:
			'The maximum rate of data transfer across a network path, measured in bits per second (bps). Higher bandwidth means more data can flow simultaneously.',
		analogy: 'Like the width of a highway — more lanes means more cars (data) can travel at once.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Bandwidth_(computing)',
		category: 'networking-basics'
	},
	{
		id: 'latency',
		term: 'Latency',
		definition:
			'The time delay between sending a request and receiving the first byte of the response. Caused by physical distance, routing hops, processing time, and queuing. Measured in milliseconds.',
		analogy:
			'Like the time it takes a letter to travel from your mailbox to the destination — even if the postal system is fast, distance adds delay.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Latency_(engineering)',
		category: 'networking-basics'
	},
	{
		id: 'rtt',
		term: 'Round-Trip Time (RTT)',
		definition:
			'The time for a signal to travel from sender to receiver and back. A TCP handshake takes 1 RTT. TLS 1.3 adds 1 RTT. Each round trip adds latency before data can flow.',
		analogy:
			'Like a ping-pong rally — the time from hitting the ball to getting it back is one round trip.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Round-trip_delay',
		category: 'networking-basics'
	},
	{
		id: 'jitter',
		term: 'Jitter',
		definition:
			'Variation in packet arrival times. Low jitter means packets arrive at regular intervals; high jitter causes stuttering in real-time audio/video. Jitter buffers smooth this out.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Jitter',
		category: 'networking-basics'
	},
	{
		id: 'handshake',
		term: 'Handshake',
		definition:
			'An automated negotiation process at the start of a connection. TCP uses a three-way handshake (SYN → SYN-ACK → ACK); TLS adds a handshake to agree on encryption parameters.',
		analogy:
			'Like introducing yourself before a conversation — "Hi, I want to talk" → "Sure, let\'s talk" → "Great, here we go."',
		wikiUrl: 'https://en.wikipedia.org/wiki/Handshaking',
		category: 'networking-basics'
	},
	{
		id: 'connection-oriented',
		term: 'Connection-Oriented',
		definition:
			'A communication mode where a dedicated connection is established before data transfer (e.g., TCP). Provides ordering, reliability, and flow control, but adds overhead.',
		analogy:
			'Like a phone call — you dial, wait for the other person to pick up, then talk. The connection is maintained throughout.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Connection-oriented_communication',
		category: 'networking-basics'
	},
	{
		id: 'connectionless',
		term: 'Connectionless',
		definition:
			'A communication mode where each packet is sent independently with no prior setup or guaranteed delivery (e.g., UDP). Faster and simpler, but no ordering or reliability guarantees.',
		analogy: 'Like sending postcards — each one travels independently and might arrive out of order.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Connectionless_communication',
		category: 'networking-basics'
	},
	{
		id: 'encapsulation',
		term: 'Encapsulation',
		definition:
			'The process of wrapping data with protocol headers as it moves down the network stack. Application data becomes a TCP segment, then an IP packet, then an Ethernet frame.',
		analogy:
			'Like nesting envelopes — your letter goes in an envelope with the apartment number (port), then into a larger envelope with the street address (IP), then into a postal bag (Ethernet frame).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Encapsulation_(networking)',
		category: 'networking-basics'
	},
	{
		id: 'protocol',
		term: 'Protocol',
		definition:
			'A set of rules that define how data is formatted, transmitted, and received on a network. Protocols ensure different systems can communicate by agreeing on a common language.',
		analogy:
			'Like the rules of a language — grammar, vocabulary, and pronunciation that both speakers must follow to understand each other.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Communication_protocol',
		category: 'networking-basics'
	},

	// ── Protocol Mechanics ─────────────────────────────────────────────
	{
		id: 'flow-control',
		term: 'Flow Control',
		definition:
			'A mechanism that prevents a fast sender from overwhelming a slow receiver. TCP uses a sliding window: the receiver advertises how much buffer space it has, and the sender limits itself accordingly.',
		analogy:
			'Like a waiter checking if you are ready for the next course before bringing it — no point serving food faster than you can eat.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Flow_control_(data)',
		category: 'protocol-mechanics'
	},
	{
		id: 'congestion-control',
		term: 'Congestion Control',
		definition:
			'Algorithms that detect and respond to network congestion. TCP starts slow (slow start), probes for available bandwidth, and backs off when packet loss signals congestion. Key algorithms: Tahoe, Reno, CUBIC, BBR.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control',
		category: 'protocol-mechanics'
	},
	{
		id: 'multiplexing',
		term: 'Multiplexing',
		definition:
			'Combining multiple independent data streams over a single connection. HTTP/2 multiplexes many requests over one TCP connection; QUIC does it over UDP. Eliminates head-of-line blocking between streams.',
		analogy:
			'Like a highway with multiple lanes — many conversations (streams) share the same road (connection) without blocking each other.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Multiplexing',
		category: 'protocol-mechanics'
	},
	{
		id: 'head-of-line-blocking',
		term: 'Head-of-Line Blocking',
		definition:
			'When a single delayed packet blocks all packets behind it, even if they belong to independent streams. TCP suffers from this because it guarantees in-order delivery. QUIC solves it with per-stream ordering.',
		analogy:
			'Like a grocery store with one checkout line — if the first person takes forever, everyone behind waits, even if their items are ready.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Head-of-line_blocking',
		category: 'protocol-mechanics'
	},
	{
		id: 'keep-alive',
		term: 'Keep-Alive',
		definition:
			'A mechanism to reuse an existing connection for multiple requests instead of opening a new one each time. HTTP/1.1 defaults to keep-alive, saving the overhead of repeated TCP handshakes.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP_persistent_connection',
		category: 'protocol-mechanics'
	},
	{
		id: 'retransmission',
		term: 'Retransmission',
		definition:
			'When a sender detects that a packet was lost (via timeout or duplicate ACKs), it sends the packet again. TCP handles this automatically; UDP does not — applications must implement their own retry logic.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Retransmission_(data_networks)',
		category: 'protocol-mechanics'
	},
	{
		id: 'ack',
		term: 'ACK (Acknowledgment)',
		definition:
			'A message sent by the receiver to confirm that data was received successfully. TCP uses cumulative ACKs ("I got everything up to byte 5000") and selective ACKs for efficiency.',
		analogy:
			'Like a read receipt on a text message — it tells the sender "I got it, you can send the next one."',
		wikiUrl: 'https://en.wikipedia.org/wiki/Acknowledgement_(data_networks)',
		category: 'protocol-mechanics'
	},
	{
		id: 'sequence-number',
		term: 'Sequence Number',
		definition:
			'A counter in each TCP segment that tracks the byte position in the data stream. Allows the receiver to reassemble segments in order and detect missing data.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure',
		category: 'protocol-mechanics'
	},
	{
		id: 'sliding-window',
		term: 'Sliding Window',
		definition:
			'A flow control mechanism where the sender can transmit multiple packets before needing an ACK. The "window" slides forward as ACKs arrive, allowing continuous data flow without stop-and-wait delays.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Sliding_window_protocol',
		category: 'protocol-mechanics'
	},
	{
		id: 'backpressure',
		term: 'Backpressure',
		definition:
			'A flow control signal from a consumer to a producer saying "slow down, I cannot keep up." Used in streaming systems, message queues, and reactive architectures to prevent buffer overflow.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Back_pressure#Back_pressure_in_data_networks',
		category: 'protocol-mechanics'
	},
	{
		id: 'idempotent',
		term: 'Idempotent',
		definition:
			'An operation that produces the same result no matter how many times it is performed. HTTP GET, PUT, and DELETE are idempotent; POST is not. Critical for safe retry logic.',
		analogy:
			'Like pressing an elevator button — pressing it 5 times has the same effect as pressing it once.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Idempotence',
		category: 'protocol-mechanics'
	},
	{
		id: 'stateless',
		term: 'Stateless',
		definition:
			'A protocol where each request is independent and contains all the information needed to process it. The server retains no memory of previous requests. HTTP is stateless (cookies add state on top).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Stateless_protocol',
		category: 'protocol-mechanics'
	},
	{
		id: 'stateful',
		term: 'Stateful',
		definition:
			'A protocol where the server tracks the state of each connection or session. TCP is stateful (it tracks sequence numbers, window sizes). WebSockets maintain persistent state.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Stateful_protocol',
		category: 'protocol-mechanics'
	},

	// ── Security ───────────────────────────────────────────────────────
	{
		id: 'encryption',
		term: 'Encryption',
		definition:
			'The process of converting readable data (plaintext) into unreadable data (ciphertext) using an algorithm and a key. Only someone with the correct key can decrypt it back.',
		analogy:
			'Like writing a message in a secret code that only your friend knows how to decode.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Encryption',
		category: 'security'
	},
	{
		id: 'symmetric-encryption',
		term: 'Symmetric Encryption',
		definition:
			'Encryption where the same key is used for both encrypting and decrypting. Fast and efficient (AES, ChaCha20), but both parties must securely share the key first.',
		analogy:
			'Like a lockbox with identical keys — both sender and receiver use the same key to lock and unlock.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Symmetric-key_algorithm',
		category: 'security'
	},
	{
		id: 'asymmetric-encryption',
		term: 'Asymmetric Encryption',
		definition:
			'Encryption using a key pair: a public key (shared openly) for encrypting, and a private key (kept secret) for decrypting. Slower than symmetric, but solves the key distribution problem. Used in RSA, ECDH.',
		analogy:
			'Like a mailbox — anyone can drop a letter in (public key), but only you have the key to open it (private key).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Public-key_cryptography',
		category: 'security'
	},
	{
		id: 'certificate',
		term: 'Certificate',
		definition:
			'A digital document that binds a public key to an identity (like a domain name). Issued by Certificate Authorities (CAs), certificates let your browser verify that a server is who it claims to be.',
		analogy: 'Like a passport — issued by a trusted authority, it proves your identity to others.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Public_key_certificate',
		category: 'security'
	},
	{
		id: 'cipher-suite',
		term: 'Cipher Suite',
		definition:
			'A named combination of cryptographic algorithms used in a TLS connection: key exchange (e.g., ECDHE), authentication (e.g., RSA), bulk encryption (e.g., AES-256-GCM), and hash (e.g., SHA-384).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Cipher_suite',
		category: 'security'
	},
	{
		id: 'public-key',
		term: 'Public Key',
		definition:
			'The shareable half of an asymmetric key pair. Used to encrypt data or verify signatures. Anyone can have your public key — it cannot be used to decrypt data encrypted with it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Public-key_cryptography',
		category: 'security'
	},
	{
		id: 'private-key',
		term: 'Private Key',
		definition:
			'The secret half of an asymmetric key pair. Used to decrypt data or create digital signatures. Must never be shared — if compromised, all encrypted communication is exposed.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Public-key_cryptography',
		category: 'security'
	},
	{
		id: 'certificate-chain',
		term: 'Certificate Chain',
		definition:
			'A sequence of certificates from a server certificate up to a trusted root CA. Each certificate in the chain is signed by the next, creating a chain of trust that browsers can verify.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Chain_of_trust',
		category: 'security'
	},
	{
		id: 'tls-handshake',
		term: 'TLS Handshake',
		definition:
			'The negotiation process at the start of a TLS connection. Client and server agree on a protocol version, cipher suite, exchange keys, and verify certificates. TLS 1.3 completes in just 1 RTT.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_handshake',
		category: 'security'
	},
	{
		id: 'pki',
		term: 'PKI (Public Key Infrastructure)',
		definition:
			'The system of Certificate Authorities, digital certificates, and trust chains that enables secure communication on the internet. PKI is what makes the padlock icon in your browser possible.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Public_key_infrastructure',
		category: 'security'
	},

	// ── Web ────────────────────────────────────────────────────────────
	{
		id: 'http-method',
		term: 'HTTP Method',
		definition:
			'The verb in an HTTP request that indicates the desired action: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove). Methods define the semantics of REST APIs.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP#Request_methods',
		category: 'web'
	},
	{
		id: 'status-code',
		term: 'HTTP Status Code',
		definition:
			'A 3-digit number in an HTTP response indicating the result: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error). For example, 200 = OK, 404 = Not Found, 500 = Internal Server Error.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
		category: 'web'
	},
	{
		id: 'header',
		term: 'HTTP Header',
		definition:
			'Key-value metadata sent with HTTP requests and responses. Headers control caching (Cache-Control), content type (Content-Type), authentication (Authorization), cookies, and more.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_HTTP_header_fields',
		category: 'web'
	},
	{
		id: 'stream',
		term: 'Stream',
		definition:
			'In HTTP/2 and HTTP/3, a stream is an independent, bidirectional sequence of frames within a single connection. Multiple streams are multiplexed together, eliminating head-of-line blocking between requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP/2#Streams',
		category: 'web'
	},
	{
		id: 'request-response',
		term: 'Request-Response',
		definition:
			'The fundamental communication pattern of HTTP: the client sends a request, and the server sends back a response. Each exchange is independent (stateless). Contrast with streaming or pub/sub patterns.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Request%E2%80%93response',
		category: 'web'
	},
	{
		id: 'content-negotiation',
		term: 'Content Negotiation',
		definition:
			'The process by which a client and server agree on the format of the response. The client sends Accept headers (e.g., Accept: application/json), and the server picks the best match.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Content_negotiation',
		category: 'web'
	},

	// ── Messaging ──────────────────────────────────────────────────────
	{
		id: 'pub-sub',
		term: 'Publish/Subscribe (Pub/Sub)',
		definition:
			'A messaging pattern where publishers send messages to topics without knowing who will receive them, and subscribers listen to topics without knowing who sent the messages. Decouples producers from consumers.',
		analogy:
			'Like a newspaper — the publisher prints articles on topics, and subscribers choose which topics to receive. Neither needs to know the other.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern',
		category: 'messaging'
	},
	{
		id: 'broker',
		term: 'Message Broker',
		definition:
			'A middleman that receives messages from publishers, stores them, and delivers them to subscribers. Brokers like RabbitMQ, Kafka, and Mosquitto handle routing, queuing, and delivery guarantees.',
		analogy:
			'Like a post office — it receives, sorts, and delivers mail between senders and recipients who never interact directly.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Message_broker',
		category: 'messaging'
	},
	{
		id: 'topic',
		term: 'Topic',
		definition:
			'A named channel in a pub/sub system that messages are published to and subscribed from. Topics can be hierarchical (e.g., home/kitchen/temperature in MQTT) for flexible filtering.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern',
		category: 'messaging'
	},
	{
		id: 'qos',
		term: 'Quality of Service (QoS)',
		definition:
			'A delivery guarantee level in messaging protocols. MQTT defines three: QoS 0 (at most once / fire-and-forget), QoS 1 (at least once), QoS 2 (exactly once). Higher QoS = more overhead.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Quality_of_service',
		category: 'messaging'
	},
	{
		id: 'dead-letter-queue',
		term: 'Dead-Letter Queue (DLQ)',
		definition:
			'A special queue where messages that cannot be delivered or processed are sent. DLQs prevent poison messages from blocking a queue and provide a way to inspect and retry failed messages.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Dead_letter_queue',
		category: 'messaging'
	},

	// ── Infrastructure ─────────────────────────────────────────────────
	{
		id: 'nat',
		term: 'NAT (Network Address Translation)',
		definition:
			'A technique that remaps private IP addresses to a single public IP address (and back) at a router. Lets many devices share one public IP, but complicates peer-to-peer connections.',
		analogy:
			'Like a company switchboard — external callers dial one number, and the switchboard routes them to the right extension inside.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Network_address_translation',
		category: 'infrastructure'
	},
	{
		id: 'firewall',
		term: 'Firewall',
		definition:
			'A security system that monitors and filters network traffic based on rules. Firewalls can block specific ports, IP addresses, or protocols. They sit between trusted internal networks and untrusted external ones.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Firewall_(computing)',
		category: 'infrastructure'
	},
	{
		id: 'dns-resolution',
		term: 'DNS Resolution',
		definition:
			'The process of translating a domain name (e.g., google.com) into an IP address. Involves recursive resolvers, root servers, TLD servers, and authoritative servers. Results are cached for performance.',
		analogy:
			'Like looking up a phone number in a directory — you know the name, DNS gives you the address.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Domain_Name_System#Address_resolution_mechanism',
		category: 'infrastructure'
	},
	{
		id: 'subnet',
		term: 'Subnet',
		definition:
			'A logical subdivision of an IP network. Subnetting divides a large network into smaller segments using a subnet mask (e.g., 255.255.255.0 or /24). Devices on the same subnet communicate directly.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Subnetwork',
		category: 'infrastructure'
	},
	{
		id: 'gateway',
		term: 'Default Gateway',
		definition:
			'The router that a device sends packets to when the destination is outside its local subnet. Typically the first hop on the path to the internet.',
		analogy:
			'Like the front door of your building — to reach anywhere outside, all traffic goes through this one exit.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Default_gateway',
		category: 'infrastructure'
	},
	{
		id: 'routing-table',
		term: 'Routing Table',
		definition:
			'A table stored in a router (or host) that maps destination IP prefixes to next-hop addresses and interfaces. Determines which direction to forward each packet.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Routing_table',
		category: 'infrastructure'
	},
	{
		id: 'ttl',
		term: 'TTL (Time to Live)',
		definition:
			'A counter in IP packets that is decremented by 1 at each router hop. When it reaches 0, the packet is dropped and an ICMP error is sent back. Prevents packets from looping forever. Also used in DNS caching.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Time_to_live',
		category: 'infrastructure'
	},
	{
		id: 'mtu',
		term: 'MTU (Maximum Transmission Unit)',
		definition:
			'The largest packet size (in bytes) that a network link can carry. Ethernet defaults to 1500 bytes. Packets larger than the MTU must be fragmented or dropped (if the Don\'t Fragment flag is set). Path MTU Discovery finds the smallest MTU along a route.',
		analogy:
			'Like the maximum box size a conveyor belt can handle — anything bigger must be split into smaller boxes.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Maximum_transmission_unit',
		category: 'networking-basics'
	},
	{
		id: 'checksum',
		term: 'Checksum',
		definition:
			'A small value computed from a block of data to detect transmission errors. TCP, UDP, and IP each include checksums in their headers. The receiver recomputes the checksum and drops the packet if it doesn\'t match.',
		analogy:
			'Like a check digit on a credit card number — a quick math test that catches accidental typos.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Checksum',
		category: 'protocol-mechanics'
	},
	{
		id: 'proxy',
		term: 'Proxy / Reverse Proxy',
		definition:
			'A proxy sits between client and server, forwarding requests on the client\'s behalf (hiding the client). A reverse proxy sits in front of servers, distributing incoming requests (hiding the servers). Used for caching, load balancing, and security.',
		analogy:
			'A forward proxy is like a personal assistant making calls for you. A reverse proxy is like a receptionist directing visitors to the right office.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Reverse_proxy',
		category: 'infrastructure'
	},
	{
		id: 'cdn',
		term: 'CDN (Content Delivery Network)',
		definition:
			'A geographically distributed network of servers that cache and deliver content from locations close to the user. Reduces latency and offloads traffic from the origin server. Cloudflare, Akamai, and AWS CloudFront are major CDNs.',
		analogy:
			'Like a chain of local warehouses — instead of shipping every order from one central factory, stock is pre-positioned near customers for faster delivery.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Content_delivery_network',
		category: 'infrastructure'
	},
	{
		id: 'cidr',
		term: 'CIDR (Classless Inter-Domain Routing)',
		definition:
			'A method of allocating IP addresses using variable-length subnet masks (e.g., 192.168.1.0/24 means the first 24 bits are the network, leaving 8 bits for hosts). Replaced the old Class A/B/C system, enabling more efficient address allocation.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing',
		category: 'networking-basics'
	},
	{
		id: 'autonomous-system',
		term: 'Autonomous System (AS)',
		definition:
			'A large network or group of networks under a single administrative entity (like an ISP or corporation) that presents a unified routing policy to the internet. Each AS has a unique number (ASN). BGP routes traffic between autonomous systems.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Autonomous_system_(Internet)',
		category: 'infrastructure'
	},
	{
		id: 'forward-secrecy',
		term: 'Forward Secrecy',
		definition:
			'A property of key exchange protocols (like ECDHE) where compromising the server\'s long-term private key does not compromise past session keys. Each session generates unique ephemeral keys that are discarded after use.',
		analogy:
			'Like using a different lock combination for every package — even if someone learns today\'s code, they cannot open yesterday\'s packages.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Forward_secrecy',
		category: 'security'
	},
	{
		id: 'dtls',
		term: 'DTLS (Datagram TLS)',
		definition:
			'A variant of TLS designed for datagram protocols like UDP. Provides the same encryption, authentication, and integrity guarantees as TLS, but handles packet loss and reordering that UDP doesn\'t prevent. Used by WebRTC and CoAP.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security',
		category: 'security'
	},
	{
		id: 'stun-turn-ice',
		term: 'STUN/TURN/ICE',
		definition:
			'Three protocols that work together for NAT traversal in WebRTC. STUN (Session Traversal Utilities for NAT) discovers the public IP. TURN (Traversal Using Relays around NAT) relays media when direct connection fails. ICE (Interactive Connectivity Establishment) coordinates both to find the best path.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment',
		category: 'networking-basics'
	},
	{
		id: 'codec',
		term: 'Codec',
		definition:
			'An algorithm that compresses (encodes) and decompresses (decodes) audio or video data. Video codecs include H.264, VP9, and AV1. Audio codecs include Opus and AAC. The choice of codec affects quality, bandwidth, and CPU usage.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Codec',
		category: 'protocol-mechanics'
	},
	{
		id: 'serialization',
		term: 'Serialization',
		definition:
			'Converting structured data (objects, structs) into a byte stream for transmission or storage, and deserializing it back. Formats include JSON (human-readable), Protocol Buffers (compact binary), and MessagePack.',
		analogy:
			'Like flat-packing furniture for shipping — you disassemble it into a compact form, ship it, and reassemble at the destination.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Serialization',
		category: 'protocol-mechanics'
	},
	{
		id: 'consumer-group',
		term: 'Consumer Group',
		definition:
			'A set of consumers that cooperatively read from a topic, with each partition assigned to exactly one consumer in the group. Enables parallel processing and horizontal scaling. If a consumer fails, its partitions are redistributed to the remaining members.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Apache_Kafka#Consumer_group',
		category: 'messaging'
	},
	{
		id: 'dns-record-types',
		term: 'DNS Record Types',
		definition:
			'The different kinds of records stored in DNS. A records map names to IPv4 addresses, AAAA to IPv6, CNAME creates aliases, MX directs email, NS delegates to nameservers, TXT stores arbitrary text (used for SPF, DKIM), and SRV locates services.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_DNS_record_types',
		category: 'networking-basics'
	},

	// ── Addressing Modes ──────────────────────────────────────────────
	{
		id: 'unicast',
		term: 'Unicast',
		definition:
			'A one-to-one transmission from a single sender to a single receiver. Most internet traffic is unicast — when you load a webpage, the server sends data specifically to your IP address.',
		analogy: 'Like a phone call — you dial one person and only they hear you.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Unicast',
		category: 'networking-basics'
	},
	{
		id: 'multicast',
		term: 'Multicast',
		definition:
			'A one-to-many transmission where data is sent to a group of interested receivers simultaneously. The network handles duplication, so the sender only transmits once. Used for live video streaming, service discovery, and IPv6 neighbor discovery.',
		analogy:
			'Like a radio station — one broadcast reaches everyone who tunes in, without sending separate copies.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Multicast',
		category: 'networking-basics'
	},
	{
		id: 'broadcast',
		term: 'Broadcast',
		definition:
			'A one-to-all transmission sent to every device on a local network segment. ARP uses broadcast to find MAC addresses. IPv6 eliminates broadcast entirely, replacing it with multicast. Excessive broadcast traffic causes "broadcast storms."',
		analogy:
			'Like a PA announcement in a building — everyone hears it, whether they care or not.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Broadcasting_(networking)',
		category: 'networking-basics'
	},
	{
		id: 'anycast',
		term: 'Anycast',
		definition:
			'A one-to-nearest transmission where the same IP address is assigned to multiple servers, and the network routes each request to the closest one. Used by CDNs and DNS root servers to reduce latency.',
		analogy:
			'Like calling "nearest pizza place" — you always get connected to the closest location.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Anycast',
		category: 'networking-basics'
	},
	{
		id: 'full-duplex',
		term: 'Full-Duplex',
		definition:
			'A communication mode where data can flow in both directions simultaneously. Modern Ethernet and WebSockets are full-duplex. Contrast with half-duplex (only one direction at a time, like walkie-talkies) and simplex (one direction only).',
		analogy:
			'Like a two-lane road — traffic flows in both directions at the same time without waiting.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Duplex_(telecommunications)',
		category: 'networking-basics'
	},

	// ── Data Formats & Serialization ──────────────────────────────────
	{
		id: 'json',
		term: 'JSON (JavaScript Object Notation)',
		definition:
			'A lightweight, human-readable text format for structured data using key-value pairs and arrays. The dominant format for web APIs and configuration files. Easy to read and debug, but less compact than binary formats like Protocol Buffers.',
		wikiUrl: 'https://en.wikipedia.org/wiki/JSON',
		category: 'web'
	},
	{
		id: 'xml',
		term: 'XML (Extensible Markup Language)',
		definition:
			'A verbose, self-describing markup language using nested tags. Once dominant for web services (SOAP, RSS), largely superseded by JSON for APIs. Still used in XMPP, SVG, Android layouts, and enterprise systems.',
		wikiUrl: 'https://en.wikipedia.org/wiki/XML',
		category: 'web'
	},
	{
		id: 'protocol-buffers',
		term: 'Protocol Buffers (protobuf)',
		definition:
			'A binary serialization format developed by Google. You define message schemas in .proto files, and code is generated for any language. 3-10x smaller and faster than JSON. Used by gRPC, Google APIs, and many internal services.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Protocol_Buffers',
		category: 'web'
	},

	// ── HTTP Internals ────────────────────────────────────────────────
	{
		id: 'hpack',
		term: 'HPACK',
		definition:
			'The header compression algorithm used by HTTP/2. Compresses headers using a static table of common headers, a dynamic table of recently-used headers, and Huffman encoding. Reduces header overhead from ~800 bytes to ~20 bytes on repeat requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HPACK',
		category: 'web'
	},
	{
		id: 'binary-framing',
		term: 'Binary Framing',
		definition:
			'A way of encoding protocol messages as structured binary data instead of human-readable text. HTTP/2 uses a binary framing layer that divides messages into small frames with type, length, flags, and stream ID fields — enabling efficient multiplexing.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP/2#Differences_from_HTTP_1.1',
		category: 'web'
	},
	{
		id: 'server-push',
		term: 'Server Push',
		definition:
			'A feature where the server proactively sends resources to the client before they are requested. Introduced in HTTP/2 to pre-load assets like CSS and JS, but deprecated in most browsers due to complexity and caching issues. SSE and WebSockets offer better alternatives.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP/2_Server_Push',
		category: 'web'
	},

	// ── Transport Internals ───────────────────────────────────────────
	{
		id: 'three-way-handshake',
		term: 'Three-Way Handshake',
		definition:
			'The TCP connection setup process: the client sends SYN, the server replies SYN-ACK, and the client sends ACK. This exchange synchronizes sequence numbers and confirms both sides are ready. It takes 1 RTT before data can flow.',
		analogy:
			'Like knocking on a door: "Can I come in?" → "Yes, come in!" → "Great, I\'m here!" — then you start talking.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Handshaking#TCP_three-way_handshake',
		category: 'protocol-mechanics'
	},
	{
		id: 'congestion-window',
		term: 'Congestion Window (cwnd)',
		definition:
			'A TCP variable that limits how much data can be in flight (sent but not yet acknowledged). Starts small (slow start) and grows as ACKs arrive. When packet loss is detected, the window shrinks dramatically to reduce network load.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Congestion_window',
		category: 'protocol-mechanics'
	},
	{
		id: 'slow-start',
		term: 'Slow Start',
		definition:
			'The TCP congestion control phase where the congestion window grows exponentially (doubling each RTT) until packet loss occurs or a threshold is reached. Despite the name, it ramps up quickly — it just starts cautiously to probe available bandwidth.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Slow_start',
		category: 'protocol-mechanics'
	},

	// ── Media & Streaming ─────────────────────────────────────────────
	{
		id: 'adaptive-bitrate',
		term: 'Adaptive Bitrate Streaming',
		definition:
			'A technique where the video player dynamically switches between quality levels based on available bandwidth and buffer status. If your connection slows, the player seamlessly drops to a lower resolution instead of buffering. Used by HLS and DASH.',
		analogy:
			'Like a TV that automatically adjusts picture quality based on your signal strength — smooth playback over choppy connections.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming',
		category: 'protocol-mechanics'
	},
	{
		id: 'rtcp',
		term: 'RTCP (RTP Control Protocol)',
		definition:
			'A companion protocol to RTP that carries statistics about media quality — packet loss rates, jitter measurements, and round-trip times. Endpoints use this feedback to adapt their encoding (lower bitrate, change codec) in real time.',
		wikiUrl: 'https://en.wikipedia.org/wiki/RTP_Control_Protocol',
		category: 'protocol-mechanics'
	},
	{
		id: 'signaling',
		term: 'Signaling',
		definition:
			'The out-of-band process of exchanging connection metadata (capabilities, addresses, encryption keys) before establishing a real-time media session. WebRTC uses a signaling server to exchange SDP offers/answers. The signaling protocol itself is not standardized — you can use WebSockets, HTTP, or anything.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Signaling_(telecommunications)',
		category: 'protocol-mechanics'
	},
	{
		id: 'srtp',
		term: 'SRTP (Secure RTP)',
		definition:
			'An encrypted version of RTP that provides confidentiality, authentication, and replay protection for real-time media streams. WebRTC mandates SRTP — all audio and video is encrypted by default.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol',
		category: 'security'
	},

	// ── Security Additions ────────────────────────────────────────────
	{
		id: 'dnssec',
		term: 'DNSSEC',
		definition:
			'DNS Security Extensions that add cryptographic signatures to DNS records. DNSSEC lets resolvers verify that a DNS response was not tampered with, preventing DNS spoofing attacks. It authenticates the data but does not encrypt the query.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions',
		category: 'security'
	},
	{
		id: 'dns-over-https',
		term: 'DNS over HTTPS (DoH)',
		definition:
			'A protocol that sends DNS queries inside encrypted HTTPS connections (port 443), preventing ISPs and network operators from seeing or modifying your DNS lookups. Supported by major browsers and DNS providers like Cloudflare (1.1.1.1) and Google (8.8.8.8).',
		wikiUrl: 'https://en.wikipedia.org/wiki/DNS_over_HTTPS',
		category: 'security'
	},
	{
		id: 'jwt',
		term: 'JWT (JSON Web Token)',
		definition:
			'A compact, URL-safe token format for securely transmitting claims between parties. Contains three Base64-encoded parts: header (algorithm), payload (claims like user ID and expiration), and signature. Widely used for API authentication and OAuth ID tokens.',
		wikiUrl: 'https://en.wikipedia.org/wiki/JSON_Web_Token',
		category: 'security'
	},
	{
		id: 'access-token',
		term: 'Access Token',
		definition:
			'A credential that grants limited, scoped access to a protected resource on behalf of a user. OAuth access tokens are typically short-lived (minutes to hours) and carry specific permissions (scopes) rather than full account access.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Access_token',
		category: 'security'
	},

	// ── Messaging Additions ───────────────────────────────────────────
	{
		id: 'exchange',
		term: 'Exchange (AMQP)',
		definition:
			'An AMQP routing component that receives messages from producers and routes them to queues based on rules. Four types: direct (exact routing key match), topic (wildcard patterns), fanout (broadcast to all queues), and headers (route by message headers).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol',
		category: 'messaging'
	},
	{
		id: 'partition',
		term: 'Partition (Kafka)',
		definition:
			'A Kafka topic is split into partitions — ordered, append-only logs distributed across brokers. Partitions enable parallel processing and horizontal scaling. Each message within a partition gets a sequential offset number. Order is guaranteed within a partition but not across partitions.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Apache_Kafka',
		category: 'messaging'
	},

	// ── Layer 2 & Wi-Fi ───────────────────────────────────────────────
	{
		id: 'vlan',
		term: 'VLAN (Virtual LAN)',
		definition:
			'A logical partition of a physical network at Layer 2. VLANs isolate broadcast traffic without requiring separate switches. IEEE 802.1Q inserts a 4-byte tag into Ethernet frames with a 12-bit VLAN ID (1-4094). Essential for security, performance, and network organization.',
		wikiUrl: 'https://en.wikipedia.org/wiki/VLAN',
		category: 'infrastructure'
	},
	{
		id: 'access-point',
		term: 'Access Point (AP)',
		definition:
			'A device that bridges wireless (802.11) and wired (Ethernet) networks. Access points broadcast beacon frames to advertise their presence, handle client authentication, and translate between wireless and wired frame formats.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Wireless_access_point',
		category: 'infrastructure'
	},

	// ── Networking Fundamentals ──────────────────────────────────────
	{
		id: 'tunnel',
		term: 'Tunnel / Tunneling',
		definition:
			'Encapsulating one {{protocol|protocol}} inside another to carry traffic across a network that doesn\'t natively support it. For example, [[ssh|SSH]] tunnels wrap TCP traffic inside an encrypted SSH connection, and VPNs tunnel all traffic through an encrypted link. The outer protocol handles delivery; the inner protocol rides along as {{payload|payload}}.',
		analogy:
			'Like putting a letter inside a letter — the outer envelope gets it through the postal system, and the inner envelope carries the real message.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Tunneling_protocol',
		category: 'networking-basics'
	},
	{
		id: 'vpn',
		term: 'VPN (Virtual Private Network)',
		definition:
			'A technology that creates an encrypted {{tunnel|tunnel}} between your device and a VPN server, making all your traffic appear to originate from the server\'s IP address. Used for privacy (hiding traffic from ISPs), security (protecting data on public Wi-Fi), and accessing remote networks (corporate VPNs). Common protocols include WireGuard, OpenVPN, and IPsec.',
		analogy:
			'Like a secret underground passage between two buildings — outsiders can\'t see what you\'re carrying or where you\'re really going.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Virtual_private_network',
		category: 'security'
	},
	{
		id: 'payload',
		term: 'Payload',
		definition:
			'The actual data carried inside a {{packet|packet}}, {{frame|frame}}, or message — as opposed to the {{header|headers}} and metadata used for routing and delivery. When you send a web request, the HTTP content is the payload of the [[tcp|TCP]] segment, which is the payload of the IP packet, which is the payload of the Ethernet frame.',
		analogy:
			'Like the contents of a package — the shipping label (header) gets it delivered, but the payload is what you actually ordered.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Payload_(computing)',
		category: 'networking-basics'
	},
	{
		id: 'hop',
		term: 'Hop',
		definition:
			'A single step in the journey of a {{packet|packet}} from source to destination. Each router the packet passes through counts as one hop. The {{ttl|TTL}} field is decremented at each hop to prevent infinite loops. Traceroute works by sending packets with increasing TTL values to discover each hop along the path.',
		analogy:
			'Like stops on a bus route — your packet "hops" from one router to the next until it reaches its destination.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Hop_(networking)',
		category: 'networking-basics'
	},
	{
		id: 'fragmentation',
		term: 'Fragmentation',
		definition:
			'The process of breaking a {{packet|packet}} into smaller pieces when it exceeds the {{mtu|MTU}} (Maximum Transmission Unit) of a network link. Each fragment carries offset information so the destination can reassemble them. IPv4 allows routers to fragment; IPv6 only allows the source host to fragment. Modern practice avoids fragmentation using Path MTU Discovery.',
		analogy:
			'Like cutting a large poster into strips to fit through a mail slot — each strip is labeled so it can be taped back together at the other end.',
		wikiUrl: 'https://en.wikipedia.org/wiki/IP_fragmentation',
		category: 'networking-basics'
	},
	{
		id: 'plaintext',
		term: 'Plaintext / Cleartext',
		definition:
			'Data transmitted without {{encryption|encryption}}, readable by anyone who can intercept the traffic. Protocols like [[ftp|FTP]], early [[http1|HTTP]], and Telnet send credentials and data in plaintext. Modern equivalents use [[tls|TLS]] to encrypt data in transit.',
		analogy:
			'Like writing a message on a postcard — anyone who handles it along the way can read what it says.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Plaintext',
		category: 'security'
	},
	{
		id: 'spoofing',
		term: 'Spoofing',
		definition:
			'Forging the source address or identity in a network communication to impersonate another device. IP spoofing forges the source IP; ARP spoofing sends fake ARP replies to redirect traffic; DNS spoofing returns fake DNS records. A common first step in {{man-in-the-middle|man-in-the-middle}} attacks.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Spoofing_attack',
		category: 'security'
	},
	{
		id: 'man-in-the-middle',
		term: 'Man-in-the-Middle Attack (MITM)',
		definition:
			'An attack where the attacker secretly intercepts and potentially alters communication between two parties who believe they are talking directly to each other. {{spoofing|ARP spoofing}} on a local network is a classic MITM vector. [[tls|TLS]] {{certificate|certificates}} prevent MITM by authenticating the server\'s identity.',
		analogy:
			'Like a postal worker secretly opening, reading, and resealing your letters — both you and the recipient think the envelope was never touched.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Man-in-the-middle_attack',
		category: 'security'
	},
	{
		id: 'port-forwarding',
		term: 'Port Forwarding',
		definition:
			'Redirecting network traffic arriving on a specific {{port|port}} to a different destination address and/or port. Used to make services behind a {{nat|NAT}} accessible from the internet, and by [[ssh|SSH]] tunnels to securely expose remote services locally. Reverse port forwarding works in the opposite direction.',
		analogy:
			'Like a receptionist who forwards calls on extension 80 to a specific office — callers dial the main number, but the call reaches the right person.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Port_forwarding',
		category: 'infrastructure'
	},
	{
		id: 'lease',
		term: 'Lease (DHCP)',
		definition:
			'A temporary assignment of an {{ip-address|IP address}} to a device by a [[dhcp|DHCP]] server. Leases have a duration (typically hours to days); the device must renew before expiry or lose the address. This ensures IP addresses are recycled when devices disconnect.',
		analogy:
			'Like renting an apartment — you get an address for a set time, and you can renew or move out when the lease expires.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol#Operation',
		category: 'infrastructure'
	},
	{
		id: 'load-balancing',
		term: 'Load Balancing',
		definition:
			'Distributing incoming network traffic across multiple servers to improve performance, reliability, and availability. Load balancers can operate at Layer 4 (TCP/UDP — routing by IP and {{port|port}}) or Layer 7 (HTTP — routing by URL, {{header|headers}}, or cookies). Common algorithms include round-robin, least connections, and weighted distribution.',
		analogy:
			'Like a host at a restaurant directing customers to whichever server has the fewest tables — ensuring no single server is overwhelmed.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Load_balancing_(computing)',
		category: 'infrastructure'
	},
	{
		id: 'reverse-proxy',
		term: 'Reverse Proxy',
		definition:
			'A server that sits in front of backend servers and forwards client requests to them. Unlike a regular {{proxy|proxy}} (which acts on behalf of clients), a reverse proxy acts on behalf of servers — handling SSL termination, caching, {{load-balancing|load balancing}}, and compression. Nginx, Cloudflare, and AWS ALB are common reverse proxies.',
		analogy:
			'Like a receptionist at a large company — visitors talk to the receptionist, who routes them to the right department. Visitors never interact with individual employees directly.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Reverse_proxy',
		category: 'infrastructure'
	}
];

const conceptMap = new Map(concepts.map((c) => [c.id, c]));

export function getConceptById(id: string): Concept | undefined {
	return conceptMap.get(id);
}

export function getConceptsByCategory(cat: ConceptCategory): Concept[] {
	return concepts.filter((c) => c.category === cat);
}
