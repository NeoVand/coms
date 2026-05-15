---
id: stomp
type: protocol
name: Simple Text Orientated Messaging Protocol
abbreviation: STOMP
etymology: "[S]imple [T]ext [O]rientated [M]essaging [P]rotocol (the S originally meant Streaming)"
category: async-iot
year: 2003
rfc: null
standards_body: null
podcast_target_minutes: 20
related_book_chapters: []
related_protocols: [tcp, websockets, amqp, http1, mqtt]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/RabbitMQ_%2848853375337%29.jpg/500px-RabbitMQ_%2848853375337%29.jpg", caption: "A RabbitMQ conference talk. RabbitMQ is one of the most popular message brokers supporting STOMP, and the protocol's text-based simplicity made it a natural bridge for web developers entering the messaging world.", credit: "Photo: Exey Panteleev / CC BY 2.0, via Wikimedia Commons" }
visual_cues:
  - "A side-by-side of an HTTP request and a STOMP CONNECT frame, lined up so the matching parts (command line, headers, blank line, body) glow in the same color."
  - "Annotated bytes of a real STOMP MESSAGE frame ending in the NULL terminator (0x00), with the heart-beat LF byte (0x0A) called out as a separate tiny pulse."
  - "A browser tab speaking wss://, a Spring server in the middle relaying to a RabbitMQ broker on TCP/61613, with sub-protocol token v12.stomp negotiated on the WebSocket handshake."
  - "Timeline of STOMP versions: 1.0 (mid-2000s, no heartbeats), 1.1 (2010-11, heartbeats and NACK), 1.2 (22 October 2012, ack header) — and a flat line ever since."
  - "CVE-2025-41254 cartoon: one WebSocket frame holds two STOMP frames glued together (CONNECT + SUBSCRIBE), with the SUBSCRIBE arrow racing past the lock symbol the CONNECT was supposed to set."
  - "A telnet window typing the literal string 'CONNECT\\naccept-version:1.2\\nhost:foo\\n\\n^@' and getting CONNECTED back in plain text."
---

# STOMP — Simple Text Orientated Messaging Protocol

## In one breath

STOMP is the HTTP of message queuing — a deliberately tiny, text-based wire protocol where a client types CONNECT, SUBSCRIBE, SEND, ACK, and the broker speaks back in the same readable syntax. You can literally telnet to a broker on port 61613 and run a session by hand. In 2026, every Spring Boot real-time dashboard, every Spring chat tutorial, and a long tail of RabbitMQ and ActiveMQ Artemis deployments still ride on it, twenty-one years after Brian McCallister wrote the first version.

## The pitch (cold-open)

In 2005, a developer named Brian McCallister got tired of writing Perl code to talk to enterprise message queues. The protocols of the day were binary, Java-flavored, and designed by committees. So he built the smallest, dumbest, most readable messaging protocol he could imagine — text frames, HTTP-style headers, ending in a single null byte. He called it STOMP. The official spec hasn't been updated since 22 October 2012, and the protocol is still the one Spring Boot picks for browser-to-broker pub/sub in 2026. Today we're going to walk through how a protocol you can debug with telnet outlasted half its binary competitors — and how it still produced a Spring CVE last October.

## How it actually works

STOMP assumes a reliable two-way streaming transport underneath — almost always TCP on port 61613, frequently inside a WebSocket on a `wss://` connection. Everything about retransmission and ordering is delegated to the layer below. STOMP itself only cares about framing and sessions.

A frame is one command line, then `key:value` headers, then a blank line, then an optional body, terminated by a single NULL byte (`0x00`). Versions 1.0 and 1.1 require bare LF as the line separator; version 1.2 also accepts CRLF. If the body might contain NULL bytes — for binary payloads — you must include a `content-length` header and the broker reads that many octets regardless of what's inside.

The session walkthrough is short. The client opens a TCP socket and sends `CONNECT` with `accept-version`, `host`, `login`, `passcode`, and a `heart-beat` advertisement. The broker replies `CONNECTED` with the negotiated version, a session ID, the server name, and its own `heart-beat` numbers. The client then sends `SUBSCRIBE` frames carrying a `destination` like `/topic/quotes` or `/queue/orders` and an `id` it will use to match incoming messages. To publish, the client sends `SEND` with a destination and a body. The broker delivers matching messages back as `MESSAGE` frames, each carrying the `subscription` ID, a unique `message-id`, and — in 1.2 — an `ack` token the client must echo if the subscription requires acknowledgement. To shut down cleanly, the client sends `DISCONNECT` with a `receipt:` header and waits for the matching `RECEIPT` before closing the socket.

### Header at a glance

