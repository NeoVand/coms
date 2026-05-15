---
id: coap
type: protocol
name: Constrained Application Protocol
abbreviation: CoAP
etymology: "[C]onstrained [A]pplication [P]rotocol"
category: async-iot
year: 2014
rfc: RFC 7252
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/packets
  - async-iot/coap
related_protocols: [udp, tls, rest, tcp, http1, websockets]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [7252, 6690, 7641, 7959, 8132, 8323, 8428, 8613, 8949, 8974, 9052, 9147, 9175, 9177, 9290, 9423, 9528, 9529, 9594]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/500px-Arduino_Uno_-_R3.jpg
    caption: An Arduino Uno — the kind of constrained device CoAP was designed for. Limited RAM and processing power push past HTTP and into a four-byte header.
    credit: Photo — SparkFun Electronics / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "An illustrated CoAP message header — four bytes total, drawn as a single 32-bit row. Two bits for Version, two bits for Type (CON/NON/ACK/RST), four bits for Token Length, eight bits for Code in c.dd format, sixteen bits for Message ID. Annotate the 0xFF payload marker as a single byte separator."
  - "Side-by-side wire-overhead comparison: a complete four-byte CoAP Empty message next to a twenty-byte TCP segment header next to a five-byte TLS record framing. Each block to scale, with a caption noting that a full CoAP request fits inside the bytes TCP uses to say hello."
  - "The three CoAP response patterns as a sequence diagram: Piggybacked (one round-trip with response inside the ACK), Separate (Empty ACK then a later CON carrying the response), and Non-confirmable (fire-and-forget). Time flowing top to bottom, sensor on the left, server on the right."
  - "An EDHOC handshake versus a DTLS 1.3 ECC handshake, drawn as horizontal arrows with byte counts. EDHOC: three messages, ~100 bytes total. DTLS 1.3: six flights, ~700+ bytes. A small calendar icon labelled 'years of battery life' sitting next to the EDHOC bar."
  - "A world map of the January 2019 NETSCOUT scan: 388,344 publicly reachable CoAP endpoints, with China shaded for the 81% concentration. A small inset breaks down what the endpoints actually were — mostly QLC Chain peer-to-peer crypto on Chinese smartphones, not the smart-buildings devices the protocol was designed for."
  - "An Observe-pattern timeline: client sends one CON GET with Observe=0, server returns ACK with Observe=42 and a value, then pushes NON notifications with Observe=43, 44, 45 as the resource changes, and a final CON notification numbered 51 that the client ACKs."
---

# CoAP — Constrained Application Protocol

## In one breath

CoAP is what you build when you need REST semantics on a microcontroller with ten kilobytes of RAM, a battery meant to last ten years, and a radio that can only fit eighty bytes per frame. It looks like HTTP from a distance — GET, POST, PUT, DELETE, status codes, URIs — but the wire format is a four-byte binary header running over UDP, with confirmable messages providing optional reliability, an Observe option for server push, and block-wise transfer for payloads that exceed a datagram. Twelve years after RFC 7252, almost every cellular IoT device on Earth uses CoAP under the hood — typically wrapped inside the OMA LwM2M device-management protocol — and every Thread mesh network uses it for commissioning and management.

## The pitch

The fixed CoAP header is four bytes. A TCP header is twenty. A TLS record framing is five. A complete CoAP request fits inside the space TCP uses just to say hello. That is not compression. That is a different philosophy of what a request should cost. This episode walks through how CoAP actually works on the wire, where it really runs in production, the famous 2019 incident in which most of the world's visible CoAP endpoints turned out not to be IoT devices at all, and the security shift now happening from DTLS to OSCORE plus EDHOC — a 2024 key exchange that fits a full mutual authentication handshake into about a hundred bytes.

## How it actually works

CoAP runs over UDP on port 5683, with secure CoAPS over DTLS on port 5684. Every message starts with a four-byte fixed header, optionally followed by a 0–8 byte Token, zero or more delta-encoded Options, the single byte 0xFF marker if there is a payload, and then the payload itself. The simulator on this protocol's page walks through it: the sensor sends a Confirmable GET to `/temperature`, the server piggybacks the response inside the ACK with code 2.05 Content and a JSON payload, then the sensor sends a Confirmable PUT to `/led` with the body `ON`, and the server replies with code 2.04 Changed.

### Header at a glance

The four-byte fixed header packs more into thirty-two bits than any other internet protocol header you have ever read.

