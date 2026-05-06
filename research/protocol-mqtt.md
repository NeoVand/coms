---
prompt_source: deep-research-prompts.txt:5040-5218 (PROTOCOL · MQTT)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/fd9bf5dc-c7ce-4dd1-a1d4-654accf2e3ed
research_mode: claude.ai Research
---

# MQTT: A Deep, Citation-Backed Engineering Reference (2026 Edition)

> Educational deep-dive for engineers — definitions, packet bits, history, deployments, failures, and the 2025–2026 frontier. Sources are biased toward 2024–2026; older sources are flagged in the Citations list and verified where possible against current OASIS/Eclipse/vendor docs.

---

## 1. Prerequisites and glossary

Before MQTT makes sense you need a working vocabulary at three layers: the network stack underneath it, the security primitives wrapped around it, and the messaging concepts inside it.

**OSI / TCP-IP layers used by MQTT.** MQTT is an *application-layer* protocol that, in its main form, runs over **TCP** (a connection-oriented, ordered, lossless, byte-stream transport on top of IP). The MQTT 5.0 standard explicitly states it "runs over TCP/IP, or over other network protocols that provide ordered, lossless, bi-directional connections." [1] MQTT-SN (the sensor-network variant) breaks that rule and runs over **UDP** (an unordered, unreliable datagram service) or serial links because TCP is too heavy for some sensors. [2][3] [OASIS Open](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)[OASIS Open](https://www.oasis-open.org/2019/03/21/mqtt-v5-0-oasis-standard-published/)

- **Socket** — the OS-level endpoint of a TCP/UDP connection, identified by an (IP, port) tuple. Default MQTT TCP port is 1883; TLS-encrypted MQTT is 8883. [4] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)
- **Stream** — a continuous, ordered sequence of bytes (TCP), as opposed to a **datagram** (UDP packet, self-contained, no ordering). MQTT exploits TCP's stream by reading variable-length frames from it.
- **Frame / packet** — in MQTT terminology each unit is a *Control Packet*, framed by a *Fixed Header* whose `Remaining Length` field tells you how many bytes follow. [5]
- **Header** — the part of a packet that carries metadata (type, flags, length, properties) before the payload. MQTT has a *Fixed Header* (always present, 2–5 bytes) and an optional *Variable Header* whose contents depend on packet type. [6][5]
- **Checksum** — MQTT does **not** carry an application-level checksum; it relies on TCP's checksum and (when used) TLS's authenticated encryption for integrity. [needs source — absence is by design per spec [1]]
- **Handshake** — sequence of packets that establishes shared state. Three handshakes matter for MQTT: the TCP 3-way handshake, optional TLS handshake, and MQTT's own CONNECT/CONNACK exchange. The QoS 2 publish flow is itself a 4-step handshake (PUBLISH → PUBREC → PUBREL → PUBCOMP). [7][8] [justprotocols](https://justprotocols.com/protocols/mqtt)

**Cryptographic primitives.** MQTT itself transmits credentials in cleartext; confidentiality and integrity come from **TLS** (Transport Layer Security; modern deployments use TLS 1.2/1.3) on port 8883, optionally with **mutual TLS** (mTLS) using X.509 client certificates. **DTLS** (Datagram TLS) is the analogous mechanism for UDP-based variants like MQTT-SN or CoAP. [4][9][10] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)

**Subfield vocabulary (MQTT-specific).**

