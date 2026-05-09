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
		id: 'congestion-avoidance',
		term: 'Congestion Avoidance',
		definition:
			'The phase of TCP congestion control after slow start ends — the sender grows the congestion window linearly (additive increase, +1 MSS per RTT) instead of exponentially. The "AI" half of AIMD (Additive Increase / Multiplicative Decrease). When loss is detected, the window is cut and the cycle restarts. Defined in Jacobson & Karels (SIGCOMM \'88) and standardised in RFC 5681.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Congestion_avoidance',
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
		id: 'certificate-authority',
		term: 'Certificate Authority (CA)',
		definition:
			'An organisation trusted to issue digital certificates. CAs sign certificates after verifying the requester controls a domain (DV), an organisation (OV), or has been extended-validated (EV). Root CAs are pre-installed in browsers and operating systems; intermediate CAs sign on their behalf so the root key can stay offline. Let\'s Encrypt, DigiCert, Sectigo, GoDaddy, and Google Trust Services issue most public-web certificates.',
		analogy:
			'Like a notary public — a third party that the issuing world has agreed to trust, so a stamp from them means the document is what it claims to be.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Certificate_authority',
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
		id: 'path-mtu-discovery',
		term: 'Path MTU Discovery',
		definition:
			'A technique where a sender probes the path to a destination to find the largest packet size that can traverse it without fragmentation. Sets the Don\'t Fragment flag and watches for ICMP "Fragmentation Needed" messages. When ICMP is filtered (the "MTU black hole"), connections silently hang. RFC 1191 (IPv4) and RFC 8201 (IPv6); RFC 4821 PLPMTUD probes without ICMP.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Path_MTU_Discovery',
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
		id: 'notification',
		term: 'Notification (fire-and-forget)',
		definition:
			'A message sent with no expectation of a response. In JSON-RPC 2.0, a request without an "id" field is a notification — the server processes it but must not reply. Useful for logging, metrics, and progress updates where acknowledgment is unnecessary.',
		wikiUrl: 'https://www.jsonrpc.org/specification#notification',
		category: 'protocol-mechanics'
	},
	{
		id: 'sampling',
		term: 'Sampling (LLM Completion Request)',
		definition:
			'In MCP, a mechanism where the server asks the host to run an LLM completion on its behalf. This lets tool servers leverage the AI model without having direct API access — the host mediates and the user can approve or reject the request.',
		wikiUrl: 'https://modelcontextprotocol.io/docs/concepts/sampling',
		category: 'protocol-mechanics'
	},
	{
		id: 'opacity',
		term: 'Opacity (Agent Design)',
		definition:
			'A design principle where an agent\'s internal reasoning, tool usage, and prompt chains are hidden from external observers. In A2A, agents are opaque — you see their skills and outputs (artifacts), not how they arrive at results. This enables agents from different vendors to interoperate without exposing proprietary logic.',
		wikiUrl: 'https://a2a-protocol.org/latest/topics/key-concepts/',
		category: 'protocol-mechanics'
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
	},

	// ── Networking Basics — additions ──────────────────────────────────
	{
		id: 'mss',
		term: 'MSS (Maximum Segment Size)',
		definition:
			'The largest TCP payload that fits in a single segment without IP fragmentation, advertised in the SYN handshake. Typically MTU − 40 bytes (IPv4 + TCP) or MTU − 60 bytes (IPv6 + TCP).',
		analogy:
			'If MTU is the maximum size of an envelope your post office accepts, MSS is the size of the letter you can stuff inside after subtracting the address labels and stamps.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Maximum_segment_size',
		category: 'networking-basics'
	},
	{
		id: 'default-gateway',
		term: 'Default Gateway',
		definition:
			'The router a host sends packets to when the destination IP is not on its local subnet. Configured per-interface, it is the "exit door" from the local network onto the wider internet.',
		analogy:
			'Like the front desk of an office building — if you do not know which floor someone is on, you take the matter to the front desk and let them route it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Default_gateway',
		category: 'networking-basics'
	},
	{
		id: 'loopback',
		term: 'Loopback',
		definition:
			'The reserved address that always means "this host" — 127.0.0.0/8 in IPv4 (typically 127.0.0.1) and ::1 in IPv6. Packets sent to a loopback address never leave the host; they go straight back up the network stack.',
		analogy: 'Like dialing your own phone number — the call never leaves the building.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Localhost',
		category: 'networking-basics'
	},
	{
		id: 'link-local',
		term: 'Link-Local Address',
		definition:
			'An address valid only on a single network segment (one "link") and never routed beyond it. IPv4 uses 169.254.0.0/16 (assigned automatically when DHCP fails); IPv6 uses fe80::/10 (every IPv6 interface has one by default and uses it for NDP).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Link-local_address',
		category: 'networking-basics'
	},
	{
		id: 'private-ip-address',
		term: 'Private IP Address',
		definition:
			'An IP address from a range reserved for use inside a private network and not routable on the public internet. RFC 1918 defines 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for IPv4; IPv6 uses fc00::/7 for unique local addresses.',
		analogy: 'Like an internal office extension — only people inside the building can dial it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Private_network',
		category: 'networking-basics'
	},
	{
		id: 'public-ip-address',
		term: 'Public IP Address',
		definition:
			'A globally unique, routable IP address assigned by an internet service provider. Anything reachable from the open internet has one (often shared via NAT).',
		category: 'networking-basics'
	},
	{
		id: 'ephemeral-port',
		term: 'Ephemeral Port',
		definition:
			'A short-lived source port the operating system picks for outgoing connections, typically from the range 49152–65535 (IANA), 32768–60999 (Linux), or 49152–65535 (Windows). Each new outbound TCP/UDP connection gets a fresh ephemeral port so multiple connections to the same destination can coexist.',
		analogy:
			"Like the temporary number a delivery driver writes on their clipboard — it's only meaningful for this delivery, not stored anywhere permanent.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Ephemeral_port',
		category: 'networking-basics'
	},
	{
		id: 'well-known-port',
		term: 'Well-Known Port',
		definition:
			'A port number from the range 0–1023, reserved for standardised services and only bindable by privileged processes on Unix-like systems. 80 (HTTP), 443 (HTTPS), 22 (SSH), 53 (DNS), and 25 (SMTP) are well-known ports.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers',
		category: 'networking-basics'
	},
	{
		id: 'half-duplex',
		term: 'Half Duplex',
		definition:
			'A link where only one side may transmit at a time. Original Ethernet on shared coaxial cable was half duplex with collisions handled by CSMA/CD; modern switched Ethernet on point-to-point fibre is full duplex.',
		analogy: 'Like a walkie-talkie: you have to say "over" before the other side can speak.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Duplex_(telecommunications)',
		category: 'networking-basics'
	},
	{
		id: 'mtu-black-hole',
		term: 'MTU Black Hole',
		definition:
			'A failure mode where a network path silently drops packets larger than its MTU because the ICMP "Packet Too Big" messages that would inform the sender are filtered. Path MTU Discovery (PMTUD) breaks; large packets vanish; small ones get through, so it looks intermittent.',
		analogy:
			'Like a low bridge that catches trucks but the warning sign is missing — drivers only learn the bridge is there after their truck disappears.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Path_MTU_Discovery#Problems_with_PMTUD',
		category: 'networking-basics'
	},
	{
		id: 'cgnat',
		term: 'CGNAT (Carrier-Grade NAT)',
		definition:
			'Network Address Translation performed at internet-service-provider scale, mapping many subscribers behind a single public IPv4 address. CGNAT bought IPv4 another decade past exhaustion at the cost of breaking inbound connectivity, complicating peer-to-peer apps, and frustrating abuse-tracing.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Carrier-grade_NAT',
		category: 'networking-basics'
	},
	{
		id: 'nat64',
		term: 'NAT64',
		definition:
			'A translation mechanism (RFC 6146) that lets IPv6-only clients reach IPv4-only servers by rewriting addresses at a stateful gateway. Usually paired with DNS64, which synthesises AAAA records from A records so the client thinks the destination is IPv6. Together with 464XLAT they make IPv6-mostly access networks possible.',
		wikiUrl: 'https://en.wikipedia.org/wiki/NAT64',
		category: 'networking-basics'
	},

	// ── Protocol Mechanics — additions ─────────────────────────────────
	{
		id: 'bdp',
		term: 'BDP (Bandwidth-Delay Product)',
		definition:
			'The amount of data needed in flight to fully utilise a network path: bandwidth × round-trip time. The natural target size for a sender\'s congestion window. A 100 ms × 1 Gbps path has a 12.5 MB BDP.',
		analogy:
			'Like the volume of water needed to fill a hose end-to-end before flow becomes steady — short hose or low pressure means less water; long hose or high pressure means more.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Bandwidth-delay_product',
		category: 'protocol-mechanics'
	},
	{
		id: 'aimd',
		term: 'AIMD (Additive Increase, Multiplicative Decrease)',
		definition:
			"The fairness rule that defined classic TCP congestion control: grow the sending window by a fixed amount each round-trip when things are going well; cut it in half (or worse) the moment loss is detected. Van Jacobson's 1988 paper made this the internet's default behavior.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Additive_increase/multiplicative_decrease',
		category: 'protocol-mechanics'
	},
	{
		id: 'cubic',
		term: 'CUBIC',
		definition:
			'The TCP congestion control algorithm that has been the Linux default since 2.6.19 (2006), Windows default since 2017, and is now Standards Track as RFC 9438 (2023). Replaces AIMD\'s linear ramp with a cubic function of time since the last loss — much friendlier to long fat pipes.',
		wikiUrl: 'https://en.wikipedia.org/wiki/CUBIC_TCP',
		category: 'protocol-mechanics'
	},
	{
		id: 'bbr',
		term: 'BBR (Bottleneck Bandwidth and Round-trip)',
		definition:
			'Google\'s 2016 model-based congestion control. Instead of treating loss as the only signal, BBR estimates the path\'s bottleneck bandwidth and minimum RTT and paces packets to fully use the bandwidth without filling buffers. BBRv3 has been the default for google.com and YouTube since 2023.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#TCP_BBR',
		category: 'protocol-mechanics'
	},
	{
		id: 'l4s',
		term: 'L4S (Low Latency, Low Loss, Scalable)',
		definition:
			'An IETF architecture (RFCs 9330/9331/9332, January 2023) for sub-millisecond queuing latency. Cooperating senders mark every packet ECN-Capable; routers mark instead of drop on incipient congestion; the dual-queue AQM gives L4S traffic priority without starving classic TCP. Comcast launched it in production in January 2025.',
		wikiUrl: 'https://en.wikipedia.org/wiki/L4S',
		category: 'protocol-mechanics'
	},
	{
		id: 'ecn',
		term: 'ECN (Explicit Congestion Notification)',
		definition:
			'IP+TCP bits (RFC 3168) that let routers signal congestion by *marking* packets instead of dropping them, so endpoints can slow down without losing data. The foundation L4S builds on. AccECN (an in-flight TCP extension) widens the feedback channel from one signal per RTT to many.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Explicit_Congestion_Notification',
		category: 'protocol-mechanics'
	},
	{
		id: 'aqm',
		term: 'AQM (Active Queue Management)',
		definition:
			'Algorithms that drop or mark packets in a router\'s queue *before* the queue fills up, signaling senders to slow down early instead of buffering data into seconds of latency. CoDel, FQ-CoDel, PIE, and the L4S DualQ Coupled AQM are modern examples; their absence is why bufferbloat exists.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Active_queue_management',
		category: 'protocol-mechanics'
	},
	{
		id: 'bufferbloat',
		term: 'Bufferbloat',
		definition:
			'The pathological latency caused by oversized buffers in network gear (modems, Wi-Fi APs, cellular base stations). When a buffer fills, every packet behind it waits — and TCP, which only knows about loss, keeps the buffer full. Jim Gettys coined the term at Bell Labs in 2010 after measuring 1.2-second latencies on home links.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Bufferbloat',
		category: 'protocol-mechanics'
	},
	{
		id: 'time-wait',
		term: 'TIME_WAIT',
		definition:
			'The TCP state a socket enters for ~60 seconds (2 × MSL) after an active close, ensuring stray packets from the closed connection do not contaminate a new one with the same four-tuple. A high-frequency client that opens many short-lived connections can exhaust ephemeral ports stuck in TIME_WAIT.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_termination',
		category: 'protocol-mechanics'
	},
	{
		id: 'syn-cookies',
		term: 'SYN Cookies',
		definition:
			"D. J. Bernstein and Eric Schenk's 1996 defense against SYN floods. Instead of allocating server state on each SYN, the server encodes the connection parameters into the initial sequence number it sends back; if the client returns a valid ACK, the server reconstructs the state. No state means no exhaustion.",
		wikiUrl: 'https://en.wikipedia.org/wiki/SYN_cookies',
		category: 'protocol-mechanics'
	},
	{
		id: 'zero-rtt',
		term: '0-RTT (Zero Round-Trip Time)',
		definition:
			'A handshake mode where a client sends application data in its very first packet, before the server has confirmed anything, by reusing keys from a previous session. TLS 1.3 and QUIC both support it. The cost: 0-RTT data has no forward secrecy and weaker replay protection, so it should be limited to idempotent requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_1.3',
		category: 'protocol-mechanics'
	},
	{
		id: 'session-resumption',
		term: 'Session Resumption',
		definition:
			"A handshake shortcut where a returning client and server skip the full key exchange by reusing parameters from a previous session, identified by a session ID or session ticket. Saves an entire round-trip and the cost of asymmetric crypto. Underpins TLS 1.3's 1-RTT and 0-RTT resumption.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#Session_IDs_and_session_tickets',
		category: 'protocol-mechanics'
	},
	{
		id: 'connection-migration',
		term: 'Connection Migration',
		definition:
			"QUIC's ability to keep a connection alive when the client's IP address or port changes — for example, when your phone switches from Wi-Fi to cellular. The connection is identified by an opaque Connection ID rather than the IP/port four-tuple, so the new path just continues the same session.",
		wikiUrl: 'https://en.wikipedia.org/wiki/QUIC',
		category: 'protocol-mechanics'
	},

	// ── Security — additions ───────────────────────────────────────────
	{
		id: 'cryptographic-hash',
		term: 'Cryptographic Hash',
		definition:
			'A one-way function that maps arbitrary input to a fixed-length output (a *digest*) such that finding two inputs with the same digest is computationally infeasible. SHA-256, SHA-384, and BLAKE3 are common modern choices. Distinct from a checksum, which only detects accidental corruption — a cryptographic hash also resists deliberate tampering.',
		analogy:
			"Like a fingerprint of a document — easy to compute, but you can't reconstruct the document from the fingerprint, and finding two different documents with the same fingerprint is essentially impossible.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Cryptographic_hash_function',
		category: 'security'
	},
	{
		id: 'hmac',
		term: 'HMAC (Hash-based MAC)',
		definition:
			'A keyed message authentication code built from a cryptographic hash function (RFC 2104). Both parties share a secret; the sender computes HMAC(key, message) and appends it; the receiver recomputes and verifies. Used inside TLS, JWT (HS256), and the HKDF key-derivation chain.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HMAC',
		category: 'security'
	},
	{
		id: 'aead',
		term: 'AEAD (Authenticated Encryption with Associated Data)',
		definition:
			'A symmetric cipher mode that encrypts and authenticates in one operation, plus binds extra "associated data" (like a packet header) to the ciphertext without encrypting it. AES-GCM, ChaCha20-Poly1305, and AES-CCM are the standard AEADs. TLS 1.3 mandates AEAD; older CBC+HMAC compositions were repeatedly broken (BEAST, Lucky13).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Authenticated_encryption',
		category: 'security'
	},
	{
		id: 'nonce',
		term: 'Nonce',
		definition:
			'A "number used once" — a value (usually random or counter-derived) that must never repeat under the same key. AEAD ciphers like AES-GCM require a unique nonce per message; reusing one is catastrophic and leaks the plaintext. TLS 1.3 derives per-record nonces by XORing the record sequence number into a static IV.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Cryptographic_nonce',
		category: 'security'
	},
	{
		id: 'diffie-hellman',
		term: 'Diffie-Hellman Key Exchange',
		definition:
			'A 1976 protocol that lets two parties agree on a shared secret over an open channel without ever sending the secret itself. Modern implementations use elliptic curves (X25519 is the common choice in TLS 1.3 and QUIC) and provide forward secrecy when both sides generate fresh keys per session (ECDHE).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange',
		category: 'security'
	},
	{
		id: 'ml-kem',
		term: 'ML-KEM (Module-Lattice Key Encapsulation)',
		definition:
			'The lattice-based key-encapsulation mechanism standardised by NIST as FIPS 203 in August 2024 — formerly known as Kyber. Designed to be secure against attacks by quantum computers. Already deployed in TLS 1.3 as the X25519MLKEM768 hybrid (~52% of TLS connections to Cloudflare by end of 2025) and on by default in iOS 26 / macOS Tahoe.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Kyber',
		category: 'security'
	},
	{
		id: 'sni',
		term: 'SNI (Server Name Indication)',
		definition:
			'A TLS extension (RFC 6066) that lets a client tell the server which hostname it wants during the handshake — necessary when one IP address hosts many TLS sites. Historically sent in plaintext, which lets middleboxes and ISPs see which sites you visit; ECH is the fix.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Server_Name_Indication',
		category: 'security'
	},
	{
		id: 'alpn',
		term: 'ALPN (Application-Layer Protocol Negotiation)',
		definition:
			'A TLS extension (RFC 7301) that lets client and server agree on the application protocol — h2 (HTTP/2), h3 (HTTP/3), http/1.1 — during the TLS handshake itself, eliminating an extra round-trip. Why your browser silently picks HTTP/2 or HTTP/3 without you doing anything.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation',
		category: 'security'
	},
	{
		id: 'ech',
		term: 'ECH (Encrypted Client Hello)',
		definition:
			'A TLS extension (RFC 9849, 2025) that encrypts the SNI and other ClientHello fields so eavesdroppers cannot see which site you are visiting. Cloudflare deploys ECH for ~70% of websites it fronts; Chrome and Firefox both support it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Server_Name_Indication#Encrypted_Client_Hello',
		category: 'security'
	},
	{
		id: 'mtls',
		term: 'mTLS (Mutual TLS)',
		definition:
			'A TLS variant where the *client* also presents a certificate during the handshake, so both sides authenticate each other cryptographically — not just the server. Common in service-to-service authentication inside a service mesh, in IoT device fleets, and in some banking APIs.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Mutual_authentication',
		category: 'security'
	},
	{
		id: 'rpki',
		term: 'RPKI (Resource Public Key Infrastructure)',
		definition:
			'A cryptographic system (RFCs 6480, 6482, 8210) that lets an autonomous system prove it is authorised to originate a particular IP prefix. Combined with Route Origin Validation (ROV), routers reject BGP announcements that contradict the published authorisations — mitigating origin hijacks. Crossed 50% of IPv4 prefixes by May 2024.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Resource_Public_Key_Infrastructure',
		category: 'security'
	},
	{
		id: 'syn-flood',
		term: 'SYN Flood',
		definition:
			'A denial-of-service attack that sends many TCP SYN packets without completing the handshake, exhausting the server\'s half-open-connection table. The attack first hit the public internet at Panix in September 1996 and motivated D. J. Bernstein to invent SYN cookies within days.',
		wikiUrl: 'https://en.wikipedia.org/wiki/SYN_flood',
		category: 'security'
	},

	// ── Web — additions ────────────────────────────────────────────────
	{
		id: 'cors',
		term: 'CORS (Cross-Origin Resource Sharing)',
		definition:
			'A browser security mechanism that controls which other origins may call your API and read the response. The server opts in via Access-Control-Allow-Origin headers; for non-simple requests the browser sends a preflight OPTIONS request first. The reason your fetch from a different domain "works in curl but fails in the browser."',
		wikiUrl: 'https://en.wikipedia.org/wiki/Cross-origin_resource_sharing',
		category: 'web'
	},
	{
		id: 'same-origin-policy',
		term: 'Same-Origin Policy',
		definition:
			'The browser\'s foundational security boundary: scripts loaded from one origin (scheme + host + port) cannot read responses from another origin without that origin\'s explicit consent. CORS, document.domain, postMessage, and Cookie SameSite are the carve-outs and escape valves built around it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Same-origin_policy',
		category: 'web'
	},
	{
		id: 'bearer-token',
		term: 'Bearer Token',
		definition:
			'An opaque or signed credential carried in the HTTP Authorization header as `Authorization: Bearer <token>` (RFC 6750). Whoever holds the token can act on behalf of the user — there is no extra signature or proof-of-possession by default. JWT access tokens issued by OAuth 2.0 are typically used as bearer tokens.',
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc6750',
		category: 'web'
	},
	{
		id: 'pkce',
		term: 'PKCE (Proof Key for Code Exchange)',
		definition:
			'An OAuth 2.0 extension (RFC 7636) that protects the authorisation-code flow on public clients (mobile apps, single-page apps) where a client secret cannot be kept private. The client generates a random code-verifier per request, sends its hash up-front, and reveals the verifier when redeeming the code. Mandatory in OAuth 2.1.',
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc7636',
		category: 'web'
	},
	{
		id: 'early-hints',
		term: 'Early Hints (HTTP 103)',
		definition:
			'An HTTP status code (RFC 8297) that lets a server send response headers — typically Link headers for preloading critical resources — *before* the final response is ready. The replacement for HTTP/2 Server Push, which Chrome disabled by default in 2022 and Firefox removed in 2024.',
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103',
		category: 'web'
	},

	// ── Messaging — additions ──────────────────────────────────────────
	{
		id: 'offset',
		term: 'Offset (Message Log)',
		definition:
			'A monotonically increasing position within a partition or topic that identifies a specific message. In Kafka the consumer commits its current offset back to the broker so it can resume after a restart; in event sourcing the offset *is* the version number of the aggregate.',
		wikiUrl: 'https://kafka.apache.org/documentation/#consumerapi',
		category: 'messaging'
	},
	{
		id: 'exactly-once-delivery',
		term: 'Exactly-Once Delivery',
		definition:
			'A messaging guarantee that every message is processed by every interested consumer exactly one time — no loss, no duplicates. End-to-end exactly-once requires deduplication at the consumer plus transactional state, since the network alone cannot prove a message was processed; Kafka provides "exactly-once semantics" within the Kafka cluster via idempotent producers and transactional offsets.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Two_Generals%27_Problem',
		category: 'messaging'
	},
	{
		id: 'at-least-once-delivery',
		term: 'At-Least-Once Delivery',
		definition:
			'A messaging guarantee that every message reaches its consumer one or more times — never zero. The system retries on failure, which means the consumer must be idempotent or it will see duplicates. The most common pragmatic guarantee in real systems.',
		category: 'messaging'
	},
	{
		id: 'idempotent-consumer',
		term: 'Idempotent Consumer',
		definition:
			'A consumer designed so that processing the same message twice produces the same result as processing it once — typically by tracking a deduplication key, using a database UNIQUE constraint, or by writing transactionally with the offset commit. The standard way to make at-least-once delivery feel like exactly-once.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Idempotence',
		category: 'messaging'
	},

	// ── Infrastructure — additions ─────────────────────────────────────
	{
		id: 'service-mesh',
		term: 'Service Mesh',
		definition:
			'An infrastructure layer that handles service-to-service communication for microservices — usually by injecting a sidecar proxy alongside every service, capturing all traffic, and enforcing mTLS, retries, timeouts, traffic shifting, and observability without the application code knowing. Istio, Linkerd, and Consul Connect are common implementations.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Service_mesh',
		category: 'infrastructure'
	},
	{
		id: 'sidecar',
		term: 'Sidecar',
		definition:
			'A helper container deployed alongside an application container in the same pod, sharing its network namespace. The sidecar handles cross-cutting concerns — service-mesh proxying (Envoy), log shipping (Fluent Bit), secret injection — without the application needing to implement them. The dominant pattern in Kubernetes.',
		wikiUrl: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar',
		category: 'infrastructure'
	},
	{
		id: 'health-check',
		term: 'Health Check',
		definition:
			'A periodic probe — typically an HTTP GET or TCP connect — that asks an instance whether it is ready to handle traffic. Load balancers, service meshes, Kubernetes, and orchestrators all use health checks to remove unhealthy instances from rotation. "Liveness" checks ask "are you still alive"; "readiness" checks ask "should you receive traffic right now."',
		category: 'infrastructure'
	},
	{
		id: 'observability',
		term: 'Observability',
		definition:
			'The property that you can answer arbitrary questions about a running system from the outside — typically by combining three signal types: *metrics* (numerical aggregates over time), *logs* (timestamped events), and *traces* (causally-linked spans across services). OpenTelemetry is the standard wire format.',
		analogy:
			'Like the difference between a car\'s dashboard (metrics: a few numbers you watch) and a black-box flight recorder (traces: a complete record you query after the fact). Observability is having both.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Observability_(software)',
		category: 'infrastructure'
	},

	// ── Networking Basics — second wave ────────────────────────────────
	{
		id: 'five-tuple',
		term: 'Five-Tuple',
		definition:
			'The five values that uniquely identify a flow on the internet: source IP, destination IP, source port, destination port, and L4 protocol (TCP/UDP). Routers, firewalls, NATs, and ECMP hashes all key off the 5-tuple. The "4-tuple" drops the protocol and is what TCP uses to identify a connection.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Tuple#Computer_science',
		category: 'networking-basics'
	},
	{
		id: 'asn',
		term: 'ASN (Autonomous System Number)',
		definition:
			'A unique 16- or 32-bit identifier (RFC 6793) for an autonomous system — the unit of inter-domain routing on the internet. AS 32934 is Meta, AS 15169 is Google, AS 13335 is Cloudflare. BGP UPDATE messages carry an AS_PATH attribute listing the ASNs the route has traversed.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Autonomous_system_(Internet)',
		category: 'networking-basics'
	},
	{
		id: 'peering',
		term: 'Peering',
		definition:
			'A bilateral interconnection between two networks where each agrees to exchange traffic destined for the other (and the other\'s customers) at no cost. Distinct from *transit*, where one network pays another for access to the rest of the internet. Public peering happens at IXPs; private peering is direct fibre between two AS edges.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Peering',
		category: 'networking-basics'
	},
	{
		id: 'transit',
		term: 'Transit (Network)',
		definition:
			'A paid relationship where one network buys reachability to the rest of the internet from a larger upstream provider. Tier-1 networks form the top of the hierarchy and have transit-free interconnection with each other; everyone else buys transit from someone.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_transit',
		category: 'networking-basics'
	},
	{
		id: 'ixp',
		term: 'IXP (Internet Exchange Point)',
		definition:
			'A neutral facility where many autonomous systems meet on a shared layer-2 fabric (typically Ethernet) to exchange traffic via BGP without paying transit. AMS-IX, DE-CIX, and LINX move terabits per second. The IXP itself doesn\'t move traffic — it provides the meet-me room and the switch.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_exchange_point',
		category: 'networking-basics'
	},
	{
		id: 'rib-fib',
		term: 'RIB / FIB',
		definition:
			"Two routing tables that look the same but live in different worlds. The Routing Information Base (RIB) is the *control plane*'s view: all known routes from BGP, OSPF, IS-IS, static config. The Forwarding Information Base (FIB) is the *data plane*'s view: the subset of routes the router actually uses, programmed into ASIC TCAM for line-rate lookup.",
		category: 'networking-basics'
	},
	{
		id: 'control-plane-data-plane',
		term: 'Control Plane vs Data Plane',
		definition:
			"The two halves of a router or switch. The *control plane* runs the routing protocols (BGP, OSPF, NDP), builds the RIB, and reacts to topology changes — typically on a general-purpose CPU. The *data plane* forwards packets at line rate using the FIB — typically in ASIC silicon. SDN's contribution was making both programmable.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Forwarding_plane',
		category: 'networking-basics'
	},
	{
		id: 'ndp',
		term: 'NDP (Neighbor Discovery Protocol)',
		definition:
			"IPv6's replacement for ARP plus router discovery, prefix discovery, and Duplicate Address Detection (RFC 4861). Runs over ICMPv6 multicast on the local link. Where ARP broadcasts \"who has 192.0.2.7?\", NDP sends a Neighbor Solicitation to a solicited-node multicast group — much more efficient.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol',
		category: 'networking-basics'
	},
	{
		id: 'slaac',
		term: 'SLAAC (Stateless Address Autoconfiguration)',
		definition:
			"IPv6's mechanism (RFC 4862) for hosts to generate their own globally-unique addresses without a DHCP server. The router advertises a prefix; the host appends an interface identifier (EUI-64 or RFC 7217 stable-private). No server, no lease, no central state.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IPv6#Stateless_address_autoconfiguration_(SLAAC)',
		category: 'networking-basics'
	},
	{
		id: 'dscp',
		term: 'DSCP (Differentiated Services Code Point)',
		definition:
			"A 6-bit field in the IPv4 ToS or IPv6 Traffic Class header (RFC 2474) that classifies a packet's quality-of-service treatment. Common values include EF (Expedited Forwarding, voice), AF41-43 (Assured Forwarding, video), and CS0 (default best-effort). Routers configured for DiffServ enqueue packets into different priority queues based on DSCP.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Differentiated_services',
		category: 'networking-basics'
	},
	{
		id: 'four-six-four-xlat',
		term: '464XLAT',
		definition:
			"An IPv6 transition mechanism (RFC 6877) that lets IPv4-only applications run on IPv6-only access networks. A CLAT on the host translates IPv4 → IPv6; a PLAT (NAT64) at the carrier edge translates IPv6 → IPv4. Modern Android, iOS, macOS, and Windows 11 ship CLAT natively. Why your phone can be IPv6-only without breaking ancient apps.",
		wikiUrl: 'https://en.wikipedia.org/wiki/464XLAT',
		category: 'networking-basics'
	},

	// ── Protocol Mechanics — second wave ───────────────────────────────
	{
		id: 'tcp-rst',
		term: 'TCP RST',
		definition:
			'A TCP packet with the RST flag set, which immediately aborts a connection without the four-way close handshake. Sent when a packet arrives for a closed socket, when a stack rejects a connection attempt, or when an application explicitly aborts. RSTs are the basis of off-path connection-reset attacks (the 2016 CVE-2016-5696 used a side channel in the RST rate-limit counter).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_termination',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-fin',
		term: 'TCP FIN',
		definition:
			"A TCP packet with the FIN flag set, signalling \"I'm done sending data — but I'll keep listening.\" The graceful counterpart to RST. A clean TCP close is a four-way exchange: FIN, ACK, FIN, ACK, with both sides able to half-close independently.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_termination',
		category: 'protocol-mechanics'
	},
	{
		id: 'sack',
		term: 'SACK (Selective Acknowledgment)',
		definition:
			"A TCP option (RFC 2018, 1996) that lets the receiver tell the sender exactly which non-contiguous byte ranges have arrived — instead of the cumulative ACK only saying \"I have everything up to byte N.\" Lets the sender retransmit only what's missing, dramatically improving recovery on lossy paths. Universally supported.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Selective_acknowledgments',
		category: 'protocol-mechanics'
	},
	{
		id: 'window-scale',
		term: 'Window Scale',
		definition:
			"A TCP option (RFC 7323) that lets the 16-bit receive window field represent values up to 2³⁰ bytes by left-shifting it during the handshake. Without window scale, a single TCP connection caps at 64 KB in flight — fine in 1981, far too little for a 10 Gbps × 100 ms BDP. Negotiated only in the SYN handshake, never midstream.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_window_scale_option',
		category: 'protocol-mechanics'
	},
	{
		id: 'nagle',
		term: "Nagle's Algorithm",
		definition:
			"A 1984 sender-side rule (RFC 896) that holds back small writes until either the previous data is ACKed or a full segment is ready, to avoid flooding the network with tiny packets. Saved early networks; today it interacts pathologically with delayed ACKs and is the reason TCP_NODELAY exists.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Nagle%27s_algorithm',
		category: 'protocol-mechanics'
	},
	{
		id: 'delayed-ack',
		term: 'Delayed ACK',
		definition:
			"A receiver-side optimisation (RFC 1122 §4.2.3.2) that batches ACKs by waiting up to ~200 ms in case more data or an outgoing packet can carry the ACK. Combined with Nagle's algorithm on the sender, this can produce 200 ms request-response latencies on otherwise instant networks — the classic interactive-app footgun.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_delayed_acknowledgment',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-fast-open',
		term: 'TCP Fast Open',
		definition:
			'A TCP extension (RFC 7413, 2014) that lets a returning client send application data inside the SYN, using a server-issued cookie to authenticate. Saves an entire round-trip for repeat connections. ~5% middlebox failure rate on the public internet — a key reason QUIC ended up on UDP instead of as another TCP option.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_Fast_Open',
		category: 'protocol-mechanics'
	},
	{
		id: 'initial-cwnd',
		term: 'Initial cwnd',
		definition:
			"The number of segments a TCP sender may put in flight before receiving the first ACK. RFC 6928 (2013) raised it from 3-4 to 10 (≈14,600 bytes), shaving an entire round-trip off small-page loads. Some CDNs go higher. The reason a fresh connection's first burst can saturate a 100 Mbps link before the server has heard back.",
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc6928',
		category: 'protocol-mechanics'
	},
	{
		id: 'pacing',
		term: 'Pacing',
		definition:
			"Spreading outgoing packets evenly over time instead of sending them in a burst. BBR paces every send to exactly the estimated bottleneck bandwidth, which avoids triggering AQM drops and minimises queue buildup. Linux pacing is implemented in the FQ qdisc — BBR depends on it.",
		category: 'protocol-mechanics'
	},
	{
		id: 'one-rtt',
		term: '1-RTT (One Round-Trip Time)',
		definition:
			"A handshake mode where application data flows after exactly one round-trip — the client's first flight reaches the server, the server's reply reaches the client, and then the client can send. TLS 1.3 and QUIC achieve 1-RTT for new connections; with session resumption they fall to 0-RTT for repeat visitors.",
		category: 'protocol-mechanics'
	},

	// ── Security — second wave ─────────────────────────────────────────
	{
		id: 'salt',
		term: 'Salt',
		definition:
			"Random data mixed with a password before hashing so identical passwords produce different stored hashes — defeating precomputed rainbow tables. Modern password hashing (argon2, bcrypt, scrypt) salts internally. Distinct from a *nonce*, which prevents key reuse rather than precomputation.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Salt_(cryptography)',
		category: 'security'
	},
	{
		id: 'kdf',
		term: 'KDF / HKDF (Key Derivation Function)',
		definition:
			"A function that turns a single high-entropy input — the (EC)DHE shared secret, a master key, a password — into a tree of named, application-specific keys. HKDF (RFC 5869) is the HMAC-based KDF that powers TLS 1.3's key schedule and most modern protocols. Its job: ensure that compromising one derived key doesn't compromise the others.",
		wikiUrl: 'https://en.wikipedia.org/wiki/HKDF',
		category: 'security'
	},
	{
		id: 'iv',
		term: 'IV (Initialization Vector)',
		definition:
			"A non-secret value that randomises the starting state of a block cipher mode so encrypting the same plaintext twice produces different ciphertext. CBC requires an unpredictable IV; GCM uses a 96-bit nonce as IV. Reusing an IV under the same key in GCM is catastrophic (it leaks the authentication key).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Initialization_vector',
		category: 'security'
	},
	{
		id: 'ocsp-crl',
		term: 'OCSP / CRL (Certificate Revocation)',
		definition:
			"Two mechanisms for telling clients a certificate has been revoked before its expiry. CRLs are large signed lists the client downloads periodically; OCSP (RFC 6960) is a per-certificate online query. Both are unreliable in practice — clients soft-fail when the responder is unreachable — which is why short certificate lifetimes are replacing revocation as the primary defence.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol',
		category: 'security'
	},
	{
		id: 'certificate-transparency',
		term: 'Certificate Transparency',
		definition:
			"A system (RFC 9162) where every publicly-trusted TLS certificate is logged to append-only Merkle-tree logs that anyone can audit. Browsers reject certificates that aren't logged, so a CA cannot quietly mis-issue a certificate for a domain — the domain owner will see it. Crt.sh is a popular search interface.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Certificate_Transparency',
		category: 'security'
	},
	{
		id: 'bgp-hijack',
		term: 'BGP Hijack',
		definition:
			"A BGP announcement that originates a prefix the announcer is not authorised to originate, or claims a more-specific prefix that wins under longest-prefix match. Pakistan Telecom's 2008 announcement of YouTube's /24 took YouTube offline globally for two hours; the 2018 MyEtherWallet hijack stole ~$150K in crypto. RPKI ROV mitigates origin hijacks; ASPA mitigates path hijacks.",
		wikiUrl: 'https://en.wikipedia.org/wiki/BGP_hijacking',
		category: 'security'
	},
	{
		id: 'route-leak',
		term: 'Route Leak',
		definition:
			"A BGP route announcement that propagates outside its agreed policy boundary — typically a customer accidentally announcing all its provider's routes back to other providers, turning itself into a transit AS for the entire internet. RFC 7908 catalogues six types. The 1997 AS 7007 incident and the 2019 Verizon/Cloudflare leak are textbook examples.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Route_leak',
		category: 'security'
	},
	{
		id: 'rov',
		term: 'ROV (Route Origin Validation)',
		definition:
			"The runtime check a router performs against RPKI: for each BGP UPDATE, verify that the originating AS is authorised to announce the prefix. Result is *Valid*, *Invalid*, or *NotFound*. Most large transit providers drop *Invalid*. Pairs with RPKI as the deployment mechanism that stopped the YouTube-class hijack.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Resource_Public_Key_Infrastructure#Route_Origin_Validation',
		category: 'security'
	},
	{
		id: 'aspa',
		term: 'ASPA (Autonomous System Provider Authorization)',
		definition:
			"An emerging RPKI extension (draft-ietf-sidrops-aspa-verification, expected to publish 2026) where each AS publishes a signed list of its upstream providers. Routers can then detect path hijacks and route leaks by checking that each AS_PATH segment matches the customer-provider hierarchy. The pragmatic alternative to BGPsec.",
		wikiUrl: 'https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/',
		category: 'security'
	},
	{
		id: 'replay-attack',
		term: 'Replay Attack',
		definition:
			"Capturing a valid message and re-sending it later to trick the recipient into accepting it as fresh. Defeated with nonces, timestamps, sequence numbers, or single-use tokens. TLS 1.3's 0-RTT data has limited replay protection by design — which is why it should be restricted to idempotent requests like GETs.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Replay_attack',
		category: 'security'
	},

	// ── Web — second wave ──────────────────────────────────────────────
	{
		id: 'etag',
		term: 'ETag',
		definition:
			"An opaque token an HTTP server sends in a response header that identifies a specific version of a resource. The client sends it back in If-None-Match on the next request; if the resource hasn't changed, the server returns 304 Not Modified with no body. The cheapest possible cache-validation round-trip.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag',
		category: 'web'
	},
	{
		id: 'cache-control',
		term: 'Cache-Control',
		definition:
			"The HTTP header (RFC 9111) that tells caches — both the browser and any intermediate CDN/proxy — how to handle a response. Common directives: max-age=N (cache for N seconds), no-cache (must revalidate), no-store (don't cache at all), public/private, immutable (never revalidate, even on reload). The single most important header for web performance.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control',
		category: 'web'
	},
	{
		id: 'cookie',
		term: 'Cookie',
		definition:
			"A small key-value pair the server stores on the client via Set-Cookie and the client returns on every subsequent request to the same origin. Modern attributes: Secure (HTTPS only), HttpOnly (not visible to JavaScript), SameSite (Strict/Lax/None — controls cross-site sending), Domain, Path, Max-Age. Cookies underpin sessions, auth, tracking, and most XSS/CSRF concerns.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies',
		category: 'web'
	},
	{
		id: 'hsts',
		term: 'HSTS (HTTP Strict Transport Security)',
		definition:
			"A response header (RFC 6797) that tells the browser \"only ever connect to this domain over HTTPS, for the next N seconds.\" After the first visit, plaintext HTTP requests are upgraded automatically — defeating SSL-stripping attacks. Browsers also ship a preload list (hstspreload.org) so the very first visit is protected too.",
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security',
		category: 'web'
	},
	{
		id: 'csp',
		term: 'CSP (Content Security Policy)',
		definition:
			"A response header that tells the browser which sources of script, style, image, font, and connection are allowed for the page. A strict CSP (script-src 'self' with nonces) is the modern defence against XSS — even if an attacker injects a <script> tag, the browser refuses to execute it.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
		category: 'web'
	},
	{
		id: 'http2-stream',
		term: 'HTTP/2 Stream',
		definition:
			"A bidirectional sequence of HTTP/2 frames within a single TCP connection, identified by a stream ID. Each request-response pair is one stream; many streams interleave their frames over the same connection. Eliminates HTTP/1.1's connection-per-request overhead — but a single TCP packet loss still stalls all streams, the limitation HTTP/3 fixed.",
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc9113#name-streams-and-multiplexing',
		category: 'web'
	},
	{
		id: 'webtransport',
		term: 'WebTransport',
		definition:
			"A modern client-server transport API for browsers (W3C Working Draft, IETF draft-ietf-webtrans-http3) running over HTTP/3. Provides multiplexed reliable streams plus unreliable datagrams — what WebSocket would look like if redesigned in 2024. Targeted for completion late 2026 or early 2027.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API',
		category: 'web'
	},
	{
		id: 'masque',
		term: 'MASQUE',
		definition:
			"An IETF working group standardising proxy protocols on top of HTTP/3 — CONNECT-IP (tunnel any L3 traffic), CONNECT-UDP (proxy UDP, used by HTTP/3-over-HTTP/3), CONNECT-Ethernet. The technology behind iCloud Private Relay and Cloudflare WARP: arbitrary IP traffic tunnelled inside what looks like normal HTTPS.",
		wikiUrl: 'https://datatracker.ietf.org/wg/masque/about/',
		category: 'web'
	},

	// ── Messaging — second wave ────────────────────────────────────────
	{
		id: 'at-most-once-delivery',
		term: 'At-Most-Once Delivery',
		definition:
			'A messaging guarantee where a message is delivered zero or one times — never duplicated. The sender does not retry on failure. The right choice for telemetry where occasional loss is acceptable but reprocessing is not (e.g., metrics counters that would over-count on duplicate).',
		category: 'messaging'
	},
	{
		id: 'routing-key',
		term: 'Routing Key',
		definition:
			"In AMQP, a string the producer attaches to a message that the exchange uses to decide which queues receive it. With a *direct* exchange the routing key matches a queue exactly; with a *topic* exchange it's a dotted pattern (`logs.error.*`); with a *fanout* exchange it's ignored.",
		wikiUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts.html',
		category: 'messaging'
	},
	{
		id: 'last-will',
		term: 'Last Will (MQTT)',
		definition:
			"A message a client tells the MQTT broker to publish on its behalf if the client disconnects ungracefully. Lets every other subscriber learn immediately when a sensor goes offline — without polling — even though the failed sensor cannot send anything itself.",
		wikiUrl: 'https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html',
		category: 'messaging'
	},
	{
		id: 'retained-message',
		term: 'Retained Message (MQTT)',
		definition:
			"A message the MQTT broker holds onto for a topic and immediately delivers to any new subscriber. Lets a late-joining subscriber learn the current state of the world (e.g., the last reading from a sensor) without waiting for the next publish.",
		wikiUrl: 'https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html',
		category: 'messaging'
	},
	{
		id: 'log-compaction',
		term: 'Log Compaction (Kafka)',
		definition:
			"A Kafka retention policy that, instead of deleting old records by age, keeps the most recent value for each key. Lets a topic act as an event log that doubles as a snapshot — a new consumer can read from offset 0 and end up with the current state of every key, just slowly.",
		wikiUrl: 'https://kafka.apache.org/documentation/#compaction',
		category: 'messaging'
	},
	{
		id: 'replication-factor',
		term: 'Replication Factor',
		definition:
			"How many copies of each piece of data a distributed system stores. In Kafka, a topic's replication factor is how many brokers hold a copy of each partition; you can lose (factor − 1) brokers without data loss. In Cassandra / DynamoDB it's the analogous concept for keyspaces / tables.",
		wikiUrl: 'https://kafka.apache.org/documentation/#replication',
		category: 'messaging'
	},

	// ── Infrastructure — second wave ───────────────────────────────────
	{
		id: 'edge-origin',
		term: 'Edge / Origin',
		definition:
			"Two ends of a CDN. The *origin* is your authoritative server (where content lives, where dynamic logic runs). The *edge* is the CDN's many points-of-presence around the world, close to users. A request hits the nearest edge first; if the edge has the content cached it serves from there, otherwise it fetches from origin and caches the result.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Content_delivery_network',
		category: 'infrastructure'
	},
	{
		id: 'cache-hit-miss',
		term: 'Cache Hit / Cache Miss',
		definition:
			"The two outcomes of a cache lookup. A *hit* finds the value in cache and returns it instantly. A *miss* doesn't, fetches from the slow source, and (usually) writes the result back to cache so the next request hits. Cache hit ratio is the dominant performance lever for CDNs, databases, and CPU L1 alike.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Cache_(computing)',
		category: 'infrastructure'
	},
	{
		id: 'service-discovery',
		term: 'Service Discovery',
		definition:
			"The mechanism by which a service finds the network address of another service it depends on, when those addresses change frequently. Implementations include DNS (with short TTLs), Consul/etcd (key-value lookup), Kubernetes Services (a stable DNS name in front of changing pod IPs), and the service mesh (the sidecar handles it).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Service_discovery',
		category: 'infrastructure'
	},
	{
		id: 'circuit-breaker',
		term: 'Circuit Breaker',
		definition:
			"A resilience pattern where calls to a failing dependency are short-circuited (fail-fast with a fallback) instead of waiting for timeouts. Three states: *closed* (calls flow), *open* (calls fail immediately), *half-open* (a few probe calls test recovery). Prevents one slow dependency from saturating thread pools and cascading the failure.",
		analogy: 'Like the breaker in your house — it trips when something downstream is in trouble, protecting the rest of the circuit until you fix it.',
		wikiUrl: 'https://martinfowler.com/bliki/CircuitBreaker.html',
		category: 'infrastructure'
	},
	{
		id: 'exponential-backoff',
		term: 'Exponential Backoff',
		definition:
			"A retry strategy where the wait between attempts doubles each time, ideally with random jitter. After a transient failure, attempt 1 waits 100 ms, attempt 2 waits 200 ms, then 400 ms, 800 ms, etc. Without jitter, many clients all retry at the same instant after a shared outage and create a thundering herd.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Exponential_backoff',
		category: 'infrastructure'
	},
	{
		id: 'rate-limiting',
		term: 'Rate Limiting',
		definition:
			"A server-side mechanism that caps how many requests a client may make in a time window — by IP, API key, user, or tenant. Token bucket and leaky bucket are the standard algorithms. The HTTP response is 429 Too Many Requests, ideally with a Retry-After header naming when to try again.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Rate_limiting',
		category: 'infrastructure'
	},
	{
		id: 'slo-sli-sla',
		term: 'SLO / SLI / SLA',
		definition:
			"Three nested concepts from Google\'s SRE practice. An *SLI* (Service Level Indicator) is a measurement (e.g., 99th-percentile latency). An *SLO* (Objective) is the target you set for it (\"99.9% of requests under 200 ms over 30 days\"). An *SLA* (Agreement) is the externally-promised version with consequences if missed. The gap between an SLO and an SLA is your error budget.",
		wikiUrl: 'https://sre.google/sre-book/service-level-objectives/',
		category: 'infrastructure'
	},
	{
		id: 'tail-latency',
		term: 'Tail Latency (p99, p999)',
		definition:
			"The high-percentile latencies that dominate user experience but disappear in averages. p99 is \"99% of requests are at least this fast\" — and at internet scale every user hits p99+ multiple times per session. Jeff Dean and Luiz Barroso\'s 2013 paper \"The Tail at Scale\" is the canonical text.",
		wikiUrl: 'https://research.google/pubs/the-tail-at-scale/',
		category: 'infrastructure'
	},
	{
		id: 'trace-span',
		term: 'Trace / Span',
		definition:
			"The distributed-tracing data model. A *trace* represents one request\'s end-to-end journey. Each unit of work along the way (an HTTP call, a database query, a queue publish) is a *span* with a start time, end time, and a parent span. Spans form a tree across services. OpenTelemetry is the standard wire format; Jaeger, Tempo, and Zipkin are common UIs.",
		wikiUrl: 'https://opentelemetry.io/docs/concepts/signals/traces/',
		category: 'infrastructure'
	},
	{
		id: 'availability-zone',
		term: 'Region / Availability Zone',
		definition:
			"Cloud-provider terminology for failure domains. A *region* is a geographic area (us-east-1, eu-west-2) with its own user-facing endpoints. An *availability zone* is one or more datacenters within a region with independent power, cooling, and networking — designed so a single AZ failure does not take down the others. \"Multi-AZ\" is the minimum production resilience bar.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Availability_zone',
		category: 'infrastructure'
	}
];

export const conceptMap = new Map(concepts.map((c) => [c.id, c]));

export function getConceptById(id: string): Concept | undefined {
	return conceptMap.get(id);
}

export function getConceptsByCategory(cat: ConceptCategory): Concept[] {
	return concepts.filter((c) => c.category === cat);
}