- **Version (2 bits)** — must be 01. Other values silently ignored.
- **Type (2 bits)** — Confirmable (00), Non-confirmable (01), Acknowledgement (10), Reset (11). The four message types of the messaging layer.
- **Token Length (4 bits)** — 0 to 8. Values 9–15 are a message format error in the base spec; RFC 8974 reserves them for extended tokens used by stateless proxies.
- **Code (8 bits)** — split as a 3-bit class and a 5-bit detail, written as `c.dd`. Class 0 is request: 0.01 GET, 0.02 POST, 0.03 PUT, 0.04 DELETE, plus 0.05 FETCH and 0.06/0.07 PATCH/iPATCH from RFC 8132. Class 2 is success: 2.05 Content, 2.04 Changed. Class 4 is client error: 4.04 Not Found, 4.02 Bad Option. Class 5 is server error: 5.03 Service Unavailable. Code 0.00 is an Empty message.
- **Message ID (16 bits)** — used to match a CON to its ACK and to detect duplicates. Receivers cache MIDs for about 247 seconds (`EXCHANGE_LIFETIME`) and replay the cached ACK on a re-received CON.
- **Token (0–8 bytes)** — client-generated, opaque to the server, used to match a response to a request even when the message IDs differ. Required for separate responses, where the ACK and the actual response come on different MIDs.
- **Options** — TLV-style with delta encoding. Each option's number is the previous option's number plus its delta, packed into a 4-bit nibble with 13 and 14 as escape values pointing to one- or two-byte extensions. Options whose number is odd are critical (the receiver must understand them or reject the message); even-numbered options are elective. The whole critical-or-elective decision costs zero header bits — it is encoded in the parity bit. Common option numbers: Uri-Host (3), Uri-Port (7), Uri-Path (11, repeatable), Content-Format (12), Max-Age (14), Uri-Query (15), Accept (17), Block2 (23), Block1 (27), Observe (6), Proxy-Uri (35), Size1 (60).
- **Payload Marker (0xFF)** — present only if there is a payload. 0xFF was chosen because it cannot validly appear as the first byte of an option, giving parsers an unambiguous single-byte separator.

The smallest legal CoAP message is four bytes — an Empty message, just the header. A real GET typically lands at ten to twenty bytes. That matters because constrained networks like 6LoWPAN fragment IPv6 packets into roughly eighty-byte IEEE 802.15.4 frames, and every avoided fragment is a lower retransmission cost.

### Two layers in one protocol

CoAP has a messaging layer and a request/response layer stacked together. The messaging layer handles CON/NON/ACK/RST, deduplication by Message ID, and retransmission. The request/response layer handles Token-matched semantics across messages, regardless of how the underlying CON/ACK exchange is shaped.

A Confirmable message must be acknowledged. If no ACK arrives by `ACK_TIMEOUT × ACK_RANDOM_FACTOR` — defaults of two seconds and 1.5, so a window of two to three seconds — the sender retransmits and doubles the timeout. After `MAX_RETRANSMIT` attempts (default four), the sender gives up. That is five total transmissions across roughly forty-five seconds before the application gets a NACK. Other defaults: `NSTART=1` (one outstanding CON per endpoint), `DEFAULT_LEISURE=5 s` for multicast responder spread, `PROBING_RATE=1 byte/s`.

Three response patterns exist. **Piggybacked** is the common case: the server includes the response inside the ACK, one round trip total. **Separate** is for slow operations: the server sends an Empty ACK immediately to confirm receipt, then later sends the response in its own CON message, which the client ACKs. **Non-confirmable** is fire-and-forget — useful for periodic telemetry where loss of a single sample does not matter. There is no state machine in the TCP sense; the protocol is closer to UDP plus a deduplication cache plus a retransmit timer.

### Observe, Block-Wise, and discovery

Observe (RFC 7641, September 2015) lets a client subscribe to a resource. The client sends a GET with the Observe option set to zero; the server returns the current value with Observe set to a sequence number, then continues to push updates as Non-confirmable notifications whenever the resource changes. Periodically the server promotes a notification to Confirmable to verify the client is still listening; the client deregisters by sending a GET with Observe=1.

Block-Wise Transfer (RFC 7959, August 2016) chunks payloads larger than a datagram into negotiated blocks. Block1 carries request payloads — PUT and POST bodies — and Block2 carries response payloads. Switch them and transfers silently break. Block size is encoded in a four-bit SZX field, choosing among 16, 32, 64, 128, 256, 512, and 1024-byte blocks.

Discovery happens at `/.well-known/core`, defined in RFC 6690 (August 2012). A device responds with a CoRE Link Format listing of its resources. The same query works over multicast, so a single packet can ask "every temperature sensor on this network, identify yourself."

### Security mechanics

CoAP defines four security modes in section 9 of RFC 7252: NoSec, PreSharedKey, RawPublicKey, and Certificate. The first three plus certificates run on top of DTLS over UDP, or TLS for CoAP over TCP. DTLS adds a handshake — typically six flights and around eight hundred bytes for ECC certificates — before the first CoAP byte. That is heavy on a battery and stateful at NAT boxes, where bindings can expire in well under a minute.

