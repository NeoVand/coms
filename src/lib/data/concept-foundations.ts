import type { StorySection } from './category-stories/types';

export interface FoundationSection {
	id: string;
	title: string;
	sections: StorySection[];
}

export const foundationSections: FoundationSection[] = [
	{
		id: 'what-is-a-protocol',
		title: 'What Is a Protocol?',
		sections: [
			{
				type: 'narrative',
				title: 'Rules for Communication',
				text: `A {{protocol|protocol}} is a set of rules that two systems agree to follow so they can exchange information. When you send a message over the internet, dozens of protocols cooperate — each handling a specific job, like addressing, reliability, or encryption.

Think of human communication: when you call someone, you both agree to speak the same language, take turns talking, and say "hello" before launching into conversation. Network protocols work the same way — they define the format of messages, the order of exchanges, and what to do when something goes wrong.

Protocols are defined in public documents called RFCs (Requests for Comments). Anyone can read them, and anyone can build software that implements them. This openness is what made the internet possible — no single company controls how computers talk to each other.`
			},
			{
				type: 'diagram',
				definition: `graph LR
  A["Client"] -->|"1. SYN"| B["Server"]
  B -->|"2. SYN-ACK"| A
  A -->|"3. ACK"| B
  A -->|"4. Request"| B
  B -->|"5. Response"| A`,
				caption: 'A protocol defines the exact sequence of messages. Here, TCP requires a three-way handshake before any data can flow — both sides must agree on the rules first.'
			},
			{
				type: 'callout',
				title: 'Postel\'s Law',
				text: 'Be conservative in what you send, be liberal in what you accept. This principle, from Jon Postel\'s RFC 760, guided decades of protocol design — send strictly correct messages, but tolerate minor deviations from others.'
			}
		]
	},
	{
		id: 'layer-model',
		title: 'The Layer Model',
		sections: [
			{
				type: 'narrative',
				title: 'Why Layers Exist',
				text: `The {{osi-model|OSI model}} divides networking into 7 layers, while the {{tcp-ip-model|TCP/IP model}} uses 4. Both exist to separate concerns — each layer handles one job and doesn't worry about the others.

Layer 1 (Physical) moves raw bits over cables or radio. Layer 2 (Data Link) handles local delivery using {{mac-address|MAC addresses}} — this is where [[ethernet|Ethernet]] and [[wifi|Wi-Fi]] operate. Layer 3 (Network) routes {{packet|packets}} across networks using {{ip-address|IP addresses}} — the domain of [[ip|IPv4]] and [[ipv6|IPv6]]. Layer 4 (Transport) provides end-to-end communication — [[tcp|TCP]] for reliability, [[udp|UDP]] for speed. Layers 5-7 (Session, Presentation, Application) handle everything above — [[tls|TLS]] encryption, [[http1|HTTP]] requests, and the apps you interact with.

In practice, the 4-layer TCP/IP model is what the internet actually uses: Link (Layers 1-2), Internet (Layer 3), Transport (Layer 4), and Application (Layers 5-7). The OSI model is a teaching tool; TCP/IP is the implementation.`
			},
			{
				type: 'diagram',
				title: 'OSI vs TCP/IP',
				definition: `graph TD
  O7["7 — Application"] --> O6["6 — Presentation"] --> O5["5 — Session"] --> O4["4 — Transport"] --> O3["3 — Network"] --> O2["2 — Data Link"] --> O1["1 — Physical"]
  T4["Application ≈ 5-7"] -.->|maps to| O7
  T3["Transport ≈ 4"] -.->|maps to| O4
  T2["Internet ≈ 3"] -.->|maps to| O3
  T1["Link ≈ 1-2"] -.->|maps to| O2`,
				caption: 'Left: the 7-layer OSI reference model. Right: the 4-layer TCP/IP model that the internet actually uses, with dotted lines showing how they map.'
			},
			{
				type: 'callout',
				title: 'Layers Are a Mental Model',
				text: 'The layer model is a way to think about networking, not a physical boundary. Real protocols sometimes span multiple layers (QUIC combines transport + encryption), and the lines between layers can blur. But the mental model remains invaluable for understanding how the pieces fit together.'
			}
		]
	},
	{
		id: 'addressing',
		title: 'Addressing & Identity',
		sections: [
			{
				type: 'narrative',
				title: 'How Data Finds Its Destination',
				text: `Every device on a network needs identifiers at multiple levels, and each serves a different purpose:

**{{mac-address|MAC addresses}}** identify hardware on a local network. Your laptop's Wi-Fi card has a unique 48-bit MAC address (like AA:BB:CC:DD:EE:FF). These only matter on the local network — they change at every router hop.

**{{ip-address|IP addresses}}** identify devices across the internet. Your router has a public IP (like 203.0.113.42) assigned by your ISP. Unlike MAC addresses, IP addresses stay constant from source to destination.

**{{port|Ports}}** identify applications on a machine. When a packet arrives at your computer, the port number tells the operating system which program should receive it — port 80 for HTTP, 443 for HTTPS, 22 for SSH.

**Hostnames** (like google.com) are human-readable names. {{dns-resolution|DNS resolution}} translates them into IP addresses before any communication begins.

Together: DNS resolves the hostname → IP routes the packet to the machine → [[arp|ARP]] resolves the IP to a MAC on the local network → the port delivers it to the right application.`
			},
			{
				type: 'diagram',
				title: 'Layers of Addressing',
				definition: `graph TD
  DNS["Hostname: google.com"] -->|"DNS resolves"| IP["IP: 142.250.80.46"]
  IP -->|"ARP resolves"| MAC["MAC: AA:BB:CC:DD:EE:FF"]
  MAC -->|"delivered to"| Port[":443 → Web Browser"]`,
				caption: 'Each identifier operates at a different layer: hostnames for humans, IP for routing, MAC for local delivery, ports for the right application.'
			}
		]
	},
	{
		id: 'packets',
		title: 'Packets & Encapsulation',
		sections: [
			{
				type: 'narrative',
				title: 'What Is a Packet?',
				text: `Data on the internet doesn't travel as continuous streams — it's broken into {{packet|packets}}. Each packet is a self-contained unit with a header (control information) and a payload (the actual data). This is called packet switching, and it's what makes the internet fundamentally different from the old telephone network.

As data moves down the network stack, each layer wraps the previous layer's output in its own header — this is {{encapsulation|encapsulation}}. Your HTTP request becomes a TCP {{segment|segment}} (adding port numbers and sequence numbers), then an IP packet (adding IP addresses and TTL), then an Ethernet {{frame|frame}} (adding MAC addresses and a checksum).

At the destination, the process reverses: each layer strips its header and passes the payload up to the next layer, until the application receives the original HTTP request.

Different layers use different names for their data units: {{frame|frames}} at Layer 2, {{packet|packets}} at Layer 3, {{segment|segments}} (TCP) or {{datagram|datagrams}} (UDP) at Layer 4. They all describe the same concept — a header plus a payload — at different levels of the stack.`
			},
			{
				type: 'diagram',
				title: 'Encapsulation — Layer by Layer',
				definition: `graph TD
  D["HTTP Data: GET /index.html"]
  S["TCP Segment: Ports + Seq# + HTTP Data"]
  P["IP Packet: IP Addrs + TCP Segment"]
  F["Ethernet Frame: MACs + IP Packet + Checksum"]
  D -->|"TCP wraps"| S
  S -->|"IP wraps"| P
  P -->|"Ethernet wraps"| F`,
				caption: 'Each layer adds its own header around the payload from above. At the destination, headers are stripped in reverse order.'
			}
		]
	},
	{
		id: 'ports-sockets',
		title: 'Ports & Sockets',
		sections: [
			{
				type: 'narrative',
				title: 'Multiplexing Applications',
				text: `A single machine can run dozens of network services simultaneously — a web server, an SSH daemon, a database. {{port|Ports}} are 16-bit numbers (0–65535) that let the OS route incoming packets to the correct application.

**Well-known ports** (0–1023) are reserved for standard services: 80 for HTTP, 443 for HTTPS, 22 for SSH, 53 for DNS. **Ephemeral ports** (typically 49152–65535) are assigned temporarily to the client side of a connection. When your browser opens a connection to a web server, it picks a random ephemeral port as its source.

A {{socket|socket}} combines an IP address, a port, and a protocol (TCP or UDP) into a single endpoint. A TCP connection is uniquely identified by four values: source IP, source port, destination IP, destination port. This is why a web server on port 443 can handle thousands of simultaneous connections — each client uses a different source port.`
			},
			{
				type: 'diagram',
				title: 'Ports Multiplex Applications',
				definition: `graph TD
  Net["Incoming Packet<br/>dst: 10.0.0.5"]
  OS["Operating System"]
  Net --> OS
  OS -->|":80"| W["Web Server"]
  OS -->|":443"| S["HTTPS Server"]
  OS -->|":22"| SSH["SSH Daemon"]
  OS -->|":5432"| DB["Database"]`,
				caption: 'The OS uses port numbers to deliver packets to the correct application. Multiple services share one IP address.'
			},
			{
				type: 'callout',
				title: 'Why Port 80 and 443?',
				text: 'Tim Berners-Lee chose port 80 for HTTP in 1991 because it was available and easy to remember. When HTTPS needed its own port, 443 was assigned. These choices were somewhat arbitrary — but now they\'re burned into firewalls, CDNs, and browser defaults worldwide.'
			}
		]
	},
	{
		id: 'reliability-speed',
		title: 'Reliability vs Speed',
		sections: [
			{
				type: 'narrative',
				title: 'The Fundamental Tradeoff',
				text: `Every network protocol makes a tradeoff between reliability and speed. This is the most important design decision in networking.

**{{connection-oriented|Connection-oriented}}** protocols like [[tcp|TCP]] establish a session before sending data. They guarantee every byte arrives, in order, with no duplicates. The cost: {{handshake|handshakes}} add {{latency|latency}}, {{retransmission|retransmissions}} add delay, and {{flow-control|flow control}} limits throughput.

**{{connectionless|Connectionless}}** protocols like [[udp|UDP]] skip all of that. Each {{datagram|datagram}} is independent — no connection setup, no ordering guarantees, no retransmission. The benefit: minimal latency and overhead. The cost: your application must handle lost or reordered data.

This tradeoff drives the entire protocol ecosystem. Web pages need reliability → TCP. Video calls need low latency → UDP (or RTP over UDP). Modern protocols like [[quic|QUIC]] try to offer both — reliable delivery when needed, with minimal latency by building on UDP and adding selective retransmission.`
			},
			{
				type: 'diagram',
				title: 'The Reliability Spectrum',
				definition: `graph LR
  UDP["UDP<br/>No guarantees<br/>Lowest latency"] ---|"+"| RTP["RTP/QUIC<br/>Selective reliability<br/>Low latency"]
  RTP ---|"+"| TCP["TCP<br/>Full reliability<br/>Higher latency"]`,
				caption: 'Protocols sit on a spectrum from raw speed (UDP) to guaranteed delivery (TCP). Modern protocols like QUIC aim for the sweet spot in between.'
			}
		]
	},
	{
		id: 'client-server-p2p',
		title: 'Client-Server vs Peer-to-Peer',
		sections: [
			{
				type: 'narrative',
				title: 'Two Communication Patterns',
				text: `The {{client-server|client-server model}} is the dominant pattern on the internet. A client (your browser) sends requests to a server (Google's data center), which processes them and sends responses. The server has a known address; clients connect to it. HTTP, DNS, email, databases — nearly everything follows this pattern.

The {{peer-to-peer|peer-to-peer (P2P)}} model is fundamentally different. Every participant is both client and server. Nodes connect directly to each other without a central authority. BitTorrent, blockchain, and [[webrtc|WebRTC]] video calls use P2P.

P2P is harder to build (you need to solve discovery, {{nat|NAT}} traversal, and trust) but has advantages: no single point of failure, no central server costs, and data stays between participants. [[webrtc|WebRTC]] uses STUN/TURN servers to punch through NATs, then establishes direct peer-to-peer media streams.

Many real systems are hybrids: Zoom uses a central server for group calls but P2P for one-on-one. Discord uses a server-based SFU (Selective Forwarding Unit) architecture for all voice, video, and screen sharing — routing media through servers to protect users' IP addresses and handle groups efficiently. The choice depends on scale, privacy needs, and complexity tolerance.`
			},
			{
				type: 'diagram',
				title: 'Client-Server vs Peer-to-Peer',
				definition: `graph TD
  subgraph CS["Client-Server Model"]
    C1["Client A"] & C2["Client B"] & C3["Client C"] -->|request| SRV["Server"]
  end
  subgraph P2P["Peer-to-Peer Model"]
    P1["Peer A"] <--> P2["Peer B"]
    P2 <--> P3["Peer C"]
    P3 <--> P1
  end
  CS ~~~ P2P`,
				caption: 'Client-server centralizes control through one authority. P2P connects nodes directly — more resilient but harder to coordinate.'
			}
		]
	},
	{
		id: 'encryption-basics',
		title: 'Encryption Basics',
		sections: [
			{
				type: 'narrative',
				title: 'Protecting Data in Transit',
				text: `{{encryption|Encryption}} converts readable data into unreadable ciphertext. Only someone with the correct key can decrypt it. Without encryption, anyone on the network path — your ISP, a coffee shop Wi-Fi hacker, a compromised router — can read your data.

**{{symmetric-encryption|Symmetric encryption}}** uses one key for both encrypting and decrypting. AES-256 and ChaCha20 are common examples. It's fast — modern CPUs encrypt at gigabits per second — but both sides must share the same secret key somehow.

**{{asymmetric-encryption|Asymmetric encryption}}** solves the key-sharing problem with two keys: a {{public-key|public key}} (shared openly) and a {{private-key|private key}} (kept secret). Anyone can encrypt with your public key, but only your private key can decrypt it. RSA and ECDH are common examples. It's much slower than symmetric.

[[tls|TLS]] combines both: asymmetric encryption exchanges a shared secret during the {{tls-handshake|handshake}}, then both sides switch to fast symmetric encryption for the actual data. This is why HTTPS is nearly as fast as HTTP.

**{{certificate|Certificates}}** bind a public key to an identity (like a domain name). A {{certificate-chain|chain of trust}} connects server certificates to trusted root Certificate Authorities pre-installed in your browser. This {{pki|PKI}} system is what makes the padlock icon possible.`
			},
			{
				type: 'diagram',
				title: 'TLS Hybrid Encryption',
				definition: `graph LR
  subgraph Handshake["Key Exchange — Asymmetric"]
    C["Client"] -->|"public key"| S["Server"]
    S -->|"certificate + key"| C
  end
  subgraph Data["Data Transfer — Symmetric"]
    C2["Client"] <-->|"AES/ChaCha20 encrypted"| S2["Server"]
  end
  Handshake -->|"shared secret"| Data`,
				caption: 'TLS uses slow asymmetric crypto to safely exchange a key, then switches to fast symmetric encryption for all data.'
			},
			{
				type: 'callout',
				title: 'Why Not Just Use Asymmetric for Everything?',
				text: 'Asymmetric encryption is roughly 1000x slower than symmetric. TLS uses it only for the initial key exchange (a few hundred bytes), then switches to AES or ChaCha20 for the actual data transfer. This hybrid approach gives you the best of both worlds.'
			}
		]
	},
	{
		id: 'ai-protocols',
		title: 'Protocols for AI Agents',
		sections: [
			{
				type: 'narrative',
				title: 'A New Layer of Communication',
				text: `For decades, protocols connected humans to servers ([[http1|HTTP]]), humans to humans (email, chat), and machines to machines (RPC, messaging). Starting in 2024, a new class of protocols emerged — ones designed for AI agents to use tools and collaborate with each other.

The catalyst was an integration problem. Every AI application needed custom code for every external tool — connecting an AI to a database was a different project than connecting it to GitHub, which was different from Slack. With N AI hosts and M tools, you needed N×M bespoke integrations.

Two complementary protocols solved this. [[mcp|MCP]] (Model Context Protocol) provides a universal interface between AI agents and their tools — define a tool once as an MCP server, and any AI host can use it. [[a2a|A2A]] (Agent-to-Agent Protocol) lets AI agents discover and delegate tasks to each other. MCP is vertical (agent → tools). A2A is horizontal (agent ↔ agent). Both are built on [[json-rpc|JSON-RPC]] 2.0 — the same minimal RPC format that has been quietly powering language servers, blockchain nodes, and editor tooling for years.`
			},
			{
				type: 'diagram',
				title: 'The AI Protocol Stack',
				definition: `graph TD
  U["User / AI Application"]
  U -->|"MCP"| T["Tools & Data Sources"]
  U -->|"A2A"| A["Other AI Agents"]
  A -->|"MCP"| T2["Agent's Own Tools"]
  subgraph Wire["Wire Format"]
    JR["JSON-RPC 2.0"]
  end
  subgraph Transport["Transport Layer"]
    HTTP["HTTP + SSE"]
    STDIO["stdio (local)"]
  end
  Wire -.-> Transport`,
				caption: 'AI protocols sit at the application layer, using JSON-RPC as their wire format and HTTP (or stdio) as their transport. MCP connects agents to tools; A2A connects agents to each other.'
			},
			{
				type: 'callout',
				title: 'Same Principles, New Domain',
				text: 'AI protocols follow the same design principles as their predecessors: capability discovery (like [[dns|DNS]]), request-response messaging (like [[http1|HTTP]]), stateful sessions (like [[tcp|TCP]]), and streaming (like [[sse|SSE]]). The innovation isn\'t in the transport mechanics — it\'s in defining a universal contract between AI agents and the world they interact with.'
			}
		]
	}
];

const sectionMap = new Map(foundationSections.map((s) => [s.id, s]));

export function getFoundationSection(id: string): FoundationSection | undefined {
	return sectionMap.get(id);
}
