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
	// ── Historical / Institutional ─────────────────────────────────────
	{
		id: 'arpanet',
		term: 'ARPANET',
		definition:
			'The DARPA-funded packet-switched research network that ran from 1969 to 1990. First message sent UCLA → SRI on Oct 29 1969; switched from {{ncp|NCP}} to [[tcp|TCP]]/[[ip|IP]] on Flag Day, Jan 1 1983. The direct ancestor of the modern internet.',
		analogy:
			'The first long-distance group chat — a handful of universities and labs taking turns on a few cables, with {{bbn|BBN}} running the switchboard.',
		wikiUrl: 'https://en.wikipedia.org/wiki/ARPANET',
		category: 'networking-basics'
	},
	{
		id: 'ncp',
		term: 'NCP (Network Control Program)',
		definition:
			"ARPANET's original host-to-host protocol, in service 1970–1982. Welded to {{arpanet|ARPANET}} hardware — every node had to be an ARPANET node, with no way to bridge to other networks. Replaced by [[tcp|TCP]]/[[ip|IP]] on {{flag-day-1983|Flag Day}}, January 1 1983, when the network cut over wholesale.",
		analogy:
			'A walkie-talkie protocol that only works on one brand of radio. The moment you want to talk to a phone or a satellite, you need something new.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Network_Control_Protocol_(ARPANET)',
		category: 'networking-basics'
	},
	{
		id: 'imp',
		term: 'IMP (Interface Message Processor)',
		definition:
			"The refrigerator-sized minicomputers (modified Honeywell DDP-516s) built by {{bbn|BBN}} that served as {{arpanet|ARPANET}}'s first routers. The IMP at UCLA processed the very first ARPANET message on October 29, 1969 — the network's \"Hello World.\"",
		analogy:
			'The original router, but the size of a wardrobe and humming loud enough to fill a room.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Interface_Message_Processor',
		category: 'networking-basics'
	},
	{
		id: 'ietf',
		term: 'IETF (Internet Engineering Task Force)',
		definition:
			'The open, volunteer-run standards body that has shepherded internet protocols since 1986. Standards are published as RFCs and the motto is "rough consensus and running code." No membership fees, no votes — anyone with technical merit and patience can drive a spec to publication.',
		analogy:
			'An open-source community for the wire — instead of code, they ship the rules every device on earth has to agree on.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force',
		category: 'infrastructure'
	},
	{
		id: 'darpa',
		term: 'DARPA',
		definition:
			"Defense Advanced Research Projects Agency. The US DoD research arm whose 1960s funding birthed {{arpanet|ARPANET}} and whose 1970s contracts paid for the design of [[tcp|TCP]]/[[ip|IP]]. ARPA → DARPA → ARPA → DARPA in the renaming wars; the work didn't stop.",
		analogy:
			'The patient money that wrote the cheque before "the internet" was a thing anyone could explain to a senator.',
		wikiUrl: 'https://en.wikipedia.org/wiki/DARPA',
		category: 'infrastructure'
	},
	{
		id: 'bbn',
		term: 'BBN (Bolt, Beranek and Newman)',
		definition:
			"The Cambridge, Mass. consultancy that won the {{arpanet|ARPANET}} hardware contract in 1968 and built the {{imp|IMPs}}. BBN also wrote the first @-sign email program ([[pioneer:ray-tomlinson|Ray Tomlinson]], 1971) and much of the early internet plumbing. Now part of RTX (Raytheon Technologies).",
		analogy:
			'The Skunk Works of early networking — small team, contract by contract, no glamour, all of the foundations.',
		wikiUrl: 'https://en.wikipedia.org/wiki/BBN_Technologies',
		category: 'infrastructure'
	},
	{
		id: 'iana',
		term: 'IANA (Internet Assigned Numbers Authority)',
		definition:
			'The function (not an organization) responsible for assigning unique numbers used by internet protocols — [[ip|IP]] address blocks, AS numbers, well-known port numbers, MIME types, character sets. Run single-handedly by [[pioneer:jon-postel|Jon Postel]] from his ISI office for over a decade; now operated by {{icann|ICANN}}.',
		analogy:
			'The phone directory that prevents two countries from claiming the same area code.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority',
		category: 'infrastructure'
	},
	{
		id: 'icann',
		term: 'ICANN',
		definition:
			"Internet Corporation for Assigned Names and Numbers. The non-profit incorporated in 1998 that took over the {{iana|IANA}} functions from [[pioneer:jon-postel|Jon Postel]]'s office. Coordinates the global [[dns|DNS]] root, the [[ip|IP]] address allocation system, and the policy process for generic top-level domains.",
		analogy:
			'The committee that runs the global address book — boring, essential, periodically very political.',
		wikiUrl: 'https://en.wikipedia.org/wiki/ICANN',
		category: 'infrastructure'
	},
	{
		id: 'w3c',
		term: 'W3C (World Wide Web Consortium)',
		definition:
			'The standards body for the web, founded by [[pioneer:tim-berners-lee|Tim Berners-Lee]] in 1994 and hosted by MIT (and partners). Publishes the specs for HTML, CSS, the DOM, and dozens of related web technologies. Where the {{ietf|IETF}} does wire formats, the W3C does the layers above HTTP.',
		analogy:
			'{{ietf|IETF}} runs the rails, W3C runs the trains.',
		wikiUrl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
		category: 'web'
	},
	{
		id: 'isoc',
		term: 'ISOC (Internet Society)',
		definition:
			'Non-profit founded in 1992 to provide an organizational home for the {{ietf|IETF}} and to advocate for open internet policy worldwide. Funds the IETF Trust, supports the IRTF research arm, and runs programs on internet access, encryption, and routing security.',
		analogy:
			'The fiscal sponsor and policy lobby for the people who actually write the protocols.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Society',
		category: 'infrastructure'
	},
	{
		id: 'xerox-parc',
		term: 'Xerox PARC',
		definition:
			'Palo Alto Research Center. The Xerox-funded lab that invented [[ethernet|Ethernet]] (1973, [[pioneer:bob-metcalfe|Bob Metcalfe]] & [[pioneer:david-boggs|David Boggs]]), the laser printer, the GUI, the mouse-driven workstation, and most of personal computing as we know it. Famously bad at commercializing its own breakthroughs.',
		analogy:
			'The garage where most of modern computing was prototyped, before everyone else turned the prototypes into companies.',
		wikiUrl: 'https://en.wikipedia.org/wiki/PARC_(company)',
		category: 'infrastructure'
	},
	{
		id: 'flag-day-1983',
		term: 'Flag Day (Jan 1 1983)',
		definition:
			'January 1, 1983 — the day {{arpanet|ARPANET}} cut over from {{ncp|NCP}} to [[tcp|TCP]]/[[ip|IP]] wholesale, with no fallback. Sites scrambled to ship working [[tcp|TCP]]/[[ip|IP]] stacks before the deadline; lots of email was sent in the months prior begging operators to test their code. The day the internet, as we know it, technically began.',
		analogy:
			"A continent-wide phone-number switchover with no extensions. Everyone moves at midnight or you're unreachable.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Flag_day_(computing)#1983_NCP/TCP_transition',
		category: 'networking-basics'
	},

	// ── Networking Basics ──────────────────────────────────────────────
	{
		id: 'ip-address',
		term: 'IP Address',
		definition:
			'A unique numerical label assigned to every device on a network, used to route data to the correct destination. [[ip|IPv4]] uses 32 bits (e.g., 192.168.1.1); [[ipv6|IPv6]] uses 128 bits.',
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
			'The practical 4-layer model the internet actually uses: Link, Internet, Transport, and Application. Simpler than OSI, it maps directly to real protocols like [[ethernet|Ethernet]], [[ip|IP]], [[tcp|TCP]], and HTTP.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_protocol_suite',
		category: 'networking-basics'
	},
	{
		id: 'port',
		term: 'Port',
		definition:
			'A 16-bit number (0–65535) that identifies a specific process or service on a machine. Combined with an [[ip|IP]] address, it lets multiple applications share one network connection.',
		analogy:
			'If the [[ip|IP]] address is the building address, the port is the apartment number — it gets data to the right application inside the machine.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Port_(computer_networking)',
		category: 'networking-basics'
	},
	{
		id: 'socket',
		term: 'Socket',
		definition:
			'An endpoint for network communication, defined by the combination of an [[ip|IP]] address, a port number, and a protocol ([[tcp|TCP]] or [[udp|UDP]]). A connection is identified by a pair of sockets.',
		analogy:
			'Like a phone plug — it combines the phone number ([[ip|IP]]), extension (port), and line type ([[tcp|TCP]]/[[udp|UDP]]) into one connection point.',
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
			'A self-contained, independently-routed packet with no guarantee of delivery, ordering, or duplication prevention. [[udp|UDP]] sends datagrams; [[tcp|TCP]] sends segments over a connection.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Datagram',
		category: 'networking-basics'
	},
	{
		id: 'segment',
		term: 'Segment',
		definition:
			'The unit of data at the Transport layer (Layer 4). A [[tcp|TCP]] segment contains a header with sequence numbers, flags, and checksums, plus the application data payload.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure',
		category: 'networking-basics'
	},
	{
		id: 'frame',
		term: 'Frame',
		definition:
			'The unit of data at the Data Link layer (Layer 2). An [[ethernet|Ethernet]] frame wraps an [[ip|IP]] packet with source/destination MAC addresses and a checksum (FCS).',
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
			'A communication pattern where every participant is both client and server. Nodes connect directly to each other without a central server. Used in BitTorrent, [[webrtc|WebRTC]], and blockchain.',
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
			'The time for a signal to travel from sender to receiver and back. A [[tcp|TCP]] handshake takes 1 RTT. [[tls|TLS]] 1.3 adds 1 RTT. Each round trip adds latency before data can flow.',
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
			'An automated negotiation process at the start of a connection. [[tcp|TCP]] uses a three-way handshake (SYN → SYN-ACK → ACK); [[tls|TLS]] adds a handshake to agree on encryption parameters.',
		analogy:
			'Like introducing yourself before a conversation — "Hi, I want to talk" → "Sure, let\'s talk" → "Great, here we go."',
		wikiUrl: 'https://en.wikipedia.org/wiki/Handshaking',
		category: 'networking-basics'
	},
	{
		id: 'connection-oriented',
		term: 'Connection-Oriented',
		definition:
			'A communication mode where a dedicated connection is established before data transfer (e.g., [[tcp|TCP]]). Provides ordering, reliability, and flow control, but adds overhead.',
		analogy:
			'Like a phone call — you dial, wait for the other person to pick up, then talk. The connection is maintained throughout.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Connection-oriented_communication',
		category: 'networking-basics'
	},
	{
		id: 'connectionless',
		term: 'Connectionless',
		definition:
			'A communication mode where each packet is sent independently with no prior setup or guaranteed delivery (e.g., [[udp|UDP]]). Faster and simpler, but no ordering or reliability guarantees.',
		analogy: 'Like sending postcards — each one travels independently and might arrive out of order.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Connectionless_communication',
		category: 'networking-basics'
	},
	{
		id: 'encapsulation',
		term: 'Encapsulation',
		definition:
			'The process of wrapping data with protocol headers as it moves down the network stack. Application data becomes a [[tcp|TCP]] segment, then an [[ip|IP]] packet, then an [[ethernet|Ethernet]] frame.',
		analogy:
			'Like nesting envelopes — your letter goes in an envelope with the apartment number (port), then into a larger envelope with the street address ([[ip|IP]]), then into a postal bag ([[ethernet|Ethernet]] frame).',
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
			'A mechanism that prevents a fast sender from overwhelming a slow receiver. [[tcp|TCP]] uses a sliding window: the receiver advertises how much buffer space it has, and the sender limits itself accordingly.',
		analogy:
			'Like a waiter checking if you are ready for the next course before bringing it — no point serving food faster than you can eat.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Flow_control_(data)',
		category: 'protocol-mechanics'
	},
	{
		id: 'congestion-control',
		term: 'Congestion Control',
		definition:
			'Algorithms that detect and respond to network congestion. [[tcp|TCP]] starts slow (slow start), probes for available bandwidth, and backs off when packet loss signals congestion. Key algorithms: Tahoe, Reno, CUBIC, BBR.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control',
		category: 'protocol-mechanics'
	},
	{
		id: 'congestion-avoidance',
		term: 'Congestion Avoidance',
		definition:
			'The phase of [[tcp|TCP]] congestion control after slow start ends — the sender grows the congestion window linearly (additive increase, +1 MSS per RTT) instead of exponentially. The "AI" half of AIMD (Additive Increase / Multiplicative Decrease). When loss is detected, the window is cut and the cycle restarts. Defined in Jacobson & Karels (SIGCOMM \'88) and standardised in [[rfc:5681|RFC 5681]].',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Congestion_avoidance',
		category: 'protocol-mechanics'
	},
	{
		id: 'multiplexing',
		term: 'Multiplexing',
		definition:
			'Combining multiple independent data streams over a single connection. [[http2|HTTP/2]] multiplexes many requests over one [[tcp|TCP]] connection; [[quic|QUIC]] does it over [[udp|UDP]]. Eliminates head-of-line blocking between streams.',
		analogy:
			'Like a highway with multiple lanes — many conversations (streams) share the same road (connection) without blocking each other.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Multiplexing',
		category: 'protocol-mechanics'
	},
	{
		id: 'head-of-line-blocking',
		term: 'Head-of-Line Blocking',
		definition:
			'When a single delayed packet blocks all packets behind it, even if they belong to independent streams. [[tcp|TCP]] suffers from this because it guarantees in-order delivery. [[quic|QUIC]] solves it with per-stream ordering.',
		analogy:
			'Like a grocery store with one checkout line — if the first person takes forever, everyone behind waits, even if their items are ready.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Head-of-line_blocking',
		category: 'protocol-mechanics'
	},
	{
		id: 'keep-alive',
		term: 'Keep-Alive',
		definition:
			'A mechanism to reuse an existing connection for multiple requests instead of opening a new one each time. [[http1|HTTP/1.1]] defaults to keep-alive, saving the overhead of repeated [[tcp|TCP]] handshakes.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP_persistent_connection',
		category: 'protocol-mechanics'
	},
	{
		id: 'retransmission',
		term: 'Retransmission',
		definition:
			'When a sender detects that a packet was lost (via timeout or duplicate ACKs), it sends the packet again. [[tcp|TCP]] handles this automatically; [[udp|UDP]] does not — applications must implement their own retry logic.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Retransmission_(data_networks)',
		category: 'protocol-mechanics'
	},
	{
		id: 'ack',
		term: 'ACK (Acknowledgment)',
		definition:
			'A message sent by the receiver to confirm that data was received successfully. [[tcp|TCP]] uses cumulative ACKs ("I got everything up to byte 5000") and selective ACKs for efficiency.',
		analogy:
			'Like a read receipt on a text message — it tells the sender "I got it, you can send the next one."',
		wikiUrl: 'https://en.wikipedia.org/wiki/Acknowledgement_(data_networks)',
		category: 'protocol-mechanics'
	},
	{
		id: 'sequence-number',
		term: 'Sequence Number',
		definition:
			'A counter in each [[tcp|TCP]] segment that tracks the byte position in the data stream. Allows the receiver to reassemble segments in order and detect missing data.',
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
			'A protocol where the server tracks the state of each connection or session. [[tcp|TCP]] is stateful (it tracks sequence numbers, window sizes). [[websockets|WebSockets]] maintain persistent state.',
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
			'A named combination of cryptographic algorithms used in a [[tls|TLS]] connection: key exchange (e.g., ECDHE), authentication (e.g., RSA), bulk encryption (e.g., AES-256-GCM), and hash (e.g., SHA-384).',
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
			'The negotiation process at the start of a [[tls|TLS]] connection. Client and server agree on a protocol version, cipher suite, exchange keys, and verify certificates. [[tls|TLS]] 1.3 completes in just 1 RTT.',
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
			'The verb in an HTTP request that indicates the desired action: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove). Methods define the semantics of [[rest|REST]] APIs.',
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
			'In [[http2|HTTP/2]] and [[http3|HTTP/3]], a stream is an independent, bidirectional sequence of frames within a single connection. Multiple streams are multiplexed together, eliminating head-of-line blocking between requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/[[http2|HTTP/2]]#Streams',
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
			'A middleman that receives messages from publishers, stores them, and delivers them to subscribers. Brokers like RabbitMQ, [[kafka|Kafka]], and Mosquitto handle routing, queuing, and delivery guarantees.',
		analogy:
			'Like a post office — it receives, sorts, and delivers mail between senders and recipients who never interact directly.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Message_broker',
		category: 'messaging'
	},
	{
		id: 'topic',
		term: 'Topic',
		definition:
			'A named channel in a pub/sub system that messages are published to and subscribed from. Topics can be hierarchical (e.g., home/kitchen/temperature in [[mqtt|MQTT]]) for flexible filtering.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern',
		category: 'messaging'
	},
	{
		id: 'qos',
		term: 'Quality of Service (QoS)',
		definition:
			'A delivery guarantee level in messaging protocols. [[mqtt|MQTT]] defines three: QoS 0 (at most once / fire-and-forget), QoS 1 (at least once), QoS 2 (exactly once). Higher QoS = more overhead.',
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
			'A technique that remaps private [[ip|IP]] addresses to a single public [[ip|IP]] address (and back) at a router. Lets many devices share one public [[ip|IP]], but complicates peer-to-peer connections.',
		analogy:
			'Like a company switchboard — external callers dial one number, and the switchboard routes them to the right extension inside.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Network_address_translation',
		category: 'infrastructure'
	},
	{
		id: 'firewall',
		term: 'Firewall',
		definition:
			'A security system that monitors and filters network traffic based on rules. Firewalls can block specific ports, [[ip|IP]] addresses, or protocols. They sit between trusted internal networks and untrusted external ones.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Firewall_(computing)',
		category: 'infrastructure'
	},
	{
		id: 'dns-resolution',
		term: 'DNS Resolution',
		definition:
			'The process of translating a domain name (e.g., google.com) into an [[ip|IP]] address. Involves recursive resolvers, root servers, TLD servers, and authoritative servers. Results are cached for performance.',
		analogy:
			'Like looking up a phone number in a directory — you know the name, [[dns|DNS]] gives you the address.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Domain_Name_System#Address_resolution_mechanism',
		category: 'infrastructure'
	},
	{
		id: 'subnet',
		term: 'Subnet',
		definition:
			'A logical subdivision of an [[ip|IP]] network. Subnetting divides a large network into smaller segments using a subnet mask (e.g., 255.255.255.0 or /24). Devices on the same subnet communicate directly.',
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
			'A table stored in a router (or host) that maps destination [[ip|IP]] prefixes to next-hop addresses and interfaces. Determines which direction to forward each packet.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Routing_table',
		category: 'infrastructure'
	},
	{
		id: 'ttl',
		term: 'TTL (Time to Live)',
		definition:
			'A counter in [[ip|IP]] packets that is decremented by 1 at each router hop. When it reaches 0, the packet is dropped and an [[icmp|ICMP]] error is sent back. Prevents packets from looping forever. Also used in [[dns|DNS]] caching.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Time_to_live',
		category: 'infrastructure'
	},
	{
		id: 'mtu',
		term: 'MTU (Maximum Transmission Unit)',
		definition:
			'The largest packet size (in bytes) that a network link can carry. [[ethernet|Ethernet]] defaults to 1500 bytes. Packets larger than the MTU must be fragmented or dropped (if the Don\'t Fragment flag is set). Path MTU Discovery finds the smallest MTU along a route.',
		analogy:
			'Like the maximum box size a conveyor belt can handle — anything bigger must be split into smaller boxes.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Maximum_transmission_unit',
		category: 'networking-basics'
	},
	{
		id: 'path-mtu-discovery',
		term: 'Path MTU Discovery',
		definition:
			'A technique where a sender probes the path to a destination to find the largest packet size that can traverse it without fragmentation. Sets the Don\'t Fragment flag and watches for [[icmp|ICMP]] "Fragmentation Needed" messages. When [[icmp|ICMP]] is filtered (the "MTU black hole"), connections silently hang. RFC 1191 ([[ip|IPv4]]) and RFC 8201 ([[ipv6|IPv6]]); [[rfc:4821|RFC 4821]] PLPMTUD probes without [[icmp|ICMP]].',
		wikiUrl: 'https://en.wikipedia.org/wiki/Path_MTU_Discovery',
		category: 'networking-basics'
	},
	{
		id: 'checksum',
		term: 'Checksum',
		definition:
			'A small value computed from a block of data to detect transmission errors. [[tcp|TCP]], [[udp|UDP]], and [[ip|IP]] each include checksums in their headers. The receiver recomputes the checksum and drops the packet if it doesn\'t match.',
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
			'A method of allocating [[ip|IP]] addresses using variable-length subnet masks (e.g., 192.168.1.0/24 means the first 24 bits are the network, leaving 8 bits for hosts). Replaced the old Class A/B/C system, enabling more efficient address allocation.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing',
		category: 'networking-basics'
	},
	{
		id: 'autonomous-system',
		term: 'Autonomous System (AS)',
		definition:
			'A large network or group of networks under a single administrative entity (like an ISP or corporation) that presents a unified routing policy to the internet. Each AS has a unique number (ASN). [[bgp|BGP]] routes traffic between autonomous systems.',
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
			'A variant of [[tls|TLS]] designed for datagram protocols like [[udp|UDP]]. Provides the same encryption, authentication, and integrity guarantees as [[tls|TLS]], but handles packet loss and reordering that [[udp|UDP]] doesn\'t prevent. Used by [[webrtc|WebRTC]] and [[coap|CoAP]].',
		wikiUrl: 'https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security',
		category: 'security'
	},
	{
		id: 'stun-turn-ice',
		term: 'STUN/TURN/ICE',
		definition:
			'Three protocols that work together for NAT traversal in [[webrtc|WebRTC]]. STUN (Session Traversal Utilities for NAT) discovers the public [[ip|IP]]. TURN (Traversal Using Relays around NAT) relays media when direct connection fails. ICE (Interactive Connectivity Establishment) coordinates both to find the best path.',
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
			'The different kinds of records stored in [[dns|DNS]]. A records map names to [[ip|IPv4]] addresses, AAAA to [[ipv6|IPv6]], CNAME creates aliases, MX directs email, NS delegates to nameservers, TXT stores arbitrary text (used for SPF, DKIM), and SRV locates services.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_DNS_record_types',
		category: 'networking-basics'
	},

	// ── Addressing Modes ──────────────────────────────────────────────
	{
		id: 'unicast',
		term: 'Unicast',
		definition:
			'A one-to-one transmission from a single sender to a single receiver. Most internet traffic is unicast — when you load a webpage, the server sends data specifically to your [[ip|IP]] address.',
		analogy: 'Like a phone call — you dial one person and only they hear you.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Unicast',
		category: 'networking-basics'
	},
	{
		id: 'multicast',
		term: 'Multicast',
		definition:
			'A one-to-many transmission where data is sent to a group of interested receivers simultaneously. The network handles duplication, so the sender only transmits once. Used for live video streaming, service discovery, and [[ipv6|IPv6]] neighbor discovery.',
		analogy:
			'Like a radio station — one broadcast reaches everyone who tunes in, without sending separate copies.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Multicast',
		category: 'networking-basics'
	},
	{
		id: 'broadcast',
		term: 'Broadcast',
		definition:
			'A one-to-all transmission sent to every device on a local network segment. [[arp|ARP]] uses broadcast to find MAC addresses. [[ipv6|IPv6]] eliminates broadcast entirely, replacing it with multicast. Excessive broadcast traffic causes "broadcast storms."',
		analogy:
			'Like a PA announcement in a building — everyone hears it, whether they care or not.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Broadcasting_(networking)',
		category: 'networking-basics'
	},
	{
		id: 'anycast',
		term: 'Anycast',
		definition:
			'A one-to-nearest transmission where the same [[ip|IP]] address is assigned to multiple servers, and the network routes each request to the closest one. Used by CDNs and [[dns|DNS]] root servers to reduce latency.',
		analogy:
			'Like calling "nearest pizza place" — you always get connected to the closest location.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Anycast',
		category: 'networking-basics'
	},
	{
		id: 'full-duplex',
		term: 'Full-Duplex',
		definition:
			'A communication mode where data can flow in both directions simultaneously. Modern [[ethernet|Ethernet]] and [[websockets|WebSockets]] are full-duplex. Contrast with half-duplex (only one direction at a time, like walkie-talkies) and simplex (one direction only).',
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
			'A message sent with no expectation of a response. In [[json-rpc|JSON-RPC]] 2.0, a request without an "id" field is a notification — the server processes it but must not reply. Useful for logging, metrics, and progress updates where acknowledgment is unnecessary.',
		wikiUrl: 'https://www.jsonrpc.org/specification#notification',
		category: 'protocol-mechanics'
	},
	{
		id: 'sampling',
		term: 'Sampling (LLM Completion Request)',
		definition:
			'In [[mcp|MCP]], a mechanism where the server asks the host to run an LLM completion on its behalf. This lets tool servers leverage the AI model without having direct API access — the host mediates and the user can approve or reject the request.',
		wikiUrl: 'https://modelcontextprotocol.io/docs/concepts/sampling',
		category: 'protocol-mechanics'
	},
	{
		id: 'opacity',
		term: 'Opacity (Agent Design)',
		definition:
			'A design principle where an agent\'s internal reasoning, tool usage, and prompt chains are hidden from external observers. In [[a2a|A2A]], agents are opaque — you see their skills and outputs (artifacts), not how they arrive at results. This enables agents from different vendors to interoperate without exposing proprietary logic.',
		wikiUrl: 'https://a2a-protocol.org/latest/topics/key-concepts/',
		category: 'protocol-mechanics'
	},
	{
		id: 'xml',
		term: 'XML (Extensible Markup Language)',
		definition:
			'A verbose, self-describing markup language using nested tags. Once dominant for web services ([[soap|SOAP]], RSS), largely superseded by JSON for APIs. Still used in [[xmpp|XMPP]], SVG, Android layouts, and enterprise systems.',
		wikiUrl: 'https://en.wikipedia.org/wiki/XML',
		category: 'web'
	},
	{
		id: 'protocol-buffers',
		term: 'Protocol Buffers (protobuf)',
		definition:
			'A binary serialization format developed by Google. You define message schemas in .proto files, and code is generated for any language. 3-10x smaller and faster than JSON. Used by [[grpc|gRPC]], Google APIs, and many internal services.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Protocol_Buffers',
		category: 'web'
	},

	// ── HTTP Internals ────────────────────────────────────────────────
	{
		id: 'hpack',
		term: 'HPACK',
		definition:
			'The header compression algorithm used by [[http2|HTTP/2]]. Compresses headers using a static table of common headers, a dynamic table of recently-used headers, and Huffman encoding. Reduces header overhead from ~800 bytes to ~20 bytes on repeat requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HPACK',
		category: 'web'
	},
	{
		id: 'binary-framing',
		term: 'Binary Framing',
		definition:
			'A way of encoding protocol messages as structured binary data instead of human-readable text. [[http2|HTTP/2]] uses a binary framing layer that divides messages into small frames with type, length, flags, and stream ID fields — enabling efficient multiplexing.',
		wikiUrl: 'https://en.wikipedia.org/wiki/[[http2|HTTP/2]]#Differences_from_HTTP_1.1',
		category: 'web'
	},
	{
		id: 'server-push',
		term: 'Server Push',
		definition:
			'A feature where the server proactively sends resources to the client before they are requested. Introduced in [[http2|HTTP/2]] to pre-load assets like CSS and JS, but deprecated in most browsers due to complexity and caching issues. [[sse|SSE]] and [[websockets|WebSockets]] offer better alternatives.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP/2_Server_Push',
		category: 'web'
	},

	// ── Transport Internals ───────────────────────────────────────────
	{
		id: 'three-way-handshake',
		term: 'Three-Way Handshake',
		definition:
			'The [[tcp|TCP]] connection setup process: the client sends SYN, the server replies SYN-ACK, and the client sends ACK. This exchange synchronizes sequence numbers and confirms both sides are ready. It takes 1 RTT before data can flow.',
		analogy:
			'Like knocking on a door: "Can I come in?" → "Yes, come in!" → "Great, I\'m here!" — then you start talking.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Handshaking#TCP_three-way_handshake',
		category: 'protocol-mechanics'
	},
	{
		id: 'congestion-window',
		term: 'Congestion Window (cwnd)',
		definition:
			'A [[tcp|TCP]] variable that limits how much data can be in flight (sent but not yet acknowledged). Starts small (slow start) and grows as ACKs arrive. When packet loss is detected, the window shrinks dramatically to reduce network load.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Congestion_window',
		category: 'protocol-mechanics'
	},
	{
		id: 'slow-start',
		term: 'Slow Start',
		definition:
			'The [[tcp|TCP]] congestion control phase where the congestion window grows exponentially (doubling each RTT) until packet loss occurs or a threshold is reached. Despite the name, it ramps up quickly — it just starts cautiously to probe available bandwidth.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#Slow_start',
		category: 'protocol-mechanics'
	},

	// ── Media & Streaming ─────────────────────────────────────────────
	{
		id: 'adaptive-bitrate',
		term: 'Adaptive Bitrate Streaming',
		definition:
			'A technique where the video player dynamically switches between quality levels based on available bandwidth and buffer status. If your connection slows, the player seamlessly drops to a lower resolution instead of buffering. Used by [[hls|HLS]] and [[dash|DASH]].',
		analogy:
			'Like a TV that automatically adjusts picture quality based on your signal strength — smooth playback over choppy connections.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming',
		category: 'protocol-mechanics'
	},
	{
		id: 'rtcp',
		term: 'RTCP (RTP Control Protocol)',
		definition:
			'A companion protocol to [[rtp|RTP]] that carries statistics about media quality — packet loss rates, jitter measurements, and round-trip times. Endpoints use this feedback to adapt their encoding (lower bitrate, change codec) in real time.',
		wikiUrl: 'https://en.wikipedia.org/wiki/RTP_Control_Protocol',
		category: 'protocol-mechanics'
	},
	{
		id: 'signaling',
		term: 'Signaling',
		definition:
			'The out-of-band process of exchanging connection metadata (capabilities, addresses, encryption keys) before establishing a real-time media session. [[webrtc|WebRTC]] uses a signaling server to exchange [[sdp|SDP]] offers/answers. The signaling protocol itself is not standardized — you can use [[websockets|WebSockets]], HTTP, or anything.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Signaling_(telecommunications)',
		category: 'protocol-mechanics'
	},
	{
		id: 'srtp',
		term: 'SRTP (Secure RTP)',
		definition:
			'An encrypted version of [[rtp|RTP]] that provides confidentiality, authentication, and replay protection for real-time media streams. [[webrtc|WebRTC]] mandates SRTP — all audio and video is encrypted by default.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol',
		category: 'security'
	},

	// ── Security Additions ────────────────────────────────────────────
	{
		id: 'dnssec',
		term: 'DNSSEC',
		definition:
			'[[dns|DNS]] Security Extensions that add cryptographic signatures to [[dns|DNS]] records. DNSSEC lets resolvers verify that a [[dns|DNS]] response was not tampered with, preventing [[dns|DNS]] spoofing attacks. It authenticates the data but does not encrypt the query.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions',
		category: 'security'
	},
	{
		id: 'dns-over-https',
		term: 'DNS over HTTPS (DoH)',
		definition:
			'A protocol that sends [[dns|DNS]] queries inside encrypted HTTPS connections (port 443), preventing ISPs and network operators from seeing or modifying your [[dns|DNS]] lookups. Supported by major browsers and [[dns|DNS]] providers like Cloudflare (1.1.1.1) and Google (8.8.8.8).',
		wikiUrl: 'https://en.wikipedia.org/wiki/DNS_over_HTTPS',
		category: 'security'
	},
	{
		id: 'jwt',
		term: 'JWT (JSON Web Token)',
		definition:
			'A compact, URL-safe token format for securely transmitting claims between parties. Contains three Base64-encoded parts: header (algorithm), payload (claims like user ID and expiration), and signature. Widely used for API authentication and [[oauth2|OAuth]] ID tokens.',
		wikiUrl: 'https://en.wikipedia.org/wiki/JSON_Web_Token',
		category: 'security'
	},
	{
		id: 'access-token',
		term: 'Access Token',
		definition:
			'A credential that grants limited, scoped access to a protected resource on behalf of a user. [[oauth2|OAuth]] access tokens are typically short-lived (minutes to hours) and carry specific permissions (scopes) rather than full account access.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Access_token',
		category: 'security'
	},

	// ── Messaging Additions ───────────────────────────────────────────
	{
		id: 'exchange',
		term: 'Exchange (AMQP)',
		definition:
			'An [[amqp|AMQP]] routing component that receives messages from producers and routes them to queues based on rules. Four types: direct (exact routing key match), topic (wildcard patterns), fanout (broadcast to all queues), and headers (route by message headers).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol',
		category: 'messaging'
	},
	{
		id: 'partition',
		term: 'Partition (Kafka)',
		definition:
			'A [[kafka|Kafka]] topic is split into partitions — ordered, append-only logs distributed across brokers. Partitions enable parallel processing and horizontal scaling. Each message within a partition gets a sequential offset number. Order is guaranteed within a partition but not across partitions.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Apache_Kafka',
		category: 'messaging'
	},

	// ── Layer 2 & Wi-Fi ───────────────────────────────────────────────
	{
		id: 'vlan',
		term: 'VLAN (Virtual LAN)',
		definition:
			'A logical partition of a physical network at Layer 2. VLANs isolate broadcast traffic without requiring separate switches. IEEE 802.1Q inserts a 4-byte tag into [[ethernet|Ethernet]] frames with a 12-bit VLAN ID (1-4094). Essential for security, performance, and network organization.',
		wikiUrl: 'https://en.wikipedia.org/wiki/VLAN',
		category: 'infrastructure'
	},
	{
		id: 'access-point',
		term: 'Access Point (AP)',
		definition:
			'A device that bridges wireless ([[wifi|802.11]]) and wired ([[ethernet|Ethernet]]) networks. Access points broadcast beacon frames to advertise their presence, handle client authentication, and translate between wireless and wired frame formats.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Wireless_access_point',
		category: 'infrastructure'
	},

	// ── Networking Fundamentals ──────────────────────────────────────
	{
		id: 'tunnel',
		term: 'Tunnel / Tunneling',
		definition:
			'Encapsulating one {{protocol|protocol}} inside another to carry traffic across a network that doesn\'t natively support it. For example, [[ssh|SSH]] tunnels wrap [[tcp|TCP]] traffic inside an encrypted [[ssh|SSH]] connection, and VPNs tunnel all traffic through an encrypted link. The outer protocol handles delivery; the inner protocol rides along as {{payload|payload}}.',
		analogy:
			'Like putting a letter inside a letter — the outer envelope gets it through the postal system, and the inner envelope carries the real message.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Tunneling_protocol',
		category: 'networking-basics'
	},
	{
		id: 'vpn',
		term: 'VPN (Virtual Private Network)',
		definition:
			'A technology that creates an encrypted {{tunnel|tunnel}} between your device and a VPN server, making all your traffic appear to originate from the server\'s [[ip|IP]] address. Used for privacy (hiding traffic from ISPs), security (protecting data on public [[wifi|Wi-Fi]]), and accessing remote networks (corporate VPNs). Common protocols include WireGuard, OpenVPN, and IPsec.',
		analogy:
			'Like a secret underground passage between two buildings — outsiders can\'t see what you\'re carrying or where you\'re really going.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Virtual_private_network',
		category: 'security'
	},
	{
		id: 'payload',
		term: 'Payload',
		definition:
			'The actual data carried inside a {{packet|packet}}, {{frame|frame}}, or message — as opposed to the {{header|headers}} and metadata used for routing and delivery. When you send a web request, the HTTP content is the payload of the [[tcp|TCP]] segment, which is the payload of the [[ip|IP]] packet, which is the payload of the [[ethernet|Ethernet]] frame.',
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
			'The process of breaking a {{packet|packet}} into smaller pieces when it exceeds the {{mtu|MTU}} (Maximum Transmission Unit) of a network link. Each fragment carries offset information so the destination can reassemble them. [[ip|IPv4]] allows routers to fragment; [[ipv6|IPv6]] only allows the source host to fragment. Modern practice avoids fragmentation using Path MTU Discovery.',
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
			'Forging the source address or identity in a network communication to impersonate another device. [[ip|IP]] spoofing forges the source [[ip|IP]]; [[arp|ARP]] spoofing sends fake [[arp|ARP]] replies to redirect traffic; [[dns|DNS]] spoofing returns fake [[dns|DNS]] records. A common first step in {{man-in-the-middle|man-in-the-middle}} attacks.',
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
			'A temporary assignment of an {{ip-address|IP address}} to a device by a [[dhcp|DHCP]] server. Leases have a duration (typically hours to days); the device must renew before expiry or lose the address. This ensures [[ip|IP]] addresses are recycled when devices disconnect.',
		analogy:
			'Like renting an apartment — you get an address for a set time, and you can renew or move out when the lease expires.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol#Operation',
		category: 'infrastructure'
	},
	{
		id: 'load-balancing',
		term: 'Load Balancing',
		definition:
			'Distributing incoming network traffic across multiple servers to improve performance, reliability, and availability. Load balancers can operate at Layer 4 ([[tcp|TCP]]/[[udp|UDP]] — routing by [[ip|IP]] and {{port|port}}) or Layer 7 (HTTP — routing by URL, {{header|headers}}, or cookies). Common algorithms include round-robin, least connections, and weighted distribution.',
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
			'The largest [[tcp|TCP]] payload that fits in a single segment without [[ip|IP]] fragmentation, advertised in the SYN handshake. Typically MTU − 40 bytes ([[ip|IPv4]] + [[tcp|TCP]]) or MTU − 60 bytes ([[ipv6|IPv6]] + [[tcp|TCP]]).',
		analogy:
			'If MTU is the maximum size of an envelope your post office accepts, MSS is the size of the letter you can stuff inside after subtracting the address labels and stamps.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Maximum_segment_size',
		category: 'networking-basics'
	},
	{
		id: 'default-gateway',
		term: 'Default Gateway',
		definition:
			'The router a host sends packets to when the destination [[ip|IP]] is not on its local subnet. Configured per-interface, it is the "exit door" from the local network onto the wider internet.',
		analogy:
			'Like the front desk of an office building — if you do not know which floor someone is on, you take the matter to the front desk and let them route it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Default_gateway',
		category: 'networking-basics'
	},
	{
		id: 'loopback',
		term: 'Loopback',
		definition:
			'The reserved address that always means "this host" — 127.0.0.0/8 in [[ip|IPv4]] (typically 127.0.0.1) and ::1 in [[ipv6|IPv6]]. Packets sent to a loopback address never leave the host; they go straight back up the network stack.',
		analogy: 'Like dialing your own phone number — the call never leaves the building.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Localhost',
		category: 'networking-basics'
	},
	{
		id: 'link-local',
		term: 'Link-Local Address',
		definition:
			'An address valid only on a single network segment (one "link") and never routed beyond it. [[ip|IPv4]] uses 169.254.0.0/16 (assigned automatically when [[dhcp|DHCP]] fails); [[ipv6|IPv6]] uses fe80::/10 (every [[ipv6|IPv6]] interface has one by default and uses it for NDP).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Link-local_address',
		category: 'networking-basics'
	},
	{
		id: 'private-ip-address',
		term: 'Private IP Address',
		definition:
			'An [[ip|IP]] address from a range reserved for use inside a private network and not routable on the public internet. [[rfc:1918|RFC 1918]] defines 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for [[ip|IPv4]]; [[ipv6|IPv6]] uses fc00::/7 for unique local addresses.',
		analogy: 'Like an internal office extension — only people inside the building can dial it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Private_network',
		category: 'networking-basics'
	},
	{
		id: 'public-ip-address',
		term: 'Public IP Address',
		definition:
			'A globally unique, routable [[ip|IP]] address assigned by an internet service provider. Anything reachable from the open internet has one (often shared via NAT).',
		category: 'networking-basics'
	},
	{
		id: 'ephemeral-port',
		term: 'Ephemeral Port',
		definition:
			'A short-lived source port the operating system picks for outgoing connections, typically from the range 49152–65535 (IANA), 32768–60999 (Linux), or 49152–65535 (Windows). Each new outbound [[tcp|TCP]]/[[udp|UDP]] connection gets a fresh ephemeral port so multiple connections to the same destination can coexist.',
		analogy:
			"Like the temporary number a delivery driver writes on their clipboard — it's only meaningful for this delivery, not stored anywhere permanent.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Ephemeral_port',
		category: 'networking-basics'
	},
	{
		id: 'well-known-port',
		term: 'Well-Known Port',
		definition:
			'A port number from the range 0–1023, reserved for standardised services and only bindable by privileged processes on Unix-like systems. 80 (HTTP), 443 (HTTPS), 22 ([[ssh|SSH]]), 53 ([[dns|DNS]]), and 25 ([[smtp|SMTP]]) are well-known ports.',
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers',
		category: 'networking-basics'
	},
	{
		id: 'half-duplex',
		term: 'Half Duplex',
		definition:
			'A link where only one side may transmit at a time. Original [[ethernet|Ethernet]] on shared coaxial cable was half duplex with collisions handled by CSMA/CD; modern switched [[ethernet|Ethernet]] on point-to-point fibre is full duplex.',
		analogy: 'Like a walkie-talkie: you have to say "over" before the other side can speak.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Duplex_(telecommunications)',
		category: 'networking-basics'
	},
	{
		id: 'mtu-black-hole',
		term: 'MTU Black Hole',
		definition:
			'A failure mode where a network path silently drops packets larger than its MTU because the [[icmp|ICMP]] "Packet Too Big" messages that would inform the sender are filtered. Path MTU Discovery (PMTUD) breaks; large packets vanish; small ones get through, so it looks intermittent.',
		analogy:
			'Like a low bridge that catches trucks but the warning sign is missing — drivers only learn the bridge is there after their truck disappears.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Path_MTU_Discovery#Problems_with_PMTUD',
		category: 'networking-basics'
	},
	{
		id: 'cgnat',
		term: 'CGNAT (Carrier-Grade NAT)',
		definition:
			'Network Address Translation performed at internet-service-provider scale, mapping many subscribers behind a single public [[ip|IPv4]] address. CGNAT bought [[ip|IPv4]] another decade past exhaustion at the cost of breaking inbound connectivity, complicating peer-to-peer apps, and frustrating abuse-tracing.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Carrier-grade_NAT',
		category: 'networking-basics'
	},
	{
		id: 'nat64',
		term: 'NAT64',
		definition:
			'A translation mechanism (RFC 6146) that lets [[ipv6|IPv6]]-only clients reach [[ip|IPv4]]-only servers by rewriting addresses at a stateful gateway. Usually paired with DNS64, which synthesises AAAA records from A records so the client thinks the destination is [[ipv6|IPv6]]. Together with 464XLAT they make [[ipv6|IPv6]]-mostly access networks possible.',
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
			"The fairness rule that defined classic [[tcp|TCP]] congestion control: grow the sending window by a fixed amount each round-trip when things are going well; cut it in half (or worse) the moment loss is detected. [[pioneer:van-jacobson|Van Jacobson]]'s 1988 paper made this the internet's default behavior.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Additive_increase/multiplicative_decrease',
		category: 'protocol-mechanics'
	},
	{
		id: 'cubic',
		term: 'CUBIC',
		definition:
			'The [[tcp|TCP]] congestion control algorithm that has been the Linux default since 2.6.19 (2006), Windows default since 2017, and is now Standards Track as [[rfc:9438|RFC 9438]] (2023). Replaces AIMD\'s linear ramp with a cubic function of time since the last loss — much friendlier to long fat pipes.',
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
			'An IETF architecture (RFCs 9330/9331/9332, January 2023) for sub-millisecond queuing latency. Cooperating senders mark every packet ECN-Capable; routers mark instead of drop on incipient congestion; the dual-queue AQM gives L4S traffic priority without starving classic [[tcp|TCP]]. Comcast launched it in production in January 2025.',
		wikiUrl: 'https://en.wikipedia.org/wiki/L4S',
		category: 'protocol-mechanics'
	},
	{
		id: 'ecn',
		term: 'ECN (Explicit Congestion Notification)',
		definition:
			'[[ip|IP]]+[[tcp|TCP]] bits (RFC 3168) that let routers signal congestion by *marking* packets instead of dropping them, so endpoints can slow down without losing data. The foundation L4S builds on. AccECN (an in-flight [[tcp|TCP]] extension) widens the feedback channel from one signal per RTT to many.',
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
			'The pathological latency caused by oversized buffers in network gear (modems, [[wifi|Wi-Fi]] APs, cellular base stations). When a buffer fills, every packet behind it waits — and [[tcp|TCP]], which only knows about loss, keeps the buffer full. Jim Gettys coined the term at Bell Labs in 2010 after measuring 1.2-second latencies on home links.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Bufferbloat',
		category: 'protocol-mechanics'
	},
	{
		id: 'time-wait',
		term: 'TIME_WAIT',
		definition:
			'The [[tcp|TCP]] state a socket enters for ~60 seconds (2 × MSL) after an active close, ensuring stray packets from the closed connection do not contaminate a new one with the same four-tuple. A high-frequency client that opens many short-lived connections can exhaust ephemeral ports stuck in TIME_WAIT.',
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
			'A handshake mode where a client sends application data in its very first packet, before the server has confirmed anything, by reusing keys from a previous session. [[tls|TLS]] 1.3 and [[quic|QUIC]] both support it. The cost: 0-RTT data has no forward secrecy and weaker replay protection, so it should be limited to idempotent requests.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_1.3',
		category: 'protocol-mechanics'
	},
	{
		id: 'session-resumption',
		term: 'Session Resumption',
		definition:
			"A handshake shortcut where a returning client and server skip the full key exchange by reusing parameters from a previous session, identified by a session ID or session ticket. Saves an entire round-trip and the cost of asymmetric crypto. Underpins [[tls|TLS]] 1.3's 1-RTT and 0-RTT resumption.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#Session_IDs_and_session_tickets',
		category: 'protocol-mechanics'
	},
	{
		id: 'connection-migration',
		term: 'Connection Migration',
		definition:
			"[[quic|QUIC]]'s ability to keep a connection alive when the client's [[ip|IP]] address or port changes — for example, when your phone switches from [[wifi|Wi-Fi]] to cellular. The connection is identified by an opaque Connection ID rather than the [[ip|IP]]/port four-tuple, so the new path just continues the same session.",
		wikiUrl: 'https://en.wikipedia.org/wiki/[[quic|QUIC]]',
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
			'A keyed message authentication code built from a cryptographic hash function (RFC 2104). Both parties share a secret; the sender computes HMAC(key, message) and appends it; the receiver recomputes and verifies. Used inside [[tls|TLS]], JWT (HS256), and the HKDF key-derivation chain.',
		wikiUrl: 'https://en.wikipedia.org/wiki/HMAC',
		category: 'security'
	},
	{
		id: 'aead',
		term: 'AEAD (Authenticated Encryption with Associated Data)',
		definition:
			'A symmetric cipher mode that encrypts and authenticates in one operation, plus binds extra "associated data" (like a packet header) to the ciphertext without encrypting it. AES-GCM, ChaCha20-Poly1305, and AES-CCM are the standard AEADs. [[tls|TLS]] 1.3 mandates AEAD; older CBC+HMAC compositions were repeatedly broken (BEAST, Lucky13).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Authenticated_encryption',
		category: 'security'
	},
	{
		id: 'nonce',
		term: 'Nonce',
		definition:
			'A "number used once" — a value (usually random or counter-derived) that must never repeat under the same key. AEAD ciphers like AES-GCM require a unique nonce per message; reusing one is catastrophic and leaks the plaintext. [[tls|TLS]] 1.3 derives per-record nonces by XORing the record sequence number into a static IV.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Cryptographic_nonce',
		category: 'security'
	},
	{
		id: 'diffie-hellman',
		term: 'Diffie-Hellman Key Exchange',
		definition:
			'A 1976 protocol that lets two parties agree on a shared secret over an open channel without ever sending the secret itself. Modern implementations use elliptic curves (X25519 is the common choice in [[tls|TLS]] 1.3 and [[quic|QUIC]]) and provide forward secrecy when both sides generate fresh keys per session (ECDHE).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange',
		category: 'security'
	},
	{
		id: 'ml-kem',
		term: 'ML-KEM (Module-Lattice Key Encapsulation)',
		definition:
			'The lattice-based key-encapsulation mechanism standardised by NIST as FIPS 203 in August 2024 — formerly known as Kyber. Designed to be secure against attacks by quantum computers. Already deployed in [[tls|TLS]] 1.3 as the X25519MLKEM768 hybrid (~52% of [[tls|TLS]] connections to Cloudflare by end of 2025) and on by default in iOS 26 / macOS Tahoe.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Kyber',
		category: 'security'
	},
	{
		id: 'sni',
		term: 'SNI (Server Name Indication)',
		definition:
			'A [[tls|TLS]] extension (RFC 6066) that lets a client tell the server which hostname it wants during the handshake — necessary when one [[ip|IP]] address hosts many [[tls|TLS]] sites. Historically sent in plaintext, which lets middleboxes and ISPs see which sites you visit; ECH is the fix.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Server_Name_Indication',
		category: 'security'
	},
	{
		id: 'alpn',
		term: 'ALPN (Application-Layer Protocol Negotiation)',
		definition:
			'A [[tls|TLS]] extension (RFC 7301) that lets client and server agree on the application protocol — h2 ([[http2|HTTP/2]]), h3 ([[http3|HTTP/3]]), http/1.1 — during the [[tls|TLS]] handshake itself, eliminating an extra round-trip. Why your browser silently picks [[http2|HTTP/2]] or [[http3|HTTP/3]] without you doing anything.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation',
		category: 'security'
	},
	{
		id: 'ech',
		term: 'ECH (Encrypted Client Hello)',
		definition:
			'A [[tls|TLS]] extension ([[rfc:9849|RFC 9849]], 2025) that encrypts the SNI and other ClientHello fields so eavesdroppers cannot see which site you are visiting. Cloudflare deploys ECH for ~70% of websites it fronts; Chrome and Firefox both support it.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Server_Name_Indication#Encrypted_Client_Hello',
		category: 'security'
	},
	{
		id: 'mtls',
		term: 'mTLS (Mutual TLS)',
		definition:
			'A [[tls|TLS]] variant where the *client* also presents a certificate during the handshake, so both sides authenticate each other cryptographically — not just the server. Common in service-to-service authentication inside a service mesh, in IoT device fleets, and in some banking APIs.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Mutual_authentication',
		category: 'security'
	},
	{
		id: 'rpki',
		term: 'RPKI (Resource Public Key Infrastructure)',
		definition:
			'A cryptographic system (RFCs 6480, 6482, 8210) that lets an autonomous system prove it is authorised to originate a particular [[ip|IP]] prefix. Combined with Route Origin Validation (ROV), routers reject [[bgp|BGP]] announcements that contradict the published authorisations — mitigating origin hijacks. Crossed 50% of [[ip|IPv4]] prefixes by May 2024.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Resource_Public_Key_Infrastructure',
		category: 'security'
	},
	{
		id: 'syn-flood',
		term: 'SYN Flood',
		definition:
			'A denial-of-service attack that sends many [[tcp|TCP]] SYN packets without completing the handshake, exhausting the server\'s half-open-connection table. The attack first hit the public internet at Panix in September 1996 and motivated D. J. Bernstein to invent SYN cookies within days.',
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
			'An opaque or signed credential carried in the HTTP Authorization header as `Authorization: Bearer <token>` (RFC 6750). Whoever holds the token can act on behalf of the user — there is no extra signature or proof-of-possession by default. JWT access tokens issued by [[oauth2|OAuth 2.0]] are typically used as bearer tokens.',
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc6750',
		category: 'web'
	},
	{
		id: 'pkce',
		term: 'PKCE (Proof Key for Code Exchange)',
		definition:
			'An [[oauth2|OAuth 2.0]] extension ([[rfc:7636|RFC 7636]]) that protects the authorisation-code flow on public clients (mobile apps, single-page apps) where a client secret cannot be kept private. The client generates a random code-verifier per request, sends its hash up-front, and reveals the verifier when redeeming the code. Mandatory in [[oauth2|OAuth]] 2.1.',
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc7636',
		category: 'web'
	},
	{
		id: 'early-hints',
		term: 'Early Hints (HTTP 103)',
		definition:
			'An HTTP status code (RFC 8297) that lets a server send response headers — typically Link headers for preloading critical resources — *before* the final response is ready. The replacement for [[http2|HTTP/2]] Server Push, which Chrome disabled by default in 2022 and Firefox removed in 2024.',
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103',
		category: 'web'
	},

	// ── Messaging — additions ──────────────────────────────────────────
	{
		id: 'offset',
		term: 'Offset (Message Log)',
		definition:
			'A monotonically increasing position within a partition or topic that identifies a specific message. In [[kafka|Kafka]] the consumer commits its current offset back to the broker so it can resume after a restart; in event sourcing the offset *is* the version number of the aggregate.',
		wikiUrl: 'https://kafka.apache.org/documentation/#consumerapi',
		category: 'messaging'
	},
	{
		id: 'exactly-once-delivery',
		term: 'Exactly-Once Delivery',
		definition:
			'A messaging guarantee that every message is processed by every interested consumer exactly one time — no loss, no duplicates. End-to-end exactly-once requires deduplication at the consumer plus transactional state, since the network alone cannot prove a message was processed; [[kafka|Kafka]] provides "exactly-once semantics" within the [[kafka|Kafka]] cluster via idempotent producers and transactional offsets.',
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
			'A periodic probe — typically an HTTP GET or [[tcp|TCP]] connect — that asks an instance whether it is ready to handle traffic. Load balancers, service meshes, Kubernetes, and orchestrators all use health checks to remove unhealthy instances from rotation. "Liveness" checks ask "are you still alive"; "readiness" checks ask "should you receive traffic right now."',
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
			'The five values that uniquely identify a flow on the internet: source [[ip|IP]], destination [[ip|IP]], source port, destination port, and L4 protocol ([[tcp|TCP]]/[[udp|UDP]]). Routers, firewalls, NATs, and ECMP hashes all key off the 5-tuple. The "4-tuple" drops the protocol and is what [[tcp|TCP]] uses to identify a connection.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Tuple#Computer_science',
		category: 'networking-basics'
	},
	{
		id: 'asn',
		term: 'ASN (Autonomous System Number)',
		definition:
			'A unique 16- or 32-bit identifier (RFC 6793) for an autonomous system — the unit of inter-domain routing on the internet. AS 32934 is Meta, AS 15169 is Google, AS 13335 is Cloudflare. [[bgp|BGP]] UPDATE messages carry an AS_PATH attribute listing the ASNs the route has traversed.',
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
			'A neutral facility where many autonomous systems meet on a shared layer-2 fabric (typically [[ethernet|Ethernet]]) to exchange traffic via [[bgp|BGP]] without paying transit. AMS-IX, DE-CIX, and LINX move terabits per second. The IXP itself doesn\'t move traffic — it provides the meet-me room and the switch.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_exchange_point',
		category: 'networking-basics'
	},
	{
		id: 'rib-fib',
		term: 'RIB / FIB',
		definition:
			"Two routing tables that look the same but live in different worlds. The Routing Information Base (RIB) is the *control plane*'s view: all known routes from [[bgp|BGP]], OSPF, IS-IS, static config. The Forwarding Information Base (FIB) is the *data plane*'s view: the subset of routes the router actually uses, programmed into ASIC TCAM for line-rate lookup.",
		category: 'networking-basics'
	},
	{
		id: 'control-plane-data-plane',
		term: 'Control Plane vs Data Plane',
		definition:
			"The two halves of a router or switch. The *control plane* runs the routing protocols ([[bgp|BGP]], OSPF, NDP), builds the RIB, and reacts to topology changes — typically on a general-purpose CPU. The *data plane* forwards packets at line rate using the FIB — typically in ASIC silicon. SDN's contribution was making both programmable.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Forwarding_plane',
		category: 'networking-basics'
	},
	{
		id: 'ndp',
		term: 'NDP (Neighbor Discovery Protocol)',
		definition:
			"[[ipv6|IPv6]]'s replacement for [[arp|ARP]] plus router discovery, prefix discovery, and Duplicate Address Detection ([[rfc:4861|RFC 4861]]). Runs over ICMPv6 multicast on the local link. Where [[arp|ARP]] broadcasts \"who has 192.0.2.7?\", NDP sends a Neighbor Solicitation to a solicited-node multicast group — much more efficient.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol',
		category: 'networking-basics'
	},
	{
		id: 'slaac',
		term: 'SLAAC (Stateless Address Autoconfiguration)',
		definition:
			"[[ipv6|IPv6]]'s mechanism ([[rfc:4862|RFC 4862]]) for hosts to generate their own globally-unique addresses without a [[dhcp|DHCP]] server. The router advertises a prefix; the host appends an interface identifier (EUI-64 or RFC 7217 stable-private). No server, no lease, no central state.",
		wikiUrl: 'https://en.wikipedia.org/wiki/[[ipv6|IPv6]]#Stateless_address_autoconfiguration_(SLAAC)',
		category: 'networking-basics'
	},
	{
		id: 'dscp',
		term: 'DSCP (Differentiated Services Code Point)',
		definition:
			"A 6-bit field in the [[ip|IPv4]] ToS or [[ipv6|IPv6]] Traffic Class header (RFC 2474) that classifies a packet's quality-of-service treatment. Common values include EF (Expedited Forwarding, voice), AF41-43 (Assured Forwarding, video), and CS0 (default best-effort). Routers configured for DiffServ enqueue packets into different priority queues based on DSCP.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Differentiated_services',
		category: 'networking-basics'
	},
	{
		id: 'four-six-four-xlat',
		term: '464XLAT',
		definition:
			"An [[ipv6|IPv6]] transition mechanism ([[rfc:6877|RFC 6877]]) that lets [[ip|IPv4]]-only applications run on [[ipv6|IPv6]]-only access networks. A CLAT on the host translates [[ip|IPv4]] → [[ipv6|IPv6]]; a PLAT (NAT64) at the carrier edge translates [[ipv6|IPv6]] → [[ip|IPv4]]. Modern Android, iOS, macOS, and Windows 11 ship CLAT natively. Why your phone can be [[ipv6|IPv6]]-only without breaking ancient apps.",
		wikiUrl: 'https://en.wikipedia.org/wiki/464XLAT',
		category: 'networking-basics'
	},

	// ── Protocol Mechanics — second wave ───────────────────────────────
	{
		id: 'tcp-rst',
		term: 'TCP RST',
		definition:
			'A [[tcp|TCP]] packet with the RST flag set, which immediately aborts a connection without the four-way close handshake. Sent when a packet arrives for a closed socket, when a stack rejects a connection attempt, or when an application explicitly aborts. RSTs are the basis of off-path connection-reset attacks (the 2016 CVE-2016-5696 used a side channel in the RST rate-limit counter).',
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_termination',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-fin',
		term: 'TCP FIN',
		definition:
			"A [[tcp|TCP]] packet with the FIN flag set, signalling \"I'm done sending data — but I'll keep listening.\" The graceful counterpart to RST. A clean [[tcp|TCP]] close is a four-way exchange: FIN, ACK, FIN, ACK, with both sides able to half-close independently.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_termination',
		category: 'protocol-mechanics'
	},
	{
		id: 'sack',
		term: 'SACK (Selective Acknowledgment)',
		definition:
			"A [[tcp|TCP]] option ([[rfc:2018|RFC 2018]], 1996) that lets the receiver tell the sender exactly which non-contiguous byte ranges have arrived — instead of the cumulative ACK only saying \"I have everything up to byte N.\" Lets the sender retransmit only what's missing, dramatically improving recovery on lossy paths. Universally supported.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Selective_acknowledgments',
		category: 'protocol-mechanics'
	},
	{
		id: 'window-scale',
		term: 'Window Scale',
		definition:
			"A [[tcp|TCP]] option ([[rfc:7323|RFC 7323]]) that lets the 16-bit receive window field represent values up to 2³⁰ bytes by left-shifting it during the handshake. Without window scale, a single [[tcp|TCP]] connection caps at 64 KB in flight — fine in 1981, far too little for a 10 Gbps × 100 ms BDP. Negotiated only in the SYN handshake, never midstream.",
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
			"A receiver-side optimisation ([[rfc:1122|RFC 1122]] §4.2.3.2) that batches ACKs by waiting up to ~200 ms in case more data or an outgoing packet can carry the ACK. Combined with Nagle's algorithm on the sender, this can produce 200 ms request-response latencies on otherwise instant networks — the classic interactive-app footgun.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_delayed_acknowledgment',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-fast-open',
		term: 'TCP Fast Open',
		definition:
			'A [[tcp|TCP]] extension (RFC 7413, 2014) that lets a returning client send application data inside the SYN, using a server-issued cookie to authenticate. Saves an entire round-trip for repeat connections. ~5% middlebox failure rate on the public internet — a key reason [[quic|QUIC]] ended up on [[udp|UDP]] instead of as another [[tcp|TCP]] option.',
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_Fast_Open',
		category: 'protocol-mechanics'
	},
	{
		id: 'initial-cwnd',
		term: 'Initial cwnd',
		definition:
			"The number of segments a [[tcp|TCP]] sender may put in flight before receiving the first ACK. RFC 6928 (2013) raised it from 3-4 to 10 (≈14,600 bytes), shaving an entire round-trip off small-page loads. Some CDNs go higher. The reason a fresh connection's first burst can saturate a 100 Mbps link before the server has heard back.",
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
			"A handshake mode where application data flows after exactly one round-trip — the client's first flight reaches the server, the server's reply reaches the client, and then the client can send. [[tls|TLS]] 1.3 and [[quic|QUIC]] achieve 1-RTT for new connections; with session resumption they fall to 0-RTT for repeat visitors.",
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
			"A function that turns a single high-entropy input — the (EC)DHE shared secret, a master key, a password — into a tree of named, application-specific keys. HKDF (RFC 5869) is the HMAC-based KDF that powers [[tls|TLS]] 1.3's key schedule and most modern protocols. Its job: ensure that compromising one derived key doesn't compromise the others.",
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
			"A system (RFC 9162) where every publicly-trusted [[tls|TLS]] certificate is logged to append-only Merkle-tree logs that anyone can audit. Browsers reject certificates that aren't logged, so a CA cannot quietly mis-issue a certificate for a domain — the domain owner will see it. Crt.sh is a popular search interface.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Certificate_Transparency',
		category: 'security'
	},
	{
		id: 'bgp-hijack',
		term: 'BGP Hijack',
		definition:
			"A [[bgp|BGP]] announcement that originates a prefix the announcer is not authorised to originate, or claims a more-specific prefix that wins under longest-prefix match. Pakistan Telecom's 2008 announcement of YouTube's /24 took YouTube offline globally for two hours; the 2018 MyEtherWallet hijack stole ~$150K in crypto. RPKI ROV mitigates origin hijacks; ASPA mitigates path hijacks.",
		wikiUrl: 'https://en.wikipedia.org/wiki/BGP_hijacking',
		category: 'security'
	},
	{
		id: 'route-leak',
		term: 'Route Leak',
		definition:
			"A [[bgp|BGP]] route announcement that propagates outside its agreed policy boundary — typically a customer accidentally announcing all its provider's routes back to other providers, turning itself into a transit AS for the entire internet. RFC 7908 catalogues six types. The 1997 AS 7007 incident and the 2019 Verizon/Cloudflare leak are textbook examples.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Route_leak',
		category: 'security'
	},
	{
		id: 'rov',
		term: 'ROV (Route Origin Validation)',
		definition:
			"The runtime check a router performs against RPKI: for each [[bgp|BGP]] UPDATE, verify that the originating AS is authorised to announce the prefix. Result is *Valid*, *Invalid*, or *NotFound*. Most large transit providers drop *Invalid*. Pairs with RPKI as the deployment mechanism that stopped the YouTube-class hijack.",
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
			"Capturing a valid message and re-sending it later to trick the recipient into accepting it as fresh. Defeated with nonces, timestamps, sequence numbers, or single-use tokens. [[tls|TLS]] 1.3's 0-RTT data has limited replay protection by design — which is why it should be restricted to idempotent requests like GETs.",
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
			"A bidirectional sequence of [[http2|HTTP/2]] frames within a single [[tcp|TCP]] connection, identified by a stream ID. Each request-response pair is one stream; many streams interleave their frames over the same connection. Eliminates [[http1|HTTP/1.1]]'s connection-per-request overhead — but a single [[tcp|TCP]] packet loss still stalls all streams, the limitation [[http3|HTTP/3]] fixed.",
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc9113#name-streams-and-multiplexing',
		category: 'web'
	},
	{
		id: 'webtransport',
		term: 'WebTransport',
		definition:
			"A modern client-server transport API for browsers (W3C Working Draft, IETF draft-ietf-webtrans-http3) running over [[http3|HTTP/3]]. Provides multiplexed reliable streams plus unreliable datagrams — what [[websockets|WebSocket]] would look like if redesigned in 2024. Targeted for completion late 2026 or early 2027.",
		wikiUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API',
		category: 'web'
	},
	{
		id: 'masque',
		term: 'MASQUE',
		definition:
			"An IETF working group standardising proxy protocols on top of [[http3|HTTP/3]] — CONNECT-[[ip|IP]] (tunnel any L3 traffic), CONNECT-[[udp|UDP]] (proxy [[udp|UDP]], used by [[http3|HTTP/3]]-over-[[http3|HTTP/3]]), CONNECT-[[ethernet|Ethernet]]. The technology behind iCloud Private Relay and Cloudflare WARP: arbitrary [[ip|IP]] traffic tunnelled inside what looks like normal HTTPS.",
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
			"In [[amqp|AMQP]], a string the producer attaches to a message that the exchange uses to decide which queues receive it. With a *direct* exchange the routing key matches a queue exactly; with a *topic* exchange it's a dotted pattern (`logs.error.*`); with a *fanout* exchange it's ignored.",
		wikiUrl: 'https://www.rabbitmq.com/tutorials/amqp-concepts.html',
		category: 'messaging'
	},
	{
		id: 'last-will',
		term: 'Last Will (MQTT)',
		definition:
			"A message a client tells the [[mqtt|MQTT]] broker to publish on its behalf if the client disconnects ungracefully. Lets every other subscriber learn immediately when a sensor goes offline — without polling — even though the failed sensor cannot send anything itself.",
		wikiUrl: 'https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html',
		category: 'messaging'
	},
	{
		id: 'retained-message',
		term: 'Retained Message (MQTT)',
		definition:
			"A message the [[mqtt|MQTT]] broker holds onto for a topic and immediately delivers to any new subscriber. Lets a late-joining subscriber learn the current state of the world (e.g., the last reading from a sensor) without waiting for the next publish.",
		wikiUrl: 'https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html',
		category: 'messaging'
	},
	{
		id: 'log-compaction',
		term: 'Log Compaction (Kafka)',
		definition:
			"A [[kafka|Kafka]] retention policy that, instead of deleting old records by age, keeps the most recent value for each key. Lets a topic act as an event log that doubles as a snapshot — a new consumer can read from offset 0 and end up with the current state of every key, just slowly.",
		wikiUrl: 'https://kafka.apache.org/documentation/#compaction',
		category: 'messaging'
	},
	{
		id: 'replication-factor',
		term: 'Replication Factor',
		definition:
			"How many copies of each piece of data a distributed system stores. In [[kafka|Kafka]], a topic's replication factor is how many brokers hold a copy of each partition; you can lose (factor − 1) brokers without data loss. In Cassandra / DynamoDB it's the analogous concept for keyspaces / tables.",
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
			"The mechanism by which a service finds the network address of another service it depends on, when those addresses change frequently. Implementations include [[dns|DNS]] (with short TTLs), Consul/etcd (key-value lookup), Kubernetes Services (a stable [[dns|DNS]] name in front of changing pod IPs), and the service mesh (the sidecar handles it).",
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
			"A server-side mechanism that caps how many requests a client may make in a time window — by [[ip|IP]], API key, user, or tenant. Token bucket and leaky bucket are the standard algorithms. The HTTP response is 429 Too Many Requests, ideally with a Retry-After header naming when to try again.",
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
	},

	// ── NAT traversal vocabulary ───────────────────────────────────────
	{
		id: 'ice',
		term: 'ICE (Interactive Connectivity Establishment)',
		definition:
			'The algorithm that orchestrates [[nat-traversal|NAT traversal]] for a single session. Each agent gathers every possible candidate address (host, server-reflexive via STUN, peer-reflexive, relayed via TURN), pairs them with the peer\'s candidates, runs connectivity checks across every pair, and nominates the highest-priority working one. RFC 8445.',
		analogy:
			"Like a meet-up app that tries every route between two friends — bike, train, ride-share, walking — and picks the one that actually gets them together.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment',
		category: 'networking-basics'
	},
	{
		id: 'stun',
		term: 'STUN (Session Traversal Utilities for NAT)',
		definition:
			'The wire format and reflexive-address probe under [[nat-traversal|NAT traversal]]. A 20-byte header with the magic cookie 0x2112A442 and a 96-bit transaction ID. A Binding Request asks a public server "what address do you see me from?" — the answer (XOR-MAPPED-ADDRESS) is the agent\'s public {{ip-address|IP:port}}. RFC 8489.',
		wikiUrl: 'https://en.wikipedia.org/wiki/STUN',
		category: 'networking-basics'
	},
	{
		id: 'turn',
		term: 'TURN (Traversal Using Relays around NAT)',
		definition:
			"STUN's relay extension: when no direct path works between two peers, both connect to a public TURN server which forwards media between them. The fallback path that makes [[webrtc|WebRTC]] calls reach 99%+ success rates. Default allocation lifetime: 600 seconds. RFC 8656.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT',
		category: 'networking-basics'
	},
	{
		id: 'ice-candidate',
		term: 'ICE candidate',
		definition:
			'A (transport, address, port) tuple that an [[nat-traversal|ICE]] agent thinks the peer might be able to reach it on. Four types: **host** (a local interface, priority 126), **server-reflexive** (STUN-discovered public IP, 100), **peer-reflexive** (discovered during checks, 110), and **relay** (TURN-allocated, 0). Candidates are signalled to the peer via SDP.',
		wikiUrl: 'https://datatracker.ietf.org/doc/html/rfc8445#section-5.1.1',
		category: 'networking-basics'
	},

	// ── Bluetooth vocabulary ──────────────────────────────────────────
	{
		id: 'gatt',
		term: 'GATT (Generic Attribute Profile)',
		definition:
			"The [[bluetooth|BLE]] application protocol. A GATT *server* (peripheral) exposes a tree of services → characteristics → descriptors, each with a 16- or 128-bit UUID and a numeric handle. A GATT *client* (central) discovers them, reads/writes/subscribes-to-notifications. The protocol every BLE sensor and wearable speaks above L2CAP.",
		analogy:
			'Like a tiny REST API embedded in every Bluetooth sensor — services are endpoints, characteristics are the actual values.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Bluetooth_Low_Energy#GATT',
		category: 'protocol-mechanics'
	},
	{
		id: 'ble',
		term: 'BLE (Bluetooth Low Energy)',
		definition:
			"The 2010 [[bluetooth|Bluetooth]] redesign for microamp power budgets. Different radio than Classic BR/EDR (40 × 2 MHz channels, GFSK-only, hops once per connection event). Different stack: L2CAP → ATT → GATT. The protocol under AirPods, AirTags, hearing aids, and Matter device commissioning.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Bluetooth_Low_Energy',
		category: 'protocol-mechanics'
	},
	{
		id: 'l2cap',
		term: 'L2CAP (Logical Link Control and Adaptation Protocol)',
		definition:
			"The [[bluetooth|Bluetooth]] transport layer above the Link Layer. Provides Channel IDs that demultiplex sub-protocols: CID 0x0004 is ATT (GATT data), CID 0x0005 is LE signalling, CID 0x0006 is the Security Manager Protocol (pairing).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Bluetooth#L2CAP',
		category: 'protocol-mechanics'
	},
	{
		id: 'piconet',
		term: 'Piconet',
		definition:
			"A small [[bluetooth|Bluetooth]] Classic network — one master (now Central) and up to seven active slaves (Peripherals) sharing a frequency-hopping pattern keyed off the master's clock. The fundamental BR/EDR topology since 1999.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Piconet',
		category: 'networking-basics'
	},

	// ── OSPF vocabulary ───────────────────────────────────────────────
	{
		id: 'lsa',
		term: 'LSA (Link State Advertisement)',
		definition:
			"The unit of routing information in [[ospf|OSPF]] and IS-IS. Each router floods LSAs describing its own links — type, cost, neighbours — and every router in the area accumulates them into an identical Link State Database (LSDB). Dijkstra runs on that database to compute shortest paths.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Link-state_advertisement',
		category: 'protocol-mechanics'
	},
	{
		id: 'lsdb',
		term: 'LSDB (Link State Database)',
		definition:
			"The synchronised graph of all links in an [[ospf|OSPF]] area. Every router in the area maintains an *identical* copy by flooding LSAs and acknowledging them. Dijkstra's shortest-path-first algorithm runs locally on this database — no router trusts another's route computation.",
		category: 'protocol-mechanics'
	},
	{
		id: 'igp',
		term: 'IGP (Interior Gateway Protocol)',
		definition:
			"A routing protocol used *inside* an {{autonomous-system|autonomous system}} — to compute paths between a single organisation's own routers. [[ospf|OSPF]] and IS-IS are the two dominant link-state IGPs. Contrast with EGP / [[bgp|BGP]], which routes *between* autonomous systems.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Interior_gateway_protocol',
		category: 'networking-basics'
	},

	// ── IPsec vocabulary ──────────────────────────────────────────────
	{
		id: 'security-association',
		term: 'SA (Security Association)',
		definition:
			"A one-directional [[ipsec|IPsec]] tunnel, identified by a 32-bit Security Parameters Index (SPI). It carries the cipher, key, sequence-number counter, and anti-replay window for traffic in one direction. A typical site-to-site VPN has two SAs (one each way) per Traffic Selector pair.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Security_association',
		category: 'security'
	},
	{
		id: 'esp',
		term: 'ESP (Encapsulating Security Payload)',
		definition:
			"The [[ipsec|IPsec]] data-plane protocol that encrypts and authenticates [[ip|IP]] payloads with an AEAD cipher like AES-GCM. 8-byte header (SPI + 32-bit sequence number), 8-byte AEAD nonce, encrypted payload, 16-byte authentication tag. The part of IPsec that everyone deploys. RFC 4303.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IPsec#Encapsulating_Security_Payload',
		category: 'security'
	},
	{
		id: 'ah-authentication-header',
		term: 'AH (Authentication Header)',
		definition:
			"The [[ipsec|IPsec]] integrity-only protocol. Authenticates the entire [[ip|IP]] header (minus mutable fields) and payload but encrypts nothing. Almost no production deployment uses AH alone in 2026 — ESP with AEAD does both jobs in one pass. RFC 4302.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IPsec#Authentication_Header',
		category: 'security'
	},
	{
		id: 'ike',
		term: 'IKE / IKEv2 (Internet Key Exchange)',
		definition:
			"The [[ipsec|IPsec]] control plane — negotiates the cipher suite, exchanges Diffie-Hellman / ECDH / ML-KEM public keys, authenticates the peers (certificate, PSK, or EAP), and establishes the Security Associations the data plane uses. IKEv2 (RFC 7296, STD 79) is the modern Internet Standard.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Key_Exchange',
		category: 'security'
	},
	{
		id: 'anti-replay',
		term: 'Anti-replay window',
		definition:
			"A sliding bitmap of recently-seen sequence numbers maintained by an [[ipsec|ESP]] (or similar) receiver. Packets older than the window or duplicates within it are dropped. RFC 4303 §3.4.3 default is **32 entries** — a well-documented foot-gun on 10 Gbps+ links where out-of-order delivery routinely overflows it; production gateways tune to 1024+.",
		category: 'security'
	},
	{
		id: 'pfs',
		term: 'PFS (Perfect Forward Secrecy)',
		definition:
			"A property of a key-exchange protocol where compromising one session\'s long-term key does **not** compromise past sessions. Achieved by deriving each session key from an ephemeral Diffie-Hellman exchange. [[tls|TLS]] 1.3 enforces it; [[ipsec|IKEv2]] gets it via fresh DH/KEM in CREATE_CHILD_SA rekeys.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Forward_secrecy',
		category: 'security'
	},
	// ── NFC concepts ───────────────────────────────────────────────────
	{
		id: 'ism-band',
		term: 'ISM band',
		definition:
			'Industrial, Scientific, and Medical radio bands — unlicensed frequencies set aside by the ITU for non-communications use that grew into the home of every short-range wireless protocol. [[nfc|NFC]] sits at **13.56 MHz**; [[bluetooth|Bluetooth]] and [[wifi|Wi-Fi]] share 2.4 GHz; Wi-Fi also uses 5 GHz; Zigbee + Thread use 2.4 GHz; LoRa uses 868/915 MHz.',
		wikiUrl: 'https://en.wikipedia.org/wiki/ISM_radio_band',
		category: 'networking-basics'
	},
	{
		id: 'inductive-coupling',
		term: 'Inductive coupling',
		definition:
			"Energy and data transfer via the *magnetic* component of the field between two coupled loop antennas. The magnetic field falls off as **1/r³**, vs 1/r² for far-field radiative coupling — which is exactly why [[nfc|NFC]]'s ≤10 cm range is a feature, not a bug. The passive PICC harvests power from the reader's field and signals back via {{load-modulation|load modulation}}.",
		analogy:
			'Two transformer windings momentarily brought together — except the secondary is in a credit card and the primary is in a payment terminal.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Inductive_coupling',
		category: 'networking-basics'
	},
	{
		id: 'load-modulation',
		term: 'Load modulation',
		definition:
			"How a passive [[nfc|NFC]] card talks back: it switches a load (typically an 847.5 kHz subcarrier — 13.56 MHz/16) on its own antenna, which the reader perceives as small amplitude/phase changes in its own resonant loop. Cheap, requires no power source on the card. Modern phones use *active load modulation* instead — generating a small reflected carrier — which is why iPhones work through metal cases where plain plastic cards don't.",
		category: 'protocol-mechanics'
	},
	{
		id: 'ndef',
		term: 'NDEF (NFC Data Exchange Format)',
		definition:
			"The NFC Forum binary record container that lives in tags and rides over LLCP/SNEP. A 1-byte header (MB/ME/CF/SR/IL + 3-bit TNF) + variable type/id/payload-length fields + payload. The TNF picks the namespace: 1=Well-Known (URI, Text, Smart Poster), 2=MIME, 3=Absolute URI, 4=External. A URI record uses a single-byte prefix shorthand (0x03 = `https://`). **Adopted as an IEC standard in March 2026.**",
		category: 'protocol-mechanics'
	},
	{
		id: 'apdu',
		term: 'APDU (Application Protocol Data Unit)',
		definition:
			'The command/response unit per ISO/IEC 7816-4 — the alphabet of every contact and contactless smart card. Command APDU: 4-byte header `CLA INS P1 P2` + optional `Lc` length + data + optional `Le` expected response length. Response APDU: data + 2-byte status word `SW1 SW2` (where `9000` is success). EMV, eMRTDs, [[nfc|NFC]] card emulation, Aliro — all speak APDU.',
		category: 'protocol-mechanics'
	},
	{
		id: 'aid',
		term: 'AID (Application Identifier)',
		definition:
			"A 5–16 byte identifier per ISO 7816-5 that selects which on-card application to talk to — e.g. `A0000000041010` for Mastercard, `A0000000031010` for Visa, `A0000002471001` for ICAO eMRTDs. {{emv-cryptogram|EMV}} contactless uses a two-stage selection: first SELECT *PPSE* (`2PAY.SYS.DDF01`) to enumerate which AIDs the card supports, then SELECT the chosen AID.",
		category: 'protocol-mechanics'
	},
	{
		id: 'ppse',
		term: 'PPSE (Proximity Payment System Environment)',
		definition:
			'The AID `2PAY.SYS.DDF01` that every contactless EMV terminal SELECTs *first* — it returns an FCI listing every payment AID the card supports in priority order, so the terminal can pick the right brand kernel (Visa, Mastercard, Amex, UnionPay) before negotiating the actual transaction.',
		category: 'protocol-mechanics'
	},
	{
		id: 'emv-cryptogram',
		term: 'EMV Application Cryptogram (ARQC / TC)',
		definition:
			'The per-transaction proof an EMV chip card produces in response to `GENERATE AC`. **ARQC** (Authorisation Request Cryptogram) → online to the issuer; **TC** (Transaction Certificate) → offline approval; **AAC** (Application Authentication Cryptogram) → decline. Bound to the amount, currency, country, terminal type, ATC (Application Transaction Counter), and Unpredictable Number — so even a captured cryptogram is worthless: the ATC has already moved on.',
		category: 'security'
	},
	{
		id: 'hce',
		term: 'HCE (Host Card Emulation)',
		definition:
			"Android 4.4+ (2013) and iOS 17.4+ EEA: NFC card-emulation APDUs terminate in a normal application registered via `apduservice.xml` (Android) or the NFC entitlement (iOS), rather than in a hardware {{ese|Secure Element}}. Cheaper and more flexible — but the protocol can't tell whether the APDU stream came from a phone-in-hand or a relay tunnel, which is why **EMV Relay Resistance Protocol** exists.",
		category: 'security'
	},
	{
		id: 'ese',
		term: 'eSE (embedded Secure Element)',
		definition:
			'A tamper-resistant smart-card chip soldered onto a phone or wearable motherboard, with its own CPU, encrypted storage, and cryptographic accelerators. Apple Pay uses an eSE for every transaction — the host OS never sees the keys. Pricier and harder to update than {{hce|HCE}}, but immune to OS-level compromise and to relay-attack timing manipulation.',
		category: 'security'
	},
	{
		id: 'ccc-digital-key',
		term: 'CCC Digital Key',
		definition:
			'The Car Connectivity Consortium standard for phone-as-key. v1 was proprietary; v2 standardised NFC tap-to-unlock; v3 added BLE proximity + UWB centimetre-ranging (so the car knows *which side* of the door you are on); v4 (announced July 2025) brought cross-version interoperability. **115 vehicle/module products certified in 2025** — BMW (first, late 2024), Mercedes, Hyundai/Kia, Audi (2025), Volvo, Porsche, GM, Ford, plus Chinese OEMs (NIO, XPENG, Geely group).',
		category: 'security'
	},
	{
		id: 'aliro',
		term: 'Aliro',
		definition:
			'The Connectivity Standards Alliance\'s PKI-based **access-control credential standard**, finalised as v1.0 on **26 February 2026**. ECDSA mutual authentication; transports over [[nfc|NFC]] (tap-to-access), [[bluetooth|BLE]] (proximity), and BLE+[[uwb|UWB]] (ranged hands-free). Backed by 220+ companies including Apple, Google, Samsung, ASSA ABLOY, HID, Allegion, Kwikset, Nuki. CSA positions it as *"Matter for doors."*',
		category: 'security'
	},
	// ── Zigbee / UWB / 802.15.4 concepts ─────────────────────────────────
	{
		id: 'ieee-802-15-4',
		term: 'IEEE 802.15.4',
		definition:
			"The PHY/MAC standard that underlies [[zigbee|Zigbee]], **Thread**, **WirelessHART**, **Wi-SUN**, and (in its 802.15.4z amendment) [[uwb|UWB]]. Bands: 2.4 GHz O-QPSK at 250 kbit/s (16 channels), 868 MHz BPSK at 20 kbit/s (Europe), 902–928 MHz BPSK at 40 kbit/s (North America). 127-byte PHY payload limit. Two device classes: FFD (Full-Function Device, can route) and RFD (Reduced-Function Device, sleepy end-device).",
		category: 'networking-basics'
	},
	{
		id: 'zcl',
		term: 'ZCL (Zigbee Cluster Library)',
		definition:
			"The object model that makes [[zigbee|Zigbee]] a consumer protocol. Each *cluster* (e.g. OnOff = 0x0006, Level Control = 0x0008, Color Control = 0x0300) has attributes (OnOff.OnOff is a boolean) and commands (OnOff.Toggle = 0x02). ZCL is the *same data model* that **Matter** uses on IP — Matter is essentially ZCL on IPv6 — which is why a Hue bulb's behaviour translates one-to-one across the Matter Bridge that Signify shipped on 19 September 2023.",
		category: 'protocol-mechanics'
	},
	{
		id: 'trust-center',
		term: 'Trust Center',
		definition:
			"The single [[zigbee|Zigbee]] device (almost always the Coordinator) that holds and distributes the **network key** to all joined devices, governs which devices may join, and rekeys the network. New devices authenticate to the TC at commissioning time using a **pre-configured link key** (the universally-known default *ZigBeeAlliance09*, an **install code** derived secret, or — in R23 — a SPEKE-over-Curve25519 dynamic link key). The TC is the single trust root of a Zigbee mesh.",
		category: 'security'
	},
	{
		id: 'install-code',
		term: 'Install code',
		definition:
			"A **per-device 128-bit secret** printed on the back of a [[zigbee|Zigbee]] device's packaging or QR-encoded on its box, used to derive the unique pre-configured link key for that device's join. Closes the *ZigBeeAlliance09* default-key sniffer-at-join hole. Mandatory in Smart Energy and Zigbee 3.0 secure-by-default deployments; optional but recommended on all consumer deployments. R23's Dynamic Link Key with SPEKE removes the need for any pre-shared secret entirely.",
		category: 'security'
	},
	{
		id: 'matter',
		term: 'Matter',
		definition:
			"The CSA's IP-native smart-home application standard, launched 4 October 2022 (Matter 1.0). Runs over [[wifi|Wi-Fi]], Ethernet, and Thread; **does not run over [[zigbee|Zigbee]]** on the wire. Reuses Zigbee's {{zcl|ZCL}} data model directly, which lets a *Matter Bridge for non-Matter devices* (Hue Bridge, Aqara Hub M3) translate Matter operations to Zigbee one-to-one. Now at v1.5 (20 November 2025), adding camera streaming via RTSP — the last category that previously required Zigbee bridging.",
		category: 'protocol-mechanics'
	},
	{
		id: 'sts',
		term: 'STS (Scrambled Timestamp Sequence)',
		definition:
			"The cryptographic primitive that makes IEEE 802.15.4z [[uwb|UWB]] ranging secure against distance-decrease attacks. A 32–2048-chip pulse sequence whose positions are generated by **AES-128 in Counter mode** keyed by a per-session STS_KEY and a per-frame nonce — a *distance commitment*. An attacker without the key sees noise; they cannot predict the next chip and cannot reliably early-replay. Receiver generates the expected sequence locally and cross-correlates with a sharp autocorrelation peak. Pre-STS UWB (802.15.4a, 2007) was vulnerable; even STS has been attacked (Ghost Peak ~4% success at USENIX Sec 2022), motivating the 802.15.4ab redesign.",
		category: 'security'
	},
	{
		id: 'twr',
		term: 'TWR / DS-TWR (Two-Way Ranging)',
		definition:
			"How two [[uwb|UWB]] devices measure their distance. **SS-TWR**: Poll → Response (initiator measures round-trip, subtracts the responder's stated reply delay, divides by 2). Sensitive to clock drift — ~1.2 m bias with 20 ppm crystals + 200 µs reply. **DS-TWR**: Poll → Response → Final (cross-product `(T_round1·T_round2 − T_reply1·T_reply2) / (T_round1+T_round2+T_reply1+T_reply2)` cancels clock drift to first order). DS-TWR is the production method in 802.15.4z and gives cm-class accuracy routinely.",
		category: 'protocol-mechanics'
	},
	{
		id: 'tof-ranging',
		term: 'Time-of-Flight (ToF) ranging',
		definition:
			"Measuring distance by timing how long a radio pulse takes to traverse the air and multiplying by *c* ≈ 0.299792458 m/ns. A 1 ns timing error = 30 cm of range error. [[uwb|UWB]] chips routinely timestamp pulse arrival to 15–60 ps, yielding cm-class precision — and crucially, ToF cannot be *shortened* by a relay (the speed of light is the hard upper bound), so it defeats the BLE-RSSI relay attack class that broke Tesla Model 3 phone-as-a-key in 2022.",
		category: 'protocol-mechanics'
	},
	{
		id: 'fira',
		term: 'FiRa Consortium',
		definition:
			"*Fine Ranging.* Founded **1 August 2019** by NXP, Samsung, HID Global, and Bosch to certify [[uwb|UWB]] interoperability on top of IEEE 802.15.4z. Defines the **FiRa MAC profile** for application-layer ranging configuration (session setup, ranging-round structure, multi-node ranging, result reporting via the UWB Command Interface). ~200 members. The UWB-side analogue of what the [[bluetooth|Bluetooth]] SIG does for BLE or the NFC Forum does for NFC.",
		category: 'infrastructure'
	},
	{
		id: 'llcp',
		term: 'LLCP (Logical Link Control Protocol)',
		definition:
			'The link-layer protocol that NFC Forum devices used for peer-to-peer mode (one phone talking directly to another) — defined by the NFC Forum on top of NFCIP-1. LLCP carried the connection-oriented or connectionless data plane that {{snep|SNEP}} sat on top of for things like Android Beam. P2P mode was effectively retired in 2019 when Android dropped Android Beam, in favour of Connection Handover to [[bluetooth|Bluetooth]] or [[wifi|Wi-Fi]] for any meaningful payload.',
		category: 'protocol-mechanics'
	},
	{
		id: 'snep',
		term: 'SNEP (Simple NDEF Exchange Protocol)',
		definition:
			"NFC Forum's simple request/response protocol layered over {{llcp|LLCP}} that let one device PUT or GET an {{ndef|NDEF}} message to another in P2P mode. The protocol that powered Android Beam (2011 — 2019). Deprecated in current NFC Forum specs alongside the rest of the P2P stack; modern apps use Connection Handover to switch the actual payload onto [[bluetooth|Bluetooth]] or [[wifi|Wi-Fi]].",
		category: 'protocol-mechanics'
	},
	{
		id: 'atc',
		term: 'ATC (Application Transaction Counter)',
		definition:
			'A monotonically incrementing per-card-instance counter inside an EMV payment application. Every contactless tap binds the per-transaction cryptogram to the current ATC value plus the terminal-supplied Unpredictable Number, making each cryptogram one-time-use: even a perfectly captured tap cannot be replayed because the issuer has already advanced past that ATC. The mechanism that lets contactless payments survive a hostile RF environment.',
		category: 'security'
	},
	{
		id: 'peer',
		term: 'Peer (in WireGuard / VPN context)',
		definition:
			'In [[wireguard|WireGuard]] and similar peer-to-peer VPN designs, a *peer* is one endpoint of a tunnel — identified by its long-lived public key, with associated state for `AllowedIPs`, current endpoint address, last-handshake time, and per-peer transfer counters. Unlike client/server VPNs, both ends of a WireGuard tunnel are peers; either can initiate. The model generalises to mesh VPNs (Tailscale, Nebula, Innernet) where every node is a peer to every other.',
		category: 'networking-basics'
	},
	{
		id: 'voip',
		term: 'VoIP (Voice over IP)',
		definition:
			'Carrying voice telephony over IP networks instead of the legacy circuit-switched PSTN. Signalling is typically [[sip|SIP]] (or older H.323); media is typically [[rtp|RTP]] over [[udp|UDP]] using {{codec|codecs}} like Opus, G.711, or AMR-WB. The transition from PSTN to VoIP is largely complete in the developed world: by 2026 essentially all carrier voice rides on IP somewhere on the path, even when the endpoints are still analog.',
		category: 'infrastructure'
	},
	{
		id: 'fcc',
		term: 'FCC (Federal Communications Commission)',
		definition:
			'The independent US federal regulator of interstate communications by radio, television, wire, satellite, and cable. For networking, the FCC sets {{spectrum|spectrum}} allocation policy (which bands are licensed vs unlicensed, and at what power), administers ISP and broadband regulations, and runs the National Broadband Map. Internet engineers usually meet the FCC through Part 15 unlicensed-radio rules ([[wifi|Wi-Fi]], [[bluetooth|Bluetooth]], [[uwb|UWB]]) and through ISP-tier policy debates around net neutrality and broadband subsidies.',
		category: 'infrastructure'
	},

	// ── Wireless propagation and shared medium ─────────────────────────
	{
		id: 'spectrum',
		term: 'Spectrum',
		definition:
			"The frequency range a wireless protocol is allowed to transmit on. Allocated globally by the **ITU-R**, regionally by **CEPT** (Europe) or **APT** (Asia-Pacific), and nationally by regulators like the {{fcc|FCC}} (US) or Ofcom (UK). Licensed spectrum (auctioned to carriers, predictable QoS) carries [[cellular|cellular]]; unlicensed bands ({{ism-band|ISM}}, U-NII) host [[wifi|Wi-Fi]], [[bluetooth|Bluetooth]], [[zigbee|Zigbee]], [[uwb|UWB]]. Spectrum is the most contested resource in wireless — every gigahertz freed (or reclaimed) is a multi-billion-dollar policy fight.",
		analogy:
			'Real estate on an invisible map. Some plots are auctioned for billions to single carriers; some plots are public parks anyone may build on if they obey the noise ordinance.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Radio_spectrum',
		category: 'networking-basics'
	},
	{
		id: 'csma-ca',
		term: 'CSMA/CA (Collision Avoidance)',
		definition:
			"Carrier Sense Multiple Access with **Collision Avoidance** — the listen-before-talk MAC every wireless protocol uses. A station senses the channel; if busy, it picks a random back-off slot from a contention window and waits. If the channel is still clear when the back-off counter expires, it transmits; if not, it doubles the window and tries again. Every {{unicast|unicast}} {{frame|frame}} must be {{ack|ACKed}} within microseconds — no ACK is presumed to mean collision. Different from wired [[ethernet|Ethernet]]'s CSMA/CD (Collision *Detection*), which is impossible on radio because a transmitter saturates its own receiver and cannot hear another station while sending.",
		analogy:
			'Polite conversation at a dinner party. You pause until nobody is talking, you wait a random extra moment so two polite people do not start at exactly the same time, and if you cannot hear an acknowledgement you assume you were drowned out and try again.',
		wikiUrl: 'https://en.wikipedia.org/wiki/Carrier-sense_multiple_access_with_collision_avoidance',
		category: 'protocol-mechanics'
	},
	{
		id: 'hidden-terminal',
		term: 'Hidden terminal problem',
		definition:
			"In a wireless network, station A and station C may both be in range of {{access-point|AP}} B but **out of range of each other** — so neither hears the other's transmission and both think the channel is clear. The result is repeated collisions at B that the senders cannot detect or back off from. {{csma-ca|CSMA/CA}}'s **RTS/CTS** {{handshake|handshake}} is the optional fix: A sends a tiny *Request To Send* to B, B replies with *Clear To Send*, and every station that hears either falls silent for the announced duration. The same physics motivates [[bluetooth|Bluetooth]]'s master-clocked frequency hopping, [[zigbee|Zigbee]]'s coordinator-led scheduling, and every [[cellular|cellular]] base station's centralised uplink scheduler.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Hidden_node_problem',
		category: 'protocol-mechanics'
	},
	{
		id: 'multipath',
		term: 'Multipath',
		definition:
			"A radio signal that arrives at a receiver via two or more paths (one direct, others reflected off walls/floors/cars) interferes with itself — the copies add constructively or destructively depending on their relative phase, producing rapid fading as the receiver or environment moves. The same physics that ruined 1990s analog cellular calls is the *foundation* of every modern wireless system: **MIMO** (multiple-input multiple-output) treats each reflected path as a separate spatial stream, and **OFDM** ({{ofdma|/OFDMA}}) spreads each symbol across hundreds of narrow subcarriers so only a handful are nulled by a deep fade. Wireless went from \"multipath is the enemy\" to \"multipath is the bandwidth\" in one generation.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Multipath_propagation',
		category: 'networking-basics'
	},
	{
		id: 'airtime',
		term: 'Airtime',
		definition:
			"The fraction of a wireless channel's wall-clock time consumed by a station's transmissions, including all the protocol overhead — DIFS/SIFS gaps, {{ack|ACK}} frames, contention back-off, beacons, and management traffic. The right unit for measuring fairness on a shared medium: two stations with the *same* throughput target consume very different airtime if one is on a slow MCS at the cell edge. Modern access points implement **airtime fairness** so a slow client cannot starve fast ones — the alternative is the *slow-station throughput collapse* that classic 802.11 was famous for.",
		category: 'networking-basics'
	},

	// ── Wi-Fi specifics ────────────────────────────────────────────────
	{
		id: 'ofdma',
		term: 'OFDMA (Orthogonal Frequency-Division Multiple Access)',
		definition:
			"The multi-user upgrade to OFDM. Where plain OFDM splits one transmission across many orthogonal subcarriers, OFDMA lets the {{access-point|AP}} assign **subsets of subcarriers** (called Resource Units) to *different* clients in the same symbol — like turning a single highway into multiple narrower lanes. Introduced to [[wifi|Wi-Fi]] in 802.11ax ([[wifi|Wi-Fi]] 6, 2020); the core multiple-access method of [[cellular|4G LTE]] and [[cellular|5G NR]] since 2008. The reason a Wi-Fi 6 {{access-point|AP}} can serve 30 phones in a coffee shop without each one paying the full per-transmission overhead the way Wi-Fi 5 did.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Orthogonal_frequency-division_multiple_access',
		category: 'protocol-mechanics'
	},
	{
		id: 'mlo',
		term: 'MLO (Multi-Link Operation)',
		definition:
			"The flagship feature of [[wifi|Wi-Fi]] 7 (802.11be, 2024). A single client connection spans 2.4 + 5 + 6 GHz radios simultaneously — frames can be sent on whichever band is least congested, and {{tail-latency|tail latency}} on a busy network drops sharply. The catch in shipping silicon is that most MLO is **eMLSR** (Enhanced Multi-Link Single Radio): one radio time-sliced across bands. True simultaneous transmit-receive (STR) across bands is rare. The win is *latency consistency*, not raw aggregate throughput.",
		category: 'protocol-mechanics'
	},
	{
		id: 'bss-coloring',
		term: 'BSS Coloring',
		definition:
			"A 6-bit *Basic Service Set Color* field added to 802.11ax ([[wifi|Wi-Fi]] 6) frames so stations can distinguish their own AP's transmissions from a neighbour's on the same channel. If an incoming frame's color differs, the receiver can apply a relaxed clear-channel threshold and transmit anyway — recovering airtime that classic carrier sense would have forfeited. The fix for the *2.4 GHz death spiral* in dense apartment buildings where 20+ APs share three non-overlapping channels.",
		category: 'protocol-mechanics'
	},
	{
		id: 'target-wake-time',
		term: 'Target Wake Time (TWT)',
		definition:
			"802.11ax mechanism that lets a client and {{access-point|AP}} pre-negotiate exact wake-up windows so the client's radio can stay deeply asleep between scheduled appointments. Originally for low-power IoT (years on a coin cell); now also used by smartphones to extend battery life on busy networks. The Wi-Fi analogue of [[cellular|cellular]]'s DRX paging cycle.",
		category: 'protocol-mechanics'
	},
	{
		id: 'wpa3',
		term: 'WPA3',
		definition:
			"[[wifi|Wi-Fi]] Protected Access 3, announced by the [[wifi|Wi-Fi]] Alliance in January 2018, mandatory for [[wifi|Wi-Fi]] CERTIFIED 6 products from July 2020. Replaces WPA2's PSK with {{sae|SAE}} (Simultaneous Authentication of Equals) — a {{pfs|forward-secret}} dragonfly {{handshake|handshake}} that resists the offline dictionary attacks that broke WPA2 after {{krack|KRACK}}. Also adds 192-bit Enterprise mode, Easy Connect (DPP) for QR-code provisioning, and OWE (Opportunistic Wireless Encryption) for open networks.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#WPA3',
		category: 'security'
	},
	{
		id: 'sae',
		term: 'SAE (Simultaneous Authentication of Equals)',
		definition:
			"The {{handshake|handshake}} at the heart of {{wpa3|WPA3}}-Personal. A *dragonfly* key {{exchange|exchange}} (RFC 7664) where both parties prove knowledge of the passphrase without ever sending it or anything derived from it that an eavesdropper could grind against a dictionary. Each session derives a fresh Pairwise Master Key with {{pfs|forward secrecy}}. Replaces WPA2-PSK's four-way {{handshake|handshake}} that {{krack|KRACK}} broke in 2017.",
		category: 'security'
	},
	{
		id: 'krack',
		term: 'KRACK (Key Reinstallation Attack)',
		definition:
			"Mathy Vanhoef and Frank Piessens, USENIX Security 2017. The WPA2 four-way {{handshake|handshake}} could be tricked into reinstalling an already-used encryption key, resetting the per-packet {{iv|nonce}} counter and defeating CCMP integrity. **Universal — every WPA2 client on Earth needed firmware updates.** Drove the {{wpa3|WPA3}} / {{sae|SAE}} replacement, which is immune by construction. First entry in Vanhoef's biennial schedule of breaking [[wifi|Wi-Fi]] in public (Dragonblood 2019, FragAttacks 2021, Framing Frames 2023, SSID Confusion 2024).",
		wikiUrl: 'https://en.wikipedia.org/wiki/KRACK',
		category: 'security'
	},
	{
		id: 'afc',
		term: 'AFC (Automated Frequency Coordination)',
		definition:
			"A cloud service that arbitrates [[wifi|Wi-Fi]] use of the 6 GHz Standard-Power band against existing incumbent licensees (fixed microwave links, satellite services). A 6 GHz Wi-Fi {{access-point|AP}} queries an AFC operator with its location and antenna parameters; the AFC returns the channels and EIRP limits it may use without interfering with incumbents. The {{fcc|FCC}} approved seven AFC operators (Qualcomm, Federated Wireless, Sony, Comsearch, [[wifi|Wi-Fi]] Alliance Services, WBA, Broadcom) on 23 February 2024 — the regulatory machinery without which 6 GHz Standard Power would not exist.",
		category: 'infrastructure'
	},

	// ── Bluetooth specifics ────────────────────────────────────────────
	{
		id: 'frequency-hopping',
		term: 'Frequency-Hopping Spread Spectrum (FHSS)',
		definition:
			"Splitting a transmission across many narrow channels and hopping rapidly between them on a pseudo-random schedule both sides know. Invented (and patented) by Hedy Lamarr and George Antheil in 1941 as a torpedo-guidance scheme. [[bluetooth|Bluetooth]] BR/EDR uses 79 × 1 MHz channels at 1,600 hops/sec; {{ble|BLE}} hops 40 × 2 MHz channels once per connection event. Two consequences: (1) microwave-oven leakage on a single frequency only knocks out a fraction of hops, and (2) sniffing the traffic requires following the hop pattern, which is keyed to the master's address and clock.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Frequency-hopping_spread_spectrum',
		category: 'protocol-mechanics'
	},
	{
		id: 'le-audio',
		term: 'LE Audio',
		definition:
			"The 2020+ [[bluetooth|Bluetooth]] audio architecture, defined across Core 5.2+ and a stack of profiles (BAP, PBP, TMAP, HAP). Replaces Classic A2DP/HFP with **Isochronous Channels** — Connected Isochronous Streams (CIS) for {{unicast|unicast}} earbuds and hearing aids, Broadcast Isochronous Streams (BIS) for {{auracast|Auracast}} one-to-many. Mandatory {{codec|codec}} is {{lc3|LC3}}. Cuts audio power by roughly half versus A2DP and brings true stereo, multi-stream, and hearing-aid-grade reliability under one umbrella.",
		category: 'protocol-mechanics'
	},
	{
		id: 'lc3',
		term: 'LC3 (Low Complexity Communications Codec)',
		definition:
			"Mandatory {{codec|codec}} of {{le-audio|LE Audio}}, standardised by the [[bluetooth|Bluetooth]] SIG in January 2020 (Ericsson + Fraunhofer IIS). Replaces 1990s SBC. Roughly 2× more battery-efficient than SBC at equivalent quality, 8–48 kHz sample rates, 16–320 kbit/s. The codec underneath every modern earbud and hearing aid shipping {{le-audio|LE Audio}}.",
		category: 'protocol-mechanics'
	},
	{
		id: 'auracast',
		term: 'Auracast',
		definition:
			"The [[bluetooth|Bluetooth]] SIG's brand for **Broadcast Isochronous Streams** (BIS) — one transmitter to unlimited listeners over {{le-audio|LE Audio}} + {{lc3|LC3}}. Public venues (airports, theatres, gyms, lecture halls) replace analog hearing-loops with an Auracast broadcast; nearby listeners scan, pick a stream, and tune in. **Frankfurt Airport became the first airport to broadcast all gate announcements over Auracast on 28 January 2026.** The hearing-aid accessibility story is the killer app.",
		category: 'protocol-mechanics'
	},
	{
		id: 'channel-sounding',
		term: 'Channel Sounding',
		definition:
			"Centimetre-class distance measurement added to [[bluetooth|Bluetooth]] 6.0 (adopted 3 September 2024). Two devices in a normal LL connection schedule Channel Sounding events on a new LE 2M 2BT PHY and measure both signal **phase** across many frequencies (Phase-Based Ranging) and **round-trip time** of timestamped packets; the combination yields cm-accurate distance up to ~150 m. The protocol-level reply to [[uwb|UWB]] for digital car keys, anti-stalking tags, and proximity-aware locks.",
		category: 'protocol-mechanics'
	},
	{
		id: 'rpa',
		term: 'RPA (Resolvable Private Address)',
		definition:
			"A 48-bit Bluetooth LE address that *looks* random but is derivable from a long-lived Identity Resolving Key (IRK) the two paired devices share. Rotated every ~15 minutes by default. A bonded peer recomputes the expected RPA from the IRK and recognises its partner; a stranger sees only noise. The mechanism that prevents long-term tracking of {{ble|BLE}} devices by sniffers — important for AirTags, AirPods, fitness wearables, and any device a person carries on their body all day.",
		category: 'security'
	},
	{
		id: 'knob-attack',
		term: 'KNOB / BIAS / BLUFFS',
		definition:
			"Three [[bluetooth|Bluetooth]] BR/EDR session-security breaks by the same author (Daniele Antonioli) in five years. **KNOB** (CVE-2019-9506) downgrades the entropy of the negotiated session key to 1 byte — brute-forceable. **BIAS** (CVE-2020-10135) impersonates a previously-bonded peer by abusing role-switch in Legacy Secure Connections. **BLUFFS** (CVE-2023-24023) breaks forward secrecy by forcing reuse of a session-key derivation across reconnections. Every BR/EDR device shipped before mid-2024 is affected; the Core 5.4 / 6.0 patches add explicit minimum-entropy and key-diversification checks.",
		wikiUrl: 'https://en.wikipedia.org/wiki/KNOB_attack',
		category: 'security'
	},

	// ── Cellular specifics ────────────────────────────────────────────
	{
		id: '3gpp',
		term: '3GPP (3rd Generation Partnership Project)',
		definition:
			"The umbrella standards body that owns the [[cellular|cellular]] family from GSM through 5G NR and (soon) 6G. Founded December 1998 as a partnership of regional SDOs (ETSI/Europe, ATIS/USA, TTA/Korea, ARIB+TTC/Japan, CCSA/China, TSDSI/India). Specifications are organised by *Release*: Release 8 (LTE, 2008), Release 15 (5G NR, 2018), Release 18 (5G-Advanced, frozen June 2024), Release 19/20 in flight. Every spec is free to download from 3gpp.org — the largest free technical library in telecommunications.",
		wikiUrl: 'https://en.wikipedia.org/wiki/3GPP',
		category: 'infrastructure'
	},
	{
		id: 'gsma',
		term: 'GSMA (GSM Association)',
		definition:
			"The trade association of mobile network operators — ~750 carriers plus ~400 ecosystem members. Distinct from {{3gpp|3GPP}}, which writes the technical specs; the GSMA owns the *commercial* layer: IR.21 roaming agreements, BA.51 RCS, FS.36 SS7/Diameter security, the eSIM Architecture, and Mobile World Congress every February in Barcelona. The body operators belong to; 3GPP is the body engineers contribute specs to.",
		wikiUrl: 'https://en.wikipedia.org/wiki/GSMA',
		category: 'infrastructure'
	},
	{
		id: 'lte',
		term: 'LTE (Long Term Evolution / 4G)',
		definition:
			"{{3gpp|3GPP}} Release 8, frozen December 2008. Abandoned WCDMA's spreading codes for an {{ofdma|OFDMA}}+SC-FDMA air interface that scales linearly with spectrum width — the clean-sheet radio that every 5G NR design choice evolves from. Still the universal floor in 2026: a 5G phone falls back to LTE everywhere 5G coverage is patchy, and **NB-IoT / LTE-M / Cat-M1** continue to run on LTE for low-bandwidth, long-battery-life IoT.",
		wikiUrl: 'https://en.wikipedia.org/wiki/LTE_(telecommunication)',
		category: 'protocol-mechanics'
	},
	{
		id: '5g-nr',
		term: '5G NR (New Radio)',
		definition:
			"{{3gpp|3GPP}} Release 15, frozen June 2018. The 5G air interface: scalable {{ofdma|OFDMA}} numerology (15/30/60/120/240 kHz subcarrier spacing) addressing sub-6 GHz (FR1) and {{mmwave|mmWave}} (FR2), service-based 5G Core, network slicing, ultra-reliable low-latency (URLLC), and mMTC for massive IoT. **5G Standalone** (no LTE anchor) deployments arrived 2020–2021; **5G-Advanced** is Release 18 (June 2024).",
		wikiUrl: 'https://en.wikipedia.org/wiki/5G_NR',
		category: 'protocol-mechanics'
	},
	{
		id: 'mmwave',
		term: 'mmWave',
		definition:
			"Millimetre-wave radio bands — typically 24–52 GHz for 5G NR FR2, plus 60 GHz for WiGig and 28/39 GHz for fixed wireless. Enormous bandwidth (hundreds of MHz of contiguous spectrum), gigabit speeds, line-of-sight only, ~20 dB attenuation through a wet leaf. Deployed mostly in stadiums, dense urban hotspots, and fixed-wireless backhaul rather than wide-area mobile.",
		category: 'networking-basics'
	},
	{
		id: 'ran',
		term: 'RAN (Radio Access Network)',
		definition:
			"The set of base stations and the protocol stack between them and the carrier core — the *radio side* of a [[cellular|cellular]] network. In 5G the base station is the **gNB** (gNodeB), in 4G it was the **eNB** (eNodeB). The RAN handles the PHY/MAC/RLC/PDCP/RRC stack on the air interface and tunnels user traffic into the core over **GTP-U** on the N3 interface. **Open RAN** is the disaggregated alternative where vendor-neutral hardware and software replace vertically-integrated boxes (Vodafone UK, Rakuten Symphony, DISH on AWS Wavelength).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Radio_access_network',
		category: 'infrastructure'
	},
	{
		id: 'harq',
		term: 'HARQ (Hybrid ARQ)',
		definition:
			"How a [[cellular|cellular]] radio combines forward error correction with {{retransmission|retransmission}}. The receiver stores soft-decoded log-likelihood ratios (LLRs) from a failed transmission and combines them with the retransmitted copy (chase-combining) or with additional parity bits (incremental-redundancy). 8 parallel stop-and-wait HARQ processes per UE keep the pipe full without {{head-of-line-blocking|head-of-line blocking}}. The reason cellular reaches ~99.999% link reliability without [[tcp|TCP]]'s retransmit cost on the air.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Hybrid_automatic_repeat_request',
		category: 'protocol-mechanics'
	},
	{
		id: 'ims',
		term: 'IMS (IP Multimedia Subsystem)',
		definition:
			"{{3gpp|3GPP}}'s [[sip|SIP]]-based voice/video framework — the protocol stack that carries every carrier voice call in 2026 over IP rather than the legacy circuit-switched core. Defined originally for 3G (TS 23.228, 2002). Today it underpins **{{volte|VoLTE}}**, **VoNR** (Voice over New Radio), **Wi-Fi Calling** (via the ePDG IPsec gateway), and **RCS** (Rich Communication Services). The largest [[sip|SIP]] deployment on Earth — every carrier voice call is a SIP INVITE inside an IMS bearer.",
		category: 'protocol-mechanics'
	},
	{
		id: 'volte',
		term: 'VoLTE / VoNR',
		definition:
			"**Voice over LTE** and **Voice over New Radio** — packetised carrier voice over the LTE or 5G data bearer, signalled by {{ims|IMS}} [[sip|SIP]] and carried over [[rtp|RTP]] using the AMR-WB or EVS {{codec|codec}}. Replaces the legacy 2G/3G circuit-switched voice fallback. GSMA reports 310+ commercial VoLTE operators in 140+ countries and 45+ commercial VoNR networks by 2025. **Wi-Fi Calling** is the same IMS stack tunneled to the carrier over [[ipsec|IPsec]] from any IP network.",
		category: 'protocol-mechanics'
	},
	{
		id: 'sba',
		term: 'SBA (Service-Based Architecture)',
		definition:
			"The 5G Core architecture — dozens of named **network functions** (AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF…) talking to each other over [[http2|HTTP/2]] with {{json|JSON}} payloads protected by [[tls|TLS]]. Replaces 4G's EPC zoo of monolithic boxes (MME/SGW/PGW/HSS/PCRF) glued by GTP and {{diameter|Diameter}}. **The control plane of every modern 5G carrier on Earth is now an [[http2|HTTP/2]] {{service-mesh|microservice fabric}}** — and every backhaul {{hop|hop}} between RAN and core is wrapped in [[ipsec|IPsec ESP]] per 3GPP TS 33.501.",
		category: 'infrastructure'
	},
	{
		id: 'gtp-u',
		term: 'GTP-U (GPRS Tunnelling Protocol — User plane)',
		definition:
			"The tunnel that carries user-plane [[ip|IP]] packets from the [[cellular|cellular]] base station to the User Plane Function (UPF) in the core, over [[udp|UDP]]/2152. Each PDU session has a 32-bit **Tunnel Endpoint Identifier (TEID)** that lets the UPF demultiplex millions of phones over one tunnel-aggregating UDP socket. GTP-U preserves the UE's [[ip|IP]] address as the inner-packet source/destination *regardless* of which base station the UE is camping on — this is how your phone keeps its IP across handovers between cells.",
		category: 'protocol-mechanics'
	},
	{
		id: 'ss7',
		term: 'SS7 (Signalling System No. 7)',
		definition:
			"The 1975 ITU-T signalling stack that runs between carrier switches — for half a century the protocol that set up your voice calls, routed your SMS, and handled your roaming. Designed in an era of implicit trust between carriers. Modern surveillance actors exploit SS7 routing to silently track mobile users worldwide (Citizen Lab 2024–25, CISA testimony to {{fcc|FCC}} 2024). Partially replaced by {{diameter|Diameter}} for LTE and by 5GC's authenticated SBI for 5G — but the SS7 layer below is still everywhere underneath.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Signalling_System_No._7',
		category: 'infrastructure'
	},
	{
		id: 'diameter',
		term: 'Diameter',
		definition:
			"The {{aaa|AAA}} (authentication, authorisation, accounting) protocol used by LTE's EPC, the LTE/5G interconnect between carriers, and IMS. {{ietf|IETF}} RFC 6733 (2012) — the successor to RADIUS, with TCP/SCTP transport, mandatory [[tls|TLS]]/[[ipsec|IPsec]] options, and a richer attribute system. Carries the post-{{ss7|SS7}} signalling that handles roaming charging, online charging, and policy control. Like SS7, it was designed for trusted carrier-to-carrier links — abuse (DoS, location-tracking, SMS interception) by malicious peers remains a real-world problem.",
		category: 'protocol-mechanics'
	},
	{
		id: 'aaa',
		term: 'AAA (Authentication, Authorisation, Accounting)',
		definition:
			"The three-question framework every access network asks: who are you, what may you do, what did you do? RADIUS (RFC 2865, 1997) was the original; {{diameter|Diameter}} replaced it for [[cellular|cellular]]; modern OIDC/[[oauth2|OAuth]] flows generalise it for web applications. The protocol-shaped hole every enterprise authentication system fills.",
		category: 'security'
	},
	{
		id: 'sim-usim',
		term: 'SIM / USIM / eSIM',
		definition:
			"The cryptographic root of trust in every [[cellular|cellular]] device. The **SIM** (Subscriber Identity Module) was a contact smart card that stored the IMSI, the long-term key K, and the AKA authentication algorithm. The **USIM** is its 3G/4G/5G successor with mutual authentication. **eSIM** (embedded SIM) replaces the physical card with a chip soldered to the phone, provisioned over-the-air via GSMA RSP. **iSIM** integrates the SIM directly into the main SoC. The K is the secret that, when burned, lets a carrier authenticate a subscriber for the device's lifetime — and was the target of the 2015 Gemalto SIM-key heist.",
		wikiUrl: 'https://en.wikipedia.org/wiki/SIM_card',
		category: 'security'
	},

	// ── Zigbee / Thread / Matter ──────────────────────────────────────
	{
		id: 'thread',
		term: 'Thread',
		definition:
			"An [[ipv6|IPv6]]-native low-power mesh protocol on {{ieee-802-15-4|IEEE 802.15.4}} radios, governed by the Thread Group (Nest/Google, Apple, Samsung, ARM, Silicon Labs, NXP, +). Where [[zigbee|Zigbee]] grew its own application layer ({{zcl|ZCL}}), Thread carries native IPv6 over **6LoWPAN** {{header|header compression}} and **MLE** (Mesh Link Establishment) routing — so a Thread device gets an IPv6 address and is reachable like any other host. Thread 1.4 (December 2024) introduced **Thread Border Routers** as multi-vendor commodity hardware. The radio layer of {{matter|Matter}} that is not Wi-Fi.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Thread_(network_protocol)',
		category: 'networking-basics'
	},
	{
		id: 'border-router',
		term: 'Border Router (Thread)',
		definition:
			"A bilingual device — typically a HomePod, Apple TV 4K, Google Nest Hub, Amazon Echo Hub, or Aqara M3 — that bridges a {{thread|Thread}} mesh to your home [[ipv6|IPv6]] network. Routes packets between the 802.15.4 mesh and Wi-Fi/Ethernet, hands out IPv6 prefixes via SLAAC, runs DNS-SD ({{mdns|mDNS}}) for service discovery, and (in Thread 1.4) supports multi-vendor mesh extension. The hardware story of {{matter|Matter}}'s 2022 launch was: every smart-speaker line had to become a Thread Border Router.",
		category: 'infrastructure'
	},
	{
		id: 'dynamic-link-key',
		term: 'Dynamic Link Key (DLK)',
		definition:
			"The 2023 [[zigbee|Zigbee]] R23 (Pro 2023) improvement that closes the *ZigBeeAlliance09* default-key sniffer-at-join hole. New joining devices and the {{trust-center|Trust Center}} run a **SPEKE** (Simple Password-Authenticated Key Exchange) handshake over Curve25519, deriving a unique link key per device without any pre-shared secret. Mandatory for Coordinators in R23, optional for end devices. The Zigbee analogue of WPA3's {{sae|SAE}} replacement of WPA2-PSK.",
		category: 'security'
	},
	{
		id: 'mdns',
		term: 'mDNS / DNS-SD',
		definition:
			"Multicast DNS (RFC 6762) and DNS Service Discovery (RFC 6763). Lets a device on a local link discover services without any configured resolver — the device queries `_googlecast._tcp.local`, `_airplay._tcp.local`, `_matter._tcp.local`, etc., over multicast UDP/5353, and any host providing the service answers. Designed by [[pioneer:stuart-cheshire|Stuart Cheshire]] at Apple. Underneath Bonjour, AirPlay, Matter device discovery, and {{thread|Thread}} Border Router service advertisement.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Multicast_DNS',
		category: 'protocol-mechanics'
	},

	// ── Spectrum frontier ─────────────────────────────────────────────
	{
		id: 'wrc',
		term: 'WRC (World Radiocommunication Conference)',
		definition:
			"The ITU-R conference held every 3–4 years where the world's spectrum allocations are renegotiated by treaty. **WRC-23** (Dubai, November–December 2023) added 6 GHz to [[cellular|IMT-2020]] on a co-primary basis with Wi-Fi — kicking off the EU's contested 6 GHz upper-band decision. **WRC-27** is targeted to study terahertz bands for 6G and harmonise satellite direct-to-cell. Spectrum policy moves on a four-year clock; the technology runs ten years faster.",
		category: 'infrastructure'
	},
	{
		id: 'ntn',
		term: 'NTN (Non-Terrestrial Networks)',
		definition:
			"{{3gpp|3GPP}}'s normalised vocabulary for satellite components of [[cellular|cellular]] networks. Release 17 (March 2022) added NTN as a first-class radio access type. Splits into **NB-IoT NTN** (narrowband, low-data IoT terminals), **NR NTN** (standard 5G phones), and **Direct-to-Cell** (satellites act as base stations for ordinary handsets in standard bands n255/n256). The frame that contains Starlink Direct-to-Cell, AST SpaceMobile, and Iridium NTN-ready successors.",
		category: 'infrastructure'
	},
	{
		id: 'direct-to-cell',
		term: 'Direct-to-Cell',
		definition:
			"Satellite-to-standard-phone connectivity using ordinary [[cellular|cellular]] terrestrial bands (typically n25/n26) rather than handheld satellite-terminal hardware. T-Mobile + SpaceX Starlink launched commercial Direct-to-Cell in **January 2025** for SMS and emergency, with voice and data on a roadmap. AT&T's AST SpaceMobile and Apple's Globalstar Emergency SOS partnership follow similar patterns. Reshapes \"coverage\" as a concept: \"no signal\" no longer means *no signal*.",
		category: 'infrastructure'
	},
	{
		id: 'ambient-iot',
		term: 'Ambient IoT',
		definition:
			"{{3gpp|3GPP}}'s working name (Release 19/20 study items) for battery-less or near-battery-less [[cellular|cellular]] IoT — devices that harvest energy from RF, light, or motion and transmit tiny payloads. Targets logistics tagging, inventory, agriculture sensing — the niches passive RFID owns today. Expected to ship in late-2020s 6G releases.",
		category: 'networking-basics'
	},
	{
		id: 'lpwan',
		term: 'LPWAN (Low-Power Wide-Area Network)',
		definition:
			"The family of long-range, low-data-rate, multi-year-battery wireless protocols that sit between [[wifi|Wi-Fi]] and [[cellular|cellular]]. **LoRaWAN** (sub-GHz, ALOHA-style, 125M+ devices deployed by end-2025), **Sigfox** (slow-modulation 100 bit/s ultra-narrowband, France-originated), **NB-IoT** and **LTE-M** ([[cellular|cellular]]-licensed alternatives inside [[cellular|LTE]] spectrum). All trade throughput for kilometres of range and years of battery life.",
		wikiUrl: 'https://en.wikipedia.org/wiki/LPWAN',
		category: 'networking-basics'
	},
	{
		id: 'cbrs',
		term: 'CBRS (Citizens Broadband Radio Service)',
		definition:
			"The US 3.55–3.7 GHz band ({{fcc|FCC}} Part 96, 2015) governed by a three-tier **Spectrum Access System**: incumbent Navy radars get priority, Priority Access Licensees (PALs) auctioned in 2020, and General Authorized Access for anyone else with a certified device. Powers Private 4G LTE / 5G deployments at ports, mines, hospitals, and stadiums — the largest production use of *dynamic spectrum sharing* anywhere. The US regulator's experiment in moving from static licensing to database-arbitrated coexistence.",
		category: 'infrastructure'
	},
	{
		id: 'wifi-sensing',
		term: 'Wi-Fi sensing (802.11bf)',
		definition:
			"Using the Channel State Information (CSI) that [[wifi|Wi-Fi]] radios already compute for {{multipath|multipath}} equalisation to *detect* people, motion, and breathing — radio waves as occupancy sensors. Standardised in **IEEE 802.11bf-2025** (published 26 September 2025), covering 1–7.125 GHz and >45 GHz bands. Lets a home Wi-Fi mesh do presence detection without a camera or PIR sensor.",
		category: 'protocol-mechanics'
	},
	{
		id: 'rssi',
		term: 'RSSI (Received Signal Strength Indicator)',
		definition:
			"A receiver's estimate of the power level of a received radio signal, in dBm. The cheap default for proximity heuristics — a higher RSSI is *correlated* with closer distance — but is **fundamentally untrustworthy** as a security primitive because a relay attacker can re-transmit at higher power and make a distant device look near. The 2022 Tesla Model 3 BLE relay attack made this textbook. Modern secure-proximity protocols ({{ccc-digital-key|CCC Digital Key 3.0+}}, {{channel-sounding|Bluetooth Channel Sounding}}, [[uwb|UWB]] {{sts|STS}}) replaced RSSI heuristics with {{tof-ranging|time-of-flight}} measurements because *the speed of light is the hard upper bound that no relay can shorten*.",
		category: 'protocol-mechanics'
	},
	{
		id: 'rfid',
		term: 'RFID (Radio Frequency Identification)',
		definition:
			"The umbrella term for passive transponder systems that respond to a reader's RF field — the parent technology of [[nfc|NFC]]. The 1973 Charles Walton US Patent 3,752,960 is the foundational reference. Modern variants span LF (125 kHz, old proximity cards), HF (13.56 MHz — the same {{ism-band|ISM band}} NFC uses, ISO 14443 + 15693), and UHF (860–960 MHz, EPC Gen2 — the labels on retail clothing and warehouse pallets). NFC is *one specific HF variant* of RFID with bidirectional data flow and an application-layer stack on top.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Radio-frequency_identification',
		category: 'networking-basics'
	},

	// ── Major operators, vendors & products ─────────────────────────────
	{
		id: 'cloudflare',
		term: 'Cloudflare',
		definition:
			"Major CDN, DDoS-mitigation, and reverse-proxy operator founded 2009. Runs ~330 PoPs, serves ~20% of all websites by some measures, and authored or co-authored several internet standards ([[quic|QUIC]] adoption, {{ech|ECH}}, {{rpki|RPKI}} measurement at radar.cloudflare.com). Runs the **1.1.1.1** public DNS resolver. Their post-mortems are a major source of public outage learning.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Cloudflare',
		category: 'infrastructure'
	},
	{
		id: 'google',
		term: 'Google',
		definition:
			"Search, YouTube, and Android operator that has driven a disproportionate share of post-2008 internet protocol design. Authored {{spdy|SPDY}} (became [[http2|HTTP/2]]), [[quic|QUIC]] (became [[http3|HTTP/3]]), {{bbr|BBR}}, [[webrtc|WebRTC]] adoption, the public **8.8.8.8** DNS resolver, and runs **Jupiter** — one of the largest internal datacenter fabrics on earth.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Google',
		category: 'infrastructure'
	},
	{
		id: 'apple',
		term: 'Apple',
		definition:
			"Largest single force shaping client-side wireless and codec choices: [[hls|HLS]] (2009), {{airdrop|AirDrop}}, AirPlay, the **U1 / U2 ultra-wideband** chips (2019/2024) that drove {{ccc-digital-key|CCC Digital Key}} and AirTag, the iCloud Private Relay [[quic|QUIC]] deployment, and the first {{matter|Matter}} thread-border-router shipments. Their device share gives any default they pick (X25519MLKEM768, post-quantum [[tls|TLS]], etc.) immediate global reach.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Apple_Inc.',
		category: 'infrastructure'
	},
	{
		id: 'microsoft',
		term: 'Microsoft',
		definition:
			"Operator of Azure, GitHub, and the Windows networking stack. Co-author of [[websockets|WebSockets]] adoption, [[mptcp|MPTCP]] early experiments, the Azure Service Bus [[amqp|AMQP]] deployment, and the SMB/SMB-Direct file-sharing protocols. Owns LinkedIn (the largest documented [[kafka|Kafka]] deployment on earth, >7 trillion messages/day).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Microsoft',
		category: 'infrastructure'
	},
	{
		id: 'meta',
		term: 'Meta',
		definition:
			"Operator of Facebook, Instagram, WhatsApp, and Messenger (the largest [[mqtt|MQTT]] deployment in the world). Major contributor to **mvfst** (open-source [[quic|QUIC]]), {{zstd|zstd}} compression, RDMA-over-Ethernet at scale, and several {{ietf|IETF}} working groups around Media-over-QUIC and {{l4s|L4S}}.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Meta_Platforms',
		category: 'infrastructure'
	},
	{
		id: 'amazon',
		term: 'Amazon / AWS',
		definition:
			"Amazon Web Services is the largest public-cloud operator and a major IETF participant via the **s2n** [[tls|TLS]] library, the **Nitro** SmartNIC line, and S3's role as the substrate underneath Diskless [[kafka|Kafka]] (KIP-1150) and WarpStream. AWS IoT Core is one of the largest managed [[mqtt|MQTT]] deployments.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Amazon_Web_Services',
		category: 'infrastructure'
	},
	{
		id: 'nvidia',
		term: 'NVIDIA',
		definition:
			"GPU and networking-silicon vendor (acquired Mellanox 2020) that drives modern AI-fabric design. Ships InfiniBand and **Spectrum-X** [[ethernet|Ethernet]] switches, Quantum-X / Spectrum-X co-packaged-optics chips, and BlueField DPUs. Joined the {{uec|Ultra Ethernet Consortium}} after long InfiniBand allegiance — a turning point for AI datacenter networking.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Nvidia',
		category: 'infrastructure'
	},
	{
		id: 'cisco',
		term: 'Cisco',
		definition:
			"The dominant enterprise router and switch vendor since the 1990s. Built **IOS**, the canonical CLI networking-equipment shell, ran some of the most influential [[bgp|BGP]] reference implementations, and authored or co-authored major early {{ietf|IETF}} routing-protocol work. Acquired Webex (2007) and Meraki (2012); 2023–2025 spent rebuilding its security stack around Splunk and Robust Intelligence.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Cisco',
		category: 'infrastructure'
	},
	{
		id: 'juniper',
		term: 'Juniper Networks',
		definition:
			"Carrier-grade router vendor founded 1996, the second pillar of internet backbone routing alongside [[cisco|Cisco]]. **Junos OS** is the canonical FreeBSD-derived router OS. Acquired by HPE in **1 July 2025** for $14 billion.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Juniper_Networks',
		category: 'infrastructure'
	},
	{
		id: 'broadcom',
		term: 'Broadcom',
		definition:
			"Switch-silicon and connectivity-chip vendor that ships **Tomahawk**, **Trident**, and **Jericho** Ethernet ASICs — the building blocks under most hyperscale datacenter switches. Acquired VMware in 2023. Tomahawk 6 (June 2025) was the first 102.4 Tbps single-chip Ethernet switch.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Broadcom',
		category: 'infrastructure'
	},
	{
		id: 'intel',
		term: 'Intel',
		definition:
			"Made one half of the DIX [[ethernet|Ethernet]] specification with [[pioneer:bob-metcalfe|Bob Metcalfe]]'s Xerox and DEC (1980), and has shipped the dominant server NIC line (E810, E830) ever since. Co-author of [[quic|QUIC]]-hardware-offload designs and a long-time {{ietf|IETF}} participant.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Intel',
		category: 'infrastructure'
	},
	{
		id: 'starlink',
		term: 'Starlink',
		definition:
			"SpaceX's low-Earth-orbit satellite internet constellation, commercial since 2020. ~7,000 active satellites by 2026, end-user terminals priced for individuals rather than enterprises, and the **Direct-to-Cell** partnership (T-Mobile, KDDI, Optus, Rogers) is rolling out unmodified-handset SMS and slow-data over LEO using [[cellular|cellular]] band n25/n26 — a structural change to the cellular dead-zone problem.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Starlink',
		category: 'infrastructure'
	},

	// ── Operating systems & tools ───────────────────────────────────────
	{
		id: 'linux',
		term: 'Linux',
		definition:
			"The dominant server, router, and embedded operating system, started by Linus Torvalds in 1991. Owns the canonical implementations of [[tcp|TCP]] {{cubic|CUBIC}} (2.6.19+), {{bbr|BBR}} (4.9+), [[wireguard|WireGuard]] (5.6+), eBPF, XDP, and {{l4s|L4S}}. The reference platform every other OS measures itself against on the network stack.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Linux',
		category: 'infrastructure'
	},
	{
		id: 'bsd',
		term: 'BSD (Berkeley Software Distribution)',
		definition:
			"The UC-Berkeley UNIX descendant whose **4.2BSD** (1983) shipped the original [[tcp|TCP]]/[[ip|IP]] reference implementation that almost every later stack inherited. Living descendants: **FreeBSD** (Netflix CDN, WhatsApp), **OpenBSD** (OpenSSH, [[wireguard|WireGuard]]'s userland), **NetBSD**, **DragonFly BSD**, and macOS / iOS (XNU's Mach + FreeBSD core).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Berkeley_Software_Distribution',
		category: 'infrastructure'
	},
	{
		id: 'wireshark',
		term: 'Wireshark',
		definition:
			"The de-facto open-source packet analyser, originally **Ethereal** (1998). Reads pcap/pcapng files, decodes hundreds of protocols (TCP, TLS, QUIC, BGP, SIP, MQTT, CoAP, EMV — almost everything in this catalogue), and is the universal tool when a protocol does not do what its spec says. Recent releases (4.4, late 2024) added decryption for [[tls|TLS]] 1.3 with key-log files and pcap-over-[[quic|QUIC]] capture.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Wireshark',
		category: 'infrastructure'
	},

	// ── Networking basics ───────────────────────────────────────────────
	{
		id: 'iot',
		term: 'IoT (Internet of Things)',
		definition:
			"The umbrella term for networked physical objects — sensors, actuators, smart-home devices, industrial controllers — that talk over [[mqtt|MQTT]], [[coap|CoAP]], {{thread|Thread}}, [[zigbee|Zigbee]], {{matter|Matter}}, or constrained [[cellular|cellular]] radios (NB-IoT, LTE-M). The defining constraints are *small RAM, small power budgets, intermittent connectivity, and a 10+ year deployment lifetime* — which is why every IoT protocol obsesses about byte counts and battery-friendly handshakes.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_of_things',
		category: 'networking-basics'
	},
	{
		id: 'lan',
		term: 'LAN (Local Area Network)',
		definition:
			"A network confined to a building or campus — usually [[ethernet|Ethernet]] + [[wifi|Wi-Fi]] under a single {{broadcast|broadcast}} domain or {{vlan|VLAN}}. LANs are where [[arp|ARP]], [[dhcp|DHCP]], and link-layer discovery protocols ([[mdns-dns-sd|mDNS]]/{{ssdp|SSDP}}) actually work; cross a router and you're in {{wan|WAN}} territory.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Local_area_network',
		category: 'networking-basics'
	},
	{
		id: 'wan',
		term: 'WAN (Wide Area Network)',
		definition:
			"Any network spanning multiple physical locations or administrative domains — the public internet, an MPLS-VPN backbone, an SD-WAN overlay. WANs are where [[bgp|BGP]] routes, {{nat|NAT}} translates, [[tls|TLS]] protects, and the latency budget jumps from microseconds to tens or hundreds of milliseconds.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Wide_area_network',
		category: 'networking-basics'
	},

	// ── Congestion control variants ─────────────────────────────────────
	{
		id: 'tcp-tahoe',
		term: 'TCP Tahoe',
		definition:
			"The original [[tcp|TCP]] congestion-control algorithm, introduced by [[pioneer:van-jacobson|Van Jacobson]] in 1988. Adds **slow start**, **congestion avoidance**, **fast retransmit**, and full window reset on loss. Named for the 4.3BSD-Tahoe release. Superseded by {{tcp-reno|Reno}} (which keeps the window on duplicate {{ack|ACKs}}) within two years.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#TCP_Tahoe_and_Reno',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-reno',
		term: 'TCP Reno',
		definition:
			"The 1990 evolution of [[tcp|TCP]] {{tcp-tahoe|Tahoe}} that added **fast recovery** — on triple-duplicate {{ack|ACKs}}, halve the window and continue rather than dropping to one segment. The textbook congestion-control algorithm and the reference every later variant compares against.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control',
		category: 'protocol-mechanics'
	},
	{
		id: 'tcp-newreno',
		term: 'TCP NewReno',
		definition:
			"An incremental refinement of {{tcp-reno|Reno}} that handles **multiple packet losses in one window** by staying in fast-recovery until *all* losses in the window have been acknowledged. Specified in [[rfc:6582|RFC 6582]] (2012, obsoleting RFC 3782). The default on Windows pre-2008 and on many BSD stacks for two decades.",
		wikiUrl: 'https://en.wikipedia.org/wiki/TCP_congestion_control#TCP_NewReno',
		category: 'protocol-mechanics'
	},
	{
		id: 'bbrv3',
		term: 'BBRv3',
		definition:
			"The 2023+ revision of {{bbr|BBR}} that addresses the v1 fairness problems with {{cubic|CUBIC}} and packet-conservation gaps. Now \`draft-ietf-ccwg-bbr\` (-04 / -05, 2025–2026); Google has run it as the default on google.com and YouTube traffic since 2023. Available in Linux via \`sysctl net.ipv4.tcp_congestion_control=bbr\` paired with FQ qdisc.",
		category: 'protocol-mechanics'
	},

	// ── Web / messaging tech ─────────────────────────────────────────────
	{
		id: 'wsdl',
		term: 'WSDL (Web Services Description Language)',
		definition:
			"An XML format that describes a [[soap|SOAP]] service — its endpoint, operations, message types, and bindings — so that client toolchains can generate stubs automatically. WSDL 1.1 (2001) was the practical version; WSDL 2.0 (2007) was a more rigorous redesign that hardly anyone adopted. The 'formal contract you can validate at compile time' that gave [[soap|SOAP]] its enterprise foothold.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Web_Services_Description_Language',
		category: 'web'
	},
	{
		id: 'moq',
		term: 'MoQ (Media over QUIC)',
		definition:
			"The {{ietf|IETF}} working group and protocol family designing the next-generation sub-second live streaming transport on top of [[quic|QUIC]]. \`draft-ietf-moq-transport\` (-17 in March 2026) is the core protocol — co-edited by Suhas Nandakumar (Cisco), Victor Vasiliev (Google), Ian Swett (Google), and Alan Frindell (Meta). Designed to replace the [[rtmp|RTMP]]→[[hls|HLS]] pipeline. Cloudflare runs production MoQ relays across 330+ cities.",
		category: 'protocol-mechanics'
	},

	// ── Wireless ────────────────────────────────────────────────────────
	{
		id: 'wpa2',
		term: 'WPA2',
		definition:
			"The 2004 IEEE 802.11i amendment that made AES-CCMP and the **4-way handshake** mandatory for [[wifi|Wi-Fi]] security, ending WEP and TKIP. WPA2-Personal (PSK) is the universal home-router default 2004–2018; WPA2-Enterprise pairs it with {{eap|EAP}}-TLS / PEAP. Replaced by {{wpa3|WPA3}} starting 2018 after KRACK (2017) exposed protocol-level flaws in the 4-way handshake.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#WPA2',
		category: 'security'
	},
	{
		id: 'mesh-network',
		term: 'Mesh network',
		definition:
			"A multi-hop wireless topology where every node forwards frames for its neighbours — no central access point owns the airtime. {{thread|Thread}} (802.15.4 + IPv6), [[zigbee|Zigbee]] (802.15.4 + ZCL), Bluetooth Mesh (BR/EDR + GATT proxy), and Wi-Fi 802.11s are the four common families. The trade-off versus star topologies: longer reach and better resilience, but harder commissioning and worse battery life on relay nodes.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Mesh_networking',
		category: 'networking-basics'
	},
	{
		id: 'beacon-frame',
		term: 'Beacon frame',
		definition:
			"In [[wifi|Wi-Fi]] (and {{ble|BLE}}, in a different sense), the periodic management frame an {{access-point|access point}} broadcasts to announce its presence — SSID, supported rates, capabilities, and timing. Default beacon interval is **100 ms** in Wi-Fi; this is one of the bigger sources of idle airtime in dense environments and is what Target Wake Time (TWT) tries to eliminate.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Beacon_frame',
		category: 'protocol-mechanics'
	},

	// ── Filled stubs (referenced by other entries) ────────────────────
	{
		id: 'spdy',
		term: 'SPDY',
		definition:
			"Google's 2009 experimental protocol that multiplexed many HTTP requests over a single TLS connection, with binary framing and {{hpack|HPACK}}-style header compression. Deployed in Chrome and Twitter; became the seed of [[http2|HTTP/2]] (RFC 7540, May 2015) which superseded it. SPDY was retired in Chrome 51 (May 2016).",
		wikiUrl: 'https://en.wikipedia.org/wiki/SPDY',
		category: 'web'
	},
	{
		id: 'airdrop',
		term: 'AirDrop',
		definition:
			"{{apple|Apple}}'s peer-to-peer file-transfer protocol that bootstraps over [[bluetooth|Bluetooth LE]] (discovery and contact-hash matching) and then bursts the file over a peer-to-peer [[wifi|Wi-Fi]] link using {{awdl|AWDL}} or, since 2021, Wi-Fi Direct. Has been the subject of repeated privacy research showing the discovery hashes can be reversed to phone numbers under realistic assumptions.",
		wikiUrl: 'https://en.wikipedia.org/wiki/AirDrop',
		category: 'web'
	},
	{
		id: 'zstd',
		term: 'Zstandard (zstd)',
		definition:
			"A lossless data compression algorithm developed by Yann Collet at {{meta|Meta}} (open-sourced 2016). Trades a tiny throughput cost vs. zlib for a sizeable ratio improvement, and is now an {{ietf|IETF}} standard ([[rfc:8478|RFC 8478]]) and the default codec for several [[kafka|Kafka]] producers, container image registries, and Linux kernel modules.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Zstd',
		category: 'protocol-mechanics'
	},
	{
		id: 'uec',
		term: 'UEC (Ultra Ethernet Consortium)',
		definition:
			"Linux Foundation hosted consortium founded **19 July 2023** by AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta, and Microsoft (NVIDIA joined later) to redesign [[ethernet|Ethernet]] for AI fabrics. **UEC Specification 1.0** was published 11 June 2025 — defines **Ultra Ethernet Transport (UET)** with packet spraying, selective {{retransmission|retransmission}}, in-network telemetry, and ephemeral/{{connectionless|connectionless}} state for millions of endpoints.",
		category: 'infrastructure'
	},
	{
		id: 'ssdp',
		term: 'SSDP (Simple Service Discovery Protocol)',
		definition:
			"The UPnP discovery protocol — multicast HTTP-over-[[udp|UDP]] to **239.255.255.250:1900** for finding devices on the {{lan|LAN}}. Routers, smart TVs, printers, game consoles, and media-server software (Plex, DLNA) all speak it. A long-standing security headache: open SSDP reflectors have been used in DDoS amplification attacks since 2014.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol',
		category: 'protocol-mechanics'
	},
	{
		id: 'eap',
		term: 'EAP (Extensible Authentication Protocol)',
		definition:
			"A framework ([[rfc:3748|RFC 3748]], 2004) for plugging different authentication methods into the same Layer-2 transport. **EAP-TLS** (certificate-based, RFC 5216 / 9190) and **EAP-PEAP** (TLS-tunnelled inner-method) are the dominant choices in [[wifi|WPA2/WPA3-Enterprise]], and **EAP-AKA'** (RFC 5448) carries [[cellular|cellular]] SIM-based authentication into Wi-Fi via Passpoint.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol',
		category: 'security'
	},
	{
		id: 'awdl',
		term: 'AWDL (Apple Wireless Direct Link)',
		definition:
			"{{apple|Apple}}'s proprietary peer-to-peer Wi-Fi protocol that powers {{airdrop|AirDrop}}, AirPlay, Sidecar, and Continuity features. Runs alongside an infrastructure Wi-Fi connection by time-slicing the radio. Reverse-engineered in academic papers (Stute et al., USENIX Security 2018+).",
		wikiUrl: 'https://en.wikipedia.org/wiki/Apple_Wireless_Direct_Link',
		category: 'protocol-mechanics'
	},

	// ── TLS 1.3 handshake messages ──────────────────────────────────────
	{
		id: 'client-hello',
		term: 'ClientHello',
		definition:
			"The first [[tls|TLS]] handshake message. Carries the supported {{cipher-suite|cipher suites}}, supported groups (named elliptic curves / KEMs), the {{sni|SNI}} extension naming the target server, and — under [[tls|TLS]] 1.3 — a *key share* (the client's half of the Diffie-Hellman exchange). The key share is the {{one-rtt|1-RTT}} trick: sending it speculatively in the very first message removes a round trip from the {{handshake|handshake}}.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_handshake',
		category: 'security'
	},
	{
		id: 'server-hello',
		term: 'ServerHello',
		definition:
			"The server's first [[tls|TLS]] reply. Picks one {{cipher-suite|cipher suite}} from the {{client-hello|ClientHello}} list, returns its own key share, and (under [[tls|TLS]] 1.3) switches everything after this message to encrypted form. The server still has to send {{certificate|Certificate}} + Finished before the client can verify identity, but those frames are already protected.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_handshake',
		category: 'security'
	},
	{
		id: 'tls-finished',
		term: 'Finished message',
		definition:
			"The handshake-completion message in [[tls|TLS]]. A keyed MAC over the entire {{handshake|handshake}} transcript so far — both sides send one to prove they computed the same keys and saw the same messages. Detects downgrade attacks: anyone who tampered with the cipher-suite list, the key shares, or the {{certificate|certificate}} chain would fail the Finished check.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Transport_Layer_Security',
		category: 'security'
	},

	// ── AEAD ciphers ────────────────────────────────────────────────────
	{
		id: 'aes-gcm',
		term: 'AES-GCM',
		definition:
			"The dominant {{aead|AEAD}} construction in the post-2010 internet: AES in counter mode for {{encryption|encryption}}, GHASH (Galois MAC) for authentication, all under one key. Used by [[tls|TLS]] 1.2/1.3, [[ipsec|IPsec ESP]], [[ssh|SSH]], [[wireguard|WireGuard]] (in AES variants), {{srtp|SRTP}}. Hardware AES-NI / VAES support makes it the fastest mainstream cipher on x86 and ARMv8.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Galois/Counter_Mode',
		category: 'security'
	},
	{
		id: 'chacha20-poly1305',
		term: 'ChaCha20-Poly1305',
		definition:
			"[[pioneer:dan-bernstein|Daniel J. Bernstein]]'s {{aead|AEAD}} pairing — ChaCha20 stream cipher + Poly1305 one-time authenticator, standardised in [[rfc:7539|RFC 7539]] / [[rfc:8439|RFC 8439]]. The default AEAD on platforms without AES hardware (mobile, embedded, older CPUs). Mandatory in [[tls|TLS]] 1.3 and [[wireguard|WireGuard]]; widely used in [[ssh|SSH]] and [[quic|QUIC]].",
		wikiUrl: 'https://en.wikipedia.org/wiki/ChaCha20-Poly1305',
		category: 'security'
	},

	// ── WPA2 / WPA3 four-way handshake ──────────────────────────────────
	{
		id: 'four-way-handshake',
		term: '4-way handshake',
		definition:
			"The {{wpa2|WPA2}} key-establishment dance after authentication and association. The {{access-point|AP}} sends **ANonce** → station replies with **SNonce + MIC** (computed from PMK + nonces + MAC addresses) → AP sends the **{{gtk|GTK}}** encrypted with the freshly derived PTK → station confirms. KRACK (2017) exploited the third message's re-transmission to reset the per-packet {{nonce|nonce}} and decrypt frames — the bug that motivated {{wpa3|WPA3}}'s SAE handshake.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IEEE_802.11i-2004#The_four-way_handshake',
		category: 'security'
	},
	{
		id: 'pmk',
		term: 'PMK (Pairwise Master Key)',
		definition:
			"The long-lived secret shared between a [[wifi|Wi-Fi]] station and the {{access-point|AP}}. In WPA2-Personal it is derived from the passphrase via PBKDF2(SSID, passphrase, 4096); in WPA2-Enterprise it falls out of the {{eap|EAP}} method. Both endpoints know the PMK *before* the {{four-way-handshake|4-way handshake}}; the handshake then mixes it with nonces to derive the per-session {{ptk|PTK}}.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IEEE_802.11i-2004',
		category: 'security'
	},
	{
		id: 'ptk',
		term: 'PTK (Pairwise Transient Key)',
		definition:
			"The per-session session key in [[wifi|Wi-Fi]] WPA2/WPA3, derived during the {{four-way-handshake|4-way handshake}} from PMK + ANonce + SNonce + both MAC addresses. The PTK is split into KCK (key-confirmation), KEK (key-encryption), and TK (the temporal key that actually encrypts data frames with AES-CCMP or GCMP). Rotated whenever the station re-associates.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IEEE_802.11i-2004',
		category: 'security'
	},
	{
		id: 'gtk',
		term: 'GTK (Group Temporal Key)',
		definition:
			"The shared key in [[wifi|Wi-Fi]] used to encrypt {{broadcast|broadcast}} and {{multicast|multicast}} frames so every station on the BSS can decrypt them. Distributed by the {{access-point|AP}} during the {{four-way-handshake|4-way handshake}}, wrapped with the {{ptk|PTK}}'s KEK. Rotated on a timer or whenever a station leaves to keep ex-members from continuing to decrypt group traffic.",
		wikiUrl: 'https://en.wikipedia.org/wiki/IEEE_802.11i-2004',
		category: 'security'
	},
	{
		id: 'mic',
		term: 'MIC (Message Integrity Code)',
		definition:
			"A short authenticator appended to encrypted frames in [[wifi|Wi-Fi]] (and [[bluetooth|Bluetooth LE]]) to prove integrity. In WPA2 CCMP it is 8 bytes; in GCMP it is 16. Different from a CRC: a CRC catches transmission errors; a MIC catches *adversarial* tampering because it depends on a secret key.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Message_authentication_code',
		category: 'security'
	},

	// ── IPsec wire-level terms ──────────────────────────────────────────
	{
		id: 'spi',
		term: 'SPI (Security Parameters Index)',
		definition:
			"A 32-bit identifier in the [[ipsec|IPsec]] ESP header that names *which Security Association* to use to decrypt this packet. The receiver looks up the SPI in its SAD (Security Association Database) to find the key, cipher, replay window, and counters. Each direction of an IPsec tunnel has its own SPI; they are negotiated in the {{ike-sa|IKE_SA_INIT}} exchange.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Security_Parameter_Index',
		category: 'security'
	},
	{
		id: 'ike-sa',
		term: 'IKE SA',
		definition:
			"The control-plane Security Association in [[ipsec|IKEv2]] — the encrypted, authenticated channel that the two peers use to *negotiate* the data-plane Child SAs. Established by the **IKE_SA_INIT** + **IKE_AUTH** exchanges (two round trips) and lives for hours; rekeyed before lifetime expiry with **CREATE_CHILD_SA**.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Key_Exchange',
		category: 'security'
	},
	{
		id: 'child-sa',
		term: 'Child SA',
		definition:
			"A unidirectional data-plane Security Association in [[ipsec|IKEv2]]. Carries the ESP key, cipher choice, sequence-number window, and traffic selectors for one direction of a tunnel. Two Child SAs (one each way) are negotiated inside the {{ike-sa|IKE SA}} during IKE_AUTH and rekeyed via **CREATE_CHILD_SA** before their byte/time limits.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Internet_Key_Exchange',
		category: 'security'
	},

	// ── Streaming media ──────────────────────────────────────────────────
	{
		id: 'manifest',
		term: 'Manifest',
		definition:
			"The top-level playlist file in adaptive-bitrate streaming. In [[hls|HLS]] this is an **`.m3u8`** text file; in [[dash|DASH]] it is an XML **MPD** (Media Presentation Description). Lists the available bitrate ladders, codec profiles, audio/subtitle tracks, and the URLs (or URL templates) for each segment. The player downloads the manifest first, then fetches segments per its {{adaptive-bitrate|adaptive-bitrate}} logic.",
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP_Live_Streaming',
		category: 'protocol-mechanics'
	},
	{
		id: 'mpd',
		term: 'MPD (Media Presentation Description)',
		definition:
			"The XML manifest format used by [[dash|MPEG-DASH]]. Describes the timeline as **Periods** (top-level segments), each with **AdaptationSets** (one per content kind — video, audio, subtitle), each with **Representations** (per-bitrate variants). More flexible than [[hls|HLS]]'s `.m3u8` text format but verbose; widely used by Netflix, YouTube, and the BBC.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP',
		category: 'protocol-mechanics'
	},

	// ── Real-time A/V ────────────────────────────────────────────────────
	{
		id: 'jitter-buffer',
		term: 'Jitter buffer',
		definition:
			"A small (10–200 ms) playout queue at the receiver in [[rtp|RTP]] / {{voip|VoIP}} systems that absorbs network {{jitter|jitter}}. Buffers a few packets before starting playback so out-of-order arrivals can be re-ordered by [[rtp|RTP]] {{sequence-number|sequence number}}, and late packets can be dropped without an audible gap. Trades a tiny added {{latency|latency}} for smooth audio/video.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Jitter#Jitter_buffer',
		category: 'protocol-mechanics'
	},
	{
		id: 'forward-error-correction',
		term: 'FEC (Forward Error Correction)',
		definition:
			"Add redundancy on the *sender* side so the receiver can reconstruct lost packets without asking for a {{retransmission|retransmission}}. Common in real-time media where round-trip {{retransmission|retransmissions}} are too slow. Schemes range from simple parity (send 4 packets + 1 parity packet, survive 1 loss) to Reed-Solomon and Raptor codes. [[rtp|RTP]] payload format defined in [[rfc:5109|RFC 5109]] / [[rfc:8627|RFC 8627]].",
		wikiUrl: 'https://en.wikipedia.org/wiki/Forward_error_correction',
		category: 'protocol-mechanics'
	},

	// ── Mail ─────────────────────────────────────────────────────────────
	{
		id: 'ehlo',
		term: 'EHLO',
		definition:
			"The opening command of an Extended [[smtp|SMTP]] session ([[rfc:5321|RFC 5321]]). Replaces the legacy `HELO` and lets the server advertise capabilities it supports — {{starttls|STARTTLS}}, SIZE limits, PIPELINING, AUTH mechanisms, DSN, 8BITMIME, SMTPUTF8. Every modern mail exchange starts with `EHLO <client hostname>`.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Extended_SMTP',
		category: 'protocol-mechanics'
	},
	{
		id: 'starttls',
		term: 'STARTTLS',
		definition:
			"The opportunistic-{{encryption|encryption}} upgrade verb in [[smtp|SMTP]], [[imap|IMAP]], POP3, [[xmpp|XMPP]], and LDAP. Client sends `STARTTLS` over the plaintext session; server replies `220 Ready`; both sides perform a [[tls|TLS]] {{handshake|handshake}} on the same TCP connection. Vulnerable to **stripping attacks** where an active attacker removes the capability advertisement — closed by **MTA-STS** ([[rfc:8461|RFC 8461]]) and DANE.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Opportunistic_TLS',
		category: 'security'
	},

	// ── DNS records & routing ───────────────────────────────────────────
	{
		id: 'dns-record-types',
		term: 'DNS record types',
		definition:
			"The kinds of resource records [[dns|DNS]] serves. The common set: **A** ([[ip|IPv4]] address), **AAAA** ([[ipv6|IPv6]] address), **CNAME** (alias), **MX** (mail exchange), **NS** (authoritative name servers), **SOA** (zone authority), **TXT** (free-form text, used for SPF/DKIM/DMARC), **SRV** (service location, used by [[mdns-dns-sd|DNS-SD]] and Active Directory), **PTR** (reverse lookup), **CAA** (which {{certificate-authority|CAs}} may issue for a zone), and the {{dnssec|DNSSEC}} chain (DS, DNSKEY, RRSIG, NSEC).",
		wikiUrl: 'https://en.wikipedia.org/wiki/List_of_DNS_record_types',
		category: 'protocol-mechanics'
	},
	{
		id: 'as-path',
		term: 'AS_PATH',
		definition:
			"A [[bgp|BGP]] path attribute listing every {{autonomous-system|AS}} a route has passed through, in reverse-chronological order. Used both for *loop prevention* (a router rejects routes whose AS_PATH contains its own AS) and as the primary tie-breaker in best-path selection — shorter paths win. The path-vector mechanism is what makes [[bgp|BGP]] **policy-routable** in a way that pure link-state protocols are not.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Border_Gateway_Protocol#Routes',
		category: 'protocol-mechanics'
	},
	{
		id: 'dijkstra',
		term: 'Dijkstra algorithm',
		definition:
			"The shortest-path-first algorithm invented by [[pioneer:edsger-dijkstra|Edsger W. Dijkstra]] in 1956. Run by every [[ospf|OSPF]] router across its LSDB to compute the routing table — *every node's shortest path to every other node*. Runs in O((V+E) log V) with a binary heap; in practice it converges in milliseconds on an enterprise topology and seconds on a tier-1 ISP backbone.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
		category: 'protocol-mechanics'
	},

	// ── Filled stubs (referenced from diagram captions) ─────────────────
	{
		id: 'multi-homing',
		term: 'Multi-homing',
		definition:
			"A host (or autonomous system) reachable through *multiple* network paths or {{ip-address|IP addresses}} simultaneously. [[sctp|SCTP]] negotiates multiple address pairs per association so a path failure switches transparently; [[mptcp|MPTCP]] does the same for TCP via subflows; [[bgp|BGP]]-speaking networks multi-home by announcing the same prefix from multiple upstream providers for redundancy.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Multihoming',
		category: 'networking-basics'
	},
	{
		id: 'pipelining',
		term: 'Pipelining',
		definition:
			"Sending the next request before the previous response arrives, so multiple {{request-response|request-response}} pairs are in flight at once. Standardised in [[http1|HTTP/1.1]] ([[rfc:9112|RFC 9112]]) but never reliably deployed because most servers responded *in order* — one slow response stalled everything behind it ({{head-of-line-blocking|head-of-line blocking}}). [[http2|HTTP/2]] solved this with binary {{multiplexing|multiplexing}}; [[smtp|SMTP]] PIPELINING is one place it works well.",
		wikiUrl: 'https://en.wikipedia.org/wiki/HTTP_pipelining',
		category: 'protocol-mechanics'
	},
	{
		id: 'doh',
		term: 'DoH (DNS over HTTPS)',
		definition:
			"[[dns|DNS]] queries tunneled over [[http2|HTTP/2]] / [[http3|HTTP/3]] to a resolver (RFC 8484, 2018). Encrypts and authenticates DNS lookups against on-path eavesdroppers and tampering — closes the metadata leak that {{dnssec|DNSSEC}} alone could not. Default in Firefox since 2020 (Cloudflare 1.1.1.1, NextDNS); enterprises sometimes block DoH to retain DNS-based filtering.",
		wikiUrl: 'https://en.wikipedia.org/wiki/DNS_over_HTTPS',
		category: 'security'
	},
	{
		id: 'dot',
		term: 'DoT (DNS over TLS)',
		definition:
			"[[dns|DNS]] queries over a dedicated [[tls|TLS]] connection on port 853 (RFC 7858, 2016). Same goal as {{doh|DoH}} — encrypt and authenticate the resolver path — but uses its own port so middleboxes can distinguish DNS from web traffic. {{android|Android}} 9+ ships Private DNS that speaks DoT; the Knot, Unbound, and CoreDNS resolvers expose it server-side.",
		wikiUrl: 'https://en.wikipedia.org/wiki/DNS_over_TLS',
		category: 'security'
	},
	{
		id: 'stream-processing',
		term: 'Stream processing',
		definition:
			"Compute over an unbounded data stream as records arrive — window, aggregate, join, alert — rather than batching a finite dataset. Built on top of distributed log brokers like [[kafka|Kafka]], [[amqp|AMQP]], or Pulsar. Frameworks: Flink, [[kafka|Kafka]] Streams, Spark Structured Streaming, ksqlDB. The processing model behind real-time fraud detection, telemetry, and CDC pipelines.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Stream_processing',
		category: 'messaging'
	},
	{
		id: 'anthropic',
		term: 'Anthropic',
		definition:
			"AI safety company (founded 2021) and operator of the **Claude** family of large language models. Authored the Model Context Protocol ([[mcp|MCP]], November 2024), the open standard that lets LLM applications connect to outside tools and resources over [[json-rpc|JSON-RPC]] 2.0.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Anthropic',
		category: 'infrastructure'
	},
	{
		id: 'linkedin',
		term: 'LinkedIn',
		definition:
			"Professional-network site acquired by [[microsoft|Microsoft]] in 2016. Originator of Apache [[kafka|Kafka]] (open-sourced 2011); the company runs the largest publicly documented Kafka deployment on earth — **>7 trillion messages/day** as of the 2020s — and was the reference architecture every other Kafka deployment scaled against.",
		wikiUrl: 'https://en.wikipedia.org/wiki/LinkedIn',
		category: 'infrastructure'
	},
	{
		id: 'android',
		term: 'Android',
		definition:
			"[[google|Google]]'s mobile operating system (acquired from Android Inc. in 2005, first release 2008). Drives ~70% of global smartphone share. The reference platform that adopted [[quic|QUIC]], {{doh|DoH}}/{{dot|DoT}} (\"Private DNS\"), [[mptcp|MPTCP]], post-quantum [[tls|TLS]], and {{matter|Matter}} for the consumer device fleet.",
		wikiUrl: 'https://en.wikipedia.org/wiki/Android_(operating_system)',
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
