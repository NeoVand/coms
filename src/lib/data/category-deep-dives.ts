import type { StorySection } from './category-stories/types';

export interface CategoryDeepDive {
	categoryId: string;
	tagline: string;
	sections: StorySection[];
}

export const categoryDeepDives: CategoryDeepDive[] = [
	{
		categoryId: 'network-foundations',
		tagline:
			'Advanced Layer 2-3 topics — VLANs, spanning tree, IPv6 migration, ARP security, and enterprise switching.',
		sections: [
			{
				type: 'narrative',
				title: 'VLANs and Network Segmentation',
				text: `In a flat Layer 2 network, every device can see every other device's {{broadcast|broadcast}} traffic. VLANs (Virtual LANs, IEEE 802.1Q) solve this by logically partitioning a physical switch into separate {{broadcast|broadcast}} domains. A single 48-port switch can operate as if it were multiple independent switches.

{{vlan|VLAN}} tagging inserts a 4-byte header into {{frame|Ethernet frames}}, containing a 12-bit {{vlan|VLAN}} ID (1-4094). Trunk ports carry frames from multiple VLANs between switches; access ports strip the tag and connect to end devices. Inter-{{vlan|VLAN}} {{routing-table|routing}} requires a Layer 3 device -- either a router on a stick or a Layer 3 switch.

VLANs are essential for security (isolating guest [[wifi|WiFi]] from the corporate network), performance (reducing {{broadcast|broadcast}} storms), and compliance (PCI DSS requires cardholder data on its own {{subnet|subnet}}).`
			},
			{
				type: 'diagram',
				title: 'VLAN Tagging and Trunk Architecture',
				caption: `How 802.1Q {{vlan|VLAN}} tagging works across trunk and access ports. Frames are tagged with {{vlan|VLAN}} IDs on trunk links and stripped on access ports connecting to end devices.`,
				definition: `graph TD
    subgraph Switch_A["Switch A"]
        A_AP1["Access Port<br/>{{vlan|VLAN}} 10<br/>Engineering"]
        A_AP2["Access Port<br/>{{vlan|VLAN}} 20<br/>Marketing"]
        A_AP3["Access Port<br/>{{vlan|VLAN}} 30<br/>Guest WiFi"]
        A_TRUNK["Trunk Port<br/>802.1Q Tagged<br/>VLANs 10,20,30"]
    end

    subgraph Switch_B["Switch B"]
        B_TRUNK["Trunk Port<br/>802.1Q Tagged<br/>VLANs 10,20,30"]
        B_AP1["Access Port<br/>{{vlan|VLAN}} 10<br/>Engineering"]
        B_AP2["Access Port<br/>VLAN 20<br/>Marketing"]
    end

    subgraph L3["Layer 3 Switch / Router"]
        SVI10["SVI VLAN 10<br/>10.1.10.1/24"]
        SVI20["SVI VLAN 20<br/>10.1.20.1/24"]
        SVI30["SVI VLAN 30<br/>10.1.30.1/24"]
    end

    A_AP1 --- A_TRUNK
    A_AP2 --- A_TRUNK
    A_AP3 --- A_TRUNK
    A_TRUNK -- "Tagged Frames<br/>(VLAN ID in 802.1Q header)" --- B_TRUNK
    B_TRUNK --- B_AP1
    B_TRUNK --- B_AP2
    A_TRUNK --- L3
    SVI10 -.- SVI20
    SVI20 -.- SVI30`
			},
			{
				type: 'narrative',
				title: 'Spanning Tree Protocol (STP)',
				text: `Redundant links between [[ethernet|switches]] are essential for reliability -- but they create loops that cause {{broadcast|broadcast}} storms. Spanning Tree Protocol (IEEE 802.1D) prevents loops by electing a root bridge, calculating the shortest path from every switch to the root, and blocking redundant {{port|ports}}.

Classic STP converges in 30-50 seconds after a topology change -- an eternity for modern networks. Rapid Spanning Tree Protocol (RSTP, IEEE 802.1w) reduces this to 1-2 seconds with proposal/agreement {{handshake|handshakes}}. Multiple Spanning Tree Protocol (MSTP, 802.1s) maps multiple VLANs to fewer spanning tree instances for efficiency.

In modern data centers, STP is increasingly replaced by fabric architectures (VXLAN, EVPN) that eliminate loops at the {{protocol|protocol}} level while allowing all links to carry traffic simultaneously.`
			},
			{
				type: 'narrative',
				title: 'ARP Security',
				text: `[[arp|ARP]] has no authentication -- any device can claim any {{ip-address|IP}}-to-{{mac-address|MAC}} mapping. [[arp|ARP]] {{spoofing|spoofing}} (also called [[arp|ARP]] poisoning) exploits this: an attacker sends fake [[arp|ARP]] replies to redirect traffic through their machine, enabling man-in-the-middle attacks.

Dynamic [[arp|ARP]] Inspection (DAI) is the primary defense. It intercepts [[arp|ARP]] {{packet|packets}} on untrusted ports and validates them against a [[dhcp|DHCP]] snooping binding table. If the [[ip|IP]]-to-MAC mapping doesn't match a legitimate [[dhcp|DHCP]] {{lease|lease}}, the [[arp|ARP]] packet is dropped.

[[ipv6|IPv6]] replaces [[arp|ARP]] entirely with {{ndp|Neighbor Discovery Protocol}} ({{ndp|NDP}}), which runs over [[icmp|ICMPv6]]. While {{ndp|NDP}} has its own {{spoofing|spoofing}} risks, Secure Neighbor Discovery (SEND) uses cryptographic addressing to authenticate neighbor advertisements.`
			},
			{
				type: 'narrative',
				title: 'Wi-Fi Roaming and Mesh',
				text: `When you walk from one room to another, your device must seamlessly switch from one {{access-point|access point}} to another -- this is [[wifi|Wi-Fi]] roaming. Basic roaming is slow: the client must re-authenticate with each {{access-point|AP}}. IEEE 802.11r (Fast BSS Transition) pre-authenticates with target APs, reducing handoff to under 50ms.

802.11k (Radio Resource Management) helps clients discover nearby APs without scanning every channel. 802.11v (BSS Transition Management) lets APs steer clients toward less-congested access points. Together, 802.11r/k/v enable enterprise-grade seamless roaming.

[[wifi|Wi-Fi]] mesh networks (802.11s) take this further -- APs connect to each other wirelessly, forming a self-healing fabric. Each {{access-point|AP}} acts as both an {{access-point|access point}} and a relay, automatically routing traffic along the best path. Consumer mesh systems (Eero, {{google|Google}} [[wifi|WiFi]]) use proprietary versions of this concept.`
			},
			{
				type: 'narrative',
				title: 'BGP Route Policies',
				text: `[[bgp|BGP]] doesn't just {{exchange|exchange}} routes -- operators use policy to control which routes they accept, prefer, and advertise. This is the art of internet traffic engineering.

**Route filtering** uses prefix lists and {{autonomous-system|AS}}-path filters to accept only legitimate routes. Accepting too broadly risks route leaks; filtering too aggressively disconnects networks. The {{rpki|RPKI}} (Resource {{public-key|Public Key}} Infrastructure) system uses {{certificate|cryptographic certificates}} to validate that an {{autonomous-system|AS}} is authorized to announce a prefix.

**Local preference** controls outbound traffic by assigning weights to routes -- higher preference means "prefer this path." **MED (Multi-Exit Discriminator)** hints to neighboring ASes which entry point to use. **{{autonomous-system|AS}}-path prepending** makes a path look longer to discourage inbound traffic through that link.

[[bgp|BGP]] communities tag routes with metadata that triggers policies in other networks. Standard communities (like "no-export") prevent route propagation. Large communities (RFC 8092) enable fine-grained traffic engineering across multi-provider networks.`
			}
		]
	},
	{
		categoryId: 'transport',
		tagline:
			'Congestion control algorithms, flow control mechanics, and the subtle engineering that keeps the internet stable.',
		sections: [
			{
				type: 'narrative',
				title: 'Congestion Control Algorithms',
				text: `{{congestion-control|Congestion control}} is the art of sending data as fast as possible without overwhelming the network. [[tcp|TCP]]'s algorithms have evolved dramatically over four decades.

**[[tcp|TCP]] Tahoe** (1988) introduced {{slow-start|slow start}} and {{congestion-avoidance|congestion avoidance}}. Start with a small {{sliding-window|window}}, double it each {{rtt|RTT}} ({{slow-start|slow start}}), then switch to linear growth after detecting congestion. On {{packet|packet}} loss, reset the window to 1 -- devastating for performance.

**[[tcp|TCP]] Reno** (1990) added fast recovery: on triple duplicate {{ack|ACKs}}, halve the window instead of resetting to 1. This simple change dramatically improved throughput.

**{{cubic|CUBIC}}** (2006, {{linux|Linux}} default since 2.6.19) uses a {{cubic|cubic}} function for window growth -- aggressive probing for {{bandwidth|bandwidth}} followed by a gentle approach near the last-known capacity. It's the most widely deployed algorithm today.

**{{bbr|BBR}}** (2016, {{google|Google}}) took a fundamentally different approach. Instead of reacting to loss, {{bbr|BBR}} actively measures the bottleneck {{bandwidth|bandwidth}} and minimum {{rtt|RTT}}, then paces {{segment|packets}} to match the path capacity. It performs dramatically better on long-distance, high-{{bandwidth|bandwidth}} links.`
			},
			{
				type: 'diagram',
				title: 'Congestion Window Growth: Tahoe vs Reno vs CUBIC vs BBR',
				caption: `How different {{congestion-control|congestion control}} algorithms grow and adjust their sending window. Loss-based algorithms (Tahoe, Reno, {{cubic|CUBIC}}) react to packet loss, while {{bbr|BBR}} probes the actual bottleneck {{bandwidth|bandwidth}}.`,
				definition: `graph TD
    START["Connection Start<br/>cwnd = 1 MSS"] --> SS["{{slow-start|Slow Start}} Phase<br/>cwnd doubles each RTT"]
    SS --> THRESH{"Hit ssthresh<br/>or loss?"}

    THRESH -- "Loss (Tahoe)" --> TAHOE_RESET["Reset cwnd = 1<br/>ssthresh = cwnd/2<br/>Restart {{slow-start|Slow Start}}"]
    TAHOE_RESET --> SS

    THRESH -- "3 Dup ACKs (Reno)" --> RENO_HALF["Halve cwnd<br/>ssthresh = cwnd/2<br/>Fast Recovery"]
    RENO_HALF --> RENO_CA["{{congestion-avoidance|Congestion Avoidance}}<br/>Linear growth +1 MSS/RTT"]

    THRESH -- "ssthresh ({{cubic|CUBIC}})" --> CUBIC_CA["{{cubic|CUBIC}} Function<br/>W(t) = C(t - K)^3 + Wmax<br/>Aggressive probe + gentle plateau"]
    CUBIC_CA -- "Loss" --> CUBIC_MULT["Multiplicative Decrease<br/>Wmax = cwnd * 0.7"]
    CUBIC_MULT --> CUBIC_CA

    THRESH -- "BBR (no loss trigger)" --> BBR_PROBE["Probe {{bandwidth|Bandwidth}}<br/>Measure BtlBw + RTprop"]
    BBR_PROBE --> BBR_PACE["Pace at BtlBw * gain<br/>cwnd = BtlBw * RTprop * 2"]
    BBR_PACE -- "Periodic probe" --> BBR_PROBE`
			},
			{
				type: 'narrative',
				title: 'Flow Control Deep Dive',
				text: `{{flow-control|Flow control}} prevents a fast sender from overwhelming a slow receiver. [[tcp|TCP]]'s {{sliding-window|sliding window}} is elegant: the receiver advertises its available buffer space (the "receive window") in every {{ack|ACK}}.

If the receiver's window shrinks to zero, the sender must stop. To avoid deadlock (the sender waiting for a window update that gets lost), [[tcp|TCP]] uses persist timers -- small probe {{packet|packets}} sent periodically to check if the window has reopened.

Window scaling ([[rfc:7323|RFC 7323]]) extends the 16-bit window field beyond 65KB using a scale factor negotiated during the {{handshake|handshake}}. Without it, high-{{bandwidth|bandwidth}} long-distance links would be limited to 65KB x (1/{{rtt|RTT}}) throughput -- roughly 5 Mbps on a 100ms {{rtt|RTT}} path.

{{nagle|Nagle's algorithm}} (RFC 896) coalesces small writes into larger {{segment|segments}} to reduce overhead -- but it interacts badly with delayed ACKs, causing 200ms {{latency|latency}} spikes. Most interactive applications disable it with TCP_NODELAY.`
			},
			{
				type: 'callout',
				title: 'The Bufferbloat Problem',
				text: 'Oversized router buffers (often hundreds of megabytes) let queues grow enormous before any {{packet|packets}} are dropped. {{congestion-control|Congestion control}} algorithms that rely on loss as a signal (Tahoe, Reno, {{cubic|CUBIC}}) don\'t react until buffers overflow -- by which point {{latency|latency}} has ballooned from 10ms to 1000ms. This "{{bufferbloat|bufferbloat}}" is why your internet feels slow when someone starts a big download. Solutions: {{aqm|Active Queue Management}} (CoDel, PIE, fq_codel) and algorithms like {{bbr|BBR}} that measure {{latency|latency}} instead of waiting for loss.'
			},
			{
				type: 'narrative',
				title: 'TCP Fast Open',
				text: `Standard [[tcp|TCP]] requires a full {{rtt|RTT}} for the three-way {{handshake|handshake}} before any data can flow. [[tcp|TCP]] Fast Open (TFO, RFC 7413) allows data in the SYN {{packet|packet}} itself.

On the first {{connection-oriented|connection}}, the server sends a {{cookie|cookie}} in the SYN-{{ack|ACK}}. On subsequent connections, the client includes this {{cookie|cookie}} and application data in the SYN. The server can process the data immediately, saving one full {{rtt|RTT}}.

TFO is widely deployed ({{linux|Linux}}, macOS, iOS) but faces challenges: middleboxes sometimes strip the TFO option, and {{idempotent|idempotency}} is required (the SYN data might be delivered twice). Despite this, it provides measurable {{latency|latency}} improvements for short-lived connections like web requests.`
			}
		]
	},
	{
		categoryId: 'web-api',
		tagline:
			'HTTP caching, CORS, header compression, JSON-RPC internals, MCP architecture, A2A discovery, and the mechanics beneath modern web and AI APIs.',
		sections: [
			{
				type: 'narrative',
				title: 'HTTP Caching In Depth',
				text: `Caching is the most impactful performance optimization in the [[http1|HTTP]] stack. The {{cache-control|Cache-Control}} {{header|header}} drives everything.

**max-age=3600** means "this response is fresh for 3600 seconds." **no-cache** means "always revalidate with the server." **no-store** means "never store this response." **private** vs **public** controls whether CDNs and shared proxies can cache the response.

Conditional requests avoid re-downloading unchanged resources. The server sends {{etag|ETag}} (a content fingerprint) or Last-Modified headers. On subsequent requests, the client sends If-None-Match or If-Modified-Since. If unchanged, the server responds with a {{status-code|304 Not Modified}} -- no body, saving {{bandwidth|bandwidth}}.

**stale-while-revalidate** (RFC 5861) is a modern gem: serve the stale cached version immediately while asynchronously checking for updates. The user gets instant responses; the cache stays fresh. Combined with CDNs, this pattern enables sub-10ms {{latency|response times}} globally.`
			},
			{
				type: 'narrative',
				title: 'CORS Mechanics',
				text: `{{cors|Cross-Origin Resource Sharing}} ({{cors|CORS}}) is the browser's security mechanism for controlling cross-origin {{http-method|HTTP}} requests. When JavaScript on example.com tries to fetch from api.other.com, the browser intervenes.

**Simple requests** (GET, POST with standard {{header|headers}}) send the request directly with an Origin header. The server responds with Access-Control-Allow-Origin -- if it matches, the browser allows JavaScript to read the response.

**Preflight requests** are triggered by custom headers, PUT/DELETE {{http-method|methods}}, or non-standard Content-Types. The browser sends an OPTIONS request first, asking "is this allowed?" The server responds with allowed methods, headers, and credentials policy. Only then does the actual {{request-response|request}} proceed.

The preflight result is cached (Access-Control-Max-Age), but misconfigured {{cors|CORS}} headers are one of the most common sources of frustration in web development. Overly permissive {{cors|CORS}} ("Allow-Origin: *") is a security risk; overly restrictive {{cors|CORS}} blocks legitimate integrations.`
			},
			{
				type: 'diagram',
				title: 'CORS Preflight Flow',
				caption: `The browser's decision process for cross-origin requests. Simple requests go directly, while requests with custom headers or non-standard methods trigger a preflight OPTIONS check.`,
				definition: `graph TD
    REQ["JavaScript makes<br/>cross-origin fetch()"] --> CHECK{"Simple request?<br/>GET/POST, standard headers,<br/>no custom Content-Type"}

    CHECK -- "Yes" --> SIMPLE["Send request directly<br/>with Origin header"]
    SIMPLE --> SRES{"Server responds with<br/>Access-Control-Allow-Origin?"}
    SRES -- "Origin matches" --> ALLOW["Browser exposes<br/>response to JavaScript"]
    SRES -- "Missing or mismatch" --> BLOCK["Browser blocks response<br/>{{cors|CORS}} error in console"]

    CHECK -- "No" --> PREFLIGHT["Browser sends<br/>OPTIONS preflight request<br/>Origin + Access-Control-Request-Method<br/>+ Access-Control-Request-Headers"]
    PREFLIGHT --> PRES{"Server responds with<br/>allowed methods, headers,<br/>credentials policy?"}
    PRES -- "Allowed" --> CACHE["Cache preflight result<br/>(Access-Control-Max-Age)"]
    CACHE --> ACTUAL["Send actual request<br/>with Origin header"]
    ACTUAL --> SRES
    PRES -- "Denied / missing headers" --> BLOCK`
			},
			{
				type: 'narrative',
				title: 'HPACK and QPACK Compression',
				text: `{{header|HTTP headers}} are repetitive -- {{cookie|Cookie}}, User-Agent, Accept, and dozens of others are sent identically on every request. [[http2|HTTP/2]]'s {{hpack|HPACK}} compression reduces header overhead by 85-90%.

{{hpack|HPACK}} maintains a dynamic table shared between {{client-server|client and server}}. Previously-seen header key-value pairs are referenced by index instead of retransmitted. A static table of 61 common headers (like ":method: GET") is pre-populated. Huffman coding further compresses literal values.

[[http3|HTTP/3]] couldn't use {{hpack|HPACK}} because it requires in-order delivery (the dynamic table is a {{stream|stream}} of updates). QPACK solves this with a separate, unidirectional stream for table updates, allowing header blocks to be decoded independently -- eliminating {{head-of-line-blocking|head-of-line blocking}} in header decompression.

This matters because [[http2|HTTP/2]] over [[tcp|TCP]] still suffers from transport-level {{head-of-line-blocking|head-of-line blocking}} -- a single lost {{packet|packet}} stalls all {{multiplexing|multiplexed}} streams. [[http3|HTTP/3]] over [[quic|QUIC]] solves this at the transport layer, and QPACK ensures header decompression doesn't reintroduce it.`
			},
			{
				type: 'narrative',
				title: 'JSON-RPC 2.0 — The Universal Wire Format',
				text: `[[json-rpc|JSON-RPC]] 2.0 is deceptively simple — four message types (request, response, error, {{notification|notification}}) and a handful of rules — but this simplicity is its power. It has become the wire format of choice for systems that need structured RPC without the overhead of [[rest|REST]]'s resource-oriented model or [[grpc|gRPC]]'s binary {{serialization|serialization}}.

The protocol's design is worth studying. Every request carries an "id" field that the server echoes back in the response, enabling correlation on any transport — even ones that deliver messages out of order. Notifications omit the id entirely, {{signaling|signaling}} that no response is expected. The server MUST NOT reply to a {{notification|notification}} — this isn't a convention, it's a protocol rule.

Batch requests (sending an array of calls) are one of [[json-rpc|JSON-RPC]]'s killer features. A client can bundle multiple independent calls into a single [[http1|HTTP]] POST, and the server returns an array of results. Notifications in a batch produce no response entry. The server may process batch items in any order and return results in any order — the id fields handle correlation. This makes {{json|JSON}}-RPC remarkably efficient for chatty {{client-server|client-server}} interactions.

Error codes follow a structured convention: -32700 (parse error), -32600 (invalid request), -32601 (method not found), -32602 (invalid params), -32603 (internal error). The range -32768 to -32000 is reserved for the spec; applications define their own codes outside this range.`
			},
			{
				type: 'narrative',
				title: 'MCP Architecture — Hosts, Clients, and Servers',
				text: `[[mcp|MCP]]'s architecture has three layers that are often conflated: the host, the client, and the server. Understanding the distinction is essential for building robust integrations.

The **host** is the AI application the user interacts with — Claude Desktop, Cursor, VS Code, or a custom agent. The host manages user consent, enforces security policies, and decides which [[mcp|MCP]] servers to connect to. It creates one [[mcp|MCP]] **client** per server connection. Each client maintains an independent session with exactly one [[mcp|MCP]] **server** — there's a strict 1:1 relationship.

[[mcp|MCP]] servers expose three primitives: **tools** (model-controlled actions like "run SQL query"), **resources** (application-controlled data like "contents of file X"), and **prompts** (user-controlled templates like "summarize this codebase"). The distinction matters for permission models: tools require explicit user approval per invocation, resources can be loaded automatically, and prompts are selected by the user.

The session lifecycle follows a strict sequence: the client sends \`initialize\` with its capabilities, the server responds with its own capabilities (supported primitives, protocol version), then the client sends an \`initialized\` {{notification|notification}}. Only after this three-step {{handshake|handshake}} can tools be listed, resources read, or prompts invoked. The {{handshake|handshake}} uses capability negotiation — if a server doesn't declare tool support, the client won't attempt tool calls.

Transport is pluggable: **stdio** for local processes (the server is a subprocess communicating over stdin/stdout), **Streamable HTTP** for remote servers (a single HTTP endpoint that handles both {{request-response|request-response}} and server-initiated events via [[sse|SSE]] streams). The protocol is transport-agnostic by design — the same [[json-rpc|JSON-RPC]] messages work identically over either transport.`
			},
			{
				type: 'diagram',
				title: 'MCP Session Lifecycle',
				caption: 'The full [[mcp|MCP]] session from initialization through tool invocation. The three-step {{handshake|handshake}} establishes capabilities before any tool or resource access.',
				definition: `graph TD
  I["initialize request<br/>(client capabilities, version)"] --> IR["initialize response<br/>(server capabilities, tools, resources)"]
  IR --> N["initialized {{notification|notification}}<br/>({{handshake|handshake}} complete)"]
  N --> D["Discovery Phase"]
  D --> TL["tools/list"]
  D --> RL["resources/list"]
  D --> PL["prompts/list"]
  TL --> TC["tools/call<br/>(user-approved invocation)"]
  TC --> TR["Tool Result<br/>(content array)"]
  TR --> TC`
			},
			{
				type: 'narrative',
				title: 'A2A — Agent Discovery and Task Delegation',
				text: `[[a2a|A2A]]'s design solves a different problem than [[mcp|MCP]]: not "how does an agent use a tool?" but "how does one agent find and delegate work to another agent it has never interacted with?"

Discovery centers on the **Agent Card** — a {{json|JSON}} document served at \`/.well-known/agent.{{json|json}}\`. It declares the agent's name, description, supported skills, authentication requirements, and the [[a2a|A2A]] endpoint URL. A client agent fetches the card, inspects the skills array, and decides whether this remote agent can help with the task at hand. This is analogous to how [[dns|DNS]] TXT records or [[oauth2|OAuth]] discovery documents work — a well-known URL that bootstraps trust.

The interaction model is task-based. The client sends a message (containing text, files, or structured data as "Parts"), and the server creates a Task with a lifecycle: \`submitted → working → input-required → completed\` (or \`failed\` / \`canceled\`). The \`input-required\` state is what makes [[a2a|A2A]] conversational — the remote agent can ask for clarification before proceeding, and the client can send follow-up messages.

For long-running tasks, [[a2a|A2A]] supports **[[sse|SSE]] streaming**. The client adds \`Accept: text/event-stream\` to its request, and the server streams back task status updates, intermediate messages, and final artifacts as [[sse|Server-Sent Events]]. Each [[sse|SSE]] event contains a full [[json-rpc|JSON-RPC]] response — the same message format used for synchronous responses, just delivered incrementally. This reuse of [[json-rpc|JSON-RPC]] over [[sse|SSE]] is a pattern shared with [[mcp|MCP]]'s Streamable [[http1|HTTP]] transport.`
			},
			{
				type: 'narrative',
				title: 'MCP + A2A — The Two-Protocol Pattern',
				text: `In production systems, [[mcp|MCP]] and [[a2a|A2A]] are almost always used together. The pattern is consistent: [[a2a|A2A]] for inter-agent coordination, [[mcp|MCP]] for each agent's internal tool access.

Consider a travel booking system. A coordinator agent receives "book me a trip to Tokyo." It uses [[a2a|A2A]] to discover and delegate to a flight agent, a hotel agent, and a car rental agent. Each specialist agent uses [[mcp|MCP]] internally to connect to its own tools — the flight agent's [[mcp|MCP]] servers talk to airline APIs, fare databases, and seat maps. The coordinator doesn't know or care about these internal tools; it only sees [[a2a|A2A]] task results.

Both protocols chose [[json-rpc|JSON-RPC]] 2.0 as their wire format for the same reasons: transport independence, built-in request correlation (via id fields), first-class {{notification|notifications}} for fire-and-forget events, and batch support. Both use [[sse|SSE]] for server-to-client streaming. Both moved to the {{linux|Linux}} Foundation for open governance.

The key architectural insight is that [[mcp|MCP]] and [[a2a|A2A]] operate at different levels of abstraction. [[mcp|MCP]] is like a function call — "execute this tool with these parameters and return the result." [[a2a|A2A]] is like a work order — "here's what I need done; figure out how to do it and get back to me." This distinction maps cleanly to the difference between deterministic tool execution and autonomous agent reasoning.`
			}
		]
	},
	{
		categoryId: 'async-iot',
		tagline:
			'QoS semantics, broker architectures, exactly-once delivery, and event sourcing patterns at scale.',
		sections: [
			{
				type: 'narrative',
				title: 'QoS Levels In Depth',
				text: `[[mqtt|MQTT]]'s three {{qos|Quality of Service}} levels represent a fundamental tradeoff between reliability and overhead:

**QoS 0 (At Most Once)**: Fire and forget. The publisher sends the message once and doesn't wait for confirmation. Fastest, lowest overhead, but messages can be lost. Suitable for sensor readings where the next update obsoletes the previous one.

**QoS 1 (At Least Once)**: The {{broker|broker}} acknowledges with PUBACK. If the publisher doesn't receive it, it retransmits. Guarantees delivery but may deliver duplicates. The subscriber must handle {{idempotent|idempotency}} -- or accept occasional duplicate processing.

**QoS 2 (Exactly Once)**: A four-step {{handshake|handshake}} (PUBLISH, PUBREC, PUBREL, PUBCOMP) ensures no duplicates and no loss. The most reliable but 4x the overhead. Used for billing events, financial transactions, and control commands where duplicates are unacceptable.`
			},
			{
				type: 'diagram',
				title: 'Message Broker Architecture Patterns',
				caption: `Two fundamental broker patterns: centralized brokers (like RabbitMQ) with smart routing, and distributed commit logs (like [[kafka|Kafka]]) with consumer-tracked offsets.`,
				definition: `graph TD
    subgraph Central["Centralized Broker (RabbitMQ / [[amqp|AMQP]])"]
        P1["Producer A"] --> EX["{{exchange|Exchange}}<br/>(routing rules)"]
        P2["Producer B"] --> EX
        EX -- "{{topic|topic}} match" --> Q1["Queue 1<br/>(orders)"]
        EX -- "fanout" --> Q2["Queue 2<br/>(notifications)"]
        EX -- "headers" --> Q3["Dead Letter Queue"]
        Q1 --> C1["Consumer 1"]
        Q2 --> C2["Consumer 2"]
        Q2 --> C3["Consumer 3"]
        Q3 --> C4["Admin / Retry"]
    end

    subgraph Distributed["Distributed Commit Log ([[kafka|Kafka]])"]
        KP1["Producer A"] --> T["{{topic|Topic}}: orders<br/>{{partition|Partition}} 0 | {{partition|Partition}} 1 | {{partition|Partition}} 2"]
        KP2["Producer B"] --> T
        T --> CG1["{{consumer-group|Consumer Group}} A<br/>{{offset|offset}}: 42, 38, 50"]
        T --> CG2["{{consumer-group|Consumer Group}} B<br/>{{offset|offset}}: 10, 12, 15<br/>(can replay)"]
    end`
			},
			{
				type: 'narrative',
				title: 'Broker Architectures',
				text: `Message {{broker|brokers}} come in two fundamental flavors:

**Centralized brokers** ([[amqp|RabbitMQ]], Mosquitto, ActiveMQ) route every message through a single logical broker. The broker handles queuing, routing, {{ack|acknowledgments}}, and {{dead-letter-queue|dead-letter}} handling. Simple to reason about but the broker is a single point of failure and a potential bottleneck.

**Distributed commit logs** ([[kafka|Kafka]], Pulsar, Redpanda) store messages in ordered, partitioned, replicated logs. Consumers track their own {{offset|offset}} -- they can replay the entire history or catch up after downtime. Messages are retained for days or weeks, not deleted after delivery. This enables event sourcing, {{stream|stream}} processing, and CQRS patterns.

The choice depends on your messaging pattern: if you need complex routing ({{topic|topic}} exchanges, headers-based filtering, priority queues), a traditional broker excels. If you need ordered, replayable event streams at massive scale, a distributed log is the right tool.`
			},
			{
				type: 'narrative',
				title: 'Exactly-Once Delivery',
				text: `"Exactly once" is the holy grail of messaging -- and the hardest to achieve. The Two Generals Problem proves that {{exactly-once-delivery|exactly-once delivery}} is impossible over an unreliable network. So how do systems claim to offer it?

The trick is **exactly-once processing**, not {{exactly-once-delivery|exactly-once delivery}}. The system may deliver a message multiple times, but it ensures the effect happens only once. Techniques:

**{{idempotent|Idempotent}} producers** ([[kafka|Kafka]]): each message gets a {{sequence-number|sequence number}}. The {{broker|broker}} deduplicates based on producer ID + sequence, discarding {{retransmission|retransmissions}}.

**Transactional outbox**: writes the message and a "processed" flag in the same database transaction. If the transaction commits, the message is processed exactly once. If it rolls back, neither the message nor the side effect persists.

**{{dead-letter-queue|Dead-letter queues}}** catch messages that fail after max retries -- preventing poison messages from blocking the entire queue while preserving them for manual inspection.`
			}
		]
	},
	{
		categoryId: 'realtime-av',
		tagline:
			'Jitter buffers, error correction, adaptive bitrate, codec negotiation, and the engineering behind real-time media.',
		sections: [
			{
				type: 'narrative',
				title: 'Jitter Buffers',
				text: `Network {{jitter|jitter}} -- the variation in {{packet|packet}} arrival times -- is the enemy of smooth audio and video playback. Even if the average {{latency|latency}} is low, irregular arrival times cause gaps and glitches.

{{jitter|Jitter}} buffers smooth this out by introducing a small, intentional delay. Incoming packets are held in a buffer and released at regular intervals, absorbing timing variations. The tradeoff: larger buffers handle more {{jitter|jitter}} but add {{latency|latency}}.

**Static {{jitter|jitter}} buffers** use a fixed delay (e.g., 60ms). Simple but suboptimal -- too small and you get dropouts; too large and the {{latency|latency}} is noticeable. **Adaptive {{jitter|jitter}} buffers** dynamically adjust their size based on observed network conditions, growing during high jitter and shrinking when the network is stable. [[webrtc|WebRTC]]'s NetEQ is a sophisticated adaptive jitter buffer that also handles packet loss concealment.`
			},
			{
				type: 'narrative',
				title: 'Forward Error Correction',
				text: `When [[udp|UDP]] {{datagram|packets}} are lost, the data is gone -- there's no {{retransmission|retransmission}} mechanism. For real-time media, waiting for a retransmit is worse than skipping the lost data. Forward Error Correction (FEC) adds redundant data so the receiver can reconstruct lost packets without {{retransmission|retransmission}}.

**XOR-based FEC**: Send N data packets plus 1 parity packet (XOR of all N). If any single packet is lost, it can be reconstructed from the others. Simple, low overhead (1/N+1), handles single-packet losses.

**Reed-Solomon codes**: More sophisticated -- can recover from multiple simultaneous losses. Higher CPU cost but configurable redundancy. Used in professional {{broadcast|broadcast}} systems.

**Opus FEC**: The Opus audio {{codec|codec}} includes built-in FEC -- each packet contains a low-bitrate encoding of the **previous** packet's audio. If a packet is lost, the next packet contains enough information to reconstruct a reasonable approximation. Nearly zero overhead for the common case of isolated packet losses.`
			},
			{
				type: 'diagram',
				title: 'Adaptive Bitrate Streaming Flow',
				caption: `How {{adaptive-bitrate|adaptive bitrate streaming}} works in [[hls|HLS]] and [[dash|DASH]]. The client player monitors network conditions and switches between quality levels dynamically.`,
				definition: `graph TD
    subgraph Encode["Server-Side Encoding"]
        SRC["Source Video"] --> ENC["Encoder / Transcoder"]
        ENC --> R1["1080p @ 5 Mbps"]
        ENC --> R2["720p @ 2.5 Mbps"]
        ENC --> R3["480p @ 1 Mbps"]
        ENC --> R4["360p @ 500 Kbps"]
        R1 --> SEG1["2-10s segments"]
        R2 --> SEG2["2-10s segments"]
        R3 --> SEG3["2-10s segments"]
        R4 --> SEG4["2-10s segments"]
        SEG1 --> MAN["Manifest / Playlist<br/>(M3U8 or MPD)"]
        SEG2 --> MAN
        SEG3 --> MAN
        SEG4 --> MAN
    end

    subgraph Player["Client-Side ABR Algorithm"]
        MAN --> FETCH["Fetch manifest"]
        FETCH --> MON["Monitor:<br/>Download speed<br/>Buffer level<br/>RTT"]
        MON --> ALG{"ABR Decision<br/>(BBA / Throughput / BOLA)"}
        ALG -- "High {{bandwidth|bandwidth}}<br/>Full buffer" --> HIGH["Request 1080p segment"]
        ALG -- "Low {{bandwidth|bandwidth}}<br/>Buffer draining" --> LOW["Request 360p segment"]
        ALG -- "Medium" --> MED["Request 720p segment"]
        HIGH --> MON
        LOW --> MON
        MED --> MON
    end`
			},
			{
				type: 'narrative',
				title: 'Adaptive Bitrate Streaming',
				text: `Adaptive bitrate (ABR) streaming dynamically adjusts video quality based on network conditions. [[hls|HLS]] and [[dash|DASH]] encode each video at multiple quality levels (representations), each segmented into short chunks (2-10 seconds).

The ABR algorithm runs in the client's player. It monitors download speed, buffer level, and sometimes {{rtt|RTT}} to decide which quality to request next. Key algorithms:

**Buffer-based (BBA)**: Simply picks quality based on current buffer level -- more buffer = higher quality. Simple and stable but can be slow to react to {{bandwidth|bandwidth}} changes.

**Throughput-based**: Measures recent download speed and picks the highest quality that fits. Fast to adapt but prone to oscillation between quality levels.

**Hybrid (BOLA, MPC)**: Combines buffer and throughput signals with mathematical optimization. Netflix's MPC (Model Predictive Control) looks multiple segments ahead to minimize rebuffering while maximizing quality. These achieve near-optimal quality with minimal stalls.`
			}
		]
	},
	{
		categoryId: 'utilities',
		tagline:
			'PKI internals, TLS 1.3 handshake walkthrough, cryptographic primitives, and DNS resolution mechanics.',
		sections: [
			{
				type: 'narrative',
				title: 'PKI and Certificate Chains',
				text: `The {{pki|Public Key Infrastructure}} is the trust system that makes HTTPS possible. When your browser connects to a server, it receives a {{certificate|certificate}} containing the server's {{public-key|public key}}, the domain name, and a digital signature from a {{certificate-authority|Certificate Authority}} ({{certificate-authority|CA}}).

The browser verifies this by following the {{certificate-chain|certificate chain}}: the server cert is signed by an intermediate {{certificate-authority|CA}}, which is signed by a root {{certificate-authority|CA}}. Root CAs are pre-installed in your browser/OS (~150 of them). If the chain validates, the padlock icon appears.

{{certificate-transparency|Certificate Transparency}} (CT) adds an extra layer: all certificates must be logged in public, append-only logs. If a {{certificate-authority|CA}} is compromised and issues fraudulent certificates, the transparency logs make it detectable. Browsers enforce CT -- certificates not logged are rejected.

OCSP (Online {{certificate|Certificate}} Status Protocol) and CRL ({{certificate|Certificate}} Revocation Lists) handle revoked certificates. OCSP Stapling (where the server includes a signed "not revoked" proof in the [[tls|TLS]] {{tls-handshake|handshake}}) avoids the privacy and performance problems of clients querying CAs directly.`
			},
			{
				type: 'diagram',
				title: 'TLS 1.3 Handshake Steps',
				caption: `The complete [[tls|TLS]] 1.3 {{handshake|handshake}} in a single round trip. The client sends key shares upfront, eliminating the extra round trip that [[tls|TLS]] 1.2 needed.`,
				definition: `graph TD
    subgraph RTT1["{{one-rtt|1-RTT}} {{handshake|Handshake}}"]
        CH["Client Hello<br/>Supported cipher suites<br/>Random {{nonce|nonce}}<br/>Key shares (X25519, P-256)"] -- "Flight 1" --> SH["Server Hello<br/>Chosen {{cipher-suite|cipher suite}}<br/>Server key share"]
        SH --> ENC_ON["{{encryption|Encryption}} begins"]
        ENC_ON --> EE["Encrypted Extensions<br/>Server parameters"]
        EE --> CERT["{{certificate|Certificate}}<br/>(encrypted)"]
        CERT --> CV["{{certificate|Certificate}} Verify<br/>Signature over {{handshake|handshake}}"]
        CV --> SF["Server Finished<br/>MAC over {{handshake|handshake}}"]
        SF -- "Flight 2" --> VERIFY["Client verifies<br/>{{certificate-chain|certificate chain}}"]
        VERIFY --> CF["Client Finished"]
        CF --> APP["Application Data Flows"]
    end

    subgraph ZERO["{{zero-rtt|0-RTT}} Resumption"]
        CH0["Client Hello +<br/>Early Data (encrypted)<br/>with PSK from prior session"] -- "Immediate" --> S0["Server processes<br/>early data"]
        S0 --> SH0["Server Hello +<br/>Finished"]
        SH0 --> APP0["Full connection established"]
        S0 -. "Warning: {{zero-rtt|0-RTT}} data<br/>can be replayed<br/>(must be {{idempotent|idempotent}})" .-> APP0
    end`
			},
			{
				type: 'narrative',
				title: 'TLS 1.3 Handshake Walkthrough',
				text: `[[tls|TLS]] 1.3 ([[rfc:8446|RFC 8446]]) is a radical simplification over [[tls|TLS]] 1.2. The entire {{tls-handshake|handshake}} completes in a single {{rtt|round trip}}:

**Client Hello**: The client sends supported {{cipher-suite|cipher suites}}, a random {{nonce|nonce}}, and **key shares** for all supported key {{exchange|exchange}} algorithms (usually X25519 and P-256). By sending keys upfront, the client gambles that the server will accept one -- eliminating the extra round trip that [[tls|TLS]] 1.2 needed.

**Server Hello + Encrypted Extensions**: The server picks a {{cipher-suite|cipher suite}}, sends its key share, and immediately switches to {{encryption|encrypted}} communication. The server's {{certificate|certificate}}, {{certificate|certificate}} verify (signature), and Finished message are all encrypted.

**Client Finished**: The client verifies the {{certificate-chain|certificate chain}}, sends its Finished message, and application data can begin flowing immediately.

[[tls|TLS]] 1.3 also supports **{{zero-rtt|0-RTT}} resumption**: if the client has connected before, it can send encrypted application data in the very first {{packet|packet}}. The tradeoff: {{zero-rtt|0-RTT}} data can be replayed by an attacker, so it must be {{idempotent|idempotent}} (safe to process twice).`
			},
			{
				type: 'narrative',
				title: 'DNS Resolution Chain',
				text: `When your browser needs to resolve "example.com," the query travels through a carefully designed hierarchy:

**Stub resolver** (your OS): Checks the local cache, the hosts file, then forwards the query to a configured recursive resolver (usually your ISP's or a public one like 8.8.8.8).

**Recursive resolver**: Does the hard work. If not cached, it starts at the root -- querying one of the 13 root server clusters for ".com." The root points to the .com TLD servers. The TLD server points to example.com's authoritative nameservers. The authoritative server returns the actual {{ip-address|IP address}}.

**Caching**: Every response includes a {{ttl|TTL}}. The recursive resolver caches results for that duration. A {{ttl|TTL}} of 300 means the record is fresh for 5 minutes -- reducing load on authoritative servers while allowing reasonably fast [[dns|DNS]] changes.

{{dnssec|DNSSEC}} adds cryptographic signatures to [[dns|DNS]] responses, preventing {{spoofing|spoofing}}. [[dns|DNS]]-over-HTTPS (DoH) and [[dns|DNS]]-over-[[tls|TLS]] (DoT) encrypt the query itself using [[tls|TLS]], preventing ISPs and network operators from snooping on which domains you're looking up.`
			}
		]
	},
	{
		categoryId: 'wireless',
		tagline:
			'The power–range–throughput triangle, CSMA/CA versus CSMA/CD, the 2.4 GHz coexistence dance, the BLE-bootstrap pattern, and the cross-cutting security history of the wireless family.',
		sections: [
			{
				type: 'narrative',
				title: 'The Power–Range–Throughput Triangle',
				text: `Every wireless protocol picks two corners of a three-way trade-off: **transmit power**, **range**, and **throughput**. You can have any two cheaply; the third is what the spec is really negotiating.

[[nfc|NFC]] picks **low power + low range** — passive cards harvest microwatts from the reader's field at ≤10 cm and trade everything for a 13.56 MHz carrier that physics caps at ~424 kbit/s. [[bluetooth|BLE]] picks **low power + medium throughput** — coin-cell devices at 1–2 Mbps over 10 m. [[wifi|Wi-Fi]] picks **high throughput + medium range** — gigabit speeds at 30 m but with hundreds of milliwatts of TX power. [[cellular|Cellular]] picks **range + throughput** at the cost of power and licensed {{spectrum|spectrum}} — 50 km with the right base station, ~1–10 Gbps in FR1, but you don't run a base station on a coin cell. [[uwb|UWB]] sits in a corner of its own: **wide {{bandwidth|bandwidth}} + low average power** by trading {{tof-ranging|time-of-flight}} precision for any meaningful data rate — it is a clock, not a data radio.

The numbers below are typical 2026 production values; spec maxima are higher, real-world is usually lower. **Edholm's law of {{bandwidth|bandwidth}}** — wireless data rates double roughly every 18 months — is what keeps the table moving.`
			},
			{
				type: 'diagram',
				title: 'Power–Range–Throughput at a glance',
				caption: `Where each member of the [[wifi|Wireless]] category sits in the three-way trade-off space. Numbers are typical production values, not spec maxima.`,
				definition: `graph TD
    subgraph Personal["Personal-area (≤10 m)"]
        [[nfc|NFC]]["[[nfc|NFC]]<br/>≤10 cm, 424 kbit/s<br/>passive power"]
        BLE["[[bluetooth|BLE]]<br/>10 m, 1-2 Mbit/s<br/>1-100 mW"]
        [[uwb|UWB]]["[[uwb|UWB]]<br/>10-50 m, ranging<br/>≤1 mW avg"]
        ZIGBEE["[[zigbee|Zigbee]]<br/>10-30 m hop, 250 kbit/s<br/>1 mW, mesh"]
    end
    subgraph Local["Local-area (≤100 m)"]
        WIFI["[[wifi|Wi-Fi]]<br/>30 m, 1-46 Gbit/s<br/>100-1000 mW"]
    end
    subgraph Wide["Wide-area (≥1 km)"]
        CELL["[[cellular|Cellular]]<br/>1-50 km, 1-10 Gbit/s<br/>licensed {{spectrum|spectrum}}"]
    end

    NFC -.->|tap-to-pair bootstrap| BLE
    NFC -.->|tap-to-pair bootstrap| WIFI
    BLE -.->|session-key bootstrap| UWB
    BLE -.->|commissioning| ZIGBEE
    WIFI -.->|offload| CELL`
			},
			{
				type: 'narrative',
				title: 'CSMA/CA — collision avoidance in a medium you can\'t monitor',
				text: `Wired [[ethernet|Ethernet]] uses **CSMA/CD** (Collision Detection): a station listens while it transmits and aborts the moment another station's signal collides with its own. That trick is impossible on radio — your own transmitter saturates your own receiver, so a wireless NIC literally cannot hear another station while it is sending. Every wireless MAC therefore uses **{{csma-ca|CSMA/CA}}** (Collision *Avoidance*): listen-before-talk, plus a randomised back-off if the channel was busy.

[[wifi|Wi-Fi]]'s flavour is DCF (Distributed Coordination Function). Before each {{frame|frame}}, the station senses the channel for a DIFS interval (28–34 µs), then picks a random slot from a contention window (initial CW=15, doubled on collision up to 1023), then transmits if still idle. Every successful frame is {{ack|ACKed}} after a SIFS gap (~10 µs); no ACK in time = the sender assumes collision and {{retransmission|retransmits}} from a larger CW. RTS/CTS is the optional defence against hidden terminals: the sender first asks "may I?" with a tiny RTS, the receiver responds with CTS, and every station that heard either falls silent for the negotiated duration.

[[zigbee|Zigbee]] and {{thread|Thread}} use a similar unslotted CSMA-CA on {{ieee-802-15-4|IEEE 802.15.4}}. [[bluetooth|Bluetooth]] sidesteps the whole problem by **frequency hopping** — 1,600 hops/sec on BR/EDR — so collisions on a single channel are statistically rare. [[cellular|Cellular]] doesn't contend at all on the downlink: the base station schedules every slot.

The cost of {{csma-ca|CSMA/CA}} is **{{airtime|airtime}} overhead**. At Wi-Fi 6's nominal 9.6 Gbit/s, real throughput on a busy AP is closer to 1–2 Gbit/s because half the {{airtime|airtime}} is DIFS, SIFS, ACKs, beacons, and CW back-off. The Wi-Fi 8 work on **MLO (Multi-Link Operation)** lets one device use 2.4 + 5 + 6 GHz radios simultaneously precisely to dodge contention on any one band.`
			},
			{
				type: 'callout',
				title: 'The hidden-terminal problem in one sentence',
				text: 'On a wired bus, every station hears every other; on a radio, station A and station C may both hear AP B but not each other — so they both think the channel is clear and both transmit at once, colliding at B. RTS/CTS exists because of this. The same physics motivates BLE\'s frequency-hopping master clock, Zigbee\'s coordinator-led scheduling, and every cellular RAN\'s centralised uplink scheduler.'
			},
			{
				type: 'narrative',
				title: 'The 2.4 GHz coexistence dance',
				text: `Four protocol families share the unlicensed 2.4 GHz {{ism-band|ISM band}}: [[wifi|Wi-Fi]] (20 MHz channels centred at 2412 / 2437 / 2462 MHz — the canonical 1/6/11 trio), [[bluetooth|Bluetooth]] BR/EDR (79 × 1 MHz channels hopping 1,600/sec), [[bluetooth|BLE]] (40 × 2 MHz channels), and [[zigbee|Zigbee]] / {{thread|Thread}} on {{ieee-802-15-4|IEEE 802.15.4}} (16 × 2 MHz channels at 11–26). Plus microwave ovens, baby monitors, cordless phones, and every other device the FCC ever granted Part 15 to.

How they coexist:

**Modern combo chips** ({{apple|Apple}} H-series, {{broadcom|Broadcom}}, Qualcomm) put [[wifi|Wi-Fi]] and [[bluetooth|Bluetooth]] radios on the same die and arbitrate {{airtime|airtime}} in firmware — time-slicing so one starves the other only briefly. The same silicon usually handles [[bluetooth|BLE]] and {{thread|Thread}} too.

**Zigbee dodges Wi-Fi.** Zigbee channels 11–14 sit under Wi-Fi 1; 15, 20, 25, and 26 fit in the gaps between Wi-Fi 1/6/11. The single most common cause of unreliable Zigbee is a coordinator dongle plugged directly into a Wi-Fi router's USB port — the router's switched-mode PSU radiates broadband 2.4 GHz noise.

**BLE picks its advertising channels carefully.** Channels 37/38/39 — the three primary advertising channels — sit at 2402, 2426, and 2480 MHz, deliberately outside Wi-Fi 1/6/11. The 37 data channels (0–36) overlap and rely on adaptive frequency hopping to dodge active Wi-Fi APs.

**The 5/6 GHz escape valve.** Modern Wi-Fi (5, 6, 7, 8) is increasingly pushed up to 5 GHz and 6 GHz where it has the {{spectrum|spectrum}} to itself. 2.4 GHz remains the universal floor — battery-powered devices still live there because 2.4 GHz penetrates walls better than 5 GHz at the same power.

**Cellular bands are licensed**, which is why your phone's 4G/5G radio doesn't fight with your Wi-Fi even in the same physical space — different {{spectrum|spectrum}} entirely.`
			},
			{
				type: 'callout',
				title: 'The 2.4 GHz death spiral',
				text: 'As {{airtime|airtime}} utilisation rises, retries rise, which raises {{airtime|airtime}} utilisation, which raises retries. Dense apartment buildings have measurable 2.4 GHz collapse — when 20+ Wi-Fi APs share three non-overlapping channels, throughput drops by an order of magnitude. The fix is to move every modern client to 5 / 6 GHz and leave 2.4 GHz to IoT.'
			},
			{
				type: 'narrative',
				title: 'The BLE-bootstrap pattern',
				text: `Almost every consumer wireless interaction in 2026 chains *multiple* radios. The pattern is everywhere once you see it:

**[[uwb|UWB]] ranging** never starts without [[bluetooth|BLE]] first. The lock or car advertises a service UUID over BLE; the phone connects, runs SPAKE2+/PAKE authentication, transfers the **STS_KEY** for the [[uwb|UWB]] session over the BLE encrypted channel, and only then powers up its UWB radio for a three-message DS-TWR ranging round. UWB has no power-efficient discovery mechanism of its own — BLE provides it. ({{ccc-digital-key|CCC Digital Key 3.0}}, {{aliro|Aliro 1.0}}, every {{apple|Apple}} AirTag Precision Finding round.)

**[[bluetooth|Bluetooth]] / [[wifi|Wi-Fi]] handover** is bootstrapped by [[nfc|NFC]]. The [[nfc|NFC]] Forum Connection Handover spec defines {{ndef|NDEF}} records carrying the BLE MAC + SMP OOB key or the Wi-Fi SSID + {{wpa2|WPA2}} key. A single 4 cm tap replaces the entire discovery + pairing dialog on Bluetooth speakers, printers, and {{matter|Matter}} device commissioning.

**[[cellular|Cellular]] data** falls back to [[wifi|Wi-Fi]] calling when the carrier signal is weak — [[ipsec|IPsec]] ePDG tunnel from the UE to the carrier core over any IP link. The reverse is now true too: **Wi-Fi 8 and the {{3gpp|3GPP}} "Wi-Fi RAN" work** is exploring Wi-Fi as a fully {{3gpp|3GPP}}-managed access network so the phone never has to know which radio it's on.

**Zigbee + {{thread|Thread}}** are commissioned over BLE (Zigbee Direct, R23 mandatory in Coordinators) or Wi-Fi ({{matter|Matter}} setup). Once commissioned they run their own mesh; BLE is just the on-ramp.

The architectural rule: the radio with the **best discovery + power profile** does the bootstrap; the radio with the **right property for the workload** (range, throughput, precision, security) does the actual session. No single protocol does both well.`
			},
			{
				type: 'narrative',
				title: 'The wireless security history in one arc',
				text: `Every wireless protocol has been broken at the spec level at least once. The pattern is similar enough that they are best understood as one story.

**MIFARE Crypto1 — 24C3, December 2007** ([[pioneer:karsten-nohl|Karsten Nohl]], [[pioneer:henryk-plotz|Henryk Plötz]], "Starbug"). Philips's proprietary 48-bit stream cipher, "secure" by virtue of being secret, dismantled by decapping a chip and photographing ~10 000 gates with an optical microscope. The first canonical "security-by-obscurity does not scale" lesson in deployed wireless silicon. Dutch OV-chipkaart kept shipping affected cards until **2024**.

**{{krack|KRACK}} — USENIX Security 2017** (Mathy Vanhoef, Frank Piessens). The {{wpa2|WPA2}} four-way {{handshake|handshake}} permitted {{nonce|nonce}} reuse on key reinstall, defeating CCMP integrity. Universal — every {{wpa2|WPA2}} client on Earth needed firmware updates. The [[wifi|802.11]] working group's response was {{wpa3|WPA3}} (SAE {{handshake|handshake}}, immune by construction).

**{{knob-attack|KNOB / BIAS / BLUFFS}} — 2019 / 2020 / 2023** (Daniele Antonioli et al., CVE-2019-9506 / CVE-2020-10135 / CVE-2023-24023). The same author broke [[bluetooth|Bluetooth]] BR/EDR session security three times in five years — key-negotiation forcing 1-byte entropy, impersonation across bonding, and forward-secrecy breakage on cross-session key derivation. Every BR/EDR device shipped before mid-2024 affected.

**Tesla Model 3 BLE relay — May 2022** (Sultan Qasim Khan, NCC Group, CVSS 6.8). ~$50 of dev boards, ~8 ms relay {{latency|latency}}, below Tesla's ~30 ms {{gatt|GATT}} threshold. {{rssi|RSSI}} proximity is fundamentally broken when an attacker can relay. The industry response: [[uwb|UWB]] cryptographic distance bounds ({{ccc-digital-key|CCC Digital Key}} 3.0) — the speed of light is the hard upper bound that no relay can shorten.

**Ghost Peak — USENIX Security 2022** (Leu, Camurati et al.). Even [[uwb|UWB]]'s STS distance commitment was attackable at ~4 % success with a $65 device — random STS-like signal injection biased the correlation peak earlier. Motivated **IEEE 802.15.4ab** (Draft D03 Sept 2025) with NBA-MMS narrowband-assist and a redesigned receiver.

**SS7 / {{diameter|Diameter}} abuse — ongoing** (Citizen Lab 2024–25, CISA testimony to FCC 2024). The cellular signalling plane was designed in 1975 with implicit trust between carriers. Modern surveillance actors (STA1, STA2) exploit SS7 / {{diameter|Diameter}} routing to silently track mobile users worldwide. The fix is a multi-year migration to authenticated SBI and signature-checked roaming — partially complete in 5GC but the SS7 layer below is still everywhere.

**The pattern:** every spec that depends on a *secret algorithm* or a *trust assumption between operators* eventually gets broken in public. Every spec that depends on *cryptographic primitives + open analysis* ({{wpa3|WPA3}}, CCMP-256, EMV cryptograms, IEEE 802.15.4z STS as redesigned) survives the next attack.`
			},
			{
				type: 'callout',
				title: 'The one rule that ties this category together',
				text: 'Wireless is the only major networking category where the *physical layer is adversarial by default*. Wired networks fail when something breaks. Wireless networks fail because the medium is shared with everything else operating in the same band — including, sometimes, an attacker. Every architectural choice in this category — frequency hopping, {{csma-ca|CSMA/CA}}, scheduled access, STS, cryptographic distance bounds — exists to make a hostile medium predictable.'
			}
		]
	}
];

const deepDiveMap = new Map(categoryDeepDives.map((d) => [d.categoryId, d]));

export function getCategoryDeepDive(categoryId: string): CategoryDeepDive | undefined {
	return deepDiveMap.get(categoryId);
}
