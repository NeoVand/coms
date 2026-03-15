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
			'Follow a request from your browser to a server and back — through DNS, TCP, TLS, and HTTP.',
		color: '#00D4FF',
		scope: 'global',
		steps: [
			{
				protocolId: 'dns',
				title: 'DNS Resolution',
				description:
					'Before your browser can reach google.com, it needs an actual address — like needing a street address before you can mail a letter. Your device sends a DNS query to a recursive resolver, which walks the DNS hierarchy: root servers, then .com TLD servers, then google.com\'s authoritative nameserver. The answer (e.g., 142.250.80.46) is cached locally so future requests skip this entire chain. Without DNS, you would have to memorize raw IP addresses for every website you visit.',
				transition: 'The browser now knows WHERE the server lives — but packets on the internet can be lost, reordered, or duplicated. Before sending any real data, it needs to negotiate a reliable channel...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP Handshake',
				description:
					'The internet is inherently unreliable — packets can vanish, arrive out of order, or show up twice. TCP solves this with a three-way handshake (SYN, SYN-ACK, ACK) that synchronizes sequence numbers between your browser and the server, creating a reliable ordered channel. This handshake also negotiates window sizes for flow control, ensuring neither side overwhelms the other. It costs one round trip of latency, but without it every application would need to implement its own reliability logic.',
				transition: 'A reliable pipe now connects your browser to the server — but anyone sitting on the network path (your ISP, a coffee shop router, a government firewall) can read every byte in plaintext. The data needs encryption...'
			},
			{
				protocolId: 'tls',
				title: 'TLS Negotiation',
				description:
					'TLS is where trust is established. The server presents a certificate proving it really is google.com (signed by a trusted certificate authority), and both sides negotiate which cipher suite to use. They then perform a key exchange (typically ECDHE) to derive shared session keys that only they know — even if someone recorded the entire handshake. TLS 1.3 collapses this to a single round trip, and on repeat visits, 0-RTT resumption can send encrypted data immediately.',
				transition: 'The connection is now both reliable and encrypted — no eavesdropper can read or tamper with the data. Everything is ready to speak the language of the web...'
			},
			{
				protocolId: 'http1',
				title: 'HTTP Request & Response',
				description:
					'With the secure channel established, the browser finally speaks HTTP. It sends a GET request with headers describing what it accepts (content types, encodings, languages) and any cookies for the domain. The server processes the request and responds with a status code (200 OK), response headers (caching rules, content type), and the HTML document body. This single request-response cycle is the fundamental unit of the web — and a modern page will trigger hundreds more for CSS, JavaScript, images, and fonts.'
			}
		]
	},
	{
		id: 'wire-to-web',
		title: 'From Wire to Web',
		description:
			'Trace data from the physical Ethernet cable through every layer of the network stack up to the application.',
		color: '#F472B6',
		scope: 'global',
		steps: [
			{
				protocolId: 'ethernet',
				title: 'Ethernet Frame',
				description:
					'Every piece of data on a local network travels as an Ethernet frame — a precisely structured envelope containing source and destination MAC addresses (48-bit hardware identifiers burned into every network card), a type field that indicates what protocol lives inside (IPv4, IPv6, ARP), and a Frame Check Sequence for error detection. The frame is the physical currency of LANs: switches read the destination MAC to forward it to the correct port. Without this framing, raw electrical signals on the wire would be meaningless noise.',
				transition: 'The Ethernet frame needs a destination MAC address — but your application only knows an IP address. Something has to bridge the gap between Layer 3 (IP) and Layer 2 (Ethernet)...'
			},
			{
				protocolId: 'arp',
				title: 'ARP Resolution',
				description:
					'ARP is the glue between IP addresses and physical hardware. When your machine needs to reach 192.168.1.1 but only knows its IP, it broadcasts an ARP request to every device on the LAN: "Who has 192.168.1.1? Tell me your MAC address." The target replies directly with its MAC, and the result is cached in an ARP table so future packets skip the broadcast. This is why the first packet to a new host on your LAN is slightly slower — ARP has to resolve the address first.',
				transition: 'With the destination MAC resolved and the Ethernet frame ready, the packet can now be addressed for its journey beyond the local network. The IP layer takes over to handle global addressing and routing...'
			},
			{
				protocolId: 'ip',
				title: 'IP Routing',
				description:
					'IP is the postal service of the internet — it stamps each packet with a source and destination address, then forwards it hop by hop toward its target. Each router along the path examines the destination IP, consults its routing table, decrements the TTL (Time To Live) by one, and forwards the packet to the next hop. If TTL reaches zero, the packet is discarded and an ICMP "Time Exceeded" is sent back — this is how traceroute works. IP makes no guarantees about delivery order or reliability; it simply does its best to get each packet to the right machine.',
				transition: 'IP delivered the packet to the correct machine — but a server might be running dozens of applications simultaneously. A web server on port 80, an SSH daemon on port 22, a database on port 5432. Something has to deliver the data to the right process...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP Delivery',
				description:
					'TCP is the reliability layer that IP lacks. It uses 16-bit port numbers (0-65535) to multiplex multiple conversations on the same IP address, delivering each segment to the correct application. Beyond addressing, TCP guarantees that data arrives complete, in order, and without duplication — it retransmits lost segments, resequences out-of-order arrivals, and uses sliding window flow control to prevent a fast sender from overwhelming a slow receiver. This reliability is why the web, email, and file transfer all run on TCP.',
				transition: 'The data has been reliably delivered to the correct process on the correct machine. Now the application can finally interpret the bytes using its own protocol semantics...'
			},
			{
				protocolId: 'http1',
				title: 'HTTP Application',
				description:
					'At the very top of the stack, HTTP gives meaning to the raw bytes. It defines a structured conversation: the client sends a request with a method (GET, POST, PUT), a path (/index.html), and headers describing its capabilities. The server responds with a status code (200 OK, 404 Not Found), its own headers (content type, caching directives), and the actual content — HTML, JSON, images. This is the layer that developers interact with directly, but it only works because every layer below carried the data faithfully.'
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
					'UDP is the bare minimum of transport — it adds just 8 bytes of overhead (source port, destination port, length, checksum) and fires your data into the network with no handshake, no acknowledgments, and no ordering guarantees. This makes it blazing fast and perfect for scenarios where speed matters more than perfection: DNS queries, live video, gaming, and voice calls. If a packet is lost, the application decides whether to care — a missing video frame is better than waiting 200ms for a retransmission that arrives too late to display.',
				transition: 'UDP gives you raw speed, but many applications cannot tolerate missing or reordered data. A web page with a missing CSS file, a bank transfer with lost bytes, or a file download with gaps — these need every byte in the right order. The internet needed a more disciplined transport...'
			},
			{
				protocolId: 'tcp',
				title: 'TCP: Reliable Streams',
				description:
					'TCP transforms the unreliable internet into a dependable byte stream. It establishes connections with a three-way handshake, assigns sequence numbers to every byte, requires acknowledgments for received data, and retransmits anything that goes missing. Its congestion control algorithms (Reno, CUBIC, BBR) actively probe the network to find the maximum safe sending rate without causing collapse. TCP has been the backbone of the internet for over 40 years — HTTP, email, SSH, and file transfer all depend on it. The tradeoff is latency: the handshake, acknowledgment delays, and head-of-line blocking (one lost packet stalls everything behind it) add up.',
				transition: 'TCP proved that reliability works, but its single-stream design means one lost packet blocks all data behind it — even unrelated requests. And its handshake adds a full round trip before any data flows. Engineers began asking: can we keep the reliability but eliminate these bottlenecks?'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Modern Fusion',
				description:
					'QUIC is what happens when you redesign transport from scratch with modern needs in mind. It runs on top of UDP (so it passes through existing firewalls and NATs), but implements its own reliability, ordering, and congestion control internally. Crucially, QUIC supports multiplexed independent streams — so a lost packet on stream 3 does not block streams 1, 2, or 4. It also bakes in TLS 1.3 encryption from the start, merging the transport and security handshakes into a single round trip. On repeat connections, 0-RTT resumption lets you send data immediately. QUIC powers HTTP/3 and is rapidly becoming the new default transport for the web.',
				transition: 'QUIC solves head-of-line blocking and connection setup latency brilliantly, but it assumes a single network path. What happens when a device has multiple network interfaces — WiFi and cellular, two Ethernet ports, or a wired and wireless backup link? There is a transport designed for exactly that scenario...'
			},
			{
				protocolId: 'sctp',
				title: 'SCTP: Multi-Stream Transport',
				description:
					'SCTP (Stream Control Transmission Protocol) introduced two ideas ahead of their time: multiple independent message streams within a single association, and multi-homing — the ability to bind to multiple IP addresses simultaneously and fail over between them without dropping the connection. If one network interface goes down, SCTP seamlessly switches to another. Originally designed for telecom signaling (carrying phone call setup messages between switches), it also supports message boundaries natively (unlike TCP\'s raw byte stream). While SCTP never gained widespread web adoption due to NAT traversal issues, its concepts directly influenced QUIC\'s stream multiplexing design.'
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
					'In the early internet, everything traveled in plaintext — passwords, credit cards, personal emails, all visible to anyone on the network path. TLS changed everything by wrapping TCP connections in encryption. During the handshake, the server proves its identity with a certificate signed by a trusted authority, both sides agree on cipher suites, and an ephemeral key exchange (ECDHE) creates shared session keys that even a passive observer who recorded every byte cannot derive. TLS 1.3 stripped out legacy cruft, removing insecure algorithms and reducing the handshake to a single round trip. Today, over 95% of web traffic runs through TLS.',
				transition: 'TLS secures client-to-server connections beautifully, but system administrators need more than encrypted web traffic — they need to log into remote servers, transfer files, and tunnel network connections, all securely. A different protocol emerged for this exact purpose...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Secure Shell',
				description:
					'Before SSH, administrators used Telnet to manage remote servers — sending passwords and commands in cleartext. SSH replaced it with a fully encrypted channel that supports public-key authentication (no passwords to steal), secure file transfer (SCP and SFTP), and port forwarding that can tunnel any TCP connection through the encrypted link. SSH uses its own key exchange and encryption layer independent of TLS, and its agent forwarding feature lets you chain SSH connections through jump hosts without exposing your private key. It became the universal tool for server management, Git operations, and secure automation.',
				transition: 'With TLS protecting web connections and SSH securing server access, the foundations of internet security were in place. But there was still a problem: HTTP encryption was optional, and most sites did not bother. The web needed a forcing function to make encryption the default, not the exception...'
			},
			{
				protocolId: 'http2',
				title: 'HTTPS Everywhere',
				description:
					'HTTP/2 was the tipping point. While the specification technically allows plaintext HTTP/2, every major browser only implements it over TLS — making encryption a de facto requirement for the modern web. Combined with free certificate authorities like Let\'s Encrypt and browser warnings on HTTP sites ("Not Secure"), the web went from roughly 40% encrypted in 2015 to over 95% today. HTTP/2 also introduced binary framing, multiplexed streams, and HPACK header compression, but its most lasting impact may be normalizing the idea that all web traffic should be encrypted by default.'
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
					'Every packet\'s journey begins at the network interface card (NIC), which constructs an Ethernet frame. The NIC stamps on its own 48-bit MAC address as the source, adds the destination MAC, a type field (0x0800 for IPv4, 0x0806 for ARP), the payload, and a 4-byte Frame Check Sequence (CRC-32) that lets the receiver detect bit errors caused by electrical interference. If any bits are corrupted in transit, the FCS check fails and the frame is silently discarded — no correction, just detection. This is the foundation of all local network communication.',
				transition: 'The Ethernet frame is ready to send, but there is a chicken-and-egg problem: your application knows the destination IP address (192.168.1.100), not the destination MAC address. You cannot build an Ethernet frame without a MAC. The network needs a way to translate between these two addressing systems...'
			},
			{
				protocolId: 'arp',
				title: 'ARP Resolution',
				description:
					'ARP solves the IP-to-MAC translation with an elegant broadcast mechanism. Your machine sends an ARP request to the broadcast address (FF:FF:FF:FF:FF:FF) asking "Who has 192.168.1.100? Tell 192.168.1.1." Every device on the LAN segment hears this, but only the owner of that IP replies with its MAC address. The mapping is cached in your ARP table (typically for 20 minutes) so subsequent packets skip the broadcast entirely. You can see your own ARP cache by running "arp -a" in a terminal. ARP spoofing — where an attacker sends fake ARP replies to redirect traffic — is why network security often relies on higher-layer encryption.',
				transition: 'With the destination MAC resolved, the Ethernet frame can be properly addressed for the local segment. Now the IP layer needs to make a critical decision: is this packet destined for a machine on the same local network, or does it need to be forwarded to the default gateway for routing across the internet?'
			},
			{
				protocolId: 'ip',
				title: 'IP Addressing & Routing',
				description:
					'The IP layer makes the key routing decision. It compares the destination IP against the subnet mask to determine if the target is local or remote. If local, ARP resolves the target\'s MAC directly. If remote, the packet is sent to the default gateway (your router), which consults its routing table and forwards it toward the destination, hop by hop. Each router decrements the TTL (Time To Live, typically starting at 64) by one — when it reaches zero, the packet is discarded to prevent infinite routing loops. The IP header also includes a header checksum, protocol field (6 for TCP, 17 for UDP), and fragmentation controls for packets that exceed a link\'s MTU.',
				transition: 'The packet has been delivered successfully — but networks are not always healthy. Links go down, routes change, hosts become unreachable, and packets get dropped. How does a network administrator diagnose problems and verify that everything is working correctly?'
			},
			{
				protocolId: 'icmp',
				title: 'ICMP Diagnostics',
				description:
					'ICMP is the internet\'s diagnostic nervous system — it does not carry user data but instead reports on the health and status of the network itself. The "ping" command sends ICMP Echo Requests and measures round-trip times to verify reachability. "Traceroute" cleverly sends packets with incrementing TTL values (1, 2, 3...), causing each successive router to reply with a "Time Exceeded" message, mapping the entire path to a destination. ICMP also carries critical error messages: "Destination Unreachable" (with subcodes for network, host, port, and fragmentation failures), "Redirect" (telling a host to use a better route), and "Source Quench" (legacy congestion signaling). Without ICMP, debugging network problems would be nearly impossible.'
			}
		]
	},
	{
		id: 'internet-routes',
		title: 'How the Internet Routes',
		description:
			'From local IP addressing to global routing — how packets find their way across the internet.',
		color: '#F472B6',
		scope: 'network-foundations',
		steps: [
			{
				protocolId: 'ip',
				title: 'IPv4: The Original Addressing',
				description:
					'IPv4, designed in 1981, gives every device a 32-bit address (like 192.168.1.1) and defines how packets are forwarded hop-by-hop through routers. It was brilliantly simple and powered the explosive growth of the internet — but its designers never imagined billions of smartphones, IoT sensors, and cloud instances. With only 4.3 billion possible addresses, IPv4 exhaustion became inevitable. NAT (Network Address Translation) bought time by hiding entire private networks behind a single public IP, but it breaks end-to-end connectivity and complicates protocols that embed IP addresses in their payloads.',
				transition: 'IANA allocated the last IPv4 address blocks in 2011. The stopgap of NAT created a fragile internet where devices could not directly reach each other. A fundamental redesign had been in the works since the 1990s, and the world is finally adopting it...'
			},
			{
				protocolId: 'ipv6',
				title: 'IPv6: The Next Generation',
				description:
					'IPv6 expands the address space from 32 bits to 128 bits — enough for 340 undecillion addresses (3.4 x 10^38), roughly 100 addresses per atom on Earth\'s surface. But IPv6 is not just bigger addresses: it simplifies the packet header (no more header checksums or fragmentation at intermediate routers), introduces SLAAC (Stateless Address Auto-Configuration) so devices can generate their own addresses without DHCP, and replaces ARP with NDP (Neighbor Discovery Protocol). Most importantly, it restores true end-to-end connectivity — every device gets a globally routable address, eliminating the need for NAT. The dual-stack transition (running IPv4 and IPv6 simultaneously) is well underway, with major networks now carrying ~45% IPv6 traffic.',
				transition: 'Individual devices now have addresses, but the internet is composed of over 70,000 autonomous systems (AS) — independent networks run by ISPs, cloud providers, universities, and enterprises. These networks need a way to discover each other and calculate paths across this vast interconnected mesh...'
			},
			{
				protocolId: 'bgp',
				title: 'BGP: The Internet\'s Routing Protocol',
				description:
					'BGP (Border Gateway Protocol) is the protocol that literally holds the internet together. Each autonomous system uses BGP to announce which IP prefixes it owns and which paths it can reach. BGP routers at network borders exchange these announcements with their peers, building a global map of reachability. Path selection is policy-driven — an ISP might prefer cheaper transit providers, avoid routes through certain countries, or favor shorter AS paths. When a BGP misconfiguration happens (like Pakistan accidentally hijacking YouTube\'s prefix in 2008), large portions of the internet can go dark. Despite carrying the routing table for the entire internet (nearly 1 million IPv4 prefixes), BGP runs on surprisingly modest hardware and converges within minutes after topology changes.'
			}
		]
	},

	// ── Transport ──────────────────────────────────────────────────────
	{
		id: 'reliable-delivery',
		title: 'Evolution of Reliable Delivery',
		description:
			'How transport protocols evolved from TCP to modern multipath and multiplexed solutions.',
		color: '#39FF14',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP: The Original',
				description:
					'TCP has been the workhorse of reliable internet communication since 1981 — it guarantees that every byte arrives, in order, without duplication. Underneath, it uses sequence numbers, acknowledgments, retransmission timers, and sophisticated congestion control (algorithms like Reno, CUBIC, and BBR that probe the network to find the optimal sending rate). But TCP has a fundamental limitation: it provides a single ordered byte stream. When HTTP/2 multiplexes dozens of requests over one TCP connection, a single lost packet blocks ALL streams until it is retransmitted. This head-of-line blocking problem becomes increasingly painful as connections carry more concurrent data.',
				transition: 'TCP\'s single-stream design meant that loss in one logical conversation blocked every other conversation sharing the same connection. The telecom industry, which needed to carry multiple independent signaling messages simultaneously, developed a different approach...'
			},
			{
				protocolId: 'sctp',
				title: 'SCTP: Multi-Streaming',
				description:
					'SCTP was the first transport protocol to tackle head-of-line blocking directly. It introduced independent streams within a single association — a lost packet on stream 5 does not stall streams 1 through 4. It also pioneered multi-homing: an SCTP association can span multiple IP addresses on each endpoint, providing automatic failover if a network interface goes down. Additionally, SCTP preserves message boundaries natively (unlike TCP\'s raw byte stream), making it ideal for structured messages like telephony signaling (SS7 over IP). While it never achieved broad web adoption because most NATs and firewalls do not understand SCTP packets, its ideas proved prescient.',
				transition: 'SCTP proved that independent streams eliminate head-of-line blocking, and multi-homing provides resilience. But what if you want to go further — not just failing over between network paths, but actively using multiple paths simultaneously to aggregate bandwidth?'
			},
			{
				protocolId: 'mptcp',
				title: 'MPTCP: Multiple Paths',
				description:
					'Multipath TCP extends standard TCP to use multiple network interfaces simultaneously. Your phone can send data over both WiFi and cellular at the same time, aggregating their bandwidth. If you walk out of WiFi range, the cellular subflow keeps going seamlessly — no connection drop, no reconnection delay. MPTCP works by establishing multiple TCP subflows and distributing data across them using a coupled congestion control algorithm that balances load fairly. Apple uses MPTCP in iOS for Siri and Maps, and it powers the seamless WiFi-to-cellular transitions you experience daily without noticing. The tradeoff is complexity: schedulers must decide which path gets which data, and reordering at the receiver adds latency.',
				transition: 'MPTCP showed the power of using multiple paths, but it still inherits TCP\'s fundamental constraints — the three-way handshake, the kernel implementation that is hard to update, and middlebox interference. A completely new transport protocol, designed with all these lessons in mind, would soon arrive...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Modern Synthesis',
				description:
					'QUIC represents the culmination of everything learned from TCP, SCTP, and MPTCP. Built on UDP to bypass ossified middleboxes, it implements its own reliability and congestion control in userspace (making it updatable without OS kernel changes). From SCTP it borrows independent streams without head-of-line blocking. It integrates TLS 1.3 directly into the handshake, achieving a secure connection in just one round trip (or zero for repeat visits). QUIC connections are identified by a variable-length Connection ID rather than the IP/port tuple, enabling connection migration — switch from WiFi to cellular and the connection survives. Google developed it, the IETF standardized it, and it now powers HTTP/3 for billions of users.'
			}
		]
	},

	{
		id: 'quic-revolution',
		title: 'The QUIC Revolution',
		description:
			'How QUIC rebuilt transport from the ground up — combining TCP, TLS, and HTTP/2 lessons.',
		color: '#39FF14',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP + TLS: The Old Way',
				description:
					'To load a web page over HTTPS, a browser traditionally needs three sequential round trips before any page data flows: one for the TCP handshake (SYN, SYN-ACK, ACK), one or two more for TLS (exchanging cipher suites, certificates, and key material). On a connection with 100ms latency, that is 200-300ms of pure handshake overhead before a single byte of HTML arrives. Even worse, HTTP/2 multiplexes all its streams over a single TCP connection, so when one packet is lost, TCP\'s head-of-line blocking stalls every request — even though the lost data might belong to an unrelated resource like a tiny favicon.',
				transition: 'Google measured this cost at scale across billions of Chrome connections and realized the overhead was enormous. They wanted 1-RTT connections, encryption by default, and no head-of-line blocking. But deploying a new transport protocol through the existing internet — full of NATs, firewalls, and middleboxes that drop anything that is not TCP or UDP — seemed impossible. Unless they built on top of something that already works everywhere...'
			},
			{
				protocolId: 'udp',
				title: 'UDP: The Foundation',
				description:
					'The key insight was that UDP passes through virtually every middlebox on the internet. NATs translate UDP ports, firewalls allow it, and ISP equipment does not inspect it. By layering a new protocol on top of UDP, Google could deploy revolutionary transport features without waiting for routers and operating systems to be updated — a process that historically takes decades. UDP itself adds almost nothing (just 8 bytes of header with ports and a checksum), giving QUIC a blank canvas to build its own reliability, encryption, and stream management entirely in userspace. This also means QUIC can be updated with a browser release, not an OS kernel update.',
				transition: 'With UDP providing universal reachability through the existing internet infrastructure, the QUIC engineering team had the foundation they needed. Now they could design the actual transport protocol — combining the reliability lessons of TCP, the encryption of TLS, and the multiplexing ideas of HTTP/2 into a single, unified protocol...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: The Synthesis',
				description:
					'QUIC merges transport and security into a single protocol. Its handshake combines the connection setup and TLS 1.3 key exchange into one round trip — the client sends its cryptographic parameters in the very first packet, and the server\'s first response is already encrypted. Independent streams within a single QUIC connection mean a lost packet only blocks the stream it belongs to, not all traffic. Connections are identified by a variable-length Connection ID rather than the IP/port 4-tuple, so when you switch from WiFi to cellular, the connection migrates seamlessly. And because QUIC runs in userspace, it can be iterated on monthly rather than waiting years for kernel updates.',
				transition: 'With QUIC providing fast, encrypted, multiplexed transport, the final piece was adapting HTTP to take advantage of it. HTTP/3 is not just "HTTP/2 on QUIC" — it had to be redesigned because QUIC\'s streams replaced the stream multiplexing that HTTP/2 implemented over TCP...'
			},
			{
				protocolId: 'http3',
				title: 'HTTP/3: The Payoff',
				description:
					'HTTP/3 maps one HTTP request-response to one QUIC stream, giving each request independent flow control and loss recovery. A lost packet carrying image data does not block the CSS or JavaScript streams. QPACK replaces HPACK for header compression (adapted for QUIC\'s out-of-order delivery), and 0-RTT resumption lets returning visitors send their first HTTP request in the very first packet — zero round-trip latency for the initial data. On lossy mobile networks, HTTP/3 delivers pages measurably faster than HTTP/2 over TCP. As of 2024, over 30% of global web traffic runs on HTTP/3, and adoption is accelerating as CDNs and cloud providers enable it by default.'
			}
		]
	},

	// ── Web / API ──────────────────────────────────────────────────────
	{
		id: 'http-timeline',
		title: 'The HTTP Timeline',
		description: 'Three decades of HTTP evolution — from Tim Berners-Lee\'s hypertext to QUIC-powered streams.',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'http1',
				title: 'HTTP/1.1: The Foundation',
				description:
					'HTTP/1.1 (1997) established the web as we know it. It is entirely text-based — you can literally type "GET / HTTP/1.1" into a telnet session and get a web page back. The keep-alive header lets a single TCP connection serve multiple sequential requests, avoiding the cost of a new handshake for each resource. But requests are strictly serialized: the client must wait for each response before sending the next request. Browsers worked around this by opening 6-8 parallel TCP connections per domain, and developers invented domain sharding, CSS sprites, and resource inlining to reduce the request count. These were hacks born from protocol limitations, and the web was crying out for something better.',
				transition: 'By 2015, the average web page required over 100 resources (scripts, stylesheets, images, fonts). Opening 6 connections per domain and serializing requests within each one was an enormous waste of bandwidth and latency. The web needed a protocol that could handle many requests simultaneously over a single connection...'
			},
			{
				protocolId: 'http2',
				title: 'HTTP/2: Multiplexed Binary',
				description:
					'HTTP/2 (2015) was a ground-up redesign of how HTTP frames are encoded and transmitted, while keeping the familiar semantics (GET, POST, headers, status codes) unchanged. It switched from text to a compact binary framing layer, multiplexes unlimited concurrent streams over a single TCP connection, and compresses headers with HPACK (using a shared dynamic table that avoids re-sending identical headers like cookies and user-agents). Server push lets the server proactively send resources it knows the client will need (like the CSS for a page it just served). All those HTTP/1.1 performance hacks — domain sharding, spriting, inlining — became unnecessary and even counterproductive.',
				transition: 'HTTP/2 eliminated the HTTP-layer head-of-line blocking, but it exposed a deeper problem: all those multiplexed streams shared a single TCP connection. When one TCP packet was lost, TCP\'s ordered delivery guarantee stalled ALL streams until the retransmission arrived. The protocol needed a new transport layer that would not punish unrelated streams for one stream\'s lost packet...'
			},
			{
				protocolId: 'http3',
				title: 'HTTP/3: QUIC-Powered',
				description:
					'HTTP/3 (2022) runs on QUIC instead of TCP, finally eliminating head-of-line blocking at every layer. Each HTTP stream maps to an independent QUIC stream with its own loss recovery — a dropped packet on one stream cannot block any other. QPACK replaces HPACK for header compression, adapted for QUIC\'s potentially out-of-order stream delivery. The integrated TLS 1.3 handshake means a new connection is ready in one round trip, and 0-RTT resumption for returning visitors means the browser can send its first HTTP request instantly. Connection migration (via QUIC\'s Connection ID) means a phone switching from WiFi to cellular does not drop the page load. The three decades of HTTP evolution culminate here: a fast, encrypted, multiplexed protocol that works well even on lossy mobile networks.'
			}
		]
	},
	{
		id: 'rest-to-realtime',
		title: 'REST to Real-Time',
		description: 'From simple request-response to persistent bidirectional communication.',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: Request-Response',
				description:
					'REST (Representational State Transfer) models your API as a collection of resources, each identified by a URL, manipulated through standard HTTP methods: GET to read, POST to create, PUT to replace, DELETE to remove. Its stateless design means every request carries all the context the server needs — no session state to manage, trivial to cache, easy to scale behind load balancers. REST dominates web APIs because of this simplicity. But it has a fundamental limitation: the client must ask for updates. If you want real-time stock prices or live chat messages, you are stuck polling — hammering the server with repeated requests, most of which return "nothing new," wasting bandwidth and battery life.',
				transition: 'Polling is like repeatedly calling someone to ask "any news?" — wasteful for both parties. What if the server could simply call you back whenever something interesting happens? The web platform introduced a lightweight mechanism for exactly this kind of one-way push...'
			},
			{
				protocolId: 'sse',
				title: 'SSE: Server-Sent Events',
				description:
					'Server-Sent Events flip the REST model on its head: instead of the client polling, the server holds the connection open and pushes events whenever they occur. It works over plain HTTP (so it passes through proxies, load balancers, and CDNs without issues), uses a dead-simple text-based format (just "data:" lines), and the browser\'s EventSource API automatically reconnects if the connection drops — even resuming from the last received event ID. SSE is perfect for live dashboards, notification feeds, log tailing, and AI streaming responses (like ChatGPT\'s token-by-token output). The limitation is that it is one-directional: only the server can push. If the client needs to send messages too, it must use separate HTTP requests.',
				transition: 'SSE handles server-to-client streaming elegantly, but many applications need truly bidirectional communication — chat applications where both users type simultaneously, multiplayer games with constant input and output, collaborative editors where every keystroke must be broadcast. These need a connection where either side can send at any moment...'
			},
			{
				protocolId: 'websockets',
				title: 'WebSockets: Full Duplex',
				description:
					'WebSockets upgrade an HTTP connection into a persistent, full-duplex channel where both client and server can send messages independently at any time — no request/response pairing required. After the initial HTTP upgrade handshake, the protocol switches to a lightweight binary framing format with minimal overhead (as little as 2 bytes per frame). This makes WebSockets ideal for chat applications (Slack, Discord), multiplayer gaming (real-time position updates), collaborative editing (Google Docs cursors), and financial trading (live order book updates). The tradeoff is that WebSockets are raw pipes — they give you a message channel but impose no structure on what flows through it. You must design your own message formats, error handling, and connection management.',
				transition: 'WebSockets provide raw bidirectional messaging, but for microservice architectures and complex distributed systems, developers need more structure: typed message schemas, automatic code generation for multiple languages, streaming in both directions, and efficient binary serialization. Enterprise systems need a proper RPC framework...'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Typed Streaming RPC',
				description:
					'gRPC brings the rigor of typed interfaces to network communication. You define your service and message schemas in Protocol Buffers (.proto files), and the gRPC toolchain generates client and server code in dozens of languages — Go, Java, Python, Rust, C++, TypeScript, and more. Messages are serialized to a compact binary format (5-10x smaller than JSON), and the transport runs on HTTP/2 with full support for four streaming patterns: unary (single request/response), server streaming, client streaming, and bidirectional streaming. Built-in features include deadlines, cancellation, metadata propagation, and pluggable authentication. gRPC is the backbone of microservice communication at Google, Netflix, and most major cloud providers.'
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
					'MQTT was designed for the harshest conditions: sensors on oil rigs with satellite uplinks, medical devices with intermittent cellular, smart home gadgets on flaky WiFi. Its binary protocol is extraordinarily compact — a minimal publish message is just 2 bytes of overhead. Clients publish to hierarchical topics (like "home/kitchen/temperature") and subscribe with wildcards ("home/+/temperature" for all rooms). Three QoS levels let you choose between fire-and-forget (QoS 0), acknowledged delivery (QoS 1), and exactly-once delivery (QoS 2). The broker handles all routing: publishers and subscribers never need to know about each other, creating clean decoupling. A "Last Will" message is even sent automatically if a device disconnects unexpectedly.',
				transition: 'MQTT excels at getting small messages from constrained devices to a broker, but enterprise systems need more sophisticated message routing. What if you need to route messages based on content, fan out to multiple queues, implement priority ordering, or guarantee transactional processing with dead-letter handling?'
			},
			{
				protocolId: 'amqp',
				title: 'AMQP: Enterprise Messaging',
				description:
					'AMQP (Advanced Message Queuing Protocol) is the industrial-strength messaging protocol for enterprise systems. It introduces a powerful routing model: producers send messages to exchanges, which route them to queues based on bindings. Different exchange types enable different patterns — direct exchanges for point-to-point, fanout for broadcasting to all queues, topic exchanges for pattern-based routing, and headers exchanges for attribute-based routing. Messages can be persistent (surviving broker restarts), acknowledged (consumers confirm processing), and rejected (dead-lettered for error handling). This architecture powers financial trading systems, healthcare data pipelines, and e-commerce order processing where losing a message could mean losing money or endangering lives.',
				transition: 'AMQP handles complex enterprise routing brilliantly, but what happens when you need to process millions of events per second, replay historical data, and scale horizontally across dozens of servers? Enterprise message brokers were not designed for internet-scale event streaming...'
			},
			{
				protocolId: 'kafka',
				title: 'Kafka: Event Streaming',
				description:
					'Kafka reimagined messaging as a distributed commit log — an append-only, immutable sequence of events that can be replayed from any point in time. Topics are split into partitions distributed across a cluster, with each partition replicated for fault tolerance. Consumer groups enable parallel processing: each consumer in a group reads from different partitions, providing horizontal scalability. Unlike traditional message queues that delete messages after consumption, Kafka retains events for a configurable period (days, weeks, or forever), enabling new consumers to reprocess the entire history. This makes it ideal for event sourcing, change data capture, stream processing pipelines, and building real-time data platforms. LinkedIn, where Kafka was born, processes over 7 trillion messages per day through it.'
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
					'CoAP (Constrained Application Protocol) brings REST-like semantics to devices too small and power-limited for HTTP. Running over UDP with compact binary headers (just 4 bytes fixed), it supports GET, PUT, POST, and DELETE on resources identified by URIs — familiar patterns for web developers, but sized for microcontrollers with 10KB of RAM. Its "Observe" option lets a client register for notifications when a resource changes (like a temperature sensor), avoiding the cost of repeated polling. CoAP also supports multicast for discovering devices on a network and DTLS for encrypted communication. Think of it as HTTP shrunk down for a world where every byte and milliwatt counts.',
				transition:
					'CoAP works brilliantly for individual device communication, but a real IoT deployment might have thousands of sensors, each publishing readings every few seconds. Something needs to aggregate all these data streams, handle intermittent connectivity, and route data to the right consumers without every device needing to know about every consumer...'
			},
			{
				protocolId: 'mqtt',
				title: 'MQTT: Device Gateway',
				description:
					'MQTT acts as the central nervous system of an IoT deployment. A gateway device translates CoAP messages from local sensors into MQTT publishes, sending them to a broker that manages all subscriptions and routing. Topics create a natural hierarchy for organizing device data: "factory/floor-2/press-7/temperature" makes it intuitive to subscribe to all sensors on floor 2 ("factory/floor-2/#") or all temperature readings ("factory/+/+/temperature"). QoS levels ensure data reaches its destination even over unreliable cellular or satellite links. The broker also tracks which devices are online via keep-alive pings and publishes Last Will messages when a device disappears, enabling immediate alerting on device failures.',
				transition:
					'MQTT reliably moves IoT data from the edge to central systems, but enterprise applications — web dashboards, analytics platforms, legacy systems — often cannot speak MQTT directly. You need a protocol that bridges the gap, one that is simple enough for a web developer to integrate in an afternoon...'
			},
			{
				protocolId: 'stomp',
				title: 'STOMP: Simple Integration',
				description:
					'STOMP (Simple Text Oriented Messaging Protocol) is the HTTP of messaging — entirely text-based and human-readable, making it trivial to debug with basic tools. Commands like CONNECT, SUBSCRIBE, SEND, and ACK are self-explanatory, and any developer who understands HTTP can integrate STOMP in minutes. Web applications commonly use STOMP over WebSockets, enabling browser-based dashboards to subscribe to IoT data feeds in real time. Message brokers like RabbitMQ and ActiveMQ support STOMP alongside their native protocols, making it the easiest on-ramp for connecting web frontends to messaging infrastructure. The tradeoff is efficiency: text headers and no compression mean more overhead than binary protocols.',
				transition: 'STOMP makes integration easy, but enterprise data processing demands more — content-based routing that sends alerts only to the right team, transactional message handling that guarantees no order is processed twice, dead-letter queues for failed processing, and priority ordering for time-sensitive data. These requirements call for a full-featured enterprise messaging protocol...'
			},
			{
				protocolId: 'amqp',
				title: 'AMQP: Enterprise Processing',
				description:
					'At the enterprise tier, AMQP provides the routing sophistication and reliability guarantees that business-critical systems demand. IoT data flowing in from MQTT can be routed by AMQP exchanges based on content, priority, or routing keys — temperature alerts go to the monitoring queue, maintenance data goes to the ERP integration queue, and raw telemetry goes to the data lake ingestion queue. Transactional publishing ensures that a batch of related messages either all arrive or none do. Consumer acknowledgments guarantee that no message is lost if a processing node crashes mid-operation — the broker simply redelivers to another consumer. This reliability pipeline transforms raw sensor data into trustworthy business intelligence.'
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
					'Before a single frame of video can flow, both peers need to agree on the ground rules: which codecs they support (VP8, H.264, Opus), what transport addresses to use, which media types to exchange (audio, video, or both), and their bandwidth capabilities. SDP (Session Description Protocol) is a structured text format that encodes all of this into an "offer" from one peer and an "answer" from the other. This offer/answer exchange happens through a signaling server (which could use WebSockets, HTTP, or even copy-pasting text), and it is the critical negotiation step that makes two arbitrary devices mutually intelligible. Without SDP, neither peer would know how to decode the other\'s media.',
				transition:
					'Both peers have agreed on codecs, formats, and transport parameters through SDP negotiation. The signaling is complete — but now the actual audio and video data needs a way to travel between them in real time, with timestamps for synchronization and sequence numbers for detecting loss...'
			},
			{
				protocolId: 'rtp',
				title: 'RTP: Media Transport',
				description:
					'RTP (Real-time Transport Protocol) is the workhorse that carries the actual audio and video data. Each RTP packet includes a timestamp (essential for playing audio and video at the right moment, even if packets arrive out of order), a sequence number (for detecting lost packets), a payload type identifier (so the receiver knows which codec to use for decoding), and synchronization source identifiers (for distinguishing multiple media streams). RTP runs over UDP because real-time media cannot afford TCP\'s retransmission delays — a 200ms-old video frame is useless, so it is better to skip it and show the next one. Its companion protocol RTCP provides feedback: receiver reports on packet loss and jitter help the sender adapt its bitrate in real time.',
				transition:
					'RTP handles media transport beautifully, but building a video call in a web browser involves much more than just sending packets. Peers are usually behind NATs and firewalls, all media must be encrypted, and browsers need a JavaScript API to access cameras and microphones. A comprehensive framework is needed to tie everything together...'
			},
			{
				protocolId: 'webrtc',
				title: 'WebRTC: The Full Stack',
				description:
					'WebRTC is the browser-native framework that makes peer-to-peer video calls possible without plugins. It orchestrates an entire stack: ICE (Interactive Connectivity Establishment) punches through NATs by testing multiple connection candidates (local addresses, server-reflexive via STUN, relay via TURN) and selecting the best path. DTLS (Datagram TLS) encrypts the connection, and SRTP (Secure RTP) encrypts the media streams. The getUserMedia API accesses cameras and microphones, RTCPeerConnection manages the connection lifecycle, and RTCDataChannel provides a reliable or unreliable channel for arbitrary data (file sharing, game state, text chat) alongside the media. All of this happens peer-to-peer — video data flows directly between browsers without passing through a server, reducing latency and server costs.'
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
					'RTMP (Real-Time Messaging Protocol) was developed by Macromedia for Flash Player and became the dominant live streaming protocol for over a decade. It maintains a persistent TCP connection and multiplexes audio, video, and data messages into interleaved chunks, achieving low latency (1-3 seconds) for live broadcasts. RTMP powered early YouTube live, Twitch, and Facebook Live. However, it required specialized streaming servers (like Adobe Media Server or Wowza), could not pass through many firewalls and proxies, and while Flash Player\'s end-of-life in 2020 ended RTMP\'s use for playback, the protocol survives as a widely-used ingest format — streamers still use RTMP to send video from OBS to platforms like Twitch, which then transcode and redistribute via modern protocols.',
				transition:
					'RTMP\'s dependence on Flash and specialized servers was its downfall. The insight that changed everything was simple: what if you broke video into small files and served them over plain HTTP? Suddenly any web server, any CDN, and any HTTP cache in the world could deliver video without special software...'
			},
			{
				protocolId: 'hls',
				title: 'HLS: Adaptive HTTP',
				description:
					'HLS (HTTP Live Streaming), created by Apple in 2009, broke video streaming wide open. The encoder splits the video into small segments (typically 6-10 seconds each), encodes each segment at multiple quality levels (360p, 720p, 1080p, 4K), and generates a playlist file (.m3u8) listing the available segments and qualities. The player downloads the playlist, starts fetching segments, and continuously monitors download speed — if bandwidth drops, it seamlessly switches to a lower quality; when bandwidth recovers, it ramps back up. Because everything is plain HTTP, it works through any CDN, proxy, or cache, making it massively scalable. HLS is natively supported in Safari and iOS, and nearly every streaming platform uses it as their primary delivery format.',
				transition:
					'HLS transformed video delivery but is an Apple-developed technology. The internet standards community wanted an open, vendor-neutral alternative that could offer the same adaptive streaming benefits while supporting a wider range of codecs and DRM systems without patent encumbrances...'
			},
			{
				protocolId: 'dash',
				title: 'DASH: Open Standard',
				description:
					'DASH (Dynamic Adaptive Streaming over HTTP) is the ISO-standardized answer to HLS. Instead of an Apple-specific playlist format, DASH uses an XML-based Media Presentation Description (MPD) that describes available representations — each with its codec, resolution, bitrate, and segment URLs. Being codec-agnostic, DASH supports H.264, H.265/HEVC, VP9, AV1, and any future codec without protocol changes. It offers more flexible segment addressing (template-based URLs, byte-range requests, timeline-based indexing) and supports features like multi-period presentations (inserting ads as separate periods) and content protection descriptors for DRM integration. Netflix, YouTube, and most major streaming services use DASH for non-Apple devices, often running both DASH and HLS in parallel to cover the entire device ecosystem.'
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
					'DNS is the first step in almost every internet interaction — and also one of the most vulnerable. Traditional DNS queries travel in plaintext over UDP, meaning your ISP (or anyone on the network path) can see every domain you visit. Modern hardening includes DNSSEC (cryptographic signatures that prevent spoofed DNS responses), DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) which encrypt queries so observers cannot read them, and DNS-based authentication like DANE which allows domain owners to publish their TLS certificate fingerprints in DNS itself. Securing DNS is critical because a compromised DNS response can redirect you to a phishing site that perfectly mimics your bank — and no amount of TLS will help if you connect to the wrong server.',
				transition:
					'DNS has told you WHERE to connect, but the connection itself is still vulnerable — anyone on the network path can read, modify, or inject data. The next step is wrapping the connection in encryption that guarantees confidentiality, integrity, and authenticity...'
			},
			{
				protocolId: 'tls',
				title: 'TLS: Encryption',
				description:
					'TLS is the encryption layer that makes secure internet communication possible. During the handshake, the server presents a certificate signed by a trusted Certificate Authority, proving it is who it claims to be (authentication). Both sides negotiate a cipher suite and perform a key exchange (typically ECDHE — Elliptic Curve Diffie-Hellman Ephemeral) to create shared session keys that provide forward secrecy: even if the server\'s long-term private key is later compromised, past recorded sessions cannot be decrypted. Every byte of application data is then encrypted (confidentiality) and authenticated with a MAC (integrity). TLS 1.3 simplified the protocol dramatically, removing insecure legacy algorithms, reducing the handshake to one round trip, and making 0-RTT resumption possible for repeat connections.',
				transition:
					'TLS protects the data flowing over network connections, but server administrators need more than encrypted web traffic — they need to securely log into remote machines, transfer configuration files, and set up encrypted tunnels. A purpose-built protocol for secure remote access emerged to fill this gap...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Secure Access',
				description:
					'SSH replaced the dangerously insecure Telnet and rlogin protocols, becoming the universal standard for secure remote server management. It supports multiple authentication methods — password, public-key (Ed25519 or RSA), certificate-based, and multi-factor — with public-key being the gold standard (no password to intercept or guess). Beyond remote shells, SSH provides SCP and SFTP for encrypted file transfer, local and remote port forwarding for tunneling any TCP connection through the encrypted channel, and agent forwarding for securely chaining through jump hosts. Its config file (~/.ssh/config) lets you define per-host settings, jump proxies, and identity files. SSH is also the transport for Git operations, making it foundational to modern software development workflows.'
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
					'When your device joins a network, it literally has no identity — no IP address, no subnet mask, no idea where the gateway is. DHCP (Dynamic Host Configuration Protocol) solves this bootstrap problem through a four-step dance called DORA: your device broadcasts a Discover message to the entire LAN (since it cannot address anyone specifically), a DHCP server responds with an Offer containing an available IP, your device formally Requests that address, and the server sends an Acknowledgment confirming the lease. Along with the IP, DHCP provides the subnet mask, default gateway, DNS server addresses, lease duration, and often additional options like NTP servers and domain search suffixes. Without DHCP, every device on every network would need manual IP configuration — a nightmare at any scale.',
				transition:
					'Your device has an IP address and can send packets, but its internal clock might be hours or even years off — set to a factory default or drifted during a long power-off period. This matters more than you might think: TLS certificates have validity windows, log timestamps must be accurate for debugging, and Kerberos authentication fails with more than 5 minutes of clock skew...'
			},
			{
				protocolId: 'ntp',
				title: 'NTP: Sync the Clock',
				description:
					'NTP (Network Time Protocol) synchronizes your device\'s clock with atomic time references accurate to billionths of a second. It uses a clever algorithm that sends multiple time-stamped packets to upstream servers, measures the round-trip delay, and calculates the offset between your clock and the server\'s clock — compensating for the asymmetric network latency. NTP organizes time sources in a stratum hierarchy: stratum 0 is the atomic clock itself, stratum 1 servers connect directly to those clocks, stratum 2 servers sync from stratum 1, and so on. Accurate time is not just a convenience — TLS certificates that appear expired due to clock drift will be rejected, distributed databases use timestamps for conflict resolution, and forensic logging is useless if you cannot trust when events occurred.',
				transition:
					'Your device now has a network address (DHCP) and an accurate clock (NTP). The infrastructure is ready. But when you type "gmail.com" into a browser, the network needs to translate that human-friendly name into a machine-routable IP address...'
			},
			{
				protocolId: 'dns',
				title: 'DNS: Resolve Names',
				description:
					'With a working network connection and the DNS server address provided by DHCP, your device can finally translate domain names into IP addresses. The recursive resolver (usually run by your ISP or a public service like 8.8.8.8 or 1.1.1.1) does the heavy lifting: it queries root servers, TLD servers, and authoritative nameservers on your behalf, caching results at each level. The first DNS query after connecting might take 50-100ms as the resolver walks the hierarchy, but subsequent queries for the same domain hit the cache and resolve in under 1ms. This is also where content delivery networks work their magic — DNS can return different IP addresses based on your geographic location, directing you to the nearest server.',
				transition:
					'Your device can now resolve any hostname on the internet and reach servers across the globe. The network stack is fully operational — DNS resolves names, TCP provides reliable connections, and TLS encrypts them. Time to put it all to work by communicating with the outside world...'
			},
			{
				protocolId: 'smtp',
				title: 'SMTP: First Message',
				description:
					'With the full network stack operational, your email client can connect to the mail server and send your first message. SMTP (Simple Mail Transfer Protocol) uses a text-based command dialogue that has barely changed since 1982: EHLO introduces your client, AUTH LOGIN authenticates you, MAIL FROM and RCPT TO specify the envelope addresses, and DATA begins the message body (headers, MIME parts, attachments). Modern SMTP uses STARTTLS to upgrade the connection to encrypted, and SPF/DKIM/DMARC records in DNS authenticate the sender to prevent spoofing. This first successful email is proof that every layer of the network stack — from physical Ethernet to application protocols — is functioning correctly.'
			}
		]
	},
	{
		id: 'api-design-patterns',
		title: 'API Design Patterns',
		description:
			'Compare three major approaches to building APIs — from resource-oriented REST to flexible GraphQL to high-performance gRPC.',
		color: '#818CF8',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: Resources and URLs',
				description:
					'REST (Representational State Transfer) models every piece of data as a resource with a unique URL. Clients interact using standard HTTP methods: GET to read, POST to create, PUT to replace, DELETE to remove. REST APIs are stateless — every request contains all the information needed to process it, making them easy to cache and scale. The trade-off is rigidity: clients get fixed data structures, often leading to over-fetching (getting fields they do not need) or under-fetching (needing multiple requests to assemble a view). REST dominates the web because of its simplicity, but complex UIs with deeply nested data often outgrow it.',
				transition: 'REST APIs work well for simple CRUD operations, but mobile and single-page apps often need data from many related resources in a single screen. What if the client could specify exactly the data it needs in one request?'
			},
			{
				protocolId: 'graphql',
				title: 'GraphQL: Ask for Exactly What You Need',
				description:
					'GraphQL lets clients send a query describing exactly the shape of the data they want, and the server returns only that — no more, no less. A single query can traverse relationships (user → posts → comments) that would require multiple REST endpoints. The schema is typed and introspectable, making APIs self-documenting. Mutations handle writes, and subscriptions push real-time updates over WebSockets. The trade-off: the server must resolve arbitrary query shapes, making caching harder (no URL-based caching), rate-limiting more complex (a single query can be expensive), and N+1 database problems common without careful DataLoader usage.',
				transition: 'GraphQL gives clients flexibility, but its text-based JSON format adds overhead. For internal microservice communication where both sides are controlled by the same team, is there an even more efficient option?'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Binary Speed for Services',
				description:
					'gRPC uses Protocol Buffers (protobuf) for compact binary serialization and HTTP/2 for multiplexed transport, making it 3-10x faster to parse than JSON. Services are defined in .proto files that generate strongly-typed client and server code in 11 languages. gRPC supports four communication patterns: unary (request-response), server streaming, client streaming, and bidirectional streaming. This makes it ideal for microservice meshes where low latency and type safety matter more than human readability. The trade-off: browsers cannot call gRPC directly (they need a proxy like gRPC-Web or Envoy), and debugging requires special tooling since the payload is binary.'
			}
		]
	},
	{
		id: 'auth-journey',
		title: 'How Authentication Works',
		description:
			'Understand the protocols that prove identity and protect communication — from OAuth tokens to TLS certificates to SSH keys.',
		color: '#F59E0B',
		scope: 'global',
		steps: [
			{
				protocolId: 'oauth2',
				title: 'OAuth 2.0: Delegated Authorization',
				description:
					'OAuth 2.0 solves a fundamental problem: how can a third-party app access your data without knowing your password? Instead of sharing credentials, OAuth uses an authorization server as an intermediary. You authenticate directly with the provider (Google, GitHub), approve specific permissions (scopes), and the provider issues a time-limited access token to the app. The Authorization Code flow with PKCE is the standard for web and mobile apps — it uses a code verifier to prevent interception attacks. Refresh tokens allow silent re-authentication without user interaction. OAuth is authorization (what you can access), not authentication (who you are) — OpenID Connect adds the identity layer on top.',
				transition: 'OAuth tokens travel over the network as Bearer tokens in HTTP headers. But how are those HTTP connections themselves protected from eavesdroppers? The answer is the encryption layer that secures virtually all internet traffic...'
			},
			{
				protocolId: 'tls',
				title: 'TLS: Encrypted Channels',
				description:
					'TLS protects every OAuth token, every API key, and every password in transit. During the handshake, the server proves its identity with a certificate signed by a trusted Certificate Authority, and both sides negotiate encryption parameters. The key exchange (ECDHE) generates ephemeral session keys that provide forward secrecy — even if the server\'s private key is later compromised, past sessions remain secure. TLS 1.3 streamlined this to a single round trip and removed all insecure legacy algorithms. Without TLS, OAuth tokens would be visible to anyone on the network path.',
				transition: 'TLS secures data in transit over the network. But system administrators need a different kind of secure access — interactive shell sessions, file transfers, and tunnels to remote machines. A purpose-built protocol provides this with a different trust model...'
			},
			{
				protocolId: 'ssh',
				title: 'SSH: Key-Based Machine Access',
				description:
					'SSH replaces the trust model entirely: instead of Certificate Authorities, it uses a "trust on first use" approach where you verify the server\'s host key fingerprint on first connection and your client remembers it for future sessions. Authentication typically uses Ed25519 key pairs — your private key stays on your machine, your public key is placed on every server you need access to. No passwords traverse the network. SSH also provides encrypted tunnels (port forwarding) that can wrap any TCP protocol in encryption, SFTP for secure file transfer, and agent forwarding for chaining through bastion hosts. It is the backbone of DevOps: git pushes, Ansible deployments, and remote debugging all flow through SSH.'
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
					'When something goes wrong on a network, ICMP is the first tool you reach for. The ping command sends an ICMP Echo Request to a host and measures the time until the Echo Reply comes back — giving you round-trip time, packet loss percentage, and basic reachability in one command. Traceroute exploits ICMP in a clever way: it sends packets with incrementally increasing TTL (Time to Live) values. Each router along the path decrements the TTL, and when it hits zero, that router sends back an ICMP Time Exceeded message — revealing its identity and distance. This traces the exact path packets take across the internet, exposing where latency spikes or failures occur.',
				transition: 'ICMP told you whether a host is reachable and traced the network path to get there. But what if the problem is not routing — what if the hostname itself is not resolving to the right IP address? DNS issues are one of the most common causes of "the internet is broken"...'
			},
			{
				protocolId: 'dns',
				title: 'DNS: Is It Resolving?',
				description:
					'DNS problems masquerade as total network failures — everything seems down, but the real issue is name resolution. The dig command queries DNS servers directly, showing you exactly which records are returned, which nameserver answered, the TTL remaining on cached entries, and the full query chain. You can query specific record types (A, AAAA, MX, CNAME, NS) and specific DNS servers to isolate whether the problem is your local resolver, the authoritative server, or caching. Common issues include stale cached records (wait for TTL expiry or flush the cache), misconfigured NS delegations, missing or incorrect A/AAAA records, and DNSSEC validation failures.',
				transition: 'DNS resolved the hostname to an IP address, and ICMP confirmed the host is reachable at the network layer. But on a local network, there is one more address translation that happens invisibly — if this layer breaks, devices on the same subnet cannot communicate at all...'
			},
			{
				protocolId: 'arp',
				title: 'ARP: Is Layer 2 Working?',
				description:
					'ARP operates at the boundary between IP addresses and physical hardware. When your machine knows the IP of a target on the same subnet, it still needs the target\'s MAC address to build an Ethernet frame. ARP broadcasts a request to the entire LAN, and the target responds with its MAC address. The arp command shows the local ARP cache — mapping IPs to MACs — and can reveal subtle issues: stale entries pointing to decommissioned hardware, duplicate IP addresses (two MACs responding for the same IP), or ARP poisoning attacks where a malicious device claims to be the gateway. On modern networks, ARP issues are rare but devastating when they occur, often causing intermittent connectivity that is maddeningly difficult to diagnose without checking the ARP table directly.'
			}
		]
	},
	{
		id: 'mobile-resilience',
		title: 'Mobile Network Resilience',
		description:
			'How transport protocols evolved to handle the reality of mobile networks — where connections drop, IP addresses change, and bandwidth varies.',
		color: '#10B981',
		scope: 'transport',
		steps: [
			{
				protocolId: 'tcp',
				title: 'TCP: The Reliable Foundation',
				description:
					'TCP was designed for fixed networks where connections are stable and endpoints do not move. It binds a connection to a 4-tuple: source IP, source port, destination IP, destination port. This works perfectly on desktops and servers, but on mobile devices it creates a fragile assumption — the moment your phone switches from Wi-Fi to cellular (or between cell towers), your IP address changes, and every TCP connection silently breaks. The application must detect the failure, re-establish the TCP handshake, re-negotiate TLS, and re-authenticate. For a video call or file download, this means a visible interruption.',
				transition: 'TCP ties connections to IP addresses, making them fragile on mobile networks. What if a single connection could span multiple network interfaces simultaneously, surviving handoffs without the application even noticing?'
			},
			{
				protocolId: 'mptcp',
				title: 'MPTCP: Multiple Paths',
				description:
					'Multipath TCP extends TCP to use multiple network paths simultaneously. A phone can send data over both Wi-Fi and cellular at the same time, seamlessly shifting traffic when one path degrades. When you walk out of Wi-Fi range, MPTCP gracefully migrates the connection to cellular without dropping a single byte — the application sees one uninterrupted TCP stream. Apple has used MPTCP in iOS since 2013 (for Siri and Apple Maps) and it is enabled system-wide in iOS 17+. MPTCP is backward-compatible: it falls back to regular TCP when the other endpoint does not support it. The trade-off is complexity — middleboxes (firewalls, NATs) sometimes strip the MPTCP options they do not understand.',
				transition: 'MPTCP adds resilience to TCP, but it inherits TCP\'s fundamental limitations: head-of-line blocking, ossified middleboxes, and a kernel-level implementation that is slow to deploy. A ground-up redesign built on UDP avoids all of these constraints...'
			},
			{
				protocolId: 'quic',
				title: 'QUIC: Connection Migration',
				description:
					'QUIC was designed from the start for mobile networks. Instead of identifying connections by IP addresses and ports, QUIC uses a variable-length Connection ID — a token that both endpoints recognize regardless of the underlying network path. When your phone switches from Wi-Fi to cellular, the IP address changes but the Connection ID stays the same, so the QUIC connection continues without interruption — no re-handshake, no re-authentication, no lost data. QUIC also eliminates head-of-line blocking (a lost packet only affects its own stream, not all streams), and its 1-RTT handshake integrates transport and encryption setup into a single round trip. Google reports that QUIC reduces video rebuffering by 18% on mobile networks compared to TCP.'
			}
		]
	},
	{
		id: 'email-journey',
		title: 'Life of an Email',
		description:
			'Follow an email from composition to reading — across DNS, SMTP, and IMAP.',
		color: '#2DD4BF',
		scope: 'utilities',
		steps: [
			{
				protocolId: 'dns',
				title: 'DNS: Find the Mail Server',
				description:
					'When you send an email to user@example.com, your mail server does not just look up example.com\'s IP address — it queries DNS for MX (Mail Exchange) records, a special record type that specifies which servers accept email for that domain and their priority ordering. A domain might have multiple MX records (mx1.example.com at priority 10, mx2.example.com at priority 20) for redundancy — if the primary mail server is down, the sender automatically tries the backup. Your server also checks SPF records (which IPs are authorized to send for that domain), DKIM records (public keys for verifying message signatures), and DMARC records (the domain\'s policy for handling authentication failures). This DNS step is where email security begins.',
				transition:
					'The DNS lookup revealed exactly which servers accept mail for the recipient\'s domain, along with their priority ordering. Now your mail server opens a TCP connection to the highest-priority MX server and begins the SMTP dialogue to deliver the message...'
			},
			{
				protocolId: 'smtp',
				title: 'SMTP: Send the Email',
				description:
					'SMTP is one of the oldest internet protocols still in active use — its text-based command dialogue has remained remarkably stable since 1982. Your mail server connects to the recipient\'s MX server and they exchange greetings (EHLO, which also advertises supported extensions like STARTTLS and SIZE). After upgrading to an encrypted connection via STARTTLS, the envelope is defined: MAIL FROM specifies the bounce address, RCPT TO identifies the recipient(s). Then the DATA command signals that the message body follows — headers (From, To, Subject, Date, Message-ID), MIME parts (text/plain, text/html), and base64-encoded attachments, terminated by a lone period on a line. The receiving server may relay the message through additional hops (forwarding, mailing lists) before final delivery to the recipient\'s mailbox.',
				transition:
					'The email has traversed the internet and landed safely in the recipient\'s mailbox on their mail server. But it is just sitting there as a file on a remote disk — the recipient needs a way to discover it, download it, organize it into folders, and keep everything synchronized across their phone, laptop, and web client...'
			},
			{
				protocolId: 'imap',
				title: 'IMAP: Read the Email',
				description:
					'IMAP (Internet Message Access Protocol) is what makes modern multi-device email possible. Unlike its predecessor POP3 (which downloads messages and optionally deletes them from the server), IMAP keeps all messages on the server and synchronizes state across every connected client. When you open your email app, IMAP fetches just the headers first (sender, subject, date) for a fast initial display, then downloads full message bodies on demand. Folders, flags (read, starred, deleted), and search happen server-side, so changes made on your phone instantly appear on your laptop. IMAP IDLE enables push notifications — the server immediately alerts your client when a new message arrives, eliminating the need for periodic polling. This server-centric model is why Gmail, Outlook, and every modern email service can provide a consistent experience across web, desktop, and mobile.'
			}
		]
	},

	// ── Web / API (AI Protocols) ──────────────────────────────────────

	{
		id: 'ai-agent-communication',
		title: 'How AI Agents Work Together',
		description:
			'Follow an AI agent from tool discovery to multi-agent collaboration — through JSON-RPC, MCP, and A2A.',
		color: '#00D4FF',
		scope: 'web-api',
		steps: [
			{
				protocolId: 'json-rpc',
				title: 'JSON-RPC: The Wire Format',
				description:
					'Before AI protocols existed, [[json-rpc|JSON-RPC]] 2.0 was already the wire format of choice for infrastructure — Ethereum nodes, Bitcoin Core, and the Language Server Protocol in VS Code all spoke [[json-rpc|JSON-RPC]]. Its appeal was radical simplicity: send a JSON object with a method name, params, and an ID; get back a result or error with the same ID. No schema files, no code generation, no binary encoding. When Anthropic and Google independently designed their AI protocols, both chose [[json-rpc|JSON-RPC]] 2.0 as the foundation — not because it was trendy, but because it was the simplest thing that could possibly work.',
				transition: '[[json-rpc|JSON-RPC]] provides the wire framing, but it says nothing about what methods should exist, what parameters they should take, or how AI applications should discover tools. A higher-level protocol was needed to define the semantics of AI tool use...'
			},
			{
				protocolId: 'mcp',
				title: 'MCP: Connecting Agents to Tools',
				description:
					'The Model Context Protocol solves the N×M integration problem. Before [[mcp|MCP]], connecting Claude to your database required custom code — different from connecting it to GitHub, different from Slack. [[mcp|MCP]] provides a universal interface: an MCP server exposes tools (actions the LLM can invoke), resources (data it can read), and prompts (templates it can use). The three-step initialization handshake negotiates capabilities, then the AI host discovers available tools via tools/list and invokes them via tools/call. A single host can connect to dozens of MCP servers simultaneously — one for your database, one for git, one for Slack — all through the same protocol.',
				transition: '[[mcp|MCP]] beautifully connects a single agent to its tools. But what happens when the task requires multiple specialized agents — a travel agent, a research agent, a booking agent — each with their own tools and expertise? A different protocol handles that layer of coordination...'
			},
			{
				protocolId: 'a2a',
				title: 'A2A: Connecting Agents to Agents',
				description:
					'The Agent-to-Agent Protocol picks up where [[mcp|MCP]] leaves off. While [[mcp|MCP]] is vertical (agent-to-tools), [[a2a|A2A]] is horizontal (agent-to-agent). Each agent publishes an Agent Card at /.well-known/agent.json describing its skills and capabilities. A coordinator agent discovers specialist agents, delegates tasks via message/send, and receives structured results as Artifacts. Tasks have a full lifecycle — submitted, working, input-required, completed — with [[sse|SSE]] streaming for real-time progress. The key design insight is {{opacity|opacity}}: you don\'t see another agent\'s internal reasoning or tool usage, only its skills and outputs. This allows agents from different vendors, built with different frameworks, to collaborate seamlessly.',
				transition: 'In a production system, [[a2a|A2A]] and [[mcp|MCP]] work together. The coordinator uses [[a2a|A2A]] to delegate to a specialist, and that specialist uses [[mcp|MCP]] internally to access its tools. But both protocols rely on the same real-time streaming mechanism to deliver incremental results...'
			},
			{
				protocolId: 'sse',
				title: 'SSE: Streaming AI Responses',
				description:
					'Server-Sent Events tie everything together at the transport level. When an [[mcp|MCP]] tool takes time to produce results, the server upgrades its [[http1|HTTP]] response to an [[sse|SSE]] stream, pushing progress {{notification|notifications}} and partial results as events. When an [[a2a|A2A]] agent works on a long task, it streams TaskStatusUpdate and TaskArtifactUpdate events via [[sse|SSE]]. Even the token-by-token streaming you see in chat interfaces is [[sse|SSE]] under the hood. The EventSource API\'s auto-reconnection means that if the connection drops mid-stream, the client reconnects and resumes from the last event ID — no data lost, no user intervention needed.'
			}
		]
	},
	{
		id: 'api-evolution',
		title: 'From REST to AI Protocols',
		description: 'The evolution of web APIs — from resource-oriented REST to AI-native protocols.',
		color: '#00D4FF',
		scope: 'global',
		steps: [
			{
				protocolId: 'rest',
				title: 'REST: The Foundation',
				description:
					'Roy Fielding\'s 2000 dissertation defined [[rest|REST]] as an architectural style: use [[http1|HTTP]] verbs for operations, URLs for resources, and make everything stateless. [[rest|REST]] dominated the API landscape for two decades because of its simplicity — any language with an [[http1|HTTP]] client could call a REST API. But REST was designed for human developers building web applications, not for AI systems that need to dynamically discover and invoke capabilities. Over-fetching, under-fetching, and the lack of machine-readable schemas were annoyances for developers but blockers for autonomous agents.',
				transition: '[[rest|REST]] served the web brilliantly for human-to-machine communication. But as systems grew more complex, developers needed richer patterns — typed contracts, efficient serialization, and flexible data fetching...'
			},
			{
				protocolId: 'grpc',
				title: 'gRPC: Typed, Efficient RPC',
				description:
					'Google\'s internal RPC system, Stubby, handled billions of requests per day. When they open-sourced it as [[grpc|gRPC]] in 2015, it brought protocol buffers (binary serialization 3-10x smaller than JSON), [[http2|HTTP/2]] multiplexing, and streaming to the developer community. For the first time, API contracts were machine-enforced at compile time via .proto files. The tradeoff was complexity — code generation, [[http2|HTTP/2]] requirements, and binary payloads that couldn\'t be debugged with curl. But for service-to-service communication at scale, [[grpc|gRPC]] was a revelation.',
				transition: '[[grpc|gRPC]] optimized for machine-to-machine efficiency, but it required schema compilation and couldn\'t easily serve browser clients. What if there was something in between — human-readable like [[rest|REST]] but with typed schemas and flexible querying?'
			},
			{
				protocolId: 'json-rpc',
				title: 'JSON-RPC: The Minimal Wire Format',
				description:
					'While [[rest|REST]] and [[grpc|gRPC]] dominated mainstream APIs, a quieter revolution was happening in infrastructure. [[json-rpc|JSON-RPC]] 2.0 — a one-page spec for calling methods by name over JSON — became the backbone of Ethereum\'s blockchain API, Bitcoin Core, and Microsoft\'s Language Server Protocol. Its appeal was radical simplicity: no URL routing, no [[http1|HTTP]] verb semantics, no schema compilation. Just a method name, params, and an ID. The spec was so simple and transport-agnostic ([[http1|HTTP]], [[websockets|WebSocket]], stdio, [[tcp|TCP]]) that it became the natural foundation for the next generation of protocols.',
				transition: '[[json-rpc|JSON-RPC]] proved that method-oriented RPC over JSON was powerful enough for critical infrastructure. When the AI revolution demanded new protocols for tool use and agent collaboration, [[json-rpc|JSON-RPC]] was the obvious wire format...'
			},
			{
				protocolId: 'mcp',
				title: 'MCP: AI-Native Tool Access',
				description:
					'In November 2024, Anthropic released the Model Context Protocol — the first protocol designed specifically for AI applications. Built on [[json-rpc|JSON-RPC]] 2.0, [[mcp|MCP]] provides dynamic tool discovery (tools/list returns JSON Schema definitions that LLMs can understand), resource access (files, database rows, API responses), and prompt templates. The key insight was that AI applications don\'t just need APIs — they need self-describing APIs that an LLM can discover, understand, and invoke autonomously. Within a year, Claude, ChatGPT, Copilot, Cursor, and VS Code all spoke [[mcp|MCP]], with over 10,000 MCP servers in production.',
				transition: '[[mcp|MCP]] connected AI agents to tools, solving the integration problem. But the next challenge was bigger: how do you get multiple AI agents — potentially from different vendors, built with different frameworks — to collaborate on complex tasks?'
			},
			{
				protocolId: 'a2a',
				title: 'A2A: AI-Native Agent Collaboration',
				description:
					'Google\'s Agent-to-Agent Protocol, announced in April 2025, completed the picture. Where [[mcp|MCP]] connects agents to tools, [[a2a|A2A]] connects agents to each other. An agent publishes its skills in an Agent Card, and other agents discover it, delegate tasks, and receive structured results — all without knowing anything about the internal implementation. The task lifecycle (submitted → working → completed) with [[sse|SSE]] streaming provides the coordination primitives that multi-agent systems need. Together, [[mcp|MCP]] and [[a2a|A2A]] form the two-protocol foundation of the agentic AI era — donated to the Linux Foundation as open industry standards.'
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
