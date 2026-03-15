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
			'Like a serial number stamped on your network card at the factory — it never changes and uniquely identifies the hardware.',
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
	}
];

const conceptMap = new Map(concepts.map((c) => [c.id, c]));

export function getConceptById(id: string): Concept | undefined {
	return conceptMap.get(id);
}

export function getConceptsByCategory(cat: ConceptCategory): Concept[] {
	return concepts.filter((c) => c.category === cat);
}