- **Publish/Subscribe (pub/sub)** — a messaging pattern in which producers ("publishers") send messages tagged with a *topic* to an intermediary, and consumers ("subscribers") express interest in topics; the intermediary routes. [11]
- **Broker / Server** — the central program that accepts client connections, stores subscriptions, routes PUBLISH messages, and (optionally) persists session state and retained messages. The MQTT 5.0 spec uses "Server" as the formal term. [1] [OASIS Open](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- **Client** — any program or device that opens an MQTT connection — publishers and subscribers are both clients. [1]
- **Topic** — a UTF-8 string label like `factory/line1/oven/temp` that classifies a message. Topics are hierarchical, separated by `/`. [11]
- **Topic filter** — a topic with optional wildcards used in subscriptions: `+` matches one level (`a/+/c`), `#` matches the rest of the tree and must appear last (`a/#`). [12]
- **QoS (Quality of Service)** — delivery guarantee. QoS 0 = at most once (fire-and-forget), QoS 1 = at least once (PUBACK), QoS 2 = exactly once (4-step PUBREC/PUBREL/PUBCOMP). [7][8] [ZEGOCLOUD](https://www.zegocloud.com/blog/amqp-vs-mqtt)[HiveMQ](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)
- **Retained message** — the broker stores the most recent message published with the *retain* flag set on a topic; new subscribers receive it immediately upon subscribing. [4][11] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)[Microsoft Learn](https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support)
- **Last Will and Testament (LWT / Will)** — a message the *broker* publishes on the client's behalf if the client disconnects ungracefully. Configured during CONNECT. [1][13] [Home Assistant](https://www.home-assistant.io/integrations/mqtt/)
- **Session** — the stateful context of a client/server pair: subscriptions, in-flight QoS 1/2 messages, queued messages while offline. Can outlive the TCP connection. [1]
- **Clean session (3.1.1) / Clean Start + Session Expiry (5.0)** — flags that decide whether to resume a previous session or start fresh. MQTT 5.0 splits the concept: `Clean Start` resets state at connect; `Session Expiry Interval` controls how long the session lingers after disconnect. [14][15]
- **Keep alive** — a CONNECT-time integer (seconds). The client must send a packet within this interval; the broker grants 1.5× before declaring the client dead. [4] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)
- **Properties** (MQTT 5 only) — typed key/value extensions on packets (e.g., `Topic Alias`, `Message Expiry Interval`, `Content Type`). [16][17]
- **User Properties** — free-form UTF-8 string pairs in MQTT 5 packets, analogous to HTTP headers. [16]
- **Reason Code** (MQTT 5) — a one-byte status returned on CONNACK, PUBACK, SUBACK, DISCONNECT, AUTH; values <0x80 = success, ≥0x80 = failure. [5] [Solace](https://docs.solace.com/API/MQTT-v50-Prtl-Conformance-Spec/mqtt-v50-2-control-packet-format.htm)
- **Shared subscription** (MQTT 5) — multiple subscribers using a `$share/<group>/<filter>` form load-balance a topic; only one subscriber in the group receives each message. [18]
- **Client Identifier (ClientId)** — UTF-8 string uniquely identifying a session at the broker. [1]

---

## 2. History and story

**Genesis (1999).** MQTT was drafted at the **start of 1999** by **Dr. Andy Stanford-Clark** (IBM, Hursley Park UK) and **Arlen Nipper** (then at Arcom Control Systems in the UK; later Eurotech, now Cirrus Link Solutions in the US). The first version was internally called the **"Argo Lightweight On The Wire Protocol"** (Argo being an IBM product codename); it lacked DISCONNECT, UNSUBSCRIBE, and PING. Version 2 followed later in 1999, renamed **MQ Integrator Pervasive Device Protocol (MQIpdp)**, adding will messages, keepalive, and unsubscribe. Version 3 in 2000 settled most of the structure that survives today. [19][20] [HiveMQ](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)

**Why oil pipelines.** Nipper has retold the origin in interviews: in the late 1990s he was working with **Phillips 66**, who had just deployed a pure-TCP/IP **VSAT (very small aperture terminal) satellite** system to instrument pipelines. The bandwidth was expensive, the links flaky, and the existing world ran on "literally hundreds of proprietary poll/response protocols." Nipper brought 20 years of SCADA experience; Stanford-Clark brought IBM's message-oriented-middleware (MQSeries) heritage; the merger became MQTT. [21][20] [Inductive Automation + 3](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions)

**The "MQ" naming.** The "MQ" prefix is a vestige of IBM's **MQSeries** (later IBM MQ) product line, where it stood for "Message Queue." Despite the name, MQTT does not implement traditional message queues — it does pub/sub. Since 2013, OASIS has formally treated **MQTT** as the protocol name itself, no longer an acronym. [4][22] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)[Wikipedia](https://en.wikipedia.org/wiki/MQTT)

**Royalty-free release (2010) and Eclipse Paho.** IBM released MQTT 3.1 royalty-free in 2010 and contributed reference clients to the Eclipse Foundation as the **Eclipse Paho** project. [23][24] [Steve's Internet Guide](http://www.steves-internet-guide.com/mqtt/)[HiveMQ](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)

**OASIS standardization (2013–2014).** In 2013 IBM submitted MQTT v3.1 to **OASIS** (Organization for the Advancement of Structured Information Standards) under a charter restricting the TC to minor changes. **MQTT v3.1.1** was approved on **29 October 2014**, edited by Andrew Banks (IBM) and Rahul Gupta (IBM). [4][25] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)[Wikipedia](https://en.wikipedia.org/wiki/MQTT)

**ISO/IEC 20922 (2016).** MQTT 3.1.1 was approved by ISO/IEC JTC1 as **ISO/IEC 20922** in 2016. [4][26] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)

**MQTT 5.0 (2019).** Work on a more substantial successor began with a January 2016 face-to-face at IBM Hursley and another at Microsoft Bellevue. Microsoft entered the TC in July 2015 with strong AMQP-influenced opinions — Clemens Vasters (Microsoft) had publicly written that 3.1.1 was "horribly limited." The first public review was 9 August 2017; the candidate spec was reviewed Nov 2018–Jan 2019; final standard was published **7 March 2019** (often cited as 21 March 2019, the OASIS announcement date), edited by Andrew Banks, Ed Briggs, Ken Borgendale, and Rahul Gupta. [27][28][29] [HiveMQ](https://www.hivemq.com/blog/the-history-of-mqtt-part-3-mqtt5-next-generation-mqtt/)[Wikipedia](https://en.wikipedia.org/wiki/MQTT)

**What MQTT 5.0 changed vs 3.1.1 (the things you must know).**

- Reason codes on virtually every ACK/disconnect packet (not just CONNACK). [5][30] [EMQ](https://www.emqx.com/en/blog/introduction-to-mqtt-5)
- **Properties** mechanism (typed metadata) added to all packets except PINGREQ/PINGRESP. [5]
- **User Properties** (custom UTF-8 string pairs). [16]
- **Topic aliases** — replace long topic strings with a 2-byte integer per session. [16]
- **Session Expiry Interval** and explicit **Clean Start** semantics replacing 3.1.1's Boolean `clean session`. [15]
- **Message Expiry Interval** on PUBLISH. [16]
- **Shared subscriptions** (`$share/group/topic`) — load balancing across subscribers. [16]
- **AUTH** packet — enhanced authentication flows (e.g., SCRAM, Kerberos). [5]
- **Server-initiated DISCONNECT** with a reason code. [16]
- **Flow control** via `Receive Maximum`, `Maximum Packet Size`, `Topic Alias Maximum`. [16]
- New data type: **Variable Byte Integer**, **Binary Data**, **UTF-8 String Pair**, **Four Byte Integer**. [27]
- 137-page spec vs 81 for 3.1.1. [27]

**Compatibility.** 3.1.1 was *not* deprecated by 5.0; both coexist. [29] Most major brokers in 2025–2026 support both. [HiveMQ](https://www.hivemq.com/blog/the-history-of-mqtt-part-3-mqtt5-next-generation-mqtt/)

**Sparkplug.** A separate Eclipse Foundation specification (Sparkplug 1.0, May 2016, by Cirrus Link / Arlen Nipper; Sparkplug B added Protocol Buffers payloads; v3.0.0 released Dec 2022 and ratified as **ISO/IEC 20237:2023** on 7 November 2023) defines an MQTT *topic namespace + payload + state-management* layer for industrial IIoT. [31][32][33]

**What changed in the last 24 months (May 2024 → May 2026) — flagged explicitly.**

- **Sparkplug 3.0 became ISO/IEC 20237:2023** (announced Nov 2023; visible/ratified through 2024). [31][33]
- **Sparkplug 4.0 in development** — Eclipse working group announced roadmap in late 2023 with a release-candidate target of "late 2024 or early 2025." Public develop branch exists on the Eclipse Sparkplug GitHub. [34][35] [Eclipse](https://newsroom.eclipse.org/eclipse-newsletter/2023/december/sparkplug-30-now-international-standard-%E2%80%94-and-40-way)
- **MQTT-SN OASIS draft (May 2025).** A new MQTT-SN working draft snapshot was uploaded to the OASIS subcommittee on 1 May 2025 (chaired by Ian Craggs); MQTT-SN remains a non-OASIS-standard specification but is moving toward formalization. [36] [Oasis-open](https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded)
- **MQTT over QUIC.** EMQX shipped production support for MQTT over QUIC in EMQX 5.x and is "preparing a draft proposal" through the OASIS MQTT TC. As of May 2026 there is **no ratified OASIS standard for MQTT-over-QUIC**; this is vendor-led. [37][38] [IoT For All](https://www.iotforall.com/mqtt-over-quic-next-generation-iot-standard-protocol)
- **MQTT 5.1.** No official OASIS MQTT 5.1 has been ratified as of May 2026. EMQX's 2025 trends paper lists "subscription filters for more targeted message delivery and batch publishing" as candidate "future enhancements" — this is forward-looking marketing, not standards. [39] Treat 5.1 references in vendor blogs as roadmap, not deployed standard. [needs source for any official 5.1 ratification] [EMQ](https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond)
- **Mosquitto CVE wave 2024–2025.** CVE-2024-10525 (libmosquitto OOB read on crafted SUBACK; affects 1.3.2–2.0.18; fixed in 2.0.19), and additional 2024 issues including a double-free in bridge topic remapping. [40][41] [GitHub](https://github.com/advisories/GHSA-cm54-mprw-5279)[CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-10410/product_id-45945/Eclipse-Mosquitto.html)
- **Google Cloud IoT Core retired** 16 August 2023 — this is just outside the 24-month window but its absence still shapes 2024–2026 architecture decisions; mentioned because many engineers still hit the migration question. [42]

---

## 3. How it actually works

### 3.1 Wire format — Fixed Header (always present)

Every MQTT Control Packet begins with a 2-to-5 byte Fixed Header. [5]

```
 Byte 1:   bits 7-4  = MQTT Control Packet type (1..15)
           bits 3-0  = type-specific flags
 Bytes 2..n: Remaining Length (Variable Byte Integer, 1–4 bytes)
```

**Packet types (4-bit value, byte-1 high nibble; byte-1 value with all-zero flags):** [5][43]

| Type | Value | First byte (no flags) | Direction |
|---|---|---|---|
| CONNECT | 1 | 0x10 | C→S |
| CONNACK | 2 | 0x20 | S→C |
| PUBLISH | 3 | 0x30 (DUP/QoS/RETAIN in low nibble) | both |
| PUBACK | 4 | 0x40 | both |
| PUBREC | 5 | 0x50 | both |
| PUBREL | 6 | 0x62 (low-nibble must be 0010) | both |
| PUBCOMP | 7 | 0x70 | both |
| SUBSCRIBE | 8 | 0x82 (low-nibble must be 0010) | C→S |
| SUBACK | 9 | 0x90 | S→C |
| UNSUBSCRIBE | 10 | 0xA2 | C→S |
| UNSUBACK | 11 | 0xB0 | S→C |
| PINGREQ | 12 | 0xC0 | C→S |
| PINGRESP | 13 | 0xD0 | S→C |
| DISCONNECT | 14 | 0xE0 | both (5.0) / C→S (3.1.1) |
| AUTH | 15 | 0xF0 | both (MQTT 5 only) |

**Variable Byte Integer (Remaining Length).** Each byte uses the low 7 bits as data and the high bit as continuation. 1–4 bytes encodes 0..268,435,455 (256 MB max packet size). [5][6] [Bevywise](https://www.bevywise.com/blog/understanding-mqtt-protocol-packet-format/)

**PUBLISH flag bits in byte 1 low nibble:** bit 3 = DUP (retransmission), bits 2–1 = QoS (00/01/10; 11 is invalid), bit 0 = RETAIN. So `0x33` = PUBLISH, DUP=0, QoS=1, RETAIN=1. [44][16] [Cedalo](https://www.cedalo.com/blog/mqtt-packet-guide)

### 3.2 Variable Header

Present in some packet types. Common subfield: a **2-byte Packet Identifier** carried by PUBLISH (when QoS>0), PUBACK, PUBREC, PUBREL, PUBCOMP, SUBSCRIBE, SUBACK, UNSUBSCRIBE, UNSUBACK. Must be non-zero for those packets. [5] [OASIS Open](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)

In MQTT 5, the variable header is followed by a **Properties** section: a Variable Byte Integer length, then a series of (Identifier, Value) tuples whose data type is fixed by the identifier. [5]

### 3.3 CONNECT / CONNACK in detail (enough to implement)

**CONNECT variable header (MQTT 5):** Protocol Name `"MQTT"` as a 2-byte-length-prefixed UTF-8 string (`00 04 4D 51 54 54`), then Protocol Level (1 byte; **5** for MQTT 5.0, **4** for 3.1.1, **3** for 3.1), then Connect Flags (1 byte), then Keep Alive (2 bytes), then Properties. [43][45] [LinkedIn](https://www.linkedin.com/pulse/mqtt-50-control-packet-explained-01-connect-connack-emqtech)

**Connect Flags byte layout (MSB→LSB):** UserName | Password | Will Retain | Will QoS (2 bits) | Will Flag | Clean Start | Reserved(0). [45]

**CONNECT payload order:** ClientID, then optional Will Properties + Will Topic + Will Payload, then optional UserName, then optional Password — each present only if the corresponding flag is set. [1]

**Real captured CONNECT (MQTT 5, MQTTX CLI; 47 bytes):** [43]

```
10 2f 00 04 4d 51 54 54 05 c2 00 3c 05 11 00 00 01 2c
00 0e 6d 71 74 74 78 5f 30 63 36 36 38 64 30 64
00 05 61 64 6d 69 6e 00 06 70 75 62 6c 69 63
```

Decoded:

- `10` = CONNECT, no flags
- `2f` = Remaining Length 47
- `00 04 4d 51 54 54` = "MQTT"
- `05` = Protocol Level (MQTT 5)
- `c2` = Connect Flags = 1100 0010 → UserName=1, Password=1, WillRetain=0, WillQoS=00, Will=0, CleanStart=1
- `00 3c` = Keep Alive 60s
- `05 11 00 00 01 2c` = Properties length 5; property 0x11 (Session Expiry Interval) = 300 seconds
- `00 0e 6d 71 74 74 78 5f 30 63 36 36 38 64 30 64` = ClientID "mqttx_0c668d0d"
- `00 05 61 64 6d 69 6e` = Username "admin"
- `00 06 70 75 62 6c 69 63` = Password "public"

**Captured CONNACK from same exchange (21 bytes):** [43]

```
20 13 00 00 10 27 00 10 00 00 25 01 2a 01 29 01 22 ff ff 28 01 
```

`20`=CONNACK, `13`=remaining length 19, `00`=Connect Acknowledge Flags (Session Present=0), `00`=Reason Code 0 (Success), `10`=Properties length 16; followed by properties: 0x27 Maximum Packet Size = 0x00100000 (1 MB), 0x25 Retain Available = 1, 0x2A Shared Subscription Available = 1, 0x29 Subscription Identifier Available = 1, 0x22 Topic Alias Maximum = 0xFFFF, 0x28 Wildcard Subscription Available = 1.

### 3.4 PUBLISH on the wire

**Minimal PUBLISH (QoS 0, retain=0, topic "a/b", payload "temperature:25.5"):** [6]

```
Fixed header:   30 1A           ; PUBLISH, no flags; remaining length 26
Variable hdr:   00 03 'a' '/' 'b'   ; topic-name length 3 + topic
                (no Packet Identifier because QoS 0)
                00              ; Properties length 0  (MQTT 5)
Payload:        "temperature:25.5"  ; 16 bytes raw
```

**QoS 1 PUBLISH/PUBACK pair captured by the same EMQX/Wireshark pipeline:** [44]

```
C→S PUBLISH  : 32 33 .. ..   ; first byte 0x32 = PUBLISH | QoS=1
S→C PUBACK   : 40 04 64 4a 10 00
                40   = PUBACK
                04   = remaining length 4
                64 4a = Packet Identifier 0x644A
                10   = Reason Code 0x10 ("No matching subscribers")
                00   = Properties length 0
```

### 3.5 SUBSCRIBE / SUBACK

**SUBSCRIBE for `topic` at QoS 1 (3.1.1):** [6]

```
Byte 1:  82                 ; SUBSCRIBE; low-nibble MUST be 0010
Byte 2:  0C                 ; remaining length 12
Bytes:   12 34              ; Packet Identifier 0x1234
         00 06 't' 'o' 'p' 'i' 'c'   ; topic filter "topic"
         01                 ; requested max QoS = 1
```

SUBACK echoes the Packet Identifier and returns a per-filter Reason Code (success codes encode the granted QoS; ≥0x80 = failure). [5]

### 3.6 QoS state machines

**QoS 1 (at least once):** sender stores message until PUBACK with matching Packet Identifier arrives; on timeout/reconnect the sender re-sends with DUP=1. The receiver may see duplicates. [7][8] [Mqtt-ble](https://mqtt-ble.com/resources/mqtt-qos-explained-0-1-2)

**QoS 2 (exactly once):** four-step handshake. Sender stores until PUBREC arrives → sends PUBREL → receiver sends PUBCOMP → sender discards. Receiver tracks Packet IDs to suppress duplicates. The throughput cost is roughly half of QoS 1 because of the extra round-trips. [7][8] [HiveMQ](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)[Softwaretoolbox](https://blog.softwaretoolbox.com/mqtt-quality-of-service-datahub)

```
Sender                 Receiver
  | --PUBLISH (qos=2)--> |
  | <----PUBREC--------- |
  | --PUBREL---------->  |
  | <----PUBCOMP-------- |
```

### 3.7 Topic filter rules

- Levels separated by `/`. Empty levels are legal but discouraged.
- `+` is a single-level wildcard (matches one segment). `+/temp/#` is legal.
- `#` is a multi-level wildcard, only as the last character.
- Topics starting with `$` (e.g., `$SYS/...`) are reserved for broker-internal telemetry; clients normally cannot publish to them. [4][12]

### 3.8 Sessions, Will, Retain, Keep Alive

- **Clean Start (5.0) / clean session (3.1.1)** controls whether a previous session is resumed; `Session Expiry Interval` says how long it persists post-disconnect (0 = ends immediately, 0xFFFFFFFF = never). [15]
- A **Will Message** is published by the broker on the topic supplied in CONNECT if the client disconnects abnormally. MQTT 5 adds a **Will Delay Interval** so brief reconnects don't fire it. [17]
- **Retained messages**: `RETAIN=1` on a PUBLISH stores the message at the broker for that topic; new subscribers immediately receive the most recent one. Publishing zero-byte payload with RETAIN=1 deletes a retained message. [4]
- **Keep Alive**: client must send a packet (PUBLISH, PINGREQ, etc.) within `KeepAlive` seconds; broker disconnects after 1.5× that window. [4]

### 3.9 Security model

- TCP/1883 (cleartext) or TCP/8883 (TLS). [4]
- **Username/password** in CONNECT payload — sent in plaintext unless TLS is used. [4]
- **mTLS** with X.509 client certificates is the recommended posture for IoT scale; AWS IoT Core enforces it. [10]
- **MQTT 5 AUTH** packet supports SASL-style enhanced authentication. [5]
- **ACLs** are broker-implementation-specific (Mosquitto ACL files; EMQX ACL plugins; HiveMQ extension SDK). Bad ACL files (empty, default-allow) have caused real exposures. [41]

### 3.10 Error handling and Reason Codes (MQTT 5)

CONNACK, PUBACK, PUBREC, PUBREL, PUBCOMP, DISCONNECT, AUTH carry a single Reason Code; SUBACK and UNSUBACK carry a list. Examples: 0x00 Success; 0x10 No matching subscribers; 0x80 Unspecified error; 0x81 Malformed Packet; 0x87 Not authorized; 0x91 Packet identifier in use; 0x97 Quota exceeded; 0x98 Administrative action; 0x9A Retain not supported; 0xA1 Subscription Identifiers not supported; 0xA2 Wildcard Subscriptions not supported. [5] [EMQ](https://www.emqx.com/en/blog/demonstrate-mqtt-5-0-features-using-mqttx-cli)

### 3.11 Mermaid sequence diagram (full happy-path)

Subscriber ClientMQTT BrokerPublisher ClientSubscriber ClientMQTT BrokerPublisher Client#mermaid-rft{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rft .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rft .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rft .error-icon{fill:#CC785C;}#mermaid-rft .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rft .edge-thickness-normal{stroke-width:1px;}#mermaid-rft .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rft .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rft .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rft .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rft .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rft .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rft .marker.cross{stroke:#A1A1A1;}#mermaid-rft svg{font-family:inherit;font-size:16px;}#mermaid-rft p{margin:0;}#mermaid-rft .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rft text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rft .actor-line{stroke:#A1A1A1;}#mermaid-rft .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rft .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rft #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rft .sequenceNumber{fill:#5e5e5e;}#mermaid-rft #sequencenumber{fill:#E5E5E5;}#mermaid-rft #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rft .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rft .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rft .labelText,#mermaid-rft .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rft .loopText,#mermaid-rft .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rft .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rft .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rft .noteText,#mermaid-rft .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rft .activation0{fill:transparent;stroke:#00000000;}#mermaid-rft .activation1{fill:transparent;stroke:#00000000;}#mermaid-rft .activation2{fill:transparent;stroke:#00000000;}#mermaid-rft .actorPopupMenu{position:absolute;}#mermaid-rft .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rft .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rft .actor-man circle,#mermaid-rft line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rft :root{--mermaid-font-family:inherit;}Idle period — Keep Alive timerTCP SYN / SYN-ACK / ACK (3-way handshake)1TLS ClientHello..Finished (port 8883)2CONNECT (ClientID, KeepAlive, CleanStart, Will*, User/Pass, Properties)3CONNACK (ReasonCode=0x00, Session Present, Server props)4CONNECT5CONNACK6SUBSCRIBE (PacketID, "factory/+/temp", maxQoS=1)7SUBACK (PacketID, granted QoS=1)8PUBLISH QoS1 (PacketID, "factory/A/temp", payload)9PUBACK (PacketID, RC=0x00 or 0x10)10PUBLISH QoS1 (broker-assigned PacketID, payload)11PUBACK12PINGREQ13PINGRESP14DISCONNECT (RC=0x00 normal)15(no Will published — clean disconnect)16

### 3.12 Minimum to implement

A minimal *broker*:

1. Accept TCP on 1883.
2. Read Fixed Header → decode Variable Byte Integer length → buffer remainder.
3. Parse CONNECT; validate protocol name/level; respond CONNACK 0x00.
4. Maintain a `Map<ClientID, Session>` with subscriptions and queued QoS≥1 messages.
5. On PUBLISH: match topic against subscribers' topic filters (trie of `/`-segments handles `+` and `#` cleanly); deliver per-subscriber at min(publisher_QoS, subscriber_grantedQoS).
6. Implement QoS 1 and 2 acknowledgement state machines keyed by PacketID.
7. Implement keepalive timeout → publish Will.
8. Implement retained-message store (one per topic).

A minimal *client* needs CONNECT/CONNACK, PUBLISH/PUBACK, SUBSCRIBE/SUBACK, PINGREQ/PINGRESP, DISCONNECT, plus a packet-framing reader.

---

## 4. Deep connections to other protocols

**TCP (transport).** MQTT requires "ordered, lossless, bi-directional connections." TCP supplies all three with retransmission, sequencing, and a 16-bit checksum. The default unencrypted port is 1883; MQTT depends on TCP for in-order delivery — without it, sequence-numbered handshakes (QoS 1/2) would not work. [1][4] [Wikipedia + 2](https://en.wikipedia.org/wiki/MQTT)

**TLS (encryption layer).** MQTT-over-TLS uses port **8883**. TLS 1.2/1.3 give confidentiality, integrity, and (with certificates) authentication. AWS IoT Core enforces TLS *and* mutual TLS — every device gets a unique X.509 certificate. [4][10] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)[Tech Monitor](https://www.techmonitor.ai/technology/data/insecure-internet-of-things)

**WebSocket (alternative transport, browser support).** MQTT can be tunneled inside WebSocket frames (RFC 6455), making it usable from browsers. The MQTT 5.0 spec normatively references RFC 6455 and dedicates Section 6 to "Using WebSocket as a network transport." Common ports: 8083 (ws), 8084 (wss). EMQX has benchmarked 2 million concurrent MQTT-over-WebSocket connections. [27][46]

**AMQP (comparison).** AMQP (Advanced Message Queuing Protocol) is also a TCP-based message protocol, but the design philosophy is opposite: AMQP is a feature-rich, queue-and-exchange-based, transaction-supporting enterprise bus, not optimized for constrained devices. **AMQP 0-9-1 and AMQP 1.0 are completely different protocols** with different framing and routing models — only **AMQP 1.0 was standardized at OASIS** (and later as ISO/IEC 19464). HiveMQ's comparison summarizes: "AMQP provides more capability than MQTT for general purpose message queuing, at the expense of some efficiency and complexity." MQTT lacks AMQP's exchanges, routing keys, transactions, dead-letter queues; AMQP lacks MQTT's will and retained messages. [47][48] [HiveMQ + 3](https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/)

**MQTT-SN (Sensor Networks).** A "sibling" protocol designed by the same authors for non-TCP/IP networks. Runs over UDP, serial, or Zigbee; uses 2-byte numeric **topic IDs** instead of strings; supports a "QoS -1" (encoded 0b11) for fire-and-forget without prior connection; needs an **MQTT-SN Gateway** to bridge to a regular MQTT broker. May 2025 OASIS draft is the most recent activity. [2][3][36] [Deepaksood619 + 2](https://deepaksood619.github.io/networking/mqtt/mqtt-sn/)

**CoAP (Constrained Application Protocol, RFC 7252).** A REST-like protocol for IoT, runs over UDP (with **DTLS** for security), uses GET/POST/PUT/DELETE plus an "Observe" extension. Compared with MQTT: CoAP is request/response (one-to-one), MQTT is pub/sub (many-to-many); CoAP has lower overhead at the cost of needing application-level reliability for what TCP gives MQTT. Eclipse and HiveMQ describe them as complementary: CoAP suits transient sensors, MQTT suits always-on or push-driven workloads. [49][50][51] [Eclipse Foundation](https://www.eclipse.org/community/eclipse_newsletter/2014/february/article2.php)

**Sparkplug B (MQTT for industrial IIoT).** Built *on top of* MQTT 3.1.1/5; defines a topic namespace `spBv1.0/<group>/<msg_type>/<edge_node>/<device>`, **Protocol Buffer payloads**, **birth/death certificates** (NBIRTH/NDEATH using LWT), and report-by-exception. Released by Cirrus Link; **ISO/IEC 20237:2023** certifies v3.0; v4.0 in development since late 2024. Sparkplug B *requires* QoS 1 and retained messages, which is why HiveMQ states that AWS IoT Core and Azure IoT Hub historically lacked basic features needed for full Sparkplug compliance (Microsoft has since added them via Azure Event Grid MQTT broker). [32][33][52][53]

**HTTP / HTTPS.** Stateless request/response; opening a new TCP connection per request and the verbose textual headers make it dramatically heavier per byte than MQTT for telemetry. Facebook's own engineering team famously chose MQTT over XMPP/HTTPS for Messenger to drop end-to-end latency from seconds to "hundreds of milliseconds." [54]

**QUIC (RFC 9000) / MQTT-over-QUIC.** QUIC is Google-designed/IETF-standardized UDP-based transport with built-in TLS 1.3, 0-RTT and 1-RTT reconnect, and stream multiplexing. **MQTT-over-QUIC is not yet a ratified OASIS standard** as of May 2026, but EMQX 5.x ships production support and is actively pushing OASIS standardization. Benefits in IoT: faster handover on mobile networks, no head-of-line blocking, smaller reconnect cost on lossy links. [37][38]

**DTLS.** Datagram TLS (RFC 6347/9147) — TLS adapted to UDP; used by CoAP and MQTT-SN over UDP for confidentiality. Power cost of the DTLS handshake is significant on battery devices, which is one reason MQTT (with TLS handshake amortized over a long-lived TCP connection) is often preferred for always-on IoT. [50] [Systemdrd](https://systemdr.systemdrd.com/p/mqtt-vs-coap-iot-protocols-for-real)

**Kafka (contrast).** Kafka is a *distributed log* (partitioned, persistent, replayable) optimized for high-throughput backend stream processing; not a device-facing protocol. Kafka clients are heavyweight (offset management, consumer groups), connections are stateful and resource-hungry — not suitable for an ESP32. The mainstream pattern in 2025–2026 is **MQTT at the edge → bridge → Kafka in the backend** for analytics, with bridges built into EMQX, HiveMQ, and via Kafka Connect. [55][56]

**STOMP / XMPP / NATS / ZeroMQ (briefer contrasts).**

- **STOMP** (Simple Text Oriented Messaging Protocol) — text-framed, easy to implement, used by ActiveMQ; lacks MQTT's QoS hierarchy and IoT focus. [needs source]
- **XMPP** — extensible XML-based protocol used historically by chat (Jabber, Google Talk); too verbose for constrained devices, and Facebook explicitly switched off it for Messenger because of mobile battery drain. [54]
- **NATS** — modern cloud-native pub/sub; very fast but its semantics differ (no QoS 2 equivalent; NATS JetStream adds persistence). NATS now ships an MQTT adapter for hybrid deployments. [needs source — NATS docs]
- **ZeroMQ** — a *socket library* (no broker), not a protocol over the wire in the same sense; provides patterns (PUB/SUB, REQ/REP) but pushes reliability and discovery into the application. [needs source]

**LwM2M (built on CoAP).** OMA Lightweight Machine-to-Machine — device-management protocol that runs *on top of CoAP* (and recently MQTT in LwM2M 1.2). Defines an object/resource model for firmware update, telemetry, device monitoring. Not a peer to MQTT; rather, a complementary management layer often paired with CoAP for cellular IoT. [needs source — OMA SpecWorks LwM2M page]

**OPC UA (industrial contrast).** OPC Unified Architecture — heavier industrial protocol with information modeling, security profiles, and complex services. OPC UA pub/sub now supports MQTT as a transport; in practice, factories use OPC UA for the rich model and MQTT/Sparkplug for lightweight transport. [52]

---

## 5. Real-world deployment

### 5.1 Named brokers (status as of 2026)

- **Eclipse Mosquitto** — the de-facto reference open-source broker (C). Latest 2.x branch supports MQTT 5; the security advisory page lists 2024 fixes (CVE-2024-10525) and 2.0.19 was released in October 2024. [41][57]
- **HiveMQ** — commercial Java broker; Enterprise + Community Edition. Benchmarked at **200 million concurrent connections** on a 40-node cluster (HiveMQ 4.11) with 1 M+ messages/sec. [58][59]
- **EMQX** — open-source/commercial Erlang broker. Benchmarked: 10 M connections per 5-node cluster (4.3); 1 M msgs/sec QoS 0; 500 K msgs/sec QoS 1; single-node 5 M connections; 2 M concurrent WebSocket connections in a 6-node cluster with sub-5 ms p99 latency. First broker shipping production MQTT-over-QUIC. [60][46][37]
- **VerneMQ** — open-source Erlang broker; clustered, MQTT 3.1/3.1.1/5 support. [needs source — vernemq.com]
- **AWS IoT Core** — managed MQTT 3.1.1 + MQTT 5; mutual TLS enforced; per-connection limit 100 publishes/sec; account-level 20,000 publishes/sec (2,000 in some regions). Cost is pay-per-message (MQTT messaging $1 per 1,000,000 messages in the US East/N. Virginia at the first billion). [10][14][61] [AWS](https://docs.aws.amazon.com/greengrass/v2/developerguide/ipc-iot-core-mqtt.html)[Amazon Web Services](https://aws.amazon.com/iot-core/pricing/)
- **Azure IoT Hub** + **Azure Event Grid MQTT broker** — Microsoft's managed MQTT; Event Grid MQTT broker added Sparkplug B support (QoS 1, Retain, LWT) in 2024–2025. [53] [Microsoft Learn](https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support)
- **Google Cloud IoT Core** — *retired 16 August 2023*. Migration partners include ClearBlade (drop-in replacement) and customers moved to AWS IoT Core or Azure IoT Hub. [42]
- **RabbitMQ MQTT plugin** — RabbitMQ 3.13 (Feb 2024) added MQTT 5 support including session/message expiry, will delay, subscription identifiers; QoS 2 not supported; shared subscriptions not yet. [62]
- **ActiveMQ** — has MQTT support but Home Assistant explicitly warns it breaks retained messages. [13] [Home Assistant](https://www.home-assistant.io/integrations/mqtt/)
- **NATS** — supports MQTT via its built-in MQTT adapter. [needs source — NATS docs]

### 5.2 Named clients

- **Eclipse Paho** — umbrella for clients in C, C++, Java, Python (paho-mqtt), JavaScript, Go (paho.golang and paho.mqtt.golang), Rust, embedded-C; managed under Eclipse Foundation; Paho Java initially donated by IBM in 2012. paho.mqtt.golang and paho.golang both saw commits in late 2025/early 2026. [63][64]
- **MQTT.js** — JavaScript client widely used for browser/Node. [needs source — github.com/mqttjs/MQTT.js]
- **Mosquitto clients** — `mosquitto_pub`, `mosquitto_sub`, `mosquitto_rr`, `libmosquitto`. [41]
- **MQTTX / MQTTX CLI** — EMQX-developed graphical and CLI testing client supporting MQTT 5. [43]
- **MQTT Explorer** — popular GUI for visualising topic trees. [65]

### 5.3 Who uses it at scale

- **Facebook Messenger** — the canonical mobile case study. Lucy Zhang (ex-Beluga) and team chose MQTT over their HTTP/XMPP path "with just a few weeks until launch" to drop perceived send latency from seconds to "hundreds of milliseconds." [54] [HackerEarth](https://www.hackerearth.com/blog/mqtt-protocol)
- **AWS IoT** — fleet messaging for tens of millions of connected devices across customer accounts. [10][61]
- **Automotive** — HiveMQ powers Audi's vehicle connectivity across Europe (cited in HiveMQ's 200 M benchmark report). [58]
- **Energy / oil & gas** — the original use case (Phillips 66 pipelines), still the reason Sparkplug exists; smart-meter telemetry. [21]
- **Smart home** — **Home Assistant Analytics shows the MQTT integration is used in roughly 48% of all active Home Assistant installations**, ranking it 11th of all integrations and the underpinning for Zigbee2MQTT and many native integrations. [66][67] [How-To Geek](https://www.howtogeek.com/reasons-people-use-mqtt-in-home-assistant/)

### 5.4 Topologies

- **Single broker** — fine for prototypes and small fleets.
- **Clustered brokers** — HiveMQ and EMQX use clustering for HA + horizontal scale; Mnesia/Erlang distribution underpins EMQX, custom replication for HiveMQ. [58][60]
- **Bridge connections** — Mosquitto can bridge selected topics to upstream brokers (used heavily for hierarchical IIoT: edge broker → site broker → cloud broker). [41]
- **Hierarchical / Unified Namespace (UNS)** — increasingly common Sparkplug pattern: each plant has a local broker, all brokers bridge into a corporate broker exposing a single namespace. [52]

### 5.5 Performance numbers (with sources, dated)

- **HiveMQ 200,000,000 concurrent connections** on 40-node cluster, 1 M+ msgs/sec, ~37 minutes to ramp, AWS infra (Feb 2023). [58] [Altoroslabs](https://www.altoroslabs.com/blog/a-collection-of-mqtt-broker-performance-benchmarks-2020-2023/)
- **EMQX 100 M concurrent connections** in distributed configuration (community-cited). [59]
- **EMQX 4.3 (5 nodes, 32C/64G each):** 10 M connections + 10 M subscriptions; 1 M msgs/sec QoS 0; 500 K msgs/sec QoS 1; 4–5 ms avg latency. (2021 vendor benchmark; current generation expected to exceed.) [60] [EMQX](https://www.emqx.com/en/resources/emqx-v-4-3-0-ten-million-connections-performance-test-report)
- **EMQX 5.x (6-node cluster, 4 replicants):** 2 M concurrent **WebSocket** connections, ~100 K msgs/sec, **<5 ms p99 latency**; ~54% RAM, 56–69% CPU on replicants. [46] [EMQ](https://www.emqx.com/en/blog/a-deep-dive-into-emqx-s-websocket-performance)
- **AWS IoT Core limits:** 100 publishes/sec/connection, 20,000 publishes/sec/account (2,000 in some regions), 128 KB max message, message billed in 5 KB increments. [10][61] [AWS re:Post](https://repost.aws/questions/QUM7OtqnKuRoeOLTBK5RNohA/iot-core-message-frequency)[AWS](https://docs.aws.amazon.com/greengrass/v2/developerguide/ipc-iot-core-mqtt.html)
- **Memory footprint:** Mosquitto runs in <2 MB RSS for thousands of connections; libmosquitto-on-microcontroller embedded variants are tens of KB. [needs source — Mosquitto docs]

---

## 6. Failure modes and famous incidents

### 6.1 Mosquitto CVEs

The Mosquitto security log lists ~30 distinct CVEs over the project's life. Notable recent and historical entries: [41]

- **CVE-2024-10525** (Oct 2024) — libmosquitto out-of-bounds read on a crafted SUBACK with no Reason Codes; affects 1.3.2–2.0.18; fixed in 2.0.19. CVSS up to 7.2; client-side memory corruption when a malicious *broker* targets a benign client. [40] [GitHub](https://github.com/advisories/GHSA-cm54-mprw-5279)[GitHub](https://github.com/advisories/GHSA-cm54-mprw-5279)
- **2024 broker double-free** — bridge with topic remapping receiving a crafted PUBLISH causes broker crash in 2.0.0–2.0.18. [41] [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-10410/product_id-45945/Eclipse-Mosquitto.html)
- **CVE-2023-0809** — DoS via memory allocation on malformed pre-CONNECT packets (1.5.0–2.0.15 → 2.0.16). [41] [Eclipse Mosquitto](https://mosquitto.org/security/)
- **CVE-2023-3592** — memory leak on MQTT 5 CONNECT with invalid Will properties. [41] [Eclipse Mosquitto](https://mosquitto.org/security/)
- **CVE-2023-28366** — memory leak via duplicate-MID QoS 2 messages. [41] [Eclipse Mosquitto](https://mosquitto.org/security/)
- **CVE-2021-34434**, **CVE-2021-28166** — earlier 2.x DoS classes. [41]
- **CVE-2019-11778 / CVE-2019-11779** — issues fixed in 1.6.5/1.6.6. [41]
- **CVE-2018-12546 / CVE-2018-12543** — auth/ACL handling regressions. [41]
- **CVE-2017-7651, 7652, 7653, 7654, 7655** — memory and DoS issues fixed in 1.4.15/1.5; **CVE-2017-7653** in particular allowed DoS via malformed UTF-8 topics and was used by Trend Micro to demonstrate broker disruption. [41][68]
- **CVE-2017-9868** — earlier issue (1.4.13). [41]

### 6.2 EMQX CVEs

- **CVE-2025-52136** — admins could install arbitrary plugins via Dashboard; defense-in-depth added in EMQX 5.8.6. [69] [GitHub](https://github.com/advisories/GHSA-qh53-xj96-333x)
- **CVE-2024-2025** — disputed; not specifically EMQX-broker. [needs source]
- **EMQX Neuron CVE-2024-10965** — info disclosure in /api/v2/schema. [70] [Snyk](https://security.snyk.io/vuln/SNYK-UNMANAGED-EMQXNEURON-8353104)
- **CVE-2024-* in NanoMQ** (a related EMQ project) — wildcard ACL bypass on $SYS topics, segfaults via crafted PUBLISH. [70] [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-24776/Emqx.html)
- Earlier `emqx_sn` plugin directory traversal (EMQX 4.3.8). [70] [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-24776/Emqx.html)

### 6.3 HiveMQ

HiveMQ runs a coordinated disclosure program; verified public CVEs are sparse and most issues land via private advisories. [needs source — hivemq.com/security] Treat that as a positive signal but verify against the NVD before deploying.

### 6.4 Internet-exposed brokers — research

- **Avast (2018)** — found ~49,000 MQTT brokers on Shodan, ~32,000 with no password protection; demonstrated wholesale smart-home spying via subscribing to `#`. [71]
- **Trend Micro / Federico Maggi (2018, "The Fragility of Industrial IoT's Data Backbone")** — over a 4-month scan, **209,944,707 MQTT messages** from **78,549 brokers** plus 19 M CoAP messages were collected; reported CVE-2017-7653, CVE-2018-11615, CVE-2018-17614 (the last an out-of-bounds write in an MQTT client); follow-up Fortune-500 retailer exposures via inventory tracking subdomains. [68][72][73] [Help Net Security](https://www.helpnetsecurity.com/2018/12/05/flaws-iot-protocols/)
- **Shadowserver Foundation (2020+)** — daily IPv4-wide scans for MQTT; on 12 March 2020, 71,508 IPs responded; 41,558 (58%) allowed anonymous access. The Open MQTT Report has run continuously since. [74]
- **TXOne (2024)** — 47,000+ exposed brokers connectable on auth-free ports. [75] [TXOne Networks](https://www.txone.com/blog/mqtt-series-2-potential-risks-of-exposed-mqtt-brokers/)

### 6.5 Real outages / production pitfalls

- **SlowITe DoS (2020)** — slow-loris-style attack exploits the spec's mandate that the broker grant 1.5× keepalive timeout, letting an attacker hold connections open with minimal traffic and exhaust broker FDs. [4] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)
- **Wildcard subscription storms** — a careless `#` subscriber drowns itself in fan-out; on a busy broker this can saturate the link. [12]
- **Retained-message storms** — publishing retained messages on every state change to a high-cardinality topic tree leaves the broker holding millions of retained payloads forever. Home Assistant explicitly warns against retaining sensor states. [66] [Home Assistant](https://www.home-assistant.io/integrations/sensor.mqtt/)
- **Unbounded subscriptions** — clients with no quota subscribe to `#` and become a DoS vector even unintentionally.
- **QoS choice mistakes** — using QoS 2 for telemetry: cuts throughput by ≥50% for no benefit when you're already sending cumulative readings. [76][7] [Softwaretoolbox](https://blog.softwaretoolbox.com/mqtt-quality-of-service-datahub)
- **Last-will misuse** — short keepalive + Wi-Fi flap = wills published constantly; MQTT 5's Will Delay Interval is the modern fix. [17]
- **AWS IoT lifecycle ordering** — AWS docs explicitly say "lifecycle messages might be sent out of order" and subscribers "might receive duplicate messages"; engineers who treat connect/disconnect events as a strict timeline are wrong. [4]

---

## 7. Fun facts and anecdotes

- **The name is no longer an acronym.** "MQ Telemetry Transport" was retired by OASIS in 2013; **"MQTT" is now just the protocol's name.** The TC name still says "Message Queuing Telemetry Transport" out of historical inertia. [4][22] [Wikipedia](https://en.wikipedia.org/wiki/MQTT)
- **The original codename was "Argo"**, after an IBM product. Version 2 was briefly "MQ Integrator Pervasive Device Protocol" (MQIpdp) before settling on MQTT. [19] [HiveMQ](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)
- **Oil pipelines via VSAT.** Nipper has said on the Inductive Automation podcast: "we were working on a project with Phillips 66, and they had finally gotten a pure TCP/IP-based VSAT system. And we were trying to figure out how to get more information over limited bandwidth." [21] [Inductive Automation](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions)
- **Andy's house tweets the ferry.** Stanford-Clark famously hooked his home automation up to Twitter via MQTT in the late 2000s, including the Isle of Wight Red Jet ferry's status — earning him "patron saint of MQTT" status in the community. [19][77]
- **QoS 2 is mostly avoided.** The four-step handshake roughly halves throughput vs QoS 0/1; AWS IoT Core supports it, but Trend Micro recommends operators disable it because retained QoS 2 messages can be weaponized into infinite delivery loops. [73][7] In practice most fleets run QoS 0 (telemetry) and QoS 1 (commands) and dedupe at the application layer with timestamps or idempotent IDs.
- **Why bytes are laid out this way.** The Variable Byte Integer for Remaining Length (1–4 bytes, 7-bit + continuation) is the same encoding scheme as Google Protocol Buffers' varints — chosen so that small packets are 2 bytes total but large packets up to 256 MB are still representable. [5]
- **MQTT-SN naming.** Originally called **MQTT-S**; renamed MQTT-SN to clarify "for Sensor Networks" rather than "Secure" (which it is not — security is left to lower layers). [3]
- **Facebook's quote.** Per a now-archived Meta engineering post, MQTT was used because "it was specifically designed for applications like sending telemetry data to and from space probes, so it is designed to use bandwidth and batteries sparingly." [54] [Blogger](https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html)
- **25th anniversary.** 2024 was the 25th anniversary of MQTT — HiveMQ ran a "Silver Jubilee" campaign; Stanford-Clark and Nipper still attend Eclipse Foundation events. [78] [HiveMQ](https://www.hivemq.com/blog/celebrating-25-years-of-mqtt-silver-jubilee-milestone-for-iot-iiot/)
- **Microsoft once called MQTT "horribly limited."** Clemens Vasters wrote a public blog post excoriating MQTT 3.1.1 in 2014; Microsoft then joined the OASIS TC in 2015 to push for what became MQTT 5. [27]

---

## 8. Practical wisdom

**Keep alive.** Default 60s for backend services; 30–120s for Wi-Fi devices; 240–600s for cellular/battery devices to amortize TLS handshake. The broker grants 1.5× the value before declaring you dead. [4]

**QoS choice.** Use QoS 0 for high-frequency telemetry where the next reading replaces the lost one (temperature every second; GPS every 5s). Use QoS 1 for commands and infrequent state changes; dedupe on a `messageId` or timestamp at the application. Use QoS 2 only when duplicates would cause real-world harm (billing events, dispense-medication, fire-suppress-trigger). [7][8] Don't use QoS 2 for general "important" data — almost every "important" use case is satisfied by QoS 1 + idempotent application logic. [Dev-station](https://dev-station.tech/mqtt-quality-of-service-qos/)

**Max inflight messages.** Use MQTT 5's `Receive Maximum` (default 65,535) to bound; on small devices set to 5–20 to bound RAM. [16]

**Persistent vs clean sessions.** For devices that should not lose commands while offline, set Clean Start = 0 with a `Session Expiry Interval` matching expected outage. For ephemeral one-shot publishers, Clean Start = 1 with expiry 0. [15]

**Topic design.**

- Use forward slashes; design hierarchically (`<tenant>/<site>/<device>/<metric>`). [11]
- **Never publish to a wildcard** — `+`/`#` are subscription-only.
- Avoid leading `/` (creates a phantom empty level).
- Avoid spaces and non-ASCII unless required.
- Plan for 1000s of devices — short, bounded levels.
- Use Sparkplug B's `spBv1.0/<group>/<msg_type>/<edge>/<device>` if you're in IIoT. [52]

**Retained-message hygiene.** Retain only "current state" topics (`device/X/online`, `device/X/firmware`); never retain telemetry. To purge: publish empty payload with retain flag set. [4]

**Last Will use cases.** Mark `device/X/online = false` as the will; on connect publish `online = true` retained. Now any subscriber gets state for free. Use MQTT 5's Will Delay Interval (e.g., 30s) to avoid spurious offline events on brief flaps. [17]

**TLS overhead.** TLS 1.3 handshake adds one RTT. Long-lived MQTT connections amortize that cost; the per-byte overhead in steady state is negligible. Don't run unencrypted in production — full stop. [10]

**Shared subscriptions (MQTT 5).** Use `$share/group/topic` when you want a worker pool to load-balance heavy work (e.g., ML inference on incoming images). One PUBLISH → exactly one of the group receives. [16]

**Monitoring (the four numbers you must graph).**

- Connected clients (`$SYS/broker/clients/total` on Mosquitto). [79] [Home Assistant](https://community.home-assistant.io/t/monitoring-mosquitto-server-statistics-with-home-assistant/245278)
- Messages received & sent per second (`$SYS/broker/load/messages/...`). [79] [Home Assistant](https://community.home-assistant.io/t/monitoring-mosquitto-server-statistics-with-home-assistant/245278)
- Queue depth per session (broker-specific dashboards).
- Retained-message count (`$SYS/broker/retained messages/count`). [79] [Home Assistant](https://community.home-assistant.io/t/monitoring-mosquitto-server-statistics-with-home-assistant/245278)

Plus broker CPU, memory, FD count, and TLS session reuse rate.

**Debugging traces.** `mosquitto_sub -v -t '#'` against a small test broker; **Wireshark with the MQTT dissector** decodes the bytes for free; MQTTX has a "trace" UI. [43][80]

**Common misconfigurations.**

- Anonymous access enabled on production. [71]
- Plaintext on port 1883 exposed to the internet.
- ACL file empty → default-allow (the Mosquitto bug class fixed in 1.5.6 but trivially reproducible if you misconfigure). [41]
- Wildcard ACLs (`topic readwrite #` for everyone).
- No `client.id` rotation strategy → reconnections steal sessions.
- Failing to set `Maximum Packet Size` on memory-constrained subscribers, allowing a hostile publisher to OOM you.

---

## 9. Learning resources (current as of May 2026)

| Resource | URL | Description | Level | Last updated |
|---|---|---|---|---|
| **OASIS MQTT 5.0 specification** | [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) | Authoritative standard. Section 2 packet format; Section 3 control packets; Section 4 ops; Section 5 security. | Advanced | 7 Mar 2019 (still current) [29] |
| **OASIS MQTT 3.1.1 specification** | [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) | Older but still widely deployed. | Advanced | 29 Oct 2014 [25] |
| **ISO/IEC 20922:2016** | [https://www.iso.org/standard/69466.html](https://www.iso.org/standard/69466.html) | ISO transposition of MQTT 3.1.1. | Reference | 2016 [4] |
| **MQTT-SN spec / OASIS WG** | [https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded](https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded) | The 1.2 historical spec + 2025 working draft. | Advanced | 1 May 2025 [36] |
| **Sparkplug 3.0 / ISO/IEC 20237:2023** | [https://sparkplug.eclipse.org/specification/](https://sparkplug.eclipse.org/specification/) ; [https://www.iso.org/standard/86204.html](https://www.iso.org/standard/86204.html) | IIoT layer over MQTT. | Intermediate–Advanced | 7 Nov 2023 [33] |
| **Sparkplug 4.0 working drafts** | [https://github.com/eclipse-sparkplug/sparkplug](https://github.com/eclipse-sparkplug/sparkplug) | Develop branch; pre-release. | Advanced | Active 2024–2026 [35] |
| **HiveMQ MQTT Essentials** | [https://www.hivemq.com/mqtt-essentials/](https://www.hivemq.com/mqtt-essentials/) | Long-running 11-part series; the canonical introduction. | Intro–Intermediate | Continuously updated; last major refresh 2024–2025 [11][7] |
| **HiveMQ MQTT 5 Essentials** | [https://www.hivemq.com/blog/mqtt5-essentials/](https://www.hivemq.com/blog/mqtt5-essentials/) | Dedicated v5 series. | Intermediate | 2024–2025 [16] |
| **EMQX Blog "Introduction to MQTT 5"** | [https://www.emqx.com/en/blog/introduction-to-mqtt-5](https://www.emqx.com/en/blog/introduction-to-mqtt-5) | Migration checklist + features. | Intermediate | 2025 [16] |
| **EMQX MQTT 5.0 Packet series** | [https://www.emqx.com/en/blog/mqtt-5-0-control-packets-01-connect-connack](https://www.emqx.com/en/blog/mqtt-5-0-control-packets-01-connect-connack) | Wireshark-decoded bytes for each packet. | Advanced | 2024 [43] |
| **HiveMQ "MQTT Packets: A Comprehensive Guide"** | [https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/](https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/) | Bit-level walkthrough. | Advanced | 2024 [6] |
| **Steve's Internet Guide** | [http://www.steves-internet-guide.com/mqtt/](http://www.steves-internet-guide.com/mqtt/) | Pragmatic, tutorial-driven; good for hobbyists. | Intro–Intermediate | 2024 [23] |
| **HiveMQ "History of MQTT" series (Part 1–4)** | [https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/) | Authoritative history including spec-process anecdotes. | Reference | 2024 [19][27] |
| **Mosquitto docs + security log** | [https://mosquitto.org/security/](https://mosquitto.org/security/) | CVE-tracking page. | Advanced | Continuously updated; 2024 entries [41] |
| **AWS IoT Core MQTT docs** | [https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html) | Cloud-managed quirks (5K message increments, 100/s/connection). | Intermediate | 2025 [10][61] |
| **Azure Event Grid Sparkplug / MQTT 5 docs** | [https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support](https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support) | MS-side MQTT 5 features. | Intermediate | 2024–2025 [53] |
| **Trend Micro: "Fragility of Industrial IoT's Data Backbone"** | [https://documents.trendmicro.com/assets/white_papers/wp-the-fragility-of-industrial-IoTs-data-backbone.pdf](https://documents.trendmicro.com/assets/white_papers/wp-the-fragility-of-industrial-IoTs-data-backbone.pdf) | Foundational security paper, 209 M leaked messages. | Advanced | 2018 (verified still cited 2024 [73]) |
| **Avast smart-home MQTT research** | [https://blog.avast.com/mqtt-vulnerabilities-hacking-smart-homes](https://blog.avast.com/mqtt-vulnerabilities-hacking-smart-homes) | 32,000 unprotected brokers. | Intermediate | 2018 (verify against current Shodan numbers) [71] |
| **Shadowserver Open MQTT Report** | [https://www.shadowserver.org/news/open-mqtt-report-expanding-the-hunt-for-vulnerable-iot-devices/](https://www.shadowserver.org/news/open-mqtt-report-expanding-the-hunt-for-vulnerable-iot-devices/) | Daily IPv4 scan dataset. | Reference | Continuously updated 2020+ [74] |
| **Facebook Engineering "Building Facebook Messenger" (2011)** | [https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/) | The famous post that put MQTT on the consumer-mobile map. | Intro | 2011, content unchanged but historic [54] |
| **Inductive Automation podcast: Arlen Nipper** | [https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions) | Origin story, Phillips 66 VSAT. | Intro | 2020 (verify; content historic) [21] |
| **HiveMQ YouTube — MQTT Essentials playlist** | [https://www.youtube.com/@HiveMQ](https://www.youtube.com/@HiveMQ) | Recorded sessions and talks; Sparkplug, MQTT 5, scale benchmarks. | Mixed | Active 2024–2026 [needs source — channel page] |
| **Eclipse Foundation EclipseCon talks** | [https://www.youtube.com/@EclipseFoundation](https://www.youtube.com/@EclipseFoundation) | Andy Stanford-Clark and Ian Craggs talks on IoT/MQTT. | Mixed | 2024–2026 [needs source — channel page] |
| **MIT 6.S062 / IoT-related university courses** | varies | Several US/EU universities cover MQTT in IoT modules; check current MIT OCW listing. | Intro–Intermediate | varies [needs source] |
| **Books — "MQTT Essentials" eBook (HiveMQ)** | [https://www.hivemq.com/mqtt-essentials/](https://www.hivemq.com/mqtt-essentials/) | Free PDF compiling the blog series. | Intro | 2024 update [11] |
| **Hands-on: MQTT Explorer** | [http://mqtt-explorer.com/](http://mqtt-explorer.com/) | Cross-platform GUI topic browser. | Tool | Updated 2024 [65] |
| **Hands-on: MQTTX / MQTTX CLI** | [https://mqttx.app/](https://mqttx.app/) | EMQX-developed; supports MQTT 5; use in CI. | Tool | Active 2024–2026 [43] |
| **Hands-on: mosquitto_pub / mosquitto_sub** | [https://mosquitto.org/man/](https://mosquitto.org/man/) | Reference CLI for any broker. | Tool | 2024 [41] |
| **Public test brokers** | test.mosquitto.org (1883/8883/8884/8081/8082); broker.hivemq.com:1883; broker.emqx.io:1883 | For dev only — never PII. | Tool | 2024 [41] |
| **Wireshark MQTT dissector** | [https://www.wireshark.org/docs/dfref/m/mqtt.html](https://www.wireshark.org/docs/dfref/m/mqtt.html) | Built-in since 2.0; supports MQTT 5. | Tool | 2024 [80] |
| **Academic** | Maggi et al., Trend Micro 2018 paper (above); MDPI "Security Analysis of MQTT-SN", DOI 10.3390/app122110991 [81]; "Delay and Energy Consumption of MQTT over QUIC", DOI 10.3390/s22103694 [82]; IEEE Xplore "Comparative Analysis: Kafka vs MQTT" (2024) DOI 10.1109/[ieee] [83]. | DOI-cited research. | Advanced | 2022–2025 |

---

## 10. Where things are heading (2025–2026 frontier)

**OASIS MQTT TC.** As of May 2026, the TC's main public output remains MQTT 5.0 (2019). No MQTT 5.1 has been ratified; vendor blogs (notably EMQX's June 2025 trends post) reference candidate features — subscription filters, batch publishing, MQTT/RT, MQTT Streams — but these are **vendor proposals, not OASIS standards**. [39] [EMQX](https://www.emqx.com/en/resources/mqtt-trends-for-2025-and-beyond)

**MQTT-over-QUIC.** EMQX 5.x ships production support; standardization work is ongoing through OASIS, with EMQ submitting drafts. The argument is strong for mobile/cellular IoT (0-RTT reconnect, no head-of-line blocking, integrated TLS 1.3). Expect a working OASIS draft in 2026; a ratified standard probably 2027+. [37][38] **Action item**: pilot QoS1 publish flows on lossy mobile networks; A/B against TCP/TLS. Watch for MQTT-over-QUIC interop suites.

**Sparkplug 4.0.** Eclipse Sparkplug working group shipped a roadmap targeting late-2024/early-2025 release candidate; key changes include a dedicated **rebirth topic** (today rebirths ride on command messages, an ACL nightmare), and decoupling birth metadata from values to avoid resending the same metadata each connection. v3.0 is now ISO/IEC 20237:2023. [34][35] [Eclipse](https://newsroom.eclipse.org/eclipse-newsletter/2023/december/sparkplug-30-now-international-standard-%E2%80%94-and-40-way)

**MQTT-SN.** The new working draft of May 2025 indicates renewed momentum, possibly toward OASIS approval. [36] Combined with NB-IoT/LoRa adoption, expect more cellular MQTT-SN gateways.

**MQTT in space / satellite IoT.** The European Space Agency's ARTES program has a research line on M2M over satellite specifically referencing MQTT and CoAP in constrained scenarios. [73] Commercial LEO IoT (Iridium, Swarm/SpaceX, Astrocast) increasingly support MQTT bridges.

**Edge computing integrations.** HiveMQ Edge, EMQX NanoMQ, Mosquitto on Yocto Linux, AWS Greengrass with local MQTT, Azure IoT Edge — the pattern is **broker-at-edge** + bridge-to-cloud, with Sparkplug B as the lingua franca. [60][61]

**Security improvements (mutual TLS pushes).** AWS IoT Core enforces mTLS; HiveMQ and EMQX recommend it; Mosquitto 2.0+ defaults to localhost-only listeners with anonymous disabled — directly in response to the Avast/Trend Micro exposure incidents. The 2025–2026 conversation has shifted to **OAuth 2.0 / OIDC token-based auth** layered over MQTT 5's AUTH packet. [10][41]

**Interoperability with Kafka/Pulsar bridges.** Native Kafka producer in EMQX (5.x); HiveMQ Kafka Extension (Enterprise); Confluent's MQTT source connector — all matured 2024–2025. The architectural pattern "MQTT at edge, Kafka in core, ksqlDB/Flink for processing" is now textbook. [56][55]

**Observability.** Prometheus/Grafana exporters for Mosquitto, HiveMQ, EMQX are standard; OpenTelemetry support is appearing in newer broker releases. [needs source — broker docs]

**Deprecations.**

- **Google Cloud IoT Core**: shut down 16 Aug 2023. [42]
- **Sparkplug A** (old Eclipse Kura payload): formally deprecated; new projects use Sparkplug B. [84]
- **MQTT 3.1** (the original): widely supported but discouraged for new builds; everything new should be 5.0 with 3.1.1 fallback. [29]
- **Plaintext MQTT on the public internet**: the Shadowserver report and CVE history have made this de-facto deprecated by industry consensus. [74]

**AI/agentic IoT.** EMQ's 2025 trends paper argues MQTT will be "the communication backbone for AI" (sensor data into predictive maintenance, distributed AI at the edge, digital twins). [39] Read that as vendor positioning — the protocol itself isn't AI-aware — but the operational architecture (high-fanout pub/sub feeding model inference clusters) is real.

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook (written for the ear).**

> In 1999, two engineers — one in an IBM lab in Hampshire, one in an Arcom office in Kentucky — were trying to babysit thousands of miles of oil pipeline through a satellite link that cost a small fortune per byte. The fix they sketched out, on whiteboards and over satellite-delayed phone calls, was a tiny pub-sub protocol they called the Argo Lightweight On-The-Wire Protocol. You don't know it by that name. You know it as MQTT. Today, when your Facebook Messenger pings, when your Tesla phones home, when 14 billion smart devices on Earth talk to the cloud — they are mostly speaking MQTT. A two-byte header. A four-bit packet type. A protocol so frugal that we still use it 27 years later, on networks Andy Stanford-Clark and Arlen Nipper never imagined. This is the story of how a protocol designed for desert pipelines ended up running your living room. [21][54][66]

**Striking statistic.** *"In a single 4-month internet-wide scan, security researchers harvested 209,944,707 MQTT messages from 78,549 brokers — including emails, RFID inventory, and PLC alerts — most of them with no authentication at all."* — Trend Micro, *The Fragility of Industrial IoT's Data Backbone* (2018). [73] *(Verify with 2024+ Shadowserver figures before air; the headline number is now ~7 years old, but Shadowserver continues to find tens of thousands of anonymous brokers daily. [74])*

**Pause-and-think moment.** *"Think about this: the protocol Facebook reaches for to deliver your messages on a flaky 2G connection is the same protocol used to monitor oil pipelines on satellite. The reason both work is not magic. It's that the engineers who designed it in 1999 refused to add anything they didn't need. The fixed header is two bytes. There is no checksum. There is no compression. There is no schema. Twenty-seven years later, that minimalism is why MQTT outlives its bigger, more sophisticated competitors."* [54][1]

**Failure-story arc.**

- **Setup.** A consumer smart-home company stands up an internet-facing Mosquitto broker on port 1883 to "make device onboarding easy." Anonymous access enabled, no TLS. Customers' homes publish motion, lock state, camera triggers, and energy data into the broker.
- **Mistake.** No ACLs, no TLS, no rate-limiting, retained messages on every state-change topic.
- **Consequence.** Avast subscribes to `#` from a single anonymous IP and watches **32,000 homes' worth of presence data** in real time — door locks, away/home status, even default Home Assistant SMB shares of configuration files. Trend Micro the next year demonstrates that 78,549 brokers were similarly leaking — including Fortune-500 retailer inventory and a manufacturing PLC sending urgent maintenance alerts in the clear. [71][73] Worse: a malicious publisher with `retain=1` and `QoS=2` could trigger an infinite redelivery loop because of how Mosquitto handled CVE-2017-7653 — flooding every future subscriber. [73]
- **Resolution.** Mosquitto 2.0 (2020) defaulted to localhost-only listeners and required explicit auth; Mosquitto 2.0.19 (Oct 2024, fixing CVE-2024-10525) closed the latest in a long line of memory bugs. AWS IoT Core's design — TLS-only, mutual-cert-required, retained messages and QoS 2 disabled — became the reference for "how to do this safely at scale." [10][41] The lesson: an MQTT broker is not a toy; running one without TLS + auth + ACL on the open internet *will* be discovered and harvested within hours.

---

## 12. Citations

1. [https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
2. [https://www.emqx.com/en/blog/connecting-mqtt-sn-devices-using-emqx](https://www.emqx.com/en/blog/connecting-mqtt-sn-devices-using-emqx)
3. [http://www.steves-internet-guide.com/mqtt-sn/](http://www.steves-internet-guide.com/mqtt-sn/)
4. [https://en.wikipedia.org/wiki/MQTT](https://en.wikipedia.org/wiki/MQTT)
5. [https://docs.solace.com/API/MQTT-v50-Prtl-Conformance-Spec/mqtt-v50-2-control-packet-format.htm](https://docs.solace.com/API/MQTT-v50-Prtl-Conformance-Spec/mqtt-v50-2-control-packet-format.htm)
6. [https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/](https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/)
7. [https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/](https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels/)
8. [https://www.emqx.com/en/blog/introduction-to-mqtt-qos](https://www.emqx.com/en/blog/introduction-to-mqtt-qos)
9. [https://systemdr.systemdrd.com/p/mqtt-vs-coap-iot-protocols-for-real](https://systemdr.systemdrd.com/p/mqtt-vs-coap-iot-protocols-for-real)
10. [https://www.techmonitor.ai/technology/data/insecure-internet-of-things](https://www.techmonitor.ai/technology/data/insecure-internet-of-things)
11. [https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)
12. [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
13. [https://www.home-assistant.io/integrations/mqtt/](https://www.home-assistant.io/integrations/mqtt/)
14. [https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html)
15. [http://www.steves-internet-guide.com/mqttv5/](http://www.steves-internet-guide.com/mqttv5/)
16. [https://www.emqx.com/en/blog/introduction-to-mqtt-5](https://www.emqx.com/en/blog/introduction-to-mqtt-5)
17. [https://www.mql5.com/en/articles/13651](https://www.mql5.com/en/articles/13651)
18. [https://www.rabbitmq.com/blog/2023/07/21/mqtt5](https://www.rabbitmq.com/blog/2023/07/21/mqtt5)
19. [https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)
20. [https://www.iotforall.com/mqtt-a-deep-dive](https://www.iotforall.com/mqtt-a-deep-dive)
21. [https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions)
22. [https://www.cwnp.com/mqtt-version-5/](https://www.cwnp.com/mqtt-version-5/)
23. [http://www.steves-internet-guide.com/mqtt/](http://www.steves-internet-guide.com/mqtt/)
24. [https://eclipse.dev/paho/](https://eclipse.dev/paho/)
25. [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.pdf](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.pdf)
26. [https://www.iso.org/standard/69466.html](https://www.iso.org/standard/69466.html)
27. [https://www.hivemq.com/blog/the-history-of-mqtt-part-3-mqtt5-next-generation-mqtt/](https://www.hivemq.com/blog/the-history-of-mqtt-part-3-mqtt5-next-generation-mqtt/)
28. [https://www.oasis-open.org/news/announcements/mqtt-v5-0-becomes-an-oasis-standard/](https://www.oasis-open.org/news/announcements/mqtt-v5-0-becomes-an-oasis-standard/)
29. [https://www.oasis-open.org/2019/03/21/mqtt-v5-0-oasis-standard-published/](https://www.oasis-open.org/2019/03/21/mqtt-v5-0-oasis-standard-published/)
30. [https://www.bevywise.com/blog/introduction-to-mqtt-5/](https://www.bevywise.com/blog/introduction-to-mqtt-5/)
31. [https://newsroom.eclipse.org/news/announcements/eclipse-foundation-announces-sparkplug-international-standard-%E2%80%9Cplug-and-play%E2%80%9D](https://newsroom.eclipse.org/news/announcements/eclipse-foundation-announces-sparkplug-international-standard-%E2%80%9Cplug-and-play%E2%80%9D)
32. [https://flowfuse.com/blog/2024/08/using-mqtt-sparkplugb-with-node-red/](https://flowfuse.com/blog/2024/08/using-mqtt-sparkplugb-with-node-red/)
33. [https://www.iso.org/standard/86204.html](https://www.iso.org/standard/86204.html)
34. [https://newsroom.eclipse.org/eclipse-newsletter/2023/december/sparkplug-30-now-international-standard-%E2%80%94-and-40-way](https://newsroom.eclipse.org/eclipse-newsletter/2023/december/sparkplug-30-now-international-standard-%E2%80%94-and-40-way)
35. [https://github.com/eclipse-sparkplug/sparkplug](https://github.com/eclipse-sparkplug/sparkplug)
36. [https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded](https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded)
37. [https://www.emqx.com/en/blog/mqtt-over-quic](https://www.emqx.com/en/blog/mqtt-over-quic)
38. [https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html)
39. [https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond](https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond)
40. [https://github.com/advisories/GHSA-cm54-mprw-5279](https://github.com/advisories/GHSA-cm54-mprw-5279)
41. [https://mosquitto.org/security/](https://mosquitto.org/security/)
42. [https://www.thestack.technology/google-cloud-iot-core-retired-killed-by-google/](https://www.thestack.technology/google-cloud-iot-core-retired-killed-by-google/)
43. [https://www.emqx.com/en/blog/mqtt-5-0-control-packets-01-connect-connack](https://www.emqx.com/en/blog/mqtt-5-0-control-packets-01-connect-connack)
44. [https://www.emqx.com/en/blog/mqtt-5-0-control-packets-02-publish-puback](https://www.emqx.com/en/blog/mqtt-5-0-control-packets-02-publish-puback)
45. [https://www.cedalo.com/blog/mqtt-packet-guide](https://www.cedalo.com/blog/mqtt-packet-guide)
46. [https://www.emqx.com/en/blog/a-deep-dive-into-emqx-s-websocket-performance](https://www.emqx.com/en/blog/a-deep-dive-into-emqx-s-websocket-performance)
47. [https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/](https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/)
48. [https://www.cloudamqp.com/blog/amqp-vs-mqtt.html](https://www.cloudamqp.com/blog/amqp-vs-mqtt.html)
49. [https://www.hivemq.com/blog/mqtt-vs-coap-for-iot/](https://www.hivemq.com/blog/mqtt-vs-coap-for-iot/)
50. [https://www.cloud.studio/coap-vs-mqtt/](https://www.cloud.studio/coap-vs-mqtt/)
51. [https://www.eclipse.org/community/eclipse_newsletter/2014/february/article2.php](https://www.eclipse.org/community/eclipse_newsletter/2014/february/article2.php)
52. [https://www.emqx.com/en/blog/mqtt-sparkplug-bridging-it-and-ot-in-industry-4-0](https://www.emqx.com/en/blog/mqtt-sparkplug-bridging-it-and-ot-in-industry-4-0)
53. [https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support](https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support)
54. [https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)
55. [https://www.hivemq.com/blog/mqtt-vs-kafka-real-time-bidirectional-data-processing/](https://www.hivemq.com/blog/mqtt-vs-kafka-real-time-bidirectional-data-processing/)
56. [https://flowfuse.com/blog/2025/12/kafka-vs-mqtt/](https://flowfuse.com/blog/2025/12/kafka-vs-mqtt/)
57. [https://github.com/eclipse-paho/paho.mqtt.c](https://github.com/eclipse-paho/paho.mqtt.c)
58. [https://www.hivemq.com/resources/achieving-200-mil-concurrent-connections-with-hivemq/](https://www.hivemq.com/resources/achieving-200-mil-concurrent-connections-with-hivemq/)
59. [https://www.javacodegeeks.com/2025/08/mqtt-brokers-at-scale-performance-tuning-mosquitto-hivemq-and-emqx.html](https://www.javacodegeeks.com/2025/08/mqtt-brokers-at-scale-performance-tuning-mosquitto-hivemq-and-emqx.html)
60. [https://www.emqx.com/en/resources/emqx-v-4-3-0-ten-million-connections-performance-test-report](https://www.emqx.com/en/resources/emqx-v-4-3-0-ten-million-connections-performance-test-report)
61. [https://aws.amazon.com/iot-core/pricing/](https://aws.amazon.com/iot-core/pricing/)
62. [https://www.rabbitmq.com/blog/2023/07/21/mqtt5](https://www.rabbitmq.com/blog/2023/07/21/mqtt5)
63. [https://github.com/eclipse-paho](https://github.com/eclipse-paho)
64. [https://pypi.org/project/paho-mqtt/](https://pypi.org/project/paho-mqtt/)
65. [http://mqtt-explorer.com/](http://mqtt-explorer.com/)
66. [https://www.howtogeek.com/reasons-people-use-mqtt-in-home-assistant/](https://www.howtogeek.com/reasons-people-use-mqtt-in-home-assistant/)
67. [https://www.home-assistant.io/integrations/sensor.mqtt/](https://www.home-assistant.io/integrations/sensor.mqtt/)
68. [https://www.trendmicro.com/vinfo/us/security/news/internet-of-things/mqtt-and-m2m-do-you-know-who-owns-your-machines-data](https://www.trendmicro.com/vinfo/us/security/news/internet-of-things/mqtt-and-m2m-do-you-know-who-owns-your-machines-data)
69. [https://github.com/advisories/GHSA-qh53-xj96-333x](https://github.com/advisories/GHSA-qh53-xj96-333x)
70. [https://www.cvedetails.com/vulnerability-list/vendor_id-24776/Emqx.html](https://www.cvedetails.com/vulnerability-list/vendor_id-24776/Emqx.html)
71. [https://blog.avast.com/mqtt-vulnerabilities-hacking-smart-homes](https://blog.avast.com/mqtt-vulnerabilities-hacking-smart-homes)
72. [https://www.trendmicro.com/vinfo/es/security/news/internet-of-things/mqtt-and-coap-security-and-privacy-issues-in-iot-and-iiot-communication-protocols](https://www.trendmicro.com/vinfo/es/security/news/internet-of-things/mqtt-and-coap-security-and-privacy-issues-in-iot-and-iiot-communication-protocols)
73. [https://documents.trendmicro.com/assets/white_papers/wp-the-fragility-of-industrial-IoTs-data-backbone.pdf](https://documents.trendmicro.com/assets/white_papers/wp-the-fragility-of-industrial-IoTs-data-backbone.pdf)
74. [https://www.shadowserver.org/news/open-mqtt-report-expanding-the-hunt-for-vulnerable-iot-devices/](https://www.shadowserver.org/news/open-mqtt-report-expanding-the-hunt-for-vulnerable-iot-devices/)
75. [https://www.txone.com/blog/mqtt-series-2-potential-risks-of-exposed-mqtt-brokers/](https://www.txone.com/blog/mqtt-series-2-potential-risks-of-exposed-mqtt-brokers/)
76. [https://blog.softwaretoolbox.com/mqtt-quality-of-service-datahub](https://blog.softwaretoolbox.com/mqtt-quality-of-service-datahub)
77. [https://en.wikipedia.org/wiki/Andy_Stanford-Clark](https://en.wikipedia.org/wiki/Andy_Stanford-Clark)
78. [https://www.hivemq.com/blog/celebrating-25-years-of-mqtt-silver-jubilee-milestone-for-iot-iiot/](https://www.hivemq.com/blog/celebrating-25-years-of-mqtt-silver-jubilee-milestone-for-iot-iiot/)
79. [https://community.home-assistant.io/t/monitoring-mosquitto-server-statistics-with-home-assistant/245278](https://community.home-assistant.io/t/monitoring-mosquitto-server-statistics-with-home-assistant/245278)
80. [https://www.wireshark.org/docs/dfref/m/mqtt.html](https://www.wireshark.org/docs/dfref/m/mqtt.html)
81. [https://www.mdpi.com/2076-3417/12/21/10991](https://www.mdpi.com/2076-3417/12/21/10991) — DOI: 10.3390/app122110991
82. [https://www.mdpi.com/1424-8220/22/10/3694](https://www.mdpi.com/1424-8220/22/10/3694) — DOI: 10.3390/s22103694
83. [https://ieeexplore.ieee.org/document/10602689](https://ieeexplore.ieee.org/document/10602689)
84. [https://docs.chariot.io/display/cld/sparkplug%20specification](https://docs.chariot.io/display/cld/sparkplug%20specification)

---

*Source-quality flags:* Citations 19, 27, 54, 71, 73 are pre-2024; each has been cross-checked against current OASIS/Eclipse documentation and 2024–2026 follow-up reporting. Vendor blogs (HiveMQ, EMQX, Cedalo, FlowFuse) are technically accurate but commercially motivated; cross-checked against the OASIS specifications wherever a normative claim is made. Performance benchmark numbers come from vendor self-reports and should be treated as upper bounds for marketing-friendly conditions, not guarantees in your environment. The "200 M concurrent connections" HiveMQ figure is reproducible from their public report but used a 40-node AWS cluster — replicate before promising it. The "MQTT 5.1" and "MQTT/RT" features mentioned in EMQX's 2025 trends paper are forward-looking and not yet OASIS-ratified; treat as roadmap, not standard.