OSCORE (RFC 8613, July 2019) is the application-layer alternative. It wraps the CoAP code, options, and payload in a COSE_Encrypt0 AEAD object using AES-CCM-16-64-128 by default, leaving Uri-Host, Uri-Port, and proxy-related options visible so caches and proxies still work. The result is end-to-end protection across CoAP-to-HTTP proxies — something DTLS cannot do, because DTLS terminates at the proxy.

EDHOC (RFC 9528, March 2024) is the matching key exchange. Three messages, around a hundred bytes total for static-DH credentials, producing an OSCORE Security Context. EDHOC typically lives at `/.well-known/edhoc` and uses CBOR and COSE for its envelopes. RFC 9529 provides test vectors. RFC 9594 (September 2024) adds ACE-based key provisioning for Group OSCORE, which is the multicast story.

For replay protection, OSCORE puts a Sequence Number in each request's Partial IV and the server keeps a sliding replay window per Recipient Context. You must re-key before the Sequence Number wraps around.

## Where it shows up in production

**Cellular IoT — NB-IoT and LTE-M.** Most carrier IoT platforms expose LwM2M-over-CoAP/DTLS as the canonical device-management interface. Vodafone, Telefónica, AT&T, T-Mobile, Verizon, Telenor, KPN. Commercial servers built on this stack include Arm's Pelion (now Izuma Networks), Nokia IMPACT, Ericsson IoT Accelerator, Huawei OceanConnect, AVSystem Coiote, and IoTerop. Typical LwM2M register-update payloads sit in the 50–150 byte range over NB-IoT, which is what allows multi-year battery operation on a coin cell.

**Thread mesh networks.** The Thread Management Framework uses CoAP for commissioning and management — the dedicated "CoAP-TMF" registration in Wireshark exists for exactly this reason. But — and this is the most-misquoted fact in IoT writing — Matter does *not* use CoAP for its main payloads. Matter has its own Message Reliability Protocol on UDP port 5540, plus TCP and BTP for commissioning. CoAP shows up in Thread's network management, not in Matter's smart-home application messages. Older blog posts that say "Thread uses CoAP" are imprecise; "Thread management uses CoAP" is the precise statement.

**Smart buildings, industrial automation, smart cities.** Lighting, HVAC, parking sensors, waste-bin monitors, agricultural soil probes, wearable health devices. The vendor-published numbers are sparse, but the architectural pattern is consistent: a constrained device speaks CoAP-over-DTLS to a gateway or a cloud LwM2M server, often with SenML/CBOR payloads.

**The reference implementations matter as much as the deployments.** **libcoap**, in C under a BSD license and maintained by Olaf Bergmann, is the de facto reference; it ports to Contiki, RIOT, Zephyr, FreeRTOS, and ESP-IDF, with DTLS via OpenSSL, GnuTLS, MbedTLS, wolfSSL, or tinyDTLS, and OSCORE since the 4.3 series. **Eclipse Californium** in Java is the production-grade server side; the Eclipse Foundation's own marketing talks about "millions of IoT devices with a single service instance," and version 4.0.0-M3 in 2025 added Java 21 virtual threads, raising emulated-client capacity from "5 000–10 000" to "30 000–40 000" per process — those are vendor figures for emulated clients, not measured production benchmarks. **Eclipse Leshan** is the Java LwM2M server built on Californium, with a public sandbox at `leshan.eclipseprojects.io`. **aiocoap** is the Python 3 / asyncio implementation maintained by Christian Amsüss, supporting RFC 7252, 7641, 7959, 8132, 8323, and partial 8613. **node-coap** for JavaScript, **CoAPthon3** for Python, **Go-CoAP** by plgd-dev, **CoAP.NET** for .NET, and **microcoap**, **nanocoap** in RIOT-OS, and Zephyr's built-in CoAP for the embedded targets.

**Public test servers** include `coap://coap.me`, the Californium sandbox at `coap://californium.eclipseprojects.io`, and the Leshan LwM2M sandbox.

**Performance shape.** RFC 7252's design target was 8-bit MCUs and links in the tens of kilobits per second. Kovatsch, Lanter, and Shelby reported in *IoT 2014* that Californium on commodity hardware hit hundreds of thousands of CoAP requests per second, meaningfully outperforming HTTP servers because of the lower per-request work. A 2019 *Sensors* paper from Suwannapong and Khunboa measured default CoAP RTT on Cooja/Contiki at hundreds of milliseconds, with the default `ACK_TIMEOUT=2 s` providing slack for lossy links. Tiloca and colleagues benchmarked Group OSCORE on Zolertia Zoul and TI SimpleLink hardware in ACM TIoT 2022 — handshake cost was dominated by signature ops, but per-message overhead was tens of microseconds of CPU and 30–60 bytes on the wire.

## Things that go wrong