- `accept-version`, `host`, `login`, `passcode`, `heart-beat` — the CONNECT side of the handshake.
- `version`, `session`, `server`, `heart-beat`, `user-id` — the CONNECTED reply.
- `destination` — required on SEND, SUBSCRIBE, and MESSAGE. The string is opaque to the spec — `/queue/foo` and `/topic/bar` mean whatever the broker decides they mean.
- `id` and `subscription` — pair a SUBSCRIBE to the MESSAGE frames it triggers.
- `ack` — in 1.2, a token the broker puts on each MESSAGE that the client must echo on ACK or NACK. In 1.0 and 1.1, `message-id` plays this role.
- `receipt` — request a confirmation; the broker replies with `RECEIPT` carrying `receipt-id`.
- `transaction` — group SEND and ACK frames between BEGIN and COMMIT.
- `content-type`, `content-length`, `expires`, `persistent`, `reply-to` — body and broker hints.
- Vendor-specific headers extend the base set: RabbitMQ adds `prefetch-count`, `x-stream-offset`, `x-queue-name`; ActiveMQ adds `activemq.prefetchSize`; Artemis uses `consumer-window-size` and `durable-subscription-name`.

Headers are UTF-8. Starting in 1.1, the structural characters `:`, CR, LF, and `\` inside a header value must be C-style escaped — `\c` for colon, `\n` for LF, `\r` for CR, `\\` for backslash. Servers and clients must not silently trim or pad header values with spaces. The CONNECT and CONNECTED frames are exempt from escaping for backward compatibility with 1.0, which is exactly the kind of ancient quirk that bites you years later.

### State machine in three sentences

A connection moves CLOSED to CONNECTING when the TCP socket opens, then to CONNECTED once the broker returns the CONNECTED frame. From there it stays in CONNECTED, possibly with one or more SUBSCRIBED subscriptions and possibly inside an IN_TX transaction between BEGIN and COMMIT or ABORT. A clean DISCONNECT plus matching RECEIPT walks the connection through CLOSING to CLOSED; any unexpected frame or protocol violation transitions to ERROR_CLOSING and the broker drops the socket.

### Reliability, flow control, and security mechanics

STOMP's reliability story is simple: it leans on TCP for ordering and retransmission, and adds optional acknowledgements on top. Three ack modes matter. `auto` means the broker considers a message delivered the moment it sends it — at-most-once. `client` means a single ACK acknowledges every message up to and including that one — easy to misuse. `client-individual` means each MESSAGE must be acked separately — the mode most apps actually want.

Flow control didn't exist before 1.1. A slow consumer in a STOMP 1.0 world could silently fall behind until the broker ran out of memory. STOMP 1.1 added bidirectional heart-beats: in CONNECT the client sends `heart-beat:cx,cy` where `cx` is the smallest interval in milliseconds at which it can send a heart-beat and `cy` the smallest at which it would like to receive one. The server replies with its own pair, and the negotiated outgoing rate is `MAX(cx, sy)`, the negotiated incoming rate is `MAX(sx, cy)`. A heart-beat on the wire is a single LF byte — `0x0A`. Spring's `WebSocketStompClient` defaults to ten seconds in each direction; ActiveMQ Artemis enforces a minimum of 500 milliseconds.

Security is essentially nothing, by design. STOMP defines `login` and `passcode` headers in CONNECT and stops there. There is no built-in encryption, no built-in authentication beyond a username and password in the clear, no checksum at the application layer. You run STOMP over TLS — `stomp+ssl://` on port 61614 by convention — or over `wss://` for browser clients. Everything else, including SASL or x.509 client certs, is up to the broker. RabbitMQ's STOMP plugin supports TLS client certificate auth and Basic auth over Web-STOMP if you turn them on.

## Where it shows up in production

The single largest user base in 2026 is **Spring Boot WebSocket apps**. Spring Framework's `spring-messaging` module makes STOMP-over-WebSocket the default way to build a message router for a browser app — you annotate methods with `@MessageMapping`, configure either an `enableSimpleBroker` in-memory broker or an `enableStompBrokerRelay` that proxies to a real RabbitMQ or ActiveMQ, and Spring handles the rest. Toptal's STOMP-over-WebSocket guide was last refreshed on 10 March 2026, which is a fair indicator the practice is still very current. WebSocket.org's 2026 Spring Boot guide flatly states that Spring's choice of STOMP, instead of inventing a custom format, is the single reason STOMP remains relevant.

**Adobe Commerce** uses ActiveMQ Artemis with STOMP for its message-queue layer; Adobe's installation guide was last updated 11 December 2025. **CERN's Messaging Service** publishes a public STOMP guide at `mig-user.docs.cern.ch/stomp.html` for scientific collaborations. **ChatKitty** built its proprietary StompX extension on top of STOMP for real-time chat. **CloudAMQP** offers managed RabbitMQ with STOMP and Web-STOMP enabled by default on ports 61613 and 61614. Many financial firms historically used STOMP via ActiveMQ for order routing, although a lot of them have since moved to AMQP 1.0 or proprietary protocols.

