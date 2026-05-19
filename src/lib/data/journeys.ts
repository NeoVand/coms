export interface JourneyStep {
	protocolId: string;
	title: string;
	description: string;
	/** Optional transition text shown between this step and the next */
	transition?: string;
}

export interface Journey {
	id: string;
	title: string;
	description: string;
	color: string;
	steps: JourneyStep[];
	/** 'global' for hub Journeys tab, or a categoryId for category-scoped journeys */
	scope: 'global' | string;
}

export const journeys: Journey[] = [
	// ── Global Journeys ────────────────────────────────────────────────
	{
		id: 'url-bar',
		title: 'What Happens When You Type a URL',
		description:
			'Follow a request from your browser to a server and back — through [[dns|DNS]], [[tcp|TCP]], [[tls|TLS]], and HTTP.',
		color: '#00D4FF',
		scope: 'global',
		steps: [
			{
				protocolId: 'dns',
				title: 'DNS Resolution',
				description:
					'Before your browser can reach {{google|google}}.com, it needs an actual address — like needing a street address before you can mail a letter. Your device sends a [[dns|DNS]] query to a recursive resolver, which walks the [[dns|DNS]] hierarchy: root servers, then .com TLD servers, then {{google|google}}.com\'s authoritative nameserver. The answer (e.g., 142.250.80.46) is cached locally so future requests skip this entire chain. Without [[dns|DNS]], you would have to memorize raw [[ip|IP]] addresses for every website you visit.',
				transition: 'The browser now knows WHERE the server lives — but packets on the internet can be lost, reordered, or duplicated. Before sending any real data, it needs to negotiate a reliable channel...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP Handshake',
				description:
					'The internet is inherently unreliable — packets can vanish, arrive out of order, or show up twice. [[tcp|TCP]] solves this with a {{three-way-handshake|three-way handshake}} (SYN, SYN-{{ack|ACK}}, {{ack|ACK}}) that synchronizes sequence numbers between your browser and the server, creating a reliable ordered channel. This {{handshake|handshake}} also negotiates window sizes for {{flow-control|flow control}}, ensuring neither side overwhelms the other. It costs one round trip of {{latency|latency}}, but without it every application would need to implement its own reliability logic.',
				transition: 'A reliable pipe now connects your browser to the server — but anyone sitting on the network path (your ISP, a coffee shop router, a government {{firewall|firewall}}) can read every byte in plaintext. The data needs {{encryption|encryption}}...'
			},
			{
				protocolId: 'tls',
				title: 'TLS Negotiation',
				description:
					'[[tls|TLS]] is where trust is established. The server presents a {{certificate|certificate}} proving it really is {{google|google}}.com (signed by a trusted {{certificate-authority|certificate authority}}), and both sides negotiate which {{cipher-suite|cipher suite}} to use. They then perform a key {{exchange|exchange}} (typically ECDHE) to derive shared session keys that only they know — even if someone recorded the entire {{handshake|handshake}}. [[tls|TLS]] 1.3 collapses this to a single round trip, and on repeat visits, {{zero-rtt|0-RTT}} resumption can send encrypted data immediately.',
				transition: 'The connection is now both reliable and encrypted — no eavesdropper can read or tamper with the data. Everything is ready to speak the language of the web...'
			},
			{
				protocolId: 'http1',
				title: 'HTTP Request & Response',
				description:
					'With the secure channel established, the browser finally speaks HTTP. It sends a GET request with headers describing what it accepts (content types, encodings, languages) and any cookies for the domain. The server processes the request and responds with a status code (200 OK), response headers (caching rules, content type), and the HTML document body. This single {{request-response|request-response}} cycle is the fundamental unit of the web — and a modern page will trigger hundreds more for CSS, JavaScript, images, and fonts.'
			}
		]
	},
	{
		id: 'wire-to-web',
		title: 'From Wire to Web',
		description:
			'Trace data from the physical [[ethernet|Ethernet]] cable through every layer of the network stack up to the application.',
		color: '#F472B6',
		scope: 'global',
		steps: [
			{
				protocolId: 'ethernet',
				title: 'Ethernet Frame',
				description:
					'Every piece of data on a local network travels as an [[ethernet|Ethernet]] frame — a precisely structured envelope containing source and destination MAC addresses (48-bit hardware identifiers burned into every network card), a type field that indicates what protocol lives inside ([[ip|IPv4]], [[ipv6|IPv6]], [[arp|ARP]]), and a Frame Check Sequence for error detection. The frame is the physical currency of LANs: switches read the destination MAC to forward it to the correct port. Without this framing, raw electrical signals on the wire would be meaningless noise.',
				transition: 'The [[ethernet|Ethernet]] frame needs a destination {{mac-address|MAC address}} — but your application only knows an {{ip-address|IP address}}. Something has to bridge the gap between Layer 3 ([[ip|IP]]) and Layer 2 ([[ethernet|Ethernet]])...'
			},
			{
				protocolId: 'arp',
				title: 'ARP Resolution',
				description:
					'[[arp|ARP]] is the glue between [[ip|IP]] addresses and physical hardware. When your machine needs to reach 192.168.1.1 but only knows its [[ip|IP]], it broadcasts an [[arp|ARP]] request to every device on the LAN: "Who has 192.168.1.1? Tell me your {{mac-address|MAC address}}." The target replies directly with its MAC, and the result is cached in an [[arp|ARP]] table so future packets skip the {{broadcast|broadcast}}. This is why the first packet to a new host on your LAN is slightly slower — [[arp|ARP]] has to resolve the address first.',
				transition: 'With the destination MAC resolved and the [[ethernet|Ethernet]] frame ready, the packet can now be addressed for its journey beyond the local network. The [[ip|IP]] layer takes over to handle global addressing and routing...'
			},
			{
				protocolId: 'ip',
				title: 'IP Routing',
				description:
					'[[ip|IP]] is the postal service of the internet — it stamps each packet with a source and destination address, then forwards it hop by hop toward its target. Each router along the path examines the destination [[ip|IP]], consults its {{routing-table|routing table}}, decrements the {{ttl|TTL}} ({{ttl|Time To Live}}) by one, and forwards the packet to the next hop. If {{ttl|TTL}} reaches zero, the packet is discarded and an [[icmp|ICMP]] "Time Exceeded" is sent back — this is how traceroute works. [[ip|IP]] makes no guarantees about delivery order or reliability; it simply does its best to get each packet to the right machine.',
				transition: '[[ip|IP]] delivered the packet to the correct machine — but a server might be running dozens of applications simultaneously. A web server on port 80, an [[ssh|SSH]] daemon on port 22, a database on port 5432. Something has to deliver the data to the right process...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP Delivery',
				description:
					'[[tcp|TCP]] is the reliability layer that [[ip|IP]] lacks. It uses 16-bit port numbers (0-65535) to multiplex multiple conversations on the same {{ip-address|IP address}}, delivering each segment to the correct application. Beyond addressing, [[tcp|TCP]] guarantees that data arrives complete, in order, and without duplication — it retransmits lost segments, resequences out-of-order arrivals, and uses {{sliding-window|sliding window}} {{flow-control|flow control}} to prevent a fast sender from overwhelming a slow receiver. This reliability is why the web, email, and file transfer all run on [[tcp|TCP]].',
				transition: 'The data has been reliably delivered to the correct process on the correct machine. Now the application can finally interpret the bytes using its own protocol semantics...'
			},
			{
				protocolId: 'http1',
				title: 'HTTP Application',
				description:
					'At the very top of the stack, HTTP gives meaning to the raw bytes. It defines a structured conversation: the client sends a request with a method (GET, POST, PUT), a path (/index.html), and headers describing its capabilities. The server responds with a status code (200 OK, 404 Not Found), its own headers (content type, caching directives), and the actual content — HTML, {{json|JSON}}, images. This is the layer that developers interact with directly, but it only works because every layer below carried the data faithfully.'
			}
		]
	},
	{
		id: 'transport-blocks',
		title: 'Building Blocks of Transport',
		description: 'From raw datagrams to reliable streams — the foundational transport protocols and their evolution.',
		color: '#39FF14',
		scope: 'global',
		steps: [
			{
				protocolId: 'udp',
				title: 'UDP: The Simple Datagram',
				description:
					'[[udp|UDP]] is the bare minimum of transport — it adds just 8 bytes of overhead (source port, destination port, length, {{checksum|checksum}}) and fires your data into the network with no {{handshake|handshake}}, no acknowledgments, and no ordering guarantees. This makes it blazing fast and perfect for scenarios where speed matters more than perfection: [[dns|DNS]] queries, live video, gaming, and voice calls. If a packet is lost, the application decides whether to care — a missing video frame is better than waiting 200ms for a {{retransmission|retransmission}} that arrives too late to display.',
				transition: '[[udp|UDP]] gives you raw speed, but many applications cannot tolerate missing or reordered data. A web page with a missing CSS file, a bank transfer with lost bytes, or a file download with gaps — these need every byte in the right order. The internet needed a more disciplined transport...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP: Reliable Streams',
				description:
					'[[tcp|TCP]] transforms the unreliable internet into a dependable byte stream. It establishes connections with a {{three-way-handshake|three-way handshake}}, assigns sequence numbers to every byte, requires acknowledgments for received data, and retransmits anything that goes missing. Its {{congestion-control|congestion control}} algorithms (Reno, {{cubic|CUBIC}}, {{bbr|BBR}}) actively probe the network to find the maximum safe sending rate without causing collapse. [[tcp|TCP]] has been the backbone of the internet for over 40 years — HTTP, email, [[ssh|SSH]], and file transfer all depend on it. The tradeoff is {{latency|latency}}: the {{handshake|handshake}}, acknowledgment delays, and {{head-of-line-blocking|head-of-line blocking}} (one lost packet stalls everything behind it) add up.',
				transition: '[[tcp|TCP]] proved that reliability works, but its single-stream design means one lost packet blocks all data behind it — even unrelated requests. And its {{handshake|handshake}} adds a full round trip before any data flows. Engineers began asking: can we keep the reliability but eliminate these bottlenecks?'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Modern Fusion',
				description:
					'[[quic|QUIC]] is what happens when you redesign transport from scratch with modern needs in mind. It runs on top of [[udp|UDP]] (so it passes through existing firewalls and NATs), but implements its own reliability, ordering, and {{congestion-control|congestion control}} internally. Crucially, [[quic|QUIC]] supports multiplexed independent streams — so a lost packet on stream 3 does not block streams 1, 2, or 4. It also bakes in [[tls|TLS]] 1.3 {{encryption|encryption}} from the start, merging the transport and security handshakes into a single round trip. On repeat connections, {{zero-rtt|0-RTT}} resumption lets you send data immediately. [[quic|QUIC]] powers [[http3|HTTP/3]] and is rapidly becoming the new default transport for the web.',
				transition: '[[quic|QUIC]] solves {{head-of-line-blocking|head-of-line blocking}} and connection setup {{latency|latency}} brilliantly, but it assumes a single network path. What happens when a device has multiple network interfaces — [[wifi|WiFi]] and cellular, two [[ethernet|Ethernet]] ports, or a wired and wireless backup link? There is a transport designed for exactly that scenario...'
			},
			{
				protocolId: 'sctp',
				title: 'SCTP: Multi-Stream Transport',
				description:
					'[[sctp|SCTP]] (Stream Control Transmission Protocol) introduced two ideas ahead of their time: multiple independent message streams within a single association, and multi-homing — the ability to bind to multiple [[ip|IP]] addresses simultaneously and fail over between them without dropping the connection. If one network interface goes down, [[sctp|SCTP]] seamlessly switches to another. Originally designed for telecom {{signaling|signaling}} (carrying phone call setup messages between switches), it also supports message boundaries natively (unlike [[tcp|TCP]]\'s raw byte stream). While [[sctp|SCTP]] never gained widespread web adoption due to {{nat|NAT}} traversal issues, its concepts directly influenced [[quic|QUIC]]\'s stream {{multiplexing|multiplexing}} design.'
			}
		]
	},
	{
		id: 'security-scratch',
		title: 'Security from Scratch',
		description: 'How the internet went from plaintext to encrypted-by-default.',
		color: '#2DD4BF',
		scope: 'global',
		steps: [
			{
				protocolId: 'tls',
				title: 'TLS: The Encryption Layer',
				description:
					'In the early internet, everything traveled in plaintext — passwords, credit cards, personal emails, all visible to anyone on the network path. [[tls|TLS]] changed everything by wrapping [[tcp|TCP]] connections in {{encryption|encryption}}. During the {{handshake|handshake}}, the server proves its identity with a {{certificate|certificate}} signed by a trusted authority, both sides agree on cipher suites, and an ephemeral key {{exchange|exchange}} (ECDHE) creates shared session keys that even a passive observer who recorded every byte cannot derive. [[tls|TLS]] 1.3 stripped out legacy cruft, removing insecure algorithms and reducing the {{handshake|handshake}} to a single round trip. Today, over 95% of web traffic runs through [[tls|TLS]].',
				transition: '[[tls|TLS]] secures client-to-server connections beautifully, but system administrators need more than encrypted web traffic — they need to log into remote servers, transfer files, and tunnel network connections, all securely. A different protocol emerged for this exact purpose...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Secure Shell',
				description:
					'Before [[ssh|SSH]], administrators used Telnet to manage remote servers — sending passwords and commands in cleartext. [[ssh|SSH]] replaced it with a fully encrypted channel that supports public-key authentication (no passwords to steal), secure file transfer (SCP and SFTP), and {{port-forwarding|port forwarding}} that can tunnel any [[tcp|TCP]] connection through the encrypted link. [[ssh|SSH]] uses its own key {{exchange|exchange}} and {{encryption|encryption}} layer independent of [[tls|TLS]], and its agent forwarding feature lets you chain [[ssh|SSH]] connections through jump hosts without exposing your {{private-key|private key}}. It became the universal tool for server management, Git operations, and secure automation.',
				transition: 'With [[tls|TLS]] protecting web connections and [[ssh|SSH]] securing server access, the foundations of internet security were in place. But there was still a problem: HTTP {{encryption|encryption}} was optional, and most sites did not bother. The web needed a forcing function to make {{encryption|encryption}} the default, not the exception...'
			},
			{
				protocolId: 'http2',
				title: 'HTTPS Everywhere',
				description:
					'[[http2|HTTP/2]] was the tipping point. While the specification technically allows plaintext [[http2|HTTP/2]], every major browser only implements it over [[tls|TLS]] — making {{encryption|encryption}} a de facto requirement for the modern web. Combined with free {{certificate|certificate}} authorities like Let\'s Encrypt and browser warnings on HTTP sites ("Not Secure"), the web went from roughly 40% encrypted in 2015 to over 95% today. [[http2|HTTP/2]] also introduced {{binary-framing|binary framing}}, multiplexed streams, and {{hpack|HPACK}} header compression, but its most lasting impact may be normalizing the idea that all web traffic should be encrypted by default.'
			}
		]
	},

	// ── Network Foundations ─────────────────────────────────────────────
	{
		id: 'packet-journey',
		title: 'Journey of a Packet',
		description: 'Follow a single packet from creation to delivery on a local network, including diagnostics.',
		color: '#F472B6',
		scope: 'network-foundations',
		steps: [
			{
				protocolId: 'ethernet',
				title: 'Ethernet Framing',
				description:
					'Every packet\'s journey begins at the network interface card (NIC), which constructs an [[ethernet|Ethernet]] frame. The NIC stamps on its own 48-bit {{mac-address|MAC address}} as the source, adds the destination MAC, a type field (0x0800 for [[ip|IPv4]], 0x0806 for [[arp|ARP]]), the {{payload|payload}}, and a 4-byte Frame Check Sequence (CRC-32) that lets the receiver detect bit errors caused by electrical interference. If any bits are corrupted in {{transit|transit}}, the FCS check fails and the frame is silently discarded — no correction, just detection. This is the foundation of all local network communication.',
				transition: 'The [[ethernet|Ethernet]] frame is ready to send, but there is a chicken-and-egg problem: your application knows the destination {{ip-address|IP address}} (192.168.1.100), not the destination {{mac-address|MAC address}}. You cannot build an [[ethernet|Ethernet]] frame without a MAC. The network needs a way to translate between these two addressing systems...'
			},
			{
				protocolId: 'arp',
				title: 'ARP Resolution',
				description:
					'[[arp|ARP]] solves the [[ip|IP]]-to-MAC translation with an elegant {{broadcast|broadcast}} mechanism. Your machine sends an [[arp|ARP]] request to the {{broadcast|broadcast}} address (FF:FF:FF:FF:FF:FF) asking "Who has 192.168.1.100? Tell 192.168.1.1." Every device on the LAN segment hears this, but only the owner of that [[ip|IP]] replies with its {{mac-address|MAC address}}. The mapping is cached in your [[arp|ARP]] table (typically for 20 minutes) so subsequent packets skip the {{broadcast|broadcast}} entirely. You can see your own [[arp|ARP]] cache by running "arp -a" in a terminal. [[arp|ARP]] {{spoofing|spoofing}} — where an attacker sends fake [[arp|ARP]] replies to redirect traffic — is why network security often relies on higher-layer {{encryption|encryption}}.',
				transition: 'With the destination MAC resolved, the [[ethernet|Ethernet]] frame can be properly addressed for the local segment. Now the [[ip|IP]] layer needs to make a critical decision: is this packet destined for a machine on the same local network, or does it need to be forwarded to the {{gateway|default gateway}} for routing across the internet?'
			},
			{
				protocolId: 'ip',
				title: 'IP Addressing & Routing',
				description:
					'The [[ip|IP]] layer makes the key routing decision. It compares the destination [[ip|IP]] against the {{subnet|subnet}} mask to determine if the target is local or remote. If local, [[arp|ARP]] resolves the target\'s MAC directly. If remote, the packet is sent to the {{gateway|default gateway}} (your router), which consults its {{routing-table|routing table}} and forwards it toward the destination, hop by hop. Each router decrements the {{ttl|TTL}} ({{ttl|Time To Live}}, typically starting at 64) by one — when it reaches zero, the packet is discarded to prevent infinite routing loops. The [[ip|IP]] header also includes a header {{checksum|checksum}}, protocol field (6 for [[tcp|TCP]], 17 for [[udp|UDP]]), and {{fragmentation|fragmentation}} controls for packets that exceed a link\'s {{mtu|MTU}}.',
				transition: 'The packet has been delivered successfully — but networks are not always healthy. Links go down, routes change, hosts become unreachable, and packets get dropped. How does a network administrator diagnose problems and verify that everything is working correctly?'
			},
			{
				protocolId: 'icmp',
				title: 'ICMP Diagnostics',
				description:
					'[[icmp|ICMP]] is the internet\'s diagnostic nervous system — it does not carry user data but instead reports on the health and status of the network itself. The "ping" command sends [[icmp|ICMP]] Echo Requests and measures round-trip times to verify reachability. "Traceroute" cleverly sends packets with incrementing {{ttl|TTL}} values (1, 2, 3...), causing each successive router to reply with a "Time Exceeded" message, mapping the entire path to a destination. [[icmp|ICMP]] also carries critical error messages: "Destination Unreachable" (with subcodes for network, host, port, and {{fragmentation|fragmentation}} failures), "Redirect" (telling a host to use a better route), and "Source Quench" (legacy congestion {{signaling|signaling}}). Without [[icmp|ICMP]], debugging network problems would be nearly impossible.'
			}
		]
	},
	{
		id: 'internet-routes',
		title: 'How the Internet Routes',
		description:
			'From local [[ip|IP]] addressing to global routing — how packets find their way across the internet.',
		color: '#F472B6',
		scope: 'network-foundations',
		steps: [
			{
				protocolId: 'ip',
				title: 'IPv4: The Original Addressing',
				description:
					'[[ip|IPv4]], designed in 1981, gives every device a 32-bit address (like 192.168.1.1) and defines how packets are forwarded hop-by-hop through routers. It was brilliantly simple and powered the explosive growth of the internet — but its designers never imagined billions of smartphones, IoT sensors, and cloud instances. With only 4.3 billion possible addresses, [[ip|IPv4]] exhaustion became inevitable. {{nat|NAT}} ({{nat|Network Address Translation}}) bought time by hiding entire private networks behind a single public [[ip|IP]], but it breaks end-to-end connectivity and complicates protocols that embed [[ip|IP]] addresses in their payloads.',
				transition: '{{iana|IANA}} allocated the last [[ip|IPv4]] address blocks in 2011. The stopgap of {{nat|NAT}} created a fragile internet where devices could not directly reach each other. A fundamental redesign had been in the works since the 1990s, and the world is finally adopting it...'
			},
			{
				protocolId: 'ipv6',
				title: 'IPv6: The Next Generation',
				description:
					'[[ipv6|IPv6]] expands the address space from 32 bits to 128 bits — enough for 340 undecillion addresses (3.4 x 10^38), roughly 100 addresses per atom on Earth\'s surface. But [[ipv6|IPv6]] is not just bigger addresses: it simplifies the packet header (no more header checksums or {{fragmentation|fragmentation}} at intermediate routers), introduces {{slaac|SLAAC}} ({{stateless|Stateless}} Address Auto-Configuration) so devices can generate their own addresses without [[dhcp|DHCP]], and replaces [[arp|ARP]] with {{ndp|NDP}} ({{ndp|Neighbor Discovery Protocol}}). Most importantly, it restores true end-to-end connectivity — every device gets a globally routable address, eliminating the need for {{nat|NAT}}. The dual-stack transition (running [[ip|IPv4]] and [[ipv6|IPv6]] simultaneously) is well underway: on 28 March 2026 [[ipv6|IPv6]] carried 50.1% of {{google|Google}}\'s traffic for the first time, with US mobile carriers averaging ~87%.',
				transition: 'Individual devices now have addresses, but the internet is composed of over 70,000 autonomous systems ({{autonomous-system|AS}}) — independent networks run by ISPs, cloud providers, universities, and enterprises. These networks need a way to discover each other and calculate paths across this vast interconnected mesh...'
			},
			{
				protocolId: 'bgp',
				title: 'BGP: The Internet\'s Routing Protocol',
				description:
					'[[bgp|BGP]] (Border Gateway Protocol) is the protocol that literally holds the internet together. Each {{autonomous-system|autonomous system}} uses [[bgp|BGP]] to announce which [[ip|IP]] prefixes it owns and which paths it can reach. [[bgp|BGP]] routers at network borders {{exchange|exchange}} these announcements with their peers, building a global map of reachability. Path selection is policy-driven — an ISP might prefer cheaper {{transit|transit}} providers, avoid routes through certain countries, or favor shorter {{autonomous-system|AS}} paths. When a [[bgp|BGP]] misconfiguration happens (like Pakistan accidentally hijacking YouTube\'s prefix in 2008), large portions of the internet can go dark. Despite carrying the {{routing-table|routing table}} for the entire internet (nearly 1 million [[ip|IPv4]] prefixes), [[bgp|BGP]] runs on surprisingly modest hardware and converges within minutes after topology changes.'
			}
		]
	},

	// ── Transport ──────────────────────────────────────────────────────
	{
		id: 'reliable-delivery',
		title: 'Evolution of Reliable Delivery',
		description:
			'How transport protocols evolved from [[tcp|TCP]] to modern {{multipath|multipath}} and multiplexed solutions.',
		color: '#39FF14',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP: The Original',
				description:
					'[[tcp|TCP]] has been the workhorse of reliable internet communication since 1981 — it guarantees that every byte arrives, in order, without duplication. Underneath, it uses sequence numbers, acknowledgments, {{retransmission|retransmission}} timers, and sophisticated {{congestion-control|congestion control}} (algorithms like Reno, {{cubic|CUBIC}}, and {{bbr|BBR}} that probe the network to find the optimal sending rate). But [[tcp|TCP]] has a fundamental limitation: it provides a single ordered byte stream. When [[http2|HTTP/2]] multiplexes dozens of requests over one [[tcp|TCP]] connection, a single lost packet blocks ALL streams until it is retransmitted. This {{head-of-line-blocking|head-of-line blocking}} problem becomes increasingly painful as connections carry more concurrent data.',
				transition: '[[tcp|TCP]]\'s single-stream design meant that loss in one logical conversation blocked every other conversation sharing the same connection. The telecom industry, which needed to carry multiple independent {{signaling|signaling}} messages simultaneously, developed a different approach...'
			},
			{
				protocolId: 'sctp',
				title: 'SCTP: Multi-Streaming',
				description:
					'[[sctp|SCTP]] was the first transport protocol to tackle {{head-of-line-blocking|head-of-line blocking}} directly. It introduced independent streams within a single association — a lost packet on stream 5 does not stall streams 1 through 4. It also pioneered multi-homing: an [[sctp|SCTP]] association can span multiple [[ip|IP]] addresses on each endpoint, providing automatic failover if a network interface goes down. Additionally, [[sctp|SCTP]] preserves message boundaries natively (unlike [[tcp|TCP]]\'s raw byte stream), making it ideal for structured messages like telephony {{signaling|signaling}} (SS7 over [[ip|IP]]). While it never achieved broad web adoption because most NATs and firewalls do not understand [[sctp|SCTP]] packets, its ideas proved prescient.',
				transition: '[[sctp|SCTP]] proved that independent streams eliminate {{head-of-line-blocking|head-of-line blocking}}, and multi-homing provides resilience. But what if you want to go further — not just failing over between network paths, but actively using multiple paths simultaneously to aggregate {{bandwidth|bandwidth}}?'
			},
			{
				protocolId: 'mptcp',
				title: 'MPTCP: Multiple Paths',
				description:
					'{{multipath|Multipath}} [[tcp|TCP]] extends standard [[tcp|TCP]] to use multiple network interfaces simultaneously. Your phone can send data over both [[wifi|WiFi]] and cellular at the same time, aggregating their {{bandwidth|bandwidth}}. If you walk out of [[wifi|WiFi]] range, the cellular subflow keeps going seamlessly — no connection drop, no reconnection delay. [[mptcp|MPTCP]] works by establishing multiple [[tcp|TCP]] subflows and distributing data across them using a coupled {{congestion-control|congestion control}} algorithm that balances load fairly. {{apple|Apple}} uses [[mptcp|MPTCP]] in iOS for Siri and Maps, and it powers the seamless [[wifi|WiFi]]-to-cellular transitions you experience daily without noticing. The tradeoff is complexity: schedulers must decide which path gets which data, and reordering at the receiver adds {{latency|latency}}.',
				transition: '[[mptcp|MPTCP]] showed the power of using multiple paths, but it still inherits [[tcp|TCP]]\'s fundamental constraints — the {{three-way-handshake|three-way handshake}}, the kernel implementation that is hard to update, and middlebox interference. A completely new transport protocol, designed with all these lessons in mind, would soon arrive...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Modern Synthesis',
				description:
					'[[quic|QUIC]] represents the culmination of everything learned from [[tcp|TCP]], [[sctp|SCTP]], and [[mptcp|MPTCP]]. Built on [[udp|UDP]] to bypass ossified middleboxes, it implements its own reliability and {{congestion-control|congestion control}} in userspace (making it updatable without OS kernel changes). From [[sctp|SCTP]] it borrows independent streams without {{head-of-line-blocking|head-of-line blocking}}. It integrates [[tls|TLS]] 1.3 directly into the {{handshake|handshake}}, achieving a secure connection in just one round trip (or zero for repeat visits). [[quic|QUIC]] connections are identified by a variable-length Connection ID rather than the [[ip|IP]]/port tuple, enabling {{connection-migration|connection migration}} — switch from [[wifi|WiFi]] to cellular and the connection survives. {{google|Google}} developed it, the {{ietf|IETF}} standardized it, and it now powers [[http3|HTTP/3]] for billions of users.'
			}
		]
	},

	{
		id: 'quic-revolution',
		title: 'The QUIC Revolution',
		description:
			'How [[quic|QUIC]] rebuilt transport from the ground up — combining [[tcp|TCP]], [[tls|TLS]], and [[http2|HTTP/2]] lessons.',
		color: '#39FF14',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP + TLS: The Old Way',
				description:
					'To load a web page over HTTPS, a browser traditionally needs three sequential round trips before any page data flows: one for the [[tcp|TCP]] {{handshake|handshake}} (SYN, SYN-{{ack|ACK}}, {{ack|ACK}}), one or two more for [[tls|TLS]] (exchanging cipher suites, certificates, and key material). On a connection with 100ms {{latency|latency}}, that is 200-300ms of pure {{handshake|handshake}} overhead before a single byte of HTML arrives. Even worse, [[http2|HTTP/2]] multiplexes all its streams over a single [[tcp|TCP]] connection, so when one packet is lost, [[tcp|TCP]]\'s {{head-of-line-blocking|head-of-line blocking}} stalls every request — even though the lost data might belong to an unrelated resource like a tiny favicon.',
				transition: '{{google|Google}} measured this cost at scale across billions of Chrome connections and realized the overhead was enormous. They wanted {{one-rtt|1-RTT}} connections, {{encryption|encryption}} by default, and no {{head-of-line-blocking|head-of-line blocking}}. But deploying a new transport protocol through the existing internet — full of NATs, firewalls, and middleboxes that drop anything that is not [[tcp|TCP]] or [[udp|UDP]] — seemed impossible. Unless they built on top of something that already works everywhere...'
			},
			{
				protocolId: 'udp',
				title: 'UDP: The Foundation',
				description:
					'The key insight was that [[udp|UDP]] passes through virtually every middlebox on the internet. NATs translate [[udp|UDP]] ports, firewalls allow it, and ISP equipment does not inspect it. By layering a new protocol on top of [[udp|UDP]], {{google|Google}} could deploy revolutionary transport features without waiting for routers and operating systems to be updated — a process that historically takes decades. [[udp|UDP]] itself adds almost nothing (just 8 bytes of header with ports and a {{checksum|checksum}}), giving [[quic|QUIC]] a blank canvas to build its own reliability, {{encryption|encryption}}, and stream management entirely in userspace. This also means [[quic|QUIC]] can be updated with a browser release, not an OS kernel update.',
				transition: 'With [[udp|UDP]] providing universal reachability through the existing internet infrastructure, the [[quic|QUIC]] engineering team had the foundation they needed. Now they could design the actual transport protocol — combining the reliability lessons of [[tcp|TCP]], the {{encryption|encryption}} of [[tls|TLS]], and the {{multiplexing|multiplexing}} ideas of [[http2|HTTP/2]] into a single, unified protocol...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Synthesis',
				description:
					'[[quic|QUIC]] merges transport and security into a single protocol. Its {{handshake|handshake}} combines the connection setup and [[tls|TLS]] 1.3 key {{exchange|exchange}} into one round trip — the client sends its cryptographic parameters in the very first packet, and the server\'s first response is already encrypted. Independent streams within a single [[quic|QUIC]] connection mean a lost packet only blocks the stream it belongs to, not all traffic. Connections are identified by a variable-length Connection ID rather than the [[ip|IP]]/port 4-tuple, so when you switch from [[wifi|WiFi]] to cellular, the connection migrates seamlessly. And because [[quic|QUIC]] runs in userspace, it can be iterated on monthly rather than waiting years for kernel updates.',
				transition: 'With [[quic|QUIC]] providing fast, encrypted, multiplexed transport, the final piece was adapting HTTP to take advantage of it. [[http3|HTTP/3]] is not just "[[http2|HTTP/2]] on [[quic|QUIC]]" — it had to be redesigned because [[quic|QUIC]]\'s streams replaced the stream {{multiplexing|multiplexing}} that [[http2|HTTP/2]] implemented over [[tcp|TCP]]...'
			},
			{
				protocolId: 'http3',
				title: 'HTTP/3: The Payoff',
				description:
					'[[http3|HTTP/3]] maps one HTTP {{request-response|request-response}} to one [[quic|QUIC]] stream, giving each request independent {{flow-control|flow control}} and loss recovery. A lost packet carrying image data does not block the CSS or JavaScript streams. QPACK replaces {{hpack|HPACK}} for header compression (adapted for [[quic|QUIC]]\'s out-of-order delivery), and {{zero-rtt|0-RTT}} resumption lets returning visitors send their first HTTP request in the very first packet — zero round-trip {{latency|latency}} for the initial data. On lossy mobile networks, [[http3|HTTP/3]] delivers pages measurably faster than [[http2|HTTP/2]] over [[tcp|TCP]]. As of 2024, over 30% of global web traffic runs on [[http3|HTTP/3]], and adoption is accelerating as CDNs and cloud providers enable it by default.'
			}
		]
	},

	// ── Web / API ──────────────────────────────────────────────────────
	{
		id: 'http-timeline',
		title: 'The HTTP Timeline',
		description: 'Three decades of HTTP evolution — from [[pioneer:tim-berners-lee|Tim Berners-Lee]]\'s hypertext to [[quic|QUIC]]-powered streams.',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'http1',
				title: 'HTTP/1.1: The Foundation',
				description:
					'[[http1|HTTP/1.1]] (1997) established the web as we know it. It is entirely text-based — you can literally type "GET / [[http1|HTTP/1.1]]" into a telnet session and get a web page back. The {{keep-alive|keep-alive}} header lets a single [[tcp|TCP]] connection serve multiple sequential requests, avoiding the cost of a new {{handshake|handshake}} for each resource. But requests are strictly serialized: the client must wait for each response before sending the next request. Browsers worked around this by opening 6-8 parallel [[tcp|TCP]] connections per domain, and developers invented domain sharding, CSS sprites, and resource inlining to reduce the request count. These were hacks born from protocol limitations, and the web was crying out for something better.',
				transition: 'By 2015, the average web page required over 100 resources (scripts, stylesheets, images, fonts). Opening 6 connections per domain and serializing requests within each one was an enormous waste of {{bandwidth|bandwidth}} and {{latency|latency}}. The web needed a protocol that could handle many requests simultaneously over a single connection...'
			},
			{
				protocolId: 'http2',
				title: 'HTTP/2: Multiplexed Binary',
				description:
					'[[http2|HTTP/2]] (2015) was a ground-up redesign of how HTTP frames are encoded and transmitted, while keeping the familiar semantics (GET, POST, headers, status codes) unchanged. It switched from text to a compact {{binary-framing|binary framing}} layer, multiplexes unlimited concurrent streams over a single [[tcp|TCP]] connection, and compresses headers with {{hpack|HPACK}} (using a shared dynamic table that avoids re-sending identical headers like cookies and user-agents). {{server-push|Server push}} lets the server proactively send resources it knows the client will need (like the CSS for a page it just served). All those [[http1|HTTP/1.1]] performance hacks — domain sharding, spriting, inlining — became unnecessary and even counterproductive.',
				transition: '[[http2|HTTP/2]] eliminated the HTTP-layer {{head-of-line-blocking|head-of-line blocking}}, but it exposed a deeper problem: all those multiplexed streams shared a single [[tcp|TCP]] connection. When one [[tcp|TCP]] packet was lost, [[tcp|TCP]]\'s ordered delivery guarantee stalled ALL streams until the {{retransmission|retransmission}} arrived. The protocol needed a new transport layer that would not punish unrelated streams for one stream\'s lost packet...'
			},
			{
				protocolId: 'http3',
				title: 'HTTP/3: QUIC-Powered',
				description:
					'[[http3|HTTP/3]] (2022) runs on [[quic|QUIC]] instead of [[tcp|TCP]], finally eliminating {{head-of-line-blocking|head-of-line blocking}} at every layer. Each HTTP stream maps to an independent [[quic|QUIC]] stream with its own loss recovery — a dropped packet on one stream cannot block any other. QPACK replaces {{hpack|HPACK}} for header compression, adapted for [[quic|QUIC]]\'s potentially out-of-order stream delivery. The integrated [[tls|TLS]] 1.3 {{handshake|handshake}} means a new connection is ready in one round trip, and {{zero-rtt|0-RTT}} resumption for returning visitors means the browser can send its first HTTP request instantly. {{connection-migration|Connection migration}} (via [[quic|QUIC]]\'s Connection ID) means a phone switching from [[wifi|WiFi]] to cellular does not drop the page load. The three decades of HTTP evolution culminate here: a fast, encrypted, multiplexed protocol that works well even on lossy mobile networks.'
			}
		]
	},
	{
		id: 'rest-to-realtime',
		title: 'REST to Real-Time',
		description: 'From simple {{request-response|request-response}} to persistent bidirectional communication.',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: Request-Response',
				description:
					'[[rest|REST]] (Representational State Transfer) models your API as a collection of resources, each identified by a URL, manipulated through standard HTTP methods: GET to read, POST to create, PUT to replace, DELETE to remove. Its {{stateless|stateless}} design means every request carries all the context the server needs — no session state to manage, trivial to cache, easy to scale behind load balancers. [[rest|REST]] dominates web APIs because of this simplicity. But it has a fundamental limitation: the client must ask for updates. If you want real-time stock prices or live chat messages, you are stuck polling — hammering the server with repeated requests, most of which return "nothing new," wasting {{bandwidth|bandwidth}} and battery life.',
				transition: 'Polling is like repeatedly calling someone to ask "any news?" — wasteful for both parties. What if the server could simply call you back whenever something interesting happens? The web platform introduced a lightweight mechanism for exactly this kind of one-way push...'
			},
			{
				protocolId: 'sse',
				title: 'SSE: Server-Sent Events',
				description:
					'[[sse|Server-Sent Events]] flip the [[rest|REST]] model on its head: instead of the client polling, the server holds the connection open and pushes events whenever they occur. It works over plain HTTP (so it passes through proxies, load balancers, and CDNs without issues), uses a dead-simple text-based format (just "data:" lines), and the browser\'s EventSource API automatically reconnects if the connection drops — even resuming from the last received event ID. [[sse|SSE]] is perfect for live dashboards, {{notification|notification}} feeds, log tailing, and AI streaming responses (like ChatGPT\'s token-by-token output). The limitation is that it is one-directional: only the server can push. If the client needs to send messages too, it must use separate HTTP requests.',
				transition: '[[sse|SSE]] handles server-to-client streaming elegantly, but many applications need truly bidirectional communication — chat applications where both users type simultaneously, multiplayer games with constant input and output, collaborative editors where every keystroke must be {{broadcast|broadcast}}. These need a connection where either side can send at any moment...'
			},
			{
				protocolId: 'websockets',
				title: 'WebSockets: Full Duplex',
				description:
					'[[websockets|WebSockets]] upgrade an HTTP connection into a persistent, {{full-duplex|full-duplex}} channel where both client and server can send messages independently at any time — no request/response pairing required. After the initial HTTP upgrade {{handshake|handshake}}, the protocol switches to a lightweight {{binary-framing|binary framing}} format with minimal overhead (as little as 2 bytes per frame). This makes [[websockets|WebSockets]] ideal for chat applications (Slack, Discord), multiplayer gaming (real-time position updates), collaborative editing ({{google|Google}} Docs cursors), and financial trading (live order book updates). The tradeoff is that [[websockets|WebSockets]] are raw pipes — they give you a message channel but impose no structure on what flows through it. You must design your own message formats, error handling, and connection management.',
				transition: '[[websockets|WebSockets]] provide raw bidirectional messaging, but for microservice architectures and complex distributed systems, developers need more structure: typed message schemas, automatic code generation for multiple languages, streaming in both directions, and efficient binary {{serialization|serialization}}. Enterprise systems need a proper RPC framework...'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Typed Streaming RPC',
				description:
					'[[grpc|gRPC]] brings the rigor of typed interfaces to network communication. You define your service and message schemas in {{protocol-buffers|Protocol Buffers}} (.proto files), and the [[grpc|gRPC]] toolchain generates client and server code in dozens of languages — Go, Java, Python, Rust, C++, TypeScript, and more. Messages are serialized to a compact binary format (5-10x smaller than {{json|JSON}}), and the transport runs on [[http2|HTTP/2]] with full support for four streaming patterns: unary (single request/response), server streaming, client streaming, and bidirectional streaming. Built-in features include deadlines, cancellation, metadata propagation, and pluggable authentication. [[grpc|gRPC]] is the backbone of microservice communication at {{google|Google}}, Netflix, and most major cloud providers.'
			}
		]
	},

	// ── Async / IoT ────────────────────────────────────────────────────
	{
		id: 'pubsub-patterns',
		title: 'Pub/Sub Patterns',
		description: 'Three approaches to decoupled, asynchronous messaging at different scales.',
		color: '#C084FC',
		scope: 'async-iot',
		steps: [
			{
				protocolId: 'mqtt',
				title: 'MQTT: Lightweight IoT',
				description:
					'[[mqtt|MQTT]] was designed for the harshest conditions: sensors on oil rigs with satellite uplinks, medical devices with intermittent cellular, smart home gadgets on flaky [[wifi|WiFi]]. Its binary protocol is extraordinarily compact — a minimal publish message is just 2 bytes of overhead. Clients publish to hierarchical topics (like "home/kitchen/temperature") and subscribe with wildcards ("home/+/temperature" for all rooms). Three QoS levels let you choose between fire-and-forget (QoS 0), acknowledged delivery (QoS 1), and {{exactly-once-delivery|exactly-once delivery}} (QoS 2). The broker handles all routing: publishers and subscribers never need to know about each other, creating clean decoupling. A "{{last-will|Last Will}}" message is even sent automatically if a device disconnects unexpectedly.',
				transition: '[[mqtt|MQTT]] excels at getting small messages from constrained devices to a broker, but enterprise systems need more sophisticated message routing. What if you need to route messages based on content, fan out to multiple queues, implement priority ordering, or guarantee transactional processing with dead-letter handling?'
			},
			{
				protocolId: 'amqp',
				title: 'AMQP: Enterprise Messaging',
				description:
					'[[amqp|AMQP]] (Advanced Message Queuing Protocol) is the industrial-strength messaging protocol for enterprise systems. It introduces a powerful routing model: producers send messages to exchanges, which route them to queues based on bindings. Different {{exchange|exchange}} types enable different patterns — direct exchanges for point-to-point, fanout for broadcasting to all queues, {{topic|topic}} exchanges for pattern-based routing, and headers exchanges for attribute-based routing. Messages can be persistent (surviving broker restarts), acknowledged (consumers confirm processing), and rejected (dead-lettered for error handling). This architecture powers financial trading systems, healthcare data pipelines, and e-commerce order processing where losing a message could mean losing money or endangering lives.',
				transition: '[[amqp|AMQP]] handles complex enterprise routing brilliantly, but what happens when you need to process millions of events per second, replay historical data, and scale horizontally across dozens of servers? Enterprise message brokers were not designed for internet-scale event streaming...'
			},
			{
				protocolId: 'kafka',
				title: 'Kafka: Event Streaming',
				description:
					'[[kafka|Kafka]] reimagined messaging as a distributed commit log — an append-only, immutable sequence of events that can be replayed from any point in time. Topics are split into partitions distributed across a cluster, with each {{partition|partition}} replicated for fault tolerance. Consumer groups enable parallel processing: each consumer in a group reads from different partitions, providing horizontal scalability. Unlike traditional message queues that delete messages after consumption, [[kafka|Kafka]] retains events for a configurable period (days, weeks, or forever), enabling new consumers to reprocess the entire history. This makes it ideal for event sourcing, change data capture, stream processing pipelines, and building real-time data platforms. LinkedIn, where [[kafka|Kafka]] was born, processes over 7 trillion messages per day through it.'
			}
		]
	},
	{
		id: 'iot-to-enterprise',
		title: 'IoT to Enterprise',
		description:
			'From constrained sensors to enterprise integrations — messaging at every scale.',
		color: '#C084FC',
		scope: 'async-iot',
		steps: [
			{
				protocolId: 'coap',
				title: 'CoAP: Constrained Devices',
				description:
					'[[coap|CoAP]] (Constrained Application Protocol) brings [[rest|REST]]-like semantics to devices too small and power-limited for HTTP. Running over [[udp|UDP]] with compact binary headers (just 4 bytes fixed), it supports GET, PUT, POST, and DELETE on resources identified by URIs — familiar patterns for web developers, but sized for microcontrollers with 10KB of RAM. Its "Observe" option lets a client register for notifications when a resource changes (like a temperature sensor), avoiding the cost of repeated polling. [[coap|CoAP]] also supports {{multicast|multicast}} for discovering devices on a network and {{dtls|DTLS}} for encrypted communication. Think of it as HTTP shrunk down for a world where every byte and milliwatt counts.',
				transition:
					'[[coap|CoAP]] works brilliantly for individual device communication, but a real IoT deployment might have thousands of sensors, each publishing readings every few seconds. Something needs to aggregate all these data streams, handle intermittent connectivity, and route data to the right consumers without every device needing to know about every consumer...'
			},
			{
				protocolId: 'mqtt',
				title: 'MQTT: Device Gateway',
				description:
					'[[mqtt|MQTT]] acts as the central nervous system of an IoT deployment. A gateway device translates [[coap|CoAP]] messages from local sensors into [[mqtt|MQTT]] publishes, sending them to a broker that manages all subscriptions and routing. Topics create a natural hierarchy for organizing device data: "factory/floor-2/press-7/temperature" makes it intuitive to subscribe to all sensors on floor 2 ("factory/floor-2/#") or all temperature readings ("factory/+/+/temperature"). QoS levels ensure data reaches its destination even over unreliable cellular or satellite links. The broker also tracks which devices are online via {{keep-alive|keep-alive}} pings and publishes {{last-will|Last Will}} messages when a device disappears, enabling immediate alerting on device failures.',
				transition:
					'[[mqtt|MQTT]] reliably moves IoT data from the edge to central systems, but enterprise applications — web dashboards, analytics platforms, legacy systems — often cannot speak [[mqtt|MQTT]] directly. You need a protocol that bridges the gap, one that is simple enough for a web developer to integrate in an afternoon...'
			},
			{
				protocolId: 'stomp',
				title: 'STOMP: Simple Integration',
				description:
					'[[stomp|STOMP]] (Simple Text Oriented Messaging Protocol) is the HTTP of messaging — entirely text-based and human-readable, making it trivial to debug with basic tools. Commands like CONNECT, SUBSCRIBE, SEND, and {{ack|ACK}} are self-explanatory, and any developer who understands HTTP can integrate [[stomp|STOMP]] in minutes. Web applications commonly use [[stomp|STOMP]] over [[websockets|WebSockets]], enabling browser-based dashboards to subscribe to IoT data feeds in real time. Message brokers like RabbitMQ and ActiveMQ support [[stomp|STOMP]] alongside their native protocols, making it the easiest on-ramp for connecting web frontends to messaging infrastructure. The tradeoff is efficiency: text headers and no compression mean more overhead than binary protocols.',
				transition: '[[stomp|STOMP]] makes integration easy, but enterprise data processing demands more — content-based routing that sends alerts only to the right team, transactional message handling that guarantees no order is processed twice, dead-letter queues for failed processing, and priority ordering for time-sensitive data. These requirements call for a full-featured enterprise messaging protocol...'
			},
			{
				protocolId: 'amqp',
				title: 'AMQP: Enterprise Processing',
				description:
					'At the enterprise tier, [[amqp|AMQP]] provides the routing sophistication and reliability guarantees that business-critical systems demand. IoT data flowing in from [[mqtt|MQTT]] can be routed by [[amqp|AMQP]] exchanges based on content, priority, or routing keys — temperature alerts go to the monitoring queue, maintenance data goes to the ERP integration queue, and raw telemetry goes to the data lake ingestion queue. Transactional publishing ensures that a batch of related messages either all arrive or none do. Consumer acknowledgments guarantee that no message is lost if a processing node crashes mid-operation — the broker simply redelivers to another consumer. This reliability pipeline transforms raw sensor data into trustworthy business intelligence.'
			}
		]
	},

	// ── Real-Time A/V ──────────────────────────────────────────────────
	{
		id: 'video-call',
		title: 'Building a Video Call',
		description:
			'The protocols that make real-time video communication possible in the browser.',
		color: '#FF9F67',
		scope: 'realtime-av',
		steps: [
			{
				protocolId: 'sdp',
				title: 'SDP: Session Description',
				description:
					'Before a single frame of video can flow, both peers need to agree on the ground rules: which codecs they support (VP8, H.264, Opus), what transport addresses to use, which media types to {{exchange|exchange}} (audio, video, or both), and their {{bandwidth|bandwidth}} capabilities. [[sdp|SDP]] (Session Description Protocol) is a structured text format that encodes all of this into an "offer" from one {{peer|peer}} and an "answer" from the other. This offer/answer {{exchange|exchange}} happens through a {{signaling|signaling}} server (which could use [[websockets|WebSockets]], HTTP, or even copy-pasting text), and it is the critical negotiation step that makes two arbitrary devices mutually intelligible. Without [[sdp|SDP]], neither {{peer|peer}} would know how to decode the other\'s media.',
				transition:
					'Both peers have agreed on codecs, formats, and transport parameters through [[sdp|SDP]] negotiation. The {{signaling|signaling}} is complete — but now the actual audio and video data needs a way to travel between them in real time, with timestamps for synchronization and sequence numbers for detecting loss...'
			},
			{
				protocolId: 'rtp',
				title: 'RTP: Media Transport',
				description:
					'[[rtp|RTP]] (Real-time Transport Protocol) is the workhorse that carries the actual audio and video data. Each [[rtp|RTP]] packet includes a timestamp (essential for playing audio and video at the right moment, even if packets arrive out of order), a {{sequence-number|sequence number}} (for detecting lost packets), a {{payload|payload}} type identifier (so the receiver knows which {{codec|codec}} to use for decoding), and synchronization source identifiers (for distinguishing multiple media streams). [[rtp|RTP]] runs over [[udp|UDP]] because real-time media cannot afford [[tcp|TCP]]\'s {{retransmission|retransmission}} delays — a 200ms-old video frame is useless, so it is better to skip it and show the next one. Its companion protocol {{rtcp|RTCP}} provides feedback: receiver reports on packet loss and {{jitter|jitter}} help the sender adapt its bitrate in real time.',
				transition:
					'[[rtp|RTP]] handles media transport beautifully, but building a video call in a web browser involves much more than just sending packets. Peers are usually behind NATs and firewalls, all media must be encrypted, and browsers need a JavaScript API to access cameras and microphones. A comprehensive framework is needed to tie everything together...'
			},
			{
				protocolId: 'webrtc',
				title: 'WebRTC: The Full Stack',
				description:
					'[[webrtc|WebRTC]] is the browser-native framework that makes {{peer-to-peer|peer-to-peer}} video calls possible without plugins. It orchestrates an entire stack: ICE (Interactive Connectivity Establishment) punches through NATs by testing multiple connection candidates (local addresses, server-reflexive via {{stun|STUN}}, relay via {{turn|TURN}}) and selecting the best path. {{dtls|DTLS}} (Datagram [[tls|TLS]]) encrypts the connection, and {{srtp|SRTP}} (Secure [[rtp|RTP]]) encrypts the media streams. The getUserMedia API accesses cameras and microphones, RTCPeerConnection manages the connection lifecycle, and RTCDataChannel provides a reliable or unreliable channel for arbitrary data (file sharing, game state, text chat) alongside the media. All of this happens {{peer-to-peer|peer-to-peer}} — video data flows directly between browsers without passing through a server, reducing {{latency|latency}} and server costs.'
			}
		]
	},
	{
		id: 'streaming-media',
		title: 'Streaming Video',
		description:
			'How video gets from a server to your screen — three approaches to media streaming.',
		color: '#FF9F67',
		scope: 'realtime-av',
		steps: [
			{
				protocolId: 'rtmp',
				title: 'RTMP: Legacy Streaming',
				description:
					'[[rtmp|RTMP]] (Real-Time Messaging Protocol) was developed by Macromedia for Flash Player and became the dominant live streaming protocol for over a decade. It maintains a persistent [[tcp|TCP]] connection and multiplexes audio, video, and data messages into interleaved chunks, achieving low {{latency|latency}} (1-3 seconds) for live broadcasts. [[rtmp|RTMP]] powered early YouTube live, Twitch, and Facebook Live. However, it required specialized streaming servers (like Adobe Media Server or Wowza), could not pass through many firewalls and proxies, and while Flash Player\'s end-of-life in 2020 ended [[rtmp|RTMP]]\'s use for playback, the protocol survives as a widely-used ingest format — streamers still use [[rtmp|RTMP]] to send video from OBS to platforms like Twitch, which then transcode and redistribute via modern protocols.',
				transition:
					'[[rtmp|RTMP]]\'s dependence on Flash and specialized servers was its downfall. The insight that changed everything was simple: what if you broke video into small files and served them over plain HTTP? Suddenly any web server, any {{cdn|CDN}}, and any HTTP cache in the world could deliver video without special software...'
			},
			{
				protocolId: 'hls',
				title: 'HLS: Adaptive HTTP',
				description:
					'[[hls|HLS]] (HTTP Live Streaming), created by {{apple|Apple}} in 2009, broke video streaming wide open. The encoder splits the video into small segments (typically 6-10 seconds each), encodes each segment at multiple quality levels (360p, 720p, 1080p, 4K), and generates a playlist file (.m3u8) listing the available segments and qualities. The player downloads the playlist, starts fetching segments, and continuously monitors download speed — if {{bandwidth|bandwidth}} drops, it seamlessly switches to a lower quality; when {{bandwidth|bandwidth}} recovers, it ramps back up. Because everything is plain HTTP, it works through any {{cdn|CDN}}, proxy, or cache, making it massively scalable. [[hls|HLS]] is natively supported in Safari and iOS, and nearly every streaming platform uses it as their primary delivery format.',
				transition:
					'[[hls|HLS]] transformed video delivery but is an {{apple|Apple}}-developed technology. The internet standards community wanted an open, vendor-neutral alternative that could offer the same adaptive streaming benefits while supporting a wider range of codecs and DRM systems without patent encumbrances...'
			},
			{
				protocolId: 'dash',
				title: 'DASH: Open Standard',
				description:
					'[[dash|DASH]] (Dynamic Adaptive Streaming over HTTP) is the ISO-standardized answer to [[hls|HLS]]. Instead of an {{apple|Apple}}-specific playlist format, [[dash|DASH]] uses an {{xml|XML}}-based Media Presentation Description (MPD) that describes available representations — each with its {{codec|codec}}, resolution, bitrate, and segment URLs. Being {{codec|codec}}-agnostic, [[dash|DASH]] supports H.264, H.265/HEVC, VP9, AV1, and any future {{codec|codec}} without protocol changes. It offers more flexible segment addressing (template-based URLs, byte-range requests, timeline-based indexing) and supports features like multi-period presentations (inserting ads as separate periods) and content protection descriptors for DRM integration. Netflix, YouTube, and most major streaming services use [[dash|DASH]] for non-{{apple|Apple}} devices, often running both [[dash|DASH]] and [[hls|HLS]] in parallel to cover the entire device ecosystem.'
			}
		]
	},

	// ── Utilities / Security ───────────────────────────────────────────
	{
		id: 'securing-connection',
		title: 'Securing the Connection',
		description:
			'The invisible infrastructure that translates names, encrypts data, and secures access.',
		color: '#2DD4BF',
		scope: 'utilities',
		steps: [
			{
				protocolId: 'dns',
				title: 'DNS: Name Resolution',
				description:
					'[[dns|DNS]] is the first step in almost every internet interaction — and also one of the most vulnerable. Traditional [[dns|DNS]] queries travel in plaintext over [[udp|UDP]], meaning your ISP (or anyone on the network path) can see every domain you visit. Modern hardening includes {{dnssec|DNSSEC}} (cryptographic signatures that prevent spoofed [[dns|DNS]] responses), [[dns|DNS]]-over-HTTPS (DoH) and [[dns|DNS]]-over-[[tls|TLS]] (DoT) which encrypt queries so observers cannot read them, and [[dns|DNS]]-based authentication like DANE which allows domain owners to publish their [[tls|TLS]] {{certificate|certificate}} fingerprints in [[dns|DNS]] itself. Securing [[dns|DNS]] is critical because a compromised [[dns|DNS]] response can redirect you to a phishing site that perfectly mimics your bank — and no amount of [[tls|TLS]] will help if you connect to the wrong server.',
				transition:
					'[[dns|DNS]] has told you WHERE to connect, but the connection itself is still vulnerable — anyone on the network path can read, modify, or inject data. The next step is wrapping the connection in {{encryption|encryption}} that guarantees confidentiality, integrity, and authenticity...'
			},
			{
				protocolId: 'tls',
				title: 'TLS: Encryption',
				description:
					'[[tls|TLS]] is the {{encryption|encryption}} layer that makes secure internet communication possible. During the {{handshake|handshake}}, the server presents a {{certificate|certificate}} signed by a trusted {{certificate-authority|Certificate Authority}}, proving it is who it claims to be (authentication). Both sides negotiate a {{cipher-suite|cipher suite}} and perform a key {{exchange|exchange}} (typically ECDHE — Elliptic Curve Diffie-Hellman Ephemeral) to create shared session keys that provide {{forward-secrecy|forward secrecy}}: even if the server\'s long-term {{private-key|private key}} is later compromised, past recorded sessions cannot be decrypted. Every byte of application data is then encrypted (confidentiality) and authenticated with a MAC (integrity). [[tls|TLS]] 1.3 simplified the protocol dramatically, removing insecure legacy algorithms, reducing the {{handshake|handshake}} to one round trip, and making {{zero-rtt|0-RTT}} resumption possible for repeat connections.',
				transition:
					'[[tls|TLS]] protects the data flowing over network connections, but server administrators need more than encrypted web traffic — they need to securely log into remote machines, transfer configuration files, and set up encrypted tunnels. A purpose-built protocol for secure remote access emerged to fill this gap...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Secure Access',
				description:
					'[[ssh|SSH]] replaced the dangerously insecure Telnet and rlogin protocols, becoming the universal standard for secure remote server management. It supports multiple authentication methods — password, public-key (Ed25519 or RSA), {{certificate|certificate}}-based, and multi-factor — with public-key being the gold standard (no password to intercept or guess). Beyond remote shells, [[ssh|SSH]] provides SCP and SFTP for encrypted file transfer, local and remote {{port-forwarding|port forwarding}} for tunneling any [[tcp|TCP]] connection through the encrypted channel, and agent forwarding for securely chaining through jump hosts. Its config file (~/.ssh/config) lets you define per-host settings, jump proxies, and identity files. [[ssh|SSH]] is also the transport for Git operations, making it foundational to modern software development workflows.'
			}
		]
	},
	{
		id: 'network-bootstrap',
		title: 'Getting Online',
		description:
			'The chain of protocols that runs every time a device connects to a network.',
		color: '#2DD4BF',
		scope: 'utilities',
		steps: [
			{
				protocolId: 'dhcp',
				title: 'DHCP: Get an Address',
				description:
					'When your device joins a network, it literally has no identity — no {{ip-address|IP address}}, no {{subnet|subnet}} mask, no idea where the gateway is. [[dhcp|DHCP]] (Dynamic Host Configuration Protocol) solves this bootstrap problem through a four-step dance called DORA: your device broadcasts a Discover message to the entire LAN (since it cannot address anyone specifically), a [[dhcp|DHCP]] server responds with an Offer containing an available [[ip|IP]], your device formally Requests that address, and the server sends an {{ack|Acknowledgment}} confirming the {{lease|lease}}. Along with the [[ip|IP]], [[dhcp|DHCP]] provides the {{subnet|subnet}} mask, {{gateway|default gateway}}, [[dns|DNS]] server addresses, {{lease|lease}} duration, and often additional options like [[ntp|NTP]] servers and domain search suffixes. Without [[dhcp|DHCP]], every device on every network would need manual [[ip|IP]] configuration — a nightmare at any scale.',
				transition:
					'Your device has an {{ip-address|IP address}} and can send packets, but its internal clock might be hours or even years off — set to a factory default or drifted during a long power-off period. This matters more than you might think: [[tls|TLS]] certificates have validity windows, log timestamps must be accurate for debugging, and Kerberos authentication fails with more than 5 minutes of clock skew...'
			},
			{
				protocolId: 'ntp',
				title: 'NTP: Sync the Clock',
				description:
					'[[ntp|NTP]] (Network Time Protocol) synchronizes your device\'s clock with atomic time references accurate to billionths of a second. It uses a clever algorithm that sends multiple time-stamped packets to upstream servers, measures the round-trip delay, and calculates the {{offset|offset}} between your clock and the server\'s clock — compensating for the asymmetric network {{latency|latency}}. [[ntp|NTP]] organizes time sources in a stratum hierarchy: stratum 0 is the atomic clock itself, stratum 1 servers connect directly to those clocks, stratum 2 servers sync from stratum 1, and so on. Accurate time is not just a convenience — [[tls|TLS]] certificates that appear expired due to clock drift will be rejected, distributed databases use timestamps for conflict resolution, and forensic logging is useless if you cannot trust when events occurred.',
				transition:
					'Your device now has a network address ([[dhcp|DHCP]]) and an accurate clock ([[ntp|NTP]]). The infrastructure is ready. But when you type "gmail.com" into a browser, the network needs to translate that human-friendly name into a machine-routable {{ip-address|IP address}}...'
			},
			{
				protocolId: 'dns',
				title: 'DNS: Resolve Names',
				description:
					'With a working network connection and the [[dns|DNS]] server address provided by [[dhcp|DHCP]], your device can finally translate domain names into [[ip|IP]] addresses. The recursive resolver (usually run by your ISP or a public service like 8.8.8.8 or 1.1.1.1) does the heavy lifting: it queries root servers, TLD servers, and authoritative nameservers on your behalf, caching results at each level. The first [[dns|DNS]] query after connecting might take 50-100ms as the resolver walks the hierarchy, but subsequent queries for the same domain hit the cache and resolve in under 1ms. This is also where content delivery networks work their magic — [[dns|DNS]] can return different [[ip|IP]] addresses based on your geographic location, directing you to the nearest server.',
				transition:
					'Your device can now resolve any hostname on the internet and reach servers across the globe. The network stack is fully operational — [[dns|DNS]] resolves names, [[tcp|TCP]] provides reliable connections, and [[tls|TLS]] encrypts them. Time to put it all to work by communicating with the outside world...'
			},
			{
				protocolId: 'smtp',
				title: 'SMTP: First Message',
				description:
					'With the full network stack operational, your email client can connect to the mail server and send your first message. [[smtp|SMTP]] (Simple Mail Transfer Protocol) uses a text-based command dialogue that has barely changed since 1982: EHLO introduces your client, AUTH LOGIN authenticates you, MAIL FROM and RCPT TO specify the envelope addresses, and DATA begins the message body (headers, MIME parts, attachments). Modern [[smtp|SMTP]] uses STARTTLS to upgrade the connection to encrypted, and SPF/DKIM/DMARC records in [[dns|DNS]] authenticate the sender to prevent {{spoofing|spoofing}}. This first successful email is proof that every layer of the network stack — from physical [[ethernet|Ethernet]] to application protocols — is functioning correctly.'
			}
		]
	},
	{
		id: 'api-design-patterns',
		title: 'API Design Patterns',
		description:
			'Compare three major approaches to building APIs — from resource-oriented [[rest|REST]] to flexible [[graphql|GraphQL]] to high-performance [[grpc|gRPC]].',
		color: '#818CF8',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: Resources and URLs',
				description:
					'[[rest|REST]] (Representational State Transfer) models every piece of data as a resource with a unique URL. Clients interact using standard HTTP methods: GET to read, POST to create, PUT to replace, DELETE to remove. [[rest|REST]] APIs are {{stateless|stateless}} — every request contains all the information needed to process it, making them easy to cache and scale. The trade-off is rigidity: clients get fixed data structures, often leading to over-fetching (getting fields they do not need) or under-fetching (needing multiple requests to assemble a view). [[rest|REST]] dominates the web because of its simplicity, but complex UIs with deeply nested data often outgrow it.',
				transition: '[[rest|REST]] APIs work well for simple CRUD operations, but mobile and single-page apps often need data from many related resources in a single screen. What if the client could specify exactly the data it needs in one request?'
			},
			{
				protocolId: 'graphql',
				title: 'GraphQL: Ask for Exactly What You Need',
				description:
					'[[graphql|GraphQL]] lets clients send a query describing exactly the shape of the data they want, and the server returns only that — no more, no less. A single query can traverse relationships (user → posts → comments) that would require multiple [[rest|REST]] endpoints. The schema is typed and introspectable, making APIs self-documenting. Mutations handle writes, and subscriptions push real-time updates over [[websockets|WebSockets]]. The trade-off: the server must resolve arbitrary query shapes, making caching harder (no URL-based caching), rate-limiting more complex (a single query can be expensive), and N+1 database problems common without careful DataLoader usage.',
				transition: '[[graphql|GraphQL]] gives clients flexibility, but its text-based {{json|JSON}} format adds overhead. For internal microservice communication where both sides are controlled by the same team, is there an even more efficient option?'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Binary Speed for Services',
				description:
					'[[grpc|gRPC]] uses {{protocol-buffers|Protocol Buffers}} (protobuf) for compact binary {{serialization|serialization}} and [[http2|HTTP/2]] for multiplexed transport, making it 3-10x faster to parse than {{json|JSON}}. Services are defined in .proto files that generate strongly-typed client and server code in 11 languages. [[grpc|gRPC]] supports four communication patterns: unary ({{request-response|request-response}}), server streaming, client streaming, and bidirectional streaming. This makes it ideal for microservice meshes where low {{latency|latency}} and type safety {{matter|matter}} more than human readability. The trade-off: browsers cannot call [[grpc|gRPC]] directly (they need a proxy like [[grpc|gRPC]]-Web or Envoy), and debugging requires special tooling since the {{payload|payload}} is binary.'
			}
		]
	},
	{
		id: 'auth-journey',
		title: 'How Authentication Works',
		description:
			'Understand the protocols that prove identity and protect communication — from [[oauth2|OAuth]] tokens to [[tls|TLS]] certificates to [[ssh|SSH]] keys.',
		color: '#F59E0B',
		scope: 'global',
		steps: [
			{
				protocolId: 'oauth2',
				title: 'OAuth 2.0: Delegated Authorization',
				description:
					'[[oauth2|OAuth]] 2.0 solves a fundamental problem: how can a third-party app access your data without knowing your password? Instead of sharing credentials, [[oauth2|OAuth]] uses an authorization server as an intermediary. You authenticate directly with the provider ({{google|Google}}, GitHub), approve specific permissions (scopes), and the provider issues a time-limited {{access-token|access token}} to the app. The Authorization Code flow with {{pkce|PKCE}} is the standard for web and mobile apps — it uses a code verifier to prevent interception attacks. Refresh tokens allow silent re-authentication without user interaction. [[oauth2|OAuth]] is authorization (what you can access), not authentication (who you are) — OpenID Connect adds the identity layer on top.',
				transition: '[[oauth2|OAuth]] tokens travel over the network as Bearer tokens in HTTP headers. But how are those HTTP connections themselves protected from eavesdroppers? The answer is the {{encryption|encryption}} layer that secures virtually all internet traffic...'
			},
			{
				protocolId: 'tls',
				title: 'TLS: Encrypted Channels',
				description:
					'[[tls|TLS]] protects every [[oauth2|OAuth]] token, every API key, and every password in {{transit|transit}}. During the {{handshake|handshake}}, the server proves its identity with a {{certificate|certificate}} signed by a trusted {{certificate-authority|Certificate Authority}}, and both sides negotiate {{encryption|encryption}} parameters. The key {{exchange|exchange}} (ECDHE) generates ephemeral session keys that provide {{forward-secrecy|forward secrecy}} — even if the server\'s {{private-key|private key}} is later compromised, past sessions remain secure. [[tls|TLS]] 1.3 streamlined this to a single round trip and removed all insecure legacy algorithms. Without [[tls|TLS]], [[oauth2|OAuth]] tokens would be visible to anyone on the network path.',
				transition: '[[tls|TLS]] secures data in {{transit|transit}} over the network. But system administrators need a different kind of secure access — interactive shell sessions, file transfers, and tunnels to remote machines. A purpose-built protocol provides this with a different trust model...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Key-Based Machine Access',
				description:
					'[[ssh|SSH]] replaces the trust model entirely: instead of {{certificate|Certificate}} Authorities, it uses a "trust on first use" approach where you verify the server\'s host key fingerprint on first connection and your client remembers it for future sessions. Authentication typically uses Ed25519 key pairs — your {{private-key|private key}} stays on your machine, your {{public-key|public key}} is placed on every server you need access to. No passwords traverse the network. [[ssh|SSH]] also provides encrypted tunnels ({{port-forwarding|port forwarding}}) that can wrap any [[tcp|TCP]] protocol in {{encryption|encryption}}, SFTP for secure file transfer, and agent forwarding for chaining through bastion hosts. It is the backbone of DevOps: git pushes, Ansible deployments, and remote debugging all flow through [[ssh|SSH]].'
			}
		]
	},
	{
		id: 'network-troubleshooting',
		title: 'Network Troubleshooting',
		description:
			'The diagnostic toolkit every engineer reaches for — from pinging hosts to tracing routes to resolving addresses.',
		color: '#EF4444',
		scope: 'global',
		steps: [
			{
				protocolId: 'icmp',
				title: 'ICMP: Is It Alive?',
				description:
					'When something goes wrong on a network, [[icmp|ICMP]] is the first tool you reach for. The ping command sends an [[icmp|ICMP]] Echo Request to a host and measures the time until the Echo Reply comes back — giving you {{rtt|round-trip time}}, packet loss percentage, and basic reachability in one command. Traceroute exploits [[icmp|ICMP]] in a clever way: it sends packets with incrementally increasing {{ttl|TTL}} ({{ttl|Time to Live}}) values. Each router along the path decrements the {{ttl|TTL}}, and when it hits zero, that router sends back an [[icmp|ICMP]] Time Exceeded message — revealing its identity and distance. This traces the exact path packets take across the internet, exposing where {{latency|latency}} spikes or failures occur.',
				transition: '[[icmp|ICMP]] told you whether a host is reachable and traced the network path to get there. But what if the problem is not routing — what if the hostname itself is not resolving to the right {{ip-address|IP address}}? [[dns|DNS]] issues are one of the most common causes of "the internet is broken"...'
			},
			{
				protocolId: 'dns',
				title: 'DNS: Is It Resolving?',
				description:
					'[[dns|DNS]] problems masquerade as total network failures — everything seems down, but the real issue is name resolution. The dig command queries [[dns|DNS]] servers directly, showing you exactly which records are returned, which nameserver answered, the {{ttl|TTL}} remaining on cached entries, and the full query chain. You can query specific record types (A, AAAA, MX, CNAME, NS) and specific [[dns|DNS]] servers to isolate whether the problem is your local resolver, the authoritative server, or caching. Common issues include stale cached records (wait for {{ttl|TTL}} expiry or flush the cache), misconfigured NS delegations, missing or incorrect A/AAAA records, and {{dnssec|DNSSEC}} validation failures.',
				transition: '[[dns|DNS]] resolved the hostname to an {{ip-address|IP address}}, and [[icmp|ICMP]] confirmed the host is reachable at the network layer. But on a local network, there is one more address translation that happens invisibly — if this layer breaks, devices on the same {{subnet|subnet}} cannot communicate at all...'
			},
			{
				protocolId: 'arp',
				title: 'ARP: Is Layer 2 Working?',
				description:
					'[[arp|ARP]] operates at the boundary between [[ip|IP]] addresses and physical hardware. When your machine knows the [[ip|IP]] of a target on the same {{subnet|subnet}}, it still needs the target\'s {{mac-address|MAC address}} to build an [[ethernet|Ethernet]] frame. [[arp|ARP]] broadcasts a request to the entire LAN, and the target responds with its {{mac-address|MAC address}}. The arp command shows the local [[arp|ARP]] cache — mapping IPs to MACs — and can reveal subtle issues: stale entries pointing to decommissioned hardware, duplicate [[ip|IP]] addresses (two MACs responding for the same [[ip|IP]]), or [[arp|ARP]] poisoning attacks where a malicious device claims to be the gateway. On modern networks, [[arp|ARP]] issues are rare but devastating when they occur, often causing intermittent connectivity that is maddeningly difficult to diagnose without checking the [[arp|ARP]] table directly.'
			}
		]
	},
	{
		id: 'mobile-resilience',
		title: 'Mobile Network Resilience',
		description:
			'How transport protocols evolved to handle the reality of mobile networks — where connections drop, [[ip|IP]] addresses change, and {{bandwidth|bandwidth}} varies.',
		color: '#10B981',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP: The Reliable Foundation',
				description:
					'[[tcp|TCP]] was designed for fixed networks where connections are stable and endpoints do not move. It binds a connection to a 4-tuple: source [[ip|IP]], source port, destination [[ip|IP]], destination port. This works perfectly on desktops and servers, but on mobile devices it creates a fragile assumption — the moment your phone switches from [[wifi|Wi-Fi]] to cellular (or between cell towers), your {{ip-address|IP address}} changes, and every [[tcp|TCP]] connection silently breaks. The application must detect the failure, re-establish the [[tcp|TCP]] {{handshake|handshake}}, re-negotiate [[tls|TLS]], and re-authenticate. For a video call or file download, this means a visible interruption.',
				transition: '[[tcp|TCP]] ties connections to [[ip|IP]] addresses, making them fragile on mobile networks. What if a single connection could span multiple network interfaces simultaneously, surviving handoffs without the application even noticing?'
			},
			{
				protocolId: 'mptcp',
				title: 'MPTCP: Multiple Paths',
				description:
					'{{multipath|Multipath}} [[tcp|TCP]] extends [[tcp|TCP]] to use multiple network paths simultaneously. A phone can send data over both [[wifi|Wi-Fi]] and cellular at the same time, seamlessly shifting traffic when one path degrades. When you walk out of [[wifi|Wi-Fi]] range, [[mptcp|MPTCP]] gracefully migrates the connection to cellular without dropping a single byte — the application sees one uninterrupted [[tcp|TCP]] stream. {{apple|Apple}} has used [[mptcp|MPTCP]] in iOS since 2013 (for Siri and {{apple|Apple}} Maps) and it is enabled system-wide in iOS 17+. [[mptcp|MPTCP]] is backward-compatible: it falls back to regular [[tcp|TCP]] when the other endpoint does not support it. The trade-off is complexity — middleboxes (firewalls, NATs) sometimes strip the [[mptcp|MPTCP]] options they do not understand.',
				transition: '[[mptcp|MPTCP]] adds resilience to [[tcp|TCP]], but it inherits [[tcp|TCP]]\'s fundamental limitations: {{head-of-line-blocking|head-of-line blocking}}, ossified middleboxes, and a kernel-level implementation that is slow to deploy. A ground-up redesign built on [[udp|UDP]] avoids all of these constraints...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: Connection Migration',
				description:
					'[[quic|QUIC]] was designed from the start for mobile networks. Instead of identifying connections by [[ip|IP]] addresses and ports, [[quic|QUIC]] uses a variable-length Connection ID — a token that both endpoints recognize regardless of the underlying network path. When your phone switches from [[wifi|Wi-Fi]] to cellular, the {{ip-address|IP address}} changes but the Connection ID stays the same, so the [[quic|QUIC]] connection continues without interruption — no re-{{handshake|handshake}}, no re-authentication, no lost data. [[quic|QUIC]] also eliminates {{head-of-line-blocking|head-of-line blocking}} (a lost packet only affects its own stream, not all streams), and its {{one-rtt|1-RTT}} {{handshake|handshake}} integrates transport and {{encryption|encryption}} setup into a single round trip. {{google|Google}} reports that [[quic|QUIC]] reduces video rebuffering by 18% on mobile networks compared to [[tcp|TCP]].'
			}
		]
	},
	{
		id: 'email-journey',
		title: 'Life of an Email',
		description:
			'Follow an email from composition to reading — across [[dns|DNS]], [[smtp|SMTP]], and [[imap|IMAP]].',
		color: '#2DD4BF',
		scope: 'utilities',
		steps: [
			{
				protocolId: 'dns',
				title: 'DNS: Find the Mail Server',
				description:
					'When you send an email to user@example.com, your mail server does not just look up example.com\'s {{ip-address|IP address}} — it queries [[dns|DNS]] for MX (Mail {{exchange|Exchange}}) records, a special record type that specifies which servers accept email for that domain and their priority ordering. A domain might have multiple MX records (mx1.example.com at priority 10, mx2.example.com at priority 20) for redundancy — if the primary mail server is down, the sender automatically tries the backup. Your server also checks SPF records (which IPs are authorized to send for that domain), DKIM records (public keys for verifying message signatures), and DMARC records (the domain\'s policy for handling authentication failures). This [[dns|DNS]] step is where email security begins.',
				transition:
					'The [[dns|DNS]] lookup revealed exactly which servers accept mail for the recipient\'s domain, along with their priority ordering. Now your mail server opens a [[tcp|TCP]] connection to the highest-priority MX server and begins the [[smtp|SMTP]] dialogue to deliver the message...'
			},
			{
				protocolId: 'smtp',
				title: 'SMTP: Send the Email',
				description:
					'[[smtp|SMTP]] is one of the oldest internet protocols still in active use — its text-based command dialogue has remained remarkably stable since 1982. Your mail server connects to the recipient\'s MX server and they {{exchange|exchange}} greetings (EHLO, which also advertises supported extensions like STARTTLS and SIZE). After upgrading to an encrypted connection via STARTTLS, the envelope is defined: MAIL FROM specifies the bounce address, RCPT TO identifies the recipient(s). Then the DATA command signals that the message body follows — headers (From, To, Subject, Date, Message-ID), MIME parts (text/plain, text/html), and base64-encoded attachments, terminated by a lone period on a line. The receiving server may relay the message through additional hops (forwarding, mailing lists) before final delivery to the recipient\'s mailbox.',
				transition:
					'The email has traversed the internet and landed safely in the recipient\'s mailbox on their mail server. But it is just sitting there as a file on a remote disk — the recipient needs a way to discover it, download it, organize it into folders, and keep everything synchronized across their phone, laptop, and web client...'
			},
			{
				protocolId: 'imap',
				title: 'IMAP: Read the Email',
				description:
					'[[imap|IMAP]] (Internet Message Access Protocol) is what makes modern multi-device email possible. Unlike its predecessor POP3 (which downloads messages and optionally deletes them from the server), [[imap|IMAP]] keeps all messages on the server and synchronizes state across every connected client. When you open your email app, [[imap|IMAP]] fetches just the headers first (sender, subject, date) for a fast initial display, then downloads full message bodies on demand. Folders, flags (read, starred, deleted), and search happen server-side, so changes made on your phone instantly appear on your laptop. [[imap|IMAP]] IDLE enables push notifications — the server immediately alerts your client when a new message arrives, eliminating the need for periodic polling. This server-centric model is why Gmail, Outlook, and every modern email service can provide a consistent experience across web, desktop, and mobile.'
			}
		]
	},

	// ── Web / API (AI Protocols) ──────────────────────────────────────

	{
		id: 'ai-agent-communication',
		title: 'How AI Agents Work Together',
		description:
			'Follow an AI agent from tool discovery to multi-agent collaboration — through [[json-rpc|JSON-RPC]], [[mcp|MCP]], and [[a2a|A2A]].',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'json-rpc',
				title: 'JSON-RPC: The Wire Format',
				description:
					'Before AI protocols existed, [[json-rpc|JSON-RPC]] 2.0 was already the wire format of choice for infrastructure — Ethereum nodes, Bitcoin Core, and the Language Server Protocol in VS Code all spoke [[json-rpc|JSON-RPC]]. Its appeal was radical simplicity: send a {{json|JSON}} object with a method name, params, and an ID; get back a result or error with the same ID. No schema files, no code generation, no binary encoding. When Anthropic and {{google|Google}} independently designed their AI protocols, both chose [[json-rpc|JSON-RPC]] 2.0 as the foundation — not because it was trendy, but because it was the simplest thing that could possibly work.',
				transition: '[[json-rpc|JSON-RPC]] provides the wire framing, but it says nothing about what methods should exist, what parameters they should take, or how AI applications should discover tools. A higher-level protocol was needed to define the semantics of AI tool use...'
			},
			{
				protocolId: 'mcp',
				title: 'MCP: Connecting Agents to Tools',
				description:
					'The Model Context Protocol solves the N×M integration problem. Before [[mcp|MCP]], connecting Claude to your database required custom code — different from connecting it to GitHub, different from Slack. [[mcp|MCP]] provides a universal interface: an [[mcp|MCP]] server exposes tools (actions the LLM can invoke), resources (data it can read), and prompts (templates it can use). The three-step initialization {{handshake|handshake}} negotiates capabilities, then the AI host discovers available tools via tools/list and invokes them via tools/call. A single host can connect to dozens of [[mcp|MCP]] servers simultaneously — one for your database, one for git, one for Slack — all through the same protocol.',
				transition: '[[mcp|MCP]] beautifully connects a single agent to its tools. But what happens when the task requires multiple specialized agents — a travel agent, a research agent, a booking agent — each with their own tools and expertise? A different protocol handles that layer of coordination...'
			},
			{
				protocolId: 'a2a',
				title: 'A2A: Connecting Agents to Agents',
				description:
					'The Agent-to-Agent Protocol picks up where [[mcp|MCP]] leaves off. While [[mcp|MCP]] is vertical (agent-to-tools), [[a2a|A2A]] is horizontal (agent-to-agent). Each agent publishes an Agent Card at /.well-known/agent.{{json|json}} describing its skills and capabilities. A coordinator agent discovers specialist agents, delegates tasks via message/send, and receives structured results as Artifacts. Tasks have a full lifecycle — submitted, working, input-required, completed — with [[sse|SSE]] streaming for real-time progress. The key design insight is {{opacity|opacity}}: you don\'t see another agent\'s internal reasoning or tool usage, only its skills and outputs. This allows agents from different vendors, built with different frameworks, to collaborate seamlessly.',
				transition: 'In a production system, [[a2a|A2A]] and [[mcp|MCP]] work together. The coordinator uses [[a2a|A2A]] to delegate to a specialist, and that specialist uses [[mcp|MCP]] internally to access its tools. But both protocols rely on the same real-time streaming mechanism to deliver incremental results...'
			},
			{
				protocolId: 'sse',
				title: 'SSE: Streaming AI Responses',
				description:
					'[[sse|Server-Sent Events]] tie everything together at the transport level. When an [[mcp|MCP]] tool takes time to produce results, the server upgrades its [[http1|HTTP]] response to an [[sse|SSE]] stream, pushing progress {{notification|notifications}} and partial results as events. When an [[a2a|A2A]] agent works on a long task, it streams TaskStatusUpdate and TaskArtifactUpdate events via [[sse|SSE]]. Even the token-by-token streaming you see in chat interfaces is [[sse|SSE]] under the hood. The EventSource API\'s auto-reconnection means that if the connection drops mid-stream, the client reconnects and resumes from the last event ID — no data lost, no user intervention needed.'
			}
		]
	},
	{
		id: 'api-evolution',
		title: 'From REST to AI Protocols',
		description: 'The evolution of web APIs — from resource-oriented [[rest|REST]] to AI-native protocols.',
		color: '#00D4FF',
		scope: 'global',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: The Foundation',
				description:
					'[[pioneer:roy-fielding|Roy Fielding]]\'s 2000 dissertation defined [[rest|REST]] as an architectural style: use [[http1|HTTP]] verbs for operations, URLs for resources, and make everything {{stateless|stateless}}. [[rest|REST]] dominated the API landscape for two decades because of its simplicity — any language with an [[http1|HTTP]] client could call a [[rest|REST]] API. But [[rest|REST]] was designed for human developers building web applications, not for AI systems that need to dynamically discover and invoke capabilities. Over-fetching, under-fetching, and the lack of machine-readable schemas were annoyances for developers but blockers for autonomous agents.',
				transition: '[[rest|REST]] served the web brilliantly for human-to-machine communication. But as systems grew more complex, developers needed richer patterns — typed contracts, efficient {{serialization|serialization}}, and flexible data fetching...'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Typed, Efficient RPC',
				description:
					'{{google|Google}}\'s internal RPC system, Stubby, handled billions of requests per day. When they open-sourced it as [[grpc|gRPC]] in 2015, it brought {{protocol-buffers|protocol buffers}} (binary {{serialization|serialization}} 3-10x smaller than {{json|JSON}}), [[http2|HTTP/2]] {{multiplexing|multiplexing}}, and streaming to the developer community. For the first time, API contracts were machine-enforced at compile time via .proto files. The tradeoff was complexity — code generation, [[http2|HTTP/2]] requirements, and binary payloads that couldn\'t be debugged with curl. But for service-to-service communication at scale, [[grpc|gRPC]] was a revelation.',
				transition: '[[grpc|gRPC]] optimized for machine-to-machine efficiency, but it required schema compilation and couldn\'t easily serve browser clients. What if there was something in between — human-readable like [[rest|REST]] but with typed schemas and flexible querying?'
			},
			{
				protocolId: 'json-rpc',
				title: 'JSON-RPC: The Minimal Wire Format',
				description:
					'While [[rest|REST]] and [[grpc|gRPC]] dominated mainstream APIs, a quieter revolution was happening in infrastructure. [[json-rpc|JSON-RPC]] 2.0 — a one-page spec for calling methods by name over {{json|JSON}} — became the backbone of Ethereum\'s blockchain API, Bitcoin Core, and {{microsoft|Microsoft}}\'s Language Server Protocol. Its appeal was radical simplicity: no URL routing, no [[http1|HTTP]] verb semantics, no schema compilation. Just a method name, params, and an ID. The spec was so simple and transport-agnostic ([[http1|HTTP]], [[websockets|WebSocket]], stdio, [[tcp|TCP]]) that it became the natural foundation for the next generation of protocols.',
				transition: '[[json-rpc|JSON-RPC]] proved that method-oriented RPC over {{json|JSON}} was powerful enough for critical infrastructure. When the AI revolution demanded new protocols for tool use and agent collaboration, [[json-rpc|JSON-RPC]] was the obvious wire format...'
			},
			{
				protocolId: 'mcp',
				title: 'MCP: AI-Native Tool Access',
				description:
					'In November 2024, Anthropic released the Model Context Protocol — the first protocol designed specifically for AI applications. Built on [[json-rpc|JSON-RPC]] 2.0, [[mcp|MCP]] provides dynamic tool discovery (tools/list returns {{json|JSON}} Schema definitions that LLMs can understand), resource access (files, database rows, API responses), and prompt templates. The key insight was that AI applications don\'t just need APIs — they need self-describing APIs that an LLM can discover, understand, and invoke autonomously. Within a year, Claude, ChatGPT, Copilot, Cursor, and VS Code all spoke [[mcp|MCP]], with over 10,000 [[mcp|MCP]] servers in production.',
				transition: '[[mcp|MCP]] connected AI agents to tools, solving the integration problem. But the next challenge was bigger: how do you get multiple AI agents — potentially from different vendors, built with different frameworks — to collaborate on complex tasks?'
			},
			{
				protocolId: 'a2a',
				title: 'A2A: AI-Native Agent Collaboration',
				description:
					'{{google|Google}}\'s Agent-to-Agent Protocol, announced in April 2025, completed the picture. Where [[mcp|MCP]] connects agents to tools, [[a2a|A2A]] connects agents to each other. An agent publishes its skills in an Agent Card, and other agents discover it, delegate tasks, and receive structured results — all without knowing anything about the internal implementation. The task lifecycle (submitted → working → completed) with [[sse|SSE]] streaming provides the coordination primitives that multi-agent systems need. Together, [[mcp|MCP]] and [[a2a|A2A]] form the two-protocol foundation of the agentic AI era — donated to the {{linux|Linux}} Foundation as open industry standards.'
			}
		]
	},

	// ── Wireless ───────────────────────────────────────────────────────
	{
		id: 'wireless-tap-to-pay',
		title: 'Tap to Pay — what happens in the 300 ms after you touch the terminal',
		description:
			'A contactless EMV payment is the most-deployed cryptographic protocol on Earth. Follow a tap from antenna power-on to issuer approval — through [[nfc|NFC]], EMV, the eSE, and back through the [[cellular|cellular]] network to the bank.',
		color: '#FBBF24',
		scope: 'wireless',
		steps: [
			{
				protocolId: 'nfc',
				title: 'Field on — phone harvests power inductively',
				description:
					"The terminal's antenna is radiating a 13.56 MHz magnetic field continuously. When you bring your phone within ~4 cm, the phone's [[nfc|NFC]] controller and {{ese|embedded Secure Element}} harvest microwatts directly from the field — no battery contribution needed on the SE side. This is the {{inductive-coupling|inductive coupling}} that makes [[nfc|NFC]] work: magnetic field falls off as 1/r³, which is exactly why 10 cm is a feature, not a bug. The biometric release (Face ID / Touch ID) had to happen *before* this point — the eSE applet is now armed and waiting.",
				transition: 'The phone is powered and the terminal needs to discover what kind of card is in the field. ISO 14443-3 defines a tight anti-collision sequence — REQA / ATQA / SEL / SAK — that completes in under 20 ms...'
			},
			{
				protocolId: 'nfc',
				title: 'Anti-collision + RATS/ATS — negotiate framing',
				description:
					"The terminal sends a 7-bit `0x26` REQA. The eSE replies with **ATQA** declaring a 4-byte UID and standard anti-collision. The terminal then runs the bit-frame anti-collision loop (`SEL=0x93`, `NVB=0x20` → UID → `NVB=0x70`) to converge on the {{frame|frame}} UID, ending in **SAK** = `0x28` — bit 6 set means *I speak ISO 14443-4*. The terminal sends **RATS**, the eSE replies with **ATS** declaring its frame-size budget (FSCI=5 = 64 bytes max). Both ends now know how to {{packet|packet}}ise the EMV {{exchange|exchange}}.",
				transition: "With 14443-4 framing established, the terminal switches into ISO 7816-4 {{apdu|APDU}} mode and asks the canonical EMV opening question: *which payment networks do you support?*"
			},
			{
				protocolId: 'nfc',
				title: 'SELECT PPSE → SELECT AID — enumerate payment apps',
				description:
					"The terminal sends `00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31` — SELECT **{{ppse|PPSE}}** (Proximity Payment System Environment, the magic {{aid|AID}} `2PAY.SYS.DDF01`). The eSE returns an FCI Template listing every payment {{aid|AID}} it supports in priority order — Mastercard `A0000000041010`, Visa `A0000000031010`, etc. The terminal picks the highest-priority one and SELECTs it; the card returns its **PDOL** — the list of EMV tags the card needs filled in to compute the cryptogram (amount, currency, country, terminal type, Unpredictable Number).",
				transition: 'The card now knows what payment network it is on; the terminal knows what data the card wants. Time to bind the transaction: amount, currency, a fresh random {{nonce|nonce}}.'
			},
			{
				protocolId: 'nfc',
				title: 'GENERATE AC — the cryptogram',
				description:
					"After GET PROCESSING OPTIONS (returning AIP+AFL) and READ RECORD ×N (pulling the **DPAN**, expiry, {{certificate-chain|certificate chain}}), the terminal sends `80 AE 80 00` GENERATE AC with the filled CDOL1 data. The eSE composes the inputs (amount, currency, country, TVR, ATC, Unpredictable Number, AIP) and runs them through AES-MAC under the per-DPAN key, producing the **{{emv-cryptogram|Application Cryptogram (ARQC)}}**. The {{anti-replay|ATC}} (Application Transaction Counter) has already incremented by 1; the cryptogram is unforgeable without the eSE key.",
				transition: "The cryptogram is now in the terminal's hand. But the eSE has no online connection — it can't authorise the transaction itself. The terminal needs to send the ARQC to the issuer bank, which is somewhere on the other end of the carrier network..."
			},
			{
				protocolId: 'cellular',
				title: 'Backhaul over LTE / 5G to the acquirer',
				description:
					"Modern wireless POS terminals (Square, Stripe, Verifone Engage) send the ARQC to the acquirer over [[cellular|cellular]] data — LTE Cat-1 or 5G in 2026. The terminal opens a [[tls|TLS]] connection to the acquirer's API endpoint, posts a {{json|JSON}} body containing the cryptogram + transaction details. The carrier core wraps the [[ip|IP]] traffic in **{{gtp-u|GTP-U}} over [[ipsec|IPsec ESP]]** between the gNB and UPF — per {{3gpp|3GPP}} TS 33.501, every backhaul {{hop|hop}} is IPsec-wrapped. The single largest enterprise [[ipsec|IPsec]] deployment on Earth lives inside this layer.",
				transition: "The cryptogram reaches the acquirer; the acquirer routes it through the payment network (Mastercard / Visa) to the issuing bank's HSM..."
			},
			{
				protocolId: 'tls',
				title: 'Issuer verification + ARPC return',
				description:
					"The **issuer bank's HSM** decrypts the cryptogram inputs using the per-DPAN key it minted at tokenisation time, re-derives the ARQC, and compares. Match + sufficient balance + no fraud flag = **APPROVED**. The issuer returns an **ARPC** (Authorisation Response Cryptogram) over its own [[tls|TLS]]-protected connection back through the payment network to the acquirer, then back over [[cellular|cellular]] to the terminal. Total time including the round-trip: typically **300–800 ms**. The terminal beeps green; the phone vibrates with the {{apple|Apple}} Pay success animation. Total [[nfc|NFC]] {{airtime|airtime}} in the field was less than half a second — but the cryptographic chain stretched from the eSE through [[ipsec|IPsec]], cellular, [[tls|TLS]], and back."
			}
		]
	},

	{
		id: 'wireless-phone-as-key',
		title: 'A phone unlocks a car — BLE bootstrap → UWB ranging → unlock',
		description:
			'The 2022 Tesla BLE relay made it clear that {{rssi|RSSI}} proximity is fundamentally broken. {{ccc-digital-key|CCC Digital Key}} 3.0 is the industry response: [[bluetooth|BLE]] for discovery and credential {{exchange|exchange}}, [[uwb|UWB]] for the cryptographic distance bound that the speed of light cannot lie about.',
		color: '#FBBF24',
		scope: 'wireless',
		steps: [
			{
				protocolId: 'bluetooth',
				title: 'BLE advertising — the car says hello on ch 37/38/39',
				description:
					"The car's BLE radio broadcasts `ADV_IND` on advertising channels 37 (2402 MHz), 38 (2426 MHz), and 39 (2480 MHz) every 100 ms or so — three channels carefully chosen to avoid [[wifi|Wi-Fi]]'s 1/6/11. The advert carries the {{ccc-digital-key|CCC Digital Key}} service UUID and an ephemeral identifier. Your iPhone (or Galaxy, or Android phone with {{aliro|Aliro}}) scans those channels continuously. When the phone sees the car's UUID, it sends `CONNECT_IND` — switching both radios from advertising channels to one of the 37 data channels — and the BLE link is up.",
				transition: 'BLE is now connected, but BLE alone proved insecure in 2022 — Sultan Qasim Khan unlocked a parked Tesla from 25 m using $50 of dev boards by relaying the BLE signals. {{ccc-digital-key|CCC Digital Key}} 3.0 fixes this with a layered cryptographic + physical defence...'
			},
			{
				protocolId: 'bluetooth',
				title: 'GATT pairing + SPAKE2+ authentication',
				description:
					"Over the BLE encrypted channel, the car and the phone run **SPAKE2+ / PAKE** authentication — the car proves it has the right vehicle key, the phone proves it has the right Digital Key applet in its {{ese|embedded Secure Element}}. {{apdu|APDUs}} flow over {{gatt|GATT}} carrying the EMV-style {{certificate-chain|certificate chain}}. Both sides now share session keys. The next critical message: the car sends the phone the **STS_KEY** — a 128-bit AES key for the upcoming [[uwb|UWB]] ranging session — over the now-encrypted BLE channel. UWB has no power-efficient discovery of its own; BLE provides the on-ramp.",
				transition: 'The phone has the STS_KEY. The car has the STS_KEY. Both fire up their [[uwb|UWB]] radios for the ranging round that proves *the phone is actually here*, not relayed from across the parking lot...'
			},
			{
				protocolId: 'uwb',
				title: 'UWB DS-TWR — three messages, six timestamps, cm-class distance',
				description:
					"The phone transmits a **Poll** RFRAME on [[uwb|UWB]] Channel 9 (7987.2 MHz, 499.2 MHz {{bandwidth|bandwidth}}, BPRF mode, 6.81 Mbps). The frame carries a 32-chip **{{sts|STS}}** (Scrambled Timestamp Sequence) generated by `AES-128-CTR(STS_KEY, {{nonce|nonce}})` — the AES-keyed pulse pattern an attacker without STS_KEY cannot predict. The phone records `t1 = TX timestamp` at the SFD with ~15 ps resolution. The car (multiple anchors typically) RX-timestamps at t2, delays by `T_reply1` (~200 µs), transmits **Response** carrying t2 + t3. Phone records t4 = RX. Phone delays by T_reply2, transmits **Final** carrying t1, t4, t5. Car records t6 = RX. All six timestamps now exist.",
				transition: 'The car can now compute {{tof-ranging|time-of-flight}}. The cross-product formula cancels relative clock drift to first order — DS-TWR is insensitive to 20 ppm crystal offsets. Multiply ToF by the speed of light and you have distance...'
			},
			{
				protocolId: 'uwb',
				title: 'Distance check — and the unlock decision',
				description:
					"Using the **{{twr|DS-TWR}} cross-product** `ToF = (T_round1·T_round2 − T_reply1·T_reply2) / (T_round1+T_round2+T_reply1+T_reply2)`, the car computes {{tof-ranging|time-of-flight}} to 1 ns precision — about 30 cm. Multiple anchors give an x/y/z position around the car. If `distance ≤ threshold` *and* the BLE credential is valid *and* the STS validation passed (no Ghost Peak-style injection detected), the car unlocks the side you're approaching, lights the welcome animation, and adjusts your seat. The key property: **{{tof-ranging|time-of-flight}} cannot be shortened by a relay** — the speed of light is the hard upper bound. The 2022 BLE relay attack does not work against [[uwb|UWB]] ranging. [[nfc|NFC]] remains the fallback for when your phone's battery is dead."
			}
		]
	},

	{
		id: 'wireless-hue-bulb',
		title: 'A Hue bulb joins the mesh — Zigbee commissioning in 4 messages',
		description:
			'You unbox a new Philips Hue bulb, plug it in, and the Hue app on your phone walks it through Zigbee {{trust-center|Trust Center}} commissioning. Behind that simple UX is a four-message join sequence with one critical secret transfer.',
		color: '#FBBF24',
		scope: 'wireless',
		steps: [
			{
				protocolId: 'zigbee',
				title: 'Beacon Request — joiner asks "any networks?"',
				description:
					"The new bulb powers on, has no parent yet, and broadcasts an {{ieee-802-15-4|IEEE 802.15.4}} MAC Command `0x07` (**Beacon Request**) on its channel — picked from {15, 20, 25, 26} to dodge [[wifi|Wi-Fi]] 1/6/11 at 2412/2437/2462 MHz. Every Zigbee router with permit-joining enabled responds with a **Beacon**: the PAN ID, the Coordinator's short address (0x0000), the Stack Profile (Zigbee PRO), and the Permit-Joining flag. The joiner picks the best parent by {{rssi|RSSI}} + LQI. This is the slowest step — beacon scanning can take 2–4 seconds across all candidate channels.",
				transition: 'The bulb has picked a parent. Now it needs a short address — a 16-bit local identifier much cheaper than its 64-bit EUI-64 on every frame for the rest of its life on this network...'
			},
			{
				protocolId: 'zigbee',
				title: 'Association Request + Response — get a short address',
				description:
					"The bulb sends MAC Command `0x01` (**Association Request**) with its Capability byte (`0x8E` = FFD, mains-powered, security-capable, allocate-short). The Coordinator allocates a unique 16-bit short address (e.g. `0x3F4E`) and replies with MAC Command `0x02` (**Association Response**). The bulb is now associated with the network at the MAC layer — but it doesn't have the **network key** yet, which means it can't decrypt or {{encryption|encrypt}} any actual Zigbee frames. The critical security step is next.",
				transition: 'Without the network key the bulb is useless. The Coordinator (acting as {{trust-center|Trust Center}}) needs to securely deliver it — and how it does that is the single most important security decision in the whole Zigbee architecture...'
			},
			{
				protocolId: 'zigbee',
				title: 'APS Transport-Key — the network key, encrypted at the application layer',
				description:
					"The Coordinator sends an **APS Transport-Key** command (cmd `0x05`) containing the 128-bit AES network key, **{{encryption|encrypted}} under the joiner's pre-configured link key**. With a per-device {{install-code|install code}} (printed on the Hue bulb's box as a QR code), that link key is unique and an eavesdropper at join cannot decrypt this frame. With the default *ZigBeeAlliance09* link key (universally known: `5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39`), an eavesdropper *can* — this is the canonical Zigbee sniffer-at-join attack. Zigbee R23's **{{dynamic-link-key|Dynamic Link Key}}** with SPEKE-over-Curve25519 removes the question entirely.",
				transition: "The bulb now has both a short address and the network key. It can encrypt frames and join the mesh as a router for its neighbours. Time to announce its arrival..."
			},
			{
				protocolId: 'zigbee',
				title: 'Device Announce + first ZCL command',
				description:
					"The bulb NWK-broadcasts a **Device Announce** ZDO message (cluster `0x0013`): *I am 0x3F4E, EUI-64 = …, capability = mains-powered router*. Every router on the mesh adds the new bulb to its {{routing-table|routing}} and binding tables. The Hue app now appears to discover the bulb. Tapping the on/off toggle sends a single **{{zcl|ZCL}} OnOff.Toggle** command — APS profile `0x0104` (Home Automation), cluster `0x0006` (OnOff), command `0x02` (Toggle). The whole on-the-wire {{payload|payload}}, including all 802.15.4 + NWK + APS + ZCL {{header|headers}} + AES-CCM* MIC, fits in ~40 bytes. The bulb turns on. From boot to first command: ~4 seconds."
			}
		]
	}
];

const journeyMap = new Map(journeys.map((j) => [j.id, j]));

export function getJourneysByScope(scope: string): Journey[] {
	return journeys.filter((j) => j.scope === scope);
}

export function getJourneyById(id: string): Journey | undefined {
	return journeyMap.get(id);
}
