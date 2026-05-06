---
prompt_source: deep-research-prompts.txt:5576-5753 (STOMP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/2889992d-cb09-4da5-9c45-c9f50e4bacfa
research_mode: claude.ai Research
---

# STOMP — The Simple Text Oriented Messaging Protocol: A Deep Research Report (May 2026)

> **Bottom line up front:** STOMP is a deliberately tiny, HTTP-flavored, text-based wire protocol (created by Brian McCallister at Codehaus in mid‑2005, with the last formal spec — STOMP 1.2 — published on **22 October 2012**). In 2026 it is essentially **frozen**: nobody is shipping a 2.0, but it remains the de‑facto messaging sub‑protocol for browser-to-broker pub/sub through Spring's STOMP‑over‑WebSocket support, RabbitMQ's plugin, ActiveMQ Classic and ActiveMQ Artemis, and a long tail of language clients. The most important development of the last 24 months is not a new STOMP version — it is **CVE‑2025‑41254**, a CSRF/auth-bypass in Spring's STOMP-over-WebSocket handler (October 2025), and **Apache Artemis becoming a top-level Apache project on 3 December 2025**, which keeps STOMP's biggest server-side citizen alive and well-funded. [Stomp](https://stomp.github.io/)

---

## 1. Prerequisites and glossary

These are the concepts you need before STOMP becomes obvious. Every definition is intentionally short; the link is to the canonical source.

- **OSI / TCP-IP layers.** STOMP is an *application-layer* (OSI L7) protocol that runs on top of a reliable byte stream — almost always **TCP** (OSI L4), and frequently *over* WebSocket which itself runs over TCP (and starts life as an HTTP/1.1 Upgrade). See Wikipedia: OSI model and IETF RFC 793 (TCP).
- **TCP (Transmission Control Protocol).** Reliable, ordered, full-duplex byte stream between two endpoints identified by IP+port. STOMP delegates everything about reliability of bytes to TCP. (RFC 9293, 2022 update of RFC 793.)
- **Socket.** OS abstraction representing one end of a network connection: `(protocol, local IP, local port, remote IP, remote port)`. STOMP clients open a TCP socket to the broker, typically on port 61613.
- **Stream.** Continuous, ordered sequence of bytes. STOMP is a *frame stream*: many frames serialized over one TCP stream.
- **Frame.** A single self-contained protocol message. In STOMP a frame = `COMMAND\n header:value\n header:value\n \n body \0`.
- **Datagram.** Self-contained packet (UDP-style). STOMP does *not* use datagrams; it requires a reliable 2-way streaming transport.
- **Header.** Key/value metadata attached to a frame (modelled directly on HTTP headers).
- **Checksum.** Integrity field. STOMP has **no application-level checksum**; it relies on TCP's 16-bit checksum and (when used) TLS's MAC.
- **Handshake.** Initial exchange that establishes session state. STOMP's handshake is `CONNECT` (or `STOMP`) → `CONNECTED`.
- **Message broker.** A server that receives messages from producers and forwards them to consumers via queues/topics. ActiveMQ, RabbitMQ, and Artemis are STOMP brokers.
- **Pub/Sub (publish-subscribe).** Messaging pattern where senders publish to a logical destination and any number of subscribers receive a copy.
- **Queue.** Point-to-point destination — each message is delivered to exactly one consumer.
- **Topic.** Pub/sub destination — each message is delivered to *every* current subscriber.
- **Destination.** STOMP's deliberately under-defined string identifier (`/queue/foo`, `/topic/bar`, `/exchange/x`). The spec treats it as opaque; brokers map it to their internal model. [Stomp](https://stomp.github.io/stomp-specification-1.2.html)[Stomp](https://stomp.github.io/stomp-specification-1.1.html)
- **Message-oriented middleware (MOM).** Category of software that decouples producers from consumers via asynchronous messages — STOMP is one wire protocol for talking to MOM.
- **JMS (Java Message Service).** A Java *API* (not a wire protocol) for messaging. STOMP is often implemented over JMS brokers (ActiveMQ, Artemis).
- **WebSocket.** Standardized in RFC 6455 (2011). Full-duplex framed channel over a single TCP connection, opened by an HTTP `Upgrade`. STOMP rides inside WebSocket frames in browser apps.
- **Sub-protocol.** Higher-level protocol negotiated during the WebSocket handshake using the `Sec-WebSocket-Protocol` header (e.g. `v12.stomp`).
- **TLS.** Transport Layer Security. STOMP has *no* native crypto; encryption and authentication-of-server are provided by running STOMP over TLS (port 61614 by convention) or by running over `wss://`.
- **UTF-8.** STOMP's default header encoding; bodies may be binary.
- **Augmented BNF.** The grammar notation borrowed from RFC 2616 (HTTP/1.1) used to define STOMP frame syntax.
- **Heart-beat.** Bidirectional liveness pings introduced in STOMP 1.1; format `cx,cy` ms in the `heart-beat` header.
- **Receipt.** Optional client-requested acknowledgement that a frame was processed (RECEIPT frame).
- **Prefetch / consumer-window-size.** Broker setting that limits how many unacknowledged messages a subscriber can hold.

---

## 2. History and story

**Origins (2003 → 2005).** Brian McCallister, then a developer active at the open-source forge **Codehaus** (registered 26 February 2003 by Bob "The Despot" McWhirter), started building a small text protocol he initially called **TTMP** (Text-To-Messaging Protocol — and as Brian himself put it, "TTMP has always been a temporary (TMP, get it?) working name until the right one came along"). On **23 August 2005** he announced on his blog `kasparov.skife.org` that "TTMP is named Stomp! Finally found a good name for the little streaming text oriented messaging protocol I've been working on." That blog post is the canonical name-change source: **the "S" in STOMP originally stood for "Streaming"**, not "Simple". Today both expansions are in active use — the official site `stomp.github.io` calls it "Simple (or Streaming) Text Orientated Messaging Protocol", and Wikipedia lists "Simple (or Streaming) Text Oriented Message Protocol, formerly known as TTMP" as the canonical name. [GitHub + 5](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)

**Why it existed.** Every released spec page repeats the same motivation paragraph: "STOMP arose from a need to connect to enterprise message brokers from scripting languages such as Ruby, Python and Perl. In such an environment it is typically logically simple operations that are carried out such as 'reliably send a single message and disconnect' or 'consume all messages on a given destination'. It is an alternative to other open messaging protocols such as AMQP and implementation specific wire protocols used in JMS brokers such as OpenWire." Translated: in 2005, Java/JMS dominated enterprise messaging, but the OpenWire wire protocol and AMQP 0.9 were both opaque, binary, and Java-flavored. McCallister wanted something a Perl script could speak with `IO::Socket`. [Stomp +2](https://stomp.github.io/stomp-specification-1.1.html)

**People and organizations.**

- **Brian McCallister** — original author of the protocol and the original Ruby gem. The RubyGems entry for `stomp` still credits "Brian McCallister, Marius Mathiesen, Thiago Morello, Guy M. Allard". The README for the Ruby gem notes: "Up until March 2009 the project was maintained and primarily developed by Brian McCallister." [RubyGems](https://rubygems.org/gems/stomp/versions/1.2.0)[GitHub](https://github.com/stompgem/stomp)
- **Hiram Chirino** — long-time ActiveMQ committer (Red Hat) and the practical steward of the spec from ~2009 onward. On his personal blog he writes "I think Brian McCallister, the founding architect of protocol, will agree…". Hiram's LinkedIn calls him "Original creator of the Stomp messaging protocol", which conflates first author with primary maintainer; the contemporaneous 2005 blog post nails Brian as the originator. [Hiramchirino](https://hiramchirino.com/tags/stomp)[LinkedIn](https://www.linkedin.com/in/chirino/)
- **Codehaus** — the original forge. Registered Feb 2003, hosting `stomp.codehaus.org` until the platform was wound down in 2015 (announcement: "projects and services will be progressively taken offline from April 2nd 2015"; final shutdown 31 May 2015 after SonarSource sponsored an extra few months). The spec moved to GitHub under the `stomp` org. [GitHub + 2](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)
- **Apache ActiveMQ project** — created by founders from LogicBlaze in 2004 (also originally hosted on Codehaus), donated to the Apache Software Foundation in 2007. Native STOMP support has shipped with ActiveMQ basically since it existed. [Ncsc](https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/)
- **HornetQ → ActiveMQ Artemis** — HornetQ was donated to Apache in 2014 and rebranded as ActiveMQ Artemis. The HornetQ team blog announced "Stomp 1.1 Support in HornetQ" in October 2011. [Ncsc](https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/)[Blogger](http://hornetq.blogspot.com/2011/10/stomp-11-support-in-hornetq.html)
- **RabbitMQ team** (originally Rabbit Technologies → Pivotal → VMware → Broadcom) — has shipped a `rabbitmq_stomp` plugin since the early 3.x days; today it covers STOMP 1.0–1.2 with extensions.

**Version history (verified dates).**

- **STOMP 1.0** — informal spec, mid-2000s. The 1.0 spec page is still hosted at `stomp.github.io/stomp-specification-1.0.html`. It defined the seven client commands `SEND, SUBSCRIBE, UNSUBSCRIBE, BEGIN, COMMIT, ABORT, ACK, DISCONNECT` and four server commands `CONNECTED, MESSAGE, RECEIPT, ERROR`. **No NACK, no heart-beats, no protocol negotiation.** [Stomp](https://stomp.github.io/stomp-specification-1.0.html)[Stomp](https://stomp.github.io/stomp-specification-1.0.html)
- **STOMP 1.1** — 2010/2011. Apache Apollo, ActiveMQ, RabbitMQ and HornetQ all gained 1.1 support during this window (the HornetQ team blog post about adding 1.1 is dated October 2011). 1.1 added **protocol negotiation** (`accept-version` / `version`), **heart-beating** (`heart-beat: cx,cy`), the **`NACK` frame**, **virtual hosts** (`host` header), required header escaping, and the requirement that header keys/values are not silently trimmed. [Stomp + 2](https://stomp.github.io/stomp-specification-1.1.html)
- **STOMP 1.2** — released **22 October 2012** (`stomp.github.io` and the Habarisoft blog dated 23 Oct 2012 confirm). Two breaking changes: (a) frame lines may end with **CRLF** as well as bare LF; (b) message acknowledgement uses a dedicated **`ack` header on the MESSAGE frame** that must be echoed in the ACK/NACK, instead of using `message-id`. Otherwise it's clarifications. [O'Reilly + 2](https://www.oreilly.com/library/view/mobile-and-web/9781491944790/ch04.html)
- **STOMP 2.0** — never released. A draft `stomp-specification-2.0.md` exists in the `stomp/stomp-spec` GitHub repo and is explicitly marked as a draft (it states "STOMP 2.0 is designed so that older protocol versions can be identified and clients and servers may choose to implement older protocol versions"). There has been no public momentum behind it for years; the protocol is effectively frozen. [GitHub](https://github.com/stomp/stomp-spec/blob/master/src/stomp-specification-2.0.md)

**Politics, controversies, alternatives that didn't win.**

- The biggest design tension was always **STOMP vs. AMQP 0.9.1 vs. AMQP 1.0**. AMQP 0.9.1 (binary, RabbitMQ's native protocol) and AMQP 1.0 (an OASIS/ISO standard) both tried to be the universal interoperable messaging wire format. STOMP won the *script-friendly* niche but never displaced AMQP for enterprise routing.
- **OpenWire** (ActiveMQ's native binary wire protocol) was the JMS-aligned alternative inside the ActiveMQ ecosystem; STOMP coexisted with it as the polyglot escape hatch.
- The **destination semantics ambiguity** is a long-standing controversy: the spec deliberately says destinations are "opaque strings" and broker-implementation-specific, which means STOMP code is *not* portable between RabbitMQ (`/exchange/`, `/amq/queue/`, `/topic/`) and ActiveMQ (`/queue/`, `/topic/`). Critics call this a feature gap; defenders call it minimalism. [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)[Stomp](https://stomp.github.io/stomp-specification-1.2.html)
- **No flow control in STOMP 1.0** — pre-heart-beat, slow consumers could silently fall behind without the server noticing the connection was dead. This is one reason every modern broker mandates 1.1+.

**The Codehaus story.** Codehaus was founded in 2003 specifically as a neutral home for non-Werken-Company projects (Bob McWhirter ran Werken). It famously hosted Groovy, Mojo Maven plugins, JMock, Mule, XDoclet, Jackson, X-Stream — and STOMP. Ad revenue collapsed in the GitHub era, and on 31 May 2015 the Codehaus team raised the termination ticket with hosting provider Contegix and pulled the plug. STOMP was already on GitHub by then. [GitHub](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)[GitHub](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)

**Anything that fundamentally changed in the last 24 months (2024–2026).**

- **3 December 2025:** The Apache Software Foundation promoted **Apache Artemis** (formerly ActiveMQ Artemis) to a Top-Level Project. Artemis remains the broker the ActiveMQ project intends to converge on; it natively supports STOMP 1.0/1.1/1.2. [The ASF Blog](https://news.apache.org/foundation/entry/the-apache-software-foundation-announces-new-top-level-projects-3)
- **16 October 2025: CVE‑2025‑41254** disclosed — a Spring Framework `spring-websocket` STOMP CSRF / message-authorization-bypass that affected all 5.3.x ≤ 5.3.45, 6.0.x, 6.1.x ≤ 6.1.23, and 6.2.x ≤ 6.2.11. Fixed in 6.2.12 (and back-ported in commercial Spring builds). This is the highest-impact STOMP-specific CVE in years. [Spring](https://spring.io/security/cve-2025-41254/)
- Spring Framework 7.x continues to ship the STOMP-over-WebSocket support (current stable lines per docs: 7.0.x and 6.2.x as of May 2026). No deprecation has been signalled.
- ActiveMQ Artemis 2.40.x added **WebSocket compression for AMQP/STOMP/MQTT** (per the Artemis "Versions" page, Artemis 2.40.0 release notes).
- RabbitMQ 4.x re-architected its native protocol stack so that AMQP 1.0 became "core"; STOMP still proxies internally via AMQP 0-9-1 in the plugin, which limits its scalability vs. native AMQP 1.0. [RabbitMQ](https://www.rabbitmq.com/docs/protocols)[RabbitMQ](https://www.rabbitmq.com/blog/tags/performance)
- The protocol spec itself has had **no new release since 22 October 2012**.

---

## 3. How it actually works

### 3.1 Frame format (1.2)

STOMP assumes a "reliable 2-way streaming network protocol (such as TCP) underneath." A frame is:

```
COMMAND\n
header1:value1\n
header2:value2\n
\n
body bytes...\0
[optional trailing EOLs]
```

Frame line endings: STOMP 1.0/1.1 require bare `\n` (octet 10); STOMP 1.2 allows `\r\n` (CR LF) as well. Body is terminated by a NULL byte (`0x00`); the spec writes it as `^@`. If a `content-length:` header is present, that many octets MUST be read regardless of embedded NULLs (this is mandatory for binary bodies). [Stomp + 3](https://stomp.github.io/stomp-specification-1.2.html)

Augmented BNF from the 1.0 spec (still essentially valid):

```
frame-stream  = 1*frame
frame         = command LF *( header LF ) LF [ content ] NULL *( LF )
client-command = "SEND" | "SUBSCRIBE" | "UNSUBSCRIBE" | "BEGIN" | "COMMIT"
               | "ABORT" | "ACK" | "NACK" | "DISCONNECT" | "CONNECT" | "STOMP"
server-command = "CONNECTED" | "MESSAGE" | "RECEIPT" | "ERROR"
header         = header-name ":" header-value
```

### 3.2 Every frame type

**Client → Server**

- `CONNECT` / `STOMP` — open a session. `STOMP` is identical to `CONNECT` but a 1.2 protocol sniffer can distinguish it from HTTP.
- `SEND` — publish a message; required header `destination`. [Stomp](https://stomp.github.io/stomp-specification-1.1.html)
- `SUBSCRIBE` — register interest in a destination; required `destination` and (in 1.1+) `id`. [Stomp](https://stomp.github.io/stomp-specification-1.1.html)
- `UNSUBSCRIBE` — cancel a subscription by `id`.
- `ACK` — acknowledge a MESSAGE in client-ack mode. In 1.0/1.1 keyed by `message-id`; in 1.2 keyed by the `ack` header echoed from the MESSAGE. [Stomp](https://stomp.github.io/stomp-specification-1.0.html)
- `NACK` — negatively acknowledge (added in 1.1).
- `BEGIN` / `COMMIT` / `ABORT` — transaction frames; group SEND/ACK frames under a `transaction:tx1` header.
- `DISCONNECT` — graceful close. Best practice: include a `receipt` header, wait for the matching RECEIPT, *then* close the socket.

**Server → Client**

- `CONNECTED` — handshake response; carries `version`, `session`, `server`, optional `heart-beat`, optional `user-id`.
- `MESSAGE` — message delivery; required `destination`, `message-id`, `subscription`; in 1.2 also `ack` if the subscription uses `client`/`client-individual` ack.
- `RECEIPT` — confirms processing of a frame that carried a `receipt:` header. The `receipt-id` header echoes the original `receipt` value.
- `ERROR` — protocol or application error; server SHOULD close the connection after sending it.

### 3.3 Headers (the ones you must know)

`accept-version`, `host`, `login`, `passcode`, `heart-beat` (CONNECT) → `version`, `session`, `server`, `heart-beat`, `user-id` (CONNECTED). `destination`, `content-type`, `content-length`, `receipt`, `transaction`, `id`, `ack`, `subscription`, `message-id`, `expires`, `persistent` (broker-specific), `reply-to`. RabbitMQ adds `prefetch-count`, `x-stream-offset`, `x-queue-name`, `auto-delete`, `durable`, etc.; ActiveMQ adds `activemq.prefetchSize`, `activemq.subscriptionName`; Artemis uses `consumer-window-size`, `durable-subscription-name`, `client-id`.

### 3.4 Encoding rules and header escaping (1.1+)

Headers are UTF-8. Because `:`, `\r`, `\n` and `\` are structural, in **1.1+** any of those characters in a header *value* must be C-style escaped: `\\` → `\`, `\n` → LF, `\r` → CR, `\c` → `:`. Undefined escapes (`\t`, etc.) are a fatal protocol error. The `CONNECT`/`CONNECTED` frames are exempt from escaping for backward compatibility with 1.0. Servers and clients **MUST NOT** trim or pad header values with spaces — a regression bug from 1.0 era. [Stomp](https://stomp.github.io/stomp-specification-1.2.html)[Stomp](https://stomp.github.io/stomp-specification-1.2.html)

### 3.5 Heart-beating (1.1+)

In CONNECT, the client advertises `heart-beat:cx,cy`:

- `cx` = the smallest interval (ms) the client *can* send a heart-beat;
- `cy` = the smallest interval (ms) the client *would like* to receive heart-beats.
The server replies with `heart-beat:sx,sy`. The negotiated outgoing rate is `MAX(cx,sy)`; the negotiated incoming rate is `MAX(sx,cy)`. A heart-beat on the wire is a single LF byte (`0x0A`). If neither side wants heart-beats either omits the header or sends `0,0`. Receivers should be tolerant of timing — Spring's WebSocketStompClient defaults to 10 s in each direction; ActiveMQ Artemis enforces a minimum of 500 ms. [Spring](https://docs.enterprise.spring.io/spring-framework/reference/web/websocket/stomp/client.html)

### 3.6 Security model

**Essentially none, by design.** STOMP defines `login` / `passcode` headers in CONNECT; everything else (TLS, x.509 client cert auth, SASL) is left to the broker. RabbitMQ's STOMP plugin can authenticate via TLS client certificates (`ssl_cert_login=true`) and supports HTTP Basic auth over Web-STOMP. **Run production STOMP over TLS** (`stomp+ssl://...`, default port 61614) or over `wss://`.

### 3.7 Error handling and edge cases

- A server may impose maximum sizes on header count, header length, body length, and frame size. RabbitMQ defaults to a 4 MB frame limit.
- Anything other than the listed commands → server SHOULD reply with `ERROR` and close.
- On `DISCONNECT` without a `receipt` you have a race — the server may not have flushed your last SEND.
- `content-length` is required for binary bodies; without it, the first NULL ends the frame.
- ACK semantics differ across 1.0/1.1 (key on `message-id`) and 1.2 (key on `ack` header from the MESSAGE).
- `transaction` headers on ACK are **not implemented** in ActiveMQ Artemis — the spec calls them optional and Artemis ignores them. [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- Virtual hosting (`host` header) is also implementation-defined; Artemis ignores it. [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)

### 3.8 On-the-wire example (real bytes)

A complete CONNECT + MESSAGE round-trip (using `^@` for the NULL terminator):

```
C: CONNECT\n
   accept-version:1.2\n
   host:broker.example.com\n
   login:guest\n
   passcode:guest\n
   heart-beat:10000,10000\n
   \n
   ^@
S: CONNECTED\n
   version:1.2\n
   server:RabbitMQ/4.2.0\n
   session:session-9ATuzPd...\n
   heart-beat:10000,10000\n
   \n
   ^@
C: SUBSCRIBE\n
   id:sub-0\n
   destination:/topic/quotes\n
   ack:client-individual\n
   \n
   ^@
C: SEND\n
   destination:/topic/quotes\n
   content-type:application/json\n
   content-length:24\n
   \n
   {"sym":"AAPL","px":195.46}^@
S: MESSAGE\n
   subscription:sub-0\n
   message-id:T_sub-0@@session-9ATuzPd@@1\n
   destination:/topic/quotes\n
   ack:T_sub-0@@session-9ATuzPd@@1\n
   content-type:application/json\n
   content-length:24\n
   \n
   {"sym":"AAPL","px":195.46}^@
C: ACK\n
   id:T_sub-0@@session-9ATuzPd@@1\n
   \n
   ^@
C: DISCONNECT\n
   receipt:disc-1\n
   \n
   ^@
S: RECEIPT\n
   receipt-id:disc-1\n
   \n
   ^@
```

### 3.9 Sequence diagram (Mermaid)

STOMP Broker (TCP/61613 or wss://)STOMP ClientSTOMP Broker (TCP/61613 or wss://)STOMP Client#mermaid-rfi{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfi .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfi .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfi .error-icon{fill:#CC785C;}#mermaid-rfi .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfi .edge-thickness-normal{stroke-width:1px;}#mermaid-rfi .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfi .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfi .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfi .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfi .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfi .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfi .marker.cross{stroke:#A1A1A1;}#mermaid-rfi svg{font-family:inherit;font-size:16px;}#mermaid-rfi p{margin:0;}#mermaid-rfi .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .actor-line{stroke:#A1A1A1;}#mermaid-rfi .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfi .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfi #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfi .sequenceNumber{fill:#5e5e5e;}#mermaid-rfi #sequencenumber{fill:#E5E5E5;}#mermaid-rfi #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfi .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfi .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi .labelText,#mermaid-rfi .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .loopText,#mermaid-rfi .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfi .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfi .noteText,#mermaid-rfi .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfi .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfi .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfi .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfi .actorPopupMenu{position:absolute;}#mermaid-rfi .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfi .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfi .actor-man circle,#mermaid-rfi line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfi :root{--mermaid-font-family:inherit;}TCP (or WebSocket) connection establishedHeart-beats (LF) flow each way every ~10s if idlealt[Transaction]Server closes the connectionalt[Error path]Client closes TCP cleanlyCONNECT\naccept-version:1.2\nhost:...\nheart-beat:10000,100001CONNECTED\nversion:1.2\nsession:...\nheart-beat:10000,100002SUBSCRIBE\nid:sub-0\ndestination:/topic/quotes\nack:client3SEND\ndestination:/topic/quotes\ncontent-type:application/json\nbody+NULL4MESSAGE\nsubscription:sub-0\nmessage-id:...\nack:abc\nbody+NULL5ACK\nid:abc6BEGIN\ntransaction:tx17SEND\ndestination:/queue/orders\ntransaction:tx1\nbody8COMMIT\ntransaction:tx19ERROR\nmessage:invalid-frame\ncontent-type:text/plain10DISCONNECT\nreceipt:bye-111RECEIPT\nreceipt-id:bye-112

### 3.10 State machine (informal)

`CLOSED` → (open TCP) → `CONNECTING` → (CONNECT sent) → `CONNECTED` → {`SUBSCRIBED` (one or more subs), `IN_TX` (between BEGIN and COMMIT/ABORT)} → (DISCONNECT + RECEIPT) → `CLOSING` → `CLOSED`. Any unexpected frame or protocol violation transitions to `ERROR_CLOSING`. This is enough to re-implement.

---

## 4. Deep connections to other protocols

**TCP.** STOMP is layered directly on a reliable byte stream; the spec assumes "a reliable 2-way streaming network protocol (such as TCP) underneath." TCP provides ordering, retransmission, flow control, and a 16-bit checksum; STOMP provides framing, addressing (destinations) and sessions on top. STOMP cannot run on UDP because frames may exceed a datagram and ordering is required. [Stomp](https://stomp.github.io/stomp-specification-1.2.html)

**WebSocket (RFC 6455).** STOMP is the dominant *sub-protocol* used over WebSocket in browser apps. The browser opens an HTTP/1.1 handshake with `Sec-WebSocket-Protocol: v10.stomp, v11.stomp, v12.stomp`; the server selects one (`Sec-WebSocket-Protocol: v12.stomp`) and from then on each STOMP frame is wrapped inside one or more WebSocket text/binary frames. This is the entire reason Spring built `spring-messaging` STOMP support — to give browser-to-Spring apps a structured message router that "feels like writing a REST controller, but for WebSocket messages" (websocket.org guide, 2026). Browsers cannot speak raw TCP, so STOMP-over-WebSocket is the only way to talk STOMP from a page. [Stomp-js + 2](https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html)

**AMQP.** STOMP and AMQP are *peers and competitors* in the open-messaging-protocol space. The STOMP 1.1/1.2 specs explicitly position STOMP as "an alternative to other open messaging protocols such as AMQP." AMQP 0.9.1 (RabbitMQ's native) and AMQP 1.0 (OASIS standard, also ISO/IEC 19464) are binary, define exchanges/bindings/queues precisely, and target high-feature enterprise routing. STOMP is text, treats destinations as opaque strings, and ships in <30 pages of spec. RabbitMQ's STOMP plugin actually proxies STOMP into AMQP 0-9-1 internally, which RabbitMQ engineering acknowledges hurts performance compared to native AMQP. [Stomp + 2](https://stomp.github.io/stomp-specification-1.1.html)

**MQTT.** STOMP and MQTT are siblings in the "lightweight pub/sub" family but with very different DNA. MQTT (OASIS standard, versions 3.1.1 and 5.0) is a *binary* protocol explicitly designed for IoT / constrained devices: tiny frame headers, retained messages, last-will, three QoS levels. STOMP is text, fatter on the wire, but trivially debuggable. RabbitMQ supports both via separate plugins; ActiveMQ supports both natively. MQTT has eaten STOMP's lunch in IoT; STOMP has retained the browser/web/Java sub-protocol niche.

**XMPP.** XMPP (RFC 6120/6121) is also XML-text and pub/sub-capable, but it is fundamentally a *presence-and-IM* protocol with stanzas, rosters, and federation. STOMP and XMPP rarely overlap in production: nobody chooses XMPP for queue-style backend messaging, and nobody chooses STOMP for instant-messaging federation.

**JMS (Java Message Service).** JMS is a Java *API* defined by JSRs 914/343/385 — it is not a wire protocol at all. STOMP is a wire protocol that JMS brokers *expose*. ActiveMQ Classic and Artemis both bridge JMS destinations to STOMP destinations: e.g., "to send a message to the orders JMS Queue, the Stomp client must send to `jms.queue.orders`" (older Artemis docs) or to `/queue/orders` in newer setups. The STOMP `content-length` header is what brokers use to decide whether to map an incoming STOMP message to a `JMS TextMessage` (no `content-length`) or `BytesMessage` (with `content-length`). [Apache ActiveMQ](https://activemq.apache.org/components/artemis/documentation/1.0.0/interoperability.html)[Apache ActiveMQ](https://activemq.apache.org/components/artemis/documentation/1.0.0/interoperability.html)

**HTTP.** STOMP is openly modelled on HTTP — "a frame consists of a command, a set of optional headers and an optional body" (1.2 spec). The CONNECT/CONNECTED is the moral equivalent of an HTTP request/response, and the header syntax is identical (`key: value\n`, blank line, body). The differences: STOMP runs over a long-lived bidirectional connection (HTTP is request/response per connection unless you use HTTP/2 streams or SSE); STOMP supports server-pushed MESSAGE frames; STOMP frames are NULL-terminated, HTTP uses `Content-Length` or chunked encoding. [Stomp](https://stomp.github.io/stomp-specification-1.2.html)

**SockJS.** SockJS is a *fallback layer* (not a sub-protocol) created so old browsers without WebSocket support could still talk to a "WebSocket-like" endpoint via XHR streaming, XHR polling, JSONP, etc. Spring's STOMP support optionally exposes a SockJS endpoint so that STOMP frames can travel via these fallbacks. As `websocket.org`'s 2026 guide bluntly states: "In 2026, every modern browser supports WebSockets natively. The WebSocket protocol has been universally supported since 2012. So why does Spring still offer SockJS? Corporate proxies." If you're not behind such proxies, you don't need SockJS. [WebSocket](https://websocket.org/guides/frameworks/spring-boot/)[StompJS Family](https://stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html)

**RabbitMQ's protocol plugins.** RabbitMQ is a deliberately polyglot broker: AMQP 0-9-1 and AMQP 1.0 are core; MQTT, STOMP, Streams, and Web-STOMP are plugins. The `rabbitmq_stomp` plugin listens on 61613, the `rabbitmq_web_stomp` plugin exposes WebSocket on 15674. STOMP destinations are mapped to RabbitMQ's exchange/queue/topic primitives (`/exchange/x`, `/queue/q`, `/amq/queue/q`, `/topic/t`, `/temp-queue/`).

**OpenWire.** ActiveMQ's native binary protocol. STOMP and OpenWire coexist on the same broker on different ports (61613 vs 61616). They share no design DNA — OpenWire is a serialized-Java-object marshaller (which is why CVE‑2023‑46604 was such a disaster — see §6).

**Spring's STOMP-over-WebSocket support.** Implemented in `spring-messaging` + `spring-websocket`. The contract is: clients connect over WebSocket (or SockJS), Spring registers itself as either a *simple in-memory broker* (`enableSimpleBroker`) or a *broker relay* that forwards everything to a real RabbitMQ/ActiveMQ over TCP STOMP (`enableStompBrokerRelay`). Application controllers handle messages with `@MessageMapping` annotations; outgoing messages get pushed via `SimpMessagingTemplate`. Spring's choice of STOMP — over inventing a custom format — is the single reason STOMP remains relevant in 2026. [WebSocket](https://websocket.org/guides/frameworks/spring-boot/)

---

## 5. Real-world deployment

**Major implementations.**

| Implementation | Type | STOMP versions | Notes |
|---|---|---|---|
| Apache ActiveMQ Classic | Broker | 1.0, 1.1, 1.2 (native) | Default port 61613; multi-protocol broker (also OpenWire/AMQP/MQTT). |
| Apache ActiveMQ Artemis | Broker | 1.0, 1.1, 1.2 (native) | Apache TLP since 3 Dec 2025; Artemis 2.42.0 was current as of Sep 2025 per Adobe Commerce docs; [Adobe](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq) latest in late 2025 was 2.50.x per Artemis examples docs; 2.40+ supports WebSocket compression for STOMP. Min heart-beat 500 ms. ACK frames cannot be transactional. |
| RabbitMQ + `rabbitmq_stomp` plugin | Broker | 1.0, 1.1, 1.2 | Default port 61613, default user `guest/guest`, frame limit 4 MB, proxies to AMQP 0-9-1 internally. |
| RabbitMQ + `rabbitmq_web_stomp` plugin | Broker (WS) | 1.0, 1.1, 1.2 | Exposes `/ws` WebSocket on port 15674. |
| HornetQ | Broker | 1.0, 1.1 (added Oct 2011) | Donated to Apache as Artemis in 2014. |
| Apache Apollo | Broker | 1.0, 1.1, 1.2 | Hiram Chirino's spec-reference broker; not actively developed. |
| Spring Framework `spring-messaging` | Server-side framework | 1.0, 1.1, 1.2 | Full STOMP-over-WebSocket message broker, controller annotations, broker relay. |
| `@stomp/stompjs` | JS/TS client | 1.0, 1.1, 1.2 | Current version 7.x; works in browser and Node, supports SockJS fallback. [GitHub](https://github.com/stomp-js/stompjs/) |
| `stomp.py` (jasonrbriggs) | Python client | 1.0, 1.1, 1.2 | 8.2.0 published Oct 2024. [GitHub](https://github.com/jasonrbriggs/stomp.py)[PyPI](https://pypi.org/project/stomp.py/) |
| `stompgem/stomp` (Ruby) | Ruby client | 1.0, 1.1, 1.2 | Brian McCallister's lineage; current 1.4.10. [RubyGems](https://rubygems.org/gems/stomp/versions/1.2.0) |
| `stomp-php` | PHP client | 1.0, 1.1, 1.2 | Active. |
| `go-stomp/stomp` and `gopkg.in/stomp.v3` | Go client | 1.0, 1.1, 1.2 | Active. |
| Apache.NMS (.NET Messaging) | .NET client | 1.0, 1.1, 1.2 | ActiveMQ NMS.STOMP. |
| StompKit | iOS/macOS Obj-C | 1.0, 1.1, 1.2 | Used in O'Reilly's *Mobile and Web Messaging*. |
| Habari STOMP client | Delphi/Free Pascal | 1.0, 1.1, 1.2 | Commercial, latest release 2026.02. [Habarisoft](https://blog.habarisoft.com/2014/04/amqp-mqtt-and-stomp-messaging-protocols-compared/) |

**Who uses STOMP at scale.**

- **Spring Boot WebSocket apps** are the single largest user base in 2026. Any "Spring Boot real-time portfolio / chat / dashboard" tutorial uses STOMP-over-WebSocket because that's what Spring blesses. Toptal's STOMP-over-WebSocket guide was last updated 10 March 2026 — still very much current Java practice. [Toptal](https://www.toptal.com/java/stomp-spring-boot-websocket)
- **Adobe Commerce** uses ActiveMQ Artemis with STOMP for its message-queue layer (per Adobe's official docs, last updated 11 December 2025). [Adobe](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq)
- **CERN's Messaging Service** publishes a public STOMP guide (`mig-user.docs.cern.ch/stomp.html`) for scientific collaborations.
- **ChatKitty** built its proprietary "StompX" extension on top of STOMP for real-time chat infrastructure.
- **Financial firms** historically used STOMP via ActiveMQ for order routing — though many have moved to AMQP 1.0 or proprietary protocols.
- **CloudAMQP** offers managed RabbitMQ with STOMP and Web-STOMP enabled by default (port 61613/61614).

**Performance numbers (be careful — most are dated).**

- A peer-reviewed comparison published in *Telecom* 2023 by Maharjan, Chy, Arju, Cerny (Baylor University) found Apache Kafka significantly outperformed RabbitMQ, ActiveMQ Artemis, and Redis on throughput, while Redis had the lowest latency. Pure STOMP throughput is rarely quoted because it's almost always proxied; in CloudAMQP's `websockets-rabbitmq-benchmarks` repo the practical bottleneck for `web-stomp` is connection setup, not steady-state throughput. [Sissurvey](https://www.sissurvey.net/activemq-vs-rabbitmq/)
- RabbitMQ's own engineering blog (`rabbitmq.com/blog`) repeatedly notes that "RabbitMQ's core protocol has been AMQP 0.9.1. To support MQTT, STOMP, and AMQP 1.0, the broker transparently proxies via its core protocol. While this is a simple way to extend RabbitMQ with support for more messaging protocols, it degrades scalability and performance." — i.e., **STOMP on RabbitMQ pays a translation tax.** [RabbitMQ](https://www.rabbitmq.com/blog/tags/performance)
- Spring's `WebSocketStompClient` defaults: 64 KB inbound message limit, no outbound limit, 10 s heart-beat in each direction. [Spring](https://docs.enterprise.spring.io/spring-framework/reference/web/websocket/stomp/client.html)
- RabbitMQ STOMP plugin defaults: prefetch unlimited, frame size 4 MB.
- Artemis defaults: STOMP heart-beat minimum 500 ms; both port 61616 (multi-protocol) and 61613 (STOMP-only) acceptors are pre-configured. [Apache ActiveMQ](https://activemq.apache.org/components/artemis/documentation/1.0.0/interoperability.html)[Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)

---

## 6. Failure modes and famous incidents

**STOMP-specific or STOMP-implicated CVEs (verified):**

- **CVE‑2025‑41254** (Spring Framework, **disclosed 16 October 2025**, CVSS 4.3 Medium, CWE‑352). STOMP-over-WebSocket security bypass: a race in `StompSubProtocolHandler` allowed an attacker to send a single WebSocket message with multiple STOMP frames such that a `SEND` or `SUBSCRIBE` was processed *before* the `CONNECT` had finished authenticating. The handler's `getUser()` would fall back to the underlying WebSocket principal, so anonymous or under-privileged messages were processed with the wrong identity. Affected versions ≤ 5.3.45, ≤ 6.0.29, ≤ 6.1.23, ≤ 6.2.11. Fixed in Spring Framework **6.2.12** (open source); 6.1.24 and 5.3.46 are commercial. Reporter: Jannis Kaiser. The patch (commit `c88bfc54c925…`) refactored state management to bind STOMP authentication to the channel before any non-CONNECT frame can be processed. **This is the most important STOMP-specific failure of the last 24 months.** [Broadcom + 2](https://knowledge.broadcom.com/external/article/424056/api-layer-7-gateway-spring-framework-cv.html)
- **CVE‑2026‑33227** (Apache ActiveMQ Classic, low severity). "Improper Limitation of a Pathname to a Restricted Classpath Directory" — listed on the ActiveMQ Classic security advisories page. The advisory text explicitly says "In two instances (when creating a Stomp consumer and also browsing messages in the Web console) an authenticated user provided 'key' value could…" — i.e., a STOMP-consumer-creation path could traverse classpath. A direct STOMP-touching vulnerability. [Apache ActiveMQ](https://activemq.apache.org/components/classic/security)[Apache ActiveMQ](https://activemq.apache.org/security-advisories.data/CVE-2026-33227-announcement.txt)
- **CVE‑2014‑3576** — "Apache ActiveMQ: Remote Unauthenticated Shutdown of Broker (DoS)." `processControlCommand` in `broker/TransportConnection.java` accepted shutdown commands over the wire pre-auth. Not STOMP-specific to the protocol, but it could be triggered through any transport, including STOMP. Fixed in 5.11.0. [Apache ActiveMQ](https://activemq.apache.org/components/classic/security)
- **CVE‑2015‑5254** — "Unsafe deserialization in ActiveMQ." Affects 5.0.0–5.12.1. The broker did not restrict classes that could be deserialized in JMS `ObjectMessage`s; an attacker who could send messages (over **any** protocol — OpenWire, STOMP, etc.) could trigger arbitrary RCE when those messages were later deserialized. STOMP is implicated as a *vector* (you can SEND an `application/x-java-serialized-object` payload onto a queue), even though the bug itself is in the broker's JMS handling. Fixed in 5.13.0. [Apache ActiveMQ](https://activemq.apache.org/security-advisories.data/CVE-2015-5254-announcement.txt)[Vulert](https://vulert.com/vuln-db/CVE-2015-5254)
- **CVE‑2023‑46604** — the famous OpenWire RCE (CVSS 9.8). Affected ActiveMQ Classic 5.x < 5.15.16/5.16.7/5.17.6/5.18.3. **NOT a STOMP vulnerability** — the bug is in the OpenWire marshaller's class-name validation. But STOMP gets associated with it because ActiveMQ is the common host. Exploited in the wild from at least 11 October 2023 (per Cybereason); HelloKitty ransomware, Kinsing, GoTitan botnet, TellYouThePass ransomware, and Mirai variants all leveraged it. Listed on CISA's KEV catalogue. [Trend Micro + 9](https://www.trendmicro.com/en_us/research/23/k/cve-2023-46604-exploited-by-kinsing.html)
- **CVE‑2026‑34197** (April 2026) — Apache ActiveMQ Classic Jolokia RCE. Authenticated, but default credentials and CVE‑2024‑32114 (which exposed Jolokia without auth on 6.0.0–6.1.1) made it effectively unauthenticated. Patched in 5.19.6 and 6.2.5. Added to CISA KEV in April 2026. Again — **not STOMP per se** — but an ActiveMQ host that exposes STOMP also exposes Jolokia. [Horizon3](https://horizon3.ai/attack-research/disclosures/cve-2026-34197-activemq-rce-jolokia/)[Horizon3](https://horizon3.ai/attack-research/disclosures/cve-2026-34197-activemq-rce-jolokia/)
- **CVE‑2025‑27533** (May 2025) — Apache ActiveMQ 6.1.6 DoS via OpenWire memory allocation. Same caveat: OpenWire-specific, but on a STOMP-hosting broker.
- **CVE‑2026‑27446** (Apache ActiveMQ Artemis, 2026) — Auth bypass in Core federation. Not STOMP, but illustrates the broker-attack-surface point.

**Common production pitfalls (real, not theoretical):**

- **No built-in flow control before 1.1.** A subscriber that fell behind silently caused unbounded broker memory use until heart-beats and `prefetch` headers existed. Always use 1.1+ and set `prefetch-count` (RabbitMQ) or `consumer-window-size` (Artemis). [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- **Header injection.** Pre-1.1 (and in 1.0 backward-compat code paths in 1.2's CONNECT/CONNECTED frames), header values were not escaped — a `\n` in a user-supplied header could split a frame. The 1.1 escaping rules and the 1.2 "MUST NOT trim or pad" rule address this; CVE‑2025‑41254 is morally adjacent.
- **`content-length` confusion with binary bodies.** Forgetting `content-length` on a body that contains NULL bytes will silently truncate.
- **ACK mode mismatch.** `auto` ack at the consumer combined with at-least-once delivery semantics → message loss on consumer crash. `client` ack means *all* prior messages on that subscription are acked at once. `client-individual` is what most apps actually want. [Stomp](https://stomp.github.io/stomp-specification-1.0.html)
- **Default credentials.** RabbitMQ STOMP plugin defaults to `guest/guest`; ActiveMQ Classic ships with `admin/admin`. The 2023–2026 ActiveMQ ransomware wave exploited exactly this combination.
- **Heart-beat misconfig.** Aggressive 1 s heart-beats on lossy networks → false disconnects; 0 s heart-beats over an idle TCP connection → NAT timeouts kill the socket silently.
- **Spring SockJS heartbeat vs. STOMP heartbeat double-up.** Spring docs note that when STOMP heart-beats are negotiated, SockJS heart-beats are disabled — but if you configure both, you can get a 25 s SockJS heartbeat fighting a 10 s STOMP heartbeat. [CodeGym](https://codegym.cc/quests/lectures/en.questspring.level04.lecture43)

**Famous incidents:**

- **2023–2024 ActiveMQ exploitation wave (CVE‑2023‑46604).** Multiple ransomware crews including HelloKitty hit thousands of unpatched ActiveMQ servers worldwide. Shadowserver counted 7,249 publicly accessible ActiveMQ services; 3,329 were vulnerable. Many of these brokers were running STOMP clients in production — but the entry point was OpenWire on port 61616, not STOMP on 61613. The lesson: STOMP-only environments still need to firewall the *other* ports their broker exposes. [Ncsc](https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/)[Rapid7](https://www.rapid7.com/blog/post/2023/11/01/etr-suspected-exploitation-of-apache-activemq-cve-2023-46604/)
- **April 2026 CISA KEV addition of CVE‑2026‑34197.** ShadowServer counted 7,500 exposed ActiveMQ instances; CISA gave US federal agencies two weeks to patch.

---

## 7. Fun facts and anecdotes

- **The name actually changed.** STOMP started as **TTMP** (Text-To-Messaging Protocol). Brian McCallister announced the rename on 23 August 2005 with the punchline "TTMP has always been a temporary (TMP, get it?) working name." Multiple secondary sources (Wikipedia, OMG Wiki, Cheetah Networks) preserve the old TTMP name. [Skife](http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html)
- **The "S" is ambiguous.** Brian's original 2005 blog post explicitly says "**streaming** text oriented messaging protocol." The current `stomp.github.io` homepage says "**Simple** Text Oriented Messaging Protocol". Wikipedia hedges: "Simple (or Streaming)". CERN's docs say "Streaming Text Orientated Messaging Protocol or Simple Text Oriented Messaging Protocol." This is one of the few protocols whose acronym expansion is genuinely contested. [Skife + 2](http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html)
- **The "Telnet test."** Hiram Chirino's 2009 blog post argues "one of the tenets of the protocol was for it to be simple enough to even use by user which directly connects to a server via telnet." This is *the* design constraint that explains every other choice STOMP made — text frames, HTTP-style headers, NULL terminator.
- **The Codehaus origin story.** The "First Hausmate" of Codehaus was Jason van Zyl (creator of Maven). The "Despot" Bob McWhirter founded Codehaus in February 2003 out of "Werken Company" hardware. STOMP grew up alongside Groovy, Maven, JMock, and PicoContainer in the same forge. [GitHub](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)
- **Why text-based when binary dominates messaging.** Brian McCallister's design choice was driven entirely by **scripting language ergonomics**: Ruby/Perl/Python in 2005 had no good binary-protocol libraries, and writing one was a weekend project, not a quarter project. This is the same reason JSON beat XML and Thrift in web APIs.
- **The HTTP-school-of-design line.** The official `stomp.github.io` homepage proudly announces: "STOMP is a very simple and easy to implement protocol, coming from the HTTP school of design; the server side may be hard to implement well, but it is very easy to write a client to get yourself connected. For example you can use Telnet to login to any STOMP broker and interact with it!" Quotable. [Stomp](https://stomp.github.io/)
- **"A couple of hours" to write a client.** Same homepage: "Many developers have told us that they have managed to write a STOMP client in a couple of hours" in their language of choice. This is verifiable — there are STOMP clients in Erlang, Haskell, Tcl, OCaml, Lua, Smalltalk, Pharo. [Stomp](https://stomp.github.io/)
- **STOMP as a WebSocket sub-protocol predates the WebSocket RFC.** STOMP was being layered onto early WebSocket implementations by Jeff Mesnil's `stomp-websocket` library *before* RFC 6455 was finalized in 2011 — which is why the negotiated sub-protocol tokens are `v10.stomp`/`v11.stomp`/`v12.stomp` and not something more formal. [Stomp-js](https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html)
- **The "Stomp" theatrical show is unrelated** but adds to search-engine confusion: that show was created in 1991 in Brighton, UK by Steve McNicholas and Luke Cresswell. [Wikipedia](https://en.wikipedia.org/wiki/Stomp_(theatrical_show))[Wikipedia](https://en.wikipedia.org/wiki/Stomp_(theatrical_show))
- **Spec frozen for 14 years.** STOMP 1.2 dropped on 22 October 2012 and there has been no released update since. It is one of the longest-stable application protocols in active use.

---

## 8. Practical wisdom

**Tuning and defaults to be skeptical of.**

- **Default credentials.** RabbitMQ STOMP `guest/guest` works only from localhost by default — but operators routinely override that and forget. ActiveMQ `admin/admin` is the well-known target of ransomware crews. Always change before exposing port 61613.
- **Prefetch unlimited.** RabbitMQ STOMP defaults to unlimited prefetch — set `prefetch-count` on every SUBSCRIBE for any non-trivial workload.
- **`auto` ack.** Default in many client libraries; means at-most-once. Use `client-individual` for at-least-once. [StompJS Family](https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html)
- **Heart-beat off by default in many clients.** stomp.py constructs default to `heartbeats=(0, 0)`. Set explicitly.
- **Frame size limits.** RabbitMQ default 4 MB; Spring's `WebSocketStompClient` 64 KB inbound. If you carry large payloads, raise *both* sides and consider splitting.
- **`DISCONNECT` race.** Always send a `receipt:` and wait for the matching `RECEIPT` before closing the socket, otherwise in-flight SENDs may be lost.

**What to monitor.**

- STOMP connection count (per-protocol, on RabbitMQ via the management plugin).
- Heart-beat misses (indicates dead clients or bad NAT).
- ACK lag (time between MESSAGE delivery and ACK) — proxy for consumer health.
- Per-destination depth and consumer count.
- For Spring: `stompSubProtocolHandler` channel statistics — CONNECT/CONNECTED/DISCONNECT counts (Spring exposes these as JMX/Micrometer metrics). [Spring](https://docs.spring.io/spring-framework/docs/4.1.5.RELEASE/spring-framework-reference/html/websocket.html)

**Debugging moves.**

- **Telnet a broker:** `telnet broker 61613` then type `CONNECT\naccept-version:1.2\nhost:foo\n\n` followed by Ctrl+@ (NULL). You will see `CONNECTED` come back in plaintext. This is the fastest "is the broker alive?" test in messaging.
- **Wireshark dissector:** there is a community Lua STOMP dissector (referenced in wireshark.org Q&A). Useful for off-WebSocket STOMP. For STOMP-over-WebSocket, the `WebSocket` dissector handles framing; the payload is plaintext STOMP that you can read directly.
- **Spring server-side:** enable DEBUG logging on `org.springframework.web.socket.messaging.StompSubProtocolHandler` and `org.springframework.messaging`.
- **Artemis:** enable DEBUG on `org.apache.activemq.artemis.core.protocol.stomp.StompConnection` to log raw STOMP frames per connection ID. [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- **stomp.py CLI:** ships as a standalone command-line tool — fastest way to send/receive a test message from a script. [PyPI](https://pypi.org/project/stomp.py/)
- **`@stomp/stompjs` debug callback:** set `client.debug = console.log` to see every frame in the browser console. [StompJS Family](https://stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html)

**Common misconfigurations.**

- Enabling SockJS when you don't need it (adds a 25 s heartbeat layer and CORS complexity).
- Forgetting `@EnableWebSocketMessageBroker` on the Spring config — the `@MessageMapping` methods silently never fire.
- Setting heart-beats below ~500 ms — Artemis will clamp to 500, RabbitMQ will reject; both sides should agree on something ≥1 s for production.
- Putting STOMP behind an HTTP proxy that strips the `Upgrade` header → handshake fails. Use a TCP-aware proxy (HAProxy in TCP mode, nginx with `proxy_set_header Upgrade $http_upgrade`).
- Mixing ack modes between client libraries and brokers (the `ack` semantic change between STOMP 1.1 and 1.2 is the most common version-mismatch bug).

---

## 9. Learning resources (current as of May 2026)

**Specifications**

- **STOMP 1.2 specification** — [https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html) — the canonical document. Level: intermediate. Last updated: 22 October 2012 (stable).
- **STOMP 1.1 specification** — [https://stomp.github.io/stomp-specification-1.1.html](https://stomp.github.io/stomp-specification-1.1.html) — needed if you support pre-1.2 clients. Intermediate. 2011.
- **STOMP 1.0 specification** — [https://stomp.github.io/stomp-specification-1.0.html](https://stomp.github.io/stomp-specification-1.0.html) — historical reference. Intermediate. ~2007.
- **STOMP spec GitHub** — [https://github.com/stomp/stomp-spec](https://github.com/stomp/stomp-spec) — source repo (includes a draft `stomp-specification-2.0.md`). Advanced.

**Vendor docs**

- **RabbitMQ STOMP plugin** — [https://www.rabbitmq.com/docs/stomp](https://www.rabbitmq.com/docs/stomp) — destination types, header extensions, configuration. Intermediate. Continuously updated; current with RabbitMQ 4.x in 2026.
- **RabbitMQ Web-STOMP plugin** — [https://www.rabbitmq.com/docs/web-stomp](https://www.rabbitmq.com/docs/web-stomp) — STOMP over WebSocket on port 15674. Intermediate. 2026-current.
- **RabbitMQ heartbeats** — [https://www.rabbitmq.com/docs/heartbeats](https://www.rabbitmq.com/docs/heartbeats) — explains heart-beats across STOMP/MQTT/AMQP. Intermediate.
- **ActiveMQ Classic security advisories** — [https://activemq.apache.org/components/classic/security](https://activemq.apache.org/components/classic/security) — every CVE that ever touched the broker. Advanced. Continuously updated; new CVEs added through 2026.
- **ActiveMQ Artemis STOMP docs** — [https://artemis.apache.org/components/artemis/documentation/latest/stomp.html](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html) — destination semantics, durable subscriptions, consumer-window-size. Intermediate. 2026-current.
- **ActiveMQ Artemis security advisories** — [https://artemis.apache.org/components/artemis/security](https://artemis.apache.org/components/artemis/security) — Artemis-specific CVEs.
- **Spring Framework — STOMP** — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html) — server-side STOMP-over-WebSocket. Intermediate. 6.2.x and 7.0.x current as of 2026.
- **Spring Framework — STOMP Client** — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp/client.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/client.html) — `WebSocketStompClient` API. Intermediate.
- **Spring Framework — Enable STOMP** — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html) — broker relay vs simple broker config. Intermediate.
- **CloudAMQP STOMP & Web-STOMP docs** — [https://www.cloudamqp.com/docs/stomp.html](https://www.cloudamqp.com/docs/stomp.html) — managed-broker perspective. Intro.

**Books with substantive STOMP content**

- *Mobile and Web Messaging* by Jeff Mesnil (O'Reilly, 2014) — chapters 2–4 are the deepest STOMP+WebSocket+iOS treatment in print. Mesnil also wrote the original `stompjs`. Intermediate–advanced. Dated, but the protocol hasn't changed.
- *ActiveMQ in Action* by Bruce Snyder, Dejan Bosanac, Rob Davies (Manning, 2011) — covers STOMP within ActiveMQ. Intermediate. Older but still accurate for protocol fundamentals.
- *RabbitMQ in Depth* by Gavin M. Roy (Manning, 2017) — primarily AMQP but includes the STOMP plugin. Intermediate.
- *Spring in Action* (Manning, 6th ed. 2022) — Spring's WebSocket+STOMP chapter. Intermediate.

**Engineering blog posts and tutorials**

- **Spring guide: "Using WebSocket to build an interactive web application"** — [https://spring.io/guides/gs/messaging-stomp-websocket/](https://spring.io/guides/gs/messaging-stomp-websocket/) — official tutorial; the "Hello, world" of Spring STOMP. Intro. Periodically refreshed.
- **Toptal: "Using Spring Boot for WebSocket Implementation with STOMP"** — [https://www.toptal.com/java/stomp-spring-boot-websocket](https://www.toptal.com/java/stomp-spring-boot-websocket) — last updated **10 March 2026**. Current, peer-reviewed, intermediate.
- **WebSocket.org: "Spring Boot WebSocket: STOMP, Raw Handlers, Scaling"** — [https://websocket.org/guides/frameworks/spring-boot/](https://websocket.org/guides/frameworks/spring-boot/) — 2026 current; covers when *not* to use STOMP. Intermediate.
- **CloudAMQP: "RabbitMQ and WebSockets, Part 1: AMQP, MQTT, and STOMP"** — [https://www.cloudamqp.com/blog/rabbitmq-and-websockets-part-1-amqp-mqtt-stomp.html](https://www.cloudamqp.com/blog/rabbitmq-and-websockets-part-1-amqp-mqtt-stomp.html) — clear comparison. Intro–intermediate.
- **Red Hat Developer: "Using the STOMP Protocol with Apache ActiveMQ Artemis Broker"** — [https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python](https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python) — Python+Artemis end-to-end. Intermediate. 2018 but still accurate. [Red Hat](https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python)
- **Hiram Chirino's blog (`hiramchirino.com/tags/stomp`)** — historical commentary from the protocol's longtime steward. Advanced.
- **Habarisoft blog (`blog.habarisoft.com`)** — protocol-history commentary; the Oct 2012 1.2-release post and 2025 "Hidden Pitfalls of Using a Single TCP Connection in STOMP" are useful. Intermediate. [Habarisoft](https://blog.habarisoft.com/2014/04/amqp-mqtt-and-stomp-messaging-protocols-compared/)

**Conference talks and videos**

- SpringOne Platform talks on WebSocket+STOMP (Rossen Stoyanchev, the Spring messaging maintainer) — multiple years on YouTube. Advanced.
- ApacheCon talks on ActiveMQ/Artemis multi-protocol support. Intermediate.

**Hands-on tools**

- **stomp.py CLI** — `pip install stomp.py`, run `stomp` from the command line. Intro.
- **`@stomp/stompjs`** — [https://github.com/stomp-js/stompjs](https://github.com/stomp-js/stompjs) — current 7.x for browser+Node. Intermediate.
- **`rx-stomp`** — [https://github.com/stomp-js/rx-stomp](https://github.com/stomp-js/rx-stomp) — RxJS wrapper for `@stomp/stompjs`. Intermediate.
- **`go-stomp/stomp`** — `gopkg.in/stomp.v3` — Go client. Intermediate.
- **RabbitMQ Management plugin** — built-in web UI on port 15672 — see live STOMP connections, subscriptions, message rates. Intro.
- **Wireshark with Lua STOMP dissector** — for raw-TCP STOMP packet capture. Advanced.
- **Telnet** — the canonical "is my broker up" tester.
- **stomp-php examples** — [https://github.com/stomp-php/stomp-php-examples](https://github.com/stomp-php/stomp-php-examples) — PHP samples. Intro.
- **CloudAMQP `websockets-rabbitmq-benchmarks`** — [https://github.com/cloudamqp/websockets-rabbitmq-benchmarks](https://github.com/cloudamqp/websockets-rabbitmq-benchmarks) — compares web-MQTT vs web-STOMP vs web-AMQP. Advanced.

---

## 10. Where things are heading (2025–2026 frontier)

**Is STOMP being deprecated?** No, but it is **frozen**. The last released spec is from 22 October 2012. A `stomp-specification-2.0.md` exists in the GitHub repo as a long-running draft; there is no active push to ship it. RabbitMQ continues to ship the plugin, ActiveMQ Classic and Artemis support it natively, and Spring continues to make it the preferred WebSocket sub-protocol.

**What's replacing it (or not)?**

- **MQTT 5** has eaten the IoT use case STOMP never really won. It's an OASIS standard, binary, and has retained messages, will, QoS, and shared subscriptions. RabbitMQ rewrote its MQTT plugin in 2024 to *not* proxy via AMQP 0-9-1 — it's now a first-class protocol. STOMP is still proxied. This is a meaningful long-term trend. [RabbitMQ](https://www.rabbitmq.com/blog/tags/performance)
- **AMQP 1.0** has become RabbitMQ's "core" protocol in RabbitMQ 4.0 (per the RabbitMQ engineering blog). It is also Azure Service Bus's native protocol. For new enterprise designs in 2026, AMQP 1.0 is the safer long-term bet over STOMP.
- **gRPC streaming and HTTP/2** are taking the structured-RPC + streaming use cases that STOMP-over-WebSocket would once have served, especially in service-to-service contexts.
- **Server-Sent Events (SSE)** and **WebTransport** are nibbling at one-way browser-push use cases. SSE in particular is *much* simpler than STOMP-over-WebSocket if you only need server→client.
- **Spring's STOMP-over-WebSocket** continues to be the protocol's anchor tenant in 2026. There is no signal in the Spring 6.2.x/7.0.x release notes that this is being deprecated. Spring 7 still documents `WebSocketStompClient`, broker relay, and `@MessageMapping`.

**ActiveMQ Artemis status.** Promoted to an Apache Software Foundation Top-Level Project on 3 December 2025. Artemis is what the ActiveMQ project plans to converge on once Artemis has feature parity with Classic. WebSocket compression for STOMP/MQTT/AMQP arrived in 2.40+. Java 17 is now the minimum (Jetty 12 EOL'd Java 11 in Jan 2025). Artemis is the broker most likely to host new STOMP deployments through the 2026–2030 window. [The ASF Blog + 2](https://news.apache.org/foundation/entry/the-apache-software-foundation-announces-new-top-level-projects-3)

**The reality of a "frozen" protocol.** Frozen ≠ dead. HTTP/1.1 was substantially frozen for 15 years and remained the dominant web protocol throughout. STOMP's freeze means:

- Existing implementations are stable; new implementations are easy because the spec doesn't move.
- Innovation happens in *brokers* and *header extensions* (RabbitMQ's `x-stream-offset`, Artemis's `consumer-window-size`), not in the spec.
- Any new application-level features (back-pressure, multi-tenancy, encryption, schema negotiation) will have to be glued on with vendor headers, not spec'd.
- Security is fully outsourced to TLS and to the broker — and the Spring STOMP CSRF (CVE‑2025‑41254) shows how that outsourcing can still produce STOMP-shaped security holes.

**What I expect by 2028.** STOMP will continue to dominate the Spring-Boot-over-WebSocket niche; lose more ground to MQTT 5 in IoT and to AMQP 1.0 in enterprise; remain the easiest protocol to teach and debug; and continue to be the "if you need to talk to a broker from a Bash script, here's what you do" answer. No STOMP 2.0 will ship.

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook (for non-experts).**

> "In 2005, a developer named Brian McCallister got tired of writing Perl code to talk to enterprise message queues. The protocols of the day were all binary, all Java-flavored, and all designed for committees, not for kids hacking in a text editor at 2 AM. So he sat down and built the smallest, dumbest, most readable messaging protocol he could imagine — text frames, HTTP-style headers, ending in a single null byte. He called it STOMP. Twenty-one years later, that weekend project still ships inside Spring Boot, RabbitMQ, ActiveMQ, and every Slack-clone tutorial on the internet. The official spec hasn't been updated since October 2012. And yet, when you load a stock-trading dashboard in your browser tomorrow morning, there's a real chance the prices are streaming in over a protocol you can read with your eyes — and one Brian McCallister announced on his blog with the line: 'TTMP is named Stomp! Bang optional.'" [skife](http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html)

**Striking statistic with source.**

> The official STOMP 1.2 specification has not been updated since **22 October 2012**, yet a 2026 search of Apache Artemis's documentation, Spring Framework 7's reference, RabbitMQ 4's plugin docs, and Adobe Commerce's deployment guides all describe production deployments using it as a current, supported, recommended protocol. (Sources: `stomp.github.io`, `artemis.apache.org`, `docs.spring.io`, `rabbitmq.com/docs/stomp`, `experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq`.)

**"Pause and think" moment.**

> Stop and consider this: STOMP has no built-in checksum, no built-in encryption, no built-in authentication beyond a username and password in plaintext, no flow control before version 1.1, and no required protocol negotiation before version 1.1. Every modern messaging protocol fixes "problems" STOMP doesn't even acknowledge. And yet STOMP is the protocol Spring chose, the protocol RabbitMQ keeps a plugin for, and the protocol you can debug with `telnet`. What does that tell you about which "problems" actually matter when you're shipping software?

**Failure-story arc as clean dramatic sequence (for podcast cold open).**

> *Act 1 — The setup.* It's October 2025. A Spring developer named Jannis Kaiser is reading the source of `StompSubProtocolHandler` — the class that handles every STOMP-over-WebSocket message Spring has ever delivered to an `@MessageMapping` method. He notices something strange: when a WebSocket message contains *multiple* STOMP frames, they're processed one at a time, in order. But the per-session authentication state isn't bound to the channel until *after* the first CONNECT frame finishes processing.
> 
> *Act 2 — The exploit.* Kaiser writes a proof of concept. He sends a single WebSocket frame containing two STOMP frames concatenated: a CONNECT, immediately followed by a SUBSCRIBE to a sensitive destination. The handler dispatches the SUBSCRIBE to its worker before authentication completes. The `getUser()` lookup falls through to the WebSocket session's principal — anonymous, or a low-privilege user who never had STOMP-level access. The SUBSCRIBE succeeds. Messages start flowing.
> 
> *Act 3 — The disclosure.* On 16 October 2025, Spring Security publishes CVE‑2025‑41254. Severity: Medium (4.3). Affected: every Spring Framework version from 5.3.0 through 6.2.11 — every STOMP-over-WebSocket app built in the last decade. Fix: upgrade to 6.2.12. Open-source 6.0.x, by the way, is out of support. There is no patch unless you have a commercial subscription. [Broadcom](https://knowledge.broadcom.com/external/article/424056/api-layer-7-gateway-spring-framework-cv.html)
> 
> *Act 4 — The lesson.* STOMP itself didn't have a bug. The spec hasn't changed since 2012. The bug was in *how a framework reasoned about state between two protocol layers* — the WebSocket connection on top, the STOMP session on the bottom. A protocol that's frozen at the spec level can still produce CVEs at the integration layer for as long as people keep finding new ways to glue it to other things. Every "frozen" protocol you depend on has a year-2025-style CVE somewhere in its future.

---

## 12. Citations

1. STOMP Protocol Specification, Version 1.2 — [https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)
2. STOMP Protocol Specification, Version 1.1 — [https://stomp.github.io/stomp-specification-1.1.html](https://stomp.github.io/stomp-specification-1.1.html)
3. STOMP Protocol Specification, Version 1.0 — [https://stomp.github.io/stomp-specification-1.0.html](https://stomp.github.io/stomp-specification-1.0.html)
4. STOMP project homepage — [https://stomp.github.io/](https://stomp.github.io/)
5. STOMP spec GitHub repo (incl. draft 2.0) — [https://github.com/stomp/stomp-spec](https://github.com/stomp/stomp-spec)
6. Brian McCallister, "TTMP is named Stomp!" 23 August 2005 — [http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html](http://kasparov.skife.org/blog/src/stomp/ttmp-is-named-stomp.html)
7. Codehaus history page — [https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md](https://github.com/codehaus/www-codehaus-org/blob/master/app/history.md)
8. InfoQ, "The Demise of Open Source Hosting Providers Codehaus and Google Code", March 2015 — [https://www.infoq.com/news/2015/03/codehaus-google-code/](https://www.infoq.com/news/2015/03/codehaus-google-code/)
9. Codehaus stomp repo — [https://github.com/codehaus/stomp](https://github.com/codehaus/stomp)
10. Ruby `stomp` gem (Brian McCallister et al.) — [https://rubygems.org/gems/stomp/versions/1.2.0](https://rubygems.org/gems/stomp/versions/1.2.0)
11. Wikipedia, Streaming Text Oriented Messaging Protocol — [https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol](https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol)
12. Hiram Chirino blog, STOMP tag — [https://hiramchirino.com/tags/stomp](https://hiramchirino.com/tags/stomp)
13. Hiram Chirino LinkedIn — [https://www.linkedin.com/in/chirino/](https://www.linkedin.com/in/chirino/)
14. HornetQ Team Blog, "Stomp 1.1 Support in HornetQ", October 2011 — [http://hornetq.blogspot.com/2011/10/stomp-11-support-in-hornetq.html](http://hornetq.blogspot.com/2011/10/stomp-11-support-in-hornetq.html)
15. Habarisoft blog, "STOMP Protocol Specification, Version 1.2 released", 23 October 2012 — [https://blog.habarisoft.com/2012/10/23/stomp-protocol-specification-version-1-2-released/](https://blog.habarisoft.com/2012/10/23/stomp-protocol-specification-version-1-2-released/)
16. O'Reilly, Jeff Mesnil, *Mobile and Web Messaging*, Chapter 4: Advanced STOMP — [https://www.oreilly.com/library/view/mobile-and-web/9781491944790/ch04.html](https://www.oreilly.com/library/view/mobile-and-web/9781491944790/ch04.html)
17. RabbitMQ STOMP plugin docs — [https://www.rabbitmq.com/docs/stomp](https://www.rabbitmq.com/docs/stomp)
18. RabbitMQ Web STOMP plugin docs — [https://www.rabbitmq.com/docs/web-stomp](https://www.rabbitmq.com/docs/web-stomp)
19. RabbitMQ heartbeats docs — [https://www.rabbitmq.com/docs/heartbeats](https://www.rabbitmq.com/docs/heartbeats)
20. RabbitMQ "Which protocols does RabbitMQ support?" — [https://www.rabbitmq.com/docs/protocols](https://www.rabbitmq.com/docs/protocols)
21. RabbitMQ STOMP plugin GitHub — [https://github.com/rabbitmq/rabbitmq-stomp](https://github.com/rabbitmq/rabbitmq-stomp)
22. ActiveMQ Artemis STOMP docs — [https://artemis.apache.org/components/artemis/documentation/latest/stomp.html](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
23. ActiveMQ Artemis Versions / release notes — [https://artemis.apache.org/components/artemis/documentation/latest/versions.html](https://artemis.apache.org/components/artemis/documentation/latest/versions.html)
24. ActiveMQ Classic security advisories — [https://activemq.apache.org/components/classic/security](https://activemq.apache.org/components/classic/security)
25. ActiveMQ Artemis security advisories — [https://artemis.apache.org/components/artemis/security](https://artemis.apache.org/components/artemis/security)
26. Apache "Artemis becomes Top-Level Project", 3 December 2025 — [https://news.apache.org/foundation/entry/the-apache-software-foundation-announces-new-top-level-projects-3](https://news.apache.org/foundation/entry/the-apache-software-foundation-announces-new-top-level-projects-3)
27. Adobe Commerce ActiveMQ Artemis docs — [https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/prerequisites/message-brokers/activemq)
28. Spring Framework STOMP reference — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html)
29. Spring Framework STOMP Client reference — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp/client.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/client.html)
30. Spring Framework Enable STOMP — [https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html)
31. Spring Framework SockJS Fallback — [https://docs.spring.io/spring-framework/reference/web/websocket/fallback.html](https://docs.spring.io/spring-framework/reference/web/websocket/fallback.html)
32. Spring guide: "Using WebSocket to build an interactive web application" — [https://spring.io/guides/gs/messaging-stomp-websocket/](https://spring.io/guides/gs/messaging-stomp-websocket/)
33. CVE‑2025‑41254 (Spring STOMP CSRF) — [https://spring.io/security/cve-2025-41254/](https://spring.io/security/cve-2025-41254/)
34. CVE‑2025‑41254 GitHub Advisory — [https://github.com/advisories/GHSA-7fch-4f2f-jcgm](https://github.com/advisories/GHSA-7fch-4f2f-jcgm)
35. CVE‑2025‑41254 technical analysis (Miggo) — [https://www.miggo.io/vulnerability-database/cve/CVE-2025-41254](https://www.miggo.io/vulnerability-database/cve/CVE-2025-41254)
36. CVE‑2014‑3576 ActiveMQ Remote Unauthenticated Shutdown — [https://nvd.nist.gov/vuln/detail/CVE-2014-3576](https://nvd.nist.gov/vuln/detail/CVE-2014-3576) and [https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2014-3576](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2014-3576)
37. CVE‑2015‑5254 ActiveMQ JMS deserialization — [https://activemq.apache.org/security-advisories.data/CVE-2015-5254-announcement.txt](https://activemq.apache.org/security-advisories.data/CVE-2015-5254-announcement.txt) and [https://nvd.nist.gov/vuln/detail/cve-2015-5254](https://nvd.nist.gov/vuln/detail/cve-2015-5254)
38. CVE‑2023‑46604 ActiveMQ OpenWire RCE — [https://activemq.apache.org/news/cve-2023-46604](https://activemq.apache.org/news/cve-2023-46604) and Trend Micro analysis [https://www.trendmicro.com/en_us/research/23/k/cve-2023-46604-exploited-by-kinsing.html](https://www.trendmicro.com/en_us/research/23/k/cve-2023-46604-exploited-by-kinsing.html)
39. CVE‑2023‑46604 advisory — [https://activemq.apache.org/security-advisories.data/CVE-2023-46604-announcement.txt](https://activemq.apache.org/security-advisories.data/CVE-2023-46604-announcement.txt)
40. CVE‑2026‑34197 ActiveMQ Jolokia RCE (Horizon3) — [https://horizon3.ai/attack-research/disclosures/cve-2026-34197-activemq-rce-jolokia/](https://horizon3.ai/attack-research/disclosures/cve-2026-34197-activemq-rce-jolokia/)
41. CVE‑2026‑34197 CISA KEV addition — [https://www.bleepingcomputer.com/news/security/cisa-flags-apache-activemq-flaw-as-actively-exploited-in-attacks/](https://www.bleepingcomputer.com/news/security/cisa-flags-apache-activemq-flaw-as-actively-exploited-in-attacks/)
42. CVE‑2026‑33227 (ActiveMQ Classic, STOMP-implicated) — [https://activemq.apache.org/security-advisories.data/CVE-2026-33227-announcement.txt](https://activemq.apache.org/security-advisories.data/CVE-2026-33227-announcement.txt)
43. CVE‑2026‑27446 (Artemis Core federation auth bypass) — [https://advisories.gitlab.com/pkg/maven/org.apache.artemis/artemis-server/CVE-2026-27446/](https://advisories.gitlab.com/pkg/maven/org.apache.artemis/artemis-server/CVE-2026-27446/)
44. NCSC Ireland ActiveMQ accessible-service report — [https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/](https://www.ncsc.gov.ie/emailsfrom/reports/cve/cve-activemq/)
45. Cybereason, "Beware of the Messengers, Exploiting ActiveMQ Vulnerability" — [https://www.cybereason.com/blog/beware-of-the-messengers-exploiting-activemq-vulnerability](https://www.cybereason.com/blog/beware-of-the-messengers-exploiting-activemq-vulnerability)
46. Rapid7, "Suspected Exploitation of Apache ActiveMQ CVE‑2023‑46604" — [https://www.rapid7.com/blog/post/2023/11/01/etr-suspected-exploitation-of-apache-activemq-cve-2023-46604/](https://www.rapid7.com/blog/post/2023/11/01/etr-suspected-exploitation-of-apache-activemq-cve-2023-46604/)
47. `@stomp/stompjs` GitHub — [https://github.com/stomp-js/stompjs/](https://github.com/stomp-js/stompjs/)
48. StompJS Family docs — [https://stomp-js.github.io/](https://stomp-js.github.io/)
49. `stomp.py` GitHub — [https://github.com/jasonrbriggs/stomp.py](https://github.com/jasonrbriggs/stomp.py)
50. `stomp.py` PyPI — [https://pypi.org/project/stomp.py/](https://pypi.org/project/stomp.py/)
51. `stompgem/stomp` Ruby — [https://github.com/stompgem/stomp](https://github.com/stompgem/stomp)
52. `stomp-php` changelog — [https://github.com/stomp-php/stomp-php/blob/master/CHANGELOG.md](https://github.com/stomp-php/stomp-php/blob/master/CHANGELOG.md)
53. Go `stomp` package — [https://pkg.go.dev/gopkg.in/stomp.v3](https://pkg.go.dev/gopkg.in/stomp.v3)
54. CloudAMQP STOMP guide — [https://www.cloudamqp.com/docs/stomp.html](https://www.cloudamqp.com/docs/stomp.html)
55. CloudAMQP Web-STOMP guide — [https://www.cloudamqp.com/docs/stomp_over_websockets.html](https://www.cloudamqp.com/docs/stomp_over_websockets.html)
56. CloudAMQP "RabbitMQ and WebSockets, Part 1: AMQP, MQTT, and STOMP" — [https://www.cloudamqp.com/blog/rabbitmq-and-websockets-part-1-amqp-mqtt-stomp.html](https://www.cloudamqp.com/blog/rabbitmq-and-websockets-part-1-amqp-mqtt-stomp.html)
57. CloudAMQP `websockets-rabbitmq-benchmarks` — [https://github.com/cloudamqp/websockets-rabbitmq-benchmarks](https://github.com/cloudamqp/websockets-rabbitmq-benchmarks)
58. Toptal, "Using Spring Boot for WebSocket Implementation with STOMP", updated 10 March 2026 — [https://www.toptal.com/java/stomp-spring-boot-websocket](https://www.toptal.com/java/stomp-spring-boot-websocket)
59. WebSocket.org, "Spring Boot WebSocket: STOMP, Raw Handlers, Scaling" — [https://websocket.org/guides/frameworks/spring-boot/](https://websocket.org/guides/frameworks/spring-boot/)
60. ChatKitty, "Keeping Real-Time Messaging Simple With STOMP" — [https://chatkitty.com/blog/keeping-real-time-messaging-simple-with-stomp](https://chatkitty.com/blog/keeping-real-time-messaging-simple-with-stomp)
61. CERN messaging service STOMP guide — [https://mig-user.docs.cern.ch/stomp.html](https://mig-user.docs.cern.ch/stomp.html)
62. Red Hat AMQ 6.2 Stomp Heartbeats docs — [https://access.redhat.com/documentation/en-us/red_hat_amq/6.2/html/client_connectivity_guide/fmbstompheart](https://access.redhat.com/documentation/en-us/red_hat_amq/6.2/html/client_connectivity_guide/fmbstompheart)
63. Red Hat Developer, "Using the STOMP Protocol with Apache ActiveMQ Artemis Broker" — [https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python](https://developers.redhat.com/blog/2018/06/14/stomp-with-activemq-artemis-python)
64. Wireshark Q&A on STOMP dissector — [https://osqa-ask.wireshark.org/questions/43861/wireshark-stomp-protocol-dissector/](https://osqa-ask.wireshark.org/questions/43861/wireshark-stomp-protocol-dissector/)
65. Maharjan, Chy, Arju, Cerny (Baylor), Telecom 2023 message-broker benchmark (cited via SISsurvey summary) — [https://www.sissurvey.net/activemq-vs-rabbitmq/](https://www.sissurvey.net/activemq-vs-rabbitmq/)
66. Pragmatic comparison of IoT messaging protocols (PubMed Central, 2021) — [https://pmc.ncbi.nlm.nih.gov/articles/PMC8540579/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8540579/)
67. RabbitMQ engineering blog, performance tag — [https://www.rabbitmq.com/blog/tags/performance](https://www.rabbitmq.com/blog/tags/performance)
68. Habarisoft blog, "AMQP, MQTT, and STOMP Messaging Protocols compared" — [https://blog.habarisoft.com/2014/04/amqp-mqtt-and-stomp-messaging-protocols-compared/](https://blog.habarisoft.com/2014/04/amqp-mqtt-and-stomp-messaging-protocols-compared/)
69. Jeff Mesnil's stomp-websocket annotated source — [https://jmesnil.net/stomp-websocket/doc/stomp.html](https://jmesnil.net/stomp-websocket/doc/stomp.html)
70. Spring guides repo `gs-messaging-stomp-websocket` — [https://github.com/spring-guides/gs-messaging-stomp-websocket](https://github.com/spring-guides/gs-messaging-stomp-websocket)