The broker side is dominated by three projects. **Apache ActiveMQ Classic** has shipped native STOMP since the project existed — port 61613 by default, alongside OpenWire on 61616. **Apache ActiveMQ Artemis**, formerly Red Hat's HornetQ, was donated to the ASF in 2014 and promoted to a top-level Apache project on 3 December 2025. Artemis is the broker the ActiveMQ project plans to converge on, supports STOMP 1.0, 1.1 and 1.2 natively, enforces a 500 millisecond minimum heart-beat, and added WebSocket compression for STOMP, MQTT, and AMQP in 2.40+. **RabbitMQ** keeps two plugins — `rabbitmq_stomp` on port 61613 and `rabbitmq_web_stomp` exposing a `/ws` WebSocket on port 15674. The frame size limit is 4 MB by default, the default user is `guest/guest`, and internally the plugin proxies STOMP into AMQP 0-9-1 — a translation tax RabbitMQ engineering openly acknowledges hurts performance compared to native AMQP.

The client surface is wide. `@stomp/stompjs` 7.x is the current JavaScript and TypeScript client, working in browsers and Node and supporting SockJS fallback. `stomp.py` 8.2.0 was published in October 2024. The Ruby `stompgem/stomp` traces directly back to Brian McCallister's original gem. There are active clients for PHP, Go, .NET, Objective-C, Delphi, plus community implementations in Erlang, Haskell, Tcl, OCaml, Lua, Smalltalk, and Pharo — the official site's promise that "many developers have written a STOMP client in a couple of hours" is verifiable by counting them.

A peer-reviewed comparison published in *Telecom* 2023 by Maharjan, Chy, Arju, and Cerny at Baylor found Apache Kafka significantly outperformed RabbitMQ, ActiveMQ Artemis, and Redis on throughput, while Redis had the lowest latency. Pure STOMP throughput numbers are rarely quoted because STOMP is almost always proxied; CloudAMQP's `websockets-rabbitmq-benchmarks` repo finds that for `web-stomp` the practical bottleneck is connection setup, not steady-state throughput.

## Things that go wrong

**CVE-2025-41254 — the Spring STOMP-over-WebSocket auth bypass.** This is the most important STOMP-shaped failure of the last 24 months. Disclosed on 16 October 2025, CVSS 4.3 medium, CWE-352. The bug was in `StompSubProtocolHandler` — Spring's class that demultiplexes STOMP frames out of WebSocket messages. A WebSocket message can carry multiple STOMP frames concatenated. The handler dispatched each one to its worker in order, but the per-session authentication state wasn't bound to the channel until *after* the first CONNECT frame finished processing. So an attacker could send one WebSocket frame containing CONNECT immediately followed by SUBSCRIBE to a sensitive destination. The SUBSCRIBE was processed before the CONNECT had finished authenticating, and `getUser()` fell back to the underlying WebSocket principal — anonymous, or a low-privilege user who had no STOMP-level access. The SUBSCRIBE succeeded; messages started flowing.

The reporter was Jannis Kaiser. Affected versions: every Spring Framework branch from 5.3.0 through 5.3.45, 6.0.x in full, 6.1.x through 6.1.23, and 6.2.x through 6.2.11 — every STOMP-over-WebSocket app built in the last decade. The fix landed in open-source Spring 6.2.12, with 6.1.24 and 5.3.46 released only on commercial subscriptions. The lesson is that the STOMP spec hasn't changed since 2012; the bug was in *how a framework reasoned about state between two protocol layers*, the WebSocket connection on top and the STOMP session on the bottom. Every frozen protocol you depend on has a year-2025-style CVE somewhere in its future.

**The 2023–2024 ActiveMQ exploitation wave — CVE-2023-46604.** The famous OpenWire RCE (CVSS 9.8) hit ActiveMQ Classic 5.x before 5.15.16, 5.16.7, 5.17.6, and 5.18.3. It was *not* a STOMP vulnerability — the bug was in the OpenWire marshaller's class-name validation — but STOMP got tarred by association because ActiveMQ is the common host. Exploited in the wild from at least 11 October 2023 per Cybereason. HelloKitty ransomware, Kinsing, the GoTitan botnet, TellYouThePass ransomware, and Mirai variants all leveraged it. CISA added it to the Known Exploited Vulnerabilities catalogue. Shadowserver counted 7,249 publicly accessible ActiveMQ services worldwide; 3,329 were vulnerable. The lesson for STOMP shops: even a STOMP-only environment still needs to firewall the *other* ports its broker exposes — OpenWire on 61616, the web console, the Jolokia management endpoint.

**CVE-2026-33227 — ActiveMQ Classic Stomp consumer path traversal.** Listed on the ActiveMQ Classic security advisories page. The advisory text says "in two instances (when creating a Stomp consumer and also browsing messages in the Web console) an authenticated user provided 'key' value could…" — i.e., a STOMP-consumer-creation path could traverse the classpath. Lower severity than the Spring CVE, but a direct STOMP-touching vulnerability.