The famous CoAP incident is the **CoAP reflection and amplification DDoS wave of January–March 2019**, documented by the ASERT team at NETSCOUT. The mechanism is straightforward: a 21-byte `GET /.well-known/core` produces a roughly 720-byte response — an amplification factor of about 34×. NETSCOUT's January 2019 scan found 388,344 publicly reachable CoAP endpoints, **81% in China**, and most of them were not IoT devices at all. They were Chinese mobile phones running the QLC Chain peer-to-peer cryptocurrency stack. CoAP's most-deployed-at-scale use case for years was, embarrassingly, P2P crypto on smartphones rather than the smart-buildings vision the protocol was designed for. The chapter episode on CoAP tells that story; this one defers to it.

The often-repeated "3,300×" figure is *not* CoAP. That is the memcached UDP record from February 2018. CoAP's measured factor is 34× — middle of the pack per NETSCOUT, but enough that the FBI issued a Private Industry Notification later in 2019 warning explicitly about CoAP and ARMS amplification. By 2024, A10 Networks' DDoS Weapons Report counted CoAP as roughly 4% of global amplification weapons across 155 countries, still concentrated in China, Russia, and the Philippines. Reflectors slowly aged out as Chinese carriers blocked outbound 5683/UDP and as QLC moved to TLS. The lesson the CoRE WG took to heart: NoSec is fine for testing, lethal in deployment.

**Implementation CVEs have been a steady drumbeat.** CVE-2019-9004 in Eclipse Wakaama 1.0 leaked 24 bytes of memory per crafted packet via a malformed CoAP option, eventually causing OOM. CVE-2020-12887 in Arm Mbed OS 5.15.3 (mbed-coap 5.1.5) was an integer overflow in `sn_coap_parser_options_parse()` that produced double-allocation memory leaks in URI-Path, Uri-Query, Location-Query, and ETag handling. CVE-2024-0962 in libcoap 4.3.4 was a stack-based buffer overflow in `get_split_entry()` inside `coap_oscore.c` — remotely exploitable, since patched. CVE-2024-31031 in libcoap was an unsigned-integer overflow in `coap_pdu.c`.

The most recent one, **CVE-2026-29013**, was disclosed on 17 April 2026: an OSCORE Appendix-B.2 CBOR unwrap path in libcoap whose `get_byte_inc()` function in `src/oscore/oscore_cbor.c` relied on `assert()` for bounds checking, which is compiled out under `NDEBUG`. Crafted CoAP requests with malformed OSCORE options yield out-of-bounds reads and a possible heap overflow via integer wraparound. CVSS 4.0 score 8.8, HIGH; as of early May 2026, no patched release was available for some distros. Note the year format — CVE IDs from 2026 still look unfamiliar, but the format is correct.

A 2025 dataset called **CoAP_UAD**, published in *Data in Brief* by Aveleira-Mata and colleagues, captures protocol-level attacks against CoAP services for IDS training — the formal IDS-research follow-up to 2019.

## Common pitfalls (for the practitioner)

**Leaving CoAP open on the public internet.** Any server reachable from the internet on UDP/5683 with no DTLS is a reflector. Shadowserver still publishes a daily Accessible CoAP Report.

**Running NoSec mode in production "for now."** That is how the 2019 reflector pool was built. NoSec exists for benchtop development. Production wants DTLS-PSK at minimum; OSCORE for end-to-end across proxies; EDHOC for cheap key establishment.

**Unsynchronised retransmit parameters.** RFC 7252 explicitly recommends consistent `ACK_TIMEOUT`, `ACK_RANDOM_FACTOR`, and `MAX_RETRANSMIT` between client and server. Defaults of two seconds and four retransmits cover most of the way to forty-five seconds; on satellite, NB-IoT idle-mode wakeup, or cell-edge LTE-M with five-to-fifteen-second RTTs, you must tune up — and ensure the peer matches.

**Forgetting NAT binding lifetimes.** UDP NAT bindings often expire in under sixty seconds. A cloud-pushed CoAP request to a device behind NAT silently drops if the device has not kept the binding alive. The motivation for RFC 8323 (CoAP over TCP, TLS, WebSockets) is exactly this — when you need cloud-to-device push and you have NAT in the path, persistent transport beats sporadic UDP.

**Block size larger than path MTU after DTLS expansion.** The combination produces silent fragmentation drops on 6LoWPAN. Negotiate Block1/Block2 SZX values that fit in your path MTU minus the DTLS overhead.

**Mixing up Block1 and Block2.** Block1 is for the request payload (PUT/POST body); Block2 is for the response payload. Switch them and transfers silently break.

**Non-randomised tokens.** RFC 7252 §5.3.1 is explicit that tokens should be unguessable as a basic anti-spoofing measure; a fixed or counter-based token is a weakness.

**DTLS without session resumption or DTLS 1.2 Connection ID (RFC 9146).** Without these, every NAT-induced port change forces a full handshake. A sleepy NB-IoT modem can be DTLS-rebinding every wake — a hundreds-of-bytes cost paid for nothing.

