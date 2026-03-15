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
				text: `In a flat Layer 2 network, every device can see every other device's broadcast traffic. VLANs (Virtual LANs, IEEE 802.1Q) solve this by logically partitioning a physical switch into separate broadcast domains. A single 48-port switch can operate as if it were multiple independent switches.

VLAN tagging inserts a 4-byte header into {{frame|Ethernet frames}}, containing a 12-bit VLAN ID (1-4094). Trunk ports carry frames from multiple VLANs between switches; access ports strip the tag and connect to end devices. Inter-VLAN {{routing-table|routing}} requires a Layer 3 device -- either a router on a stick or a Layer 3 switch.

VLANs are essential for security (isolating guest [[wifi|WiFi]] from the corporate network), performance (reducing broadcast storms), and compliance (PCI DSS requires cardholder data on its own {{subnet|subnet}}).`
			},
			{
				type: 'diagram',
				title: 'VLAN Tagging and Trunk Architecture',
				caption: `How 802.1Q VLAN tagging works across trunk and access ports. Frames are tagged with VLAN IDs on trunk links and stripped on access ports connecting to end devices.`,
				definition: `graph TD
    subgraph Switch_A["Switch A"]
        A_AP1["Access Port<br/>VLAN 10<br/>Engineering"]
        A_AP2["Access Port<br/>VLAN 20<br/>Marketing"]
        A_AP3["Access Port<br/>VLAN 30<br/>Guest WiFi"]
        A_TRUNK["Trunk Port<br/>802.1Q Tagged<br/>VLANs 10,20,30"]
    end

    subgraph Switch_B["Switch B"]
        B_TRUNK["Trunk Port<br/>802.1Q Tagged<br/>VLANs 10,20,30"]
        B_AP1["Access Port<br/>VLAN 10<br/>Engineering"]
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
				text: `Redundant links between [[ethernet|switches]] are essential for reliability -- but they create loops that cause broadcast storms. Spanning Tree Protocol (IEEE 802.1D) prevents loops by electing a root bridge, calculating the shortest path from every switch to the root, and blocking redundant {{port|ports}}.

Classic STP converges in 30-50 seconds after a topology change -- an eternity for modern networks. Rapid Spanning Tree Protocol (RSTP, IEEE 802.1w) reduces this to 1-2 seconds with proposal/agreement {{handshake|handshakes}}. Multiple Spanning Tree Protocol (MSTP, 802.1s) maps multiple VLANs to fewer spanning tree instances for efficiency.

In modern data centers, STP is increasingly replaced by fabric architectures (VXLAN, EVPN) that eliminate loops at the {{protocol|protocol}} level while allowing all links to carry traffic simultaneously.`
			},
			{
				type: 'narrative',
				title: 'ARP Security',
				text: `[[arp|ARP]] has no authentication -- any device can claim any {{ip-address|IP}}-to-{{mac-address|MAC}} mapping. ARP spoofing (also called ARP poisoning) exploits this: an attacker sends fake ARP replies to redirect traffic through their machine, enabling man-in-the-middle attacks.

Dynamic ARP Inspection (DAI) is the primary defense. It intercepts ARP {{packet|packets}} on untrusted ports and validates them against a DHCP snooping binding table. If the IP-to-MAC mapping doesn't match a legitimate [[dhcp|DHCP]] lease, the ARP packet is dropped.

[[ipv6|IPv6]] replaces ARP entirely with Neighbor Discovery Protocol (NDP), which runs over [[icmp|ICMPv6]]. While NDP has its own spoofing risks, Secure Neighbor Discovery (SEND) uses cryptographic addressing to authenticate neighbor advertisements.`
			},
			{
				type: 'narrative',
				title: 'Wi-Fi Roaming and Mesh',
				text: `When you walk from one room to another, your device must seamlessly switch from one access point to another -- this is [[wifi|Wi-Fi]] roaming. Basic roaming is slow: the client must re-authenticate with each AP. IEEE 802.11r (Fast BSS Transition) pre-authenticates with target APs, reducing handoff to under 50ms.

802.11k (Radio Resource Management) helps clients discover nearby APs without scanning every channel. 802.11v (BSS Transition Management) lets APs steer clients toward less-congested access points. Together, 802.11r/k/v enable enterprise-grade seamless roaming.

Wi-Fi mesh networks (802.11s) take this further -- APs connect to each other wirelessly, forming a self-healing fabric. Each AP acts as both an access point and a relay, automatically routing traffic along the best path. Consumer mesh systems (Eero, Google WiFi) use proprietary versions of this concept.`
			},
			{
				type: 'narrative',
				title: 'BGP Route Policies',
				text: `[[bgp|BGP]] doesn't just exchange routes -- operators use policy to control which routes they accept, prefer, and advertise. This is the art of internet traffic engineering.

**Route filtering** uses prefix lists and AS-path filters to accept only legitimate routes. Accepting too broadly risks route leaks; filtering too aggressively disconnects networks. The RPKI (Resource Public Key Infrastructure) system uses {{certificate|cryptographic certificates}} to validate that an AS is authorized to announce a prefix.

**Local preference** controls outbound traffic by assigning weights to routes -- higher preference means "prefer this path." **MED (Multi-Exit Discriminator)** hints to neighboring ASes which entry point to use. **AS-path prepending** makes a path look longer to discourage inbound traffic through that link.

BGP communities tag routes with metadata that triggers policies in other networks. Standard communities (like "no-export") prevent route propagation. Large communities (RFC 8092) enable fine-grained traffic engineering across multi-provider networks.`
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

**TCP Tahoe** (1988) introduced slow start and congestion avoidance. Start with a small {{sliding-window|window}}, double it each {{rtt|RTT}} (slow start), then switch to linear growth after detecting congestion. On {{packet|packet}} loss, reset the window to 1 -- devastating for performance.

**TCP Reno** (1990) added fast recovery: on triple duplicate {{ack|ACKs}}, halve the window instead of resetting to 1. This simple change dramatically improved throughput.

**CUBIC** (2006, Linux default since 2.6.19) uses a cubic function for window growth -- aggressive probing for {{bandwidth|bandwidth}} followed by a gentle approach near the last-known capacity. It's the most widely deployed algorithm today.

**BBR** (2016, Google) took a fundamentally different approach. Instead of reacting to loss, BBR actively measures the bottleneck bandwidth and minimum RTT, then paces {{segment|packets}} to match the path capacity. It performs dramatically better on long-distance, high-bandwidth links.`
			},
			{
				type: 'diagram',
				title: 'Congestion Window Growth: Tahoe vs Reno vs CUBIC vs BBR',
				caption: `How different congestion control algorithms grow and adjust their sending window. Loss-based algorithms (Tahoe, Reno, CUBIC) react to packet loss, while BBR probes the actual bottleneck bandwidth.`,
				definition: `graph TD
    START["Connection Start<br/>cwnd = 1 MSS"] --> SS["Slow Start Phase<br/>cwnd doubles each RTT"]
    SS --> THRESH{"Hit ssthresh<br/>or loss?"}

    THRESH -- "Loss (Tahoe)" --> TAHOE_RESET["Reset cwnd = 1<br/>ssthresh = cwnd/2<br/>Restart Slow Start"]
    TAHOE_RESET --> SS

    THRESH -- "3 Dup ACKs (Reno)" --> RENO_HALF["Halve cwnd<br/>ssthresh = cwnd/2<br/>Fast Recovery"]
    RENO_HALF --> RENO_CA["Congestion Avoidance<br/>Linear growth +1 MSS/RTT"]

    THRESH -- "ssthresh (CUBIC)" --> CUBIC_CA["CUBIC Function<br/>W(t) = C(t - K)^3 + Wmax<br/>Aggressive probe + gentle plateau"]
    CUBIC_CA -- "Loss" --> CUBIC_MULT["Multiplicative Decrease<br/>Wmax = cwnd * 0.7"]
    CUBIC_MULT --> CUBIC_CA

    THRESH -- "BBR (no loss trigger)" --> BBR_PROBE["Probe Bandwidth<br/>Measure BtlBw + RTprop"]
    BBR_PROBE --> BBR_PACE["Pace at BtlBw * gain<br/>cwnd = BtlBw * RTprop * 2"]
    BBR_PACE -- "Periodic probe" --> BBR_PROBE`
			},
			{
				type: 'narrative',
				title: 'Flow Control Deep Dive',
				text: `{{flow-control|Flow control}} prevents a fast sender from overwhelming a slow receiver. [[tcp|TCP]]'s {{sliding-window|sliding window}} is elegant: the receiver advertises its available buffer space (the "receive window") in every {{ack|ACK}}.

If the receiver's window shrinks to zero, the sender must stop. To avoid deadlock (the sender waiting for a window update that gets lost), TCP uses persist timers -- small probe {{packet|packets}} sent periodically to check if the window has reopened.

Window scaling (RFC 7323) extends the 16-bit window field beyond 65KB using a scale factor negotiated during the {{handshake|handshake}}. Without it, high-{{bandwidth|bandwidth}} long-distance links would be limited to 65KB x (1/RTT) throughput -- roughly 5 Mbps on a 100ms {{rtt|RTT}} path.

Nagle's algorithm (RFC 896) coalesces small writes into larger {{segment|segments}} to reduce overhead -- but it interacts badly with delayed ACKs, causing 200ms {{latency|latency}} spikes. Most interactive applications disable it with TCP_NODELAY.`
			},
			{
				type: 'callout',
				title: 'The Bufferbloat Problem',
				text: 'Oversized router buffers (often hundreds of megabytes) let queues grow enormous before any {{packet|packets}} are dropped. {{congestion-control|Congestion control}} algorithms that rely on loss as a signal (Tahoe, Reno, CUBIC) don\'t react until buffers overflow -- by which point {{latency|latency}} has ballooned from 10ms to 1000ms. This "bufferbloat" is why your internet feels slow when someone starts a big download. Solutions: Active Queue Management (CoDel, PIE, fq_codel) and algorithms like BBR that measure latency instead of waiting for loss.'
			},
			{
				type: 'narrative',
				title: 'TCP Fast Open',
				text: `Standard [[tcp|TCP]] requires a full {{rtt|RTT}} for the three-way {{handshake|handshake}} before any data can flow. TCP Fast Open (TFO, RFC 7413) allows data in the SYN {{packet|packet}} itself.

On the first {{connection-oriented|connection}}, the server sends a cookie in the SYN-ACK. On subsequent connections, the client includes this cookie and application data in the SYN. The server can process the data immediately, saving one full RTT.

TFO is widely deployed (Linux, macOS, iOS) but faces challenges: middleboxes sometimes strip the TFO option, and {{idempotent|idempotency}} is required (the SYN data might be delivered twice). Despite this, it provides measurable {{latency|latency}} improvements for short-lived connections like web requests.`
			}
		]
	},
	{
		categoryId: 'web-api',
		tagline:
			'HTTP caching, content negotiation, CORS, header compression, and the mechanics beneath modern web APIs.',
		sections: [
			{
				type: 'narrative',
				title: 'HTTP Caching In Depth',
				text: `Caching is the most impactful performance optimization in the [[http1|HTTP]] stack. The Cache-Control {{header|header}} drives everything.

**max-age=3600** means "this response is fresh for 3600 seconds." **no-cache** means "always revalidate with the server." **no-store** means "never store this response." **private** vs **public** controls whether CDNs and shared proxies can cache the response.

Conditional requests avoid re-downloading unchanged resources. The server sends ETag (a content fingerprint) or Last-Modified headers. On subsequent requests, the client sends If-None-Match or If-Modified-Since. If unchanged, the server responds with a {{status-code|304 Not Modified}} -- no body, saving {{bandwidth|bandwidth}}.

**stale-while-revalidate** (RFC 5861) is a modern gem: serve the stale cached version immediately while asynchronously checking for updates. The user gets instant responses; the cache stays fresh. Combined with CDNs, this pattern enables sub-10ms {{latency|response times}} globally.`
			},
			{
				type: 'narrative',
				title: 'CORS Mechanics',
				text: `Cross-Origin Resource Sharing (CORS) is the browser's security mechanism for controlling cross-origin {{http-method|HTTP}} requests. When JavaScript on example.com tries to fetch from api.other.com, the browser intervenes.

**Simple requests** (GET, POST with standard {{header|headers}}) send the request directly with an Origin header. The server responds with Access-Control-Allow-Origin -- if it matches, the browser allows JavaScript to read the response.

**Preflight requests** are triggered by custom headers, PUT/DELETE {{http-method|methods}}, or non-standard Content-Types. The browser sends an OPTIONS request first, asking "is this allowed?" The server responds with allowed methods, headers, and credentials policy. Only then does the actual {{request-response|request}} proceed.

The preflight result is cached (Access-Control-Max-Age), but misconfigured CORS headers are one of the most common sources of frustration in web development. Overly permissive CORS ("Allow-Origin: *") is a security risk; overly restrictive CORS blocks legitimate integrations.`
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
    SRES -- "Missing or mismatch" --> BLOCK["Browser blocks response<br/>CORS error in console"]

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
				text: `{{header|HTTP headers}} are repetitive -- Cookie, User-Agent, Accept, and dozens of others are sent identically on every request. [[http2|HTTP/2]]'s HPACK compression reduces header overhead by 85-90%.

HPACK maintains a dynamic table shared between {{client-server|client and server}}. Previously-seen header key-value pairs are referenced by index instead of retransmitted. A static table of 61 common headers (like ":method: GET") is pre-populated. Huffman coding further compresses literal values.

[[http3|HTTP/3]] couldn't use HPACK because it requires in-order delivery (the dynamic table is a {{stream|stream}} of updates). QPACK solves this with a separate, unidirectional stream for table updates, allowing header blocks to be decoded independently -- eliminating {{head-of-line-blocking|head-of-line blocking}} in header decompression.

This matters because [[http2|HTTP/2]] over [[tcp|TCP]] still suffers from transport-level head-of-line blocking -- a single lost {{packet|packet}} stalls all {{multiplexing|multiplexed}} streams. [[http3|HTTP/3]] over [[quic|QUIC]] solves this at the transport layer, and QPACK ensures header decompression doesn't reintroduce it.`
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
				caption: `Two fundamental broker patterns: centralized brokers (like RabbitMQ) with smart routing, and distributed commit logs (like Kafka) with consumer-tracked offsets.`,
				definition: `graph TD
    subgraph Central["Centralized Broker (RabbitMQ / AMQP)"]
        P1["Producer A"] --> EX["Exchange<br/>(routing rules)"]
        P2["Producer B"] --> EX
        EX -- "topic match" --> Q1["Queue 1<br/>(orders)"]
        EX -- "fanout" --> Q2["Queue 2<br/>(notifications)"]
        EX -- "headers" --> Q3["Dead Letter Queue"]
        Q1 --> C1["Consumer 1"]
        Q2 --> C2["Consumer 2"]
        Q2 --> C3["Consumer 3"]
        Q3 --> C4["Admin / Retry"]
    end

    subgraph Distributed["Distributed Commit Log (Kafka)"]
        KP1["Producer A"] --> T["Topic: orders<br/>Partition 0 | Partition 1 | Partition 2"]
        KP2["Producer B"] --> T
        T --> CG1["Consumer Group A<br/>offset: 42, 38, 50"]
        T --> CG2["Consumer Group B<br/>offset: 10, 12, 15<br/>(can replay)"]
    end`
			},
			{
				type: 'narrative',
				title: 'Broker Architectures',
				text: `Message {{broker|brokers}} come in two fundamental flavors:

**Centralized brokers** ([[amqp|RabbitMQ]], Mosquitto, ActiveMQ) route every message through a single logical broker. The broker handles queuing, routing, {{ack|acknowledgments}}, and {{dead-letter-queue|dead-letter}} handling. Simple to reason about but the broker is a single point of failure and a potential bottleneck.

**Distributed commit logs** ([[kafka|Kafka]], Pulsar, Redpanda) store messages in ordered, partitioned, replicated logs. Consumers track their own offset -- they can replay the entire history or catch up after downtime. Messages are retained for days or weeks, not deleted after delivery. This enables event sourcing, {{stream|stream}} processing, and CQRS patterns.

The choice depends on your messaging pattern: if you need complex routing ({{topic|topic}} exchanges, headers-based filtering, priority queues), a traditional broker excels. If you need ordered, replayable event streams at massive scale, a distributed log is the right tool.`
			},
			{
				type: 'narrative',
				title: 'Exactly-Once Delivery',
				text: `"Exactly once" is the holy grail of messaging -- and the hardest to achieve. The Two Generals Problem proves that exactly-once delivery is impossible over an unreliable network. So how do systems claim to offer it?

The trick is **exactly-once processing**, not exactly-once delivery. The system may deliver a message multiple times, but it ensures the effect happens only once. Techniques:

**Idempotent producers** ([[kafka|Kafka]]): each message gets a {{sequence-number|sequence number}}. The {{broker|broker}} deduplicates based on producer ID + sequence, discarding {{retransmission|retransmissions}}.

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

Jitter buffers smooth this out by introducing a small, intentional delay. Incoming packets are held in a buffer and released at regular intervals, absorbing timing variations. The tradeoff: larger buffers handle more jitter but add latency.

**Static jitter buffers** use a fixed delay (e.g., 60ms). Simple but suboptimal -- too small and you get dropouts; too large and the latency is noticeable. **Adaptive jitter buffers** dynamically adjust their size based on observed network conditions, growing during high jitter and shrinking when the network is stable. [[webrtc|WebRTC]]'s NetEQ is a sophisticated adaptive jitter buffer that also handles packet loss concealment.`
			},
			{
				type: 'narrative',
				title: 'Forward Error Correction',
				text: `When [[udp|UDP]] {{datagram|packets}} are lost, the data is gone -- there's no {{retransmission|retransmission}} mechanism. For real-time media, waiting for a retransmit is worse than skipping the lost data. Forward Error Correction (FEC) adds redundant data so the receiver can reconstruct lost packets without retransmission.

**XOR-based FEC**: Send N data packets plus 1 parity packet (XOR of all N). If any single packet is lost, it can be reconstructed from the others. Simple, low overhead (1/N+1), handles single-packet losses.

**Reed-Solomon codes**: More sophisticated -- can recover from multiple simultaneous losses. Higher CPU cost but configurable redundancy. Used in professional broadcast systems.

**Opus FEC**: The Opus audio codec includes built-in FEC -- each packet contains a low-bitrate encoding of the **previous** packet's audio. If a packet is lost, the next packet contains enough information to reconstruct a reasonable approximation. Nearly zero overhead for the common case of isolated packet losses.`
			},
			{
				type: 'diagram',
				title: 'Adaptive Bitrate Streaming Flow',
				caption: `How adaptive bitrate streaming works in HLS and DASH. The client player monitors network conditions and switches between quality levels dynamically.`,
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
        ALG -- "High bandwidth<br/>Full buffer" --> HIGH["Request 1080p segment"]
        ALG -- "Low bandwidth<br/>Buffer draining" --> LOW["Request 360p segment"]
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
				text: `The {{pki|Public Key Infrastructure}} is the trust system that makes HTTPS possible. When your browser connects to a server, it receives a {{certificate|certificate}} containing the server's {{public-key|public key}}, the domain name, and a digital signature from a Certificate Authority (CA).

The browser verifies this by following the {{certificate-chain|certificate chain}}: the server cert is signed by an intermediate CA, which is signed by a root CA. Root CAs are pre-installed in your browser/OS (~150 of them). If the chain validates, the padlock icon appears.

Certificate Transparency (CT) adds an extra layer: all certificates must be logged in public, append-only logs. If a CA is compromised and issues fraudulent certificates, the transparency logs make it detectable. Browsers enforce CT -- certificates not logged are rejected.

OCSP (Online Certificate Status Protocol) and CRL (Certificate Revocation Lists) handle revoked certificates. OCSP Stapling (where the server includes a signed "not revoked" proof in the [[tls|TLS]] {{tls-handshake|handshake}}) avoids the privacy and performance problems of clients querying CAs directly.`
			},
			{
				type: 'diagram',
				title: 'TLS 1.3 Handshake Steps',
				caption: `The complete TLS 1.3 handshake in a single round trip. The client sends key shares upfront, eliminating the extra round trip that TLS 1.2 needed.`,
				definition: `graph TD
    subgraph RTT1["1-RTT Handshake"]
        CH["Client Hello<br/>Supported cipher suites<br/>Random nonce<br/>Key shares (X25519, P-256)"] -- "Flight 1" --> SH["Server Hello<br/>Chosen cipher suite<br/>Server key share"]
        SH --> ENC_ON["Encryption begins"]
        ENC_ON --> EE["Encrypted Extensions<br/>Server parameters"]
        EE --> CERT["Certificate<br/>(encrypted)"]
        CERT --> CV["Certificate Verify<br/>Signature over handshake"]
        CV --> SF["Server Finished<br/>MAC over handshake"]
        SF -- "Flight 2" --> VERIFY["Client verifies<br/>certificate chain"]
        VERIFY --> CF["Client Finished"]
        CF --> APP["Application Data Flows"]
    end

    subgraph ZERO["0-RTT Resumption"]
        CH0["Client Hello +<br/>Early Data (encrypted)<br/>with PSK from prior session"] -- "Immediate" --> S0["Server processes<br/>early data"]
        S0 --> SH0["Server Hello +<br/>Finished"]
        SH0 --> APP0["Full connection established"]
        S0 -. "Warning: 0-RTT data<br/>can be replayed<br/>(must be idempotent)" .-> APP0
    end`
			},
			{
				type: 'narrative',
				title: 'TLS 1.3 Handshake Walkthrough',
				text: `[[tls|TLS]] 1.3 (RFC 8446) is a radical simplification over TLS 1.2. The entire {{tls-handshake|handshake}} completes in a single {{rtt|round trip}}:

**Client Hello**: The client sends supported {{cipher-suite|cipher suites}}, a random nonce, and **key shares** for all supported key exchange algorithms (usually X25519 and P-256). By sending keys upfront, the client gambles that the server will accept one -- eliminating the extra round trip that TLS 1.2 needed.

**Server Hello + Encrypted Extensions**: The server picks a cipher suite, sends its key share, and immediately switches to {{encryption|encrypted}} communication. The server's {{certificate|certificate}}, certificate verify (signature), and Finished message are all encrypted.

**Client Finished**: The client verifies the {{certificate-chain|certificate chain}}, sends its Finished message, and application data can begin flowing immediately.

TLS 1.3 also supports **0-RTT resumption**: if the client has connected before, it can send encrypted application data in the very first {{packet|packet}}. The tradeoff: 0-RTT data can be replayed by an attacker, so it must be {{idempotent|idempotent}} (safe to process twice).`
			},
			{
				type: 'narrative',
				title: 'DNS Resolution Chain',
				text: `When your browser needs to resolve "example.com," the query travels through a carefully designed hierarchy:

**Stub resolver** (your OS): Checks the local cache, the hosts file, then forwards the query to a configured recursive resolver (usually your ISP's or a public one like 8.8.8.8).

**Recursive resolver**: Does the hard work. If not cached, it starts at the root -- querying one of the 13 root server clusters for ".com." The root points to the .com TLD servers. The TLD server points to example.com's authoritative nameservers. The authoritative server returns the actual {{ip-address|IP address}}.

**Caching**: Every response includes a {{ttl|TTL}}. The recursive resolver caches results for that duration. A TTL of 300 means the record is fresh for 5 minutes -- reducing load on authoritative servers while allowing reasonably fast [[dns|DNS]] changes.

DNSSEC adds cryptographic signatures to DNS responses, preventing spoofing. DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) encrypt the query itself using [[tls|TLS]], preventing ISPs and network operators from snooping on which domains you're looking up.`
			}
		]
	}
];

const deepDiveMap = new Map(categoryDeepDives.map((d) => [d.categoryId, d]));

export function getCategoryDeepDive(categoryId: string): CategoryDeepDive | undefined {
	return deepDiveMap.get(categoryId);
}