**CVE-2015-5254 — ActiveMQ unsafe JMS deserialization.** Affected 5.0.0 through 5.12.1. The broker did not restrict classes that could be deserialized in JMS `ObjectMessage`s. Anyone who could send messages over *any* protocol the broker exposed — OpenWire or STOMP — could trigger arbitrary RCE when those messages were later deserialized. STOMP was a delivery vector here: SEND an `application/x-java-serialized-object` payload onto a queue, wait for a consumer to pick it up. Fixed in 5.13.0. The point is that a "simple" wire protocol like STOMP can still be a loaded gun if the broker's JMS bridge does dangerous things with the body.

**CVE-2026-34197 — ActiveMQ Jolokia RCE.** Disclosed in April 2026, added to CISA KEV the same month. Authenticated, but default credentials and the older CVE-2024-32114 (which had exposed Jolokia without auth on 6.0.0 through 6.1.1) made it effectively unauthenticated. ShadowServer counted 7,500 exposed ActiveMQ instances; CISA gave US federal agencies two weeks to patch. Patched in 5.19.6 and 6.2.5. Not STOMP per se, but every ActiveMQ host that exposes STOMP also exposes Jolokia by default — you must remember to lock both down.

## Common pitfalls (for the practitioner)

- **Default credentials.** RabbitMQ STOMP plugin ships with `guest/guest` (which works only from localhost by default — but operators routinely override that and forget). ActiveMQ Classic ships with `admin/admin`. The 2023–2026 ransomware wave exploited exactly this combination. Change credentials before exposing port 61613 to anything you don't fully control.

- **Prefetch unlimited.** RabbitMQ's STOMP plugin defaults to unlimited prefetch — a slow consumer will silently accumulate millions of unacknowledged messages until your broker runs out of memory. Set `prefetch-count` on every SUBSCRIBE for any non-trivial workload. On Artemis the equivalent is `consumer-window-size`.

- **`auto` ack on at-least-once data.** The default in many client libraries. It means at-most-once: if the consumer crashes between receiving and processing, the message is gone. Use `client-individual` for at-least-once. Don't use bare `client` mode unless you understand it acks every prior message on the subscription.

- **Heart-beat off by default in clients.** `stomp.py` defaults to `heartbeats=(0, 0)`. Set it explicitly. Aggressive 1-second heart-beats on a lossy network produce false disconnects; zero heart-beats over an idle TCP connection get killed silently by NAT timeout. Pick something in the seconds range and agree on both sides.

- **`content-length` confusion with binary bodies.** Forget it on a body that contains a NULL byte and the broker truncates at the first NULL. If the body might be binary, set `content-length`.

- **ACK semantics drift between 1.1 and 1.2.** In 1.0 and 1.1 you ack by `message-id`; in 1.2 you ack by the `ack` token the broker put on the MESSAGE. Mixing client and broker versions on this point is the most common version-mismatch bug.

- **The DISCONNECT race.** `DISCONNECT` without a `receipt:` header is a race — the server may not have flushed your last SEND. Always send a receipt and wait for the matching RECEIPT before closing the socket.

- **Spring SockJS heartbeats on top of STOMP heartbeats.** When STOMP heart-beats are negotiated, SockJS heart-beats are supposed to be disabled. If you configure both, you can get a 25-second SockJS heartbeat fighting a 10-second STOMP heartbeat.

- **STOMP behind an HTTP proxy that strips `Upgrade`.** The WebSocket handshake fails. Use a TCP-aware proxy — HAProxy in TCP mode, or nginx with `proxy_set_header Upgrade $http_upgrade`.

- **Header injection on pre-1.1 code paths.** Pre-1.1, header values were not escaped. The 1.2 spec still exempts CONNECT and CONNECTED from escaping for backward compatibility. A `\n` in a user-supplied header could split a frame. The Spring CSRF (CVE-2025-41254) is morally adjacent.

## Debugging it

- **Telnet a broker.** `telnet broker 61613`, then type `CONNECT\naccept-version:1.2\nhost:foo\n\n` followed by Ctrl+@ for the NULL terminator. The broker should respond with a plaintext `CONNECTED` frame. This is the fastest "is the broker alive" test in messaging — and the design constraint that explains every other choice STOMP made.

- **Wireshark.** A community Lua STOMP dissector exists for off-WebSocket STOMP, referenced on the Wireshark Q&A forum. For STOMP-over-WebSocket, the built-in WebSocket dissector handles the framing and the payload is plaintext STOMP you can read directly in the packet pane. There is nothing to decrypt or unmask beyond the WebSocket layer.

- **Spring server-side.** Enable DEBUG logging on `org.springframework.web.socket.messaging.StompSubProtocolHandler` and `org.springframework.messaging`. Spring exposes CONNECT, CONNECTED, and DISCONNECT counts as JMX and Micrometer metrics on `stompSubProtocolHandler`.