## Debugging it

Wireshark ships the CoAP dissector mainline (file `epan/dissectors/packet-coap.c`); a separate "CoAP-TMF" registration handles the Thread management framing. The filters worth knowing:

- `coap` — show all CoAP traffic.
- `coap.code == 0.01` — only GETs.
- `coap.token` — track a request through retransmits and Observe notifications by its Token.
- `coap.opt.observe` — Observe registrations and notifications.
- `dtls` next to `coap` — handshake bytes versus payload bytes ratio. If your handshake-to-data ratio is bad, DTLS resumption is not working.

For DTLS decryption, capture with `SSLKEYLOGFILE` set; Californium 4.0.0-M3 supports `draft-ietf-tls-keylogfile`, and Wireshark consumes the resulting keylog directly.

What to monitor in production:

- **CON retransmit count per device** — early indicator of radio degradation.
- **4.xx versus 5.xx response distribution** — 5.03 Service Unavailable spikes often signal NSTART contention.
- **DTLS handshake failure rate and average bytes per handshake** — is resumption working?
- **Block-Wise abandoned downloads** — count 4.08 Request Entity Incomplete responses.
- **OSCORE replay-window drops and Sequence Number wraparound** — per RFC 8613 you *must* re-key before SN exhausts.
- **NAT binding age versus observed device-push success rate** — the canonical CoAP-over-UDP NAT smell.

Common debugging moves: reproduce against `coap://coap.me` or the Leshan sandbox to isolate client-versus-server bugs; run `aiocoap-client coap://[::1]/.well-known/core` to confirm discovery before higher-level testing; run libcoap's `coap-client -m get -B 30 coap://...` with `-v 9` for a verbose option dump.

A note on the GUI tooling: there is no maintained graphical CoAP browser plugin in 2026. Matthias Kovatsch's Copper (Cu) Firefox add-on, which let you type `coap://californium.eclipse.org/` directly in the URL bar like it was HTTP, died in November 2017 when Firefox 57 cut XUL extensions — Kovatsch wrote in the issue tracker, "WebExtensions do not allow for custom protocol handlers… Mozilla killed Copper." The Chrome successor, Copper4Cr, was caught by Google's deprecation of Chrome Apps shortly after. If you are debugging CoAP today, you are doing it in a terminal.

## What's changing in 2026

**`draft-ietf-core-coap-pubsub` reached revision -19 in March 2026.** A topic-oriented CoAP publish/subscribe broker is now stable and close to RFC publication — the long-promised IETF answer to MQTT's broker model. The draft moved from -15 in October 2024 to -19 over eighteen months.

**Group OSCORE is in IESG territory.** `draft-ietf-core-oscore-groupcomm-28` (December 2025) brings authenticated multicast, a precondition for lighting and HVAC use cases that need to address dozens of devices at once.

**The errata-cleanup umbrella is on track.** `draft-ietf-core-corr-clar` reached -04 in December 2025 and will, when published, formally update RFCs 6690, 7252, 7641, 7959, 8132, and 8323 — fixing accumulated errata and ambiguities in one pass.

**DNS-over-CoAP is about to ship.** `draft-ietf-core-dns-over-coap-20` (2025) lets constrained devices do encrypted DNS over CoAPS or OSCORE — analogous to DoH, but without DoH's TLS overhead.

**CoAP-PM (performance measurement)** is the working group's response to the encrypted-protocol opacity problem QUIC also faces. `draft-ietf-core-coap-pm-05` (October 2025) defines a CoAP option for end-to-end and hop-by-hop telemetry.

**RFC 9594 (September 2024)** added ACE-based key provisioning for group communication — the missing piece for Group OSCORE deployments.

**RFC 9528 (March 2024) — EDHOC.** The biggest constrained-IoT crypto news of the period. Three messages, around a hundred bytes for static-DH credentials, against roughly seven hundred bytes for a DTLS 1.3 ECC handshake. For a battery-powered device sending one packet a day, the difference can mean years of additional life. RFC 9529 ships the test vectors.

**LwM2M.** Version 1.2.2 was published in June 2024 — a bug-fix and interop release. LwM2M 2.0 is under active development at OMA SpecWorks as of late 2025, focused on smart-city and large-fleet deployment.

**CoAP-over-QUIC: not on the IETF roadmap.** No CoRE WG document maps CoAP onto QUIC. Academic work has explored proxy-based CoAP-over-QUIC — Park and colleagues reported about an 80% RTT reduction in a 2023 testbed in *ICT Express* — but the working group is instead investing in CoAP-over-DTLS-1.3 ALPN identification (`draft-ietf-core-coap-dtls-alpn`) and CoAP-over-bundle-protocol for delay-tolerant networks.

**Matter 1.4 (September 2024)** continues *not* using CoAP for application messages. CoAP remains in the Thread management stack only.

