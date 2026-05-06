---
prompt_source: deep-research-prompts.txt:5399-5575 (PROTOCOL · CoAP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/67ac839e-3ce1-47c9-b152-1d61e84c04eb
research_mode: claude.ai Research
---

# The Constrained Application Protocol (CoAP): A Field Guide for Smart Engineers (May 2026)

## 1. Prerequisites and glossary

CoAP sits at the application layer of the IoT stack, but it leans on a stack of lower-layer concepts. Definitions below are deliberately tight; each term has an authoritative pointer.

- **OSI / TCP-IP layering** — A conceptual stack (physical → link → network → transport → application). CoAP is "application layer," runs on UDP (transport), over IP (network). Authoritative explainer: RFC 1122 ([https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122)).
- **IP / IPv6** — The Internet's network-layer addressing/forwarding protocol. IPv6 (RFC 8200) is the version most relevant to CoAP because constrained networks need its huge address space ([https://www.rfc-editor.org/rfc/rfc8200](https://www.rfc-editor.org/rfc/rfc8200)).
- **UDP (User Datagram Protocol)** — A connectionless, unreliable transport that delivers individual *datagrams* (self-contained packets); no handshake, no ordering, no retransmission. CoAP's default transport. RFC 768 ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)).
- **TCP** — Connection-oriented byte-stream transport with handshake, ordering, retransmission, congestion control. CoAP can also run over TCP (RFC 8323) ([https://www.rfc-editor.org/rfc/rfc793](https://www.rfc-editor.org/rfc/rfc793)).
- **Datagram** — A self-contained packet with addressing in its own header; the unit UDP delivers ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)).
- **Stream** — An ordered, reliable byte sequence (TCP) or independently-flow-controlled message channel (QUIC, HTTP/2/3) ([https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000)).
- **Frame** — A link-layer unit (e.g., IEEE 802.15.4 frame; max 127 bytes) or, in HTTP/2 / QUIC parlance, a typed structured chunk inside a stream ([https://standards.ieee.org/ieee/802.15.4/7029/](https://standards.ieee.org/ieee/802.15.4/7029/)).
- **Socket** — The OS abstraction (IP + port) that an application uses to send/receive packets. CoAP's well-known UDP port is 5683; CoAPS over DTLS is 5684 ([https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)).
- **Header** — Fixed/structured metadata at the start of a packet that tells the receiver how to parse the rest. CoAP's fixed header is 4 bytes ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [GeeksforGeeks](https://www.geeksforgeeks.org/computer-networks/constrained-application-protocol-coap/)
- **Checksum** — Integrity field; UDP carries a 16-bit checksum that covers UDP header + payload. CoAP itself relies on UDP's checksum ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)).
- **Handshake** — A multi-message exchange to establish state. TLS/DTLS perform a cryptographic handshake to derive keys; CoAP itself has no handshake ([https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)).
- **REST** — Architectural style (Fielding 2000) where servers expose *resources* identified by URIs, manipulated by uniform methods (GET/POST/PUT/DELETE). CoAP is REST over UDP ([https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)).
- **URI / URI scheme** — Uniform Resource Identifier; CoAP defines `coap://` and `coaps://` schemes ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **MTU / Path MTU** — Maximum Transmission Unit; on constrained 6LoWPAN, often ~1280 (IPv6 minimum) or smaller after fragmentation. Drives CoAP's Block-Wise Transfer ([https://www.rfc-editor.org/rfc/rfc4944](https://www.rfc-editor.org/rfc/rfc4944)).
- **6LoWPAN** — IPv6 over Low-Power Wireless Personal Area Networks; an adaptation layer for IEEE 802.15.4. RFC 4944 / RFC 6282 ([https://www.rfc-editor.org/rfc/rfc4944](https://www.rfc-editor.org/rfc/rfc4944)).
- **DTLS** — Datagram Transport Layer Security; TLS adapted for unreliable datagram transports. CoAP uses DTLS 1.2 (RFC 6347) and DTLS 1.3 (RFC 9147) ([https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)).
- **TLS** — Transport Layer Security 1.3, RFC 8446 ([https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/)
- **AEAD** — Authenticated Encryption with Associated Data; the cryptographic mode (e.g., AES-CCM, ChaCha20-Poly1305) used by DTLS, OSCORE, EDHOC ([https://www.rfc-editor.org/rfc/rfc5116](https://www.rfc-editor.org/rfc/rfc5116)).
- **CBOR** — Concise Binary Object Representation; binary, JSON-like, schemaless. RFC 8949 obsoletes RFC 7049 (December 2020) ([https://www.rfc-editor.org/rfc/rfc8949](https://www.rfc-editor.org/rfc/rfc8949)). [GlobalSpec](https://standards.globalspec.com/std/13429524/rfc-8613)[Studocu](https://www.studocu.com/row/document/nasarawa-state-university/computer-science/rfc-8949-concise-binary-object-representation-cbor-overview/155013824)
- **COSE** — CBOR Object Signing and Encryption; the cryptographic envelope format used by OSCORE/EDHOC (RFC 9052) ([https://www.rfc-editor.org/rfc/rfc9052](https://www.rfc-editor.org/rfc/rfc9052)).
- **PSK / RPK / X.509** — Pre-Shared Key, Raw Public Key, certificate; the three credential modes CoAP/DTLS supports ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **Confirmable / Non-confirmable / ACK / Reset (CON/NON/ACK/RST)** — CoAP's four message types ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [Jaime](https://jaime.win/lecture/coapmessage.html)[NCBI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6696228/)
- **Token** — 0–8 byte client-chosen identifier used to match request/response across messages ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [Nordic Semiconductor](https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-5-cellular-fundamentals/topic/lesson-5-coap-protocol/)
- **Message ID** — 16-bit identifier for de-duplicating CON/NON and matching ACK/RST ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **TLV (Type-Length-Value)** — The encoding family CoAP options use (with delta encoding) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [IETF](https://www.ietf.org/rfc/rfc7252.txt)
- **Endpoint** — In CoAP, the addressable entity (IP+port+security context) that sends/receives messages ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).

## 2. History and story

CoAP was born inside the IETF **CoRE (Constrained RESTful Environments) Working Group**, chartered in March 2010 to bring REST/Web semantics to "constrained nodes" — devices with kilobytes (not megabytes) of RAM and lossy radio links such as IEEE 802.15.4 / 6LoWPAN ([https://datatracker.ietf.org/wg/core/charter/](https://datatracker.ietf.org/wg/core/charter/)). The intellectual lineage runs back through **Zach Shelby's** company **Sensinode** (Oulu, Finland), the **University of Bremen TZI** group led by **Carsten Bormann**, and **Klaus Hartke** (also Bremen). An influential early sketch — "CoAP: An Application Protocol for Billions of Tiny Internet Nodes," Bormann/Castellani/Shelby — appeared in *IEEE Internet Computing*, March/April 2012 ([https://harmanani.github.io/classes/csc498r/Readings/CoAP2012.pdf](https://harmanani.github.io/classes/csc498r/Readings/CoAP2012.pdf)). [ResearchGate](https://www.researchgate.net/profile/Carsten-Bormann-2)[Harmanani](https://harmanani.github.io/classes/csc498r/Readings/CoAP2012.pdf)

The base spec, **RFC 7252**, was published June 2014 with Shelby (then ARM, after ARM acquired Sensinode in 2013), Hartke, and Bormann as authors ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252); ARM acquisition: [https://www.computerworld.com/article/1508299/arm-acquires-sensinode-a-maker-of-software-for-internet-of-things.html](https://www.computerworld.com/article/1508299/arm-acquires-sensinode-a-maker-of-software-for-internet-of-things.html)). Sensinode's NanoStack/NanoService and the Eclipse "Californium" prototype at ETH Zürich (Matthias Kovatsch) were primary "running code" inputs at the IETF Plugtests; the CoRE WG explicitly cites running interop as a maturation path ([https://datatracker.ietf.org/wg/core/charter/](https://datatracker.ietf.org/wg/core/charter/)). [Highperformr + 2](https://www.highperformr.ai/people/zachshelby)

Major milestones, with what changed:

- **RFC 6690** (Aug 2012, Z. Shelby): CoRE Link Format and the `/.well-known/core` discovery URI ([https://www.rfc-editor.org/rfc/rfc6690](https://www.rfc-editor.org/rfc/rfc6690)). [Hjp](https://www.hjp.at/doc/rfc/rfc6690.html)
- **RFC 7252** (Jun 2014): the base protocol — message format, CON/NON/ACK/RST, options, DTLS binding, URI schemes ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **RFC 7641** (Sep 2015, Hartke): Observe option — server push via "long-lived GET" ([https://www.rfc-editor.org/rfc/rfc7641](https://www.rfc-editor.org/rfc/rfc7641)).
- **RFC 7959** (Aug 2016, Bormann/Shelby): Block1/Block2 — block-wise transfer for payloads bigger than a datagram ([https://www.rfc-editor.org/rfc/rfc7959](https://www.rfc-editor.org/rfc/rfc7959)).
- **RFC 8132** (Apr 2017): adds PATCH and FETCH methods to CoAP ([https://www.rfc-editor.org/rfc/rfc8132](https://www.rfc-editor.org/rfc/rfc8132)). [dblp](https://dblp.org/pid/65/5539.html)
- **RFC 8323** (Feb 2018, Bormann et al.): CoAP over TCP, TLS, and WebSockets — important for cloud back-ends and NAT traversal ([https://www.rfc-editor.org/rfc/rfc8323](https://www.rfc-editor.org/rfc/rfc8323)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/)[dblp](https://dblp.org/pid/65/5539.html)
- **RFC 8613** (Jul 2019, Selander/Mattsson/Palombini/Seitz): OSCORE — application-layer object security; "updates" RFC 7252 ([https://www.rfc-editor.org/rfc/rfc8613](https://www.rfc-editor.org/rfc/rfc8613)). [IETF + 2](https://datatracker.ietf.org/doc/html/draft-tiloca-core-oscore-discovery-18)
- **RFC 8768 / RFC 8949 / RFC 8974** (2020–2021): Hop-Limit option; CBOR (STD 94) replacing RFC 7049; extended tokens ([https://www.rfc-editor.org/rfc/rfc8949](https://www.rfc-editor.org/rfc/rfc8949); [https://www.rfc-editor.org/rfc/rfc8974](https://www.rfc-editor.org/rfc/rfc8974)).
- **RFC 9175** (2022): Echo, Request-Tag, Token Processing — security strengthening ([https://www.rfc-editor.org/rfc/rfc9175](https://www.rfc-editor.org/rfc/rfc9175)).
- **RFC 9177** (2022): Q-Block1/Q-Block2 robust block-wise transfer ([https://www.rfc-editor.org/rfc/rfc9177](https://www.rfc-editor.org/rfc/rfc9177)).
- **RFC 9290** (2022, Fossati/Bormann): Concise Problem Details for CoAP APIs ([https://www.rfc-editor.org/rfc/rfc9290](https://www.rfc-editor.org/rfc/rfc9290)). [dblp](https://dblp.org/pid/65/5539.html)
- **RFC 9528 + RFC 9529** (Mar 2024, Selander/Preuß Mattsson/Palombini): EDHOC — a 3-message authenticated Diffie-Hellman key exchange explicitly designed to bootstrap OSCORE; cuts handshake bytes by ~10× vs DTLS 1.3. Came out of the IETF LAKE WG, not CoRE ([https://www.rfc-editor.org/rfc/rfc9528](https://www.rfc-editor.org/rfc/rfc9528); [https://datatracker.ietf.org/doc/rfc9529/](https://datatracker.ietf.org/doc/rfc9529/)). [IETF + 2](https://datatracker.ietf.org/doc/rfc9529/)
- **RFC 9594** (Sep 2024, Palombini/Tiloca): ACE-based key provisioning for group communication (used by Group OSCORE) ([https://www.rfc-editor.org/rfc/rfc9594.pdf](https://www.rfc-editor.org/rfc/rfc9594.pdf)). [IETF](https://datatracker.ietf.org/doc/html/draft-tiloca-core-oscore-discovery-18)
- **RFC 9423** (Apr 2024, Bormann): CoRE Target Attributes Registry ([https://www.rfc-editor.org/rfc/rfc9423](https://www.rfc-editor.org/rfc/rfc9423)). [IETF](https://datatracker.ietf.org/doc/html/draft-tiloca-core-oscore-discovery-18)[dblp](https://dblp.org/pid/65/5539.html)

**Last 24 months (≈May 2024–May 2026), explicitly:**

- EDHOC reached RFC status (RFC 9528, March 2024) — the biggest constrained-IoT crypto news of the period ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html)).
- RFC 9594 (key provisioning for Group OSCORE) published September 2024 ([https://www.ietf.org/rfc/rfc9594.html](https://www.ietf.org/rfc/rfc9594.html)).
- The errata-fixing umbrella draft moved from "individual" `draft-bormann-core-corr-clar` to working-group document `draft-ietf-core-corr-clar` (current revision -04, December 2025) and is on track to formally update RFCs 6690/7252/7641/7959/8132/8323 ([https://datatracker.ietf.org/doc/draft-ietf-core-corr-clar/](https://datatracker.ietf.org/doc/draft-ietf-core-corr-clar/)).
- `draft-ietf-core-coap-pubsub` advanced through revisions -15 (Oct 2024) → -19 (Mar 2026) — a CoAP publish/subscribe broker is now stable and close to RFC publication ([https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-pubsub-17)[IETF](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/)
- New active CoRE drafts as of 2026 include `coap-dtls-alpn`, `coap-pm` (performance measurement), `coap-bp` (bundle protocol/aggregation), `dns-over-coap`, `oscore-groupcomm` (Group OSCORE -28, December 2025), `oscore-capable-proxies`, `fasor` (Fast/Slow RTO) ([https://core-wg.github.io/](https://core-wg.github.io/)). [IETF CoRE WG](https://core-wg.github.io/)
- LwM2M 1.2.2 was published June 2024 (bug-fix/interop release); LwM2M 2.0 is under active development at OMA SpecWorks as of late 2025 ([https://en.wikipedia.org/wiki/OMA_LWM2M](https://en.wikipedia.org/wiki/OMA_LWM2M)). [Grokipedia](https://grokipedia.com/page/OMA_LWM2M)[Grokipedia](https://grokipedia.com/page/OMA_LWM2M)
- The **Copper (Cu) Firefox plugin is dead** — has been since Firefox 57 (Nov 2017) killed XUL extensions; the maintainer wrote that "WebExtensions do not allow for custom protocol handlers… Mozilla killed Copper" ([https://github.com/mkovatsc/Copper/issues/29](https://github.com/mkovatsc/Copper/issues/29)). The successor is **Copper4Cr (Chrome)** at [https://github.com/mkovatsc/Copper4Cr](https://github.com/mkovatsc/Copper4Cr) but it requires a packaged "Chrome App," which Google itself deprecated, leaving most users on a CLI client (libcoap, aiocoap, coap-cli) instead. [GitHub](https://github.com/mkovatsc/Copper/issues/29)

Politics/alternatives that didn't win: an early competing approach was simply HTTP-over-UDP plus header compression. The CoRE WG explicitly rejected "blindly compress HTTP" in favor of a clean re-design preserving REST semantics but slimming the wire format, with sub-100-byte messages possible (RFC 7252 §1) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). MQTT, designed at IBM in 1999, is the perpetual rival; the CoRE WG's answer to MQTT-style brokers is `draft-ietf-core-coap-pubsub` (still a draft in 2026). [Studocu](https://www.studocu.com/in/document/coimbatore-institute-of-technology/embedded-system-and-iot/rfc-7252-the-constrained-application-protocol-coap-overview/160421863)

## 3. How it actually works

### 3.1 Wire format

A CoAP message is a 4-byte fixed header, then 0–8 bytes of Token, zero or more Options (delta-encoded TLVs), an optional 0xFF marker, and a payload ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)): [Tech Invite](https://www.tech-invite.com/y70/tinv-ietf-rfc-7252-2.html)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Ver| T |  TKL  |      Code     |          Message ID           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Token (0–8 bytes, length given by TKL)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Options (zero or more, TLV with delta-encoded numbers)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|1 1 1 1 1 1 1 1|   Payload (rest of UDP datagram)              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Field by field (bit widths and meaning, per RFC 7252 §3) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)):

- **Ver (2 bits)**: must be `01`. Other values silently ignored. [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **T (2 bits)**: type — 00 = Confirmable (CON), 01 = Non-confirmable (NON), 10 = Acknowledgement (ACK), 11 = Reset (RST). [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **TKL (4 bits)**: token length 0–8 in base spec; values 9–15 are a "message format error." RFC 8974 extends tokens via reserved encoding for stateless proxies. [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **Code (8 bits)**: split as 3-bit class . 5-bit detail, written `c.dd`. Class 0 = request (0.01 GET, 0.02 POST, 0.03 PUT, 0.04 DELETE; 0.05 FETCH and 0.06/0.07 PATCH/iPATCH from RFC 8132); class 2 = Success (e.g., 2.05 Content); class 4 = Client Error (4.04 Not Found); class 5 = Server Error (5.03 Service Unavailable). Code 0.00 marks an Empty message. [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **Message ID (16 bits)**: deduplication and CON/ACK matching. [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)
- **Token (TKL bytes)**: client-generated, opaque to server, used to match a response to its request even if message IDs differ (e.g., separate response). [Nordic Semiconductor](https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-5-cellular-fundamentals/topic/lesson-5-coap-protocol/)
- **Options**: TLV-style with **delta encoding** — each option's number is the previous option's number plus its delta. Delta and length use a compact 4-bit encoding with 13/14 escape values pointing to 1- or 2-byte extensions. Options are **critical** if their option number is odd (must be understood or message rejected) and **elective** if even. Common options: Uri-Host (3), Uri-Port (7), Uri-Path (11, repeatable), Content-Format (12), Max-Age (14), Uri-Query (15), Accept (17), Block2 (23), Block1 (27), Observe (6), Proxy-Uri (35), Proxy-Scheme (39), Size1 (60). The full set is documented in the IANA CoAP Option Numbers registry ([https://www.iana.org/assignments/core-parameters/core-parameters.xhtml](https://www.iana.org/assignments/core-parameters/core-parameters.xhtml)). [ResearchGate](https://www.researchgate.net/figure/CoAP-message-format-consisting-of-a-4-byte-base-binary-header-followed-by-optional_fig1_257877940)
- **Payload Marker 0xFF**: present only if there is a payload. [Tech Invite](https://www.tech-invite.com/y70/tinv-ietf-rfc-7252-2.html)
- **Payload**: rest of the UDP datagram.

The smallest legal CoAP message is 4 bytes (Empty). A real GET typically sits at 10–20 bytes — a key reason CoAP is viable on 6LoWPAN, where IPv6 packets get fragmented into ~80-byte 802.15.4 frames ([https://www.rfc-editor.org/rfc/rfc4944](https://www.rfc-editor.org/rfc/rfc4944)).

### 3.2 Messaging model and state machine

CoAP has two layers in one protocol: a **messaging layer** (CON/NON/ACK/RST, dedup, retransmit) and a **request/response layer** (Token-matched semantics across messages) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).

A CON message must be ACKed. If no ACK arrives by **ACK_TIMEOUT × ACK_RANDOM_FACTOR** (default 2 s × 1.5 = 2–3 s) the sender retransmits, doubling the timeout each round, up to **MAX_RETRANSMIT** (default 4) — i.e., five total transmissions over ~45 s before giving up with a NACK to the application ([https://datatracker.ietf.org/doc/html/rfc7252](https://datatracker.ietf.org/doc/html/rfc7252); [https://libcoap.net/doc/reference/4.3.5/group__cc.html](https://libcoap.net/doc/reference/4.3.5/group__cc.html)). Other defaults: **NSTART=1** (one outstanding CON per endpoint), **DEFAULT_LEISURE=5 s**, **PROBING_RATE=1 byte/s**. [Libcoap + 3](https://libcoap.net/doc/reference/4.3.5/group__cc.html)

Three response patterns exist:

- **Piggybacked** — server includes the response inside the ACK (one round trip).
- **Separate** — server ACKs immediately (Empty ACK), sends the response later as its own CON.
- **Non-confirmable** — fire-and-forget request and/or response.

### 3.3 Sequence diagram (Mermaid)

CoAP ServerCoAP ClientCoAP ServerCoAP Client#mermaid-rj6{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rj6 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rj6 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rj6 .error-icon{fill:#CC785C;}#mermaid-rj6 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rj6 .edge-thickness-normal{stroke-width:1px;}#mermaid-rj6 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rj6 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rj6 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rj6 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rj6 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rj6 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rj6 .marker.cross{stroke:#A1A1A1;}#mermaid-rj6 svg{font-family:inherit;font-size:16px;}#mermaid-rj6 p{margin:0;}#mermaid-rj6 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rj6 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rj6 .actor-line{stroke:#A1A1A1;}#mermaid-rj6 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rj6 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rj6 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rj6 .sequenceNumber{fill:#5e5e5e;}#mermaid-rj6 #sequencenumber{fill:#E5E5E5;}#mermaid-rj6 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rj6 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rj6 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rj6 .labelText,#mermaid-rj6 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rj6 .loopText,#mermaid-rj6 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rj6 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rj6 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rj6 .noteText,#mermaid-rj6 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rj6 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rj6 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rj6 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rj6 .actorPopupMenu{position:absolute;}#mermaid-rj6 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rj6 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rj6 .actor-man circle,#mermaid-rj6 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rj6 :root{--mermaid-font-family:inherit;}Piggybacked GET on /sensors/tempSeparate response (slow sensor)... measurement runs ...Observe (RFC 7641)CON [MID=0x7d34, Token=0xb1, GET,Uri-Path=sensors, Uri-Path=temp]ACK [MID=0x7d34, Token=0xb1, 2.05 Content,Content-Format=text/plain, Payload="22.7"]CON [MID=0x7d35, Token=0xb2, GET /slow]ACK [MID=0x7d35, Empty]CON [MID=0xa201, Token=0xb2, 2.05 Content]ACK [MID=0xa201, Empty]CON [Token=0xc0, GET /temp, Observe=0]ACK [Token=0xc0, 2.05, Observe=42, "22.7"]NON [Token=0xc0, 2.05, Observe=43, "22.9"]CON [Token=0xc0, 2.05, Observe=51, "23.4"]ACKCON [Token=0xc0, GET /temp, Observe=1]   %% deregister

### 3.4 On-the-wire byte sequence (illustrative)

A minimal `GET coap://[::1]/temp` confirmable request, Token=0x7B, MID=0x1234, looks (hex) like:

`40 01 12 34 7b b4 74 65 6d 70`

Decoded: `40` = Ver 01, T=00 (CON), TKL=0; `01` = Code 0.01 (GET); `12 34` = MID; (no token because TKL=0 — keeping example minimal; with TKL=1 and Token 0x7B it would be `41 01 12 34 7b ...`); `b4` = option delta 11 (Uri-Path), length 4; `74 65 6d 70` = "temp" in ASCII ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).

### 3.5 Security model

CoAP defines four security modes (RFC 7252 §9): **NoSec**, **PreSharedKey**, **RawPublicKey**, and **Certificate** — all built on **DTLS** (UDP), or TLS for CoAP-over-TCP. DTLS adds a handshake (typically 6 flights, ~800 bytes for ECC-cert mode) before the first CoAP byte ([https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)).

**OSCORE (RFC 8613)** wraps the CoAP payload (and selected options) in a COSE_Encrypt0 AEAD object using AES-CCM-16-64-128 by default, leaving Uri-Host/Port and proxy-related options visible so caches and proxies still work; the inner CoAP code, options and payload are encrypted+integrity-protected end-to-end, even across CoAP-to-HTTP proxies ([https://www.rfc-editor.org/rfc/rfc8613.html](https://www.rfc-editor.org/rfc/rfc8613.html)). OSCORE replaces classical TLS handshake establishment with externally provisioned keys or with **EDHOC (RFC 9528)**, a 3-message DH exchange whose total handshake bytes are ~100–200 (vs DTLS 1.3's ~700+) ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html)). [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC8613)

### 3.6 Error handling and edge cases

- **Duplicates**: Receiver caches MID for `EXCHANGE_LIFETIME` (~247 s) and replays the cached ACK on a re-received CON.
- **Unrecognised critical option**: Server returns 4.02 Bad Option; client doing the same returns 4.02 or RST.
- **Fragmentation in 6LoWPAN**: Avoid; use Block1/Block2 instead. Block size negotiated via SZX field (16, 32, 64…1024 bytes).
- **Multicast**: Server delays response by uniformly random interval ≤ DEFAULT_LEISURE; multicast requests must be NON.
- **Mismatched Token but matching MID**: ACK still consumes MID; response is treated as "unmatched" and may produce RST.
- **OSCORE replay**: each request carries a Sequence Number in the Partial IV; server keeps a sliding replay window per Recipient Context ([https://www.rfc-editor.org/rfc/rfc8613.html](https://www.rfc-editor.org/rfc/rfc8613.html)).

## 4. Deep connections to other protocols

- **UDP** — CoAP's default transport. UDP gives CoAP its tiny per-packet overhead (8-byte UDP header), no connection state, and the ability to use IP multicast — but no reliability or ordering, which is why CoAP rebuilds those (CON/ACK, MID dedup) at the application layer ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)).
- **TCP / TLS / WebSockets** — RFC 8323 defines CoAP over TCP, TLS, and WebSockets. Used for cloud-to-device tunneling, NAT traversal, and proxies; framing changes (length prefix replaces UDP boundary), and CON/ACK semantics are stripped because TCP is already reliable ([https://www.rfc-editor.org/rfc/rfc8323](https://www.rfc-editor.org/rfc/rfc8323)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/)
- **DTLS (RFC 6347 / RFC 9147)** — The canonical security binding for CoAP over UDP. It runs *below* CoAP (CoAP messages become DTLS application_data records). Trade-off: handshake is heavy for very constrained devices and stateful at NAT boxes.
- **TLS 1.3 (RFC 8446)** — Used under CoAP-over-TCP/WebSockets ([https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)).
- **OSCORE (RFC 8613)** — Application-layer alternative/complement to DTLS. Sits *between* CoAP and the transport, but really wraps the CoAP message; survives CoAP/HTTP cross-proxying; updates RFC 7252 ([https://www.rfc-editor.org/rfc/rfc8613](https://www.rfc-editor.org/rfc/rfc8613)). [ACM Digital Library](https://dl.acm.org/doi/10.1145/3523064)[ACM Digital Library](https://dl.acm.org/doi/10.1145/3523064)
- **EDHOC (RFC 9528)** — Lightweight authenticated key exchange that produces an OSCORE Security Context. Uses CoAP as transport (typically POSTed to `/.well-known/edhoc`) and CBOR/COSE for crypto envelopes ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html)). [Core-wg](https://core-wg.github.io/oscore-edhoc/draft-ietf-core-oscore-edhoc.html)
- **CBOR (RFC 8949)** — The dominant payload encoding for CoAP-based stacks (LwM2M, OSCORE inner messages, EDHOC, SenML/CBOR). Compact, schema-less, JSON-isomorphic ([https://www.rfc-editor.org/rfc/rfc8949](https://www.rfc-editor.org/rfc/rfc8949)). [Wikipedia](https://en.wikipedia.org/wiki/CBOR)
- **COSE (RFC 9052)** — The CBOR-based crypto object format OSCORE and EDHOC sit on ([https://www.rfc-editor.org/rfc/rfc9052](https://www.rfc-editor.org/rfc/rfc9052)).
- **HTTP** — RFC 7252 specifies a stateless HTTP↔CoAP mapping; this is *the* design DNA — CoAP self-consciously imitates HTTP/REST so that proxies can bridge them. Methods, status codes, media types, URIs, caching all mirror HTTP ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)[IETF](https://datatracker.ietf.org/doc/html/rfc7252)
- **MQTT** — Pub/sub rival, runs over TCP, broker-centric. CoAP is request/response with optional Observe; for true broker pub/sub the CoRE WG is finalising `draft-ietf-core-coap-pubsub`. MQTT-SN is the constrained variant of MQTT and competes head-on with CoAP in cellular/LPWAN niches ([https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)).
- **LwM2M (Open Mobile Alliance / OMA SpecWorks)** — *The* major IoT device-management protocol layered on CoAP. LwM2M 1.0 (Feb 2017), 1.1 (Jun 2018, added TCP, 3GPP CIoT, LoRaWAN), 1.2 (Nov 2020, added MQTT and HTTP transports), **1.2.2 (June 2024, bug-fix/interop)**; **2.0 in development as of late 2025** ([https://en.wikipedia.org/wiki/OMA_LWM2M](https://en.wikipedia.org/wiki/OMA_LWM2M)). It uses CoAP for the wire protocol, DTLS or OSCORE for security, and SenML/CBOR for data. [Wikipedia + 5](https://en.wikipedia.org/wiki/OMA_LWM2M)
- **6LoWPAN (RFC 4944, 6282)** — IPv6 adaptation for IEEE 802.15.4. CoAP was *built for* 6LoWPAN's tiny MTU and lossy links; the design explicit goal was "keep message overhead small, thus limiting the need for fragmentation" (RFC 7252 §1) ([https://www.rfc-editor.org/rfc/rfc4944](https://www.rfc-editor.org/rfc/rfc4944)). [Studocu](https://www.studocu.com/in/document/coimbatore-institute-of-technology/embedded-system-and-iot/rfc-7252-the-constrained-application-protocol-coap-overview/160421863)
- **Thread / Matter** — Thread is a 6LoWPAN-based IPv6 mesh (Thread Group). Matter (Connectivity Standards Alliance, formerly Project CHIP) defines a smart-home application layer on IPv6/UDP. Despite folk wisdom, Matter does **not** use CoAP for its main payloads — it defines its own Message Reliability Protocol (MRP) on UDP port 5540, plus TCP, plus BTP for commissioning ([https://i.blackhat.com/EU-24/Presentations/EU-24-Genge-BreakingMatterVulnerabiltiesInTheMatterProtocol-wp.pdf](https://i.blackhat.com/EU-24/Presentations/EU-24-Genge-BreakingMatterVulnerabiltiesInTheMatterProtocol-wp.pdf); [https://docs.silabs.com/matter/latest/matter-fundamentals-introduction/](https://docs.silabs.com/matter/latest/matter-fundamentals-introduction/)). CoAP plays a role inside the Thread *network management* stack (the Thread Management Framework uses CoAP-over-DTLS, which is why Wireshark has a "CoAP-TMF" dissector variant) ([https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)). Older blog posts that say "Thread uses CoAP" are imprecise — Thread management uses CoAP; Matter itself does not. [Silabs](https://pages.silabs.com/rs/634-SLU-379/images/Matter-Connectivity-Standard-FAQ-V2.pdf)[GitHub](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)
- **QUIC** — As of May 2026 there is no CoRE WG document mapping CoAP onto QUIC. Academic work has explored proxy-based CoAP-over-QUIC (Park et al., ICT Express 2023 — reported ~80% RTT reduction in their testbed) ([https://www.sciencedirect.com/science/article/pii/S2542660523002287](https://www.sciencedirect.com/science/article/pii/S2542660523002287)). The CoRE WG instead doubled down on DTLS 1.3 and on CoAP-over-TCP/WebSockets; the 2025 CoAP-PM draft explicitly notes QUIC's flow-measurement bits as inspiration but doesn't propose a QUIC binding ([https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-pm-04](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-pm-04)). [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2542660523002287)[IETF](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pm/)
- **DNS** — `draft-ietf-core-dns-over-coap` (DoC, revision -20, 2025) provides DNS query transport over CoAPS/OSCORE for constrained devices, akin to DoH but for IoT ([https://datatracker.ietf.org/doc/html/draft-ietf-core-dns-over-coap-20](https://datatracker.ietf.org/doc/html/draft-ietf-core-dns-over-coap-20)). [IETF](https://datatracker.ietf.org/doc/html/draft-lenders-dns-over-coap-03.html)
- **CoRE Link Format (RFC 6690)** — CoAP's discovery side-car: a Link header serialization at `/.well-known/core` ([https://www.rfc-editor.org/rfc/rfc6690](https://www.rfc-editor.org/rfc/rfc6690)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-core-link-format-01)
- **OCF (Open Connectivity Foundation)** — formerly OIC; uses CoAP as its base transport for IoTivity ([https://openconnectivity.org/](https://openconnectivity.org/)).
- **SenML (RFC 8428)** — Sensor Measurement Lists; the standard data format used over CoAP for telemetry ([https://www.rfc-editor.org/rfc/rfc8428](https://www.rfc-editor.org/rfc/rfc8428)).

## 5. Real-world deployment

**Major implementations:**

- **libcoap** (C, BSD-licensed, maintained by Olaf Bergmann) — the de facto reference; ports to Contiki, RIOT, Zephyr, FreeRTOS, ESP-IDF; supports DTLS via OpenSSL/GnuTLS/MbedTLS/wolfSSL/tinyDTLS; OSCORE since 4.3.x ([https://libcoap.net/](https://libcoap.net/)).
- **Eclipse Californium (Cf)** — Java; the production-grade server side. Eclipse Foundation report: "extremely scalable architecture and outperforms high-performance HTTP servers… can handle millions of IoT devices with a single service instance" ([https://eclipse.dev/californium/](https://eclipse.dev/californium/)). Version 4.0.0-M3 (2025) added Java 21 virtual-threads support, raising emulated-client capacity from "5 000–10 000" to "30 000–40 000" per process ([https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3](https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3)). Note: that's a vendor figure for emulated clients, not a measured production benchmark. [Eclipse Foundation](https://eclipse.dev/californium/)[Eclipse](https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3)
- **Eclipse Leshan** — Java LwM2M server/client built on Californium; widely used for cellular-IoT device management. Public sandbox at [https://leshan.eclipseprojects.io/](https://leshan.eclipseprojects.io/) ([https://eclipse.dev/leshan/](https://eclipse.dev/leshan/)). [Eclipse](https://projects.eclipse.org/projects/iot.leshan)[GitHub](https://github.com/eclipse-leshan/leshan)
- **Eclipse Wakaama** — C LwM2M client (used by RIOT-OS) ([https://github.com/eclipse/wakaama](https://github.com/eclipse/wakaama)). [FIT IoT-LAB](https://iot-lab.github.io/docs/tools/leshan-broker/)
- **aiocoap** — Python 3 / asyncio; maintained by Christian Amsüss. Supports RFC 7252, 7641, 7959, 8132, 8323 (TCP/TLS), partial 8613 (OSCORE) ([https://aiocoap.readthedocs.io/en/latest/](https://aiocoap.readthedocs.io/en/latest/)). [GitHub](https://github.com/KaSroka/aiocoap)
- **node-coap** — JavaScript/Node.js ([https://github.com/coapjs/node-coap](https://github.com/coapjs/node-coap)).
- **CoAPthon3** — Python ([https://github.com/Tanganelli/CoAPthon3](https://github.com/Tanganelli/CoAPthon3)).
- **microcoap, nanocoap (RIOT-OS), Zephyr CoAP** — embedded.
- **Go-CoAP** ([https://github.com/plgd-dev/go-coap](https://github.com/plgd-dev/go-coap)), **CoAP.NET** — others.

**Public test/reference servers** include `coap://coap.me`, `coap://californium.eclipseprojects.io`, and the Leshan sandbox ([https://coap.me/](https://coap.me/); [https://eclipse.dev/californium/](https://eclipse.dev/californium/)).

**Production users at scale** (qualitative — published benchmarks of operational CoAP fleets are scarce):

- **Cellular IoT (NB-IoT, LTE-M)**: most carrier IoT platforms (Vodafone, Telefónica, AT&T, T-Mobile, Verizon, Telenor, KPN) expose LwM2M-over-CoAP/DTLS as the canonical device-management interface. ARM (Pelion → Izuma Networks), Nokia IMPACT, Ericsson IoT Accelerator, Huawei OceanConnect, AVSystem Coiote, IoTerop are commercial servers built on this stack ([https://www.openmobilealliance.org/](https://www.openmobilealliance.org/)).
- **Thread / smart home**: Thread Management Framework uses CoAP for commissioning/management; Wireshark has a dedicated CoAP-TMF dissector ([https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)).
- **NETSCOUT scan, January 2019**: 388 344 publicly-reachable CoAP endpoints, of which 81 % were in China and most ran QLC Chain peer-to-peer software on mobile handsets — i.e., much of the "CoAP at scale" that Internet scanners see is *not* IoT ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)). Shadowserver (Jun 2020) found a similar ~93 % concentration in Philippines/China/Russia ([https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/](https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/)). [NETSCOUT + 4](https://www.netscout.com/blog/asert/coap-attacks-wild)

**Performance characteristics with published numbers:**

- Per RFC 7252, header overhead is 4 bytes vs HTTP's hundreds of bytes; smallest message is 4 bytes total. Constrained networks targeted: 8-bit MCUs, 10s kbit/s links ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [IETF](https://datatracker.ietf.org/doc/html/rfc7252)[ACM Digital Library](https://dl.acm.org/doi/abs/10.17487/rfc7252)
- Kovatsch/Lanter/Shelby, *IoT 2014*, "Scalable Cloud Services for the IoT" — Californium reported throughput on commodity hardware in the **hundreds of thousands of CoAP requests per second** range, meaningfully outperforming HTTP servers because of the smaller per-request work ([https://www.slideshare.net/jvermillard/hands-on-with-coap-36793005](https://www.slideshare.net/jvermillard/hands-on-with-coap-36793005)).
- Anjay/AVSystem report typical LwM2M-over-CoAP/DTLS register-update payloads in the ~50–150 byte range over NB-IoT, allowing multi-year battery operation ([https://avsystem.github.io/Anjay-doc/LwM2M.html](https://avsystem.github.io/Anjay-doc/LwM2M.html)).
- Sensors 2019 (Suwannapong/Khunboa) measured default CoAP RTT on Cooja/Contiki at hundreds of ms with default ACK_TIMEOUT=2 s providing slack for lossy links ([https://www.mdpi.com/1424-8220/19/15/3433](https://www.mdpi.com/1424-8220/19/15/3433)).
- Group OSCORE benchmarking on Zolertia Zoul / TI SimpleLink (Tiloca et al., ACM TIoT 2022) showed handshake overhead dominated by signature ops but per-message group overhead in the tens of µs CPU and ~30–60 bytes wire ([https://dl.acm.org/doi/10.1145/3523064](https://dl.acm.org/doi/10.1145/3523064)). [ACM Digital Library](https://dl.acm.org/doi/10.1145/3523064)

## 6. Failure modes and famous incidents

- **CoAP reflection/amplification DDoS, January–March 2019** — ASERT/NETSCOUT documented a wave of attacks abusing internet-reachable CoAP endpoints. **Average amplification factor 34×** (21-byte `GET /.well-known/core` → ~720-byte response), **388 344 reflectors found, 81 % in China**, attacks averaging ~90 seconds and ~100 packets/s per attacker ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)). The FBI issued a Private Industry Notification later that year warning of CoAP and ARMS amplification ([https://duo.com/decipher/fbi-warns-of-ddos-attacks-abusing-network-protocols](https://duo.com/decipher/fbi-warns-of-ddos-attacks-abusing-network-protocols)). Note: the often-cited "3 300×" figure is **not** for CoAP — that's the memcached/UDP record from Feb 2018. CoAP's measured factor is 34×, "middle of the pack" per NETSCOUT. [Ttcsirt + 7](https://ttcsirt.gov.tt/attackers-use-coap-for-ddos-amplification/)
- **Continued CoAP weaponization 2020–2025**: Shadowserver June 2020 scan found many endpoints leaking Wi-Fi credentials and accepting remote control commands ([https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/](https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/)). A10 Networks 2024 DDoS Weapons Report: CoAP ≈ 4 % of global amplification weapons across 155 countries, concentrated in China/Russia/Philippines ([https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf](https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf)). A 2024 IMC paper ("The Age of DDoScovery", Hiesgen et al.) places CoAP among recurring reflection vectors academic and industry telemetry agree on ([https://arxiv.org/pdf/2410.11708](https://arxiv.org/pdf/2410.11708)). [Shadowserver Foundation](https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/)[A10 Networks](https://www.a10networks.com/blog/ddos-threat-map-shows-global-distribution-of-top-amplifier-weapons-and-bots/)
- **CVE-2019-9004** — Eclipse Wakaama 1.0 LwM2M server: malformed CoAP option leaks 24 bytes of memory per crafted packet → eventual OOM ([https://nvd.nist.gov/vuln/detail/CVE-2019-9004](https://nvd.nist.gov/vuln/detail/CVE-2019-9004)). [Feedly](https://feedly.com/cve/CVE-2019-9004)
- **CVE-2020-12887** — Arm Mbed OS 5.15.3 / mbed-coap 5.1.5: integer overflow in `sn_coap_parser_options_parse()` lets an attacker cause double-allocation memory leaks in URI-Path/Uri-Query/Location-Query/ETag handling ([https://www.cvedetails.com/cve/CVE-2020-12887/](https://www.cvedetails.com/cve/CVE-2020-12887/)). [CVE Details](https://www.cvedetails.com/cve/CVE-2020-12887/)
- **CVE-2024-0962** — libcoap 4.3.4 OSCORE configuration parser: stack-based buffer overflow in `get_split_entry()` in `coap_oscore.c` — remotely exploitable, patched ([https://www.tenable.com/cve/CVE-2024-0962](https://www.tenable.com/cve/CVE-2024-0962)). [Tenable](https://www.tenable.com/cve/CVE-2024-0962)[CVE Details](https://www.cvedetails.com/cve/CVE-2024-0962/)
- **CVE-2024-31031** — libcoap unsigned-integer overflow in `coap_pdu.c` ([https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2024-31031](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2024-31031)).
- **CVE-2026-29013** — libcoap OSCORE Appendix-B.2 CBOR unwrap: `get_byte_inc()` in `src/oscore/oscore_cbor.c` relies on `assert()` for bounds, which is compiled out under `NDEBUG`. Crafted CoAP requests with malformed OSCORE options yield out-of-bounds reads and a possible heap overflow via integer wraparound. Disclosed 17 April 2026; CVSS 4.0 score 8.8 (HIGH); as of early May 2026 no patched release for some distros ([https://cve.threatint.eu/CVE/CVE-2026-29013](https://cve.threatint.eu/CVE/CVE-2026-29013); [https://www.tenable.com/plugins/nessus/307473](https://www.tenable.com/plugins/nessus/307473)). [CVE + 3](https://cve.threatint.eu/CVE/CVE-2026-29013)
- **2025 CoAP under-attack dataset** — Aveleira-Mata et al. (Data in Brief, Oct 2025) published CoAP_UAD, a benchmark dataset capturing protocol-level attacks against CoAP services, useful for IDS training ([https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/)). [nih](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/)
- **Common production pitfalls**:
  - Leaving CoAP open on the public Internet (NETSCOUT, Shadowserver). Any server reachable from the Internet on UDP/5683 with no DTLS is a reflector.
    - Running NoSec mode in production "for now."
    - Unsynchronised retransmit parameters between client and server (RFC 7252 explicitly recommends consistent values).
    - Forgetting that NAT bindings on UDP expire fast (often <60 s); device push from cloud requires the device to keep-alive or use CoAP-over-TCP/WebSockets (RFC 8323 motivations).
    - Block-Wise Transfer with `Block2/Block1` size larger than path MTU after DTLS expansion → silent fragmentation drops on 6LoWPAN.

## 7. Fun facts and anecdotes

- **The "blame Mozilla" line.** Matthias Kovatsch's Copper (Cu) Firefox add-on was, for years, the way to demo CoAP — you'd type `coap://californium.eclipse.org/` in the URL bar like it was HTTP. When Firefox 57 (Nov 2017) cut XUL extensions, Kovatsch wrote on the Copper issue tracker: *"WebExtensions do not allow for custom protocol handlers. In some sense, Mozilla killed Copper."* ([https://github.com/mkovatsc/Copper/issues/29](https://github.com/mkovatsc/Copper/issues/29)). The Chrome successor Copper4Cr was caught by Google's deprecation of Chrome Apps shortly after. [GitHub](https://github.com/mkovatsc/Copper)[GitHub](https://github.com/mkovatsc/Copper/issues/29)
- **Smaller than a TCP handshake.** A complete CoAP CON request + ACK round trip can be **smaller than the SYN of a TCP handshake**. Carsten Bormann liked to point out the smallest CoAP message is 4 bytes, while a single TCP segment header is already 20 ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **Bormann's prolific RFC count.** Carsten Bormann (Universität Bremen TZI) is co-author or editor of more than 30 RFCs touching CoAP/CoRE, CBOR, CDDL, 6LoWPAN, JSONPath, and more — including, in the last 24 months, RFC 9423 (Target Attributes), RFC 9535 (JSONPath), RFC 9557 (timestamps), RFC 9741 (CDDL controls), and the in-progress `draft-ietf-core-corr-clar` errata umbrella ([https://dblp.org/pid/65/5539.html](https://dblp.org/pid/65/5539.html)). [dblp](https://dblp.org/pid/65/5539.html)
- **Sensinode → ARM → Edge Impulse.** Zach Shelby co-founded Sensinode in Oulu, drove early CoAP code, sold the company to ARM in 2013 — at which point CoAP went from "academic spec" to "ARM IoT marketing centerpiece" practically overnight ([https://www.computerworld.com/article/1508299/arm-acquires-sensinode-a-maker-of-software-for-internet-of-things.html](https://www.computerworld.com/article/1508299/arm-acquires-sensinode-a-maker-of-software-for-internet-of-things.html)). Shelby later co-founded the BBC Micro:bit Foundation and is now CEO of Edge Impulse. [Kisaco Research](https://www.kisacoresearch.com/content/zach-shelby)[Kisaco Research](https://www.kisacoresearch.com/content/zach-shelby)
- **The QLC Chain surprise.** When NETSCOUT actually mapped the world's CoAP endpoints in 2019, *most of them weren't IoT devices at all* — they were Chinese mobile phones running the QLC Chain peer-to-peer cryptocurrency stack. CoAP's most-deployed-at-scale use case for years was, embarrassingly, "P2P crypto on smartphones" rather than the smart-buildings vision the protocol was designed for ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)). [Ttcsirt](https://ttcsirt.gov.tt/attackers-use-coap-for-ddos-amplification/)[NETSCOUT](https://www.netscout.com/blog/asert/coap-attacks-wild)
- **0xFF as marker, deliberately.** 0xFF was chosen as the payload marker because it cannot validly appear as the first byte of an option (option length 15 is reserved as a format error), giving parsers a single-byte unambiguous separator (RFC 7252 §3.1) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **Critical-or-elective by parity bit.** Whether a CoAP option is critical or elective is encoded in the *parity* of its option number (odd = critical). It costs zero header bits — the cleverest economy in the spec (RFC 7252 §5.4.1) ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).
- **EDHOC's 100-byte handshake.** RFC 9528 (March 2024) brings full mutual authentication + forward secrecy in three messages totalling ~100 bytes for static-DH credentials — versus a DTLS 1.3 ECC handshake at ~700+ bytes. For a battery-powered device sending one packet a day, that difference can mean *years* of life ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html)). [IETF](https://datatracker.ietf.org/doc/rfc9528/)

## 8. Practical wisdom

**Defaults to be skeptical of (RFC 7252 §4.8):**

- `ACK_TIMEOUT` (2 s) and `ACK_RANDOM_FACTOR` (1.5) — too short for satellite, NB-IoT idle-mode wakeup, or cell-edge LTE-M (which can have RTTs of 5–15 s). Tune *up*, but ensure both peers agree.
- `MAX_RETRANSMIT` (4) → 5 transmissions over ~45 s — usually fine, but for sleepy devices on duty-cycled radios the entire retransmit budget can fall inside one DRX gap.
- `NSTART` (1) — extremely conservative; if your application has independent flows, raising NSTART is safe over good links but interacts badly with naive congestion control (consider CoCoA — `draft-ietf-core-cocoa`) ([https://core-wg.github.io/cocoa/draft-ietf-core-cocoa.html](https://core-wg.github.io/cocoa/draft-ietf-core-cocoa.html)).
- `DEFAULT_LEISURE` (5 s) — applies to multicast responders; check that your device clock skew + listener counts don't collapse responses into a thundering herd.
- DTLS session resumption / DTLS 1.2 Connection ID (RFC 9146) — without these, every NAT-induced port change forces a full handshake; a sleepy NB-IoT modem can be DTLS-rebinding every wake.

**What to monitor in production:**

- CON retransmit count per device (early indicator of radio degradation).
- 4.xx vs 5.xx response distribution; 5.03 Service Unavailable spikes often signal NSTART contention.
- DTLS handshake failure rate and average bytes per handshake (resumption working?).
- Block-Wise Transfer abandoned downloads (4.08 Request Entity Incomplete).
- For OSCORE: replay-window drops and Sequence Number wraparound (per RFC 8613, you *must* re-key before SN exhausts).
- NAT binding age vs. observed device push success (the canonical CoAP-over-UDP NAT smell).

**Production trace tells (Wireshark filters):**

- `coap` — show all CoAP. `coap.code == 0.01` — only GETs.
- `coap.token` — track a request through retransmits and Observe notifications.
- `dtls` next to `coap` — handshake bytes vs. payload bytes ratio.
- `coap.opt.observe` — Observe registrations/notifications.
- The CoAP dissector ships with Wireshark mainline (file `epan/dissectors/packet-coap.c`); a separate "CoAP-TMF" registration handles Thread management framing ([https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)). [GitHub](https://github.com/wireshark/wireshark/blob/master/epan/dissectors/packet-coap.c)

**Common debugging moves:**

- Reproduce against `coap://coap.me` or the Leshan sandbox to isolate client vs. server bugs.
- Use `aiocoap-client coap://[::1]/.well-known/core` to confirm discovery before higher-level testing.
- For DTLS issues, capture with `SSLKEYLOGFILE` (Californium 4.0.0-M3 supports `draft-ietf-tls-keylogfile`) and decrypt in Wireshark ([https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3](https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3)). [Eclipse](https://projects.eclipse.org/projects/iot.californium/releases/4.0.0-m3)
- Run libcoap's `coap-client -m get -B 30 coap://...` with `-v 9` for verbose option dump.

**Common misconfigurations:**

- DTLS PSK identity hint mismatch.
- Server expecting Uri-Host option but client setting only Uri-Path (some proxies require both).
- Forgetting that Block1 is for *request* payload (PUT/POST) and Block2 for *response* — switching them silently breaks transfers.
- Using a non-randomized Token (RFC 7252 §5.3.1 stresses tokens should be unguessable as a basic anti-spoofing measure).

## 9. Learning resources (current as of 2026)

**Authoritative specs (IETF):**

- **RFC 7252** — base CoAP. Read §3 (message format), §4 (messaging model), §5 (request/response), §9 (security). 2014 ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). Intermediate.
- **RFC 6690** — CoRE Link Format / `/.well-known/core`. 2012 ([https://www.rfc-editor.org/rfc/rfc6690](https://www.rfc-editor.org/rfc/rfc6690)). Intro. [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc6690.html)
- **RFC 7641** — Observe. 2015 ([https://www.rfc-editor.org/rfc/rfc7641](https://www.rfc-editor.org/rfc/rfc7641)). Intermediate.
- **RFC 7959** — Block-Wise Transfers. 2016 ([https://www.rfc-editor.org/rfc/rfc7959](https://www.rfc-editor.org/rfc/rfc7959)). Intermediate.
- **RFC 8132** — PATCH/FETCH. 2017 ([https://www.rfc-editor.org/rfc/rfc8132](https://www.rfc-editor.org/rfc/rfc8132)).
- **RFC 8323** — CoAP over TCP/TLS/WebSockets. 2018 ([https://www.rfc-editor.org/rfc/rfc8323](https://www.rfc-editor.org/rfc/rfc8323)).
- **RFC 8428** — SenML. 2018 ([https://www.rfc-editor.org/rfc/rfc8428](https://www.rfc-editor.org/rfc/rfc8428)).
- **RFC 8613** — OSCORE. Read §2 (option), §3 (security context), §11 (HTTP mapping). 2019 ([https://www.rfc-editor.org/rfc/rfc8613](https://www.rfc-editor.org/rfc/rfc8613)). Advanced.
- **RFC 8949** — CBOR (STD 94). 2020 ([https://www.rfc-editor.org/rfc/rfc8949](https://www.rfc-editor.org/rfc/rfc8949)). Intro/intermediate.
- **RFC 8974** — Extended Tokens / Stateless Clients. 2021 ([https://datatracker.ietf.org/doc/html/rfc8974](https://datatracker.ietf.org/doc/html/rfc8974)).
- **RFC 9052** — COSE Structures. 2022 ([https://www.rfc-editor.org/rfc/rfc9052](https://www.rfc-editor.org/rfc/rfc9052)).
- **RFC 9147** — DTLS 1.3. 2022 ([https://www.rfc-editor.org/rfc/rfc9147](https://www.rfc-editor.org/rfc/rfc9147)).
- **RFC 9175** — Echo, Request-Tag. 2022.
- **RFC 9177** — Q-Block1/Q-Block2 robust block-wise. 2022.
- **RFC 9290** — CoAP Problem Details. 2022 ([https://www.rfc-editor.org/rfc/rfc9290](https://www.rfc-editor.org/rfc/rfc9290)).
- **RFC 9423** — CoRE Target Attributes Registry. April 2024 ([https://www.rfc-editor.org/rfc/rfc9423](https://www.rfc-editor.org/rfc/rfc9423)). New.
- **RFC 9528** — EDHOC. March 2024 ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html)). Advanced.
- **RFC 9529** — EDHOC test vectors. March 2024 ([https://datatracker.ietf.org/doc/rfc9529/](https://datatracker.ietf.org/doc/rfc9529/)). [IETF](https://datatracker.ietf.org/doc/rfc9529/)
- **RFC 9594** — ACE key provisioning for groups. September 2024 ([https://www.ietf.org/rfc/rfc9594.html](https://www.ietf.org/rfc/rfc9594.html)). Advanced.
- **Active drafts** — `draft-ietf-core-corr-clar` (errata umbrella, -04 Dec 2025), `draft-ietf-core-coap-pubsub` (-19 Mar 2026), `draft-ietf-core-oscore-groupcomm` (-28 Dec 2025), `draft-ietf-core-dns-over-coap` (-20 2025), `draft-ietf-core-coap-pm` (-05 Oct 2025), `draft-ietf-core-coap-dtls-alpn` (-01 2025), `draft-ietf-core-fasor`, `draft-ietf-core-cocoa` ([https://core-wg.github.io/](https://core-wg.github.io/)).

**Books:**

- Shelby, Hartke, Bormann (the RFC 7252 author trio). The canonical print companion is **Shelby & Bormann, *6LoWPAN: The Wireless Embedded Internet*, Wiley 2009** (predates RFC 7252 but explains the constrained-network mindset). [Note: I could not verify a separate dedicated "Constrained Application Protocol" book by these three authors despite the user's prompt — please [needs source] before citing one]. **Guinard & Trifa, *Building the Web of Things*, Manning 2016** — has a chapter on CoAP ([https://www.manning.com/books/building-the-web-of-things](https://www.manning.com/books/building-the-web-of-things)). **Olivier Hersent et al., *The Internet of Things: Key Applications and Protocols*, Wiley 2nd ed.** Intermediate. [Webofthings](https://webofthings.org/book/)

**Academic papers:**

- Bormann, Castellani, Shelby. *CoAP: An Application Protocol for Billions of Tiny Internet Nodes*. IEEE Internet Computing 16(2):62-67, March/April 2012. DOI 10.1109/MIC.2012.29 ([https://doi.org/10.1109/MIC.2012.29](https://doi.org/10.1109/MIC.2012.29)). [Harmanani](https://harmanani.github.io/classes/csc498r/Readings/CoAP2012.pdf)
- Kovatsch, Lanter, Shelby. *Californium: Scalable Cloud Services for the IoT through CoAP*. IoT 2014 ([https://ieeexplore.ieee.org/document/6970762](https://ieeexplore.ieee.org/document/6970762)).
- Tiloca et al. *Performance Evaluation of Group OSCORE for Secure Group Communication in the IoT*. ACM Transactions on IoT, 2022. DOI 10.1145/3523064 ([https://dl.acm.org/doi/10.1145/3523064](https://dl.acm.org/doi/10.1145/3523064)).
- Suwannapong & Khunboa. *Congestion Control in CoAP Observe Group Communication*. Sensors 19(15):3433, 2019. DOI 10.3390/s19153433 ([https://www.mdpi.com/1424-8220/19/15/3433](https://www.mdpi.com/1424-8220/19/15/3433)). [nih](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6696228/)[nih](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6696228/)
- *Enhancements and Challenges in CoAP — A Survey*. Sensors 2020 ([https://pmc.ncbi.nlm.nih.gov/articles/PMC7664934/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7664934/)).
- *EDHOC is a New Security Handshake Standard: An Overview of Security Analysis*. arXiv:2407.07444, July 2024 ([https://arxiv.org/abs/2407.07444](https://arxiv.org/abs/2407.07444)). 2024.
- Aveleira-Mata et al. *CoAP_UAD: CoAP under attack dataset*. Data in Brief, October 2025. DOI 10.1016/j.dib.2025.112210 ([https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/)). 2025. [nih](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12596991/)
- Hiesgen et al. *The Age of DDoScovery*. ACM IMC 2024. DOI 10.1145/3646547.3688451 ([https://arxiv.org/abs/2410.11708](https://arxiv.org/abs/2410.11708)). [arxiv](https://arxiv.org/pdf/2410.11708)
- Park et al. *Use of QUIC for CoAP transport in IoT networks*. ICT Express, 2023 ([https://www.sciencedirect.com/science/article/pii/S2542660523002287](https://www.sciencedirect.com/science/article/pii/S2542660523002287)).

**Engineering blogs and vendor explainers (2024–2026 currency):**

- Ericsson Research, *OSCORE: A look at the new IoT security protocol*, 2019 ([https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol](https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol)). Intermediate.
- NETSCOUT ASERT, *CoAP Attacks In The Wild*, 2019 ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)). The definitive incident write-up. Intermediate.
- Shadowserver, *Accessible CoAP Report*, June 2020 ([https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/](https://www.shadowserver.org/news/accessible-coap-report-scanning-for-exposed-constrained-application-protocol-services/)).
- A10 Networks, *2024 DDoS Weapons Report* ([https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf](https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf)). Industry data.
- Nordic Semiconductor Developer Academy, *Cellular IoT Fundamentals — Lesson 5 CoAP* ([https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-5-cellular-fundamentals/topic/lesson-5-coap-protocol/](https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-5-cellular-fundamentals/topic/lesson-5-coap-protocol/)). 2024-current. Intro.
- AVSystem Anjay docs, *OMA LwM2M — Brief description* ([https://avsystem.github.io/Anjay-doc/LwM2M.html](https://avsystem.github.io/Anjay-doc/LwM2M.html)). Intermediate.
- Eclipse Californium project pages ([https://eclipse.dev/californium/](https://eclipse.dev/californium/)). 2025-current.
- ARM/Pelion (now Izuma) community CoAP tutorials (legacy but useful) ([https://community.arm.com/cfs-file/__key/telligent-evolution-components-attachments/01-1996-00-00-00-00-53-31/ARM-CoAP-Tutorial-April-30-2014.pdf](https://community.arm.com/cfs-file/__key/telligent-evolution-components-attachments/01-1996-00-00-00-00-53-31/ARM-CoAP-Tutorial-April-30-2014.pdf)).
- coap.space — Bormann's curated landing page ([https://coap.space/](https://coap.space/)). Intro.

**Video / talks:**

- Zach Shelby, *Constrained Application Protocol (CoAP) Tutorial*, YouTube ([https://www.youtube.com/watch?v=4bSr5x5gKvA](https://www.youtube.com/watch?v=4bSr5x5gKvA)). Intro. [ResearchGate](https://www.researchgate.net/publication/326943054_Constrained_Application_Protocol_CoAP_for_theIoT)
- IETF CoRE WG meeting recordings (audio + Meetecho): IETF 121 minutes ([https://datatracker.ietf.org/meeting/121/materials/slides-121-core-chairs-slides-00](https://datatracker.ietf.org/meeting/121/materials/slides-121-core-chairs-slides-00)) and IETF 122 (Bangkok, March 2025, [https://datatracker.ietf.org/doc/minutes-122-core/](https://datatracker.ietf.org/doc/minutes-122-core/)). Advanced. [IETF](https://datatracker.ietf.org/doc/agenda-122-core/)
- ARM TechCon archived "ARM IoT Tutorial — CoAP: The Web of Things Protocol" (Shelby, 2014) ([https://community.arm.com/](https://community.arm.com/)...).

**Podcasts / audio** — there is no dedicated CoAP podcast; closest is *The IoT Podcast* (Stacey Higginbotham) episodes covering Matter/Thread, and IETF *IETF-side Meetings* recordings. [needs source for a specific episode focused on CoAP].

**Free university courses** — TU München has lecture material on CoAP (Trapickin, 2013, in German, archival). Recent dedicated coursework with public lecture URLs is sparse; CoAP usually appears as a 1–2 lecture module inside broader IoT courses (e.g., TU Berlin, Aalto, Universität Bremen TZI seminars). [needs source for a specific Stanford/MIT/Berkeley CoAP-focused module — none verified].

**Hands-on tools:**

- **`coap.me`** public test server ([https://coap.me/](https://coap.me/)).
- **Eclipse Californium sandbox** at `coap://californium.eclipseprojects.io` ([https://eclipse.dev/californium/](https://eclipse.dev/californium/)).
- **Eclipse Leshan sandbox** at `coap://leshan.eclipseprojects.io:5683` ([https://eclipse.dev/leshan/](https://eclipse.dev/leshan/)). [GitHub](https://github.com/eclipse-leshan/leshan)
- **Wireshark** built-in CoAP and OSCORE dissectors ([https://www.wireshark.org/docs/dfref/c/coap.html](https://www.wireshark.org/docs/dfref/c/coap.html)).
- **libcoap CLI** `coap-client`/`coap-server` ([https://libcoap.net/](https://libcoap.net/)).
- **aiocoap CLI** `aiocoap-client` ([https://aiocoap.readthedocs.io/](https://aiocoap.readthedocs.io/)).
- **node-coap** for quick JS scripting ([https://github.com/coapjs/node-coap](https://github.com/coapjs/node-coap)).
- **Copper4Cr** — the spiritual heir to Cu/Firefox; works only via Chrome Apps which Google deprecated ([https://github.com/mkovatsc/Copper4Cr](https://github.com/mkovatsc/Copper4Cr)). Effectively legacy.
- **Cooja** simulator inside Contiki-NG for full IoT simulation ([https://github.com/contiki-ng/contiki-ng](https://github.com/contiki-ng/contiki-ng)).

## 10. Where things are heading (2025–2026 frontier)

- **OSCORE/EDHOC takeover.** The decisive shift in the last 24 months is from "DTLS or bust" to "OSCORE+EDHOC for new constrained-IoT designs." With RFC 9528 (EDHOC) published March 2024 and RFC 9594 (group key provisioning) September 2024, the application-layer security stack is now feature-complete for both unicast and multicast. Expect new LwM2M 2.0 deployments to default to OSCORE/EDHOC where DTLS overhead matters ([https://www.rfc-editor.org/rfc/rfc9528.html](https://www.rfc-editor.org/rfc/rfc9528.html); [https://www.ietf.org/rfc/rfc9594.html](https://www.ietf.org/rfc/rfc9594.html)).
- **Group OSCORE near completion.** `draft-ietf-core-oscore-groupcomm-28` (December 2025) is in IESG-territory and brings authenticated multicast — important for lighting/HVAC and grid use cases ([https://datatracker.ietf.org/doc/draft-ietf-core-oscore-groupcomm/](https://datatracker.ietf.org/doc/draft-ietf-core-oscore-groupcomm/)).
- **CoAP pub/sub broker.** `draft-ietf-core-coap-pubsub-19` (March 2026) defines a topic-oriented broker — this is the long-promised IETF answer to MQTT and is finally close to RFC publication ([https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pubsub/)).
- **Errata cleanup.** `draft-ietf-core-corr-clar` (-04, Dec 2025) will, once published, formally update RFCs 6690/7252/7641/7959/8132/8323 — fixing accumulated errata and ambiguity ([https://datatracker.ietf.org/doc/draft-ietf-core-corr-clar/](https://datatracker.ietf.org/doc/draft-ietf-core-corr-clar/)).
- **DNS-over-CoAP.** `draft-ietf-core-dns-over-coap-20` lets constrained devices do encrypted DNS without DoH/DoT's heavy TLS — about to ship ([https://datatracker.ietf.org/doc/html/draft-ietf-core-dns-over-coap-20](https://datatracker.ietf.org/doc/html/draft-ietf-core-dns-over-coap-20)).
- **CoAP-PM (performance measurement).** New CoAP option for end-to-end and hop-by-hop telemetry, motivated by the encrypted-protocol opacity problem QUIC also faces (`draft-ietf-core-coap-pm-05`, Oct 2025) ([https://datatracker.ietf.org/doc/draft-ietf-core-coap-pm/](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pm/)). [IETF](https://datatracker.ietf.org/doc/draft-ietf-core-coap-pm/)
- **CoAP-over-QUIC: not in IETF.** No CoRE WG document; only academic experiments. The WG instead is investing in CoAP-over-DTLS-1.3 ALPN identification (`draft-ietf-core-coap-dtls-alpn`) and CoAP-over-bundle-protocol for delay-tolerant networks (`draft-gomez-core-coap-bp`) ([https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/](https://datatracker.ietf.org/doc/html/draft-ietf-core-coap-dtls-alpn/)). [IETF](https://datatracker.ietf.org/doc/minutes-122-dtn-202503170600/)
- **Matter / Thread.** Matter 1.4 (Sept 2024) continues *not* using CoAP for application messages — it uses MRP/UDP. CoAP remains in the Thread management stack only. Don't confuse "Matter is the smart-home app protocol" with "CoAP is everywhere in smart homes" — only Thread commissioning/management is CoAP-flavored ([https://i.blackhat.com/EU-24/Presentations/EU-24-Genge-BreakingMatterVulnerabiltiesInTheMatterProtocol-wp.pdf](https://i.blackhat.com/EU-24/Presentations/EU-24-Genge-BreakingMatterVulnerabiltiesInTheMatterProtocol-wp.pdf)). [Cardinal Peak](https://www.cardinalpeak.com/blog/matter-specification-how-the-matter-smart-home-standard-works)
- **LwM2M 2.0.** OMA SpecWorks is actively developing 2.0 as of late 2025, focused on smart-city and large-fleet deployment ([https://en.wikipedia.org/wiki/OMA_LWM2M](https://en.wikipedia.org/wiki/OMA_LWM2M)). [Grokipedia](https://grokipedia.com/page/OMA_LWM2M)
- **Deprecated / fading**: Copper Cu (Firefox), Copper4Cr (Chrome Apps deprecation), CoAP NoSec on the public Internet (CVE pressure + Shadowserver naming-and-shaming), CoAP over plain TCP without TLS (RFC 8323 allowed but actively discouraged in deployments).
- **Hot research.** Symbolic+computational security analysis of EDHOC (arXiv 2407.07444, 2024); CoAP-specific intrusion-detection datasets (CoAP_UAD, 2025); QUIC-as-CoAP-transport empirical work (Park 2023); reflection-attack measurement (IMC 2024).

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook for non-experts:**

> *"Every minute, billions of tiny computers — sensors in your thermostat, your car, the streetlight you walked under — talk to the cloud. They can't run the same software your laptop does. They have a few kilobytes of memory and may live on a battery for ten years. So in 2014, a small group of engineers at the University of Bremen, at a Finnish startup called Sensinode, and at ARM published RFC 7252: the Constrained Application Protocol. CoAP is the Internet for things that can't afford the Internet. It speaks the language of the web — GET, POST, URLs — but it does it in four bytes instead of four hundred. Twelve years later, almost every cellular IoT device on Earth uses CoAP under the hood, and every smart-home Thread mesh runs CoAP for its management plane. And in 2024, a brand-new key exchange called EDHOC reached standard status — letting a battery-powered sensor cryptographically introduce itself to the cloud in just 100 bytes. That's the difference between a sensor that lasts two years and one that lasts ten."*

**Striking statistic with source:**

> 388 344 CoAP-speaking endpoints visible on the public Internet in January 2019, **81 % located in China**, with an average DDoS amplification factor of **34×** — small per device, but enough that the FBI issued a private-industry warning. Source: NETSCOUT ASERT, *CoAP Attacks In The Wild* ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)). [NETSCOUT](https://www.netscout.com/blog/asert/coap-attacks-wild)

**"Pause and think" moment:**

> *"Pause for a second. CoAP's fixed header is **four bytes**. The TCP header on the packet carrying this article is **twenty**. The TLS record framing alone is **five**. A complete CoAP request fits inside the space TCP uses just to say 'hello.' That isn't compression. That's a different philosophy of what 'a request' should cost."* Source: RFC 7252 §3 ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)).

**Failure-story arc:**

> *Setup:* In late 2018, an obscure protocol nobody outside IETF circles thought about — CoAP — had quietly accumulated nearly 400 000 publicly reachable endpoints, mostly Chinese mobile phones running the QLC Chain peer-to-peer crypto stack. The protocol, designed for tiny IoT devices, had a 34× amplification factor when probed at `/.well-known/core`.
> *Mistake:* Vendors had shipped CoAP services bound to all interfaces, with no DTLS, no rate limiting, no IP filtering. The protocol assumed it would live behind a NAT or on a constrained network — and shipped that assumption as a default.
> *Consequence:* Starting January 2019, attackers turned those endpoints into a reflection cannon. NETSCOUT logged dozens of DDoS attacks per week using CoAP, averaging 90 seconds at 100 packets per second per attacker — small individually, but multiplied across tens of thousands of reflectors, capable of saturating mid-tier targets. The FBI cited CoAP by name in a 2019 industry alert.
> *Resolution:* Reflectors slowly aged out as Chinese carriers blocked outbound 5683/UDP and as QLC moved to TLS. The IETF doubled down on **OSCORE** (RFC 8613, 2019) for application-layer security and on **EDHOC** (RFC 9528, 2024) for cheap key establishment. By 2024, A10's threat report puts CoAP at ~4 % of global amplification weapons — still abused, but down from peak. The lesson the CoRE WG took to heart: NoSec is fine for testing, lethal in deployment. Sources: NETSCOUT ([https://www.netscout.com/blog/asert/coap-attacks-wild](https://www.netscout.com/blog/asert/coap-attacks-wild)); FBI alert ([https://duo.com/decipher/fbi-warns-of-ddos-attacks-abusing-network-protocols](https://duo.com/decipher/fbi-warns-of-ddos-attacks-abusing-network-protocols)); A10 ([https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf](https://www.a10networks.com/wp-content/uploads/A10-EB-2024-DDoS-Weapons-Report.pdf)).

## 12. Caveats

- "Performance numbers" in production CoAP deployments are mostly vendor figures (Eclipse Foundation: "millions of devices on a single instance"; Californium 4.0 emulated-client headroom of 30 000–40 000 per process). Independent academic measurements exist for protocol overhead and small-scale testbeds (Suwannapong/Khunboa 2019; Tiloca et al. 2022) but not for hyperscale operational fleets — those numbers are not public. Any specific "X devices, Y latency" claim should be sourced to the vendor blog it came from.
- The user prompt referenced "3 300×" amplification for CoAP. That figure is **not** for CoAP — it's the memcached UDP record (Feb 2018). CoAP's measured factor is 34× per NETSCOUT. The report uses the verified number.
- The user prompt referenced a "Shelby/Hartke/Bormann *The Constrained Application Protocol*" book. I could not verify a single dedicated book by exactly those three authors. Shelby & Bormann's *6LoWPAN: The Wireless Embedded Internet* (Wiley 2009) is verifiable; an explicit CoAP-titled book by the trio is [needs source].
- A specific named CoAP-focused podcast episode is [needs source].
- Specific Stanford/MIT OCW/CMU CoAP-as-its-own-module course numbers are [needs source]; CoAP appears as a sub-topic in IoT/networking courses but I could not verify a dedicated course number/lecture URL within the research budget.
- Copper (Cu) status: confirmed deprecated since Firefox 57 (Nov 2017). Copper4Cr exists but its deployment path through Chrome Apps is itself deprecated by Google. As of May 2026 there is no maintained graphical CoAP browser plugin equivalent to the original Copper experience; the practical replacement is CLI tools (libcoap, aiocoap, coap-cli) or sandbox web UIs (Leshan).
- CVE numbers ending in 2026 (CVE-2026-29013) are real CVE IDs assigned in 2026 — the format is correct, though the year may look unfamiliar. The vulnerability was disclosed 17 April 2026 ([https://cve.threatint.eu/CVE/CVE-2026-29013](https://cve.threatint.eu/CVE/CVE-2026-29013)).
- IETF drafts cited as `-NN` are cited at the latest revision available at time of writing; readers should check Datatracker for the current revision.