- **Artemis broker.** Enable DEBUG on `org.apache.activemq.artemis.core.protocol.stomp.StompConnection` to log raw STOMP frames per connection ID.

- **`stomp.py` CLI.** The Python client ships as a standalone command-line tool; `pip install stomp.py` and you can send and receive a test message from a script in two minutes.

- **`@stomp/stompjs` debug callback.** Set `client.debug = console.log` in the browser to print every STOMP frame to the console.

- **RabbitMQ Management plugin.** The built-in web UI on port 15672 shows live STOMP connections, subscriptions, and message rates per protocol.

- **Things to monitor.** STOMP connection count per protocol, heart-beat misses (a proxy for dead clients or bad NAT), ACK lag (time between MESSAGE delivery and ACK as a proxy for consumer health), per-destination depth and consumer count.

## What's changing in 2026

- **April 2026.** CISA added CVE-2026-34197 (ActiveMQ Jolokia RCE) to its Known Exploited Vulnerabilities catalogue. Patched in ActiveMQ 5.19.6 and 6.2.5.

- **3 December 2025.** The Apache Software Foundation promoted **Apache Artemis** (formerly ActiveMQ Artemis) to a Top-Level Project. Artemis is what the ActiveMQ project plans to converge on once it has feature parity with Classic, and it is the broker most likely to host new STOMP deployments through the 2026–2030 window.

- **16 October 2025.** **CVE-2025-41254** disclosed — the Spring STOMP-over-WebSocket auth bypass discussed above. Fixed in Spring Framework 6.2.12 (open source) and in commercial back-ports for 6.1.24 and 5.3.46. The highest-impact STOMP-specific CVE in years.

- **2025.** ActiveMQ Artemis 2.40.x added **WebSocket compression for AMQP, STOMP, and MQTT** per the Artemis release notes.

- **2024–2025.** RabbitMQ 4.x re-architected its native protocol stack so AMQP 1.0 became "core." STOMP still proxies internally via AMQP 0-9-1 in the plugin, which constrains its scalability compared to native AMQP 1.0 — a meaningful long-term trend.

- **2026 status, summarised.** Spring Framework 7.x continues to ship STOMP-over-WebSocket support (current stable lines: 7.0.x and 6.2.x as of May 2026). No deprecation has been signalled. The protocol spec itself has had no new release since 22 October 2012. A draft `stomp-specification-2.0.md` exists in the GitHub repo but has had no public momentum for years. The protocol is effectively frozen.

- **What is replacing it (or not).** MQTT 5 has eaten the IoT use case STOMP never really won. AMQP 1.0 has become RabbitMQ 4.0's core protocol and is Azure Service Bus's native protocol — for new enterprise designs in 2026, AMQP 1.0 is the safer long-term bet. gRPC streaming and HTTP/2 are taking the structured-RPC and streaming use cases that STOMP-over-WebSocket would once have served, especially service-to-service. SSE and WebTransport are nibbling at one-way browser-push use cases — SSE in particular is much simpler than STOMP-over-WebSocket if you only need server-to-client.

## Fun facts (host material)

- **The name actually changed.** STOMP started as **TTMP** — Text-To-Messaging Protocol. Brian McCallister announced the rename on his blog `kasparov.skife.org` on 23 August 2005 with the punchline "TTMP has always been a temporary (TMP, get it?) working name." Multiple secondary sources — Wikipedia, OMG Wiki, Cheetah Networks — preserve the old TTMP name in their etymology notes.

- **The "S" is genuinely contested.** Brian's original 2005 blog post explicitly says "**Streaming** Text Oriented Messaging Protocol." The current `stomp.github.io` homepage says "**Simple** Text Oriented Messaging Protocol." Wikipedia hedges: "Simple (or Streaming)." CERN's docs say "Streaming Text Orientated Messaging Protocol or Simple Text Oriented Messaging Protocol." STOMP is one of the very few application protocols whose acronym expansion is officially ambiguous.

- **The Telnet test is the design constraint.** Hiram Chirino, the long-time ActiveMQ committer who became the spec's practical steward from around 2009, wrote in a 2009 blog post that "one of the tenets of the protocol was for it to be simple enough to even use by user which directly connects to a server via telnet." That single line explains every design choice STOMP made — text frames, HTTP-style headers, NULL terminator.

- **Why text-based when binary dominates messaging.** Brian's design choice was driven by scripting-language ergonomics. Ruby, Perl, and Python in 2005 had no good binary-protocol libraries, and writing one was a weekend project, not a quarter project. Same reason JSON beat XML and Thrift in web APIs.

- **STOMP as a WebSocket sub-protocol predates the WebSocket RFC.** Jeff Mesnil's `stomp-websocket` library was layering STOMP onto early WebSocket implementations *before* RFC 6455 was finalised in 2011. Which is why the negotiated sub-protocol tokens are still `v10.stomp`, `v11.stomp`, and `v12.stomp` rather than something more formal.