**Deprecated or fading:** Copper Cu in Firefox; Copper4Cr in Chrome Apps (Google deprecated the Chrome Apps platform); CoAP NoSec on the public internet under sustained CVE pressure and Shadowserver naming-and-shaming; CoAP over plain TCP without TLS, which RFC 8323 allows but deployments actively discourage.

## Fun facts (host material)

**Smaller than a TCP handshake.** A complete CoAP CON request plus ACK round trip can be smaller than the SYN of a TCP handshake. Carsten Bormann liked to point out that the smallest CoAP message is four bytes, while a single TCP segment header is already twenty.

**Critical-or-elective by parity bit.** Whether a CoAP option is critical or elective is encoded in the *parity* of its option number — odd is critical, even is elective. It costs zero header bits. Probably the cleverest economy in the spec.

**0xFF was chosen deliberately.** The payload marker is 0xFF because that byte cannot validly appear as the first byte of an option — option length 15 is reserved as a format error. So a parser scanning forward sees the 0xFF and knows unambiguously that everything after it is payload.

**Sensinode → ARM → Edge Impulse.** Zach Shelby co-founded Sensinode in Oulu, Finland, drove early CoAP code, and sold the company to ARM in 2013 — at which point CoAP went from "academic spec" to "ARM IoT marketing centerpiece" practically overnight. Shelby later co-founded the BBC Micro:bit Foundation and is now CEO of Edge Impulse.

**The QLC Chain surprise.** When NETSCOUT actually mapped the world's CoAP endpoints in January 2019, most of them were not IoT devices. They were Chinese mobile phones running the QLC Chain peer-to-peer cryptocurrency stack. CoAP's biggest deployment by visible count was, for years, P2P crypto on smartphones — not the smart-buildings vision the protocol was built for. The chapter episode on CoAP turns this into the centerpiece anecdote.

**Bormann's RFC count.** Carsten Bormann at the University of Bremen TZI is co-author or editor of more than thirty RFCs touching CoAP/CoRE, CBOR, CDDL, 6LoWPAN, JSONPath, and more — including, in the last twenty-four months alone, RFC 9423 (CoRE Target Attributes), RFC 9535 (JSONPath), RFC 9557 (timestamps), RFC 9741 (CDDL controls), and the in-progress `draft-ietf-core-corr-clar` errata umbrella.

**EDHOC's hundred-byte handshake.** Mutual authentication, forward secrecy, three messages, roughly a hundred bytes total for static-DH credentials. A DTLS 1.3 ECC handshake costs seven hundred bytes or more. For a sensor that sends one CoAP packet per day on a coin cell, that handshake-cost difference is years of battery life.

## Where this connects in the book

- **Packets and Encapsulation** (Part *Foundations*) — encapsulation in pictures: frames inside packets inside segments. CoAP shows up as the application-layer payload that ends up inside a UDP datagram inside an IPv6 packet inside an IEEE 802.15.4 frame on a 6LoWPAN mesh — the canonical illustration of why a four-byte header matters when every avoided fragment is a saved retransmission.
- **CoAP** (Part *Async / IoT*) — the chapter that tells the story this episode points at: Sensinode in Oulu, the Bremen TZI group, ARM's 2013 acquisition, the QLC Chain surprise, the Matter misconception, the Copper plugin's death, and the Pub/Sub and OSCORE/EDHOC frontier. The episode here covers mechanism, production, debugging, and pitfalls; the chapter covers the narrative arc.

## See also (other protocol episodes)

**CoAP versus MQTT.** MQTT is publish/subscribe through a central broker over TCP; CoAP is request/response directly between endpoints over UDP. MQTT's two-byte minimum header beats CoAP's four-byte fixed header on absolute size, but CoAP's REST-like model — resource URIs, GET/PUT/POST/DELETE — gives you HTTP intuition on a microcontroller. Use MQTT when many devices need topic-based fan-out through a broker with retained messages and last-will. Use CoAP when devices act as both client and server, when REST semantics fit your domain, and when you want UDP for low-power lossy networks like 6LoWPAN or NB-IoT. The CoAP working group's belated answer is `draft-ietf-core-coap-pubsub`, now near RFC.

**CoAP plus UDP.** UDP is what makes CoAP cheap. The eight-byte UDP header plus CoAP's four-byte header is twelve bytes of total transport-plus-application overhead, against TCP's twenty bytes for the transport header alone. UDP gives CoAP no connection state, no head-of-line blocking, and the ability to use IP multicast — which CoAP exploits for the multicast discovery query at `/.well-known/core`. The cost is that UDP gives no reliability or ordering, so CoAP rebuilds those at the application layer with CON/ACK and Message-ID deduplication. The UDP episode is the natural prerequisite.