- **The "Stomp" theatrical show is unrelated** but adds enormously to search-engine confusion. That show was created in 1991 in Brighton, UK by Steve McNicholas and Luke Cresswell.

- **Spec frozen for 14 years and still mainstream.** STOMP 1.2 dropped on 22 October 2012 and there has been no released update since. Yet a 2026 search of Apache Artemis docs, Spring Framework 7's reference, RabbitMQ 4's plugin docs, and Adobe Commerce's deployment guides all describe production deployments using STOMP as a current, supported, recommended protocol. It is one of the longest-stable application protocols in active use.

## Where this connects in the book

The dump lists no book chapters that reference STOMP directly. The historical narrative for messaging-broker protocols in our book sits primarily in the chapters covering AMQP and the broader async/IoT category — STOMP's story (the Codehaus origin, the TTMP rename, the freeze in 2012) is told here in this protocol blueprint rather than deferred to a chapter episode.

## See also (other protocol episodes)

- **The TCP episode.** STOMP layers directly on TCP and delegates everything about reliability to it — ordering, retransmission, flow control, the 16-bit checksum. STOMP cannot run on UDP because frames may exceed a datagram and ordering is required. If you want to understand why STOMP could afford to be so minimal, listen to the TCP episode first — TCP did all the hard work.

- **The WebSocket episode.** STOMP is the dominant *sub-protocol* used over WebSocket in browser apps. The browser opens the WebSocket handshake with `Sec-WebSocket-Protocol: v10.stomp, v11.stomp, v12.stomp`; the server picks one, and from then on every STOMP frame is wrapped inside one or more WebSocket text or binary frames. Browsers cannot speak raw TCP, so STOMP-over-WebSocket is the only way to talk STOMP from a page. If you've heard the WebSocket episode, this is the most common payload it carries in Spring Boot apps.

- **The AMQP episode.** STOMP and AMQP are peers and competitors. AMQP 0.9.1 (RabbitMQ's native) and AMQP 1.0 (an OASIS standard) are binary, define exchanges and bindings and queues precisely, and target high-feature enterprise routing. STOMP is text, treats destinations as opaque strings, and ships in fewer than 30 pages of spec. RabbitMQ's STOMP plugin actually proxies STOMP into AMQP 0-9-1 internally, which the RabbitMQ team admits hurts performance compared to native AMQP. If you've heard the AMQP episode, the contrast is everything.

- **The MQTT episode.** STOMP and MQTT are siblings in the lightweight pub/sub family but with very different DNA. MQTT (OASIS, versions 3.1.1 and 5.0) is binary and explicitly designed for IoT and constrained devices: tiny frame headers, retained messages, last-will, three QoS levels. STOMP is text, fatter on the wire, and trivially debuggable. RabbitMQ supports both via separate plugins; ActiveMQ supports both natively. MQTT has eaten STOMP's lunch in IoT; STOMP has retained the browser, web, and Java sub-protocol niche.

- **The XMPP episode.** STOMP and XMPP rarely overlap in production. XMPP is also XML-text and pub/sub-capable, but it is fundamentally a presence-and-IM protocol with stanzas, rosters, and federation. Nobody chooses XMPP for queue-style backend messaging, and nobody chooses STOMP for instant-messaging federation.

- **The HTTP/1.1 episode.** STOMP is openly modelled on HTTP — "a frame consists of a command, a set of optional headers and an optional body" is straight out of HTTP/1.1. The CONNECT and CONNECTED pair is the moral equivalent of an HTTP request and response, and the header syntax is identical. The differences: STOMP runs over a long-lived bidirectional connection, supports server-pushed MESSAGE frames, and uses a NULL terminator instead of `Content-Length` or chunked encoding.

## Visual cues for image generation

- A side-by-side of an HTTP request and a STOMP CONNECT frame, lined up so the matching parts (command line, headers, blank line, body) glow in the same color.
- Annotated bytes of a real STOMP MESSAGE frame ending in the NULL terminator (`0x00`), with the heart-beat LF byte (`0x0A`) called out as a separate tiny pulse on the wire.
- A browser tab speaking `wss://`, a Spring server in the middle relaying to a RabbitMQ broker on TCP/61613, with the sub-protocol token `v12.stomp` negotiated on the WebSocket handshake.
- Timeline of STOMP versions: 1.0 (mid-2000s, no heartbeats), 1.1 (2010-11, heartbeats and NACK), 1.2 (22 October 2012, ack header) — and a flat line ever since.
- CVE-2025-41254 cartoon: one WebSocket frame holds two STOMP frames glued together (CONNECT + SUBSCRIBE), with the SUBSCRIBE arrow racing past the lock symbol the CONNECT was supposed to set.
- A telnet window typing the literal string `CONNECT\naccept-version:1.2\nhost:foo\n\n^@` and getting `CONNECTED` back in plain text on port 61613.

## Sources

**Specifications**

- [STOMP 1.2 specification](https://stomp.github.io/stomp-specification-1.2.html)
- [STOMP 1.1 specification](https://stomp.github.io/stomp-specification-1.1.html)
- [STOMP 1.0 specification](https://stomp.github.io/stomp-specification-1.0.html)
- [STOMP project homepage](https://stomp.github.io/)
- [STOMP spec GitHub repo (incl. draft 2.0)](https://github.com/stomp/stomp-spec)

**Vendor and engineering docs**

- [RabbitMQ STOMP plugin docs](https://www.rabbitmq.com/docs/stomp)
- [RabbitMQ Web-STOMP plugin docs](https://www.rabbitmq.com/docs/web-stomp)
- [RabbitMQ heartbeats docs](https://www.rabbitmq.com/docs/heartbeats)
- [RabbitMQ "Which protocols does RabbitMQ support?"](https://www.rabbitmq.com/docs/protocols)
- [RabbitMQ STOMP plugin GitHub](https://github.com/rabbitmq/rabbitmq-stomp)
- [ActiveMQ Artemis STOMP docs](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- [ActiveMQ Artemis Versions / release notes](https://artemis.apache.org/components/artemis/documentation/latest/versions.html)
- [ActiveMQ Classic security advisories](https://activemq.apache.org/components/classic/security)
- [ActiveMQ Artemis security advisories](https://artemis.apache.org/components/artemis/security)
- [Spring Framework STOMP reference](https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html)
- [Spring Framework STOMP Client reference](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/client.html)
- [Spring Framework Enable STOMP](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html)
- [Spring Framework SockJS Fallback](https://docs.spring.io/spring-framework/reference/web/websocket/fallback.html)
- [Spring guide: Using WebSocket to build an interactive web application](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [Spring guides repo gs-messaging-stomp-websocket](https://github.com/spring-guides/gs-messaging-stomp-websocket)
- [Adobe Commerce ActiveMQ Artemis docs](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq)
- [CloudAMQP STOMP guide](https://www.cloudamqp.com/docs/stomp.html)
- [CloudAMQP Web-STOMP guide](https://www.cloudamqp.com/docs/stomp_over_websockets.html)
- [CERN messaging service STOMP guide](https://mig-user.docs.cern.ch/stomp.html)
- [Red Hat AMQ 6.2 Stomp Heartbeats docs](https://access.redhat.com/documentation/en-us/red_hat_amq/6.2/html/client_connectivity_guide/fmbstompheart)

**Client libraries**

- [@stomp/stompjs GitHub](https://github.com/stomp-js/stompjs/)
- [StompJS Family docs](https://stomp-js.github.io/)
- [stomp.py GitHub](https://github.com/jasonrbriggs/stomp.py)
- [stomp.py PyPI](https://pypi.org/project/stomp.py/)
- [stompgem/stomp Ruby](https://github.com/stompgem/stomp)
- [stomp-php changelog](https://github.com/stomp-php/stomp-php/blob/master/CHANGELOG.md)
- [Go stomp package](https://pkg.go.dev/gopkg.in/stomp.v3)
- [stomp-php examples](https://github.com/stomp-php/stomp-php-examples)
- [Ruby stomp gem (Brian McCallister et al.)](https://rubygems.org/gems/stomp/versions/1.2.0)

**Vulnerabilities and incidents**

- [CVE-2025-41254 Spring STOMP advisory](https://spring.io/security/cve-2025-41254/)
- [CVE-2025-41254 GitHub Advisory](https://github.com/advisories/GHSA-7fch-4f2f-jcgm)
- [CVE-2025-41254 technical analysis (Miggo)](https://www.miggo.io/vulnerability-database/cve/CVE-2025-41254)
- [CVE-2025-41254 (Broadcom Layer 7 Gateway notice)](https://knowledge.broadcom.com/external/article/424056/api-layer-7-gateway-spring-framework-cv.html)
- [CVE-2014-3576 ActiveMQ Remote Unauthenticated Shutdown](https://nvd.nist.gov/vuln/detail/CVE-2014-3576)
- [CVE-2015-5254 ActiveMQ JMS deserialization (Apache advisory)](https://activemq.apache.org/security-advisories.data/CVE-2015-5254-announcement.txt)
- [CVE-2015-5254 NVD](https://nvd.nist.gov/vuln/detail/cve-2015-5254)
- [CVE-2023-46604 ActiveMQ OpenWire RCE (Apache news)](https://activemq.apache.org/news/cve-2023-46604)
- [CVE-2023-46604 Apache advisory text](https://activemq.apache.org/security-advisories.data/CVE-2023-46604-announcement.txt)
- [CVE-2026-34197 ActiveMQ Jolokia RCE (Horizon3)](https://horizon3.ai/attack-research/disclosures/cve-2026-34197-activemq-rce-jolokia/)
- [CVE-2026-34197 CISA KEV addition (BleepingComputer)](https://www.bleepingcomputer.com/news/security/cisa-flags-apache-activemq-flaw-as-actively-exploited-in-attacks/)
- [CVE-2026-33227 ActiveMQ Classic STOMP-implicated advisory](https://activemq.apache.org/security-advisories.data/CVE-2026-33227-announcement.txt)
- [CVE-2026-27446 Artemis Core federation auth bypass](https://advisories.gitlab.com/pkg/maven/org.apache.artemis/artemis-server/CVE-2026-27446/)

**Engineering blogs and tutorials**

- [Brian McCallister, "TTMP is named Stomp!" 23 August 2005](http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html)
- [Hiram Chirino blog, STOMP tag](https://hiramchirino.com/tags/stomp)
- [HornetQ Team Blog, "Stomp 1.1 Support in HornetQ", October 2011](http://hornetq.blogspot.com/2011/10/stomp-11-support-in-hornetq.html)
- [Habarisoft blog, "STOMP Protocol Specification, Version 1.2 released", 23 October 2012](https://blog.habarisoft.com/2012/10/23/stomp-protocol-specification-version-1-2-released/)
- [Habarisoft blog, "AMQP, MQTT, and STOMP Messaging Protocols compared"](https://blog.habarisoft.com/2014/04/amqp-mqtt-and-stomp-messaging-protocols-compared/)
- [Toptal: Using Spring Boot for WebSocket Implementation with STOMP (updated 10 March 2026)](https://www.toptal.com/java/stomp-spring-boot-websocket)
- [WebSocket.org: Spring Boot WebSocket: STOMP, Raw Handlers, Scaling](https://websocket.org/guides/frameworks/spring-boot/)
- [CloudAMQP blog: RabbitMQ and WebSockets, Part 1: AMQP, MQTT, and STOMP](https://www.cloudamqp.com/blog/rabbitmq-and-websockets-part-1-amqp-mqtt-stomp.html)
- [Red Hat Developer: Using the STOMP Protocol with Apache ActiveMQ Artemis Broker](https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python)
- [Jeff Mesnil's stomp-websocket annotated source](https://jmesnil.net/stomp-websocket/doc/stomp.html)
- [ChatKitty: Keeping Real-Time Messaging Simple With STOMP](https://chatkitty.com/blog/keeping-real-time-messaging-simple-with-stomp)
- [RabbitMQ engineering blog, performance tag](https://www.rabbitmq.com/blog/tags/performance)
- [Wireshark Q&A on STOMP dissector](https://osqa-ask.wireshark.org/questions/43861/wireshark-stomp-protocol-dissector/)
- [O'Reilly, Jeff Mesnil, Mobile and Web Messaging, Chapter 4: Advanced STOMP](https://www.oreilly.com/library/view/mobile-and-web/9781491944790/ch04.html)
- [CloudAMQP websockets-rabbitmq-benchmarks](https://github.com/cloudamqp/websockets-rabbitmq-benchmarks)
- [Codehaus history page](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)
- [Codehaus stomp repo](https://github.com/codehaus/stomp)

**News**

- [Apache: Artemis becomes Top-Level Project, 3 December 2025](https://news.apache.org/foundation/entry/the-apache-software-foundation-announces-new-top-level-projects-3)
- [InfoQ: The Demise of Open Source Hosting Providers Codehaus and Google Code, March 2015](https://www.infoq.com/news/2015/03/codehaus-google-code/)
- [NCSC Ireland ActiveMQ accessible-service report](https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/)
- [Cybereason: Beware of the Messengers, Exploiting ActiveMQ Vulnerability](https://www.cybereason.com/blog/beware-of-the-messengers-exploiting-activemq-vulnerability)
- [Rapid7: Suspected Exploitation of Apache ActiveMQ CVE-2023-46604](https://www.rapid7.com/blog/post/2023/11/01/etr-suspected-exploitation-of-apache-activemq-cve-2023-46604/)
- [Trend Micro: CVE-2023-46604 Exploited by Kinsing](https://www.trendmicro.com/en_us/research/23/k/cve-2023-46604-exploited-by-kinsing.html)

**Wikipedia**

- [Wikipedia: Streaming Text Oriented Messaging Protocol](https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol)
- [Wikipedia: Stomp (theatrical show)](https://en.wikipedia.org/wiki/Stomp_(theatrical_show))

**Research**

- [Maharjan, Chy, Arju, Cerny (Baylor), Telecom 2023 message-broker benchmark (via SISsurvey)](https://www.sissurvey.net/activemq-vs-rabbitmq/)
- [Pragmatic comparison of IoT messaging protocols (PubMed Central, 2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8540579/)