**CoAP versus REST and HTTP.** CoAP self-consciously imitates HTTP/REST so that proxies can bridge them. Methods, status codes, media types, URIs, and caching all mirror HTTP. RFC 7252 specifies a stateless HTTP-to-CoAP mapping that lets a single proxy translate between the two. The trade-off CoAP makes is to drop the verbose ASCII headers and keep only the semantics — an HTTP request that would take 400 bytes can land at 20 bytes in CoAP without losing the REST model.

**CoAP plus TLS, DTLS, and TCP.** RFC 8323 (February 2018) defines CoAP over TCP, TLS, and WebSockets. The framing changes — a length prefix replaces the UDP boundary — and CON/ACK semantics are stripped because TCP is already reliable. This is what you reach for when you have NAT in the path or when you are tunneling cloud-to-device through a proxy. The TLS episode explains TLS 1.3; the DTLS episode (when we get there) explains how the same handshake works over a datagram transport.

**CoAP plus WebSockets.** Same RFC 8323. A CoAP-over-WebSockets endpoint lets a constrained-style protocol traverse anything that already lets HTTPS through — which is why this binding exists for cloud back-ends and for browser-side debugging tools.

## Visual cues for image generation

- An illustrated CoAP message header — four bytes total, drawn as a single 32-bit row. Two bits for Version, two bits for Type (CON/NON/ACK/RST), four bits for Token Length, eight bits for Code in c.dd format, sixteen bits for Message ID. Annotate the 0xFF payload marker as a single byte separator.
- Side-by-side wire-overhead comparison: a complete four-byte CoAP Empty message next to a twenty-byte TCP segment header next to a five-byte TLS record framing. Each block to scale.
- The three CoAP response patterns as a sequence diagram: Piggybacked, Separate, and Non-confirmable. Sensor on the left, server on the right, time flowing downward.
- An EDHOC handshake versus a DTLS 1.3 ECC handshake, drawn as horizontal arrows with byte counts. EDHOC: three messages, ~100 bytes. DTLS 1.3: six flights, ~700+ bytes.
- A world map of the January 2019 NETSCOUT scan — 388,344 publicly reachable CoAP endpoints, China shaded for the 81% concentration, with an inset noting most were QLC Chain crypto on Chinese smartphones rather than IoT devices.
- An Observe-pattern timeline: client sends one CON GET with Observe=0, server returns ACK with the value, then pushes NON notifications as the resource changes, and a periodic CON notification that the client ACKs.

## Sources

**Specifications**

- [RFC 7252 — The Constrained Application Protocol (CoAP)](https://www.rfc-editor.org/rfc/rfc7252)
- [RFC 6690 — CoRE Link Format](https://www.rfc-editor.org/rfc/rfc6690)
- [RFC 7641 — Observing Resources in CoAP](https://www.rfc-editor.org/rfc/rfc7641)
- [RFC 7959 — Block-Wise Transfers in CoAP](https://www.rfc-editor.org/rfc/rfc7959)
- [RFC 8132 — PATCH and FETCH for CoAP](https://www.rfc-editor.org/rfc/rfc8132)
- [RFC 8323 — CoAP over TCP, TLS, and WebSockets](https://www.rfc-editor.org/rfc/rfc8323)
- [RFC 8428 — SenML](https://www.rfc-editor.org/rfc/rfc8428)
- [RFC 8613 — OSCORE](https://www.rfc-editor.org/rfc/rfc8613)
- [RFC 8949 — CBOR (STD 94)](https://www.rfc-editor.org/rfc/rfc8949)
- [RFC 8974 — Extended Tokens / Stateless Clients](https://datatracker.ietf.org/doc/html/rfc8974)
- [RFC 9052 — COSE Structures](https://www.rfc-editor.org/rfc/rfc9052)
- [RFC 9147 — DTLS 1.3](https://www.rfc-editor.org/rfc/rfc9147)
- [RFC 9175 — Echo, Request-Tag, Token Processing](https://www.rfc-editor.org/rfc/rfc9175)
- [RFC 9177 — Q-Block1/Q-Block2 Robust Block-Wise Transfer](https://www.rfc-editor.org/rfc/rfc9177)
- [RFC 9290 — Concise Problem Details for CoAP APIs](https://www.rfc-editor.org/rfc/rfc9290)
- [RFC 9423 — CoRE Target Attributes Registry](https://www.rfc-editor.org/rfc/rfc9423)
- [RFC 9528 — EDHOC](https://www.rfc-editor.org/rfc/rfc9528.html)
- [RFC 9529 — EDHOC Test Vectors](https://datatracker.ietf.org/doc/rfc9529/)
- [RFC 9594 — ACE Key Provisioning for Group OSCORE](https://www.ietf.org/rfc/rfc9594.html)
- [draft-ietf-core-coap-pubsub](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/)
- [draft-ietf-core-oscore-groupcomm](https://datatracker.ietf.org/doc/draft-ietf-core-oscore-groupcomm/)
- [draft-ietf-core-corr-clar](https://datatracker.ietf.org/doc/draft-ietf-core-corr-clar/)
- [draft-ietf-core-dns-over-coap](https://datatracker.ietf.org/doc/html/draft-ietf-core-dns-over-coap-20)
- [draft-ietf-core-coap-pm](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pm/)
- [draft-ietf-core-coap-dtls-alpn](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/)
- [IANA — CoAP Option Numbers](https://www.iana.org/assignments/core-parameters/core-parameters.xhtml)
- [CoRE WG charter](https://datatracker.ietf.org/wg/core/charter/)

**Papers**

- [Bormann, Castellani, Shelby — CoAP: An Application Protocol for Billions of Tiny Internet Nodes (IEEE Internet Computing, 2012)](https://harmanani.github.io/classes/csc498r/Readings/CoAP2012.pdf)
- [Kovatsch, Lanter, Shelby — Californium: Scalable Cloud Services for the IoT through CoAP (IoT 2014)](https://ieeexplore.ieee.org/document/6970762)
- [Tiloca et al. — Performance Evaluation of Group OSCORE (ACM TIoT, 2022)](https://dl.acm.org/doi/10.1145/3523064)
- [Suwannapong & Khunboa — Congestion Control in CoAP Observe (Sensors, 2019)](https://www.mdpi.com/1424-8220/19/15/3433)
- [Aveleira-Mata et al. — CoAP_UAD: CoAP Under Attack Dataset (Data in Brief, 2025)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/)
- [Hiesgen et al. — The Age of DDoScovery (ACM IMC 2024)](https://arxiv.org/abs/2410.11708)
- [Park et al. — Use of QUIC for CoAP transport in IoT networks (ICT Express, 2023)](https://www.sciencedirect.com/science/article/pii/S2542660523002287)
- [EDHOC security analysis (arXiv 2407.07444)](https://arxiv.org/abs/2407.07444)

**Vendor and engineering blogs**

- [Eclipse Californium](https://eclipse.dev/californium/)
- [Eclipse Californium 4.0.0-M3 release](https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3)
- [Eclipse Leshan](https://eclipse.dev/leshan/)
- [libcoap](https://libcoap.net/)
- [aiocoap docs](https://aiocoap.readthedocs.io/en/latest/)
- [Ericsson Research — OSCORE: A look at the new IoT security protocol](https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol)
- [AVSystem Anjay — OMA LwM2M brief description](https://avsystem.github.io/Anjay-doc/LwM2M.html)
- [Nordic Semiconductor — Cellular IoT Fundamentals, Lesson 5: CoAP](https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-5-cellular-fundamentals/topic/lesson-5-coap-protocol/)
- [coap.space — Bormann's curated landing page](https://coap.space/)

**News and incident reports**

- [NETSCOUT ASERT — CoAP Attacks In The Wild (2019)](https://www.netscout.com/blog/asert/coap-attacks-wild)
- [Shadowserver — Accessible CoAP Report (June 2020)](https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/)
- [A10 Networks — 2024 DDoS Weapons Report](https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf)
- [Duo Decipher — FBI warns of DDoS attacks abusing network protocols](https://duo.com/decipher/fbi-warns-of-ddos-attacks-abusing-network-protocols)
- [Computerworld — ARM acquires Sensinode (2013)](https://www.computerworld.com/article/1508299/arm-acquires-sensinode-a-maker-of-software-for-internet-of-things.html)
- [Black Hat EU 2024 — Breaking Matter Vulnerabilities](https://i.blackhat.com/EU-24/Presentations/EU-24-Genge-BreakingMatterVulnerabiltiesInTheMatterProtocol-wp.pdf)
- [Wireshark CoAP dissector source](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)
- [Copper (Cu) Firefox plugin issue 29 — "Mozilla killed Copper"](https://github.com/mkovatsc/Copper/issues/29)

**CVEs**

- [CVE-2019-9004 — Eclipse Wakaama](https://nvd.nist.gov/vuln/detail/CVE-2019-9004)
- [CVE-2020-12887 — Arm Mbed OS / mbed-coap](https://www.cvedetails.com/cve/CVE-2020-12887/)
- [CVE-2024-0962 — libcoap OSCORE stack overflow](https://www.tenable.com/cve/CVE-2024-0962)
- [CVE-2024-31031 — libcoap unsigned-integer overflow](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2024-31031)
- [CVE-2026-29013 — libcoap OSCORE CBOR unwrap OOB](https://cve.threatint.eu/CVE/CVE-2026-29013)

**Wikipedia**

- [Constrained Application Protocol](https://en.wikipedia.org/wiki/Constrained_Application_Protocol)
- [OMA LwM2M](https://en.wikipedia.org/wiki/OMA_LWM2M)
- [CBOR](https://en.wikipedia.org/wiki/CBOR)
